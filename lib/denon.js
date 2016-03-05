/**
 * created by stfnhmplr on 28.01.16.
 * control your Denon AVR via http with node.js
 */

var request = require('request');
var parseString = require('xml2js').parseString;

/* possible input values */
var inputs = ['CD', 'SPOTIFY', 'CBL/SAT', 'DVD', 'BD', 'GAME', 'AUX1',
    'MPLAY', 'USB/IPOD', 'TUNER', 'NETWORK', 'TV', 'IRADIO'];

var Denon = function (ip, type) {
    this.ip = ip;
    this.type = type;
    this.status_url = '/goform/formMainZone_MainZoneXml.xml';
};

/**
 * gets the avr name
 * @param callback
 */
Denon.prototype.getName = function (callback) {
    request.get('http://' + this.ip + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode == 200) {
            parseString(xml + body, function (err, result) {
                callback(null, result.item.FriendlyName[0].value[0]);
            });
        }
    });
};

/**
 * gets the power state of the avr
 * @param callback
 */
Denon.prototype.getPowerState = function (callback) {
    request.get('http://' + this.ip + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode == 200) {
            parseString(xml + body, function (err, result) {
                callback(null, (result.item.Power[0].value[0] == 'ON'));
            }.bind(this));
        }
    }.bind(this));
};

/**
 * sets the power state of the avr
 * @param powerState - true or false
 * @param callback
 */
Denon.prototype.setPowerState = function (powerState, callback) {
    powerState = (powerState) ? 'ON' : 'OFF';
    request.get('http://' + this.ip + '/MainZone/index.put.asp?cmd0=PutZone_OnOff/' + powerState, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(null, powerState == 'ON');
        } else {
            callback(error, null)
        }
    });
};

/**
 * gets the mute state of the avr
 * @param callback
 */
Denon.prototype.getMuteState = function (callback) {
    request.get('http://' + this.ip + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode == 200) {
            parseString(xml + body, function (err, result) {
                callback(null, (result.item.Mute[0].value[0] == 'ON'));
            }.bind(this));
        }
    }.bind(this));
};

/**
 * set the mute state of the avr
 * @param muteState
 * @param callback
 */
Denon.prototype.setMuteState = function(muteState, callback) {
    muteState = (muteState) ? 'ON' : 'OFF';
    request.get('http://' + this.ip + '/MainZone/index.put.asp?cmd0=PutVolumeMute/' + muteState, function (error, reponse, body) {
        if(!error && response.statusCode == 200) {
            callback(null, muteState == 'ON');
        } else {
            callback(error, null)
        }
    })
};

/**
 * sets the input possible values are
 * 'CD', 'SPOTIFY', 'CBL/SAT', 'DVD', 'BD', 'GAME', 'AUX1', 'MPLAY', 'USB/IPOD', 'TUNER', 'NETWORK', 'TV', 'IRADIO'
 * @param input String
 * @param callback
 */
Denon.prototype.setInput = function (input, callback) {
    if (!!~inputs.indexOf(input)) {
        request.get('http://' + this.ip + '/goform/formiPhoneAppDirect.xml?SI' + input, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(null);
            } else {
                callback(error)
            }
        })
    }
};

/**
 * sets the playback volume
 * the volume fix sets the volume to the volume the display shows
 * @param volume integer
 * @param callback
 */
Denon.prototype.setVolume = function (volume, callback) {
    var vol = (volume - 80).toFixed(1);  //volume fix
    request.get('http://' + this.ip + '/goform/formiPhoneAppVolume.xml?1+' + vol, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(null);
        } else {
            callback(error)
        }
    });
};

/**
 * gets the volume of your avr (with volume fix)
 * @param callback
 */
Denon.prototype.getVolume = function (callback) {
    request.get('http://' + this.ip + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode == 200) {
            parseString(xml + body, function (err, result) {
                callback(null, parseInt(result.item.MasterVolume[0].value[0]) + 80);
            }.bind(this));
        }
    }.bind(this));
};

module.exports = Denon;
