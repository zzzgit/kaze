import Digester from "./Digester"
import AsyncFunc from "../type/AsyncFunc"

/**
 * machine
 */
class Corunner {
	private _runners_arr: Digester[] = []

	private _tasks_arr: AsyncFunc[] = []

	private _isShutdown: boolean = false

	private _hasStarted: boolean = false

	constructor(n: number) {
		if (n < 1) {
			n = 1
		}
		for (let i = 0; i < n; i++) {
			this._runners_arr.push(new Digester(this))
		}
	}

	push(tasks: AsyncFunc | AsyncFunc[]): void {
		if (this._hasStarted) {
			throw new Error("can't push tasks after started")
		}
		if (this._isShutdown) {
			// throw new Error("already shutdown")上面已經阻攔
		}
		if (!tasks) {
			return
		}
		if (!Array.isArray(tasks)) {
			tasks = [tasks]
		}
		tasks.forEach((item) => {
			this._tasks_arr.push(item)
		})
	}

	start(): Promise<any> {
		if (this._hasStarted) {
			throw new Error("already started")
		}
		this._hasStarted = true
		if (this._isShutdown) {
			// throw new Error("already shutdown")上面已經攔截了
		}
		return Promise.all(this._runners_arr.map(runner => runner.run())).then((result) => {
			this._shutdown()
			return result
		})
	}

	feed(): AsyncFunc | null | undefined {
		if (this._isShutdown) {
			return null
		}
		return this._tasks_arr.shift()
	}

	_shutdown(): void {
		this._isShutdown = true
		this._tasks_arr = []
		this._runners_arr.forEach((runner) => {
			runner.distroy()
		})
		this._runners_arr = []
	}
}

export default Corunner
