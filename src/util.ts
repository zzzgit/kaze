import {wrapCountable, wrapDelay, ensureAsyncFunc} from "./wrap"
import AsyncFunc from "./type/AsyncFunc"
import AssertFunc from "./type/AssertFuncAsync"
import PromiseHood from "./type/PromiseHood"
import Corunner from "./concurrent/Corunner"
import Resolve from "./type/Resolve"
import Reject from "./type/Reject"
import {assertFunction, assertInteger, assertPromiseHoodArray, assertFunctionArray} from "./assertion"

// 分類學，参数为单个函数，数组，是否可以帶入參，是否直接执行，並發還是線性
// 错误处理，檢查無限循環，避免使用async await在源代碼
// 包裹函數，apply this
// 沒有依賴關係的，可以並發

// compose waterfall seq series
// every func can have less then one params
const PROMISE_INTERRUPT = "PROMISE_INTERRUPT"
const PROMISE_END = "PROMISE_END"

export const compose = (arr: AsyncFunc[]): AsyncFunc => {
	assertFunctionArray(arr, `[kaze][compose]: the argument should be an array of functions`)
	return (init: any) => {
		let current_pro = Promise.resolve(init)
		arr.forEach((item) => {
			const func = ensureAsyncFunc(item)
			current_pro = current_pro
				.then(accumulator => func(accumulator))
		})
		return current_pro
	}
}

export const waterfall = (arr: AsyncFunc[], init: any): Promise<any> => {
	assertFunctionArray(arr, `[kaze][waterfall]: the first argument should be an array of functions`)
	return compose(arr)(init)
}

// 兩個參數的類型應該保持一致
export const whilst = (iteratee: AsyncFunc, test_func: Function): Promise<any> => {
	assertFunction(iteratee, `[kaze][whilst]: the first argument should be a function which return a promise`)
	assertFunction(test_func, `[kaze][whilst]: the second argument should be a function`)
	// const iteratee_func = ensureAsyncFunc(iteratee)
	// if (syncMode) {
	// 	test_func = wrapAssert(test_func as AssertFuncSync)
	// }
	const repeatAsyncly = (resolve: Resolve, reject: Reject): void => {
		Promise.resolve(test_func())
			.then((result: any) => {
				if (!result) {
					resolve()
					return PROMISE_INTERRUPT
				}
				return iteratee()
			})
			.then((data: any) => {
				if (data !== PROMISE_INTERRUPT) {
					process.nextTick(() => repeatAsyncly(resolve, reject))
				}
				return PROMISE_END
			})
			.catch(reject)
	}
	return new Promise((resolve, reject) => {
		Promise.resolve(test_func())
			.then((result: any) => {
				if (!result) {
					// 第一次測試就不通過
					resolve(null)
					return PROMISE_INTERRUPT
				}
				return iteratee()
			})
			.then((data: any) => {
				if (data !== PROMISE_INTERRUPT) {
					repeatAsyncly(resolve, reject)
				}
				return PROMISE_END
			})
			.catch(reject)
	})
}
// 這個方式簡化了代碼，同時也迴避了stack overflow的問題，但是異常處理非常麻煩，需要try catch，因為https://eslint.org/docs/rules/no-async-promise-executor
export const whilst2 = (iteratee_func: AsyncFunc, test_func: AssertFunc): Promise<any> => {
	if (!test_func) {
		test_func = () => Promise.resolve(true)
	}
	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async (resolve) => {
		while (await test_func()) {
			await iteratee_func()
		}
		return resolve(null)
	})
}
// iteratee test_func, 兩個參數的類型應該一致
export const until = (iteratee: AsyncFunc, test_func: Function): Promise<any> => {
	assertFunction(iteratee, `[kaze][until]: the first argument should be a function which return a promise`)
	assertFunction(test_func, `[kaze][until]: the second argument should be a function`)
	// const iteratee_func = ensureAsyncFunc(iteratee)
	// if (syncMode) {
	// 	test_func = wrapAssert(test_func as AssertFuncSync)
	// }
	const repeatAsyncly = (resolve: Resolve, reject: Reject): void => {
		iteratee()
			.then(() => {
				return test_func()
			})
			.then((result: any) => {
				if (result) {
					return resolve()
				}
				return process.nextTick(() => repeatAsyncly(resolve, reject))
			})
			.catch(reject)
	}
	return new Promise((resolve, reject) => {
		iteratee()
			.then(() => {
				return test_func()
			})
			.then((result: any) => {
				if (result) {
					// 第一次測試就滿足跳出的條件
					return resolve(null)
				}
				return repeatAsyncly(resolve, reject)
			})
			.catch(reject)
	})
}
// 不帶初始參數 timesSeries
export const repeat = (iteratee: AsyncFunc, times_n: number): Promise<any> => {
	assertFunction(iteratee, `[kaze][repeat]: the first argument should be a function which return a promise`)
	assertInteger(times_n, `[kaze][repeat]: the second argument should be an integer`)
	// const iteratee_func = ensureAsyncFunc(iteratee)
	const countable_func: AsyncFunc & { __times?: number } = wrapCountable(iteratee)
	const test_func = (): Promise<any> => {
		return new Promise((resolve) => {
			countable_func.__times = countable_func.__times || 0
			resolve(countable_func.__times < times_n) // 從0算起
		})
	}
	return whilst(countable_func, test_func)
}
// 不帶初始參數
export const forever = (iteratee: AsyncFunc): Promise<any> => {
	assertFunction(iteratee, `[kaze][forever]: the first argument should be a function which return a promise`)
	// const iteratee_func = ensureAsyncFunc(iteratee)
	const test_func = (): Promise<boolean> => Promise.resolve(true)
	return whilst(iteratee, test_func)
}

