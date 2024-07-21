document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('prompt_type').addEventListener('change', toggleCustomPrompt);

function saveOptions() {
  const aiService = document.getElementById('ai_service').value;
  const contentType = document.getElementById('content_type').value;
  const promptType = document.getElementById('prompt_type').value;
  const customPrompt = document.getElementById('custom_prompt').value;

  chrome.storage.sync.set(
    { aiService, contentType, promptType, customPrompt },
    () => {
      console.log('Options saved');
      alert('Options saved successfully!');
    }
  );
}

function restoreOptions() {
  chrome.storage.sync.get(
    {
      aiService: 'claude',
      contentType: 'screenshot',
      promptType: 'default',
      customPrompt: ''
    },
    (items) => {
      document.getElementById('ai_service').value = items.aiService;
      document.getElementById('content_type').value = items.contentType;
      document.getElementById('prompt_type').value = items.promptType;
      document.getElementById('custom_prompt').value = items.customPrompt;
      toggleCustomPrompt();
    }
  );
}

function toggleCustomPrompt() {
  const promptType = document.getElementById('prompt_type').value;
  const customPromptArea = document.getElementById('custom_prompt');
  customPromptArea.style.display = promptType === 'custom' ? 'block' : 'none';
}