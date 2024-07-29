console.log('Background Service Worker Loaded')

chrome.runtime.onInstalled.addListener(async () => {
    console.log('Extension installed')
    console.log(chrome.runtime);
})

chrome.action.setBadgeText({ text: 'ON' })

chrome.action.onClicked.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const activeTab = tabs[0]
        chrome.tabs.sendMessage(activeTab.id!, { message: 'clicked_browser_action' })
    })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received:', message)
    const { command } = message
    switch (command) {
        case 'SET_JWT':
            chrome.tabs.query({ active: true }, function () {
                chrome.storage.local.set({ jwt: message.token }, () => {
                    sendResponse({ status: 'Token saved' })
                })
            })
            break
        default:
            break
    }
    return true;
}),

chrome.commands.onCommand.addListener(command => {
    console.log(`Command: ${command}`)

    if (command === 'refresh_extension') {
        chrome.runtime.reload()
    }
})

export {}
