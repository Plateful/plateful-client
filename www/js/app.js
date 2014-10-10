(function() {
  var app, k, v,
    __slice = [].slice;
  var GLOBALS = GLOBALS || {};
  app = angular.module("app", [
    "ionic",
    "restangular",
    "ngAnimate",
    'ngGPlaces',
    'classy',
    "fx.animations",
    "google-maps",
    "ion-google-place",
    "app.services",
    "app.directives",
    "app.filters",
    "app.models",
    "app.tabs",
    "app.states",
    'google.places'
  ]);

  app.config(function(RestangularProvider) {


    RestangularProvider.setBaseUrl('http://platefulserver.herokuapp.com/api/v1/');
    // RestangularProvider.setBaseUrl('http://server4dave.cloudapp.net:9000/api/v1/');
    // RestangularProvider.setBaseUrl('http://10.8.29.210:9000/api/v1/');
    // RestangularProvider.setBaseUrl('http://localhost:9000/api/v1/');



    RestangularProvider.setRequestSuffix('/');
    RestangularProvider.setRestangularFields({
      cache: true,
      id: '_id',
      route: "restangularRoute",
      selfLink: "self.href"
    });
  });

  for (k in GLOBALS) {
    v = GLOBALS[k];
    app.constant(k, v);
  }

  if (GLOBALS.WEINRE_ADDRESS && (ionic.Platform.isAndroid() || ionic.Platform.isIOS())) {
    addElement(document, "script", {
      id: "weinre-js",
      src: "http://" + GLOBALS.WEINRE_ADDRESS + "/target/target-script-min.js#anonymous"
    });
  }

}).call(this);

(function() {
  angular.module('app').controller('AppCtrl', [
    '$scope', '$rootScope', '$ionicModal', '$ionicNavBarDelegate', 'CreateReview', 'BackgroundGeo', function($scope, $rootScope, $ionicModal, $ionicNavBarDelegate, CreateReview, BackgroundGeo) {
      $ionicModal.fromTemplateUrl('imageModal.html', function($ionicModal) {
        return $rootScope.imageModal = $ionicModal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });
      $ionicModal.fromTemplateUrl('collectModal.html', function($ionicModal) {
        return $rootScope.collectModal = $ionicModal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });
      $ionicModal.fromTemplateUrl('rateModal.html', function($ionicModal) {
        return $rootScope.rateModal = $ionicModal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });
      $scope.goBack = function() {
        return $ionicNavBarDelegate.back();
      };
      $scope.submit = function() {
        var fail, ft, imgUrl, options, params, win;
        imgUrl = CreateReview.get('image_url');
        win = function(r) {
          console.log("Code = " + r.responseCode);
          return console.log("Response = " + r.response);
        };
        fail = function(error) {
          alert("An error has occurred: Code = " + error.code);
          console.log("upload error source " + error.source);
          return console.log("upload error target " + error.target);
        };
        options = new FileUploadOptions();
        options.fileKey = "image_url";
        options.fileName = imgUrl.substr(imgUrl.lastIndexOf('/') + 1);
        options.chunkedMode = false;
        options.mimeType = "image/jpeg";
        params = {};
        params.menu = "menu";
        params.rating = "rating";
        options.params = params;
        ft = new FileTransfer();
        return ft.upload(imgUrl, encodeURI('http://10.8.29.210:9000/api/v1/reviews'), win, fail, options);
      };
      $scope.takePhoto = function() {
        var onFail, onSuccess, options;
        options = {
          quality: 75,
          targetWidth: 320,
          targetHeight: 320,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.CAMERA,
          encodingType: 0,
          allowEdit: true
        };
        onSuccess = function(imageData) {
          $scope.src = imageData;
          $scope.$apply();
          CreateReview.set('image_url', imageData);
          $scope.submit();
        };
        onFail = function(error) {
          return $scope.src = error;
        };
        navigator.camera.getPicture(onSuccess, onFail, options);
        return BackgroundGeo.current().then(function(position) {
          $scope.lat = position.latitude;
          $scope.lng = position.longitude;
          return console.log($scope.lat, $scope.lng);
        }, function(error) {
          return console.log('Unable to get current location: ' + error);
        });
      };
    }
  ]);

}).call(this);

(function() {
  var app;

  app = angular.module("app");

  app.constant('ServerUrl', 'http://platefulserver.herokuapp.com/');

  ionic.Platform.ready(function() {
    app.config(function($provide, $httpProvider) {
      var _base;
      (_base = $httpProvider.defaults.headers).patch || (_base.patch = {});
      $httpProvider.defaults.headers.patch['Content-Type'] = 'application/json';
      return $httpProvider.interceptors.push(function($injector, $q) {
        return {
          responseError: function(response) {
            if (GLOBALS.ENV !== "test") {
              console.log("httperror: ", response.status);
            }
            if (response.status === 401) {
              $injector.invoke(function(Auth) {
                return Auth.setAuthToken(null);
              });
            }
            return $q.reject(response);
          }
        };
      });
    });
    return angular.bootstrap(document, ['app']);
  });

  app.run(function($rootScope, Auth, $window, $timeout, BackgroundGeo, Restangular) {
    $rootScope.currentLocation = window.backgroundGeoLocation;
    $rootScope.$apply();
    $rootScope.GLOBALS = GLOBALS;
    $timeout(function() {
      var _ref;
      return $window.$a = (_ref = angular.element(document.body).injector()) != null ? _ref.get : void 0;
    });
    $rootScope.$watch((function() {
      var _ref;
      return (_ref = Auth.user) != null ? _ref.id : void 0;
    }), function() {
      return $rootScope.current_user = Auth.user;
    });
    this.log = function() {
      var array = Array.prototype.slice.call(arguments);
      return console.log(array.join(" "));
    };
    this.info = function() {
      var array = Array.prototype.slice.call(arguments);
      return console.info(array.join(" "));
    };
    this.Err = function(parn) {
      var array = Array.prototype.slice.call(arguments);
      return console.error(array.join(" "));
    };
    this.warn = function(parn) {
      var array = Array.prototype.slice.call(arguments);
      return console.warn(array.join(" "));
    };
    //  $angularCacheFactory('defaultCache', {
    //     maxAge: 900000, // Items added to this cache expire after 15 minutes.
    //     cacheFlushInterval: 6000000, // This cache will clear itself every hour.
    //     deleteOnExpire: 'aggressive' // Items will be deleted from this cache right when they expire.
    // });

    // $http.defaults.cache = $angularCacheFactory.get('defaultCache');
    return $timeout(function() {
      var _ref;
      return (_ref = navigator.splashscreen) != null ? _ref.hide() : void 0;
    });
  });

}).call(this);

(function() {
  this.addElement = function(container, tagName, attrs) {
    var fjs, k, tag, v;
    if (attrs === null) {
      attrs = {};
    }
    if (attrs.id && container.getElementById(attrs.id)) {
      return container.getElementById(attrs.id);
    }
    fjs = container.getElementsByTagName(tagName)[0];
    tag = container.createElement(tagName);
    for (k in attrs) {
      v = attrs[k];
      tag[k] = v;
    }
    fjs.parentNode.insertBefore(tag, fjs);
    return tag;
  };




  Storage.prototype.setObject = function(key, value) {
    return this.setItem(key, JSON.stringify(value));
  };

  Storage.prototype.getObject = function(key) {
    var value;
    if (!(value = this.getItem(key))) {
      return;
    }
    return JSON.parse(value);
  };

  if (window.GLOBALS === null) {
    window.GLOBALS = {};
  }

  window._RIPPLE = false;

  window._CORDOVA = !location.hostname;

  ionic.Platform.ready(function() {
    window._RIPPLE = window.tinyHippos !== void 0;
    window._CORDOVA = window.cordova !== void 0;
    window.currLocation = {
      coords: {
        accuracy: 30,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 37.783692599999995,
        longitude: -122.409235,
        speed: null
      }
    };
    window.locality = {
      latitude: 37.783692599999995,
      longitude: 122.409235
    }
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }

    return window.navigator.geolocation.getCurrentPosition(function(location) {
      window.currLocation = location;
      return console.log('Location from Phonegap', location);
    });
  });

}).call(this);

(function() {
  angular.module('app.directives', [
    "ngSelect",
    "ngRater",
    "ngPlaces",
    "ngBackImg",
    "ngAutocomplete",
    "ngFadeIn"
    // "googleAutocomplete"
  ])
  .directive('googleplace', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {}
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                scope.$apply(function() {
                    console.log(element.val())
                    model.$setViewValue(element.val());
                });
            });
        }
    };
});

}).call(this);

(function(){
  // Takes a number n and creates an array of arrays with each inner array length n.
  // Used for distributing arrays among rows in views.
  // Ex: An array of length 10 called with partition:3 will result in an array containing
  //     4 arrays each of length 3.
  var partition = function($cacheFactory) {
    var arrayCache = $cacheFactory('partition');
    var filter = function(arr, size) {
      if (!arr) { return; }
      var newArr = [];
      for (var i=0; i<arr.length; i+=size) {
        newArr.push(arr.slice(i, i+size));
      }
      // Enter blank space for any remaining columns in the last row.
      newArr[newArr.length-1].length = size;
      var cachedParts;
      var arrString = JSON.stringify(arr);
      cachedParts = arrayCache.get(arrString+size);
      if (JSON.stringify(cachedParts) === JSON.stringify(newArr)) {
        return cachedParts;
      }
      arrayCache.put(arrString+size, newArr);
      return newArr;
    };
    return filter;
  };

  partition.$inject = ['$cacheFactory'];

  angular.module('app.filters', [])
    .filter('partition', partition);

}).call(this);


/*
 *
 *   app.factories all are all the factories that primarily deal with
 *   Restful calls to the server
 *
 *
 *   Architecture Update: Convert all modules | app.factories - to - app.models
 *   SOURCE OF TRUTH
 *
 */

(function() {
  angular
    .module('app.models', [
      'app.model.menu',
      'app.model.item',
      'app.model.review',
      'app.model.list',
      'app.model.user',
      'app.model.photo',
      'app.model.fbLogin'
    ]);
}).call(this);

(function() {
  angular.module('app.services', [
    "app.services.findDistance",
    "app.services.makeStars",
    "app.services.BackgroundGeo"
  ]);

}).call(this);

(function() {
  angular
    .module('app.states', [
      "app.states.menu",
      "app.states.item",
      "app.states.map",
      "app.states.login",
      "app.states.splash"
    ]);
}).call(this);

(function() {
  angular.module('app.tabs', [
    'app.tabs.items',
    'app.tabs.menus',
    'app.tabs.review',
    'app.tabs.list',
    'app.tabs.settings'
  ])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state("tab", {
      url: "/tab",
      abstract: true,
      templateUrl: "js/tabs/tabs.html"
    });

    $urlRouterProvider.otherwise('/');
  });

}).call(this);

(function() {
  (function() {
    var TabsCtrl;
    TabsCtrl = function($scope) {};
    TabsCtrl.$inject = ['$scope'];
    return angular.module('app.tabs').controller('TabsCtrl', TabsCtrl);
  })();

}).call(this);

/*
 * angular-google-places-autocomplete
 *
 * Copyright (c) 2014 "kuhnza" David Kuhn
 * Licensed under the MIT license.
 * https://github.com/kuhnza/angular-google-places-autocomplete/blob/master/LICENSE
 */

 // 'use strict';

