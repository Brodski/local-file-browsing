// https://github.com/otiai10/chrome-extension-es6-import
(async () => {
  console.log('hello!!!')
  const src = chrome.runtime.getURL('./main-content.js');
  const contentScript = await import(src);
  contentScript.main(/* chrome: no need to pass it */);
  initInjectBS()
  initAddedClasses()
  setupListener()
  await convertElesToImgs()
  // workOnTRows()
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

const getQueryImgsString = () => {
  return "tr a[href$='jpg'], tr a[href$='gif'], tr a[href$='jpeg'], tr a[href$='webp']"
  // // let theQuery = ''
  // // ['jpg', 'gif', 'jpeg', 'webp'].forEach(imgType => { theQuery += " tr a[href$='" + imgType + "'], " }).slice(0, -2)
  // let imgTypesList = ['jpg', 'gif', 'jpeg', 'webp', 'png']
  // let theQuery = ''
  // imgTypesList.forEach(imgType => {
  //     theQuery = theQuery + "tr a[href$='" + imgType + "'], "
  // })
  // return theQuery.slice(0, -2)
}

function convertElesToImgs() {
  console.time("convertElesToImgs")
  console.log("start convertElesToImgs")
  // let itemsMain = document.querySelectorAll('tr.item_wrap')
  // for (let i=0; i<itemsMain.length; i++) {
  //   itemsMain[i].querySelectorAll("tr a[href$='jpg'], tr a[href$='gif'], tr a[href$='jpeg'], tr a[href$='webp']")
  // }



  let imgLinks = document.querySelectorAll("tr a[href$='jpg'], tr a[href$='gif'], tr a[href$='jpeg'], tr a[href$='webp'], tr a[href$='png']")
  for (let i=0; i < imgLinks.length; i++) {
    imgLinks[i].className += " anchor_wrap "
    // imgLinks[i].querySelector("img").remove() // The file type icon?? maybe we keep
    console.log(imgLinks[i])
    let myText = ''
    let myDiv = document.createElement('div')
    imgLinks[i].childNodes.forEach( x => {
      if (x.nodeType == Node.TEXT_NODE) {
        myText += x.textContent
        x.remove()
      }
    })
    // console.log("myText")
    // console.log(myText)
    let fileIcon = imgLinks[i].querySelector("img:not(.item_tag)")
    // console.log("fileIcon")
    // console.log(fileIcon.outerHTML)
    let htmlz =`
      ${fileIcon.outerHTML}
      <div class=' caption_title'> ${myText} </div>
      <img class='item_img' src='${imgLinks[i].getAttribute("href")}'/> 
    `
    imgLinks[i].innerHTML = htmlz


    // imgLinks[i].querySelector(".caption_wrap')").insertBefore(fileIcon, imgLinks[i].querySelector(".caption_title"))
    // imgLinks[i].parentNode

    // myDiv.innerText = myText
    // myDiv.className += " caption_title"
    // imgLinks[i].appendChild(myDiv)


    // let newImg = document.createElement("img")
    // newImg.className +=  " item_img"
    // newImg.setAttribute("src", imgLinks[i].getAttribute("href"))
    // imgLinks[i].appendChild(newImg)

    // let myDiv = document.createElement('div')
    // myDiv.innerText = myText
    

  }
  console.log("end convertElesToImgs")
  console.timeEnd("convertElesToImgs")
}


function workOnTRows() {
  console.log("hello!!1231312312313")
  console.log(' document.querySelectorAll(".item_wrap")')
  console.log( document.querySelectorAll(".item_wrap"))
  document.querySelectorAll(".item_wrap").forEach( (tr) => {
    let img = tr.querySelector('td:nth-child(1)')
    let size = tr.querySelector('td:nth-child(2)')
    let date = tr.querySelector('td:nth-child(3)')
    const width = (ele ) => {
      return ele.getClientRects()[0].width
    }
    console.log('================================')
    console.log(img)
    console.log("sizeWidth", size.getClientRects()[0].width)
    console.log("dateWidth", date.getClientRects()[0].width)
    console.log("imgWidth", img.getClientRects( )[0].width)
     console.log(width(date) + width(size) > width(img))
    if (width(date) + width(size) > width(img)) {
      console.log(date)
      date.className += " undo-abs"
    }
  })
}