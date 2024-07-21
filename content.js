console.log('Content script loaded and running');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForElement(selector, timeout = 30000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    const observer = new MutationObserver(mutations => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        observer.disconnect();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element: ${selector}`));
    }, timeout);
  });
}

async function uploadScreenshot(screenshot, aiService) {
  try {
    let fileInput;
    if (aiService === 'claude') {
      fileInput = await waitForElement('input[type="file"]');
    } else if (aiService === 'chatgpt') {
      const uploadButton = await waitForElement('input[type="file"]');
      uploadButton.click();
      await delay(1000);
      fileInput = await waitForElement('input[type="file"]');
    }
    
    console.log('File input found. Uploading screenshot...');
  
    const response = await fetch(screenshot);
    const blob = await response.blob();
    const file = new File([blob], "screenshot.png", { type: "image/png" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  
    console.log('Screenshot uploaded.');
    await delay(1000); // Increased delay after upload
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    throw error;
  }
}

async function enterPrompt(prompt, aiService) {
    console.log(`Attempting prompt upload`);
    try {
        let inputText;
        if (aiService === 'claude') {
            inputText = await waitForElement('.ProseMirror');
            console.log('Claude input area area found. Entering prompt...');
            inputText.textContent = prompt;

        } else if (aiService === 'chatgpt') {
            inputText = await waitForElement('#prompt-textarea');
            console.log('ChatGPT input area area found. Entering prompt...');
            inputText.value = prompt;
        }        
        
        inputText.dispatchEvent(new Event('input', { bubbles: true }));
        //inputText.dispatchEvent(new Event('change', { bubbles: true })); 

        console.log('Prompt entered');
        await delay(1000);
    } catch (error) {
        console.error('Error entering prompt:', error);
        throw error;
    }
}

async function sendPrompt(aiService) {
  try {
    let sendButton;
    if (aiService === 'claude') {
      sendButton = await waitForElement('button[aria-label="Send Message"]');
    } else if (aiService === 'chatgpt') {
      sendButton = await waitForElement('button[data-testid="send-button"]');
    }
    sendButton.click();
    console.log('Prompt sent.');
  } catch (error) {
    console.error('Error sending prompt:', error);
    throw error;
  }
}

async function injectScreenshotAndPrompt(screenshot, prompt, aiService) {
  try {
    console.log('Starting injection process.');
    
    await uploadScreenshot(screenshot, aiService);
    await delay(1000); // Add delay between upload and entering prompt
    await enterPrompt(prompt, aiService);
    await sendPrompt(aiService);
    
    return { success: true, message: 'Screenshot and prompt injected successfully' };
  } catch (error) {
    console.error('Error in content script:', error);
    return { success: false, message: error.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message);
  
  if (message.action === 'ping') {
    sendResponse({ pong: true });
    return true;
  }

  if (message.action === 'injectScreenshotAndPrompt') {
    injectScreenshotAndPrompt(message.screenshot, message.prompt, message.aiService)
      .then(sendResponse)
      .catch((error) => sendResponse({ success: false, message: error.message }));
    return true; // Indicates that the response will be sent asynchronously
  }
});

console.log('Content script setup complete');