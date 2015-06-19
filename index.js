var bodyParser = require('body-parser');
var express = require('express');
var app = express();

var q = 'tasks';
var url = process.env.CLOUDAMQP_URL || "amqp://xwgeiyoe:0DtGYJkzfeaq3jmlZiMEunXfK9xzDwcU@owl.rmq.cloudamqp.com/xwgeiyoe";
var amqp = require('amqplib').connect(url);


app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

var when = require('when');

app.get("/", function (request, response) {
    response.sendfile(__dirname + "\\index.html");
});

app.post('/', function (request, response) {
    amqp.then(function (conn) {
        process.once('SIGINT', function () { conn.close(); });

        return when(conn.createChannel().then(function (ch) {
            var msg = request.body.message; //request.param("msg")

            var ok = ch.assertQueue(q, { durable: false });

            return ok.then(function (_qok) {
                ch.sendToQueue(q, new Buffer(msg));
                console.log(" [x] Sent '%s'", msg);
            });
        }))
    }).then(null, console.warn);

    response.sendfile(__dirname + "\\index.html");
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

