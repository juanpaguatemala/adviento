#!/usr/bin/env python3
"""Convierte contenido-adviento.txt en los archivos JSON de /data.

Uso:  python3 scripts/convertir.py
El texto se conserva tal cual; solo se limpian los créditos de imágenes
pegados por error y textos sueltos de la página web original.
"""
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUENTE = os.path.join(RAIZ, 'contenido-adviento.txt')
DESTINO = os.path.join(RAIZ, 'data')

BASURA = {
    'rabakoz.hu', 'eastsidecatholic.org', 'vanidades.com', 'pravachakasabdam.com',
    'aztecalaguna.com', 'eltiempo.com', 'gazetadopovo.com.br',
    'thevalleycatholic.org', 'redmas.com.co',
    'Descarga la app de BienCatólicos',
    'Lleva el Evangelio, los santos y las reflexiones en tu celular. Descárgala gratis en Google Play.',
    'Disponible en', 'Google Play', 'Print Friendly and PDF',
}

MESES = {'noviembre': 11, 'diciembre': 12, 'nov': 11, 'dic': 12}


def leer():
    with open(FUENTE, encoding='utf-8') as f:
        txt = f.read().replace('\r\n', '\n').replace('\r', '\n').replace(' ', ' ')
    lineas = []
    for l in txt.split('\n'):
        s = l.strip()
        if s in BASURA or s.startswith('Tiempo estimado para leer'):
            continue
        lineas.append(s)
    return lineas


def entre(lineas, inicio, fin=None, desde=0):
    i = lineas.index(inicio, desde)
    j = lineas.index(fin, i + 1) if fin else len(lineas)
    return lineas[i + 1:j], j


def parrafos(ls):
    """Agrupa líneas no vacías en párrafos (cada línea del original es un párrafo)."""
    return [l for l in ls if l]


def fecha_iso(dia, mes):
    return '2026-%02d-%02d' % (MESES[mes], int(dia))


RE_DIA = re.compile(r'^Día (\d+) · (\S+) (\d+) de (noviembre|diciembre)$')


# ---------------------------------------------------------------- reflexiones
def reflexiones(ls):
    bloque, _ = entre(ls, 'Necesito una reflexión diaria, del 29 de noviembre al 24 de diciembre.',
                      'Mi encuentro diario con Jesús')
    dias, actual, campo = [], None, None
    semana = 1
    for l in bloque:
        m = RE_DIA.match(l)
        if m:
            actual = {'dia': int(m.group(1)), 'fecha': fecha_iso(m.group(3), m.group(4)),
                      'diaSemana': m.group(2), 'semana': semana, 'titulo': None,
                      'celebracion': None, 'cita': None, 'texto': [],
                      'reflexionar': None, 'oracion': [], 'proposito': None}
            dias.append(actual)
            campo = 'titulo'
            continue
        if l.startswith(('Segunda semana de Adviento', 'Tercera semana de Adviento', 'Cuarta semana de Adviento')):
            semana += 1
            continue
        if actual is None or not l:
            continue
        if re.match(r'^\d+ al \d+ de diciembre · ', l):
            continue
        if campo == 'titulo':
            actual['titulo'] = l
            campo = 'celebracion'
        elif l.startswith('Palabra de Dios:'):
            actual['cita'] = l.split(':', 1)[1].strip().rstrip('.')
            campo = 'texto'
        elif campo == 'celebracion':
            actual['celebracion'] = l
        elif l.startswith('Para reflexionar:'):
            actual['reflexionar'] = l.split(':', 1)[1].strip()
            campo = None
        elif l.startswith('Oración:'):
            resto = l.split(':', 1)[1].strip()
            if resto:
                actual['oracion'].append(resto)
            campo = 'oracion'
        elif l.startswith('Propósito:'):
            actual['proposito'] = l.split(':', 1)[1].strip()
            campo = None
        elif campo == 'texto':
            actual['texto'].append(l)
        elif campo == 'oracion':
            actual['oracion'].append(l)
    return dias


