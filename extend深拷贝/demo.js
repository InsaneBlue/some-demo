// fork eggjs里面的extend2方法
const extendEgg = require('./extend-egg.js');
// fork node-extend方法
const extend = require('./node-extend.js');

const obj = {
  name: 'obj',
  arr: [1, 2, 3, 4, 5],
  obj1: {
    name: 'obj1',
    arr: [11, 22, 33, 44, 55, 66]
  }
}

const obj2 = {
  name: 'obj2'
}

const arr1 = [1,2,3,4]
const arr2 = [2,3]

console.log(extendEgg(true, [], arr1, arr2))
console.log(extendEgg(true, {}, obj2, obj))