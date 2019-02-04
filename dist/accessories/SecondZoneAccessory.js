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

function callbackify(func) {
  return function () {
    var onlyArgs = [];
    var callback = null;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    for (var _i = 0; _i < args.length; _i++) {
      var arg = args[_i];

      if (typeof arg === 'function') {
        callback = arg;
        break;
      }

      onlyArgs.push(arg);
    }

    func.apply(void 0, onlyArgs).then(function (data) {
      return callback(null, data);
    }).catch(function (err) {
      return callback(err);
    });
  };
}

require('@babel/polyfill');
var Characteristic, Service;
function SecondZoneAccessory (homebridge) {
  Characteristic = homebridge.hap.Characteristic;
  Service = homebridge.hap.Service;
  return MainZoneAccessory;
}

var MainZoneAccessory =
/*#__PURE__*/
function () {
  function MainZoneAccessory(platform) {
    var _this = this;

    _classCallCheck(this, MainZoneAccessory);

    _defineProperty(this, "log", void 0);

    _defineProperty(this, "name", void 0);

    _defineProperty(this, "maxVolume", void 0);

    _defineProperty(this, "platform", void 0);

    _defineProperty(this, "informationService", void 0);

    _defineProperty(this, "SwitchService", void 0);

    _defineProperty(this, "SpeakerService", void 0);

    _defineProperty(this, "setMute",
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(state) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this.log(`set mute state of main zone to ${state}`);

                _this.platform.send(`Z2MU${state ? 'ON' : 'OFF'}`);

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "setPower",
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(state) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _this.log(`setting power state of second zone to ${state}`);

                _this.platform.send(`Z2${state ? 'ON' : 'OFF'}`);

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "setVolume",
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(value) {
        var vol;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                vol = Math.ceil(value / 100 * _this.maxVolume / 5) * 5;

                _this.log(`set volume of second zone to ${value} (${vol / 10})`);

                _this.platform.send(`Z2${vol}`);

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "setInput",
    /*#__PURE__*/
    function () {
      var _ref4 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(value) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _this.log(`setting input source of second zone to ${value}`);

                _this.platform.send(`Z2${value.toUpperCase()}`);

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function (_x4) {
        return _ref4.apply(this, arguments);
      };
    }());

    this.platform = platform;
    this.log = platform.log;
    this.name = `${platform.config['name']} 2nd Zone`;
    this.maxVolume = platform.config['maxVolume'] || 70;
    platform.denon.on('data', function (data) {
      return _this.handleResponse(data.toString('utf8').replace(/\r?\n|\r/gm, ''));
    });
    platform.send('Z2?');
    platform.send('Z2MU?');
    platform.send('Z2?');
  }

  _createClass(MainZoneAccessory, [{
    key: "getServices",
    value: function getServices() {
      this.informationService = new Service.AccessoryInformation();
      this.informationService // TODO update placeholder values
      .setCharacteristic(Characteristic.Name, this.name).setCharacteristic(Characteristic.Manufacturer, 'Denon/Marantz').setCharacteristic(Characteristic.Model, 'unknown').setCharacteristic(Characteristic.FirmwareRevision, 'unknown').setCharacteristic(Characteristic.SerialNumber, 'unknown');
      this.SwitchService = new Service.Switch(this.name);
      this.SwitchService.getCharacteristic(Characteristic.On).on('set', callbackify(this.setPower));
      this.SpeakerService = new Service.Speaker(this.name);
      this.SpeakerService.getCharacteristic(Characteristic.Mute).on('set', callbackify(this.setMute));
      this.SpeakerService.getCharacteristic(Characteristic.Volume).on('set', callbackify(this.setVolume));
      return [this.informationService, this.SwitchService, this.SpeakerService];
    }
  }, {
    key: "handleResponse",
    value: function handleResponse(res) {
      var regExp = /Z2MUON|Z2MUOFF|Z2ON|Z2OFF|Z2\d{1,3}/gm;
      res = res.match(regExp);
      if (!Array.isArray(res)) return;

      for (var i = 0; i < res.length; i++) {
        this.log.debug(`received response: ${res[i]}`);

        switch (res[i]) {
          case 'Z2ON':
            this.SwitchService.getCharacteristic(Characteristic.On).updateValue(true, null);
            break;

          case 'Z2OFF':
            this.SwitchService.getCharacteristic(Characteristic.On).updateValue(false, null);
            break;

          case 'Z2MUON':
            this.SpeakerService.getCharacteristic(Characteristic.Mute).updateValue(true, null);
            break;

          case 'Z2MUOFF':
            this.SpeakerService.getCharacteristic(Characteristic.Mute).updateValue(false, null);
            break;

          case /Z2\d{1,3}/g.exec(res[i])[0]:
            this.SpeakerService.getCharacteristic(Characteristic.Volume).updateValue(this._normalizeVolume(/\d{1,3}/g.exec(res[i])[0]), null);
        }
      }
    }
  }, {
    key: "_normalizeVolume",
    value: function _normalizeVolume(vol) {
      this.log.debug(`type: ${typeof vol}`);
      vol = vol.length > 2 ? parseInt(vol) / 10 : parseInt(vol);
      this.log.debug(vol);
      return vol / this.maxVolume * 100;
    }
  }]);

  return MainZoneAccessory;
}();

module.exports = SecondZoneAccessory;
