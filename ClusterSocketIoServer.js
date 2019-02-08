var roomId = '1';
var roomUserMap = new Map();
const cluster = require('cluster');

require('sticky-cluster')(
    // server initialization function    
    function (callback) {
        console.log('Work id = ' + cluster.worker.id);

        var fs = require('fs');
        var https = require('https');
        var app = require('express')();
        var options = {
            key: fs.readFileSync('d:\\NodeJsWorkSpace\\SocketIo\\file.pem'),
            cert: fs.readFileSync('d:\\NodeJsWorkSpace\\SocketIo\\file.crt')
        };
        var server = https.createServer(options, app); 
        var io = require('socket.io')(server);
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

        // configure an app
        // do some async stuff if needed

        // don't do server.listen(), just pass the server instance into the callback
        callback(server);
    },
    // options
    {
        concurrency: 2,
        port: 3000,
        debug: true,
        env: function (index) { return { stickycluster_worker_index: index }; }
    }
);