angular.module('googleAutocomplete', [])
  /**
   * DI wrapper around global google places library.
   *
   * Note: requires the Google Places API to already be loaded on the page.
   */
  .factory('googlePlacesApi', ['$window', function ($window) {
        if (!$window.google) throw 'Global `google` var missing. Did you forget to include the places API script?';

    return $window.google;
  }])

  /**
   * Autocomplete directive. Use like this:
   *
   * <input type="text" g-places-autocomplete ng-model="myScopeVar" />
   */
  .directive('googleAutocomplete',
        [ '$parse', '$compile', '$timeout', '$document', 'googlePlacesApi',
        function ($parse, $compile, $timeout, $document, google) {

            return {
                restrict: 'A',
                require: '^ngModel',
                scope: {
                    model: '=ngModel',
                    options: '=?',
                    forceSelection: '=?',
                    customPlaces: '=?'
                },
                controller: ['$scope', function ($scope) {}],
                link: function ($scope, element, attrs, controller) {
                    var keymap = {
                            tab: 9,
                            enter: 13,
                            esc: 27,
                            up: 38,
                            down: 40
                        },
                        hotkeys = [keymap.tab, keymap.enter, keymap.esc, keymap.up, keymap.down],
                        autocompleteService = new google.maps.places.AutocompleteService(),
                        placesService = new google.maps.places.PlacesService(element[0]);

                    (function init() {
                        $scope.query = '';
                        $scope.predictions = [];
                        $scope.input = element;
                        $scope.options = $scope.options || {};

                        initAutocompleteDrawer();
                        initEvents();
                        initNgModelController();
                    }());

                    function initEvents() {
                        element.bind('keydown', onKeydown);
                        element.bind('blur', onBlur);

                        $scope.$watch('selected', select);
                    }

                    function initAutocompleteDrawer() {
                        // Drawer element used to display predictions
                        var drawerElement = angular.element('<div g-places-autocomplete-drawer></div>'),
                            body = angular.element($document[0].body),
                            $drawer;

                        drawerElement.attr({
                            input: 'input',
                            query: 'query',
                            predictions: 'predictions',
                            active: 'active',
                            selected: 'selected'
                        });

                        $drawer = $compile(drawerElement)($scope);
                        body.append($drawer);  // Append to DOM
                    }

                    function initNgModelController() {
                        controller.$parsers.push(parse);
                        controller.$formatters.push(format);
                        controller.$render = render;
                    }

                    function onKeydown(event) {
                        if ($scope.predictions.length === 0 || indexOf(hotkeys, event.which) === -1) {
                            return;
                        }

                        event.preventDefault();

                        if (event.which === keymap.down) {
                            $scope.active = ($scope.active + 1) % $scope.predictions.length;
                            $scope.$digest();
                        } else if (event.which === keymap.up) {
                            $scope.active = ($scope.active ? $scope.active : $scope.predictions.length) - 1;
                            $scope.$digest();
                        } else if (event.which === 13 || event.which === 9) {
                            if ($scope.forceSelection) {
                                $scope.active = ($scope.active === -1) ? 0 : $scope.active;
                            }

                            $scope.$apply(function () {
                                $scope.selected = $scope.active;

                                if ($scope.selected === -1) {
                                    clearPredictions();
                                }
                            });
                        } else if (event.which === 27) {
                            event.stopPropagation();
                            clearPredictions();
                            $scope.$digest();
                        }
                    }

                    function onBlur(event) {
                        if ($scope.predictions.length === 0) {
                            return;
                        }

                        if ($scope.forceSelection) {
                            $scope.selected = ($scope.selected === -1) ? 0 : $scope.selected;
                        }

                        $scope.$digest();

                        $scope.$apply(function () {
                            if ($scope.selected === -1) {
                                clearPredictions();
                            }
                        });
                    }

                    function select() {
                        var prediction;

                        prediction = $scope.predictions[$scope.selected];
                        if (!prediction) return;

                        if (prediction.is_custom) {
                            $scope.model = prediction.place;
                            $scope.$emit('g-places-autocomplete:select', prediction.place);
                        } else {
                            placesService.getDetails({ placeId: prediction.place_id }, function (place, status) {
                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    $scope.$apply(function () {
                                        $scope.model = place;
                                        $scope.$emit('g-places-autocomplete:select', place);
                                    });
                                }
                            });
                        }

                        clearPredictions();
                    }

                    function parse(viewValue) {
                        var request;

                        if (!(viewValue && isString(viewValue))) return viewValue;

                        $scope.query = viewValue;

                        request = angular.extend({ input: viewValue }, $scope.options);
                        autocompleteService.getPlacePredictions(request, function (predictions, status) {
                            $scope.$apply(function () {
                                var customPlacePredictions;

                                clearPredictions();

                                if ($scope.customPlaces) {
                                    customPlacePredictions = getCustomPlacePredictions($scope.query);
                                    $scope.predictions.push.apply($scope.predictions, customPlacePredictions);
                                }

                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    $scope.predictions.push.apply($scope.predictions, predictions);
                                }

                                if ($scope.predictions.length > 5) {
                                    $scope.predictions.length = 5;  // trim predictions down to size
                                }
                            });
                        });

                        return viewValue;
                    }

                    function format(modelValue) {
                        var viewValue = "";

                        if (isString(modelValue)) {
                            viewValue = modelValue;
                        } else if (isObject(modelValue)) {
                            viewValue = modelValue.formatted_address;
                        }

                        return viewValue;
                    }

                    function render() {
                        return element.val(controller.$viewValue);
                    }

                    function clearPredictions() {
                        $scope.active = -1;
                        $scope.selected = -1;
                        $scope.predictions.length = 0;
                    }

                    function getCustomPlacePredictions(query) {
                        var predictions = [],
                            place, match, i;

                        for (i = 0; i < $scope.customPlaces.length; i++) {
                            place = $scope.customPlaces[i];

                            match = getCustomPlaceMatches(query, place);
                            if (match.matched_substrings.length > 0) {
                                predictions.push({
                                    is_custom: true,
                                    custom_prediction_label: place.custom_prediction_label || '(Custom Non-Google Result)',  // required by https://developers.google.com/maps/terms § 10.1.1 (d)
                                    description: place.formatted_address,
                                    place: place,
                                    matched_substrings: match.matched_substrings,
                                    terms: match.terms
                                });
                            }
                        }

                        return predictions;
                    }

                    function getCustomPlaceMatches(query, place) {
                        var q = query + '',  // make a copy so we don't interfere with subsequent matches
                            terms = [],
                            matched_substrings = [],
                            fragment,
                            termFragments,
                            i;

                        termFragments = place.formatted_address.split(',');
                        for (i = 0; i < termFragments.length; i++) {
                            fragment = termFragments[i].trim();

                            if (q.length > 0) {
                                if (fragment.length >= q.length) {
                                    if (startsWith(fragment, q)) {
                                        matched_substrings.push({ length: q.length, offset: i });
                                    }
                                    q = '';  // no more matching to do
                                } else {
                                    if (startsWith(q, fragment)) {
                                        matched_substrings.push({ length: fragment.length, offset: i });
                                        q = q.replace(fragment, '').trim();
                                    } else {
                                        q = '';  // no more matching to do
                                    }
                                }
                            }

                            terms.push({
                                value: fragment,
                                offset: place.formatted_address.indexOf(fragment)
                            });
                        }

                        return {
                            matched_substrings: matched_substrings,
                            terms: terms
                        };
                    }

                    function isString(val) {
                        return toString.call(val) == '[object String]';
                    }

                    function isObject(val) {
                        return toString.call(val) == '[object Object]';
                    }

                    function indexOf(array, item) {
                        var i, length;

                        if (array == null) return -1;

                        length = array.length;
                        for (i = 0; i < length; i++) {
                            if (array[i] === item) return i;
                        }
                        return -1;
                    }

                    function startsWith(string1, string2) {
                        return string1.lastIndexOf(string2, 0) === 0;
                    }
                }
            }
        }
    ])


    .directive('gPlacesAutocompleteDrawer', ['$window', '$document', function ($window, $document) {
        var TEMPLATE = [
            '<div class="pac-container" ng-if="isOpen()" ng-style="{top: position.top+\'px\', left: position.left+\'px\', width: position.width+\'px\'}" style="display: block;" role="listbox" aria-hidden="{{!isOpen()}}">',
            '  <div class="pac-item" g-places-autocomplete-prediction index="$index" prediction="prediction" query="query"',
            '       ng-repeat="prediction in predictions track by $index" ng-class="{\'pac-item-selected\': isActive($index) }"',
            '       ng-mouseenter="selectActive($index)" ng-click="selectPrediction($index)" role="option" id="{{prediction.id}}">',
            '  </div>',
            '</div>'
        ];

        return {
            restrict: 'A',
            scope:{
                input: '=',
                query: '=',
                predictions: '=',
                active: '=',
                selected: '='
            },
            template: TEMPLATE.join(''),
            link: function ($scope, element) {
                element.bind('mousedown', function (event) {
                    event.preventDefault();  // prevent blur event from firing when clicking selection
                });

                $scope.isOpen = function () {
                    return $scope.predictions.length > 0;
                };

                $scope.isActive = function (index) {
                    return $scope.active === index;
                };

                $scope.selectActive = function (index) {
                    $scope.active = index;
                };

                $scope.selectPrediction = function (index) {
                    $scope.selected = index;
                };

                $scope.$watch('predictions', function () {
                    $scope.position = getDrawerPosition($scope.input);
                });

                function getDrawerPosition(element) {
                    var domEl = element[0],
                        rect = domEl.getBoundingClientRect(),
                        docEl = $document[0].documentElement,
                        body = $document[0].body,
                        scrollTop = $window.pageYOffset || docEl.scrollTop || body.scrollTop,
                        scrollLeft = $window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

                    return {
                        width: rect.width,
                        height: rect.height,
                        top: rect.top + rect.height + scrollTop,
                        left: rect.left + scrollLeft
                    };
                }
            }
        }
    }])

    .directive('gPlacesAutocompletePrediction', [function () {
        var TEMPLATE = [
            '<span class="pac-icon pac-icon-marker"></span>',
            '<span class="pac-item-query" ng-bind-html="prediction | highlightMatched"></span>',
            '<span ng-repeat="term in prediction.terms | unmatchedTermsOnly:prediction">{{term.value | trailingComma:!$last}}&nbsp;</span>',
            '<span class="custom-prediction-label" ng-if="prediction.is_custom">&nbsp;{{prediction.custom_prediction_label}}</span>'
        ];

        return {
            restrict: 'A',
            scope:{
                index:'=',
                prediction:'=',
                query:'='
            },
            template: TEMPLATE.join('')
        }
    }])

    .filter('highlightMatched', ['$sce', function ($sce) {
        return function (prediction) {
            var matchedPortion = '',
                unmatchedPortion = '',
                matched;

            if (prediction.matched_substrings.length > 0 && prediction.terms.length > 0) {
                matched = prediction.matched_substrings[0];
                matchedPortion = prediction.terms[0].value.substr(matched.offset, matched.length);
                unmatchedPortion = prediction.terms[0].value.substr(matched.offset + matched.length);
            }

            return $sce.trustAsHtml('<span class="pac-matched">' + matchedPortion + '</span>' + unmatchedPortion);
        }
    }])

    .filter('unmatchedTermsOnly', [function () {
        return function (terms, prediction) {
            var i, term, filtered = [];

            for (i = 0; i < terms.length; i++) {
                term = terms[i];
                if (prediction.matched_substrings.length > 0 && term.offset > prediction.matched_substrings[0].length) {
                    filtered.push(term);
                }
            }

            return filtered;
        }
    }])

    .filter('trailingComma', [function () {
        return function (input, condition) {
            return (condition) ? input + ',' : input;
        }
    }]);

// (function() {
//
//     var googleItems = function($ionicTemplateLoader, $ionicBackdrop, $q, $timeout, $rootScope, $document, ngGPlacesAPI, MenusData){
//       return {
//         require: '?ngModel',
//         restrict: 'E',
//         template: '<input type="text" readonly="readonly" class="ion-google-place" autocomplete="off">',
//         replace: true,
//         link: function(scope, element, attrs, ngModel) {
//           var POPUP_TPL, geocoder, popupPromise, searchEventTimeout;
//           scope.locations = [];
//           scope.locate = window.currLocation.coords;
//           geocoder = new google.maps.Geocoder();
//           searchEventTimeout = void 0;
//           POPUP_TPL = ['<div class="ion-google-place-container">', '<div class="bar bar-header bar-positive item-input-inset">', '<label class="item-input-wrapper">', '<i class="icon ion-ios7-search placeholder-icon"></i>', '<input id="searchQuery" class="google-place-search" type="search" ng-model="searchQuery" placeholder="Enter an address, place or ZIP code">', '</label>', '<button class="button button-clear">', 'Cancel', '</button>', '</div>', '<ion-content class="has-header has-header">', '<ion-list>', '<ion-item ng-repeat="location in items" type="item-text-wrap" ng-click="selectLocation(location)">', '<h2>{{location.name}}</h2>', '</ion-item>', '</ion-list>', '</ion-content>', '</div>'].join('');
//           popupPromise = $ionicTemplateLoader.compile({
//             template: POPUP_TPL,
//             scope: scope,
//             appendTo: $document[0].body
//           });
//           var pyrmont = new google.maps.LatLng(scope.locate.latitude,scope.locate.longitude);
//
//           map = new google.maps.Map(document.getElementById('map'), {
//               center: pyrmont,
//               zoom: 15
//             });
//
//
//           popupPromise.then(function(el) {
//             var onCancel, onClick, searchInputElement;
//             searchInputElement = angular.element(el.element.find('input'));
//             scope.selectLocation = function(location) {
//               ngModel.$setViewValue(location);
//               ngModel.$render();
//               el.element.css('display', 'none');
//               return $ionicBackdrop.release();
//             };
//             scope.$watch('searchQuery', function(query) {
//               if (searchEventTimeout) {
//                 $timeout.cancel(searchEventTimeout);
//               }
//               return searchEventTimeout = $timeout(function() {
//                 if (!query) {
//                   return;
//                 }
//
//                 var request = {
//                   query: query,
//                   location: pyrmont,
//                   radius: '500',
//                   types: ['food']
//                 };
//
//                 service = new google.maps.places.PlacesService(map);
//                 return service.textSearch(request, callback);
//
//                 function callback(results, status) {
//                   if (status == google.maps.places.PlacesServiceStatus.OK) {
//                     scope.items = results
//                     console.log(results);
//                     return scope.vm.items = results;
//                     // for (var i = 0; i < scope.vm.items.length; i++) {
//
//                       // scope.vm.items[i].dist = findDistance.get( scope.vm.items[i].geometry.location.k, scope.vm.items[i].geometry.location.B )
//                       // scope.items[i].stars = makeStars.get(scope.vm.items[i].rating)
//                       // createMarker(results[i]);
//                       // console.log(place);
//                     // }
//                   }
//                 }
//
//               //   return ngGPlacesAPI.nearbySearch({
//               //     nearbySearchKeys: ['geometry'],
//               //     name: query,
//               //     reference: query,
//               //     latitude: scope.locate.latitude,
//               //     longitude: scope.locate.longitude
//               //   }).then(function(data) {
//               //     MenusData.set(data);
//               //     console.log(data);
//               //     scope.locations = data;
//               //     return scope.vm.locations = data;
//               //   });
//               }, 350);
//             });
//             onClick = function(e) {
//               e.preventDefault();
//               e.stopPropagation();
//               $ionicBackdrop.retain();
//               el.element.css('display', 'block');
//               searchInputElement[0].focus();
//               return setTimeout(function() {
//                 return searchInputElement[0].focus();
//               }, 0);
//             };
//             onCancel = function(e) {
//               scope.searchQuery = '';
//               $ionicBackdrop.release();
//               return el.element.css('display', 'none');
//             };
//             element.bind('click', onClick);
//             element.bind('touchend', onClick);
//             return el.element.find('button').bind('click', onCancel);
//           });
//           if (attrs.placeholder) {
//             element.attr('placeholder', attrs.placeholder);
//           }
//           ngModel.$formatters.unshift(function(modelValue) {
//             if (!modelValue) {
//               return '';
//             }
//             return modelValue;
//           });
//           ngModel.$parsers.unshift(function(viewValue) {
//             return viewValue;
//           });
//           return ngModel.$render = function() {
//             if (!ngModel.$viewValue) {
//               return element.val('');
//             } else {
//               return element.val(ngModel.$viewValue.formatted_address || '');
//             }
//           };
//         }
//       };
//     }
//
//
// googleItems.$inject = ['$ionicTemplateLoader', '$ionicBackdrop', '$q', '$timeout', '$rootScope', '$document', 'ngGPlacesAPI', 'MenusData']
//
// angular
//   .module('googleItems', [])
//   .directive('googleItems', googleItems)
// }).call(this);
//
// //
// //
// // function initialize(lat, lng) {
// //   var pyrmont = new google.maps.LatLng(lat,lng);
// //
// //   map = new google.maps.Map(document.getElementById('map'), {
// //       center: pyrmont,
// //       zoom: 15
// //     });
// //
// //   var request = {
// //     query: "burgers",
// //     location: pyrmont,
// //     radius: '500',
// //     types: ['food']
// //   };
// //
// //   service = new google.maps.places.PlacesService(map);
// //   service.textSearch(request, callback);
// // }
// //
// // function callback(results, status) {
// //   if (status == google.maps.places.PlacesServiceStatus.OK) {
// //     vm.items = results;
// //     for (var i = 0; i < vm.items.length; i++) {
// //
// //       vm.items[i].dist = findDistance.get( vm.items[i].geometry.location.k, vm.items[i].geometry.location.B )
// //       vm.items[i].stars = makeStars.get(vm.items[i].rating)
// //       // createMarker(results[i]);
// //       // console.log(place);
// //     }
// //   }
// // }

