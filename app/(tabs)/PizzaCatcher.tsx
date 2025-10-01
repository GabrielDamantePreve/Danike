import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASKET_WIDTH = 80;
const BASKET_HEIGHT = 60;
const ITEM_SIZE = 40;
const GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.65;

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
  
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemSpawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Iniciar jogo
  const startGame = () => {
    setScore(0);
    setLives(3);
    setCombo(0);
    setFallingItems([]);
    setGameState('playing');
  };

  // Pausar jogo
  const pauseGame = () => {
    setGameState('paused');
  };

  // Retomar jogo
  const resumeGame = () => {
    setGameState('playing');
  };

  // Mover cesta para esquerda
  const moveLeft = () => {
    setBasketPosition((prev) => Math.max(0, prev - 30));
  };

  // Mover cesta para direita
  const moveRight = () => {
    setBasketPosition((prev) => Math.min(SCREEN_WIDTH - BASKET_WIDTH, prev + 30));
  };

  // Criar novo item caindo
  const spawnItem = () => {
    const isGood = Math.random() > 0.3; // 70% chance de item bom
    const items = isGood ? GOOD_ITEMS : BAD_ITEMS;
    const item = items[Math.floor(Math.random() * items.length)];
    
    const newItem: FallingItem = {
      id: Date.now().toString() + Math.random(),
      x: Math.random() * (SCREEN_WIDTH - ITEM_SIZE),
      y: new Animated.Value(-ITEM_SIZE),
      emoji: item.emoji,
      isGood,
      speed: 2000 + Math.random() * 1000, // velocidade variável
    };

    setFallingItems((prev) => [...prev, newItem]);

    // Animar queda
    Animated.timing(newItem.y, {
      toValue: GAME_AREA_HEIGHT,
      duration: newItem.speed,
      useNativeDriver: true,
    }).start();
  };

  // Verificar colisões
  const checkCollisions = () => {
    setFallingItems((items) => {
      const remainingItems: FallingItem[] = [];
      let scoreChange = 0;
      let livesChange = 0;
      let comboChange = 0;

      items.forEach((item) => {
        // @ts-ignore - Accessing private property for collision detection
        const itemY = item.y.__getValue();

        // Verifica se item está na altura da cesta
        if (itemY >= GAME_AREA_HEIGHT - BASKET_HEIGHT - ITEM_SIZE && 
            itemY <= GAME_AREA_HEIGHT - BASKET_HEIGHT + 20) {
          
          // Verifica colisão horizontal
          if (item.x >= basketPosition - ITEM_SIZE / 2 && 
              item.x <= basketPosition + BASKET_WIDTH - ITEM_SIZE / 2) {
            
            if (item.isGood) {
              scoreChange += 10;
              comboChange++;
            } else {
              livesChange--;
              comboChange = -999; // Reseta combo
            }
            return; // Item coletado, não adiciona aos remainingItems
          }
        }

        // Verifica se item passou do limite inferior
        if (itemY >= GAME_AREA_HEIGHT) {
          if (item.isGood) {
            livesChange--; // Perde vida se deixar item bom cair
          }
          return; // Item caiu, não adiciona aos remainingItems
        }

        remainingItems.push(item);
      });

      // Atualiza score
      if (scoreChange > 0) {
        setScore((prev) => {
          const newScore = prev + scoreChange;
          setHighScore((hs) => Math.max(hs, newScore));
          return newScore;
        });
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
  };

  // Game Loop
  useEffect(() => {
    if (gameState === 'playing') {
      // Spawnar novos itens
      itemSpawnRef.current = setInterval(() => {
        spawnItem();
      }, 1000);

      // Loop de verificação de colisões
      gameLoopRef.current = setInterval(() => {
        checkCollisions();
      }, 50);

      return () => {
        if (itemSpawnRef.current) clearInterval(itemSpawnRef.current);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    } else {
      if (itemSpawnRef.current) clearInterval(itemSpawnRef.current);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
  }, [gameState, basketPosition]);

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

        {/* Cesta do jogador */}
        <View
          style={[
            styles.basket,
            { left: basketPosition },
          ]}
        >
          <Text style={styles.basketEmoji}>🧺</Text>
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
  },
  basketEmoji: {
    fontSize: 60,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
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
