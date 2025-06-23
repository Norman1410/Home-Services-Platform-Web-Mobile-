import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { subirImagenPerfil } from '../api/storage';
import ListaOfertasCliente from '../components/ListaOfertasCliente';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState('');
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState('');
  const [telefono, setTelefono] = useState('');
  const [servicio, setServicio] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [valoraciones, setValoraciones] = useState([]);

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
        setTelefono(data.telefono || '');

        if (esTrabajador) {
          const trabajador = data.trabajadores?.[0];
          setServicio(trabajador?.servicio || '');
          setTarifa(trabajador?.tarifa?.toString() || '');
          setDescripcion(trabajador?.descripcion || '');

          if (trabajador?.id) {
            const resVal = await axios.get(`http://localhost:4000/api/valoraciones/trabajador/${trabajador.id}`);
            setValoraciones(resVal.data);
          }
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
        setPreview(foto_url);
      }

      const payload = { nombre, foto_url, telefono };
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

  const promedio = valoraciones.length
    ? (valoraciones.reduce((acc, v) => acc + v.calificacion, 0) / valoraciones.length).toFixed(1)
    : null;

  if (!usuario) return <p className="text-center mt-10">Cargando perfil...</p>;

  return (
    <div className="flex flex-col md:flex-row justify-center mt-10 gap-6 px-4">
      {/* Sección de perfil */}
      <div className="bg-white shadow-lg rounded-lg p-6 w-full md:max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-6">Perfil</h2>

        <div className="flex justify-center mb-4">
          <img
            src={preview || 'https://via.placeholder.com/150'}
            alt="Foto de perfil"
            className="w-32 h-32 object-cover rounded-full shadow"
          />
        </div>

        {/* Campos generales */}
        <div className="mb-4 text-left">
          <label className="block text-sm font-medium mb-1">Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4 text-left">
          <label className="block text-sm font-medium mb-1">Teléfono (opcional):</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Ej. 8888-8888"
          />
        </div>

        {/* Campos de trabajador */}
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

        {/* Imagen nueva */}
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

        {/* Valoraciones si es trabajador */}
        {esTrabajador && (
          <div className="mt-8 text-left">
            <h3 className="text-lg font-semibold mb-2">Valoraciones recibidas:</h3>

            {valoraciones.length === 0 ? (
              <p className="text-gray-500 italic">Aún no has recibido valoraciones.</p>
            ) : (
              <>
                <p className="mb-2 text-yellow-600">
                  ⭐ Promedio: <strong>{promedio}</strong> / 5
                </p>
                <div className="max-h-64 overflow-y-auto pr-2">
                  {valoraciones.map((v, i) => (
                    <div key={i} className="border-b pb-2 mb-2">
                      <p className="font-semibold">{v.usuarios.nombre}</p>
                      <p className="text-yellow-600">⭐ {v.calificacion}/5</p>
                      <p>{v.comentario}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Sección de ofertas del cliente */}
      {usuarioGuardado?.rol === 'cliente' && (
        <div className="w-full md:w-1/2 max-h-[650px] overflow-y-auto">
          <ListaOfertasCliente clienteId={usuarioId} />
        </div>
      )}
    </div>
  );

};

export default Perfil;
