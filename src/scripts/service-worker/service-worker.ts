
chrome.runtime.onInstalled.addListener(async () => {
})

chrome.action.setBadgeText({ text: 'ON' })

chrome.action.onClicked.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const activeTab = tabs[0]
        chrome.tabs.sendMessage(activeTab.id!, { message: 'clicked_browser_action' })
    })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

    if (command === 'refresh_extension') {
        chrome.runtime.reload()
    }
})

export {}
