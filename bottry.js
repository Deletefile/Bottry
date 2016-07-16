var bottry = function(server, port, chan){
	const net = require('net');
	const fs = require('fs');

	var self = this;
	
	this.connection = {
		server: server,
		port: port,
		chan: chan
	}

	this.loadCommands = function(){
		var content = fs.readFileSync(self.config.cmdFile);
		self.config.commands = JSON.parse(content);
	};

	this.config = {
		cmdFile: 'commands.json',
		
		commands: {}
	};

	

	this.client = net.createConnection({port: self.connection.port, host: self.connection.server}, function(){
	  	
	  	console.log('Connection successful!');

	  	self.loadCommands();

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
				self.parseLine(data, self.parseMessage);
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

	this.parseMessage = function(query){
		var command = '';
		var args = [];
		console.log(query);
		if(query.message){
			if(query.message.indexOf('!') == 0){
				var argsNum = (query.message.split(' ')).length - 1;
				for(var i = 0; i <= argsNum; i++){
					var separator = query.message.indexOf(' ');
					if(i == 0){
						command = query.message.substr(0, separator);
						query.message =  query.message.substr((separator + 1), (query.message.length - separator - 1));
					}else if(i == argsNum){
						args.push(query.message.substr(0, query.message.length));
					}else{
						var separator = query.message.indexOf(' ');
						args.push(query.message.substr(0, separator));
						query.message =  query.message.substr((separator + 1), (query.message.length - separator - 1));
					}
				}
				
			}
		}

		self.parseCommand(command, args);
	}

	this.parseCommand = function(command, args, callback){
		command = command.substr(1);
		for(var prop in self.config.commands){
			if(prop == command){
				var value = self.config.commands[prop];
				var parsedCmd = '';
				value.split('$').forEach(function(val, index){
					if(index <= (args.length - 1)){
						parsedCmd += val + args[index];
					}
				});
			}
		}
		self.sendCommand(parsedCmd);
	};

	this.sendCommand = function(cmd){
		self.client.write(cmd + "\r\n");
	};

}

var bot = new bottry('crypto.azzurra.org', '6667', '#egghelp');