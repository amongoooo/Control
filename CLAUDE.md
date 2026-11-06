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
- **No cambiar la plantilla de Word** (`plantillas/*.docx`, `herramientas/plantilla-reportes.js`, `herramientas/plantilla/datos.js`)
  ni `reportes.pdf`: el usuario pidió dejarlos como están. La Resolución paso a paso se adapta al Word, no al revés.
  (Excepción pedida por el usuario, v43: `reportes.pdf` ahora es **su** Word resuelto convertido a PDF; cambiarlo solo si sube otro.)
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
  Al cerrar el formulario modal se restaura `scrollY` (antes saltaba al inicio; `html:has(dialog.sync[open])`
  ya no aplica `overflow:hidden` a `dialog.fxd`).
  **Ojo:** la página ya usa la clase `.fx` (filas de fórmulas de las prácticas, `display:grid`); el diálogo se
  llama `dialog.sync.fxd` para no chocar. Hay respaldo `dialog.sync:not([open]){display:none}`.
- **Hecho (v4): Evaluación en pantalla completa.** Al tocar Empezar/Reiniciar/Intentar de nuevo (escucha en
  captura, sin tocar la lógica) la `.exam` recibe `.exfull` (fija, cubre todo) y `html.exm`, con barra
  `.exbar` (Salir · título · Formulario). El formulario se abre sin modal (`dialog.show()`, clase `.side` en `dialog.fxd`,
  `html.fxside`): a la derecha en ≥700 px y abajo (46dvh) en celular. Calificar → vuelve a la página normal.
  Salir (o Esc, o cambiar de pestaña) → confirma y borra las respuestas del intento (vacía `[data-body]`);
  el progreso guardado (mejor resultado, desbloqueos) no se toca.
- **Hecho (v5): Simulaciones de teoría.** `.demo>.dtop` (deslizadores) fijo arriba en todas las anchuras
  (antes solo ≤820 px). Cada deslizador de rango tiene degradado propio (`input.grad`, `--g0` mín → `--g1` máx;
  paleta: rojo→verde, morado→ámbar, azul→rosa, café→turquesa). Junto a cada resultado (fila `.fx` cuyo
  último término tras `=` es un solo número) van pares ▲▼ (`.dar > .dap`): ▲ = color del extremo que hace
  subir el valor, ▼ = el que lo baja; un par por cada deslizador que lo afecta. Se calcula llamando
  `spec.draw` con una copia del estado y lienzos sueltos (no toca estado, retos ni guías). Único cambio en la
  lógica original: en `build()` se agregó `el.__demo={spec,st,map}; window.__lgdrDemo(el)` (solo lectura).
  Nota `.dleg` antes de `[data-read]` explica los colores.
- **Hecho (v6): Simulación en pantalla completa.** Botón `.dfs-b` ("Pantalla completa") en `.dhead` de cada
  simulación con deslizadores. Al entrar: `.demo.dfull` (fija) + `html.dmode`; barra `.dbar` dentro de `.dtop`
  (Salir · título · Compacto/Completo · Gráficas). Se ocultan encabezado, guía, nota y pie; gráficas solo con
  `.dplt`. Compacto (`.dcomp`): cada fila `.fx` muestra `.fxc` = KaTeX de «primer término = último término»
  (separando por `=` a profundidad de llaves 0) + flechitas; oculta `.fxm`/`.fxn`. Preferencia en
  `localStorage['lgdr-sim-vista']` = `{m:'c'|'f', g:0|1}` (por defecto compacto, sin gráficas). Salir con
  botón, Esc o al cambiar de pestaña.
- **Hecho (v7): Flechita que cambia, más grande.** Al mover un deslizador `.grad` se guarda `act={x,dir}`
  (listener propio de `input`); en el par de ese deslizador la flecha hacia donde va la variable lleva
  `svg.g` (grande) y la contraria `svg.s` (chica, tenue); el par queda `.dap.on` y los de otros deslizadores
  `.dap.off` (atenuados). 900 ms sin mover (o 700 ms tras `change`) → vuelve a normal.
- **Hecho (v8): Indicaciones y retos en pantalla completa.** Botón «Retos» (`[data-dr]`) en `.dbar`; clase
  `.dgd` en la demo muestra `.gcur` (dentro de `.dtop`, fijo) y `[data-guide]`. Preferencia `r` en
  `lgdr-sim-vista` (por defecto 1). Botón oculto si la demo no tiene guía. En ≤520 px la barra se compacta
  (Salir solo con ✕) para caber en una fila.
- **Hecho (v9): Diagrama de bloques en Simulink** dentro de cada «Código MATLAB» (P1–P7): `div.bd[data-bd=pN]`
  tras `.codebox`. JS al final del `<body>` (solo lectura de `window.__PR`, `__analyze`, `__lib`): se arma al
  abrir el `details`. Chips por sistema (`cfg`), Escalón/Rampa si `P.ramp`, y «Bloque PID» si el compensador es
  PD/PID ideal (impropio → por defecto Gc·G en un solo Transfer Fcn). Compensador = ceros/polos de `cfg` menos
  los de `cfg[0]` (planta); se separa en bloques adelanto/atraso/PI. Tabla de parámetros (vectores para
  Numerator/Denominator), «Lo que debes obtener» (= Banco con K de diseño), código `sim`/`stepinfo` y botón
  «Ver este sistema en el Banco de pruebas». CSS `.bd*` antes de `</style>` principal.
- **Hecho (v10): Zoom en todas las gráficas.** Centralizado en `axes()` (de `__lib`): lee `canvas.__z`
  (`{x0,x1,y0,y1}` = fracciones del rango base, mismo factor en x e y) y devuelve también `X0..Y1` e `inv`.
  `plane()` y `drawPlane()` del simulador usan esos rangos/`inv` (así el arrastre del punto de prueba sigue
  bien con zoom). Redibujo con `canvas.__redraw` (puesto en `buildLab`, `build()` y simulador). `zoomUI(cv)`
  agrega `.zbar` tras el canvas (− slider + · nivel · ⟲). Rueda = zoom en el cursor; arrastrar = mover;
  doble clic = restablecer; en táctil, con zoom (touch-action none) se arrastra o pellizca. En lienzos con
  arrastre propio (`touchAction:none`, p. ej. «angulo», «paisaje») mover es con Mayús+arrastrar.
  Solo se adjunta a lienzos conectados (las flechitas ▲▼ dibujan en lienzos sueltos).
- **Hecho (v11): Pantalla completa en computadora (≥1000 px).** Con «Gráficas»: gráficas a la izquierda
  (sticky, alto = pantalla − `--dtoph`), lecturas `[data-read]` y lista de retos a la derecha (340–460 px);
  arriba, indicación y deslizadores lado a lado. `--dtoph` lo pone un ResizeObserver sobre `.demo>.dtop`.
  Sin gráficas: ancho hasta 1400 px y más columnas de fórmulas. En celular no cambia nada.
- **Hecho (v12): Entrada numérica en los deslizadores de las simulaciones de teoría.** En `build()` cada
  deslizador lleva `span.slv` con `input.slnum[data-n=k]` (+ unidad `.slu` sacada de `fmt`); el `<output
  data-o>` sigue existiendo pero `hidden` (el resto del código lo sigue escribiendo) y un MutationObserver
  sobre él copia el valor a la casilla (salvo si tiene el foco). Lo escrito NO se redondea al `step` del
  deslizador (para retos finos, p. ej. Routh con K = 479.3) y se limita a `[min,max]`; mientras se escribe
  solo se aplica si está en rango, al confirmar (Enter/blur) se recorta. Formatos que muestran «−v»
  (`slSign`) se escriben con signo negativo. Sin `inputmode` si el valor puede ser negativo (iOS no tiene
  «−» en el teclado decimal). Fuente 16 px en táctil (evita el zoom de iOS). Banco de pruebas y simulador
  ya tenían su casilla de K.
- **Hecho (v13): Pantalla completa de toda la app.** Botón `#abFull` (último de la barra) → API Fullscreen sobre
  `document.documentElement` (con `webkit` de respaldo), así que se mantiene al cambiar de pestaña y dentro de
  las capas `.demo.dfull` / `.exam.exfull`; clase `html.is-fs`. Lectura inmersiva: con `is-fs` o `is-app`
  (abierta desde el ícono de inicio) la barra se esconde al bajar y vuelve al subir (`html.ab-hide`; `.toc` y
  `.dtop` suben a `top:safe-area`); vuelve al cambiar de pestaña o al cerrar una simulación/evaluación.
  Al abrir la pantalla completa de una simulación o evaluación (`html.dmode` / `html.exm`) se pide también
  la pantalla completa real y se quita al salir, solo si se puso por eso (`auto`).
  **Ojo:** el `confirm()` nativo saca de pantalla completa en Chrome; por eso, en pantalla completa, el clic en
  «Salir» de la evaluación se intercepta en captura y se pregunta con `dialog#fsAsk`; si acepta, se repite el
  clic con `window.confirm` devolviendo `true` momentáneamente.
  iPhone (sin API): `dialog#fsDlg` explica «Agregar a pantalla de inicio» y ofrece Sincronizar progreso (el
  ícono de inicio tiene su propio `localStorage`). Archivos nuevos: `manifest.webmanifest`
  (`display: fullscreen`), `icon-180/192/512.png` (logo blanco sobre `#1d4ed8`); metas `apple-mobile-web-app-*`
  en el `<head>`. Abierta como app (`display-mode` o `navigator.standalone`) el botón se oculta.
  Pantallas ≤430 px: íconos de 34 px; ≤375 px se oculta el anillo de progreso.
- **Plan v14+ (rediseño para computadora): APROBADO (todo lo recomendado); se hace una etapa a la vez.** Publicado como artefacto
  https://claude.ai/artifact/TVv5frEJhE5CptruXQmG5n (diagnóstico a 1440×900 + 5 etapas con prototipos).
  No se ha tocado `index.html`. Etapas: 1 animaciones/microinteracciones · 2 contenido plegable con resumen ·
  3 deslizadores con imán y zona muerta · 4 transiciones (View Transitions + respaldo CSS) · 5 barra lateral en
  ≥1000 px. Decisiones pendientes del usuario (lo recomendado entre paréntesis): 1 organización (A: barra lateral
  + «En esta página»); 2 Teoría sigue con una sección abierta a la vez («desplegar todo» actúa dentro de ella);
  3 imán activo con interruptor, en retos solo marcas redondas; 4 resúmenes automáticos (primera frase / `h4`),
  sin texto nuevo; 5 corregir el error de abajo en la etapa 4. Flujo por etapa: Playwright (1440/1920/1280/390,
  claro/oscuro, reduced-motion, consola), `/code-review`, commit + push a la rama y a `main`, link, esperar visto bueno.
  Datos útiles: Teoría ya es acordeón (`buildAccordion`, `openSection`, `OPEN`, `OKEY='lgdr-teoria-abierta'`,
  `window.__openSec`); la regla global `[hidden]{display:none!important}` impide animar cierres con CSS; el banco
  usa escala log `K/100 … K·15`; los deslizadores de demos van de 0 a 1000 y se mapean con `map(c)`; para que el
  imán corra antes que el listener original, escuchar `input` en captura en el contenedor. Línea base: cambio de
  pestaña 50 ms (Resumen) – 480 ms (Teoría); 37 798 elementos; carga ~1.2 s.
- **Hecho (v14 · etapa 1): Animaciones y microinteracciones.** El usuario aprobó todo lo recomendado.
  CSS «v14 · movimiento» antes del `</style>` principal y `<script>` propio al final del `<body>`.
  Variables `--mo-*`; `@property --gl` (brillo que sigue al cursor con `--mx/--my`, solo en `:hover` y con
  puntero fino); elevación de 1 px y sombra al pasar el mouse; presión `scale:.95` con rebote (se usan `scale` y
  `translate` sueltos; en `.abpill/.abicon/tabs/.sy-b` se anula su `transform` de `:active`). Pestañas: `span.tab-fly`
  viaja de la pestaña anterior a la nueva (MutationObserver sobre `aria-current`, medido en rAF). Deslizadores del
  banco, simulador y zoom (`.kctl`/`.zbar`, clase `html.mo-rng`) ahora con círculo propio y relleno `--rf`; para que
  el relleno siga los cambios por código se redefine `value` **en cada elemento** (no en el prototipo). Acordeón:
  al cerrar la sección abierta se pliega con WAAPI y luego se repite el clic (solo si sigue abierta).
  **No usar `:is()` largos en la posición derecha**: Chrome no los indexa y cada cambio de página tardaba ~19 % más;
  escritos uno por uno queda en ~+7 %. Todo el movimiento está en `prefers-reduced-motion: no-preference`.
