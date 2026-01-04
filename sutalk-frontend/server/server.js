const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("message", (data) => {
    console.log("[서버] 메시지 수신:", data.text);
    socket.broadcast.emit("message", data); // 발신자 제외 브로드캐스트
  });
});

server.listen(5000, () => {
  console.log("서버가 http://localhost:5000에서 실행 중입니다.");
});
