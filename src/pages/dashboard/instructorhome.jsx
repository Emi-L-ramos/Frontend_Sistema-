function InstructorHome() {
    const fecha = new Date().toLocaleDateString('es-NI', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="p-6 space-y-6 h-full overflow-y-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
                <p className="text-gray-400 text-sm">{fecha}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-gray-500 text-sm">Estudiantes activos</p>
                    <h2 className="text-4xl font-bold mt-2">--</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <p className="text-gray-500 text-sm">Clases hoy</p>
                    <h2 className="text-4xl font-bold mt-2">--</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Próximas clases</h3>
                    <p className="text-gray-400 text-sm text-center py-8">No hay clases programadas</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Progreso de estudiantes</h3>
                    <p className="text-gray-400 text-sm text-center py-8">Sin datos disponibles</p>
                </div>
            </div>
        </div>
    );
}

export default InstructorHome;