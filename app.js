const apps = [
  {
    id: 1,
    name: "RuStore",
    dev: "RuStore",
    rating: 4.7,
    category: "Магазины",
    desc: "Каталог приложений для российских пользователей.",
    icon: "icon.svg"
  },
  {
    id: 2,
    name: "ВКонтакте",
    dev: "VK",
    rating: 4.6,
    category: "Социальные",
    desc: "Общение, музыка, видео и сообщества.",
    icon: "icon.svg"
  },
  {
    id: 3,
    name: "Госуслуги",
    dev: "Минцифры России",
    rating: 4.8,
    category: "Государство",
    desc: "Государственные услуги в одном приложении.",
    icon: "icon.svg"
  },
  {
    id: 4,
    name: "СберБанк",
    dev: "Сбер",
    rating: 4.9,
    category: "Финансы",
    desc: "Банковские сервисы и платежи.",
    icon: "icon.svg"
  }
];

let favorites = load("favorites", []);
let history = load("history", []);
let installed = load("installed", []);

let deferredPrompt = null;

const app = document.getElementById("app");

function load(key, fallback) {
  try {
    return JSON.parse(
      localStorage.getItem(key)
    ) || fallback;
  } catch {
    return fallback;
  }
}

function save() {
  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );

  localStorage.setItem(
    "history",
    JSON.stringify(history)
  );

  localStorage.setItem(
    "installed",
    JSON.stringify(installed)
  );
}

/* -------------------------
   PWA INSTALL
------------------------- */

window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    deferredPrompt = event;

    showInstallBanner();
  }
);

window.addEventListener(
  "appinstalled",
  () => {

    deferredPrompt = null;

    const banner =
      document.getElementById(
        "installBanner"
      );

    if (banner) {
      banner.remove();
    }
  }
);

function showInstallBanner() {

  if (
    document.getElementById(
      "installBanner"
    )
  ) {
    return;
  }

  const banner =
    document.createElement("div");

  banner.id = "installBanner";

  banner.style.cssText = `
    position:fixed;
    left:12px;
    right:12px;
    bottom:88px;
    z-index:999;
    background:#151b2b;
    border:1px solid rgba(255,255,255,.1);
    border-radius:18px;
    padding:14px;
    box-shadow:0 15px 40px rgba(0,0,0,.4);
  `;

  banner.innerHTML = `

    <div
      style="
        display:flex;
        align-items:center;
        gap:12px;
      "
    >

      <img
        src="icon.svg"
        style="
          width:48px;
          height:48px;
          border-radius:13px;
        "
      >

      <div style="flex:1">

        <div
          style="
            font-weight:700;
            font-size:15px;
          "
        >
          Установить RuStore
        </div>

        <div
          style="
            color:#8b8f99;
            font-size:12px;
            margin-top:3px;
          "
        >
          Добавить приложение
          на устройство
        </div>

      </div>

      <button
        id="installButton"
        class="primary"
        style="
          min-height:40px;
          padding:0 12px;
        "
      >
        Установить
      </button>

    </div>
  `;

  document.body.appendChild(
    banner
  );

  document
    .getElementById("installButton")
    .onclick = installPWA;
}

async function installPWA() {

  if (!deferredPrompt) {

    alert(
      "На iPhone используйте меню «Поделиться» → «На экран Домой»."
    );

    return;
  }

  deferredPrompt.prompt();

  await deferredPrompt.userChoice;

  deferredPrompt = null;

  const banner =
    document.getElementById(
      "installBanner"
    );

  if (banner) {
    banner.remove();
  }
}

/* -------------------------
   HELPERS
------------------------- */

function getApp(id) {

  return apps.find(
    item => item.id === id
  );
}

function isFavorite(id) {

  return favorites.includes(id);
}

function isInstalled(id) {

  return installed.includes(id);
}

function toggleFavorite(id) {

  if (isFavorite(id)) {

    favorites =
      favorites.filter(
        item => item !== id
      );

  } else {

    favorites.push(id);
  }

  save();

  renderCurrent();
}

function addHistory(id) {

  history = [
    id,
    ...history.filter(
      item => item !== id
    )
  ].slice(0, 30);

  save();
}

/* -------------------------
   HOME
------------------------- */

