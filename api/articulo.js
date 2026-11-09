// Adviento · BienCatólicos — /api/articulo?url=...
// Trae un artículo de BienCatólicos.com, extrae título, fecha y cuerpo, y lo devuelve limpio en JSON
// para mostrarlo dentro de la app. Solo acepta URLs de biencatolicos.com (no es un proxy abierto).
import { parse } from 'node-html-parser';
import sanitizeHtml from 'sanitize-html';

const HOSTS = new Set(['www.biencatolicos.com', 'biencatolicos.com']);

export function validarUrl(entrada) {
  let u;
  try { u = new URL(entrada); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  if (!HOSTS.has(u.hostname)) return null;
  if (u.username || u.password || (u.port && u.port !== '443' && u.port !== '80')) return null;
  u.protocol = 'https:';
  u.hostname = 'www.biencatolicos.com';
  u.port = '';
  u.hash = '';
  return u;
}

function texto(nodo) { return nodo ? nodo.text.replace(/\s+/g, ' ').trim() : ''; }

export function extraer(html, base) {
  const doc = parse(html, { comment: false, blockTextElements: { script: false, noscript: false, style: false, pre: true } });
  const meta = (p) => { const m = doc.querySelector(`meta[property="${p}"]`) || doc.querySelector(`meta[name="${p}"]`); return m ? m.getAttribute('content') : ''; };

  const titulo = texto(doc.querySelector('.post-title')) || meta('og:title') || texto(doc.querySelector('title'));
  const fechaNodo = doc.querySelector('time.published') || doc.querySelector('abbr.published') || doc.querySelector('.date-header span') || doc.querySelector('.published');
  const fecha = texto(fechaNodo);
  const cuerpoNodo = doc.querySelector('.post-body') || doc.querySelector('.entry-content') || doc.querySelector('article');
  if (!cuerpoNodo) return null;

  // Quitamos widgets y piezas que no son parte del artículo.
  cuerpoNodo.querySelectorAll('script, style, noscript, form, ins, .adsbygoogle, .sharethis-inline-share-buttons, .post-share-buttons, .related-posts, .printfriendly, .pf-button')
    .forEach((n) => n.remove());

  const limpio = sanitizeHtml(cuerpoNodo.innerHTML, {
    allowedTags: ['p', 'br', 'h2', 'h3', 'h4', 'h5', 'strong', 'b', 'em', 'i', 'u', 'blockquote', 'ul', 'ol', 'li',
      'a', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'span', 'div', 'iframe'],
    allowedAttributes: {
      a: ['href'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      iframe: ['src', 'allowfullscreen', 'title'],
      td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan']
    },
    allowedSchemes: ['https', 'http'],
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'],
    transformTags: {
      h1: 'h2',
      a: (tag, attribs) => {
        let href = attribs.href || '';
        try { href = new URL(href, base).href; } catch { href = ''; }
        return { tagName: 'a', attribs: href ? { href } : {} };
      },
      img: (tag, attribs) => {
        let src = attribs.src || attribs['data-src'] || '';
        try { src = new URL(src, base).href.replace(/^http:/, 'https:'); } catch { src = ''; }
        const out = { src, alt: attribs.alt || '', loading: 'lazy' };
        return { tagName: 'img', attribs: out };
      }
    },
    exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
    nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript']
  });

  // Quitamos párrafos, contenedores e iframes vacíos.
  const html2 = limpio
    .replace(/<p>(\s|&nbsp;|<br \/>)*<\/p>/g, '')
    .replace(/<(div|span)>\s*<\/\1>/g, '')
    .replace(/<iframe><\/iframe>/g, '');

  return { titulo, fecha, imagen: meta('og:image'), html: html2 };
}

export default async function handler(req, res) {
  const url = validarUrl(String((req.query && req.query.url) || ''));
  if (!url) {
    res.status(400).json({ error: 'Solo se pueden leer artículos de biencatolicos.com' });
    return;
  }
  const control = new AbortController();
  const tiempo = setTimeout(() => control.abort(), 8000);
  try {
    const r = await fetch(url.href, {
      signal: control.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'AdvientoBienCatolicos/1.0 (+https://adviento.biencatolicos.com)', Accept: 'text/html' }
    });
    if (!r.ok) { res.status(502).json({ error: 'El artículo no respondió' }); return; }
    const final = validarUrl(r.url) ? r.url : url.href;
    const html = await r.text();
    const datos = extraer(html, final);
    if (!datos) { res.status(422).json({ error: 'No se encontró el contenido del artículo' }); return; }
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({ ...datos, url: final });
  } catch (e) {
    res.status(504).json({ error: 'No se pudo cargar el artículo' });
  } finally {
    clearTimeout(tiempo);
  }
}
