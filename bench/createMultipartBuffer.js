function createMultipartBuffer(boundary, size) {
  const head = '--' + boundary + '\r\n'
    + 'content-disposition: form-data; name="field1"\r\n'
    + '\r\n', tail = '\r\n--' + boundary + '--\r\n', buffer = Buffer.allocUnsafe(size);

  buffer.write(head, 0, 'ascii');
  buffer.write(tail, buffer.length - tail.length, 'ascii');
  return buffer;
}

exports.createMultipartBuffer = createMultipartBuffer;
