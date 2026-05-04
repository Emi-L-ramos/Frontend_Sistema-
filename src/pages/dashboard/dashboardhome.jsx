import { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const MESES = {
  "01":"Ene","02":"Feb","03":"Mar","04":"Abr",
  "05":"May","06":"Jun","07":"Jul","08":"Ago",
  "09":"Sep","10":"Oct","11":"Nov","12":"Dic",
};

function DashboardHome() {
  const [ganancias, setGanancias] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { "Authorization": `Token ${token}` };

    Promise.all([
      fetch("http://localhost:8000/api/dashboard/ganancias/", { headers }).then(r => r.json()),
      fetch("http://localhost:8000/api/dashboard/resumen/", { headers }).then(r => r.json()),
    ])
      .then(([dataGanancias, dataResumen]) => {
        setGanancias(dataGanancias);
        setResumen(dataResumen);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  const categorias = ganancias.map((item) => {
    const [, mes] = item.mes.split("-");
    return MESES[mes] ?? item.mes;
  });

  const totalGeneral = ganancias.reduce((acc, item) => acc + item.total, 0);

  const options = {
    chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#facc15"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0, stops: [0, 100] },
    },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
    xaxis: { categories: categorias },
    tooltip: {
      theme: "dark",
      y: { formatter: (val) => `C$${val.toLocaleString("es-NI")}` },
    },
  };

  const series = [{ name: "Ganancias", data: ganancias.map((item) => item.total) }];

  return (
    <div className="space-y-6">
      <h1 className="text-black font-bold text-4xl">Dashboard</h1>
      <p className="text-gray-500">
        Período:{" "}
        {resumen ? `${resumen.periodo_inicio} al ${resumen.periodo_fin}` : "Cargando..."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Estudiantes Matriculados</p>
            <h2 className="text-3xl font-bold">
              {cargando ? "..." : resumen?.matriculados_periodo ?? 0}
            </h2>
            <p className="text-gray-400 text-sm">
              {cargando ? "" : `Total histórico: ${resumen?.total_matriculados ?? 0}`}
            </p>
          </div>
          <div className="bg-blue-500 p-3 rounded-xl text-white text-xl">👤</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Ingresos Totales</p>
            <h2 className="text-3xl font-bold text-green-600">
              {cargando ? "..." : `C$${(resumen?.ingresos_totales ?? 0).toLocaleString("es-NI")}`}
            </h2>
            <p className="text-gray-400 text-sm">
              {cargando ? "" : `Este período: C$${(resumen?.ingresos_periodo ?? 0).toLocaleString("es-NI")}`}
            </p>
          </div>
          <div className="bg-green-500 p-3 rounded-xl text-white text-xl">💰</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Asistencia</p>
            <h2 className="text-3xl font-bold">
              {cargando ? "..." : `${resumen?.asistencia ?? 0}%`}
            </h2>
            <p className="text-gray-400 text-sm">Promedio general</p>
          </div>
          <div className="bg-purple-500 p-3 rounded-xl text-white text-xl">📋</div>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Ganancias Mensuales</h3>
          <span className="text-yellow-500 font-bold text-lg">
            {cargando ? "..." : `C$${totalGeneral.toLocaleString("es-NI")}`}
          </span>
        </div>

        {cargando ? (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            Cargando datos...
          </div>
        ) : ganancias.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            No hay recibos registrados aún
          </div>
        ) : (
          <Chart options={options} series={series} type="area" height={300} />
        )}
      </div>
    </div>
  );
}

export default DashboardHome;