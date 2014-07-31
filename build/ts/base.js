/*
* Copyright 2014 Mozilla Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
///<reference path='references.ts' />
var jsGlobal = (function () {
    return this || (1, eval)('this');
})();
var inBrowser = typeof console != "undefined";

// declare var print;
// declare var console;
// declare var performance;
// declare var XMLHttpRequest;
// declare var document;
// declare var getComputedStyle;
/** @const */ var release = false;
/** @const */ var profile = false;

if (!jsGlobal.performance) {
    jsGlobal.performance = {};
}

if (!jsGlobal.performance.now) {
    jsGlobal.performance.now = typeof dateNow !== 'undefined' ? dateNow : Date.now;
}

function log(message) {
    var optionalParams = [];
    for (var _i = 0; _i < (arguments.length - 1); _i++) {
        optionalParams[_i] = arguments[_i + 1];
    }
    jsGlobal.print.apply(jsGlobal, arguments);
}

function warn(message) {
    var optionalParams = [];
    for (var _i = 0; _i < (arguments.length - 1); _i++) {
        optionalParams[_i] = arguments[_i + 1];
    }
    if (inBrowser) {
        console.warn.apply(console, arguments);
    } else {
        jsGlobal.print(Shumway.IndentingWriter.RED + message + Shumway.IndentingWriter.ENDC);
    }
}

