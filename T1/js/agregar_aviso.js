function validarLongitud(texto, min, max) {
    return texto.length >= min && texto.length <= max;
}

function validarEmail(email) {
    let lengthValid = email.length <= 100;

    let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let formatValid = re.test(email);

    return lengthValid && formatValid;
}

function validarTelefono(telefono) {
    let lengthValid = telefono.length >= 8;

    let re = /^\+\d{3}\.\d{8}$/;
    let formatValid = re.test(telefono.replace(/\s/g, ''));

    return lengthValid && formatValid;
}

function validarFormulario() {
    let valido = true;

    const region = document.getElementById('select_region');
    const comuna = document.getElementById('select_comuna');
    const sector = document.getElementById('sector');
    const nombre = document.getElementById('nombre');
    const email = document.getElementById('email');
    const telefono = document.getElementById('telefono');
    const contacto = document.getElementById('contacto');
    const informacion_contacto = document.getElementById('informacion_contacto');
    const tipoMascota = document.getElementById('tipo_mascota');
    const cantidad = document.getElementById('cantidad');
    const edad = document.getElementById('edad');
    const unidadEdad = document.getElementById('unidad_edad');
    const fechaEntrega = document.getElementById('fecha_entrega');
    const descripcion = document.getElementById('descripcion');
    const foto = document.getElementById('foto');

    if (!region.value) {
        document.getElementById("error-region").textContent = 'Debe selecionar una region';
        valido = false;
    }
    if (!comuna.value) {
        document.getElementById("error-comuna").textContent = 'Debe selecionar una comuna';
        valido = false;
    }
    if (!nombre.value) {
        document.getElementById("error-nombre").textContent = 'El nombre de contacto es obligatorio';
        valido = false;
    } else if (!validarLongitud(nombre, 3, 200)) {
        document.getElementById("error-nombre").textContent = 'El nombre de contacto debe tener entre 3 y 200 caracteres';
        valido = false;
    }
    if (!email.value) {
        document.getElementById("error-email").textContent = 'El email es obligatorio';
        valido = false;
    } else if (!validarEmail(email)) {
        document.getElementById("error-email").textContent = 'El formato de email no es válido';
        valido = false;
    }
    if (!validarTelefono(telefono)) {
        document.getElementById("error-celular").textContent = 'El formato de telefono no es válido';
        valido = false;
    }
    if(!validarLongitud(contacto, 4 , 50)) {
        document.getElementById("error-celular").textContent = 'Debe tener entre 4 y 50 caracteres';
        valido = false;
    }
    if (!tipoMascota.value) {
        document.getElementById("error-tipo").textContent = 'El tipo de mascota es obligatorio';
        valido = false;
    }
    if (!cantidad.value) {
        document.getElementById("error-cantidad").textContent = 'La cantidad es obligatorio';
        valido = false;
    } else if (typeof cantidad !== 'number'  || !Number.isInteger(parseFloat(cantidad))) {
        document.getElementById("error-cantidad").textContent = 'La cantidad debe ser un numero entero';
        valido = false;
    } else if (!cantidad < 1) {
        document.getElementById("error-cantidad").textContent = 'La cantidad debe ser mayor o igual a 1';
        valido = false;
    }
    if (!edad.value) {
        document.getElementById("error-edad").textContent = 'La edad es obligatoria';
        valido = false;
    } else if (typeof edad !== 'number'  || !Number.isInteger(parseFloat(edad))) {
        document.getElementById("error-edad").textContent = 'La edad debe ser un numero entero';
        valido = false;
    } else if (!edad < 1) {
        document.getElementById("error-edad").textContent = 'La edad debe ser mayor o igual a 1';
        valido = false;
    }
    if(!unidadEdad.value) {
        document.getElementById("error-unidad-edad").textContent = 'La unidad es obligatoria';
        valido = false;
    }
    if (!fechaEntrega.value) {
        document.getElementById("error-fecha-entrega").textContent = 'La fecha entrega es obligatoria';
        valido = false;
        errores.push('');
    } else {
        const fechaMinima = new Date(fechaEntrega.min);
        const fechaSeleccionada = new Date(fechaEntrega.value);
        if (fechaSeleccionada < fechaMinima) {
            document.getElementById("error-fecha-entrega").textContent = 'La fecha entrega debe ser mayor o igual en 3 horas a la fecha actual';
            valido = false;
        }
    }
    if (fotosCargadas.length === 0) {
        document.getElementById("error-foto").textContent = 'Debe cargar al menos una foto';
        valido = false;
    } else if (fotosCargadas.length > 5) {
        document.getElementById("error-foto").textContent = 'No puede cargar mas de 5 fotos';
        valido = false;
    }

    if (valido) {
        document.getElementById('boton_confirmar_aviso').style.display = 'block';
        document.getElementById('formulario_adopcion').style.display = 'none';
    }
    return valido;
}

