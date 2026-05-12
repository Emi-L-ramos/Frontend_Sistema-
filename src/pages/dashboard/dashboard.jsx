import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardHome from "./dashboardhome";
import MatriculaPage from "../matricula/MatriculaPage";
import RecibosPage from "../recibos/RecibosPage";
import Calendario from "../calendario/calendario";
import Notas from "../nota/notas";
import PlanStudio from "../plan_studio/plan_studio";
import Asistencia from "../asistencia/asistencia";
import PerfilEstudiante from "../perfil_studiante/perfil_estudiante";
import UsuariosPage from "../admin/UsuariosPage";
import EstudiantesPage from "../estudiantes/EstudiantesPage";

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
import { PiStudent } from "react-icons/pi";
import InstructorHome from "./instructorhome";
import EstudianteHome from "./estudianteshome";
import { useNavigate } from 'react-router-dom';

function Dashboard() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    // NORMALIZAR ROL
    const rol = user?.rol?.toLowerCase() || '';

    const esAdmin = rol === 'admin';
    const esInstructor = rol === 'instructor';
    const esEstudiante = rol === 'estudiante';

    // DEPURACIÓN
    console.log("Usuario logueado:", user);
    console.log("Rol del usuario:", user?.rol);
    console.log("Rol normalizado:", rol);
    console.log("¿Es admin?", esAdmin);

    function renderContent() {

        console.log(
            "renderContent - activeTab:",
            activeTab,
            "rol:",
            rol
        );

        switch (activeTab) {

            case 'dashboard':

                if (esAdmin) {
                    return <DashboardHome />;
                }

                if (esInstructor) {
                    return <InstructorHome />;
                }

                if (esEstudiante) {
                    return <EstudianteHome />;
                }

                return <DashboardHome />;

            case 'estudiantes':
                return <EstudiantesPage />;

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

        <div className="flex h-screen bg-white font-sans ">

            {/* Overlay móvil */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform md:relative md:translate-x-0 flex flex-col h-screen ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >

                {/* HEADER */}
                <div className="p-4 border-b border-gray-200">

                    <div className="flex items-center gap-3 flex-nowrap">

                        <img
                            src="/Logo.png"
                            alt="Logo"
                            className="w-12 h-12 object-contain flex-shrink-0"
                        />

                        <div className="flex flex-col justify-center">

                            <span className="text-indigo-500 font-bold text-sm whitespace-nowrap">
                                Escuela de Manejo
                            </span>

                            <span className="text-indigo-400 font-bold text-sm whitespace-nowrap">
                                Cacique ADIACT
                            </span>

                        </div>

                    </div>

                </div>

                {/* MENÚ */}
                <nav className="mt-4 px-4 space-y-2 overflow-y-auto flex-1">

                    {/* DASHBOARD */}
                    <button
                        onClick={() => {
                            setActiveTab('dashboard');
                            setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                            activeTab === 'dashboard'
                                ? 'bg-blue-100 text-blue-500 font-bold'
                                : 'text-gray-600 hover:bg-blue-50'
                        }`}
                    >
                        <LuLayoutDashboard size={'1.5rem'} />
                        <span>Dashboard</span>
                    </button>

                    {/* ADMIN */}
                    {esAdmin && (
                        <>

                            <button
                                onClick={() => {
                                    setActiveTab('estudiantes');
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                                     activeTab === 'estudiantes'
                                        ? 'bg-blue-100 text-blue-500 font-bold'
                                        : 'text-gray-600 hover:bg-blue-50'
                                }`}
                            >
                                <PiStudent size={'1.5rem'}/>
                                <span>Estudiantes</span>
                            </button>
                                </>
                            )}


                            <button
                                onClick={() => {
                                    setActiveTab('matricula');
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                                    activeTab === 'matricula'
                                        ? 'bg-blue-100 text-blue-500 font-bold'
                                        : 'text-gray-600 hover:bg-blue-50'
                                }`}
                            >
                                <FiUserPlus size={'1.5rem'} />
                                <span>Matrículas</span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveTab('recibos');
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                                    activeTab === 'recibos'
                                        ? 'bg-blue-100 text-blue-500 font-bold'
                                        : 'text-gray-600 hover:bg-blue-50'
                                }`}
                            >
                                <HiOutlineDocumentCurrencyDollar size={'1.5rem'} />
                                <span>Recibos</span>
                            </button>

                            
                    {/* ADMINISTRACIÓN */}
                    {esAdmin && (
                        <>
                            <div className="pt-4 mt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-400 px-3 mb-2">
                                    ADMINISTRACIÓN
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setActiveTab('usuarios');
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
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

                    {/* GESTIÓN ACADÉMICA */}
                    <div className="pt-4 mt-4 border-t border-gray-200">

                        <p className="text-xs text-gray-400 px-3 mb-2">
                            GESTIÓN ACADÉMICA
                        </p>

                    </div>

                    {/* CALENDARIO */}
                    <button
                        onClick={() => {
                            setActiveTab('calendario');
                            setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl transition  hover:cursor-pointer ${
                            activeTab === 'calendario'
                                ? 'bg-blue-100 text-blue-500 font-bold'
                                : 'text-gray-600 hover:bg-blue-50'
                        }`}
                    >
                        <TbCalendarTime size={'1.5rem'} />
                        <span>Calendario</span>
                    </button>

                    {/* NOTAS */}
                    {!esEstudiante && (
                        <button
                            onClick={() => {
                                setActiveTab('notas');
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                                activeTab === 'notas'
                                    ? 'bg-blue-100 text-blue-500 font-bold'
                                    : 'text-gray-600 hover:bg-blue-50'
                            }`}
                        >
                            <IoSchoolOutline size={'1.5rem'} />
                            <span>Notas</span>
                        </button>
                    )}

                    {/* PLAN ESTUDIO */}
                    <button
                        onClick={() => {
                            setActiveTab('plan_studio');
                            setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                            activeTab === 'plan_studio'
                                ? 'bg-blue-100 text-blue-500 font-bold'
                                : 'text-gray-600 hover:bg-blue-50'
                        }`}
                    >
                        <IoMdBook size={'1.5rem'} />
                        <span>Plan de Estudio</span>
                    </button>

                    {/* ASISTENCIA */}
                    {!esEstudiante && (
                        <button
                            onClick={() => {
                                setActiveTab('asistencia');
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer${
                                activeTab === 'asistencia'
                                    ? 'bg-blue-100 text-blue-500 font-bold'
                                    : 'text-gray-600 hover:bg-blue-50'
                            }`}
                        >
                            <LuClipboardCheck size={'1.5rem'} />
                            <span>Asistencia</span>
                        </button>
                    )}

                    {/* PERFIL */}
                    <button
                        onClick={() => {
                            setActiveTab('perfil_estudiante');
                            setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer${
                            activeTab === 'perfil_estudiante'
                                ? 'bg-blue-100 text-blue-500 font-bold'
                                : 'text-gray-600 hover:bg-blue-50'
                        }`}
                    >
                        <MdPersonOutline size={'1.5rem'} />
                        <span>Perfil del Estudiante</span>
                    </button>

                </nav>

                {/* FOOTER */}
                <div className="p-4 border-t border-gray-200 bg-white">

                    <div className="flex items-center space-x-3">

                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        <div className="flex-1">

                            <p className="text-sm font-medium text-gray-700">
                                {user?.username || 'Usuario'}
                            </p>

                            <p className="text-xs text-gray-500 capitalize">
                                {rol || 'sin rol'}
                            </p>

                        </div>

                        <button
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                            className="text-gray-400 hover:text-red-500 transition"
                            title="Cerrar sesión"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                                />
                            </svg>
                        </button>

                    </div>

                </div>

            </aside>

            {/* CONTENIDO */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden  bg-opacity-100 ">

                {/* HEADER MÓVIL */}
                {!isSidebarOpen && (
                    <div className="md:hidden flex justify-between items-center p-4 opacity-70">

                        <h1 className="text-3xl font-bold  ">
                            Panel de Inicio
                        </h1>

                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-lg  active:scale-95 transition-all duration-200 hover:cursor-pointer"
                        >
                            <TbMenu2 className="text-black text-xl" />
                        </button>

                    </div>
                )}

                {/* MAIN */}
                <main className="flex-1 overflow-y-auto p-2 md:p-4">
                    {renderContent()}
                </main>s

            </div>

        </div>
    );
}

export default Dashboard;
