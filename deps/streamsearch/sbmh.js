'use strict'

const { EventEmitter } = require('node:events')

class SBMH extends EventEmitter {
  constructor (needle) {
    super()

    if (typeof needle === 'string') {
      needle = Buffer.from(needle)
    }

    if (!Buffer.isBuffer(needle)) {
      throw new TypeError('The needle has to be a String or a Buffer.')
    }

    const needleLength = needle.length

    if (needleLength === 0) {
      throw new Error('The needle cannot be an empty String/Buffer.')
    }

    if (needleLength > 256) {
      throw new Error('The needle cannot have a length bigger than 256.')
    }

    this.maxMatches = Infinity
    this.matches = 0

    this._needle = needle
    this._bufpos = 0
    this._lookbehind_size = 0
    this._lookbehind = Buffer.alloc(needleLength)
    this._occ = new Array(256).fill(needleLength) // Initialize occurrence table.

    // Populate occurrence table with analysis of the needle, ignoring last letter.
    for (var i = 0; i < needleLength - 1; ++i) { // eslint-disable-line no-var
      this._occ[needle[i]] = needleLength - 1 - i
    }
  }

  reset () {
    this.matches = 0
    this._lookbehind_size = 0
    this._bufpos = 0
  }

  push (chunk, pos = 0) {
    if (!Buffer.isBuffer(chunk)) {
      chunk = Buffer.from(chunk, 'binary')
    }

    this._bufpos = pos
    const chlen = chunk.length
    let r

    while (r !== chlen && this.matches < this.maxMatches) {
      r = this._sbmh_feed(chunk)
    }

    return r
  }

  _sbmh_feed (data) {
    const len = data.length
    const needle = this._needle
    const needleLength = needle.length
    const lastNeedleChar = needle[needleLength - 1]

    // Positive: points to a position in `data`
    //           pos == 3 points to data[3]
    // Negative: points to a position in the lookbehind buffer
    //           pos == -2 points to lookbehind[lookbehind_size - 2]
    let pos = -this._lookbehind_size
    let ch

    if (pos < 0) {
      // Lookbehind buffer is not empty. Perform Boyer-Moore-Horspool
      // search with character lookup code that considers both the
      // lookbehind buffer and the current round's haystack data.
      //
      // Loop until
      //   there is a match.
      // or until
      //   we've moved past the position that requires the
      //   lookbehind buffer. In this case we switch to the
      //   optimized loop.
      // or until
      //   the character to look at lies outside the haystack.
      while (pos < 0 && pos <= len - needleLength) {
        ch = this._sbmh_lookup_char(data, pos + needleLength - 1)

        if (
          ch === lastNeedleChar &&
          this._sbmh_memcmp(data, pos, needleLength - 1)
        ) {
          this._lookbehind_size = 0
          ++this.matches
          this.emit('info', true)

          return (this._bufpos = pos + needleLength)
        }

        pos += this._occ[ch]
      }

      // No match.

      if (pos < 0) {
        // There's too few data for Boyer-Moore-Horspool to run,
        // so let's use a different algorithm to skip as much as
        // we can.
        // Forward pos until
        //   the trailing part of lookbehind + data
        //   looks like the beginning of the needle
        // or until
        //   pos == 0
        while (pos < 0 && !this._sbmh_memcmp(data, pos, len - pos)) { ++pos }
      }

      if (pos >= 0) {
        // Discard lookbehind buffer.
        this.emit('info', false, this._lookbehind, 0, this._lookbehind_size)
        this._lookbehind_size = 0
      } else {
        // Cut off part of the lookbehind buffer that has
        // been processed and append the entire haystack
        // into it.
        const bytesToCutOff = this._lookbehind_size + pos
        if (bytesToCutOff > 0) {
          // The cut off data is guaranteed not to contain the needle.
          this.emit('info', false, this._lookbehind, 0, bytesToCutOff)
        }

        this._lookbehind.copy(this._lookbehind, 0, bytesToCutOff,
          this._lookbehind_size - bytesToCutOff)
        this._lookbehind_size -= bytesToCutOff

        data.copy(this._lookbehind, this._lookbehind_size)
        this._lookbehind_size += len

        this._bufpos = len
        return len
      }
    }

    pos += (pos >= 0) * this._bufpos

    // Lookbehind buffer is now empty. We only need to check if the
    // needle is in the haystack.
    pos = data.indexOf(needle, pos)

    if (pos !== -1) {
      ++this.matches
      if (pos > 0) { this.emit('info', true, data, this._bufpos, pos) } else { this.emit('info', true) }

      return (this._bufpos = pos + needleLength)
    }

    pos = len - needleLength

    // There was no match. If there's trailing haystack data that we cannot
    // match yet using the Boyer-Moore-Horspool algorithm (because the trailing
    // data is less than the needle size) then match using a modified
    // algorithm that starts matching from the beginning instead of the end.
    // Whatever trailing data is left after running this algorithm is added to
    // the lookbehind buffer.
    while (
      pos < len &&
      (
        data[pos] !== needle[0] ||
        (
          (Buffer.compare(
            data.subarray(pos, pos + len - pos),
            needle.subarray(0, len - pos)
          ) !== 0)
        )
      )
    ) {
      ++pos
    }

    if (pos < len) {
      data.copy(this._lookbehind, 0, pos, pos + (len - pos))
      this._lookbehind_size = len - pos
    }

    // Everything until pos is guaranteed not to contain needle data.
    if (pos > 0) { this.emit('info', false, data, this._bufpos, pos < len ? pos : len) }

    this._bufpos = len

    return len
  }

  _sbmh_lookup_char (data, pos) {
    return (pos < 0)
      ? this._lookbehind[this._lookbehind_size + pos]
      : data[pos]
  }

  _sbmh_memcmp (data, pos, len) {
    for (var i = 0; i < len; ++i) { // eslint-disable-line no-var
      if (this._sbmh_lookup_char(data, pos + i) !== this._needle[i]) { return false }
    }

    return true
  }
}

module.exports = SBMH
