import fs from 'fs'
import path from 'path'
import express from 'express'

const FILE_PATH =  './files'

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
require('dotenv').config()

app.use('/files', express.static('files'))
app.use(express.json())

io.on('connection', (socket: any) => {
  socket.on('message', (user: string, text: string) => {
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
  socket.on('questions', () => {
    const questions = getQuestions()
    socket.emit('questions', questions)
  })
  socket.on('update', (i: number, text: string) => {
    const file = path.resolve(FILE_PATH, 'q' + ('00' + i ).slice(-2) + '.json')
    const question = {
      no: i,
      text
    }
    try {
      fs.writeFileSync(file, JSON.stringify(question, null, 2))
    } catch (e: any) {
      throw new Error(e)
    }

    const questions = getQuestions()
    socket.emit('questions', questions)
  })
})

http.listen(process.env.PORT, () => {
  console.info('socket io listening port: ', process.env.PORT)
})

export default {
  path: '/api/',
  handler: app,
}

function getQuestions() {
  const questions: any = []
  const files = fs.readdirSync(FILE_PATH)
  if (typeof files === 'undefined') return
  files.forEach((f) => {
    if (fs.statSync(path.resolve(FILE_PATH, f)).isDirectory()) return true
    if (path.extname(f) !== '.json') return true
    const json = path.resolve(FILE_PATH, f)
    if (!fs.existsSync(json)) return true
    const question = JSON.parse(fs.readFileSync(json, 'utf8'))
    questions.push(question)
  })
  return questions
}
