
//
// head ........ tail
// [e1, e2, e3, ...e]
// shift = e1 <----- [    e2, e3, ...e]
export class Queue {
  constructor(callback) {
    this.items = [];
    this.callback = callback
    // this.callback2 = callback2
    this.rate = 50
    this.isRunning = false
  }
  enqueue(item) {
    this.items.push(item)
    if (this.isRunning == false) {
      this.processQueue()
    }
  }
  dequeue() {
    return this.items.shift()
  }

  processQueue() {
    if (this.items.length == 0) {
      this.isRunning = false
      return
    }
    if (this.items.length > 0) {
      let ele = this.dequeue() 
      this.callback(ele)
      // this.callback2(ele)
      this.isRunning = true;
    }
    setTimeout(() => {  
      this.processQueue()
    }, this.rate)

  }
}