angular.module('starter.services', [])
	.factory('BLE', function ($q) {

		var connected;
		return {
			devices: [],

			scan: function () {
				var that = this;
				var deferred = $q.defer();

				that.devices.length = 0;

				// disconnect the connected device (hack, device should disconnect when leaving detail page)
				if (connected) {
					var id = connected.id;
					ble.disconnect(connected.id, function () {
						console.log("Disconnected " + id);
					});
					connected = null;
				}

				ble.startScan([], /* scan for all services */
					function (peripheral) {
						that.devices.push(peripheral);
					},
					function (error) {
						deferred.reject(error);
					});

				// stop scan after 5 seconds
				setTimeout(ble.stopScan, 5000,
					function () {
						deferred.resolve();
					},
					function () {
						console.log("stopScan failed");
						deferred.reject("Error stopping scan");
					}
				);

				return deferred.promise;
			},
			connect: function (deviceId) {
				var deferred = $q.defer();

				ble.connect(deviceId,
					function (peripheral) {
						connected = peripheral;
						deferred.resolve(peripheral);
					},
					function (reason) {
						deferred.reject(reason);
					}
				);

				return deferred.promise;
			}
		};
	});