/* eslint-disable import-x/no-duplicates */
/* eslint-disable no-new */
import BusboyDefault, { Busboy, BusboyFileStream } from '.'
import { expect } from 'tstyche'
import BusboyESM from '.'

expect(new BusboyESM({ headers: { 'content-type': 'foo' } })).type.toBe<
  InstanceType<typeof Busboy>
>()
expect(new Busboy({ headers: { 'content-type': 'foo' } })).type.toBe<
  InstanceType<typeof Busboy>
>()

// @ts-expect-error Argument of type '{}' is not assignable to parameter of type 'BusboyConfig'.
new BusboyDefault({})
const busboy = BusboyDefault({ headers: { 'content-type': 'foo' } })
new BusboyDefault({ headers: { 'content-type': 'foo' } })
new BusboyDefault({ headers: { 'content-type': 'foo' }, highWaterMark: 1000 })
new BusboyDefault({ headers: { 'content-type': 'foo' }, fileHwm: 1000 })
new BusboyDefault({ headers: { 'content-type': 'foo' }, defCharset: 'utf8' })
new BusboyDefault({ headers: { 'content-type': 'foo' }, preservePath: true })
new BusboyDefault({
  headers: { 'content-type': 'foo' },
  limits: { fieldNameSize: 200 }
})
new BusboyDefault({
  headers: { 'content-type': 'foo' },
  limits: { fieldSize: 200 }
})
new BusboyDefault({
  headers: { 'content-type': 'foo' },
  limits: { fields: 200 }
})
new BusboyDefault({
  headers: { 'content-type': 'foo' },
  limits: { fileSize: 200 }
})
new BusboyDefault({
  headers: { 'content-type': 'foo' },
  limits: { files: 200 }
})
new BusboyDefault({
  headers: { 'content-type': 'foo' },
  limits: { parts: 200 }
})
new BusboyDefault({
  headers: { 'content-type': 'foo' },
  limits: { headerPairs: 200 }
})
new BusboyDefault({
  headers: { 'content-type': 'foo' },
  limits: { headerSize: 200 }
})
new BusboyDefault({
  headers: { 'content-type': 'foo' },
  isPartAFile: (fieldName, contentType, fileName) =>
    fieldName === 'my-special-field' || fileName !== 'not-so-special.txt'
})
new BusboyDefault({
  headers: { 'content-type': 'foo' },
  isPartAFile: (fieldName, contentType, fileName) => fileName !== undefined
})

busboy.addListener('file', (fieldname, file, filename, encoding, mimetype) => {
  expect(fieldname).type.toBe<string>()
  expect(file).type.toBe<BusboyFileStream>()
  expect(filename).type.toBe<string>()
  expect(encoding).type.toBe<string>()
  expect(mimetype).type.toBe<string>()
})
busboy.addListener(
  'field',
  (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expect(fieldname).type.toBe<string>()
    expect(val).type.toBe<string>()
    expect(fieldnameTruncated).type.toBe<boolean>()
    expect(valTruncated).type.toBe<boolean>()
    expect(encoding).type.toBe<string>()
    expect(mimetype).type.toBe<string>()
  }
)
busboy.addListener('partsLimit', () => {})
busboy.addListener('filesLimit', () => {})
busboy.addListener('fieldsLimit', () => {})
busboy.addListener('error', (e) => {
  expect(e).type.toBe<unknown>()
})
busboy.addListener('finish', () => {})
// test fallback
busboy.on('foo', (foo) => {
  expect(foo).type.toBe<any>()
})
busboy.on(Symbol('foo'), (foo) => {
  expect(foo).type.toBe<any>()
})

busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
  expect(fieldname).type.toBe<string>()
  expect(file).type.toBe<BusboyFileStream>()
  expect(filename).type.toBe<string>()
  expect(encoding).type.toBe<string>()
  expect(mimetype).type.toBe<string>()
})
busboy.on(
  'field',
  (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expect(fieldname).type.toBe<string>()
    expect(val).type.toBe<string>()
    expect(fieldnameTruncated).type.toBe<boolean>()
    expect(valTruncated).type.toBe<boolean>()
    expect(encoding).type.toBe<string>()
    expect(mimetype).type.toBe<string>()
  }
)
busboy.on('partsLimit', () => {})
busboy.on('filesLimit', () => {})
busboy.on('fieldsLimit', () => {})
busboy.on('error', (e) => {
  expect(e).type.toBe<unknown>()
})
busboy.on('finish', () => {})
// test fallback
busboy.on('foo', (foo) => {
  expect(foo).type.toBe<any>()
})
busboy.on(Symbol('foo'), (foo) => {
  expect(foo).type.toBe<any>()
})

busboy.once('file', (fieldname, file, filename, encoding, mimetype) => {
  expect(fieldname).type.toBe<string>()
  expect(file).type.toBe<BusboyFileStream>()
  expect(filename).type.toBe<string>()
  expect(encoding).type.toBe<string>()
  expect(mimetype).type.toBe<string>()
})
busboy.once(
  'field',
  (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expect(fieldname).type.toBe<string>()
    expect(val).type.toBe<string>()
    expect(fieldnameTruncated).type.toBe<boolean>()
    expect(valTruncated).type.toBe<boolean>()
    expect(encoding).type.toBe<string>()
    expect(mimetype).type.toBe<string>()
  }
)
busboy.once('partsLimit', () => {})
busboy.once('filesLimit', () => {})
busboy.once('fieldsLimit', () => {})
busboy.once('error', (e) => {
  expect(e).type.toBe<unknown>()
})
busboy.once('finish', () => {})
// test fallback
busboy.once('foo', (foo) => {
  expect(foo).type.toBe<any>()
})
busboy.once(Symbol('foo'), (foo) => {
  expect(foo).type.toBe<any>()
})

