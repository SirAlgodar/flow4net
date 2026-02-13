const wifi = require('node-wifi');

wifi.init({
    iface: null
});

console.log('Testing node-wifi...');

wifi.getCurrentConnections()
    .then(connections => {
        console.log('Connections:', connections);
    })
    .catch(error => {
        console.error('Error:', error);
    });
