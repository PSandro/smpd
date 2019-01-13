module.exports.decode = function(length, packetId, packetReader, packetInfo) {

  console.log(
    `${packetInfo.name} Packet:
    Type: ${packetInfo.type}
    Bound: ${packetInfo.bound}

    Length: ${length}
    Packet ID: ${packetId}
    `);


  for (i = 0; i < packetInfo.fields.length; i++) {
    let field = packetInfo.fields[i];
    let name = field.name;
    var value;

    switch (field.value) {
      case "varint":
        value = packetReader.readVarint();
        break;
      case "ushort":
        value = packetReader.readUnsignedShort();
        break;
      case "string":
        value = packetReader.readString();
        break;
      default:
        throw "Type not found: " + field.value;
    }
    console.log(`    ${name}: ${value}`);
  }
  console.log();
}
