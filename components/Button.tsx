import { StyleSheet, View, Pressable, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
    label: string;
    theme?: 'primary';
    onPress?: () => void;
};

export default function Button({ label, theme, onPress }: Props) {
    if (theme === 'primary') {
        return (
            <View style={[styles.buttonContainer,{ borderWidth: 4, borderColor: '#8B4513', borderRadius: 18 }]}>
                <Pressable
                    style={[styles.button, { backgroundColor: '#F39C12' }]} onPress={onPress}>
                    <FontAwesome name="search" size={24} color="#8B4513" style={styles.buttonIcon} />
                    <Text style={[styles.buttonLabel, { color: '#8B4513' }]}>{label}</Text>
                </Pressable>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: 320,
        height: 68,
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    button: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonIcon: {
        paddingRight: 8,
    },
    buttonLabel: {
        color: '#fff',
        fontSize: 16,
    },
});               