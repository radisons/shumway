/// <reference path="avm2.d.ts" />
/// <reference path="../../src/avm1/flash.d.ts" />
declare module Shumway.AVM1 {
    class ActionsDataStream {
        private array;
        public position: number;
        public end: number;
        private readANSI;
        constructor(array: any, swfVersion: any);
        public readUI8(): number;
        public readUI16(): number;
        public readSI16(): number;
        public readInteger(): number;
        public readFloat(): number;
        public readDouble(): number;
        public readBoolean(): boolean;
        public readANSIString(): string;
        public readUTF8String(): string;
        public readString(): string;
        public readBytes(length: any): Uint8Array;
    }
}
declare module Shumway.AVM1 {
    enum ActionCode {
        None = 0,
        ActionGotoFrame = 129,
        ActionGetURL = 131,
        ActionNextFrame = 4,
        ActionPreviousFrame = 5,
        ActionPlay = 6,
        ActionStop = 7,
        ActionToggleQuality = 8,
        ActionStopSounds = 9,
        ActionWaitForFrame = 138,
        ActionSetTarget = 139,
        ActionGoToLabel = 140,
        ActionPush = 150,
        ActionPop = 23,
        ActionAdd = 10,
        ActionSubtract = 11,
        ActionMultiply = 12,
        ActionDivide = 13,
        ActionEquals = 14,
        ActionLess = 15,
        ActionAnd = 16,
        ActionOr = 17,
        ActionNot = 18,
        ActionStringEquals = 19,
        ActionStringLength = 20,
        ActionMBStringLength = 49,
        ActionStringAdd = 33,
        ActionStringExtract = 21,
        ActionMBStringExtract = 53,
        ActionStringLess = 41,
        ActionToInteger = 24,
        ActionCharToAscii = 50,
        ActionMBCharToAscii = 54,
        ActionAsciiToChar = 51,
        ActionMBAsciiToChar = 55,
        ActionJump = 153,
        ActionIf = 157,
        ActionCall = 158,
        ActionGetVariable = 28,
        ActionSetVariable = 29,
        ActionGetURL2 = 154,
        ActionGotoFrame2 = 159,
        ActionSetTarget2 = 32,
        ActionGetProperty = 34,
        ActionSetProperty = 35,
        ActionCloneSprite = 36,
        ActionRemoveSprite = 37,
        ActionStartDrag = 39,
        ActionEndDrag = 40,
        ActionWaitForFrame2 = 141,
        ActionTrace = 38,
        ActionGetTime = 52,
        ActionRandomNumber = 48,
        ActionCallFunction = 61,
        ActionCallMethod = 82,
        ActionConstantPool = 136,
        ActionDefineFunction = 155,
        ActionDefineLocal = 60,
        ActionDefineLocal2 = 65,
        ActionDelete = 58,
        ActionDelete2 = 59,
        ActionEnumerate = 70,
        ActionEquals2 = 73,
        ActionGetMember = 78,
        ActionInitArray = 66,
        ActionInitObject = 67,
        ActionNewMethod = 83,
        ActionNewObject = 64,
        ActionSetMember = 79,
        ActionTargetPath = 69,
        ActionWith = 148,
        ActionToNumber = 74,
        ActionToString = 75,
        ActionTypeOf = 68,
        ActionAdd2 = 71,
        ActionLess2 = 72,
        ActionModulo = 63,
        ActionBitAnd = 96,
        ActionBitLShift = 99,
        ActionBitOr = 97,
        ActionBitRShift = 100,
        ActionBitURShift = 101,
        ActionBitXor = 98,
        ActionDecrement = 81,
        ActionIncrement = 80,
        ActionPushDuplicate = 76,
        ActionReturn = 62,
        ActionStackSwap = 77,
        ActionStoreRegister = 135,
        ActionInstanceOf = 84,
        ActionEnumerate2 = 85,
        ActionStrictEquals = 102,
        ActionGreater = 103,
        ActionStringGreater = 104,
        ActionDefineFunction2 = 142,
        ActionExtends = 105,
        ActionCastOp = 43,
        ActionImplementsOp = 44,
        ActionTry = 143,
        ActionThrow = 42,
        ActionFSCommand2 = 45,
        ActionStrictMode = 137,
    }
    class ParsedPushRegisterAction {
        public registerNumber: number;
        constructor(registerNumber: number);
    }
    class ParsedPushConstantAction {
        public constantIndex: number;
        constructor(constantIndex: number);
    }
    interface ParsedAction {
        position: number;
        actionCode: number;
        actionName: string;
        args: any[];
    }
    interface ArgumentAssignment {
        type: ArgumentAssignmentType;
        name?: string;
        index?: number;
    }
    enum ArgumentAssignmentType {
        None = 0,
        Argument = 1,
        This = 2,
        Arguments = 4,
        Super = 8,
        Global = 16,
        Parent = 32,
        Root = 64,
    }
    class ActionsDataParser {
        public stream: ActionsDataStream;
        public dataId: string;
        constructor(stream: ActionsDataStream);
        public position : number;
        public eof : boolean;
        public length : number;
        public readNext(): ParsedAction;
        public skip(count: any): void;
    }
}
declare module Shumway.AVM1 {
    interface ActionCodeBlock {
        label: number;
        items: ActionCodeBlockItem[];
        jump: number;
    }
    interface ActionCodeBlockItem {
        action: ParsedAction;
        next: number;
        conditionalJumpTo: number;
    }
    interface AnalyzerResults {
        /** Sparsed array with compiled actions, index is an original location
        *  in the binary actions data */
        actions: ActionCodeBlockItem[];
        blocks: ActionCodeBlock[];
        dataId: string;
    }
    class ActionsDataAnalyzer {
        constructor();
        public analyze(parser: ActionsDataParser): AnalyzerResults;
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
declare module Shumway.AVM1 {
    class AS2ActionsData {
        public bytes: Uint8Array;
        public id: string;
        public ir: any;
        constructor(bytes: Uint8Array, id: string);
    }
    class AS2Context {
        static instance: AS2Context;
        public stage: any;
        public classes: any;
        public globals: AVM2.AS.avm1lib.AS2Globals;
        constructor();
        static create: (swfVersion: number) => AS2Context;
        public flushPendingScripts(): void;
        public addAsset(className: string, symbolProps: any): void;
        public getAsset(className: string): any;
        public resolveTarget(target: any): any;
        public resolveLevel(level: number): any;
        public addToPendingScripts(fn: any): void;
        public executeActions(actionsData: AS2ActionsData, stage: any, scopeObj: any): void;
    }
}
declare module Shumway.AVM1 {
    var avm1TraceEnabled: any;
    var avm1ErrorsEnabled: any;
    var avm1TimeoutDisabled: any;
    var avm1CompilerEnabled: any;
    var avm1DebuggerEnabled: any;
    var Debugger: {
        pause: boolean;
        breakpoints: {};
    };
    function executeActions(actionsData: AS2ActionsData, as2Context: AS2Context, scope: any): void;
}
declare module Shumway.AVM1 {
    class AS2Utils extends AVM2.AS.ASNative {
        static classInitializer: any;
        static initializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static addProperty(obj: AVM2.AS.ASObject, propertyName: string, getter: () => any, setter: (v: any) => any, enumerable?: boolean): any;
        static resolveTarget(target_mc?: any): any;
        static resolveLevel(level: number): any;
        static currentStage : any;
        static getAS2Object(as3Object: any): any;
        static _installObjectMethods(): any;
    }
    function initDefaultListeners(thisArg: any): void;
    function getAS2Object(as3Object: any): any;
}
declare module Shumway.AVM2.AS.avm1lib {
    class AS2Button extends ASNative {
        static classInitializer: any;
        static initializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(nativeButton: flash.display.SimpleButton);
        private _requiredListeners;
        private _actions;
        private _nativeAS3Object;
        public _init(nativeButton: flash.display.SimpleButton): any;
        private _addListeners();
        private _removeListeners();
        private _keyDownHandler(event);
        private _mouseEventHandler(type);
        private _runAction(action);
        public _as3Object : flash.display.SimpleButton;
    }
}
declare module Shumway.AVM2.AS.avm1lib {
    class AS2Globals extends ASNative {
        static classInitializer: any;
        static initializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        public _global: any;
        public flash: ASObject;
        public $asfunction: (link: any) => any;
        public call: (frame: any) => any;
        public chr: (number: any) => any;
        public clearInterval: ASFunction;
        public clearTimeout: ASFunction;
        public duplicateMovieClip: (target: any, newname: any, depth: any) => any;
        public fscommand: (...rest: any[]) => any;
        public getAS2Property: (target: any, index: any) => any;
        public getTimer: () => number;
        public getURL: (url: any, target: any, method?: any) => any;
        public getVersion: () => any;
        public gotoAndPlay: (scene: any, frame?: any) => any;
        public gotoAndStop: (scene: any, frame?: any) => any;
        public gotoLabel: (label: any) => any;
        public ifFrameLoaded: (scene: any, frame?: any) => any;
        public int: (value: any) => any;
        public length: (expression: any) => number;
        public loadMovie: (url: string, target: ASObject, method: string) => void;
        public loadMovieNum: (url: any, level: any, method: any) => any;
        public loadVariables: (url: string, target: ASObject, method?: string) => void;
        public mbchr: (number: any) => any;
        public mblength: (expression: any) => any;
        public mbord: (character: any) => any;
        public mbsubstring: (value: any, index: any, count: any) => any;
        public nextFrame: () => any;
        public nextScene: () => any;
        public ord: (character: any) => any;
        public play: () => any;
        public prevFrame: () => any;
        public prevScene: () => any;
        public print: (target: any, boundingBox: any) => any;
        public printAsBitmap: (target: any, boundingBox: any) => any;
        public printAsBitmapNum: (level: any, boundingBox: any) => any;
        public printNum: (level: any, bondingBox: any) => any;
        public random: (value: any) => any;
        public removeMovieClip: (target: any) => any;
        public setInterval: () => any;
        public setAS2Property: (target: any, index: any, value: any) => any;
        public setTimeout: () => any;
        public showRedrawRegions: (enable: any, color: any) => any;
        public startDrag: (target: any, lock: any, left: any, top: any, right: any, bottom: any) => any;
        public stop: () => any;
        public stopAllSounds: () => any;
        public stopDrag: (target?: any) => any;
        public substring: (value: any, index: any, count: any) => any;
        public targetPath: (target: any) => any;
        public toggleHighQuality: () => any;
        public unloadMovie: (target: any) => any;
        public unloadMovieNum: (level: any) => any;
        public updateAfterEvent: () => any;
        static _addInternalClasses(proto: ASObject): void;
        public ASSetPropFlags(obj: any, children: any, flags: any, allowFalse: any): any;
        public _addToPendingScripts(subject: ASObject, fn: ASFunction, args?: any[]): any;
        /**
        * AS2 escapes slightly more characters than JS's encodeURIComponent, and even more than
        * the deprecated JS version of escape. That leaves no other option but to do manual post-
        * processing of the encoded result. :/
        *
        * Luckily, unescape isn't thus afflicted - it happily unescapes all the additional things
        * we escape here.
        */
        public escape(str: string): string;
        public unescape(str: string): string;
        public _setLevel(level: number, loader: flash.display.Loader): any;
        public trace(expression: any): any;
    }
}
declare var globalEscape: any;
declare module Shumway.AVM2.AS.avm1lib {
    class AS2MovieClip extends ASNative {
        static classInitializer: any;
        static initializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(nativeMovieClip: flash.display.MovieClip);
        private _nativeAS3Object;
        public __lookupChild: (id: string) => any;
        public __targetPath: any;
        public _init(nativeMovieClip: flash.display.MovieClip): any;
        public _as3Object : flash.display.MovieClip;
        public attachBitmap(bmp: AS2BitmapData, depth: number, pixelSnapping?: String, smoothing?: Boolean): void;
        public _constructMovieClipSymbol(symbolId: string, name: string): flash.display.MovieClip;
        public _callFrame(frame: any): any;
        public _insertChildAtDepth(mc: any, depth: number): AS2MovieClip;
        public getInstanceAtDepth(depth: number): AS2MovieClip;
        public getNextHighestDepth(): number;
        public _duplicate(name: any, depth: any, initObject: any): any;
        public _gotoLabel(label: any): any;
    }
}
declare module Shumway.AVM2.AS.avm1lib {
    class AS2MovieClipLoader extends ASNative {
        static classInitializer: any;
        static initializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        private _nativeAS3Object;
        public _as3Object : flash.display.Loader;
        public _setAS3Object(nativeLoader: flash.display.Loader): any;
        public _bytesLoaded : number;
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
* limitations undxr the License.
*/
declare module Shumway.AVM2.AS.avm1lib {
    class AS2BitmapData extends BitmapData {
        static classInitializer: any;
        static initializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(bitmapData: flash.display.BitmapData, pixelSnapping: string, smoothing: boolean);
        static loadBitmap(symbolId: string): flash.display.BitmapData;
    }
}
declare module Shumway.AVM2.AS.avm1lib {
    class AS2TextField extends ASNative {
        static classInitializer: any;
        static initializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(nativeTextField: flash.text.TextField);
        private _nativeAS3Object;
        public _variable: string;
        public _init(nativeTextField: flash.text.TextField): any;
        public _as3Object : flash.text.TextField;
        public variable : any;
    }
}
declare module Shumway.AVM2.AS.avm1lib {
    class AS2TextFormat extends TextFormat {
        private static _measureTextField;
        public _as2GetTextExtent(text: string, width?: number): {};
    }
}
