'use strict'

const EventEmitter = require('node:events').EventEmitter
const inherits = require('node:util').inherits
const getLimit = require('../../../lib/utils/getLimit')

const StreamSearch = require('../../streamsearch/sbmh')

const B_DCRLF = Buffer.from('\r\n\r\n')

function HeaderParser (cfg) {
  EventEmitter.call(this)

  cfg = cfg || {}
  const self = this
  this.nread = 0
  this.maxed = false
  this.npairs = 0
  this.maxHeaderPairs = getLimit(cfg, 'maxHeaderPairs', 2000)
  this.maxHeaderSize = getLimit(cfg, 'maxHeaderSize', 80 * 1024)
  this.buffer = ''
  this.header = {}
  this.finished = false
  this.ss = new StreamSearch(B_DCRLF)
  this.ss.on('info', function (isMatch, data, start, end) {
    if (data && !self.maxed) {
      if (self.nread + end - start >= self.maxHeaderSize) {
        end = self.maxHeaderSize - self.nread + start
        self.nread = self.maxHeaderSize
        self.maxed = true
      } else { self.nread += (end - start) }

      self.buffer += data.toString('binary', start, end)
    }
    if (isMatch) { self._finish() }
  })
}
inherits(HeaderParser, EventEmitter)

HeaderParser.prototype.push = function (data) {
  const r = this.ss.push(data)
  if (this.finished) { return r }
}

HeaderParser.prototype.reset = function () {
  this.finished = false
  this.buffer = ''
  this.header = {}
  this.ss.reset()
}

HeaderParser.prototype._finish = function () {
  if (this.buffer) { this._parseHeader() }
  this.ss.matches = this.ss.maxMatches
  const header = this.header
  this.header = {}
  this.buffer = ''
  this.finished = true
  this.nread = this.npairs = 0
  this.maxed = false
  this.emit('header', header)
}

HeaderParser.prototype._parseHeader = function () {
  if (this.npairs === this.maxHeaderPairs) { return }

  const buffer = this.buffer
  let h
  let lineStart = 0

  while (lineStart < buffer.length) {
    let lineEnd = buffer.indexOf('\r\n', lineStart)
    if (lineEnd === -1) { lineEnd = buffer.length }

    if (lineEnd === lineStart) {
      lineStart = lineEnd + 2
      continue
    }

    if ((buffer[lineStart] === '\t' || buffer[lineStart] === ' ') && h) {
      // folded header content
      // RFC2822 says to just remove the CRLF and not the whitespace following
      // it, so we follow the RFC and include the leading whitespace ...
      this.header[h][this.header[h].length - 1] += buffer.slice(lineStart, lineEnd)
      lineStart = lineEnd + 2
      continue
    }

    const posColon = buffer.indexOf(':', lineStart)
    if (
      posColon === -1 ||
      posColon === lineStart ||
      posColon > lineEnd
    ) {
      return
    }
    h = buffer.slice(lineStart, posColon).toLowerCase()
    let valueStart = posColon + 1
    if (buffer[valueStart] === ' ' || buffer[valueStart] === '\t') { ++valueStart }
    const values = this.header[h] || (this.header[h] = [])
    values.push(buffer.slice(valueStart, lineEnd))
    if (++this.npairs === this.maxHeaderPairs) { break }

    lineStart = lineEnd + 2
  }
}

module.exports = HeaderParser
