# 🕯️ App de Adviento 2026 · BienCatólicos
### Prompt maestro para construir en Vercel con Claude

> **Cómo usar este documento:** colócalo en la carpeta del proyecto junto con `contenido-adviento.txt`, que lleva todo el contenido que preparó Juan Pablo. Pídele a Claude que lo lea completo antes de escribir una sola línea de código y que construya **por etapas** (ver sección 13).

---

## 1. Misión

Construir una web-app de Adviento para **BienCatólicos.com**, gratuita, sin registro y pensada para el celular, que acompañe a personas, familias y parejas del **domingo 29 de noviembre al jueves 24 de diciembre de 2026**.

Debe sentirse como una app de verdad: cálida, sencilla de usar para abuelos y para niños, rápida en celulares de gama baja e instalable en la pantalla de inicio.

**Dominio:** `adviento.biencatolicos.com`, con un registro CNAME hacia Vercel (`cname.vercel-dns.com`).
**Referencia de estilo y tono:** la app "Más santidad, menos Halloween / Lotería de los Santos" de BienCatólicos.

---

## 2. Stack técnico

| Pieza | Decisión |
|---|---|
| Frontend | HTML + CSS + JavaScript puro (sin frameworks) |
| Contenido | Archivos JSON en `/data` |
| Servidor | Una sola función serverless: `/api/articulo` |
| Instalable | PWA: `manifest.json` + `service-worker.js` |
| Contador global de velas (opcional) | `/api/velas` con Upstash Redis desde el Marketplace de Vercel. Solo guarda un número. |
| Hosting | Vercel (plan Hobby), despliegue automático desde GitHub |

### Estructura de carpetas

```
/
├── index.html
├── manifest.json
├── service-worker.js
├── vercel.json
├── /css/app.css
├── /js/
│   ├── app.js          (router por hash, pestañas, fecha actual)
│   ├── fechas.js       (lógica de calendario y ?fecha=)
│   ├── corona.js       (corona digital + vela personal)
│   ├── lector.js       (lector de artículos dentro de la app)
│   ├── retiros.js      (motor común de los 3 retiros)
│   ├── storage.js      (localStorage seguro con try/catch)
│   └── exportar.js     (exportar y copiar diario a texto)
├── /data/
│   ├── reflexiones.json        (26 días)
│   ├── buenas-acciones.json    (26 días)
│   ├── retiro-personal.json    (25 días)
│   ├── retiro-familiar.json    (25 días)
│   ├── retiro-pareja.json      (25 días)
│   ├── posadas.json            (rito, 9 días, petición, oración final)
│   ├── san-lucas.json          (24 días con enlaces)
│   ├── oraciones.json          (sección 9 de este documento)
│   ├── quiz.json               (30 preguntas)
│   └── articulos.json          (artículos, domingos, videos)
├── /img/ (íconos de la PWA, favicon)
└── /api/
    ├── articulo.js
    └── velas.js (opcional)
```

---

## 3. Reglas de oro del contenido

1. **Todo el contenido está en `contenido-adviento.txt`.** Conviértelo a los JSON de `/data` **íntegro y tal cual**: no resumas, no reescribas, no cambies lecturas bíblicas, no cambies el voseo de los retiros ni del calendario.
2. **Únicas correcciones permitidas:**
   - Eliminar créditos de imágenes que quedaron del copiado: `rabakoz.hu`, `eastsidecatholic.org`, `vanidades.com`, `pravachakasabdam.com`, `aztecalaguna.com`, `eltiempo.com`, `gazetadopovo.com.br`, `thevalleycatholic.org`, `redmas.com.co`.
   - Posada día 5: "a n de que" → "a fin de que".
   - Quitar del bloque de Posadas el texto de la página web original ("Descarga la app…", "Disponible en Google Play", "Tiempo estimado…", "Print Friendly and PDF").
3. Al terminar la conversión, genera un **reporte de verificación**: cantidad de días por archivo (26, 26, 25, 25, 25, 9, 24, 30) y una lista de cualquier campo vacío.

### Esquema sugerido

**reflexiones.json**
```json
{ "dia": 1, "fecha": "2026-11-29", "diaSemana": "Domingo", "semana": 1,
  "titulo": "Despierta, Jesús viene a tu encuentro",
  "celebracion": null, "cita": "Mateo 24,37-44",
  "texto": ["párrafo 1", "párrafo 2"],
  "reflexionar": "...", "oracion": "...", "proposito": "..." }
```

