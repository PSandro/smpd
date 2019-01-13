const packetfinder = require('./packetfinder');

const PacketInfo = packetfinder.PacketInfo;

class PacketReader {
  constructor(hex) {
    this.buffer = Buffer.from(hex, 'hex');
    this.actualLength = Buffer.byteLength(hex, 'hex');
  }

  readVarint() {
    var numRead = 0;
    var result = 0;
    var read = 0b00000000;

    do {
      if (this.actualLength < 1) return;
      read = this.buffer[numRead];

      var value = (read & 0b01111111);
      var result = result | (value << (7 * numRead));

      numRead++;
      this.actualLength--;
      if (numRead > 5) {
        throw "VarInt is too big";
      }

    } while ((read & 0b10000000) != 0);

    this.buffer = this.buffer.slice(numRead);
    return result;
  }

  readUnsignedShort() {
    if (this.actualLength < 2) return;
    var us = this.buffer.readUInt16BE();
    this.buffer = this.buffer.slice(2);
    this.actualLength -= 2;
    return us;
  }

  readString() {
    var size = this.readVarint();
    if (this.actualLength < size) return;
    var string = this.buffer.toString('utf8', 0, size);
    this.buffer = this.buffer.slice(size);
    this.actualLength -= size;
    return string;
  }

  checkLength(length) {
    return this.actualLength == length;
  }

}
module.exports.dump = function(hex) {
  let pr = new PacketReader(hex);

  let length = pr.readVarint();
  if (length < 2) {
    console.log('Packet size is too low.\n');
    return;
  }
  if (!pr.checkLength(length)) {
    console.log('Packet is lower/bigger than expected.\n');
    return;
  }

  let packetId = pr.readVarint();
  packetfinder.find(length, packetId, pr);

}
