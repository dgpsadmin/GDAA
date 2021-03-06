// TODO: Error Handling & Input Data Validation

var fs = require('fs');
var path = require('path');
var dataArchiver = require('./dataArchiver');
var net = require('net');
//var Emitter = require('events').EventEmitter;

var allDataArchivers = [];
//var trigger = new Emitter();
	
var getDirFileList = function(localDir, myFn) {
	var fileList = [];
	fs.readdir(localDir, function(err, files) {
		var counter = files.length;
		if (err) {
			return myFn(err, fileList);
		} else {
			if (!counter) {
				return myFn(err, fileList);
			}

			files.forEach(function(item, i) {
				item = path.join(localDir, item);

				fs.stat(item, function(err, stats) {
					if (err) {
						return myFn(err, fileList);
					} else {
						if (stats.isDirectory()) {
							getDirFileList(item, function(err, myFileList) {
								fileList = fileList.concat(myFileList);
								if (!--counter) {
									myFn(err, fileList);
								}
							});
						} else {
							fileList.push(item);
							if (!--counter) {
								myFn(err, fileList);
							}
						}
					}
				});

			});

		}
	});
};

var getSessions = function(configDir, myFn, exception) {
	var sessions = [];
	getDirFileList(configDir, function(err, myFileList) {
		if (err) {
			return myFn(err, null);
		}
		
		var allConfigFiles = myFileList.filter(function(elt, i) {
			return path.extname(elt) === '.ses';
		});
		
		if (allConfigFiles.length !== 0) {
		
			allConfigFiles.forEach(function(configFile, i) {
				try {

					if(!(exception && configFile === exception)){
						fs.readFile(configFile, function(err, data) {
							sessions.push(JSON.parse(data));
							if (exception) {
								if ((sessions.length + 1) === allConfigFiles.length) {
									return myFn(null, sessions);
								}
							} else {
								if (sessions.length === allConfigFiles.length) {
									return myFn(null, sessions);
								}
							}

						});
					}
				} catch (e) {
					return myFn(e, null);
				}


			});


		} else {
			return myFn(null, sessions);
		}
		
	});
};



var createNewSession = function(configDir, options, myFn) {
	var configFile,err;
	if (!validateSessionConfig(options)){
		return myFn('Invalid arguments to create new session', configFile);
	}
	var duplicateSessionID = false;
	getSessions(configDir, function(err, sessions) {
		if (err) {
			return myFn(err,configFile);
		}
		//console.log('retreived sessions: ', sessions);
		sessions.forEach(function(session, i) {
			if(session.id === options.id && session.sessionName === options.sessionName){
				duplicateSessionID = true;
				return myFn('A session with same name and id exists', configFile);
			}
		});
		if (!duplicateSessionID) {
			try {
				configFile = path.join(configDir, options.sessionName +'_'+options.id +'.ses');
				fs.writeFile(configFile, JSON.stringify(options));
				myFn(err, configFile);
			} catch (err) {
				myFn(err, configFile);
			}
		}
	});
};

var editSession = function(configDir, options, myFn) {
	var configFile,err;
	if (!validateSessionConfig(options)){
		return myFn('Invalid arguments to edit session', configFile);
	}
	var duplicateSessionID = false;
	getSessions(configDir, function(err, sessions) {
		if (err) {
			return myFn(err, configFile);
		}
		sessions.forEach(function(session, i) {
			if(session.id === options.id && session.sessionName === options.sessionName){
				duplicateSessionID = true;
				return myFn('A session with same name and id exists', configFile);
			}
		});
		if (!duplicateSessionID) {
			try {
				configFile = path.join(configDir, options.sessionName +'_'+options.id +'.ses');
				fs.writeFile(configFile, JSON.stringify(options), function() {
					return myFn(err, configFile);
				});
			} catch (err) {
				return myFn(err, configFile);
			}
		}
	}, path.join(configDir, options.sessionName +'_'+options.id +'.ses'));
};