**retiro-*.json**
```json
{ "dia": 1, "fecha": "2026-11-29", "etapa": 1,
  "dinamica": "La maleta de mi corazón", "celebracion": null,
  "objetivo": "...", "cita": "Mateo 11,28-30",
  "meditacion": ["..."], "pasos": ["...", "..."],
  "nota": null, "preguntas": ["..."], "oracion": "...", "compromiso": "...",
  "materiales": ["..."], "control": "lista|escala|semaforo|arbol|puente|circulos|jardin|camino|carta|casa|puerta|libre" }
```
Cada retiro incluye además sus **5 etapas** (nombre, fechas y lema) y su **oración final** completa.
Para el retiro familiar, deduce `materiales` de los pasos de cada dinámica (lana, frasco, papeles, zapatos, mochila, etc.).

---

## 4. Lógica de fechas

- Zona horaria fija: **America/Guatemala**.
- Parámetro de prueba: `?fecha=AAAA-MM-DD` simula cualquier día. Indispensable para revisar.
- **Antes del 29 nov:** portada "El Adviento comienza en X días". Todo el contenido queda navegable como vista previa.
- **29 nov – 24 dic:** el día actual se destaca automáticamente en todas las secciones.
- **25 dic en adelante:** portada "¡Feliz Navidad! ✨" con la vela blanca encendida. Todo sigue accesible.

**Semanas:** 1ª Esperanza (29 nov–5 dic) · 2ª Paz (6–12 dic) · 3ª Alegría (13–19 dic) · 4ª Amor (20–24 dic).

---

## 5. Secciones de la app

Navegación inferior fija en celular, con 5 accesos: **Hoy · Calendario · Retiros · Posadas · Más**.
"Más" abre: San Lucas Challenge, Oraciones y tradiciones, Aprende, y Acerca de.
En pantallas grandes se usa una barra de pestañas arriba. El pie de página repite el menú completo.

### 5.1 🏠 Hoy (Mi Adviento)
- Saludo según la hora ("Buenos días", "Buenas noches").
- **Cuenta regresiva** a la Navidad (25 dic 00:00): días, horas y minutos.
- **Corona digital** (sección 6).
- Semana actual y su virtud.
- Tarjeta **"Mi encuentro de hoy"**: título y cita de la reflexión del día, con botón "Leer".
- Tarjeta **"Buena acción de hoy"**, con casilla para marcarla desde ahí mismo.
- Accesos rápidos al día de hoy de cada retiro, mostrando su progreso.
- **Artículo del domingo** de la semana en curso:

| Fechas | Artículo |
|---|---|
| 29 nov – 5 dic | Primer Domingo |
| 6 – 12 dic | Segundo Domingo |
| 13 – 19 dic | Tercer Domingo + "Domingo de Gaudete" |
| 20 – 23 dic | Cuarto Domingo |
| 24 dic | Hoy es Nochebuena |

- Del 16 al 24 de diciembre aparece arriba la tarjeta **"Posada de hoy"**.

### 5.2 📖 Mi encuentro diario
Las 26 reflexiones, con una tira de días deslizable y el día actual destacado.
Cada día muestra: fecha, título, celebración (si la hay), Palabra de Dios, texto, "Para reflexionar", oración y propósito.
Incluye un botón **"✓ Lo viví hoy"** y flechas para ir al día anterior y al siguiente.

### 5.3 ✅ Calendario de buenas acciones
Una cuadrícula tipo calendario de Adviento con 26 casillas agrupadas por semana y el color de su vela. Al tocar una casilla se abre la acción y se puede marcar como hecha.
Lleva barra de progreso, una estrellita por cada acción cumplida y confeti al completar cada semana y al llegar a las 26.
Los días futuros se pueden ver, pero aparecen con un candadito suave (se pueden abrir igual, sin bloqueo).

### 5.4 🙏 Retiros
Tres tarjetas de entrada, cada una con su color e ícono:

