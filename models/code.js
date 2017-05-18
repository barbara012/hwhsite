const sourceCode1 = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
const sourceCode2 = [1,2,3,4,5,6,7,8,9,0]
module.exports = {
  getCode () {
    let letter = this.createHandle(sourceCode1, 0, 25)
    let num = this.createHandle(sourceCode2, 0, 9)
    let code = num.concat(letter)
    return this.shuffle(code)
  },
  createHandle (arr, min, max) {
    let stack = []
    let result = []
    for (let i = 0; i < 2; i++) {
      let index = Math.floor(Math.random() * (max - min + 1) + min)
      while(stack.find(n => n === index)) {
        index = Math.floor(Math.random() * (max - min + 1) + min)
      }
      stack.push(index)
      result.push(arr[index])
    }
    return result
  },
  shuffle (arr) {
    let len = arr.length
    for(let i = 0; i < len - 1; i++) {
      let idx = Math.floor(Math.random() * (len - i))
      let temp = arr[idx]
      arr[idx] = arr[len - i - 1]
      arr[len - i -1] = temp
    }
   return arr
  }
}