import { useState } from 'react';
import axios from 'axios';
import { getStoredUser } from '../utils/session';

function Home() {
  const usuario = getStoredUser();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    servicio_requerido: '',
    ubicacion: '',
  });
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/ofertas', {
        ...formData,
        cliente_id: usuario.id,
      });
      setMensaje('✅ Oferta publicada exitosamente');
      setFormData({
        titulo: '',
        descripcion: '',
        servicio_requerido: '',
        ubicacion: '',
      });
    } catch (error) {
      console.error('Error al publicar oferta:', error);
      setMensaje('❌ Error al publicar la oferta');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Publicar una oferta de trabajo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="titulo"
          placeholder="Título del trabajo"
          value={formData.titulo}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <textarea
          name="descripcion"
          placeholder="Descripción detallada"
          value={formData.descripcion}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <input
          name="servicio_requerido"
          placeholder="Servicio requerido (ej. plomería)"
          value={formData.servicio_requerido}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <input
          name="ubicacion"
          placeholder="Ubicación"
          value={formData.ubicacion}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Publicar oferta
        </button>
        {mensaje && <p className="text-green-600 mt-2">{mensaje}</p>}
      </form>
    </div>
  );
}

export default Home;
