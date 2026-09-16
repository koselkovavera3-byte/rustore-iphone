const demo = [
  {
    id: 1,
    name: "RuStore",
    dev: "RuStore",
    rating: 4.7,
    desc: "Каталог приложений для российских пользователей.",
    icon: "icon.svg",
    shots: []
  },
  {
    id: 2,
    name: "ВКонтакте",
    dev: "VK",
    rating: 4.6,
    desc: "Общение, музыка, видео и сообщества.",
    icon: "icon.svg",
    shots: []
  },
  {
    id: 3,
    name: "Госуслуги",
    dev: "Минцифры России",
    rating: 4.8,
    desc: "Государственные услуги в одном приложении.",
    icon: "icon.svg",
    shots: []
  },
  {
    id: 4,
    name: "СберБанк",
    dev: "Сбер",
    rating: 4.9,
    desc: "Банковские сервисы и платежи.",
    icon: "icon.svg",
    shots: []
  }
];

let favorites = JSON.parse(
  localStorage.getItem("favorites") || "[]"
);

let history = JSON.parse(
  localStorage.getItem("history") || "[]"
);

const $ = id => document.getElementById(id);

const app = $("app");
const search = $("search");

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

function isFav(id) {
  return favorites.includes(id);
}

function toggleFav(id) {
  favorites = isFav(id)
    ? favorites.filter(x => x !== id)
    : [...favorites, id];

  save();
  render();
}

function pushHistory(id) {
  history = [
    id,
    ...history.filter(x => x !== id)
  ].slice(0, 30);

  save();
}

function row(x) {
  return `
    <div class="card">

      <div class="row">

        <img
          class="icon"
          src="${x.icon}"
          alt="${x.name}"
        >

        <div style="flex:1">

          <div class="name">
            ${x.name}
          </div>

          <div class="muted">
            ${x.dev}
          </div>

          <div class="rating">
            ★ ${x.rating}
          </div>

        </div>

        <button
          class="heart"
          onclick="toggleFav(${x.id})"
          aria-label="Избранное"
        >
          ${isFav(x.id) ? "♥" : "♡"}
        </button>

      </div>

      <div class="desc">
        ${x.desc}
      </div>

      <button
        class="secondary"
        style="margin-top:10px"
        onclick="openApp(${x.id})"
      >
        Открыть
      </button>

    </div>
  `;
}

function renderHome() {

  const q = search.value
    .trim()
    .toLowerCase();

  const list = demo.filter(x =>
    (
      x.name +
      x.dev +
      x.desc
    )
      .toLowerCase()
      .includes(q)
  );

  app.innerHTML = list.length
    ? list.map(row).join("")
    : `<div class="empty">
        Ничего не найдено
      </div>`;
}

function openApp(id) {

  const x = demo.find(
    a => a.id === id
  );

  if (!x) return;

  pushHistory(id);

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
          src="${x.icon}"
          alt="${x.name}"
        >

        <div>

          <div class="name">
            ${x.name}
          </div>

          <div class="muted">
            ${x.dev}
          </div>

          <div class="rating">
            ★ ${x.rating}
          </div>

        </div>

      </div>

      <div class="desc">
        ${x.desc}
      </div>

      <button
        style="margin-top:14px"
        onclick="alert('Открытие приложения будет подключено на следующем этапе.')"
      >
        Открыть
      </button>

    </div>

    <h2>
      О приложении
    </h2>

    <div class="card">
      Описание и информация
      о приложении.
    </div>

    <h2>
      Отзывы
    </h2>

    <div class="card">
      <b>Пользователь</b>
      <div>★★★★★</div>
      <div class="muted">
        Отличное приложение.
      </div>
    </div>

    <div class="card">
      <b>Пользователь</b>
      <div>★★★★☆</div>
      <div class="muted">
        Работает хорошо.
      </div>
    </div>
  `;
}

function renderFav() {

  const list = demo.filter(
    x => isFav(x.id)
  );

  app.innerHTML = list.length
    ? list.map(row).join("")
    : `
      <div class="empty">
        Нет избранных приложений
        <br><br>
        Добавляй их кнопкой ♡
      </div>
    `;
}

function renderProfile() {

  const hist = history
    .map(id =>
      demo.find(x => x.id === id)
    )
    .filter(Boolean);

  app.innerHTML = `

    <div class="card">

      <div class="row">

        <div style="font-size:48px">
          ◯
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

      <b>Избранное:</b>
      ${favorites.length}

      <br>

      <b>История:</b>
      ${history.length}

    </div>

    ${
      hist.length
        ? `<h2>История</h2>
           ${hist.map(row).join("")}`
        : ""
    }

    <button
      class="secondary"
      onclick="
        history = [];
        save();
        renderProfile();
      "
    >
      Очистить историю
    </button>
  `;
}

function setTab(tab) {

  document
    .querySelectorAll(".tab")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.tab === tab
      );

    });

  search.classList.toggle(
    "hidden",
    tab !== "home"
  );

  if (tab === "home") {
    renderHome();
  }

  if (tab === "favorites") {
    renderFav();
  }

  if (tab === "profile") {
    renderProfile();
  }
}

function render() {

  const active =
    document.querySelector(".tab.active");

  const tab =
    active?.dataset.tab || "home";

  setTab(tab);
}

document
  .querySelectorAll(".tab")
  .forEach(button => {

    button.onclick = () =>
      setTab(button.dataset.tab);

  });

search.oninput = renderHome;

renderHome();