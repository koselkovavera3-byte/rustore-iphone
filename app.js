const apps = [
  {
    id: 1,
    name: "RuStore",
    dev: "RuStore",
    rating: 4.7,
    category: "Магазины",
    desc: "Каталог приложений для российских пользователей.",
    icon: "icon.svg",
    url: "https://www.rustore.ru/"
  },
  {
    id: 2,
    name: "ВКонтакте",
    dev: "VK",
    rating: 4.6,
    category: "Социальные",
    desc: "Общение, музыка, видео и сообщества.",
    icon: "icon.svg",
    url: "https://m.vk.ru/feed"
  },
  {
    id: 3,
    name: "Госуслуги",
    dev: "Минцифры России",
    rating: 4.8,
    category: "Государство",
    desc: "Государственные услуги в одном приложении.",
    icon: "icon.svg",
    url: "https://www.gosuslugi.ru/"
  },
  {
    id: 4,
    name: "СберБанк",
    dev: "Сбер",
    rating: 4.9,
    category: "Финансы",
    desc: "Банковские сервисы и платежи.",
    icon: "icon.svg",
    url: "https://www.sberbank.ru/"
  }
];

let favorites = load("favorites", []);
let history = load("history", []);

const app = document.getElementById("app");

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

function getApp(id) {
  return apps.find(
    item => item.id === id
  );
}

function isFavorite(id) {
  return favorites.includes(id);
}

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

