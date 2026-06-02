import { getStoredUser } from '../utils/session'

function Trabajador() {
  const usuario = getStoredUser()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Bienvenido, {usuario?.nombre}</h1>
      <p className="mt-2">Estás dentro del área de trabajador.</p>
    </div>
  )
}

export default Trabajador
