angular.module('starter.controllers', ['ngCordova'])

	.controller('DashCtrl', function ($scope) {
	})

	.controller('BlueToothCtrl', function ($scope, $cordovaBluetoothSerial) {
		$scope.discoverDevices = {};
		$scope.listDevices = {};
		$scope.status = "未连接";
		$cordovaBluetoothSerial.isConnected().then(function(result){
		  console.log(result);
		});

		$cordovaBluetoothSerial.list().then(function (result) {
			$scope.devices = result;
			console.log(JSON.stringify(result));
		}, function (err) {
			alert(err);
		});

		$scope.onRefresh = function () {
			$cordovaBluetoothSerial.list().then(function (result) {
				$scope.listDevices = result;
				console.log("discover", JSON.stringify(result));
				$cordovaBluetoothSerial.discoverUnpaired().then(function (result) {
					console.log("discover", JSON.stringify(result));
					$scope.discoverDevices = result;
					$scope.$broadcast('scroll.refreshComplete');
				});
			});
		};

		$scope.connect = function (address) {
			console.log(address);
			$cordovaBluetoothSerial.connect(address).then(function (result) {
				$scope.status = "已连接";
				$cordovaBluetoothSerial.write('hello').then(function (result) {
					console.log(result);
				});
			});
		}
	})

	.controller('BLECtrl', function ($scope, BLE) {
		$scope.devices = BLE.devices;

		var success = function () {
			if ($scope.devices.length < 1) {
				alert("Didn't find any Bluetooth Low Energy devices.");
			}
		};

		var failure = function (error) {
			alert(error);
		};

		$scope.onRefresh = function () {
			BLE.scan().then(
				success, failure
			).finally(
				function () {
					$scope.$broadcast('scroll.refreshComplete');
				}
			)
		};

		BLE.scan().then(success, failure);
	})

	.controller('BLEDetailCtrl', function ($scope, $stateParams, BLE) {
		BLE.connect($stateParams.deviceId).then(
			function (peripheral) {
				console.log(peripheral);
				$scope.device = peripheral;
				$scope.services = peripheral.services;
			}
		);
	});