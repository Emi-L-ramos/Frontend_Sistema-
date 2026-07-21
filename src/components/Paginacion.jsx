function Paginacion({
    pagina,
    total,
    porPagina = 25,
    cargando = false,
    onChange,
}) {
    const totalPaginas = Math.max(
        1,
        Math.ceil(total / porPagina)
    );

    if (totalPaginas <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-500">
                Página {pagina} de {totalPaginas} · {total} registros
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={pagina <= 1 || cargando}
                    onClick={() => onChange(pagina - 1)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Anterior
                </button>

                <button
                    type="button"
                    disabled={
                        pagina >= totalPaginas ||
                        cargando
                    }
                    onClick={() => onChange(pagina + 1)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}

export default Paginacion;