const data = require('./protocols/404.json');
const Decoder = require('./decoder').Decoder;
const index = require('../index');
const PacketReader = require('./packetreader').PacketReader;
const jp = require('jsonpath');

module.exports.packetTypes = {
  HANDSHAKING: "handshaking",
  PLAY: "play",
  STATUS: "status",
  LOGIN: "login"
}
module.exports.bound = {
  CLIENTBOUND: "clientbound",
  SERVERBOUND: "serverbound"
}

var PacketInfo = class PacketInfo {
  constructor(type, bound, id, name, fields) {
    this.type = type;
    this.bound = bound;
    this.id = id;
    this.name = name;
    this.fields = fields;
  }
}

module.exports.findStructure = function (packetId) {
  return jp.nodes(data, `$..${"id"+packetId.value}`);
}

module.exports.dump = function(hex, ask) {
  let pr = new PacketReader(hex);

  let length = pr.readVarint();
  let actualLength = Buffer.byteLength(hex, 'hex');
  if (length < 2) {
    console.log('Packet size is too low.\n');
    return;
  }
  if (!(actualLength-length.size === length.value)) {
    console.log('Packet is lower/bigger than expected.\n');
    return;
  }

  let packetId = pr.readVarint();
  pr.setResetPoint();
  this.find(length, packetId, pr, ask);

}

module.exports.find = function(length, packetId, packetReader, ask) {
  let nodes = jp.nodes(data, `$..${"id"+packetId.value}`);
  let validDecoders = [];

  for (var i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    let path = node.path;

    let packet = node.value;
    let name = packet.name;
    let fields = packet.fields;

    let type = path[1];
    let bound = path[2];

    let packetInfo = new PacketInfo(type, bound, packetId, name, fields);

    let decoder = new Decoder(length, packetId, packetReader, packetInfo);

    if (decoder.decode()) {
      validDecoders.push(decoder);
    }
    packetReader.reset();
  }

  if (validDecoders.length < 1) {
    console.log(
      `Unknown Packet:
    length: ${length}
    packetId: ${packetId}
    `);
  } else if (validDecoders.length === 1) {
    validDecoders[0].display();
  } else {
    pickDecoder(validDecoders, ask);
  }
}

function pickDecoder(decoders, ask) {
  var pickmessage = ["Pick one of the following decoders:\n"];
  for (var i = 0; i < decoders.length; i++) {
    var decoder = decoders[i];
    pickmessage[i + 1] = `  ${i+1}) ${decoder.packetInfo.name} (type=${decoder.packetInfo.type}, bound=${decoder.packetInfo.bound})`;
  }
  pickmessage.push("\n")
  pickmessage = pickmessage.join("\n");
  ask(pickmessage, function(answer) {
    if (isNaN(answer)) {
      console.log(`The input must be a number.`);
      return;
    }
    if (answer < 0 || answer > decoders.length) {
      console.log(`The input must be between 1 and ${decoders.length}`);
      return;
    }
    decoders[answer-1].display();

  });
}
