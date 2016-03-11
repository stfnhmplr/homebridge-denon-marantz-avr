var Service, Characteristic;
var Denon = require('./lib/denon');

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory('homebridge-denon-marantz-avr', 'DenonAVR', DenonAVRAccessory);
};

function DenonAVRAccessory(log, config) {
    this.log = log;
    this.config = config;
    this.ip = config['ip'];
    this.type = config['type'];
    this.name = config['name'];

    this.defaultInput = config['defaultInput'] || null;
    this.defaultVolume = config['defaultVolume'] || null;
    this.minVolume = config['minVolume'] || null;
    this.maxVolume = config['maxVolume'] || null;

    this.denon = new Denon(this.ip, this.type);

    this.service = new Service.Switch('Power');
}

DenonAVRAccessory.prototype.getPowerState = function (callback) {
    this.denon.getPowerState(function (err, state) {
        if (err) {
            this.log(err);
            callback(err);
        } else
            this.log('current power state is: %s', (state) ? 'ON' : 'OFF');
        callback(null, state);
    }.bind(this));
};

DenonAVRAccessory.prototype.setPowerState = function (powerState, callback) {
    if (powerState && this.defaultInput) {
        this.denon.setInput(this.defaultInput, function (err) {
            if (err) {
                this.log('Error setting default input');
                callback(err);
            }
        }.bind(this));
    } else {
        this.denon.setPowerState(powerState, function (err, state) {
            if (err) {
                this.log(err);
                callback(err);
            } else {
                this.log('denon avr powered %s', state);
            }
        }.bind(this));
    }

    if (powerState && this.defaultVolume) {
        setTimeout(function() {
            this.denon.setVolume(this.defaultVolume, function (err) {
                if (err) {
                    this.log('Error setting default volume');
                    callback(err);
                }
            }.bind(this));
        }.bind(this), 4000);
    }

    callback(null);
};

DenonAVRAccessory.prototype.getServices = function () {
    var informationService = new Service.AccessoryInformation();

    informationService
        .setCharacteristic(Characteristic.Name, this.name)
        .setCharacteristic(Characteristic.Manufacturer, this.type)
        .setCharacteristic(Characteristic.Model, this.name)
        .setCharacteristic(Characteristic.SerialNumber, 'unknown');

    this.service.getCharacteristic(Characteristic.On)
        .on('get', this.getPowerState.bind(this))
        .on('set', this.setPowerState.bind(this));

    return [informationService, this.service];
};
