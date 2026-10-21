/* ตารางเรียน · เว็บแอปสำหรับ iPhone / iPad (ใช้ข้อมูลชุดเดียวกับแอป Android) */
(function () {
  "use strict";
  var C = window.TT_CONFIG || {};
  var app = document.getElementById("app");

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
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
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
    function str(k) { return (o[k] && String(o[k]).trim()) || d[k]; }
    return {
      school: str("school"), level: str("level"), room: str("room"), year: str("year"), term: str("term"),
      termStart: parseDate(o.termStart) || parseDate(d.termStart),
      termEnd: parseDate(o.termEnd) || parseDate(d.termEnd),
      periods: periods, cells: cells, holidays: hol
    };
  }

  /** รวมคาบติดกันที่เป็นวิชาเดียวกัน */
  function buildBlocks(cfg) {
    var out = [];
    for (var day = 1; day <= 5; day++) {
      var row = cfg.cells[day - 1], list = [], i = 0;
      while (i < row.length) {
        var x = row[i];
        if (!x) { i++; continue; }
        var j = i;
        while (j + 1 < row.length && row[j + 1] && JSON.stringify(row[j + 1]) === JSON.stringify(x)) j++;
        list.push({
          day: day, from: i + 1, to: j + 1, code: x.code, name: x.name, teacher: x.teacher, room: x.room,
          lunch: x.lunch, start: cfg.periods[i].start, end: cfg.periods[j].end,
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
    S.blocks = buildBlocks(S.cfg);
  }
  try { setConfig(JSON.parse(store("tt_cfg") || "null")); } catch (e) { setConfig(null); }
  try { S.posts = JSON.parse(store("tt_posts") || "[]"); } catch (e) { S.posts = []; }
  var td = dow(new Date());
  S.day = td <= 5 ? td : 1;

  function blocks(day) { return (S.blocks && S.blocks[day - 1]) || []; }
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
  function current(now) {
    if (dayOff(dayStart(now))) return null;
    var m = minsOf(now);
    return blocks(dow(now)).filter(function (b) { return m >= b.start && m < b.end; })[0] || null;
  }
  function nextClass(now) {
    var base = dayStart(now);
    for (var i = 0; i < 400; i++) {
      var d = addDays(base, i);
      if (dayOff(d)) continue;
      var list = blocks(dow(d));
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
    return Promise.all([a, b]).then(function () { S.offline = false; return true; })
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

    h += '<div class="hero"' + (target ? ' data-go="#d/' + target.day + '/' + target.from + '"' : '') + '>' +
      '<div class="row"><div class="grow soft small">' + DAY_FULL[dow(today)] + " " + dLong(today) + '</div>' +
      (target ? '<span style="width:10px;height:10px;border-radius:50%;background:' + color(target.code) + '"></span>' : '') + '</div>' +
      '<span class="pill">' + esc(tag) + '</span><h2 class="clamp2">' + esc(title) + '</h2>' +
      (sub ? '<div class="soft">' + esc(sub) + '</div>' : '') +
      (when ? '<div class="b" style="margin-top:10px">' + esc(when) + '</div>' : '') +
      (prog >= 0 ? '<div class="bar"><i style="width:' + Math.max(2, Math.min(100, prog * 100)) + '%"></i></div>' : '') + '</div>';

    h += statusHtml();

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
      var k = i + 1, o = dayOff(d);
      return '<button class="chip' + (k === S.day ? " sel" : "") + (sameDay(d, today) ? " today" : "") + '" data-day="' + k + '">' +
        '<div class="d">' + DAY_SHORT[k] + '</div><div class="n' + (o ? " off" : "") + '">' + (o ? "หยุด" : d.getDate()) + '</div></button>';
    }).join("") + '</div>';
    h += '<div id="list">' + listHtml() + '</div>';

    var keep = document.getElementById("slider");
    var keepLeft = keep ? keep.scrollLeft : 0;
    app.innerHTML = h;
    var sl = document.getElementById("slider");
    if (sl) sl.scrollLeft = keepLeft;
    bindSlider();
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
    var off = dayOff(date), list = blocks(S.day);
    var h = '<div class="row list-head"><div class="grow b" style="font-size:18px">' + DAY_FULL[S.day] + " " + dShort(date) + '</div>';
    if (list.length) h += '<div class="small muted">' + list.filter(function (b) { return !b.lunch; }).length + " วิชา · " + hm(list[0].start) + "–" + hm(list[list.length - 1].end) + '</div>';
    h += '</div>';
    if (off) h += '<div class="banner"><div class="b">วันหยุด · ' + esc(off) + '</div><div class="small muted">วันนี้จะไม่มีการแจ้งเตือน</div></div>';
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
      h += '<button class="cls' + (st === 1 ? " now" : "") + (dim ? " past" : "") + '" data-go="#d/' + b.day + '/' + b.from + '">' +
        '<div class="time"><div class="s">' + hm(b.start) + '</div><div class="e">' + hm(b.end) + '</div></div>' +
        '<div class="vbar" style="background:' + color(b.code) + '"></div>' +
        '<div class="grow"><div class="b ellipsis" style="font-size:16px">' + esc(b.title) + '</div>' +
        '<div class="small muted ellipsis">' + esc(line2) + '</div>' +
        (b.teacher ? '<div class="small muted ellipsis">' + esc(b.teacher) + '</div>' : '') + '</div>' +
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
  function renderDetail(day, from) {
    var b = blocks(day).filter(function (x) { return x.from === from; })[0];
    if (!b) { location.hash = ""; return; }
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
      '<div class="tile"><div class="small muted">เวลา</div><div class="v">' + hm(b.start) + "–" + hm(b.end) + '</div></div>' +
      '<div class="tile"><div class="small muted">ห้องเรียน</div><div class="v">' + esc(b.room || "-") + '</div></div>' +
      '<div class="tile"><div class="small muted">คาบที่</div><div class="v">' + b.label + '</div></div></div>';
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
        (p.media_url ? '<div data-post="' + p.id + '">' + mediaHtml(p, 260) + '</div>' : '') + '</div>';
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
    return api("/rest/v1/rpc/save_push_sub", {
      method: "POST",
      body: JSON.stringify({
        p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth,
        p_lead: S.prefs.lead, p_at_start: !!S.prefs.atStart, p_posts: !!S.prefs.posts
      })
    });
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
        '</div><div class="small muted" style="margin:8px 4px 0">แจ้งเตือนส่งจากเซิร์ฟเวอร์ อาจช้ากว่ากำหนดได้ไม่เกินประมาณ 1 นาที</div>';
    }
    var t = dayStart(new Date());
    var up = cfg.holidays.filter(function (x) { return x.end >= t; }).sort(function (a, b) { return a.start - b.start; });
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
      '<div class="lrow"><div class="grow">' + esc(cfg.school) + '</div><div class="val">ภาคเรียนที่ ' + esc(cfg.term + "/" + cfg.year) + '</div></div></div>' +
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
    document.getElementById("btn-sync").onclick = function () {
      toast("กำลังอัปเดต…");
      sync().then(function (ok) { toast(ok ? "อัปเดตแล้ว" : "อัปเดตไม่ได้ ตรวจสอบอินเทอร์เน็ต"); render(); });
    };
  }

  // ---------------- เปลี่ยนหน้า ----------------
  function render() {
    var hsh = location.hash;
    var m = /^#d\/(\d)\/(\d+)$/.exec(hsh);
    if (hsh !== "" && hsh !== "#") clearInterval(slideTimer);
    if (m) renderDetail(+m[1], +m[2]);
    else if (hsh === "#feed") renderFeed();
    else if (hsh === "#settings") renderSettings();
    else renderHome();
  }

  document.addEventListener("click", function (e) {
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

  // เปิดจากการแจ้งเตือน (?d=วัน&f=คาบ หรือ ?feed)
  (function () {
    var q = new URLSearchParams(location.search);
    if (q.get("d") && q.get("f")) location.hash = "#d/" + q.get("d") + "/" + q.get("f");
    else if (q.has("feed")) location.hash = "#feed";
    if (location.search) history.replaceState(null, "", location.pathname + location.hash);
  })();

  render();
  sync().then(function () { render(); });

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
