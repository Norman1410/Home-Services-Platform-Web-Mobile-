// screens/Trabajadores.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import TrabajadorCard from '../components/TrabajadorCard'; // Debes adaptarlo también

export default function Trabajadores() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axios
      .get('http://10.0.2.2:4000/api/trabajadores')
      .then((res) => {
        setTrabajadores(res.data);
        setFiltrados(res.data);
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error al cargar trabajadores:', err);
        setCargando(false);
      });
  }, []);

  useEffect(() => {
    const termino = busqueda.toLowerCase();
    const resultado = trabajadores.filter((t) => {
      const nombre = t.usuarios?.nombre?.toLowerCase() || '';
      const servicio = t.servicio?.toLowerCase() || '';
      const tarifa = t.tarifa?.toString() || '';
      return (
        nombre.includes(termino) ||
        servicio.includes(termino) ||
        tarifa.includes(termino)
      );
    });
    setFiltrados(resultado);
  }, [busqueda, trabajadores]);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre, servicio o tarifa..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {filtrados.length === 0 ? (
        <Text style={styles.noResults}>No se encontraron resultados.</Text>
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TrabajadorCard
              data={{
                id: item.id,
                nombre: item.usuarios?.nombre || 'Nombre no disponible',
                servicio: item.servicio,
                tarifa: item.tarifa,
                imagen: item.usuarios?.foto_url || 'https://via.placeholder.com/150',
              }}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    flex: 1,
  },
  input: {
    backgroundColor: '#FFF',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  noResults: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 16,
  },
  list: {
    paddingBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
