import { defineCustomElements } from "@siemens/ix/loader";
import { defineCustomElements as defineIxIconCustomElements } from "@siemens/ix-icons/loader";

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

  const card = hydrated[3].shadowRoot;
  console.log("Card shadowRoot:", card);

  const day = card.querySelectorAll(".calendar-item");
  console.log("Grid element:", day);

  console.log(hydrated);
  hydrated[3].addEventListener("click", () => {
    console.log("✅ Hydrated element clicked!");
  });

  day.forEach((item) => {
    item.addEventListener("click", () => {
      console.log("✅ Day clicked:", item);
      const a = dropdown.getDateRange();
      console.log(a);
    });
  });
});
