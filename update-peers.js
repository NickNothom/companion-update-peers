var http = require('http');

var target_address = '11.0.1.81';
var target_id = 8;
var target_port = '4777';
var source_address = '11.0.1.91';
var source_id = 9;
var source_port = '4777';

var message_sequence = 0;

var target_options = {
  host: target_address,
  port: target_port,
  path: '/mavlink/GLOBAL_POSITION_INT'
};

target_callback = function(response) {
  var str = '';

  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    output = prepare_message(str);
    send_message(output);
  });
}

source_callback = function(response) {
  var str = ''
  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    console.log(str);
  });
}

function prepare_message(str) {
  out = {};
  out.message = JSON.parse(str);
  delete out.message_information;

  out.header = {
      system_id: source_id,
      component_id: target_id,
      sequence: message_sequence
  };

  message_sequence++;
  return out;
}

function send_message(output) {
  output_message = JSON.stringify(output);

  var source_options = {
    host: source_address,
    path: '/mavlink',
    port: source_port,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': output_message.length
    }
  };

  var req = http.request(source_options, source_callback);
  req.write(output_message);
  req.end();
}

function update() {
  http.request(target_options, target_callback).end();
  console.log("Updated Position");
}

setInterval(update, 1000);
