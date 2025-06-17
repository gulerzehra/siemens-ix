import { defineCustomElements } from "@siemens/ix/loader";
import { defineCustomElements as defineIxIconCustomElements } from "@siemens/ix-icons/loader";

defineIxIconCustomElements();
defineCustomElements();

// const dropdown = document.querySelector("#date-picker");
// console.log(dropdown);
// const shadow = dropdown.shadowRoot;
// console.log(shadow);
// console.log(shadow.querySelector("ix-dropdown"));
// const doneBtn = shadow.querySelector(".hydrated");
// const trigger = shadow.querySelector(`[data-testid="date-dropdown-trigger"]`);
// trigger.addEventListener("click", () => {
//   console.log("Dropdown trigger clicked");i
// });

// window.addEventListener("DOMContentLoaded", () => {
//   initShadowAccess();
// });

// async function initShadowAccess() {
//   // 'ix-date-dropdown' öğesinin customElements.define() edildiğini bekle
//   await customElements.whenDefined("ix-date-dropdown");

//   const dropdown = document.getElementById("date-picker");
//   console.log("host element:", dropdown); // şimdi null olmamalı

//   // Stencil bileşeni tam olarak hydrate olana kadar bekleyin
//   await dropdown.componentOnReady();

//   // artık shadowRoot var
//   const shadow = dropdown.shadowRoot;
//   console.log("shadowRoot:", shadow);

//   // örneğin içindeki butonu seçelim
//   // const trigger = shadow.querySelector('[data-testid="date-dropdown-trigger"]');
//   // console.log("trigger:", trigger);
// }

// window.addEventListener("DOMContentLoaded", async () => {
//   // 1) Bileşenin tanımlanmasını bekle
//   await customElements.whenDefined("ix-date-dropdown");

//   // 2) Host’u al
//   const host = document.getElementById("date-picker");
//   console.log("1) host:", host);
//   if (!host) return console.error("> date-picker bulunamadı");

//   // 3) Stencil hydration’ını bekle
//   await host.componentOnReady?.();
//   console.log("2) host.shadowRoot:", host.shadowRoot);
//   if (!host.shadowRoot) return console.error("> shadowRoot hâlâ null");

//   // 4) İçindeki ix-dropdown’u al
//   const dateDropdown = host.shadowRoot.querySelector(
//     '[data-testid="date-dropdown"]'
//   );
//   console.log("3) dateDropdown:", dateDropdown);
//   if (!dateDropdown) return console.error("> date-dropdown bulunamadı");

//   // 5) Onun shadowRoot’una geç
//   console.log("4) dateDropdown.shadowRoot:", dateDropdown.shadowRoot);
//   const ddRoot = dateDropdown.shadowRoot;
//   if (!ddRoot) return console.error("> dateDropdown.shadowRoot null");

//   // Buradan sonra aynı şekilde devam et:
//   const layoutGrid = ddRoot.querySelector("ix-layout-grid");
//   console.log("5) layoutGrid:", layoutGrid);
//   if (!layoutGrid) return console.error("> ix-layout-grid bulunamadı");
// });

// const dropdown = document.querySelector("#date-picker");
// console.log(dropdown);
// const shadow = dropdown.shadowRoot;
// console.log(shadow);

// // console.log(shadow.querySelector("ix-dropdown"));
// const trigger = shadow.querySelector(`[data-testid="date-dropdown-trigger"]`);
// trigger.addEventListener("click", () => {
//   console.log("Dropdown trigger clicked");
// });

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
});
