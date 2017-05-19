const sourceCode1 = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
const sourceCode2 = [1,2,3,4,5,6,7,8,9,0]
module.exports = {
  getCode () {
    const length = 6
    let letterNumber = Math.floor(Math.random() * (6 - 1 + 1) + 1)
    let letter = this.createHandle(sourceCode1, letterNumber)
    let num = this.createHandle(sourceCode2, length - letterNumber)
    let code = num.concat(letter)
    return this.shuffle(code)
  },
  createHandle (arr, len) {
    let stack = []
    let result = []
    let min = 0
    let max = arr.length - 1
    for (let i = 0; i < len; i++) {
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