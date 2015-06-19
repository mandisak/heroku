var express = require('express');
var app = express();

var q = 'tasks';
var url = process.env.CLOUDAMQP_URL || "amqp://xwgeiyoe:0DtGYJkzfeaq3jmlZiMEunXfK9xzDwcU@owl.rmq.cloudamqp.com/xwgeiyoe";
var amqp = require('amqplib').connect(url);


app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

var when = require('when');

app.get('/', function (request, response) {
    amqp.then(function (conn) {
        process.once('SIGINT', function () { conn.close(); });
        return conn.createChannel().then(function (ch) {

            var ok = ch.assertQueue('hello', { durable: false });

            ok = ok.then(function (_qok) {
                return ch.consume(q, function (msg) {
                    console.log(" [x] Received '%s'", msg.content.toString());
                }, { noAck: true });
            });

            return ok.then(function (_consumeOk) {
                console.log(' [*] Waiting for messages. To exit press CTRL+C');
            });
        });
    }).then(null, console.warn);

});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
