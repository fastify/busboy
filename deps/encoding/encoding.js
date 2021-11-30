/*
   Modifications for better node.js integration:
    Copyright 2014 Brian White. All rights reserved.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to
    deal in the Software without restriction, including without limitation the
    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
    sell copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
    IN THE SOFTWARE.
*/
/*
   Original source code:
    Copyright 2014 Joshua Bell

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

//
// Helper variables
//


//
// Utilities
//

/**
 * @param {number} a The number to test.
 * @param {number} min The minimum value in the range, inclusive.
 * @param {number} max The maximum value in the range, inclusive.
 * @return {boolean} True if a >= min and a <= max.
 */
function inRange(a, min, max) {
  return min <= a && a <= max;
}

/**
 * @param {number} n The numerator.
 * @param {number} d The denominator.
 * @return {number} The result of the integer division of n by d.
 */
function div(n, d) {
  return Math.floor(n / d);
}


//
// Implementation of Encoding specification
// http://dvcs.w3.org/hg/encoding/raw-file/tip/Overview.html
//

//
// 3. Terminology
//

//
// 4. Encodings
//

/** @const */ var EOF_byte = -1;
/** @const */ var EOF_code_point = -1;

/**
 * @constructor
 * @param {Buffer} bytes Array of bytes that provide the stream.
 */
function ByteInputStream(bytes) {
  /** @type {number} */
  var pos = 0;

  /**
   * @this {ByteInputStream}
   * @return {number} Get the next byte from the stream.
   */
  this.get = function() {
    return (pos >= bytes.length) ? EOF_byte : Number(bytes[pos]);
  };

  /** @param {number} n Number (positive or negative) by which to
   *      offset the byte pointer. */
  this.offset = function(n) {
    pos += n;
    if (pos < 0) {
      throw new Error('Seeking past start of the buffer');
    }
    if (pos > bytes.length) {
      throw new Error('Seeking past EOF');
    }
  };

  /**
   * @param {Array.<number>} test Array of bytes to compare against.
   * @return {boolean} True if the start of the stream matches the test
   *     bytes.
   */
  this.match = function(test) {
    if (test.length > pos + bytes.length) {
      return false;
    }
    var i;
    for (i = 0; i < test.length; i += 1) {
      if (Number(bytes[pos + i]) !== test[i]) {
        return false;
      }
    }
    return true;
  };
}

/**
 * @constructor
 * @param {Array.<number>} bytes The array to write bytes into.
 */
function ByteOutputStream(bytes) {
  /** @type {number} */
  var pos = 0;

  /**
   * @param {...number} var_args The byte or bytes to emit into the stream.
   * @return {number} The last byte emitted.
   */
  this.emit = function(var_args) {
    /** @type {number} */
    var last = EOF_byte;
    var i;
    for (i = 0; i < arguments.length; ++i) {
      last = Number(arguments[i]);
      bytes[pos++] = last;
    }
    return last;
  };
}

/**
 * @constructor
 * @param {string} string The source of code units for the stream.
 */
function CodePointInputStream(string) {
  /**
   * @param {string} string Input string of UTF-16 code units.
   * @return {Array.<number>} Code points.
   */
  function stringToCodePoints(string) {
    /** @type {Array.<number>} */
    var cps = [];
    // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
    var i = 0, n = string.length;
    while (i < string.length) {
      var c = string.charCodeAt(i);
      if (!inRange(c, 0xD800, 0xDFFF)) {
        cps.push(c);
      } else if (inRange(c, 0xDC00, 0xDFFF)) {
        cps.push(0xFFFD);
      } else { // (inRange(cu, 0xD800, 0xDBFF))
        if (i === n - 1) {
          cps.push(0xFFFD);
        } else {
          var d = string.charCodeAt(i + 1);
          if (inRange(d, 0xDC00, 0xDFFF)) {
            var a = c & 0x3FF;
            var b = d & 0x3FF;
            i += 1;
            cps.push(0x10000 + (a << 10) + b);
          } else {
            cps.push(0xFFFD);
          }
        }
      }
      i += 1;
    }
    return cps;
  }

  /** @type {number} */
  var pos = 0;
  /** @type {Array.<number>} */
  var cps = stringToCodePoints(string);

  /** @param {number} n The number of bytes (positive or negative)
   *      to advance the code point pointer by.*/
  this.offset = function(n) {
    pos += n;
    if (pos < 0) {
      throw new Error('Seeking past start of the buffer');
    }
    if (pos > cps.length) {
      throw new Error('Seeking past EOF');
    }
  };


  /** @return {number} Get the next code point from the stream. */
  this.get = function() {
    if (pos >= cps.length) {
      return EOF_code_point;
    }
    return cps[pos];
  };
}

