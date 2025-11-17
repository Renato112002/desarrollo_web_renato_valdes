
# Tarea 4 - Desarrollo de Aplicaciones Web - Renato Valdés

Para esta tarea, se adapto la aplicación originalmente desarrollada en Flask (Python) para gestionar publicaciones de adopción de mascotas.
Para esto, fue migrada a Spring Boot (Java), reutilizando la interfaz original (HTML, JS, CSS), reordenando la arquitectura interna
y reemplazando todo el backend Python por Java.

# Detalles y decisiones de diseño

Este documento describe algunas decisiones de diseño y consideraciones tomadas durante la implementación de la pagina web.

## Inicialización de la base de datos

El flujo para la visualizacion de la pagina es:

1. `database/tarea2.sql`
2. `database/region-comuna.sql`
3. `database/tabla-comentario.sql`
4. `database/tabla-nota.sql`
5. `spring_app/src/main/java/desarrollo_web_renato_valdes/spring_app/SpringAppApplication.java`

## Archivos adicionales creados

Se adapto el archivo "insertar_datos_prueba" con avisos de adopción aleatorios para realizar pruebas de funcionamiento y visualización,
tranformandolo en un "DataSeeder" de Java con la misma estructura original, este se ejecuta automaticamente al iniciar la aplicacion,
permitiendo probar la evaluacion de notas.

## Reutilizaciones

Se reutilizo practicamente toda la interfáz HTML, JS y CSS, manteniendo la misma estructura y estilos de la aplicacion anterior,
conservando solo los archivos que se utilizan en la version Java.

La funcion de evaluacion se implemento mediante Spring Boot con llamadas asíncronas con JavaScript usando fetch:

- "GET /api/avisos"
- "POST /api/avisos/evaluar"

Las otras secciones de la tarea anterior se eliminaron, se dejo los botones originales pero redireccionando de nuevo a la pagina principal.