import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Navbar() {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUsuario = async () => {
        const json = await AsyncStorage.getItem('usuario');
        setUsuario(json ? JSON.parse(json) : null);
      };
      fetchUsuario();
    }, [])
  );

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('usuario');
    await AsyncStorage.removeItem('token');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (!usuario) return null;

  return (
    <View style={styles.navbar}>
      <Text style={styles.title}>HogarApp</Text>

      <View style={styles.links}>
        <TouchableOpacity onPress={() => navigation.navigate('Inicio')}>
          <Text style={styles.link}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
          <Text style={styles.link}>Perfil</Text>
        </TouchableOpacity>

        {usuario.rol === 'cliente' && (
          <TouchableOpacity onPress={() => navigation.navigate('Trabajadores')}>
            <Text style={styles.link}>Trabajadores</Text>
          </TouchableOpacity>
        )}

        {usuario.rol === 'trabajador' && (
          <TouchableOpacity onPress={() => navigation.navigate('Trabajos')}>
            <Text style={styles.link}>Trabajos</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={cerrarSesion}>
          <Text style={[styles.link, styles.logout]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB', // Azul
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  link: {
    marginLeft: 10,
    fontSize: 16,
    color: '#374151', // Gris oscuro
  },
  logout: {
    color: '#DC2626', // Rojo
  },
});
