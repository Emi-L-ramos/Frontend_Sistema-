import {
  lazy,
  Suspense,
  useState,
  useEffect,
} from "react";
import { useAuth } from "../../context/AuthContext";
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
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "../../api/axios";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoSettingsOutline, IoLogOutOutline } from "react-icons/io5";

const DashboardHome = lazy(
  () => import("./dashboardhome")
);

const InstructorHome = lazy(
  () => import("./instructorhome")
);

const EstudianteHome = lazy(
  () => import("./estudianteshome")
);

const MatriculaPage = lazy(
  () => import("../matricula/MatriculaPage")
);

const RecibosPage = lazy(
  () => import("../recibos/RecibosPage")
);

const Calendario = lazy(
  () => import("../calendario/calendario")
);

const NotasPages = lazy(
  () => import("../nota/notas")
);

const PlanStudio = lazy(
  () => import("../plan_studio/plan_studio")
);

const Configuraciones = lazy(
  () => import("./configuraciones")
);

const Asistencia = lazy(
  () => import("../asistencia/asistencia")
);

const PerfilEstudiante = lazy(
  () => import("../perfil_studiante/perfil_estudiante")
);

const UsuariosPage = lazy(
  () => import("../admin/UsuariosPage")
);

const EstudiantesPage = lazy(
  () => import("../estudiantes/EstudiantesPage")
);

const ReportesPages = lazy(
  () => import("../reportes/ReportesPages")
);

const InstructoresPage = lazy(
  () => import("../instructores/InstructoresPage")
);

const VerPlanEstudio = lazy(
  () => import("../plan_studio/VerPlanEstudio")
);

const PlanEstudioForm = lazy(
  () => import("../plan_studio/PlanEstudioForm")
);

const escaparHtml = (valor) => {
  return String(valor ?? "").replace(
    /[&<>"']/g,
    (caracter) => {
      const equivalencias = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };

      return equivalencias[caracter];
    }
  );
};

