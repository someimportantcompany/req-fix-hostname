/**
 * @param {*} value
 * @param {Error} err
 */
function assert(value, err) {
  /* istanbul ignore if  */
  if (!value) {
    throw err;
  }
}

/**
 * @param {string[]} headers
 * @returns {import('express').RequestHandler}
 * @throws {TypeError}
 */
module.exports = function reqFixHostname(headers) {
  assert(Array.isArray(headers), new TypeError('Expected argument to be an array'));

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} _res
   * @param {import('express').NextFunction} next
   */
  return function (req, _res, next) {
    // Find the first header that exists on the request with a non-falsey value
    const matched = headers.find((header) => req.get(header));

    if (matched) {
      // Doesn't change the type of the property
      // But does set it to the value of the matched header
      Object.defineProperty(req, 'hostname', {
        enumerable: true,
        value: req.get(matched).toString(),
      });
    }

    /* istanbul ignore else  */
    if (typeof next === 'function') {
      next();
    }
  };
}
