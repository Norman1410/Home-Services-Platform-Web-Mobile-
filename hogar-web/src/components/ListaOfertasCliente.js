import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

function ListaOfertasCliente({ clienteId }) {
  const [ofertas, setOfertas] = useState([]);
  const [aplicacionesPorOferta, setAplicacionesPorOferta] = useState({});

  const cargarOfertas = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/ofertas/cliente/${clienteId}`);
      setOfertas(res.data);
    } catch (err) {
      console.error('Error al obtener ofertas del cliente:', err);
    }
  }, [clienteId]);

  useEffect(() => {
    cargarOfertas();
  }, [cargarOfertas]);

  const desactivarOferta = async (id) => {
    try {
      await axios.patch(`http://localhost:4000/api/ofertas/${id}`, {
        estado: 'inactiva',
      });
      await cargarOfertas();
    } catch (err) {
      console.error('Error al desactivar oferta:', err);
      alert('No se pudo desactivar la oferta');
    }
  };

  const eliminarOferta = async (id) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta oferta? Esta acción no se puede deshacer.');
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:4000/api/ofertas/${id}`);
      await cargarOfertas();
    } catch (err) {
      console.error('Error al eliminar oferta:', err);
      alert('No se pudo eliminar la oferta');
    }
  };

  const cargarAplicaciones = async (ofertaId) => {
    if (aplicacionesPorOferta[ofertaId]) {
      setAplicacionesPorOferta((prev) => {
        const copia = { ...prev };
        delete copia[ofertaId];
        return copia;
      });
      return;
    }

    try {
      const res = await axios.get(`http://localhost:4000/api/aplicaciones/oferta/${ofertaId}`);
      setAplicacionesPorOferta((prev) => ({
        ...prev,
        [ofertaId]: res.data
      }));
    } catch (err) {
      console.error('Error al obtener aplicaciones:', err);
      alert('No se pudieron cargar las aplicaciones');
    }
  };

  const aceptarAplicacion = async (id, ofertaId) => {
    try {
      await axios.patch(`http://localhost:4000/api/aplicaciones/${id}/aceptar`);
      await cargarAplicaciones(ofertaId);
      alert('✅ Trabajador aceptado');
    } catch (err) {
      console.error(err);
      alert('No se pudo aceptar la aplicación');
    }
  };

  const rechazarAplicacion = async (id, ofertaId) => {
    try {
      await axios.patch(`http://localhost:4000/api/aplicaciones/${id}/rechazar`);
      await cargarAplicaciones(ofertaId);
      alert('❌ Aplicación rechazada');
    } catch (err) {
      console.error(err);
      alert('No se pudo rechazar la aplicación');
    }
  };

  return (
    <div className="mt-2 text-left">
      <h3 className="text-xl font-semibold mb-4">Mis ofertas publicadas</h3>

      {ofertas.length === 0 ? (
        <p className="text-gray-500 italic">Aún no has publicado ninguna oferta.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4">
          {ofertas.map((oferta) => (
            <li key={oferta.id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
              <h4 className="text-lg font-bold text-blue-700 mb-2">{oferta.titulo}</h4>
              <p className="text-sm text-gray-700 mb-1">{oferta.descripcion}</p>
              <p className="text-sm text-gray-600">Servicio: <strong>{oferta.servicio_requerido}</strong></p>
              <p className="text-sm text-gray-600">Ubicación: {oferta.ubicacion}</p>
              <p className="text-sm text-gray-600 mb-2">
                Estado: <span className={oferta.estado === 'inactiva' ? 'text-red-600' : 'text-green-600'}>
                  {oferta.estado}
                </span>
              </p>

              <div className="flex gap-2 flex-wrap mb-2">
                {oferta.estado === 'pendiente' && (
                  <button
                    onClick={() => desactivarOferta(oferta.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Desactivar
                  </button>
                )}

                <button
                  onClick={() => eliminarOferta(oferta.id)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded text-sm"
                >
                  Eliminar
                </button>

                <button
                  onClick={() => cargarAplicaciones(oferta.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  {aplicacionesPorOferta[oferta.id] ? 'Ocultar aplicaciones' : 'Ver aplicaciones'}
                </button>
              </div>

              {aplicacionesPorOferta[oferta.id] && (
                <div className="mt-2 pl-2 border-t pt-2">
                  <h5 className="font-semibold text-sm mb-1">Aplicaciones:</h5>
                  {aplicacionesPorOferta[oferta.id].length === 0 ? (
                    <p className="text-sm text-gray-500">Ningún trabajador ha aplicado aún.</p>
                  ) : (
                    <ul className="space-y-2">
                      {aplicacionesPorOferta[oferta.id].map((app) => (
                        <li key={app.id} className="text-sm border p-2 rounded bg-white">
                          {app.trabajadores && app.trabajadores.usuarios ? (
                            <>
                              <p>
                                <strong>{app.trabajadores.usuarios.nombre}</strong> — {app.trabajadores.servicio}
                                <a
                                  href={`/trabajador/${app.trabajadores.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 underline ml-2"
                                >
                                  Ver ficha
                                </a>
                              </p>
                              <p className="text-xs text-gray-500">Estado: {app.estado}</p>

                              {app.estado === 'pendiente' && (
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => aceptarAplicacion(app.id, oferta.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                                  >
                                    Aceptar
                                  </button>
                                  <button
                                    onClick={() => rechazarAplicacion(app.id, oferta.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                  >
                                    Rechazar
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-red-600 italic">⚠️ Aplicación inválida o trabajador eliminado</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListaOfertasCliente;
