/*
 * iOS App Hub
 * Frontend V3
 *
 * Discovery → Availability → Recovery
 *
 * ВАЖНО:
 * Этот frontend НЕ скачивает IPA напрямую.
 * НЕ запрашивает Apple ID или пароль.
 * Native installation остаётся отдельным будущим
 * backend / approved distribution integration.
 */

const CONFIG = {
  apiBase: "",
  catalogEndpoint: "/api/apps",
  marketplaceName: "iOS App Hub",
  version: "3.0.0"
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
    description: "Общение, музыка, видео и сообщества.",
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
    description: "Государственные услуги в одном приложении.",
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
    description: "Банковские сервисы и платежи.",
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
    description: "Каталог приложений для российских пользователей.",
    icon: "icon.svg",
    nativeIOSAvailable: false,
    appStoreStatus: "unavailable",
    recoverySupported: false,
    webUrl: "https://www.rustore.ru/",
    officialUrl: "https://www.rustore.ru/"
  }
];

/* --------------------------------------------------
   СОСТОЯНИЕ
-------------------------------------------------- */

let favorites = load("favorites", []);
let history = load("history", []);

let currentView = "home";
let currentCategory = "Все";

const appRoot = document.getElementById("app");

/* --------------------------------------------------
   STORAGE
-------------------------------------------------- */

function load(key, fallback) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key)
    );

    return value ?? fallback;
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
    /Safari/i.test(navigator.userAgent) &&
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
      apps.map(item => item.category)
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

  const status = getStatus(item);

  return `
    <div
      class="status ${status.className}"
      style="
        margin-top:8px;
        font-size:13px;
        font-weight:600;
      "
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
    <div class="card">

      <div class="row">

        <img
          class="icon"
          src="${item.icon}"
          alt="${escapeHTML(item.name)}"
        >

        <div style="flex:1">

          <div class="name">
            ${escapeHTML(item.name)}
          </div>

          <div class="muted">
            ${escapeHTML(item.developer)}
          </div>

          <div class="rating">
            ★ ${item.rating}
          </div>

          ${renderStatus(item)}

        </div>

        <button
          class="heart"
          type="button"
          aria-label="Избранное"
          onclick="toggleFavorite('${item.id}')"
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

      <div
        class="muted"
        style="margin-top:8px"
      >
        ${escapeHTML(item.category)}
      </div>

      <button
        class="primary"
        style="
          width:100%;
          margin-top:14px;
        "
        type="button"
        onclick="openApp('${item.id}')"
      >
        Открыть
      </button>

    </div>
  `;
}

/* --------------------------------------------------
   CATEGORY FILTER
-------------------------------------------------- */

function renderCategories() {

  return `
    <div
      style="
        display:flex;
        gap:8px;
        overflow-x:auto;
        padding:4px 0 14px;
        scrollbar-width:none;
      "
    >

      ${getCategories()
        .map(category => `
          <button
            type="button"
            class="${
              currentCategory === category
                ? "primary"
                : "secondary"
            }"
            style="
              white-space:nowrap;
              padding:9px 14px;
              border-radius:18px;
            "
            onclick="
              currentCategory =
                '${escapeHTML(category)}';
              renderHome();
            "
          >
            ${escapeHTML(category)}
          </button>
        `)
        .join("")}

    </div>
  `;
}

/* --------------------------------------------------
   HOME
-------------------------------------------------- */

