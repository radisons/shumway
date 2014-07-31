/*
* Copyright 2013 Mozilla Foundation
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
    (function (Player) {
        Player.timelineBuffer = new Shumway.Tools.Profiler.TimelineBuffer("Player");
        Player.counter = new Shumway.Metrics.Counter(!release);

        Player.writer = null;

        function enterTimeline(name, data) {
            Player.writer && Player.writer.enter(name);
            profile && Player.timelineBuffer && Player.timelineBuffer.enter(name, data);
        }
        Player.enterTimeline = enterTimeline;

        function leaveTimeline(name, data) {
            Player.writer && Player.writer.leave(name);
            profile && Player.timelineBuffer && Player.timelineBuffer.leave(name, data);
        }
        Player.leaveTimeline = leaveTimeline;
    })(Shumway.Player || (Shumway.Player = {}));
    var Player = Shumway.Player;
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
    var OptionSet = Shumway.Options.OptionSet;

    var shumwayOptions = Shumway.Settings.shumwayOptions;

    Shumway.playerOptions = shumwayOptions.register(new OptionSet("Player Options"));

    Shumway.frameEnabledOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Enable Frame Execution", "boolean", true, "Enable frame execution."));

    Shumway.timerEnabledOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Enable Timers", "boolean", true, "Enable timer events."));

    Shumway.pumpEnabledOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Enable Pump", "boolean", true, "Enable display tree serialization."));

    Shumway.pumpRateOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Pump Rate", "number", 80, "Number of times / second that the display list is synchronized.", { range: { min: 1, max: 120, step: 1 } }));

    Shumway.frameRateOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Frame Rate", "number", 60, "Override a movie's frame rate, set to -1 to use the movies default frame rate.", { range: { min: 1, max: 120, step: 1 } }));

    Shumway.traceCountersOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Trace Counters", "number", 0, "Trace counters every few frames.", { range: { min: 1, max: 120, step: 1 } }));

    Shumway.frameRateMultiplierOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Frame Rate Multiplier", "number", 1, "Play frames at a faster rate.", { range: { min: 1, max: 16, step: 1 } }));

    Shumway.dontSkipFramesOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Disables Frame Skipping", "boolean", false, "Play all frames, e.g. no skipping frame during throttle."));

    Shumway.playAllSymbolsOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Play Symbols", "boolean", false, "Plays all SWF symbols automatically."));

    Shumway.playSymbolOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Play Symbol Number", "number", 0, "Select symbol by Id.", { range: { min: 0, max: 20000, step: 1 } }));

    Shumway.playSymbolFrameDurationOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Play Symbol Duration", "number", 0, "How many frames to play, 0 for all frames of the movie clip.", { range: { min: 0, max: 128, step: 1 } }));

    Shumway.playSymbolCountOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Play Symbol Count", "number", -1, "Select symbol count.", { range: { min: 0, max: 20000, step: 1 } }));

    Shumway.stageScaleOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Stage Scale", "number", 1, "Scales the symbols.", { range: { min: 0.1, max: 16, step: 0.01 } }));
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
    var FrameScheduler = (function () {
        function FrameScheduler() {
            this._expectedNextFrameAt = performance.now();
            this._drawStats = [];
            this._drawStatsSum = 0;
            this._drawStarted = 0;
            this._drawsSkipped = 0;
            this._expectedNextFrameAt = performance.now();
            this._onTime = true;
            this._trackDelta = false;
            this._delta = 0;
            this._onTimeDelta = 0;
        }
        Object.defineProperty(FrameScheduler.prototype, "shallSkipDraw", {
            get: function () {
                if (this._drawsSkipped >= FrameScheduler.MAX_DRAWS_TO_SKIP) {
                    return false;
                }
                var averageDraw = this._drawStats.length < FrameScheduler.STATS_TO_REMEMBER ? 0 : this._drawStatsSum / this._drawStats.length;
                var estimatedDrawEnd = performance.now() + averageDraw;
                return estimatedDrawEnd + FrameScheduler.INTERVAL_PADDING_MS > this._expectedNextFrameAt;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(FrameScheduler.prototype, "nextFrameIn", {
            get: function () {
                return Math.max(0, this._expectedNextFrameAt - performance.now());
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(FrameScheduler.prototype, "isOnTime", {
            get: function () {
                return this._onTime;
            },
            enumerable: true,
            configurable: true
        });

        FrameScheduler.prototype.startFrame = function (frameRate) {
            var interval = 1000 / frameRate;

            var adjustedInterval = interval;
            var delta = this._onTimeDelta + this._delta;
            if (delta !== 0) {
                if (delta < 0) {
                    adjustedInterval *= FrameScheduler.SPEED_ADJUST_RATE;
                } else if (delta > 0) {
                    adjustedInterval /= FrameScheduler.SPEED_ADJUST_RATE;
                }
                this._onTimeDelta += (interval - adjustedInterval);
            }

            this._expectedNextFrameAt += adjustedInterval;
            this._onTime = true;
        };

        FrameScheduler.prototype.endFrame = function () {
            var estimatedNextFrameStart = performance.now() + FrameScheduler.INTERVAL_PADDING_MS;
            if (estimatedNextFrameStart > this._expectedNextFrameAt) {
                if (this._trackDelta) {
                    this._onTimeDelta += (this._expectedNextFrameAt - estimatedNextFrameStart);
                    console.log(this._onTimeDelta);
                }
                this._expectedNextFrameAt = estimatedNextFrameStart;
                this._onTime = false;
            }
        };

        FrameScheduler.prototype.startDraw = function () {
            this._drawsSkipped = 0;
            this._drawStarted = performance.now();
        };

        FrameScheduler.prototype.endDraw = function () {
            var drawTime = performance.now() - this._drawStarted;
            this._drawStats.push(drawTime);
            this._drawStatsSum += drawTime;
            while (this._drawStats.length > FrameScheduler.STATS_TO_REMEMBER) {
                this._drawStatsSum -= this._drawStats.shift();
            }
        };

        FrameScheduler.prototype.skipDraw = function () {
            this._drawsSkipped++;
        };

        FrameScheduler.prototype.setDelta = function (value) {
            if (!this._trackDelta) {
                return;
            }
            this._delta = value;
        };

        FrameScheduler.prototype.startTrackDelta = function () {
            this._trackDelta = true;
        };

        FrameScheduler.prototype.endTrackDelta = function () {
            if (!this._trackDelta) {
                return;
            }
            this._trackDelta = false;
            this._delta = 0;
            this._onTimeDelta = 0;
        };
        FrameScheduler.STATS_TO_REMEMBER = 50;
        FrameScheduler.MAX_DRAWS_TO_SKIP = 2;
        FrameScheduler.INTERVAL_PADDING_MS = 4;
        FrameScheduler.SPEED_ADJUST_RATE = 0.9;
        return FrameScheduler;
    })();
    Shumway.FrameScheduler = FrameScheduler;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    (function (Remoting) {
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
        (function (Player) {
            var MessageTag = Shumway.Remoting.MessageTag;
            var MessageBits = Shumway.Remoting.MessageBits;

            var flash = Shumway.AVM2.AS.flash;

            var display = Shumway.AVM2.AS.flash.display;

            var BitmapData = Shumway.AVM2.AS.flash.display.BitmapData;

            var DisplayObjectFlags = Shumway.AVM2.AS.flash.display.DisplayObjectFlags;

            var BlendMode = Shumway.AVM2.AS.flash.display.BlendMode;
            var PixelSnapping = Shumway.AVM2.AS.flash.display.PixelSnapping;
            var VisitorFlags = Shumway.AVM2.AS.flash.display.VisitorFlags;

            var Point = Shumway.AVM2.AS.flash.geom.Point;
            var Bounds = Shumway.Bounds;

            var assert = Shumway.Debug.assert;
            var writer = Shumway.Player.writer;

            var PlayerChannelSerializer = (function () {
                function PlayerChannelSerializer() {
                    this.phase = 0 /* Objects */;
                }
                PlayerChannelSerializer.prototype.writeDisplayObject = function (displayObject) {
                    var serializer = this;
                    displayObject.visit(function (displayObject) {
                        serializer.writeUpdateFrame(displayObject);
                        return 0 /* Continue */;
                    }, 16 /* Filter */, DisplayObjectFlags.Dirty);
                };

                PlayerChannelSerializer.prototype.writeStage = function (stage) {
                    writer && writer.writeLn("Sending Stage");
                    var serializer = this;
                    this.output.writeInt(104 /* UpdateStage */);
                    this.output.writeInt(stage._id);
                    this.output.writeInt(stage.color);
                    this.writeRectangle(new Bounds(0, 0, stage.stageWidth * 20, stage.stageHeight * 20));
                };

                PlayerChannelSerializer.prototype.writeGraphics = function (graphics) {
                    if (graphics._isDirty) {
                        writer && writer.writeLn("Sending Graphics: " + graphics._id);
                        var textures = graphics.getUsedTextures();
                        var numTextures = textures.length;
                        for (var i = 0; i < numTextures; i++) {
                            this.writeBitmapData(textures[i]);
                        }
                        this.output.writeInt(101 /* UpdateGraphics */);
                        this.output.writeInt(graphics._id);
                        this.output.writeInt(-1);
                        this.writeRectangle(graphics._getContentBounds());
                        this.pushAsset(graphics.getGraphicsData().toPlainObject());
                        this.output.writeInt(numTextures);
                        for (var i = 0; i < numTextures; i++) {
                            this.output.writeInt(textures[i]._id);
                        }
                        graphics._isDirty = false;
                    }
                };

                PlayerChannelSerializer.prototype.writeBitmapData = function (bitmapData) {
                    if (bitmapData._isDirty) {
                        writer && writer.writeLn("Sending BitmapData: " + bitmapData._id);
                        this.output.writeInt(102 /* UpdateBitmapData */);
                        this.output.writeInt(bitmapData._id);
                        this.output.writeInt(bitmapData._symbol ? bitmapData._symbol.id : -1);
                        this.writeRectangle(bitmapData._getContentBounds());
                        this.output.writeInt(bitmapData._type);
                        this.pushAsset(bitmapData.getDataBuffer().toPlainObject());
                        bitmapData._isDirty = false;
                    }
                };

                PlayerChannelSerializer.prototype.writeTextContent = function (textContent) {
                    if (textContent.flags & Shumway.TextContentFlags.Dirty) {
                        writer && writer.writeLn("Sending TextContent: " + textContent._id);
                        this.output.writeInt(103 /* UpdateTextContent */);
                        this.output.writeInt(textContent._id);
                        this.output.writeInt(-1);
                        this.writeRectangle(textContent.bounds);
                        this.writeMatrix(textContent.matrix || flash.geom.Matrix.FROZEN_IDENTITY_MATRIX);
                        this.output.writeInt(textContent.backgroundColor);
                        this.output.writeInt(textContent.borderColor);
                        this.output.writeInt(textContent.autoSize);
                        this.output.writeBoolean(textContent.wordWrap);
                        this.pushAsset(textContent.plainText);
                        this.pushAsset(textContent.textRunData.toPlainObject());
                        var coords = textContent.coords;
                        if (coords) {
                            var numCoords = coords.length;
                            this.output.writeInt(numCoords);
                            for (var i = 0; i < numCoords; i++) {
                                this.output.writeInt(coords[i]);
                            }
                        } else {
                            this.output.writeInt(0);
                        }
                        textContent.flags &= ~Shumway.TextContentFlags.Dirty;
                    }
                };

                PlayerChannelSerializer.prototype.writeFont = function (font) {
                    // Device fonts can be skipped, they obviously should exist on the device.
                    if (font.fontType === 'embedded') {
                        writer && writer.writeLn("Sending Font: " + font._id);
                        var symbol = font._symbol;
                        release || assert(symbol);
                        this.output.writeInt(200 /* RegisterFont */);
                        this.output.writeInt(font._id);
                        this.output.writeBoolean(symbol.bold);
                        this.output.writeBoolean(symbol.italic);
                        this.pushAsset(symbol.data);
                    }
                };

                /**
                * Writes the number of display objects this display object clips.
                */
                PlayerChannelSerializer.prototype.writeClip = function (displayObject) {
                    if (displayObject._clipDepth >= 0 && displayObject._parent) {
                        // Clips in GFX land don't use absolute clip depth numbers. Instead we need to encode
                        // the number of siblings you want to clip. If children are removed or added, GFX clip
                        // values need to be recomputed.
                        var i = displayObject._parent.getChildIndex(displayObject);
                        var j = displayObject._parent.getClipDepthIndex(displayObject._clipDepth);
                        for (var k = i + 1; k <= i; k++) {
                            // assert(displayObject._parent.getChildAt(k)._depth > displayObject._depth && displayObject._parent.getChildAt(k)._depth <= displayObject._clipDepth);
                        }
                        release || assert(j - i >= 0);
                        this.output.writeInt(j - i);
                    } else {
                        this.output.writeInt(-1);
                    }
                };

                PlayerChannelSerializer.prototype.writeUpdateFrame = function (displayObject) {
                    // Write Header
                    this.output.writeInt(100 /* UpdateFrame */);
                    this.output.writeInt(displayObject._id);

                    writer && writer.writeLn("Sending UpdateFrame: " + displayObject.debugName());

                    var hasMask = false;
                    var hasMatrix = displayObject._hasFlags(1048576 /* DirtyMatrix */);
                    var hasColorTransform = displayObject._hasFlags(33554432 /* DirtyColorTransform */);
                    var hasMiscellaneousProperties = displayObject._hasFlags(268435456 /* DirtyMiscellaneousProperties */);

                    // Check if any children need to be written. These are remoting children, not just display object children.
                    var hasRemotableChildren = false;
                    if (this.phase === 1 /* References */) {
                        hasRemotableChildren = displayObject._hasAnyFlags(2097152 /* DirtyChildren */ | 4194304 /* DirtyGraphics */ | 16777216 /* DirtyBitmapData */ | 8388608 /* DirtyTextContent */);
                        hasMask = displayObject._hasFlags(67108864 /* DirtyMask */);
                    }
                    var bitmap = null;
                    if (display.Bitmap.isType(displayObject)) {
                        bitmap = displayObject;
                    }

                    // Checks if the computed clip value needs to be written.
                    var hasClip = displayObject._hasFlags(134217728 /* DirtyClipDepth */);

                    // Write Has Bits
                    var hasBits = 0;
                    hasBits |= hasMatrix ? 1 /* HasMatrix */ : 0;
                    hasBits |= hasColorTransform ? 8 /* HasColorTransform */ : 0;
                    hasBits |= hasMask ? 64 /* HasMask */ : 0;
                    hasBits |= hasClip ? 128 /* HasClip */ : 0;
                    hasBits |= hasMiscellaneousProperties ? 32 /* HasMiscellaneousProperties */ : 0;
                    hasBits |= hasRemotableChildren ? 4 /* HasChildren */ : 0;
                    this.output.writeInt(hasBits);

                    // Write Properties
                    if (hasMatrix) {
                        this.writeMatrix(displayObject._getMatrix());
                    }
                    if (hasColorTransform) {
                        this.writeColorTransform(displayObject._colorTransform);
                    }
                    if (hasMask) {
                        this.output.writeInt(displayObject.mask ? displayObject.mask._id : -1);
                    }
                    if (hasClip) {
                        this.writeClip(displayObject);
                    }
                    if (hasMiscellaneousProperties) {
                        this.output.writeInt(BlendMode.toNumber(displayObject._blendMode));
                        this.output.writeBoolean(displayObject._hasFlags(1 /* Visible */));
                        if (bitmap) {
                            this.output.writeInt(PixelSnapping.toNumber(bitmap.pixelSnapping));
                            this.output.writeInt(bitmap.smoothing ? 1 : 0);
                        } else {
                            this.output.writeInt(PixelSnapping.toNumber(PixelSnapping.AUTO));
                            this.output.writeInt(1);
                        }
                    }

                    var graphics = displayObject._getGraphics();
                    var textContent = displayObject._getTextContent();
                    if (hasRemotableChildren) {
                        writer && writer.enter("Children: {");
                        if (bitmap) {
                            if (bitmap.bitmapData) {
                                this.output.writeInt(1);
                                this.output.writeInt(134217728 /* Asset */ | bitmap.bitmapData._id);
                            } else {
                                this.output.writeInt(0);
                            }
                        } else {
                            // Check if we have a graphics object and write that as a child first.
                            var count = (graphics || textContent) ? 1 : 0;
                            var children = displayObject._children;
                            if (children) {
                                count += children.length;
                            }
                            this.output.writeInt(count);
                            if (graphics) {
                                writer && writer.writeLn("Reference Graphics: " + graphics._id);
                                this.output.writeInt(134217728 /* Asset */ | graphics._id);
                            } else if (textContent) {
                                writer && writer.writeLn("Reference TextContent: " + textContent._id);
                                this.output.writeInt(134217728 /* Asset */ | textContent._id);
                            }

                            // Write all the display object children.
                            if (children) {
                                for (var i = 0; i < children.length; i++) {
                                    writer && writer.writeLn("Reference DisplayObject: " + children[i].debugName());
                                    this.output.writeInt(children[i]._id);

                                    // Make sure children with a clip depth are getting visited.
                                    if (children[i]._clipDepth >= 0) {
                                        children[i]._setFlags(134217728 /* DirtyClipDepth */);
                                    }
                                }
                            }
                        }
                        writer && writer.leave("}");
                    }
                    if (this.phase === 1 /* References */) {
                        displayObject._removeFlags(DisplayObjectFlags.Dirty);
                    }

                    // Visit remotable child objects that are not otherwise visited.
                    if (graphics) {
                        this.writeGraphics(graphics);
                    } else if (textContent) {
                        this.writeTextContent(textContent);
                    } else if (bitmap) {
                        if (bitmap.bitmapData) {
                            this.writeBitmapData(bitmap.bitmapData);
                        }
                    }
                };

                PlayerChannelSerializer.prototype.writeDrawToBitmap = function (bitmapData, source, matrix, colorTransform, blendMode, clipRect, smoothing) {
                    if (typeof matrix === "undefined") { matrix = null; }
                    if (typeof colorTransform === "undefined") { colorTransform = null; }
                    if (typeof blendMode === "undefined") { blendMode = null; }
                    if (typeof clipRect === "undefined") { clipRect = null; }
                    if (typeof smoothing === "undefined") { smoothing = false; }
                    this.output.writeInt(201 /* DrawToBitmap */);
                    this.output.writeInt(bitmapData._id);
                    if (BitmapData.isType(source)) {
                        this.output.writeInt(134217728 /* Asset */ | source._id);
                    } else {
                        this.output.writeInt(source._id);
                    }

                    var hasBits = 0;
                    hasBits |= matrix ? 1 /* HasMatrix */ : 0;
                    hasBits |= colorTransform ? 8 /* HasColorTransform */ : 0;
                    hasBits |= clipRect ? 16 /* HasClipRect */ : 0;

                    this.output.writeInt(hasBits);
                    if (matrix) {
                        this.writeMatrix(matrix);
                    }
                    if (colorTransform) {
                        this.writeColorTransform(colorTransform);
                    }
                    if (clipRect) {
                        this.writeRectangle(Bounds.FromRectangle(clipRect));
                    }
                    this.output.writeInt(BlendMode.toNumber(blendMode));
                    this.output.writeBoolean(smoothing);
                };

                PlayerChannelSerializer.prototype.writeMatrix = function (matrix) {
                    var output = this.output;
                    output.writeFloat(matrix.a);
                    output.writeFloat(matrix.b);
                    output.writeFloat(matrix.c);
                    output.writeFloat(matrix.d);
                    output.writeFloat(matrix.tx);
                    output.writeFloat(matrix.ty);
                };

                PlayerChannelSerializer.prototype.writeRectangle = function (bounds) {
                    var output = this.output;

                    // TODO: check if we should write bounds instead. Depends on what's more useful in GFX-land.
                    output.writeInt(bounds.xMin);
                    output.writeInt(bounds.yMin);
                    output.writeInt(bounds.width);
                    output.writeInt(bounds.height);
                };

                PlayerChannelSerializer.prototype.writeColorTransform = function (colorTransform) {
                    var output = this.output;
                    var rM = colorTransform.redMultiplier;
                    var gM = colorTransform.greenMultiplier;
                    var bM = colorTransform.blueMultiplier;
                    var aM = colorTransform.alphaMultiplier;
                    var rO = colorTransform.redOffset;
                    var gO = colorTransform.greenOffset;
                    var bO = colorTransform.blueOffset;
                    var aO = colorTransform.alphaOffset;

                    var identityOffset = rO === gO && gO === bO && bO === aO && aO === 0;
                    var identityColorMultiplier = rM === gM && gM === bM && bM === 1;

                    if (identityOffset && identityColorMultiplier) {
                        if (aM === 1) {
                            output.writeInt(0 /* Identity */);
                        } else {
                            output.writeInt(1 /* AlphaMultiplierOnly */);
                            output.writeFloat(aM);
                        }
                    } else {
                        output.writeInt(2 /* All */);
                        output.writeFloat(rM);
                        output.writeFloat(gM);
                        output.writeFloat(bM);
                        output.writeFloat(aM);
                        output.writeInt(rO);
                        output.writeInt(gO);
                        output.writeInt(bO);
                        output.writeInt(aO);
                    }
                };

                PlayerChannelSerializer.prototype.pushAsset = function (asset) {
                    this.output.writeInt(this.outputAssets.length);
                    this.outputAssets.push(asset);
                };
                return PlayerChannelSerializer;
            })();
            Player.PlayerChannelSerializer = PlayerChannelSerializer;

            (function (EventKind) {
                EventKind[EventKind["Focus"] = 0] = "Focus";
                EventKind[EventKind["Mouse"] = 1] = "Mouse";
                EventKind[EventKind["Keyboard"] = 2] = "Keyboard";
            })(Player.EventKind || (Player.EventKind = {}));
            var EventKind = Player.EventKind;

            var PlayerChannelDeserializer = (function () {
                function PlayerChannelDeserializer() {
                }
                PlayerChannelDeserializer.prototype.readEvent = function () {
                    var input = this.input;
                    var tag = input.readInt();
                    switch (tag) {
                        case 300 /* MouseEvent */:
                            return this._readMouseEvent();
                        case 301 /* KeyboardEvent */:
                            return this._readKeyboardEvent();
                        case 302 /* FocusEvent */:
                            return this._readFocusEvent();
                    }
                    release || assert(false, 'Unknown MessageReader tag: ' + tag);
                };

                PlayerChannelDeserializer.prototype._readFocusEvent = function () {
                    var input = this.input;
                    var typeId = input.readInt();
                    return {
                        kind: 0 /* Focus */,
                        type: typeId
                    };
                };

                PlayerChannelDeserializer.prototype._readMouseEvent = function () {
                    var input = this.input;
                    var typeId = input.readInt();
                    var type = Shumway.Remoting.MouseEventNames[typeId];
                    var pX = input.readFloat();
                    var pY = input.readFloat();
                    var buttons = input.readInt();
                    var flags = input.readInt();
                    return {
                        kind: 1 /* Mouse */,
                        type: type,
                        point: new Point(pX, pY),
                        ctrlKey: !!(flags & 1 /* CtrlKey */),
                        altKey: !!(flags & 2 /* AltKey */),
                        shiftKey: !!(flags & 4 /* ShiftKey */),
                        buttons: buttons
                    };
                };

                PlayerChannelDeserializer.prototype._readKeyboardEvent = function () {
                    var input = this.input;
                    var typeId = input.readInt();
                    var type = Shumway.Remoting.KeyboardEventNames[typeId];
                    var keyCode = input.readInt();
                    var charCode = input.readInt();
                    var location = input.readInt();
                    var flags = input.readInt();
                    return {
                        kind: 2 /* Keyboard */,
                        type: type,
                        keyCode: keyCode,
                        charCode: charCode,
                        location: location,
                        ctrlKey: !!(flags & 1 /* CtrlKey */),
                        altKey: !!(flags & 2 /* AltKey */),
                        shiftKey: !!(flags & 4 /* ShiftKey */)
                    };
                };
                return PlayerChannelDeserializer;
            })();
            Player.PlayerChannelDeserializer = PlayerChannelDeserializer;
        })(Remoting.Player || (Remoting.Player = {}));
        var Player = Remoting.Player;
    })(Shumway.Remoting || (Shumway.Remoting = {}));
    var Remoting = Shumway.Remoting;
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
    (function (_Player) {
        var assert = Shumway.Debug.assert;
        var flash = Shumway.AVM2.AS.flash;

        var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
        var AVM2 = Shumway.AVM2.Runtime.AVM2;
        var avm1lib = Shumway.AVM2.AS.avm1lib;

        var Event = Shumway.AVM2.AS.flash.events.Event;
        var DisplayObject = Shumway.AVM2.AS.flash.display.DisplayObject;

        var EventDispatcher = Shumway.AVM2.AS.flash.events.EventDispatcher;

        var Loader = Shumway.AVM2.AS.flash.display.Loader;

        var MouseEventDispatcher = Shumway.AVM2.AS.flash.ui.MouseEventDispatcher;

        var KeyboardEventDispatcher = Shumway.AVM2.AS.flash.ui.KeyboardEventDispatcher;

        /**
        * Shumway Player
        *
        * This class brings everything together. Load the swf, runs the event loop and
        * synchronizes the frame tree with the display list.
        */
        var Player = (function () {
            function Player() {
                this._framesPlayed = 0;
                this.externalCallback = null;
                /**
                * Time since the last time we've synchronized the display list.
                */
                this._lastPumpTime = 0;
                /**
                * Page Visibility API visible state.
                */
                this._isPageVisible = true;
                /**
                * Page focus state.
                */
                this._hasFocus = true;
                this._keyboardEventDispatcher = new KeyboardEventDispatcher();
                this._mouseEventDispatcher = new MouseEventDispatcher();

                AVM2.instance.globals['Shumway.Player.Utils'] = this;
            }
            /**
            * Abstract method to notify about updates.
            * @param updates
            * @param assets
            */
            Player.prototype.onSendUpdates = function (updates, assets, async) {
                if (typeof async === "undefined") { async = true; }
                throw new Error('This method is abstract');
                return null;
            };

            /**
            * Whether we can get away with rendering at a lower rate.
            */
            Player.prototype._shouldThrottleDownRendering = function () {
                return !this._isPageVisible;
            };

            /**
            * Whether we can get away with executing frames at a lower rate.
            */
            Player.prototype._shouldThrottleDownFrameExecution = function () {
                return !this._isPageVisible;
            };

            Player.prototype.load = function (url) {
                release || assert(!this._loader, "Can't load twice.");
                var self = this;
                var stage = this._stage = new flash.display.Stage();
                var loader = this._loader = flash.display.Loader.getRootLoader();
                var loaderInfo = this._loaderInfo = loader.contentLoaderInfo;

                if (Shumway.playAllSymbolsOption.value) {
                    this._playAllSymbols();
                    loaderInfo._allowCodeExecution = false;
                } else {
                    var startPromise = loader._startPromise;
                    startPromise.then(function () {
                        if (loaderInfo.actionScriptVersion === flash.display.ActionScriptVersion.ACTIONSCRIPT2) {
                            var AS2Key = avm1lib.AS2Key;
                            var AS2Mouse = avm1lib.AS2Mouse;
                            AS2Key.asCallPublicProperty('__bind', [stage]);
                            AS2Mouse.asCallPublicProperty('__bind', [stage]);
                            var avm1Context = loaderInfo._avm1Context;
                            stage.addEventListener('frameConstructed', avm1Context.flushPendingScripts.bind(avm1Context), false, Number.MAX_VALUE);
                        }

                        var root = loader.content;
                        stage._loaderInfo = loaderInfo;
                        stage.frameRate = loaderInfo.frameRate;
                        stage.stageWidth = loaderInfo.width;
                        stage.stageHeight = loaderInfo.height;
                        stage.color = Shumway.ColorUtilities.RGBAToARGB(loaderInfo._colorRGBA);
                        stage.addChildAtDepth(root, 0);
                        self._enterLoops();
                    });
                }
                this._loader.load(new flash.net.URLRequest(url));
            };

            Player.prototype.processEventUpdates = function (updates) {
                var deserializer = new Shumway.Remoting.Player.PlayerChannelDeserializer();
                var EventKind = Shumway.Remoting.Player.EventKind;
                var FocusEventType = Shumway.Remoting.FocusEventType;

                deserializer.input = updates;

                var event = deserializer.readEvent();
                switch ((event.kind)) {
                    case 2 /* Keyboard */:
                        // If the stage doesn't have a focus then dispatch events on the stage
                        // directly.
                        var target = this._stage.focus ? this._stage.focus : this._stage;
                        this._keyboardEventDispatcher.target = target;
                        this._keyboardEventDispatcher.dispatchKeyboardEvent(event);
                        break;
                    case 1 /* Mouse */:
                        this._mouseEventDispatcher.stage = this._stage;
                        this._mouseEventDispatcher.handleMouseEvent(event);
                        break;
                    case 0 /* Focus */:
                        var focusType = event.type;
                        switch (focusType) {
                            case 0 /* DocumentHidden */:
                                this._isPageVisible = false;
                                break;
                            case 1 /* DocumentVisible */:
                                this._isPageVisible = true;
                                break;
                            case 2 /* WindowBlur */:
                                // TODO: This is purposely disabled so that applications don't pause when they are out of
                                // focus while the debugging window is open.
                                // EventDispatcher.broadcastEventDispatchQueue.dispatchEvent(Event.getBroadcastInstance(Event.DEACTIVATE));
                                this._hasFocus = false;
                                break;
                            case 3 /* WindowFocus */:
                                EventDispatcher.broadcastEventDispatchQueue.dispatchEvent(Event.getBroadcastInstance(Event.ACTIVATE));
                                this._hasFocus = true;
                                break;
                        }
                        break;
                }
            };

            Player.prototype._enterLoops = function () {
                this._enterEventLoop();
            };

            Player.prototype._pumpDisplayListUpdates = function () {
                this.syncDisplayObject(this._stage);
            };

            Player.prototype.syncDisplayObject = function (displayObject, async) {
                if (typeof async === "undefined") { async = true; }
                var updates = new DataBuffer();
                var assets = [];
                var serializer = new Shumway.Remoting.Player.PlayerChannelSerializer();
                serializer.output = updates;
                serializer.outputAssets = assets;

                if (flash.display.Stage.isType(displayObject)) {
                    serializer.writeStage(displayObject);
                }

                serializer.phase = 0 /* Objects */;
                _Player.enterTimeline("remoting objects");
                serializer.writeDisplayObject(displayObject);
                _Player.leaveTimeline("remoting objects");

                serializer.phase = 1 /* References */;
                _Player.enterTimeline("remoting references");
                serializer.writeDisplayObject(displayObject);
                _Player.leaveTimeline("remoting references");

                updates.writeInt(0 /* EOF */);

                _Player.enterTimeline("remoting assets");
                var output = this.onSendUpdates(updates, assets, async);
                _Player.leaveTimeline("remoting assets");

                return output;
            };

            Player.prototype.registerFont = function (font) {
                var updates = new DataBuffer();
                var assets = [];
                var serializer = new Shumway.Remoting.Player.PlayerChannelSerializer();
                serializer.output = updates;
                serializer.outputAssets = assets;
                serializer.writeFont(font);
                this.onSendUpdates(updates, assets);
            };

            Player.prototype.drawToBitmap = function (bitmapData, source, matrix, colorTransform, blendMode, clipRect, smoothing) {
                if (typeof matrix === "undefined") { matrix = null; }
                if (typeof colorTransform === "undefined") { colorTransform = null; }
                if (typeof blendMode === "undefined") { blendMode = null; }
                if (typeof clipRect === "undefined") { clipRect = null; }
                if (typeof smoothing === "undefined") { smoothing = false; }
                var updates = new DataBuffer();
                var assets = [];
                var serializer = new Shumway.Remoting.Player.PlayerChannelSerializer();
                serializer.output = updates;
                serializer.outputAssets = assets;

                serializer.writeBitmapData(bitmapData);

                if (flash.display.BitmapData.isType(source)) {
                    serializer.writeBitmapData(source);
                } else {
                    var displayObject = source;

                    serializer.phase = 0 /* Objects */;
                    _Player.enterTimeline("drawToBitmap");
                    serializer.writeDisplayObject(displayObject);
                    _Player.leaveTimeline("drawToBitmap");

                    serializer.phase = 1 /* References */;
                    _Player.enterTimeline("drawToBitmap 2");
                    serializer.writeDisplayObject(displayObject);
                    _Player.leaveTimeline("drawToBitmap 2");
                }

                serializer.writeDrawToBitmap(bitmapData, source, matrix, colorTransform, blendMode, clipRect, smoothing);

                updates.writeInt(0 /* EOF */);

                _Player.enterTimeline("sendUpdates");
                this.onSendUpdates(updates, assets);
                _Player.leaveTimeline("sendUpdates");
            };

            Player.prototype.requestRendering = function () {
                this._pumpDisplayListUpdates();
            };

            /**
            * Update the frame container with the latest changes from the display list.
            */
            Player.prototype._pumpUpdates = function () {
                if (!Shumway.dontSkipFramesOption.value) {
                    if (this._shouldThrottleDownRendering()) {
                        return;
                    }
                    var timeSinceLastPump = performance.now() - this._lastPumpTime;
                    if (timeSinceLastPump < (1000 / Shumway.pumpRateOption.value)) {
                        return;
                    }
                }
                _Player.enterTimeline("pump");
                if (Shumway.pumpEnabledOption.value) {
                    this._pumpDisplayListUpdates();
                    this._lastPumpTime = performance.now();
                }
                _Player.leaveTimeline("pump");
            };

            Player.prototype._leaveSyncLoop = function () {
                release || assert(this._frameTimeout > -1);
                clearInterval(this._frameTimeout);
            };

            Player.prototype._enterEventLoop = function () {
                var self = this;
                var stage = this._stage;
                var rootInitialized = false;
                var runFrameScripts = !Shumway.playAllSymbolsOption.value;
                var dontSkipFrames = Shumway.dontSkipFramesOption.value;
                (function tick() {
                    // TODO: change this to the mode described in http://www.craftymind.com/2008/04/18/updated-elastic-racetrack-for-flash-9-and-avm2/
                    self._frameTimeout = setTimeout(tick, 1000 / Shumway.frameRateOption.value);
                    if (!dontSkipFrames && (!Shumway.frameEnabledOption.value && runFrameScripts || self._shouldThrottleDownFrameExecution())) {
                        return;
                    }
                    stage.scaleX = stage.scaleY = Shumway.stageScaleOption.value;
                    for (var i = 0; i < Shumway.frameRateMultiplierOption.value; i++) {
                        _Player.enterTimeline("eventLoop");
                        var start = performance.now();
                        DisplayObject.performFrameNavigation(stage, true, runFrameScripts);
                        _Player.counter.count("performFrameNavigation", 1, performance.now() - start);
                        self._framesPlayed++;
                        if (Shumway.traceCountersOption.value > 0 && (self._framesPlayed % Shumway.traceCountersOption.value === 0)) {
                            self._traceCounters();
                        }
                        Loader.progress();
                        _Player.leaveTimeline("eventLoop");
                    }
                    if (rootInitialized) {
                        stage.render();
                    } else {
                        rootInitialized = true;
                    }
                    self._pumpUpdates();
                    self.onFrameProcessed();
                })();
            };

            Player.prototype._traceCounters = function () {
                console.info(Shumway.AVM2.counter.toStringSorted());
                Shumway.AVM2.counter.clear();

                console.info(Shumway.Player.counter.toStringSorted());
                Shumway.Player.counter.clear();

                console.info("advancableInstances: " + flash.display.DisplayObject._advancableInstances.length);
            };

            Player.prototype._leaveEventLoop = function () {
                release || assert(this._frameTimeout > -1);
                clearInterval(this._frameTimeout);
                this._frameTimeout = -1;
            };

            Player.prototype._playAllSymbols = function () {
                var stage = this._stage;
                var loader = this._loader;
                var loaderInfo = this._loaderInfo;
                var self = this;

                loaderInfo.addEventListener(flash.events.ProgressEvent.PROGRESS, function onProgress() {
                    var root = loader.content;
                    if (!root) {
                        return;
                    }
                    loaderInfo.removeEventListener(flash.events.ProgressEvent.PROGRESS, onProgress);
                    self._enterLoops();
                });

                loaderInfo.addEventListener(flash.events.Event.COMPLETE, function onProgress() {
                    stage.stageWidth = 1024;
                    stage.stageHeight = 1024;

                    var symbols = [];
                    loaderInfo._dictionary.forEach(function (symbol, key) {
                        if (symbol instanceof Shumway.Timeline.DisplaySymbol) {
                            symbols.push(symbol);
                        }
                    });

                    function show(symbol) {
                        flash.display.DisplayObject.reset();
                        flash.display.MovieClip.reset();
                        var symbolInstance = symbol.symbolClass.initializeFrom(symbol);
                        symbol.symbolClass.instanceConstructorNoInitialize.call(symbolInstance);
                        if (symbol instanceof Shumway.Timeline.BitmapSymbol) {
                            symbolInstance = new flash.display.Bitmap(symbolInstance);
                        }
                        while (stage.numChildren > 0) {
                            stage.removeChildAt(0);
                        }
                        stage.addChild(symbolInstance);
                    }

                    var nextSymbolIndex = 0;
                    function showNextSymbol() {
                        var symbol;
                        if (Shumway.playSymbolOption.value > 0) {
                            symbol = loaderInfo.getSymbolById(Shumway.playSymbolOption.value);
                            if (symbol instanceof Shumway.Timeline.DisplaySymbol) {
                            } else {
                                symbol = null;
                            }
                        } else {
                            symbol = symbols[nextSymbolIndex++];
                            if (nextSymbolIndex === symbols.length) {
                                nextSymbolIndex = 0;
                            }
                            if (Shumway.playSymbolCountOption.value >= 0 && nextSymbolIndex > Shumway.playSymbolCountOption.value) {
                                nextSymbolIndex = 0;
                            }
                        }
                        var frames = 1;
                        if (symbol && symbol.id > 0) {
                            show(symbol);
                            if (symbol instanceof Shumway.Timeline.SpriteSymbol) {
                                frames = symbol.numFrames;
                            }
                        }
                        if (Shumway.playSymbolFrameDurationOption.value > 0) {
                            frames = Shumway.playSymbolFrameDurationOption.value;
                        }
                        setTimeout(showNextSymbol, (1000 / Shumway.frameRateOption.value) * frames);
                    }
                    setTimeout(showNextSymbol, 1000 / Shumway.frameRateOption.value);
                });
            };

            Player.prototype.processExternalCallback = function (request) {
                if (!this.externalCallback) {
                    return;
                }

                try  {
                    request.result = this.externalCallback(request.functionName, request.args);
                } catch (e) {
                    request.error = e.message;
                }
            };

            Player.prototype.onExternalCommand = function (command) {
                throw new Error('This method is abstract');
            };

            Player.prototype.onFrameProcessed = function () {
                throw new Error('This method is abstract');
            };

            Player.prototype.createExternalInterfaceService = function () {
                var isEnabled;
                var player = this;
                return {
                    get enabled() {
                        if (isEnabled === undefined) {
                            var cmd = { action: 'isEnabled' };
                            player.onExternalCommand(cmd);
                            isEnabled = cmd.result;
                        }
                        return isEnabled;
                    },
                    initJS: function (callback) {
                        player.externalCallback = callback;
                        var cmd = { action: 'initJS' };
                        player.onExternalCommand(cmd);
                    },
                    registerCallback: function (functionName) {
                        var cmd = { action: 'register', functionName: functionName, remove: false };
                        player.onExternalCommand(cmd);
                    },
                    unregisterCallback: function (functionName) {
                        var cmd = { action: 'register', functionName: functionName, remove: true };
                        player.onExternalCommand(cmd);
                    },
                    eval: function (expression) {
                        var cmd = { action: 'eval', expression: expression };
                        player.onExternalCommand(cmd);
                        return cmd.result;
                    },
                    call: function (request) {
                        var cmd = { action: 'call', request: request };
                        player.onExternalCommand(cmd);
                        return cmd.result;
                    },
                    getId: function () {
                        var cmd = { action: 'getId' };
                        player.onExternalCommand(cmd);
                        return cmd.result;
                    }
                };
            };
            Player._syncFrameRate = 60;
            return Player;
        })();
        _Player.Player = Player;
    })(Shumway.Player || (Shumway.Player = {}));
    var Player = Shumway.Player;
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
    var BinaryFileReader = Shumway.BinaryFileReader;
    var AbcFile = Shumway.AVM2.ABC.AbcFile;
    var AVM2 = Shumway.AVM2.Runtime.AVM2;
    var assert = Shumway.Debug.assert;

    function createAVM2(builtinPath, libraryPath, avm1Path, sysMode, appMode, next) {
        function loadAVM1(next) {
            new BinaryFileReader(avm1Path).readAll(null, function (buffer) {
                avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), avm1Path));
                next();
            });
        }

        var avm2;
        release || assert(builtinPath);
        new BinaryFileReader(builtinPath).readAll(null, function (buffer) {
            AVM2.initialize(sysMode, appMode, avm1Path ? loadAVM1 : null);
            avm2 = AVM2.instance;
            Shumway.AVM2.AS.linkNatives(avm2);
            console.time("Execute builtin.abc");

            // Avoid loading more Abcs while the builtins are loaded
            avm2.builtinsLoaded = false;

            // avm2.systemDomain.onMessage.register('classCreated', Stubs.onClassCreated);
            avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
            avm2.builtinsLoaded = true;
            console.timeEnd("Execute builtin.abc");

            // If library is shell.abc, then just go ahead and run it now since
            // it's not worth doing it lazily given that it is so small.
            if (typeof libraryPath === 'string') {
                new BinaryFileReader(libraryPath).readAll(null, function (buffer) {
                    avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), libraryPath));
                    next(avm2);
                });
                return;
            }

            var libraryPathInfo = libraryPath;
            if (!AVM2.isPlayerglobalLoaded()) {
                AVM2.loadPlayerglobal(libraryPathInfo.abcs, libraryPathInfo.catalog).then(function () {
                    next(avm2);
                });
            }
        });
    }
    Shumway.createAVM2 = createAVM2;
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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    (function (_Player) {
        (function (Window) {
            var Player = Shumway.Player.Player;
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;

            var WindowPlayer = (function (_super) {
                __extends(WindowPlayer, _super);
                function WindowPlayer(window, parent) {
                    _super.call(this);
                    this._window = window;
                    this._parent = parent || window.parent;
                    this._window.addEventListener('message', function (e) {
                        this.onWindowMessage(e.data);
                    }.bind(this));
                    //this._window.addEventListener('syncmessage', function (e) {
                    //  this.onWindowMessage(e.detail);
                    //}.bind(this));
                }
                WindowPlayer.prototype.onSendUpdates = function (updates, assets, async) {
                    if (typeof async === "undefined") { async = true; }
                    var bytes = updates.getBytes();
                    var message = {
                        type: 'player',
                        updates: bytes,
                        assets: assets,
                        result: undefined
                    };
                    var transferList = [bytes.buffer];
                    if (!async) {
                        // TODO var result = this._parent.postSyncMessage(message, '*', transferList);
                        var event = this._parent.document.createEvent('CustomEvent');
                        event.initCustomEvent('syncmessage', false, false, message);
                        this._parent.dispatchEvent(event);
                        var result = message.result;
                        return DataBuffer.FromPlainObject(result);
                    }
                    this._parent.postMessage(message, '*', transferList);
                    return null;
                };

                WindowPlayer.prototype.onExternalCommand = function (command) {
                    var event = this._parent.document.createEvent('CustomEvent');
                    event.initCustomEvent('syncmessage', false, false, {
                        type: 'external',
                        request: command
                    });
                    this._parent.dispatchEvent(event);
                };

                WindowPlayer.prototype.onFrameProcessed = function () {
                    this._parent.postMessage({
                        type: 'frame'
                    }, '*');
                };

                WindowPlayer.prototype.onWindowMessage = function (data) {
                    if (typeof data === 'object' && data !== null) {
                        switch (data.type) {
                            case 'gfx':
                                var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
                                var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
                                this.processEventUpdates(updates);
                                break;
                            case 'externalCallback':
                                this.processExternalCallback(data.request);
                                break;
                            case 'options':
                                Shumway.Settings.setSettings(data.settings);
                                break;
                            case 'timeline':
                                switch (data.request) {
                                    case 'AVM2':
                                        if (data.cmd === 'clear') {
                                            Shumway.AVM2.timelineBuffer.reset();
                                            break;
                                        }
                                        this._parent.postMessage({
                                            type: 'timelineResponse',
                                            request: data.request,
                                            timeline: Shumway.AVM2.timelineBuffer
                                        }, '*');
                                        break;
                                    case 'Player':
                                        if (data.cmd === 'clear') {
                                            Shumway.Player.timelineBuffer.reset();
                                            break;
                                        }
                                        this._parent.postMessage({
                                            type: 'timelineResponse',
                                            request: data.request,
                                            timeline: Shumway.Player.timelineBuffer
                                        }, '*');
                                        break;
                                    case 'SWF':
                                        if (data.cmd === 'clear') {
                                            Shumway.SWF.timelineBuffer.reset();
                                            break;
                                        }
                                        this._parent.postMessage({
                                            type: 'timelineResponse',
                                            request: data.request,
                                            timeline: Shumway.SWF.timelineBuffer
                                        }, '*');
                                        break;
                                }
                                break;
                        }
                    }
                };
                return WindowPlayer;
            })(Player);
            Window.WindowPlayer = WindowPlayer;
        })(_Player.Window || (_Player.Window = {}));
        var Window = _Player.Window;
    })(Shumway.Player || (Shumway.Player = {}));
    var Player = Shumway.Player;
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
    (function (_Player) {
        (function (Test) {
            var Player = Shumway.Player.Player;
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;

            var TestPlayer = (function (_super) {
                __extends(TestPlayer, _super);
                function TestPlayer() {
                    _super.call(this);

                    // TODO this is temporary worker to test postMessage tranfers
                    this._worker = Shumway.Player.Test.FakeSyncWorker.instance;
                    this._worker.addEventListener('message', this._onWorkerMessage.bind(this));
                    //this._worker.addEventListener('syncmessage', this._onWorkerMessage.bind(this));
                }
                TestPlayer.prototype.onSendUpdates = function (updates, assets, async) {
                    if (typeof async === "undefined") { async = true; }
                    var bytes = updates.getBytes();
                    var message = {
                        type: 'player',
                        updates: bytes,
                        assets: assets
                    };
                    var transferList = [bytes.buffer];
                    if (!async) {
                        var result = this._worker.postSyncMessage(message, transferList);
                        return DataBuffer.FromPlainObject(result);
                    }
                    this._worker.postMessage(message, transferList);
                    return null;
                };

                TestPlayer.prototype.onExternalCommand = function (command) {
                    this._worker.postSyncMessage({
                        type: 'external',
                        command: command
                    });
                };

                TestPlayer.prototype.onFrameProcessed = function () {
                    this._worker.postMessage({
                        type: 'frame'
                    });
                };

                TestPlayer.prototype._onWorkerMessage = function (e) {
                    var data = e.data;
                    if (typeof data !== 'object' || data === null) {
                        return;
                    }
                    switch (data.type) {
                        case 'gfx':
                            var updates = DataBuffer.FromArrayBuffer(e.data.updates.buffer);
                            this.processEventUpdates(updates);
                            break;
                        case 'externalCallback':
                            this.processExternalCallback(data.request);
                            return;
                    }
                };
                return TestPlayer;
            })(Player);
            Test.TestPlayer = TestPlayer;
        })(_Player.Test || (_Player.Test = {}));
        var Test = _Player.Test;
    })(Shumway.Player || (Shumway.Player = {}));
    var Player = Shumway.Player;
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
    (function (Player) {
        (function (Test) {
            var FakeSyncWorker = (function () {
                function FakeSyncWorker() {
                    this._worker = new Worker(FakeSyncWorker.WORKER_PATH);
                    this._onsyncmessageListeners = [];
                }
                Object.defineProperty(FakeSyncWorker, "instance", {
                    get: function () {
                        if (!FakeSyncWorker._singelton) {
                            FakeSyncWorker._singelton = new FakeSyncWorker();
                        }
                        return FakeSyncWorker._singelton;
                    },
                    enumerable: true,
                    configurable: true
                });

                FakeSyncWorker.prototype.addEventListener = function (type, listener, useCapture) {
                    if (type !== 'syncmessage') {
                        this._worker.addEventListener(type, listener, useCapture);
                    } else {
                        this._onsyncmessageListeners.push(listener);
                    }
                };

                FakeSyncWorker.prototype.removeEventListener = function (type, listener, useCapture) {
                    if (type === 'syncmessage') {
                        var i = this._onsyncmessageListeners.indexOf(listener);
                        if (i >= 0) {
                            this._onsyncmessageListeners.splice(i, 1);
                        }
                        return;
                    }
                    this._worker.removeEventListener(type, listener, useCapture);
                };

                FakeSyncWorker.prototype.postMessage = function (message, ports) {
                    this._worker.postMessage(message, ports);
                };

                FakeSyncWorker.prototype.postSyncMessage = function (message, ports) {
                    var listener = this._onsyncmessageListeners[0];
                    if (listener) {
                        var ev = { data: message };
                        if (typeof listener === 'function') {
                            return listener(ev);
                        } else {
                            return listener.handleEvent(ev);
                        }
                    }
                };
                FakeSyncWorker.WORKER_PATH = '../../src/player/fakechannel.js';
                return FakeSyncWorker;
            })();
            Test.FakeSyncWorker = FakeSyncWorker;
        })(Player.Test || (Player.Test = {}));
        var Test = Player.Test;
    })(Shumway.Player || (Shumway.Player = {}));
    var Player = Shumway.Player;
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
/// <reference path='../../build/ts/base.d.ts' />
/// <reference path='../../build/ts/tools.d.ts' />
/// <reference path='../../build/ts/swf.d.ts' />
/// <reference path='../../build/ts/flash.d.ts' />
///<reference path='module.ts' />
///<reference path='options.ts' />
///<reference path='frameScheduler.ts' />
///<reference path='remotingPlayer.ts' />
///<reference path='player.ts' />
///<reference path='avmLoader.ts' />
///<reference path='window/windowPlayer.ts' />
///<reference path='test/testPlayer.ts' />
///<reference path='test/fakeSyncWorker.ts' />
//# sourceMappingURL=player.js.map
