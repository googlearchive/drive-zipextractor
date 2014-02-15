// Copyright 2014 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * Core methods associated with the driveapi package.
 */

var driveapi = {};

driveapi.IS_NATIVE_BIND_ =
    Function.prototype.bind && 
    Function.prototype.bind.toString().indexOf('native code') != -1;
    
driveapi.bindFn = function(fn, selfObj, var_args) {
  if (driveapi.IS_NATIVE_BIND_) {
    return fn.call.apply(fn.bind, arguments);
  } else {
    if (arguments.length > 2) {
      var boundArgs = Array.prototype.slice.call(arguments, 2);
      return function() {
        var newArgs = Array.prototype.slice.call(arguments);
        Array.prototype.unshift.apply(newArgs, boundArgs);
        return fn.apply(selfObj, newArgs);
      };
    } else {
      return function() {
        return fn.apply(selfObj, arguments);
      };
    }    
  }
};
