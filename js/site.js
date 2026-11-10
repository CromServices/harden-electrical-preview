(function () {
  var KEY = "harden-theme";
  var root = document.documentElement;

  function mode() {
    var t = root.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return "system";
  }

  function apply(next) {
    if (next !== "light" && next !== "dark") next = "system";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch (err) {}
    var buttons = document.querySelectorAll("[data-theme-set]");
    for (var i = 0; i < buttons.length; i++) {
      var value = buttons[i].getAttribute("data-theme-set");
      buttons[i].setAttribute("aria-pressed", value === next ? "true" : "false");
    }
  }

  var buttons = document.querySelectorAll("[data-theme-set]");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function (event) {
      apply(event.currentTarget.getAttribute("data-theme-set"));
    });
  }
  apply(mode());

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

  var dialog = document.getElementById("lightbox");
  var dialogImg = dialog ? dialog.querySelector("img") : null;
  function closeLightbox() {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
  }
  if (dialog && dialogImg) {
    var triggers = document.querySelectorAll("[data-lightbox]");
    for (var t = 0; t < triggers.length; t++) {
      triggers[t].addEventListener("click", function (event) {
        var btn = event.currentTarget;
        dialogImg.src = btn.getAttribute("data-full") || "";
        dialogImg.alt = btn.getAttribute("data-alt") || "";
        if (typeof dialog.showModal === "function") dialog.showModal();
      });
    }
    var closer = dialog.querySelector(".lightbox-close");
    if (closer) closer.addEventListener("click", closeLightbox);
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeLightbox();
    });
  }

  var forms = document.querySelectorAll("form[data-form]");
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
