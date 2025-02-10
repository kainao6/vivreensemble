const bcrypt = require('bcrypt');

bcrypt.hash('Vivreensemble2013@', 10, (err, hash) => {
    if (err) throw err;
    console.log('Hash du mot de passe:', hash);
});
