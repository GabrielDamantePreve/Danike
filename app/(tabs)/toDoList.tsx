import { useMemo, useState } from 'react';
import {
    Alert,
    Pressable,
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
import { colors } from '../../theme';
import { useBuscaCep } from '@/hooks/useBuscaCep';

type OrderStep = 'start' | 'service' | 'menu' | 'review' | 'success';
type ServiceMode = 'delivery' | 'retirada';
type CategoryId = 'tradicional' | 'premium' | 'vegetariana' | 'doce';
type FilterId = 'all' | CategoryId;

type Pizza = {
    id: string;
    name: string;
    price: number;
    description: string;
    category: CategoryId;
    highlight?: string;
    spicy?: boolean;
    isNew?: boolean;
    preparationTime: string;
};

type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    isCombo?: boolean;
    isCustom?: boolean;
};

type CategoryDefinition = {
    id: FilterId;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
};

type CategoryPillProps = CategoryDefinition & {
    active: boolean;
    onPress: (id: FilterId) => void;
};

type CartItemRowProps = {
    item: CartItem;
    onDecrease: () => void;
    onIncrease: () => void;
    onRemove: () => void;
};

const categories: CategoryDefinition[] = [
    { id: 'all', label: 'Todas', icon: 'grid-outline' },
    { id: 'tradicional', label: 'Tradicionais', icon: 'pizza' },
    { id: 'premium', label: 'Premium', icon: 'star' },
    { id: 'vegetariana', label: 'Veggie', icon: 'leaf' },
    { id: 'doce', label: 'Doces', icon: 'ice-cream-outline' },
];

const pizzaMenu: Pizza[] = [
    {
        id: '1',
        name: 'Margherita Classica',
        price: 39.9,
        description: 'Molho de tomate italiano, mozzarella de búfala, manjericão fresco e fio de azeite.',
        category: 'tradicional',
        highlight: 'Receita premiada 2024',
        preparationTime: '25 min',
    },
    {
        id: '2',
        name: 'Calabresa Artesanal',
        price: 42.9,
        description: 'Calabresa levemente picante, cebola caramelizada, azeitonas pretas e toque de orégano.',
        category: 'tradicional',
        spicy: true,
        preparationTime: '24 min',
    },
    {
        id: '3',
        name: 'Quatro Queijos Gold',
        price: 48.5,
        description: 'Blend exclusivo de mozzarella, gorgonzola, parmesão maturado e catupiry cremoso.',
        category: 'premium',
        highlight: 'Favorita dos clientes',
        preparationTime: '26 min',
    },
    {
        id: '4',
        name: 'Bosco Verde',
        price: 44.9,
        description: 'Pesto de manjericão, mozzarella fresca, cogumelos salteados e nozes caramelizadas.',
        category: 'vegetariana',
        isNew: true,
        preparationTime: '23 min',
    },
    {
        id: '5',
        name: 'Frango ao Catupiry Supreme',
        price: 46.9,
        description: 'Frango desfiado lentamente, catupiry original, milho verde e crispy de alho-poró.',
        category: 'premium',
        preparationTime: '25 min',
    },
    {
        id: '6',
        name: 'Dolce Nutella',
        price: 38.9,
        description: 'Creme de avelã, morangos frescos, crocante de avelãs e lascas de chocolate belga.',
        category: 'doce',
        preparationTime: '18 min',
    },
    {
        id: '7',
        name: 'Caprese Burrata',
        price: 52.9,
        description: 'Burrata cremosa, tomatinhos confitados, redução de balsâmico e folhas frescas.',
        category: 'premium',
        highlight: 'Edição limitada',
        preparationTime: '28 min',
    },
    {
        id: '8',
        name: 'Veggie Mediterrânea',
        price: 43.5,
        description: 'Base de pesto, abobrinha grelhada, tomates secos, rúcula e castanhas de caju.',
        category: 'vegetariana',
        preparationTime: '24 min',
    },
];

const comboDeals = [
    {
        id: 'combo1',
        title: 'Combo Família',
        description: '2 pizzas grandes + refrigerante 2L + sobremesa cortesia',
        price: 114.9,
        icon: 'people-circle-outline',
    },
    {
        id: 'combo2',
        title: 'Noite Netflix',
        description: '1 pizza premium + 1 pizza doce + duo de drinks autorais',
        price: 92.8,
        icon: 'film-outline',
    },
];

const addOnOptions = [
    { id: 'addon1', title: 'Bordas Recheadas', price: 8.5, icon: 'ellipse-outline' },
    { id: 'addon2', title: 'Molho da Casa', price: 5.9, icon: 'flame-outline' },
    { id: 'addon3', title: 'Drink Artesanal', price: 18.9, icon: 'wine-outline' },
];

const serviceConfigurations: Record<ServiceMode, { label: string; icon: keyof typeof Ionicons.glyphMap; description: string; highlight: string; fee: number }> = {
    delivery: {
        label: 'Delivery Express',
        icon: 'bicycle',
        description: 'Levamos até você em média 35-45 minutos.',
        highlight: 'Taxa única R$ 7,90',
        fee: 7.9,
    },
    retirada: {
        label: 'Retirada na casa Danike',
        icon: 'storefront-outline',
        description: 'Peça agora e retire quentinho sem fila.',
        highlight: 'Retirada em 15 minutos',
        fee: 0,
    },
};