| Retiro | Nombre | Subtítulo | Botón de completado |
|---|---|---|---|
| Personal | Volver a Belén | 25 días para sanar el corazón y encontrarse con Jesús | «Marcar día como completado» |
| Familiar | Nuestro hogar, un pequeño Belén | 25 días para recibir a Jesús en familia | «¡Dinámica completada!» |
| Pareja | Caminar juntos hacia Belén | 25 días para fortalecer nuestro amor con Jesús | «¡Encuentro completado!» |

**Motor común (para los tres):**
- Calendario navegable de 25 días, agrupado por etapas, con el día actual destacado.
- Cada sesión muestra **todo** su contenido en este orden: número y fecha, dinámica, celebración, objetivo, Palabra de Dios, meditación, pasos marcables, preguntas, campos de respuesta, oración, compromiso y botón de completado.
- Los controles interactivos se eligen según el campo `control`:
  - `escala`: deslizadores del 1 al 10 (emociones, rueda de la vida).
  - `lista`: varias entradas cortas (cinco cargas, cinco bendiciones…).
  - `semaforo`: tres columnas, roja, amarilla y verde.
  - `arbol`: raíces, tronco, ramas y hojas.
  - `puente`: dos orillas y tablas.
  - `circulos`: círculos concéntricos o que se intersectan.
  - `jardin`, `camino`, `casa`, `puerta`: estaciones con campos.
  - `carta`: área de texto grande con encabezado de carta.
  - `libre`: un solo campo de diario.
- Los dibujos son **ilustraciones SVG sencillas con campos de texto encima**, no un lienzo de dibujo libre. Así funcionan bien en cualquier celular.
- Barra de progreso, sesiones pendientes visibles y **sin penalización** por atraso.
- Guardar, editar, borrar y **copiar** cada respuesta.
- **Exportar** el diario completo a texto (descarga .txt y botón copiar). Familiar: exporta compromisos y oraciones. Pareja: exporta lo individual y lo compartido por separado.
- Pantalla final de felicitación con la oración final del retiro.

**Específicos:**
- **Familiar:** lista de "📦 Materiales" al inicio de cada dinámica, y una opción "Escribir o describir lo que dibujamos" donde el paso pide dibujar.
- **Pareja:**
  - Selector arriba: **"Lo hacemos juntos"** / **"Lo hago individualmente"**. En modo individual, los campos compartidos se ocultan y las preguntas pasan a primera persona.
  - Campos **"Mi reflexión"** (individual) y **"Nuestros acuerdos"** (compartidos).
  - Las reflexiones individuales llevan un aviso discreto: "Esto se guarda solo en este celular. Si comparten el dispositivo, pueden usar el bloqueo opcional", con un PIN opcional de 4 dígitos para ver lo individual.
- **Personal (día 12, "La carta que nunca envié"):** mostrar en destacado la nota "Esta carta es privada. No debe enviarse como parte de la dinámica". Esta carta **no tiene botón de compartir**, solo guardar y borrar.

### 5.5 🏠 Posadas (16 – 24 de diciembre)
Pensada para **leer en voz alta en grupo**, con letra grande y un modo "Proyectar" a pantalla completa. Cada día sigue este orden:
1. Rito inicial: señal de la cruz, saludo, Yo confieso y Bajo tu amparo.
2. Lectura bíblica del día.
3. Reflexión y pregunta.
4. Oración del día y petición.
5. **Petición de posada** con dos voces diferenciadas visualmente: *Afuera* (peregrinos) y *Adentro* (casero), y luego *Todos*.
6. Oración final.

Un botón **"Posada de hoy"** salta al día correspondiente. Incluye la introducción "¿Qué son las posadas?" y "Posadas en Guatemala".

### 5.6 📜 San Lucas Challenge (1 – 24 de diciembre)
Introducción del reto. Lista de 24 días con casilla de "leído", día actual destacado y barra de progreso. Cada día abre su artículo en el **lector** (sección 7).

### 5.7 🕯️ Oraciones y tradiciones
Contenido completo en la sección 9. Incluye enlace al **Rosario de Adviento** (abre en el lector).

### 5.8 💡 Aprende
- **Quiz de 30 preguntas** en dos modos: tarjetas que se voltean (estudio) y "¿Cuánto sabes?", que muestra la respuesta tras pensar, sin puntaje punitivo.
- **Artículos de Adviento** (14), con tarjetas que abren en el lector.
- **Videos:** "¿Qué es el Adviento?" (`usXoZqHCK6Y`) y "Prepara tu corazón | El Adviento con el padre Agustino Torres, CFR" (`pxZkMF9IZwc`). Usar `youtube-nocookie.com` y cargar el iframe solo al tocar la miniatura.

