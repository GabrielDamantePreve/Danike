import { useMemo, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import ModernButton from '@/components/ModernButton';
import { useBuscaCep } from '@/hooks/useBuscaCep';
import { colors } from '../../theme';

type CoverageStat = {
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    label: string;
};

type DeliveryHighlight = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
};

type ChecklistItem = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
};

const coverageStats: CoverageStat[] = [
    { icon: 'map-outline', value: '120+', label: 'bairros atendidos' },
    { icon: 'timer-outline', value: '35-45 min', label: 'tempo médio de entrega' },
    { icon: 'pricetag-outline', value: 'R$ 7,90', label: 'taxa fixa na região' },
];

const deliveryHighlights: DeliveryHighlight[] = [
    {
        icon: 'leaf-outline',
        title: 'Frota sustentável',
        description: 'Entrega com bikes elétricas e rastreamento em tempo real.',
    },
    {
        icon: 'snow-outline',
        title: 'Embalagem térmica',
        description: 'Selamos cada pedido com controle de temperatura e segurança.',
    },
    {
        icon: 'shield-checkmark-outline',
        title: 'Equipe treinada',
        description: 'Entregadores próprios, cordialidade e protocolos atualizados.',
    },
];

const requestChecklist: ChecklistItem[] = [
    {
        icon: 'home-outline',
        title: 'Dica amiga',
        description: 'Informe complemento ou portaria ao finalizar seu pedido.',
    },
    {
        icon: 'cash-outline',
        title: 'Pagamentos flexíveis',
        description: 'Pix, cartão na entrega e pagamento antecipado via app.',
    },
    {
        icon: 'gift-outline',
        title: 'Programa fidelidade',
        description: 'A cada 6 pedidos entregues, a 7ª pizza sai por nossa conta.',
    },
];

