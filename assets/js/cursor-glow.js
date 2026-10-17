/* ==========================================================================
   Cursor-following background: a faint dot grid that lights up and parts
   around the pointer, under a soft blue glow that trails the cursor.
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

  var SPACING = 28;     // grid pitch in CSS px
  var RADIUS = 200;     // reach of the cursor's influence
  var PUSH = 12;        // how far dots part around the cursor
  var GLOW = 420;       // radius of the trailing glow

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var dpr = 1, w = 0, h = 0;
  var mouse = { x: -9999, y: -9999, active: false };
  var glow = { x: -9999, y: -9999, a: 0 };
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
    colors.glowAlpha = dark ? 0.26 : 0.2;
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

  function draw() {
    ctx.clearRect(0, 0, w, h);

    if (glow.a > 0.001) {
      var g = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, GLOW);
      g.addColorStop(0, rgba(colors.accent, colors.glowAlpha * glow.a));
      g.addColorStop(0.45, rgba(colors.accent, colors.glowAlpha * 0.35 * glow.a));
      g.addColorStop(1, rgba(colors.accent, 0));
      ctx.fillStyle = g;
      ctx.fillRect(glow.x - GLOW, glow.y - GLOW, GLOW * 2, GLOW * 2);
    }

    var mx = glow.x, my = glow.y, r2 = RADIUS * RADIUS;
    var base = rgba(colors.dot, colors.dotAlpha);
    ctx.fillStyle = base;
    ctx.beginPath();
    var lit = [];
    for (var y = SPACING / 2; y < h; y += SPACING) {
      for (var x = SPACING / 2; x < w; x += SPACING) {
        var dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
        if (glow.a > 0.001 && d2 < r2) {
          lit.push(x, y, dx, dy, Math.sqrt(d2));
          continue;
        }
        ctx.moveTo(x + 1, y);
        ctx.arc(x, y, 1, 0, 6.2832);
      }
    }
    ctx.fill();

    // Dots near the cursor: pushed outward, larger and tinted with the accent
    for (var i = 0; i < lit.length; i += 5) {
      var d = lit[i + 4], t = 1 - d / RADIUS, k = t * t * glow.a;
      var off = d > 0 ? (PUSH * k) / d : 0;
      var px = lit[i] + lit[i + 2] * off, py = lit[i + 1] + lit[i + 3] * off;
      ctx.fillStyle = rgba(colors.accent, colors.dotAlpha + 0.7 * k);
      ctx.beginPath();
      ctx.arc(px, py, 1 + 1.8 * k, 0, 6.2832);
      ctx.fill();
    }
  }

  function tick() {
    var target = mouse.active ? 1 : 0;
    if (glow.x < -9000) { glow.x = mouse.x; glow.y = mouse.y; }
    glow.x += (mouse.x - glow.x) * 0.12;
    glow.y += (mouse.y - glow.y) * 0.12;
    glow.a += (target - glow.a) * 0.08;
    draw();

    var settled = Math.abs(mouse.x - glow.x) < 0.3 && Math.abs(mouse.y - glow.y) < 0.3 &&
      Math.abs(target - glow.a) < 0.002;
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
