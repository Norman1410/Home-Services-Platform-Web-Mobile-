// screens/Perfil.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import ListaOfertasCliente from '../components/ListaOfertasCliente'; // deberías adaptarlo también

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [servicio, setServicio] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [preview, setPreview] = useState('');
  const [imagen, setImagen] = useState(null);
  const [valoraciones, setValoraciones] = useState([]);

  const [esTrabajador, setEsTrabajador] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    const cargarUsuario = async () => {
      const json = await AsyncStorage.getItem('usuario');
      const usuarioLocal = JSON.parse(json);
      setUsuarioId(usuarioLocal?.id);
      setEsTrabajador(usuarioLocal?.rol === 'trabajador');
    };
    cargarUsuario();
  }, []);

  useEffect(() => {
    if (!usuarioId) return;

    const cargarPerfil = async () => {
      try {
        const res = await axios.get(`http://10.0.2.2:4000/api/usuarios/${usuarioId}`);
        const data = res.data;
        setUsuario(data);
        setNombre(data.nombre);
        setTelefono(data.telefono || '');
        setPreview(data.foto_url || '');

        if (esTrabajador) {
          const trabajador = data.trabajadores?.[0];
          setServicio(trabajador?.servicio || '');
          setTarifa(trabajador?.tarifa?.toString() || '');
          setDescripcion(trabajador?.descripcion || '');

          if (trabajador?.id) {
            const resVal = await axios.get(`http://10.0.2.2:4000/api/valoraciones/trabajador/${trabajador.id}`);
            setValoraciones(resVal.data);
          }
        }
      } catch (error) {
        console.log('Error al cargar perfil', error);
      }
    };

    cargarPerfil();
  }, [usuarioId, esTrabajador]);

  const seleccionarImagen = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!res.canceled) {
      const img = res.assets[0];
      setPreview(img.uri);
      setImagen(img);
    }
  };

  const handleGuardar = async () => {
    try {
      let foto_url = usuario?.foto_url;

      if (imagen) {
        // Simula subida de imagen al servidor, deberías reemplazar esto con tu función real
        const base64 = imagen.base64;
        const nombreArchivo = `perfil_${usuarioId}.jpg`;
        const subida = await axios.post('http://10.0.2.2:4000/api/upload', {
          nombre: nombreArchivo,
          base64,
        });
        foto_url = subida.data.url;
      }

      const payload = { nombre, telefono, foto_url };

      if (esTrabajador) {
        payload.servicio = servicio;
        payload.tarifa = tarifa;
        payload.descripcion = descripcion;
      }

      const res = await axios.put(`http://10.0.2.2:4000/api/usuarios/${usuarioId}`, payload);
      setUsuario(res.data);
      Alert.alert('✅', 'Perfil actualizado correctamente');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  const promedio = valoraciones.length
    ? (valoraciones.reduce((acc, v) => acc + v.calificacion, 0) / valoraciones.length).toFixed(1)
    : null;

  if (!usuario) return <Text style={{ textAlign: 'center', marginTop: 20 }}>Cargando perfil...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      <TouchableOpacity onPress={seleccionarImagen}>
        <Image
          source={{ uri: preview || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.imageText}>Cambiar imagen</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre"
      />
      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="Teléfono"
        keyboardType="phone-pad"
      />

      {esTrabajador && (
        <>
          <TextInput
            style={styles.input}
            value={servicio}
            onChangeText={setServicio}
            placeholder="Servicio"
          />
          <TextInput
            style={styles.input}
            value={tarifa}
            onChangeText={setTarifa}
            placeholder="Tarifa ₡"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Descripción"
            multiline
          />
        </>
      )}

      <Button title="Guardar cambios" onPress={handleGuardar} color="#2563EB" />

      {esTrabajador && (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.subtitle}>Valoraciones:</Text>
          {valoraciones.length === 0 ? (
            <Text style={styles.textGray}>Aún no hay valoraciones</Text>
          ) : (
            <>
              <Text style={styles.textYellow}>⭐ Promedio: {promedio} / 5</Text>
              {valoraciones.map((v, i) => (
                <View key={i} style={styles.reviewBox}>
                  <Text style={styles.bold}>{v.usuarios.nombre}</Text>
                  <Text>⭐ {v.calificacion}/5</Text>
                  <Text>{v.comentario}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      {!esTrabajador && (
        <View style={{ marginTop: 24 }}>
          <ListaOfertasCliente clienteId={usuarioId} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 8,
  },
  imageText: {
    textAlign: 'center',
    color: '#2563EB',
    marginBottom: 16,
  },
  textGray: {
    color: '#6B7280',
  },
  textYellow: {
    color: '#CA8A04',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  reviewBox: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
});
