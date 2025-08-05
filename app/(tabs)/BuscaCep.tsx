import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBuscaCep } from '@/hooks/useBuscaCep';
import ModernButton from '@/components/ModernButton';

export default function BuscaCEP() {
    const { cep, setCep, endereco, buscarCEP } = useBuscaCep();
    const [isLoading, setIsLoading] = useState(false);

    const handleBuscarCEP = async () => {
        if (cep.length !== 8) {
            Alert.alert('CEP Inválido', 'Por favor, digite um CEP com 8 dígitos');
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

    const formatCEP = (text: string) => {
        // Remove non-numeric characters
        const numeric = text.replace(/\D/g, '');
        
        // Limit to 8 digits
        const limited = numeric.substring(0, 8);
        
        // Format as XXXXX-XXX
        if (limited.length > 5) {
            return `${limited.substring(0, 5)}-${limited.substring(5)}`;
        }
        
        return limited;
    };

    const onCEPChange = (text: string) => {
        const formatted = formatCEP(text);
        setCep(formatted.replace('-', ''));
    };

    return (
        <LinearGradient colors={['#6C5CE7', '#A29BFE', '#74B9FF']} style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="location" size={50} color="white" />
                    </View>
                    <Text style={styles.title}>Consulta de CEP</Text>
                    <Text style={styles.subtitle}>
                        Descubra se entregamos no seu endereço
                    </Text>
                </View>

                {/* Search Section */}
                <View style={styles.searchSection}>
                    <Text style={styles.sectionTitle}>Digite seu CEP</Text>
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="search" size={20} color="#6C5CE7" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                value={formatCEP(cep)}
                                onChangeText={onCEPChange}
                                placeholder="00000-000"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                maxLength={9}
                            />
                        </View>
                    </View>
                    
                    <ModernButton
                        title={isLoading ? "Buscando..." : "Buscar CEP"}
                        icon="search"
                        variant="secondary"
                        size="large"
                        onPress={handleBuscarCEP}
                        disabled={isLoading || cep.length !== 8}
                        style={styles.searchButton}
                    />
                </View>

                {/* Results Section */}
                {endereco.logradouro !== '' && (
                    <View style={styles.resultSection}>
                        <View style={styles.resultHeader}>
                            <Ionicons name="checkmark-circle" size={30} color="#4CAF50" />
                            <Text style={styles.resultTitle}>Endereço Encontrado!</Text>
                        </View>
                        
                        <View style={styles.addressCard}>
                            <View style={styles.addressRow}>
                                <Ionicons name="home" size={20} color="#6C5CE7" />
                                <View style={styles.addressInfo}>
                                    <Text style={styles.addressLabel}>Logradouro</Text>
                                    <Text style={styles.addressValue}>{endereco.logradouro}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.divider} />
                            
                            <View style={styles.addressRow}>
                                <Ionicons name="business" size={20} color="#6C5CE7" />
                                <View style={styles.addressInfo}>
                                    <Text style={styles.addressLabel}>Bairro</Text>
                                    <Text style={styles.addressValue}>{endereco.bairro}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.divider} />
                              <View style={styles.addressRow}>
                                <Ionicons name="business" size={20} color="#6C5CE7" />
                                <View style={styles.addressInfo}>
                                    <Text style={styles.addressLabel}>Cidade</Text>
                                    <Text style={styles.addressValue}>{endereco.localidade}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.divider} />
                            
                            <View style={styles.addressRow}>
                                <Ionicons name="map" size={20} color="#6C5CE7" />
                                <View style={styles.addressInfo}>
                                    <Text style={styles.addressLabel}>Estado</Text>
                                    <Text style={styles.addressValue}>{endereco.uf}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.deliveryInfo}>
                            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                            <Text style={styles.deliveryText}>
                                ✅ Ótima notícia! Entregamos na sua região!
                            </Text>
                        </View>
                    </View>
                )}

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Sobre nossa entrega</Text>
                    <View style={styles.infoCard}>
                        <Ionicons name="time" size={24} color="#6C5CE7" />
                        <Text style={styles.infoText}>Entrega em 30-40 minutos</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Ionicons name="shield-checkmark" size={24} color="#6C5CE7" />
                        <Text style={styles.infoText}>Entrega segura e rastreada</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Ionicons name="card" size={24} color="#6C5CE7" />
                        <Text style={styles.infoText}>Pagamento na entrega ou online</Text>
                    </View>
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
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginTop: 10,
    },
    searchSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: 15,
        borderRadius: 20,
        padding: 25,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D3436',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        padding: 15,
        fontSize: 18,
        color: '#2D3436',
    },
    searchButton: {
        width: '100%',
    },
    resultSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginHorizontal: 15,
        borderRadius: 20,
        padding: 25,
        marginBottom: 20,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginLeft: 10,
    },
    addressCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    addressInfo: {
        marginLeft: 15,
        flex: 1,
    },
    addressLabel: {
        fontSize: 12,
        color: '#636E72',
        fontWeight: '600',
        marginBottom: 3,
    },
    addressValue: {
        fontSize: 16,
        color: '#2D3436',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 5,
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F8F0',
        padding: 15,
        borderRadius: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    deliveryText: {
        fontSize: 16,
        color: '#2E7D32',
        fontWeight: '600',
        marginLeft: 10,
        flex: 1,
    },
    infoSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 15,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 15,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#2D3436',
        marginLeft: 15,
        fontWeight: '500',
    },
    bottomSpacer: {
        height: 30,
    },
});