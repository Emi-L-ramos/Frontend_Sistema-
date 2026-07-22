import {
  lazy,
  Suspense,
  useState,
  useEffect,
} from "react";
import Swal from "sweetalert2";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  FaChartLine,
  FaUsers,
  FaUserCheck,
  FaUserGraduate,
} from "react-icons/fa";
import {
  FiBell,
  FiChevronDown,
  FiCalendar,
  FiRefreshCw,
  FiDollarSign,
  FiUsers,
} from "react-icons/fi";

const Chart = lazy(
  () => import("react-apexcharts")
);

const MESES = {
  "01":"Ene","02":"Feb","03":"Mar","04":"Abr",
  "05":"May","06":"Jun","07":"Jul","08":"Ago",
  "09":"Sep","10":"Oct","11":"Nov","12":"Dic",
};

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

function DashboardHome() {
  const { user } = useAuth();

  const [ganancias, setGanancias] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);

  const anioActual = new Date().getFullYear();

  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
  const [mostrarAnios, setMostrarAnios] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(false);

  const aniosDisponibles = Array.from({ length: 6 }, (_, index) => anioActual - index);

  const cargarDashboard = async (anio = anioSeleccionado) => {
    try {
      setCargando(true);

      const [resGanancias, resResumen] = await Promise.all([
        api.get("/dashboard/ganancias/", {
          params: {
            anio,
          },
        }),
        api.get("/dashboard/resumen/"),
      ]);

      const dataGanancias = resGanancias.data;
      const dataResumen = resResumen.data;

      setGanancias(Array.isArray(dataGanancias) ? dataGanancias : []);
      setResumen(dataResumen || {});
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard(anioSeleccionado);
  }, [anioSeleccionado]);

  const cambiarAnio = (anio) => {
  setAnioSeleccionado(anio);
  setMostrarAnios(false);
};

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

