import express from 'express'
import io from '../app.js'
import messageModel from '../dao/models/message.model.js'

const router = express.Router()

router.get('/', (req, res) => {

    io.on('connection', socket => {
        console.log('New websocket connection')

        socket.on('chatMessage', async (obj) => {
            io.emit('message', obj)
            const newMessage = await messageModel.create({user: obj.user, message: obj.msg})
            console.log({ status: "success", payload: newMessage })
        })
    })
    res.render('chat', {})
})

export default router