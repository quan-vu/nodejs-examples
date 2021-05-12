const prompt = require('prompt');
var generator = require('generate-password');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 'MyPassword';
const salt = bcrypt.genSaltSync(saltRounds);
// const hash = bcrypt.hashSync(myPlaintextPassword, salt);
var GENERATED_DATA = {
    'username': '',
    'password': '',
    'password_hash': '',
};

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


// Read and Update attribute in .env
const fs = require("fs");
const os = require("os");
const ENV_FILES = {
    '.env': '../.env',
    '.env.prod': '../.env.prod',
}

function setEnvValue(key, value, env_name='.env') {


    // read file from hdd & split if from a linebreak to a array
    const ENV_VARS = fs.readFileSync(ENV_FILES[env_name], "utf8").split(os.EOL);

    console.log(ENV_VARS);

    // find the env we want based on the key
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));

    // replace the key/value with the new value
    ENV_VARS.splice(target, 1, `${key}=${value}`);

    // write everything back to the file system
    fs.writeFileSync(ENV_FILES[env_name], ENV_VARS.join(os.EOL));

}

// Start read input from console
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

            // Update attribute in .env file
            GENERATED_DATA['username'] = result.username;
            GENERATED_DATA['password'] = password;
            GENERATED_DATA['password_hash'] = hash;
            
            setEnvValue("SOCKET_ADMIN_USER", GENERATED_DATA['username']);
            setEnvValue("SOCKET_ADMIN_PASSWORD_HASH", GENERATED_DATA['password_hash']);
        
        });
    });


});

function onErr(err) {
    console.log(err);
    return 1;
}




