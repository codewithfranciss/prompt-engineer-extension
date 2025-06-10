let button;
let selectedText = "";

// Create the "Perfect" button
function createButton() {
  button = document.createElement("button");
  button.id = "perfect-btn";
  button.innerText = "Perfect";
  document.body.appendChild(button);

  button.addEventListener("click", async () => {
    button.style.display = "none";

    chrome.storage.local.get("openrouterKey", async ({ openrouterKey }) => {
      if (!openrouterKey) {
        alert("No API key set. Click the extension icon and enter your OpenRouter API key.");
        return;
      }

      const improved = await fetchImprovedText(openrouterKey, selectedText);
      if (improved) showModal(improved);
    });
  });
}

// Show button near selected text
function showButtonNearSelection() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    button.style.display = "none";
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  selectedText = selection.toString().trim();
  if (!selectedText) return;

  button.style.top = `${rect.top + window.scrollY - 40}px`;
  button.style.left = `${rect.left + window.scrollX}px`;
  button.style.display = "block";
}

// Show modal
function showModal(responseText) {
  let modal = document.getElementById("perfect-modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "perfect-modal";
    modal.innerHTML = `
      <h3>Improved Text</h3>
      <textarea readonly>${responseText}</textarea>
      <button id="copy-response">Copy</button>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#copy-response").onclick = () => {
      navigator.clipboard.writeText(responseText);
      alert("Copied to clipboard!");
    };
  } else {
    modal.querySelector("textarea").value = responseText;
  }

  modal.style.display = "block";
}

// OpenRouter API call
async function fetchImprovedText(apiKey, promptText) {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          {
            role: "system",
            content: "You are an expert prompt engineer. When given a prompt, you rewrite it to be more clear, specific, and effective — but you only return the improved prompt as a single line. Do not add any explanations or extra text."
          },
          {
            role: "user",
            content: `Prompt: ${promptText}\n\nRespond only with the improved version.`
          }
        ]
        
      })
    });

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "No response.";
  } catch (err) {
    console.error(err);
    alert("Failed to contact OpenRouter.");
    return null;
  }
}

// Setup
createButton();
document.addEventListener("mouseup", () => setTimeout(showButtonNearSelection, 100));
