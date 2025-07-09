"use strict";

let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";
const CURRENT_HABBIT_ID_KEY = "CURRENT_HABBIT_ID_KEY";
let currentHabbitId;
/* page */

const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector(".h1"),
    progressPercent: document.querySelector(".progress__percent"),
    progressCoverBar: document.querySelector(".progress__cover-bar"),
  },
  habbits: document.querySelector(".habbits"),
  form: document.querySelector(".habbit__form"),
  popup: document.querySelector(".cover"),
};

/* utils */

function loadData() {
  const habbitsString = localStorage.getItem(HABBIT_KEY);
  const habbitArray = JSON.parse(habbitsString);
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
  const habbitId = localStorage.getItem(CURRENT_HABBIT_ID_KEY);
  if (!habbitId) {
    currentHabbitId = habbits[0].id;
    return;
  }
  currentHabbitId = Number(habbitId);
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}
// dumbbell-alt.svg
/* render */
function rerenderMenu(activeHabbit) {
  if (!activeHabbit) {
    return;
  }
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) {
      const element = document.createElement("button");
      element.setAttribute("menu-habbit-id", habbit.id);
      element.classList.add("menu__item");
      element.addEventListener("click", () => {
        rerender(habbit.id);
      });
      element.innerHTML = `<img
                src="./images/icons/${habbit.icon}.svg"
                alt="${habbit.name}"
              />`;
      if (activeHabbit.id === habbit.id) {
        element.classList.add("menu__item_active");
      }
      page.menu.appendChild(element);
      continue;
    }
    if (activeHabbit.id === habbit.id) {
      existed.classList.add("menu__item_active");
    } else {
      existed.classList.remove("menu__item_active");
    }
  }
}

function rerenderHead(activeHabbit) {
  if (!activeHabbit) {
    return;
  }

  page.header.h1.innerText = activeHabbit.name;
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + "%";
  page.header.progressCoverBar.setAttribute("style", `width: ${progress}%`);
}

function rerenderMain(activeHabbit) {
  page.form["comment"].classList.remove("error");

  if (!activeHabbit) {
    return;
  }

  page.habbits.innerHTML = "";

  activeHabbit.days.forEach((habbit, index) => {
    const element = document.createElement("div");
    element.classList.add("habbit");
    element.setAttribute("index-habbit", `${index}`);
    element.innerHTML = `
      <div class="habbit__day">День ${index + 1}</div>
      <div class="habbit__comment">${habbit.comment}</div>
      <button class="habbit__delete" onclick="deleteHabbit(${index}, ${
      activeHabbit.id - 1
    })">
        <img src="./images/icons/trash.svg" alt="" />
      </button>
      `;
    page.habbits.appendChild(element);
  });

  const allHabbits = document.querySelectorAll(".habbit");

  allHabbits[allHabbits.length - 1].querySelector(
    ".habbit__day"
  ).innerText = `День ${allHabbits.length}`;

  page.form.setAttribute("data-habbit-id", `${activeHabbit.id}`);
}

function deleteHabbit(habbitId, activeHabbit) {
  habbits[activeHabbit].days = habbits[activeHabbit].days.filter(
    (_, id) => id !== habbitId
  );

  saveData();
  rerender(habbits[activeHabbit].id);
}

function addDays(event) {
  event.preventDefault();

  const data = new FormData(event.target);
  const comment = data.get("comment").trim();

  const habbitId = parseInt(page.form.dataset.habbitId, 10);
  page.form["comment"].classList.remove("error");

  if (comment === "") {
    page.form["comment"].classList.add("error");
    return;
  }

  habbits[habbitId - 1].days.push({ comment });

  saveData();
  rerender(habbitId);

  event.target.reset();
}

function rerender(activeHabbitId) {
  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);

  currentHabbitId = activeHabbit.id;
  localStorage.setItem(CURRENT_HABBIT_ID_KEY, activeHabbit.id);
  document.location.replace(document.location.pathname + "#" + currentHabbitId);
  rerenderMenu(activeHabbit);
  rerenderHead(activeHabbit);
  rerenderMain(activeHabbit);
}

function togglePopup() {
  page.popup.classList.toggle("cover_hidden");
  page.popup.querySelectorAll("input").forEach((inp) => {
    inp.classList.remove("error");
  });
}

function setIcon(icon, event) {
  const inputIcon = page.popup.querySelector('input[name="icon"]');
  inputIcon.value = icon;

  document.querySelectorAll(".icon").forEach((el) => {
    el.classList.remove("icon_active");
  });
  event.currentTarget.classList.add("icon_active");
}

function addHabbit(event) {
  event.preventDefault();

  const data = new FormData(event.currentTarget);
  const name = data.get("name").trim();
  const icon = data.get("icon");
  const target = data.get("target").trim();

  if (!name || !target || isNaN(Number(target)) || target < 1 || !icon) {
    const inputs = event.currentTarget.querySelectorAll("input");
    inputs.forEach((inp) => {
      inp.classList.add("error");
    });
    return;
  }

  habbits.push({
    id: habbits.length + 1,
    icon,
    name,
    target,
    days: [],
  });

  const inputs = event.currentTarget.querySelectorAll("input");
  inputs.forEach((inp) => {
    inp.classList.remove("error");
  });

  event.currentTarget.reset();
  saveData();
  togglePopup();
  rerender(habbits.length);
}

/* clicks */

document.querySelector(".menu__add").addEventListener("click", togglePopup); // открыть
document.querySelector(".popup__close").addEventListener("click", togglePopup); // закрыть

/* init */
(() => {
  loadData();
  const hashId = Number(document.location.hash.replace("#", ""));
  const urlHabbit = habbits.find((habbit) => habbit.id == hashId);
  if (urlHabbit) {
    rerender(urlHabbit.id);
  }
  rerender(currentHabbitId);
})();
