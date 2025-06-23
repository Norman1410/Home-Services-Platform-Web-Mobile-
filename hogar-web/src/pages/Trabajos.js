import { useEffect, useState } from 'react';
import axios from 'axios';

function Trabajos() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const [ofertas, setOfertas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [aplicando, setAplicando] = useState(null);

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
  }, []);

  const aplicarAOferta = async (oferta_id) => {
    try {
      setAplicando(oferta_id);

      // Obtener el ID del trabajador desde el backend
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
      <h1 className="text-2xl font-bold mb-4">Trabajos disponibles</h1>

      <input
        type="text"
        placeholder="Buscar por palabra clave..."
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
          {ofertasFiltradas.map((oferta) => (
            <li key={oferta.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold text-blue-700">{oferta.titulo}</h2>
              <p className="text-gray-700 mt-1">{oferta.descripcion}</p>
              <p className="text-sm text-gray-500 mt-1">Servicio: {oferta.servicio_requerido}</p>
              <p className="text-sm text-gray-500">Ubicación: {oferta.ubicacion}</p>
              <p className="text-sm text-gray-500">
                Publicado: {new Date(oferta.fecha_creacion).toLocaleDateString()}
              </p>

              {oferta.estado === 'pendiente' && (
                <button
                  onClick={() => aplicarAOferta(oferta.id)}
                  disabled={aplicando === oferta.id}
                  className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  {aplicando === oferta.id ? 'Aplicando...' : 'Aplicar'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Trabajos;