/**
 * @constructor
 */
function CodePointOutputStream() {
  /** @type {string} */
  var string = '';

  /** @return {string} The accumulated string. */
  this.string = function() {
    return string;
  };

  /** @param {number} c The code point to encode into the stream. */
  this.emit = function(c) {
    if (c <= 0xFFFF) {
      string += String.fromCharCode(c);
    } else {
      c -= 0x10000;
      string += String.fromCharCode(0xD800 + ((c >> 10) & 0x3ff));
      string += String.fromCharCode(0xDC00 + (c & 0x3ff));
    }
  };
}

/**
 * @constructor
 * @param {string} message Description of the error.
 */
function EncodingError(message) {
  this.name = 'EncodingError';
  this.message = message;
  this.code = 0;
}
EncodingError.prototype = Error.prototype;

/**
 * @param {boolean} fatal If true, decoding errors raise an exception.
 * @param {number=} opt_code_point Override the standard fallback code point.
 * @return {number} The code point to insert on a decoding error.
 */
function decoderError(fatal, opt_code_point) {
  if (fatal) {
    throw new EncodingError('Decoder error');
  }
  return opt_code_point || 0xFFFD;
}

/**
 * @param {string} label The encoding label.
 * @return {?{name:string,labels:Array.<string>}}
 */
function getEncoding(label) {
  label = String(label).trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(label_to_encoding, label)) {
    return label_to_encoding[label];
  }
  return null;
}

/** @type {Array.<{encodings: Array.<{name:string,labels:Array.<string>}>,
 *      heading: string}>} */
var encodings = require('./encodings.json');

var name_to_encoding = {};
var label_to_encoding = {};
encodings.forEach(function(category) {
  category.encodings.forEach(function(encoding) {
    name_to_encoding[encoding.name] = encoding;
    encoding.labels.forEach(function(label) {
      label_to_encoding[label] = encoding;
    });
  });
});

//
// 5. Indexes
//

/**
 * @param {number} pointer The |pointer| to search for.
 * @param {Array.<?number>|undefined} index The |index| to search within.
 * @return {?number} The code point corresponding to |pointer| in |index|,
 *     or null if |code point| is not in |index|.
 */
function indexCodePointFor(pointer, index) {
    if (!index) return null;
    return index[pointer] || null;
}

/**
 * @param {number} code_point The |code point| to search for.
 * @param {Array.<?number>} index The |index| to search within.
 * @return {?number} The first pointer corresponding to |code point| in
 *     |index|, or null if |code point| is not in |index|.
 */
function indexPointerFor(code_point, index) {
  var pointer = index.indexOf(code_point);
  return pointer === -1 ? null : pointer;
}

/** @type {Object.<string, (Array.<number>|Array.<Array.<number>>)>} */
var indexes = require('./encoding-indexes');

/**
 * @param {number} pointer The |pointer| to search for in the gb18030 index.
 * @return {?number} The code point corresponding to |pointer| in |index|,
 *     or null if |code point| is not in the gb18030 index.
 */
function indexGB18030CodePointFor(pointer) {
  if ((pointer > 39419 && pointer < 189000) || (pointer > 1237575)) {
    return null;
  }
  var /** @type {number} */ offset = 0,
      /** @type {number} */ code_point_offset = 0,
      /** @type {Array.<Array.<number>>} */ idx = indexes['gb18030'];
  var i;
  for (i = 0; i < idx.length; ++i) {
    var entry = idx[i];
    if (entry[0] <= pointer) {
      offset = entry[0];
      code_point_offset = entry[1];
    } else {
      break;
    }
  }
  return code_point_offset + pointer - offset;
}

/**
 * @param {number} code_point The |code point| to locate in the gb18030 index.
 * @return {number} The first pointer corresponding to |code point| in the
 *     gb18030 index.
 */
function indexGB18030PointerFor(code_point) {
  var /** @type {number} */ offset = 0,
      /** @type {number} */ pointer_offset = 0,
      /** @type {Array.<Array.<number>>} */ idx = indexes['gb18030'];
  var i;
  for (i = 0; i < idx.length; ++i) {
    var entry = idx[i];
    if (entry[1] <= code_point) {
      offset = entry[1];
      pointer_offset = entry[0];
    } else {
      break;
    }
  }
  return pointer_offset + code_point - offset;
}


//
// 7. API
//

/** @const */ var DEFAULT_ENCODING = 'utf-8';

// 7.1 Interface TextDecoder

/**
 * @constructor
 * @param {string=} opt_encoding The label of the encoding;
 *     defaults to 'utf-8'.
 * @param {{fatal: boolean}=} options
 */
