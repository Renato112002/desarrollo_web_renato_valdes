import math
import os

import matplotlib

matplotlib.use('Agg')
from datetime import datetime
from flask import render_template
from database.db import get_session
import re
from flask import Flask, request

from database.db import (
    crear_aviso,
    obtener_ultimos_avisos,
    obtener_aviso_por_id,
    Region,
    Comuna,
    contar_avisos,
    obtener_avisos_paginados,
    AvisoAdopcion,
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
# RUTAS DE COMENTARIOS
# ==========================================================
from database.db import crear_comentario, obtener_comentarios_por_aviso

@app.get("/comentarios/<int:aviso_id>")
def listar_comentarios(aviso_id):
    try:
        comentarios = obtener_comentarios_por_aviso(aviso_id)
        # Serializa para JSON
        data = [{
            "id": c.id,
            "nombre": c.nombre,
            "texto": c.texto,
            "fecha": (c.fecha.strftime("%Y-%m-%d %H:%M") if c.fecha else "")
        } for c in comentarios]
        return jsonify(data), 200
    except Exception:
        return jsonify({"ok": False, "mensaje": "Error al obtener comentarios"}), 500

@app.post("/comentarios/<int:aviso_id>")
def agregar_comentario(aviso_id):
    try:
        payload = request.get_json(silent=True) or {}
        nombre = (payload.get("nombre") or "").strip()
        texto  = (payload.get("texto")  or "").strip()

        # Validaciones lado servidor
        errores = []
        if not (3 <= len(nombre) <= 80):
            errores.append("El nombre debe tener entre 3 y 80 caracteres.")
        elif not re.match(r"^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$", nombre):
            errores.append("El nombre solo puede contener letras y espacios.")

        if len(texto) < 5 or len(texto) > 300:
            errores.append("El comentario debe tener entre 5 y 300 caracteres.")

        if errores:
            return jsonify({"ok": False, "errores": errores}), 400

        crear_comentario(aviso_id, nombre, texto)
        return jsonify({"ok": True, "mensaje": "Comentario agregado correctamente."}), 200

    except Exception:

        return jsonify({"ok": False, "mensaje": "Ocurrió un error al enviar el comentario."}), 500

from sqlalchemy import func, extract
from flask import jsonify

@app.route("/api/estadisticas")
def api_estadisticas():
    session = get_session()

    # Avisos por día ===
    avisos_por_dia = (
        session.query(
            func.date(AvisoAdopcion.fecha_ingreso).label("dia"),
            func.count(AvisoAdopcion.id)
        )
        .group_by(func.date(AvisoAdopcion.fecha_ingreso))
        .order_by(func.date(AvisoAdopcion.fecha_ingreso))
        .all()
    )
    dias = [str(a.dia) for a in avisos_por_dia]
    conteos_dia = [a[1] for a in avisos_por_dia]

    # Total por tipo ===
    avisos_por_tipo = (
        session.query(AvisoAdopcion.tipo, func.count(AvisoAdopcion.id))
        .group_by(AvisoAdopcion.tipo)
        .all()
    )
    tipos = [a[0] for a in avisos_por_tipo]
    conteos_tipo = [a[1] for a in avisos_por_tipo]

    # Gatos y perros por mes ===
    avisos_por_mes_tipo = (
        session.query(
            extract('month', AvisoAdopcion.fecha_ingreso).label('mes'),
            AvisoAdopcion.tipo,
            func.count(AvisoAdopcion.id)
        )
        .group_by('mes', AvisoAdopcion.tipo)
        .order_by('mes')
        .all()
    )

    meses_dict = {}
    for mes, tipo, cantidad in avisos_por_mes_tipo:
        mes = int(mes)
        if mes not in meses_dict:
            meses_dict[mes] = {"gato": 0, "perro": 0}
        meses_dict[mes][tipo] = cantidad

    nombres_meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
                     "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    meses_ordenados = sorted(meses_dict.keys())
    meses_nombres = [nombres_meses[m - 1] for m in meses_ordenados]
    gatos = [meses_dict[m]["gato"] for m in meses_ordenados]
    perros = [meses_dict[m]["perro"] for m in meses_ordenados]

    session.close()
    return jsonify({
        "lineas": {"dias": dias, "valores": conteos_dia},
        "torta": {"tipos": tipos, "valores": conteos_tipo},
        "barras": {"meses": meses_nombres, "gatos": gatos, "perros": perros}
    })

# ==========================================================
# MAIN
# ==========================================================
if __name__ == "__main__":
    app.run(debug=True)
