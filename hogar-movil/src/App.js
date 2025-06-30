import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Pantallas
import Login from './screens/Login';
import Registro from './screens/Registro';
import Home from './screens/Home';
import Perfil from './screens/Perfil';
import Trabajadores from './screens/Trabajadores';
import Trabajos from './screens/Trabajos';
import HomeTrabajador from './screens/HomeTrabajador';
import DetalleTrabajador from './screens/DetalleTrabajador';
import DetalleCliente from './screens/DetalleCliente';

// Navbar persistente
import LayoutPrivado from './components/LayoutPrivado';

const Stack = createNativeStackNavigator();

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerSesion = async () => {
      const json = await AsyncStorage.getItem('usuario');
      setUsuario(json ? JSON.parse(json) : null);
      setCargando(false);
    };
    obtenerSesion();
  }, []);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={usuario ? 'Inicio' : 'Login'}>
        {/* Rutas públicas */}
        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {(props) => <Login {...props} setUsuario={setUsuario} />}
        </Stack.Screen>
        <Stack.Screen name="Registro" component={Registro} />

        {/* Rutas privadas con Navbar */}
        {usuario && (
          <>
            <Stack.Screen name="Inicio" options={{ headerShown: false }}>
              {() => (
                <LayoutPrivado>
                  {usuario.rol === 'trabajador' ? <HomeTrabajador /> : <Home />}
                </LayoutPrivado>
              )}
            </Stack.Screen>

            <Stack.Screen name="Perfil" options={{ headerShown: false }}>
              {() => (
                <LayoutPrivado>
                  <Perfil />
                </LayoutPrivado>
              )}
            </Stack.Screen>

            <Stack.Screen name="Trabajadores" options={{ headerShown: false }}>
              {() => (
                <LayoutPrivado>
                  <Trabajadores />
                </LayoutPrivado>
              )}
            </Stack.Screen>

            <Stack.Screen name="Trabajos" options={{ headerShown: false }}>
              {() => (
                <LayoutPrivado>
                  <Trabajos />
                </LayoutPrivado>
              )}
            </Stack.Screen>

            <Stack.Screen name="DetalleTrabajador" options={{ headerShown: false }}>
              {() => (
                <LayoutPrivado>
                  <DetalleTrabajador />
                </LayoutPrivado>
              )}
            </Stack.Screen>

            <Stack.Screen name="DetalleCliente" options={{ headerShown: false }}>
              {() => (
                <LayoutPrivado>
                  <DetalleCliente />
                </LayoutPrivado>
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
