# QRANode

## A wrapper for ANUs Quantum RNG API.

See here for more info on the rng: https://quantumnumbers.anu.edu.au/
you should donate to them too, this is really cool :3

[NPM Link](https://npmjs.com/package/qranode)

## Installation

`npm i qranode`

## Usage:

```js
const qranode = require('qranode')

/// get the request function
const qrng = qranode('API_KEY_GOES_HERE', 'optional HTTP user agent string')

/// get random uint8 (default values)
const uint8Arr = await qrng() // -> { success: true, type: 'uint8', length: '1', data: [ 126 ] }

// .then.catch
qrng({ dataType: 'uint8', amount: 5 }) // get 5 numbers from 0 to 255
    .then(console.log) // log the output
    .catch(console.error) // or the errors, if any

// you can even get hex!
qrng({ dataType: 'hex16', amount: 5, blockSize: 2 }) // get 5 hex strings, each string consisting of 2 hex blocks between 0000 and ffff
```

The API returns a JSON object with the success status, the type requested, the length of the array, and the array of numbers. The example below is the result of a request for two hex16 numbers with a block size of 4.

```js
{
  success: true,
  type: 'hex16',
  length: '2',
  data: [ '2f2497d207a39d67', 'dd537fa2b1c4c6b2' ]
}
```