# ------------------------------------------------------------ buenas acciones
def buenas_acciones(ls):
    bloque, _ = entre(ls, 'Calendario de buenas acciones', 'Retiro personal')
    res, semana = [], 0
    for l in bloque:
        if re.match(r'^(Primera|Segunda|Tercera|Cuarta) semana · ', l):
            semana += 1
            continue
        m = re.match(r'^(\d+) (nov|dic): (.+)$', l)
        if m:
            res.append({'dia': len(res) + 1, 'fecha': fecha_iso(m.group(1), m.group(2)),
                        'semana': semana, 'accion': m.group(3)})
    return res


# --------------------------------------------------------------------- retiros
PREFIJOS_MEDITACION = ('Meditación familiar:', 'Meditación:')
PREFIJOS_PREGUNTA = ('Pregunta para el diario:', 'Preguntas para conversar:')
PREFIJOS_COMPROMISO = ('Compromiso familiar:', 'Compromiso de pareja:', 'Compromiso:')
RE_ETAPA = re.compile(r'^(Primera|Segunda|Tercera|Cuarta|Quinta) etapa: (.+)$')


def control_para(dia):
    t = (dia['dinamica'] + ' ' + ' '.join(dia['pasos'])).lower()
    pasos = ' '.join(dia['pasos'])
    if 'semáforo' in t:
        return {'tipo': 'semaforo'}
    if 'del 1 al 10' in t:
        m = re.search(r'en estas áreas: ([^.]+)\.', pasos)
        if m:
            areas = [a.strip() for a in re.split(r',| y ', m.group(1)) if a.strip()]
            return {'tipo': 'escala', 'areas': areas}
        return {'tipo': 'escala', 'libre': 3}
    if 'carta' in dia['dinamica'].lower():
        return {'tipo': 'carta'}
    if 'árbol' in t:
        return {'tipo': 'arbol'}
    if 'puente' in t or 'orillas' in t:
        return {'tipo': 'puente'}
    if 'ladrillo' in t:
        return {'tipo': 'lista', 'n': 6, 'etiqueta': 'Ladrillo'}
    if 'jardín' in t:
        return {'tipo': 'jardin'}
    if 'casa con cuatro habitaciones' in t:
        return {'tipo': 'casa'}
    if 'puerta' in t:
        return {'tipo': 'puerta'}
    if 'círculo' in t:
        return {'tipo': 'circulos'}
    if 'estaciones' in t or ('camino' in t and 'dibuj' in t):
        return {'tipo': 'camino'}
    if 'escudo' in t:
        return {'tipo': 'lista', 'n': 4, 'etiqueta': 'Valor'}
    m = re.search(r'\b(tres|cuatro|cinco|seis)\b', pasos.lower())
    n = {'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6}[m.group(1)] if m else 3
    return {'tipo': 'lista', 'n': n}


def retiro(ls, inicio, fin, clave):
    bloque, _ = entre(ls, inicio, fin)
    # Encabezado del retiro: texto previo al primer «Primera etapa»
    etapas, dias = [], []
    actual, campo, etapa_pendiente = None, None, None
    oracion_final = None
    for idx, l in enumerate(bloque):
        me = RE_ETAPA.match(l)
        if me:
            etapas.append({'n': len(etapas) + 1, 'nombre': me.group(2), 'lema': None})
            etapa_pendiente = etapas[-1]
            continue
        if etapa_pendiente is not None and l and not RE_DIA.match(l):
            etapa_pendiente['lema'] = l
            etapa_pendiente = None
            continue
        m = RE_DIA.match(l)
        if m:
            etapa_pendiente = None
            actual = {'dia': int(m.group(1)), 'fecha': fecha_iso(m.group(3), m.group(4)),
                      'diaSemana': m.group(2), 'etapa': len(etapas), 'dinamica': None,
                      'celebracion': None, 'objetivo': None, 'cita': None, 'meditacion': [],
                      'pasos': [], 'nota': None, 'preguntas': None, 'oracion': [],
                      'oracionEsFinal': False, 'compromiso': None}
            dias.append(actual)
            campo = 'dinamica'
            continue
        if actual is None or not l:
            continue
        if l.startswith('Dinámica:'):
            actual['dinamica'] = l.split(':', 1)[1].strip()
            campo = 'celebracion'
        elif l.startswith('Objetivo:'):
            actual['objetivo'] = l.split(':', 1)[1].strip()
            campo = None
        elif l.startswith('Palabra de Dios:'):
            actual['cita'] = l.split(':', 1)[1].strip().rstrip('.')
            campo = None
        elif l.startswith(PREFIJOS_MEDITACION):
            actual['meditacion'].append(l.split(':', 1)[1].strip())
            campo = 'meditacion'
        elif l.startswith('Desarrollo de la dinámica'):
            campo = 'pasos'
        elif re.match(r'^\d+\. ', l) and campo in ('pasos', 'nota'):
            actual['pasos'].append(re.sub(r'^\d+\. ', '', l))
            campo = 'pasos'
        elif l.startswith(PREFIJOS_PREGUNTA):
            actual['preguntas'] = l.split(':', 1)[1].strip()
            campo = None
        elif l.startswith('Oración final') and l.endswith(':'):
            actual['oracionEsFinal'] = True
            campo = 'oracion'
        elif l.startswith('Oración:'):
            resto = l.split(':', 1)[1].strip()
            if resto:
                actual['oracion'].append(resto)
            campo = 'oracion'
        elif l.startswith(PREFIJOS_COMPROMISO):
            actual['compromiso'] = l.split(':', 1)[1].strip()
            campo = None
        elif campo == 'celebracion':
            actual['celebracion'] = l
        elif campo == 'meditacion':
            actual['meditacion'].append(l)
        elif campo == 'pasos':
            actual['nota'] = l
            campo = 'nota'
        elif campo == 'oracion':
            actual['oracion'].append(l)
    for d in dias:
        d['control'] = control_para(d)
        if d['oracionEsFinal']:
            oracion_final = d['oracion']
    return {'etapas': etapas, 'dias': dias, 'oracionFinal': oracion_final}


# ---------------------------------------------------------------------- posadas
def posadas(ls):
    bloque, _ = entre(ls, 'POSADAS', 'SAN LUCAS CHALLENGE')
    intro, rito, dias = [], [], []
    i = 0
    # Introducción
    while bloque[i] != 'Lecturas y Guía para las posadas':
        if bloque[i] and bloque[i] != 'Lectura para las Posadas':
            intro.append(bloque[i])
        i += 1
    i += 1
    while not bloque[i].startswith('*Se leen'):
        if bloque[i]:
            rito.append(bloque[i])
        i += 1
    instruccion = bloque[i].lstrip('*').strip()
    i += 1
    actual, campo = None, None
    while bloque[i] != 'Petición de Posada':
        l = bloque[i]
        i += 1
        if l.startswith('Posada - Día'):
            actual = {'dia': int(l.split()[-1]), 'titulo': None, 'cita': None, 'lectura': [],
                      'reflexion': [], 'pregunta': None, 'oracion': None, 'peticion': None}
            actual['fecha'] = '2026-12-%02d' % (15 + actual['dia'])
            dias.append(actual)
            campo = None
            continue
        if not l or actual is None:
            continue
        if l == 'Texto Bíblico':
            campo = 'cabecera'
        elif campo == 'cabecera':
            titulo, cita = l.split('.', 1)
            actual['titulo'] = titulo.strip()
            actual['cita'] = cita.strip().rstrip('.')
            campo = 'lectura'
        elif l == 'Reflexión':
            campo = 'reflexion'
        elif l.startswith(('Pregunta para reflexionar:', 'Preguntas para reflexionar:')):
            actual['pregunta'] = l.split(':', 1)[1].strip()
            campo = None
        elif l == 'Oración del día':
            campo = 'oracion'
        elif l.startswith('Petición:'):
            actual['peticion'] = l.split(':', 1)[1].strip()
            campo = None
        elif campo == 'lectura':
            actual['lectura'].append(l)
        elif campo == 'reflexion':
            actual['reflexion'].append(l)
        elif campo == 'oracion':
            actual['oracion'] = l.replace('a n de que', 'a fin de que')
    resto = bloque[i + 1:]
    afuera, adentro, todos, final = [], [], None, None
    modo = None
    for l in resto:
        if not l:
            continue
        if l == 'Afuera':
            modo = 'afuera'
        elif l == 'Adentro':
            modo = 'adentro'
        elif l.startswith('Todos'):
            modo = 'todos'
        elif l == 'Oración Final':
            modo = 'final'
        elif modo == 'afuera':
            afuera.append(l)
        elif modo == 'adentro':
            adentro.append(l)
        elif modo == 'todos':
            todos = l
        elif modo == 'final':
            final = re.sub(r'\s+,', ',', l)
    return {'intro': intro, 'rito': rito, 'instruccion': instruccion, 'dias': dias,
            'peticion': {'afuera': afuera, 'adentro': adentro, 'todos': todos},
            'oracionFinal': final}


# -------------------------------------------------------------------- san lucas
def san_lucas(ls):
    bloque, _ = entre(ls, 'SAN LUCAS CHALLENGE', 'Video')
    intro = []
    for l in bloque:
        if l == 'San Lucas Challenge':
            break
        if l and l != 'Del 1 al 24 de diciembre':
            intro.append(l)
    dias = []
    for l in bloque:
        m = re.search(r'href="([^"]+)">Día (\d+): ([^<]+)</a>', l)
        if m:
            dias.append({'dia': int(m.group(2)), 'fecha': '2026-12-%02d' % int(m.group(2)),
                         'titulo': m.group(3).strip(), 'url': m.group(1)})
    return {'intro': intro, 'dias': dias}


# ------------------------------------------------------------- artículos y más
def articulos(ls):
    bloque, _ = entre(ls, 'Artículos de Adviento', 'Domingos de Adviento y Noche Buena')
    res = []
    for l in bloque:
        m = re.match(r'^(.+?):?\s+(https://\S+)$', l)
        if m:
            res.append({'titulo': m.group(1).strip(), 'url': m.group(2)})
    dom, _ = entre(ls, 'Domingos de Adviento y Noche Buena', 'Quizz')
    bendicion, domingos, rosario = [], [], None
    en_bendicion = False
    for l in dom:
        if l.startswith('BENDICION DE LA CORONA'):
            en_bendicion = True
            continue
        if en_bendicion:
            if l.startswith('Rosario de adviento'):
                en_bendicion = False
            elif l:
                bendicion.append(l)
                continue
        if l.startswith('Rosario de adviento'):
            rosario = {'titulo': 'Rosario de Adviento', 'url': l.split(': ', 1)[1].strip()}
        m = re.search(r'(https://\S+)', l)
        if m and not l.startswith('Rosario'):
            titulo = l.split(' - ')[0].split(' https')[0].strip()
            domingos.append({'titulo': titulo, 'url': m.group(1)})
    # Fechas de visibilidad de cada artículo dominical
    rangos = [('2026-11-29', '2026-12-05'), ('2026-12-06', '2026-12-12'),
              ('2026-12-13', '2026-12-19'), ('2026-12-13', '2026-12-19'),
              ('2026-12-20', '2026-12-23'), ('2026-12-24', '2026-12-24')]
    nombres = ['Primer Domingo de Adviento', 'Segundo Domingo de Adviento',
               'Tercer Domingo de Adviento', 'Tercer domingo, domingo de "Gaudete"',
               'Cuarto Domingo de Adviento', 'Adviento: hoy es Nochebuena']
    for d, (a, b), n in zip(domingos, rangos, nombres):
        d['desde'], d['hasta'], d['titulo'] = a, b, n
    vid, _ = entre(ls, 'Video', '1. Estructura general de la aplicación')
    videos = []
    for l in vid:
        m = re.match(r'^(.+?)\s+-?\s*(https://youtu\.be/([\w-]+))', l)
        if m:
            titulo = m.group(1).strip().rstrip('-').strip()
            if titulo == 'Que es el Adviento':
                titulo = '¿Qué es el Adviento?'
            videos.append({'titulo': titulo, 'id': m.group(3)})
    return {'articulos': res, 'domingos': domingos, 'bendicion': bendicion,
            'rosario': rosario, 'videos': videos}


def quiz(ls):
    bloque, _ = entre(ls, 'Quizz', 'POSADAS')
    res, preg = [], None
    for l in bloque:
        m = re.match(r'^(\d+)\. (.+)$', l)
        if m:
            preg = m.group(2).replace('*', '')
            continue
        if preg and l:
            res.append({'n': len(res) + 1, 'pregunta': preg, 'respuesta': l.replace('*', '')})
            preg = None
    return res


def oraciones(extra):
    return {
        'bendicion': extra['bendicion'],
        'velas': [
            {'n': 1, 'nombre': 'Esperanza', 'color': 'morada', 'desde': '2026-11-29',
             'oracion': 'Señor, encendemos esta primera luz mientras esperamos tu venida. Que la esperanza no se apague en nuestro hogar, aunque la noche sea larga. Ven, Señor Jesús. Amén.'},
            {'n': 2, 'nombre': 'Paz', 'color': 'morada', 'desde': '2026-12-06',
             'oracion': 'Señor, con esta segunda luz te pedimos paz: en nuestro corazón, en nuestra casa y en Guatemala. Haznos constructores de paz. Ven, Señor Jesús. Amén.'},
            {'n': 3, 'nombre': 'Alegría', 'color': 'rosa', 'desde': '2026-12-13',
             'oracion': 'Señor, esta luz rosa nos recuerda que estás cerca. Llena nuestra casa de una alegría que no dependa de que todo salga bien, sino de saber que vienes. Ven, Señor Jesús. Amén.'},
            {'n': 4, 'nombre': 'Amor', 'color': 'morada', 'desde': '2026-12-20',
             'oracion': 'Señor, ya todas las luces brillan. Que el amor sea el pesebre donde te recibamos esta Navidad. Ven, Señor Jesús. Amén.'},
            {'n': 5, 'nombre': 'Cristo, luz del mundo', 'color': 'blanca', 'desde': '2026-12-24',
             'oracion': 'Niño Jesús, luz del mundo, esta noche naces entre nosotros. Que tu luz ilumine nuestro hogar y a quienes amamos. Amén.'}
        ],
        'pesebre': 'Niño Jesús, te miro pequeño y en silencio, y entiendo que no viniste a imponerte sino a ser recibido. Aquí está mi casa, sencilla como Belén, con sus alegrías y sus pendientes. María, enséñame a guardarte en el corazón; San José, enséñame a cuidarte con fidelidad. Que nunca falte lugar para Ti entre nosotros. Amén.',
        'nochebuena': [
            'Antes de la cena, la familia se reúne ante el nacimiento, con el pesebre todavía vacío.',
            'Se lee Lucas 2,1-14.',
            'El miembro más pequeño o más anciano coloca al Niño Jesús en el pesebre.',
            'Se enciende la vela blanca y se canta un villancico.',
            'Bendición de la mesa.'
        ],
        'bendicionMesa': 'Bendice, Señor, estos alimentos y a quienes los preparamos. Acuérdate de quienes esta noche no tienen pan ni compañía. Que el Niño que hoy nace sea el invitado principal de esta mesa. Amén.',
        'novena': 'En Guatemala, la novena de Navidad se vive en las Posadas, del 16 al 24 de diciembre: nueve noches acompañando a María y José en su camino a Belén.',
        'rosario': extra['rosario']
    }


def guardar(nombre, datos):
    with open(os.path.join(DESTINO, nombre), 'w', encoding='utf-8') as f:
        json.dump(datos, f, ensure_ascii=False, indent=1)


def main():
    os.makedirs(DESTINO, exist_ok=True)
    ls = leer()
    r = reflexiones(ls)
    b = buenas_acciones(ls)
    rp = retiro(ls, 'Retiro personal de Adviento 2026', 'Retiro familiar', 'personal')
    rf = retiro(ls, 'Del domingo 29 de noviembre al miércoles 23 de diciembre de 2026', 'Retiro de pareja', 'familiar')
    rpa = retiro(ls, 'Fechas: del domingo 29 de noviembre al miércoles 23 de diciembre de 2026.', 'Oraciones y tradiciones', 'pareja')
    rp.update({'clave': 'personal', 'nombre': 'Volver a Belén',
               'subtitulo': '25 días para sanar el corazón y encontrarse con Jesús',
               'boton': 'Marcar día como completado', 'tipoPreguntas': 'Pregunta para el diario'})
    rf.update({'clave': 'familiar', 'nombre': 'Nuestro hogar, un pequeño Belén',
               'subtitulo': '25 días para recibir a Jesús en familia',
               'boton': '¡Dinámica completada!', 'tipoPreguntas': 'Preguntas para conversar en familia'})
    rpa.update({'clave': 'pareja', 'nombre': 'Caminar juntos hacia Belén',
                'subtitulo': '25 días para fortalecer nuestro amor con Jesús',
                'boton': '¡Encuentro completado!', 'tipoPreguntas': 'Preguntas para conversar en pareja'})
    p = posadas(ls)
    s = san_lucas(ls)
    a = articulos(ls)
    q = quiz(ls)
    o = oraciones(a)
    guardar('reflexiones.json', r)
    guardar('buenas-acciones.json', b)
    guardar('retiro-personal.json', rp)
    guardar('retiro-familiar.json', rf)
    guardar('retiro-pareja.json', rpa)
    guardar('posadas.json', p)
    guardar('san-lucas.json', s)
    guardar('quiz.json', q)
    guardar('articulos.json', {'articulos': a['articulos'], 'domingos': a['domingos'], 'videos': a['videos']})
    guardar('oraciones.json', o)

    # ------------------------------------------------ reporte de verificación
    esperado = [('reflexiones', len(r), 26), ('buenas acciones', len(b), 26),
                ('retiro personal', len(rp['dias']), 25), ('retiro familiar', len(rf['dias']), 25),
                ('retiro pareja', len(rpa['dias']), 25), ('posadas', len(p['dias']), 9),
                ('san lucas', len(s['dias']), 24), ('quiz', len(q), 30),
                ('artículos', len(a['articulos']), 14), ('domingos', len(a['domingos']), 6),
                ('videos', len(a['videos']), 2)]
    ok = True
    print('REPORTE DE VERIFICACIÓN')
    for nombre, n, e in esperado:
        marca = 'OK ' if n == e else 'ERR'
        ok = ok and n == e
        print('  %s %-16s %2d de %2d' % (marca, nombre, n, e))
    vacios = []
    for d in r:
        for k in ('titulo', 'cita', 'texto', 'reflexionar', 'oracion', 'proposito'):
            if not d[k]:
                vacios.append('reflexión %d: %s' % (d['dia'], k))
    for ret in (rp, rf, rpa):
        if len(ret['etapas']) != 5 or not all(e['lema'] for e in ret['etapas']):
            vacios.append('%s: etapas' % ret['clave'])
        for d in ret['dias']:
            for k in ('dinamica', 'objetivo', 'cita', 'meditacion', 'pasos', 'preguntas', 'oracion', 'compromiso'):
                if not d[k]:
                    vacios.append('%s día %d: %s' % (ret['clave'], d['dia'], k))
    for d in p['dias']:
        for k in ('titulo', 'cita', 'lectura', 'reflexion', 'pregunta', 'oracion', 'peticion'):
            if not d[k]:
                vacios.append('posada %d: %s' % (d['dia'], k))
    if vacios:
        ok = False
        print('  Campos vacíos:')
        for v in vacios:
            print('   -', v)
    else:
        print('  Sin campos vacíos.')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