// (function(){
angular.module( "ngAutocomplete", [])
  .directive('ngAutocomplete', function($location) {
    return {
      require: 'ngModel',
      scope: {
        ngModel: '=',
        options: '=?',
        details: '=?'
      },

      link: function(scope, element, attrs, controller) {

        //options for autocomplete
        var opts;
        var watchEnter = false;
        //convert options provided to opts
        var initOpts = function() {

          opts = {};
          if (scope.options) {

            if (scope.options.watchEnter !== true) {
              watchEnter = false;
            } else {
              watchEnter = true;
            }

            if (scope.options.types) {
              opts.types = [];
              opts.types.push(scope.options.types);
              scope.gPlace.setTypes(opts.types);
            } else {
              scope.gPlace.setTypes([]);
            }

            if (scope.options.bounds) {
              opts.bounds = scope.options.bounds;
              scope.gPlace.setBounds(opts.bounds);
            } else {
              scope.gPlace.setBounds(null);
            }

            if (scope.options.country) {
              opts.componentRestrictions = {
                country: scope.options.country
              };
              scope.gPlace.setComponentRestrictions(opts.componentRestrictions);
            } else {
              scope.gPlace.setComponentRestrictions(null);
            }
          }
        };

        if (scope.gPlace === undefined) {
          scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
        }
        google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
          var result = scope.gPlace.getPlace();

          if (result !== undefined) {
            if (result.address_components !== undefined) {

              scope.$apply(function() {

                scope.details = result;
                console.log(result);
                // $location.path('/tab/menus/menu/' + scope.details.place_id);

                controller.$setViewValue(element.val());
              });
            }
            else {
              if (watchEnter) {
                getPlace(result);
              }
            }
          }
        });

        //function to get retrieve the autocompletes first result using the AutocompleteService
        var getPlace = function(result) {
          var autocompleteService = new google.maps.places.AutocompleteService();
          console.log(result);
          if (result.name.length > 0){
            autocompleteService.getPlacePredictions(
              {
                input: result.name,
                offset: result.name.length
              },
              function listentoresult(list, status) {

                if(list === null || list.length === 0) {

                  scope.$apply(function() {
                    scope.details = null;
                  });

                } else {

                  var placesService = new google.maps.places.PlacesService(element[0]);
                  placesService.getDetails(
                    {'reference': list[0].reference},
                    function detailsresult(detailsResult, placesServiceStatus) {
                      console.log(detailsResult)
                      if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                        scope.$apply(function() {

                          controller.$setViewValue(detailsResult.formatted_address);
                          element.val(detailsResult.formatted_address);

                          scope.details = detailsResult;
                          scope.vm.locations = detailsResult;


                          //on focusout the value reverts, need to set it again.
                          var watchFocusOut = element.on('focusout', function(event) {
                            element.val(detailsResult.formatted_address);
                            element.unbind('focusout');
                          });

                        });
                      }
                    }
                  );
                }
              });
          }
        };

        controller.$render = function () {
          var location = controller.$viewValue;
          element.val(location);
        };

        //watch options provided to directive
        scope.watchOptions = function () {
          return scope.options;
        };
        scope.$watch(scope.watchOptions, function () {
          initOpts();
        }, true);

      }



    };
  })

.directive('disableTap', function($timeout) {
  return {
    link: function() {

      $timeout(function() {
        document.querySelector('.pac-container').setAttribute('data-tap-disabled', 'true');
      },500);
    }
  };
});
// }).call(this)

(function() {
  angular.module('ngBackImg', []).directive('ngBackImg', function() {
    return function(scope, element, attrs){
      var url = attrs.ngBackImg;
      element.css({
        'background-image': 'url(' + url + ')',
        'background-size' : 'cover',
        'width': '100%',
        'height': '150px'
      });
    };
  });

}).call(this);

(function() {
  angular.module('ngFadeIn', []).directive('ngFadeIn', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs, ngModel) {
        TweenLite.to(element, 0, {autoAlpha:0});
        TweenLite.to(element, 2.5, {autoAlpha:1});
      }
    };
  });

}).call(this);

