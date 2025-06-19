// src/api/storage.js
import { supabase } from '../supabaseClient';

export const subirImagenPerfil = async (archivo, userId) => {
  const fileExt = archivo.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = fileName;

  const { error } = await supabase.storage
    .from('perfil') // nombre del bucket en Supabase Storage
    .upload(filePath, archivo, {
      upsert: true,
      contentType: archivo.type,
    });

  if (error) throw error;

  const { data } = supabase.storage.from('perfil').getPublicUrl(filePath);
  return data.publicUrl;
};
