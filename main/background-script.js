(function () {    
  chrome.runtime.onMessage.addListener(async function (message, sender) {
    //console.log("Background - Recieved message from content script  ---- ", message)
    if (message.action == "hello") {
      //console.log("recieved hello from BS")
      //console.log("Background, sender.tab.id", sender.tab.id)
      chrome.tabs.sendMessage(sender.tab.id, {
        action: "hello",
      });
    } 
    if (message.action == "getOptions") {
      //console.log("recieved getOptions from BS")
      //console.log("Background, sender.tab.id", sender.tab.id)
      let optionz = await getOptions()
      //console.log("OPTIONZZZZ", optionz)
      chrome.tabs.sendMessage(sender.tab.id, {
        action: "recieveOptions",
        options: optionz
      });
    } 
    if (message.action == "hideTitles") {

      //console.log('HIDE HIDE !!! ')
      //console.log(sender)
      //console.log(message)

      chrome.tabs.sendMessage(sender.tab.id, {
        action: "hello",
      });
    }
  })
}())

function bgHello() {
  //console.log("bg hello!!")
}

async function getOptions() {
  let result = browser.storage.local.get({ 
    width: 150, // <--- defaults to 150
    height: 200,
    gifAuto: false,
    hideMetadata: false,
    hideTitles: false,
    isNoPreviewImg: false,
    isNoPreviewVideo: false,
    isAdvPreview: false,
    sort: 'default-sort',
    darkmode: null,
    pageSize: 30,
  });
  return result
}
