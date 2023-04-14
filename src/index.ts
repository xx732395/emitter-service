/* eslint-disable space-before-function-paren */
/* eslint-disable @typescript-eslint/no-explicit-any */
type EventType = string | symbol

type Handler<T = any> = (event?: T) => void

type WildcardHandler = (type: EventType, event?: any) => void
type EventHandlerList = Array<Handler>
type WildCardEventHandlerList = Array<WildcardHandler>
type EventHandlerMap = Map<EventType, EventHandlerList | WildCardEventHandlerList>

export interface Emitter {
  all: EventHandlerMap
  on<T = any>(type: EventType, handler: Handler<T>): void
  on(type: '*', handler: WildcardHandler): void
  off<T = any>(type: EventType, handler: Handler<T>): void
  off(type: '*', handler: WildcardHandler): void
  emit<T = any>(type: EventType, event?: T): void
  emit(type: '*', event?: any): void
  once<T = any>(type: EventType, handler: Handler<T>): () => void
  once(type: '*', handler: WildcardHandler): () => void
  runOnce<Args extends any[], F extends (...argsType: Args) => any>(asyncfunc: F, uniqueName?: string, cacheResult?: boolean)
}

// type AsnyFunc = <T = any, R = any>(...args: T[]) => Promise<R>;

export function pubsub(): Emitter {
  const all = new Map()
  const body = {
    all,
    on<T = any>(type: EventType, handler: Handler<T>) {
      const handlers = all.get(type)
      const added = handlers && handlers.push(handler)
      if (!added) all.set(type, [handler])
    },
    off<T = any>(type: EventType, handler: Handler<T>) {
      const handlers = all.get(type)
      if (handlers) handlers.splice(handlers.indexOf(handler) >>> 0, 1)
    },
    emit<T = any>(type: EventType, evt: T) {
      const types = (all.get(type) || []) as EventHandlerList
      types.slice().map(handler => {
        handler(evt)
      })
      const allTypes = (all.get('*') || []) as WildCardEventHandlerList
      allTypes.slice().map(handler => {
        handler(type, evt)
      })
    },
    once<T = any>(type: EventType, handler: Handler<T>): () => void {
      const listener = (event?: T) => {
        if (handler) handler.call(this, event)
        body.off(type, listener)
      }
      body.on(type, listener)
      return () => {
        body.off(type, listener)
      }
    },
    runOnce<Args extends any[], F extends (...argsType: Args) => any>(asyncfunc: F, uniqueName = asyncfunc.toString(), cacheResult = false) {
      let cache: ReturnType<F> | undefined
      const runingList = new Set<string>()
      return (...args: Parameters<F>) => {
        return new Promise<ReturnType<F>>((resolve, reject) => {
          if (cacheResult && cache !== undefined) {
            resolve(cache)
          } else if (runingList.has(uniqueName)) {
            // 订阅登陆请求 防止并发 出现错误的话 不会rej回来
            body.once(uniqueName, data => {
              resolve(data)
            })
          } else {
            runingList.add(uniqueName)
            // 此处接受一个promise 参数由外部运行完毕后传入
            asyncfunc(...args)
              .then(resp => {
                if (cacheResult) {
                  cache = resp
                }
                body.emit(uniqueName, resp) // 订阅者发布信息
                runingList.delete(uniqueName)
                resolve(resp)
              })
              .catch(err => {
                runingList.delete(uniqueName)
                reject(err)
              })
          }
        })
      }
    }
  }
  return body
}
