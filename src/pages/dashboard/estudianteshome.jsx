function EstudianteHome() {
    const fecha = new Date().toLocaleDateString('es-NI', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="p-6 space-y-6 h-full overflow-y-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Mi Dashboard</h1>
                <p className="text-gray-400 text-sm">Bienvenido/a, {fecha}</p>
            </div>

            {/* Tarjetas superiores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 text-sm">Asistencia</p>
                        <h2 className="text-4xl font-bold mt-1">--</h2>
                        <p className="text-gray-400 text-sm mt-1">-- de -- encuentros</p>
                    </div>
                    <div className="bg-blue-500 p-4 rounded-2xl text-white text-2xl">✓</div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 text-sm">Progreso del Curso</p>
                        <h2 className="text-4xl font-bold mt-1">--</h2>
                        <p className="text-gray-400 text-sm mt-1">-- de -- temas completados</p>
                    </div>
                    <div className="bg-purple-500 p-4 rounded-2xl text-white text-2xl">📖</div>
                </div>
            </div>

            {/* Sección inferior */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Próximas Clases */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 text-lg">Próximas Clases</h3>
                        <span className="text-blue-500 text-sm cursor-pointer">Ver calendario completo →</span>
                    </div>
                    <p className="text-gray-400 text-sm text-center py-8">No hay clases programadas</p>
                </div>

                {/* Plan de Estudio + Asistencia */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 text-lg mb-4">Plan de Estudio</h3>
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Progreso</span>
                            <span>--%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div className="bg-gray-800 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <p className="text-gray-400 text-sm">-- de -- temas completados</p>
                        <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded-xl font-semibold">
                            Ver Plan Completo
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 text-lg mb-4">Asistencia</h3>
                        <p className="text-gray-400 text-sm text-center py-4">Sin datos disponibles</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EstudianteHome;