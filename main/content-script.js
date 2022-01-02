const videoQueryStringConst = "tr a[href$='mp4'], tr a[href$='webm'], tr a[href$='m4v'], tr a[href$='mkv']";
const imageQueryStringConst = "tr a[href$='jpg'], tr a[href$='gif'], tr a[href$='jpeg'], tr a[href$='webp'], tr a[href$='png']";
let optionsExt;
let queue;
let globalCountId = 0;
// https://github.com/otiai10/chrome-extension-es6-import
(async () => {
  // let css = initInjectCSS()  
  let css = initInjectCSS("grid")
  let idsPromise = setupIdsOnEveryLink()
  console.log('hello!!!')
  const src = chrome.runtime.getURL('main/common.js');
  const src2 = chrome.runtime.getURL('main/Queue.js');
  const mainContent = await import(src);
  const Queue = await import(src2);
  mainContent.main(/* chrome: no need to pass it */);
  optionsExt = await mainContent.getOptions();
  letsGo()
  initAddedClasses()
  // options.then( (result) => { 
  //   console.log("Got 12345: ", result)  
  // })
  console.log("optionsExt")
  console.log(optionsExt)
  queue = new Queue.Queue( async (ele) => { doThumbnailAux(ele) }, async (ele) => { doFreezeFrame(ele) });
  console.log("queue")
  console.log(queue)
  
  await idsPromise
  setupListener()
  await initIntersectionObs() 
  initIntersectionObsVisibililty()
  document.querySelector("#UI_showHidden").style.display = "unset";
})();

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
// BG SCRIPTS
function initInjectCSS(css) {
  if (css == 'grid') {  
    chrome.runtime.sendMessage({
      action: "injectGridCSS",
    });
  }
  else {
    chrome.runtime.sendMessage({
      action: "injectCSS",
    });

  }
}


function setupListener() {
  chrome.runtime.onMessage.addListener(function (message) {
    console.log("Content Script - MSG FROM BACKGROUND -", message)
    if (message.action == "actiontime") {
      run();
    } 
    if (message.action == "hello") {
      console.log("he said hello !")
    }
  });  
}


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
const doThumbnailAux = (target) => {
  let isImg = target.querySelector(imageQueryStringConst)
  let isVideo = target.querySelector(videoQueryStringConst)

  if (isImg && !optionsExt.isNoPreviewImg) {
    makeThumbNails(target, "img", imageQueryStringConst)
    
  }
  else if (isVideo && !optionsExt.isNoPreviewVideo) {
    makeThumbNails(target, "video", videoQueryStringConst)
  }
  else {
    makeDefaultThumbnail(target)
  }
  // console.log("done with thumbnail inside", target)
}