function TextDecoder(opt_encoding, options) {
  if (!(this instanceof TextDecoder)) {
    return new TextDecoder(opt_encoding, options);
  }
  opt_encoding = opt_encoding ? String(opt_encoding) : DEFAULT_ENCODING;
  options = Object(options);
  /** @private */
  this._encoding = getEncoding(opt_encoding);
  if (this._encoding === null || this._encoding.name === 'replacement')
    throw new TypeError('Unknown encoding: ' + opt_encoding);

  /** @private @type {boolean} */
  this._streaming = false;
  /** @private @type {boolean} */
  this._BOMseen = false;
  /** @private */
  this._decoder = null;
  /** @private @type {{fatal: boolean}=} */
  this._options = { fatal: Boolean(options.fatal) };

  if (Object.defineProperty) {
    Object.defineProperty(
        this, 'encoding',
        { get: function() { return this._encoding.name; } });
  } else {
    this.encoding = this._encoding.name;
  }

  return this;
}

// TODO: Issue if input byte stream is offset by decoder
// TODO: BOM detection will not work if stream header spans multiple calls
// (last N bytes of previous stream may need to be retained?)
TextDecoder.prototype = {
  /**
   * @param {Buffer=} bytes The buffer of bytes to decode.
   * @param {{stream: boolean}=} options
   */
  decode: function decode(bytes, options) {
    options = Object(options);

    if (!this._streaming) {
      this._decoder = this._encoding.getDecoder(this._options);
      this._BOMseen = false;
    }
    this._streaming = Boolean(options.stream);

    var input_stream = new ByteInputStream(bytes);

    var output_stream = new CodePointOutputStream();

    /** @type {number} */
    var code_point;

    while (input_stream.get() !== EOF_byte) {
      code_point = this._decoder.decode(input_stream);
      if (code_point !== null && code_point !== EOF_code_point) {
        output_stream.emit(code_point);
      }
    }
    if (!this._streaming) {
      do {
        code_point = this._decoder.decode(input_stream);
        if (code_point !== null && code_point !== EOF_code_point) {
          output_stream.emit(code_point);
        }
      } while (code_point !== EOF_code_point &&
               input_stream.get() != EOF_byte);
      this._decoder = null;
    }

    var result = output_stream.string();
    if (!this._BOMseen && result.length) {
      this._BOMseen = true;
      if (UTFs.indexOf(this.encoding) !== -1 &&
         result.charCodeAt(0) === 0xFEFF) {
        result = result.substring(1);
      }
    }

    return result;
  }
};

var UTFs = ['utf-8', 'utf-16le', 'utf-16be'];
//
// 8. The encoding
//

// 8.1 utf-8

/**
 * @constructor
 * @param {{fatal: boolean}} options
 */
function UTF8Decoder(options) {
  var fatal = options.fatal;
  var /** @type {number} */ utf8_code_point = 0,
      /** @type {number} */ utf8_bytes_needed = 0,
      /** @type {number} */ utf8_bytes_seen = 0,
      /** @type {number} */ utf8_lower_boundary = 0;

  /**
   * @param {ByteInputStream} byte_pointer The byte stream to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    var bite = byte_pointer.get();
    if (bite === EOF_byte) {
      if (utf8_bytes_needed !== 0) {
        return decoderError(fatal);
      }
      return EOF_code_point;
    }
    byte_pointer.offset(1);

    if (utf8_bytes_needed === 0) {
      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }
      if (inRange(bite, 0xC2, 0xDF)) {
        utf8_bytes_needed = 1;
        utf8_lower_boundary = 0x80;
        utf8_code_point = bite - 0xC0;
      } else if (inRange(bite, 0xE0, 0xEF)) {
        utf8_bytes_needed = 2;
        utf8_lower_boundary = 0x800;
        utf8_code_point = bite - 0xE0;
      } else if (inRange(bite, 0xF0, 0xF4)) {
        utf8_bytes_needed = 3;
        utf8_lower_boundary = 0x10000;
        utf8_code_point = bite - 0xF0;
      } else {
        return decoderError(fatal);
      }
      utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
      return null;
    }
    if (!inRange(bite, 0x80, 0xBF)) {
      utf8_code_point = 0;
      utf8_bytes_needed = 0;
      utf8_bytes_seen = 0;
      utf8_lower_boundary = 0;
      byte_pointer.offset(-1);
      return decoderError(fatal);
    }
    utf8_bytes_seen += 1;
    utf8_code_point = utf8_code_point + (bite - 0x80) *
        Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
    if (utf8_bytes_seen !== utf8_bytes_needed) {
      return null;
    }
    var code_point = utf8_code_point;
    var lower_boundary = utf8_lower_boundary;
    utf8_code_point = 0;
    utf8_bytes_needed = 0;
    utf8_bytes_seen = 0;
    utf8_lower_boundary = 0;
    if (inRange(code_point, lower_boundary, 0x10FFFF) &&
        !inRange(code_point, 0xD800, 0xDFFF)) {
      return code_point;
    }
    return decoderError(fatal);
  };
}

/** @param {{fatal: boolean}} options */
name_to_encoding['utf-8'].getDecoder = function(options) {
  return new UTF8Decoder(options);
};

//
// 9. Legacy single-byte encodings
//

/**
 * @constructor
 * @param {Array.<number>} index The encoding index.
 * @param {{fatal: boolean}} options
 */
function SingleByteDecoder(index, options) {
  var fatal = options.fatal;
  /**
   * @param {ByteInputStream} byte_pointer The byte stream to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    var bite = byte_pointer.get();
    if (bite === EOF_byte) {
      return EOF_code_point;
    }
    byte_pointer.offset(1);
    if (inRange(bite, 0x00, 0x7F)) {
      return bite;
    }
    var code_point = index[bite - 0x80];
    if (code_point === null) {
      return decoderError(fatal);
    }
    return code_point;
  };
}

(function() {
  encodings.forEach(function(category) {
    if (category.heading !== 'Legacy single-byte encodings')
      return;
    category.encodings.forEach(function(encoding) {
      var idx = indexes[encoding.name];
      /** @param {{fatal: boolean}} options */
      encoding.getDecoder = function(options) {
        return new SingleByteDecoder(idx, options);
      };
    });
  });
}());

