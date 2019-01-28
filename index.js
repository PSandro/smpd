const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);
const packetfinder = require('./src/packetfinder');
const hexRegex = /^[0-9a-fA-F]{3,}$/;


rl.setPrompt('hex data> ');
rl.prompt();
rl.on('line', function(line) {
    if (line === 'quit' || line === 'exit' || line === 'bye') rl.close();
    console.log();
    if (line === 'find') {
        let args = line.normalize().split(' ');
        if (args.length < 2) {
            console.log('Usage: find [packetID]');
        } else {
            let packetID = args[1];
        }
    }
    else if (hexRegex.test(line)) {
        packetfinder.dump(line, function(message, answer) {
          rl.question(message, answer);
        });
    } else {
      console.log('Input is not a valid hex stream.\n');
    }

    rl.prompt();
}).on('close',function(){
    process.exit(0);
});
