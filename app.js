/*
 * iOS App Hub
 * Frontend V3.1
 *
 * Discovery → Availability → Recovery
 *
 * ВАЖНО:
 * - frontend не скачивает IPA напрямую;
 * - Apple ID и пароль не запрашиваются;
 * - native installation остаётся отдельным будущим backend-flow;
 * - recovery сейчас является информационным экраном.
 */

const CONFIG = {
  apiBase: "",
  catalogEndpoint: "/api/apps",
  marketplaceName: "iOS App Hub",
  version: "3.1.0"
};

/* --------------------------------------------------
   КАТАЛОГ
-------------------------------------------------- */

const apps = [
  {
    id: "vk",
    name: "ВКонтакте",
    developer: "VK",
    rating: 4.6,
    category: "Социальные",
    description:
      "Общение, музыка, видео и сообщества.",
    icon: "icon.svg",
    nativeIOSAvailable: false,
    appStoreStatus: "unavailable",
    recoverySupported: true,
    webUrl: "https://m.vk.ru/feed",
    officialUrl: "https://vk.com/"
  },

  {
    id: "gosuslugi",
    name: "Госуслуги",
    developer: "Минцифры России",
    rating: 4.8,
    category: "Государство",
    description:
      "Государственные услуги в одном приложении.",
    icon: "icon.svg",
    nativeIOSAvailable: false,
    appStoreStatus: "unavailable",
    recoverySupported: true,
    webUrl: "https://www.gosuslugi.ru/",
    officialUrl: "https://www.gosuslugi.ru/"
  },

  {
    id: "sber",
    name: "СберБанк",
    developer: "Сбер",
    rating: 4.9,
    category: "Финансы",
    description:
      "Банковские сервисы и платежи.",
    icon: "icon.svg",
    nativeIOSAvailable: false,
    appStoreStatus: "unavailable",
    recoverySupported: true,
    webUrl: "https://www.sberbank.ru/",
    officialUrl: "https://www.sberbank.ru/"
  },

  {
    id: "rustore",
    name: "RuStore",
    developer: "RuStore",
    rating: 4.7,
    category: "Магазины",
    description:
      "Каталог приложений для российских пользователей.",
    icon: "icon.svg",
    nativeIOSAvailable: false,
    appStoreStatus: "unavailable",
    recoverySupported: false,
    webUrl: "https://www.rustore.ru/",
    officialUrl: "https://www.rustore.ru/"
  }
];

/* --------------------------------------------------
   STATE
-------------------------------------------------- */

let favorites = load("favorites", []);
let history = load("history", []);

let currentView = "home";
let currentCategory = "Все";

/* --------------------------------------------------
   ROOT
-------------------------------------------------- */

const appRoot =
  document.getElementById("app");

if (!appRoot) {
  throw new Error(
    "Element #app not found"
  );
}

/* --------------------------------------------------
   STORAGE
-------------------------------------------------- */

