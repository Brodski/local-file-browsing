import "../node_modules/freezeframe/dist/freezeframe.min.js";

export function main() {
  console.log("****** Freeze frame ******");
}

export async function getOptions() {
  let result = browser.storage.local.get({ 
    width: 150, // <--- defaults to 150
    height: 200,
    gifAuto: false,
    hideMetadata: false,
    hideTitles: false,
    isNoPreviewImg: false,
    isNoPreviewVideo: false,
    isAdvPreview: false,
    sort: 'default-sort',
    darkmode: null,
  });
  //  result.then((result) => { 
  //   console.log("Got 123: ", result)  
  // })
  return result
}