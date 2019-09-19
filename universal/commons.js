
/**
 * Helper function that checks if passed variable is an array. 
 * console.log(isArray()); // false
 * console.log(isArray(null)); // false
 * console.log(isArray(true)); // false
 * console.log(isArray(1)); // false
 * console.log(isArray('str')); // false
 * console.log(isArray({})); // false
 * console.log(isArray(new Date)); // false
 * console.log(isArray([])); // true
 * @param {*} a 
 */
export function isArray(a) {
    return (!!a) && (a.constructor === Array);
}

/**
 * Helper function that checks if passed variable is an object. 
 * console.log(isObject()); // false
 * console.log(isObject(null)); // false
 * console.log(isObject(true)); // false
 * console.log(isObject(1)); // false
 * console.log(isObject('str')); // false
 * console.log(isObject([])); // false
 * console.log(isObject(new Date)); // false
 * console.log(isObject({})); // true
 * @param {*} a 
 */
export function isObject(a) {
    return (!!a) && (a.constructor === Object);
}

export function isNullOrBlank(a) {
  return !(a !== undefined && a !== null && a !== '')
}

export function isNotNullOrBlank(a) {
  return (a !== undefined && a !== null && a !== '')
}

export function removeFromArray(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

export default { isArray, isObject }