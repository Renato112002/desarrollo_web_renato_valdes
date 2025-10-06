document.addEventListener("DOMContentLoaded", function () {
    const tabla = document.querySelector("#tabla_listado_adopciones");
    const filas = tabla.querySelectorAll("tbody tr");
    filas.forEach(fila => {
        fila.addEventListener("click", () => {
            window.location.href = "ficha_adopcion.html"
        });
    });
});