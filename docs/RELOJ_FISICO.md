# WorkerWatch en un smartwatch físico

> **Estado de validación:** la interfaz está verificada en navegador (incluido el modo reloj a pantalla completa) y con pruebas automáticas. La prueba en un dispositivo Wear OS físico es el siguiente paso; esta guía documenta el procedimiento y los puntos a comprobar en el reloj.

## Resumen

| Opción                                    | ¿Sirve para este proyecto?                                                                                                       | Esfuerzo        |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Wear OS (Android) con el mismo código** | ✅ **Recomendada.** Wear OS es Android: la app Expo se compila a APK y se instala en el reloj.                                   | Bajo            |
| Navegador del reloj (PWA)                 | ⚠️ Los relojes Wear OS modernos casi no traen navegador. No fiable.                                                              | Bajo, poco útil |
| Apple Watch                               | ❌ Expo/React Native no genera apps de watchOS. Habría que reescribir la interfaz en SwiftUI (el backend se reutiliza tal cual). | Alto            |
| App nativa Kotlin (Compose for Wear OS)   | ✅ Mejor producto final, pero es reescribir la interfaz.                                                                         | Alto            |

## Camino recomendado: Wear OS

Relojes compatibles: Pixel Watch, Galaxy Watch 4 o superior, y otros con **Wear OS 3+** (los Galaxy Watch anteriores a 2021 usan Tizen y no sirven).

### 1. Probar primero sin reloj (emulador)

1. Instalar [Android Studio](https://developer.android.com/studio) → _Device Manager_ → _Create device_ → categoría **Wear OS** → "Wear OS Large Round".
2. Compila el APK (paso 2) e instálalo con `adb install workerwatch.apk`.

Es la forma más cómoda de demostrarlo en clase y de comprobar el diseño circular.

### 2. Compilar el APK en modo reloj

El perfil `watch` de [`eas.json`](../eas.json) compila con `EXPO_PUBLIC_WATCH_MODE=true`: la app ocupa toda la pantalla (sin el marco ni los botones de demostración), mantiene la pantalla encendida y escucha el botón/gesto "atrás" del reloj.

1. La URL del backend (`EXPO_PUBLIC_API_URL`) ya está definida en los perfiles `watch` y `preview` de [`eas.json`](../eas.json). Si el backend cambia de dirección, se actualiza ahí antes de compilar: la URL se incrusta en el APK al construirlo.
2. Compilar en la nube de Expo (cuenta gratuita):

   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure          # solo la primera vez
   npm run build:apk:watch      # genera un APK descargable
   ```

   Alternativa local (requiere JDK 17 y Android SDK):

   ```bash
   EXPO_PUBLIC_WATCH_MODE=true EXPO_PUBLIC_API_URL=https://backend-smartwatch.vercel.app \
     npx expo prebuild --platform android
   cd android && ./gradlew assembleRelease
   # APK en android/app/build/outputs/apk/release/
   ```

> No se debe usar Expo Go: el reconocimiento de voz (`expo-speech-recognition`) necesita un build propio.

### 3. Instalar en el reloj (ADB por Wi-Fi)

En el reloj:

1. _Ajustes → Acerca del reloj → Información del software_ → toca **Número de compilación** 7 veces.
2. _Ajustes → Opciones de desarrollador_ → activa **Depuración ADB** y **Depuración por Wi-Fi**.
3. Conectar el reloj a la misma red Wi-Fi que la computadora.

En la computadora:

```bash
adb pair <ip>:<puerto-de-emparejamiento>   # con el código que muestra el reloj
adb connect <ip>:<puerto>
adb install workerwatch.apk
```

La app aparece en el lanzador del reloj como **WorkerWatch**.

## Qué verificar en el dispositivo real

| Función               | Cómo funciona en el reloj                                                                               | Si falla                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vibración**         | `Vibration` de React Native; patrón según la severidad de la alerta.                                    | Comprobar que el reloj no esté en modo silencio/teatro.                                                                                            |
| **Voz del asistente** | `expo-speech` usa el motor de texto a voz de Android. Necesita altavoz del reloj o audífonos Bluetooth. | Instalar "Google Text-to-Speech" y la voz en español.                                                                                              |
| **Dictado**           | `expo-speech-recognition` usa el reconocedor de Android (requiere servicios de Google).                 | Si no está disponible la app lo detecta y ofrece el teclado, y el teclado del reloj trae dictado. Siempre quedan los atajos de fallas de un toque. |
| **Pantalla circular** | La interfaz está diseñada sobre 380 × 380 px y se escala a la pantalla del reloj.                       | Ajustar `WATCH_SIZE` en `src/theme/tokens.js` si un modelo recorta los bordes.                                                                     |
| **Batería**           | Lee el nivel real con `expo-battery`.                                                                   | Si no hay permiso, muestra un valor de demostración.                                                                                               |
| **Sin red**           | Cae al plan local del catálogo; el chip muestra `IA · OFFLINE`.                                         | —                                                                                                                                                  |

## Distribución a varios trabajadores

- **Pruebas internas:** compartir el APK de EAS (distribución `internal`) y repetir el paso 3.
- **Google Play:** las apps de Wear OS deben declarar `android.hardware.type.watch` y `com.google.android.wearable.standalone` en el manifiesto, y subir capturas de reloj. Se agrega con un _config plugin_ de Expo; no está incluido porque requiere una cuenta de Play Console para validarlo.
- **Flota empresarial:** un MDM Android (p. ej. Google Endpoint Management) puede instalar el APK en todos los relojes.

## Y si la entrega exige Apple Watch

Requeriría crear un target de watchOS con SwiftUI (por ejemplo con el plugin [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets)) y reimplementar las 4 pantallas. El backend (`/api/diagnose` y `/api/chat`) es independiente de la plataforma y se reutiliza sin cambios.
