'use strict'

require('@babel/polyfill')
const Telnet = require('telnet-client')
let MainZoneAccessory, SecondZoneAccessory

module.exports = function (homebridge) {
    MainZoneAccessory = require('./accessories/MainZoneAccessory')(homebridge)
    SecondZoneAccessory = require('./accessories/SecondZoneAccessory')(homebridge)
    homebridge.registerPlatform('homebridge-denon-v2', 'DenonMarantzAVR', DenonAvrPlatform, false)
}

class DenonAvrPlatform {
    constructor(log, config, api) {
        this.log = log
        this.config = config
        this.host = config.host
        this.queue = []
        this.connected = false
        this.attempts = 0

        this.denon = new Telnet()

        this.denon.on('connect', () => {
            this.connected = true
            this.log.debug(`connected to ${this.host}`)
        })

        this.denon.on('close', () => {
            this.connected = false
            this.log.debug(`lost connection to ${this.host}`)
            if (this.attempts > 5) throw new Error(`Can't connect to AVR on ${this.host}`)
            setTimeout(() => {
                this.connect()
            }, 2000)
        })

        this.denon.on('error', err => {
            // the close event will be called, too
            this.log.error(err)
        })

        this.denon.on('failedLogin', () => {
            this.log.error(`Can't login at ${this.host}`)
        })

        this.connect()
    }

    accessories(callback, attempt) {
        if (!this.connected) {
            setTimeout(() => this.accessories(callback, attempt), 2000)
            return
        }

        const mainZone = new MainZoneAccessory(this)

        if (!this.config.secondZone) {
            callback([mainZone])
            return
        }

        const secondZone = new SecondZoneAccessory(this)
        callback([mainZone, secondZone])
    }

    connect = async () => {
        this.attempts++

        const params = {
            host: this.host,
            port: 23,
            echoLines: 0,
            irs: '\r',
            negotiationMandatory: false,
            ors: '\r\n',
            separator: false,
            shellPrompt: '',
            timeout: 800,
        }

        await this.denon.connect(params)
        this.connected = true
        this.attempts = 0
        this.log(`connected to AVR (${this.host})`)
    }

    send(cmd) {
        this.log.debug(`send command ${cmd}`)

        if (cmd && this.queue.length) {
            this.log.debug('pushed command to queue')
            this.queue.push(cmd)
            return
        }

        if (!cmd && this.queue.length) {
            this.log.debug('get cmd from queue')
            cmd = this.queue[0]
            this.queue.shift()
        }

        return new Promise((resolve, reject) => {
            this.denon
                .send(cmd + '\r')
                .then(() => {
                    this.log.debug(`command ${cmd} successfully send`)
                    if (this.queue.length) {
                        setTimeout(() => {
                            resolve()
                            this.send()
                        }, 100)
                    } else {
                        resolve()
                    }
                })
                .catch(err => {
                    this.log.debug(`error: ${err}`)
                    if (this.queue.length) {
                        setTimeout(() => {
                            this.send()
                            reject(err)
                        }, 100)
                    } else {
                        reject(err)
                    }
                })
        })
    }
}
