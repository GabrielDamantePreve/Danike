import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../theme';

type InfoItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const highlights: InfoItem[] = [
  {
    icon: 'flame',
    title: 'Forno a lenha',
    description: 'Massa artesanal assada em forno de pedra.',
  },
  {
    icon: 'leaf-outline',
    title: 'Ingredientes frescos',
    description: 'Produtores locais e ingredientes selecionados.',
  },
  {
    icon: 'sparkles-outline',
    title: 'Experiência única',
    description: 'Ambiente acolhedor e atendimento especial.',
  },
];

const contactInfo: InfoItem[] = [
  {
    icon: 'location-outline',
    title: 'Endereço',
    description: 'Av. Itália, 375 • Centro gastronômico',
  },
  {
    icon: 'time-outline',
    title: 'Horário',
    description: 'Ter a dom • 18h às 23h',
  },
  {
    icon: 'call-outline',
    title: 'Contato',
    description: 'Pedidos via app • eventos@danike.com',
  },
];

export default function AboutTab() {
  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <BlurView intensity={60} tint="dark" style={styles.heroCard}>
          <View style={styles.heroIconWrapper}>
            <Ionicons name="pizza" size={48} color={colors.textOnPrimary} />
          </View>
          <Text style={styles.heroBadge}>Desde 2012</Text>
          <Text style={styles.heroTitle}>Pizzaria Danike</Text>
          <Text style={styles.heroSubtitle}>
            Pizza artesanal com ingredientes frescos, assada em forno a lenha. 
            Uma experiência única que combina tradição e sabor.
          </Text>
        </BlurView>

        {/* Highlights */}
        <View style={styles.highlightRow}>
          {highlights.map((item) => (
            <View key={item.title} style={styles.highlightCard}>
              <Ionicons name={item.icon} size={28} color={colors.textOnPrimary} />
              <Text style={styles.highlightTitle}>{item.title}</Text>
              <Text style={styles.highlightDescription}>{item.description}</Text>
            </View>
          ))}
        </View>

        {/* Contact Info */}
        <BlurView intensity={65} tint="light" style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Visite-nos</Text>
          {contactInfo.map((item) => (
            <View key={item.title} style={styles.contactItem}>
              <View style={styles.contactIconWrapper}>
                <Ionicons name={item.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.contactCopy}>
                <Text style={styles.contactTitle}>{item.title}</Text>
                <Text style={styles.contactDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </BlurView>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 24,
  },
  heroCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 32,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    gap: 16,
  },
  heroIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: colors.textOnPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heroTitle: {
    color: colors.textOnPrimary,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 600,
  },
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  highlightCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  highlightTitle: {
    color: colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 17,
    textAlign: 'center',
  },
  highlightDescription: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  contactCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 28,
    gap: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(37,41,46,0.08)',
    backgroundColor: colors.surface,
    padding: 20,
  },
  contactIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,107,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCopy: {
    flex: 1,
    gap: 4,
  },
  contactTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 17,
  },
  contactDescription: {
    color: 'rgba(37,41,46,0.7)',
    fontSize: 15,
    lineHeight: 21,
  },
  bottomSpacer: {
    height: 40,
  },
});
