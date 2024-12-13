'use strict'

const BASE_URL = 'https://api.quantumnumbers.anu.edu.au'
const LIMIT = 1024
const BLOCK_LIMIT = 10
const VALID_TYPES = [
    'uint8',
    'uint16',
    'hex8',
    'hex16'
]
const {
    prettifiedName,
    name,
    version
} = require('./package.json')
function warning(msg) {
    console.warn(`[${prettifiedName}:Warning] | ${msg}`)
}
/**
 * Get some random numbers from https://quantumnumbers.anu.edu.au.
 * @async
 * @param {String} apiKey Your API key. An error will be thrown if not provided.
 * @param {String} userAgent A custom user agent. If undefined, defaults to using the package name and version.
 */
function setup(apiKey, userAgent) {
    if (!apiKey) {
        throw new Error(`The 'apiKey' argument is required.`)
    }

    /**
     * @param {String} [args.dataType] Must be either `uint8`, `uint16`, or `hex16`. Defaults to `uint8`.
     * @param {Object} args
     * - `uint8` - returns numbers between 0 and 255.
     * - `uint16` - returns numbers between 0 and 65535.
     * - `hex8` - returns hexadecimal chunks between `00` and `ff`.
     * - `hex16` - returns hexadecimal chunks between `0000` and `ffff`.
     * For the hexadecimal types, each block is made up of `args.blockSize` chunks.
     *
     * @param {Number} [args.amount] The amount of numbers to get. Max array size is `1024`. Defaults to `1`.
     * @param {Number} [args.blockSize] The length of each hex block. Max block size is `10`. Defaults to `1`.
     * Only used with the hex types.
     * @returns {Promise<Object>} A JSON object with the success status, the type requested, the length of the array, and the array of numbers.
     * @example
     * // The example below is the result of a request for two hex16 numbers with a block size of 4.
     {
     success: true,
     type: 'hex16',
     length: '2',
     data: [ '2f2497d207a39d67', 'dd537fa2b1c4c6b2' ]
     }
    */
    function wrapper(args) {
        return getRandomNumbers({
            ...args,
            apiKey,
            userAgent
        })
    }
    return wrapper
}

async function getRandomNumbers({
    dataType = 'uint8', amount = 1, blockSize = 1,
    apiKey, userAgent
}) {
    // prepare param object
    let reqParams = {}
    // set the headers
    let HEADERS = {}
    HEADERS['x-api-key'] = apiKey
    HEADERS['x-user-agent'] = userAgent || `${name}-v${version}`


    // if theres no API key, don't bother doing anything else
    if (!apiKey) {
        throw new Error(`The 'apiKey' argument is required.`)
    }

    if (!dataType || typeof dataType !== 'string') {
        throw new Error(`The 'dataType' argument must be one of these: ${VALID_TYPES.join(', ')}`)
    }
    // shift dataType to lowercase
    dataType = dataType.toLowerCase()

    // do some quick validation, requesting negative numbers from
    // a quantum void would probably end the world
    if (!VALID_TYPES.includes(dataType)) {
        throw new Error(`The 'dataType' argument must be one of these: ${VALID_TYPES.join(', ')}`)
    }
    if (!amount || typeof amount !== 'number' || isNaN(amount)) {
        throw new Error(`The 'amount' argument needs to be a positive integer.`)
    }
    if (amount < 1 || amount > LIMIT) {
        throw new Error(`The 'amount' argument is outside the range 1-${LIMIT}, inclusive.`)
    }

    // if the user wants hexadecimal, make sure the blockSize is within bounds
    if (dataType.startsWith('hex')) {
        if (!blockSize || isNaN(blockSize)) {
            throw new Error(`The 'blockSize' argument needs to be a positive integer.`)
        }
        if (blockSize < 1 || blockSize > BLOCK_LIMIT) {
            throw new Error(`The 'blockSize' argument is outside the range 1-${BLOCK_LIMIT}, inclusive.`)
        }
        reqParams['size'] = blockSize
    }

    // params validated, add to object
    reqParams['type'] = dataType
    reqParams['length'] = amount

    // Time to get the data!
    try {
        const req = await fetch(`${BASE_URL}?${new URLSearchParams(reqParams)}`, {
            headers: HEADERS
        })

        const response = await req.json()
        if (response.success) {
            return response
        } else {
            throw new Error(`failed response from server: ${JSON.stringify(response)}`)
        }
    } catch (e) {
        throw e
    }
}

module.exports = setup
/**
* @deprecated
* @param  {...any} args same as main func
*/
module.exports.getRandomNumbers = (...args) => {
    console.log('getRandomNumbers is deprecated')
    return getRandomNumbers(...args)
}
