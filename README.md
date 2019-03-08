[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# kaze

asynchronous flow control lib implemented in a promise way

# install

npm i kaze

# terminology

## AsyncFunc

A function which return a promise.

## assertFunc

A specilal AsyncFunc of which the promise will be resolved with a `boolean` value.

# badges

# API

## waterfall

This function takes an array of `AsyncFunc`s and excute them in series. Each function pass their results to the next in the array. If any of the functions is rejected, the following functions won't be executed, and the main promise will be immediately rejected as well.

### example:

```javascript
const counter = accumulator => Promise.resolve(accumulator + 1)
let promise = waterfall([counter, counter], 1)
promise.then(data => console.log(data)) // 3
```

## compose

This is similar to `waterfall`, but it create a function which is a composition of the passed `AsyncFunc`s. Composing functions f(), g(), and h() would produce the result of f(g(h())). Each function consumes the return value of the function that follows.

### example:

```javascript
const counter = accumulator => Promise.resolve(accumulator + 1)
let newFunc = compose([counter, counter])
console.log(newFunc(1)) // 3
```

## whilst

It excute iteratee repeately, while test returns true. The return promise will be resolved right after the loop end.

### example:

```javascript
const test = () => Promise.resolve()
const counter = accumulator => Promise.resolve(accumulator + 1)
let newFunc = compose([counter, counter])
console.log(newFunc(1)) // 3
```
