/* app.js */
(function(){

    var app = angular.module("wotClanInfo", ["ngRoute"]);

    /* Config */
    app.config(["$routeProvider", function($routeProvider) {
        $routeProvider
            .when("/main", {
                templateUrl: "partials/index.html",
                controller: "MainController"
            })
            .otherwise({
                redirectTo:"/main"
            })
    }]);

    /* Filters */
    app
        .filter('fromNow', ['$filter', function ($filter) {
            return function(date) {
                return moment.unix(date).fromNow();
            };
        }])
        .filter('percentage', ['$filter', function ($filter) {
            return function (input, decimals) {
                return ($filter('number')((input * 100).toFixed(2), decimals) || 0) + '%';
            };
        }])
        .filter('kilos', ['$filter', function ($filter) {
            return function (input) {
                return input > 999 ? (input/1000).toFixed(1) + 'k' : input;
            };
        }])
        .filter('goodrating', ['$filter', function ($filter) {
            return function (input) {
                var c = 0;
                for(i=0;i<input.length;i++) {
                    try{ if(input[i].extraInfo.global_rating>0) c++; } catch(e) {}
                }
                return c;
            };
        }])
        .filter('emblemUrl', ['$filter', function ($filter) {
            return function (input) {
                var url = "";
                try{
                    var lastThree = input.slice(input.length-3);
                    url = "http://eu.wargaming.net/clans/media/clans/emblems/cl_" + lastThree + "/" + input + "/emblem_195x195.png";
                } catch(e) {}
                return url;
            };
        }])
        .filter('lowerAndNoSpaces', ['$filter', function ($filter) {
            return function (input) {
                return $filter('lowercase')(input.replace(/ /g, '_'));
            };
        }])
        .filter('object2Array', ['$filter', function ($filter) {
            return function(input) {
                var out = [];
                for(i in input){
                    out.push(input[i]);
                }
                return out;
            }
        }]);

    app
        .directive('popOver', ['$compile', '$templateCache', '$log', function ($compile, $templateCache, $log) {
            var getTemplate = function () {
                $templateCache.put('templateId.html', 'This is the content of the template');
                $log.info($templateCache.get("popover_template.html"));
                return $templateCache.get("popover_template.html");
            };
            return {
                restrict: "A",
                transclude: true,
                template: "<span ng-transclude></span>",
                link: function (scope, element, attrs) {
                    var popOverContent;
                    if (scope) {
                        var html = getTemplate();
                        popOverContent = $compile(html)(scope);
                        var options = {
                            content: popOverContent,
                            placement: "right",
                            html: true,
                            title: scope.title,
                            container: "body",
                            trigger: "click"
                        };
                        $(element).popover(options);
                    }
                },
                scope: {
                    fans: '=',
                    title: '@'
                }
            };
        }])
        .directive('newScope', ['$compile', '$templateCache', '$log', function ($compile, $templateCache, $log) {
            return {
                restrict: 'EA',
                scope: {
                    model: '@'
                },
                priority: 450,
                compile: function () {
                    return {
                        pre: function (scope, element, attrs) {
                            scope.$eval(attrs.newScope);
                        }
                    };
                }
            };
        }]);

    /* *
    // from: http://weblogs.asp.net/dwahlin/creating-custom-angularjs-directives-part-i-the-fundamentals
    angular.module('moduleName').directive('myDirective', function () {
         return {
             restrict: 'EA', //E = element, A = attribute, C = class, M = comment
             scope: {
                 //@ reads the attribute value, = provides two-way binding, & works with functions
                 title: '@'
             },
             template: '<div>{{ myVal }}</div>',
             templateUrl: 'mytemplate.html',
             controller: controllerFunction, //Embed a custom controller in the directive
             link: function ($scope, element, attrs) { } //DOM manipulation
         }
     });
    * */
}());