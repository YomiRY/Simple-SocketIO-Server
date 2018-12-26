
const mongo = require('mongodb');
const assert = require('assert');
const utils = require('../utils_packs/utils');

const server = 'localhost:27017';
const user = encodeURIComponent('user1');
const pwd = encodeURIComponent('user1');
const authMechanism = 'DEFAULT';
const url = `mongodb://${user}:${pwd}@${server}/?authMechanism=${authMechanism}&authSource=admin`;
const chatDB = 'ChatDB';
const roomInfoCollection = 'RoomInfo';
const messageInfoCollection = 'MessageInfo';
const usernfoCollection = 'RoomInfo';

const client = new mongo.MongoClient(url);
let mongo_client = null;


function connect(callback) {
    client.connect(null).then(db => {
        mongo_client = db;

        console.log(mongo_client);
        if (callback) {
            callback(true);
        }
    }, err => {
        console.log(err);

        mongo_client = null;
        if (callback) {
            callback(true);
        }
    });
}

function createNewRoomId(callback) {
    let new_room_id = utils.generateUUID();

    mongo_client.db(chatDB).collection(roomInfoCollection).insertOne({ room_id: new_room_id }).then(res => {
        callback(new_room_id)
    }, err => {
        callback(null);
    });
}

function updateRoomInfo(room_info, callback) {
    mongo_client.db(chatDB)
        .collection(roomInfoCollection)
        .updateOne({ "room_id": room_info.room_id }
        , { $set: room_info})
        .then(res => {
            console.log("[LOG:] update room info successfully, result = " + res);
            if (res.result.ok) {
                callback(true);
            } else {
                console.log("[LOG:] update room info fail, room_info = " + room_info);
                callback(false);
            }

        }, err => {
            console.log("[LOG:] update room info fail, err = " + err);
            callback(false);
        });
}

function isConnected() {
    return mongo_client != null;
}

module.exports.isConnected = isConnected;
module.exports.connect = connect;
module.exports.createNewRoomId = createNewRoomId;
module.exports.updateRoomInfo = updateRoomInfo;

// module.exports.isClosed() = function() {
//     return mongo_client != null;
// }

// module.exports.createRoom = function (roomId, members) {

//     if (roomId) {

//     } else {
//         //[TODO:] roomId is null, but members is not null
//     }

//     return mongo_client.connect(url);
// }

