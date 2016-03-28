// Empty JS for your own code to be here
var app = angular.module('myConsole', [ 'ngRoute' ]);
app.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/status', {
		templateUrl : 'contents/status.html',
		controller : 'statusCtrl',
		method : 'POST'

	}).when('/dataFiles', {
		templateUrl : 'contents/dataFiles.html',
		controller : 'statusCtrl'
	}).when('/networkSetting', {
		templateUrl : 'contents/networkSetting.html',
		controller : 'netCtrl'
	}).when('/sessionProgram', {
		templateUrl : 'contents/sessionProgram.html',
		controller : 'statusCtrl'
	}).when('/ftpConfiguration', {
		templateUrl : 'contents/ftpConfiguration.html',
		controller : 'ftpConfiguration'
	}).when('/authentication', {
		templateUrl : 'contents/authentication.html',
		controller : 'statusCtrl',
	}).when('/currentSessions', {
		templateUrl : 'contents/currentSessions.html',
		controller : 'statusCtrl',
	}).when('/ftpLog', {
		templateUrl : 'contents/ftpLog.html',
		controller : 'ftpConfiguration',
	}).otherwise({
		redirectTo : '/',
		templateUrl : 'contents/status.html',
		controller : 'statusCtrl'

	});
} ]);
app.controller('statusCtrl', function($scope, $http, $location, $route) {
	var sessionsInfo = [];
	$scope.getDiskStatus = function() {
		$http.get('/getDiskStatus').then(function(response) {
			$scope.totalSpace = (Number(response.data.totalSpace)/(1024)).toFixed(2) + ' MB';
			$scope.inUse = (Number(response.data.inUse)/(1024)).toFixed(2) + ' MB';
			$scope.available = (Number(response.data.available)/(1024)).toFixed(2) + ' MB';
			$scope.ringBuffer = true;
		});
	};
	
	$scope.clearDisk = function() {

		$http.get('/lsDataFiles').then(function(response) {
			var deleteFilesList = [];
			var dataFiles = response.data;
			if (dataFiles.length > 0) {
				for (var k = 0; k < dataFiles.length; k++) {
						deleteFilesList.push(dataFiles[k].name);
				}

				$http.post('/deleteFiles', JSON.stringify(deleteFilesList)).then(
						function(response) {
							alert("The disk has been cleared successfully");
							$scope.getDiskStatus();
						}, function(error) {
							alert(error.statusText);
						});
			}

			
		});
	};

	
	
	$scope.getStationInfo = function() {
		$http.get('/getStationInfo').then(function(response) {
			$scope.stationInfo.stationCode = response.data.stationCode;
		});
	};
	
	$scope.setStationInfo = function() {
		$http.post('/setStationInfo', JSON.stringify($scope.stationInfo)).then(function(response) {
			alert(response.statusText);
		}, function(error) {
			alert(error.statusText);
			$scope.getStationInfo();
			$route.reload();
		});
	};
	
	$scope.goToSession = function ( path ) {
		  $location.path( path );
		  console.log($scope);
//		  $scope.sessionProgram.sessionName = "salam";
		};

		$scope.restartAllSessions = function() {
			$http.get('/restartAllSessions').then(function(response) {
				console.log(response);
			}, function(error) {
				console.log(error);
			});
		};

		$scope.editSession = function(session) {
			
			$http.get('/getSessionsInfo').then(function(response) {
				var temp;
				sessionsInfo = response.data;
				for (var i = 0; i < response.data.length; i++) {
					if(response.data[i].sessionName === session.sessionName && response.data[i].id === session.id){
						$scope.sessionEditShow = 1;
						$scope.currentSession.enable = response.data[i].enable;
						$scope.currentSession.dailyRepeat = response.data[i].dailyRepeat;
						$scope.currentSession.sessionName = response.data[i].sessionName;
						$scope.currentSessionEpoch = response.data[i].epochInterval + ' Second';
						temp = new Date(response.data[i].startDate);
						$scope.currentSessionDate.year = temp.getFullYear();
						var month = temp.getMonth();
						
						
						switch (month) {
						case 0:
							$scope.currentSessionDate.month = 'Jan-01';
							break;

						case 1:
							$scope.currentSessionDate.month = 'Feb-02';
							break;

						case 2:
							$scope.currentSessionDate.month = 'Mar-03';
							break;

						case 3:
							$scope.currentSessionDate.month = 'Apr-04';
							break;

						case 4:
							$scope.currentSessionDate.month = 'May-05';
							break;

						case 5:
							$scope.currentSessionDate.month = 'Jun-06';
							break;

						case 6:
							$scope.currentSessionDate.month = 'Jul-07';
							break;

						case 7:
							$scope.currentSessionDate.month = 'Aug-08';
							break;

						case 8:
							$scope.currentSessionDate.month = 'Sep-09';
							break;

						case 9:
							$scope.currentSessionDate.month = 'Oct-10';
							break;

						case 10:
							$scope.currentSessionDate.month = 'Nov-11';
							break;

						case 11:
							$scope.currentSessionDate.month = 'Dec-12';
							break;

						default:
							break;
						}
						
						$scope.currentSessionDate.day = temp.getDate();
						$scope.currentSessionDate.time = (temp.getHours() < 10 ? ('0'+temp.getHours()) : temp.getHours()) + ':'
						+ (temp.getMinutes() < 10 ? ('0' + temp.getMinutes()) : temp.getMinutes());
						$scope.currentSession.duration = response.data[i].duration;
						$scope.currentSession.host = response.data[i].host;
						$scope.currentSession.port = response.data[i].port;
						$scope.currentSession.id = response.data[i].id;


					}
				}
				

			});

		};
		
		$scope.cancelEditSession = function(){
			$scope.sessionEditShow = 0;
			

			}
		
//		$scope.validSessionID = function(sessionName, sessionID) {
//			var checkResult = false;
//			$http.get('/getSessionsInfo').then(function(response) {
//				for (var i = 0; i < response.data.length; i++) {
//					if (response.data[i].id == sessionID) {
//						
//					}
//				}
//			}, function(error) {
//				return false;
//			});
//
//		};
		
		$scope.editSessionInfo = function() {
			
			
			// TODO: check identifier of session to keep session id uniqueness
			
			var month;
			
			switch ($scope.currentSessionDate.month) {
			case 'Jan-01':
				month =  0;
				break;

			case 'Feb-02':
				month =  1;
				break;

			case 'Mar-03':
				month =  2;
				break;

			case 'Apr-04':
				month =  3;
				break;

			case 'May-05':
				month =  4;
				break;

			case 'Jun-06':
				month =  5;
				break;

			case 'Jul-07':
				month =  6;
				break;

			case 'Aug-08':
				month =  7;
				break;

			case 'Sep-09':
				month =  8;
				break;

			case 'Oct-10':
				month =  9;
				break;

			case 'Nov-11':
				month =  10;
				break;

			case 'Dec-12':
				month =  11;
				break;

			default:
				break;
			}
			
			var hour = $scope.currentSessionDate.time.split(':')[0];
			var minute = $scope.currentSessionDate.time.split(':')[1];
			
			$scope.currentSession.epochInterval = Number($scope.currentSessionEpoch.split(' ')[0]);
			
			$scope.currentSession.startDate = new Date($scope.currentSessionDate.year,
					month, $scope.currentSessionDate.day,hour,minute);
			$scope.currentSession.startDate = Date.parse($scope.currentSession.startDate);
			
			console.log($scope.currentSession);
			
			$http.post('/editSessionInfo', JSON.stringify($scope.currentSession)).then(
					function(response) {
						alert(response.statusText);
						$scope.getSessionStatus();
						//$scope.restartAllSessions();

					}, function(error) {
						alert(error.statusText);
						$scope.getSessionStatus();

					});

			
		};

		
	$scope.deleteSession = function(session) {
		
		$http.post('/deleteSession', session).then(
				function(response) {
					alert(response.statusText);
					$scope.sessionEditShow = 0;
					$route.reload();
					
				}, function(error) {
					console.log(error);
				});
	};
	
		
	$scope.getSessionStatus = function() {
		$scope.allSessions = [];
		$http.get('/getSessionsInfo').then(function(response) {
			sessionsInfo = response.data;
			for (var i = 0; i < response.data.length; i++) {
				var temp = {};
				temp.sessionName = response.data[i].sessionName;
				temp.id = response.data[i].id;
				temp.startTime = new Date(response.data[i].startDate); 
				temp.startTime = temp.startTime.getFullYear() + '-' + (temp.startTime.getMonth()+1)+ '-' + temp.startTime.getDate() + ' ' + 
				(temp.startTime.getHours() < 10 ? '0' : '') + temp.startTime.getHours() + 
				( temp.startTime.getMinutes() < 10 ? ':0' : ':') + temp.startTime.getMinutes() + ', ' +
				(response.data[i].dailyRepeat == true ? 'daily' : 'once');
				temp.duration = response.data[i].duration;
				temp.enable = ( response.data[i].enable == true );
				$scope.allSessions.push(temp);
				//
			}
		});
		
	};
	
	$scope.applySessionChanges = function() {

		for (var i = 0; i < $scope.allSessions.length; i++) {
			
			for (var j = 0; j < sessionsInfo.length; j++) {
				
				if (sessionsInfo[j].sessionName == $scope.allSessions[i].sessionName){
					var setSessionRequest = sessionsInfo[j];
					setSessionRequest.enable = $scope.allSessions[i].enable;
					
					$http.post('/editSessionInfo', JSON.stringify(setSessionRequest)).then(
					function(response) {
						console.log(response);
						if ( response && (i-1) == $scope.allSessions.length && (j-1) == sessionsInfo.length ){
							$scope.getSessionStatus();
							

						}
					}, function(error) {
						console.log(error);
						if ( error && (i-1) == $scope.allSessions.length && (j-1) == sessionsInfo.length){
							$scope.getSessionStatus();
						}

					});
				}
			}
		}

	};
	
	$scope.setSessionInfo = function() {
		
		var month;
		
		switch ($scope.sessionProgramDate.month) {
		case 'Jan-01':
			month =  0;
			break;

		case 'Feb-02':
			month =  1;
			break;

		case 'Mar-03':
			month =  2;
			break;

		case 'Apr-04':
			month =  3;
			break;

		case 'May-05':
			month =  4;
			break;

		case 'Jun-06':
			month =  5;
			break;

		case 'Jul-07':
			month =  6;
			break;

		case 'Aug-08':
			month =  7;
			break;

		case 'Sep-09':
			month =  8;
			break;

		case 'Oct-10':
			month =  9;
			break;

		case 'Nov-11':
			month =  10;
			break;

		case 'Dec-12':
			month =  11;
			break;

		default:
			break;
		}
		
		var hour = $scope.sessionProgramDate.time.split(':')[0];
		var minute = $scope.sessionProgramDate.time.split(':')[1];
		
		$scope.sessionProgram.epochInterval = Number($scope.sessionProgramEpoch.split(' ')[0]);
		
		$scope.sessionProgram.startDate = new Date($scope.sessionProgramDate.year,
				month, $scope.sessionProgramDate.day,hour,minute);
		$scope.sessionProgram.startDate = Date.parse($scope.sessionProgram.startDate);
		
		console.log($scope.sessionProgram);
		
		$http.post('/setSessionInfo', JSON.stringify($scope.sessionProgram)).then(
				function(response) {
					alert(response.statusText);
					$scope.goToSession('/currentSessions');
					
				}, function(error) {
					alert(error.statusText);
				});

		
	};
	

});

