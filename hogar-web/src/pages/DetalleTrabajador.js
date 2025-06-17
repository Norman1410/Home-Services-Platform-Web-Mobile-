import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

function DetalleTrabajador() {
  const { id } = useParams()
  const [trabajador, setTrabajador] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`http://localhost:4000/api/trabajadores/${id}`)
      .then(res => setTrabajador(res.data))
      .catch(err => {
        setError('No se pudo cargar el trabajador')
        console.error(err)
      })
  }, [id])

  if (error) return <p className="p-4 text-red-500">{error}</p>
  if (!trabajador) return <p className="p-4">Cargando...</p>

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md text-center">
      <img
        src={trabajador.foto_url || 'https://via.placeholder.com/150'}
        alt={trabajador.usuarios?.nombre}
        className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
      />
      <h2 className="text-2xl font-bold text-gray-800">{trabajador.usuarios?.nombre}</h2>
      <p className="text-gray-500">{trabajador.servicio}</p>
      <p className="text-green-600 font-semibold mt-1 mb-4">₡{trabajador.tarifa}</p>
      <p className="text-gray-700">{trabajador.descripcion}</p>
    </div>
  )
}

export default DetalleTrabajador