function load(key, fallback) {

  try {

    const value =
      JSON.parse(
        localStorage.getItem(key)
      );

    return Array.isArray(value)
      ? value
      : fallback;

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
}

/* --------------------------------------------------
   DEVICE
-------------------------------------------------- */

function isIOS() {

  return /iPhone|iPad|iPod/i.test(
    navigator.userAgent
  );
}

function isAndroid() {

  return /Android/i.test(
    navigator.userAgent
  );
}

function isSafari() {

  return (
    /Safari/i.test(
      navigator.userAgent
    ) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(
      navigator.userAgent
    )
  );
}

function isStandalone() {

  return (
    window.navigator.standalone === true ||
    (
      window.matchMedia &&
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches
    )
  );
}

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

function getApp(id) {

  return apps.find(
    item => item.id === id
  );
}

function isFavorite(id) {

  return favorites.includes(id);
}

function getCategories() {

  return [
    "Все",
    ...new Set(
      apps.map(
        item => item.category
      )
    )
  ];
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

/* --------------------------------------------------
   STATUS
-------------------------------------------------- */

function getStatus(item) {

  if (item.nativeIOSAvailable) {

    return {
      text: "Доступно для установки",
      className: "status-available"
    };
  }

  if (item.recoverySupported) {

    return {
      text: "Проверить восстановление",
      className: "status-recovery"
    };
  }

  return {
    text: "Официальный источник",
    className: "status-web"
  };
}

function renderStatus(item) {

  const status =
    getStatus(item);

  return `
    <div
      class="status ${status.className}"
    >
      ${escapeHTML(status.text)}
    </div>
  `;
}

/* --------------------------------------------------
   CARD
-------------------------------------------------- */

function renderCard(item) {

  return `
    <article
      class="card app-card"
    >

      <div class="row">

        <img
          class="icon"
          src="${escapeAttribute(item.icon)}"
          alt="${escapeAttribute(item.name)}"
        >

        <div class="app-info">

          <div class="name">
            ${escapeHTML(item.name)}
          </div>

          <div class="muted developer">
            ${escapeHTML(item.developer)}
          </div>

          <div class="rating">
            ★ ${Number(item.rating).toFixed(1)}
          </div>

          ${renderStatus(item)}

        </div>

        <button
          class="heart"
          type="button"
          aria-label="${
            isFavorite(item.id)
              ? "Убрать из избранного"
              : "Добавить в избранное"
          }"
          onclick="
            toggleFavorite('${escapeAttribute(item.id)}')
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
        ${escapeHTML(item.description)}
      </div>

      <div class="app-meta">

        <span>
          ${escapeHTML(item.category)}
        </span>

      </div>

      <button
        class="primary"
        type="button"
        onclick="
          openApp('${escapeAttribute(item.id)}')
        "
      >
        Открыть
      </button>

    </article>
  `;
}

/* --------------------------------------------------
   HOME
-------------------------------------------------- */

function renderHome() {

  currentView = "home";

  appRoot.innerHTML = `

    <div class="brand">

      <img
        src="./icon.svg?v=20260916-4"
        alt="iOS App Hub"
      >

      <div class="brand-text">

        <div class="brand-name">
          iOS App Hub
        </div>

        <div class="brand-subtitle">
          Приложения для iPhone
        </div>

      </div>

    </div>

    <section class="hero">

      <h1>
        Российские приложения
        для iPhone
      </h1>

      <p>
        Найди приложение, проверь доступность
        и выбери официальный способ использования.
      </p>

    </section>

    <input
      id="search"
      class="search"
      type="search"
      placeholder="Поиск приложений"
      autocomplete="off"
      aria-label="Поиск приложений"
    >

    <div class="categories">

      ${getCategories()
        .map(category => `
          <button
            class="category ${
              currentCategory === category
                ? "active"
                : ""
            }"
            type="button"
            data-category="${escapeAttribute(category)}"
          >
            ${escapeHTML(category)}
          </button>
        `)
        .join("")}

    </div>

    <div class="section-header">

      <h2 class="section-title">
        Каталог
      </h2>

      <span
        id="appCount"
        class="section-count"
      ></span>

    </div>

    <div id="appList"></div>
  `;

  const search =
    document.getElementById(
      "search"
    );

  const list =
    document.getElementById(
      "appList"
    );

  const count =
    document.getElementById(
      "appCount"
    );

  document
    .querySelectorAll(".category")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          currentCategory =
            button.dataset.category;

          renderHome();
        }
      );

    });

  function update() {

    const query =
      search.value
        .trim()
        .toLowerCase();

    const filtered =
      apps.filter(item => {

        const categoryMatches =
          currentCategory === "Все" ||
          item.category === currentCategory;

        const text = [
          item.name,
          item.developer,
          item.description,
          item.category
        ]
          .join(" ")
          .toLowerCase();

        return (
          categoryMatches &&
          text.includes(query)
        );
      });

    count.textContent =
      formatAppCount(
        filtered.length
      );

    list.innerHTML =
      filtered.length
        ? filtered
            .map(renderCard)
            .join("")
        : `
          <div class="empty">
            По вашему запросу
            ничего не найдено.
          </div>
        `;
  }

  search.addEventListener(
    "input",
    update
  );

  update();
}

