import { defineCustomElements } from "@siemens/ix/loader";
import { defineCustomElements as defineIxIconCustomElements } from "@siemens/ix-icons/loader";
import moment from "moment";
import "moment/locale/tr";

// geri kalan kodun…

defineIxIconCustomElements();
defineCustomElements();

window.addEventListener("DOMContentLoaded", async () => {
  const dropdown = document.querySelector("#date-picker");
  //dropdown tamamı

  await customElements.whenDefined("ix-date-dropdown");
  await dropdown.componentOnReady?.();

  const shadow = dropdown.shadowRoot;
  // console.log(shadow);
  //dropdown shadow root içine girdim

  const trigger = shadow.querySelector(`[data-testid="date-dropdown-trigger"]`);
  //buton kısmı

  // trigger.addEventListener("click", () => {
  //   console.log("✅ Dropdown trigger clicked!");
  // });
  //butona tıklandığında anlamak için yazdım

  const dateDropdown = shadow.querySelector(`[data-testid="date-dropdown"]`);
  // console.log("dateDropdown:", dateDropdown);
  //takvim kısmının tamamı

  const hydrated = dateDropdown.querySelectorAll(".hydrated");
  // console.log("hydrated elements:", hydrated);
  // console.log(hydrated[3]);
  //?sadece takvim kısmı
  // console.log(hydrated[4]); ->burası done buton

  const card = hydrated[3].shadowRoot;
  // console.log("Card shadowRoot:", card);
  //takvim kısmının içindeki shadowroot!a girdim

  const grid = card.querySelectorAll(".calendar-item");
  // console.log("Grid element:", grid);
  //sadece günlerin ve ayların olduğu kısım

  const selector = card.querySelector(".selector");
  // console.log("selector:", selector);
  //ay kısmının tamamı

  // const dayCells = card.querySelectorAll('[id^="day-cell"]');
  //günler
  //! dayCells.forEach((cell) => {
  //   console.log(cell.id, cell.textContent);
  // }); //burada bütün günleri çektim
  // console.log("❓ dayCells sayısı:", dayCells.length);

  const monthName = selector.querySelector(`[data-testid="year-month-button"]`);
  // const monthNameText = monthName.querySelector(".capitalize");
  //yazan ayın adı

  const callback = (mutationsList) => {
    for (const mutation of mutationsList) {
      // Metin düğümü değiştiğinde...
      if (mutation.type === "characterData") {
        console.log("Text değişti:", mutation.target.data);
      }
      if (mutation.type === "childList") {
        console.log("Child list değişti. Yeni ay adı:", monthName.textContent);
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(monthName, {
    characterData: true, // textContent içi
    childList: true, // içeriğe yeni node eklendi/çıkarıldı
    subtree: true, // tüm alt ağaçta dinle
  });

  const textNode = monthName.firstChild;
  observer.observe(textNode, { characterData: true });

  function getDayCells() {
    return card.querySelectorAll('[id^="day-cell"]');
  }
  //?bu şekilde çağırmak mantıklı yeni gelen değeri alıyorum belli bir değişkende sabit kalmıyor günler
  // console.log("getDayCells() sayısı:", getDayCells().length);

  let isFirstClick = true;
  let fromDateStr = ""; // "DD.MM.YYYY" formatında saklayacağız

  // ————— 7 Gün Kuralı —————
  function applySevenDayRule(fromStr) {
    const sel = moment(fromStr, "DD.MM.YYYY");
    const minDate = sel.clone().subtract(7, "days");
    const maxDate = sel.clone().add(7, "days");

    getDayCells().forEach((cell) => {
      const dayNum = parseInt(cell.textContent.trim(), 10);
      const cellDate = sel.clone().date(dayNum);
      const inRange = cellDate.isBetween(minDate, maxDate, "day", "[]");

      if (!inRange) {
        cell.classList.add("disabled");
        cell.setAttribute("aria-disabled", "true");
        cell.style.opacity = "0.4";
        cell.style.backgroundColor = "gray";
      } else {
        cell.classList.remove("disabled");
        cell.removeAttribute("aria-disabled");
        cell.style.backgroundColor = "";
        cell.style.opacity = "";
      }
      console.log(minDate.format("DD.MM.YYYY"), maxDate.format("DD.MM.YYYY"));
    });
  }

  getDayCells().forEach((cell) => {
    cell.addEventListener("click", async () => {
      // ★ Bileşenin tıklamayı işleyip `from`/`to` state’ini güncellemesine izin ver:
      await new Promise((r) => setTimeout(r, 0));

      // ★ Güncel range’i al
      const { from, to } = await dropdown.getDateRange();
      // console.log("▶ from, to =", from, to);

      if (isFirstClick && from) {
        const dayCells = card.querySelectorAll('[id^="day-cell"]');
        //günler
        //! dayCells.forEach((cell) => {
        //   console.log(cell.id, cell.textContent);
        // }); //burada bütün günleri çektim
        console.log("❓ dayCells sayısı:", dayCells.length);
        //bu kodu burada çağırdığım zaman ilk tıklamayı hangi ayda yaparsam onun gün sayısını veriyor
        // ► İlk tıklama → from atandı
        fromDateStr = from;
        isFirstClick = false;
        applySevenDayRule(fromDateStr);
      } else if (!isFirstClick && to) {
        isFirstClick = true; //yeniden birinci tıklama olayına dön
        getDayCells().forEach((c) => {
          c.classList.remove("disabled");
          c.removeAttribute("aria-disabled");
          //eski disable olan yerleri sil
        });
      }
    });
  });

  // // console.log(hydrated);
  // hydrated[3].addEventListener("click", () => {
  //   // console.log("✅ Hydrated element clicked!");
  // });

  // dropdown.addEventListener("dateRangeChange", (evt) => {
  //   console.log("▶ dateRangeChange event detail:", evt.detail);
  // });

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
