import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardHome from "./dashboardhome";
import MatriculaPage from "../matricula/MatriculaPage";
import RecibosPage from "../recibos/RecibosPage";
import Calendario from "../calendario/calendario";
import NotasPages from "../nota/notas";
import PlanStudio from "../plan_studio/plan_studio";
import Asistencia from "../asistencia/asistencia";
import PerfilEstudiante from "../perfil_studiante/perfil_estudiante";
import UsuariosPage from "../admin/UsuariosPage";
import EstudiantesPage from "../estudiantes/EstudiantesPage";
import ReportesPages from "../reportes/ReportesPages";
import InstructoresPage from "../instructores/InstructoresPage";
import VerPlanEstudio from "../plan_studio/VerPlanEstudio";
import PlanEstudioForm from "../plan_studio/PlanEstudioForm";

import { LuLayoutDashboard, LuClipboardCheck } from "react-icons/lu";
import { TbMenu2, TbCalendarTime } from "react-icons/tb";
import { HiOutlineDocumentCurrencyDollar } from "react-icons/hi2";
import { FiUserPlus } from "react-icons/fi";
import { IoMdBook } from "react-icons/io";
import { MdPersonOutline } from "react-icons/md";
import { IoSchoolOutline } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";
import { PiStudent } from "react-icons/pi";
import { FaSquarePollVertical } from "react-icons/fa6";

import InstructorHome from "./instructorhome";
import EstudianteHome from "./estudianteshome";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "../../api/axios";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const rol = user?.rol?.toLowerCase() || "";

  const esAdmin = rol === "admin" || rol === "administrador";
  const esInstructor = rol === "instructor";
  const esEstudiante = rol === "estudiante";

  useEffect(() => {
    if (esAdmin) {
      obtenerNotificacionesAdmin();
    }
  }, [esAdmin]);

// useEffect(() => {

//   if (!esAdmin) return;

//   // Primera carga inmediata
//   obtenerNotificacionesAdmin();

//   // Actualizar automáticamente cada 15 segundos
//   const intervalo = setInterval(() => {
//     obtenerNotificacionesAdmin();
//   }, 15000);

//   return () => clearInterval(intervalo);

