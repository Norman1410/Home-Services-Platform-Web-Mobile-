import { Link, useNavigate } from 'react-router-dom'
import { getStoredUser } from '../utils/session'

function Navbar() {
  const navigate = useNavigate()
  const usuario = getStoredUser()

  const cerrarSesion = () => {
    localStorage.removeItem('usuario')
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">HogarApp</h1>

      {usuario && (
        <div className="space-x-4">
          <Link to="/" className="text-gray-700 hover:text-blue-500">Inicio</Link>
          <Link to="/perfil" className="text-gray-700 hover:text-blue-500">Perfil</Link>

          {usuario.rol === 'cliente' && (
            <Link to="/trabajadores" className="text-gray-700 hover:text-blue-500">Trabajadores</Link>
          )}

          {usuario.rol === 'trabajador' && (
            <Link to="/trabajos" className="text-gray-700 hover:text-blue-500">Trabajos</Link>
          )}

          <button
            onClick={cerrarSesion}
            className="text-red-600 hover:underline ml-4"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
