import { supabase } from '../supabaseClient';
import 'react-native-url-polyfill/auto'; // necesario para Supabase en React Native

export const subirImagenPerfil = async (uri, userId) => {
  // uri = ruta local del archivo (ej. del ImagePicker)
  const fileExt = uri.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = fileName;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('perfil')
    .upload(filePath, blob, {
      upsert: true,
      contentType: blob.type,
    });

  if (error) throw error;

  const { data } = supabase.storage.from('perfil').getPublicUrl(filePath);
  return data.publicUrl;
};
