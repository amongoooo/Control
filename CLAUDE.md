# Notas para Claude

Claude Code lee este archivo automáticamente al iniciar una sesión en este repositorio.
Aquí se guarda lo importante: preferencias del usuario, contexto y estado de las tareas.

## Preferencias del usuario (siempre que se pueda)

- Responder en **español**.
- Indicar el **porcentaje de avance** de la tarea o del mensaje (por ejemplo, "Progreso: 40 %").
- **Pushear siempre la rama** de trabajo después de cada commit (`git push -u origin <rama>`).
- **Al terminar una tarea grande**, mandar siempre el link de la página: https://amongoooo.github.io/Control/
  (Pages ya está activo desde `main` / raíz y el usuario confirmó que carga bien.)
- **Al terminar cada tarea**, recomendar:
  1. si conviene **seguir en este chat o abrir uno nuevo** (y por qué);
  2. el **modelo** a usar (Opus 5.5, Sonnet 5.5, Haiku 5.5, Fable 5.1);
  3. el **esfuerzo** recomendado (low / medium / high / xhigh / max);
  4. el **prompt** listo para copiar y pegar, escrito con cortesía ("por favor").
- El usuario muchas veces trabaja **solo desde el celular**: evitar pasos que requieran terminal o computadora;
  hacer todo lo posible desde la sesión en la nube.

## Contexto del entorno

- Las sesiones corren en un **contenedor en la nube**, no en la computadora del usuario.
- Repositorio: `amongoooo/Control` (al empezar estaba vacío).
- `gh` está instalado, pero su token no es válido (`gh auth status` falla) y `gh auth login` no sirve aquí.
  Para GitHub hay que usar las herramientas MCP (`mcp__github__*`), limitadas a `amongoooo/Control`.

## Tarea en curso: publicar "Laboratorio LGDR" en GitHub Pages

- La página es un solo archivo `index.html` (HTML, CSS y JS dentro). **No modificar su contenido.**
- El usuario la desarrolló como **artefacto en chats de proyecto de claude.ai**.
- Plan acordado (hacerlo desde aquí):
  1. Conseguir el contenido exacto de `index.html` (link del artefacto publicado o el código pegado).
  2. Agregar `.nojekyll` (vacío) y un `README.md` corto en español.
  3. Subir a la rama `main` de `amongoooo/Control`.
  4. El usuario activa Pages en *Settings → Pages → Deploy from a branch → main / (root)*.
  5. Verificar que cargue `https://amongoooo.github.io/Control/`.
- Idea original: repositorio `laboratorio-lgdr` creado con `gh repo create`; se descartó porque `gh`
  no tiene autenticación en este entorno.

## Estado

- [x] `CLAUDE.md` creado.
- [x] `index.html` obtenido del artefacto publicado "Laboratorio LGDR"
      (https://claude.ai/artifact/VPnTU4mLSqAikddxXAHDqy), copiado byte por byte (1 876 900 bytes).
      Para actualizarlo: `Artifact` con `action: "read"` en ese link y volver a copiar el archivo guardado.
      No depende de nada exclusivo de claude.ai (solo usa `localStorage`).
- [x] `.nojekyll` y `README.md`.
- [x] Push a la rama de trabajo y a `main` (commit 07c5618).
- [x] Pages activado por el usuario (main / raíz). Despliegue verificado: workflow
      "pages build and deployment" en `success`; el usuario confirmó que la página carga.
- Nota: el proxy bloquea `gh api .../pages` y `*.github.io`; para comprobar despliegues usar
  `mcp__github__actions_list` (workflow "pages build and deployment").

## Idea en curso: rediseño de la parte superior ("que parezca más una app")

- Estructura actual: `header.top` (eyebrow + `h1` + `.lede` largo) y debajo `nav.tabs` (sticky, pestañas
  con scroll horizontal: Resumen, Teoría, Simulador, P1–P7, Preguntas). Variables de color en `:root`
  (claro/oscuro automático). Fuentes: Archivo, IBM Plex Sans/Mono.
- El rediseño modifica `index.html` (el usuario lo autoriza explícitamente solo para esta parte superior).
  Mantener intactos el contenido y la lógica.
- **Hecho (v1):** barra de app fija `header.appbar#appbar` (logo, "Laboratorio LGDR", anillo de progreso
  `#abProg`, botón de tema `#abTheme` guardado en `localStorage['lgdr-tema']`) con `nav#tabs` dentro como
  chips. El encabezado grande solo se ve en Resumen; el párrafo `.lede` está plegado en `details.about`.
  CSS al final del `<style>` principal ("barra de app") y JS al final del `<body>`, solo de presentación.
  `--apph` = alto de la fila superior; se usa en `scroll-padding-top`, `.toc` y `.dtop`.
- Pruebas: Playwright a 390×844 comparando con la original (pestañas, candados, acordeón, `.dtop`,
  consola sin errores).
- **Hecho (v2): Sincronizar progreso** sin servidor. Botón `#abSync` en la barra → `dialog#syncDlg`
  (Enviar: QR + copiar enlace/código + compartir; Recibir: pegar código o enlace → tabla "aquí ahora /
  al combinar" → combinar y recargar). Claves sincronizadas: `lgdr-teoria-v1`, `lgdr-guias-v1`,
  `lgdr-preguntas-v1` (no el tema ni la sección abierta). Código = JSON `{v:1,t,g,p}` comprimido con
  `deflate-raw` en base64url con prefijo `1.` (o `0.` sin comprimir); enlace `?p=<código>`. Combinar =
  unión de claves, máximo de números, OR de booleanos, el historial más largo; se limpian `__proto__` etc.
  QR con `qrcode-generator` 1.4.4 (MIT) incluido en línea como `window.__lgdrQR` (sin CDN).
  Progreso completo ≈ 550–700 caracteres. Probado con dos navegadores, decodificando el QR con jsQR.
- **Hecho (v3): Formulario flotante en las evaluaciones.** Botón `#fxFab` ("∑ Formulario") que aparece solo
  cuando una evaluación `[data-exam]` está en pantalla (IntersectionObserver); sube (`.up`) cuando la
  evaluación está abierta para no tapar "Calificar". Abre `dialog#fxDlg` (reutiliza estilos `dialog.sync`)
  con pestañas Parte I / II / III y las fórmulas de las secciones 1–20 en HTML (clases `.fr` fracción,
  `.rt` raíz). CSS antes de `</style>` y JS al final del `<body>`, solo presentación.
- **Ojo al actualizar desde el artefacto:** si se vuelve a copiar el artefacto de claude.ai, se pierde el
  rediseño. Hay que reaplicarlo o pasar el rediseño al artefacto.

## Otros artefactos del usuario (galería de claude.ai)

- Sensor Hall en el eje de un go-kart — https://claude.ai/artifact/W9LNnTHcewwiSPFtzXuj5z
- Datos del Proyecto — https://claude.ai/artifact/GPSBNtYhwKfaETNpjxnUd2
- Taller de Electrónica: Ohm, diodos y transistores — https://claude.ai/artifact/9TBwLS6CNCjF3Cn4ZYkW9R
