// Listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "perfectPrompt",
      title: "Perfect Prompt with Deepseek R1",
      contexts: ["selection"] // Show only when text is selected
    });
  });
  
  // Listener for when the context menu item is clicked
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "perfectPrompt" && info.selectionText) {
      chrome.runtime.sendMessage({
        type: "FROM_CONTEXT_MENU",
        selectedText: info.selectionText
      });
      chrome.action.openPopup();
    }
  });