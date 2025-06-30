import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';

export default function DetalleTrabajador() {
  const route = useRoute();
  const { id } = route.params;

  const [trabajador, setTrabajador] = useState(null);
  const [valoraciones, setValoraciones] = useState([]);
  const [calificacion, setCalificacion] = useState('5');
  const [comentario, setComentario] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const t = await axios.get(`http://10.0.2.2:4000/api/trabajadores/${id}`);
        setTrabajador(t.data);
      } catch (e) {
        console.error('Error al cargar trabajador:', e);
      }

      try {
        const res = await axios.get(`http://10.0.2.2:4000/api/valoraciones/trabajador/${id}`);
        setValoraciones(res.data);
      } catch (err) {
        console.warn('⚠️ Error al cargar valoraciones:', err.message);
        setValoraciones([]);
      }

      setCargando(false);
    };

    cargarDatos();
  }, [id]);

  const enviarValoracion = async () => {
    try {
      await axios.post('http://10.0.2.2:4000/api/valoraciones', {
        trabajador_id: id,
        calificacion: parseInt(calificacion),
        comentario,
      });
      Alert.alert('✅ Valoración enviada');
      setComentario('');
      setCalificacion('5');

      const res = await axios.get(`http://10.0.2.2:4000/api/valoraciones/trabajador/${id}`);
      setValoraciones(res.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar tu valoración');
      console.error('Error al enviar valoración:', error);
    }
  };

  const promedio =
    valoraciones.length > 0
      ? (
          valoraciones.reduce((acc, v) => acc + v.calificacion, 0) /
          valoraciones.length
        ).toFixed(1)
      : null;

  if (cargando || !trabajador) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.infoText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.centered}>
        <Image
          source={{
            uri:
              trabajador.usuarios.foto_url ||
              'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          }}
          style={styles.avatar}
        />
        <Text style={styles.nombre}>{trabajador.usuarios.nombre}</Text>
        <Text style={styles.servicio}>{trabajador.servicio}</Text>
        <Text style={styles.tarifa}>₡{trabajador.tarifa}</Text>
        <Text style={styles.descripcion}>{trabajador.descripcion}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>📧 Correo:</Text>
        <Text>{trabajador.usuarios.email}</Text>
        {trabajador.usuarios.telefono && (
          <>
            <Text style={styles.label}>📱 Teléfono:</Text>
            <Text>{trabajador.usuarios.telefono}</Text>
          </>
        )}
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>Dejar una valoración:</Text>

        <Text style={styles.label}>Calificación (1-5):</Text>
        <TextInput
          value={calificacion}
          keyboardType="numeric"
          onChangeText={setCalificacion}
          style={styles.input}
          maxLength={1}
        />

        <Text style={styles.label}>Comentario:</Text>
        <TextInput
          value={comentario}
          onChangeText={setComentario}
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 80 }]}
        />

        <Button title="Enviar valoración" onPress={enviarValoracion} color="#2563EB" />
      </View>

      <View style={{ marginTop: 30 }}>
        <Text style={styles.sectionTitle}>Valoraciones:</Text>

        {promedio && (
          <Text style={styles.promedio}>
            ⭐ Promedio: <Text style={{ fontWeight: 'bold' }}>{promedio}</Text> / 5
          </Text>
        )}

        {valoraciones.length === 0 ? (
          <Text style={{ fontStyle: 'italic', color: '#6B7280' }}>
            Aún no hay valoraciones.
          </Text>
        ) : (
          valoraciones.map((v, index) => (
            <View key={index} style={styles.valoracion}>
              <Text style={styles.autor}>{v.usuarios?.nombre}</Text>
              <Text style={styles.estrella}>⭐ {v.calificacion}/5</Text>
              <Text>{v.comentario}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    marginBottom: 10,
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  servicio: {
    textAlign: 'center',
    color: '#4B5563',
    marginTop: 4,
  },
  tarifa: {
    textAlign: 'center',
    color: '#059669',
    fontWeight: 'bold',
    marginVertical: 4,
  },
  descripcion: {
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
    color: '#374151',
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    padding: 15,
    borderRadius: 8,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 8,
    color: '#1D4ED8',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 5,
    padding: 8,
    marginVertical: 6,
    backgroundColor: '#FFF',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#111827',
  },
  promedio: {
    color: '#F59E0B',
    marginBottom: 10,
  },
  valoracion: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 10,
  },
  autor: {
    fontWeight: 'bold',
  },
  estrella: {
    color: '#FBBF24',
    marginBottom: 4,
  },
  infoText: {
    marginTop: 8,
    color: '#2563EB',
  },
});
