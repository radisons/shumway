/// <reference path="base.d.ts" />
/// <reference path="tools.d.ts" />
declare module Shumway.AVM2 {
    var timelineBuffer: Tools.Profiler.TimelineBuffer;
    var counter: Metrics.Counter;
    function countTimeline(name: string, value?: number): void;
    function enterTimeline(name: string, data?: any): void;
    function leaveTimeline(data?: any): void;
}
declare module Shumway.AVM2 {
    var Errors: {
        CallOfNonFunctionError: {
            code: number;
            message: string;
        };
        ConvertNullToObjectError: {
            code: number;
            message: string;
        };
        ConvertUndefinedToObjectError: {
            code: number;
            message: string;
        };
        ClassNotFoundError: {
            code: number;
            message: string;
        };
        CheckTypeFailedError: {
            code: number;
            message: string;
        };
        WrongArgumentCountError: {
            code: number;
            message: string;
        };
        XMLMarkupMustBeWellFormed: {
            code: number;
            message: string;
        };
        OutOfRangeError: {
            code: number;
            message: string;
        };
        VectorFixedError: {
            code: number;
            message: string;
        };
        InvalidRangeError: {
            code: number;
            message: string;
        };
        NullArgumentError: {
            code: number;
            message: string;
        };
        InvalidArgumentError: {
            code: number;
            message: string;
        };
        InvalidParamError: {
            code: number;
            message: string;
        };
        ParamRangeError: {
            code: number;
            message: string;
        };
        NullPointerError: {
            code: number;
            message: string;
        };
        InvalidEnumError: {
            code: number;
            message: string;
        };
        InvalidBitmapData: {
            code: number;
            message: string;
        };
        CompressedDataError: {
            code: number;
            message: string;
        };
        TooFewArgumentsError: {
            code: number;
            message: string;
        };
        SocketConnectError: {
            code: number;
            message: string;
        };
        CantAddSelfError: {
            code: number;
            message: string;
        };
        NotAChildError: {
            code: number;
            message: string;
        };
        ExternalInterfaceNotAvailableError: {
            code: number;
            message: string;
        };
        InvalidStageMethodError: {
            code: number;
            message: string;
        };
        SceneNotFoundError: {
            code: number;
            message: string;
        };
        FrameLabelNotFoundError: {
            code: number;
            message: string;
        };
        CantAddParentError: {
            code: number;
            message: string;
        };
    };
    function getErrorMessage(index: number): string;
    function formatErrorMessage(error: any, ...args: any[]): string;
    function translateErrorMessage(error: any): any;
}
declare module Shumway.AVM2.ABC {
    class AbcStream {
        private static _resultBuffer;
        private _bytes;
        private _view;
        private _position;
        constructor(bytes: Uint8Array);
        private static _getResultBuffer(length);
        public position : number;
        public remaining(): number;
        public seek(position: number): void;
        public readU8(): number;
        public readU8s(count: number): Uint8Array;
        public readS8(): number;
        public readU32(): number;
        public readU30(): number;
        public readU30Unsafe(): number;
        public readS16(): number;
        /**
        * Read a variable-length encoded 32-bit signed integer. The value may use one to five bytes (little endian),
        * each contributing 7 bits. The most significant bit of each byte indicates that the next byte is part of
        * the value. The spec indicates that the most significant bit of the last byte to be read is sign extended
        * but this turns out not to be the case in the real implementation, for instance 0x7f should technically be
        * -1, but instead it's 127. Moreover, what happens to the remaining 4 high bits of the fifth byte that is
        * read? Who knows, here we'll just stay true to the Tamarin implementation.
        */
        public readS32(): number;
        public readWord(): number;
        public readS24(): number;
        public readDouble(): number;
        public readUTFString(length: any): string;
    }
}
declare module Shumway.AVM2.ABC {
    class Parameter {
        public name: string;
        public type: Multiname;
        public value: any;
        public optional: boolean;
        /**
        * Whether this parameter is used in the method.
        */
        public isUsed: boolean;
        constructor(name: string, type: Multiname, value: any, optional?: boolean);
    }
    class Trait {
        public name: Multiname;
        public abc: AbcFile;
        public holder: Info;
        public hasDefaultValue: boolean;
        public value: any;
        public kind: TRAIT;
        public attributes: number;
        public slotId: number;
        public dispId: number;
        public typeName: Multiname;
        public methodInfo: MethodInfo;
        public classInfo: ClassInfo;
        public metadata: any;
        public trace: (writer: IndentingWriter) => void;
        constructor(abc: AbcFile, stream: AbcStream, holder: Info);
        public isSlot(): boolean;
        public isConst(): boolean;
        public isMethod(): boolean;
        public isClass(): boolean;
        public isGetter(): boolean;
        public isSetter(): boolean;
        public isAccessor(): boolean;
        public isMethodOrAccessor(): boolean;
        public isProtected(): boolean;
        public kindName(): string;
        public isOverride(): number;
        public isFinal(): number;
        public toString(): string;
        static parseTraits(abc: AbcFile, stream: AbcStream, holder: Info): Trait[];
    }
    class Info {
        public abc: AbcFile;
        public index: number;
        public hash: number;
        public traits: any[];
        public trace: (writer: IndentingWriter) => void;
        constructor(abc: AbcFile, index: number, hash: Hashes);
    }
    class MethodInfo extends Info {
        public flags: number;
        public name: Multiname;
        public debugName: string;
        public parameters: Parameter[];
        public returnType: Multiname;
        public holder: Info;
        public hasBody: boolean;
        public maxStack: number;
        public localCount: number;
        public initScopeDepth: number;
        public maxScopeDepth: number;
        public code: any;
        public exceptions: any;
        public isInstanceInitializer: boolean;
        public isClassInitializer: boolean;
        public isScriptInitializer: boolean;
        public freeMethod: Function;
        public lastBoundMethod: {
            scope: Runtime.Scope;
            boundMethod: Function;
        };
        public activationPrototype: Object;
        public analysis: Analysis;
        public hasLookupSwitches: boolean;
        static parseParameterNames: boolean;
        private static _getParameterName(i);
        constructor(abc: AbcFile, index: number, stream: AbcStream);
        public toString(): string;
        public hasOptional(): boolean;
        public needsActivation(): boolean;
        public needsRest(): boolean;
        public needsArguments(): boolean;
        public isNative(): boolean;
        public isClassMember(): boolean;
        public isInstanceMember(): boolean;
        public isScriptMember(): boolean;
        public hasSetsDxns(): boolean;
        static parseException(abc: any, stream: any): {
            start: any;
            end: any;
            target: any;
            typeName: any;
            varName: any;
        };
        static parseBody(abc: AbcFile, stream: AbcStream): void;
        public hasExceptions(): boolean;
        public trace: (writer: IndentingWriter) => void;
    }
    class InstanceInfo extends Info {
        public runtimeId: number;
        public name: Multiname;
        public superName: Multiname;
        public protectedNs: Namespace;
        public flags: number;
        public interfaces: Multiname[];
        public init: MethodInfo;
        public classInfo: ClassInfo;
        public traits: Trait[];
        static nextID: number;
        constructor(abc: AbcFile, index: number, stream: AbcStream);
        public toString(): string;
        public isFinal(): boolean;
        public isSealed(): boolean;
        public isInterface(): boolean;
    }
    /**
    * Defines various constants to deal with unique encodings of ABC constants.
    */
    enum Hashes {
        AbcMask = 65535,
        KindMask = 458752,
        ClassInfo = 0,
        InstanceInfo = 65536,
        MethodInfo = 131072,
        ScriptInfo = 196608,
        NamespaceSet = 262144,
        IndexOffset = 19,
    }
    class ClassInfo extends Info {
        public metadata: any;
        public runtimeId: number;
        public init: MethodInfo;
        public instanceInfo: InstanceInfo;
        public defaultValue: any;
        public native: any;
        public classObject: AS.ASClass;
        static nextID: number;
        constructor(abc: AbcFile, index: number, stream: AbcStream);
        private static _getDefaultValue(qn);
        public toString(): string;
    }
    class ScriptInfo extends Info {
        public runtimeId: number;
        public hash: number;
        public init: MethodInfo;
        public name: string;
        public traits: Trait[];
        public global: Runtime.Global;
        public loaded: boolean;
        public executed: boolean;
        public executing: boolean;
        static nextID: number;
        constructor(abc: AbcFile, index: number, stream: AbcStream);
        public entryPoint : MethodInfo;
        public toString(): string;
    }
    class AbcFile {
        public name: string;
        public hash: number;
        public constantPool: ConstantPool;
        public methods: MethodInfo[];
        public metadata: MetaDataInfo[];
        public instances: InstanceInfo[];
        public classes: ClassInfo[];
        public scripts: ScriptInfo[];
        public env: any;
        public applicationDomain: Runtime.ApplicationDomain;
        public trace: (writer: IndentingWriter) => void;
        constructor(bytes: Uint8Array, name: string, hash?: number);
        private static _checkMagic(stream);
        public lastScript : ScriptInfo;
        static attachHolder(mi: MethodInfo, holder: Info): void;
        public toString(): string;
        public getConstant(hash: number): any;
    }
    class Namespace {
        private static _publicPrefix;
        private static _kinds;
        /**
        * According to Tamarin, this is 0xe000 + 660, with 660 being an "odd legacy
        * wart".
        */
        private static _MIN_API_MARK;
        private static _MAX_API_MARK;
        public kind: number;
        public uri: string;
        public prefix: string;
        public qualifiedName: string;
        /**
        * Private namespaces need unique URIs |uniqueURIHash|, for such cases we compute a hash value
        * based on the ABC's hash. We could have easily given them a unique runtimeId but this wouldn't
        * have worked for AOT compilation.
        */
        constructor(kind: CONSTANT, uri?: string, prefix?: string, uniqueURIHash?: number);
        private _buildNamespace(uniqueURIHash?);
        private static _knownURIs;
        private static _hashNamespace(kind, uri, prefix);
        private static _mangledNamespaceCache;
        private static _mangledNamespaceMap;
        /**
        * Mangles a namespace URI to a more sensible name. The process is reversible
        * using lookup tables.
        */
        private static _qualifyNamespace(kind, uri, prefix);
        static fromQualifiedName(qn: string): Namespace;
        static kindFromString(str: string): CONSTANT;
        static createNamespace(uri: string, prefix?: string): Namespace;
        static parse(constantPool: ConstantPool, stream: AbcStream, hash: number): Namespace;
        public isPublic(): boolean;
        public isProtected(): boolean;
        public isPrivate(): boolean;
        public isPackageInternal(): boolean;
        public isUnique(): boolean;
        public isDynamic(): boolean;
        public getURI(): string;
        public toString(): string;
        public clone(): Namespace;
        public isEqualTo(other: Namespace): boolean;
        public inNamespaceSet(set: Namespace[]): boolean;
        public getAccessModifier(): string;
        public getQualifiedName(): string;
        static PUBLIC: Namespace;
        static PROTECTED: Namespace;
        static PROXY: Namespace;
        static VECTOR: Namespace;
        static VECTOR_PACKAGE: Namespace;
        static BUILTIN: Namespace;
        private static _simpleNameCache;
        /**
        * Creates a set of namespaces from one or more comma delimited simple names, for example:
        * flash.display
        * private flash.display
        * [flash.display, private flash.display]
        */
        static fromSimpleName(simpleName: any): Namespace[];
    }
    /**
    * Section 2.3 and 4.4.3
    *
    * Multinames are (namespace set, name) pairs that are resolved to QNames (qualified names) at runtime. The terminology
    * in general is very confusing so we follow some naming conventions to simplify things. First of all, in ActionScript 3
    * there are 10 types of multinames. Half of them end in an "A" are used to represent the names of XML attributes. Those
    * prefixed with "RT" are "runtime" multinames which means they get their namespace from the runtime execution stack.
    * Multinames suffixed with "L" are called "late" which means they get their name from the runtime execution stack.
    *
    *  QName - A QName (qualified name) is the simplest form of multiname, it has one name and one namespace.
    *  E.g. ns::n
    *
    *  RTQName - A QName whose namespace part is resolved at runtime.
    *  E.g. [x]::n
    *
    *  RTQNameL - An RTQName whose name part is resolved at runtime.
    *  E.g. [x]::[y]
    *
    *  Multiname - A multiname with a namespace set.
    *  E.g. {ns0, ns1, ns2, ...}::n
    *
    *  MultinameL - A multiname with a namespace set whose name part is resolved at runtime.
    *  E.g. {ns0, ns1, ns2, ...}::[y]
    *
    * Multinames are used very frequently so it's important that we optimize their use. In Shumway, QNames are
    * represented as either: Multiname objects, strings or numbers, depending on the information they need to carry.
    * Typically, most named QNames will be strings while numeric QNames will be treated as numbers. All other Multiname
    * types will be represented as Multiname objects.
    *
    * Please use the following conventions when dealing with multinames:
    *
    * In the AS3 bytecode specification the word "name" usually refers to multinames. We use the same property name in
    * Shumway thus leading to code such as |instanceInfo.name.name| which is quite ugly. If possible, avoid using the
    * word "name" to refer to multinames, instead use "mn" or "multiname" and use the word "name" to refer to the
    * name part of a Multiname.
    *
    * Multiname: multiname, mn
    * QName: qualifiedName, qn
    * Namespace: namespace, ns
    *
    * Because a qualified name can be either a Multiname object, a string, a number, or even a Number object use the static
    * Multiname methods to query multinames. For instance, use |Multiname.isRuntimeMultiname(mn)| instead of
    * |mn.isRuntimeMultiname()| since the latter will fail if |mn| is not a Multiname object.
    */
    /**
    * Name Mangling
    *
    * All Shumway QNames are mangled using the following format:
    *
    * "$" (Variable Length Mangled Namespace) Name
    *
    * Namespaces are hashed to 32 bit integers and are converted to a base64 variable length string
    * encoding that can still be parsed as a valid JS identifier. We can encode 32 bits hashes with
    * six sets of 6 bits. This leaves us with 4 unused bits that can be used to encode the length
    * of the string.
    *
    */
    class Multiname {
        static ATTRIBUTE: number;
        static RUNTIME_NAMESPACE: number;
        static RUNTIME_NAME: number;
        private static _nextID;
        public namespaces: Namespace[];
        public name: string;
        public flags: number;
        public runtimeId: number;
        public typeParameter: Multiname;
        public qualifiedName: any;
        private _qualifiedNameCache;
        constructor(namespaces: Namespace[], name: string, flags?: number);
        static parse(constantPool: ConstantPool, stream: AbcStream, multinames: Multiname[], typeNamePatches: any[], multinameIndex: number): any;
        /**
        * Tests if the specified value is a valid Multiname.
        */
        static isMultiname(mn: any): boolean;
        static needsResolution(mn: any): boolean;
        /**
        * Tests if the specified value is a valid qualified name.
        */
        static isQName(mn: any): boolean;
        /**
        * Tests if the specified multiname has a runtime name.
        */
        static isRuntimeName(mn: any): boolean;
        /**
        * Tests if the specified multiname has a runtime namespace.
        */
        static isRuntimeNamespace(mn: any): boolean;
        /**
        * Tests if the specified multiname has a runtime name or namespace.
        */
        static isRuntime(mn: any): boolean;
        /**
        * Gets the qualified name for this multiname, this is either the identity or
        * a mangled Multiname object.
        */
        static getQualifiedName(mn: any): any;
        static qualifyName(namespace: any, name: any): string;
        static stripPublicQualifier(qn: any): string;
        /**
        * Creates a Multiname from a mangled qualified name. The format should be of
        * the form "$"(mangledNamespace)(name).
        */
        static fromQualifiedName(qn: any): Multiname;
        static getNameFromPublicQualifiedName(qn: any): string;
        /**
        * Same as |getQualifiedName| but it also includes the type parameter if
        * it has one.
        */
        static getFullQualifiedName(mn: any): string;
        static getPublicQualifiedName(name: any): any;
        static isPublicQualifiedName(qn: any): boolean;
        static getAccessModifier(mn: any): string;
        static isNumeric(mn: any): boolean;
        static getName(mn: Multiname): string;
        static isAnyName(mn: any): boolean;
        private static _simpleNameCache;
        /**
        * Creates a multiname from a simple name qualified with one ore more namespaces, for example:
        * flash.display.Graphics
        * private flash.display.Graphics
        * [private flash.display, private flash, public].Graphics
        */
        static fromSimpleName(simpleName: string): Multiname;
        public getQName(index: number): Multiname;
        public hasQName(qn: any): boolean;
        public isAttribute(): number;
        public isAnyName(): boolean;
        public isAnyNamespace(): boolean;
        public isRuntimeName(): boolean;
        public isRuntimeNamespace(): boolean;
        public isRuntime(): boolean;
        public isQName(): boolean;
        public hasTypeParameter(): boolean;
        public getName(): any;
        public getOriginalName(): string;
        public getNamespace(): Namespace;
        public nameToString(): string;
        public hasObjectName(): boolean;
        public toString(): string;
        static Int: any;
        static Uint: any;
        static Class: any;
        static Array: any;
        static Object: any;
        static String: any;
        static Number: any;
        static Boolean: any;
        static Function: any;
        static XML: any;
        static XMLList: any;
        static TO_STRING: any;
        static VALUE_OF: any;
        static TEMPORARY: Multiname;
    }
    class MetaDataInfo {
        public name: string;
        public value: {
            key: string;
            value: string[];
        }[];
        public trace: (writer: IndentingWriter) => void;
        constructor(abc: AbcFile, stream: AbcStream);
        public toString(): string;
    }
    enum CONSTANT {
        Undefined = 0,
        Utf8 = 1,
        Float = 2,
        Int = 3,
        UInt = 4,
        PrivateNs = 5,
        Double = 6,
        QName = 7,
        Namespace = 8,
        Multiname = 9,
        False = 10,
        True = 11,
        Null = 12,
        QNameA = 13,
        MultinameA = 14,
        RTQName = 15,
        RTQNameA = 16,
        RTQNameL = 17,
        RTQNameLA = 18,
        NameL = 19,
        NameLA = 20,
        NamespaceSet = 21,
        PackageNamespace = 22,
        PackageInternalNs = 23,
        ProtectedNamespace = 24,
        ExplicitNamespace = 25,
        StaticProtectedNs = 26,
        MultinameL = 27,
        MultinameLA = 28,
        TypeName = 29,
        ClassSealed = 1,
        ClassFinal = 2,
        ClassInterface = 4,
        ClassProtectedNs = 8,
    }
    enum METHOD {
        Arguments = 1,
        Activation = 2,
        Needrest = 4,
        HasOptional = 8,
        IgnoreRest = 16,
        Native = 32,
        Setsdxns = 64,
        HasParamNames = 128,
    }
    enum TRAIT {
        Slot = 0,
        Method = 1,
        Getter = 2,
        Setter = 3,
        Class = 4,
        Function = 5,
        Const = 6,
    }
    enum ATTR {
        Final = 1,
        Override = 2,
        Metadata = 4,
    }
    enum SORT {
        CASEINSENSITIVE = 1,
        DESCENDING = 2,
        UNIQUESORT = 4,
        RETURNINDEXEDARRAY = 8,
        NUMERIC = 16,
    }
    class ConstantPool {
        static _nextNamespaceSetID: number;
        public ints: number[];
        public uints: number[];
        public doubles: number[];
        public strings: string[];
        public multinames: Multiname[];
        public namespaces: Namespace[];
        public namespaceSets: Namespace[][];
        public trace: (writer: IndentingWriter) => void;
        constructor(stream: AbcStream, abc: AbcFile);
        public getValue(kind: CONSTANT, index: number): any;
    }
}
declare module Shumway.AVM2.ABC {
}
declare module Shumway.AVM2 {
    enum OP {
        bkpt = 1,
        nop = 2,
        throw = 3,
        getsuper = 4,
        setsuper = 5,
        dxns = 6,
        dxnslate = 7,
        kill = 8,
        label = 9,
        lf32x4 = 10,
        sf32x4 = 11,
        ifnlt = 12,
        ifnle = 13,
        ifngt = 14,
        ifnge = 15,
        jump = 16,
        iftrue = 17,
        iffalse = 18,
        ifeq = 19,
        ifne = 20,
        iflt = 21,
        ifle = 22,
        ifgt = 23,
        ifge = 24,
        ifstricteq = 25,
        ifstrictne = 26,
        lookupswitch = 27,
        pushwith = 28,
        popscope = 29,
        nextname = 30,
        hasnext = 31,
        pushnull = 32,
        pushundefined = 33,
        pushfloat = 34,
        nextvalue = 35,
        pushbyte = 36,
        pushshort = 37,
        pushtrue = 38,
        pushfalse = 39,
        pushnan = 40,
        pop = 41,
        dup = 42,
        swap = 43,
        pushstring = 44,
        pushint = 45,
        pushuint = 46,
        pushdouble = 47,
        pushscope = 48,
        pushnamespace = 49,
        hasnext2 = 50,
        li8 = 53,
        li16 = 54,
        li32 = 55,
        lf32 = 56,
        lf64 = 57,
        si8 = 58,
        si16 = 59,
        si32 = 60,
        sf32 = 61,
        sf64 = 62,
        newfunction = 64,
        call = 65,
        construct = 66,
        callmethod = 67,
        callstatic = 68,
        callsuper = 69,
        callproperty = 70,
        returnvoid = 71,
        returnvalue = 72,
        constructsuper = 73,
        constructprop = 74,
        callsuperid = 75,
        callproplex = 76,
        callinterface = 77,
        callsupervoid = 78,
        callpropvoid = 79,
        sxi1 = 80,
        sxi8 = 81,
        sxi16 = 82,
        applytype = 83,
        pushfloat4 = 84,
        newobject = 85,
        newarray = 86,
        newactivation = 87,
        newclass = 88,
        getdescendants = 89,
        newcatch = 90,
        findpropstrict = 93,
        findproperty = 94,
        finddef = 95,
        getlex = 96,
        setproperty = 97,
        getlocal = 98,
        setlocal = 99,
        getglobalscope = 100,
        getscopeobject = 101,
        getproperty = 102,
        getouterscope = 103,
        initproperty = 104,
        setpropertylate = 105,
        deleteproperty = 106,
        deletepropertylate = 107,
        getslot = 108,
        setslot = 109,
        getglobalslot = 110,
        setglobalslot = 111,
        convert_s = 112,
        esc_xelem = 113,
        esc_xattr = 114,
        convert_i = 115,
        convert_u = 116,
        convert_d = 117,
        convert_b = 118,
        convert_o = 119,
        checkfilter = 120,
        convert_f = 121,
        unplus = 122,
        convert_f4 = 123,
        coerce = 128,
        coerce_b = 129,
        coerce_a = 130,
        coerce_i = 131,
        coerce_d = 132,
        coerce_s = 133,
        astype = 134,
        astypelate = 135,
        coerce_u = 136,
        coerce_o = 137,
        negate = 144,
        increment = 145,
        inclocal = 146,
        decrement = 147,
        declocal = 148,
        typeof = 149,
        not = 150,
        bitnot = 151,
        add = 160,
        subtract = 161,
        multiply = 162,
        divide = 163,
        modulo = 164,
        lshift = 165,
        rshift = 166,
        urshift = 167,
        bitand = 168,
        bitor = 169,
        bitxor = 170,
        equals = 171,
        strictequals = 172,
        lessthan = 173,
        lessequals = 174,
        greaterthan = 175,
        greaterequals = 176,
        instanceof = 177,
        istype = 178,
        istypelate = 179,
        in = 180,
        increment_i = 192,
        decrement_i = 193,
        inclocal_i = 194,
        declocal_i = 195,
        negate_i = 196,
        add_i = 197,
        subtract_i = 198,
        multiply_i = 199,
        getlocal0 = 208,
        getlocal1 = 209,
        getlocal2 = 210,
        getlocal3 = 211,
        setlocal0 = 212,
        setlocal1 = 213,
        setlocal2 = 214,
        setlocal3 = 215,
        invalid = 237,
        debug = 239,
        debugline = 240,
        debugfile = 241,
        bkptline = 242,
        timestamp = 243,
    }
    interface OpcodeOperandDescription {
        name: string;
        size: string;
        type: string;
    }
    interface OpcodeDescription {
        name: string;
        canThrow: boolean;
        operands: OpcodeOperandDescription[];
    }
    /**
    * Provides a definition of AVM2 Bytecodes.
    *
    * Type (size) Prefix:
    *
    *   u08 - a one-byte unsigned integer
    *   s08 - a one-byte signed integer
    *   s24 - a three byte signed integer
    *   s16 - a variable-length encoded 30-bit unsigned integer value that is casted to a short value
    *   u30 - a variable-length encoded 30-bit unsigned integer value
    *
    * Type (semantic) Suffix:
    *
    *     I - an index into the integer constant pool
    *     U - an index into the unsigned integer constant pool
    *     D - an index into the doubles constant pool
    *     S - an index into the string constant pool
    *     N - an index into the namespace constant pool
    *     M - an index into the multiname constant pool
    *    CI - an index into the class info list
    *    EI - an index into the exception info list
    *    MI - an index into the method info list
    */
    var opcodeTable: OpcodeDescription[];
    function opcodeName(op: any): string;
    /**
    * A normalized AS3 bytecode, or BasicBlock.
    */
    class Bytecode {
        public ti: Verifier.TypeInformation;
        public op: number;
        public position: number;
        public originalPosition: number;
        public canThrow: boolean;
        public offsets: number[];
        public succs: Bytecode[];
        public preds: Bytecode[];
        public dominatees: Bytecode[];
        public targets: Bytecode[];
        public target: Bytecode;
        public dominator: Bytecode;
        public bid: number;
        public end: Bytecode;
        public level: number;
        public hasCatches: boolean;
        public spbacks: BlockSet;
        public bdo: number;
        public index: number;
        public object: number;
        public argCount: number;
        public region: Compiler.IR.Region;
        public verifierEntryState: Verifier.State;
        public verifierExitState: Verifier.State;
        constructor(code: any);
        public makeBlockHead(id: any): any;
        public trace(writer: any): void;
        public toString(abc: any): string;
    }
    interface BytecodeVisitor {
        (bytecode: Bytecode): void;
    }
    class BlockSet extends BitSets.Uint32ArrayBitSet {
        public blockById: Map<Bytecode>;
        constructor(length: number, blockById: Map<Bytecode>);
        public forEachBlock(fn: BytecodeVisitor): void;
        public choose(): Bytecode;
        public members(): Bytecode[];
        public setBlocks(bs: Bytecode[]): void;
    }
    class Analysis {
        public methodInfo: ABC.MethodInfo;
        public blocks: Bytecode[];
        public bytecodes: Bytecode[];
        public boundBlockSet: any;
        public markedLoops: boolean;
        public analyzedControlFlow: boolean;
        constructor(methodInfo: ABC.MethodInfo);
        public makeBlockSetFactory(length: number, blockById: Map<Bytecode>): void;
        /**
        * Marks the parameter as used if it's ever accessed via getLocal.
        */
        public accessLocal(index: number): void;
        /**
        * Internal bytecode used for bogus jumps. They should be emitted as throws
        * so that if control flow ever reaches them, we crash.
        */
        public getInvalidTarget(cache: any, offset: any): any;
        public normalizeBytecode(): void;
        public analyzeControlFlow(): boolean;
        public detectBasicBlocks(): void;
        public normalizeReachableBlocks(): void;
        /**
        * Calculate the dominance relation iteratively.
        * Algorithm is from [1].
        * [1] Cooper et al. "A Simple, Fast Dominance Algorithm"
        */
        public computeDominance(): void;
        public markLoops(): boolean;
    }
}
declare var Bytecode: typeof Shumway.AVM2.Bytecode;
declare var Analysis: typeof Shumway.AVM2.Analysis;
declare module Shumway.AVM2 {
    module Runtime {
        var traceExecution: any;
        var traceCallExecution: any;
        var traceFunctions: any;
        var traceClasses: any;
        var traceDomain: any;
        var debuggerMode: any;
        var globalMultinameAnalysis: any;
        var codeCaching: any;
        var compilerEnableExceptions: any;
        var compilerMaximumMethodSize: any;
        enum ExecutionMode {
            INTERPRET = 1,
            COMPILE = 2,
        }
    }
    module Compiler {
        var options: any;
        var traceLevel: any;
        var breakFilter: any;
        var compileFilter: any;
        var enableDirtyLocals: any;
    }
    module Verifier {
        var options: any;
        var enabled: any;
        var traceLevel: any;
    }
}
/**
* Defines the MetaObject protocol for all AS3 Objects.
*/
interface IProtocol {
    asGetProperty: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number) => any;
    asGetNumericProperty: (name: number) => any;
    asGetPublicProperty: (name: any) => any;
    asGetResolvedStringProperty: (name: string) => any;
    asSetProperty: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number, value: any) => void;
    asSetNumericProperty: (name: number, value: any) => void;
    asSetPublicProperty: (name: any, value: any) => void;
    asDefineProperty: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number, descriptor: PropertyDescriptor) => void;
    asDefinePublicProperty: (name: any, descriptor: PropertyDescriptor) => void;
    asCallProperty: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number, isLex: boolean, args: any[]) => any;
    asCallSuper: (scope: any, namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number, args: any[]) => any;
    asGetSuper: (scope: any, namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number) => any;
    asSetSuper: (scope: any, namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number, value: any) => void;
    asCallPublicProperty: (name: any, args: any[]) => void;
    asCallResolvedStringProperty: (resolved: any, isLex: boolean, args: any[]) => any;
    asConstructProperty: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number, args: any[]) => any;
    asHasProperty: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number) => boolean;
    asHasOwnProperty: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number) => boolean;
    asHasPropertyInternal: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number) => boolean;
    asPropertyIsEnumerable: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number) => boolean;
    asHasTraitProperty: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number) => boolean;
    asDeleteProperty: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number) => boolean;
    asHasNext2: (hasNext2Info: Shumway.AVM2.Runtime.HasNext2Info) => void;
    asNextName: (index: number) => any;
    asNextValue: (index: number) => any;
    asNextNameIndex: (index: number) => number;
    asGetEnumerableKeys: () => any[];
    hasProperty: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number) => boolean;
}
interface Object extends IProtocol {
    hash: number;
    runtimeId: number;
    resolutionMap: Shumway.Map<Shumway.Map<string>>;
    bindings: Shumway.AVM2.Runtime.Bindings;
    getNamespaceResolutionMap: any;
    resolveMultinameProperty: (namespaces: Shumway.AVM2.ABC.Namespace[], name: any, flags: number) => any;
    class: Shumway.AVM2.AS.ASClass;
    asEnumerableKeys: any[];
    asLazyInitializer: Shumway.AVM2.Runtime.LazyInitializer;
    asBindings: any[];
    asLength: number;
    asSlots: Shumway.AVM2.Runtime.SlotInfoMap;
    asIsNativePrototype: boolean;
    asOpenMethods: Shumway.Map<Function>;
    asIsClass: boolean;
    asDefaultNamepsace: Shumway.AVM2.ABC.Namespace;
}
interface Function {
    asCall(thisArg: any, ...argArray: any[]): any;
    asApply(thisArg: any, argArray?: any): any;
}
declare module Shumway.AVM2.Runtime {
    /**
    * Seals const traits. Technically we need to throw an exception if they are ever modified after
    * the static or instance constructor executes, but we can safely ignore this incompatibility.
    */
    var sealConstTraits: boolean;
    /**
    * Match AS3 add semantics related to toString/valueOf when adding values.
    */
    var useAsAdd: boolean;
    var VM_SLOTS: string;
    var VM_LENGTH: string;
    var VM_BINDINGS: string;
    var VM_NATIVE_PROTOTYPE_FLAG: string;
    var VM_OPEN_METHODS: string;
    var VM_OPEN_METHOD_PREFIX: string;
    var VM_MEMOIZER_PREFIX: string;
    var VM_OPEN_SET_METHOD_PREFIX: string;
    var VM_OPEN_GET_METHOD_PREFIX: string;
    var SAVED_SCOPE_NAME: string;
    /**
    * Overriden AS3 methods (see hacks.js). This allows you to provide your own JS implementation
    * for AS3 methods.
    */
    var VM_METHOD_OVERRIDES: any;
    /**
    * Checks if the specified |object| is the prototype of a native JavaScript object.
    */
    function isNativePrototype(object: any): any;
    interface IPatchTarget {
        object: Object;
        get?: string;
        set?: string;
        name?: string;
    }
    function patch(patchTargets: IPatchTarget[], value: Function): void;
    /**
    * Applies a method trait that doesn't need a memoizer.
    */
    function applyNonMemoizedMethodTrait(qn: string, trait: ABC.Trait, object: Object, scope: any, natives: any): void;
    function applyMemoizedMethodTrait(qn: string, trait: ABC.Trait, object: Object, scope: any, natives: any): void;
    /**
    * Property Accessors:
    *
    * Every AS3 object has the following "virtual" accessors methods:
    * - asGetProperty(namespaces, name, flags)
    * - asSetProperty(namespaces, name, flags, value)
    * - asHasProperty(namespaces, name, flags)
    * - asHasTraitProperty(namespaces, name, flags)
    * - asCallProperty(namespaces, name, flags, isLex, args)
    * - asDeleteProperty(namespaces, name, flags)
    *
    * If the compiler can prove that the property name is numeric, it calls these functions instead.
    *
    * - asGetNumericProperty(index)
    * - asSetNumericProperty(index, value)
    *
    * - asGetDescendants(namespaces, name, flags)
    * - asNextName(index)
    * - asNextNameIndex(index)
    * - asNextValue(index)
    * - asGetEnumerableKeys()
    *
    * Multiname resolution methods:
    * - getNamespaceResolutionMap(namespaces)
    * - resolveMultinameProperty(namespaces, name, flags)
    *
    * Special objects like Vector, Dictionary, XML, etc. can override these to provide different behaviour.
    *
    * To avoid boxing we represent multinames as a group of 3 parts: |namespaces| undefined or an array of
    * namespace objects, |name| any value, and |flags| an integer value. To resolve a multiname to a qualified
    * name we call |resolveMultinameProperty|. The expensive case is when we resolve multinames with multiple
    * namespaces. This is done with the help of |getNamespaceResolutionMap|.
    *
    * Every object that contains traits has a hidden array property called "resolutionMap". This maps between
    * namespace sets to an object that maps all trait names to their resolved qualified names in each namespace.
    *
    * For example, suppose we had the class A { n0 var x; n1 var x; n0 var y; n1 var y; } and two namespace sets:
    * {n0, n2} and {n2, n1}. The namespace sets are given the unique IDs 0 and 1 respectively. The resolution map
    * for class A would be:
    *
    * resolutionMap[0] = {x: n0$$x, y: n0$$y}
    * resolutionMap[1] = {x: n1$$x, y: n1$$y}
    *
    * Resolving {n2, n1}::x on a = new A() then becomes:
    *
    * a[a.resolutionMap[1]["x"]] -> a[{x: n1$$x, y: n1$$y}["x"]] -> a[n1$$x]
    *
    */
    function getNamespaceResolutionMap(namespaces: ABC.Namespace[]): Map<string>;
    function resolveMultinameProperty(namespaces: ABC.Namespace[], name: string, flags: number): any;
    function asGetPublicProperty(name: any): any;
    function asGetProperty(namespaces: ABC.Namespace[], name: any, flags: number): any;
    /**
    * Resolved string accessors.
    */
    function asGetResolvedStringProperty(resolved: any): any;
    function asCallResolvedStringProperty(resolved: any, isLex: boolean, args: any[]): any;
    function asGetResolvedStringPropertyFallback(resolved: any): any;
    function asSetPublicProperty(name: any, value: any): void;
    var forwardValueOf: () => any;
    var forwardToString: () => string;
    function asSetProperty(namespaces: ABC.Namespace[], name: any, flags: number, value: any): void;
    function asDefinePublicProperty(name: any, descriptor: PropertyDescriptor): void;
    function asDefineProperty(namespaces: ABC.Namespace[], name: any, flags: number, descriptor: PropertyDescriptor): void;
    function asCallPublicProperty(name: any, args: any[]): any;
    function asCallProperty(namespaces: ABC.Namespace[], name: any, flags: number, isLex: boolean, args: any[]): any;
    function asCallSuper(scope: any, namespaces: ABC.Namespace[], name: any, flags: number, args: any[]): any;
    function asSetSuper(scope: any, namespaces: ABC.Namespace[], name: any, flags: number, value: any): void;
    function asGetSuper(scope: any, namespaces: ABC.Namespace[], name: any, flags: number): any;
    function construct(cls: AS.ASClass, args: any[]): any;
    function asConstructProperty(namespaces: ABC.Namespace[], name: any, flags: number, args: any[]): any;
    function asHasProperty(namespaces: ABC.Namespace[], name: any, flags: number): boolean;
    function asHasOwnProperty(namespaces: ABC.Namespace[], name: any, flags: number): boolean;
    function asPropertyIsEnumerable(namespaces: ABC.Namespace[], name: any, flags: number): boolean;
    function asDeleteProperty(namespaces: ABC.Namespace[], name: any, flags: number): boolean;
    function asHasTraitProperty(namespaces: ABC.Namespace[], name: any, flags: number): boolean;
    function asGetNumericProperty(i: number): any;
    function asSetNumericProperty(i: number, v: string): void;
    function asGetDescendants(namespaces: ABC.Namespace[], name: any, flags: number): void;
    /**
    * Gets the next name index of an object. Index |zero| is actually not an
    * index, but rather an indicator to start the iteration.
    */
    function asNextNameIndex(index: number): number;
    /**
    * Gets the nextName after the specified |index|, which you would expect to
    * be index + 1, but it's actually index - 1;
    */
    function asNextName(index: number): any;
    function asNextValue(index: number): any;
    /**
    * Determine if the given object has any more properties after the specified |index| and if so, return
    * the next index or |zero| otherwise. If the |obj| has no more properties then continue the search in
    * |obj.__proto__|. This function returns an updated index and object to be used during iteration.
    *
    * the |for (x in obj) { ... }| statement is compiled into the following pseudo bytecode:
    *
    * index = 0;
    * while (true) {
    *   (obj, index) = hasNext2(obj, index);
    *   if (index) { #1
    *     x = nextName(obj, index); #2
    *   } else {
    *     break;
    *   }
    * }
    *
    * #1 If we return zero, the iteration stops.
    * #2 The spec says we need to get the nextName at index + 1, but it's actually index - 1, this caused
    * me two hours of my life that I will probably never get back.
    *
    * TODO: We can't match the iteration order semantics of Action Script, hopefully programmers don't rely on it.
    */
    function asHasNext2(hasNext2Info: HasNext2Info): void;
    function asGetEnumerableKeys(): any[];
    function asTypeOf(x: any): string;
    /**
    * Make an object's properties accessible from AS3. This prefixes all non-numeric
    * properties with the public prefix.
    */
    function publicizeProperties(object: any): void;
    function asGetSlot(object: any, index: any): any;
    function asSetSlot(object: any, index: any, value: any): void;
    function asCheckVectorSetNumericProperty(i: any, length: any, fixed: any): void;
    function asCheckVectorGetNumericProperty(i: any, length: any): void;
    function throwError(name: any, error: any, ...rest: any[]): void;
    function throwErrorFromVM(domain: any, errorClass: any, message: any, id: any): void;
    function translateError(domain: any, error: any): any;
    function asIsInstanceOf(type: any, value: any): any;
    function asIsType(type: any, value: any): any;
    function asAsType(type: any, value: any): any;
    function asCoerceByMultiname(methodInfo: ABC.MethodInfo, multiname: any, value: any): any;
    function asCoerce(type: AS.ASClass, value: any): any;
    /**
    * Similar to |toString| but returns |null| for |null| or |undefined| instead
    * of "null" or "undefined".
    */
    function asCoerceString(x: any): string;
    function asCoerceInt(x: any): number;
    function asCoerceUint(x: any): number;
    function asCoerceNumber(x: any): number;
    function asCoerceBoolean(x: any): boolean;
    function asCoerceObject(x: any): any;
    function asDefaultCompareFunction(a: any, b: any): number;
    function asCompare(a: any, b: any, options: ABC.SORT, compareFunction?: any): number;
    /**
    * ActionScript 3 has different behaviour when deciding whether to call toString or valueOf
    * when one operand is a string. Unlike JavaScript, it calls toString if one operand is a
    * string and valueOf otherwise. This sucks, but we have to emulate this behaviour because
    * YouTube depends on it.
    */
    function asAdd(l: any, r: any): any;
    function getDescendants(object: any, mn: any): any;
    function checkFilter(value: any): any;
    function initializeGlobalObject(global: any): void;
    /**
    * Check if a qualified name is in an object's traits.
    */
    function nameInTraits(object: any, qn: any): any;
    /**
    * Scope object backing for catch blocks.
    */
    function CatchScopeObject(domain: any, trait: any): void;
    /**
    * Global object for a script.
    */
    class Global {
        public scriptInfo: ABC.ScriptInfo;
        public scriptBindings: ScriptBindings;
        constructor(script: ABC.ScriptInfo);
        public toString(): string;
        public isExecuted(): boolean;
        public isExecuting(): boolean;
        public ensureExecuted(): void;
    }
    /**
    * Self patching global property stub that lazily initializes objects like scripts and
    * classes.
    */
    class LazyInitializer {
        private _target;
        private _resolved;
        static create(target: Object): LazyInitializer;
        constructor(target: Object);
        public resolve(): Object;
    }
    function forEachPublicProperty(object: any, fn: any, self?: any): void;
    function wrapJSObject(object: any): any;
    function asCreateActivation(methodInfo: ABC.MethodInfo): Object;
    /**
    * It's not possible to resolve the multiname {a, b, c}::x to {b}::x if no trait exists in any of the currently
    * loaded abc files that defines the {b}::x name. Of course, this can change if we load an abc file that defines it.
    */
    class GlobalMultinameResolver {
        private static hasNonDynamicNamespaces;
        private static wasResolved;
        private static updateTraits(traits);
        /**
        * Called after an .abc file is loaded. This invalidates inline caches if they have been created.
        */
        static loadAbc(abc: any): void;
        static resolveMultiname(multiname: any): ABC.Multiname;
    }
    class ActivationInfo {
        public methodInfo: ABC.MethodInfo;
        constructor(methodInfo: ABC.MethodInfo);
    }
    class HasNext2Info {
        public object: Object;
        public index: number;
        constructor(object: Object, index: number);
    }
    function sliceArguments(args: any, offset?: number): any;
    function canCompile(mi: any): boolean;
    /**
    * Checks if the specified method should be compiled. For now we just ignore very large methods.
    */
    function shouldCompile(mi: any): boolean;
    /**
    * Checks if the specified method must be compiled, even if the compiled is not enabled.
    */
    function forceCompile(mi: any): boolean;
    var CODE_CACHE: any;
    function searchCodeCache(methodInfo: any): any;
    function createInterpretedFunction(methodInfo: any, scope: any, hasDynamicScope: any): any;
    function debugName(value: any): any;
    function createCompiledFunction(methodInfo: any, scope: any, hasDynamicScope: any, breakpoint: any, deferCompilation: any): any;
    /**
    * Creates a function from the specified |methodInfo| that is bound to the given |scope|. If the
    * scope is dynamic (as is the case for closures) the compiler generates an additional prefix
    * parameter for the compiled function named |SAVED_SCOPE_NAME| and then wraps the compiled
    * function in a closure that is bound to the given |scope|. If the scope is not dynamic, the
    * compiler bakes it in as a constant which should be much more efficient. If the interpreter
    * is used, the scope object is passed in every time.
    */
    function createFunction(mi: any, scope: any, hasDynamicScope: any, breakpoint?: boolean): any;
    function ensureFunctionIsInitialized(methodInfo: any): void;
    /**
    * Gets the function associated with a given trait.
    */
    function getTraitFunction(trait: ABC.Trait, scope: Scope, natives: any): any;
    /**
    * ActionScript Classes are modeled as constructor functions (class objects) which hold additional properties:
    *
    * [scope]: a scope object holding the current class object
    *
    * [baseClass]: a reference to the base class object
    *
    * [instanceTraits]: an accumulated set of traits that are to be applied to instances of this class
    *
    * [prototype]: the prototype object of this constructor function  is populated with the set of instance traits,
    *   when instances are of this class are created, their __proto__ is set to this object thus inheriting this
    *   default set of properties.
    *
    * [construct]: a reference to the class object itself, this is used when invoking the constructor with an already
    *   constructed object (i.e. constructsuper)
    *
    * additionally, the class object also has a set of class traits applied to it which are visible via scope lookups.
    */
    function createClass(classInfo: any, baseClass: any, scope: any): AS.ASClass;
    /**
    * In ActionScript, assigning to a property defined as "const" outside of a static or instance
    * initializer throws a |ReferenceError| exception. To emulate this behaviour in JavaScript,
    * we "seal" constant traits properties by replacing them with setters that throw exceptions.
    */
    function sealConstantTraits(object: any, traits: any): void;
    function applyType(methodInfo: ABC.MethodInfo, factory: AS.ASClass, types: any): AS.ASClass;
}
/**
* Top level runtime definitinos used by compiler generated code.
*/
declare var HasNext2Info: typeof Shumway.AVM2.Runtime.HasNext2Info;
declare var asCreateActivation: typeof Shumway.AVM2.Runtime.asCreateActivation;
declare var asIsInstanceOf: typeof Shumway.AVM2.Runtime.asIsInstanceOf;
declare var asIsType: typeof Shumway.AVM2.Runtime.asIsType;
declare var asAsType: typeof Shumway.AVM2.Runtime.asAsType;
declare var asTypeOf: typeof Shumway.AVM2.Runtime.asTypeOf;
declare var asCoerceByMultiname: typeof Shumway.AVM2.Runtime.asCoerceByMultiname;
declare var asCoerce: typeof Shumway.AVM2.Runtime.asCoerce;
declare var asCoerceString: typeof Shumway.AVM2.Runtime.asCoerceString;
declare var asCoerceInt: typeof Shumway.AVM2.Runtime.asCoerceInt;
declare var asCoerceUint: typeof Shumway.AVM2.Runtime.asCoerceUint;
declare var asCoerceNumber: typeof Shumway.AVM2.Runtime.asCoerceNumber;
declare var asCoerceBoolean: typeof Shumway.AVM2.Runtime.asCoerceBoolean;
declare var asCoerceObject: typeof Shumway.AVM2.Runtime.asCoerceObject;
declare var asCompare: typeof Shumway.AVM2.Runtime.asCompare;
declare var asAdd: typeof Shumway.AVM2.Runtime.asAdd;
declare var asGetSlot: typeof Shumway.AVM2.Runtime.asGetSlot;
declare var asSetSlot: typeof Shumway.AVM2.Runtime.asSetSlot;
declare var asHasNext2: typeof Shumway.AVM2.Runtime.asHasNext2;
declare var getDescendants: typeof Shumway.AVM2.Runtime.getDescendants;
declare var checkFilter: typeof Shumway.AVM2.Runtime.checkFilter;
declare var sliceArguments: typeof Shumway.AVM2.Runtime.sliceArguments;
declare var createFunction: typeof Shumway.AVM2.Runtime.createFunction;
declare module Shumway.AVM2.Runtime {
    /**
    * Scopes are used to emulate the scope stack as a linked list of scopes, rather than a stack. Each
    * scope holds a reference to a scope [object] (which may exist on multiple scope chains, thus preventing
    * us from chaining the scope objects together directly).
    *
    * Scope Operations:
    *
    *  push scope: scope = new Scope(scope, object)
    *  pop scope: scope = scope.parent
    *  get global scope: scope.global
    *  get scope object: scope.object
    *
    * Method closures have a [savedScope] property which is bound when the closure is created. Since we use a
    * linked list of scopes rather than a scope stack, we don't need to clone the scope stack, we can bind
    * the closure to the current scope.
    *
    * The "scope stack" for a method always starts off as empty and methods push and pop scopes on their scope
    * stack explicitly. If a property is not found on the current scope stack, it is then looked up
    * in the [savedScope]. To emulate this we actually wrap every generated function in a closure, such as
    *
    *  function fnClosure(scope) {
    *    return function fn() {
    *      ... scope;
    *    };
    *  }
    *
    * When functions are created, we bind the function to the current scope, using fnClosure.bind(null, this)();
    *
    * Scope Caching:
    *
    * Calls to |findScopeProperty| are very expensive. They recurse all the way to the top of the scope chain and then
    * laterally across other scripts. We optimize this by caching property lookups in each scope using Multiname
    * |id|s as keys. Each Multiname object is given a unique ID when it's constructed. For QNames we only cache
    * string QNames.
    *
    * TODO: This is not sound, since you can add/delete properties to/from with scopes.
    */
    class Scope {
        public parent: Scope;
        public global: Scope;
        public object: Object;
        public isWith: boolean;
        public cache: any;
        constructor(parent: Scope, object: any, isWith?: boolean);
        public findDepth(object: any): number;
        public getScopeObjects(): any[];
        /**
        * Searches the scope stack for the object containing the specified property. If |strict| is specified then throw
        * an exception if the property is not found. If |scopeOnly| is specified then only search the scope chain and not
        * any of the top level domains (this is used by the verifier to bake in direct object references).
        *
        * Property lookups are cached in scopes but are not used when only looking at |scopesOnly|.
        */
        public findScopeProperty(namespaces: ABC.Namespace[], name: any, flags: number, method: ABC.MethodInfo, strict: boolean, scopeOnly: boolean): any;
    }
    /**
    * Wraps the free method in a closure that passes the dynamic scope object as the
    * first argument and also makes sure that the |asGlobal| object gets passed in as
    * |this| when the method is called with |fn.call(null)|.
    */
    function bindFreeMethodScope(methodInfo: ABC.MethodInfo, scope: Scope): any;
}
/**
* Top level runtime definitinos used by compiler generated code.
*/
declare var Scope: typeof Shumway.AVM2.Runtime.Scope;
declare module Shumway.AVM2.Runtime {
    class Binding {
        public trait: ABC.Trait;
        static SET_PREFIX: string;
        static GET_PREFIX: string;
        static KEY_PREFIX_LENGTH: number;
        public natives: any;
        public scope: any;
        constructor(trait: ABC.Trait);
        static getKey(qn: any, trait: ABC.Trait): any;
        public toString(): string;
    }
    class SlotInfo {
        public name: string;
        public isConst: boolean;
        public type: any;
        public trait: ABC.Trait;
        constructor(name: string, isConst: boolean, type: any, trait: ABC.Trait);
    }
    class SlotInfoMap {
        public byID: Map<SlotInfo>;
        public byQN: Map<SlotInfo>;
        constructor();
    }
    /**
    * Abstraction over a collection of traits.
    */
    class Bindings {
        public map: Map<Binding>;
        public slots: ABC.Trait[];
        public nextSlotId: number;
        public natives: any;
        constructor();
        /**
        * Assigns the next available slot to the specified trait. Traits that have a non-zero slotId
        * are allocated by ASC and we can't relocate them elsewhere.
        */
        public assignNextSlot(trait: ABC.Trait): void;
        public trace(writer: IndentingWriter): void;
        /**
        * Applies traits to a traitsPrototype object. Every traitsPrototype object must have the following layout:
        *
        * VM_BINDINGS = [ Array of Binding QNames ]
        * VM_SLOTS = {
        *   byID: [],
        *   byQN: {},
        * }
        *
        */
        public applyTo(domain: ApplicationDomain, object: any, append?: boolean): void;
    }
    class ActivationBindings extends Bindings {
        public methodInfo: ABC.MethodInfo;
        constructor(methodInfo: any);
    }
    class CatchBindings extends Bindings {
        constructor(scope: any, trait: any);
    }
    class ScriptBindings extends Bindings {
        public scriptInfo: ABC.ScriptInfo;
        public scope: any;
        constructor(scriptInfo: ABC.ScriptInfo, scope: Scope);
    }
    class ClassBindings extends Bindings {
        public classInfo: ABC.ClassInfo;
        public scope: any;
        public natives: any;
        constructor(classInfo: any, scope: any, natives: any);
    }
    class InstanceBindings extends Bindings {
        public instanceInfo: ABC.InstanceInfo;
        public parent: InstanceBindings;
        public scope: any;
        public natives: any;
        public implementedInterfaces: Map<AS.ASClass>;
        constructor(parent: any, instanceInfo: any, scope: any, natives: any);
        private extend(parent);
        public toString(): string;
    }
}
declare module Shumway.AVM2 {
    /**
    * XRegExp provides augmented, extensible regular expressions. You get new syntax, flags, and
    * methods beyond what browsers support natively. XRegExp is also a regex utility belt with tools
    * to make your client-side grepping simpler and more powerful, while freeing you from worrying
    * about pesky cross-browser inconsistencies and the dubious `lastIndex` property.
    */
    var XRegExp: any;
}
/**
* TypedArray Vector Template
*
* If you make any changes to this code you'll need to regenerate uint32Vector.ts & float64Vector.ts. We duplicate all
* the code for vectors because we want to keep things monomorphic as much as possible.
*
* NOTE: Not all of the AS3 methods need to be implemented natively, some are self-hosted in AS3 code.
* For better performance we should probably implement them all natively (in JS that is) unless our
* compiler is good enough.
*/
declare module Shumway.AVM2.AS {
    class Int32Vector {
        static EXTRA_CAPACITY: number;
        static INITIAL_CAPACITY: number;
        static DEFAULT_VALUE: number;
        static CASEINSENSITIVE: number;
        static DESCENDING: number;
        static UNIQUESORT: number;
        static RETURNINDEXEDARRAY: number;
        static NUMERIC: number;
        static defaultCompareFunction(a: any, b: any): number;
        static compare(a: any, b: any, options: any, compareFunction: any): number;
        private _fixed;
        private _buffer;
        private _length;
        private _offset;
        constructor(length?: number, fixed?: boolean);
        static callable(object: any): any;
        public internalToString(): string;
        public toString(): string;
        public _view(): Int32Array;
        public _ensureCapacity(length: any): void;
        public concat(): void;
        /**
        * Executes a |callback| function with three arguments: element, index, the vector itself as well
        * as passing the |thisObject| as |this| for each of the elements in the vector. If any of the
        * callbacks return |false| the function terminates, otherwise it returns |true|.
        */
        public every(callback: any, thisObject: any): boolean;
        /**
        * Filters the elements for which the |callback| method returns |true|. The |callback| function
        * is called with three arguments: element, index, the vector itself as well as passing the |thisObject|
        * as |this| for each of the elements in the vector.
        */
        public filter(callback: any, thisObject: any): Int32Vector;
        public some(callback: any, thisObject: any): boolean;
        public forEach(callback: any, thisObject: any): void;
        public join(sep: any): void;
        public indexOf(searchElement: any, fromIndex: any): void;
        public lastIndexOf(searchElement: any, fromIndex: any): void;
        public map(callback: any, thisObject: any): Int32Vector;
        public push(...rest: any[]): void;
        public pop(): number;
        public reverse(): void;
        static _sort(a: any): any;
        public _sortNumeric(descending: any): void;
        public sort(): any;
        public asGetNumericProperty(i: any): number;
        public asSetNumericProperty(i: any, v: any): void;
        public shift(): number;
        public _checkFixed(): void;
        public _slide(distance: any): void;
        public unshift(): void;
        public asHasProperty(namespaces: any, name: any, flags: any): any;
        public length : number;
        public fixed : boolean;
        /**
        * Delete |deleteCount| elements starting at |index| then insert |insertCount| elements
        * from |args| object starting at |offset|.
        */
        public _spliceHelper(index: any, insertCount: any, deleteCount: any, args: any, offset: any): void;
        public asNextName(index: number): any;
        public asNextValue(index: number): any;
        public asNextNameIndex(index: number): number;
        public asHasNext2(hasNext2Info: Runtime.HasNext2Info): void;
        public _reverse: () => void;
        public _filter: (callback: Function, thisObject: any) => any;
        public _map: (callback: Function, thisObject: any) => any;
    }
}
/**
* TypedArray Vector Template
*
* If you make any changes to this code you'll need to regenerate uint32Vector.ts & float64Vector.ts. We duplicate all
* the code for vectors because we want to keep things monomorphic as much as possible.
*
* NOTE: Not all of the AS3 methods need to be implemented natively, some are self-hosted in AS3 code.
* For better performance we should probably implement them all natively (in JS that is) unless our
* compiler is good enough.
*/
declare module Shumway.AVM2.AS {
    class Uint32Vector {
        static EXTRA_CAPACITY: number;
        static INITIAL_CAPACITY: number;
        static DEFAULT_VALUE: number;
        static CASEINSENSITIVE: number;
        static DESCENDING: number;
        static UNIQUESORT: number;
        static RETURNINDEXEDARRAY: number;
        static NUMERIC: number;
        static defaultCompareFunction(a: any, b: any): number;
        static compare(a: any, b: any, options: any, compareFunction: any): number;
        private _fixed;
        private _buffer;
        private _length;
        private _offset;
        constructor(length?: number, fixed?: boolean);
        static callable(object: any): any;
        public internalToString(): string;
        public toString(): string;
        public _view(): Uint32Array;
        public _ensureCapacity(length: any): void;
        public concat(): void;
        /**
        * Executes a |callback| function with three arguments: element, index, the vector itself as well
        * as passing the |thisObject| as |this| for each of the elements in the vector. If any of the
        * callbacks return |false| the function terminates, otherwise it returns |true|.
        */
        public every(callback: any, thisObject: any): boolean;
        /**
        * Filters the elements for which the |callback| method returns |true|. The |callback| function
        * is called with three arguments: element, index, the vector itself as well as passing the |thisObject|
        * as |this| for each of the elements in the vector.
        */
        public filter(callback: any, thisObject: any): Uint32Vector;
        public some(callback: any, thisObject: any): boolean;
        public forEach(callback: any, thisObject: any): void;
        public join(sep: any): void;
        public indexOf(searchElement: any, fromIndex: any): void;
        public lastIndexOf(searchElement: any, fromIndex: any): void;
        public map(callback: any, thisObject: any): Uint32Vector;
        public push(...rest: any[]): void;
        public pop(): number;
        public reverse(): void;
        static _sort(a: any): any;
        public _sortNumeric(descending: any): void;
        public sort(): any;
        public asGetNumericProperty(i: any): number;
        public asSetNumericProperty(i: any, v: any): void;
        public shift(): number;
        public _checkFixed(): void;
        public _slide(distance: any): void;
        public unshift(): void;
        public asHasProperty(namespaces: any, name: any, flags: any): any;
        public length : number;
        public fixed : boolean;
        /**
        * Delete |deleteCount| elements starting at |index| then insert |insertCount| elements
        * from |args| object starting at |offset|.
        */
        public _spliceHelper(index: any, insertCount: any, deleteCount: any, args: any, offset: any): void;
        public asNextName(index: number): any;
        public asNextValue(index: number): any;
        public asNextNameIndex(index: number): number;
        public asHasNext2(hasNext2Info: Runtime.HasNext2Info): void;
        public _reverse: () => void;
        public _filter: (callback: Function, thisObject: any) => any;
        public _map: (callback: Function, thisObject: any) => any;
    }
}
/**
* TypedArray Vector Template
*
* If you make any changes to this code you'll need to regenerate uint32Vector.ts & float64Vector.ts. We duplicate all
* the code for vectors because we want to keep things monomorphic as much as possible.
*
* NOTE: Not all of the AS3 methods need to be implemented natively, some are self-hosted in AS3 code.
* For better performance we should probably implement them all natively (in JS that is) unless our
* compiler is good enough.
*/
declare module Shumway.AVM2.AS {
    class Float64Vector {
        static EXTRA_CAPACITY: number;
        static INITIAL_CAPACITY: number;
        static DEFAULT_VALUE: number;
        static CASEINSENSITIVE: number;
        static DESCENDING: number;
        static UNIQUESORT: number;
        static RETURNINDEXEDARRAY: number;
        static NUMERIC: number;
        static defaultCompareFunction(a: any, b: any): number;
        static compare(a: any, b: any, options: any, compareFunction: any): number;
        private _fixed;
        private _buffer;
        private _length;
        private _offset;
        constructor(length?: number, fixed?: boolean);
        static callable(object: any): any;
        public internalToString(): string;
        public toString(): string;
        public _view(): Float64Array;
        public _ensureCapacity(length: any): void;
        public concat(): void;
        /**
        * Executes a |callback| function with three arguments: element, index, the vector itself as well
        * as passing the |thisObject| as |this| for each of the elements in the vector. If any of the
        * callbacks return |false| the function terminates, otherwise it returns |true|.
        */
        public every(callback: any, thisObject: any): boolean;
        /**
        * Filters the elements for which the |callback| method returns |true|. The |callback| function
        * is called with three arguments: element, index, the vector itself as well as passing the |thisObject|
        * as |this| for each of the elements in the vector.
        */
        public filter(callback: any, thisObject: any): Float64Vector;
        public some(callback: any, thisObject: any): boolean;
        public forEach(callback: any, thisObject: any): void;
        public join(sep: any): void;
        public indexOf(searchElement: any, fromIndex: any): void;
        public lastIndexOf(searchElement: any, fromIndex: any): void;
        public map(callback: any, thisObject: any): Float64Vector;
        public push(...rest: any[]): void;
        public pop(): number;
        public reverse(): void;
        static _sort(a: any): any;
        public _sortNumeric(descending: any): void;
        public sort(): any;
        public asGetNumericProperty(i: any): number;
        public asSetNumericProperty(i: any, v: any): void;
        public shift(): number;
        public _checkFixed(): void;
        public _slide(distance: any): void;
        public unshift(): void;
        public asHasProperty(namespaces: any, name: any, flags: any): any;
        public length : number;
        public fixed : boolean;
        /**
        * Delete |deleteCount| elements starting at |index| then insert |insertCount| elements
        * from |args| object starting at |offset|.
        */
        public _spliceHelper(index: any, insertCount: any, deleteCount: any, args: any, offset: any): void;
        public asNextName(index: number): any;
        public asNextValue(index: number): any;
        public asNextNameIndex(index: number): number;
        public asHasNext2(hasNext2Info: Runtime.HasNext2Info): void;
        public _reverse: () => void;
        public _filter: (callback: Function, thisObject: any) => any;
        public _map: (callback: Function, thisObject: any) => any;
    }
}
interface Object {
    __proto__: Object;
}
declare module Shumway.AVM2.AS {
    /**
    * This is all very magical, things are not what they seem, beware!!!
    *
    * The AS3 Class Hierarchy can be expressed as TypeScript, which is nice because
    * we get all sorts of compile time error checking and default arguments support.
    *
    * TODO: TS default argument support is not semantically equivalent to AS3 which
    * uses the arguments.length, TS uses typeof argument === "undefined", so beware.
    *
    * For the most part, you can cut and paste AS3 code into TypeScript and it will
    * parse correctly.
    *
    * The prototype chain configured by TypeScript is not actually used, We only use
    * Class definitions as a templates from which we construct real AS3 classes.
    *
    * Linking:
    *
    * AS -> TS
    *
    * Native AS3 members are linked against TS members. A verification step makes
    * sure all native members are implemented.
    *
    * TS -> AS
    *
    * For this you need to provide TS type definitions and then specify which
    * properties should be made available.
    *
    */
    enum InitializationFlags {
        NONE = 0,
        OWN_INITIALIZE = 1,
        SUPER_INITIALIZE = 2,
    }
    /**
    * In order to avoid shadowing of JS top level Objects we prefix the AS top level
    * classes with the "AS" prefix.
    */
    class ASObject {
        static baseClass: typeof ASClass;
        static classInfo: ABC.ClassInfo;
        static instanceConstructor: any;
        static instanceConstructorNoInitialize: any;
        static initializer: any;
        static defaultInitializerArgument: any;
        static initializers: any;
        static classInitializer: any;
        static callableConstructor: any;
        static classBindings: AVM2.Runtime.ClassBindings;
        static instanceBindings: AVM2.Runtime.InstanceBindings;
        static interfaceBindings: AVM2.Runtime.InstanceBindings;
        static classSymbols: string[];
        static instanceSymbols: string[];
        static staticNatives: any[];
        static instanceNatives: any[];
        static traitsPrototype: Object;
        static dynamicPrototype: Object;
        static defaultValue: any;
        static initializationFlags: InitializationFlags;
        static native_prototype: Object;
        static implementedInterfaces: Map<ASClass>;
        static isInterface: () => boolean;
        static applyType: (type: ASClass) => ASClass;
        static protocol: IProtocol;
        /**
        * Because we mess around with  __proto__'s we need to make
        * sure call and apply are made available on class constructors.
        */
        static call: (thisArg: any, ...argArray: any[]) => any;
        static apply: (thisArg: any, argArray?: any) => any;
        /**
        * Makes native class definitions look like ASClass instances.
        */
        static morphIntoASClass(classInfo: ABC.ClassInfo): void;
        static create(self: ASClass, baseClass: ASClass, instanceConstructor: any): void;
        static initializeFrom(value: any): any;
        static coerce: (value: any) => any;
        static isInstanceOf: (value: any) => boolean;
        static isType: (value: any) => boolean;
        static isSubtypeOf: (value: ASClass) => boolean;
        static asCall(self: any, ...argArray: any[]): any;
        static asApply(self: any, argArray?: any): any;
        static verify(): void;
        static trace(writer: IndentingWriter): void;
        static getQualifiedClassName(): string;
        static _setPropertyIsEnumerable(o: any, V: string, enumerable: boolean): void;
        static _dontEnumPrototype(o: Object): void;
        static defineProperty: (o: any, p: string, attributes: PropertyDescriptor) => any;
        static native_isPrototypeOf: (V: Object) => boolean;
        static native_hasOwnProperty: (V: string) => boolean;
        static native_propertyIsEnumerable: (V: string) => boolean;
        static setPropertyIsEnumerable: (V: string, enumerable: boolean) => boolean;
        public native_isPrototypeOf(V: Object): boolean;
        public native_hasOwnProperty(name: string): boolean;
        public native_propertyIsEnumerable(name: string): boolean;
        public setPropertyIsEnumerable(name: string, enumerable: boolean): void;
        /**
        * This is the top level Object.prototype.toString() function.
        */
        public toString(): string;
    }
    /**
    * Inherit from this if you don't want to inherit the static junk from ASObject
    */
    class ASNative extends ASObject {
        static baseClass: typeof ASClass;
        static classInfo: ABC.ClassInfo;
        static instanceConstructor: any;
        static callableConstructor: any;
        static classBindings: AVM2.Runtime.ClassBindings;
        static instanceBindings: AVM2.Runtime.InstanceBindings;
        static staticNatives: any[];
        static instanceNatives: any[];
        static traitsPrototype: Object;
        static dynamicPrototype: Object;
        static defaultValue: any;
        static initializationFlags: InitializationFlags;
    }
    /**
    * In AS3 all objects inherit from the Object class. Class objects themselves are instances
    * of the Class class. In Shumway, Class instances can be constructed in two ways: dynamically,
    * through the |new ASClass()| constructor function, or "statically" by inheriting the static
    * properties from the ASObject class. Statically constructed functions get morphed into
    * proper ASClass instances when they get constructed at runtime.
    *
    * We need to be really careful not to step on TS's inheritance scheme.
    */
    class ASClass extends ASObject {
        static instanceConstructor: any;
        static staticNatives: any[];
        static instanceNatives: any[];
        /**
        * We can't do our traits / dynamic prototype chaining trick when dealing with builtin
        * functions: Object, Array, etc. Here, we take over the builtin function prototype.
        */
        static configureBuiltinPrototype(self: ASClass, baseClass: ASClass): void;
        static configurePrototype(self: ASClass, baseClass: ASClass): void;
        /**
        * Called when the class is actually constructed during bytecode execution.
        */
        static create(self: ASClass, baseClass: ASClass, instanceConstructor: any): void;
        /**
        * Creates an object of this class but doesn't run the constructors, just the initializers.
        */
        public initializeFrom(value: any): any;
        /**
        * Calls the initializers of an object in order.
        */
        static runInitializers(self: Object, argument: any): void;
        /**
        * Some AS3 classes have two parallel constructor chains:
        *
        * Consider the following inheritance hierarchy, (superClass <- subClass)
        *
        * A  <- B  <- C  <- D
        *
        * X' is the Class X AS3 Constructor
        * X" is the Class X Native Constructor
        *
        * new D() first calls all the native constructors top down, and then
        * all the AS3 constructors bottom up. So, new D() calls:
        *
        * A", B", C", D", D', C', B', A'
        *
        * To implement this behaviour we maintain two constructors, |instanceConstructor|
        * and |instanceConstructorNoInitialize| as well as a list of native initializers
        * for each class, |initializers|. Classes that have at least one initializer need
        * their instanceConstructor to first call all the initializers and then recursively
        * go through all the super constructors.
        */
        static configureInitializers(self: ASClass): void;
        /**
        * Runs the class initializer, if it has one.
        */
        static runClassInitializer(self: ASClass): void;
        static linkSymbols(self: ASClass): void;
        /**
        * Class info.
        */
        public classInfo: ABC.ClassInfo;
        /**
        * Base class.
        */
        public baseClass: ASClass;
        /**
        * Constructs an instance of this class.
        */
        public instanceConstructor: new(...args: any[]) => any;
        /**
        * Constructs an instance of this class without calling the "native" initializer.
        */
        public instanceConstructorNoInitialize: new(...args: any[]) => any;
        /**
        * Native initializer. Classes that have these defined are constructed in a two phases. All initializers
        * along the inheritance chain are executed before any constructors are called.
        */
        public initializer: (...args: any[]) => any;
        /**
        * The default argument that gets passed to all initializers.
        */
        public defaultInitializerArgument: any;
        /**
        * Native class initializer.
        */
        public classInitializer: (...args: any[]) => any;
        /**
        * All native initializers
        */
        public initializers: {
            (...args: any[]): any;
        }[];
        /**
        * Constructs an instance of this class.
        */
        public callableConstructor: new(...args: any[]) => any;
        /**
        * A list of objects to search for methods or accessors when linking static native traits.
        */
        public staticNatives: Object[];
        /**
        * A list of objects to search for methods or accessors when linking instance native traits.
        */
        public instanceNatives: Object[];
        /**
        * Class bindings associated with this class.
        */
        public classBindings: AVM2.Runtime.ClassBindings;
        /**
        * Instance bindings associated with this class.
        */
        public instanceBindings: AVM2.Runtime.InstanceBindings;
        /**
        * List of additional class symbols to link in debug builds.
        */
        public classSymbols: string[];
        /**
        * List of additional instance symbols to link in debug builds.
        */
        public instanceSymbols: string[];
        /**
        * Instance bindings associated with this interface.
        */
        public interfaceBindings: AVM2.Runtime.InstanceBindings;
        /**
        * Prototype object that holds all class instance traits. This is not usually accessible from AS3 code directly. However,
        * for some classes (native classes) the |traitsPrototype| === |dynamicPrototype|.
        */
        public traitsPrototype: Object;
        /**
        * Prototype object accessible from AS3 script code. This is the AS3 Class prototype object |class A { ... }, A.prototype|
        */
        public dynamicPrototype: Object;
        /**
        * Set of implemented interfaces.
        */
        public implementedInterfaces: Map<ASClass>;
        public defaultValue: any;
        /**
        * Initialization flags that determine how native initializers get called.
        */
        public initializationFlags: InitializationFlags;
        /**
        * Defines the AS MetaObject Protocol, |null| if the default protocol should
        * be used. Override this to provide a different protocol.
        */
        public protocol: IProtocol;
        public prototype: Object;
        constructor(classInfo: ABC.ClassInfo);
        public morphIntoASClass(classInfo: ABC.ClassInfo): void;
        public native_prototype : Object;
        public asCall(self: any, ...argArray: any[]): any;
        public asApply(self: any, argArray?: any): any;
        public applyType(type: ASClass): ASClass;
        public isInstanceOf(value: any): boolean;
        /**
        * The isType check for classes looks for the |dynamicPrototype| on the prototype chain.
        */
        public isType(value: any): boolean;
        /**
        * Checks if this class derives from the specified class.
        */
        public isSubtypeOf(value: ASClass): boolean;
        public coerce(value: any): any;
        public isInterface(): boolean;
        public getQualifiedClassName(): string;
        /**
        * Checks the structural integrity of the class instance.
        */
        public verify(): void;
        private static labelCounter;
        static labelObject(o: any): any;
        public trace(writer: IndentingWriter): void;
    }
    class ASFunction extends ASObject {
        static baseClass: typeof ASClass;
        static classInfo: ABC.ClassInfo;
        static instanceConstructor: any;
        static classBindings: AVM2.Runtime.ClassBindings;
        static instanceBindings: AVM2.Runtime.InstanceBindings;
        static staticNatives: any[];
        static instanceNatives: any[];
        constructor();
        public native_prototype : Object;
        public native_length : number;
        public asCall: (self?: any, ...args: any[]) => any;
        public asApply: (self?: any, args?: any[]) => any;
    }
    class ASBoolean extends ASObject {
        static instanceConstructor: any;
        static callableConstructor: any;
        static classBindings: AVM2.Runtime.ClassBindings;
        static instanceBindings: AVM2.Runtime.InstanceBindings;
        static classInfo: ABC.ClassInfo;
        static staticNatives: any[];
        static instanceNatives: any[];
        static coerce: (value: any) => boolean;
        constructor(value?: any);
    }
    class ASMethodClosure extends ASFunction {
        static staticNatives: any[];
        static instanceNatives: any[];
        static instanceConstructor: any;
        constructor(self: any, fn: any);
        public toString(): string;
    }
    class ASNumber extends ASObject {
        static instanceConstructor: any;
        static callableConstructor: any;
        static classBindings: AVM2.Runtime.ClassBindings;
        static instanceBindings: AVM2.Runtime.InstanceBindings;
        static classInfo: ABC.ClassInfo;
        static staticNatives: any[];
        static instanceNatives: any[];
        static defaultValue: any;
        static coerce: (value: any) => number;
        static _numberToString(n: number, radix: number): string;
        static _minValue(): number;
    }
    class ASInt extends ASObject {
        static instanceConstructor: any;
        static callableConstructor: any;
        static classBindings: AVM2.Runtime.ClassBindings;
        static instanceBindings: AVM2.Runtime.InstanceBindings;
        static classInfo: ABC.ClassInfo;
        static staticNatives: any[];
        static instanceNatives: any[];
        static defaultValue: any;
        static coerce: (value: any) => number;
        constructor(value: any);
        static asCall(self: any, ...argArray: any[]): any;
        static asApply(self: any, argArray?: any): any;
        /**
        * In AS3, |new int(42) instanceof int| is |false|.
        */
        static isInstanceOf(value: any): boolean;
        static isType(value: any): boolean;
    }
    class ASUint extends ASObject {
        static instanceConstructor: any;
        static callableConstructor: any;
        static classBindings: AVM2.Runtime.ClassBindings;
        static instanceBindings: AVM2.Runtime.InstanceBindings;
        static classInfo: ABC.ClassInfo;
        static staticNatives: any[];
        static instanceNatives: any[];
        static defaultValue: any;
        static coerce: (value: any) => number;
        constructor(value: any);
        static asCall(self: any, ...argArray: any[]): any;
        static asApply(self: any, argArray?: any): any;
        /**
        * In AS3, |new int(42) instanceof int| is |false|.
        */
        static isInstanceOf(value: any): boolean;
        static isType(value: any): boolean;
    }
    class ASString extends ASObject {
        static instanceConstructor: any;
        static callableConstructor: any;
        static classBindings: AVM2.Runtime.ClassBindings;
        static instanceBindings: AVM2.Runtime.InstanceBindings;
        static classInfo: ABC.ClassInfo;
        static staticNatives: any[];
        static instanceNatives: any[];
        static coerce: (value: any) => string;
        public native_length : number;
        public match(re: any): any;
        public search(re: any): any;
        public toUpperCase(): any;
        public toLocaleUpperCase(): any;
    }
    /**
    * Format: args: [compareFunction], [sortOptions]
    */
    function arraySort(o: any, args: any): any;
    class ASArray extends ASObject {
        static instanceConstructor: any;
        static staticNatives: any[];
        static instanceNatives: any[];
        static CACHE_NUMERIC_COMPARATORS: boolean;
        static numericComparatorCache: any;
        private static _pop(o);
        private static _reverse(o);
        private static _concat(o, args);
        private static _shift(o);
        private static _slice(o, A, B);
        private static _unshift(o, args);
        private static _splice(o, args);
        private static _sort(o, args);
        private static _sortOn(o, names, options);
        private static _indexOf(o, searchElement, fromIndex);
        private static _lastIndexOf(o, searchElement, fromIndex?);
        private static _every(o, callback, thisObject);
        private static _filter(o, callback, thisObject);
        private static _forEach(o, callback, thisObject);
        private static _map(o, callback, thisObject);
        private static _some(o, callback, thisObject);
        public native_length : number;
    }
    class ASVector<T> extends ASNative {
        static staticNatives: any[];
        static instanceNatives: any[];
        static instanceConstructor: any;
        static callableConstructor: any;
        public newThisType(): ASVector<T>;
    }
    class ASIntVector extends ASVector<ASInt> {
        static instanceConstructor: any;
        static staticNatives: any[];
        static instanceNatives: any[];
        static callableConstructor: any;
        private static _every(o, callback, thisObject);
        private static _forEach(o, callback, thisObject);
        private static _some(o, callback, thisObject);
        private static _sort;
    }
    class ASUIntVector extends ASVector<ASUint> {
        static instanceConstructor: any;
        static staticNatives: any[];
        static instanceNatives: any[];
        static callableConstructor: any;
        private static _every(o, callback, thisObject);
        private static _forEach(o, callback, thisObject);
        private static _some(o, callback, thisObject);
        private static _sort;
    }
    class ASDoubleVector extends ASVector<ASNumber> {
        static instanceConstructor: any;
        static staticNatives: any[];
        static instanceNatives: any[];
        static callableConstructor: any;
        private static _every(o, callback, thisObject);
        private static _forEach(o, callback, thisObject);
        private static _some(o, callback, thisObject);
        private static _sort;
    }
    class ASJSON extends ASObject {
        static instanceConstructor: any;
        static staticNatives: any[];
        static instanceNatives: any[];
        /**
        * Transforms a JS value into an AS value.
        */
        private static transformJSValueToAS(value);
        /**
        * Transforms an AS value into a JS value.
        */
        private static transformASValueToJS(value);
        private static parseCore(text);
        private static stringifySpecializedToString(value, replacerArray, replacerFunction, gap);
    }
    class ASError extends ASNative {
        static instanceConstructor: any;
        static staticNatives: any[];
        static instanceNatives: any[];
        static getErrorMessage: typeof getErrorMessage;
        public getStackTrace(): string;
        constructor(msg?: any, id?: any);
    }
    class ASDefinitionError extends ASError {
    }
    class ASEvalError extends ASError {
    }
    class ASRangeError extends ASError {
    }
    class ASReferenceError extends ASError {
    }
    class ASSecurityError extends ASError {
    }
    class ASSyntaxError extends ASError {
    }
    class ASTypeError extends ASError {
    }
    class ASURIError extends ASError {
    }
    class ASVerifyError extends ASError {
    }
    class ASUninitializedError extends ASError {
    }
    class ASArgumentError extends ASError {
    }
    class ASRegExp extends ASObject {
        static instanceConstructor: any;
        static staticNatives: any[];
        static instanceNatives: any[];
        public native_source : string;
        public native_global : boolean;
        public native_ignoreCase : boolean;
        public native_multiline : boolean;
        public native_lastIndex : number;
        public native_dotall : boolean;
        public native_extended : boolean;
        public exec(s?: string): any;
    }
    class ASMath extends ASNative {
        static staticNatives: any[];
    }
    class ASDate extends ASNative {
        static staticNatives: any[];
        static instanceNatives: any[];
        static instanceConstructor: any;
    }
    function initialize(domain: Runtime.ApplicationDomain): void;
    function registerNativeClass(name: string, cls: ASClass): void;
    function registerNativeFunction(name: string, fn: Function): void;
    function createInterface(classInfo: ABC.ClassInfo): ASClass;
    function createClass(classInfo: ABC.ClassInfo, baseClass: ASClass, scope: Runtime.Scope): ASClass;
    /**
    * Searches for a native property in a list of native holders.
    */
    function getMethodOrAccessorNative(trait: ABC.Trait, natives: Object[]): any;
    /**
    * This is to avoid conflicts with JS properties.
    */
    function escapeNativeName(name: string): string;
    /**
    * Other natives can live in this module
    */
    module Natives {
        var String: any;
        var Function: any;
        var Boolean: any;
        var Number: any;
        var Date: any;
        var ASObject: typeof ASObject;
        /**
        * Make a copy of the original prototype functions in case they are patched. This is to
        * prevent cyycles.
        */
        var Original: {
            Date: {
                prototype: any;
            };
            Array: {
                prototype: any;
            };
            String: {
                prototype: any;
            };
            Number: {
                prototype: any;
            };
            Boolean: {
                prototype: any;
            };
        };
        function print(...args: any[]): void;
        function notImplemented(v: any): void;
        function debugBreak(v: any): void;
        function bugzilla(n: any): boolean;
        var decodeURI: (encodedURI: string) => string;
        var decodeURIComponent: (encodedURIComponent: string) => string;
        var encodeURI: (uri: string) => string;
        var encodeURIComponent: (uriComponent: string) => string;
        var isNaN: (number: number) => boolean;
        var isFinite: (number: number) => boolean;
        var parseInt: (s: string, radix?: number) => number;
        var parseFloat: (string: string) => number;
        var escape: (x: any) => any;
        var unescape: (x: any) => any;
        var isXMLName: (x: any) => any;
        /**
        * Returns the fully qualified class name of an object.
        */
        function getQualifiedClassName(value: any): string;
        /**
        * Returns the fully qualified class name of the base class of the object specified by the |value| parameter.
        */
        function getQualifiedSuperclassName(value: any): string;
        function getDefinitionByName(name: any): any;
        function describeTypeJSON(value: any, flags: number): any;
    }
    /**
    * Searchs for natives using a string path "a.b.c...".
    */
    function getNative(path: string): Function;
}
declare module Shumway.AVM2.AS {
    class GenericVector extends ASVector<Object> {
        static CASEINSENSITIVE: number;
        static DESCENDING: number;
        static UNIQUESORT: number;
        static RETURNINDEXEDARRAY: number;
        static NUMERIC: number;
        static defaultCompareFunction(a: any, b: any): number;
        static compare(a: any, b: any, options: any, compareFunction: any): number;
        static instanceConstructor: any;
        static staticNatives: any[];
        static instanceNatives: any[];
        private static _every(o, callback, thisObject);
        private static _forEach(o, callback, thisObject);
        private static _some(o, callback, thisObject);
        private static _sort;
        private _fixed;
        private _buffer;
        private _type;
        private _defaultValue;
        constructor(length: number, fixed: boolean, type: ASClass);
        /**
        * TODO: Need to really debug this, very tricky.
        */
        static applyType(type: ASClass): ASClass;
        private _fill(index, length, value);
        /**
        * Can't use Array.prototype.toString because it doesn't print |null|s the same way as AS3.
        */
        public toString(): string;
        /**
        * Executes a |callback| function with three arguments: element, index, the vector itself as well
        * as passing the |thisObject| as |this| for each of the elements in the vector. If any of the
        * callbacks return |false| the function terminates, otherwise it returns |true|.
        */
        public every(callback: Function, thisObject: Object): boolean;
        /**
        * Filters the elements for which the |callback| method returns |true|. The |callback| function
        * is called with three arguments: element, index, the vector itself as well as passing the |thisObject|
        * as |this| for each of the elements in the vector.
        */
        public filter(callback: any, thisObject: any): GenericVector;
        public some(callback: any, thisObject: any): boolean;
        public forEach(callback: any, thisObject: any): void;
        public map(callback: any, thisObject: any): GenericVector;
        public push(...args: any[]): void;
        public pop(): any;
        public reverse(): void;
        public sort(comparator: any): any[];
        public asGetNumericProperty(i: any): any;
        public _coerce(v: any): any;
        public asSetNumericProperty(i: any, v: any): void;
        public shift(): any;
        public _checkFixed(): void;
        public unshift(): void;
        public length : number;
        public fixed : boolean;
        /**
        * Delete |deleteCount| elements starting at |index| then insert |insertCount| elements
        * from |args| object starting at |offset|.
        */
        public _spliceHelper(index: any, insertCount: any, deleteCount: any, args: any, offset: any): void;
        public asNextName(index: number): any;
        public asNextValue(index: number): any;
        public asNextNameIndex(index: number): number;
        public asHasProperty(namespaces: any, name: any, flags: any): any;
        public asHasNext2(hasNext2Info: Runtime.HasNext2Info): void;
        public _reverse: () => void;
        public _filter: (callback: Function, thisObject: any) => any;
        public _map: (callback: Function, thisObject: any) => any;
    }
}
declare module Shumway.AVM2.AS {
    class ASNamespace extends ASObject {
        static staticNatives: any[];
        static instanceNatives: any[];
        static instanceConstructor: any;
        private _ns;
        private static _namespaceConstructor;
        private static _;
        static fromNamespace(ns: ABC.Namespace): ASNamespace;
        /**
        * 13.2.1 The Namespace Constructor Called as a Function
        *
        * Namespace ()
        * Namespace (uriValue)
        * Namespace (prefixValue, uriValue)
        */
        static callableConstructor: any;
        /**
        * 13.2.2 The Namespace Constructor
        *
        * Namespace ()
        * Namespace (uriValue)
        * Namespace (prefixValue, uriValue)
        */
        constructor(a?: any, b?: any);
        public prefix : any;
        public uri : string;
    }
    class ASQName extends ASNative {
        static instanceConstructor: any;
        /**
        * 13.3.1 The QName Constructor Called as a Function
        *
        * QName ( )
        * QName ( Name )
        * QName ( Namespace , Name )
        */
        static callableConstructor: any;
        public _mn: ABC.Multiname;
        public _flags: number;
        static fromMultiname(mn: ABC.Multiname): ASQName;
        /**
        * 13.3.2 The QName Constructor
        *
        * new QName ()
        * new QName (Name)
        * new QName (Namespace, Name)
        */
        constructor(a?: any, b?: any, c?: boolean);
        public localName : string;
        public uri : string;
        /**
        * 13.3.5.3 [[Prefix]]
        * The [[Prefix]] property is an optional internal property that is not directly visible to users. It may be used by implementations that preserve prefixes in qualified names.
        * The value of the [[Prefix]] property is a value of type string or undefined. If the [[Prefix]] property is undefined, the prefix associated with this QName is unknown.
        */
        public prefix : string;
        /**
        * 13.3.5.4 [[GetNamespace]] ( [ InScopeNamespaces ] )
        *
        * The [[GetNamespace]] method is an internal method that returns a Namespace object with a URI matching the URI of this QName. InScopeNamespaces is an optional parameter.
        * If InScopeNamespaces is unspecified, it is set to the empty set. If one or more Namespaces exists in InScopeNamespaces with a URI matching the URI of this QName, one
        * of the matching Namespaces will be returned. If no such namespace exists in InScopeNamespaces, [[GetNamespace]] creates and returns a new Namespace with a URI matching
        * that of this QName. For implementations that preserve prefixes in QNames, [[GetNamespace]] may return a Namespace that also has a matching prefix. The input argument
        * InScopeNamespaces is a set of Namespace objects.
        */
        public getNamespace(inScopeNamespaces?: ASNamespace[]): ASNamespace;
    }
    class ASXML extends ASNative {
        static instanceConstructor: any;
        static callableConstructor: any;
        static defaultNamespace: string;
        private static _flags;
        private static _prettyIndent;
        private _name;
        private _parent;
        private _attributes;
        private _inScopeNamespaces;
        private _kind;
        private _children;
        private _value;
        constructor(value?: any);
        public init(kind: number, uri: any, name: any, prefix: any): ASXML;
        public length(): number;
        public _deepCopy(): ASXML;
        public resolveValue(): ASXML;
        public _addInScopeNamespaces(ns: any): void;
        static ignoreComments : boolean;
        static ignoreProcessingInstructions : boolean;
        static ignoreWhitespace : boolean;
        static prettyPrinting : boolean;
        static prettyIndent : number;
        public toString(): string;
        public native_hasOwnProperty(P?: any): boolean;
        public native_propertyIsEnumerable(P?: any): boolean;
        public addNamespace(ns: any): ASXML;
        public appendChild(child: any): ASXML;
        public attribute(arg: any): ASXMLList;
        public attributes(): ASXMLList;
        public child(propertyName: any): ASXMLList;
        public childIndex(): number;
        public children(): ASXMLList;
        public contains(value: any): boolean;
        public copy(): ASXML;
        public elements(name?: any): ASXMLList;
        public hasComplexContent(): boolean;
        public hasSimpleContent(): boolean;
        public inScopeNamespaces(): any[];
        public insertChildAfter(child1: any, child2: any): any;
        public insertChildBefore(child1: any, child2: any): any;
        public localName(): Object;
        public name(): Object;
        private _namespace(prefix, argc);
        public namespaceDeclarations(): any[];
        public nodeKind(): string;
        public normalize(): ASXML;
        public parent(): any;
        public processingInstructions(name?: any): ASXMLList;
        public prependChild(value: any): ASXML;
        public removeNamespace(ns: any): ASXML;
        public setChildren(value: any): ASXML;
        public setLocalName(name: any): void;
        public setName(name: any): void;
        public setNamespace(ns: any): void;
        public toXMLString(): string;
        public notification(): Function;
        public setNotification(f: Function): any;
        static isTraitsOrDynamicPrototype(value: any): boolean;
        public asGetEnumerableKeys(): any;
        public setProperty(p: any, isAttribute: any, v: any): void;
        public asSetProperty(namespaces: ABC.Namespace[], name: any, flags: number, value: any): any;
        public getProperty(mn: any, isAttribute: any, isMethod: any): any;
        public asGetNumericProperty(name: number): any;
        public asSetNumericProperty(name: number, value: any): void;
        public asGetProperty(namespaces: ABC.Namespace[], name: any, flags: number): any;
        public hasProperty(mn: any, isAttribute?: any, isMethod?: any): boolean;
        public asHasProperty(namespaces: ABC.Namespace[], name: any, flags: number): any;
        public asHasPropertyInternal(namespaces: ABC.Namespace[], name: any, flags: number): any;
        public asCallProperty(namespaces: ABC.Namespace[], name: any, flags: number, isLex: boolean, args: any[]): any;
        public _delete(key: any, isMethod: any): void;
        public deleteByIndex(p: any): void;
        public insert(p: any, v: any): void;
        public replace(p: any, v: any): ASXML;
        public addInScopeNamespace(ns: ASNamespace): void;
        public descendants(name?: any): ASXMLList;
        public comments(): any;
        public text(): any;
    }
    class ASXMLList extends ASNative {
        static instanceConstructor: any;
        static callableConstructor: any;
        private _children;
        constructor(value?: any);
        public toString(): string;
        public _deepCopy(): any;
        public hasOwnProperty(P?: any): boolean;
        public propertyIsEnumerable(P?: any): boolean;
        public attribute(arg: any): ASXMLList;
        public attributes(): ASXMLList;
        public child(propertyName: any): ASXMLList;
        public children(): ASXMLList;
        public comments(): ASXMLList;
        public contains(value: any): boolean;
        public copy(): ASXMLList;
        public elements(name?: any): ASXMLList;
        public hasComplexContent(): boolean;
        public hasSimpleContent(): boolean;
        public length(): number;
        public name(): Object;
        public normalize(): ASXMLList;
        public parent(): any;
        public processingInstructions(name?: any): ASXMLList;
        public text(): ASXMLList;
        public toXMLString(): string;
        public addNamespace(ns: any): ASXML;
        public appendChild(child: any): any;
        public childIndex(): number;
        public inScopeNamespaces(): any[];
        public insertChildAfter(child1: any, child2: any): any;
        public insertChildBefore(child1: any, child2: any): any;
        public nodeKind(): string;
        private _namespace(prefix, argc);
        public localName(): Object;
        public namespaceDeclarations(): any[];
        public prependChild(value: any): ASXML;
        public removeNamespace(ns: any): ASXML;
        public replace(propertyName: any, value: any): ASXML;
        public setChildren(value: any): ASXML;
        public setLocalName(name: any): void;
        public setName(name: any): void;
        public setNamespace(ns: any): void;
        static isTraitsOrDynamicPrototype(value: any): boolean;
        public asGetEnumerableKeys(): any;
        public getProperty(mn: any, isAttribute: any, isMethod: any): any;
        public asGetNumericProperty(name: number): any;
        public asSetNumericProperty(name: number, value: any): void;
        public asGetProperty(namespaces: ABC.Namespace[], name: any, flags: number): any;
        public hasProperty(mn: any, isAttribute: any): boolean;
        public asHasProperty(namespaces: ABC.Namespace[], name: any, flags: number): any;
        public asHasPropertyInternal(namespaces: ABC.Namespace[], name: any, flags: number): boolean;
        public setProperty(mn: any, isAttribute: any, value: any): void;
        public asSetProperty(namespaces: ABC.Namespace[], name: any, flags: number, value: any): any;
        public asCallProperty(namespaces: ABC.Namespace[], name: any, flags: number, isLex: boolean, args: any[]): any;
    }
}
declare module Shumway.AVM2.AS {
    function describeTypeJSON(o: any, flags: number): any;
}
declare module Shumway.AVM2.AS {
    module flash.utils {
        /**
        * TODO: We need a more robust Dictionary implementation that doesn't only give you back
        * string keys when enumerating.
        */
        class Dictionary extends ASNative {
            static isTraitsOrDynamicPrototype(value: any): boolean;
            static protocol: IProtocol;
            private map;
            private keys;
            private weakKeys;
            private primitiveMap;
            constructor(weakKeys?: boolean);
            static makePrimitiveKey(key: any): any;
            private init(weakKeys);
            public asGetNumericProperty(name: number): any;
            public asSetNumericProperty(name: number, value: any): void;
            public asGetProperty(namespaces: ABC.Namespace[], name: any, flags: number): any;
            public asSetProperty(namespaces: ABC.Namespace[], name: any, flags: number, value: any): any;
            public asHasProperty(namespaces: ABC.Namespace[], name: any, flags: number): any;
            public asDeleteProperty(namespaces: ABC.Namespace[], name: any, flags: number): any;
            public asGetEnumerableKeys(): any;
        }
        var OriginalDictionary: typeof Dictionary;
    }
}
declare module Shumway.AVM2.AS {
    module flash.utils {
        /**
        * The Proxy class lets you override the default behavior of ActionScript operations (such as retrieving and modifying properties) on an object.
        */
        class Proxy extends ASNative {
            static protocol: IProtocol;
            public asGetProperty(namespaces: ABC.Namespace[], name: any, flags: number): any;
            public asGetNumericProperty(name: number): any;
            public asSetNumericProperty(name: number, value: any): void;
            public asSetProperty(namespaces: ABC.Namespace[], name: any, flags: number, value: any): void;
            public asCallProperty(namespaces: ABC.Namespace[], name: any, flags: number, isLex: boolean, args: any[]): any;
            public asHasProperty(namespaces: ABC.Namespace[], name: any, flags: number): any;
            public asHasOwnProperty(namespaces: ABC.Namespace[], name: any, flags: number): any;
            public asDeleteProperty(namespaces: ABC.Namespace[], name: any, flags: number): any;
            public asNextName(index: number): any;
            public asNextValue(index: number): any;
            public asNextNameIndex(index: number): number;
        }
        var OriginalProxy: typeof Proxy;
    }
}
declare module Shumway.AVM2.AS {
    module flash.net {
        class ObjectEncoding extends ASNative {
            static AMF0: number;
            static AMF3: number;
            static DEFAULT: number;
        }
    }
    module flash.utils {
        interface IDataInput {
            readBytes: (bytes: ByteArray, offset?: number, length?: number) => void;
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
            readObject: () => any;
            objectEncoding: number;
            endian: string;
        }
        interface IDataOutput {
            writeBytes: (bytes: ByteArray, offset?: number, length?: number) => void;
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
            writeObject: (object: any) => void;
            objectEncoding: number;
            endian: string;
        }
        class ByteArray extends ASNative implements IDataInput, IDataOutput {
            static instanceConstructor: any;
            static staticNatives: any[];
            static instanceNatives: any[];
            static callableConstructor: any;
            static initializer: (source: any) => void;
            static protocol: IProtocol;
            private static INITIAL_SIZE;
            private static _defaultObjectEncoding;
            static defaultObjectEncoding : number;
            constructor();
            private _buffer;
            private _length;
            private _position;
            private _littleEndian;
            private _objectEncoding;
            private _bitBuffer;
            private _bitLength;
            private _cacheViews;
            public asGetNumericProperty: (name: number) => number;
            public asSetNumericProperty: (name: number, value: number) => void;
            public readBytes: (bytes: ByteArray, offset?: number, length?: number) => void;
            public readBoolean: () => boolean;
            public readByte: () => number;
            public readUnsignedByte: () => number;
            public readShort: () => number;
            public readUnsignedShort: () => number;
            public readInt: () => number;
            public readUnsignedInt: () => number;
            public readFloat: () => number;
            public readDouble: () => number;
            public readMultiByte: (length: number, charSet: string) => string;
            public readUTF: () => string;
            public readUTFBytes: (length: number) => string;
            public bytesAvailable: number;
            public readObject(): any;
            public writeBytes: (bytes: ByteArray, offset?: number, length?: number) => void;
            public writeBoolean: (value: boolean) => void;
            public writeByte: (value: number) => void;
            public writeShort: (value: number) => void;
            public writeInt: (value: number) => void;
            public writeUnsignedInt: (value: number) => void;
            public writeFloat: (value: number) => void;
            public writeDouble: (value: number) => void;
            public writeMultiByte: (value: string, charSet: string) => void;
            public writeUTF: (value: string) => void;
            public writeUTFBytes: (value: string) => void;
            public writeObject(object: any): void;
            public objectEncoding: number;
            public endian: string;
            public readRawBytes: () => Int8Array;
            public writeRawBytes: (bytes: Uint8Array) => void;
            public position: number;
            public length: number;
        }
        var OriginalByteArray: typeof ByteArray;
    }
}
declare module Shumway.AVM2.AS {
    module flash.system {
        class IME extends ASNative {
            constructor();
            public enabled : boolean;
            public conversionMode : string;
            static setCompositionString(composition: string): void;
            static doConversion(): void;
            static compositionSelectionChanged(start: number, end: number): void;
            static compositionAbandoned(): void;
            static _checkSupported(): boolean;
        }
        class System extends ASNative {
            static ime : IME;
            static setClipboard(string: string): void;
            static totalMemoryNumber : number;
            static freeMemory : number;
            static privateMemory : number;
            static processCPUUsage : number;
            static useCodePage : boolean;
            static vmVersion : string;
            static pause(): void;
            static resume(): void;
            static exit(code: number): void;
            static gc(): void;
            static pauseForGCIfCollectionImminent(imminence?: number): void;
            static disposeXML(node: ASXML): void;
            static swfVersion : number;
            static apiVersion : number;
            static getArgv(): any[];
            static getRunmode(): string;
        }
        var OriginalSystem: typeof System;
    }
}
declare module Shumway.AVM2.Verifier {
    class VerifierError {
        public message: string;
        public name: string;
        constructor(message?: string);
    }
    class TypeInformation {
        public type: Type;
        public baseClass: any;
        public object: any;
        public scopeDepth: number;
        public trait: ABC.Trait;
        public noCoercionNeeded: boolean;
        public noCallSuperNeeded: boolean;
    }
    class Type {
        static Any: AtomType;
        static Null: AtomType;
        static Void: AtomType;
        static Undefined: AtomType;
        static Int: TraitsType;
        static Uint: TraitsType;
        static Class: TraitsType;
        static Array: TraitsType;
        static Object: TraitsType;
        static String: TraitsType;
        static Number: TraitsType;
        static Boolean: TraitsType;
        static Function: TraitsType;
        static XML: TraitsType;
        static XMLList: TraitsType;
        static Dictionary: TraitsType;
        static _cache: {
            byQN: Map<Type>;
            byHash: Map<Type>;
        };
        static from(info: ABC.Info, domain: Runtime.ApplicationDomain): Type;
        static fromSimpleName(name: string, domain: Runtime.ApplicationDomain): TraitsType;
        static fromName(mn: ABC.Multiname, domain: Runtime.ApplicationDomain): Type;
        private static _typesInitialized;
        static initializeTypes(domain: Runtime.ApplicationDomain): void;
        public equals(other: Type): boolean;
        public merge(other: Type): Type;
        public instanceType(): Type;
        public classType(): Type;
        public super(): Type;
        public applyType(parameter: Type): any;
        public getTrait(mn: Type, isSetter: boolean, followSuperType: boolean): ABC.Trait;
        public isNumeric(): boolean;
        public isString(): boolean;
        public isScriptInfo(): boolean;
        public isClassInfo(): boolean;
        public isInstanceInfo(): boolean;
        public isMethodInfo(): boolean;
        public isTraitsType(): boolean;
        public isParameterizedType(): boolean;
        public isMethodType(): boolean;
        public isMultinameType(): boolean;
        public isConstantType(): boolean;
        public isSubtypeOf(other: Type): boolean;
        public asTraitsType(): TraitsType;
        public asMethodType(): MethodType;
        public asMultinameType(): MultinameType;
        public asConstantType(): ConstantType;
        public getConstantValue(): any;
        public asParameterizedType(): ParameterizedType;
    }
    class AtomType extends Type {
        public name: string;
        public symbol: string;
        constructor(name: string, symbol: string);
        public toString(): string;
        public instanceType(): Type;
    }
    class TraitsType extends Type {
        public info: ABC.Info;
        public domain: Runtime.ApplicationDomain;
        public _cachedType: Type;
        constructor(info: ABC.Info, domain: Runtime.ApplicationDomain);
        public instanceType(): TraitsType;
        public classType(): TraitsType;
        public super(): TraitsType;
        public findTraitByName(traits: ABC.Trait[], mn: any, isSetter: boolean): any;
        public getTrait(mn: Type, isSetter: boolean, followSuperType: boolean): ABC.Trait;
        public getTraitAt(slotId: number): any;
        public equals(other: Type): boolean;
        public merge(other: Type): Type;
        public isScriptInfo(): boolean;
        public isClassInfo(): boolean;
        public isMethodInfo(): boolean;
        public isInstanceInfo(): boolean;
        public isInstanceOrClassInfo(): boolean;
        public applyType(parameter: Type): ParameterizedType;
        private _getInfoName();
        public toString(): string;
    }
    class MethodType extends TraitsType {
        public methodInfo: ABC.MethodInfo;
        constructor(methodInfo: ABC.MethodInfo, domain: Runtime.ApplicationDomain);
        public toString(): string;
        public returnType(): Type;
    }
    class MultinameType extends Type {
        public namespaces: Type[];
        public name: Type;
        public flags: number;
        constructor(namespaces: Type[], name: Type, flags: number);
        public toString(): string;
    }
    class ParameterizedType extends TraitsType {
        public type: TraitsType;
        public parameter: Type;
        constructor(type: TraitsType, parameter: Type);
    }
    class ConstantType extends Type {
        public value: any;
        constructor(value: any);
        public toString(): string;
        static from(value: any): ConstantType;
        static fromArray(array: any[]): ConstantType[];
    }
    /**
    * Abstract Program State
    */
    class State {
        static id: number;
        public id: number;
        public originalId: number;
        public stack: Type[];
        public scope: Type[];
        public local: Type[];
        constructor();
        public clone(): State;
        public trace(writer: IndentingWriter): void;
        public toString(): string;
        public equals(other: State): boolean;
        private static _arrayEquals(a, b);
        public isSubset(other: State): boolean;
        private static _arraySubset(a, b);
        public merge(other: State): void;
        private static _mergeArrays(a, b);
    }
    class Verifier {
        private _prepareScopeObjects(methodInfo, scope);
        public verifyMethod(methodInfo: ABC.MethodInfo, scope: Runtime.Scope): void;
    }
}
/**
* SSA-based Sea-of-Nodes IR based on Cliff Click's Work: A simple graph-based intermediate
* representation (http://doi.acm.org/10.1145/202530.202534)
*
* Node Hierarchy:
*
* Node
*  - Control
*    - Region
*      - Start
*    - End
*      - Stop
*      - If
*      - Jump
*  - Value
*    - Constant, Parameter, Phi, Binary, GetProperty ...
*
* Control flow is modeled with control edges rather than with CFGs. Each basic block is represented
* as a region node which has control dependencies on predecessor regions. Nodes that are dependent
* on the execution of a region, have a |control| property assigned to the region they belong to.
*
* Memory (and the external world) is modeled as an SSA value called the Store. Nodes that mutate the
* Store produce a new Store.
*
* Nodes that produce multiple values, such as Ifs which produce two values (a True and False control
* value) can have their values projected (extracted) using Projection nodes.
*
* A node scheduler is responsible for serializing nodes back into a CFG such that all dependencies
* are satisfied.
*
* Compiler Pipeline:
*
* Graph Builder -> IR (DFG) -> Optimizations -> CFG -> Restructuring -> Backend
*
*/
declare module Shumway.AVM2.Compiler.IR {
    interface NodeVisitor {
        (node: Node): void;
    }
    interface BlockVisitor {
        (block: Block): void;
    }
    enum Flags {
        NumericProperty = 1,
        RESOLVED = 2,
        PRISTINE = 4,
        IS_METHOD = 8,
        AS_CALL = 16,
    }
    class Node {
        public abstract: boolean;
        private static _nextID;
        static getNextID(): number;
        public id: number;
        public control: Control;
        public nodeName: string;
        public variable: Variable;
        public mustFloat: boolean;
        public shouldFloat: boolean;
        public shouldNotFloat: boolean;
        constructor();
        public compile: (cx: any) => void;
        public visitInputs(visitor: NodeVisitor): void;
        static startNumbering(): void;
        static stopNumbering(): void;
        public toString(brief?: boolean): any;
        public visitInputsNoConstants(visitor: NodeVisitor): void;
        public replaceInput(oldInput: Node, newInput: Node): number;
    }
    class Control extends Node {
        constructor();
    }
    class Region extends Control {
        public entryState: any;
        public predecessors: Control[];
        constructor(control: Control);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Start extends Region {
        public scope: Node;
        constructor();
        public visitInputs(visitor: NodeVisitor): void;
    }
    class End extends Control {
        public control: Control;
        constructor(control: Control);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Stop extends End {
        public store: Store;
        public argument: Value;
        constructor(control: Control, store: Store, argument: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class If extends End {
        public predicate: Value;
        constructor(control: Control, predicate: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Switch extends End {
        public determinant: Value;
        constructor(control: any, determinant: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Jump extends End {
        constructor(control: any);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Value extends Node {
        public ty: Verifier.Type;
        constructor();
    }
    class Store extends Value {
        constructor();
    }
    class StoreDependent extends Value {
        public control: Control;
        public store: Store;
        public loads: Node[];
        constructor(control: Control, store: Store);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Call extends StoreDependent {
        public callee: Value;
        public object: Value;
        public args: Value[];
        public flags: number;
        constructor(control: Control, store: Store, callee: Value, object: Value, args: Value[], flags: number);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class New extends StoreDependent {
        public callee: Value;
        public args: Value[];
        constructor(control: Control, store: Store, callee: Value, args: Value[]);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class GetProperty extends StoreDependent {
        public object: Value;
        public name: Value;
        constructor(control: Control, store: Store, object: Value, name: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class SetProperty extends StoreDependent {
        public object: Value;
        public name: Value;
        public value: Value;
        constructor(control: Control, store: Store, object: Value, name: Value, value: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class DeleteProperty extends StoreDependent {
        public object: Value;
        public name: Value;
        constructor(control: any, store: any, object: Value, name: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class CallProperty extends StoreDependent {
        public object: Value;
        public name: Value;
        public args: Value[];
        public flags: number;
        constructor(control: Control, store: Store, object: Value, name: Value, args: Value[], flags: number);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Phi extends Value {
        public control: Control;
        public isLoop: boolean;
        public sealed: boolean;
        public args: Value[];
        constructor(control: Control, value: Value);
        public visitInputs(visitor: NodeVisitor): void;
        public seal(): void;
        public pushValue(x: Value): void;
    }
    class Variable extends Value {
        public name: string;
        constructor(name: string);
    }
    class Copy extends Value {
        public argument: Value;
        constructor(argument: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Move extends Value {
        public to: Variable;
        public from: Value;
        constructor(to: Variable, from: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    enum ProjectionType {
        CASE = 0,
        TRUE = 1,
        FALSE = 2,
        STORE = 3,
        SCOPE = 4,
    }
    class Projection extends Value {
        public argument: Node;
        public type: ProjectionType;
        public selector: Constant;
        constructor(argument: Node, type: ProjectionType, selector?: Constant);
        public visitInputs(visitor: NodeVisitor): void;
        public project(): Node;
    }
    class Latch extends Value {
        public control: Control;
        public condition: Value;
        public left: Value;
        public right: Value;
        constructor(control: Control, condition: Value, left: Value, right: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Operator {
        public name: string;
        public evaluate: Function;
        public isBinary: boolean;
        public not: Operator;
        static byName: Map<Operator>;
        constructor(name: string, evaluate: Function, isBinary: boolean);
        static ADD: Operator;
        static SUB: Operator;
        static MUL: Operator;
        static DIV: Operator;
        static MOD: Operator;
        static AND: Operator;
        static OR: Operator;
        static XOR: Operator;
        static LSH: Operator;
        static RSH: Operator;
        static URSH: Operator;
        static SEQ: Operator;
        static SNE: Operator;
        static EQ: Operator;
        static NE: Operator;
        static LE: Operator;
        static GT: Operator;
        static LT: Operator;
        static GE: Operator;
        static PLUS: Operator;
        static NEG: Operator;
        static TRUE: Operator;
        static FALSE: Operator;
        static TYPE_OF: Operator;
        static BITWISE_NOT: Operator;
        static AS_ADD: Operator;
        static linkOpposites(a: Operator, b: Operator): void;
        static fromName(name: string): Operator;
    }
    class Binary extends Value {
        public operator: Operator;
        public left: Value;
        public right: Value;
        constructor(operator: Operator, left: Value, right: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Unary extends Value {
        public operator: Operator;
        public argument: Value;
        constructor(operator: Operator, argument: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Constant extends Value {
        public value: any;
        constructor(value: any);
    }
    class GlobalProperty extends Value {
        public name: string;
        constructor(name: string);
    }
    class This extends Value {
        public control: Control;
        constructor(control: Control);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Throw extends Value {
        public control: Control;
        public argument: Value;
        constructor(control: Control, argument: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Arguments extends Value {
        public control: Control;
        constructor(control: Control);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class Parameter extends Value {
        public control: Control;
        public index: number;
        public name: string;
        constructor(control: Control, index: number, name: string);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class NewArray extends Value {
        public control: Control;
        public elements: Value[];
        constructor(control: Control, elements: Value[]);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class NewObject extends Value {
        public control: Control;
        public properties: KeyValuePair[];
        constructor(control: Control, properties: KeyValuePair[]);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class KeyValuePair extends Value {
        public key: Value;
        public value: Value;
        constructor(key: Value, value: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    function nameOf(node: any): any;
}
declare module Shumway.AVM2.Compiler.IR {
    function isNotPhi(phi: any): boolean;
    function isPhi(phi: any): boolean;
    function isScope(scope: any): boolean;
    function isMultinameConstant(node: any): boolean;
    function isMultiname(name: any): boolean;
    function isStore(store: any): boolean;
    function isConstant(constant: any): boolean;
    function isControlOrNull(control: any): boolean;
    function isStoreOrNull(store: any): boolean;
    function isControl(control: any): boolean;
    function isValueOrNull(value: any): boolean;
    function isValue(value: any): boolean;
    function isProjection(node: any, type: any): boolean;
    var Null: Constant;
    var Undefined: Constant;
    var True: Constant;
    var False: Constant;
    class Block {
        public id: number;
        public rpo: number;
        public name: string;
        public phis: Phi[];
        public nodes: Node[];
        public region: Node;
        public dominator: Block;
        public successors: Block[];
        public predecessors: Block[];
        /**
        * This is added by the codegen.
        */
        public compile: (cx: any, state: any) => void;
        /**
        * This is stuff added on by the looper which needs to be really cleaned up.
        */
        public dominatees: Block[];
        public npredecessors: number;
        public level: number;
        public frontier: any;
        constructor(id: number, start?: Region, end?: Node);
        public pushSuccessorAt(successor: Block, index: number, pushPredecessor?: boolean): void;
        public pushSuccessor(successor: Block, pushPredecessor?: boolean): void;
        public pushPredecessor(predecessor: Block): void;
        public visitNodes(fn: NodeVisitor): void;
        public visitSuccessors(fn: BlockVisitor): void;
        public visitPredecessors(fn: BlockVisitor): void;
        public append(node: Node): void;
        public toString(): string;
        public trace(writer: IndentingWriter): void;
    }
    class DFG {
        public exit: Node;
        public start: Node;
        constructor(exit: Node);
        public buildCFG(): CFG;
        static preOrderDepthFirstSearch(root: any, visitChildren: any, pre: any): void;
        static postOrderDepthFirstSearch(root: any, visitChildren: any, post: any): void;
        public forEachInPreOrderDepthFirstSearch(visitor: any): void;
        public forEach(visitor: any, postOrder: boolean): void;
        public traceMetrics(writer: IndentingWriter): void;
        public trace(writer: IndentingWriter): void;
    }
    class Uses {
        public entries: any[];
        constructor();
        public addUse(def: any, use: any): void;
        public trace(writer: any): void;
        public replace(def: any, value: any): boolean;
        public updateUses(def: any, value: any, useEntries: any, writer: any): boolean;
    }
    class CFG {
        public dfg: DFG;
        public exit: Block;
        public root: Block;
        public order: Block[];
        public blocks: Block[];
        public nextBlockID: number;
        public blockNames: Map<Block>;
        public setConstructor: any;
        constructor();
        static fromDFG(dfg: any): CFG;
        /**
        * Makes sure root node has no predecessors and that there is only one
        * exit node.
        */
        public buildRootAndExit(): void;
        public fromString(list: any, rootName: any): void;
        public buildBlock(start: any, end: any): Block;
        public createBlockSet(): any;
        public computeReversePostOrder(): Block[];
        public depthFirstSearch(preFn: any, postFn?: any): void;
        public computeDominators(apply: any): Int32Array;
        public computeLoops(): void;
        /**
        * Computes def-use chains.
        *
        * () -> Map[id -> {def:Node, uses:Array[Node]}]
        */
        public computeUses(): Uses;
        public verify(): void;
        /**
        * Simplifies phis of the form:
        *
        * replace |x = phi(y)| -> y
        * replace |x = phi(x, y)| -> y
        * replace |x = phi(y, y, x, y, x)| -> |phi(y, x)| -> y
        */
        public optimizePhis(): void;
        /**
        * "A critical edge is an edge which is neither the only edge leaving its source block, nor the only edge entering
        * its destination block. These edges must be split: a new block must be created in the middle of the edge, in order
        * to insert computations on the edge without affecting any other edges." - Wikipedia
        */
        public splitCriticalEdges(): number;
        /**
        * Allocate virtual registers and break out of SSA.
        */
        public allocateVariables(): void;
        public scheduleEarly(): void;
        public trace(writer: IndentingWriter): void;
    }
    /**
    * Peephole optimizations:
    */
    class PeepholeOptimizer {
        public foldUnary(node: any, truthy?: any): any;
        public foldBinary(node: any, truthy?: any): any;
        public fold(node: any, truthy?: any): any;
    }
}
declare module Shumway.AVM2.Compiler {
    function compileMethod(methodInfo: ABC.MethodInfo, scope: Runtime.Scope, hasDynamicScope: any): Backend.Compilation;
}
/**
* Examples:
*
* Compiling individual player globals abcs.
*
* find ~/Workspaces/Shumway/build/playerglobal/flash -name "*.abc" | xargs js avm.js -a -verify {} >> player.as.js
*
* Compiling against a list of .abcs
*
* js avm.js -c -verify ../generated/builtin/builtin.abc ../generated/playerGlobal/playerGlobal.min.abc `find ~/Workspaces/Shumway/build/playerglobal/flash -name "*.abc"`  ~/Dropbox/shumway/games/min/MiningTruck.swf
*
*/
declare module Shumway.AVM2.Compiler {
    function compileAbc(abc: ABC.AbcFile, writer: IndentingWriter): void;
}
/**
* Like most JITs we don't need all the fancy AST serialization, this
* is a quick and dirty AST writer.
*/
declare module Shumway.AVM2.Compiler.AST {
    class Node {
        public type: string;
        public toSource(precedence: number): string;
    }
    class Statement extends Node {
    }
    class Expression extends Node {
    }
    class Program extends Node {
        public body: Node[];
        constructor(body: Node[]);
    }
    class EmptyStatement extends Statement {
    }
    class BlockStatement extends Statement {
        public body: Statement[];
        public end: IR.Node;
        constructor(body: Statement[]);
        public toSource(precedence: number): string;
    }
    class ExpressionStatement extends Statement {
        public expression: Expression;
        constructor(expression: Expression);
        public toSource(precedence: number): string;
    }
    class IfStatement extends Statement {
        public test: Expression;
        public consequent: Statement;
        public alternate: Statement;
        constructor(test: Expression, consequent: Statement, alternate: Statement);
        public toSource(precedence: number): string;
    }
    class LabeledStatement extends Statement {
        public label: Identifier;
        public body: Statement;
        constructor(label: Identifier, body: Statement);
    }
    class BreakStatement extends Statement {
        public label: Identifier;
        constructor(label: Identifier);
        public toSource(precedence: number): string;
    }
    class ContinueStatement extends Statement {
        public label: Identifier;
        constructor(label: Identifier);
        public toSource(precedence: number): string;
    }
    class WithStatement extends Statement {
        public object: Expression;
        public body: Statement;
        constructor(object: Expression, body: Statement);
    }
    class SwitchStatement extends Statement {
        public discriminant: Expression;
        public cases: SwitchCase[];
        public lexical: boolean;
        constructor(discriminant: Expression, cases: SwitchCase[], lexical: boolean);
        public toSource(precedence: number): string;
    }
    class ReturnStatement extends Statement {
        public argument: Expression;
        constructor(argument: Expression);
        public toSource(precedence: number): string;
    }
    class ThrowStatement extends Statement {
        public argument: Expression;
        constructor(argument: Expression);
        public toSource(precedence: number): string;
    }
    class TryStatement extends Statement {
        public block: BlockStatement;
        public handlers: CatchClause;
        public guardedHandlers: CatchClause[];
        public finalizer: BlockStatement;
        constructor(block: BlockStatement, handlers: CatchClause, guardedHandlers: CatchClause[], finalizer: BlockStatement);
    }
    class WhileStatement extends Statement {
        public test: Expression;
        public body: Statement;
        constructor(test: Expression, body: Statement);
        public toSource(precedence: number): string;
    }
    class DoWhileStatement extends Statement {
        public body: Statement;
        public test: Expression;
        constructor(body: Statement, test: Expression);
    }
    class ForStatement extends Statement {
        public init: Node;
        public test: Expression;
        public update: Expression;
        public body: Statement;
        constructor(init: Node, test: Expression, update: Expression, body: Statement);
    }
    class ForInStatement extends Statement {
        public left: Node;
        public right: Expression;
        public body: Statement;
        public each: boolean;
        constructor(left: Node, right: Expression, body: Statement, each: boolean);
    }
    class DebuggerStatement extends Statement {
    }
    class Declaration extends Statement {
    }
    class FunctionDeclaration extends Declaration {
        public id: Identifier;
        public params: Node[];
        public defaults: Expression[];
        public rest: Identifier;
        public body: BlockStatement;
        public generator: boolean;
        public expression: boolean;
        constructor(id: Identifier, params: Node[], defaults: Expression[], rest: Identifier, body: BlockStatement, generator: boolean, expression: boolean);
    }
    class VariableDeclaration extends Declaration {
        public declarations: VariableDeclarator[];
        public kind: string;
        constructor(declarations: VariableDeclarator[], kind: string);
        public toSource(precedence: number): string;
    }
    class VariableDeclarator extends Node {
        public id: Node;
        public init: Node;
        constructor(id: Node, init?: Node);
        public toSource(precedence: number): string;
    }
    class Identifier extends Expression {
        public name: string;
        constructor(name: string);
        public toSource(precedence: number): string;
    }
    class Literal extends Expression {
        public value: any;
        constructor(value: any);
        public toSource(precedence: number): string;
    }
    class ThisExpression extends Expression {
        public toSource(precedence: number): string;
    }
    class ArrayExpression extends Expression {
        public elements: Expression[];
        constructor(elements: Expression[]);
        public toSource(precedence: number): string;
    }
    class ObjectExpression extends Expression {
        public properties: Property[];
        constructor(properties: Property[]);
        public toSource(precedence: number): string;
    }
    class FunctionExpression extends Expression {
        public id: Identifier;
        public params: Node[];
        public defaults: Expression[];
        public rest: Identifier;
        public body: BlockStatement;
        public generator: boolean;
        public expression: boolean;
        constructor(id: Identifier, params: Node[], defaults: Expression[], rest: Identifier, body: BlockStatement, generator: boolean, expression: boolean);
    }
    class SequenceExpression extends Expression {
        public expressions: Expression[];
        constructor(expressions: Expression[]);
    }
    class UnaryExpression extends Expression {
        public operator: string;
        public prefix: boolean;
        public argument: Expression;
        constructor(operator: string, prefix: boolean, argument: Expression);
        public toSource(precedence: number): string;
    }
    class BinaryExpression extends Expression {
        public operator: string;
        public left: Expression;
        public right: Expression;
        constructor(operator: string, left: Expression, right: Expression);
        public toSource(precedence: number): string;
    }
    class AssignmentExpression extends Expression {
        public operator: string;
        public left: Expression;
        public right: Expression;
        constructor(operator: string, left: Expression, right: Expression);
        public toSource(precedence: number): string;
    }
    class UpdateExpression extends Expression {
        public operator: string;
        public argument: Expression;
        public prefix: boolean;
        constructor(operator: string, argument: Expression, prefix: boolean);
    }
    class LogicalExpression extends BinaryExpression {
        constructor(operator: string, left: Expression, right: Expression);
    }
    class ConditionalExpression extends Expression {
        public test: Expression;
        public consequent: Expression;
        public alternate: Expression;
        constructor(test: Expression, consequent: Expression, alternate: Expression);
        public toSource(precedence: number): string;
    }
    class NewExpression extends Expression {
        public callee: Expression;
        public arguments: Expression[];
        constructor(callee: Expression, _arguments: Expression[]);
        public toSource(precedence: number): string;
    }
    class CallExpression extends Expression {
        public callee: Expression;
        public arguments: Expression[];
        constructor(callee: Expression, _arguments: Expression[]);
        public toSource(precedence: number): string;
    }
    class MemberExpression extends Expression {
        public object: Expression;
        public property: Node;
        public computed: boolean;
        constructor(object: Expression, property: Node, computed: boolean);
        public toSource(precedence: number): string;
    }
    class Property extends Node {
        public key: Node;
        public value: Expression;
        public kind: string;
        constructor(key: Node, value: Expression, kind: string);
        public toSource(precedence: number): string;
    }
    class SwitchCase extends Node {
        public test: Expression;
        public consequent: Statement[];
        constructor(test: Expression, consequent: Statement[]);
        public toSource(precedence: number): string;
    }
    class CatchClause extends Node {
        public param: Node;
        public guard: Expression;
        public body: BlockStatement;
        constructor(param: Node, guard: Expression, body: BlockStatement);
    }
}
declare module Shumway.AVM2.Compiler.IR {
    class ASScope extends Value {
        public parent: ASScope;
        public object: Value;
        public isWith: boolean;
        constructor(parent: ASScope, object: Value, isWith: boolean);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class ASMultiname extends Value {
        public namespaces: Value;
        public name: Value;
        public flags: number;
        constructor(namespaces: Value, name: Value, flags: number);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class ASCallProperty extends CallProperty {
        public isLex: boolean;
        constructor(control: Control, store: Store, object: Value, name: Value, args: Value[], flags: number, isLex: boolean);
    }
    class ASCallSuper extends CallProperty {
        public scope: ASScope;
        constructor(control: Control, store: Store, object: Value, name: Value, args: Value[], flags: number, scope: ASScope);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class ASNew extends New {
        constructor(control: Control, store: Store, callee: Value, args: Value[]);
    }
    class ASGetProperty extends GetProperty {
        public flags: number;
        constructor(control: Control, store: Store, object: Value, name: Value, flags: number);
    }
    class ASGetDescendants extends GetProperty {
        constructor(control: Control, store: Store, object: Value, name: Value);
    }
    class ASHasProperty extends GetProperty {
        constructor(control: Control, store: Store, object: Value, name: Value);
    }
    class ASGetSlot extends GetProperty {
        constructor(control: Control, store: Store, object: Value, name: Value);
    }
    class ASGetSuper extends GetProperty {
        public scope: ASScope;
        constructor(control: Control, store: Store, object: Value, name: Value, scope: ASScope);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class ASSetProperty extends SetProperty {
        public flags: number;
        constructor(control: Control, store: Store, object: Value, name: Value, value: Value, flags: number);
    }
    class ASSetSlot extends SetProperty {
        constructor(control: Control, store: Store, object: Value, name: Value, value: Value);
    }
    class ASSetSuper extends SetProperty {
        public scope: Value;
        constructor(control: Control, store: Store, object: Value, name: Value, value: Value, scope: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class ASDeleteProperty extends DeleteProperty {
        constructor(control: Control, store: Store, object: Value, name: Value);
    }
    class ASFindProperty extends StoreDependent {
        public scope: ASScope;
        public name: Value;
        public methodInfo: Constant;
        public strict: boolean;
        constructor(control: Control, store: Store, scope: ASScope, name: Value, methodInfo: Constant, strict: boolean);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class ASGlobal extends Value {
        public control: Control;
        public scope: Value;
        constructor(control: Control, scope: Value);
        public visitInputs(visitor: NodeVisitor): void;
    }
    class ASNewActivation extends Value {
        public methodInfo: Constant;
        constructor(methodInfo: Constant);
    }
    class ASNewHasNext2 extends Value {
        constructor();
    }
}
declare module Shumway.AVM2.Compiler.Looper {
    module Control {
        enum Kind {
            SEQ = 1,
            LOOP = 2,
            IF = 3,
            CASE = 4,
            SWITCH = 5,
            LABEL_CASE = 6,
            LABEL_SWITCH = 7,
            EXIT = 8,
            BREAK = 9,
            CONTINUE = 10,
            TRY = 11,
            CATCH = 12,
        }
        class ControlNode {
            public kind: Kind;
            constructor(kind: Kind);
            public compile: (cx: Backend.Context) => AST.Node;
        }
        class Seq extends ControlNode {
            public body: any;
            constructor(body: any);
            public trace(writer: any): void;
            public first(): any;
            public slice(begin: any, end: any): Seq;
        }
        class Loop extends ControlNode {
            public body: any;
            constructor(body: any);
            public trace(writer: any): void;
        }
        class If extends ControlNode {
            public cond: any;
            public then: any;
            public nothingThrownLabel: any;
            public negated: boolean;
            public else: any;
            constructor(cond: any, then: any, els: any, nothingThrownLabel?: any);
            public trace(writer: any): void;
        }
        class Case extends ControlNode {
            public index: any;
            public body: any;
            constructor(index: any, body: any);
            public trace(writer: any): void;
        }
        class Switch extends ControlNode {
            public determinant: any;
            public cases: any;
            public nothingThrownLabel: any;
            constructor(determinant: any, cases: any, nothingThrownLabel?: any);
            public trace(writer: any): void;
        }
        class LabelCase extends ControlNode {
            public labels: any;
            public body: any;
            constructor(labels: any, body: any);
            public trace(writer: any): void;
        }
        class LabelSwitch extends ControlNode {
            public cases: any;
            public labelMap: any;
            constructor(cases: any);
            public trace(writer: any): void;
        }
        class Exit extends ControlNode {
            public label: any;
            constructor(label: any);
            public trace(writer: any): void;
        }
        class Break extends ControlNode {
            public label: any;
            public head: any;
            constructor(label: any, head: any);
            public trace(writer: any): void;
        }
        class Continue extends ControlNode {
            public label: any;
            public head: any;
            public necessary: boolean;
            constructor(label: any, head: any);
            public trace(writer: any): void;
        }
        class Try extends ControlNode {
            public body: any;
            public catches: any;
            public nothingThrownLabel: boolean;
            constructor(body: any, catches: any);
            public trace(writer: any): void;
        }
        class Catch extends ControlNode {
            public varName: any;
            public typeName: any;
            public body: any;
            constructor(varName: any, typeName: any, body: any);
            public trace(writer: any): void;
        }
    }
    class BlockSet extends BitSets.Uint32ArrayBitSet {
        public blockById: Map<IR.Block>;
        constructor(length: number, blockById: Map<IR.Block>);
        public forEachBlock(fn: IR.BlockVisitor): void;
        public choose(): IR.Block;
        public members(): IR.Block[];
        public setBlocks(bs: IR.Block[]): void;
    }
    class Analysis {
        public blocks: IR.Block[];
        public boundBlockSet: any;
        public analyzedControlFlow: boolean;
        public markedLoops: boolean;
        public hasExceptions: boolean;
        public restructuredControlFlow: boolean;
        public controlTree: Control.ControlNode;
        constructor(cfg: IR.CFG);
        public makeBlockSetFactory(length: number, blockById: IR.Block[]): void;
        public normalizeReachableBlocks(root: any): void;
        public computeDominance(): void;
        public computeFrontiers(): void;
        public analyzeControlFlow(): boolean;
        public markLoops(): boolean;
        public induceControlTree(): void;
        public restructureControlFlow(): boolean;
    }
    function analyze(cfg: IR.CFG): Control.ControlNode;
}
declare module Shumway.AVM2.Compiler.Backend {
    class Context {
        public label: IR.Variable;
        public variables: any[];
        public constants: any[];
        public parameters: any[];
        public useConstant(constant: IR.Constant): number;
        public useVariable(variable: IR.Variable): number;
        public useParameter(parameter: IR.Parameter): IR.Parameter;
        public compileLabelBody(node: any): any[];
        public compileBreak(node: any): Compiler.AST.BlockStatement;
        public compileContinue(node: any): Compiler.AST.BlockStatement;
        public compileExit(node: any): Compiler.AST.BlockStatement;
        public compileIf(node: any): any;
        public compileSwitch(node: any): any;
        public compileLabelSwitch(node: any): any;
        public compileLoop(node: any): Compiler.AST.WhileStatement;
        public compileSequence(node: any): Compiler.AST.BlockStatement;
        public compileBlock(block: any): Compiler.AST.BlockStatement;
    }
    class Compilation {
        public parameters: string[];
        public body: string;
        public constants: Object[];
        constructor(parameters: string[], body: string, constants: Object[]);
    }
    function generate(cfg: any): Compilation;
}
declare module Shumway.AVM2.Runtime {
    function executeScript(script: any): void;
    function ensureScriptIsExecuted(script: any, reason?: string): void;
    enum Glue {
        PUBLIC_PROPERTIES = 1,
        PUBLIC_METHODS = 2,
        ALL,
    }
    var playerglobalLoadedPromise: any;
    var playerglobal: any;
    class AVM2 {
        public systemDomain: ApplicationDomain;
        public applicationDomain: ApplicationDomain;
        public findDefiningAbc: (mn: ABC.Multiname) => ABC.AbcFile;
        public exception: any;
        public exceptions: any[];
        public globals: Map<any>;
        public builtinsLoaded: boolean;
        private _loadAVM1;
        private _loadAVM1Promise;
        static instance: AVM2;
        static initialize(sysMode: ExecutionMode, appMode: ExecutionMode, loadAVM1?: (next: any) => void): void;
        constructor(sysMode: ExecutionMode, appMode: ExecutionMode, loadAVM1: (next: any) => void);
        static currentAbc(): any;
        static currentDomain(): any;
        static isPlayerglobalLoaded(): boolean;
        public loadAVM1(): Promise<void>;
        static loadPlayerglobal(abcsPath: any, catalogPath: any): any;
        public notifyConstruct(instanceConstructor: any, args: any): void;
        static getStackTrace(): string;
    }
    class ApplicationDomain {
        public vm: AVM2;
        public abcs: ABC.AbcFile[];
        public loadedAbcs: any;
        public loadedClasses: any;
        public classCache: any;
        public scriptCache: any;
        public classInfoCache: any;
        public base: ApplicationDomain;
        public allowNatives: boolean;
        public mode: ExecutionMode;
        public onMessage: Callback;
        public system: any;
        constructor(vm: AVM2, base: ApplicationDomain, mode: ExecutionMode, allowNatives: boolean);
        static passthroughCallable(f: any): {
            call: ($this: any) => any;
            apply: ($this: any, args: any) => any;
        };
        static coerceCallable(type: any): {
            call: ($this: any, value: any) => any;
            apply: ($this: any, args: any) => any;
        };
        public getType(multiname: any): any;
        public getProperty(multiname: any, strict: any, execute: any): any;
        public getClass(simpleName: any): AS.ASClass;
        public findClass(simpleName: any): any;
        public findDomainProperty(multiname: any, strict: any, execute: any): any;
        public findClassInfo(mn: any): any;
        /**
        * Find the first script that defines a multiname.
        *
        * ABCs are added to the list in load order, so a later loaded ABC with a
        * definition of conflicting name will never be resolved.
        */
        public findDefiningScript(mn: any, execute: any): any;
        public compileAbc(abc: any, writer: any): void;
        public executeAbc(abc: ABC.AbcFile): void;
        public loadAbc(abc: ABC.AbcFile): void;
        public broadcastMessage(type: any, message: any, origin: any): void;
        public traceLoadedClasses(lastOnly: any): void;
    }
    class SecurityDomain {
        public compartment: any;
        public systemDomain: ApplicationDomain;
        public applicationDomain: ApplicationDomain;
        constructor(compartmentPath: string);
        public initializeShell(sysMode: any, appMode: any): void;
    }
}
declare var Glue: typeof Shumway.AVM2.Runtime.Glue;
declare module Shumway.AVM2.Runtime {
    function getMethodOverrideKey(methodInfo: any): any;
    function checkMethodOverrides(methodInfo: any): any;
    interface ITrampoline extends Function {
        trigger: () => void;
        isTrampoline: boolean;
        debugName: string;
        patchTargets: IPatchTarget[];
    }
    interface IMemoizer extends Function {
        isMemoizer: boolean;
        debugName: string;
    }
    /**
    * Creates a trampoline function stub which calls the result of a |forward| callback. The forward
    * callback is only executed the first time the trampoline is executed and its result is cached in
    * the trampoline closure.
    */
    function makeTrampoline(forward: Function, parameterLength: number, description?: string): ITrampoline;
    function makeMemoizer(qn: any, target: any): IMemoizer;
    function isMemoizer(fn: any): any;
}
declare module Shumway.AVM2 {
    class Interpreter {
        static interpretMethod($this: any, method: any, savedScope: any, methodArgs: any): any;
    }
}
/**
* Random collection of Hacks to get demos work, this file should be empty.
*/
declare module Shumway.AVM2.Runtime {
}
declare module Shumway.AVM2 {
    enum AMF0Marker {
        NUMBER = 0,
        BOOLEAN = 1,
        STRING = 2,
        OBJECT = 3,
        NULL = 5,
        UNDEFINED = 6,
        REFERENCE = 7,
        ECMA_ARRAY = 0,
        OBJECT_END = 9,
        STRICT_ARRAY = 10,
        DATE = 11,
        LONG_STRING = 12,
        XML = 15,
        TYPED_OBJECT = 16,
        AVMPLUS = 17,
    }
    class AMF0 {
        static write(ba: AS.flash.utils.ByteArray, obj: any): void;
        static read(ba: AS.flash.utils.ByteArray): any;
    }
    enum AMF3Marker {
        UNDEFINED = 0,
        NULL = 1,
        FALSE = 2,
        TRUE = 3,
        INTEGER = 4,
        DOUBLE = 5,
        STRING = 6,
        XML_DOC = 7,
        DATE = 8,
        ARRAY = 9,
        OBJECT = 10,
        XML = 11,
        BYTEARRAY = 12,
        VECTOR_INT = 13,
        VECTOR_UINT = 14,
        VECTOR_DOUBLE = 15,
        VECTOR_OBJECT = 16,
        DICTIONARY = 17,
    }
    class AMF3 {
        static write(ba: AS.flash.utils.ByteArray, object: any): void;
        static read(ba: AS.flash.utils.ByteArray): any;
    }
}