// }, [esAdmin]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    try {
      return new Date(fecha).toLocaleString("es-NI", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fecha;
    }
  };

  const obtenerNotificacionesAdmin = async () => {
    try {
      const response = await axios.get("/notificaciones/admin-pendientes/");
      const notificaciones = Array.isArray(response.data) ? response.data : [];

      if (notificaciones.length === 0) return;

      const mensajes = notificaciones
        .map((n) => {
          const faltaInstructor = n.tipo === "falta_instructor";

          return `
            <div style="
              background:#fff;
              border:1px solid #fecaca;
              border-radius:14px;
              padding:14px;
              margin-bottom:12px;
            ">
              <div style="display:flex; gap:10px; align-items:flex-start;">
                <div style="
                  width:34px;
                  height:34px;
                  border-radius:10px;
                  background:#dc2626;
                  color:white;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-weight:bold;
                  flex-shrink:0;
                ">
                  !
                </div>

                <div style="flex:1;">
                  <div style="
                    font-size:14px;
                    font-weight:700;
                    color:#b91c1c;
                    margin-bottom:4px;
                  ">
                    ${
                      faltaInstructor
                        ? "Falta check del instructor"
                        : "Falta check del estudiante"
                    }
                  </div>

                  <div style="
                    display:inline-block;
                    font-size:11px;
                    color:#dc2626;
                    background:#fef2f2;
                    border:1px solid #fecaca;
                    border-radius:999px;
                    padding:3px 9px;
                    margin-bottom:8px;
                  ">
                    ${
                      faltaInstructor
                        ? "Pendiente para el estudiante"
                        : "Pendiente para el instructor"
                    }
                  </div>

                  <p style="
                    margin:0 0 10px 0;
                    color:#374151;
                    font-size:13px;
                    line-height:1.5;
                  ">
                    ${n.mensaje || "Hay un check pendiente."}
                  </p>

                  <div style="
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:8px;
                    margin-top:8px;
                  ">
                    <div style="
                      background:#fef2f2;
                      border:1px solid #fee2e2;
                      border-radius:10px;
                      padding:8px;
                    ">
                      <div style="font-size:11px; color:#9ca3af;">Estudiante</div>
                      <div style="font-size:12px; color:#374151; font-weight:700;">
                        ${n.estudiante || "No asignado"}
                      </div>
                    </div>

                    <div style="
                      background:#fef2f2;
                      border:1px solid #fee2e2;
                      border-radius:10px;
                      padding:8px;
                    ">
                      <div style="font-size:11px; color:#9ca3af;">Tema</div>
                      <div style="font-size:12px; color:#374151; font-weight:700;">
                        ${n.tema || "Sin tema"}
                      </div>
                    </div>
                  </div>

                  <div style="
                    margin-top:9px;
                    font-size:11px;
                    color:#9ca3af;
                  ">
                    ${formatearFecha(n.fecha_creacion)}
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join("");

      await Swal.fire({
        title: "Notificaciones pendientes",
        html: `
          <div style="text-align:left;">
            <div style="
              background:linear-gradient(90deg,#b91c1c,#ef4444);
              color:white;
              padding:14px 16px;
              border-radius:16px;
              margin-bottom:14px;
            ">
              <div style="font-size:16px; font-weight:800;">
                Checks pendientes
              </div>
              <div style="font-size:12px; opacity:.9;">
                Revisión requerida por el administrador
              </div>
            </div>

            <div style="
              max-height:390px;
              overflow-y:auto;
              background:#fef2f2;
              padding:12px;
              border-radius:16px;
              border:1px solid #fecaca;
            ">
              ${mensajes}
            </div>
          </div>
        `,
        width: 760,
        showCancelButton: false,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#dc2626",
        background: "#ffffff",
      });
    } catch (error) {
      console.error("Error obteniendo notificaciones:", error);
    }
  };

  function renderContent() {
    switch (activeTab) {
      case "dashboard":
        if (esAdmin) return <DashboardHome />;
        if (esInstructor) return <InstructorHome />;
        if (esEstudiante) return <EstudianteHome setActiveTab={setActiveTab} />;
        return <DashboardHome />;

      case "reportes":
         if (!esAdmin) return <DashboardHome />;
        return <ReportesPages userRole={rol} />;

      case "estudiantes":
         if (!esAdmin) return <DashboardHome />;
        return <EstudiantesPage />;

      case "matricula":
         if (!esAdmin) return <DashboardHome />;
        return <MatriculaPage />;

      case "recibos":
         if (!esAdmin) return <DashboardHome />;
        return <RecibosPage />;

      case "calendario":
        return <Calendario />;

      case "notas":
        return <NotasPages userRole={rol} />;

      case "plan_studio":
        //  if (!esAdmin) return <DashboardHome />;
        return <PlanStudio userRole={rol} />;

      case "asistencia":
        return <Asistencia userRole={rol} />;

      case "perfil_estudiante":
        return <PerfilEstudiante />;

      case "usuarios":
        if (!esAdmin) return <DashboardHome />;
        return <UsuariosPage />;

      case "instructores":
        if (!esAdmin) return <DashboardHome />;
        return <InstructoresPage />;

      case "ver_plan":
          if (!esAdmin) return <DashboardHome />;
        return <VerPlanEstudio />;

      case "nuevo_plan":
        if (!esAdmin) return <DashboardHome />;
        return <PlanEstudioForm />;

      default:
        return <DashboardHome />;
    }
  }

  return (
    <div className="flex h-screen bg-white font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform md:relative md:translate-x-0 flex flex-col h-screen ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-gray-200">
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

        <nav className="mt-4 px-4 space-y-2 overflow-y-auto flex-1">
          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 px-3 mb-2">REPORTES</p>
          </div>

          <button
            onClick={() => {
              setActiveTab("dashboard");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-blue-100 text-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-50"
            }`}
          >
            <LuLayoutDashboard size="1.5rem" />
            <span>Dashboard</span>
          </button>

          {esAdmin && (
            <button
              onClick={() => {
                setActiveTab("reportes");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                activeTab === "reportes"
                  ? "bg-blue-100 text-blue-500 font-bold"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              <FaSquarePollVertical size="1.5rem" />
              <span>Reportes</span>
            </button>
          )}

          {esAdmin && (
            <>
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 px-3 mb-2">
                  GESTIÓN ADMINISTRATIVA
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveTab("estudiantes");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                  activeTab === "estudiantes"
                    ? "bg-blue-100 text-blue-500 font-bold"
                    : "text-gray-600 hover:bg-blue-50"
                }`}
              >
                <PiStudent size="1.5rem" />
                <span>Estudiantes</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("matricula");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                  activeTab === "matricula"
                    ? "bg-blue-100 text-blue-500 font-bold"
                    : "text-gray-600 hover:bg-blue-50"
                }`}
              >
                <FiUserPlus size="1.5rem" />
                <span>Matrículas</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("recibos");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                  activeTab === "recibos"
                    ? "bg-blue-100 text-blue-500 font-bold"
                    : "text-gray-600 hover:bg-blue-50"
                }`}
              >
                <HiOutlineDocumentCurrencyDollar size="1.5rem" />
                <span>Solvencia</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("usuarios");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                  activeTab === "usuarios"
                    ? "bg-blue-100 text-blue-500 font-bold"
                    : "text-gray-600 hover:bg-blue-50"
                }`}
              >
                <FaUsers size="1.5rem" />
                <span>Usuarios</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("instructores");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                  activeTab === "instructores"
                    ? "bg-blue-100 text-blue-500 font-bold"
                    : "text-gray-600 hover:bg-blue-50"
                }`}
              >
                <MdPersonOutline size="1.5rem" />
                <span>Instructores</span>
              </button>
            </>
          )}

          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 px-3 mb-2">
              GESTIÓN ACADÉMICA
            </p>
          </div>

          <button
            onClick={() => {
              setActiveTab("calendario");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
              activeTab === "calendario"
                ? "bg-blue-100 text-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-50"
            }`}
          >
            <TbCalendarTime size="1.5rem" />
            <span>Calendario</span>
          </button>

          {(esEstudiante || esAdmin || esInstructor) && (
            <button
              onClick={() => {
                setActiveTab("notas");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                activeTab === "notas"
                  ? "bg-blue-100 text-blue-500 font-bold"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              <IoSchoolOutline size="1.5rem" />
              <span>Notas</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab("plan_studio");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
              activeTab === "plan_studio"
                ? "bg-blue-100 text-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-50"
            }`}
          >
            <IoMdBook size="1.5rem" />
            <span>Plan de Estudio</span>
          </button>

          {!esEstudiante && (
            <button
              onClick={() => {
                setActiveTab("asistencia");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
                activeTab === "asistencia"
                  ? "bg-blue-100 text-blue-500 font-bold"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
            >
              <LuClipboardCheck size="1.5rem" />
              <span>Asistencia</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab("perfil_estudiante");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center p-3 space-x-3 rounded-xl transition hover:cursor-pointer ${
              activeTab === "perfil_estudiante"
                ? "bg-blue-100 text-blue-500 font-bold"
                : "text-gray-600 hover:bg-blue-50"
            }`}
          >
            <MdPersonOutline size="1.5rem" />
            <span>Perfiles</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-500 rounded-3xl flex items-center justify-center text-white font-bold shadow-sm">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>

                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {user?.username || "Usuario"}
                </p>

                <p className="text-xs text-slate-500 capitalize mt-0.5">
                  {rol || "sin rol"}
                </p>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="cursor-pointer group w-10 h-10 rounded-3xl bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition flex items-center justify-center"
                title="Cerrar sesión"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 transition-transform group-hover:translate-x-0.5"
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
        </div>

      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-opacity-100">
        {!isSidebarOpen && (
          <div className="md:hidden flex justify-between items-center p-4 opacity-70">
            <h1 className="text-3xl font-bold">Panel de Inicio</h1>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg active:scale-95 transition-all duration-200 hover:cursor-pointer"
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