(function() {
  angular.module('ngPlaces', []).directive('ngPlaces', [
    '$ionicTemplateLoader', '$ionicBackdrop', '$q', '$timeout', '$rootScope', '$document', 'ngGPlacesAPI', 'MenusData', function($ionicTemplateLoader, $ionicBackdrop, $q, $timeout, $rootScope, $document, ngGPlacesAPI, MenusData) {
      return {
        require: '?ngModel',
        restrict: 'E',
        template: '<input type="text" readonly="readonly" class="ion-google-place" autocomplete="off">',
        replace: true,
        link: function(scope, element, attrs, ngModel) {
          var POPUP_TPL, geocoder, popupPromise, searchEventTimeout;
          scope.locations = [];
          scope.locate = window.currLocation.coords;
          geocoder = new google.maps.Geocoder();
          searchEventTimeout = void 0;
          POPUP_TPL = ['<div class="ion-google-place-container">', '<div class="bar bar-header bar-positive item-input-inset">', '<label class="item-input-wrapper">', '<i class="icon ion-ios7-search placeholder-icon"></i>', '<input id="searchQuery" class="google-place-search" type="search" ng-model="searchQuery" placeholder="Enter an address, place or ZIP code">', '</label>', '<button class="button button-clear">', 'Cancel', '</button>', '</div>', '<ion-content class="has-header has-header">', '<ion-list>', '<ion-item ng-repeat="location in locations" type="item-text-wrap" ng-click="selectLocation(location)">', '<h2>{{location.name}}</h2>', '</ion-item>', '</ion-list>', '</ion-content>', '</div>'].join('');
          popupPromise = $ionicTemplateLoader.compile({
            template: POPUP_TPL,
            scope: scope,
            appendTo: $document[0].body
          });
          popupPromise.then(function(el) {
            var onCancel, onClick, searchInputElement;
            searchInputElement = angular.element(el.element.find('input'));
            scope.selectLocation = function(location) {
              ngModel.$setViewValue(location);
              ngModel.$render();
              el.element.css('display', 'none');
              return $ionicBackdrop.release();
            };
            scope.$watch('searchQuery', function(query) {
              if (searchEventTimeout) {
                $timeout.cancel(searchEventTimeout);
              }
              return searchEventTimeout = $timeout(function() {
                if (!query) {
                  return;
                }
                return ngGPlacesAPI.nearbySearch({
                  nearbySearchKeys: ['geometry'],
                  name: query,
                  reference: query,
                  latitude: scope.locate.latitude,
                  longitude: scope.locate.longitude
                }).then(function(data) {
                  MenusData.set(data);
                  console.log(data);
                  scope.locations = data;
                  return scope.vm.locations = data;
                });
              }, 350);
            });
            onClick = function(e) {
              e.preventDefault();
              e.stopPropagation();
              $ionicBackdrop.retain();
              el.element.css('display', 'block');
              searchInputElement[0].focus();
              return setTimeout(function() {
                return searchInputElement[0].focus();
              }, 0);
            };
            onCancel = function(e) {
              scope.searchQuery = '';
              $ionicBackdrop.release();
              return el.element.css('display', 'none');
            };
            element.bind('click', onClick);
            element.bind('touchend', onClick);
            return el.element.find('button').bind('click', onCancel);
          });
          if (attrs.placeholder) {
            element.attr('placeholder', attrs.placeholder);
          }
          ngModel.$formatters.unshift(function(modelValue) {
            if (!modelValue) {
              return '';
            }
            return modelValue;
          });
          ngModel.$parsers.unshift(function(viewValue) {
            return viewValue;
          });
          return ngModel.$render = function() {
            if (!ngModel.$viewValue) {
              return element.val('');
            } else {
              return element.val(ngModel.$viewValue.formatted_address || '');
            }
          };
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('ngRater', []).directive('ngRater', function() {
    return {
      restrict: 'E',
      template: '<div class="button-bar"> <button class="button button-clear button-icon icon ion-ios7-star" ng-repeat="btn in buttons" ng-click="rating = $index" ng-class="{\'button-energized\': rating >= $index}"></button></div>'
    };
  });

}).call(this);

(function() {
  angular.module('ngSelect', []).directive('ngMultiSelect', function() {
    return {
      restrict: 'E',
      template: '<div class="button-bar"><button class="button button-small "ng-repeat="option in options" ng-class="{\'active\': option.active === true}" ng-click="activate(option.id)"> {{option.title}}</button></div>',
      scope: {
        multi: '=multiple',
        options: '=options'
      },
      controller: function($scope) {
        return $scope.activate = function(num) {
          var item, _i, _len, _ref, _results;
          _ref = $scope.options;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            if (item.id === num) {
              _results.push(item.active = !item.active);
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      }
    };
  }).directive('ngSingleSelect', function() {
    return {
      restrict: 'E',
      template: '<div class="button-bar"><button class="button button-small "ng-repeat="option in options" ng-class="{\'active\': option.active === true}" ng-click="activate(option.id, $index)"> {{option.title}}</button></div>',
      scope: {
        multi: '=multiple',
        options: '=options'
      },
      controller: function($scope) {
        $scope.active = false;
        return $scope.activate = function(num, index) {
          var item, _i, _len, _ref, _results;
          if ($scope.options[index].active === true) {
            return $scope.options[index].active = !$scope.options[index].active;
          } else {
            $scope.options[index].active = !$scope.options[index].active;
            _ref = $scope.options;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              item = _ref[_i];
              if (item.id !== $scope.options[index].id) {
                _results.push(item.active = !$scope.options[index].active);
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          }
        };
      }
    };
  });

}).call(this);

(function() {

  var FbLogin;
  FbLogin = function(Restangular, $q, Auth, User) {
    // Defaults to sessionStorage for storing the Facebook token
    openFB.init({appId: '571600419638677'});
    console.log("i'm in");
    FbUser = Restangular.all('users');

    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //  openFB.init({appId: 'YOUR_FB_APP_ID', tokenStore: window.localStorage});

    return {
      status: undefined,

      // Submits log-in request to facebook.
      login: function() {
        var deferred = $q.defer();
        openFB.login(function(response) {
          if(response.status === 'connected') {
            return deferred.resolve();
          }
          else {
            alert('Facebook login failed: ' + response.error);
            return deferred.reject();
          }
        }, {scope: 'email,read_stream,publish_stream'});
        return deferred.promise;
      },

      // Logs out a facebook connected user.
      logout: function() {
        openFB.logout(
          function() {
            User.logout();
            User.status = "Logged out from Facebook.";
            this.getStatus();
          }.bind(this),
          this.errorHandler);
      },

      // Gets Facebook user information and sets items on view.
      getInfo: function() {
        openFB.api({
          path: '/me',
          // params: {fields: 'id, name, email'},
          success: function(data) {
            console.log("yo ",JSON.stringify(data));
            // document.getElementById("userName").innerHTML = data.name;
            // document.getElementById("userPic").src = 'http://graph.facebook.com/' + data.id + '/picture?width=150&height=150';
          },
          error: this.errorHandler
        });
      },

      // Gets Facebook connection status of the user.
      getStatus: function() {
        openFB.getLoginStatus(function(foundStatus) {
          this.status = foundStatus.status;
        }.bind(this));
      },

      // Posts an item to Facebook. Currently not working due to admin accoun restrictions.
      share: function() {
        openFB.api({
          method: 'POST',
          path: '/me/feed',
          params: {
            message: 'Testing Facebook APIs'
          },
          success: function() {
            alert('the item was posted on Facebook');
          },
          error: this.errorHandler
        });
      },

      errorHandler: function(error) {
        alert(error.message);
      },

      // Sends request to server for long term Facebook token.
      // Returns user with updated info or new user.
      getFbToken: function(dataToStore) {
        var dataToStore = dataToStore || {};
        dataToStore.token = window.sessionStorage.fbtoken;
        dataToStore.username = window.localStorage.user_email;
        return Restangular.all('users').all('fb-login')
          .post(dataToStore)
          .then(function (response) {
            console.log(response);
            Auth.setAuthToken(data.neoId, data.username, data.token, data.fbSessionId, data);
          })
          .catch(function(error) {
            console.log('uh oh');
          });

      },

      // Gets Facebook user data to store in database.
      getFbUserCreationData: function() {
        var deferred = $q.defer();
        openFB.api({
          path: '/me',
          params: {fields: 'id, name, email'},
          success: function(data) {
            return deferred.resolve(data);
          },
          error: this.errorHandler
        });
        return deferred.promise;
      },

      // Starts Facebook login, requests long term token from Facebook and stores
      // Facebook token and data in database.
      loginFlow: function () {
        var fbUser = this;
        return this.login()
          .then(function(){
            return fbUser.getFbUserCreationData();
          })
          .then(function(data){
            var paramsToStore = {};
            paramsToStore.fbId = data.id;
            paramsToStore.email = data.email;
            paramsToStore.photo = 'http://graph.facebook.com/' + data.id + '/picture?width=150&height=150';
            return fbUser.getFbToken(paramsToStore);
          })
          .then(function(){
            User.status = "Facebook connected!";
            // fbUser.getInfo();
            fbUser.getStatus();
          })
          .catch(function(error) {
            User.status = "An error occurred logging in with Facebook. Please try again.";
            console.log('Error: ', error);
          });
      }
    };
  };
  FbLogin.$inject = ['Restangular', '$q', 'Auth', 'User'];
  angular.module('app.model.fbLogin', []).factory('FbLogin', FbLogin);
})();

(function() {
  (function() {

    /**
     * @name    MenuItem
     * @param   {Service} Restangular Restangular provider
     * @return  {Object} returns an object with all given methods
     */
    var MenuItem;
    MenuItem = function(Restangular, $q, findDistance, makeStars) {
      var Rest, findFilter, storage;
      Rest = Restangular.all('items');
      storage = {};
      findFilter = "";

      defaults = {
        distance: 5
      };

      nearbyItems = [];
      nearbyKeys = {};

      instance = {
        get: get,
        find: find,
        getByMenu: getByMenu,
        getByUser: getByUser,
        getItemReviews: getItemReviews,
        getItemPhotos: getItemPhotos,
        getByLocation: getByLocation,
        set: set,
        getStorage: getStorage,
        create: create,
        destroy: destroy
      };
      return instance;


      function start(){
        Restangular.all('items')
          .getList()
          .then(function (data) {
            _.each(data, function (item, index){

              item.dist = findDistance.get(item.menu.latitude, item.menu.longitude);
              if(item.dist > defaults.distance){
                item.stars = makeStars.get(item.rating);
                nearbyItems.push(item);
                nearbyKeys[item._id] = nearbyItems.length;
              }
            });
          });
      }
      function get() {
        var newPromise = $q.defer();
        if(!nearbyItems.length){
          start();
        }
        newPromise.resolve(nearbyItems);

        return newPromise.promise;
        // return Restangular.all('items').getList();
      }
      function find(id) {
        // var item = nearbyItems[ nearbyKeys[id] ];
        // if (item){
        //   var q = $q.defer()
        //   q.resolve(item)
        //   return q.promise;
        // }
        return Restangular.one('items', id).get();
      }
      function getByMenu(menu_id) {
        return Rest.one('menu', menu_id).get();
      }
      function getByUser(user_id) {
        return Rest.one('user', user_id).get();
      }
      function getItemReviews(item_id, cb) {
        return Restangular.one('items', item_id).all('photos').getList();
      }
      function getItemPhotos(item_id, cb) {
        return Restangular.one('items', item_id).all('photos').getList();
      }
      function getByLocation(data, filter) {
        var newPromise;
        newPromise = $q.defer();
        if (filter) {
          findFilter = filter;
        }
        if (filter === "empty") {
          findFilter = "";
        }
        // data.val = findFilter;
        return Rest.all('location').all(JSON.stringify(data)).getList().then(function(data) {
          var item, _i, _len;
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            item = data[_i];
            item.dist = findDistance.get(item);
            item.stars = makeStars.get(item.rating);
          }
          return data
          // return newPromise.resolve(data);
        });
        // return newPromise.promise;
      }
      function set(key, obj) {
        return storage[key] = obj;
      }
      function getStorage(key) {
        if (key) {
          return storage[key];
        }
        return storage;
      }
      function create(data) {
        return Rest.post(data);
      }
      function destroy(id) {
        return Restangular.one('items', id).remove();
      }
    };

    MenuItem.$inject = ['Restangular', '$q', 'findDistance', 'makeStars'];
    return angular.module('app.model.item', []).factory('MenuItem', MenuItem);
  })();

}).call(this);

// (function() {
//   (function() {

//     /**
//      * @name    MenuItem
//      * @param   {Service} Restangular Restangular provider
//      * @return  {Object} returns an object with all given methods
//      */
//     var MenuItem;
//     MenuItem = function(Restangular, $q, findDistance, makeStars) {
//       var Rest, findFilter, storage;
//       Rest = Restangular.all('items');
//       storage = {};
//       findFilter = "";

//       defaults = {
//         distance: 5
//       }

//       nearbyItems = [];
//       nearbyKeys = {}

//       instance = {
//         get: get,
//         find: find,
//         getByMenu: getByMenu,
//         getByUser: getByUser,
//         getItemReviews: getItemReviews,
//         getItemPhotos: getItemPhotos,
//         getByLocation: getByLocation,
//         set: set,
//         getStorage: getStorage,
//         create: create,
//         destroy: destroy
//       }
//       return instance;


//       function start(){
//         Restangular.all('items')
//           .getList()
//           .then(function (data) {
//             _.each(data, function (item, index){

//               item.dist = findDistance.get(item.menu.latitude, item.menu.longitude);
//               if(item.dist > defaults.distance){
//                 item.stars = makeStars.set(item);
//                 nearbyItems.push(item);
//                 nearbyKeys[item._id] = nearbyItems.length
//               }
//             });
//           });
//       };
//       function get() {
//         var newPromise = $q.defer()
//         if(!nearbyItems.length){
//           start()
//         }
//         newPromise.resolve(nearbyItems);

//         return newPromise.promise
//         // return Restangular.all('items').getList();
//       };
//       function find(id) {
//         // var item = nearbyItems[ nearbyKeys[id] ];
//         // if (item){
//         //   var q = $q.defer()
//         //   q.resolve(item)
//         //   return q.promise;
//         // }
//         return Restangular.one('items', id).get();
//       };
//       function getByMenu(menu_id) {
//         return Rest.one('menu', menu_id).get();
//       };
//       function getByUser(user_id) {
//         return Rest.one('user', user_id).get();
//       };
//       function getItemReviews(item_id, cb) {
//         return Restangular.one('items', item_id).all('essay').getList();
//       };
//       function getItemPhotos(item_id, cb) {
//         return Restangular.one('items', item_id).all('photos').getList();
//       };
//       function getByLocation(data, filter) {
//         var newPromise;
//         newPromise = $q.defer();
//         if (filter) {
//           findFilter = filter;
//         }
//         if (filter === "empty") {
//           findFilter = "";
//         }
//         data.val = findFilter;
//         Rest.all('location').post(data).then(function(data) {
//           var item, _i, _len;
//           for (_i = 0, _len = data.length; _i < _len; _i++) {
//             item = data[_i];
//             item.dist = findDistance.get(item);
//             item.stars = makeStars.set(item);
//           }
//           return newPromise.resolve(data);
//         });
//         return newPromise.promise;
//       };
//       function set(key, obj) {
//         return storage[key] = obj;
//       };
//       function getStorage(key) {
//         if (key) {
//           return storage[key];
//         }
//         return storage;
//       };
//       function create(data) {
//         return Rest.post(data);
//       };
//       function destroy(id) {
//         return Restangular.one('items', id).remove();
//       };
//     };

//     MenuItem.$inject = ['Restangular', '$q', 'findDistance', 'makeStars'];
//     return angular.module('app.model.item', []).factory('MenuItem', MenuItem);
//   })();

// }).call(this);

(function() {
  var List = function(Restangular) {
    var Rest = Restangular.all('lists');
    var user = localStorage.getItem('user_id');

    var getList = function() {
      return Rest.one('John').get();
    };

    var getBookmarks = function() {
      return Rest.one('John').get();
    };

    var getCollections = function() {
      return Rest.one('John').get();
    };



    var listFactory = {
      getList: getList,
      getBookmarks: getBookmarks,
      getCollections: getCollections
    };

    return listFactory;
  };


  List.$inject = ['Restangular'];
  angular.module('app.model.list', [])
    .factory('List', List);
}).call(this);

(function() {
  /**
   * Menu Model Factory for interacting with REST Route api/menus
   * @return {Object} returns a newable instance of the Menu Class
   */
  var Menu = function(Restangular) {
    var nearbyFilter;
    nearbyFilter = "";

    var instance = {
      get: get,
      find: find,
      create: create,
      update: update,
      destroy: destroy,
      getByLocation: getByLocation,
      getMenuItems: getMenuItems
    };

    return instance;

    /**
     * @name    get
     * @return  Restangular promise to retrieve all menus
     * @GET:    /menus
     */
    function get() {
      return Restangular.all('menus').getList();
    }
    /**
     * @name    find
     * @param   {Number} id  menu._id
     * @return  Restangular promise to retrieve a single menu by id
     * @GET:    /menus/:_id
     */
    function find(id) {
      return Restangular.one('menus', id).get();
    }
    /**
     * @name    create
     * @param   {Object} data   new menu data
     * @return  Restangular promise to retrieve create a menu
     * @POST:    /menus
     */
    function create(data){
      return Restangular.all('menus').post(data);
    }
    /**
     * @name    update
     * @param   {Number} id    menu._id of updated menu
     * @param   {Object} data  changes made to the updated menu
     * @return  Restangular promise to update all menus
     * @GET:    /menus
     */
    function update(id, data){
      return Restangular.one('menus', id).put(data);
    }
    function destroy(id){
      return Restangular.one('menus', id).delete();
    }
    function getByLocation(data, filter) {
      if (filter) {
        nearbyFilter = filter;
      }
      if (filter === "empty") {
        nearbyFilter = "";
      }
      data.val = nearbyFilter;
      return Restangular.all('menus').all('location').post(data);
    }
    function getMenuItems(id){
      return Restangular.one('menus', id).all('items').getList();
    }

  };

  /**
   * Cache for recently searched Menus
   * @return {Object}  returns a newable instance for a Cache with get post update and delete
   */

  var MenuCache = function() {
    var _cache;
    _cache = {};
    return {
      get: function(key) {
        var result;
        result = false;
        if (_cache[key]) {
          return _cache[key];
        }
        return result;
      },
      set: function(key, obj) {
        return _cache[key] = obj;
      }
    };
  };


  Menu.$inject = ['Restangular'];
  return angular.module('app.model.menu', []).factory('Menu', Menu).service('MenuCache', MenuCache);
})();


/**
 * @name Photo Factory
 * @param {Restangular} Restangular RestangularServiceProvider
 */

(function() {
  var Photo;

  Photo = function(Restangular) {
    var Rest;
    Rest = Restangular.all('photos');
    return {
      find: function(id) {
        return Restangular.one('photos', id);
      },
      getUserAlbum: function(user_id) {
        return Rest.one('user', user_id);
      },
      getItemGallery: function(item_id) {
        return Rest.one('item', item_id);
      },
      getByReview: function(review_id) {
        return Rest.one('review', review_id);
      }
    };
  };

  Photo.$inject = ['Restangular'];

  angular.module('app.model.photo', []).factory('Photo', Photo);

}).call(this);


/**
 * @name  Review   Factory
 * @param {Service} Restangular RestangularServiceProvider
 */

(function() {
  var Review;

  Review = function(Restangular) {
    var Rest;
    Rest = Restangular.all('reviews');
    return {
      find: function(id) {
        return Restangular.one('reviews', id);
      },
      getByMenu: function(menu_id) {
        return Rest.one('menu', menu_id);
      },
      getByUser: function(user_id) {
        return Rest.one('user', user_id);
      },
      getByItemId: function(item_id) {
        return Rest.one('item', item_id);
      },
      create: function(data) {
        return Rest.post(data);
      },
      createTextOnly: function(data) {
        return Rest.all('text').post(data);
      },
      destroy: function(id) {
        return Restangular.one('review', id).remove();
      }
    };
  };

  Review.$inject = ['Restangular'];

  angular.module('app.model.review', []).factory('Review', Review);

}).call(this);

(function() {
  angular.module('app.model.user', []).factory('User', [
    'Restangular', 'Auth','$q','UserStorage', function(Restangular, Auth, $q, UserStorage) {
      var User = Restangular.all('users');

      return {
        status: undefined,
        get: function() {
          return User;
        },
        find: function(id) {
          return Restangular.one('users', id);
        },
        findByParseUsername: function(id) {
          return Restangular.all('users').all('parse').one('username', id.toString()).get();
        },
        create: function(data) {
          return User.post(data);
        },
        update: function(id, data) {
          console.log('yo')
          return Restangular.one('users', id).all('update').post(id);
        },
        destroy: function(id) {
          return Restangular.on('users', id).delete();
        },
        getPhotosByUser: function(id){
          return Restangular.one('users', id).all('photos').getList();
        },
        getBookmarksByUser: function(id){
          return Restangular.one('users', id).all('bookmarks').getList();
        },
        getCollectionByUser: function(id){
          var q = $q.defer();
          Restangular.one('users', id).all('collection').getList().then(function (data){
            q.resolve(data);
          });
          return q.promise;
        },
        getReviewsByUser: function(id){
          return Restangular.one('users', id).all('reviews').getList();
        },
        interactWithItem: function(key, item_id, bool){
          var queries = {
            true: UserStorage.addRelationshipInNeo4j,
            false: UserStorage.removeRelationshipInNeo4j
          }
          return queries[bool](key, item_id)
            .then(function ( data ){
              return data;
            });
        },
        unCollectItem: function(item, callback){
          return UserStorage.removeRelationshipInNeo4j('collection', item)
            .then(function(data){
              return data;
            });
        },
        bookmarkItem: function(item){
          return UserStorage.addRelationshipInNeo4j('bookmarks', item._id)
            .then(function ( data ){
              return data;
            });
        },
        unBookmarkItem: function(item){
          return UserStorage.removeRelationshipInNeo4j('bookmarks', item._id)
            .then(function ( data ){
              return data;
            })
        },
        signup: function(username, password){
          return Restangular.all('users').all('signup')
            .post({username: username, password: password})
            .then(function(data) {
              if (data.error) {
                return this.status = data.message;
              }
              Auth.setAuthToken(data.neoId, data.username, data.token, data.fbSessionId, data);
              this.status = 'Account created!';
            }.bind(this));
        },
        login: function(username, password){
          return Restangular.all('users').all('login')
            .post({username: username, password: password})
            .then(function(data) {
              if (data.error) {
                return this.status = data.message;
              }
              console.log(data)
              Auth.setAuthToken(data.neoId, data.username, data.token, data.fbSessionId, data);
              UserStorage.syncAll();
              this.status = 'Logged In!';
            }.bind(this));
        },
        logout: function() {
          Auth.resetSession();
        }
      };
    }
  ]);

}).call(this);

/**
 * @name User Storage
 * @param {Restangular} Restangular RestangularServiceProvider
 */
(function() {
  var UserStorage;

  UserStorage = function(Restangular, $q) {
    if(localStorage.user_id){

      syncAll();
    }

    // User Storage Object
    var storage = {
      collection: {},
      bookmarks: {},
      reviews: {},
      photos: {}
    };

    // Methods to return from UserStorage
    var store = {
      sync: sync,
      syncAll: syncAll,
      checkData: checkData,
      getData: getData,
      addRelationshipInNeo4j: addRelationshipInNeo4j,
      removeRelationshipInNeo4j: removeRelationshipInNeo4j
    };

    return store;

    //////////////////////////

    function checkData(key, item_id){
      // if(!localStorage.user_id){

        return getFromLocalStorage( key )
          .then(function ( data ){
            return _.has(data, item_id);
          })
      // }
    }


    function getData(key, item_id){
        return getFromLocalStorage( key ).then(function (data){
          if(item_id) return data[item_id];
          else {
            return _.values(data);
          }
        });
    }

    function getFromLocalStorage(key){
      var q = $q.defer();
      if( Object.keys(storage[key]).length || !localStorage.user_id ) q.resolve(storage[key]);
      else {
        return sync(key).then(function(data){
          return storage[key];
        })
      }
      return q.promise;
    }

    function sync(key){
      return Restangular.one('users', localStorage.user_id)
        .all(key).getList()
        .then(function ( data ){
          for(var i = 0; i<data.length; i++){
            if(typeof data[i] !== 'function'){
              storage[key][data[i]._id] = data[i];
            }
          }
          return data;
        });
    }

    function syncAll(){
      if(localStorage.user_id){
        _.forEach(['collection', 'bookmarks', 'reviews', 'photos'], function (item){
          sync(item);
        });
      }
    }

    function addRelationshipInNeo4j(key, item_id){
      return Restangular.one('users', localStorage.user_id)
        .all(key).all('true').post({item_id: item_id})
        .then( function ( data ){
          storage[key][data._id] = data;
          return data
        });

    }

    function removeRelationshipInNeo4j(key, item_id){
      return Restangular.one('users', localStorage.user_id)
        .all(key).all('false').post({item_id: item_id})
        .then( function ( data ){
          delete storage[key][data._id]
          return data
        });
    }

  };

  UserStorage.$inject = ['Restangular', '$q'];

  angular.module('app').factory('UserStorage', UserStorage);

}).call(this);

(function() {
  var BackgroundGeo = function($q) {
    var from;

    current()
      .then(function(data){
        from = new google.maps.LatLng(data.latitude, data.longitude);
      });

    var instance = {
      current: current,
      distance: distance
    };

    ///////////////

    function current(){
      var locator = $q.defer();
      locator.resolve(window.currLocation.coords);
      return locator.promise;
    };

    function distance(lat, lng){
      var dist, to;
      to = new google.maps.LatLng(lat, lng);
      from = new google.maps.LatLng(window.currLocation.coords.latitude, window.currLocation.coords.longitude);
      dist = google.maps.geometry.spherical.computeDistanceBetween(from, to) * 0.000621371192;
      return Math.floor((dist + 0.005)*100) / 100;
    };

    return instance;
  };
  BackgroundGeo
    .$inject = ['$q'];
  angular
    .module('app.services.BackgroundGeo', [])
    .factory('BackgroundGeo', BackgroundGeo);
})();

(function() {
  (function() {
    var findDistance;
    findDistance = function() {
      var from, locate;
      locate = window.currLocation.coords;
      from = new google.maps.LatLng(locate.latitude, locate.longitude);
      return {
        get: function(lat, lng) {
          var dist, to;
          to = new google.maps.LatLng(lat, lng);
          dist = google.maps.geometry.spherical.computeDistanceBetween(from, to) * 0.000621371192;
          return dist = dist - dist % 0.001;
        }
      };
    };
    return angular.module('app.services.findDistance', []).service('findDistance', findDistance);
  })();

}).call(this);

(function() {
  (function() {
    var makeStars;
    makeStars = function() {
      return {
        // SET IS USED FOR RANDOMLY GENERATED DATA
        set: function() {
          var num;
          num = Math.random() * 5;
          return '★★★★★½'.slice(5.75 - num, 6.25 - Math.abs(num % 1 - 0.5));
        },
        get: function(num) {
          return '★★★★★½'.slice(5.75 - num, 6.25 - Math.abs(num % 1 - 0.5));
        }
      };
    };
    return angular.module('app.services.makeStars', []).service('makeStars', makeStars);
  })();

}).call(this);

(function() {
  angular.module('app.states.item', []);
}).call(this);

(function() {
  /*
   * [ItemCtrl description]
   * @param {[type]} $scope        [description]
   * @param {[type]} $stateParams  [description]
   * @param {[type]} $http         [description]
   * @param {[type]} Item          [description]
   * @param {[type]} Review        [description]
   * @param {[type]} $ionicLoading [description]
   * @param {[type]} Rest          [description]
   */

  var ItemCtrl = function(checkUserCollection, checkUserBookmarks, showSingleItemPhotos, resolvedItem, $scope, $stateParams, Item, User, UserStorage, $state) {
    var vm = this;

    // Data from resolve
    vm.item           = resolvedItem.item;
    vm.map            = resolvedItem.map;
    vm.marker         = resolvedItem.marker;
    vm.options        = resolvedItem.options;
    vm.item_id        = resolvedItem.item_id;
    vm.has_bookmarks  = checkUserBookmarks;
    vm.has_collection = checkUserCollection;
    vm.photos = showSingleItemPhotos;

    // initial scope data
    vm.showPhotos     = showPhotos;
    vm.showReviews    = showReviews;
    vm.reviewItem     = reviewItem;
    vm.interact       = interact;


    //////////////////////


    function showPhotos() {
      Item.getItemPhotos(vm.item_id)
        .then(function(data){
          vm.photos = data;
        });
    }

    function showReviews() {
      Item.getItemReviews(this.item_id)
        .then(function(reviews) {
          vm.reviews = reviews;
        });
    };

    function reviewItem() {
      $state.go('tab.review-create', {itemId: vm.item_id});
    };

    function interact(key, bool) {
      User.interactWithItem(key, vm.item._id, !bool)
        .then(function (data){
          vm['has_' + key] = !bool;
        });
    };
  };

  ItemCtrl
    .$inject = [
      'checkUserCollection',
      'checkUserBookmarks',
      'showSingleItemPhotos',
      'resolvedItem',
      '$scope',
      '$stateParams',
      'MenuItem',
      'User',
      'UserStorage',
      '$state'
    ];
  angular
    .module('app.states.item')
    .controller('ItemCtrl', ItemCtrl);
})();
(function() {
  angular.module('app.states.login', []);

}).call(this);

(function() {
  var LoginCtrl = function($scope, $ionicModal, Auth, User, FbLogin, $state, $ionicLoading) {
    var vm = this;
    vm.status = User.status;
    vm.isSignedIn = Auth.isSignedIn();
    vm.fbStatus = FbLogin.getStatus();

    $ionicModal
      .fromTemplateUrl("js/states/login/views/loginModal.html", {
        scope: $scope,
        animation: "slide-in-up"
      })
      .then(function(modal) {
        vm.loginModal = modal;
      });

    $ionicModal
      .fromTemplateUrl("js/states/login/views/signupModal.html", {
        scope: $scope,
        animation: "slide-in-up"
      })
      .then(function(modal) {
        vm.signupModal = modal;
      });

    // Watch for changes on the User status property and update the view.
    $scope.$watch(function () {
        return User.status;
      },
      function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
          vm.status = User.status;
        }
      }
    );

    $scope.$watch(function () {
        return FbLogin.status;
      },
      function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
          vm.fbStatus = FbLogin.status;
        }
      }
    );

    vm.nativeSignup   = nativeSignup;
    vm.nativeLogin    = nativeLogin;
    vm.fbLogin        = fbLogin;
    vm.fbLoginFlow    = fbLoginFlow;
    vm.fbLogout       = fbLogout;
    vm.fbGetInfo      = fbGetInfo;
    vm.fbShare        = fbShare;
    vm.fbGetToken     = fbGetToken;
    vm.nativeLogout   = nativeLogout;

    //////////////////////

    function nativeSignup() {
      loginLoading('Creating your account...');
      User.signup(vm.username.toLowerCase(), vm.password)
        .then(loginConfirmed)
        .catch(loginFailed);
    }
    function nativeLogin() {
      loginLoading('Logging you in...');
      User.login(vm.username.toLowerCase(), vm.password)
        .then(loginConfirmed)
        .catch(loginFailed);
    }
    function fbLogin() {
      FbLogin.login();
    }
    function fbLoginFlow() {
      loginLoading('Logging you in through Facebook...');
      FbLogin.loginFlow()
        .then(loginConfirmed)
        .catch(loginFailed);
    }
    function fbLogout() {
      FbLogin.logout();
    }
    function fbGetInfo() {
      FbLogin.getInfo();
    }
    function fbShare() {
      FbLogin.share();
    }
    function fbGetToken() {
      FbLogin.getFbToken();
      User.logout();
    }
    function nativeLogout() {
      User.logout();
      if (vm.fbStatus) {
        vm.fbLogout();
      }
      vm.isSignedIn = false;
    }
    function loginLoading(msg) {
      $ionicLoading.show({template: msg});
      vm.statusMessage = '';
    }
    function loginConfirmed() {
      $ionicLoading.hide();
      $state.go('tab.settings')
      vm.isSignedIn = Auth.isSignedIn();
    }
    function loginFailed(errorMsg) {
      $ionicLoading.hide();
      vm.statusMessage = errorMsg.data.message;
    }

  };

  LoginCtrl
    .$inject = [
      '$scope',
      '$ionicModal',
      'Auth',
      'User',
      'FbLogin',
      '$state',
      '$ionicLoading'
    ];
  angular
    .module('app.states.login', [])
    .controller('LoginCtrl', LoginCtrl);
})();

(function() {
  angular.module('app.states.map', ['app.states.map.controllers']);

}).call(this);

(function() {
  angular.module('app.states.menu', []);
}).call(this);

(function() {
  var addItemCtrl;
  var MenuCtrl = function($scope, $stateParams, Menu, $ionicModal, $compile, Auth, ngGPlacesAPI, BackgroundGeo, menuInit, menuItemsInit, $sce) {

    var vm = this;
    var escapedAddress;


    vm.menu_id        = $stateParams.menu_id;
    vm.menu           = menuInit;
    vm.menu.distance  = BackgroundGeo.distance(vm.menu.latitude, vm.menu.longitude);
    vm.items          = menuItemsInit;
    vm.closeModal     = closeModal;
    vm.openModal      = openModal;
    vm.login          = login;
    vm.addNewItem     = addNewItem;
    vm.placeDetails   = placeDetails;

    escapedAddress    = [vm.menu.address,vm.menu.city,vm.menu.state].join(',').replace(/\s/g, '+')
    vm.placeUrl       = $sce.trustAsResourceUrl("https://www.google.com/maps/embed/v1/place"+
                                                "?key=AIzaSyBHB-4XsqFcIYYhid36PjMj5YJwkiFYy7Y"+
                                                "&q="+escapedAddress+
                                                "&zoom=15");

    initializeIonicModal()


    /////////////////


    function initializeIonicModal(){
      $ionicModal
        .fromTemplateUrl('js/states/menu/modals/createItemModal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        })
        .then(function(modal) {
          vm.createModal = modal;
        });
    }

    function openModal(){

      vm.createModal.show();
    }
    function closeModal(){
      vm.createModal.hide();
    }
    function addNewItem(item){

    }
    function login(){
      Auth.setAuthToken( vm.username, vm.password );
    }
    function placeDetails(){
      log("id", vm.menu_id);
      return ngGPlacesAPI.placeDetails({placeId: vm.menu_id});
    }

  };

  MenuCtrl.$inject = [
    '$scope',
    '$stateParams',
    'Menu',
    '$ionicModal',
    '$compile',
    'Auth',
    'ngGPlacesAPI',
    'BackgroundGeo',
    'menuInit',
    'menuItemsInit',
    '$sce'
  ];
  angular
    .module('app.states.menu')
    .controller('MenuCtrl', MenuCtrl)
    .controller('addItemCtrl', addItemCtrl);
})();

(function() {
  angular.module('app.states.splash', [])
    .config(function($stateProvider, $urlRouterProvider) {
      $stateProvider.state("splash", {
        url: "/",
        templateUrl: "js/states/splash/splash.html"
      });
    });

}).call(this);

(function() {

  var ItemsTab = function($stateProvider, $urlRouterProvider){
    $stateProvider.state("tab.items", {
      url: "/items",
      views: {
        "tab-items": {
          templateUrl: "js/tabs/items/views/items.html",
          controller: "ItemsCtrl as vm",
          resolve: {
            resolvedData: resolveItemsCtrl
          }
        }
      }
    })
    .state("tab.items-map", {
      url: "/items/map",
      views: {
        "tab-items": {
          templateUrl: "js/states/map/views/map.html",
          controller: "MapCtrl as vm"
        }
      }
    })
    .state("tab.items-item", {
      url: '/items/item/:itemId',
      views: {
        "tab-items": {
          templateUrl: "js/states/item/item.html",
          controller: "ItemCtrl as vm",
          resolve: {
            checkUserCollection: checkUserCollection,
            checkUserBookmarks: checkUserBookmarks,
            showSingleItemPhotos: showSingleItemPhotos,
            resolvedItem: function(MenuItem, $q, $stateParams){

              var scope = {};
              scope.item_id = $stateParams.itemId;
              var q = $q.defer();

              MenuItem
                .find(scope.item_id)
                .then(function(data) {
                  console.log("item", data[0]);
                  scope.item = data[0];
                  // vm.options = {scrollwheel: false};

                  scope.options = {scrollwheel: false};
                  scope.map = {center: {latitude: scope.item.lat, longitude: scope.item.lon }, zoom: 15 };
                  scope.marker = {
                      id: scope.item._id,
                      coords: {
                          // latitude: 40.1451,
                          // longitude: -99.6680

                        latitude: scope.item.lat,
                        longitude: scope.item.lon
                      },
                      options: { draggable: true },
                      events: {
                          dragend: function (marker, eventName, args) {
                              console.log('marker dragend');
                              console.log(marker.getPosition().lat());
                              console.log(marker.getPosition().lng());
                          }
                      }
                  };
                q.resolve(scope);
              });
              return q.promise;

            }
          }
        }
      }
    })
    .state("tab.items-menu", {
      url: '/items/menu/:menu_id',
      views: {
        "tab-items": {
          templateUrl: "js/states/menu/menu.html",
          controller: "MenuCtrl as vm"
        }
      }
    })
    .state("tab.item-map", {
      url: '/items/map/:item_id',
      views: {
        "tab-items": {
          templateUrl: "js/states/map/views/menusMap.html",
          controller: "ItemMapCtrl as vm"
        }
      }
    });

    /////////////////

    // Function for resolving ItemsCtrl
    function resolveItemsCtrl(BackgroundGeo, MenuItem, $window, $ionicLoading){
      return BackgroundGeo.current()
        .then(function (data){
          $ionicLoading.show({template: 'Finding dishes near you...'});
          console.info(window.locality.latitude)
          return MenuItem.getByLocation({lat:data.latitude,lng:data.longitude,dist: 1.0}, null)
            .then(function(data) {
              _.each(data, function ( item, index ){
                item.dist = BackgroundGeo.distance(item.lat, item.lon);
              });
              $ionicLoading.hide();
              return data;
            });
        });
    }


    function checkUserCollection( UserStorage, $stateParams ){
      var item_id = $stateParams.itemId
      return UserStorage.checkData('collection', item_id)
        .then(function ( bool ){
          console.log("checkUserCollection", bool)
          return bool;
        });
    }
    function checkUserBookmarks( UserStorage, $stateParams ){
      var item_id = $stateParams.itemId
      return UserStorage.checkData('bookmarks', item_id)
        .then(function ( bool ){
          console.log("checkUserBookmarks",bool);
          return bool;
        });
    }
    function showSingleItemPhotos( MenuItem, $stateParams ) {
      var item_id = $stateParams.itemId
      return MenuItem.getItemPhotos(item_id)
        .then(function ( photos ){
          // console.log("showSingleItemPhotos", photos);
          return photos;
        });
    }

    function showSingleItemReviews( MenuItem, $stateParams ) {
      var item_id = $stateParams.itemId
      return MenuItem.getItemReviews(item_id)
        .then(function ( reviews ) {
          // console.log("showSingleItemReviews", reviews);
          return reviews;
        });
    }

  }

  ItemsTab
    .$inject = [
      '$stateProvider',
      '$urlRouterProvider'
    ]
  angular
    .module('app.tabs.items', [])
    .config(ItemsTab)
}).call(this);

angular
  .module('app.tabs.list', [])
  .config(function($stateProvider) {
    $stateProvider.state('tab.list', {
      url: '/list',
      views: {
        'tab-list': {
          templateUrl: 'js/tabs/list/views/list.html',
          controller: 'ListCtrl as list'
        }
      },
      resolve: {
        listInit: function(List, $q, $ionicLoading) {
          $ionicLoading.show({template:'Loading Bookmarks...'});
          return List.getList()
            .then(function(data) {
              $ionicLoading.hide();
              if (data.itemArray.length === 0) {
                return null;
              }
              return data.itemArray;
            });
        }
      }
    }).state('tab.bookmarks', {
      url: '/list/bookmarks',
      views: {
        'tab-list': {
          templateUrl: 'js/tabs/list/views/bookmarks.html'
        }
      }
    }).state('tab.empty-list', {
      url: '/list/get-started',
      views: {
        'tab-list': {
          templateUrl: 'js/tabs/list/views/empty-list.html'
        }
      }
    }).state('tab.logins', {
      url: '/list',
      views: {
        'tab-list': {
          templateUrl: 'js/states/login/views/login.html',
          controller: 'LoginCtrl as login'
        }
      }
    });
  });

(function() {
  var MenusTab = function($stateProvider, $urlRouterProvider) {
    return $stateProvider.state("tab.menus", {
      url: "/menus",
      views: {
        "tab-menus": {
          templateUrl: "js/tabs/menus/views/menus.html",
          controller: "MenusCtrl as vm"
        }
      },
      resolve: {
        locationData: function() {
          return {
            lat: window.currLocation.coords.latitude,
            lng: window.currLocation.coords.longitude,
            dist: 0.6
          };
        },
        resolvedMenuData: function(Menu, BackgroundGeo, $ionicLoading) {
          var coords = this.resolve.locationData();
          $ionicLoading.show({template:'Loading Menus...'});
          return Menu.getByLocation(coords, null)
            .then(function(menus) {
              // Add distance from user to each menu.
              _.each(menus, function(menu) {
                menu.dist = BackgroundGeo.distance(menu.latitude, menu.longitude);
              });
              $ionicLoading.hide();
              return menus;
            });
        }
      }
    }).state("tab.menus-map", {
      url: "/menus/map",
      views: {
        "tab-menus": {
          templateUrl: "js/states/map/views/menusMap.html",
          controller: "MenusMapCtrl as vm"
        }
      }
    }).state("tab.menus-item", {
      url: '/menus/item/:itemId',
      views: {
        "tab-menus": {
          templateUrl: "js/states/item/item.html",
          controller: "ItemCtrl as vm"
        }
      }
    }).state("tab.menus-menu", {
      url: '/menus/menu/:menu_id',
      views: {
        "tab-menus": {
          templateUrl: "js/states/menu/menu.html",
          controller: "MenuCtrl as vm"
        }
      },
      resolve: {
        menuInit: function(Menu, $stateParams) {
          return Menu.find($stateParams.menu_id)
            .then(function(data) {
              return data;
            });
        },
        menuItemsInit: function(Menu, $stateParams) {
          return Menu.getMenuItems($stateParams.menu_id)
            .then(function(data) {
              return data;
            });
        }
      }
    });

    ////////////////////

    function resolveMenusCtrl(BackgroundGeo, ngGPlacesAPI){

      return BackgroundGeo.current()
        .then(function (data){
          var searchQuery = {
            vicinity: 'San Francisco',
            latitude: data.latitude,
            longitude: data.longitude
          };
          return ngGPlacesAPI.nearbySearch( searchQuery )
            .then(function (data) {
              return data;
            });
        });
    }
  };

MenusTab.$inject = [
  '$stateProvider',
  '$urlRouterProvider'
];
angular
  .module('app.tabs.menus', [
    'app.tabs.menus.controllers',
    'app.tabs.menus.services'
  ])
  .config(MenusTab);

}).call(this);

(function() {
  angular.module('app.tabs.review', ['app.tabs.review.controllers'])
    .config(function($stateProvider, $urlRouterProvider) {
      return $stateProvider.state("tab.review", {
        url: "/review",
        views: {
          "tab-review": {
            templateUrl: "js/tabs/review/views/review.html",
            controller: 'ReviewMenuCtrl as reviewMenu'
          }
        },
        resolve: {
          locationData: function() {
            return {
              lat: window.currLocation.coords.latitude,
              lng: window.currLocation.coords.longitude,
              dist: 0.6
            };
          },
          reviewMenuInit: function(Menu, BackgroundGeo, $ionicLoading) {
            var coords = this.resolve.locationData();
            $ionicLoading.show({template:'Finding Nearby Restaurants...'});
            return Menu.getByLocation(coords, null)
              .then(function(menus) {
                // Add distance from user to each menu.
                _.each(menus, function(menu) {
                  menu.dist = BackgroundGeo.distance(menu.latitude, menu.longitude);
                });
                $ionicLoading.hide();
                return menus;
              });
          }
        }
      }).state("tab.review-choose-item", {
        url: '/review/choose-item/:menuId',
        views: {
          "tab-review": {
            templateUrl: 'js/tabs/review/views/chooseItem.html',
            controller: 'ReviewItemCtrl as reviewItem'
          }
        },
        resolve: {
          menuInit: function($stateParams, Menu) {
            var menuId = $stateParams.menuId;
            return Menu.find(menuId)
              .then(function(menu) {
                return menu;
              });
          },
          menuItemsInit: function($stateParams, Menu, $ionicLoading) {
            $ionicLoading.show({template:'Loading Menu Items...'});
            var menuId = $stateParams.menuId;
            return Menu.getMenuItems(menuId)
              .then(function(items) {
                $ionicLoading.hide();
                return items;
              });
          }
        }
      }).state("tab.review-create-item", {
        url: '/review/create-item',
        views: {
          "tab-review": {
            templateUrl: 'js/tabs/review/views/create-item.html',
            controller: 'createItemCtrl as vm'
          }
        }
      }).state("tab.review-create", {
        url: '/review/create/:itemId',
        views: {
          "tab-review": {
            templateUrl: 'js/tabs/review/views/create.html',
            controller: 'createReviewCtrl as createReviewView'
          }
        },
        resolve: {
          createReviewInit: function($stateParams, MenuItem, $ionicLoading, $q) {
            $ionicLoading.show({template: "Loading Item..."});
            var itemId = $stateParams.itemId;
            return MenuItem.find(itemId)
              .then(function(item) {
                $ionicLoading.hide();
                return item[0];
              });
          }
        }
      });
    });

}).call(this);

(function() {
  angular.module('app.tabs.settings', ['app.tabs.settings.controllers']).config(function($stateProvider) {
    return $stateProvider.state('tab.settings', {
      url: '/settings',
      views: {
        'tab-settings': {
          templateUrl: 'js/tabs/settings/views/settings.html',
          controller: 'SettingsCtrl as vm'
        }
      }
    }).state('tab.account', {
      url: '/account',
      views: {
        'tab-settings': {
          templateUrl: 'js/tabs/settings/views/account.html',
          controller: 'AccountCtrl as account'
        }
      },
      resolve: {
        accountInit: function(User, $ionicLoading) {
          $ionicLoading.show({template:'Fetching Your Info...'});
          return User.findByParseUsername(localStorage.getItem('user_email'))
            .then(function(data) {
              $ionicLoading.hide();
              console.log(data)
              return data;
            });
        }
      }
    }).state('tab.login', {
      url: '/login',
      views: {
        'tab-settings': {
          templateUrl: 'js/states/login/views/login.html',
          controller: 'LoginCtrl as login'
        }
      }
    });
  });

}).call(this);

(function() {
  angular.module('app').factory('FormFactory', function($q) {

    /*
    Basic form class that you can extend in your actual forms.

    Object attributes:
    - loading[Boolean] - is the request waiting for response?
    - message[String] - after response, success message
    - errors[String[]] - after response, error messages

    Options:
      - submitPromise[function] (REQUIRED) - creates a form request promise
      - onSuccess[function] - will be called on succeded promise
      - onFailure[function] - will be called on failed promise
     */
    var FormFactory;
    return FormFactory = (function() {
      function FormFactory(options) {
        this.options = options !== null ? options : {};
        this.loading = false;
      }

      FormFactory.prototype.submit = function() {
        if (!this.loading) {
          return this._handleRequestPromise(this._createSubmitPromise());
        }
      };

      FormFactory.prototype._onSuccess = function(response) {
        this.message = response.message || response.success;
        return response;
      };

      FormFactory.prototype._onFailure = function(response) {
        var _ref, _ref1, _ref2, _ref3, _ref4;
        this.errors = ((_ref = response.data) !== null ? (_ref1 = _ref.data) !== null ? _ref1.errors : void 0 : void 0) || ((_ref2 = response.data) !== null ? _ref2.errors : void 0) || [((_ref3 = response.data) !== null ? _ref3.error : void 0) || response.error || ((_ref4 = response.data) !== null ? _ref4.message : void 0) || response.message || "Something has failed. Try again."];
        return $q.reject(response);
      };

      FormFactory.prototype._createSubmitPromise = function() {
        return this.options.submitPromise();
      };

      FormFactory.prototype._handleRequestPromise = function($promise, onSuccess, onFailure) {
        this.$promise = $promise;
        this.loading = true;
        this.submitted = false;
        this.message = null;
        this.errors = [];
        this.$promise.then((function(_this) {
          return function(response) {
            _this.errors = [];
            _this.submitted = true;
            return response;
          };
        })(this)).then(_.bind(this._onSuccess, this)).then(onSuccess || this.options.onSuccess)["catch"](_.bind(this._onFailure, this))["catch"](onFailure || this.options.onFailure)["finally"]((function(_this) {
          return function() {
            return _this.loading = false;
          };
        })(this));
        return this.$promise;
      };

      return FormFactory;

    })();
  });

}).call(this);

(function() {
  var __slice = [].slice;

  angular.module('app').factory('ObserverFactory', function() {
    var ObserverFactory;
    return ObserverFactory = (function() {
      function ObserverFactory() {
        this.listeners = {};
      }

      ObserverFactory.prototype.on = function(eventName, listener) {
        var _base;
        if ((_base = this.listeners)[eventName] === null) {
          _base[eventName] = [];
        }
        return this.listeners[eventName].push(listener);
      };

      ObserverFactory.prototype.once = function(eventName, listener) {
        listener.__once__ = true;
        return this.on(eventName, listener);
      };

      ObserverFactory.prototype.off = function(eventName, listener) {
        var i, v, _i, _len, _ref, _results;
        if (!this.listeners[eventName]) {
          return;
        }
        if (!listener) {
          return delete this.listeners[eventName];
        }
        _ref = this.listeners[eventName];
        _results = [];
        for (v = _i = 0, _len = _ref.length; _i < _len; v = ++_i) {
          i = _ref[v];
          if (this.listeners[eventName] === listener) {
            this.listeners.splice(i, 1);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      ObserverFactory.prototype.fireEvent = function() {
        var eventName, params, v, _i, _len, _ref, _ref1, _results;
        eventName = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (!((_ref = this.listeners[eventName]) !== null ? _ref.length : void 0)) {
          return;
        }
        _ref1 = this.listeners[eventName];
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          v = _ref1[_i];
          v.apply(this, params);
          if (v.__once__) {
            _results.push(this.off(eventName, v));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      return ObserverFactory;

    })();
  });

}).call(this);

(function() {
  angular.module("app").factory('PromiseFactory', function($q) {
    var constructor;
    return constructor = function(value, resolve) {
      var deferred;
      if (resolve === null) {
        resolve = true;
      }
      if ((value !== null) && typeof (value !== null ? value.then : void 0) === 'function') {
        return value;
      } else {
        deferred = $q.defer();
        if (resolve) {
          deferred.resolve(value);
        } else {
          deferred.reject(value);
        }
        return deferred.promise;
      }
    };
  });

}).call(this);

(function() {

  var USER_ID_CACHE_KEY = "user_id";
  var USER_EMAIL_CACHE_KEY = "user_email";
  var USER_TOKEN_CACHE_KEY = "user_token";

  var Auth = function($http, PromiseFactory) {

    setAuthToken(localStorage.getItem(USER_ID_CACHE_KEY),
                 localStorage.getItem(USER_EMAIL_CACHE_KEY),
                 localStorage.getItem(USER_TOKEN_CACHE_KEY));


    return {
      setAuthToken: setAuthToken,
      refreshUser: refreshUser,
      isSignedIn: isSignedIn,
      resetSession: resetSession,
      get: get
    };

    function setAuthToken(id, email, token, fbtoken, user) {
      this.id = id !== null ? id : null;
      this.email = email !== null ? email : null;
      this.token = token !== null ? token : null;
      // Update fbtoken if there is a token value.
      if (fbtoken) {
        sessionStorage.setItem('fbtoken', fbtoken);
      }
      if (this.email && this.token) {
        $http.defaults.headers.common["X-User-Id"] = this.id;
        $http.defaults.headers.common["X-User-Email"] = this.email;
        $http.defaults.headers.common["X-User-Token"] = this.token;
        localStorage.setItem(USER_ID_CACHE_KEY, this.id);
        localStorage.setItem(USER_EMAIL_CACHE_KEY, this.email);
        localStorage.setItem(USER_TOKEN_CACHE_KEY, this.token);
      } else {
        delete $http.defaults.headers.common["X-User-Id"];
        delete $http.defaults.headers.common["X-User-Email"];
        delete $http.defaults.headers.common["X-User-Token"];
        localStorage.removeItem(USER_ID_CACHE_KEY);
        localStorage.removeItem(USER_EMAIL_CACHE_KEY);
        localStorage.removeItem(USER_TOKEN_CACHE_KEY);
      }
      return refreshUser(user);
    }

    function refreshUser(user) {
      if (user === null) {
        user = null;
      }
      return this.user = user ? (user.$promise = PromiseFactory(user), user.$resolved = true, user) : this.email && this.token ? void 0 : null;
    }

    function isSignedIn() {
      var id = localStorage.getItem('user_id');
      if(id) return true;
      return false;
    }

    function resetSession() {
      return setAuthToken(null, null);
    }

    function get(key) {
      return localStorage.getItem(key);
    }
  };


  // return Auth;

  Auth.$inject = ['$http', 'PromiseFactory'];

  angular
    .module("app")
    .service('Auth', Auth);

}).call(this);

/**
 * OpenFB is a micro-library that lets you integrate your JavaScript application with Facebook.
 * OpenFB works for both BROWSER-BASED apps and CORDOVA/PHONEGAP apps.
 * This library has no dependency: You don't need (and shouldn't use) the Facebook SDK with this library. Whe running in
 * Cordova, you also don't need the Facebook Cordova plugin. There is also no dependency on jQuery.
 * OpenFB allows you to login to Facebook and execute any Facebook Graph API request.
 * @author Christophe Coenraets @ccoenraets
 * @version 0.4
 */
var openFB = (function () {

    var FB_LOGIN_URL = 'https://www.facebook.com/dialog/oauth',
        FB_LOGOUT_URL = 'https://www.facebook.com/logout.php',

        // By default we store fbtoken in sessionStorage. This can be overridden in init()
        tokenStore = window.sessionStorage,

        fbAppId,

        context = window.location.pathname.substring(0, window.location.pathname.indexOf("/",2)),

        baseURL = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + context,

        oauthRedirectURL = baseURL + '/js/states/login/views/oauthcallback.html',

        logoutRedirectURL = baseURL + '/js/states/login/views/logoutcallback.html',

        // Because the OAuth login spans multiple processes, we need to keep the login callback function as a variable
        // inside the module instead of keeping it local within the login function.
        loginCallback,

        // Indicates if the app is running inside Cordova
        runningInCordova,

        // Used in the exit event handler to identify if the login has already been processed elsewhere (in the oauthCallback function)
        loginProcessed;

    console.log(oauthRedirectURL);
    console.log(logoutRedirectURL);

    document.addEventListener("deviceready", function () {
        runningInCordova = true;
    }, false);

    /**
     * Initialize the OpenFB module. You must use this function and initialize the module with an appId before you can
     * use any other function.
     * @param params - init paramters
     *  appId: The id of the Facebook app,
     *  tokenStore: The store used to save the Facebook token. Optional. If not provided, we use sessionStorage.
     */
    function init(params) {
        if (params.appId) {
            fbAppId = params.appId;
        } else {
            throw 'appId parameter not set in init()';
        }

        if (params.tokenStore) {
            tokenStore = params.tokenStore;
        }
    }

    /**
     * Checks if the user has logged in with openFB and currently has a session api token.
     * @param callback the function that receives the loginstatus
     */
    function getLoginStatus(callback) {
        var token = tokenStore['fbtoken'],
            loginStatus = {};
        if (token) {
            loginStatus.status = 'connected';
            loginStatus.authResponse = {token: token};
        } else {
            loginStatus.status = 'unknown';
        }
        if (callback) callback(loginStatus);
    }

    /**
     * Login to Facebook using OAuth. If running in a Browser, the OAuth workflow happens in a a popup window.
     * If running in Cordova container, it happens using the In-App Browser. Don't forget to install the In-App Browser
     * plugin in your Cordova project: cordova plugins add org.apache.cordova.inappbrowser.
     *
     * @param callback - Callback function to invoke when the login process succeeds
     * @param options - options.scope: The set of Facebook permissions requested
     * @returns {*}
     */
    function login(callback, options) {

        var loginWindow,
            startTime,
            scope = '';

        if (!fbAppId) {
            return callback({status: 'unknown', error: 'Facebook App Id not set.'});
        }

        // Inappbrowser load start handler: Used when running in Cordova only
        function loginWindow_loadStartHandler(event) {
            var url = event.url;
            if (url.indexOf("access_token=") > 0 || url.indexOf("error=") > 0) {
                // When we get the access token fast, the login window (inappbrowser) is still opening with animation
                // in the Cordova app, and trying to close it while it's animating generates an exception. Wait a little...
                var timeout = 600 - (new Date().getTime() - startTime);
                setTimeout(function () {
                    loginWindow.close();
                }, timeout > 0 ? timeout : 0);
                oauthCallback(url);
            }
        }

        // Inappbrowser exit handler: Used when running in Cordova only
        function loginWindow_exitHandler() {
            console.log('exit and remove listeners');
            // Handle the situation where the user closes the login window manually before completing the login process
            deferredLogin.reject({error: 'user_cancelled', error_description: 'User cancelled login process', error_reason: "user_cancelled"});
            loginWindow.removeEventListener('loadstop', loginWindow_loadStartHandler);
            loginWindow.removeEventListener('exit', loginWindow_exitHandler);
            loginWindow = null;
            console.log('done removing listeners');
        }

        if (options && options.scope) {
            scope = options.scope;
        }

        loginCallback = callback;
        loginProcessed = false;


        if (runningInCordova) {
            oauthRedirectURL = "https://www.facebook.com/connect/login_success.html";
        }

        startTime = new Date().getTime();
        loginWindow = window.open(FB_LOGIN_URL + '?client_id=' + fbAppId + '&redirect_uri=' + oauthRedirectURL +
            '&response_type=token&scope=' + scope, '_blank', 'location=no');

        // If the app is running in Cordova, listen to URL changes in the InAppBrowser until we get a URL with an access_token or an error
        if (runningInCordova) {
            loginWindow.addEventListener('loadstart', loginWindow_loadStartHandler);
            loginWindow.addEventListener('exit', loginWindow_exitHandler);
        }
        // Note: if the app is running in the browser the loginWindow dialog will call back by invoking the
        // oauthCallback() function. See oauthcallback.html for details.

    }

    /**
     * Called either by oauthcallback.html (when the app is running the browser) or by the loginWindow loadstart event
     * handler defined in the login() function (when the app is running in the Cordova/PhoneGap container).
     * @param url - The oautchRedictURL called by Facebook with the access_token in the querystring at the ned of the
     * OAuth workflow.
     */
    function oauthCallback(url) {
        // Parse the OAuth data received from Facebook
        var queryString,
            obj;

        loginProcessed = true;
        if (url.indexOf("access_token=") > 0) {
            queryString = url.substr(url.indexOf('#') + 1);
            obj = parseQueryString(queryString);
            tokenStore['fbtoken'] = obj['access_token'];
            if (loginCallback) loginCallback({status: 'connected', authResponse: {token: obj['access_token']}});
        } else if (url.indexOf("error=") > 0) {
            queryString = url.substring(url.indexOf('?') + 1, url.indexOf('#'));
            obj = parseQueryString(queryString);
            if (loginCallback) loginCallback({status: 'not_authorized', error: obj.error});
        } else {
            if (loginCallback) loginCallback({status: 'not_authorized'});
        }
    }

    /**
     * Logout from Facebook, and remove the token.
     * IMPORTANT: For the Facebook logout to work, the logoutRedirectURL must be on the domain specified in "Site URL" in your Facebook App Settings
     *
     */
    function logout(callback) {
        var logoutWindow,
            token = tokenStore['fbtoken'];

        /* Remove token. Will fail silently if does not exist */
        tokenStore.removeItem('fbtoken');

        if (token) {
            logoutWindow = window.open(FB_LOGOUT_URL + '?access_token=' + token + '&next=' + logoutRedirectURL, '_blank', 'location=no');
            if (runningInCordova) {
                setTimeout(function() {
                    logoutWindow.close();
                }, 700);
            }
        }

        if (callback) {
            callback();
        }

    }

    /**
     * Lets you make any Facebook Graph API request.
     * @param obj - Request configuration object. Can include:
     *  method:  HTTP method: GET, POST, etc. Optional - Default is 'GET'
     *  path:    path in the Facebook graph: /me, /me.friends, etc. - Required
     *  params:  queryString parameters as a map - Optional
     *  success: callback function when operation succeeds - Optional
     *  error:   callback function when operation fails - Optional
     */
    function api(obj) {

        var method = obj.method || 'GET',
            params = obj.params || {},
            xhr = new XMLHttpRequest(),
            url;

        params['access_token'] = tokenStore['fbtoken'];

        url = 'https://graph.facebook.com' + obj.path + '?' + toQueryString(params);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    if (obj.success) obj.success(JSON.parse(xhr.responseText));
                } else {
                    var error = xhr.responseText ? JSON.parse(xhr.responseText).error : {message: 'An error has occurred'};
                    if (obj.error) obj.error(error);
                }
            }
        };

        xhr.open(method, url, true);
        xhr.send();
    }

    /**
     * Helper function to de-authorize the app
     * @param success
     * @param error
     * @returns {*}
     */
    function revokePermissions(success, error) {
        return api({method: 'DELETE',
            path: '/me/permissions',
            success: function () {
                tokenStore['fbtoken'] = undefined;
                success();
            },
            error: error});
    }

    function parseQueryString(queryString) {
        var qs = decodeURIComponent(queryString),
            obj = {},
            params = qs.split('&');
        params.forEach(function (param) {
            var splitter = param.split('=');
            obj[splitter[0]] = splitter[1];
        });
        return obj;
    }

    function toQueryString(obj) {
        var parts = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
            }
        }
        return parts.join("&");
    }

    // The public API
    return {
        init: init,
        login: login,
        logout: logout,
        revokePermissions: revokePermissions,
        api: api,
        oauthCallback: oauthCallback,
        getLoginStatus: getLoginStatus
    };

}());

(function() {
  var MapCtrl;
  ItemMapCtrl = function($scope, $ionicLoading, $compile, ItemMapService, BackgroundGeo, $stateParams) {
    var callback, createMarker, MenuItem, vm;

    vm = this;
    vm.item_id = $stateParams.item_id;
    console.log(vm.item_id);
    MenuItem = ItemMapService.get(vm.item_id);
    console.log("MenusItem", MenuItem);

    vm.initialize = initialize;

    // BackgroundGeo
    //   .current()
    //   .then(function (data){
    //     ionic.Platform.ready(function(){
    //       vm.initialize(data.latitude, data.longitude)
    //     });
    //   })

    function initialize(){
      var map,service,infowindow;
      var compiled, contentString, infowindow, map, mapOptions, marker, itemMarker, myLatlng, itemLatlng, request, service;
      // myLatlng = new google.maps.LatLng(lat, lng);
      itemLatlng = new google.maps.LatLng(MenuItem.menu.latitude, MenuItem.menu.longitude);
      mapOptions = {
        center: itemLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(document.getElementById("map"), mapOptions);
      contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
      compiled = $compile(contentString)(vm);
      infowindow = new google.maps.InfoWindow({
        content: compiled[0]
      });
      // myMarker = new google.maps.Marker({
      //   position: myLatlng,
      //   map: map,
      //   title: 'Uluru (Ayers Rock)'
      // });
      itemMarker = new google.maps.Marker({
        position: itemLatlng,
        map: map,
        title: MenuItem.name
      });
      // google.maps.event.addListener(myMarker, 'click', function() {
      //   return infowindow.open(map, myMarker);
      // });
      google.maps.event.addListener(itemMarker, 'click', function() {
        return infowindow.open(map, itemMarker);
      });
      // request = {
      //   location: myLatlng,
      //   radius: '500',
      //   types: ['store']
      // };
      // service = new google.maps.places.PlacesService(map);
      // service.nearbySearch(request, callback);
      vm.map = map;
      return vm.map;

    }

    callback = function(results, status) {
      var item, place, _i, _len, _results;
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        _results = [];
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          item = results[_i];
          place = item;
          console.log(item);
          _results.push(createMarker(item));
        }
        return _results;
      }
    };
    createMarker = function(place) {
      var marker, placeLoc;
      placeLoc = place.geometry.location;
      marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
      });
      return google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        return infowindow.open(map, this);
      });
    };

    /*
     * Invoke initialize on ionic platform.ready()
     */
    ionic.Platform.ready(vm.initialize);
    $scope.centerOnMe = (function(_this) {
      return function() {
        if (!_this.map) {
          return;
        }
        $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });
        return navigator.geolocation.getCurrentPosition(function(pos) {
          _this.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          return $ionicLoading.hide();
        }, function(error) {
          return alert('Unable to get location: ' + error.message);
        });
      };
    })(this);
    this.clickTest = function() {
      return alert('Example of infowindow with ng-click');
    };
  };
  ItemMapCtrl.$inject = ['$scope', '$ionicLoading', '$compile', 'ItemMapService', 'BackgroundGeo', '$stateParams'];
  return angular.module('app.states.map.controllers', []).controller('ItemMapCtrl', ItemMapCtrl);
})();

