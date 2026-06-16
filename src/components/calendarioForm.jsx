// src/components/calendarioForm.jsx
import { useEffect, useState, useMemo } from "react";
import { X, Calendar, User, BookOpen, ChevronRight, AlertCircle, Clock, Search, ChevronLeft, ChevronDown, Plus, Trash2 } from "lucide-react";
import { crearBloqueCitas, listarInstructores, listarMatriculas, crearExamenManual } from "../api/calendario";
import Swal from "sweetalert2";

export default function CalendarioForm({ abierto, onClose, onCreada }) {
  const [instructores, setInstructores] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [form, setForm] = useState({ instructor_id: "", matricula_id: "", fecha_inicio: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [fechasGeneradas, setFechasGeneradas] = useState([]);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarCalendarioSelector, setMostrarCalendarioSelector] = useState(false);
  const [fechaMinima, setFechaMinima] = useState(null);
  // const navigate = useNavigate();
  
  const [mostrarExamenManual, setMostrarExamenManual] = useState(false);
  const [examenManual, setExamenManual] = useState({
    fecha: "",
    hora_inicio: "08:00",
    hora_fin: "10:00"
  });
  
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [mostrarDropdownEstudiante, setMostrarDropdownEstudiante] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [mesActual, setMesActual] = useState(new Date());
  const [horasPorDia, setHorasPorDia] = useState(2);

  const crearFechaLocal = (valor) => {
    if (!valor) return null;

    if (valor instanceof Date) {
      return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
    }

    const fechaTexto = String(valor).split("T")[0];
    const [year, month, day] = fechaTexto.split("-").map(Number);

    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
  };

  const obtenerHoyLocal = () => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  };

  const formatearFechaInput = (fecha) => {
    if (!fecha) return "";

    const fechaLocal = crearFechaLocal(fecha);

    if (!fechaLocal) return "";

    const year = fechaLocal.getFullYear();
    const month = String(fechaLocal.getMonth() + 1).padStart(2, "0");
    const day = String(fechaLocal.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!abierto) return;
    const cargarDatos = async () => {
      try {
        const [inst, mats] = await Promise.all([
          listarInstructores(),
          listarMatriculas()
        ]);
        console.log("Datos de instructores recibidos:", inst); 
        setInstructores(Array.isArray(inst) ? inst : []); // Asegura que sea un array
        setMatriculas(Array.isArray(mats) ? mats : []);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    cargarDatos();
    setForm({ instructor_id: "", matricula_id: "", fecha_inicio: "" });
    setFechasGeneradas([]);
    setError("");
    setBusquedaEstudiante("");
    setEstudianteSeleccionado(null);
    setMostrarCalendarioSelector(false);
    setMostrarExamenManual(false);
    setExamenManual({ fecha: "", hora_inicio: "08:00", hora_fin: "10:00" });
    setFechaMinima(null);
    setMesActual(new Date());
  }, [abierto]);

  const estudiantesFiltrados = useMemo(() => {
      const matriculasValidas = matriculas.filter(
          (mat) => String(mat.estado || "").toLowerCase() === "matriculado"
      );

      if (!busquedaEstudiante.trim()) return matriculasValidas;

      const busqueda = busquedaEstudiante.toLowerCase();

      return matriculasValidas.filter((mat) => {
          const texto = `
              ${mat.estudiante_nombre || ""}
              ${mat.estudiante_cedula || ""}
              ${mat.tipo_curso || ""}
              ${mat.horario || ""}
          `.toLowerCase();

          return texto.includes(busqueda);
      });
  }, [matriculas, busquedaEstudiante]);

    const generarFechas = (fechaInicio) => {
      if (!fechaInicio || !estudianteSeleccionado) return [];

      const modalidad = String(estudianteSeleccionado.modalidad || "").toLowerCase();
      const tipoCurso = String(estudianteSeleccionado.tipo_curso || "").toLowerCase();

      const horasTotales =
        tipoCurso === "intermedio" || tipoCurso === "avanzado"
          ? Number(estudianteSeleccionado.horas_reforzamiento || 0)
          : 16;

      const numClases = Math.ceil(horasTotales / horasPorDia);

      const fechas = [];
      let fecha = new Date(fechaInicio + "T00:00:00");

      while (fechas.length < numClases) {
        const dia = fecha.getDay();
        const esFinSemana = dia === 0 || dia === 6;

        const permitido =
          modalidad === "extraordinario"
            ? esFinSemana
            : !esFinSemana;

        if (permitido) {
          fechas.push(new Date(fecha));
        }
        fecha.setDate(fecha.getDate() + 1);
      }
      return fechas;
    };

  const actualizarFechaMinima = (estudiante) => {
    const hoy = obtenerHoyLocal();

    if (estudiante && estudiante.f_matricula) {
      const fechaMatricula = crearFechaLocal(estudiante.f_matricula);
      const minFecha = fechaMatricula && fechaMatricula > hoy ? fechaMatricula : hoy;

      setFechaMinima(minFecha);
      return;
    }

    setFechaMinima(hoy);
  };

  const seleccionarEstudiante = (matricula) => {
      if (String(matricula.estado || "").toLowerCase() !== "matriculado") {
          setError("Solo se pueden asignar clases a estudiantes con matrícula pagada.");
          return;
      }

      setEstudianteSeleccionado(matricula);
      setForm({ ...form, matricula_id: matricula.id });

      setBusquedaEstudiante(
          `${matricula.estudiante_nombre || "Sin nombre"} - ${matricula.estudiante_cedula || "Sin cédula"}`
      );

      setMostrarDropdownEstudiante(false);
      actualizarFechaMinima(matricula);
  };

  const limpiarEstudiante = () => {
    setEstudianteSeleccionado(null);
    setForm({ ...form, matricula_id: "" });
    setBusquedaEstudiante("");
    setFechaMinima(null);
    setMostrarExamenManual(false);
  };

  const seleccionarFecha = (fecha) => {
  const modalidad = String(estudianteSeleccionado?.modalidad || "").toLowerCase();
  const dia = fecha.getDay();
  const esFinSemana = dia === 0 || dia === 6;

  const permitido =
    modalidad === "extraordinario"
      ? esFinSemana
      : !esFinSemana;

  if (!permitido) {
    setError(
      modalidad === "extraordinario"
        ? "Modalidad extraordinaria: solo se permite sábado y domingo."
        : "Modalidad ordinaria: solo se permite lunes a viernes."
    );
    return;
  }

  const fechaObj = crearFechaLocal(fecha);
  const fechaStr = formatearFechaInput(fechaObj);

  if (!fechaObj || !fechaStr) {
    setError("La fecha seleccionada no es válida.");
    return;
  }

  if (fechaMinima && fechaObj < fechaMinima) {
    setError(`La fecha no puede ser anterior a ${formatearFecha(fechaMinima)}`);
    return;
  }

  setForm({ ...form, fecha_inicio: fechaStr });
  const generadas = generarFechas(fechaStr);
  setFechasGeneradas(generadas);
  setMostrarCalendario(true);
  setMostrarCalendarioSelector(false);
};
  const agregarExamenManual = async () => {
    if (!examenManual.fecha) {
      setError("Debe seleccionar una fecha para el examen");
      return;
    }
    if (!form.instructor_id || !form.matricula_id) {
      setError("Debe seleccionar instructor y estudiante primero");
      return;
    }
    if (fechasGeneradas.length < 7) {

      setError("Debe crear el bloque de 7 clases teóricas");
      return;
    }
    
    const fechaExamen = new Date(examenManual.fecha);
    const ultimaClase = fechasGeneradas[fechasGeneradas.length - 1];
    
    if (ultimaClase && fechaExamen <= ultimaClase) {
      setError("La fecha del examen debe ser posterior a la última clase teórica");
      return;
    }
    
    setCargando(true);
    try {
      await crearExamenManual({
        instructor_id: parseInt(form.instructor_id),
        matricula_id: parseInt(form.matricula_id),
        fecha: examenManual.fecha,
        hora_inicio: examenManual.hora_inicio,
        hora_fin: examenManual.hora_fin
      });
      setMostrarExamenManual(false);
      setExamenManual({ fecha: "", hora_inicio: "08:00", hora_fin: "10:00" });
      setError("Examen programado exitosamente");
      await Swal.fire({
                    icon: "success",
                    title: "Examen Registrado",
                    text: "Examen Programado Exitosamente",
                    confirmButtonColor: "#16a34a",
                  });
        

      setTimeout(() => setError(""), 3000);
    } catch (err) {
      setError(err.message || "Error al programar el examen");
    } finally {
      setCargando(false);
    }
  };

  const obtenerDiasMes = (fecha) => {
    const year = fecha.getFullYear();
    const month = fecha.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, fecha: new Date(year, month - 1, prevMonthDays - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, fecha: new Date(year, month, i) });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, fecha: new Date(year, month + 1, i) });
    }
    return days;
  };

  const diasMes = obtenerDiasMes(mesActual);
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const cambiarMes = (incremento) => {
    const nuevoMes = new Date(mesActual);
    nuevoMes.setMonth(mesActual.getMonth() + incremento);
    setMesActual(nuevoMes);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const f = crearFechaLocal(fecha);

    if (!f) return "";

    return f.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.instructor_id) {
  Swal.fire({
    icon: "warning",
    title: "Instructor requerido",
    text: "Debe seleccionar un instructor conductor.",
    confirmButtonColor: "#2563eb",
  });
  return;
}

