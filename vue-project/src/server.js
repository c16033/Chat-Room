// server.js
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

io.on('connection', (socket) => {
  console.log('🟢 連線')

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg) // 廣播給所有連線的用戶
  })

  socket.on('disconnect', () => {
    console.log('🔴 離線')
  })
})

server.listen(3000, () => {
  console.log('✅ Server listening on http://localhost:3000')
})