(function() {
  (function() {
    var MapCtrl;
    MapCtrl = function($scope, $ionicLoading, $compile) {
      var callback, createMarker;
      this.initialize = (function(_this) {
        return function() {
          map;
          service;
          infowindow;
          var compiled, contentString, infowindow, map, mapOptions, marker, myLatlng, request, service;
          myLatlng = new google.maps.LatLng(window.currLocation.coords.latitude, window.currLocation.coords.longitude);
          mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          map = new google.maps.Map(document.getElementById("map"), mapOptions);
          contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
          compiled = $compile(contentString)(_this);
          infowindow = new google.maps.InfoWindow({
            content: compiled[0]
          });
          marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Uluru (Ayers Rock)'
          });
          google.maps.event.addListener(marker, 'click', function() {
            return infowindow.open(map, marker);
          });
          request = {
            location: myLatlng,
            radius: '500',
            types: ['store']
          };
          service = new google.maps.places.PlacesService(map);
          service.nearbySearch(request, callback);
          return _this.map = map;
        };
      })(this);
      callback = function(results, status) {
        var item, place, _i, _len, _results;
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          _results = [];
          for (_i = 0, _len = results.length; _i < _len; _i++) {
            item = results[_i];
            place = item;
            console.log(item);
            _results.push(createMarker(item));
          }
          return _results;
        }
      };
      createMarker = function(place) {
        var marker, placeLoc;
        placeLoc = place.geometry.location;
        marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });
        return google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent(place.name);
          return infowindow.open(map, this);
        });
      };

      /*
       * Invoke initialize on ionic platform.ready()
       */
      ionic.Platform.ready(this.initialize);
      $scope.centerOnMe = (function(_this) {
        return function() {
          if (!_this.map) {
            return;
          }
          $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
          });
          return navigator.geolocation.getCurrentPosition(function(pos) {
            _this.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            return $ionicLoading.hide();
          }, function(error) {
            return alert('Unable to get location: ' + error.message);
          });
        };
      })(this);
      this.clickTest = function() {
        return alert('Example of infowindow with ng-click');
      };
    };
    MapCtrl.$inject = ['$scope', '$ionicLoading', '$compile'];
    return angular.module('app.states.map.controllers', []).controller('MapCtrl', MapCtrl);
  })();

}).call(this);

