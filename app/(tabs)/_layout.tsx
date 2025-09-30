import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, gradients } from '../../theme';

const TAB_CONFIG = {
  index: {
    title: 'Início',
    icon: { focused: 'pizza', unfocused: 'pizza-outline' },
    headerTitle: 'Seja bem-vindo',
    headerSubtitle: 'Crie stickers e viva a experiência Danike',
    headerIcon: 'sparkles-outline',
  },
  toDoList: {
    title: 'Pedidos',
    icon: { focused: 'restaurant', unfocused: 'restaurant-outline' },
    headerTitle: 'Monte seu pedido',
    headerSubtitle: 'Combos, adicionais e fidelidade em um só lugar',
    headerIcon: 'bag-handle-outline',
  },
  about: {
    title: 'Sobre',
    icon: { focused: 'information-circle', unfocused: 'information-circle-outline' },
    headerTitle: 'Nossa história',
    headerSubtitle: 'Conheça a jornada da Pizzaria Danike',
    headerIcon: 'book-outline',
  },
  BuscaCep: {
    title: 'Entrega',
    icon: { focused: 'locate', unfocused: 'locate-outline' },
    headerTitle: 'Cobertura de delivery',
    headerSubtitle: 'Verifique prazos, taxas e vantagens na sua região',
    headerIcon: 'bicycle-outline',
  },
} as const;

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <Tabs
      tabBar={(props) => <StyledTabBar {...props} isWide={isWide} />}
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.textOnPrimary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.65)',
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarButton: undefined,
        headerTintColor: colors.textOnPrimary,
        headerTitle: '',
        headerTransparent: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: TAB_CONFIG.index.title,
          header: () => <AppHeader {...TAB_CONFIG.index} />, 
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.index.icon.focused : TAB_CONFIG.index.icon.unfocused}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="toDoList"
        options={{
          title: TAB_CONFIG.toDoList.title,
          header: () => <AppHeader {...TAB_CONFIG.toDoList} />, 
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.toDoList.icon.focused : TAB_CONFIG.toDoList.icon.unfocused}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: TAB_CONFIG.about.title,
          header: () => <AppHeader {...TAB_CONFIG.about} />, 
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.about.icon.focused : TAB_CONFIG.about.icon.unfocused}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="BuscaCep"
        options={{
          title: TAB_CONFIG.BuscaCep.title,
          header: () => <AppHeader {...TAB_CONFIG.BuscaCep} />, 
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.BuscaCep.icon.focused : TAB_CONFIG.BuscaCep.icon.unfocused}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}

type StyledTabBarProps = BottomTabBarProps & { isWide: boolean };

function StyledTabBar({ state, descriptors, navigation, isWide }: StyledTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { bottom: insets.bottom + 16 }]}>
      <BlurView intensity={90} tint="dark" style={[styles.tabBar, isWide && styles.tabBarWide]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = options.title ?? route.name;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const icon =
            options.tabBarIcon?.({
              focused: isFocused,
              color: isFocused ? colors.textOnPrimary : 'rgba(255,255,255,0.6)',
              size: isFocused ? 28 : 24,
            }) ?? null;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tabItem,
                isFocused && styles.tabItemFocused,
                pressed && styles.tabItemPressed,
              ]}
            >
              <View style={styles.tabIcon}>{icon}</View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>{label}</Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

type HeaderProps = {
  headerTitle: string;
  headerSubtitle: string;
  headerIcon: keyof typeof Ionicons.glyphMap;
};

function AppHeader({ headerTitle, headerSubtitle, headerIcon }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
      <LinearGradient colors={gradients.primary as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
        <View style={styles.headerContainer}>
          <View style={styles.headerIconWrapper}>
            <Ionicons name={headerIcon} size={24} color={colors.textOnPrimary} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="star" size={14} color={colors.primary} />
            <Text style={styles.headerBadgeText}>Danike Experience</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  headerSafeArea: {
    backgroundColor: 'transparent',
  },
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  tabBarWrapper: {
    paddingHorizontal: 18,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  tabBarWide: {
    maxWidth: 720,
    alignSelf: 'center',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    opacity: 0.85,
  },
  tabItemFocused: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    opacity: 1,
  },
  tabItemPressed: {
    transform: [{ scale: 0.97 }],
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  tabLabelFocused: {
    color: colors.textOnPrimary,
  },
  headerGradient: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textOnPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textOnPrimary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  headerBadgeText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});