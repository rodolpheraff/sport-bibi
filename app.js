(function () {
  "use strict";

  var LS_KEY = "sportbibi_v1";
  var WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  var WEEKDAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  var MONTHS_SHORT = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];
  var FEELINGS = [
    { v: 1, e: "😩" },
    { v: 2, e: "😕" },
    { v: 3, e: "🙂" },
    { v: 4, e: "💪" },
    { v: 5, e: "🔥" }
  ];

  var ACTIVITES_DEFAULT = [
    { id: "corde", nom: "Corde à sauter", emoji: "🪢", couleur: "#ff5b45", unite: "min" },
    { id: "pilates", nom: "Pilates", emoji: "🤸", couleur: "#0f7a6b", unite: "min" },
    { id: "running", nom: "Running", emoji: "🏃", couleur: "#e8a53d", unite: "km" },
    { id: "muscu", nom: "Muscu", emoji: "🏋️", couleur: "#5b6ee8", unite: "min" },
    { id: "yoga", nom: "Yoga", emoji: "🧘", couleur: "#c17bd6", unite: "min" },
    { id: "velo", nom: "Vélo", emoji: "🚴", couleur: "#2fa8c9", unite: "km" },
    { id: "marche", nom: "Marche", emoji: "🚶", couleur: "#8a8578", unite: "min" },
    { id: "natation", nom: "Natation", emoji: "🏊", couleur: "#1b8fd1", unite: "min" }
  ];

  var UNITES = { min: "min", km: "km" };

  // ---------- state ----------
  var state = load();
  state.tab = "semaine";
  state.weekOffset = 0;
  state.modal = null; // {type:'creneau'|'journal'|'settings', data:{...}}
  state.newActivite = false;

  function load() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (!d.activites || !d.activites.length) d.activites = ACTIVITES_DEFAULT.slice();
        d.programme = d.programme || [];
        d.journal = d.journal || [];
        return d;
      }
    } catch (e) {}
    return { activites: ACTIVITES_DEFAULT.slice(), programme: [], journal: [] };
  }

  function save() {
    var d = { activites: state.activites, programme: state.programme, journal: state.journal };
    localStorage.setItem(LS_KEY, JSON.stringify(d));
  }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  // ---------- dates ----------
  function stripTime(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function todayDate() { return stripTime(new Date()); }
  function iso(d) {
    var y = d.getFullYear(), m = ("0" + (d.getMonth() + 1)).slice(-2), day = ("0" + d.getDate()).slice(-2);
    return y + "-" + m + "-" + day;
  }
  function todayISO() { return iso(todayDate()); }
  function parseISO(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function getMonday(d) {
    var x = stripTime(d);
    var day = x.getDay(); // 0=dim
    var diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
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
  function sameDay(a, b) { return iso(a) === iso(b); }

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
    return (Number.isInteger(n) ? n : n.toFixed(1)) + " " + (UNITES[unite] || unite || "");
  }

  function journalForDay(dateObj) {
    var s = iso(dateObj);
    return state.journal.filter(function (e) { return e.date === s; });
  }

  function creneauDoneOnDay(creneau, dateObj) {
    var entries = journalForDay(dateObj);
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].creneauId === creneau.id) return entries[i];
    }
    for (var j = 0; j < entries.length; j++) {
      if (!entries[j].creneauId && entries[j].activiteId === creneau.activiteId) return entries[j];
    }
    return null;
  }

  function computeStreak() {
    var streak = 0;
    var d = todayDate();
    // si rien fait aujourd'hui, on regarde quand même hier pour ne pas casser la série trop vite
    var hasToday = journalForDay(d).length > 0;
    if (!hasToday) d.setDate(d.getDate() - 1);
    while (true) {
      if (journalForDay(d).length > 0) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  }

  function weekSummary(dates) {
    var planned = 0, done = 0, minutes = 0, km = 0, sessions = 0;
    dates.forEach(function (d) {
      var jourIdx = (d.getDay() + 6) % 7; // 0=lundi
      var cx = state.programme.filter(function (c) { return c.jour === jourIdx; });
      planned += cx.length;
      cx.forEach(function (c) { if (creneauDoneOnDay(c, d)) done++; });
      journalForDay(d).forEach(function (e) {
        sessions++;
        var a = activiteById(e.activiteId);
        if (a && a.unite === "km") km += Number(e.valeur) || 0;
        else minutes += Number(e.valeur) || 0;
      });
    });
    return { planned: planned, done: done, minutes: Math.round(minutes), km: km, sessions: sessions };
  }

  // ---------- render ----------
  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById("toast");
    if (el) el.remove();
    el = document.createElement("div");
    el.id = "toast"; el.className = "toast"; el.textContent = msg;
    document.body.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.remove(); }, 2200);
  }

  function R() {
    var app = document.getElementById("app");
    app.innerHTML = topbarHTML() + contentHTML() + tabbarHTML();
    var modalHost = document.createElement("div");
    modalHost.id = "modal-host";
    modalHost.innerHTML = state.modal ? modalHTML() : "";
    document.body.querySelectorAll("#modal-host").forEach(function (n) { n.remove(); });
    document.body.appendChild(modalHost);
  }

  function topbarHTML() {
    var titles = { semaine: "Cette semaine", programme: "Mon programme", journal: "Journal" };
    var subtitles = {
      semaine: capitalize(WEEKDAYS[(todayDate().getDay() + 6) % 7]) + " " + dLabel(todayDate()),
      programme: "Ce que tu prévois de faire chaque semaine",
      journal: "Ce que tu as vraiment fait, séance par séance"
    };
    return (
      '<div class="topbar"><div class="brand"><h1>' + titles[state.tab] + "</h1><p>" + subtitles[state.tab] + "</p></div>" +
      '<button class="icon-btn" data-action="open-settings" aria-label="Réglages">⚙️</button></div>'
    );
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function tabbarHTML() {
    function t(id, ic, label) {
      return '<button class="tab' + (state.tab === id ? " active" : "") + '" data-action="tab" data-tab="' + id + '"><span class="ic">' + ic + "</span>" + label + "</button>";
    }
    return '<div class="tabbar">' + t("semaine", "📅", "Semaine") + t("programme", "🗂️", "Programme") + t("journal", "📝", "Journal") + "</div>";
  }

  function contentHTML() {
    var body;
    if (state.tab === "semaine") body = semaineHTML();
    else if (state.tab === "programme") body = programmeHTML();
    else body = journalHTML();
    var fabAction = state.tab === "programme" ? "new-creneau" : (state.tab === "journal" ? "new-journal" : null);
    var hasItems = state.tab === "programme" ? state.programme.length : (state.tab === "journal" ? state.journal.length : 0);
    if (fabAction && hasItems) {
      body += '<button class="fab" data-action="' + fabAction + '" aria-label="Ajouter">+</button>';
    }
    return body;
  }

  // ---- Semaine ----
  function semaineHTML() {
    var dates = weekDates(state.weekOffset);
    var sum = weekSummary(dates);
    var streak = computeStreak();
    var pct = sum.planned ? Math.round((sum.done / sum.planned) * 100) : (sum.sessions ? 100 : 0);
    var mon = dates[0], sun = dates[6];
    var label = state.weekOffset === 0 ? "Cette semaine" : (dLabel(mon) + " – " + dLabel(sun));

    var html = '<div class="hero"><div class="row"><span class="week-label">' + label + '</span>' +
      '<div class="week-nav"><button data-action="week" data-dir="-1">‹</button><button data-action="week" data-dir="1">›</button></div></div>' +
      '<div class="hero-stats">' +
      '<div class="hero-stat"><div class="n">' + sum.sessions + '</div><div class="l">séances</div></div>' +
      '<div class="hero-stat"><div class="n">' + sum.minutes + '</div><div class="l">minutes</div></div>' +
      '<div class="hero-stat"><div class="n">' + (streak > 0 ? "🔥" + streak : "0") + '</div><div class="l">jours de suite</div></div>' +
      "</div>" +
      (sum.planned ? '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' : "") +
      "</div>";

    var creneauxLibres = state.programme.filter(function (c) { return c.jour === null; });
    if (creneauxLibres.length) {
      html += '<div class="section-title">Jour libre cette semaine</div><div class="day-card">';
      creneauxLibres.forEach(function (c) { html += slotHTML(c, null); });
      html += "</div>";
    }

    html += '<div class="section-title">Jour par jour</div>';
    dates.forEach(function (d) {
      var jourIdx = (d.getDay() + 6) % 7;
      var cx = state.programme.filter(function (c) { return c.jour === jourIdx; });
      var isToday = sameDay(d, todayDate());
      html += '<div class="day-card' + (isToday ? " today" : "") + '"><div class="day-head"><span class="d">' + WEEKDAYS_SHORT[jourIdx] + " <small>" + dLabel(d) + "</small></span>" +
        (isToday ? '<span class="streak-badge">Aujourd\'hui</span>' : "") + "</div>";
      if (!cx.length) {
        var libreDone = journalForDay(d);
        html += '<div class="day-empty">' + (libreDone.length ? libreDone.length + " séance(s) loggée(s), rien de planifié" : "Rien de planifié") + "</div>";
      } else {
        cx.forEach(function (c) { html += slotHTML(c, d); });
      }
      html += "</div>";
    });

    if (!state.programme.length) {
      html += '<div class="empty-state"><span class="big">🗓️</span><p>Aucune séance planifiée pour l’instant.<br>Construis ton programme dans l’onglet « Programme ».</p>' +
        '<button class="btn btn-primary" data-action="tab" data-tab="programme">Créer mon programme</button></div>';
    }

    return '<div class="content">' + html + "</div>";
  }

  function slotHTML(c, dateObj) {
    var a = activiteById(c.activiteId);
    if (!a) return "";
    var done = dateObj ? creneauDoneOnDay(c, dateObj) : null;
    var statusBtn;
    if (done) {
      statusBtn = '<button class="chip done" data-action="open-journal-entry" data-id="' + done.id + '">✓ Fait</button>';
    } else if (dateObj) {
      statusBtn = '<button class="chip log" data-action="log-creneau" data-id="' + c.id + '" data-date="' + iso(dateObj) + '">Logger</button>';
    } else {
      statusBtn = '<button class="chip log" data-action="log-creneau" data-id="' + c.id + '" data-date="' + todayISO() + '">Logger</button>';
    }
    return '<div class="slot" style="border-left:3px solid ' + a.couleur + '"><div class="slot-emoji">' + a.emoji + '</div>' +
      '<div class="slot-body"><div class="slot-name">' + esc(a.nom) + '</div><div class="slot-target">Objectif : ' + fmtVal(c.valeur, a.unite) + (c.note ? " · " + esc(c.note) : "") + '</div></div>' +
      '<div class="slot-status">' + statusBtn + "</div></div>";
  }

  // ---- Programme ----
  function programmeHTML() {
    var html = "";
    var byDay = {};
    for (var i = 0; i < 7; i++) byDay[i] = [];
    var libres = [];
    state.programme.forEach(function (c) { if (c.jour === null) libres.push(c); else byDay[c.jour].push(c); });

    if (!state.programme.length) {
      html += '<div class="empty-state"><span class="big">💪</span><p>Pas encore de séances au programme.<br>Ajoute ta première activité type (corde à sauter, pilates, running…).</p>' +
        '<button class="btn btn-primary" data-action="new-creneau">Ajouter une séance</button></div>';
      return '<div class="content">' + html + "</div>";
    }

    for (var d = 0; d < 7; d++) {
      if (!byDay[d].length) continue;
      html += '<div class="section-title">' + WEEKDAYS[d] + '</div><div class="card">';
      byDay[d].forEach(function (c) { html += creneauListItem(c); });
      html += "</div>";
    }
    if (libres.length) {
      html += '<div class="section-title">Jour libre</div><div class="card">';
      libres.forEach(function (c) { html += creneauListItem(c); });
      html += "</div>";
    }
    return '<div class="content">' + html + "</div>";
  }

  function creneauListItem(c) {
    var a = activiteById(c.activiteId);
    if (!a) return "";
    return '<div class="list-item" style="border-left:3px solid ' + a.couleur + '"><div class="emoji">' + a.emoji + '</div>' +
      '<div class="info"><div class="t">' + esc(a.nom) + '</div><div class="s">Objectif : ' + fmtVal(c.valeur, a.unite) + (c.note ? " · " + esc(c.note) : "") + '</div></div>' +
      '<div class="actions"><button class="ghost-btn" data-action="edit-creneau" data-id="' + c.id + '">✎</button>' +
      '<button class="ghost-btn" data-action="del-creneau" data-id="' + c.id + '">🗑️</button></div></div>';
  }

  // ---- Journal ----
  function journalHTML() {
    var entries = state.journal.slice().sort(function (a, b) { return b.date.localeCompare(a.date) || b.id.localeCompare(a.id); });
    var html = "";
    if (!entries.length) {
      html += '<div class="empty-state"><span class="big">📝</span><p>Aucune séance loggée pour l’instant.<br>Note ce que tu fais vraiment, même si ce n’était pas prévu.</p>' +
        '<button class="btn btn-primary" data-action="new-journal">Logger une séance</button></div>';
      return '<div class="content">' + html + "</div>";
    }
    var byDate = {};
    var order = [];
    entries.forEach(function (e) {
      if (!byDate[e.date]) { byDate[e.date] = []; order.push(e.date); }
      byDate[e.date].push(e);
    });
    order.forEach(function (dstr) {
      var d = parseISO(dstr);
      var label = sameDay(d, todayDate()) ? "Aujourd’hui" : WEEKDAYS[(d.getDay() + 6) % 7] + " " + dLabel(d);
      html += '<div class="section-title">' + label + '</div><div class="card">';
      byDate[dstr].forEach(function (e) { html += entryHTML(e); });
      html += "</div>";
    });
    return '<div class="content">' + html + "</div>";
  }

  function entryHTML(e) {
    var a = activiteById(e.activiteId);
    if (!a) return "";
    var feel = FEELINGS.filter(function (f) { return f.v === e.ressenti; })[0];
    return '<div class="entry" style="border-left:3px solid ' + a.couleur + '"><div class="emoji">' + a.emoji + '</div>' +
      '<div class="body"><div class="top"><span class="name">' + esc(a.nom) + (feel ? '<span class="feel">' + feel.e + '</span>' : "") + '</span></div>' +
      '<div class="meta">' + fmtVal(e.valeur, a.unite) + (e.creneauId ? " · séance prévue" : "") + '</div>' +
      (e.note ? '<div class="note">' + esc(e.note) + "</div>" : "") + '</div>' +
      '<button class="del" data-action="del-journal" data-id="' + e.id + '">🗑️</button></div>';
  }

  // ---- Modal / sheet ----
  function modalHTML() {
    var m = state.modal;
    if (!m) return "";
    if (m.type === "creneau") return sheetWrap("Séance planifiée", creneauFormHTML(m.data));
    if (m.type === "journal") return sheetWrap("Logger une séance", journalFormHTML(m.data));
    if (m.type === "settings") return sheetWrap("Réglages", settingsHTML());
    return "";
  }

  function sheetWrap(title, body) {
    return '<div class="overlay"><div class="sheet"><div class="grabber"></div>' +
      '<div class="sheet-head"><h3>' + title + '</h3><button class="icon-btn" data-action="close-modal">✕</button></div>' + body + "</div></div>";
  }

  function activiteChipSelect(selectedId, name) {
    var html = '<div class="chip-select" id="activite-chips">';
    state.activites.forEach(function (a) {
      html += '<button type="button" class="' + (a.id === selectedId ? "sel" : "") + '" data-pick-activite="' + a.id + '">' + a.emoji + " " + esc(a.nom) + "</button>";
    });
    html += '<button type="button" class="add-new" data-action="toggle-new-activite">+ Nouvelle</button></div>';
    html += '<input type="hidden" name="' + name + '" id="activite-hidden" value="' + esc(selectedId || "") + '">';
    html += '<div class="field new-activite-box hidden" id="new-activite-box" style="margin-top:12px"><label>Nouvelle activité</label>' +
      '<div class="row2"><input type="text" id="na-emoji" maxlength="4" placeholder="🤸" style="flex:0 0 60px;text-align:center">' +
      '<input type="text" id="na-nom" placeholder="Nom de l\'activité" style="flex:2"></div>' +
      '<div class="row2" style="margin-top:8px">' +
      '<select id="na-unite"><option value="min">minutes</option><option value="km">kilomètres</option></select>' +
      '<button type="button" class="btn btn-secondary" data-action="add-activite">Ajouter</button></div></div>';
    return html;
  }

  function creneauFormHTML(data) {
    data = data || { id: null, jour: 0, activiteId: state.activites[0] ? state.activites[0].id : "", valeur: "", note: "" };
    var jourBtns = "";
    for (var i = 0; i < 7; i++) jourBtns += '<button type="button" class="' + (data.jour === i ? "sel" : "") + '" data-pick-jour="' + i + '">' + WEEKDAYS_SHORT[i] + "</button>";
    jourBtns += '<button type="button" class="' + (data.jour === null ? "sel" : "") + '" data-pick-jour="null" style="grid-column:span 3">Jour libre</button>';
    return '<form data-form="creneau" data-id="' + (data.id || "") + '">' +
      '<div class="field"><label>Jour</label><div class="day-select">' + jourBtns + "</div><input type=\"hidden\" name=\"jour\" id=\"jour-hidden\" value=\"" + (data.jour === null ? "" : data.jour) + '"></div>' +
      '<div class="field"><label>Activité</label>' + activiteChipSelect(data.activiteId, "activiteId") + '</div>' +
      '<div class="field"><label>Objectif <span id="valeur-unit" class="unit-badge">' + (activiteById(data.activiteId) || {}).unite + '</span></label><input type="number" step="0.1" min="0" name="valeur" placeholder="Ex : 20" value="' + esc(data.valeur) + '" required></div>' +
      '<div class="field"><label>Note (optionnel)</label><input type="text" name="note" placeholder="Ex : 3 x 15 min" value="' + esc(data.note) + '"></div>' +
      '<button class="btn btn-primary btn-block" type="submit">' + (data.id ? "Mettre à jour" : "Ajouter au programme") + "</button></form>";
  }

  function journalFormHTML(data) {
    data = data || { id: null, date: todayISO(), activiteId: state.activites[0] ? state.activites[0].id : "", valeur: "", note: "", ressenti: null, creneauId: null };
    var feelBtns = FEELINGS.map(function (f) {
      return '<button type="button" class="' + (data.ressenti === f.v ? "sel" : "") + '" data-pick-feel="' + f.v + '">' + f.e + "</button>";
    }).join("");
    return '<form data-form="journal" data-id="' + (data.id || "") + '" data-creneau="' + (data.creneauId || "") + '">' +
      '<div class="field"><label>Date</label><input type="date" name="date" value="' + data.date + '" required></div>' +
      '<div class="field"><label>Activité</label>' + activiteChipSelect(data.activiteId, "activiteId") + '</div>' +
      '<div class="field"><label>Réalisé <span id="valeur-unit" class="unit-badge">' + (activiteById(data.activiteId) || {}).unite + '</span></label><input type="number" step="0.1" min="0" name="valeur" placeholder="Ex : 18" value="' + esc(data.valeur) + '" required></div>' +
      '<div class="field"><label>Ressenti</label><div class="feel-select" id="feel-select">' + feelBtns + '</div><input type="hidden" name="ressenti" id="feel-hidden" value="' + (data.ressenti || "") + '"></div>' +
      '<div class="field"><label>Note (optionnel)</label><textarea name="note" placeholder="Comment ça s\'est passé ?">' + esc(data.note) + '</textarea></div>' +
      '<button class="btn btn-primary btn-block" type="submit">' + (data.id ? "Mettre à jour" : "Enregistrer") + "</button></form>";
  }

  function settingsHTML() {
    return '<div class="field"><button class="btn btn-secondary btn-block" data-action="export">⬇️ Exporter mes données (JSON)</button></div>' +
      '<div class="field"><label for="import-file">Importer un fichier</label><input type="file" id="import-file" accept="application/json"></div>' +
      '<div class="field"><button class="btn btn-secondary btn-block" data-action="reset" style="color:#c0392b">🗑️ Réinitialiser toutes les données</button></div>';
  }

  // ---------- events ----------
  document.addEventListener("click", function (ev) {
    if (ev.target.classList && ev.target.classList.contains("overlay")) {
      state.modal = null; state.newActivite = false; R(); return;
    }
    var t = ev.target.closest("[data-action]");
    if (t) {
      var action = t.getAttribute("data-action");
      if (action === "tab") { state.tab = t.getAttribute("data-tab"); R(); return; }
      if (action === "week") { state.weekOffset += Number(t.getAttribute("data-dir")); R(); return; }
      if (action === "open-settings") { state.modal = { type: "settings" }; R(); return; }
      if (action === "close-modal") { state.modal = null; state.newActivite = false; R(); return; }
      if (action === "new-creneau") { state.modal = { type: "creneau", data: null }; R(); return; }
      if (action === "new-journal") { state.modal = { type: "journal", data: null }; R(); return; }
      if (action === "edit-creneau") {
        var c = state.programme.filter(function (x) { return x.id === t.getAttribute("data-id"); })[0];
        state.modal = { type: "creneau", data: c }; R(); return;
      }
      if (action === "del-creneau") {
        state.programme = state.programme.filter(function (x) { return x.id !== t.getAttribute("data-id"); });
        save(); R(); toast("Séance supprimée du programme"); return;
      }
      if (action === "del-journal") {
        state.journal = state.journal.filter(function (x) { return x.id !== t.getAttribute("data-id"); });
        save(); R(); toast("Entrée supprimée"); return;
      }
      if (action === "open-journal-entry") {
        var e = state.journal.filter(function (x) { return x.id === t.getAttribute("data-id"); })[0];
        state.modal = { type: "journal", data: e }; R(); return;
      }
      if (action === "log-creneau") {
        var cr = state.programme.filter(function (x) { return x.id === t.getAttribute("data-id"); })[0];
        state.modal = { type: "journal", data: { id: null, date: t.getAttribute("data-date"), activiteId: cr.activiteId, valeur: cr.valeur, note: "", ressenti: null, creneauId: cr.id } };
        R(); return;
      }
      if (action === "toggle-new-activite") {
        var box = document.getElementById("new-activite-box");
        if (box) box.classList.toggle("hidden");
        return;
      }
      if (action === "add-activite") { addActivite(); return; }
      if (action === "export") { exportData(); return; }
      if (action === "reset") { resetData(); return; }
      return;
    }
    var pickJour = ev.target.closest("[data-pick-jour]");
    if (pickJour) {
      document.querySelectorAll(".day-select button").forEach(function (b) { b.classList.remove("sel"); });
      pickJour.classList.add("sel");
      document.getElementById("jour-hidden").value = pickJour.getAttribute("data-pick-jour");
      return;
    }
    var pickAct = ev.target.closest("[data-pick-activite]");
    if (pickAct) {
      var host = pickAct.closest("#activite-chips");
      host.querySelectorAll("button[data-pick-activite]").forEach(function (b) { b.classList.remove("sel"); });
      pickAct.classList.add("sel");
      var pickedId = pickAct.getAttribute("data-pick-activite");
      host.parentNode.querySelector("#activite-hidden").value = pickedId;
      var picked = activiteById(pickedId);
      var unitBadge = host.closest("form").querySelector("#valeur-unit");
      if (unitBadge && picked) unitBadge.textContent = picked.unite;
      return;
    }
    var pickFeel = ev.target.closest("[data-pick-feel]");
    if (pickFeel) {
      document.querySelectorAll(".feel-select button").forEach(function (b) { b.classList.remove("sel"); });
      pickFeel.classList.add("sel");
      document.getElementById("feel-hidden").value = pickFeel.getAttribute("data-pick-feel");
      return;
    }
  });

  document.addEventListener("submit", function (ev) {
    var form = ev.target.closest("form[data-form]");
    if (!form) return;
    ev.preventDefault();
    var type = form.getAttribute("data-form");
    var fd = new FormData(form);
    if (type === "creneau") {
      var jourRaw = fd.get("jour");
      var jour = jourRaw === "" || jourRaw === null ? null : Number(jourRaw);
      var activiteId = fd.get("activiteId");
      if (!activiteId) { toast("Choisis une activité"); return; }
      var id = form.getAttribute("data-id");
      var payload = { id: id || uid(), jour: jour, activiteId: activiteId, valeur: fd.get("valeur"), note: (fd.get("note") || "").trim() };
      if (id) {
        state.programme = state.programme.map(function (c) { return c.id === id ? payload : c; });
      } else {
        state.programme.push(payload);
      }
      save(); state.modal = null; state.newActivite = false; R(); toast("Programme mis à jour");
      return;
    }
    if (type === "journal") {
      var activiteId2 = fd.get("activiteId");
      if (!activiteId2) { toast("Choisis une activité"); return; }
      var id2 = form.getAttribute("data-id");
      var creneauId = form.getAttribute("data-creneau") || null;
      var payload2 = { id: id2 || uid(), date: fd.get("date"), activiteId: activiteId2, valeur: fd.get("valeur"), note: (fd.get("note") || "").trim(), ressenti: fd.get("ressenti") ? Number(fd.get("ressenti")) : null, creneauId: creneauId || null };
      if (id2) {
        state.journal = state.journal.map(function (e) { return e.id === id2 ? payload2 : e; });
      } else {
        state.journal.push(payload2);
      }
      save(); state.modal = null; state.newActivite = false; R(); toast("Séance enregistrée 💪");
      return;
    }
  });

  document.addEventListener("change", function (ev) {
    if (ev.target && ev.target.id === "import-file") importData(ev.target.files[0]);
  });

  function captureModalFormState() {
    var form = document.querySelector("#modal-host form[data-form]");
    if (!form || !state.modal) return;
    var type = form.getAttribute("data-form");
    var fd = new FormData(form);
    if (type === "creneau") {
      var jourRaw = fd.get("jour");
      state.modal.data = {
        id: form.getAttribute("data-id") || null,
        jour: jourRaw === "" || jourRaw === null ? null : Number(jourRaw),
        activiteId: fd.get("activiteId"),
        valeur: fd.get("valeur"),
        note: fd.get("note")
      };
    } else if (type === "journal") {
      state.modal.data = {
        id: form.getAttribute("data-id") || null,
        date: fd.get("date"),
        activiteId: fd.get("activiteId"),
        valeur: fd.get("valeur"),
        note: fd.get("note"),
        ressenti: fd.get("ressenti") ? Number(fd.get("ressenti")) : null,
        creneauId: form.getAttribute("data-creneau") || null
      };
    }
  }

  function addActivite() {
    var nom = (document.getElementById("na-nom").value || "").trim();
    var emoji = (document.getElementById("na-emoji").value || "🏃").trim() || "🏃";
    var unite = document.getElementById("na-unite").value;
    if (!nom) { toast("Donne un nom à l'activité"); return; }
    var palette = ["#ff5b45", "#0f7a6b", "#e8a53d", "#5b6ee8", "#c17bd6", "#2fa8c9", "#8a8578", "#1b8fd1"];
    var couleur = palette[state.activites.length % palette.length];
    var a = { id: uid(), nom: nom, emoji: emoji, unite: unite, couleur: couleur };
    captureModalFormState();
    state.activites.push(a);
    save();
    if (state.modal && state.modal.data) state.modal.data.activiteId = a.id;
    R();
    toast("Activité ajoutée");
  }

  function exportData() {
    var d = { activites: state.activites, programme: state.programme, journal: state.journal, exportedAt: new Date().toISOString() };
    var blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "programme-sport-" + todayISO() + ".json";
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
        if (!d || !Array.isArray(d.activites)) throw new Error("format invalide");
        state.activites = d.activites; state.programme = d.programme || []; state.journal = d.journal || [];
        save(); state.modal = null; R(); toast("Import réussi");
      } catch (e) { toast("Fichier invalide"); }
    };
    reader.readAsText(file);
  }

  function resetData() {
    if (!confirm("Supprimer toutes les données (programme + journal) ? Cette action est irréversible.")) return;
    state.activites = ACTIVITES_DEFAULT.slice(); state.programme = []; state.journal = [];
    save(); state.modal = null; R(); toast("Données réinitialisées");
  }

  // ---------- boot ----------
  R();
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function () {});
    });
  }
})();
