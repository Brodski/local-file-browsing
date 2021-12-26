

(async () => {
  // workOnTRows()
  console.log("wtf")
  console.log("readystate?", document.readyState)
  // workOnTRows()
  let script = `
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

  window.workItBabyy = workOnTRows
  window.workItBabyy()
  console.log("worked??")
  console.log(console.log(document.readyState))
  setTimeout(workItBabyy, 500)
  document.addEventListener('load', ()=> {
    console.log("BAM LOAD")
    console.log(console.log(document.readyState))
    workItBabyy()

  })
`
// let s = document.createElement('script')
// s.innerHTML = script
// document.head.appendChild(s)

})();


// function workOnTRows() {
//   console.log("hello!!z")
//   console.log(' document.querySelectorAll(".item_wrap")')
//   console.log( document.querySelectorAll(".item_wrap"))
//   document.querySelectorAll(".item_wrap").forEach( (tr) => {
//     let img = tr.querySelector('td:nth-child(1)')
//     let size = tr.querySelector('td:nth-child(2)')
//     let date = tr.querySelector('td:nth-child(3)')
//     const width = (ele ) => {
//       return ele.getClientRects()[0].width
//     }
//     console.log('================================')
//     console.log(img)
//     // console.log("sizeWidth", size.getClientRects()[0].width)
//     // console.log("dateWidth", date.getClientRects()[0].width)
//     console.log("imgWidth", img.getClientRects( )[0].width)
//     // console.log(width(date) + width(size) > width(img))
//     if (width(date) + width(size) > width(img)) {
//       size.className += " undo-abs"
//     }
//   })
// }