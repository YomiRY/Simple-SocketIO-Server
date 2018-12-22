const Mongo = require('mongodb');
const MongoClient = Mongo.MongoClient;
const Assert = require('assert');
const url = "mongodb://localhost:27017"
const client = new MongoClient(url);

client.connect((err) => {
    Assert.equal(err, null)

    console.log("Mongo db connected...");

    const db = client.db('TestDB');
    db.collection('TestTable2').createIndex({'column6':1}, {'w':1});

    db.collection('TestTable').find().toArray((err, datas) => {
        var i = 0;
        datas.forEach(data => {
            console.log("data" + i + " = " + data);
            i++;
        });
    });

    db.collection('TestTable2').insertMany([{ "column4": "val6", "column5": "val7" }, { "column6": "val8", "column7": "val9", "column8": "val10" }], (err, result) => {
        Assert.equal(err, null);

        for (doc of result.ops) {
            console.log(doc);
        }

    })

    let targetId = new Mongo.ObjectID('5c1de7c68e56c80b306b5c94');
    db.collection('TestTable2').find({ '_id': targetId}).toArray((err, docs) => {
        Assert.equal(err, null);

        for (doc of docs) {
            console.log(doc);
        }
    })

    targetId = new Mongo.ObjectID('5c1ded10d3d752563458b11e');
    db.collection('TestTable2').update({"_id": targetId}, {$set:{"column8": "updated_val10"}}, (err, result) => {
        Assert.equal(err, null);

        console.log("Changed data count is " + result.result.n);
    })

    db.collection('TestTable2').deleteOne({"_id": targetId}).then(response => {
        console.log(response);
    }, reject => {
        console.log(reject);
    })

    
});