const cargarNotificaciones = async () => {
  try {
    setCargandoNotificaciones(true);

    const response = await api.get("/notificaciones/admin-pendientes/");
    const data = Array.isArray(response.data) ? response.data : [];

    setNotificaciones(data);

    if (data.length === 0) {
      await Swal.fire({
        title: "Notificaciones",
        text: "No hay notificaciones pendientes.",
        icon: "info",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    const htmlNotificaciones = data
      .map((n) => {
        return `
          <div style="
            background:#ffffff;
            border:1px solid #e5e7eb;
            border-radius:14px;
            padding:14px;
            margin-bottom:10px;
            text-align:left;
          ">
            <div style="
              display:flex;
              justify-content:space-between;
              gap:12px;
              margin-bottom:8px;
            ">
              <strong style="color:#0f172a;font-size:14px;">
                ${escaparHtml(n.tipo_texto || "Notificación pendiente")}
              </strong>

              <span style="
                background:#eff6ff;
                color:#2563eb;
                font-size:11px;
                font-weight:700;
                padding:4px 8px;
                border-radius:999px;
                white-space:nowrap;
              ">
                ${escaparHtml(n.quien_falta || "Pendiente")}
              </span>
            </div>

            <p style="
              color:#475569;
              font-size:13px;
              line-height:1.5;
              margin:0 0 10px 0;
            ">
              ${escaparHtml(n.mensaje || "Hay una notificación pendiente.")}
            </p>

            <div style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:8px;
              margin-top:10px;
            ">
              <div style="
                background:#f8fafc;
                border:1px solid #e2e8f0;
                border-radius:10px;
                padding:8px;
              ">
                <div style="font-size:11px;color:#94a3b8;">Estudiante</div>
                <div style="font-size:12px;color:#334155;font-weight:700;">
                  ${escaparHtml(n.estudiante || "No asignado")}
                </div>
              </div>

              <div style="
                background:#f8fafc;
                border:1px solid #e2e8f0;
                border-radius:10px;
                padding:8px;
              ">
                <div style="font-size:11px;color:#94a3b8;">Tema</div>
                <div style="font-size:12px;color:#334155;font-weight:700;">
                  ${escaparHtml(n.tema || "Sin tema")}
                </div>
              </div>
            </div>

            <div style="
              margin-top:10px;
              color:#94a3b8;
              font-size:11px;
            ">
              ${escaparHtml(formatearFecha(n.fecha_creacion))}
            </div>
          </div>
        `;
      })
      .join("");

    await Swal.fire({
      title: "Notificaciones pendientes",
      html: `
        <div style="
          max-height:430px;
          overflow-y:auto;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:18px;
          padding:12px;
        ">
          ${htmlNotificaciones}
        </div>
      `,
      width: 760,
      confirmButtonText: "Entendido",
      confirmButtonColor: "#2563eb",
      showCancelButton: true,
      cancelButtonText: "Marcar todas como leídas",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        await Promise.all(
          data.map((n) =>
            api.post(`/notificaciones/${n.id}/marcar-leida/`)
          )
        );

        setNotificaciones([]);

        await Swal.fire({
          title: "Listo",
          text: "Las notificaciones fueron marcadas como leídas.",
          icon: "success",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#2563eb",
        });
      }
    });
  } catch (error) {
    console.error("Error cargando notificaciones:", error);

    await Swal.fire({
      title: "Error",
      text: "No se pudieron cargar las notificaciones.",
      icon: "error",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#dc2626",
    });
  } finally {
    setCargandoNotificaciones(false);
  }
};

  const categorias = ganancias.map((item) => {
    if (!item.mes) return "";
    const partes = item.mes.split("-");
    const mes = partes[1];
    return MESES[mes] ?? item.mes;
  });;

  const mesActual = `${anioSeleccionado}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const totalGeneral = ganancias
    .filter((item) => item.mes === mesActual)
    .reduce((acc, item) => acc + Number(item.total || 0), 0);

  const totalPeriodo = ganancias.reduce(
    (acc, item) => acc + Number(item.total || 0),
    0
  );

  const totalMatriculadosGrafica = ganancias.reduce(
    (acc, item) => acc + Number(item.matriculados || 0),
    0
  );

  const options = {
    chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#10b981", "#3b82f6"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0, stops: [0, 100] },
    },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
    xaxis: { categories: categorias },
    yaxis: [
      {
        title: { text: "Ganancias (C$)" },
      },
      {
        opposite: true, 
        title: { text: "Resumen" },
      }
    ],
    tooltip: {
      theme: "dark",
      shared: true,
      y: [
        {
          formatter: (value) => `C$ ${new Intl.NumberFormat('es-NI').format(value || 0)}`,
        },
        {
          formatter: (value) => `${value || 0} estudiantes`,
        },
      ],
    },
  };

 const series = [
  { 
    name: "Ganancias", 
    data: ganancias.map((item) => Number(item.total || 0)) 
  },
  { 
    name: "Matriculados", 
    data: ganancias.map((item) => Number(item.matriculados || 0)) 
  }
];

  return (
    <div className="space-y-6">
      <br />
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
            <FaChartLine className="text-3xl" />
          </div>
          <div>
            <h1 className="text-slate-900 font-extrabold text-3xl md:text-4xl">
              Dashboard
            </h1>

            <p className="text-slate-500 text-sm mt-2">
              Resumen general de la escuela de manejo
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-5">
          <button
            type="button"
            onClick={cargarNotificaciones}
            disabled={cargandoNotificaciones}
            className="relative w-10 h-10 rounded-3xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center shadow-sm hover:bg-slate-50 transition disabled:opacity-60 hover:cursor-pointer"
            title="Ver notificaciones"
          >
            <FiBell size={18} />

            {notificaciones.length > 0 && (
              <span className="absolute right-2 top-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white"></span>
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-xs text-slate-400 font-semibold">
                ¡Bienvenido!
              </p>

              <p className="text-sm text-slate-800 font-extrabold">
                {user?.username || "Admin"}
              </p>
            </div>

            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-sm">
              {(user?.username || "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-blue-100 bg-blue-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-base font-bold text-slate-600">
                Matrículas registradas
              </p>

              <h2 className="mt-4 text-4xl font-black text-blue-600">
                {cargando ? "..." : resumen?.total_matriculados ?? 0}
              </h2>

              <p className="mt-3 text-sm font-medium text-slate-500">
                {cargando
                  ? ""
                  : `Total histórico de matrículas: ${resumen?.total_matriculados ?? 0}`}
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
              <FaUsers className="text-4xl" />
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-7 -right-6 text-blue-500 opacity-10">
            <FaUsers className="text-[120px]" />
          </div>
        </div>

        <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-base font-bold text-slate-600">
                Estudiantes Activos
              </p>

              <h2 className="mt-4 text-4xl font-black text-emerald-600">
                {cargando ? "..." : resumen?.estudiantes_activos ?? 0}
              </h2>

              <p className="mt-3 text-sm font-medium text-slate-500">
                {cargando ? "" : "Con matrícula no finalizada"}
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              <FaUserCheck className="text-4xl" />
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-7 -right-6 text-emerald-500 opacity-10">
            <FaUserCheck className="text-[120px]" />
          </div>
        </div>

        <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-purple-100 bg-purple-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-base font-bold text-slate-600">
                Egresados del Mes
              </p>

              <h2 className="mt-4 text-4xl font-black text-purple-600">
                {cargando ? "..." : `${resumen?.egresados_mes ?? 0}`}
              </h2>

              <p className="mt-3 text-sm font-medium text-slate-500">
                Finalizados este mes
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-purple-600 shadow-sm ring-1 ring-purple-100">
              <FaUserGraduate className="text-4xl" />
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-7 -right-6 text-purple-500 opacity-10">
            <FaUserGraduate className="text-[120px]" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Ganancias Mensuales
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Datos correspondientes al año {anioSeleccionado}
            </p>
          </div>

          <div className="flex items-start gap-4">
            <div className="text-left md:text-right">
              <p className="text-emerald-600 font-extrabold text-xl">
                {cargando ? "..." : `C$ ${totalPeriodo.toLocaleString("es-NI")}`}
              </p>

              <p className="text-sm text-slate-400 mt-1">
                Total del año
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMostrarAnios((prev) => !prev)}
                className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-slate-50 transition"
              >
                <FiCalendar size={16} />
                {anioSeleccionado}
                <FiChevronDown size={16} />
              </button>

              {mostrarAnios && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-20">
                  {aniosDisponibles.map((anio) => (
                    <button
                      key={anio}
                      type="button"
                      onClick={() => cambiarAnio(anio)}
                      className={`w-full px-4 py-3 text-left text-sm font-semibold hover:bg-blue-50 transition ${
                        anioSeleccionado === anio
                          ? "text-blue-600 bg-blue-50"
                          : "text-slate-600"
                      }`}
                    >
                      {anio}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => cargarDashboard(anioSeleccionado)}
              className="w-11 h-11 rounded-2xl border border-slate-200 bg-white text-slate-500 flex items-center justify-center shadow-sm hover:bg-slate-50 transition"
              title="Actualizar datos"
            >
              <FiRefreshCw size={18} /> 
            </button>
          </div>
        </div>

        {cargando ? (
          <div className="h-[340px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Cargando datos...
          </div>
        ) : ganancias.length === 0 ? (
          <div className="h-[340px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No hay datos registrados aún
          </div>
        ) : (
          <div className="rounded-2xl">
            <Suspense
              fallback={
                <div className="flex h-[340px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  Cargando gráfica...
                </div>
              }
            >
              <Chart
                options={options}
                series={series}
                type="area"
                height={340}
              />
            </Suspense>

            <div className="mx-auto -mt-2 w-full max-w-xl rounded-3xl bg-slate-50 border border-slate-100 shadow-sm px-6 py-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                  <FiDollarSign size={22} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Ganancias totales
                  </p>

                  <p className="text-lg font-extrabold text-slate-900">
                    {cargando ? "..." : `C$ ${totalPeriodo.toLocaleString("es-NI")}`}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-12 bg-slate-200"></div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                  <FiUsers size={22} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Total matriculados
                  </p>

                  <p className="text-lg font-extrabold text-slate-900">
                    {cargando ? "..." : `${totalMatriculadosGrafica} estudiantes`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardHome;
