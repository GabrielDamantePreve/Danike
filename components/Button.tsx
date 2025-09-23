import { StyleSheet, View, Pressable, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '../theme';

type Props = {
    label: string;
    theme?: 'primary';
    onPress?: () => void;
};

export default function Button({ label, theme, onPress }: Props) {
    const isPrimary = theme === 'primary';
    return (
        <View style={[styles.buttonContainer, isPrimary && { borderWidth: 3, borderColor: colors.primaryDark, borderRadius: 18 }]}> 
            <Pressable
                style={[styles.button, { backgroundColor: isPrimary ? colors.primary : colors.surface }]} onPress={onPress}>
                <FontAwesome name="search" size={20} color={isPrimary ? colors.textOnPrimary : colors.primary} style={styles.buttonIcon} />
                <Text style={[styles.buttonLabel, { color: isPrimary ? colors.textOnPrimary : colors.text }]}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: 300,
        height: 60,
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