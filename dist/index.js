'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

require('@babel/polyfill');

var Telnet = require('telnet-client');

var MainZoneAccessory, SecondZoneAccessory;

module.exports = function (homebridge) {
  MainZoneAccessory = require('./accessories/MainZoneAccessory')(homebridge);
  SecondZoneAccessory = require('./accessories/SecondZoneAccessory')(homebridge);
  homebridge.registerPlatform("homebridge-denon", "DenonMarantzAVR", DenonAvrPlatform, false);
};

var DenonAvrPlatform =
/*#__PURE__*/
function () {
  function DenonAvrPlatform(log, config, api) {
    var _this = this;

    _classCallCheck(this, DenonAvrPlatform);

    _defineProperty(this, "connect",
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var params;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              params = {
                host: '192.168.178.85',
                port: 23,
                echoLines: 0,
                irs: '\r',
                negotiationMandatory: false,
                ors: '\r\n',
                separator: false,
                shellPrompt: '',
                timeout: 800
              };
              _context.next = 3;
              return _this.denon.connect(params);

            case 3:
              _this.connected = true;

              _this.log(`connected to AVR (${_this.host})`);

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    })));

    this.log = log;
    this.config = config;
    this.host = config.host;
    this.queue = [];
    this.connected = false;
    this.denon = new Telnet();
    this.denon.on('connect', function () {
      _this.connected = true;

      _this.log.debug(`connected to ${_this.host}`);
    });
    this.denon.on('close', function () {
      _this.connected = false;

      _this.log.debug(`lost connection to ${_this.host}`);

      _this.connect();
    });
    this.denon.on('error', function (err) {
      // the close event will be called, too
      _this.log.error(err);
    });
    this.denon.on('failedLogin', function () {
      _this.log.error(`Can't login at ${_this.host}`);
    });
    this.connect();
  }

  _createClass(DenonAvrPlatform, [{
    key: "accessories",
    value: function accessories(callback, attempt) {
      var _this2 = this;

      if (attempt > 4) {
        throw new Error(`Can't connect to AVR on ${this.host}`);
        callback([]);
        return;
      }

      attempt++;

      if (!this.connected) {
        this.log("Not connected to AVR. Trying again...");
        setTimeout(function () {
          return _this2.accessories(callback, attempt);
        }, 2000);
        return;
      }

      var mainZone = new MainZoneAccessory(this);
      var secondZone = new SecondZoneAccessory(this);
      callback([mainZone, secondZone]);
    }
  }, {
    key: "send",
    value: function send(cmd) {
      var _this3 = this;

      this.log.debug(`send command ${cmd}`);

      if (cmd && this.queue.length) {
        this.log.debug('pushed command to queue');
        this.queue.push(cmd);
        return;
      }

      if (!cmd && this.queue.length) {
        this.log.debug('get cmd from queue');
        cmd = this.queue[0];
        this.queue.shift();
      }

      this.denon.send(cmd + "\r").then(function () {
        _this3.log.debug(`command ${cmd} successfully send`);

        if (_this3.queue.length) setTimeout(function () {
          return _this3.send();
        }, 100);
      }).catch(function (err) {
        _this3.log.debug(`error: ${err}`);

        if (_this3.queue.length) setTimeout(function () {
          return _this3.send();
        }, 100);
      });
    }
  }]);

  return DenonAvrPlatform;
}();