if (!form.matricula_id) {
  Swal.fire({
    icon: "warning",
    title: "Estudiante requerido",
    text: "Debe seleccionar un estudiante.",
    confirmButtonColor: "#2563eb",
  });
  return;
}

if (!form.fecha_inicio) {
  Swal.fire({
    icon: "warning",
    title: "Fecha requerida",
    text: "Debe seleccionar una fecha de inicio.",
    confirmButtonColor: "#2563eb",
  });
  return;
}
    setCargando(true);
    try {
      await crearBloqueCitas({ ...form, horas_por_dia: horasPorDia });
      if (mostrarExamenManual && examenManual.fecha) {
        try {
          await crearExamenManual({
            instructor_id: parseInt(form.instructor_id),
            matricula_id: parseInt(form.matricula_id),
            fecha: examenManual.fecha,
            hora_inicio: examenManual.hora_inicio,
            hora_fin: examenManual.hora_fin
          });
          // setError("Bloque de clases y examen creados exitosamente");
            await Swal.fire({
                    icon: "success",
                    title: "Bloque Registrado",
                    text: "Bloque y Examen creado exitosamente.",
                    confirmButtonColor: "#16a34a",
                  });
        } catch (examError) {
          setError("Bloque creado, pero hubo un error al crear el examen");
        }
      } else {
        // setError("Bloque de clases creado exitosamente");
          await Swal.fire({
                  icon: "success",
                  title: "Horario Registrado",
                  text: "Horario asignado Correctamente.",
                  confirmButtonColor: "#16a34a",
                });
                // navigate("/dashboard/calandario");


      }
      setTimeout(() => {
        onCreada?.();
        onClose();
      }, 1500);
   } catch (err) {
      const mensaje =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Error al crear el bloque de clases";

      await Swal.fire({
        icon: "error",
        title: "No se pudo crear el bloque",
        text: mensaje,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setCargando(false);
    }
  };

  if (!abierto) return null;

  const horarioClase = estudianteSeleccionado?.horario || "";
  const fechaMinimaStr = fechaMinima
    ? formatearFechaInput(fechaMinima)
    : formatearFechaInput(obtenerHoyLocal());


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-yellow-600 to-purple-600 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Programar Bloque de Clases</h2>
                <p className="text-sm text-blue-100">8 clases pràcticas + examen manual (opcional)</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all duration-200  hover:cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Instructor Conductor
              <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.instructor_id}
              onChange={(e) => setForm({ ...form, instructor_id: e.target.value })}
              className="w-full border border-gray-300 rounded-2xl px-4 py-3.5 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 hover:border-blue-400 cursor-pointer"
            >
              <option value="">-- Seleccionar instructor --</option>
                 {instructores.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre_completo || `${i.nombre || ""} ${i.apellido || ""}`.trim() || `Instructor ${i.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-green-600" />
              Buscar Estudiante
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busquedaEstudiante}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setBusquedaEstudiante(valor);
                    setMostrarDropdownEstudiante(true);
                    if (valor === "") {
                      setEstudianteSeleccionado(null);
                      setForm({ ...form, matricula_id: "" });
                    }
                  }}
                  onFocus={() => {
                    setMostrarDropdownEstudiante(true);
                    if (estudianteSeleccionado && busquedaEstudiante === "") {
                      setBusquedaEstudiante(`${estudianteSeleccionado.estudiante_nombre || "Sin nombre"} ${estudianteSeleccionado.estudiante_apellido || ''} - ${estudianteSeleccionado.estudiante_cedula || "Sin cédula"}`);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      if (!document.activeElement || !document.activeElement.closest('.dropdown-estudiantes')) {
                        setMostrarDropdownEstudiante(false);
                      }
                    }, 200);
                  }}
                  placeholder="Buscar por nombre, apellido o cédula..."
                  className="w-full border border-gray-300 rounded-2xl pl-11 pr-11 py-3.5 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 hover:border-green-400 placeholder:text-gray-400"
                />
                {estudianteSeleccionado && (
                  <button
                    type="button"
                    onClick={limpiarEstudiante}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {mostrarDropdownEstudiante && busquedaEstudiante && (
                <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {estudiantesFiltrados.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No se encontraron estudiantes</div>
                  ) : (
                    estudiantesFiltrados.map((est) => (
                      <button
                        key={est.id}
                        type="button"
                        onClick={() => seleccionarEstudiante(est)}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{est.estudiante_nombre || "Sin nombre"}</p>
                            <p className="text-xs text-gray-500">
                              Cédula: {est.estudiante_cedula || "N/A"} | Horario: {est.horario || "No definido"} | Curso: {est.tipo_curso || "N/A"}
                              {est.f_matricula && <span className="ml-2">Matrícula: {new Date(est.f_matricula).toLocaleDateString()}</span>}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>


            
            {estudianteSeleccionado && (
              <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <BookOpen className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        {estudianteSeleccionado.estudiante_nombre || "Sin nombre"}
                      </p>
                      <p className="text-xs text-green-600">
                        Cédula: {estudianteSeleccionado.estudiante_cedula || "N/A"} | Horario: {estudianteSeleccionado.horario || "No definido"} | Curso: {estudianteSeleccionado.tipo_curso || "N/A"}
                        {estudianteSeleccionado.f_matricula && (
                          <span className="ml-2">Matrícula: {new Date(estudianteSeleccionado.f_matricula).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={limpiarEstudiante} className="text-green-600 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Horas por Día
            </label>
            <select
              value={horasPorDia}
              onChange={(e) => setHorasPorDia(parseInt(e.target.value))}
             className="w-full border border-gray-300 rounded-2xl px-4 py-3.5 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-purple-400 cursor-pointer"
            >
              <option value={2}>2 horas por día</option>
              <option value={3}>3 horas por día</option>
              <option value={4}>4 horas por día</option>
              <option value={5}>5 horas por día</option>
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              Seleccionar Fecha de Inicio
              <span className="text-red-500">*</span>
            </label>
            
            <div className="flex items-center gap-3">
               <div className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 bg-white shadow-sm">
                  <span className={form.fecha_inicio ? "text-gray-700" : "text-gray-400"}>
                    {form.fecha_inicio
                      ? formatearFecha(form.fecha_inicio)
                      : "Seleccione una fecha"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarCalendarioSelector(true)}
                  className="h-12 w-12 flex items-center justify-center rounded-2xl bg-purple-100 text-purple-600 hover:bg-purple-200 hover:scale-105 transition-all duration-200 shadow-sm  hover:cursor-pointer"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              
              {mostrarCalendarioSelector && (
                <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
                  <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="bg-gradient-to-r from-purple-600 to-yellow-600 px-5 py-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => cambiarMes(-1)}
                        className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="text-center">
                        <p className="text-white font-bold text-lg">
                          {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
                        </p>
                        <p className="text-xs text-purple-100">
                          Seleccione la fecha de inicio
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => cambiarMes(1)}
                        className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-colors hover:cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {diasSemana.map((dia, idx) => (
                          <div
                            key={idx}
                            className="text-center text-xs font-bold text-gray-500 py-2"
                          >
                            {dia}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {diasMes.map((dia, idx) => {
                          const fechaStr = formatearFechaInput(dia.fecha);
                          const hoy = formatearFechaInput(obtenerHoyLocal());
                          const esHoy = fechaStr === hoy;
                          const esSeleccionada = fechaStr === form.fecha_inicio;
                          const modalidad = String(estudianteSeleccionado?.modalidad || "").toLowerCase();
                          const diaNum = dia.fecha.getDay();
                          const esFinSemana = diaNum === 0 || diaNum === 6;

                          const fechaBloqueada =
                            modalidad === "extraordinario"
                              ? !esFinSemana
                              : esFinSemana;

                          const esPasado = fechaMinima && dia.fecha < fechaMinima;

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => !esPasado && !fechaBloqueada && seleccionarFecha(dia.fecha)}
                              disabled={esPasado || fechaBloqueada}
                              className={`
                                relative h-11 rounded-xl text-sm font-semibold transition-all duration-200
                                ${!dia.isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                                ${esHoy && dia.isCurrentMonth ? "ring-2 ring-purple-300" : ""}
                                ${esSeleccionada ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md scale-105" : ""}
                                ${!esSeleccionada && !esPasado && !fechaBloqueada && dia.isCurrentMonth ? "hover:bg-purple-100 hover:scale-105 cursor-pointer" : ""}
                                ${fechaBloqueada && dia.isCurrentMonth ? "bg-red-50 text-red-300 cursor-not-allowed" : ""}
                                ${esPasado && dia.isCurrentMonth ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through" : ""}
                              `}
                            >
                              {dia.day}
                            </button>
                          );
                        })}
                      </div>

                      {/* <div className="mt-5 rounded-xl bg-gray-50 border border-gray-200 p-3 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                          <span className="text-gray-600">Fecha seleccionada</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-50 border border-red-200"></span>
                          <span className="text-gray-600">
                            {String(estudianteSeleccionado?.modalidad || "").toLowerCase() === "extraordinario"
                              ? "Lunes a viernes bloqueado"
                              : "Sábado y domingo bloqueado"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200"></span>
                          <span className="text-gray-600">Fecha no disponible</span>
                        </div>
                      </div> */}

                      <div className="flex justify-end gap-3 mt-5">
                        <button
                          type="button"
                          onClick={() => setMostrarCalendarioSelector(false)}
                          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition hover:cursor-pointer"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}


            </div>
          </div>

          {mostrarCalendario && fechasGeneradas.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-top-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Calendario de Clases (8 clases Prácticas){estudianteSeleccionado ? `” ${estudianteSeleccionado.nombre} ${estudianteSeleccionado.apellido || ''}` : ''}
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fechasGeneradas.map((fecha, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-blue-50 border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-500 text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm capitalize">{fecha.toLocaleDateString('es-ES', { weekday: 'long' })}</p>
                          <p className="text-gray-600 text-xs">{fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
                          {estudianteSeleccionado && (
                            <p className="text-[11px] text-blue-700 font-medium mt-0.5 truncate">
                               {estudianteSeleccionado.nombre} {estudianteSeleccionado.apellido || ''}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Horario</p>
                          <p className="text-sm font-medium text-blue-600">{horarioClase}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Resumen del Bloque
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div><span>Clases Prácticas automáticas</span></div>
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div><span>Duración: {horarioClase}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* {error && (
            <div className={`${error.includes('✅') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} border-2 text-sm rounded-xl p-4 flex items-start gap-2 animate-pulse`}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )} */}

          <div className="flex justify-end gap-3 pt-4 ">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 hover:scale-105 transition-all duration-200 hover:cursor-pointer" disabled={cargando}>
              Cancelar
            </button>
            <button type="submit" disabled={cargando} className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-yellow-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 hover:cursor-pointer">
              {cargando ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creando bloque...
                </div>
              ) : (
                "✅ Crear Bloque de Clases"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
