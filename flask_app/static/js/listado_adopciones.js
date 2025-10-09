document.addEventListener("DOMContentLoaded", () => {
    const filas = document.querySelectorAll("#tabla_listado_adopciones tbody tr");

    filas.forEach((fila) => {
        fila.addEventListener("click", () => {
            const avisoId = fila.dataset.id;
            if (avisoId) {
                window.location.href = `/detalle/${avisoId}`;
            }
        });
    });
});
