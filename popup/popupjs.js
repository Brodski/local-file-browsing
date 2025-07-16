let optionsExt;
let mainContent;
const defaultHeight = 200;
const defaultWidth = 150;
const defaultPageSize = 30;

(async () => {
  window.addEventListener("DOMContentLoaded", (e) => {
    restore_options()
  })
})();

window.addEventListener("DOMContentLoaded", (e) => {
  window.addEventListener('load', () => { onDropdownChange() })
  document.getElementById('themes').addEventListener("change", ()=> onDropdownChange() )
  document.getElementById('save').addEventListener('click', save);
  // document.getElementById('test').addEventListener('click', hideTitlesMsgBg);
})

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

  const getPageWithErrorCheck = (query) => {
    let num = parseInt(document.querySelector(query).value)
    if (Number.isNaN(num)) {
      num = defaultPageSize;
    }
    document.querySelector(query).value = num
    return num

  }
    
  let sortRadios = [].slice.call(document.querySelectorAll("[name='sort']"))
  let sortSelected = sortRadios.filter((inp)=> { return inp.checked })

  let res = browser.storage.local.set({
    height: getSizeWithErrorCheck('#height'),
    width: getSizeWithErrorCheck('#width'),

    pageSize: getPageWithErrorCheck('#pageSize'),

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
  const onError = (err) => { console.log("Error: ", err) }
  const onGot = (result) => { console.log("Got: ", result)  }
  optionsExt.then((result) => {
    //console.log("Got: ", result)  
    
    document.querySelector("#height").value = result.height
    document.querySelector("#width").value = result.width
    document.querySelector("#pageSize").value = result.pageSize

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

function hideTitlesMsgBg() {
  chrome.runtime.sendMessage({
    action: "hideTitles",
  });
}