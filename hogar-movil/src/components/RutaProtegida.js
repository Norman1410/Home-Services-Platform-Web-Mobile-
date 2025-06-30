import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function RutaProtegida({ children }) {
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(true);
  const [usuario, setUsuario] = React.useState(null);

  React.useEffect(() => {
    const checkUsuario = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('usuario');
        if (jsonValue != null) {
          setUsuario(JSON.parse(jsonValue));
        } else {
          navigation.navigate('Login');
        }
      } catch (e) {
        console.error(e);
        navigation.navigate('Login');
      } finally {
        setLoading(false);
      }
    };

    checkUsuario();
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!usuario) {
    // Navegación ya se hizo a Login, aquí no se renderiza nada
    return null;
  }

  return children;
}

export default RutaProtegida;