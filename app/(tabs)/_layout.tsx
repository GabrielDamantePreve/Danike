import { Tabs } from "expo-router";
import  Ionicons  from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
  return (
  <Tabs
  screenOptions={{
    tabBarActiveTintColor: '#FFFFFF',
    headerStyle: {
      backgroundColor: '#F39C12',
    },
    headerShadowVisible: false,
    headerTintColor: '#FFFFFF',
    tabBarStyle: {
      backgroundColor: '#8B4513',
    },
  }}
  >
      <Tabs.Screen name="index" 
      options={{title: 'Início', tabBarIcon: ({color, focused}) => (
        <Ionicons name={focused ? 'pizza' : 'pizza-outline'} color={color} size={30} />
      )
      }}/>
      <Tabs.Screen name="about" 
      options={{title: 'Sobre', tabBarIcon: ({color, focused}) => (
        <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={30} />
      ),
      }}/>
      <Tabs.Screen name="toDoList" 
      options={{title: 'Pedidos', tabBarIcon: ({color, focused}) => (
        <Ionicons name={focused ? 'list' : 'list'} color={color} size={30} />
      ),
      }}/>
      <Tabs.Screen name="BuscaCep" 
      options={{title: 'Buscador de CEP', tabBarIcon: ({color, focused}) => (
        <Ionicons name={focused ? 'earth' : 'earth-outline'} color={color} size={30} />
      ),
      }}/>
  </Tabs>
  );
}