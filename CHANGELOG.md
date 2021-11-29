# Changelog

Major changes since the last busboy release (0.31):

# 1.0.0 - TBD, 2021

* TypeScript types are now included in the package itself (#13)
* Non-deprecated Buffer creation is used (#8, #10)
* Error on non-number limit rather than ignoring (#7)
* Dicer is now part of the busboy itself and not an external dependency (#14)
* Tests were converted to Mocha (#11, #12, #22, #23)
* Empty filenames of parts are handled as `undefined` (#26)
