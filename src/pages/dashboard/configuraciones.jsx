// src/pages/dashboard/configuraciones.jsx

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import axios from "../../api/axios";

import {
  IoSettingsOutline,
  IoAddOutline,
  IoSaveOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoCarSportOutline,
  IoCashOutline,
  IoSchoolOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";

function Configuraciones() {
  const endpoints = {
    roles: "/roles/",
    categorias: "/categorias/",
    pagosInstructor: "/pagos-instructor/",
    valoresCurso: "/valores-curso/",
    cargosInstitucionales: "/cargos-institucionales/",
  };

  const secciones = [
    {
      key: "roles",
      titulo: "Roles",
      subtitulo: "Control de permisos",
      descripcion:
        "Administra los roles que se usan para clasificar los accesos dentro del sistema, como administrador, instructor o estudiante.",
      endpoint: endpoints.roles,
      icono: IoShieldCheckmarkOutline,
      color: "blue",
      campos: [
        {
          name: "nombre",
          label: "Nombre del rol",
          type: "text",
          placeholder: "Ejemplo: Administrador",
          required: true,
        },
      ],
      columnas: [
        {
          key: "nombre",
          label: "Rol",
        },
      ],
      formInicial: {
        nombre: "",
      },
    },
    {
      key: "categorias",
      titulo: "Categorías de vehículo",
      subtitulo: "Categorías para matrícula",
      descripcion:
        "Administra las categorías de vehículo que se asignan durante el proceso de matrícula.",
      endpoint: endpoints.categorias,
      icono: IoCarSportOutline,
      color: "emerald",
      campos: [
        {
          name: "nombre",
          label: "Nombre de la categoría",
          type: "text",
          placeholder: "Ejemplo: Profesional 1,2,3,5,6,7 y 8",
          required: true,
        },
      ],
      columnas: [
        {
          key: "nombre",
          label: "Categoría",
        },
      ],
      formInicial: {
        nombre: "",
      },
    },
    {
      key: "pagosInstructor",
      titulo: "Pago de instructores",
      subtitulo: "Monto por alumno",
      descripcion:
        "Configura el monto que se le paga al instructor por alumno. Si registras un pago activo, el sistema puede usarlo como pago vigente.",
      endpoint: endpoints.pagosInstructor,
      icono: IoCashOutline,
      color: "amber",
      campos: [
        {
          name: "monto_por_alumno",
          label: "Monto por alumno",
          type: "number",
          placeholder: "Ejemplo: 500",
          required: true,
        },
        {
          name: "fecha_inicio",
          label: "Fecha de inicio",
          type: "date",
          required: true,
        },
        {
          name: "fecha_fin",
          label: "Fecha de finalización",
          type: "date",
          required: false,
        },
        {
          name: "descripcion",
          label: "Descripción",
          type: "text",
          placeholder: "Ejemplo: Pago vigente para cursos regulares",
          required: false,
        },
        {
          name: "activo",
          label: "Pago activo",
          type: "checkbox",
          required: false,
        },
      ],
      columnas: [
        {
          key: "monto_por_alumno",
          label: "Monto",
          money: true,
        },
        {
          key: "fecha_inicio",
          label: "Inicio",
          date: true,
        },
        {
          key: "fecha_fin",
          label: "Fin",
          date: true,
        },
        {
          key: "descripcion",
          label: "Descripción",
        },
        {
          key: "activo",
          label: "Estado",
          boolean: true,
        },
      ],
      formInicial: {
        monto_por_alumno: "",
        fecha_inicio: "",
        fecha_fin: "",
        descripcion: "",
        activo: true,
      },
    },
    {
      key: "valoresCurso",
      titulo: "Valores de curso",
      subtitulo: "Precios y horas",
      descripcion:
        "Configura el precio por hora, cantidad de horas y precio total de los cursos Principiante, Intermedio y Avanzado.",
      endpoint: endpoints.valoresCurso,
      icono: IoSchoolOutline,
      color: "purple",
      campos: [
        {
          name: "tipo_curso",
          label: "Tipo de curso",
          type: "select",
          required: true,
          options: [
            {
              value: "Principiante",
              label: "Principiante",
            },
            {
              value: "Intermedio",
              label: "Intermedio",
            },
            {
              value: "Avanzado",
              label: "Avanzado",
            },
          ],
        },
        {
          name: "precio_hora",
          label: "Precio por hora",
          type: "number",
          placeholder: "Ejemplo: 433.33",
          required: true,
        },
        {
          name: "cantidad_horas",
          label: "Cantidad de horas",
          type: "number",
          placeholder: "Ejemplo: 15",
          required: true,
        },
        {
          name: "precio_total",
          label: "Precio total",
          type: "number",
          placeholder: "Ejemplo: 6500",
          required: true,
        },
        {
          name: "activo",
          label: "Curso activo",
          type: "checkbox",
          required: false,
        },
      ],
      columnas: [
        {
          key: "tipo_curso",
          label: "Curso",
        },
        {
          key: "precio_hora",
          label: "Precio/hora",
          money: true,
        },
        {
          key: "cantidad_horas",
          label: "Horas",
        },
        {
          key: "precio_total",
          label: "Total",
          money: true,
        },
        {
          key: "activo",
          label: "Estado",
          boolean: true,
        },
      ],
      formInicial: {
        tipo_curso: "Principiante",
        precio_hora: "",
        cantidad_horas: 15,
        precio_total: "",
        activo: true,
      },
    },
    {
      key: "cargosInstitucionales",
      titulo: "Cargos institucionales",
      subtitulo: "Autoridades y cargos",
      descripcion:
        "Administra los cargos internos del instituto, como gerente, director, secretaria u otros cargos institucionales.",
      endpoint: endpoints.cargosInstitucionales,
      icono: IoBriefcaseOutline,
      color: "rose",
      campos: [
        {
          name: "nombre",
          label: "Nombre completo",
          type: "text",
          placeholder: "Ejemplo: Juan Pérez",
          required: true,
        },
        {
          name: "cargo",
          label: "Cargo",
          type: "text",
          placeholder: "Ejemplo: Director académico",
          required: true,
        },
        {
          name: "tipo",
          label: "Tipo de cargo",
          type: "select",
          required: true,
          options: [
            {
              value: "gerente",
              label: "Gerente",
            },
            {
              value: "director",
              label: "Director",
            },
            {
              value: "secretaria",
              label: "Secretaria",
            },
            {
              value: "otro",
              label: "Otro",
            },
          ],
        },
        {
          name: "activo",
          label: "Cargo activo",
          type: "checkbox",
          required: false,
        },
      ],
      columnas: [
        {
          key: "nombre",
          label: "Nombre",
        },
        {
          key: "cargo",
          label: "Cargo",
        },
        {
          key: "tipo",
          label: "Tipo",
        },
        {
          key: "activo",
          label: "Estado",
          boolean: true,
        },
      ],
      formInicial: {
        nombre: "",
        cargo: "",
        tipo: "otro",
        activo: true,
      },
    },
  ];

  const [seccionActiva, setSeccionActiva] = useState("roles");
  const [datos, setDatos] = useState({});
  const [formulario, setFormulario] = useState({});
  const [registroEditando, setRegistroEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const configActual = useMemo(() => {
    return secciones.find((item) => item.key === seccionActiva);
  }, [seccionActiva]);

  const registrosActuales = datos[seccionActiva] || [];

  useEffect(() => {
    if (!configActual) return;

    setFormulario(configActual.formInicial);
    setRegistroEditando(null);
    cargarDatos(configActual);
  }, [configActual]);

  const obtenerClaseColor = (color) => {
    const colores = {
      blue: {
        fondo: "bg-blue-50",
        texto: "text-blue-600",
        borde: "border-blue-200",
        activo: "bg-blue-600 text-white border-blue-600",
        hover: "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200",
      },
      emerald: {
        fondo: "bg-emerald-50",
        texto: "text-emerald-600",
        borde: "border-emerald-200",
        activo: "bg-emerald-600 text-white border-emerald-600",
        hover: "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200",
      },
      amber: {
        fondo: "bg-amber-50",
        texto: "text-amber-600",
        borde: "border-amber-200",
        activo: "bg-amber-500 text-white border-amber-500",
        hover: "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200",
      },
      purple: {
        fondo: "bg-purple-50",
        texto: "text-purple-600",
        borde: "border-purple-200",
        activo: "bg-purple-600 text-white border-purple-600",
        hover: "hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200",
      },
      rose: {
        fondo: "bg-rose-50",
        texto: "text-rose-600",
        borde: "border-rose-200",
        activo: "bg-rose-600 text-white border-rose-600",
        hover: "hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200",
      },
    };

    return colores[color] || colores.blue;
  };

  const obtenerMensajeError = (error) => {
    const data = error.response?.data;

    if (!data) {
      return "No se pudo conectar con el servidor.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (data.error) {
      return data.error;
    }

    const primerCampo = Object.keys(data)[0];

    if (primerCampo) {
      const valor = data[primerCampo];

      if (Array.isArray(valor)) {
        return `${primerCampo}: ${valor[0]}`;
      }

      return `${primerCampo}: ${valor}`;
    }

    return "No se pudo procesar la solicitud.";
  };

  const cargarDatos = async (config = configActual) => {
    if (!config) return;

    setCargando(true);

    try {
      const response = await axios.get(config.endpoint);

      const resultado = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setDatos((prev) => ({
        ...prev,
        [config.key]: resultado,
      }));
    } catch (error) {
      console.error("Error cargando datos de configuración:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo cargar",
        text: `No se pudieron cargar los datos de ${config.titulo}.`,
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    if (!configActual) return;

    setFormulario(configActual.formInicial);
    setRegistroEditando(null);
  };

  const cambiarCampo = (campo, valor) => {
    setFormulario((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const validarFormulario = () => {
    const camposRequeridos = configActual.campos.filter(
      (campo) => campo.required
    );

    for (const campo of camposRequeridos) {
      const valor = formulario[campo.name];

      if (valor === "" || valor === null || valor === undefined) {
        Swal.fire({
          icon: "warning",
          title: "Campo requerido",
          text: `Debes completar el campo: ${campo.label}.`,
          confirmButtonColor: "#2563eb",
        });

        return false;
      }
    }

    return true;
  };

  const prepararPayload = () => {
    const payload = { ...formulario };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") {
        payload[key] = null;
      }
    });

    return payload;
  };

  const guardarRegistro = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setGuardando(true);

    try {
      const payload = prepararPayload();

      if (registroEditando) {
        await axios.patch(
          `${configActual.endpoint}${registroEditando.id}/`,
          payload
        );

        Swal.fire({
          icon: "success",
          title: "Registro actualizado",
          text: "Los cambios se guardaron correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await axios.post(configActual.endpoint, payload);

        Swal.fire({
          icon: "success",
          title: "Registro creado",
          text: "El registro se guardó correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      console.error("Error guardando registro:", error);

      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: obtenerMensajeError(error),
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setGuardando(false);
    }
  };

  const editarRegistro = (registro) => {
    const nuevoFormulario = { ...configActual.formInicial };

    configActual.campos.forEach((campo) => {
      nuevoFormulario[campo.name] =
        registro[campo.name] !== null && registro[campo.name] !== undefined
          ? registro[campo.name]
          : configActual.formInicial[campo.name];
    });

    setFormulario(nuevoFormulario);
    setRegistroEditando(registro);
  };

  const eliminarRegistro = async (registro) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar registro?",
      text: "Esta acción intentará eliminar el registro seleccionado. Si está relacionado con otros datos del sistema, el backend puede impedirlo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await axios.delete(`${configActual.endpoint}${registro.id}/`);

      Swal.fire({
        icon: "success",
        title: "Registro eliminado",
        timer: 1400,
        showConfirmButton: false,
      });

      cargarDatos();
    } catch (error) {
      console.error("Error eliminando registro:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text:
          obtenerMensajeError(error) ||
          "Este registro puede estar relacionado con otros datos del sistema.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const alternarActivo = async (registro) => {
    try {
      await axios.patch(`${configActual.endpoint}${registro.id}/`, {
        activo: !registro.activo,
      });

      cargarDatos();
    } catch (error) {
      console.error("Error cambiando estado:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo cambiar el estado",
        text: obtenerMensajeError(error),
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const formatearFecha = (valor) => {
    if (!valor) return "—";

    try {
      const fecha = new Date(`${valor}T00:00:00`);

      return fecha.toLocaleDateString("es-NI", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return valor;
    }
  };

  const formatearDinero = (valor) => {
    return `C$ ${Number(valor || 0).toLocaleString("es-NI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatearValor = (registro, columna) => {
    const valor = registro[columna.key];

    if (columna.boolean) {
      return valor ? (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
          <IoCheckmarkCircleOutline />
          Activo
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100">
          <IoCloseCircleOutline />
          Inactivo
        </span>
      );
    }

    if (columna.money) {
      return formatearDinero(valor);
    }

    if (columna.date) {
      return formatearFecha(valor);
    }

    if (valor === null || valor === undefined || valor === "") {
      return "—";
    }

    return valor;
  };

  const renderCampo = (campo) => {
    if (campo.type === "select") {
      return (
        <div key={campo.name}>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            {campo.label}
          </label>

          <select
            value={formulario[campo.name] ?? ""}
            onChange={(e) => cambiarCampo(campo.name, e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
          >
            {campo.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (campo.type === "checkbox") {
      return (
        <div
          key={campo.name}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-sm font-bold text-slate-700">{campo.label}</p>

            <p className="text-xs text-slate-400 mt-0.5">
              Define si este registro estará disponible para usarse en el
              sistema.
            </p>
          </div>

          <input
            type="checkbox"
            checked={Boolean(formulario[campo.name])}
            onChange={(e) => cambiarCampo(campo.name, e.target.checked)}
            className="w-5 h-5 accent-blue-600 cursor-pointer"
          />
        </div>
      );
    }

    return (
      <div key={campo.name}>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {campo.label}
        </label>

        <input
          type={campo.type}
          value={formulario[campo.name] ?? ""}
          onChange={(e) => cambiarCampo(campo.name, e.target.value)}
          placeholder={campo.placeholder || ""}
          step={campo.type === "number" ? "0.01" : undefined}
          min={campo.type === "number" ? "0" : undefined}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
        />
      </div>
    );
  };

  const colorActual = obtenerClaseColor(configActual?.color);
  const IconoActual = configActual?.icono || IoSettingsOutline;

  return (
    <div className="min-h-full bg-slate-50 rounded-3xl p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <IoSettingsOutline size="1.8rem" />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-800">
                  Configuración del sistema
                </h1>

                <p className="text-sm text-slate-500 mt-1 max-w-3xl">
                  Administra los catálogos principales que usa el sistema en
                  usuarios, matrículas, pagos, cursos e información
                  institucional.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => cargarDatos()}
              className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition shadow-sm"
            >
              <IoRefreshOutline size="1.2rem" />
              Actualizar datos
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
          <aside className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 h-fit">
            <p className="text-xs font-black text-slate-400 px-3 mb-3">
              CATÁLOGOS DEL SISTEMA
            </p>

            <div className="space-y-2">
              {secciones.map((seccion) => {
                const Icono = seccion.icono;
                const color = obtenerClaseColor(seccion.color);
                const activo = seccionActiva === seccion.key;
                const total = datos[seccion.key]?.length || 0;

                return (
                  <button
                    key={seccion.key}
                    type="button"
                    onClick={() => setSeccionActiva(seccion.key)}
                    className={`cursor-pointer w-full text-left flex items-center gap-3 px-3 py-3 rounded-2xl border transition ${
                      activo
                        ? color.activo
                        : `bg-white border-transparent text-slate-600 ${color.hover}`
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        activo
                          ? "bg-white/20 text-white"
                          : `${color.fondo} ${color.texto}`
                      }`}
                    >
                      <Icono size="1.25rem" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black truncate">
                        {seccion.titulo}
                      </p>

                      <p
                        className={`text-xs truncate ${
                          activo ? "text-white/80" : "text-slate-400"
                        }`}
                      >
                        {seccion.subtitulo}
                      </p>
                    </div>

                    <span
                      className={`min-w-7 h-7 px-2 rounded-full text-xs font-black flex items-center justify-center ${
                        activo
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {total}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <div className="flex items-start gap-3">
                <IoInformationCircleOutline
                  className="text-blue-600 flex-shrink-0 mt-0.5"
                  size="1.3rem"
                />

                <p className="text-xs text-blue-700 leading-relaxed">
                  Estos registros son catálogos base. Si un dato ya está siendo
                  usado en matrículas, usuarios, recibos o reportes, puede que
                  no se pueda eliminar directamente.
                </p>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-3xl ${colorActual.fondo} ${colorActual.texto} flex items-center justify-center flex-shrink-0`}
                  >
                    <IconoActual size="1.7rem" />
                  </div>

                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800">
                      {configActual.titulo}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                      {configActual.descripcion}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                  <p className="text-xs text-slate-400 font-bold">
                    Registros guardados
                  </p>

                  <p className="text-2xl font-black text-slate-800">
                    {registrosActuales.length}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 2xl:grid-cols-[420px_1fr] gap-6">
              <form
                onSubmit={guardarRegistro}
                className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 h-fit"
              >
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      {registroEditando ? "Editar registro" : "Nuevo registro"}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Completa los campos requeridos.
                    </p>
                  </div>

                  {registroEditando && (
                    <button
                      type="button"
                      onClick={limpiarFormulario}
                      className="cursor-pointer w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center"
                      title="Cancelar edición"
                    >
                      <IoCloseOutline size="1.4rem" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {configActual.campos.map((campo) => renderCampo(campo))}
                </div>

                <button
                  type="submit"
                  disabled={guardando}
                  className="cursor-pointer mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
                >
                  {registroEditando ? (
                    <>
                      <IoSaveOutline size="1.2rem" />
                      Guardar cambios
                    </>
                  ) : (
                    <>
                      <IoAddOutline size="1.3rem" />
                      Crear registro
                    </>
                  )}
                </button>
              </form>

              <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      Registros guardados
                    </h3>

                    <p className="text-sm text-slate-500">
                      Lista actual de {configActual.titulo.toLowerCase()}.
                    </p>
                  </div>

                  {cargando && (
                    <span className="text-sm font-bold text-blue-600">
                      Cargando...
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {configActual.columnas.map((columna) => (
                          <th
                            key={columna.key}
                            className="px-5 py-4 text-left text-xs font-black text-slate-500 uppercase whitespace-nowrap"
                          >
                            {columna.label}
                          </th>
                        ))}

                        <th className="px-5 py-4 text-right text-xs font-black text-slate-500 uppercase whitespace-nowrap">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {!cargando && registrosActuales.length === 0 && (
                        <tr>
                          <td
                            colSpan={configActual.columnas.length + 1}
                            className="px-5 py-12 text-center"
                          >
                            <div className="mx-auto w-14 h-14 rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
                              <IoSettingsOutline size="1.6rem" />
                            </div>

                            <p className="font-black text-slate-700">
                              No hay registros
                            </p>

                            <p className="text-sm text-slate-400 mt-1">
                              Crea el primer registro desde el formulario.
                            </p>
                          </td>
                        </tr>
                      )}

                      {registrosActuales.map((registro) => (
                        <tr
                          key={registro.id}
                          className="hover:bg-slate-50/70 transition"
                        >
                          {configActual.columnas.map((columna) => (
                            <td
                              key={columna.key}
                              className="px-5 py-4 text-slate-700 font-medium whitespace-nowrap"
                            >
                              {formatearValor(registro, columna)}
                            </td>
                          ))}

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {Object.prototype.hasOwnProperty.call(
                                registro,
                                "activo"
                              ) && (
                                <button
                                  type="button"
                                  onClick={() => alternarActivo(registro)}
                                  className={`cursor-pointer px-3 py-2 rounded-xl text-xs font-black transition ${
                                    registro.activo
                                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  }`}
                                >
                                  {registro.activo ? "Desactivar" : "Activar"}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => editarRegistro(registro)}
                                className="cursor-pointer w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center"
                                title="Editar"
                              >
                                <IoCreateOutline size="1.2rem" />
                              </button>

                              <button
                                type="button"
                                onClick={() => eliminarRegistro(registro)}
                                className="cursor-pointer w-10 h-10 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center"
                                title="Eliminar"
                              >
                                <IoTrashOutline size="1.2rem" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </section>
          </main>
        </section>
      </div>
    </div>
  );
}

export default Configuraciones;