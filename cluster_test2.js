var cluster = require('cluster');
var debug = require('./utils_packs/debug')
let debug_tag = 'cluster_test2';
let port = 3000;

require('sticky-cluster')(callback => {
    let http = require('http');
    var role = cluster.isMaster ? 'Master' : 'Slave';

    let server = http.createServer((req, rep) => {
        debug.log(debug_tag, `${role}, worker id = ${cluster.worker.id}, reponse`),
        
        rep.end("Hello cluster");
    });

    callback(server);
}, {
        concurrency: 10,
        port: port,
        debug: true,
        env: function (index) { return { stickycluster_worker_index: index }; }
    });
