from database.db import get_session, AvisoAdopcion, Comuna, Foto
from datetime import datetime, timedelta
import random
import os

# Codigo para insertar 50 avisos random a la base de datos para probar

session = get_session()

comunas = session.query(Comuna).all()

tipos = ["gato", "perro"]
sectores = ["Centro", "Norte", "Sur", "Oriente", "Poniente"]

imagenes_tipo = {
    "gato": os.path.join("static", "svg", "Gato1.png"),
    "perro": os.path.join("static", "svg", "Perro1.png"),
}

avisos = []
for i in range(1, 51):
    comuna = random.choice(comunas)
    tipo = random.choice(tipos)
    aviso = AvisoAdopcion(
        fecha_ingreso=datetime.now() - timedelta(days=random.randint(0, 30)),
        comuna_id=comuna.id,
        sector=random.choice(sectores),
        nombre=f"Nombre {i}",
        email=f"email{i}@gmail.com",
        celular="+569.99999999",
        tipo=tipo,
        cantidad=random.randint(1, 4),
        edad=random.randint(1, 12),
        unidad_medida=random.choice(["m", "a"]),
        fecha_entrega=datetime.now() + timedelta(days=random.randint(1, 10)),
        descripcion=f"Descripción de prueba {i}"
    )
    session.add(aviso)

session.commit()  # 🔐 Generar los IDs

avisos = session.query(AvisoAdopcion).order_by(AvisoAdopcion.id.desc()).limit(50).all()

for aviso in avisos:
    tipo = aviso.tipo
    ruta_imagen = imagenes_tipo.get(tipo, imagenes_tipo[tipo])
    nombre_archivo = os.path.basename(ruta_imagen)

    foto = Foto(
        aviso_id=aviso.id,
        ruta_archivo=ruta_imagen,
        nombre_archivo=nombre_archivo
    )
    session.add(foto)

session.commit()
session.close()

print("Se insertaron 50 avisos de prueba.")
