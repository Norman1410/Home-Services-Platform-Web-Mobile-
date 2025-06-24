import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function DetalleTrabajador() {
  const { id } = useParams();
  const [trabajador, setTrabajador] = useState(null);
  const [valoraciones, setValoraciones] = useState([]);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/trabajadores/${id}`)
      .then((res) => setTrabajador(res.data))
      .catch((err) => console.error("Error al cargar trabajador:", err));

    axios
      .get(`http://localhost:4000/api/valoraciones/trabajador/${id}`)
      .then((res) => setValoraciones(res.data))
      .catch((err) => {
        console.warn(
          "⚠️ No se pudieron cargar valoraciones. Puede que Supabase no esté disponible:",
          err.message
        );
        setValoraciones([]); // evita errores en render
      });
  }, [id]);

  const enviarValoracion = async () => {
    try {
      await axios.post("http://localhost:4000/api/valoraciones", {
        trabajador_id: id,
        calificacion: parseInt(calificacion),
        comentario,
      });
      alert("Valoración enviada");
      setComentario("");
      setCalificacion(5);
      const res = await axios.get(
        `http://localhost:4000/api/valoraciones/trabajador/${id}`
      );
      setValoraciones(res.data);
    } catch (error) {
      alert("No se pudo enviar tu valoración");
      console.error("Error al enviar valoración:", error);
    }
  };

  const promedio =
    valoraciones.length > 0
      ? (
          valoraciones.reduce((acc, v) => acc + v.calificacion, 0) /
          valoraciones.length
        ).toFixed(1)
      : null;

  if (!trabajador) return <p>Cargando...</p>;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow-md rounded">
      <div className="flex justify-center">
        <img
          src={trabajador.usuarios.foto_url}
          alt="Perfil"
          className="w-32 h-32 rounded-full object-cover mb-4"
        />
      </div>
      <h2 className="text-2xl font-bold text-center">
        {trabajador.usuarios.nombre}
      </h2>
      <p className="text-center text-gray-600">{trabajador.servicio}</p>
      <p className="text-center text-green-600 font-bold">
        ₡{trabajador.tarifa}
      </p>
      <p className="text-center mt-2">{trabajador.descripcion}</p>

      <div className="bg-blue-50 p-3 rounded my-4">
        <p className="text-sm text-blue-700 font-semibold">📧 Contacto:</p>
        <p className="text-blue-900">{trabajador.usuarios?.email}</p>
        {trabajador.usuarios?.telefono && (
          <p className="text-blue-900 mt-1">📱 {trabajador.usuarios.telefono}</p>
        )}
      </div>

      {/* --- FORMULARIO --- */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Dejar una valoración:</h3>
        <label className="text-sm font-semibold block">
          Calificación (1-5):
        </label>
        <input
          type="number"
          min="1"
          max="5"
          value={calificacion}
          onChange={(e) => setCalificacion(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />

        <label className="text-sm font-semibold block">Comentario:</label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="w-full border p-2 rounded"
          rows={3}
        />

        <button
          onClick={enviarValoracion}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enviar valoración
        </button>
      </div>

      {/* --- VALORACIONES --- */}
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Valoraciones:</h3>

        {promedio && (
          <div className="flex items-center mb-2">
            <span className="text-yellow-500 text-xl mr-1">⭐</span>
            <span className="text-sm text-gray-700">
              Promedio: <strong>{promedio}</strong> / 5
            </span>
          </div>
        )}

        {valoraciones.length === 0 ? (
          <p className="italic text-gray-600">Aún no hay valoraciones.</p>
        ) : (
          <div className="overflow-y-auto max-h-64 pr-2">
            {valoraciones.map((v, index) => (
              <div key={index} className="mb-4 border-b pb-2">
                <p className="font-semibold">{v.usuarios.nombre}</p>
                <p className="text-yellow-500">⭐ {v.calificacion}/5</p>
                <p>{v.comentario}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DetalleTrabajador;