/* --------------------------------------------------
   APP DETAIL
-------------------------------------------------- */

function openApp(id) {

  const item =
    getApp(id);

  if (!item) return;

  currentView = "app";

  addHistory(id);

  appRoot.innerHTML = `

    <button
      class="back"
      type="button"
      onclick="renderHome()"
    >
      ‹ Назад
    </button>

    <div class="brand">

      <img
        src="./icon.svg?v=20260916-4"
        alt="iOS App Hub"
      >

      <div class="brand-text">

        <div class="brand-name">
          iOS App Hub
        </div>

        <div class="brand-subtitle">
          Карточка приложения
        </div>

      </div>

    </div>

    <div class="card">

      <div class="row">

        <img
          class="icon"
          src="${escapeAttribute(item.icon)}"
          alt="${escapeAttribute(item.name)}"
        >

        <div class="app-info">

          <div class="name">
            ${escapeHTML(item.name)}
          </div>

          <div class="muted developer">
            ${escapeHTML(item.developer)}
          </div>

          <div class="rating">
            ★ ${Number(item.rating).toFixed(1)}
          </div>

          ${renderStatus(item)}

        </div>

        <button
          class="heart"
          type="button"
          onclick="
            toggleFavorite('${escapeAttribute(item.id)}')
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
        ${escapeHTML(item.description)}
      </div>

      <div class="app-meta">
        ${escapeHTML(item.category)}
      </div>

      ${renderInstallArea(item)}

    </div>

    <h2>
      О приложении
    </h2>

    <div class="card">

      <div class="desc">
        ${escapeHTML(item.description)}
      </div>

      <div class="desc">
        Версия:
        ожидается из каталога
      </div>

      <div class="desc">
        Распространение:
        официальный канал
      </div>

    </div>

  `;
}

/* --------------------------------------------------
   INSTALL AREA
-------------------------------------------------- */

function renderInstallArea(item) {

  if (isIOS()) {

    if (item.nativeIOSAvailable) {

      return `
        <div class="install-box">

          <h3>
            Установка
          </h3>

          <p class="desc">
            Доступен поддерживаемый
            официальный способ установки.
          </p>

          <button
            class="primary"
            type="button"
            onclick="
              installNative('${escapeAttribute(item.id)}')
            "
          >
            Установить приложение
          </button>

        </div>
      `;
    }

    return `
      <div class="install-box">

        <h3>
          Доступность на iPhone
        </h3>

        <p class="desc">
          Нативная установка через
          ${escapeHTML(CONFIG.marketplaceName)}
          пока не подключена.
        </p>

        ${
          item.recoverySupported
            ? `
              <button
                class="primary"
                type="button"
                onclick="
                  openRecovery('${escapeAttribute(item.id)}')
                "
              >
                Проверить восстановление
              </button>
            `
            : ""
        }

        <button
          class="secondary"
          type="button"
          onclick="
            openWebVersion('${escapeAttribute(item.id)}')
          "
        >
          Открыть официальный сервис
        </button>

        ${
          item.id === "vk"
            ? `
              <button
                class="secondary"
                type="button"
                onclick="
                  showIOSInstructions('${escapeAttribute(item.id)}')
                "
              >
                Добавить веб-версию на экран Домой
              </button>
            `
            : ""
        }

      </div>
    `;
  }

  if (isAndroid()) {

    return `
      <div class="install-box">

        <h3>
          Android
        </h3>

        <p class="desc">
          Используй официальный источник
          приложения.
        </p>

        <button
          class="primary"
          type="button"
          onclick="
            openWebVersion('${escapeAttribute(item.id)}')
          "
        >
          Открыть официальный источник
        </button>

      </div>
    `;
  }

  return `
    <div class="install-box">

      <h3>
        Официальный источник
      </h3>

      <button
        class="primary"
        type="button"
        onclick="
          openWebVersion('${escapeAttribute(item.id)}')
        "
      >
        Открыть
      </button>

    </div>
  `;
}

