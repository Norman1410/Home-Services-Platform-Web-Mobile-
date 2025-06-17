import { useState } from 'react'
import { registrarUsuario } from '../api/auth'

function Registro() {
  const [rol, setRol] = useState('cliente')
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [servicio, setServicio] = useState('')
  const [tarifa, setTarifa] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [mensaje, setMensaje] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

  const datos = {
    correo,
    contrasena,
    rol,
    nombre,
    servicio,
    tarifa,
    descripcion
  }


    try {
      await registrarUsuario(datos)
      setMensaje('✅ Registro exitoso. Ya puedes iniciar sesión.')
      setCorreo('')
      setContrasena('')
      setNombre('')
      setServicio('')
      setTarifa('')
      setDescripcion('')
    } catch (error) {
      setMensaje(`❌ ${error}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>

        {mensaje && <p className="text-center text-sm mb-4">{mensaje}</p>}

        <label className="block mb-2 text-sm font-medium text-gray-700">Rol</label>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className="w-full p-2 mb-6 border rounded"
        >
          <option value="cliente">Cliente</option>
          <option value="trabajador">Trabajador</option>
        </select>

        {/* Campos comunes */}
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        {/* Campos específicos para trabajador */}
        {rol === 'trabajador' && (
          <>
            <input
              type="text"
              placeholder="Servicio que ofrece (ej. Plomería)"
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Tarifa (₡)"
              value={tarifa}
              onChange={(e) => setTarifa(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <textarea
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Registrarse
        </button>
        <p className="mt-4 text-sm text-center">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Inicia sesión aquí
          </a>
        </p>
      </form>
    </div>
  )
}

export default Registro
