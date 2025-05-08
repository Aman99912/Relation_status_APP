import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
// import { COLORS } from '../colors';

export default function StartupScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/favicon.png')} style={styles.imageTop} />
      <Image source={require('../assets/startup.png')} style={styles.image} />
      <Text style={styles.title}>Lorem ipsum dolor.</Text>
      <Text style={styles.subtitle}>
        Lorem ipsum dolor sit amet, consectetur do eiusmod tempor incididunt ut labore et dolore
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height:"100%",  backgroundColor: "rgb(255, 255, 255)", alignItems: 'center', justifyContent: 'center', padding: 20 },
  image: { width: 200, height: 200, marginBottom: 30, resizeMode: 'contain' },
  imageTop: { width: 60, height: 60, marginBottom: 60, resizeMode: 'contain' },
  title: { fontSize: 22, fontWeight: 'bold', color: "white", marginBottom: 40 },
  subtitle: { fontSize: 14, color: "gray", textAlign: 'center'  },
  button: { marginTop: 90, backgroundColor: "grey", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  buttonText: { color: '#fff', fontSize: 16 }
});
