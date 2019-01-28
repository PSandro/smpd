const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);
const packetfinder = require('./src/packetfinder');
const hexRegex = /^[0-9a-fA-F]{3,}$/;


rl.setPrompt('>> ');
rl.prompt();
rl.on('line', function (line) {
    if (line === 'quit' || line === 'exit' || line === 'bye') rl.close();
    console.log();
    if (line.startsWith('find')) {
        let args = line.normalize().split(' ');
        if (args.length < 2) {
            console.log('Usage: find [packetID]');
        } else {
            let packetID = args[1];
            if (isNaN(packetID)) {
                console.log("Input is not a number!");
            } else {
                let number = parseInt(packetID);
                packetfinder.printStructure(number);
            }
            
        }
    } else if (line.startsWith('help')) {
        console.log(
            `Help:\n  - help            : show this help\n  - exit            : exit this app\n  - find [packetID] : find a packet by ID\n  - [hex]           : decode a packet by hex data
              `);
        
    } else if (hexRegex.test(line)) {
        packetfinder.dump(line);
    } else {
        console.log('Enter a valid hex stream. Write \'help\' for help\n');
    }

    rl.prompt();
}).on('close', function () {
    process.exit(0);
});


module.exports.readLine = rl;