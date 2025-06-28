import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { registrarUsuario } from '../api/auth';

export default function Registro() {
  const [rol, setRol] = useState('cliente');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [servicio, setServicio] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleRegistro = async () => {
    const datos = {
      correo,
      contrasena,
      rol,
      nombre,
      servicio,
      tarifa,
      descripcion,
    };

    try {
      await registrarUsuario(datos);
      Alert.alert('✅ Registro exitoso', 'Ya puedes iniciar sesión');
      setCorreo('');
      setContrasena('');
      setNombre('');
      setServicio('');
      setTarifa('');
      setDescripcion('');
    } catch (error) {
      Alert.alert('❌ Error', error.message || 'No se pudo registrar');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <Text style={styles.label}>Rol:</Text>
      <View style={styles.selectContainer}>
        <TouchableOpacity
          onPress={() => setRol('cliente')}
          style={[styles.option, rol === 'cliente' && styles.selected]}
        >
          <Text style={styles.optionText}>Cliente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setRol('trabajador')}
          style={[styles.option, rol === 'trabajador' && styles.selected]}
        >
          <Text style={styles.optionText}>Trabajador</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
      />

      {rol === 'trabajador' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Servicio (ej. Plomería)"
            value={servicio}
            onChangeText={setServicio}
          />
          <TextInput
            style={styles.input}
            placeholder="Tarifa (₡)"
            value={tarifa}
            onChangeText={setTarifa}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
          />
        </>
      )}

      <Button title="Registrarse" onPress={handleRegistro} color="#2563EB" />

      <Text style={styles.footerText}>
        ¿Ya tienes cuenta? Inicia sesión desde la pantalla de login.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1E3A8A',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  selectContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  option: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  selected: {
    backgroundColor: '#BFDBFE',
    borderColor: '#3B82F6',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
});
