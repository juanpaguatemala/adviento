# Adviento · BienCatólicos

App web de Adviento 2026 (29 de noviembre – 24 de diciembre), lista para publicar en **Vercel**.

Incluye:
- Corona digital y **"Enciende tu luz"**.
- Reflexión diaria y calendario de 26 buenas acciones.
- Tres retiros: personal, familiar y de pareja.
- Posadas, San Lucas Challenge, Domingos de Adviento, Oraciones y tradiciones.
- Quiz, artículos y videos.
- Enlaces a los artículos de BienCatólicos.com.

Se puede instalar en el celular y funciona sin internet para las reflexiones, retiros y posadas.

## Estructura

```
index.html            página única de la app
css/app.css           estilos (modo claro y modo vela)
js/                   lógica: base, corona, lector, retiros, vistas, app
data/*.json           todo el contenido (generado desde contenido-adviento.txt)
img/                  íconos e imagen para compartir
manifest.json         instalación en la pantalla de inicio
service-worker.js     funcionamiento sin internet
scripts/convertir.py  convierte contenido-adviento.txt en los JSON de /data
```

## Publicar en Vercel

1. Sube esta carpeta a un repositorio de GitHub (puede ser privado).
2. En vercel.com toca **Add New → Project**, elige el repositorio y toca **Import**.
3. En **Framework Preset** elige **Other**. No hace falta comando de build.
4. Toca **Deploy**.
5. Para el dominio, ve a **Settings → Domains**, agrega `adviento.biencatolicos.com` y crea en tu DNS el registro **CNAME** que Vercel te indique.

## Probar fechas

Agrega `?fecha=AAAA-MM-DD` a la dirección para simular cualquier día:

```
/?fecha=2026-11-20#/hoy        antes del Adviento
/?fecha=2026-12-13#/hoy        Gaudete (vela rosa)
/?fecha=2026-12-17#/posadas    posadas
/?fecha=2026-12-24#/hoy        Nochebuena
/?fecha=2026-12-25#/hoy        Navidad
```

## Cambiar el contenido

Edita `contenido-adviento.txt` y vuelve a generar los datos:

```
python3 scripts/convertir.py
```

El script muestra un reporte con cuántos días encontró en cada sección y avisa si algún campo quedó vacío.

Para cambios pequeños también puedes editar directamente los archivos de `data/`.

Después de cambiar el contenido, sube el número en `VERSION` dentro de `service-worker.js` (por ejemplo, `adv26-v2`). Así los celulares que ya instalaron la app reciben la versión nueva.

## Privacidad

- Todas las respuestas, intenciones y avances se guardan **solo en el celular** (`localStorage`, claves `adv26-*`).
- No hay registro ni base de datos.

## Artículos de BienCatólicos

Los botones de artículos (Domingos, San Lucas, Aprende, Rosario) abren la página de BienCatólicos.com en la misma pestaña. Con el botón "atrás" se regresa a la app, a la misma sección y posición.

## Pendiente opcional

**Contador global de velas** ("✨ 1,248 luces encendidas hoy"): requiere una base de datos, por ejemplo Upstash Redis desde el Marketplace de Vercel, y una función `api/velas.js`. La app ya está preparada para llamarla; solo hay que activar `window.ADV_CONTADOR = true`.
