import React from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTarefas } from '@/hooks/useTarefas';

export default function App() {
    const { tarefas, novaTarefa, setNovaTarefa, adicionarTarefa, removeTarefa } = useTarefas();
    
    return (
        <View style={styles.container}> 
                    <View style={styles.inputContainer}> 
                <TextInput 
                    style={styles.input} 
                    placeholder="QUAL SEU PEDIDO?" 
                    value={novaTarefa} 
                    onChangeText={setNovaTarefa} 
                />
                <Button color="#8B4513" title="Adicionar" onPress={adicionarTarefa}/> 
            </View>

            <FlatList 
                data={tarefas} 
                keyExtractor={(item) => item.id} 
                renderItem={({ item }) => ( 
                    <View style={styles.tarefaContainer}> 
                        <Text style={styles.tarefaTexto}>{item.texto}</Text>
                        <TouchableOpacity onPress={() => removeTarefa(item.id)}> 
                            <Text style={styles.remover}>X</Text> 
                        </TouchableOpacity> 
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: '#F39C12' 
    },
    titulo: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: 20, 
    },
    inputContainer: { 
        flexDirection: 'row', 
        marginBottom: 10 
    },
    input: { 
        flex: 1, 
        borderWidth: 3, 
        borderColor: '#8B4513', 
        padding: 10, 
        borderRadius: 5, 
        marginRight: 10 
    },
    tarefaContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        backgroundColor: '#8B4513', 
        padding: 15, 
        marginBottom: 5, 
        borderRadius: 5, 
        shadowColor: '#000', 
        shadowOpacity: 0.1, 
        shadowRadius: 3, 
        elevation: 2 
    },
    tarefaTexto: { 
        fontSize: 16 
    },
    remover: { 
        fontSize: 18, 
        color: '#F39C12' 
    },
});