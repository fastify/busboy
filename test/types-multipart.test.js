'use strict'

const Busboy = require('..')

const { test } = require('tap')
const { inspect } = require('util')

const EMPTY_FN = function () {
}

const tests = [
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file_name_0"',
        '',
        'super alpha file',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file_name_1"',
        '',
        'super beta file',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
        'Content-Type: application/octet-stream',
        '',
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_1"; filename="1k_b.dat"',
        'Content-Type: application/octet-stream',
        '',
        'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    expected: [
      ['field', 'file_name_0', 'super alpha file', false, false, '7bit', 'text/plain'],
      ['field', 'file_name_1', 'super beta file', false, false, '7bit', 'text/plain'],
      ['file', 'upload_file_0', 1023, 0, '1k_a.dat', '7bit', 'application/octet-stream'],
      ['file', 'upload_file_1', 1023, 0, '1k_b.dat', '7bit', 'application/octet-stream']
    ],
    what: 'Fields and files',
    plan: 11
  },
  {
    source: [
      ['------WebKitFormBoundaryTB2MiQ36fnSJlrhY',
        'Content-Disposition: form-data; name="cont"',
        '',
        'some random content',
        '------WebKitFormBoundaryTB2MiQ36fnSJlrhY',
        'Content-Disposition: form-data; name="pass"',
        '',
        'some random pass',
        '------WebKitFormBoundaryTB2MiQ36fnSJlrhY',
        'Content-Disposition: form-data; name="bit"',
        '',
        '2',
        '------WebKitFormBoundaryTB2MiQ36fnSJlrhY--'
      ].join('\r\n')
    ],
    boundary: '----WebKitFormBoundaryTB2MiQ36fnSJlrhY',
    expected: [
      ['field', 'cont', 'some random content', false, false, '7bit', 'text/plain'],
      ['field', 'pass', 'some random pass', false, false, '7bit', 'text/plain'],
      ['field', 'bit', '2', false, false, '7bit', 'text/plain']
    ],
    what: 'Fields only',
    plan: 6
  },
  {
    source: [
      ''
    ],
    boundary: '----WebKitFormBoundaryTB2MiQ36fnSJlrhY',
    expected: [],
    shouldError: 'Unexpected end of multipart data',
    what: 'No fields and no files',
    plan: 3
  },
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file_name_0"',
        '',
        'super alpha file',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    limits: {
      fileSize: 13,
      fieldSize: 5
    },
    expected: [
      ['field', 'file_name_0', 'super', false, true, '7bit', 'text/plain'],
      ['file', 'upload_file_0', 13, 2, '1k_a.dat', '7bit', 'application/octet-stream']
    ],
    what: 'Fields and files (limits)',
    plan: 7
  },
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    limits: {
      fields: 0
    },
    events: ['file'],
    expected: [
      ['file', 'upload_file_0', 26, 0, '1k_a.dat', '7bit', 'application/octet-stream']
    ],
    what: 'should not emit fieldsLimit if no field was sent',
    plan: 6
  },
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file_name_0"',
        '',
        'super alpha file',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    limits: {
      fields: 0
    },
    events: ['file', 'fieldsLimit'],
    expected: [
      ['file', 'upload_file_0', 26, 0, '1k_a.dat', '7bit', 'application/octet-stream']
    ],
    what: 'should respect fields limit of 0',
    plan: 6
  },
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file_name_0"',
        '',
        'super alpha file',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file_name_1"',
        '',
        'super beta file',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    limits: {
      fields: 1
    },
    events: ['field', 'file', 'fieldsLimit'],
    expected: [
      ['field', 'file_name_0', 'super alpha file', false, false, '7bit', 'text/plain'],
      ['file', 'upload_file_0', 26, 0, '1k_a.dat', '7bit', 'application/octet-stream']
    ],
    what: 'should respect fields limit of 7',
    plan: 7
  },
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file_name_0"',
        '',
        'super alpha file',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    limits: {
      files: 0
    },
    events: ['field'],
    expected: [
      ['field', 'file_name_0', 'super alpha file', false, false, '7bit', 'text/plain']
    ],
    what: 'should not emit filesLimit if no file was sent',
    plan: 4
  },
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file_name_0"',
        '',
        'super alpha file',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    limits: {
      files: 0
    },
    events: ['field', 'filesLimit'],
    expected: [
      ['field', 'file_name_0', 'super alpha file', false, false, '7bit', 'text/plain']
    ],
    what: 'should respect fields limit of 0',
    plan: 4
  },
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file_name_0"',
        '',
        'super alpha file',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_b"; filename="1k_b.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    limits: {
      files: 1
    },
    events: ['field', 'file', 'filesLimit'],
    expected: [
      ['field', 'file_name_0', 'super alpha file', false, false, '7bit', 'text/plain'],
      ['file', 'upload_file_0', 26, 0, '1k_a.dat', '7bit', 'application/octet-stream']
    ],
    what: 'should respect fields limit of 1',
    plan: 7
  },
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file_name_0"',
        '',
        'super alpha file',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file_name_1"',
        '',
        'super beta file',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
        'Content-Type: application/octet-stream',
        '',
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_1"; filename="1k_b.dat"',
        'Content-Type: application/octet-stream',
        '',
        'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    expected: [
      ['field', 'file_name_0', 'super alpha file', false, false, '7bit', 'text/plain'],
      ['field', 'file_name_1', 'super beta file', false, false, '7bit', 'text/plain']
    ],
    events: ['field'],
    what: 'Fields and (ignored) files',
    plan: 5
  },
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="/tmp/1k_a.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_1"; filename="C:\\files\\1k_b.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_2"; filename="relative/1k_c.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    expected: [
      ['file', 'upload_file_0', 26, 0, '1k_a.dat', '7bit', 'application/octet-stream'],
      ['file', 'upload_file_1', 26, 0, '1k_b.dat', '7bit', 'application/octet-stream'],
      ['file', 'upload_file_2', 26, 0, '1k_c.dat', '7bit', 'application/octet-stream']
    ],
    what: 'Files with filenames containing paths',
    plan: 12
  },
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="/absolute/1k_a.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_1"; filename="C:\\absolute\\1k_b.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_2"; filename="relative/1k_c.dat"',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    preservePath: true,
    expected: [
      ['file', 'upload_file_0', 26, 0, '/absolute/1k_a.dat', '7bit', 'application/octet-stream'],
      ['file', 'upload_file_1', 26, 0, 'C:\\absolute\\1k_b.dat', '7bit', 'application/octet-stream'],
      ['file', 'upload_file_2', 26, 0, 'relative/1k_c.dat', '7bit', 'application/octet-stream']
    ],
    what: 'Paths to be preserved through the preservePath option',
    plan: 12
  },
  {
    source: [
      ['------WebKitFormBoundaryTB2MiQ36fnSJlrhY',
        'Content-Disposition: form-data; name="cont"',
        'Content-Type: ',
        '',
        'some random content',
        '------WebKitFormBoundaryTB2MiQ36fnSJlrhY',
        'Content-Disposition: ',
        '',
        'some random pass',
        '------WebKitFormBoundaryTB2MiQ36fnSJlrhY--'
      ].join('\r\n')
    ],
    boundary: '----WebKitFormBoundaryTB2MiQ36fnSJlrhY',
    expected: [
      ['field', 'cont', 'some random content', false, false, '7bit', 'text/plain']
    ],
    what: 'Empty content-type and empty content-disposition',
    plan: 4
  },
  {
    config: {
      isPartAFile: (fieldName) => (fieldName !== 'upload_file_0')
    },
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="blob"',
        'Content-Type: application/json',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    expected: [
      ['field', 'upload_file_0', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', false, false, '7bit', 'application/json']
    ],
    what: 'Blob uploads should be handled as fields if isPartAFile is provided.',
    plan: 4
  },
  {
    config: {
      isPartAFile: (fieldName) => (fieldName !== 'upload_file_0')
    },
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="blob"',
        'Content-Type: application/json',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file"; filename*=utf-8\'\'n%C3%A4me.txt',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    expected: [
      ['field', 'upload_file_0', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', false, false, '7bit', 'application/json'],
      ['file', 'file', 26, 0, 'näme.txt', '7bit', 'application/octet-stream']
    ],
    what: 'Blob uploads should be handled as fields if isPartAFile is provided. Other parts should be files.',
    plan: 7
  },
  {
    config: {
      isPartAFile: (fieldName) => (fieldName === 'upload_file_0')
    },
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="upload_file_0"; filename="blob"',
        'Content-Type: application/json',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file"; filename*=utf-8\'\'n%C3%A4me.txt',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    expected: [
      ['file', 'upload_file_0', 26, 0, 'blob', '7bit', 'application/json'],
      ['field', 'file', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', false, false, '7bit', 'application/octet-stream']
    ],
    what: 'Blob uploads sould be handled as files if corresponding isPartAFile is provided. Other parts should be fields.',
    plan: 7
  },
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="file"; filename*=utf-8\'\'n%C3%A4me.txt',
        'Content-Type: application/octet-stream',
        '',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    expected: [
      ['file', 'file', 26, 0, 'näme.txt', '7bit', 'application/octet-stream']
    ],
    what: 'Unicode filenames',
    plan: 6
  },
  {
    source: [
      ['--asdasdasdasd\r\n',
        'Content-Type: text/plain\r\n',
        'Content-Disposition: form-data; name="foo"\r\n',
        '\r\n',
        'asd\r\n',
        '--asdasdasdasd--'
      ].join(':)')
    ],
    boundary: 'asdasdasdasd',
    expected: [],
    shouldError: 'Unexpected end of multipart data',
    what: 'Stopped mid-header',
    plan: 3
  },
  {
    source: [
      ['------WebKitFormBoundaryTB2MiQ36fnSJlrhY',
        'Content-Disposition: form-data; name="cont"',
        'Content-Type: application/json',
        '',
        '{}',
        '------WebKitFormBoundaryTB2MiQ36fnSJlrhY--'
      ].join('\r\n')
    ],
    boundary: '----WebKitFormBoundaryTB2MiQ36fnSJlrhY',
    expected: [
      ['field', 'cont', '{}', false, false, '7bit', 'application/json']
    ],
    what: 'content-type for fields',
    plan: 4
  },
  {
    source: [
      '------WebKitFormBoundaryTB2MiQ36fnSJlrhY--\r\n'
    ],
    boundary: '----WebKitFormBoundaryTB2MiQ36fnSJlrhY',
    expected: [],
    what: 'empty form',
    plan: 3
  },
  {
    source: [
      ['-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="field1"',
        'content-type: text/plain; charset=utf-8',
        '',
        'Aufklärung ist der Ausgang des Menschen aus seiner selbstverschuldeten Unmündigkeit.',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
        'Content-Disposition: form-data; name="field2"',
        'content-type: text/plain; charset=iso-8859-1',
        '',
        'sapere aude!',
        '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
      ].join('\r\n')
    ],
    boundary: '---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
    expected: [
      ['field', 'field1', 'Aufklärung ist der Ausgang des Menschen aus seiner selbstverschuldeten Unmündigkeit.', false, false, '7bit', 'text/plain'],
      ['field', 'field2', 'sapere aude!', false, false, '7bit', 'text/plain']
    ],
    what: 'Fields and files',
    plan: 5
  },
  {
    source: [[
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7',
      'Content-Disposition: form-data; name="regsubmit"',
      '',
      'yes',
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7',
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7',
      'Content-Disposition: form-data; name="referer"',
      '',
      'http://domainExample/./',
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7',
      'Content-Disposition: form-data; name="activationauth"',
      '',
      '',
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7',
      'Content-Disposition: form-data; name="seccodemodid"',
      '',
      'member::register',
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7--'].join('\r\n')
    ],
    boundary: '----WebKitFormBoundaryzca7IDMnT6QwqBp7',
    expected: [
      ['field', 'regsubmit', 'yes', false, false, '7bit', 'text/plain'],
      ['field', 'referer', 'http://domainExample/./', false, false, '7bit', 'text/plain'],
      ['field', 'activationauth', '', false, false, '7bit', 'text/plain'],
      ['field', 'seccodemodid', 'member::register', false, false, '7bit', 'text/plain']
    ],
    what: 'one empty part should get ignored',
    plan: 7
  },
  {
    source: [
      '    ------WebKitFormBoundaryTB2MiQ36fnSJlrhY--\r\n'
    ],
    boundary: '----WebKitFormBoundaryTB2MiQ36fnSJlrhY',
    expected: [],
    shouldError: 'Unexpected end of multipart data',
    what: 'empty form with preceding whitespace',
    plan: 3
  },
  {
    source: [
      '------WebKitFormBoundaryTB2MiQ36fnSJlrhY--\r\n'
    ],
    boundary: '----WebKitFormBoundaryTB2MiQ36fnSJlrhYY',
    expected: [],
    shouldError: 'Unexpected end of multipart data',
    what: 'empty form with wrong boundary (extra Y)',
    plan: 3
  },
  {
    source: [[
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7',
      'Content-Disposition: form-data; name="regsubmit"',
      '',
      'yes',
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7',
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7',
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7',
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7',
      'Content-Disposition: form-data; name="referer"',
      '',
      'http://domainExample/./',
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7',
      'Content-Disposition: form-data; name="activationauth"',
      '',
      '',
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7',
      'Content-Disposition: form-data; name="seccodemodid"',
      '',
      'member::register',
      '------WebKitFormBoundaryzca7IDMnT6QwqBp7--'].join('\r\n')
    ],
    boundary: '----WebKitFormBoundaryzca7IDMnT6QwqBp7',
    expected: [
      ['field', 'regsubmit', 'yes', false, false, '7bit', 'text/plain'],
      ['field', 'referer', 'http://domainExample/./', false, false, '7bit', 'text/plain'],
      ['field', 'activationauth', '', false, false, '7bit', 'text/plain'],
      ['field', 'seccodemodid', 'member::register', false, false, '7bit', 'text/plain']
    ],
    what: 'multiple empty parts should get ignored',
    plan: 7
  }
]

