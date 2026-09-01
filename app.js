(function () {
  "use strict";

  var LS_KEY = "sportbibi_v1";
  var LS_THEME = "sportbibi_theme";
  var WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  var WEEKDAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  var MONTHS_SHORT = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];
  var FEELINGS = [
    { v: 1, e: "😩", l: "Galère" },
    { v: 2, e: "😕", l: "Bof" },
    { v: 3, e: "🙂", l: "Ça va" },
    { v: 4, e: "💪", l: "Bien" },
    { v: 5, e: "🔥", l: "Au top" }
  ];

  var ACTIVITES_DEFAULT = [
    { id: "corde", nom: "Corde à sauter", emoji: "🪢", couleur: "#ef4f2b", unite: "min" },
    { id: "pilates", nom: "Pilates", emoji: "🤸", couleur: "#0f7f6b", unite: "min" },
    { id: "running", nom: "Running", emoji: "🏃", couleur: "#e08a1e", unite: "km" },
    { id: "muscu", nom: "Muscu", emoji: "🏋️", couleur: "#4f63d2", unite: "min" },
    { id: "yoga", nom: "Yoga", emoji: "🧘", couleur: "#b063cf", unite: "min" },
    { id: "velo", nom: "Vélo", emoji: "🚴", couleur: "#1f9bbd", unite: "km" },
    { id: "marche", nom: "Marche", emoji: "🚶", couleur: "#7d8471", unite: "min" },
    { id: "natation", nom: "Natation", emoji: "🏊", couleur: "#2f7fd4", unite: "min" }
  ];
  var PALETTE = ["#ef4f2b", "#0f7f6b", "#e08a1e", "#4f63d2", "#b063cf", "#1f9bbd", "#7d8471", "#2f7fd4"];
  var UNITES = { min: "min", km: "km" };

  var PACKS = [
    {
      id: "doux", emoji: "🌿", nom: "Tout en douceur", desc: "3 séances par semaine, sans se mettre la pression.",
      creneaux: [[0, "pilates", 30], [2, "marche", 40], [5, "yoga", 30]]
    },
    {
      id: "equilibre", emoji: "⚖️", nom: "Équilibré", desc: "4 séances : du cardio, du renfo, du souffle.",
      creneaux: [[0, "corde", 15], [1, "pilates", 30], [3, "running", 5], [5, "muscu", 45]]
    },
    {
      id: "intense", emoji: "🔥", nom: "Ça pousse", desc: "6 séances par semaine, rythme soutenu.",
      creneaux: [[0, "muscu", 45], [1, "running", 5], [2, "pilates", 30], [4, "muscu", 45], [5, "running", 8], [6, "yoga", 30]]
    }
  ];

  // ---------- icônes (SVG inline, stroke = currentColor) ----------
  var P = {
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    dumbbell: '<path d="M6.5 8v8M3.5 10.5v3M17.5 8v8M20.5 10.5v3M6.5 12h11"/>',
    pencil: '<path d="M4 20.5h4L19 9.5a2.1 2.1 0 0 0-3-3L5 17.5v3Z"/><path d="M14.5 8 16 9.5"/>',
    sliders: '<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2.2"/><circle cx="15.5" cy="12" r="2.2"/><circle cx="8" cy="17" r="2.2"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    left: '<path d="M14.5 18 8.5 12l6-6"/>',
    right: '<path d="M9.5 6 15.5 12l-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m20 6.5-10.5 11L4 12"/>',
    trash: '<path d="M3.5 6.5h17M9 6.5V4.8A1.3 1.3 0 0 1 10.3 3.5h3.4A1.3 1.3 0 0 1 15 4.8v1.7M18.5 6.5l-.9 13a2 2 0 0 1-2 1.9H8.4a2 2 0 0 1-2-1.9l-.9-13"/>',
    flame: '<path d="M12 2.5s5 4.4 5 9.2a5 5 0 0 1-10 0c0-1.6.5-2.9 1.3-3.9.4 1.3 1.3 2.1 2.4 2.3-.4-3.2 1.3-5.6 1.3-7.6Z"/>',
    clock: '<circle cx="12" cy="12" r="8.7"/><path d="M12 7v5.2l3.2 1.9"/>',
    target: '<circle cx="12" cy="12" r="8.7"/><circle cx="12" cy="12" r="3.6"/>',
    chart: '<path d="M4.5 20.5V12M10 20.5V4.5M15.5 20.5v-6M21 20.5V9"/>',
    down: '<path d="M12 3.5v12M7.5 11.5 12 16l4.5-4.5M4 20.5h16"/>',
    up: '<path d="M12 16.5v-12M7.5 8.5 12 4l4.5 4.5M4 20.5h16"/>',
    undo: '<path d="M4 8h10.5a5.2 5.2 0 0 1 0 10.4H7"/><path d="m8 4-4 4 4 4"/>',
    spark: '<path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7L4.5 10.9 10.1 9 12 3.5Z"/>'
  };
  function ic(name, cls) {
    return '<svg class="ico' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + P[name] + "</svg>";
  }

  // ---------- state ----------
  var state = load();
  state.tab = "semaine";
  state.weekOffset = 0;
  state.modal = null;
  state.openDay = null; // iso du jour déplié dans l'onglet Semaine

  function load() {
    var d = null;
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) d = JSON.parse(raw);
    } catch (e) {}
    if (!d || typeof d !== "object") d = {};
    if (!Array.isArray(d.activites) || !d.activites.length) d.activites = ACTIVITES_DEFAULT.slice();
    if (!Array.isArray(d.programme)) d.programme = [];
    if (!Array.isArray(d.journal)) d.journal = [];
    d.onboarded = !!d.onboarded || d.programme.length > 0 || d.journal.length > 0;
    return d;
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify({
      activites: state.activites, programme: state.programme, journal: state.journal, onboarded: state.onboarded
    }));
  }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  // ---------- thème ----------
  function getTheme() { try { return localStorage.getItem(LS_THEME) || "auto"; } catch (e) { return "auto"; } }
  function applyTheme(t) {
    var root = document.documentElement;
    if (t === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", t);
    var dark = t === "dark" || (t === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#131110" : "#faf7f3");
  }
  function setTheme(t) { try { localStorage.setItem(LS_THEME, t); } catch (e) {} applyTheme(t); }

  // ---------- dates ----------
  function stripTime(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function todayDate() { return stripTime(new Date()); }
  function iso(d) {
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function todayISO() { return iso(todayDate()); }
  function parseISO(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function getMonday(d) {
    var x = stripTime(d), day = x.getDay();
    x.setDate(x.getDate() + (day === 0 ? -6 : 1 - day));
    return x;
  }
  function weekDates(offset) {
    var mon = getMonday(todayDate());
    mon.setDate(mon.getDate() + offset * 7);
    var arr = [];
    for (var i = 0; i < 7; i++) { var d = new Date(mon); d.setDate(mon.getDate() + i); arr.push(d); }
    return arr;
  }
  function dLabel(d) { return d.getDate() + " " + MONTHS_SHORT[d.getMonth()]; }
  function jourIdx(d) { return (d.getDay() + 6) % 7; }
  function isToday(d) { return iso(d) === todayISO(); }

  // ---------- helpers ----------
  function activiteById(id) {
    for (var i = 0; i < state.activites.length; i++) if (state.activites[i].id === id) return state.activites[i];
    return null;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtVal(v, unite) {
    if (v == null || v === "") return "";
    var n = Number(v);
    if (isNaN(n)) return String(v);
    return (Number.isInteger(n) ? n : Math.round(n * 10) / 10) + " " + (UNITES[unite] || unite || "");
  }
  function feelOf(v) { for (var i = 0; i < FEELINGS.length; i++) if (FEELINGS[i].v === v) return FEELINGS[i]; return null; }
  function creneauxDuJour(idx) { return state.programme.filter(function (c) { return c.jour === idx; }); }
  function creneauxLibres() { return state.programme.filter(function (c) { return c.jour === null; }); }
  function journalForDay(dateObj) {
    var s = iso(dateObj);
    return state.journal.filter(function (e) { return e.date === s; });
  }

  /* Associe chaque créneau du jour à au plus une entrée de journal.
     Priorité au lien explicite (creneauId), puis à une entrée libre de même activité.
     Une entrée ne peut être consommée que par un seul créneau. */
  function dayMatch(dateObj) {
    var entries = journalForDay(dateObj);
    var used = {};
    var byCreneau = {};
    var cx = creneauxDuJour(jourIdx(dateObj));
    cx.forEach(function (c) {
      for (var i = 0; i < entries.length; i++) {
        if (!used[entries[i].id] && entries[i].creneauId === c.id) { byCreneau[c.id] = entries[i]; used[entries[i].id] = 1; return; }
      }
    });
    cx.forEach(function (c) {
      if (byCreneau[c.id]) return;
      for (var i = 0; i < entries.length; i++) {
        if (!used[entries[i].id] && !entries[i].creneauId && entries[i].activiteId === c.activiteId) {
          byCreneau[c.id] = entries[i]; used[entries[i].id] = 1; return;
        }
      }
    });
    var extras = entries.filter(function (e) { return !used[e.id]; });
    return { creneaux: cx, byCreneau: byCreneau, extras: extras };
  }

  function computeStreak() {
    var streak = 0, d = todayDate();
    if (!journalForDay(d).length) d.setDate(d.getDate() - 1);
    while (journalForDay(d).length) { streak++; d.setDate(d.getDate() - 1); }
    return streak;
  }

  function weekSummary(dates) {
    var planned = 0, done = 0, minutes = 0, km = 0, sessions = 0;
    dates.forEach(function (d) {
      var m = dayMatch(d);
      planned += m.creneaux.length;
      m.creneaux.forEach(function (c) { if (m.byCreneau[c.id]) done++; });
      journalForDay(d).forEach(function (e) {
        sessions++;
        var a = activiteById(e.activiteId);
        if (a && a.unite === "km") km += Number(e.valeur) || 0;
        else minutes += Number(e.valeur) || 0;
      });
    });
    return { planned: planned, done: done, minutes: Math.round(minutes), km: Math.round(km * 10) / 10, sessions: sessions };
  }

  // ---------- toast (avec action optionnelle) ----------
  var toastTimer = null, toastCb = null;
  function toast(msg, actionLabel, cb) {
    var old = document.getElementById("toast");
    if (old) old.remove();
    toastCb = cb || null;
    var el = document.createElement("div");
    el.id = "toast"; el.className = "toast";
    el.innerHTML = '<span>' + esc(msg) + "</span>" +
      (actionLabel ? '<button type="button" data-action="toast-action">' + esc(actionLabel) + "</button>" : "");
    document.body.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 220);
      toastCb = null;
    }, actionLabel ? 5000 : 2400);
  }

  // ---------- render ----------
  function R() {
    var app = document.getElementById("app");
    app.innerHTML = topbarHTML() + contentHTML();
    var nav = document.getElementById("nav");
    nav.innerHTML = tabbarHTML();
    var host = document.getElementById("modal-host");
    host.innerHTML = state.modal ? modalHTML() : "";
    document.body.classList.toggle("sheet-open", !!state.modal);
  }

  function topbarHTML() {
    var t = todayDate();
    var titles = { semaine: "Ma semaine", programme: "Mon programme", journal: "Mon journal" };
    var subs = {
      semaine: cap(WEEKDAYS[jourIdx(t)]) + " " + dLabel(t),
      programme: "Tes séances types, semaine après semaine",
      journal: "Tout ce que tu as vraiment fait"
    };
    return '<div class="topbar"><div class="brand"><h1>' + titles[state.tab] + "</h1><p>" + subs[state.tab] + "</p></div>" +
      '<button class="icon-btn" data-action="open-settings" aria-label="Réglages">' + ic("sliders") + "</button></div>";
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function tabbarHTML() {
    function t(id, icon, label) {
      return '<button class="tab' + (state.tab === id ? " active" : "") + '" data-action="tab" data-tab="' + id +
        '" aria-label="' + label + '"' + (state.tab === id ? ' aria-current="page"' : "") + ">" + ic(icon) + "<span>" + label + "</span></button>";
    }
    return '<div class="tabbar">' + t("semaine", "calendar", "Semaine") + t("programme", "dumbbell", "Programme") + t("journal", "pencil", "Journal") + "</div>";
  }

  function contentHTML() {
    if (state.tab === "semaine") return semaineHTML();
    if (state.tab === "programme") return programmeHTML();
    return journalHTML();
  }

  function fabHTML(action, label) {
    return '<div class="fab-spacer"></div><button class="fab" data-action="' + action + '">' + ic("plus") + "<span>" + label + "</span></button>";
  }

  // ---- onglet Semaine ----
  function semaineHTML() {
    var dates = weekDates(state.weekOffset);
    var sum = weekSummary(dates);
    var streak = computeStreak();
    var goal = sum.planned || 0;
    var pct = goal ? Math.min(100, Math.round((sum.done / goal) * 100)) : (sum.sessions ? 100 : 0);
    var mon = dates[0], sun = dates[6];
    var label = state.weekOffset === 0 ? "Cette semaine"
      : state.weekOffset === -1 ? "Semaine dernière"
        : dLabel(mon) + " au " + dLabel(sun);

    var C = 2 * Math.PI * 34;
    var html = '<div class="hero">' +
      '<div class="hero-top"><span class="week-label">' + label + "</span>" +
      '<div class="week-nav">' +
      '<button data-action="week" data-dir="-1" aria-label="Semaine précédente">' + ic("left") + "</button>" +
      '<button data-action="week" data-dir="1" aria-label="Semaine suivante"' + (state.weekOffset >= 0 ? " disabled" : "") + ">" + ic("right") + "</button>" +
      "</div></div>" +
      '<div class="hero-body">' +
      '<div class="ring-wrap"><svg class="ring" viewBox="0 0 80 80">' +
      '<circle class="bg" cx="40" cy="40" r="34"/>' +
      '<circle class="fg" cx="40" cy="40" r="34" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - pct / 100)).toFixed(1) + '"/>' +
      "</svg>" +
      '<div class="ring-txt"><span class="n">' + (goal ? sum.done + "/" + goal : sum.sessions) + '</span><span class="l">' + (goal ? "prévu" : "séances") + "</span></div></div>" +
      '<div class="hero-facts">' +
      '<div class="fact">' + ic("spark") + "<span><b>" + sum.sessions + "</b> séance" + (sum.sessions > 1 ? "s" : "") + " au total</span></div>" +
      '<div class="fact">' + ic("clock") + "<span><b>" + sum.minutes + "</b> min" + (sum.km ? " · <b>" + sum.km + "</b> km" : "") + "</span></div>" +
      '<div class="fact streak' + (streak ? "" : " muted") + '">' + ic("flame") + "<span>" + (streak ? "<b>" + streak + "</b> jour" + (streak > 1 ? "s" : "") + " de suite" : "Aucune série en cours") + "</span></div>" +
      "</div></div></div>";

    if (!state.programme.length && !state.journal.length) {
      return html + '<div class="empty"><span class="big">🗓️</span><h3>Ta semaine est vide</h3>' +
        "<p>Choisis un programme de départ, ou crée tes séances une par une.</p>" +
        '<button class="btn btn-primary" data-action="open-onboarding">' + ic("spark") + "Choisir un programme</button></div>";
    }

    var openIso = state.openDay || (state.weekOffset === 0 ? todayISO() : iso(dates[0]));
    dates.forEach(function (d) {
      html += dayCardHTML(d, iso(d) === openIso);
    });

    var libres = creneauxLibres();
    if (libres.length) {
      html += '<div class="section-title">Au choix, quand tu veux</div><div class="card flush">';
      libres.forEach(function (c) { html += slotHTML(c, null, null); });
      html += "</div>";
    }

    html += sparkHTML();
    return html + fabHTML("new-journal", "Logger");
  }

  function dayCardHTML(d, open) {
    var m = dayMatch(d);
    var today = isToday(d);
    var doneCount = 0;
    m.creneaux.forEach(function (c) { if (m.byCreneau[c.id]) doneCount++; });
    var totalLogged = doneCount + m.extras.length;

    var mini = "";
    m.creneaux.forEach(function (c) {
      var a = activiteById(c.activiteId);
      if (a) mini += '<span class="dot' + (m.byCreneau[c.id] ? " done" : "") + '">' + a.emoji + "</span>";
    });
    m.extras.forEach(function (e) {
      var a = activiteById(e.activiteId);
      if (a) mini += '<span class="dot done">' + a.emoji + "</span>";
    });

    var count = m.creneaux.length
      ? doneCount + "/" + m.creneaux.length
      : (totalLogged ? "+" + totalLogged : "");
    var allDone = m.creneaux.length ? doneCount === m.creneaux.length : totalLogged > 0;

    var h = '<div class="day' + (today ? " is-today" : "") + (open ? " open" : "") + '">' +
      '<button class="day-head" data-action="toggle-day" data-date="' + iso(d) + '" aria-expanded="' + (open ? "true" : "false") + '">' +
      '<span class="dname">' + WEEKDAYS_SHORT[jourIdx(d)] + '<span class="ddate">' + dLabel(d) + "</span></span>" +
      (today ? '<span class="badge-today">Aujourd\'hui</span>' : "") +
      '<span class="spacer"></span>' +
      (open ? "" : '<span class="day-mini">' + mini + "</span>") +
      (count ? '<span class="day-count' + (allDone ? " all-done" : "") + '">' + count + "</span>" : "") +
      '<span class="chev">' + ic("right") + "</span></button>";

    if (open) {
      h += '<div class="day-body">';
      if (!m.creneaux.length && !m.extras.length) {
        h += '<div class="day-empty">Rien de prévu ce jour-là.</div>';
      }
      m.creneaux.forEach(function (c) { h += slotHTML(c, d, m.byCreneau[c.id]); });
      m.extras.forEach(function (e) { h += extraSlotHTML(e); });
      h += '<button class="row-add" data-action="new-journal" data-date="' + iso(d) + '">' + ic("plus") + "Ajouter une séance</button>";
      h += "</div>";
    }
    return h + "</div>";
  }

  function slotHTML(c, dateObj, entry) {
    var a = activiteById(c.activiteId);
    if (!a) return "";
    var done = !!entry;
    var dateStr = dateObj ? iso(dateObj) : todayISO();
    var feel = done ? feelOf(entry.ressenti) : null;
    var sub = done
      ? "Fait · " + fmtVal(entry.valeur, a.unite) + (entry.note ? " · " + esc(entry.note) : "")
      : "Objectif " + fmtVal(c.valeur, a.unite) + (c.note ? " · " + esc(c.note) : "");

    return '<div class="slot' + (done ? " is-done" : "") + '" style="box-shadow:inset 3px 0 0 ' + a.couleur + '">' +
      '<button class="slot-check' + (done ? " done" : "") + '" data-action="' + (done ? "undo-done" : "quick-done") + '"' +
      ' data-id="' + c.id + '" data-date="' + dateStr + '"' + (done ? ' data-entry="' + entry.id + '"' : "") +
      ' aria-pressed="' + done + '" aria-label="' + (done ? "Annuler" : "Marquer comme fait") + " : " + esc(a.nom) + '">' + ic("check") + "</button>" +
      '<button class="slot-main" data-action="' + (done ? "edit-journal" : "log-creneau") + '" data-id="' + (done ? entry.id : c.id) + '" data-date="' + dateStr + '">' +
      '<span class="slot-name"><span class="emo">' + a.emoji + "</span>" + esc(a.nom) +
      (feel ? '<span class="feel">' + feel.e + "</span>" : "") + "</span>" +
      '<span class="slot-sub">' + sub + "</span></button>" +
      (dateObj ? "" : '<span class="slot-tag">libre</span>') +
      "</div>";
  }

  function extraSlotHTML(e) {
    var a = activiteById(e.activiteId);
    if (!a) return "";
    var feel = feelOf(e.ressenti);
    return '<div class="slot is-done" style="box-shadow:inset 3px 0 0 ' + a.couleur + '">' +
      '<button class="slot-check done" data-action="del-journal" data-id="' + e.id + '" aria-label="Supprimer cette séance">' + ic("check") + "</button>" +
      '<button class="slot-main" data-action="edit-journal" data-id="' + e.id + '">' +
      '<span class="slot-name"><span class="emo">' + a.emoji + "</span>" + esc(a.nom) +
      (feel ? '<span class="feel">' + feel.e + "</span>" : "") + "</span>" +
      '<span class="slot-sub">Fait · ' + fmtVal(e.valeur, a.unite) + (e.note ? " · " + esc(e.note) : "") + "</span></button>" +
      '<span class="slot-tag">bonus</span></div>';
  }

  function sparkHTML() {
    if (state.journal.length < 2) return "";
    var cols = [], max = 1;
    for (var i = 7; i >= 0; i--) {
      var dates = weekDates(state.weekOffset - i);
      var n = 0;
      dates.forEach(function (d) { n += journalForDay(d).length; });
      if (n > max) max = n;
      cols.push({ n: n, lab: dLabel(dates[0]).split(" ")[0], now: i === 0 });
    }
    var h = '<div class="section-title"><span>Ta régularité</span><span style="text-transform:none;letter-spacing:0;font-weight:600">8 dernières semaines</span></div><div class="card"><div class="spark">';
    cols.forEach(function (c) {
      h += '<div class="spark-col' + (c.now ? " now" : "") + '">' +
        '<span class="val">' + (c.n || "") + "</span>" +
        '<div class="spark-bar" style="height:' + Math.max(4, Math.round((c.n / max) * 52)) + 'px"></div>' +
        '<span class="lab">' + c.lab + "</span></div>";
    });
    return h + "</div></div>";
  }

  // ---- onglet Programme ----
  function programmeHTML() {
    if (!state.programme.length) {
      return '<div class="empty"><span class="big">💪</span><h3>Aucune séance au programme</h3>' +
        "<p>Pose tes séances types : le jour, l'activité, l'objectif. La semaine se remplit toute seule ensuite.</p>" +
        '<button class="btn btn-primary" data-action="open-onboarding">' + ic("spark") + "Partir d'un modèle</button>" +
        '<div style="margin-top:10px"><button class="btn btn-quiet" data-action="new-creneau">Ou créer ma première séance</button></div></div>';
    }
    var html = "", byDay = {}, libres = [];
    for (var i = 0; i < 7; i++) byDay[i] = [];
    state.programme.forEach(function (c) { if (c.jour === null) libres.push(c); else byDay[c.jour].push(c); });

    var total = state.programme.length;
    html += '<div class="section-title"><span>' + total + " séance" + (total > 1 ? "s" : "") + " par semaine</span>" +
      '<button class="link" data-action="open-onboarding">Repartir d\'un modèle</button></div>';

    for (var d = 0; d < 7; d++) {
      if (!byDay[d].length) continue;
      html += '<div class="section-title">' + WEEKDAYS[d] + '</div><div class="card">';
      byDay[d].forEach(function (c) { html += creneauListItem(c); });
      html += "</div>";
    }
    if (libres.length) {
      html += '<div class="section-title">Au choix, quand tu veux</div><div class="card">';
      libres.forEach(function (c) { html += creneauListItem(c); });
      html += "</div>";
    }
    return html + fabHTML("new-creneau", "Séance");
  }

  function creneauListItem(c) {
    var a = activiteById(c.activiteId);
    if (!a) return "";
    return '<div class="list-item">' +
      '<div class="avatar" style="background:' + a.couleur + '22">' + a.emoji + "</div>" +
      '<div class="info"><div class="t">' + esc(a.nom) + '</div><div class="s">' +
      "Objectif " + fmtVal(c.valeur, a.unite) + (c.note ? " · " + esc(c.note) : "") + "</div></div>" +
      '<div class="actions">' +
      '<button class="ghost-btn" data-action="edit-creneau" data-id="' + c.id + '" aria-label="Modifier">' + ic("pencil") + "</button>" +
      '<button class="ghost-btn danger" data-action="del-creneau" data-id="' + c.id + '" aria-label="Supprimer">' + ic("trash") + "</button>" +
      "</div></div>";
  }

  // ---- onglet Journal ----
  function journalHTML() {
    if (!state.journal.length) {
      return '<div class="empty"><span class="big">📝</span><h3>Ton journal est vide</h3>' +
        "<p>Note ce que tu fais vraiment, même quand ce n'était pas prévu. C'est ça qui compte.</p>" +
        '<button class="btn btn-primary" data-action="new-journal">' + ic("plus") + "Logger une séance</button></div>";
    }
    var entries = state.journal.slice().sort(function (a, b) {
      return b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id));
    });
    var byDate = {}, order = [];
    entries.forEach(function (e) {
      if (!byDate[e.date]) { byDate[e.date] = []; order.push(e.date); }
      byDate[e.date].push(e);
    });
    var html = "";
    order.forEach(function (ds) {
      var d = parseISO(ds);
      var yest = todayDate(); yest.setDate(yest.getDate() - 1);
      var label = isToday(d) ? "Aujourd'hui"
        : iso(d) === iso(yest) ? "Hier"
          : WEEKDAYS[jourIdx(d)] + " " + dLabel(d);
      html += '<div class="section-title">' + label + "</div><div class=\"card\">";
      byDate[ds].forEach(function (e) { html += entryHTML(e); });
      html += "</div>";
    });
    return html + fabHTML("new-journal", "Logger");
  }

  function entryHTML(e) {
    var a = activiteById(e.activiteId);
    if (!a) return "";
    var feel = feelOf(e.ressenti);
    return '<div class="entry">' +
      '<div class="avatar" style="background:' + a.couleur + '22">' + a.emoji + "</div>" +
      '<button class="entry-main" data-action="edit-journal" data-id="' + e.id + '">' +
      '<span class="name">' + esc(a.nom) + (feel ? '<span class="feel">' + feel.e + "</span>" : "") + "</span>" +
      '<span class="meta">' + fmtVal(e.valeur, a.unite) + (e.creneauId ? ' · <span class="pill">prévu</span>' : "") + "</span>" +
      (e.note ? '<span class="note">' + esc(e.note) + "</span>" : "") + "</button>" +
      '<button class="ghost-btn danger" data-action="del-journal" data-id="' + e.id + '" aria-label="Supprimer">' + ic("trash") + "</button></div>";
  }

  // ---------- sheets ----------
  function modalHTML() {
    var m = state.modal;
    if (!m) return "";
    if (m.type === "creneau") return sheet(m.data && m.data.id ? "Modifier la séance" : "Nouvelle séance", "Elle reviendra chaque semaine", creneauFormHTML(m.data));
    if (m.type === "journal") return sheet(m.data && m.data.id ? "Modifier la séance" : "Logger une séance", "Ce que tu as vraiment fait", journalFormHTML(m.data));
    if (m.type === "settings") return sheet("Réglages", null, settingsHTML());
    if (m.type === "onboarding") return sheet("Par où on commence ?", "Tu pourras tout modifier après", onboardingHTML());
    return "";
  }

  function sheet(title, sub, body) {
    return '<div class="overlay"><div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="grabber"></div><div class="sheet-head"><div><h3>' + esc(title) + "</h3>" +
      (sub ? "<p>" + esc(sub) + "</p>" : "") + "</div>" +
      '<button class="icon-btn" data-action="close-modal" aria-label="Fermer">' + ic("close") + "</button></div>" + body + "</div></div>";
  }

  function activiteChipSelect(selectedId) {
    var html = '<div class="chip-select" id="activite-chips">';
    state.activites.forEach(function (a) {
      html += '<button type="button" class="' + (a.id === selectedId ? "sel" : "") + '" data-pick-activite="' + a.id + '">' +
        a.emoji + " " + esc(a.nom) + "</button>";
    });
    html += '<button type="button" class="add-new" data-action="toggle-new-activite">' + ic("plus") + "Nouvelle</button></div>";
    html += '<input type="hidden" name="activiteId" id="activite-hidden" value="' + esc(selectedId || "") + '">';
    html += '<div class="field new-activite-box hidden" id="new-activite-box" style="margin-top:12px">' +
      "<label>Créer une activité</label>" +
      '<div class="row2"><input type="text" id="na-emoji" maxlength="4" placeholder="🤾" style="flex:0 0 66px;text-align:center" aria-label="Emoji">' +
      '<input type="text" id="na-nom" placeholder="Nom (ex : Boxe)" style="flex:2" aria-label="Nom"></div>' +
      '<div class="row2" style="margin-top:8px">' +
      '<select id="na-unite" aria-label="Unité"><option value="min">se compte en minutes</option><option value="km">se compte en km</option></select>' +
      '<button type="button" class="btn btn-secondary" data-action="add-activite">Créer</button></div></div>';
    return html;
  }

  function creneauFormHTML(data) {
    data = data || { id: null, jour: jourIdx(todayDate()), activiteId: state.activites[0] ? state.activites[0].id : "", valeur: "", note: "" };
    var jourBtns = "";
    for (var i = 0; i < 7; i++) {
      jourBtns += '<button type="button" class="' + (data.jour === i ? "sel" : "") + '" data-pick-jour="' + i + '">' + WEEKDAYS_SHORT[i] + "</button>";
    }
    jourBtns += '<button type="button" class="wide ' + (data.jour === null ? "sel" : "") + '" data-pick-jour="null">Au choix, sans jour fixe</button>';
    var a = activiteById(data.activiteId) || {};
    return '<form data-form="creneau" data-id="' + (data.id || "") + '">' +
      '<div class="field"><label>Quel jour ?</label><div class="day-select">' + jourBtns + "</div>" +
      '<input type="hidden" name="jour" id="jour-hidden" value="' + (data.jour === null ? "" : data.jour) + '"></div>' +
      '<div class="field"><label>Activité</label>' + activiteChipSelect(data.activiteId) + "</div>" +
      '<div class="field"><label>Objectif <span id="valeur-unit" class="unit-badge">en ' + (a.unite === "km" ? "km" : "minutes") + '</span></label>' +
      '<input type="number" step="0.5" min="0" name="valeur" inputmode="decimal" placeholder="20" value="' + esc(data.valeur) + '" required></div>' +
      '<div class="field"><label>Détail (facultatif)</label>' +
      '<input type="text" name="note" placeholder="Ex : 3 x 5 min, échauffement inclus" value="' + esc(data.note) + '"></div>' +
      '<button class="btn btn-primary btn-block" type="submit">' + (data.id ? "Enregistrer" : "Ajouter au programme") + "</button>" +
      (data.id ? '<div style="margin-top:8px"><button type="button" class="btn btn-danger btn-block" data-action="del-creneau" data-id="' + data.id + '">' + ic("trash") + "Supprimer cette séance</button></div>" : "") +
      "</form>";
  }

  function journalFormHTML(data) {
    data = data || { id: null, date: todayISO(), activiteId: state.activites[0] ? state.activites[0].id : "", valeur: "", note: "", ressenti: null, creneauId: null };
    var feelBtns = FEELINGS.map(function (f) {
      return '<button type="button" class="' + (data.ressenti === f.v ? "sel" : "") + '" data-pick-feel="' + f.v + '" aria-label="' + f.l + '">' + f.e + "</button>";
    }).join("");
    var a = activiteById(data.activiteId) || {};
    return '<form data-form="journal" data-id="' + (data.id || "") + '" data-creneau="' + (data.creneauId || "") + '">' +
      '<div class="field"><label>Date</label><input type="date" name="date" value="' + esc(data.date) + '" max="' + todayISO() + '" required></div>' +
      '<div class="field"><label>Activité</label>' + activiteChipSelect(data.activiteId) + "</div>" +
      '<div class="field"><label>Réalisé <span id="valeur-unit" class="unit-badge">en ' + (a.unite === "km" ? "km" : "minutes") + '</span></label>' +
      '<input type="number" step="0.5" min="0" name="valeur" inputmode="decimal" placeholder="20" value="' + esc(data.valeur) + '" required></div>' +
      '<div class="field"><label>Ressenti (facultatif)</label><div class="feel-select" id="feel-select">' + feelBtns + "</div>" +
      '<input type="hidden" name="ressenti" id="feel-hidden" value="' + (data.ressenti || "") + '"></div>' +
      '<div class="field"><label>Note (facultatif)</label>' +
      '<textarea name="note" placeholder="Comment ça s\'est passé ?">' + esc(data.note) + "</textarea></div>" +
      '<button class="btn btn-primary btn-block" type="submit">' + (data.id ? "Enregistrer" : "C'est fait 💪") + "</button>" +
      "</form>";
  }

  function onboardingHTML() {
    var h = "";
    PACKS.forEach(function (p) {
      var noms = p.creneaux.map(function (c) {
        var a = activiteById(c[1]); return a ? a.emoji : "";
      }).join(" ");
      h += '<button type="button" class="pack" data-action="apply-pack" data-pack="' + p.id + '">' +
        '<span class="avatar">' + p.emoji + "</span>" +
        '<span style="flex:1;min-width:0"><span class="t" style="display:block">' + esc(p.nom) + "</span>" +
        '<span class="s" style="display:block">' + esc(p.desc) + "</span>" +
        '<span class="s" style="display:block;margin-top:4px;font-size:.95rem">' + noms + "</span></span>" +
        '<span class="chev">' + ic("right") + "</span></button>";
    });
    h += '<div style="margin-top:14px"><button class="btn btn-quiet btn-block" data-action="new-creneau">Je préfère créer mes séances moi-même</button></div>';
    if (state.programme.length) {
      h += '<p style="font-size:.75rem;color:var(--ink-3);text-align:center;margin:12px 0 0;font-weight:600">Un modèle remplace ton programme actuel (ton journal n\'est pas touché).</p>';
    }
    return h;
  }

  function settingsHTML() {
    var t = getTheme();
    function sg(v, l) { return '<button type="button" class="' + (t === v ? "sel" : "") + '" data-set-theme="' + v + '">' + l + "</button>"; }
    return '<div class="field"><label>Apparence</label><div class="seg">' +
      sg("auto", "Auto") + sg("light", "Clair") + sg("dark", "Sombre") + "</div></div>" +
      '<div class="field"><label>Mes données</label>' +
      '<button class="btn btn-secondary btn-block" data-action="export">' + ic("down") + "Exporter (fichier JSON)</button>" +
      '<div style="margin-top:8px"><label for="import-file" class="btn btn-secondary btn-block" style="cursor:pointer">' + ic("up") + "Importer un fichier</label>" +
      '<input type="file" id="import-file" accept="application/json,.json" style="display:none"></div>' +
      '<div class="hint">Tout est stocké sur cet appareil uniquement. Exporte de temps en temps pour ne rien perdre.</div></div>' +
      '<div class="field"><button class="btn btn-danger btn-block" data-action="reset">' + ic("trash") + "Tout effacer</button></div>";
  }

  // ---------- actions ----------
  function quickDone(creneauId, dateStr) {
    var c = state.programme.filter(function (x) { return x.id === creneauId; })[0];
    if (!c) return;
    var entry = { id: uid(), date: dateStr, activiteId: c.activiteId, valeur: c.valeur, note: "", ressenti: null, creneauId: c.id };
    state.journal.push(entry);
    save(); R();
    toast("Séance validée 💪", "Détailler", function () {
      state.modal = { type: "journal", data: entry };
      R();
    });
  }

  function undoDone(entryId) {
    var e = state.journal.filter(function (x) { return x.id === entryId; })[0];
    state.journal = state.journal.filter(function (x) { return x.id !== entryId; });
    save(); R();
    if (e) toast("Séance décochée", "Annuler", function () { state.journal.push(e); save(); R(); });
  }

  function delJournal(id) {
    var e = state.journal.filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    state.journal = state.journal.filter(function (x) { return x.id !== id; });
    save(); R();
    toast("Séance supprimée", "Annuler", function () { state.journal.push(e); save(); R(); });
  }

  function delCreneau(id) {
    var c = state.programme.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    var pos = state.programme.indexOf(c);
    state.programme = state.programme.filter(function (x) { return x.id !== id; });
    state.modal = null;
    save(); R();
    toast("Séance retirée du programme", "Annuler", function () { state.programme.splice(pos, 0, c); save(); R(); });
  }

  function applyPack(packId) {
    var p = PACKS.filter(function (x) { return x.id === packId; })[0];
    if (!p) return;
    state.programme = p.creneaux.map(function (c) {
      return { id: uid(), jour: c[0], activiteId: c[1], valeur: String(c[2]), note: "" };
    });
    state.onboarded = true;
    state.modal = null;
    state.tab = "programme";
    save(); R();
    toast("Programme « " + p.nom + " » appliqué");
  }

  function addActivite() {
    var nom = (document.getElementById("na-nom").value || "").trim();
    var emoji = (document.getElementById("na-emoji").value || "").trim() || "🏃";
    var unite = document.getElementById("na-unite").value;
    if (!nom) { toast("Donne un nom à l'activité"); return; }
    var a = { id: uid(), nom: nom, emoji: emoji, unite: unite, couleur: PALETTE[state.activites.length % PALETTE.length] };
    captureModalFormState();
    state.activites.push(a);
    if (state.modal && state.modal.data) state.modal.data.activiteId = a.id;
    save(); R();
    toast("Activité créée");
  }

  function captureModalFormState() {
    var form = document.querySelector("#modal-host form[data-form]");
    if (!form || !state.modal) return;
    var type = form.getAttribute("data-form");
    var fd = new FormData(form);
    if (type === "creneau") {
      var jr = fd.get("jour");
      state.modal.data = {
        id: form.getAttribute("data-id") || null,
        jour: jr === "" || jr === null ? null : Number(jr),
        activiteId: fd.get("activiteId"), valeur: fd.get("valeur"), note: fd.get("note")
      };
    } else if (type === "journal") {
      state.modal.data = {
        id: form.getAttribute("data-id") || null,
        date: fd.get("date"), activiteId: fd.get("activiteId"), valeur: fd.get("valeur"),
        note: fd.get("note"), ressenti: fd.get("ressenti") ? Number(fd.get("ressenti")) : null,
        creneauId: form.getAttribute("data-creneau") || null
      };
    }
  }

  function exportData() {
    var d = { activites: state.activites, programme: state.programme, journal: state.journal, exportedAt: new Date().toISOString() };
    var blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "mon-programme-" + todayISO() + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Export téléchargé");
  }

  function importData(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var d = JSON.parse(reader.result);
        if (!d || !Array.isArray(d.activites)) throw new Error("format");
        state.activites = d.activites;
        state.programme = Array.isArray(d.programme) ? d.programme : [];
        state.journal = Array.isArray(d.journal) ? d.journal : [];
        state.onboarded = true;
        state.modal = null;
        save(); R(); toast("Données importées");
      } catch (e) { toast("Fichier illisible"); }
    };
    reader.readAsText(file);
  }

  function resetData() {
    if (!confirm("Effacer ton programme ET ton journal ? C'est définitif.")) return;
    state.activites = ACTIVITES_DEFAULT.slice();
    state.programme = []; state.journal = []; state.onboarded = false;
    state.modal = null;
    save(); R(); toast("Tout a été effacé");
  }

  // ---------- events ----------
  document.addEventListener("click", function (ev) {
    if (ev.target.classList && ev.target.classList.contains("overlay")) {
      state.modal = null; R(); return;
    }
    var t = ev.target.closest("[data-action]");
    if (t) {
      var action = t.getAttribute("data-action");
      var id = t.getAttribute("data-id");
      var date = t.getAttribute("data-date");

      if (action === "toast-action") { var cb = toastCb; toastCb = null; var el = document.getElementById("toast"); if (el) el.remove(); if (cb) cb(); return; }
      if (action === "close-modal") { state.modal = null; R(); return; }
      if (action === "tab") { state.tab = t.getAttribute("data-tab"); state.weekOffset = 0; window.scrollTo(0, 0); R(); return; }
      if (action === "week") { state.weekOffset = Math.min(0, state.weekOffset + Number(t.getAttribute("data-dir"))); state.openDay = null; R(); return; }
      if (action === "toggle-day") { state.openDay = state.openDay === date ? "" : date; R(); return; }
      if (action === "open-settings") { state.modal = { type: "settings" }; R(); return; }
      if (action === "open-onboarding") { state.modal = { type: "onboarding" }; R(); return; }
      if (action === "apply-pack") { applyPack(t.getAttribute("data-pack")); return; }
      if (action === "new-creneau") { state.modal = { type: "creneau", data: null }; R(); return; }
      if (action === "new-journal") {
        state.modal = { type: "journal", data: date ? { id: null, date: date, activiteId: state.activites[0].id, valeur: "", note: "", ressenti: null, creneauId: null } : null };
        R(); return;
      }
      if (action === "edit-creneau") {
        state.modal = { type: "creneau", data: state.programme.filter(function (x) { return x.id === id; })[0] };
        R(); return;
      }
      if (action === "edit-journal") {
        state.modal = { type: "journal", data: state.journal.filter(function (x) { return x.id === id; })[0] };
        R(); return;
      }
      if (action === "quick-done") { quickDone(id, date); return; }
      if (action === "undo-done") { undoDone(t.getAttribute("data-entry")); return; }
      if (action === "log-creneau") {
        var cr = state.programme.filter(function (x) { return x.id === id; })[0];
        if (!cr) return;
        state.modal = { type: "journal", data: { id: null, date: date || todayISO(), activiteId: cr.activiteId, valeur: cr.valeur, note: "", ressenti: null, creneauId: cr.id } };
        R(); return;
      }
      if (action === "del-creneau") { delCreneau(id); return; }
      if (action === "del-journal") { delJournal(id); return; }
      if (action === "toggle-new-activite") {
        var box = document.getElementById("new-activite-box");
        if (box) { box.classList.toggle("hidden"); var n = document.getElementById("na-nom"); if (n && !box.classList.contains("hidden")) n.focus(); }
        return;
      }
      if (action === "add-activite") { addActivite(); return; }
      if (action === "export") { exportData(); return; }
      if (action === "reset") { resetData(); return; }
      return;
    }

    var th = ev.target.closest("[data-set-theme]");
    if (th) {
      setTheme(th.getAttribute("data-set-theme"));
      th.parentNode.querySelectorAll("button").forEach(function (b) { b.classList.remove("sel"); });
      th.classList.add("sel");
      return;
    }
    var pj = ev.target.closest("[data-pick-jour]");
    if (pj) {
      document.querySelectorAll(".day-select button").forEach(function (b) { b.classList.remove("sel"); });
      pj.classList.add("sel");
      document.getElementById("jour-hidden").value = pj.getAttribute("data-pick-jour") === "null" ? "" : pj.getAttribute("data-pick-jour");
      return;
    }
    var pa = ev.target.closest("[data-pick-activite]");
    if (pa) {
      var host = pa.closest("#activite-chips");
      host.querySelectorAll("button[data-pick-activite]").forEach(function (b) { b.classList.remove("sel"); });
      pa.classList.add("sel");
      var pid = pa.getAttribute("data-pick-activite");
      document.getElementById("activite-hidden").value = pid;
      var picked = activiteById(pid);
      var badge = document.getElementById("valeur-unit");
      if (badge && picked) badge.textContent = "en " + (picked.unite === "km" ? "km" : "minutes");
      return;
    }
    var pf = ev.target.closest("[data-pick-feel]");
    if (pf) {
      var already = pf.classList.contains("sel");
      document.querySelectorAll(".feel-select button").forEach(function (b) { b.classList.remove("sel"); });
      if (!already) pf.classList.add("sel");
      document.getElementById("feel-hidden").value = already ? "" : pf.getAttribute("data-pick-feel");
      return;
    }
  });

  document.addEventListener("submit", function (ev) {
    var form = ev.target.closest("form[data-form]");
    if (!form) return;
    ev.preventDefault();
    var type = form.getAttribute("data-form");
    var fd = new FormData(form);
    var activiteId = fd.get("activiteId");
    if (!activiteId) { toast("Choisis une activité"); return; }

    if (type === "creneau") {
      var jr = fd.get("jour");
      var id = form.getAttribute("data-id");
      var payload = {
        id: id || uid(),
        jour: jr === "" || jr === null ? null : Number(jr),
        activiteId: activiteId, valeur: fd.get("valeur"), note: (fd.get("note") || "").trim()
      };
      if (id) state.programme = state.programme.map(function (c) { return c.id === id ? payload : c; });
      else state.programme.push(payload);
      state.onboarded = true; state.modal = null;
      save(); R();
      toast(id ? "Séance mise à jour" : "Ajoutée au programme");
      return;
    }

    if (type === "journal") {
      var id2 = form.getAttribute("data-id");
      var payload2 = {
        id: id2 || uid(), date: fd.get("date"), activiteId: activiteId, valeur: fd.get("valeur"),
        note: (fd.get("note") || "").trim(),
        ressenti: fd.get("ressenti") ? Number(fd.get("ressenti")) : null,
        creneauId: form.getAttribute("data-creneau") || null
      };
      if (id2) state.journal = state.journal.map(function (e) { return e.id === id2 ? payload2 : e; });
      else state.journal.push(payload2);
      state.onboarded = true; state.modal = null;
      if (state.tab === "semaine") state.openDay = payload2.date;
      save(); R();
      toast(id2 ? "Séance mise à jour" : "Séance enregistrée 💪");
      return;
    }
  });

  document.addEventListener("change", function (ev) {
    if (ev.target && ev.target.id === "import-file") importData(ev.target.files[0]);
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && state.modal) { state.modal = null; R(); }
  });

  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", function () { applyTheme(getTheme()); });
  }

  // ---------- boot ----------
  applyTheme(getTheme());
  R();
  if (!state.onboarded) { state.modal = { type: "onboarding" }; R(); }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function () {});
    });
  }
})();
