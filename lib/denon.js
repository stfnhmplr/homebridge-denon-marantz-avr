/**
 * created by stfnhmplr on 28.01.16.
 * control your Denon AVR via http with node.js
 */

var request = require('request');
var parseString = require('xml2js').parseString;

var Denon = function (ip, port) {
    this.ip = ip;
    this.port = port;
    this.status_url = '/goform/formMainZone_MainZoneXml.xml';
};


/**
 * Returns the friendly avr name
 * @param callback
 */
Denon.prototype.getModelInfo = function (callback) {
    request.get('http://' + this.ip + ':' + this.port + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode === 200) {
            parseString(xml + body, function (err, result) {
                callback(null, {
                  name: result.item.FriendlyName[0].value[0],
                  brand: result.item.BrandId[0].value[0]
                });
            });
        } else {
            callback(error);
        }
    });
};


/**
 * Returns the friendly avr name
 * @param callback
 */
Denon.prototype.getName = function (callback) {
    request.get('http://' + this.ip + ':' + this.port + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode === 200) {
            parseString(xml + body, function (err, result) {
                callback(null, result.item.FriendlyName[0].value[0]);
            });
        } else {
            callback(error);
        }
    });
};


/**
 * Returns the avr brand
 * @param callback
 */
Denon.prototype.getBrand = function (callback) {
    request.get('http://' + this.ip + ':' + this.port + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode === 200) {
            parseString(xml + body, function (err, result) {
                callback(null, result.item.BrandId[0].value[0]);
            });
        } else {
            callback(error);
        }
    });
};

/**
 * Returns the current power state of the avr
 * @param callback
 */
Denon.prototype.getPowerState = function (callback) {
    request.get('http://' + this.ip + ':' + this.port + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode === 200) {
            parseString(xml + body, function (err, result) {
                callback(null, (result.item.Power[0].value[0] == 'ON'));
            });
        } else {
            callback("Can't connect to device: " + error, false)
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
    request.get('http://' + this.ip + ':' + this.port + '/MainZone/index.put.asp?cmd0=PutZone_OnOff/' + powerState, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(null, powerState == 'ON');
        } else {
            callback(error)
        }
    });
};

/**
 * Returns the current mute state of the avr
 * @param callback
 */
Denon.prototype.getMuteState = function (callback) {
    request.get('http://' + this.ip + ':' + this.port + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode === 200) {
            parseString(xml + body, function (err, result) {
                callback(null, (result.item.Mute[0].value[0] == 'ON'));
            });
        } else {
            callback(error);
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
    request.get('http://' + this.ip + ':' + this.port + '/MainZone/index.put.asp?cmd0=PutVolumeMute/' + muteState, function (error, response, body) {
        if(!error && response.statusCode === 200) {
            callback(null, muteState == 'ON');
        } else {
            callback(error)
        }
    })
};

/**
 * Returns the current input of the avr
 * @param callback (String)
 */
Denon.prototype.getInput = function (callback) {
    request.get('http://' + this.ip + ':' + this.port + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode === 200) {
            parseString(xml + body, function (err, result) {
                callback(null, result.item.InputFuncSelect[0].value[0]);
            });
        } else {
            callback(error);
        }
    }.bind(this));
};

/**
 * sets the input to xxx
 * possible values are
 * 'CD', 'SPOTIFY', 'CBL/SAT', 'DVD', 'BD', 'GAME', 'GAME2', 'AUX1',
     'MPLAY', 'USB/IPOD', 'TUNER', 'NETWORK', 'TV', 'IRADIO', 'SAT/CBL', 'DOCK',
     'IPOD', 'NET/USB', 'RHAPSODY', 'PANDORA', 'LASTFM', 'IRP', 'FAVORITES', 'SERVER'
 * @param input String
 * @param callback
 */
Denon.prototype.setInput = function (input, callback) {
    request.get('http://' + this.ip + ':' + this.port + '/goform/formiPhoneAppDirect.xml?SI' + input, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(null);
        } else {
            callback(error)
        }
    })
};

/**
 * Returns the current Surround Mode
 * @param callback
 */
Denon.prototype.getSurroundMode = function (callback) {
    request.get('http://' + this.ip + ':' + this.port + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode === 200) {
            parseString(xml + body, function (err, result) {
                callback(null, result.item.selectSurround[0].value[0]);
            });
        } else {
            callback(error);
        }
    }.bind(this));
};

/**
 * Set the playback volume
 * the volume fix sets the volume to the volume the display shows
 * @param volume integer
 * @param callback
 */
Denon.prototype.setVolume = function (volume, callback) {
    var vol = (volume - 80).toFixed(1);  //volume fix
    request.get('http://' + this.ip + ':' + this.port + '/goform/formiPhoneAppVolume.xml?1+' + vol, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(null);
        } else {
            callback(error)
        }
    });
};

/**
 * Returns the current volume of the avr (with volume fix)
 * @param callback
 */
Denon.prototype.getVolume = function (callback) {
    request.get('http://' + this.ip + ':' + this.port + this.status_url, function (error, response, body) {
        var xml = '';
        if (!error && response.statusCode === 200) {
            parseString(xml + body, function (err, result) {
                callback(null, parseInt(result.item.MasterVolume[0].value[0]) + 80);
            });
        } else {
            callback(error);
        }
    }.bind(this));
};

module.exports = Denon;
