/* ==========================================================================
   Particle background: small accent-coloured particles drift slowly and link
   up with thin lines when close. Particles near the pointer link to it and
   are gently drawn towards it.
   A single still frame on reduced motion; fewer particles on small screens.
   ========================================================================== */

(function () {
  "use strict";

  var canvas = document.createElement("canvas");
  canvas.className = "bg-fx";
  canvas.setAttribute("aria-hidden", "true");
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var DENSITY = 1 / 14000;  // particles per square CSS px
  var MAX = 110;            // upper bound on particle count
  var LINK = 120;           // particles closer than this get a line
  var REACH = 170;          // pointer influence radius
  var SPEED = 0.25;         // drift speed, px per frame

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var dpr = 1, w = 0, h = 0;
  var pointer = { x: 0, y: 0, active: false };
  var particles = [];
  var colors = {};
  var frame = 0;

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
    colors.dot = dark ? 0.55 : 0.4;
    colors.line = dark ? 0.22 : 0.16;
  }

  function rgba(c, a) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

  function spawn() {
    var angle = Math.random() * Math.PI * 2;
    var speed = SPEED * (0.4 + Math.random() * 0.6);
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 0.8 + Math.random() * 1.4
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var target = Math.min(MAX, Math.round(w * h * DENSITY));
    while (particles.length < target) particles.push(spawn());
    particles.length = target;
  }

  function step() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      if (pointer.active) {
        var dx = pointer.x - p.x, dy = pointer.y - p.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < REACH && d > 1) {
          var pull = (1 - d / REACH) * 0.02;
          p.vx += (dx / d) * pull;
          p.vy += (dy / d) * pull;
        }
      }

      // Ease back towards cruising speed after being pulled
      var v = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (v > SPEED) { p.vx *= 0.97; p.vy *= 0.97; }

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;

    for (var i = 0; i < particles.length; i++) {
      var a = particles[i];
      for (var j = i + 1; j < particles.length; j++) {
        var b = particles[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        if (dx > LINK || dx < -LINK || dy > LINK || dy < -LINK) continue;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.strokeStyle = rgba(colors.accent, colors.line * (1 - d / LINK));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      if (pointer.active) {
        var px = a.x - pointer.x, py = a.y - pointer.y, pd = Math.sqrt(px * px + py * py);
        if (pd < REACH) {
          ctx.strokeStyle = rgba(colors.accent, colors.line * 2 * (1 - pd / REACH));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = rgba(colors.accent, colors.dot);
    ctx.beginPath();
    for (var k = 0; k < particles.length; k++) {
      var p = particles[k];
      ctx.moveTo(p.x + p.r, p.y);
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
    }
    ctx.fill();
  }

  function loop() {
    step();
    draw();
    frame = requestAnimationFrame(loop);
  }

  function start() {
    cancelAnimationFrame(frame);
    if (still.matches || document.hidden) { draw(); return; }
    frame = requestAnimationFrame(loop);
  }

  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", function () {
    pointer.active = false;
  });

  window.addEventListener("resize", function () { resize(); draw(); });
  document.addEventListener("visibilitychange", start);
  if (still.addEventListener) still.addEventListener("change", start);

  new MutationObserver(function () { readColors(); draw(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  readColors();
  resize();
  start();
})();