### 5.9 Acerca de
El mismo texto institucional de BienCatólicos que lleva el pie de la app de la Lotería, con botón al sitio y enlace a la app de BienCatólicos en Google Play.

---

## 6. 🕯️ Corona digital y "Enciende tu luz"

**Pensada para quienes no pueden comprar una corona de Adviento.** Debe ser hermosa: es el corazón visual de la app.

### La corona
Una corona SVG de ramas verdes con 4 velas alrededor y 1 blanca al centro, que se encienden solas según la fecha:

| Fecha | Velas encendidas |
|---|---|
| desde 29 nov | 1ª morada · Esperanza |
| desde 6 dic | + 2ª morada · Paz |
| desde 13 dic | + 3ª **rosa** · Alegría |
| desde 20 dic | + 4ª morada · Amor |
| 24 dic, 00:00 | + **blanca** central · Cristo, luz del mundo |

- Llamas con animación suave (parpadeo con CSS) y un resplandor cálido.
- Al tocar una vela se muestran su nombre, su significado y su oración (sección 9).
- Botón **"Bendecir mi corona"** con la bendición de la corona.

### Enciende tu luz (vela personal)
- Una vela grande apagada con el botón **"🕯️ Encender mi luz"**.
- Campo opcional: *"¿Por quién o por qué enciendes tu luz hoy?"*.
- Al encenderla, la llama se prende con una animación lenta y aparecen:
  - la oración de la vela de la semana;
  - el texto: *"Tu luz está encendida. Que ilumine tu hogar y a quienes amas."*
- Queda encendida durante ese día (guardado en el dispositivo) y al día siguiente invita a encenderla de nuevo.
- Lleva un contador personal: "Has encendido tu luz X días este Adviento".
- **Contador global (opcional, fase 2):** "✨ 1,248 luces encendidas hoy". La función `/api/velas` solo suma 1 por dispositivo y por día. **Nunca envía la intención ni ningún dato personal.**
- Respetar `prefers-reduced-motion`: llama fija, sin parpadeo.

---

## 7. 📰 Lector de artículos (sin salir de la app)

**Requisito de Juan Pablo:** los artículos de BienCatólicos se leen **dentro de la app, en la misma ventana, con opción de regresar**. Nunca se usa `target="_blank"`.

### Función `/api/articulo?url=…`
- **Solo acepta URLs de `www.biencatolicos.com`** (lista blanca estricta, para que no se use como proxy abierto).
- Descarga la página, extrae el título, la fecha y el cuerpo del post (contenedor `.post-body` de Blogger; verificar contra el HTML real) y la imagen principal.
- **Sanitiza** el HTML: quitar scripts, iframes ajenos, estilos en línea, widgets y anuncios. Conservar párrafos, títulos, listas, imágenes y enlaces.
- Responde en JSON con caché: `Cache-Control: s-maxage=86400, stale-while-revalidate`.

### Experiencia del lector
- Se abre a pantalla completa sobre la app, con una transición suave.
- Barra fija arriba: **"← Regresar"** a la izquierda y el título abreviado.
- **El botón "atrás" del celular también cierra el lector** (`history.pushState` + `popstate`).
- Al regresar, el usuario vuelve exactamente a la misma sección, el mismo día y la misma posición de scroll.
- Los enlaces internos a biencatolicos.com dentro del artículo también se abren en el lector.
- Al final: *"Ver este artículo en BienCatólicos.com"* (misma pestaña).
- **Si falla la carga:** mensaje amable y botón "Abrir en BienCatólicos", que navega en la misma pestaña. La app guarda el estado en el hash para restaurarlo al volver con "atrás".
- Control de **tamaño de letra** (A− / A+), que se recuerda.

---

## 8. 🔒 Almacenamiento y privacidad

