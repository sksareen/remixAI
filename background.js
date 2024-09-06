const AI_URLS = {
  claude: 'https://claude.ai/new',
  chatgpt: 'https://chat.openai.com/'
};

async function getSelectedAIService() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ aiService: 'claude' }, (items) => {
      resolve(items.aiService);
    });
  });
}

async function captureScreenshot() {
  try {
    return await chrome.tabs.captureVisibleTab(null, { format: 'png' });
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    throw error;
  }
}

async function openAITab(aiService) {
  try {
    return await chrome.tabs.create({ url: AI_URLS[aiService] });
  } catch (error) {
    console.error(`Failed to open ${aiService} tab:`, error);
    throw error;
  }
}

function waitForTabLoad(tabId) {
  return new Promise((resolve) => {
    function listener(changedTabId, changeInfo) {
      if (changedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(resolve, 2000); // Increased wait time to 2 seconds
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function injectContentScriptAndSendMessage(tabId, message) {
  try {
    // Check if the content script is already injected
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.tabs.sendMessage(tab.id, { action: 'ping' }).catch(() => {});
    
    if (!results) {
      // Content script is not injected, so inject it
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      console.log('Content script injected successfully');
    } else {
      console.log('Content script already injected');
    }

    console.log('Sending message to content script');
    const response = await chrome.tabs.sendMessage(tabId, message);
    console.log('Message sent to content script, response:', response);
    return response;
  } catch (error) {
    console.error('Error in injecting content script or sending message:', error);
    throw error;
  }
}

import { PROMPTS } from './prompts.js';

chrome.action.onClicked.addListener(async (tab) => {
  try {
    console.log('Starting process...');
    
    const aiService = await getSelectedAIService();
    console.log(`Using ${aiService} service`);
    
    const screenshot = await captureScreenshot();
    console.log('Screenshot captured');
    
    const newTab = await openAITab(aiService);
    console.log(`${aiService} chat window opened`);
    
    await waitForTabLoad(newTab.id);
    console.log(`${aiService} tab loaded`);
    
    const prompt = PROMPTS.default;
    
    const result = await injectContentScriptAndSendMessage(newTab.id, { 
      action: 'injectScreenshotAndPrompt',
      screenshot: screenshot,
      prompt: prompt,
      aiService: aiService
    });
    
    if (result.success) {
      console.log('Process completed successfully:', result.message);
    } else {
      console.error('Process failed:', result.message);
    }
  } catch (error) {
    console.error('Error in main process:', error);
  }
});