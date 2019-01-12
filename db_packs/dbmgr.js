
const mongo = require('mongodb');
const assert = require('assert');
const utils = require('../utils_packs/utils');

const server = 'localhost:27017';
const user = encodeURIComponent('user1');
const pwd = encodeURIComponent('user1');
const authMechanism = 'DEFAULT';
const url = `mongodb://${user}:${pwd}@${server}/?authMechanism=${authMechanism}&authSource=admin`;
const chat_db_name = 'ChatDB';
var db;
const room_info_collection = 'RoomInfo';
const message_info_collection = 'MessageInfo';
const user_info_connection = 'UserInfo';

const client = new mongo.MongoClient(url);
let mongo_client = null;

function initIndex() {
    console.log('[LOG:] >>> initIndex, init mongo db index');
    try {
        db.collection(room_info_collection).createIndex({ "room_id": 1 }, (err, result) => {
            console.log("room_info_collection index: " + result);
        });

        db.collection(user_info_connection).createIndex({ "user_id": 1 }, (err, result) => {
            console.log("user_info_connection index: " + result);
        });

        db.collection(message_info_collection).createIndex({ "message_time": -1 }, (err, result) => {
            console.log("message_info_collection index: " + result);
        });
    } finally {
        console.log('[LOG:] <<< initIndex, init mongo db index');
    }
}

function connect(callback) {
    client.connect(null).then(client => {
        mongo_client = client;
        db = mongo_client.db(chat_db_name);

        console.log(mongo_client);
        initIndex();
        if (callback) {
            callback(true);
        }
    }, err => {
        console.log(err);

        mongo_client = null;
        if (callback) {
            callback(false);
        }
    });
}

function create_new_room_id(callback) {
    let new_room_id = utils.generateUUID();

    mongo_client.db(chat_db_name).collection(room_info_collection).insertOne({ room_id: new_room_id }).then(res => {
        callback(new_room_id)
    }, err => {
        callback(null);
    });
}

function update_room_info(room_info, callback) {
    mongo_client.db(chat_db_name)
        .collection(room_info_collection)
        .updateOne({ "room_id": room_info.room_id }
            , { $set: room_info })
        .then(res => {
            if (!callback) {
                return;
            }

            if (res.result.ok) {
                callback(true);
            } else {
                callback(false);
            }
        }, err => {
            if (!callback) {
                return;
            }

            callback(false);
        });
}

function query_room_info(room_id, callback) {
    mongo_client.db(chat_db_name)
        .collection(room_info_collection)
        .findOne({ "room_id": room_id }, { fields: { "_id": 0 } })
        .then(res => {
            if (res) {
                callback(true, res);
            } else {
                callback(false, null);
            }
        }, err => {
            callback(false, null);
        })
}

function find_same_member_room(room_type, user_info_json_ary_str, callback) {
    mongo_client.db(chat_db_name)
        .collection(room_info_collection)
        .findOne({ 'user_info_list': { $all: JSON.parse(user_info_json_ary_str) }, 'room_type': room_type }, { fields: { "_id": 0 } })
        .then(res => {
            console.log();
        }, err => {
            console.log();
        });
}

function query_user_info(user_info, callback) {
    let user_id = user_info.user_id;

    if (user_id) {
        return mongo_client.db(chat_db_name)
            .collection(user_info_connection)
            .findOne({ 'user_id': user_info.user_id }, { fields: { "_id": 0 } })
            .then(res => {
                callback(true, res);
            }, err => {
                callback(false, null);
            });
    } else {
        return mongo_client.db(chat_db_name)
            .collection(user_info_connection)
            .findOne({ 'user_name': user_info.user_name, 'user_pwd': user_info.user_pwd }, { fields: { "_id": 0 } })
            .then(res => {
                callback(true, res);
            }, err => {
                callback(false, null);
            });
    }
}

function query_all_user_info_list(callback) {
    mongo_client.db(chat_db_name).collection(user_info_connection).find({}).toArray((err, res) => {
        if (err) {
            callback(false, null);
        } else {
            callback(true, res);
        }
    });
}

function update_user_info(user_info, callback) {
    mongo_client.db(chat_db_name).collection(user_info_connection).updateOne({ "user_id": user_info.user_id }, { $set: user_info }).then(res => {
        if (!callback) {
            return;
        }
        callback(true, res);
    }, err => {
        if (!callback) {
            return;
        }
        callback(false, null);
    });
}

function create_user_info(user_info, callback) {
    user_info.user_id = utils.generateUUID();

    mongo_client.db(chat_db_name).collection(user_info_connection).save(user_info).then(res => {
        callback(true, user_info);
    }, err => {
        callback(false, null);
    });
}

function is_connected() {
    return mongo_client != null;
}

module.exports.find_same_member_room = find_same_member_room;
module.exports.query_user_info = query_user_info;
module.exports.query_all_user_info_list = query_all_user_info_list;
module.exports.update_user_info = update_user_info;
module.exports.create_user_info = create_user_info;
module.exports.query_room_info = query_room_info;
module.exports.update_room_info = update_room_info;
module.exports.is_connected = is_connected;
module.exports.connect = connect;
module.exports.create_new_room_id = create_new_room_id;