const log = require('electron-log')

log.transports.file.maxSize = 104857600 // 100M
log.transports.file.level = 'debug'

exports.log = log