app.controller('netCtrl', function($scope, $http) {
	$scope.ethConfig = {
		address : '',
		netmask : '',
		gateway : ''
	};
	$scope.getNetParam = function() {
		$http.get('/getNetParam').then(function(response) {
			console.log(response.data);
			$scope.ethConfig.address = response.data.address;
			$scope.ethConfig.netmask = response.data.netmask;
			$scope.ethConfig.gateway = response.data.gateway;
		});
	};

	$scope.setNetParam = function() {
		$http.post('/setNetParam', JSON.stringify($scope.ethConfig)).then(
				function(response) {
					$scope.netSettingSuccess = 1;
					$scope.netSettingError = 0;
					$scope.netSettingResultShow = 1;
					$scope.netSettingResult = response.statusText;

				}, function(error) {
					$scope.netSettingSuccess = 0;
					$scope.netSettingError = 1;
					$scope.netSettingResultShow = 1;
					$scope.netSettingResult = error.statusText;

				});
	};
});

app.controller('pingHostCtrl', function($scope, $http) {
	$scope.pingHostFunc = function() {
		var request = {
			method : 'POST',
			url : '/pingHost',
			// headers : {
			// 'Content-Type' : undefined,
			// 'Content-Length' : undefined
			// },
			data : JSON.stringify($scope.pingHost)
		};

		$http(request).then(function(response) {
			$scope.pingResult = response.data;
		}, function(error) {
			console.log('an error occured');
		});

	};
});