- **Hecho (v15 · etapa 2): Contenido plegable con resumen.** CSS «v15 · plegables» antes del `</style>` principal y
  `<script>` propio al final del `<body>` (solo presentación). Todo empieza plegado; lo abierto se guarda en
  `localStorage['lgdr-plegado-v1']` = `{"<página>:<clave>":1}` (no entra en la sincronización). Envoltorio `div.fold` >
  `h3.fold-t` > `button.fold-h` (`.fnn` número, `.ftt` título, `.fss` resumen, `.fcv` flecha) + `div.fold-b` con
  `hidden="until-found"` (Ctrl+F lo abre; `beforematch` marca el estado). Se anula `[hidden]{display:none!important}` solo en
  `.fold-b[hidden=until-found]` (queda `content-visibility:hidden`). La tarjeta original va dentro sin su marco y con su título
  duplicado oculto por CSS. P1–P7: Planteamiento (resumen = planta y especificación de la tabla de Resumen), Banco (resumen en
  vivo con un MutationObserver: sistema, K, estable, %OS, Ts), secciones 1–4 (resumen = sus `h4`, o las negritas iniciales, o
  la primera frase); `details.code` se adopta tal cual. Resumen: tabla, método, uso del banco, `puntoZeta.m` y «Acerca de».
  Teoría: `p.lede` → `details.about.fabout`; tarjeta de avance compacta (`.fcomp`, oculta `.route` y `.smap`) con botón
  `.fdetb` «Ver detalle» que se vuelve a poner tras cada `renderProgress()`; cada sección cerrada muestra `p.tsum` (primera
  frase, conserva KaTeX). El acordeón no cambia (una sección a la vez) y «Desplegar todo» en Teoría solo abre «Acerca de» y el
  detalle del avance. Simulador: «Acerca de», Fórmulas en vivo y Explícame (la herramienta y gráficas siguen a la vista).
  Preguntas: cada `.qtopic` se pliega (las `.q` pasan a `.fold-b`; `update()` las sigue encontrando) con «a/b dominadas» y
  niveles; se engancha envolviendo `__pageInit.preguntas`. Barra `.fbar` «Desplegar todo / Plegar todo» en `.phead` (en
  Resumen, antes de la tabla); cascada de 45 ms al desplegar, cancelable. `Element.prototype.scrollIntoView` envuelto para
  abrir el plegable del destino (enlaces «Ver este sistema en el Banco», chips de temas). Animación con WAAPI (altura) y sin
  animación con movimiento reducido. Probado: lienzos de los 7 bancos idénticos píxel a píxel a la versión anterior tras
  desplegar y mover K; claves de progreso intactas; cambio de pestaña más rápido (P1 88→31 ms, P6 137→68, Simulador 198→75).
  **Ojo para probar Ctrl+F con enlaces `#p6:~:text=`:** el error del salto a Teoría oculta la página antes de buscar; se probó
  en Resumen.
- **Hecho (v16 · etapa 3): Deslizadores con imán y zona muerta.** CSS «v16» antes del `</style>` principal y `<script>`
  propio al final del `<body>` (solo presentación). **Sin marcas visibles** (el usuario pidió quitar las rayitas/puntos); solo
  una etiqueta verde sobre el círculo mientras está pegado, y halo verde en el círculo. Bancos P1–P7 (`window.__labs`): K de
  diseño, otras K de la misma planta (`cfg` con mismos z/p), K crítica (barrido de estabilidad + bisección), puntos de quiebre
  (raíces de N·D′ − N′·D con K > 0) y 1/10/100. Simulaciones de teoría (`el.__demo`): tabla `SP` por simulación (ζ = 0.707 y 1,
  eje jω, K crítica de Routh `KC`, cancelaciones…), valor inicial y valores redondos. Simulador: sin imán.
  Mecánica: escucha `input` en captura en `window`; solo con arrastre del puntero (no teclado, no casilla, no animaciones).
  Atrae a ≤ 10 px (o la mitad de la distancia a la vecina) y suelta a 18 px; en pistas angostas 3.5 % / 6 % del largo
  (`radii()`). Pegado = `stopImmediatePropagation` + valor exacto por la casilla numérica (evento `change`). Movimiento:
  `drive()` (rAF) desliza el círculo a la marca; en la zona muerta se inclina hasta 30 % hacia donde jalas sin cambiar el valor;
  al soltarse alcanza rápido al puntero (listener `input` de burbuja). La animación se detiene si otro código cambia el valor.
  **Retos** (guía en modo Retos con reto pendiente): solo valores redondos y solo tras 1 s encima (`DWELL`); así el reto da lo
  mismo con y sin imán (probado con Routh P2: 396 → logrado en ambos). Alt al arrastrar lo desactiva. Interruptor «Imán»
  (`[data-mag]`) junto al estado del banco y en `.dbar` de la pantalla completa; `localStorage['lgdr-iman']` ('0' = apagado),
  fuera de la sincronización. Se arma en tiempo libre (`requestIdleCallback`) o al tocar el deslizador. Depuración:
  `window.__lgdrMag.list()`. También se borró `__testfind.html` (archivo de prueba que se subió por error en la etapa 2).
- **Hecho (v17 · etapa 4): Transiciones de página** (View Transitions con respaldo CSS). CSS «v17» antes del `</style>`
  principal; `<script>` propio al final del `<body>` y un **gancho temprano** justo después del script del tema
  (`addEventListener('hashchange',…window.__lgdrVTHash)`): en `window`, Chrome llama a los oyentes de `hashchange` en orden de
  registro aunque sean de captura, así que el gancho debe ir antes que `show()`. Cambio de sección (pestañas, atrás/adelante,
  enlaces): el gancho detiene el evento y lo repite (`new HashChangeEvent`) dentro de `startViewTransition`; sale hacia un lado y
  entra desde el otro según el orden de `[data-page]` (`--vt-dir`); la barra (`vt-bar`) no se mueve. Teoría: clic en `.acchb` o
  en `nav.toc a[data-goto]` de una sección desbloqueada y cerrada → se repite el clic dentro de la transición y se baja al instante
  (las secciones cercanas a la pantalla llevan nombre `vt-sN`; la barra va encima con `z-index`). Pantallas completas (`.dfs-b`,
  `.dbx`, Empezar/Reintentar, Calificar, Salir sin respuestas, Esc): la tarjeta (`vt-card`) crece o vuelve a su lugar; con
  respuestas no se anima (confirm/`fsAsk` como antes). La pantalla completa real se pide/quita al terminar la animación
  (`holdFs` envuelve `requestFullscreen`/`exitFullscreen` con contador; se descarta la petición si la capa ya se cerró).
  Se omite la animación si la actualización o un cuadro tarda > 300 ms (`slow[]`, se vuelve a medir). Sin View Transitions:
  `section.page.vt-fb` (220 ms). Movimiento reducido: nada. Clases `html.vt-page/vt-acc/vt-card` solo durante la transición.
  Pruebas: recorrido de pestañas, atrás/adelante, clics rápidos, 6 aperturas en Teoría, 2 simulaciones y 1 evaluación con
  mismas posiciones de scroll que la versión anterior, sin View Transitions, movimiento reducido, `?p=…#p3`, celular; consola limpia.
  **Ojo:** en el contenedor (sin GPU) los cuadros duran 60–180 ms, así que las animaciones se ven lentas en Playwright.
- **Hecho (v18): interruptor «Animaciones»** (`#abAnim`, antes de `#abTheme`): solo aparece si el sistema pide reducir
  movimiento (el usuario tenía «Efectos de animación» apagado en Windows y no veía nada). Encendido =
  `localStorage['lgdr-anim']='1'` (fuera de la sincronización) y recarga. Un script temprano (después del gancho v17)
  reescribe, antes que todo, las consultas del CSS (`CSSMediaRule.media.mediaText`) y envuelve `window.matchMedia`:
  `(prefers-reduced-motion:no-preference)` → `(min-width:0px)` y `(prefers-reduced-motion: reduce)` → `(max-width:-1px)` (nunca).
  Datos en `window.__lgdrAnim = {sys, on}`. Página de diagnóstico: https://claude.ai/artifact/VP46KFQS37bv12FTV2b7pc
- **Hecho (v19 · etapa 5): Barra lateral en computadora (opción A).** CSS «v19» antes del `</style>` principal, `<script>` propio al
  final del `<body>` y un script temprano (después del de v18) que pone `html.sb-on`/`sb-rail` antes del primer dibujo (si `#sbar`
  no existe al cargar, los quita). ≥ 1000 px (`html.sb-on`): `nav#tabs` oculto (`--navh` = 0) y `nav#sbar` fijo a la izquierda
  (248 px) con grupos Inicio/Aprender/Practicar/Repasar, armado desde `#tabs` (mismos `#hash`, así v17 sigue igual). Teoría muestra su %
  (`#abProg`) y las partes I–III con avance y candado leídos de `nav.toc` (`.tocg.locked`, `[data-tocbar] i`); clic en una parte →
  `#teoria` y baja a `.tphase .tpart` (o a su `.lockp`). P1–P7 con ✓/! según la tabla de Resumen; Preguntas con «n/71».
  `html.sb-rail` (1000–1199 px, y siempre en Teoría): 76 px, solo íconos y P1…P7. Indicador `.sb-ind` que se desliza.
  ≥ 1440 px (`html.sb-toc`, fuera de Teoría y si la página tiene plegables): `aside#sbtoc` «En esta página» con los plegables de v15
  (● abierto/○ plegado, resaltado del que se lee, clic = `scrollIntoView`, que v15 envuelve y abre) y Desplegar/Plegar todo
  (`__lgdrFolds.all`); la `.fbar` de la página se oculta. Contenido hasta 1240 px centrado entre las barras (márgenes de `.wrap`).
  Anchos `--sbw/--tcw/--sbmax` registrados con `@property` (no heredables) para que cambiar de modo no recalcule toda la página.
  Teoría: índice de 256 px y `.tdots` a la derecha (absoluto). Transición v17: `#sbar` lleva `vt-side` y no se mueve. Impresión: sin barras.
  Probado: navegación, atrás, partes, columna derecha, pantallas completas (simulación, evaluación con formulario), `ab-hide`,
  cambio de tamaño (900/1100/1440), movimiento reducido, claves de progreso intactas, 390 y 999 px iguales a antes; cambio de página
  +5–25 ms (≈ +8–12 %) a 1280 y 1440 px (p. ej. P1 44 → 50 ms, Teoría 190 → 216 ms; casi todo es el diseño nuevo, no el JS).
- **Corregido en la etapa 4 (decisión 5): el salto a Teoría al cargar** (venía del artefacto original): `openSection(id,scroll,stay)`;
  `buildAccordion()` llama `openSection(o,false,true)` y así la apertura inicial ya no cambia `location.hash`.
- **Hecho (v20): «Saltar evaluación ⏭»** (pedido del usuario: saltar los exámenes). Botón `[data-skipex]` en el panel del
  candado (`lockHTML`, junto a «Ir a la evaluación») y en la cabecera de las evaluaciones I y II (no en la III: no desbloquea nada).
  Dos toques (el 1.º cambia a «¿Seguro? Toca otra vez…», 4 s), sin `confirm()` para no salir de pantalla completa.
  Guarda `ST.skip[r]=true` en `lgdr-teoria-v1` (se sincroniza con la combinación genérica) y lanza `unlockAnim` de la parte
  siguiente. `isUnlocked` usa `passedOrSkipped(r)`; la parte «actual» (apertura inicial y Resumen) ignora las saltadas.
  La evaluación saltada muestra la pastilla «Saltada ⏭» y se puede presentar igual.
  **Deshacer salto ↩** (v21): botón `[data-undoex]` en la cabecera de la evaluación I/II, visible solo si está saltada y no aprobada;
  también dos toques; borra `ST.skip[r]` y vuelve a bloquear la parte siguiente. `isUnlocked` ahora es recursivo (deshacer I
  bloquea también la III). Probado a 390×844.
  **Desbloquear sección ⏭** (v33): cada sección bloqueada de Teoría muestra bajo su encabezado la fila `.sskr` («🔒 Completa la
  sección n o ábrela ya:» + `[data-sskip]`), dos toques (`twoTap`). Guarda `ST.skip['s:<id>']=true` (se sincroniza igual) y
  `secUnlocked` lo acepta; la abre con la animación `sunlock`. Abierta así (y con la anterior sin completar) la fila dice
  «Abierta sin completar…» con `[data-sundo]` «Volver a bloquear ↩» (solo visible con la sección abierta, clase `.sskd`).
  Las partes II/III se siguen desbloqueando con «Saltar evaluación».
- **Ojo al actualizar desde el artefacto:** si se vuelve a copiar el artefacto de claude.ai, se pierde el
  rediseño. Hay que reaplicarlo o pasar el rediseño al artefacto.
- **Hecho (v21): Prácticas según la guía** (`Guia_practicas_compensadores_LGDR.pdf`, 2 páginas: procedimiento obligatorio
  «Análisis del sistema de referencia» 5 pasos + evidencia, «Verificación del sistema completo» 6 pasos + advertencia, y
  estructura del reporte de 10 puntos). En P1–P7 se reemplazaron las tarjetas 1 y 3: `#pN-ana` (pasos 1–5 con los títulos de
  la guía; reutiliza los `.xstep` originales como `.gsub` con `h5`, más polos en lazo cerrado con K de referencia, contraste
  «si se asumiera K = 1» y recuadro `.evid` con LGDR inicial, respuesta temporal y tabla 2º orden vs. simulación) y `#pN-ver`
  (`#pN-v1`…`#pN-v6`: ecuación final y todas las raíces, estabilidad + rango de K con Routh numérico + tabla candidato/obtenido,
  tabla de modos con residuos al escalón, simulación del modelo completo con metas y píldoras cumple/casi/no cumple, error
  estacionario analítico vs. simulado, ajuste y re‑verificación; `.note.gnote` con la advertencia). Tarjeta 2 → `#pN-dis`
  «Desarrollo y justificación del diseño» + paso `#pN-ctrl` «Controlador final y parámetros»; tarjeta 4 → `#pN-con`;
  `details.code#pN-mat`. Pasos: `.gstep>h4[data-n]` (número por CSS `::before`, así el resumen del plegable v15 no lo
  incluye). Figuras SVG en línea `.gfig` con colores del tema. Números calculados con python-control (coinciden con los del
  banco). Ajustes reportados: P1 K = 49.38, P3 variante 0.02/0.001, P5 p_c = 27.0 / K = 364.1, P7 p_ad = 12.29 / K = 290.31.
  **Libro:** el usuario pasó fotos de Nise, *Sistemas de control para ingeniería* (pp. 457, 501–505, 510–531, 540–543). **Referencia:** Nise, N. S.,
  *Sistemas de control para ingeniería*, 3.ª ed. en inglés (1.ª en español), Compañía Editorial Continental (CECSA), 3.ª reimpresión,
  México, 2006 (portada confirmada por el usuario). Columna «Libro» en la tabla de evidencia y en el paso 4 de la verificación con sus valores
  (P4 tabla 9.3 con simulación 14.8 %/3.6 s y 11.8 %/1.2 s; P6 tabla 9.5, predicción PID Tp = 0.214 s; P7 K = 205.4; P5 25.52 / 476.3).
  Lectura de modos por residuo: casi cancelado si |residuo| < 12 % del dominante; si no, «cancelación parcial» (como el libro en P4).