function renderHome() {

  currentView = "home";

  appRoot.innerHTML = `

    <input
      id="search"
      class="search"
      placeholder="Поиск приложений"
      autocomplete="off"
      aria-label="Поиск приложений"
    >

    <h1>
      Приложения
    </h1>

    ${renderCategories()}

    <div
      id="appList"
    ></div>
  `;

  const search =
    document.getElementById("search");

  const list =
    document.getElementById("appList");

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

    list.innerHTML =
      filtered.length
        ? filtered
            .map(renderCard)
            .join("")
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

/* --------------------------------------------------
   APP PAGE
-------------------------------------------------- */

function openApp(id) {

  const item = getApp(id);

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

    <div class="card">

      <div class="row">

        <img
          class="icon"
          src="${item.icon}"
          alt="${escapeHTML(item.name)}"
        >

        <div style="flex:1">

          <div class="name">
            ${escapeHTML(item.name)}
          </div>

          <div class="muted">
            ${escapeHTML(item.developer)}
          </div>

          <div class="rating">
            ★ ${item.rating}
          </div>

          ${renderStatus(item)}

        </div>

        <button
          class="heart"
          type="button"
          onclick="
            toggleFavorite('${item.id}');
            openApp('${item.id}');
          "
        >
          ${
            isFavorite(item.id)
              ? "♥"
              : "♡"
          }
        </button>

      </div>

      <div
        class="desc"
        style="margin-top:15px"
      >
        ${escapeHTML(item.description)}
      </div>

      <div
        class="muted"
        style="margin-top:12px"
      >
        Категория:
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

      <div
        class="desc"
        style="margin-top:10px"
      >
        Версия: ожидается из каталога
      </div>

      <div
        class="desc"
        style="margin-top:5px"
      >
        Бесплатно
      </div>

    </div>

  `;
}

/* --------------------------------------------------
   INSTALL / AVAILABILITY
-------------------------------------------------- */

function renderInstallArea(item) {

  if (isIOS()) {

    if (item.nativeIOSAvailable) {

      return `
        <div
          class="install-box"
          style="margin-top:20px"
        >

          <h3>
            Установка
          </h3>

          <p class="desc">
            Доступна официальная версия
            для поддерживаемого канала
            распространения.
          </p>

          <button
            class="primary"
            style="
              width:100%;
              height:52px;
            "
            type="button"
            onclick="installNative('${item.id}')"
          >
            Установить приложение
          </button>

        </div>
      `;
    }

    return `
      <div
        class="install-box"
        style="margin-top:20px"
      >

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
                style="
                  width:100%;
                  height:50px;
                  margin-top:10px;
                "
                type="button"
                onclick="openRecovery('${item.id}')"
              >
                Проверить восстановление
              </button>
            `
            : ""
        }

        <button
          class="secondary"
          style="
            width:100%;
            height:48px;
            margin-top:10px;
          "
          type="button"
          onclick="openWebVersion('${item.id}')"
        >
          Открыть официальный сервис
        </button>

        ${
          item.id === "vk"
            ? `
              <button
                class="secondary"
                style="
                  width:100%;
                  height:48px;
                  margin-top:10px;
                "
                type="button"
                onclick="showIOSInstructions('${item.id}')"
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
      <div
        class="install-box"
        style="margin-top:20px"
      >

        <h3>
          Android
        </h3>

        <p class="desc">
          Открой официальный источник
          приложения.
        </p>

        <button
          class="primary"
          style="
            width:100%;
            height:50px;
          "
          type="button"
          onclick="openWebVersion('${item.id}')"
        >
          Открыть официальный источник
        </button>

      </div>
    `;
  }

  return `
    <div
      class="install-box"
      style="margin-top:20px"
    >

      <h3>
        Официальный источник
      </h3>

      <button
        class="primary"
        style="
          width:100%;
          height:50px;
        "
        type="button"
        onclick="openWebVersion('${item.id}')"
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

  const item = getApp(id);

  if (!item) return;

  currentView = "recovery";
  addHistory(id);

  appRoot.innerHTML = `

    <button
      class="back"
      type="button"
      onclick="openApp('${item.id}')"
    >
      ‹ Назад
    </button>

    <h1>
      Восстановление
    </h1>

    <div class="card">

      <div class="row">

        <img
          class="icon"
          src="${item.icon}"
          alt="${escapeHTML(item.name)}"
        >

        <div>

          <div class="name">
            ${escapeHTML(item.name)}
          </div>

          <div class="muted">
            ${escapeHTML(item.developer)}
          </div>

        </div>

      </div>

      <h2 style="margin-top:20px">
        Проверка доступности
      </h2>

      <p class="desc">
        Если приложение ранее было связано
        с твоей учётной записью Apple,
        доступный официальный способ
        восстановления можно проверить
        отдельно.
      </p>

      <p class="muted">
        iOS App Hub не запрашивает Apple ID
        или пароль и не принимает их
        на этом сайте.
      </p>

    </div>

    <div class="card">

      <h3>
        Следующий шаг
      </h3>

      <p class="desc">
        Сервис восстановления будет
        подключаться отдельным клиентом
        или официальным каналом.
      </p>

      <p class="muted">
        Сейчас эта функция находится
        в режиме подготовки.
      </p>

    </div>

    <button
      class="secondary"
      style="
        width:100%;
        height:50px;
      "
      type="button"
      onclick="openWebVersion('${item.id}')"
    >
      Открыть официальный источник
    </button>

  `;
}

/* --------------------------------------------------
   FUTURE NATIVE INSTALL
-------------------------------------------------- */

async function installNative(id) {

  const item = getApp(id);

  if (!item) return;

  /*
   * В production здесь должен находиться
   * только подтверждённый backend flow.
   *
   * Никаких:
   * - .ipa download
   * - Apple ID
   * - Apple password
   * - обхода App Store
   */

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
   WEB VERSION
-------------------------------------------------- */

function openWebVersion(id) {

  const item = getApp(id);

  if (!item || !item.webUrl) return;

  window.location.href =
    item.webUrl;
}

/* --------------------------------------------------
   iOS INSTRUCTIONS
-------------------------------------------------- */

function showIOSInstructions(id) {

  const item = getApp(id);

  if (!item) return;

  currentView = "instructions";

  appRoot.innerHTML = `

    <button
      class="back"
      type="button"
      onclick="openApp('${item.id}')"
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
        Мы не выдаём веб-приложение
        за нативное приложение iOS.
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
        style="
          width:100%;
          height:50px;
        "
        type="button"
        onclick="openWebVersion('${item.id}')"
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
      style="
        width:100%;
        margin-top:10px;
      "
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

  if (currentView === "app") {
    renderHome();
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
        style="
          width:100%;
          height:48px;
        "
        type="button"
        onclick="
          currentView='${previousView}';
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