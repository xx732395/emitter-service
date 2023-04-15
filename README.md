# emitter-service

在 mitt 基础上添加了 once,runOnce 方法的发布订阅库
再次感谢 mitt 的作者,为我门提供如此优秀的解决方案,https://github.com/developit/mitt

// using ES6 modules
import pubsub from 'emitter-service'

// using CommonJS modules
var pubsub = require('emitter-service')

## 用法

```js
import pubsub from 'emitter-service'

const emitter = pubsub()

// 订阅foo事件
emitter.on('foo', e => console.log('foo', e))

// 订阅全部事件
emitter.on('*', (type, e) => console.log(type, e))

// 发布foo事件
emitter.emit('foo', { a: 'b' })

// 清除所有订阅
emitter.all.clear()

function onFoo() {}
emitter.on('foo', onFoo) // 订阅
emitter.off('foo', onFoo) // 取消订阅

emitter.once('foo', onFoo) // 订阅一次

// runOnce 用法
// runOnce 类似节流的方式实现让promise只执行一次,但可以在结果返回的时候全部拿到结果,这在某些特定情况很有用
const promiseFn = (num: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(num)
    }, Math.random() * 50)
  })
}
const wrap = emitter.runOnce(promiseFn)

for (let i = 0; i < 10; i++) {
  wrap(i)
    .then(res => {
      console.log(res) // 这里会输出10次0 因为只会执行一次promiseFn
    })
    .catch(err => {
      console.log(err)
    })
}

// 还提供了缓存功能,比如某个请求你只想发送一次,后面想直接拿到结果就可以用这个参数来控制
const wrap = emitter.runOnce(promiseFn, promiseFn.toString(), true)

for (let i = 0; i < 10; i++) {
  await wrap(i)
    .then(res => {
      console.log(res) // 这里会输出10次0 因为缓存了第一次执行的结果
    })
    .catch(err => {
      console.log(err)
    })
}
```
