let selectorActive = false;
let lastHovered = null;
let originalCursor = '';

const SHIELD_INACTIVE = "https://www.umimeto.org/asset/global/img/badges/shield-inactive.svg";
const SHIELD_ACTIVE = "https://www.umimeto.org/asset/global/img/badges/shield-4.svg";

// Při načtení stránky označíme všechny štíty ID a aplikujeme uložené změny
function applySavedShields() {
  chrome.storage.local.get(["shieldChanges"], (result) => {
    const changes = result.shieldChanges || {};
    document.querySelectorAll("img").forEach((img, index) => {
      if (img.src.includes("shield-inactive.svg")) {
        const id = getShieldId(img, index);
        img.dataset.shieldId = id;
        if (changes[id]) {
          img.src = SHIELD_ACTIVE;
        }
      }
    });
  });
}

function getShieldId(img, index) {
  // Jednoduchý identifikátor: kombinace src + index
  return btoa(img.src + "_" + index).substr(0, 12);
}

window.addEventListener("activate-selector-mode", () => {
  selectorActive = true;
  originalCursor = document.body.style.cursor;
  document.body.style.cursor = "crosshair";

  document.addEventListener("mouseover", onMouseOver);
  document.addEventListener("mouseout", onMouseOut);
  document.addEventListener("click", onClick, true);
});

function onMouseOver(e) {
  if (!selectorActive) return;
  const img = e.target;
  if (img.tagName === "IMG" && img.src.includes("shield-inactive.svg")) {
    lastHovered = img;
    img.style.outline = "2px solid red";
  }
}

function onMouseOut(e) {
  if (lastHovered) {
    lastHovered.style.outline = "";
    lastHovered = null;
  }
}

function onClick(e) {
  if (!selectorActive) return;
  e.preventDefault();
  e.stopPropagation();

  const target = e.target;
  if (target.tagName === "IMG" && target.src.includes("shield-inactive.svg")) {
    const images = Array.from(document.querySelectorAll("img"));
    const index = images.indexOf(target);
    const id = getShieldId(target, index);

    target.src = SHIELD_ACTIVE;
    target.style.outline = "";
    target.dataset.shieldId = id;

    const link = target.closest("a");
    if (link) {
      link.addEventListener("click", ev => ev.preventDefault(), true);
    }

    chrome.storage.local.get(["shieldChanges"], (result) => {
      const changes = result.shieldChanges || {};
      changes[id] = true;
      chrome.storage.local.set({ shieldChanges: changes });
    });
  }

  document.removeEventListener("mouseover", onMouseOver);
  document.removeEventListener("mouseout", onMouseOut);
  document.removeEventListener("click", onClick, true);
  document.body.style.cursor = originalCursor;
  selectorActive = false;
}

applySavedShields();