/* --------------------------------------------------
   RECOVERY
-------------------------------------------------- */

function openRecovery(id) {

  const item =
    getApp(id);

  if (!item) return;

  currentView = "recovery";

  addHistory(id);

  appRoot.innerHTML = `

    <button
      class="back"
      type="button"
      onclick="
        openApp('${escapeAttribute(item.id)}')
      "
    >
      ‹ Назад
    </button>

    <div class="brand">

      <img
        src="./icon.svg?v=20260916-4"
        alt="iOS App Hub"
      >

      <div class="brand-text">

        <div class="brand-name">
          iOS App Hub
        </div>

        <div class="brand-subtitle">
          Восстановление приложения
        </div>

      </div>

    </div>

    <h1>
      Восстановление
    </h1>

    <div class="card">

      <div class="row">

        <img
          class="icon"
          src="${escapeAttribute(item.icon)}"
          alt="${escapeAttribute(item.name)}"
        >

        <div class="app-info">

          <div class="name">
            ${escapeHTML(item.name)}
          </div>

          <div class="muted">
            ${escapeHTML(item.developer)}
          </div>

        </div>

      </div>

      <h2>
        Проверка доступности
      </h2>

      <p class="desc">
        Если приложение ранее было
        связано с твоей учётной записью
        Apple, возможность официального
        восстановления может зависеть
        от текущего статуса приложения.
      </p>

      <p class="muted">
        iOS App Hub не запрашивает
        Apple ID или пароль на этом сайте.
      </p>

    </div>

    <div class="card">

      <h3>
        Текущий статус
      </h3>

      <p class="desc">
        Интеграция с реальным механизмом
        восстановления пока не подключена.
      </p>

      <p class="muted">
        Этот экран является частью
        продуктового интерфейса P0.
      </p>

    </div>

    <button
      class="secondary"
      style="width:100%"
      type="button"
      onclick="
        openWebVersion('${escapeAttribute(item.id)}')
      "
    >
      Открыть официальный источник
    </button>

  `;
}

/* --------------------------------------------------
   FUTURE NATIVE INSTALL
-------------------------------------------------- */