//
// 10. Legacy multi-byte Chinese (simplified) encodings
//

// 9.1 gbk

/**
 * @constructor
 * @param {boolean} gb18030 True if decoding gb18030, false otherwise.
 * @param {{fatal: boolean}} options
 */
function GBKDecoder(gb18030, options) {
  var fatal = options.fatal;
  var /** @type {number} */ gbk_first = 0x00,
      /** @type {number} */ gbk_second = 0x00,
      /** @type {number} */ gbk_third = 0x00;
  /**
   * @param {ByteInputStream} byte_pointer The byte stream to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    var bite = byte_pointer.get();
    if (bite === EOF_byte && gbk_first === 0x00 &&
        gbk_second === 0x00 && gbk_third === 0x00) {
      return EOF_code_point;
    }
    if (bite === EOF_byte &&
        (gbk_first !== 0x00 || gbk_second !== 0x00 || gbk_third !== 0x00)) {
      gbk_first = 0x00;
      gbk_second = 0x00;
      gbk_third = 0x00;
      decoderError(fatal);
    }
    byte_pointer.offset(1);
    var code_point;
    if (gbk_third !== 0x00) {
      code_point = null;
      if (inRange(bite, 0x30, 0x39)) {
        code_point = indexGB18030CodePointFor(
            (((gbk_first - 0x81) * 10 + (gbk_second - 0x30)) * 126 +
             (gbk_third - 0x81)) * 10 + bite - 0x30);
      }
      gbk_first = 0x00;
      gbk_second = 0x00;
      gbk_third = 0x00;
      if (code_point === null) {
        byte_pointer.offset(-3);
        return decoderError(fatal);
      }
      return code_point;
    }
    if (gbk_second !== 0x00) {
      if (inRange(bite, 0x81, 0xFE)) {
        gbk_third = bite;
        return null;
      }
      byte_pointer.offset(-2);
      gbk_first = 0x00;
      gbk_second = 0x00;
      return decoderError(fatal);
    }
    if (gbk_first !== 0x00) {
      if (inRange(bite, 0x30, 0x39) && gb18030) {
        gbk_second = bite;
        return null;
      }
      var lead = gbk_first;
      var pointer = null;
      gbk_first = 0x00;
      var offset = bite < 0x7F ? 0x40 : 0x41;
      if (inRange(bite, 0x40, 0x7E) || inRange(bite, 0x80, 0xFE)) {
        pointer = (lead - 0x81) * 190 + (bite - offset);
      }
      code_point = pointer === null ? null :
          indexCodePointFor(pointer, indexes['gbk']);
      if (pointer === null) {
        byte_pointer.offset(-1);
      }
      if (code_point === null) {
        return decoderError(fatal);
      }
      return code_point;
    }
    if (inRange(bite, 0x00, 0x7F)) {
      return bite;
    }
    if (bite === 0x80) {
      return 0x20AC;
    }
    if (inRange(bite, 0x81, 0xFE)) {
      gbk_first = bite;
      return null;
    }
    return decoderError(fatal);
  };
}

name_to_encoding['gbk'].getDecoder = function(options) {
  return new GBKDecoder(false, options);
};

name_to_encoding['gb18030'].getDecoder = function(options) {
  return new GBKDecoder(true, options);
};

// 10.2 hz-gb-2312

/**
 * @constructor
 * @param {{fatal: boolean}} options
 */
function HZGB2312Decoder(options) {
  var fatal = options.fatal;
  var /** @type {boolean} */ hzgb2312 = false,
      /** @type {number} */ hzgb2312_lead = 0x00;
  /**
   * @param {ByteInputStream} byte_pointer The byte stream to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    var bite = byte_pointer.get();
    if (bite === EOF_byte && hzgb2312_lead === 0x00) {
      return EOF_code_point;
    }
    if (bite === EOF_byte && hzgb2312_lead !== 0x00) {
      hzgb2312_lead = 0x00;
      return decoderError(fatal);
    }
    byte_pointer.offset(1);
    if (hzgb2312_lead === 0x7E) {
      hzgb2312_lead = 0x00;
      if (bite === 0x7B) {
        hzgb2312 = true;
        return null;
      }
      if (bite === 0x7D) {
        hzgb2312 = false;
        return null;
      }
      if (bite === 0x7E) {
        return 0x007E;
      }
      if (bite === 0x0A) {
        return null;
      }
      byte_pointer.offset(-1);
      return decoderError(fatal);
    }
    if (hzgb2312_lead !== 0x00) {
      var lead = hzgb2312_lead;
      hzgb2312_lead = 0x00;
      var code_point = null;
      if (inRange(bite, 0x21, 0x7E)) {
        code_point = indexCodePointFor((lead - 1) * 190 +
                                       (bite + 0x3F), indexes['gbk']);
      }
      if (bite === 0x0A) {
        hzgb2312 = false;
      }
      if (code_point === null) {
        return decoderError(fatal);
      }
      return code_point;
    }
    if (bite === 0x7E) {
      hzgb2312_lead = 0x7E;
      return null;
    }
    if (hzgb2312) {
      if (inRange(bite, 0x20, 0x7F)) {
        hzgb2312_lead = bite;
        return null;
      }
      if (bite === 0x0A) {
        hzgb2312 = false;
      }
      return decoderError(fatal);
    }
    if (inRange(bite, 0x00, 0x7F)) {
      return bite;
    }
    return decoderError(fatal);
  };
}

/** @param {{fatal: boolean}} options */
name_to_encoding['hz-gb-2312'].getDecoder = function(options) {
  return new HZGB2312Decoder(options);
};

//
// 11. Legacy multi-byte Chinese (traditional) encodings
//

// 11.1 big5

/**
 * @constructor
 * @param {{fatal: boolean}} options
 */
function Big5Decoder(options) {
  var fatal = options.fatal;
  var /** @type {number} */ big5_lead = 0x00,
      /** @type {?number} */ big5_pending = null;

  /**
   * @param {ByteInputStream} byte_pointer The byte steram to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    // NOTE: Hack to support emitting two code points
    if (big5_pending !== null) {
      var pending = big5_pending;
      big5_pending = null;
      return pending;
    }
    var bite = byte_pointer.get();
    if (bite === EOF_byte && big5_lead === 0x00) {
      return EOF_code_point;
    }
    if (bite === EOF_byte && big5_lead !== 0x00) {
      big5_lead = 0x00;
      return decoderError(fatal);
    }
    byte_pointer.offset(1);
    if (big5_lead !== 0x00) {
      var lead = big5_lead;
      var pointer = null;
      big5_lead = 0x00;
      var offset = bite < 0x7F ? 0x40 : 0x62;
      if (inRange(bite, 0x40, 0x7E) || inRange(bite, 0xA1, 0xFE)) {
        pointer = (lead - 0x81) * 157 + (bite - offset);
      }
      if (pointer === 1133) {
        big5_pending = 0x0304;
        return 0x00CA;
      }
      if (pointer === 1135) {
        big5_pending = 0x030C;
        return 0x00CA;
      }
      if (pointer === 1164) {
        big5_pending = 0x0304;
        return 0x00EA;
      }
      if (pointer === 1166) {
        big5_pending = 0x030C;
        return 0x00EA;
      }
      var code_point = (pointer === null) ? null :
          indexCodePointFor(pointer, indexes['big5']);
      if (pointer === null) {
        byte_pointer.offset(-1);
      }
      if (code_point === null) {
        return decoderError(fatal);
      }
      return code_point;
    }
    if (inRange(bite, 0x00, 0x7F)) {
      return bite;
    }
    if (inRange(bite, 0x81, 0xFE)) {
      big5_lead = bite;
      return null;
    }
    return decoderError(fatal);
  };
}

/** @param {{fatal: boolean}} options */
name_to_encoding['big5'].getDecoder = function(options) {
  return new Big5Decoder(options);
};


//
// 12. Legacy multi-byte Japanese encodings
//

// 12.1 euc.jp

/**
 * @constructor
 * @param {{fatal: boolean}} options
 */
function EUCJPDecoder(options) {
  var fatal = options.fatal;
  var /** @type {number} */ eucjp_first = 0x00,
      /** @type {number} */ eucjp_second = 0x00;
  /**
   * @param {ByteInputStream} byte_pointer The byte stream to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    var bite = byte_pointer.get();
    if (bite === EOF_byte) {
      if (eucjp_first === 0x00 && eucjp_second === 0x00) {
        return EOF_code_point;
      }
      eucjp_first = 0x00;
      eucjp_second = 0x00;
      return decoderError(fatal);
    }
    byte_pointer.offset(1);

    var lead, code_point;
    if (eucjp_second !== 0x00) {
      lead = eucjp_second;
      eucjp_second = 0x00;
      code_point = null;
      if (inRange(lead, 0xA1, 0xFE) && inRange(bite, 0xA1, 0xFE)) {
        code_point = indexCodePointFor((lead - 0xA1) * 94 + bite - 0xA1,
                                       indexes['jis0212']);
      }
      if (!inRange(bite, 0xA1, 0xFE)) {
        byte_pointer.offset(-1);
      }
      if (code_point === null) {
        return decoderError(fatal);
      }
      return code_point;
    }
    if (eucjp_first === 0x8E && inRange(bite, 0xA1, 0xDF)) {
      eucjp_first = 0x00;
      return 0xFF61 + bite - 0xA1;
    }
    if (eucjp_first === 0x8F && inRange(bite, 0xA1, 0xFE)) {
      eucjp_first = 0x00;
      eucjp_second = bite;
      return null;
    }
    if (eucjp_first !== 0x00) {
      lead = eucjp_first;
      eucjp_first = 0x00;
      code_point = null;
      if (inRange(lead, 0xA1, 0xFE) && inRange(bite, 0xA1, 0xFE)) {
        code_point = indexCodePointFor((lead - 0xA1) * 94 + bite - 0xA1,
                                       indexes['jis0208']);
      }
      if (!inRange(bite, 0xA1, 0xFE)) {
        byte_pointer.offset(-1);
      }
      if (code_point === null) {
        return decoderError(fatal);
      }
      return code_point;
    }
    if (inRange(bite, 0x00, 0x7F)) {
      return bite;
    }
    if (bite === 0x8E || bite === 0x8F || (inRange(bite, 0xA1, 0xFE))) {
      eucjp_first = bite;
      return null;
    }
    return decoderError(fatal);
  };
}

/** @param {{fatal: boolean}} options */
name_to_encoding['euc-jp'].getDecoder = function(options) {
  return new EUCJPDecoder(options);
};

// 12.2 iso-2022-jp

/**
 * @constructor
 * @param {{fatal: boolean}} options
 */
function ISO2022JPDecoder(options) {
  var fatal = options.fatal;
  /** @enum */
  var state = {
    ASCII: 0,
    escape_start: 1,
    escape_middle: 2,
    escape_final: 3,
    lead: 4,
    trail: 5,
    Katakana: 6
  };
  var /** @type {number} */ iso2022jp_state = state.ASCII,
      /** @type {boolean} */ iso2022jp_jis0212 = false,
      /** @type {number} */ iso2022jp_lead = 0x00;
  /**
   * @param {ByteInputStream} byte_pointer The byte stream to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    var bite = byte_pointer.get();
    if (bite !== EOF_byte) {
      byte_pointer.offset(1);
    }
    switch (iso2022jp_state) {
      default:
      case state.ASCII:
        if (bite === 0x1B) {
          iso2022jp_state = state.escape_start;
          return null;
        }
        if (inRange(bite, 0x00, 0x7F)) {
          return bite;
        }
        if (bite === EOF_byte) {
          return EOF_code_point;
        }
        return decoderError(fatal);

      case state.escape_start:
        if (bite === 0x24 || bite === 0x28) {
          iso2022jp_lead = bite;
          iso2022jp_state = state.escape_middle;
          return null;
        }
        if (bite !== EOF_byte) {
          byte_pointer.offset(-1);
        }
        iso2022jp_state = state.ASCII;
        return decoderError(fatal);

      case state.escape_middle:
        var lead = iso2022jp_lead;
        iso2022jp_lead = 0x00;
        if (lead === 0x24 && (bite === 0x40 || bite === 0x42)) {
          iso2022jp_jis0212 = false;
          iso2022jp_state = state.lead;
          return null;
        }
        if (lead === 0x24 && bite === 0x28) {
          iso2022jp_state = state.escape_final;
          return null;
        }
        if (lead === 0x28 && (bite === 0x42 || bite === 0x4A)) {
          iso2022jp_state = state.ASCII;
          return null;
        }
        if (lead === 0x28 && bite === 0x49) {
          iso2022jp_state = state.Katakana;
          return null;
        }
        if (bite === EOF_byte) {
          byte_pointer.offset(-1);
        } else {
          byte_pointer.offset(-2);
        }
        iso2022jp_state = state.ASCII;
        return decoderError(fatal);

      case state.escape_final:
        if (bite === 0x44) {
          iso2022jp_jis0212 = true;
          iso2022jp_state = state.lead;
          return null;
        }
        if (bite === EOF_byte) {
          byte_pointer.offset(-2);
        } else {
          byte_pointer.offset(-3);
        }
        iso2022jp_state = state.ASCII;
        return decoderError(fatal);

      case state.lead:
        if (bite === 0x0A) {
          iso2022jp_state = state.ASCII;
          return decoderError(fatal, 0x000A);
        }
        if (bite === 0x1B) {
          iso2022jp_state = state.escape_start;
          return null;
        }
        if (bite === EOF_byte) {
          return EOF_code_point;
        }
        iso2022jp_lead = bite;
        iso2022jp_state = state.trail;
        return null;

      case state.trail:
        iso2022jp_state = state.lead;
        if (bite === EOF_byte) {
          return decoderError(fatal);
        }
        var code_point = null;
        var pointer = (iso2022jp_lead - 0x21) * 94 + bite - 0x21;
        if (inRange(iso2022jp_lead, 0x21, 0x7E) &&
            inRange(bite, 0x21, 0x7E)) {
          code_point = (iso2022jp_jis0212 === false) ?
              indexCodePointFor(pointer, indexes['jis0208']) :
              indexCodePointFor(pointer, indexes['jis0212']);
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;

      case state.Katakana:
        if (bite === 0x1B) {
          iso2022jp_state = state.escape_start;
          return null;
        }
        if (inRange(bite, 0x21, 0x5F)) {
          return 0xFF61 + bite - 0x21;
        }
        if (bite === EOF_byte) {
          return EOF_code_point;
        }
        return decoderError(fatal);
    }
  };
}

/** @param {{fatal: boolean}} options */
name_to_encoding['iso-2022-jp'].getDecoder = function(options) {
  return new ISO2022JPDecoder(options);
};

// 12.3 shift_jis

/**
 * @constructor
 * @param {{fatal: boolean}} options
 */
function ShiftJISDecoder(options) {
  var fatal = options.fatal;
  var /** @type {number} */ shiftjis_lead = 0x00;
  /**
   * @param {ByteInputStream} byte_pointer The byte stream to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    var bite = byte_pointer.get();
    if (bite === EOF_byte && shiftjis_lead === 0x00) {
      return EOF_code_point;
    }
    if (bite === EOF_byte && shiftjis_lead !== 0x00) {
      shiftjis_lead = 0x00;
      return decoderError(fatal);
    }
    byte_pointer.offset(1);
    if (shiftjis_lead !== 0x00) {
      var lead = shiftjis_lead;
      shiftjis_lead = 0x00;
      if (inRange(bite, 0x40, 0x7E) || inRange(bite, 0x80, 0xFC)) {
        var offset = (bite < 0x7F) ? 0x40 : 0x41;
        var lead_offset = (lead < 0xA0) ? 0x81 : 0xC1;
        var code_point = indexCodePointFor((lead - lead_offset) * 188 +
                                           bite - offset, indexes['jis0208']);
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }
      byte_pointer.offset(-1);
      return decoderError(fatal);
    }
    if (inRange(bite, 0x00, 0x80)) {
      return bite;
    }
    if (inRange(bite, 0xA1, 0xDF)) {
      return 0xFF61 + bite - 0xA1;
    }
    if (inRange(bite, 0x81, 0x9F) || inRange(bite, 0xE0, 0xFC)) {
      shiftjis_lead = bite;
      return null;
    }
    return decoderError(fatal);
  };
}

/** @param {{fatal: boolean}} options */
name_to_encoding['shift_jis'].getDecoder = function(options) {
  return new ShiftJISDecoder(options);
};

//
// 13. Legacy multi-byte Korean encodings
//

// 13.1 euc-kr

/**
 * @constructor
 * @param {{fatal: boolean}} options
 */
function EUCKRDecoder(options) {
  var fatal = options.fatal;
  var /** @type {number} */ euckr_lead = 0x00;
  /**
   * @param {ByteInputStream} byte_pointer The byte stream to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    var bite = byte_pointer.get();
    if (bite === EOF_byte && euckr_lead === 0) {
      return EOF_code_point;
    }
    if (bite === EOF_byte && euckr_lead !== 0) {
      euckr_lead = 0x00;
      return decoderError(fatal);
    }
    byte_pointer.offset(1);
    if (euckr_lead !== 0x00) {
      var lead = euckr_lead;
      var pointer = null;
      euckr_lead = 0x00;

      if (inRange(lead, 0x81, 0xC6)) {
        var temp = (26 + 26 + 126) * (lead - 0x81);
        if (inRange(bite, 0x41, 0x5A)) {
          pointer = temp + bite - 0x41;
        } else if (inRange(bite, 0x61, 0x7A)) {
          pointer = temp + 26 + bite - 0x61;
        } else if (inRange(bite, 0x81, 0xFE)) {
          pointer = temp + 26 + 26 + bite - 0x81;
        }
      }

      if (inRange(lead, 0xC7, 0xFD) && inRange(bite, 0xA1, 0xFE)) {
        pointer = (26 + 26 + 126) * (0xC7 - 0x81) + (lead - 0xC7) * 94 +
            (bite - 0xA1);
      }

      var code_point = (pointer === null) ? null :
          indexCodePointFor(pointer, indexes['euc-kr']);
      if (pointer === null) {
        byte_pointer.offset(-1);
      }
      if (code_point === null) {
        return decoderError(fatal);
      }
      return code_point;
    }

    if (inRange(bite, 0x00, 0x7F)) {
      return bite;
    }

    if (inRange(bite, 0x81, 0xFD)) {
      euckr_lead = bite;
      return null;
    }

    return decoderError(fatal);
  };
}

/** @param {{fatal: boolean}} options */
name_to_encoding['euc-kr'].getDecoder = function(options) {
  return new EUCKRDecoder(options);
};


//
// 14. Legacy miscellaneous encodings
//

// 14.1 replacement

// Not needed - API throws TypeError

// 14.2 utf-16

/**
 * @constructor
 * @param {boolean} utf16_be True if big-endian, false if little-endian.
 * @param {{fatal: boolean}} options
 */
function UTF16Decoder(utf16_be, options) {
  var fatal = options.fatal;
  var /** @type {?number} */ utf16_lead_byte = null,
      /** @type {?number} */ utf16_lead_surrogate = null;
  /**
   * @param {ByteInputStream} byte_pointer The byte stream to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    var bite = byte_pointer.get();
    if (bite === EOF_byte && utf16_lead_byte === null &&
        utf16_lead_surrogate === null) {
      return EOF_code_point;
    }
    if (bite === EOF_byte && (utf16_lead_byte !== null ||
                              utf16_lead_surrogate !== null)) {
      return decoderError(fatal);
    }
    byte_pointer.offset(1);
    if (utf16_lead_byte === null) {
      utf16_lead_byte = bite;
      return null;
    }
    var code_point;
    if (utf16_be) {
      code_point = (utf16_lead_byte << 8) + bite;
    } else {
      code_point = (bite << 8) + utf16_lead_byte;
    }
    utf16_lead_byte = null;
    if (utf16_lead_surrogate !== null) {
      var lead_surrogate = utf16_lead_surrogate;
      utf16_lead_surrogate = null;
      if (inRange(code_point, 0xDC00, 0xDFFF)) {
        return 0x10000 + (lead_surrogate - 0xD800) * 0x400 +
            (code_point - 0xDC00);
      }
      byte_pointer.offset(-2);
      return decoderError(fatal);
    }
    if (inRange(code_point, 0xD800, 0xDBFF)) {
      utf16_lead_surrogate = code_point;
      return null;
    }
    if (inRange(code_point, 0xDC00, 0xDFFF)) {
      return decoderError(fatal);
    }
    return code_point;
  };
}

/** @param {{fatal: boolean}} options */
name_to_encoding['utf-16be'].getDecoder = function(options) {
  return new UTF16Decoder(true, options);
};

/** @param {{fatal: boolean}} options */
name_to_encoding['utf-16le'].getDecoder = function(options) {
  return new UTF16Decoder(false, options);
};

// 14.5 x-user-defined
// TODO: Implement this encoding.

// NOTE: currently unused
/**
 * @param {string} label The encoding label.
 * @param {ByteInputStream} input_stream The byte stream to test.
 */
function detectEncoding(label, input_stream) {
  if (input_stream.match([0xFF, 0xFE])) {
    input_stream.offset(2);
    return 'utf-16le';
  }
  if (input_stream.match([0xFE, 0xFF])) {
    input_stream.offset(2);
    return 'utf-16be';
  }
  if (input_stream.match([0xEF, 0xBB, 0xBF])) {
    input_stream.offset(3);
    return 'utf-8';
  }
  return label;
}

exports.TextDecoder = TextDecoder;
exports.encodingExists = getEncoding;