const doFreezeFrame = (target) => {
  const queryX = "tr a[href$='gif'] img:not([src^='moz=icon'])"
  let img = target.querySelector(queryX)
  if (img && img.tagName.toLowerCase() == "img") {
    if (!img.complete) {
      setTimeout(()=> doFreezeFrame(target), 100)
      return
    }

    new Freezeframe(target.querySelector(queryX), {
      trigger: "hover",
      overlay: true,
      responsive: false
    })
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function initAddedClasses() {
  let mainGrid = document.querySelector("body > table > tbody")
  let heading  = document.querySelector("body > table > thead")
  mainGrid.className += " mainGrid "  
  heading.className += " mainHeading "  

  if (optionsExt.hideMetadata){
    document.querySelector('body').classList.toggle('hide_metadata')

  }
  if (optionsExt.hideTitles) {
    document.querySelector('body').classList.toggle('hide_title')
  }
}


function setupIdsOnEveryLink() {
  let links = document.querySelectorAll('body >table > tbody > tr')
  for (let i=0; i< links.length; i++) {
    links[i].id = i
  }
}
const getTextSpecial = (anchor_wrap) => {
  let myText = ''
  anchor_wrap.childNodes.forEach( x => {
    if (x.nodeType == Node.TEXT_NODE) {
      myText += x.textContent
      x.remove()
    }
  })
  return myText
}

function letsDoIt(column, order) {
  // name = 0
  // size = 1
  // Modified = 2
  if (!gRows) {
    gRows = Array.from(gTBody.rows);
  }
  // var order;
  // order = "asc";
  gOrderBy = column;
  gTable.setAttribute("order-by", column);
  gRows.sort(compareRows);
  gTable.removeChild(gTBody);
  gTable.setAttribute("order", order);

  if (order == "asc")
    for (var i = 0; i < gRows.length; i++)
      gTBody.appendChild(gRows[i]);
  else
    for (var i = gRows.length - 1; i >= 0; i--)
      gTBody.appendChild(gRows[i]);
  gTable.appendChild(gTBody);

}
function alertThis() {
  // alert("WHUAT")
  if (document.readyState == 'complete') {
    console.log("document.readyState 2", document.readyState)
    console.log("Bang bang")
    console.log(gRows ? gRows : "gRows null")
    console.log(gTable ? gTBody : "gTbody null")
    // letsDoIt(2,"desc")
  } else {
    window.addEventListener("load", (e) => {
      console.log("load bang")
      console.log(gRows)
      console.log(gTable)
      // letsDoIt(2,"desc")
    })
  }
}

function letsGo() {
  let script = document.createElement("script");
  let script2 = document.createElement("script");
  script.innerHTML = letsDoIt
  document.body.appendChild(script)

  script2.innerHTML = '(' + alertThis  + ')()'
  document.body.appendChild(script2)

  console.log(alertThis)
  console.log("optionExt.sort")
  console.log(optionsExt.sort)
  // alertThis()
  // window.alertThis()
  // alertThis()
}
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
///////////////            INTESECTIOn          /////////////////
///////////////            INTESECTIOn          /////////////////
///////////////            INTESECTIOn          /////////////////
///////////////            INTESECTIOn          /////////////////
///////////////            INTESECTIOn          /////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
function initIntersectionObsVisibililty() {
  const options = {
    threshold: 0,
    rootMargin: "-50px 0px -50px 0px"
  }
  // When elements enter, visiblity=on
  const observer =  new IntersectionObserver( (entries) => {
    entries.forEach( entry => {
      // console.log("=======================")
      // console.log("isIntersecting",entry.isIntersecting, entry.target)
      
      if (entry.isIntersecting) {
        // console.log("querySelector", entry.target.querySelector('.item_img'))
        entry.target.querySelector('.item_img').style.visibility = "visible";
        // entry.target.style.visibility = "visible";
      }
    })
  }, options)

  // When elements exit, visiblity=off // Dont know why, but splitting the observer into two works
  const observerOut = new IntersectionObserver( (entries) => {
    entries.forEach( entry => {
      if (!entry.isIntersecting) {
        // entry.target.style.visibility = "hidden";
        entry.target.querySelector('.item_img').style.visibility = "hidden";
      }
    })
  }, options)

  let trList = document.querySelectorAll("body > table > tbody > tr")
  trList.forEach( el => {
    observer.observe(el)
    observerOut.observe(el)
  })
}




function initIntersectionObs() {
  let firstRunComplete = false
  let count = 0;
  let offsetMargin = 700;
  const options = {
    threshold: 0,
    rootMargin: `${offsetMargin}px 0px ${offsetMargin}px 0px`
  }
  // console.log("observer optiosn:" ,options)
  const observer = new IntersectionObserver( (entries) => {
    entries.forEach( entry => {
      if (entry.isIntersecting) {
        if (!firstRunComplete && count < 15){
          count ++
          queue.enqueue(entry.target)
          setTimeout( () => { firstRunComplete = true}, 200);
          observer.unobserve(entry.target)
          return
        }
        count++
        
        // We had a timeout to check if the file is on the user's screen. B/c if the user scrolls through a big file
        // then this app will render and process every file from the top to where were the user scrolled to 
        // (maybe to the bottom of the file, thus processing everything). 
        // If the user has 500+ files on the directory then huge performance cost.
        setTimeout( () => {
    
          
          
          // If X is in viewport and it hasn't been processed by the queue yet. 
          // 1) Sometimes 'isIntersecting' will trigger twice b/c the timeout hasnt unobserved it
          // 2) And sometimes while in that 1st trigger it will be processed and dequeued
          // 3) By the time the second setTimeout runs via the 2nd intersecting observer it will be out of the queue and processed, and thus added to the queue again.

          let bounding = entry.target.getBoundingClientRect();
          // console.log('--------------------------------')
          // console.log('offset=', offsetMargin , entry.target)
          // console.log(bounding.bottom)
          // console.log(bounding.top )
          // console.log((bounding.bottom >= 0 - offsetMargin)  ,  (bounding.top <= window.innerHeight + offsetMargin)   )      

          if ( (bounding.bottom >= 0 - offsetMargin)  && (bounding.top <= window.innerHeight + offsetMargin) && !entry.target.classList.contains("item_wrap")) { 
            // console.log(count, '----------------------------------')
            
            observer.unobserve(entry.target)
            queue.enqueue(entry.target)
          } 
        }, 300) // arbitrary number. not in sync with anything on page either
      }
    })
  }, options)

  let trList = document.querySelectorAll("body > table > tbody > tr")
  trList.forEach( el => {
    observer.observe(el)
  })
}


//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
////////////////////      THUMBNAIL       ////////////////////////
////////////////////      THUMBNAIL       ////////////////////////
////////////////////      THUMBNAIL       ////////////////////////
////////////////////      THUMBNAIL       ////////////////////////
////////////////////      THUMBNAIL       ////////////////////////
////////////////////      THUMBNAIL       ////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
// Classic Content scripts

function makeDefaultThumbnail(tr){
  let htmlz
  let anchor_wrap = tr.querySelector("a")
  anchor_wrap.className += " anchor_wrap_icon ";
  tr.className += " nothing_wrap ";
  let fileIcon = anchor_wrap.querySelector("img:not(.item_tag)")  

  // 2 // Title rearrange
  let myText = getTextSpecial(anchor_wrap)

  // 3
  if (fileIcon == null) {
    htmlz =`
      <img class="folder_icon" src="chrome://global/skin/dirListing/folder.png" >
      <div class=' caption_title_icon'> ${myText} </div>
      `
      tr.querySelector('td:nth-child(2)').innerText = "- KB"
  }
  else {
    htmlz =`
      <div class="icon_wrap" >
        ${fileIcon ? fileIcon.outerHTML.replace("?size=16", "?size=40") : '' }
      </div>
      <div class=' caption_title_icon'> ${myText} </div>
    `
  }
  anchor_wrap.innerHTML = htmlz

}

function makeThumbNails(tr, fileType, queryString) {
  tr.className += " item_wrap ";
  // 2 // Title rearrange
  let attributes;
  let anchor_wrap = tr.querySelector(queryString)
  anchor_wrap.className += " anchor_wrap ";

  let myText = getTextSpecial(anchor_wrap)
  if (fileType == "video") {
    attributes =  " preload='metadata' muted='true' width='150px' "
  } else {
    attributes = 'loading="lazy"'
  }
  // 3
  let fileIcon = anchor_wrap.querySelector("img:not(.item_tag)")
  let skipTime = optionsExt.isAdvPreview ? '#t=10' : ''
  let htmlz =`
    ${fileIcon.outerHTML}
    <div class=' caption_title'> ${myText} </div>
    <${fileType} class='item_img' src="${anchor_wrap.getAttribute("href").replaceAll('"',"'") + skipTime}" ${attributes}  /> 
  `
  
  // 4 // Shift HTML, positioning img/vid preview on top, then title + info on bottom
  anchor_wrap.innerHTML = htmlz
  anchor_wrap.insertBefore(anchor_wrap.querySelector(".item_img"), anchor_wrap.children[0])

  // 5.A // img
  if (fileType == "img") {    
    setupImage(tr)
  }
  // 5.B // video
  if (fileType == "video") {
    let vid = anchor_wrap.querySelector("video")
    setupVideo(vid)
  }
}


function setupVideo(vid) {    
  // vid.currentTime = 4;
  const divide = 10
  const intervalTimeout = 800
  vid.addEventListener("mouseenter", (e) => {
    let hovering = true;
    e.target.style.visibility = "visible";

    previewVid(vid, vid.duration / divide)
    const loopy = ()=> {
      setTimeout( () => { 
        previewVid(vid, vid.duration / divide)
        if (hovering) { loopy() }
      }, intervalTimeout)
    }
    loopy()
    vid.addEventListener("mouseout", (e) => {
      hovering = false
      clearTimeout(timeoutID)
    }) 
  }) 
}

function setupImage(tr) {
  setTimeout( () => {
    let img = tr.querySelector('td:nth-child(1)')
    let size = tr.querySelector('td:nth-child(2)')
    let date = tr.querySelector('td:nth-child(3)')
    const width = (ele ) => {  return ele.getClientRects()[0].width }
    if (width(date) + width(size) > width(img)) {
      date.className += " undo-abs"
    }
    }, 300) // some goofy img hack. B/c apparently window.onload comes too soon.
}


function previewVid(vid, nextSkip){
    vid.currentTime += nextSkip
    if (vid.currentTime + nextSkip >= vid.duration) {
      // vid.currentTime = Math.floor(Math.random() * vid.duration)   // ranom positon
      vid.currentTime =  Math.floor(Math.random() * 20) / 2; // random between 0-10, 20 possibilities 
    }
}