- **Hecho (v22): Ventana del reporte con la simulación del reporte de P1–P7.** Botón `.repbtn[data-rep=pN]` en `.phead` →
  `dialog#repDlg.sync.rpd` (pantalla completa en celular, 880 px en computadora): barra fija `.rp-bar` (título, «Imprimir / PDF»
  `[data-rp-print]`, cerrar), nota «Simulación», índice plegable `details.rp-idx` (salta dentro del documento) y `article#repDoc.rpdoc`.
  Documento con los 10 puntos de la guía (`section.rps[data-n]`, cada `h2` con «En la página ›» = `button.rp-pg[data-k]`, que cierra y
  hace `scrollIntoView` a la parte como antes). Texto de cada práctica en el objeto `R` del script del reporte (al final del `<body>`):
  `obj, model, blocks, specs, s3, s4, s5, s6a/b/c, s7, s7b, cmp, s8, con, calc`; `\( \)` y `\[ \]` se pasan por KaTeX (`window.katex`).
  Figuras y tablas se **copian de la página** (`#pN-ana .evid`, `#pN-ctrl`, `#pN-v2/v3/v4`, código de `#pN-mat pre`) con ids renombrados
  (clipPath), y se numeran «Figura n / Tabla n». Diagrama de bloques SVG propio (`.rp-diag`). Punto 1: ejercicio (de `.phead .src`),
  capítulo (8 o 9), referencia del libro (Nise, CECSA 2006) y líneas en blanco para alumno/grupo/fecha.
  Impresión: `prep()` copia el documento a `div#repPrint` (hijo de `body`) y pone `html.rp-print`; en `@media print` sólo se ve eso, con
  colores claros forzados, y `document.title` = «Reporte Práctica N – …» (nombre del PDF); `afterprint`/cerrar → `done()`. También
  funciona con Ctrl+P (`beforeprint`). Depuración: `window.__lgdrRep.{open,prep,done,data}`. PDF de prueba (P4): 6 páginas carta.
  Si cambian los números de una práctica, revisar también el texto de `R` (las tablas/figuras copiadas se actualizan solas).

- **Hecho (v23): PDF con todas las prácticas.** Pestaña «PDF» (`<a href="#pdf">` en `nav#tabs`, después de Preguntas;
  en la barra lateral cae en «Practicar» con ícono `IC.pdf`) → `section#pdf.page`: Abrir / Descargar `practicas.pdf`, lista
  P1–P7 con `practicas.pdf#pN` (destinos con nombre; algunos visores del celular los ignoran) y cómo navegar. CSS «pestaña PDF»
  (`.pdfacts`, `.pdflist`) antes del `</style>` principal.
  `practicas.pdf` (A4, ~53 páginas, ~3.7 MB) se **genera** con `node herramientas/pdf-practicas.js` (Playwright, tema claro,
  movimiento reducido; no toca `index.html`): abre cada práctica, despliega los plegables, abre `details` (arma el diagrama de
  Simulink), captura las gráficas del banco como imagen, quita los plegables (cada tarjeta recupera su título) y lo interactivo;
  agrega portada-índice `#pdf-indice` con enlaces a cada práctica y sección, barra ◀ anterior · Índice · siguiente ▶ arriba y
  abajo de cada práctica, chips de secciones y «↑ Inicio» al final de cada sección; marcadores (`outline: true`).
  En el PDF todo va en `display:block` (la fragmentación de grid de Chromium superponía contenido).
  **Volver a correr el script y subir `practicas.pdf` cada vez que cambie el contenido de las prácticas.**

## Hecho (v24): "Resolución paso a paso" — P1–P7 listas

- Tarjeta `div.card.pasos[data-pasos="pN"]` justo después de `.card.bench` (P1 ya la tiene). No toca el contenido existente.
- Script propio al final del `<body>` («Resolución paso a paso»): `PASOS.pN = () => ({title, intro, steps:[...]})` y un visor
  genérico `buildPasos(el)` que se arma al mostrar la página (envuelve `__pageInit[pN]`). Usa `window.__lib` (roots, simulate,
  setupCanvas, axes, css), `window.FX.tx/n` (KaTeX) y `window.__T` (zetaPoint, metrics). **Los números se calculan en vivo**
  (no están escritos a mano). Expuesto como `window.__PASOS`.
- Cada paso: `{t, q, f:[{l, t (TeX) | h (HTML), n, res}], why, blk, vis:[{svg | draw(cv), cap}], mlTitle, ml:[[código, explicación]], out}`.
  Fórmulas largas en varias líneas con `AL(...)` (aligned) para que quepan a 390 px. Gráficas acumulativas en P1 con `pz(cv, {seg, asym,
  brk, loc, cross, zeta, ang, dist, s0, cl, region, scatter})`; respuestas con `tplot`. Diagramas SVG con clase `.psd` (no `.bd`, que es de v9).
- UI: puntos 1…N, Anterior/Siguiente fijos abajo (`.psctl`), deslizar, flechas del teclado, «Ver todos». Paso abierto en
  `localStorage['lgdr-pasos-pN']` (no se sincroniza). Botón «Copiar código del paso» y «Salida esperada en la Command Window».
- Plegable v15: en el bucle P1–P7 del script de plegables se envuelve `:scope>.card.pasos` como `pN:pasos` (número «R»,
  resumen = «Paso n de N · título»). PDF: `herramientas/pdf-practicas.js` pulsa «Ver todos», captura sus lienzos y oculta los
  controles (68 páginas con P1). CSS «resolución paso a paso» antes del `</style>` principal.
- P1 (16 pasos): planteamiento, polos/tipo, ec. característica, eje real, asíntotas, ruptura (σ = −2.845, K = 3.08), Routh
  (0 < K < 480, ±j6.633), ζ = 0.5912, ángulo (s0 = −2.0285 ± j2.7677), magnitud (K = 45.53), 2º orden, error (0.513),
  tercer polo (−7.943, 3.92σ), verificación, ajuste K = 49.38 y **Simulink** (bloques, parámetros y script `add_block`/`sim`).
- Probado a 390, 1280 y 1500 px, tema claro/oscuro, plegable cerrado→abierto (los lienzos se dibujan al abrir), consola sin errores.
- P2 (19 pasos, ejemplo 9.1 PI ideal): 1–12 sin compensar (planteamiento con Gc, polos/tipo, ec. característica, eje real,
  asíntotas σa = −4.333, ruptura σb = −1.4853 / Kb = 2.127, Routh 0 < K < 396 (±j5.657), recta ζ = 0.174 (79.98°, 57.4 %), ángulo
  s0 = −0.6936 ± j3.9255, magnitud K = 164.53, tercer polo −11.61 (16.7σ) + tiempos, error 0.1084) y 13–19 con PI (tipo 1, dipolo
  −1.42° / 0.9959, ec. de 4º orden, re‑búsqueda desde r = 1: −0.6778 ± j3.8359 / K = 158.10, polos −0.0902 y −11.55 con residuos,
  Routh 0 < K < 379.95 (±j5.547), verificación sin comp. vs PI, Kv = 0.7905, y Simulink con Gain → Gc [1 0.1]/[1 0] → G;
  alternativa bloque PID P = K, I = 0.1K).
- **Utilidades comunes para P3–P7** (antes de `PASOS.p2`): `pmul, pder, peval, cmul, cdiv, cev, angTo, distTo, resStep` (residuo al
  escalón), `locusN(num,den,Kmax,N)` (cualquier orden), `kcrit(num,den,lo,hi)` → {K, w}, `OO` (cero), `cpxT/cpxH`,
  `svgLoop(id,K,[{n,d,lab,w}])` (lazo con bloques en cascada), `svgSL(id,K,[...])` (Simulink con varios Transfer Fcn),
  `blkList(rows)` y `infoOut(tr,m)` (salida de `stepinfo`).
- P3 (20 pasos, ejercicio 9.1 atraso): 1–10 referencia (2º orden puro: σ = 3.5 fijo, eje real/asíntotas ±90°/ruptura −3.5,
  Routh estable ∀K, ζ = 0.5169, s0 = −3.5 ± j5.7959, K = 45.84, transitorio, Kv = 6.549 / e = 0.1527 con gráfica de e(t) a rampa),
  11 «¿basta subir K?» (K ×20 → 69.4 %), 12–17 atraso 0.2/0.01 (Kv ×zc/pc, dipolo −1.40°, ec. de 3er orden + Routh, re‑búsqueda
  −3.4019 ± j5.6335 / K = 44.64, e = 0.00784, mejora ×19.48, polo −0.2062 con residuo 0.0318), 18 verificación (18.3 %, Ts 2.145),
  19 ajuste 0.02/0.001 (K = 45.73, 15.33 %, ×19.95) y 20 Simulink (Step y luego Ramp: `delete_line/delete_block/add_block Ramp`).
  En `pz` de cada práctica las opciones son propias (copiar el de P2/P3 y adaptar). Error a rampa: `rampSim` dentro de `PASOS.p3`.
- P4 (21 pasos, ejemplo 9.3 PD ideal): 1–11 referencia (planteamiento con Gc = s + zc, polos/tipo, ec. característica, eje real
  [−4, 0] ∪ (−∞, −6], asíntotas −3.333 ±60°/180°, ruptura −1.5695 / Kb = 16.90, Routh 0 < K < 240 (±j4.899), ζ = 0.5039, s0 =
  −1.2044 ± j2.0648 por ángulo (fzero), K = 43.38, 3 polos (p3 = −7.591, 6.3σ, zona 5σ), transitorio 2º orden vs. simulación,
  Kv = 1.807 / e = 0.553) y 12–21 diseño (sd = −3.613 ± j6.194 con Ts/3, ángulo −275.61° → θz = 95.61°, cero zc = 3.0046 por
  geometría, K = 47.47, ec. + Routh estable ∀K y asíntotas −3.498 ±90°, polos y residuos (p3 = −2.773, |r| 0.101), verificación
  11.98 % / 1.152 s (×3.01), Kv = 5.94 / e = 0.168, forma KD = 47.47 / KP = 142.6 con gráfica |K·Gc(jω)| (ruido) y **Simulink** con
  bloque PID Controller en modo PD (`P = zc`, `D = 1`, `UseFilter = off`) tras el Gain; alternativas Derivative + Gain o Gc·G en un
  solo Transfer Fcn). `svgLoop`/`svgSL` aceptan bloques sin `d` (una sola línea, p. ej. «s + zc»).
- P5 (21 pasos, ejercicio 9.2 adelanto, cero en −10): 1–10 referencia (2º orden puro como P3: σ = 3.5, ruptura −3.5, Routh ∀K,
  ζ = 0.5169, s0 = −3.5 ± j5.7959, K = 45.84, a) Ts = 1.143 s, Kv = 6.549 / e = 0.1527), 11–17 diseño (sd = −10.5 ± j17.39, ángulo
  con el cero −130.86° → θp = 49.14°, pc = 25.54 por geometría, K = 476.2, ec. + Routh ∀K, p3 = −11.54 sin cancelar |r| 0.21,
  verificación 21.07 % → no cumple), 18 ajuste (función `dis(ζd)` con σ y cero fijos; tabla de pruebas, curva %OS–ζd y
  **bisección** → ζd = 0.6273, pc = 27.00, K = 364.1; ML con funciones anónimas + `fzero`, `getfield(stepinfo(...))`),
  19 re‑verificación (−10.5 ± j13.03, −13.0 |r| 0.477, 15.00 % / 0.362 s), 20 error a rampa (libro 0.0375, ajuste 0.0519) y
  21 Simulink con el ajuste (Transfer Fcn [1 10]/[1 27.00]) y `set_param` a los valores del libro (21 %).
  Para la bisección y la curva se usa un %OS rápido (pico de `simulate` con dt 0.002, 0.2 ms) en lugar de `TT.metrics` (14 ms):
  `PASOS.p5()` tarda ≈ 36 ms.
- P6 (24 pasos, ejemplo 9.5 PID = PD · PI): 1–11 referencia (G = (s+8)/[(s+3)(s+6)(s+10)], eje real [−6,−3] ∪ [−10,−8], asíntotas
  −5.5 ±90°, ruptura −4.6231 / Kb = 3.5585 (N·D′ − N′·D = 2σ³+43σ²+304σ+684), Routh ∀K, ζ = 0.4559, s0 = −5.4156 ± j10.57 con el ángulo
  del cero, K = 121.6, p3 = −8.169 junto al cero (|r| 0.021), Tp = 0.2972, Kp = 5.40 / e = 0.156), 12–16 PD (Tp ×2/3 → sd = −8.123 ± j15.86,
  ∠G(sd) = −198.34° → θ = 18.34°, zc = 55.96, K_PD = 5.326, verificación 21.74 % / 0.177 s / e 0.070), 17–21 PI (dipolo −1.45°, ec. de
  4º orden + Routh numérico y barrido ∀K, re‑búsqueda desde r = 2: −7.5127 ± j14.66 / K = 4.5915, K1 = 259.3, K2 = 128.5, K3 = 4.59 con
  gráfica |C(jω)| dB, 4 polos y residuos), 22 verificación (14.15 %, Tp 0.194, Ts 2.56), 23 error 0 (Kv = 5.71) y 24 **Simulink** con
  Gain → PID Controller (PD, P = zc, D = 1, sin filtro) → Transfer Fcn PI [1 0.5]/[1 0] → G; «otra forma» un solo PID P/I/D = K1/K2/K3.
  En `pz` de P6: opción `m:'U'|'PD'|'PID'` elige ceros/polos; el cero −55.96 fuera de la vista se anuncia con «← cero en …».
