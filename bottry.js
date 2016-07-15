var bottry = function(server, port, chan){
	const net = require('net');

	var self = this;
	
	this.connection = {
		server: server,
		port: port,
		chan: chan
	}

	this.client = net.createConnection({port: self.connection.port, host: self.connection.server}, function(){
	  	
	  	console.log('Connection successful!');
	  	
	  	self.client.write('NICK bottry\r\n');	  	
	  	self.client.write('USER bottry 0 * :bottry\r\n');
	  	self.client.write('JOIN ' + self.connection.chan + '\r\n');
	  	
	  	self.client.on('data', function(data){
			data = data.toString();

			console.log(data);

			//keep client alive
			if(data.toString().match(/^PING(\s):(.*)/)){
				self.pong();
			}else{
				self.parseLine(data);
			}

		});

	});

	this.pong = function(){
		self.client.write('PONG ' + self.connection.server + "\r\n");
	}

	this.parseLine = function(line, callback){

		var strType = ':(.*)!(.*)PRIVMSG(\\s)' + self.connection.chan + '(\\s):(.*)';

		var regex = new RegExp(strType);

		var result = [];

		var match = line.match(regex);

		for(var propName in match) {
		    propValue = match[propName]
		    console.log(propValue);

		    result.push(propValue);
		}

		var parsed = {
			user: result[1],
			message: result[5]
		}

		if(callback !== undefined){
			callback(parsed);
		}else{
			console.log(parsed);
			return parsed;
		}
	}

}

var bot = new bottry('crypto.azzurra.org', '6667', '#egghelp');