/**
 *  File: jquery.idle.js
 *  Title:  JQuery Idle.
 *  A dead simple jQuery plugin that executes a callback function if the user is idle.
 *  About: Author
 *  Henrique Boaventura (hboaventura@gmail.com).
 *  About: Version
 *  1.2.7
 *  About: License
 *  Copyright (C) 2013, Henrique Boaventura (hboaventura@gmail.com).
 *  MIT License:
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *  - The above copyright notice and this permission notice shall be included in all
 *    copies or substantial portions of the Software.
 *  - THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *    SOFTWARE.
 **/
/*jslint browser: true */
/*global jQuery: false */
(function ($) {
  'use strict';

  $.fn.idle = function (options) {
    let defaults = {
        idle: 60000, //idle time in ms
          preIdle: 30000,
        events: 'mousemove keydown mousedown touchstart', //events that will trigger the idle resetter
        onIdle: function () {}, //callback function to be executed after idle time
          onPreIdle: function () {
          }, //callback function to be executed on specific preidle time
        onActive: function () {}, //callback function to be executed after back from idleness
        onHide: function () {}, //callback function to be executed when window is hidden
        onShow: function () {}, //callback function to be executed when window is visible
        keepTracking: true, //set it to false if you want to track only the first time
        startAtIdle: false,
        recurIdleCall: false
      },
      idle = options.startAtIdle || false,
        preIdle = false,
      visible = !options.startAtIdle || true,
      settings = $.extend({}, defaults, options),
      lastId = null,
        lastPreId = null,
      resetTimeout,
        timeout,
        preIdleTimer;

    //event to clear all idle events
    $(this).on( "idle:stop", {}, function( event) {
      $(this).off(settings.events);
      settings.keepTracking = false;
      resetTimeout(lastId, lastPreId, settings);
    });

    resetTimeout = function (id, preId, settings) {
      if (idle || preId) {
        idle = preIdle = false;
        settings.onActive.call();
      }
      clearTimeout(id);
      clearTimeout(preId);
      if(settings.keepTracking) {
        lastPreId = preIdleTimer(settings);
        return timeout(settings);
      }
    };

    timeout = function (settings) {
      let timer = (settings.recurIdleCall ? setInterval : setTimeout), id;
      id = timer(function () {
        idle = true;
        settings.onIdle.call(this, settings.idle);
      }, settings.idle);
      return id;
    };

    preIdleTimer = function (settings) {
      let timer = (settings.recurIdleCall ? setInterval : setTimeout), id;
      id = timer(function () {
        preIdle = true;
        settings.onPreIdle.call(this, settings.preIdle, settings.idle);
        // clearTimeout(id);
      }, settings.preIdle);
      return id;
    };

    return this.each(function () {
      lastId = timeout(settings);
      lastPreId = preIdleTimer(settings);
      $(this).on(settings.events, function (e) {
        lastId = resetTimeout(lastId, lastPreId, settings);
      });
      if (settings.onShow || settings.onHide) {
        $(document).on("visibilitychange webkitvisibilitychange mozvisibilitychange msvisibilitychange", function () {
          if (document.hidden || document.webkitHidden || document.mozHidden || document.msHidden) {
            if (visible) {
              visible = false;
              settings.onHide.call();
            }
          } else {
            if (!visible) {
              visible = true;
              settings.onShow.call();
            }
          }
        });
      }
    });
  };
}(jQuery));
