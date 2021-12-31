

const videoQueryStringConst = "tr a[href$='mp4'], tr a[href$='webm'], tr a[href$='m4v']";
const imageQueryStringConst = "tr a[href$='jpg'], tr a[href$='gif'], tr a[href$='jpeg'], tr a[href$='webp'], tr a[href$='png']";
let options;
let queue;
let globalCountId = 0;
// https://github.com/otiai10/chrome-extension-es6-import
(async () => {
  // let css = initInjectCSS()
  initAddedClasses()
  let idsPromise = setupIdsOnEveryLink()
  console.log('hello!!!')
  const src = chrome.runtime.getURL('main/common.js');
  const src2 = chrome.runtime.getURL('main/Queue.js');
  const mainContent = await import(src);
  const Queue = await import(src2);
  mainContent.main(/* chrome: no need to pass it */);
  options = await mainContent.getOptions();
  // options.then( (result) => { 
  //   console.log("Got 12345: ", result)  
  // })
  console.log("options")
  console.log(options)
  queue = new Queue.Queue( async (ele) => {
     doThumbnailAux(ele)
    }, async (ele) => {
     doFreezeFrame(ele)
  });
  // queue.setCallback2(doFreezeFrame)
  console.log("queue")
  console.log(queue)

  console.log("freeze")
  console.log(doFreezeFrame)
  // window.doFreezeFrame = doFreezeFrame

  console.time("idlinks")
  await idsPromise
  console.timeEnd("idlinks")
  setupListener()
  await initIntersectionObs() 
  // initIntersectionObsVisibililty()
  initVisible()
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
function initInjectCSS() {
  chrome.runtime.sendMessage({
    action: "injectCSS",
  });
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
function hideMetadataDisplay() {
  document.querySelector('body').classList.toggle('hide_metadata')
}
function hideTitleDisplay() {
  document.querySelector('body').classList.toggle('hide_title')
}
const doThumbnailAux = (target) => {
  let isImg = target.querySelector(imageQueryStringConst)
  let isVideo = target.querySelector(videoQueryStringConst)
  if (isImg) {
    makeThumbNails2(target, "img", imageQueryStringConst)
  }
  else if (isVideo) {
    makeThumbNails2(target, "video", videoQueryStringConst)
  }
  else {
    makeDefaultThumbnail(target)
  }
  console.log("done with thumbnail inside", target)
}

const doFreezeFrame = (target) => {
  const queryX = "tr a[href$='gif'] img:not([src^='moz=icon'])"
  let img = target.querySelector(queryX)
  if (target.querySelector(queryX)) {
    target.style.visibility = "visible";
    console.log("?????", img.complete)
    if (img.tagName.toLowerCase() == "img" && !img.complete) {
      console.log("Re running")
      console.log(img.tagName.toLowerCase())
      console.log(img.complete)
      setTimeout(()=> doFreezeFrame(target), 500)
      return
    }
    console.log("freeze exists s/t", target.querySelector(queryX))
    target.style.visibility = "visible";

    new Freezeframe(target.querySelector(queryX), {
      trigger: "hover",
      overlay: true,
      responsive: false
    })
  }
}

function setupIdsOnEveryLink() {
  let links = document.querySelectorAll('body >table > tbody > tr')
  for (let i=0; i< links.length; i++) {
    // links[i].setAttribute("id", i)
    // links[i].id = i
    links[i].id = i
  }
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
function initIntersectionObsVisibililty() {
  const options = {
    threshold: 0,
    rootMargin: "-50px 0px -50px 0px"
  }
  // When elements enter, visiblity=on
  const observer =  new IntersectionObserver( (entries) => {
    entries.forEach( entry => {
      
      if (entry.isIntersecting) {
        entry.target.style.visibility = "visible";
      }
    })
  }, options)

  // When elements exit, visiblity=off // Dont know why, but splitting the observer into two works
  const observerOut = new IntersectionObserver( (entries) => {
    entries.forEach( entry => {
      if (!entry.isIntersecting) {
        entry.target.style.visibility = "hidden";
      }
    })
  }, options)

  let trList = document.querySelectorAll("body > table > tbody > tr")
  trList.forEach( el => {
    observer.observe(el)
    observerOut.observe(el)
  })
}

function initVisible() {
  
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////

function initIntersectionObs() {
  let firstRunComplete = false
  let count = 0;
  const options = {
    threshold: .3,
    // rootMargin: "-200px 0px -200px 0px"
  }
  
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
          // console.log('--------------------------------')
          // console.log(entry.target)
          //  console.log(entry.target.id)
          let ele = document.getElementById(entry.target.id)
          // console.log(ele)

          let bounding = entry.target.getBoundingClientRect();
          // if ( (bounding.bottom < 0)  && (bounding.top > window.innerHeight) ) {
          //     console.log("NOPE!!!!!!",Math.round(bounding.bottom), Math.round(bounding.top), ele )
          // }
          
          // if ( (bounding.top >= 0 && bounding.left) >= 0  && (bounding.right <= (window.innerWidth || document.documentElement.clientWidth) ) && (bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) ) ) {  // https://gomakethings.com/how-to-test-if-an-element-is-in-the-viewport-with-vanilla-javascript/
          // If X is in viewport and it hasn't been processed by the queue yet. 
          // 1) Sometimes 'isIntersecting' will trigger twice b/c the timeout hasnt unobserved it
          // 2) And sometimes while in that 1st trigger it will be processed and dequeued
          // 3) By the time the second setTimeout runs via the 2nd intersecting observer it will be out of the queue and processed, and thus added to the queue again.
          // ----------
          // bottom viewport
          if ( (bounding.bottom >= 0)  && (bounding.top <= window.innerHeight) && !entry.target.classList.contains("item_wrap")) {
            // console.log(count, '----------------------------------')
            
            observer.unobserve(entry.target)
            queue.enqueue(entry.target)
            // console.log('unoberserving: ', entry.target)
            // console.log(entry .target.getBoundingClientRect())          
            // console.log("bottom, top", (bounding.bottom >= 0)  && (bounding.top <= window.innerHeight), Math.round(bounding.bottom), Math.round(bounding.top))
          } 
        }, 300) // arbitrary number. not in sync with anything on page either

        // observer.unobserve(entry.target)
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
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
// Classic Content scripts

function initAddedClasses() {
  let mainGrid = document.querySelector("body > table > tbody")
  let heading  = document.querySelector("body > table > thead")
  let items    = document.querySelectorAll("body > table > tbody > tr")
  mainGrid.className += " mainGrid "  
  heading.className += " mainHeading "  
  // items.forEach( (item) => item.className += " item_wrap")
}

/////////////////
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
      tr.querySelector('td:nth-child(2)').innerText = "0 KB"
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

function makeThumbNails2(tr, fileType, queryString) {

  
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
  let skipTime = '#t=4'
  let htmlz =`
    ${fileIcon.outerHTML}
    <div class=' caption_title'> ${myText} </div>
    <${fileType} class='item_img' src='${anchor_wrap.getAttribute("href").replaceAll("'", '"') + skipTime }' ${attributes}  /> 
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

////////////////////////////

function setupVideo(vid) {    
  // vid.currentTime = 4;
  const divide = 10
  const intervalTimeout = 800
  vid.addEventListener("mouseenter", (e) => {
    let hovering = true

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


function modifyAllRows () {
  //   setTimeout( () => {
  //     document.querySelectorAll(".item_wrap").forEach( (tr) => {
  //       let img = tr.querySelector('td:nth-child(1)')
  //       let size = tr.querySelector('td:nth-child(2)')
  //       let date = tr.querySelector('td:nth-child(3)')
  //       const width = (ele ) => {
  //         return ele.getClientRects()[0].width
  //       }
  //       if (width(date) + width(size) > width(img)) {
  //         date.className += " undo-abs"
  //       }
  //     })
  //   }, 300) // some goofy img hack. B/c apparently window.onload comes too soon.
}