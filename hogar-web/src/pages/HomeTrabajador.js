import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getStoredUser } from '../utils/session';

function HomeTrabajador() {
  const usuario = getStoredUser();
  const [aplicaciones, setAplicaciones] = useState([]);

  useEffect(() => {
    const cargarAplicaciones = async () => {
      try {
        const resUsuario = await axios.get(`http://localhost:4000/api/usuarios/${usuario.id}`);
        const tId = resUsuario.data.trabajadores?.[0]?.id;
        if (!tId) return;

        const res = await axios.get('http://localhost:4000/api/aplicaciones');
        const apps = res.data
          .filter((app) => app.trabajador_id === tId)
          .map((app) => ({
            id: app.id,
            estado: app.estado,
            oferta: app.ofertas_trabajo,
          }));
        setAplicaciones(apps);
      } catch (err) {
        console.error('Error al cargar aplicaciones:', err);
      }
    };

    cargarAplicaciones();
  }, [usuario]);

  const desaplicar = async (appId) => {
    if (!window.confirm('¿Seguro que deseas desaplicar?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/aplicaciones/${appId}`);
      setAplicaciones((prev) => prev.filter((a) => a.id !== appId));
    } catch (err) {
      console.error('Error al desaplicar:', err);
      alert('No se pudo desaplicar');
    }
  };

  const pendientes = aplicaciones.filter((a) => a.estado === 'pendiente');
  const aceptadas = aplicaciones.filter((a) => a.estado === 'aceptada');

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white shadow rounded space-y-10">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Tus aplicaciones</h2>

      <div>
        <h3 className="text-xl font-semibold mb-2">⏳ Pendientes</h3>
        {pendientes.length === 0 ? (
          <p className="text-gray-500 italic">No tienes aplicaciones pendientes.</p>
        ) : (
          <ul className="space-y-4">
            {pendientes.map((app) => (
              <li key={app.id} className="border p-4 rounded bg-gray-50">
                <h4 className="text-lg font-bold text-blue-600">{app.oferta.titulo}</h4>
                <p>{app.oferta.descripcion}</p>
                <p className="text-sm text-gray-600">Ubicación: {app.oferta.ubicacion}</p>
                <button
                  onClick={() => desaplicar(app.id)}
                  className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Desaplicar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">✅ Aceptadas</h3>
        {aceptadas.length === 0 ? (
          <p className="text-gray-500 italic">No tienes aplicaciones aceptadas aún.</p>
        ) : (
          <ul className="space-y-4">
            {aceptadas.map((app) => (
              <li key={app.id} className="border p-4 rounded bg-green-50">
                <h4 className="text-lg font-bold text-green-700">{app.oferta.titulo}</h4>
                <p>{app.oferta.descripcion}</p>
                <p className="text-sm text-gray-600">Ubicación: {app.oferta.ubicacion}</p>

                {app.oferta.cliente_id && (
                  <Link to={`/detalle-cliente/${app.oferta.cliente_id}`}>
                    <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                      Ver cliente
                    </button>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default HomeTrabajador;
