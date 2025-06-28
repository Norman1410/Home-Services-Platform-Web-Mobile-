import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function HomeTrabajador() {
  const [aplicaciones, setAplicaciones] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const cargarAplicaciones = async () => {
      try {
        const usuario = JSON.parse(await AsyncStorage.getItem('usuario')); // usar AsyncStorage en vez de localStorage
        const resUsuario = await axios.get(`http://10.0.2.2:4000/api/usuarios/${usuario.id}`);
        const tId = resUsuario.data.trabajadores?.[0]?.id;
        if (!tId) return;

        const res = await axios.get('http://10.0.2.2:4000/api/aplicaciones');
        const apps = res.data
          .filter((app) => app.trabajador_id === tId)
          .map((app) => ({
            id: app.id,
            estado: app.estado,
            oferta: app.ofertas_trabajo,
          }));
        setAplicaciones(apps);
      } catch (err) {
        console.error('Error al cargar aplicaciones:', err);
      }
    };

    cargarAplicaciones();
  }, []);

  const desaplicar = async (appId) => {
    Alert.alert(
      'Confirmación',
      '¿Seguro que deseas desaplicar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Desaplicar',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`http://10.0.2.2:4000/api/aplicaciones/${appId}`);
              setAplicaciones((prev) => prev.filter((a) => a.id !== appId));
            } catch (err) {
              console.error('Error al desaplicar:', err);
              Alert.alert('Error', 'No se pudo desaplicar');
            }
          },
        },
      ]
    );
  };

  const pendientes = aplicaciones.filter((a) => a.estado === 'pendiente');
  const aceptadas = aplicaciones.filter((a) => a.estado === 'aceptada');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Tus aplicaciones</Text>

      <View style={styles.section}>
        <Text style={styles.subheader}>⏳ Pendientes</Text>
        {pendientes.length === 0 ? (
          <Text style={styles.emptyText}>No tienes aplicaciones pendientes.</Text>
        ) : (
          pendientes.map((app) => (
            <View key={app.id} style={styles.card}>
              <Text style={styles.title}>{app.oferta.titulo}</Text>
              <Text>{app.oferta.descripcion}</Text>
              <Text style={styles.location}>📍 {app.oferta.ubicacion}</Text>
              <Button
                title="Desaplicar"
                onPress={() => desaplicar(app.id)}
                color="#DC2626"
              />
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>✅ Aceptadas</Text>
        {aceptadas.length === 0 ? (
          <Text style={styles.emptyText}>No tienes aplicaciones aceptadas aún.</Text>
        ) : (
          aceptadas.map((app) => (
            <View key={app.id} style={[styles.card, { backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.title, { color: '#059669' }]}>{app.oferta.titulo}</Text>
              <Text>{app.oferta.descripcion}</Text>
              <Text style={styles.location}>📍 {app.oferta.ubicacion}</Text>

              {app.oferta.cliente_id && (
                <View style={{ marginTop: 8 }}>
                  <Button
                    title="Ver cliente"
                    color="#2563EB"
                    onPress={() =>
                      navigation.navigate('DetalleCliente', {
                        id: app.oferta.cliente_id,
                      })
                    }
                  />
                </View>
              )}
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 20,
  },
  subheader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111827',
  },
  section: {
    marginBottom: 30,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1E40AF',
  },
  location: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
  },
});
