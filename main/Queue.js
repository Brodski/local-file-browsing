
//
// head ........ tail
// [e1, e2, e3, ...e]
// shift = e1 <----- [    e2, e3, ...e]
export class Queue {
  constructor(callback, callback2) {
    this.items = [];
    this.callback = callback;
    this.callback2 = callback2;
    this.rate = 50
    this.isRunning = false
  }

  setCallback2() {
    this.callback2 = callback2;
  }

  enqueue(item) { // for the purpose of this. only unique
    let idx = this.items.indexOf(item)
    if ( idx >= 0) { // it already exists in array, dont do anything
      console.log("Queue ========> REJECTING idx=", idx, item)
      return
    }
    this.items.push(item)
    // console.log("Queue -----> adding idx=", idx, item)
    if (this.isRunning == false) {
      this.processQueue()
    }
  }
  dequeue() {
    return this.items.shift()
  }

  async processQueue() {
    if (this.items.length == 0) {
      this.isRunning = false
      return
    }
    if (this.items.length > 0) {
      
      let ele = this.dequeue() 
      await this.callback(ele).then(()=> console.log("1done", ele))
      // .then( () => console.log("ele transition...", ele))
      .then( async ()=> await this.callback2(ele))
      .then(()=> console.log("2done", ele))
      // console.log('done with callback 1')
      
      // console.log('done with callback 2')
      this.isRunning = true;
    }
    setTimeout(() => {  
      this.processQueue()
    }, this.rate)

  }
}