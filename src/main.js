import { defineCustomElements } from "@siemens/ix/loader";
import { defineCustomElements as defineIxIconCustomElements } from "@siemens/ix-icons/loader";
import moment from "moment";
import "moment/locale/tr";

// geri kalan kodun…

defineIxIconCustomElements();
defineCustomElements();

moment.locale("tr");

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
  // butona tıklandığında anlamak için yazdım

  const dateDropdown = shadow.querySelector(`[data-testid="date-dropdown"]`);
  // console.log("dateDropdown:", dateDropdown);
  //takvim kısmının tamamı

  const hydrated = dateDropdown.querySelectorAll(".hydrated");
  // console.log("hydrated elements:", hydrated);
  // console.log(hydrated[3]);
  //?sadece takvim kısmı
  // console.log(hydrated[4]);
  //->burası done buton

  const doneButton = hydrated[4];
  // doneButton.addEventListener("click", () => {
  //   console.log("✅ Done button clicked!");
  // });

  const card = hydrated[3].shadowRoot;
  // console.log("Card shadowRoot:", card);
  //takvim kısmının içindeki shadowroot!a girdim

  const grid = card.querySelectorAll(".calendar-item");
  // console.log("Grid element:", grid);
  //sadece günlerin ve ayların olduğu kısım

  const selector = card.querySelector(".selector");
  // console.log("selector:", selector);
  //ay kısmının tamamı

  const dayCells = card.querySelectorAll('[id^="day-cell"]');
  // 'dayCells' zaten içinde tüm hücreleri tutan NodeList veya Array.
  // Şimdi her bir hücrenin id ve data-value’sunu konsola yazdır:
  // dayCells.forEach((cell) => {
  //   console.log(
  //     "Hücre:",
  //     cell, // Element referansı
  //     "id=",
  //     cell.id, // id attribute’u
  //     "data-value=",
  //     cell.getAttribute("data-value") // data-value attribute’u
  //   );
  // });

  //günler
  //! dayCells.forEach((cell) => {
  //   console.log(cell.id, cell.textContent);
  // }); //burada bütün günleri çektim
  // console.log("❓ dayCells sayısı:", dayCells.length);

  const monthName = selector.querySelector(`[data-testid="year-month-button"]`);
  const monthNameText = monthName.querySelector(".capitalize");
  // console.log(monthNameText);
  // yazan ayın adı

  // 1) Sabit bir Türkçe ay isimleri listesi:
  const monthNamesTr = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  trigger.addEventListener("click", async () => {
    // console.log("🔔 No Range Set clicked");

    // Kısa bir bekleme, panel tam oluşsun
    await new Promise((r) => setTimeout(r, 0));
    if (fromDateStr) {
      applySevenDayRule(fromDateStr);
    }

    // Bugünün tarihini ISO formatta al
    const todayIso = moment().format("YYYY-MM-DD");

    // Geçmiş tamamen açık, geleceği bugüne kırp
    dropdown.minDate = undefined;
    dropdown.maxDate = todayIso;
    // HTML attribute da set et (isteğe bağlı ama garantiler):
    dropdown.setAttribute("min-date", "");
    dropdown.setAttribute("max-date", todayIso);

    // console.log("→ dropdown.maxDate =", dropdown.maxDate);

    const monthSpanRaw = monthNameText.textContent.trim(); // "Temmuz 2025"
    const [mn, yy] = monthSpanRaw.split(" ");
    const displayedMonth = monthNamesTr.indexOf(mn);
    const displayedYear = parseInt(yy, 10);

    // 5) Tüm gün hücrelerini disable etmesi gerekiyor
    getDayCells().forEach((cell) => {
      const dayNum = parseInt(cell.textContent.trim(), 10);
      // Hücre tarihi:
      const cellDate = moment({
        year: displayedYear,
        month: displayedMonth,
        date: dayNum,
      });

      // Eğer bugünden sonrasıysa disable et
      if (cellDate.isAfter(todayIso, "day")) {
        cell.classList.add("disabled");
        cell.setAttribute("aria-disabled", "true");
        cell.style.opacity = "0.4";
        cell.style.backgroundColor = "gray";
      }
    });

    // console.log("→ maxDate ve manuel disable uygulandı:", todayIso);
  });

  function handlerDateSelection(dateFrom, dateTo) {
    console.log(dateFrom, dateTo);
    // Burada seçilen tarih aralığını işleyebilirsin
    // Örneğin, dropdown.setDateRange({ from: dateFrom, to: dateTo });
  }

  function getDayCells() {
    return card.querySelectorAll('[id^="day-cell"]');
  }
  //?bu şekilde çağırmak mantıklı yeni gelen değeri alıyorum belli bir değişkende sabit kalmıyor günler
  // console.log("getDayCells() sayısı:", getDayCells().length);

  function disable(cell) {
    cell.classList.add("disabled");
    cell.setAttribute("aria-disabled", "true");
    cell.style.opacity = "0.4";
    cell.style.backgroundColor = "gray";
  }
  function enable(cell) {
    cell.classList.remove("disabled");
    cell.removeAttribute("aria-disabled");
    cell.style.opacity = "";
    cell.style.backgroundColor = "";
  }

  function updateFutureDisable() {
    const today = moment().startOf("day");

    // Parse edilen ay ve yılı al
    const [mn, yy] = monthNameText.textContent.trim().split(" ");
    const dispMonth = monthNamesTr.indexOf(mn);
    const dispYear = parseInt(yy, 10);

    getDayCells().forEach((cell) => {
      const dayNum = parseInt(cell.textContent.trim(), 10);
      const cellDate = moment({
        year: dispYear,
        month: dispMonth,
        date: dayNum,
      });

      if (cellDate.isAfter(today, "day")) disable(cell);
      else enable(cell);
    });
  }

  trigger.addEventListener("click", async () => {
    await new Promise((r) => setTimeout(r, 0));
    if (fromDateStr) {
      applySevenDayRule(fromDateStr);
    }
    // aksi halde ilk açılışta önceki future-disable’ı uygula
    else {
      updateFutureDisable();
    }
  });

  const obser = new MutationObserver(updateFutureDisable);
  obser.observe(monthNameText, { childList: true, subtree: true });
  obser.observe(monthNameText.firstChild, { characterData: true });

  // 3) Sayfa açıldıktan sonra bir kez uygulayalım:
  updateFutureDisable();

  const callback = async (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type !== "characterData") continue;

      const { from } = await dropdown.getDateRange();
      if (!from) return;

      const sel = moment(from, "DD.MM.YYYY");
      const minDate = sel.clone().subtract(7, "days");
      const maxDate = sel.clone().add(7, "days");

      const monthMin = minDate.month();
      const monthMax = maxDate.month();

      const monthSpanRaw = monthNameText.textContent; // Ex: "Temmuz 2025"
      const monthSpan = monthSpanRaw.replace(/\s+/g, " ").trim();
      // console.log(monthSpan);
      // console.log("Parsing monthSpan:", JSON.stringify(monthSpan));

      const todayIso = moment().format("YYYY-MM-DD");

      // 2) monthSpan zaten "Temmuz 2025" gibi geliyor:
      const [mn, yy] = monthSpan.split(" ");
      const displayedMonth = monthNamesTr.indexOf(mn);
      const displayedYear = parseInt(yy, 10);

      // console.log({ monthName, displayedMonth, displayedYear });

      const cells = getDayCells();
      cells.forEach((cell) => {
        cell.classList.remove("disabled");
        cell.removeAttribute("aria-disabled");
        cell.style.opacity = "";
        cell.style.backgroundColor = "";
      });

      cells.forEach((cell) => {
        const dayNum = parseInt(cell.textContent.trim(), 10);
        const cellDate = moment({
          year: sel.year(),
          month: displayedMonth,
          day: dayNum,
        });

        if (cellDate.isAfter(todayIso, "day")) {
          cell.classList.add("disabled");
          cell.setAttribute("aria-disabled", "true");
          cell.style.opacity = "0.4";
          cell.style.backgroundColor = "gray";
        }

        if (!cellDate.isBetween(minDate, maxDate, "day", "[]")) {
          cell.classList.add("disabled");
          cell.setAttribute("aria-disabled", "true");
          cell.style.opacity = "0.4";
          cell.style.backgroundColor = "gray";
        }

        // console.log(
        //   `from=${from}`,
        //   `min=${minDate.format("MM")}`,
        //   `max=${maxDate.format("MM")}`,
        //   `view=${displayedMonth}`,
        //   `min===max? ${monthMin === monthMax}`
        // );

        // —————— Tek aya sığan aralık: ——————
        if (monthMin === monthMax) {
          if (displayedMonth !== monthMin) {
            // başka aya tıkladıysa: tümünü kapat
            cell.classList.add("disabled");
            cell.setAttribute("aria-disabled", "true");
            cell.style.opacity = "0.4";
            cell.style.backgroundColor = "gray";
          } else {
            // aynı aydayız: 7-gün aralığındaki günleri aç, diğerlerini kapat
            const inRange = cellDate.isBetween(minDate, maxDate, "day", "[]");
            if (inRange) {
              cell.classList.remove("disabled");
              cell.removeAttribute("aria-disabled");
              cell.style.opacity = "";
              cell.style.backgroundColor = "";
            } else {
              cell.classList.add("disabled");
              cell.setAttribute("aria-disabled", "true");
              cell.style.opacity = "0.4";
              cell.style.backgroundColor = "gray";
            }
          }

          // —————— Aralık iki aya yayılıyorsa: ——————
        } else {
          // sadece minDate’in ayındaysak, gün >= minDate
          // veya maxDate’in ayındaysak, gün <= maxDate
          let inRange = false;
          if (displayedMonth === monthMin) {
            inRange = cellDate.isSameOrAfter(minDate, "day");
          } else if (displayedMonth === monthMax) {
            inRange = cellDate.isSameOrBefore(maxDate, "day");
          }
          if (inRange) {
            cell.classList.remove("disabled");
            cell.removeAttribute("aria-disabled");
            cell.style.opacity = "";
            cell.style.backgroundColor = "";
          } else {
            cell.classList.add("disabled");
            cell.setAttribute("aria-disabled", "true");
            cell.style.opacity = "0.4";
            cell.style.backgroundColor = "gray";
          }
        }
      });
    }
  };

  let datefrom = "";

  const observer = new MutationObserver(callback);

  observer.observe(monthName, {
    characterData: true, // textContent içi
    childList: true, // içeriğe yeni node eklendi/çıkarıldı
    subtree: true, // tüm alt ağaçta dinle
  });

  observer.observe(monthName.firstChild, { characterData: true });

  let isFirstClick = true;
  let fromDateStr = ""; // "DD.MM.YYYY" formatında saklayacağız

  // ————— 7 Gün Kuralı —————
  async function applySevenDayRule(fromStr) {
    const { from, to } = await dropdown.getDateRange();

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
      // console.log(minDate.format("DD.MM.YYYY"), maxDate.format("DD.MM.YYYY"));
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
        // console.log("❓ dayCells sayısı:", dayCells.length);
        //bu kodu burada çağırdığım zaman ilk tıklamayı hangi ayda yaparsam onun gün sayısını veriyor
        // ► İlk tıklama → from atandı
        fromDateStr = from;
        datefrom = from;
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

  // grid.forEach((item) => {
  //   item.addEventListener("click", () => {
  //     setTimeout(async () => {
  //       dropdown.getDateRange().then(({ from, to }) => {
  //         if (from && to) {
  //           handlerDateSelection(from, to);
  //         }
  //         // console.log("▶ from, to =", from, to);
  //       });
  //     }, 0);
  //   });
  // });

  doneButton.addEventListener("click", async () => {
    const { from, to } = await dropdown.getDateRange();
    if (from && to) {
      handlerDateSelection(from, to);
    }
    if (from && !to) {
      // 1) Dropdown’ı aç, hücreler render olsun
      dropdown.shadowRoot
        .querySelector("[data-testid='date-dropdown-trigger']")
        .click();
      await new Promise((r) => setTimeout(r, 50));

      // 2) Tüm gün hücrelerini al
      const dayCells = card.querySelectorAll('[id^="day-cell"]');

      // Kullanıcıdan gelen "DD.MM.YYYY" formatından sadece gün numarasını çıkar:
      const dayNum = String(parseInt(from.split(".")[0], 10));

      // 4) Bul ve tıkla
      const sameCell = Array.from(dayCells).find(
        (cell) =>
          // id üzerinden:
          cell.id === `day-cell-${dayNum}` ||
          // veya textContent üzerinden:
          cell.textContent.trim() === dayNum
      );

      if (sameCell) {
        // console.log("✅ Eşleşen hücre bulundu:", sameCell.id);
        sameCell.click();
      } else {
        console.error("❌ Hücre bulunamadı:", dayNum);
      }
      handlerDateSelection(from, from);
    }
  });
});
