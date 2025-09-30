import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../theme';

type Highlight = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

type TimelineEvent = {
  year: string;
  title: string;
  description: string;
};

type SignatureItem = {
  name: string;
  description: string;
  badge?: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type ValueItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const highlights: Highlight[] = [
  {
    icon: 'flame',
    title: 'Forno a lenha 24h',
    description: 'Assamos cada massa no forno de pedra com lenha certificada e temperatura controlada.',
  },
  {
    icon: 'leaf-outline',
    title: 'Ingredientes de origem',
    description: 'Parcerias com produtores locais e insumos importados para garantir frescor e autenticidade.',
  },
  {
    icon: 'sparkles-outline',
    title: 'Experiência multisensorial',
    description: 'Ambiente, trilha sonora e atendimento pensados para uma noite inesquecível.',
  },
];

const timeline: TimelineEvent[] = [
  {
    year: '2012',
    title: 'O primeiro forno',
    description: 'Danike transforma seu quintal em laboratório gastronômico e testa mais de 80 receitas.',
  },
  {
    year: '2016',
    title: 'Inauguração da casa',
    description: 'Nasce a Pizzaria Danike, com 12 sabores autorais e wine bar exclusivo.',
  },
  {
    year: '2019',
    title: 'Programa fidelidade',
    description: 'Clube da pizza e experiências privadas na cozinha aberta para convidados.',
  },
  {
    year: '2024',
    title: 'Experiência digital',
    description: 'Lançamos o estúdio de stickers e a jornada omnichannel com pedidos integrados.',
  },
];

const signatureMenu: SignatureItem[] = [
  {
    name: 'Margherita Classica',
    description: 'Mozzarella de búfala, tomate san marzano, manjericão fresco e azeite da casa.',
    badge: 'Receita premiada',
    icon: 'pizza',
  },
  {
    name: 'Caprese Burrata',
    description: 'Burrata cremosa, pesto fresco, tomates confitados e redução de balsâmico.',
    badge: 'Edição limitada',
    icon: 'leaf',
  },
  {
    name: 'Dolce Nutella',
    description: 'Creme de avelã, frutas da estação, praliné crocante e toque de flor de sal.',
    icon: 'ice-cream-outline',
  },
];

const valuePillars: ValueItem[] = [
  {
    icon: 'earth-outline',
    title: 'Sustentabilidade real',
    description: 'Compostagem de resíduos, energia renovável e fornecedores certificados.',
  },
  {
    icon: 'people-circle-outline',
    title: 'Hospitalidade autoral',
    description: 'Equipe acolhedora, processos humanizados e cardápio acessível a todos.',
  },
  {
    icon: 'rocket-outline',
    title: 'Inovação constante',
    description: 'Novos sabores sazonais, drinks assinados e experiências digitais exclusivas.',
  },
];

const contactCards: Highlight[] = [
  {
    icon: 'location-outline',
    title: 'Casa Danike',
    description: 'Av. Itália, 375 • Centro gastronômico • Estacionamento conveniado',
  },
  {
    icon: 'time-outline',
    title: 'Horários especiais',
    description: 'Ter a dom • 18h às 23h • Brunch italiano todo primeiro domingo do mês',
  },
  {
    icon: 'call-outline',
    title: 'Converse com a gente',
    description: 'Pedidos: Tab “Pedidos” • Eventos privados: eventos@danike.com',
  },
];

const testimonials = [
  {
    quote:
      '“A Danike redefiniu nossas noites entre amigos. Atendimento impecável, sabores surpreendentes e uma experiência digital que facilita tudo.”',
    author: 'Ana Luiza Faria',
    role: 'Food stylist e cliente desde 2017',
  },
  {
    quote:
      '“A melhor pizzaria da cidade! A massa é leve, os ingredientes são frescos e o ambiente é perfeito para celebrar momentos especiais.”',
    author: 'Ricardo Menezes',
    role: 'Empresário e membro do Clube Danike',
  },
];

export default function AboutTab() {
  const { width } = useWindowDimensions();
  const isWide = width >= 960;

  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.layout, isWide && styles.layoutWide]}>
          <View style={[styles.column, isWide && styles.columnHero]}>
            <BlurView intensity={60} tint="dark" style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.heroIconWrapper}>
                  <Ionicons name="pizza" size={36} color={colors.textOnPrimary} />
                </View>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroBadge}>Desde 2012</Text>
                  <Text style={styles.heroTitle}>Pizzaria Danike • Gastronomia, hospitalidade e tecnologia</Text>
                  <Text style={styles.heroSubtitle}>
                    Uma casa acolhedora que celebra a pizza artesanal, combina inovação digital e cria experiências
                    memoráveis para quem busca sabor, afeto e conveniência.
                  </Text>
                </View>
              </View>

              <View style={styles.highlightRow}>
                {highlights.map((item) => (
                  <View key={item.title} style={styles.highlightCard}>
                    <View style={styles.highlightIconWrapper}>
                      <Ionicons name={item.icon} size={20} color={colors.textOnPrimary} />
                    </View>
                    <Text style={styles.highlightTitle}>{item.title}</Text>
                    <Text style={styles.highlightDescription}>{item.description}</Text>
                  </View>
                ))}
              </View>
            </BlurView>

            <BlurView intensity={65} tint="light" style={styles.storyCard}>
              <Text style={styles.sectionTitle}>Nossa jornada</Text>
              <View style={styles.timeline}>
                {timeline.map((event, index) => (
                  <View key={event.year} style={styles.timelineItem}>
                    <View style={styles.timelineBadge}>
                      <Text style={styles.timelineYear}>{event.year}</Text>
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>{event.title}</Text>
                      <Text style={styles.timelineDescription}>{event.description}</Text>
                    </View>
                    {index !== timeline.length - 1 && <View style={styles.timelineConnector} />} 
                  </View>
                ))}
              </View>
            </BlurView>

            <BlurView intensity={60} tint="light" style={styles.menuCard}>
              <Text style={styles.sectionTitle}>Assinaturas da casa</Text>
              <View style={styles.signatureList}>
                {signatureMenu.map((item) => (
                  <View key={item.name} style={styles.signatureItem}>
                    <View style={styles.signatureIconWrapper}>
                      <Ionicons name={item.icon} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.signatureCopy}>
                      <Text style={styles.signatureName}>{item.name}</Text>
                      <Text style={styles.signatureDescription}>{item.description}</Text>
                      {item.badge ? <Text style={styles.signatureBadge}>{item.badge}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>

          <View style={[styles.column, isWide && styles.columnDetails]}>
            <BlurView intensity={70} tint="dark" style={styles.valuesCard}>
              <Text style={styles.sectionTitleDark}>O que nos move</Text>
              <View style={styles.valuesList}>
                {valuePillars.map((value) => (
                  <View key={value.title} style={styles.valueItem}>
                    <View style={styles.valueIconWrapper}>
                      <Ionicons name={value.icon} size={22} color={colors.textOnPrimary} />
                    </View>
                    <View style={styles.valueCopy}>
                      <Text style={styles.valueTitle}>{value.title}</Text>
                      <Text style={styles.valueDescription}>{value.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </BlurView>

            <BlurView intensity={65} tint="light" style={styles.contactCard}>
              <Text style={styles.sectionTitle}>Visite ou fale com a gente</Text>
              <View style={styles.contactList}>
                {contactCards.map((item) => (
                  <View key={item.title} style={styles.contactItem}>
                    <View style={styles.contactIconWrapper}>
                      <Ionicons name={item.icon} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.contactCopy}>
                      <Text style={styles.contactTitle}>{item.title}</Text>
                      <Text style={styles.contactDescription}>{item.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.contactFooter}>
                <Ionicons name="mail-outline" size={18} color={colors.primary} style={styles.contactFooterIcon} />
                <Text style={styles.contactFooterText}>Reservas exclusivas: reservas@danike.com</Text>
              </View>
            </BlurView>

            <BlurView intensity={60} tint="light" style={styles.testimonialCard}>
              <Text style={styles.sectionTitle}>O que dizem sobre nós</Text>
              <View style={styles.testimonialList}>
                {testimonials.map((testimonial) => (
                  <View key={testimonial.author} style={styles.testimonialItem}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
                    <Text style={styles.testimonialQuote}>{testimonial.quote}</Text>
                    <Text style={styles.testimonialAuthor}>{testimonial.author}</Text>
                    <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>
        </View>

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
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 20,
  },
  layout: {
    flexDirection: 'column',
    gap: 24,
  },
  layoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
  },
  column: {
    width: '100%',
    gap: 24,
  },
  columnHero: {
    flex: 7,
  },
  columnDetails: {
    flex: 5,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    gap: 18,
  },
  heroHeader: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'flex-start',
  },
  heroIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: colors.textOnPrimary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heroTitle: {
    color: colors.textOnPrimary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    lineHeight: 22,
  },
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  highlightCard: {
    flex: 1,
    minWidth: 220,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 18,
    gap: 10,
  },
  highlightIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightTitle: {
    color: colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  highlightDescription: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
  },
  storyCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 26,
    gap: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  sectionTitleDark: {
    color: colors.textOnPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  timeline: {
    gap: 18,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 56,
  },
  timelineBadge: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,53,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineYear: {
    color: colors.primary,
    fontWeight: '700',
  },
  timelineContent: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(37,41,46,0.08)',
    backgroundColor: colors.surface,
    padding: 16,
    gap: 6,
  },
  timelineTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  timelineDescription: {
    color: 'rgba(37,41,46,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  timelineConnector: {
    position: 'absolute',
    left: 20,
    top: 44,
    bottom: -18,
    width: 2,
    backgroundColor: 'rgba(255,107,53,0.35)',
  },
  menuCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 26,
    gap: 20,
  },
  signatureList: {
    gap: 16,
  },
  signatureItem: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(37,41,46,0.08)',
    backgroundColor: colors.surface,
    padding: 18,
  },
  signatureIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureCopy: {
    flex: 1,
    gap: 6,
  },
  signatureName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  signatureDescription: {
    color: 'rgba(37,41,46,0.68)',
    fontSize: 14,
    lineHeight: 20,
  },
  signatureBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,107,53,0.15)',
    color: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '600',
  },
  valuesCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.28)',
    padding: 26,
    gap: 20,
  },
  valuesList: {
    gap: 16,
  },
  valueItem: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 18,
  },
  valueIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueCopy: {
    flex: 1,
    gap: 4,
  },
  valueTitle: {
    color: colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  valueDescription: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
  },
  contactCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 26,
    gap: 20,
  },
  contactList: {
    gap: 18,
  },
  contactItem: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(37,41,46,0.08)',
    backgroundColor: colors.surface,
    padding: 18,
  },
  contactIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,107,53,0.16)',
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
    fontSize: 16,
  },
  contactDescription: {
    color: 'rgba(37,41,46,0.68)',
    fontSize: 14,
    lineHeight: 20,
  },
  contactFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,107,53,0.12)',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  contactFooterIcon: {
    marginBottom: -1,
  },
  contactFooterText: {
    color: colors.primary,
    fontWeight: '600',
  },
  testimonialCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 26,
    gap: 20,
  },
  testimonialList: {
    gap: 18,
  },
  testimonialItem: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(37,41,46,0.08)',
    backgroundColor: colors.surface,
    padding: 20,
    gap: 12,
  },
  testimonialQuote: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    color: colors.primary,
    fontWeight: '700',
  },
  testimonialRole: {
    color: 'rgba(37,41,46,0.6)',
    fontSize: 13,
  },
  bottomSpacer: {
    height: 40,
  },
});