var processSingleConfigFile = function(configFile, loggingDir, myFn) {
	//console.log(configFile);
	fs.readFile(configFile,	function(err, data) {
			if (err) {
				var myDA;
				return myFn(err, myDA);
			}
			try {
				var sessionConfig = JSON.parse(data);
				var timeToFire;
				var processFn = function() {

					var myDA;
					if (sessionConfig.enable === true) {

						timeToFire = sessionConfig.startDate - Date.now();

						if (sessionConfig.dailyRepeat === true && timeToFire <= -86400000) {
							timeToFire %= 86400000;
						}

						if (timeToFire > 0) {

							myDA = dataArchiver(sessionConfig, loggingDir);
							setTimeout(function() {
								myDA.startArchiver();
							}, timeToFire);

							setTimeout(function() {
								var softStop =  (parseInt(sessionConfig.duration) === 1440);
								console.log(softStop);
								myDA.stopArchiver(true);
							}, timeToFire + parseInt(sessionConfig.duration) * 60000);

							//allDataArchivers[i] = myDA;

							//cb(err, myDA);
							
//							if (sessionConfig.dailyRepeat === true){
//								setTimeout(function() {
//									var temp = setInterval(function() {
//										processFn();
//									}, 86400000);
//									myDA.intervalID = temp;
//								}, timeToFire + parseInt(sessionConfig.duration) * 60000);
//							}
							return myFn(err, myDA);



						} else if (timeToFire < 0 && (timeToFire + parseInt(sessionConfig.duration) * 60000) > 0) {

							myDA = dataArchiver(sessionConfig, loggingDir);

							myDA.startArchiver();

							setTimeout(function() {

								myDA.stopArchiver(true);
							}, timeToFire + parseInt(sessionConfig.duration) * 60000);
							//allDataArchivers[i] = myDA;

							//cb(err, myDA);
							if (sessionConfig.dailyRepeat === true){
								setTimeout(function() {
									var temp = setInterval(function() {
										processFn();
									}, 86400000);
									myDA.intervalID = temp;
								}, timeToFire + parseInt(sessionConfig.duration) * 60000);
							}
							return myFn(err, myDA);
							
						} else if (sessionConfig.dailyRepeat === false &&  (timeToFire + parseInt(sessionConfig.duration) * 60000) < 0){
							myDA = dataArchiver(sessionConfig, loggingDir);
							clearInterval(myDA.intervalID);
							return myFn(err, myDA);
								
						}
					}
				};
				
				processFn();
				
				
			} catch (err) {
				// TODO: handle exception
				if (myFn) {
					myFn(err, myDA);
				}
			}

	});

};

var resumeDailySession = function (configDir, configFile, loggingDir){
	console.log(configDir, configFile, loggingDir);
	processSingleConfigFile(configFile, loggingDir);
};


var processConfigFiles = function(configDir, loggingDir, myFn) {
	if (allDataArchivers.length > 0) {
		allDataArchivers.forEach(function(da, i) {
			clearInterval(da.intervalID);
			console.log(da.config);
		});
	}
	
	getDirFileList(
			configDir,
			function(err, myFileList) {
				if (err) {
					return myFn(err);
				}
				var allConfigFiles = myFileList.filter(function(elt, i) {
					return path.extname(elt) === '.ses';
				});
				var error = '';
				allConfigFiles.forEach(function(configFile, i) {
							processSingleConfigFile(configFile, loggingDir, function (err, myDA) {
								console.log(err);
								if(err){
									error += err;
								} else {
									allDataArchivers.push(myDA);
									console.log(allDataArchivers.length);

								}
							});
						});
				return myFn(error);
			});

};

var deleteSession = function(configDir, session, myFn) {
	var fileName = path.join(configDir, session.sessionName +'_'+session.id +'.ses');
//	console.log(fileName);
	fs.unlink(fileName, function(err) {
//		console.log(err);
		myFn(err);
	});
};


