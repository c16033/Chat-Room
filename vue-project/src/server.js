// server.js
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

//建立一個 Express 應用程式（網頁伺服器）
const app = express()

//cors()：啟用 CORS（跨來源資源分享），讓不同來源（例如你前端是 localhost:5173）也能連線這個伺服器。
app.use(cors())

//用 Express 建立 HTTP 伺服器
const server = http.createServer(app)

//建立 Socket.IO 伺服器，並允許任何來源連線（origin: '*' 表示全部允許）。
const io = new Server(server, {
  cors: { origin: '*' }
})


// 👉 儲存歷史訊息
const chatHistory = []
 // 🔧 加一個 map: socket.id 對應到 userId
const userMap = {}

//當有用戶透過 Socket 連上來，會執行這個回呼函式
//socket 是這個用戶的連線對象，每個連進來的用戶都會觸發一次這個函式
io.on('connection', (socket) => {
  console.log('🟢 有人連線', socket.id)

  // 📌 監聽前端送來的 userId 並記錄
  socket.on('register', (userId) => {
    userMap[socket.id] = userId
    console.log(`✅ ${socket.id} 登記為使用者 ${userId}`)

  // 送出歷史訊息（這裡保留，等 register 完才會送）
  socket.emit('chat history', {
    history: chatHistory,
    selfId: socket.id,
  })
})

  // 接收訊息，存到歷史紀錄中
  socket.on('chat message', (msg) => {

    

    const newMsg = {
      ...msg,
      id: socket.id, // 記錄發送者是誰
      userId: userMap[socket.id] || msg.userId, // 優先使用後端記住的 userId
    }
    chatHistory.push(newMsg)
    io.emit('chat message', newMsg) // 廣播給所有人
  });

  socket.on('disconnect', () => {
    console.log('🔴 離線', socket.id)
    delete userMap[socket.id] // 清除記錄

  })
})


server.listen(5174, () => {
  console.log('✅ Server listening on http://localhost:5174')
})