busboy.removeListener(
  'file',
  (fieldname, file, filename, encoding, mimetype) => {
    expect(fieldname).type.toBe<string>()
    expect(file).type.toBe<BusboyFileStream>()
    expect(filename).type.toBe<string>()
    expect(encoding).type.toBe<string>()
    expect(mimetype).type.toBe<string>()
  }
)
busboy.removeListener(
  'field',
  (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expect(fieldname).type.toBe<string>()
    expect(val).type.toBe<string>()
    expect(fieldnameTruncated).type.toBe<boolean>()
    expect(valTruncated).type.toBe<boolean>()
    expect(encoding).type.toBe<string>()
    expect(mimetype).type.toBe<string>()
  }
)
busboy.removeListener('partsLimit', () => {})
busboy.removeListener('filesLimit', () => {})
busboy.removeListener('fieldsLimit', () => {})
busboy.removeListener('error', (e) => {
  expect(e).type.toBe<unknown>()
})
busboy.removeListener('finish', () => {})
// test fallback
busboy.removeListener('foo', (foo) => {
  expect(foo).type.toBe<any>()
})
busboy.removeListener(Symbol('foo'), (foo) => {
  expect(foo).type.toBe<any>()
})

busboy.off('file', (fieldname, file, filename, encoding, mimetype) => {
  expect(fieldname).type.toBe<string>()
  expect(file).type.toBe<BusboyFileStream>()
  expect(filename).type.toBe<string>()
  expect(encoding).type.toBe<string>()
  expect(mimetype).type.toBe<string>()
})
busboy.off(
  'field',
  (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expect(fieldname).type.toBe<string>()
    expect(val).type.toBe<string>()
    expect(fieldnameTruncated).type.toBe<boolean>()
    expect(valTruncated).type.toBe<boolean>()
    expect(encoding).type.toBe<string>()
    expect(mimetype).type.toBe<string>()
  }
)
busboy.off('partsLimit', () => {})
busboy.off('filesLimit', () => {})
busboy.off('fieldsLimit', () => {})
busboy.off('error', (e) => {
  expect(e).type.toBe<unknown>()
})
busboy.off('finish', () => {})
// test fallback
busboy.off('foo', (foo) => {
  expect(foo).type.toBe<any>()
})
busboy.off(Symbol('foo'), (foo) => {
  expect(foo).type.toBe<any>()
})

busboy.prependListener(
  'file',
  (fieldname, file, filename, encoding, mimetype) => {
    expect(fieldname).type.toBe<string>()
    expect(file).type.toBe<BusboyFileStream>()
    expect(filename).type.toBe<string>()
    expect(encoding).type.toBe<string>()
    expect(mimetype).type.toBe<string>()
  }
)
busboy.prependListener(
  'field',
  (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expect(fieldname).type.toBe<string>()
    expect(val).type.toBe<string>()
    expect(fieldnameTruncated).type.toBe<boolean>()
    expect(valTruncated).type.toBe<boolean>()
    expect(encoding).type.toBe<string>()
    expect(mimetype).type.toBe<string>()
  }
)
busboy.prependListener('partsLimit', () => {})
busboy.prependListener('filesLimit', () => {})
busboy.prependListener('fieldsLimit', () => {})
busboy.prependListener('error', (e) => {
  expect(e).type.toBe<unknown>()
})
busboy.prependListener('finish', () => {})
// test fallback
busboy.prependListener('foo', (foo) => {
  expect(foo).type.toBe<any>()
})
busboy.prependListener(Symbol('foo'), (foo) => {
  expect(foo).type.toBe<any>()
})

busboy.prependOnceListener(
  'file',
  (fieldname, file, filename, encoding, mimetype) => {
    expect(fieldname).type.toBe<string>()
    expect(file).type.toBe<BusboyFileStream>()
    expect(filename).type.toBe<string>()
    expect(encoding).type.toBe<string>()
    expect(mimetype).type.toBe<string>()
  }
)
busboy.prependOnceListener(
  'field',
  (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    expect(fieldname).type.toBe<string>()
    expect(val).type.toBe<string>()
    expect(fieldnameTruncated).type.toBe<boolean>()
    expect(valTruncated).type.toBe<boolean>()
    expect(encoding).type.toBe<string>()
    expect(mimetype).type.toBe<string>()
  }
)
busboy.prependOnceListener('partsLimit', () => {})
busboy.prependOnceListener('filesLimit', () => {})
busboy.prependOnceListener('fieldsLimit', () => {})
busboy.prependOnceListener('error', (e) => {
  expect(e).type.toBe<unknown>()
})
busboy.prependOnceListener('finish', () => {})
// test fallback
busboy.prependOnceListener('foo', (foo) => {
  expect(foo).type.toBe<any>()
})
busboy.prependOnceListener(Symbol('foo'), (foo) => {
  expect(foo).type.toBe<any>()
})
