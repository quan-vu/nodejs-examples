const prompt = require('prompt');
var generator = require('generate-password');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 'MyPassword';
const salt = bcrypt.genSaltSync(saltRounds);
// const hash = bcrypt.hashSync(myPlaintextPassword, salt);

const properties = [
    {
        name: 'username',
        required: true,
        validator: /^[a-zA-Z0-9\_]+$/,
        warning: 'Username must be only letters, or underscore',
    },
    {
        name: 'password',
        description: 'password [Leave empty for random]',
        // hidden: true
    }
];

prompt.start();

prompt.get(properties, function (err, result) {
    if (err) { return onErr(err); }
    
    var password = result.password;
    if(password.trim() == ''){
        password = generator.generate({
            length: 10,
            numbers: true,
            uppercase: true,
            lowercase: true,
        });
    }

    console.log('Command-line input received:');
    console.log('  Username: ' + result.username);
    console.log('  Password: ' + password);
    
    // Encrypt password
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            // Store hash in your password DB.
            console.log('  Encrypted password: ' + hash);
        });
    });
});

function onErr(err) {
    console.log(err);
    return 1;
}