function confirmarEnvio() {
    document.getElementById('confirmacion').style.display = 'none';
    document.getElementById('mensaje_exito').style.display = 'block';
}

function cancelarEnvio() {
    document.getElementById('confirmacion').style.display = 'none';
    document.getElementById('formulario_adopcion').style.display = 'block';
}


const poblarRegiones = () => {
    let regionSelect = document.getElementById("select_region");
    while (regionSelect.options.length > 1) {
        regionSelect.remove(1);
    }
    region_comuna.regiones.forEach(region => {
        let option = document.createElement("option");
        option.value = region.numero;
        option.text = region.nombre;
        regionSelect.appendChild(option);
    });
};

const actualizarComunas = () => {
    let regionSelect = document.getElementById("select_region");
    let comunaSelect = document.getElementById("select_comuna");
    let selectedRegion = regionSelect.value;

    comunaSelect.innerHTML = '<option value="">Seleccione una comuna</option>';

    let region =region_comuna.regiones.find(r => r.numero == selectedRegion);

    if (region) {
        region.comunas.forEach(comuna => {
            let option = document.createElement("option");
            option.value = comuna.id;
            option.text = comuna.nombre;
            comunaSelect.appendChild(option);
        });
    }
    changeArguments();
};

function changeArguments() {
    const comunaSelect = document.getElementById("select_comuna");
    const reasonLabel = document.querySelector("label[for='comments']");
    const reasonTextarea = document.getElementById("comments");

    if (comunaSelect.value !== "") {
        reasonLabel.style.display = "block";
        reasonTextarea.style.display = "block";
    } else {
        reasonLabel.style.display = "none";
        reasonTextarea.style.display = "none";
    }
}

function medioContacto() {
    const opciones = document.getElementById("contacto");
    const infoContacto = document.getElementById('caja_informacion_contacto');

    if (opciones.value) {
        infoContacto.style.display = "block";
    }
    else {
        infoContacto.style.display = "none";
    }
}

function fechaMinima() {
    const fechaEntrega = document.getElementById('fecha_entrega');
    fechaEntrega.type = "datetime-local";

    const fechaActual = new Date();
    fechaActual.setHours(fechaActual.getHours() + 3);

    const aaaa = fechaActual.getFullYear();
    const mm = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const dd = String(fechaActual.getDate()).padStart(2, '0');
    const hh = String(fechaActual.getHours()).padStart(2, '0');
    const minutos = String(fechaActual.getMinutes()).padStart(2, '0');

    fechaEntrega.value = `${aaaa}-${mm}-${dd} ${hh}:${minutos}`;
}

let fotosCargadas = [];

function agregarFoto() {
    const fotosSubidas = document.getElementById('foto');
    const fotos = document.querySelectorAll('input[type="file"]');

    if (fotosCargadas.length >= 5) {
        alert("Máximo de 5 fotos permitidas")
        return;
    }

    const nuevaFoto = document.createElement('input');
    nuevaFoto.type = 'file';
    nuevaFoto.name = 'foto';
    nuevaFoto.accept = 'image/*';
    nuevaFoto.style.marginTop = '10px';

    fotosCargadas.appendChild(nuevaFoto);
}

document.getElementById("select_region").addEventListener("change", actualizarComunas);
document.getElementById("select_comuna").addEventListener("change", changeArguments);

window.onload = () => {
    poblarRegiones();
    changeArguments();
    fechaMinima();
    medioContacto();

    document.getElementById("select_region").addEventListener("change", actualizarComunas);
    document.getElementById("contacto").addEventListener("change", medioContacto);

    document.getElementById("boton_agregar_foto").addEventListener("click", agregarFoto);
    document.getElementById("boton_agregar_aviso").addEventListener("click", validarFormulario);

    document.getElementById("boton_confirmar_aviso").addEventListener("click", confirmarEnvio);
    document.getElementById("boton_cancelar_aviso").addEventListener("click", cancelarEnvio);
};