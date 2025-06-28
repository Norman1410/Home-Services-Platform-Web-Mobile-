import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

function DetalleCliente() {
  const route = useRoute();
  const { id } = route.params;

  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const res = await axios.get(`http://10.0.2.2:4000/api/usuarios/${id}`); // Cambia IP si estás en dispositivo real
        setCliente(res.data);
        setCargando(false);
      } catch (err) {
        console.warn('❌ Primer intento fallido. Reintentando en 1 segundo...');
        setTimeout(async () => {
          try {
            const res = await axios.get(`http://10.0.2.2:4000/api/usuarios/${id}`);
            setCliente(res.data);
          } catch (err2) {
            console.error('❌ Segundo intento fallido:', err2);
            setError(true);
          } finally {
            setCargando(false);
          }
        }, 1000);
      }
    };

    fetchCliente();
  }, [id]);

  const reintentar = () => {
    setError(false);
    setCargando(true);
    setCliente(null);
    // Vuelve a ejecutar el efecto
    const fetchAgain = async () => {
      try {
        const res = await axios.get(`http://10.0.2.2:4000/api/usuarios/${id}`);
        setCliente(res.data);
      } catch (e) {
        setError(true);
      } finally {
        setCargando(false);
      }
    };
    fetchAgain();
  };

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.infoText}>⏳ Cargando perfil del cliente...</Text>
      </View>
    );
  }

  if (error || !cliente) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>❌ No se pudo cargar el perfil del cliente.</Text>
        <Button title="Reintentar" onPress={reintentar} color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <Image
          source={{
            uri: cliente.foto_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          }}
          style={styles.avatar}
        />
        <Text style={styles.nombre}>{cliente.nombre}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>📧 Correo:</Text>
        <Text style={styles.info}>{cliente.email}</Text>

        {cliente.telefono && (
          <>
            <Text style={styles.label}>📞 Teléfono:</Text>
            <Text style={styles.info}>{cliente.telefono}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    marginTop: 40,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 9999,
    marginBottom: 10,
  },
  nombre: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  infoText: {
    color: '#2563EB',
    marginTop: 10,
  },
});

export default DetalleCliente;
