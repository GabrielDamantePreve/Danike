
import { View, Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

type ModernButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function ModernButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  icon, 
  disabled = false,
  style 
}: ModernButtonProps) {  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return ['#FF6B35', '#FF8E53'] as const;
      case 'secondary':
        return ['#6C5CE7', '#A29BFE'] as const;
      case 'outline':
        return ['transparent', 'transparent'] as const;
      default:
        return ['#FF6B35', '#FF8E53'] as const;
    }
  };
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [styles.button];
    
    if (size === 'small') baseStyles.push(styles.small);
    if (size === 'large') baseStyles.push(styles.large);
    if (variant === 'outline') baseStyles.push(styles.outline);
    if (disabled) baseStyles.push(styles.disabled);
    if (style) baseStyles.push(style);
    
    return baseStyles;
  };
  const getTextStyle = (): TextStyle[] => {
    const baseStyles: TextStyle[] = [styles.text];
    
    if (size === 'small') baseStyles.push(styles.smallText);
    if (size === 'large') baseStyles.push(styles.largeText);
    if (variant === 'outline') baseStyles.push(styles.outlineText);
    if (disabled) baseStyles.push(styles.disabledText);
    
    return baseStyles;
  };

  return (
    <Pressable 
      onPress={onPress} 
      disabled={disabled}
      style={({ pressed }) => [
        ...getButtonStyle(),
        pressed && !disabled && styles.pressed
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.content}>
          {icon && (
            <Ionicons 
              name={icon as any} 
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
              color={variant === 'outline' ? '#FF6B35' : 'white'} 
              style={styles.icon}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginVertical: 5,
  },
  gradient: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
  small: {
    marginVertical: 3,
  },
  large: {
    marginVertical: 8,
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
  outline: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  outlineText: {
    color: '#FF6B35',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