function renderHome() {

  app.innerHTML = `

    <input
      id="search"
      class="search"
      placeholder="Поиск приложений"
      autocomplete="off"
    >

    <h1>
      Приложения
    </h1>

    <div id="appList"></div>
  `;

  const search =
    document.getElementById(
      "search"
    );

  function update() {

    const query =
      search.value
        .trim()
        .toLowerCase();

    const filtered =
      apps.filter(item =>
        (
          item.name +
          item.dev +
          item.desc +
          item.category
        )
          .toLowerCase()
          .includes(query)
      );

    const list =
      document.getElementById(
        "appList"
      );

    list.innerHTML =
      filtered.length
        ? filtered.map(renderCard).join("")
        : `
          <div class="empty">
            Ничего не найдено
          </div>
        `;
  }

  search.addEventListener(
    "input",
    update
  );

  update();
}

function renderCard(item) {

  return `

    <div class="card">

      <div class="row">

        <img
          class="icon"
          src="${item.icon}"
          alt="${item.name}"
        >

        <div style="flex:1">

          <div class="name">
            ${item.name}
          </div>

          <div class="muted">
            ${item.dev}
          </div>

          <div class="rating">
            ★ ${item.rating}
          </div>

        </div>

        <button
          class="heart"
          onclick="
            toggleFavorite(${item.id})
          "
        >
          ${
            isFavorite(item.id)
              ? "♥"
              : "♡"
          }
        </button>

      </div>

      <div class="desc">
        ${item.desc}
      </div>

      <div
        class="muted"
        style="margin-top:8px"
      >
        ${item.category}
      </div>

      <button
        class="secondary"
        style="
          width:100%;
          margin-top:14px;
        "
        onclick="
          renderApp(${item.id})
        "
      >
        ${
          isInstalled(item.id)
            ? "Открыть"
            : "Подробнее"
        }
      </button>

    </div>
  `;
}

/* -------------------------
   APP PAGE
------------------------- */

function renderApp(id) {

  const item = getApp(id);

  if (!item) return;

  addHistory(id);

  app.innerHTML = `

    <button
      class="back"
      onclick="renderHome()"
    >
      ‹ Назад
    </button>

    <div class="card">

      <div class="row">

        <img
          class="icon"
          src="${item.icon}"
          alt="${item.name}"
        >

        <div style="flex:1">

          <div class="name">
            ${item.name}
          </div>

          <div class="muted">
            ${item.dev}
          </div>

          <div class="rating">
            ★ ${item.rating}
          </div>

        </div>

        <button
          class="heart"
          onclick="
            toggleFavorite(${item.id})
          "
        >
          ${
            isFavorite(item.id)
              ? "♥"
              : "♡"
          }
        </button>

      </div>

      <div class="desc">
        ${item.desc}
      </div>

      <div
        class="muted"
        style="margin-top:12px"
      >
        Категория:
        ${item.category}
      </div>

      <button
        class="primary"
        style="
          width:100%;
          margin-top:20px;
          height:48px;
        "
        onclick="
          ${
            isInstalled(item.id)
              ? `launchApp(${item.id})`
              : `installApp(${item.id})`
          }
        "
      >
        ${
          isInstalled(item.id)
            ? "Открыть"
            : "Установить"
        }
      </button>

      ${
        isInstalled(item.id)
          ? `
            <div
              class="success"
              style="
                text-align:center;
                margin-top:12px;
              "
            >
              ✓ Установлено
            </div>
          `
          : ""
      }

    </div>

    <h2>
      О приложении
    </h2>

    <div class="card">

      <div class="desc">
        ${item.desc}
      </div>

      <div
        class="desc"
        style="margin-top:10px"
      >
        Версия 1.0.0
      </div>

      <div
        class="desc"
        style="margin-top:5px"
      >
        Бесплатно
      </div>

    </div>

    <h2>
      Отзывы
    </h2>

    <div class="card">

      <b>
        Пользователь
      </b>

      <div
        style="
          color:#d4af37;
          margin-top:5px;
        "
      >
        ★★★★★
      </div>

      <div
        class="muted"
        style="margin-top:5px"
      >
        Отличное приложение.
      </div>

    </div>

  `;
}

/* -------------------------
   DEMO INSTALL
------------------------- */

