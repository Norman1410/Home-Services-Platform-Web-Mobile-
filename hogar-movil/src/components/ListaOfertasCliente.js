import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
} from 'react-native';
import axios from 'axios';

function ListaOfertasCliente({ clienteId }) {
  const [ofertas, setOfertas] = useState([]);
  const [aplicacionesPorOferta, setAplicacionesPorOferta] = useState({});

  const cargarOfertas = useCallback(async () => {
    try {
      const res = await axios.get(`http://10.0.2.2:4000/api/ofertas/cliente/${clienteId}`);
      setOfertas(res.data);
    } catch (err) {
      console.error('Error al obtener ofertas del cliente:', err);
    }
  }, [clienteId]);

  useEffect(() => {
    cargarOfertas();
  }, [cargarOfertas]);

  const desactivarOferta = async (id) => {
    try {
      await axios.patch(`http://10.0.2.2:4000/api/ofertas/${id}`, {
        estado: 'inactiva',
      });
      await cargarOfertas();
    } catch (err) {
      console.error('Error al desactivar oferta:', err);
      Alert.alert('Error', 'No se pudo desactivar la oferta');
    }
  };

  const eliminarOferta = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta oferta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`http://10.0.2.2:4000/api/ofertas/${id}`);
              await cargarOfertas();
            } catch (err) {
              console.error('Error al eliminar oferta:', err);
              Alert.alert('Error', 'No se pudo eliminar la oferta');
            }
          },
        },
      ]
    );
  };

  const cargarAplicaciones = async (ofertaId) => {
    if (aplicacionesPorOferta[ofertaId]) {
      setAplicacionesPorOferta((prev) => {
        const copia = { ...prev };
        delete copia[ofertaId];
        return copia;
      });
      return;
    }

    try {
      const res = await axios.get(`http://10.0.2.2:4000/api/aplicaciones/oferta/${ofertaId}`);
      setAplicacionesPorOferta((prev) => ({
        ...prev,
        [ofertaId]: res.data,
      }));
    } catch (err) {
      console.error('Error al obtener aplicaciones:', err);
      Alert.alert('Error', 'No se pudieron cargar las aplicaciones');
    }
  };

  const aceptarAplicacion = async (id, ofertaId) => {
    try {
      await axios.patch(`http://10.0.2.2:4000/api/aplicaciones/${id}/aceptar`);
      await cargarAplicaciones(ofertaId);
      Alert.alert('Éxito', '✅ Trabajador aceptado');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo aceptar la aplicación');
    }
  };

  const rechazarAplicacion = async (id, ofertaId) => {
    try {
      await axios.patch(`http://10.0.2.2:4000/api/aplicaciones/${id}/rechazar`);
      await cargarAplicaciones(ofertaId);
      Alert.alert('Información', '❌ Aplicación rechazada');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo rechazar la aplicación');
    }
  };

  const abrirFichaTrabajador = (id) => {
    const url = `http://10.0.2.2:3000/trabajador/${id}`;
    Linking.openURL(url).catch((err) => {
      console.error('Error al abrir URL:', err);
      Alert.alert('Error', 'No se pudo abrir la ficha del trabajador');
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Mis ofertas publicadas</Text>

      {ofertas.length === 0 ? (
        <Text style={styles.sinOfertas}>Aún no has publicado ninguna oferta.</Text>
      ) : (
        ofertas.map((oferta) => (
          <View key={oferta.id} style={styles.ofertaCard}>
            <Text style={styles.ofertaTitulo}>{oferta.titulo}</Text>
            <Text style={styles.ofertaDescripcion}>{oferta.descripcion}</Text>
            <Text style={styles.ofertaInfo}>
              Servicio: <Text style={styles.strong}>{oferta.servicio_requerido}</Text>
            </Text>
            <Text style={styles.ofertaInfo}>Ubicación: {oferta.ubicacion}</Text>
            <Text style={styles.ofertaInfo}>
              Estado:{' '}
              <Text style={oferta.estado === 'inactiva' ? styles.estadoInactiva : styles.estadoActiva}>
                {oferta.estado}
              </Text>
            </Text>

            <View style={styles.botonesContainer}>
              {oferta.estado === 'pendiente' && (
                <TouchableOpacity
                  onPress={() => desactivarOferta(oferta.id)}
                  style={[styles.boton, styles.botonRojo]}
                >
                  <Text style={styles.botonTexto}>Desactivar</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => eliminarOferta(oferta.id)}
                style={[styles.boton, styles.botonGris]}
              >
                <Text style={styles.botonTextoNegro}>Eliminar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => cargarAplicaciones(oferta.id)}
                style={[styles.boton, styles.botonAzul]}
              >
                <Text style={styles.botonTexto}> 
                  {aplicacionesPorOferta[oferta.id] ? 'Ocultar aplicaciones' : 'Ver aplicaciones'}
                </Text>
              </TouchableOpacity>
            </View>

            {aplicacionesPorOferta[oferta.id] && (
              <View style={styles.aplicacionesContainer}>
                <Text style={styles.subtitulo}>Aplicaciones:</Text>

                {aplicacionesPorOferta[oferta.id].length === 0 ? (
                  <Text style={styles.sinAplicaciones}>Ningún trabajador ha aplicado aún.</Text>
                ) : (
                  aplicacionesPorOferta[oferta.id].map((app) => (
                    <View key={app.id} style={styles.aplicacionCard}>
                      {app.trabajadores && app.trabajadores.usuarios ? (
                        <>
                          <Text>
                            <Text style={styles.strong}>{app.trabajadores.usuarios.nombre}</Text> — {app.trabajadores.servicio}
                            <Text
                              onPress={() => abrirFichaTrabajador(app.trabajadores.id)}
                              style={styles.link}
                            >
                              {' '}
                              Ver ficha
                            </Text>
                          </Text>
                          <Text style={styles.estadoAplicacion}>Estado: {app.estado}</Text>

                          {app.estado === 'pendiente' && (
                            <View style={styles.botonesAplicacion}>
                              <TouchableOpacity
                                onPress={() => aceptarAplicacion(app.id, oferta.id)}
                                style={[styles.boton, styles.botonVerdePeque]}
                              >
                                <Text style={styles.botonTextoPeque}>Aceptar</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => rechazarAplicacion(app.id, oferta.id)}
                                style={[styles.boton, styles.botonRojoPeque]}
                              >
                                <Text style={styles.botonTextoPeque}>Rechazar</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </>
                      ) : (
                        <Text style={styles.aplicacionInvalida}>⚠️ Aplicación inválida o trabajador eliminado</Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingHorizontal: 12,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sinOfertas: {
    fontStyle: 'italic',
    color: '#6B7280',
  },
  ofertaCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  ofertaTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 8,
  },
  ofertaDescripcion: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  ofertaInfo: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  strong: {
    fontWeight: 'bold',
  },
  estadoActiva: {
    color: '#16A34A',
    fontWeight: 'bold',
  },
  estadoInactiva: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  botonesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  boton: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  botonRojo: {
    backgroundColor: '#EF4444',
  },
  botonGris: {
    backgroundColor: '#D1D5DB',
  },
  botonAzul: {
    backgroundColor: '#3B82F6',
  },
  botonTexto: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  botonTextoNegro: {
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
  },
  aplicacionesContainer: {
    marginTop: 12,
    paddingLeft: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  subtitulo: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  sinAplicaciones: {
    fontStyle: 'italic',
    color: '#6B7280',
  },
  aplicacionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  estadoAplicacion: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  botonesAplicacion: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  botonVerdePeque: {
    backgroundColor: '#22C55E',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  botonRojoPeque: {
    backgroundColor: '#DC2626',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  botonTextoPeque: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  aplicacionInvalida: {
    color: '#B91C1C',
    fontStyle: 'italic',
  },
  link: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
});

export default ListaOfertasCliente;
