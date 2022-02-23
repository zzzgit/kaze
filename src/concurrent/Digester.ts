import Corunner from "./Corunner"
import Resolve from "../type/Resolve"
import Reject from "../type/Reject"

/**
 * The run methord will be triggered by other object, it call itself also.
 */
class Digester {
	private _feeder: Corunner | null | undefined = null

	private _isShutdown: boolean = false

	_resolve: Resolve = () => {}

	_reject: Reject = () => {}

	constructor(feeder: Corunner) {
		this._feeder = feeder
	}

	run(): Promise<any> {
		if (this._isShutdown) {
			// throw new Error("already shut down") 外層已經判斷過了
		}
		return new Promise((resolve, reject) => {
			this._resolve = resolve
			this._reject = reject
			this._repeat()
		})
	}

	_repeat(): void {
		const task = this._feeder?.feed()
		if (!task) {
			return this._resolve()
		}
		task()
			.then(() => {
				return process.nextTick(() => {
					this._repeat()
				})
			})
			.catch((e) => {
				this._reject(e)
			})
	}

	distroy(): void {
		this._feeder = null
		this._isShutdown = true
	}
}

export default Digester
