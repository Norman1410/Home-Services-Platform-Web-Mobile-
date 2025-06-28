import React from 'react';
import { View, Text, StyleSheet, AsyncStorage } from 'react-native';
import { useEffect, useState } from 'react';

function Cliente() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const data = await AsyncStorage.getItem('usuario');
        if (data) {
          setUsuario(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error al cargar el usuario:', error);
      }
    };

    cargarUsuario();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {usuario?.nombre}</Text>
      <Text style={styles.subtitle}>Estás dentro del área de cliente.</Text>
    </View>
  );
}

export default Cliente;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});
