import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTarefas } from '@/hooks/useTarefas';
import ModernButton from '@/components/ModernButton';
import { parseBrazilianPrice, colors } from '../../theme';

const pizzaMenu = [
  { id: '1', name: 'Margherita', price: 35.90, description: 'Molho, mussarela, manjericão' },
  { id: '2', name: 'Portuguesa', price: 42.90, description: 'Presunto, ovos, cebola, azeitonas' },
  { id: '3', name: 'Calabresa', price: 38.90, description: 'Calabresa, cebola, azeitonas' },
  { id: '4', name: 'Pepperoni', price: 44.90, description: 'Pepperoni, mussarela, oregano' },
  { id: '5', name: 'Quatro Queijos', price: 46.90, description: 'Mussarela, parmesão, gorgonzola, provolone' },
  { id: '6', name: 'Frango Catupiry', price: 43.90, description: 'Frango desfiado, catupiry, milho' },
];

export default function App() {
    const { tarefas, novaTarefa, setNovaTarefa, adicionarTarefa, removeTarefa } = useTarefas();
    const [orderTotal, setOrderTotal] = useState(0);
    const [selectedPizzas, setSelectedPizzas] = useState<{[key: string]: number}>({});

    const addPizzaToOrder = (pizza: typeof pizzaMenu[0]) => {
        const orderText = `${pizza.name} - R$ ${pizza.price.toFixed(2).replace('.', ',')}`;
        setNovaTarefa(orderText);
        adicionarTarefa();

        // Update selected pizzas count
        setSelectedPizzas(prev => ({
            ...prev,
            [pizza.id]: (prev[pizza.id] || 0) + 1
        }));

        // Update total
        setOrderTotal(prev => +(prev + pizza.price).toFixed(2));
    };

    const removeOrderItem = (itemId: string, itemText: string) => {
        // Use helper to parse price
        const price = parseBrazilianPrice(itemText ?? '') ?? 0;
        setOrderTotal(prev => Math.max(0, +(prev - price).toFixed(2)));

        // Update selected pizzas count (only for predefined pizzas)
        const pizzaName = (itemText || '').split(' - R$')[0];
        const pizza = pizzaMenu.find(p => p.name === pizzaName);
        if (pizza) {
            setSelectedPizzas(prev => {
                const newCount = Math.max(0, (prev[pizza.id] || 0) - 1);
                if (newCount === 0) {
                    const { [pizza.id]: removed, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [pizza.id]: newCount };
            });
        }

        // Remove the item from the list
        removeTarefa(itemId);
    };

    const addCustomOrder = () => {
        if (novaTarefa.trim() === '') return;
        
        // Check if custom order has price format, if not, ask user to include price
        const priceMatch = novaTarefa.match(/R\$ ([\d,]+\.\d{2})/);
        if (priceMatch) {
            const price = parseFloat(priceMatch[1].replace(',', ''));
            setOrderTotal(prev => prev + price);
        } else {
            Alert.alert(
                'Formato de Preço', 
                'Para pedidos personalizados, inclua o preço no formato: "Nome do Item - R$ XX,XX"',
                [{ text: 'OK' }]
            );
            return;
        }
        
        adicionarTarefa();
    };const finalizarPedido = () => {
        if (tarefas.length === 0) {
            Alert.alert('Carrinho Vazio', 'Adicione pelo menos uma pizza ao seu pedido!');
            return;
        }
        
        Alert.alert(
            'Pedido Confirmado! 🍕',
            `Total: R$ ${orderTotal.toFixed(2)}\n\nSeu pedido será entregue em 30-40 minutos!`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Clear the cart by removing all items one by one
                        const itemsToRemove = [...tarefas];
                        itemsToRemove.forEach(item => removeTarefa(item.id));
                        setOrderTotal(0);
                        setSelectedPizzas({});
                    }
                }
            ]
        );
    };
    
    return (
        <LinearGradient colors={[colors.primary, colors.accent]} style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>🍕 Cardápio Digital</Text>
                    <Text style={styles.subtitle}>Escolha suas pizzas favoritas</Text>
                </View>

                {/* Pizza Menu */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Nossas Pizzas</Text>
                    {pizzaMenu.map((pizza) => (
                        <View key={pizza.id} style={styles.pizzaCard}>
                            <View style={styles.pizzaInfo}>
                                <View style={styles.pizzaIconContainer}>
                                    <Ionicons name="pizza" size={24} color={colors.primary} />
                                </View>
                                <View style={styles.pizzaDetails}>
                                    <Text style={styles.pizzaName}>{pizza.name}</Text>
                                    <Text style={styles.pizzaDescription}>{pizza.description}</Text>
                                    <Text style={styles.pizzaPrice}>R$ {pizza.price.toFixed(2).replace('.', ',')}</Text>
                                </View>
                            </View>
                            <TouchableOpacity 
                                style={styles.addButton}
                                onPress={() => addPizzaToOrder(pizza)}
                            >
                                <Ionicons name="add" size={20} color="white" />
                                {selectedPizzas[pizza.id] && (
                                    <View style={styles.countBadge}>
                                        <Text style={styles.countText}>{selectedPizzas[pizza.id]}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Custom Order Input */}
                <View style={styles.customOrderSection}>
                    <Text style={styles.sectionTitle}>Pedido Personalizado</Text>
                    <View style={styles.inputContainer}>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Ex: Pizza Especial - R$ 50,00" 
                            placeholderTextColor="#999"
                            value={novaTarefa} 
                            onChangeText={setNovaTarefa} 
                        />                        <TouchableOpacity style={styles.addCustomButton} onPress={addCustomOrder}>
                                    <Ionicons name="add-circle" size={30} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Order Summary */}
                {tarefas.length > 0 && (
                    <View style={styles.orderSummary}>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.sectionTitle}>Seu Pedido</Text>
                            <View style={styles.totalContainer}>
                                <Text style={styles.totalText}>Total: R$ {orderTotal.toFixed(2)}</Text>
                            </View>
                        </View>
                            <FlatList 
                            data={tarefas} 
                            keyExtractor={(item) => item.id} 
                            scrollEnabled={false}
                            renderItem={({ item }) => ( 
                                <View style={styles.orderItem}> 
                                    <View style={styles.orderItemInfo}>
                                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                        <Text style={styles.orderItemText}>{item.texto}</Text>
                                    </View>
                                    <TouchableOpacity 
                                        onPress={() => removeOrderItem(item.id, item.texto)}
                                        style={styles.removeButton}
                                    > 
                                        <Ionicons name="trash-outline" size={18} color="#FF4757" />
                                    </TouchableOpacity> 
                                </View>
                            )}
                        />
                        
                        <ModernButton
                            title="Finalizar Pedido"
                            icon="checkmark-circle"
                            size="large"
                            onPress={finalizarPedido}
                            style={styles.finalizeButton}
                        />
                    </View>
                )}

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
        paddingBottom: 20,
        alignItems: 'center',
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: colors.textOnPrimary,
        textAlign: 'center', 
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.95)',
        textAlign: 'center',
        marginTop: 5,
    },
    menuSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: 15,
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    color: colors.text,
        marginBottom: 15,
        textAlign: 'center',
    },
    pizzaCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    pizzaInfo: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },
    pizzaIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF5F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    pizzaDetails: {
        flex: 1,
    },
    pizzaName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D3436',
        marginBottom: 3,
    },
    pizzaDescription: {
        fontSize: 12,
    color: colors.muted,
        marginBottom: 5,
    },
    pizzaPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
    backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    countBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF4757',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
    color: colors.textOnPrimary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    customOrderSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: 15,
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
    },
    inputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center',
    },
    input: { 
        flex: 1, 
        borderWidth: 2, 
        borderColor: '#E0E0E0', 
        backgroundColor: 'white',
        padding: 15, 
        borderRadius: 15, 
        marginRight: 10,
        fontSize: 16,
    },
    addCustomButton: {
        padding: 5,
    },
    orderSummary: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: 15,
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    totalContainer: {
        backgroundColor: colors.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    totalText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    orderItem: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
    backgroundColor: colors.surfaceAlt, 
        padding: 15, 
        marginBottom: 8, 
        borderRadius: 12,
        borderLeftWidth: 4,
    borderLeftColor: colors.success,
    },
    orderItemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    orderItemText: { 
        fontSize: 14,
    color: colors.text,
        marginLeft: 10,
        flex: 1,
    },
    removeButton: {
        padding: 8,
        borderRadius: 20,
    backgroundColor: '#FFE0E0',
    },
    finalizeButton: {
        marginTop: 15,
    },
    bottomSpacer: {
        height: 30,
    },
});