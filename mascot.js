/* น้องติ๊ก ตัวละครประจำแอป (วาดด้วย canvas เหมือนในแอป Android) */
(function () {
  "use strict";
  var PI = Math.PI, sin = Math.sin, cos = Math.cos;
  var INK = "#1B1840", DARK = "#3F2BB0", ARM = "#6A50E8", ORANGE = "#FFB547", CHEEK = "rgba(255,143,177,.55)";
  var EYE = INK; // สีเส้นตา (ชุดผีใช้สีขาวเพราะอยู่ในรูตาสีเข้ม)

  function ease(x) { var v = Math.max(0, Math.min(1, x)); return v * v * (3 - 2 * v); }
  function spoonK(t) {
    var v = (t % 1.8) / 1.8;
    if (v < 0.12) return 0;
    if (v < 0.42) return ease((v - 0.12) / 0.3);
    if (v < 0.6) return 1;
    if (v < 0.85) return 1 - ease((v - 0.6) / 0.25);
    return 0;
  }

  function Mascot() {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "mascot";
    this.ctx = this.canvas.getContext("2d");
    this.mood = "study";
    this.moodStart = performance.now();
    this.jumpAt = -1e9;
    this.last = 0;
    var self = this;
    function loop(ts) {
      requestAnimationFrame(loop);
      if (!self.canvas.isConnected || document.hidden) return;
      if (ts - self.last < 33) return; // ~30 เฟรม/วินาที
      self.last = ts;
      self.draw(ts);
    }
    requestAnimationFrame(loop);
  }

  Mascot.prototype.setMood = function (m) {
    if (m !== this.mood) { this.mood = m; this.moodStart = performance.now(); }
  };
  Mascot.prototype.jump = function () { this.jumpAt = performance.now(); };

  Mascot.prototype.draw = function (ts) {
    var cv = this.canvas, c = this.ctx;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    }
    var s = Math.min(w, h) / 100 * dpr;
    var tt = ts / 1000, t = (ts - this.moodStart) / 1000, mood = this.mood;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, cv.width, cv.height);
    c.setTransform(s, 0, 0, s, (cv.width - 100 * s) / 2, (cv.height - 100 * s) / 2);
    c.lineCap = "round"; c.lineJoin = "round";

    var jp = (ts - this.jumpAt) / 450;
    var jump = jp >= 0 && jp <= 1 ? sin(PI * jp) : 0;
    var bob = mood === "sleep" ? sin(tt * 1.6) * 1.2 : (mood === "sport" || mood === "party") ? -Math.abs(sin(tt * 4)) * 4 : sin(tt * 2.6) * 1.3;

    // เงา
    c.fillStyle = "rgba(0,0,0,.18)";
    oval(c, 50, 93, 20 * (1 - jump * 0.35), 3);

    c.save();
    c.translate(0, bob - jump * 10);
    var costume = document.documentElement.getAttribute("data-skin") === "halloween";
    EYE = costume ? "#fff" : INK;
    if (costume) { ghost(c, mood, tt, t); c.restore(); return; }
    if (mood === "morning") sun(c, tt);
    if (mood === "party") confetti(c, tt, true);
    c.fillStyle = DARK; oval(c, 39.5, 86, 6.5, 4); oval(c, 60.5, 86, 6.5, 4);
    if (mood === "sleep") { arm(c, 27, 62, 23, 72); arm(c, 73, 62, 77, 72); }
    else if (mood === "morning" || mood === "bye") arm(c, 27, 62, 22, 73);
    else if (mood === "sport" || mood === "party") { var sh = sin(tt * 9) * 3; arm(c, 27, 58, 15 + sh, 40); arm(c, 73, 58, 85 - sh, 40); }
    if (mood !== "party") antenna(c, tt);
    body(c);
    if (mood === "sport") headband(c, tt);
    face(c, mood, tt, t);
    if (mood === "study") book(c, t);
    else if (mood === "eat") eating(c, t);
    else if (mood === "morning" || mood === "bye") wave(c, tt, mood);
    else if (mood === "sleep") zzz(c, tt);
    else if (mood === "exam") exam(c, tt);
    else if (mood === "sport") { pompom(c, 15 + sin(tt * 9) * 3, 38, tt); pompom(c, 85 - sin(tt * 9) * 3, 38, tt + 1); }
    else if (mood === "party") { hat(c, tt); confetti(c, tt, false); }
    c.restore();
  };

  function oval(c, x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, Math.max(rx, 0.01), Math.max(ry, 0.01), 0, 0, PI * 2); c.fill(); }
  function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); }
  function arm(c, x1, y1, x2, y2) {
    c.strokeStyle = ARM; c.lineWidth = 6.5;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    c.fillStyle = ARM; circle(c, x2, y2, 4);
  }
  function antenna(c, tt) {
    var a = sin(tt * 3) * 0.18;
    var bx = 50 + sin(a + 0.35) * 15, by = 33 - cos(a + 0.35) * 15;
    c.strokeStyle = DARK; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(50, 33); c.lineTo(bx, by); c.stroke();
    c.fillStyle = ORANGE; circle(c, bx, by, 4.6);
    c.fillStyle = "rgba(255,255,255,.6)"; circle(c, bx - 1.4, by - 1.4, 1.3);
  }
  function body(c) {
    var g = c.createLinearGradient(50, 28, 50, 88);
    g.addColorStop(0, "#9D90FF"); g.addColorStop(1, "#5B3FE0");
    c.fillStyle = g; circle(c, 50, 58, 28);
    c.fillStyle = "rgba(255,255,255,.18)"; oval(c, 41.5, 43.5, 8.5, 6.5);
  }
  function happyEye(c, x) {
    c.strokeStyle = EYE; c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(x - 5, 56); c.quadraticCurveTo(x, 49, x + 5, 56); c.stroke();
  }
  function sleepEye(c, x) {
    c.strokeStyle = EYE; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(x - 5, 53); c.quadraticCurveTo(x, 58, x + 5, 53); c.stroke();
  }
  function openEye(c, x, open, lx, ly) {
    c.fillStyle = "#fff"; oval(c, x, 54, 6.3, 7 * open);
    if (open > 0.3) {
      c.fillStyle = INK; circle(c, x + lx, 54.5 + ly, 3.5 * Math.min(1, open + 0.2));
      c.fillStyle = "#fff"; circle(c, x + lx + 1.2, 53 + ly, 1.1);
    }
  }
  function face(c, mood, tt, t) {
    var blink = (tt % 3.4) < 0.14 ? 0.12 : 1;
    if (mood === "sleep") { sleepEye(c, 41); sleepEye(c, 59); }
    else if (mood === "morning" || mood === "bye") {
      if ((tt % 5) < 2.5) { happyEye(c, 41); happyEye(c, 59); }
      else { openEye(c, 41, blink, 0.6, 0); openEye(c, 59, blink, 0.6, 0); }
    } else if (mood === "sport" || mood === "party") { happyEye(c, 41); happyEye(c, 59); }
    else if (mood === "exam") {
      var ex = sin(tt * 2.2) * 1.6;
      openEye(c, 41, blink, ex, 2); openEye(c, 59, blink, ex, 2);
      c.strokeStyle = EYE === INK ? INK : "#6B5A99"; c.lineWidth = 1.8;
      c.beginPath(); c.moveTo(35, 45.5); c.lineTo(45, 43); c.stroke();
      c.beginPath(); c.moveTo(55, 43); c.lineTo(65, 45.5); c.stroke();
    } else if (mood === "eat") {
      if (spoonK(t) < 0.15) { happyEye(c, 41); happyEye(c, 59); }
      else { openEye(c, 41, blink, 0.8, 0.8); openEye(c, 59, blink, 0.8, 0.8); }
    } else {
      var lx = sin(tt * 0.9) * 1.3;
      openEye(c, 41, blink, lx, 1.8); openEye(c, 59, blink, lx, 1.8);
    }
    var puff = mood === "eat" && spoonK(t) < 0.15 ? 1.25 : 1;
    c.fillStyle = CHEEK; oval(c, 34.25, 63.75 + puff / 2, 4.25 + puff, 2.25 + puff / 2); oval(c, 65.75, 63.75 + puff / 2, 4.25 + puff, 2.25 + puff / 2);
    if (mood === "sleep") { c.fillStyle = INK; circle(c, 50, 66, 1.7 + sin(tt * 1.6) * 0.4); }
    else if (mood === "eat") {
      var k = spoonK(t);
      var chew = k < 0.15 ? Math.abs(sin(t * 14)) * 1.6 : 0;
      var op = k > 0.55 ? (k - 0.55) / 0.45 * 4 : chew;
      c.fillStyle = INK; oval(c, 50, 65.75 + op * 0.3, 3.5, 0.75 + op * 0.7);
    } else if (mood === "exam") {
      c.strokeStyle = INK; c.lineWidth = 1.8;
      c.beginPath(); c.moveTo(45, 66); c.quadraticCurveTo(47.5, 64, 50, 66); c.quadraticCurveTo(52.5, 68, 55, 66); c.stroke();
    } else if (mood === "morning" || mood === "bye" || mood === "sport" || mood === "party") {
      c.fillStyle = INK; c.beginPath(); c.moveTo(44, 63); c.quadraticCurveTo(50, 72, 56, 63); c.closePath(); c.fill();
      c.fillStyle = "#FF7A9A"; oval(c, 50, 68, 2.5, 1.5);
    } else {
      c.strokeStyle = INK; c.lineWidth = 2;
      c.beginPath(); c.moveTo(46.5, 64.5); c.quadraticCurveTo(50, 67.5, 53.5, 64.5); c.stroke();
    }
  }
  function roundRect(c, x1, y1, x2, y2, r) {
    c.beginPath();
    c.moveTo(x1 + r, y1); c.lineTo(x2 - r, y1); c.quadraticCurveTo(x2, y1, x2, y1 + r);
    c.lineTo(x2, y2 - r); c.quadraticCurveTo(x2, y2, x2 - r, y2); c.lineTo(x1 + r, y2);
    c.quadraticCurveTo(x1, y2, x1, y2 - r); c.lineTo(x1, y1 + r); c.quadraticCurveTo(x1, y1, x1 + r, y1);
    c.fill();
  }
  function book(c, t) {
    var u = t % 5;
    var a = u < 0.8 ? ease(u / 0.8) : u < 4.2 ? 1 : 1 - ease((u - 4.2) / 0.8);
    var w = 28 + 16 * a, top = 69, bot = 85;
    arm(c, 28, 63, 50 - w / 2 + 1, 78);
    arm(c, 72, 63, 50 + w / 2 - 1, 78);
    c.fillStyle = "#14B8A6"; roundRect(c, 50 - w / 2, top + 1, 50 + w / 2, bot + 1.5, 2.5);
    if (a < 0.08) {
      c.fillStyle = "#0F8F82"; c.fillRect(47, top + 1, 6, bot - top + 0.5);
      c.fillStyle = "rgba(255,255,255,.8)"; roundRect(c, 43, 75, 57, 78, 1);
      return;
    }
    var pw = (w / 2 - 2) * a;
    [-1, 1].forEach(function (side) {
      c.fillStyle = side < 0 ? "#FFFFFF" : "#F3F4F8";
      c.beginPath(); c.moveTo(50, top + 2);
      c.quadraticCurveTo(50 + side * pw * 0.5, top - 1.5 * a, 50 + side * pw, top + 0.5);
      c.lineTo(50 + side * pw, bot);
      c.quadraticCurveTo(50 + side * pw * 0.5, bot - 1.5 * a, 50, bot);
      c.closePath(); c.fill();
    });
    if (a > 0.6) {
      c.strokeStyle = "rgba(48,53,80,.33)"; c.lineWidth = 1.1;
      for (var i = 0; i < 3; i++) {
        var y = top + 5 + i * 3.4;
        c.beginPath(); c.moveTo(50 - pw + 3, y); c.lineTo(47, y); c.stroke();
        c.beginPath(); c.moveTo(53, y); c.lineTo(50 + pw - 3 - (i === 2 ? 4 : 0), y); c.stroke();
      }
    }
    if (u >= 1.8 && u <= 2.8) {
      var f = ease(u - 1.8), x = 50 + pw * cos(PI * f), lift = sin(PI * f) * 4;
      c.fillStyle = "#FAFAFF"; c.strokeStyle = "rgba(48,53,80,.2)"; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(50, top + 2);
      c.quadraticCurveTo((50 + x) / 2, top - lift - 1, x, top + 0.5 - lift * 0.4);
      c.lineTo(x, bot - lift * 0.3);
      c.quadraticCurveTo((50 + x) / 2, bot - lift, 50, bot);
      c.closePath(); c.fill(); c.stroke();
    }
    c.strokeStyle = "rgba(48,53,80,.25)"; c.lineWidth = 1;
    c.beginPath(); c.moveTo(50, top + 2); c.lineTo(50, bot); c.stroke();
  }
  function eating(c, t) {
    arm(c, 28, 63, 35, 79);
    c.fillStyle = "#F97316"; c.beginPath(); c.ellipse(50, 78, 17, 14, 0, 0, PI); c.closePath(); c.fill();
    c.fillStyle = "#FFD6B0"; oval(c, 50, 78.5, 17, 2.5);
    c.fillStyle = "#fff"; oval(c, 50, 76.5, 13, 3.5);
    c.lineWidth = 1.4;
    for (var i = 0; i < 2; i++) {
      var ph = (t * 0.7 + i * 0.5) % 1, x = 72 + i * 6, y = 74 - ph * 14;
      c.strokeStyle = "rgba(255,255,255," + ((1 - ph) * 0.7).toFixed(2) + ")";
      c.beginPath(); c.moveTo(x, y + 6); c.quadraticCurveTo(x + 2.5, y + 3, x, y); c.quadraticCurveTo(x - 2.5, y - 3, x, y - 6); c.stroke();
    }
    var k = spoonK(t), sx = 58 + (51 - 58) * k, sy = 75 + (67.5 - 75) * k, hx = sx + 10, hy = sy + 6;
    c.strokeStyle = "#94A3B8"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(sx + 2, sy + 1); c.lineTo(hx, hy); c.stroke();
    c.fillStyle = "#CBD5E1"; oval(c, sx, sy, 3.2, 2.2);
    if (k > 0.05 && k < 0.98) { c.fillStyle = "#fff"; circle(c, sx, sy - 1.2, 1.6); }
    arm(c, 72, 63, hx, hy);
  }
  function star(c, x, y, s) {
    c.beginPath(); c.moveTo(x, y - s * 2);
    c.quadraticCurveTo(x, y, x + s * 2, y); c.quadraticCurveTo(x, y, x, y + s * 2);
    c.quadraticCurveTo(x, y, x - s * 2, y); c.quadraticCurveTo(x, y, x, y - s * 2); c.fill();
  }
  function wave(c, tt, mood) {
    var ang = (-58 + sin(tt * 7) * 22) * PI / 180;
    arm(c, 73, 57, 73 + cos(ang) * 15, 57 + sin(ang) * 15);
    if (mood === "bye") {
      for (var i = 0; i < 3; i++) {
        var ph = (tt * 0.9 + i / 3) % 1, a = sin(PI * ph);
        c.fillStyle = "rgba(255,214,102," + (a * 0.9).toFixed(2) + ")";
        star(c, 84 + i * 4 - ph * 3, 30 + i * 7 - ph * 6, 1.2 + a * 2);
      }
    }
  }
  function sun(c, tt) {
    c.save(); c.translate(14, 16); c.rotate(tt * 25 * PI / 180);
    c.strokeStyle = "#FFC53D"; c.lineWidth = 1.8;
    for (var i = 0; i < 8; i++) { c.beginPath(); c.moveTo(0, 7.5); c.lineTo(0, 10.5); c.stroke(); c.rotate(PI / 4); }
    c.restore();
    c.fillStyle = "#FFC53D"; circle(c, 14, 16, 5.5);
  }
  function exam(c, tt) {
    c.fillStyle = "#fff"; roundRect(c, 35, 72, 65, 88, 1.5);
    c.strokeStyle = "rgba(48,53,80,.33)"; c.lineWidth = 1;
    for (var i = 0; i < 3; i++) { c.beginPath(); c.moveTo(38, 76 + i * 3.6); c.lineTo(62 - (i === 2 ? 8 : 0), 76 + i * 3.6); c.stroke(); }
    arm(c, 28, 63, 37, 80);
    var px = 46 + sin(tt * 6) * 7, py = 80 + sin(tt * 12) * 0.8;
    c.strokeStyle = "#FFC53D"; c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(px, py); c.lineTo(px + 9, py - 8); c.stroke();
    c.fillStyle = INK; circle(c, px, py, 1);
    arm(c, 72, 63, px + 8, py - 6);
    var ph = (tt * 0.8) % 1, sy = 40 + ph * 14;
    c.fillStyle = "rgba(125,211,252," + ((1 - ph) * 0.86).toFixed(2) + ")";
    c.beginPath(); c.moveTo(73, sy - 4); c.quadraticCurveTo(76.5, sy + 1, 73, sy + 2); c.quadraticCurveTo(69.5, sy + 1, 73, sy - 4); c.fill();
  }
  function headband(c, tt) {
    c.save(); c.beginPath(); c.arc(50, 58, 28, 0, PI * 2); c.clip();
    c.fillStyle = "#EF4444"; c.fillRect(20, 37, 60, 6.5); c.restore();
    var f = sin(tt * 10) * 3;
    c.strokeStyle = "#EF4444"; c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(77, 40); c.lineTo(86, 37 + f); c.stroke();
    c.beginPath(); c.moveTo(77, 41); c.lineTo(85, 45 - f); c.stroke();
  }
  function pompom(c, x, y, tt) {
    var cols = ["#FFC53D", "#FF7AB6", "#FFE08A"];
    for (var i = 0; i < 7; i++) {
      var a = i / 7 * 2 * PI + tt * 2;
      c.fillStyle = cols[i % 3]; circle(c, x + cos(a) * 4.5, y + sin(a) * 4.5, 3.4);
    }
    c.fillStyle = "#FFD166"; circle(c, x, y, 3.6);
  }
  function hat(c, tt) {
    c.save(); c.translate(50, 33); c.rotate(sin(tt * 3) * 4 * PI / 180); c.translate(-50, -33);
    c.fillStyle = "#22C55E"; c.beginPath(); c.moveTo(40, 34); c.lineTo(50, 10); c.lineTo(60, 34); c.closePath(); c.fill();
    c.strokeStyle = "#FFE08A"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(44, 26); c.lineTo(56.5, 26); c.stroke();
    c.beginPath(); c.moveTo(47, 18); c.lineTo(53.5, 18); c.stroke();
    c.fillStyle = "#FF7AB6"; circle(c, 50, 10, 3.4);
    c.restore();
  }
  function confetti(c, tt, back) {
    var cols = ["#FF7AB6", "#FFC53D", "#22D3EE", "#A3E635", "#FFFFFF"];
    for (var i = 0; i < 14; i++) {
      if ((i % 2 === 0) !== back) continue;
      var x = (i * 37 % 100) + sin(tt * 2 + i) * 3, y = ((tt * 22 + i * 17) % 110) - 8;
      c.save(); c.translate(x, y); c.rotate((tt * 90 + i * 40) * PI / 180);
      c.fillStyle = cols[i % cols.length]; c.fillRect(-1.6, -0.9, 3.2, 1.8); c.restore();
    }
  }
  // ---------- ชุดผีฮาโลวีน ----------
  function ghost(c, mood, tt, t) {
    bat(c, 16 + sin(tt * 0.9) * 6, 22 + sin(tt * 1.7) * 4, 7, tt * 13);
    bat(c, 84 + sin(tt * 1.1 + 2) * 5, 16 + sin(tt * 1.4 + 1) * 3, 5, tt * 15 + 1);
    c.beginPath();
    c.moveTo(21, 86); c.lineTo(22, 58); c.bezierCurveTo(22, 22, 78, 22, 78, 58); c.lineTo(79, 86);
    for (var k = 0; k < 4; k++) {
      var x1 = 79 - k * 14.5, x2 = x1 - 14.5;
      c.quadraticCurveTo((x1 + x2) / 2, 93 + sin(tt * 3.2 + k * 1.3) * 2.2, x2, 86 + sin(tt * 3.2 + k + 0.7) * 0.8);
    }
    c.closePath();
    var g = c.createLinearGradient(50, 26, 50, 92);
    g.addColorStop(0, "#FFFFFF"); g.addColorStop(1, "#DCD5F0");
    c.fillStyle = g; c.fill();
    c.strokeStyle = "rgba(63,43,176,.12)"; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(31, 72); c.lineTo(29, 85); c.stroke();
    c.beginPath(); c.moveTo(69, 72); c.lineTo(71, 85); c.stroke();
    c.fillStyle = "rgba(255,255,255,.4)"; oval(c, 38, 39, 8, 6);
    antenna(c, tt);
    c.fillStyle = "#221A45"; oval(c, 41, 54, 7.5, 8); oval(c, 59, 54, 7.5, 8);
    face(c, mood, tt, t);
    var wv = sin(tt * 5) * 5;
    sleeve(c, 25, 63, 14, 52 + wv);
    sleeve(c, 75, 64, 82, 70);
    pail(c, 83, 70, tt);
    if (mood === "sleep") zzz(c, tt);
    if (mood === "party") confetti(c, tt, false);
  }
  function sleeve(c, x1, y1, x2, y2) {
    c.strokeStyle = "#EDE8F8"; c.lineWidth = 7;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    c.fillStyle = "#F6F3FC"; circle(c, x2, y2, 4.2);
  }
  function pail(c, hx, hy, tt) {
    c.save(); c.translate(hx, hy); c.rotate(sin(tt * 2.4) * 9 * PI / 180); c.translate(-hx, -hy);
    var cx = hx, cy = hy + 11, hop = Math.abs(sin(tt * 3)) * 1.6;
    c.strokeStyle = "#3B2A1A"; c.lineWidth = 1.4;
    c.beginPath(); c.ellipse(cx, (hy - 1 + cy + 2) / 2, 7, (cy + 3 - hy) / 2, 0, PI, 2 * PI); c.stroke();
    c.fillStyle = "#FF7AB6"; circle(c, cx - 3.5, cy - 5.5 - hop, 2.6);
    c.fillStyle = "#22D3EE"; circle(c, cx + 2.5, cy - 6 - hop * 0.6, 2.4);
    c.fillStyle = "#A3E635"; circle(c, cx + 0.2, cy - 7.6 - hop * 1.2, 2.2);
    c.strokeStyle = "#fff"; c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx + 4.5, cy - 4); c.lineTo(cx + 6.5, cy - 12 - hop); c.stroke();
    c.fillStyle = "#FFC53D"; circle(c, cx + 6.8, cy - 13.5 - hop, 2.6);
    c.fillStyle = "#F97316"; oval(c, cx, cy + 0.75, 8.5, 6.25);
    c.fillStyle = "#EA580C"; oval(c, cx, cy + 0.75, 3, 6.25);
    c.fillStyle = "#C2410C"; oval(c, cx, cy - 5, 8.5, 1.5);
    c.fillStyle = "#3B1300";
    c.beginPath();
    c.moveTo(cx - 5.2, cy + 0.5); c.lineTo(cx - 3.4, cy - 2.2); c.lineTo(cx - 1.6, cy + 0.5); c.closePath();
    c.moveTo(cx + 5.2, cy + 0.5); c.lineTo(cx + 3.4, cy - 2.2); c.lineTo(cx + 1.6, cy + 0.5); c.closePath();
    c.moveTo(cx - 4.5, cy + 2.4); c.quadraticCurveTo(cx, cy + 7, cx + 4.5, cy + 2.4); c.quadraticCurveTo(cx, cy + 4.2, cx - 4.5, cy + 2.4); c.closePath();
    c.fill();
    c.restore();
  }
  function bat(c, cx, cy, s, ft) {
    var f = sin(ft) * 0.55;
    c.fillStyle = "rgba(32,18,56,.9)";
    c.beginPath();
    c.moveTo(cx, cy);
    c.quadraticCurveTo(cx - s * 0.5, cy - s * (0.5 + f), cx - s, cy - s * (0.15 + f));
    c.quadraticCurveTo(cx - s * 0.7, cy + s * 0.1, cx - s * 0.45, cy + s * 0.2);
    c.quadraticCurveTo(cx - s * 0.25, cy + s * 0.05, cx, cy + s * 0.32);
    c.quadraticCurveTo(cx + s * 0.25, cy + s * 0.05, cx + s * 0.45, cy + s * 0.2);
    c.quadraticCurveTo(cx + s * 0.7, cy + s * 0.1, cx + s, cy - s * (0.15 + f));
    c.quadraticCurveTo(cx + s * 0.5, cy - s * (0.5 + f), cx, cy);
    c.closePath(); c.fill();
    c.fillStyle = "#FFD166"; circle(c, cx - s * 0.12, cy + s * 0.05, s * 0.07); circle(c, cx + s * 0.12, cy + s * 0.05, s * 0.07);
  }
  function zzz(c, tt) {
    c.textAlign = "center";
    for (var i = 0; i < 3; i++) {
      var ph = (tt * 0.45 + i / 3) % 1;
      c.font = "bold " + (6 + ph * 6).toFixed(1) + "px sans-serif";
      c.fillStyle = "rgba(255,255,255," + ((1 - ph) * 0.9).toFixed(2) + ")";
      c.fillText("z", 72 + ph * 12, 34 - ph * 20);
    }
  }

  window.Mascot = Mascot;
})();
