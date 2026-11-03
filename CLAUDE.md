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
  Los candados por sección dentro de cada parte siguen igual.
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
  **Libro:** el usuario pasó fotos de Nise, *Sistemas de control para ingeniería* (pp. 457, 501–505, 510–531, 540–543; edición
  sin confirmar, falta la portada). Columna «Libro» en la tabla de evidencia y en el paso 4 de la verificación con sus valores
  (P4 tabla 9.3 con simulación 14.8 %/3.6 s y 11.8 %/1.2 s; P6 tabla 9.5, predicción PID Tp = 0.214 s; P7 K = 205.4; P5 25.52 / 476.3).
  Lectura de modos por residuo: casi cancelado si |residuo| < 12 % del dominante; si no, «cancelación parcial» (como el libro en P4).
- **Ventana del reporte (pendiente de contenido):** botón `.repbtn[data-rep=pN]` en `.phead` (dentro de `.phr`) → `dialog#repDlg`
  (clase `sync`) con «En preparación» y los 10 puntos de la guía; cada uno hace `scrollIntoView` a su parte (abre el plegable).
  **Siguiente tarea:** llenar esa ventana con una simulación del reporte de cada práctica.

## Otros artefactos del usuario (galería de claude.ai)

- Sensor Hall en el eje de un go-kart — https://claude.ai/artifact/W9LNnTHcewwiSPFtzXuj5z
- Datos del Proyecto — https://claude.ai/artifact/GPSBNtYhwKfaETNpjxnUd2
- Taller de Electrónica: Ohm, diodos y transistores — https://claude.ai/artifact/9TBwLS6CNCjF3Cn4ZYkW9R
