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

let PacketInfo = class PacketInfo {
  constructor(type, bound, id, name, fields) {
    this.type = type;
    this.bound = bound;
    this.id = id;
    this.name = name;
    this.fields = fields;
  }
  display() {
    console.log(
      `${this.name} Packet:
      Type: ${this.type}
      Bound: ${this.bound}

      PacketID: ${this.id}
      `);
    this.fields.forEach(function (entry) {
      console.log(`      ${entry.name}: ${entry.value}`);
    })

  }
}

function getPacketInfo(node, packetId) {
    let path = node.path;
    
    let packet = node.value;
    let name = packet.name;
    let fields = packet.fields;

    let type = path[1];
    let bound = path[2];

    return new PacketInfo(type, bound, packetId, name, fields);
}

module.exports.findStructure = function (packetId) {
  let nodes = jp.nodes(data, `$..packet[?(@.id=='${this.toHexString(packetId)}')]`);
  return nodes;
}

module.exports.printStructure = function(packetId) {
  let nodes = this.findStructure(packetId);
  
  let packetInfos = [];

  for (var i = 0; i < nodes.length; i++) {
    packetInfos[i] = getPacketInfo(nodes[i], packetId);
  }

  if (packetInfos.length < 1) {
    console.log(
      `No Packet found for id ${packetId}`);
  } else if (packetInfos.length === 1) {
    packetInfos[0].display();
  } else {
    pickStructure(packetInfos);
  }

}

module.exports.dump = function(hex) {
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
  this.find(length, packetId, pr);

}

module.exports.find = function(length, packetId, packetReader) {
  let nodes = jp.nodes(data, `$..['${this.toHexString(packetId.value)}']`);
  let validDecoders = [];

  for (var i = 0; i < nodes.length; i++) {
    let node = nodes[i];

    let packetInfo = getPacketInfo(node, packetId.value);

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
    pickDecoder(validDecoders);
  }
}


function pickDecoder(decoders) {
  var pickmessage = ["Pick one of the following decoders:\n"];
  for (var i = 0; i < decoders.length; i++) {
    var decoder = decoders[i];
    pickmessage[i + 1] = `  ${i+1}) ${decoder.packetInfo.name} (type=${decoder.packetInfo.type}, bound=${decoder.packetInfo.bound})`;
  }
  pickmessage.push("\n")
  pickmessage = pickmessage.join("\n");
  pickmessage += "pick>";
  index.readLine.question(pickmessage, function(answer) {
    if (isNaN(answer)) {
      console.log(`The input must be a number.`);
      return;
    }
    if (answer < 0 || answer > decoders.length) {
      console.log(`The input must be between 1 and ${decoders.length}`);
      return;
    }
    decoders[answer-1].display();
    index.readLine.prompt();
  });
}

function pickStructure(structures) {
  var pickmessage = ["Pick one of the following structures:\n"];
  for (var i = 0; i < structures.length; i++) {
    var structure = structures[i];
    pickmessage[i + 1] = `  ${i+1}) ${structure.name} (type=${structure.type}, bound=${structure.bound})`;
  }
  pickmessage.push("\n")
  pickmessage = pickmessage.join("\n");
  pickmessage += "pick>";
  index.readLine.question(pickmessage, function(answer) {
    if (isNaN(answer)) {
      console.log(`The input must be a number.`);
      return;
    }
    if (answer < 0 || answer > structures.length) {
      console.log(`The input must be between 1 and ${structures.length}`);
      return;
    }
    structures[answer-1].display();
    index.readLine.prompt();
  });
}

module.exports.toHexString = function (number) {
  if (isNaN(number)) throw "Input is not a number";
  hexString = number.toString(16);
  if (hexString.length % 2) {
    hexString = '0' + hexString;
  }
  return '0x' + hexString;
}
