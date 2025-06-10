// This script is technically not strictly necessary for simple text selection via context menu,
// as the 'selectionText' property in contextMenus.onClicked is often sufficient.
// However, it's good practice to include it if you foresee more direct DOM manipulation
// or need to send messages from the page itself later.

// For now, it can be empty or used for simple logging:
console.log("Prompt Perfecter content script loaded.");

// Example of how to get selection from content script if needed (less common for context menu flow)
/*
document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection().toString();
    if (selectedText.length > 0) {
        chrome.runtime.sendMessage({
            type: "SELECTION_CHANGE",
            text: selectedText
        });
    }
});
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
*/