app.controller('dataFilesCtrl', function($scope, $http, $window, $filter) {
	
	$scope.searchFiles = function(change) {
		if (change === true){
			$scope.selectAll = false;
			$scope.selectedFiles = [];
			tempDataList = $scope.temp;
		}
		//$scope.temp = $scope.dataList;
		$scope.dataList = $filter('filter')($scope.temp, $scope.search);
	};
	
	$scope.getDataList = function() {
		var tempSelectedFiles, tempDataList;
		$http.get('/lsDataFiles').then(function(response) {
				tempSelectedFiles = $scope.selectedFiles;
				tempDataList = $scope.dataList;
			
			$scope.selectedFiles = [];
			for (var k = 0; k < response.data.length; k++) {
				$scope.selectedFiles.push(false);
			}

			$scope.dataList = response.data;
			$scope.temp = response.data;
			
			if(tempSelectedFiles) {
				tempSelectedFiles.forEach(function(selectedFile, i) {
					if (selectedFile) {
						$scope.dataList.forEach(function(data, j) {
							if (tempDataList[i].name == data.name) {
								$scope.selectedFiles[j] = selectedFile;
							}
						});
					}
				});
			}
			$scope.searchFiles(false);

		});
	};

	$scope.changeAllCheckBox = function() {
		for (var k = 0; k < $scope.selectedFiles.length; k++) {
			$scope.selectedFiles[k] = $scope.selectAll;
		}
	};
	
	$scope.deleteFiles = function() {
		var deleteFilesList = [];
		if ($scope.selectedFiles.length > 0) {
			for (var k = 0; k < $scope.selectedFiles.length; k++) {
				if ($scope.selectedFiles[k] == true) {
					deleteFilesList.push($scope.dataList[k].name);
				}
			}
		}
		console.log(deleteFilesList);

		$http.post('/deleteFiles', JSON.stringify(deleteFilesList)).then(
				function(response) {
					alert(response.statusText);
					$scope.getDataList();
				}, function(error) {
					alert(error.statusText);
					$scope.getDataList();
				});

	};
	
	$scope.refreshFileList = setInterval(function() {
			$scope.getDataList();
			$scope.$on('$routeChangeStart', function(next, current) { 
				console.log(next, current);
				//if(next.originalPath != '/dataFiles') {
					clearInterval($scope.refreshFileList);
				//}
			});
	}, 5000);
	$scope.getDataFiles = function() {

		var dataFiles = [];
		console.log($scope.selectedFiles);
		$scope.selectedFiles.forEach(function(selectedFile, i) {
			if (selectedFile) {
				dataFiles.push({
					name : $scope.dataList[i].name
				});
			}
		});
		$http.post('/getDataFiles', JSON.stringify(dataFiles)).then(
				function(response) {
					var url = '/download/' + response.data.toString();
					$window.open(url);
				}, function(error) {
					console.log(error);
				});
	};

});

