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
    (function (GFX) {
        (function (TraceLevel) {
            TraceLevel[TraceLevel["None"] = 0] = "None";
            TraceLevel[TraceLevel["Brief"] = 1] = "Brief";
            TraceLevel[TraceLevel["Verbose"] = 2] = "Verbose";
        })(GFX.TraceLevel || (GFX.TraceLevel = {}));
        var TraceLevel = GFX.TraceLevel;

        var counter = Shumway.Metrics.Counter.instance;
        GFX.frameCounter = new Shumway.Metrics.Counter(true);

        GFX.traceLevel = 2 /* Verbose */;
        GFX.writer = null;

        function frameCount(name) {
            counter.count(name);
            GFX.frameCounter.count(name);
        }
        GFX.frameCount = frameCount;

        GFX.timelineBuffer = new Shumway.Tools.Profiler.TimelineBuffer("GFX");

        function enterTimeline(name, data) {
            profile && GFX.timelineBuffer && GFX.timelineBuffer.enter(name, data);
        }
        GFX.enterTimeline = enterTimeline;

        function leaveTimeline(name, data) {
            profile && GFX.timelineBuffer && GFX.timelineBuffer.leave(name, data);
        }
        GFX.leaveTimeline = leaveTimeline;

        if (typeof CanvasPattern !== "undefined") {
            /**
            * Polyfill for missing |setTransform| on CanvasPattern and CanvasGradient. Firefox implements |CanvasPattern| in nightly
            * but doesn't handle CanvasGradient yet.
            *
            * Otherwise you'll have to fall back on this polyfill that depends on yet another canvas feature that
            * is not implemented across all browsers, namely |Path2D.addPath|. You can get this working in Chrome
            * if you enable experimental canvas features in |chrome://flags/|. In Firefox you'll have to wait for
            * https://bugzilla.mozilla.org/show_bug.cgi?id=985801 to land.
            *
            * You shuold at least be able to get a build of Firefox or Chrome where setTransform works. Eventually,
            * we'll have to polyfill Path2D, we can work around the addPath limitation at that point.
            */
            if (!CanvasPattern.prototype.setTransform && !CanvasGradient.prototype.setTransform && Path2D.prototype.addPath) {
                CanvasPattern.prototype.setTransform = CanvasGradient.prototype.setTransform = function (matrix) {
                    this._transform = matrix;
                };

                var originalFill = CanvasRenderingContext2D.prototype.fill;

                /**
                * If the current fillStyle is a CanvasPattern that has a SVGMatrix transformed applied to it, we
                * first apply the pattern's transform to the current context and then draw the path with the
                * inverse fillStyle transform applied to it so that it is drawn in the expected original location.
                */
                CanvasRenderingContext2D.prototype.fill = (function fill(path, fillRule) {
                    if ((this.fillStyle instanceof CanvasPattern || this.fillStyle instanceof CanvasGradient) && this.fillStyle._transform && path instanceof Path2D) {
                        var m = this.fillStyle._transform;
                        var i = m.inverse();
                        this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
                        var transformedPath = new Path2D();
                        transformedPath.addPath(path, i);
                        originalFill.call(this, transformedPath, fillRule);
                        this.transform(i.a, i.b, i.c, i.d, i.e, i.f);
                        return;
                    }
                    if (arguments.length === 0) {
                        originalFill.call(this);
                    } else if (arguments.length === 1) {
                        originalFill.call(this, path);
                    } else if (arguments.length === 2) {
                        originalFill.call(this, path, fillRule);
                    }
                });
            }
        }
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
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
    var assert = Shumway.Debug.assert;

    

    /**
    * Maintains a LRU doubly-linked list.
    */
    var LRUList = (function () {
        function LRUList() {
            this._count = 0;
            this._head = this._tail = null;
        }
        Object.defineProperty(LRUList.prototype, "count", {
            get: function () {
                return this._count;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(LRUList.prototype, "head", {
            /**
            * Gets the node at the front of the list. Returns |null| if the list is empty.
            */
            get: function () {
                return this._head;
            },
            enumerable: true,
            configurable: true
        });

        LRUList.prototype._unshift = function (node) {
            release || assert(!node.next && !node.previous);
            if (this._count === 0) {
                this._head = this._tail = node;
            } else {
                node.next = this._head;
                node.next.previous = node;
                this._head = node;
            }
            this._count++;
        };

        LRUList.prototype._remove = function (node) {
            release || assert(this._count > 0);
            if (node === this._head && node === this._tail) {
                this._head = this._tail = null;
            } else if (node === this._head) {
                this._head = (node.next);
                this._head.previous = null;
            } else if (node == this._tail) {
                this._tail = (node.previous);
                this._tail.next = null;
            } else {
                node.previous.next = node.next;
                node.next.previous = node.previous;
            }
            node.previous = node.next = null;
            this._count--;
        };

        /**
        * Adds or moves a node to the front of the list.
        */
        LRUList.prototype.use = function (node) {
            if (this._head === node) {
                return;
            }
            if (node.next || node.previous || this._tail === node) {
                this._remove(node);
            }
            this._unshift(node);
        };

        /**
        * Removes a node from the front of the list.
        */
        LRUList.prototype.pop = function () {
            if (!this._tail) {
                return null;
            }
            var node = this._tail;
            this._remove(node);
            return node;
        };

        /**
        * Visits each node in the list in the forward or reverse direction as long as
        * the callback returns |true|;
        */
        LRUList.prototype.visit = function (callback, forward) {
            if (typeof forward === "undefined") { forward = true; }
            var node = (forward ? this._head : this._tail);
            while (node) {
                if (!callback(node)) {
                    break;
                }
                node = (forward ? node.next : node.previous);
            }
        };
        return LRUList;
    })();
    Shumway.LRUList = LRUList;
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
    (function (GFX) {
        var Option = Shumway.Options.Option;
        var OptionSet = Shumway.Options.OptionSet;

        var shumwayOptions = Shumway.Settings.shumwayOptions;

        var rendererOptions = shumwayOptions.register(new OptionSet("Renderer Options"));
        GFX.imageUpdateOption = rendererOptions.register(new Option("", "imageUpdate", "boolean", true, "Enable image conversion."));
        GFX.stageOptions = shumwayOptions.register(new OptionSet("Stage Renderer Options"));
        GFX.forcePaint = GFX.stageOptions.register(new Option("", "forcePaint", "boolean", false, "Force repainting."));
        GFX.ignoreViewport = GFX.stageOptions.register(new Option("", "ignoreViewport", "boolean", false, "Cull elements outside of the viewport."));
        GFX.viewportLoupeDiameter = GFX.stageOptions.register(new Option("", "viewportLoupeDiameter", "number", 512, "Size of the viewport loupe.", { range: { min: 1, max: 1024, step: 1 } }));
        GFX.disableClipping = GFX.stageOptions.register(new Option("", "disableClipping", "boolean", false, "Disable clipping."));
        GFX.debugClipping = GFX.stageOptions.register(new Option("", "debugClipping", "boolean", false, "Disable clipping."));

        GFX.backend = GFX.stageOptions.register(new Option("", "backend", "number", 0, "Backends", {
            choices: {
                Canvas2D: 0,
                WebGL: 1,
                Both: 2
            }
        }));

        var webGLOptions = GFX.stageOptions.register(new OptionSet("WebGL Options"));
        GFX.perspectiveCamera = webGLOptions.register(new Option("", "pc", "boolean", false, "Use perspective camera."));
        GFX.perspectiveCameraFOV = webGLOptions.register(new Option("", "pcFOV", "number", 60, "Perspective Camera FOV."));
        GFX.perspectiveCameraDistance = webGLOptions.register(new Option("", "pcDistance", "number", 2, "Perspective Camera Distance."));
        GFX.perspectiveCameraAngle = webGLOptions.register(new Option("", "pcAngle", "number", 0, "Perspective Camera Angle."));
        GFX.perspectiveCameraAngleRotate = webGLOptions.register(new Option("", "pcRotate", "boolean", false, "Rotate Use perspective camera."));
        GFX.perspectiveCameraSpacing = webGLOptions.register(new Option("", "pcSpacing", "number", 0.01, "Element Spacing."));
        GFX.perspectiveCameraSpacingInflate = webGLOptions.register(new Option("", "pcInflate", "boolean", false, "Rotate Use perspective camera."));

        GFX.drawTiles = webGLOptions.register(new Option("", "drawTiles", "boolean", false, "Draw WebGL Tiles"));

        GFX.drawSurfaces = webGLOptions.register(new Option("", "drawSurfaces", "boolean", false, "Draw WebGL Surfaces."));
        GFX.drawSurface = webGLOptions.register(new Option("", "drawSurface", "number", -1, "Draw WebGL Surface #"));
        GFX.drawElements = webGLOptions.register(new Option("", "drawElements", "boolean", true, "Actually call gl.drawElements. This is useful to test if the GPU is the bottleneck."));
        GFX.disableSurfaceUploads = webGLOptions.register(new Option("", "disableSurfaceUploads", "boolean", false, "Disable surface uploads."));

        GFX.premultipliedAlpha = webGLOptions.register(new Option("", "premultipliedAlpha", "boolean", false, "Set the premultipliedAlpha flag on getContext()."));
        GFX.unpackPremultiplyAlpha = webGLOptions.register(new Option("", "unpackPremultiplyAlpha", "boolean", true, "Use UNPACK_PREMULTIPLY_ALPHA_WEBGL in pixelStorei."));

        var factorChoices = {
            ZERO: 0,
            ONE: 1,
            SRC_COLOR: 768,
            ONE_MINUS_SRC_COLOR: 769,
            DST_COLOR: 774,
            ONE_MINUS_DST_COLOR: 775,
            SRC_ALPHA: 770,
            ONE_MINUS_SRC_ALPHA: 771,
            DST_ALPHA: 772,
            ONE_MINUS_DST_ALPHA: 773,
            SRC_ALPHA_SATURATE: 776,
            CONSTANT_COLOR: 32769,
            ONE_MINUS_CONSTANT_COLOR: 32770,
            CONSTANT_ALPHA: 32771,
            ONE_MINUS_CONSTANT_ALPHA: 32772
        };

        GFX.sourceBlendFactor = webGLOptions.register(new Option("", "sourceBlendFactor", "number", factorChoices.ONE, "", { choices: factorChoices }));
        GFX.destinationBlendFactor = webGLOptions.register(new Option("", "destinationBlendFactor", "number", factorChoices.ONE_MINUS_SRC_ALPHA, "", { choices: factorChoices }));

        var canvas2DOptions = GFX.stageOptions.register(new OptionSet("Canvas2D Options"));
        GFX.clipDirtyRegions = canvas2DOptions.register(new Option("", "clipDirtyRegions", "boolean", false, "Clip dirty regions."));
        GFX.clipCanvas = canvas2DOptions.register(new Option("", "clipCanvas", "boolean", false, "Clip Regions."));
        GFX.cull = canvas2DOptions.register(new Option("", "cull", "boolean", false, "Enable culling."));
        GFX.compositeMask = canvas2DOptions.register(new Option("", "compositeMask", "boolean", false, "Composite Mask."));

        GFX.snapToDevicePixels = canvas2DOptions.register(new Option("", "snapToDevicePixels", "boolean", false, ""));
        GFX.imageSmoothing = canvas2DOptions.register(new Option("", "imageSmoothing", "boolean", false, ""));
        GFX.blending = canvas2DOptions.register(new Option("", "blending", "boolean", true, ""));
        GFX.cacheShapes = canvas2DOptions.register(new Option("", "cacheShapes", "boolean", false, ""));
        GFX.cacheShapesMaxSize = canvas2DOptions.register(new Option("", "cacheShapesMaxSize", "number", 256, "", { range: { min: 1, max: 1024, step: 1 } }));
        GFX.cacheShapesThreshold = canvas2DOptions.register(new Option("", "cacheShapesThreshold", "number", 256, "", { range: { min: 1, max: 1024, step: 1 } }));
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
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
    (function (GFX) {
        (function (Geometry) {
            var clamp = Shumway.NumberUtilities.clamp;
            var pow2 = Shumway.NumberUtilities.pow2;
            var epsilonEquals = Shumway.NumberUtilities.epsilonEquals;
            var assert = Shumway.Debug.assert;

            function radianToDegrees(r) {
                return r * 180 / Math.PI;
            }
            Geometry.radianToDegrees = radianToDegrees;

            function degreesToRadian(d) {
                return d * Math.PI / 180;
            }
            Geometry.degreesToRadian = degreesToRadian;

            function quadraticBezier(from, cp, to, t) {
                var inverseT = 1 - t;
                return from * inverseT * inverseT + 2 * cp * inverseT * t + to * t * t;
            }
            Geometry.quadraticBezier = quadraticBezier;

            function quadraticBezierExtreme(from, cp, to) {
                var t = (from - cp) / (from - 2 * cp + to);
                if (t < 0) {
                    return from;
                }
                if (t > 1) {
                    return to;
                }
                return quadraticBezier(from, cp, to, t);
            }
            Geometry.quadraticBezierExtreme = quadraticBezierExtreme;

            function cubicBezier(from, cp, cp2, to, t) {
                var tSq = t * t;
                var inverseT = 1 - t;
                var inverseTSq = inverseT * inverseT;
                return from * inverseT * inverseTSq + 3 * cp * t * inverseTSq + 3 * cp2 * inverseT * tSq + to * t * tSq;
            }
            Geometry.cubicBezier = cubicBezier;

            function cubicBezierExtremes(from, cp, cp2, to) {
                var d1 = cp - from;
                var d2 = cp2 - cp;

                // We only ever need d2 * 2
                d2 *= 2;
                var d3 = to - cp2;

                // Prevent division by zero by very slightly changing d3 if that would happen
                if (d1 + d3 === d2) {
                    d3 *= 1.0001;
                }
                var fHead = 2 * d1 - d2;
                var part1 = d2 - 2 * d1;
                var fCenter = Math.sqrt(part1 * part1 - 4 * d1 * (d1 - d2 + d3));
                var fTail = 2 * (d1 - d2 + d3);
                var t1 = (fHead + fCenter) / fTail;
                var t2 = (fHead - fCenter) / fTail;
                var result = [];
                if (t1 >= 0 && t1 <= 1) {
                    result.push(cubicBezier(from, cp, cp2, to, t1));
                }
                if (t2 >= 0 && t2 <= 1) {
                    result.push(cubicBezier(from, cp, cp2, to, t2));
                }
                return result;
            }
            Geometry.cubicBezierExtremes = cubicBezierExtremes;

            var E = 0.0001;

            function eqFloat(a, b) {
                return Math.abs(a - b) < E;
            }

            var Point = (function () {
                function Point(x, y) {
                    this.x = x;
                    this.y = y;
                }
                Point.prototype.setElements = function (x, y) {
                    this.x = x;
                    this.y = y;
                    return this;
                };

                Point.prototype.set = function (other) {
                    this.x = other.x;
                    this.y = other.y;
                    return this;
                };

                Point.prototype.dot = function (other) {
                    return this.x * other.x + this.y * other.y;
                };

                Point.prototype.squaredLength = function () {
                    return this.dot(this);
                };

                Point.prototype.distanceTo = function (other) {
                    return Math.sqrt(this.dot(other));
                };

                Point.prototype.sub = function (other) {
                    this.x -= other.x;
                    this.y -= other.y;
                    return this;
                };

                Point.prototype.mul = function (value) {
                    this.x *= value;
                    this.y *= value;
                    return this;
                };

                Point.prototype.clone = function () {
                    return new Point(this.x, this.y);
                };

                Point.prototype.toString = function () {
                    return "{x: " + this.x + ", y: " + this.y + "}";
                };

                Point.prototype.inTriangle = function (a, b, c) {
                    var s = a.y * c.x - a.x * c.y + (c.y - a.y) * this.x + (a.x - c.x) * this.y;
                    var t = a.x * b.y - a.y * b.x + (a.y - b.y) * this.x + (b.x - a.x) * this.y;
                    if ((s < 0) != (t < 0)) {
                        return false;
                    }
                    var T = -b.y * c.x + a.y * (c.x - b.x) + a.x * (b.y - c.y) + b.x * c.y;
                    if (T < 0.0) {
                        s = -s;
                        t = -t;
                        T = -T;
                    }
                    return s > 0 && t > 0 && (s + t) < T;
                };

                Point.createEmpty = function () {
                    return new Point(0, 0);
                };

                Point.createEmptyPoints = function (count) {
                    var result = [];
                    for (var i = 0; i < count; i++) {
                        result.push(new Point(0, 0));
                    }
                    return result;
                };
                return Point;
            })();
            Geometry.Point = Point;

            var Point3D = (function () {
                function Point3D(x, y, z) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
                }
                Point3D.prototype.setElements = function (x, y, z) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
                    return this;
                };

                Point3D.prototype.set = function (other) {
                    this.x = other.x;
                    this.y = other.y;
                    this.z = other.z;
                    return this;
                };

                Point3D.prototype.dot = function (other) {
                    return this.x * other.x + this.y * other.y + this.z * other.z;
                };

                Point3D.prototype.cross = function (other) {
                    var x = this.y * other.z - this.z * other.y;
                    var y = this.z * other.x - this.x * other.z;
                    var z = this.x * other.y - this.y * other.x;
                    this.x = x;
                    this.y = y;
                    this.z = z;
                    return this;
                };

                Point3D.prototype.squaredLength = function () {
                    return this.dot(this);
                };

                Point3D.prototype.sub = function (other) {
                    this.x -= other.x;
                    this.y -= other.y;
                    this.z -= other.z;
                    return this;
                };

                Point3D.prototype.mul = function (value) {
                    this.x *= value;
                    this.y *= value;
                    this.z *= value;
                    return this;
                };

                Point3D.prototype.normalize = function () {
                    var length = Math.sqrt(this.squaredLength());
                    if (length > 0.00001) {
                        this.mul(1 / length);
                    } else {
                        this.setElements(0, 0, 0);
                    }
                    return this;
                };

                Point3D.prototype.clone = function () {
                    return new Point3D(this.x, this.y, this.z);
                };

                Point3D.prototype.toString = function () {
                    return "{x: " + this.x + ", y: " + this.y + ", z: " + this.z + "}";
                };

                Point3D.createEmpty = function () {
                    return new Point3D(0, 0, 0);
                };

                Point3D.createEmptyPoints = function (count) {
                    var result = [];
                    for (var i = 0; i < count; i++) {
                        result.push(new Point3D(0, 0, 0));
                    }
                    return result;
                };
                return Point3D;
            })();
            Geometry.Point3D = Point3D;

            var Rectangle = (function () {
                function Rectangle(x, y, w, h) {
                    this.setElements(x, y, w, h);
                }
                Rectangle.prototype.setElements = function (x, y, w, h) {
                    this.x = x;
                    this.y = y;
                    this.w = w;
                    this.h = h;
                };

                Rectangle.prototype.set = function (other) {
                    this.x = other.x;
                    this.y = other.y;
                    this.w = other.w;
                    this.h = other.h;
                };

                Rectangle.prototype.contains = function (other) {
                    var r1 = other.x + other.w;
                    var b1 = other.y + other.h;
                    var r2 = this.x + this.w;
                    var b2 = this.y + this.h;
                    return (other.x >= this.x) && (other.x < r2) && (other.y >= this.y) && (other.y < b2) && (r1 > this.x) && (r1 <= r2) && (b1 > this.y) && (b1 <= b2);
                };

                Rectangle.prototype.containsPoint = function (point) {
                    return (point.x >= this.x) && (point.x < this.x + this.w) && (point.y >= this.y) && (point.y < this.y + this.h);
                };

                Rectangle.prototype.isContained = function (others) {
                    for (var i = 0; i < others.length; i++) {
                        if (others[i].contains(this)) {
                            return true;
                        }
                    }
                    return false;
                };

                Rectangle.prototype.isSmallerThan = function (other) {
                    return this.w < other.w && this.h < other.h;
                };

                Rectangle.prototype.isLargerThan = function (other) {
                    return this.w > other.w && this.h > other.h;
                };

                Rectangle.prototype.union = function (other) {
                    if (this.isEmpty()) {
                        this.set(other);
                        return;
                    }
                    var x = this.x, y = this.y;
                    if (this.x > other.x) {
                        x = other.x;
                    }
                    if (this.y > other.y) {
                        y = other.y;
                    }
                    var x0 = this.x + this.w;
                    if (x0 < other.x + other.w) {
                        x0 = other.x + other.w;
                    }
                    var y0 = this.y + this.h;
                    if (y0 < other.y + other.h) {
                        y0 = other.y + other.h;
                    }
                    this.x = x;
                    this.y = y;
                    this.w = x0 - x;
                    this.h = y0 - y;
                };

                Rectangle.prototype.isEmpty = function () {
                    return this.w <= 0 || this.h <= 0;
                };

                Rectangle.prototype.setEmpty = function () {
                    this.w = 0;
                    this.h = 0;
                };

                Rectangle.prototype.intersect = function (other) {
                    var result = Rectangle.createEmpty();
                    if (this.isEmpty() || other.isEmpty()) {
                        result.setEmpty();
                        return result;
                    }
                    result.x = Math.max(this.x, other.x);
                    result.y = Math.max(this.y, other.y);
                    result.w = Math.min(this.x + this.w, other.x + other.w) - result.x;
                    result.h = Math.min(this.y + this.h, other.y + other.h) - result.y;
                    if (result.isEmpty()) {
                        result.setEmpty();
                    }
                    this.set(result);
                };

                Rectangle.prototype.intersects = function (other) {
                    if (this.isEmpty() || other.isEmpty()) {
                        return false;
                    }
                    var x = Math.max(this.x, other.x);
                    var y = Math.max(this.y, other.y);
                    var w = Math.min(this.x + this.w, other.x + other.w) - x;
                    var h = Math.min(this.y + this.h, other.y + other.h) - y;
                    return !(w <= 0 || h <= 0);
                };

                /**
                * Tests if this rectangle intersects the AABB of the given rectangle.
                */
                Rectangle.prototype.intersectsTransformedAABB = function (other, matrix) {
                    var rectangle = Rectangle._temporary;
                    rectangle.set(other);
                    matrix.transformRectangleAABB(rectangle);
                    return this.intersects(rectangle);
                };

                Rectangle.prototype.intersectsTranslated = function (other, tx, ty) {
                    if (this.isEmpty() || other.isEmpty()) {
                        return false;
                    }
                    var x = Math.max(this.x, other.x + tx);
                    var y = Math.max(this.y, other.y + ty);
                    var w = Math.min(this.x + this.w, other.x + tx + other.w) - x;
                    var h = Math.min(this.y + this.h, other.y + ty + other.h) - y;
                    return !(w <= 0 || h <= 0);
                };

                Rectangle.prototype.area = function () {
                    return this.w * this.h;
                };

                Rectangle.prototype.clone = function () {
                    return new Rectangle(this.x, this.y, this.w, this.h);
                };

                Rectangle.prototype.copyFrom = function (source) {
                    this.x = source.x;
                    this.y = source.y;
                    this.w = source.w;
                    this.h = source.h;
                };

                /**
                * Snaps the rectangle to pixel boundaries. The computed rectangle covers
                * the original rectangle.
                */
                Rectangle.prototype.snap = function () {
                    var x1 = Math.ceil(this.x + this.w);
                    var y1 = Math.ceil(this.y + this.h);
                    this.x = Math.floor(this.x);
                    this.y = Math.floor(this.y);
                    this.w = x1 - this.x;
                    this.h = y1 - this.y;
                    return this;
                };

                Rectangle.prototype.scale = function (x, y) {
                    this.x *= x;
                    this.y *= y;
                    this.w *= x;
                    this.h *= y;
                    return this;
                };

                Rectangle.prototype.offset = function (x, y) {
                    this.x += x;
                    this.y += y;
                    return this;
                };

                Rectangle.prototype.resize = function (w, h) {
                    this.w += w;
                    this.h += h;
                    return this;
                };

                Rectangle.prototype.expand = function (w, h) {
                    this.offset(-w, -h).resize(2 * w, 2 * h);
                    return this;
                };

                Rectangle.prototype.getCenter = function () {
                    return new Point(this.x + this.w / 2, this.y + this.h / 2);
                };

                Rectangle.prototype.getAbsoluteBounds = function () {
                    return new Rectangle(0, 0, this.w, this.h);
                };

                Rectangle.prototype.toString = function () {
                    return "{" + this.x + ", " + this.y + ", " + this.w + ", " + this.h + "}";
                };

                Rectangle.createEmpty = function () {
                    return new Rectangle(0, 0, 0, 0);
                };

                Rectangle.createSquare = function (size) {
                    return new Rectangle(-size / 2, -size / 2, size, size);
                };

                /**
                * Creates the maximum rectangle representable by signed 16 bit integers.
                */
                Rectangle.createMaxI16 = function () {
                    return new Rectangle(Shumway.Numbers.MinI16, Shumway.Numbers.MinI16, 65535 /* MaxU16 */, 65535 /* MaxU16 */);
                };

                Rectangle.prototype.getCorners = function (points) {
                    points[0].x = this.x;
                    points[0].y = this.y;

                    points[1].x = this.x + this.w;
                    points[1].y = this.y;

                    points[2].x = this.x + this.w;
                    points[2].y = this.y + this.h;

                    points[3].x = this.x;
                    points[3].y = this.y + this.h;
                };
                Rectangle._temporary = Rectangle.createEmpty();
                return Rectangle;
            })();
            Geometry.Rectangle = Rectangle;

            var OBB = (function () {
                function OBB(corners) {
                    this.corners = corners.map(function (corner) {
                        return corner.clone();
                    });
                    this.axes = [
                        corners[1].clone().sub(corners[0]),
                        corners[3].clone().sub(corners[0])
                    ];
                    this.origins = [];
                    for (var i = 0; i < 2; i++) {
                        this.axes[i].mul(1 / this.axes[i].squaredLength());
                        this.origins.push(corners[0].dot(this.axes[i]));
                    }
                }
                OBB.prototype.getBounds = function () {
                    return OBB.getBounds(this.corners);
                };
                OBB.getBounds = function (points) {
                    var min = new Point(Number.MAX_VALUE, Number.MAX_VALUE);
                    var max = new Point(Number.MIN_VALUE, Number.MIN_VALUE);
                    for (var i = 0; i < 4; i++) {
                        var x = points[i].x, y = points[i].y;
                        min.x = Math.min(min.x, x);
                        min.y = Math.min(min.y, y);
                        max.x = Math.max(max.x, x);
                        max.y = Math.max(max.y, y);
                    }
                    return new Rectangle(min.x, min.y, max.x - min.x, max.y - min.y);
                };

                /**
                * http://www.flipcode.com/archives/2D_OBB_Intersection.shtml
                */
                OBB.prototype.intersects = function (other) {
                    return this.intersectsOneWay(other) && other.intersectsOneWay(this);
                };
                OBB.prototype.intersectsOneWay = function (other) {
                    for (var i = 0; i < 2; i++) {
                        for (var j = 0; j < 4; j++) {
                            var t = other.corners[j].dot(this.axes[i]);
                            var tMin, tMax;
                            if (j === 0) {
                                tMax = tMin = t;
                            } else {
                                if (t < tMin) {
                                    tMin = t;
                                } else if (t > tMax) {
                                    tMax = t;
                                }
                            }
                        }
                        if ((tMin > 1 + this.origins[i]) || (tMax < this.origins[i])) {
                            return false;
                        }
                    }
                    return true;
                };
                return OBB;
            })();
            Geometry.OBB = OBB;

            var Matrix = (function () {
                function Matrix(a, b, c, d, tx, ty) {
                    this.setElements(a, b, c, d, tx, ty);
                }
                Matrix.prototype.setElements = function (a, b, c, d, tx, ty) {
                    this.a = a;
                    this.b = b;
                    this.c = c;
                    this.d = d;
                    this.tx = tx;
                    this.ty = ty;
                };

                Matrix.prototype.set = function (other) {
                    this.a = other.a;
                    this.b = other.b;
                    this.c = other.c;
                    this.d = other.d;
                    this.tx = other.tx;
                    this.ty = other.ty;
                };

                /**
                * Whether the transformed query rectangle is empty after this transform is applied to it.
                */
                Matrix.prototype.emptyArea = function (query) {
                    // TODO: Work out the details here.
                    if (this.a === 0 || this.d === 0) {
                        return true;
                    }
                    return false;
                };

                /**
                * Whether the area of transformed query rectangle is infinite after this transform is applied to it.
                */
                Matrix.prototype.infiniteArea = function (query) {
                    // TODO: Work out the details here.
                    if (Math.abs(this.a) === Infinity || Math.abs(this.d) === Infinity) {
                        return true;
                    }
                    return false;
                };

                Matrix.prototype.isEqual = function (other) {
                    return this.a === other.a && this.b === other.b && this.c === other.c && this.d === other.d && this.tx === other.tx && this.ty === other.ty;
                };

                Matrix.prototype.clone = function () {
                    return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
                };

                Matrix.prototype.transform = function (a, b, c, d, tx, ty) {
                    var _a = this.a, _b = this.b, _c = this.c, _d = this.d, _tx = this.tx, _ty = this.ty;
                    this.a = _a * a + _c * b;
                    this.b = _b * a + _d * b;
                    this.c = _a * c + _c * d;
                    this.d = _b * c + _d * d;
                    this.tx = _a * tx + _c * ty + _tx;
                    this.ty = _b * tx + _d * ty + _ty;
                    return this;
                };

                Matrix.prototype.transformRectangle = function (rectangle, points) {
                    var a = this.a;
                    var b = this.b;
                    var c = this.c;
                    var d = this.d;
                    var tx = this.tx;
                    var ty = this.ty;

                    var x = rectangle.x;
                    var y = rectangle.y;
                    var w = rectangle.w;
                    var h = rectangle.h;

                    /*
                    
                    0---1
                    | / |
                    3---2
                    
                    */
                    points[0].x = a * x + c * y + tx;
                    points[0].y = b * x + d * y + ty;
                    points[1].x = a * (x + w) + c * y + tx;
                    points[1].y = b * (x + w) + d * y + ty;
                    points[2].x = a * (x + w) + c * (y + h) + tx;
                    points[2].y = b * (x + w) + d * (y + h) + ty;
                    points[3].x = a * x + c * (y + h) + tx;
                    points[3].y = b * x + d * (y + h) + ty;
                };

                Matrix.prototype.isTranslationOnly = function () {
                    if (this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1) {
                        return true;
                    } else if (epsilonEquals(this.a, 1) && epsilonEquals(this.b, 0) && epsilonEquals(this.c, 0) && epsilonEquals(this.d, 1)) {
                        return true;
                    }
                    return false;
                };

                Matrix.prototype.transformRectangleAABB = function (rectangle) {
                    var a = this.a;
                    var b = this.b;
                    var c = this.c;
                    var d = this.d;
                    var tx = this.tx;
                    var ty = this.ty;

                    var x = rectangle.x;
                    var y = rectangle.y;
                    var w = rectangle.w;
                    var h = rectangle.h;

                    /*
                    
                    0---1
                    | / |
                    3---2
                    
                    */
                    var x0 = a * x + c * y + tx;
                    var y0 = b * x + d * y + ty;

                    var x1 = a * (x + w) + c * y + tx;
                    var y1 = b * (x + w) + d * y + ty;

                    var x2 = a * (x + w) + c * (y + h) + tx;
                    var y2 = b * (x + w) + d * (y + h) + ty;

                    var x3 = a * x + c * (y + h) + tx;
                    var y3 = b * x + d * (y + h) + ty;

                    var tmp = 0;

                    // Manual Min/Max is a lot faster than calling Math.min/max
                    // X Min-Max
                    if (x0 > x1) {
                        tmp = x0;
                        x0 = x1;
                        x1 = tmp;
                    }
                    if (x2 > x3) {
                        tmp = x2;
                        x2 = x3;
                        x3 = tmp;
                    }

                    rectangle.x = x0 < x2 ? x0 : x2;
                    rectangle.w = (x1 > x3 ? x1 : x3) - rectangle.x;

                    // Y Min-Max
                    if (y0 > y1) {
                        tmp = y0;
                        y0 = y1;
                        y1 = tmp;
                    }
                    if (y2 > y3) {
                        tmp = y2;
                        y2 = y3;
                        y3 = tmp;
                    }

                    rectangle.y = y0 < y2 ? y0 : y2;
                    rectangle.h = (y1 > y3 ? y1 : y3) - rectangle.y;
                };

                Matrix.prototype.scale = function (x, y) {
                    this.a *= x;
                    this.b *= y;
                    this.c *= x;
                    this.d *= y;
                    this.tx *= x;
                    this.ty *= y;
                    return this;
                };

                Matrix.prototype.scaleClone = function (x, y) {
                    if (x === 1 && y === 1) {
                        return this;
                    }
                    return this.clone().scale(x, y);
                };

                Matrix.prototype.rotate = function (angle) {
                    var a = this.a, b = this.b, c = this.c, d = this.d, tx = this.tx, ty = this.ty;
                    var cos = Math.cos(angle);
                    var sin = Math.sin(angle);
                    this.a = cos * a - sin * b;
                    this.b = sin * a + cos * b;
                    this.c = cos * c - sin * d;
                    this.d = sin * c + cos * d;
                    this.tx = cos * tx - sin * ty;
                    this.ty = sin * tx + cos * ty;
                    return this;
                };

                Matrix.prototype.concat = function (other) {
                    var a = this.a * other.a;
                    var b = 0.0;
                    var c = 0.0;
                    var d = this.d * other.d;
                    var tx = this.tx * other.a + other.tx;
                    var ty = this.ty * other.d + other.ty;

                    if (this.b !== 0.0 || this.c !== 0.0 || other.b !== 0.0 || other.c !== 0.0) {
                        a += this.b * other.c;
                        d += this.c * other.b;
                        b += this.a * other.b + this.b * other.d;
                        c += this.c * other.a + this.d * other.c;
                        tx += this.ty * other.c;
                        ty += this.tx * other.b;
                    }

                    this.a = a;
                    this.b = b;
                    this.c = c;
                    this.d = d;
                    this.tx = tx;
                    this.ty = ty;
                };

                /**
                * this = other * this
                */
                Matrix.prototype.preMultiply = function (other) {
                    var a = other.a * this.a;
                    var b = 0.0;
                    var c = 0.0;
                    var d = other.d * this.d;
                    var tx = other.tx * this.a + this.tx;
                    var ty = other.ty * this.d + this.ty;

                    if (other.b !== 0.0 || other.c !== 0.0 || this.b !== 0.0 || this.c !== 0.0) {
                        a += other.b * this.c;
                        d += other.c * this.b;
                        b += other.a * this.b + other.b * this.d;
                        c += other.c * this.a + other.d * this.c;
                        tx += other.ty * this.c;
                        ty += other.tx * this.b;
                    }

                    this.a = a;
                    this.b = b;
                    this.c = c;
                    this.d = d;
                    this.tx = tx;
                    this.ty = ty;
                };

                Matrix.prototype.translate = function (x, y) {
                    this.tx += x;
                    this.ty += y;
                    return this;
                };

                Matrix.prototype.setIdentity = function () {
                    this.a = 1;
                    this.b = 0;
                    this.c = 0;
                    this.d = 1;
                    this.tx = 0;
                    this.ty = 0;
                };

                Matrix.prototype.isIdentity = function () {
                    return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1 && this.tx === 0 && this.ty === 0;
                };

                Matrix.prototype.transformPoint = function (point) {
                    var x = point.x;
                    var y = point.y;
                    point.x = this.a * x + this.c * y + this.tx;
                    point.y = this.b * x + this.d * y + this.ty;
                };

                Matrix.prototype.transformPoints = function (points) {
                    for (var i = 0; i < points.length; i++) {
                        this.transformPoint(points[i]);
                    }
                };

                Matrix.prototype.deltaTransformPoint = function (point) {
                    var x = point.x;
                    var y = point.y;
                    point.x = this.a * x + this.c * y;
                    point.y = this.b * x + this.d * y;
                };

                Matrix.prototype.inverse = function (result) {
                    var b = this.b;
                    var c = this.c;
                    var tx = this.tx;
                    var ty = this.ty;
                    if (b === 0 && c === 0) {
                        var a = result.a = 1 / this.a;
                        var d = result.d = 1 / this.d;
                        result.b = 0;
                        result.c = 0;
                        result.tx = -a * tx;
                        result.ty = -d * ty;
                    } else {
                        var a = this.a;
                        var d = this.d;
                        var determinant = a * d - b * c;
                        if (determinant === 0) {
                            result.setIdentity();
                            return;
                        }
                        determinant = 1 / determinant;
                        result.a = d * determinant;
                        b = result.b = -b * determinant;
                        c = result.c = -c * determinant;
                        d = result.d = a * determinant;
                        result.tx = -(result.a * tx + c * ty);
                        result.ty = -(b * tx + d * ty);
                    }
                    return;
                };

                Matrix.prototype.getTranslateX = function () {
                    return this.tx;
                };

                Matrix.prototype.getTranslateY = function () {
                    return this.tx;
                };

                Matrix.prototype.getScaleX = function () {
                    if (this.a === 1 && this.b === 0) {
                        return 1;
                    }
                    var result = Math.sqrt(this.a * this.a + this.b * this.b);
                    return this.a > 0 ? result : -result;
                };

                Matrix.prototype.getScaleY = function () {
                    if (this.c === 0 && this.d === 1) {
                        return 1;
                    }
                    var result = Math.sqrt(this.c * this.c + this.d * this.d);
                    return this.d > 0 ? result : -result;
                };

                Matrix.prototype.getAbsoluteScaleX = function () {
                    return Math.abs(this.getScaleX());
                };

                Matrix.prototype.getAbsoluteScaleY = function () {
                    return Math.abs(this.getScaleY());
                };

                Matrix.prototype.getRotation = function () {
                    return Math.atan(this.b / this.a) * 180 / Math.PI;
                };

                Matrix.prototype.isScaleOrRotation = function () {
                    return Math.abs(this.a * this.c + this.b * this.d) < 0.01;
                };

                Matrix.prototype.toString = function () {
                    return "{" + this.a + ", " + this.b + ", " + this.c + ", " + this.d + ", " + this.tx + ", " + this.ty + "}";
                };

                Matrix.prototype.toWebGLMatrix = function () {
                    return new Float32Array([
                        this.a, this.b, 0, this.c, this.d, 0, this.tx, this.ty, 1
                    ]);
                };

                Matrix.prototype.toCSSTransform = function () {
                    return "matrix(" + this.a + ", " + this.b + ", " + this.c + ", " + this.d + ", " + this.tx + ", " + this.ty + ")";
                };

                Matrix.createIdentity = function () {
                    return new Matrix(1, 0, 0, 1, 0, 0);
                };

                Matrix.prototype.toSVGMatrix = function () {
                    var matrix = Matrix._svg.createSVGMatrix();
                    matrix.a = this.a;
                    matrix.b = this.b;
                    matrix.c = this.c;
                    matrix.d = this.d;
                    matrix.e = this.tx;
                    matrix.f = this.ty;
                    return matrix;
                };

                Matrix.prototype.snap = function () {
                    if (this.isTranslationOnly()) {
                        this.a = 1;
                        this.b = 0;
                        this.c = 0;
                        this.d = 1;
                        this.tx = Math.round(this.tx);
                        this.ty = Math.round(this.ty);
                        return true;
                    }
                    return false;
                };
                Matrix._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

                Matrix.multiply = function (dst, src) {
                    dst.transform(src.a, src.b, src.c, src.d, src.tx, src.ty);
                };
                return Matrix;
            })();
            Geometry.Matrix = Matrix;

            /**
            * Some of the math from: http://games.greggman.com/game/webgl-3d-cameras/
            */
            var Matrix3D = (function () {
                function Matrix3D(m) {
                    this._m = new Float32Array(m);
                }
                Matrix3D.prototype.asWebGLMatrix = function () {
                    return this._m;
                };

                Matrix3D.createCameraLookAt = function (cameraPosition, target, up) {
                    var zAxis = cameraPosition.clone().sub(target).normalize();
                    var xAxis = up.clone().cross(zAxis).normalize();
                    var yAxis = zAxis.clone().cross(xAxis);
                    return new Matrix3D([
                        xAxis.x, xAxis.y, xAxis.z, 0,
                        yAxis.x, yAxis.y, yAxis.z, 0,
                        zAxis.x, zAxis.y, zAxis.z, 0,
                        cameraPosition.x,
                        cameraPosition.y,
                        cameraPosition.z,
                        1
                    ]);
                };

                Matrix3D.createLookAt = function (cameraPosition, target, up) {
                    var zAxis = cameraPosition.clone().sub(target).normalize();
                    var xAxis = up.clone().cross(zAxis).normalize();
                    var yAxis = zAxis.clone().cross(xAxis);
                    return new Matrix3D([
                        xAxis.x, yAxis.x, zAxis.x, 0,
                        yAxis.x, yAxis.y, zAxis.y, 0,
                        zAxis.x, yAxis.z, zAxis.z, 0,
                        -xAxis.dot(cameraPosition),
                        -yAxis.dot(cameraPosition),
                        -zAxis.dot(cameraPosition),
                        1
                    ]);
                };

                Matrix3D.prototype.mul = function (point) {
                    var v = [point.x, point.y, point.z, 0];
                    var m = this._m;
                    var d = [];
                    for (var i = 0; i < 4; i++) {
                        d[i] = 0.0;
                        var row = i * 4;
                        for (var j = 0; j < 4; j++) {
                            d[i] += m[row + j] * v[j];
                        }
                    }
                    return new Point3D(d[0], d[1], d[2]);
                };

                Matrix3D.create2DProjection = function (width, height, depth) {
                    // Note: This matrix flips the Y axis so 0 is at the top.
                    return new Matrix3D([
                        2 / width, 0, 0, 0,
                        0, -2 / height, 0, 0,
                        0, 0, 2 / depth, 0,
                        -1, 1, 0, 1
                    ]);
                };

                Matrix3D.createPerspective = function (fieldOfViewInRadians, aspectRatio, near, far) {
                    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
                    var rangeInverse = 1.0 / (near - far);
                    return new Matrix3D([
                        f / aspectRatio, 0, 0, 0,
                        0, f, 0, 0,
                        0, 0, (near + far) * rangeInverse, -1,
                        0, 0, near * far * rangeInverse * 2, 0
                    ]);
                };

                Matrix3D.createIdentity = function () {
                    return Matrix3D.createTranslation(0, 0, 0);
                };

                Matrix3D.createTranslation = function (tx, ty, tz) {
                    return new Matrix3D([
                        1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        tx, ty, tz, 1
                    ]);
                };

                Matrix3D.createXRotation = function (angleInRadians) {
                    var c = Math.cos(angleInRadians);
                    var s = Math.sin(angleInRadians);
                    return new Matrix3D([
                        1, 0, 0, 0,
                        0, c, s, 0,
                        0, -s, c, 0,
                        0, 0, 0, 1
                    ]);
                };

                Matrix3D.createYRotation = function (angleInRadians) {
                    var c = Math.cos(angleInRadians);
                    var s = Math.sin(angleInRadians);
                    return new Matrix3D([
                        c, 0, -s, 0,
                        0, 1, 0, 0,
                        s, 0, c, 0,
                        0, 0, 0, 1
                    ]);
                };

                Matrix3D.createZRotation = function (angleInRadians) {
                    var c = Math.cos(angleInRadians);
                    var s = Math.sin(angleInRadians);
                    return new Matrix3D([
                        c, s, 0, 0,
                        -s, c, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1
                    ]);
                };

                Matrix3D.createScale = function (sx, sy, sz) {
                    return new Matrix3D([
                        sx, 0, 0, 0,
                        0, sy, 0, 0,
                        0, 0, sz, 0,
                        0, 0, 0, 1
                    ]);
                };

                Matrix3D.createMultiply = function (a, b) {
                    var am = a._m;
                    var bm = b._m;
                    var a00 = am[0 * 4 + 0];
                    var a01 = am[0 * 4 + 1];
                    var a02 = am[0 * 4 + 2];
                    var a03 = am[0 * 4 + 3];
                    var a10 = am[1 * 4 + 0];
                    var a11 = am[1 * 4 + 1];
                    var a12 = am[1 * 4 + 2];
                    var a13 = am[1 * 4 + 3];
                    var a20 = am[2 * 4 + 0];
                    var a21 = am[2 * 4 + 1];
                    var a22 = am[2 * 4 + 2];
                    var a23 = am[2 * 4 + 3];
                    var a30 = am[3 * 4 + 0];
                    var a31 = am[3 * 4 + 1];
                    var a32 = am[3 * 4 + 2];
                    var a33 = am[3 * 4 + 3];
                    var b00 = bm[0 * 4 + 0];
                    var b01 = bm[0 * 4 + 1];
                    var b02 = bm[0 * 4 + 2];
                    var b03 = bm[0 * 4 + 3];
                    var b10 = bm[1 * 4 + 0];
                    var b11 = bm[1 * 4 + 1];
                    var b12 = bm[1 * 4 + 2];
                    var b13 = bm[1 * 4 + 3];
                    var b20 = bm[2 * 4 + 0];
                    var b21 = bm[2 * 4 + 1];
                    var b22 = bm[2 * 4 + 2];
                    var b23 = bm[2 * 4 + 3];
                    var b30 = bm[3 * 4 + 0];
                    var b31 = bm[3 * 4 + 1];
                    var b32 = bm[3 * 4 + 2];
                    var b33 = bm[3 * 4 + 3];
                    return new Matrix3D([
                        a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
                        a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
                        a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
                        a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
                        a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
                        a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
                        a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
                        a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
                        a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
                        a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
                        a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
                        a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
                        a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
                        a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
                        a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
                        a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33
                    ]);
                };

                Matrix3D.createInverse = function (a) {
                    var m = a._m;
                    var m00 = m[0 * 4 + 0];
                    var m01 = m[0 * 4 + 1];
                    var m02 = m[0 * 4 + 2];
                    var m03 = m[0 * 4 + 3];
                    var m10 = m[1 * 4 + 0];
                    var m11 = m[1 * 4 + 1];
                    var m12 = m[1 * 4 + 2];
                    var m13 = m[1 * 4 + 3];
                    var m20 = m[2 * 4 + 0];
                    var m21 = m[2 * 4 + 1];
                    var m22 = m[2 * 4 + 2];
                    var m23 = m[2 * 4 + 3];
                    var m30 = m[3 * 4 + 0];
                    var m31 = m[3 * 4 + 1];
                    var m32 = m[3 * 4 + 2];
                    var m33 = m[3 * 4 + 3];
                    var tmp_0 = m22 * m33;
                    var tmp_1 = m32 * m23;
                    var tmp_2 = m12 * m33;
                    var tmp_3 = m32 * m13;
                    var tmp_4 = m12 * m23;
                    var tmp_5 = m22 * m13;
                    var tmp_6 = m02 * m33;
                    var tmp_7 = m32 * m03;
                    var tmp_8 = m02 * m23;
                    var tmp_9 = m22 * m03;
                    var tmp_10 = m02 * m13;
                    var tmp_11 = m12 * m03;
                    var tmp_12 = m20 * m31;
                    var tmp_13 = m30 * m21;
                    var tmp_14 = m10 * m31;
                    var tmp_15 = m30 * m11;
                    var tmp_16 = m10 * m21;
                    var tmp_17 = m20 * m11;
                    var tmp_18 = m00 * m31;
                    var tmp_19 = m30 * m01;
                    var tmp_20 = m00 * m21;
                    var tmp_21 = m20 * m01;
                    var tmp_22 = m00 * m11;
                    var tmp_23 = m10 * m01;

                    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
                    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
                    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
                    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

                    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

                    return new Matrix3D([
                        d * t0,
                        d * t1,
                        d * t2,
                        d * t3,
                        d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
                        d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
                        d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
                        d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
                        d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
                        d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
                        d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
                        d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
                        d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
                        d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
                        d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
                        d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
                    ]);
                };
                return Matrix3D;
            })();
            Geometry.Matrix3D = Matrix3D;

            var DirtyRegion = (function () {
                function DirtyRegion(w, h, sizeInBits) {
                    if (typeof sizeInBits === "undefined") { sizeInBits = 7; }
                    var size = this.size = 1 << sizeInBits;
                    this.sizeInBits = sizeInBits;
                    this.w = w;
                    this.h = h;
                    this.c = Math.ceil(w / size);
                    this.r = Math.ceil(h / size);
                    this.grid = [];
                    for (var y = 0; y < this.r; y++) {
                        this.grid.push([]);
                        for (var x = 0; x < this.c; x++) {
                            this.grid[y][x] = new DirtyRegion.Cell(new Rectangle(x * size, y * size, size, size));
                        }
                    }
                }
                DirtyRegion.prototype.clear = function () {
                    for (var y = 0; y < this.r; y++) {
                        for (var x = 0; x < this.c; x++) {
                            this.grid[y][x].clear();
                        }
                    }
                };

                DirtyRegion.prototype.getBounds = function () {
                    return new Rectangle(0, 0, this.w, this.h);
                };

                DirtyRegion.prototype.addDirtyRectangle = function (rectangle) {
                    var x = rectangle.x >> this.sizeInBits;
                    var y = rectangle.y >> this.sizeInBits;
                    if (x >= this.c || y >= this.r) {
                        return;
                    }
                    if (x < 0) {
                        x = 0;
                    }
                    if (y < 0) {
                        y = 0;
                    }
                    var cell = this.grid[y][x];
                    rectangle = rectangle.clone();
                    rectangle.snap();

                    if (cell.region.contains(rectangle)) {
                        if (cell.bounds.isEmpty()) {
                            cell.bounds.set(rectangle);
                        } else if (!cell.bounds.contains(rectangle)) {
                            cell.bounds.union(rectangle);
                        }
                    } else {
                        var w = Math.min(this.c, Math.ceil((rectangle.x + rectangle.w) / this.size)) - x;
                        var h = Math.min(this.r, Math.ceil((rectangle.y + rectangle.h) / this.size)) - y;
                        for (var i = 0; i < w; i++) {
                            for (var j = 0; j < h; j++) {
                                var cell = this.grid[y + j][x + i];
                                var intersection = cell.region.clone();
                                intersection.intersect(rectangle);
                                if (!intersection.isEmpty()) {
                                    this.addDirtyRectangle(intersection);
                                }
                            }
                        }
                    }
                };

                DirtyRegion.prototype.gatherRegions = function (regions) {
                    for (var y = 0; y < this.r; y++) {
                        for (var x = 0; x < this.c; x++) {
                            var bounds = this.grid[y][x].bounds;
                            if (!bounds.isEmpty()) {
                                regions.push(this.grid[y][x].bounds);
                            }
                        }
                    }
                };

                DirtyRegion.prototype.gatherOptimizedRegions = function (regions) {
                    this.gatherRegions(regions);
                };

                DirtyRegion.prototype.getDirtyRatio = function () {
                    var totalArea = this.w * this.h;
                    if (totalArea === 0) {
                        return 0;
                    }
                    var dirtyArea = 0;
                    for (var y = 0; y < this.r; y++) {
                        for (var x = 0; x < this.c; x++) {
                            dirtyArea += this.grid[y][x].region.area();
                        }
                    }
                    return dirtyArea / totalArea;
                };

                DirtyRegion.prototype.render = function (context, options) {
                    function drawRectangle(rectangle) {
                        context.rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
                    }

                    if (options && options.drawGrid) {
                        context.strokeStyle = "white";
                        for (var y = 0; y < this.r; y++) {
                            for (var x = 0; x < this.c; x++) {
                                var cell = this.grid[y][x];
                                context.beginPath();
                                drawRectangle(cell.region);
                                context.closePath();
                                context.stroke();
                            }
                        }
                    }

                    context.strokeStyle = "#E0F8D8";
                    for (var y = 0; y < this.r; y++) {
                        for (var x = 0; x < this.c; x++) {
                            var cell = this.grid[y][x];
                            context.beginPath();
                            drawRectangle(cell.bounds);
                            context.closePath();
                            context.stroke();
                        }
                    }
                    //      context.strokeStyle = "#5856d6";
                    //      var regions = [];
                    //      this.gatherOptimizedRegions(regions);
                    //      for (var i = 0; i < regions.length; i++) {
                    //        context.beginPath();
                    //        drawRectangle(regions[i]);
                    //        context.closePath();
                    //        context.stroke();
                    //      }
                };
                DirtyRegion.tmpRectangle = Rectangle.createEmpty();
                return DirtyRegion;
            })();
            Geometry.DirtyRegion = DirtyRegion;

            (function (DirtyRegion) {
                var Cell = (function () {
                    function Cell(region) {
                        this.region = region;
                        this.bounds = Rectangle.createEmpty();
                    }
                    Cell.prototype.clear = function () {
                        this.bounds.setEmpty();
                    };
                    return Cell;
                })();
                DirtyRegion.Cell = Cell;
            })(Geometry.DirtyRegion || (Geometry.DirtyRegion = {}));
            var DirtyRegion = Geometry.DirtyRegion;

            var Tile = (function () {
                function Tile(index, x, y, w, h, scale) {
                    this.index = index;
                    this.x = x;
                    this.y = y;
                    this.scale = scale;
                    this.bounds = new Rectangle(x * w, y * h, w, h);
                }
                Tile.prototype.getOBB = function () {
                    if (this._obb) {
                        return this._obb;
                    }
                    this.bounds.getCorners(Tile.corners);
                    return this._obb = new OBB(Tile.corners);
                };
                Tile.corners = Point.createEmptyPoints(4);
                return Tile;
            })();
            Geometry.Tile = Tile;

            /**
            * A grid data structure that lets you query tiles that intersect a transformed rectangle.
            */
            var TileCache = (function () {
                function TileCache(w, h, tileW, tileH, scale) {
                    this.tileW = tileW;
                    this.tileH = tileH;
                    this.scale = scale;
                    this.w = w;
                    this.h = h;
                    this.rows = Math.ceil(h / tileH);
                    this.columns = Math.ceil(w / tileW);
                    release || assert(this.rows < 2048 && this.columns < 2048);
                    this.tiles = [];
                    var index = 0;
                    for (var y = 0; y < this.rows; y++) {
                        for (var x = 0; x < this.columns; x++) {
                            this.tiles.push(new Tile(index++, x, y, tileW, tileH, scale));
                        }
                    }
                }
                /**
                * Query tiles using a transformed rectangle.
                * TODO: Fine-tune these heuristics.
                */
                TileCache.prototype.getTiles = function (query, transform) {
                    if (transform.emptyArea(query)) {
                        return [];
                    } else if (transform.infiniteArea(query)) {
                        return this.tiles;
                    }
                    var tileCount = this.columns * this.rows;

                    // The |getFewTiles| algorithm works better for a few tiles but it can't handle skew transforms.
                    if (tileCount < 40 && transform.isScaleOrRotation()) {
                        var precise = tileCount > 10;
                        return this.getFewTiles(query, transform, precise);
                    } else {
                        return this.getManyTiles(query, transform);
                    }
                };

                /**
                * Precise indicates that we want to do an exact OBB intersection.
                */
                TileCache.prototype.getFewTiles = function (query, transform, precise) {
                    if (typeof precise === "undefined") { precise = true; }
                    if (transform.isTranslationOnly() && this.tiles.length === 1) {
                        if (this.tiles[0].bounds.intersectsTranslated(query, transform.tx, transform.ty)) {
                            return [this.tiles[0]];
                        }
                        return [];
                    }
                    transform.transformRectangle(query, TileCache._points);
                    var queryOBB;
                    var queryBounds = new Rectangle(0, 0, this.w, this.h);
                    if (precise) {
                        queryOBB = new OBB(TileCache._points);
                    }
                    queryBounds.intersect(OBB.getBounds(TileCache._points));

                    if (queryBounds.isEmpty()) {
                        return [];
                    }

                    var minX = queryBounds.x / this.tileW | 0;
                    var minY = queryBounds.y / this.tileH | 0;
                    var maxX = Math.ceil((queryBounds.x + queryBounds.w) / this.tileW) | 0;
                    var maxY = Math.ceil((queryBounds.y + queryBounds.h) / this.tileH) | 0;

                    minX = clamp(minX, 0, this.columns);
                    maxX = clamp(maxX, 0, this.columns);
                    minY = clamp(minY, 0, this.rows);
                    maxY = clamp(maxY, 0, this.rows);

                    var tiles = [];
                    for (var x = minX; x < maxX; x++) {
                        for (var y = minY; y < maxY; y++) {
                            var tile = this.tiles[y * this.columns + x];
                            if (tile.bounds.intersects(queryBounds) && (precise ? tile.getOBB().intersects(queryOBB) : true)) {
                                tiles.push(tile);
                            }
                        }
                    }
                    return tiles;
                };

                TileCache.prototype.getManyTiles = function (query, transform) {
                    function intersectX(x, p1, p2) {
                        // (x - x1) * (y2 - y1) = (y - y1) * (x2 - x1)
                        return (x - p1.x) * (p2.y - p1.y) / (p2.x - p1.x) + p1.y;
                    }
                    function appendTiles(tiles, cache, column, startRow, endRow) {
                        if (column < 0 || column >= cache.columns) {
                            return;
                        }
                        var j1 = clamp(startRow, 0, cache.rows);
                        var j2 = clamp(endRow + 1, 0, cache.rows);
                        for (var j = j1; j < j2; j++) {
                            tiles.push(cache.tiles[j * cache.columns + column]);
                        }
                    }

                    var rectPoints = TileCache._points;
                    transform.transformRectangle(query, rectPoints);

                    // finding minimal-x point, placing at first (and last)
                    var i1 = rectPoints[0].x < rectPoints[1].x ? 0 : 1;
                    var i2 = rectPoints[2].x < rectPoints[3].x ? 2 : 3;
                    var i0 = rectPoints[i1].x < rectPoints[i2].x ? i1 : i2;
                    var lines = [];
                    for (var j = 0; j < 5; j++, i0++) {
                        lines.push(rectPoints[i0 % 4]);
                    }

                    // and keeping points ordered counterclockwise
                    if ((lines[1].x - lines[0].x) * (lines[3].y - lines[0].y) < (lines[1].y - lines[0].y) * (lines[3].x - lines[0].x)) {
                        var tmp = lines[1];
                        lines[1] = lines[3];
                        lines[3] = tmp;
                    }

                    var tiles = [];

                    var lastY1, lastY2;
                    var i = Math.floor(lines[0].x / this.tileW);
                    var nextX = (i + 1) * this.tileW;
                    if (lines[2].x < nextX) {
                        // edge case: all fits into one column
                        lastY1 = Math.min(lines[0].y, lines[1].y, lines[2].y, lines[3].y);
                        lastY2 = Math.max(lines[0].y, lines[1].y, lines[2].y, lines[3].y);
                        var j1 = Math.floor(lastY1 / this.tileH);
                        var j2 = Math.floor(lastY2 / this.tileH);
                        appendTiles(tiles, this, i, j1, j2);
                        return tiles;
                    }

                    var line1 = 0, line2 = 4;
                    var lastSegment1 = false, lastSegment2 = false;
                    if (lines[0].x === lines[1].x || lines[0].x === lines[3].x) {
                        // edge case: first rectangle side parallel to columns
                        if (lines[0].x === lines[1].x) {
                            lastSegment1 = true;
                            line1++;
                        } else {
                            lastSegment2 = true;
                            line2--;
                        }

                        lastY1 = intersectX(nextX, lines[line1], lines[line1 + 1]);
                        lastY2 = intersectX(nextX, lines[line2], lines[line2 - 1]);

                        var j1 = Math.floor(lines[line1].y / this.tileH);
                        var j2 = Math.floor(lines[line2].y / this.tileH);
                        appendTiles(tiles, this, i, j1, j2);
                        i++;
                    }

                    do {
                        var nextY1, nextY2;
                        var nextSegment1, nextSegment2;
                        if (lines[line1 + 1].x < nextX) {
                            nextY1 = lines[line1 + 1].y;
                            nextSegment1 = true;
                        } else {
                            nextY1 = intersectX(nextX, lines[line1], lines[line1 + 1]);
                            nextSegment1 = false;
                        }
                        if (lines[line2 - 1].x < nextX) {
                            nextY2 = lines[line2 - 1].y;
                            nextSegment2 = true;
                        } else {
                            nextY2 = intersectX(nextX, lines[line2], lines[line2 - 1]);
                            nextSegment2 = false;
                        }

                        var j1 = Math.floor((lines[line1].y < lines[line1 + 1].y ? lastY1 : nextY1) / this.tileH);
                        var j2 = Math.floor((lines[line2].y > lines[line2 - 1].y ? lastY2 : nextY2) / this.tileH);
                        appendTiles(tiles, this, i, j1, j2);

                        if (nextSegment1 && lastSegment1) {
                            break;
                        }

                        if (nextSegment1) {
                            lastSegment1 = true;
                            line1++;
                            lastY1 = intersectX(nextX, lines[line1], lines[line1 + 1]);
                        } else {
                            lastY1 = nextY1;
                        }
                        if (nextSegment2) {
                            lastSegment2 = true;
                            line2--;
                            lastY2 = intersectX(nextX, lines[line2], lines[line2 - 1]);
                        } else {
                            lastY2 = nextY2;
                        }
                        i++;
                        nextX = (i + 1) * this.tileW;
                    } while(line1 < line2);
                    return tiles;
                };
                TileCache._points = Point.createEmptyPoints(4);
                return TileCache;
            })();
            Geometry.TileCache = TileCache;

            var MIN_CACHE_LEVELS = 5;
            var MAX_CACHE_LEVELS = 3;

            /**
            * Manages tile caches at different scales.
            */
            var RenderableTileCache = (function () {
                function RenderableTileCache(source, tileSize, minUntiledSize) {
                    this._cacheLevels = [];
                    this._source = source;
                    this._tileSize = tileSize;
                    this._minUntiledSize = minUntiledSize;
                }
                /**
                * Gets the tiles covered by the specified |query| rectangle and transformed by the given |transform| matrix.
                */
                RenderableTileCache.prototype._getTilesAtScale = function (query, transform, scratchBounds) {
                    var transformScale = Math.max(transform.getAbsoluteScaleX(), transform.getAbsoluteScaleY());

                    // Use log2(1 / transformScale) to figure out the tile level.
                    var level = 0;
                    if (transformScale !== 1) {
                        level = clamp(Math.round(Math.log(1 / transformScale) / Math.LN2), -MIN_CACHE_LEVELS, MAX_CACHE_LEVELS);
                    }
                    var scale = pow2(level);

                    // Since we use a single tile for dynamic sources, we've got to make sure that it fits in our surface caches ...
                    if (this._source.hasFlags(1 /* Dynamic */)) {
                        while (true) {
                            scale = pow2(level);
                            if (scratchBounds.contains(this._source.getBounds().getAbsoluteBounds().clone().scale(scale, scale))) {
                                break;
                            }
                            level--;
                            release || assert(level >= -MIN_CACHE_LEVELS);
                        }
                    }

                    // If the source is not scalable don't cache any tiles at a higher scale factor. However, it may still make
                    // sense to cache at a lower scale factor in case we need to evict larger cached images.
                    if (!(this._source.hasFlags(4 /* Scalable */))) {
                        level = clamp(level, -MIN_CACHE_LEVELS, 0);
                    }
                    var scale = pow2(level);
                    var levelIndex = MIN_CACHE_LEVELS + level;
                    var cache = this._cacheLevels[levelIndex];
                    if (!cache) {
                        var bounds = this._source.getBounds().getAbsoluteBounds();
                        var scaledBounds = bounds.clone().scale(scale, scale);
                        var tileW, tileH;
                        if (this._source.hasFlags(1 /* Dynamic */) || !this._source.hasFlags(8 /* Tileable */) || Math.max(scaledBounds.w, scaledBounds.h) <= this._minUntiledSize) {
                            tileW = scaledBounds.w;
                            tileH = scaledBounds.h;
                        } else {
                            tileW = tileH = this._tileSize;
                        }
                        cache = this._cacheLevels[levelIndex] = new TileCache(scaledBounds.w, scaledBounds.h, tileW, tileH, scale);
                    }
                    return cache.getTiles(query, transform.scaleClone(scale, scale));
                };

                RenderableTileCache.prototype.fetchTiles = function (query, transform, scratchContext, cacheImageCallback) {
                    var scratchBounds = new Rectangle(0, 0, scratchContext.canvas.width, scratchContext.canvas.height);
                    var tiles = this._getTilesAtScale(query, transform, scratchBounds);
                    var uncachedTiles;
                    var source = this._source;
                    for (var i = 0; i < tiles.length; i++) {
                        var tile = tiles[i];
                        if (!tile.cachedSurfaceRegion || !tile.cachedSurfaceRegion.surface || (source.hasFlags(1 /* Dynamic */ | 2 /* Dirty */))) {
                            if (!uncachedTiles) {
                                uncachedTiles = [];
                            }
                            uncachedTiles.push(tile);
                        }
                    }
                    if (uncachedTiles) {
                        this._cacheTiles(scratchContext, uncachedTiles, cacheImageCallback, scratchBounds);
                    }
                    source.removeFlags(2 /* Dirty */);
                    return tiles;
                };

                RenderableTileCache.prototype._getTileBounds = function (tiles) {
                    var bounds = Rectangle.createEmpty();
                    for (var i = 0; i < tiles.length; i++) {
                        bounds.union(tiles[i].bounds);
                    }
                    return bounds;
                };

                /**
                * This caches raster versions of the specified |uncachedTiles|. The tiles are generated using a scratch
                * canvas2D context (|scratchContext|) and then cached via |cacheImageCallback|. Ideally, we want to render
                * all tiles in one go, but they may not fit in the |scratchContext| in which case we need to render the
                * source shape several times.
                *
                * TODO: Find a good algorithm to do this since it's quite important that we don't repaint too many times.
                * Spending some time trying to figure out the *optimal* solution may pay-off since painting is soo expensive.
                */
                RenderableTileCache.prototype._cacheTiles = function (scratchContext, uncachedTiles, cacheImageCallback, scratchBounds, maxRecursionDepth) {
                    if (typeof maxRecursionDepth === "undefined") { maxRecursionDepth = 4; }
                    release || assert(maxRecursionDepth > 0, "Infinite recursion is likely.");
                    var uncachedTileBounds = this._getTileBounds(uncachedTiles);
                    scratchContext.save();
                    scratchContext.setTransform(1, 0, 0, 1, 0, 0);
                    scratchContext.clearRect(0, 0, scratchBounds.w, scratchBounds.h);
                    scratchContext.translate(-uncachedTileBounds.x, -uncachedTileBounds.y);
                    scratchContext.scale(uncachedTiles[0].scale, uncachedTiles[0].scale);

                    // Translate so that the source is drawn at the origin.
                    var sourceBounds = this._source.getBounds();
                    scratchContext.translate(-sourceBounds.x, -sourceBounds.y);
                    profile && GFX.timelineBuffer && GFX.timelineBuffer.enter("renderTiles");
                    GFX.traceLevel >= 2 /* Verbose */ && GFX.writer && GFX.writer.writeLn("Rendering Tiles: " + uncachedTileBounds);
                    this._source.render(scratchContext);
                    scratchContext.restore();
                    profile && GFX.timelineBuffer && GFX.timelineBuffer.leave("renderTiles");

                    var remainingUncachedTiles = null;
                    for (var i = 0; i < uncachedTiles.length; i++) {
                        var tile = uncachedTiles[i];
                        var region = tile.bounds.clone();
                        region.x -= uncachedTileBounds.x;
                        region.y -= uncachedTileBounds.y;
                        if (!scratchBounds.contains(region)) {
                            if (!remainingUncachedTiles) {
                                remainingUncachedTiles = [];
                            }
                            remainingUncachedTiles.push(tile);
                        }
                        tile.cachedSurfaceRegion = cacheImageCallback(tile.cachedSurfaceRegion, scratchContext, region);
                    }
                    if (remainingUncachedTiles) {
                        // This is really dumb at the moment; if we have some tiles left over, partition the tile set in half and recurse.
                        if (remainingUncachedTiles.length >= 2) {
                            var a = remainingUncachedTiles.slice(0, remainingUncachedTiles.length / 2 | 0);
                            var b = remainingUncachedTiles.slice(a.length);
                            this._cacheTiles(scratchContext, a, cacheImageCallback, scratchBounds, maxRecursionDepth - 1);
                            this._cacheTiles(scratchContext, b, cacheImageCallback, scratchBounds, maxRecursionDepth - 1);
                        } else {
                            this._cacheTiles(scratchContext, remainingUncachedTiles, cacheImageCallback, scratchBounds, maxRecursionDepth - 1);
                        }
                    }
                };
                return RenderableTileCache;
            })();
            Geometry.RenderableTileCache = RenderableTileCache;

            var MipMapLevel = (function () {
                function MipMapLevel(surfaceRegion, scale) {
                    this.surfaceRegion = surfaceRegion;
                    this.scale = scale;
                    // ...
                }
                return MipMapLevel;
            })();
            Geometry.MipMapLevel = MipMapLevel;

            var MipMap = (function () {
                function MipMap(source, surfaceRegionAllocator, size) {
                    this._source = source;
                    this._levels = [];
                    this._surfaceRegionAllocator = surfaceRegionAllocator;
                    this._size = size;
                }
                MipMap.prototype.render = function (context) {
                };
                MipMap.prototype.getLevel = function (matrix) {
                    var matrixScale = Math.max(matrix.getAbsoluteScaleX(), matrix.getAbsoluteScaleY());
                    var level = 0;
                    if (matrixScale !== 1) {
                        level = clamp(Math.round(Math.log(matrixScale) / Math.LN2), -MIN_CACHE_LEVELS, MAX_CACHE_LEVELS);
                    }
                    if (!(this._source.hasFlags(4 /* Scalable */))) {
                        level = clamp(level, -MIN_CACHE_LEVELS, 0);
                    }
                    var scale = pow2(level);
                    var levelIndex = MIN_CACHE_LEVELS + level;
                    var mipLevel = this._levels[levelIndex];

                    if (!mipLevel) {
                        var bounds = this._source.getBounds();
                        var scaledBounds = bounds.clone();
                        scaledBounds.scale(scale, scale);
                        scaledBounds.snap();
                        var surfaceRegion = this._surfaceRegionAllocator.allocate(scaledBounds.w, scaledBounds.h);
                        var region = surfaceRegion.region;
                        mipLevel = this._levels[levelIndex] = new MipMapLevel(surfaceRegion, scale);

                        // TODO: Should cast to <Canvas2D.Canvas2DSurface> but this is not available in gfx-base. We should probably
                        // move this code outside of geometry.
                        var surface = (mipLevel.surfaceRegion.surface);
                        var context = surface.context;
                        context.save();
                        context.beginPath();
                        context.rect(region.x, region.y, region.w, region.h);
                        context.clip();
                        context.setTransform(scale, 0, 0, scale, region.x - scaledBounds.x, region.y - scaledBounds.y);
                        this._source.render(context);
                        context.restore();
                    }
                    return mipLevel;
                };
                return MipMap;
            })();
            Geometry.MipMap = MipMap;
        })(GFX.Geometry || (GFX.Geometry = {}));
        var Geometry = GFX.Geometry;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
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
    (function (GFX) {
        var roundToMultipleOfPowerOfTwo = Shumway.IntegerUtilities.roundToMultipleOfPowerOfTwo;
        var assert = Shumway.Debug.assert;
        var Rectangle = GFX.Geometry.Rectangle;

        /**
        * Various 2D rectangular region allocators. These are used to manage
        * areas of surfaces, 2D Canvases or WebGL surfaces. Each allocator
        * implements the |IRegionAllocator| interface and must provied two
        * methods to allocate and free regions.
        *
        * CompactAllocator: Good for tightly packed surface atlases but becomes
        * fragmented easily. Allocation / freeing cost is high and should only
        * be used for long lived regions.
        *
        * GridAllocator: Very fast at allocation and freeing but is not very
        * tightly packed. Space is initially partitioned in equally sized grid
        * cells which may be much larger than the allocated regions. This should
        * be used for fixed size allocation regions.
        *
        * BucketAllocator: Manages a list of GridAllocators with different grid
        * sizes.
        */
        (function (RegionAllocator) {
            var Region = (function (_super) {
                __extends(Region, _super);
                function Region() {
                    _super.apply(this, arguments);
                }
                return Region;
            })(GFX.Geometry.Rectangle);
            RegionAllocator.Region = Region;

            /**
            * Simple 2D bin-packing algorithm that recursively partitions space along the x and y axis. The binary tree
            * can get quite deep so watch out of deep recursive calls. This algorithm works best when inserting items
            * that are sorted by width and height, from largest to smallest.
            */
            var CompactAllocator = (function () {
                function CompactAllocator(w, h) {
                    this._root = new CompactCell(0, 0, w | 0, h | 0, false);
                }
                CompactAllocator.prototype.allocate = function (w, h) {
                    w = Math.ceil(w);
                    h = Math.ceil(h);
                    release || assert(w > 0 && h > 0);
                    var result = this._root.insert(w, h);
                    if (result) {
                        result.allocator = this;
                        result.allocated = true;
                    }
                    return result;
                };

                CompactAllocator.prototype.free = function (region) {
                    var cell = region;
                    release || assert(cell.allocator === this);
                    cell.clear();
                    region.allocated = false;
                };
                CompactAllocator.RANDOM_ORIENTATION = true;
                CompactAllocator.MAX_DEPTH = 256;
                return CompactAllocator;
            })();
            RegionAllocator.CompactAllocator = CompactAllocator;

            var CompactCell = (function (_super) {
                __extends(CompactCell, _super);
                function CompactCell(x, y, w, h, horizontal) {
                    _super.call(this, x, y, w, h);
                    this._children = null;
                    this._horizontal = horizontal;
                    this.allocated = false;
                }
                CompactCell.prototype.clear = function () {
                    this._children = null;
                    this.allocated = false;
                };
                CompactCell.prototype.insert = function (w, h) {
                    return this._insert(w, h, 0);
                };
                CompactCell.prototype._insert = function (w, h, depth) {
                    if (depth > CompactAllocator.MAX_DEPTH) {
                        return;
                    }
                    if (this.allocated) {
                        return;
                    }
                    if (this.w < w || this.h < h) {
                        return;
                    }
                    if (!this._children) {
                        var orientation = !this._horizontal;
                        if (CompactAllocator.RANDOM_ORIENTATION) {
                            orientation = Math.random() >= 0.5;
                        }
                        if (this._horizontal) {
                            this._children = [
                                new CompactCell(this.x, this.y, this.w, h, false),
                                new CompactCell(this.x, this.y + h, this.w, this.h - h, orientation)
                            ];
                        } else {
                            this._children = [
                                new CompactCell(this.x, this.y, w, this.h, true),
                                new CompactCell(this.x + w, this.y, this.w - w, this.h, orientation)
                            ];
                        }
                        var first = this._children[0];
                        if (first.w === w && first.h === h) {
                            first.allocated = true;
                            return first;
                        }
                        return this._insert(w, h, depth + 1);
                    } else {
                        var result;
                        result = this._children[0]._insert(w, h, depth + 1);
                        if (result) {
                            return result;
                        }
                        result = this._children[1]._insert(w, h, depth + 1);
                        if (result) {
                            return result;
                        }
                    }
                };
                return CompactCell;
            })(RegionAllocator.Region);

            /**
            * Simple grid allocator. Starts off with an empty free list and allocates empty cells. Once a cell
            * is freed it's pushed into the free list. It gets poped off the next time a region is allocated.
            */
            var GridAllocator = (function () {
                function GridAllocator(w, h, sizeW, sizeH) {
                    this._columns = w / sizeW | 0;
                    this._rows = h / sizeH | 0;
                    this._sizeW = sizeW;
                    this._sizeH = sizeH;
                    this._freeList = [];
                    this._index = 0;
                    this._total = this._columns * this._rows;
                }
                GridAllocator.prototype.allocate = function (w, h) {
                    w = Math.ceil(w);
                    h = Math.ceil(h);
                    release || assert(w > 0 && h > 0);
                    var sizeW = this._sizeW;
                    var sizeH = this._sizeH;
                    if (w > sizeW || h > sizeH) {
                        return null;
                    }
                    var freeList = this._freeList;
                    var index = this._index;
                    if (freeList.length > 0) {
                        var cell = freeList.pop();
                        release || assert(cell.allocated === false);
                        cell.allocated = true;
                        return cell;
                    } else if (index < this._total) {
                        var y = (index / this._columns) | 0;
                        var x = index - (y * this._columns);
                        var cell = new GridCell(x * sizeW, y * sizeH, w, h);
                        cell.index = index;
                        cell.allocator = this;
                        cell.allocated = true;
                        this._index++;
                        return cell;
                    }
                    return null;
                };

                GridAllocator.prototype.free = function (region) {
                    var cell = region;
                    release || assert(cell.allocator === this);
                    cell.allocated = false;
                    this._freeList.push(cell);
                };
                return GridAllocator;
            })();
            RegionAllocator.GridAllocator = GridAllocator;

            var GridCell = (function (_super) {
                __extends(GridCell, _super);
                function GridCell(x, y, w, h) {
                    _super.call(this, x, y, w, h);
                    this.index = -1;
                }
                return GridCell;
            })(RegionAllocator.Region);
            RegionAllocator.GridCell = GridCell;

            var Bucket = (function () {
                function Bucket(size, region, allocator) {
                    this.size = size;
                    this.region = region;
                    this.allocator = allocator;
                }
                return Bucket;
            })();

            var BucketCell = (function (_super) {
                __extends(BucketCell, _super);
                function BucketCell(x, y, w, h, region) {
                    _super.call(this, x, y, w, h);
                    this.region = region;
                }
                return BucketCell;
            })(RegionAllocator.Region);
            RegionAllocator.BucketCell = BucketCell;

            var BucketAllocator = (function () {
                function BucketAllocator(w, h) {
                    release || assert(w > 0 && h > 0);
                    this._buckets = [];
                    this._w = w | 0;
                    this._h = h | 0;
                    this._filled = 0;
                }
                /**
                * Finds the first bucket that is large enough to hold the requested region. If no
                * such bucket exists, then allocates a new bucket if there is room otherwise
                * returns null;
                */
                BucketAllocator.prototype.allocate = function (w, h) {
                    w = Math.ceil(w);
                    h = Math.ceil(h);
                    release || assert(w > 0 && h > 0);
                    var size = Math.max(w, h);
                    if (w > this._w || h > this._h) {
                        // Too big, cannot allocate this.
                        return null;
                    }
                    var region = null;
                    var bucket;
                    var buckets = this._buckets;
                    do {
                        for (var i = 0; i < buckets.length; i++) {
                            if (buckets[i].size >= size) {
                                bucket = buckets[i];
                                region = bucket.allocator.allocate(w, h);
                                if (region) {
                                    break;
                                }
                            }
                        }
                        if (!region) {
                            var remainingSpace = this._h - this._filled;
                            if (remainingSpace < h) {
                                // Couldn't allocate region and there is no more vertical space to allocate
                                // a new bucket that can fit the requested size. So give up.
                                return null;
                            }
                            var gridSize = roundToMultipleOfPowerOfTwo(size, 2);
                            var bucketHeight = gridSize * 2;
                            if (bucketHeight > remainingSpace) {
                                bucketHeight = remainingSpace;
                            }
                            if (bucketHeight < gridSize) {
                                return null;
                            }
                            var bucketRegion = new Rectangle(0, this._filled, this._w, bucketHeight);
                            this._buckets.push(new Bucket(gridSize, bucketRegion, new GridAllocator(bucketRegion.w, bucketRegion.h, gridSize, gridSize)));
                            this._filled += bucketHeight;
                        }
                    } while(!region);

                    return new BucketCell(bucket.region.x + region.x, bucket.region.y + region.y, region.w, region.h, region);
                };

                BucketAllocator.prototype.free = function (region) {
                    region.region.allocator.free(region.region);
                };
                return BucketAllocator;
            })();
            RegionAllocator.BucketAllocator = BucketAllocator;
        })(GFX.RegionAllocator || (GFX.RegionAllocator = {}));
        var RegionAllocator = GFX.RegionAllocator;

        (function (SurfaceRegionAllocator) {
            var SimpleAllocator = (function () {
                function SimpleAllocator(createSurface) {
                    this._createSurface = createSurface;
                    this._surfaces = [];
                }
                Object.defineProperty(SimpleAllocator.prototype, "surfaces", {
                    get: function () {
                        return this._surfaces;
                    },
                    enumerable: true,
                    configurable: true
                });

                SimpleAllocator.prototype._createNewSurface = function (w, h) {
                    var surface = this._createSurface(w, h);
                    this._surfaces.push(surface);
                    return surface;
                };

                SimpleAllocator.prototype.addSurface = function (surface) {
                    this._surfaces.push(surface);
                };

                SimpleAllocator.prototype.allocate = function (w, h) {
                    for (var i = 0; i < this._surfaces.length; i++) {
                        var region = this._surfaces[i].allocate(w, h);
                        if (region) {
                            return region;
                        }
                    }
                    return this._createNewSurface(w, h).allocate(w, h);
                };

                SimpleAllocator.prototype.free = function (region) {
                };
                return SimpleAllocator;
            })();
            SurfaceRegionAllocator.SimpleAllocator = SimpleAllocator;
        })(GFX.SurfaceRegionAllocator || (GFX.SurfaceRegionAllocator = {}));
        var SurfaceRegionAllocator = GFX.SurfaceRegionAllocator;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
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
    (function (GFX) {
        var Point = GFX.Geometry.Point;
        var Matrix = GFX.Geometry.Matrix;

        var assert = Shumway.Debug.assert;
        var unexpected = Shumway.Debug.unexpected;

        (function (Direction) {
            Direction[Direction["None"] = 0] = "None";
            Direction[Direction["Upward"] = 1] = "Upward";
            Direction[Direction["Downward"] = 2] = "Downward";
        })(GFX.Direction || (GFX.Direction = {}));
        var Direction = GFX.Direction;

        (function (PixelSnapping) {
            PixelSnapping[PixelSnapping["Never"] = 0] = "Never";
            PixelSnapping[PixelSnapping["Always"] = 1] = "Always";
            PixelSnapping[PixelSnapping["Auto"] = 2] = "Auto";
        })(GFX.PixelSnapping || (GFX.PixelSnapping = {}));
        var PixelSnapping = GFX.PixelSnapping;

        (function (Smoothing) {
            Smoothing[Smoothing["Never"] = 0] = "Never";
            Smoothing[Smoothing["Always"] = 1] = "Always";
        })(GFX.Smoothing || (GFX.Smoothing = {}));
        var Smoothing = GFX.Smoothing;

        (function (FrameFlags) {
            FrameFlags[FrameFlags["Empty"] = 0x0000] = "Empty";
            FrameFlags[FrameFlags["Dirty"] = 0x0001] = "Dirty";
            FrameFlags[FrameFlags["IsMask"] = 0x0002] = "IsMask";
            FrameFlags[FrameFlags["IgnoreMask"] = 0x0008] = "IgnoreMask";
            FrameFlags[FrameFlags["IgnoreQuery"] = 0x0010] = "IgnoreQuery";

            /**
            * Frame has invalid bounds because one of its children's bounds have been mutated.
            */
            FrameFlags[FrameFlags["InvalidBounds"] = 0x0020] = "InvalidBounds";

            /**
            * Frame has an invalid concatenated matrix because its matrix or one of its ancestor's matrices has been mutated.
            */
            FrameFlags[FrameFlags["InvalidConcatenatedMatrix"] = 0x0040] = "InvalidConcatenatedMatrix";

            /**
            * Frame has an invalid inverted concatenated matrix because its matrix or one of its ancestor's matrices has been
            * mutated. We don't always need to compute the inverted matrix. This is why we use a sepearete invalid flag for it
            * and don't roll it under the |InvalidConcatenatedMatrix| flag.
            */
            FrameFlags[FrameFlags["InvalidInvertedConcatenatedMatrix"] = 0x0080] = "InvalidInvertedConcatenatedMatrix";

            /**
            * Frame has an invalid concatenated color transform because its color transform or one of its ancestor's color
            * transforms has been mutated.
            */
            FrameFlags[FrameFlags["InvalidConcatenatedColorMatrix"] = 0x0100] = "InvalidConcatenatedColorMatrix";

            /**
            * Frame has invalid contents and needs to be repainted, this bit is culled by the viewport.
            */
            FrameFlags[FrameFlags["InvalidPaint"] = 0x0200] = "InvalidPaint";

            FrameFlags[FrameFlags["EnterClip"] = 0x1000] = "EnterClip";
            FrameFlags[FrameFlags["LeaveClip"] = 0x2000] = "LeaveClip";

            FrameFlags[FrameFlags["Visible"] = 0x4000] = "Visible";
        })(GFX.FrameFlags || (GFX.FrameFlags = {}));
        var FrameFlags = GFX.FrameFlags;

        /**
        * Frame capabilities, the fewer capabilities the better.
        */
        (function (FrameCapabilityFlags) {
            FrameCapabilityFlags[FrameCapabilityFlags["None"] = 0] = "None";

            FrameCapabilityFlags[FrameCapabilityFlags["AllowMatrixWrite"] = 1] = "AllowMatrixWrite";
            FrameCapabilityFlags[FrameCapabilityFlags["AllowColorMatrixWrite"] = 2] = "AllowColorMatrixWrite";
            FrameCapabilityFlags[FrameCapabilityFlags["AllowBlendModeWrite"] = 4] = "AllowBlendModeWrite";
            FrameCapabilityFlags[FrameCapabilityFlags["AllowFiltersWrite"] = 8] = "AllowFiltersWrite";
            FrameCapabilityFlags[FrameCapabilityFlags["AllowMaskWrite"] = 16] = "AllowMaskWrite";
            FrameCapabilityFlags[FrameCapabilityFlags["AllowChildrenWrite"] = 32] = "AllowChildrenWrite";
            FrameCapabilityFlags[FrameCapabilityFlags["AllowClipWrite"] = 64] = "AllowClipWrite";
            FrameCapabilityFlags[FrameCapabilityFlags["AllowAllWrite"] = FrameCapabilityFlags.AllowMatrixWrite | FrameCapabilityFlags.AllowColorMatrixWrite | FrameCapabilityFlags.AllowBlendModeWrite | FrameCapabilityFlags.AllowFiltersWrite | FrameCapabilityFlags.AllowMaskWrite | FrameCapabilityFlags.AllowChildrenWrite | FrameCapabilityFlags.AllowClipWrite] = "AllowAllWrite";
        })(GFX.FrameCapabilityFlags || (GFX.FrameCapabilityFlags = {}));
        var FrameCapabilityFlags = GFX.FrameCapabilityFlags;

        /**
        * The |Frame| class is the base class for all nodes in the frame tree. Frames have several local and computed
        * properties. Computed properties are evaluated lazily and cached locally. Invalid bits are used to mark
        * computed properties as being invalid and may be cleared once these properties are re-evaluated.
        *
        * Capability flags are not yet implemented. The idea is to force some constraits on frames so that algorithms
        * can run more effectively.
        *
        *
        */
        var Frame = (function () {
            function Frame() {
                this._id = Frame._nextID++;
                this._flags = 16384 /* Visible */ | 512 /* InvalidPaint */ | 32 /* InvalidBounds */ | 64 /* InvalidConcatenatedMatrix */ | 128 /* InvalidInvertedConcatenatedMatrix */ | 256 /* InvalidConcatenatedColorMatrix */;

                this._capability = FrameCapabilityFlags.AllowAllWrite;
                this._parent = null;
                this._clip = -1;
                this._blendMode = 1 /* Normal */;
                this._filters = [];
                this._mask = null;
                this._matrix = Matrix.createIdentity();
                this._concatenatedMatrix = Matrix.createIdentity();
                this._invertedConcatenatedMatrix = null;
                this._colorMatrix = GFX.ColorMatrix.createIdentity();
                this._concatenatedColorMatrix = GFX.ColorMatrix.createIdentity();

                this._smoothing = 0 /* Never */;
                this._pixelSnapping = 0 /* Never */;
            }
            /*
            * Return's a list of ancestors excluding the |last|, the return list is reused.
            */
            Frame._getAncestors = function (node, last) {
                if (typeof last === "undefined") { last = null; }
                var path = Frame._path;
                path.length = 0;
                while (node && node !== last) {
                    path.push(node);
                    node = node._parent;
                }
                release || assert(node === last, "Last ancestor is not an ancestor.");
                return path;
            };

            Object.defineProperty(Frame.prototype, "parent", {
                get: function () {
                    return this._parent;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Frame.prototype, "id", {
                get: function () {
                    return this._id;
                },
                enumerable: true,
                configurable: true
            });

            Frame.prototype._setFlags = function (flags) {
                this._flags |= flags;
            };

            Frame.prototype._removeFlags = function (flags) {
                this._flags &= ~flags;
            };

            Frame.prototype._hasFlags = function (flags) {
                return (this._flags & flags) === flags;
            };

            Frame.prototype._toggleFlags = function (flags, on) {
                if (on) {
                    this._flags |= flags;
                } else {
                    this._flags &= ~flags;
                }
            };

            Frame.prototype._hasAnyFlags = function (flags) {
                return !!(this._flags & flags);
            };

            /**
            * Finds the closest ancestor with a given set of flags that are either turned on or off.
            */
            Frame.prototype._findClosestAncestor = function (flags, on) {
                var node = this;
                while (node) {
                    if (node._hasFlags(flags) === on) {
                        return node;
                    }
                    node = node._parent;
                }
                return null;
            };

            /**
            * Tests if this frame is an ancestor of the specified frame.
            */
            Frame.prototype._isAncestor = function (child) {
                var node = child;
                while (node) {
                    if (node === this) {
                        return true;
                    }
                    node = node._parent;
                }
                return false;
            };

            /**
            * Propagates capabilities up and down the frame tree.
            *
            * TODO: Make this non-recursive.
            */
            Frame.prototype.setCapability = function (capability, on, direction) {
                if (typeof on === "undefined") { on = true; }
                if (typeof direction === "undefined") { direction = 0 /* None */; }
                if (on) {
                    this._capability |= capability;
                } else {
                    this._capability &= ~capability;
                }
                if (direction === 1 /* Upward */ && this._parent) {
                    this._parent.setCapability(capability, on, direction);
                } else if (direction === 2 /* Downward */ && this instanceof GFX.FrameContainer) {
                    var frameContainer = this;
                    var children = frameContainer._children;
                    for (var i = 0; i < children.length; i++) {
                        children[i].setCapability(capability, on, direction);
                    }
                }
            };

            Frame.prototype.removeCapability = function (capability) {
                this.setCapability(capability, false);
            };

            Frame.prototype.hasCapability = function (capability) {
                return this._capability & capability;
            };

            Frame.prototype.checkCapability = function (capability) {
                if (!(this._capability & capability)) {
                    unexpected("Frame doesn't have capability: " + FrameCapabilityFlags[capability]);
                }
            };

            /**
            * Propagates flags up the frame tree. Propagation stops if all flags are already set.
            */
            Frame.prototype._propagateFlagsUp = function (flags) {
                if (this._hasFlags(flags)) {
                    return;
                }
                this._setFlags(flags);
                var parent = this._parent;
                if (parent) {
                    parent._propagateFlagsUp(flags);
                }
            };

            /**
            * Propagates flags down the frame tree. Non-containers just set the flags on themselves.
            *
            * Overridden in FrameContainer.
            */
            Frame.prototype._propagateFlagsDown = function (flags) {
                this._setFlags(flags);
            };

            /**
            * Marks this frame as having been moved in its parent frame. This needs to be called whenever the position
            * of a frame changes in the frame tree. For instance, its matrix has been mutated or it has been added or
            * removed from a frame container.
            */
            Frame.prototype._invalidatePosition = function () {
                this._propagateFlagsDown(64 /* InvalidConcatenatedMatrix */ | 128 /* InvalidInvertedConcatenatedMatrix */);
                if (this._parent) {
                    this._parent._invalidateBounds();
                }
                this._invalidateParentPaint();
            };

            /**
            * Marks this frame as needing to be repainted.
            */
            Frame.prototype.invalidatePaint = function () {
                this._propagateFlagsUp(512 /* InvalidPaint */);
            };

            Frame.prototype._invalidateParentPaint = function () {
                if (this._parent) {
                    this._parent._propagateFlagsUp(512 /* InvalidPaint */);
                }
            };

            Frame.prototype._invalidateBounds = function () {
                /* TODO: We should only propagate this bit if the bounds are actually changed. We can do the
                * bounds computation eagerly if the number of children is low. If there are no changes in the
                * bounds we don't need to propagate the bit. */
                this._propagateFlagsUp(32 /* InvalidBounds */);
            };

            Object.defineProperty(Frame.prototype, "properties", {
                get: function () {
                    return this._properties || (this._properties = Object.create(null));
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Frame.prototype, "x", {
                get: function () {
                    return this._matrix.tx;
                },
                set: function (value) {
                    this.checkCapability(1 /* AllowMatrixWrite */);
                    this._matrix.tx = value;
                    this._invalidatePosition();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Frame.prototype, "y", {
                get: function () {
                    return this._matrix.ty;
                },
                set: function (value) {
                    this.checkCapability(1 /* AllowMatrixWrite */);
                    this._matrix.ty = value;
                    this._invalidatePosition();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Frame.prototype, "matrix", {
                get: function () {
                    return this._matrix;
                },
                set: function (value) {
                    this.checkCapability(1 /* AllowMatrixWrite */);
                    this._matrix.set(value);
                    this._invalidatePosition();
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(Frame.prototype, "blendMode", {
                get: function () {
                    return this._blendMode;
                },
                set: function (value) {
                    value = value | 0;
                    this.checkCapability(4 /* AllowBlendModeWrite */);
                    this._blendMode = value;
                    this._invalidateParentPaint();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Frame.prototype, "filters", {
                get: function () {
                    return this._filters;
                },
                set: function (value) {
                    this.checkCapability(8 /* AllowFiltersWrite */);
                    this._filters = value;
                    this._invalidateParentPaint();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Frame.prototype, "colorMatrix", {
                get: function () {
                    return this._colorMatrix;
                },
                set: function (value) {
                    this.checkCapability(2 /* AllowColorMatrixWrite */);
                    this._colorMatrix = value;
                    this._propagateFlagsDown(256 /* InvalidConcatenatedColorMatrix */);
                    this._invalidateParentPaint();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Frame.prototype, "mask", {
                get: function () {
                    return this._mask;
                },
                set: function (value) {
                    this.checkCapability(16 /* AllowMaskWrite */);
                    if (this._mask && this._mask !== value) {
                        this._mask._removeFlags(2 /* IsMask */);
                    }
                    this._mask = value;
                    if (this._mask) {
                        // TODO: Check if this assertion makes sense.
                        // release || assert (!this._mask._hasFlags(FrameFlags.IsMask));
                        this._mask._setFlags(2 /* IsMask */);
                        this._mask.invalidate();
                    }
                    this.invalidate();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Frame.prototype, "clip", {
                get: function () {
                    return this._clip;
                },
                set: function (value) {
                    this.checkCapability(64 /* AllowClipWrite */);
                    this._clip = value;
                },
                enumerable: true,
                configurable: true
            });

            Frame.prototype.getBounds = function () {
                release || assert(false, "Override this.");
                return null;
            };

            Frame.prototype.gatherPreviousDirtyRegions = function () {
                var stage = this.stage;
                if (!stage.trackDirtyRegions) {
                    return;
                }
                this.visit(function (frame) {
                    if (frame instanceof GFX.FrameContainer) {
                        return 0 /* Continue */;
                    }
                    if (frame._previouslyRenderedAABB) {
                        stage.dirtyRegion.addDirtyRectangle(frame._previouslyRenderedAABB);
                    }
                    return 0 /* Continue */;
                });
            };

            Frame.prototype.getConcatenatedColorMatrix = function () {
                if (!this._parent) {
                    return this._colorMatrix;
                }

                // Compute the concatenated color transforms for this node and all of its ancestors.
                if (this._hasFlags(256 /* InvalidConcatenatedColorMatrix */)) {
                    var ancestor = this._findClosestAncestor(256 /* InvalidConcatenatedColorMatrix */, false);
                    var path = Frame._getAncestors(this, ancestor);
                    var m = ancestor ? ancestor._concatenatedColorMatrix.clone() : GFX.ColorMatrix.createIdentity();
                    for (var i = path.length - 1; i >= 0; i--) {
                        var ancestor = path[i];
                        release || assert(ancestor._hasFlags(256 /* InvalidConcatenatedColorMatrix */));

                        // TODO: Premultiply here.
                        m.multiply(ancestor._colorMatrix);
                        ancestor._concatenatedColorMatrix.set(m);
                        ancestor._removeFlags(256 /* InvalidConcatenatedColorMatrix */);
                    }
                }
                return this._concatenatedColorMatrix;
            };

            Frame.prototype.getConcatenatedAlpha = function (ancestor) {
                if (typeof ancestor === "undefined") { ancestor = null; }
                var frame = this;
                var alpha = 1;
                while (frame && frame !== ancestor) {
                    alpha *= frame._colorMatrix.alphaMultiplier;
                    frame = frame._parent;
                }
                return alpha;
            };

            Object.defineProperty(Frame.prototype, "stage", {
                get: function () {
                    var frame = this;
                    while (frame._parent) {
                        frame = frame._parent;
                    }
                    if (frame instanceof GFX.Stage) {
                        return frame;
                    }
                    return null;
                },
                enumerable: true,
                configurable: true
            });

            Frame.prototype.getConcatenatedMatrix = function () {
                // Compute the concatenated transforms for this node and all of its ancestors.
                if (this._hasFlags(64 /* InvalidConcatenatedMatrix */)) {
                    var ancestor = this._findClosestAncestor(64 /* InvalidConcatenatedMatrix */, false);
                    var path = Frame._getAncestors(this, ancestor);
                    var m = ancestor ? ancestor._concatenatedMatrix.clone() : Matrix.createIdentity();
                    for (var i = path.length - 1; i >= 0; i--) {
                        var ancestor = path[i];
                        release || assert(ancestor._hasFlags(64 /* InvalidConcatenatedMatrix */));
                        m.preMultiply(ancestor._matrix);
                        ancestor._concatenatedMatrix.set(m);
                        ancestor._removeFlags(64 /* InvalidConcatenatedMatrix */);
                    }
                }
                return this._concatenatedMatrix;
            };

            Frame.prototype._getInvertedConcatenatedMatrix = function () {
                if (this._hasFlags(128 /* InvalidInvertedConcatenatedMatrix */)) {
                    if (!this._invertedConcatenatedMatrix) {
                        this._invertedConcatenatedMatrix = Matrix.createIdentity();
                    }
                    this._invertedConcatenatedMatrix.set(this.getConcatenatedMatrix());
                    this._invertedConcatenatedMatrix.inverse(this._invertedConcatenatedMatrix);
                    this._removeFlags(128 /* InvalidInvertedConcatenatedMatrix */);
                }
                return this._invertedConcatenatedMatrix;
            };

            Frame.prototype.invalidate = function () {
                this._setFlags(1 /* Dirty */);
            };

            Frame.prototype.visit = function (visitor, transform, flags, visitorFlags) {
                if (typeof flags === "undefined") { flags = 0 /* Empty */; }
                if (typeof visitorFlags === "undefined") { visitorFlags = 0 /* None */; }
                var frameStack;
                var frame;
                var frameContainer;
                var frontToBack = visitorFlags & 8 /* FrontToBack */;
                frameStack = [this];
                var transformStack;
                var calculateTransform = !!transform;
                if (calculateTransform) {
                    transformStack = [transform.clone()];
                }
                var flagsStack = [flags];
                while (frameStack.length > 0) {
                    frame = frameStack.pop();
                    if (calculateTransform) {
                        transform = transformStack.pop();
                    }
                    flags = flagsStack.pop() | frame._flags;
                    var result = visitor(frame, transform, flags);
                    if (result === 0 /* Continue */) {
                        if (frame instanceof GFX.FrameContainer) {
                            frameContainer = frame;
                            var length = frameContainer._children.length;
                            if (visitorFlags & 16 /* Clips */ && !GFX.disableClipping.value) {
                                var leaveClip = frameContainer.gatherLeaveClipEvents();

                                for (var i = length - 1; i >= 0; i--) {
                                    // Check to see if we have any clip leave events that we need to push into the |frameStack|?
                                    if (leaveClip && leaveClip[i]) {
                                        while (leaveClip[i].length) {
                                            var clipFrame = leaveClip[i].shift();
                                            frameStack.push(clipFrame);
                                            flagsStack.push(8192 /* LeaveClip */);
                                            if (calculateTransform) {
                                                var t = transform.clone();
                                                t.preMultiply(clipFrame.matrix);
                                                transformStack.push(t);
                                            }
                                        }
                                    }
                                    var child = frameContainer._children[i];
                                    release || assert(child);
                                    frameStack.push(child);
                                    if (calculateTransform) {
                                        var t = transform.clone();
                                        t.preMultiply(child.matrix);
                                        transformStack.push(t);
                                    }
                                    if (child.clip >= 0) {
                                        flagsStack.push(flags | 4096 /* EnterClip */);
                                    } else {
                                        flagsStack.push(flags);
                                    }
                                }
                            } else {
                                for (var i = 0; i < length; i++) {
                                    var child = frameContainer._children[frontToBack ? i : length - 1 - i];
                                    if (!child) {
                                        continue;
                                    }
                                    frameStack.push(child);
                                    if (calculateTransform) {
                                        var t = transform.clone();
                                        t.preMultiply(child.matrix);
                                        transformStack.push(t);
                                    }
                                    flagsStack.push(flags);
                                }
                            }
                        }
                    } else if (result === 1 /* Stop */) {
                        return;
                    }
                }
            };

            Frame.prototype.getDepth = function () {
                var depth = 0;
                var frame = this;
                while (frame._parent) {
                    depth++;
                    frame = frame._parent;
                }
                return depth;
            };


            Object.defineProperty(Frame.prototype, "smoothing", {
                get: function () {
                    return this._smoothing;
                },
                set: function (value) {
                    this._smoothing = value;
                    this.invalidate();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Frame.prototype, "pixelSnapping", {
                get: function () {
                    return this._pixelSnapping;
                },
                set: function (value) {
                    this._pixelSnapping = value;
                    this.invalidate();
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Returns a list of frames whose bounds intersect the query point. The frames
            * are returned front to back. By default, only the first frame that intersects
            * the query point is returned, unless the |multiple| argument is specified.
            */
            Frame.prototype.queryFramesByPoint = function (query, multiple, includeFrameContainers) {
                if (typeof multiple === "undefined") { multiple = false; }
                if (typeof includeFrameContainers === "undefined") { includeFrameContainers = false; }
                var inverseTransform = Matrix.createIdentity();
                var local = Point.createEmpty();
                var frames = [];
                this.visit(function (frame, transform, flags) {
                    if (flags & 16 /* IgnoreQuery */) {
                        return 2 /* Skip */;
                    }
                    transform.inverse(inverseTransform);
                    local.set(query);
                    inverseTransform.transformPoint(local);
                    if (frame.getBounds().containsPoint(local)) {
                        if (frame instanceof GFX.FrameContainer) {
                            if (includeFrameContainers) {
                                frames.push(frame);
                                if (!multiple) {
                                    return 1 /* Stop */;
                                }
                            }
                            return 0 /* Continue */;
                        } else {
                            frames.push(frame);
                            if (!multiple) {
                                return 1 /* Stop */;
                            }
                        }
                        return 0 /* Continue */;
                    } else {
                        return 2 /* Skip */;
                    }
                }, Matrix.createIdentity(), 0 /* Empty */);

                /*
                *  We can't simply do a back to front traversal here because the order in which we
                *  visit frame containers would make it hard to compute the correct front-to-back
                *  order.
                *
                *       A
                *      / \
                *     /   \
                *    B     E
                *   / \   / \
                *  C   D F   G
                *
                *  The front-to-back order is [A, E, G, F, B, D, C], if G and D are both hit, then the hit order
                *  would be computed as [A, E, G, B, D] when clearly it should be [G, E, D, B, A]. If we walk
                *  the tree in back-to-front order [A, B, C, D, E, F, G] the hit order becomes [A, B, D, E, G]
                *  which we can simply reverse.
                */
                frames.reverse();
                return frames;
            };
            Frame._path = [];

            Frame._nextID = 0;
            return Frame;
        })();
        GFX.Frame = Frame;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
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
    (function (GFX) {
        var Rectangle = GFX.Geometry.Rectangle;

        var assert = Shumway.Debug.assert;

        var FrameContainer = (function (_super) {
            __extends(FrameContainer, _super);
            function FrameContainer() {
                _super.call(this);
                this._children = [];
            }
            FrameContainer.prototype.addChild = function (child) {
                this.checkCapability(32 /* AllowChildrenWrite */);
                if (child) {
                    child._parent = this;
                    child._invalidatePosition();
                }
                this._children.push(child);
                return child;
            };

            FrameContainer.prototype.addChildAt = function (child, index) {
                this.checkCapability(32 /* AllowChildrenWrite */);
                release || assert(index >= 0 && index <= this._children.length);
                if (index === this._children.length) {
                    this._children.push(child);
                } else {
                    this._children.splice(index, 0, child);
                }
                if (child) {
                    child._parent = this;
                    child._invalidatePosition();
                }
                return child;
            };

            FrameContainer.prototype.removeChild = function (child) {
                this.checkCapability(32 /* AllowChildrenWrite */);
                if (child._parent === this) {
                    var index = this._children.indexOf(child);
                    this.removeChildAt(index);
                }
            };

            FrameContainer.prototype.removeChildAt = function (index) {
                this.checkCapability(32 /* AllowChildrenWrite */);
                release || assert(index >= 0 && index < this._children.length);
                var result = this._children.splice(index, 1);
                var child = result[0];
                if (!child) {
                    return;
                }
                child._parent = undefined;
                child._invalidatePosition();
            };

            FrameContainer.prototype.clearChildren = function () {
                this.checkCapability(32 /* AllowChildrenWrite */);
                for (var i = 0; i < this._children.length; i++) {
                    var child = this._children[i];
                    if (child) {
                        child._invalidatePosition();
                        // child.gatherPreviousDirtyRegions();
                    }
                }
                this._children.length = 0;
            };

            /**
            * Propagates flags down the frame tree. Propagation stops if all flags are already set.
            */
            FrameContainer.prototype._propagateFlagsDown = function (flags) {
                if (this._hasFlags(flags)) {
                    return;
                }
                this._setFlags(flags);
                var children = this._children;
                for (var i = 0; i < children.length; i++) {
                    children[i]._propagateFlagsDown(flags);
                }
            };

            FrameContainer.prototype.getBounds = function () {
                if (!this._hasFlags(32 /* InvalidBounds */)) {
                    return this._bounds;
                }
                var bounds = Rectangle.createEmpty();
                for (var i = 0; i < this._children.length; i++) {
                    var child = this._children[i];
                    var childBounds = child.getBounds().clone();
                    child.matrix.transformRectangleAABB(childBounds);
                    bounds.union(childBounds);
                }
                this._bounds = bounds;
                this._removeFlags(32 /* InvalidBounds */);
                return bounds;
            };

            /**
            * Returns an array that marks leave clip events.
            *
            * i:  0  1  2  3  4  5  6  7  8  9
            * A:  ---[--------------------]---
            * B:  ------[-----------------]---
            * C:  ---------[-----------]------
            * D:  ---------------|------------
            *
            * In this example, frame A is at index 1 and has a clip value of 7 meaning it clips the next 7 frames in its container, frame B
            * at index 2 has a clip value of 6 and frame C at index 3 has a clip value of 4. The frame visitor needs to know when clips end
            * and start so here we collect all clip leave events. Clip start events are easier to identify, just check the clip value. Also
            * no more than one clip region starts at a given index, this is not true of clip ends.
            *
            * Here we return the sparse array: [8: [A, B], 7: [C], 5: [D]].
            */
            FrameContainer.prototype.gatherLeaveClipEvents = function () {
                var length = this._children.length;
                var leaveClip = null;
                for (var i = 0; i < length; i++) {
                    var child = this._children[i];
                    if (child.clip >= 0) {
                        var clipLeaveIndex = i + child.clip;
                        leaveClip = leaveClip || [];
                        if (!leaveClip[clipLeaveIndex]) {
                            leaveClip[clipLeaveIndex] = [];
                        }
                        leaveClip[clipLeaveIndex].push(child);
                    }
                }
                return leaveClip;
            };
            return FrameContainer;
        })(GFX.Frame);
        GFX.FrameContainer = FrameContainer;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
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
    (function (GFX) {
        var Rectangle = GFX.Geometry.Rectangle;

        var DirtyRegion = GFX.Geometry.DirtyRegion;

        var assert = Shumway.Debug.assert;

        (function (BlendMode) {
            BlendMode[BlendMode["Normal"] = 1] = "Normal";
            BlendMode[BlendMode["Layer"] = 2] = "Layer";
            BlendMode[BlendMode["Multiply"] = 3] = "Multiply";
            BlendMode[BlendMode["Screen"] = 4] = "Screen";
            BlendMode[BlendMode["Lighten"] = 5] = "Lighten";
            BlendMode[BlendMode["Darken"] = 6] = "Darken";
            BlendMode[BlendMode["Difference"] = 7] = "Difference";
            BlendMode[BlendMode["Add"] = 8] = "Add";
            BlendMode[BlendMode["Subtract"] = 9] = "Subtract";
            BlendMode[BlendMode["Invert"] = 10] = "Invert";
            BlendMode[BlendMode["Alpha"] = 11] = "Alpha";
            BlendMode[BlendMode["Erase"] = 12] = "Erase";
            BlendMode[BlendMode["Overlay"] = 13] = "Overlay";
            BlendMode[BlendMode["HardLight"] = 14] = "HardLight";
        })(GFX.BlendMode || (GFX.BlendMode = {}));
        var BlendMode = GFX.BlendMode;

        /**
        * Controls how the visitor walks the display tree.
        */
        (function (VisitorFlags) {
            VisitorFlags[VisitorFlags["None"] = 0] = "None";

            /**
            * Continue with normal traversal.
            */
            VisitorFlags[VisitorFlags["Continue"] = 0] = "Continue";

            /**
            * Not used yet, should probably just stop the visitor.
            */
            VisitorFlags[VisitorFlags["Stop"] = 1] = "Stop";

            /**
            * Skip processing current frame.
            */
            VisitorFlags[VisitorFlags["Skip"] = 2] = "Skip";

            /**
            * Visit front to back.
            */
            VisitorFlags[VisitorFlags["FrontToBack"] = 8] = "FrontToBack";

            /**
            * Visit clip leave events.
            */
            VisitorFlags[VisitorFlags["Clips"] = 16] = "Clips";
        })(GFX.VisitorFlags || (GFX.VisitorFlags = {}));
        var VisitorFlags = GFX.VisitorFlags;

        function getRandomIntInclusive(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        var StageRendererOptions = (function () {
            function StageRendererOptions() {
                this.debug = false;
                this.paintRenderable = true;
                this.paintBounds = false;
                this.paintFlashing = false;
                this.paintViewport = false;
            }
            return StageRendererOptions;
        })();
        GFX.StageRendererOptions = StageRendererOptions;

        (function (Backend) {
            Backend[Backend["Canvas2D"] = 0] = "Canvas2D";
            Backend[Backend["WebGL"] = 1] = "WebGL";
            Backend[Backend["Both"] = 2] = "Both";
            Backend[Backend["DOM"] = 3] = "DOM";
            Backend[Backend["SVG"] = 4] = "SVG";
        })(GFX.Backend || (GFX.Backend = {}));
        var Backend = GFX.Backend;

        var StageRenderer = (function () {
            function StageRenderer(canvas, stage, options) {
                this._canvas = canvas;
                this._stage = stage;
                this._options = options;
                this._viewport = Rectangle.createSquare(1024);
            }
            Object.defineProperty(StageRenderer.prototype, "viewport", {
                set: function (viewport) {
                    this._viewport.set(viewport);
                },
                enumerable: true,
                configurable: true
            });

            StageRenderer.prototype.render = function () {
            };

            /**
            * Notify renderer that the viewport has changed.
            */
            StageRenderer.prototype.resize = function () {
            };
            return StageRenderer;
        })();
        GFX.StageRenderer = StageRenderer;

        var Stage = (function (_super) {
            __extends(Stage, _super);
            function Stage(w, h, trackDirtyRegions) {
                if (typeof trackDirtyRegions === "undefined") { trackDirtyRegions = false; }
                _super.call(this);
                this.w = w;
                this.h = h;
                this.dirtyRegion = new DirtyRegion(w, h);
                this.trackDirtyRegions = trackDirtyRegions;
                this._setFlags(1 /* Dirty */);
            }
            /**
            * Checks to see if we should render and if so, clears any relevant dirty flags. Returns
            * true if rendering should commence. Flag clearing is made optional here in case there
            * is any code that needs to check if rendering is about to happen.
            */
            Stage.prototype.readyToRender = function (clearFlags) {
                if (typeof clearFlags === "undefined") { clearFlags = true; }
                if (!this._hasFlags(512 /* InvalidPaint */)) {
                    return false;
                } else if (clearFlags) {
                    GFX.enterTimeline("readyToRender");
                    this.visit(function (frame) {
                        if (frame._hasFlags(512 /* InvalidPaint */)) {
                            frame._toggleFlags(512 /* InvalidPaint */, false);
                            return 0 /* Continue */;
                        } else {
                            return 2 /* Skip */;
                        }
                    });
                    GFX.leaveTimeline();
                }
                return true;
            };

            Stage.prototype.gatherMarkedDirtyRegions = function (transform) {
                var self = this;

                // Find all invalid frames.
                this.visit(function (frame, transform, flags) {
                    frame._removeFlags(1 /* Dirty */);
                    if (frame instanceof GFX.FrameContainer) {
                        return 0 /* Continue */;
                    }
                    if (flags & 1 /* Dirty */) {
                        var rectangle = frame.getBounds().clone();
                        transform.transformRectangleAABB(rectangle);
                        self.dirtyRegion.addDirtyRectangle(rectangle);
                        if (frame._previouslyRenderedAABB) {
                            // Add last render position to dirty list.
                            self.dirtyRegion.addDirtyRectangle(frame._previouslyRenderedAABB);
                        }
                    }
                    return 0 /* Continue */;
                }, transform, 0 /* Empty */);
            };

            Stage.prototype.gatherFrames = function () {
                var frames = [];
                this.visit(function (frame, transform) {
                    if (!(frame instanceof GFX.FrameContainer)) {
                        frames.push(frame);
                    }
                    return 0 /* Continue */;
                }, this.matrix);
                return frames;
            };

            Stage.prototype.gatherLayers = function () {
                var layers = [];
                var currentLayer;
                this.visit(function (frame, transform) {
                    if (frame instanceof GFX.FrameContainer) {
                        return 0 /* Continue */;
                    }
                    var rectangle = frame.getBounds().clone();
                    transform.transformRectangleAABB(rectangle);
                    if (frame._hasFlags(1 /* Dirty */)) {
                        if (currentLayer) {
                            layers.push(currentLayer);
                        }
                        layers.push(rectangle.clone());
                        currentLayer = null;
                    } else {
                        if (!currentLayer) {
                            currentLayer = rectangle.clone();
                        } else {
                            currentLayer.union(rectangle);
                        }
                    }
                    return 0 /* Continue */;
                }, this.matrix);

                if (currentLayer) {
                    layers.push(currentLayer);
                }

                return layers;
            };
            return Stage;
        })(GFX.FrameContainer);
        GFX.Stage = Stage;

        /**
        * A frame container that clips everything outside of its bounds.
        */
        var ClipRectangle = (function (_super) {
            __extends(ClipRectangle, _super);
            function ClipRectangle(w, h) {
                _super.call(this);
                this.color = Shumway.Color.None;
                this._bounds = new Rectangle(0, 0, w, h);
            }
            ClipRectangle.prototype.setBounds = function (bounds) {
                this._bounds.set(bounds);
            };

            ClipRectangle.prototype.getBounds = function () {
                return this._bounds;
            };
            return ClipRectangle;
        })(GFX.FrameContainer);
        GFX.ClipRectangle = ClipRectangle;

        var Shape = (function (_super) {
            __extends(Shape, _super);
            function Shape(source) {
                _super.call(this);
                release || assert(source);
                this._source = source;
            }
            Object.defineProperty(Shape.prototype, "source", {
                get: function () {
                    return this._source;
                },
                enumerable: true,
                configurable: true
            });

            Shape.prototype.getBounds = function () {
                return this.source.getBounds();
            };
            return Shape;
        })(GFX.Frame);
        GFX.Shape = Shape;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
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
    (function (GFX) {
        var Rectangle = GFX.Geometry.Rectangle;
        var PathCommand = Shumway.PathCommand;
        var Matrix = GFX.Geometry.Matrix;

        var swap32 = Shumway.IntegerUtilities.swap32;
        var memorySizeToString = Shumway.StringUtilities.memorySizeToString;
        var assertUnreachable = Shumway.Debug.assertUnreachable;

        var tableLookupUnpremultiplyARGB = Shumway.ColorUtilities.tableLookupUnpremultiplyARGB;
        var assert = Shumway.Debug.assert;
        var unexpected = Shumway.Debug.unexpected;
        var notImplemented = Shumway.Debug.notImplemented;

        var indexOf = Shumway.ArrayUtilities.indexOf;

        (function (RenderableFlags) {
            RenderableFlags[RenderableFlags["None"] = 0] = "None";

            /**
            * Whether source has dynamic content.
            */
            RenderableFlags[RenderableFlags["Dynamic"] = 1] = "Dynamic";

            /**
            * Whether the source's dynamic content has changed. This is only defined if |isDynamic| is true.
            */
            RenderableFlags[RenderableFlags["Dirty"] = 2] = "Dirty";

            /**
            * Whether the source's content can be scaled and drawn at a higher resolution.
            */
            RenderableFlags[RenderableFlags["Scalable"] = 4] = "Scalable";

            /**
            * Whether the source's content should be tiled.
            */
            RenderableFlags[RenderableFlags["Tileable"] = 8] = "Tileable";

            /**
            * Whether the source's content is loading and thus not available yet. Once loading
            * is complete this flag is cleared and the |Dirty| flag is set.
            */
            RenderableFlags[RenderableFlags["Loading"] = 16] = "Loading";
        })(GFX.RenderableFlags || (GFX.RenderableFlags = {}));
        var RenderableFlags = GFX.RenderableFlags;

        /**
        * Represents some source renderable content.
        */
        var Renderable = (function () {
            function Renderable(bounds) {
                /**
                * Flags
                */
                this._flags = 0 /* None */;
                /**
                * Property bag used to attach dynamic properties to this object.
                */
                this.properties = {};
                /**
                * Back reference to frames that use this renderable.
                */
                this._frameReferrers = [];
                /**
                * Back reference to renderables that use this renderable.
                */
                this._renderableReferrers = [];
                this._bounds = bounds.clone();
            }
            Renderable.prototype.setFlags = function (flags) {
                this._flags |= flags;
            };

            Renderable.prototype.hasFlags = function (flags) {
                return (this._flags & flags) === flags;
            };

            Renderable.prototype.removeFlags = function (flags) {
                this._flags &= ~flags;
            };

            Renderable.prototype.addFrameReferrer = function (frame) {
                release && assert(frame);
                var index = indexOf(this._frameReferrers, frame);
                release && assert(index < 0);
                this._frameReferrers.push(frame);
            };

            Renderable.prototype.addRenderableReferrer = function (renderable) {
                release && assert(renderable);
                var index = indexOf(this._renderableReferrers, renderable);
                release && assert(index < 0);
                this._renderableReferrers.push(renderable);
            };

            Renderable.prototype.invalidatePaint = function () {
                this.setFlags(2 /* Dirty */);
                var frames = this._frameReferrers;
                for (var i = 0; i < frames.length; i++) {
                    frames[i].invalidatePaint();
                }
                var renderables = this._renderableReferrers;
                for (var i = 0; i < renderables.length; i++) {
                    renderables[i].invalidatePaint();
                }
            };

            /**
            * Bounds of the source content. This should never change.
            */
            Renderable.prototype.getBounds = function () {
                return this._bounds;
            };

            /**
            * Render source content in the specified |context|. If specified, the rectangular |cullBounds| can be used to cull parts of the shape
            * for better performance. If specified, |
            * Region| indicates whether the shape's fills should be used as clip regions instead.
            */
            Renderable.prototype.render = function (context, cullBounds, clipRegion) {
            };
            return Renderable;
        })();
        GFX.Renderable = Renderable;

        var CustomRenderable = (function (_super) {
            __extends(CustomRenderable, _super);
            function CustomRenderable(bounds, render) {
                _super.call(this, bounds);
                this.render = render;
            }
            return CustomRenderable;
        })(Renderable);
        GFX.CustomRenderable = CustomRenderable;

        var RenderableBitmap = (function (_super) {
            __extends(RenderableBitmap, _super);
            function RenderableBitmap(canvas, bounds) {
                _super.call(this, bounds);
                this._flags = 1 /* Dynamic */ | 2 /* Dirty */;
                this.properties = {};
                this._canvas = canvas;
            }
            RenderableBitmap._convertImage = function (sourceFormat, targetFormat, source, target) {
                if (source !== target) {
                    release || assert(source.buffer !== target.buffer, "Can't handle overlapping views.");
                }
                if (sourceFormat === targetFormat) {
                    if (source === target) {
                        return;
                    }
                    var length = source.length;
                    for (var i = 0; i < length; i++) {
                        target[i] = source[i];
                    }
                    return;
                }
                GFX.enterTimeline("convertImage", Shumway.ImageType[sourceFormat] + " to " + Shumway.ImageType[targetFormat] + " (" + memorySizeToString(source.length));
                if (sourceFormat === 1 /* PremultipliedAlphaARGB */ && targetFormat === 3 /* StraightAlphaRGBA */) {
                    Shumway.ColorUtilities.ensureUnpremultiplyTable();
                    var length = source.length;
                    for (var i = 0; i < length; i++) {
                        var pARGB = swap32(source[i]);

                        // TODO: Make sure this is inlined!
                        var uARGB = tableLookupUnpremultiplyARGB(pARGB);
                        var uABGR = (uARGB & 0xFF00FF00) | (uARGB >> 16) & 0xff | (uARGB & 0xff) << 16;
                        target[i] = uABGR;
                    }
                } else if (sourceFormat === 2 /* StraightAlphaARGB */ && targetFormat === 3 /* StraightAlphaRGBA */) {
                    for (var i = 0; i < length; i++) {
                        target[i] = swap32(source[i]);
                    }
                } else {
                    notImplemented("Image Format Conversion: " + Shumway.ImageType[sourceFormat] + " -> " + Shumway.ImageType[targetFormat]);
                }
                GFX.leaveTimeline("convertImage");
            };

            RenderableBitmap.FromDataBuffer = function (type, dataBuffer, bounds) {
                GFX.enterTimeline("RenderableBitmap.FromDataBuffer");
                var canvas = document.createElement("canvas");
                canvas.width = bounds.w;
                canvas.height = bounds.h;
                var renderableBitmap = new RenderableBitmap(canvas, bounds);
                renderableBitmap.updateFromDataBuffer(type, dataBuffer);
                GFX.leaveTimeline("RenderableBitmap.FromDataBuffer");
                return renderableBitmap;
            };

            RenderableBitmap.FromFrame = function (source, matrix, colorMatrix, blendMode, clipRect) {
                GFX.enterTimeline("RenderableBitmap.FromFrame");
                var canvas = document.createElement("canvas");
                var bounds = source.getBounds();
                canvas.width = bounds.w;
                canvas.height = bounds.h;
                var renderableBitmap = new RenderableBitmap(canvas, bounds);
                renderableBitmap.drawFrame(source, matrix, colorMatrix, blendMode, clipRect);
                GFX.leaveTimeline("RenderableBitmap.FromFrame");
                return renderableBitmap;
            };

            RenderableBitmap.prototype.updateFromDataBuffer = function (type, dataBuffer) {
                if (!GFX.imageUpdateOption.value) {
                    return;
                }
                GFX.enterTimeline("RenderableBitmap.updateFromDataBuffer", this);
                var context = this._canvas.getContext("2d");
                if (type === 4 /* JPEG */ || type === 5 /* PNG */ || type === 6 /* GIF */) {
                    var self = this;
                    self.setFlags(16 /* Loading */);
                    var image = new Image();
                    image.src = URL.createObjectURL(dataBuffer.toBlob());
                    image.onload = function () {
                        context.drawImage(image, 0, 0);
                        self.removeFlags(16 /* Loading */);
                        self.invalidatePaint();
                    };
                    image.onerror = function () {
                        unexpected("Image loading error: " + Shumway.ImageType[type]);
                    };
                } else {
                    var imageData = context.createImageData(this._bounds.w, this._bounds.h);
                    RenderableBitmap._convertImage(type, 3 /* StraightAlphaRGBA */, new Int32Array(dataBuffer.buffer), new Int32Array(imageData.data.buffer));
                    GFX.enterTimeline("putImageData");
                    context.putImageData(imageData, 0, 0);
                    GFX.leaveTimeline("putImageData");
                }
                this.invalidatePaint();
                GFX.leaveTimeline("RenderableBitmap.updateFromDataBuffer");
            };

            RenderableBitmap.prototype.render = function (context, cullBounds) {
                GFX.enterTimeline("RenderableBitmap.render");
                if (this._canvas) {
                    context.drawImage(this._canvas, 0, 0);
                } else {
                    this._renderFallback(context);
                }
                GFX.leaveTimeline("RenderableBitmap.render");
            };

            RenderableBitmap.prototype.drawFrame = function (source, matrix, colorMatrix, blendMode, clipRect) {
                // TODO: Support colorMatrix and blendMode.
                GFX.enterTimeline("RenderableBitmap.drawFrame");

                // TODO: Hack to be able to compile this as part of gfx-base.
                var Canvas2D = GFX.Canvas2D;
                var bounds = this.getBounds();
                var options = new Canvas2D.Canvas2DStageRendererOptions();
                options.cacheShapes = true;
                var renderer = new Canvas2D.Canvas2DStageRenderer(this._canvas, null, options);
                renderer.renderFrame(source, clipRect || bounds, matrix);
                GFX.leaveTimeline("RenderableBitmap.drawFrame");
            };

            RenderableBitmap.prototype._renderFallback = function (context) {
                if (!this.fillStyle) {
                    this.fillStyle = Shumway.ColorStyle.randomStyle();
                }
                var bounds = this._bounds;
                context.save();
                context.beginPath();
                context.lineWidth = 2;
                context.fillStyle = this.fillStyle;
                context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
                context.restore();
            };
            return RenderableBitmap;
        })(Renderable);
        GFX.RenderableBitmap = RenderableBitmap;

        var PathType;
        (function (PathType) {
            PathType[PathType["Fill"] = 0] = "Fill";
            PathType[PathType["Stroke"] = 1] = "Stroke";
            PathType[PathType["StrokeFill"] = 2] = "StrokeFill";
        })(PathType || (PathType = {}));

        var StyledPath = (function () {
            function StyledPath(type, style, strokeProperties) {
                this.type = type;
                this.style = style;
                this.strokeProperties = strokeProperties;
                this.path = new Path2D();
                release || assert((type === 1 /* Stroke */) === !!strokeProperties);
            }
            return StyledPath;
        })();

        var StrokeProperties = (function () {
            function StrokeProperties(thickness, capsStyle, jointsStyle, miterLimit) {
                this.thickness = thickness;
                this.capsStyle = capsStyle;
                this.jointsStyle = jointsStyle;
                this.miterLimit = miterLimit;
            }
            return StrokeProperties;
        })();

        var RenderableShape = (function (_super) {
            __extends(RenderableShape, _super);
            function RenderableShape(id, pathData, textures, bounds) {
                _super.call(this, bounds);
                this._flags = 2 /* Dirty */ | 4 /* Scalable */ | 8 /* Tileable */;
                this.properties = {};
                this._id = id;
                this._pathData = pathData;
                this._textures = textures;
                if (textures.length) {
                    this.setFlags(1 /* Dynamic */);
                }
            }
            RenderableShape.prototype.getBounds = function () {
                return this._bounds;
            };

            /**
            * If |clipRegion| is |true| then we must call |clip| instead of |fill|. We also cannot call
            * |save| or |restore| because those functions reset the current clipping region. It looks
            * like Flash ignores strokes when clipping so we can also ignore stroke paths when computing
            * the clip region.
            */
            RenderableShape.prototype.render = function (context, cullBounds, clipRegion) {
                if (typeof clipRegion === "undefined") { clipRegion = false; }
                context.fillStyle = context.strokeStyle = 'transparent';

                // Wait to deserialize paths until all textures have been loaded.
                var textures = this._textures;
                for (var i = 0; i < textures.length; i++) {
                    if (textures[i].hasFlags(16 /* Loading */)) {
                        return;
                    }
                }

                var data = this._pathData;
                if (data) {
                    this._deserializePaths(data, context);
                }

                var paths = this._paths;
                release || assert(paths);

                GFX.enterTimeline("RenderableShape.render", this);
                for (var i = 0; i < paths.length; i++) {
                    var path = paths[i];
                    if (path.type === 0 /* Fill */) {
                        context.fillStyle = path.style;
                        clipRegion ? context.clip(path.path, 'evenodd') : context.fill(path.path, 'evenodd');
                        context.fillStyle = 'transparent';
                    } else if (!clipRegion) {
                        context.strokeStyle = path.style;
                        if (path.strokeProperties) {
                            context.lineWidth = path.strokeProperties.thickness;
                            context.lineCap = path.strokeProperties.capsStyle;
                            context.lineJoin = path.strokeProperties.jointsStyle;
                            context.miterLimit = path.strokeProperties.miterLimit;
                        }

                        // Special-cases 1px and 3px lines by moving the drawing position down/right by 0.5px.
                        // Flash apparently does this to create sharp, non-aliased lines in the normal case of thin
                        // lines drawn on round pixel values.
                        // Our handling doesn't always create the same results: for drawing coordinates with
                        // fractional values, Flash draws blurry lines. We do, too, but we still move the line
                        // down/right. Flash does something slightly different, with the result that a line drawn
                        // on coordinates slightly below round pixels (0.8, say) will be moved up/left.
                        // Properly fixing this would probably have to happen in the rasterizer. Or when replaying
                        // all the drawing commands, which seems expensive.
                        var lineWidth = context.lineWidth;
                        var isSpecialCaseWidth = lineWidth === 1 || lineWidth === 3;
                        if (isSpecialCaseWidth) {
                            context.translate(0.5, 0.5);
                        }
                        context.stroke(path.path);
                        if (isSpecialCaseWidth) {
                            context.translate(-0.5, -0.5);
                        }
                        context.strokeStyle = 'transparent';
                    }
                }
                GFX.leaveTimeline("RenderableShape.render");
            };

            RenderableShape.prototype._deserializePaths = function (data, context) {
                release || assert(!this._paths);
                GFX.enterTimeline("RenderableShape.deserializePaths");

                // TODO: Optimize path handling to use only one path if possible.
                // If both line and fill style are set at the same time, we don't need to duplicate the
                // geometry.
                this._paths = [];

                var fillPath = null;
                var strokePath = null;

                // We have to alway store the last position because Flash keeps the drawing cursor where it
                // was when changing fill or line style, whereas Canvas forgets it on beginning a new path.
                var x = 0;
                var y = 0;
                var cpX;
                var cpY;
                var formOpen = false;
                var formOpenX = 0;
                var formOpenY = 0;
                var commands = data.commands;
                var coordinates = data.coordinates;
                var styles = data.styles;
                styles.position = 0;
                var coordinatesIndex = 0;
                var commandsCount = data.commandsPosition;

                for (var commandIndex = 0; commandIndex < commandsCount; commandIndex++) {
                    var command = commands[commandIndex];
                    switch (command) {
                        case 9 /* MoveTo */:
                            release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                            if (formOpen && fillPath) {
                                fillPath.lineTo(formOpenX, formOpenY);
                                strokePath && strokePath.lineTo(formOpenX, formOpenY);
                            }
                            formOpen = true;
                            x = formOpenX = coordinates[coordinatesIndex++] / 20;
                            y = formOpenY = coordinates[coordinatesIndex++] / 20;
                            fillPath && fillPath.moveTo(x, y);
                            strokePath && strokePath.moveTo(x, y);
                            break;
                        case 10 /* LineTo */:
                            release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                            x = coordinates[coordinatesIndex++] / 20;
                            y = coordinates[coordinatesIndex++] / 20;
                            fillPath && fillPath.lineTo(x, y);
                            strokePath && strokePath.lineTo(x, y);
                            break;
                        case 11 /* CurveTo */:
                            release || assert(coordinatesIndex <= data.coordinatesPosition - 4);
                            cpX = coordinates[coordinatesIndex++] / 20;
                            cpY = coordinates[coordinatesIndex++] / 20;
                            x = coordinates[coordinatesIndex++] / 20;
                            y = coordinates[coordinatesIndex++] / 20;
                            fillPath && fillPath.quadraticCurveTo(cpX, cpY, x, y);
                            strokePath && strokePath.quadraticCurveTo(cpX, cpY, x, y);
                            break;
                        case 12 /* CubicCurveTo */:
                            release || assert(coordinatesIndex <= data.coordinatesPosition - 6);
                            cpX = coordinates[coordinatesIndex++] / 20;
                            cpY = coordinates[coordinatesIndex++] / 20;
                            var cpX2 = coordinates[coordinatesIndex++] / 20;
                            var cpY2 = coordinates[coordinatesIndex++] / 20;
                            x = coordinates[coordinatesIndex++] / 20;
                            y = coordinates[coordinatesIndex++] / 20;
                            fillPath && fillPath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
                            strokePath && strokePath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
                            break;
                        case 1 /* BeginSolidFill */:
                            release || assert(styles.bytesAvailable >= 4);
                            fillPath = this._createPath(0 /* Fill */, Shumway.ColorUtilities.rgbaToCSSStyle(styles.readUnsignedInt()), null, x, y);
                            break;
                        case 3 /* BeginBitmapFill */:
                            fillPath = this._createPath(0 /* Fill */, this._readBitmap(styles, context), null, x, y);
                            break;
                        case 2 /* BeginGradientFill */:
                            fillPath = this._createPath(0 /* Fill */, this._readGradient(styles, context), null, x, y);
                            break;
                        case 4 /* EndFill */:
                            fillPath = null;
                            break;
                        case 5 /* LineStyleSolid */:
                            var color = Shumway.ColorUtilities.rgbaToCSSStyle(styles.readUnsignedInt());

                            // Skip pixel hinting and scale mode for now.
                            styles.position += 2;
                            var capsStyle = RenderableShape.LINE_CAPS_STYLES[styles.readByte()];
                            var jointsStyle = RenderableShape.LINE_JOINTS_STYLES[styles.readByte()];
                            var strokeProperties = new StrokeProperties(coordinates[coordinatesIndex++] / 20, capsStyle, jointsStyle, styles.readByte());
                            strokePath = this._createPath(1 /* Stroke */, color, strokeProperties, x, y);
                            break;
                        case 6 /* LineStyleGradient */:
                            strokePath = this._createPath(2 /* StrokeFill */, this._readGradient(styles, context), null, x, y);
                            break;
                        case 7 /* LineStyleBitmap */:
                            strokePath = this._createPath(2 /* StrokeFill */, this._readBitmap(styles, context), null, x, y);
                            break;
                        case 8 /* LineEnd */:
                            strokePath = null;
                            break;
                        default:
                            release || assertUnreachable('Invalid command ' + command + ' encountered at index' + commandIndex + ' of ' + commandsCount);
                    }
                }
                release || assert(styles.bytesAvailable === 0);
                release || assert(commandIndex === commandsCount);
                release || assert(coordinatesIndex === data.coordinatesPosition);
                if (formOpen && fillPath) {
                    fillPath.lineTo(formOpenX, formOpenY);
                    strokePath && strokePath.lineTo(formOpenX, formOpenY);
                }
                this._pathData = null;
                GFX.leaveTimeline("RenderableShape.deserializePaths");
            };

            RenderableShape.prototype._createPath = function (type, style, strokeProperties, x, y) {
                var path = new StyledPath(type, style, strokeProperties);
                this._paths.push(path);
                path.path.moveTo(x, y);
                return path.path;
            };

            RenderableShape.prototype._readMatrix = function (data) {
                return new Matrix(data.readFloat(), data.readFloat(), data.readFloat(), data.readFloat(), data.readFloat(), data.readFloat());
            };

            RenderableShape.prototype._readGradient = function (styles, context) {
                // Assert at least one color stop.
                release || assert(styles.bytesAvailable >= 1 + 1 + 6 * 4 + 1 + 1 + 4 + 1 + 1);
                var gradientType = styles.readUnsignedByte();
                var focalPoint = styles.readShort() * 2 / 0xff;
                release || assert(focalPoint >= -1 && focalPoint <= 1);
                var transform = this._readMatrix(styles);

                // This effectively applies the matrix to the line the gradient is drawn along:
                var x1 = transform.tx - transform.a;
                var y1 = transform.ty - transform.b;
                var x2 = transform.tx + transform.a;
                var y2 = transform.ty + transform.b;

                var gradient = gradientType === 16 /* Linear */ ? context.createLinearGradient(x1, y1, x2, y2) : context.createRadialGradient(focalPoint, 0, 0, 0, 0, 1);
                gradient.setTransform && gradient.setTransform(transform.toSVGMatrix());
                var colorStopsCount = styles.readUnsignedByte();
                for (var i = 0; i < colorStopsCount; i++) {
                    var ratio = styles.readUnsignedByte() / 0xff;
                    var cssColor = Shumway.ColorUtilities.rgbaToCSSStyle(styles.readUnsignedInt());
                    gradient.addColorStop(ratio, cssColor);
                }

                // Skip spread and interpolation modes for now.
                styles.position += 2;

                return gradient;
            };

            RenderableShape.prototype._readBitmap = function (styles, context) {
                release || assert(styles.bytesAvailable >= 4 + 6 * 4 + 1 + 1);
                var textureIndex = styles.readUnsignedInt();
                var fillTransform = this._readMatrix(styles);
                var repeat = styles.readBoolean() ? 'repeat' : 'no-repeat';
                var smooth = styles.readBoolean();
                var texture = this._textures[textureIndex];
                release || assert(texture._canvas);
                var fillStyle = context.createPattern(texture._canvas, repeat);
                fillStyle.setTransform(fillTransform.toSVGMatrix());

                // TODO: make it possible to set smoothing for fills but not strokes and vice-versa.
                context['mozImageSmoothingEnabled'] = context.msImageSmoothingEnabled = context['imageSmoothingEnabled'] = smooth;
                return fillStyle;
            };

            RenderableShape.prototype._renderFallback = function (context) {
                if (!this.fillStyle) {
                    this.fillStyle = Shumway.ColorStyle.randomStyle();
                }
                var bounds = this._bounds;
                context.save();
                context.beginPath();
                context.lineWidth = 2;
                context.fillStyle = this.fillStyle;
                context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);

                //      context.textBaseline = "top";
                //      context.fillStyle = "white";
                //      context.fillText(String(id), bounds.x, bounds.y);
                context.restore();
            };
            RenderableShape.LINE_CAPS_STYLES = ['round', 'butt', 'square'];
            RenderableShape.LINE_JOINTS_STYLES = ['round', 'bevel', 'miter'];
            return RenderableShape;
        })(Renderable);
        GFX.RenderableShape = RenderableShape;

        var TextLine = (function () {
            function TextLine() {
                this.x = 0;
                this.y = 0;
                this.width = 0;
                this.ascent = 0;
                this.descent = 0;
                this.leading = 0;
                this.align = 0;
                this.runs = [];
            }
            TextLine.prototype.addRun = function (font, fillStyle, text, underline) {
                if (text) {
                    TextLine._measureContext.font = font;
                    var width = TextLine._measureContext.measureText(text).width | 0;
                    this.runs.push(new TextRun(font, fillStyle, text, width, underline));
                    this.width += width;
                }
            };

            TextLine.prototype.wrap = function (maxWidth) {
                var lines = [this];
                var runs = this.runs;

                var currentLine = this;
                currentLine.width = 0;
                currentLine.runs = [];

                var measureContext = TextLine._measureContext;

                for (var i = 0; i < runs.length; i++) {
                    var run = runs[i];
                    var text = run.text;
                    run.text = '';
                    run.width = 0;
                    measureContext.font = run.font;
                    var spaceLeft = maxWidth;
                    var words = text.split(/[\s.-]/);
                    var offset = 0;
                    for (var j = 0; j < words.length; j++) {
                        var word = words[j];
                        var chunk = text.substr(offset, word.length + 1);
                        var wordWidth = measureContext.measureText(chunk).width | 0;
                        if (wordWidth > spaceLeft) {
                            do {
                                currentLine.runs.push(run);
                                currentLine.width += run.width;
                                run = new TextRun(run.font, run.fillStyle, '', 0, run.underline);
                                var newLine = new TextLine();
                                newLine.y = (currentLine.y + currentLine.descent + currentLine.leading + currentLine.ascent) | 0;
                                newLine.ascent = currentLine.ascent;
                                newLine.descent = currentLine.descent;
                                newLine.leading = currentLine.leading;
                                newLine.align = currentLine.align;
                                lines.push(newLine);
                                currentLine = newLine;
                                spaceLeft = maxWidth - wordWidth;
                                if (spaceLeft < 0) {
                                    var k = chunk.length;
                                    var t;
                                    var w;
                                    do {
                                        k--;
                                        t = chunk.substr(0, k);
                                        w = measureContext.measureText(t).width | 0;
                                    } while(w > maxWidth);
                                    run.text = t;
                                    run.width = w;
                                    chunk = chunk.substr(k);
                                    wordWidth = measureContext.measureText(chunk).width | 0;
                                }
                            } while(spaceLeft < 0);
                        } else {
                            spaceLeft = spaceLeft - wordWidth;
                        }
                        run.text += chunk;
                        run.width += wordWidth;
                        offset += word.length + 1;
                    }
                    currentLine.runs.push(run);
                    currentLine.width += run.width;
                }

                return lines;
            };
            TextLine._measureContext = document.createElement('canvas').getContext('2d');
            return TextLine;
        })();
        GFX.TextLine = TextLine;

        var TextRun = (function () {
            function TextRun(font, fillStyle, text, width, underline) {
                if (typeof font === "undefined") { font = ''; }
                if (typeof fillStyle === "undefined") { fillStyle = ''; }
                if (typeof text === "undefined") { text = ''; }
                if (typeof width === "undefined") { width = 0; }
                if (typeof underline === "undefined") { underline = false; }
                this.font = font;
                this.fillStyle = fillStyle;
                this.text = text;
                this.width = width;
                this.underline = underline;
            }
            return TextRun;
        })();
        GFX.TextRun = TextRun;

        var RenderableText = (function (_super) {
            __extends(RenderableText, _super);
            function RenderableText(bounds) {
                _super.call(this, bounds);
                this._flags = 1 /* Dynamic */ | 2 /* Dirty */;
                this.properties = {};
                this._textBounds = bounds.clone();
                this._textRunData = null;
                this._plainText = '';
                this._backgroundColor = 0;
                this._borderColor = 0;
                this._matrix = null;
                this._coords = null;
                this.textRect = bounds.clone();
                this.lines = [];
            }
            RenderableText.prototype.setBounds = function (bounds) {
                this._bounds.copyFrom(bounds);
                this._textBounds.copyFrom(bounds);
                this.textRect.setElements(bounds.x + 2, bounds.y + 2, bounds.x - 2, bounds.x - 2);
            };

            RenderableText.prototype.setContent = function (plainText, textRunData, matrix, coords) {
                this._textRunData = textRunData;
                this._plainText = plainText;
                this._matrix = matrix;
                this._coords = coords;
                this.lines = [];
            };

            RenderableText.prototype.setStyle = function (backgroundColor, borderColor) {
                this._backgroundColor = backgroundColor;
                this._borderColor = borderColor;
            };

            RenderableText.prototype.reflow = function (autoSize, wordWrap) {
                var textRunData = this._textRunData;

                if (!textRunData) {
                    return;
                }

                var bounds = this._bounds;
                var availableWidth = bounds.w - 4;
                var plainText = this._plainText;
                var lines = this.lines;

                var currentLine = new TextLine();
                var baseLinePos = 0;
                var maxWidth = 0;
                var maxAscent = 0;
                var maxDescent = 0;
                var maxLeading = 0;
                var firstAlign = -1;

                var finishLine = function () {
                    if (!currentLine.runs.length) {
                        baseLinePos += maxAscent + maxDescent + maxLeading;
                        return;
                    }

                    baseLinePos += maxAscent;
                    currentLine.y = baseLinePos | 0;
                    baseLinePos += maxDescent + maxLeading;
                    currentLine.ascent = maxAscent;
                    currentLine.descent = maxDescent;
                    currentLine.leading = maxLeading;
                    currentLine.align = firstAlign;

                    if (wordWrap && currentLine.width > availableWidth) {
                        var wrappedLines = currentLine.wrap(availableWidth);
                        for (var i = 0; i < wrappedLines.length; i++) {
                            var line = wrappedLines[i];
                            baseLinePos = line.y + line.descent + line.leading;
                            lines.push(line);
                            if (line.width > maxWidth) {
                                maxWidth = line.width;
                            }
                        }
                    } else {
                        lines.push(currentLine);
                        if (currentLine.width > maxWidth) {
                            maxWidth = currentLine.width;
                        }
                    }

                    currentLine = new TextLine();
                };

                GFX.enterTimeline("RenderableText.reflow");

                while (textRunData.position < textRunData.length) {
                    var beginIndex = textRunData.readInt();
                    var endIndex = textRunData.readInt();

                    var size = textRunData.readInt();
                    var fontId = textRunData.readInt();
                    var fontName;
                    if (fontId) {
                        fontName = 'swffont' + fontId;
                    } else {
                        fontName = textRunData.readUTF();
                    }

                    var ascent = textRunData.readInt();
                    var descent = textRunData.readInt();
                    var leading = textRunData.readInt();
                    if (ascent > maxAscent) {
                        maxAscent = ascent;
                    }
                    if (descent > maxDescent) {
                        maxDescent = descent;
                    }
                    if (leading > maxLeading) {
                        maxLeading = leading;
                    }

                    var bold = textRunData.readBoolean();
                    var italic = textRunData.readBoolean();
                    var boldItalic = '';
                    if (italic) {
                        boldItalic += 'italic';
                    }
                    if (bold) {
                        boldItalic += ' bold';
                    }
                    var font = boldItalic + ' ' + size + 'px ' + fontName;

                    var color = textRunData.readInt();
                    var fillStyle = Shumway.ColorUtilities.rgbToHex(color);

                    var align = textRunData.readInt();
                    if (firstAlign === -1) {
                        firstAlign = align;
                    }

                    var bullet = textRunData.readBoolean();

                    //var display = textRunData.readInt();
                    var indent = textRunData.readInt();

                    //var blockIndent = textRunData.readInt();
                    var kerning = textRunData.readInt();
                    var leftMargin = textRunData.readInt();
                    var letterSpacing = textRunData.readInt();
                    var rightMargin = textRunData.readInt();

                    //var tabStops = textRunData.readInt();
                    var underline = textRunData.readBoolean();

                    var text = '';
                    var eof = false;
                    for (var i = beginIndex; !eof; i++) {
                        var eof = i >= endIndex - 1;

                        var char = plainText[i];
                        if (char !== '\r' && char !== '\n') {
                            text += char;
                            if (i < plainText.length - 1) {
                                continue;
                            }
                        }
                        currentLine.addRun(font, fillStyle, text, underline);
                        finishLine();
                        text = '';

                        if (eof) {
                            maxAscent = 0;
                            maxDescent = 0;
                            maxLeading = 0;
                            firstAlign = -1;
                            break;
                        }

                        if (char === '\r' && plainText[i + 1] === '\n') {
                            i++;
                        }
                    }
                    currentLine.addRun(font, fillStyle, text, underline);
                }

                var rect = this.textRect;
                rect.w = maxWidth;
                rect.h = baseLinePos;

                if (autoSize) {
                    if (!wordWrap) {
                        availableWidth = maxWidth;
                        var width = bounds.w;
                        switch (autoSize) {
                            case 1:
                                rect.x = (width - (availableWidth + 4)) >> 1;
                                break;
                            case 2:
                                break;
                            case 3:
                                rect.x = width - (availableWidth + 4);
                                break;
                        }
                        this._textBounds.setElements(rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4);
                    }
                    bounds.h = baseLinePos + 4;
                } else {
                    this._textBounds = bounds;
                }

                var numLines = lines.length;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (line.width < availableWidth) {
                        switch (line.align) {
                            case 0:
                                break;
                            case 1:
                                line.x = (availableWidth - line.width) | 0;
                                break;
                            case 2:
                                line.x = ((availableWidth - line.width) / 2) | 0;
                                break;
                        }
                    }
                }

                this.invalidatePaint();
                GFX.leaveTimeline("RenderableText.reflow");
            };

            RenderableText.prototype.getBounds = function () {
                return this._bounds;
            };

            RenderableText.prototype.render = function (context) {
                GFX.enterTimeline("RenderableText.render");
                context.save();

                var rect = this._textBounds;
                if (this._backgroundColor) {
                    context.fillStyle = Shumway.ColorUtilities.rgbaToCSSStyle(this._backgroundColor);
                    context.fillRect(rect.x, rect.y, rect.w, rect.h);
                }
                if (this._borderColor) {
                    context.strokeStyle = Shumway.ColorUtilities.rgbaToCSSStyle(this._borderColor);
                    context.lineCap = 'square';
                    context.lineWidth = 1;
                    context.strokeRect(rect.x, rect.y, rect.w, rect.h);
                }

                if (this._coords) {
                    this._renderChars(context);
                } else {
                    this._renderLines(context);
                }

                context.restore();
                GFX.leaveTimeline("RenderableText.render");
            };

            RenderableText.prototype._renderChars = function (context) {
                if (this._matrix) {
                    var m = this._matrix;
                    context.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
                }
                var lines = this.lines;
                var coords = this._coords;
                coords.position = 0;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var runs = line.runs;
                    for (var j = 0; j < runs.length; j++) {
                        var run = runs[j];
                        context.font = run.font;
                        context.fillStyle = run.fillStyle;
                        var text = run.text;
                        for (var k = 0; k < text.length; k++) {
                            var x = coords.readInt() / 20;
                            var y = coords.readInt() / 20;
                            context.fillText(text[k], x, y);
                        }
                    }
                }
            };

            RenderableText.prototype._renderLines = function (context) {
                // TODO: Render bullet points.
                var bounds = this._textBounds;
                context.beginPath();
                context.rect(bounds.x, bounds.y, bounds.w, bounds.h);
                context.clip();
                context.translate(bounds.x + 2, bounds.y + 2);
                var lines = this.lines;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var x = line.x;
                    var y = line.y;
                    var runs = line.runs;
                    for (var j = 0; j < runs.length; j++) {
                        var run = runs[j];
                        context.font = run.font;
                        context.fillStyle = run.fillStyle;
                        if (run.underline) {
                            context.fillRect(x, (y + (line.descent / 2)) | 0, run.width, 1);
                        }
                        context.fillText(run.text, x, y);
                        x += run.width;
                    }
                }
            };
            return RenderableText;
        })(Renderable);
        GFX.RenderableText = RenderableText;

        var Label = (function (_super) {
            __extends(Label, _super);
            function Label(w, h) {
                _super.call(this, new Rectangle(0, 0, w, h));
                this._flags = 1 /* Dynamic */ | 4 /* Scalable */;
                this.properties = {};
            }
            Object.defineProperty(Label.prototype, "text", {
                get: function () {
                    return this._text;
                },
                set: function (value) {
                    this._text = value;
                },
                enumerable: true,
                configurable: true
            });


            Label.prototype.render = function (context, cullBounds) {
                context.save();
                context.textBaseline = "top";
                context.fillStyle = "white";
                context.fillText(this.text, 0, 0);
                context.restore();
            };
            return Label;
        })(Renderable);
        GFX.Label = Label;

        var Grid = (function (_super) {
            __extends(Grid, _super);
            function Grid() {
                _super.call(this, Rectangle.createMaxI16());
                this._flags = 2 /* Dirty */ | 4 /* Scalable */ | 8 /* Tileable */;
                this.properties = {};
            }
            Grid.prototype.render = function (context, cullBounds) {
                context.save();

                var gridBounds = cullBounds || this.getBounds();

                context.fillStyle = Shumway.ColorStyle.VeryDark;
                context.fillRect(gridBounds.x, gridBounds.y, gridBounds.w, gridBounds.h);

                function gridPath(level) {
                    var vStart = Math.floor(gridBounds.x / level) * level;
                    var vEnd = Math.ceil((gridBounds.x + gridBounds.w) / level) * level;

                    for (var x = vStart; x < vEnd; x += level) {
                        context.moveTo(x + 0.5, gridBounds.y);
                        context.lineTo(x + 0.5, gridBounds.y + gridBounds.h);
                    }

                    var hStart = Math.floor(gridBounds.y / level) * level;
                    var hEnd = Math.ceil((gridBounds.y + gridBounds.h) / level) * level;

                    for (var y = hStart; y < hEnd; y += level) {
                        context.moveTo(gridBounds.x, y + 0.5);
                        context.lineTo(gridBounds.x + gridBounds.w, y + 0.5);
                    }
                }

                context.beginPath();
                gridPath(100);
                context.lineWidth = 1;
                context.strokeStyle = Shumway.ColorStyle.Dark;
                context.stroke();

                context.beginPath();
                gridPath(500);
                context.lineWidth = 1;
                context.strokeStyle = Shumway.ColorStyle.TabToolbar;
                context.stroke();

                context.beginPath();
                gridPath(1000);
                context.lineWidth = 3;
                context.strokeStyle = Shumway.ColorStyle.Toolbars;
                context.stroke();

                var MAX = 1024 * 1024;
                context.lineWidth = 3;
                context.beginPath();
                context.moveTo(-MAX, 0.5);
                context.lineTo(MAX, 0.5);
                context.moveTo(0.5, -MAX);
                context.lineTo(0.5, MAX);
                context.strokeStyle = Shumway.ColorStyle.Orange;
                context.stroke();

                context.restore();
            };
            return Grid;
        })(Renderable);
        GFX.Grid = Grid;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
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
    (function (GFX) {
        var assert = Shumway.Debug.assert;

        var Filter = (function () {
            function Filter() {
            }
            return Filter;
        })();
        GFX.Filter = Filter;

        var BlurFilter = (function (_super) {
            __extends(BlurFilter, _super);
            function BlurFilter(blurX, blurY, quality) {
                _super.call(this);
                this.blurX = blurX;
                this.blurY = blurY;
                this.quality = quality;
            }
            return BlurFilter;
        })(Filter);
        GFX.BlurFilter = BlurFilter;

        var DropshadowFilter = (function (_super) {
            __extends(DropshadowFilter, _super);
            function DropshadowFilter(alpha, angle, blurX, blurY, color, distance, hideObject, inner, knockout, quality, strength) {
                _super.call(this);
                this.alpha = alpha;
                this.angle = angle;
                this.blurX = blurX;
                this.blurY = blurY;
                this.color = color;
                this.distance = distance;
                this.hideObject = hideObject;
                this.inner = inner;
                this.knockout = knockout;
                this.quality = quality;
                this.strength = strength;
            }
            return DropshadowFilter;
        })(Filter);
        GFX.DropshadowFilter = DropshadowFilter;

        var GlowFilter = (function (_super) {
            __extends(GlowFilter, _super);
            function GlowFilter(alpha, blurX, blurY, color, inner, knockout, quality, strength) {
                _super.call(this);
                this.alpha = alpha;
                this.blurX = blurX;
                this.blurY = blurY;
                this.color = color;
                this.inner = inner;
                this.knockout = knockout;
                this.quality = quality;
                this.strength = strength;
            }
            return GlowFilter;
        })(Filter);
        GFX.GlowFilter = GlowFilter;

        var ColorMatrix = (function () {
            function ColorMatrix(m) {
                release || assert(m.length === 20);
                this._m = new Float32Array(m);
            }
            ColorMatrix.prototype.clone = function () {
                return new ColorMatrix(this._m);
            };

            ColorMatrix.prototype.set = function (other) {
                this._m.set(other._m);
            };

            ColorMatrix.prototype.toWebGLMatrix = function () {
                return new Float32Array(this._m);
            };

            ColorMatrix.prototype.asWebGLMatrix = function () {
                return this._m.subarray(0, 16);
            };

            ColorMatrix.prototype.asWebGLVector = function () {
                return this._m.subarray(16, 20);
            };

            ColorMatrix.prototype.getColorMatrix = function () {
                var t = new Float32Array(20);
                var m = this._m;
                t[0] = m[0];
                t[1] = m[4];
                t[2] = m[8];
                t[3] = m[12];
                t[4] = m[16] * 255;
                t[5] = m[1];
                t[6] = m[5];
                t[7] = m[9];
                t[8] = m[13];
                t[9] = m[17] * 255;
                t[10] = m[2];
                t[11] = m[6];
                t[12] = m[10];
                t[13] = m[14];
                t[14] = m[18] * 255;
                t[15] = m[3];
                t[16] = m[7];
                t[17] = m[11];
                t[18] = m[15];
                t[19] = m[19] * 255;
                return t;
            };

            ColorMatrix.prototype.getColorTransform = function () {
                var t = new Float32Array(8);
                var m = this._m;
                t[0] = m[0];
                t[1] = m[5];
                t[2] = m[10];
                t[3] = m[15];
                t[4] = m[16] * 255;
                t[5] = m[17] * 255;
                t[6] = m[18] * 255;
                t[7] = m[19] * 255;
                return t;
            };

            ColorMatrix.prototype.isIdentity = function () {
                var m = this._m;
                return (m[0] == 1 && m[1] == 0 && m[2] == 0 && m[3] == 0 && m[4] == 0 && m[5] == 1 && m[6] == 0 && m[7] == 0 && m[8] == 0 && m[9] == 0 && m[10] == 1 && m[11] == 0 && m[12] == 0 && m[13] == 0 && m[14] == 0 && m[15] == 1 && m[16] == 0 && m[17] == 0 && m[18] == 0 && m[19] == 0);
            };

            ColorMatrix.createIdentity = function () {
                return new ColorMatrix([
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1,
                    0, 0, 0, 0
                ]);
            };

            ColorMatrix.fromMultipliersAndOffsets = function (redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
                return new ColorMatrix([
                    redMultiplier, 0, 0, 0,
                    0, greenMultiplier, 0, 0,
                    0, 0, blueMultiplier, 0,
                    0, 0, 0, alphaMultiplier,
                    redOffset, greenOffset, blueOffset, alphaOffset
                ]);
            };

            ColorMatrix.prototype.multiply = function (other) {
                var a = this._m, b = other._m;
                var a00 = a[0 * 4 + 0];
                var a01 = a[0 * 4 + 1];
                var a02 = a[0 * 4 + 2];
                var a03 = a[0 * 4 + 3];
                var a10 = a[1 * 4 + 0];
                var a11 = a[1 * 4 + 1];
                var a12 = a[1 * 4 + 2];
                var a13 = a[1 * 4 + 3];
                var a20 = a[2 * 4 + 0];
                var a21 = a[2 * 4 + 1];
                var a22 = a[2 * 4 + 2];
                var a23 = a[2 * 4 + 3];
                var a30 = a[3 * 4 + 0];
                var a31 = a[3 * 4 + 1];
                var a32 = a[3 * 4 + 2];
                var a33 = a[3 * 4 + 3];
                var a40 = a[4 * 4 + 0];
                var a41 = a[4 * 4 + 1];
                var a42 = a[4 * 4 + 2];
                var a43 = a[4 * 4 + 3];

                var b00 = b[0 * 4 + 0];
                var b01 = b[0 * 4 + 1];
                var b02 = b[0 * 4 + 2];
                var b03 = b[0 * 4 + 3];
                var b10 = b[1 * 4 + 0];
                var b11 = b[1 * 4 + 1];
                var b12 = b[1 * 4 + 2];
                var b13 = b[1 * 4 + 3];
                var b20 = b[2 * 4 + 0];
                var b21 = b[2 * 4 + 1];
                var b22 = b[2 * 4 + 2];
                var b23 = b[2 * 4 + 3];
                var b30 = b[3 * 4 + 0];
                var b31 = b[3 * 4 + 1];
                var b32 = b[3 * 4 + 2];
                var b33 = b[3 * 4 + 3];
                var b40 = b[4 * 4 + 0];
                var b41 = b[4 * 4 + 1];
                var b42 = b[4 * 4 + 2];
                var b43 = b[4 * 4 + 3];

                a[0 * 4 + 0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
                a[0 * 4 + 1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
                a[0 * 4 + 2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
                a[0 * 4 + 3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
                a[1 * 4 + 0] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
                a[1 * 4 + 1] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
                a[1 * 4 + 2] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
                a[1 * 4 + 3] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
                a[2 * 4 + 0] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
                a[2 * 4 + 1] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
                a[2 * 4 + 2] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
                a[2 * 4 + 3] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
                a[3 * 4 + 0] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
                a[3 * 4 + 1] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
                a[3 * 4 + 2] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
                a[3 * 4 + 3] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

                a[4 * 4 + 0] = a00 * b40 + a10 * b41 + a20 * b42 + a30 * b43 + a40;
                a[4 * 4 + 1] = a01 * b40 + a11 * b41 + a21 * b42 + a31 * b43 + a41;
                a[4 * 4 + 2] = a02 * b40 + a12 * b41 + a22 * b42 + a32 * b43 + a42;
                a[4 * 4 + 3] = a03 * b40 + a13 * b41 + a23 * b42 + a33 * b43 + a43;
            };

            Object.defineProperty(ColorMatrix.prototype, "alphaMultiplier", {
                get: function () {
                    return this._m[15];
                },
                enumerable: true,
                configurable: true
            });

            ColorMatrix.prototype.equals = function (other) {
                if (!other) {
                    return false;
                }
                var a = this._m;
                var b = other._m;
                for (var i = 0; i < 20; i++) {
                    if (Math.abs(a[i] - b[i]) > 0.001) {
                        return false;
                    }
                }
                return true;
            };
            return ColorMatrix;
        })();
        GFX.ColorMatrix = ColorMatrix;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
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
/// <reference path='module.ts' />
/// <reference path='utilities.ts' />
/// <reference path='options.ts'/>
/// <reference path='geometry.ts'/>
/// <reference path='regionAllocator.ts'/>
/// <reference path='frame.ts'/>
/// <reference path='frameContainer.ts'/>
/// <reference path='stage.ts'/>
/// <reference path='renderables/renderables.ts'/>
/// <reference path='filters.ts'/>
//# sourceMappingURL=gfx-base.js.map
