/**
 * Core methods associated with the driveapi package.
 */

driveapi = {};

driveapi.bindFn = function(fn, selfObj, var_args) {
   return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};