app.controller('ftpConfiguration', function($scope, $http, $window, $filter) {
	$scope.getFtpClient = function() {
		$http.get('/getFtpClient').then(function(response) {
			console.log(response.data);
			$scope.ftpClient = response.data;
		}, function(error) {
			alert(error.statusText);
		});
	};
	
	$scope.setFtpClient = function() {
		if ($scope.ftpClient.password === $scope.verifyPassword){
			console.log($scope.ftpClient);
			$http.post('/setFtpClient', JSON.stringify($scope.ftpClient)).then(function(response) {
				alert(response.statusText);
			}, function(error) {
				alert(error.statusText);
			});
		} else {
			alert("Password doesn't match!");

		}
	};
	
	$scope.testFtpClient = function() {
		var msg;
		if ($scope.ftpClient.password === $scope.verifyPassword){
			console.log($scope.ftpClient);
			$http.post('/testFtpClient', JSON.stringify($scope.ftpClient)).then(function(response) {
				msg = response.statusText + " Test OK!";
				alert(msg);
			}, function(error) {
				msg = "The process wasn't successfull. " + error.statusText;
				alert(msg);
			});
		} else {
			alert("Password doesn't match!");

		}
	};
	
	$scope.readLogFile = function() {
		var logRequest = {
				numberoflines : 100
		}
			$http.post('/readLogFile', JSON.stringify(logRequest)).then(function(response) {
				$scope.logFile = response.data;
			}, function(error) {
				alert(error.statusText);
			});
	};
	


	
});
