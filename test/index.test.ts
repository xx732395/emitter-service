/* eslint-disable no-await-in-loop */
import { describe, expect, it, expectTypeOf, vi } from 'vitest'
import pubsub from '../src/index'

const pubsubInstance = pubsub()
// eslint-disable-next-line no-promise-executor-return
const delay = (m: number) => new Promise(r => setTimeout(r, m))

const promiseFn = (num: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(num)
    }, Math.random() * 50)
  })
}

describe('pubsub', () => {
  it('检查导出的是否是function', () => {
    expectTypeOf(pubsub).toBeFunction()
  })

  it('检查map类型', () => {
    expectTypeOf(pubsubInstance.all).toMatchTypeOf(new Map())
  })

  it('检查发布订阅1', () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    pubsubInstance.on('foo1', fn1)
    pubsubInstance.on('foo2', fn2)
    pubsubInstance.emit('foo1')
    pubsubInstance.emit('foo2')

    expect(fn1).toBeCalledTimes(1)
    expect(fn2).toBeCalledTimes(1)
  })

  it('检查发布订阅2', () => {
    const fn1 = vi.fn()
    pubsubInstance.on('foo1', fn1)
    for (let index = 0; index < 100; index++) {
      pubsubInstance.emit('foo1')
    }
    expect(fn1).toBeCalledTimes(100)
  })
  it('检查发布订阅3', () => {
    const fn1 = vi.fn()
    pubsubInstance.on('foo1', fn1)
    pubsubInstance.off('foo1', fn1)
    for (let index = 0; index < 100; index++) {
      pubsubInstance.emit('foo1')
    }
    expect(fn1).toBeCalledTimes(0)
  })

  it('检查发布订阅4', () => {
    const fn1 = vi.fn()
    pubsubInstance.on('foo1', fn1)
    pubsubInstance.on('foo1', fn1)
    pubsubInstance.off('foo1', fn1)
    for (let index = 0; index < 100; index++) {
      pubsubInstance.emit('foo1')
    }
    expect(fn1).toBeCalledTimes(100)
  })

  it('检查发布订阅5', () => {
    const fn1 = vi.fn()
    pubsubInstance.on('foo1', fn1)
    pubsubInstance.on('foo1', fn1)
    pubsubInstance.off('foo1', fn1)
    pubsubInstance.off('foo1', fn1)
    for (let index = 0; index < 100; index++) {
      pubsubInstance.emit('foo1')
      pubsubInstance.emit('foo1')
      pubsubInstance.emit('foo1')
    }
    expect(fn1).toBeCalledTimes(0)
  })

  it('检查发布订阅6', () => {
    const fn1 = vi.fn()
    pubsubInstance.once('foo1', fn1)
    for (let index = 0; index < 100; index++) {
      pubsubInstance.emit('foo1')
      pubsubInstance.emit('foo1')
    }
    expect(fn1).toBeCalledTimes(1)
  })

  it('检查发布订阅7', () => {
    const fn1 = vi.fn()
    pubsubInstance.once('foo1', fn1)
    pubsubInstance.off('foo1', fn1) // 不能这样取消
    for (let index = 0; index < 100; index++) {
      pubsubInstance.emit('foo1')
      pubsubInstance.emit('foo1')
    }
    expect(fn1).toBeCalledTimes(1)
  })

  it('检查发布订阅8', () => {
    const fn1 = vi.fn()
    const cancel = pubsubInstance.once('foo1', fn1)
    cancel() // 取消单次事件注册
    for (let index = 0; index < 100; index++) {
      pubsubInstance.emit('foo1')
      pubsubInstance.emit('foo1')
    }
    expect(fn1).toBeCalledTimes(0)
  })

  it('检查单次运行promise1', async () => {
    const promiseFn = vi.fn().mockResolvedValue(123)
    const fn = pubsubInstance.runOnce(promiseFn)
    for (let i = 0; i < 100; i++) {
      // eslint-disable-next-line no-await-in-loop
      await fn(123)
    }
    expect(promiseFn).toBeCalledTimes(100)
  })

  it('检查单次运行promise2', async () => {
    const promiseFn = vi.fn().mockResolvedValue(999)
    const fn = pubsubInstance.runOnce(promiseFn)
    const res = await fn(123)
    expect(res).toBe(999)
  })

  it('检查单次运行promise3', async () => {
    const promiseFn = vi.fn().mockResolvedValue(123)
    const fn = pubsubInstance.runOnce(promiseFn)
    for (let i = 0; i < 100; i++) {
      fn(123)
    }
    expect(promiseFn).toBeCalledTimes(1)
  })

  it('检查单次运行promise4', async () => {
    const fn = pubsubInstance.runOnce(promiseFn)
    const result: Array<number> = []
    for (let i = 0; i < 10; i++) {
      // 不管在执行过程中怎么改变 都只会返回第一次执行的结果
      fn(i).then(res => {
        result.push(res)
      })
    }
    await delay(1000)
    expect(result).toStrictEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  })

  it('检查单次运行promise4', async () => {
    const fn = pubsubInstance.runOnce(promiseFn)
    const result: Array<number> = []
    for (let i = 0; i < 3; i++) {
      // 这里会执行10次
      result.push(await fn(i))
    }
    expect(result).toStrictEqual([0, 1, 2])
  })

  it('检查单次运行promise5', async () => {
    const fn = pubsubInstance.runOnce(promiseFn, 'promise5')
    const result: Array<number> = []
    for (let i = 0; i < 3; i++) {
      // 这里会执行10次
      result.push(await fn(i))
    }
    expect(result).toStrictEqual([0, 1, 2])
  })

  it('检查单次运行promise6', async () => {
    const fn = pubsubInstance.runOnce(promiseFn, 'promise5', true)
    const result: Array<number> = []
    for (let i = 0; i < 3; i++) {
      // 这里会执行10次
      result.push(await fn(i))
    }
    expect(result).toStrictEqual([0, 0, 0])
  })
})
