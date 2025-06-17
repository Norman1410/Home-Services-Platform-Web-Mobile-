import { Link } from 'react-router-dom';

function TrabajadorCard({ data }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex gap-4 items-center max-w-md">
      <img
        src={data.imagen}
        alt={data.nombre}
        className="w-20 h-20 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-gray-800">{data.nombre}</h2>
        <p className="text-gray-600">{data.servicio}</p>
        <p className="text-green-600 font-semibold">₡{data.tarifa}</p>
        <Link
          to={`/trabajador/${data.id}`}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Ver más detalles
        </Link>
      </div>
    </div>
  );
}

export default TrabajadorCard;
