// components/TrabajadorCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function TrabajadorCard({ data }) {
  const navigation = useNavigation();

  const abrirDetalle = () => {
    navigation.navigate('DetalleTrabajador', { id: data.id });
  };

  return (
    <TouchableOpacity onPress={abrirDetalle} style={styles.card}>
      <Image source={{ uri: data.imagen }} style={styles.image} />
      <Text style={styles.nombre}>{data.nombre}</Text>
      <Text style={styles.text}>{data.servicio}</Text>
      <Text style={styles.text}>₡{data.tarifa}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1F2937',
  },
  text: {
    color: '#4B5563',
  },
});