export const race = (arr: PromiseHood[]): Promise<any> => {
	assertPromiseHoodArray(arr, `[kaze][race]: the first argument should be an array of functions or promises`)
	return Promise.race(
		arr.map((item) => {
			const func = ensureAsyncFunc(item)
			return func()
		}),
	)
}

export const parallel = (arr: PromiseHood[]): Promise<any> => {
	assertPromiseHoodArray(arr, `[kaze][parallel]: the argument should be an array of functions or promises`)
	return Promise.all(
		arr.map((item) => {
			const func = ensureAsyncFunc(item)
			return func()
		}),
	)
}
// parallelLimit，既是同步，又是異步，不知返回什麼才好
export const parallelLimit = (arr: PromiseHood[], n: number): Promise<any> => {
	assertPromiseHoodArray(arr, `[kaze][parallelLimit]: the first argument should be an array of functions or promises`)
	assertInteger(n, `[kaze][parallelLimit]: the second argument should be an integer`)
	const runner = new Corunner(n)
	const func_arr = arr.map(item => ensureAsyncFunc(item))
	runner.push(func_arr)
	return runner.start()
}
// 內部函數，無需參數檢查，假定test_func永不出錯，邏輯因之更簡單
const whileas = (iteratee_func: AsyncFunc, test_func: Function): Promise<any> => {
	// assertFunction(iteratee_func, `[kaze][whileas]: the first argument should be a function`)
	// assertFunction(test_func, `[kaze][whileas]: the second argument should be a function`)
	// if (syncMode) {
	// 	test_func = wrapAssert(test_func as AssertFuncSync)
	// }
	const repeatAsyncly = (resolve: Resolve, reject: Reject): void => {
		Promise.resolve(test_func())
			.then((result: any) => {
				if (!result) {
					reject("數組為空、次數超限")
					return PROMISE_INTERRUPT
				}
				return iteratee_func()
			})
			.then((data: any) => {
				if (data !== PROMISE_INTERRUPT) {
					resolve(data)
				}
				return PROMISE_END
			})
			.catch(() => {
				process.nextTick(() => repeatAsyncly(resolve, reject))
			})
	}
	return new Promise((resolve, reject) => {
		Promise.resolve(test_func())
			.then((result: any) => {
				if (!result) {
					// 第一次測試就不通過
					reject(new Error("數組為空、次數超限"))
					return PROMISE_INTERRUPT
				}
				return iteratee_func()
			})
			.then((data: any) => {
				if (data !== PROMISE_INTERRUPT) {
					resolve(data)
				}
				return PROMISE_END
			})
			.catch(() => {
				// 兩種可能：iteratee_func中拋異常, 此處錯誤可以打印出來在開發模式，iteratee_func返回reject的
				repeatAsyncly(resolve, reject)
			})
	})
}
// https://github.com/tc39/proposal-promise-any
// 任務本身的異常將會忽略，算作失敗，然後嘗試下一個任務
export const any = (arr: PromiseHood[]): Promise<any> => {
	assertPromiseHoodArray(arr, `[kaze][any]: the argument should be an array of functions or promises`)
	const len = arr.length
	let i = 0
	const test_func = (): Promise<boolean> => Promise.resolve(i !== len)
	const iteratee_func: AsyncFunc = (): Promise<AsyncFunc> => {
		const single = ensureAsyncFunc(arr[i++])
		return single()
	}
	return whileas(iteratee_func, test_func)
}

// interval 可以改成函數形式，使其能動態判斷
// 目前的實現方式，是否存在內存洩露
export const retry = (iteratee: AsyncFunc, times_n: number, interval_n: number): Promise<any> => {
	assertFunction(iteratee, `[kaze][retry]: the first argument should be a function which return a promise`)
	// const iteratee_func = ensureAsyncFunc(iteratee)
	// let wrapped_func: AsyncFunc  = wrapCountable(iteratee_func)
	let i = 0
	let wrapedFunc: AsyncFunc = (): Promise<any> => {
		i++
		return iteratee()
	}
	if (interval_n) {
		wrapedFunc = wrapDelay(wrapedFunc, interval_n)
	}
	const test_func = (): Promise<boolean> => Promise.resolve(i !== times_n)
	return whileas(wrapedFunc, test_func)
}
