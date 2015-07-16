angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ble.services'])

  .run(function($ionicPlatform, $cordovaBluetoothSerial) {
    $ionicPlatform.ready(function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

      $cordovaBluetoothSerial.isEnabled(
        function() {
          console.log("Bluetooth is enabled");
        },
        function() {
          console.log("Bluetooth is *not* enabled");
          alert("Bluetooth is *not* enabled");
        }
      );
    });
  })

  .config(function($ionicConfigProvider){
    $ionicConfigProvider.tabs.position('bottom');
  })

  .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
      })

      .state('tab.dash', {
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'templates/tab-dash.html',
            controller: 'DashCtrl'
          }
        }
      })

      .state('tab.bluetooth', {
        url: '/bluetooth',
        views: {
          'tab-bluetooth': {
            templateUrl: 'templates/tab-bluetooth.html',
            controller: 'BlueToothCtrl'
          }
        }
      })

      .state('tab.ble', {
        url: '/ble',
        views: {
          'tab-ble': {
            templateUrl: 'templates/tab-ble.html',
            controller: 'BLECtrl'
          }
        }
      })

      .state('tab.color', {
        url: '/color',
        views: {
          'tab-bluetooth': {
            templateUrl: 'templates/tab-color.html',
            controller: 'ColorCtrl'
          }
        }
      })

      .state('tab.ble-detail', {
        url: '/ble/:deviceId',
        views: {
          'tab-ble': {
            templateUrl: 'templates/ble-detail.html',
            controller: 'BLEDetailCtrl'
          }
        }
      });

    $urlRouterProvider.otherwise('/tab/dash');

  });