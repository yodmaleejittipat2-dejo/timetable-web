/* ตารางเรียน · เว็บแอปสำหรับ iPhone / iPad (ใช้ข้อมูลชุดเดียวกับแอป Android) */
(function () {
  "use strict";
  var C = window.TT_CONFIG || {};
  var WEB_VERSION = "web-6";
  var app = document.getElementById("app");
  function applySkin(v) { document.documentElement.setAttribute("data-skin", v === "glass" ? "glass" : "normal"); }
  try { applySkin(localStorage.getItem("tt_skin")); } catch (e) { applySkin("normal"); }

  // ---------------- เครื่องมือ ----------------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hm(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function parseTime(s) {
    var p = String(s || "").trim().split(/[:.]/);
    if (p.length !== 2) return null;
    var h = parseInt(p[0], 10), m = parseInt(p[1], 10);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
  }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function dayStart(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function dow(d) { var x = d.getDay(); return x === 0 ? 7 : x; } // 1 = จันทร์ ... 7 = อาทิตย์
  function minsOf(d) { return d.getHours() * 60 + d.getMinutes(); }

  var DAY_FULL = ["", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
  var DAY_SHORT = ["", "จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
  var MON_S = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  var MON_F = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  function dShort(d) { return d.getDate() + " " + MON_S[d.getMonth()] + " " + ((d.getFullYear() + 543) % 100); }
  function dLong(d) { return d.getDate() + " " + MON_F[d.getMonth()] + " " + (d.getFullYear() + 543); }
  function dWithDay(d) { return DAY_SHORT[dow(d)] + ". " + dShort(d); }
  function duration(m) {
    if (m < 1) return "ไม่ถึง 1 นาที";
    var h = Math.floor(m / 60), r = m % 60;
    return h === 0 ? r + " นาที" : r === 0 ? h + " ชม." : h + " ชม. " + r + " นาที";
  }
  function relative(d) {
    var t = dayStart(new Date());
    if (sameDay(d, t)) return "วันนี้";
    if (sameDay(d, addDays(t, -1))) return "เมื่อวาน";
    return DAY_FULL[dow(d)] + " " + dLong(d);
  }
  function color(code) {
    var m = { "ว": "#14B8A6", "ค": "#6366F1", "ท": "#F97316", "อ": "#EC4899", "ส": "#EAB308", "ศ": "#A855F7", "พ": "#22C55E", "ง": "#B45309", "I": "#0EA5E9" };
    return m[String(code || "").charAt(0)] || "#64748B";
  }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function toast(msg, ms) {
    var old = document.querySelector(".toast");
    if (old) old.remove();
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, ms || 2600);
  }

  // ---------------- ตารางเริ่มต้น (เหมือนในแอป Android) ----------------
  var NAMES = {
    "ค22104": "คณิตศาสตร์", "ค22204": "คณิตศาสตร์เพิ่มเติม", "ท22102": "ภาษาไทย", "อ22102": "ภาษาอังกฤษ",
    "อ22204": "ภาษาอังกฤษเพิ่มเติม", "ส22102": "สังคมศึกษาฯ", "ส22104": "ประวัติศาสตร์", "ศ22102": "ศิลปะ",
    "พ22102": "สุขศึกษาและพลศึกษา", "ง22102": "การงานอาชีพ", "ว22104": "วิทยาศาสตร์และเทคโนโลยี",
    "ว22211": "วิทยาศาสตร์เพิ่มเติม", "ว22213": "วิทยาศาสตร์เพิ่มเติม", "ว22205": "วิทยาศาสตร์เพิ่มเติม",
    "I20202": "การสื่อสารและการนำเสนอ (IS2)", "ก22904": "กิจกรรม", "ก22902": "กิจกรรมพัฒนาผู้เรียน",
    "ก22906": "กิจกรรมพัฒนาผู้เรียน", "ชุมนุม": "ชุมนุม"
  };
  function c(code, t, r) { return { c: code, n: NAMES[code] || code, t: t, r: r }; }
  var L = { l: 1 };
  function defaultConfig() {
    var S = [520, 570, 620, 670, 720, 770, 820, 870, 920], E = [570, 620, 670, 720, 770, 820, 870, 920, 970];
    return {
      school: "โรงเรียนนารีนุกูล", level: "ม.2/1", room: "1223", year: "2569", term: "2",
      termStart: "2026-11-02", termEnd: "2027-03-31",
      periods: S.map(function (s, i) { return { s: hm(s), e: hm(E[i]) }; }),
      days: [
        [c("ว22211", "ครูธงชัย", "814"), c("ว22211", "ครูธงชัย", "814"), c("ค22104", "ครูธนวรรณ", "1223"), L, c("ศ22102", "ครูธนภัทร", "532"), c("ท22102", "ครูนุชนาถ", "1223"), c("ว22104", "ครูเสวย", "1223"), c("ส22102", "ครูศศินันท์", "1223"), c("ง22102", "ครูวิลาวัลย์", "810")],
        [c("ก22906", "ครูวัชราภรณ์", "1223"), c("อ22102", "ครูวัชราภรณ์", "1223"), c("ว22104", "ครูเสวย", "1223"), c("ว22104", "ครูเสวย", "1223"), L, c("ค22204", "ครูสวราชย์", "1223"), c("ท22102", "ครูนุชนาถ", "1223"), c("อ22204", "ครูกุลธิดา", "1223"), null],
        [c("ค22104", "ครูธนวรรณ", "1223"), c("ว22213", "ครูปิยพัทธดน", "1228"), c("ก22902", "ครูธิดารัตน์", "1223"), L, c("พ22102", "ครูพิกุล", "1223"), c("ส22102", "ครูศศินันท์", "1223"), c("อ22102", "ครูวัชราภรณ์", "1223"), c("ก22904", "", ""), null],
        [c("ว22213", "ครูปิยพัทธดน", "1228"), c("ว22213", "ครูปิยพัทธดน", "1228"), c("I20202", "ครูราวี", "1223"), L, c("ท22102", "ครูนุชนาถ", "1223"), c("ศ22102", "ครูธนภัทร", "532"), c("ค22204", "ครูสวราชย์", "1223"), c("ส22104", "ครูวรวิทย์", "1223"), c("ชุมนุม", "", "")],
        [c("ค22104", "ครูธนวรรณ", "1223"), c("I20202", "ครูราวี", "1223"), c("อ22102", "ครูวัชราภรณ์", "1223"), L, c("ว22205", "ครูณฐรัช", "525"), c("ว22205", "ครูณฐรัช", "525"), c("ส22102", "ครูศศินันท์", "1223"), c("อ22204", "ครูกุลธิดา", "1223"), null]
      ],
      holidays: [
        { n: "หยุดชดเชยวันพ่อแห่งชาติ", s: "2026-12-07", e: "2026-12-07" },
        { n: "วันรัฐธรรมนูญ", s: "2026-12-10", e: "2026-12-10" },
        { n: "วันสิ้นปี", s: "2026-12-31", e: "2026-12-31" },
        { n: "วันขึ้นปีใหม่", s: "2027-01-01", e: "2027-01-01" },
        { n: "หยุดชดเชยวันมาฆบูชา", s: "2027-02-22", e: "2027-02-22" }
      ]
    };
  }

  /** แปลงข้อมูลจากเซิร์ฟเวอร์เป็นรูปแบบที่ใช้งาน (ช่องไหนไม่มีใช้ค่าเริ่มต้น) */
  function parseConfig(o) {
    var d = defaultConfig();
    o = o || {};
    var periods = (o.periods || []).map(function (p) {
      var s = parseTime(p && p.s), e = parseTime(p && p.e);
      return s == null || e == null ? null : { start: s, end: e };
    }).filter(Boolean);
    if (!periods.length) periods = d.periods.map(function (p) { return { start: parseTime(p.s), end: parseTime(p.e) }; });
    var days = Array.isArray(o.days) ? o.days : d.days;
    var cells = [];
    for (var i = 0; i < 5; i++) {
      var row = Array.isArray(days[i]) ? days[i] : [];
      cells.push(periods.map(function (_, p) {
        var x = row[p];
        if (!x) return null;
        if (x.l === 1) return { lunch: true, code: "", name: "พักกลางวัน", teacher: "", room: "" };
        return { lunch: false, code: x.c || "", name: x.n || "", teacher: x.t || "", room: x.r || "" };
      }));
    }
    var hol = (Array.isArray(o.holidays) ? o.holidays : d.holidays).map(function (h) {
      var s = parseDate(h.s), e = parseDate(h.e);
      return s && e ? { name: h.n || "วันหยุด", start: s, end: e } : null;
    }).filter(Boolean);
    var special = (Array.isArray(o.special) ? o.special : []).map(function (x) {
      var s = parseDate(x && x.s), e = parseDate(x && x.e);
      var ps = ((x && x.periods) || []).map(function (p) {
        var a = parseTime(p && p.s), b = parseTime(p && p.e);
        return a == null || b == null ? null : { start: a, end: b };
      }).filter(Boolean);
      if (!(s && e && ps.length)) return null;
      var mins = x.m || (ps[0].end - ps[0].start);
      var uniform = ps.every(function (p) { return p.end - p.start === mins; });
      return { name: x.n || "ลดเวลาเรียน", start: s, end: e, minutes: mins, periods: ps, label: uniform ? "คาบละ " + mins + " นาที" : "ปรับเวลาบางคาบ" };
    }).filter(Boolean);
    var prep = {};
    if (o.prep && typeof o.prep === "object") Object.keys(o.prep).forEach(function (k) { if (String(o.prep[k] || "").trim()) prep[k] = String(o.prep[k]); });
    var events = (Array.isArray(o.events) ? o.events : []).map(function (x) {
      var d2 = parseDate(x && x.d);
      return d2 ? { name: x.n || "วันสำคัญ", date: d2, type: x.t || "other" } : null;
    }).filter(Boolean);
    var motd = o.motd && o.motd.text && parseDate(o.motd.s) && parseDate(o.motd.e) ? { text: o.motd.text, start: parseDate(o.motd.s), end: parseDate(o.motd.e) } : null;
    function str(k) { return (o[k] && String(o[k]).trim()) || d[k]; }
    return {
      school: str("school"), level: str("level"), room: str("room"), year: str("year"), term: str("term"),
      termStart: parseDate(o.termStart) || parseDate(d.termStart),
      termEnd: parseDate(o.termEnd) || parseDate(d.termEnd),
      periods: periods, cells: cells, holidays: hol, special: special, prep: prep, events: events, motd: motd
    };
  }

  /** รวมคาบติดกันที่เป็นวิชาเดียวกัน */
  function buildBlocks(cfg, periods) {
    var out = [];
    for (var day = 1; day <= 5; day++) {
      var row = cfg.cells[day - 1], list = [], i = 0, n = Math.min(row.length, periods.length);
      while (i < n) {
        var x = row[i];
        if (!x) { i++; continue; }
        var j = i;
        while (j + 1 < n && row[j + 1] && JSON.stringify(row[j + 1]) === JSON.stringify(x)) j++;
        list.push({
          day: day, from: i + 1, to: j + 1, code: x.code, name: x.name, teacher: x.teacher, room: x.room,
          lunch: x.lunch, start: periods[i].start, end: periods[j].end,
          title: x.name || x.code || "ไม่มีชื่อวิชา", label: i === j ? String(i + 1) : (i + 1) + "–" + (j + 1)
        });
        i = j + 1;
      }
      out.push(list);
    }
    return out;
  }

  // ---------------- สถานะ ----------------
  var S = {
    cfg: null, blocks: null, posts: [], day: 1, offline: false,
    prefs: JSON.parse(store("tt_prefs") || "{}")
  };
  if (S.prefs.lead == null) S.prefs.lead = 15;
  if (S.prefs.atStart == null) S.prefs.atStart = true;
  if (S.prefs.posts == null) S.prefs.posts = true;

  function setConfig(raw) {
    S.cfg = parseConfig(raw);
    S.blocks = buildBlocks(S.cfg, S.cfg.periods);
    S.cfg.special.forEach(function (sp) { sp.blocks = buildBlocks(S.cfg, sp.periods); });
  }
  try { setConfig(JSON.parse(store("tt_cfg") || "null")); } catch (e) { setConfig(null); }
  try { S.posts = JSON.parse(store("tt_posts") || "[]"); } catch (e) { S.posts = []; }
  try { S.reacts = JSON.parse(store("tt_reacts") || "[]"); } catch (e) { S.reacts = []; }
  if (S.prefs.prep == null) S.prefs.prep = true;
  var td = dow(new Date());
  S.day = td <= 5 ? td : 1;

  function blocks(day) { return (S.blocks && S.blocks[day - 1]) || []; }
  /** วันลดเวลาเรียนของวันที่นี้ (null = เวลาปกติ) */
  function specialOn(d) {
    var t = dayStart(d);
    return S.cfg.special.filter(function (x) { return t >= dayStart(x.start) && t <= dayStart(x.end); })[0] || null;
  }
  /** ตารางของวันที่นั้นจริงๆ (ใช้เวลาลดถ้าเป็นวันลดเวลาเรียน) */
  function blocksOn(d) {
    var k = dow(d);
    if (k > 5) return [];
    var sp = specialOn(d);
    return sp ? (sp.blocks[k - 1] || []) : blocks(k);
  }
  function dayOff(d) {
    var cfg = S.cfg;
    for (var i = 0; i < cfg.holidays.length; i++) {
      var h = cfg.holidays[i];
      if (d >= dayStart(h.start) && d <= dayStart(h.end)) return h.name;
    }
    if (d < cfg.termStart || d > cfg.termEnd) return "ปิดภาคเรียน";
    if (dow(d) >= 6) return "วันหยุดสุดสัปดาห์";
    return null;
  }
  function bkey(b) { return b.code || b.name; }
  function prepFor(b) { return b.lunch ? "" : (S.cfg.prep[bkey(b)] || ""); }
  function prepList(d) {
    var seen = {}, out = [];
    blocksOn(d).forEach(function (b) {
      var p = prepFor(b);
      if (p && !seen[bkey(b)]) { seen[bkey(b)] = 1; out.push({ title: b.title, item: p }); }
    });
    return out;
  }
  function eventsOn(d) { return S.cfg.events.filter(function (e) { return sameDay(e.date, d); }); }
  function motdOn(d) { var m = S.cfg.motd; return m && d >= dayStart(m.start) && d <= dayStart(m.end) ? m.text : null; }
  var EV_ICON = { exam: "📝", sport: "🏅", trip: "🚌", party: "🎉", holiday: "🏖️", term: "🎒", other: "📌" };
  function countdowns(today) {
    var out = S.cfg.events.filter(function (e) { return e.date >= today; }).slice();
    if (S.cfg.termEnd >= today) out.push({ name: "ปิดภาคเรียน", date: addDays(S.cfg.termEnd, 1), type: "term" });
    var nh = S.cfg.holidays.filter(function (h) { return h.start > today; }).sort(function (a, b) { return a.start - b.start; })[0];
    if (nh) out.push({ name: nh.name, date: dayStart(nh.start), type: "holiday" });
    return out.sort(function (a, b) { return a.date - b.date; }).slice(0, 8);
  }
  function deviceId() {
    var id = store("tt_dev");
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
      store("tt_dev", id);
    }
    return id;
  }
  function current(now) {
    if (dayOff(dayStart(now))) return null;
    var m = minsOf(now);
    return blocksOn(now).filter(function (b) { return m >= b.start && m < b.end; })[0] || null;
  }
  function nextClass(now) {
    var base = dayStart(now);
    for (var i = 0; i < 400; i++) {
      var d = addDays(base, i);
      if (dayOff(d)) continue;
      var list = blocksOn(d);
      for (var k = 0; k < list.length; k++) {
        var b = list[k];
        if (b.lunch) continue;
        var t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(b.start / 60), b.start % 60);
        if (t > now) return { date: d, block: b, time: t };
      }
    }
    return null;
  }
  function weekDates() {
    var t = dayStart(new Date()), w = dow(t);
    var mon = w <= 5 ? addDays(t, 1 - w) : addDays(t, 8 - w);
    return [0, 1, 2, 3, 4].map(function (i) { return addDays(mon, i); });
  }
  function info(b) {
    var p = [];
    if (b.room) p.push("ห้อง " + b.room);
    if (b.teacher) p.push(b.teacher);
    if (!p.length && b.code) p.push(b.code);
    return p.join(" · ");
  }
  function noteKey(b) { return "tt_note_" + (b.code || b.name); }

  // ---------------- เซิร์ฟเวอร์ ----------------
  function api(path, opts) {
    opts = opts || {};
    var h = { apikey: C.key, "Content-Type": "application/json" };
    return fetch(C.url + path, { method: opts.method || "GET", headers: h, body: opts.body, cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.status === 204 ? null : r.text().then(function (t) { return t ? JSON.parse(t) : null; });
      });
  }
  function sync() {
    if (!C.url || !C.key) return Promise.resolve(false);
    var a = api("/rest/v1/config?id=eq.1&select=data").then(function (rows) {
      var d = rows && rows[0] && rows[0].data;
      if (d && Object.keys(d).length) {
        store("tt_cfg", JSON.stringify(d));
        setConfig(d);
      }
    });
    var b = api("/rest/v1/posts?select=*&order=id.desc&limit=60").then(function (rows) {
      S.posts = rows || [];
      store("tt_posts", JSON.stringify(S.posts));
    });
    var c2 = api("/rest/v1/post_reaction_counts?select=*").then(function (rows) {
      S.reacts = rows || [];
      store("tt_reacts", JSON.stringify(S.reacts));
    }).catch(function () {});
    return Promise.all([a, b, c2]).then(function () { S.offline = false; store("tt_sync", String(Date.now())); return true; })
      .catch(function () { S.offline = true; return false; });
  }
  function postTime(p) { var d = new Date(p.created_at); return isNaN(d) ? null : d; }
  function lastSeen() { return +(store("tt_seen") || 0); }

  // ---------------- ไอคอน ----------------
  var IC = {
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 17h16"/><circle cx="9.1" cy="7" r="2.6" fill="currentColor"/><circle cx="14.9" cy="17" r="2.6" fill="currentColor"/></svg>',
    feed: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M5 17l4.5-4.5 3.5 3.5 2.5-2.5 4 4"/><circle cx="15.6" cy="8.5" r="1.4" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5L19 12 8 18.5z"/></svg>'
  };

  // ---------------- รูป/วิดีโอของโพสต์ ----------------
  function mediaHtml(p, maxH) {
    var isVideo = p.media_type === "video";
    var img = isVideo ? p.thumb_url : p.media_url;
    var h = '<div class="media" data-media="' + p.id + '">';
    if (img) {
      h += '<div class="blur" style="background-image:url(\'' + esc(img) + '\')"></div><div class="shade"></div>' +
        '<img loading="lazy" src="' + esc(img) + '" alt="" style="max-height:' + maxH + 'px">';
    } else {
      h += '<div style="height:' + Math.round(maxH * 0.8) + 'px"></div>';
    }
    if (isVideo) h += '<div class="play">' + IC.play + '</div>';
    return h + '</div>';
  }
  function openViewer(p) {
    var v = document.createElement("div");
    v.className = "viewer";
    v.innerHTML = (p.media_type === "video"
      ? '<video src="' + esc(p.media_url) + '" controls autoplay playsinline></video>'
      : '<img src="' + esc(p.media_url) + '" alt="">') + '<button class="close" aria-label="ปิด">✕</button>';
    v.querySelector(".close").onclick = function () { v.remove(); };
    document.body.appendChild(v);
  }
  function postById(id) { return S.posts.filter(function (p) { return String(p.id) === String(id); })[0]; }

  // ---------------- หน้าแรก ----------------
  var slideTimer = null, slidePause = 0;

  function renderHome() {
    var now = new Date(), today = dayStart(now), cfg = S.cfg;
    var off = dayOff(today), m = minsOf(now), cur = current(now), nx = nextClass(now);
    var tag, title, sub = "", when = "", target = null, prog = -1;
    if (cur && !cur.lunch) {
      tag = "กำลังเรียน · คาบ " + cur.label; title = cur.title; sub = info(cur);
      when = hm(cur.start) + "–" + hm(cur.end) + " · เหลืออีก " + duration(cur.end - m);
      target = cur; prog = (m - cur.start) / (cur.end - cur.start);
    } else if (nx) {
      var b = nx.block, mins = Math.floor((nx.time - now) / 60000);
      tag = cur && cur.lunch ? "พักกลางวัน · คาบถัดไป"
        : sameDay(nx.date, today) ? "คาบถัดไป"
        : off && off !== "วันหยุดสุดสัปดาห์" ? "วันนี้หยุด · " + off
        : off ? "วันหยุดสุดสัปดาห์ · เรียนครั้งถัดไป" : "เลิกเรียนแล้ว · เรียนครั้งถัดไป";
      title = b.title; sub = info(b);
      when = sameDay(nx.date, today) ? "เริ่ม " + hm(b.start) + " · อีก " + duration(mins)
        : sameDay(nx.date, addDays(today, 1)) ? "พรุ่งนี้ " + hm(b.start) + " น."
        : DAY_FULL[dow(nx.date)] + " " + dShort(nx.date) + " · " + hm(b.start) + " น.";
      target = b;
    } else {
      tag = "ปิดภาคเรียน"; title = "ยังไม่มีตารางเรียนเทอมถัดไป"; sub = "รอแอดมินอัปเดตวันเปิดเทอม";
    }

    var newest = S.posts.reduce(function (a, p) { return Math.max(a, p.id); }, 0);
    var unread = newest > lastSeen();
    var h = '<div class="row top"><div class="grow"><div class="title">ตารางเรียน</div>' +
      '<div class="muted small ellipsis">' + esc(cfg.level + " · ห้อง " + cfg.room + " · ภาคเรียนที่ " + cfg.term + "/" + cfg.year) + '</div></div>' +
      '<button class="icon-btn" data-go="#feed" aria-label="กิจกรรม">' + IC.feed + (unread ? '<span class="dot"></span>' : '') + '</button>' +
      '<button class="icon-btn" data-go="#settings" aria-label="ตั้งค่า">' + IC.gear + '</button></div>';

    // น้องติ๊ก: ท่าทางและคำพูดตามช่วงเวลา
    var tb = off ? [] : blocksOn(today).filter(function (x) { return !x.lunch; });
    function nextTxt() {
      if (!nx) return "";
      return sameDay(nx.date, today) ? nx.block.title + " · เริ่ม " + hm(nx.block.start)
        : sameDay(nx.date, addDays(today, 1)) ? "พรุ่งนี้ " + hm(nx.block.start) + " น. · " + nx.block.title
        : DAY_FULL[dow(nx.date)] + " " + dShort(nx.date) + " · " + hm(nx.block.start) + " น.";
    }
    var mood, say, saySub;
    if (off === "ปิดภาคเรียน") { mood = "sleep"; say = "ปิดเทอมแล้ว พักผ่อนให้เต็มที่นะ"; saySub = nx ? "เปิดเรียน " + dWithDay(nx.date) : "รอแอดมินอัปเดตวันเปิดเทอม"; }
    else if (off === "วันหยุดสุดสัปดาห์") { mood = "sleep"; say = "วันหยุดสุดสัปดาห์ พักผ่อนเยอะๆ นะ"; saySub = nextTxt(); }
    else if (off) { mood = "sleep"; say = "วันนี้หยุด · " + off; saySub = nextTxt(); }
    else if (cur && !cur.lunch) { mood = "study"; say = "ตั้งใจเรียนนะ!"; saySub = cur.title + " · เหลืออีก " + duration(cur.end - m); }
    else if (cur) { mood = "eat"; say = "กินข้าวให้อร่อยนะ!"; saySub = nx && sameDay(nx.date, today) ? "อีก " + duration(Math.floor((nx.time - now) / 60000)) + " เข้าเรียน " + nx.block.title : ""; }
    else if (tb.length && m < tb[0].start) { mood = "morning"; say = "อรุณสวัสดิ์! วันนี้เรียน " + tb.length + " วิชา"; saySub = "คาบแรก " + tb[0].title + " · " + hm(tb[0].start); }
    else if (now.getHours() >= 21 || now.getHours() < 5) { mood = "sleep"; say = "ดึกแล้ว นอนหลับฝันดีนะ"; saySub = nextTxt(); }
    else if (nx && sameDay(nx.date, today)) { mood = "study"; say = "เตรียมตัวเข้าเรียนนะ"; saySub = nx.block.title + " · อีก " + duration(Math.floor((nx.time - now) / 60000)); }
    else { mood = "bye"; say = "เลิกเรียนแล้ว เดินทางปลอดภัยครับ"; saySub = "พรุ่งนี้เจอกันใหม่นะ"; }
    var evT = eventsOn(today), exTom = eventsOn(addDays(today, 1)).filter(function (e) { return e.type === "exam"; })[0];
    var lunchNow = cur && cur.lunch;
    evT.forEach(function (e) {
      if (e.type === "sport") { mood = "sport"; say = "วันนี้" + e.name + " สู้ๆ! 🏅"; }
      else if (e.type === "party" || e.type === "trip") { mood = "party"; say = "วันนี้" + e.name + " สนุกๆ นะ! 🎉"; }
      else if (e.type === "exam" && !lunchNow) { mood = "exam"; say = "วันนี้" + e.name + " ตั้งสติ ทำได้แน่นอน!"; }
    });
    if (exTom && !evT.length && (mood === "bye" || mood === "sleep" || mood === "morning")) { mood = "exam"; say = "พรุ่งนี้" + exTom.name + " อ่านหนังสือด้วยนะ 📚"; }
    if ((mood === "bye" || (mood === "sleep" && !off)) && nx && sameDay(nx.date, addDays(today, 1))) {
      var pl = prepList(nx.date);
      if (pl.length) saySub = "🎒 พรุ่งนี้เตรียม: " + pl.map(function (x) { return x.item; }).join(", ");
    }
    var md = motdOn(today);
    if (md) { if (!saySub) saySub = say; say = "📣 " + md; }
    if (Date.now() < tapUntil) say = tapPhrase;
    var heroPrep = target ? prepFor(target) : "";

    var spToday = off ? null : specialOn(today);
    var spPill = spToday ? '<span class="pill warn-pill">⏱ ' + esc(spToday.name) + ' · ' + spToday.label + '</span>' : '';
    var heroMascot = store("tt_hero") === "mascot";
    var tDate = target ? (cur && !cur.lunch ? today : nx ? nx.date : today) : null;
    var tStr = tDate ? tDate.getFullYear() + "-" + pad(tDate.getMonth() + 1) + "-" + pad(tDate.getDate()) : "";
    if (heroMascot) {
      getMascot().setMood(mood);
      h += '<div class="hero" id="hero"><div class="row"><div class="grow soft small">' + DAY_FULL[dow(today)] + " " + dLong(today) + '</div></div>' +
        '<div class="row" style="align-items:center;gap:8px"><div id="mascot-slot" class="mascot-slot"></div>' +
        '<div class="grow"><span class="pill" style="margin-top:0">น้องติ๊ก</span>' +
        '<div class="say">' + esc(say) + '</div>' + (saySub ? '<div class="soft">' + esc(saySub) + '</div>' : '') + '</div></div>' +
        (spPill ? '<div style="margin-top:8px">' + spPill + '</div>' : '') +
        (prog >= 0 ? '<div class="bar"><i style="width:' + Math.max(2, Math.min(100, prog * 100)) + '%"></i></div>' : '') +
        '<div class="hint">แตะเพื่อเล่นกับน้องติ๊ก · กดค้างเพื่อกลับไปดูวิชา</div></div>';
    } else {
      h += '<div class="hero" id="hero"' + (target ? ' data-go="#d/' + target.day + '/' + target.from + '/' + tStr + '"' : '') + '>' +
        '<div class="row"><div class="grow soft small">' + DAY_FULL[dow(today)] + " " + dLong(today) + '</div>' +
        (target ? '<span style="width:10px;height:10px;border-radius:50%;background:' + color(target.code) + '"></span>' : '') + '</div>' +
        '<div class="pills"><span class="pill">' + esc(tag) + '</span>' + spPill + '</div><h2 class="clamp2">' + esc(title) + '</h2>' +
        (sub ? '<div class="soft">' + esc(sub) + '</div>' : '') +
        (when ? '<div class="b" style="margin-top:10px">' + esc(when) + '</div>' : '') +
        (heroPrep ? '<div class="b" style="margin-top:6px">🎒 เตรียม: ' + esc(heroPrep) + '</div>' : '') +
        (prog >= 0 ? '<div class="bar"><i style="width:' + Math.max(2, Math.min(100, prog * 100)) + '%"></i></div>' : '') +
        (store("tt_hint") ? '' : '<div class="hint">กดค้างเพื่อดูน้องติ๊ก ✨</div>') + '</div>';
    }

    h += statusHtml();
    var lastSync = +(store("tt_sync") || 0);
    if (lastSync && Date.now() - lastSync > 3 * 86400000) {
      h += '<div class="status warn" style="margin-top:10px">⚠ ไม่ได้อัปเดตข้อมูลมา ' + Math.floor((Date.now() - lastSync) / 86400000) + ' วัน · ตรวจสอบอินเทอร์เน็ต แล้วเปิดแอปใหม่</div>';
    }
    var cds = [];
    if (cds.length) {
      h += '<div class="b" style="font-size:18px;margin:18px 4px 10px">นับถอยหลัง</div><div class="cd-row">' + cds.map(function (e) {
        var days = Math.round((dayStart(e.date) - today) / 86400000);
        return '<div class="cd"><div class="row" style="gap:6px"><span>' + (EV_ICON[e.type] || "📌") + '</span>' +
          (days === 0 ? '<span class="cd-n" style="font-size:22px">วันนี้!</span>' : '<span class="cd-n">' + days + '</span><span class="small muted">วัน</span>') +
          '</div><div class="b small ellipsis" style="max-width:150px">' + esc(e.name) + '</div><div class="muted" style="font-size:11px">' + dWithDay(e.date) + '</div></div>';
      }).join("") + '</div>';
    }

    // สไลด์กิจกรรม
    var posts = S.posts.slice(0, 10);
    if (posts.length) {
      h += '<div class="row" style="margin:18px 4px 10px"><div class="b" style="font-size:18px">กิจกรรม</div>' +
        (unread ? '<span class="pill red-pill">ใหม่</span>' : '') + '<div class="grow"></div>' +
        '<button class="b" style="color:var(--accent)" data-go="#feed">ดูทั้งหมด ›</button></div>';
      h += '<div class="slider" id="slider">' + posts.map(function (p) {
        var t = postTime(p);
        var meta = (t ? relative(t) + " · " + hm(minsOf(t)) + " น." : "") + (p.media_type === "video" ? "  ·  แตะเพื่อเล่นวิดีโอ" : "");
        return '<div class="slide" data-post="' + p.id + '">' +
          (p.media_url ? mediaHtml(p, 190) : '<div class="textpost" data-go="#feed">' + esc(p.body) + '</div>') +
          '<div class="cap" data-go="#feed">' + (p.media_url && p.body ? '<div class="b clamp2">' + esc(p.body) + '</div>' : '') +
          '<div class="small muted ellipsis">' + esc(meta) + '</div></div></div>';
      }).join("") + '</div>';
      if (posts.length > 1) h += '<div class="dots" id="dots">' + posts.map(function (_, i) { return '<i class="' + (i === 0 ? "on" : "") + '"></i>'; }).join("") + '</div>';
    }

    // แถบวัน
    var dates = weekDates();
    h += '<div class="chips">' + dates.map(function (d, i) {
      var k = i + 1, o = dayOff(d), red = !o && specialOn(d);
      return '<button class="chip' + (k === S.day ? " sel" : "") + (sameDay(d, today) ? " today" : "") + '" data-day="' + k + '">' +
        '<div class="d">' + DAY_SHORT[k] + '</div><div class="n' + (o ? " off" : red ? " red" : "") + '">' + (o ? "หยุด" : red ? "ลดเวลา" : d.getDate()) + '</div></button>';
    }).join("") + '</div>';
    h += '<div id="list">' + listHtml() + '</div>';

    var keep = document.getElementById("slider");
    var keepLeft = keep ? keep.scrollLeft : 0;
    app.innerHTML = h;
    var sl = document.getElementById("slider");
    if (sl) sl.scrollLeft = keepLeft;
    var slot = document.getElementById("mascot-slot");
    if (slot) slot.appendChild(getMascot().canvas);
    bindSlider();
    bindHero();
  }

  // ---------------- น้องติ๊ก + กดค้าง ----------------
  var mascotObj = null;
  var tapPhrase = "", tapUntil = 0;
  var PHRASES = ["สู้ๆ นะ! 💪", "เก่งมากเลย!", "อย่าลืมดื่มน้ำนะ 💧", "ง่วงจัง~ 😪", "ติ๊กๆ ต็อกๆ ⏰", "วันนี้ก็สู้ต่อไป!", "ยิ้มหน่อย 😊", "เดี๋ยวเตือนให้เองนะ!", "จั๊กจี้! 🤭"];
  function getMascot() {
    if (!mascotObj) mascotObj = window.Mascot ? new window.Mascot() : { canvas: document.createElement("div"), setMood: function () {}, jump: function () {} };
    return mascotObj;
  }
  var suppressClick = false;
  function bindHero() {
    var el = document.getElementById("hero");
    if (!el) return;
    var timer = null, sx = 0, sy = 0;
    function cancel() {
      clearTimeout(timer); timer = null;
      el.classList.remove("pressing");
    }
    el.addEventListener("pointerdown", function (e) {
      sx = e.clientX; sy = e.clientY;
      el.classList.add("pressing");
      clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;
        suppressClick = true;
        el.classList.remove("pressing");
        toggleHero(el);
      }, 520);
    });
    el.addEventListener("pointermove", function (e) {
      if (timer && (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10)) cancel();
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) { el.addEventListener(ev, cancel); });
    el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    if (store("tt_hero") === "mascot") {
      el.addEventListener("click", function () {
        if (suppressClick) return;
        getMascot().jump();
        var opts = PHRASES.filter(function (p) { return p !== tapPhrase; });
        tapPhrase = opts[Math.floor(Math.random() * opts.length)];
        tapUntil = Date.now() + 2600;
        renderHome();
        setTimeout(function () { if (!location.hash || location.hash === "#") renderHome(); }, 2700);
      });
    }
  }
  function toggleHero(el) {
    if (navigator.vibrate) { try { navigator.vibrate(15); } catch (e) {} }
    store("tt_hint", "1");
    el.classList.add("swap-out");
    setTimeout(function () {
      store("tt_hero", store("tt_hero") === "mascot" ? "subject" : "mascot");
      renderHome();
      var n = document.getElementById("hero");
      if (n) n.classList.add("swap-in");
      var cv = document.querySelector("#mascot-slot canvas");
      if (cv) cv.classList.add("pop");
    }, 240);
  }

  function statusHtml() {
    var p = pushState();
    var text, warn = false;
    if (p === "on") text = "● แจ้งเตือนเปิดอยู่ · เตือนก่อน " + S.prefs.lead + " นาที" + (S.prefs.atStart ? " และตอนเริ่มคาบ" : "");
    else if (p === "install") { text = "! เพิ่มแอปไปที่หน้าจอโฮมก่อน เพื่อเปิดการแจ้งเตือน · แตะเพื่อดูวิธี"; warn = true; }
    else if (p === "unsupported") text = "เครื่องนี้ยังไม่รองรับการแจ้งเตือน (ต้องเป็น iOS 16.4 ขึ้นไป)";
    else { text = "! ยังไม่ได้เปิดการแจ้งเตือน · แตะเพื่อเปิด"; warn = true; }
    if (S.offline) text += " · ออฟไลน์";
    return '<div class="status' + (warn ? " warn" : "") + '" data-go="#settings">' + esc(text) + '</div>';
  }

  function listHtml() {
    var date = weekDates()[S.day - 1], now = new Date(), isToday = sameDay(date, now), m = minsOf(now);
    var off = dayOff(date), list = blocksOn(date), sp = off ? null : specialOn(date);
    var h = '<div class="row list-head"><div class="grow b" style="font-size:18px">' + DAY_FULL[S.day] + " " + dShort(date) + '</div>';
    if (list.length) h += '<div class="small muted">' + list.filter(function (b) { return !b.lunch; }).length + " วิชา · " + hm(list[0].start) + "–" + hm(list[list.length - 1].end) + '</div>';
    h += '</div>';
    if (off) h += '<div class="banner"><div class="b">วันหยุด · ' + esc(off) + '</div><div class="small muted">วันนี้จะไม่มีการแจ้งเตือน</div></div>';
    if (sp && list.length) h += '<div class="banner warnb"><div class="b">⏱ ' + esc(sp.name) + ' · ' + sp.label + '</div>' +
      '<div class="small muted">เวลาเรียนวันนี้ไม่เหมือนปกติ เลิกเรียน ' + hm(list[list.length - 1].end) + ' น. · การแจ้งเตือนใช้เวลาใหม่ให้แล้ว</div></div>';
    var ds = date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
    var pt = off ? [] : prepList(date);
    if (pt.length) h += '<div class="banner prepb"><div class="b">🎒 ของที่ต้องเตรียม</div><div class="small muted">' +
      pt.map(function (x) { return "• " + esc(x.title) + ": " + esc(x.item); }).join("<br>") + '</div></div>';
    if (!list.length) h += '<div class="center muted" style="padding:24px">ไม่มีคาบเรียนในวันนี้</div>';
    list.forEach(function (b) {
      var st = !isToday || off ? 0 : m >= b.end ? -1 : m >= b.start ? 1 : 0;
      var dim = st === -1 || off;
      if (b.lunch) {
        h += '<div class="lunch"' + (dim ? ' style="opacity:.5"' : '') + '><div class="time"><div class="s">' + hm(b.start) + '</div><div class="e">' + hm(b.end) + '</div></div>' +
          '<div style="margin-left:16px">' + esc(b.name || "พักกลางวัน") + '</div></div>';
        return;
      }
      var line2 = [b.code, "คาบ " + b.label].concat(b.room ? ["ห้อง " + b.room] : []).filter(Boolean).join(" · ");
      var note = store(noteKey(b));
      h += '<button class="cls' + (st === 1 ? " now" : "") + (dim ? " past" : "") + '" data-go="#d/' + b.day + '/' + b.from + '/' + ds + '">' +
        '<div class="time"><div class="s">' + hm(b.start) + '</div><div class="e">' + hm(b.end) + '</div></div>' +
        '<div class="vbar" style="background:' + color(b.code) + '"></div>' +
        '<div class="grow"><div class="b ellipsis" style="font-size:16px">' + esc(b.title) + '</div>' +
        '<div class="small muted ellipsis">' + esc(line2) + '</div>' +
        (b.teacher ? '<div class="small muted ellipsis">' + esc(b.teacher) + '</div>' : '') +
        (prepFor(b) ? '<div class="small b ellipsis" style="color:var(--accent)">🎒 ' + esc(prepFor(b)) + '</div>' : '') + '</div>' +
        (st === 1 ? '<span class="pill accent-pill">ตอนนี้</span>' : note ? '<span class="pill soft-pill">โน้ต</span>' : '') + '</button>';
    });
    if (list.length) h += '<div class="center small muted" style="margin-top:6px">เลิกเรียน ' + hm(list[list.length - 1].end) + ' น. · แตะวิชาเพื่อดูรายละเอียด</div>';
    return h;
  }

  function bindSlider() {
    var sl = document.getElementById("slider");
    clearInterval(slideTimer);
    if (!sl) return;
    var dots = document.getElementById("dots");
    function idx() { return Math.round(sl.scrollLeft / (sl.clientWidth + 12)); }
    sl.addEventListener("scroll", function () {
      if (!dots) return;
      var i = idx();
      Array.prototype.forEach.call(dots.children, function (d, k) { d.className = k === i ? "on" : ""; });
    }, { passive: true });
    ["touchstart", "pointerdown", "wheel"].forEach(function (ev) {
      sl.addEventListener(ev, function () { slidePause = Date.now() + 5000; }, { passive: true });
    });
    var n = sl.children.length;
    if (n < 2) return;
    slideTimer = setInterval(function () {
      if (Date.now() < slidePause || document.hidden) return;
      var i = (idx() + 1) % n;
      sl.scrollTo({ left: i * (sl.clientWidth + 12), behavior: "smooth" });
    }, 5000);
  }

  // ---------------- รายละเอียดวิชา ----------------
  function renderDetail(day, from, dateStr) {
    var b = blocks(day).filter(function (x) { return x.from === from; })[0];
    if (!b) { location.hash = ""; return; }
    var onDate = parseDate(dateStr), sp = onDate ? specialOn(onDate) : null;
    var shown = sp ? (blocksOn(onDate).filter(function (x) { return x.from === from; })[0] || b) : b;
    var col = color(b.code);
    var all = [];
    for (var d = 1; d <= 5; d++) blocks(d).forEach(function (x) {
      if (!x.lunch && (b.code ? x.code === b.code : x.name === b.name)) all.push(x);
    });
    var h = '<div class="row sub-top"><button class="icon-btn" data-back>' + IC.back + '</button><div class="t" style="margin-left:4px">รายละเอียดวิชา</div></div>';
    h += '<div class="subject-head" style="background:linear-gradient(135deg,' + col + ',' + col + 'aa)">' +
      (b.code ? '<span class="pill">' + esc(b.code) + '</span>' : '') + '<h2>' + esc(b.title) + '</h2>' +
      (b.teacher ? '<div style="opacity:.9;margin-top:4px">' + esc(b.teacher) + '</div>' : '') + '</div>';
    h += '<div class="tiles"><div class="tile"><div class="small muted">วัน</div><div class="v">' + DAY_FULL[b.day] + '</div></div>' +
      '<div class="tile"><div class="small muted">เวลา</div><div class="v">' + hm(shown.start) + "–" + hm(shown.end) + '</div></div>' +
      '<div class="tile"><div class="small muted">ห้องเรียน</div><div class="v">' + esc(b.room || "-") + '</div></div>' +
      '<div class="tile"><div class="small muted">คาบที่</div><div class="v">' + b.label + '</div></div></div>';
    if (sp) h += '<div class="banner warnb" style="margin-top:10px"><div class="b">⏱ ' + esc(sp.name) + ' · ' + dWithDay(onDate) + '</div>' +
      '<div class="small muted">วันนั้นเรียน ' + hm(shown.start) + '–' + hm(shown.end) + ' (ปกติ ' + hm(b.start) + '–' + hm(b.end) + ') · ' + sp.label + '</div></div>';
    if (prepFor(b)) h += '<div class="banner prepb" style="margin-top:10px"><div class="b">🎒 ต้องเตรียม</div><div class="small muted">' + esc(prepFor(b)) + '</div></div>';
    h += '<div class="section">เรียนวิชานี้ในสัปดาห์</div><div class="card">' + all.map(function (x) {
      var me = x.day === b.day && x.from === b.from;
      return '<div class="lrow"><div class="grow' + (me ? " b" : "") + '">' + DAY_FULL[x.day] + '</div>' +
        '<div class="' + (me ? "b" : "muted") + '" style="' + (me ? "color:var(--accent)" : "") + '">' + hm(x.start) + "–" + hm(x.end) + (x.room ? "  ·  " + esc(x.room) : "") + '</div></div>';
    }).join("") + '</div>';
    h += '<div class="section">โน้ต / การบ้าน (เห็นแค่ในเครื่องนี้)</div>' +
      '<textarea id="note" placeholder="เช่น ส่งการบ้านหน้า 24, เอาสมุดมาด้วย">' + esc(store(noteKey(b)) || "") + '</textarea>' +
      '<div class="small muted" style="margin:8px 4px 0">บันทึกอัตโนมัติ</div>';
    app.innerHTML = '<div class="fade">' + h + '</div>';
    document.getElementById("note").addEventListener("input", function (e) { store(noteKey(b), e.target.value); });
  }

  // ---------------- ปฏิกิริยา ----------------
  var EMOJIS = ["❤️", "😂", "👍", "😮", "🎉"];
  var adj = {};
  function myReacts() { try { return JSON.parse(store("tt_myreacts") || "{}"); } catch (e) { return {}; } }
  function reactsHtml(pid) {
    var mine = myReacts();
    return EMOJIS.map(function (e) {
      var k = pid + "|" + e;
      var n = 0;
      S.reacts.forEach(function (r) { if (String(r.post_id) === String(pid) && r.emoji === e) n = r.n; });
      n = Math.max(0, n + (adj[k] || 0));
      return '<button class="re' + (mine[k] ? " on" : "") + '" data-react="' + pid + '" data-emoji="' + e + '">' + e + (n ? " " + n : "") + '</button>';
    }).join("");
  }
  function toggleReact(pid, e) {
    var k = pid + "|" + e, mine = myReacts(), on = !mine[k];
    if (on) mine[k] = 1; else delete mine[k];
    store("tt_myreacts", JSON.stringify(mine));
    adj[k] = (adj[k] || 0) + (on ? 1 : -1);
    function redraw() {
      var box = document.querySelector('[data-reacts="' + pid + '"]');
      if (box) box.innerHTML = reactsHtml(pid);
    }
    redraw();
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (x) {} }
    api("/rest/v1/rpc/toggle_reaction", { method: "POST", body: JSON.stringify({ p_post: +pid, p_device: deviceId(), p_emoji: e }) })
      .then(function (serverOn) {
        var m = myReacts();
        if (serverOn) m[k] = 1; else delete m[k];
        store("tt_myreacts", JSON.stringify(m));
        return api("/rest/v1/post_reaction_counts?select=*");
      })
      .then(function (rows) { S.reacts = rows || []; store("tt_reacts", JSON.stringify(S.reacts)); delete adj[k]; redraw(); })
      .catch(function () {
        var m = myReacts();
        if (on) delete m[k]; else m[k] = 1;
        store("tt_myreacts", JSON.stringify(m));
        adj[k] = (adj[k] || 0) + (on ? -1 : 1);
        redraw();
        toast("กดไม่สำเร็จ ตรวจสอบอินเทอร์เน็ต");
      });
  }

  // ---------------- หน้ากิจกรรม ----------------
  function renderFeed() {
    var newest = S.posts.reduce(function (a, p) { return Math.max(a, p.id); }, 0);
    if (newest > lastSeen()) store("tt_seen", String(newest));
    var h = '<div class="row sub-top"><button class="icon-btn" data-back>' + IC.back + '</button><div class="t" style="margin-left:4px">กิจกรรม</div></div>';
    if (S.offline) h += '<div class="center small muted" style="margin-bottom:8px">ออฟไลน์ · แสดงข้อมูลที่โหลดไว้ล่าสุด</div>';
    if (!S.posts.length) h += '<div class="center muted" style="padding:40px 0">ยังไม่มีกิจกรรม</div>';
    var last = "";
    S.posts.forEach(function (p) {
      var t = postTime(p);
      var key = t ? dayStart(t).toDateString() : "";
      if (t && key !== last) { h += '<div class="section">' + relative(t) + '</div>'; last = key; }
      h += '<div class="card post"><div class="head small muted">' + (t ? hm(minsOf(t)) + " น." : "") + '</div>' +
        (p.body ? '<div class="body">' + esc(p.body) + '</div>' : '<div style="height:8px"></div>') +
        (p.media_url ? '<div data-post="' + p.id + '">' + mediaHtml(p, 260) + '</div>' : '') +
        '<div class="reacts" data-reacts="' + p.id + '">' + reactsHtml(p.id) + '</div></div>';
    });
    app.innerHTML = '<div class="fade">' + h + '</div>';
  }

  // ---------------- การแจ้งเตือน ----------------
  function isStandalone() { return window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches; }
  function isIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
  function pushState() {
    if (isIOS() && !isStandalone()) return "install";
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
    return store("tt_push") === "1" && Notification.permission === "granted" ? "on" : "off";
  }
  function b64ToBytes(s) {
    var pad = "=".repeat((4 - (s.length % 4)) % 4);
    var raw = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  function saveSub(sub) {
    var j = sub.toJSON();
    var base = {
      p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth,
      p_lead: S.prefs.lead, p_at_start: !!S.prefs.atStart, p_posts: !!S.prefs.posts
    };
    var withPrep = JSON.parse(JSON.stringify(base));
    withPrep.p_prep = !!S.prefs.prep;
    return api("/rest/v1/rpc/save_push_sub", { method: "POST", body: JSON.stringify(withPrep) })
      .catch(function () { return api("/rest/v1/rpc/save_push_sub", { method: "POST", body: JSON.stringify(base) }); });
  }
  function enablePush() {
    return Notification.requestPermission().then(function (perm) {
      if (perm !== "granted") throw new Error("ไม่ได้รับอนุญาตให้แจ้งเตือน ไปเปิดได้ที่ ตั้งค่า → การแจ้งเตือน → ตารางเรียน");
      return navigator.serviceWorker.ready;
    }).then(function (reg) {
      return reg.pushManager.getSubscription().then(function (s) {
        return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(C.vapid) });
      });
    }).then(function (sub) {
      return saveSub(sub).then(function () { store("tt_push", "1"); });
    });
  }
  function disablePush() {
    return navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); })
      .then(function (sub) {
        store("tt_push", "0");
        if (!sub) return;
        var ep = sub.endpoint;
        return sub.unsubscribe().then(function () {
          return api("/rest/v1/rpc/delete_push_sub", { method: "POST", body: JSON.stringify({ p_endpoint: ep }) });
        });
      });
  }
  function resavePrefs() {
    store("tt_prefs", JSON.stringify(S.prefs));
    if (pushState() !== "on") return;
    navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); })
      .then(function (sub) { if (sub) return saveSub(sub); })
      .then(function () { toast("บันทึกแล้ว"); })
      .catch(function () { toast("บันทึกไม่สำเร็จ ตรวจสอบอินเทอร์เน็ต"); });
  }

  // ---------------- ทดสอบการแจ้งเตือน ----------------
  function callTest(sub, delay, retried) {
    return fetch(C.url + "/functions/v1/" + (C.pushFn || "class-push") + "?test=1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint, delay: delay })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { j._http = r.status; return j; });
    }).then(function (j) {
      if (j._http === 404 && j.error === "not_registered" && !retried) {
        return saveSub(sub).then(function () { return callTest(sub, delay, true); });
      }
      return j;
    });
  }
  function testPush(delay) {
    if (pushState() !== "on") { toast("เปิดการแจ้งเตือนก่อนนะ"); return; }
    toast(delay ? "กำลังส่ง…" : "กำลังทดสอบ…", 8000);
    navigator.serviceWorker.ready.then(function (reg) {
      if (!delay) {
        reg.showNotification("ทดลองแจ้งเตือน (ในเครื่อง)", {
          body: "ถ้าเห็นข้อความนี้ แปลว่าเครื่องอนุญาตการแจ้งเตือนแล้ว", icon: "icon-192.png", tag: "local-test"
        }).catch(function () {});
      }
      return reg.pushManager.getSubscription();
    }).then(function (sub) {
      if (!sub) throw new Error("nosub");
      return callTest(sub, delay);
    }).then(function (j) {
      var msg;
      if (j.ok && delay) msg = "ส่งแล้ว! ล็อกจอได้เลย ภายใน " + delay + " วินาทีจะมีแจ้งเตือนเด้ง";
      else if (j.ok) msg = "เซิร์ฟเวอร์ส่งแจ้งเตือนสำเร็จ ✅";
      else if (j._http === 401) msg = "เซิร์ฟเวอร์ยังตั้งค่าไม่ครบ (แอดมิน: ปิด Verify JWT ของ class-push)";
      else if (j._http === 404 && j.error !== "not_registered") msg = "ยังไม่มีตัวส่งแจ้งเตือนบนเซิร์ฟเวอร์ (แอดมิน: สร้าง function class-push)";
      else if (j.status === 403 || j.status === 400) msg = "คีย์แจ้งเตือนไม่ตรงกัน ลองปิดแล้วเปิดการแจ้งเตือนใหม่";
      else if (j.status === 404 || j.status === 410) msg = "การลงทะเบียนหมดอายุ ลองปิดแล้วเปิดการแจ้งเตือนใหม่";
      else msg = "ส่งไม่สำเร็จ (" + (j.status || j._http) + ") " + (j.error || "");
      toast(msg, 6000);
    }).catch(function (e) {
      if (e && e.message === "nosub") { toast("ยังไม่ได้ลงทะเบียน ลองปิดแล้วเปิดการแจ้งเตือนใหม่", 6000); return; }
      // เช็กว่าเน็ตปกติไหม ถ้าปกติแปลว่าตัวส่งแจ้งเตือนบนเซิร์ฟเวอร์ยังตั้งค่าไม่ครบ
      api("/rest/v1/config?select=id").then(function () {
        toast("อินเทอร์เน็ตปกติ แต่เรียกตัวส่งแจ้งเตือนไม่ได้ · แอดมิน: ปิด Verify JWT ของ class-push ใน Supabase แล้ว Deploy ใหม่", 9000);
      }).catch(function () {
        toast("ติดต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ต", 6000);
      });
    });
  }

  // ---------------- ตั้งค่า ----------------
  function renderSettings() {
    var cfg = S.cfg, ps = pushState();
    var h = '<div class="row sub-top"><button class="icon-btn" data-back>' + IC.back + '</button><div class="t" style="margin-left:4px">ตั้งค่า</div></div>';
    h += '<div class="section">การแจ้งเตือน</div>';
    if (ps === "install") {
      h += '<div class="card"><div style="padding:14px 16px 4px" class="b">เพิ่มแอปไปที่หน้าจอโฮมก่อน</div>' +
        '<ol class="steps"><li>เปิดหน้านี้ใน <b>Safari</b></li><li>กดปุ่ม <b>แชร์</b> (สี่เหลี่ยมมีลูกศรชี้ขึ้น)</li>' +
        '<li>เลือก <b>เพิ่มไปยังหน้าจอโฮม</b> แล้วกด <b>เพิ่ม</b></li><li>เปิดแอปจากไอคอนบนหน้าจอโฮม แล้วกลับมาที่หน้านี้เพื่อเปิดการแจ้งเตือน</li></ol>' +
        '<div class="small muted" style="padding:0 16px 14px">ต้องเป็น iOS / iPadOS 16.4 ขึ้นไป</div></div>';
    } else if (ps === "unsupported") {
      h += '<div class="card"><div style="padding:16px" class="muted">เบราว์เซอร์นี้ยังไม่รองรับการแจ้งเตือน ถ้าเป็น iPhone ให้อัปเดตเป็น iOS 16.4 ขึ้นไป แล้วเปิดผ่าน Safari</div></div>';
    } else {
      h += '<div class="card">' +
        '<div class="lrow"><div class="grow"><div>เปิดการแจ้งเตือน</div><div class="small muted">เตือนตามตารางเรียน ยกเว้นวันหยุด</div></div>' +
        '<label class="switch"><input type="checkbox" id="sw-push"' + (ps === "on" ? " checked" : "") + '><span></span></label></div>' +
        '<div class="lrow"><div class="grow">เตือนล่วงหน้า</div><select id="sel-lead">' + [0, 5, 10, 15, 20, 30].map(function (v) {
          return '<option value="' + v + '"' + (v === S.prefs.lead ? " selected" : "") + '>' + (v ? v + " นาที" : "ไม่เตือน") + '</option>';
        }).join("") + '</select></div>' +
        '<div class="lrow"><div class="grow"><div>เตือนอีกครั้งตอนเริ่มคาบ</div></div><label class="switch"><input type="checkbox" id="sw-start"' + (S.prefs.atStart ? " checked" : "") + '><span></span></label></div>' +
        '<div class="lrow"><div class="grow"><div>แจ้งเตือนกิจกรรมใหม่</div><div class="small muted">เมื่อแอดมินโพสต์รูปหรือวิดีโอ</div></div><label class="switch"><input type="checkbox" id="sw-posts"' + (S.prefs.posts ? " checked" : "") + '><span></span></label></div>' +
        '<div class="lrow"><div class="grow"><div>เตือนของที่ต้องเตรียม</div><div class="small muted">20:00 น. ก่อนวันที่ต้องเตรียมของ</div></div><label class="switch"><input type="checkbox" id="sw-prep"' + (S.prefs.prep ? " checked" : "") + '><span></span></label></div>' +
        '<button class="lrow" id="btn-test"><div class="grow"><div>ทดลองแจ้งเตือนตอนนี้</div><div class="small muted">เช็กว่าเครื่องและเซิร์ฟเวอร์ส่งได้</div></div><div class="val">ลองเลย</div></button>' +
        '<button class="lrow" id="btn-test-lock"><div class="grow"><div>ทดลองตอนล็อกจอ</div><div class="small muted">กดแล้วล็อกจอทันที ภายใน 10 วินาทีจะเด้ง</div></div><div class="val">ส่งใน 10 วิ</div></button>' +
        '</div><div class="small muted" style="margin:8px 4px 0">แจ้งเตือนส่งจากเซิร์ฟเวอร์ อาจช้ากว่ากำหนดได้ไม่เกินประมาณ 1 นาที · เสียงแจ้งเตือนเป็นเสียงมาตรฐานของเครื่อง</div>';
    }
    var t = dayStart(new Date());
    var up = cfg.holidays.filter(function (x) { return x.end >= t; }).sort(function (a, b) { return a.start - b.start; });
    var skin = store("tt_skin") === "glass" ? "glass" : "normal";
    h += '<div class="section">การตกแต่ง</div><div class="card"><div class="lrow"><div class="grow">รูปแบบ</div>' +
      '<div class="seg"><button data-skin="normal" class="' + (skin === "normal" ? "on" : "") + '">ปกติ</button>' +
      '<button data-skin="glass" class="' + (skin === "glass" ? "on" : "") + '">กระจก</button></div></div></div>' +
      '<div class="small muted" style="margin:8px 4px 0">แบบกระจกโปร่งใส สีสันนุ่มนวล ใช้แรงเครื่องมากกว่าเล็กน้อย เหมาะกับเครื่องกลาง-แรง</div>';
    h += '<div class="section">ข้อมูลจากแอดมิน</div><div class="card">' +
      '<button class="lrow" id="btn-sync"><div class="grow">อัปเดตข้อมูลตอนนี้</div><div class="val">' + (S.offline ? "ออฟไลน์" : "อัปเดต") + '</div></button>' +
      '<div class="lrow"><div class="grow">ภาคเรียน</div><div class="val">' + dShort(cfg.termStart) + " – " + dShort(cfg.termEnd) + '</div></div></div>';
    h += '<div class="section">วันหยุดที่จะถึง</div><div class="card">' + (up.length ? up.map(function (x) {
      var n = Math.round((x.end - x.start) / 86400000) + 1;
      return '<div class="lrow"><div class="grow"><div class="b ellipsis">' + esc(x.name) + '</div><div class="small muted">' +
        (n > 1 ? dShort(x.start) + " – " + dShort(x.end) + " · " + n + " วัน" : dWithDay(x.start)) + '</div></div>' +
        (x.start <= t ? '<span class="pill" style="background:var(--danger-soft);color:var(--danger)">ตอนนี้</span>' : '') + '</div>';
    }).join("") : '<div class="lrow muted">ไม่มีวันหยุดที่จะถึง</div>') + '</div>';
    h += '<div class="section">เกี่ยวกับ</div><div class="card"><div class="lrow"><div class="grow">ตารางเรียน ' + esc(cfg.level) + '</div><div class="val">เว็บแอป</div></div>' +
      '<div class="lrow"><div class="grow">' + esc(cfg.school) + '</div><div class="val">ภาคเรียนที่ ' + esc(cfg.term + "/" + cfg.year) + '</div></div>' +
      '<div class="lrow"><div class="grow">รหัสเครื่องนี้</div><div class="val">' + shortCode() + '</div></div></div>' +
      '<div class="small muted" style="margin:8px 4px 0">แอดมินแก้ไขข้อมูลได้จากแอป Android</div>';
    app.innerHTML = '<div class="fade">' + h + '</div>';

    var sw = document.getElementById("sw-push");
    if (sw) sw.onchange = function () {
      sw.disabled = true;
      (sw.checked ? enablePush() : disablePush()).then(function () {
        toast(sw.checked ? "เปิดการแจ้งเตือนแล้ว" : "ปิดการแจ้งเตือนแล้ว");
      }).catch(function (e) {
        sw.checked = !sw.checked;
        toast(e && e.message ? e.message : "ทำไม่สำเร็จ");
      }).then(function () { sw.disabled = false; });
    };
    var sel = document.getElementById("sel-lead");
    if (sel) sel.onchange = function () { S.prefs.lead = +sel.value; resavePrefs(); };
    var st = document.getElementById("sw-start");
    if (st) st.onchange = function () { S.prefs.atStart = st.checked; resavePrefs(); };
    var sp = document.getElementById("sw-posts");
    if (sp) sp.onchange = function () { S.prefs.posts = sp.checked; resavePrefs(); };
    var spp = document.getElementById("sw-prep");
    if (spp) spp.onchange = function () { S.prefs.prep = spp.checked; resavePrefs(); };
    var bt = document.getElementById("btn-test");
    if (bt) bt.onclick = function () { testPush(0); };
    var btl = document.getElementById("btn-test-lock");
    if (btl) btl.onclick = function () { testPush(10); };
    Array.prototype.forEach.call(document.querySelectorAll("[data-skin]"), function (b) {
      if (b.tagName !== "BUTTON") return;
      b.onclick = function () {
        var v = b.getAttribute("data-skin");
        store("tt_skin", v);
        applySkin(v);
        renderSettings();
      };
    });
    document.getElementById("btn-sync").onclick = function () {
      toast("กำลังอัปเดต…");
      sync().then(function (ok) { toast(ok ? "อัปเดตแล้ว" : "อัปเดตไม่ได้ ตรวจสอบอินเทอร์เน็ต"); render(); });
    };
  }

  // ---------------- เปลี่ยนหน้า ----------------
  function render() {
    var hsh = location.hash;
    var m = /^#d\/(\d)\/(\d+)(?:\/(\d{4}-\d{2}-\d{2}))?$/.exec(hsh);
    if (hsh !== "" && hsh !== "#") clearInterval(slideTimer);
    if (m) renderDetail(+m[1], +m[2], m[3]);
    else if (hsh === "#feed") renderFeed();
    else if (hsh === "#settings") renderSettings();
    else renderHome();
  }

  document.addEventListener("click", function (e) {
    if (suppressClick) { suppressClick = false; e.preventDefault(); e.stopPropagation(); return; }
    var rb = e.target.closest("[data-react]");
    if (rb) { toggleReact(rb.getAttribute("data-react"), rb.getAttribute("data-emoji")); return; }
    var el = e.target.closest("[data-media]");
    if (el) { var p = postById(el.getAttribute("data-media")); if (p && p.media_url) { openViewer(p); return; } }
    var dayBtn = e.target.closest("[data-day]");
    if (dayBtn) {
      S.day = +dayBtn.getAttribute("data-day");
      Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (c) {
        c.classList.toggle("sel", +c.getAttribute("data-day") === S.day);
      });
      var list = document.getElementById("list");
      list.innerHTML = listHtml();
      list.classList.remove("fade"); void list.offsetWidth; list.classList.add("fade");
      return;
    }
    if (e.target.closest("[data-back]")) {
      location.hash = "";
      return;
    }
    var go = e.target.closest("[data-go]");
    if (go) {
      location.hash = go.getAttribute("data-go");
    }
  });
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });
  document.addEventListener("pointerdown", function (e) { if (!e.target.closest("#hero")) suppressClick = false; }, true);

  // เปิดจากการแจ้งเตือน (?d=วัน&f=คาบ หรือ ?feed)
  (function () {
    var q = new URLSearchParams(location.search);
    if (q.get("d") && q.get("f")) location.hash = "#d/" + q.get("d") + "/" + q.get("f") + (q.get("dt") ? "/" + q.get("dt") : "");
    else if (q.has("feed")) location.hash = "#feed";
    if (location.search) history.replaceState(null, "", location.pathname + location.hash);
  })();

  // ---------------- รายงานตัวเครื่อง (ไม่มีข้อมูลส่วนตัว) ----------------
  function shortCode() { return deviceId().replace(/-/g, "").slice(0, 4).toUpperCase(); }
  function deviceInfo() {
    var ua = navigator.userAgent || "";
    var ios = isIOS(), android = /Android/i.test(ua);
    var model = /iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ? "iPad" : /iPhone/.test(ua) ? "iPhone" : android ? "Android" : "คอมพิวเตอร์";
    var os = "";
    var m1 = /OS (\d+)[_.](\d+)/.exec(ua);
    var m2 = /Android (\d+(?:\.\d+)?)/.exec(ua);
    if (ios && m1) os = (model === "iPad" ? "iPadOS " : "iOS ") + m1[1] + "." + m1[2];
    else if (ios) os = "iOS";
    else if (m2) os = "Android " + m2[1];
    else os = /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "macOS" : "อื่นๆ";
    return { platform: ios ? "ios-web" : android ? "android-web" : "web", model: model, os: os };
  }
  function pingDevice() {
    if (!C.url) return;
    var last = +(store("tt_ping") || 0);
    if (Date.now() - last < 3 * 3600000) return;
    var d = deviceInfo();
    var info = {
      push: pushState(), standalone: isStandalone(), lead: S.prefs.lead, at_start: !!S.prefs.atStart,
      posts: !!S.prefs.posts, prep: !!S.prefs.prep, skin: store("tt_skin") || "normal",
      mascot: store("tt_hero") === "mascot", onboarded: store("tt_onb") === "1"
    };
    api("/rest/v1/rpc/ping_device", {
      method: "POST",
      body: JSON.stringify({ p_id: deviceId(), p_platform: d.platform, p_version: WEB_VERSION, p_model: d.model, p_os: d.os, p_info: info })
    }).then(function () { store("tt_ping", String(Date.now())); }).catch(function () {});
  }

  // ---------------- เปิดครั้งแรก ----------------
  function showOnboarding() {
    if (store("tt_onb") === "1" || document.querySelector(".onb")) return;
    var m = window.Mascot ? new window.Mascot() : null;
    var ov = document.createElement("div");
    ov.className = "onb";
    function close() { store("tt_onb", "1"); ov.remove(); render(); }
    function draw() {
      var ps = pushState(), body, btns;
      if (ps === "install") {
        if (m) m.setMood("morning");
        body = '<h2>สวัสดี! เราคือน้องติ๊ก</h2><p>จะคอยบอกว่าตอนนี้เรียนวิชาอะไร และเตือนก่อนเข้าเรียนให้นะ</p>' +
          '<div class="card" style="text-align:left"><ol class="steps"><li>กดปุ่ม <b>แชร์</b> ⬆️ ของ Safari</li><li>เลือก <b>เพิ่มไปยังหน้าจอโฮม</b> → <b>เพิ่ม</b></li>' +
          '<li>เปิดแอป <b>ตารางเรียน</b> จากไอคอนบนหน้าจอโฮม</li><li>กด ⚙️ แล้วเปิดการแจ้งเตือน</li></ol></div>';
        btns = '<button class="btn" data-onb="close">เข้าใจแล้ว</button>';
      } else if (ps === "off") {
        if (m) m.setMood("study");
        body = '<h2>เปิดการแจ้งเตือนกันเถอะ</h2><p>จะได้เตือนก่อนเรียน ' + S.prefs.lead + ' นาที และตอนเริ่มคาบ แม้ล็อกจออยู่</p>';
        btns = '<button class="btn" data-onb="enable">เปิดการแจ้งเตือน</button><button class="btn soft" data-onb="close" style="margin-top:8px">ไว้ทีหลัง</button>';
      } else if (ps === "on") {
        if (m) m.setMood("bye");
        body = '<h2>พร้อมแล้ว!</h2><p>ลองกดทดสอบดูว่าแจ้งเตือนเด้งไหม</p>';
        btns = '<button class="btn soft" data-onb="test">🔔 ลองแจ้งเตือน</button><button class="btn" data-onb="close" style="margin-top:8px">เริ่มใช้งาน</button>';
      } else {
        if (m) m.setMood("morning");
        body = '<h2>สวัสดี! เราคือน้องติ๊ก</h2><p>เครื่องนี้ยังไม่รองรับการแจ้งเตือน แต่ดูตารางเรียนได้ตามปกติ</p>';
        btns = '<button class="btn" data-onb="close">เริ่มใช้งาน</button>';
      }
      ov.innerHTML = '<div class="onb-card"><div class="onb-m"></div>' + body + btns + '</div>';
      if (m) ov.querySelector(".onb-m").appendChild(m.canvas);
    }
    ov.addEventListener("click", function (e) {
      var b = e.target.closest("[data-onb]");
      if (!b) return;
      e.stopPropagation();
      var a = b.getAttribute("data-onb");
      if (a === "close") close();
      else if (a === "test") testPush(0);
      else if (a === "enable") enablePush().then(function () { toast("เปิดการแจ้งเตือนแล้ว"); draw(); }).catch(function (er) { toast(er && er.message ? er.message : "ทำไม่สำเร็จ", 5000); });
    });
    draw();
    document.body.appendChild(ov);
  }

  render();
  showOnboarding();
  sync().then(function () { render(); pingDevice(); });

  // รีเฟรชทุก 30 วินาที (เวลาคาบ) และดึงข้อมูลใหม่ทุกครั้งที่กลับมาเปิดแอป
  setInterval(function () { if (!location.hash || location.hash === "#") renderHome(); }, 30000);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) sync().then(function () { if (!document.getElementById("note")) render(); });
  });

  // ตัวช่วยออฟไลน์ + อัปเดตแอปอัตโนมัติ
  if ("serviceWorker" in navigator) {
    var hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (reg) {
      reg.update();
      document.addEventListener("visibilitychange", function () { if (!document.hidden) reg.update(); });
    }).catch(function () {});
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (hadController && !document.getElementById("note")) location.reload();
      hadController = true;
    });
  }
})();
