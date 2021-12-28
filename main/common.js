import "../node_modules/freezeframe/dist/freezeframe.min.js";

export function main() {
  console.log("****** Freeze frame ******");
}

export async function getOptions() {
  let result = browser.storage.local.get({ 
    size: 150,
    gifAuto: false,
    videoPreviewOff: false,
    layout1: true,
    layout2: false,
    themeDark1: false,
    themeDark2: false,
  });
  // await result.then((result) => { 
  //   console.log("Got 123: ", result)  
  // })
  return result
}