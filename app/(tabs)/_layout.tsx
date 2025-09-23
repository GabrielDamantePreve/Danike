import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from '../../theme';

export default function TabLayout() {
  return (
  <Tabs
  screenOptions={{
    tabBarActiveTintColor: '#FFFFFF',
    tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
    headerStyle: {
      backgroundColor: colors.primary,
    },
    headerShadowVisible: false,
    headerTintColor: '#FFFFFF',
    tabBarStyle: {
      backgroundColor: colors.primary,
      borderTopWidth: 0,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      height: 60,
      paddingBottom: 5,
      paddingTop: 5,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
    },
    headerTitleStyle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
  }}
  >
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Início', 
          headerTitle: '🍕 Danike\'s Pizza',
          tabBarIcon: ({color, focused}) => (
            <Ionicons 
              name={focused ? 'pizza' : 'pizza-outline'} 
              color={color} 
              size={focused ? 32 : 28} 
            />
          )
        }}
      />
      <Tabs.Screen 
        name="toDoList" 
        options={{
          title: 'Pedidos',
          headerTitle: '🛒 Fazer Pedido',
          tabBarIcon: ({color, focused}) => (
            <Ionicons 
              name={focused ? 'restaurant' : 'restaurant-outline'} 
              color={color} 
              size={focused ? 32 : 28} 
            />
          ),
        }}
      />
      <Tabs.Screen 
        name="about" 
        options={{
          title: 'Sobre',
          headerTitle: '📖 Nossa História',
          tabBarIcon: ({color, focused}) => (
            <Ionicons 
              name={focused ? 'information-circle' : 'information-circle-outline'} 
              color={color} 
              size={focused ? 32 : 28} 
            />
          ),
        }}
      />
      <Tabs.Screen 
        name="BuscaCep" 
        options={{
          title: 'Entrega',
          headerTitle: '📍 Área de Entrega',
          tabBarIcon: ({color, focused}) => (
            <Ionicons 
              name={focused ? 'location' : 'location-outline'} 
              color={color} 
              size={focused ? 32 : 28} 
            />
          ),
        }}
      />
  </Tabs>
  );
}