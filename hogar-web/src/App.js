import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Perfil from './pages/Perfil'
import Navbar from './components/Navbar'
import Trabajadores from './pages/Trabajadores'
import DetalleTrabajador from './pages/DetalleTrabajador'
import Registro from './pages/Registro'
import RutaProtegida from './components/RutaProtegida'
import Trabajos from './pages/Trabajos'
import HomeTrabajador from './pages/HomeTrabajador';
import DetalleCliente from './pages/DetalleCliente';

//Componente principal de la aplicación que maneja las rutas y el estado del usuario
function App() {
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')))

  useEffect(() => {
    const actualizarSesion = () => {
      const nuevoUsuario = JSON.parse(localStorage.getItem('usuario'))
      setUsuario(nuevoUsuario)
    }

    window.addEventListener('storage', actualizarSesion)
    return () => window.removeEventListener('storage', actualizarSesion)
  }, [])

  return (
    <Router>
      {usuario && <Navbar />}

      <div className="p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route
            path="/"
            element={
              <RutaProtegida>
                {usuario?.rol === 'trabajador' ? <HomeTrabajador /> : <Home />}
              </RutaProtegida>
            }
          />

          <Route
            path="/perfil"
            element={
              <RutaProtegida>
                <Perfil />
              </RutaProtegida>
            }
          />
          <Route
            path="/trabajadores"
            element={
              <RutaProtegida>
                <Trabajadores />
              </RutaProtegida>
            }
          />

          <Route
            path="/detalle-cliente/:id"
            element={
              <RutaProtegida>
                <DetalleCliente />
              </RutaProtegida>
            }
          />

          <Route
            path="/trabajador/:id"
            element={
              <RutaProtegida>
                <DetalleTrabajador />
              </RutaProtegida>
            }
          />
          <Route
            path="/trabajos"
            element={
              <RutaProtegida>
                <Trabajos />
              </RutaProtegida>
            }
          />

          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
