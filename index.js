var Service, Characteristic;
var Denon = require('./lib/denon');
var inherits = require('util').inherits;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory('homebridge-denon-marantz-avr', 'DenonMarantzAVR', DenonAVRAccessory);
};

function DenonAVRAccessory(log, config) {
    this.log = log;
    this.config = config;
    this.ip = config['ip'];
    this.name = config['name'];

    this.defaultInput = config['defaultInput'] || null;
    this.defaultVolume = config['defaultVolume'] || null;
    this.minVolume = config['minVolume'] || 0;
    this.maxVolume = config['maxVolume'] || 70;

    this.denon = new Denon(this.ip);
}

DenonAVRAccessory.prototype.getPowerState = function (callback) {
    this.denon.getPowerState(function (err, state) {
        if (err) {
            this.log(err);
            callback(null, false);
        } else
            this.log('current power state is: %s', (state) ? 'ON' : 'OFF');
        callback(null, state);
    }.bind(this));
};

DenonAVRAccessory.prototype.setPowerState = function (powerState, callback) {
    this.denon.setPowerState(powerState, function (err, state) {
        if (err) {
            this.log(err);
            callback(err);
        } else {
            if(powerState && this.defaultInput) {
                this.denon.setInput(this.defaultInput, function (err) {
                    if (err) {
                        this.log('Error setting default input');
                        callback(err);
                    }
                }.bind(this));
            }
            this.log('denon avr powered %s', state);
        }
    }.bind(this));

    if (powerState && this.defaultVolume) {
        setTimeout(function () {
            this.denon.setVolume(this.defaultVolume, function (err) {
                if (err) {
                    this.log('Error setting default volume');
                    callback(err);
                }
                this.switchService.getCharacteristic(Characteristic.Volume)
                  .updateValue(Math.round(this.defaultVolume / this.maxVolume * 100));
            }.bind(this));
        }.bind(this), 4000);
    }

    callback(null);
};

DenonAVRAccessory.prototype.getVolume = function (callback) {
    this.denon.getVolume(function (err, volume) {
        if (err) {
            this.log('get Volume error: ' + err)
            callback(err);
        } else {
            this.log('current volume is: ' + volume);
            var pVol = Math.round(volume / this.maxVolume * 100);
            callback(null, pVol);
        }
    }.bind(this))
};

DenonAVRAccessory.prototype.setVolume = function (pVol, callback) {
    var volume = Math.round(pVol / 100 * this.maxVolume);
    this.denon.setVolume(volume, function (err) {
        if (err) {
            this.log('set Volume error: ' + err);
            callback(err);
        } else {
            this.log('set Volume to: ' + volume);
            callback(null);
        }
    }.bind(this))
};

DenonAVRAccessory.prototype.setMuteState = function (state, callback) {
    this.denon.setMuteState(state, function (err) {
        if (err) {
            this.log('set mute error: ' + err);
            callback(err);
        } else {
            callback(null);
        }
    }.bind(this));
};

DenonAVRAccessory.prototype.getMuteState = function (callback) {
    this.denon.getMuteState(function (err, state) {
        if (err) {
            this.log('get mute error: ' + err);
            callback(err);
        } else {
            callback(state);
        }
    }.bind(this))
};

DenonAVRAccessory.prototype.getServices = function () {
    var informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Name, this.name)
        .setCharacteristic(Characteristic.Manufacturer, this.type || 'Denon');

    this.switchService = new Service.Switch(this.name);
    this.switchService.getCharacteristic(Characteristic.On)
        .on('get', this.getPowerState.bind(this))
        .on('set', this.setPowerState.bind(this));

    this.switchService.addCharacteristic(Characteristic.Mute)
        .on('get', this.getMuteState.bind(this))
        .on('set', this.setMuteState.bind(this));

    this.switchService.addCharacteristic(Characteristic.Volume)
        .on('get', this.getVolume.bind(this))
        .on('set', this.setVolume.bind(this));

    return [informationService, this.switchService];
};