export default function DeliveryTab() {
    const { cep, setCep, endereco, buscarCEP } = useBuscaCep();
    const [isLoading, setIsLoading] = useState(false);
    const { width } = useWindowDimensions();
    const isWide = width >= 960;

    const hasAddress = useMemo(() => Boolean(endereco?.logradouro), [endereco?.logradouro]);

    const formattedCep = useMemo(() => {
        if (!cep) return '';
        const numeric = cep.replace(/\D/g, '').slice(0, 8);
        if (numeric.length > 5) {
            return `${numeric.slice(0, 5)}-${numeric.slice(5)}`;
        }
        return numeric;
    }, [cep]);

    const handleBuscarCEP = async () => {
        if (cep.length !== 8) {
            Alert.alert('CEP inválido', 'Por favor, digite um CEP com 8 dígitos.');
            return;
        }

        setIsLoading(true);
        try {
            await buscarCEP();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível consultar o CEP. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const onCEPChange = (text: string) => {
        const numeric = text.replace(/\D/g, '').slice(0, 8);
        setCep(numeric);
    };

    const renderAddressRow = (icon: keyof typeof Ionicons.glyphMap, label: string, value: string) => (
        <View style={styles.addressRow} key={label}>
            <View style={styles.addressIconWrapper}>
                <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
            <View style={styles.addressCopy}>
                <Text style={styles.addressLabel}>{label}</Text>
                <Text style={styles.addressValue}>{value || '—'}</Text>
            </View>
        </View>
    );

    return (
        <LinearGradient
            colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.layout, isWide && styles.layoutWide]}>
                    <View style={[styles.column, isWide && styles.columnLeft]}>
                        <BlurView intensity={60} tint="dark" style={styles.heroCard}>
                            <View style={styles.heroHeader}>
                                <View style={styles.heroIconWrapper}>
                                    <Ionicons name="bicycle-outline" size={32} color={colors.textOnPrimary} />
                                </View>
                                <View style={styles.heroCopy}>
                                    <Text style={styles.heroBadge}>Delivery premium Danike</Text>
                                    <Text style={styles.heroTitle}>Sua pizza favorita chega quentinha e no tempo certo</Text>
                                    <Text style={styles.heroSubtitle}>
                                        Consulte a cobertura com o CEP, acompanhe os prazos estimados e descubra todas as vantagens de
                                        receber Danike em casa.
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.statsRow}>
                                {coverageStats.map((stat) => (
                                    <View key={stat.label} style={styles.statCard}>
                                        <View style={styles.statIconWrapper}>
                                            <Ionicons name={stat.icon} size={18} color={colors.textOnPrimary} />
                                        </View>
                                        <Text style={styles.statValue}>{stat.value}</Text>
                                        <Text style={styles.statLabel}>{stat.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </BlurView>

                        <BlurView intensity={65} tint="light" style={styles.searchCard}>
                            <Text style={styles.sectionTitle}>Verifique a entrega pelo CEP</Text>
                            <View style={styles.searchInputWrapper}>
                                <Ionicons name="search" size={20} color={'rgba(37,41,46,0.45)'} style={styles.searchIcon} />
                                <TextInput
                                    value={formattedCep}
                                    onChangeText={onCEPChange}
                                    placeholder="00000-000"
                                    placeholderTextColor="rgba(37,41,46,0.3)"
                                    keyboardType="number-pad"
                                    maxLength={9}
                                    style={styles.searchInput}
                                />
                            </View>

                            <ModernButton
                                title={isLoading ? 'Consultando...' : 'Buscar CEP'}
                                icon="search"
                                size="large"
                                onPress={handleBuscarCEP}
                                disabled={isLoading || cep.length !== 8}
                            />

                            <View style={styles.searchTips}>
                                <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                                <Text style={styles.searchTipText}>
                                    Digite apenas números. Atendimento disponível para toda a região metropolitana.
                                </Text>
                            </View>
                        </BlurView>

                        <BlurView intensity={60} tint="light" style={styles.deliveryHighlightsCard}>
                            <Text style={styles.sectionTitle}>Como garantimos excelência</Text>
                            <View style={styles.highlightsList}>
                                {deliveryHighlights.map((item) => (
                                    <View key={item.title} style={styles.highlightItem}>
                                        <View style={styles.highlightIcon}>
                                            <Ionicons name={item.icon} size={18} color={colors.primary} />
                                        </View>
                                        <View style={styles.highlightCopy}>
                                            <Text style={styles.highlightTitle}>{item.title}</Text>
                                            <Text style={styles.highlightDescription}>{item.description}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </BlurView>
                    </View>

                    <View style={[styles.column, isWide && styles.columnRight]}>
                        <BlurView intensity={70} tint="light" style={styles.resultCard}>
                            <Text style={styles.sectionTitle}>Status da sua região</Text>

                            {hasAddress ? (
                                <View style={styles.addressContainer}>
                                    <View style={styles.resultBadge}>
                                        <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                                        <Text style={styles.resultBadgeText}>Cobertura confirmada</Text>
                                    </View>

                                    <View style={styles.addressGrid}>
                                        {renderAddressRow('location-outline', 'Logradouro', endereco.logradouro)}
                                        {renderAddressRow('business-outline', 'Bairro', endereco.bairro)}
                                        {renderAddressRow('navigate-outline', 'Cidade', endereco.localidade)}
                                        {renderAddressRow('flag-outline', 'Estado', endereco.uf)}
                                    </View>

                                    <View style={styles.successMessage}>
                                        <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
                                        <Text style={styles.successText}>
                                            Entregamos no seu endereço! Finalize o pedido na aba “Pedidos” e acompanhe pela área de
                                            notificações.
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="locate-outline" size={26} color={'rgba(37,41,46,0.4)'} />
                                    <Text style={styles.emptyStateTitle}>Informe um CEP válido</Text>
                                    <Text style={styles.emptyStateDescription}>
                                        Assim que encontrarmos seu endereço, mostraremos detalhes de entrega personalizados.
                                    </Text>
                                </View>
                            )}
                        </BlurView>

                        <BlurView intensity={65} tint="light" style={styles.checklistCard}>
                            <Text style={styles.sectionTitle}>Antes de finalizar</Text>
                            <View style={styles.checklist}>
                                {requestChecklist.map((item) => (
                                    <View key={item.title} style={styles.checklistItem}>
                                        <View style={styles.checklistIconWrapper}>
                                            <Ionicons name={item.icon} size={18} color={colors.primary} />
                                        </View>
                                        <View style={styles.checklistCopy}>
                                            <Text style={styles.checklistTitle}>{item.title}</Text>
                                            <Text style={styles.checklistDescription}>{item.description}</Text>
                                        </View>
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
    columnLeft: {
        flex: 7,
    },
    columnRight: {
        flex: 5,
    },
    heroCard: {
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        backgroundColor: 'rgba(0,0,0,0.32)',
        padding: 20,
        gap: 18,
    },
    heroHeader: {
        flexDirection: 'row',
        gap: 18,
        alignItems: 'flex-start',
    },
    heroIconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroCopy: {
        flex: 1,
        gap: 8,
    },
    heroBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.2)',
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
    statsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        flexGrow: 1,
        minWidth: 160,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 18,
        gap: 10,
    },
    statIconWrapper: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        color: colors.textOnPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    searchCard: {
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        backgroundColor: 'rgba(255,255,255,0.92)',
        padding: 26,
        gap: 18,
    },
    sectionTitle: {
        color: colors.text,
        fontSize: 22,
        fontWeight: '700',
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(37,41,46,0.12)',
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    searchIcon: {
        marginBottom: -1,
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
        color: colors.text,
    },
    searchTips: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: 'rgba(255,107,53,0.12)',
        borderRadius: 16,
        padding: 12,
    },
    searchTipText: {
        flex: 1,
        color: 'rgba(37,41,46,0.68)',
        fontSize: 13,
        lineHeight: 18,
    },
    deliveryHighlightsCard: {
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 26,
        gap: 18,
    },
    highlightsList: {
        gap: 16,
    },
    highlightItem: {
        flexDirection: 'row',
        gap: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(37,41,46,0.1)',
        backgroundColor: colors.surface,
        padding: 18,
    },
    highlightIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,107,53,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    highlightCopy: {
        flex: 1,
        gap: 6,
    },
    highlightTitle: {
        color: colors.text,
        fontWeight: '700',
        fontSize: 16,
    },
    highlightDescription: {
        color: 'rgba(37,41,46,0.65)',
        fontSize: 14,
        lineHeight: 20,
    },
    resultCard: {
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.92)',
        padding: 26,
        gap: 18,
    },
    addressContainer: {
        gap: 18,
    },
    resultBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(76,175,80,0.12)',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    resultBadgeText: {
        color: colors.success,
        fontWeight: '700',
    },
    addressGrid: {
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(37,41,46,0.08)',
        backgroundColor: colors.surface,
        padding: 20,
        gap: 12,
    },
    addressRow: {
        flexDirection: 'row',
        gap: 14,
        alignItems: 'flex-start',
    },
    addressIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,107,53,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressCopy: {
        flex: 1,
        gap: 4,
    },
    addressLabel: {
        color: 'rgba(37,41,46,0.6)',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        fontWeight: '600',
    },
    addressValue: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    successMessage: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255,107,53,0.12)',
        borderRadius: 20,
        padding: 16,
    },
    successText: {
        flex: 1,
        color: 'rgba(37,41,46,0.7)',
        fontSize: 14,
        lineHeight: 20,
    },
    emptyState: {
        alignItems: 'center',
        gap: 10,
        paddingVertical: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(37,41,46,0.1)',
        backgroundColor: colors.surface,
    },
    emptyStateTitle: {
        color: colors.text,
        fontWeight: '700',
        fontSize: 16,
    },
    emptyStateDescription: {
        color: 'rgba(37,41,46,0.6)',
        textAlign: 'center',
        paddingHorizontal: 24,
        lineHeight: 20,
    },
    checklistCard: {
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.92)',
        padding: 26,
        gap: 18,
    },
    checklist: {
        gap: 14,
    },
    checklistItem: {
        flexDirection: 'row',
        gap: 14,
        alignItems: 'flex-start',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(37,41,46,0.08)',
        backgroundColor: colors.surface,
        padding: 18,
    },
    checklistIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,107,53,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checklistCopy: {
        flex: 1,
        gap: 6,
    },
    checklistTitle: {
        color: colors.text,
        fontWeight: '700',
        fontSize: 15,
    },
    checklistDescription: {
        color: 'rgba(37,41,46,0.65)',
        fontSize: 13,
        lineHeight: 19,
    },
    bottomSpacer: {
        height: 120,
    },
});