function toggleFavorite(id) {
  if (isFavorite(id)) {
    favorites = favorites.filter(
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
          type="button"
          onclick="toggleFavorite(${item.id})"
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
        class="primary"
        type="button"
        style="
          width:100%;
          margin-top:14px;
        "
        onclick="openApp(${item.id})"
      >
        Открыть
      </button>

    </div>
  `;
}

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
    document.getElementById("search");

  const list =
    document.getElementById("appList");

  function update() {
    const query =
      search.value
        .trim()
        .toLowerCase();

    const filtered = apps.filter(item =>
      (
        item.name +
        item.dev +
        item.desc +
        item.category
      )
        .toLowerCase()
        .includes(query)
    );

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

function openApp(id) {
  const item = getApp(id);

  if (!item) return;

  addHistory(id);

  app.innerHTML = `
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
          type="button"
          onclick="
            toggleFavorite(${item.id});
            openApp(${item.id});
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
        ${item.desc}
      </div>

      <div
        class="muted"
        style="margin-top:12px"
      >
        Категория: ${item.category}
      </div>

      ${
        item.id === 2
          ? renderVKActions()
          : renderStandardActions(item)
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

      <div style="margin-top:5px">
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

function renderStandardActions(item) {
  return `
    <button
      class="primary"
      type="button"
      style="
        width:100%;
        height:50px;
        margin-top:20px;
      "
      onclick="openExternal('${item.url}')"
    >
      Открыть официальный сайт
    </button>
  `;
}

function renderVKActions() {

  if (isStandalone()) {
    return `
      <div
        class="install-box"
        style="margin-top:20px"
      >

        <div
          style="
            text-align:center;
            font-size:42px;
          "
        >
          ✓
        </div>

        <h3 style="text-align:center">
          RuStore добавлен на экран Домой
        </h3>

        <p
          class="muted"
          style="text-align:center"
        >
          VK можно открыть через
          мобильную версию.
        </p>

        <button
          class="primary"
          type="button"
          style="
            width:100%;
            height:50px;
            margin-top:10px;
          "
          onclick="openVK()"
        >
          Открыть VK
        </button>

      </div>
    `;
  }

  if (isIOS()) {
    return `
      <div
        class="install-box"
        style="margin-top:20px"
      >

        <h3>
          VK на iPhone
        </h3>

        <p class="muted">
          Настоящее приложение VK нельзя
          установить непосредственно
          с обычной веб-страницы.
        </p>

        <button
          class="primary"
          type="button"
          style="
            width:100%;
            height:52px;
            margin-top:12px;
          "
          onclick="showIOSInstall()"
        >
          📱 Установить на iPhone
        </button>

        <button
          class="secondary"
          type="button"
          style="
            width:100%;
            height:48px;
            margin-top:10px;
          "
          onclick="openVK()"
        >
          🌐 Открыть VK
        </button>

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
          VK на Android
        </h3>

        <p class="muted">
          Откройте официальный сайт VK
          или используйте официальный
          магазин приложений вашего устройства.
        </p>

        <button
          class="primary"
          type="button"
          style="
            width:100%;
            height:52px;
            margin-top:12px;
          "
          onclick="openVK()"
        >
          📱 Открыть VK
        </button>

      </div>
    `;
  }

  return `
    <button
      class="primary"
      type="button"
      style="
        width:100%;
        height:50px;
        margin-top:20px;
      "
      onclick="openVK()"
    >
      Открыть VK
    </button>
  `;
}

function showIOSInstall() {

  app.innerHTML = `
    <button
      class="back"
      type="button"
      onclick="openApp(2)"
    >
      ‹ Назад
    </button>

    <h1>
      VK на iPhone
    </h1>

    <div class="card">

      <div class="big-icon">
        📱
      </div>

      <h2>
        Установка
      </h2>

      <p class="desc">
        iPhone не позволяет веб-сайту
        самостоятельно установить
        настоящее приложение VK в формате
        .ipa.
      </p>

      <p class="desc">
        Поэтому здесь используется
        официальная мобильная веб-версия VK.
      </p>

    </div>

    <div class="install-step">

      <h3>
        Шаг 1
      </h3>

      <p class="desc">
        Открой мобильную версию VK.
      </p>

      <button
        class="primary"
        type="button"
        style="
          width:100%;
          height:50px;
          margin-top:10px;
        "
        onclick="openVK()"
      >
        Открыть VK
      </button>

    </div>

    <div class="install-step">

      <h3>
        Шаг 2
      </h3>

      <p class="desc">
        Если VK открыт в Safari,
        нажми кнопку
        <b>«Поделиться»</b>.
      </p>

      <div
        style="
          font-size:40px;
          text-align:center;
          margin:15px 0;
        "
      >
        ↑
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

    <div class="install-step">

      <h3>
        Если пункта «На экран Домой» нет
      </h3>

      <p class="desc">
        Открой приложение
        <b>Safari</b> отдельно,
        перейди на:
      </p>

      <button
        class="secondary"
        type="button"
        style="
          width:100%;
          margin-top:10px;
        "
        onclick="copyVKUrl()"
      >
        Скопировать адрес VK
      </button>

      <p
        id="copyStatus"
        class="muted"
        style="
          text-align:center;
          margin-top:10px;
        "
      ></p>

    </div>

    <button
      class="secondary"
      type="button"
      style="
        width:100%;
        height:48px;
        margin-top:12px;
      "
      onclick="openApp(2)"
    >
      Вернуться к VK
    </button>
  `;
}

function openVK() {
  window.location.href =
    "https://m.vk.ru/feed";
}

function openExternal(url) {
  window.location.href = url;
}

async function copyVKUrl() {

  const url =
    "https://m.vk.ru/feed";

  const status =
    document.getElementById(
      "copyStatus"
    );

  try {

    await navigator.clipboard.writeText(
      url
    );

    if (status) {
      status.textContent =
        "Адрес скопирован. Открой Safari и вставь его в адресную строку.";
    }

  } catch {

    if (status) {
      status.textContent =
        url;
    }

  }
}

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
      type="button"
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

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    async () => {

      try {

        const registration =
          await navigator.serviceWorker.register(
            "./sW.js?v=20260916-3",
            {
              updateViaCache: "none"
            }
          );

        await registration.update();

      } catch (error) {

        console.error(
          "Service Worker error:",
          error
        );

      }

    }
  );
}

renderHome();