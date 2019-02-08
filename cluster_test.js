var cluster = require('cluster');
var sticky = require('socketio-sticky-session');
var debug = require('debug')('cluster');
var http = require('http');

/* if (cluster.isMaster) {
    for (var i = 0; i < 4; i++) {
        cluster.fork();
    }

    Object.keys(cluster.workers).forEach(function (id) {
        debug("Worker running with PID : " +
            cluster.workers[id].process.pid);
    });
}

if (cluster.isWorker) {
    var anotherServer = http.createServer(function (req, res) {
        res.end('hello world!');
        debug("worker id = " + cluster.worker.id)
    });
    anotherServer.listen(3000);
    console.log('http server on 3000');
} */

var options = {
    num: 2 //count of processes to create, defaults to maximum if omitted
  }
sticky(options, function () {
    var io = require('socket.io')();

    var server = http.createServer(function (req, res) {
        res.end('socket.io');
    });

    io.listen(server);

    io.on('connection', function onConnect(socket) {
        console.log('someone connected.');

        socket.on('sync', sync);
        socket.on('send', send);

        function sync(id) {
            socket.join(id);
            console.log('someone joined ' + id);
        }

        function send(id, msg) {
            io.sockets.in(id).emit(msg);
            console.log('someone sent ' + msg + ' to ' + id);
        }
    });

    return server;
}).listen(3001, function () {
    if (cluster.isMaster) {
        debug('master socket.io server on 3001');
    } else {
        debug('slave socket.io server on 3001');
    } 
});