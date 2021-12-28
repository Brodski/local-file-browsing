let options;
let mainContent;
const defaultSize = 150

(async () => {
  console.log("wtf")
  console.log("readystate?", document.readyState)
  const src = chrome.runtime.getURL('../main/common.js');
  mainContent = await import(src);
  // options = await mainContent.getOptions();

})();


// function getOptions() {
//   let results = browser.storage.local.get(
//     keys    // null, string, object or array of strings
//   )
//   results.then(onGot, onError)
//   const onError = (err) => { console.log("Error: ", err) }
//   const onGot = (result) => { console.log("Got: ", result)  }
// }


function save() {
  console.log("SAVEEED!")
  const getSizeWithErrorCheck = () => {
    let num = parseInt(document.querySelector("#size").value)
    if (Number.isNaN(num)) {
      document.querySelector("#size").value = defaultSize
      return defaultSize
    }
    num = Math.min(Math.max(num, 50), 1000)
    document.querySelector("#size").value = num
    return num
  }

  let res = browser.storage.local.set({
    size: getSizeWithErrorCheck(),
    gifAuto: document.querySelector("#gifAuto").checked,
    videoPreviewOff: document.querySelector("#videoPreviewOff").checked,
    layout1: document.querySelector("#layout1").checked,
    layout2: document.querySelector("#layout2").checked,
    themeDark1: document.querySelector("#themeDark1").checked,
    themeDark2: document.querySelector("#themeDark2").checked,

    hideTitles: document.querySelector("#hideTitles").checked,
    hideMetadata: document.querySelector("#hideMetadata").checked,
  });

  res.then( (res) => {
    console.log("done", res); 
    // document.querySelector("#save").textContent = "Saved";
  })

}

function restore_options() {
  // let result = chrome.storage.local.get({// Use default value color = 'red' and likesColor = true.
  //   favoriteColor: 'red',
  //   likesColor: true
  // })
  // let result = browser.storage.local.get();
  let result = browser.storage.local.get({ 
    size: defaultSize,
    gifAuto: false,
    videoPreviewOff: false,
    layout1: true,
    layout2: false,
    themeDark1: false,
    themeDark2: false,
  });
  console.log("result", result)
  const onError = (err) => { console.log("Error: ", err) }
  const onGot = (result) => { console.log("Got: ", result)  }
  result.then((result) => { 
    console.log("Got: ", result)  
    
    document.querySelector("#size").value = result.size
    document.querySelector("#gifAuto").checked = result.gifAuto
    document.querySelector("#videoPreviewOff").checked = result.videoPreviewOff
    document.querySelector("#layout1").checked = result.layout1
    document.querySelector("#layout2").checked = result.layout2,
    document.querySelector("#themeDark1").checked = result.themeDark1
    document.querySelector("#themeDark2").checked = result.themeDark2
  }, onError);
  
}

function hideTitles() {
  chrome.runtime.sendMessage({
    action: "hideTitles",
  });
}
document.addEventListener("DOMContentLoaded", restore_options)
document.getElementById('save').addEventListener('click', save);

document.getElementById('hideTitles').addEventListener('click', hideTitles);
