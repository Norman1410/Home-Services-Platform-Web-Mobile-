import { Navigate } from 'react-router-dom'
import { getStoredUser } from '../utils/session'

function RutaProtegida({ children }) {
  const usuario = getStoredUser()

  if (!usuario) {
    return <Navigate to="/login" />
  }

  return children
}

export default RutaProtegida
