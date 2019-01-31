# vue源码学习-1

1. **判断函数是否使用new关键字**

在学习vue源码的时候发现有这样一个判断：

```javascript
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
```
Vue函数必须使用 new 关键字初始化，否则会抛出警告。这里使用了 `this instanceof Vue` 来判断函数是否是用 new 关键字进行调用的。
看到这里我又去研究了一下 new 的时候做了哪些事情：

1. 创建一个空对象。
2. 把构造函数的prototype对象赋值给空对象的__proto__属性
3. 执行构造函数，并且把构造函数内部的this绑定为这个空对象
4. 将这个空对象return出去，这一步操作取决于构造函数的返回值，如果返回值是对象，那么就返回这个对象，否则返回第一步创建的空对象。

例如 `new Animal()` 的步骤，使用伪代码表示如下
```javascript
var obj = {};
obj.__proto__ = Animal.prototype;
var result = Animal.call(obj,"cat");
return typeof result === 'obj'? result : obj;
```

