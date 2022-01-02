(function () {    
  chrome.runtime.onMessage.addListener(function (message, sender) {
    console.log("Background - Recieved message from content script  ---- ", message)
    if (message.action == "injectCSS") {
      injectThatCss()
    } 
    if (message.action == "injectGridCSS") {
      injectThatGridCss()
    } 
    else if (message.action == "hello") {
      console.log("recieved hello from BS")

      console.log("Background, sender.tab.id", sender.tab.id)
      chrome.tabs.sendMessage(sender.tab.id, {
        action: "hello",
      });
    } 
    else if (message.action == "loaded") {
      console.log('msg load')
    }
    else if (message.action == "hideTitle") {
      console.log('HIDE HIDE !!! ')
    }
  })
}())

function injectThatCss() {
  
  var css = "body { border: 20px dotted pink; }";
  var insertingCSS = browser.tabs.insertCSS({
    // code: css,
    file: 'main/styleFile.css'
  });
  insertingCSS.then(console.log("YES"), console.log("NOPE :("), console.log("then this") );
}
function injectThatGridCss() {
  
  var insertingCSS = browser.tabs.insertCSS({
    // code: css,
    file: 'main/styleGrid.css'
  });
}
