# Guía de Despliegue en Render - Calculador de Escrituras LLAVE

Este proyecto está configurado para desplegarse de manera directa y gratuita en **Render** (plataforma de alojamiento en la nube para aplicaciones web).

Siga los siguientes pasos para subir su página web a internet:

---

## Paso 1: Subir el proyecto a GitHub

1. Cree un repositorio en su cuenta de GitHub (puede ser público o privado).
2. Inicialice Git en la carpeta del proyecto en su computadora y suba los archivos:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Calculador Llave"
   git branch -M main
   git remote add origin https://github.com/SU_USUARIO/SU_REPOSITORIO.git
   git push -u origin main
   ```

---

## Paso 2: Crear el servicio en Render

1. Regístrese o inicie sesión en [Render.com](https://render.com/).
2. En el panel principal, haga clic en el botón **New +** (Nuevo) y seleccione **Web Service** (Servicio Web).
3. Conecte su cuenta de GitHub a Render (si aún no lo ha hecho) y seleccione el repositorio del proyecto que acaba de subir.

---

## Paso 3: Configurar los parámetros en Render

Render detectará automáticamente el lenguaje de su repositorio, pero asegúrese de configurar los siguientes campos con estos valores:

*   **Name (Nombre):** `calculador-escrituras-llave` (o el nombre que prefiera para su URL).
*   **Region:** Seleccione la más cercana a sus usuarios (ej. *Ohio (us-east-2)* o *Oregon (us-west-2)*).
*   **Branch (Rama):** `main`
*   **Runtime:** `Python`
*   **Build Command (Comando de Construcción):** `pip install -r requirements.txt`
*   **Start Command (Comando de Inicio):** `gunicorn wsgi:app`
*   **Instance Type (Tipo de Instancia):** Seleccione el plan **Free** (Gratuito).

---

## Paso 4: Desplegar y listo

1. Haga clic en **Deploy Web Service** (Desplegar Servicio Web) en la parte inferior de la página.
2. Render comenzará a descargar el código de GitHub, instalará las dependencias descritas en `requirements.txt` y arrancará la aplicación mediante `gunicorn` usando el archivo `wsgi.py`.
3. Una vez que el registro (log) indique `Your service is live`, podrá acceder al enlace proporcionado por Render en la parte superior izquierda (ej. `https://calculador-escrituras-llave.onrender.com`).

---

## Notas importantes para el Plan Gratuito de Render:
*   Las instancias en el plan gratuito de Render entran en "estado de suspensión" (spin down) después de 15 minutos de inactividad. 
*   Si la página web no se visita en ese tiempo, la próxima vez que alguien ingrese puede demorar entre 50 y 90 segundos en cargarse mientras el servidor se activa de nuevo. Esto es un comportamiento normal del plan gratuito.