var stopSession = function(session, mustRemoved, myFn) {
	if (!validateSessionConfig){
		return myFn('couln\'t stop session due to invalid session config');
	}
	if (mustRemoved === true || mustRemoved === false){
		if (mustRemoved === true) {

			for (var i = 0; i < allDataArchivers.length; i++) {
				var da = allDataArchivers[i];
				if (da.config.sessionName === session.sessionName && da.config.id === session.id){
					da.stopArchiver(function() {
						allDataArchivers.splice(i, 1);
						clearInterval(allDataArchivers[i].intervalID);
						return myFn();
						//break;
					});
				}
			}
							
		} else {
			for (var i = 0; i < allDataArchivers.length; i++) {
				var da = allDataArchivers[i];
				if (da.config.sessionName === session.sessionName && da.config.id === session.id){
					da.stopArchiver(function() {
						return myFn();
						//break;
					});
				}
			}
			
		}
	} else {
		myFn('invalid request argument');
	}
};

var startSession = function() {
	
};

var validateSessionConfig = function(session) {
	if (session) {
		if(!(session.enable !== undefined && (session.enable === true || session.enable === false))){
			console.log(session.enable);
			return false;
		}
		if(!(session.dailyRepeat !== undefined && (session.dailyRepeat === true || session.dailyRepeat === false))){
			console.log(session.dailyRepeat);
			return false;
		}
		if(!(session.sessionName !== undefined && session.sessionName.match(/[a-zA-Z0-9-_]{1,20}/g)[0] === session.sessionName)){
			console.log(session.sessionName);
			return false;
		}
		if(isNaN(session.duration)){
			console.log(session.duration);
			return false;
		}
		if(isNaN(session.port)){
			console.log(session.port);
			return false;
		}
		if(!(net.isIPv4(session.host))){
			console.log(session.host);
			return false;
		}
		return true;
	} else {
		return false;
	}
};

var stopAllSessions = function(myFn) {
	try {
		allDataArchivers.forEach(function(da, i) {

			da.stopArchiver();
			if ( (i+1) === allDataArchivers.length) {
				myFn();
			}
		});

	} catch (e) {
		myFn(e);
	}
};

var checkForStart = function(configDir, loggingDir, threshold) {
	getSessions(configDir, function(err, sessions) {
		if (err) {
			console.log(err);
			return;
		} else {
			sessions.forEach(function(session, i) {
				if (session.enable === true){
					var timeToFire = session.startDate - Date.now();
//					if (timeToFire > 0 && timeToFire < threshold) {
//						
//						allDataArchivers.forEach(function(da, j) {
//							if (da.config.sessionName === session.sessionName && da.config.id === session.id) {
//								
//								setTimeout(function() {
//									da.createLoggingFilePath(loggingDir, session);
////									da.startArchiver();
//									console.log("salam 1111 >>> ", da.config);
//								}, timeToFire + 500);
//								
//								
//							}
//						});
//					}

					if (session.dailyRepeat === true && timeToFire < 0) {
						console.log('next fire');

						timeToFire = (session.startDate % 86400000) - (Date.now() % 86400000);
						if (timeToFire < 0 && (timeToFire + 86400000) < threshold) {
							
							allDataArchivers.forEach(function(da, j) {
								if (da.config.sessionName === session.sessionName && da.config.id === session.id) {
								
									setTimeout(function() {
										
										//var softStop = (parseInt(session.duration) === 1440);
										//if(softStop === true){
											da.createLoggingFilePath(loggingDir, session);
										//} else {
											//da.stopArchiver();
											console.log('going to next fire', softStop);
											//da.startArchiver();
										//}
										
										console.log("salam 2222 >>> ", da.config);
									}, timeToFire + 86400000 + 500);
									
//									setTimeout(function() {
//										da.stopArchiver();
//									}, timeToFire  + 86400000 + parseInt(session.duration) * 60000);

									
								}
							});
							
						}
					}
				}
			});
		}
	});
};

module.exports = {
	allDataArchivers: allDataArchivers,
	processSingleConfigFile: processSingleConfigFile,
	processConfigFiles : processConfigFiles,
	getSessions : getSessions,
	createNewSession : createNewSession,
	deleteSession : deleteSession,
	stopAllSessions : stopAllSessions,
	editSession: editSession,
	stopSession: stopSession,
	validateSessionConfig: validateSessionConfig,
	checkForStart: checkForStart
};
