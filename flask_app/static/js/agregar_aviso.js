document.addEventListener("DOMContentLoaded", () => {
    const validarLongitud = (t, min, max) => t.length >= min && t.length <= max;
    const validarEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 100;
    const validarTelefono = t => /^\+\d{3}\.\d{8}$/.test(t);

    const regionSelect = document.getElementById("select_region");
    const comunaSelect = document.getElementById("select_comuna");

    if (regionSelect && comunaSelect) {
        regionSelect.addEventListener("change", () => {
            const regionId = regionSelect.value;
            comunaSelect.innerHTML = '<option value="">Seleccione una comuna</option>';
            if (window.comunasPorRegion && window.comunasPorRegion[regionId]) {
                window.comunasPorRegion[regionId].forEach(comuna => {
                    const opt = document.createElement("option");
                    opt.value = comuna.id;
                    opt.textContent = comuna.nombre;
                    comunaSelect.appendChild(opt);
                });
            }
        });
    }

    const inputFecha = document.getElementById("fecha_entrega");
    if (inputFecha) {
        const ahora = new Date();
        ahora.setHours(ahora.getHours() + 3);
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, "0");
        const dia = String(ahora.getDate()).padStart(2, "0");
        const hora = String(ahora.getHours()).padStart(2, "0");
        const minuto = String(ahora.getMinutes()).padStart(2, "0");
        const fechaFormateada = `${año}-${mes}-${dia}T${hora}:${minuto}`;

        inputFecha.value = fechaFormateada;
        inputFecha.min = fechaFormateada;
    }

    const contenedorFotos = document.getElementById("fotos-container");
    const botonAgregarFoto = document.getElementById("agregar-foto");
    const mensajeErrorFoto = document.getElementById("foto-error");

    if (botonAgregarFoto && contenedorFotos) {
        botonAgregarFoto.addEventListener("click", e => {
            e.preventDefault();
            const total = contenedorFotos.querySelectorAll("input[type='file']").length;
            if (total >= 5) {
                mensajeErrorFoto.textContent = "Máximo 5 fotos permitidas.";
                return;
            }
            const nuevo = document.createElement("input");
            nuevo.type = "file";
            nuevo.name = "fotos[]";
            nuevo.accept = "image/*";
            contenedorFotos.appendChild(nuevo);
            mensajeErrorFoto.textContent = "";
        });
    }

    const contenedorContactos = document.getElementById("contactos-container");
    const botonAgregarContacto = document.getElementById("agregar-contacto");
    const mensajeErrorContacto = document.getElementById("contacto-error");

    if (botonAgregarContacto && contenedorContactos) {
        botonAgregarContacto.addEventListener("click", e => {
            e.preventDefault();
            const total = contenedorContactos.querySelectorAll(".contacto-item").length;
            if (total >= 5) {
                mensajeErrorContacto.textContent = "Máximo 5 contactos permitidos.";
                return;
            }
            const nuevo = document.createElement("div");
            nuevo.classList.add("contacto-item");
            nuevo.innerHTML = `
                <select name="contactar_por[]" class="select-contacto" required>
                    <option value="">Seleccione...</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                    <option value="X">X</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="otra">Otra</option>
                </select>
                <input type="text" name="contacto_info[]" class="input-contacto"
                       placeholder="ID o URL (4-50 caracteres)" minlength="4" maxlength="50">
            `;
            contenedorContactos.appendChild(nuevo);
            mensajeErrorContacto.textContent = "";
        });
    }

    function validarFormularioPersonalizado() {
        let valido = true;
        const errores = {};
        const region = regionSelect.value;
        const comuna = comunaSelect.value;
        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim();
        const celular = document.getElementById("celular").value.trim();
        const tipo = document.getElementById("tipo").value;
        const cantidad = document.getElementById("cantidad").value;
        const edad = document.getElementById("edad").value;
        const fechaEntrega = document.getElementById("fecha_entrega").value;
        const fotos = contenedorFotos.querySelectorAll("input[type='file']");

        if (!region) { errores.region = "Debe seleccionar una región"; valido = false; }
        if (!comuna) { errores.comuna = "Debe seleccionar una comuna"; valido = false; }
        if (!validarLongitud(nombre, 3, 200)) { errores.nombre = "El nombre debe tener entre 3 y 200 caracteres"; valido = false; }
        if (!validarEmail(email)) { errores.email = "Ingrese un email válido"; valido = false; }
        if (!validarTelefono(celular)) { errores.celular = "Formato inválido. Ejemplo: +569.12345678"; valido = false; }
        if (!tipo) { errores.tipo = "Seleccione tipo de mascota"; valido = false; }
        if (cantidad < 1) { errores.cantidad = "Cantidad debe ser ≥ 1"; valido = false; }
        if (edad < 1) { errores.edad = "Edad debe ser ≥ 1"; valido = false; }
        if (!fechaEntrega) { errores.fecha_entrega = "Debe indicar fecha de entrega"; valido = false; }
        else if (inputFecha && fechaEntrega < inputFecha.min) {
            errores.fecha_entrega = "La fecha debe ser posterior a la actual (+3 horas)";
            valido = false;
        }
        if (fotos.length < 1) { errores.fotos = "Debe subir al menos una foto"; valido = false; }

        document.querySelectorAll(".mensaje-error").forEach(e => e.textContent = "");
        for (const campo in errores) {
            const el = document.getElementById(`error-${campo}`);
            if (el) el.textContent = errores[campo];
        }
        return valido;
    }

    const formulario = document.getElementById("formulario_adopcion");
    const modal = document.getElementById("confirmacionModal");
    const btnConfirmar = document.getElementById("btnConfirmar");
    const btnCancelar = document.getElementById("btnCancelar");

    formulario.addEventListener("submit", e => {
        if (!formulario.checkValidity()) {
            e.preventDefault();
            formulario.reportValidity();
            return;
        }

        e.preventDefault();
        if (!validarFormularioPersonalizado()) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        modal.style.display = "flex";
    });

    btnConfirmar.addEventListener("click", async () => {
        modal.style.display = "none";
        const formData = new FormData(formulario);

        try {
            const resp = await fetch("/agregar", { method: "POST", body: formData });
            const data = await resp.json();

            if (data.ok) {
                mostrarModalExito();
            } else {
                alert("Error al guardar el aviso en el servidor.");
            }
        } catch (err) {
            console.error("Error al enviar:", err);
            alert("Ocurrió un error al enviar el formulario.");
        }
    });

    btnCancelar.addEventListener("click", () => {
        modal.style.display = "none";
    });

    function mostrarModalExito() {
        const modalExito = document.createElement("div");
        modalExito.classList.add("modal");
        modalExito.style.display = "flex";
        modalExito.innerHTML = `
        <div class="modal-content" style="max-width: 480px;">
            <h3 style="color:#1a4a7a; margin-bottom:10px;">Aviso publicado correctamente!!</h3>
            <p style="color:#333; margin-bottom:25px;">Gracias por compartir este aviso de adopción.<br>Tu publicación ha sido registrada con éxito.</p>
            <div class="botones-modal">
                <button id="btnVolverInicio" class="botonFormulario">Volver al inicio</button>
                <button id="btnNuevoAviso" class="botonSecundario">Agregar otro aviso</button>
            </div>
        </div>
    `;
        document.body.appendChild(modalExito);

        document.getElementById("btnVolverInicio").addEventListener("click", () => {
            window.location.href = "/";
        });

        document.getElementById("btnNuevoAviso").addEventListener("click", () => {
            window.location.href = "/agregar";
        });
    }
});