(function() {
  (function() {
    var MenusMapCtrl;
    MenusMapCtrl = function($scope, $ionicLoading, $compile, MenusData) {
      var initialize;
      this.rand = Math.random();
      this.locations = MenusData.get();
      this.locate = window.currLocation.coords;
      initialize = (function(_this) {
        return function() {
          var compiled, contentString, infowindow, item, loc, map, mapOptions, marker, myLatlng, _i, _len, _ref;
          myLatlng = new google.maps.LatLng(_this.locate.latitude, _this.locate.longitude);
          mapOptions = {
            center: myLatlng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          map = new google.maps.Map(document.getElementById("nearbyMap"), mapOptions);
          contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
          compiled = $compile(contentString)(_this);
          infowindow = new google.maps.InfoWindow({
            content: compiled[0]
          });
          _ref = _this.locations;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            loc = new google.maps.LatLng(item.geometry.location.k, item.geometry.location.B);
            marker = new google.maps.Marker({
              position: loc,
              map: map,
              title: item.name
            });
            google.maps.event.addListener(marker, 'click', function() {
              return infowindow.open(map, marker);
            });
          }
          return _this.map = map;
        };
      })(this);
      ionic.Platform.ready(initialize);
      this.centerOnMe = function() {
        if (!this.map) {
          return;
        }
        $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });
        return navigator.geolocation.getCurrentPosition((function(_this) {
          return function(pos) {
            _this.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            return $ionicLoading.hide();
          };
        })(this), function(error) {
          return alert('Unable to get location: ' + error.message);
        });
      };
      this.clickTest = function() {
        return alert('Example of infowindow with ng-click');
      };
    };
    MenusMapCtrl.$inject = ['$scope', '$ionicLoading', '$compile', 'MenusData'];
    return angular.module('app.states.map.controllers').controller('MenusMapCtrl', MenusMapCtrl);
  })();

}).call(this);


