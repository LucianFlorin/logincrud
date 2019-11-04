const bcrypt = require('bcrypt');

const Helper = {

    hashPassword(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
    },

    comparePassword(hashPassword, password) {
        return bcrypt.compareSync(password, hashPassword);
    },
};

module.exports = {
    hashPassword: Helper.hashPassword,
    comparePassword: Helper.comparePassword
}

;