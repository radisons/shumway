var Shumway;
(function (Shumway) {
    (function (GFX) {
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
        (function (WebGL) {
            var Point3D = GFX.Geometry.Point3D;

            var Matrix3D = GFX.Geometry.Matrix3D;

            var degreesToRadian = GFX.Geometry.degreesToRadian;

            var assert = Shumway.Debug.assert;
            var unexpected = Shumway.Debug.unexpected;
            var notImplemented = Shumway.Debug.notImplemented;

            WebGL.SHADER_ROOT = "shaders/";

            function endsWith(str, end) {
                return str.indexOf(end, this.length - end.length) !== -1;
            }

            var WebGLContext = (function () {
                function WebGLContext(canvas, options) {
                    this._fillColor = Shumway.Color.Red;
                    this._surfaceRegionCache = new Shumway.LRUList();
                    this.modelViewProjectionMatrix = Matrix3D.createIdentity();
                    this._canvas = canvas;
                    this._options = options;
                    this.gl = (canvas.getContext("experimental-webgl", {
                        // preserveDrawingBuffer: true,
                        preserveDrawingBuffer: false,
                        antialias: true,
                        stencil: true,
                        premultipliedAlpha: false
                    }));
                    release || assert(this.gl, "Cannot create WebGL context.");
                    this._programCache = Object.create(null);
                    this._resize();
                    this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.unpackPremultiplyAlpha ? this.gl.ONE : this.gl.ZERO);
                    this._backgroundColor = Shumway.Color.Black;

                    this._geometry = new WebGL.WebGLGeometry(this);
                    this._tmpVertices = WebGL.Vertex.createEmptyVertices(WebGL.Vertex, 64);

                    this._maxSurfaces = options.maxSurfaces;
                    this._maxSurfaceSize = options.maxSurfaceSize;

                    // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
                    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
                    this.gl.enable(this.gl.BLEND);

                    // this.gl.enable(this.gl.DEPTH_TEST);
                    this.modelViewProjectionMatrix = Matrix3D.create2DProjection(this._w, this._h, 2000);

                    var self = this;
                    this._surfaceRegionAllocator = new GFX.SurfaceRegionAllocator.SimpleAllocator(function () {
                        var texture = self._createTexture(1024, 1024);
                        return new WebGL.WebGLSurface(1024, 1024, texture);
                    });
                }
                Object.defineProperty(WebGLContext.prototype, "surfaces", {
                    get: function () {
                        return (this._surfaceRegionAllocator.surfaces);
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(WebGLContext.prototype, "fillStyle", {
                    set: function (value) {
                        this._fillColor.set(Shumway.Color.parseColor(value));
                    },
                    enumerable: true,
                    configurable: true
                });

                WebGLContext.prototype.setBlendMode = function (value) {
                    var gl = this.gl;
                    switch (value) {
                        case 8 /* Add */:
                            gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
                            break;
                        case 3 /* Multiply */:
                            gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
                            break;
                        case 4 /* Screen */:
                            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                            break;
                        case 2 /* Layer */:
                        case 1 /* Normal */:
                            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                            break;
                        default:
                            notImplemented("Blend Mode: " + value);
                    }
                };

                WebGLContext.prototype.setBlendOptions = function () {
                    this.gl.blendFunc(this._options.sourceBlendFactor, this._options.destinationBlendFactor);
                };

                /**
                * Whether the blend mode can be performed using |blendFunc|.
                */
                WebGLContext.glSupportedBlendMode = function (value) {
                    switch (value) {
                        case 8 /* Add */:
                        case 3 /* Multiply */:
                        case 4 /* Screen */:
                        case 1 /* Normal */:
                            return true;
                        default:
                            return false;
                    }
                };

                WebGLContext.prototype.create2DProjectionMatrix = function () {
                    return Matrix3D.create2DProjection(this._w, this._h, -this._w);
                };

                WebGLContext.prototype.createPerspectiveMatrix = function (cameraDistance, fov, angle) {
                    var cameraAngleRadians = degreesToRadian(angle);

                    // Compute the projection matrix
                    var projectionMatrix = Matrix3D.createPerspective(degreesToRadian(fov), 1, 0.1, 5000);

                    var up = new Point3D(0, 1, 0);
                    var target = new Point3D(0, 0, 0);
                    var camera = new Point3D(0, 0, cameraDistance);
                    var cameraMatrix = Matrix3D.createCameraLookAt(camera, target, up);
                    var viewMatrix = Matrix3D.createInverse(cameraMatrix);

                    var matrix = Matrix3D.createIdentity();
                    matrix = Matrix3D.createMultiply(matrix, Matrix3D.createTranslation(-this._w / 2, -this._h / 2, 0));
                    matrix = Matrix3D.createMultiply(matrix, Matrix3D.createScale(1 / this._w, -1 / this._h, 1 / 100));
                    matrix = Matrix3D.createMultiply(matrix, Matrix3D.createYRotation(cameraAngleRadians));
                    matrix = Matrix3D.createMultiply(matrix, viewMatrix);
                    matrix = Matrix3D.createMultiply(matrix, projectionMatrix);
                    return matrix;
                };

                WebGLContext.prototype.discardCachedImages = function () {
                    GFX.traceLevel >= 2 /* Verbose */ && GFX.writer && GFX.writer.writeLn("Discard Cache");
                    var count = this._surfaceRegionCache.count / 2 | 0;
                    for (var i = 0; i < count; i++) {
                        var surfaceRegion = this._surfaceRegionCache.pop();
                        GFX.traceLevel >= 2 /* Verbose */ && GFX.writer && GFX.writer.writeLn("Discard: " + surfaceRegion);
                        surfaceRegion.texture.atlas.remove(surfaceRegion.region);
                        surfaceRegion.texture = null;
                    }
                };

                WebGLContext.prototype.cacheImage = function (image) {
                    var w = image.width;
                    var h = image.height;
                    var surfaceRegion = this.allocateSurfaceRegion(w, h);
                    GFX.traceLevel >= 2 /* Verbose */ && GFX.writer && GFX.writer.writeLn("Uploading Image: @ " + surfaceRegion.region);
                    this._surfaceRegionCache.use(surfaceRegion);
                    this.updateSurfaceRegion(image, surfaceRegion);
                    return surfaceRegion;
                };

                WebGLContext.prototype.allocateSurfaceRegion = function (w, h, discardCache) {
                    if (typeof discardCache === "undefined") { discardCache = true; }
                    return this._surfaceRegionAllocator.allocate(w, h);
                };

                /*
                public allocateTextureRegion(w: number, h: number, discardCache: boolean = true): WebGLSurfaceRegion {
                var imageIsTileSized = (w === h) && (w === TILE_SIZE);
                var texture, region;
                for (var i = 0; i < this._surfaces.length; i++) {
                texture = this._surfaces[i];
                if (imageIsTileSized && texture.atlas.compact) {
                continue;
                }
                region = texture.atlas.add(null, w, h);
                if (region) {
                break;
                }
                }
                if (!region) {
                if (w >= this._maxTextureSize || h >= this._maxTextureSize) {
                // Region cannot possibly fit in the standard texture atlas.
                texture = this.createTexture(w, h, !imageIsTileSized);
                } else if (this._surfaces.length === this._maxTextures) {
                if (discardCache) {
                this.discardCachedImages();
                return this.allocateTextureRegion(w, h, false);
                }
                return null;
                } else {
                texture = this.createTexture(this._maxTextureSize, this._maxTextureSize, !imageIsTileSized);
                }
                this._surfaces.push(texture);
                region = texture.atlas.add(null, w, h);
                release || assert (region);
                }
                return new WebGLSurfaceRegion(texture, region);
                }
                */
                WebGLContext.prototype.updateSurfaceRegion = function (image, surfaceRegion) {
                    var gl = this.gl;
                    gl.bindTexture(gl.TEXTURE_2D, surfaceRegion.surface.texture);
                    GFX.enterTimeline("texSubImage2D");
                    gl.texSubImage2D(gl.TEXTURE_2D, 0, surfaceRegion.region.x, surfaceRegion.region.y, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    GFX.leaveTimeline("texSubImage2D");
                };

                WebGLContext.prototype._resize = function () {
                    var gl = this.gl;
                    this._w = this._canvas.width;
                    this._h = this._canvas.height;
                    gl.viewport(0, 0, this._w, this._h);
                    for (var k in this._programCache) {
                        this._initializeProgram(this._programCache[k]);
                    }
                };

                WebGLContext.prototype._initializeProgram = function (program) {
                    var gl = this.gl;
                    gl.useProgram(program);
                    // gl.uniform2f(program.uniforms.uResolution.location, this._w, this._h);
                };

                WebGLContext.prototype._createShaderFromFile = function (file) {
                    var path = WebGL.SHADER_ROOT + file;
                    var gl = this.gl;
                    var request = new XMLHttpRequest();
                    request.open("GET", path, false);
                    request.send();
                    release || assert(request.status === 200, "File : " + path + " not found.");
                    var shaderType;
                    if (endsWith(path, ".vert")) {
                        shaderType = gl.VERTEX_SHADER;
                    } else if (endsWith(path, ".frag")) {
                        shaderType = gl.FRAGMENT_SHADER;
                    } else {
                        throw "Shader Type: not supported.";
                    }
                    return this._createShader(shaderType, request.responseText);
                };

                WebGLContext.prototype.createProgramFromFiles = function (vertex, fragment) {
                    var key = vertex + "-" + fragment;
                    var program = this._programCache[key];
                    if (!program) {
                        program = this._createProgram([
                            this._createShaderFromFile(vertex),
                            this._createShaderFromFile(fragment)
                        ]);
                        this._queryProgramAttributesAndUniforms(program);
                        this._initializeProgram(program);
                        this._programCache[key] = program;
                    }
                    return program;
                };

                WebGLContext.prototype._createProgram = function (shaders) {
                    var gl = this.gl;
                    var program = gl.createProgram();
                    shaders.forEach(function (shader) {
                        gl.attachShader(program, shader);
                    });
                    gl.linkProgram(program);
                    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                        var lastError = gl.getProgramInfoLog(program);
                        unexpected("Cannot link program: " + lastError);
                        gl.deleteProgram(program);
                    }
                    return program;
                };

                WebGLContext.prototype._createShader = function (shaderType, shaderSource) {
                    var gl = this.gl;
                    var shader = gl.createShader(shaderType);
                    gl.shaderSource(shader, shaderSource);
                    gl.compileShader(shader);
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                        var lastError = gl.getShaderInfoLog(shader);
                        unexpected("Cannot compile shader: " + lastError);
                        gl.deleteShader(shader);
                        return null;
                    }
                    return shader;
                };

                WebGLContext.prototype._createTexture = function (w, h) {
                    var gl = this.gl;
                    var texture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                    return texture;
                };

                WebGLContext.prototype._createFramebuffer = function (texture) {
                    var gl = this.gl;
                    var framebuffer = gl.createFramebuffer();
                    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    return framebuffer;
                };

                WebGLContext.prototype._queryProgramAttributesAndUniforms = function (program) {
                    program.uniforms = {};
                    program.attributes = {};

                    var gl = this.gl;
                    for (var i = 0, j = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES); i < j; i++) {
                        var attribute = gl.getActiveAttrib(program, i);
                        program.attributes[attribute.name] = attribute;
                        attribute.location = gl.getAttribLocation(program, attribute.name);
                    }
                    for (var i = 0, j = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i < j; i++) {
                        var uniform = gl.getActiveUniform(program, i);
                        program.uniforms[uniform.name] = uniform;
                        uniform.location = gl.getUniformLocation(program, uniform.name);
                    }
                };

                Object.defineProperty(WebGLContext.prototype, "target", {
                    set: function (surface) {
                        var gl = this.gl;
                        if (surface) {
                            gl.viewport(0, 0, surface.w, surface.h);
                            gl.bindFramebuffer(gl.FRAMEBUFFER, surface.framebuffer);
                        } else {
                            gl.viewport(0, 0, this._w, this._h);
                            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                        }
                    },
                    enumerable: true,
                    configurable: true
                });

                WebGLContext.prototype.clear = function (color) {
                    if (typeof color === "undefined") { color = Shumway.Color.None; }
                    var gl = this.gl;
                    gl.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                };

                WebGLContext.prototype.clearTextureRegion = function (surfaceRegion, color) {
                    if (typeof color === "undefined") { color = Shumway.Color.None; }
                    var gl = this.gl;
                    var region = surfaceRegion.region;
                    this.target = surfaceRegion.surface;
                    gl.enable(gl.SCISSOR_TEST);
                    gl.scissor(region.x, region.y, region.w, region.h);
                    gl.clearColor(color.r, color.g, color.b, color.a);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.disable(gl.SCISSOR_TEST);
                };

                WebGLContext.prototype.sizeOf = function (type) {
                    var gl = this.gl;
                    switch (type) {
                        case gl.UNSIGNED_BYTE:
                            return 1;
                        case gl.UNSIGNED_SHORT:
                            return 2;
                        case this.gl.INT:
                        case this.gl.FLOAT:
                            return 4;
                        default:
                            notImplemented(type);
                    }
                };
                WebGLContext.MAX_SURFACES = 8;
                return WebGLContext;
            })();
            WebGL.WebGLContext = WebGLContext;
        })(GFX.WebGL || (GFX.WebGL = {}));
        var WebGL = GFX.WebGL;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
})(Shumway || (Shumway = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    (function (GFX) {
        (function (WebGL) {
            var release = false;

            var assert = Shumway.Debug.assert;

            /**
            * Utility class to help when writing to GL buffers.
            */
            var BufferWriter = (function (_super) {
                __extends(BufferWriter, _super);
                function BufferWriter() {
                    _super.apply(this, arguments);
                }
                BufferWriter.prototype.ensureVertexCapacity = function (count) {
                    release || assert((this._offset & 0x3) === 0);
                    this.ensureCapacity(this._offset + count * 8);
                };

                BufferWriter.prototype.writeVertex = function (x, y) {
                    release || assert((this._offset & 0x3) === 0);
                    this.ensureCapacity(this._offset + 8);
                    this.writeVertexUnsafe(x, y);
                };

                BufferWriter.prototype.writeVertexUnsafe = function (x, y) {
                    var index = this._offset >> 2;
                    this._f32[index] = x;
                    this._f32[index + 1] = y;
                    this._offset += 8;
                };

                BufferWriter.prototype.writeVertex3D = function (x, y, z) {
                    release || assert((this._offset & 0x3) === 0);
                    this.ensureCapacity(this._offset + 12);
                    this.writeVertex3DUnsafe(x, y, z);
                };

                BufferWriter.prototype.writeVertex3DUnsafe = function (x, y, z) {
                    var index = this._offset >> 2;
                    this._f32[index] = x;
                    this._f32[index + 1] = y;
                    this._f32[index + 2] = z;
                    this._offset += 12;
                };

                BufferWriter.prototype.writeTriangleElements = function (a, b, c) {
                    release || assert((this._offset & 0x1) === 0);
                    this.ensureCapacity(this._offset + 6);
                    var index = this._offset >> 1;
                    this._u16[index] = a;
                    this._u16[index + 1] = b;
                    this._u16[index + 2] = c;
                    this._offset += 6;
                };

                BufferWriter.prototype.ensureColorCapacity = function (count) {
                    release || assert((this._offset & 0x2) === 0);
                    this.ensureCapacity(this._offset + count * 16);
                };

                BufferWriter.prototype.writeColorFloats = function (r, g, b, a) {
                    release || assert((this._offset & 0x2) === 0);
                    this.ensureCapacity(this._offset + 16);
                    this.writeColorFloatsUnsafe(r, g, b, a);
                };

                BufferWriter.prototype.writeColorFloatsUnsafe = function (r, g, b, a) {
                    var index = this._offset >> 2;
                    this._f32[index] = r;
                    this._f32[index + 1] = g;
                    this._f32[index + 2] = b;
                    this._f32[index + 3] = a;
                    this._offset += 16;
                };

                BufferWriter.prototype.writeColor = function (r, g, b, a) {
                    release || assert((this._offset & 0x3) === 0);
                    this.ensureCapacity(this._offset + 4);
                    var index = this._offset >> 2;
                    this._i32[index] = a << 24 | b << 16 | g << 8 | r;
                    this._offset += 4;
                };

                BufferWriter.prototype.writeColorUnsafe = function (r, g, b, a) {
                    var index = this._offset >> 2;
                    this._i32[index] = a << 24 | b << 16 | g << 8 | r;
                    this._offset += 4;
                };

                BufferWriter.prototype.writeRandomColor = function () {
                    this.writeColor(Math.random(), Math.random(), Math.random(), Math.random() / 2);
                };
                return BufferWriter;
            })(Shumway.ArrayUtilities.ArrayWriter);
            WebGL.BufferWriter = BufferWriter;

            var WebGLAttribute = (function () {
                function WebGLAttribute(name, size, type, normalized) {
                    if (typeof normalized === "undefined") { normalized = false; }
                    this.name = name;
                    this.size = size;
                    this.type = type;
                    this.normalized = normalized;
                }
                return WebGLAttribute;
            })();
            WebGL.WebGLAttribute = WebGLAttribute;

            var WebGLAttributeList = (function () {
                function WebGLAttributeList(attributes) {
                    this.size = 0;
                    this.attributes = attributes;
                }
                WebGLAttributeList.prototype.initialize = function (context) {
                    var offset = 0;
                    for (var i = 0; i < this.attributes.length; i++) {
                        this.attributes[i].offset = offset;
                        offset += context.sizeOf(this.attributes[i].type) * this.attributes[i].size;
                    }
                    this.size = offset;
                };
                return WebGLAttributeList;
            })();
            WebGL.WebGLAttributeList = WebGLAttributeList;

            var WebGLGeometry = (function () {
                function WebGLGeometry(context) {
                    this.triangleCount = 0;
                    this._elementOffset = 0;
                    this.context = context;
                    this.array = new BufferWriter(8);
                    this.buffer = context.gl.createBuffer();

                    this.elementArray = new BufferWriter(8);
                    this.elementBuffer = context.gl.createBuffer();
                }
                Object.defineProperty(WebGLGeometry.prototype, "elementOffset", {
                    get: function () {
                        return this._elementOffset;
                    },
                    enumerable: true,
                    configurable: true
                });

                WebGLGeometry.prototype.addQuad = function () {
                    var offset = this._elementOffset;
                    this.elementArray.writeTriangleElements(offset, offset + 1, offset + 2);
                    this.elementArray.writeTriangleElements(offset, offset + 2, offset + 3);
                    this.triangleCount += 2;
                    this._elementOffset += 4;
                };

                WebGLGeometry.prototype.resetElementOffset = function () {
                    this._elementOffset = 0;
                };

                WebGLGeometry.prototype.reset = function () {
                    this.array.reset();
                    this.elementArray.reset();
                    this.resetElementOffset();
                    this.triangleCount = 0;
                };

                WebGLGeometry.prototype.uploadBuffers = function () {
                    var gl = this.context.gl;
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, this.array.subU8View(), gl.DYNAMIC_DRAW);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.elementArray.subU8View(), gl.DYNAMIC_DRAW);
                };
                return WebGLGeometry;
            })();
            WebGL.WebGLGeometry = WebGLGeometry;

            var Vertex = (function (_super) {
                __extends(Vertex, _super);
                function Vertex(x, y, z) {
                    _super.call(this, x, y, z);
                }
                Vertex.createEmptyVertices = function (type, count) {
                    var result = [];
                    for (var i = 0; i < count; i++) {
                        result.push(new type(0, 0, 0));
                    }
                    return result;
                };
                return Vertex;
            })(GFX.Geometry.Point3D);
            WebGL.Vertex = Vertex;

            (function (WebGLBlendFactor) {
                WebGLBlendFactor[WebGLBlendFactor["ZERO"] = 0] = "ZERO";
                WebGLBlendFactor[WebGLBlendFactor["ONE"] = 1] = "ONE";
                WebGLBlendFactor[WebGLBlendFactor["SRC_COLOR"] = 768] = "SRC_COLOR";
                WebGLBlendFactor[WebGLBlendFactor["ONE_MINUS_SRC_COLOR"] = 769] = "ONE_MINUS_SRC_COLOR";
                WebGLBlendFactor[WebGLBlendFactor["DST_COLOR"] = 774] = "DST_COLOR";
                WebGLBlendFactor[WebGLBlendFactor["ONE_MINUS_DST_COLOR"] = 775] = "ONE_MINUS_DST_COLOR";
                WebGLBlendFactor[WebGLBlendFactor["SRC_ALPHA"] = 770] = "SRC_ALPHA";
                WebGLBlendFactor[WebGLBlendFactor["ONE_MINUS_SRC_ALPHA"] = 771] = "ONE_MINUS_SRC_ALPHA";
                WebGLBlendFactor[WebGLBlendFactor["DST_ALPHA"] = 772] = "DST_ALPHA";
                WebGLBlendFactor[WebGLBlendFactor["ONE_MINUS_DST_ALPHA"] = 773] = "ONE_MINUS_DST_ALPHA";
                WebGLBlendFactor[WebGLBlendFactor["SRC_ALPHA_SATURATE"] = 776] = "SRC_ALPHA_SATURATE";
                WebGLBlendFactor[WebGLBlendFactor["CONSTANT_COLOR"] = 32769] = "CONSTANT_COLOR";
                WebGLBlendFactor[WebGLBlendFactor["ONE_MINUS_CONSTANT_COLOR"] = 32770] = "ONE_MINUS_CONSTANT_COLOR";
                WebGLBlendFactor[WebGLBlendFactor["CONSTANT_ALPHA"] = 32771] = "CONSTANT_ALPHA";
                WebGLBlendFactor[WebGLBlendFactor["ONE_MINUS_CONSTANT_ALPHA"] = 32772] = "ONE_MINUS_CONSTANT_ALPHA";
            })(WebGL.WebGLBlendFactor || (WebGL.WebGLBlendFactor = {}));
            var WebGLBlendFactor = WebGL.WebGLBlendFactor;
        })(GFX.WebGL || (GFX.WebGL = {}));
        var WebGL = GFX.WebGL;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    (function (GFX) {
        (function (WebGL) {
            var release = false;

            var WebGLSurface = (function () {
                function WebGLSurface(w, h, texture) {
                    this.texture = texture;
                    this.w = w;
                    this.h = h;
                    this._regionAllocator = new GFX.RegionAllocator.CompactAllocator(this.w, this.h);
                }
                WebGLSurface.prototype.allocate = function (w, h) {
                    var region = this._regionAllocator.allocate(w, h);
                    if (region) {
                        return new WebGLSurfaceRegion(this, region);
                    }
                    return null;
                };
                WebGLSurface.prototype.free = function (surfaceRegion) {
                    this._regionAllocator.free(surfaceRegion.region);
                };
                return WebGLSurface;
            })();
            WebGL.WebGLSurface = WebGLSurface;

            /**
            * A (region, texture) pair. These objects can appear in linked lists hence the next and previous pointers. Regions
            * don't necessarily need to have a texture reference. Setting the texture reference to null is a way to indicate
            * that the region no longer points to valid texture data.
            */
            var WebGLSurfaceRegion = (function () {
                function WebGLSurfaceRegion(surface, region) {
                    this.surface = surface;
                    this.region = region;
                    this.next = this.previous = null;
                }
                return WebGLSurfaceRegion;
            })();
            WebGL.WebGLSurfaceRegion = WebGLSurfaceRegion;
        })(GFX.WebGL || (GFX.WebGL = {}));
        var WebGL = GFX.WebGL;
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
        (function (WebGL) {
            var Color = Shumway.Color;
            var SCRATCH_CANVAS_SIZE = 1024 * 2;

            WebGL.TILE_SIZE = 256;
            WebGL.MIN_UNTILED_SIZE = 256;

            function getTileSize(bounds) {
                if (bounds.w < WebGL.TILE_SIZE || bounds.h < WebGL.TILE_SIZE) {
                    return Math.min(bounds.w, bounds.h);
                }
                return WebGL.TILE_SIZE;
            }

            var Matrix = GFX.Geometry.Matrix;

            var Rectangle = GFX.Geometry.Rectangle;
            var RenderableTileCache = GFX.Geometry.RenderableTileCache;

            var Shape = Shumway.GFX.Shape;

            var ColorMatrix = Shumway.GFX.ColorMatrix;
            var VisitorFlags = Shumway.GFX.VisitorFlags;

            var unexpected = Shumway.Debug.unexpected;

            var WebGLStageRendererOptions = (function (_super) {
                __extends(WebGLStageRendererOptions, _super);
                function WebGLStageRendererOptions() {
                    _super.apply(this, arguments);
                    this.maxSurfaces = 8;
                    this.maxSurfaceSize = 2048 * 2;
                    this.animateZoom = true;
                    /**
                    * Sometimes it's useful to temporarily disable texture uploads to see if rendering
                    * is texture upload bound.
                    */
                    this.disableSurfaceUploads = false;
                    this.frameSpacing = 0.0001;
                    this.ignoreColorMatrix = false;
                    this.drawSurfaces = false;
                    this.drawSurface = -1;
                    this.premultipliedAlpha = false;
                    this.unpackPremultiplyAlpha = true;
                    this.showTemporaryCanvases = false;
                    this.sourceBlendFactor = 1 /* ONE */;
                    this.destinationBlendFactor = 771 /* ONE_MINUS_SRC_ALPHA */;
                }
                return WebGLStageRendererOptions;
            })(GFX.StageRendererOptions);
            WebGL.WebGLStageRendererOptions = WebGLStageRendererOptions;

            var WebGLStageRenderer = (function (_super) {
                __extends(WebGLStageRenderer, _super);
                function WebGLStageRenderer(canvas, stage, options) {
                    if (typeof options === "undefined") { options = new WebGLStageRendererOptions(); }
                    _super.call(this, canvas, stage, options);
                    this._tmpVertices = WebGL.Vertex.createEmptyVertices(WebGL.Vertex, 64);
                    this._cachedTiles = [];
                    var context = this._context = new WebGL.WebGLContext(this._canvas, options);

                    this.resize();

                    this._brush = new WebGL.WebGLCombinedBrush(context, new WebGL.WebGLGeometry(context));
                    this._stencilBrush = new WebGL.WebGLCombinedBrush(context, new WebGL.WebGLGeometry(context));

                    this._scratchCanvas = document.createElement("canvas");
                    this._scratchCanvas.width = this._scratchCanvas.height = SCRATCH_CANVAS_SIZE;
                    this._scratchCanvasContext = this._scratchCanvas.getContext("2d", {
                        willReadFrequently: true
                    });

                    this._dynamicScratchCanvas = document.createElement("canvas");
                    this._dynamicScratchCanvas.width = this._dynamicScratchCanvas.height = 0;
                    this._dynamicScratchCanvasContext = this._dynamicScratchCanvas.getContext("2d", {
                        willReadFrequently: true
                    });

                    this._uploadCanvas = document.createElement("canvas");
                    this._uploadCanvas.width = this._uploadCanvas.height = 0;
                    this._uploadCanvasContext = this._uploadCanvas.getContext("2d", {
                        willReadFrequently: true
                    });

                    if (options.showTemporaryCanvases) {
                        document.getElementById("temporaryCanvasPanelContainer").appendChild(this._uploadCanvas);
                        document.getElementById("temporaryCanvasPanelContainer").appendChild(this._scratchCanvas);
                    }

                    this._clipStack = [];
                }
                WebGLStageRenderer.prototype.resize = function () {
                    this._viewport = new Rectangle(0, 0, this._canvas.width, this._canvas.height);
                    this._context._resize();
                };

                WebGLStageRenderer.prototype._cacheImageCallback = function (oldSurfaceRegion, src, srcBounds) {
                    /*
                    * To avoid seeming caused by linear texture sampling we need to pad each atlased image with a 1 pixel border that duplicates
                    * edge pixels, similar to CLAMP_TO_EDGE
                    *
                    * See the discussion here: http://gamedev.stackexchange.com/questions/61796/sprite-sheet-textures-picking-up-edges-of-adjacent-texture
                    *
                    * For the image:
                    *
                    *    +---+
                    *    |123|
                    *    |456|
                    *    |789|
                    *    +---+
                    *
                    * We instead create:
                    *
                    *  +-------+
                    *  |? 123 ?|
                    *  | +---+ |
                    *  |1|123|3|
                    *  |4|456|6|
                    *  |7|789|9|
                    *  | +---+ |
                    *  |? 789 ?|
                    *  +-------+
                    *
                    *  I don't know what to do about corners yet. Might not be a problem, I don't see any artifacts if they are left empty.
                    */
                    var w = srcBounds.w;
                    var h = srcBounds.h;
                    var sx = srcBounds.x;
                    var sy = srcBounds.y;

                    this._uploadCanvas.width = w + 2;
                    this._uploadCanvas.height = h + 2;

                    // Draw Image
                    this._uploadCanvasContext.drawImage(src.canvas, sx, sy, w, h, 1, 1, w, h);

                    // Top & Bottom Margins
                    this._uploadCanvasContext.drawImage(src.canvas, sx, sy, w, 1, 1, 0, w, 1);
                    this._uploadCanvasContext.drawImage(src.canvas, sx, sy + h - 1, w, 1, 1, h + 1, w, 1);

                    // Left & Right Margins
                    this._uploadCanvasContext.drawImage(src.canvas, sx, sy, 1, h, 0, 1, 1, h);
                    this._uploadCanvasContext.drawImage(src.canvas, sx + w - 1, sy, 1, h, w + 1, 1, 1, h);

                    if (!oldSurfaceRegion || !oldSurfaceRegion.surface) {
                        return this._context.cacheImage(this._uploadCanvas);
                    } else {
                        if (!this._options.disableSurfaceUploads) {
                            this._context.updateSurfaceRegion(this._uploadCanvas, oldSurfaceRegion);
                        }
                        return oldSurfaceRegion;
                    }
                };

                WebGLStageRenderer.prototype._enterClip = function (clip, matrix, brush, viewport) {
                    brush.flush();
                    var gl = this._context.gl;
                    if (this._clipStack.length === 0) {
                        gl.enable(gl.STENCIL_TEST);
                        gl.clear(gl.STENCIL_BUFFER_BIT);
                        gl.stencilFunc(gl.ALWAYS, 1, 1);
                    }
                    this._clipStack.push(clip);
                    gl.colorMask(false, false, false, false);
                    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
                    this._renderFrame(clip, matrix, brush, viewport, 0);
                    brush.flush();
                    gl.colorMask(true, true, true, true);
                    gl.stencilFunc(gl.NOTEQUAL, 0, this._clipStack.length);
                    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                };

                WebGLStageRenderer.prototype._leaveClip = function (clip, matrix, brush, viewport) {
                    brush.flush();
                    var gl = this._context.gl;
                    var clip = this._clipStack.pop();
                    if (clip) {
                        gl.colorMask(false, false, false, false);
                        gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
                        this._renderFrame(clip, matrix, brush, viewport, 0);
                        brush.flush();
                        gl.colorMask(true, true, true, true);
                        gl.stencilFunc(gl.NOTEQUAL, 0, this._clipStack.length);
                        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                    }
                    if (this._clipStack.length === 0) {
                        gl.disable(gl.STENCIL_TEST);
                    }
                };

                WebGLStageRenderer.prototype._renderFrame = function (root, matrix, brush, viewport, depth) {
                    if (typeof depth === "undefined") { depth = 0; }
                    var self = this;
                    var options = this._options;
                    var context = this._context;
                    var gl = context.gl;
                    var cacheImageCallback = this._cacheImageCallback.bind(this);
                    var tileMatrix = Matrix.createIdentity();
                    var colorMatrix = ColorMatrix.createIdentity();
                    var inverseMatrix = Matrix.createIdentity();
                    root.visit(function (frame, matrix, flags) {
                        depth += options.frameSpacing;

                        var bounds = frame.getBounds();

                        if (flags & 4096 /* EnterClip */) {
                            self._enterClip(frame, matrix, brush, viewport);
                            return;
                        } else if (flags & 8192 /* LeaveClip */) {
                            self._leaveClip(frame, matrix, brush, viewport);
                            return;
                        }

                        // Return early if the bounds are not within the viewport.
                        if (!viewport.intersectsTransformedAABB(bounds, matrix)) {
                            return 2 /* Skip */;
                        }

                        var alpha = frame.getConcatenatedAlpha(root);
                        if (!options.ignoreColorMatrix) {
                            colorMatrix = frame.getConcatenatedColorMatrix();
                        }

                        if (frame instanceof GFX.FrameContainer) {
                            if (frame instanceof GFX.ClipRectangle || options.paintBounds) {
                                if (!frame.color) {
                                    frame.color = Color.randomColor(0.3);
                                }
                                brush.fillRectangle(bounds, frame.color, matrix, depth);
                            }
                            //          if (frame !== root && frame.blendMode !== BlendMode.Normal) {
                            //            // self._renderFrameLayer(frame, matrix, brush);
                            //            // self._renderFrameIntoTextureRegion(frame, transform);
                            //            return VisitorFlags.Skip;
                            //          }
                        } else if (frame instanceof Shape) {
                            if (frame.blendMode !== 1 /* Normal */) {
                                if (!WebGL.WebGLContext.glSupportedBlendMode(frame.blendMode)) {
                                    // gl.TEXTURE_2D
                                    // gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 4, 4, 16, 16);
                                    // Now we need to render the frame into a texture.
                                }
                                return 2 /* Skip */;
                            }
                            var shape = frame;
                            var bounds = shape.source.getBounds();
                            if (!bounds.isEmpty()) {
                                var source = shape.source;
                                var tileCache = source.properties["tileCache"];
                                if (!tileCache) {
                                    tileCache = source.properties["tileCache"] = new RenderableTileCache(source, WebGL.TILE_SIZE, WebGL.MIN_UNTILED_SIZE);
                                }
                                var t = Matrix.createIdentity().translate(bounds.x, bounds.y);
                                t.concat(matrix);
                                t.inverse(inverseMatrix);
                                var tiles = tileCache.fetchTiles(viewport, inverseMatrix, self._scratchCanvasContext, cacheImageCallback);
                                for (var i = 0; i < tiles.length; i++) {
                                    var tile = tiles[i];
                                    tileMatrix.setIdentity();
                                    tileMatrix.translate(tile.bounds.x, tile.bounds.y);
                                    tileMatrix.scale(1 / tile.scale, 1 / tile.scale);
                                    tileMatrix.translate(bounds.x, bounds.y);
                                    tileMatrix.concat(matrix);
                                    var src = (tile.cachedSurfaceRegion);
                                    if (src && src.surface) {
                                        context._surfaceRegionCache.use(src);
                                    }
                                    var color = new Color(1, 1, 1, alpha);
                                    if (options.paintFlashing) {
                                        color = Color.randomColor(1);
                                    }
                                    if (!brush.drawImage(src, new Rectangle(0, 0, tile.bounds.w, tile.bounds.h), color, colorMatrix, tileMatrix, depth, frame.blendMode)) {
                                        unexpected();
                                    }
                                    if (options.drawTiles) {
                                        var srcBounds = tile.bounds.clone();
                                        if (!tile.color) {
                                            tile.color = Color.randomColor(0.4);
                                        }
                                        brush.fillRectangle(new Rectangle(0, 0, srcBounds.w, srcBounds.h), tile.color, tileMatrix, depth);
                                    }
                                }
                            }
                        }
                        return 0 /* Continue */;
                    }, matrix, 0 /* Empty */, 16 /* Clips */);
                };

                WebGLStageRenderer.prototype._renderSurfaces = function (brush) {
                    var options = this._options;
                    var context = this._context;
                    var viewport = this._viewport;
                    if (options.drawSurfaces) {
                        var surfaces = context.surfaces;
                        var matrix = Matrix.createIdentity();
                        if (options.drawSurface >= 0 && options.drawSurface < surfaces.length) {
                            var surface = surfaces[options.drawSurface | 0];
                            var src = new Rectangle(0, 0, surface.w, surface.h);
                            var dst = src.clone();
                            while (dst.w > viewport.w) {
                                dst.scale(0.5, 0.5);
                            }
                            brush.drawImage(new WebGL.WebGLSurfaceRegion(surface, src), dst, Color.White, null, matrix, 0.2);
                        } else {
                            var surfaceWindowSize = viewport.w / 5;
                            if (surfaceWindowSize > viewport.h / surfaces.length) {
                                surfaceWindowSize = viewport.h / surfaces.length;
                            }
                            brush.fillRectangle(new Rectangle(viewport.w - surfaceWindowSize, 0, surfaceWindowSize, viewport.h), new Color(0, 0, 0, 0.5), matrix, 0.1);
                            for (var i = 0; i < surfaces.length; i++) {
                                var surface = surfaces[i];
                                var surfaceWindow = new Rectangle(viewport.w - surfaceWindowSize, i * surfaceWindowSize, surfaceWindowSize, surfaceWindowSize);
                                brush.drawImage(new WebGL.WebGLSurfaceRegion(surface, new Rectangle(0, 0, surface.w, surface.h)), surfaceWindow, Color.White, null, matrix, 0.2);
                            }
                        }
                        brush.flush();
                    }
                };

                WebGLStageRenderer.prototype.render = function () {
                    var self = this;
                    var stage = this._stage;
                    var options = this._options;
                    var context = this._context;
                    var gl = context.gl;

                    // TODO: Only set the camera once, not every frame.
                    if (options.perspectiveCamera) {
                        this._context.modelViewProjectionMatrix = this._context.createPerspectiveMatrix(options.perspectiveCameraDistance + (options.animateZoom ? Math.sin(Date.now() / 3000) * 0.8 : 0), options.perspectiveCameraFOV, options.perspectiveCameraAngle);
                    } else {
                        this._context.modelViewProjectionMatrix = this._context.create2DProjectionMatrix();
                    }

                    var brush = this._brush;

                    gl.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                    brush.reset();

                    var viewport = this._viewport;

                    GFX.enterTimeline("_renderFrame");
                    this._renderFrame(stage, stage.matrix, brush, viewport, 0);
                    GFX.leaveTimeline();

                    brush.flush();

                    if (options.paintViewport) {
                        brush.fillRectangle(viewport, new Color(0.5, 0, 0, 0.25), Matrix.createIdentity(), 0);
                        brush.flush();
                    }

                    this._renderSurfaces(brush);
                };
                return WebGLStageRenderer;
            })(GFX.StageRenderer);
            WebGL.WebGLStageRenderer = WebGLStageRenderer;
        })(GFX.WebGL || (GFX.WebGL = {}));
        var WebGL = GFX.WebGL;
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
        (function (WebGL) {
            var Color = Shumway.Color;
            var Point = GFX.Geometry.Point;

            var Matrix3D = GFX.Geometry.Matrix3D;

            var WebGLBrush = (function () {
                function WebGLBrush(context, geometry, target) {
                    this._target = target;
                    this._context = context;
                    this._geometry = geometry;
                }
                WebGLBrush.prototype.reset = function () {
                    Shumway.Debug.abstractMethod("reset");
                };

                WebGLBrush.prototype.flush = function () {
                    Shumway.Debug.abstractMethod("flush");
                };


                Object.defineProperty(WebGLBrush.prototype, "target", {
                    get: function () {
                        return this._target;
                    },
                    set: function (target) {
                        if (this._target !== target) {
                            this.flush();
                        }
                        this._target = target;
                    },
                    enumerable: true,
                    configurable: true
                });
                return WebGLBrush;
            })();
            WebGL.WebGLBrush = WebGLBrush;

            (function (WebGLCombinedBrushKind) {
                WebGLCombinedBrushKind[WebGLCombinedBrushKind["FillColor"] = 0] = "FillColor";
                WebGLCombinedBrushKind[WebGLCombinedBrushKind["FillTexture"] = 1] = "FillTexture";
                WebGLCombinedBrushKind[WebGLCombinedBrushKind["FillTextureWithColorMatrix"] = 2] = "FillTextureWithColorMatrix";
            })(WebGL.WebGLCombinedBrushKind || (WebGL.WebGLCombinedBrushKind = {}));
            var WebGLCombinedBrushKind = WebGL.WebGLCombinedBrushKind;

            var WebGLCombinedBrushVertex = (function (_super) {
                __extends(WebGLCombinedBrushVertex, _super);
                function WebGLCombinedBrushVertex(x, y, z) {
                    _super.call(this, x, y, z);
                    this.kind = 0 /* FillColor */;
                    this.color = new Color(0, 0, 0, 0);
                    this.sampler = 0;
                    this.coordinate = new Point(0, 0);
                }
                WebGLCombinedBrushVertex.initializeAttributeList = function (context) {
                    var gl = context.gl;
                    if (WebGLCombinedBrushVertex.attributeList) {
                        return;
                    }
                    WebGLCombinedBrushVertex.attributeList = new WebGL.WebGLAttributeList([
                        new WebGL.WebGLAttribute("aPosition", 3, gl.FLOAT),
                        new WebGL.WebGLAttribute("aCoordinate", 2, gl.FLOAT),
                        new WebGL.WebGLAttribute("aColor", 4, gl.UNSIGNED_BYTE, true),
                        new WebGL.WebGLAttribute("aKind", 1, gl.FLOAT),
                        new WebGL.WebGLAttribute("aSampler", 1, gl.FLOAT)
                    ]);
                    WebGLCombinedBrushVertex.attributeList.initialize(context);
                };

                WebGLCombinedBrushVertex.prototype.writeTo = function (geometry) {
                    var array = geometry.array;
                    array.ensureAdditionalCapacity(68);
                    array.writeVertex3DUnsafe(this.x, this.y, this.z);
                    array.writeVertexUnsafe(this.coordinate.x, this.coordinate.y);
                    array.writeColorUnsafe(this.color.r * 255, this.color.g * 255, this.color.b * 255, this.color.a * 255);
                    array.writeFloatUnsafe(this.kind);
                    array.writeFloatUnsafe(this.sampler);
                };
                return WebGLCombinedBrushVertex;
            })(WebGL.Vertex);
            WebGL.WebGLCombinedBrushVertex = WebGLCombinedBrushVertex;

            var WebGLCombinedBrush = (function (_super) {
                __extends(WebGLCombinedBrush, _super);
                function WebGLCombinedBrush(context, geometry, target) {
                    if (typeof target === "undefined") { target = null; }
                    _super.call(this, context, geometry, target);
                    this._blendMode = 1 /* Normal */;
                    this._program = context.createProgramFromFiles("combined.vert", "combined.frag");
                    this._surfaces = [];
                    WebGLCombinedBrushVertex.initializeAttributeList(this._context);
                }
                WebGLCombinedBrush.prototype.reset = function () {
                    this._surfaces = [];
                    this._geometry.reset();
                };

                WebGLCombinedBrush.prototype.drawImage = function (src, dstRectangle, color, colorMatrix, matrix, depth, blendMode) {
                    if (typeof depth === "undefined") { depth = 0; }
                    if (typeof blendMode === "undefined") { blendMode = 1 /* Normal */; }
                    if (!src || !src.surface) {
                        return true;
                    }
                    dstRectangle = dstRectangle.clone();
                    if (this._colorMatrix) {
                        if (!colorMatrix || !this._colorMatrix.equals(colorMatrix)) {
                            this.flush();
                        }
                    }
                    this._colorMatrix = colorMatrix;
                    if (this._blendMode !== blendMode) {
                        this.flush();
                        this._blendMode = blendMode;
                    }
                    var sampler = this._surfaces.indexOf(src.surface);
                    if (sampler < 0) {
                        if (this._surfaces.length === 8) {
                            this.flush();
                        }
                        this._surfaces.push(src.surface);

                        // if (this._surfaces.length > 8) {
                        //   return false;
                        //   notImplemented("Cannot handle more than 8 texture samplers.");
                        // }
                        sampler = this._surfaces.length - 1;
                    }
                    var tmpVertices = WebGLCombinedBrush._tmpVertices;
                    var srcRectangle = src.region.clone();

                    // TODO: This takes into the consideration the 1 pixel border added around tiles in the atlas. It should
                    // probably be moved elsewhere.
                    srcRectangle.offset(1, 1).resize(-2, -2);
                    srcRectangle.scale(1 / src.surface.w, 1 / src.surface.h);
                    matrix.transformRectangle(dstRectangle, tmpVertices);
                    for (var i = 0; i < 4; i++) {
                        tmpVertices[i].z = depth;
                    }
                    tmpVertices[0].coordinate.x = srcRectangle.x;
                    tmpVertices[0].coordinate.y = srcRectangle.y;
                    tmpVertices[1].coordinate.x = srcRectangle.x + srcRectangle.w;
                    tmpVertices[1].coordinate.y = srcRectangle.y;
                    tmpVertices[2].coordinate.x = srcRectangle.x + srcRectangle.w;
                    tmpVertices[2].coordinate.y = srcRectangle.y + srcRectangle.h;
                    tmpVertices[3].coordinate.x = srcRectangle.x;
                    tmpVertices[3].coordinate.y = srcRectangle.y + srcRectangle.h;

                    for (var i = 0; i < 4; i++) {
                        var vertex = WebGLCombinedBrush._tmpVertices[i];
                        vertex.kind = colorMatrix ? 2 /* FillTextureWithColorMatrix */ : 1 /* FillTexture */;
                        vertex.color.set(color);
                        vertex.sampler = sampler;
                        vertex.writeTo(this._geometry);
                    }
                    this._geometry.addQuad();
                    return true;
                };

                WebGLCombinedBrush.prototype.fillRectangle = function (rectangle, color, matrix, depth) {
                    if (typeof depth === "undefined") { depth = 0; }
                    matrix.transformRectangle(rectangle, WebGLCombinedBrush._tmpVertices);
                    for (var i = 0; i < 4; i++) {
                        var vertex = WebGLCombinedBrush._tmpVertices[i];
                        vertex.kind = 0 /* FillColor */;
                        vertex.color.set(color);
                        vertex.z = depth;
                        vertex.writeTo(this._geometry);
                    }
                    this._geometry.addQuad();
                };

                WebGLCombinedBrush.prototype.flush = function () {
                    GFX.enterTimeline("WebGLCombinedBrush.flush");
                    var g = this._geometry;
                    var p = this._program;
                    var gl = this._context.gl;
                    var matrix;

                    g.uploadBuffers();
                    gl.useProgram(p);
                    if (this._target) {
                        matrix = Matrix3D.create2DProjection(this._target.w, this._target.h, 2000);
                        matrix = Matrix3D.createMultiply(matrix, Matrix3D.createScale(1, -1, 1));
                    } else {
                        matrix = this._context.modelViewProjectionMatrix;
                    }
                    gl.uniformMatrix4fv(p.uniforms.uTransformMatrix3D.location, false, matrix.asWebGLMatrix());
                    if (this._colorMatrix) {
                        gl.uniformMatrix4fv(p.uniforms.uColorMatrix.location, false, this._colorMatrix.asWebGLMatrix());
                        gl.uniform4fv(p.uniforms.uColorVector.location, this._colorMatrix.asWebGLVector());
                    }

                    for (var i = 0; i < this._surfaces.length; i++) {
                        gl.activeTexture(gl.TEXTURE0 + i);
                        gl.bindTexture(gl.TEXTURE_2D, this._surfaces[i].texture);
                    }
                    gl.uniform1iv(p.uniforms["uSampler[0]"].location, [0, 1, 2, 3, 4, 5, 6, 7]);

                    // Bind vertex buffer.
                    gl.bindBuffer(gl.ARRAY_BUFFER, g.buffer);
                    var size = WebGLCombinedBrushVertex.attributeList.size;
                    var attributeList = WebGLCombinedBrushVertex.attributeList;
                    var attributes = attributeList.attributes;
                    for (var i = 0; i < attributes.length; i++) {
                        var attribute = attributes[i];
                        var position = p.attributes[attribute.name].location;
                        gl.enableVertexAttribArray(position);
                        gl.vertexAttribPointer(position, attribute.size, attribute.type, attribute.normalized, size, attribute.offset);
                    }

                    // this._context.setBlendMode(this._blendMode);
                    this._context.setBlendOptions();

                    // Bind target.
                    this._context.target = this._target;

                    // Bind elements buffer.
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.elementBuffer);

                    gl.drawElements(gl.TRIANGLES, g.triangleCount * 3, gl.UNSIGNED_SHORT, 0);
                    this.reset();
                    GFX.leaveTimeline("WebGLCombinedBrush.flush");
                };
                WebGLCombinedBrush._tmpVertices = WebGL.Vertex.createEmptyVertices(WebGLCombinedBrushVertex, 4);

                WebGLCombinedBrush._depth = 1;
                return WebGLCombinedBrush;
            })(WebGLBrush);
            WebGL.WebGLCombinedBrush = WebGLCombinedBrush;
        })(GFX.WebGL || (GFX.WebGL = {}));
        var WebGL = GFX.WebGL;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    (function (GFX) {
        (function (Canvas2D) {
            var assert = Shumway.Debug.assert;

            var originalSave = CanvasRenderingContext2D.prototype.save;
            var originalClip = CanvasRenderingContext2D.prototype.clip;
            var originalFill = CanvasRenderingContext2D.prototype.fill;
            var originalStroke = CanvasRenderingContext2D.prototype.stroke;
            var originalRestore = CanvasRenderingContext2D.prototype.restore;
            var originalBeginPath = CanvasRenderingContext2D.prototype.beginPath;

            function debugSave() {
                if (this.stackDepth === undefined) {
                    this.stackDepth = 0;
                }
                if (this.clipStack === undefined) {
                    this.clipStack = [0];
                } else {
                    this.clipStack.push(0);
                }
                this.stackDepth++;
                originalSave.call(this);
            }

            function debugRestore() {
                this.stackDepth--;
                this.clipStack.pop();
                originalRestore.call(this);
            }

            function debugFill() {
                assert(!this.buildingClippingRegionDepth);
                originalFill.apply(this, arguments);
            }

            function debugStroke() {
                assert(GFX.debugClipping.value || !this.buildingClippingRegionDepth);
                originalStroke.apply(this, arguments);
            }

            function debugBeginPath() {
                originalBeginPath.call(this);
            }

            function debugClip() {
                if (this.clipStack === undefined) {
                    this.clipStack = [0];
                }
                this.clipStack[this.clipStack.length - 1]++;
                if (GFX.debugClipping.value) {
                    this.strokeStyle = Shumway.ColorStyle.Pink;
                    this.stroke.apply(this, arguments);
                } else {
                    originalClip.apply(this, arguments);
                }
            }

            function notifyReleaseChanged() {
                if (release) {
                    CanvasRenderingContext2D.prototype.save = originalSave;
                    CanvasRenderingContext2D.prototype.clip = originalClip;
                    CanvasRenderingContext2D.prototype.fill = originalFill;
                    CanvasRenderingContext2D.prototype.stroke = originalStroke;
                    CanvasRenderingContext2D.prototype.restore = originalRestore;
                    CanvasRenderingContext2D.prototype.beginPath = originalBeginPath;
                } else {
                    CanvasRenderingContext2D.prototype.save = debugSave;
                    CanvasRenderingContext2D.prototype.clip = debugClip;
                    CanvasRenderingContext2D.prototype.fill = debugFill;
                    CanvasRenderingContext2D.prototype.stroke = debugStroke;
                    CanvasRenderingContext2D.prototype.restore = debugRestore;
                    CanvasRenderingContext2D.prototype.beginPath = debugBeginPath;
                }
            }
            Canvas2D.notifyReleaseChanged = notifyReleaseChanged;

            CanvasRenderingContext2D.prototype.enterBuildingClippingRegion = function () {
                if (!this.buildingClippingRegionDepth) {
                    this.buildingClippingRegionDepth = 0;
                }
                this.buildingClippingRegionDepth++;
            };

            CanvasRenderingContext2D.prototype.leaveBuildingClippingRegion = function () {
                this.buildingClippingRegionDepth--;
            };
        })(GFX.Canvas2D || (GFX.Canvas2D = {}));
        var Canvas2D = GFX.Canvas2D;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    (function (GFX) {
        (function (Canvas2D) {
            var Canvas2DSurfaceRegion = (function () {
                function Canvas2DSurfaceRegion(surface, region) {
                    this.surface = surface;
                    this.region = region;
                    // ...
                }
                return Canvas2DSurfaceRegion;
            })();
            Canvas2D.Canvas2DSurfaceRegion = Canvas2DSurfaceRegion;

            var Canvas2DSurface = (function () {
                function Canvas2DSurface(canvas, regionAllocator) {
                    this.canvas = canvas;
                    this.context = canvas.getContext("2d");
                    this.w = canvas.width;
                    this.h = canvas.height;
                    this._regionAllocator = regionAllocator;
                }
                Canvas2DSurface.prototype.allocate = function (w, h) {
                    var region = this._regionAllocator.allocate(w, h);
                    if (region) {
                        return new Canvas2DSurfaceRegion(this, region);
                    }
                    return null;
                };
                Canvas2DSurface.prototype.free = function (surfaceRegion) {
                    this._regionAllocator.free(surfaceRegion.region);
                };
                return Canvas2DSurface;
            })();
            Canvas2D.Canvas2DSurface = Canvas2DSurface;
        })(GFX.Canvas2D || (GFX.Canvas2D = {}));
        var Canvas2D = GFX.Canvas2D;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    (function (GFX) {
        (function (Canvas2D) {
            var Rectangle = Shumway.GFX.Geometry.Rectangle;

            var BlendMode = Shumway.GFX.BlendMode;

            var MipMap = Shumway.GFX.Geometry.MipMap;

            (function (FillRule) {
                FillRule[FillRule["NonZero"] = 0] = "NonZero";
                FillRule[FillRule["EvenOdd"] = 1] = "EvenOdd";
            })(Canvas2D.FillRule || (Canvas2D.FillRule = {}));
            var FillRule = Canvas2D.FillRule;

            var Canvas2DStageRendererOptions = (function (_super) {
                __extends(Canvas2DStageRendererOptions, _super);
                function Canvas2DStageRendererOptions() {
                    _super.apply(this, arguments);
                    /**
                    * Whether to force snapping matrices to device pixels.
                    */
                    this.snapToDevicePixels = true;
                    /**
                    * Whether to force image smoothing when drawing images.
                    */
                    this.imageSmoothing = true;
                    /**
                    * Whether to enablel blending.
                    */
                    this.blending = true;
                    /**
                    * Whether to cache shapes as images.
                    */
                    this.cacheShapes = true;
                    /**
                    * Shapes above this size are not cached.
                    */
                    this.cacheShapesMaxSize = 256;
                    /**
                    * Number of times a shape is rendered before it's elligible for caching.
                    */
                    this.cacheShapesThreshold = 16;
                }
                return Canvas2DStageRendererOptions;
            })(GFX.StageRendererOptions);
            Canvas2D.Canvas2DStageRendererOptions = Canvas2DStageRendererOptions;

            /**
            * Rendering state threaded through rendering methods.
            */
            var Canvas2DStageRendererState = (function () {
                function Canvas2DStageRendererState(options, clipRegion, ignoreMask) {
                    if (typeof clipRegion === "undefined") { clipRegion = false; }
                    if (typeof ignoreMask === "undefined") { ignoreMask = null; }
                    this.options = options;
                    this.clipRegion = clipRegion;
                    this.ignoreMask = ignoreMask;
                    // ...
                }
                return Canvas2DStageRendererState;
            })();
            Canvas2D.Canvas2DStageRendererState = Canvas2DStageRendererState;

            var Canvas2DStageRenderer = (function (_super) {
                __extends(Canvas2DStageRenderer, _super);
                function Canvas2DStageRenderer(canvas, stage, options) {
                    if (typeof options === "undefined") { options = new Canvas2DStageRendererOptions(); }
                    _super.call(this, canvas, stage, options);
                    var fillRule = 0 /* NonZero */;
                    var context = this.context = canvas.getContext("2d");
                    this._viewport = new Rectangle(0, 0, canvas.width, canvas.height);
                    this._fillRule = fillRule === 1 /* EvenOdd */ ? 'evenodd' : 'nonzero';
                    context.fillRule = context.mozFillRule = this._fillRule;
                    Canvas2DStageRenderer._prepareSurfaceAllocators();
                }
                Canvas2DStageRenderer._prepareSurfaceAllocators = function () {
                    if (Canvas2DStageRenderer._initializedCaches) {
                        return;
                    }

                    Canvas2DStageRenderer._surfaceCache = new GFX.SurfaceRegionAllocator.SimpleAllocator(function (w, h) {
                        var canvas = document.createElement("canvas");
                        if (typeof registerScratchCanvas !== "undefined") {
                            registerScratchCanvas(canvas);
                        }

                        // Surface caches are at least this size.
                        var W = Math.max(1024, w);
                        var H = Math.max(1024, h);
                        canvas.width = W;
                        canvas.height = H;
                        var allocator = null;
                        if (w >= 1024 || h >= 1024) {
                            // The requested size is pretty large, so create a single grid allocator
                            // with there requested size. This will only hold one image.
                            allocator = new GFX.RegionAllocator.GridAllocator(W, H, W, H);
                        } else {
                            allocator = new GFX.RegionAllocator.BucketAllocator(W, H);
                        }
                        return new Canvas2D.Canvas2DSurface(canvas, allocator);
                    });

                    Canvas2DStageRenderer._shapeCache = new GFX.SurfaceRegionAllocator.SimpleAllocator(function (w, h) {
                        var canvas = document.createElement("canvas");
                        if (typeof registerScratchCanvas !== "undefined") {
                            registerScratchCanvas(canvas);
                        }
                        var W = 1024, H = 1024;
                        canvas.width = W;
                        canvas.height = H;

                        // Shape caches can be compact since regions are never freed explicitly.
                        var allocator = allocator = new GFX.RegionAllocator.CompactAllocator(W, H);
                        return new Canvas2D.Canvas2DSurface(canvas, allocator);
                    });

                    Canvas2DStageRenderer._initializedCaches = true;
                };

                Canvas2DStageRenderer.prototype.resize = function () {
                    // TODO: We need to resize all the scratch canvases and recreate allocators.
                };

                Canvas2DStageRenderer.prototype.render = function () {
                    var stage = this._stage;
                    var context = this.context;

                    context.setTransform(1, 0, 0, 1, 0, 0);

                    context.save();
                    var options = this._options;

                    var lastDirtyRectangles = [];
                    var dirtyRectangles = lastDirtyRectangles.slice(0);

                    context.globalAlpha = 1;

                    var viewport = this._viewport;
                    this.renderFrame(stage, viewport, stage.matrix, true);

                    if (stage.trackDirtyRegions) {
                        stage.dirtyRegion.clear();
                    }

                    context.restore();

                    if (options && options.paintViewport) {
                        context.beginPath();
                        context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
                        context.strokeStyle = "#FF4981";
                        context.stroke();
                    }
                };

                Canvas2DStageRenderer.prototype.renderFrame = function (root, viewport, matrix, clearTargetBeforeRendering) {
                    if (typeof clearTargetBeforeRendering === "undefined") { clearTargetBeforeRendering = false; }
                    var context = this.context;
                    context.save();
                    if (!this._options.paintViewport) {
                        context.beginPath();
                        context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
                        context.clip();
                    }
                    if (clearTargetBeforeRendering) {
                        context.clearRect(viewport.x, viewport.y, viewport.w, viewport.h);
                    }
                    this._renderFrame(context, root, matrix, viewport, new Canvas2DStageRendererState(this._options));
                    context.restore();
                };

                /**
                * Renders the frame into a temporary surface region in device coordinates clipped by the viewport.
                */
                Canvas2DStageRenderer.prototype._renderToSurfaceRegion = function (frame, transform, viewport) {
                    var bounds = frame.getBounds();
                    var boundsAABB = bounds.clone();
                    transform.transformRectangleAABB(boundsAABB);
                    boundsAABB.snap();
                    var dx = boundsAABB.x;
                    var dy = boundsAABB.y;
                    var clippedBoundsAABB = boundsAABB.clone();
                    clippedBoundsAABB.intersect(viewport);
                    clippedBoundsAABB.snap();

                    dx += clippedBoundsAABB.x - boundsAABB.x;
                    dy += clippedBoundsAABB.y - boundsAABB.y;

                    var surfaceRegion = (Canvas2DStageRenderer._surfaceCache.allocate(clippedBoundsAABB.w, clippedBoundsAABB.h));
                    var region = surfaceRegion.region;

                    // Region bounds may be smaller than the allocated surface region.
                    var surfaceRegionBounds = new Rectangle(region.x, region.y, clippedBoundsAABB.w, clippedBoundsAABB.h);

                    var context = surfaceRegion.surface.context;
                    context.setTransform(1, 0, 0, 1, 0, 0);

                    // Prepare region bounds for painting.
                    context.clearRect(surfaceRegionBounds.x, surfaceRegionBounds.y, surfaceRegionBounds.w, surfaceRegionBounds.h);
                    transform = transform.clone();

                    transform.translate(surfaceRegionBounds.x - dx, surfaceRegionBounds.y - dy);

                    // Clip region bounds so we don't paint outside.
                    context.save();
                    context.beginPath();
                    context.rect(surfaceRegionBounds.x, surfaceRegionBounds.y, surfaceRegionBounds.w, surfaceRegionBounds.h);
                    context.clip();
                    this._renderFrame(context, frame, transform, surfaceRegionBounds, new Canvas2DStageRendererState(this._options));
                    context.restore();
                    return {
                        surfaceRegion: surfaceRegion,
                        surfaceRegionBounds: surfaceRegionBounds,
                        clippedBounds: clippedBoundsAABB
                    };
                };

                Canvas2DStageRenderer.prototype._renderShape = function (context, shape, matrix, viewport, state) {
                    var self = this;
                    var bounds = shape.getBounds();
                    if (!bounds.isEmpty() && state.options.paintRenderable) {
                        var source = shape.source;
                        var renderCount = source.properties["renderCount"] || 0;
                        var cacheShapesMaxSize = state.options.cacheShapesMaxSize;
                        var matrixScale = Math.max(matrix.getAbsoluteScaleX(), matrix.getAbsoluteScaleY());
                        if (!state.clipRegion && !source.hasFlags(1 /* Dynamic */) && state.options.cacheShapes && renderCount > state.options.cacheShapesThreshold && bounds.w * matrixScale <= cacheShapesMaxSize && bounds.h * matrixScale <= cacheShapesMaxSize) {
                            var mipMap = source.properties["mipMap"];
                            if (!mipMap) {
                                mipMap = source.properties["mipMap"] = new MipMap(source, Canvas2DStageRenderer._shapeCache, cacheShapesMaxSize);
                            }
                            var mipMapLevel = mipMap.getLevel(matrix);
                            var mipMapLevelSurfaceRegion = (mipMapLevel.surfaceRegion);
                            var region = mipMapLevelSurfaceRegion.region;
                            if (mipMapLevel) {
                                context.drawImage(mipMapLevelSurfaceRegion.surface.canvas, region.x, region.y, region.w, region.h, bounds.x, bounds.y, bounds.w, bounds.h);
                            }
                            if (state.options.paintFlashing) {
                                context.fillStyle = Shumway.ColorStyle.Green;
                                context.globalAlpha = 0.5;
                                context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
                            }
                        } else {
                            source.properties["renderCount"] = ++renderCount;
                            source.render(context, null, state.clipRegion);
                            if (state.options.paintFlashing) {
                                context.fillStyle = Shumway.ColorStyle.randomStyle();
                                context.globalAlpha = 0.1;
                                context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
                            }
                        }
                    }
                };

                Canvas2DStageRenderer.prototype._renderFrame = function (context, root, matrix, viewport, state, skipRoot) {
                    if (typeof skipRoot === "undefined") { skipRoot = false; }
                    var self = this;
                    root.visit(function visitFrame(frame, matrix, flags) {
                        if (skipRoot && root === frame) {
                            return 0 /* Continue */;
                        }

                        if (!frame._hasFlags(16384 /* Visible */)) {
                            return 2 /* Skip */;
                        }

                        var bounds = frame.getBounds();

                        if (state.ignoreMask !== frame && frame.mask && !state.clipRegion) {
                            context.save();
                            self._renderFrame(context, frame.mask, frame.mask.getConcatenatedMatrix(), viewport, new Canvas2DStageRendererState(state.options, true));
                            self._renderFrame(context, frame, matrix, viewport, new Canvas2DStageRendererState(state.options, false, frame));
                            context.restore();
                            return 2 /* Skip */;
                        }

                        if (flags & 4096 /* EnterClip */) {
                            context.save();
                            context.enterBuildingClippingRegion();
                            self._renderFrame(context, frame, matrix, viewport, new Canvas2DStageRendererState(state.options, true));
                            context.leaveBuildingClippingRegion();
                            return;
                        } else if (flags & 8192 /* LeaveClip */) {
                            context.restore();
                            return;
                        }

                        // Return early if the bounds are not within the viewport.
                        if (!viewport.intersectsTransformedAABB(bounds, matrix)) {
                            return 2 /* Skip */;
                        }

                        if (frame.pixelSnapping === 1 /* Always */ || state.options.snapToDevicePixels) {
                            matrix.snap();
                        }

                        context.imageSmoothingEnabled = frame.smoothing === 1 /* Always */ || state.options.imageSmoothing;

                        context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
                        context.globalAlpha = frame.getConcatenatedAlpha();

                        if (flags & 2 /* IsMask */ && !state.clipRegion) {
                            return 2 /* Skip */;
                        }

                        var boundsAABB = frame.getBounds().clone();
                        matrix.transformRectangleAABB(boundsAABB);
                        boundsAABB.snap();

                        if (frame !== root && state.options.blending) {
                            context.globalCompositeOperation = self._getCompositeOperation(frame.blendMode);
                            if (frame.blendMode !== 1 /* Normal */) {
                                var result = self._renderToSurfaceRegion(frame, matrix, viewport);
                                var surfaceRegion = result.surfaceRegion;
                                var surfaceRegionBounds = result.surfaceRegionBounds;
                                var clippedBounds = result.clippedBounds;
                                var region = surfaceRegion.region;
                                context.setTransform(1, 0, 0, 1, 0, 0);
                                context.drawImage(surfaceRegion.surface.canvas, surfaceRegionBounds.x, surfaceRegionBounds.y, surfaceRegionBounds.w, surfaceRegionBounds.h, clippedBounds.x, clippedBounds.y, surfaceRegionBounds.w, surfaceRegionBounds.h);
                                surfaceRegion.surface.free(surfaceRegion);
                                return 2 /* Skip */;
                            }
                        }

                        if (frame instanceof GFX.Shape) {
                            frame._previouslyRenderedAABB = boundsAABB;
                            self._renderShape(context, frame, matrix, viewport, state);
                        } else if (frame instanceof GFX.ClipRectangle) {
                            var clipRectangle = frame;
                            context.save();
                            context.beginPath();
                            context.rect(bounds.x, bounds.y, bounds.w, bounds.h);
                            context.clip();
                            boundsAABB.intersect(viewport);

                            // Fill Background
                            context.fillStyle = clipRectangle.color.toCSSStyle();
                            context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);

                            self._renderFrame(context, frame, matrix, boundsAABB, state, true);
                            context.restore();
                            return 2 /* Skip */;
                        } else if (state.options.paintBounds && frame instanceof GFX.FrameContainer) {
                            var bounds = frame.getBounds().clone();
                            context.strokeStyle = Shumway.ColorStyle.LightOrange;
                            context.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
                        }
                        return 0 /* Continue */;
                    }, matrix, 0 /* Empty */, 16 /* Clips */);
                };

                Canvas2DStageRenderer.prototype._getCompositeOperation = function (blendMode) {
                    // TODO:
                    // These Flash blend modes have no canvas equivalent:
                    // - blendModeClass.SUBTRACT
                    // - blendModeClass.INVERT
                    // - blendModeClass.SHADER
                    // - blendModeClass.ADD
                    // These blend modes are actually Porter-Duff compositing operators.
                    // The backdrop is the nearest parent with blendMode set to LAYER.
                    // When there is no LAYER parent, they are ignored (treated as NORMAL).
                    // - blendModeClass.ALPHA (destination-in)
                    // - blendModeClass.ERASE (destination-out)
                    // - blendModeClass.LAYER [defines backdrop]
                    var compositeOp = "source-over";
                    switch (blendMode) {
                        case 3 /* Multiply */:
                            compositeOp = "multiply";
                            break;
                        case 4 /* Screen */:
                            compositeOp = "screen";
                            break;
                        case 5 /* Lighten */:
                            compositeOp = "lighten";
                            break;
                        case 6 /* Darken */:
                            compositeOp = "darken";
                            break;
                        case 7 /* Difference */:
                            compositeOp = "difference";
                            break;
                        case 13 /* Overlay */:
                            compositeOp = "overlay";
                            break;
                        case 14 /* HardLight */:
                            compositeOp = "hard-light";
                            break;
                    }
                    return compositeOp;
                };
                Canvas2DStageRenderer._initializedCaches = false;
                return Canvas2DStageRenderer;
            })(GFX.StageRenderer);
            Canvas2D.Canvas2DStageRenderer = Canvas2DStageRenderer;
        })(GFX.Canvas2D || (GFX.Canvas2D = {}));
        var Canvas2D = GFX.Canvas2D;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    (function (GFX) {
        var VisitorFlags = Shumway.GFX.VisitorFlags;

        var DOMStageRenderer = (function () {
            function DOMStageRenderer(container, pixelRatio) {
                this.container = container;
                this.pixelRatio = pixelRatio;
            }
            DOMStageRenderer.prototype.render = function (stage, options) {
                var stageScale = 1 / this.pixelRatio;
                var that = this;
                stage.visit(function visitFrame(frame, transform) {
                    transform = transform.clone();
                    transform.scale(stageScale, stageScale);
                    if (frame instanceof GFX.Shape) {
                        var shape = frame;
                        var div = that.getDIV(shape);
                        div.style.transform = div.style["webkitTransform"] = transform.toCSSTransform();
                    }
                    return 0 /* Continue */;
                }, stage.matrix);
            };

            /**
            * Constructs a div element with a canvas element inside of it.
            */
            DOMStageRenderer.prototype.getDIV = function (shape) {
                var shapeProperties = shape.properties;
                var div = shapeProperties["div"];
                if (!div) {
                    div = shapeProperties["div"] = document.createElement("div");

                    // div.style.backgroundColor = Shumway.ColorStyle.randomStyle();
                    div.style.width = shape.w + "px";
                    div.style.height = shape.h + "px";
                    div.style.position = "absolute";
                    var canvas = document.createElement("canvas");
                    canvas.width = shape.w;
                    canvas.height = shape.h;
                    shape.source.render(canvas.getContext("2d"));
                    div.appendChild(canvas);
                    div.style.transformOrigin = div.style["webkitTransformOrigin"] = 0 + "px " + 0 + "px";
                    div.appendChild(canvas);
                    this.container.appendChild(div);
                }
                return div;
            };
            return DOMStageRenderer;
        })();
        GFX.DOMStageRenderer = DOMStageRenderer;
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
        var Rectangle = GFX.Geometry.Rectangle;

        var WebGLStageRenderer = Shumway.GFX.WebGL.WebGLStageRenderer;
        var WebGLStageRendererOptions = Shumway.GFX.WebGL.WebGLStageRendererOptions;

        var FPS = Shumway.Tools.Mini.FPS;

        var State = (function () {
            function State() {
            }
            State.prototype.onMouseUp = function (easel, event) {
                easel.state = this;
            };

            State.prototype.onMouseDown = function (easel, event) {
                easel.state = this;
            };

            State.prototype.onMouseMove = function (easel, event) {
                easel.state = this;
            };

            State.prototype.onMouseClick = function (easel, event) {
                easel.state = this;
            };

            State.prototype.onKeyUp = function (easel, event) {
                easel.state = this;
            };

            State.prototype.onKeyDown = function (easel, event) {
                easel.state = this;
            };

            State.prototype.onKeyPress = function (easel, event) {
                easel.state = this;
            };
            return State;
        })();
        GFX.State = State;

        var StartState = (function (_super) {
            __extends(StartState, _super);
            function StartState() {
                _super.apply(this, arguments);
                this._keyCodes = [];
            }
            StartState.prototype.onMouseDown = function (easel, event) {
                if (this._keyCodes[32]) {
                    easel.state = new DragState(easel.worldView, easel.getMousePosition(event, null), easel.worldView.matrix.clone());
                } else {
                    // easel.state = new MouseDownState();
                }
            };

            StartState.prototype.onMouseClick = function (easel, event) {
            };

            StartState.prototype.onKeyDown = function (easel, event) {
                this._keyCodes[event.keyCode] = true;
                this._updateCursor(easel);
            };

            StartState.prototype.onKeyUp = function (easel, event) {
                this._keyCodes[event.keyCode] = false;
                this._updateCursor(easel);
            };

            StartState.prototype._updateCursor = function (easel) {
                if (this._keyCodes[32]) {
                    easel.cursor = "move";
                } else {
                    easel.cursor = "auto";
                }
            };
            return StartState;
        })(State);

        var PersistentState = (function (_super) {
            __extends(PersistentState, _super);
            function PersistentState() {
                _super.apply(this, arguments);
                this._keyCodes = [];
                this._paused = false;
                this._mousePosition = new Point(0, 0);
            }
            PersistentState.prototype.onMouseMove = function (easel, event) {
                this._mousePosition = easel.getMousePosition(event, null);
                this._update(easel);
            };

            PersistentState.prototype.onMouseDown = function (easel, event) {
            };

            PersistentState.prototype.onMouseClick = function (easel, event) {
            };

            PersistentState.prototype.onKeyPress = function (easel, event) {
                if (event.keyCode === 112) {
                    this._paused = !this._paused;
                }
                if (this._keyCodes[83]) {
                    easel.toggleOption("paintRenderable");
                }
                if (this._keyCodes[86]) {
                    easel.toggleOption("paintViewport");
                }
                if (this._keyCodes[66]) {
                    easel.toggleOption("paintBounds");
                }
                if (this._keyCodes[70]) {
                    easel.toggleOption("paintFlashing");
                }
                this._update(easel);
            };

            PersistentState.prototype.onKeyDown = function (easel, event) {
                this._keyCodes[event.keyCode] = true;
                this._update(easel);
            };

            PersistentState.prototype.onKeyUp = function (easel, event) {
                this._keyCodes[event.keyCode] = false;
                this._update(easel);
            };

            PersistentState.prototype._update = function (easel) {
                easel.paused = this._paused;
                if (easel.getOption("paintViewport")) {
                    var w = GFX.viewportLoupeDiameter.value, h = GFX.viewportLoupeDiameter.value;
                    easel.viewport = new Rectangle(this._mousePosition.x - w / 2, this._mousePosition.y - h / 2, w, h);
                } else {
                    easel.viewport = null;
                }
            };
            return PersistentState;
        })(State);

        var MouseDownState = (function (_super) {
            __extends(MouseDownState, _super);
            function MouseDownState() {
                _super.apply(this, arguments);
                this._startTime = Date.now();
            }
            MouseDownState.prototype.onMouseMove = function (easel, event) {
                if (Date.now() - this._startTime < 10) {
                    return;
                }
                var frame = easel.queryFrameUnderMouse(event);
                if (frame && frame.hasCapability(1 /* AllowMatrixWrite */)) {
                    easel.state = new DragState(frame, easel.getMousePosition(event, null), frame.matrix.clone());
                }
            };

            MouseDownState.prototype.onMouseUp = function (easel, event) {
                easel.state = new StartState();
                easel.selectFrameUnderMouse(event);
            };
            return MouseDownState;
        })(State);

        var DragState = (function (_super) {
            __extends(DragState, _super);
            function DragState(target, startPosition, startMatrix) {
                _super.call(this);
                this._target = target;
                this._startPosition = startPosition;
                this._startMatrix = startMatrix;
            }
            DragState.prototype.onMouseMove = function (easel, event) {
                event.preventDefault();
                var p = easel.getMousePosition(event, null);
                p.sub(this._startPosition);
                this._target.matrix = this._startMatrix.clone().translate(p.x, p.y);
                easel.state = this;
            };
            DragState.prototype.onMouseUp = function (easel, event) {
                easel.state = new StartState();
            };
            return DragState;
        })(State);

        var Easel = (function () {
            function Easel(container, backend, disableHidpi) {
                if (typeof disableHidpi === "undefined") { disableHidpi = false; }
                this._state = new StartState();
                this._persistentState = new PersistentState();
                this.paused = false;
                this.viewport = null;
                this._selectedFrames = [];
                this._eventListeners = Shumway.ObjectUtilities.createEmptyObject();
                var stage = this._stage = new GFX.Stage(128, 128, true);
                this._worldView = new GFX.FrameContainer();
                this._worldViewOverlay = new GFX.FrameContainer();
                this._world = new GFX.FrameContainer();
                this._stage.addChild(this._worldView);
                this._worldView.addChild(this._world);
                this._worldView.addChild(this._worldViewOverlay);
                this._disableHidpi = disableHidpi;

                var fpsCanvasContainer = document.createElement("div");
                fpsCanvasContainer.style.position = "absolute";
                fpsCanvasContainer.style.top = "0";
                fpsCanvasContainer.style.width = "100%";
                fpsCanvasContainer.style.height = "10px";
                this._fpsCanvas = document.createElement("canvas");
                fpsCanvasContainer.appendChild(this._fpsCanvas);
                container.appendChild(fpsCanvasContainer);
                this._fps = new FPS(this._fpsCanvas);

                window.addEventListener('resize', this._deferredResizeHandler.bind(this), false);

                var options = this._options = [];
                var canvases = this._canvases = [];
                var renderers = this._renderers = [];

                function addCanvas2DBackend() {
                    var canvas = document.createElement("canvas");
                    canvas.style.backgroundColor = "#14171a";
                    container.appendChild(canvas);
                    canvases.push(canvas);
                    var o = new GFX.Canvas2D.Canvas2DStageRendererOptions();
                    options.push(o);
                    renderers.push(new GFX.Canvas2D.Canvas2DStageRenderer(canvas, stage, o));
                }

                function addWebGLBackend() {
                    var canvas = document.createElement("canvas");
                    canvas.style.backgroundColor = "#14171a";
                    container.appendChild(canvas);
                    canvases.push(canvas);
                    var o = new WebGLStageRendererOptions();
                    options.push(o);
                    renderers.push(new WebGLStageRenderer(canvas, stage, o));
                }

                switch (backend) {
                    case 0 /* Canvas2D */:
                        addCanvas2DBackend();
                        break;
                    case 1 /* WebGL */:
                        addWebGLBackend();
                        break;
                    case 2 /* Both */:
                        addCanvas2DBackend();
                        addWebGLBackend();
                        break;
                }

                this._resizeHandler();
                this._onMouseUp = this._onMouseUp.bind(this);
                this._onMouseDown = this._onMouseDown.bind(this);
                this._onMouseMove = this._onMouseMove.bind(this);

                var self = this;

                window.addEventListener("mouseup", function (event) {
                    self._state.onMouseUp(self, event);
                    self._render();
                }, false);

                window.addEventListener("mousemove", function (event) {
                    var p = self.getMousePosition(event, self._world);
                    self._state.onMouseMove(self, event);
                    self._persistentState.onMouseMove(self, event);
                }, false);

                canvases.forEach(function (canvas) {
                    return canvas.addEventListener("mousedown", function (event) {
                        self._state.onMouseDown(self, event);
                    }, false);
                });

                window.addEventListener("keydown", function (event) {
                    self._state.onKeyDown(self, event);
                    self._persistentState.onKeyDown(self, event);
                }, false);

                window.addEventListener("keypress", function (event) {
                    self._state.onKeyPress(self, event);
                    self._persistentState.onKeyPress(self, event);
                }, false);

                window.addEventListener("keyup", function (event) {
                    self._state.onKeyUp(self, event);
                    self._persistentState.onKeyUp(self, event);
                }, false);

                this._enterRenderLoop();
            }
            /**
            * Primitive event dispatching features.
            */
            Easel.prototype.addEventListener = function (type, listener) {
                if (!this._eventListeners[type]) {
                    this._eventListeners[type] = [];
                }
                this._eventListeners[type].push(listener);
            };

            Easel.prototype._dispatchEvent = function (type) {
                var listeners = this._eventListeners[type];
                if (!listeners) {
                    return;
                }
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i]();
                }
            };

            Easel.prototype._enterRenderLoop = function () {
                var self = this;
                requestAnimationFrame(function tick() {
                    self.render();
                    requestAnimationFrame(tick);
                });
            };

            Object.defineProperty(Easel.prototype, "state", {
                set: function (state) {
                    this._state = state;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Easel.prototype, "cursor", {
                set: function (cursor) {
                    this._canvases.forEach(function (x) {
                        return x.style.cursor = cursor;
                    });
                },
                enumerable: true,
                configurable: true
            });

            Easel.prototype._render = function () {
                var mustRender = (this._stage.readyToRender() || GFX.forcePaint.value) && !this.paused;
                if (mustRender) {
                    for (var i = 0; i < this._renderers.length; i++) {
                        var renderer = this._renderers[i];
                        if (this.viewport) {
                            renderer.viewport = this.viewport;
                        } else {
                            renderer.viewport = new Rectangle(0, 0, this._canvases[i].width, this._canvases[i].height);
                        }
                        this._dispatchEvent("render");
                        GFX.enterTimeline("Render");
                        renderer.render();
                        GFX.leaveTimeline("Render");
                    }
                }
                this._fps.tickAndRender(!mustRender);
            };

            Easel.prototype.render = function () {
                this._render();
            };

            Object.defineProperty(Easel.prototype, "world", {
                get: function () {
                    return this._world;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Easel.prototype, "worldView", {
                get: function () {
                    return this._worldView;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Easel.prototype, "worldOverlay", {
                get: function () {
                    return this._worldViewOverlay;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Easel.prototype, "stage", {
                get: function () {
                    return this._stage;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Easel.prototype, "options", {
                get: function () {
                    return this._options[0];
                },
                enumerable: true,
                configurable: true
            });

            Easel.prototype.toggleOption = function (name) {
                for (var i = 0; i < this._options.length; i++) {
                    var option = this._options[i];
                    option[name] = !option[name];
                }
            };

            Easel.prototype.getOption = function (name) {
                return this._options[0][name];
            };

            Easel.prototype._deferredResizeHandler = function () {
                clearTimeout(this._deferredResizeHandlerTimeout);
                this._deferredResizeHandlerTimeout = setTimeout(this._resizeHandler.bind(this), 1000);
            };

            Easel.prototype._resizeHandler = function () {
                var devicePixelRatio = window.devicePixelRatio || 1;
                var backingStoreRatio = 1;
                var ratio = 1;
                if (devicePixelRatio !== backingStoreRatio && !this._disableHidpi) {
                    ratio = devicePixelRatio / backingStoreRatio;
                }

                for (var i = 0; i < this._canvases.length; i++) {
                    var canvas = this._canvases[i];
                    var parent = canvas.parentElement;
                    var cw = parent.clientWidth;
                    var ch = (parent.clientHeight) / this._canvases.length;

                    if (ratio > 1) {
                        canvas.width = cw * ratio;
                        canvas.height = ch * ratio;
                        canvas.style.width = cw + 'px';
                        canvas.style.height = ch + 'px';
                    } else {
                        canvas.width = cw;
                        canvas.height = ch;
                    }
                    this._stage.w = canvas.width;
                    this._stage.h = canvas.height;
                    this._renderers[i].resize();
                }
                this._stage.matrix.set(new Matrix(ratio, 0, 0, ratio, 0, 0));
            };

            Easel.prototype.resize = function () {
                this._resizeHandler();
            };

            Easel.prototype.queryFrameUnderMouse = function (event) {
                var frames = this.stage.queryFramesByPoint(this.getMousePosition(event, null), true, true);
                return frames.length > 0 ? frames[0] : null;
            };

            Easel.prototype.selectFrameUnderMouse = function (event) {
                var frame = this.queryFrameUnderMouse(event);
                if (frame && frame.hasCapability(1 /* AllowMatrixWrite */)) {
                    this._selectedFrames.push(frame);
                } else {
                    this._selectedFrames = [];
                }
                this._render();
            };

            Easel.prototype.getMousePosition = function (event, coordinateSpace) {
                var canvas = this._canvases[0];
                var bRect = canvas.getBoundingClientRect();
                var x = (event.clientX - bRect.left) * (canvas.width / bRect.width);
                var y = (event.clientY - bRect.top) * (canvas.height / bRect.height);
                var p = new Point(x, y);
                if (!coordinateSpace) {
                    return p;
                }
                var m = Matrix.createIdentity();
                coordinateSpace.getConcatenatedMatrix().inverse(m);
                m.transformPoint(p);
                return p;
            };

            Easel.prototype.getMouseWorldPosition = function (event) {
                return this.getMousePosition(event, this._world);
            };

            Easel.prototype._onMouseDown = function (event) {
                this._renderers.forEach(function (renderer) {
                    return renderer.render();
                });
            };

            Easel.prototype._onMouseUp = function (event) {
            };

            Easel.prototype._onMouseMove = function (event) {
            };
            return Easel;
        })();
        GFX.Easel = Easel;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    (function (GFX) {
        var Rectangle = Shumway.GFX.Geometry.Rectangle;

        var Matrix = Shumway.GFX.Geometry.Matrix;

        (function (Layout) {
            Layout[Layout["Simple"] = 0] = "Simple";
        })(GFX.Layout || (GFX.Layout = {}));
        var Layout = GFX.Layout;

        var TreeStageRendererOptions = (function (_super) {
            __extends(TreeStageRendererOptions, _super);
            function TreeStageRendererOptions() {
                _super.apply(this, arguments);
                this.layout = 0 /* Simple */;
            }
            return TreeStageRendererOptions;
        })(GFX.StageRendererOptions);
        GFX.TreeStageRendererOptions = TreeStageRendererOptions;

        var TreeStageRenderer = (function (_super) {
            __extends(TreeStageRenderer, _super);
            function TreeStageRenderer(canvas, stage, options) {
                if (typeof options === "undefined") { options = new TreeStageRendererOptions(); }
                _super.call(this, canvas, stage, options);
                this.context = canvas.getContext("2d");
                this._viewport = new Rectangle(0, 0, canvas.width, canvas.height);
            }
            TreeStageRenderer.prototype.render = function () {
                var context = this.context;
                context.save();
                context.clearRect(0, 0, this._stage.w, this._stage.h);
                context.scale(1, 1);
                if (this._options.layout === 0 /* Simple */) {
                    this._renderFrameSimple(this.context, this._stage, Matrix.createIdentity(), this._viewport, []);
                }
                context.restore();
            };

            TreeStageRenderer.clearContext = function (context, rectangle) {
                var canvas = context.canvas;
                context.clearRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
            };

            TreeStageRenderer.prototype._renderFrameSimple = function (context, root, transform, clipRectangle, cullRectanglesAABB) {
                var self = this;
                context.save();
                context.fillStyle = "white";
                var x = 0, y = 0;
                var w = 6, h = 2, hPadding = 1, wColPadding = 8;
                var colX = 0;
                var maxX = 0;
                function visit(frame) {
                    var isFrameContainer = frame instanceof GFX.FrameContainer;
                    if (frame._hasFlags(512 /* InvalidPaint */)) {
                        context.fillStyle = "red";
                    } else if (frame._hasFlags(64 /* InvalidConcatenatedMatrix */)) {
                        context.fillStyle = "blue";
                    } else {
                        context.fillStyle = "white";
                    }
                    var t = isFrameContainer ? 2 : w;
                    context.fillRect(x, y, t, h);
                    if (isFrameContainer) {
                        x += t + 2;
                        maxX = Math.max(maxX, x + w);
                        var frameContainer = frame;
                        var children = frameContainer._children;
                        for (var i = 0; i < children.length; i++) {
                            visit(children[i]);
                            if (i < children.length - 1) {
                                y += h + hPadding;
                                if (y > self._canvas.height) {
                                    context.fillStyle = "gray";
                                    context.fillRect(maxX + 4, 0, 2, self._canvas.height);
                                    x = x - colX + maxX + wColPadding;
                                    colX = maxX + wColPadding;
                                    y = 0;
                                    context.fillStyle = "white";
                                }
                            }
                        }
                        x -= t + 2;
                    }
                }
                visit(root);
                context.restore();
            };
            return TreeStageRenderer;
        })(GFX.StageRenderer);
        GFX.TreeStageRenderer = TreeStageRenderer;
    })(Shumway.GFX || (Shumway.GFX = {}));
    var GFX = Shumway.GFX;
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
        (function (GFX) {
            var FrameFlags = Shumway.GFX.FrameFlags;
            var Shape = Shumway.GFX.Shape;

            var RenderableShape = Shumway.GFX.RenderableShape;
            var RenderableBitmap = Shumway.GFX.RenderableBitmap;
            var RenderableText = Shumway.GFX.RenderableText;
            var ColorMatrix = Shumway.GFX.ColorMatrix;
            var FrameContainer = Shumway.GFX.FrameContainer;
            var ClipRectangle = Shumway.GFX.ClipRectangle;
            var ShapeData = Shumway.ShapeData;
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;

            var Matrix = Shumway.GFX.Geometry.Matrix;
            var Rectangle = Shumway.GFX.Geometry.Rectangle;

            var assert = Shumway.Debug.assert;
            var writer = null;

            var GFXChannelSerializer = (function () {
                function GFXChannelSerializer() {
                }
                GFXChannelSerializer.prototype.writeMouseEvent = function (event, point) {
                    var output = this.output;
                    output.writeInt(300 /* MouseEvent */);
                    var typeId = Shumway.Remoting.MouseEventNames.indexOf(event.type);
                    output.writeInt(typeId);
                    output.writeFloat(point.x);
                    output.writeFloat(point.y);
                    output.writeInt(event.buttons);
                    var flags = (event.ctrlKey ? 1 /* CtrlKey */ : 0) | (event.altKey ? 2 /* AltKey */ : 0) | (event.shiftKey ? 4 /* ShiftKey */ : 0);
                    output.writeInt(flags);
                };

                GFXChannelSerializer.prototype.writeKeyboardEvent = function (event) {
                    var output = this.output;
                    output.writeInt(301 /* KeyboardEvent */);
                    var typeId = Shumway.Remoting.KeyboardEventNames.indexOf(event.type);
                    output.writeInt(typeId);
                    output.writeInt(event.keyCode);
                    output.writeInt(event.charCode);
                    output.writeInt(event.location);
                    var flags = (event.ctrlKey ? 1 /* CtrlKey */ : 0) | (event.altKey ? 2 /* AltKey */ : 0) | (event.shiftKey ? 4 /* ShiftKey */ : 0);
                    output.writeInt(flags);
                };

                GFXChannelSerializer.prototype.writeFocusEvent = function (type) {
                    var output = this.output;
                    output.writeInt(302 /* FocusEvent */);
                    output.writeInt(type);
                };
                return GFXChannelSerializer;
            })();
            GFX.GFXChannelSerializer = GFXChannelSerializer;

            var GFXChannelDeserializerContext = (function () {
                function GFXChannelDeserializerContext(root) {
                    this.root = new ClipRectangle(128, 128);
                    root.addChild(this.root);
                    this._frames = [];
                    this._assets = [];
                }
                GFXChannelDeserializerContext.prototype._registerAsset = function (id, symbolId, asset) {
                    if (typeof registerInspectorAsset !== "undefined") {
                        registerInspectorAsset(id, symbolId, asset);
                    }
                    this._assets[id] = asset;
                };

                GFXChannelDeserializerContext.prototype._makeFrame = function (id) {
                    if (id === -1) {
                        return null;
                    }
                    if (id & 134217728 /* Asset */) {
                        id &= ~134217728 /* Asset */;
                        var shape = new Shape(this._assets[id]);
                        this._assets[id].addFrameReferrer(shape);
                        return shape;
                    } else {
                        return this._frames[id];
                    }
                };

                GFXChannelDeserializerContext.prototype._getAsset = function (id) {
                    return this._assets[id];
                };

                GFXChannelDeserializerContext.prototype._getBitmapAsset = function (id) {
                    return this._assets[id];
                };

                GFXChannelDeserializerContext.prototype._getTextAsset = function (id) {
                    return this._assets[id];
                };
                return GFXChannelDeserializerContext;
            })();
            GFX.GFXChannelDeserializerContext = GFXChannelDeserializerContext;

            var GFXChannelDeserializer = (function () {
                function GFXChannelDeserializer() {
                }
                GFXChannelDeserializer.prototype.read = function () {
                    var tag = 0;
                    var input = this.input;

                    var data = {
                        bytesAvailable: input.bytesAvailable,
                        updateGraphics: 0,
                        updateBitmapData: 0,
                        updateTextContent: 0,
                        updateFrame: 0,
                        updateStage: 0,
                        registerFont: 0,
                        drawToBitmap: 0
                    };
                    Shumway.GFX.enterTimeline("GFXChannelDeserializer.read", data);
                    while (input.bytesAvailable > 0) {
                        tag = input.readInt();
                        switch (tag) {
                            case 0 /* EOF */:
                                Shumway.GFX.leaveTimeline("GFXChannelDeserializer.read");
                                return;
                            case 101 /* UpdateGraphics */:
                                data.updateGraphics++;
                                this._readUpdateGraphics();
                                break;
                            case 102 /* UpdateBitmapData */:
                                data.updateBitmapData++;
                                this._readUpdateBitmapData();
                                break;
                            case 103 /* UpdateTextContent */:
                                data.updateTextContent++;
                                this._readUpdateTextContent();
                                break;
                            case 100 /* UpdateFrame */:
                                data.updateFrame++;
                                this._readUpdateFrame();
                                break;
                            case 104 /* UpdateStage */:
                                data.updateStage++;
                                this._readUpdateStage();
                                break;
                            case 200 /* RegisterFont */:
                                data.registerFont++;
                                this._readRegisterFont();
                                break;
                            case 201 /* DrawToBitmap */:
                                data.drawToBitmap++;
                                this._readDrawToBitmap();
                                break;
                            default:
                                release || assert(false, 'Unknown MessageReader tag: ' + tag);
                                break;
                        }
                    }
                    Shumway.GFX.leaveTimeline("GFXChannelDeserializer.read");
                };

                GFXChannelDeserializer.prototype._readMatrix = function () {
                    var input = this.input;
                    return new Matrix(input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat() / 20, input.readFloat() / 20);
                };

                GFXChannelDeserializer.prototype._readRectangle = function () {
                    var input = this.input;
                    return new Rectangle(input.readInt() / 20, input.readInt() / 20, input.readInt() / 20, input.readInt() / 20);
                };

                GFXChannelDeserializer.prototype._readColorMatrix = function () {
                    var input = this.input;
                    var rm = 1, gm = 1, bm = 1, am = 1;
                    var ro = 0, go = 0, bo = 0, ao = 0;
                    switch (input.readInt()) {
                        case 0 /* Identity */:
                            break;
                        case 1 /* AlphaMultiplierOnly */:
                            am = input.readFloat();
                            break;
                        case 2 /* All */:
                            rm = input.readFloat();
                            gm = input.readFloat();
                            bm = input.readFloat();
                            am = input.readFloat();
                            ro = input.readInt();
                            go = input.readInt();
                            bo = input.readInt();
                            ao = input.readInt();
                            break;
                    }
                    return ColorMatrix.fromMultipliersAndOffsets(rm, gm, bm, am, ro, go, bo, ao);
                };

                GFXChannelDeserializer.prototype._popAsset = function () {
                    var assetId = this.input.readInt();
                    var asset = this.inputAssets[assetId];
                    this.inputAssets[assetId] = null;
                    return asset;
                };

                GFXChannelDeserializer.prototype._readUpdateGraphics = function () {
                    var input = this.input;
                    var context = this.context;
                    var id = input.readInt();
                    var symbolId = input.readInt();
                    var asset = context._getAsset(id);
                    var bounds = this._readRectangle();
                    var pathData = ShapeData.FromPlainObject(this._popAsset());
                    var numTextures = input.readInt();
                    var textures = [];
                    for (var i = 0; i < numTextures; i++) {
                        var bitmapId = input.readInt();
                        textures.push(context._getBitmapAsset(bitmapId));
                    }
                    if (!asset) {
                        var renderable = new RenderableShape(id, pathData, textures, bounds);
                        for (var i = 0; i < textures.length; i++) {
                            textures[i].addRenderableReferrer(renderable);
                        }
                        context._registerAsset(id, symbolId, renderable);
                    }
                };

                GFXChannelDeserializer.prototype._readUpdateBitmapData = function () {
                    var input = this.input;
                    var context = this.context;
                    var id = input.readInt();
                    var symbolId = input.readInt();
                    var asset = context._getBitmapAsset(id);
                    var bounds = this._readRectangle();
                    var type = input.readInt();
                    var dataBuffer = DataBuffer.FromPlainObject(this._popAsset());
                    if (!asset) {
                        asset = RenderableBitmap.FromDataBuffer(type, dataBuffer, bounds);
                        context._registerAsset(id, symbolId, asset);
                    } else {
                        asset.updateFromDataBuffer(type, dataBuffer);
                    }
                    if (this.output) {
                        // TODO: Write image data to output.
                    }
                };

                GFXChannelDeserializer.prototype._readUpdateTextContent = function () {
                    var input = this.input;
                    var context = this.context;
                    var id = input.readInt();
                    var symbolId = input.readInt();
                    var asset = context._getTextAsset(id);
                    var bounds = this._readRectangle();
                    var matrix = this._readMatrix();
                    var backgroundColor = input.readInt();
                    var borderColor = input.readInt();
                    var autoSize = input.readInt();
                    var wordWrap = input.readBoolean();
                    var plainText = this._popAsset();
                    var textRunData = DataBuffer.FromPlainObject(this._popAsset());
                    var coords = null;
                    var numCoords = input.readInt();
                    if (numCoords) {
                        coords = new DataBuffer(numCoords * 4);
                        input.readBytes(coords, 0, numCoords * 4);
                    }
                    if (!asset) {
                        asset = new RenderableText(bounds);
                        asset.setContent(plainText, textRunData, matrix, coords);
                        asset.setStyle(backgroundColor, borderColor);
                        asset.reflow(autoSize, wordWrap);
                        context._registerAsset(id, symbolId, asset);
                    } else {
                        asset.setBounds(bounds);
                        asset.setContent(plainText, textRunData, matrix, coords);
                        asset.setStyle(backgroundColor, borderColor);
                        asset.reflow(autoSize, wordWrap);
                    }
                    if (this.output) {
                        var rect = asset.textRect;
                        this.output.writeInt(rect.w * 20);
                        this.output.writeInt(rect.h * 20);
                        this.output.writeInt(rect.x * 20);
                        var lines = asset.lines;
                        var numLines = lines.length;
                        this.output.writeInt(numLines);
                        for (var i = 0; i < numLines; i++) {
                            this._writeLineMetrics(lines[i]);
                        }
                    }
                };

                GFXChannelDeserializer.prototype._writeLineMetrics = function (line) {
                    release || assert(this.output);
                    this.output.writeInt(line.x);
                    this.output.writeInt(line.width);
                    this.output.writeInt(line.ascent);
                    this.output.writeInt(line.descent);
                    this.output.writeInt(line.leading);
                };

                GFXChannelDeserializer.prototype._readUpdateStage = function () {
                    var context = this.context;
                    var id = this.input.readInt();
                    if (!context._frames[id]) {
                        context._frames[id] = context.root;
                    }
                    var color = this.input.readInt();
                    var rectangle = this._readRectangle();
                    context.root.setBounds(rectangle);
                    context.root.color = Shumway.Color.FromARGB(color);
                };

                GFXChannelDeserializer.prototype._readUpdateFrame = function () {
                    var input = this.input;
                    var context = this.context;
                    var id = input.readInt();
                    writer && writer.writeLn("Receiving UpdateFrame: " + id);
                    var frame = context._frames[id];
                    if (!frame) {
                        frame = context._frames[id] = new FrameContainer();
                    }

                    var hasBits = input.readInt();
                    if (hasBits & 1 /* HasMatrix */) {
                        frame.matrix = this._readMatrix();
                    }
                    if (hasBits & 8 /* HasColorTransform */) {
                        frame.colorMatrix = this._readColorMatrix();
                    }
                    if (hasBits & 64 /* HasMask */) {
                        frame.mask = context._makeFrame(input.readInt());
                    }
                    if (hasBits & 128 /* HasClip */) {
                        frame.clip = input.readInt();
                    }
                    if (hasBits & 32 /* HasMiscellaneousProperties */) {
                        frame.blendMode = input.readInt();
                        frame._toggleFlags(16384 /* Visible */, input.readBoolean());
                        frame.pixelSnapping = input.readInt();
                        frame.smoothing = input.readInt();
                    }
                    if (hasBits & 4 /* HasChildren */) {
                        var count = input.readInt();
                        var container = frame;
                        container.clearChildren();
                        for (var i = 0; i < count; i++) {
                            var childId = input.readInt();
                            var child = context._makeFrame(childId);
                            release || assert(child, "Child ", childId, " of ", id, " has not been sent yet.");
                            container.addChild(child);
                        }
                    }
                };

                GFXChannelDeserializer.prototype._readRegisterFont = function () {
                    var input = this.input;
                    var fontId = input.readInt();
                    var bold = input.readBoolean();
                    var italic = input.readBoolean();
                    var data = this._popAsset();
                    var head = document.head;
                    head.insertBefore(document.createElement('style'), head.firstChild);
                    var style = document.styleSheets[0];
                    style.insertRule('@font-face{' + 'font-family:swffont' + fontId + ';' + 'src:url(data:font/opentype;base64,' + Shumway.StringUtilities.base64ArrayBuffer(data.buffer) + ')' + '}', style.cssRules.length);
                };

                GFXChannelDeserializer.prototype._readDrawToBitmap = function () {
                    var input = this.input;
                    var context = this.context;
                    var targetId = input.readInt();
                    var sourceId = input.readInt();
                    var hasBits = input.readInt();
                    var matrix;
                    var colorMatrix;
                    var clipRect;
                    if (hasBits & 1 /* HasMatrix */) {
                        matrix = this._readMatrix();
                    } else {
                        matrix = Matrix.createIdentity();
                    }
                    if (hasBits & 8 /* HasColorTransform */) {
                        colorMatrix = this._readColorMatrix();
                    }
                    if (hasBits & 16 /* HasClipRect */) {
                        clipRect = this._readRectangle();
                    }
                    var blendMode = input.readInt();
                    input.readBoolean(); // Smoothing
                    var target = context._getBitmapAsset(targetId);
                    var source = context._makeFrame(sourceId);
                    if (!target) {
                        context._registerAsset(targetId, -1, RenderableBitmap.FromFrame(source, matrix, colorMatrix, blendMode, clipRect));
                    } else {
                        target.drawFrame(source, matrix, colorMatrix, blendMode, clipRect);
                    }
                };
                return GFXChannelDeserializer;
            })();
            GFX.GFXChannelDeserializer = GFXChannelDeserializer;
        })(Remoting.GFX || (Remoting.GFX = {}));
        var GFX = Remoting.GFX;
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
    (function (GFX) {
        var Point = Shumway.GFX.Geometry.Point;

        var DataBuffer = Shumway.ArrayUtilities.DataBuffer;

        var EaselHost = (function () {
            function EaselHost(easel) {
                this._easel = easel;
                var frameContainer = easel.world;
                this._frameContainer = frameContainer;
                this._context = new Shumway.Remoting.GFX.GFXChannelDeserializerContext(this._frameContainer);

                this._addEventListeners();
            }
            EaselHost.prototype.onSendEventUpdates = function (update) {
                throw new Error('This method is abstract');
            };

            Object.defineProperty(EaselHost.prototype, "stage", {
                get: function () {
                    return this._easel.stage;
                },
                enumerable: true,
                configurable: true
            });

            EaselHost.prototype._mouseEventListener = function (event) {
                var position = this._easel.getMouseWorldPosition(event);
                var point = new Point(position.x, position.y);

                var buffer = new DataBuffer();
                var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
                serializer.output = buffer;
                serializer.writeMouseEvent(event, point);
                this.onSendEventUpdates(buffer);
            };

            EaselHost.prototype._keyboardEventListener = function (event) {
                var buffer = new DataBuffer();
                var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
                serializer.output = buffer;
                serializer.writeKeyboardEvent(event);
                this.onSendEventUpdates(buffer);
            };

            EaselHost.prototype._addEventListeners = function () {
                var mouseEventListener = this._mouseEventListener.bind(this);
                var keyboardEventListener = this._keyboardEventListener.bind(this);
                var mouseEvents = EaselHost._mouseEvents;
                for (var i = 0; i < mouseEvents.length; i++) {
                    window.addEventListener(mouseEvents[i], mouseEventListener);
                }
                var keyboardEvents = EaselHost._keyboardEvents;
                for (var i = 0; i < keyboardEvents.length; i++) {
                    window.addEventListener(keyboardEvents[i], keyboardEventListener);
                }
                this._addFocusEventListeners();
            };

            EaselHost.prototype._sendFocusEvent = function (type) {
                var buffer = new DataBuffer();
                var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
                serializer.output = buffer;
                serializer.writeFocusEvent(type);
                this.onSendEventUpdates(buffer);
            };

            EaselHost.prototype._addFocusEventListeners = function () {
                var self = this;
                document.addEventListener('visibilitychange', function (event) {
                    self._sendFocusEvent(document.hidden ? 0 /* DocumentHidden */ : 1 /* DocumentVisible */);
                });
                window.addEventListener('focus', function (event) {
                    self._sendFocusEvent(3 /* WindowFocus */);
                });
                window.addEventListener('blur', function (event) {
                    self._sendFocusEvent(2 /* WindowBlur */);
                });
            };

            EaselHost.prototype.processUpdates = function (updates, assets, output) {
                if (typeof output === "undefined") { output = null; }
                var deserializer = new Shumway.Remoting.GFX.GFXChannelDeserializer();
                deserializer.input = updates;
                deserializer.inputAssets = assets;
                deserializer.output = output;
                deserializer.context = this._context;
                deserializer.read();
            };

            EaselHost.prototype.processExternalCommand = function (command) {
                if (command.action === 'isEnabled') {
                    command.result = false;
                    return;
                }
                throw new Error('This command is not supported');
            };

            EaselHost.prototype.processFrame = function () {
            };

            EaselHost.prototype.onExernalCallback = function (request) {
                throw new Error('This method is abstract');
            };

            EaselHost.prototype.sendExernalCallback = function (functionName, args) {
                var request = {
                    functionName: functionName,
                    args: args
                };
                this.onExernalCallback(request);
                if (request.error) {
                    throw new Error(request.error);
                }
                return request.result;
            };
            EaselHost._mouseEvents = Shumway.Remoting.MouseEventNames;
            EaselHost._keyboardEvents = Shumway.Remoting.KeyboardEventNames;
            return EaselHost;
        })();
        GFX.EaselHost = EaselHost;
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
        (function (Window) {
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;

            var CircularBuffer = Shumway.CircularBuffer;
            var TimelineBuffer = Shumway.Tools.Profiler.TimelineBuffer;

            var WindowEaselHost = (function (_super) {
                __extends(WindowEaselHost, _super);
                function WindowEaselHost(easel, playerWindow, window) {
                    _super.call(this, easel);
                    this._timelineRequests = Object.create(null);
                    this._playerWindow = playerWindow;
                    this._window = window;
                    this._window.addEventListener('message', function (e) {
                        this.onWindowMessage(e.data);
                    }.bind(this));
                    this._window.addEventListener('syncmessage', function (e) {
                        this.onWindowMessage(e.detail, false);
                    }.bind(this));
                }
                WindowEaselHost.prototype.onSendEventUpdates = function (updates) {
                    var bytes = updates.getBytes();
                    this._playerWindow.postMessage({
                        type: 'gfx',
                        updates: bytes
                    }, '*', [bytes.buffer]);
                };

                WindowEaselHost.prototype.onExernalCallback = function (request) {
                    var event = this._playerWindow.document.createEvent('CustomEvent');
                    event.initCustomEvent('syncmessage', false, false, {
                        type: 'externalCallback',
                        request: request
                    });
                    this._playerWindow.dispatchEvent(event);
                };

                WindowEaselHost.prototype.requestTimeline = function (type, cmd) {
                    return new Promise(function (resolve) {
                        this._timelineRequests[type] = resolve;
                        this._playerWindow.postMessage({
                            type: 'timeline',
                            cmd: cmd,
                            request: type
                        }, '*');
                    }.bind(this));
                };

                WindowEaselHost.prototype.onWindowMessage = function (data, async) {
                    if (typeof async === "undefined") { async = true; }
                    if (typeof data === 'object' && data !== null) {
                        if (data.type === 'player') {
                            var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
                            if (async) {
                                this.processUpdates(updates, data.assets);
                            } else {
                                var output = new DataBuffer();
                                this.processUpdates(updates, data.assets, output);
                                data.result = output.toPlainObject();
                            }
                        } else if (data.type === 'frame') {
                            this.processFrame();
                        } else if (data.type === 'external') {
                            this.processExternalCommand(data.request);
                        } else if (data.type === 'timelineResponse' && data.timeline) {
                            // Transform timeline into a Timeline object.
                            data.timeline.__proto__ = TimelineBuffer.prototype;
                            data.timeline._marks.__proto__ = CircularBuffer.prototype;
                            data.timeline._times.__proto__ = CircularBuffer.prototype;
                            this._timelineRequests[data.request](data.timeline);
                        }
                    }
                };
                return WindowEaselHost;
            })(GFX.EaselHost);
            Window.WindowEaselHost = WindowEaselHost;
        })(GFX.Window || (GFX.Window = {}));
        var Window = GFX.Window;
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
        (function (Test) {
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;

            var TestEaselHost = (function (_super) {
                __extends(TestEaselHost, _super);
                function TestEaselHost(easel) {
                    _super.call(this, easel);

                    // TODO this is temporary worker to test postMessage tranfers
                    this._worker = Shumway.Player.Test.FakeSyncWorker.instance;
                    this._worker.addEventListener('message', this._onWorkerMessage.bind(this));
                    this._worker.addEventListener('syncmessage', this._onSyncWorkerMessage.bind(this));
                }
                TestEaselHost.prototype.onSendEventUpdates = function (updates) {
                    var bytes = updates.getBytes();
                    this._worker.postMessage({
                        type: 'gfx',
                        updates: bytes
                    }, [bytes.buffer]);
                };

                TestEaselHost.prototype.onExernalCallback = function (request) {
                    this._worker.postSyncMessage({
                        type: 'externalCallback',
                        request: request
                    });
                };

                TestEaselHost.prototype.requestTimeline = function (type, cmd) {
                    var buffer;
                    switch (type) {
                        case 'AVM2':
                            buffer = Shumway.AVM2.timelineBuffer;
                            break;
                        case 'Player':
                            buffer = Shumway.Player.timelineBuffer;
                            break;
                        case 'SWF':
                            buffer = Shumway.SWF.timelineBuffer;
                            break;
                    }
                    if (cmd === 'clear' && buffer) {
                        buffer.reset();
                    }
                    return Promise.resolve(buffer);
                };

                TestEaselHost.prototype._onWorkerMessage = function (e, async) {
                    if (typeof async === "undefined") { async = true; }
                    var data = e.data;
                    if (typeof data !== 'object' || data === null) {
                        return;
                    }
                    var type = data.type;
                    switch (type) {
                        case 'player':
                            var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
                            if (async) {
                                this.processUpdates(updates, data.assets);
                            } else {
                                var output = new DataBuffer();
                                this.processUpdates(updates, data.assets, output);
                                return output.toPlainObject();
                            }
                            break;
                        case 'frame':
                            this.processFrame();
                            break;
                        case 'external':
                            this.processExternalCommand(data.command);
                            break;
                    }
                };

                TestEaselHost.prototype._onSyncWorkerMessage = function (e) {
                    return this._onWorkerMessage(e, false);
                };
                return TestEaselHost;
            })(GFX.EaselHost);
            Test.TestEaselHost = TestEaselHost;
        })(GFX.Test || (GFX.Test = {}));
        var Test = GFX.Test;
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
/// <reference path='../../build/ts/gfx-base.d.ts' />
/// <reference path='gl/glContext.ts'/>
/// <reference path='gl/core.ts'/>
/// <reference path='gl/surface.ts'/>
/// <reference path='gl/gl.ts'/>
/// <reference path='gl/brush.ts'/>
/// <reference path='2d/debug.ts'/>
/// <reference path='2d/surface.ts'/>
/// <reference path='2d/2d.ts'/>
/// <reference path='dom/dom.ts'/>
/// <reference path='easel.ts'/>
/// <reference path='debug/tree.ts'/>
/// <reference path='remotingGfx.ts' />
/// <reference path='easelHost.ts' />
/// <reference path='window/windowEaselHost.ts' />
/// <reference path='test/testEaselHost.ts' />
//# sourceMappingURL=gfx.js.map
