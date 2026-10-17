/* ==========================================================================
   Cursor-following background: a faint dot grid whose points near the
   pointer turn into small monospace glyphs (· : + * ✻) in the accent colour.
   Static grid on touch devices and when reduced motion is requested.
   ========================================================================== */

(function () {
  "use strict";

  var canvas = document.createElement("canvas");
  canvas.className = "bg-fx";
  canvas.setAttribute("aria-hidden", "true");
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var SPACING = 24;     // grid pitch in CSS px
  var RADIUS = 150;     // reach of the cursor's influence
  var GLYPHS = ["\u00b7", ":", "+", "*", "\u273b"];  // faint to strong
  var MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var dpr = 1, w = 0, h = 0;
  var mouse = { x: -9999, y: -9999, active: false };
  var trail = { x: -9999, y: -9999, a: 0 };
  var colors = {};
  var running = false;

  function hexToRgb(hex) {
    hex = hex.trim().replace("#", "");
    if (hex.length === 3) hex = hex.replace(/./g, "$&$&");
    var n = parseInt(hex, 16);
    return isNaN(n) ? [47, 109, 181] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function readColors() {
    var css = getComputedStyle(document.documentElement);
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    colors.accent = hexToRgb(css.getPropertyValue("--global-base-color") || "#2f6db5");
    colors.dot = dark ? [255, 255, 255] : [61, 57, 41];
    colors.dotAlpha = dark ? 0.09 : 0.11;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rgba(c, a) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

  // Per-cell hash so each grid point keeps its own glyph as the cursor passes
  function hash(x, y) {
    var n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    var mx = trail.x, my = trail.y, r2 = RADIUS * RADIUS;
    ctx.fillStyle = rgba(colors.dot, colors.dotAlpha);
    ctx.beginPath();
    var lit = [];
    for (var y = SPACING / 2; y < h; y += SPACING) {
      for (var x = SPACING / 2; x < w; x += SPACING) {
        var dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
        if (trail.a > 0.001 && d2 < r2) {
          lit.push(x, y, Math.sqrt(d2));
          continue;
        }
        ctx.rect(x - 0.6, y - 0.6, 1.2, 1.2);
      }
    }
    ctx.fill();

    // Near the cursor, grid points turn into monospace glyphs in the accent colour
    ctx.font = "500 11px " + MONO;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (var i = 0; i < lit.length; i += 3) {
      var t = 1 - lit[i + 2] / RADIUS, k = t * trail.a;
      var level = Math.min(GLYPHS.length - 1, Math.floor((k + 0.25 * hash(lit[i], lit[i + 1])) * GLYPHS.length));
      ctx.fillStyle = rgba(colors.accent, colors.dotAlpha + 0.55 * k);
      ctx.fillText(GLYPHS[level], lit[i], lit[i + 1]);
    }
  }

  function tick() {
    var target = mouse.active ? 1 : 0;
    if (trail.x < -9000) { trail.x = mouse.x; trail.y = mouse.y; }
    trail.x += (mouse.x - trail.x) * 0.2;
    trail.y += (mouse.y - trail.y) * 0.2;
    trail.a += (target - trail.a) * 0.08;
    draw();

    var settled = Math.abs(mouse.x - trail.x) < 0.3 && Math.abs(mouse.y - trail.y) < 0.3 &&
      Math.abs(target - trail.a) < 0.002;
    if (settled) { running = false; return; }
    requestAnimationFrame(tick);
  }

  function kick() {
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function interactive() {
    return fine.matches && !still.matches;
  }

  window.addEventListener("pointermove", function (e) {
    if (!interactive() || e.pointerType !== "mouse") return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    kick();
  }, { passive: true });

  document.addEventListener("pointerleave", function () {
    mouse.active = false;
    kick();
  });
  document.documentElement.addEventListener("mouseleave", function () {
    mouse.active = false;
    kick();
  });

  window.addEventListener("resize", function () { resize(); draw(); });

  new MutationObserver(function () { readColors(); draw(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  readColors();
  resize();
  draw();
})();
