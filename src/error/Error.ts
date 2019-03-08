import {CustomError} from "ts-custom-error"

class HttpError extends CustomError {
	public constructor(code: number, message?: string) {
		console.log(2, code)
		super(message)
	}
}
export default HttpError
