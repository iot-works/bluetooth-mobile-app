angular.module('starter.controllers', ['ngCordova'])

	.controller('DashCtrl', function ($scope) {
		$scope.last = localStorage.getItem("last_device");
	})

	.controller('ColorCtrl', function ($scope, $cordovaBluetoothSerial) {
		$scope.rgbValue = "";

		$('#colorpickerHolder').ColorPicker({
			flat: true,
			onChange: function (hsb, hex, rgb) {
				$scope.$apply(function () {
					$scope.rgbValue = rgb.r  + "," + rgb.g + "," + rgb.b;
				});
			}
		});

		$scope.send = function () {
			$cordovaBluetoothSerial.write($scope.rgbValue).then(function (result) {
				console.log('write:' + $scope.rgbValue + ":" + result);
			});
		}
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

		$scope.connect = function (address, device) {
			console.log("click connect" + address);
			$cordovaBluetoothSerial.connect(address).then(function (result) {
				localStorage.setItem("last_device",  device);
				$state.go('tab.color');
			});
			$cordovaBluetoothSerial.subscribeRawData().then(function (result) {
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

	.controller('BLEDetailCtrl', function ($scope, $stateParams, BLE, $cordovaToast, Characteristics) {
		var bytesToString = function (buffer) {
			return String.fromCharCode.apply(null, new Uint8Array(buffer));
		};

		var arrayBufferToInt = function (buffer) {
			var a = new Uint8Array(buffer);
			return a[0];
		};

		function convert(buffer) {
			var result = bytesToString(buffer);
			if (result !== "" && result.length > 0 && arrayBufferToInt(buffer)) {
				return result;
			} else {
				return arrayBufferToInt(buffer);
			}
		}

		BLE.connect($stateParams.deviceId).then(
			function (peripheral) {
				$cordovaToast
					.show('连接到' + peripheral.name, 'long', 'center')
					.then(function (success) {
					}, function (error) {
					});

				console.log(JSON.stringify(peripheral));
				$scope.device = peripheral;
				$scope.services = peripheral.services;
				var characteristics = [{}];
				angular.forEach(peripheral.characteristics, function (characteristic) {
					var SpecificationName = Characteristics.get(characteristic.characteristic).name;
					if (SpecificationName) {
						characteristic.SpecificationName = SpecificationName;
					} else {
						characteristic.SpecificationName = characteristic.characteristic
					}
					characteristics.push(characteristic);
				});
				$scope.characteristics = characteristics;
			}
		);
		$scope.read = function (characteristsic) {
			ble.read($stateParams.deviceId, characteristsic.service, characteristsic.characteristic, function (data) {
				alert(JSON.stringify(convert(data)));
			}, function (err) {
				alert(JSON.stringify(convert(err)));
			});
		}
	});