async function cargarAvisos() {
    try {
        let respuesta = await fetch("/api/avisos");
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        let avisos = await respuesta.json();

        let tbody = document.getElementById("tabla-avisos");
        if (!tbody) {
            console.error("Error");
            return;
        }

        tbody.innerHTML = "";

        avisos.forEach(a => {
            let tr = document.createElement("tr");
            let unidad = a.unidad === "m" ? "meses" : "años";

            tr.innerHTML = `
                <td>${a.id}</td>
                <td>${a.fecha_publicacion}</td>
                <td>${a.sector}</td>
                <td>${a.cantidad}</td>
                <td>${a.tipo}</td>
                <td>${a.edad} ${unidad}</td>
                <td>${a.comuna}</td>
                <td>${a.nota === null ? "-" : a.nota}</td>
                <td>
                    <button class="boton boton-primario" onclick="abrirModal(${a.id})">
                        Evaluar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error", error);
    }
}

let avisoSeleccionado = null;
let notaSeleccionada = null;

function seleccionarNota(n) {
    notaSeleccionada = n;

    document.querySelectorAll(".nota-boton").forEach(boton => {
        boton.classList.remove("seleccionado");
    });

    let boton = Array.from(document.querySelectorAll(".nota-boton"))
        .find(b => b.textContent == n);
    if (boton) boton.classList.add("seleccionado");
}

function abrirModal(idAviso) {
    avisoSeleccionado = idAviso;
    notaSeleccionada = null;

    document.querySelectorAll(".nota-boton").forEach(boton => {
        boton.classList.remove("seleccionado");
    });

    let modal = document.getElementById("modal-evaluacion");
    modal.classList.remove("oculto");
}

function cerrarModal() {
    let modal = document.getElementById("modal-evaluacion");
    modal.classList.add("oculto");
}

async function confirmarNota() {
    if (!notaSeleccionada) {
        alert("Debe seleccionar una nota");
        return;
    }

    try {
        let respuesta = await fetch("/api/avisos/evaluar", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `avisoId=${avisoSeleccionado}&nuevaNota=${notaSeleccionada}`
        });

        if (respuesta.ok) {
            let msg = document.getElementById("mensaje-estado");
            msg.textContent = "Nota guardada exitosamente";
            msg.style.display = "block";
            setTimeout(async () => {
                cerrarModal();
                msg.style.display = "none";
                await cargarAvisos();
            }, 700);
        }
        else {
            alert("Error");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error de envio de la nota");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cargarAvisos();
});