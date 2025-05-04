// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("使用者連線");

  socket.on("chat-message", (msg) => {
    io.emit("chat-message", msg); // 廣播訊息給所有人
  });

  socket.on("disconnect", () => {
    console.log("使用者離線");
  });
});

server.listen(3000, () => {
  console.log("後端伺服器啟動在 http://localhost:3000");
});
