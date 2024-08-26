document.getElementById('translateButton').addEventListener('click', () => {
    const targetLang = document.getElementById('targetLang').value;

    if (typeof chrome !== 'undefined' && chrome.tabs) {
        // Nếu là extension của Chrome
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const url = `https://translate.google.com/translate?hl=${targetLang}&sl=auto&u=${encodeURIComponent(tabs[0].url)}`;
            chrome.tabs.update(tabs[0].id, {url: url});
        });
    } else {
        // Nếu là trang web bình thường
        const translateFrame = document.createElement('iframe');
        translateFrame.style.position = 'fixed';
        translateFrame.style.width = '100%';
        translateFrame.style.height = '100%';
        translateFrame.style.top = '0';
        translateFrame.style.left = '0';
        translateFrame.style.zIndex = '1000';
        translateFrame.style.border = 'none';
        translateFrame.src = `https://translate.google.com/translate?hl=${targetLang}&sl=auto&u=${encodeURIComponent(window.location.href)}`;
        
        document.body.appendChild(translateFrame);
    }
});