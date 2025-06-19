import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { subirImagenPerfil } from '../api/storage';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState('');
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState('');

  // Obtener usuario desde localStorage
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));
  const usuarioId = usuarioGuardado?.id || null;

  useEffect(() => {
    if (!usuarioId) {
      console.error('No se encontró el ID del usuario en localStorage');
      return;
    }

    const cargarPerfil = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/usuarios/${usuarioId}`);
        setUsuario(res.data);
        setNombre(res.data.nombre);
        setPreview(res.data.foto_url || '');
      } catch (err) {
        console.error('Error al cargar perfil:', err);
      }
    };

    cargarPerfil();
  }, [usuarioId]);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleGuardar = async () => {
    try {
      let foto_url = usuario.foto_url;

      if (imagen) {
        // Subir imagen al storage y obtener URL
        foto_url = await subirImagenPerfil(imagen, usuarioId);
      }

      const res = await axios.put(`http://localhost:4000/api/usuarios/${usuarioId}`, {
        nombre,
        foto_url,
      });

      setUsuario(res.data);
      alert('Perfil actualizado correctamente');
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      alert('Error al actualizar el perfil');
    }
  };

  if (!usuario) return <p>Cargando perfil...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Perfil</h2>
      <div>
        <img
          src={preview || 'https://via.placeholder.com/150'}
          alt="Foto de perfil"
          style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: '50%' }}
        />
      </div>
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div>
        <label>Imagen nueva:</label>
        <input type="file" accept="image/*" onChange={handleImagenChange} />
      </div>
      <button onClick={handleGuardar}>Guardar cambios</button>
    </div>
  );
};

export default Perfil;
