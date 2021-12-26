// https://github.com/otiai10/chrome-extension-es6-import
(async () => {
  console.log('hello!!!')
  const src = chrome.runtime.getURL('./main-content.js');
  const contentScript = await import(src);
  contentScript.main(/* chrome: no need to pass it */);
  initInjectBS()
  initAddedClasses()
  setupListener()
  // convertElesToImgs()
  // let imgLinks = document.querySelectorAll
  makeThumbNails("tr a[href$='jpg'], tr a[href$='gif'], tr a[href$='jpeg'], tr a[href$='webp'], tr a[href$='png']", "img")
  
  
  makeThumbNails("tr a[href$='mp4'], tr a[href$='webm'], tr a[href$='m4v']", "video")
})();

/////////////////////////////////////////////////////////////////
// BG SCRIPTS
function initInjectBS() {
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

function convertElesToImgs() {
  
  console.time("convertElesToImgs")
  console.log("start convertElesToImgs")

  let imgLinks = document.querySelectorAll("tr a[href$='jpg'], tr a[href$='gif'], tr a[href$='jpeg'], tr a[href$='webp'], tr a[href$='png']")
  for (let i=0; i < imgLinks.length; i++) {
    imgLinks[i].className += " anchor_wrap "
    // imgLinks[i].querySelector("img").remove() // The file type icon?? maybe we keep
    console.log(imgLinks[i])
    let myText = ''
    imgLinks[i].childNodes.forEach( x => {
      if (x.nodeType == Node.TEXT_NODE) {
        myText += x.textContent
        x.remove()
      }
    })
    let fileIcon = imgLinks[i].querySelector("img:not(.item_tag)")
    let htmlz =`
      ${fileIcon.outerHTML}
      <div class=' caption_title'> ${myText} </div>
      <img class='item_img' src='${imgLinks[i].getAttribute("href")}'/> 
    `
    imgLinks[i].innerHTML = htmlz
    // workOnTRows2(imgLinks[i])  

  }
  console.log("end convertElesToImgs")
  console.timeEnd("convertElesToImgs")
}


function workOnTRows() {
  document.querySelectorAll(".item_wrap").forEach( (tr) => {
    let img = tr.querySelector('td:nth-child(1)')
    let size = tr.querySelector('td:nth-child(2)')
    let date = tr.querySelector('td:nth-child(3)')
    const width = (ele ) => {
      return ele.getClientRects()[0].width
    }
    // console.log('================================')
    // console.log(img)
    // console.log("sizeWidth", size.getClientRects()[0].width)
    // console.log("dateWidth", date.getClientRects()[0].width)
    // console.log("imgWidth", img.getClientRects( )[0].width)
    // console.log(width(date) + width(size) > width(img))
    if (width(date) + width(size) > width(img)) {
      date.className += " undo-abs"
    }
  })
}


function makeThumbNails(queryString, fileType) {
  

  console.time("convertElesToImgs")
  console.log("start convertElesToImgs")
  let links = document.querySelectorAll(queryString)
  for (let i=0; i < links.length; i++) {
    links[i].className += " anchor_wrap "
    // imgLinks[i].querySelector("img").remove() // The file type icon?? maybe we keep
    console.log(links[i])
    let myText = ''
    links[i].childNodes.forEach( x => {
      if (x.nodeType == Node.TEXT_NODE) {
        myText += x.textContent
        x.remove()
      }
    })
    let fileIcon = links[i].querySelector("img:not(.item_tag)")
    let htmlz =`
      ${fileIcon.outerHTML}
      <div class=' caption_title'> ${myText} </div>
      <${fileType} class='item_img' src='${links[i].getAttribute("href")}' loading="lazy" preload="metadata" /> 
    `
    links[i].innerHTML = htmlz

    // Shift HTML, positioning img/vid preview on top, then title + info on bottom
    let xxx = links[i].insertBefore(links[i].querySelector(".item_img"), links[i].children[0])
    console.log('yeah', xxx)

    if (fileType == "img") {
      setTimeout(workOnTRows, 300) // some goofy img hack. B/c apparently window.onload comes too soon.
    }
    if (fileType == "video") {
      let vid = links[i].querySelector("video")
      
      vid.addEventListener("mouseenter", (e) => {
        const divide = 10
        const intervalTimeout = 800
        let hovering = true

        console.log("IN!!!!")
        console.log("vid.duration", vid.duration)
        console.log("divide", divide)
        console.log("vid.duration / divide ", vid.duration / divide)

        previewVid(vid, vid.duration / divide)

        const loopy = ()=> {
          setTimeout( () => { 
            previewVid(vid, vid.duration / divide)
            if (hovering) {
              loopy()
            }
          }, intervalTimeout)
        }
        loopy()
        vid.addEventListener("mouseout", (e) => {
          // previewVid(vid, vid.duration / 8)
          console.log("OUT!!!!!")
          hovering = false
          clearTimeout(timeoutID)
        }) 
        
      }) 
    }

  }
  console.log("end convertElesToImgs")
  console.timeEnd("convertElesToImgs")

}

function previewVid(vid, nextSkip){
  // setTimeout( () => {
    vid.currentTime += nextSkip
    if (vid.currentTime + nextSkip >= vid.duration) {
      // vid.currentTime = Math.floor(Math.random() * vid.duration)   // ranom positon
      vid.currentTime =  Math.floor(Math.random() * 20) / 2; // random between 0-10, 20 possibilities 
      console.log("preview-> RESET")
    }
    console.log("preview-> going to", vid.currentTime)
  // }, 300)
}