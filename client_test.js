const Mongo = require('mongodb');
const Assert = require('assert');
const Redis = require('redis');

const MongoClient = Mongo.MongoClient;
const server = 'localhost:27017';
const db_name = 'Test'
const user = encodeURIComponent('user1');
const pwd = encodeURIComponent('user1');
const authMechanism = 'DEFAULT';
const url = `mongodb://${user}:${pwd}@${server}/?authMechanism=${authMechanism}&authSource=admin`;
const mongo_client = new MongoClient(url);

// const redis_server_url= 'redis://localhost:6379';
// const redis_client = Redis.createClient(redis_server_url);


// redis_client.on('connect', () => {
//     console.log('Redis db connected...');
// });
// redis_client.set('foo', 'bar', Redis.print);
// redis_client.get('foo', (err, result) => {
//     Assert.equal(err, null);

//     console.log('Get result = ' + result);
// });

mongo_client.connect((err, mongo_client) => {
    Assert.equal(err, null)

    console.log("Mongo db connected...");

    const db = mongo_client.db(db_name);
    
    db.collection('TestTable').createIndex({ 'column6': 1 }, { 'w': 1 });

    db.collection('TestTable').find().toArray((err, datas) => {
        var i = 0;
        datas.forEach(data => {
            console.log("data" + i + " = " + data);
            i++;
        });
    });

    db.collection('TestTable').insertMany([{ "column4": "val6", "column5": "val7" }, { "column6": "val8", "column7": "val9", "column8": "val10" }], (err, result) => {
        Assert.equal(err, null);

        for (doc of result.ops) {
            console.log(doc);
        }

    })

    let targetId = new Mongo.ObjectID('5c1de7c68e56c80b306b5c94');
    db.collection('TestTable').find({ '_id': targetId }).toArray((err, docs) => {
        Assert.equal(err, null);

        for (doc of docs) {
            console.log(doc);
        }
    })

    targetId = new Mongo.ObjectID('5c1ded10d3d752563458b11e');
    db.collection('TestTable').update({ "_id": targetId }, { $set: { "column8": "updated_val10" } }, (err, result) => {
        Assert.equal(err, null);

        console.log("Changed data count is " + result.result.n);
    })

    db.collection('TestTable').deleteOne({ "_id": targetId }).then(response => {
        console.log(response);
    }, reject => {
        console.log(reject);
    })


});