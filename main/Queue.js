
//
// head ........ tail
// [e1, e2, e3, ...e]
// shift = e1 <----- [    e2, e3, ...e]
export class Queue {
  constructor(callback, callback2) { // Good enough for this project
    this.items = [];
    this.callback = callback;
    this.callback2 = callback2;
    this.rate = 10
    this.isRunning = false
  }

  enqueue(item) { // for the purpose of this. only unique
    let idx = this.items.indexOf(item)
    if ( idx >= 0) { // it already exists in array, dont do anything
      console.log("Queue ========> REJECTING idx=", idx, item)
      return
    }
    this.items.push(item)
    // console.log("Queue -----> adding idx=", idx, item)
    if ( this.isRunning == false) {
    // if (true || this.isRunning == false) {
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
      this.isRunning = true;      
      let ele = this.dequeue() 

      // console.log("QUEUE", this.items.length, "running queue on ", ele)
      await this.callback(ele)
      // .then(()=> console.log("1done", ele))
      .then( ()=> this.callback2(ele))
      // .then(()=> console.log("2done", ele))

      

      this.processQueue()
      // setTimeout(() => {  
      //   this.processQueue()
      // }, 2000)

    }
  }
}