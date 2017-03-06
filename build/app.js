/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _reactDom = __webpack_require__(2);

	var _TimePicker = __webpack_require__(3);

	var _TimePicker2 = _interopRequireDefault(_TimePicker);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	(0, _reactDom.render)(_react2.default.createElement(_TimePicker2.default, null), document.getElementById('outer'));

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = React;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = ReactDOM;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	__webpack_require__(4);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var winWidth = window.innerWidth;
	var winHeight = window.innerHeight;

	var TimePicker = function (_Component) {
	    _inherits(TimePicker, _Component);

	    function TimePicker(props) {
	        _classCallCheck(this, TimePicker);

	        var _this = _possibleConstructorReturn(this, (TimePicker.__proto__ || Object.getPrototypeOf(TimePicker)).call(this, props));

	        _this.state = {
	            touchStartY: 0,
	            touchStartTime: 0,
	            touchMoveY: 0, //记录每一帧touchMove的y坐标
	            touchEndTime: 0, //记录touchend的时间戳

	            touchMoveTime: 0, //每帧touchMove事件的时间戳

	            touching: false,
	            objTranslate: {
	                y: 0
	            },
	            objBounding: {
	                left: 0,
	                right: 0,
	                top: 0,
	                bottom: 0,
	                width: 0,
	                height: 0
	            },
	            containerBounding: {
	                left: 0,
	                right: 0,
	                top: 0,
	                bottom: 0,
	                width: 0,
	                height: 0
	            },
	            moveY: 0, //move过程中的transform-y的值
	            inertia: false };
	        return _this;
	    }

	    _createClass(TimePicker, [{
	        key: 'componentDidMount',
	        value: function componentDidMount() {
	            var ele = document.querySelectorAll('.time-item')[1];
	            this.moveElement(ele, 0, 0);

	            var container = document.querySelectorAll('.time-picker-outer')[0];
	            var containerRect = container.getBoundingClientRect();
	            this.setState({
	                containerBounding: {
	                    left: containerRect.left,
	                    right: containerRect.right,
	                    top: containerRect.top,
	                    bottom: containerRect.bottom,
	                    width: containerRect.width,
	                    height: containerRect.height
	                }
	            });
	            var that = this;

	            ele.addEventListener('touchstart', function (event) {
	                var evt = event.touches[0] || event;
	                var rect = ele.getBoundingClientRect();
	                that.setState({
	                    touchStartY: evt.pageY,
	                    touchStartTime: +new Date(),
	                    touching: true,
	                    objBounding: {
	                        left: rect.left,
	                        right: rect.right,
	                        top: rect.top,
	                        bottom: rect.bottom,
	                        width: rect.width,
	                        height: rect.height
	                    }
	                });
	            });

	            document.addEventListener('touchmove', function (event) {
	                if (!that.state.touching) {
	                    return;
	                }

	                event.preventDefault();
	                var evt = event.touches[0] || event;
	                that.setState({
	                    touchMoveY: evt.pageY,
	                    touchMoveTime: +new Date()
	                });

	                var moveY = evt.pageY - that.state.touchStartY;

	                var desTop = that.state.objBounding.top + moveY;
	                var desBottom = that.state.objBounding.bottom + moveY;

	                if (desTop < that.state.containerBounding.top - that.state.objBounding.height) {
	                    moveY = that.state.containerBounding.top - that.state.objBounding.height - that.state.objBounding.top;
	                }
	                if (desBottom > that.state.containerBounding.bottom + that.state.objBounding.height) {
	                    moveY = that.state.containerBounding.bottom + that.state.objBounding.height - that.state.objBounding.bottom;
	                }

	                var tempY = that.state.objTranslate.y + moveY;
	                that.moveElement(ele, 0, tempY);
	            });

	            document.addEventListener('touchend', function (event) {
	                var evt = event.touches[0] || event;

	                that.setState({
	                    touching: false,
	                    objTranslate: {
	                        y: that.state.moveY
	                    },
	                    touchEndTime: +new Date(),
	                    inertia: true
	                });
	                that.inBox(ele);
	                //最后一次touchMoveTime和touchEndTime之间超过30ms,意味着停留了长时间,不做滑动
	                if (that.state.touchEndTime - that.state.touchMoveTime > 30) {
	                    return;
	                }
	                var moveY = that.state.touchMoveY - that.state.touchStartY; //矢量有+-
	                var time = that.state.touchEndTime - that.state.touchStartTime;
	                var speed = moveY / time * 16.666; //矢量有+-
	                var rate = Math.min(10, Math.abs(speed)); //加速度a

	                var slide = function slide() {
	                    if (that.state.touching) {
	                        that.setState({
	                            inertia: false
	                        });
	                        return;
	                    }
	                    if (!that.state.inertia) {
	                        return;
	                    }
	                    speed = speed - speed / rate;

	                    var y = that.state.objTranslate.y + speed;

	                    that.moveElement(ele, 0, y);
	                    that.setState({
	                        objTranslate: {
	                            y: y
	                        }
	                    });

	                    if (Math.abs(speed) < 0.5) {
	                        speed = 0;
	                        that.setState({
	                            inertia: false
	                        });
	                        that.inBox(ele);
	                    } else {
	                        requestAnimationFrame(slide);
	                    }
	                };

	                slide();
	            });
	        }
	    }, {
	        key: 'inBox',
	        value: function inBox(ele) {
	            var that = this;
	            var maxY = that.state.objBounding.height / 2;
	            var minY = -maxY;
	            var moveY;
	            if (that.state.objTranslate.y > maxY) {
	                moveY = maxY - that.state.objTranslate.y;
	            } else if (that.state.objTranslate.y < minY) {
	                moveY = minY - that.state.objTranslate.y;
	            } else {
	                return;
	            }

	            var start = 0;
	            var during = 40;
	            var init = that.state.objTranslate.y;

	            var run = function run() {
	                // 如果用户触摸元素，停止滑动
	                if (that.state.touching) {
	                    that.setState({
	                        objTranslate: {
	                            y: that.state.moveY
	                        },
	                        inertia: false
	                    });
	                    return;
	                }

	                start++;
	                var y = that.easeOutQuad(start, init, moveY, during);
	                that.moveElement(ele, 0, y);

	                if (start < during) {
	                    requestAnimationFrame(run);
	                } else {
	                    that.setState({
	                        objTranslate: {
	                            y: y
	                        },
	                        inertia: false
	                    });
	                }
	            };
	            run();
	        }
	    }, {
	        key: 'moveElement',
	        value: function moveElement(ele, x, y) {
	            var x = Math.round(1000 * x) / 1000;
	            var y = Math.round(1000 * y) / 1000;

	            ele.style.webkitTransform = 'translate(' + x + 'px,' + y + 'px)';
	            ele.style.transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';
	            this.setState({
	                desX: x,
	                moveY: y
	            });
	        }
	        // easeOutQuad算法,先慢后快
	        /*
	         * t: current time(当前时间)
	         * b: beginning value(初始值)
	         * c: change in value(变化量)
	         * d: duration(持续时间)
	        **/

	    }, {
	        key: 'easeOutQuad',
	        value: function easeOutQuad(t, b, c, d) {
	            return -c * (t /= d) * (t - 2) + b;
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            return _react2.default.createElement(
	                'div',
	                { className: 'time-picker-outer' },
	                _react2.default.createElement(
	                    'div',
	                    { className: 'time-item' },
	                    '1'
	                ),
	                _react2.default.createElement(
	                    'div',
	                    { className: 'time-item' },
	                    '2'
	                ),
	                _react2.default.createElement(
	                    'div',
	                    { className: 'time-item' },
	                    '3'
	                ),
	                _react2.default.createElement(
	                    'div',
	                    { className: 'time-item' },
	                    '4'
	                ),
	                _react2.default.createElement(
	                    'div',
	                    { className: 'time-item' },
	                    '5'
	                )
	            );
	        }
	    }]);

	    return TimePicker;
	}(_react.Component);

	exports.default = TimePicker;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(5);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../node_modules/css-loader/index.js!./main.css", function() {
				var newContent = require("!!../node_modules/css-loader/index.js!./main.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "@charset \"utf-8\";\r\n\r\nhtml, body, div, p, a, span {\r\n\tmargin: 0;\r\n\tpadding: 0;\r\n}\r\nhtml, body {\r\n\theight: 100%;\r\n}\r\n\r\n.time-picker-outer {\r\n\tdisplay: -webkit-box;\r\n\tdisplay: -ms-flexbox;\r\n\tdisplay: -webkit-flex;\r\n\tdisplay: flex;\r\n\twidth: 100%;\r\n\tposition: fixed;\r\n\ttop: 200px;\r\n}\r\n.time-item {\r\n\t-webkit-box-flex: 1;\r\n\tflex: 1;\r\n\theight: 6rem;\r\n\tbackground: #ccc;\r\n\ttext-align: center;\r\n}", ""]);

	// exports


/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function () {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				var item = this[i];
				if (item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function (modules, mediaQuery) {
			if (typeof modules === "string") modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for (var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if (typeof id === "number") alreadyImportedModules[id] = true;
			}
			for (i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if (mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if (mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }
/******/ ]);