- P7 (20 pasos, ejercicio 9.3 adelanto‑atraso, cero de adelanto en −3): 1–7 referencia (2º orden puro: σ = 3.5, ζ = 0.4559,
  s0 = −3.5 ± j6.832, K = 58.93, a) Ts = 1.143 s, b) Kv = 8.418 / e = 0.1188), 8–12 diseño (sd = −7 ± j13.66 con Ts/2, ángulo con el cero
  −100.81° → θp = 79.19°, pad = 9.609, K_ad = 205.0, Kv_ad = 9.14, atraso ratio 9.21 → zatr = 0.0921 / patr = 0.01, dipolo −0.27°),
  13–16 (ec. de 4º orden + Routh numérico y barrido ∀K, re‑búsqueda desde r = 2: −6.966 ± j13.60 / K = 203.7, Kv = 83.65 / e = 0.01195,
  polos −2.593 (|r| 0.157, cancelación parcial con −3) y −0.093, verificación Ts = 0.6295 ✗), 17 ajuste con `dis(Ts)` (tabla de pruebas
  Ts_obj 0.571/0.54/0.51/0.48 con Ts simulado rápido `tsOf`) → pad = 12.29, zatr = 0.0827, K = 290.3, 18 re‑verificación (0.5688 s,
  9.05 %), 19 error ÷10 (rampa simulada 130 s) y 20 **Simulink** con Transfer Fcn adelanto y atraso separados, Step → Ramp.
  `pz` de P7: `m:'U'|'Z'|'L'|'F'` (sin compensar / sólo cero −3 / adelanto / final), `adj:1` usa el ajuste.
- Pruebas P6/P7: Playwright a 390 (claro/oscuro) y 1280 px, recorrido de todos los pasos sin desbordes, sin errores KaTeX ni de consola;
  `PASOS.p6()` ≈ 30 ms, `PASOS.p7()` ≈ 40 ms.
- PDF: 176 páginas con P1–P7 (~14 MB).
- Las 7 prácticas ya tienen su Resolución paso a paso. Si cambia algo en ellas, volver a generar `practicas.pdf`.
- **Corregido (v25): zoom en las gráficas de la Resolución paso a paso.** `axes()` les ponía la barra `.zbar`, pero
  `buildPasos` no asignaba `canvas.__redraw`, así que el slider/±/rueda cambiaban `__z` sin redibujar. Ahora `drawStep` pone
  `cv.__redraw` en cada lienzo; `plane()` devuelve `x0…y1` = bordes visibles (con zoom) y `tplot` extiende las líneas guía a la
  vista. Sin zoom el dibujo es idéntico píxel a píxel (no hace falta regenerar el PDF). Probado: 142 lienzos de P1–P7 a 390 y
  1280 px (slider, −, rueda y ⟲ vuelve a la imagen original), consola limpia.

## Hecho (v26): acomodo de las prácticas (pedido: gráficas que desperdician espacio, barra lateral, índice, plegables, Simulink)

- **Barra lateral plegable:** botón `#abSide` (primero de la barra, solo ≥ 1000 px) o tecla **B** → `html.sb-off`
  (`localStorage['lgdr-barra']='0'`, script temprano después del de v19). Oculta = `visibility:hidden` + `translate` (así v19 sigue
  midiendo el indicador); `--sbw:0` y contenido hasta 1480 px.
- **«En esta página» dentro de la barra lateral:** v19 ya no pone `sb-toc` (`mToc = matchMedia('not all')`). `.sb-sub` va después del
  enlace de la página actual: en prácticas, las etapas (número/letra + nombre corto) y, bajo la abierta, los pasos de la Resolución
  (bolitas `.sb-dot` que reflejan `.psnav`, + título del paso) o los `h4` de `.xstep` con resaltado del que se lee (scrollspy).
  En Resumen/Simulador/Preguntas, sus plegables. En modo angosto (`sb-rail`) no se ve.
- **Una etapa a la vez** en P1–P7 con `html.st-on` (≥ 1000 px; solo pantalla, no impresión): cada plegable de v15 (+ Simulink y
  Código MATLAB) es una etapa; las demás `display:none`; el encabezado de la abierta no la pliega. Abajo `.stnav` (etapa anterior /
  siguiente, sube al inicio); arriba `.stbar` (pestañas, sticky) solo si el índice no se ve (`sb-rail` o `sb-off`). Etapa guardada en
  `localStorage['lgdr-etapa-v1']={pN:clave}` (claves: plant, banco, pasos, x1–x4, simulink, code). `Element.prototype.scrollIntoView`
  envuelto otra vez: si el destino está en otra etapa, cambia primero (Reporte «En la página ›», «Ver este sistema en el Banco»).
  v15 `__lgdrFolds.open(k,on,opt)` ahora acepta `{anim:false}`. En celular nada cambia (siguen los plegables).
  Limitación: Ctrl+F solo encuentra texto de la etapa abierta en computadora.
- **Simulink como etapa propia** (`.fold.fold-sl`, letra S, antes de «Código MATLAB»): el `div.bd` de v9 se mueve fuera del
  `details.code`; se arma al abrir o en tiempo libre. Abierto en `localStorage['lgdr-sl-abierto']`. Responde a Desplegar/Plegar todo.
- **Resolución paso a paso:** `stepHTML(s,i,N,id)` arma `.psgrid` (`.psA` texto+fórmulas | `.psB` gráfica fija) cuando el contenedor
  `.psbody` mide ≥ 820 px (container query, solo pantalla); con diagramas SVG (paso 1 y Simulink) sigue a todo lo ancho. Como el plano
  usa escala 1:1, la columna angosta ya muestra solo la zona con información. Lienzo 280–420 px de alto ahí.
  Debajo de la gráfica, `.psget`: **«LGDR en MATLAB»** con `figure; rlocus(...)` (+ `sgrid(zeta, 0)` desde el paso de ζ; `pzmap` antes del
  primer rlocus) según la tabla `RL` por práctica (sistema de cada etapa: G, Gc*G, Gpd*G, Glead*Glag*G…), con Copiar; o **«Salida en
  Simulink»** (cadena Step/Ramp → Sum → Gain → compensador → G → Scope y botón al último paso). Clases `pg-lg`/`pg-sl` (ojo: `.lg` ya existía).
  «MATLAB · qué hace cada línea» empieza **cerrado**; si se abre, se recuerda (`localStorage['lgdr-psml']`).
- `.gfig` sola en su fila: máx. 760 px en ≥ 900 px (las figuras SVG de verificación tenían el texto gigante).
- PDF regenerado (177 págs.); `herramientas/pdf-practicas.js` arma el `.bd` si hace falta.
- Probado con Playwright: 1880/1440/1100 (barra angosta, oscuro)/390 px, barra oculta, cambio de etapa, Reporte, Banco desde Simulink,
  Resumen/Preguntas/Teoría, consola limpia.

## Hecho (v27–v28): enunciado del libro y diagrama de bloques en el Planteamiento de P1–P7

- En cada `.card.statement`, el párrafo que resumía lo que se pide se reemplazó por `figure.bkq[data-bkq=pN]`
  («Enunciado del libro», referencia Nise · ejercicio · página · título del ejemplo) con el «PROBLEMA:» completo y sus incisos
  (`ol.bkq-l`, a., b., c.…). Se conservan arriba las ecuaciones (`.mathd`) y a la derecha «Qué significa lo que se pide».
  Donde el libro dice «Dado el sistema de la figura», el contenido de la figura va entre corchetes (`.bkq-ed`).
  KaTeX ya renderizado (sin script). CSS «Enunciado del libro» antes del `</style>` principal.
- El Reporte (v22) copia ese recuadro al inicio del punto 2 («Enunciado del libro», antes de «Modelo»).
- **Texto (v28): cotejado palabra por palabra con las fotos del libro** (edición CECSA) que mandó el usuario: «Problema:» en los
  ejercicios y «*Problema*» (negrita cursiva, sin dos puntos) en los ejemplos; incisos «a)» con contador CSS (`ol.bkq-l li::before`).
  Se respetan las erratas/traducción del libro tal cual: P2 «Dado que el sistema…», P3 «función en transferencia», P4 «con una
  reducción de umbral en el tiempo de asentamiento» (el original dice «threefold»). P2 incluye todo el párrafo del Problema
  (hasta «…nuevo lugar geométrico de las raíces»). No se copiaron «Respuestas» ni «Solución».
- **Diagrama de bloques (v28)** dentro de cada `figure.bkq`, después del `blockquote`: `figure.bkq-fig` > `.bkq-sv` > `svg.bkq-svg`
  + `figcaption.bkq-fc`. Del libro: P2 figura 9.4 a) y b) (Ganancia K · Planta / Compensador K(s+0.1)/s · Planta), P4 figura 9.17,
  P6 figura 9.31, con su pie de figura literal. Ejercicios (P1, P3, P5, P7) no traen figura: diagrama con el mismo estilo, borde
  punteado (`.nb`) y etiqueta `.bkq-tag` «No viene del libro». Colores con `var(--ink)/--surface` (claro/oscuro/impresión); fórmulas
  con KaTeX_Main/KaTeX_Math. Ancho natural en `--bw`: escala hasta 1.15×, mínimo 0.7× (a 390 px solo P2 se desliza ~60 px).
  Se genera con **`node herramientas/enunciados-libro.js`** (reemplaza los 7 `figure.bkq`; textos en `DATA`). Sin `id` en el SVG
  (el Reporte copia el recuadro con `outerHTML`). Ojo: `figure.bkq>figcaption` (con `>`) para no afectar al pie del diagrama.
- PDF regenerado (179 págs.).

## Hecho (v29): versión en la barra superior

- `span.abver#abVer` justo después de `#abProg` (anillo de Teoría): `v1.día.mes.horaminuto` con la **hora del centro de México**
  (p. ej. `v1.3.11.1503` = 3 de noviembre, 15:03); `title` con la fecha completa. Mono 11 px (9.5 px en ≤ 430 px); oculto al imprimir.
- **Antes de cada commit que cambie `index.html`, correr `sh herramientas/version.sh`** (sella la hora actual) y luego hacer el commit.

## Corregido (v29): indicador azul de la barra lateral desfasado

- Al pasar a una práctica (o página) **de más abajo**, `.sb-ind` quedaba cubriendo los subtítulos de «En esta página»: el `place()` de
  v19 corre antes que `renderSub()` de v26, y en ese momento la lista `.sb-sub` seguía bajo la página anterior (la barra era más alta),
  así que medía un `offsetTop` de más. Ahora v19 expone `window.__lgdrSbPlace = place` y `renderSub()` lo vuelve a llamar después de
  mover la lista; además `.sb-sub` lleva `position:relative; z-index:1` para que, pase lo que pase, quede encima del indicador.
  Probado a 1440 y 1280 px: P1→P2→P5→Preguntas→P3→P1→Simulador→P7, el indicador coincide con el enlace actual (antes fallaba al bajar).

## Hecho (v30): botón «Guía del reporte»

- Junto a «Reporte» en el `.phead` de P1–P7: `<a class="btn repbtn guiabtn" href="Guia_practicas_compensadores_LGDR.pdf" target="_blank">`
  «Guía del reporte» (la guía de trabajo de 2 páginas que pasó el usuario; el PDF está en la raíz del repositorio). Reutiliza `.repbtn`
  (así `herramientas/pdf-practicas.js` también lo oculta del PDF de prácticas); el reporte solo escucha `[data-rep]`, sin conflicto.
  En ≤ 520 px `.phead .phr .src` ocupa su propia fila para que los dos botones queden juntos. `.repbtn{line-height:1.3}` iguala alturas.

## Hecho (v31): plantilla de reportes en Word (P1–P7)

- Pedido: un Word con la estructura de la guía (`Guia_practicas_compensadores_LGDR.pdf`: 10 puntos del reporte + los 5 pasos del
  análisis de referencia y los 6 de la verificación) para ir llenando cada práctica con resultados e imágenes de MATLAB, con el
  **formato de `Reporte_P2_Equipo_5`** (PDF de Google Docs que subió el usuario): carta, márgenes 2 cm, Times New Roman 12,
  logos TecNM Celaya (izq.) y «4.0 TecNM Celaya DSM» (der.) en el encabezado, título centrado 14 negritas (TecNM Celaya /
  Depto. Ing. Mecatrónica / Práctica N / Equipo 5), autores 12 negritas con correo, Resumen y Palabras Clave a una columna,
  cuerpo a dos columnas con encabezados «I.  Título», pies «Figura n:» negritas 10 pt, referencias en Calibri 11.
- Equipo 5: Hector Dario Campos Cofradia, Kevin Santiago Sánchez Rojas, Cristian Leonardo López Bernal (correos en el script).
- Archivos: `plantillas/Reportes_P1-P7_Equipo_5.docx` (todas, 63 págs.) y `plantillas/Reporte_PN_Equipo_5.docx` (una por práctica).
  Se descargan desde Pages: `https://amongoooo.github.io/Control/plantillas/<archivo>`.
- Generador: `node herramientas/plantilla-reportes.js` (docx-js; lee el código MATLAB de `index.html` `#pN-mat` y `puntoZeta.m`).
  Datos/guías por práctica en `herramientas/plantilla/datos.js` (marcado `_x`, `^x`, `**negritas**`; ecuaciones TeX mínimo:
  `\frac`, `\sqrt`, `\abs` → ecuaciones nativas de Word). Logos en `herramientas/plantilla/`.
