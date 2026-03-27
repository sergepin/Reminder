# Developer Guide - Discord Reminder Bot

Esta es la documentación técnica integral del bot, diseñada para desarrolladores que necesiten realizar mantenimiento, modificar su comportamiento, expandir sus funcionalidades o auditar el código existente.

## 🏗️ Arquitectura General
El proyecto es un bot para Discord desarrollado bajo **Node.js** utilizando la librería oficial **`discord.js` (v14)**. 

### Stack de Tecnologías
- **Core:** Node.js, `discord.js` (GatewayIntentBits: Guilds y GuildMessages).
- **Base de Datos:** MongoDB vía `mongoose`.
- **Variables de entorno:** `dotenv`.
- **Administrador de procesos:** Listo para usarse con `pm2`.

## 🗂️ Estructura del Directorio
```
/Reminder
 ├── index.js               # Main entry point (cliente, ciclos, connection BD)
 ├── deploy-commands.js     # Script para registrar comandos (Slash Commands) en Discord
 ├── .env                   # Variables de entorno (TOKEN, MONGODB_URI)
 ├── /commands              # Directorio con los comandos dinámicos (Discord Slash Commands)
 ├── /models                # Modelos de Mongoose (e.g. Reminder)
 ├── /middleware            # Lógica extra (e.g. checkRole.js)
 └── /data                  # Datos estáticos (phrases.js, gifs.js)
```

## ⚙️ Flujo Principal (`index.js`)

`index.js` gestiona tres dominios de lógica principal:

1. **Carga y Registro de Eventos Dinámicos**
   El bot recorre síncronamente el directorio `./commands` (`fs.readdirSync`) en su inicialización. Verifica que el archivo exporte `data` y `execute` para integrarlo en una Collection (`client.commands`). Atiende al listener `interactionCreate`.
2. **Ciclo Central de Envío (Cron / Polling de MongoDB)**
   A través de un `setInterval` cada minuto (60000ms), hace polling a la DB buscando registros vencidos cuyo timestamp sea menor o igual (`$lte`) a `new Date()`.
   - **Evaluación del tipo de mensaje (`messageType`):** 
     - Si es de tipo `"roster"`, el despachador ignora frases y gifs extras, permitiendo que el objeto evalúe su contenido parseando únicamente los tags `@everyone`.
     - De lo contrario, extrae aleatoriamente contenido de `getRandomPhrase` y `getRandomGif`. Adicionalmente, de forma defensiva, busca hidratar el recordatorio haciendo fetch del mensaje inicial usando `reminder.messageId`.
3. **Manejo de Respuestas de Interacción**
   Atrapa cualquier promesa con un try/catch en la ejecución de comandos para responder tanto `replied` como `deferred` state, garantizando un fallback estable en la UI del Discord UI para que el bot no se quede colgado.

## 🗃️ Base de Datos (`Reminder` Model)
La base de modelado asume el uso de **Mongoose** gestionando una colección (típicamente llamada `reminders`).

Los campos documentados implícitos (o vistos en uso):
- `userId` (String): ID del usuario que invocó.
- `channelId` (String): Canal destino donde debe enviarse cuando el evento detone.
- `message` (String): Carga útil del recordatorio.
- `timestamp` (Date): Criterio de ejecución del cronjob.
- `messageType` (String): Opcional. Controla si es un `"roster"`.
- `messageId` (String): Opcional. Guarda referencia a un mensaje anterior a citar.

## 💻 Módulo de Comandos

Cada archivo en la carpeta `/commands` es un módulo Node estructurado para la sintaxis v14 de *Slash Commands Builder*.
Todos los comandos incluyen una protección de Middlewares usando `checkRole()(interaction)` devolviendo un boolean tempranamente.

### 1. `programar.js`
- **Args:** `timestamp` | regex `/<t:(\d+):f>/`
- Muta el texto de input al objeto tipo Date de JavaScript multiplicando el match regex `[1] * 1000`. Carga un mensaje estático hardcodeado: *"Equipense, nos vemos arriba"*.

### 2. `reprogramar.js`
- **Args:** `id` (ObjectId string de Mongo), `timestamp` (regex `/<t:(\d+):f>/`)
- Ejecuta `Reminder.findById(id)` e inyecta la reasignación de la propiedad `timestamp`. Utiliza operaciones nativas `.save()` para persistir.

### 3. `recordatorios.js`
- **Args:** Ninguno.
- Ejecuta find de `$gt: new Date()` y los retorna ordenados asc (`sort({ timestamp: 1 })`). Mapea y devuelve en Markdown el identificador de MongoDB.

### 4. `repetir.js`
- **Args:** `id` (Discord Snowflake).
- Hace un `channel.messages.fetch(messageId)` para forzar al bot a repetir el texto (`content`).

### 5. `roster.js` (Lógica de Plantilla)
Es el comando que soporta el corazón de armado de grupos del servidor. 
- Importa la plantilla estática desde `templates/rosterTemplate.js`.
- **Validaciones:** Requiere únicamente el parámetro `fechalanzar` (formato timestamp `<t:...:f>`). Valida que el momento programado para el envío sea en el futuro.

## 🚀 Despliegue 
Para desplegar un nuevo comando a la UI de Discord (Syncing Global u Guild config del bot):
1. Asegurarse de tener el token valid en `.env`.
2. Lanzar: `npm run deploy`

Para ejecutar y gestionar en producción, el proyecto contempla PM2 mediante scripts en `package.json`:
- **Iniciar:** `npm run start:prod`
- **Detener:** `npm run stop`
- **Reiniciar:** `npm run restart`
