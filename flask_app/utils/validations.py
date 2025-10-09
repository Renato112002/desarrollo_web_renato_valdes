import re
from datetime import datetime

def validar_email(email):
    if not email or len(email) > 100:
        return False
    return re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email) is not None

def validar_telefono(celular):
    return re.match(r"^\+\d{3}\.\d{8}$", celular or "") is not None

def validar_aviso(form, fotos, contactos):
    errores = []

    # Región / Comuna
    if not form.get("region"):
        errores.append("Debe seleccionar una región.")
    if not form.get("comuna"):
        errores.append("Debe seleccionar una comuna.")

    # Sector
    if form.get("sector") and len(form.get("sector")) > 100:
        errores.append("El sector no puede superar los 100 caracteres.")

    # Contacto
    nombre = form.get("nombre", "").strip()
    if len(nombre) < 3 or len(nombre) > 200:
        errores.append("El nombre debe tener entre 3 y 200 caracteres.")

    email = form.get("email", "").strip()
    if not validar_email(email):
        errores.append("Debe ingresar un correo válido (máx. 100 caracteres).")

    celular = form.get("celular", "").strip()
    if not validar_telefono(celular):
        errores.append("Debe ingresar un teléfono con formato +569.XXXXXXXX.")

    # Mascota
    tipo = form.get("tipo")
    if tipo not in ("gato", "perro"):
        errores.append("Debe seleccionar el tipo de mascota (gato o perro).")

    try:
        cantidad = int(form.get("cantidad", 0))
        if cantidad < 1:
            errores.append("La cantidad debe ser mayor o igual a 1.")
    except ValueError:
        errores.append("Cantidad inválida.")

    try:
        edad = int(form.get("edad", 0))
        if edad < 1:
            errores.append("La edad debe ser mayor o igual a 1.")
    except ValueError:
        errores.append("Edad inválida.")

    unidad = form.get("unidad")
    if unidad not in ("m", "a"):
        errores.append("Debe seleccionar la unidad de edad (meses o años).")

    # Fecha
    fecha_entrega = form.get("fecha_entrega")
    try:
        datetime.strptime(fecha_entrega, "%Y-%m-%dT%H:%M")
    except Exception:
        errores.append("Debe ingresar una fecha de entrega válida.")

    # Fotos
    if not fotos or len(fotos) == 0:
        errores.append("Debe subir al menos una foto.")
    elif len(fotos) > 5:
        errores.append("No puede subir más de 5 fotos.")

    # Contactos
    contactos_validos = 0
    if contactos:
        for nombre_contacto, identificador in contactos:
            if nombre_contacto.strip() and identificador.strip():
                if len(identificador) < 4 or len(identificador) > 50:
                    errores.append("Cada contacto debe tener entre 4 y 50 caracteres.")
                else:
                    contactos_validos += 1

    if contactos_validos == 0:
        errores.append("Debe incluir al menos un método de contacto.")

    valido = len(errores) == 0
    return valido, errores
