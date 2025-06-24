import { useEffect, useState } from 'react';
import TrabajadorCard from '../components/TrabajadorCard';
import axios from 'axios';

function Trabajadores() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtrados, setFiltrados] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:4000/api/trabajadores')
      .then((res) => {
        setTrabajadores(res.data);
        setFiltrados(res.data); // inicia con todos
      })
      .catch((err) => console.error('Error al cargar trabajadores:', err));
  }, []);

  useEffect(() => {
    const termino = busqueda.toLowerCase();
    const resultado = trabajadores.filter((t) => {
      const nombre = t.usuarios?.nombre?.toLowerCase() || '';
      const servicio = t.servicio?.toLowerCase() || '';
      const tarifa = t.tarifa?.toString() || '';
      return (
        nombre.includes(termino) ||
        servicio.includes(termino) ||
        tarifa.includes(termino)
      );
    });
    setFiltrados(resultado);
  }, [busqueda, trabajadores]);

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Buscar por nombre, servicio o tarifa..."
        className="w-full mb-4 p-2 border border-gray-300 rounded"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {filtrados.length === 0 ? (
        <p className="text-center text-gray-500">No se encontraron resultados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map((t) => (
            <TrabajadorCard
              key={t.id}
              data={{
                id: t.id,
                nombre: t.usuarios?.nombre || 'Nombre no disponible',
                servicio: t.servicio,
                tarifa: t.tarifa,
                imagen:
                  t.usuarios?.foto_url || 'https://via.placeholder.com/150',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Trabajadores;