var Shumway;
(function (Shumway) {
    (function (CharacterCodes) {
        CharacterCodes[CharacterCodes["_0"] = 48] = "_0";
        CharacterCodes[CharacterCodes["_1"] = 49] = "_1";
        CharacterCodes[CharacterCodes["_2"] = 50] = "_2";
        CharacterCodes[CharacterCodes["_3"] = 51] = "_3";
        CharacterCodes[CharacterCodes["_4"] = 52] = "_4";
        CharacterCodes[CharacterCodes["_5"] = 53] = "_5";
        CharacterCodes[CharacterCodes["_6"] = 54] = "_6";
        CharacterCodes[CharacterCodes["_7"] = 55] = "_7";
        CharacterCodes[CharacterCodes["_8"] = 56] = "_8";
        CharacterCodes[CharacterCodes["_9"] = 57] = "_9";
    })(Shumway.CharacterCodes || (Shumway.CharacterCodes = {}));
    var CharacterCodes = Shumway.CharacterCodes;

    /**
    * The buffer length required to contain any unsigned 32-bit integer.
    */
    /** @const */ Shumway.UINT32_CHAR_BUFFER_LENGTH = 10;
    /** @const */ Shumway.UINT32_MAX = 0xFFFFFFFF;
    /** @const */ Shumway.UINT32_MAX_DIV_10 = 0x19999999;
    /** @const */ Shumway.UINT32_MAX_MOD_10 = 0x5;

    function isString(value) {
        return typeof value === "string";
    }
    Shumway.isString = isString;

    function isFunction(value) {
        return typeof value === "function";
    }
    Shumway.isFunction = isFunction;

    function isNumber(value) {
        return typeof value === "number";
    }
    Shumway.isNumber = isNumber;

    function isInteger(value) {
        return (value | 0) === value;
    }
    Shumway.isInteger = isInteger;

    function isArray(value) {
        return value instanceof Array;
    }
    Shumway.isArray = isArray;

    function isNumberOrString(value) {
        return typeof value === "number" || typeof value === "string";
    }
    Shumway.isNumberOrString = isNumberOrString;

    function isObject(value) {
        return typeof value === "object" || typeof value === 'function';
    }
    Shumway.isObject = isObject;

    function toNumber(x) {
        return +x;
    }
    Shumway.toNumber = toNumber;

    function isNumericString(value) {
        // ECMAScript 5.1 - 9.8.1 Note 1, this expression is true for all
        // numbers x other than -0.
        return String(Number(value)) === value;
    }
    Shumway.isNumericString = isNumericString;

    /**
    * Whether the specified |value| is a number or the string representation of a number.
    */
    function isNumeric(value) {
        if (typeof value === "number") {
            return true;
        } else if (typeof value === "string") {
            return isIndex(value) || isNumericString(value);
        } else {
            // Debug.notImplemented(typeof value);
            return false;
        }
    }
    Shumway.isNumeric = isNumeric;

    /**
    * Whether the specified |value| is an unsigned 32 bit number expressed as a number
    * or string.
    */
    function isIndex(value) {
        // js/src/vm/String.cpp JSFlatString::isIndexSlow
        // http://dxr.mozilla.org/mozilla-central/source/js/src/vm/String.cpp#474
        var index = 0;
        if (typeof value === "number") {
            index = (value | 0);
            if (value === index && index >= 0) {
                return true;
            }
            return value >>> 0 === value;
        }
        if (typeof value !== "string") {
            return false;
        }
        var length = value.length;
        if (length === 0) {
            return false;
        }
        if (value === "0") {
            return true;
        }

        // Is there any way this will fit?
        if (length > Shumway.UINT32_CHAR_BUFFER_LENGTH) {
            return false;
        }
        var i = 0;
        index = value.charCodeAt(i++) - 48 /* _0 */;
        if (index < 1 || index > 9) {
            return false;
        }
        var oldIndex = 0;
        var c = 0;
        while (i < length) {
            c = value.charCodeAt(i++) - 48 /* _0 */;
            if (c < 0 || c > 9) {
                return false;
            }
            oldIndex = index;
            index = 10 * index + c;
        }

        /*
        * Look out for "4294967296" and larger-number strings that fit in UINT32_CHAR_BUFFER_LENGTH.
        * Only unsigned 32-bit integers shall pass.
        */
        if ((oldIndex < Shumway.UINT32_MAX_DIV_10) || (oldIndex === Shumway.UINT32_MAX_DIV_10 && c <= Shumway.UINT32_MAX_MOD_10)) {
            return true;
        }
        return false;
    }
    Shumway.isIndex = isIndex;

    function isNullOrUndefined(value) {
        return value == undefined;
    }
    Shumway.isNullOrUndefined = isNullOrUndefined;

    (function (Debug) {
        function backtrace() {
            try  {
                throw new Error();
            } catch (e) {
                return e.stack ? e.stack.split('\n').slice(2).join('\n') : '';
            }
        }
        Debug.backtrace = backtrace;

        function error(message) {
            if (!inBrowser) {
                warn(message + "\n\nStack Trace:\n" + Debug.backtrace());
            }
            throw new Error(message);
        }
        Debug.error = error;

        function assert(condition) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if (condition === "") {
                condition = true;
            }
            if (!condition) {
                var message = Array.prototype.slice.call(arguments);
                message.shift();
                Debug.error(message.join(""));
            }
        }
        Debug.assert = assert;

        function assertUnreachable(msg) {
            var location = new Error().stack.split('\n')[1];
            throw new Error("Reached unreachable location " + location + msg);
        }
        Debug.assertUnreachable = assertUnreachable;

        function assertNotImplemented(condition, message) {
            if (!condition) {
                Debug.error("NotImplemented: " + message);
            }
        }
        Debug.assertNotImplemented = assertNotImplemented;

        function warning(message) {
            release || warn(message);
        }
        Debug.warning = warning;

        function notUsed(message) {
            release || Debug.assert(false, "Not Used " + message);
        }
        Debug.notUsed = notUsed;

        function notImplemented(message) {
            log("release: " + release);
            release || Debug.assert(false, "Not Implemented " + message);
        }
        Debug.notImplemented = notImplemented;

        function abstractMethod(message) {
            Debug.assert(false, "Abstract Method " + message);
        }
        Debug.abstractMethod = abstractMethod;

        var somewhatImplementedCache = {};

        function somewhatImplemented(message) {
            if (somewhatImplementedCache[message]) {
                return;
            }
            somewhatImplementedCache[message] = true;
            Debug.warning("somewhatImplemented: " + message);
        }
        Debug.somewhatImplemented = somewhatImplemented;

        function unexpected(message) {
            Debug.assert(false, "Unexpected: " + message);
        }
        Debug.unexpected = unexpected;

        function untested(message) {
            Debug.warning("Congratulations, you've found a code path for which we haven't found a test case. Please submit the test case: " + message);
        }
        Debug.untested = untested;
    })(Shumway.Debug || (Shumway.Debug = {}));
    var Debug = Shumway.Debug;

    function getTicks() {
        return performance.now();
    }
    Shumway.getTicks = getTicks;

    (function (ArrayUtilities) {
        var assert = Shumway.Debug.assert;

        /**
        * Pops elements from a source array into a destination array. This avoids
        * allocations and should be faster. The elements in the destination array
        * are pushed in the same order as they appear in the source array:
        *
        * popManyInto([1, 2, 3], 2, dst) => dst = [2, 3]
        */
        function popManyInto(src, count, dst) {
            release || assert(src.length >= count);
            for (var i = count - 1; i >= 0; i--) {
                dst[i] = src.pop();
            }
            dst.length = count;
        }
        ArrayUtilities.popManyInto = popManyInto;

        function popMany(array, count) {
            release || assert(array.length >= count);
            var start = array.length - count;
            var result = array.slice(start, this.length);
            array.splice(start, count);
            return result;
        }
        ArrayUtilities.popMany = popMany;

        /**
        * Just deletes several array elements from the end of the list.
        */
        function popManyIntoVoid(array, count) {
            release || assert(array.length >= count);
            array.length = array.length - count;
        }
        ArrayUtilities.popManyIntoVoid = popManyIntoVoid;

        function pushMany(dst, src) {
            for (var i = 0; i < src.length; i++) {
                dst.push(src[i]);
            }
        }
        ArrayUtilities.pushMany = pushMany;

        function top(array) {
            return array.length && array[array.length - 1];
        }
        ArrayUtilities.top = top;

        function last(array) {
            return array.length && array[array.length - 1];
        }
        ArrayUtilities.last = last;

        function peek(array) {
            release || assert(array.length > 0);
            return array[array.length - 1];
        }
        ArrayUtilities.peek = peek;

        function indexOf(array, value) {
            for (var i = 0, j = array.length; i < j; i++) {
                if (array[i] === value) {
                    return i;
                }
            }
            return -1;
        }
        ArrayUtilities.indexOf = indexOf;

        function pushUnique(array, value) {
            for (var i = 0, j = array.length; i < j; i++) {
                if (array[i] === value) {
                    return i;
                }
            }
            array.push(value);
            return array.length - 1;
        }
        ArrayUtilities.pushUnique = pushUnique;

        function unique(array) {
            var result = [];
            for (var i = 0; i < array.length; i++) {
                pushUnique(result, array[i]);
            }
            return result;
        }
        ArrayUtilities.unique = unique;

        function copyFrom(dst, src) {
            dst.length = 0;
            ArrayUtilities.pushMany(dst, src);
        }
        ArrayUtilities.copyFrom = copyFrom;

        /**
        * Makes sure that a typed array has the requested capacity. If required, it creates a new
        * instance of the array's class with a power-of-two capacity at least as large as required.
        *
        * Note: untyped because generics with constraints are pretty annoying.
        */
        function ensureTypedArrayCapacity(array, capacity) {
            if (array.length < capacity) {
                var oldArray = array;
                array = new array.constructor(Shumway.IntegerUtilities.nearestPowerOfTwo(capacity));
                array.set(oldArray, 0);
            }
            return array;
        }
        ArrayUtilities.ensureTypedArrayCapacity = ensureTypedArrayCapacity;

        var ArrayWriter = (function () {
            function ArrayWriter(initialCapacity) {
                if (typeof initialCapacity === "undefined") { initialCapacity = 16; }
                this._u8 = null;
                this._u16 = null;
                this._i32 = null;
                this._f32 = null;
                this._offset = 0;
                this.ensureCapacity(initialCapacity);
            }
            ArrayWriter.prototype.reset = function () {
                this._offset = 0;
            };

            Object.defineProperty(ArrayWriter.prototype, "offset", {
                get: function () {
                    return this._offset;
                },
                enumerable: true,
                configurable: true
            });

            ArrayWriter.prototype.getIndex = function (size) {
                release || assert(size === 1 || size === 2 || size === 4 || size === 8 || size === 16);
                var index = this._offset / size;
                release || assert((index | 0) === index);
                return index;
            };

            ArrayWriter.prototype.ensureAdditionalCapacity = function (size) {
                this.ensureCapacity(this._offset + size);
            };

            ArrayWriter.prototype.ensureCapacity = function (minCapacity) {
                if (!this._u8) {
                    this._u8 = new Uint8Array(minCapacity);
                } else if (this._u8.length > minCapacity) {
                    return;
                }
                var oldCapacity = this._u8.length;

                // var newCapacity = (((oldCapacity * 3) >> 1) + 8) & ~0x7;
                var newCapacity = oldCapacity * 2;
                if (newCapacity < minCapacity) {
                    newCapacity = minCapacity;
                }
                var u8 = new Uint8Array(newCapacity);
                u8.set(this._u8, 0);
                this._u8 = u8;
                this._u16 = new Uint16Array(u8.buffer);
                this._i32 = new Int32Array(u8.buffer);
                this._f32 = new Float32Array(u8.buffer);
            };

            ArrayWriter.prototype.writeInt = function (v) {
                release || assert((this._offset & 0x3) === 0);
                this.ensureCapacity(this._offset + 4);
                this.writeIntUnsafe(v);
            };

            ArrayWriter.prototype.writeIntAt = function (v, offset) {
                release || assert(offset >= 0 && offset <= this._offset);
                release || assert((offset & 0x3) === 0);
                this.ensureCapacity(offset + 4);
                var index = offset >> 2;
                this._i32[index] = v;
            };

            ArrayWriter.prototype.writeIntUnsafe = function (v) {
                var index = this._offset >> 2;
                this._i32[index] = v;
                this._offset += 4;
            };

            ArrayWriter.prototype.writeFloat = function (v) {
                release || assert((this._offset & 0x3) === 0);
                this.ensureCapacity(this._offset + 4);
                this.writeFloatUnsafe(v);
            };

            ArrayWriter.prototype.writeFloatUnsafe = function (v) {
                var index = this._offset >> 2;
                this._f32[index] = v;
                this._offset += 4;
            };

            ArrayWriter.prototype.write4Floats = function (a, b, c, d) {
                release || assert((this._offset & 0x3) === 0);
                this.ensureCapacity(this._offset + 16);
                this.write4FloatsUnsafe(a, b, c, d);
            };

            ArrayWriter.prototype.write4FloatsUnsafe = function (a, b, c, d) {
                var index = this._offset >> 2;
                this._f32[index + 0] = a;
                this._f32[index + 1] = b;
                this._f32[index + 2] = c;
                this._f32[index + 3] = d;
                this._offset += 16;
            };

            ArrayWriter.prototype.write6Floats = function (a, b, c, d, e, f) {
                release || assert((this._offset & 0x3) === 0);
                this.ensureCapacity(this._offset + 24);
                this.write6FloatsUnsafe(a, b, c, d, e, f);
            };

            ArrayWriter.prototype.write6FloatsUnsafe = function (a, b, c, d, e, f) {
                var index = this._offset >> 2;
                this._f32[index + 0] = a;
                this._f32[index + 1] = b;
                this._f32[index + 2] = c;
                this._f32[index + 3] = d;
                this._f32[index + 4] = e;
                this._f32[index + 5] = f;
                this._offset += 24;
            };

            ArrayWriter.prototype.subF32View = function () {
                return this._f32.subarray(0, this._offset >> 2);
            };

            ArrayWriter.prototype.subI32View = function () {
                return this._i32.subarray(0, this._offset >> 2);
            };

            ArrayWriter.prototype.subU16View = function () {
                return this._u16.subarray(0, this._offset >> 1);
            };

            ArrayWriter.prototype.subU8View = function () {
                return this._u8.subarray(0, this._offset);
            };

            ArrayWriter.prototype.hashWords = function (hash, offset, length) {
                var i32 = this._i32;
                for (var i = 0; i < length; i++) {
                    hash = (((31 * hash) | 0) + i32[i]) | 0;
                }
                return hash;
            };

            ArrayWriter.prototype.reserve = function (size) {
                size = (size + 3) & ~0x3; // Round up to multiple of 4.
                this.ensureCapacity(this._offset + size);
                this._offset += size;
            };
            return ArrayWriter;
        })();
        ArrayUtilities.ArrayWriter = ArrayWriter;
    })(Shumway.ArrayUtilities || (Shumway.ArrayUtilities = {}));
    var ArrayUtilities = Shumway.ArrayUtilities;

    var ArrayReader = (function () {
        function ArrayReader(buffer) {
            this._u8 = new Uint8Array(buffer);
            this._u16 = new Uint16Array(buffer);
            this._i32 = new Int32Array(buffer);
            this._f32 = new Float32Array(buffer);
            this._offset = 0;
        }
        Object.defineProperty(ArrayReader.prototype, "offset", {
            get: function () {
                return this._offset;
            },
            enumerable: true,
            configurable: true
        });

        ArrayReader.prototype.isEmpty = function () {
            return this._offset === this._u8.length;
        };

        ArrayReader.prototype.readInt = function () {
            release || Debug.assert((this._offset & 0x3) === 0);
            release || Debug.assert(this._offset <= this._u8.length - 4);
            var v = this._i32[this._offset >> 2];
            this._offset += 4;
            return v;
        };

        ArrayReader.prototype.readFloat = function () {
            release || Debug.assert((this._offset & 0x3) === 0);
            release || Debug.assert(this._offset <= this._u8.length - 4);
            var v = this._f32[this._offset >> 2];
            this._offset += 4;
            return v;
        };
        return ArrayReader;
    })();
    Shumway.ArrayReader = ArrayReader;

    (function (ObjectUtilities) {
        function boxValue(value) {
            if (isNullOrUndefined(value) || isObject(value)) {
                return value;
            }
            return Object(value);
        }
        ObjectUtilities.boxValue = boxValue;

        function toKeyValueArray(object) {
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var array = [];
            for (var k in object) {
                if (hasOwnProperty.call(object, k)) {
                    array.push([k, object[k]]);
                }
            }
            return array;
        }
        ObjectUtilities.toKeyValueArray = toKeyValueArray;

        function isPrototypeWriteable(object) {
            return Object.getOwnPropertyDescriptor(object, "prototype").writable;
        }
        ObjectUtilities.isPrototypeWriteable = isPrototypeWriteable;

        function hasOwnProperty(object, name) {
            return Object.prototype.hasOwnProperty.call(object, name);
        }
        ObjectUtilities.hasOwnProperty = hasOwnProperty;

        function propertyIsEnumerable(object, name) {
            return Object.prototype.propertyIsEnumerable.call(object, name);
        }
        ObjectUtilities.propertyIsEnumerable = propertyIsEnumerable;

        function getOwnPropertyDescriptor(object, name) {
            return Object.getOwnPropertyDescriptor(object, name);
        }
        ObjectUtilities.getOwnPropertyDescriptor = getOwnPropertyDescriptor;

        function hasOwnGetter(object, name) {
            var d = Object.getOwnPropertyDescriptor(object, name);
            return !!(d && d.get);
        }
        ObjectUtilities.hasOwnGetter = hasOwnGetter;

        function getOwnGetter(object, name) {
            var d = Object.getOwnPropertyDescriptor(object, name);
            return d ? d.get : null;
        }
        ObjectUtilities.getOwnGetter = getOwnGetter;

        function hasOwnSetter(object, name) {
            var d = Object.getOwnPropertyDescriptor(object, name);
            return !!(d && !!d.set);
        }
        ObjectUtilities.hasOwnSetter = hasOwnSetter;

        function createObject(prototype) {
            return Object.create(prototype);
        }
        ObjectUtilities.createObject = createObject;

        function createEmptyObject() {
            return Object.create(null);
        }
        ObjectUtilities.createEmptyObject = createEmptyObject;

        function createMap() {
            return Object.create(null);
        }
        ObjectUtilities.createMap = createMap;

        function createArrayMap() {
            return [];
        }
        ObjectUtilities.createArrayMap = createArrayMap;

        function defineReadOnlyProperty(object, name, value) {
            Object.defineProperty(object, name, {
                value: value,
                writable: false,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineReadOnlyProperty = defineReadOnlyProperty;

        function getOwnPropertyDescriptors(object) {
            var o = ObjectUtilities.createMap();
            var properties = Object.getOwnPropertyNames(object);
            for (var i = 0; i < properties.length; i++) {
                o[properties[i]] = Object.getOwnPropertyDescriptor(object, properties[i]);
            }
            return o;
        }
        ObjectUtilities.getOwnPropertyDescriptors = getOwnPropertyDescriptors;

        function cloneObject(object) {
            var clone = ObjectUtilities.createEmptyObject();
            for (var property in object) {
                clone[property] = object[property];
            }
            return clone;
        }
        ObjectUtilities.cloneObject = cloneObject;

        function copyProperties(object, template) {
            for (var property in template) {
                object[property] = template[property];
            }
        }
        ObjectUtilities.copyProperties = copyProperties;

        function copyOwnProperties(object, template) {
            for (var property in template) {
                if (hasOwnProperty(template, property)) {
                    object[property] = template[property];
                }
            }
        }
        ObjectUtilities.copyOwnProperties = copyOwnProperties;

        function copyOwnPropertyDescriptors(object, template) {
            for (var property in template) {
                if (hasOwnProperty(template, property)) {
                    var descriptor = Object.getOwnPropertyDescriptor(template, property);
                    release || Debug.assert(descriptor);
                    try  {
                        Object.defineProperty(object, property, descriptor);
                    } catch (e) {
                        // log("Can't define " + property);
                    }
                }
            }
        }
        ObjectUtilities.copyOwnPropertyDescriptors = copyOwnPropertyDescriptors;

        function getLatestGetterOrSetterPropertyDescriptor(object, name) {
            var descriptor = {};
            while (object) {
                var tmp = Object.getOwnPropertyDescriptor(object, name);
                if (tmp) {
                    descriptor.get = descriptor.get || tmp.get;
                    descriptor.set = descriptor.set || tmp.set;
                }
                if (descriptor.get && descriptor.set) {
                    break;
                }
                object = Object.getPrototypeOf(object);
            }
            return descriptor;
        }
        ObjectUtilities.getLatestGetterOrSetterPropertyDescriptor = getLatestGetterOrSetterPropertyDescriptor;

        function defineNonEnumerableGetterOrSetter(obj, name, value, isGetter) {
            var descriptor = ObjectUtilities.getLatestGetterOrSetterPropertyDescriptor(obj, name);
            descriptor.configurable = true;
            descriptor.enumerable = false;
            if (isGetter) {
                descriptor.get = value;
            } else {
                descriptor.set = value;
            }
            Object.defineProperty(obj, name, descriptor);
        }
        ObjectUtilities.defineNonEnumerableGetterOrSetter = defineNonEnumerableGetterOrSetter;

        function defineNonEnumerableGetter(obj, name, getter) {
            Object.defineProperty(obj, name, {
                get: getter,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineNonEnumerableGetter = defineNonEnumerableGetter;

        function defineNonEnumerableSetter(obj, name, setter) {
            Object.defineProperty(obj, name, {
                set: setter,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineNonEnumerableSetter = defineNonEnumerableSetter;

        function defineNonEnumerableProperty(obj, name, value) {
            Object.defineProperty(obj, name, {
                value: value,
                writable: true,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineNonEnumerableProperty = defineNonEnumerableProperty;

        function defineNonEnumerableForwardingProperty(obj, name, otherName) {
            Object.defineProperty(obj, name, {
                get: FunctionUtilities.makeForwardingGetter(otherName),
                set: FunctionUtilities.makeForwardingSetter(otherName),
                writable: true,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineNonEnumerableForwardingProperty = defineNonEnumerableForwardingProperty;

        function defineNewNonEnumerableProperty(obj, name, value) {
            release || Debug.assert(!Object.prototype.hasOwnProperty.call(obj, name), "Property: " + name + " already exits.");
            ObjectUtilities.defineNonEnumerableProperty(obj, name, value);
        }
        ObjectUtilities.defineNewNonEnumerableProperty = defineNewNonEnumerableProperty;
    })(Shumway.ObjectUtilities || (Shumway.ObjectUtilities = {}));
    var ObjectUtilities = Shumway.ObjectUtilities;

    (function (FunctionUtilities) {
        function makeForwardingGetter(target) {
            return new Function("return this[\"" + target + "\"]");
        }
        FunctionUtilities.makeForwardingGetter = makeForwardingGetter;

        function makeForwardingSetter(target) {
            return new Function("value", "this[\"" + target + "\"] = value;");
        }
        FunctionUtilities.makeForwardingSetter = makeForwardingSetter;

        /**
        * Attaches a property to the bound function so we can detect when if it
        * ever gets rebound.
        */
        function bindSafely(fn, object) {
            release || Debug.assert(!fn.boundTo && object);
            var f = fn.bind(object);
            f.boundTo = object;
            return f;
        }
        FunctionUtilities.bindSafely = bindSafely;
    })(Shumway.FunctionUtilities || (Shumway.FunctionUtilities = {}));
    var FunctionUtilities = Shumway.FunctionUtilities;

    (function (StringUtilities) {
        var assert = Shumway.Debug.assert;

        function memorySizeToString(value) {
            value |= 0;
            var K = 1024;
            var M = K * K;
            if (value < K) {
                return value + " B";
            } else if (value < M) {
                return (value / K).toFixed(2) + "KB";
            } else {
                return (value / M).toFixed(2) + "MB";
            }
        }
        StringUtilities.memorySizeToString = memorySizeToString;

        function toSafeString(value) {
            if (typeof value === "string") {
                return "\"" + value + "\"";
            }
            if (typeof value === "number" || typeof value === "boolean") {
                return String(value);
            }
            return typeof value;
        }
        StringUtilities.toSafeString = toSafeString;

        function toSafeArrayString(array) {
            var str = [];
            for (var i = 0; i < array.length; i++) {
                str.push(toSafeString(array[i]));
            }
            return str.join(", ");
        }
        StringUtilities.toSafeArrayString = toSafeArrayString;

        function utf8decode(str) {
            var bytes = new Uint8Array(str.length * 4);
            var b = 0;
            for (var i = 0, j = str.length; i < j; i++) {
                var code = str.charCodeAt(i);
                if (code <= 0x7f) {
                    bytes[b++] = code;
                    continue;
                }

                if (0xD800 <= code && code <= 0xDBFF) {
                    var codeLow = str.charCodeAt(i + 1);
                    if (0xDC00 <= codeLow && codeLow <= 0xDFFF) {
                        // convert only when both high and low surrogates are present
                        code = ((code & 0x3FF) << 10) + (codeLow & 0x3FF) + 0x10000;
                        ++i;
                    }
                }

                if ((code & 0xFFE00000) !== 0) {
                    bytes[b++] = 0xF8 | ((code >>> 24) & 0x03);
                    bytes[b++] = 0x80 | ((code >>> 18) & 0x3F);
                    bytes[b++] = 0x80 | ((code >>> 12) & 0x3F);
                    bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
                    bytes[b++] = 0x80 | (code & 0x3F);
                } else if ((code & 0xFFFF0000) !== 0) {
                    bytes[b++] = 0xF0 | ((code >>> 18) & 0x07);
                    bytes[b++] = 0x80 | ((code >>> 12) & 0x3F);
                    bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
                    bytes[b++] = 0x80 | (code & 0x3F);
                } else if ((code & 0xFFFFF800) !== 0) {
                    bytes[b++] = 0xE0 | ((code >>> 12) & 0x0F);
                    bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
                    bytes[b++] = 0x80 | (code & 0x3F);
                } else {
                    bytes[b++] = 0xC0 | ((code >>> 6) & 0x1F);
                    bytes[b++] = 0x80 | (code & 0x3F);
                }
            }
            return bytes.subarray(0, b);
        }
        StringUtilities.utf8decode = utf8decode;

        function utf8encode(bytes) {
            var j = 0, str = "";
            while (j < bytes.length) {
                var b1 = bytes[j++] & 0xFF;
                if (b1 <= 0x7F) {
                    str += String.fromCharCode(b1);
                } else {
                    var currentPrefix = 0xC0;
                    var validBits = 5;
                    do {
                        var mask = (currentPrefix >> 1) | 0x80;
                        if ((b1 & mask) === currentPrefix)
                            break;
                        currentPrefix = (currentPrefix >> 1) | 0x80;
                        --validBits;
                    } while(validBits >= 0);

                    if (validBits <= 0) {
                        // Invalid UTF8 character -- copying as is
                        str += String.fromCharCode(b1);
                        continue;
                    }
                    var code = (b1 & ((1 << validBits) - 1));
                    var invalid = false;
                    for (var i = 5; i >= validBits; --i) {
                        var bi = bytes[j++];
                        if ((bi & 0xC0) != 0x80) {
                            // Invalid UTF8 character sequence
                            invalid = true;
                            break;
                        }
                        code = (code << 6) | (bi & 0x3F);
                    }
                    if (invalid) {
                        for (var k = j - (7 - i); k < j; ++k) {
                            str += String.fromCharCode(bytes[k] & 255);
                        }
                        continue;
                    }
                    if (code >= 0x10000) {
                        str += String.fromCharCode((((code - 0x10000) >> 10) & 0x3FF) | 0xD800, (code & 0x3FF) | 0xDC00);
                    } else {
                        str += String.fromCharCode(code);
                    }
                }
            }
            return str;
        }
        StringUtilities.utf8encode = utf8encode;

        // https://gist.github.com/958841
        function base64ArrayBuffer(arrayBuffer) {
            var base64 = '';
            var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

            var bytes = new Uint8Array(arrayBuffer);
            var byteLength = bytes.byteLength;
            var byteRemainder = byteLength % 3;
            var mainLength = byteLength - byteRemainder;

            var a, b, c, d;
            var chunk;

            for (var i = 0; i < mainLength; i = i + 3) {
                // Combine the three bytes into a single integer
                chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

                // Use bitmasks to extract 6-bit segments from the triplet
                a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
                b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
                c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
                d = chunk & 63; // 63 = 2^6 - 1

                // Convert the raw binary segments to the appropriate ASCII encoding
                base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
            }

            // Deal with the remaining bytes and padding
            if (byteRemainder == 1) {
                chunk = bytes[mainLength];

                a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

                // Set the 4 least significant bits to zero
                b = (chunk & 3) << 4; // 3 = 2^2 - 1

                base64 += encodings[a] + encodings[b] + '==';
            } else if (byteRemainder == 2) {
                chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

                a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
                b = (chunk & 1008) >> 4; // 1008 = (2^6 - 1) << 4

                // Set the 2 least significant bits to zero
                c = (chunk & 15) << 2; // 15 = 2^4 - 1

                base64 += encodings[a] + encodings[b] + encodings[c] + '=';
            }
            return base64;
        }
        StringUtilities.base64ArrayBuffer = base64ArrayBuffer;

        function escapeString(str) {
            if (str !== undefined) {
                str = str.replace(/[^\w$]/gi, "$"); /* No dots, colons, dashes and /s */
                if (/^\d/.test(str)) {
                    str = '$' + str;
                }
            }
            return str;
        }
        StringUtilities.escapeString = escapeString;

        /**
        * Workaround for max stack size limit.
        */
        function fromCharCodeArray(buffer) {
            var str = "", SLICE = 1024 * 16;
            for (var i = 0; i < buffer.length; i += SLICE) {
                var chunk = Math.min(buffer.length - i, SLICE);
                str += String.fromCharCode.apply(null, buffer.subarray(i, i + chunk));
            }
            return str;
        }
        StringUtilities.fromCharCodeArray = fromCharCodeArray;

        var _encoding = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_';
        function variableLengthEncodeInt32(n) {
            var e = _encoding;
            var bitCount = (32 - Math.clz32(n));
            release || assert(bitCount <= 32, bitCount);
            var l = Math.ceil(bitCount / 6);

            // Encode length followed by six bit chunks.
            var s = e[l];
            for (var i = l - 1; i >= 0; i--) {
                var offset = (i * 6);
                s += e[(n >> offset) & 0x3F];
            }
            release || assert(StringUtilities.variableLengthDecodeInt32(s) === n, n + " : " + s + " - " + l + " bits: " + bitCount);
            return s;
        }
        StringUtilities.variableLengthEncodeInt32 = variableLengthEncodeInt32;

        function toEncoding(n) {
            return _encoding[n];
        }
        StringUtilities.toEncoding = toEncoding;

        function fromEncoding(s) {
            var c = s.charCodeAt(0);
            var e = 0;
            if (c >= 65 && c <= 90) {
                return c - 65;
            } else if (c >= 97 && c <= 122) {
                return c - 71;
            } else if (c >= 48 && c <= 57) {
                return c + 4;
            } else if (c === 36) {
                return 62;
            } else if (c === 95) {
                return 63;
            }
            release || assert(false, "Invalid Encoding");
        }
        StringUtilities.fromEncoding = fromEncoding;

        function variableLengthDecodeInt32(s) {
            var l = StringUtilities.fromEncoding(s[0]);
            var n = 0;
            for (var i = 0; i < l; i++) {
                var offset = ((l - i - 1) * 6);
                n |= StringUtilities.fromEncoding(s[1 + i]) << offset;
            }
            return n;
        }
        StringUtilities.variableLengthDecodeInt32 = variableLengthDecodeInt32;

        function trimMiddle(s, maxLength) {
            if (s.length <= maxLength) {
                return s;
            }
            var leftHalf = maxLength >> 1;
            var rightHalf = maxLength - leftHalf - 1;
            return s.substr(0, leftHalf) + "\u2026" + s.substr(s.length - rightHalf, rightHalf);
        }
        StringUtilities.trimMiddle = trimMiddle;

        function multiple(s, count) {
            var o = "";
            for (var i = 0; i < count; i++) {
                o += s;
            }
            return o;
        }
        StringUtilities.multiple = multiple;

        function indexOfAny(s, chars, position) {
            var index = s.length;
            for (var i = 0; i < chars.length; i++) {
                var j = s.indexOf(chars[i], position);
                if (j >= 0) {
                    index = Math.min(index, j);
                }
            }
            return index === s.length ? -1 : index;
        }
        StringUtilities.indexOfAny = indexOfAny;
    })(Shumway.StringUtilities || (Shumway.StringUtilities = {}));
    var StringUtilities = Shumway.StringUtilities;

    (function (HashUtilities) {
        var _md5R = new Uint8Array([
            7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
            5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
            4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
            6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21]);

        var _md5K = new Int32Array([
            -680876936, -389564586, 606105819, -1044525330, -176418897, 1200080426,
            -1473231341, -45705983, 1770035416, -1958414417, -42063, -1990404162,
            1804603682, -40341101, -1502002290, 1236535329, -165796510, -1069501632,
            643717713, -373897302, -701558691, 38016083, -660478335, -405537848,
            568446438, -1019803690, -187363961, 1163531501, -1444681467, -51403784,
            1735328473, -1926607734, -378558, -2022574463, 1839030562, -35309556,
            -1530992060, 1272893353, -155497632, -1094730640, 681279174, -358537222,
            -722521979, 76029189, -640364487, -421815835, 530742520, -995338651,
            -198630844, 1126891415, -1416354905, -57434055, 1700485571, -1894986606,
            -1051523, -2054922799, 1873313359, -30611744, -1560198380, 1309151649,
            -145523070, -1120210379, 718787259, -343485551]);

        function hashBytesTo32BitsMD5(data, offset, length) {
            var r = _md5R;
            var k = _md5K;
            var h0 = 1732584193, h1 = -271733879, h2 = -1732584194, h3 = 271733878;

            // pre-processing
            var paddedLength = (length + 72) & ~63;
            var padded = new Uint8Array(paddedLength);
            var i, j, n;
            for (i = 0; i < length; ++i) {
                padded[i] = data[offset++];
            }
            padded[i++] = 0x80;
            n = paddedLength - 8;
            while (i < n) {
                padded[i++] = 0;
            }
            padded[i++] = (length << 3) & 0xFF;
            padded[i++] = (length >> 5) & 0xFF;
            padded[i++] = (length >> 13) & 0xFF;
            padded[i++] = (length >> 21) & 0xFF;
            padded[i++] = (length >>> 29) & 0xFF;
            padded[i++] = 0;
            padded[i++] = 0;
            padded[i++] = 0;

            // chunking
            // TODO ArrayBuffer ?
            var w = new Int32Array(16);
            for (i = 0; i < paddedLength;) {
                for (j = 0; j < 16; ++j, i += 4) {
                    w[j] = (padded[i] | (padded[i + 1] << 8) | (padded[i + 2] << 16) | (padded[i + 3] << 24));
                }
                var a = h0, b = h1, c = h2, d = h3, f, g;
                for (j = 0; j < 64; ++j) {
                    if (j < 16) {
                        f = (b & c) | ((~b) & d);
                        g = j;
                    } else if (j < 32) {
                        f = (d & b) | ((~d) & c);
                        g = (5 * j + 1) & 15;
                    } else if (j < 48) {
                        f = b ^ c ^ d;
                        g = (3 * j + 5) & 15;
                    } else {
                        f = c ^ (b | (~d));
                        g = (7 * j) & 15;
                    }
                    var tmp = d, rotateArg = (a + f + k[j] + w[g]) | 0, rotate = r[j];
                    d = c;
                    c = b;
                    b = (b + ((rotateArg << rotate) | (rotateArg >>> (32 - rotate)))) | 0;
                    a = tmp;
                }
                h0 = (h0 + a) | 0;
                h1 = (h1 + b) | 0;
                h2 = (h2 + c) | 0;
                h3 = (h3 + d) | 0;
            }
            return h0;
        }
        HashUtilities.hashBytesTo32BitsMD5 = hashBytesTo32BitsMD5;

        function hashBytesTo32BitsAdler(data, offset, length) {
            var a = 1;
            var b = 0;
            var end = offset + length;
            for (var i = offset; i < end; ++i) {
                a = (a + (data[i] & 0xff)) % 65521;
                b = (b + a) % 65521;
            }
            return (b << 16) | a;
        }
        HashUtilities.hashBytesTo32BitsAdler = hashBytesTo32BitsAdler;
    })(Shumway.HashUtilities || (Shumway.HashUtilities = {}));
    var HashUtilities = Shumway.HashUtilities;

    /**
    * Marsaglia's algorithm, adapted from V8. Use this if you want a deterministic random number.
    */
    var Random = (function () {
        function Random() {
        }
        Random.seed = function (seed) {
            Random._state[0] = seed;
            Random._state[1] = seed;
        };

        Random.next = function () {
            var s = this._state;
            var r0 = (Math.imul(18273, s[0] & 0xFFFF) + (s[0] >>> 16)) | 0;
            s[0] = r0;
            var r1 = (Math.imul(36969, s[1] & 0xFFFF) + (s[1] >>> 16)) | 0;
            s[1] = r1;
            var x = ((r0 << 16) + (r1 & 0xFFFF)) | 0;

            // Division by 0x100000000 through multiplication by reciprocal.
            return (x < 0 ? (x + 0x100000000) : x) * 2.3283064365386962890625e-10;
        };
        Random._state = new Uint32Array([0xDEAD, 0xBEEF]);
        return Random;
    })();
    Shumway.Random = Random;

    Math.random = function random() {
        return Random.next();
    };

    function polyfillWeakMap() {
        if (typeof jsGlobal.WeakMap === 'function') {
            return;
        }
        var id = 0;
        function WeakMap() {
            this.id = '$weakmap' + (id++);
        }
        ;
        WeakMap.prototype = {
            has: function (obj) {
                return obj.hasOwnProperty(this.id);
            },
            get: function (obj, defaultValue) {
                return obj.hasOwnProperty(this.id) ? obj[this.id] : defaultValue;
            },
            set: function (obj, value) {
                Object.defineProperty(obj, this.id, {
                    value: value,
                    enumerable: false,
                    configurable: true
                });
            }
        };
        jsGlobal.WeakMap = WeakMap;
    }

    polyfillWeakMap();

    var useReferenceCounting = false;

    var WeakList = (function () {
        function WeakList() {
            if (typeof netscape !== "undefined" && netscape.security.PrivilegeManager) {
                this._map = new WeakMap();
            } else {
                this._list = [];
            }
        }
        WeakList.prototype.clear = function () {
            if (this._map) {
                this._map.clear();
            } else {
                this._list.length = 0;
            }
        };
        WeakList.prototype.push = function (value) {
            if (this._map) {
                this._map.set(value, null);
            } else {
                this._list.push(value);
            }
        };
        WeakList.prototype.forEach = function (callback) {
            if (this._map) {
                if (typeof netscape !== "undefined") {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                }
                Components.utils.nondeterministicGetWeakMapKeys(this._map).forEach(function (value) {
                    if (value._referenceCount !== 0) {
                        callback(value);
                    }
                });
                return;
            }
            var list = this._list;
            var zeroCount = 0;
            for (var i = 0; i < list.length; i++) {
                var value = list[i];
                if (useReferenceCounting && value._referenceCount === 0) {
                    zeroCount++;
                } else {
                    callback(value);
                }
            }
            if (zeroCount > 16 && zeroCount > (list.length >> 2)) {
                var newList = [];
                for (var i = 0; i < list.length; i++) {
                    if (list[i]._referenceCount > 0) {
                        newList.push(list[i]);
                    }
                }
                this._list = newList;
            }
        };
        Object.defineProperty(WeakList.prototype, "length", {
            get: function () {
                if (this._map) {
                    // TODO: Implement this.
                    return -1;
                } else {
                    return this._list.length;
                }
            },
            enumerable: true,
            configurable: true
        });
        return WeakList;
    })();
    Shumway.WeakList = WeakList;

    (function (NumberUtilities) {
        function pow2(exponent) {
            if (exponent === (exponent | 0)) {
                if (exponent < 0) {
                    return 1 / (1 << -exponent);
                }
                return 1 << exponent;
            }
            return Math.pow(2, exponent);
        }
        NumberUtilities.pow2 = pow2;

        function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }
        NumberUtilities.clamp = clamp;

        /**
        * Rounds *.5 to the nearest even number.
        * See https://en.wikipedia.org/wiki/Rounding#Round_half_to_even for details.
        */
        function roundHalfEven(value) {
            if (Math.abs(value % 1) === 0.5) {
                var floor = Math.floor(value);
                return floor % 2 === 0 ? floor : Math.ceil(value);
            }
            return Math.round(value);
        }
        NumberUtilities.roundHalfEven = roundHalfEven;

        function epsilonEquals(value, other) {
            return Math.abs(value - other) < 0.0000001;
        }
        NumberUtilities.epsilonEquals = epsilonEquals;
    })(Shumway.NumberUtilities || (Shumway.NumberUtilities = {}));
    var NumberUtilities = Shumway.NumberUtilities;

    (function (Numbers) {
        Numbers[Numbers["MaxU16"] = 0xFFFF] = "MaxU16";
        Numbers[Numbers["MaxI16"] = 0x7FFF] = "MaxI16";
        Numbers[Numbers["MinI16"] = -0x8000] = "MinI16";
    })(Shumway.Numbers || (Shumway.Numbers = {}));
    var Numbers = Shumway.Numbers;

    (function (IntegerUtilities) {
        var sharedBuffer = new ArrayBuffer(8);
        var i8 = new Int8Array(sharedBuffer);
        var i32 = new Int32Array(sharedBuffer);
        var f32 = new Float32Array(sharedBuffer);
        var f64 = new Float64Array(sharedBuffer);
        var nativeLittleEndian = new Int8Array(new Int32Array([1]).buffer)[0] === 1;

        /**
        * Convert a float into 32 bits.
        */
        function floatToInt32(v) {
            f32[0] = v;
            return i32[0];
        }
        IntegerUtilities.floatToInt32 = floatToInt32;

        /**
        * Convert 32 bits into a float.
        */
        function int32ToFloat(i) {
            i32[0] = i;
            return f32[0];
        }
        IntegerUtilities.int32ToFloat = int32ToFloat;

        /**
        * Swap the bytes of a 16 bit number.
        */
        function swap16(i) {
            return ((i & 0xFF) << 8) | ((i >> 8) & 0xFF);
        }
        IntegerUtilities.swap16 = swap16;

        /**
        * Swap the bytes of a 32 bit number.
        */
        function swap32(i) {
            return ((i & 0xFF) << 24) | ((i & 0xFF00) << 8) | ((i >> 8) & 0xFF00) | ((i >> 24) & 0xFF);
        }
        IntegerUtilities.swap32 = swap32;

        /**
        * Converts a number to s8.u8 fixed point representation.
        */
        function toS8U8(v) {
            return ((v * 256) << 16) >> 16;
        }
        IntegerUtilities.toS8U8 = toS8U8;

        /**
        * Converts a number from s8.u8 fixed point representation.
        */
        function fromS8U8(i) {
            return i / 256;
        }
        IntegerUtilities.fromS8U8 = fromS8U8;

        /**
        * Round trips a number through s8.u8 conversion.
        */
        function clampS8U8(v) {
            return fromS8U8(toS8U8(v));
        }
        IntegerUtilities.clampS8U8 = clampS8U8;

        /**
        * Converts a number to signed 16 bits.
        */
        function toS16(v) {
            return (v << 16) >> 16;
        }
        IntegerUtilities.toS16 = toS16;

        function bitCount(i) {
            i = i - ((i >> 1) & 0x55555555);
            i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
            return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
        }
        IntegerUtilities.bitCount = bitCount;

        function ones(i) {
            i = i - ((i >> 1) & 0x55555555);
            i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
            return ((i + (i >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
        }
        IntegerUtilities.ones = ones;

        function trailingZeros(i) {
            return IntegerUtilities.ones((i & -i) - 1);
        }
        IntegerUtilities.trailingZeros = trailingZeros;

        function getFlags(i, flags) {
            var str = "";
            for (var i = 0; i < flags.length; i++) {
                if (i & (1 << i)) {
                    str += flags[i] + " ";
                }
            }
            if (str.length === 0) {
                return "";
            }
            return str.trim();
        }
        IntegerUtilities.getFlags = getFlags;

        function isPowerOfTwo(x) {
            return x && ((x & (x - 1)) === 0);
        }
        IntegerUtilities.isPowerOfTwo = isPowerOfTwo;

        function roundToMultipleOfFour(x) {
            return (x + 3) & ~0x3;
        }
        IntegerUtilities.roundToMultipleOfFour = roundToMultipleOfFour;

        function nearestPowerOfTwo(x) {
            x--;
            x |= x >> 1;
            x |= x >> 2;
            x |= x >> 4;
            x |= x >> 8;
            x |= x >> 16;
            x++;
            return x;
        }
        IntegerUtilities.nearestPowerOfTwo = nearestPowerOfTwo;

        function roundToMultipleOfPowerOfTwo(i, powerOfTwo) {
            var x = (1 << powerOfTwo) - 1;
            return (i + x) & ~x;
        }
        IntegerUtilities.roundToMultipleOfPowerOfTwo = roundToMultipleOfPowerOfTwo;

        /**
        * Polyfill imul.
        */
        if (!Math.imul) {
            Math.imul = function imul(a, b) {
                var ah = (a >>> 16) & 0xffff;
                var al = a & 0xffff;
                var bh = (b >>> 16) & 0xffff;
                var bl = b & 0xffff;

                // the shift by 0 fixes the sign on the high part
                // the final |0 converts the unsigned value into a signed value
                return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
            };
        }

        /**
        * Polyfill clz32.
        */
        if (!Math.clz32) {
            Math.clz32 = function clz32(i) {
                i |= (i >> 1);
                i |= (i >> 2);
                i |= (i >> 4);
                i |= (i >> 8);
                i |= (i >> 16);
                return 32 - IntegerUtilities.ones(i);
            };
        }
    })(Shumway.IntegerUtilities || (Shumway.IntegerUtilities = {}));
    var IntegerUtilities = Shumway.IntegerUtilities;

    (function (GeometricUtilities) {
        /**
        * Crossing numeber tests to check if a point is inside a polygon. The polygon is given as
        * an array of n + 1 float pairs where the last is equal to the first.
        *
        * http://geomalgorithms.com/a03-_inclusion.html
        */
        function pointInPolygon(x, y, polygon) {
            // release || assert (((polygon.length & 1) === 0) && polygon.length >= 8);
            // release || assert (polygon[0] === polygon[polygon.length - 2] &&
            //        polygon[1] === polygon[polygon.length - 1], "First and last points should be equal.");
            var crosses = 0;
            var n = polygon.length - 2;
            var p = polygon;

            for (var i = 0; i < n; i += 2) {
                var x0 = p[i + 0];
                var y0 = p[i + 1];
                var x1 = p[i + 2];
                var y1 = p[i + 3];
                if (((y0 <= y) && (y1 > y)) || ((y0 > y) && (y1 <= y))) {
                    var t = (y - y0) / (y1 - y0);
                    if (x < x0 + t * (x1 - x0)) {
                        crosses++;
                    }
                }
            }
            return (crosses & 1) === 1;
        }
        GeometricUtilities.pointInPolygon = pointInPolygon;

        /**
        * Signed area of a triangle. If zero then points are collinear, if < 0 then points
        * are clockwise otherwise counter-clockwise.
        */
        function signedArea(x0, y0, x1, y1, x2, y2) {
            return (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
        }
        GeometricUtilities.signedArea = signedArea;

        function counterClockwise(x0, y0, x1, y1, x2, y2) {
            return signedArea(x0, y0, x1, y1, x2, y2) > 0;
        }
        GeometricUtilities.counterClockwise = counterClockwise;

        function clockwise(x0, y0, x1, y1, x2, y2) {
            return signedArea(x0, y0, x1, y1, x2, y2) < 0;
        }
        GeometricUtilities.clockwise = clockwise;

        function pointInPolygonInt32(x, y, polygon) {
            // release || assert (((polygon.length & 1) === 0) && polygon.length >= 8);
            // release || assert (polygon[0] === polygon[polygon.length - 2] &&
            //        polygon[1] === polygon[polygon.length - 1], "First and last points should be equal.");
            x = x | 0;
            y = y | 0;
            var crosses = 0;
            var n = polygon.length - 2;
            var p = polygon;

            for (var i = 0; i < n; i += 2) {
                var x0 = p[i + 0];
                var y0 = p[i + 1];
                var x1 = p[i + 2];
                var y1 = p[i + 3];
                if (((y0 <= y) && (y1 > y)) || ((y0 > y) && (y1 <= y))) {
                    var t = (y - y0) / (y1 - y0);
                    if (x < x0 + t * (x1 - x0)) {
                        crosses++;
                    }
                }
            }
            return (crosses & 1) === 1;
        }
        GeometricUtilities.pointInPolygonInt32 = pointInPolygonInt32;
    })(Shumway.GeometricUtilities || (Shumway.GeometricUtilities = {}));
    var GeometricUtilities = Shumway.GeometricUtilities;

    var IndentingWriter = (function () {
        function IndentingWriter(suppressOutput, out) {
            if (typeof suppressOutput === "undefined") { suppressOutput = false; }
            this._tab = "  ";
            this._padding = "";
            this._suppressOutput = suppressOutput;
            this._out = out || IndentingWriter._consoleOut;
            this._outNoNewline = out || IndentingWriter._consoleOutNoNewline;
        }
        IndentingWriter.prototype.write = function (str, writePadding) {
            if (typeof str === "undefined") { str = ""; }
            if (typeof writePadding === "undefined") { writePadding = false; }
            if (!this._suppressOutput) {
                this._outNoNewline((writePadding ? this._padding : "") + str);
            }
        };

        IndentingWriter.prototype.writeLn = function (str) {
            if (typeof str === "undefined") { str = ""; }
            if (!this._suppressOutput) {
                this._out(this._padding + str);
            }
        };

        IndentingWriter.prototype.writeComment = function (str) {
            var lines = str.split("\n");
            if (lines.length === 1) {
                this.writeLn("// " + lines[0]);
            } else {
                this.writeLn("/**");
                for (var i = 0; i < lines.length; i++) {
                    this.writeLn(" * " + lines[i]);
                }
                this.writeLn(" */");
            }
        };

        IndentingWriter.prototype.writeLns = function (str) {
            var lines = str.split("\n");
            for (var i = 0; i < lines.length; i++) {
                this.writeLn(lines[i]);
            }
        };

        IndentingWriter.prototype.debugLn = function (str) {
            this.colorLn(IndentingWriter.PURPLE, str);
        };

        IndentingWriter.prototype.yellowLn = function (str) {
            this.colorLn(IndentingWriter.YELLOW, str);
        };

        IndentingWriter.prototype.greenLn = function (str) {
            this.colorLn(IndentingWriter.GREEN, str);
        };

        IndentingWriter.prototype.redLn = function (str) {
            this.colorLn(IndentingWriter.RED, str);
        };

        IndentingWriter.prototype.warnLn = function (str) {
            this.yellowLn(str);
        };

        IndentingWriter.prototype.colorLn = function (color, str) {
            if (!this._suppressOutput) {
                if (!inBrowser) {
                    this._out(this._padding + color + str + IndentingWriter.ENDC);
                } else {
                    this._out(this._padding + str);
                }
            }
        };

        IndentingWriter.prototype.redLns = function (str) {
            this.colorLns(IndentingWriter.RED, str);
        };

        IndentingWriter.prototype.colorLns = function (color, str) {
            var lines = str.split("\n");
            for (var i = 0; i < lines.length; i++) {
                this.colorLn(color, lines[i]);
            }
        };

        IndentingWriter.prototype.enter = function (str) {
            if (!this._suppressOutput) {
                this._out(this._padding + str);
            }
            this.indent();
        };

        IndentingWriter.prototype.leaveAndEnter = function (str) {
            this.leave(str);
            this.indent();
        };

        IndentingWriter.prototype.leave = function (str) {
            this.outdent();
            if (!this._suppressOutput) {
                this._out(this._padding + str);
            }
        };

        IndentingWriter.prototype.indent = function () {
            this._padding += this._tab;
        };

        IndentingWriter.prototype.outdent = function () {
            if (this._padding.length > 0) {
                this._padding = this._padding.substring(0, this._padding.length - this._tab.length);
            }
        };

        IndentingWriter.prototype.writeArray = function (arr, detailed, noNumbers) {
            if (typeof detailed === "undefined") { detailed = false; }
            if (typeof noNumbers === "undefined") { noNumbers = false; }
            detailed = detailed || false;
            for (var i = 0, j = arr.length; i < j; i++) {
                var prefix = "";
                if (detailed) {
                    if (arr[i] === null) {
                        prefix = "null";
                    } else if (arr[i] === undefined) {
                        prefix = "undefined";
                    } else {
                        prefix = arr[i].constructor.name;
                    }
                    prefix += " ";
                }
                var number = noNumbers ? "" : ("" + i).padRight(' ', 4);
                this.writeLn(number + prefix + arr[i]);
            }
        };
        IndentingWriter.PURPLE = '\033[94m';
        IndentingWriter.YELLOW = '\033[93m';
        IndentingWriter.GREEN = '\033[92m';
        IndentingWriter.RED = '\033[91m';
        IndentingWriter.ENDC = '\033[0m';
        IndentingWriter._consoleOut = inBrowser ? console.info.bind(console) : print;
        IndentingWriter._consoleOutNoNewline = inBrowser ? console.info.bind(console) : putstr;
        return IndentingWriter;
    })();
    Shumway.IndentingWriter = IndentingWriter;

    /**
    * Insertion sort SortedList backed by a linked list.
    */
    var SortedListNode = (function () {
        function SortedListNode(value, next) {
            this.value = value;
            this.next = next;
        }
        return SortedListNode;
    })();

    var SortedList = (function () {
        function SortedList(compare) {
            release || Debug.assert(compare);
            this._compare = compare;
            this._head = null;
            this._length = 0;
        }
        SortedList.prototype.push = function (value) {
            release || Debug.assert(value !== undefined);
            this._length++;
            if (!this._head) {
                this._head = new SortedListNode(value, null);
                return;
            }

            var curr = this._head;
            var prev = null;
            var node = new SortedListNode(value, null);
            var compare = this._compare;
            while (curr) {
                if (compare(curr.value, node.value) > 0) {
                    if (prev) {
                        node.next = curr;
                        prev.next = node;
                    } else {
                        node.next = this._head;
                        this._head = node;
                    }
                    return;
                }
                prev = curr;
                curr = curr.next;
            }
            prev.next = node;
        };

        /**
        * Visitors can return RETURN if they wish to stop the iteration or DELETE if they need to delete the current node.
        * NOTE: DELETE most likley doesn't work if there are multiple active iterations going on.
        */
        SortedList.prototype.forEach = function (visitor) {
            var curr = this._head;
            var last = null;
            while (curr) {
                var result = visitor(curr.value);
                if (result === SortedList.RETURN) {
                    return;
                } else if (result === SortedList.DELETE) {
                    if (!last) {
                        curr = this._head = this._head.next;
                    } else {
                        curr = last.next = curr.next;
                    }
                } else {
                    last = curr;
                    curr = curr.next;
                }
            }
        };

        SortedList.prototype.isEmpty = function () {
            return !this._head;
        };

        SortedList.prototype.pop = function () {
            if (!this._head) {
                return undefined;
            }
            this._length--;
            var ret = this._head;
            this._head = this._head.next;
            return ret.value;
        };

        SortedList.prototype.contains = function (value) {
            var curr = this._head;
            while (curr) {
                if (curr.value === value) {
                    return true;
                }
                curr = curr.next;
            }
            return false;
        };

        SortedList.prototype.toString = function () {
            var str = "[";
            var curr = this._head;
            while (curr) {
                str += curr.value.toString();
                curr = curr.next;
                if (curr) {
                    str += ",";
                }
            }
            str += "]";
            return str;
        };
        SortedList.RETURN = 1;
        SortedList.DELETE = 2;
        return SortedList;
    })();
    Shumway.SortedList = SortedList;

    var CircularBuffer = (function () {
        function CircularBuffer(Type, sizeInBits) {
            if (typeof sizeInBits === "undefined") { sizeInBits = 12; }
            this.index = 0;
            this.start = 0;
            this._size = 1 << sizeInBits;
            this._mask = this._size - 1;
            this.array = new Type(this._size);
        }
        CircularBuffer.prototype.get = function (i) {
            return this.array[i];
        };

        CircularBuffer.prototype.forEachInReverse = function (visitor) {
            if (this.isEmpty()) {
                return;
            }
            var i = this.index === 0 ? this._size - 1 : this.index - 1;
            var end = (this.start - 1) & this._mask;
            while (i !== end) {
                if (visitor(this.array[i], i)) {
                    break;
                }
                i = i === 0 ? this._size - 1 : i - 1;
            }
        };

        CircularBuffer.prototype.write = function (value) {
            this.array[this.index] = value;
            this.index = (this.index + 1) & this._mask;
            if (this.index === this.start) {
                this.start = (this.start + 1) & this._mask;
            }
        };

        CircularBuffer.prototype.isFull = function () {
            return ((this.index + 1) & this._mask) === this.start;
        };

        CircularBuffer.prototype.isEmpty = function () {
            return this.index === this.start;
        };

        CircularBuffer.prototype.reset = function () {
            this.index = 0;
            this.start = 0;
        };
        return CircularBuffer;
    })();
    Shumway.CircularBuffer = CircularBuffer;

    (function (BitSets) {
        var assert = Shumway.Debug.assert;

        BitSets.ADDRESS_BITS_PER_WORD = 5;
        BitSets.BITS_PER_WORD = 1 << BitSets.ADDRESS_BITS_PER_WORD;
        BitSets.BIT_INDEX_MASK = BitSets.BITS_PER_WORD - 1;

        function getSize(length) {
            return ((length + (BitSets.BITS_PER_WORD - 1)) >> BitSets.ADDRESS_BITS_PER_WORD) << BitSets.ADDRESS_BITS_PER_WORD;
        }

        function toBitString(on, off) {
            var self = this;
            on = on || "1";
            off = off || "0";
            var str = "";
            for (var i = 0; i < length; i++) {
                str += self.get(i) ? on : off;
            }
            return str;
        }

        function toString(names) {
            var self = this;
            var set = [];
            for (var i = 0; i < length; i++) {
                if (self.get(i)) {
                    set.push(names ? names[i] : i);
                }
            }
            return set.join(", ");
        }

        var Uint32ArrayBitSet = (function () {
            function Uint32ArrayBitSet(length) {
                this.size = getSize(length);
                this.count = 0;
                this.dirty = 0;
                this.length = length;
                this.bits = new Uint32Array(this.size >> BitSets.ADDRESS_BITS_PER_WORD);
            }
            Uint32ArrayBitSet.prototype.recount = function () {
                if (!this.dirty) {
                    return;
                }

                var bits = this.bits;
                var c = 0;
                for (var i = 0, j = bits.length; i < j; i++) {
                    var v = bits[i];
                    v = v - ((v >> 1) & 0x55555555);
                    v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
                    c += ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
                }

                this.count = c;
                this.dirty = 0;
            };

            Uint32ArrayBitSet.prototype.set = function (i) {
                var n = i >> BitSets.ADDRESS_BITS_PER_WORD;
                var old = this.bits[n];
                var b = old | (1 << (i & BitSets.BIT_INDEX_MASK));
                this.bits[n] = b;
                this.dirty |= old ^ b;
            };

            Uint32ArrayBitSet.prototype.setAll = function () {
                var bits = this.bits;
                for (var i = 0, j = bits.length; i < j; i++) {
                    bits[i] = 0xFFFFFFFF;
                }
                this.count = this.size;
                this.dirty = 0;
            };

            Uint32ArrayBitSet.prototype.assign = function (set) {
                this.count = set.count;
                this.dirty = set.dirty;
                this.size = set.size;
                for (var i = 0, j = this.bits.length; i < j; i++) {
                    this.bits[i] = set.bits[i];
                }
            };

            Uint32ArrayBitSet.prototype.clear = function (i) {
                var n = i >> BitSets.ADDRESS_BITS_PER_WORD;
                var old = this.bits[n];
                var b = old & ~(1 << (i & BitSets.BIT_INDEX_MASK));
                this.bits[n] = b;
                this.dirty |= old ^ b;
            };

            Uint32ArrayBitSet.prototype.get = function (i) {
                var word = this.bits[i >> BitSets.ADDRESS_BITS_PER_WORD];
                return ((word & 1 << (i & BitSets.BIT_INDEX_MASK))) !== 0;
            };

            Uint32ArrayBitSet.prototype.clearAll = function () {
                var bits = this.bits;
                for (var i = 0, j = bits.length; i < j; i++) {
                    bits[i] = 0;
                }
                this.count = 0;
                this.dirty = 0;
            };

            Uint32ArrayBitSet.prototype._union = function (other) {
                var dirty = this.dirty;
                var bits = this.bits;
                var otherBits = other.bits;
                for (var i = 0, j = bits.length; i < j; i++) {
                    var old = bits[i];
                    var b = old | otherBits[i];
                    bits[i] = b;
                    dirty |= old ^ b;
                }
                this.dirty = dirty;
            };

            Uint32ArrayBitSet.prototype.intersect = function (other) {
                var dirty = this.dirty;
                var bits = this.bits;
                var otherBits = other.bits;
                for (var i = 0, j = bits.length; i < j; i++) {
                    var old = bits[i];
                    var b = old & otherBits[i];
                    bits[i] = b;
                    dirty |= old ^ b;
                }
                this.dirty = dirty;
            };

            Uint32ArrayBitSet.prototype.subtract = function (other) {
                var dirty = this.dirty;
                var bits = this.bits;
                var otherBits = other.bits;
                for (var i = 0, j = bits.length; i < j; i++) {
                    var old = bits[i];
                    var b = old & ~otherBits[i];
                    bits[i] = b;
                    dirty |= old ^ b;
                }
                this.dirty = dirty;
            };

            Uint32ArrayBitSet.prototype.negate = function () {
                var dirty = this.dirty;
                var bits = this.bits;
                for (var i = 0, j = bits.length; i < j; i++) {
                    var old = bits[i];
                    var b = ~old;
                    bits[i] = b;
                    dirty |= old ^ b;
                }
                this.dirty = dirty;
            };

            Uint32ArrayBitSet.prototype.forEach = function (fn) {
                release || assert(fn);
                var bits = this.bits;
                for (var i = 0, j = bits.length; i < j; i++) {
                    var word = bits[i];
                    if (word) {
                        for (var k = 0; k < BitSets.BITS_PER_WORD; k++) {
                            if (word & (1 << k)) {
                                fn(i * BitSets.BITS_PER_WORD + k);
                            }
                        }
                    }
                }
            };

            Uint32ArrayBitSet.prototype.toArray = function () {
                var set = [];
                var bits = this.bits;
                for (var i = 0, j = bits.length; i < j; i++) {
                    var word = bits[i];
                    if (word) {
                        for (var k = 0; k < BitSets.BITS_PER_WORD; k++) {
                            if (word & (1 << k)) {
                                set.push(i * BitSets.BITS_PER_WORD + k);
                            }
                        }
                    }
                }
                return set;
            };

            Uint32ArrayBitSet.prototype.equals = function (other) {
                if (this.size !== other.size) {
                    return false;
                }
                var bits = this.bits;
                var otherBits = other.bits;
                for (var i = 0, j = bits.length; i < j; i++) {
                    if (bits[i] !== otherBits[i]) {
                        return false;
                    }
                }
                return true;
            };

            Uint32ArrayBitSet.prototype.contains = function (other) {
                if (this.size !== other.size) {
                    return false;
                }
                var bits = this.bits;
                var otherBits = other.bits;
                for (var i = 0, j = bits.length; i < j; i++) {
                    if ((bits[i] | otherBits[i]) !== bits[i]) {
                        return false;
                    }
                }
                return true;
            };

            Uint32ArrayBitSet.prototype.isEmpty = function () {
                this.recount();
                return this.count === 0;
            };

            Uint32ArrayBitSet.prototype.clone = function () {
                var set = new Uint32ArrayBitSet(this.length);
                set._union(this);
                return set;
            };
            return Uint32ArrayBitSet;
        })();
        BitSets.Uint32ArrayBitSet = Uint32ArrayBitSet;

        var Uint32BitSet = (function () {
            function Uint32BitSet(length) {
                this.count = 0;
                this.dirty = 0;
                this.size = getSize(length);
                this.bits = 0;
                this.singleWord = true;
                this.length = length;
            }
            Uint32BitSet.prototype.recount = function () {
                if (!this.dirty) {
                    return;
                }

                var c = 0;
                var v = this.bits;
                v = v - ((v >> 1) & 0x55555555);
                v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
                c += ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;

                this.count = c;
                this.dirty = 0;
            };

            Uint32BitSet.prototype.set = function (i) {
                var old = this.bits;
                var b = old | (1 << (i & BitSets.BIT_INDEX_MASK));
                this.bits = b;
                this.dirty |= old ^ b;
            };

            Uint32BitSet.prototype.setAll = function () {
                this.bits = 0xFFFFFFFF;
                this.count = this.size;
                this.dirty = 0;
            };

            Uint32BitSet.prototype.assign = function (set) {
                this.count = set.count;
                this.dirty = set.dirty;
                this.size = set.size;
                this.bits = set.bits;
            };

            Uint32BitSet.prototype.clear = function (i) {
                var old = this.bits;
                var b = old & ~(1 << (i & BitSets.BIT_INDEX_MASK));
                this.bits = b;
                this.dirty |= old ^ b;
            };

            Uint32BitSet.prototype.get = function (i) {
                return ((this.bits & 1 << (i & BitSets.BIT_INDEX_MASK))) !== 0;
            };

            Uint32BitSet.prototype.clearAll = function () {
                this.bits = 0;
                this.count = 0;
                this.dirty = 0;
            };

            Uint32BitSet.prototype._union = function (other) {
                var old = this.bits;
                var b = old | other.bits;
                this.bits = b;
                this.dirty = old ^ b;
            };

            Uint32BitSet.prototype.intersect = function (other) {
                var old = this.bits;
                var b = old & other.bits;
                this.bits = b;
                this.dirty = old ^ b;
            };

            Uint32BitSet.prototype.subtract = function (other) {
                var old = this.bits;
                var b = old & ~other.bits;
                this.bits = b;
                this.dirty = old ^ b;
            };

            Uint32BitSet.prototype.negate = function () {
                var old = this.bits;
                var b = ~old;
                this.bits = b;
                this.dirty = old ^ b;
            };

            Uint32BitSet.prototype.forEach = function (fn) {
                release || assert(fn);
                var word = this.bits;
                if (word) {
                    for (var k = 0; k < BitSets.BITS_PER_WORD; k++) {
                        if (word & (1 << k)) {
                            fn(k);
                        }
                    }
                }
            };

            Uint32BitSet.prototype.toArray = function () {
                var set = [];
                var word = this.bits;
                if (word) {
                    for (var k = 0; k < BitSets.BITS_PER_WORD; k++) {
                        if (word & (1 << k)) {
                            set.push(k);
                        }
                    }
                }
                return set;
            };

            Uint32BitSet.prototype.equals = function (other) {
                return this.bits === other.bits;
            };

            Uint32BitSet.prototype.contains = function (other) {
                var bits = this.bits;
                return (bits | other.bits) === bits;
            };

            Uint32BitSet.prototype.isEmpty = function () {
                this.recount();
                return this.count === 0;
            };

            Uint32BitSet.prototype.clone = function () {
                var set = new Uint32BitSet(this.length);
                set._union(this);
                return set;
            };
            return Uint32BitSet;
        })();
        BitSets.Uint32BitSet = Uint32BitSet;

        Uint32BitSet.prototype.toString = toString;
        Uint32BitSet.prototype.toBitString = toBitString;
        Uint32ArrayBitSet.prototype.toString = toString;
        Uint32ArrayBitSet.prototype.toBitString = toBitString;

        function BitSetFunctor(length) {
            var shouldUseSingleWord = (getSize(length) >> BitSets.ADDRESS_BITS_PER_WORD) === 1;
            var type = (shouldUseSingleWord ? Uint32BitSet : Uint32ArrayBitSet);
            return function () {
                return new type(length);
            };
        }
        BitSets.BitSetFunctor = BitSetFunctor;
    })(Shumway.BitSets || (Shumway.BitSets = {}));
    var BitSets = Shumway.BitSets;

    var ColorStyle = (function () {
        function ColorStyle() {
        }
        ColorStyle.randomStyle = function () {
            if (!ColorStyle._randomStyleCache) {
                ColorStyle._randomStyleCache = [
                    "#ff5e3a",
                    "#ff9500",
                    "#ffdb4c",
                    "#87fc70",
                    "#52edc7",
                    "#1ad6fd",
                    "#c644fc",
                    "#ef4db6",
                    "#4a4a4a",
                    "#dbddde",
                    "#ff3b30",
                    "#ff9500",
                    "#ffcc00",
                    "#4cd964",
                    "#34aadc",
                    "#007aff",
                    "#5856d6",
                    "#ff2d55",
                    "#8e8e93",
                    "#c7c7cc",
                    "#5ad427",
                    "#c86edf",
                    "#d1eefc",
                    "#e0f8d8",
                    "#fb2b69",
                    "#f7f7f7",
                    "#1d77ef",
                    "#d6cec3",
                    "#55efcb",
                    "#ff4981",
                    "#ffd3e0",
                    "#f7f7f7",
                    "#ff1300",
                    "#1f1f21",
                    "#bdbec2",
                    "#ff3a2d"
                ];
            }
            return ColorStyle._randomStyleCache[(ColorStyle._nextStyle++) % ColorStyle._randomStyleCache.length];
        };

        ColorStyle.contrastStyle = function (rgb) {
            // http://www.w3.org/TR/AERT#color-contrast
            var c = parseInt(rgb.substr(1), 16);
            var yiq = (((c >> 16) * 299) + (((c >> 8) & 0xff) * 587) + ((c & 0xff) * 114)) / 1000;
            return (yiq >= 128) ? '#000000' : '#ffffff';
        };

        ColorStyle.reset = function () {
            ColorStyle._nextStyle = 0;
        };
        ColorStyle.TabToolbar = "#252c33";
        ColorStyle.Toolbars = "#343c45";
        ColorStyle.HighlightBlue = "#1d4f73";
        ColorStyle.LightText = "#f5f7fa";
        ColorStyle.ForegroundText = "#b6babf";
        ColorStyle.Black = "#000000";
        ColorStyle.VeryDark = "#14171a";
        ColorStyle.Dark = "#181d20";
        ColorStyle.Light = "#a9bacb";
        ColorStyle.Grey = "#8fa1b2";
        ColorStyle.DarkGrey = "#5f7387";
        ColorStyle.Blue = "#46afe3";
        ColorStyle.Purple = "#6b7abb";
        ColorStyle.Pink = "#df80ff";
        ColorStyle.Red = "#eb5368";
        ColorStyle.Orange = "#d96629";
        ColorStyle.LightOrange = "#d99b28";
        ColorStyle.Green = "#70bf53";
        ColorStyle.BlueGrey = "#5e88b0";

        ColorStyle._nextStyle = 0;
        return ColorStyle;
    })();
    Shumway.ColorStyle = ColorStyle;

    /**
    * Faster release version of bounds.
    */
    var Bounds = (function () {
        function Bounds(xMin, yMin, xMax, yMax) {
            this.xMin = xMin | 0;
            this.yMin = yMin | 0;
            this.xMax = xMax | 0;
            this.yMax = yMax | 0;
        }
        Bounds.FromUntyped = function (source) {
            return new Bounds(source.xMin, source.yMin, source.xMax, source.yMax);
        };

        Bounds.FromRectangle = function (source) {
            return new Bounds(source.x * 20 | 0, source.y * 20 | 0, (source.x + source.width) * 20 | 0, (source.y + source.height) * 20 | 0);
        };

        Bounds.prototype.setElements = function (xMin, yMin, xMax, yMax) {
            this.xMin = xMin;
            this.yMin = yMin;
            this.xMax = xMax;
            this.yMax = yMax;
        };

        Bounds.prototype.copyFrom = function (source) {
            this.setElements(source.xMin, source.yMin, source.xMax, source.yMax);
        };

        Bounds.prototype.contains = function (x, y) {
            return x < this.xMin !== x < this.xMax && y < this.yMin !== y < this.yMax;
        };

        Bounds.prototype.unionInPlace = function (other) {
            this.xMin = Math.min(this.xMin, other.xMin);
            this.yMin = Math.min(this.yMin, other.yMin);
            this.xMax = Math.max(this.xMax, other.xMax);
            this.yMax = Math.max(this.yMax, other.yMax);
        };

        Bounds.prototype.extendByPoint = function (x, y) {
            this.extendByX(x);
            this.extendByY(y);
        };

        Bounds.prototype.extendByX = function (x) {
            // Exclude default values.
            if (this.xMin === 0x8000000) {
                this.xMin = this.xMax = x;
                return;
            }
            this.xMin = Math.min(this.xMin, x);
            this.xMax = Math.max(this.xMax, x);
        };

        Bounds.prototype.extendByY = function (y) {
            // Exclude default values.
            if (this.yMin === 0x8000000) {
                this.yMin = this.yMax = y;
                return;
            }
            this.yMin = Math.min(this.yMin, y);
            this.yMax = Math.max(this.yMax, y);
        };

        Bounds.prototype.intersects = function (toIntersect) {
            return this.contains(toIntersect.xMin, toIntersect.yMin) || this.contains(toIntersect.xMax, toIntersect.yMax);
        };

        Bounds.prototype.isEmpty = function () {
            return this.xMax <= this.xMin || this.yMax <= this.yMin;
        };

        Object.defineProperty(Bounds.prototype, "width", {
            get: function () {
                return this.xMax - this.xMin;
            },
            set: function (value) {
                this.xMax = this.xMin + value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Bounds.prototype, "height", {
            get: function () {
                return this.yMax - this.yMin;
            },
            set: function (value) {
                this.yMax = this.yMin + value;
            },
            enumerable: true,
            configurable: true
        });


        Bounds.prototype.getBaseWidth = function (angle) {
            var u = Math.abs(Math.cos(angle));
            var v = Math.abs(Math.sin(angle));
            return u * (this.xMax - this.xMin) + v * (this.yMax - this.yMin);
        };

        Bounds.prototype.getBaseHeight = function (angle) {
            var u = Math.abs(Math.cos(angle));
            var v = Math.abs(Math.sin(angle));
            return v * (this.xMax - this.xMin) + u * (this.yMax - this.yMin);
        };

        Bounds.prototype.setEmpty = function () {
            this.xMin = this.yMin = this.xMax = this.yMax = 0;
        };

        /**
        * Set all fields to the sentinel value 0x8000000.
        *
        * This is what Flash uses to indicate uninitialized bounds. Important for bounds calculation
        * in `Graphics` instances, which start out with empty bounds but must not just extend them
        * from an 0,0 origin.
        */
        Bounds.prototype.setToSentinels = function () {
            this.xMin = this.yMin = this.xMax = this.yMax = 0x8000000;
        };

        Bounds.prototype.clone = function () {
            return new Bounds(this.xMin, this.yMin, this.xMax, this.yMax);
        };

        Bounds.prototype.toString = function () {
            return "{ " + "xMin: " + this.xMin + ", " + "xMin: " + this.yMin + ", " + "xMax: " + this.xMax + ", " + "xMax: " + this.yMax + " }";
        };
        return Bounds;
    })();
    Shumway.Bounds = Bounds;

    /**
    * Slower debug version of bounds, makes sure that all points have integer coordinates.
    */
    var DebugBounds = (function () {
        function DebugBounds(xMin, yMin, xMax, yMax) {
            Debug.assert(isInteger(xMin));
            Debug.assert(isInteger(yMin));
            Debug.assert(isInteger(xMax));
            Debug.assert(isInteger(yMax));
            this._xMin = xMin | 0;
            this._yMin = yMin | 0;
            this._xMax = xMax | 0;
            this._yMax = yMax | 0;
            this.assertValid();
        }
        DebugBounds.FromUntyped = function (source) {
            return new DebugBounds(source.xMin, source.yMin, source.xMax, source.yMax);
        };

        DebugBounds.FromRectangle = function (source) {
            return new DebugBounds(source.x * 20 | 0, source.y * 20 | 0, (source.x + source.width) * 20 | 0, (source.y + source.height) * 20 | 0);
        };

        DebugBounds.prototype.setElements = function (xMin, yMin, xMax, yMax) {
            this.xMin = xMin;
            this.yMin = yMin;
            this.xMax = xMax;
            this.yMax = yMax;
        };

        DebugBounds.prototype.copyFrom = function (source) {
            this.setElements(source.xMin, source.yMin, source.xMax, source.yMax);
        };

        DebugBounds.prototype.contains = function (x, y) {
            return x < this.xMin !== x < this.xMax && y < this.yMin !== y < this.yMax;
        };

        DebugBounds.prototype.unionWith = function (other) {
            this._xMin = Math.min(this._xMin, other._xMin);
            this._yMin = Math.min(this._yMin, other._yMin);
            this._xMax = Math.max(this._xMax, other._xMax);
            this._yMax = Math.max(this._yMax, other._yMax);
        };

        DebugBounds.prototype.extendByPoint = function (x, y) {
            this.extendByX(x);
            this.extendByY(y);
        };

        DebugBounds.prototype.extendByX = function (x) {
            if (this.xMin === 0x8000000) {
                this.xMin = this.xMax = x;
                return;
            }
            this.xMin = Math.min(this.xMin, x);
            this.xMax = Math.max(this.xMax, x);
        };

        DebugBounds.prototype.extendByY = function (y) {
            if (this.yMin === 0x8000000) {
                this.yMin = this.yMax = y;
                return;
            }
            this.yMin = Math.min(this.yMin, y);
            this.yMax = Math.max(this.yMax, y);
        };

        DebugBounds.prototype.intersects = function (toIntersect) {
            return this.contains(toIntersect._xMin, toIntersect._yMin) || this.contains(toIntersect._xMax, toIntersect._yMax);
        };

        DebugBounds.prototype.isEmpty = function () {
            return this._xMax <= this._xMin || this._yMax <= this._yMin;
        };


        Object.defineProperty(DebugBounds.prototype, "xMin", {
            get: function () {
                return this._xMin;
            },
            set: function (value) {
                Debug.assert(isInteger(value));
                this._xMin = value;
                this.assertValid();
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DebugBounds.prototype, "yMin", {
            get: function () {
                return this._yMin;
            },
            set: function (value) {
                Debug.assert(isInteger(value));
                this._yMin = value | 0;
                this.assertValid();
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DebugBounds.prototype, "xMax", {
            get: function () {
                return this._xMax;
            },
            set: function (value) {
                Debug.assert(isInteger(value));
                this._xMax = value | 0;
                this.assertValid();
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DebugBounds.prototype, "width", {
            get: function () {
                return this._xMax - this._xMin;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(DebugBounds.prototype, "yMax", {
            get: function () {
                return this._yMax;
            },
            set: function (value) {
                Debug.assert(isInteger(value));
                this._yMax = value | 0;
                this.assertValid();
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DebugBounds.prototype, "height", {
            get: function () {
                return this._yMax - this._yMin;
            },
            enumerable: true,
            configurable: true
        });

        DebugBounds.prototype.getBaseWidth = function (angle) {
            var u = Math.abs(Math.cos(angle));
            var v = Math.abs(Math.sin(angle));
            return u * (this._xMax - this._xMin) + v * (this._yMax - this._yMin);
        };

        DebugBounds.prototype.getBaseHeight = function (angle) {
            var u = Math.abs(Math.cos(angle));
            var v = Math.abs(Math.sin(angle));
            return v * (this._xMax - this._xMin) + u * (this._yMax - this._yMin);
        };

        DebugBounds.prototype.setEmpty = function () {
            this._xMin = this._yMin = this._xMax = this._yMax = 0;
        };

        DebugBounds.prototype.clone = function () {
            return new DebugBounds(this.xMin, this.yMin, this.xMax, this.yMax);
        };

        DebugBounds.prototype.toString = function () {
            return "{ " + "xMin: " + this._xMin + ", " + "xMin: " + this._yMin + ", " + "xMax: " + this._xMax + ", " + "xMax: " + this._yMax + " }";
        };

        DebugBounds.prototype.assertValid = function () {
            //      release || assert(this._xMax >= this._xMin);
            //      release || assert(this._yMax >= this._yMin);
        };
        return DebugBounds;
    })();
    Shumway.DebugBounds = DebugBounds;

    /**
    * Override Bounds with a slower by safer version, don't do this in release mode.
    */
    // Shumway.Bounds = DebugBounds;
    var Color = (function () {
        function Color(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        Color.FromARGB = function (argb) {
            return new Color((argb >> 16 & 0xFF) / 255, (argb >> 8 & 0xFF) / 255, (argb >> 0 & 0xFF) / 255, (argb >> 24 & 0xFF) / 255);
        };
        Color.FromRGBA = function (rgba) {
            return Color.FromARGB(ColorUtilities.RGBAToARGB(rgba));
        };
        Color.prototype.toRGBA = function () {
            return (this.r * 255) << 24 | (this.g * 255) << 16 | (this.b * 255) << 8 | (this.a * 255);
        };
        Color.prototype.toCSSStyle = function () {
            return ColorUtilities.rgbaToCSSStyle(this.toRGBA());
        };
        Color.prototype.set = function (other) {
            this.r = other.r;
            this.g = other.g;
            this.b = other.b;
            this.a = other.a;
        };

        Color.randomColor = function (alpha) {
            if (typeof alpha === "undefined") { alpha = 1; }
            return new Color(Math.random(), Math.random(), Math.random(), alpha);
        };
        Color.parseColor = function (color) {
            if (!Color.colorCache) {
                Color.colorCache = Object.create(null);
            }
            if (Color.colorCache[color]) {
                return Color.colorCache[color];
            }

            // TODO: Obviously slow, but it will do for now.
            var span = document.createElement('span');
            document.body.appendChild(span);
            span.style.backgroundColor = color;
            var rgb = getComputedStyle(span).backgroundColor;
            document.body.removeChild(span);
            var m = /^rgb\((\d+), (\d+), (\d+)\)$/.exec(rgb);
            if (!m)
                m = /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(rgb);
            var result = new Color(0, 0, 0, 0);
            result.r = parseFloat(m[1]) / 255;
            result.g = parseFloat(m[2]) / 255;
            result.b = parseFloat(m[3]) / 255;
            result.a = m[4] ? parseFloat(m[4]) / 255 : 1;
            return Color.colorCache[color] = result;
        };
        Color.Red = new Color(1, 0, 0, 1);
        Color.Green = new Color(0, 1, 0, 1);
        Color.Blue = new Color(0, 0, 1, 1);
        Color.None = new Color(0, 0, 0, 0);
        Color.White = new Color(1, 1, 1, 1);
        Color.Black = new Color(0, 0, 0, 1);
        Color.colorCache = {};
        return Color;
    })();
    Shumway.Color = Color;

    (function (ColorUtilities) {
        function RGBAToARGB(rgba) {
            return ((rgba >> 8) & 0x00ffffff) | ((rgba & 0xff) << 24);
        }
        ColorUtilities.RGBAToARGB = RGBAToARGB;

        function ARGBToRGBA(argb) {
            return argb << 8 | ((argb >> 24) & 0xff);
        }
        ColorUtilities.ARGBToRGBA = ARGBToRGBA;

        function rgbaToCSSStyle(color) {
            return 'rgba(' + (color >> 24 & 0xff) + ',' + (color >> 16 & 0xff) + ',' + (color >> 8 & 0xff) + ',' + ((color & 0xff) / 0xff) + ')';
        }
        ColorUtilities.rgbaToCSSStyle = rgbaToCSSStyle;

        function hexToRGB(color) {
            return parseInt(color.slice(1), 16);
        }
        ColorUtilities.hexToRGB = hexToRGB;

        function rgbToHex(color) {
            return '#' + ('000000' + color.toString(16)).slice(-6);
        }
        ColorUtilities.rgbToHex = rgbToHex;

        function isValidHexColor(value) {
            return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
        }
        ColorUtilities.isValidHexColor = isValidHexColor;

        /**
        * Unpremultiplies the given |pARGB| color value.
        */
        function unpremultiplyARGB(pARGB) {
            var b = (pARGB >> 0) & 0xff;
            var g = (pARGB >> 8) & 0xff;
            var r = (pARGB >> 16) & 0xff;
            var a = (pARGB >> 24) & 0xff;
            r = Math.imul(255, r) / a & 0xff;
            g = Math.imul(255, g) / a & 0xff;
            b = Math.imul(255, b) / a & 0xff;
            return a << 24 | r << 16 | g << 8 | b;
        }
        ColorUtilities.unpremultiplyARGB = unpremultiplyARGB;

        /**
        * Premultiplies the given |pARGB| color value.
        */
        function premultiplyARGB(uARGB) {
            var b = (uARGB >> 0) & 0xff;
            var g = (uARGB >> 8) & 0xff;
            var r = (uARGB >> 16) & 0xff;
            var a = (uARGB >> 24) & 0xff;
            r = ((Math.imul(r, a) + 127) / 255) | 0;
            g = ((Math.imul(g, a) + 127) / 255) | 0;
            b = ((Math.imul(b, a) + 127) / 255) | 0;
            return a << 24 | r << 16 | g << 8 | b;
        }
        ColorUtilities.premultiplyARGB = premultiplyARGB;

        var premultiplyTable;

        /**
        * All possible alpha values and colors 256 * 256 = 65536 entries. Experiments
        * indicate that doing unpremultiplication this way is roughly 5x faster.
        *
        * To lookup a color |c| in the table at a given alpha value |a| use:
        * |(a << 8) + c| to compute the index. This layout order was chosen to make
        * table lookups cache friendly, it actually makes a difference.
        *
        * TODO: Figure out if memory / speed tradeoff is worth it.
        */
        var unpremultiplyTable;

        /**
        * Make sure to call this before using the |unpremultiplyARGBUsingTableLookup| or
        * |premultiplyARGBUsingTableLookup| functions. We want to execute this lazily so
        * we don't incur any startup overhead.
        */
        function ensureUnpremultiplyTable() {
            if (!unpremultiplyTable) {
                unpremultiplyTable = new Uint8Array(256 * 256);
                for (var c = 0; c < 256; c++) {
                    for (var a = 0; a < 256; a++) {
                        unpremultiplyTable[(a << 8) + c] = Math.imul(255, c) / a;
                    }
                }
            }
        }
        ColorUtilities.ensureUnpremultiplyTable = ensureUnpremultiplyTable;

        function tableLookupUnpremultiplyARGB(pARGB) {
            pARGB = pARGB | 0;
            var a = (pARGB >> 24) & 0xff;
            if (a === 0) {
                return 0;
            }
            var b = (pARGB >> 0) & 0xff;
            var g = (pARGB >> 8) & 0xff;
            var r = (pARGB >> 16) & 0xff;
            var o = a << 8;
            r = unpremultiplyTable[o + r];
            g = unpremultiplyTable[o + g];
            b = unpremultiplyTable[o + b];
            return a << 24 | r << 16 | g << 8 | b;
        }
        ColorUtilities.tableLookupUnpremultiplyARGB = tableLookupUnpremultiplyARGB;

        var inverseSourceAlphaTable;

        /**
        * Computes all possible inverse source alpha values.
        */
        function ensureInverseSourceAlphaTable() {
            if (inverseSourceAlphaTable) {
                return;
            }
            inverseSourceAlphaTable = new Float64Array(256);
            for (var a = 0; a < 255; a++) {
                inverseSourceAlphaTable[a] = 1 - a / 255;
            }
        }
        ColorUtilities.ensureInverseSourceAlphaTable = ensureInverseSourceAlphaTable;

        /**
        * The blending equation for unpremultiplied alpha is:
        *
        *   (src.rgb * src.a) + (dst.rgb * (1 - src.a))
        *
        * For premultiplied alpha src.rgb and dst.rgb are already
        * premultiplied by alpha, so the equation becomes:
        *
        *   src.rgb + (dst.rgb * (1 - src.a))
        *
        * TODO: Not sure what to do about the dst.rgb which is
        * premultiplied by its alpah, but this appears to work.
        */
        function blendPremultipliedBGRA(tpBGRA, spBGRA) {
            var ta = (tpBGRA >> 0) & 0xff;
            var tr = (tpBGRA >> 8) & 0xff;
            var tg = (tpBGRA >> 16) & 0xff;
            var tb = (tpBGRA >> 24) & 0xff;

            var sa = (spBGRA >> 0) & 0xff;
            var sr = (spBGRA >> 8) & 0xff;
            var sg = (spBGRA >> 16) & 0xff;
            var sb = (spBGRA >> 24) & 0xff;

            // TODO: Clampling.
            var inverseSourceAlpha = inverseSourceAlphaTable[sa];
            var ta = sa + ta * inverseSourceAlpha;
            var tr = sr + tr * inverseSourceAlpha;
            var tg = sg + tg * inverseSourceAlpha;
            var tb = sb + tb * inverseSourceAlpha;
            return tb << 24 | tg << 16 | tr << 8 | ta;
        }
        ColorUtilities.blendPremultipliedBGRA = blendPremultipliedBGRA;
    })(Shumway.ColorUtilities || (Shumway.ColorUtilities = {}));
    var ColorUtilities = Shumway.ColorUtilities;

    (function (Telemetry) {
        (function (Feature) {
            Feature[Feature["EXTERNAL_INTERFACE_FEATURE"] = 1] = "EXTERNAL_INTERFACE_FEATURE";
            Feature[Feature["CLIPBOARD_FEATURE"] = 2] = "CLIPBOARD_FEATURE";
            Feature[Feature["SHAREDOBJECT_FEATURE"] = 3] = "SHAREDOBJECT_FEATURE";
            Feature[Feature["VIDEO_FEATURE"] = 4] = "VIDEO_FEATURE";
            Feature[Feature["SOUND_FEATURE"] = 5] = "SOUND_FEATURE";
            Feature[Feature["NETCONNECTION_FEATURE"] = 6] = "NETCONNECTION_FEATURE";
        })(Telemetry.Feature || (Telemetry.Feature = {}));
        var Feature = Telemetry.Feature;

        (function (ErrorTypes) {
            ErrorTypes[ErrorTypes["AVM1_ERROR"] = 1] = "AVM1_ERROR";
            ErrorTypes[ErrorTypes["AVM2_ERROR"] = 2] = "AVM2_ERROR";
        })(Telemetry.ErrorTypes || (Telemetry.ErrorTypes = {}));
        var ErrorTypes = Telemetry.ErrorTypes;

        Telemetry.instance;
    })(Shumway.Telemetry || (Shumway.Telemetry = {}));
    var Telemetry = Shumway.Telemetry;

    (function (FileLoadingService) {
        FileLoadingService.instance;
    })(Shumway.FileLoadingService || (Shumway.FileLoadingService = {}));
    var FileLoadingService = Shumway.FileLoadingService;

    (function (ExternalInterfaceService) {
        ExternalInterfaceService.instance = {
            enabled: false,
            initJS: function (callback) {
            },
            registerCallback: function (functionName) {
            },
            unregisterCallback: function (functionName) {
            },
            eval: function (expression) {
            },
            call: function (request) {
            },
            getId: function () {
                return null;
            }
        };
    })(Shumway.ExternalInterfaceService || (Shumway.ExternalInterfaceService = {}));
    var ExternalInterfaceService = Shumway.ExternalInterfaceService;

    var Callback = (function () {
        function Callback() {
            this._queues = {};
        }
        Callback.prototype.register = function (type, callback) {
            Debug.assert(type);
            Debug.assert(callback);
            var queue = this._queues[type];
            if (queue) {
                if (queue.indexOf(callback) > -1) {
                    return;
                }
            } else {
                queue = this._queues[type] = [];
            }
            queue.push(callback);
        };

        Callback.prototype.unregister = function (type, callback) {
            Debug.assert(type);
            Debug.assert(callback);
            var queue = this._queues[type];
            if (!queue) {
                return;
            }
            var i = queue.indexOf(callback);
            if (i !== -1) {
                queue.splice(i, 1);
            }
            if (queue.length === 0) {
                this._queues[type] = null;
            }
        };

        Callback.prototype.notify = function (type, args) {
            var queue = this._queues[type];
            if (!queue) {
                return;
            }
            queue = queue.slice();
            var args = Array.prototype.slice.call(arguments, 0);
            for (var i = 0; i < queue.length; i++) {
                var callback = queue[i];
                callback.apply(null, args);
            }
        };

        Callback.prototype.notify1 = function (type, value) {
            var queue = this._queues[type];
            if (!queue) {
                return;
            }
            queue = queue.slice();
            for (var i = 0; i < queue.length; i++) {
                var callback = queue[i];
                callback(type, value);
            }
        };
        return Callback;
    })();
    Shumway.Callback = Callback;

    (function (ImageType) {
        ImageType[ImageType["None"] = 0] = "None";

        /**
        * Premultiplied ARGB (byte-order).
        */
        ImageType[ImageType["PremultipliedAlphaARGB"] = 1] = "PremultipliedAlphaARGB";

        /**
        * Unpremultiplied ARGB (byte-order).
        */
        ImageType[ImageType["StraightAlphaARGB"] = 2] = "StraightAlphaARGB";

        /**
        * Unpremultiplied RGBA (byte-order), this is what putImageData expects.
        */
        ImageType[ImageType["StraightAlphaRGBA"] = 3] = "StraightAlphaRGBA";

        ImageType[ImageType["JPEG"] = 4] = "JPEG";
        ImageType[ImageType["PNG"] = 5] = "PNG";
        ImageType[ImageType["GIF"] = 6] = "GIF";
    })(Shumway.ImageType || (Shumway.ImageType = {}));
    var ImageType = Shumway.ImageType;

    var PromiseWrapper = (function () {
        function PromiseWrapper() {
            this.promise = new Promise(function (resolve, reject) {
                this.resolve = resolve;
                this.reject = reject;
            }.bind(this));
        }
        return PromiseWrapper;
    })();
    Shumway.PromiseWrapper = PromiseWrapper;
})(Shumway || (Shumway = {}));

// Polyfill for Promises
(function PromiseClosure() {
    /*jshint -W061 */
    var global = Function("return this")();
    if (global.Promise) {
        // Promises existing in the DOM/Worker, checking presence of all/resolve
        if (typeof global.Promise.all !== 'function') {
            global.Promise.all = function (iterable) {
                var count = 0, results = [], resolve, reject;
                var promise = new global.Promise(function (resolve_, reject_) {
                    resolve = resolve_;
                    reject = reject_;
                });
                iterable.forEach(function (p, i) {
                    count++;
                    p.then(function (result) {
                        results[i] = result;
                        count--;
                        if (count === 0) {
                            resolve(results);
                        }
                    }, reject);
                });
                if (count === 0) {
                    resolve(results);
                }
                return promise;
            };
        }
        if (typeof global.Promise.resolve !== 'function') {
            global.Promise.resolve = function (x) {
                return new global.Promise(function (resolve) {
                    resolve(x);
                });
            };
        }
        return;
    }

    function getDeferred(C) {
        if (typeof C !== 'function') {
            throw new TypeError('Invalid deferred constructor');
        }
        var resolver = createDeferredConstructionFunctions();
        var promise = new C(resolver);
        var resolve = resolver.resolve;
        if (typeof resolve !== 'function') {
            throw new TypeError('Invalid resolve construction function');
        }
        var reject = resolver.reject;
        if (typeof reject !== 'function') {
            throw new TypeError('Invalid reject construction function');
        }
        return { promise: promise, resolve: resolve, reject: reject };
    }

    function updateDeferredFromPotentialThenable(x, deferred) {
        if (typeof x !== 'object' || x === null) {
            return false;
        }
        try  {
            var then = x.then;
            if (typeof then !== 'function') {
                return false;
            }
            var thenCallResult = then.call(x, deferred.resolve, deferred.reject);
        } catch (e) {
            var reject = deferred.reject;
            reject(e);
        }
        return true;
    }

    function isPromise(x) {
        return typeof x === 'object' && x !== null && typeof x.promiseStatus !== 'undefined';
    }

    function rejectPromise(promise, reason) {
        if (promise.promiseStatus !== 'unresolved') {
            return;
        }
        var reactions = promise.rejectReactions;
        promise.result = reason;
        promise.resolveReactions = undefined;
        promise.rejectReactions = undefined;
        promise.promiseStatus = 'has-rejection';
        triggerPromiseReactions(reactions, reason);
    }

    function resolvePromise(promise, resolution) {
        if (promise.promiseStatus !== 'unresolved') {
            return;
        }
        var reactions = promise.resolveReactions;
        promise.result = resolution;
        promise.resolveReactions = undefined;
        promise.rejectReactions = undefined;
        promise.promiseStatus = 'has-resolution';
        triggerPromiseReactions(reactions, resolution);
    }

    function triggerPromiseReactions(reactions, argument) {
        for (var i = 0; i < reactions.length; i++) {
            queueMicrotask({ reaction: reactions[i], argument: argument });
        }
    }

    function queueMicrotask(task) {
        if (microtasksQueue.length === 0) {
            setTimeout(handleMicrotasksQueue, 0);
        }
        microtasksQueue.push(task);
    }

    function executePromiseReaction(reaction, argument) {
        var deferred = reaction.deferred;
        var handler = reaction.handler;
        var handlerResult, updateResult;
        try  {
            handlerResult = handler(argument);
        } catch (e) {
            var reject = deferred.reject;
            return reject(e);
        }

        if (handlerResult === deferred.promise) {
            var reject = deferred.reject;
            return reject(new TypeError('Self resolution'));
        }

        try  {
            updateResult = updateDeferredFromPotentialThenable(handlerResult, deferred);
            if (!updateResult) {
                var resolve = deferred.resolve;
                return resolve(handlerResult);
            }
        } catch (e) {
            var reject = deferred.reject;
            return reject(e);
        }
    }

    var microtasksQueue = [];

    function handleMicrotasksQueue() {
        while (microtasksQueue.length > 0) {
            var task = microtasksQueue[0];
            try  {
                executePromiseReaction(task.reaction, task.argument);
            } catch (e) {
                // unhandler onFulfillment/onRejection exception
                if (typeof Promise.onerror === 'function') {
                    Promise.onerror(e);
                }
            }
            microtasksQueue.shift();
        }
    }

    function throwerFunction(e) {
        throw e;
    }

    function identityFunction(x) {
        return x;
    }

    function createRejectPromiseFunction(promise) {
        return function (reason) {
            rejectPromise(promise, reason);
        };
    }

    function createResolvePromiseFunction(promise) {
        return function (resolution) {
            resolvePromise(promise, resolution);
        };
    }

    function createDeferredConstructionFunctions() {
        var fn = function (resolve, reject) {
            fn.resolve = resolve;
            fn.reject = reject;
        };
        return fn;
    }

    function createPromiseResolutionHandlerFunctions(promise, fulfillmentHandler, rejectionHandler) {
        return function (x) {
            if (x === promise) {
                return rejectionHandler(new TypeError('Self resolution'));
            }
            var cstr = promise.promiseConstructor;
            if (isPromise(x)) {
                var xConstructor = x.promiseConstructor;
                if (xConstructor === cstr) {
                    return x.then(fulfillmentHandler, rejectionHandler);
                }
            }
            var deferred = getDeferred(cstr);
            var updateResult = updateDeferredFromPotentialThenable(x, deferred);
            if (updateResult) {
                var deferredPromise = deferred.promise;
                return deferredPromise.then(fulfillmentHandler, rejectionHandler);
            }
            return fulfillmentHandler(x);
        };
    }

    function createPromiseAllCountdownFunction(index, values, deferred, countdownHolder) {
        return function (x) {
            values[index] = x;
            countdownHolder.countdown--;
            if (countdownHolder.countdown === 0) {
                deferred.resolve(values);
            }
        };
    }

    function Promise(resolver) {
        if (typeof resolver !== 'function') {
            throw new TypeError('resolver is not a function');
        }
        var promise = this;
        if (typeof promise !== 'object') {
            throw new TypeError('Promise to initialize is not an object');
        }
        promise.promiseStatus = 'unresolved';
        promise.resolveReactions = [];
        promise.rejectReactions = [];
        promise.result = undefined;

        var resolve = createResolvePromiseFunction(promise);
        var reject = createRejectPromiseFunction(promise);

        try  {
            var result = resolver(resolve, reject);
        } catch (e) {
            rejectPromise(promise, e);
        }

        promise.promiseConstructor = Promise;
        return promise;
    }

    Promise.all = function (iterable) {
        var deferred = getDeferred(this);
        var values = [];
        var countdownHolder = { countdown: 0 };
        var index = 0;
        iterable.forEach(function (nextValue) {
            var nextPromise = this.cast(nextValue);
            var fn = createPromiseAllCountdownFunction(index, values, deferred, countdownHolder);
            nextPromise.then(fn, deferred.reject);
            index++;
            countdownHolder.countdown++;
        }, this);
        if (index === 0) {
            deferred.resolve(values);
        }
        return deferred.promise;
    };
    Promise.cast = function (x) {
        if (isPromise(x)) {
            return x;
        }
        var deferred = getDeferred(this);
        deferred.resolve(x);
        return deferred.promise;
    };
    Promise.reject = function (r) {
        var deferred = getDeferred(this);
        var rejectResult = deferred.reject(r);
        return deferred.promise;
    };
    Promise.resolve = function (x) {
        var deferred = getDeferred(this);
        var rejectResult = deferred.resolve(x);
        return deferred.promise;
    };
    Promise.prototype = {
        'catch': function (onRejected) {
            this.then(undefined, onRejected);
        },
        then: function (onFulfilled, onRejected) {
            var promise = this;
            if (!isPromise(promise)) {
                throw new TypeError('this is not a Promises');
            }
            var cstr = promise.promiseConstructor;
            var deferred = getDeferred(cstr);

            var rejectionHandler = typeof onRejected === 'function' ? onRejected : throwerFunction;
            var fulfillmentHandler = typeof onFulfilled === 'function' ? onFulfilled : identityFunction;
            var resolutionHandler = createPromiseResolutionHandlerFunctions(promise, fulfillmentHandler, rejectionHandler);

            var resolveReaction = { deferred: deferred, handler: resolutionHandler };
            var rejectReaction = { deferred: deferred, handler: rejectionHandler };

            switch (promise.promiseStatus) {
                case 'unresolved':
                    promise.resolveReactions.push(resolveReaction);
                    promise.rejectReactions.push(rejectReaction);
                    break;
                case 'has-resolution':
                    var resolution = promise.result;
                    queueMicrotask({ reaction: resolveReaction, argument: resolution });
                    break;
                case 'has-rejection':
                    var rejection = promise.result;
                    queueMicrotask({ reaction: rejectReaction, argument: rejection });
                    break;
            }
            return deferred.promise;
        }
    };

    global.Promise = Promise;
})();

if (typeof exports !== "undefined") {
    exports["Shumway"] = Shumway;
}

/**
* Extend builtin prototypes.
*
* TODO: Go through the code and remove all references to these.
*/
(function () {
    function extendBuiltin(prototype, property, value) {
        if (!prototype[property]) {
            Object.defineProperty(prototype, property, {
                value: value,
                writable: true,
                configurable: true,
                enumerable: false });
        }
    }

    function removeColors(s) {
        return s.replace(/\033\[[0-9]*m/g, "");
    }

    extendBuiltin(String.prototype, "padRight", function (c, n) {
        var str = this;
        var length = removeColors(str).length;
        if (!c || length >= n) {
            return str;
        }
        var max = (n - length) / c.length;
        for (var i = 0; i < max; i++) {
            str += c;
        }
        return str;
    });

    extendBuiltin(String.prototype, "padLeft", function (c, n) {
        var str = this;
        var length = str.length;
        if (!c || length >= n) {
            return str;
        }
        var max = (n - length) / c.length;
        for (var i = 0; i < max; i++) {
            str = c + str;
        }
        return str;
    });

    extendBuiltin(String.prototype, "trim", function () {
        return this.replace(/^\s+|\s+$/g, "");
    });

    extendBuiltin(String.prototype, "endsWith", function (str) {
        return this.indexOf(str, this.length - str.length) !== -1;
    });

    extendBuiltin(Array.prototype, "replace", function (x, y) {
        if (x === y) {
            return 0;
        }
        var count = 0;
        for (var i = 0; i < this.length; i++) {
            if (this[i] === x) {
                this[i] = y;
                count++;
            }
        }
        return count;
    });
})();
/*
* Copyright 2014 Mozilla Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Shumway;
(function (Shumway) {
    /**
    * Option and Argument Management
    *
    * Options are configuration settings sprinkled throughout the code. They can be grouped into sets of
    * options called |OptionSets| which can form a hierarchy of options. For instance:
    *
    * var set = new OptionSet();
    * var opt = set.register(new Option("v", "verbose", "boolean", false, "Enables verbose logging."));
    *
    * creates an option set with one option in it. The option can be changed directly using |opt.value = true| or
    * automatically using the |ArgumentParser|:
    *
    * var parser = new ArgumentParser();
    * parser.addBoundOptionSet(set);
    * parser.parse(["-v"]);
    *
    * The |ArgumentParser| can also be used directly:
    *
    * var parser = new ArgumentParser();
    * argumentParser.addArgument("h", "help", "boolean", {parse: function (x) {
    *   printUsage();
    * }});
    */
    ///<reference path='references.ts' />
    (function (Options) {
        var isObject = Shumway.isObject;

        var assert = Shumway.Debug.assert;

        var Argument = (function () {
            function Argument(shortName, longName, type, options) {
                this.shortName = shortName;
                this.longName = longName;
                this.type = type;
                options = options || {};
                this.positional = options.positional;
                this.parseFn = options.parse;
                this.value = options.defaultValue;
            }
            Argument.prototype.parse = function (value) {
                if (this.type === "boolean") {
                    release || assert(typeof value === "boolean");
                    this.value = value;
                } else if (this.type === "number") {
                    release || assert(!isNaN(value), value + " is not a number");
                    this.value = parseInt(value, 10);
                } else {
                    this.value = value;
                }
                if (this.parseFn) {
                    this.parseFn(this.value);
                }
            };
            return Argument;
        })();
        Options.Argument = Argument;

        var ArgumentParser = (function () {
            function ArgumentParser() {
                this.args = [];
            }
            ArgumentParser.prototype.addArgument = function (shortName, longName, type, options) {
                var argument = new Argument(shortName, longName, type, options);
                this.args.push(argument);
                return argument;
            };
            ArgumentParser.prototype.addBoundOption = function (option) {
                var options = { parse: function (x) {
                        option.value = x;
                    } };
                this.args.push(new Argument(option.shortName, option.longName, option.type, options));
            };
            ArgumentParser.prototype.addBoundOptionSet = function (optionSet) {
                var self = this;
                optionSet.options.forEach(function (x) {
                    if (x instanceof OptionSet) {
                        self.addBoundOptionSet(x);
                    } else {
                        release || assert(x instanceof Option);
                        self.addBoundOption(x);
                    }
                });
            };
            ArgumentParser.prototype.getUsage = function () {
                var str = "";
                this.args.forEach(function (x) {
                    if (!x.positional) {
                        str += "[-" + x.shortName + "|--" + x.longName + (x.type === "boolean" ? "" : " " + x.type[0].toUpperCase()) + "]";
                    } else {
                        str += x.longName;
                    }
                    str += " ";
                });
                return str;
            };
            ArgumentParser.prototype.parse = function (args) {
                var nonPositionalArgumentMap = {};
                var positionalArgumentList = [];
                this.args.forEach(function (x) {
                    if (x.positional) {
                        positionalArgumentList.push(x);
                    } else {
                        nonPositionalArgumentMap["-" + x.shortName] = x;
                        nonPositionalArgumentMap["--" + x.longName] = x;
                    }
                });

                var leftoverArguments = [];

                while (args.length) {
                    var argString = args.shift();
                    var argument = null, value = argString;
                    if (argString == '--') {
                        leftoverArguments = leftoverArguments.concat(args);
                        break;
                    } else if (argString.slice(0, 1) == '-' || argString.slice(0, 2) == '--') {
                        argument = nonPositionalArgumentMap[argString];

                        // release || assert(argument, "Argument " + argString + " is unknown.");
                        if (!argument) {
                            continue;
                        }
                        if (argument.type !== "boolean") {
                            value = args.shift();
                            release || assert(value !== "-" && value !== "--", "Argument " + argString + " must have a value.");
                        } else {
                            value = true;
                        }
                    } else if (positionalArgumentList.length) {
                        argument = positionalArgumentList.shift();
                    } else {
                        leftoverArguments.push(value);
                    }
                    if (argument) {
                        argument.parse(value);
                    }
                }
                release || assert(positionalArgumentList.length === 0, "Missing positional arguments.");
                return leftoverArguments;
            };
            return ArgumentParser;
        })();
        Options.ArgumentParser = ArgumentParser;

        var OptionSet = (function () {
            function OptionSet(name, settings) {
                if (typeof settings === "undefined") { settings = null; }
                this.open = false;
                this.name = name;
                this.settings = settings || {};
                this.options = [];
            }
            OptionSet.prototype.register = function (option) {
                if (option instanceof OptionSet) {
                    for (var i = 0; i < this.options.length; i++) {
                        var optionSet = this.options[i];
                        if (optionSet instanceof OptionSet && optionSet.name === option.name) {
                            return optionSet;
                        }
                    }
                }
                this.options.push(option);
                if (this.settings) {
                    if (option instanceof OptionSet) {
                        var optionSettings = this.settings[option.name];
                        if (isObject(optionSettings)) {
                            option.settings = optionSettings.settings;
                            option.open = optionSettings.open;
                        }
                    } else {
                        // build_bundle chokes on this:
                        // if (!isNullOrUndefined(this.settings[option.longName])) {
                        if (typeof this.settings[option.longName] !== "undefined") {
                            switch (option.type) {
                                case "boolean":
                                    option.value = !!this.settings[option.longName];
                                    break;
                                case "number":
                                    option.value = +this.settings[option.longName];
                                    break;
                                default:
                                    option.value = this.settings[option.longName];
                                    break;
                            }
                        }
                    }
                }
                return option;
            };
            OptionSet.prototype.trace = function (writer) {
                writer.enter(this.name + " {");
                this.options.forEach(function (option) {
                    option.trace(writer);
                });
                writer.leave("}");
            };
            OptionSet.prototype.getSettings = function () {
                var settings = {};
                this.options.forEach(function (option) {
                    if (option instanceof OptionSet) {
                        settings[option.name] = {
                            settings: option.getSettings(),
                            open: option.open
                        };
                    } else {
                        settings[option.longName] = option.value;
                    }
                });
                return settings;
            };
            OptionSet.prototype.setSettings = function (settings) {
                if (!settings) {
                    return;
                }
                this.options.forEach(function (option) {
                    if (option instanceof OptionSet) {
                        if (option.name in settings) {
                            option.setSettings(settings[option.name].settings);
                        }
                    } else {
                        if (option.longName in settings) {
                            option.value = settings[option.longName];
                        }
                    }
                });
            };
            return OptionSet;
        })();
        Options.OptionSet = OptionSet;

        var Option = (function () {
            // config:
            //  { range: { min: 1, max: 5, step: 1 } }
            //  { list: [ "item 1", "item 2", "item 3" ] }
            //  { choices: { "choice 1": 1, "choice 2": 2, "choice 3": 3 } }
            function Option(shortName, longName, type, defaultValue, description, config) {
                if (typeof config === "undefined") { config = null; }
                this.longName = longName;
                this.shortName = shortName;
                this.type = type;
                this.defaultValue = defaultValue;
                this.value = defaultValue;
                this.description = description;
                this.config = config;
            }
            Option.prototype.parse = function (value) {
                this.value = value;
            };
            Option.prototype.trace = function (writer) {
                writer.writeLn(("-" + this.shortName + "|--" + this.longName).padRight(" ", 30) + " = " + this.type + " " + this.value + " [" + this.defaultValue + "]" + " (" + this.description + ")");
            };
            return Option;
        })();
        Options.Option = Option;
    })(Shumway.Options || (Shumway.Options = {}));
    var Options = Shumway.Options;
})(Shumway || (Shumway = {}));
/*
* Copyright 2014 Mozilla Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Shumway;
(function (Shumway) {
    ///<reference path='references.ts' />
    (function (Settings) {
        Settings.ROOT = "Shumway Options";
        Settings.shumwayOptions = new Shumway.Options.OptionSet(Settings.ROOT, load());

        function isStorageSupported() {
            try  {
                return typeof window !== 'undefined' && "localStorage" in window && window["localStorage"] !== null;
            } catch (e) {
                return false;
            }
        }
        Settings.isStorageSupported = isStorageSupported;

        function load(key) {
            if (typeof key === "undefined") { key = Settings.ROOT; }
            var settings = {};
            if (isStorageSupported()) {
                var lsValue = window.localStorage[key];
                if (lsValue) {
                    try  {
                        settings = JSON.parse(lsValue);
                    } catch (e) {
                    }
                }
            }
            return settings;
        }
        Settings.load = load;

        function save(settings, key) {
            if (typeof settings === "undefined") { settings = null; }
            if (typeof key === "undefined") { key = Settings.ROOT; }
            if (isStorageSupported()) {
                try  {
                    window.localStorage[key] = JSON.stringify(settings ? settings : Settings.shumwayOptions.getSettings());
                } catch (e) {
                }
            }
        }
        Settings.save = save;

        function setSettings(settings) {
            Settings.shumwayOptions.setSettings(settings);
        }
        Settings.setSettings = setSettings;

        function getSettings(settings) {
            return Settings.shumwayOptions.getSettings();
        }
        Settings.getSettings = getSettings;
    })(Shumway.Settings || (Shumway.Settings = {}));
    var Settings = Shumway.Settings;
})(Shumway || (Shumway = {}));
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
* Copyright 2014 Mozilla Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Shumway;
(function (Shumway) {
    ///<reference path='references.ts' />
    (function (Metrics) {
        var Timer = (function () {
            function Timer(parent, name) {
                this._parent = parent;
                this._timers = Shumway.ObjectUtilities.createMap();
                this._name = name;
                this._begin = 0;
                this._last = 0;
                this._total = 0;
                this._count = 0;
            }
            Timer.time = function (name, fn) {
                Timer.start(name);
                fn();
                Timer.stop();
            };
            Timer.start = function (name) {
                Timer._top = Timer._top._timers[name] || (Timer._top._timers[name] = new Timer(Timer._top, name));
                Timer._top.start();
                var tmp = Timer._flat._timers[name] || (Timer._flat._timers[name] = new Timer(Timer._flat, name));
                tmp.start();
                Timer._flatStack.push(tmp);
            };
            Timer.stop = function () {
                Timer._top.stop();
                Timer._top = Timer._top._parent;
                Timer._flatStack.pop().stop();
            };
            Timer.stopStart = function (name) {
                Timer.stop();
                Timer.start(name);
            };
            Timer.prototype.start = function () {
                this._begin = Shumway.getTicks();
            };
            Timer.prototype.stop = function () {
                this._last = Shumway.getTicks() - this._begin;
                this._total += this._last;
                this._count += 1;
            };
            Timer.prototype.toJSON = function () {
                return { name: this._name, total: this._total, timers: this._timers };
            };
            Timer.prototype.trace = function (writer) {
                writer.enter(this._name + ": " + this._total.toFixed(2) + " ms" + ", count: " + this._count + ", average: " + (this._total / this._count).toFixed(2) + " ms");
                for (var name in this._timers) {
                    this._timers[name].trace(writer);
                }
                writer.outdent();
            };
            Timer.trace = function (writer) {
                Timer._base.trace(writer);
                Timer._flat.trace(writer);
            };
            Timer._base = new Timer(null, "Total");
            Timer._top = Timer._base;
            Timer._flat = new Timer(null, "Flat");
            Timer._flatStack = [];
            return Timer;
        })();
        Metrics.Timer = Timer;

        /**
        * Quick way to count named events.
        */
        var Counter = (function () {
            function Counter(enabled) {
                this._enabled = enabled;
                this.clear();
            }
            Object.defineProperty(Counter.prototype, "counts", {
                get: function () {
                    return this._counts;
                },
                enumerable: true,
                configurable: true
            });

            Counter.prototype.setEnabled = function (enabled) {
                this._enabled = enabled;
            };
            Counter.prototype.clear = function () {
                this._counts = Shumway.ObjectUtilities.createMap();
                this._times = Shumway.ObjectUtilities.createMap();
            };
            Counter.prototype.toJSON = function () {
                return {
                    counts: this._counts,
                    times: this._times
                };
            };
            Counter.prototype.count = function (name, increment, time) {
                if (typeof increment === "undefined") { increment = 1; }
                if (typeof time === "undefined") { time = 0; }
                if (!this._enabled) {
                    return;
                }
                if (this._counts[name] === undefined) {
                    this._counts[name] = 0;
                    this._times[name] = 0;
                }
                this._counts[name] += increment;
                this._times[name] += time;
                return this._counts[name];
            };
            Counter.prototype.trace = function (writer) {
                for (var name in this._counts) {
                    writer.writeLn(name + ": " + this._counts[name]);
                }
            };
            Counter.prototype.toStringSorted = function () {
                var times = this._times;
                var pairs = [];
                for (var name in this._counts) {
                    pairs.push([name, this._counts[name]]);
                }
                pairs.sort(function (a, b) {
                    return b[1] - a[1];
                });
                return (pairs.map(function (pair) {
                    var name = pair[0];
                    var count = pair[1];
                    var time = times[name];
                    var line = name + ": " + count;
                    if (time) {
                        line += ", " + time.toFixed(4);
                        if (count > 1) {
                            line += " (" + (time / count).toFixed(4) + ")";
                        }
                    }
                    return line;
                }).join(", "));
            };
            Counter.prototype.traceSorted = function (writer, inline) {
                if (typeof inline === "undefined") { inline = false; }
                var times = this._times;
                var pairs = [];
                for (var name in this._counts) {
                    pairs.push([name, this._counts[name]]);
                }
                pairs.sort(function (a, b) {
                    return b[1] - a[1];
                });
                if (inline) {
                    writer.writeLn(pairs.map(function (pair) {
                        return (pair[0] + ": " + pair[1]);
                    }).join(", "));
                } else {
                    pairs.forEach(function (pair) {
                        var name = pair[0];
                        var count = pair[1];
                        var time = times[name];
                        var line = name + ": " + count;
                        if (time) {
                            line += ", " + time.toFixed(4);
                            if (count > 1) {
                                line += " (" + (time / count).toFixed(4) + ")";
                            }
                        }
                        writer.writeLn(line);
                    });
                }
            };
            Counter.instance = new Counter(true);
            return Counter;
        })();
        Metrics.Counter = Counter;

        var Average = (function () {
            function Average(max) {
                this._samples = new Float64Array(max);
                this._count = 0;
                this._index = 0;
            }
            Average.prototype.push = function (sample) {
                if (this._count < this._samples.length) {
                    this._count++;
                }
                this._index++;
                this._samples[this._index % this._samples.length] = sample;
            };
            Average.prototype.average = function () {
                var sum = 0;
                for (var i = 0; i < this._count; i++) {
                    sum += this._samples[i];
                }
                return sum / this._count;
            };
            return Average;
        })();
        Metrics.Average = Average;
    })(Shumway.Metrics || (Shumway.Metrics = {}));
    var Metrics = Shumway.Metrics;
})(Shumway || (Shumway = {}));
/**
* Copyright 2014 Mozilla Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Shumway;
(function (Shumway) {
    ///<reference path='references.ts' />
    (function (ArrayUtilities) {
        var notImplemented = Shumway.Debug.notImplemented;

        var utf8decode = Shumway.StringUtilities.utf8decode;
        var utf8encode = Shumway.StringUtilities.utf8encode;
        var clamp = Shumway.NumberUtilities.clamp;

        var swap32 = Shumway.IntegerUtilities.swap32;
        var floatToInt32 = Shumway.IntegerUtilities.floatToInt32;
        var int32ToFloat = Shumway.IntegerUtilities.int32ToFloat;

        function throwEOFError() {
            notImplemented("throwEOFError");
            // Runtime.throwErrorFromVM(AVM2.currentDomain(), "flash.errors.EOFError", "End of file was encountered.");
        }

        function throwRangeError() {
            notImplemented("throwRangeError");
            // var error = Errors.ParamRangeError;
            // Runtime.throwErrorFromVM("RangeError", getErrorMessage(error.code), error.code);
        }

        function throwCompressedDataError() {
            notImplemented("throwCompressedDataError");
            //    var error = Errors.CompressedDataError;
            //    Runtime.throwErrorFromVM("CompressedDataError", getErrorMessage(error.code), error.code);
        }

        function checkRange(x, min, max) {
            if (x !== clamp(x, min, max)) {
                throwRangeError();
            }
        }

        function asCoerceString(x) {
            if (typeof x === "string") {
                return x;
            } else if (x == undefined) {
                return null;
            }
            return x + '';
        }

        var PlainObjectDataBuffer = (function () {
            function PlainObjectDataBuffer(buffer, length, littleEndian) {
                this.buffer = buffer;
                this.length = length;
                this.littleEndian = littleEndian;
            }
            return PlainObjectDataBuffer;
        })();
        ArrayUtilities.PlainObjectDataBuffer = PlainObjectDataBuffer;

        var DataBuffer = (function () {
            function DataBuffer(initialSize) {
                if (typeof initialSize === "undefined") { initialSize = DataBuffer.INITIAL_SIZE; }
                this._buffer = new ArrayBuffer(initialSize);
                this._length = 0;
                this._position = 0;
                this._cacheViews();
                this._littleEndian = false; // AS3 is bigEndian by default.
                this._bitBuffer = 0;
                this._bitLength = 0;
            }
            DataBuffer.FromArrayBuffer = function (buffer, length) {
                if (typeof length === "undefined") { length = -1; }
                var dataBuffer = Object.create(DataBuffer.prototype);
                dataBuffer._buffer = buffer;
                dataBuffer._length = length === -1 ? buffer.byteLength : length;
                dataBuffer._position = 0;
                dataBuffer._cacheViews();
                dataBuffer._littleEndian = false; // AS3 is bigEndian by default.
                dataBuffer._bitBuffer = 0;
                dataBuffer._bitLength = 0;
                return dataBuffer;
            };

            DataBuffer.FromPlainObject = function (source) {
                var dataBuffer = DataBuffer.FromArrayBuffer(source.buffer, source.length);
                dataBuffer._littleEndian = source.littleEndian;
                return dataBuffer;
            };

            DataBuffer.prototype.toPlainObject = function () {
                return new PlainObjectDataBuffer(this._buffer, this._length, this._littleEndian);
            };

            DataBuffer.prototype._get = function (m, size) {
                if (this._position + size > this._length) {
                    throwEOFError();
                }
                var v = this._dataView[m](this._position, this._littleEndian);
                this._position += size;
                return v;
            };

            DataBuffer.prototype._set = function (m, size, v) {
                var length = this._position + size;
                this._ensureCapacity(length);
                this._dataView[m](this._position, v, this._littleEndian);
                this._position = length;
                if (length > this._length) {
                    this._length = length;
                }
            };

            DataBuffer.prototype._cacheViews = function () {
                this._i8View = new Int8Array(this._buffer);
                this._u8View = new Uint8Array(this._buffer);
                if ((this._buffer.byteLength & 0x3) === 0) {
                    this._i32View = new Int32Array(this._buffer);
                }
                this._dataView = new DataView(this._buffer);
            };

            DataBuffer.prototype.getBytes = function () {
                return new Uint8Array(this._buffer, 0, this._length);
            };

            DataBuffer.prototype._ensureCapacity = function (length) {
                var currentBuffer = this._buffer;
                if (currentBuffer.byteLength < length) {
                    var newLength = Math.max(currentBuffer.byteLength, 1);
                    while (newLength < length) {
                        newLength *= 2;
                    }
                    var newBuffer = new ArrayBuffer(newLength);
                    var curentView = this._i8View;
                    this._buffer = newBuffer;
                    this._cacheViews();
                    this._i8View.set(curentView);
                }
            };

            DataBuffer.prototype.clear = function () {
                this._length = 0;
                this._position = 0;
            };

            /**
            * For byte-sized reads and writes we can just go through the |Uint8Array| and not
            * the slower DataView.
            */
            DataBuffer.prototype.readBoolean = function () {
                if (this._position + 1 > this._length) {
                    throwEOFError();
                }
                return this._i8View[this._position++] !== 0;
            };

            DataBuffer.prototype.readByte = function () {
                if (this._position + 1 > this._length) {
                    throwEOFError();
                }
                return this._i8View[this._position++];
            };

            DataBuffer.prototype.readUnsignedByte = function () {
                if (this._position + 1 > this._length) {
                    throwEOFError();
                }
                return this._u8View[this._position++];
            };

            DataBuffer.prototype.readBytes = function (bytes, offset, length) {
                if (typeof offset === "undefined") { offset = 0; }
                if (typeof length === "undefined") { length = 0; }
                var pos = this._position;
                if (!offset) {
                    offset = 0;
                }
                if (!length) {
                    length = this._length - pos;
                }
                if (pos + length > this._length) {
                    throwEOFError();
                }
                if (bytes.length < offset + length) {
                    bytes._ensureCapacity(offset + length);
                    bytes.length = offset + length;
                }
                bytes._i8View.set(new Int8Array(this._buffer, pos, length), offset);
                this._position += length;
            };

            DataBuffer.prototype.readShort = function () {
                return this._get('getInt16', 2);
            };

            DataBuffer.prototype.readUnsignedShort = function () {
                return this._get('getUint16', 2);
            };

            DataBuffer.prototype.readInt = function () {
                if ((this._position & 0x3) === 0 && this._i32View) {
                    if (this._position + 4 > this._length) {
                        throwEOFError();
                    }
                    var value = this._i32View[this._position >> 2];
                    this._position += 4;
                    if (this._littleEndian !== DataBuffer._nativeLittleEndian) {
                        value = swap32(value);
                    }
                    return value;
                } else {
                    return this._get('getInt32', 4);
                }
            };

            DataBuffer.prototype.readUnsignedInt = function () {
                return this._get('getUint32', 4);
            };

            DataBuffer.prototype.readFloat = function () {
                if ((this._position & 0x3) === 0 && this._i32View) {
                    if (this._position + 4 > this._length) {
                        throwEOFError();
                    }
                    var bytes = this._i32View[this._position >> 2];
                    if (this._littleEndian !== DataBuffer._nativeLittleEndian) {
                        bytes = swap32(bytes);
                    }
                    var value = int32ToFloat(bytes);
                    this._position += 4;
                    return value;
                } else {
                    return this._get('getFloat32', 4);
                }
            };

            DataBuffer.prototype.readDouble = function () {
                return this._get('getFloat64', 8);
            };

            DataBuffer.prototype.writeBoolean = function (value) {
                value = !!value;
                var length = this._position + 1;
                this._ensureCapacity(length);
                this._i8View[this._position++] = value ? 1 : 0;
                if (length > this._length) {
                    this._length = length;
                }
            };

            DataBuffer.prototype.writeByte = function (value /*int*/ ) {
                var length = this._position + 1;
                this._ensureCapacity(length);
                this._i8View[this._position++] = value;
                if (length > this._length) {
                    this._length = length;
                }
            };

            DataBuffer.prototype.writeUnsignedByte = function (value /*uint*/ ) {
                var length = this._position + 1;
                this._ensureCapacity(length);
                this._u8View[this._position++] = value;
                if (length > this._length) {
                    this._length = length;
                }
            };

            DataBuffer.prototype.writeRawBytes = function (bytes) {
                var length = this._position + bytes.length;
                this._ensureCapacity(length);
                this._i8View.set(bytes, this._position);
                this._position = length;
                if (length > this._length) {
                    this._length = length;
                }
            };

            DataBuffer.prototype.writeBytes = function (bytes, offset, length) {
                if (typeof offset === "undefined") { offset = 0; }
                if (typeof length === "undefined") { length = 0; }
                if (arguments.length < 2) {
                    offset = 0;
                }
                if (arguments.length < 3) {
                    length = 0;
                }
                checkRange(offset, 0, bytes.length);
                checkRange(offset + length, 0, bytes.length);
                if (length === 0) {
                    length = bytes.length - offset;
                }
                this.writeRawBytes(new Int8Array(bytes._buffer, offset, length));
            };

            DataBuffer.prototype.writeShort = function (value /*int*/ ) {
                this._set('setInt16', 2, value);
            };

            DataBuffer.prototype.writeUnsignedShort = function (value /*uint*/ ) {
                this._set('setUint16', 2, value);
            };

            DataBuffer.prototype.writeInt = function (value /*int*/ ) {
                if ((this._position & 0x3) === 0 && this._i32View) {
                    if (this._littleEndian !== DataBuffer._nativeLittleEndian) {
                        value = swap32(value);
                    }
                    var length = this._position + 4;
                    this._ensureCapacity(length);
                    this._i32View[this._position >> 2] = value;
                    this._position += 4;
                    if (length > this._length) {
                        this._length = length;
                    }
                } else {
                    this._set('setInt32', 4, value);
                }
            };

            DataBuffer.prototype.writeUnsignedInt = function (value /*uint*/ ) {
                this._set('setUint32', 4, value);
            };

            DataBuffer.prototype.writeFloat = function (value) {
                if ((this._position & 0x3) === 0 && this._i32View) {
                    var length = this._position + 4;
                    this._ensureCapacity(length);
                    var bytes = floatToInt32(value);
                    if (this._littleEndian !== DataBuffer._nativeLittleEndian) {
                        bytes = swap32(bytes);
                    }
                    this._i32View[this._position >> 2] = bytes;
                    this._position += 4;
                    if (length > this._length) {
                        this._length = length;
                    }
                } else {
                    this._set('setFloat32', 4, value);
                }
            };

            DataBuffer.prototype.writeDouble = function (value) {
                this._set('setFloat64', 8, value);
            };

            DataBuffer.prototype.readRawBytes = function () {
                return new Int8Array(this._buffer, 0, this._length);
            };

            DataBuffer.prototype.writeUTF = function (value) {
                value = asCoerceString(value);
                var bytes = utf8decode(value);
                this.writeShort(bytes.length);
                this.writeRawBytes(bytes);
            };

            DataBuffer.prototype.writeUTFBytes = function (value) {
                value = asCoerceString(value);
                var bytes = utf8decode(value);
                this.writeRawBytes(bytes);
            };

            DataBuffer.prototype.readUTF = function () {
                return this.readUTFBytes(this.readShort());
            };

            DataBuffer.prototype.readUTFBytes = function (length /*uint*/ ) {
                length = length >>> 0;
                var pos = this._position;
                if (pos + length > this._length) {
                    throwEOFError();
                }
                this._position += length;
                return utf8encode(new Int8Array(this._buffer, pos, length));
            };

            Object.defineProperty(DataBuffer.prototype, "length", {
                get: function () {
                    return this._length;
                },
                set: function (value /*uint*/ ) {
                    value = value >>> 0;
                    var capacity = this._buffer.byteLength;

                    /* XXX: Do we need to zero the difference if length <= cap? */
                    if (value > capacity) {
                        this._ensureCapacity(value);
                    }
                    this._length = value;
                    this._position = clamp(this._position, 0, this._length);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(DataBuffer.prototype, "bytesAvailable", {
                get: function () {
                    return this._length - this._position;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DataBuffer.prototype, "position", {
                get: function () {
                    return this._position;
                },
                set: function (position /*uint*/ ) {
                    this._position = position >>> 0;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DataBuffer.prototype, "buffer", {
                get: function () {
                    return this._buffer;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DataBuffer.prototype, "bytes", {
                get: function () {
                    return this._u8View;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DataBuffer.prototype, "ints", {
                get: function () {
                    return this._i32View;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(DataBuffer.prototype, "objectEncoding", {
                get: function () {
                    return this._objectEncoding;
                },
                set: function (version /*uint*/ ) {
                    version = version >>> 0;
                    this._objectEncoding = version;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(DataBuffer.prototype, "endian", {
                get: function () {
                    return this._littleEndian ? "littleEndian" : "bigEndian";
                },
                set: function (type) {
                    type = asCoerceString(type);
                    if (type === "auto") {
                        this._littleEndian = DataBuffer._nativeLittleEndian;
                    } else {
                        this._littleEndian = type === "littleEndian";
                    }
                },
                enumerable: true,
                configurable: true
            });


            DataBuffer.prototype.toString = function () {
                return utf8encode(new Int8Array(this._buffer, 0, this._length));
            };

            DataBuffer.prototype.toBlob = function () {
                return new Blob([new Int8Array(this._buffer, this._position, this._length)]);
            };

            DataBuffer.prototype.writeMultiByte = function (value, charSet) {
                value = asCoerceString(value);
                charSet = asCoerceString(charSet);
                notImplemented("packageInternal flash.utils.ObjectOutput::writeMultiByte");
                return;
            };

            DataBuffer.prototype.readMultiByte = function (length /*uint*/ , charSet) {
                length = length >>> 0;
                charSet = asCoerceString(charSet);
                notImplemented("packageInternal flash.utils.ObjectInput::readMultiByte");
                return;
            };

            DataBuffer.prototype.getValue = function (name) {
                name = name | 0;
                if (name >= this._length) {
                    return undefined;
                }
                return this._u8View[name];
            };

            DataBuffer.prototype.setValue = function (name, value) {
                name = name | 0;
                var length = name + 1;
                this._ensureCapacity(length);
                this._u8View[name] = value;
                if (length > this._length) {
                    this._length = length;
                }
            };

            /**
            * Construct tables lazily only if needed in order to avoid startup cost.
            */
            DataBuffer._initializeTables = function () {
                if (DataBuffer._codeLengthOrder) {
                    return;
                }

                DataBuffer._codeLengthOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
                DataBuffer._distanceCodes = [];
                DataBuffer._distanceExtraBits = [];

                for (var i = 0, j = 0, code = 1; i < 30; ++i) {
                    DataBuffer._distanceCodes[i] = code;
                    code += 1 << (DataBuffer._distanceExtraBits[i] = ~~((j += (i > 2 ? 1 : 0)) / 2));
                }

                var bitLengths = [];
                for (var i = 0; i < 32; ++i) {
                    bitLengths[i] = 5;
                }

                DataBuffer._fixedDistanceTable = DataBuffer._makeHuffmanTable(bitLengths);

                DataBuffer._lengthCodes = [];
                DataBuffer._lengthExtraBits = [];
                for (var i = 0, j = 0, code = 3; i < 29; ++i) {
                    DataBuffer._lengthCodes[i] = code - (i == 28 ? 1 : 0);
                    code += 1 << (DataBuffer._lengthExtraBits[i] = ~~(((j += (i > 4 ? 1 : 0)) / 4) % 6));
                }

                for (var i = 0; i < 288; ++i) {
                    bitLengths[i] = i < 144 || i > 279 ? 8 : (i < 256 ? 9 : 7);
                }

                DataBuffer._fixedLiteralTable = DataBuffer._makeHuffmanTable(bitLengths);
            };

            DataBuffer._makeHuffmanTable = function (bitLengths) {
                var maxBits = Math.max.apply(null, bitLengths);
                var numLengths = bitLengths.length;
                var size = 1 << maxBits;
                var codes = new Uint32Array(size);
                for (var code = 0, len = 1, skip = 2; len <= maxBits; code <<= 1, ++len, skip <<= 1) {
                    for (var val = 0; val < numLengths; ++val) {
                        if (bitLengths[val] === len) {
                            var lsb = 0;
                            for (var i = 0; i < len; ++i) {
                                lsb = (lsb * 2) + ((code >> i) & 1);
                            }
                            for (var i = lsb; i < size; i += skip) {
                                codes[i] = (len << 16) | val;
                            }
                            ++code;
                        }
                    }
                }
                return { codes: codes, maxBits: maxBits };
            };

            DataBuffer.readBits = function (input, size) {
                var buffer = input._bitBuffer;
                var bufflen = input._bitLength;
                while (size > bufflen) {
                    buffer |= input.readUnsignedByte() << bufflen;
                    bufflen += 8;
                }
                input._bitBuffer = buffer >>> size;
                input._bitLength = bufflen - size;
                return buffer & ((1 << size) - 1);
            };

            DataBuffer.inflateBlock = function (input, output) {
                var readBits = DataBuffer.readBits;
                var header = readBits(input, 3);
                switch (header >> 1) {
                    case 0:
                        input._bitBuffer = input._bitLength = 0;
                        var len = input.readUnsignedShort();
                        var nlen = input.readUnsignedShort();

                        // release || assert((~nlen & 0xffff) === len, 'bad uncompressed block length', 'inflate');
                        if ((~nlen & 0xffff) !== len) {
                            throwCompressedDataError();
                        }
                        output.writeBytes(input, input.position, len);
                        input.position += len;
                        break;
                    case 1:
                        DataBuffer.inflate(input, output, DataBuffer._fixedLiteralTable, DataBuffer._fixedDistanceTable);
                        break;
                    case 2:
                        var bitLength = [];
                        var numLiteralCodes = readBits(input, 5) + 257;
                        var numDistanceCodes = readBits(input, 5) + 1;
                        var numCodes = numLiteralCodes + numDistanceCodes;
                        var numLengthCodes = readBits(input, 4) + 4;
                        for (var i = 0; i < 19; ++i) {
                            bitLength[DataBuffer._codeLengthOrder[i]] = i < numLengthCodes ? readBits(input, 3) : 0;
                        }
                        var codeLengthTable = DataBuffer._makeHuffmanTable(bitLength);
                        bitLength = [];
                        var i = 0;
                        var prev = 0;
                        while (i < numCodes) {
                            var j = 1;
                            var sym = DataBuffer.readCode(input, codeLengthTable);
                            switch (sym) {
                                case 16:
                                    j = readBits(input, 2) + 3;
                                    sym = prev;
                                    break;
                                case 17:
                                    j = readBits(input, 3) + 3;
                                    sym = 0;
                                    break;
                                case 18:
                                    j = readBits(input, 7) + 11;
                                    sym = 0;
                                    break;
                                default:
                                    prev = sym;
                            }
                            while (j--) {
                                bitLength[i++] = sym;
                            }
                        }
                        var distanceTable = DataBuffer._makeHuffmanTable(bitLength.splice(numLiteralCodes, numDistanceCodes));
                        var literalTable = DataBuffer._makeHuffmanTable(bitLength);
                        DataBuffer.inflate(input, output, literalTable, distanceTable);
                        break;
                    default:
                        Shumway.Debug.unexpected('unknown block type: inflate');
                }
            };

            DataBuffer.inflate = function (input, output, literalTable, distanceTable) {
                var readBits = DataBuffer.readBits;
                var readCode = DataBuffer.readCode;
                var lengthCodes = DataBuffer._lengthCodes;
                var lengthExtraBits = DataBuffer._lengthExtraBits;
                var distanceCodes = DataBuffer._distanceCodes;
                var distanceExtraBits = DataBuffer._distanceExtraBits;

                var sym;
                while ((sym = readCode(input, literalTable)) !== 256) {
                    if (sym < 256) {
                        output.writeUnsignedByte(sym);
                    } else {
                        sym -= 257;
                        var len = lengthCodes[sym] + readBits(input, lengthExtraBits[sym]);
                        sym = readCode(input, distanceTable);
                        var distance = distanceCodes[sym] + readBits(input, distanceExtraBits[sym]);
                        output.writeBytes(output, output.position - distance, len);
                    }
                }
            };

            DataBuffer.readCode = function (input, codeTable) {
                var buffer = input._bitBuffer;
                var bitlen = input._bitLength;
                var maxBits = codeTable.maxBits;
                while (maxBits > bitlen) {
                    buffer |= input.readUnsignedByte() << bitlen;
                    bitlen += 8;
                }
                var code = codeTable.codes[buffer & ((1 << maxBits) - 1)];
                var len = code >> 16;

                //release || assert(len, 'bad encoding', 'inflate');
                if (!len) {
                    throwCompressedDataError();
                }
                input._bitBuffer = buffer >>> len;
                input._bitLength = bitlen - len;
                return code & 0xffff;
            };

            DataBuffer.adler32 = function (data, start, end) {
                var a = 1;
                var b = 0;
                for (var i = start; i < end; ++i) {
                    a = (a + (data[i] & 0xff)) % 65521;
                    b = (b + a) % 65521;
                }
                return (b << 16) | a;
            };

            DataBuffer.prototype._compress = function (algorithm) {
                algorithm = asCoerceString(algorithm);
                DataBuffer._initializeTables();

                this._position = 0;
                var output = new DataBuffer();
                switch (algorithm) {
                    case 'zlib':
                        output.writeUnsignedByte(0x78);
                        output.writeUnsignedByte(0x9C);
                    case 'deflate':
                        output._littleEndian = true;

                        var len = this.length;

                        output._ensureCapacity(len + Math.ceil(len / 0xFFFF) * 5 + 4);

                        while (len > 0xFFFF) {
                            output.writeUnsignedByte(0x00);
                            output.writeUnsignedShort(0xFFFF);
                            output.writeUnsignedShort(0x0000);

                            output.writeBytes(this, this._position, 0xFFFF);
                            this._position += 0xFFFF;

                            len -= 0xFFFF;
                        }

                        output.writeUnsignedByte(0x00);
                        output.writeUnsignedShort(len);
                        output.writeUnsignedShort(~len & 0xffff);

                        output.writeBytes(this, this._position, len);

                        if (algorithm === 'zlib') {
                            output.writeUnsignedInt(DataBuffer.adler32(this._u8View, 0, this.length));
                        }
                        break;
                    default:
                        return;
                }

                this._ensureCapacity(output._u8View.length);
                this._u8View.set(output._u8View);
                this.length = output.length;
                this._position = 0;
            };

            DataBuffer.prototype._uncompress = function (algorithm) {
                algorithm = asCoerceString(algorithm);
                DataBuffer._initializeTables();

                var output = new DataBuffer();
                switch (algorithm) {
                    case 'zlib':
                        var header = this.readUnsignedShort();
                        if ((header & 0x0f00) !== 0x0800 || (header % 31) !== 0 || (header & 0x20)) {
                            throwCompressedDataError();
                        }
                    case 'deflate':
                        var littleEndian = this._littleEndian;
                        this._littleEndian = true;
                        while (this._position < this.length - 6) {
                            DataBuffer.inflateBlock(this, output);
                        }
                        this._littleEndian = littleEndian;
                        break;
                    default:
                        return;
                }

                this._ensureCapacity(output._u8View.length);
                this._u8View.set(output._u8View);
                this.length = output.length;
                this._position = 0;
            };
            DataBuffer._nativeLittleEndian = new Int8Array(new Int32Array([1]).buffer)[0] === 1;

            DataBuffer.INITIAL_SIZE = 128;

            DataBuffer._codeLengthOrder = null;
            DataBuffer._distanceCodes = null;
            DataBuffer._distanceExtraBits = null;

            DataBuffer._fixedLiteralTable = null;
            DataBuffer._fixedDistanceTable = null;

            DataBuffer._lengthCodes = null;
            DataBuffer._lengthExtraBits = null;
            return DataBuffer;
        })();
        ArrayUtilities.DataBuffer = DataBuffer;
    })(Shumway.ArrayUtilities || (Shumway.ArrayUtilities = {}));
    var ArrayUtilities = Shumway.ArrayUtilities;
})(Shumway || (Shumway = {}));
/**
* Copyright 2014 Mozilla Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Serialization format for shape data:
* (canonical, update this instead of anything else!)
*
* Shape data is serialized into a set of three buffers:
* - `commands`: a Uint8Array for commands
*  - valid values: [1-11] (i.e. one of the PathCommand enum values)
* - `coordinates`: an Int32Array for path coordinates*
*                  OR uint8 thickness iff the current command is PathCommand.LineStyleSolid
*  - valid values: the full range of 32bit numbers, representing x,y coordinates in twips
* - `styles`: a DataBuffer for style definitions
*  - valid values: structs for the various style definitions as described below
*
* (*: with one exception: to make various things faster, stroke widths are stored in the
* coordinates buffer, too.)
*
* All entries always contain all fields, default values aren't omitted.
*
* the various commands write the following sets of values into the various buffers:
*
* moveTo:
* commands:      PathCommand.MoveTo
* coordinates:   target x coordinate, in twips
*                target y coordinate, in twips
* styles:        n/a
*
* lineTo:
* commands:      PathCommand.LineTo
* coordinates:   target x coordinate, in twips
*                target y coordinate, in twips
* styles:        n/a
*
* curveTo:
* commands:      PathCommand.CurveTo
* coordinates:   control point x coordinate, in twips
*                control point y coordinate, in twips
*                target x coordinate, in twips
*                target y coordinate, in twips
* styles:        n/a
*
* cubicCurveTo:
* commands:      PathCommand.CubicCurveTo
* coordinates:   control point 1 x coordinate, in twips
*                control point 1 y coordinate, in twips
*                control point 2 x coordinate, in twips
*                control point 2 y coordinate, in twips
*                target x coordinate, in twips
*                target y coordinate, in twips
* styles:        n/a
*
* beginFill:
* commands:      PathCommand.BeginSolidFill
* coordinates:   n/a
* styles:        uint32 - RGBA color
*
* beginGradientFill:
* commands:      PathCommand.BeginGradientFill
* coordinates:   n/a
* Note: the style fields are ordered this way to optimize performance in the rendering backend
* Note: the style record has a variable length depending on the number of color stops
* styles:        uint8  - GradientType.{LINEAR,RADIAL}
*                fix8   - focalPoint [-128.0xff,127.0xff]
*                matrix - transform (see Matrix#writeExternal for details)
*                uint8  - colorStops (Number of color stop records that follow)
*                list of uint8,uint32 pairs:
*                    uint8  - ratio [0-0xff]
*                    uint32 - RGBA color
*                uint8  - SpreadMethod.{PAD,REFLECT,REPEAT}
*                uint8  - InterpolationMethod.{RGB,LINEAR_RGB}
*
* beginBitmapFill:
* commands:      PathCommand.BeginBitmapFill
* coordinates:   n/a
* styles:        uint32 - Index of the bitmapData object in the Graphics object's `textures`
*                         array
*                matrix - transform (see Matrix#writeExternal for details)
*                bool   - repeat
*                bool   - smooth
*
* lineStyle:
* commands:      PathCommand.LineStyleSolid
* coordinates:   uint32 - thickness (!)
* style:         uint32 - RGBA color
*                bool   - pixelHinting
*                uint8  - LineScaleMode, [0-3] see LineScaleMode.fromNumber for meaning
*                uint8  - CapsStyle, [0-2] see CapsStyle.fromNumber for meaning
*                uint8  - JointStyle, [0-2] see JointStyle.fromNumber for meaning
*                uint8  - miterLimit
*
* lineGradientStyle:
* commands:      PathCommand.LineStyleGradient
* coordinates:   n/a
* Note: the style fields are ordered this way to optimize performance in the rendering backend
* Note: the style record has a variable length depending on the number of color stops
* styles:        uint8  - GradientType.{LINEAR,RADIAL}
*                int8   - focalPoint [-128,127]
*                matrix - transform (see Matrix#writeExternal for details)
*                uint8  - colorStops (Number of color stop records that follow)
*                list of uint8,uint32 pairs:
*                    uint8  - ratio [0-0xff]
*                    uint32 - RGBA color
*                uint8  - SpreadMethod.{PAD,REFLECT,REPEAT}
*                uint8  - InterpolationMethod.{RGB,LINEAR_RGB}
*
* lineBitmapStyle:
* commands:      PathCommand.LineBitmapStyle
* coordinates:   n/a
* styles:        uint32 - Index of the bitmapData object in the Graphics object's `textures`
*                         array
*                matrix - transform (see Matrix#writeExternal for details)
*                bool   - repeat
*                bool   - smooth
*
* lineEnd:
* Note: emitted for invalid `lineStyle` calls
* commands:      PathCommand.LineEnd
* coordinates:   n/a
* styles:        n/a
*
*/
///<reference path='references.ts' />
var Shumway;
(function (Shumway) {
    var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    var ensureTypedArrayCapacity = Shumway.ArrayUtilities.ensureTypedArrayCapacity;

    var assert = Shumway.Debug.assert;

    /**
    * Used for (de-)serializing Graphics path data in defineShape, flash.display.Graphics
    * and the renderer.
    */
    (function (PathCommand) {
        PathCommand[PathCommand["BeginSolidFill"] = 1] = "BeginSolidFill";
        PathCommand[PathCommand["BeginGradientFill"] = 2] = "BeginGradientFill";
        PathCommand[PathCommand["BeginBitmapFill"] = 3] = "BeginBitmapFill";
        PathCommand[PathCommand["EndFill"] = 4] = "EndFill";
        PathCommand[PathCommand["LineStyleSolid"] = 5] = "LineStyleSolid";
        PathCommand[PathCommand["LineStyleGradient"] = 6] = "LineStyleGradient";
        PathCommand[PathCommand["LineStyleBitmap"] = 7] = "LineStyleBitmap";
        PathCommand[PathCommand["LineEnd"] = 8] = "LineEnd";
        PathCommand[PathCommand["MoveTo"] = 9] = "MoveTo";
        PathCommand[PathCommand["LineTo"] = 10] = "LineTo";
        PathCommand[PathCommand["CurveTo"] = 11] = "CurveTo";
        PathCommand[PathCommand["CubicCurveTo"] = 12] = "CubicCurveTo";
    })(Shumway.PathCommand || (Shumway.PathCommand = {}));
    var PathCommand = Shumway.PathCommand;

    (function (GradientType) {
        GradientType[GradientType["Linear"] = 0x10] = "Linear";
        GradientType[GradientType["Radial"] = 0x12] = "Radial";
    })(Shumway.GradientType || (Shumway.GradientType = {}));
    var GradientType = Shumway.GradientType;

    (function (GradientSpreadMethod) {
        GradientSpreadMethod[GradientSpreadMethod["Pad"] = 0] = "Pad";
        GradientSpreadMethod[GradientSpreadMethod["Reflect"] = 1] = "Reflect";
        GradientSpreadMethod[GradientSpreadMethod["Repeat"] = 2] = "Repeat";
    })(Shumway.GradientSpreadMethod || (Shumway.GradientSpreadMethod = {}));
    var GradientSpreadMethod = Shumway.GradientSpreadMethod;

    (function (GradientInterpolationMethod) {
        GradientInterpolationMethod[GradientInterpolationMethod["RGB"] = 0] = "RGB";
        GradientInterpolationMethod[GradientInterpolationMethod["LinearRGB"] = 1] = "LinearRGB";
    })(Shumway.GradientInterpolationMethod || (Shumway.GradientInterpolationMethod = {}));
    var GradientInterpolationMethod = Shumway.GradientInterpolationMethod;

    var PlainObjectShapeData = (function () {
        function PlainObjectShapeData(commands, commandsPosition, coordinates, coordinatesPosition, morphCoordinates, styles, stylesLength) {
            this.commands = commands;
            this.commandsPosition = commandsPosition;
            this.coordinates = coordinates;
            this.coordinatesPosition = coordinatesPosition;
            this.morphCoordinates = morphCoordinates;
            this.styles = styles;
            this.stylesLength = stylesLength;
        }
        return PlainObjectShapeData;
    })();
    Shumway.PlainObjectShapeData = PlainObjectShapeData;

    var DefaultSize;
    (function (DefaultSize) {
        DefaultSize[DefaultSize["Commands"] = 32] = "Commands";
        DefaultSize[DefaultSize["Coordinates"] = 128] = "Coordinates";
        DefaultSize[DefaultSize["Styles"] = 16] = "Styles";
    })(DefaultSize || (DefaultSize = {}));

    var ShapeData = (function () {
        function ShapeData(initialize) {
            if (typeof initialize === "undefined") { initialize = true; }
            if (initialize) {
                this.clear();
            }
        }
        ShapeData.FromPlainObject = function (source) {
            var data = new ShapeData(false);
            data.commands = source.commands;
            data.coordinates = source.coordinates;
            data.morphCoordinates = source.morphCoordinates;
            data.commandsPosition = source.commandsPosition;
            data.coordinatesPosition = source.coordinatesPosition;
            data.styles = DataBuffer.FromArrayBuffer(source.styles, source.stylesLength);
            data.styles.endian = 'auto';
            return data;
        };

        ShapeData.prototype.moveTo = function (x, y) {
            this.ensurePathCapacities(1, 2);
            this.commands[this.commandsPosition++] = 9 /* MoveTo */;
            this.coordinates[this.coordinatesPosition++] = x;
            this.coordinates[this.coordinatesPosition++] = y;
        };

        ShapeData.prototype.lineTo = function (x, y) {
            this.ensurePathCapacities(1, 2);
            this.commands[this.commandsPosition++] = 10 /* LineTo */;
            this.coordinates[this.coordinatesPosition++] = x;
            this.coordinates[this.coordinatesPosition++] = y;
        };

        ShapeData.prototype.curveTo = function (controlX, controlY, anchorX, anchorY) {
            this.ensurePathCapacities(1, 4);
            this.commands[this.commandsPosition++] = 11 /* CurveTo */;
            this.coordinates[this.coordinatesPosition++] = controlX;
            this.coordinates[this.coordinatesPosition++] = controlY;
            this.coordinates[this.coordinatesPosition++] = anchorX;
            this.coordinates[this.coordinatesPosition++] = anchorY;
        };

        ShapeData.prototype.cubicCurveTo = function (controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
            this.ensurePathCapacities(1, 6);
            this.commands[this.commandsPosition++] = 12 /* CubicCurveTo */;
            this.coordinates[this.coordinatesPosition++] = controlX1;
            this.coordinates[this.coordinatesPosition++] = controlY1;
            this.coordinates[this.coordinatesPosition++] = controlX2;
            this.coordinates[this.coordinatesPosition++] = controlY2;
            this.coordinates[this.coordinatesPosition++] = anchorX;
            this.coordinates[this.coordinatesPosition++] = anchorY;
        };

        ShapeData.prototype.beginFill = function (color) {
            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = 1 /* BeginSolidFill */;
            this.styles.writeUnsignedInt(color);
        };

        ShapeData.prototype.endFill = function () {
            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = 4 /* EndFill */;
        };

        ShapeData.prototype.endLine = function () {
            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = 8 /* LineEnd */;
        };

        ShapeData.prototype.lineStyle = function (thickness, color, pixelHinting, scaleMode, caps, joints, miterLimit) {
            release || assert(thickness === (thickness | 0), thickness >= 0 && thickness <= 0xff * 20);
            this.ensurePathCapacities(2, 0);
            this.commands[this.commandsPosition++] = 5 /* LineStyleSolid */;
            this.coordinates[this.coordinatesPosition++] = thickness;
            var styles = this.styles;
            styles.writeUnsignedInt(color);
            styles.writeBoolean(pixelHinting);
            styles.writeUnsignedByte(scaleMode);
            styles.writeUnsignedByte(caps);
            styles.writeUnsignedByte(joints);
            styles.writeUnsignedByte(miterLimit);
        };

        /**
        * Bitmaps are specified the same for fills and strokes, so we only need to serialize them
        * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
        * be one of BeginBitmapFill and LineStyleBitmap.
        */
        ShapeData.prototype.beginBitmap = function (pathCommand, bitmapId, matrix, repeat, smooth) {
            release || assert(pathCommand === 3 /* BeginBitmapFill */ || pathCommand === 7 /* LineStyleBitmap */);

            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = pathCommand;
            var styles = this.styles;
            styles.writeUnsignedInt(bitmapId);
            this._writeStyleMatrix(matrix);
            styles.writeBoolean(repeat);
            styles.writeBoolean(smooth);
        };

        /**
        * Gradients are specified the same for fills and strokes, so we only need to serialize them
        * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
        * be one of BeginGradientFill and LineStyleGradient.
        */
        ShapeData.prototype.beginGradient = function (pathCommand, colors, ratios, gradientType, matrix, spread, interpolation, focalPointRatio) {
            release || assert(pathCommand === 2 /* BeginGradientFill */ || pathCommand === 6 /* LineStyleGradient */);

            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = pathCommand;
            var styles = this.styles;
            styles.writeUnsignedByte(gradientType);
            release || assert(focalPointRatio === (focalPointRatio | 0));
            styles.writeShort(focalPointRatio);

            this._writeStyleMatrix(matrix);

            var colorStops = colors.length;
            styles.writeByte(colorStops);
            for (var i = 0; i < colorStops; i++) {
                // Ratio must be valid, otherwise we'd have bailed above.
                styles.writeUnsignedByte(ratios[i]);

                // Colors are coerced to uint32, with the highest byte stripped.
                styles.writeUnsignedInt(colors[i]);
            }

            styles.writeUnsignedByte(spread);
            styles.writeUnsignedByte(interpolation);
        };

        ShapeData.prototype.writeCommandAndCoordinates = function (command, x, y) {
            this.ensurePathCapacities(1, 2);
            this.commands[this.commandsPosition++] = command;
            this.coordinates[this.coordinatesPosition++] = x;
            this.coordinates[this.coordinatesPosition++] = y;
        };

        ShapeData.prototype.writeCoordinates = function (x, y) {
            this.ensurePathCapacities(0, 2);
            this.coordinates[this.coordinatesPosition++] = x;
            this.coordinates[this.coordinatesPosition++] = y;
        };

        ShapeData.prototype.writeMorphCoordinates = function (x, y) {
            this.morphCoordinates = ensureTypedArrayCapacity(this.morphCoordinates, this.coordinatesPosition);
            this.morphCoordinates[this.coordinatesPosition - 2] = x;
            this.morphCoordinates[this.coordinatesPosition - 1] = y;
        };

        ShapeData.prototype.clear = function () {
            this.commandsPosition = this.coordinatesPosition = 0;
            this.commands = new Uint8Array(32 /* Commands */);
            this.coordinates = new Int32Array(128 /* Coordinates */);
            this.styles = new DataBuffer(16 /* Styles */);
            this.styles.endian = 'auto';
        };

        ShapeData.prototype.isEmpty = function () {
            return this.commandsPosition === 0;
        };

        ShapeData.prototype.clone = function () {
            var copy = new ShapeData(false);
            copy.commands = new Uint8Array(this.commands);
            copy.commandsPosition = this.commandsPosition;
            copy.coordinates = new Int32Array(this.coordinates);
            copy.coordinatesPosition = this.coordinatesPosition;
            copy.styles = new DataBuffer(this.styles.length);
            copy.styles.writeRawBytes(this.styles.bytes);
            return copy;
        };

        ShapeData.prototype.toPlainObject = function () {
            return new PlainObjectShapeData(this.commands, this.commandsPosition, this.coordinates, this.coordinatesPosition, this.morphCoordinates, this.styles.buffer, this.styles.length);
        };

        Object.defineProperty(ShapeData.prototype, "buffers", {
            get: function () {
                var buffers = [this.commands.buffer, this.coordinates.buffer, this.styles.buffer];
                if (this.morphCoordinates) {
                    buffers.push(this.morphCoordinates.buffer);
                }
                return buffers;
            },
            enumerable: true,
            configurable: true
        });

        ShapeData.prototype._writeStyleMatrix = function (matrix) {
            var styles = this.styles;
            styles.writeFloat(matrix.a);
            styles.writeFloat(matrix.b);
            styles.writeFloat(matrix.c);
            styles.writeFloat(matrix.d);
            styles.writeFloat(matrix.tx);
            styles.writeFloat(matrix.ty);
        };

        ShapeData.prototype.ensurePathCapacities = function (numCommands, numCoordinates) {
            // ensureTypedArrayCapacity will hopefully be inlined, in which case the field writes
            // will be optimized out.
            this.commands = ensureTypedArrayCapacity(this.commands, this.commandsPosition + numCommands);
            this.coordinates = ensureTypedArrayCapacity(this.coordinates, this.coordinatesPosition + numCoordinates);
        };
        return ShapeData;
    })();
    Shumway.ShapeData = ShapeData;
})(Shumway || (Shumway = {}));
/* -*- Mode: js, js-indent-level: 2, indent-tabs-mode: nil, tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
* Copyright 2013 Mozilla Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License"),
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Shumway;
(function (Shumway) {
    (function (SWF) {
        (function (Parser) {
            (function (SwfTag) {
                SwfTag[SwfTag["CODE_END"] = 0] = "CODE_END";
                SwfTag[SwfTag["CODE_SHOW_FRAME"] = 1] = "CODE_SHOW_FRAME";
                SwfTag[SwfTag["CODE_DEFINE_SHAPE"] = 2] = "CODE_DEFINE_SHAPE";
                SwfTag[SwfTag["CODE_FREE_CHARACTER"] = 3] = "CODE_FREE_CHARACTER";
                SwfTag[SwfTag["CODE_PLACE_OBJECT"] = 4] = "CODE_PLACE_OBJECT";
                SwfTag[SwfTag["CODE_REMOVE_OBJECT"] = 5] = "CODE_REMOVE_OBJECT";
                SwfTag[SwfTag["CODE_DEFINE_BITS"] = 6] = "CODE_DEFINE_BITS";
                SwfTag[SwfTag["CODE_DEFINE_BUTTON"] = 7] = "CODE_DEFINE_BUTTON";
                SwfTag[SwfTag["CODE_JPEG_TABLES"] = 8] = "CODE_JPEG_TABLES";
                SwfTag[SwfTag["CODE_SET_BACKGROUND_COLOR"] = 9] = "CODE_SET_BACKGROUND_COLOR";
                SwfTag[SwfTag["CODE_DEFINE_FONT"] = 10] = "CODE_DEFINE_FONT";
                SwfTag[SwfTag["CODE_DEFINE_TEXT"] = 11] = "CODE_DEFINE_TEXT";
                SwfTag[SwfTag["CODE_DO_ACTION"] = 12] = "CODE_DO_ACTION";
                SwfTag[SwfTag["CODE_DEFINE_FONT_INFO"] = 13] = "CODE_DEFINE_FONT_INFO";
                SwfTag[SwfTag["CODE_DEFINE_SOUND"] = 14] = "CODE_DEFINE_SOUND";
                SwfTag[SwfTag["CODE_START_SOUND"] = 15] = "CODE_START_SOUND";
                SwfTag[SwfTag["CODE_STOP_SOUND"] = 16] = "CODE_STOP_SOUND";
                SwfTag[SwfTag["CODE_DEFINE_BUTTON_SOUND"] = 17] = "CODE_DEFINE_BUTTON_SOUND";
                SwfTag[SwfTag["CODE_SOUND_STREAM_HEAD"] = 18] = "CODE_SOUND_STREAM_HEAD";
                SwfTag[SwfTag["CODE_SOUND_STREAM_BLOCK"] = 19] = "CODE_SOUND_STREAM_BLOCK";
                SwfTag[SwfTag["CODE_DEFINE_BITS_LOSSLESS"] = 20] = "CODE_DEFINE_BITS_LOSSLESS";
                SwfTag[SwfTag["CODE_DEFINE_BITS_JPEG2"] = 21] = "CODE_DEFINE_BITS_JPEG2";
                SwfTag[SwfTag["CODE_DEFINE_SHAPE2"] = 22] = "CODE_DEFINE_SHAPE2";
                SwfTag[SwfTag["CODE_DEFINE_BUTTON_CXFORM"] = 23] = "CODE_DEFINE_BUTTON_CXFORM";
                SwfTag[SwfTag["CODE_PROTECT"] = 24] = "CODE_PROTECT";
                SwfTag[SwfTag["CODE_PATHS_ARE_POSTSCRIPT"] = 25] = "CODE_PATHS_ARE_POSTSCRIPT";
                SwfTag[SwfTag["CODE_PLACE_OBJECT2"] = 26] = "CODE_PLACE_OBJECT2";

                // INVALID                             = 27,
                SwfTag[SwfTag["CODE_REMOVE_OBJECT2"] = 28] = "CODE_REMOVE_OBJECT2";
                SwfTag[SwfTag["CODE_SYNC_FRAME"] = 29] = "CODE_SYNC_FRAME";

                // INVALID                             = 30,
                SwfTag[SwfTag["CODE_FREE_ALL"] = 31] = "CODE_FREE_ALL";
                SwfTag[SwfTag["CODE_DEFINE_SHAPE3"] = 32] = "CODE_DEFINE_SHAPE3";
                SwfTag[SwfTag["CODE_DEFINE_TEXT2"] = 33] = "CODE_DEFINE_TEXT2";
                SwfTag[SwfTag["CODE_DEFINE_BUTTON2"] = 34] = "CODE_DEFINE_BUTTON2";
                SwfTag[SwfTag["CODE_DEFINE_BITS_JPEG3"] = 35] = "CODE_DEFINE_BITS_JPEG3";
                SwfTag[SwfTag["CODE_DEFINE_BITS_LOSSLESS2"] = 36] = "CODE_DEFINE_BITS_LOSSLESS2";
                SwfTag[SwfTag["CODE_DEFINE_EDIT_TEXT"] = 37] = "CODE_DEFINE_EDIT_TEXT";
                SwfTag[SwfTag["CODE_DEFINE_VIDEO"] = 38] = "CODE_DEFINE_VIDEO";
                SwfTag[SwfTag["CODE_DEFINE_SPRITE"] = 39] = "CODE_DEFINE_SPRITE";
                SwfTag[SwfTag["CODE_NAME_CHARACTER"] = 40] = "CODE_NAME_CHARACTER";
                SwfTag[SwfTag["CODE_PRODUCT_INFO"] = 41] = "CODE_PRODUCT_INFO";
                SwfTag[SwfTag["CODE_DEFINE_TEXT_FORMAT"] = 42] = "CODE_DEFINE_TEXT_FORMAT";
                SwfTag[SwfTag["CODE_FRAME_LABEL"] = 43] = "CODE_FRAME_LABEL";
                SwfTag[SwfTag["CODE_DEFINE_BEHAVIOUR"] = 44] = "CODE_DEFINE_BEHAVIOUR";
                SwfTag[SwfTag["CODE_SOUND_STREAM_HEAD2"] = 45] = "CODE_SOUND_STREAM_HEAD2";
                SwfTag[SwfTag["CODE_DEFINE_MORPH_SHAPE"] = 46] = "CODE_DEFINE_MORPH_SHAPE";
                SwfTag[SwfTag["CODE_FRAME_TAG"] = 47] = "CODE_FRAME_TAG";
                SwfTag[SwfTag["CODE_DEFINE_FONT2"] = 48] = "CODE_DEFINE_FONT2";
                SwfTag[SwfTag["CODE_GEN_COMMAND"] = 49] = "CODE_GEN_COMMAND";
                SwfTag[SwfTag["CODE_DEFINE_COMMAND_OBJ"] = 50] = "CODE_DEFINE_COMMAND_OBJ";
                SwfTag[SwfTag["CODE_CHARACTER_SET"] = 51] = "CODE_CHARACTER_SET";
                SwfTag[SwfTag["CODE_FONT_REF"] = 52] = "CODE_FONT_REF";
                SwfTag[SwfTag["CODE_DEFINE_FUNCTION"] = 53] = "CODE_DEFINE_FUNCTION";
                SwfTag[SwfTag["CODE_PLACE_FUNCTION"] = 54] = "CODE_PLACE_FUNCTION";
                SwfTag[SwfTag["CODE_GEN_TAG_OBJECTS"] = 55] = "CODE_GEN_TAG_OBJECTS";
                SwfTag[SwfTag["CODE_EXPORT_ASSETS"] = 56] = "CODE_EXPORT_ASSETS";
                SwfTag[SwfTag["CODE_IMPORT_ASSETS"] = 57] = "CODE_IMPORT_ASSETS";
                SwfTag[SwfTag["CODE_ENABLE_DEBUGGER"] = 58] = "CODE_ENABLE_DEBUGGER";
                SwfTag[SwfTag["CODE_DO_INIT_ACTION"] = 59] = "CODE_DO_INIT_ACTION";
                SwfTag[SwfTag["CODE_DEFINE_VIDEO_STREAM"] = 60] = "CODE_DEFINE_VIDEO_STREAM";
                SwfTag[SwfTag["CODE_VIDEO_FRAME"] = 61] = "CODE_VIDEO_FRAME";
                SwfTag[SwfTag["CODE_DEFINE_FONT_INFO2"] = 62] = "CODE_DEFINE_FONT_INFO2";
                SwfTag[SwfTag["CODE_DEBUG_ID"] = 63] = "CODE_DEBUG_ID";
                SwfTag[SwfTag["CODE_ENABLE_DEBUGGER2"] = 64] = "CODE_ENABLE_DEBUGGER2";
                SwfTag[SwfTag["CODE_SCRIPT_LIMITS"] = 65] = "CODE_SCRIPT_LIMITS";
                SwfTag[SwfTag["CODE_SET_TAB_INDEX"] = 66] = "CODE_SET_TAB_INDEX";

                // CODE_DEFINE_SHAPE4                  = 67,
                // INVALID                             = 68,
                SwfTag[SwfTag["CODE_FILE_ATTRIBUTES"] = 69] = "CODE_FILE_ATTRIBUTES";
                SwfTag[SwfTag["CODE_PLACE_OBJECT3"] = 70] = "CODE_PLACE_OBJECT3";
                SwfTag[SwfTag["CODE_IMPORT_ASSETS2"] = 71] = "CODE_IMPORT_ASSETS2";
                SwfTag[SwfTag["CODE_DO_ABC_"] = 72] = "CODE_DO_ABC_";
                SwfTag[SwfTag["CODE_DEFINE_FONT_ALIGN_ZONES"] = 73] = "CODE_DEFINE_FONT_ALIGN_ZONES";
                SwfTag[SwfTag["CODE_CSM_TEXT_SETTINGS"] = 74] = "CODE_CSM_TEXT_SETTINGS";
                SwfTag[SwfTag["CODE_DEFINE_FONT3"] = 75] = "CODE_DEFINE_FONT3";
                SwfTag[SwfTag["CODE_SYMBOL_CLASS"] = 76] = "CODE_SYMBOL_CLASS";
                SwfTag[SwfTag["CODE_METADATA"] = 77] = "CODE_METADATA";
                SwfTag[SwfTag["CODE_DEFINE_SCALING_GRID"] = 78] = "CODE_DEFINE_SCALING_GRID";

                // INVALID                             = 79,
                // INVALID                             = 80,
                // INVALID                             = 81,
                SwfTag[SwfTag["CODE_DO_ABC"] = 82] = "CODE_DO_ABC";
                SwfTag[SwfTag["CODE_DEFINE_SHAPE4"] = 83] = "CODE_DEFINE_SHAPE4";
                SwfTag[SwfTag["CODE_DEFINE_MORPH_SHAPE2"] = 84] = "CODE_DEFINE_MORPH_SHAPE2";

                // INVALID                             = 85,
                SwfTag[SwfTag["CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA"] = 86] = "CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA";
                SwfTag[SwfTag["CODE_DEFINE_BINARY_DATA"] = 87] = "CODE_DEFINE_BINARY_DATA";
                SwfTag[SwfTag["CODE_DEFINE_FONT_NAME"] = 88] = "CODE_DEFINE_FONT_NAME";
                SwfTag[SwfTag["CODE_START_SOUND2"] = 89] = "CODE_START_SOUND2";
                SwfTag[SwfTag["CODE_DEFINE_BITS_JPEG4"] = 90] = "CODE_DEFINE_BITS_JPEG4";
                SwfTag[SwfTag["CODE_DEFINE_FONT4"] = 91] = "CODE_DEFINE_FONT4";
            })(Parser.SwfTag || (Parser.SwfTag = {}));
            var SwfTag = Parser.SwfTag;

            (function (PlaceObjectFlags) {
                PlaceObjectFlags[PlaceObjectFlags["Reserved"] = 0x800] = "Reserved";
                PlaceObjectFlags[PlaceObjectFlags["OpaqueBackground"] = 0x400] = "OpaqueBackground";
                PlaceObjectFlags[PlaceObjectFlags["HasVisible"] = 0x200] = "HasVisible";
                PlaceObjectFlags[PlaceObjectFlags["HasImage"] = 0x100] = "HasImage";
                PlaceObjectFlags[PlaceObjectFlags["HasClassName"] = 0x800] = "HasClassName";
                PlaceObjectFlags[PlaceObjectFlags["HasCacheAsBitmap"] = 0x400] = "HasCacheAsBitmap";
                PlaceObjectFlags[PlaceObjectFlags["HasBlendMode"] = 0x200] = "HasBlendMode";
                PlaceObjectFlags[PlaceObjectFlags["HasFilterList"] = 0x100] = "HasFilterList";
                PlaceObjectFlags[PlaceObjectFlags["HasClipActions"] = 0x080] = "HasClipActions";
                PlaceObjectFlags[PlaceObjectFlags["HasClipDepth"] = 0x040] = "HasClipDepth";
                PlaceObjectFlags[PlaceObjectFlags["HasName"] = 0x020] = "HasName";
                PlaceObjectFlags[PlaceObjectFlags["HasRatio"] = 0x010] = "HasRatio";
                PlaceObjectFlags[PlaceObjectFlags["HasColorTransform"] = 0x008] = "HasColorTransform";
                PlaceObjectFlags[PlaceObjectFlags["HasMatrix"] = 0x004] = "HasMatrix";
                PlaceObjectFlags[PlaceObjectFlags["HasCharacter"] = 0x002] = "HasCharacter";
                PlaceObjectFlags[PlaceObjectFlags["Move"] = 0x001] = "Move";
            })(Parser.PlaceObjectFlags || (Parser.PlaceObjectFlags = {}));
            var PlaceObjectFlags = Parser.PlaceObjectFlags;
        })(SWF.Parser || (SWF.Parser = {}));
        var Parser = SWF.Parser;
    })(Shumway.SWF || (Shumway.SWF = {}));
    var SWF = Shumway.SWF;
})(Shumway || (Shumway = {}));
/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
* Copyright 2014 Mozilla Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Shumway;
(function (Shumway) {
    var unexpected = Shumway.Debug.unexpected;

    var BinaryFileReader = (function () {
        function BinaryFileReader(url, method, mimeType, data) {
            this.url = url;
            this.method = method;
            this.mimeType = mimeType;
            this.data = data;
        }
        BinaryFileReader.prototype.readAll = function (progress, complete) {
            var url = this.url;
            var xhr = new XMLHttpRequest({ mozSystem: true });
            var async = true;
            xhr.open(this.method || "GET", this.url, async);
            xhr.responseType = "arraybuffer";
            if (progress) {
                xhr.onprogress = function (event) {
                    progress(xhr.response, event.loaded, event.total);
                };
            }
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState === 4) {
                    if (xhr.status !== 200 && xhr.status !== 0 || xhr.response === null) {
                        unexpected("Path: " + url + " not found.");
                        complete(null, xhr.statusText);
                        return;
                    }
                    complete(xhr.response);
                }
            };
            if (this.mimeType) {
                xhr.setRequestHeader("Content-Type", this.mimeType);
            }
            xhr.send(this.data || null);
        };

        BinaryFileReader.prototype.readAsync = function (ondata, onerror, onopen, oncomplete, onhttpstatus) {
            var xhr = new XMLHttpRequest({ mozSystem: true });
            var url = this.url;
            xhr.open(this.method || "GET", url, true);
            xhr.responseType = 'moz-chunked-arraybuffer';
            var isNotProgressive = xhr.responseType !== 'moz-chunked-arraybuffer';
            if (isNotProgressive) {
                xhr.responseType = 'arraybuffer';
            }
            xhr.onprogress = function (e) {
                if (isNotProgressive)
                    return;
                ondata(new Uint8Array(xhr.response), { loaded: e.loaded, total: e.total });
            };
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState === 2 && onhttpstatus) {
                    onhttpstatus(url, xhr.status, xhr.getAllResponseHeaders());
                }
                if (xhr.readyState === 4) {
                    if (xhr.status !== 200 && xhr.status !== 0 || xhr.response === null) {
                        onerror(xhr.statusText);
                        return;
                    }
                    if (isNotProgressive) {
                        var buffer = xhr.response;
                        ondata(new Uint8Array(buffer), { loaded: 0, total: buffer.byteLength });
                    }
                    if (oncomplete) {
                        oncomplete();
                    }
                }
            };
            if (this.mimeType) {
                xhr.setRequestHeader("Content-Type", this.mimeType);
            }
            xhr.send(this.data || null);
            if (onopen) {
                onopen();
            }
        };
        return BinaryFileReader;
    })();
    Shumway.BinaryFileReader = BinaryFileReader;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    /**
    * Copyright 2014 Mozilla Foundation
    *
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    * http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    */
    (function (Remoting) {
        /**
        * Remoting phases.
        */
        (function (RemotingPhase) {
            /**
            * Objects are serialized. During this phase all reachable remotable objects (all objects
            * reachable from a root set) that are dirty are remoted. This includes all dirty object
            * properties except for dirty references.
            */
            RemotingPhase[RemotingPhase["Objects"] = 0] = "Objects";

            /**
            * Object references are serialized. All objects that are referred to have already been
            * remoted at this point.
            */
            RemotingPhase[RemotingPhase["References"] = 1] = "References";
        })(Remoting.RemotingPhase || (Remoting.RemotingPhase = {}));
        var RemotingPhase = Remoting.RemotingPhase;

        (function (MessageBits) {
            MessageBits[MessageBits["HasMatrix"] = 0x0001] = "HasMatrix";
            MessageBits[MessageBits["HasBounds"] = 0x0002] = "HasBounds";
            MessageBits[MessageBits["HasChildren"] = 0x0004] = "HasChildren";
            MessageBits[MessageBits["HasColorTransform"] = 0x0008] = "HasColorTransform";
            MessageBits[MessageBits["HasClipRect"] = 0x0010] = "HasClipRect";
            MessageBits[MessageBits["HasMiscellaneousProperties"] = 0x0020] = "HasMiscellaneousProperties";
            MessageBits[MessageBits["HasMask"] = 0x0040] = "HasMask";
            MessageBits[MessageBits["HasClip"] = 0x0080] = "HasClip";
        })(Remoting.MessageBits || (Remoting.MessageBits = {}));
        var MessageBits = Remoting.MessageBits;

        (function (IDMask) {
            IDMask[IDMask["None"] = 0x00000000] = "None";
            IDMask[IDMask["Asset"] = 0x08000000] = "Asset";
        })(Remoting.IDMask || (Remoting.IDMask = {}));
        var IDMask = Remoting.IDMask;

        /**
        * Serialization Format. All commands start with a message tag.
        */
        (function (MessageTag) {
            MessageTag[MessageTag["EOF"] = 0] = "EOF";

            /**
            * id                   int32,
            * hasBits              int32,
            * matrix               Matrix,
            * colorMatrix          ColorMatrix,
            * mask                 int32,
            * misc
            *   blendMode          int32,
            *   visible            int32
            *
            * @type {number}
            */
            MessageTag[MessageTag["UpdateFrame"] = 100] = "UpdateFrame";
            MessageTag[MessageTag["UpdateGraphics"] = 101] = "UpdateGraphics";
            MessageTag[MessageTag["UpdateBitmapData"] = 102] = "UpdateBitmapData";
            MessageTag[MessageTag["UpdateTextContent"] = 103] = "UpdateTextContent";
            MessageTag[MessageTag["UpdateStage"] = 104] = "UpdateStage";

            MessageTag[MessageTag["RegisterFont"] = 200] = "RegisterFont";
            MessageTag[MessageTag["DrawToBitmap"] = 201] = "DrawToBitmap";

            MessageTag[MessageTag["MouseEvent"] = 300] = "MouseEvent";
            MessageTag[MessageTag["KeyboardEvent"] = 301] = "KeyboardEvent";
            MessageTag[MessageTag["FocusEvent"] = 302] = "FocusEvent";
        })(Remoting.MessageTag || (Remoting.MessageTag = {}));
        var MessageTag = Remoting.MessageTag;

        /**
        * Dictates how color transforms are encoded. The majority of color transforms are
        * either identity or only modify the alpha multiplier, so we can encode these more
        * efficiently.
        */
        (function (ColorTransformEncoding) {
            /**
            * Identity, no need to serialize all the fields.
            */
            ColorTransformEncoding[ColorTransformEncoding["Identity"] = 0] = "Identity";

            /**
            * Identity w/ AlphaMultiplier, only the alpha multiplier is serialized.
            */
            ColorTransformEncoding[ColorTransformEncoding["AlphaMultiplierOnly"] = 1] = "AlphaMultiplierOnly";

            /**
            * All fields are serialized.
            */
            ColorTransformEncoding[ColorTransformEncoding["All"] = 2] = "All";
        })(Remoting.ColorTransformEncoding || (Remoting.ColorTransformEncoding = {}));
        var ColorTransformEncoding = Remoting.ColorTransformEncoding;

        Remoting.MouseEventNames = [
            'click',
            'dblclick',
            'mousedown',
            'mousemove',
            'mouseup'
        ];

        Remoting.KeyboardEventNames = [
            'keydown',
            'keypress',
            'keyup'
        ];

        (function (KeyboardEventFlags) {
            KeyboardEventFlags[KeyboardEventFlags["CtrlKey"] = 0x0001] = "CtrlKey";
            KeyboardEventFlags[KeyboardEventFlags["AltKey"] = 0x0002] = "AltKey";
            KeyboardEventFlags[KeyboardEventFlags["ShiftKey"] = 0x0004] = "ShiftKey";
        })(Remoting.KeyboardEventFlags || (Remoting.KeyboardEventFlags = {}));
        var KeyboardEventFlags = Remoting.KeyboardEventFlags;

        (function (FocusEventType) {
            FocusEventType[FocusEventType["DocumentHidden"] = 0] = "DocumentHidden";
            FocusEventType[FocusEventType["DocumentVisible"] = 1] = "DocumentVisible";
            FocusEventType[FocusEventType["WindowBlur"] = 2] = "WindowBlur";
            FocusEventType[FocusEventType["WindowFocus"] = 3] = "WindowFocus";
        })(Remoting.FocusEventType || (Remoting.FocusEventType = {}));
        var FocusEventType = Remoting.FocusEventType;
    })(Shumway.Remoting || (Shumway.Remoting = {}));
    var Remoting = Shumway.Remoting;
})(Shumway || (Shumway = {}));
/*
* Copyright 2014 Mozilla Foundation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
///<reference path='es6-promises.d.ts' />
///<reference path='utilities.ts' />
///<reference path='options.ts' />
///<reference path='settings.ts'/>
///<reference path='metrics.ts' />
///<reference path='dataBuffer.ts' />
///<reference path='ShapeData.ts' />
///<reference path='SWFTags.ts' />
///<reference path='binaryFileReader.ts' />
///<reference path='remoting.ts' />
//# sourceMappingURL=base.js.map
