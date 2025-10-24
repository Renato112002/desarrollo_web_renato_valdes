document.addEventListener("DOMContentLoaded", () => {
    const avisoId = window.location.pathname.split("/").pop();
    const lista = document.getElementById("lista_comentarios");
    const form = document.getElementById("form_comentario");
    const msg = document.getElementById("mensaje_comentario");

    function mostrarMensaje(texto, exito = false) {
        msg.textContent = texto;
        msg.style.color = exito ? "green" : "red";
        msg.style.fontWeight = "bold";
        msg.style.marginTop = "10px";
    }

    function cargarComentarios() {
        fetch(`/comentarios/${avisoId}`)
            .then(res => res.json())
            .then(data => {
                lista.innerHTML = "";
                if (data.length === 0) {
                    lista.innerHTML = "<p>No hay comentarios aún.</p>";
                } else {
                    data.forEach(c => {
                        const div = document.createElement("div");
                        div.className = "comentario-item";
                        div.innerHTML = `
                            <p><strong>${c.nombre}</strong> <span style="color:#666;">(${c.fecha})</span></p>
                            <p>${c.texto}</p>
                        `;
                        lista.appendChild(div);
                    });
                }
            });
    }

    function validarComentario(nombre, texto) {
        const errores = [];

        if (!nombre) errores.push("Debe ingresar su nombre.");
        else if (nombre.length < 3 || nombre.length > 80)
            errores.push("El nombre debe tener entre 3 y 80 caracteres.");
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre))
            errores.push("El nombre solo puede contener letras y espacios.");

        if (!texto) errores.push("Debe ingresar un comentario.");
        else if (texto.length < 5)
            errores.push("El comentario debe tener al menos 5 caracteres.");
        else if (texto.length > 300)
            errores.push("El comentario no puede superar los 300 caracteres.");

        return errores;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre_comentario").value.trim();
        const texto = document.getElementById("texto_comentario").value.trim();

        const errores = validarComentario(nombre, texto);
        if (errores.length) {
            mostrarMensaje(errores[0], false); // solo mostramos el primer error
            return;
        }

        fetch(`/comentarios/${avisoId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, texto }),
        })
            .then((r) => r.json())
            .then((data) => {
                mostrarMensaje(data.mensaje || "Correcto.", !!data.ok);
                if (data.ok) {
                    form.reset();
                    cargarComentarios();
                }
            })
            .catch(() => {
                mostrarMensaje("No se pudo enviar el comentario.", false);
            });
    });

    cargarComentarios();
});
