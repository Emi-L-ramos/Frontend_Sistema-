import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardHome from "./dashboardhome";
import MatriculaPage from "../matricula/matriculaPage";
import RecibosPage from "../recibos/RecibosPage";
import Calendario from "../calendario/calendario";
import Notas from "../nota/notas";
import PlanStudio from "../plan_studio/plan_studio";
import Asistencia from "../asistencia/asistencia";
import PerfilEstudiante from "../perfil_studiante/perfil_estudiante";
import UsuariosPage from "../admin/UsuariosPage";
import { LuLayoutDashboard } from "react-icons/lu";
import { TbMenu2 } from "react-icons/tb";
import { HiOutlineDocumentCurrencyDollar } from "react-icons/hi2";
import { TbCalendarTime } from "react-icons/tb";
import { FiUserPlus } from "react-icons/fi";
import { IoMdBook } from "react-icons/io";
import { MdPersonOutline } from "react-icons/md";
import { LuClipboardCheck } from "react-icons/lu";
import { IoSchoolOutline } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";

function Dashboard() {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Depuración
    console.log("Usuario logueado:", user);
    console.log("Rol del usuario:", user?.rol);
    console.log("¿Es admin?", user?.rol === 'admin');

    function renderContent() {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardHome />;
            case 'matricula':
                return <MatriculaPage />;
            case 'recibos':
                return <RecibosPage />;
            case 'calendario':
                return <Calendario />;
            case 'notas':
                return <Notas />;
            case 'plan_studio':
                return <PlanStudio />;
            case 'asistencia':
                return <Asistencia />;
            case 'perfil_estudiante':
                return <PerfilEstudiante />;
            case 'usuarios':
                return <UsuariosPage />;
            default:
                return <DashboardHome />;
        }
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Overlay para móvil */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform md:relative md:translate-x-0 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                
                <div className="p-6 text-xl font-bold text-indigo-400 border-b border-gray-200">
                    Escuela de Manejo
                </div>

                <nav className="mt-4 px-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
                    <button
                        onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl transition ${
                            activeTab === 'dashboard'
                                ? 'bg-blue-100 text-blue-500 font-bold'
                                : 'text-gray-600 hover:bg-blue-50'
                        }`}
                    >
                        <LuLayoutDashboard size={'1.5rem'} />
                        <span>Dashboard</span>
                    </button>
                            
                    <button
                        onClick={() => { setActiveTab('matricula'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl transition ${
                            activeTab === 'matricula'
                                ? 'bg-blue-100 text-blue-500 font-bold'
                                : 'text-gray-600 hover:bg-blue-50'
                        }`}
                    >
                        <FiUserPlus size={'1.5rem'} />
                        <span>Matrículas</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('recibos'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl transition ${
                            activeTab === 'recibos'
                                ? 'bg-blue-100 text-blue-500 font-bold'
                                : 'text-gray-600 hover:bg-blue-50'
                        }`}
                    >
                        <HiOutlineDocumentCurrencyDollar size={'1.5rem'} />
                        <span>Recibos</span>
                    </button>

                    {/* Solo admin puede ver usuarios */}
                    {user?.rol === 'admin' && (
                        <>
                            <div className="pt-4 mt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-400 px-3 mb-2">ADMINISTRACIÓN</p>
                            </div>
                            
                            <button
                                onClick={() => { setActiveTab('usuarios'); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center p-3 space-x-3 rounded-xl transition ${
                                    activeTab === 'usuarios'
                                        ? 'bg-blue-100 text-blue-500 font-bold'
                                        : 'text-gray-600 hover:bg-blue-50'
                                }`}
                            >
                                <FaUsers size={'1.5rem'} />
                                <span>Usuarios</span>
                            </button>
                        </>
                    )}

                    {/* Gestión Académica */}
                    <div className="pt-4 mt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-400 px-3 mb-2">GESTIÓN ACADÉMICA</p>
                    </div>

                    <button
                        onClick={() => { setActiveTab('calendario'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl transition ${
                            activeTab === 'calendario'
                                ? 'bg-blue-100 text-blue-500 font-bold'
                                : 'text-gray-600 hover:bg-blue-50'
                        }`}
                    >
                        <TbCalendarTime size={'1.5rem'} />
                        <span>Calendario</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('notas'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl transition ${
                            activeTab === 'notas'
                                ? 'bg-blue-100 text-blue-500 font-bold'
                                : 'text-gray-600 hover:bg-blue-50'
                        }`}
                    >
                        <IoSchoolOutline size={'1.5rem'} />
                        <span>Notas</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('plan_studio'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl transition ${
                            activeTab === 'plan_studio'
                                ? 'bg-blue-100 text-blue-500 font-bold'
                                : 'text-gray-600 hover:bg-blue-50'
                        }`}
                    >
                        <IoMdBook size={'1.5rem'} />
                        <span>Plan de Estudio</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('asistencia'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl transition ${
                            activeTab === 'asistencia'
                                ? 'bg-blue-100 text-blue-500 font-bold'
                                : 'text-gray-600 hover:bg-blue-50'
                        }`}
                    >
                        <LuClipboardCheck size={'1.5rem'} />
                        <span>Asistencia</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('perfil_estudiante'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl transition ${
                            activeTab === 'perfil_estudiante'
                                ? 'bg-blue-100 text-blue-500 font-bold'
                                : 'text-gray-600 hover:bg-blue-50'
                        }`}
                    >
                        <MdPersonOutline size={'1.5rem'} />
                        <span>Perfil del Estudiante</span>
                    </button>
                </nav>

                {/* Footer con info del usuario */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">{user?.username || 'Usuario'}</p>
                            <p className="text-xs text-gray-500 capitalize">Rol: {user?.rol || 'sin rol'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {!isSidebarOpen && (
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md active:scale-95 transition-all duration-200"
                        >
                            <TbMenu2 className="text-black text-xl" />
                        </button>
                    </div>
                )}
                
                <main className="flex-1 overflow-y-auto p-2 md:p-4">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;