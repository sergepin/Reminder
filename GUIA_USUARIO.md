# Manual de Usuario - Discord Reminder Bot

¡Bienvenido al manual de uso del bot de recordatorios! Este bot está diseñado para ayudarte a ti y a tu comunidad a programar avisos, organizar eventos y mantener al equipo informado.

## 📝 Conceptos Básicos

### ¿Qué es el formato de hora de Discord?
Para programar algo en una fecha y hora exacta, el bot te pedirá la fecha en un formato especial que Discord entiende, llamado "Timestamp". Se ve así: `<t:1708894800:f>`

**¿Cómo consigo ese código?**
La forma más fácil es usar una página web generadora de Timestamps para Discord (como [Hammertime](https://hammertime.cyou/)). 
1. Entras a la página.
2. Eliges la fecha y hora que quieres.
3. Copias el código que termina en `:f` (por ejemplo: `<t:1708894800:f>`).
4. Pegas ese código cuando el bot te lo pida.

---

## 🛠️ Comandos Disponibles

Para usar el bot, simplemente escribe `/` en cualquier canal de texto y selecciona el comando que necesites de la lista. 

### 1. `/programar`
**Para qué sirve:** Programa un aviso general. Cuando llegue la hora, el bot mencionará a `@everyone` y dirá *"Equipense, nos vemos arriba"* junto con una frase graciosa y un GIF aleatorio.
* **Uso:** `/programar timestamp: <t:TU_CODIGO:f>`
* **Ejemplo:** `/programar timestamp: <t:1708894800:f>`

### 2. `/roster`
**Para qué sirve:** Crea y programa un aviso formal de lista de asistencia (roster) para un evento importante.
* **Parámetros que te pedirá:**
  * `fechalanzar`: La fecha y hora exacta en la que quieres **que el bot publique el aviso**.
* **Ejemplo:** `/roster fechalanzar: <t:1708894800:f>`
* **Qué hace:** El bot publicará en el canal a la hora de `fechalanzar` la plantilla predefinida pidiendo la asistencia de las diferentes clases.

### 3. `/recordatorios`
**Para qué sirve:** Muestra una lista de todos los recordatorios que están programados a futuro y que aún no se han enviado.
* **Uso:** Simplemente escribe `/recordatorios`
* **Resultado:** Te mostrará el ID de cada recordatorio y para cuándo está programado.

### 4. `/reprogramar`
**Para qué sirve:** Sirve para cambiar la hora de un recordatorio que ya habías programado antes.
* **Parámetros que te pedirá:**
  * `id`: El ID del recordatorio (lo puedes obtener usando el comando `/recordatorios`).
  * `timestamp`: La nueva fecha y hora usando el código de Discord.
* **Ejemplo:** `/reprogramar id: 65db91f... timestamp: <t:1708985000:f>`

### 5. `/repetir`
**Para qué sirve:** Repite un mensaje cualquiera que alguien haya enviado en el chat y lo enmarca diciendo **"Roster!:"**.
* **Parámetros que te pedirá:**
  * `id`: El ID del mensaje de Discord que quieres repetir (necesitas tener el modo desarrollador de Discord activado para poder copiar IDs de mensajes).
* **Ejemplo:** `/repetir id: 120938491823901`

---

## ⚠️ Notas Importantes
* **Permisos:** Solamente los usuarios que tengan el rol de administrador o el rol permitido por el bot podrán ejecutar estos comandos.
* **Hora Colombiana:** El mensaje de `/roster` internamente ajusta las fechas pensando en la zona horaria de Colombia (UTC-5). Tenlo en cuenta al organizar eventos internacionales.
