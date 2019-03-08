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
// const reject_task: AsyncFunc = (): Promise<any> => {
// 	return Promise.reject(constants.ERR_THROWN_IN_REJECT_TASK)
// }
const throw_task: AsyncFunc = (): Promise<any> => {
	throw new Error(constants.ERR_THROWN_IN_THROW_TASK)
}

describe("compose", () => {
	test("with null as argument", () => {
		const dirty = (): any => {
			return flow.compose(null as any)(3)
		}
		return expect(dirty).toThrow("the argument should be an array of functions")
	})
	test("with number array as argument", () => {
		const dirty = (): any => {
			return flow.compose([3, 4] as any)(3)
		}
		return expect(dirty).toThrow("the argument should be an array of functions")
	})
})
describe("waterfall", () => {
	test("with null as argument", () => {
		const dirty = (): any => {
			return flow.waterfall(null as any, 1)
		}
		return expect(dirty).toThrow("the first argument should be an array of functions")
	})
	test("with number array as argument", () => {
		const dirty = (): any => {
			return flow.waterfall([3, 4] as any, 3)
		}
		return expect(dirty).toThrow("the first argument should be an array of functions")
	})
})
describe("whilst", () => {
	test("with null as first argument", () => {
		const dirty = (): any => {
			return flow.whilst(null as any, noop)
		}
		return expect(dirty).toThrow("first argument should be a function which return a")
	})
	test("with null as second argument", () => {
		const task = (): any => Promise.resolve()
		const dirty = (): any => {
			return flow.whilst(task, null as any)
		}
		return expect(dirty).toThrow("the second argument should be a function")
	})
})
describe("until", () => {
	test("with null as first argument", () => {
		const dirty = (): any => {
			return flow.until(null as any, noop)
		}
		return expect(dirty).toThrow("first argument should be a function which return a")
	})
	test("with null as second argument", () => {
		const ayncf = (): any => Promise.resolve()
		const dirty = (): any => {
			return flow.until(ayncf, null as any)
		}
		return expect(dirty).toThrow("the second argument should be a function")
	})
})
describe("repeat", () => {
	test("not an integer as the second argument", () => {
		const add = (): any => Promise.resolve(22)
		const dirty = (): any => {
			return flow.repeat(add, "sss" as any)
		}
		return expect(dirty).toThrow("the second argument should be")
	})
})
describe("forever", () => {
	test("with null as the argument", () => {
		const dirty = (): any => {
			return flow.forever(null as any)
		}
		return expect(dirty).toThrow("should be a function which return a promise")
	})
})
describe("race", () => {
	test("with null as the argument", () => {
		const dirty = (): any => {
			return flow.race(null as any)
		}
		return expect(dirty).toThrow("should be an array of function")
	})
	// 可以用超時法來測試這個用例
	// return expect(flow.race([] as any)).resolves.toBe("22")
	test.todo("with empty as the argument, forever pending")
	test("throw an error", () => {
		const dirty = (): any => {
			flow.race([throw_task])
		}
		return expect(dirty).toThrow(constants.ERR_THROWN_IN_THROW_TASK)
	})
})
describe("parallel", () => {
	test("with null as the argument", () => {
		const dirty = (): any => {
			return flow.parallel(null as any)
		}
		return expect(dirty).toThrow("should be an array of function")
	})
	test("throw an error", () => {
		const dirty = (): any => {
			flow.parallel([throw_task])
		}
		return expect(dirty).toThrow(constants.ERR_THROWN_IN_THROW_TASK)
	})
})
describe("parallelLimit", () => {
	test("with null as the argument", () => {
		const dirty = (): any => {
			return flow.parallelLimit(null as any, 3)
		}
		return expect(dirty).toThrow("should be an array of function")
	})
	test("with string as the second argument", () => {
		const dirty = (): any => {
			return flow.parallelLimit([addone_task], "ssss" as any)
		}
		return expect(dirty).toThrow("should be an integer")
	})
})
describe("any", () => {
	test("with null as the argument", () => {
		const dirty = (): any => {
			return flow.any(null as any)
		}
		return expect(dirty).toThrow("should be an array of function")
	})
})
describe("retry", () => {
	test("with null as task", () => {
		const dirty = (): any => {
			return flow.retry(null as any, 3, 3)
		}
		return expect(dirty).toThrow("first argument should be a function which return a promise")
	})
})