function installApp(id) {

  const item = getApp(id);

  if (!item) return;

  let progress = 0;

  app.innerHTML = `

    <div
      class="card install-card"
      style="margin-top:40px"
    >

      <img
        class="large-icon"
        src="${item.icon}"
      >

      <h1>
        ${item.name}
      </h1>

      <p
        id="installStatus"
        class="muted"
        style="margin-top:10px"
      >
        Установка…
      </p>

      <div class="progress">

        <div
          id="progressBar"
          class="progress-bar"
        ></div>

      </div>

      <div id="progressValue">
        0%
      </div>

    </div>
  `;

  const timer =
    setInterval(() => {

      progress += 10;

      const bar =
        document.getElementById(
          "progressBar"
        );

      const value =
        document.getElementById(
          "progressValue"
        );

      if (bar) {
        bar.style.width =
          progress + "%";
      }

      if (value) {
        value.textContent =
          progress + "%";
      }

      if (progress >= 100) {

        clearInterval(timer);

        if (
          !installed.includes(id)
        ) {
          installed.push(id);
        }

        save();

        document.getElementById(
          "installStatus"
        ).innerHTML =
          '<span class="success">✓ Установлено</span>';

        setTimeout(() => {
          renderApp(id);
        }, 700);
      }

    }, 150);
}

/* -------------------------
   LAUNCH
------------------------- */

function launchApp(id) {

  const item = getApp(id);

  if (!item) return;

  app.innerHTML = `

    <div
      class="card install-card"
      style="margin-top:40px"
    >

      <img
        class="large-icon"
        src="${item.icon}"
      >

      <h1>
        ${item.name}
      </h1>

      <div
        class="success"
        style="margin-top:12px"
      >
        ✓ Приложение запущено
      </div>

      <button
        class="secondary"
        style="
          width:100%;
          margin-top:25px;
        "
        onclick="
          renderApp(${item.id})
        "
      >
        Вернуться
      </button>

    </div>
  `;
}

/* -------------------------
   FAVORITES
------------------------- */

function renderFavorites() {

  const list =
    apps.filter(
      item => isFavorite(item.id)
    );

  app.innerHTML = `

    <h1>
      Избранное
    </h1>

    ${
      list.length
        ? list
            .map(renderCard)
            .join("")
        : `
          <div class="empty">
            Нет избранных приложений.
            <br><br>
            Добавляй приложения
            кнопкой ♡
          </div>
        `
    }
  `;
}

/* -------------------------
   PROFILE
------------------------- */

function renderProfile() {

  const historyApps =
    history
      .map(id => getApp(id))
      .filter(Boolean);

  app.innerHTML = `

    <h1>
      Профиль
    </h1>

    <div class="card">

      <div class="row">

        <div
          style="
            width:64px;
            height:64px;
            border-radius:50%;
            background:#111;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:26px;
            color:#d4af37;
          "
        >
          V
        </div>

        <div>

          <div class="name">
            Пользователь
          </div>

          <div class="muted">
            Локальный профиль
          </div>

        </div>

      </div>

    </div>

    <div class="card">

      <div>
        Избранное:
        <b>${favorites.length}</b>
      </div>

      <div style="margin-top:10px">
        Установлено:
        <b>${installed.length}</b>
      </div>

      <div style="margin-top:10px">
        История:
        <b>${history.length}</b>
      </div>

    </div>

    ${
      historyApps.length
        ? `
          <h2>
            История
          </h2>

          ${historyApps
            .map(renderCard)
            .join("")}
        `
        : ""
    }

    <button
      class="secondary"
      style="
        width:100%;
        margin-top:10px;
      "
      onclick="
        history=[];
        save();
        renderProfile();
      "
    >
      Очистить историю
    </button>

  `;
}

/* -------------------------
   NAVIGATION
------------------------- */

function renderCurrent() {

  const active =
    document.querySelector(
      ".tab.active"
    );

  const tab =
    active
      ? active.dataset.tab
      : "home";

  if (tab === "home") {
    renderHome();
  }

  if (tab === "favorites") {
    renderFavorites();
  }

  if (tab === "profile") {
    renderProfile();
  }
}

document
  .querySelectorAll(".tab")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".tab")
          .forEach(item =>
            item.classList.remove(
              "active"
            )
          );

        button.classList.add(
          "active"
        );

        renderCurrent();
      }
    );

  });

/* -------------------------
   SERVICE WORKER
------------------------- */

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("sW.js")
        .then(() => {
          console.log(
            "RuStore Service Worker активирован"
          );
        })
        .catch(error => {
          console.error(
            "Service Worker:",
            error
          );
        });

    }
  );
}

renderHome();