- Mapa: III = análisis de referencia (pasos 1–5 + evidencia); VI = verificación pasos 1, 2, 3, 5 (+ advertencia); VII = pasos 4, 5
  (simulado), 6 + Simulink; IX incluye «Conclusiones individuales»; X (una columna) = código de la página + puntoZeta.m + cálculos.
  Indicaciones en azul con ✎ (con valores de la página como guía) y recuadros grises «[ Pega aquí la imagen ]» con el comando MATLAB.
  Primera página = instrucciones de uso (para borrar).
- II.1 Planteamiento trae el **enunciado textual del libro**: se lee `DATA` de `herramientas/enunciados-libro.js` (sin ejecutarlo).
  Si cambian esos textos o el código MATLAB de la página, volver a correr el generador.
- Detalles técnicos: docx-js escribe los bordes de párrafo en orden top/bottom/left/right (inválido); `pack()` los reordena y
  cambia los corchetes angulares de `\abs` por `|`. Valida con `validate.py` del skill docx. Para revisar en este contenedor hizo
  falta `apt-get install libreoffice-math` (sin él las ecuaciones salen en blanco al convertir a PDF).

## Hecho (v32): «PDF de reportes» en la ventana del Reporte

- El botón «Imprimir / PDF» de la barra del Reporte (v22) se cambió por `<a class="sy-b pri rp-prt" data-rp-pdf target="_blank">`
  «PDF de reportes»: abre **`reportes.pdf`** (raíz) en la página donde empieza la práctica (`#page=N`; `open(pid)` pone el `href`
  con el mapa `const REP_PDF={p1:…}; /*REP_PDF*/`). Ya no imprime desde el botón (Ctrl+P con la ventana abierta sigue usando `prep()`).
- **Cuando el usuario suba su PDF de reportes P1–P7:** `python3 -I herramientas/reportes-pdf.py <pdf-subido>` → lo copia a
  `reportes.pdf` y reescribe `REP_PDF` buscando la portada de cada práctica («Práctica N» como renglón + «Tecnológico»; si no la
  encuentra, esa práctica abre al inicio). Luego `sh herramientas/version.sh`, commit y push a `main`.
- Hasta v42, `reportes.pdf` era la plantilla de Word (v31) convertida a PDF; desde v43 es el Word resuelto del usuario (ver v43).

## Hecho (v34): Resolución paso a paso de P1 en el orden del reporte en Word + dónde va el código

- Pedido: que la solución de P1 incluya todos los pasos del Word (plantilla v31) para llenarlo y entender, y pasos que digan dónde
  pegar el código de MATLAB y en qué se diferencia de Simulink.
- `PASOS.p1` ahora tiene **29 pasos** (30 desde v38): los 16 de cálculo originales están en `const C=[…]` y se reacomodan en `steps` (con `tag()`) junto
  a pasos nuevos: 1 «Dónde va cada cosa» (Current Folder / Editor .m / Command Window / Figure / Simulink, SVG con las ventanas; su
  código va en la Command Window y no entra al script), 2 I Identificación, 4 II·4 Especificaciones, 5 III·1 K de referencia (no K = 1),
  19 V Controlador, 20 VI·1–2 (ecuación final, Routh con números, candidato vs. obtenido), 21 VI·3 modos y residuos (0.367 c/u y 0.134),
  22 VI·5 error + advertencia, 23 VII·4–5 tabla meta/obtenido/¿cumple?, 25 Simulink a mano (sin código, `sl:1`), 26 Simulink por código
  (opcional, en el Editor), 27 VIII, 28 IX y 29 X (script completo armado con el código de todos los pasos, con `%% Paso n · título`).
- Campos nuevos de cada paso (genéricos en el visor): `w` (etiqueta verde «Word · …»), `sec` (separadores Inicio, I…X en `.psnav`),
  `wd` (recuadro «Para el Word» con Tabla n / Figura n / Escribe / Pega, numeradas como en la plantilla), `mlWhere` (línea `.mlwhere`
  «dónde pegarlo»), `get` (comando propio en `.psget`), `noget`, `noScript`, `noHdr`, `mlOpen`. `{#clave}` en los textos = número del
  paso con esa clave. El práctica devuelve `script` (nombre del .m: activa el texto «Va en el Editor…» y el encabezado `%%` al copiar) y
  `rl` (reemplaza `RL.p1`). El botón «Ver el modelo · paso n» va al paso con `sl:1`. P2–P7 no cambian (no usan esos campos).
- Probado a 390 y 1280/1440 px: 29 pasos sin desbordes ni errores de KaTeX/consola; P2 intacta. PDF regenerado (193 págs.).
- **Cálculos en computadora (no a mano):** el usuario hará los cálculos escritos en el Word, no en foto. En los pasos de P1 donde
  decía «Figura 2: foto de tus cálculos» y «X · C: fotos → Figura 10» ahora dice copiar la «Sustitución» y el «Resultado» del paso
  (Insertar → Ecuación) y borrar esos recuadros. La plantilla de Word NO se cambió (el usuario pidió dejarla así). Lo de cómo
  escribir el código en MATLAB (paso 1, «Simulink por código») se deja como está.

- **P2–P7 (terminado; P2 → v35, P3 → v36, P4 → v39, P5 → v40, P6 → v41, P7 → v42):** mismo acomodo por puntos I–X del Word que P1, pero **sin lo de MATLAB** que se agregó en P1 (sin paso «Dónde va
  cada cosa», sin «Simulink por código», sin la línea «dónde pegar el código» ni el script completo del anexo). Lo de MATLAB que ya
  tenían los pasos se deja como está.

## Hecho (v35): Resolución paso a paso de P2 en el orden del reporte en Word

- Mismo acomodo que P1 (v34) **sin lo de MATLAB de P1**: sin `script` (así no sale la línea «Va en el Editor…» ni el encabezado `%%`
  al copiar), sin paso «Dónde va cada cosa», sin «Simulink por código» aparte y sin script completo en el anexo. Los pasos nuevos no
  traen `ml`; los de cálculo conservan su MATLAB de antes.
- Patrón (para P3–P7): los pasos originales pasan a `const C=[…]`; al final, pasos nuevos `S_id` (I), `S_sp` (II·4), `S_kr` (III·1),
  `S_ct` (V), `S_v12` (VI·1–2: ecuación final, todas las raíces, Routh con números, candidato vs. obtenido), `S_md` (VI·3: residuos y
  gráfica de modos), `S_v5` (VI·5 + advertencia), `S_45` (VII·4–6: tabla meta/obtenido/¿cumple?, error simulado, ajuste), `S_sl`
  (Simulink a mano, `sl:1`, reutiliza `blk/vis/ml` del paso de Simulink original), `S_cp` (VIII, tabla 13), `S_cn` (IX + Resumen) y
  `S_ax` (X: A código de la plantilla, B puntoZeta, C cálculos escritos; sin script). `tag(C[i],clave,sec,w,wd)` + `{#clave}` (también en
  `blk`); `calc(w,fig)` arma la línea «copia la Sustitución y el Resultado… borra el recuadro de la Figura n». Devuelve `rl` con `NUM`.
  `tb` (tabla HTML) y `e0` (error ≈ 0 → «0», evita `\times10` de `n()` en HTML) son locales.
- P2 = 30 pasos: I(1) · II(2–3) · III(4–15: K ref, polos, ec., eje, asíntotas, ruptura, Routh, ζ, ángulo, magnitud, tercer polo y tiempos,
  error) · IV(16–20: a–e) · V(21) · VI(22–24) · VII(25–27) · VIII(28) · IX(29) · X(30). Tablas 1–13 y Figuras 1–9 de
  `plantillas/Reporte_P2_Equipo_5.docx` (Fig. 2 y 9 = fotos de cálculos → se borran). `pz` de P2 ganó la opción `k1` (polos con K = 1).
- Probado con Playwright a 390 y 1280/1500 px, claro y oscuro: 30 pasos, grupos I…X, «Para el Word» en todos, sin errores de KaTeX ni de
  consola, sin `{#…}` sin resolver; P1 sin cambios. PDF regenerado (201 págs.).

## Hecho (v36): Resolución paso a paso de P3 en el orden del reporte en Word

- Mismo patrón que P2 (v35). P3 = 30 pasos: I(1) · II(2–3) · III(4–13: K ref, polos, ec., LGDR, Routh, ζ, punto, magnitud,
  transitorio, error a rampa) · IV(14–19: a = «¿basta subir K?» + atraso 20, b dipolo, c ecuación, d re‑búsqueda, e mejora) · V(20) ·
  VI(21 ecuación/Routh/candidato, 22 = paso original «Polos y residuos» como VI·3, 23 error) · VII(24 verificación, 25 tabla 12,
  26 ajuste 0.02/0.001 = VII·6, 27 Simulink a mano con Step → Ramp y variante) · VIII(28) · IX(29) · X(30). Tablas 1–13 y Figuras 1–12
  de `plantillas/Reporte_P3_Equipo_5.docx` (Fig. 2 y 12 = fotos de cálculos → se borran). `pz` de P3 ganó `k1`.
- Tabla 12 con el diseño 0.2/0.01 (18.31 % ✗, e 0.00784 «casi», ×19.48) y la variante en una fila aparte (15.33 %, ×19.95).
- El resolvedor de `{#clave}` ahora también resuelve las etiquetas `l` de las fórmulas (P1–P3).
- Probado igual que P2 (390/1280/1500, claro/oscuro, sin errores); PDF 208 págs.


## Hecho (v37): punto de ruptura explicado en P1

- Pregunta del usuario: ¿la guía o el problema piden el punto de ruptura? La guía (`Guia_practicas_compensadores_LGDR.pdf`) **no lo
  pide por nombre**: en el análisis de referencia pide polos, ceros, tipo y ecuación característica, y como evidencia el «LGDR inicial».
  El problema (Nise 8.6) pide «a) trazar el LGDR», y la ruptura es una de las reglas para trazarlo. Teoría **sí** lo trae: sección 12
  «Reglas para trazar el LGDR» (`#t5`: «Ruptura / llegada: dK/ds = 0, N·D′ − N′·D = 0»), la simulación «reglas» y la pregunta `q3-5`.
- Paso «Punto de ruptura» de P1 (`C[5]`, clave `rupt`, paso 10/29): filas nuevas «¿Qué son N y D?» (G = N/D, N = 1,
  D = (s+2)(s+4)(s+6)), «¿De dónde sale K(σ)?» (1 + K·N/D = 0 → K = −D/N con s = σ), «Condición» (N·D′ − N′·D = 0) y «Ganancia en la
  ruptura» en la forma |D(σb)/N(σb)| = |(−0.8453)(1.155)(3.155)/1| = 3.079 (números en vivo); `why` explica para qué sirve
  (trazar el LGDR; K > Kb → polos complejos y sobrepaso, la K de diseño debe ser mayor). MATLAB: `[num, den] = tfdata(G, 'v')` y
  `Kb = abs(polyval(den, sb(2)) / polyval(num, sb(2)))`. También una frase en «Forma del LGDR» de `#p1-ana` y en `R.p1.s3` del reporte.
  La plantilla de Word no se tocó. PDF regenerado.
- **Ojo al escribir TeX con Python en heredoc de bash:** `\\;` puede llegar como `\;` (se ve «;;»). Mejor escribir el JS en un archivo
  con la herramienta Write y reemplazarlo desde un script.

## Hecho (v38): Tabla 5 de P1 con su propio paso

- Pedido: «no viene solución para la tabla 5 en la P1» (plantilla: III · Paso 4, «Polos en lazo cerrado de referencia», columnas
  Polo | Valor | Observación). Antes sólo se mencionaba de pasada en el paso del tercer polo (IV · e) y sin «Observación».
