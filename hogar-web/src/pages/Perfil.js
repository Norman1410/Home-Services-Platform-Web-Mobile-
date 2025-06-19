import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { subirImagenPerfil } from '../api/storage';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState('');
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState('');
  const [servicio, setServicio] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));
  const usuarioId = usuarioGuardado?.id || null;
  const esTrabajador = usuarioGuardado?.rol === 'trabajador';

  useEffect(() => {
    if (!usuarioId) return;

    const cargarPerfil = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/usuarios/${usuarioId}`);
        const data = res.data;
        setUsuario(data);
        setNombre(data.nombre);
        setPreview(data.foto_url || '');

        if (esTrabajador) {
          const trabajador = data.trabajadores?.[0];
          setServicio(trabajador?.servicio || '');
          setTarifa(trabajador?.tarifa?.toString() || '');
          setDescripcion(trabajador?.descripcion || '');
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err);
      }
    };

    cargarPerfil();
  }, [usuarioId, esTrabajador]);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleGuardar = async () => {
    try {
      let foto_url = usuario.foto_url;

      if (imagen) {
        foto_url = await subirImagenPerfil(imagen, usuarioId);
      }

      const payload = { nombre, foto_url };
      if (esTrabajador) {
        payload.servicio = servicio;
        payload.tarifa = tarifa;
        payload.descripcion = descripcion;
      }

      const res = await axios.put(`http://localhost:4000/api/usuarios/${usuarioId}`, payload);
      setUsuario(res.data);
      alert('Perfil actualizado correctamente');
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      alert('Error al actualizar el perfil');
    }
  };

  if (!usuario) return <p className="text-center mt-10">Cargando perfil...</p>;

  return (
    <div className="flex justify-center mt-10">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-6">Perfil</h2>

        <div className="flex justify-center mb-4">
          <img
            src={preview || 'https://via.placeholder.com/150'}
            alt="Foto de perfil"
            className="w-32 h-32 object-cover rounded-full shadow"
          />
        </div>

        <div className="mb-4 text-left">
          <label className="block text-sm font-medium mb-1">Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {esTrabajador && (
          <>
            <div className="mb-4 text-left">
              <label className="block text-sm font-medium mb-1">Servicio:</label>
              <input
                type="text"
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div className="mb-4 text-left">
              <label className="block text-sm font-medium mb-1">Tarifa (₡):</label>
              <input
                type="number"
                value={tarifa}
                onChange={(e) => setTarifa(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div className="mb-4 text-left">
              <label className="block text-sm font-medium mb-1">Descripción:</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </>
        )}

        <div className="mb-4 text-left">
          <label className="block text-sm font-medium mb-1">Imagen nueva:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImagenChange}
            className="w-full"
          />
        </div>

        <button
          onClick={handleGuardar}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
};

export default Perfil;