const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OrdersTab() {
    const { width } = useWindowDimensions();
    const isWideLayout = width >= 980;
    
    // Hook de busca de CEP
    const { cep, setCep, endereco, buscarCEP } = useBuscaCep();
    const [isLoadingCep, setIsLoadingCep] = useState(false);

    const [currentStep, setCurrentStep] = useState<OrderStep>('start');
    const [serviceMode, setServiceMode] = useState<ServiceMode>('delivery');
    const [selectedCategory, setSelectedCategory] = useState<FilterId>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [customItemName, setCustomItemName] = useState('');
    const [customItemPrice, setCustomItemPrice] = useState('');
    const [customItemNotes, setCustomItemNotes] = useState('');
    const [orderNotes, setOrderNotes] = useState('');

    const filteredMenu = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return pizzaMenu.filter((pizza) => {
            const matchesCategory = selectedCategory === 'all' || pizza.category === selectedCategory;
            const matchesQuery =
                query.length === 0 ||
                pizza.name.toLowerCase().includes(query) ||
                pizza.description.toLowerCase().includes(query);
            return matchesCategory && matchesQuery;
        });
    }, [selectedCategory, searchTerm]);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discount = subtotal >= 120 ? subtotal * 0.07 : 0;
    const serviceFee = serviceConfigurations[serviceMode].fee;
    const packagingFee = cartItems.length > 0 && serviceMode === 'delivery' ? 3.5 : 0;
    const total = Math.max(0, subtotal - discount + serviceFee + packagingFee);

    const estimatedTime = serviceMode === 'delivery' ? '35 - 45 min' : '15 - 20 min';

    const handleAddPizza = (pizza: Pizza) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === pizza.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === pizza.id ? { ...item, quantity: item.quantity + 1 } : item,
                );
            }
            return [
                ...prev,
                {
                    id: pizza.id,
                    name: pizza.name,
                    price: pizza.price,
                    quantity: 1,
                    notes: pizza.description,
                },
            ];
        });
    };

    const handleAddCombo = (comboId: string) => {
        const combo = comboDeals.find((item) => item.id === comboId);
        if (!combo) return;
        setCartItems((prev) => [
            ...prev,
            {
                id: `${combo.id}-${Date.now()}`,
                name: combo.title,
                price: combo.price,
                quantity: 1,
                notes: combo.description,
                isCombo: true,
            },
        ]);
    };

    const handleAddAddon = (addonId: string) => {
        const addon = addOnOptions.find((item) => item.id === addonId);
        if (!addon) return;
        setCartItems((prev) => [
            ...prev,
            {
                id: `${addon.id}-${Date.now()}`,
                name: addon.title,
                price: addon.price,
                quantity: 1,
                notes: 'Adicional selecionado',
                isCustom: true,
            },
        ]);
    };

    const handleDecreaseItem = (itemId: string) => {
        setCartItems((prev) =>
            prev
                .map((item) =>
                    item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item,
                )
                .filter((item) => item.quantity > 0),
        );
    };

    const handleIncreaseItem = (itemId: string) => {
        setCartItems((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item)),
        );
    };

    const handleRemoveItem = (itemId: string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    };

    const handleAddCustomItem = () => {
        if (!customItemName.trim()) {
            Alert.alert('Nome obrigatório', 'Informe o nome do item personalizado.');
            return;
        }

        const sanitized = customItemPrice.trim().replace(/\s/g, '').replace('.', '').replace(',', '.');
        const price = Number(sanitized);

        if (!price || Number.isNaN(price) || price <= 0) {
            Alert.alert('Preço inválido', 'Informe o valor no formato 49,90.');
            return;
        }

        setCartItems((prev) => [
            ...prev,
            {
                id: `custom-${Date.now()}`,
                name: customItemName,
                price,
                quantity: 1,
                notes: customItemNotes,
                isCustom: true,
            },
        ]);

        setCustomItemName('');
        setCustomItemPrice('');
        setCustomItemNotes('');
    };

    const handleBuscarCEP = async () => {
        if (cep.length !== 8) {
            Alert.alert('CEP inválido', 'Por favor, digite um CEP com 8 dígitos.');
            return;
        }

        setIsLoadingCep(true);
        try {
            await buscarCEP();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível buscar o CEP. Tente novamente.');
        } finally {
            setIsLoadingCep(false);
        }
    };

    const formattedCep = useMemo(() => {
        if (!cep) return '';
        const numeric = cep.replace(/\D/g, '').slice(0, 8);
        if (numeric.length > 5) {
            return `${numeric.slice(0, 5)}-${numeric.slice(5)}`;
        }
        return numeric;
    }, [cep]);

    const hasAddress = useMemo(() => Boolean(endereco?.logradouro), [endereco?.logradouro]);

    const resetCart = () => {
        setCartItems([]);
        setOrderNotes('');
    };

    const finalizeOrder = () => {
        if (!cartItems.length) {
            Alert.alert('Carrinho vazio', 'Adicione pelo menos uma pizza ao carrinho.');
            return;
        }

        // Ir direto para a tela de sucesso
        setCurrentStep('success');
    };

    const goToNextStep = () => {
        const steps: OrderStep[] = ['start', 'service', 'menu', 'review', 'success'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const goToPreviousStep = () => {
        const steps: OrderStep[] = ['start', 'service', 'menu', 'review', 'success'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };

    const renderStepIndicator = () => {
        const steps = [
            { id: 'start', label: 'Início', icon: 'home' },
            { id: 'service', label: 'Serviço', icon: 'bicycle' },
            { id: 'menu', label: 'Menu', icon: 'pizza' },
            { id: 'review', label: 'Revisar', icon: 'checkmark-circle' },
        ];

        const currentIndex = steps.findIndex(s => s.id === currentStep);

        return (
            <View style={styles.stepIndicator}>
                {steps.map((step, index) => (
                    <View key={step.id} style={styles.stepItem}>
                        <View style={[
                            styles.stepCircle,
                            index <= currentIndex && styles.stepCircleActive,
                            index < currentIndex && styles.stepCircleCompleted
                        ]}>
                            <Ionicons 
                                name={step.icon as keyof typeof Ionicons.glyphMap}
                                size={16} 
                                color={index <= currentIndex ? colors.textOnPrimary : 'rgba(255,255,255,0.5)'} 
                            />
                        </View>
                        {index < steps.length - 1 && (
                            <View style={[
                                styles.stepLine,
                                index < currentIndex && styles.stepLineActive
                            ]} />
                        )}
                    </View>
                ))}
            </View>
        );
    };

    // Renderizar conteúdo baseado no passo atual (apenas no mobile)
    const renderStepContent = () => {
        if (isWideLayout) {
            // No desktop, mostrar tudo de uma vez (layout original)
            return renderDesktopLayout();
        }

        // Mobile: renderizar passo a passo
        switch (currentStep) {
            case 'start':
                return renderStartStep();
            case 'service':
                return renderServiceStep();
            case 'menu':
                return renderMenuStep();
            case 'review':
                return renderReviewStep();
            case 'success':
                return renderSuccessStep();
            default:
                return null;
        }
    };
    const renderStartStep = () => (
        <BlurView intensity={60} tint="dark" style={styles.stepCard}>
            <View style={styles.stepHeader}>
                <Ionicons name="restaurant" size={48} color={colors.textOnPrimary} />
                <Text style={styles.stepTitle}>Bem-vindo à Danike!</Text>
                <Text style={styles.stepSubtitle}>
                    Monte seu pedido personalizado em poucos passos. Escolha pizzas artesanais, combos e muito mais.
                </Text>
            </View>

            <View style={styles.startStats}>
                <View style={styles.startStatCard}>
                    <Ionicons name="pizza" size={24} color={colors.textOnPrimary} />
                    <Text style={styles.startStatValue}>18+</Text>
                    <Text style={styles.startStatLabel}>Sabores</Text>
                </View>
                <View style={styles.startStatCard}>
                    <Ionicons name="timer" size={24} color={colors.textOnPrimary} />
                    <Text style={styles.startStatValue}>25min</Text>
                    <Text style={styles.startStatLabel}>Preparo</Text>
                </View>
                <View style={styles.startStatCard}>
                    <Ionicons name="star" size={24} color={colors.textOnPrimary} />
                    <Text style={styles.startStatValue}>4.9</Text>
                    <Text style={styles.startStatLabel}>Avaliação</Text>
                </View>
            </View>

            <View style={styles.startFeatures}>
                <View style={styles.startFeature}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    <Text style={styles.startFeatureText}>Ingredientes frescos e selecionados</Text>
                </View>
                <View style={styles.startFeature}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    <Text style={styles.startFeatureText}>Massa artesanal de fermentação natural</Text>
                </View>
                <View style={styles.startFeature}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    <Text style={styles.startFeatureText}>Delivery rápido ou retire na loja</Text>
                </View>
            </View>

            <ModernButton
                title="Começar meu pedido"
                icon="arrow-forward"
                size="large"
                onPress={goToNextStep}
            />
        </BlurView>
    );

    const renderServiceStep = () => (
        <BlurView intensity={60} tint="dark" style={styles.stepCard}>
            <View style={styles.stepHeader}>
                <Ionicons name="bicycle" size={48} color={colors.textOnPrimary} />
                <Text style={styles.stepTitle}>Como deseja receber?</Text>
                <Text style={styles.stepSubtitle}>
                    Escolha entre delivery ou retirada na loja
                </Text>
            </View>

            <View style={styles.serviceOptions}>
                {(['delivery', 'retirada'] as ServiceMode[]).map((mode) => {
                    const config = serviceConfigurations[mode];
                    const isActive = serviceMode === mode;
                    return (
                        <Pressable
                            key={mode}
                            onPress={() => setServiceMode(mode)}
                            style={[styles.serviceOptionLarge, isActive && styles.serviceOptionLargeActive]}
                        >
                            <Ionicons
                                name={config.icon}
                                size={32}
                                color={isActive ? colors.textOnPrimary : 'rgba(255,255,255,0.7)'}
                            />
                            <Text style={[styles.serviceLabelLarge, isActive && styles.serviceLabelLargeActive]}>
                                {config.label}
                            </Text>
                            <Text style={styles.serviceDescriptionLarge}>{config.description}</Text>
                            <Text style={styles.serviceHighlightLarge}>{config.highlight}</Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Buscador de CEP - aparece apenas quando Delivery está selecionado */}
            {serviceMode === 'delivery' && (
                <View style={styles.cepSection}>
                    <View style={styles.cepHeader}>
                        <Ionicons name="location" size={20} color={colors.textOnPrimary} />
                        <Text style={styles.cepTitle}>Confirmar endereço de entrega</Text>
                    </View>
                    <Text style={styles.cepSubtitle}>
                        Digite seu CEP para verificar se atendemos sua região
                    </Text>

                    <View style={styles.cepInputContainer}>
                        <TextInput
                            style={styles.cepInput}
                            placeholder="00000-000"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={formattedCep}
                            onChangeText={(text) => setCep(text.replace(/\D/g, ''))}
                            keyboardType="numeric"
                            maxLength={9}
                        />
                        <View style={styles.cepButtonWrapper}>
                            <ModernButton
                                title={isLoadingCep ? "Buscando..." : "Buscar"}
                                icon="search"
                                onPress={handleBuscarCEP}
                                disabled={isLoadingCep || cep.length !== 8}
                            />
                        </View>
                    </View>

                    {/* Exibir dados do endereço */}
                    {hasAddress && (
                        <View style={styles.addressResult}>
                            <View style={styles.addressResultHeader}>
                                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                <Text style={styles.addressResultTitle}>Endereço encontrado!</Text>
                            </View>
                            <View style={styles.addressDetails}>
                                <View style={styles.addressRow}>
                                    <Ionicons name="home-outline" size={16} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.addressLabel}>Logradouro:</Text>
                                    <Text style={styles.addressValue}>{endereco.logradouro}</Text>
                                </View>
                                <View style={styles.addressRow}>
                                    <Ionicons name="business-outline" size={16} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.addressLabel}>Bairro:</Text>
                                    <Text style={styles.addressValue}>{endereco.bairro}</Text>
                                </View>
                                <View style={styles.addressRow}>
                                    <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.addressLabel}>Cidade:</Text>
                                    <Text style={styles.addressValue}>{endereco.localidade} - {endereco.uf}</Text>
                                </View>
                            </View>
                            <View style={styles.deliveryConfirmation}>
                                <Ionicons name="bicycle" size={18} color="#4CAF50" />
                                <Text style={styles.deliveryConfirmationText}>
                                    Ótima notícia! Realizamos entregas nesta região 🎉
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            )}

            <View style={styles.stepFooter}>
                <ModernButton
                    title="Voltar"
                    icon="arrow-back"
                    variant="outline"
                    onPress={goToPreviousStep}
                />
                <ModernButton
                    title="Continuar"
                    icon="arrow-forward"
                    onPress={goToNextStep}
                />
            </View>
        </BlurView>
    );

    const renderMenuStep = () => (
        <BlurView intensity={60} tint="dark" style={styles.stepCard}>
            <View style={styles.stepHeaderCompact}>
                <Text style={styles.stepTitleCompact}>Escolha suas pizzas</Text>
                {cartItems.length > 0 && (
                    <View style={styles.cartIndicatorBadge}>
                        <Ionicons name="cart" size={14} color={colors.textOnPrimary} />
                        <Text style={styles.cartIndicatorCount}>
                            {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                        </Text>
                        <View style={styles.cartIndicatorDivider} />
                        <Text style={styles.cartIndicatorTotal}>{formatCurrency(total)}</Text>
                    </View>
                )}
            </View>

            <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar sabor..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
                {categories.map((cat) => (
                    <CategoryPill
                        key={cat.id}
                        {...cat}
                        active={selectedCategory === cat.id}
                        onPress={setSelectedCategory}
                    />
                ))}
            </ScrollView>

            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
                {filteredMenu.map((pizza) => (
                    <Pressable
                        key={pizza.id}
                        onPress={() => handleAddPizza(pizza)}
                        style={styles.menuItemCompact}
                    >
                        <View style={styles.menuIconWrapper}>
                            <Ionicons name="pizza" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.menuCopyCompact}>
                            <Text style={styles.menuTitle}>{pizza.name}</Text>
                            <Text style={styles.menuPriceCompact} numberOfLines={2}>{formatCurrency(pizza.price)}</Text>
                        </View>
                        <Ionicons name="add-circle" size={28} color={colors.primaryLight} />
                    </Pressable>
                ))}
            </ScrollView>

            <View style={styles.stepFooter}>
                <ModernButton
                    title="Voltar"
                    icon="arrow-back"
                    variant="outline"
                    onPress={goToPreviousStep}
                />
                <ModernButton
                    title={`Revisar pedido (${cartItems.length})`}
                    icon="arrow-forward"
                    onPress={goToNextStep}
                    disabled={cartItems.length === 0}
                />
            </View>
        </BlurView>
    );


    const renderReviewStep = () => (
        <BlurView intensity={90} tint="light" style={styles.stepCard}>
            <View style={styles.stepHeaderCompact}>
                <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
                <Text style={styles.stepTitleDark}>Revise seu pedido</Text>
            </View>

            <View style={styles.reviewInfo}>
                <View style={styles.reviewRow}>
                    <Ionicons name={serviceConfigurations[serviceMode].icon} size={20} color={colors.primary} />
                    <Text style={styles.reviewLabel}>{serviceConfigurations[serviceMode].label}</Text>
                </View>
                <View style={styles.reviewRow}>
                    <Ionicons name="timer" size={20} color={colors.primary} />
                    <Text style={styles.reviewLabel}>Tempo estimado: {estimatedTime}</Text>
                </View>
            </View>

            <Text style={styles.reviewSectionTitle}>Itens do pedido</Text>
            <View style={styles.reviewItems}>
                {cartItems.map((item) => (
                    <View key={item.id} style={styles.reviewItem}>
                        <Text style={styles.reviewItemName}>{item.name} x{item.quantity}</Text>
                        <Text style={styles.reviewItemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.reviewSummary}>
                <View style={styles.reviewSummaryRow}>
                    <Text style={styles.reviewSummaryLabel}>Subtotal</Text>
                    <Text style={styles.reviewSummaryValue}>{formatCurrency(subtotal)}</Text>
                </View>
                {discount > 0 && (
                    <View style={styles.reviewSummaryRow}>
                        <Text style={styles.reviewSummaryLabel}>Desconto</Text>
                        <Text style={styles.reviewSummaryDiscount}>-{formatCurrency(discount)}</Text>
                    </View>
                )}
                <View style={styles.reviewSummaryRow}>
                    <Text style={styles.reviewSummaryLabel}>Taxa</Text>
                    <Text style={styles.reviewSummaryValue}>{formatCurrency(serviceFee)}</Text>
                </View>
                <View style={styles.reviewTotalRow}>
                    <Text style={styles.reviewTotalLabel}>Total</Text>
                    <Text style={styles.reviewTotalValue}>{formatCurrency(total)}</Text>
                </View>
            </View>

            <View style={styles.orderNotesBlock}>
                <Text style={styles.orderNotesLabel}>Observações</Text>
                <TextInput
                    style={styles.orderNotesInput}
                    placeholder="Ex: sem cebola, tocar interfone..."
                    placeholderTextColor="rgba(37,41,46,0.35)"
                    value={orderNotes}
                    onChangeText={setOrderNotes}
                    multiline
                />
            </View>

            <View style={styles.stepFooter}>
                <ModernButton
                    title="Voltar"
                    icon="arrow-back"
                    variant="outline"
                    onPress={goToPreviousStep}
                />
                <ModernButton
                    title="Finalizar pedido"
                    icon="checkmark-circle"
                    onPress={finalizeOrder}
                />
            </View>
        </BlurView>
    );

    const renderSuccessStep = () => {
        const handleNewOrder = () => {
            resetCart();
            setCurrentStep('start');
        };

        return (
            <BlurView intensity={80} tint="dark" style={styles.stepCard}>
                <View style={styles.successContent}>
                    <View style={styles.successIconWrapper}>
                        <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
                    </View>
                    
                    <Text style={styles.successTitle}>Pedido confirmado! 🍕</Text>
                    <Text style={styles.successSubtitle}>
                        Seu pedido foi realizado com sucesso e já está sendo preparado com todo carinho.
                    </Text>

                    <View style={styles.successInfo}>
                        <View style={styles.successInfoCard}>
                            <Ionicons name="receipt" size={24} color={colors.primary} />
                            <Text style={styles.successInfoLabel}>Número do pedido</Text>
                            <Text style={styles.successInfoValue}>#{Math.floor(Math.random() * 10000)}</Text>
                        </View>
                        <View style={styles.successInfoCard}>
                            <Ionicons name="timer" size={24} color={colors.primary} />
                            <Text style={styles.successInfoLabel}>Tempo estimado</Text>
                            <Text style={styles.successInfoValue}>{estimatedTime}</Text>
                        </View>
                    </View>

                    <View style={styles.successDetails}>
                        <View style={styles.successDetailRow}>
                            <Ionicons name={serviceConfigurations[serviceMode].icon} size={20} color={colors.textOnPrimary} />
                            <Text style={styles.successDetailText}>{serviceConfigurations[serviceMode].label}</Text>
                        </View>
                        <View style={styles.successDetailRow}>
                            <Ionicons name="wallet" size={20} color={colors.textOnPrimary} />
                            <Text style={styles.successDetailText}>Total: {formatCurrency(total)}</Text>
                        </View>
                        <View style={styles.successDetailRow}>
                            <Ionicons name="pizza" size={20} color={colors.textOnPrimary} />
                            <Text style={styles.successDetailText}>
                                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} {cartItems.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'item' : 'itens'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.successMessage}>
                        <Ionicons name="information-circle" size={20} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.successMessageText}>
                            Você receberá uma notificação quando seu pedido estiver a caminho.
                        </Text>
                    </View>

                    <ModernButton
                        title="Fazer novo pedido"
                        icon="add-circle"
                        size="large"
                        onPress={handleNewOrder}
                    />
                </View>
            </BlurView>
        );
    };

    const renderDesktopLayout = () => (
        <View style={[styles.layout, styles.layoutWide]}>
            <View style={[styles.column, styles.columnLeft]}>
                        <BlurView intensity={60} tint="dark" style={styles.heroCard}>
                            <Text style={styles.heroBadge}>Pedidos online</Text>
                            <Text style={styles.heroTitle}>Monte sua experiência Danike sem sair de casa</Text>
                            <Text style={styles.heroSubtitle}>
                                Escolha pizzas autorais, combos exclusivos e adicionais para surpreender quem você ama.
                            </Text>

                            <View style={styles.serviceToggle}>
                                {(['delivery', 'retirada'] as ServiceMode[]).map((mode) => {
                                    const config = serviceConfigurations[mode];
                                    const isActive = serviceMode === mode;
                                    return (
                                        <Pressable
                                            key={mode}
                                            onPress={() => setServiceMode(mode)}
                                            style={[styles.serviceOption, isActive && styles.serviceOptionActive]}
                                        >
                                            <Ionicons
                                                name={config.icon}
                                                size={20}
                                                color={isActive ? colors.textOnPrimary : colors.textOnPrimary}
                                                style={styles.serviceOptionIcon}
                                            />
                                            <View style={styles.serviceCopy}>
                                                <Text style={[styles.serviceLabel, isActive && styles.serviceLabelActive]}>{config.label}</Text>
                                                <Text style={styles.serviceDescription}>{config.description}</Text>
                                                <Text style={styles.serviceHighlight}>{config.highlight}</Text>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            <View style={styles.heroStatsRow}>
                                <View style={styles.heroStatCard}>
                                    <Text style={styles.heroStatValue}>{estimatedTime}</Text>
                                    <Text style={styles.heroStatLabel}>previsão média</Text>
                                </View>
                                <View style={styles.heroStatCard}>
                                    <Text style={styles.heroStatValue}>{formatCurrency(discount)}</Text>
                                    <Text style={styles.heroStatLabel}>descontos automáticos</Text>
                                </View>
                                <View style={styles.heroStatCard}>
                                    <Text style={styles.heroStatValue}>{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</Text>
                                    <Text style={styles.heroStatLabel}>itens no carrinho</Text>
                                </View>
                            </View>
                        </BlurView>

                        <BlurView intensity={65} tint="dark" style={styles.menuCard}>
                            <View style={styles.menuHeader}>
                                <Text style={styles.sectionTitle}>Selecione suas pizzas favoritas</Text>
                                <View style={styles.searchBar}>
                                    <Ionicons name="search" color={'rgba(255,255,255,0.8)'} size={18} />
                                    <TextInput
                                        placeholder="Buscar sabor ou ingrediente"
                                        placeholderTextColor="rgba(255,255,255,0.65)"
                                        style={styles.searchInput}
                                        value={searchTerm}
                                        onChangeText={setSearchTerm}
                                    />
                                </View>
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoriesRow}
                            >
                                {categories.map((category) => (
                                    <CategoryPill
                                        key={category.id}
                                        id={category.id}
                                        label={category.label}
                                        icon={category.icon}
                                        active={selectedCategory === category.id}
                                        onPress={setSelectedCategory}
                                    />
                                ))}
                            </ScrollView>

                            <View style={styles.menuList}>
                                {filteredMenu.map((pizza) => (
                                    <Pressable
                                        key={pizza.id}
                                        onPress={() => handleAddPizza(pizza)}
                                        style={styles.menuItem}
                                    >
                                        <View style={styles.menuItemHeader}>
                                            <View style={styles.menuIconWrapper}>
                                                <Ionicons name="pizza" size={20} color={colors.primary} />
                                            </View>
                                            <View style={styles.menuCopy}>
                                                <Text style={styles.menuTitle}>{pizza.name}</Text>
                                                <Text style={styles.menuDescription}>{pizza.description}</Text>
                                                <View style={styles.menuMetaRow}>
                                                    <Text style={styles.menuPrice}>{formatCurrency(pizza.price)}</Text>
                                                    <Text style={styles.menuTime}>{pizza.preparationTime}</Text>
                                                    {pizza.spicy && <Badge label="Picante" icon="flame" />}
                                                      {pizza.isNew && <Badge label="Novo" icon="sparkles-outline" />}
                                                    {pizza.highlight && <Badge label={pizza.highlight} icon="star" />}
                                                </View>
                                            </View>
                                        </View>
                                        <Ionicons name="add-circle" size={26} color={colors.primaryLight} />
                                    </Pressable>
                                ))}

                                {filteredMenu.length === 0 && (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="sparkles-outline" size={24} color="rgba(255,255,255,0.7)" />
                                        <Text style={styles.emptyStateText}>
                                            Nenhum resultado para sua busca. Experimente outra combinação ou limpe o filtro.
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </BlurView>

                        <BlurView intensity={55} tint="light" style={styles.comboCard}>
                            <Text style={styles.sectionTitleLight}>Combos e adicionais</Text>
                            <View style={styles.comboList}>
                                {comboDeals.map((combo) => (
                                    <View key={combo.id} style={styles.comboItem}>
                                        <View style={styles.comboIconWrapper}>
                                            <Ionicons name={combo.icon as keyof typeof Ionicons.glyphMap} size={22} color={colors.primary} />
                                        </View>
                                        <View style={styles.comboCopy}>
                                            <Text style={styles.comboTitle}>{combo.title}</Text>
                                            <Text style={styles.comboDescription}>{combo.description}</Text>
                                            <Text style={styles.comboPrice}>{formatCurrency(combo.price)}</Text>
                                        </View>
                                        <Pressable style={styles.comboButton} onPress={() => handleAddCombo(combo.id)}>
                                            <Ionicons name="add" size={18} color={colors.textOnPrimary} />
                                        </Pressable>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.addonRow}>
                                {addOnOptions.map((addon) => (
                                    <Pressable key={addon.id} onPress={() => handleAddAddon(addon.id)} style={styles.addonPill}>
                                        <Ionicons name={addon.icon as keyof typeof Ionicons.glyphMap} size={16} color={colors.primary} />
                                        <Text style={styles.addonText}>{addon.title}</Text>
                                        <Text style={styles.addonPrice}>{formatCurrency(addon.price)}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </BlurView>

                        <BlurView intensity={60} tint="light" style={styles.customCard}>
                            <Text style={styles.sectionTitleLight}>Crie um item personalizado</Text>
                            <View style={styles.customInputsRow}>
                                <View style={styles.customInputWrapper}>
                                    <Text style={styles.customLabel}>Nome</Text>
                                    <TextInput
                                        style={styles.customInput}
                                        placeholder="Pizza autoral, borda special..."
                                        placeholderTextColor="rgba(0,0,0,0.35)"
                                        value={customItemName}
                                        onChangeText={setCustomItemName}
                                    />
                                </View>
                                <View style={styles.customInputWrapperSmall}>
                                    <Text style={styles.customLabel}>Preço (R$)</Text>
                                    <TextInput
                                        style={styles.customInput}
                                        placeholder="49,90"
                                        keyboardType="decimal-pad"
                                        placeholderTextColor="rgba(0,0,0,0.35)"
                                        value={customItemPrice}
                                        onChangeText={setCustomItemPrice}
                                    />
                                </View>
                            </View>
                            <View style={styles.customInputWrapperFull}>
                                <Text style={styles.customLabel}>Observações</Text>
                                <TextInput
                                    style={[styles.customInput, styles.customTextarea]}
                                    placeholder="Ex: massa integral, sem lactose, extra molho..."
                                    placeholderTextColor="rgba(0,0,0,0.35)"
                                    value={customItemNotes}
                                    onChangeText={setCustomItemNotes}
                                    multiline
                                />
                            </View>
                                            <ModernButton
                                                title="Adicionar ao carrinho"
                                                icon="sparkles-outline"
                                                onPress={handleAddCustomItem}
                                                size="medium"
                                            />
                        </BlurView>
                    </View>

                    <View style={[styles.column, isWideLayout && styles.columnRight]}>
                        <BlurView intensity={90} tint="light" style={styles.cartCard}>
                            <Text style={styles.cartTitle}>Seu carrinho</Text>
                            <Text style={styles.cartSubtitle}>
                                Revise os itens antes de finalizar. Ajuste quantidades ou remova o que não quiser.
                            </Text>

                            {cartItems.length === 0 ? (
                                <View style={styles.cartEmptyState}>
                                    <Ionicons name="cart-outline" size={30} color="rgba(37,41,46,0.35)" />
                                    <Text style={styles.cartEmptyText}>
                                        Comece adicionando uma pizza ou selecione um combo especial.
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.cartList}>
                                    {cartItems.map((item) => (
                                        <CartItemRow
                                            key={item.id}
                                            item={item}
                                            onDecrease={() => handleDecreaseItem(item.id)}
                                            onIncrease={() => handleIncreaseItem(item.id)}
                                            onRemove={() => handleRemoveItem(item.id)}
                                        />
                                    ))}
                                </View>
                            )}

                            <View style={styles.orderNotesBlock}>
                                <Text style={styles.orderNotesLabel}>Observações para a cozinha / entrega</Text>
                                <TextInput
                                    style={styles.orderNotesInput}
                                    placeholder="Ex: portaria 2, tocar interfone, sem cebola..."
                                    placeholderTextColor="rgba(37,41,46,0.35)"
                                    value={orderNotes}
                                    onChangeText={setOrderNotes}
                                    multiline
                                />
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Desconto fidelidade</Text>
                                <Text style={styles.summaryValueNegative}>- {formatCurrency(discount)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Taxa de serviço</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(serviceFee)}</Text>
                            </View>
                            {packagingFee > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Embalagem térmica</Text>
                                    <Text style={styles.summaryValue}>{formatCurrency(packagingFee)}</Text>
                                </View>
                            )}

                            <View style={styles.totalRow}>
                                <View>
                                    <Text style={styles.totalLabel}>Total do pedido</Text>
                                    <Text style={styles.totalHelp}>Pagamento na entrega ou via Pix ao confirmar.</Text>
                                </View>
                                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                            </View>

                            <ModernButton
                                title="Finalizar pedido"
                                icon="checkmark-circle"
                                size="large"
                                onPress={finalizeOrder}
                                disabled={!cartItems.length}
                            />
                            <Pressable onPress={resetCart} style={styles.clearCartButton}>
                                <Ionicons name="trash" size={16} color={colors.primary} />
                                <Text style={styles.clearCartLabel}>Limpar carrinho</Text>
                            </Pressable>
                        </BlurView>
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
                {!isWideLayout && currentStep !== 'start' && currentStep !== 'success' && renderStepIndicator()}
                {renderStepContent()}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </LinearGradient>
    );
}

function CategoryPill({ id, label, icon, active, onPress }: CategoryPillProps) {
    return (
        <Pressable
            onPress={() => onPress(id)}
            style={[styles.categoryPill, active && styles.categoryPillActive]}
        >
            <Ionicons
                name={icon}
                size={14}
                color={active ? colors.textOnPrimary : 'rgba(255,255,255,0.7)'}
                style={styles.categoryPillIcon}
            />
            <Text style={[styles.categoryPillLabel, active && styles.categoryPillLabelActive]}>{label}</Text>
        </Pressable>
    );
}

function Badge({ label, icon }: { label: string; icon: keyof typeof Ionicons.glyphMap }) {
    return (
        <View style={styles.badge}>
            <Ionicons name={icon} size={12} color={colors.primary} style={styles.badgeIcon} />
            <Text style={styles.badgeLabel}>{label}</Text>
        </View>
    );
}

function CartItemRow({ item, onDecrease, onIncrease, onRemove }: CartItemRowProps) {
    return (
        <View style={styles.cartItem}>
            <View style={styles.cartItemInfo}>
                <View style={styles.cartItemAvatar}>
                                <Ionicons
                                    name={item.isCombo ? 'gift' : item.isCustom ? 'sparkles-outline' : 'pizza'}
                        size={18}
                        color={colors.primary}
                    />
                </View>
                <View style={styles.cartItemCopy}>
                    <Text style={styles.cartItemTitle}>{item.name}</Text>
                    {item.notes ? <Text style={styles.cartItemNotes}>{item.notes}</Text> : null}
                    <Text style={styles.cartItemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                </View>
            </View>
            <View style={styles.cartItemActions}>
                <Pressable onPress={onDecrease} style={styles.quantityButton}>
                    <Ionicons name="remove" size={16} color={colors.primary} />
                </Pressable>
                <Text style={styles.quantityValue}>{item.quantity}</Text>
                <Pressable onPress={onIncrease} style={styles.quantityButton}>
                    <Ionicons name="add" size={16} color={colors.primary} />
                </Pressable>
                <Pressable onPress={onRemove} style={styles.removeItemButton}>
                    <Ionicons name="close" size={16} color={'rgba(0,0,0,0.65)'} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        paddingBottom: 120,
    },
    layout: {
        flexDirection: 'column',
        gap: 20,
    },
    layoutWide: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 20,
    },
    column: {
        width: '100%',
        gap: 20,
    },
    columnLeft: {
        flex: 7,
    },
    columnRight: {
        flex: 4,
    },
    heroCard: {
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.35)',
        gap: 16,
    },
    heroBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.12)',
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
    serviceToggle: {
        flexDirection: 'row',
        gap: 12,
    },
    serviceOption: {
        flex: 1,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    serviceOptionActive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderColor: 'rgba(255,255,255,0.45)',
    },
    serviceOptionIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    serviceCopy: {
        flex: 1,
    },
    serviceLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        fontSize: 16,
    },
    serviceLabelActive: {
        color: colors.textOnPrimary,
    },
    serviceDescription: {
        color: 'rgba(255,255,255,0.68)',
        fontSize: 13,
        marginTop: 4,
    },
    serviceHighlight: {
        color: colors.textOnPrimary,
        fontSize: 12,
        marginTop: 6,
        fontWeight: '600',
    },
    heroStatsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    heroStatCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    heroStatValue: {
        color: colors.textOnPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    heroStatLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 4,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    menuCard: {
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    menuHeader: {
        gap: 16,
    },
    sectionTitle: {
        color: colors.textOnPrimary,
        fontSize: 22,
        fontWeight: '700',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        gap: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: colors.textOnPrimary,
        fontSize: 15,
    },
    categoriesRow: {
        paddingVertical: 18,
        gap: 12,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        marginRight: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    categoryPillActive: {
        backgroundColor: colors.textOnPrimary,
        borderColor: 'transparent',
    },
    categoryPillIcon: {
        marginRight: 8,
    },
    categoryPillLabel: {
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '600',
    },
    categoryPillLabelActive: {
        color: colors.primary,
    },
    menuList: {
        gap: 14,
    },
    menuItem: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
    },
    menuItemHeader: {
        flexDirection: 'row',
        flex: 1,
        gap: 16,
    },
    menuIconWrapper: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuCopy: {
        flex: 1,
    },
    menuTitle: {
        color: colors.textOnPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    menuDescription: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 13,
        marginTop: 4,
        lineHeight: 18,
    },
    menuMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    menuPrice: {
        color: colors.textOnPrimary,
        fontWeight: '700',
    },
    menuTime: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 4,
    },
    badgeIcon: {
        marginRight: 4,
    },
    badgeLabel: {
        color: colors.textOnPrimary,
        fontSize: 11,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        gap: 12,
    },
    emptyStateText: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 20,
    },
    comboCard: {
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        backgroundColor: 'rgba(255,255,255,0.85)',
        padding: 22,
        gap: 18,
    },
    sectionTitleLight: {
        color: colors.text,
        fontSize: 20,
        fontWeight: '700',
    },
    comboList: {
        gap: 14,
    },
    comboItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.75)',
        gap: 16,
    },
    comboIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,107,53,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    comboCopy: {
        flex: 1,
    },
    comboTitle: {
        color: colors.text,
        fontWeight: '700',
        fontSize: 16,
    },
    comboDescription: {
        color: 'rgba(37,41,46,0.65)',
        fontSize: 13,
        marginTop: 4,
    },
    comboPrice: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: '700',
        marginTop: 6,
    },
    comboButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    addonPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: 'rgba(255,107,53,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,107,53,0.3)',
        gap: 8,
    },
    addonText: {
        color: colors.text,
        fontWeight: '600',
    },
    addonPrice: {
        color: colors.primary,
        fontWeight: '600',
    },
    customCard: {
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 22,
        gap: 18,
    },
    customInputsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    customInputWrapper: {
        flex: 1,
    },
    customInputWrapperSmall: {
        width: 120,
    },
    customInputWrapperFull: {
        width: '100%',
    },
    customLabel: {
        color: 'rgba(37,41,46,0.68)',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
    },
    customInput: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(37,41,46,0.12)',
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.text,
    },
    customTextarea: {
        height: 90,
        textAlignVertical: 'top',
    },
    cartCard: {
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 24,
        gap: 18,
    },
    cartTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
    },
    cartSubtitle: {
        color: 'rgba(37,41,46,0.68)',
        fontSize: 14,
        lineHeight: 20,
    },
    cartEmptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    cartEmptyText: {
        color: 'rgba(37,41,46,0.5)',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    cartList: {
        gap: 14,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(37,41,46,0.08)',
        backgroundColor: colors.surface,
        padding: 16,
        gap: 16,
    },
    cartItemInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        flex: 1,
    },
    cartItemAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,107,53,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartItemCopy: {
        flex: 1,
    },
    cartItemTitle: {
        color: colors.text,
        fontWeight: '700',
        fontSize: 16,
    },
    cartItemNotes: {
        color: 'rgba(37,41,46,0.6)',
        fontSize: 13,
        marginTop: 4,
    },
    cartItemPrice: {
        color: colors.primary,
        fontWeight: '600',
        marginTop: 6,
    },
    cartItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(37,41,46,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,107,53,0.08)',
    },
    quantityValue: {
        fontWeight: '700',
        color: colors.text,
        minWidth: 20,
        textAlign: 'center',
    },
    removeItemButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(37,41,46,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderNotesBlock: {
        gap: 10,
    },
    orderNotesLabel: {
        color: 'rgba(37,41,46,0.7)',
        fontSize: 13,
        fontWeight: '600',
    },
    orderNotesInput: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(37,41,46,0.12)',
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 80,
        textAlignVertical: 'top',
        color: colors.text,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        color: 'rgba(37,41,46,0.65)',
        fontSize: 14,
    },
    summaryValue: {
        color: colors.text,
        fontWeight: '600',
    },
    summaryValueNegative: {
        color: colors.success,
        fontWeight: '600',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: 'rgba(37,41,46,0.1)',
        paddingTop: 16,
    },
    totalLabel: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
    },
    totalHelp: {
        color: 'rgba(37,41,46,0.6)',
        fontSize: 12,
    },
    totalValue: {
        color: colors.primary,
        fontSize: 24,
        fontWeight: '800',
    },
    clearCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'center',
    },
    clearCartLabel: {
        color: colors.primary,
        fontWeight: '600',
    },
    bottomSpacer: {
        height: 120,
    },
    // Step Flow Styles
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCircleActive: {
        backgroundColor: colors.primary,
    },
    stepCircleCompleted: {
        backgroundColor: colors.primaryLight,
    },
    stepLine: {
        width: 30,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 4,
    },
    stepLineActive: {
        backgroundColor: colors.primary,
    },
    stepCard: {
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.35)',
        gap: 20,
        minHeight: 500,
    },
    stepHeader: {
        alignItems: 'center',
        gap: 12,
        paddingBottom: 20,
    },
    stepHeaderCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingBottom: 16,
    },
    stepTitle: {
        color: colors.textOnPrimary,
        fontSize: 26,
        fontWeight: '700',
        textAlign: 'center',
    },
    stepTitleCompact: {
        color: colors.textOnPrimary,
        fontSize: 22,
        fontWeight: '700',
        flex: 1,
    },
    stepTitleDark: {
        color: colors.text,
        fontSize: 22,
        fontWeight: '700',
        flex: 1,
    },
    stepSubtitle: {
        color: 'rgba(255,255,255,0.78)',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
    startStats: {
        flexDirection: 'row',
        gap: 12,
    },
    startStatCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
    },
    startStatValue: {
        color: colors.textOnPrimary,
        fontSize: 20,
        fontWeight: '700',
    },
    startStatLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
    startFeatures: {
        gap: 12,
    },
    startFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 12,
    },
    startFeatureText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 14,
        flex: 1,
    },
    serviceOptions: {
        gap: 16,
    },
    serviceOptionLarge: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
        padding: 24,
        alignItems: 'center',
        gap: 12,
    },
    serviceOptionLargeActive: {
        backgroundColor: 'rgba(255,107,53,0.15)',
        borderColor: colors.primary,
    },
    serviceLabelLarge: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 20,
        fontWeight: '700',
    },
    serviceLabelLargeActive: {
        color: colors.textOnPrimary,
    },
    serviceDescriptionLarge: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        textAlign: 'center',
    },
    serviceHighlightLarge: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    stepFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 'auto',
    },
    cartBadge: {
        backgroundColor: colors.primary,
        color: colors.textOnPrimary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 14,
        fontWeight: '700',
    },
    cartIndicatorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 8,
    },
    cartIndicatorCount: {
        color: colors.textOnPrimary,
        fontSize: 14,
        fontWeight: '700',
    },
    cartIndicatorDivider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    cartIndicatorTotal: {
        color: colors.textOnPrimary,
        fontSize: 16,
        fontWeight: '800',
    },
    menuScroll: {
        maxHeight: 300,
    },
    menuItemCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
        gap: 12,
    },
    menuCopyCompact: {
        flex: 1,
    },
    menuPriceCompact: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '700',
        marginTop: 4,
    },
    sectionSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 12,
    },
    comboListCompact: {
        gap: 12,
        marginBottom: 20,
    },
    comboItemCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 14,
        gap: 12,
    },
    comboCompactCopy: {
        flex: 1,
    },
    comboCompactTitle: {
        color: colors.textOnPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    comboCompactPrice: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '700',
        marginTop: 2,
    },
    reviewInfo: {
        backgroundColor: 'rgba(255,107,53,0.1)',
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    reviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reviewLabel: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    reviewSectionTitle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '700',
        marginTop: 8,
    },
    reviewItems: {
        gap: 8,
    },
    reviewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    reviewItemName: {
        color: colors.text,
        fontSize: 14,
        flex: 1,
    },
    reviewItemPrice: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    reviewSummary: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 16,
        padding: 16,
        gap: 8,
    },
    reviewSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    reviewSummaryLabel: {
        color: 'rgba(37,41,46,0.7)',
        fontSize: 14,
    },
    reviewSummaryValue: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    reviewSummaryDiscount: {
        color: '#22c55e',
        fontSize: 14,
        fontWeight: '600',
    },
    reviewTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 2,
        borderTopColor: 'rgba(0,0,0,0.1)',
        marginTop: 4,
    },
    reviewTotalLabel: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
    },
    reviewTotalValue: {
        color: colors.primary,
        fontSize: 20,
        fontWeight: '800',
    },
    successContent: {
        alignItems: 'center',
        gap: 20,
        paddingVertical: 20,
    },
    successIconWrapper: {
        marginVertical: 20,
    },
    successTitle: {
        color: colors.textOnPrimary,
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
    },
    successSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    successInfo: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
        marginTop: 10,
    },
    successInfoCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
    },
    successInfoLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        textAlign: 'center',
    },
    successInfoValue: {
        color: colors.textOnPrimary,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    successDetails: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    successDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    successDetailText: {
        color: colors.textOnPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    successMessage: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 14,
        width: '100%',
    },
    successMessageText: {
        flex: 1,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        lineHeight: 20,
    },
    // Estilos para o buscador de CEP
    cepSection: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 20,
        marginTop: 20,
        gap: 12,
    },
    cepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cepTitle: {
        color: colors.textOnPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    cepSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        lineHeight: 20,
    },
    cepInputContainer: {
        gap: 12,
        marginTop: 8,
    },
    cepInput: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: colors.textOnPrimary,
        fontSize: 16,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        width: '100%',
    },
    cepButtonWrapper: {
        width: '100%',
    },
    addressResult: {
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginTop: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    addressResultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addressResultTitle: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: '700',
    },
    addressDetails: {
        gap: 10,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addressLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        fontWeight: '600',
        minWidth: 80,
    },
    addressValue: {
        color: colors.textOnPrimary,
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    deliveryConfirmation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderRadius: 12,
        padding: 12,
        marginTop: 4,
    },
    deliveryConfirmationText: {
        color: colors.textOnPrimary,
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
});