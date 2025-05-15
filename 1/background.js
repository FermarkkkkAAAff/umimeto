chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "activate-selector",
    title: "Aktivovat výběr štítu",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "activate-selector") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        window.dispatchEvent(new CustomEvent("activate-selector-mode"));
      }
    });
  }
});