import { useEffect, useState } from 'react'
import TrabajadorCard from "../components/TrabajadorCard"
import axios from 'axios'

function Trabajadores() {
  const [trabajadores, setTrabajadores] = useState([])

  useEffect(() => {
    axios.get('http://localhost:4000/api/trabajadores')
      .then(res => setTrabajadores(res.data))
      .catch(err => console.error('Error al cargar trabajadores:', err))
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {trabajadores.map((t) => (
        <TrabajadorCard
          key={t.id}
          data={{
            id: t.id,
            nombre: t.usuarios?.nombre || 'Nombre no disponible',
            servicio: t.servicio,
            tarifa: t.tarifa,
            imagen: t.foto_url || 'https://via.placeholder.com/150'
          }}
        />
      ))}
    </div>
  )
}

export default Trabajadores
