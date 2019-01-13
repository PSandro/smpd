const data = require('./protocols/404.json');
const decoder = require('./decoder');
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

module.exports.find = function(length, packetId, packetReader) {
  let nodes = jp.nodes(data, `$..${"id"+packetId}`);
  for (var i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    let path = node.path;

    let packet = node.value;
    let name = packet.name;
    let fields = packet.fields;

    let type = path[1];
    let bound = path[2];

    let packetInfo = new PacketInfo(type, bound, packetId, name, fields);

    decoder.decode(length, packetId, packetReader, packetInfo); //TODO test decode
    return;
  }
  console.log(
    `Unknown Packet:
    length: ${length}
    packetId: ${packetId}
    `);

}
