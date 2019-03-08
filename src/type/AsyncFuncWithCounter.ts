// not in use
type AsyncFuncWithCounter = (...args: any[]) => Promise<any> & {__times: number}

export default AsyncFuncWithCounter
