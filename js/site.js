(function () {
  var KEY = "harden-theme";
  var root = document.documentElement;
  var JOBS = [
    "Rural",
    "Commercial",
    "Industrial",
    "Switch Boards",
    "Test & Tag",
    "Evaporative Air-Conditioning",
    "Split Systems",
    "Ducted Reverse Cycle",
    "Data & Phone",
    "Level 2 Accreditation",
    "TV Antennas",
    "Underground Power and Trenching",
    "Stove and Hot Water Repairs"
  ];
  var TIMES = ["Morning", "Midday", "Afternoon"];
  var WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function systemDark() {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (err) {
      return false;
    }
  }

  function saved() {
    try {
      var t = localStorage.getItem(KEY);
      if (t === "light" || t === "dark") return t;
    } catch (err) {}
    return "";
  }

  function effective() {
    var t = saved();
    if (t) return t;
    var attr = root.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    return systemDark() ? "dark" : "light";
  }

  function apply(mode, persist) {
    if (mode !== "light" && mode !== "dark") return;
    root.setAttribute("data-theme", mode);
    if (persist) {
      try {
        localStorage.setItem(KEY, mode);
      } catch (err) {}
    }
  }

  var start = saved();
  if (start) apply(start, false);

  var toggles = document.querySelectorAll("[data-theme-toggle]");
  for (var i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener("click", function () {
      apply(effective() === "dark" ? "light" : "dark", true);
    });
  }

  try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (!saved()) root.removeAttribute("data-theme");
    });
  } catch (err) {}

  var reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (err) {}
  var reveals = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      for (var r = 0; r < entries.length; r++) {
        if (entries[r].isIntersecting) {
          entries[r].target.classList.add("is-in");
          io.unobserve(entries[r].target);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    for (var k = 0; k < reveals.length; k++) io.observe(reveals[k]);
  } else {
    for (var n = 0; n < reveals.length; n++) reveals[n].classList.add("is-in");
  }

  function enabledRadios(group) {
    return group.querySelectorAll('[role="radio"]:not([aria-disabled="true"])');
  }

  function selectRadio(group, btn) {
    if (!btn || btn.getAttribute("aria-disabled") === "true") return;
    var radios = group.querySelectorAll('[role="radio"]');
    for (var i = 0; i < radios.length; i++) {
      var on = radios[i] === btn;
      radios[i].setAttribute("aria-checked", on ? "true" : "false");
      radios[i].tabIndex = on ? 0 : -1;
    }
    btn.focus();
    var form = group.closest("form");
    if (form) updateSummary(form);
  }

  function bindRadiogroup(group) {
    group.addEventListener("click", function (event) {
      var btn = event.target.closest('[role="radio"]');
      if (!btn || !group.contains(btn)) return;
      selectRadio(group, btn);
    });
    group.addEventListener("keydown", function (event) {
      var items = enabledRadios(group);
      if (!items.length) return;
      var current = document.activeElement;
      var idx = Array.prototype.indexOf.call(items, current);
      if (idx < 0) idx = 0;
      var next = idx;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (idx + 1) % items.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (idx - 1 + items.length) % items.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = items.length - 1;
      else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        selectRadio(group, current);
        return;
      } else return;
      event.preventDefault();
      selectRadio(group, items[next]);
    });
  }

  function dateLabel(d) {
    return WEEKDAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
  }

  function checkedValue(group) {
    var on = group.querySelector('[role="radio"][aria-checked="true"]');
    return on ? on.getAttribute("data-value") : "";
  }

  function updateSummary(form) {
    var days = form.querySelector("[data-book-days]");
    var times = form.querySelector("[data-book-times]");
    var line = form.querySelector("[data-book-summary]");
    if (!line) return;
    var day = days ? checkedValue(days) : "";
    var time = times ? checkedValue(times) : "";
    if (day && time) line.textContent = day + ", " + time;
    else if (day) line.textContent = day;
    else line.textContent = "Choose a day and time";
  }

  function showError(form, name, on) {
    var el = form.querySelector('[data-error="' + name + '"]');
    if (!el) return;
    el.hidden = !on;
  }

  function fillDays(group) {
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    var html = "";
    for (var i = 0; i < 14; i++) {
      var d = new Date(start.getTime());
      d.setDate(start.getDate() + i);
      var weekend = d.getDay() === 0 || d.getDay() === 6;
      var label = dateLabel(d);
      html += '<button type="button" class="date-chip" role="radio" aria-checked="false" data-value="' +
        label + '"' + (weekend ? ' aria-disabled="true" tabindex="-1"' : ' tabindex="-1"') +
        '>' + WEEKDAYS[d.getDay()] + "<small>" + d.getDate() + " " + MONTHS[d.getMonth()] + "</small></button>";
    }
    group.innerHTML = html;
    var first = group.querySelector('[role="radio"]:not([aria-disabled="true"])');
    if (first) first.tabIndex = 0;
  }

  function fillJobs(group) {
    var html = "";
    for (var i = 0; i < JOBS.length; i++) {
      html += '<button type="button" class="pill" role="radio" aria-checked="false" tabindex="-1" data-value="' +
        JOBS[i].replace(/"/g, "") + '">' + JOBS[i] + "</button>";
    }
    group.innerHTML = html;
    var first = group.querySelector('[role="radio"]');
    if (first) first.tabIndex = 0;
  }

  var widgets = document.querySelectorAll("form.book-widget");
  for (var w = 0; w < widgets.length; w++) {
    (function (form) {
      var days = form.querySelector("[data-book-days]");
      var times = form.querySelector("[data-book-times]");
      var jobs = form.querySelector("[data-book-jobs]");
      if (days) fillDays(days);
      if (jobs) fillJobs(jobs);
      if (days) bindRadiogroup(days);
      if (times) {
        var timeBtns = times.querySelectorAll('[role="radio"]');
        for (var t = 0; t < timeBtns.length; t++) timeBtns[t].tabIndex = t === 0 ? 0 : -1;
        bindRadiogroup(times);
      }
      if (jobs) bindRadiogroup(jobs);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var day = days ? checkedValue(days) : "";
        var time = times ? checkedValue(times) : "";
        var phone = form.querySelector('[name="b-phone"]');
        var phoneVal = phone ? String(phone.value).replace(/\s+/g, "") : "";
        var missDay = !day;
        var missTime = !time;
        var missPhone = !phoneVal;
        showError(form, "day", missDay);
        showError(form, "time", missTime);
        showError(form, "phone", missPhone);
        if (missDay || missTime || missPhone) {
          if (missDay && days) days.focus();
          else if (missTime && times) times.querySelector('[role="radio"]') && times.querySelector('[role="radio"]').focus();
          else if (phone) phone.focus();
          return;
        }
        var thanks = form.nextElementSibling;
        form.hidden = true;
        if (thanks && thanks.classList.contains("thanks")) {
          thanks.hidden = false;
          if (typeof thanks.focus === "function") thanks.focus();
        }
      });
    })(widgets[w]);
  }

  var forms = document.querySelectorAll("form[data-form]:not(.book-widget)");
  for (var j = 0; j < forms.length; j++) {
    forms[j].addEventListener("submit", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var form = event.currentTarget;
      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        if (typeof form.reportValidity === "function") form.reportValidity();
        return;
      }
      var thanks = form.nextElementSibling;
      form.hidden = true;
      if (thanks && thanks.classList.contains("thanks")) {
        thanks.hidden = false;
        if (typeof thanks.focus === "function") thanks.focus();
      }
    });
  }
})();
