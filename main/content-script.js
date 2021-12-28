

const videoQueryStringConst = "tr a[href$='mp4'], tr a[href$='webm'], tr a[href$='m4v']";
const imageQueryStringConst = "tr a[href$='jpg'], tr a[href$='gif'], tr a[href$='jpeg'], tr a[href$='webp'], tr a[href$='png']";
let options;
let queue;
// https://github.com/otiai10/chrome-extension-es6-import
(async () => {
  // let css = initInjectCSS()
  initAddedClasses()

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
  console.log("Queue")
  console.log(Queue)
  queue = new Queue.Queue( (ele) => {
    doThumbnailAux(ele)
    // doFreezeFrame(ele)
  });
  // queue.callback2 = doFreezeFrame;

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
}

const doFreezeFrame = (target) => {
  const queryX = "tr a[href$='gif'] img:not([src^='moz=icon'])"
  if (target.querySelector(queryX)) {

    console.log("freeze exists s/t", target.querySelector(queryX))
    target.style.visibility = "visible";
    new Freezeframe(target.querySelector(queryX), {
      trigger: "hover",
      overlay: true,
      responsive: false
    })
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
  // initHide()
  initVisible()
}

function initVisible() {
  const options = {
    threshold: 0,
    rootMargin: "-50px 0px -50px 0px"
  }

  // When elements enter, visiblity=on
  const observer =  new IntersectionObserver( (entries) => {
    const queryX = "tr a[href$='gif'] img:not([src^='moz=icon'])"
    entries.forEach( entry => {
      
      if (entry.isIntersecting) {
        // console.log("intersecting", entry.target)
        // console.log("gif query?", entry.target.querySelector(queryX))
        entry.target.style.visibility = "visible";

        // if (entry.target.querySelector(queryX)) {
        //   new Freezeframe(entry.target.querySelector(queryX), {
        //     trigger: "hover",
        //     overlay: true,
        //     responsive: false
        //   })
        // }
      }
    })
  }, options)

  // When elements exit, visiblity=off // Dont know why, but splitting the observer into two works
  const observerOut = new IntersectionObserver( (entries) => {
    entries.forEach( entry => {
      if (!entry.isIntersecting) {
        // console.log("gif OUT!", entry.target)
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

////////////////////////////////////////////////////
////////////////////////////////////////////////////

function initIntersectionObs() {
  let firstRunComplete = false
  let count = 0;
  const options = {
    threshold: 0
    // rootMargin: "-200px 0px -200px 0px"
  }
  
  const observer = new IntersectionObserver( (entries) => {
    entries.forEach( entry => {
      if (entry.isIntersecting) {
        let semaphore = false;
        if (!firstRunComplete && count < 15){
          console.log(count, ' running on', entry.target)
          count ++
          queue.enqueue(entry.target)
          setTimeout( () => { firstRunComplete = true}, 50);
          observer.unobserve(entry.target)
          return
        }

        setTimeout( () => {
          var bounding = entry.target.getBoundingClientRect();

          console.log('2----------------------------------')
          // console.log(entry.target.getBoundingClientRect())          
          // console.log("bottom, top", bounding.bottom, bounding.top)
          // console.log((bounding.bottom >= 0)  && (bounding.top <= window.innerHeight))
          // if ( (bounding.top >= 0 && bounding.left) >= 0  && (bounding.right <= (window.innerWidth || document.documentElement.clientWidth) ) && (bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) ) ) {  // https://gomakethings.com/how-to-test-if-an-element-is-in-the-viewport-with-vanilla-javascript/
          if ( (bounding.bottom + 200 >= 0)  && (bounding.top - 200 <= window.innerHeight) ) {
            
            if (semaphore == true) {
              return
            }
            semaphore = true;
            console.log("< ------------- YES", entry.target)
            // doThumbnailAux(entry.target)
            queue.enqueue(entry.target)
            observer.unobserve(entry.target)
          } else {
            // console.log('Not in the viewport... ', entry.target);
          }
        }, 1000)

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
  items.forEach( (item) => item.className += " item_wrap")
}

/////////////////
function makeDefaultThumbnail(tr){
  let htmlz
  let anchor_wrap = tr.querySelector("a")
  anchor_wrap.className += " anchor_wrap_icon ";
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

  // 1
  let attributes;
  let anchor_wrap = tr.querySelector(queryString)
  anchor_wrap.className += " anchor_wrap ";

  // 2 // Title rearrange
  let myText = getTextSpecial(anchor_wrap)
  if (fileType == "video") {
    attributes =  "preload='metadata' muted='true' width='150px'" 
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
    // let time = tr.querySelector('td:nth-child(4)')
      const width = (ele ) => {  return ele.getClientRects()[0].width }
      if (width(date) + width(size) > width(img)) {
        date.className += " undo-abs"
      }
    }, 300) // some goofy img hack. B/c apparently window.onload comes too soon.
}





//////////////




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