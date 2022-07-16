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
    pageSize: 50,
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
  console.log("sending")
  console.log(sending)
}