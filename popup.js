document.addEventListener("DOMContentLoaded", async () => {
    const input = document.getElementById("apiKey");
    const status = document.getElementById("statusMsg");
  
    const { openrouterKey } = await chrome.storage.local.get("openrouterKey");
    if (openrouterKey) {
      input.value = openrouterKey;
      status.textContent = "API key loaded";
    }
  
    document.getElementById("saveBtn").addEventListener("click", () => {
      const key = input.value.trim();
      if (!key) return alert("Please enter your API key.");
      chrome.storage.local.set({ openrouterKey: key }, () => {
        status.textContent = "API key saved!";
      });
    });
  });
  