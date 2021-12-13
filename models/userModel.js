const {Schema, model, Types} = require('mongoose')

const userScheme = new Schema({
	email: {type: String, unique: true, required: true},
	password: {type: String, required: true},
	csvEmails: {type: Types.ObjectId, ref:'csv.files'},
	textMessage:{type:String},
	titleMessage:{type:String}
}, {versionKey: false});

module.exports = model('Users', userScheme)