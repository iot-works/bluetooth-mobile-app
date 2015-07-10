angular.module('starter.controllers', ['ngCordova'])

  .controller('DashCtrl', function($scope) {})

  .controller('BlueToothCtrl', function($scope, $cordovaBluetoothSerial) {
    console.log("enter bluetooth");
    $cordovaBluetoothSerial.list().then(function (result) {
      $scope.devices = result;
      console.log(JSON.stringify(result));
    }, function(err){
      console.log(err);
    });

    $scope.onRefresh = function() {
      console.log("refresh");
      $cordovaBluetoothSerial.list().then(function (result) {
        $scope.devices = result;
        $scope.$broadcast('scroll.refreshComplete');
      });
    };
  })

  .controller('BLECtrl', function($scope, BLE) {
    $scope.devices = BLE.devices;

    var success = function () {
      if ($scope.devices.length < 1) {
        alert("Didn't find any Bluetooth Low Energy devices.");
      }
    };

    var failure = function (error) {
      alert(error);
    };

    $scope.onRefresh = function() {
      BLE.scan().then(
        success, failure
      ).finally(
        function() {
          $scope.$broadcast('scroll.refreshComplete');
        }
      )
    };

    BLE.scan().then(success, failure);
  })

  .controller('BLEDetailCtrl', function($scope, $stateParams, BLE) {
    BLE.connect($stateParams.deviceId).then(
      function(peripheral) {
        $scope.device = peripheral;
      }
    );
  });