/// <reference path="base.d.ts" />
/// <reference path="tools.d.ts" />
/// <reference path="gfx-base.d.ts" />
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
declare module Shumway.GFX.WebGL {
    var SHADER_ROOT: string;
    class WebGLContext {
        private static MAX_SURFACES;
        public gl: WebGLRenderingContext;
        private _canvas;
        private _options;
        private _w;
        private _h;
        private _programCache;
        private _maxSurfaces;
        private _maxSurfaceSize;
        public _backgroundColor: Color;
        private _geometry;
        private _tmpVertices;
        private _fillColor;
        public _surfaceRegionCache: any;
        public modelViewProjectionMatrix: Geometry.Matrix3D;
        public surfaces : WebGLSurface[];
        public fillStyle : any;
        private _surfaceRegionAllocator;
        constructor(canvas: HTMLCanvasElement, options: WebGLStageRendererOptions);
        public setBlendMode(value: BlendMode): void;
        public setBlendOptions(): void;
        /**
        * Whether the blend mode can be performed using |blendFunc|.
        */
        static glSupportedBlendMode(value: BlendMode): boolean;
        public create2DProjectionMatrix(): Geometry.Matrix3D;
        public createPerspectiveMatrix(cameraDistance: number, fov: number, angle: number): Geometry.Matrix3D;
        private discardCachedImages();
        public cacheImage(image: any): WebGLSurfaceRegion;
        public allocateSurfaceRegion(w: number, h: number, discardCache?: boolean): WebGLSurfaceRegion;
        public updateSurfaceRegion(image: any, surfaceRegion: WebGLSurfaceRegion): void;
        public _resize(): void;
        private _initializeProgram(program);
        private _createShaderFromFile(file);
        public createProgramFromFiles(vertex: string, fragment: string): any;
        private _createProgram(shaders);
        private _createShader(shaderType, shaderSource);
        private _createTexture(w, h);
        private _createFramebuffer(texture);
        private _queryProgramAttributesAndUniforms(program);
        public target : WebGLSurface;
        public clear(color?: Color): void;
        public clearTextureRegion(surfaceRegion: WebGLSurfaceRegion, color?: Color): void;
        public sizeOf(type: any): number;
    }
}
declare module Shumway.GFX.WebGL {
    /**
    * Utility class to help when writing to GL buffers.
    */
    class BufferWriter extends ArrayUtilities.ArrayWriter {
        public ensureVertexCapacity(count: number): void;
        public writeVertex(x: number, y: number): void;
        public writeVertexUnsafe(x: number, y: number): void;
        public writeVertex3D(x: number, y: number, z: number): void;
        public writeVertex3DUnsafe(x: number, y: number, z: number): void;
        public writeTriangleElements(a: number, b: number, c: number): void;
        public ensureColorCapacity(count: number): void;
        public writeColorFloats(r: number, g: number, b: number, a: number): void;
        public writeColorFloatsUnsafe(r: number, g: number, b: number, a: number): void;
        public writeColor(r: number, g: number, b: number, a: number): void;
        public writeColorUnsafe(r: number, g: number, b: number, a: number): void;
        public writeRandomColor(): void;
    }
    class WebGLAttribute {
        public name: string;
        public size: number;
        public type: number;
        public normalized: boolean;
        public offset: number;
        constructor(name: string, size: number, type: number, normalized?: boolean);
    }
    class WebGLAttributeList {
        public attributes: WebGLAttribute[];
        public size: number;
        constructor(attributes: WebGLAttribute[]);
        public initialize(context: WebGLContext): void;
    }
    class WebGLGeometry {
        public array: BufferWriter;
        public buffer: WebGLBuffer;
        public elementArray: BufferWriter;
        public elementBuffer: WebGLBuffer;
        public context: WebGLContext;
        public triangleCount: number;
        private _elementOffset;
        public elementOffset : number;
        constructor(context: WebGLContext);
        public addQuad(): void;
        public resetElementOffset(): void;
        public reset(): void;
        public uploadBuffers(): void;
    }
    class Vertex extends Geometry.Point3D {
        constructor(x: number, y: number, z: number);
        static createEmptyVertices<T extends Vertex>(type: new(x: number, y: number, z: number) => T, count: number): T[];
    }
    enum WebGLBlendFactor {
        ZERO = 0,
        ONE = 1,
        SRC_COLOR = 768,
        ONE_MINUS_SRC_COLOR = 769,
        DST_COLOR = 774,
        ONE_MINUS_DST_COLOR = 775,
        SRC_ALPHA = 770,
        ONE_MINUS_SRC_ALPHA = 771,
        DST_ALPHA = 772,
        ONE_MINUS_DST_ALPHA = 773,
        SRC_ALPHA_SATURATE = 776,
        CONSTANT_COLOR = 32769,
        ONE_MINUS_CONSTANT_COLOR = 32770,
        CONSTANT_ALPHA = 32771,
        ONE_MINUS_CONSTANT_ALPHA = 32772,
    }
}
declare module Shumway.GFX.WebGL {
    class WebGLSurface implements ISurface {
        public w: number;
        public h: number;
        public texture: WebGLTexture;
        public framebuffer: WebGLFramebuffer;
        private _regionAllocator;
        constructor(w: number, h: number, texture: WebGLTexture);
        public allocate(w: number, h: number): WebGLSurfaceRegion;
        public free(surfaceRegion: WebGLSurfaceRegion): void;
    }
    /**
    * A (region, texture) pair. These objects can appear in linked lists hence the next and previous pointers. Regions
    * don't necessarily need to have a texture reference. Setting the texture reference to null is a way to indicate
    * that the region no longer points to valid texture data.
    */
    class WebGLSurfaceRegion implements ILinkedListNode {
        public region: RegionAllocator.Region;
        public surface: WebGLSurface;
        public next: WebGLSurfaceRegion;
        public previous: WebGLSurfaceRegion;
        constructor(surface: WebGLSurface, region: RegionAllocator.Region);
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
declare module Shumway.GFX.WebGL {
    var TILE_SIZE: number;
    var MIN_UNTILED_SIZE: number;
    class WebGLStageRendererOptions extends StageRendererOptions {
        public maxSurfaces: number;
        public maxSurfaceSize: number;
        public perspectiveCamera: boolean;
        public perspectiveCameraDistance: number;
        public perspectiveCameraFOV: number;
        public perspectiveCameraAngle: number;
        public animateZoom: boolean;
        /**
        * Sometimes it's useful to temporarily disable texture uploads to see if rendering
        * is texture upload bound.
        */
        public disableSurfaceUploads: boolean;
        public frameSpacing: number;
        public ignoreColorMatrix: boolean;
        public drawTiles: boolean;
        public drawSurfaces: boolean;
        public drawSurface: number;
        public premultipliedAlpha: boolean;
        public unpackPremultiplyAlpha: boolean;
        public showTemporaryCanvases: boolean;
        public sourceBlendFactor: WebGLBlendFactor;
        public destinationBlendFactor: WebGLBlendFactor;
    }
    class WebGLStageRenderer extends StageRenderer {
        public _options: WebGLStageRendererOptions;
        public _context: WebGLContext;
        private _brush;
        private _stencilBrush;
        private _tmpVertices;
        private _scratchCanvas;
        private _scratchCanvasContext;
        private _dynamicScratchCanvas;
        private _dynamicScratchCanvasContext;
        private _uploadCanvas;
        private _uploadCanvasContext;
        private _clipStack;
        constructor(canvas: HTMLCanvasElement, stage: Stage, options?: WebGLStageRendererOptions);
        private _cachedTiles;
        public resize(): void;
        private _cacheImageCallback(oldSurfaceRegion, src, srcBounds);
        private _enterClip(clip, matrix, brush, viewport);
        private _leaveClip(clip, matrix, brush, viewport);
        private _renderFrame(root, matrix, brush, viewport, depth?);
        private _renderSurfaces(brush);
        public render(): void;
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
declare module Shumway.GFX.WebGL {
    class WebGLBrush {
        public _target: WebGLSurface;
        public _context: WebGLContext;
        public _geometry: WebGLGeometry;
        constructor(context: WebGLContext, geometry: WebGLGeometry, target: WebGLSurface);
        public reset(): void;
        public flush(): void;
        public target : WebGLSurface;
    }
    enum WebGLCombinedBrushKind {
        FillColor = 0,
        FillTexture = 1,
        FillTextureWithColorMatrix = 2,
    }
    class WebGLCombinedBrushVertex extends Vertex {
        static attributeList: WebGLAttributeList;
        static initializeAttributeList(context: any): void;
        public kind: WebGLCombinedBrushKind;
        public color: Color;
        public sampler: number;
        public coordinate: Geometry.Point;
        constructor(x: number, y: number, z: number);
        public writeTo(geometry: WebGLGeometry): void;
    }
    class WebGLCombinedBrush extends WebGLBrush {
        private static _tmpVertices;
        private _program;
        private _surfaces;
        private _colorMatrix;
        private _blendMode;
        private static _depth;
        constructor(context: WebGLContext, geometry: WebGLGeometry, target?: WebGLSurface);
        public reset(): void;
        public drawImage(src: WebGLSurfaceRegion, dstRectangle: Geometry.Rectangle, color: Color, colorMatrix: ColorMatrix, matrix: Geometry.Matrix, depth?: number, blendMode?: BlendMode): boolean;
        public fillRectangle(rectangle: Geometry.Rectangle, color: Color, matrix: Geometry.Matrix, depth?: number): void;
        public flush(): void;
    }
}
declare module Shumway.GFX.Canvas2D {
    function notifyReleaseChanged(): void;
}
declare module Shumway.GFX.Canvas2D {
    class Canvas2DSurfaceRegion implements ISurfaceRegion {
        public surface: Canvas2DSurface;
        public region: RegionAllocator.Region;
        constructor(surface: Canvas2DSurface, region: RegionAllocator.Region);
    }
    class Canvas2DSurface implements ISurface {
        public w: number;
        public h: number;
        public canvas: HTMLCanvasElement;
        public context: CanvasRenderingContext2D;
        private _regionAllocator;
        constructor(canvas: HTMLCanvasElement, regionAllocator: RegionAllocator.IRegionAllocator);
        public allocate(w: number, h: number): Canvas2DSurfaceRegion;
        public free(surfaceRegion: Canvas2DSurfaceRegion): void;
    }
}
declare module Shumway.GFX.Canvas2D {
    enum FillRule {
        NonZero = 0,
        EvenOdd = 1,
    }
    class Canvas2DStageRendererOptions extends StageRendererOptions {
        /**
        * Whether to force snapping matrices to device pixels.
        */
        public snapToDevicePixels: boolean;
        /**
        * Whether to force image smoothing when drawing images.
        */
        public imageSmoothing: boolean;
        /**
        * Whether to enablel blending.
        */
        public blending: boolean;
        /**
        * Whether to cache shapes as images.
        */
        public cacheShapes: boolean;
        /**
        * Shapes above this size are not cached.
        */
        public cacheShapesMaxSize: number;
        /**
        * Number of times a shape is rendered before it's elligible for caching.
        */
        public cacheShapesThreshold: number;
    }
    /**
    * Rendering state threaded through rendering methods.
    */
    class Canvas2DStageRendererState {
        public options: Canvas2DStageRendererOptions;
        public clipRegion: boolean;
        public ignoreMask: Frame;
        constructor(options: Canvas2DStageRendererOptions, clipRegion?: boolean, ignoreMask?: Frame);
    }
    class Canvas2DStageRenderer extends StageRenderer {
        public _options: Canvas2DStageRendererOptions;
        private _fillRule;
        public context: CanvasRenderingContext2D;
        private static _initializedCaches;
        /**
        * Allocates temporary regions for performing image operations.
        */
        private static _surfaceCache;
        /**
        * Allocates shape cache regions.
        */
        private static _shapeCache;
        constructor(canvas: HTMLCanvasElement, stage: Stage, options?: Canvas2DStageRendererOptions);
        private static _prepareSurfaceAllocators();
        public resize(): void;
        public render(): void;
        public renderFrame(root: Frame, viewport: Geometry.Rectangle, matrix: Geometry.Matrix, clearTargetBeforeRendering?: boolean): void;
        /**
        * Renders the frame into a temporary surface region in device coordinates clipped by the viewport.
        */
        private _renderToSurfaceRegion(frame, transform, viewport);
        private _renderShape(context, shape, matrix, viewport, state);
        private _renderFrame(context, root, matrix, viewport, state, skipRoot?);
        private _getCompositeOperation(blendMode);
    }
}
declare module Shumway.GFX {
    class DOMStageRenderer {
        public container: HTMLElement;
        public pixelRatio: number;
        constructor(container: HTMLElement, pixelRatio: number);
        public render(stage: Stage, options: any): void;
        /**
        * Constructs a div element with a canvas element inside of it.
        */
        private getDIV(shape);
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
declare module Shumway.GFX {
    interface IState {
        onMouseUp(easel: Easel, event: MouseEvent): any;
        onMouseDown(easel: Easel, event: MouseEvent): any;
        onMouseMove(easel: Easel, event: MouseEvent): any;
        onMouseClick(easel: Easel, event: MouseEvent): any;
        onKeyUp(easel: Easel, event: KeyboardEvent): any;
        onKeyDown(easel: Easel, event: KeyboardEvent): any;
        onKeyPress(easel: Easel, event: KeyboardEvent): any;
    }
    class State implements IState {
        public onMouseUp(easel: Easel, event: MouseEvent): void;
        public onMouseDown(easel: Easel, event: MouseEvent): void;
        public onMouseMove(easel: Easel, event: MouseEvent): void;
        public onMouseClick(easel: Easel, event: MouseEvent): void;
        public onKeyUp(easel: Easel, event: KeyboardEvent): void;
        public onKeyDown(easel: Easel, event: KeyboardEvent): void;
        public onKeyPress(easel: Easel, event: KeyboardEvent): void;
    }
    class Easel {
        private _stage;
        private _world;
        private _worldView;
        private _worldViewOverlay;
        private _options;
        private _canvases;
        private _renderers;
        private _disableHidpi;
        private _state;
        private _persistentState;
        public paused: boolean;
        public viewport: Geometry.Rectangle;
        private _selectedFrames;
        private _deferredResizeHandlerTimeout;
        private _eventListeners;
        private _fpsCanvas;
        private _fps;
        constructor(container: HTMLElement, backend: Backend, disableHidpi?: boolean);
        /**
        * Primitive event dispatching features.
        */
        public addEventListener(type: string, listener: any): void;
        private _dispatchEvent(type);
        private _enterRenderLoop();
        public state : State;
        public cursor : string;
        private _render();
        public render(): void;
        public world : FrameContainer;
        public worldView : FrameContainer;
        public worldOverlay : FrameContainer;
        public stage : Stage;
        public options : StageRendererOptions;
        public toggleOption(name: string): void;
        public getOption(name: string): any;
        private _deferredResizeHandler();
        private _resizeHandler();
        public resize(): void;
        public queryFrameUnderMouse(event: MouseEvent): Frame;
        public selectFrameUnderMouse(event: MouseEvent): void;
        public getMousePosition(event: MouseEvent, coordinateSpace: Frame): Geometry.Point;
        public getMouseWorldPosition(event: MouseEvent): Geometry.Point;
        private _onMouseDown(event);
        private _onMouseUp(event);
        private _onMouseMove(event);
    }
}
declare module Shumway.GFX {
    enum Layout {
        Simple = 0,
    }
    class TreeStageRendererOptions extends StageRendererOptions {
        public layout: Layout;
    }
    class TreeStageRenderer extends StageRenderer {
        public _options: TreeStageRendererOptions;
        public context: CanvasRenderingContext2D;
        public _viewport: Geometry.Rectangle;
        public layout: any;
        constructor(canvas: HTMLCanvasElement, stage: Stage, options?: TreeStageRendererOptions);
        public render(): void;
        static clearContext(context: CanvasRenderingContext2D, rectangle: Geometry.Rectangle): void;
        public _renderFrameSimple(context: CanvasRenderingContext2D, root: Frame, transform: Geometry.Matrix, clipRectangle: Geometry.Rectangle, cullRectanglesAABB: Geometry.Rectangle[]): void;
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
declare module Shumway.Remoting.GFX {
    class GFXChannelSerializer {
        public output: ArrayUtilities.IDataOutput;
        public writeMouseEvent(event: MouseEvent, point: Shumway.GFX.Geometry.Point): void;
        public writeKeyboardEvent(event: KeyboardEvent): void;
        public writeFocusEvent(type: FocusEventType): void;
    }
    class GFXChannelDeserializerContext {
        public root: Shumway.GFX.ClipRectangle;
        public _frames: Shumway.GFX.Frame[];
        private _assets;
        constructor(root: Shumway.GFX.FrameContainer);
        public _registerAsset(id: number, symbolId: number, asset: Shumway.GFX.Renderable): void;
        public _makeFrame(id: number): Shumway.GFX.Frame;
        public _getAsset(id: number): Shumway.GFX.Renderable;
        public _getBitmapAsset(id: number): Shumway.GFX.RenderableBitmap;
        public _getTextAsset(id: number): Shumway.GFX.RenderableText;
    }
    class GFXChannelDeserializer {
        public input: ArrayUtilities.IDataInput;
        public inputAssets: any[];
        public output: ArrayUtilities.DataBuffer;
        public context: GFXChannelDeserializerContext;
        public read(): void;
        private _readMatrix();
        private _readRectangle();
        private _readColorMatrix();
        private _popAsset();
        private _readUpdateGraphics();
        private _readUpdateBitmapData();
        private _readUpdateTextContent();
        private _writeLineMetrics(line);
        private _readUpdateStage();
        private _readUpdateFrame();
        private _readRegisterFont();
        private _readDrawToBitmap();
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
declare module Shumway.GFX {
    class EaselHost {
        private static _mouseEvents;
        private static _keyboardEvents;
        private _easel;
        private _frameContainer;
        private _context;
        constructor(easel: Easel);
        public onSendEventUpdates(update: ArrayUtilities.DataBuffer): void;
        public stage : Stage;
        private _mouseEventListener(event);
        private _keyboardEventListener(event);
        public _addEventListeners(): void;
        private _sendFocusEvent(type);
        private _addFocusEventListeners();
        public processUpdates(updates: ArrayUtilities.DataBuffer, assets: ArrayUtilities.DataBuffer[], output?: ArrayUtilities.DataBuffer): void;
        public processExternalCommand(command: any): void;
        public processFrame(): void;
        public onExernalCallback(request: any): void;
        public sendExernalCallback(functionName: string, args: any[]): any;
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
declare module Shumway.GFX.Window {
    class WindowEaselHost extends EaselHost {
        private _timelineRequests;
        private _window;
        private _playerWindow;
        constructor(easel: Easel, playerWindow: any, window: any);
        public onSendEventUpdates(updates: ArrayUtilities.DataBuffer): void;
        public onExernalCallback(request: any): void;
        public requestTimeline(type: string, cmd: string): Promise<Tools.Profiler.TimelineBuffer>;
        private onWindowMessage(data, async?);
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
declare module Shumway.Player.Test {
    class FakeSyncWorker {
        static instance: FakeSyncWorker;
        public addEventListener(type: string, listener: any, useCapture?: boolean): void;
        public removeEventListener(type: string, listener: any, useCapture?: boolean): void;
        public postMessage(message: any, ports?: any): void;
        public postSyncMessage(message: any, ports?: any): any;
    }
}
declare module Shumway.GFX.Test {
    class TestEaselHost extends EaselHost {
        private _worker;
        constructor(easel: Easel);
        public onSendEventUpdates(updates: ArrayUtilities.DataBuffer): void;
        public onExernalCallback(request: any): void;
        public requestTimeline(type: string, cmd: string): Promise<Tools.Profiler.TimelineBuffer>;
        private _onWorkerMessage(e, async?);
        private _onSyncWorkerMessage(e);
    }
}
interface WebGLActiveInfo {
    location: any;
}
interface WebGLProgram extends WebGLObject {
    uniforms: any;
    attributes: any;
}
