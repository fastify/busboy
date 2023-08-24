'use strict'

const Busboy = require('../lib/main')
const { test } = require('tap')

test('busboy-constructor - should throw an Error if no options are provided', t => {
  t.plan(1)

  t.throws(() => new Busboy(), new Error('Busboy expected an options-Object.'))
})

test('busboy-constructor - should throw an Error if options does not contain headers', t => {
  t.plan(1)

  t.throws(() => new Busboy({}), new Error('Busboy expected an options-Object with headers-attribute.'))
})

test('busboy-constructor - if busboy is called without new-operator, still creates a busboy instance', t => {
  t.plan(1)

  const busboyInstance = Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })
  t.type(busboyInstance, Busboy)
})

test('busboy-constructor - should throw an Error if content-type is not set', t => {
  t.plan(1)

  t.throws(() => new Busboy({ headers: {} }), new Error('Missing Content-Type-header.'))
})

test('busboy-constructor - should throw an Error if content-type is unsupported', t => {
  t.plan(1)

  t.throws(() => new Busboy({ headers: { 'content-type': 'unsupported' } }), new Error('Unsupported Content-Type.'))
})

test('busboy-constructor - should not throw an Error if content-type is urlencoded', t => {
  t.plan(1)

  t.doesNotThrow(() => new Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } }))
})

test('busboy-constructor - if busboy is called without stream options autoDestroy is set to false', t => {
  t.plan(1)

  const busboyInstance = Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })
  t.equal(busboyInstance._writableState.autoDestroy, false)
})

test('busboy-constructor - if busboy is called with invalid value for stream option highWaterMark we should throw', t => {
  t.plan(1)

  t.throws(() => Busboy({ highWaterMark: 'not_allowed_value_for_highWaterMark', headers: { 'content-type': 'application/x-www-form-urlencoded' } }), new Error('not_allowed_value_for_highWaterMark'))
})

test('busboy-constructor - if busboy is called with stream options and autoDestroy:true, autoDestroy should be set to true', t => {
  t.plan(1)

  const busboyInstance = Busboy({ autoDestroy: true, headers: { 'content-type': 'application/x-www-form-urlencoded' } })
  t.equal(busboyInstance._writableState.autoDestroy, true)
})

test('busboy-constructor - busboy should be initialized with private attribute _done set as false', t => {
  t.plan(1)

  const busboyInstance = Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })
  t.equal(busboyInstance._done, false)
})

test('busboy-constructor - busboy should be initialized with private attribute _finished set as false', t => {
  t.plan(1)

  const busboyInstance = Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })
  t.equal(busboyInstance._finished, false)
})
