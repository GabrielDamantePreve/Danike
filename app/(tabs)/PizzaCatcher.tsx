import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Platform,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../../theme';
// AsyncStorage not required here (was causing "Cannot find module" error) — removed import.

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASKET_WIDTH = 90;
const BASKET_HEIGHT = 70;
const ITEM_SIZE = 40;
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 90 : 60; // Altura da tab bar
const GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.65;
const HIGH_SCORE_KEY = '@PizzaCatcher:highScore';
const BASE_SPAWN_INTERVAL = 1000;
const MIN_SPAWN_INTERVAL = 400;

// Zona de colisão otimizada e mais generosa
const COLLISION_ZONE_START = GAME_AREA_HEIGHT - BASKET_HEIGHT - ITEM_SIZE - 10;
const COLLISION_ZONE_END = GAME_AREA_HEIGHT - BASKET_HEIGHT + 30;
const COLLISION_TOLERANCE = ITEM_SIZE * 0.8; // Aumentado para facilitar

// Dificuldade progressiva
const INITIAL_SPAWN_RATE = 1200; // ms entre spawns
const MIN_SPAWN_RATE = 600;
const SPAWN_RATE_DECREASE = 50; // Diminui a cada 10 pontos

type FallingItem = {
  id: string;
  x: number;
  y: Animated.Value;
  currentY: number; // Posição Y atual calculada
  emoji: string;
  isGood: boolean;
  speed: number;
  startTime: number; // Timestamp de quando começou a cair
};

const GOOD_ITEMS = [
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🧀', name: 'Queijo' },
  { emoji: '🍅', name: 'Tomate' },
  { emoji: '🌿', name: 'Manjericão' },
  { emoji: '🫒', name: 'Azeitona' },
];

const BAD_ITEMS = [
  { emoji: '🔥', name: 'Fogo' },
  { emoji: '🪨', name: 'Pedra' },
  { emoji: '🧊', name: 'Gelo' },
];

