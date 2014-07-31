/// <reference path="../../src/base/es6-promises.d.ts" />
declare var jsGlobal: any;
declare var inBrowser: boolean;
declare var putstr: any;
/** @const */ 
declare var release: boolean;
/** @const */ 
declare var profile: boolean;
declare var dateNow: () => number;
declare function log(message?: any, ...optionalParams: any[]): void;
declare function warn(message?: any, ...optionalParams: any[]): void;
interface String {
    padRight(c: string, n: number): string;
    padLeft(c: string, n: number): string;
    endsWith(s: string): boolean;
}
interface Function {
    boundTo: boolean;
}
interface Array<T> {
    runtimeId: number;
}
interface Math {
    imul(a: number, b: number): number;
    /**
    * Returns the number of leading zeros of a number.
    * @param x A numeric expression.
    */
    clz32(x: number): number;
}
interface Error {
    stack: string;
}
interface Uint8ClampedArray extends ArrayBufferView {
    BYTES_PER_ELEMENT: number;
    length: number;
    [index: number]: number;
    get(index: number): number;
    set(index: number, value: number): void;
    set(array: Uint8Array, offset?: number): void;
    set(array: number[], offset?: number): void;
    subarray(begin: number, end?: number): Uint8ClampedArray;
}
declare var Uint8ClampedArray: {
    prototype: Uint8ClampedArray;
    BYTES_PER_ELEMENT: number;
    new(length: number): Uint8ClampedArray;
    new(array: Uint8Array): Uint8ClampedArray;
    new(array: number[]): Uint8ClampedArray;
    new(buffer: ArrayBuffer, byteOffset?: number, length?: number): Uint8ClampedArray;
};
declare module Shumway {
    enum CharacterCodes {
        _0 = 48,
        _1 = 49,
        _2 = 50,
        _3 = 51,
        _4 = 52,
        _5 = 53,
        _6 = 54,
        _7 = 55,
        _8 = 56,
        _9 = 57,
    }
    /**
    * The buffer length required to contain any unsigned 32-bit integer.
    */
    /** @const */ 
    var UINT32_CHAR_BUFFER_LENGTH: number;
    /** @const */ 
    var UINT32_MAX: number;
    /** @const */ 
    var UINT32_MAX_DIV_10: number;
    /** @const */ 
    var UINT32_MAX_MOD_10: number;
    function isString(value: any): boolean;
    function isFunction(value: any): boolean;
    function isNumber(value: any): boolean;
    function isInteger(value: any): boolean;
    function isArray(value: any): boolean;
    function isNumberOrString(value: any): boolean;
    function isObject(value: any): boolean;
    function toNumber(x: any): number;
    function isNumericString(value: string): boolean;
    /**
    * Whether the specified |value| is a number or the string representation of a number.
    */
    function isNumeric(value: any): boolean;
    /**
    * Whether the specified |value| is an unsigned 32 bit number expressed as a number
    * or string.
    */
    function isIndex(value: any): boolean;
    function isNullOrUndefined(value: any): boolean;
    module Debug {
        function backtrace(): any;
        function error(message: string): void;
        function assert(condition: any, ...args: any[]): void;
        function assertUnreachable(msg: string): void;
        function assertNotImplemented(condition: boolean, message: string): void;
        function warning(message: string): void;
        function notUsed(message: string): void;
        function notImplemented(message: string): void;
        function abstractMethod(message: string): void;
        function somewhatImplemented(message: string): void;
        function unexpected(message?: any): void;
        function untested(message?: any): void;
    }
    function getTicks(): number;
    interface Map<T> {
        [name: string]: T;
    }
    module ArrayUtilities {
        /**
        * Pops elements from a source array into a destination array. This avoids
        * allocations and should be faster. The elements in the destination array
        * are pushed in the same order as they appear in the source array:
        *
        * popManyInto([1, 2, 3], 2, dst) => dst = [2, 3]
        */
        function popManyInto(src: any[], count: number, dst: any[]): void;
        function popMany<T>(array: T[], count: number): T[];
        /**
        * Just deletes several array elements from the end of the list.
        */
        function popManyIntoVoid(array: any[], count: number): void;
        function pushMany(dst: any[], src: any[]): void;
        function top(array: any[]): any;
        function last(array: any[]): any;
        function peek(array: any[]): any;
        function indexOf<T>(array: T[], value: T): number;
        function pushUnique<T>(array: T[], value: T): number;
        function unique<T>(array: T[]): T[];
        function copyFrom(dst: any[], src: any[]): void;
        /**
        * Makes sure that a typed array has the requested capacity. If required, it creates a new
        * instance of the array's class with a power-of-two capacity at least as large as required.
        *
        * Note: untyped because generics with constraints are pretty annoying.
        */
        function ensureTypedArrayCapacity(array: any, capacity: number): any;
        class ArrayWriter {
            public _u8: Uint8Array;
            public _u16: Uint16Array;
            public _i32: Int32Array;
            public _f32: Float32Array;
            public _u32: Uint32Array;
            public _offset: number;
            constructor(initialCapacity?: number);
            public reset(): void;
            public offset : number;
            public getIndex(size: number): number;
            public ensureAdditionalCapacity(size: any): void;
            public ensureCapacity(minCapacity: number): void;
            public writeInt(v: number): void;
            public writeIntAt(v: number, offset: number): void;
            public writeIntUnsafe(v: number): void;
            public writeFloat(v: number): void;
            public writeFloatUnsafe(v: number): void;
            public write4Floats(a: number, b: number, c: number, d: number): void;
            public write4FloatsUnsafe(a: number, b: number, c: number, d: number): void;
            public write6Floats(a: number, b: number, c: number, d: number, e: number, f: number): void;
            public write6FloatsUnsafe(a: number, b: number, c: number, d: number, e: number, f: number): void;
            public subF32View(): Float32Array;
            public subI32View(): Int32Array;
            public subU16View(): Uint16Array;
            public subU8View(): Uint8Array;
            public hashWords(hash: number, offset: number, length: number): number;
            public reserve(size: number): void;
        }
    }
    class ArrayReader {
        public _u8: Uint8Array;
        public _u16: Uint16Array;
        public _i32: Int32Array;
        public _f32: Float32Array;
        public _u32: Uint32Array;
        public _offset: number;
        constructor(buffer: ArrayBuffer);
        public offset : number;
        public isEmpty(): boolean;
        public readInt(): number;
        public readFloat(): number;
    }
    module ObjectUtilities {
        function boxValue(value: any): any;
        function toKeyValueArray(object: Object): any[];
        function isPrototypeWriteable(object: Object): boolean;
        function hasOwnProperty(object: Object, name: string): boolean;
        function propertyIsEnumerable(object: Object, name: string): boolean;
        function getOwnPropertyDescriptor(object: Object, name: string): PropertyDescriptor;
        function hasOwnGetter(object: Object, name: string): boolean;
        function getOwnGetter(object: Object, name: string): () => any;
        function hasOwnSetter(object: Object, name: string): boolean;
        function createObject(prototype: Object): any;
        function createEmptyObject(): any;
        function createMap<T>(): Map<T>;
        function createArrayMap<T>(): Map<T>;
        function defineReadOnlyProperty(object: Object, name: string, value: any): void;
        function getOwnPropertyDescriptors(object: Object): Map<PropertyDescriptor>;
        function cloneObject(object: Object): Object;
        function copyProperties(object: Object, template: Object): void;
        function copyOwnProperties(object: Object, template: Object): void;
        function copyOwnPropertyDescriptors(object: Object, template: Object): void;
        function getLatestGetterOrSetterPropertyDescriptor(object: any, name: any): PropertyDescriptor;
        function defineNonEnumerableGetterOrSetter(obj: any, name: any, value: any, isGetter: any): void;
        function defineNonEnumerableGetter(obj: any, name: any, getter: any): void;
        function defineNonEnumerableSetter(obj: any, name: any, setter: any): void;
        function defineNonEnumerableProperty(obj: any, name: any, value: any): void;
        function defineNonEnumerableForwardingProperty(obj: any, name: any, otherName: any): void;
        function defineNewNonEnumerableProperty(obj: any, name: any, value: any): void;
    }
    module FunctionUtilities {
        function makeForwardingGetter(target: string): () => any;
        function makeForwardingSetter(target: string): (any: any) => void;
        /**
        * Attaches a property to the bound function so we can detect when if it
        * ever gets rebound.
        */
        function bindSafely(fn: Function, object: Object): any;
    }
    module StringUtilities {
        function memorySizeToString(value: number): string;
        function toSafeString(value: any): string;
        function toSafeArrayString(array: any): string;
        function utf8decode(str: string): Uint8Array;
        function utf8encode(bytes: Uint8Array): string;
        function base64ArrayBuffer(arrayBuffer: ArrayBuffer): string;
        function escapeString(str: string): string;
        /**
        * Workaround for max stack size limit.
        */
        function fromCharCodeArray(buffer: Uint8Array): string;
        function variableLengthEncodeInt32(n: any): string;
        function toEncoding(n: any): string;
        function fromEncoding(s: any): any;
        function variableLengthDecodeInt32(s: any): number;
        function trimMiddle(s: string, maxLength: number): string;
        function multiple(s: string, count: number): string;
        function indexOfAny(s: string, chars: string[], position: number): number;
    }
    module HashUtilities {
        function hashBytesTo32BitsMD5(data: Uint8Array, offset: number, length: number): number;
        function hashBytesTo32BitsAdler(data: Uint8Array, offset: number, length: number): number;
    }
    /**
    * Marsaglia's algorithm, adapted from V8. Use this if you want a deterministic random number.
    */
    class Random {
        private static _state;
        static seed(seed: number): void;
        static next(): number;
    }
    interface IReferenceCountable {
        _referenceCount: number;
        _addReference(): any;
        _removeReference(): any;
    }
    class WeakList<T extends IReferenceCountable> {
        private _map;
        private _list;
        constructor();
        public clear(): void;
        public push(value: T): void;
        public forEach(callback: (value: T) => void): void;
        public length : number;
    }
    module NumberUtilities {
        function pow2(exponent: number): number;
        function clamp(value: number, min: number, max: number): number;
        /**
        * Rounds *.5 to the nearest even number.
        * See https://en.wikipedia.org/wiki/Rounding#Round_half_to_even for details.
        */
        function roundHalfEven(value: number): number;
        function epsilonEquals(value: number, other: number): boolean;
    }
    enum Numbers {
        MaxU16 = 65535,
        MaxI16 = 32767,
        MinI16,
    }
    module IntegerUtilities {
        /**
        * Convert a float into 32 bits.
        */
        function floatToInt32(v: number): number;
        /**
        * Convert 32 bits into a float.
        */
        function int32ToFloat(i: number): number;
        /**
        * Swap the bytes of a 16 bit number.
        */
        function swap16(i: number): number;
        /**
        * Swap the bytes of a 32 bit number.
        */
        function swap32(i: number): number;
        /**
        * Converts a number to s8.u8 fixed point representation.
        */
        function toS8U8(v: number): number;
        /**
        * Converts a number from s8.u8 fixed point representation.
        */
        function fromS8U8(i: number): number;
        /**
        * Round trips a number through s8.u8 conversion.
        */
        function clampS8U8(v: number): number;
        /**
        * Converts a number to signed 16 bits.
        */
        function toS16(v: number): number;
        function bitCount(i: number): number;
        function ones(i: number): number;
        function trailingZeros(i: number): number;
        function getFlags(i: number, flags: string[]): string;
        function isPowerOfTwo(x: number): boolean;
        function roundToMultipleOfFour(x: number): number;
        function nearestPowerOfTwo(x: number): number;
        function roundToMultipleOfPowerOfTwo(i: number, powerOfTwo: number): number;
    }
    module GeometricUtilities {
        /**
        * Crossing numeber tests to check if a point is inside a polygon. The polygon is given as
        * an array of n + 1 float pairs where the last is equal to the first.
        *
        * http://geomalgorithms.com/a03-_inclusion.html
        */
        function pointInPolygon(x: number, y: number, polygon: Float32Array): boolean;
        /**
        * Signed area of a triangle. If zero then points are collinear, if < 0 then points
        * are clockwise otherwise counter-clockwise.
        */
        function signedArea(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): number;
        function counterClockwise(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): boolean;
        function clockwise(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): boolean;
        function pointInPolygonInt32(x: number, y: number, polygon: Int32Array): boolean;
    }
    class IndentingWriter {
        static PURPLE: string;
        static YELLOW: string;
        static GREEN: string;
        static RED: string;
        static ENDC: string;
        private static _consoleOut;
        private static _consoleOutNoNewline;
        private _tab;
        private _padding;
        private _suppressOutput;
        private _out;
        private _outNoNewline;
        constructor(suppressOutput?: boolean, out?: any);
        public write(str?: string, writePadding?: boolean): void;
        public writeLn(str?: string): void;
        public writeComment(str: string): void;
        public writeLns(str: string): void;
        public debugLn(str: string): void;
        public yellowLn(str: string): void;
        public greenLn(str: string): void;
        public redLn(str: string): void;
        public warnLn(str: string): void;
        public colorLn(color: string, str: string): void;
        public redLns(str: string): void;
        public colorLns(color: string, str: string): void;
        public enter(str: string): void;
        public leaveAndEnter(str: string): void;
        public leave(str: string): void;
        public indent(): void;
        public outdent(): void;
        public writeArray(arr: any[], detailed?: boolean, noNumbers?: boolean): void;
    }
    class SortedList<T> {
        static RETURN: number;
        static DELETE: number;
        private _compare;
        private _head;
        private _length;
        constructor(compare: (l: T, r: T) => number);
        public push(value: T): void;
        /**
        * Visitors can return RETURN if they wish to stop the iteration or DELETE if they need to delete the current node.
        * NOTE: DELETE most likley doesn't work if there are multiple active iterations going on.
        */
        public forEach(visitor: (value: T) => any): void;
        public isEmpty(): boolean;
        public pop(): T;
        public contains(value: T): boolean;
        public toString(): string;
    }
    class CircularBuffer {
        public index: number;
        public start: number;
        public array: ArrayBufferView;
        public _size: number;
        public _mask: number;
        constructor(Type: any, sizeInBits?: number);
        public get(i: any): any;
        public forEachInReverse(visitor: any): void;
        public write(value: any): void;
        public isFull(): boolean;
        public isEmpty(): boolean;
        public reset(): void;
    }
    module BitSets {
        var ADDRESS_BITS_PER_WORD: number;
        var BITS_PER_WORD: number;
        var BIT_INDEX_MASK: number;
        interface BitSet {
            set: (i: any) => void;
            setAll: () => void;
            assign: (set: BitSet) => void;
            clear: (i: number) => void;
            get: (i: number) => boolean;
            clearAll: () => void;
            intersect: (other: BitSet) => void;
            subtract: (other: BitSet) => void;
            negate: () => void;
            forEach: (fn: any) => void;
            toArray: () => boolean[];
            equals: (other: BitSet) => boolean;
            contains: (other: BitSet) => boolean;
            isEmpty: () => boolean;
            clone: () => BitSet;
            recount: () => void;
            toString: (names: string[]) => string;
            toBitString: (on: string, off: string) => string;
        }
        class Uint32ArrayBitSet implements BitSet {
            public size: number;
            public bits: Uint32Array;
            public count: number;
            public dirty: number;
            public length: number;
            constructor(length: number);
            public recount(): void;
            public set(i: any): void;
            public setAll(): void;
            public assign(set: any): void;
            public clear(i: any): void;
            public get(i: any): boolean;
            public clearAll(): void;
            private _union(other);
            public intersect(other: Uint32ArrayBitSet): void;
            public subtract(other: Uint32ArrayBitSet): void;
            public negate(): void;
            public forEach(fn: any): void;
            public toArray(): boolean[];
            public equals(other: Uint32ArrayBitSet): boolean;
            public contains(other: Uint32ArrayBitSet): boolean;
            public toBitString: (on: string, off: string) => string;
            public toString: (names: string[]) => string;
            public isEmpty(): boolean;
            public clone(): Uint32ArrayBitSet;
        }
        class Uint32BitSet implements BitSet {
            public size: number;
            public bits: number;
            public count: number;
            public dirty: number;
            public singleWord: boolean;
            public length: number;
            constructor(length: number);
            public recount(): void;
            public set(i: any): void;
            public setAll(): void;
            public assign(set: Uint32BitSet): void;
            public clear(i: number): void;
            public get(i: number): boolean;
            public clearAll(): void;
            private _union(other);
            public intersect(other: Uint32BitSet): void;
            public subtract(other: Uint32BitSet): void;
            public negate(): void;
            public forEach(fn: any): void;
            public toArray(): boolean[];
            public equals(other: Uint32BitSet): boolean;
            public contains(other: Uint32BitSet): boolean;
            public toBitString: (on: string, off: string) => string;
            public toString: (names: string[]) => string;
            public isEmpty(): boolean;
            public clone(): Uint32BitSet;
        }
        function BitSetFunctor(length: number): () => any;
    }
    class ColorStyle {
        static TabToolbar: string;
        static Toolbars: string;
        static HighlightBlue: string;
        static LightText: string;
        static ForegroundText: string;
        static Black: string;
        static VeryDark: string;
        static Dark: string;
        static Light: string;
        static Grey: string;
        static DarkGrey: string;
        static Blue: string;
        static Purple: string;
        static Pink: string;
        static Red: string;
        static Orange: string;
        static LightOrange: string;
        static Green: string;
        static BlueGrey: string;
        private static _randomStyleCache;
        private static _nextStyle;
        static randomStyle(): any;
        static contrastStyle(rgb: string): string;
        static reset(): void;
    }
    interface UntypedBounds {
        xMin: number;
        yMin: number;
        xMax: number;
        yMax: number;
    }
    interface ASRectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }
    /**
    * Faster release version of bounds.
    */
    class Bounds {
        public xMin: number;
        public yMin: number;
        public xMax: number;
        public yMax: number;
        constructor(xMin: number, yMin: number, xMax: number, yMax: number);
        static FromUntyped(source: UntypedBounds): Bounds;
        static FromRectangle(source: ASRectangle): Bounds;
        public setElements(xMin: number, yMin: number, xMax: number, yMax: number): void;
        public copyFrom(source: Bounds): void;
        public contains(x: number, y: number): boolean;
        public unionInPlace(other: Bounds): void;
        public extendByPoint(x: number, y: number): void;
        public extendByX(x: number): void;
        public extendByY(y: number): void;
        public intersects(toIntersect: Bounds): boolean;
        public isEmpty(): boolean;
        public width : number;
        public height : number;
        public getBaseWidth(angle: number): number;
        public getBaseHeight(angle: number): number;
        public setEmpty(): void;
        /**
        * Set all fields to the sentinel value 0x8000000.
        *
        * This is what Flash uses to indicate uninitialized bounds. Important for bounds calculation
        * in `Graphics` instances, which start out with empty bounds but must not just extend them
        * from an 0,0 origin.
        */
        public setToSentinels(): void;
        public clone(): Bounds;
        public toString(): string;
    }
    /**
    * Slower debug version of bounds, makes sure that all points have integer coordinates.
    */
    class DebugBounds {
        private _xMin;
        private _yMin;
        private _xMax;
        private _yMax;
        constructor(xMin: number, yMin: number, xMax: number, yMax: number);
        static FromUntyped(source: UntypedBounds): DebugBounds;
        static FromRectangle(source: ASRectangle): DebugBounds;
        public setElements(xMin: number, yMin: number, xMax: number, yMax: number): void;
        public copyFrom(source: DebugBounds): void;
        public contains(x: number, y: number): boolean;
        public unionWith(other: DebugBounds): void;
        public extendByPoint(x: number, y: number): void;
        public extendByX(x: number): void;
        public extendByY(y: number): void;
        public intersects(toIntersect: DebugBounds): boolean;
        public isEmpty(): boolean;
        public xMin : number;
        public yMin : number;
        public xMax : number;
        public width : number;
        public yMax : number;
        public height : number;
        public getBaseWidth(angle: number): number;
        public getBaseHeight(angle: number): number;
        public setEmpty(): void;
        public clone(): DebugBounds;
        public toString(): string;
        private assertValid();
    }
    class Color {
        public r: number;
        public g: number;
        public b: number;
        public a: number;
        constructor(r: number, g: number, b: number, a: number);
        static FromARGB(argb: number): Color;
        static FromRGBA(rgba: number): Color;
        public toRGBA(): number;
        public toCSSStyle(): string;
        public set(other: Color): void;
        static Red: Color;
        static Green: Color;
        static Blue: Color;
        static None: Color;
        static White: Color;
        static Black: Color;
        private static colorCache;
        static randomColor(alpha?: number): Color;
        static parseColor(color: string): Color;
    }
    module ColorUtilities {
        function RGBAToARGB(rgba: number): number;
        function ARGBToRGBA(argb: number): number;
        function rgbaToCSSStyle(color: number): string;
        function hexToRGB(color: string): number;
        function rgbToHex(color: number): string;
        function isValidHexColor(value: any): boolean;
        /**
        * Unpremultiplies the given |pARGB| color value.
        */
        function unpremultiplyARGB(pARGB: number): number;
        /**
        * Premultiplies the given |pARGB| color value.
        */
        function premultiplyARGB(uARGB: number): number;
        /**
        * Make sure to call this before using the |unpremultiplyARGBUsingTableLookup| or
        * |premultiplyARGBUsingTableLookup| functions. We want to execute this lazily so
        * we don't incur any startup overhead.
        */
        function ensureUnpremultiplyTable(): void;
        function tableLookupUnpremultiplyARGB(pARGB: any): number;
        /**
        * Computes all possible inverse source alpha values.
        */
        function ensureInverseSourceAlphaTable(): void;
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
        function blendPremultipliedBGRA(tpBGRA: any, spBGRA: any): number;
    }
    module Telemetry {
        enum Feature {
            EXTERNAL_INTERFACE_FEATURE = 1,
            CLIPBOARD_FEATURE = 2,
            SHAREDOBJECT_FEATURE = 3,
            VIDEO_FEATURE = 4,
            SOUND_FEATURE = 5,
            NETCONNECTION_FEATURE = 6,
        }
        enum ErrorTypes {
            AVM1_ERROR = 1,
            AVM2_ERROR = 2,
        }
        var instance: ITelemetryService;
    }
    interface ITelemetryService {
        reportTelemetry(data: any): any;
    }
    interface FileLoadingRequest {
        url: string;
        data: any;
    }
    interface FileLoadingProgress {
        bytesLoaded: number;
        bytesTotal: number;
    }
    interface FileLoadingSession {
        onopen?: () => void;
        onclose?: () => void;
        onprogress?: (data: any, progressStatus: FileLoadingProgress) => void;
        onhttpstatus?: (location: string, httpStatus: number, httpHeaders: any) => void;
        onerror?: (e: any) => void;
        open(request: FileLoadingRequest): any;
    }
    interface IFileLoadingService {
        createSession(): FileLoadingSession;
        setBaseUrl(url: string): any;
        resolveUrl(url: string): string;
    }
    module FileLoadingService {
        var instance: IFileLoadingService;
    }
    interface IExternalInterfaceService {
        enabled: boolean;
        initJS(callback: (functionName: string, args: any[]) => any): any;
        registerCallback(functionName: string): any;
        unregisterCallback(functionName: string): any;
        eval(expression: any): any;
        call(request: any): any;
        getId(): string;
    }
    module ExternalInterfaceService {
        var instance: IExternalInterfaceService;
    }
    class Callback {
        private _queues;
        constructor();
        public register(type: any, callback: any): void;
        public unregister(type: string, callback: any): void;
        public notify(type: string, args: any): void;
        public notify1(type: string, value: any): void;
    }
    enum ImageType {
        None = 0,
        /**
        * Premultiplied ARGB (byte-order).
        */
        PremultipliedAlphaARGB = 1,
        /**
        * Unpremultiplied ARGB (byte-order).
        */
        StraightAlphaARGB = 2,
        /**
        * Unpremultiplied RGBA (byte-order), this is what putImageData expects.
        */
        StraightAlphaRGBA = 3,
        JPEG = 4,
        PNG = 5,
        GIF = 6,
    }
    class PromiseWrapper<T> {
        public promise: Promise<T>;
        public resolve: (result: T) => void;
        public reject: (reason: any) => void;
        constructor();
    }
}
declare var exports: any;
declare module Shumway.Options {
    class Argument {
        public shortName: string;
        public longName: string;
        public type: any;
        public options: any;
        public positional: boolean;
        public parseFn: any;
        public value: any;
        constructor(shortName: any, longName: any, type: any, options: any);
        public parse(value: any): void;
    }
    class ArgumentParser {
        public args: any[];
        constructor();
        public addArgument(shortName: any, longName: any, type: any, options: any): Argument;
        public addBoundOption(option: any): void;
        public addBoundOptionSet(optionSet: any): void;
        public getUsage(): string;
        public parse(args: any): any[];
    }
    class OptionSet {
        public name: string;
        public settings: any;
        public options: any;
        public open: boolean;
        constructor(name: string, settings?: any);
        public register(option: any): any;
        public trace(writer: any): void;
        public getSettings(): {};
        public setSettings(settings: any): void;
    }
    class Option {
        public longName: string;
        public shortName: string;
        public type: string;
        public defaultValue: any;
        public value: any;
        public description: string;
        public config: any;
        public ctrl: any;
        constructor(shortName: any, longName: any, type: any, defaultValue: any, description: any, config?: any);
        public parse(value: any): void;
        public trace(writer: any): void;
    }
}
declare module Shumway.Settings {
    var ROOT: string;
    var shumwayOptions: Options.OptionSet;
    function isStorageSupported(): boolean;
    function load(key?: string): any;
    function save(settings?: any, key?: string): void;
    function setSettings(settings: any): void;
    function getSettings(settings: any): {};
}
declare module Shumway.Metrics {
    class Timer {
        private static _base;
        private static _top;
        private static _flat;
        private static _flatStack;
        private _parent;
        private _name;
        private _begin;
        private _last;
        private _total;
        private _count;
        private _timers;
        constructor(parent: Timer, name: string);
        static time(name: any, fn: Function): void;
        static start(name: any): void;
        static stop(): void;
        static stopStart(name: any): void;
        public start(): void;
        public stop(): void;
        public toJSON(): {
            name: string;
            total: number;
            timers: Map<Timer>;
        };
        public trace(writer: IndentingWriter): void;
        static trace(writer: IndentingWriter): void;
    }
    /**
    * Quick way to count named events.
    */
    class Counter {
        static instance: Counter;
        private _enabled;
        private _counts;
        private _times;
        public counts : Map<number>;
        constructor(enabled: boolean);
        public setEnabled(enabled: boolean): void;
        public clear(): void;
        public toJSON(): {
            counts: Map<number>;
            times: Map<number>;
        };
        public count(name: string, increment?: number, time?: number): number;
        public trace(writer: IndentingWriter): void;
        public toStringSorted(): string;
        public traceSorted(writer: IndentingWriter, inline?: boolean): void;
    }
    class Average {
        private _samples;
        private _count;
        private _index;
        constructor(max: any);
        public push(sample: number): void;
        public average(): number;
    }
}
declare module Shumway.ArrayUtilities {
    interface IDataInput {
        readBytes: (bytes: DataBuffer, offset?: number, length?: number) => void;
        readBoolean: () => boolean;
        readByte: () => number;
        readUnsignedByte: () => number;
        readShort: () => number;
        readUnsignedShort: () => number;
        readInt: () => number;
        readUnsignedInt: () => number;
        readFloat: () => number;
        readDouble: () => number;
        readMultiByte: (length: number, charSet: string) => string;
        readUTF: () => string;
        readUTFBytes: (length: number) => string;
        bytesAvailable: number;
        objectEncoding: number;
        endian: string;
    }
    interface IDataOutput {
        writeBytes: (bytes: DataBuffer, offset?: number, length?: number) => void;
        writeBoolean: (value: boolean) => void;
        writeByte: (value: number) => void;
        writeShort: (value: number) => void;
        writeInt: (value: number) => void;
        writeUnsignedInt: (value: number) => void;
        writeFloat: (value: number) => void;
        writeDouble: (value: number) => void;
        writeMultiByte: (value: string, charSet: string) => void;
        writeUTF: (value: string) => void;
        writeUTFBytes: (value: string) => void;
        objectEncoding: number;
        endian: string;
    }
    class PlainObjectDataBuffer {
        public buffer: ArrayBuffer;
        public length: number;
        public littleEndian: boolean;
        constructor(buffer: ArrayBuffer, length: number, littleEndian: boolean);
    }
    class DataBuffer implements IDataInput, IDataOutput {
        private static _nativeLittleEndian;
        private static INITIAL_SIZE;
        private _buffer;
        private _length;
        private _position;
        private _littleEndian;
        private _objectEncoding;
        private _i8View;
        private _u8View;
        private _i32View;
        private _dataView;
        private _bitBuffer;
        private _bitLength;
        constructor(initialSize?: number);
        static FromArrayBuffer(buffer: ArrayBuffer, length?: number): DataBuffer;
        static FromPlainObject(source: PlainObjectDataBuffer): DataBuffer;
        public toPlainObject(): PlainObjectDataBuffer;
        private _get(m, size);
        private _set(m, size, v);
        public _cacheViews(): void;
        public getBytes(): Uint8Array;
        public _ensureCapacity(length: number): void;
        public clear(): void;
        /**
        * For byte-sized reads and writes we can just go through the |Uint8Array| and not
        * the slower DataView.
        */
        public readBoolean(): boolean;
        public readByte(): number;
        public readUnsignedByte(): number;
        public readBytes(bytes: DataBuffer, offset?: number, length?: number): void;
        public readShort(): number;
        public readUnsignedShort(): number;
        public readInt(): number;
        public readUnsignedInt(): number;
        public readFloat(): number;
        public readDouble(): number;
        public writeBoolean(value: boolean): void;
        public writeByte(value: number): void;
        public writeUnsignedByte(value: number): void;
        public writeRawBytes(bytes: Uint8Array): void;
        public writeBytes(bytes: DataBuffer, offset?: number, length?: number): void;
        public writeShort(value: number): void;
        public writeUnsignedShort(value: number): void;
        public writeInt(value: number): void;
        public writeUnsignedInt(value: number): void;
        public writeFloat(value: number): void;
        public writeDouble(value: number): void;
        public readRawBytes(): Int8Array;
        public writeUTF(value: string): void;
        public writeUTFBytes(value: string): void;
        public readUTF(): string;
        public readUTFBytes(length: number): string;
        public length : number;
        public bytesAvailable : number;
        public position : number;
        public buffer : ArrayBuffer;
        public bytes : Uint8Array;
        public ints : Int32Array;
        public objectEncoding : number;
        public endian : string;
        public toString(): string;
        public toBlob(): Blob;
        public writeMultiByte(value: string, charSet: string): void;
        public readMultiByte(length: number, charSet: string): string;
        public getValue(name: number): any;
        public setValue(name: number, value: any): void;
        private static _codeLengthOrder;
        private static _distanceCodes;
        private static _distanceExtraBits;
        private static _fixedLiteralTable;
        private static _fixedDistanceTable;
        private static _lengthCodes;
        private static _lengthExtraBits;
        /**
        * Construct tables lazily only if needed in order to avoid startup cost.
        */
        private static _initializeTables();
        private static _makeHuffmanTable(bitLengths);
        private static readBits(input, size);
        private static inflateBlock(input, output);
        static inflate(input: DataBuffer, output: DataBuffer, literalTable: any, distanceTable: any): void;
        static readCode(input: DataBuffer, codeTable: any): number;
        static adler32(data: any, start: any, end: any): number;
        private _compress(algorithm);
        private _uncompress(algorithm);
    }
}
declare module Shumway {
    /**
    * Used for (de-)serializing Graphics path data in defineShape, flash.display.Graphics
    * and the renderer.
    */
    enum PathCommand {
        BeginSolidFill = 1,
        BeginGradientFill = 2,
        BeginBitmapFill = 3,
        EndFill = 4,
        LineStyleSolid = 5,
        LineStyleGradient = 6,
        LineStyleBitmap = 7,
        LineEnd = 8,
        MoveTo = 9,
        LineTo = 10,
        CurveTo = 11,
        CubicCurveTo = 12,
    }
    enum GradientType {
        Linear = 16,
        Radial = 18,
    }
    enum GradientSpreadMethod {
        Pad = 0,
        Reflect = 1,
        Repeat = 2,
    }
    enum GradientInterpolationMethod {
        RGB = 0,
        LinearRGB = 1,
    }
    interface ShapeMatrix {
        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;
    }
    class PlainObjectShapeData {
        public commands: Uint8Array;
        public commandsPosition: number;
        public coordinates: Int32Array;
        public coordinatesPosition: number;
        public morphCoordinates: Int32Array;
        public styles: ArrayBuffer;
        public stylesLength: number;
        constructor(commands: Uint8Array, commandsPosition: number, coordinates: Int32Array, coordinatesPosition: number, morphCoordinates: Int32Array, styles: ArrayBuffer, stylesLength: number);
    }
    class ShapeData {
        public commands: Uint8Array;
        public commandsPosition: number;
        public coordinates: Int32Array;
        public morphCoordinates: Int32Array;
        public coordinatesPosition: number;
        public styles: ArrayUtilities.DataBuffer;
        constructor(initialize?: boolean);
        static FromPlainObject(source: PlainObjectShapeData): ShapeData;
        public moveTo(x: number, y: number): void;
        public lineTo(x: number, y: number): void;
        public curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void;
        public cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number): void;
        public beginFill(color: number): void;
        public endFill(): void;
        public endLine(): void;
        public lineStyle(thickness: number, color: number, pixelHinting: boolean, scaleMode: number, caps: number, joints: number, miterLimit: number): void;
        /**
        * Bitmaps are specified the same for fills and strokes, so we only need to serialize them
        * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
        * be one of BeginBitmapFill and LineStyleBitmap.
        */
        public beginBitmap(pathCommand: PathCommand, bitmapId: number, matrix: ShapeMatrix, repeat: boolean, smooth: boolean): void;
        /**
        * Gradients are specified the same for fills and strokes, so we only need to serialize them
        * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
        * be one of BeginGradientFill and LineStyleGradient.
        */
        public beginGradient(pathCommand: PathCommand, colors: number[], ratios: number[], gradientType: number, matrix: ShapeMatrix, spread: number, interpolation: number, focalPointRatio: number): void;
        public writeCommandAndCoordinates(command: PathCommand, x: number, y: number): void;
        public writeCoordinates(x: number, y: number): void;
        public writeMorphCoordinates(x: number, y: number): void;
        public clear(): void;
        public isEmpty(): boolean;
        public clone(): ShapeData;
        public toPlainObject(): PlainObjectShapeData;
        public buffers : ArrayBuffer[];
        private _writeStyleMatrix(matrix);
        private ensurePathCapacities(numCommands, numCoordinates);
    }
}
declare module Shumway.SWF.Parser {
    enum SwfTag {
        CODE_END = 0,
        CODE_SHOW_FRAME = 1,
        CODE_DEFINE_SHAPE = 2,
        CODE_FREE_CHARACTER = 3,
        CODE_PLACE_OBJECT = 4,
        CODE_REMOVE_OBJECT = 5,
        CODE_DEFINE_BITS = 6,
        CODE_DEFINE_BUTTON = 7,
        CODE_JPEG_TABLES = 8,
        CODE_SET_BACKGROUND_COLOR = 9,
        CODE_DEFINE_FONT = 10,
        CODE_DEFINE_TEXT = 11,
        CODE_DO_ACTION = 12,
        CODE_DEFINE_FONT_INFO = 13,
        CODE_DEFINE_SOUND = 14,
        CODE_START_SOUND = 15,
        CODE_STOP_SOUND = 16,
        CODE_DEFINE_BUTTON_SOUND = 17,
        CODE_SOUND_STREAM_HEAD = 18,
        CODE_SOUND_STREAM_BLOCK = 19,
        CODE_DEFINE_BITS_LOSSLESS = 20,
        CODE_DEFINE_BITS_JPEG2 = 21,
        CODE_DEFINE_SHAPE2 = 22,
        CODE_DEFINE_BUTTON_CXFORM = 23,
        CODE_PROTECT = 24,
        CODE_PATHS_ARE_POSTSCRIPT = 25,
        CODE_PLACE_OBJECT2 = 26,
        CODE_REMOVE_OBJECT2 = 28,
        CODE_SYNC_FRAME = 29,
        CODE_FREE_ALL = 31,
        CODE_DEFINE_SHAPE3 = 32,
        CODE_DEFINE_TEXT2 = 33,
        CODE_DEFINE_BUTTON2 = 34,
        CODE_DEFINE_BITS_JPEG3 = 35,
        CODE_DEFINE_BITS_LOSSLESS2 = 36,
        CODE_DEFINE_EDIT_TEXT = 37,
        CODE_DEFINE_VIDEO = 38,
        CODE_DEFINE_SPRITE = 39,
        CODE_NAME_CHARACTER = 40,
        CODE_PRODUCT_INFO = 41,
        CODE_DEFINE_TEXT_FORMAT = 42,
        CODE_FRAME_LABEL = 43,
        CODE_DEFINE_BEHAVIOUR = 44,
        CODE_SOUND_STREAM_HEAD2 = 45,
        CODE_DEFINE_MORPH_SHAPE = 46,
        CODE_FRAME_TAG = 47,
        CODE_DEFINE_FONT2 = 48,
        CODE_GEN_COMMAND = 49,
        CODE_DEFINE_COMMAND_OBJ = 50,
        CODE_CHARACTER_SET = 51,
        CODE_FONT_REF = 52,
        CODE_DEFINE_FUNCTION = 53,
        CODE_PLACE_FUNCTION = 54,
        CODE_GEN_TAG_OBJECTS = 55,
        CODE_EXPORT_ASSETS = 56,
        CODE_IMPORT_ASSETS = 57,
        CODE_ENABLE_DEBUGGER = 58,
        CODE_DO_INIT_ACTION = 59,
        CODE_DEFINE_VIDEO_STREAM = 60,
        CODE_VIDEO_FRAME = 61,
        CODE_DEFINE_FONT_INFO2 = 62,
        CODE_DEBUG_ID = 63,
        CODE_ENABLE_DEBUGGER2 = 64,
        CODE_SCRIPT_LIMITS = 65,
        CODE_SET_TAB_INDEX = 66,
        CODE_FILE_ATTRIBUTES = 69,
        CODE_PLACE_OBJECT3 = 70,
        CODE_IMPORT_ASSETS2 = 71,
        CODE_DO_ABC_ = 72,
        CODE_DEFINE_FONT_ALIGN_ZONES = 73,
        CODE_CSM_TEXT_SETTINGS = 74,
        CODE_DEFINE_FONT3 = 75,
        CODE_SYMBOL_CLASS = 76,
        CODE_METADATA = 77,
        CODE_DEFINE_SCALING_GRID = 78,
        CODE_DO_ABC = 82,
        CODE_DEFINE_SHAPE4 = 83,
        CODE_DEFINE_MORPH_SHAPE2 = 84,
        CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA = 86,
        CODE_DEFINE_BINARY_DATA = 87,
        CODE_DEFINE_FONT_NAME = 88,
        CODE_START_SOUND2 = 89,
        CODE_DEFINE_BITS_JPEG4 = 90,
        CODE_DEFINE_FONT4 = 91,
    }
    enum PlaceObjectFlags {
        Reserved = 2048,
        OpaqueBackground = 1024,
        HasVisible = 512,
        HasImage = 256,
        HasClassName = 2048,
        HasCacheAsBitmap = 1024,
        HasBlendMode = 512,
        HasFilterList = 256,
        HasClipActions = 128,
        HasClipDepth = 64,
        HasName = 32,
        HasRatio = 16,
        HasColorTransform = 8,
        HasMatrix = 4,
        HasCharacter = 2,
        Move = 1,
    }
    interface ISwfTagData {
        code: SwfTag;
        type?: string;
        id?: number;
        frameCount?: number;
        repeat?: number;
        tags?: ISwfTagData[];
        finalTag?: boolean;
    }
}
declare module Shumway {
    interface BinaryFileReaderProgressInfo {
        loaded: number;
        total: number;
    }
    class BinaryFileReader {
        public url: string;
        public method: string;
        public mimeType: string;
        public data: any;
        constructor(url: string, method?: string, mimeType?: string, data?: any);
        public readAll(progress: (response: any, loaded: number, total: number) => void, complete: (response: any, error?: any) => void): void;
        public readAsync(ondata: (data: Uint8Array, progress: BinaryFileReaderProgressInfo) => void, onerror: (err: any) => void, onopen?: () => void, oncomplete?: () => void, onhttpstatus?: (location: string, status: string, responseHeaders: any) => void): void;
    }
}
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
declare module Shumway.Remoting {
    interface IRemotable {
        _id: number;
    }
    /**
    * Remoting phases.
    */
    enum RemotingPhase {
        /**
        * Objects are serialized. During this phase all reachable remotable objects (all objects
        * reachable from a root set) that are dirty are remoted. This includes all dirty object
        * properties except for dirty references.
        */
        Objects = 0,
        /**
        * Object references are serialized. All objects that are referred to have already been
        * remoted at this point.
        */
        References = 1,
    }
    enum MessageBits {
        HasMatrix = 1,
        HasBounds = 2,
        HasChildren = 4,
        HasColorTransform = 8,
        HasClipRect = 16,
        HasMiscellaneousProperties = 32,
        HasMask = 64,
        HasClip = 128,
    }
    enum IDMask {
        None = 0,
        Asset = 134217728,
    }
    /**
    * Serialization Format. All commands start with a message tag.
    */
    enum MessageTag {
        EOF = 0,
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
        UpdateFrame = 100,
        UpdateGraphics = 101,
        UpdateBitmapData = 102,
        UpdateTextContent = 103,
        UpdateStage = 104,
        RegisterFont = 200,
        DrawToBitmap = 201,
        MouseEvent = 300,
        KeyboardEvent = 301,
        FocusEvent = 302,
    }
    /**
    * Dictates how color transforms are encoded. The majority of color transforms are
    * either identity or only modify the alpha multiplier, so we can encode these more
    * efficiently.
    */
    enum ColorTransformEncoding {
        /**
        * Identity, no need to serialize all the fields.
        */
        Identity = 0,
        /**
        * Identity w/ AlphaMultiplier, only the alpha multiplier is serialized.
        */
        AlphaMultiplierOnly = 1,
        /**
        * All fields are serialized.
        */
        All = 2,
    }
    var MouseEventNames: string[];
    var KeyboardEventNames: string[];
    enum KeyboardEventFlags {
        CtrlKey = 1,
        AltKey = 2,
        ShiftKey = 4,
    }
    enum FocusEventType {
        DocumentHidden = 0,
        DocumentVisible = 1,
        WindowBlur = 2,
        WindowFocus = 3,
    }
}
