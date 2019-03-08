import AsyncFunc from "./type/AsyncFunc"
import {noop} from "./entity"
import AssertFuncSync from "./type/AssertFuncSync"
import PromiseHood from "./type/PromiseHood"
import Countable from "./interface/Countable"

const schedule = (period_n: number, value?: any): Promise<any> => {
	return new Promise((resolve) => {
		setTimeout(() => resolve(value), period_n)
	})
}

// 調用就計數，不用等待
export const wrapCountable = (func: AsyncFunc): AsyncFunc & Countable => {
	const result = Object.assign(
		() => {
			result.__times++
			return func()
		},
		{__times: 0}
	)
	return result
}

export const wrapCountableSync = (func: Function): Function => {
	const result = Object.assign(
		() => {
			result.__times++
			return func()
		},
		{__times: 0}
	)
	return result
}
// 兩種API風格
export const wrapAssert = (syncTest: AssertFuncSync): AsyncFunc => {
	return () => {
		return new Promise((resolve, reject) => {
			try {
				resolve(syncTest())
			} catch (e) {
				reject(e)
			}
		})
	}
}

export const wrapSync = (sync_func: Function): AsyncFunc => {
	return () => {
		return new Promise((resolve, reject) => {
			try {
				resolve(sync_func())
			} catch (e) {
				reject(e)
			}
		})
	}
}

export const wrapDelay = (orignFunc: AsyncFunc, delay_n: number): AsyncFunc => {
	return () => {
		return schedule(delay_n).then(() => orignFunc())
	}
}

export const wrapHalt = (orignFunc: AsyncFunc, halt_n: number): AsyncFunc => {
	return () => {
		return orignFunc().then(data => schedule(halt_n, data))
	}
}

export const wrapTimeout = (orignFunc: AsyncFunc, timeout_n: number): AsyncFunc => {
	return () => {
		return Promise.race([orignFunc(), schedule(timeout_n).then(() => Promise.reject(new Error("timeout")))])
	}
}

export const wrapTimehalt = (orignFunc: AsyncFunc, halt_n: number): AsyncFunc => {
	return () => {
		return Promise.all([orignFunc(), schedule(halt_n)])
	}
}

export const wrapGuarantee = (orignFunc: AsyncFunc): AsyncFunc => {
	return () => {
		return orignFunc().catch(noop)
	}
}

export const ensureAsyncFunc = (prom: PromiseHood): AsyncFunc => {
	if (typeof prom === "function") {
		return prom
	}
	return () => prom
}
