import { defineCustomElements } from "@siemens/ix/loader";
import { defineCustomElements as defineIxIconCustomElements } from "@siemens/ix-icons/loader";
import moment from "moment";
import "moment/locale/tr";

defineIxIconCustomElements();
defineCustomElements();

window.addEventListener("DOMContentLoaded", async () => {
  const dropdown = document.querySelector("#date-picker");
  if (!dropdown) return console.error("❌ #date-picker bulunamadı");

  await customElements.whenDefined("ix-date-dropdown");
  await dropdown.componentOnReady?.();

  const shadow = dropdown.shadowRoot;
  if (!shadow) return console.error("❌ shadowRoot null");
  console.log(shadow);

  const trigger = shadow.querySelector(`[data-testid="date-dropdown-trigger"]`);
  if (!trigger) return console.error("❌ trigger butonu bulunamadı");

  // 🔽 2. event listener ekle
  trigger.addEventListener("click", () => {
    console.log("✅ Dropdown trigger clicked!");
  });

  const dateDropdown = shadow.querySelector(`[data-testid="date-dropdown"]`);
  console.log("dateDropdown:", dateDropdown);

  const hydrated = dateDropdown.querySelectorAll(".hydrated");
  console.log("hydrated elements:", hydrated);
  console.log(hydrated[3]);
  // console.log(hydrated[4]); ->burası done buton

  const card = hydrated[3].shadowRoot;
  console.log("Card shadowRoot:", card);

  const grid = card.querySelectorAll(".calendar-item");
  console.log("Grid element:", grid);

  const dayCells = card.querySelectorAll('[id^="day-cell"]');
  dayCells.forEach((cell) => {
    console.log(cell.id, cell.textContent);
  }); //burada bütün günleri çektim

  console.log(hydrated);
  hydrated[3].addEventListener("click", () => {
    console.log("✅ Hydrated element clicked!");
  });

  // // Ya da Array.from ile gerçek bir diziye çevirip işle:
  // const items = Array.from(grid);
  // items.map((cell) => cell.id); // ["day-cell-1", "day-cell-2", ...]

  grid.forEach((item) => {
    item.addEventListener("click", () => {
      setTimeout(async () => {
        dropdown.getDateRange().then(({ from, to }) => {
          console.log("▶ from, to =", from, to);
        });
      }, 0);
    });
  });
});
