let fs = require('fs');
const csv = require('csv-parser')
const nodemailer = require("nodemailer");
const gridFS = require("mongoose-gridfs");
const User = require('../models/userModel')
const MailingLists = require('../models/mailingListsModel')


const sendCSV = async (req, res) => {
	try {
		const filepath = req.file.path;
		const readStream = fs.createReadStream(filepath);
		let csvData = [];
		readStream.pipe(csv({separator: ';'}))
			.on('data', function (csvrow) {
				csvData.push(csvrow);
			})
			.on('end', function () {
				fs.unlinkSync(filepath)
				res.status(200).json({responseCode: 0, mailTo: csvData})
				return
			});
	} catch (e) {

		res.status(400).json(e)
		return
	}
}

const saveDraft = async (req, res) => {
	try {
		let filepath
		let csvFile
		if (req.file) {
			const bucketCSV = gridFS.createBucket({bucketName: 'csv'})
			filepath = req.file.path;
			const readStream = fs.createReadStream(filepath);
			csvFile = bucketCSV.writeFile({filename: req.file.filename}, readStream)
		}
		if (csvFile) {
			await User.findOneAndUpdate({email: req.body.user}, {
				textMessage: req.body.textMessage,
				csvEmails: csvFile.options.id,
				titleMessage:req.body.titleMessage
			})
		} else {
			await User.findOneAndUpdate(
				{email: req.body.user},
				{textMessage: req.body.textMessage, titleMessage:req.body.titleMessage}
			)
		}
		if (req.file) {
			fs.unlinkSync(filepath)
		}

		res.status(200).json({message: 'сохранено'})
		return
	} catch (e) {

		res.status(400).json(e)
		return
	}
}

const uploadDraft = async (req, res) => {
	try {
		let csvData = []
		const email = req.query.user
		const user = await User.findOne({email})
		const csvID = user.csvEmails
		const csvFiles = gridFS.createModel({bucketName: 'csv'});
		const file = await csvFiles.findById(csvID);
		if (file) {
			const readstream = file.read()
			readstream.pipe(csv({separator: ';'}))
				.on('data', function (csvrow) {
					csvData.push(csvrow);
				})
				.on('end', function () {
					res.status(200).json({mailTo: csvData, textMessage: user.textMessage, titleMessage: user.titleMessage})
					return
				});
		} else {
			res.status(200).json({textMessage: user.textMessage, titleMessage: user.titleMessage})
		}
	} catch (e) {
		res.status(400).json(e)
		return
	}
}

const sendMessage = async (req, res) => {
	try {
		const emails = req.body.mailTo.map(item => item.email)
		const user = req.body.user
		const textMessage = req.body.textMessage
		const titleMessage = req.body.titleMessageValue
		let transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'qwe371509@gmail.com',
				pass: 'qwezxc112',
			},
		});

		await transporter.sendMail({
			from: `${user} <omar@gmail.com>`, // sender address
			to: emails, // list of receivers
			subject: titleMessage, // Subject line
			text: textMessage, // plain text body
		}, async (err, result) => {
			if (!err){
				const userFromDB = await User.findOne({email:user})
				const mailing = new MailingLists({textMessage, titleMessage, mailTo:req.body.mailTo, user:userFromDB._id})
				await mailing.save()
			}
		});

		res.status(200).json({responseCode: 0, message: 'Неправильный логин или пароль'})
		return
	} catch (e) {

		res.status(400).json(e)
		return
	}
}

const getAllMailing = async (req, res) => {
	try {
		const mailingLists = await MailingLists.find({}).populate('user')
		const mailingListsWithMap = mailingLists.map(item=>{
			return{
				titleMessage:item.titleMessage,
				from:item.user.email
			}
		})
		res.status(200).json(mailingListsWithMap)
		return
	} catch (e) {
		res.status(400).json(e)
		return
	}
}


module.exports = {sendMessage, sendCSV, saveDraft, uploadDraft, getAllMailing}