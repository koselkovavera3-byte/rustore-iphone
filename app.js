const demo = [
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

let favorites = JSON.parse(
  localStorage.getItem("favorites") || "[]"
);

let history = JSON.parse(
  localStorage.getItem("history") || "[]"
);

const app = document.getElementById("app");
const search = document.getElementById("search");

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
  if (isFav(id)) {
    favorites = favorites.filter(x => x !== id);
  } else {
    favorites.push(id);
  }

  save();
  renderHome();
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
        >
          ${isFav(x.id) ? "♥" : "♡"}
        </button>

      </div>

      <div class="desc">
        ${x.desc}
      </div>

      <div class="muted" style="margin-top:8px">
        ${x.category}
      </div>

      <button
        class="secondary"
        style="margin-top:12px;width:100%;"
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
      x.desc +
      x.category
    )
      .toLowerCase()
      .includes(q)
  );

  app.innerHTML = `
    <h2>Приложения</h2>

    <div class="muted" style="margin-bottom:12px">
      ${list.length} приложения
    </div>

    ${
      list.length
        ? list.map(row).join("")
        : `
          <div class="empty">
            Ничего не найдено
          </div>
        `
    }
  `;
}

function openApp(id) {

  const x = demo.find(
    item => item.id === id
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
          onclick="
            toggleFav(${x.id});
            openApp(${x.id});
          "
        >
          ${isFav(x.id) ? "♥" : "♡"}
        </button>

      </div>

      <div class="desc" style="margin-top:15px">
        ${x.desc}
      </div>

      <div class="muted" style="margin-top:12px">
        Категория: ${x.category}
      </div>

      <button
        style="
          width:100%;
          margin-top:20px;
          height:48px;
        "
        onclick="openDemo('${x.name}')"
      >
        Открыть
      </button>

    </div>

    <h2>О приложении</h2>

    <div class="card">

      <div class="desc">
        ${x.desc}
      </div>

      <div class="desc" style="margin-top:10px">
        Версия 1.0.0
      </div>

      <div class="desc">
        Бесплатно
      </div>

    </div>

    <h2>Отзывы</h2>

    <div class="card">

      <b>Пользователь</b>

      <div style="margin-top:5px">
        ★★★★★
      </div>

      <div class="muted">
        Отличное приложение.
      </div>

    </div>

    <div class="card">

      <b>Пользователь</b>

      <div style="margin-top:5px">
        ★★★★☆
      </div>

      <div class="muted">
        Работает хорошо.
      </div>

    </div>
  `;
}

function openDemo(name) {

  app.innerHTML = `

    <div
      class="card"
      style="
        text-align:center;
        margin-top:40px;
      "
    >

      <img
        src="icon.svg"
        alt="${name}"
        style="
          width:90px;
          height:90px;
          border-radius:22px;
          object-fit:cover;
          margin-bottom:20px;
        "
      >

      <h2>
        ${name}
      </h2>

      <p
        class="muted"
        style="margin:15px 0;"
      >
        Приложение запущено
      </p>

      <div
        style="
          font-size:42px;
          margin:20px;
        "
      >
        ✓
      </div>

      <button
        class="secondary"
        onclick="renderHome()"
      >
        Вернуться в каталог
      </button>

    </div>
  `;
}

function renderFav() {

  const list = demo.filter(
    x => isFav(x.id)
  );

  app.innerHTML = `

    <h2>
      Избранное
    </h2>

    ${
      list.length
        ? list.map(row).join("")
        : `
          <div class="empty">
            Нет избранных приложений
            <br><br>
            Добавляй приложения
            кнопкой ♡
          </div>
        `
    }
  `;
}

function renderProfile() {

  const hist = history
    .map(id =>
      demo.find(x => x.id === id)
    )
    .filter(Boolean);

  app.innerHTML = `

    <h2>
      Профиль
    </h2>

    <div class="card">

      <div class="row">

        <div
          style="
            width:58px;
            height:58px;
            border-radius:50%;
            background:#111;
            color:#fff;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:24px;
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

      <b>Избранное:</b>
      ${favorites.length}

      <br>

      <b>История:</b>
      ${history.length}

    </div>

    ${
      hist.length
        ? `
          <h2>
            История
          </h2>

          ${hist.map(row).join("")}
        `
        : ""
    }

    <button
      class="secondary"
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

document
  .querySelectorAll(".tab")
  .forEach(button => {

    button.onclick = () =>
      setTab(button.dataset.tab);

  });

search.oninput = renderHome;

renderHome();