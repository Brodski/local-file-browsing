(function () {    
  chrome.runtime.onMessage.addListener(function (message, sender) {
    console.log("Background - Recieved message from content script  ---- ", message)
    if (message.action == "injectCSS") {
      injectThatCss()
    } 
    else if (message.action == "hello") {
      console.log("recieved hello from BS")
    } 
    else if (message.action == "loaded") {

      console.log('msg load')
      
      document.addEventListener("load", () => {
        console.log("loaded1")
      })
      window.addEventListener("load", () => {
        console.log("loaded2")
      })
    }
    console.log("Background, sender.tab.id", sender.tab.id)
    chrome.tabs.sendMessage(sender.tab.id, {
      action: "hello",
    });
  })
}())

function injectThatCss() {
  
  var css = "body { border: 20px dotted pink; }";
  var insertingCSS = browser.tabs.insertCSS({
    // code: css,
    file: './styleFile.css'
  });
  insertingCSS.then(console.log("YES"), console.log("NOPE :(") );
}