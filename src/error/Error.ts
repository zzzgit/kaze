import {CustomError} from "ts-custom-error"

/**
 * Not in use
 */
class HttpError extends CustomError {
	constructor(code: number, message?: string) {
		console.log("the code:", code)
		super(message)
	}
}
export default HttpError
