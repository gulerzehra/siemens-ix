import { defineCustomElements } from "@siemens/ix/loader";
import { defineCustomElements as defineIxIconCustomElements } from "@siemens/ix-icons/loader";
import moment from "moment";
import "moment/locale/tr";

// geri kalan kodun…

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
  console.log("❓ dayCells sayısı:", dayCells.length, dayCells);

  let isFirstClick = true;
  let fromDateStr = ""; // "DD.MM.YYYY" formatında saklayacağız

  // ————— 7 Gün Kuralı —————
  function applySevenDayRule(fromStr) {
    const sel = moment(fromStr, "DD.MM.YYYY");
    const minDate = sel.clone().subtract(7, "days");
    const maxDate = sel.clone().add(7, "days");

    dayCells.forEach((cell) => {
      const dayNum = parseInt(cell.textContent.trim(), 10);
      // same month/year içinde tarih oluşturuyoruz
      const cellDate = sel.clone().date(dayNum);
      const inRange = cellDate.isBetween(minDate, maxDate, "day", "[]");

      if (!inRange) {
        cell.classList.add("disabled");
        cell.setAttribute("aria-disabled", "true");
      } else {
        cell.classList.remove("disabled");
        cell.removeAttribute("aria-disabled");
      }
    });
  }

  // ————— Tıklama Mantığı —————
  dayCells.forEach((cell) => {
    cell.addEventListener("click", async () => {
      // ★ Bileşenin tıklamayı işleyip `from`/`to` state’ini güncellemesine izin ver:
      await new Promise((r) => setTimeout(r, 0));

      // ★ Güncel range’i al
      const { from, to } = await dropdown.getDateRange();
      console.log("▶ from, to =", from, to);

      if (isFirstClick && from) {
        // ► İlk tıklama → from atandı
        fromDateStr = from;
        isFirstClick = false;
        applySevenDayRule(fromDateStr);
      } else if (!isFirstClick && to) {
        // ► İkinci tıklama → to atandı → gerekiyorsa reset et
        isFirstClick = true;
        // eğer yeni seçim için eski disable’ları temizlemek istersen:
        dayCells.forEach((c) => {
          c.classList.remove("disabled");
          c.removeAttribute("aria-disabled");
        });
      }
    });
  });

  // // console.log(hydrated);
  // hydrated[3].addEventListener("click", () => {
  //   // console.log("✅ Hydrated element clicked!");
  // });

  dropdown.addEventListener("dateRangeChange", (evt) => {
    console.log("▶ dateRangeChange event detail:", evt.detail);
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

  dropdown.addEventListener("dateRangeChange", (evt) => {
    const { from, to } = evt.detail;
    // console.log({ from, to });
    if (from && !to) {
      applySevenDayRule(from);
    }
  });
});