(function() {
  (function() {
    var ItemMapService = function(){
      var _storage = {};
      var instance = {
        set: set,
        get: get
      };
      return instance;

      ///////////

      function set(key, obj){
        _storage = {};
        _storage[key] = obj;
      }

      function get(key){
        if(key){
          return _storage[key];
        }
        return _storage;
      }
    };
    return angular.module('app.states.map').service('ItemMapService', ItemMapService);
  })();

}).call(this);

(function() {
  var ItemsCtrl = function(resolvedData, $scope, $ionicModal, MenuItem, Menu, $q, BackgroundGeo, findDistance, makeStars, ItemMapService, MakeMap) {


    var vm,map,service,infowindow;

    vm = this;
    vm.items = resolvedData
    vm.querySearch = querySearch;
    vm.closeModal = closeModal;
    vm.openModal = openModal;
    vm.storeItemForMap = storeItemForMap;


    $ionicModal.fromTemplateUrl("js/tabs/items/modals/filterModal.html", {
      scope: $scope,
      animation: "slide-in-up"
    })
    .then(function($ionicModal) {
      vm.filterModal = $ionicModal;
    });


    //////////////////



    function querySearch(itemsFilter){

      itemsFilter = itemsFilter || "empty";

      // getMenuItems(itemsFilter)

      //   .then(function(data) {

      //     vm.items = newData;

      //   });
    }

    function openModal(){

      vm.filterModal.show();

    }
    function closeModal(){

      vm.filterModal.hide();

    }
    function storeItemForMap(item){
      ItemMapService.set(item._id, item);
    }
  };

  ItemsCtrl
    .$inject = [
      "resolvedData",
      "$scope",
      "$ionicModal",
      "MenuItem",
      "Menu",
      "$q",
      "BackgroundGeo",
      "findDistance",
      "makeStars",
      "ItemMapService"
    ];

  angular
    .module("app.tabs.items")
    .controller("ItemsCtrl", ItemsCtrl);

})();

