function hi() {
  console.log('hi 3')
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
  });
  //  result.then((result) => { 
  //   console.log("Got 123: ", result)  
  // })
  return result
}


async function getOptions2() {

  let sending = chrome.runtime.sendMessage({
    action: "getOptions",
  }).then(  ()=> console.log("sent"));
  await sending
  // let sending = await chrome.runtime.onMessage.addListener(function (message) {
  //   console.log("Content Script2222 - MSG FROM BACKGROUND2 -", message)
  //   if (message.action == "recieveOptions") {
  //     console.log("Got options")
  //     console.log(message.options) // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/sendMessage#parameters
  //                                   //'options' name is a chrome thing. By coincidence i happen to be retrieving a vairable i also named options
  //   }
  // });  
  console.log("sending")
  console.log(sending)
}