- Paso nuevo `S_t5` (clave `clref`, sección III, «III · Paso 4 · Tabla 5», ahora paso 12/30, después de Routh): ecuación con
  K = 45.53, par dominante (= s0, paso {#ang}), tercer polo por suma de raíces (−12 − 2σ = −7.9429), comprobación con el producto
  de raíces, la **Tabla 5 llena** (p1, p2 dominantes con ζ y ωn; p3 a 3.92σ, no despreciable) y MATLAB `roots([1 12 44 48+45.53])`
  + `sum(p)` (sin usar la variable K, porque en el script completo K se calcula después). El paso del tercer polo ahora dice
  «Tabla 5: ya se llenó en el paso {#clref}». P1 = 30 pasos. Probado a 390 y 1280 px; PDF regenerado.
- **Mejora de los pasos al orden del Word:** hechas P1 (v34), P2 (v35), P3 (v36), P4 (v39), P5 (v40), P6 (v41) y P7 (v42): **terminada**.

## Hecho (v39): Resolución paso a paso de P4 en el orden del reporte en Word

- Mismo patrón que P2/P3 (v35/v36), sin lo de MATLAB de P1. Los 21 pasos originales pasan a `const C=[…]`. P4 = 30 pasos:
  I(1) · II(2 plant, 3 specs) · III(4 kref con K = 1 → −0.042/−3.878/−6.079, 5 polos, 6 ec., 7 LGDR, 8 Routh + fila «Con K = 43.38»
  (s¹ = 19.66), 9 ζ, 10 punto, 11 magnitud, 12 `clref` Tabla 5 con Observación, 13 transitorio, 14 error + Tabla 6 completa) ·
  IV(15 a pdis, 16 b angd, 17 c cero = Figura 5, 18 d kc, 19 e neweq + fila «Tercer polo» −2.773 = Figura 6, 20 f errc = paso
  original del error con PD) · V(21 `ctrl` = paso original «forma de ganancias» + Tabla 7) · VI(22 `ver12`: Tablas 8, 9 (Routh con
  K = 47.47: 1|71.47, 10|142.6, 57.21|0) y 10, 23 `modos` = paso original de residuos + Tabla 11 + gráfica «sin el modo p3», 24 `ver5`) ·
  VII(25 verif = Figuras 7 y 8, 26 `sim45` Tabla 12 + error simulado + «no hizo falta ajuste», 27 Simulink a mano = Figuras 1 y 9) ·
  VIII(28 Tabla 13) · IX(29) · X(30; Figuras 2 y 10 = fotos → se borran). `pz` de P4 ganó `k1`.
- Revisado contra `plantillas/Reporte_P4_Equipo_5.docx`: Tablas 1–13 y Figuras 1–10 tienen su paso con la solución.
- **PDF:** `herramientas/pdf-practicas.js` ahora pone `.psgrid/.psA/.psB/.psf` en `display:block` (la fragmentación de grid de Chromium
  encimaba el recuadro «Para el Word» con el «Resultado» en un salto de página; se recuperaron 7 recuadros en P1–P7). PDF: 218 págs.
- Probado a 390, 1280 y 1500 px (oscuro): 30 pasos, sin `{#…}`, sin errores de KaTeX ni de consola, sin desbordes.

## Hecho (v40): Resolución paso a paso de P5 en el orden del reporte en Word

- Mismo patrón que P2–P4 (v35/v36/v39), sin lo de MATLAB de P1. Los 21 pasos originales pasan a `const C=[…]`. P5 = 31 pasos:
  I(1) · II(2 plant = Figura 1, 3 specs = Tabla 2 con la fila «cero impuesto») · III(4 kref con K = 1 → −0.146/−6.854, 5 polos = Tabla 3,
  6 ec., 7 LGDR (Figura 2 → se borra), 8 Routh + fila «Con K = 45.84» = Tabla 4, 9 ζ = Figura 3, 10 punto, 11 magnitud, 12 `clref` **nuevo**
  (Tabla 5: sólo p1, p2; 2.º orden puro), 13 inciso a) = Figura 4, 14 error + Tabla 6 completa) · IV(15 a pdis, 16 b angd, 17 c `polo` =
  Figura 5, 18 d kc, 19 e neweq = Figura 6) · V(20 `ctrl` nuevo: Tabla 7 libro 25.54/476.2 y ajustado ζd 0.6273, 27.00, 364.1) ·
  VI(21 `ver12`: Tablas 8, 9 (Routh de los dos diseños) y 10 con libro y ajustado, 22 `modos` = Tabla 11 con los dos + gráfica «sin el modo
  p3», 23 `ver5` = paso original «Error a rampa» + advertencia) · VII(24 verif = Figuras 7 y 8, 25 `sim45` Tabla 12 (libro 21.07 % ✗,
  0.390 s casi; ajustado 15.00 %, 0.362 s ✓) + error simulado, 26 `ajuste` (VII·6), 27 `reverif` = Figura 9, 28 Simulink a mano = Figuras 1
  y 10) · VIII(29 Tabla 13) · IX(30) · X(31; Figura 11 = fotos → se borra). `pz` de P5 ganó `k1` (puntos naranjas: el tramo es verde).
- Revisado contra `plantillas/Reporte_P5_Equipo_5.docx`: Tablas 1–13 y Figuras 1–11 tienen su paso con la solución.
- Probado a 390 (claro/oscuro) y 1280 px: 31 pasos, sin `{#…}`, sin errores de KaTeX ni de consola; P4 y P6 sin cambios. PDF: 227 págs.

## Hecho (v41): Resolución paso a paso de P6 en el orden del reporte en Word

- Mismo patrón (v35–v40), sin lo de MATLAB de P1. Los 24 pasos originales pasan a `const C=[…]`. P6 = 32 pasos:
  I(1) · II(2 plant = Figura 1, 3 specs = Tabla 2) · III(4 kref con K = 1 → −9.929/−5.814/−3.256, 5 polos = Tabla 3, 6 ec., 7 LGDR
  (Figura 2 → se borra), 8 Routh + fila «Con K = 121.6» = Tabla 4, 9 ζ = Figura 3, 10 punto, 11 magnitud, 12 `clref` = Tabla 5 con
  Observación, 13 transitorio = Figura 4, 14 error + Tabla 6 completa) · IV(15 a pdis, 16–18 b angd/cero/kpd, 19 `verpd` = Figura 5,
  20 c pi, 21 d eqpid, 22 e rebus = Figura 6) · V(23 `ctrl` = paso original de K1, K2, K3 + Tabla 7) · VI(24 `ver12`: Tablas 8, 9 (Routh
  de 4.º orden completo con K = 4.592) y 10 (candidato PD 7.52 % y re‑búsqueda), 25 `modos` = Tabla 11 + gráfica «sólo el par dominante»,
  26 `ver5` = paso original del error + advertencia) · VII(27 verif = Figuras 7 y 8, 28 `sim45` Tabla 12 + error simulado + «no hizo falta
  ajuste» con escalón de 12 s, 29 Simulink a mano = Figuras 1 y 9, con un solo PID Controller K1/K2/K3 como pide el Word) · VIII(30 Tabla 13
  con T_p/T_s analíticos del par re‑buscado) · IX(31) · X(32; Figura 10 = fotos → se borra). `pz` de P6 ganó `k1`.
- Revisado contra `plantillas/Reporte_P6_Equipo_5.docx`: Tablas 1–13 y Figuras 1–10 tienen su paso con la solución.
- Probado a 390 y 1280 px (claro/oscuro): 32 pasos, sin `{#…}`, sin errores de KaTeX ni de consola; P5 y P7 sin cambios. PDF: 235 págs.

## Hecho (v42): Resolución paso a paso de P7 en el orden del reporte en Word

- Mismo patrón (v35–v41), sin lo de MATLAB de P1. Los 20 pasos originales pasan a `const C=[…]` (Simulink = `C[19]`). P7 = 30 pasos:
  I(1) · II(2 plant = Figura 1, 3 specs = Tabla 2) · III(4 kref con K = 1 → −6.854/−0.146, 5 polos = Tabla 3 + ecuación + reglas (Figura 2 →
  se borra), 6 Routh + fila «Con K = 58.93» = Tabla 4, 7 ζ = Figura 3, 8 punto = K de referencia, 9 `clref` nuevo = Tabla 5, 10 inciso a) =
  Figura 4, 11 inciso b) = Figura 5 + Tabla 6 completa con K<sub>v</sub>) · IV(12 a pdis, 13–14 b angd/polo, 15 b y c `kad`, 16 d atraso, 17 e `eqf` =
  Figura 6, 18 e rebus) · V(19 `ctrl` = Tabla 7) · VI(20 `ver12`: Tablas 8, 9 (Routh de 4.º orden de los dos diseños y rango de K con K libre) y
  10, 21 `modos` = Tabla 11 + gráfica «sólo el par dominante», 22 `ver5` = paso original «Error a rampa» + advertencia) · VII(23 verif =
  Figuras 7 y 9, 24 `sim45` = Figura 8 + Tabla 12 + error simulado, 25 ajuste, 26 reverif = Figura 10, 27 Simulink a mano = Figuras 1 y 11) ·
  VIII(28 Tabla 13) · IX(29) · X(30; Figura 12 = fotos → se borra). `pz` de P7 ganó `k1`.
- **T<sub>s</sub> del libro unificado:** `TT.metrics` daba 0.6295 s y la tabla de pruebas 0.627 s (el valor del Word). Ahora `mB.ts` y `mA.ts` salen de
  `tsOf` (banda de 2 % con paso de 1 ms): 0.627 y 0.569 en toda la Resolución. Con la suma exacta de modos da 0.6263 y 0.5683, así que MATLAB
  puede mostrar eso (diferencia en el 3.er decimal).
- Revisado contra `plantillas/Reporte_P7_Equipo_5.docx`: Tablas 1–13 y Figuras 1–12 tienen su paso con la solución.
- Probado a 390 (claro/oscuro) y 1280 px: 30 pasos, sin `{#…}`, sin errores de KaTeX ni de consola; P5 y P6 sin cambios. PDF: 245 págs.

## Hecho (v43): «PDF de reportes» = Word resuelto del usuario

- El usuario subió `Reporte_P1-P7_resuelto.docx` (su Word con P1–P7 resueltas, 948 ecuaciones) y pidió ponerlo como PDF en el
  apartado «PDF de reportes» (botón `[data-rp-pdf]` de la ventana del Reporte, v32). `reportes.pdf` = ese Word en PDF (123 págs.);
  `REP_PDF={p1:2,p2:17,p3:34,p4:51,p5:69,p6:86,p7:105}`. El .docx no se subió al repositorio (solo el PDF).
- **Conversión:** LibreOffice (`soffice --headless --convert-to pdf`) necesita `apt-get install libreoffice-math` (antes `apt-get
  update`), si no, las ecuaciones salen en blanco. Además su importador OMML pone «¿» con: `#`, corchetes sueltos `(−∞, −6]`, la palabra
  `sim` (palabra clave de StarMath), un `=`/`+`/`<` sin término a la izquierda y celdas vacías de matrices (`<m:e/>`, arreglos de Routh).
  `python3 -I herramientas/docx-ecuaciones.py entrada.docx salida.docx` arregla una **copia** (corridas → texto normal `m:nor`, cada
  corchete en su propia corrida, celdas vacías con un espacio); luego convertir `salida.docx` y correr
  `python3 -I herramientas/reportes-pdf.py salida.pdf`. Comprobar con `pdftotext rep.pdf - | grep "¿" | grep -v "?"` (debe salir vacío).
- La P7 en el orden del Word ya estaba hecha (v42); se volvió a revisar contra `plantillas/Reporte_P7_Equipo_5.docx`: Tablas 1–13 y
  Figuras 1–12 con su paso, 30 pasos, sin `{#…}` ni errores de consola. `practicas.pdf` ya estaba regenerado con v42.

## Hecho (v44): visor de PDF dentro de la página + `reportes.pdf` con el Word más reciente

- El usuario pidió poder abrir el PDF **dentro de la página** (como la ventana del Reporte). `dialog#pdfDlg.sync.rpd.pvd` (CSS «visor
  de PDF» antes del `</style>` principal; `<script>` propio al final del `<body>`) con **PDF.js 4.10.38 legacy** incluido en
  `lib/pdfjs/` (`pdf.min.mjs`, `pdf.worker.min.mjs`, LICENSE Apache-2.0; se carga con `import()` sólo al abrir; el contenedor no llega
  a cdnjs, por eso va en el repo). Cualquier enlace con `data-pdfv="archivo.pdf"` abre el visor (+ `data-title`, `data-sub`,
  `data-dl`, `data-dest` = destino con nombre, `data-rp=pN` = página de `REP_PDF`, o `#page=N` en el `href`). Páginas perezosas
  (IntersectionObserver con raíz = diálogo; se liberan al alejarse), zoom 50–300 %, «n / N», índice con los marcadores del PDF,
  vínculos internos activos (`getAnnotations` → `a.pv-lnk` en %), descargar. Ctrl/⌘‑clic abre el PDF normal. Depuración:
  `window.__lgdrPdf.open(url,título,sub,dest,dl,página)`.
- Botón «PDF de reportes» de la ventana del Reporte (`[data-rp-pdf]`) ahora abre el visor encima del Reporte, en la página de la
  práctica (`window.__lgdrRepPdf = REP_PDF`, puesto en la misma línea de `/*REP_PDF*/`). Pestaña PDF: tarjeta «Reportes en Word
  (P1–P7)» con Ver aquí / otra pestaña / Descargar y P1…P7; `practicas.pdf` y su lista también abren en el visor.
- `reportes.pdf` = `Reporte_P1-P7_P1_v4.docx` del usuario (09:05, 5/11): **P1 ya es individual** (Jorge Bocanegra González,
  23030312); P2–P7 siguen con los datos del Equipo 5 hasta que el usuario las llene. Conversión: copia con los arreglos de ecuaciones
  (los de esta sesión, equivalentes a `herramientas/docx-ecuaciones.py`) + imágenes reducidas a 1600 px (16 MB → 0.85 MB de imágenes),
  LibreOffice con `libreoffice-math`, y `python3 -I herramientas/reportes-pdf.py salida.pdf` → 133 págs., 2.9 MB,
  `REP_PDF={p1:2,p2:27,p3:44,p4:61,p5:79,p6:96,p7:115}`.
- El usuario llena su Word con este formato (P1 terminada): fórmulas en Cambria Math 10.5 pt, «Resultado:» con variable en cada
  paso, vínculos «→ cálculos» / «↑ volver al reporte» (marcadores `P1_c_*` / `P1_r_*`), anexo de cálculos en el mismo orden con la
  sustitución de cada término, ejemplos de redacción en gris, pasos de la verificación numerados seguido (VI 1–4, VII 5–7).

## Hecho (v45): Práctica 2 del Word llenada con el formato de la P1

- El usuario subió `Reporte_P1-P7_P1_v4.docx` (P1 terminada) y pidió llenar la P2 igual: portada individual (Bocanegra González
  Jorge, 23030312@itcelaya.edu.mx), fórmulas OMML en Cambria Math 10.5 pt (runs con `sz=21`, letras en cursiva y números/operadores
  `m:sty p`), «Resultado:» en cada paso, «→ cálculos» / «↑ volver al reporte» (marcadores `P2_r_*` / `P2_c_*`: III1–III5, IVa–IVe,
  VI1–VI4, VII5–VII7), VI pasos 1–4 y VII pasos 5–7, anexo «C. Cálculos» (una columna, recuadros punteados) en el mismo orden, sin
  etiquetas Sustitución/Resultado, redacción de ejemplo en gris (7F7F7F) y 7 recuadros grises «[ Pega aquí la imagen ]» con código
  MATLAB completo (sin `sgrid(z,0)`: `rlocus` + `grid on` + recta de ζ con `plot`; Simulink armado con `add_block`/`add_line`).
