import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useBuscaCep } from '@/hooks/useBuscaCep';

export default function BuscaCEP() {
    const { cep, setCep, endereco, buscarCEP } = useBuscaCep();

    return (
        <View style={styles.container}>
            <Text>Consulte seu CEP</Text>

            <TextInput
                style={styles.textInput}
                value={cep}
                onChangeText={setCep}
                placeholder="Digite o CEP"
                keyboardType="numeric"
            />

            <Button
                color="#8B4513"
                title="Buscar"
                onPress={buscarCEP}
            />

            {endereco.logradouro !== '' && (
                <View style={styles.result}>
                    <Text>Logradouro: {endereco.logradouro}</Text>
                    <Text>Bairro: {endereco.bairro}</Text>
                    <Text>Cidade: {endereco.localidade}</Text>
                    <Text>Estado: {endereco.uf}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F39C12',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    textInput: {
        width: '80%',
        borderWidth: 3,
        borderRadius: 8,
        borderColor: '#8B4513',
        padding: 8,
        marginVertical: 10,
    },
    result: {
        marginTop: 20,
        padding: 16,
        borderWidth:3,
        borderColor: '#8B4513',
        borderRadius: 8,
        width: '80%',
    },
});