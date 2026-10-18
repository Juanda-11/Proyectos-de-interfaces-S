# Despliegue en Vercel (frontend + backend)

Son **dos proyectos de Vercel**, uno por repositorio. Orden recomendado: primero el backend, luego el frontend.

## 1. Backend — `Proyectos-de-interfaces-SB`

1. [vercel.com/new](https://vercel.com/new) → importa el repositorio del backend → _Framework Preset_: **Other**.
2. **Environment Variables:**
   | Variable         | Valor                                                                              |
   | ---------------- | ---------------------------------------------------------------------------------- |
   | `GEMINI_API_KEY` | tu clave de <https://aistudio.google.com/apikey>                                   |
   | `CORS_ORIGINS`   | URL del frontend (la agregas al terminar el paso 2); admite `https://*.vercel.app` |
3. Deploy y comprueba `https://<backend>.vercel.app/api/health` → `"ai": "configured"`.

## 2. Frontend — `Proyectos-de-interfaces-S`

1. Importa el repositorio del frontend. `vercel.json` ya define instalación (`npm ci`), build (`npx expo export --platform web`) y carpeta de salida (`dist`).
2. **Environment Variables** (Production **y** Preview):
   | Variable              | Valor                                            |
   | --------------------- | ------------------------------------------------ |
   | `EXPO_PUBLIC_API_URL` | `https://<backend>.vercel.app` (sin barra final) |
3. Deploy. Abre la URL: debe mostrar **"IA conectada"** debajo del reloj.

> `EXPO_PUBLIC_*` se incrusta **al compilar**: si cambias la URL del backend, vuelve a desplegar el frontend.

## 3. Cerrar el círculo

Vuelve al backend y pon `CORS_ORIGINS` con la URL final del frontend; redeploy del backend.

## Ramas

Vercel despliega producción desde la rama por defecto (`main`). El trabajo de este proyecto está en la rama `claude/zealous-albattani-kl3fid`: o la fusionas a `main` (Pull Request), o en _Settings → Git → Production Branch_ eliges esa rama.

## Probar

| Qué                                                   | URL                                      |
| ----------------------------------------------------- | ---------------------------------------- |
| Simulador completo (marco de reloj + botones de demo) | `https://<frontend>.vercel.app`          |
| Modo reloj (pantalla completa, sin controles de demo) | `https://<frontend>.vercel.app/?watch=1` |

Para dictar por voz usa Chrome, Edge o Safari (el reconocimiento de voz del navegador no existe en Firefox). Vercel sirve HTTPS, requisito para el micrófono. Si no hay voz disponible siempre quedan los atajos de fallas y el teclado.

## Problemas frecuentes

| Síntoma                                       | Causa probable                                                                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| El panel dice "IA sin backend"                | Falta `EXPO_PUBLIC_API_URL` en Vercel o no se redeployó después de agregarla.                                                                |
| "Backend sin respuesta"                       | Error de CORS (`CORS_ORIGINS` no incluye la URL del frontend) o backend caído. Mira la pestaña _Network_.                                    |
| "Backend activo, falta GEMINI_API_KEY"        | La variable no está en el proyecto del backend (o falta redeploy).                                                                           |
| Respuestas con chip `IA · OFFLINE`            | La IA devolvió un error (cuota gratuita agotada, modelo no disponible). Revisa los _Logs_ del backend: cada error lleva `requestId` y causa. |
| `npm run smoke` falla con `ai_upstream_error` | Clave inválida o modelo inexistente: cambia `GEMINI_MODEL` en el backend.                                                                    |
