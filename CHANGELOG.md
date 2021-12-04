# Changelog

Major changes since the last busboy release (0.3.1):

# 1.0.0 - TBD, 2021

* TypeScript types are now included in the package itself (#13)
* Non-deprecated Buffer creation is used (#8, #10)
* Error on non-number limit rather than ignoring (#7)
* Dicer is now part of the busboy itself and not an external dependency (#14)
* Tests were converted to Mocha (#11, #12, #22, #23)
* Using the native TextDecoder and the package 'text-decoding' for fallback if nodejs does not support the requested encoding (#50)
* Add isPartAFile-option, to make the file-detection configurable (#53)
* Empty Parts will not hang the process (#55)
* FileStreams also provide the property `bytesRead` (#51)
* add and expose headerSize limit (#64)
