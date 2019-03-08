export const assertArray = function(arr: any, msg: string): void {
	if (!Array.isArray(arr)) {
		throw new Error(msg)
	}
}

export const assertFunctionArray = function(arr: any, msg: string): void {
	assertArray(arr, msg)
	arr.forEach((func: Function) => {
		assertFunction(func, msg)
	})
}

export const assertPromiseHoodArray = function(arr: any, msg: string): void {
	assertArray(arr, msg)
	arr.forEach((func: any) => {
		assertPromiseHood(func, msg)
	})
}

export const assertFunction = function(func: any, msg: string): void {
	if (!(func instanceof Function)) {
		throw new Error(msg)
	}
}

export const assertInteger = function(number: any, msg: string): void {
	if (!Number.isInteger(number)) {
		throw new Error(msg)
	}
}

export const assertPromiseHood = function(hood: any, msg: string): void {
	if (!hood) {
		throw new Error(msg)
	}

	if (!hood.then) {
		if (!(hood instanceof Function)) {
			throw new Error(msg)
		}
	}
}
