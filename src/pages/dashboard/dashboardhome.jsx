function DashboardHome() {
  return (
    <div className="space-y-6">

        <h1 className="text-black font-bold text-4xl">Dashboard</h1>
        <p>Resumen general del sistema de gestión académica</p>
            
             
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Estudiantes Matriculados</p>
            <h2 className="text-3xl font-bold">127</h2>
            <p className="text-green-500 text-sm">+12 este mes</p>
          </div>
          <div className="bg-blue-500 p-3 rounded-xl text-white text-xl">
            👤
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Promedio de Notas</p>
            <h2 className="text-3xl font-bold">85</h2>
            <p className="text-gray-400 text-sm">Este período</p>
          </div>
          <div className="bg-green-500 p-3 rounded-xl text-white text-xl">
            🎓
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Asistencia</p>
            <h2 className="text-3xl font-bold">92%</h2>
            <p className="text-gray-400 text-sm">Promedio general</p>
          </div>
          <div className="bg-purple-500 p-3 rounded-xl text-white text-xl">
            📋
          </div>
        </div>

      </div>

      {/* Contenido abajo */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Resumen</h3>
        <p className="text-gray-500">
          Aquí puedes agregar gráficos, tablas o actividad reciente.
        </p>
      </div>

    </div>
  );
}

export default DashboardHome;