(function(){
  var ListCtrl = function($scope, Auth, User, List, listInit, $state, UserStorage){

    var list = this;
    list.items = listInit;

    if (!Auth.isSignedIn()) {
      $state.go('tab.logins');
    }
    else if (!list.items) {
      $state.go('tab.empty-list');
    }

    list.showCollection = showCollection;
    list.showBookmarks  = showBookmarks;
    // list.login          = login;


    //////////////////

    getCollection();
    getBookmarks();
    list.viewBookmarks = true;
    function getCollection(){
      UserStorage.getData('collection')
        .then(function ( data ){
          console.log(data);
          list.collection = data;
          list.collectionCount = data.length;
        })
    }
    function getBookmarks(){
      UserStorage.getData('bookmarks')
        .then(function ( data ){
          list.bookmarks = data;
          list.bookmarksCount = data.length;
        });
    }

    function showBookmarks(){
      list.viewCollection = false;
      list.viewBookmarks = true;
    }
    function showCollection(){
      list.viewBookmarks = false;
      list.viewCollection = true;
    }
    // function login(){
    //   Auth.setAuthToken( list.username, list.password );
    // };
  };

  ListCtrl.$inject = ['$scope', 'Auth', 'User', 'List', 'listInit', '$state', 'UserStorage'];
  angular
    .module('app.tabs.list')
    .controller('ListCtrl', ListCtrl);

})();

(function() {
  /*
   * @name   MenusCtrl
   * @desc   Controller for the menus tab
   *         Start off the google search by looking up businesses within our current location
   * @test1  test to see if @locations has data
   * @test2  test to see if @locate is equal to our current longitude and latitude
   */
  var MenusCtrl = function(resolvedMenuData, $scope, $document, ngGPlacesAPI, $location) {

    var vm = this;

    vm.locations = resolvedMenuData;

    vm.searchEventTimeout = void 0;
    vm.searchInputElement = angular.element($document.find('#searchQuery'));


    $scope.place = ""

    $scope.$watch('place', function(val){
      if(val.place_id){
        $location.path('/tab/menus/menu/' + val.place_id)
      }
    })
    /////////////////////


    function googleSearch(query){
      return ngGPlacesAPI.nearbySearch(query);
    }

  };

  MenusCtrl
    .$inject = [
      'resolvedMenuData',
      '$scope',
      '$document',
      'ngGPlacesAPI',
      '$location'
    ];
  angular
    .module('app.tabs.menus.controllers', [])
    .controller('MenusCtrl', MenusCtrl);
})();

// (function() {
//   /*
//    * @name   MenusCtrl
//    * @desc   Controller for the menus tab
//    *         Start off the google search by looking up businesses within our current location
//    * @test1  test to see if @locations has data
//    * @test2  test to see if @locate is equal to our current longitude and latitude
//    */
//   var holdMenusCtrl = function($scope, Menu, $timeout, $document, ngGPlacesAPI) {
//     var vm = this
//     var geocoder = new google.maps.Geocoder()
//     vm.locate = window.currLocation.coords;
//     results = []
//     Menu
//       .get()
//       .then(function (data){
//         var i = 0
//         var count = 0
//         doGeo(data[1])
//         // setInterval(function(){
//         //   if(!data[i].place_id && data[i]){
//         //     console.log(data[i]);
//         //     console.log(count);
//         //     count++
//         //     doGeo(data[i])
//         //     if(i > data.length) return
//         //   }
//         //   i++
//         // }, 500)
//
//         // for(var i = 0; i < data.length; i++){
//         //   if(data[i].name === "Bob's Steak and Chop House"){
//         //     doGeo(data[i])
//         //   }
//         //     // results.push(data[i])
//         // }
//         // }
//         // console.log(data);
//       })
//
//     vm.searchEventTimeout = void 0;
//
//     vm.searchInputElement = angular.element($document.find('#searchQuery'));
//
//     vm.searchQuery = {
//       vicinity: 'San Francisco',
//       // reference: "Cliffs house",
//       latitude: vm.locate.latitude,
//       longitude: vm.locate.longitude
//     };
//
//     googleSearch(vm.searchQuery)
//
//       .then(function(data) {
//
//         console.log(data);
//
//         vm.locations = data;
//
//       });
//
//     /////////////////////
//
//     function doGeo(query){
//       // geocoder.geocode({ address: query.address }, function(results, status){
//         console.log(results);
//       // console.log(query.name)
//         var str = query.address.replace(/ San Francisco$/i, "")
//         query.address = str
//         // var str2 = query.address.split("San Francisco")[0]
//         // console.log(str);
//         gQuery = {
//           nearbySearchKeys: ['geometry'],
//           // keyword: query.address,
//           name: query.name,
//           reference: query.name,
//           // name: "Uncle Vito's",
//           // reference: 'Uncle Vito\'s',
//           // vicinity: query.city,
//           latitude: vm.locate.latitude,
//           longitude:vm.locate.longitude,
//           // radius:20000,
//           // name: query,
//           // latitude: results[0].geometry.location.k,
//           // longitude: results[0].geometry.location.B
//         };
//         console.log(gQuery);
//           // var gQuery = {reference: results.formatted_address}
//         googleSearch(gQuery)
//           .then(function(data){
//             query.place_id = data[0].place_id
//
//             // Menu.update(query._id, query)
//             query.lat = data[0].geometry.location.k
//             query.lng = data[0].geometry.location.B
//             // query.put()
//             console.log(query);
//             console.log("Google", data);
//           })
//           .catch(function(msg){
//             console.log("Error", msg);
//           })
//       // })
//       //   if (status === google.maps.GeocoderStatus.OK){
//       //     console.log(status);
//       //   }else{
//       //  // @TODO: Figure out what to do when the geocoding fails
//       //   }
//       // })
//     }
//
//     function googleSearch(query){
//       return ngGPlacesAPI.nearbySearch(query);
//     };
//
//   };
//
//   MenusCtrl
//     .$inject = ['$scope', 'Menu', '$timeout', '$document', 'ngGPlacesAPI'];
//   angular
//     .module('app.tabs.menus.controllers')
//     .controller('holdMenusCtrl', holdMenusCtrl);
// })();

(function() {

  var MenusData = function() {
    var data, geocoder;
    geocoder = new google.maps.Geocoder();
    data = [];
    return {
      get: function() {
        return data;
      },
      set: function(StateData) {
        return data = StateData;
      }
    };
  };
  angular
    .module('app.tabs.menus.services', [])
    .service('MenusData', MenusData);

}).call(this);

(function() {
  var ReviewItemCtrl = function($scope, CreateReview, Menu, $stateParams, menuItemsInit, menuInit) {

    var reviewItem = this;

    reviewItem.menu = menuInit;
    reviewItem.items = menuItemsInit;

    reviewItem.menu_id = $stateParams.menu_id;

    CreateReview.set('menu_id', reviewItem.menu._id);

    ////////////////

  };
  ReviewItemCtrl
    .$inject = ['$scope', 'CreateReview', 'Menu', '$stateParams', 'menuItemsInit', 'menuInit'];
  angular
    .module('app.tabs.review')
    .controller('ReviewItemCtrl', ReviewItemCtrl);
})();

(function() {
  var ReviewMenuCtrl = function($scope, Menu, reviewMenuInit, locationData) {
    var reviewMenu = this;
    var LocationData = locationData;
    reviewMenu.menus = reviewMenuInit;

    /*** CONTROLLER METHODS ***/

    reviewMenu.newSearch = newSearch;

    /**************************/

    function newSearch(nearbyFilter) {

      var menuFilter = menuFilter || "empty";

      Menu.getByLocation(LocationData, nearbyFilter)
        .then(function(data) {
          reviewMenu.menus = data;
        });
    }
  };

  ReviewMenuCtrl
    .$inject = ['$scope', 'Menu', 'reviewMenuInit', 'locationData'];
  angular
    .module('app.tabs.review.controllers', [])
    .controller('ReviewMenuCtrl', ReviewMenuCtrl);
})();

(function() {
  var createReviewCtrl = function($scope, CreateReview, Review, createReviewInit, Auth, $state, $ionicLoading) {
    if (!Auth.isSignedIn()) {
      $state.go('tab.logins');
    }

    var createReviewView = this;
    createReviewView.item = createReviewInit;
    createReviewView.buttons = [1, 2, 3, 4, 5];

    createReviewView.rating = 0;
    CreateReview.set('item_id', createReviewView.item._id);
    CreateReview.set('menu_id', createReviewView.item.menu_id);
    CreateReview.set('user_id', Number(Auth.get('user_id')));
    createReviewView.review = CreateReview.get();

    createReviewView.setStarRating = function(index) {
      if (createReviewView.rating === index) {
        createReviewView.rating = 0;
      } else {
        createReviewView.rating = index;
      }
      return CreateReview.set('rating', createReviewView.rating);
    };

    // Post review and then navigate back to menu items selection view.
    createReviewView.submitReview = function() {
      $ionicLoading.show({template: 'Posting your review...'});
      CreateReview.set('text', createReviewView.reviewText);
      var params = {
        item_id:  CreateReview.get('item_id'),
        menu_id:  CreateReview.get('menu_id'),
        user_id:  CreateReview.get('user_id'),
        rating:   CreateReview.get('rating'),
        text:     CreateReview.get('text')
      };
      Review.createTextOnly(params)
        .then(function() {
          $state.go('tab.review-choose-item', {menuId: params.menu_id});
          $ionicLoading.hide();
        });
    };

    // Post review with a photo. Needs to be reconfigured.
    createReviewView.submitPhotoReview = function() {
      var fail, ft, imgUrl, options, params, win;
      CreateReview.set('text', createReviewView.reviewText);
      imgUrl = CreateReview.get('image_url');
      win = function(r) {
        console.log("Code = " + r.responseCode);
        return console.log("Response = " + r.response);
      };
      fail = function(error) {
        alert("An error has occurred: Code = " + error.code);
        console.log("upload error source " + error.source);
        return console.log("upload error target " + error.target);
      };
      options = new FileUploadOptions();
      options.fileKey = "image_url";
      options.fileName = imgUrl.substr(imgUrl.lastIndexOf('/') + 1);
      options.chunkedMode = false;
      options.mimeType = "image/jpeg";
      params = {
        item_id: CreateReview.get('item_id'),
        menu_id: CreateReview.get('menu_id'),
        user_id: CreateReview.get('user_id'),
        rating: CreateReview.get('rating'),
        text: CreateReview.get('text')
      };
      options.params = params;
      ft = new FileTransfer();
      return ft.upload(imgUrl, encodeURI('http://192.168.1.9:9000/api/reviews'), win, fail, options);
    };
  };


  createReviewCtrl.$inject = ['$scope', 'CreateReview', 'Review', 'createReviewInit', 'Auth', '$state', '$ionicLoading'];
  return angular.module('app.tabs.review').controller('createReviewCtrl', createReviewCtrl);
})();

(function() {
  var CreateReview;
  CreateReview = function() {
    var review = {};
    return {
      get: function(key) {
        if (key) {
          return review[key];
        }
        return review;
      },
      set: function(key, val) {
        return review[key] = val;
      }
    };
  };
  return angular.module('app.tabs.review').factory('CreateReview', CreateReview);
}).call(this);

(function() {
  var AccountCtrl = function($scope, Auth, User, Restangular, accountInit, $ionicLoading) {
    Restangular.setRestangularFields({
      id: 'username'
    });
    var account = this;
    var original = accountInit;
    account.user = Restangular.copy(original);
    account.isSignedIn = Auth.isSignedIn;

    account.update = update;

    /////////////////////////////////////////

    function update() {
      $ionicLoading.show({template:'Updating Info...'});
      account.user.put()
        .then(function(data) {
          $ionicLoading.hide();
        });
    }
  };

  AccountCtrl
    .$inject = ['$scope', 'Auth','User', 'Restangular', 'accountInit', '$ionicLoading'];
  angular
    .module('app.tabs.settings')
    .controller('AccountCtrl', AccountCtrl);
})();

(function() {
  var SettingsCtrl = function($scope, Auth) {
    var vm = this;
    vm.isSignedIn = Auth.isSignedIn;
  };
  SettingsCtrl
    .$inject = [
      '$scope',
      'Auth'
    ];
  angular
    .module('app.tabs.settings.controllers', [])
    .controller('SettingsCtrl', SettingsCtrl);
})();