export default function PizzaCatcher() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [basketPosition, setBasketPosition] = useState(SCREEN_WIDTH / 2 - BASKET_WIDTH / 2);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const [spawnRate, setSpawnRate] = useState(INITIAL_SPAWN_RATE);
  const [feedbackEmoji, setFeedbackEmoji] = useState<string | null>(null);
  
  // Refs para evitar closures stale
  const basketPositionRef = useRef(basketPosition);
  const comboRef = useRef(combo);
  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  
  const gameLoopRef = useRef<number | null>(null);
  const itemSpawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const lastDifficultyScoreRef = useRef(0);

  // Sincronizar refs com estados
  useEffect(() => {
    basketPositionRef.current = basketPosition;
  }, [basketPosition]);

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  // Aumentar dificuldade progressivamente
  useEffect(() => {
    if (gameState === 'playing' && score > 0 && score % 20 === 0 && score !== lastDifficultyScoreRef.current) {
      lastDifficultyScoreRef.current = score;
      setDifficulty(prev => prev + 1);
      
      // Diminuir tempo entre spawns
      setSpawnRate(prev => Math.max(MIN_SPAWN_RATE, prev - SPAWN_RATE_DECREASE));
      
      // Feedback visual de dificuldade aumentada
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 2000);
    }
  }, [score, gameState]);

  // PanResponder para arrasto da cesta
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => gameState === 'playing',
      onMoveShouldSetPanResponder: () => gameState === 'playing',
      onPanResponderGrant: () => {
        // Pode adicionar feedback visual aqui
      },
      onPanResponderMove: (_, gestureState) => {
        // Calcular nova posição baseada no movimento do dedo
        const newPosition = basketPositionRef.current + gestureState.dx;
        const clampedPosition = Math.max(0, Math.min(SCREEN_WIDTH - BASKET_WIDTH, newPosition));
        setBasketPosition(clampedPosition);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Atualizar posição final
        const newPosition = basketPositionRef.current + gestureState.dx;
        const clampedPosition = Math.max(0, Math.min(SCREEN_WIDTH - BASKET_WIDTH, newPosition));
        setBasketPosition(clampedPosition);
      },
    })
  ).current;

  // Função para verificar colisão otimizada
  const checkItemCollision = useCallback((item: FallingItem, currentBasketPos: number): 'caught' | 'missed' | 'falling' => {
    const itemY = item.currentY;

    // Item ainda está caindo acima da zona de colisão
    if (itemY < COLLISION_ZONE_START) {
      return 'falling';
    }

    // Item passou da zona de colisão
    if (itemY > GAME_AREA_HEIGHT) {
      return 'missed';
    }

    // Item está na zona de colisão - verificar colisão horizontal
    if (itemY >= COLLISION_ZONE_START && itemY <= COLLISION_ZONE_END) {
      const itemCenterX = item.x + ITEM_SIZE / 2;
      const basketLeft = currentBasketPos;
      const basketRight = currentBasketPos + BASKET_WIDTH;

      // Colisão detectada!
      if (itemCenterX >= basketLeft - COLLISION_TOLERANCE && 
          itemCenterX <= basketRight + COLLISION_TOLERANCE) {
        return 'caught';
      }
    }

    return 'falling';
  }, []);

  // Atualizar posição dos itens baseado no tempo decorrido
  const updateItemPositions = useCallback((items: FallingItem[], currentTime: number) => {
    return items.map(item => {
      const elapsed = currentTime - item.startTime;
      const progress = elapsed / item.speed;
      const newY = -ITEM_SIZE + (progress * (GAME_AREA_HEIGHT + ITEM_SIZE));
      
      return {
        ...item,
        currentY: newY
      };
    });
  }, []);

  // Iniciar jogo
  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setDifficulty(1);
    setSpawnRate(INITIAL_SPAWN_RATE);
    setFallingItems([]);
    setBasketPosition(SCREEN_WIDTH / 2 - BASKET_WIDTH / 2);
    basketPositionRef.current = SCREEN_WIDTH / 2 - BASKET_WIDTH / 2;
    
    setGameState('playing');
    lastUpdateTimeRef.current = Date.now();
    lastDifficultyScoreRef.current = 0;
  }, []);

  // Pausar jogo
  const pauseGame = useCallback(() => {
    setGameState('paused');
  }, []);

  // Retomar jogo
  const resumeGame = useCallback(() => {
    setGameState('playing');
    lastUpdateTimeRef.current = Date.now();
  }, []);

  // Criar novo item caindo com velocidade baseada na dificuldade
  const spawnItem = useCallback(() => {
    const isGood = Math.random() > 0.25; // 75% chance de item bom
    const items = isGood ? GOOD_ITEMS : BAD_ITEMS;
    const item = items[Math.floor(Math.random() * items.length)];
    
    const currentTime = Date.now();
    const animatedValue = new Animated.Value(-ITEM_SIZE);
    
    // Velocidade aumenta com a dificuldade
    const baseSpeed = 2200;
    const speedReduction = (difficulty - 1) * 150;
    const speed = Math.max(1200, baseSpeed - speedReduction + Math.random() * 400);
    
    const newItem: FallingItem = {
      id: currentTime.toString() + Math.random(),
      x: Math.random() * (SCREEN_WIDTH - ITEM_SIZE),
      y: animatedValue,
      currentY: -ITEM_SIZE,
      emoji: item.emoji,
      isGood,
      speed,
      startTime: currentTime,
    };

    setFallingItems((prev) => [...prev, newItem]);

    // Animar queda
    Animated.timing(animatedValue, {
      toValue: GAME_AREA_HEIGHT,
      duration: speed,
      useNativeDriver: true,
    }).start();
  }, [difficulty]);

  // Sistema de colisão otimizado - processa todas as colisões de uma vez
  const processCollisions = useCallback(() => {
    const currentTime = Date.now();
    const currentBasketPos = basketPositionRef.current;

    setFallingItems((items) => {
      // Atualizar posições de todos os itens
      const updatedItems = updateItemPositions(items, currentTime);
      
      const remainingItems: FallingItem[] = [];
      let scoreChange = 0;
      let livesChange = 0;
      let comboIncrease = 0;
      let comboReset = false;

      updatedItems.forEach((item) => {
        const collisionStatus = checkItemCollision(item, currentBasketPos);

        if (collisionStatus === 'caught') {
          // Item foi pego!
          if (item.isGood) {
            scoreChange += 10;
            comboIncrease++;
            // Feedback positivo
            setFeedbackEmoji('✨');
            setTimeout(() => setFeedbackEmoji(null), 500);
          } else {
            livesChange--;
            comboReset = true;
            // Feedback negativo
            setFeedbackEmoji('💥');
            setTimeout(() => setFeedbackEmoji(null), 500);
          }
          // Item não é adicionado aos remainingItems (foi coletado)
        } else if (collisionStatus === 'missed') {
          // Item passou do limite inferior
          if (item.isGood) {
            livesChange--; // Perde vida se deixar item bom cair
            setFeedbackEmoji('😢');
            setTimeout(() => setFeedbackEmoji(null), 500);
          }
          // Item não é adicionado aos remainingItems (caiu)
        } else {
          // Item ainda está caindo
          remainingItems.push(item);
        }
      });

      // Aplicar mudanças de score
      if (scoreChange > 0) {
        setScore((prev) => {
          const newScore = prev + scoreChange;
          setHighScore((hs) => Math.max(hs, newScore));
          return newScore;
        });
      }

      // Aplicar mudanças de combo
      if (comboReset) {
        setCombo(0);
        setShowCombo(false);
        if (comboTimeoutRef.current) {
          clearTimeout(comboTimeoutRef.current);
          comboTimeoutRef.current = null;
        }
      } else if (comboIncrease > 0) {
        setCombo((prev) => {
          const newCombo = prev + comboIncrease;
          if (newCombo >= 3) {
            setShowCombo(true);
            // Bônus de combo
            setScore((s) => s + newCombo * 5);
          }
          return newCombo;
        });

        // Reset combo timeout
        if (comboTimeoutRef.current) {
          clearTimeout(comboTimeoutRef.current);
        }
        comboTimeoutRef.current = setTimeout(() => {
          setCombo(0);
          setShowCombo(false);
        }, 3000);
      }

      // Aplicar mudanças de vidas
      if (livesChange < 0) {
        setLives((prev) => {
          const newLives = Math.max(0, prev + livesChange);
          if (newLives <= 0) {
            setGameState('gameOver');
          }
          return newLives;
        });
      }

      return remainingItems;
    });
  }, [checkItemCollision, updateItemPositions]);

  // Game Loop otimizado com requestAnimationFrame e spawn rate dinâmico
  useEffect(() => {
    if (gameState === 'playing') {
      // Spawnar novos itens com taxa dinâmica
      itemSpawnRef.current = setInterval(() => {
        spawnItem();
      }, spawnRate);

      // Loop de verificação de colisões usando requestAnimationFrame
      const gameLoop = () => {
        const currentTime = Date.now();
        const deltaTime = currentTime - lastUpdateTimeRef.current;

        // Executar verificação de colisões a cada ~16ms (60fps)
        if (deltaTime >= 16) {
          processCollisions();
          lastUpdateTimeRef.current = currentTime;
        }

        // Continuar o loop
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      };

      // Iniciar o loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);

      return () => {
        if (itemSpawnRef.current) {
          clearInterval(itemSpawnRef.current);
          itemSpawnRef.current = null;
        }
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
          gameLoopRef.current = null;
        }
      };
    } else {
      if (itemSpawnRef.current) {
        clearInterval(itemSpawnRef.current);
        itemSpawnRef.current = null;
      }
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }
  }, [gameState, spawnItem, processCollisions, spawnRate]);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
      if (itemSpawnRef.current) {
        clearInterval(itemSpawnRef.current);
      }
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  // Renderizar tela de menu
  if (gameState === 'menu') {
    return (
      <LinearGradient colors={gradients.accent as any} style={styles.container}>
        <View style={styles.menuContainer}>
          <Text style={styles.gameTitle}>🍕 Pizza Catcher 🍕</Text>
          <Text style={styles.menuSubtitle}>
            Pegue os ingredientes bons e evite os ruins!
          </Text>

          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>Como Jogar:</Text>
            <Text style={styles.instructionText}>👆 Arraste a cesta para mover</Text>
            <Text style={styles.instructionText}>🍕 Pegue ingredientes bons (+10 pts)</Text>
            <Text style={styles.instructionText}>🔥 Evite obstáculos (-1 vida)</Text>
            <Text style={styles.instructionText}>💫 Faça combos para bônus!</Text>
            <Text style={styles.instructionText}>⚡ Dificuldade aumenta com score</Text>
          </View>

          {highScore > 0 && (
            <View style={styles.highScoreBox}>
              <Ionicons name="trophy" size={24} color={colors.accent} />
              <Text style={styles.highScoreText}>Recorde: {highScore}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.startButtonPressed,
            ]}
            onPress={startGame}
          >
            <LinearGradient
              colors={gradients.primary as any}
              style={styles.startButtonGradient}
            >
              <Ionicons name="play" size={24} color={colors.textOnPrimary} />
              <Text style={styles.startButtonText}>Começar</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // Renderizar tela de game over
  if (gameState === 'gameOver') {
    return (
      <LinearGradient colors={gradients.accent as any} style={styles.container}>
        <View style={styles.menuContainer}>
          <Text style={styles.gameOverTitle}>Game Over!</Text>
          <Text style={styles.gameOverEmoji}>🍕💔</Text>
          
          <View style={styles.scoreBox}>
            <Text style={styles.finalScoreLabel}>Pontuação Final</Text>
            <Text style={styles.finalScoreValue}>{score}</Text>
            {score >= highScore && score > 0 && (
              <Text style={styles.newRecordText}>🎉 Novo Recorde! 🎉</Text>
            )}
          </View>

          {highScore > 0 && (
            <View style={styles.highScoreBox}>
              <Ionicons name="trophy" size={24} color={colors.accent} />
              <Text style={styles.highScoreText}>Recorde: {highScore}</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setGameState('menu')}
            >
              <Ionicons name="home" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Menu</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.playAgainButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={startGame}
            >
              <LinearGradient
                colors={gradients.primary as any}
                style={styles.playAgainGradient}
              >
                <Ionicons name="refresh" size={20} color={colors.textOnPrimary} />
                <Text style={styles.playAgainText}>Jogar Novamente</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Renderizar jogo
  return (
    <LinearGradient colors={gradients.accent as any} style={styles.container}>
      {/* Header com score e vidas */}
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Ionicons name="star" size={20} color={colors.accent} />
          <Text style={styles.scoreText}>{score}</Text>
          {difficulty > 1 && (
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>Nv.{difficulty}</Text>
            </View>
          )}
        </View>

        {showCombo && combo >= 3 && (
          <View style={styles.comboContainer}>
            <Text style={styles.comboText}>🔥 COMBO x{combo}!</Text>
          </View>
        )}
        
        {difficulty > 1 && (
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>Nível {difficulty}</Text>
          </View>
        )}

        <View style={styles.livesContainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < lives ? 'heart' : 'heart-outline'}
              size={20}
              color={i < lives ? '#ff4444' : 'rgba(255,255,255,0.3)'}
              style={styles.heartIcon}
            />
          ))}
        </View>

        <Pressable
          style={styles.pauseButton}
          onPress={pauseGame}
        >
          <Ionicons name="pause" size={24} color={colors.textOnPrimary} />
        </Pressable>
      </View>

      {/* Área de jogo com controle por arrasto */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* Itens caindo */}
        {fallingItems.map((item) => (
          <Animated.View
            key={item.id}
            style={[
              styles.fallingItem,
              {
                left: item.x,
                transform: [{ translateY: item.y }],
              },
            ]}
          >
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
          </Animated.View>
        ))}

        {/* Cesta do jogador - COM CONTROLE POR TOQUE */}
        <View
          {...panResponder.panHandlers}
          style={[
            styles.basket,
            { left: basketPosition },
          ]}
        >
          <Text style={styles.basketEmoji}>🧺</Text>
          {feedbackEmoji && (
            <Text style={styles.feedbackEmoji}>{feedbackEmoji}</Text>
          )}
        </View>
        
        {/* Instrução de arrasto */}
        {fallingItems.length < 3 && (
          <View style={styles.dragHint}>
            <Text style={styles.dragHintText}>👆 Arraste para mover</Text>
          </View>
        )}
      </View>

      {/* Overlay de pausa */}
      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseMenu}>
            <Text style={styles.pauseTitle}>Pausado</Text>
            
            <Pressable
              style={({ pressed }) => [
                styles.resumeButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={resumeGame}
            >
              <LinearGradient
                colors={gradients.primary as any}
                style={styles.resumeButtonGradient}
              >
                <Ionicons name="play" size={24} color={colors.textOnPrimary} />
                <Text style={styles.resumeButtonText}>Continuar</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.menuButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setGameState('menu')}
            >
              <Ionicons name="home" size={20} color={colors.primary} />
              <Text style={styles.menuButtonText}>Menu Principal</Text>
            </Pressable>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  menuSubtitle: {
    fontSize: 18,
    color: colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  instructionsBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    maxWidth: 350,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: colors.textOnPrimary,
    marginBottom: 8,
    opacity: 0.95,
  },
  highScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  highScoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
    marginLeft: 8,
  },
  startButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    gap: 10,
  },
  startButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  comboContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  comboText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  difficultyBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  livesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  heartIcon: {
    marginHorizontal: 2,
  },
  pauseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    marginHorizontal: 10,
    marginBottom: TAB_BAR_HEIGHT + 10, // Espaço para tab bar
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  fallingItem: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 32,
  },
  basket: {
    position: 'absolute',
    bottom: 30, // Aumentado para ficar mais longe da borda
    width: BASKET_WIDTH,
    height: BASKET_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  basketEmoji: {
    fontSize: 60,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  feedbackEmoji: {
    position: 'absolute',
    top: -30,
    fontSize: 32,
    fontWeight: 'bold',
  },
  dragHint: {
    position: 'absolute',
    bottom: 120, // Ajustado para ficar acima da cesta
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  dragHintText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseMenu: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    minWidth: 280,
  },
  pauseTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 30,
  },
  resumeButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 12,
    width: '100%',
  },
  resumeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  resumeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 8,
    width: '100%',
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  gameOverTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  gameOverEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  scoreBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 200,
  },
  finalScoreLabel: {
    fontSize: 16,
    color: colors.textOnPrimary,
    opacity: 0.9,
    marginBottom: 8,
  },
  finalScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  newRecordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 350,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 14,
    borderRadius: 20,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  playAgainButton: {
    flex: 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  playAgainGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  playAgainText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
});
