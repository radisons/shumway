var Shumway;
(function (Shumway) {
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
    (function (AVM1) {
        var ActionsDataStream = (function () {
            function ActionsDataStream(array, swfVersion) {
                this.array = array;
                this.position = 0;
                this.end = array.length;

                // TODO use system locale to determine if the shift-JIS
                // decoding is necessary
                this.readANSI = swfVersion < 6;

                // endianess sanity check
                var buffer = new ArrayBuffer(4);
                (new Int32Array(buffer))[0] = 1;
                if (!(new Uint8Array(buffer))[0]) {
                    throw new Error("big-endian platform");
                }
            }
            ActionsDataStream.prototype.readUI8 = function () {
                return this.array[this.position++];
            };
            ActionsDataStream.prototype.readUI16 = function () {
                var position = this.position, array = this.array;
                var value = (array[position + 1] << 8) | array[position];
                this.position = position + 2;
                return value;
            };
            ActionsDataStream.prototype.readSI16 = function () {
                var position = this.position, array = this.array;
                var value = (array[position + 1] << 8) | array[position];
                this.position = position + 2;
                return value < 0x8000 ? value : (value - 0x10000);
            };
            ActionsDataStream.prototype.readInteger = function () {
                var position = this.position, array = this.array;
                var value = array[position] | (array[position + 1] << 8) | (array[position + 2] << 16) | (array[position + 3] << 24);
                this.position = position + 4;
                return value;
            };
            ActionsDataStream.prototype.readFloat = function () {
                var position = this.position;
                var array = this.array;
                var buffer = new ArrayBuffer(4);
                var bytes = new Uint8Array(buffer);
                bytes[0] = array[position];
                bytes[1] = array[position + 1];
                bytes[2] = array[position + 2];
                bytes[3] = array[position + 3];
                this.position = position + 4;
                return (new Float32Array(buffer))[0];
            };
            ActionsDataStream.prototype.readDouble = function () {
                var position = this.position;
                var array = this.array;
                var buffer = new ArrayBuffer(8);
                var bytes = new Uint8Array(buffer);
                bytes[4] = array[position];
                bytes[5] = array[position + 1];
                bytes[6] = array[position + 2];
                bytes[7] = array[position + 3];
                bytes[0] = array[position + 4];
                bytes[1] = array[position + 5];
                bytes[2] = array[position + 6];
                bytes[3] = array[position + 7];
                this.position = position + 8;
                return (new Float64Array(buffer))[0];
            };
            ActionsDataStream.prototype.readBoolean = function () {
                return !!this.readUI8();
            };
            ActionsDataStream.prototype.readANSIString = function () {
                var value = '';
                var ch;
                while ((ch = this.readUI8())) {
                    value += String.fromCharCode(ch);
                }
                return value;
            };
            ActionsDataStream.prototype.readUTF8String = function () {
                var value = '';
                var ch;
                while ((ch = this.readUI8())) {
                    if (ch < 0x80) {
                        value += String.fromCharCode(ch);
                        continue;
                    }

                    if ((ch & 0xC0) === 0x80) {
                        throw new Error('Invalid UTF8 encoding');
                    }

                    var currentPrefix = 0xC0;
                    var validBits = 5;
                    do {
                        var mask = (currentPrefix >> 1) | 0x80;
                        if ((ch & mask) === currentPrefix) {
                            break;
                        }
                        currentPrefix = mask;
                        --validBits;
                    } while(validBits >= 0);

                    var code = (ch & ((1 << validBits) - 1));
                    for (var i = 5; i >= validBits; --i) {
                        ch = this.readUI8();
                        if ((ch & 0xC0) !== 0x80) {
                            throw new Error('Invalid UTF8 encoding');
                        }
                        code = (code << 6) | (ch & 0x3F);
                    }

                    if (code >= 0x10000) {
                        value += String.fromCharCode((((code - 0x10000) >> 10) & 0x3FF) | 0xD800, (code & 0x3FF) | 0xDC00);
                    } else {
                        value += String.fromCharCode(code);
                    }
                }
                return value;
            };
            ActionsDataStream.prototype.readString = function () {
                return this.readANSI ? this.readANSIString() : this.readUTF8String();
            };
            ActionsDataStream.prototype.readBytes = function (length) {
                var position = this.position;
                var remaining = Math.max(this.end - position, 0);
                if (remaining < length) {
                    length = remaining;
                }
                var subarray = this.array.subarray(position, position + length);
                this.position = position + length;
                return subarray;
            };
            return ActionsDataStream;
        })();
        AVM1.ActionsDataStream = ActionsDataStream;
    })(Shumway.AVM1 || (Shumway.AVM1 = {}));
    var AVM1 = Shumway.AVM1;
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
    (function (AVM1) {
        (function (ActionCode) {
            ActionCode[ActionCode["None"] = 0x00] = "None";
            ActionCode[ActionCode["ActionGotoFrame"] = 0x81] = "ActionGotoFrame";
            ActionCode[ActionCode["ActionGetURL"] = 0x83] = "ActionGetURL";
            ActionCode[ActionCode["ActionNextFrame"] = 0x04] = "ActionNextFrame";
            ActionCode[ActionCode["ActionPreviousFrame"] = 0x05] = "ActionPreviousFrame";
            ActionCode[ActionCode["ActionPlay"] = 0x06] = "ActionPlay";
            ActionCode[ActionCode["ActionStop"] = 0x07] = "ActionStop";
            ActionCode[ActionCode["ActionToggleQuality"] = 0x08] = "ActionToggleQuality";
            ActionCode[ActionCode["ActionStopSounds"] = 0x09] = "ActionStopSounds";
            ActionCode[ActionCode["ActionWaitForFrame"] = 0x8A] = "ActionWaitForFrame";
            ActionCode[ActionCode["ActionSetTarget"] = 0x8B] = "ActionSetTarget";
            ActionCode[ActionCode["ActionGoToLabel"] = 0x8C] = "ActionGoToLabel";
            ActionCode[ActionCode["ActionPush"] = 0x96] = "ActionPush";
            ActionCode[ActionCode["ActionPop"] = 0x17] = "ActionPop";
            ActionCode[ActionCode["ActionAdd"] = 0x0A] = "ActionAdd";
            ActionCode[ActionCode["ActionSubtract"] = 0x0B] = "ActionSubtract";
            ActionCode[ActionCode["ActionMultiply"] = 0x0C] = "ActionMultiply";
            ActionCode[ActionCode["ActionDivide"] = 0x0D] = "ActionDivide";
            ActionCode[ActionCode["ActionEquals"] = 0x0E] = "ActionEquals";
            ActionCode[ActionCode["ActionLess"] = 0x0F] = "ActionLess";
            ActionCode[ActionCode["ActionAnd"] = 0x10] = "ActionAnd";
            ActionCode[ActionCode["ActionOr"] = 0x11] = "ActionOr";
            ActionCode[ActionCode["ActionNot"] = 0x12] = "ActionNot";
            ActionCode[ActionCode["ActionStringEquals"] = 0x13] = "ActionStringEquals";
            ActionCode[ActionCode["ActionStringLength"] = 0x14] = "ActionStringLength";
            ActionCode[ActionCode["ActionMBStringLength"] = 0x31] = "ActionMBStringLength";
            ActionCode[ActionCode["ActionStringAdd"] = 0x21] = "ActionStringAdd";
            ActionCode[ActionCode["ActionStringExtract"] = 0x15] = "ActionStringExtract";
            ActionCode[ActionCode["ActionMBStringExtract"] = 0x35] = "ActionMBStringExtract";
            ActionCode[ActionCode["ActionStringLess"] = 0x29] = "ActionStringLess";
            ActionCode[ActionCode["ActionToInteger"] = 0x18] = "ActionToInteger";
            ActionCode[ActionCode["ActionCharToAscii"] = 0x32] = "ActionCharToAscii";
            ActionCode[ActionCode["ActionMBCharToAscii"] = 0x36] = "ActionMBCharToAscii";
            ActionCode[ActionCode["ActionAsciiToChar"] = 0x33] = "ActionAsciiToChar";
            ActionCode[ActionCode["ActionMBAsciiToChar"] = 0x37] = "ActionMBAsciiToChar";
            ActionCode[ActionCode["ActionJump"] = 0x99] = "ActionJump";
            ActionCode[ActionCode["ActionIf"] = 0x9D] = "ActionIf";
            ActionCode[ActionCode["ActionCall"] = 0x9E] = "ActionCall";
            ActionCode[ActionCode["ActionGetVariable"] = 0x1C] = "ActionGetVariable";
            ActionCode[ActionCode["ActionSetVariable"] = 0x1D] = "ActionSetVariable";
            ActionCode[ActionCode["ActionGetURL2"] = 0x9A] = "ActionGetURL2";
            ActionCode[ActionCode["ActionGotoFrame2"] = 0x9F] = "ActionGotoFrame2";
            ActionCode[ActionCode["ActionSetTarget2"] = 0x20] = "ActionSetTarget2";
            ActionCode[ActionCode["ActionGetProperty"] = 0x22] = "ActionGetProperty";
            ActionCode[ActionCode["ActionSetProperty"] = 0x23] = "ActionSetProperty";
            ActionCode[ActionCode["ActionCloneSprite"] = 0x24] = "ActionCloneSprite";
            ActionCode[ActionCode["ActionRemoveSprite"] = 0x25] = "ActionRemoveSprite";
            ActionCode[ActionCode["ActionStartDrag"] = 0x27] = "ActionStartDrag";
            ActionCode[ActionCode["ActionEndDrag"] = 0x28] = "ActionEndDrag";
            ActionCode[ActionCode["ActionWaitForFrame2"] = 0x8D] = "ActionWaitForFrame2";
            ActionCode[ActionCode["ActionTrace"] = 0x26] = "ActionTrace";
            ActionCode[ActionCode["ActionGetTime"] = 0x34] = "ActionGetTime";
            ActionCode[ActionCode["ActionRandomNumber"] = 0x30] = "ActionRandomNumber";
            ActionCode[ActionCode["ActionCallFunction"] = 0x3D] = "ActionCallFunction";
            ActionCode[ActionCode["ActionCallMethod"] = 0x52] = "ActionCallMethod";
            ActionCode[ActionCode["ActionConstantPool"] = 0x88] = "ActionConstantPool";
            ActionCode[ActionCode["ActionDefineFunction"] = 0x9B] = "ActionDefineFunction";
            ActionCode[ActionCode["ActionDefineLocal"] = 0x3C] = "ActionDefineLocal";
            ActionCode[ActionCode["ActionDefineLocal2"] = 0x41] = "ActionDefineLocal2";
            ActionCode[ActionCode["ActionDelete"] = 0x3A] = "ActionDelete";
            ActionCode[ActionCode["ActionDelete2"] = 0x3B] = "ActionDelete2";
            ActionCode[ActionCode["ActionEnumerate"] = 0x46] = "ActionEnumerate";
            ActionCode[ActionCode["ActionEquals2"] = 0x49] = "ActionEquals2";
            ActionCode[ActionCode["ActionGetMember"] = 0x4E] = "ActionGetMember";
            ActionCode[ActionCode["ActionInitArray"] = 0x42] = "ActionInitArray";
            ActionCode[ActionCode["ActionInitObject"] = 0x43] = "ActionInitObject";
            ActionCode[ActionCode["ActionNewMethod"] = 0x53] = "ActionNewMethod";
            ActionCode[ActionCode["ActionNewObject"] = 0x40] = "ActionNewObject";
            ActionCode[ActionCode["ActionSetMember"] = 0x4F] = "ActionSetMember";
            ActionCode[ActionCode["ActionTargetPath"] = 0x45] = "ActionTargetPath";
            ActionCode[ActionCode["ActionWith"] = 0x94] = "ActionWith";
            ActionCode[ActionCode["ActionToNumber"] = 0x4A] = "ActionToNumber";
            ActionCode[ActionCode["ActionToString"] = 0x4B] = "ActionToString";
            ActionCode[ActionCode["ActionTypeOf"] = 0x44] = "ActionTypeOf";
            ActionCode[ActionCode["ActionAdd2"] = 0x47] = "ActionAdd2";
            ActionCode[ActionCode["ActionLess2"] = 0x48] = "ActionLess2";
            ActionCode[ActionCode["ActionModulo"] = 0x3F] = "ActionModulo";
            ActionCode[ActionCode["ActionBitAnd"] = 0x60] = "ActionBitAnd";
            ActionCode[ActionCode["ActionBitLShift"] = 0x63] = "ActionBitLShift";
            ActionCode[ActionCode["ActionBitOr"] = 0x61] = "ActionBitOr";
            ActionCode[ActionCode["ActionBitRShift"] = 0x64] = "ActionBitRShift";
            ActionCode[ActionCode["ActionBitURShift"] = 0x65] = "ActionBitURShift";
            ActionCode[ActionCode["ActionBitXor"] = 0x62] = "ActionBitXor";
            ActionCode[ActionCode["ActionDecrement"] = 0x51] = "ActionDecrement";
            ActionCode[ActionCode["ActionIncrement"] = 0x50] = "ActionIncrement";
            ActionCode[ActionCode["ActionPushDuplicate"] = 0x4C] = "ActionPushDuplicate";
            ActionCode[ActionCode["ActionReturn"] = 0x3E] = "ActionReturn";
            ActionCode[ActionCode["ActionStackSwap"] = 0x4D] = "ActionStackSwap";
            ActionCode[ActionCode["ActionStoreRegister"] = 0x87] = "ActionStoreRegister";
            ActionCode[ActionCode["ActionInstanceOf"] = 0x54] = "ActionInstanceOf";
            ActionCode[ActionCode["ActionEnumerate2"] = 0x55] = "ActionEnumerate2";
            ActionCode[ActionCode["ActionStrictEquals"] = 0x66] = "ActionStrictEquals";
            ActionCode[ActionCode["ActionGreater"] = 0x67] = "ActionGreater";
            ActionCode[ActionCode["ActionStringGreater"] = 0x68] = "ActionStringGreater";
            ActionCode[ActionCode["ActionDefineFunction2"] = 0x8E] = "ActionDefineFunction2";
            ActionCode[ActionCode["ActionExtends"] = 0x69] = "ActionExtends";
            ActionCode[ActionCode["ActionCastOp"] = 0x2B] = "ActionCastOp";
            ActionCode[ActionCode["ActionImplementsOp"] = 0x2C] = "ActionImplementsOp";
            ActionCode[ActionCode["ActionTry"] = 0x8F] = "ActionTry";
            ActionCode[ActionCode["ActionThrow"] = 0x2A] = "ActionThrow";
            ActionCode[ActionCode["ActionFSCommand2"] = 0x2D] = "ActionFSCommand2";
            ActionCode[ActionCode["ActionStrictMode"] = 0x89] = "ActionStrictMode";
        })(AVM1.ActionCode || (AVM1.ActionCode = {}));
        var ActionCode = AVM1.ActionCode;

        var ParsedPushRegisterAction = (function () {
            function ParsedPushRegisterAction(registerNumber) {
                this.registerNumber = registerNumber;
            }
            return ParsedPushRegisterAction;
        })();
        AVM1.ParsedPushRegisterAction = ParsedPushRegisterAction;

        var ParsedPushConstantAction = (function () {
            function ParsedPushConstantAction(constantIndex) {
                this.constantIndex = constantIndex;
            }
            return ParsedPushConstantAction;
        })();
        AVM1.ParsedPushConstantAction = ParsedPushConstantAction;

        (function (ArgumentAssignmentType) {
            ArgumentAssignmentType[ArgumentAssignmentType["None"] = 0] = "None";
            ArgumentAssignmentType[ArgumentAssignmentType["Argument"] = 1] = "Argument";
            ArgumentAssignmentType[ArgumentAssignmentType["This"] = 2] = "This";
            ArgumentAssignmentType[ArgumentAssignmentType["Arguments"] = 4] = "Arguments";
            ArgumentAssignmentType[ArgumentAssignmentType["Super"] = 8] = "Super";
            ArgumentAssignmentType[ArgumentAssignmentType["Global"] = 16] = "Global";
            ArgumentAssignmentType[ArgumentAssignmentType["Parent"] = 32] = "Parent";
            ArgumentAssignmentType[ArgumentAssignmentType["Root"] = 64] = "Root";
        })(AVM1.ArgumentAssignmentType || (AVM1.ArgumentAssignmentType = {}));
        var ArgumentAssignmentType = AVM1.ArgumentAssignmentType;

        var ActionsDataParser = (function () {
            function ActionsDataParser(stream) {
                this.stream = stream;
            }
            Object.defineProperty(ActionsDataParser.prototype, "position", {
                get: function () {
                    return this.stream.position;
                },
                set: function (value) {
                    this.stream.position = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ActionsDataParser.prototype, "eof", {
                get: function () {
                    return this.stream.position >= this.stream.end;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ActionsDataParser.prototype, "length", {
                get: function () {
                    return this.stream.end;
                },
                enumerable: true,
                configurable: true
            });
            ActionsDataParser.prototype.readNext = function () {
                var stream = this.stream;
                var currentPosition = stream.position;
                var actionCode = stream.readUI8();
                var length = actionCode >= 0x80 ? stream.readUI16() : 0;
                var nextPosition = stream.position + length;

                var args = null;
                switch (actionCode | 0) {
                    case 129 /* ActionGotoFrame */:
                        var frame = stream.readUI16();
                        var nextActionCode = stream.readUI8();
                        var play = false;
                        if (nextActionCode !== 0x06 && nextActionCode !== 0x07) {
                            stream.position--;
                        } else {
                            nextPosition++;
                            play = nextActionCode === 0x06;
                        }
                        args = [frame, play];
                        break;
                    case 131 /* ActionGetURL */:
                        var urlString = stream.readString();
                        var targetString = stream.readString();
                        args = [urlString, targetString];
                        break;
                    case 138 /* ActionWaitForFrame */:
                        var frame = stream.readUI16();
                        var count = stream.readUI8();
                        args = [frame, count];
                        break;
                    case 139 /* ActionSetTarget */:
                        var targetName = stream.readString();
                        args = [targetName];
                        break;
                    case 140 /* ActionGoToLabel */:
                        var label = stream.readString();
                        args = [label];
                        break;
                    case 150 /* ActionPush */:
                        var type, value;
                        args = [];
                        while (stream.position < nextPosition) {
                            type = stream.readUI8();
                            switch (type | 0) {
                                case 0:
                                    value = stream.readString();
                                    break;
                                case 1:
                                    value = stream.readFloat();
                                    break;
                                case 2:
                                    value = null;
                                    break;
                                case 3:
                                    value = void (0);
                                    break;
                                case 4:
                                    value = new ParsedPushRegisterAction(stream.readUI8());
                                    break;
                                case 5:
                                    value = stream.readBoolean();
                                    break;
                                case 6:
                                    value = stream.readDouble();
                                    break;
                                case 7:
                                    value = stream.readInteger();
                                    break;
                                case 8:
                                    value = new ParsedPushConstantAction(stream.readUI8());
                                    break;
                                case 9:
                                    value = new ParsedPushConstantAction(stream.readUI16());
                                    break;
                                default:
                                    console.error('Unknown value type: ' + type);
                                    stream.position = nextPosition;
                                    continue;
                            }
                            args.push(value);
                        }
                        break;
                    case 153 /* ActionJump */:
                        var offset = stream.readSI16();
                        args = [offset];
                        break;
                    case 157 /* ActionIf */:
                        var offset = stream.readSI16();
                        args = [offset];
                        break;
                    case 154 /* ActionGetURL2 */:
                        var flags = stream.readUI8();
                        args = [flags];
                        break;
                    case 159 /* ActionGotoFrame2 */:
                        var flags = stream.readUI8();
                        args = [flags];
                        if (!!(flags & 2)) {
                            args.push(stream.readUI16());
                        }
                        break;
                    case 141 /* ActionWaitForFrame2 */:
                        var count = stream.readUI8();
                        args = [count];
                        break;
                    case 136 /* ActionConstantPool */:
                        var count = stream.readUI16();
                        var constantPool = [];
                        for (var i = 0; i < count; i++) {
                            constantPool.push(stream.readString());
                        }
                        args = [constantPool];
                        break;
                    case 155 /* ActionDefineFunction */:
                        var functionName = stream.readString();
                        var count = stream.readUI16();
                        var functionParams = [];
                        for (var i = 0; i < count; i++) {
                            functionParams.push(stream.readString());
                        }

                        var codeSize = stream.readUI16();
                        nextPosition += codeSize;
                        var functionBody = new AVM1.AS2ActionsData(stream.readBytes(codeSize), this.dataId + '_f' + stream.position);

                        args = [functionBody, functionName, functionParams];
                        break;
                    case 148 /* ActionWith */:
                        var codeSize = stream.readUI16();
                        nextPosition += codeSize;
                        var withBody = new AVM1.AS2ActionsData(stream.readBytes(codeSize), this.dataId + '_w' + stream.position);
                        args = [withBody];
                        break;
                    case 135 /* ActionStoreRegister */:
                        var register = stream.readUI8();
                        args = [register];
                        break;
                    case 142 /* ActionDefineFunction2 */:
                        var functionName = stream.readString();
                        var count = stream.readUI16();
                        var registerCount = stream.readUI8();
                        var flags = stream.readUI16();
                        var registerAllocation = [];
                        var functionParams = [];
                        for (var i = 0; i < count; i++) {
                            var register = stream.readUI8();
                            var paramName = stream.readString();
                            functionParams.push(paramName);
                            if (register) {
                                registerAllocation[register] = {
                                    type: 1 /* Argument */,
                                    name: paramName,
                                    index: i
                                };
                            }
                        }

                        var j = 1;

                        // order this, arguments, super, _root, _parent, and _global
                        if (flags & 0x0001) {
                            registerAllocation[j++] = { type: 2 /* This */ };
                        }
                        if (flags & 0x0004) {
                            registerAllocation[j++] = { type: 4 /* Arguments */ };
                        }
                        if (flags & 0x0010) {
                            registerAllocation[j++] = { type: 8 /* Super */ };
                        }
                        if (flags & 0x0040) {
                            registerAllocation[j++] = { type: 64 /* Root */ };
                        }
                        if (flags & 0x0080) {
                            registerAllocation[j++] = { type: 32 /* Parent */ };
                        }
                        if (flags & 0x0100) {
                            registerAllocation[j++] = { type: 16 /* Global */ };
                        }

                        var suppressArguments = 0;
                        if (flags & 0x0002) {
                            suppressArguments |= 2 /* This */;
                        }
                        if (flags & 0x0008) {
                            suppressArguments |= 4 /* Arguments */;
                        }
                        if (flags & 0x0020) {
                            suppressArguments |= 8 /* Super */;
                        }

                        var codeSize = stream.readUI16();
                        nextPosition += codeSize;
                        var functionBody = new AVM1.AS2ActionsData(stream.readBytes(codeSize), this.dataId + '_f' + stream.position);

                        args = [
                            functionBody, functionName, functionParams, registerCount,
                            registerAllocation, suppressArguments];
                        break;
                    case 143 /* ActionTry */:
                        var flags = stream.readUI8();
                        var catchIsRegisterFlag = !!(flags & 4);
                        var finallyBlockFlag = !!(flags & 2);
                        var catchBlockFlag = !!(flags & 1);
                        var trySize = stream.readUI16();
                        var catchSize = stream.readUI16();
                        var finallySize = stream.readUI16();
                        var catchTarget = catchIsRegisterFlag ? stream.readUI8() : stream.readString();

                        nextPosition += trySize + catchSize + finallySize;

                        var tryBody = new AVM1.AS2ActionsData(stream.readBytes(trySize), this.dataId + '_t' + stream.position);
                        var catchBody = new AVM1.AS2ActionsData(stream.readBytes(catchSize), this.dataId + '_c' + stream.position);
                        var finallyBody = new AVM1.AS2ActionsData(stream.readBytes(finallySize), this.dataId + '_z' + stream.position);

                        args = [
                            catchIsRegisterFlag, catchTarget, tryBody,
                            catchBlockFlag, catchBody, finallyBlockFlag, finallyBody];
                        break;
                    case 137 /* ActionStrictMode */:
                        var mode = stream.readUI8();
                        args = [mode];
                        break;
                }
                stream.position = nextPosition;
                return {
                    position: currentPosition,
                    actionCode: actionCode,
                    actionName: ActionNamesMap[actionCode],
                    args: args
                };
            };
            ActionsDataParser.prototype.skip = function (count) {
                var stream = this.stream;
                while (count > 0 && stream.position < stream.end) {
                    var actionCode = stream.readUI8();
                    var length = actionCode >= 0x80 ? stream.readUI16() : 0;
                    stream.position += length;
                    count--;
                }
            };
            return ActionsDataParser;
        })();
        AVM1.ActionsDataParser = ActionsDataParser;

        var ActionNamesMap = {
            0x00: 'EOA',
            0x04: 'ActionNextFrame',
            0x05: 'ActionPreviousFrame',
            0x06: 'ActionPlay',
            0x07: 'ActionStop',
            0x08: 'ActionToggleQuality',
            0x09: 'ActionStopSounds',
            0x0A: 'ActionAdd',
            0x0B: 'ActionSubtract',
            0x0C: 'ActionMultiply',
            0x0D: 'ActionDivide',
            0x0E: 'ActionEquals',
            0x0F: 'ActionLess',
            0x10: 'ActionAnd',
            0x11: 'ActionOr',
            0x12: 'ActionNot',
            0x13: 'ActionStringEquals',
            0x14: 'ActionStringLength',
            0x15: 'ActionStringExtract',
            0x17: 'ActionPop',
            0x18: 'ActionToInteger',
            0x1C: 'ActionGetVariable',
            0x1D: 'ActionSetVariable',
            0x20: 'ActionSetTarget2',
            0x21: 'ActionStringAdd',
            0x22: 'ActionGetProperty',
            0x23: 'ActionSetProperty',
            0x24: 'ActionCloneSprite',
            0x25: 'ActionRemoveSprite',
            0x26: 'ActionTrace',
            0x27: 'ActionStartDrag',
            0x28: 'ActionEndDrag',
            0x29: 'ActionStringLess',
            0x2A: 'ActionThrow',
            0x2B: 'ActionCastOp',
            0x2C: 'ActionImplementsOp',
            0x2D: 'ActionFSCommand2',
            0x30: 'ActionRandomNumber',
            0x31: 'ActionMBStringLength',
            0x32: 'ActionCharToAscii',
            0x33: 'ActionAsciiToChar',
            0x34: 'ActionGetTime',
            0x35: 'ActionMBStringExtract',
            0x36: 'ActionMBCharToAscii',
            0x37: 'ActionMBAsciiToChar',
            0x3A: 'ActionDelete',
            0x3B: 'ActionDelete2',
            0x3C: 'ActionDefineLocal',
            0x3D: 'ActionCallFunction',
            0x3E: 'ActionReturn',
            0x3F: 'ActionModulo',
            0x40: 'ActionNewObject',
            0x41: 'ActionDefineLocal2',
            0x42: 'ActionInitArray',
            0x43: 'ActionInitObject',
            0x44: 'ActionTypeOf',
            0x45: 'ActionTargetPath',
            0x46: 'ActionEnumerate',
            0x47: 'ActionAdd2',
            0x48: 'ActionLess2',
            0x49: 'ActionEquals2',
            0x4A: 'ActionToNumber',
            0x4B: 'ActionToString',
            0x4C: 'ActionPushDuplicate',
            0x4D: 'ActionStackSwap',
            0x4E: 'ActionGetMember',
            0x4F: 'ActionSetMember',
            0x50: 'ActionIncrement',
            0x51: 'ActionDecrement',
            0x52: 'ActionCallMethod',
            0x53: 'ActionNewMethod',
            0x54: 'ActionInstanceOf',
            0x55: 'ActionEnumerate2',
            0x60: 'ActionBitAnd',
            0x61: 'ActionBitOr',
            0x62: 'ActionBitXor',
            0x63: 'ActionBitLShift',
            0x64: 'ActionBitRShift',
            0x65: 'ActionBitURShift',
            0x66: 'ActionStrictEquals',
            0x67: 'ActionGreater',
            0x68: 'ActionStringGreater',
            0x69: 'ActionExtends',
            0x81: 'ActionGotoFrame',
            0x83: 'ActionGetURL',
            0x87: 'ActionStoreRegister',
            0x88: 'ActionConstantPool',
            0x89: 'ActionStrictMode',
            0x8A: 'ActionWaitForFrame',
            0x8B: 'ActionSetTarget',
            0x8C: 'ActionGoToLabel',
            0x8D: 'ActionWaitForFrame2',
            0x8E: 'ActionDefineFunction2',
            0x8F: 'ActionTry',
            0x94: 'ActionWith',
            0x96: 'ActionPush',
            0x99: 'ActionJump',
            0x9A: 'ActionGetURL2',
            0x9B: 'ActionDefineFunction',
            0x9D: 'ActionIf',
            0x9E: 'ActionCall',
            0x9F: 'ActionGotoFrame2'
        };
    })(Shumway.AVM1 || (Shumway.AVM1 = {}));
    var AVM1 = Shumway.AVM1;
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
    (function (AVM1) {
        var ActionsDataAnalyzer = (function () {
            function ActionsDataAnalyzer() {
            }
            ActionsDataAnalyzer.prototype.analyze = function (parser) {
                var actions = [];
                var labels = [0];
                var processedLabels = [true];

                // Parsing all actions we can reach. Every action will have next position
                // and conditional jump location.
                var queue = [0];
                while (queue.length > 0) {
                    var position = queue.shift();
                    if (actions[position]) {
                        continue;
                    }
                    parser.position = position;

                    while (!parser.eof && !actions[position]) {
                        var action = parser.readNext();
                        if (action.actionCode === 0) {
                            break;
                        }

                        var nextPosition = parser.position;

                        var item = {
                            action: action,
                            next: nextPosition,
                            conditionalJumpTo: -1
                        };

                        var jumpPosition = 0;
                        var branching = false;
                        var nonConditionalBranching = false;
                        switch (action.actionCode) {
                            case 138 /* ActionWaitForFrame */:
                            case 141 /* ActionWaitForFrame2 */:
                                branching = true;

                                // skip is specified in amount of actions (instead of bytes)
                                var skipCount = action.actionCode === 138 /* ActionWaitForFrame */ ? action.args[1] : action.args[0];
                                parser.skip(skipCount);
                                jumpPosition = parser.position;
                                parser.position = nextPosition;
                                break;
                            case 153 /* ActionJump */:
                                nonConditionalBranching = true;
                                branching = true;
                                jumpPosition = nextPosition + action.args[0];
                                break;
                            case 157 /* ActionIf */:
                                branching = true;
                                jumpPosition = nextPosition + action.args[0];
                                break;
                            case 42 /* ActionThrow */:
                            case 62 /* ActionReturn */:
                            case 0 /* None */:
                                nonConditionalBranching = true;
                                branching = true;
                                jumpPosition = parser.length;
                                break;
                        }
                        if (branching) {
                            if (jumpPosition < 0 || jumpPosition > parser.length) {
                                console.error('jump outside the action block;');
                                jumpPosition = parser.length;
                            }
                            if (nonConditionalBranching) {
                                item.next = jumpPosition;
                            } else {
                                item.conditionalJumpTo = jumpPosition;
                            }
                            if (!processedLabels[jumpPosition]) {
                                labels.push(jumpPosition);
                                queue.push(jumpPosition);
                                processedLabels[jumpPosition] = true;
                            }
                        }

                        actions[position] = item;
                        if (nonConditionalBranching) {
                            break;
                        }
                        position = nextPosition;
                    }
                }

                // Creating blocks for every unique label
                var blocks = [];
                labels.forEach(function (position) {
                    if (!actions[position]) {
                        return;
                    }
                    var items = [];
                    var lastPosition = position;

                    do {
                        var item = actions[lastPosition];
                        items.push(item);
                        lastPosition = item.next;
                    } while(!processedLabels[lastPosition] && actions[lastPosition]);

                    blocks.push({
                        label: position,
                        items: items,
                        jump: lastPosition
                    });
                });
                return {
                    actions: actions,
                    blocks: blocks,
                    dataId: parser.dataId
                };
            };
            return ActionsDataAnalyzer;
        })();
        AVM1.ActionsDataAnalyzer = ActionsDataAnalyzer;
    })(Shumway.AVM1 || (Shumway.AVM1 = {}));
    var AVM1 = Shumway.AVM1;
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
    (function (AVM1) {
        var assert = Shumway.Debug.assert;

        var AS2ActionsData = (function () {
            function AS2ActionsData(bytes, id) {
                this.bytes = bytes;
                this.id = id;
                release || assert(bytes instanceof Uint8Array);
            }
            return AS2ActionsData;
        })();
        AVM1.AS2ActionsData = AS2ActionsData;

        var AS2Context = (function () {
            function AS2Context() {
            }
            AS2Context.prototype.flushPendingScripts = function () {
            };
            AS2Context.prototype.addAsset = function (className, symbolProps) {
            };
            AS2Context.prototype.getAsset = function (className) {
            };
            AS2Context.prototype.resolveTarget = function (target) {
            };
            AS2Context.prototype.resolveLevel = function (level) {
            };
            AS2Context.prototype.addToPendingScripts = function (fn) {
            };

            AS2Context.prototype.executeActions = function (actionsData, stage, scopeObj) {
            };
            AS2Context.instance = null;
            return AS2Context;
        })();
        AVM1.AS2Context = AS2Context;
    })(Shumway.AVM1 || (Shumway.AVM1 = {}));
    var AVM1 = Shumway.AVM1;
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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    (function (AVM1) {
        var Multiname = Shumway.AVM2.ABC.Multiname;
        var forEachPublicProperty = Shumway.AVM2.Runtime.forEachPublicProperty;
        var construct = Shumway.AVM2.Runtime.construct;
        var isNumeric = Shumway.isNumeric;
        var isFunction = Shumway.isFunction;
        var notImplemented = Shumway.Debug.notImplemented;

        var Option = Shumway.Options.Option;
        var OptionSet = Shumway.Options.OptionSet;
        var Telemetry = Shumway.Telemetry;
        var assert = Shumway.Debug.assert;

        var shumwayOptions = Shumway.Settings.shumwayOptions;

        var avm1Options = shumwayOptions.register(new OptionSet("AVM1"));
        AVM1.avm1TraceEnabled = avm1Options.register(new Option("t1", "traceAvm1", "boolean", false, "trace AVM1 execution"));
        AVM1.avm1ErrorsEnabled = avm1Options.register(new Option("e1", "errorsAvm1", "boolean", false, "fail on AVM1 errors"));
        AVM1.avm1TimeoutDisabled = avm1Options.register(new Option("ha1", "nohangAvm1", "boolean", false, "disable fail on AVM1 hang"));
        AVM1.avm1CompilerEnabled = avm1Options.register(new Option("ca1", "compileAvm1", "boolean", true, "compiles AVM1 code"));
        AVM1.avm1DebuggerEnabled = avm1Options.register(new Option("da1", "debugAvm1", "boolean", false, "allows AVM1 code debugging"));

        AVM1.Debugger = {
            pause: false,
            breakpoints: {}
        };

        var MAX_AVM1_HANG_TIMEOUT = 1000;
        var CHECK_AVM1_HANG_EVERY = 1000;
        var MAX_AVM1_ERRORS_LIMIT = 1000;
        var MAX_AVM1_STACK_LIMIT = 256;

        var AS2ScopeListItem = (function () {
            function AS2ScopeListItem(scope, next) {
                this.scope = scope;
                this.next = next;
            }
            AS2ScopeListItem.prototype.create = function (scope) {
                return new AS2ScopeListItem(scope, this);
            };
            return AS2ScopeListItem;
        })();

        var AS2ContextImpl = (function (_super) {
            __extends(AS2ContextImpl, _super);
            function AS2ContextImpl(swfVersion) {
                _super.call(this);
                this.swfVersion = swfVersion;
                this.globals = new Shumway.AVM2.AS.avm1lib.AS2Globals();
                this.initialScope = new AS2ScopeListItem(this.globals, null);
                this.assets = {};
                this.isActive = false;
                this.executionProhibited = false;
                this.abortExecutionAt = 0;
                this.stackDepth = 0;
                this.isTryCatchListening = false;
                this.errorsIgnored = 0;
                this.deferScriptExecution = true;
                this.pendingScripts = [];
            }
            AS2ContextImpl.prototype.addAsset = function (className, symbolProps) {
                this.assets[className] = symbolProps;
            };
            AS2ContextImpl.prototype.getAsset = function (className) {
                return this.assets[className];
            };
            AS2ContextImpl.prototype.resolveTarget = function (target) {
                var currentTarget = this.currentTarget || this.defaultTarget;
                if (!target) {
                    target = currentTarget;
                } else if (typeof target === 'string') {
                    target = lookupAS2Children(target, currentTarget, this.globals.asGetPublicProperty('_root'));
                }
                if (typeof target !== 'object' || target === null || !('_nativeAS3Object' in target)) {
                    throw new Error('Invalid AS2 target object: ' + Object.prototype.toString.call(target));
                }

                return target;
            };
            AS2ContextImpl.prototype.resolveLevel = function (level) {
                return this.resolveTarget(this.globals['_level' + level]);
            };
            AS2ContextImpl.prototype.addToPendingScripts = function (fn) {
                if (!this.deferScriptExecution) {
                    fn();
                    return;
                }
                this.pendingScripts.push(fn);
            };
            AS2ContextImpl.prototype.flushPendingScripts = function () {
                var scripts = this.pendingScripts;
                while (scripts.length) {
                    scripts.shift()();
                }
                this.deferScriptExecution = false;
            };

            AS2ContextImpl.prototype.executeActions = function (actionsData, stage, scopeObj) {
                this.stage = stage;
                executeActions(actionsData, this, scopeObj);
            };
            return AS2ContextImpl;
        })(AVM1.AS2Context);

        AVM1.AS2Context.create = function (swfVersion) {
            return new AS2ContextImpl(swfVersion);
        };

        var AS2Error = (function () {
            function AS2Error(error) {
                this.error = error;
            }
            return AS2Error;
        })();

        var AS2CriticalError = (function (_super) {
            __extends(AS2CriticalError, _super);
            function AS2CriticalError(message, error) {
                _super.call(this, message);
                this.error = error;
            }
            return AS2CriticalError;
        })(Error);

        function isAS2MovieClip(obj) {
            return typeof obj === 'object' && obj && obj instanceof Shumway.AVM2.AS.avm1lib.AS2MovieClip;
        }

        function as2GetType(v) {
            if (v === null) {
                return 'null';
            }

            var type = typeof v;
            if (type === 'function') {
                return 'object';
            }
            if (type === 'object' && isAS2MovieClip(v)) {
                return 'movieclip';
            }
            return type;
        }

        function as2ToPrimitive(value) {
            return as2GetType(value) !== 'object' ? value : value.valueOf();
        }

        function as2GetCurrentSwfVersion() {
            return AVM1.AS2Context.instance.swfVersion;
        }

        function as2ToAddPrimitive(value) {
            if (as2GetType(value) !== 'object') {
                return value;
            }

            if (value instanceof Date && as2GetCurrentSwfVersion() >= 6) {
                return value.toString();
            } else {
                return value.valueOf();
            }
        }

        function as2ToBoolean(value) {
            switch (as2GetType(value)) {
                default:
                case 'undefined':
                case 'null':
                    return false;
                case 'boolean':
                    return value;
                case 'number':
                    return value !== 0 && !isNaN(value);
                case 'string':
                    return value.length !== 0;
                case 'movieclip':
                case 'object':
                    return true;
            }
        }

        function as2ToNumber(value) {
            value = as2ToPrimitive(value);
            switch (as2GetType(value)) {
                case 'undefined':
                case 'null':
                    return as2GetCurrentSwfVersion() >= 7 ? NaN : 0;
                case 'boolean':
                    return value ? 1 : +0;
                case 'number':
                    return value;
                case 'string':
                    if (value === '' && as2GetCurrentSwfVersion() < 5) {
                        return 0;
                    }
                    return +value;
                default:
                    return as2GetCurrentSwfVersion() >= 5 ? NaN : 0;
            }
        }

        function as2ToInteger(value) {
            var result = as2ToNumber(value);
            if (isNaN(result)) {
                return 0;
            }
            if (!isFinite(result) || result === 0) {
                return result;
            }
            return (result < 0 ? -1 : 1) * Math.abs(result) | 0;
        }

        function as2ToInt32(value) {
            var result = as2ToNumber(value);
            return (isNaN(result) || !isFinite(result) || result === 0) ? 0 : (result | 0);
        }

        // TODO: We should just override Function.prototype.toString and change this to
        // only have a special case for 'undefined'.
        function as2ToString(value) {
            switch (as2GetType(value)) {
                case 'undefined':
                    return as2GetCurrentSwfVersion() >= 7 ? 'undefined' : '';
                case 'null':
                    return 'null';
                case 'boolean':
                    return value ? 'true' : 'false';
                case 'number':
                    return value.toString();
                case 'string':
                    return value;
                case 'movieclip':
                    return value.__targetPath;
                case 'object':
                    var result = value.toString !== Function.prototype.toString ? value.toString() : value;
                    if (typeof result === 'string') {
                        return result;
                    }
                    return typeof value === 'function' ? '[type Function]' : '[type Object]';
            }
        }

        function as2Compare(x, y) {
            var x2 = as2ToPrimitive(x);
            var y2 = as2ToPrimitive(y);
            if (typeof x2 === 'string' && typeof y2 === 'string') {
                return x2 < y2;
            } else {
                return as2ToNumber(x2) < as2ToNumber(y2);
            }
        }

        function as2InstanceOf(obj, constructor) {
            if (obj instanceof constructor) {
                return true;
            }

            // TODO interface check
            return false;
        }

        function as2ResolveProperty(obj, name) {
            // AS2 just ignores lookups on non-existant containers
            if (Shumway.isNullOrUndefined(obj)) {
                warn("AVM1 warning: cannot look up member '" + name + "' on undefined object");
                return null;
            }
            obj = Object(obj);

            // checking if avm2 public property is present
            var avm2PublicName = Multiname.getPublicQualifiedName(name);
            if (avm2PublicName in obj) {
                return name;
            }
            if (isNumeric(name)) {
                return null;
            }

            if (isAS2MovieClip(obj)) {
                var child = obj.__lookupChild(name);
                if (child) {
                    return name;
                }
            }

            // versions 6 and below ignore identifier case
            if (as2GetCurrentSwfVersion() > 6) {
                return null;
            }

            var foundName = null;
            var lowerCaseName = name.toLowerCase();
            as2Enumerate(obj, function (name) {
                if (name.toLowerCase() === lowerCaseName) {
                    foundName = name;
                }
            }, null);
            return foundName;
        }

        function as2GetProperty(obj, name) {
            // AS2 just ignores lookups on non-existant containers
            if (Shumway.isNullOrUndefined(obj)) {
                warn("AVM1 warning: cannot get property '" + name + "' on undefined object");
                return undefined;
            }
            obj = Object(obj);
            if (!obj.asHasProperty(undefined, name, 0) && isAS2MovieClip(obj)) {
                return obj.__lookupChild(name);
            }
            return obj.asGetPublicProperty(name);
        }

        function as2GetPrototype(obj) {
            return obj && obj.asGetPublicProperty('prototype');
        }

        function as2Enumerate(obj, fn, thisArg) {
            forEachPublicProperty(obj, fn, thisArg);

            if (!isAS2MovieClip(obj)) {
                return;
            }

            // if it's a movie listing the children as well
            var as3MovieClip = obj._nativeAS3Object;
            for (var i = 0, length = as3MovieClip._children.length; i < length; i++) {
                var child = as3MovieClip._children[i];
                var name = child.name;
                if (!obj.asHasProperty(undefined, name, 0)) {
                    fn.call(thisArg, name);
                }
            }
        }

        function isAvm2Class(obj) {
            return obj instanceof Shumway.AVM2.AS.ASClass;
        }

        function as2CreatePrototypeProxy(obj) {
            var prototype = obj.asGetPublicProperty('prototype');
            if (typeof Proxy === 'undefined') {
                console.error('ES6 proxies are not found');
                return prototype;
            }
            return Proxy.create({
                getOwnPropertyDescriptor: function (name) {
                    return Object.getOwnPropertyDescriptor(prototype, name);
                },
                getPropertyDescriptor: function (name) {
                    for (var p = prototype; p; p = Object.getPrototypeOf(p)) {
                        var desc = Object.getOwnPropertyDescriptor(p, name);
                        if (desc) {
                            return desc;
                        }
                    }
                    return undefined;
                },
                getOwnPropertyNames: function () {
                    return Object.getOwnPropertyNames(prototype);
                },
                getPropertyNames: function () {
                    // ES6: return getPropertyNames(prototype, name);
                    var names = Object.getOwnPropertyNames(prototype);
                    for (var p = Object.getPrototypeOf(prototype); p; p = Object.getPrototypeOf(p)) {
                        names = names.concat(Object.getOwnPropertyNames(p));
                    }
                    return names;
                },
                defineProperty: function (name, desc) {
                    if (desc) {
                        if (typeof desc.value === 'function' && '_setClass' in desc.value) {
                            desc.value._setClass(obj);
                        }
                        if (typeof desc.get === 'function' && '_setClass' in desc.get) {
                            desc.get._setClass(obj);
                        }
                        if (typeof desc.set === 'function' && '_setClass' in desc.set) {
                            desc.set._setClass(obj);
                        }
                    }
                    return Object.defineProperty(prototype, name, desc);
                },
                delete: function (name) {
                    return delete prototype[name];
                },
                fix: function () {
                    return undefined;
                }
            });
        }

        function executeActions(actionsData, as2Context, scope) {
            var context = as2Context;
            if (context.executionProhibited) {
                return;
            }

            var actionTracer = ActionTracerFactory.get();

            var scopeContainer = context.initialScope.create(scope);
            var savedContext = AVM1.AS2Context.instance;
            var caughtError;
            try  {
                AVM1.AS2Context.instance = context;
                context.isActive = true;
                context.abortExecutionAt = AVM1.avm1TimeoutDisabled.value ? Number.MAX_VALUE : Date.now() + MAX_AVM1_HANG_TIMEOUT;
                context.errorsIgnored = 0;
                context.defaultTarget = scope;
                context.currentTarget = null;
                actionTracer.message('ActionScript Execution Starts');
                actionTracer.indent();
                interpretActions(actionsData, scopeContainer, [], []);
            } catch (e) {
                if (e instanceof AS2CriticalError) {
                    console.error('Disabling AVM1 execution');
                    context.executionProhibited = true;
                }
                caughtError = e;
            }
            context.isActive = false;
            context.defaultTarget = null;
            context.currentTarget = null;
            actionTracer.unindent();
            actionTracer.message('ActionScript Execution Stops');
            AVM1.AS2Context.instance = savedContext;
            if (caughtError) {
                throw caughtError;
            }
        }
        AVM1.executeActions = executeActions;

        function lookupAS2Children(targetPath, defaultTarget, root) {
            var path = targetPath.split(/[\/.]/g);
            if (path[path.length - 1] === '') {
                path.pop();
            }
            var obj = defaultTarget;
            if (path[0] === '' || path[0] === '_level0' || path[0] === '_root') {
                obj = root;
                path.shift();
            }
            while (path.length > 0) {
                var prevObj = obj;
                obj = obj.__lookupChild(path[0]);
                if (!obj) {
                    throw new Error(path[0] + ' (expr ' + targetPath + ') is not found in ' + prevObj._target);
                }
                path.shift();
            }
            return obj;
        }

        function createBuiltinType(obj, args) {
            if (obj === Array) {
                // special case of array
                var result = args;
                if (args.length == 1 && typeof args[0] === 'number') {
                    result = [];
                    result.length = args[0];
                }
                return result;
            }
            if (obj === Boolean || obj === Number || obj === String || obj === Function) {
                return obj.apply(null, args);
            }
            if (obj === Date) {
                switch (args.length) {
                    case 0:
                        return new Date();
                    case 1:
                        return new Date(args[0]);
                    default:
                        return new Date(args[0], args[1], args.length > 2 ? args[2] : 1, args.length > 3 ? args[3] : 0, args.length > 4 ? args[4] : 0, args.length > 5 ? args[5] : 0, args.length > 6 ? args[6] : 0);
                }
            }
            if (obj === Object) {
                return {};
            }
            return undefined;
        }

        var AS2_SUPER_STUB = {};

        function avm1ValidateArgsCount(numArgs, maxAmount) {
            if (isNaN(numArgs) || numArgs < 0 || numArgs > maxAmount || numArgs != (0 | numArgs)) {
                throw new Error('Invalid number of arguments: ' + numArgs);
            }
        }
        function avm1ReadFunctionArgs(stack) {
            var numArgs = +stack.pop();
            avm1ValidateArgsCount(numArgs, stack.length);
            var args = [];
            for (var i = 0; i < numArgs; i++) {
                args.push(stack.pop());
            }
            return args;
        }
        function avm1SetTarget(ectx, targetPath) {
            var currentContext = ectx.context;
            var _global = ectx.global;

            if (!targetPath) {
                currentContext.currentTarget = null;
                return;
            }

            try  {
                var currentTarget = lookupAS2Children(targetPath, currentContext.currentTarget || currentContext.defaultTarget, _global.asGetPublicProperty('_root'));
                currentContext.currentTarget = currentTarget;
            } catch (e) {
                currentContext.currentTarget = null;
                throw e;
            }
        }

        function avm1DefineFunction(ectx, actionsData, functionName, parametersNames, registersCount, registersAllocation, suppressArguments) {
            var currentContext = ectx.context;
            var _global = ectx.global;
            var scopeContainer = ectx.scopeContainer;
            var scope = ectx.scope;
            var actionTracer = ectx.actionTracer;
            var defaultTarget = currentContext.defaultTarget;
            var constantPool = ectx.constantPool;

            var skipArguments = null;
            if (registersAllocation) {
                for (var i = 0; i < registersAllocation.length; i++) {
                    var registerAllocation = registersAllocation[i];
                    if (registerAllocation && registerAllocation.type === 1 /* Argument */) {
                        if (!skipArguments) {
                            skipArguments = [];
                        }
                        skipArguments[registersAllocation[i].index] = true;
                    }
                }
            }

            var ownerClass;
            var fn = (function () {
                var newScopeContainer;
                var newScope = {};

                if (!(suppressArguments & 4 /* Arguments */)) {
                    newScope.asSetPublicProperty('arguments', arguments);
                }
                if (!(suppressArguments & 2 /* This */)) {
                    newScope.asSetPublicProperty('this', this);
                }
                if (!(suppressArguments & 8 /* Super */)) {
                    newScope.asSetPublicProperty('super', AS2_SUPER_STUB);
                }
                newScope.asSetPublicProperty('__class', ownerClass);
                newScopeContainer = scopeContainer.create(newScope);
                var i;
                var registers = [];
                if (registersAllocation) {
                    for (i = 0; i < registersAllocation.length; i++) {
                        var registerAllocation = registersAllocation[i];
                        if (!registerAllocation) {
                            continue;
                        }
                        switch (registerAllocation.type) {
                            case 1 /* Argument */:
                                registers[i] = arguments[registerAllocation.index];
                                break;
                            case 2 /* This */:
                                registers[i] = this;
                                break;
                            case 4 /* Arguments */:
                                registers[i] = arguments;
                                break;
                            case 8 /* Super */:
                                registers[i] = AS2_SUPER_STUB;
                                break;
                            case 16 /* Global */:
                                registers[i] = _global;
                                break;
                            case 32 /* Parent */:
                                registers[i] = scope.asGetPublicProperty('_parent');
                                break;
                            case 64 /* Root */:
                                registers[i] = _global.asGetPublicProperty('_root');
                                break;
                        }
                    }
                }
                for (i = 0; i < arguments.length || i < parametersNames.length; i++) {
                    if (skipArguments && skipArguments[i]) {
                        continue;
                    }
                    newScope.asSetPublicProperty(parametersNames[i], arguments[i]);
                }

                var savedContext = AVM1.AS2Context.instance;
                var savedIsActive = currentContext.isActive;
                var savedDefaultTarget = currentContext.defaultTarget;
                var savedCurrentTarget = currentContext.currentTarget;
                var result;
                var caughtError;
                try  {
                    // switching contexts if called outside main thread
                    AVM1.AS2Context.instance = currentContext;
                    if (!savedIsActive) {
                        currentContext.abortExecutionAt = AVM1.avm1TimeoutDisabled.value ? Number.MAX_VALUE : Date.now() + MAX_AVM1_HANG_TIMEOUT;
                        currentContext.errorsIgnored = 0;
                        currentContext.isActive = true;
                    }
                    currentContext.defaultTarget = defaultTarget;
                    currentContext.currentTarget = null;
                    actionTracer.indent();
                    if (++currentContext.stackDepth >= MAX_AVM1_STACK_LIMIT) {
                        throw new AS2CriticalError('long running script -- AVM1 recursion limit is reached');
                    }
                    result = interpretActions(actionsData, newScopeContainer, constantPool, registers);
                } catch (e) {
                    caughtError = e;
                }
                currentContext.defaultTarget = savedDefaultTarget;
                currentContext.currentTarget = savedCurrentTarget;
                currentContext.isActive = savedIsActive;
                currentContext.stackDepth--;
                actionTracer.unindent();
                AVM1.AS2Context.instance = savedContext;
                if (caughtError) {
                    throw caughtError;
                }
                return result;
            });

            ownerClass = fn;
            var fnObj = fn;
            fnObj._setClass = function (class_) {
                ownerClass = class_;
            };

            fnObj.instanceConstructor = fn;
            fnObj.debugName = 'avm1 ' + (functionName || '<function>');
            if (functionName) {
                fnObj.name = functionName;
            }
            return fn;
        }
        function avm1DeleteProperty(ectx, propertyName) {
            var scopeContainer = ectx.scopeContainer;

            for (var p = scopeContainer; p; p = p.next) {
                if (p.scope.asHasProperty(undefined, propertyName, 0)) {
                    p.scope.asSetPublicProperty(propertyName, undefined); // in some cases we need to cleanup events binding
                    return p.scope.asDeleteProperty(undefined, propertyName, 0);
                }
            }
            return false;
        }
        function avm1ResolveVariableName(ectx, variableName, nonStrict) {
            var _global = ectx.global;
            var currentContext = ectx.context;
            var currentTarget = currentContext.currentTarget || currentContext.defaultTarget;

            var obj, name, i;
            if (variableName.indexOf(':') >= 0) {
                // "/A/B:FOO references the FOO variable in the movie clip with a target path of /A/B."
                var parts = variableName.split(':');
                obj = lookupAS2Children(parts[0], currentTarget, _global.asGetPublicProperty('_root'));
                if (!obj) {
                    throw new Error(parts[0] + ' is undefined');
                }
                name = parts[1];
            } else if (variableName.indexOf('.') >= 0) {
                // new object reference
                var objPath = variableName.split('.');
                name = objPath.pop();
                obj = _global;
                for (i = 0; i < objPath.length; i++) {
                    obj = obj.asGetPublicProperty(objPath[i]) || obj[objPath[i]];
                    if (!obj) {
                        throw new Error(objPath.slice(0, i + 1) + ' is undefined');
                    }
                }
            }

            if (!obj) {
                return null;
            }

            var resolvedName = as2ResolveProperty(obj, name);
            var resolved = resolvedName !== null;
            if (resolved || nonStrict) {
                return { obj: obj, name: resolvedName || name, resolved: resolved };
            }

            return null;
        }
        function avm1GetVariable(ectx, variableName) {
            var scopeContainer = ectx.scopeContainer;
            var currentContext = ectx.context;
            var currentTarget = currentContext.currentTarget || currentContext.defaultTarget;
            var scope = ectx.scope;

            // fast check if variable in the current scope
            if (scope.asHasProperty(undefined, variableName, 0)) {
                return scope.asGetPublicProperty(variableName);
            }

            var target = avm1ResolveVariableName(ectx, variableName, false);
            if (target) {
                return target.obj.asGetPublicProperty(target.name);
            }

            var resolvedName;
            if ((resolvedName = as2ResolveProperty(scope, variableName))) {
                return scope.asGetPublicProperty(resolvedName);
            }
            for (var p = scopeContainer; p; p = p.next) {
                resolvedName = as2ResolveProperty(p.scope, variableName);
                if (resolvedName !== null) {
                    return p.scope.asGetPublicProperty(resolvedName);
                }
            }

            if (currentTarget.asHasProperty(undefined, variableName, 0)) {
                return currentTarget.asGetPublicProperty(variableName);
            }

            // TODO refactor that
            if (variableName === 'this') {
                return currentTarget;
            }

            // trying movie clip children (if object is a MovieClip)
            var mc = isAS2MovieClip(currentTarget) && currentTarget.__lookupChild(variableName);
            if (mc) {
                return mc;
            }
            return undefined;
        }
        function avm1SetVariable(ectx, variableName, value) {
            var scopeContainer = ectx.scopeContainer;
            var currentContext = ectx.context;
            var currentTarget = currentContext.currentTarget || currentContext.defaultTarget;
            var scope = ectx.scope;

            if (currentContext.currentTarget) {
                currentTarget.asSetPublicProperty(variableName, value);
                return;
            }

            // fast check if variable in the current scope
            if (scope.asHasProperty(undefined, variableName, 0)) {
                scope.asSetPublicProperty(variableName, value);
                return;
            }

            var target = avm1ResolveVariableName(ectx, variableName, true);
            if (target) {
                target.obj.asSetPublicProperty(target.name, value);
                return;
            }

            for (var p = scopeContainer; p.next; p = p.next) {
                var resolvedName = as2ResolveProperty(p.scope, variableName);
                if (resolvedName !== null) {
                    p.scope.asSetPublicProperty(resolvedName, value);
                    return;
                }
            }

            currentTarget.asSetPublicProperty(variableName, value);
        }
        function avm1ProcessWith(ectx, obj, withBlock) {
            var scopeContainer = ectx.scopeContainer;
            var constantPool = ectx.constantPool;
            var registers = ectx.registers;

            var newScopeContainer = scopeContainer.create(Object(obj));
            interpretActions(withBlock, newScopeContainer, constantPool, registers);
        }
        function avm1ProcessTry(ectx, catchIsRegisterFlag, finallyBlockFlag, catchBlockFlag, catchTarget, tryBlock, catchBlock, finallyBlock) {
            var currentContext = ectx.context;
            var scopeContainer = ectx.scopeContainer;
            var scope = ectx.scope;
            var constantPool = ectx.constantPool;
            var registers = ectx.registers;

            var savedTryCatchState = currentContext.isTryCatchListening;
            var caughtError;
            try  {
                currentContext.isTryCatchListening = true;
                interpretActions(tryBlock, scopeContainer, constantPool, registers);
            } catch (e) {
                currentContext.isTryCatchListening = savedTryCatchState;
                if (!catchBlockFlag || !(e instanceof AS2Error)) {
                    caughtError = e;
                } else {
                    if (typeof catchTarget === 'string') {
                        scope.asSetPublicProperty(catchTarget, e.error);
                    } else {
                        registers[catchTarget] = e.error;
                    }
                    interpretActions(catchBlock, scopeContainer, constantPool, registers);
                }
            }
            currentContext.isTryCatchListening = savedTryCatchState;
            if (finallyBlockFlag) {
                interpretActions(finallyBlock, scopeContainer, constantPool, registers);
            }
            if (caughtError) {
                throw caughtError;
            }
        }

        // SWF 3 actions
        function avm1_0x81_ActionGotoFrame(ectx, args) {
            var _global = ectx.global;

            var frame = args[0];
            var play = args[1];
            if (play) {
                _global.gotoAndPlay(frame + 1);
            } else {
                _global.gotoAndStop(frame + 1);
            }
        }
        function avm1_0x83_ActionGetURL(ectx, args) {
            var _global = ectx.global;

            var urlString = args[0];
            var targetString = args[1];
            _global.getURL(urlString, targetString);
        }
        function avm1_0x04_ActionNextFrame(ectx) {
            var _global = ectx.global;

            _global.nextFrame();
        }
        function avm1_0x05_ActionPreviousFrame(ectx) {
            var _global = ectx.global;

            _global.prevFrame();
        }
        function avm1_0x06_ActionPlay(ectx) {
            var _global = ectx.global;

            _global.play();
        }
        function avm1_0x07_ActionStop(ectx) {
            var _global = ectx.global;

            _global.stop();
        }
        function avm1_0x08_ActionToggleQuality(ectx) {
            var _global = ectx.global;

            _global.toggleHighQuality();
        }
        function avm1_0x09_ActionStopSounds(ectx) {
            var _global = ectx.global;

            _global.stopAllSounds();
        }
        function avm1_0x8A_ActionWaitForFrame(ectx, args) {
            var _global = ectx.global;

            var frame = args[0];
            var count = args[1];
            return !_global.ifFrameLoaded(frame);
        }
        function avm1_0x8B_ActionSetTarget(ectx, args) {
            var targetName = args[0];
            avm1SetTarget(ectx, targetName);
        }
        function avm1_0x8C_ActionGoToLabel(ectx, args) {
            var _global = ectx.global;

            var label = args[0];
            _global.gotoLabel(label);
        }

        // SWF 4 actions
        function avm1_0x96_ActionPush(ectx, args) {
            var registers = ectx.registers;
            var constantPool = ectx.constantPool;
            var stack = ectx.stack;

            args.forEach(function (value) {
                if (value instanceof AVM1.ParsedPushConstantAction) {
                    stack.push(constantPool[value.constantIndex]);
                } else if (value instanceof AVM1.ParsedPushRegisterAction) {
                    stack.push(registers[value.registerNumber]);
                } else {
                    stack.push(value);
                }
            });
        }
        function avm1_0x17_ActionPop(ectx) {
            var stack = ectx.stack;

            stack.pop();
        }
        function avm1_0x0A_ActionAdd(ectx) {
            var stack = ectx.stack;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            stack.push(a + b);
        }
        function avm1_0x0B_ActionSubtract(ectx) {
            var stack = ectx.stack;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            stack.push(b - a);
        }
        function avm1_0x0C_ActionMultiply(ectx) {
            var stack = ectx.stack;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            stack.push(a * b);
        }
        function avm1_0x0D_ActionDivide(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            var c = b / a;
            stack.push(isSwfVersion5 ? c : isFinite(c) ? c : '#ERROR#');
        }
        function avm1_0x0E_ActionEquals(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            var f = a == b;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x0F_ActionLess(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            var f = b < a;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x10_ActionAnd(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var a = as2ToBoolean(stack.pop());
            var b = as2ToBoolean(stack.pop());
            var f = a && b;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x11_ActionOr(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var a = as2ToBoolean(stack.pop());
            var b = as2ToBoolean(stack.pop());
            var f = a || b;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x12_ActionNot(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var f = !as2ToBoolean(stack.pop());
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x13_ActionStringEquals(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var sa = as2ToString(stack.pop());
            var sb = as2ToString(stack.pop());
            var f = sa == sb;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x14_ActionStringLength(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var sa = as2ToString(stack.pop());
            stack.push(_global.length(sa));
        }
        function avm1_0x31_ActionMBStringLength(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var sa = as2ToString(stack.pop());
            stack.push(_global.length(sa));
        }
        function avm1_0x21_ActionStringAdd(ectx) {
            var stack = ectx.stack;

            var sa = as2ToString(stack.pop());
            var sb = as2ToString(stack.pop());
            stack.push(sb + sa);
        }
        function avm1_0x15_ActionStringExtract(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var count = stack.pop();
            var index = stack.pop();
            var value = as2ToString(stack.pop());
            stack.push(_global.substring(value, index, count));
        }
        function avm1_0x35_ActionMBStringExtract(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var count = stack.pop();
            var index = stack.pop();
            var value = as2ToString(stack.pop());
            stack.push(_global.mbsubstring(value, index, count));
        }
        function avm1_0x29_ActionStringLess(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var sa = as2ToString(stack.pop());
            var sb = as2ToString(stack.pop());
            var f = sb < sa;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }
        function avm1_0x18_ActionToInteger(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            stack.push(_global.int(stack.pop()));
        }
        function avm1_0x32_ActionCharToAscii(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var ch = stack.pop();
            var charCode = _global.ord(ch);
            stack.push(charCode);
        }
        function avm1_0x36_ActionMBCharToAscii(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var ch = stack.pop();
            var charCode = _global.mbord(ch);
            stack.push(charCode);
        }
        function avm1_0x33_ActionAsciiToChar(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var charCode = +stack.pop();
            var ch = _global.chr(charCode);
            stack.push(ch);
        }
        function avm1_0x37_ActionMBAsciiToChar(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var charCode = +stack.pop();
            var ch = _global.mbchr(charCode);
            stack.push(ch);
        }
        function avm1_0x99_ActionJump(ectx, args) {
            // implemented in the analyzer
        }
        function avm1_0x9D_ActionIf(ectx, args) {
            var stack = ectx.stack;

            var offset = args[0];
            return !!stack.pop();
        }
        function avm1_0x9E_ActionCall(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var label = stack.pop();
            _global.call(label);
        }
        function avm1_0x1C_ActionGetVariable(ectx) {
            var stack = ectx.stack;

            var variableName = '' + stack.pop();

            var sp = stack.length;
            stack.push(undefined);

            stack[sp] = avm1GetVariable(ectx, variableName);
        }
        function avm1_0x1D_ActionSetVariable(ectx) {
            var stack = ectx.stack;

            var value = stack.pop();
            var variableName = '' + stack.pop();
            avm1SetVariable(ectx, variableName, value);
        }
        function avm1_0x9A_ActionGetURL2(ectx, args) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var flags = args[0];
            var target = stack.pop();
            var url = stack.pop();
            var sendVarsMethod;
            if (flags & 1) {
                sendVarsMethod = 'GET';
            } else if (flags & 2) {
                sendVarsMethod = 'POST';
            }
            var loadTargetFlag = flags & 1 << 6;
            if (!loadTargetFlag) {
                _global.getURL(url, target, sendVarsMethod);
                return;
            }
            var loadVariablesFlag = flags & 1 << 7;
            if (loadVariablesFlag) {
                _global.loadVariables(url, target, sendVarsMethod);
            } else {
                _global.loadMovie(url, target, sendVarsMethod);
            }
        }
        function avm1_0x9F_ActionGotoFrame2(ectx, args) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var flags = args[0];
            var gotoParams = [stack.pop()];
            if (!!(flags & 2)) {
                gotoParams.push(args[1]);
            }
            var gotoMethod = !!(flags & 1) ? _global.gotoAndPlay : _global.gotoAndStop;
            gotoMethod.apply(_global, gotoParams);
        }
        function avm1_0x20_ActionSetTarget2(ectx) {
            var stack = ectx.stack;

            var target = stack.pop();
            avm1SetTarget(ectx, target);
        }
        function avm1_0x22_ActionGetProperty(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var index = stack.pop();
            var target = stack.pop();

            var sp = stack.length;
            stack.push(undefined);

            stack[sp] = _global.getAS2Property(target, index);
        }
        function avm1_0x23_ActionSetProperty(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var value = stack.pop();
            var index = stack.pop();
            var target = stack.pop();
            _global.setAS2Property(target, index, value);
        }
        function avm1_0x24_ActionCloneSprite(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var depth = stack.pop();
            var target = stack.pop();
            var source = stack.pop();
            _global.duplicateMovieClip(source, target, depth);
        }
        function avm1_0x25_ActionRemoveSprite(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var target = stack.pop();
            _global.removeMovieClip(target);
        }
        function avm1_0x27_ActionStartDrag(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var target = stack.pop();
            var lockcenter = stack.pop();
            var constrain = !stack.pop() ? null : {
                y2: stack.pop(),
                x2: stack.pop(),
                y1: stack.pop(),
                x1: stack.pop()
            };
            var dragParams = [target, lockcenter];
            if (constrain) {
                dragParams = dragParams.concat(constrain.x1, constrain.y1, constrain.x2, constrain.y2);
            }
            _global.startDrag.apply(_global, dragParams);
        }
        function avm1_0x28_ActionEndDrag(ectx) {
            var _global = ectx.global;

            _global.stopDrag();
        }
        function avm1_0x8D_ActionWaitForFrame2(ectx, args) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var count = args[0];
            var frame = stack.pop();
            return !_global.ifFrameLoaded(frame);
        }
        function avm1_0x26_ActionTrace(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            var value = stack.pop();
            _global.trace(value);
        }
        function avm1_0x34_ActionGetTime(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            stack.push(_global.getTimer());
        }
        function avm1_0x30_ActionRandomNumber(ectx) {
            var _global = ectx.global;
            var stack = ectx.stack;

            stack.push(_global.random(stack.pop()));
        }

        // SWF 5
        function avm1_0x3D_ActionCallFunction(ectx) {
            var stack = ectx.stack;
            var scope = ectx.scope;

            var functionName = stack.pop();
            var args = avm1ReadFunctionArgs(stack);

            var sp = stack.length;
            stack.push(undefined);

            var fn = avm1GetVariable(ectx, functionName);

            // AS2 simply ignores attempts to invoke non-functions.
            if (!(fn instanceof Function)) {
                warn("AVM1 warning: function '" + functionName + (fn ? "' is not callable" : "' is undefined"));
                return;
            }
            release || assert(stack.length === sp + 1);
            stack[sp] = fn.apply(scope, args);
        }
        function avm1_0x52_ActionCallMethod(ectx) {
            var stack = ectx.stack;

            var methodName = stack.pop();
            var obj = stack.pop();
            var args = avm1ReadFunctionArgs(stack);
            var target;

            var sp = stack.length;
            stack.push(undefined);

            // AS2 simply ignores attempts to invoke methods on non-existing objects.
            if (Shumway.isNullOrUndefined(obj)) {
                warn("AVM1 warning: method '" + methodName + "' can't be called on undefined object");
                return;
            }

            // Per spec, a missing or blank method name causes the container to be treated as
            // a function to call.
            if (Shumway.isNullOrUndefined(methodName) || methodName === '') {
                if (obj === AS2_SUPER_STUB) {
                    obj = avm1GetVariable(ectx, '__class').__super;
                    target = avm1GetVariable(ectx, 'this');
                } else {
                    // For non-super calls, we call obj with itself as the target.
                    // TODO: ensure this is correct.
                    target = obj;
                }

                // AS2 simply ignores attempts to invoke non-functions.
                if (isFunction(obj)) {
                    stack[sp] = obj.apply(target, args);
                } else {
                    warn("AVM1 warning: obj '" + obj + (obj ? "' is not callable" : "' is undefined"));
                }
                release || assert(stack.length === sp + 1);
                return;
            }

            if (obj === AS2_SUPER_STUB) {
                target = as2GetPrototype(avm1GetVariable(ectx, '__class').__super);
                obj = avm1GetVariable(ectx, 'this');
            } else {
                target = obj;
            }
            var resolvedName = as2ResolveProperty(target, methodName);
            var fn = target.asGetPublicProperty(resolvedName);

            // AS2 simply ignores attempts to invoke non-methods.
            if (!isFunction(fn)) {
                warn("AVM1 warning: method '" + methodName + "' on object", obj, (Shumway.isNullOrUndefined(fn) ? "is undefined" : "is not callable"));
                return;
            }
            release || assert(stack.length === sp + 1);
            stack[sp] = fn.apply(obj, args);
        }
        function avm1_0x88_ActionConstantPool(ectx, args) {
            var constantPool = args[0];
            ectx.constantPool = constantPool;
        }
        function avm1_0x9B_ActionDefineFunction(ectx, args) {
            var stack = ectx.stack;
            var scope = ectx.scope;

            var functionBody = args[0];
            var functionName = args[1];
            var functionParams = args[2];

            var fn = avm1DefineFunction(ectx, functionBody, functionName, functionParams, 0, null, 0);
            if (functionName) {
                scope.asSetPublicProperty(functionName, fn);
            } else {
                stack.push(fn);
            }
        }
        function avm1_0x3C_ActionDefineLocal(ectx) {
            var stack = ectx.stack;
            var scope = ectx.scope;

            var value = stack.pop();
            var name = stack.pop();
            scope.asSetPublicProperty(name, value);
        }
        function avm1_0x41_ActionDefineLocal2(ectx) {
            var stack = ectx.stack;
            var scope = ectx.scope;

            var name = stack.pop();
            scope.asSetPublicProperty(name, undefined);
        }
        function avm1_0x3A_ActionDelete(ectx) {
            var stack = ectx.stack;

            var name = stack.pop();
            var obj = stack.pop();

            // in some cases we need to cleanup events binding
            obj.asSetPublicProperty(name, undefined);
            stack.push(obj.asDeleteProperty(undefined, name, 0));
        }
        function avm1_0x3B_ActionDelete2(ectx) {
            var stack = ectx.stack;

            var name = stack.pop();
            var result = avm1DeleteProperty(ectx, name);
            stack.push(result);
        }
        function avm1_0x46_ActionEnumerate(ectx) {
            var stack = ectx.stack;

            var objectName = stack.pop();
            stack.push(null);
            var obj = avm1GetVariable(ectx, objectName);

            // AS2 just ignores lookups on non-existant containers. We warned in GetVariable already.
            if (Shumway.isNullOrUndefined(obj)) {
                return;
            }
            as2Enumerate(obj, function (name) {
                stack.push(name);
            }, null);
        }
        function avm1_0x49_ActionEquals2(ectx) {
            var stack = ectx.stack;

            var a = stack.pop();
            var b = stack.pop();
            stack.push(a == b);
        }
        function avm1_0x4E_ActionGetMember(ectx) {
            var stack = ectx.stack;

            var name = stack.pop();
            var obj = stack.pop();
            if (name === 'prototype') {
                // special case to track members
                stack.push(as2CreatePrototypeProxy(obj));
            } else {
                var resolvedName = as2ResolveProperty(obj, name);
                stack.push(resolvedName === null ? undefined : as2GetProperty(obj, resolvedName));
            }
        }
        function avm1_0x42_ActionInitArray(ectx) {
            var stack = ectx.stack;

            var obj = avm1ReadFunctionArgs(stack);
            stack.push(obj);
        }
        function avm1_0x43_ActionInitObject(ectx) {
            var stack = ectx.stack;

            var count = +stack.pop();
            avm1ValidateArgsCount(count, stack.length >> 1);
            var obj = {};
            for (var i = 0; i < count; i++) {
                var value = stack.pop();
                var name = stack.pop();
                obj.asSetPublicProperty(name, value);
            }
            stack.push(obj);
        }
        function avm1_0x53_ActionNewMethod(ectx) {
            var stack = ectx.stack;

            var methodName = stack.pop();
            var obj = stack.pop();
            var args = avm1ReadFunctionArgs(stack);

            var sp = stack.length;
            stack.push(undefined);

            // AS2 simply ignores attempts to construct methods on non-existing objects.
            if (Shumway.isNullOrUndefined(obj)) {
                warn("AVM1 warning: method '" + methodName + "' can't be constructed on undefined object");
                return;
            }

            var ctor;

            // Per spec, a missing or blank method name causes the container to be treated as
            // a function to construct.
            if (Shumway.isNullOrUndefined(methodName) || methodName === '') {
                ctor = obj;
            } else {
                var resolvedName = as2ResolveProperty(obj, methodName);
                ctor = obj.asGetPublicProperty(resolvedName);
            }

            // AS2 simply ignores attempts to invoke non-methods.
            if (!isFunction(ctor)) {
                warn("AVM1 warning: method '" + methodName + "' on object", obj, "is not constructible");
                return;
            }

            var result;
            if (isAvm2Class(ctor)) {
                result = construct(ctor, args);
            } else {
                result = Object.create(as2GetPrototype(ctor) || as2GetPrototype(Object));
                ctor.apply(result, args);
            }
            result.constructor = ctor;
            stack[sp] = result;
            release || assert(stack.length === sp + 1);
        }
        function avm1_0x40_ActionNewObject(ectx) {
            var stack = ectx.stack;

            var objectName = stack.pop();
            var args = avm1ReadFunctionArgs(stack);

            var sp = stack.length;
            stack.push(undefined);

            var obj = avm1GetVariable(ectx, objectName);

            var result = createBuiltinType(obj, args);
            if (typeof result === 'undefined') {
                // obj in not a built-in type
                if (isAvm2Class(obj)) {
                    result = construct(obj, args);
                } else {
                    // AS2 simply ignores attempts to invoke non-functions.
                    // We do this check here because AVM2 classes aren't functions but constructible.
                    if (!isFunction(obj)) {
                        warn("AVM1 warning: object '" + objectName + (obj ? "' is not constructible" : "' is undefined"));
                        return;
                    }
                    result = Object.create(as2GetPrototype(obj) || as2GetPrototype(Object));
                    obj.apply(result, args);
                }
                result.constructor = obj;
            }
            release || assert(stack.length === sp + 1);
            stack[sp] = result;
        }
        function avm1_0x4F_ActionSetMember(ectx) {
            var stack = ectx.stack;

            var value = stack.pop();
            var name = stack.pop();
            var obj = stack.pop();

            if (!Shumway.isNullOrUndefined(obj)) {
                obj.asSetPublicProperty(name, value);
            } else {
                // AS2 just ignores sets on non-existant containers
                warn("AVM1 warning: cannot set member '" + name + "' on undefined object");
            }
        }
        function avm1_0x45_ActionTargetPath(ectx) {
            var stack = ectx.stack;

            var obj = stack.pop();
            stack.push(as2GetType(obj) === 'movieclip' ? obj._target : void (0));
        }
        function avm1_0x94_ActionWith(ectx, args) {
            var stack = ectx.stack;

            var withBody = args[0];
            var obj = stack.pop();

            avm1ProcessWith(ectx, obj, withBody);
        }
        function avm1_0x4A_ActionToNumber(ectx) {
            var stack = ectx.stack;

            stack.push(as2ToNumber(stack.pop()));
        }
        function avm1_0x4B_ActionToString(ectx) {
            var stack = ectx.stack;

            stack.push(as2ToString(stack.pop()));
        }
        function avm1_0x44_ActionTypeOf(ectx) {
            var stack = ectx.stack;

            var obj = stack.pop();
            var result = as2GetType(obj);
            stack.push(result);
        }
        function avm1_0x47_ActionAdd2(ectx) {
            var stack = ectx.stack;

            var a = as2ToAddPrimitive(stack.pop());
            var b = as2ToAddPrimitive(stack.pop());
            if (typeof a === 'string' || typeof b === 'string') {
                stack.push(as2ToString(b) + as2ToString(a));
            } else {
                stack.push(as2ToNumber(b) + as2ToNumber(a));
            }
        }
        function avm1_0x48_ActionLess2(ectx) {
            var stack = ectx.stack;

            var a = stack.pop();
            var b = stack.pop();
            stack.push(as2Compare(b, a));
        }
        function avm1_0x3F_ActionModulo(ectx) {
            var stack = ectx.stack;

            var a = as2ToNumber(stack.pop());
            var b = as2ToNumber(stack.pop());
            stack.push(b % a);
        }
        function avm1_0x60_ActionBitAnd(ectx) {
            var stack = ectx.stack;

            var a = as2ToInt32(stack.pop());
            var b = as2ToInt32(stack.pop());
            stack.push(b & a);
        }
        function avm1_0x63_ActionBitLShift(ectx) {
            var stack = ectx.stack;

            var a = as2ToInt32(stack.pop());
            var b = as2ToInt32(stack.pop());
            stack.push(b << a);
        }
        function avm1_0x61_ActionBitOr(ectx) {
            var stack = ectx.stack;

            var a = as2ToInt32(stack.pop());
            var b = as2ToInt32(stack.pop());
            stack.push(b | a);
        }
        function avm1_0x64_ActionBitRShift(ectx) {
            var stack = ectx.stack;

            var a = as2ToInt32(stack.pop());
            var b = as2ToInt32(stack.pop());
            stack.push(b >> a);
        }
        function avm1_0x65_ActionBitURShift(ectx) {
            var stack = ectx.stack;

            var a = as2ToInt32(stack.pop());
            var b = as2ToInt32(stack.pop());
            stack.push(b >>> a);
        }
        function avm1_0x62_ActionBitXor(ectx) {
            var stack = ectx.stack;

            var a = as2ToInt32(stack.pop());
            var b = as2ToInt32(stack.pop());
            stack.push(b ^ a);
        }
        function avm1_0x51_ActionDecrement(ectx) {
            var stack = ectx.stack;

            var a = as2ToNumber(stack.pop());
            a--;
            stack.push(a);
        }
        function avm1_0x50_ActionIncrement(ectx) {
            var stack = ectx.stack;

            var a = as2ToNumber(stack.pop());
            a++;
            stack.push(a);
        }
        function avm1_0x4C_ActionPushDuplicate(ectx) {
            var stack = ectx.stack;

            stack.push(stack[stack.length - 1]);
        }
        function avm1_0x3E_ActionReturn(ectx) {
            ectx.isEndOfActions = true;
        }
        function avm1_0x4D_ActionStackSwap(ectx) {
            var stack = ectx.stack;

            stack.push(stack.pop(), stack.pop());
        }
        function avm1_0x87_ActionStoreRegister(ectx, args) {
            var stack = ectx.stack;
            var registers = ectx.registers;

            var register = args[0];
            registers[register] = stack[stack.length - 1];
        }

        // SWF 6
        function avm1_0x54_ActionInstanceOf(ectx) {
            var stack = ectx.stack;

            var constr = stack.pop();
            var obj = stack.pop();
            stack.push(as2InstanceOf(obj, constr));
        }
        function avm1_0x55_ActionEnumerate2(ectx) {
            var stack = ectx.stack;

            var obj = stack.pop();
            stack.push(null);

            // AS2 just ignores lookups on non-existant containers
            if (Shumway.isNullOrUndefined(obj)) {
                warn("AVM1 warning: cannot iterate over undefined object");
                return;
            }

            as2Enumerate(obj, function (name) {
                stack.push(name);
            }, null);
        }
        function avm1_0x66_ActionStrictEquals(ectx) {
            var stack = ectx.stack;

            var a = stack.pop();
            var b = stack.pop();
            stack.push(b === a);
        }
        function avm1_0x67_ActionGreater(ectx) {
            var stack = ectx.stack;

            var a = stack.pop();
            var b = stack.pop();
            stack.push(as2Compare(a, b));
        }
        function avm1_0x68_ActionStringGreater(ectx) {
            var stack = ectx.stack;
            var isSwfVersion5 = ectx.isSwfVersion5;

            var sa = as2ToString(stack.pop());
            var sb = as2ToString(stack.pop());
            var f = sb > sa;
            stack.push(isSwfVersion5 ? f : f ? 1 : 0);
        }

        // SWF 7
        function avm1_0x8E_ActionDefineFunction2(ectx, args) {
            var stack = ectx.stack;
            var scope = ectx.scope;

            var functionBody = args[0];
            var functionName = args[1];
            var functionParams = args[2];
            var registerCount = args[3];
            var registerAllocation = args[4];
            var suppressArguments = args[5];

            var fn = avm1DefineFunction(ectx, functionBody, functionName, functionParams, registerCount, registerAllocation, suppressArguments);
            if (functionName) {
                scope.asSetPublicProperty(functionName, fn);
            } else {
                stack.push(fn);
            }
        }
        function avm1_0x69_ActionExtends(ectx) {
            var stack = ectx.stack;

            var constrSuper = stack.pop();
            var constr = stack.pop();
            var obj = Object.create(constrSuper.traitsPrototype || as2GetPrototype(constrSuper), {
                constructor: { value: constr, enumerable: false }
            });
            constr.__super = constrSuper;
            constr.prototype = obj;
        }
        function avm1_0x2B_ActionCastOp(ectx) {
            var stack = ectx.stack;

            var obj = stack.pop();
            var constr = stack.pop();
            stack.push(as2InstanceOf(obj, constr) ? obj : null);
        }
        function avm1_0x2C_ActionImplementsOp(ectx) {
            var stack = ectx.stack;

            var constr = stack.pop();
            var count = +stack.pop();
            avm1ValidateArgsCount(count, stack.length);
            var interfaces = [];
            for (var i = 0; i < count; i++) {
                interfaces.push(stack.pop());
            }
            constr._as2Interfaces = interfaces;
        }
        function avm1_0x8F_ActionTry(ectx, args) {
            var catchIsRegisterFlag = args[0];
            var catchTarget = args[1];
            var tryBody = args[2];
            var catchBlockFlag = args[3];
            var catchBody = args[4];
            var finallyBlockFlag = args[5];
            var finallyBody = args[6];

            avm1ProcessTry(ectx, catchIsRegisterFlag, finallyBlockFlag, catchBlockFlag, catchTarget, tryBody, catchBody, finallyBody);
        }
        function avm1_0x2A_ActionThrow(ectx) {
            var stack = ectx.stack;

            var obj = stack.pop();
            throw new AS2Error(obj);
        }
        function avm1_0x2D_ActionFSCommand2(ectx) {
            var stack = ectx.stack;
            var _global = ectx.global;

            var args = avm1ReadFunctionArgs(stack);

            var sp = stack.length;
            stack.push(undefined);

            var result = _global.fscommand.apply(null, args);
            stack[sp] = result;
        }
        function avm1_0x89_ActionStrictMode(ectx, args) {
            var mode = args[0];
        }

        function wrapAvm1Error(fn) {
            return function avm1ErrorWrapper(executionContext, args) {
                var currentContext;
                try  {
                    fn(executionContext, args);

                    executionContext.recoveringFromError = false;
                } catch (e) {
                    // handling AVM1 errors
                    currentContext = executionContext.context;
                    if ((AVM1.avm1ErrorsEnabled.value && !currentContext.isTryCatchListening) || e instanceof AS2CriticalError) {
                        throw e;
                    }
                    if (e instanceof AS2Error) {
                        throw e;
                    }

                    Telemetry.instance.reportTelemetry({ topic: 'error', error: 1 /* AVM1_ERROR */ });

                    if (!executionContext.recoveringFromError) {
                        if (currentContext.errorsIgnored++ >= MAX_AVM1_ERRORS_LIMIT) {
                            throw new AS2CriticalError('long running script -- AVM1 errors limit is reached');
                        }
                        console.error('AVM1 error: ' + e);
                        var avm2 = Shumway.AVM2.Runtime.AVM2;
                        avm2.instance.exceptions.push({
                            source: 'avm1', message: e.message,
                            stack: e.stack });
                        executionContext.recoveringFromError = true;
                    }
                }
            };
        }

        function generateActionCalls() {
            var wrap;
            if (AVM1.avm1ErrorsEnabled.value) {
                wrap = wrapAvm1Error;
            } else {
                wrap = function (fn) {
                    return fn;
                };
            }
            return {
                ActionGotoFrame: wrap(avm1_0x81_ActionGotoFrame),
                ActionGetURL: wrap(avm1_0x83_ActionGetURL),
                ActionNextFrame: wrap(avm1_0x04_ActionNextFrame),
                ActionPreviousFrame: wrap(avm1_0x05_ActionPreviousFrame),
                ActionPlay: wrap(avm1_0x06_ActionPlay),
                ActionStop: wrap(avm1_0x07_ActionStop),
                ActionToggleQuality: wrap(avm1_0x08_ActionToggleQuality),
                ActionStopSounds: wrap(avm1_0x09_ActionStopSounds),
                ActionWaitForFrame: wrap(avm1_0x8A_ActionWaitForFrame),
                ActionSetTarget: wrap(avm1_0x8B_ActionSetTarget),
                ActionGoToLabel: wrap(avm1_0x8C_ActionGoToLabel),
                ActionPush: wrap(avm1_0x96_ActionPush),
                ActionPop: wrap(avm1_0x17_ActionPop),
                ActionAdd: wrap(avm1_0x0A_ActionAdd),
                ActionSubtract: wrap(avm1_0x0B_ActionSubtract),
                ActionMultiply: wrap(avm1_0x0C_ActionMultiply),
                ActionDivide: wrap(avm1_0x0D_ActionDivide),
                ActionEquals: wrap(avm1_0x0E_ActionEquals),
                ActionLess: wrap(avm1_0x0F_ActionLess),
                ActionAnd: wrap(avm1_0x10_ActionAnd),
                ActionOr: wrap(avm1_0x11_ActionOr),
                ActionNot: wrap(avm1_0x12_ActionNot),
                ActionStringEquals: wrap(avm1_0x13_ActionStringEquals),
                ActionStringLength: wrap(avm1_0x14_ActionStringLength),
                ActionMBStringLength: wrap(avm1_0x31_ActionMBStringLength),
                ActionStringAdd: wrap(avm1_0x21_ActionStringAdd),
                ActionStringExtract: wrap(avm1_0x15_ActionStringExtract),
                ActionMBStringExtract: wrap(avm1_0x35_ActionMBStringExtract),
                ActionStringLess: wrap(avm1_0x29_ActionStringLess),
                ActionToInteger: wrap(avm1_0x18_ActionToInteger),
                ActionCharToAscii: wrap(avm1_0x32_ActionCharToAscii),
                ActionMBCharToAscii: wrap(avm1_0x36_ActionMBCharToAscii),
                ActionAsciiToChar: wrap(avm1_0x33_ActionAsciiToChar),
                ActionMBAsciiToChar: wrap(avm1_0x37_ActionMBAsciiToChar),
                ActionJump: wrap(avm1_0x99_ActionJump),
                ActionIf: wrap(avm1_0x9D_ActionIf),
                ActionCall: wrap(avm1_0x9E_ActionCall),
                ActionGetVariable: wrap(avm1_0x1C_ActionGetVariable),
                ActionSetVariable: wrap(avm1_0x1D_ActionSetVariable),
                ActionGetURL2: wrap(avm1_0x9A_ActionGetURL2),
                ActionGotoFrame2: wrap(avm1_0x9F_ActionGotoFrame2),
                ActionSetTarget2: wrap(avm1_0x20_ActionSetTarget2),
                ActionGetProperty: wrap(avm1_0x22_ActionGetProperty),
                ActionSetProperty: wrap(avm1_0x23_ActionSetProperty),
                ActionCloneSprite: wrap(avm1_0x24_ActionCloneSprite),
                ActionRemoveSprite: wrap(avm1_0x25_ActionRemoveSprite),
                ActionStartDrag: wrap(avm1_0x27_ActionStartDrag),
                ActionEndDrag: wrap(avm1_0x28_ActionEndDrag),
                ActionWaitForFrame2: wrap(avm1_0x8D_ActionWaitForFrame2),
                ActionTrace: wrap(avm1_0x26_ActionTrace),
                ActionGetTime: wrap(avm1_0x34_ActionGetTime),
                ActionRandomNumber: wrap(avm1_0x30_ActionRandomNumber),
                ActionCallFunction: wrap(avm1_0x3D_ActionCallFunction),
                ActionCallMethod: wrap(avm1_0x52_ActionCallMethod),
                ActionConstantPool: wrap(avm1_0x88_ActionConstantPool),
                ActionDefineFunction: wrap(avm1_0x9B_ActionDefineFunction),
                ActionDefineLocal: wrap(avm1_0x3C_ActionDefineLocal),
                ActionDefineLocal2: wrap(avm1_0x41_ActionDefineLocal2),
                ActionDelete: wrap(avm1_0x3A_ActionDelete),
                ActionDelete2: wrap(avm1_0x3B_ActionDelete2),
                ActionEnumerate: wrap(avm1_0x46_ActionEnumerate),
                ActionEquals2: wrap(avm1_0x49_ActionEquals2),
                ActionGetMember: wrap(avm1_0x4E_ActionGetMember),
                ActionInitArray: wrap(avm1_0x42_ActionInitArray),
                ActionInitObject: wrap(avm1_0x43_ActionInitObject),
                ActionNewMethod: wrap(avm1_0x53_ActionNewMethod),
                ActionNewObject: wrap(avm1_0x40_ActionNewObject),
                ActionSetMember: wrap(avm1_0x4F_ActionSetMember),
                ActionTargetPath: wrap(avm1_0x45_ActionTargetPath),
                ActionWith: wrap(avm1_0x94_ActionWith),
                ActionToNumber: wrap(avm1_0x4A_ActionToNumber),
                ActionToString: wrap(avm1_0x4B_ActionToString),
                ActionTypeOf: wrap(avm1_0x44_ActionTypeOf),
                ActionAdd2: wrap(avm1_0x47_ActionAdd2),
                ActionLess2: wrap(avm1_0x48_ActionLess2),
                ActionModulo: wrap(avm1_0x3F_ActionModulo),
                ActionBitAnd: wrap(avm1_0x60_ActionBitAnd),
                ActionBitLShift: wrap(avm1_0x63_ActionBitLShift),
                ActionBitOr: wrap(avm1_0x61_ActionBitOr),
                ActionBitRShift: wrap(avm1_0x64_ActionBitRShift),
                ActionBitURShift: wrap(avm1_0x65_ActionBitURShift),
                ActionBitXor: wrap(avm1_0x62_ActionBitXor),
                ActionDecrement: wrap(avm1_0x51_ActionDecrement),
                ActionIncrement: wrap(avm1_0x50_ActionIncrement),
                ActionPushDuplicate: wrap(avm1_0x4C_ActionPushDuplicate),
                ActionReturn: wrap(avm1_0x3E_ActionReturn),
                ActionStackSwap: wrap(avm1_0x4D_ActionStackSwap),
                ActionStoreRegister: wrap(avm1_0x87_ActionStoreRegister),
                ActionInstanceOf: wrap(avm1_0x54_ActionInstanceOf),
                ActionEnumerate2: wrap(avm1_0x55_ActionEnumerate2),
                ActionStrictEquals: wrap(avm1_0x66_ActionStrictEquals),
                ActionGreater: wrap(avm1_0x67_ActionGreater),
                ActionStringGreater: wrap(avm1_0x68_ActionStringGreater),
                ActionDefineFunction2: wrap(avm1_0x8E_ActionDefineFunction2),
                ActionExtends: wrap(avm1_0x69_ActionExtends),
                ActionCastOp: wrap(avm1_0x2B_ActionCastOp),
                ActionImplementsOp: wrap(avm1_0x2C_ActionImplementsOp),
                ActionTry: wrap(avm1_0x8F_ActionTry),
                ActionThrow: wrap(avm1_0x2A_ActionThrow),
                ActionFSCommand2: wrap(avm1_0x2D_ActionFSCommand2),
                ActionStrictMode: wrap(avm1_0x89_ActionStrictMode)
            };
        }

        function interpretAction(executionContext, parsedAction) {
            var stack = executionContext.stack;

            var actionCode = parsedAction.actionCode;
            var args = parsedAction.args;

            var actionTracer = executionContext.actionTracer;
            actionTracer.print(parsedAction, stack);

            var shallBranch = false;
            switch (actionCode | 0) {
                case 129 /* ActionGotoFrame */:
                    avm1_0x81_ActionGotoFrame(executionContext, args);
                    break;
                case 131 /* ActionGetURL */:
                    avm1_0x83_ActionGetURL(executionContext, args);
                    break;
                case 4 /* ActionNextFrame */:
                    avm1_0x04_ActionNextFrame(executionContext);
                    break;
                case 5 /* ActionPreviousFrame */:
                    avm1_0x05_ActionPreviousFrame(executionContext);
                    break;
                case 6 /* ActionPlay */:
                    avm1_0x06_ActionPlay(executionContext);
                    break;
                case 7 /* ActionStop */:
                    avm1_0x07_ActionStop(executionContext);
                    break;
                case 8 /* ActionToggleQuality */:
                    avm1_0x08_ActionToggleQuality(executionContext);
                    break;
                case 9 /* ActionStopSounds */:
                    avm1_0x09_ActionStopSounds(executionContext);
                    break;
                case 138 /* ActionWaitForFrame */:
                    shallBranch = avm1_0x8A_ActionWaitForFrame(executionContext, args);
                    break;
                case 139 /* ActionSetTarget */:
                    avm1_0x8B_ActionSetTarget(executionContext, args);
                    break;
                case 140 /* ActionGoToLabel */:
                    avm1_0x8C_ActionGoToLabel(executionContext, args);
                    break;

                case 150 /* ActionPush */:
                    avm1_0x96_ActionPush(executionContext, args);
                    break;
                case 23 /* ActionPop */:
                    avm1_0x17_ActionPop(executionContext);
                    break;
                case 10 /* ActionAdd */:
                    avm1_0x0A_ActionAdd(executionContext);
                    break;
                case 11 /* ActionSubtract */:
                    avm1_0x0B_ActionSubtract(executionContext);
                    break;
                case 12 /* ActionMultiply */:
                    avm1_0x0C_ActionMultiply(executionContext);
                    break;
                case 13 /* ActionDivide */:
                    avm1_0x0D_ActionDivide(executionContext);
                    break;
                case 14 /* ActionEquals */:
                    avm1_0x0E_ActionEquals(executionContext);
                    break;
                case 15 /* ActionLess */:
                    avm1_0x0F_ActionLess(executionContext);
                    break;
                case 16 /* ActionAnd */:
                    avm1_0x10_ActionAnd(executionContext);
                    break;
                case 17 /* ActionOr */:
                    avm1_0x11_ActionOr(executionContext);
                    break;
                case 18 /* ActionNot */:
                    avm1_0x12_ActionNot(executionContext);
                    break;
                case 19 /* ActionStringEquals */:
                    avm1_0x13_ActionStringEquals(executionContext);
                    break;
                case 20 /* ActionStringLength */:
                    avm1_0x14_ActionStringLength(executionContext);
                    break;
                case 49 /* ActionMBStringLength */:
                    avm1_0x31_ActionMBStringLength(executionContext);
                    break;
                case 33 /* ActionStringAdd */:
                    avm1_0x21_ActionStringAdd(executionContext);
                    break;
                case 21 /* ActionStringExtract */:
                    avm1_0x15_ActionStringExtract(executionContext);
                    break;
                case 53 /* ActionMBStringExtract */:
                    avm1_0x35_ActionMBStringExtract(executionContext);
                    break;
                case 41 /* ActionStringLess */:
                    avm1_0x29_ActionStringLess(executionContext);
                    break;
                case 24 /* ActionToInteger */:
                    avm1_0x18_ActionToInteger(executionContext);
                    break;
                case 50 /* ActionCharToAscii */:
                    avm1_0x32_ActionCharToAscii(executionContext);
                    break;
                case 54 /* ActionMBCharToAscii */:
                    avm1_0x36_ActionMBCharToAscii(executionContext);
                    break;
                case 51 /* ActionAsciiToChar */:
                    avm1_0x33_ActionAsciiToChar(executionContext);
                    break;
                case 55 /* ActionMBAsciiToChar */:
                    avm1_0x37_ActionMBAsciiToChar(executionContext);
                    break;
                case 153 /* ActionJump */:
                    avm1_0x99_ActionJump(executionContext, args);
                    break;
                case 157 /* ActionIf */:
                    shallBranch = avm1_0x9D_ActionIf(executionContext, args);
                    break;
                case 158 /* ActionCall */:
                    avm1_0x9E_ActionCall(executionContext);
                    break;
                case 28 /* ActionGetVariable */:
                    avm1_0x1C_ActionGetVariable(executionContext);
                    break;
                case 29 /* ActionSetVariable */:
                    avm1_0x1D_ActionSetVariable(executionContext);
                    break;
                case 154 /* ActionGetURL2 */:
                    avm1_0x9A_ActionGetURL2(executionContext, args);
                    break;
                case 159 /* ActionGotoFrame2 */:
                    avm1_0x9F_ActionGotoFrame2(executionContext, args);
                    break;
                case 32 /* ActionSetTarget2 */:
                    avm1_0x20_ActionSetTarget2(executionContext);
                    break;
                case 34 /* ActionGetProperty */:
                    avm1_0x22_ActionGetProperty(executionContext);
                    break;
                case 35 /* ActionSetProperty */:
                    avm1_0x23_ActionSetProperty(executionContext);
                    break;
                case 36 /* ActionCloneSprite */:
                    avm1_0x24_ActionCloneSprite(executionContext);
                    break;
                case 37 /* ActionRemoveSprite */:
                    avm1_0x25_ActionRemoveSprite(executionContext);
                    break;
                case 39 /* ActionStartDrag */:
                    avm1_0x27_ActionStartDrag(executionContext);
                    break;
                case 40 /* ActionEndDrag */:
                    avm1_0x28_ActionEndDrag(executionContext);
                    break;
                case 141 /* ActionWaitForFrame2 */:
                    shallBranch = avm1_0x8D_ActionWaitForFrame2(executionContext, args);
                    break;
                case 38 /* ActionTrace */:
                    avm1_0x26_ActionTrace(executionContext);
                    break;
                case 52 /* ActionGetTime */:
                    avm1_0x34_ActionGetTime(executionContext);
                    break;
                case 48 /* ActionRandomNumber */:
                    avm1_0x30_ActionRandomNumber(executionContext);
                    break;

                case 61 /* ActionCallFunction */:
                    avm1_0x3D_ActionCallFunction(executionContext);
                    break;
                case 82 /* ActionCallMethod */:
                    avm1_0x52_ActionCallMethod(executionContext);
                    break;
                case 136 /* ActionConstantPool */:
                    avm1_0x88_ActionConstantPool(executionContext, args);
                    break;
                case 155 /* ActionDefineFunction */:
                    avm1_0x9B_ActionDefineFunction(executionContext, args);
                    break;
                case 60 /* ActionDefineLocal */:
                    avm1_0x3C_ActionDefineLocal(executionContext);
                    break;
                case 65 /* ActionDefineLocal2 */:
                    avm1_0x41_ActionDefineLocal2(executionContext);
                    break;
                case 58 /* ActionDelete */:
                    avm1_0x3A_ActionDelete(executionContext);
                    break;
                case 59 /* ActionDelete2 */:
                    avm1_0x3B_ActionDelete2(executionContext);
                    break;
                case 70 /* ActionEnumerate */:
                    avm1_0x46_ActionEnumerate(executionContext);
                    break;
                case 73 /* ActionEquals2 */:
                    avm1_0x49_ActionEquals2(executionContext);
                    break;
                case 78 /* ActionGetMember */:
                    avm1_0x4E_ActionGetMember(executionContext);
                    break;
                case 66 /* ActionInitArray */:
                    avm1_0x42_ActionInitArray(executionContext);
                    break;
                case 67 /* ActionInitObject */:
                    avm1_0x43_ActionInitObject(executionContext);
                    break;
                case 83 /* ActionNewMethod */:
                    avm1_0x53_ActionNewMethod(executionContext);
                    break;
                case 64 /* ActionNewObject */:
                    avm1_0x40_ActionNewObject(executionContext);
                    break;
                case 79 /* ActionSetMember */:
                    avm1_0x4F_ActionSetMember(executionContext);
                    break;
                case 69 /* ActionTargetPath */:
                    avm1_0x45_ActionTargetPath(executionContext);
                    break;
                case 148 /* ActionWith */:
                    avm1_0x94_ActionWith(executionContext, args);
                    break;
                case 74 /* ActionToNumber */:
                    avm1_0x4A_ActionToNumber(executionContext);
                    break;
                case 75 /* ActionToString */:
                    avm1_0x4B_ActionToString(executionContext);
                    break;
                case 68 /* ActionTypeOf */:
                    avm1_0x44_ActionTypeOf(executionContext);
                    break;
                case 71 /* ActionAdd2 */:
                    avm1_0x47_ActionAdd2(executionContext);
                    break;
                case 72 /* ActionLess2 */:
                    avm1_0x48_ActionLess2(executionContext);
                    break;
                case 63 /* ActionModulo */:
                    avm1_0x3F_ActionModulo(executionContext);
                    break;
                case 96 /* ActionBitAnd */:
                    avm1_0x60_ActionBitAnd(executionContext);
                    break;
                case 99 /* ActionBitLShift */:
                    avm1_0x63_ActionBitLShift(executionContext);
                    break;
                case 97 /* ActionBitOr */:
                    avm1_0x61_ActionBitOr(executionContext);
                    break;
                case 100 /* ActionBitRShift */:
                    avm1_0x64_ActionBitRShift(executionContext);
                    break;
                case 101 /* ActionBitURShift */:
                    avm1_0x65_ActionBitURShift(executionContext);
                    break;
                case 98 /* ActionBitXor */:
                    avm1_0x62_ActionBitXor(executionContext);
                    break;
                case 81 /* ActionDecrement */:
                    avm1_0x51_ActionDecrement(executionContext);
                    break;
                case 80 /* ActionIncrement */:
                    avm1_0x50_ActionIncrement(executionContext);
                    break;
                case 76 /* ActionPushDuplicate */:
                    avm1_0x4C_ActionPushDuplicate(executionContext);
                    break;
                case 62 /* ActionReturn */:
                    avm1_0x3E_ActionReturn(executionContext);
                    break;
                case 77 /* ActionStackSwap */:
                    avm1_0x4D_ActionStackSwap(executionContext);
                    break;
                case 135 /* ActionStoreRegister */:
                    avm1_0x87_ActionStoreRegister(executionContext, args);
                    break;

                case 84 /* ActionInstanceOf */:
                    avm1_0x54_ActionInstanceOf(executionContext);
                    break;
                case 85 /* ActionEnumerate2 */:
                    avm1_0x55_ActionEnumerate2(executionContext);
                    break;
                case 102 /* ActionStrictEquals */:
                    avm1_0x66_ActionStrictEquals(executionContext);
                    break;
                case 103 /* ActionGreater */:
                    avm1_0x67_ActionGreater(executionContext);
                    break;
                case 104 /* ActionStringGreater */:
                    avm1_0x68_ActionStringGreater(executionContext);
                    break;

                case 142 /* ActionDefineFunction2 */:
                    avm1_0x8E_ActionDefineFunction2(executionContext, args);
                    break;
                case 105 /* ActionExtends */:
                    avm1_0x69_ActionExtends(executionContext);
                    break;
                case 43 /* ActionCastOp */:
                    avm1_0x2B_ActionCastOp(executionContext);
                    break;
                case 44 /* ActionImplementsOp */:
                    avm1_0x2C_ActionImplementsOp(executionContext);
                    break;
                case 143 /* ActionTry */:
                    avm1_0x8F_ActionTry(executionContext, args);
                    break;
                case 42 /* ActionThrow */:
                    avm1_0x2A_ActionThrow(executionContext);
                    break;

                case 45 /* ActionFSCommand2 */:
                    avm1_0x2D_ActionFSCommand2(executionContext);
                    break;
                case 137 /* ActionStrictMode */:
                    avm1_0x89_ActionStrictMode(executionContext, args);
                    break;
                case 0 /* None */:
                    executionContext.isEndOfActions = true;
                    break;
                default:
                    throw new Error('Unknown action code: ' + actionCode);
            }
            return shallBranch;
        }

        function interpretActionWithRecovery(executionContext, parsedAction) {
            var currentContext;
            var result;
            try  {
                result = interpretAction(executionContext, parsedAction);

                executionContext.recoveringFromError = false;
            } catch (e) {
                // handling AVM1 errors
                currentContext = executionContext.context;
                if ((AVM1.avm1ErrorsEnabled.value && !currentContext.isTryCatchListening) || e instanceof AS2CriticalError) {
                    throw e;
                }
                if (e instanceof AS2Error) {
                    throw e;
                }

                Telemetry.instance.reportTelemetry({ topic: 'error', error: 1 /* AVM1_ERROR */ });

                if (!executionContext.recoveringFromError) {
                    if (currentContext.errorsIgnored++ >= MAX_AVM1_ERRORS_LIMIT) {
                        throw new AS2CriticalError('long running script -- AVM1 errors limit is reached');
                    }
                    console.error('AVM1 error: ' + e);
                    var avm2 = Shumway.AVM2.Runtime.AVM2;
                    avm2.instance.exceptions.push({
                        source: 'avm1', message: e.message,
                        stack: e.stack });
                    executionContext.recoveringFromError = true;
                }
            }
            return result;
        }

        function interpretActions(actionsData, scopeContainer, constantPool, registers) {
            var currentContext = AVM1.AS2Context.instance;

            if (!actionsData.ir) {
                var stream = new AVM1.ActionsDataStream(actionsData.bytes, currentContext.swfVersion);
                var parser = new AVM1.ActionsDataParser(stream);
                parser.dataId = actionsData.id;
                var analyzer = new AVM1.ActionsDataAnalyzer();
                actionsData.ir = analyzer.analyze(parser);

                if (AVM1.avm1CompilerEnabled.value) {
                    try  {
                        var c = new ActionsDataCompiler();
                        actionsData.ir.compiled = c.generate(actionsData.ir);
                    } catch (e) {
                        console.error('Unable to compile AVM1 function: ' + e);
                    }
                }
            }
            var ir = actionsData.ir;
            var compiled = ir.compiled;

            var stack = [];
            var isSwfVersion5 = currentContext.swfVersion >= 5;
            var actionTracer = ActionTracerFactory.get();
            var scope = scopeContainer.scope;

            var executionContext = {
                context: currentContext,
                global: currentContext.globals,
                scopeContainer: scopeContainer,
                scope: scope,
                actionTracer: actionTracer,
                constantPool: constantPool,
                registers: registers,
                stack: stack,
                isSwfVersion5: isSwfVersion5,
                recoveringFromError: false,
                isEndOfActions: false
            };

            if (scope._nativeAS3Object && scope._nativeAS3Object._deferScriptExecution) {
                currentContext.deferScriptExecution = true;
            }

            if (compiled) {
                return compiled(executionContext);
            }

            var instructionsExecuted = 0;
            var abortExecutionAt = currentContext.abortExecutionAt;

            if (AVM1.avm1DebuggerEnabled.value && (AVM1.Debugger.pause || AVM1.Debugger.breakpoints[ir.dataId])) {
                debugger;
            }

            var position = 0;
            var nextAction = ir.actions[position];

            while (nextAction && !executionContext.isEndOfActions) {
                // let's check timeout/Date.now every some number of instructions
                if (instructionsExecuted++ % CHECK_AVM1_HANG_EVERY === 0 && Date.now() >= abortExecutionAt) {
                    throw new AS2CriticalError('long running script -- AVM1 instruction hang timeout');
                }

                var shallBranch = interpretActionWithRecovery(executionContext, nextAction.action);
                if (shallBranch) {
                    position = nextAction.conditionalJumpTo;
                } else {
                    position = nextAction.next;
                }
                nextAction = ir.actions[position];
            }
            return stack.pop();
        }

        // Bare-minimum JavaScript code generator to make debugging better.
        var ActionsDataCompiler = (function () {
            function ActionsDataCompiler() {
                if (!ActionsDataCompiler.cachedCalls) {
                    ActionsDataCompiler.cachedCalls = generateActionCalls();
                }
            }
            ActionsDataCompiler.prototype.convertArgs = function (args, id, res) {
                var parts = [];
                for (var i = 0; i < args.length; i++) {
                    var arg = args[i];
                    if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
                        if (arg instanceof AVM1.ParsedPushConstantAction) {
                            var hint = '';
                            var currentConstantPool = res.constantPool;
                            if (currentConstantPool) {
                                var constant = currentConstantPool[arg.constantIndex];
                                hint = constant === undefined ? 'undefined' : JSON.stringify(constant);

                                // preventing code breakage due to bad constant
                                hint = hint.indexOf('*/') >= 0 ? '' : ' /* ' + hint + ' */';
                            }
                            parts.push('constantPool[' + arg.constantIndex + ']' + hint);
                        } else if (arg instanceof AVM1.ParsedPushRegisterAction) {
                            parts.push('registers[' + arg.registerNumber + ']');
                        } else if (arg instanceof AVM1.AS2ActionsData) {
                            var resName = 'code_' + id + '_' + i;
                            res[resName] = arg;
                            parts.push('res.' + resName);
                        } else {
                            notImplemented('Unknown AVM1 action argument type');
                        }
                    } else if (arg === undefined) {
                        parts.push('undefined'); // special case
                    } else {
                        parts.push(JSON.stringify(arg));
                    }
                }
                return parts.join(',');
            };
            ActionsDataCompiler.prototype.convertAction = function (item, id, res) {
                switch (item.action.actionCode) {
                    case 153 /* ActionJump */:
                    case 62 /* ActionReturn */:
                        return '';
                    case 136 /* ActionConstantPool */:
                        res.constantPool = item.action.args[0];
                        return '  constantPool = [' + this.convertArgs(item.action.args[0], id, res) + '];\n' + '  ectx.constantPool = constantPool;\n';
                    case 150 /* ActionPush */:
                        return '  stack.push(' + this.convertArgs(item.action.args, id, res) + ');\n';
                    case 138 /* ActionWaitForFrame */:
                    case 141 /* ActionWaitForFrame2 */:
                        return '  if (calls.' + item.action.actionName + '(ectx,[' + this.convertArgs(item.action.args, id, res) + '])) { position = ' + item.conditionalJumpTo + '; break; }\n';
                    case 157 /* ActionIf */:
                        return '  if (!!stack.pop()) { position = ' + item.conditionalJumpTo + '; break; }\n';
                    default:
                        var result = '  calls.' + item.action.actionName + '(ectx' + (item.action.args ? ',[' + this.convertArgs(item.action.args, id, res) + ']' : '') + ');\n';
                        return result;
                }
            };
            ActionsDataCompiler.prototype.checkAvm1Timeout = function (ectx) {
                if (Date.now() >= ectx.context.abortExecutionAt) {
                    throw new AS2CriticalError('long running script -- AVM1 instruction hang timeout');
                }
            };
            ActionsDataCompiler.prototype.generate = function (ir) {
                var _this = this;
                var blocks = ir.blocks;
                var res = {};
                var uniqueId = 0;
                var debugName = ir.dataId;
                var fn = 'return function avm1gen_' + debugName + '(ectx) {\n' + 'var position = 0;\n' + 'var checkTimeAfter = 0;\n' + 'var constantPool = ectx.constantPool, registers = ectx.registers, stack = ectx.stack;\n';
                if (AVM1.avm1DebuggerEnabled.value) {
                    fn += '/* Running ' + debugName + ' */ ' + 'if (Shumway.AVM1.Debugger.pause || Shumway.AVM1.Debugger.breakpoints.' + debugName + ') { debugger; }\n';
                }
                fn += 'while (!ectx.isEndOfActions) {\n' + 'if (checkTimeAfter <= 0) { checkTimeAfter = ' + CHECK_AVM1_HANG_EVERY + '; checkTimeout(ectx); }\n' + 'switch(position) {\n';
                blocks.forEach(function (b) {
                    fn += ' case ' + b.label + ':\n';
                    b.items.forEach(function (item) {
                        fn += _this.convertAction(item, uniqueId++, res);
                    });
                    fn += '  position = ' + b.jump + ';\n' + '  checkTimeAfter -= ' + b.items.length + ';\n' + '  break;\n';
                });
                fn += ' default: ectx.isEndOfActions = true; break;\n}\n}\n' + 'return stack.pop();};';
                return (new Function('calls', 'res', 'checkTimeout', fn))(ActionsDataCompiler.cachedCalls, res, this.checkAvm1Timeout);
            };
            return ActionsDataCompiler;
        })();

        var ActionTracerFactory = (function () {
            function ActionTracerFactory() {
            }
            ActionTracerFactory.get = function () {
                return AVM1.avm1TraceEnabled.value ? ActionTracerFactory.tracer : ActionTracerFactory.nullTracer;
            };
            ActionTracerFactory.tracer = (function () {
                var indentation = 0;
                return {
                    print: function (parsedAction, stack) {
                        var position = parsedAction.position;
                        var actionCode = parsedAction.actionCode;
                        var actionName = parsedAction.actionName;
                        var stackDump = [];
                        for (var q = 0; q < stack.length; q++) {
                            var item = stack[q];
                            stackDump.push(item && typeof item === 'object' ? '[' + (item.constructor && item.constructor.name ? item.constructor.name : 'Object') + ']' : item);
                        }

                        var indent = new Array(indentation + 1).join('..');

                        console.log('AVM1 trace: ' + indent + position + ': ' + actionName + '(' + actionCode.toString(16) + '), ' + 'stack=' + stackDump);
                    },
                    indent: function () {
                        indentation++;
                    },
                    unindent: function () {
                        indentation--;
                    },
                    message: function (msg) {
                        console.log('AVM1 trace: ------- ' + msg);
                    }
                };
            })();

            ActionTracerFactory.nullTracer = {
                print: function (parsedAction, stack) {
                },
                indent: function () {
                },
                unindent: function () {
                },
                message: function (msg) {
                }
            };
            return ActionTracerFactory;
        })();
    })(Shumway.AVM1 || (Shumway.AVM1 = {}));
    var AVM1 = Shumway.AVM1;
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
* limitations undxr the License.
*/
///<reference path='references.ts' />
var ASNative = Shumway.AVM2.AS.ASNative;
var ASObject = Shumway.AVM2.AS.ASObject;
var flash = Shumway.AVM2.AS.flash;
var Shumway;
(function (Shumway) {
    (function (AVM1) {
        var AS2Utils = (function (_super) {
            __extends(AS2Utils, _super);
            function AS2Utils() {
                false && _super.call(this);
            }
            // JS -> AS Bindings
            // static getTarget:(A:ASObject) => any;
            // static addEventHandlerProxy:(A:ASObject, B:string, C:string, D:ASFunction = null) => any;
            // AS -> JS Bindings
            AS2Utils.addProperty = function (obj, propertyName, getter, setter, enumerable) {
                if (typeof enumerable === "undefined") { enumerable = true; }
                obj.asDefinePublicProperty(propertyName, {
                    get: getter,
                    set: setter || undefined,
                    enumerable: enumerable,
                    configurable: true
                });
            };

            AS2Utils.resolveTarget = function (target_mc) {
                if (typeof target_mc === "undefined") { target_mc = undefined; }
                return AVM1.AS2Context.instance.resolveTarget(target_mc);
            };

            AS2Utils.resolveLevel = function (level) {
                level = +level;
                return AVM1.AS2Context.instance.resolveLevel(level);
            };

            Object.defineProperty(AS2Utils, "currentStage", {
                get: function () {
                    return AVM1.AS2Context.instance.stage;
                },
                enumerable: true,
                configurable: true
            });

            AS2Utils.getAS2Object = function (as3Object) {
                return AVM1.getAS2Object(as3Object);
            };

            AS2Utils._installObjectMethods = function () {
                var c = ASObject, p = c.asGetPublicProperty('prototype');
                c.asSetPublicProperty('registerClass', function registerClass(name, theClass) {
                    var classes = AVM1.AS2Context.instance.classes || (AVM1.AS2Context.instance.classes = {});
                    classes[name] = theClass;
                });
                p.asDefinePublicProperty('addProperty', {
                    value: function addProperty(name, getter, setter) {
                        if (typeof name !== 'string' || name === '') {
                            return false;
                        }
                        if (typeof getter !== 'function') {
                            return false;
                        }
                        if (typeof setter !== 'function' && setter !== null) {
                            return false;
                        }
                        this.asDefinePublicProperty(name, {
                            get: getter,
                            set: setter || undefined,
                            configurable: true,
                            enumerable: true
                        });
                        return true;
                    },
                    writable: false,
                    enumerable: false,
                    configurable: false
                });
            };
            AS2Utils.classInitializer = null;

            AS2Utils.initializer = null;

            AS2Utils.classSymbols = null;

            AS2Utils.instanceSymbols = null;
            return AS2Utils;
        })(ASNative);
        AVM1.AS2Utils = AS2Utils;

        function initDefaultListeners(thisArg) {
            var defaultListeners = thisArg.asGetPublicProperty('_as2DefaultListeners');
            if (!defaultListeners) {
                return;
            }
            for (var i = 0; i < defaultListeners.length; i++) {
                var p = defaultListeners[i];
                p.asGetPublicProperty('setter').call(thisArg, p.value);
            }
        }
        AVM1.initDefaultListeners = initDefaultListeners;

        function getAS2Object(as3Object) {
            if (!as3Object) {
                return null;
            }
            if (as3Object._as2Object) {
                return as3Object._as2Object;
            }
            if (flash.display.MovieClip.isType(as3Object)) {
                if (as3Object._as2SymbolClass) {
                    var ctor = as3Object._as2SymbolClass;
                    return new ctor(as3Object);
                }
                return new Shumway.AVM2.AS.avm1lib.AS2MovieClip(as3Object);
            }
            if (flash.display.SimpleButton.isType(as3Object)) {
                return new Shumway.AVM2.AS.avm1lib.AS2Button(as3Object);
            }
            if (flash.text.TextField.isType(as3Object)) {
                return new Shumway.AVM2.AS.avm1lib.AS2TextField(as3Object);
            }
            if (flash.display.BitmapData.isType(as3Object)) {
                return new as3Object;
            }

            return null;
        }
        AVM1.getAS2Object = getAS2Object;
    })(Shumway.AVM1 || (Shumway.AVM1 = {}));
    var AVM1 = Shumway.AVM1;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    (function (AVM2) {
        (function (AS) {
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
            // Class: AS2Button
            (function (avm1lib) {
                var somewhatImplemented = Shumway.Debug.somewhatImplemented;

                var StateTransitions;
                (function (StateTransitions) {
                    StateTransitions[StateTransitions["IdleToOverUp"] = 0x001] = "IdleToOverUp";
                    StateTransitions[StateTransitions["OverUpToIdle"] = 0x002] = "OverUpToIdle";
                    StateTransitions[StateTransitions["OverUpToOverDown"] = 0x004] = "OverUpToOverDown";
                    StateTransitions[StateTransitions["OverDownToOverUp"] = 0x008] = "OverDownToOverUp";
                    StateTransitions[StateTransitions["OverDownToOutDown"] = 0x010] = "OverDownToOutDown";
                    StateTransitions[StateTransitions["OutDownToOverDown"] = 0x020] = "OutDownToOverDown";
                    StateTransitions[StateTransitions["OutDownToIdle"] = 0x040] = "OutDownToIdle";
                    StateTransitions[StateTransitions["IdleToOverDown"] = 0x080] = "IdleToOverDown";
                    StateTransitions[StateTransitions["OverDownToIdle"] = 0x100] = "OverDownToIdle";
                })(StateTransitions || (StateTransitions = {}));

                /**
                * Key codes below 32 aren't interpreted as char codes, but are mapped to specific buttons instead.
                * This array uses the key code as the index and KeyboardEvent.keyCode values matching the
                * specific keys as the value.
                * @type {number[]}
                */
                var AVM1KeyCodeMap = [-1, 37, 39, 36, 35, 45, 46, -1, 8, -1, -1, -1, -1, 13, 38, 40, 33, 34, 9, 27];

                var AS2Button = (function (_super) {
                    __extends(AS2Button, _super);
                    function AS2Button(nativeButton) {
                        false && _super.call(this);
                        if (nativeButton) {
                            this._init(nativeButton);
                        }
                    }
                    // JS -> AS Bindings
                    // AS -> JS Bindings
                    // __as3Object: flash.display.SimpleButton;
                    AS2Button.prototype._init = function (nativeButton) {
                        this._nativeAS3Object = nativeButton;
                        Shumway.AVM1.initDefaultListeners(this);
                        if (!nativeButton._symbol || !nativeButton._symbol.buttonActions) {
                            return;
                        }
                        this._nativeAS3Object.addEventListener('addedToStage', this._addListeners.bind(this));
                        this._nativeAS3Object.addEventListener('removedFromStage', this._removeListeners.bind(this));
                        var requiredListeners = this._requiredListeners = Object.create(null);
                        var actions = this._actions = nativeButton._symbol.buttonActions;
                        for (var i = 0; i < actions.length; i++) {
                            var action = actions[i];
                            if (!action.actionsBlock) {
                                action.actionsBlock = new Shumway.AVM1.AS2ActionsData(action.actionsData, 'i' + i);
                            }
                            if (action.keyCode) {
                                requiredListeners['keyDown'] = this._keyDownHandler.bind(this);
                                continue;
                            }
                            var type;
                            switch (action.stateTransitionFlags) {
                                case 64 /* OutDownToIdle */:
                                    type = 'releaseOutside';
                                    break;
                                case 1 /* IdleToOverUp */:
                                    type = 'rollOver';
                                    break;
                                case 2 /* OverUpToIdle */:
                                    type = 'rollOut';
                                    break;
                                case 4 /* OverUpToOverDown */:
                                    type = 'mouseDown';
                                    break;
                                case 8 /* OverDownToOverUp */:
                                    type = 'mouseUp';
                                    break;
                                case 16 /* OverDownToOutDown */:
                                case 32 /* OutDownToOverDown */:
                                    somewhatImplemented('AVM1 drag over/out button actions');
                                    break;
                                case 128 /* IdleToOverDown */:
                                case 256 /* OverDownToIdle */:
                                    somewhatImplemented('AVM1 drag trackAsMenu over/out button actions');
                                    break;
                                default:
                                    warn('Unknown AVM1 button action type: ' + action.stateTransitionFlags);
                                    continue;
                            }
                            requiredListeners[type] = this._mouseEventHandler.bind(this, action.stateTransitionFlags);
                        }
                    };

                    AS2Button.prototype._addListeners = function () {
                        for (var type in this._requiredListeners) {
                            // on(key) works even if the button doesn't have focus, so we listen on the stage.
                            // TODO: we probably need to filter these events somehow if an AVM1 swf is loaded into
                            // an AVM2 one.
                            var target = type === 'keyDown' ? this._nativeAS3Object.stage : this._nativeAS3Object;
                            target.addEventListener(type, this._requiredListeners[type]);
                        }
                    };
                    AS2Button.prototype._removeListeners = function () {
                        for (var type in this._requiredListeners) {
                            var target = type === 'keyDown' ? this._nativeAS3Object.stage : this._nativeAS3Object;
                            target.removeEventListener(type, this._requiredListeners[type]);
                        }
                    };

                    AS2Button.prototype._keyDownHandler = function (event) {
                        var actions = this._actions;
                        for (var i = 0; i < actions.length; i++) {
                            var action = actions[i];
                            if (!action.keyCode) {
                                continue;
                            }
                            if ((action.keyCode < 32 && AVM1KeyCodeMap[action.keyCode] === event.asGetPublicProperty('keyCode')) || action.keyCode === event.asGetPublicProperty('charCode')) {
                                this._runAction(action);
                            }
                        }
                    };

                    AS2Button.prototype._mouseEventHandler = function (type) {
                        var actions = this._actions;
                        for (var i = 0; i < actions.length; i++) {
                            var action = actions[i];
                            if (action.stateTransitionFlags === type) {
                                this._runAction(action);
                            }
                        }
                    };

                    AS2Button.prototype._runAction = function (action) {
                        var avm1Context = this._nativeAS3Object.loaderInfo._avm1Context;
                        avm1Context.executeActions(action.actionsBlock, this._nativeAS3Object.stage, Shumway.AVM1.AS2Utils.getAS2Object(this._nativeAS3Object._parent));
                    };
                    Object.defineProperty(AS2Button.prototype, "_as3Object", {
                        get: function () {
                            return this._nativeAS3Object;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    AS2Button.classInitializer = null;

                    AS2Button.initializer = null;

                    AS2Button.classSymbols = null;

                    AS2Button.instanceSymbols = null;
                    return AS2Button;
                })(AS.ASNative);
                avm1lib.AS2Button = AS2Button;
            })(AS.avm1lib || (AS.avm1lib = {}));
            var avm1lib = AS.avm1lib;
        })(AVM2.AS || (AVM2.AS = {}));
        var AS = AVM2.AS;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    (function (AVM2) {
        (function (AS) {
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
            // Class: AS2Globals
            (function (avm1lib) {
                var assert = Shumway.Debug.assert;
                var notImplemented = Shumway.Debug.notImplemented;

                var TextFormat = Shumway.AVM2.AS.flash.text.TextFormat;
                var AS2Context = Shumway.AVM1.AS2Context;
                var Natives = Shumway.AVM2.AS.Natives;

                var AS2Globals = (function (_super) {
                    __extends(AS2Globals, _super);
                    function AS2Globals() {
                        false && _super.call(this);
                        notImplemented("Dummy Constructor: public avm1lib.AS2Globals");
                    }
                    // AS -> JS Bindings
                    AS2Globals._addInternalClasses = function (proto) {
                        var obj = proto;
                        obj.asSetPublicProperty('Object', AS.ASObject);
                        obj.asSetPublicProperty('Function', AS.ASFunction);
                        obj.asSetPublicProperty('Array', AS.ASArray);
                        obj.asSetPublicProperty('Number', AS.ASNumber);
                        obj.asSetPublicProperty('Math', AS.ASMath);
                        obj.asSetPublicProperty('Boolean', AS.ASBoolean);
                        obj.asSetPublicProperty('Date', AS.ASDate);
                        obj.asSetPublicProperty('RegExp', AS.ASRegExp);
                        obj.asSetPublicProperty('String', AS.ASString);
                    };

                    AS2Globals.prototype.ASSetPropFlags = function (obj, children, flags, allowFalse) {
                        // flags (from bit 0): dontenum, dontdelete, readonly, ....
                        // TODO
                    };
                    AS2Globals.prototype._addToPendingScripts = function (subject, fn, args) {
                        if (typeof args === "undefined") { args = null; }
                        release || assert(fn, 'invalid function in _addToPendingScripts');
                        AS2Context.instance.addToPendingScripts(function () {
                            fn.apply(subject, args);
                        });
                    };

                    /**
                    * AS2 escapes slightly more characters than JS's encodeURIComponent, and even more than
                    * the deprecated JS version of escape. That leaves no other option but to do manual post-
                    * processing of the encoded result. :/
                    *
                    * Luckily, unescape isn't thus afflicted - it happily unescapes all the additional things
                    * we escape here.
                    */
                    AS2Globals.prototype.escape = function (str) {
                        var result = encodeURIComponent(str);
                        return result.replace(/\!|'|\(|\)|\*|-|\.|_|~/g, function (char) {
                            switch (char) {
                                case '*':
                                    return '%2A';
                                case '-':
                                    return '%2D';
                                case '.':
                                    return '%2E';
                                case '_':
                                    return '%5F';
                                default:
                                    return globalEscape(char);
                            }
                        });
                    };

                    AS2Globals.prototype.unescape = function (str) {
                        return decodeURIComponent(str);
                    };

                    AS2Globals.prototype._setLevel = function (level /*uint*/ , loader) {
                        level = level >>> 0;
                        AS2Context.instance.stage._as2SetLevel(level, loader);
                    };
                    AS2Globals.prototype.trace = function (expression) {
                        Natives.print(expression);
                    };
                    AS2Globals.classInitializer = null;

                    AS2Globals.initializer = function () {
                        // The AS2 version of TextFormat has an additional method "getTextExtent".
                        // We install that here so we don't need to have a full AS2 version of
                        // TextFormat and take care to return that everywhere when in AS2 mode.
                        TextFormat.prototype.asDefinePublicProperty('getTextExtent', {
                            value: avm1lib.AS2TextFormat.prototype._as2GetTextExtent,
                            writable: false,
                            enumerable: false,
                            configurable: false
                        });
                    };

                    AS2Globals.classSymbols = null;

                    AS2Globals.instanceSymbols = [
                        "_global!", "flash", "$asfunction", "call!", "chr!",
                        "clearInterval!", "clearTimeout!", "duplicateMovieClip!",
                        "fscommand", "getAS2Property!", "getTimer!",
                        "getURL!", "getVersion!", "gotoAndPlay!", "gotoAndStop!",
                        "gotoLabel!", "ifFrameLoaded!", "int!", "length!", "loadMovie!",
                        "loadMovieNum!", "loadVariables!", "mbchr!", "mblength!",
                        "mbord!", "mbsubstring!", "nextFrame!", "nextScene!", "ord!",
                        "play!", "prevFrame!", "prevScene!", "print!", "printAsBitmap!",
                        "printAsBitmapNum!", "printNum!", "random!",
                        "removeMovieClip!", "setInterval!", "setAS2Property!",
                        "setTimeout!", "showRedrawRegions!", "startDrag!", "stop!",
                        "stopAllSounds!", "stopDrag!", "substring!", "targetPath!",
                        "toggleHighQuality!", "unloadMovie!",
                        "unloadMovieNum!", "updateAfterEvent!"];
                    return AS2Globals;
                })(AS.ASNative);
                avm1lib.AS2Globals = AS2Globals;
            })(AS.avm1lib || (AS.avm1lib = {}));
            var avm1lib = AS.avm1lib;
        })(AVM2.AS || (AVM2.AS = {}));
        var AS = AVM2.AS;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));

var globalEscape = this['escape'];
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
var Shumway;
(function (Shumway) {
    (function (AVM2) {
        (function (AS) {
            ///<reference path='references.ts' />
            (function (avm1lib) {
                var construct = Shumway.AVM2.Runtime.construct;
                var AS2Context = Shumway.AVM1.AS2Context;
                var getAS2Object = Shumway.AVM1.getAS2Object;

                var AS2MovieClip = (function (_super) {
                    __extends(AS2MovieClip, _super);
                    function AS2MovieClip(nativeMovieClip) {
                        false && _super.call(this);
                        this._nativeAS3Object = nativeMovieClip;
                    }
                    // AS -> JS Bindings
                    // __as3Object: flash.display.MovieClip;
                    AS2MovieClip.prototype._init = function (nativeMovieClip) {
                        if (!nativeMovieClip) {
                            return;
                        }
                        this._nativeAS3Object = nativeMovieClip;
                        nativeMovieClip._as2Object = this;
                        Shumway.AVM1.initDefaultListeners(this);
                    };
                    Object.defineProperty(AS2MovieClip.prototype, "_as3Object", {
                        get: function () {
                            return this._nativeAS3Object;
                        },
                        enumerable: true,
                        configurable: true
                    });

                    AS2MovieClip.prototype.attachBitmap = function (bmp, depth, pixelSnapping, smoothing) {
                        if (typeof pixelSnapping === "undefined") { pixelSnapping = 'auto'; }
                        if (typeof smoothing === "undefined") { smoothing = false; }
                        var bitmap = construct(AS.flash.display.Bitmap, [bmp, pixelSnapping, smoothing]);
                        this._insertChildAtDepth(bitmap, depth);
                    };

                    AS2MovieClip.prototype._constructMovieClipSymbol = function (symbolId, name) {
                        var theClass = AS2Context.instance.classes && AS2Context.instance.classes[symbolId];
                        var symbol = AS2Context.instance.getAsset(symbolId);

                        var mc = AS.flash.display.MovieClip.initializeFrom(symbol);
                        AS.flash.display.MovieClip.instanceConstructorNoInitialize.call(mc);
                        mc._as2SymbolClass = theClass;
                        mc._name = name;

                        return mc;
                    };
                    AS2MovieClip.prototype._callFrame = function (frame) {
                        var nativeAS3Object = this._nativeAS3Object;
                        nativeAS3Object._callFrame(frame);
                    };
                    AS2MovieClip.prototype._insertChildAtDepth = function (mc, depth) {
                        var nativeAS3Object = this._nativeAS3Object;
                        nativeAS3Object.addChildAtDepth(mc, Math.min(nativeAS3Object.numChildren, depth));

                        // Bitmaps aren't reflected in AS2, so the rest here doesn't apply.
                        if (AS.flash.display.Bitmap.isType(mc)) {
                            return null;
                        }
                        var as2mc = getAS2Object(mc);
                        var name = mc.name;
                        if (name) {
                            this.asSetPublicProperty(name, as2mc);
                        }
                        return as2mc;
                    };

                    AS2MovieClip.prototype.getInstanceAtDepth = function (depth) {
                        var nativeObject = this._nativeAS3Object;
                        for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
                            var child = nativeObject.getChildAt(i);

                            // child is null if it hasn't been constructed yet. This can happen in InitActionBlocks.
                            if (child && child._depth === depth) {
                                // Somewhat absurdly, this method returns the mc if a bitmap is at the given depth.
                                if (AS.flash.display.Bitmap.isType(child)) {
                                    return this;
                                }
                                return getAS2Object(child);
                            }
                        }
                        return null;
                    };
                    AS2MovieClip.prototype.getNextHighestDepth = function () {
                        var nativeObject = this._nativeAS3Object;
                        var maxDepth = 0;
                        for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
                            var child = nativeObject.getChildAt(i);
                            if (child._depth > maxDepth) {
                                maxDepth = child._depth;
                            }
                        }
                        return maxDepth + 1;
                    };

                    AS2MovieClip.prototype._duplicate = function (name, depth, initObject) {
                        var nativeAS3Object = this._nativeAS3Object;
                        nativeAS3Object._duplicate(name, depth, initObject);
                    };
                    AS2MovieClip.prototype._gotoLabel = function (label) {
                        var nativeAS3Object = this._nativeAS3Object;
                        nativeAS3Object.gotoLabel(label);
                    };
                    AS2MovieClip.classInitializer = null;

                    AS2MovieClip.initializer = null;

                    AS2MovieClip.classSymbols = null;

                    AS2MovieClip.instanceSymbols = ["__lookupChild!", "__targetPath!"];
                    return AS2MovieClip;
                })(AS.ASNative);
                avm1lib.AS2MovieClip = AS2MovieClip;
            })(AS.avm1lib || (AS.avm1lib = {}));
            var avm1lib = AS.avm1lib;
        })(AVM2.AS || (AVM2.AS = {}));
        var AS = AVM2.AS;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    (function (AVM2) {
        (function (AS) {
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
            // Class: AS2MovieClipLoader
            (function (avm1lib) {
                var AS2MovieClipLoader = (function (_super) {
                    __extends(AS2MovieClipLoader, _super);
                    function AS2MovieClipLoader() {
                        false && _super.call(this);
                    }
                    Object.defineProperty(AS2MovieClipLoader.prototype, "_as3Object", {
                        // JS -> AS Bindings
                        // AS -> JS Bindings
                        // __bytesLoaded: number;
                        get: function () {
                            return this._nativeAS3Object;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    AS2MovieClipLoader.prototype._setAS3Object = function (nativeLoader) {
                        this._nativeAS3Object = nativeLoader;
                    };
                    Object.defineProperty(AS2MovieClipLoader.prototype, "_bytesLoaded", {
                        get: function () {
                            var nativeAS3Object = this._nativeAS3Object;
                            return nativeAS3Object._contentLoaderInfo._bytesLoaded;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    AS2MovieClipLoader.classInitializer = null;

                    AS2MovieClipLoader.initializer = null;

                    AS2MovieClipLoader.classSymbols = null;

                    AS2MovieClipLoader.instanceSymbols = null;
                    return AS2MovieClipLoader;
                })(AS.ASNative);
                avm1lib.AS2MovieClipLoader = AS2MovieClipLoader;
            })(AS.avm1lib || (AS.avm1lib = {}));
            var avm1lib = AS.avm1lib;
        })(AVM2.AS || (AVM2.AS = {}));
        var AS = AVM2.AS;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
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
* limitations undxr the License.
*/
var Shumway;
(function (Shumway) {
    (function (AVM2) {
        (function (AS) {
            (function (avm1lib) {
                var BitmapData = Shumway.AVM2.AS.flash.display.BitmapData;
                var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
                var AS2Context = Shumway.AVM1.AS2Context;

                var AS2BitmapData = (function (_super) {
                    __extends(AS2BitmapData, _super);
                    function AS2BitmapData(bitmapData, pixelSnapping, smoothing) {
                        false && _super.call(this);
                    }
                    AS2BitmapData.loadBitmap = function (symbolId) {
                        symbolId = asCoerceString(symbolId);
                        var symbol = AS2Context.instance.getAsset(symbolId);
                        if (symbol instanceof Shumway.Timeline.BitmapSymbol) {
                            var bitmap = AS2BitmapData.initializeFrom(symbol);
                            bitmap.class.instanceConstructorNoInitialize.call(bitmap);
                            return bitmap;
                        }
                        return null;
                    };
                    AS2BitmapData.classInitializer = null;

                    AS2BitmapData.initializer = null;

                    AS2BitmapData.classSymbols = null;

                    AS2BitmapData.instanceSymbols = null;
                    return AS2BitmapData;
                })(BitmapData);
                avm1lib.AS2BitmapData = AS2BitmapData;
            })(AS.avm1lib || (AS.avm1lib = {}));
            var avm1lib = AS.avm1lib;
        })(AVM2.AS || (AVM2.AS = {}));
        var AS = AVM2.AS;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    (function (AVM2) {
        (function (AS) {
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
            // Class: AS2TextField
            (function (avm1lib) {
                var getAS2Object = Shumway.AVM1.getAS2Object;

                var AS2TextField = (function (_super) {
                    __extends(AS2TextField, _super);
                    function AS2TextField(nativeTextField) {
                        false && _super.call(this);

                        this._variable = '';
                        this._init(nativeTextField);
                    }
                    // JS -> AS Bindings
                    // AS -> JS Bindings
                    AS2TextField.prototype._init = function (nativeTextField) {
                        this._nativeAS3Object = nativeTextField;
                        nativeTextField._as2Object = this;
                        Shumway.AVM1.initDefaultListeners(this);
                    };
                    Object.defineProperty(AS2TextField.prototype, "_as3Object", {
                        get: function () {
                            return this._nativeAS3Object;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(AS2TextField.prototype, "variable", {
                        get: function () {
                            return this._variable;
                        },
                        set: function (name) {
                            if (name === this._variable) {
                                return;
                            }
                            this._variable = name;
                            var instance = this._nativeAS3Object;
                            var hasPath = name.indexOf('.') >= 0 || name.indexOf(':') >= 0;
                            var clip;
                            if (hasPath) {
                                var targetPath = name.split(/[.:\/]/g);
                                name = targetPath.pop();
                                if (targetPath[0] == '_root' || targetPath[0] === '') {
                                    clip = getAS2Object(instance.root);
                                    targetPath.shift();
                                    if (targetPath[0] === '') {
                                        targetPath.shift();
                                    }
                                } else {
                                    clip = getAS2Object(instance._parent);
                                }
                                while (targetPath.length > 0) {
                                    var childName = targetPath.shift();
                                    clip = clip.asGetPublicProperty(childName) || clip[childName];
                                    if (!clip) {
                                        throw new Error('Cannot find ' + childName + ' variable');
                                    }
                                }
                            } else {
                                clip = getAS2Object(instance._parent);
                            }
                            if (!clip.asHasProperty(undefined, name, 0)) {
                                clip.asSetPublicProperty(name, instance.text);
                            }
                            instance._addEventListener('advanceFrame', function () {
                                instance.text = '' + clip.asGetPublicProperty(name);
                            });
                        },
                        enumerable: true,
                        configurable: true
                    });
                    AS2TextField.classInitializer = null;

                    AS2TextField.initializer = null;

                    AS2TextField.classSymbols = null;

                    AS2TextField.instanceSymbols = null;
                    return AS2TextField;
                })(AS.ASNative);
                avm1lib.AS2TextField = AS2TextField;
            })(AS.avm1lib || (AS.avm1lib = {}));
            var avm1lib = AS.avm1lib;
        })(AVM2.AS || (AVM2.AS = {}));
        var AS = AVM2.AS;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    (function (AVM2) {
        (function (AS) {
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
            // Class: AS2TextField
            (function (avm1lib) {
                var TextField = Shumway.AVM2.AS.flash.text.TextField;
                var TextFormat = Shumway.AVM2.AS.flash.text.TextFormat;

                var AS2TextFormat = (function (_super) {
                    __extends(AS2TextFormat, _super);
                    function AS2TextFormat() {
                        _super.apply(this, arguments);
                    }
                    AS2TextFormat.prototype._as2GetTextExtent = function (text, width) {
                        var measureTextField = AS2TextFormat._measureTextField;
                        if (!measureTextField) {
                            measureTextField = new TextField();
                            measureTextField.multiline = true;
                            AS2TextFormat._measureTextField = measureTextField;
                        }
                        if (!isNaN(width) && width > 0) {
                            measureTextField.width = width + 4;
                            measureTextField.wordWrap = true;
                        } else {
                            measureTextField.wordWrap = false;
                        }
                        measureTextField.defaultTextFormat = this;
                        measureTextField.text = text;
                        var result = {};
                        var textWidth = measureTextField.textWidth;
                        var textHeight = measureTextField.textHeight;
                        result.asSetPublicProperty('width', textWidth);
                        result.asSetPublicProperty('height', textHeight);
                        result.asSetPublicProperty('textFieldWidth', textWidth + 4);
                        result.asSetPublicProperty('textFieldHeight', textHeight + 4);
                        var metrics = measureTextField.getLineMetrics(0);
                        result.asSetPublicProperty('ascent', metrics.asGetPublicProperty('ascent'));
                        result.asSetPublicProperty('descent', metrics.asGetPublicProperty('descent'));
                        return result;
                    };
                    return AS2TextFormat;
                })(TextFormat);
                avm1lib.AS2TextFormat = AS2TextFormat;
            })(AS.avm1lib || (AS.avm1lib = {}));
            var avm1lib = AS.avm1lib;
        })(AVM2.AS || (AVM2.AS = {}));
        var AS = AVM2.AS;
    })(Shumway.AVM2 || (Shumway.AVM2 = {}));
    var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
// ///<reference path='../flash/references.ts' />
///<reference path='../avm1/references.ts' />
///<reference path='AS2Button.ts' />
///<reference path='AS2Globals.ts' />
///<reference path='AS2MovieClip.ts' />
///<reference path='AS2MovieClipLoader.ts' />
///<reference path='AS2BitmapData.ts' />
///<reference path='AS2TextField.ts' />
///<reference path='AS2TextFormat.ts' />
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
/// <reference path='../../build/ts/avm2.d.ts' />
///<reference path='stream.ts' />
///<reference path='parser.ts' />
///<reference path='analyze.ts' />
///<reference path='context.ts' />
///<reference path='interpreter.ts' />
///<reference path='AS2Utils.ts' />
///<reference path='flash.d.ts' />
///<reference path='../avm1lib/references.ts' />
//# sourceMappingURL=avm1.js.map
