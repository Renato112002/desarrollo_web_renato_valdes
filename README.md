
# Tarea 2 - Desarrollo de Aplicaciones Web - Renato Valdés

Esta tarea corresponde a una aplicación web desarrollada en Flask (Python) que permite publicar, visualizar y gestionar avisos de adopción de mascotas.
Incluye manejo de base de datos, carga de imágenes, validaciones en el frontend y backend, y estructura modular.

# Detalles y decisiones de diseño

Este documento describe algunas decisiones de diseño y consideraciones tomadas durante la implementación de la pagina web.

## Inicialización de la base de datos

El flujo para la visualizacion de la pagina es:

1. `flask_app/database/init_db.py`  
2. `flask_app/database/tarea2.sql`
3. `flask_app/database/region-comuna.sql`
4. `flask run`

## Archivos adicionales creados

- Se creó un "insertar_datos_prueba" con avisos de adopción aleatorios para realizar pruebas de funcionamiento y visualización.  

## Decisiones

### Contactos múltiples por mismo medio
En el formulario "Agregar aviso de adopción”, se permitió que los usuarios pudieran agregar varios contactos con el mismo tipo de medio (por ejemplo, dos cuentas de Instagram o Telegram).  
Esto se hizo para personas con varios números o redes sociales.

## Validaciones

Se incluyeron validaciones tanto en el frontend (JavaScript) como en el backend (Flask):

- Todos los campos obligatorios verifican longitud mínima y formato.  
- El campo de teléfono valida el formato `+569.12345678`.  
- El campo de email se valida mediante expresión regular.
- El campo contactar por obliga a subir entre 1 y 5 medios de contacto y bloquea agregar más de cinco..  
- El campo de edad y cantidad solo acepta valores mayores o iguales a 1.  
- El campo “Fecha disponible” se prellena automáticamente con la hora actual + 3 horas, y no permite seleccionar una fecha anterior.  
- El campo de fotos obliga a subir entre 1 y 5 imágenes y bloquea agregar más de cinco.

Estas validaciones evitan errores comunes al momento de guardar un aviso.

## Manejo de fotos

Las imágenes se almacenan en la carpeta `/static/uploads/`.
