
import { Text, View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import Card from '@/components/Card';
import { colors } from '../../theme';

const { width } = Dimensions.get('window');

const features = [
  {
    icon: 'flame',
    title: 'Forno a Lenha',
    description: 'Pizzas assadas no forno tradicional para sabor autêntico'
  },
  {
    icon: 'leaf',
    title: 'Ingredientes Frescos',
    description: 'Selecionamos os melhores ingredientes diariamente'
  },
  {
    icon: 'time',
    title: 'Entrega Rápida',
    description: 'Delivery em até 30 minutos na região'
  },
  {
    icon: 'heart',
    title: 'Feito com Amor',
    description: 'Cada pizza é preparada com carinho e dedicação'
  }
];

export default function AboutScreen() {
  return (
  <LinearGradient colors={[colors.primary, colors.accent, '#FFD700']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="pizza" size={60} color="white" />
          </View>
          <Text style={styles.brandName}>Pizzaria Danike's</Text>
          <Text style={styles.tagline}>🍕 Sabor que Conquista! 🍕</Text>
        </View>

        {/* Story Section */}
        <View style={styles.storySection}>
          <Text style={styles.sectionTitle}>Nossa História</Text>
          <Text style={styles.storyText}>
            Bem-vindo à Pizzaria do Danike's, onde cada fatia é uma experiência única de sabor e qualidade! 
            Nossa paixão pela culinária italiana se une à criatividade brasileira para oferecer pizzas artesanais, 
            feitas com ingredientes frescos e um toque especial de amor.
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Nossos Diferenciais</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon as any} size={30} color={colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={24} color={colors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Localização</Text>
                <Text style={styles.infoDescription}>Entregamos em toda a região!</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={24} color={colors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Horário de Funcionamento</Text>
                <Text style={styles.infoDescription}>Todos os dias: 18h às 23h</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={24} color={colors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Contato</Text>
                <Text style={styles.infoDescription}>Faça seu pedido na aba "Pedidos"</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mission Statement */}
        <View style={styles.missionSection}>
          <Text style={styles.missionTitle}>Nossa Missão</Text>
          <Text style={styles.missionText}>
            Proporcionar momentos especiais através do sabor autêntico de nossas pizzas, 
            criando experiências inesquecíveis para toda a família em um ambiente aconchegante 
            ou no conforto da sua casa.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 10,
  },
  storySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 15,
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
  color: colors.muted,
    textAlign: 'justify',
  },
  featuresSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 15,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 70) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
  backgroundColor: '#FFF5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
  color: colors.muted,
    textAlign: 'center',
    lineHeight: 16,
  },
  contactSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 15,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 15,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 3,
  },
  infoDescription: {
    fontSize: 14,
    color: '#636E72',
  },
  missionSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 15,
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  missionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  color: colors.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  missionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#636E72',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 30,
  },
});