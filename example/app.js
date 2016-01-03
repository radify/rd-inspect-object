import angular from 'angular';
import 'rd-inspect-object';

angular.module('rd-object-example', [
  'rd-inspect-object'
]).controller('ExampleController', ['$scope', function($scope) {
  this.data = {
    key: 'value',
    nested: { data: true },
    number: 5,
    bool: true,
    array: [{ key: 'value'}, 2, 3, 4, 5, {
      extra: { data: true }
    }]
  };
}]);