- Generador (fuera del repo, en el scratchpad de la sesión): `omml.py` (mini‑lenguaje → OMML: `\f{}{}`, `\r{}`, `\t{}`, `\d{}`,
  `\a{}`, `\b{}`, `\lim{}` (+ fracción → `m:func`, si no LibreOffice mete la fracción dentro del lim), `\m{}` Routh, `_`/`^`),
  `num2.py` (números con numpy/scipy) y `p2.py` (contenido); `assemble.py` reemplaza los elementos de la P2 del `document.xml`
  conservando sus 3 `sectPr` (encabezados) y copia las Referencias de la P1. Validado con el XSD del skill docx.
- Números P2: K_ref = 164.53 (s0 = −0.6936 ± j3.9255), K_b = 2.127 (σb = −1.4853), 0 < K < 396 (±j5.657), p3 = −11.613,
  Kp = 8.227, e = 0.1084; dipolo −1.42° / 0.9959; con PI K = 158.10 (s0 = −0.6778 ± j3.8359), p3 = −11.554, p4 = −0.0902,
  Routh 0 < K < 379.95 (±j5.547), residuos r1 = −0.3987 ± j0.2264, r3 = −0.1028, r4 = −0.0997; sim. sin comp. pico 1.3735,
  tp 0.888, Ts 5.14, %OS 54.05; con PI pico 1.3961, tp 0.909, Ts 17.82 (= ln(|r4|/0.02)/|p4|), %OS 39.61. No hace falta ajuste
  (Δpico 1.6 %, ΔTp 2.4 %, Dif 2.3 %). Mover el cero: zc = 0.01 → Ts ≈ 188 s (mismo residuo); zc = 0.5 → Ts 5.9 s pero K = 131.3.
- `reportes.pdf` = ese Word (P1 + P2 llenas) en PDF: 144 págs., `REP_PDF={p1:2,p2:27,p3:55,p4:72,p5:90,p6:107,p7:126}`.
  Conversión: `docx-ecuaciones.py` → imágenes a 1600 px → LibreOffice (con `libreoffice-math`) → `reportes-pdf.py`.
  Evitar `Re`/`Im` dentro de ecuaciones (LibreOffice los cambia por ℜ/ℑ) y escribir los términos con signo explícito (`+-` sale ±).
- (Hasta v48 el Word estaba sin cifrar en `reportes/`; desde v49 sólo va cifrado, ver v49.)

## Hecho (v46): zoom en el visor de PDF

- `dialog#pdfDlg` (v44): **Ctrl/⌘ + rueda** (incluye el pellizco del touchpad, que llega como Ctrl + rueda) y **pellizco con dos dedos**
  en táctil. El punto bajo el cursor / entre los dedos se queda fijo (`anchorAt` = página + fracción; `zoomTo` cambia `zoom`, `sizeAll()` y
  corrige `scrollTop` del diálogo y `scrollLeft` de `.pv-body`). Durante el gesto sólo se estiran los lienzos; 220 ms después se redibujan
  nítidos (`gen++`, `observe()`). Rango 50–400 % (`ZMIN/ZMAX`, también para los botones − / +). `.pv-body{touch-action:pan-x pan-y}` y
  `gesturestart/gesturechange` cancelados (Safari) para que el navegador no amplíe toda la página.

## Hecho (v47): Práctica 3 del Word llenada con el formato de la P1/P2

- Entrada: `reportes/Reporte_P1-P7_P1-P2.docx` (subido por el usuario). Salida: `reportes/Reporte_P1-P7_P1-P3.docx` (P1–P3 llenas) y
  `reportes/Practica3_Bocanegra.pdf` (sólo la P3, 27 págs.). `reportes.pdf` = ese Word en PDF: 152 págs.,
  `REP_PDF={p1:2,p2:27,p3:55,p4:82,p5:99,p6:116,p7:134}`.
- **Generador guardado en el repo** (`herramientas/word/`, Python + lxml + numpy; no hay scipy ni python-control en el contenedor):
  `omml.py` (mini‑lenguaje → OMML Cambria Math 10.5 pt: `\f{}{}`, `\r{}`, `\d{}` |x|, `\p{}`, `\b{}` [ ], `\lim{}{}` (func+limLow),
  `\m{a&b\\c&d}` Routh, `\t{texto}` recto, `_`/`^`; letras en cursiva, lo demás `m:sty p`; el `%` va en su propia corrida),
  `build.py` (párrafos con el XML exacto de la P2: portada, títulos, `h2link` con «→ cálculos», recuadro gris `figbox` con código,
  tablas, «Resultado:», advertencia, anexo `calc_box` con «↑ volver al reporte»; texto con `$math$`, `**negritas**`, `~{sub}`, `^^{sup}`),
  `num3.py` (números de P3 con residuos exactos: polos, `stepinfo` con c(∞) = 1, error a rampa), `p3.py` (reporte), `p3calc.py` (anexo C)
  y `assemble.py` (reemplaza la P3 del `document.xml` conservando sus 3 `sectPr`; copia «C. Cálculos» y Referencias de la P2; bookmarks
  `P3_r_*`/`P3_c_*` con ids arriba del máximo). Uso: desempacar el .docx, `python3 assemble.py in/word/document.xml out/word/document.xml`
  (desde `herramientas/word/`), `zip -qXrD`, validar con `validate.py` del skill docx. **Para P4–P7:** copiar `num3.py/p3.py/p3calc.py`,
  cambiar el contenido y en `assemble.py` el título buscado («Práctica N:») y el prefijo de los bookmarks (`P3_` en `build.py`).
- PDF: `herramientas/docx-ecuaciones.py` → imágenes > 1600 px reducidas → `soffice` (con `libreoffice-math`) → `reportes-pdf.py`.
  En LibreOffice el texto `\t{}` dentro de ecuaciones sale en cursiva (en Word sale recto); para frases largas usar párrafo con `$…$`.
- Números P3: ζ = 0.5169 (θ = 58.87°, tan θ = 1.6560), s₀ = −3.5 ± j5.7959, K_ref = 45.84, K = 1 → −0.146/−6.854, K_b = 12.25,
  estable ∀K; T_s 1.143 (sim 1.161), T_p 0.542, T_r 0.247; K_v 6.549, e = 0.1527. Atraso 0.2/0.01: dipolo −1.40° / 0.9858, ensayos
  σ 3.2…3.5 → s₀ = −3.4019 ± j5.6335, K = 44.64, p₃ = −0.2062, r₃ = 0.0318, r₁ = −0.5159 ± j0.3109, K_v = 127.55, e = 0.00784,
  mejora ×19.48 (libro ×19.58), Routh b₁ = 43.44, sim 18.31 % / t_p 0.557 / T_s 2.144, cola e(t) ≈ 0.00784 + 0.1541e^(−0.2062t).
  Ajuste 0.02/0.001 (adoptado): s₀ = −3.4905 ± j5.7801, K = 45.73, p₃ = −0.02006, r₃ = 0.00293, 15.33 % / 0.858 s,
  e = 0.00765 (×19.95), cola τ = 50 s (≈ 377 s hasta 1 %). Figuras 1–10 con código MATLAB completo (sin `sgrid`), Tablas 1–13.

## Hecho (v48): botón «Descargar Word»

- `a[data-word]` con `href="reportes/Reporte_P1-P7_P1-P3.docx"` y `download="Reporte_P1-P7_Bocanegra.docx"` en dos lugares: pestaña PDF
  (tarjeta «Reportes en Word», «Descargar Word (.docx)»; el de PDF ahora dice «Descargar PDF») y barra de la ventana del Reporte
  (`.sy-b.rp-prt`, ícono + «Word», sólo ícono en ≤ 420 px), antes de «PDF de reportes».
- Desde v49 los botones piden PIN (ver v49).

## Hecho (v49): «Descargar Word» con PIN

- El usuario pidió contraseña para descargar el Word. **El PIN NO se escribe en el repositorio** (ni aquí, ni en la página, ni en
  commits): si hace falta, pedírselo al usuario.
- El Word va **cifrado**: `reportes/Reporte_P1-P7.docx.enc` (AES-256-GCM, clave PBKDF2-SHA256 del PIN con 600 000 iteraciones; formato
  `LGDR1` + iteraciones + sal + iv + cifrado). Se borraron del árbol `reportes/Reporte_P1-P7_P1-P2.docx` y `..._P1-P3.docx` (siguen en el
  historial de git; el usuario decide si se reescribe). `reportes.pdf` y `reportes/Practica3_Bocanegra.pdf` siguen públicos.
- Página: `a[data-word="reportes/Reporte_P1-P7.docx.enc"][data-dl="Reporte_P1-P7_Bocanegra.docx"]` (pestaña PDF y barra del Reporte) →
  `dialog#pinDlg` (`input#pinIn` password/numérico, «PIN incorrecto.» si falla) → `fetch` + WebCrypto → descarga con `Blob`.
  CSS «v49» antes del visor de PDF; `<script>` al final del `<body>`. Necesita https (Pages) o localhost.
- Herramienta: `herramientas/word/cifrar-docx.py cifrar|descifrar entrada salida` (PIN por `LGDR_PIN` o pregunta).
  **Para llenar otra práctica:** pedir el PIN, `descifrar` el `.enc` a un archivo del scratchpad, generar, y volver a `cifrar` sobre
  `reportes/Reporte_P1-P7.docx.enc` (no subir el .docx sin cifrar).

## Hecho (v50): Word y PDF de reportes con los 9 pasos del trazo del LGDR (P1)

- El usuario subió su Word más reciente (`Reporte_P1-P7_Bocanegra_1.docx`: P1–P3 individuales, P4–P7 aún del Equipo 5). En la P1, sección III
  (después del Paso 5, antes de «Evidencia de la etapa»), va «Trazo del LGDR (inciso a): 9 pasos» de Nise 8.5–8.6 (ramas, simetría, eje real,
  inicio/término, asíntotas, ruptura, cruce jω, ángulos de salida, graficación y calibración), títulos `Ttulo3` con «→ cálculos»
  (marcadores `P1_r_TL1…9` / `P1_c_TL1…9`) y sus recuadros en el anexo C; del Paso 2 se movieron eje real, asíntotas y ruptura a esos pasos.
- `reportes/Reporte_P1-P7.docx.enc` = ese Word cifrado (mismo PIN; se comprobó descifrando). `reportes.pdf` = 153 págs.,
  `REP_PDF={p1:2,p2:29,p3:57,p4:84,p5:101,p6:118,p7:136}`. `reportes/Practica3_Bocanegra.pdf` no se cambió (no está enlazado).
- Conversión: además de `docx-ecuaciones.py`, un `*` solo dentro de una ecuación (p. ej. el conjugado `s^*`) sale «¿» en LibreOffice:
  en la copia para el PDF se cambia por `∗` (U+2217). `libreoffice-math` hay que instalarlo en cada contenedor nuevo.

## Hecho (v51): vínculos de los incisos del problema a sus respuestas (Word y PDF de reportes)

- En «1. Planteamiento» de P1 y P3 (la P2 no tiene incisos), cada inciso termina con «→ respuesta: … · valor» (estilo `Hipervnculo` 9 pt,
  marcadores `P1_q_a…d` / `P3_q_a…d`), y el título de la respuesta lleva «↑ inciso x)» de regreso.
  P1: a) → «Trazo del LGDR (inciso a): 9 pasos» (marcador nuevo `P1_r_TL0`), b) → IV a) (K = 45.53), c) → IV d), d) → IV e).
  P3: a) → III · Paso 5 (e = 0.1527), b) → IV a) (Gc, K = 44.64), c) y d) → IV e) (e = 0.00784, ×19.48).
- Los vínculos funcionan en el PDF (LibreOffice los convierte en saltos internos). `reportes.pdf` sigue con 153 págs. y el mismo `REP_PDF`;
  `reportes/Reporte_P1-P7.docx.enc` actualizado (mismo PIN).

## Hecho (v52): P1 de la página en el orden del Word del usuario, con simulaciones en cada figura

- Pedido: «que la P1 quede en el mismo orden que mi Word, organizada por secciones y pasos, y en cada paso con imágenes una
  simulación del caso de la tarea que cambie al mover las variables». Solo P1 por ahora (P2–P7 sin cambios).
