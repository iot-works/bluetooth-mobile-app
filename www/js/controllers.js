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

	.controller('BLEDetailCtrl', function ($scope, $stateParams, BLE,  $cordovaToast, Characteristics) {
		var bytesToString = function(buffer) {
			return String.fromCharCode.apply(null, new Uint8Array(buffer));
		}

		var arrayBufferToInt = function (buffer) {
			var a = new Uint8Array(buffer);
			return a[0];
		};

		function convert(buffer) {
			var int = arrayBufferToInt(buffer);
			if(parseInt(int) !== 0) {
				return int;
			} else {
				return bytesToString(buffer);
			}
		}

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
				var characteristics = [{}];
				angular.forEach(peripheral.characteristics, function(characteristic){
					var SpecificationName = Characteristics.get(characteristic.characteristic).name;
					if(SpecificationName){
						characteristic.SpecificationName = SpecificationName;
					} else {
						characteristic.SpecificationName = characteristic.characteristic
					}
					characteristics.push(characteristic);
				});
				$scope.characteristics = characteristics;
			}
		);
		$scope.read = function(characteristsic) {
			console.log(JSON.stringify(characteristsic));
				ble.read($stateParams.deviceId, characteristsic.service, characteristsic.characteristic, function(data){
					alert(JSON.stringify(convert(data)));
					console.log(JSON.stringify(convert(data)));
				}, function(err){
					alert(JSON.stringify(convert(err)));
					console.log(JSON.stringify(convert(err)));
			});
		}
	});