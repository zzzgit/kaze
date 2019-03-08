import * as flow from "../src"
import AsyncFunc from "../src/type/AsyncFunc"

const samael = require("samael")

const constants = {
	ERR_THROWN_IN_THROW_TASK: "ERR_THROWN_IN_THROW_TASK",
	ERR_THROWN_IN_REJECT_TASK: "ERR_THROWN_IN_REJECT_TASK",
}
const schedule = (period_n: number, value?: any): Promise<any> => {
	return new Promise((resolve) => {
		setTimeout(() => resolve(value), period_n)
	})
}

const addone_task: AsyncFunc = (i: any): Promise<any> => {
	return Promise.resolve(i + 1)
}
const throw_task: AsyncFunc = (): Promise<any> => {
	throw new Error(constants.ERR_THROWN_IN_THROW_TASK)
}
const invalidAyncFunc = (): number => 3333

describe("compose", () => {
	test("normal use", () => {
		return expect(flow.compose([addone_task, addone_task])(1)).resolves.toBe(3)
	})
	test("with empty task array", () => {
		return expect(flow.compose([])(3)).resolves.toBe(3)
	})
})
describe("waterfall", () => {
	test("normal use", () => {
		return expect(flow.waterfall([addone_task, addone_task], 1)).resolves.toBe(3)
	})
	test("with empty task array", () => {
		return expect(flow.waterfall([], 1)).resolves.toBe(1)
	})
})
describe("whilst", () => {
	test("normal use", () => {
		let i = 0
		const add = (): Promise<number> => {
			i++
			return Promise.resolve(i)
		}
		const judge = (): Promise<boolean> => {
			return Promise.resolve(i < 3)
		}
		return expect(flow.whilst(add, judge).then(() => i == 3)).resolves.toBe(true)
	})
	test("normal use, sync case", () => {
		let i = 0
		const add = (): Promise<number> => {
			return Promise.resolve(i++)
		}
		const judge = (): boolean => {
			return i < 3
		}
		return expect(flow.whilst(add, judge).then(() => i == 3)).resolves.toBe(true)
	})
})
describe("until", () => {
	test("normal use", () => {
		let i = 0
		const add = (): Promise<number> => {
			return Promise.resolve(i++)
		}
		const judge = (): Promise<boolean> => {
			return Promise.resolve(i === 3)
		}
		return expect(flow.until(add, judge).then(() => i == 3)).resolves.toBe(true)
	})
	test("normal use, sync case", () => {
		let i = 0
		const add = (): Promise<number> => {
			return Promise.resolve(i++)
		}
		const judge = (): boolean => {
			return i === 3
		}
		return expect(flow.until(add, judge).then(() => i == 3)).resolves.toBe(true)
	})
	test("stop at the very first judgment", () => {
		let i = 0
		const add = (): Promise<number> => {
			return Promise.resolve(i++)
		}
		const judge = (): boolean => true
		return expect(flow.until(add, judge).then(() => i == 1)).resolves.toBe(true)
	})
})
describe("repeat", () => {
	test("normal use", () => {
		let i = 0
		const add = (): Promise<number> => {
			return Promise.resolve(i++)
		}
		return expect(flow.repeat(add, 3).then(() => i == 3)).resolves.toBe(true)
	})
	test("normal use, noop", () => {
		let i = 0
		const add = (): Promise<number> => {
			return Promise.resolve(i++)
		}
		return expect(flow.repeat(add, -1).then(() => i == 0)).resolves.toBe(true)
	})
})
describe("forever", () => {
	test.skip("normal use", () => {
		let i = 0
		const add = (): any => {
			i++
			return Promise.resolve(i)
		}
		return expect(flow.forever(add).then(() => i == 3)).resolves.toBe(true)
	})
})
describe("race", () => {
	test("normal use", () => {
		const arr = [0, 1, 2, 3]
		const pearPick = (): any => {
			return schedule(samael.random(2) * 100).then(() => arr.shift())
		}
		return expect(flow.race([pearPick, pearPick])).resolves.toBe(0)
	})
	test("not a async func", () => {
		return expect(flow.race([invalidAyncFunc as any])).resolves.toBe(3333)
	})
})
describe("parallel", () => {
	test("normal use", () => {
		const arr = [0, 1, 2, 3]
		const pearPick = (): any => {
			return schedule(samael.random(2) * 100).then(() => arr.shift())
		}
		return expect(flow.parallel([pearPick, pearPick])).resolves.toContain(1)
	})
	test("with empty as the argument", () => {
		return expect(flow.parallel([] as any)).resolves.toHaveLength(0)
	})
	test("not a async func", () => {
		return expect(flow.parallel([invalidAyncFunc as any])).resolves.toHaveLength(1)
	})
})
describe("parallelLimit", () => {
	test("normal use", () => {
		const arr = [0, 1, 2, 3, 4]
		const pearPick = (): any => {
			return schedule(samael.random(4) * 100).then(() => arr.shift())
		}
		return expect(flow.parallelLimit([pearPick, pearPick], 2)).resolves.toContain(undefined)
	})
	test("with empty as the argument", () => {
		return expect(flow.parallelLimit([] as any, 3)).resolves.toContain(undefined)
	})
})
describe("any", () => {
	test("normal use", () => {
		const pearPick = (): any => {
			return schedule(samael.random(3) * 100).then(() => {
				const tenth = Math.floor(new Date().getMilliseconds() / 100)
				if (tenth <= 6) {
					return tenth
				}
				throw new Error("tenth > 6")
			})
		}
		const array = [pearPick, pearPick, pearPick, pearPick, pearPick, pearPick, pearPick, pearPick, pearPick, pearPick, pearPick, pearPick]
		return expect(flow.any(array)).resolves.toBeLessThan(7)
	})
	test("throw an error", () => {
		return expect(flow.any([throw_task, () => Promise.resolve(222)])).resolves.toBe(222)
	})
	test("not a async func", () => {
		return expect(flow.any([invalidAyncFunc as any, invalidAyncFunc as any])).resolves.toBe(3333)
	})
})
describe("retry", () => {
	test("normal use", () => {
		let i = 0
		const task = (): Promise<number> => {
			i++
			if (i < 3) {
				return Promise.reject(i)
			}
			return Promise.resolve(i)
		}
		return expect(flow.retry(task, 5, 3)).resolves.toBe(3)
	})
})
// describe('retry3333', () => {
// 	test('normal use', () => {
// 		const mockCallback = jest.fn(x => 33 + x)
// 		mockCallback(2)
// 		mockCallback(3)
// 		mockCallback(4)
// 		expect(mockCallback.mock.calls).toHaveLength(3)
// 		expect(mockCallback.mock.calls[0][0]).toBe(2)
// 		expect(mockCallback.mock.calls[1][0]).toBe(3)
// 		expect(mockCallback.mock.results[0].value).toBe(35)
// 	})
// })
