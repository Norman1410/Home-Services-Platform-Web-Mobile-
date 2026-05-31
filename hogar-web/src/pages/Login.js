import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { redactSensitiveData } from '../utils/security'
//Frontend Login
// Este componente maneja el inicio de sesión de los usuarios 
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const navigate = useNavigate()

const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    const res = await axios.post('http://localhost:4000/api/auth/login', {
      correo: email,
      contrasena: password
    })

    const usuario = redactSensitiveData(res.data)

    // Guardar solo datos no sensibles en localStorage
    localStorage.setItem('usuario', JSON.stringify(usuario))
    window.dispatchEvent(new Event('storage')) // 🔁 ¡Clave para refrescar App!

    // Redirigir según rol
    if (usuario.rol === 'cliente') {
      navigate('/')
    } else if (usuario.rol === 'trabajador') {
      navigate('/trabajos')
    }
  } catch (err) {
    setError(err.response?.data?.error || 'Error al iniciar sesión')
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>

        {error && <p className="text-center text-sm text-red-600 mb-4">{error}</p>}

        <label className="block mb-2 text-sm font-medium text-gray-700">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-6 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Iniciar sesión
        </button>
        <p className="mt-4 text-sm text-center">
          ¿No tienes cuenta?{' '}
          <a href="/registro" className="text-blue-600 hover:underline">
            Regístrate aquí
          </a>
        </p>
      </form>
    </div>
  )
}

export default Login