- Todo se guarda en `localStorage`, con claves `adv26-*` y cada lectura y escritura dentro de `try/catch`. La app funciona aunque el almacenamiento falle.
- **Ninguna respuesta, intención ni reflexión sale del dispositivo.** Sin registro, sin cuentas, sin analítica que capture texto.
- En "Acerca de": **"Borrar todos mis datos"**, con confirmación. Además, cada retiro tiene su propio "Borrar mis respuestas de este retiro".
- Aviso visible en los retiros: *"Tus respuestas se guardan solo en este celular."*

---

## 9. 🙏 Contenido de "Oraciones y tradiciones"

Este contenido es nuevo (no está en `contenido-adviento.txt`). Úsalo tal cual.

### Bendición de la corona
Usar el texto de `contenido-adviento.txt` ("Señor Dios, bendice con tu poder nuestra Corona de Adviento…").

### Significado de las velas
Tomar las respuestas 14 a 17 y 19 del quiz.

### Oración para encender cada vela

**1ª vela · Esperanza (morada)**
> Señor, encendemos esta primera luz mientras esperamos tu venida. Que la esperanza no se apague en nuestro hogar, aunque la noche sea larga. Ven, Señor Jesús. Amén.

**2ª vela · Paz (morada)**
> Señor, con esta segunda luz te pedimos paz: en nuestro corazón, en nuestra casa y en Guatemala. Haznos constructores de paz. Ven, Señor Jesús. Amén.

**3ª vela · Alegría (rosa)**
> Señor, esta luz rosa nos recuerda que estás cerca. Llena nuestra casa de una alegría que no dependa de que todo salga bien, sino de saber que vienes. Ven, Señor Jesús. Amén.

**4ª vela · Amor (morada)**
> Señor, ya todas las luces brillan. Que el amor sea el pesebre donde te recibamos esta Navidad. Ven, Señor Jesús. Amén.

### Oración ante el pesebre
> Niño Jesús, te miro pequeño y en silencio, y entiendo que no viniste a imponerte sino a ser recibido. Aquí está mi casa, sencilla como Belén, con sus alegrías y sus pendientes. María, enséñame a guardarte en el corazón; San José, enséñame a cuidarte con fidelidad. Que nunca falte lugar para Ti entre nosotros. Amén.

### Preparación para la Nochebuena
1. Antes de la cena, la familia se reúne ante el nacimiento, con el pesebre todavía vacío.
2. Se lee Lucas 2,1-14.
3. El miembro más pequeño o más anciano coloca al Niño Jesús en el pesebre.
4. Se enciende la vela blanca y se canta un villancico.
5. Bendición de la mesa:
> Bendice, Señor, estos alimentos y a quienes los preparamos. Acuérdate de quienes esta noche no tienen pan ni compañía. Que el Niño que hoy nace sea el invitado principal de esta mesa. Amén.

### Novena de Navidad
> En Guatemala, la novena de Navidad se vive en las **Posadas**, del 16 al 24 de diciembre: nueve noches acompañando a María y José en su camino a Belén.

Botón **"Ir a las Posadas"**.

### Rosario de Adviento
Enlace al artículo del Rosario de Adviento (abre en el lector).

---

## 10. 🎨 Diseño

**Concepto visual: "Luz que crece en la espera."** Base cálida y nocturna, con la luz de las velas como protagonista.

**Lenguaje:** el de la app de la Lotería (bordes definidos, sombras sólidas, botones redondeados, mucho carácter), pero más **sereno y contemplativo**, porque aquí la gente va a leer y orar.

| Token | Color | Uso |
|---|---|---|
| `--morado` | #4B2A7B | color litúrgico, encabezados |
| `--morado-suave` | #EDE6F7 | fondos de tarjetas |
| `--rosa` | #E07BA8 | Gaudete y 3ª semana |
| `--dorado` | #F2B441 | luz, llamas, acentos |
| `--verde` | #2F6B4F | ramas de la corona |
| `--crema` | #FFF8EC | fondo principal |
| `--noche` | #1E1530 | texto y modo noche |

- **El color de acento cambia por semana:** morado, morado, rosa en la 3ª y dorado en Nochebuena.
- **Tipografía:** *Baloo 2* para títulos (continuidad con la app de la Lotería) y *Lora* o *Source Serif* para los textos largos de meditación.
- **Modo noche** ("Modo vela"): fondo oscuro con luz dorada, ideal para orar de noche. Sigue la preferencia del sistema y se puede cambiar a mano.
- **Lectura cómoda:** cuerpo de 18–19 px, interlineado de 1.6, ancho máximo de 680 px para textos.
- **Accesibilidad:**
  - Botones táctiles de 48 px como mínimo.
  - Contraste AA.
  - Etiquetas ARIA en la navegación.
  - `prefers-reduced-motion` desactiva confeti y parpadeos.
