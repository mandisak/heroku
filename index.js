var express = require('express');
var app = express();

var q = 'tasks';
var url = process.env.CLOUDAMQP_URL || "amqp://xwgeiyoe:0DtGYJkzfeaq3jmlZiMEunXfK9xzDwcU@owl.rmq.cloudamqp.com/xwgeiyoe";
var amqp = require('amqplib').connect(url);


app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

var when = require('when');

app.get('/:msg', function (request, response) {
    amqp.then(function (conn) {
        return when(conn.createChannel().then(function (ch) {
            var msg = request.param("msg")

            var ok = ch.assertQueue(q, { durable: false });

            return ok.then(function (_qok) {
                ch.sendToQueue(q, new Buffer(msg));
                console.log(" [x] Sent '%s'", msg);                
                return ch.close();
            });
        })).ensure(function () { conn.close(); }); ;
    }).then(null, console.warn);

    response.send('Sent!');
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

