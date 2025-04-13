/**
 * @file: vanilla.idle.js
 * @title: Vanilla Idle.
 * @description: A simple VanillaJS port of this jQuery plugin.
 * @author @hugohil
 * @version 1.2.7
 * @license https://opensource.org/licenses/MIT
 */

(function (){
  'use strict';

  window.idle = function (options){
    let defaults = {
      idle: 60000, // idle time in ms
      preIdle: 30000,
      events: ['mousemove', 'keydown', 'mousedown', 'touchstart'], // events that will trigger the idle resetter
      onIdle: function (){}, // callback function to be executed after idle time
      onPreIdle: function () {
      }, //callback function to be executed on specific preidle time
      onActive: function (){}, // callback function to be executed after back form idleness
      onHide: function (){}, // callback function to be executed when window become hidden
      onShow: function (){}, // callback function to be executed when window become visible
      keepTracking: true, // set it to false of you want to track only once
      startAtIdle: false, // set it to true if you want to start in the idle state
      recurIdleCall: false
    };
    let settings = extend({}, defaults, options);
    let idle = settings.startAtIdle;
    let preIdle = false;
    let visible = !settings.startAtIdle;
    let visibilityEvents = ['visibilitychange', 'webkitvisibilitychange', 'mozvisibilitychange', 'msvisibilitychange'];
    let lastId = null;
    let resetTimeout, timeout, preIdleTimer;
    let lastPreId = null;

    // event to clear all idle events
    window.addEventListener('idle:stop', function (event){
      bulkRemoveEventListener(window, settings.events);
      settings.keepTracking = false;
      resetTimeout(lastId, lastPreId, settings);
    });

    resetTimeout = function resetTimeout(id, preId, settings) {
      if (idle || preId) {
        idle = preIdle = false;
        settings.onActive.call();
      }
      clearTimeout(id);
      clearTimeout(preId);
      if(settings.keepTracking){
        lastPreId = preIdleTimer(settings);
        return timeout(settings);
      }
    };

    timeout = function timeout(settings) {
      let timer = (settings.recurIdleCall) ? setInterval : setTimeout;
      let id;
      id = timer(function (){
        idle = true;
        settings.onIdle.call();
      }, settings.idle);
      return id;
    };

    preIdleTimer = function pretimeout(settings) {
      let timer = (settings.recurIdleCall) ? setInterval : setTimeout;
      let id;
      id = timer(function () {
        preIdle = true;
        settings.onPreIdle.call(this, settings.preIdle, settings.idle);
      }, settings.idle);
      return id;
    };

    return {
      start: function (){
        lastId = timeout(settings);
        lastPreId = preIdleTimer(settings);
        bulkAddEventListener(window, settings.events, function (event){
          lastId = resetTimeout(lastId, lastPreId, settings);
        });
        if(settings.onShow || settings.onHide){
          bulkAddEventListener(document, visibilityEvents, function (event){
            if (document.hidden || document.webkitHidden || document.mozHidden || document.msHidden) {
              if (visible){
                visible = false;
                settings.onHide.call();
              }
            } else {
              if (!visible){
                visible = true;
                settings.onShow.call();
              }
            }
          });
        }
      }
    }
  };

  let bulkAddEventListener = function bulkAddEventListener(object, events, callback) {
    events.forEach(function (event){
      object.addEventListener(event, function (event){
        callback(event);
      });
    });
  };

  let bulkRemoveEventListener = function bulkRemoveEventListener(object, events) {
    events.forEach(function (event){
      object.removeEventListener(event);
    });
  };

  // Thanks to http://youmightnotneedjquery.com/
  let extend = function extend(out) {
    out = out || {};
    for (let i = 1; i < arguments.length; i++) {
      if (!arguments[i]){
        continue;
      }
      for (let key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)){
          out[key] = arguments[i][key];
        }
      }
    }
    return out;
  };
})();