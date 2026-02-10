const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('b9f6fc19-8d1e-4390-80f5-00ba134c4aca.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
});
