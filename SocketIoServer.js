const fs = require('fs');
const app = require('express')();
const options = {
    key: fs.readFileSync('d:\\NodeJsWorkSpace\\SocketIo\\file.pem'),
    cert: fs.readFileSync('d:\\NodeJsWorkSpace\\SocketIo\\file.crt')
};
const server = require('https').createServer(options, app);
const io = require('socket.io')(server);

// [TODO:] Current only one room, Need a DB
var roomUserMap = new Map();

// [TODO:] Need to create unique room id
var roomId = '1'

// Use websocket only
// io.set('transports', ['websocket']);

// Message Type: {-1: Not a Normal message type, 0: Event Message, 1: Text Message, 2: Image Message, 3: Video Message:, 4: File Message}
// Event Response Type: {-1: Not a Normal event type, 0: Connected, 1:Create Room, 2: Join Room, 3: Leave Room}
// Room Type: {-1: Not a normal room, 0: single chat room, 1:multiple chat room}

io.on('connection', (socket) => {
    var token = socket.handshake.query.auth_token;
    console.log(token + " connected");
    console.log("Auth_Token = " + token);

    socket.on('disconnect', () => {
        socket.emit('leave-room', roomId);
        console.log(socket.handshake.query.auth_token + ' disconnected');
    });

    socket.on('create-room', () => {
        // [TODO:] Check exist room for same members
        // [TODO:] Time millionseconds need to sync with NTP server
        var currentTimeMillions = new Date().getTime();

        socket.emit('create-room-success', roomId);
    })

    socket.on('join-room', (roomId, userInfoJsonStr) => {
        socket.join(roomId, () => {
            let rooms = Object.values(socket.rooms);
            let currentTimeMillions = new Date().getTime;
            let userInfo = JSON.parse(userInfoJsonStr);

            if (!roomUserMap.has(userInfo.user_id)) {
                roomUserMap.set(userInfo.user_id, userInfo);
            }
            let roomUserInfoJsonAryStr = JSON.stringify(Array.from(roomUserMap.values()));

            var eventMsg = {
                "room_id": roomId,
                "message_type": 0,
                "event_response_type": 2,
                "message_time": currentTimeMillions,
                "message": roomUserInfoJsonAryStr
            }

            socket.emit('join-room-success', roomId);
            io.sockets.in(roomId).emit('receive-message', eventMsg);
        });
    })

    socket.on('leave-room', (roomId, userInfoJsonStr) => {
        let currentTimeMillions = new Date().getTime;
        let userInfo = JSON.parse(userInfoJsonStr);

        if (roomUserMap.has(userInfo.user_id)) {
            roomUserMap.delete(userInfo.user_id);
        }
        let roomUserInfoJsonAryStr = JSON.stringify(Array.from(roomUserMap.values()));

        var eventMsg = {
            "room_id": roomId,
            "message_type": 0,
            "event_response_type": 3,
            "message_time": currentTimeMillions,
            "message": roomUserInfoJsonAryStr
        }

        io.sockets.in(roomId).emit('receive-message', eventMsg);
        socket.leave(roomId);
    })

    socket.on('send-message', (msgInfoJsonStr) => {
        var msgInfoObj = JSON.parse(msgInfoJsonStr);
        var roomId = msgInfoObj.room_id;

        io.sockets.in(roomId).emit('receive-message', msgInfoJsonStr);
    })
});
server.listen(3000, () => {
    console.log("Server listening...")
});