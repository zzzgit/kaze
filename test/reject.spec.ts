/* eslint-disable prefer-promise-reject-errors */
import * as flow from "../src"
import AsyncFunc from "../src/type/AsyncFunc"
import {noop} from "../src/entity"

const constants = {
	ERR_THROWN_IN_THROW_TASK: "ERR_THROWN_IN_THROW_TASK",
	ERR_THROWN_IN_REJECT_TASK: "ERR_THROWN_IN_REJECT_TASK",
}

const addone_task: AsyncFunc = (i): any => {
	return Promise.resolve(i + 1)
}
const reject_task: AsyncFunc = (): any => {
	return Promise.reject(constants.ERR_THROWN_IN_REJECT_TASK)
}
const throw_task: AsyncFunc = (): any => {
	throw new Error(constants.ERR_THROWN_IN_THROW_TASK)
}

describe("compose", () => {
	test("with reject function as argument(1)", () => {
		return expect(flow.compose([addone_task, reject_task] as any)(3)).rejects.toBe(constants.ERR_THROWN_IN_REJECT_TASK)
	})
	test("with reject function as argument(2)", () => {
		return expect(flow.compose([reject_task, addone_task] as any)(3)).rejects.toBe(constants.ERR_THROWN_IN_REJECT_TASK)
	})
})
describe("waterfall", () => {
	test("with reject function as argument(1)", () => {
		return expect(flow.waterfall([addone_task, reject_task] as any, 3)).rejects.toBe(constants.ERR_THROWN_IN_REJECT_TASK)
	})
	test("with reject function as argument(2)", () => {
		return expect(flow.waterfall([reject_task, addone_task] as any, 3)).rejects.toBe(constants.ERR_THROWN_IN_REJECT_TASK)
	})
})
describe("whilst", () => {
	test("reject from iteratee", () => {
		const judge = (): any => Promise.reject(true)
		return expect(flow.whilst(noop as any, judge)).rejects.toBe(true)
	})
})
describe("until", () => {
	test("reject from iteratee", () => {
		const task = (): any => Promise.resolve(222)
		const judge = (): any => Promise.reject(true)
		return expect(flow.until(task as any, judge)).rejects.toBe(true)
	})
})
describe("repeat", () => {})
describe("forever", () => {
	test("reject", () => {
		const toReject = (): any => Promise.reject(false)
		return expect(flow.forever(toReject as any)).rejects.toBe(false)
	})
})
describe("race", () => {
	test("already reject", () => {
		const toReject = (): any => Promise.reject(2222)
		return expect(flow.race([toReject as any, () => Promise.resolve(3333)])).rejects.toBe(2222)
	})
})
describe("parallel", () => {
	test("already reject", () => {
		const toReject = (): any => Promise.reject(2222)
		return expect(flow.parallel([toReject as any, () => Promise.resolve(3333)])).rejects.toBe(2222)
	})
})
describe("parallelLimit", () => {
	test("already reject", () => {
		const toReject = (): any => Promise.reject(2222)
		return expect(flow.parallelLimit([toReject as any, () => Promise.resolve(3333)], 3)).rejects.toBe(2222)
	})
})
describe("any", () => {
	test("with empty as the argument", () => {
		return expect(flow.any([] as any)).rejects.toThrow("數組為空、次數超限")
	})
})
describe("retry", () => {
	test("with throw function as argument", () => {
		return expect(flow.retry(throw_task, 3, 3)).rejects.toBe("數組為空、次數超限")
	})
})
