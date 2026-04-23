import { useEffect } from "react";
import { listarCitas } from "../api/calendario";

export function useExamenNotificaciones() {
  useEffect(() => {
    const verificarExamenes = async () => {
      // Pedir permiso
      if (!("Notification" in window)) return;

      let permiso = Notification.permission;
      if (permiso === "default") {
        permiso = await Notification.requestPermission();
      }
      if (permiso !== "granted") return;

      // Obtener exámenes de hoy y mañana
      const hoy = new Date();
      const manana = new Date(hoy);
      manana.setDate(hoy.getDate() + 1);

      const formatFecha = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const mesActual = formatFecha(hoy).slice(0, 7);
      const citas = await listarCitas({ mes: mesActual });
      const lista = Array.isArray(citas) ? citas : citas.results || [];

      const examenes = lista.filter(
        (c) =>
          c.numero_clase === 9 &&
          (c.fecha === formatFecha(hoy) || c.fecha === formatFecha(manana))
      );

      examenes.forEach((examen) => {
        const esHoy = examen.fecha === formatFecha(hoy);
        const titulo = esHoy
          ? "📋 Examen HOY"
          : "📋 Examen MAÑANA";

        const cuerpo = `${examen.estudiante_nombre} — ${examen.hora_inicio?.slice(0, 5)} a ${examen.hora_fin?.slice(0, 5)}\nInstructor: ${examen.instructor_nombre}`;

        new Notification(titulo, {
          body: cuerpo,
          icon: "/favicon.ico",
          tag: `examen-${examen.id}`,
        });
      });
    };

    // Verificar al cargar y cada hora
    verificarExamenes();
    const intervalo = setInterval(verificarExamenes, 60 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);
}