function Dashboard() {
  const {
    user,
    logout,
    esRol,
  } = useAuth();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  const rol = String(user?.rol || "")
    .trim()
    .toLowerCase();

  const esAdmin = esRol(
    "admin",
    "administrador",
    "secretaria"
  );

  const esInstructor = esRol("instructor");
  const esEstudiante = esRol("estudiante");

  useEffect(() => {
    if (esAdmin) {
      obtenerNotificacionesAdmin();
    }
  }, [esAdmin]);

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
                  <div style="font-size:14px; font-weight:700; color:#b91c1c; margin-bottom:4px;">
                    ${faltaInstructor ? "Falta check del instructor" : "Falta check del estudiante"}
                  </div>
                  <div style="display:inline-block; font-size:11px; color:#dc2626; background:#fef2f2; border:1px solid #fecaca; border-radius:999px; padding:3px 9px; margin-bottom:8px;">
                    ${faltaInstructor ? "Pendiente para el estudiante" : "Pendiente para el instructor"}
                  </div>
                  <p style="margin:0 0 10px 0; color:#374151; font-size:13px; line-height:1.5;">
                    ${escaparHtml(n.mensaje || "Hay un check pendiente.")}
                  </p>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px;">
                    <div style="background:#fef2f2; border:1px solid #fee2e2; border-radius:10px; padding:8px;">
                      <div style="font-size:11px; color:#9ca3af;">Estudiante</div>
                      <div style="font-size:12px; color:#374151; font-weight:700;">${escaparHtml(n.estudiante || "No asignado")}</div>
                    </div>
                    <div style="background:#fef2f2; border:1px solid #fee2e2; border-radius:10px; padding:8px;">
                      <div style="font-size:11px; color:#9ca3af;">Tema</div>
                      <div style="font-size:12px; color:#374151; font-weight:700;">${escaparHtml(n.tema || "Sin tema")}</div>
                    </div>
                  </div>
                  <div style="margin-top:9px; font-size:11px; color:#9ca3af;">
                    ${escaparHtml(formatearFecha(n.fecha_creacion))}
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
            <div style="background:linear-gradient(90deg,#b91c1c,#ef4444); color:white; padding:14px 16px; border-radius:16px; margin-bottom:14px;">
              <div style="font-size:16px; font-weight:800;">Checks pendientes</div>
              <div style="font-size:12px; opacity:.9;">Revisión requerida por el administrador</div>
            </div>
            <div style="max-height:390px; overflow-y:auto; background:#fef2f2; padding:12px; border-radius:16px; border:1px solid #fecaca;">
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

  const irConfiguracionSistema = () => {
    setMenuUsuarioAbierto(false);
    setActiveTab("configuracion");
    setIsSidebarOpen(false);
  };

  const cerrarSesion = async () => {
    setMenuUsuarioAbierto(false);

    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: (
        "Se cerrará tu sesión actual y volverás "
        + "al inicio de sesión."
      ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      allowOutsideClick: false,
    });

    if (!result.isConfirmed) {
      return;
    }

    await logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  function renderContent() {
    switch (activeTab) {
      case "dashboard":
        if (esAdmin) {
          return <DashboardHome />;
        }

        if (esInstructor) {
          return <InstructorHome />;
        }

        if (esEstudiante) {
          return (
            <EstudianteHome
              setActiveTab={setActiveTab}
            />
          );
        }
        return null;

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
        return <PlanStudio userRole={rol} />;

      case "asistencia":
        return <Asistencia userRole={rol} />;

      case "perfil_estudiante":
        return <PerfilEstudiante />;

      case "usuarios":
        if (!esAdmin) return <DashboardHome />;
        return <UsuariosPage />;

      case "configuracion":
        if (!esAdmin) return <DashboardHome />;
        return <Configuraciones />;

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
        if (esAdmin) {
          return <DashboardHome />;
        }

        if (esInstructor) {
          return <InstructorHome />;
        }

        if (esEstudiante) {
          return (
            <EstudianteHome
              setActiveTab={setActiveTab}
            />
          );
        }
        return null;
    }
  }

  return (
    <div className="flex h-screen bg-white font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[82vw] max-w-[320px] bg-white transition-transform duration-300 md:w-64 md:max-w-none md:relative md:translate-x-0 flex flex-col h-[100dvh] border-r border-gray-100 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-gray-100">
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
          <div className="pt-2">
            <p className="text-xs text-gray-400 px-3 mb-2">GENERAL</p>
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
          <div className="relative">
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
                  type="button"
                  onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                  className={`cursor-pointer w-10 h-10 rounded-3xl border transition flex items-center justify-center ${
                    menuUsuarioAbierto
                      ? "bg-blue-50 border-blue-200 text-blue-600"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700"
                  }`}
                  title="Opciones"
                >
                  <BsThreeDotsVertical size="1.25rem" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {menuUsuarioAbierto && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/45 md:items-end md:justify-start md:bg-transparent md:pl-[17rem] md:pb-4"
          onClick={() => setMenuUsuarioAbierto(false)}
        >
          <div
            className="mx-3 w-full max-h-[82dvh] overflow-y-auto rounded-t-[30px] bg-white border border-slate-200 shadow-2xl p-4 md:mx-0 md:w-72 md:max-h-none md:rounded-3xl md:p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-3 py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Opciones del sistema
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configuración y sesión
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMenuUsuarioAbierto(false)}
                className="md:hidden w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xl font-bold"
              >
                ×
              </button>
            </div>

            {esAdmin && (
              <button
                type="button"
                onClick={irConfiguracionSistema}
                className="cursor-pointer w-full flex items-center gap-3 px-3 py-3 mt-2 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <IoSettingsOutline size="1.25rem" />
                </div>

                <div className="text-left min-w-0">
                  <p className="truncate">Configuración</p>
                  <p className="text-xs font-normal text-slate-400 truncate">
                    Ajustes generales
                  </p>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={cerrarSesion}
              className="cursor-pointer w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
            >
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <IoLogOutOutline size="1.35rem" />
              </div>

              <div className="text-left min-w-0">
                <p className="truncate">Cerrar sesión</p>
                <p className="text-xs font-normal text-red-400 truncate">
                  Salir del sistema
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!isSidebarOpen && (
          <div className="md:hidden flex justify-between items-center p-4 bg-white border-b border-gray-100">
            <h1 className="text-xl font-bold text-slate-800">Panel de Inicio</h1>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg active:scale-95 transition-all"
            >
              <TbMenu2 className="text-black text-xl" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-3 md:p-4 bg-slate-50">
          <Suspense
            fallback={
              <div className="flex min-h-[350px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                  <p className="font-semibold text-slate-500">
                    Cargando módulo...
                  </p>
                </div>
              </div>
            }
          >
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;