import { Text, View, StyleSheet } from "react-native";
import { Link } from 'expo-router';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}> 
        Pizzaria do Danike's - Sabor que Conquista!
        {"\n\n"}
        Bem-vindo à Pizzaria do Danike's, onde cada fatia é uma experiência única de sabor e qualidade! Nossa paixão pela culinária italiana se une à criatividade brasileira para oferecer pizzas artesanais, feitas com ingredientes frescos e um toque especial de amor.
        {"\n\n"}
        🍕 Nossos Destaques:
        {"\n\n"}
        🔥 Forno a Lenha: Assamos nossas pizzas no forno tradicional, garantindo aquela crosta perfeita e aroma irresistível.
        {"\n\n"}
        🎉 Ambiente Aconchegante: Ideal para encontros em família, happy hours com amigos ou até mesmo um jantar romântico. E se preferir, levamos o sabor até você com delivery rápido e quentinho!
        {"\n\n"}
        📍 Visite-nos e descubra por que a Pizzaria do Danike's é a preferida da cidade! Sabor que une, momento que emociona.
        {"\n\n"}
        📞 Faça seu pedido agora na aba de Pedidos!
        {"\n"}
        🛵 Entregamos em toda a região!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F39C12',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#8B4513',
  },
});