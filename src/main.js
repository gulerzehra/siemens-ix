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
    console.log("🔔 No Range Set clicked");

    // Kısa bir bekleme, panel tam oluşsun
    await new Promise((r) => setTimeout(r, 0));

    // Bugünün tarihini ISO formatta al
    const todayIso = moment().format("YYYY-MM-DD");

    // Geçmiş tamamen açık, geleceği bugüne kırp
    dropdown.minDate = undefined;
    dropdown.maxDate = todayIso;
    // HTML attribute da set et (isteğe bağlı ama garantiler):
    dropdown.setAttribute("min-date", "");
    dropdown.setAttribute("max-date", todayIso);

    console.log("→ dropdown.maxDate =", dropdown.maxDate);

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

    console.log("→ maxDate ve manuel disable uygulandı:", todayIso);
  });

  function getDayCells() {
    return card.querySelectorAll('[id^="day-cell"]');
  }
  //?bu şekilde çağırmak mantıklı yeni gelen değeri alıyorum belli bir değişkende sabit kalmıyor günler
  // console.log("getDayCells() sayısı:", getDayCells().length);

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
      console.log(monthSpan);
      console.log("Parsing monthSpan:", JSON.stringify(monthSpan));

      // 2) monthSpan zaten "Temmuz 2025" gibi geliyor:
      const [mn, yy] = monthSpan.split(" ");
      const displayedMonth = monthNamesTr.indexOf(mn);
      const displayedYear = parseInt(yy, 10);

      console.log({ monthName, displayedMonth, displayedYear });

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

        if (cellDate.isAfter(today, "day")) {
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

        console.log(
          `from=${from}`,
          `min=${minDate.format("MM")}`,
          `max=${maxDate.format("MM")}`,
          `view=${displayedMonth}`,
          `min===max? ${monthMin === monthMax}`
        );

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

  grid.forEach((item) => {
    item.addEventListener("click", () => {
      setTimeout(async () => {
        dropdown.getDateRange().then(({ from, to }) => {
          console.log("▶ from, to =", from, to);
        });
      }, 0);
    });
  });

  // dropdown.addEventListener("dateRangeChange", (evt) => {
  //   const { from, to } = evt.detail;
  //   // console.log({ from, to });
  //   if (from && !to) {
  //     applySevenDayRule(from);
  //   }
  // });

  // dropdown.addEventListener("dateRangeChange", async (evt) => {
  //   console.log("🔔 dateRangeChange tetiklendi:", evt.detail);

  //   let { from, to } = evt.detail;

  //   // Eğer henüz 'to' seçilmemişse çık
  //   if (!from || !to) {
  //     console.log("→ from veya to yok, return");
  //     return;
  //   }

  //   // Bugünün DD.MM.YYYY formatlı hali

  //   // Eğer seçilen 'to' bugünden sonra ise, to = todayStr yap
  //   if (moment(to, "DD.MM.YYYY").isAfter(moment(), "day")) {
  //     to = todayStr;
  //     // ix-date-dropdown'un API'si setDateRange veya setValue gibi
  //     // bir metot sunuyorsa onu kullan:
  //     await dropdown.setDateRange({ from, to });
  //     console.log("→ güncellenmiş detail:", { from, to });
  //   }

  //   // Buraya +7 gün kuralını da isteğe bağlı ekleyebilirsin
  //   applySevenDayRule(from);
  // });
});
