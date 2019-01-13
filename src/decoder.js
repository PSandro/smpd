module.exports.Decoder = class {

  constructor(length, packetId, packetReader, packetInfo) {
    this.length = length;
    this.packetId = packetId;
    this.packetReader = packetReader;
    this.packetInfo = packetInfo;
    this.values = [];
  }

  decode() {
    try {
      for (var i = 0; i < this.packetInfo.fields.length; i++) {
        let field = this.packetInfo.fields[i];
        let name = field.name;
        var value = {
          value: "undefined",
          size: 0
        };

        switch (field.value) {
          case "varint":
            value = this.packetReader.readVarint();
            break;
          case "ushort":
            value = this.packetReader.readUnsignedShort();
            break;
          case "string":
            value = this.packetReader.readString();
            break;
          default:
            throw "Type not found: " + field.value;
        }
        this.values[i] = {
          name,
          value
        };

      }
      return true;
    } catch (err) {
      this.packetReader.reset();
      return false;
    }


  }

  display() {
    console.log(
      `${this.packetInfo.name} Packet:
      Type: ${this.packetInfo.type}
      Bound: ${this.packetInfo.bound}

      Length (${this.length.size}B): ${this.length.value}B
      PacketID (${this.packetId.size}B): ${this.packetId.value}
      `);
    this.values.forEach(function(entry) {
      console.log(`      ${entry.name} (${entry.value.size}B): ${entry.value.value}`);
    })

    console.log();
  }
}
