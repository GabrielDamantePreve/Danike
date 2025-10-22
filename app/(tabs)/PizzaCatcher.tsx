import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Platform,
  PanResponder,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../../theme';
// AsyncStorage not required here (was causing "Cannot find module" error) — removed import.

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASKET_WIDTH = 80;
const BASKET_HEIGHT = 60;
const ITEM_SIZE = 40;
const GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.65;
const HIGH_SCORE_KEY = '@PizzaCatcher:highScore';
const BASE_SPAWN_INTERVAL = 1000;
const MIN_SPAWN_INTERVAL = 400;

type FallingItem = {
  id: string;
  x: number;
  y: Animated.Value;
  emoji: string;
  isGood: boolean;
  speed: number;
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
  const [isLoading, setIsLoading] = useState(true);
  
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemSpawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const basketPositionRef = useRef(SCREEN_WIDTH / 2 - BASKET_WIDTH / 2);
  const animationsRef = useRef<Map<string, Animated.CompositeAnimation>>(new Map());

  // Carregar highScore salvo
  useEffect(() => {
    loadHighScore();
  }, []);

  const loadHighScore = async () => {
    try {
      // const savedScore = await AsyncStorage.getItem(HIGH_SCORE_KEY);
      // if (savedScore !== null) {
      //   setHighScore(parseInt(savedScore, 10));
      // }
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar highScore:', error);
      setIsLoading(false);
    }
  };

  const saveHighScore = async (newHighScore: number) => {
    try {
      // await AsyncStorage.setItem(HIGH_SCORE_KEY, newHighScore.toString());
      setHighScore(newHighScore);
    } catch (error) {
      console.error('Erro ao salvar highScore:', error);
    }
  };

  // Iniciar jogo
  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setDifficulty(1);
    setFallingItems([]);
    setBasketPosition(SCREEN_WIDTH / 2 - BASKET_WIDTH / 2);
    basketPositionRef.current = SCREEN_WIDTH / 2 - BASKET_WIDTH / 2;
    
    // Limpar animações anteriores
    animationsRef.current.forEach(anim => anim.stop());
    animationsRef.current.clear();
    
    setGameState('playing');
  }, []);

  // Pausar jogo
  const pauseGame = useCallback(() => {
    setGameState('paused');
  }, []);

  // Retomar jogo
  const resumeGame = useCallback(() => {
    setGameState('playing');
  }, []);

  // Mover cesta para esquerda
  const moveLeft = useCallback(() => {
    setBasketPosition((prev) => {
      const newPos = Math.max(0, prev - 30);
      basketPositionRef.current = newPos;
      return newPos;
    });
  }, []);

  // Mover cesta para direita
  const moveRight = useCallback(() => {
    setBasketPosition((prev) => {
      const newPos = Math.min(SCREEN_WIDTH - BASKET_WIDTH, prev + 30);
      basketPositionRef.current = newPos;
      return newPos;
    });
  }, []);

  // Criar novo item caindo
  const spawnItem = useCallback(() => {
    const isGood = Math.random() > 0.3; // 70% chance de item bom
    const items = isGood ? GOOD_ITEMS : BAD_ITEMS;
    const item = items[Math.floor(Math.random() * items.length)];
    
    // Velocidade aumenta com a dificuldade
    const baseSpeed = 2000;
    const speedReduction = (difficulty - 1) * 150;
    const speed = Math.max(800, baseSpeed - speedReduction + Math.random() * 500);
    
    const newItem: FallingItem = {
      id: Date.now().toString() + Math.random(),
      x: Math.random() * (SCREEN_WIDTH - ITEM_SIZE),
      y: new Animated.Value(-ITEM_SIZE),
      emoji: item.emoji,
      isGood,
      speed,
    };

    setFallingItems((prev) => [...prev, newItem]);

    // Animar queda e guardar referência
    const animation = Animated.timing(newItem.y, {
      toValue: GAME_AREA_HEIGHT,
      duration: speed,
      useNativeDriver: true,
    });
    
    animationsRef.current.set(newItem.id, animation);
    animation.start(({ finished }) => {
      if (finished) {
        animationsRef.current.delete(newItem.id);
      }
    });
  }, [difficulty]);

  // Verificar colisões (otimizado com useCallback e ref)
  const checkCollisions = useCallback(() => {
    setFallingItems((items) => {
      const remainingItems: FallingItem[] = [];
      let scoreChange = 0;
      let livesChange = 0;
      let comboChange = 0;
      let itemsCaught = false;
      let itemsMissed = false;

      const currentBasketPos = basketPositionRef.current;

      items.forEach((item) => {
        // @ts-ignore - Accessing private property for collision detection
        const itemY = item.y.__getValue();

        // Verifica se item está na altura da cesta
        if (itemY >= GAME_AREA_HEIGHT - BASKET_HEIGHT - ITEM_SIZE && 
            itemY <= GAME_AREA_HEIGHT - BASKET_HEIGHT + 20) {
          
          // Verifica colisão horizontal (otimizada)
          const itemCenterX = item.x + ITEM_SIZE / 2;
          const basketLeft = currentBasketPos;
          const basketRight = currentBasketPos + BASKET_WIDTH;
          
          if (itemCenterX >= basketLeft && itemCenterX <= basketRight) {
            // Parar animação
            const animation = animationsRef.current.get(item.id);
            if (animation) {
              animation.stop();
              animationsRef.current.delete(item.id);
            }
            
            if (item.isGood) {
              scoreChange += 10;
              comboChange++;
              itemsCaught = true;
            } else {
              livesChange--;
              comboChange = -999; // Reseta combo
              Vibration.vibrate(100); // Feedback tátil
            }
            return; // Item coletado, não adiciona aos remainingItems
          }
        }

        // Verifica se item passou do limite inferior
        if (itemY >= GAME_AREA_HEIGHT) {
          // Limpar animação
          animationsRef.current.delete(item.id);
          
          if (item.isGood) {
            livesChange--; // Perde vida se deixar item bom cair
            itemsMissed = true;
            Vibration.vibrate(50);
          }
          return; // Item caiu, não adiciona aos remainingItems
        }

        remainingItems.push(item);
      });

      // Atualiza score
      if (scoreChange > 0) {
        setScore((prev) => {
          const newScore = prev + scoreChange;
          if (newScore > highScore) {
            saveHighScore(newScore);
          }
          
          // Aumenta dificuldade a cada 100 pontos
          const newDifficulty = Math.floor(newScore / 100) + 1;
          if (newDifficulty !== difficulty) {
            setDifficulty(newDifficulty);
          }
          
          return newScore;
        });
        
        // Vibração de sucesso
        if (itemsCaught) {
          Vibration.vibrate(20);
        }
      }

      // Atualiza combo
      if (comboChange === -999) {
        setCombo(0);
        setShowCombo(false);
      } else if (comboChange > 0) {
        setCombo((prev) => {
          const newCombo = prev + comboChange;
          if (newCombo >= 3) {
            setShowCombo(true);
            setScore((s) => s + newCombo * 5); // Bônus de combo
            Vibration.vibrate([0, 30, 50, 30]); // Padrão especial para combo
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

      // Atualiza vidas
      if (livesChange < 0) {
        setLives((prev) => {
          const newLives = prev + livesChange;
          if (newLives <= 0) {
            setGameState('gameOver');
            return 0;
          }
          return newLives;
        });
      }

      return remainingItems;
    });
  }, [difficulty, highScore, saveHighScore]);

  // Game Loop (OTIMIZADO - sem basketPosition nas dependências)
  useEffect(() => {
    if (gameState === 'playing') {
      // Intervalo de spawn diminui com a dificuldade
      const spawnInterval = Math.max(
        MIN_SPAWN_INTERVAL,
        BASE_SPAWN_INTERVAL - (difficulty - 1) * 80
      );

      // Spawnar novos itens
      itemSpawnRef.current = setInterval(() => {
        spawnItem();
      }, spawnInterval);

      // Loop de verificação de colisões (60 FPS)
      gameLoopRef.current = setInterval(() => {
        checkCollisions();
      }, 16);

      return () => {
        if (itemSpawnRef.current) clearInterval(itemSpawnRef.current);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    } else {
      if (itemSpawnRef.current) clearInterval(itemSpawnRef.current);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
  }, [gameState, difficulty, spawnItem, checkCollisions]);

  // PanResponder para arrastar a cesta (controle por toque)
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Início do toque
    },
    onPanResponderMove: (_, gestureState) => {
      if (gameState === 'playing') {
        const newPos = Math.max(
          0,
          Math.min(
            SCREEN_WIDTH - BASKET_WIDTH,
            basketPositionRef.current + gestureState.dx
          )
        );
        setBasketPosition(newPos);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      // Atualiza a posição final
      basketPositionRef.current = basketPosition;
    },
  }), [gameState, basketPosition]);

  // Atualizar ref quando basketPosition muda
  useEffect(() => {
    basketPositionRef.current = basketPosition;
  }, [basketPosition]);

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
            <Text style={styles.instructionText}>🍕 Pegue pizzas e ingredientes (+10 pts)</Text>
            <Text style={styles.instructionText}>🔥 Evite obstáculos (-1 vida)</Text>
            <Text style={styles.instructionText}>💫 Faça combos para bônus!</Text>
            <Text style={styles.instructionText}>❤️ Não deixe ingredientes bons caírem</Text>
            <Text style={styles.instructionText}>👆 Arraste o balde ou use os botões!</Text>
            <Text style={styles.instructionText}>📈 Dificuldade aumenta a cada 100 pts</Text>
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

      {/* Área de jogo */}
      <View style={styles.gameArea}>
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
          <Text style={styles.basketEmoji}>🗑️</Text>
        </View>
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            styles.leftButton,
            pressed && styles.controlButtonPressed,
          ]}
          onPress={moveLeft}
        >
          <Ionicons name="chevron-back" size={32} color={colors.textOnPrimary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            styles.rightButton,
            pressed && styles.controlButtonPressed,
          ]}
          onPress={moveRight}
        >
          <Ionicons name="chevron-forward" size={32} color={colors.textOnPrimary} />
        </Pressable>
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
  difficultyBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  difficultyText: {
    fontSize: 12,
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
    bottom: 20,
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  controlButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ scale: 0.95 }],
  },
  leftButton: {},
  rightButton: {},
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
