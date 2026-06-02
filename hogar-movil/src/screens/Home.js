import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    servicio_requerido: '',
    ubicacion: '',
  });
  const [mensaje, setMensaje] = useState('');

  // Cargar usuario desde AsyncStorage al montar
  React.useEffect(() => {
    AsyncStorage.getItem('usuario').then((valor) => {
      if (valor) {
        setUsuario(JSON.parse(valor));
      }
    });
  }, []);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!usuario) {
      Alert.alert('Error', 'No hay usuario autenticado');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post('http://10.0.2.2:4000/api/ofertas', {
        ...formData,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMensaje('✅ Oferta publicada exitosamente');
      setFormData({
        titulo: '',
        descripcion: '',
        servicio_requerido: '',
        ubicacion: '',
      });
    } catch (error) {
      console.error('Error al publicar oferta:', error);
      setMensaje('❌ Error al publicar la oferta');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Publicar una oferta de trabajo</Text>

      <TextInput
        placeholder="Título del trabajo"
        value={formData.titulo}
        onChangeText={(text) => handleChange('titulo', text)}
        style={styles.input}
        required
      />

      <TextInput
        placeholder="Descripción detallada"
        value={formData.descripcion}
        onChangeText={(text) => handleChange('descripcion', text)}
        style={[styles.input, styles.textarea]}
        multiline
        numberOfLines={4}
        required
      />

      <TextInput
        placeholder="Servicio requerido (ej. plomería)"
        value={formData.servicio_requerido}
        onChangeText={(text) => handleChange('servicio_requerido', text)}
        style={styles.input}
        required
      />

      <TextInput
        placeholder="Ubicación"
        value={formData.ubicacion}
        onChangeText={(text) => handleChange('ubicacion', text)}
        style={styles.input}
        required
      />

      <View style={styles.buttonContainer}>
        <Button title="Publicar oferta" onPress={handleSubmit} color="#2563EB" />
      </View>

      {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 16,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  mensaje: {
    color: 'green',
    fontWeight: '600',
    textAlign: 'center',
  },
});