- **Generador:** `python3 -I herramientas/word/pagina-word.py 1 <Word descifrado>` (antes `p1-pagina.py`; desde v53 sirve para cualquier práctica; P3 → v54) (PIN: pedírselo al usuario; descifrar con
  `cifrar-docx.py descifrar` a un archivo del scratchpad). pandoc → HTML con TeX → secciones I–IX (`div.card.xsec.wsec#p1w-I…IX`,
  `data-fk=w1…w9`, `data-short`), pasos `.xstep.wstep` (ids `p1w-<clave del anexo>` p. ej. `p1w-III3`, `p1w-TL6`, `p1w-IVb`, o `p1w-sN`),
  «Trazo del LGDR» = `.wgrp` con `.wsub` («Trazo · Paso n»), «Resultado:» → `.wres`, anexo «C. Cálculos» dentro de cada paso
  (`details.wcalc`), «✎ En MATLAB» → `.wml` (+ Copiar), vínculos del Word → `button.wgo[data-wgo]` (la página usa el #hash).
  KaTeX se dibuja al generar con `herramientas/word/katex-batch.js` (el KaTeX de index.html, salida `html`). Palabras dentro de
  fórmulas → `\text{}`. Reemplaza lo que hay entre `<!--p1w-->` y `<!--/p1w-->`. ~1 MB de HTML (se comprime bien en Pages).
  **No se copian** (el Word va con PIN): portada (nombre, correo), Resumen, «Conclusión individual», Referencias, capturas.
  Si el usuario cambia su Word: volver a correr el generador (y `practicas.pdf`).
- Orden de `#p1`: secciones I–IX, Banco (B), `div.p1old[hidden]` (Planteamiento y tarjetas 1–4 viejas: el Reporte v22 todavía
  copia de ahí sus figuras y tablas), Simulink (S), Código MATLAB (M). Se quitó la «Resolución paso a paso» de P1 (`PASOS.p1` sigue
  en el código, sin tarjeta). v15: `wrap(x, x.dataset.fk || 'x'+num)`; v26: `short` desde `data-short`; `.sb-st` con columna de 26 px.
- **Simulaciones** (script «v52 · P1 en el orden del Word» al final del `<body>`, CSS «v52» antes del `</style>` principal):
  `div.wsim[data-wsim=fN]` dentro de `figure.wfig` (pie = el de la figura del Word); se arman al verse (IntersectionObserver),
  botón «↺ Caso de la tarea», deslizadores `.kctl.wctl` con casilla. Planta K/[(s+2)(s+4)(s+a)], caso a = 6, K = 45.53 / 49.38.
  f1 diagrama de bloques + T(s) + escalón (K, a) · f2 LGDR + recta de ζ + polos con K, ruptura, cruce jω, «Poner K sobre la recta»
  (K, %OS, a) · f3 escalón 3.er vs 2.º orden + Tabla 6 en vivo (K, a) · f4 condición de ángulo: punto de prueba sobre la recta con
  ángulos y ∑∠, «Buscar s₀» (%OS, σ) · f5 validez: |p₃|/σ y residuos, «K del 10 % con este polo» (K, a) · f6 Command Window con
  `stepinfo`/`pole` (K, a) · f7 ajuste: K del LGDR vs K, meta de %OS, «Buscar K» por bisección (K, %OS) · f8 Simulink + Scope
  (K, Step, Stop time). Depuración: `window.__lgdrP1W`. Caso de la tarea: 8.8254 % (el Word redondea 8.82), Ts 1.865, Tp 1.293,
  Tr 0.5916; con 49.38 → 10.00 %.
- `herramientas/pdf-practicas.js` arma las `.wsim` y las captura como imagen. PDF: 233 págs.
- Probado con Playwright a 390 (claro/oscuro), 1280 y 1440 px: plegables, etapas y barra lateral (pasos con scrollspy), vínculos
  inciso ↔ respuesta, botones de búsqueda, Reporte de P1, P2/Resumen/Teoría sin errores de consola.

## Hecho (v53): P2 de la página en el orden del Word, con simulaciones en cada figura

- Mismo pedido que v52 para la P2. El usuario dio el PIN en el chat (no se escribe aquí). El Word **no se modificó** (el usuario le
  pondrá las imágenes de MATLAB). P3–P7 siguen como estaban.
- **Generador común:** `python3 -I herramientas/word/pagina-word.py <N> <Word descifrado>` (reemplaza `p1-pagina.py`; con N = 1 da la P1
  idéntica byte por byte). Busca «Práctica N: » hasta «Práctica N+1: », prefijos `PN_c_/PN_q_` del Word e ids `pNw-…`, marcadores
  `<!--pNw-->` … `<!--/pNw-->`. Nuevo: si la figura del Word todavía es el recuadro «[ Pega aquí la imagen ]», su descripción y su
  código MATLAB quedan debajo de la simulación en `details.wfcode` (con Copiar, `[data-copy]`); cuando el usuario pegue las imágenes,
  la figura sale igual (ruta de `img`). «✎ Residuos en MATLAB: …» → `.wml` con etiqueta «MATLAB · Residuos».
- `#p2`: secciones I–IX (`p2w-I…IX`, pasos `p2w-III1…`, `p2w-IVa…e`, `p2w-VI1…4`, `p2w-VII5…7`, `p2w-s10` = Evidencia, `p2w-s23` =
  Modelo en Simulink), Banco, `div.p2old[hidden]` (Planteamiento y tarjetas 1–4 viejas para el Reporte), Simulink y Código MATLAB. Se
  quitó la tarjeta «Resolución paso a paso» de P2 (`PASOS.p2` sigue en el código).
- **Simulaciones** (script «v53 · P2 en el orden del Word» al final del `<body>`; usa `window.__lgdrW`, piezas que ahora exporta el script
  de v52; los vínculos `.wgo` y el Copiar de `.wml` de v52 ahora valen para cualquier `.wsec`). Planta 1/[(s+1)(s+2)(s+10)], PI (s+zc)/s,
  caso K = 164.5 / 158.1, zc = 0.1, ζ = 0.174. f1 diagrama tipo Simulink + T(s) + polos + escalón (Con PI / Sin compensar, K, zc) ·
  f2 LGDR sin compensar + recta de ζ, s₀, ruptura y cruce jω (K, ζ) · f3 escalón 3.er vs 2.º orden + Tabla 6 en vivo (K, t final) ·
  f4 LGDR sin compensar vs con PI, dipolo ∠Gc/|Gc|, s₀ con PI, vista «Cerca del origen» (K, zc, ζ) · f5 escalón sin comp. vs PI + Tabla 12
  en vivo y modo lento con residuo (K sin, K PI, zc, t final; «K sobre ζ = 0.174 para este cero») · f6 Command Window `pole(Tc)`,
  `stepinfo(Tu/Tc)`, `e_u/e_c` · f7 Simulink + Scope (K, zc, Step, Stop time). Pico afinado con parábola (`sinfo`): 1.3734 en 0.888 s y
  1.3961 en 0.909 s, como con la suma exacta de modos. Depuración: `window.__lgdrP2W`. `herramientas/pdf-practicas.js` arma las de
  cualquier `window.__lgdrPNW`. En celular el diagrama de Simulink (`.wsl2`, mín. 500 px) se desliza de lado.
- PDF: 229 págs. Probado a 390 (claro/oscuro) y 1440 px (oscuro, barra lateral y etapas), Reporte de P2, P1 y otras páginas sin errores.

## Hecho (v54): P3 de la página en el orden del Word, con simulaciones en cada figura

- Mismo pedido que v52/v53 para la P3. El usuario dio el PIN en el chat (no se escribe aquí). El Word **no se modificó**. P4–P7 siguen
  como estaban.
- `python3 -I herramientas/word/pagina-word.py 3 <Word descifrado>`: `#p3` = secciones I–IX (`p3w-I…IX`; pasos `p3w-s1…s4` del
  Planteamiento, `p3w-III1…5`, `p3w-s10` = Evidencia, `p3w-IVa…e`, `p3w-VI1…4`, `p3w-VII5…7`, `p3w-s23` = Modelo en Simulink), Banco,
  `div.p3old[hidden]` (Planteamiento y tarjetas 1–4 viejas para el Reporte), Simulink y Código MATLAB. Se quitó la tarjeta «Resolución
  paso a paso» de P3 (`PASOS.p3` sigue en el código).
- Generador: `sKG`, `sK`, `Ks`, `Kz` dentro de fórmulas quedan en cursiva (variables) y `sen`/`jsen` como función (`\operatorname{sen}`);
  por eso P1 y P2 también se regeneraron (sólo cambió eso; el texto quedó igual).
- **Simulaciones** (script «v54 · P3 en el orden del Word» al final del `<body>`, usa `window.__lgdrW`; depuración `window.__lgdrP3W`).
  Planta 1/[s(s+7)], atraso (s+zc)/(s+pc), %OS = 15. Caso: K = 45.84 sin compensar, 44.64 con 0.2/0.01, 45.73 con la variante 0.02/0.001.
  `design()` toma el **último** cruce de la condición de ángulo sobre la recta de ζ (salta el círculo del dipolo, como `rmin` en MATLAB).
  Error a rampa = escalón de (s+7)(s+pc)/D_T(s). f1 Simulink (Con atraso/Sin compensar, Step/Ramp) + T(s) + K_v · f2 LGDR sin compensar
  + recta de ζ (K, %OS) · f3 escalón + Tabla 6 en vivo (K, t final) · f4 error a rampa sin compensar con 1/K_v · f5 LGDR sin comp. vs con
  atraso, ∠/|Gc| del dipolo, vista «Cerca del origen» (K, zc, pc, %OS) · f6 escalón sin comp. vs atraso + Tabla 12 en vivo + residuo del
  modo lento · f7 error a rampa de los dos (t final hasta 400 s; e a 20 s, asentamiento) · f8 Command Window (`pole(Tc)`, `stepinfo`,
  `Kv_c`, `e_u`, `e_c`, `mejora`) · f9 variante vs libro: escalón y error a rampa + tabla (p₃, r₃, %OS, Ts, e, mejora, τ) · f10 Simulink +
  Scope de la variante (K, zc, pc, Step, Stop time = 6). Comprobado: 18.31 % / t_p 0.557 / T_s 2.144; variante 15.33 % / 0.858 s;
  r₃ 0.0318 / 0.00293; e(20 s) = 0.0103, e(60 s) = 0.00784; ±1 % de la cola de la variante ≈ 377 s; mejora ×19.4764.
- PDF: 231 págs. Probado a 390 (claro/oscuro) y 1440 px (oscuro, barra lateral, vínculo inciso → respuesta), Reporte de P3, P1/P2/P4 y
  otras páginas sin errores de consola.

## Hecho (v55): P1–P3 con Resolución paso a paso, Planteamiento y Banco arriba de la sección I

- Pedido: volver a poner el desarrollo paso a paso al inicio (arriba de «Identificación») y el Planteamiento y el Banco «de antes»,
  sin mover nada de lo que viene del Word. Orden de `#p1`, `#p2`, `#p3`: `div.card.pasos[data-pasos=pN]` (R) → `div.card.statement`
  (P, sacado de `div.pNold`) → `div.card.bench` (B) → `<!--pNw-->` secciones I–IX `<!--/pNw-->` → `div.pNold[hidden]` (tarjetas 1–4
  viejas para el Reporte) → Simulink → Código MATLAB. Todo fuera de los marcadores, así `pagina-word.py` no lo borra al regenerar.
  Solo se movió HTML (el JS ya manejaba las claves `pasos`/`plant`/`banco`). El Reporte encuentra el enunciado con
  `#pN .statement figure.bkq` en cualquier lugar. PDF de prácticas: 314 págs.

## Hecho (v56): Práctica 4 del Word llenada con el formato de la P1–P3

- Mismo formato que la P3 (v47): portada individual, Resumen, I–IX, «Conclusión individual», anexo «C. Cálculos» y Referencias;
  fórmulas OMML Cambria Math 10.5 pt, «Resultado:» en cada paso, «→ cálculos» / «↑ volver al reporte» (marcadores `P4_r_*` / `P4_c_*`:
  III1–III5, IVa–IVf, VI1–VI4, VII5–VII7) y 8 recuadros «[ Pega aquí la imagen ]» con código MATLAB completo (Fig. 1 y 8: Simulink con
  `PID Controller` en modo PD, `P = zc`, `D = 1`, `UseFilter = off`; Fig. 6: `pole`/`zero`/`stepinfo`/`residue`; Fig. 7: error a rampa).
  P1–P3 y P5–P7 del Word no cambiaron (se comparó elemento por elemento). La P4 no trae incisos, así que no lleva «→ respuesta».
- Generador: `herramientas/word/num4.py` (números), `p4.py` (reporte) y `p4calc.py` (anexo). `assemble.py` ahora recibe la práctica:
  `python3 assemble.py in/word/document.xml out/word/document.xml 4` (el prefijo de marcadores va en `build.PRE`). Para P5–P7: copiar
  `num4/p4/p4calc` y cambiar el contenido. `build.table`: tablas de ≤ 4 filas sin encabezado repetido y con «conservar con el siguiente»
  (LibreOffice perdía la fila de datos de la Tabla 3 al pasar de columna); «Resultado:» se queda con su ecuación.
- Números P4: ζ = 0.5039 (θ = 59.74°), s₀ = −1.2044 ± j2.0648, K_ref = 43.38, K = 1 → −0.042/−3.878/−6.079, σ_b = −1.5695 / K_b = 16.90,
  0 < K < 240 (±j4.899), p₃ = −7.591 (6.30σ, residuo −0.127); 2.º orden 16 %, T_s 3.321, T_p 1.522, T_r 0.688; sim. 15.08 %, 3.471, 1.673,
  0.733; K_v 1.807, e = 0.5533. PD: T_s,d = 1.107, s_d = −3.6133 ± j6.1943, ∠G(s_d) = −275.61° → θ_z = 95.61°, z_c = 3.0046, K = 47.47,
  s³ + 10s² + 71.47s + 142.62, Routh b₁ = 57.21 (estable ∀K), p₃ = −2.7734 (r₃ = −0.1013, 19 % del dominante r₁ = −0.4494 ± j0.2848),
  sim. 11.98 % / t_p 0.522 / T_s 1.152 (×3.01), K_v 5.943, e = 0.1683 (×3.29). Sin ajuste; comprobación: K = 57.11 daría 16.00 % y T_s 1.083
  pero ζ = 0.460.
- `reportes/Reporte_P1-P7.docx.enc` actualizado (mismo PIN; se comprobó descifrando). `reportes.pdf` = 164 págs.,
  `REP_PDF={p1:2,p2:29,p3:57,p4:84,p5:111,p6:128,p7:146}`.

## Otros artefactos del usuario (galería de claude.ai)

- Sensor Hall en el eje de un go-kart — https://claude.ai/artifact/W9LNnTHcewwiSPFtzXuj5z
- Datos del Proyecto — https://claude.ai/artifact/GPSBNtYhwKfaETNpjxnUd2
- Taller de Electrónica: Ohm, diodos y transistores — https://claude.ai/artifact/9TBwLS6CNCjF3Cn4ZYkW9R
