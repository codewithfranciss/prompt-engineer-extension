document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const originalPromptTextarea = document.getElementById('originalPrompt');
    const perfectButton = document.getElementById('perfectButton');
    const perfectedPromptTextarea = document.getElementById('perfectedPrompt');
    const copyButton = document.getElementById('copyButton');
    const statusMessage = document.getElementById('statusMessage');

    const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
    const DEEPSEEK_MODEL = "deepseek/deepseek-r1-0528:free"; // Verify this model string on OpenRouter

    // Load API key from storage
    chrome.storage.sync.get('openRouterApiKey', (data) => {
        if (data.openRouterApiKey) {
            apiKeyInput.value = data.openRouterApiKey;
        }
    });

    // Save API key
    saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.sync.set({ 'openRouterApiKey': apiKey }, () => {
                showStatus('API Key saved!', 'success');
            });
        } else {
            showStatus('Please enter an API key.', 'error');
        }
    });

    // Listen for messages from background script (e.g., selected text)
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === "FROM_CONTEXT_MENU" && request.selectedText) {
            originalPromptTextarea.value = request.selectedText;
            showStatus('Selected text loaded.', 'info');
        }
    });

    // Perfect Prompt button click
    perfectButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const originalPrompt = originalPromptTextarea.value.trim();

        if (!apiKey) {
            showStatus('Please save your OpenRouter API Key first.', 'error');
            return;
        }
        if (!originalPrompt) {
            showStatus('Please enter or select a prompt.', 'error');
            return;
        }

        perfectedPromptTextarea.value = 'Perfecting...';
        showStatus('Sending prompt to Deepseek R1...', 'info');

        try {
            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: DEEPSEEK_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert prompt engineer. Your task is to take a given prompt and make it more effective, clear, detailed, and optimized for a large language model. Focus on improving clarity, conciseness, and completeness. Avoid conversational filler. Just provide the improved prompt. If the prompt is already good, suggest minor improvements."
                        },
                        {
                            role: "user",
                            content: `Original prompt: "${originalPrompt}"`
                        }
                    ],
                    temperature: 0.7, // Adjust for creativity (0.0-1.0)
                    max_tokens: 500   // Max length of the perfected prompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            const perfectedPrompt = data.choices[0]?.message?.content || 'No perfected prompt returned.';
            perfectedPromptTextarea.value = perfectedPrompt;
            showStatus('Prompt perfected successfully!', 'success');

        } catch (error) {
            console.error('Error perfecting prompt:', error);
            perfectedPromptTextarea.value = 'Error perfecting prompt. Check console for details.';
            showStatus(`Error: ${error.message}`, 'error');
        }
    });

    // Copy button click
    copyButton.addEventListener('click', () => {
        perfectedPromptTextarea.select();
        document.execCommand('copy');
        showStatus('Perfected prompt copied to clipboard!', 'success');
    });

    // Function to display status messages
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`; // Add a class for styling (e.g., 'success', 'error', 'info')
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';
        }, 3000); // Clear message after 3 seconds
    }
});