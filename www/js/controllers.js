angular.module('starter.controllers', ['ngCordova'])

	.controller('DashCtrl', function ($scope) {
	})

	.controller('ColorCtrl', function ($scope, $cordovaBluetoothSerial) {
		var $box = $('#colorPicker');
		$box.tinycolorpicker();
		var box = $box.data("plugin_tinycolorpicker");

		box.setColor("#ff0000");

		$box.bind("change", function()
		{
			var rgb = box.colorRGB;
			console.log(rgb);
			$cordovaBluetoothSerial.write(rgb).then(function (result) {
				console.log('write' + rgb + result);
			});
		});
	})

	.controller('BlueToothCtrl', function ($scope, $ionicPlatform, $cordovaBluetoothSerial, $state) {
		$scope.discoverDevices = {};
		$scope.listDevices = {};
		$scope.status = "未连接";
		$ionicPlatform.ready(function () {
			$cordovaBluetoothSerial.isConnected().then(function (result) {
				$scope.status = "已连接";
			});

			$cordovaBluetoothSerial.list().then(function (result) {
				$scope.devices = result;
			});
		});

		$scope.onRefresh = function () {
			$cordovaBluetoothSerial.clear().then(function (result) {
				$cordovaBluetoothSerial.list().then(function (result) {
					$scope.listDevices = result;
					console.log("已配对", JSON.stringify(result));
					$cordovaBluetoothSerial.discoverUnpaired().then(function (result) {
						console.log("未配对", JSON.stringify(result));
						$scope.discoverDevices = result;
						$scope.$broadcast('scroll.refreshComplete');
					}, function (err) {
						alert(err);
					});
				});
			});
		};

		$scope.connect = function (address) {
			console.log("click connect" + address);
			$cordovaBluetoothSerial.connect(address).then(function (result) {
				$state.go('tab.color');
			});
			$cordovaBluetoothSerial.subscribeRawData().then(function(result){
				console.log("raw data" + result);
			})
		};
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

	.controller('BLEDetailCtrl', function ($scope, $stateParams, BLE,  $cordovaToast) {
		BLE.connect($stateParams.deviceId).then(
			function (peripheral) {
				$cordovaToast
					.show('连接到' + peripheral.name, 'long', 'center')
					.then(function(success) {
					}, function (error) {
					});

				console.log(JSON.stringify(peripheral));
				$scope.device = peripheral;
				$scope.services = peripheral.services;
				$scope.characteristics = peripheral.characteristics;
			}
		);
		$scope.read = function(characteristsic) {
			console.log(JSON.stringify(characteristsic));
				ble.read($stateParams.deviceId, characteristsic.service, characteristsic.characteristic, function(data){
					var arrayBufferToInt = function (ab) {
						var a = new Uint8Array(ab);
						return a[0];
					};

					alert("data" + JSON.stringify(arrayBufferToInt(data)));
					console.log(JSON.stringify(data));
				}, function(err){
					alert("err" + JSON.stringify(arrayBufferToInt(err)));
					console.log(JSON.stringify(err));
			});
		}
	});