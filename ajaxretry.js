/*!
 * ajaxRetry
 * https://github.com/gdibble/ajaxretry
 * Copyright 2014 Gabriel Dibble; Licensed MIT
 */
// (function (define) { define(function (require, exports, module) { 'use strict';


var _$ajax   = $.ajax;
var _        = require('underscore');
//Defaults that can be overridden via set
var settings = {
  base:         2.718281828,
  y:            0.25,
  retryCount:   3
};

//-----------------------------------------------------------------------------


// Helpers:
//  some console.logs have been left (as to be enabled) for those curious minds


//Update current settings, overriding defaults
function setOptions(options) {
  _.defaults(options, settings);
  settings = options;
}

//returns delay in milliseconds
function exponentialDelay(x) {
  return (Math.pow(settings.base, x) - settings.y) * 1000;
}

//hit retry limit
function exhausted() {
  var args = Array.prototype.slice.call(arguments, 0);
  _.extend(args[0], this);
  // console.log('exhausted', this.url);
  if (this.hasOwnProperty('exhaust')) {
    // console.log('>>> called this.exhaust', this.exhaust);
    this.exhaust.apply(this, args);
  }
}

//recurse the ajax request
function ajaxRetry(jqXHR) {
  var self = this;
  if (this.hasOwnProperty('retries')) {
    this.recursed = this.recursed === undefined ? 0 : this.recursed + 1;
    if ((jqXHR && jqXHR.status < 500) || this.recursed >= this.retries) {
      exhausted.apply(self, arguments);
    } else if (this.recursed < this.retries) {
      setTimeout(function () {
        $.ajax(self);
        // console.log('recursed', self.url, self.recursed, 'in ' + exponentialDelay(self.recursed) + 'ms');
      }, exponentialDelay(this.recursed));
    }
  } else {
    exhausted.apply(self, arguments);
  }
}

function extender(args, options) {
}

function sliceArguments() {
  return 
}

//-----------------------------------------------------------------------------


//extend for retry functionality:
$.ajax = function (options) {
  var args = Array.prototype.slice.call(arguments, 0);
_.extend(args[0], options ? options : {}, {
  retries: settings.retryCount,
  error:   function () { ajaxRetry.apply(this, arguments); }
});
  return _$ajax.apply($, args);
};


module.exports = { set: setOptions };


// }); }(typeof define == 'function' && define.amd ? define : function (factory) { factory(require, exports, module); })); //end UDM CommonJS wrapper