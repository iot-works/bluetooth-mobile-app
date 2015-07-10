angular.module('starter.controllers', ['ngCordova'])

  .controller('DashCtrl', function($scope) {})

  .controller('BlueToothCtrl', function($scope, $cordovaBluetoothSerial) {
    $scope.status = "未连接";
    $cordovaBluetoothSerial.isConnected().then(function(result){
      console.log(result);
    });

    $cordovaBluetoothSerial.list().then(function (result) {
      $scope.devices = result;
      console.log(JSON.stringify(result));
    }, function(err){
      console.log(err);
    });

    $scope.onRefresh = function() {
      $cordovaBluetoothSerial.list().then(function (result) {
        console.log(JSON.stringify(result));
        $scope.devices = result;
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.connect = function(address) {
      console.log(address);
      $cordovaBluetoothSerial.connect(address).then(function(result){
        $scope.status = "已连接"
      });
    }
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