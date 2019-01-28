module.exports.PacketReader = class PacketReader {
  constructor(hex) {
    var buffer = Buffer.from(hex, 'hex');
    this.buffer = buffer;
    this._buffer = buffer;
  }

  reset() {
    this.buffer = this._buffer;
  }

  setResetPoint() {
    this._buffer = this.buffer;
  }

  readVarint() {
    var numRead = 0;
    var result = 0;
    var read = 0b00000000;

    do {
      read = this.buffer[numRead];

      var value = (read & 0b01111111);
      var result = result | (value << (7 * numRead));

      numRead++;
      if (numRead > 5) {
        throw "VarInt is too big";
      }

    } while ((read & 0b10000000) != 0);

    this.buffer = this.buffer.slice(numRead);
    return {
      value: result,
      size: numRead
    };
  }

  readUnsignedShort() {
    var us = this.buffer.readUInt16BE();
    this.buffer = this.buffer.slice(2);
    return {
      value: us,
      size: 2
    };
  }

  readString() {
    var size = this.readVarint();
    var string = this.buffer.toString('utf8', 0, size.value);
    this.buffer = this.buffer.slice(size.value);
    return {
      value: string,
      size: size.value + size.size
    };
  }
}