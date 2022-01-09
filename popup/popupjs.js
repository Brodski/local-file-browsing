let optionsExt;
let mainContent;
const defaultHeight = 200;
const defaultWidth = 150;

(async () => {
  console.log("wtf")
  console.log("readystate?", document.readyState)
  // const src = chrome.runtime.getURL('main/common.js');
  // console.log(src)
  // mainContent = await import(src);
  // console.log("mainContent", mainContent)
  restore_options()



  let x = browser.extension.getBackgroundPage()
  console.log("browserextension.getBackgroundPage(), ")
  console.log(x)
  console.log(x.bgHello())
  // console.log(x.chrome)
  // console.log(x.chrome.bgHello())
  // console.log(x.browser.bgHello())
  // console.log( "browser extension.getViews()")
  // console.log( browser.extension.getViews())



  // setupListener()
})();


async function save() {

  const getSizeWithErrorCheck = (query) => {
    let num = parseInt(document.querySelector(query).value)
    if (Number.isNaN(num)) {
      return query == "#height" ? defaultHeight : defaultWidth  //defaultSize
    }
    num = Math.min(Math.max(num, 50), 1000)
    document.querySelector(query).value = num
    return num
  }
    
  let sortRadios = [].slice.call(document.querySelectorAll("[name='sort']"))
  let sortSelected = sortRadios.filter((inp)=> { return inp.checked })

  let res = browser.storage.local.set({
    height: getSizeWithErrorCheck('#height'),
    width: getSizeWithErrorCheck('#width'),

    gifAuto: document.querySelector("#gifAuto").checked,
    isNoPreviewVideo: document.querySelector("#isNoPreviewVideo").checked,
    isNoPreviewImg: document.querySelector("#isNoPreviewImg").checked,
    isAdvPreview: document.querySelector("#isAdvPreview").checked,
    darkmode: document.querySelector("#themes").value,
    hideTitles: document.querySelector("#hideTitles").checked,
    hideMetadata: document.querySelector("#hideMetadata").checked,
    sort: sortSelected[0].value,    
  });

  res.then( (res) => {
    console.log("done", res); 
    let saveMsg = document.querySelector("#saveMsg")
    saveMsg.textContent = "Saved";
    saveMsg.style.color = "red";
    setTimeout(() => {
      saveMsg.textContent = ""
    }, 2000)
  })
}

async function restore_options() {
  
  let optionsExt = browser.extension.getBackgroundPage().getOptions()
  // optionsExt = mainContent.getOptions();
  // optionsExt = getOptions();
  console.log("optionsExt", optionsExt)
  const onError = (err) => { console.log("Error: ", err) }
  const onGot = (result) => { console.log("Got: ", result)  }
  optionsExt.then((result) => { 
    console.log("Got: ", result)  
    
    document.querySelector("#height").value = result.height
    document.querySelector("#width").value = result.width

    document.querySelector("#gifAuto").checked = result.gifAuto
    document.querySelector("#isNoPreviewVideo").checked = result.isNoPreviewVideo
    document.querySelector("#isNoPreviewImg").checked = result.isNoPreviewImg
    document.querySelector("#isAdvPreview").checked = result.isAdvPreview

    document.querySelector("#hideTitles").checked = result.hideTitles
    document.querySelector("#hideMetadata").checked = result.hideMetadata
    document.querySelector("#hideMetadata").checked = result.hideMetadata
    document.querySelector("#themes").value = result.darkmode 
    if (document.querySelector(`[value='${result.sort}']`)) {
      document.querySelector(`[value='${result.sort}']`).checked = true
    }
  }, onError);
  
}


function onDropdownChange() {  
  let select = document.getElementById('themes')
  select.classList = select.options[select.selectedIndex].className
}

window.addEventListener('load', () => { onDropdownChange() })
document.getElementById('themes').addEventListener("change", ()=> onDropdownChange() )
document.getElementById('save').addEventListener('click', save);
// document.getElementById('test').addEventListener('click', hideTitlesMsgBg);

function hideTitlesMsgBg() {
  chrome.runtime.sendMessage({
  // chrome.tabs.sendMessage({
    action: "hideTitles",
  });
}

// function setupListener() {
  
//   chrome.runtime.onMessage.addListener(function (message) {
//     console.log("POPUP LISTENER - MSG FROM BACKGROUND -", message)
//     if (message.action == "actiontime") {
//       run();
//     } 
//     if (message.action == "hello") {
//       console.log("he said hello !")
//     }
//   });  
// }