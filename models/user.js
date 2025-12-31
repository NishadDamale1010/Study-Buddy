const mongoose = require("mongoose");

// 🔥 FIX: handle both default + direct export
const plm = require("passport-local-mongoose");
const passportLocalMongoose = plm.default || plm;

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
