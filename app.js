const apps = [
  {
    id: 1,
    name: "RuStore",
    dev: "RuStore",
    rating: 4.7,
    category: "Магазины",
    desc: "Официальный каталог приложений.",
    icon: "icon.svg",
    android: "https://www.rustore.ru/",
    ios: "https://www.rustore.ru/"
  },
  {
    id: 2,
    name: "ВКонтакте",
    dev: "VK",
    rating: 4.6,
    category: "Социальные",
    desc: "Общение, музыка, видео и сообщества.",
    icon: "icon.svg",
    android: "https://vk.com/",
    ios: "https://apps.apple.com/ru/app/vkontakte/id564177498"
  },
  {
    id: 3,
    name: "Госуслуги",
    dev: "Минцифры России",
    rating: 4.8,
    category: "Государство",
    desc: "Государственные услуги в одном приложении.",
    icon: "icon.svg",
    android: "https://www.gosuslugi.ru/",
    ios: "https://apps.apple.com/ru/app/госуслуги/id672600744"
  },
  {
    id: 4,
    name: "СберБанк",
    dev: "Сбер",
    rating: 4.9,
    category: "Финансы",
    desc: "Банковские сервисы и платежи.",
    icon: "icon.svg",
    android: "https://www.sberbank.ru/",
    ios: "https://apps.apple.com/ru/app/сбербанк/id492224193"
  }
];

let favorites = load("favorites", []);
let history = load("history", []);

const app = document.getElementById("app");

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
  localStorage.setItem("history", JSON.stringify(history));
}

function getApp(id) {
  return apps.find(item => item.id === id);
}

function isFavorite(id) {
  return favorites.includes(id);
}

function toggleFavorite(id) {
  if (isFavorite(id)) {
    favorites = favorites.filter(item => item !== id);
  } else {
    favorites.push(id);
  }

  save();
  renderCurrent();
}

function addHistory(id) {
  history = [
    id,
    ...history.filter(item => item !== id)
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
          onclick="toggleFavorite(${item.id})"
        >
          ${isFavorite(item.id) ? "♥" : "♡"}
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
        style="width:100%;margin-top:14px"
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

    <h1>Приложения</h1>

    <div id="appList"></div>
  `;

  const search = document.getElementById("search");
  const list = document.getElementById("appList");

  function update() {

    const query = search.value
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

    list.innerHTML = filtered.length
      ? filtered.map(renderCard).join("")
      : `
        <div class="empty">
          Ничего не найдено
        </div>
      `;
  }

  search.addEventListener("input", update);

  update();
}

function openApp(id) {

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
          onclick="toggleFavorite(${item.id})"
        >
          ${isFavorite(item.id) ? "♥" : "♡"}
        </button>

      </div>

      <div class="desc" style="margin-top:15px">
        ${item.desc}
      </div>

      <div class="muted" style="margin-top:12px">
        Категория: ${item.category}
      </div>

      <h3 style="margin-top:24px">
        Скачать приложение
      </h3>

      <button
        class="primary"
        style="width:100%;margin-top:10px;height:48px"
        onclick="openIOS(${item.id})"
      >
         Открыть в App Store
      </button>

      <button
        class="secondary"
        style="width:100%;margin-top:10px;height:48px"
        onclick="openAndroid(${item.id})"
      >
        🤖 Открыть официальный сайт
      </button>

    </div>

    <h2>
      О приложении
    </h2>

    <div class="card">

      <div class="desc">
        ${item.desc}
      </div>

      <div class="desc" style="margin-top:10px">
        Версия 1.0.0
      </div>

      <div class="desc" style="margin-top:5px">
        Бесплатно
      </div>

    </div>

    <h2>
      Отзывы
    </h2>

    <div class="card">

      <b>Пользователь</b>

      <div style="margin-top:5px">
        ★★★★★
      </div>

      <div class="muted" style="margin-top:5px">
        Отличное приложение.
      </div>

    </div>
  `;
}

function openIOS(id) {

  const item = getApp(id);

  if (!item || !item.ios) return;

  window.location.href = item.ios;
}

function openAndroid(id) {

  const item = getApp(id);

  if (!item || !item.android) return;

  window.location.href = item.android;
}

function renderFavorites() {

  const list = apps.filter(
    item => isFavorite(item.id)
  );

  app.innerHTML = `

    <h1>
      Избранное
    </h1>

    ${
      list.length
        ? list.map(renderCard).join("")
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

  const historyApps = history
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

          ${historyApps.map(renderCard).join("")}
        `
        : ""
    }

    <button
      class="secondary"
      style="width:100%;margin-top:10px"
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

  const active = document.querySelector(".tab.active");

  const tab = active
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

    button.addEventListener("click", () => {

      document
        .querySelectorAll(".tab")
        .forEach(item =>
          item.classList.remove("active")
        );

      button.classList.add("active");

      renderCurrent();
    });

  });

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./sW.js")
      .catch(error => {
        console.error(
          "Service Worker error:",
          error
        );
      });

  });
}

renderHome();