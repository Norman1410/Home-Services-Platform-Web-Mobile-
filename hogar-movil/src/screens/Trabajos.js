import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet 
} from 'react-native';
import axios from 'axios';

export default function Trabajos() {
  const usuario = JSON.parse(localStorage.getItem('usuario')); // En React Native usar AsyncStorage (más abajo comento)

  const [ofertas, setOfertas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [aplicando, setAplicando] = useState(null);
  const [aplicaciones, setAplicaciones] = useState([]);

  // En React Native no hay localStorage, se usa AsyncStorage (asíncrono).
  // Aquí asumo que tienes el usuario en alguna parte. Si usas AsyncStorage, 
  // deberías obtenerlo con useEffect y async/await.
  // Para demo, lo dejo así, pero recuerda adaptar el almacenamiento.

  const obtenerAplicaciones = useCallback(async () => {
    try {
      const resUsuario = await axios.get(`http://10.0.2.2:4000/api/usuarios/${usuario.id}`);
      const trabajador_id = resUsuario.data.trabajadores?.[0]?.id;

      if (trabajador_id) {
        const resAplicaciones = await axios.get('http://10.0.2.2:4000/api/aplicaciones');
        const aplicadas = resAplicaciones.data.filter(
          (app) => app.trabajador_id === trabajador_id
        );
        setAplicaciones(aplicadas);
      }
    } catch (error) {
      console.error('Error al cargar aplicaciones:', error);
    }
  }, [usuario.id]);

  useEffect(() => {
    const obtenerOfertas = async () => {
      try {
        const res = await axios.get('http://10.0.2.2:4000/api/ofertas');
        const activas = res.data.filter((oferta) => oferta.estado !== 'inactiva');
        setOfertas(activas);
      } catch (error) {
        console.error('Error al obtener ofertas:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerOfertas();
    obtenerAplicaciones();
  }, [obtenerAplicaciones]);

  const aplicarAOferta = async (oferta_id) => {
    try {
      setAplicando(oferta_id);

      const res = await axios.get(`http://10.0.2.2:4000/api/usuarios/${usuario.id}`);
      const trabajador_id = res.data.trabajadores?.[0]?.id;

      if (!trabajador_id) {
        Alert.alert('Error', 'No se pudo identificar al trabajador');
        return;
      }

      await axios.post('http://10.0.2.2:4000/api/aplicaciones/aplicar', {
        oferta_id,
        trabajador_id,
      });

      Alert.alert('Éxito', '✅ Aplicaste correctamente a esta oferta');

      setAplicaciones((prev) => [...prev, { oferta_id, estado: 'pendiente' }]);
    } catch (err) {
      console.error('Error al aplicar:', err);
      Alert.alert('Error', err.response?.data?.error || 'No se pudo aplicar a la oferta');
    } finally {
      setAplicando(null);
    }
  };

  const ofertasFiltradas = ofertas.filter((oferta) => {
    const texto = `${oferta.titulo} ${oferta.descripcion} ${oferta.servicio_requerido}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const renderItem = ({ item: oferta }) => {
    const app = aplicaciones.find(
      (a) => a.oferta_id === oferta.id || a.ofertas_trabajo?.id === oferta.id
    );

    return (
      <View style={styles.card}>
        <Text style={styles.titulo}>{oferta.titulo}</Text>
        <Text style={styles.descripcion}>{oferta.descripcion}</Text>
        <Text style={styles.info}>Servicio: {oferta.servicio_requerido}</Text>
        <Text style={styles.info}>Ubicación: {oferta.ubicacion}</Text>
        <Text style={styles.info}>
          Publicado:{' '}
          {oferta.fecha_creacion
            ? new Date(oferta.fecha_creacion).toLocaleDateString()
            : 'Fecha no disponible'}
        </Text>

        {app ? (
          <View
            style={[
              styles.estado,
              app.estado === 'aceptada'
                ? styles.estadoAceptada
                : app.estado === 'rechazada'
                ? styles.estadoRechazada
                : styles.estadoPendiente,
            ]}
          >
            <Text style={styles.estadoTexto}>
              {app.estado === 'aceptada'
                ? '✔️ Aceptado'
                : app.estado === 'rechazada'
                ? '❌ Rechazado'
                : 'Aplicado'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => aplicarAOferta(oferta.id)}
            disabled={aplicando === oferta.id}
            style={[
              styles.botonAplicar,
              aplicando === oferta.id && styles.botonDisabled,
            ]}
          >
            <Text style={styles.textoBoton}>
              {aplicando === oferta.id ? 'Aplicando...' : 'Aplicar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!usuario) {
    return (
      <View style={styles.cargandoContainer}>
        <Text>Por favor inicia sesión para ver esta pantalla.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ofertas de trabajo disponibles</Text>

      <TextInput
        placeholder="Buscar por título, descripción o servicio..."
        style={styles.input}
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {cargando ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : ofertasFiltradas.length === 0 ? (
        <Text style={styles.sinResultados}>No se encontraron ofertas.</Text>
      ) : (
        <FlatList
          data={ofertasFiltradas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#2563eb' },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2, // sombra en Android
    shadowColor: '#000', // sombra en iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
  descripcion: { marginTop: 6, color: '#4b5563' },
  info: { marginTop: 4, color: '#6b7280', fontSize: 12 },
  estado: {
    marginTop: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    width: 90,
  },
  estadoAceptada: { backgroundColor: '#16a34a' }, // verde
  estadoRechazada: { backgroundColor: '#dc2626' }, // rojo
  estadoPendiente: { backgroundColor: '#9ca3af' }, // gris
  estadoTexto: { color: 'white', fontWeight: 'bold' },
  botonAplicar: {
    marginTop: 10,
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  botonDisabled: {
    backgroundColor: '#4ade80',
  },
  textoBoton: { color: 'white', fontWeight: 'bold' },
  sinResultados: { textAlign: 'center', color: '#6b7280', marginTop: 20 },
  cargandoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
