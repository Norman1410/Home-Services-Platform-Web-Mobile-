import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Trabajador() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('usuario').then((valor) => {
      if (valor) {
        setUsuario(JSON.parse(valor));
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Bienvenido, {usuario?.nombre || 'Usuario'}
      </Text>
      <Text style={styles.subtitle}>Estás dentro del área de trabajador.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
  },
});
