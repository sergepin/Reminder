# Guía Rápida del Bot de Eventos

## 🕒 Formato de Hora (Timestamp)
El bot requiere la hora en un formato especial de Discord (ej. `<t:1708894800:f>`).
1. Entra a [**Hammertime**](https://hammertime.cyou/).
2. Selecciona fecha y hora exacta.
3. Copia el código que termina en `:f` y pégalo en el bot.

---

## 📋 Comandos Principales

### 1. `/roster` (Registro de Asistencia)
Publica la plantilla oficial del equipo para que los miembros se anoten.
* **Uso:** `/roster fechalanzar: <t:1708894800:f>`
*(El bot enviará la lista a esa hora exacta).*

### 2. `/programar` (Aviso General)
Envía un aviso al servidor para iniciar preparativos.
* **Uso:** `/programar timestamp: <t:1708894800:f>`
*(El bot etiquetará a todos a esa hora).*

---

## ⚙️ Otros Comandos
* `/recordatorios` - Muestra la lista de envíos pendientes.
* `/reprogramar` - Cambia la hora de un aviso programado.
* `/repetir` - Reenvía un mensaje importante usando su ID.
