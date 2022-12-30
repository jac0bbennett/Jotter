chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["theme"], obj => {
    if (obj.theme && obj.theme === "alt") {
      chrome.action.setIcon({
        path: "icon16alt.png"
      });
    } else if (obj.theme && obj.theme === "jonah") {
      chrome.action.setIcon({
        path: "icon16jonah.png"
      });
    }
  });
});
