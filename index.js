const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);
const dump = require('./src/packetdump');
const hexRegex = /^[0-9a-fA-F]{3,}$/;


rl.setPrompt('hex data> ');
rl.prompt();
rl.on('line', function(line) {
    if (line === 'quit' || line === 'exit' || line === 'bye') rl.close();
    console.log();
    if (hexRegex.test(line)) {
        dump.dump(line, function(message, answer) {
          rl.question(message, answer);
        });
    } else {
      console.log('Input is not a valid hex stream.\n');
    }

    rl.prompt();
}).on('close',function(){
    process.exit(0);
});
