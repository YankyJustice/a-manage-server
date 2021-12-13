const Router = require('express')
const {sendMessage, sendCSV, saveDraft,uploadDraft, getAllMailing} = require('../controllers/messagesController')
const multer = require('multer')
const upload = multer({ dest: `csv/` , mimetype:'csv'})

const messagesRouter = Router()
module.exports = messagesRouter

messagesRouter.post('/csv',upload.single('csv'), sendCSV)
messagesRouter.post('/send', sendMessage)
messagesRouter.post('/saveDraft',upload.single('csv'), saveDraft)
messagesRouter.get('/uploadDraft', uploadDraft)
messagesRouter.get('/allMailing', getAllMailing)