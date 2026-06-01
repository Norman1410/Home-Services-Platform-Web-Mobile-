import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getStoredUser } from '../utils/session';

function Trabajos() {
  const usuario = getStoredUser();
  const [ofertas, setOfertas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [aplicando, setAplicando] = useState(null);
  const [aplicaciones, setAplicaciones] = useState([]);

  // 🔁 Cargar las aplicaciones del trabajador (con estado incluido)
  const obtenerAplicaciones = useCallback(async () => {
    try {
      const resUsuario = await axios.get(`http://localhost:4000/api/usuarios/${usuario.id}`);
      const trabajador_id = resUsuario.data.trabajadores?.[0]?.id;

      if (trabajador_id) {
        const resAplicaciones = await axios.get('http://localhost:4000/api/aplicaciones');
        const aplicadas = resAplicaciones.data.filter(
          (app) => app.trabajador_id === trabajador_id
        );
        setAplicaciones(aplicadas);
      }
    } catch (error) {
      console.error('Error al cargar aplicaciones:', error);
    }
  }, [usuario.id]);

  // 🔁 Obtener todas las ofertas
  useEffect(() => {
    const obtenerOfertas = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/ofertas');
        const activas = res.data.filter((oferta) => oferta.estado !== 'inactiva');
        setOfertas(activas);
      } catch (error) {
        console.error('Error al obtener ofertas:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerOfertas();
    obtenerAplicaciones();
  }, [obtenerAplicaciones]);

  const aplicarAOferta = async (oferta_id) => {
    try {
      setAplicando(oferta_id);

      const res = await axios.get(`http://localhost:4000/api/usuarios/${usuario.id}`);
      const trabajador_id = res.data.trabajadores?.[0]?.id;

      if (!trabajador_id) {
        alert('No se pudo identificar al trabajador');
        return;
      }

      await axios.post('http://localhost:4000/api/aplicaciones/aplicar', {
        oferta_id,
        trabajador_id,
      });

      alert('✅ Aplicaste correctamente a esta oferta');

      // ✅ Actualiza directamente la lista de aplicaciones en caliente
      setAplicaciones((prev) => [...prev, { oferta_id, estado: 'pendiente' }]);
    } catch (err) {
      console.error('Error al aplicar:', err);
      alert(err.response?.data?.error || 'No se pudo aplicar a la oferta');
    } finally {
      setAplicando(null);
    }
  };

  const ofertasFiltradas = ofertas.filter((oferta) => {
    const texto = `${oferta.titulo} ${oferta.descripcion} ${oferta.servicio_requerido}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ofertas de trabajo disponibles</h1>

      <input
        type="text"
        placeholder="Buscar por título, descripción o servicio..."
        className="w-full border p-2 mb-4"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando ? (
        <p className="text-gray-500">Cargando ofertas...</p>
      ) : ofertasFiltradas.length === 0 ? (
        <p className="text-gray-500">No se encontraron ofertas.</p>
      ) : (
        <ul className="space-y-4">
          {ofertasFiltradas.map((oferta) => {
            const app = aplicaciones.find((a) => {
              return a.oferta_id === oferta.id || a.ofertas_trabajo?.id === oferta.id;
            });

            return (
              <li key={oferta.id} className="border p-4 rounded shadow bg-white">
                <h2 className="text-xl font-semibold text-blue-700">{oferta.titulo}</h2>
                <p className="text-gray-700 mt-1">{oferta.descripcion}</p>
                <p className="text-sm text-gray-500 mt-1">Servicio: {oferta.servicio_requerido}</p>
                <p className="text-sm text-gray-500">Ubicación: {oferta.ubicacion}</p>
                <p className="text-sm text-gray-500">
                  Publicado:{' '}
                  {oferta.fecha_creacion
                    ? new Date(oferta.fecha_creacion).toLocaleDateString()
                    : 'Fecha no disponible'}
                </p>

                {app ? (
                  <span
                    className={`inline-block mt-2 px-4 py-1 rounded text-white ${
                      app.estado === 'aceptada'
                        ? 'bg-green-600'
                        : app.estado === 'rechazada'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                    }`}
                  >
                    {app.estado === 'aceptada'
                      ? '✔️ Aceptado'
                      : app.estado === 'rechazada'
                      ? '❌ Rechazado'
                      : 'Aplicado'}
                  </span>
                ) : (
                  <button
                    onClick={() => aplicarAOferta(oferta.id)}
                    disabled={aplicando === oferta.id}
                    className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  >
                    {aplicando === oferta.id ? 'Aplicando...' : 'Aplicar'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Trabajos;
