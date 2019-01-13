const Mongo = require('mongodb');
const Assert = require('assert');
const Redis = require('redis');
const debug = require('./utils_packs/debug');
const debug_tag = 'client_test.js';
const MongoClient = Mongo.MongoClient;
const server = 'localhost:27017';
const db_name = 'TestDB';
const collection_name = 'TestTable';
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

    debug.log(debug_tag, "Mongo db connected...")

    const db = mongo_client.db(db_name);
    var collection = db.collection(collection_name);
    var docs = [{
        title: "this is my title", author: "bob", posted: new Date(),
        pageViews: 5, tags: ["fun", "good", "fun"], other: { foo: 5 },
        comments: [
            { author: "joe", text: "this is cool" }, { author: "sam", text: "this is bad" }
        ]
    }, {
        title: "this is my title", author: "bob_2", posted: new Date(),
        pageViews: 5, tags: ["fun", "good", "fun"], other: { foo: 5 },
        comments: [
            { author: "joe", text: "this is cool" }, { author: "sam", text: "this is bad" }
        ]
    }, {
        title: "this is my title", author: "bob_3", posted: new Date(),
        pageViews: 5, tags: ["fun", "good", "fun"], other: { foo: 5 },
        comments: [
            { author: "joe", text: "this is cool" }, { author: "sam", text: "this is bad" }
        ]
    }];

    // collection.insertMany(docs, { w: 1 });
    collection.createIndex({ author: "text" }, (err, result) => {
        console.log(err);
        console.log(result);

        collection.find({ '$text': { '$search': 'bob_2' } }).toArray((err, result) => {
            console.log(err);
            console.log(result);
        })
    })


    // collection.group(['author'],
    //     { 'author': ['bob'] },
    //     { 'total': 0 },
    //     "function ( curr, result ) { result.total++ }",
    //     function (err, result) {
    //         assert.equal(err, null);
    //         console.log(result)
    //         callback(result);
    //     }
    // );

    // collection.count({ "pageViews": 5 }, (err, result) => {
    //     console.log("result = " + result);
    // });
    // Create a collection
    // collection.insertMany(docs, { w: 1 }, function (err, result) {

    //     // Execute aggregate, notice the pipeline is expressed as an Array
    //     collection.aggregate([
    //         {
    //             $project: {
    //                 author: 1,
    //                 tags: 1
    //             }
    //         },
    //         { $unwind: "$tags" },
    //         {
    //             $group: {
    //                 _id: { tags: "$tags" },
    //                 authors: { $addToSet: "$author" }
    //             }
    //         }
    //     ], function (err, cursor) {
    //         cursor.toArray((err, result) => {
    //             Assert.equal(null, err);
    //             Assert.equal('good', result[0]._id.tags);
    //             Assert.deepEqual(['bob'], result[0].authors);
    //             Assert.equal('fun', result[1]._id.tags);
    //             Assert.deepEqual(['bob'], result[1].authors);
    //         });

    //     });
    // });



    // db.collection(table_name).aggregate([{ $match: { "column4": "val6" } }, { $project: { "column4": 1, "_id":0 } }], (err, cursor) => {
    //     db.collection(table_name).aggregate([{ $match: { "column4": "val6" } }, {$unwind:"$column4"}], (err, cursor) => {
    //     Assert.equal(err, null);

    //     cursor.toArray(function (err, documents) {
    //         console.log(documents);
    //     });
    // })

    // db.collection(table_name).createIndex({ 'column6': 1 }, { 'w': 1 });

    // db.collection(table_name).find().toArray((err, datas) => {
    //     var i = 0;
    //     datas.forEach(data => {
    //         console.log("data" + i + " = " + data);
    //         i++;
    //     });
    // });

    // db.collection(table_name).insertMany([{ "column4": "val6", "column5": "val7" }, { "column6": "val8", "column7": "val9", "column8": "val10" }], (err, result) => {
    //     Assert.equal(err, null);

    //     for (doc of result.ops) {
    //         console.log(doc);
    //     }

    // })

    // let targetId = new Mongo.ObjectID('5c3acb14ebce3783f281d4b3');
    // db.collection(table_name).find({ '_id': targetId }).toArray((err, docs) => {
    //     Assert.equal(err, null);

    //     for (doc of docs) {
    //         console.log(doc);
    //     }
    // })

    // targetId = new Mongo.ObjectID('5c3acb14ebce3783f281d4b2');
    // db.collection(table_name).update({ "_id": targetId }, { $set: { "column4": "val6", "column8": "updated_val10" } }, (err, result) => {
    //     Assert.equal(err, null);

    //     console.log("Changed data count is " + result.result.n);
    // })

    // db.collection(table_name).deleteOne({ "_id": targetId }).then(response => {
    //     console.log(response);
    // }, reject => {
    //     console.log(reject);
    // })


});