- **Proyectar en TV:** botón de pantalla completa en Posadas y en los retiros familiares.

---

## 11. 📲 PWA e instalación

- `manifest.json` con nombre **"Adviento · BienCatólicos"**, ícono de una vela y colores de la marca.
- Service worker que guarda en caché la estructura de la app y todos los JSON. **Las reflexiones, retiros y posadas funcionan sin internet.** Los artículos y videos requieren conexión, y la app lo dice con un aviso amable.
- Invitación discreta (una sola vez): *"Agrega Adviento a tu pantalla de inicio"*.
- Metadatos para compartir en WhatsApp y Facebook: título, descripción e imagen OG de 1200×630.
- Botón **"Compartir la app"** con Web Share API (y copiar enlace como alternativa).

---

## 12. Pie de página

Al final de **todas** las pantallas, con el mismo estilo de la app Nosotros:

- **Fondo:** azul noche `#1E1B2E`, todo centrado, tipografía *Baloo 2*.
- **Marca:** "Bien" y ".com" en blanco, "Católicos" en amarillo `#FFC93C`, a unos 30 px.
- **Texto, tal cual:**

> Adviento es un proyecto de evangelización para personas, matrimonios y familias gracias al esfuerzo de **BienCatólicos.com**, un portal de noticias católicas de Guatemala, con información sobre la Iglesia Católica en Guatemala y el mundo, parroquias, sacerdotes, Vaticano, evangelización y formación. Nuestro objetivo es ofrecer contenidos que ayuden a las familias a crecer juntas en el amor y en la fe.

- **Botón:** píldora amarilla `#FFC93C` con texto oscuro, ícono de globo y la leyenda **"Visitar BienCatólicos.com"**, que enlaza a `https://www.biencatolicos.com/`.
- **Menú:** encima de la marca va el menú completo de secciones.

---

## 13. 🛠️ Plan de construcción por etapas

Al terminar cada etapa, despliega en Vercel y espera la revisión de Juan Pablo en el celular antes de seguir.

1. **Esqueleto:** estructura, diseño base, navegación, lógica de fechas con `?fecha=`, almacenamiento seguro.
2. **Conversión de contenido:** todos los JSON y el reporte de verificación (sección 3).
3. **Hoy:** corona, "Enciende tu luz", cuenta regresiva y tarjetas del día.
4. **Lector de artículos:** `/api/articulo` y artículo del domingo.
5. **Mi encuentro diario + Calendario de buenas acciones.**
6. **Motor de retiros** con el retiro **personal** completo.
7. Retiros **familiar** y **de pareja**.
8. **Posadas, San Lucas, Oraciones y Aprende.**
9. **PWA**, metadatos para compartir y pulido final.
10. *(Opcional)* Contador global de velas.

---

## 14. ✅ Pruebas antes de publicar

Revisar en un celular Android de gama baja y en un iPhone con estas fechas:

| URL | Qué debe verse |
|---|---|
| `?fecha=2026-11-20` | "El Adviento comienza en 9 días" |
| `?fecha=2026-11-29` | 1ª vela, día 1 en todo, artículo del Primer Domingo |
| `?fecha=2026-12-08` | Inmaculada Concepción |
| `?fecha=2026-12-12` | Virgen de Guadalupe |
| `?fecha=2026-12-13` | Vela rosa, Gaudete, color de acento rosa |
| `?fecha=2026-12-16` | Primera posada en "Hoy" |
| `?fecha=2026-12-20` | 4 velas, artículo del Cuarto Domingo |
| `?fecha=2026-12-24` | Día 26, Posada 9, "Hoy es Nochebuena", retiros terminados |
| `?fecha=2026-12-25` | "¡Feliz Navidad!" y vela blanca |

Además:
- Activar el modo avión y confirmar que las reflexiones abren.
- Abrir un artículo, usar el botón atrás del celular y confirmar que regresa al mismo lugar.
- Exportar un diario y "Borrar todos mis datos".
