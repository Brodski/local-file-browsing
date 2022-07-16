// import Freezeframe from "freezeframe";

const videoQueryStringConst = "tr a[href$='mp4' i], tr a[href$='webm' i], tr a[href$='m4v' i], tr a[href$='mkv' i]"
const imageQueryStringConst = "tr a[href$='jpg' i], tr a[href$='gif' i], tr a[href$='jpeg' i], tr a[href$='webp' i], tr a[href$='png' i], tr a[href$='jfif' i], tr a[href$='cms' i]"
let optionsExt;
let queue;
let globalCountId = 0;

// https://github.com/otiai10/chrome-extension-es6-import
(async () => {
  console.log('hello!!!')
  hi() // https://stackoverflow.com/questions/19717126/chrome-extension-referencing-calling-other-script-functions-from-a-content-scrip
  console.log(videoQueryStringConst)
  console.log(imageQueryStringConst)
  // let css = initInjectCSS("grid")
  let idsPromise = initIdsOnEveryLink()
  setupListener()
  console.log("1         START")
  // await getOptions2()
  console.log("2         END")
  optionsExt = await getOptions(); // Common.js
  initAddedClasses()
  initOrderingSort()
  console.log("optionsExt")
  console.log(optionsExt)
  queue = new Queue( async (ele) => { doThumbnailAux(ele) }, async (ele) => { doFreezeFrame(ele) });
  console.log("queue")
  console.log(queue)
  
  await idsPromise
  await initIntersectionObs() 
  initIntersectionObsVisibililty()
  document.querySelector("#UI_showHidden").style.display = "unset";

  initSplitItems()
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
    if (message.action == "recieveOptions") {
      console.log("Got options")
      console.log(message.options) //'options' name is a chrome thing. By coincidence i happen to be retrieving a vairable i also named options // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/sendMessage#parameters                                    
      optionsExt = message.options
    }
  });  
}


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// Called by the queue. via queue's higher order function
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
  const queryX = "tr a[href$='gif' i] img:not([src^='moz=icon'])"
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
  let html  = document.querySelector("body > table > thead")
  // mainGrid.className += " mainGrid "  
  heading.className += " mainHeading "  
  
  document.documentElement.style.setProperty('--my-item-height', optionsExt.height+"px");
  document.documentElement.style.setProperty('--my-grid-width', optionsExt.width + "px");
  

  if (optionsExt.hideMetadata){
    document.querySelector('body').classList.toggle('hide_metadata')
  }
  if (optionsExt.hideTitles) {
    document.querySelector('body').classList.toggle('hide_title')
  }
  if (optionsExt.darkmode && optionsExt.darkmode != 'None') { //option's value attribue default to the stuff inside if no value is given
    document.querySelector('body').classList.add(optionsExt.darkmode)
    document.querySelector('body').classList.add('darkmode')
    document.getElementsByTagName('html')[0].classList.add('darkmode')
  }
}


async function initIdsOnEveryLink() {
  let links = document.querySelectorAll('body >table > tbody > tr')
  for (let i=0; i< links.length; i++) {
    links[i].id = i
  }
}