async function installNative(id) {

  const item =
    getApp(id);

  if (!item) return;

  try {

    const response =
      await fetch(
        `${CONFIG.apiBase}/api/install/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json"
          }
        }
      );

    if (!response.ok) {

      throw new Error(
        `Install API ${response.status}`
      );
    }

    const data =
      await response.json();

    if (
      !data ||
      !data.installUrl
    ) {

      throw new Error(
        "Install URL отсутствует"
      );
    }

    window.location.href =
      data.installUrl;

  } catch (error) {

    console.error(
      "Native installation:",
      error
    );

    showMessage(
      "Нативная установка пока не подключена."
    );
  }
}

/* --------------------------------------------------
   WEB
-------------------------------------------------- */

function openWebVersion(id) {

  const item =
    getApp(id);

  if (!item || !item.webUrl) {
    return;
  }

  window.location.href =
    item.webUrl;
}

/* --------------------------------------------------
   iOS WEB INSTRUCTIONS
-------------------------------------------------- */

function showIOSInstructions(id) {

  const item =
    getApp(id);

  if (!item) return;

  currentView = "instructions";

  appRoot.innerHTML = `

    <button
      class="back"
      type="button"
      onclick="
        openApp('${escapeAttribute(item.id)}')
      "
    >
      ‹ Назад
    </button>

    <h1>
      Веб-версия
    </h1>

    <div class="card">

      <div class="big-icon">
        📱
      </div>

      <h2>
        ${escapeHTML(item.name)}
      </h2>

      <p class="desc">
        Это веб-версия, а не IPA.
        iOS App Hub не выдаёт веб-сервис
        за нативное приложение.
      </p>

    </div>

    <div class="install-step">

      <h3>
        Шаг 1
      </h3>

      <p class="desc">
        Открой мобильную версию
        в Safari.
      </p>

      <button
        class="primary"
        type="button"
        onclick="
          openWebVersion('${escapeAttribute(item.id)}')
        "
      >
        Открыть ${escapeHTML(item.name)}
      </button>

    </div>

    <div class="install-step">

      <h3>
        Шаг 2
      </h3>

      <p class="desc">
        В Safari нажми
        «Поделиться».
      </p>

      <div class="big-icon">
        ⬆️
      </div>

    </div>

    <div class="install-step">

      <h3>
        Шаг 3
      </h3>

      <p class="desc">
        Выбери
        <b>«На экран Домой»</b>.
      </p>

    </div>

    <div class="install-step">

      <h3>
        Шаг 4
      </h3>

      <p class="desc">
        Нажми
        <b>«Добавить»</b>.
      </p>

    </div>

  `;
}

/* --------------------------------------------------
   FAVORITES
-------------------------------------------------- */

function renderFavorites() {

  currentView = "favorites";

  const list =
    apps.filter(
      item => isFavorite(item.id)
    );

  appRoot.innerHTML = `

    <div class="brand">

      <img
        src="./icon.svg?v=20260916-4"
        alt="iOS App Hub"
      >

      <div class="brand-text">

        <div class="brand-name">
          iOS App Hub
        </div>

        <div class="brand-subtitle">
          Избранные приложения
        </div>

      </div>

    </div>

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

/* --------------------------------------------------
   PROFILE
-------------------------------------------------- */

function renderProfile() {

  currentView = "profile";

  const historyApps =
    history
      .map(id => getApp(id))
      .filter(Boolean);

  appRoot.innerHTML = `

    <div class="brand">

      <img
        src="./icon.svg?v=20260916-4"
        alt="iOS App Hub"
      >

      <div class="brand-text">

        <div class="brand-name">
          iOS App Hub
        </div>

        <div class="brand-subtitle">
          Локальный профиль
        </div>

      </div>

    </div>

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
            color:#fff;
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
      style="width:100%; margin-top:10px"
      type="button"
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

/* --------------------------------------------------
   NAVIGATION
-------------------------------------------------- */

function renderCurrent() {

  if (currentView === "favorites") {
    renderFavorites();
    return;
  }

  if (currentView === "profile") {
    renderProfile();
    return;
  }

  if (currentView === "recovery") {
    return;
  }

  if (currentView === "instructions") {
    return;
  }

  renderHome();
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

        const tab =
          button.dataset.tab;

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
    );

  });

/* --------------------------------------------------
   MESSAGE
-------------------------------------------------- */

function showMessage(text) {

  const previousView =
    currentView;

  appRoot.innerHTML = `

    <div class="card">

      <h2>
        Информация
      </h2>

      <p class="desc">
        ${escapeHTML(text)}
      </p>

      <button
        class="secondary"
        style="width:100%; height:48px"
        type="button"
        onclick="
          currentView='${escapeAttribute(previousView)}';
          renderCurrent();
        "
      >
        Назад
      </button>

    </div>
  `;
}

/* --------------------------------------------------
   SECURITY
-------------------------------------------------- */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {

  return escapeHTML(value);
}

/* --------------------------------------------------
   COUNT
-------------------------------------------------- */

function formatAppCount(count) {

  if (count === 1) {
    return "1 приложение";
  }

  if (
    count >= 2 &&
    count <= 4
  ) {
    return `${count} приложения`;
  }

  return `${count} приложений`;
}

/* --------------------------------------------------
   SERVICE WORKER
-------------------------------------------------- */

if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    async () => {

      try {

        const registration =
          await navigator.serviceWorker.register(
            "./sW.js?v=20260916-4",
            {
              updateViaCache: "none"
            }
          );

        await registration.update();

      } catch (error) {

        console.error(
          "Service Worker:",
          error
        );

      }

    }
  );
}

/* --------------------------------------------------
   START
-------------------------------------------------- */

renderHome();