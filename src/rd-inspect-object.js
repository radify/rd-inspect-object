import angular from 'angular';

class InspectorController {

  constructor() {
    var keys     = Object.keys.bind(Object),
        isObject = angular.isObject.bind(angular),
        isArray  = angular.isArray.bind(angular);

    angular.extend(this, {
      keys, isObject, isArray,
      typeOf:  val => ({}).toString.call(val).match(/\s([a-zA-Z]+)/)[1].toLowerCase(),
      isEmpty: val => (isArray(val) && val.length === 0) || (isObject(val) && keys(val).length === 0)
    });
  }
}

export default angular.module('rd-inspect-object', [])
.directive('rdInspectObject', () => {
  return {
    controllerAs: 'ctrl',
    bindToController: true,
    scope: { value: '=' },
    restrict: 'E',
    templateUrl: 'inspect-object.html',
    controller: InspectorController
  };
}).
directive('rdInspectObjectElement', ['RecursionHelper', (RecursionHelper) => {
  return {
    controllerAs: 'ctrl',
    bindToController: true,
    scope: { object: '=', key: '=', value: '=' },
    restrict: 'E',
    templateUrl: 'inspect-object-element.html',
    compile: RecursionHelper.compile.bind(RecursionHelper),
    controller: class extends InspectorController {
      constructor() {
        super();
        angular.extend(this, {
          state: { open: false }
        });
      }
    }
  };
}])
.factory('RecursionHelper', ['$compile', $compile => {
  return {
    /**
     * Manually compiles the element, fixing the recursion loop.
     * @param element
     * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
     * @returns An object containing the linking functions.
     */
    compile: (element, link) => {
      // Normalize the link parameter
      link = (angular.isFunction(link)) ? { post: link } : link;

      // Break the recursion loop by removing the contents
      var contents = element.contents().remove();
      var compiledContents;

      return {
        pre: (link && link.pre) ? link.pre : null,
        /**
         * Compiles and re-adds the contents
         */
        post: function(scope, element) {
          // Compile the contents, re-add the compiled contents to the element
          (compiledContents = compiledContents || $compile(contents))(scope, clone => element.append(clone));

          // Call the post-linking function, if any
          if (link && link.post) link.post.apply(null, arguments);
        }
      };
    }
  };
}]);