tests.forEach((v) => {
  test(v.what, t => {
    t.plan(v.plan)
    const busboy = new Busboy({
      ...v.config,
      limits: v.limits,
      preservePath: v.preservePath,
      headers: {
        'content-type': 'multipart/form-data; boundary=' + v.boundary
      }
    })
    let finishes = 0
    const results = []

    if (v.events === undefined || v.events.indexOf('field') > -1) {
      busboy.on('field', function (key, val, keyTrunc, valTrunc, encoding, contype) {
        results.push(['field', key, val, keyTrunc, valTrunc, encoding, contype])
      })
    }
    if (v.events === undefined || v.events.indexOf('file') > -1) {
      busboy.on('file', function (fieldname, stream, filename, encoding, mimeType) {
        let nb = 0
        const info = ['file',
          fieldname,
          nb,
          0,
          filename,
          encoding,
          mimeType]
        results.push(info)
        stream.on('data', function (d) {
          nb += d.length
        }).on('limit', function () {
          ++info[3]
        }).on('end', function () {
          info[2] = nb
          t.ok(typeof (stream.bytesRead) === 'number', 'file.bytesRead is missing')
          t.ok(stream.bytesRead === nb, 'file.bytesRead is not equal to filesize')
          if (stream.truncated) { ++info[3] }
        })
      })
    }
    busboy.on('finish', function () {
      t.ok(finishes++ === 0, 'finish emitted multiple times')
      t.equal(results.length,
        v.expected.length,
        'Parsed result count mismatch. Saw ' +
                    results.length +
                    '. Expected: ' + v.expected.length)

      results.forEach(function (result, i) {
        t.strictSame(result,
          v.expected[i],
          'Result mismatch:\nParsed: ' + inspect(result) +
                        '\nExpected: ' + inspect(v.expected[i])
        )
      })
      t.pass()
    }).on('error', function (err) {
      if (!v.shouldError || v.shouldError !== err.message) { t.error(err) }
    })

    v.source.forEach(function (s) {
      busboy.write(Buffer.from(s, 'utf8'), EMPTY_FN)
    })
    busboy.end()
  })
})
