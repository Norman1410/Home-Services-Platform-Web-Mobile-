import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function DetalleCliente() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/usuarios/${id}`);
        setCliente(res.data);
      } catch (err) {
        console.warn('❌ Primer intento fallido. Reintentando en 1 segundo...');
        // Segundo intento después de 1 segundo
        setTimeout(async () => {
          try {
            const res = await axios.get(`http://localhost:4000/api/usuarios/${id}`);
            setCliente(res.data);
          } catch (err2) {
            console.error('❌ Segundo intento fallido:', err2);
            setError(true);
          } finally {
            setCargando(false);
          }
        }, 1000);
        return; // No continues abajo hasta que el retry se complete
      }
      setCargando(false);
    };

    fetchCliente();
  }, [id]);

  if (cargando) {
    return (
      <div className="text-center text-blue-700 mt-10">
        ⏳ Cargando perfil del cliente...
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="text-center text-red-600 mt-10">
        ❌ No se pudo cargar el perfil del cliente.
        <br />
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-blue-600 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <div className="text-center mb-4">
        <img
          src={cliente.foto_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
          alt="Foto del cliente"
          className="w-28 h-28 rounded-full mx-auto object-cover"
        />
        <h2 className="text-2xl font-semibold mt-2">
          {cliente.nombre}
        </h2>
      </div>
      <div className="bg-blue-50 p-4 rounded">
        <p className="font-semibold text-blue-700">📧 Correo:</p>
        <p className="mb-2">{cliente.email}</p>
        {cliente.telefono && (
          <>
            <p className="font-semibold text-blue-700">📞 Teléfono:</p>
            <p>{cliente.telefono}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default DetalleCliente;
