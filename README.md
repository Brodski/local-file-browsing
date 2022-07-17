Extension for Firefox

"Better Local File Browsing" adds CSS and javascript to the browser when viewing local files.

Feel free to contribute!

### Start with development:  
 1. remove the `min` in `main/content-script.min.js` at `manifest.json`   
 2. $ web-ext run     
 3. (Optional) Uncomment all console.log()     
 `$ web-ext run -t chromium`  To run in chrome.   
### To build, 'compile' and package:  
 1. `$ google-closure-compiler -O SIMPLE  ./main/content-script.js --js_output_file ./main/content-script.min.js`   
 2. `$ web-ext build --overwrite-dest --ignore-files ./main/content-script.js ./store-assets`                   


##### Note
- Chrome requries manifest 3, Firefox on manifest 2.   
- The two manifests manifest.chrome.json and manifest.firefox, I copy and paste that into manifest.json individually then run the build.
