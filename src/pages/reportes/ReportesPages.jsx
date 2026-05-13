function ReportesPages({ userRole }) {
    return (
        <div>
            <h1>Centro de Reportes</h1>
            
            {userRole === 'admin' && (
                <div>
                    <h2>Reportes de Administrador</h2>
                    {/* Aquí irían los gráficos de ingresos, usuarios totales, etc. */}
                </div>
            )}

            {userRole === 'instructor' && (
                <div>
                    <h2>Reportes de Instructor</h2>
                    {/* Aquí irían los reportes de rendimiento de alumnos, asistencia, etc. */}
                </div>
            )}
        </div>
    );
}
export default ReportesPages;

