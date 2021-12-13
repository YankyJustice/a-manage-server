const {Schema, model, Types} = require('mongoose')

const mailingScheme = new Schema({
	user: {type: Types.ObjectId, ref:'Users', required: true},
	mailTo: {type:Array, required: true},
	textMessage:{type:String},
	titleMessage:{type:String}
}, {versionKey: false});

module.exports = model('mailingLists', mailingScheme)