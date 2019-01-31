const isObj = (value) =>{
    return Object.prototype.toString.call(value) === '[object Object]';
}

const deepCopy = () => {

}

console.log(isObj([]))