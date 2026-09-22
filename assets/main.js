/* ============================================================
   Jorge Gabín — site behaviour
   1. theme toggle (system / light / dark)
   2. news list, loaded from assets/news.json
   3. active-section highlighting in the CV sidebar
   ============================================================ */

/* ---------- 1. theme ---------- */

(function () {
  var root = document.documentElement;
  var modes = ["system", "light", "dark"];
  var query = window.matchMedia("(prefers-color-scheme: dark)");

  function apply(mode) {
    root.setAttribute("data-mode", mode);
    var dark = mode === "dark" || (mode === "system" && query.matches);
    root.setAttribute("data-theme", dark ? "dark" : "light");
  }

  var saved = "system";
  try { saved = localStorage.getItem("theme-mode") || "system"; } catch (e) {}
  apply(modes.indexOf(saved) > -1 ? saved : "system");

  var button = document.getElementById("theme-toggle");
  if (button) {
    button.addEventListener("click", function () {
      var next = modes[(modes.indexOf(root.getAttribute("data-mode")) + 1) % 3];
      apply(next);
      try { localStorage.setItem("theme-mode", next); } catch (e) {}
    });
  }

  query.addEventListener("change", function () {
    if (root.getAttribute("data-mode") === "system") apply("system");
  });
})();

/* ---------- 2. news ---------- */

(function () {
  var list = document.getElementById("news-list");
  if (!list) return;

  fetch("assets/news.json", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("news.json returned " + response.status);
      return response.json();
    })
    .then(function (items) {
      if (!Array.isArray(items) || !items.length) throw new Error("news.json is empty");

      list.innerHTML = "";

      items.forEach(function (item) {
        var row = document.createElement("tr");

        var when = document.createElement("td");
        when.className = "when";
        when.textContent = item.date || "";

        var body = document.createElement("td");
        body.innerHTML = item.text || "";

        /* optional LinkedIn post embed.
           Open the post on LinkedIn, use the ... menu, "Embed this post",
           and copy the urn:li:share:... (or urn:li:ugcPost:...) id from the src. */
        if (item.linkedin) {
          var frame = document.createElement("iframe");
          frame.className = "embed";
          frame.src = "https://www.linkedin.com/embed/feed/update/" + item.linkedin;
          frame.height = item.linkedinHeight || 420;
          frame.title = "LinkedIn post";
          frame.loading = "lazy";
          frame.setAttribute("frameborder", "0");
          frame.setAttribute("allowfullscreen", "");
          body.appendChild(frame);
        }

        row.appendChild(when);
        row.appendChild(body);
        list.appendChild(row);
      });
    })
    .catch(function (error) {
      /* leave whatever is already in the table as the fallback */
      console.warn("Could not load news:", error.message);
    });
})();

/* ---------- 3. cv sidebar ---------- */

(function () {
  var links = document.querySelectorAll(".toc a");
  if (!links.length || !("IntersectionObserver" in window)) return;

  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (a) { a.classList.remove("active"); });
      var active = byId[entry.target.id];
      if (active) active.classList.add("active");
    });
  }, { rootMargin: "-20% 0px -70% 0px" });

  Object.keys(byId).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) observer.observe(section);
  });
})();
