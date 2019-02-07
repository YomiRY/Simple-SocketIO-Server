// [TODO:] Current only one room, Need a DB (V)
// [TODO:] Need to use function to create unique room id(V)
// [TODO:] check duplicate user info(V)

// Message Type: {-1: Not a Normal message type, 0: Event Message, 1: Text Message, 2: Image Message, 3: Video Message:, 4: File Message}
// Event Response Type: {-1: Not a Normal event type, 0: Connected, 1:Create Room, 2: Join Room, 3: Leave Room, 4: Invite member}
// Room Type: {-1: Not a normal room, 0: single chat room, 1:multiple chat room}

const fs = require('fs');
//const app = require('express')();
const utils = require('./utils_packs/utils');
const debug = require('./utils_packs/debug');
const dbmgr = require('./db_packs/dbmgr');
const options = {
    // key: fs.readFileSync('d:\\NodeJsWorkSpace\\SocketIo\\file.pem'),
    // cert: fs.readFileSync('d:\\NodeJsWorkSpace\\SocketIo\\file.crt')
    key: fs.readFileSync('./file.pem'),
    cert: fs.readFileSync('./file.crt')
};
//const server = require('https').createServer(options, app);
const server = require('https').createServer(options);
const io = require('socket.io')(server);
const debug_tag = 'socketio_server.js';
// [TODO:] Always use same room id temporarily
var room_id;
// const socket_map = new Map();

// [TODO:] Time millionseconds need to sync with NTP server

// Use websocket only
// io.set('transports', ['websocket']);

// Connect to MongoDB
dbmgr.connect((is_connected) => {
    if (!is_connected) {        
        debug.log(debug_tag, '[LOG:] DB connect fail...');
    } else {
        debug.log(debug_tag, '[LOG:] DB connect success...');

        io.on('connection', (socket) => {
            let token = socket.handshake.query.auth_token;
            
            debug.log(debug_tag, "[LOG:] " + token + " connected");
            debug.log(debug_tag, "[LOG:] Auth_Token = " + token);

            socket.on('disconnect', () => {                
                debug.log(debug_tag, '[LOG:] ' + token + ' disconnected from ' + room_id);
            });

            socket.on('create-room', (room_type, user_info_json_str) => {
                // [TODO:] Check exist room for same members                
                //dbmgr.find_same_member_room(room_type, user_info_json_ary_str);
                var room_info = {
                    "room_id": room_id,
                    "room_type": room_type,
                    "unread_count": 0,
                    "user_ids": [],
                    "last_message_timestamp": -1,
                    "last_message": ""
                };

                if (!room_id) {
                    dbmgr.create_new_room_id((new_room_id) => {
                        if (!new_room_id) {
                            return;
                        }

                        room_id = new_room_id;
                        room_info.room_id = new_room_id;
                        //[TODO:] Need to sync room member list
                        dbmgr.update_room_info(room_info, (is_update_roominfo_success) => {
                            if (!is_update_roominfo_success) {
                                return;
                            }

                            socket.emit('create-room-success', room_info);
                        });
                    });
                } else {
                    dbmgr.query_room_info(room_id, (is_query_success, result) => {
                        if (!is_query_success || !result) {
                            return;
                        }

                        room_info = result;
                        socket.emit('create-room-success', room_info);
                    });
                }

            });

            // socket.on('invite_member', (target_room_id, member_info_json_ary_str) => {
            //     const member_info_json_ary = JSON.parse(member_info_json_ary_str);

            //     if (!member_info_json_ary) {
            //         return;
            //     }

            //     for (var member_info of member_info_json_ary) {
            //         dbmgr.query_user_info(member_info, (is_success, user_info) => {
            //             if (is_success) {
            //                 user_info.room_ids.push(target_room_id);
            //                 dbmgr.update_user_info(user_info);
            //             }
            //         });
            //     }
            // });

            socket.on('join-room', (target_room_id, user_info_json_str) => {
                socket.join(target_room_id, () => {
                    let user_info = JSON.parse(user_info_json_str);
                    let eventMsg = {
                        "room_id": room_id,
                        "message_type": 0,
                        "event_response_type": 2,
                        "message_time": new Date().getTime,
                        "message": user_info_json_str
                    }

                    dbmgr.query_room_info(target_room_id, (is_query_success, result) => {
                        if (!is_query_success) {
                            return;
                        }

                        let room_info = result;
                        if (!room_info.user_ids.includes(user_info.user_id)) {
                            room_info.user_ids.push(user_info.user_id);
                            dbmgr.update_room_info(room_info);

                            if (!user_info.room_ids.includes(target_room_id)) {
                                user_info.room_ids.push(target_room_id);
                                dbmgr.update_user_info(user_info);
                            }
                            io.sockets.in(room_id).emit('receive-message', eventMsg);
                        }
                        socket.emit('join-room-success', room_info);                        
                        debug.log(debug_tag, '[LOG:] ' + token + ' join room successfully.');
                    });                                        
                });
            })

            socket.on('leave-room', (room_id, user_id) => {                
                debug.log(debug_tag, '[LOG:] ' + token + ' leave room ' + room_id);

                dbmgr.query_user_info({ "user_id": user_id }, (is_query_success, result) => {
                    if (!is_query_success) {
                        return;
                    }
                    
                    let user_info = result;
                    let index = user_info.room_ids.indexOf(room_id);
                    if (index != -1) {
                        user_info.room_ids.splice(index, 1);
                        dbmgr.update_user_info(user_info);
                    }
                    delete user_info._id;

                    var eventMsg = {
                        "room_id": room_id,
                        "message_type": 0,
                        "event_response_type": 3,
                        "message_time": new Date().getTime,
                        "message": JSON.stringify(user_info)
                    }

                    dbmgr.query_room_info(room_id, (is_query_success, result) => {
                        if (!result) {
                            return;
                        }
    
                        let room_info = result
                        let index = room_info.user_ids.indexOf(user_info.user_id);
                        if (index != -1) {
                            room_info.user_ids.splice(index, 1);
                            dbmgr.update_room_info(room_info);
                        }
                    });    
                    io.sockets.in(room_id).emit('receive-message', eventMsg);
                })                
                
                socket.leave(room_id);
            })

            socket.on('send-message', (msgInfoJsonStr) => {
                //var msgInfoObj = JSON.parse(msgInfoJsonStr);
                
                debug.log(debug_tag, '[LOG:] ' + token + ' send message ' + msgInfoJsonStr);
                io.sockets.in(room_id).emit('receive-message', msgInfoJsonStr);
            })
        });
        server.listen(8081, () => {            
            debug.log(debug_tag, '[LOG:] Server listening...');
        });
    }
});

