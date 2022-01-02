let optionsExt;
let mainContent;
const defaultSize = 150;

(async () => {
  console.log("wtf")
  console.log("readystate?", document.readyState)
  const src = chrome.runtime.getURL('main/common.js');
  console.log(src)
  mainContent = await import(src);
  console.log("mainContent", mainContent)
  restore_options()


})();


// document.addEventListener("DOMContentLoaded", restore_options)
document.getElementById('save').addEventListener('click', save);
document.getElementById('hideTitlesBtn').addEventListener('click', hideTitlesMsgBg);




async function save() {
  console.log("SAVEEED!")
  const getSizeWithErrorCheck = () => {
    let num = parseInt(document.querySelector("#size").value)
    if (Number.isNaN(num)) {
      return document.querySelector("#size").value  //defaultSize
    }
    num = Math.min(Math.max(num, 50), 1000)
    document.querySelector("#size").value = num
    return num
  }

  console.log('document.querySelector("#hideTitles").checked', document.querySelector("#hideTitles").checked)

    
  let sortRadios = [].slice.call(document.querySelectorAll("[name='sort']"))
  let sortSelected = sortRadios.filter((inp)=> { return inp.checked })
  
  console.log("sortSelected")
  console.log(sortSelected)

  let res = browser.storage.local.set({
    size: getSizeWithErrorCheck(),
    gifAuto: document.querySelector("#gifAuto").checked,
    isNoPreviewVideo: document.querySelector("#isNoPreviewVideo").checked,
    isNoPreviewImg: document.querySelector("#isNoPreviewImg").checked,
    isAdvPreview: document.querySelector("#isAdvPreview").checked,

    layout1: document.querySelector("#layout1").checked,
    layout2: document.querySelector("#layout2").checked,
    themeDark1: document.querySelector("#themeDark1").checked,
    themeDark2: document.querySelector("#themeDark2").checked,

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
  

  optionsExt = mainContent.getOptions();
  console.log("optionsExt", optionsExt)
  const onError = (err) => { console.log("Error: ", err) }
  const onGot = (result) => { console.log("Got: ", result)  }
  optionsExt.then((result) => { 
    console.log("Got: ", result)  
    
    document.querySelector("#size").value = result.size
    document.querySelector("#gifAuto").checked = result.gifAuto
    document.querySelector("#isNoPreviewVideo").checked = result.isNoPreviewVideo
    document.querySelector("#isNoPreviewImg").checked = result.isNoPreviewImg
    document.querySelector("#isAdvPreview").checked = result.isAdvPreview

    document.querySelector("#layout1").checked = result.layout1
    document.querySelector("#layout2").checked = result.layout2,
    document.querySelector("#themeDark1").checked = result.themeDark1
    document.querySelector("#themeDark2").checked = result.themeDark2
    document.querySelector("#hideTitles").checked = result.hideTitles
    document.querySelector("#hideMetadata").checked = result.hideMetadata
    document.querySelector("#hideMetadata").checked = result.hideMetadata
    if (document.querySelector(`[value='${result.sort}']`)) {
      document.querySelector(`[value='${result.sort}']`).checked = true
    }
    


  }, onError);
  
}

function hideTitlesMsgBg() {
  chrome.runtime.sendMessage({
    action: "hideTitles",
  });
}