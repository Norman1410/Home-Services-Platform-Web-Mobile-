function Trabajos() {
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trabajos disponibles</h1>
      <p className="mb-2">
        Hola <span className="font-semibold">{usuario?.nombre}</span>, aquí podrás ver solicitudes de clientes que requieren el servicio que ofreces.
      </p>
      <p className="text-gray-600">
        (Próximamente: se mostrarán aquí solicitudes filtradas por tu servicio como plomería, jardinería, etc.)
      </p>
    </div>
  )
}

export default Trabajos
