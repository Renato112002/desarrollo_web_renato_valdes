import math
import os
import matplotlib
matplotlib.use('Agg')
from datetime import datetime
from flask import render_template
from database.db import get_session

from flask import Flask, request, jsonify

from database.db import (
    crear_aviso,
    obtener_ultimos_avisos,
    obtener_aviso_por_id,
    Region,
    Comuna,
    contar_avisos,  # 👈 agregado
    obtener_avisos_paginados
)
from utils.validations import validar_aviso

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = "secret_key"

UPLOAD_FOLDER = os.path.join("static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # 100 MB


# ==========================================================
# RUTA PRINCIPAL
# ==========================================================
@app.route("/")
def index():
    ultimos = obtener_ultimos_avisos(5)
    return render_template("adopcion/index.html", avisos=ultimos)


# ==========================================================
# RUTA AGREGAR AVISO
# ==========================================================
@app.route("/agregar", methods=["GET", "POST"])
def agregar_aviso():
    session = get_session()
    try:
        regiones = session.query(Region).all()
        comunas = session.query(Comuna).all()

        comunas_por_region = {}
        for comuna in comunas:
            rid = comuna.region_id
            if rid not in comunas_por_region:
                comunas_por_region[rid] = []
            comunas_por_region[rid].append({"id": comuna.id, "nombre": comuna.nombre})
    finally:
        session.close()

    if request.method == "POST":
        fotos = request.files.getlist("fotos[]")
        contactos = list(
            zip(
                request.form.getlist("contactar_por[]"),
                request.form.getlist("contacto_info[]"),
            )
        )

        valido, errores = validar_aviso(request.form, fotos, contactos)
        if not valido:
            print("Errores de validación:", errores)
            return jsonify({"ok": False, "errores": errores}), 400

        data = {
            "comuna_id": request.form.get("comuna"),
            "sector": request.form.get("sector"),
            "nombre": request.form.get("nombre"),
            "email": request.form.get("email"),
            "celular": request.form.get("celular"),
            "tipo": request.form.get("tipo"),
            "cantidad": int(request.form.get("cantidad")),
            "edad": int(request.form.get("edad")),
            "unidad_medida": request.form.get("unidad"),
            "fecha_entrega": datetime.strptime(
                request.form.get("fecha_entrega"), "%Y-%m-%dT%H:%M"
            ),
            "descripcion": request.form.get("descripcion"),
        }

        fotos_data = []
        for archivo in fotos:
            if archivo and archivo.filename:
                filename = os.path.basename(archivo.filename)
                ruta_rel = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                archivo.save(ruta_rel)
                fotos_data.append(
                    {"ruta_archivo": ruta_rel, "nombre_archivo": filename}
                )

        contactos_data = []
        for nombre, identificador in contactos:
            if nombre and identificador:
                contactos_data.append(
                    {"nombre": nombre, "identificador": identificador}
                )

        crear_aviso(data, fotos=fotos_data, contactos=contactos_data)
        return jsonify({"ok": True})

    return render_template(
        "adopcion/agregar.html",
        regiones=regiones,
        comunas=comunas,
        comunas_por_region=comunas_por_region,
    )

# ==========================================================
# RUTA LISTADO
# ==========================================================
@app.route("/listado")
def listado():
    pagina = request.args.get("pagina", 1, type=int)
    por_pagina = 5

    total_avisos = contar_avisos()
    total_paginas = math.ceil(total_avisos / por_pagina)

    avisos = obtener_avisos_paginados(pagina, por_pagina)

    return render_template(
        "adopcion/listado.html",
        avisos=avisos,
        pagina_actual=pagina,
        total_paginas=total_paginas
    )

# ==========================================================
# RUTA DETALLE
# ==========================================================
@app.route("/detalle/<int:aviso_id>")
def detalle(aviso_id):
    aviso = obtener_aviso_por_id(aviso_id)
    fotos = getattr(aviso, "fotos", [])
    contactos = getattr(aviso, "contactos", [])
    return render_template(
        "adopcion/detalle.html", aviso=aviso, fotos=fotos, contactos=contactos
    )

@app.route("/estadisticas")
def estadisticas():
    return render_template("adopcion/estadisticas.html")

# ==========================================================
# MAIN
# ==========================================================
if __name__ == "__main__":
    app.run(debug=True)
