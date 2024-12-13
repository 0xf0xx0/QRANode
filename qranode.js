'use strict'

const Axios = require('axios')
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
 * @param {Object} args
 * @param {String} args.apiKey Your API key. An error will be thrown if not provided.
 * @param {String} args.userAgent A custom user agent. If undefined, defaults to using the package name and version.
 * @param {String} [args.dataType] Must be either `uint8`, `uint16`, or `hex16`. Defaults to `uint8`.
 *
 * - `uint8` - returns numbers between 0 and 255.
 * - `uint16` - returns numbers between 0 and 65535.
 * - `hex8` - returns hexadecimal chunks between `00` and `ff`.
 * - `hex16` - returns hexadecimal chunks between `0000` and `ffff`.
 * For the hexadecimal types, each block is made up of `args.blockSize` chunks.
 *
 * @param {Number} [args.amount] The amount of numbers to get. Max array size is `1024`. Defaults to `1`.
 * @param {Number} [args.blockSize] The length of each hex block. Max block size is `10`. Defaults to `1`.
 * Only used with the hex types.
 * @returns {Object} A JSON object with the success status, the type requested, the length of the array, and the array of numbers.
 * @example
 * // The example below is the result of a request for two hex16 numbers with a block size of 4.
    {
    success: true,
    type: 'hex16',
    length: '2',
    data: [ '2f2497d207a39d67', 'dd537fa2b1c4c6b2' ]
    }
 */
/// todo: generator func
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
    if (amount < 1) {
        warning(`The 'amount' argument can't be less than one. Resetting amount to one.`)
        amount = 1
    }
    if (amount > LIMIT) {
        warning(`The 'amount' argument is larger than the limit of ${LIMIT}. Resetting to ${LIMIT}.`)
        amount = LIMIT
    }

    // if the user wants hexadecimal, make sure the blockSize is within bounds
    if (dataType === 'hex16' || dataType === 'hex8') {
        if (!blockSize || typeof blockSize !== 'number' || isNaN(blockSize)) {
            throw new Error(`The 'blockSize' argument needs to be a positive integer.`)
        }
        /// todo: these should be errors
        if (blockSize < 1) {
            warning(`The 'blockSize' argument can't be less than one. Resetting blockSize to one.`)
            blockSize = 1
        }
        if (blockSize > BLOCK_LIMIT) {
            warning(`The 'blockSize' argument is larger than the limit of ${BLOCK_LIMIT}. Resetting to ${BLOCK_LIMIT}.`)
            blockSize = BLOCK_LIMIT
        }
        reqParams['size'] = blockSize
    }

    // params validated, add to object
    reqParams['type'] = dataType
    reqParams['length'] = amount

    // Time to get the data!
    try {
        const response = (await Axios.get(`${BASE_URL}?${new URLSearchParams(reqParams)}`, {
            headers: HEADERS
        })).data
        return response
    } catch (e) {
        throw e
    }
}

module.exports = getRandomNumbers
