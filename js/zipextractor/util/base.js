zipextractor.util = {};

zipextractor.util.bindFn = function(fn, selfObj, var_args) {
   return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};
