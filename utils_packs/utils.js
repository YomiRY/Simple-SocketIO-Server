const uuidv1 = require('uuid/v1');

 function generateUUID() {
    // const uuid_str = uuid.v1({
    //     node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
    //     clockseq: 0x1234,
    //     msecs: new Date().getTime(),
    //     nsecs: 5678
    //   }); 

    // return uuid_str;
    return uuidv1();
}

module.exports.generateUUID = generateUUID;