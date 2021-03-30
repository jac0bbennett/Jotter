chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["theme"], obj => {
    if (obj.theme && obj.theme === "alt") {
      chrome.browserAction.setIcon({ path: "icon48alt.png" });
    }
  });
});
