
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

type PizzaCardProps = {
  name: string;
  description: string;
  price: string;
  rating: number;
  image?: string;
  onPress?: () => void;
};

export default function PizzaCard({ name, description, price, rating }: PizzaCardProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
  colors={[colors.surface, colors.surfaceAlt]}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          <View style={styles.pizzaIcon}>
            <Ionicons name="pizza" size={40} color="#FF6B35" />
          </View>
        </View>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{rating}</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{description}</Text>
            <View style={styles.footer}>
            <Text style={styles.price}>{price}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    marginVertical: 8,
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    height: 120,
  backgroundColor: '#FFF5F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pizzaIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
  backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  color: colors.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  color: colors.text,
  },
  description: {
    fontSize: 14,
  color: colors.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },  price: {
    fontSize: 20,
    fontWeight: 'bold',
  color: colors.primary,
  },
});
