import "./node_modules/freezeframe/dist/freezeframe.min.js";

export function main() {
  // const user = User.new({name: 'otiai20'});
  // console.log(user.greet());
  // console.log("Is chrome.runtime available here?",typeof chrome.runtime.sendMessage == "function",);
  const logo = new Freezeframe('.body', {
    trigger: false
  })
  // console.log("logo")
  // console.log(logo)
}