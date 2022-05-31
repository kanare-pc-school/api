import express from 'express'

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
require('dotenv').config()

app.use(express.json())

io.on('connection', (socket: any) => {
  socket.on('message', (user: string, text: string) => {
    console.info('aaaa', text)
    io.emit('message', user, text)
  })
  socket.on('question', (question: string) => {
    io.emit('question', question)
  })
  socket.on('trash', () => {
    io.emit('trash')
  })
  socket.on('visible', (visible: boolean) => {
    io.emit('visible', visible)
  })
  socket.on('mode', (mode: string) => {
    io.emit('mode', mode)
  })
  socket.on('marking', (text: string) => {
    io.emit('marking', text)
  })
  socket.on('logout', () => {
    io.emit('logout')
  })
})

http.listen(process.env.API_PORT, () => console.info('running...', process.env.API_PORT))
