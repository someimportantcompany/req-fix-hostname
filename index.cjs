/**
 * @property {object} exported Collection of middlewares to rewrite `req.hostname`
 * @property {import('./express')} exported.express Middleware for Express
 */
module.exports = {
  express: require('./express.cjs'),
};
