import fs from 'fs'
import path from 'path'
import express from 'express'

const FILE_DIR =  'files'

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
require('dotenv').config()

app.use('/' + FILE_DIR, express.static(FILE_DIR))
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
    const file = path.resolve(__dirname, FILE_DIR, 'q' + ('00' + i ).slice(-2) + '.json')
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

http.listen(process.env.PORT || 8080, () => {
  console.info('socket io listening port: ', process.env.PORT || 8080)
})

export default {
  path: '/api/',
  handler: app,
}

function getQuestions() {
  const questions: any = []
  const dir = path.resolve(__dirname, FILE_DIR)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  const files = fs.readdirSync(dir)
  if (typeof files === 'undefined') return
  files.forEach((f) => {
    if (fs.statSync(path.resolve(dir, f)).isDirectory()) return true
    if (path.extname(f) !== '.json') return true
    const json = path.resolve(dir, f)
    if (!fs.existsSync(json)) return true
    const question = JSON.parse(fs.readFileSync(json, 'utf8'))
    questions.push(question)
  })
  return questions
}