function initSplitItems() {
  let pages = [];
  let page; 
  let chunck = optionsExt.pageSize;
  // console.log("chunck")
  // console.log(chunck)
  // console.log(chunck)
  // console.log(chunck)
  let everyFileInDir = document.querySelectorAll("body > table > tbody > tr");
  let everyFileInDirArr = Array.from(everyFileInDir);
// console.log("everyFileInDirArr.length ")
// console.log(everyFileInDirArr.length)
//   let loopLength = chunck > everyFileInDirArr.length ? chunck : everyFileInDirArr.length;
//   console.log("loopLength")
//   console.log(loopLength)
//   console.log("chunck > everyFileInDirArr.length")
//   console.log(chunck > )
  // Split into chuncks
  for (let i=0; i < everyFileInDirArr.length; i = i + chunck) {
    page = everyFileInDirArr.slice(i, i + chunck);
    pages.push(page)
  }
  
  // split every image/video onto pages
  let tbodyId = "tbody-"
  for (let i=0; i < pages.length; i++) {
    let tbody4Page = document.createElement("tbody");
    tbody4Page.id = tbodyId + i;
    pages[i].forEach( img => {
      tbody4Page.appendChild(img);
    })
    document.querySelector("body > table").appendChild(tbody4Page)  
    if (i == 0) { tbody4Page.classList.add("active") }

  }

  // create pagination elements
  let pageNumsHtml = ""
  for (let i=0; i < pages.length; i++) {
    pageNumsHtml += `<button id="btn-${i}"> ${i} </button>`
    if (i==0) {pageNumsHtml = `<button id="btn-${i}" class='active'> ${i} </button>` }
  }
    

  let paginationHtml = `
  <div class="pagination_wrap">
    <div class="pagination">
      ${pageNumsHtml}
    </div>
    <button class="nextBtn"> Next »</button>
  </div>
  `
  let paginationComp = document.createElement("div")
  paginationComp.innerHTML = paginationHtml

  let tbodyLast = document.querySelector("body > table > tbody:last-child");
  tbodyLast.insertAdjacentElement("afterend", paginationComp)



  const removeClassFromGroup = (groupEles, className = "active") => {
    Array.from(groupEles).forEach(function(ele) { 
      ele.classList.remove(className);
    })
  }
    
  
  // Add Event listener to buttons
  const tbodyQuery = "body > table > tbody";
  const btnsQuery = ".pagination button";
  let btnNums = paginationComp.querySelectorAll(btnsQuery);
  for (let i=0; i< btnNums.length; i++) {
    if (btnNums[i]) {
      btnNums[i].addEventListener("click", function(e) {
        // Buttons
        removeClassFromGroup(document.querySelectorAll(btnsQuery))
        this.classList.add("active")

        // Table / Page
        removeClassFromGroup(document.querySelectorAll(tbodyQuery))
        document.querySelector("#" + tbodyId + i)?.classList.add("active")
      })
    }
  }

  // Add Event listener to Next button
  paginationComp.querySelector("button.nextBtn").addEventListener("click", (e) => {
    let activeTbody = document.querySelector(tbodyQuery + ".active")
    let activeBtn = document.querySelector( btnsQuery + ".active")

    if (activeTbody.nextSibling.id.includes(tbodyId)) { // check we are not on last page
      removeClassFromGroup(document.querySelectorAll(tbodyQuery) )
      removeClassFromGroup(document.querySelectorAll(btnsQuery) ) 
      activeTbody.nextSibling.classList.add("active");
      activeBtn.nextSibling.classList.add("active");
    }
  })
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
// #################################################################### //
// #################################################################### //
// #################################################################### //
//  Cleverly inject functions in the page, inject variables from here 
//  into the page, and use variables & functions in the page
// #################################################################### //
// #################################################################### //
// #################################################################### //


// Cleverly added this function to the page, where it has access to the page's variables & functions
// We are in page-space, not in content-script space
// Sorts items on the page
function sortItems(column, order) { 
  // name = 0
  // size = 1
  // Modified = 2
  // gRows, gOrderBy, and gTable already exist in the page.
  if (!gRows) {
    gRows = Array.from(gTBody.rows);
  }
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
// Calls the inital Sorting function and puts our options on the page.
function setupSort() {
  let column, order;
  if (optionsExt.sort == "date-newest"){
    column = 2
    order = "desc"
  } else if (optionsExt.sort == "date-oldest") { 
    column = 2
    order = "asc"
  } else if (optionsExt.sort == "name-az") {
    column = 0
    order = "asc"
  } else if (optionsExt.sort == "name-za") {
    column = 0
    order = "desc"
  } else if (optionsExt.sort == "size-smallest") {
    column = 1
    order = "asc"
  } else if (optionsExt.sort == "size-largest") {
    column = 1
    order = "desc"
  }

  if (document.readyState == 'complete' && optionsExt.sort != 'default-sort' ) {
    sortItems(column, order)
  } else {
    window.addEventListener("load", (e) => {
      if (optionsExt.sort != 'default-sort') {
        sortItems(column, order)
      }
    })
  }
}

function initOrderingSort() {
  
  let script = document.createElement("script");
  let script2 = document.createElement("script");
  let script3 = document.createElement("script");
  script.innerHTML = sortItems
  script2.innerHTML = `let optionsExt=${JSON.stringify(optionsExt)};`
  script3.innerHTML = '(' + setupSort  + ')()'
  document.body.appendChild(script)
  document.body.appendChild(script2)
  document.body.appendChild(script3)

}
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
///////////////            INTESECTION          /////////////////
///////////////            INTESECTION          /////////////////
///////////////            INTESECTION          /////////////////
///////////////            INTESECTION          /////////////////
///////////////            INTESECTION          /////////////////
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
      // console.log("isIntersecting " + entry.target.id ,entry.isIntersecting, entry.target)
      
      if (entry.isIntersecting && entry.target.querySelector('.item_img')) {
        console.log("intersecting", entry.target)
        entry.target.querySelector('.item_img').style.visibility = "visible";
      } 
      
    })
  }, options)

  // When elements exit, visiblity=off // Dont know why, but splitting the observer into two works
  const observerOut = new IntersectionObserver( (entries) => {
    entries.forEach( entry => {
      if (!entry.isIntersecting && entry.target.querySelector('.item_img')) {
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
          observer.unobserve(entry.target)
          setTimeout( () => { firstRunComplete = true}, 200);
          return
        }
        count++
        
        // We had a timeout to check if the file is on the user's screen. B/c if the user scrolls through a big file then this app will render
        // and process every file from the top to where were the user scrolled to (maybe to the bottom of the file, thus processing everything). 
        // If the user has 500+ files on the directory then huge performance cost.
        setTimeout( () => {                 
          // If X is in viewport and it hasn't been processed by the queue yet. 
          // 1) Sometimes 'isIntersecting' will trigger twice b/c the timeout hasnt unobserved it
          // 2) And sometimes while in that 1st trigger it will be processed and dequeued
          // 3) By the time the second setTimeout runs via the 2nd intersecting observer it will be out of the queue and processed, and thus added to the queue again.

          let bounding = entry.target.getBoundingClientRect();

          if ( (bounding.bottom >= 0 - offsetMargin)  && (bounding.top <= window.innerHeight + offsetMargin) && !(entry.target.classList.contains("item_wrap") || entry.target.classList.contains("nothing_wrap")) ) { 
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

  // 5
  if (fileType == "img") {    
    setupImage(tr)
  }
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
    console.log(e.target)
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
  // debugger
  setTimeout( () => {
    let img = tr.querySelector('td:nth-child(1)')
    let size = tr.querySelector('td:nth-child(2)')
    let date = tr.querySelector('td:nth-child(3)')
    const width = (ele ) => {  return ele.getClientRects()[0].width }
    if (width(date) + width(size) > width(img)) {
      date.className += " undo-abs"
    }
    }, 300) // some goofy img hack. B/c apparently window.onload comes too soon.
    let asjk = tr.querySelector('.item_img')
    // tr.querySelector('.item_img').addEventListener('mouseover', e => {
    asjk.addEventListener('mouseover', e => {
      // console.log(e.target)
      e.target.style.visibility = "visible"
    })
}


function previewVid(vid, nextSkip){
    vid.currentTime += nextSkip
    if (vid.currentTime + nextSkip >= vid.duration) {
      vid.currentTime =  Math.floor(Math.random() * 20) / 2; // random between 0-10, 20 possibilities 
    }
}
