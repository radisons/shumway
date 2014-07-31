/// <reference path="base.d.ts" />
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
declare module Shumway.Tools.Theme {
    interface UITheme {
        tabToolbar(a: number): string;
        toolbars(a: number): string;
        selectionBackground(a: number): string;
        selectionText(a: number): string;
        splitters(a: number): string;
        bodyBackground(a: number): string;
        sidebarBackground(a: number): string;
        attentionBackground(a: number): string;
        bodyText(a: number): string;
        foregroundTextGrey(a: number): string;
        contentTextHighContrast(a: number): string;
        contentTextGrey(a: number): string;
        contentTextDarkGrey(a: number): string;
        blueHighlight(a: number): string;
        purpleHighlight(a: number): string;
        pinkHighlight(a: number): string;
        redHighlight(a: number): string;
        orangeHighlight(a: number): string;
        lightOrangeHighlight(a: number): string;
        greenHighlight(a: number): string;
        blueGreyHighlight(a: number): string;
    }
    class UI {
        static toRGBA(r: number, g: number, b: number, a?: number): string;
    }
    class UIThemeDark implements UITheme {
        constructor();
        public tabToolbar(a?: number): string;
        public toolbars(a?: number): string;
        public selectionBackground(a?: number): string;
        public selectionText(a?: number): string;
        public splitters(a?: number): string;
        public bodyBackground(a?: number): string;
        public sidebarBackground(a?: number): string;
        public attentionBackground(a?: number): string;
        public bodyText(a?: number): string;
        public foregroundTextGrey(a?: number): string;
        public contentTextHighContrast(a?: number): string;
        public contentTextGrey(a?: number): string;
        public contentTextDarkGrey(a?: number): string;
        public blueHighlight(a?: number): string;
        public purpleHighlight(a?: number): string;
        public pinkHighlight(a?: number): string;
        public redHighlight(a?: number): string;
        public orangeHighlight(a?: number): string;
        public lightOrangeHighlight(a?: number): string;
        public greenHighlight(a?: number): string;
        public blueGreyHighlight(a?: number): string;
    }
    class UIThemeLight implements UITheme {
        constructor();
        public tabToolbar(a?: number): string;
        public toolbars(a?: number): string;
        public selectionBackground(a?: number): string;
        public selectionText(a?: number): string;
        public splitters(a?: number): string;
        public bodyBackground(a?: number): string;
        public sidebarBackground(a?: number): string;
        public attentionBackground(a?: number): string;
        public bodyText(a?: number): string;
        public foregroundTextGrey(a?: number): string;
        public contentTextHighContrast(a?: number): string;
        public contentTextGrey(a?: number): string;
        public contentTextDarkGrey(a?: number): string;
        public blueHighlight(a?: number): string;
        public purpleHighlight(a?: number): string;
        public pinkHighlight(a?: number): string;
        public redHighlight(a?: number): string;
        public orangeHighlight(a?: number): string;
        public lightOrangeHighlight(a?: number): string;
        public greenHighlight(a?: number): string;
        public blueGreyHighlight(a?: number): string;
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
declare module Shumway.Tools.Profiler {
    class Profile {
        private _snapshots;
        private _buffers;
        private _startTime;
        private _endTime;
        private _windowStart;
        private _windowEnd;
        private _maxDepth;
        constructor(buffers?: TimelineBuffer[]);
        public addBuffer(buffer: TimelineBuffer): void;
        public getSnapshotAt(index: number): TimelineBufferSnapshot;
        public hasSnapshots : boolean;
        public snapshotCount : number;
        public startTime : number;
        public endTime : number;
        public totalTime : number;
        public windowStart : number;
        public windowEnd : number;
        public windowLength : number;
        public maxDepth : number;
        public forEachSnapshot(visitor: (snapshot: TimelineBufferSnapshot, index: number) => void): void;
        public createSnapshots(): void;
        public setWindow(start: number, end: number): void;
        public moveWindowTo(time: number): void;
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
declare module Shumway.Tools.Profiler {
    interface TimelineFrameRange {
        startIndex: number;
        endIndex: number;
        startTime: number;
        endTime: number;
        totalTime: number;
    }
    class TimelineFrameStatistics {
        public kind: TimelineItemKind;
        public count: number;
        public selfTime: number;
        public totalTime: number;
        constructor(kind: TimelineItemKind);
    }
    /**
    * Represents a single timeline frame range and makes it easier to work with the compacted
    * timeline buffer data.
    */
    class TimelineFrame {
        public parent: TimelineFrame;
        public kind: TimelineItemKind;
        public startData: any;
        public endData: any;
        public startTime: number;
        public endTime: number;
        public statistics: TimelineFrameStatistics[];
        public children: TimelineFrame[];
        public total: number;
        public maxDepth: number;
        public depth: number;
        constructor(parent: TimelineFrame, kind: TimelineItemKind, startData: any, endData: any, startTime: number, endTime: number);
        public totalTime : number;
        public selfTime : number;
        /**
        * Gets the child index of the first child to overlap the specified time.
        */
        public getChildIndex(time: number): number;
        /**
        * Gets the high and low index of the children that intersect the specified time range.
        */
        public getChildRange(startTime: number, endTime: number): TimelineFrameRange;
        private _getNearestChild(time);
        private _getNearestChildReverse(time);
        /**
        * Finds the deepest child that intersects with the specified time.
        */
        public query(time: number): TimelineFrame;
        /**
        * When querying a series of samples, if the deepest child for the previous time is known,
        * it is faster to go up the tree from there, until a frame is found that contains the next time,
        * and then go back down.
        *
        * More often than not we don't have to start at the very top.
        */
        public queryNext(time: number): TimelineFrame;
        /**
        * Gets this frame's distance to the root.
        */
        public getDepth(): number;
        public calculateStatistics(): void;
    }
    class TimelineBufferSnapshot extends TimelineFrame {
        public name: string;
        constructor(name: string);
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
declare module Shumway.Tools.Profiler {
    interface TimelineItemKind {
        id: number;
        name: string;
        bgColor: string;
        textColor: string;
        visible: boolean;
    }
    /**
    * Records enter / leave events in two circular buffers.
    * The goal here is to be able to handle large amounts of data.
    */
    class TimelineBuffer {
        static ENTER: number;
        static LEAVE: number;
        static MAX_KINDID: number;
        static MAX_DATAID: number;
        private _depth;
        private _data;
        private _kinds;
        private _kindNameMap;
        private _marks;
        private _times;
        private _stack;
        private _startTime;
        public name: string;
        constructor(name?: string, startTime?: number);
        public getKind(kind: number): TimelineItemKind;
        public kinds : TimelineItemKind[];
        public depth : number;
        private _initialize();
        private _getKindId(name);
        private _getMark(type, kindId, data?);
        public enter(name: string, data?: any, time?: number): void;
        public leave(name?: string, data?: any, time?: number): void;
        public count(name: string, value: number, data?: any): void;
        /**
        * Constructs an easier to work with TimelineFrame data structure.
        */
        public createSnapshot(count?: number): TimelineBufferSnapshot;
        public reset(startTime?: number): void;
        static FromFirefoxProfile(profile: any, name?: string): TimelineBuffer;
        static FromChromeProfile(profile: any, name?: string): TimelineBuffer;
        private static _resolveIds(parent, idMap);
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
declare module Shumway.Tools.Profiler {
    enum UIThemeType {
        DARK = 0,
        LIGHT = 1,
    }
    class Controller {
        private _container;
        private _profiles;
        private _activeProfile;
        private _overviewHeader;
        private _overview;
        private _headers;
        private _charts;
        private _themeType;
        private _theme;
        private _tooltip;
        constructor(container: HTMLElement, themeType?: UIThemeType);
        public createProfile(buffers: TimelineBuffer[], activate?: boolean): Profile;
        public activateProfile(profile: Profile): void;
        public activateProfileAt(index: number): void;
        public deactivateProfile(): void;
        public resize(): void;
        public getProfileAt(index: number): Profile;
        public activeProfile : Profile;
        public profileCount : number;
        public container : HTMLElement;
        public themeType : UIThemeType;
        public theme : Theme.UITheme;
        public getSnapshotAt(index: number): TimelineBufferSnapshot;
        private _createViews();
        private _destroyViews();
        private _initializeViews();
        private _onResize();
        private _updateViews();
        private _drawViews();
        private _createTooltip();
        /**
        * View callbacks
        */
        public setWindow(start: number, end: number): void;
        public moveWindowTo(time: number): void;
        public showTooltip(chart: FlameChart, frame: TimelineFrame, x: number, y: number): void;
        public hideTooltip(): void;
        public createTooltipContent(chart: FlameChart, frame: TimelineFrame): HTMLElement;
        public appendDataElements(el: HTMLElement, data: any): void;
        public removeTooltipContent(): void;
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
declare module Shumway.Tools.Profiler {
    interface MouseControllerTarget {
        onMouseDown(x: number, y: number): void;
        onMouseMove(x: number, y: number): void;
        onMouseOver(x: number, y: number): void;
        onMouseOut(): void;
        onMouseWheel(x: number, y: number, delta: number): void;
        onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        onClick(x: number, y: number): void;
        onHoverStart(x: number, y: number): void;
        onHoverEnd(): void;
    }
    class MouseCursor {
        public value: string;
        constructor(value: string);
        public toString(): string;
        static AUTO: MouseCursor;
        static DEFAULT: MouseCursor;
        static NONE: MouseCursor;
        static HELP: MouseCursor;
        static POINTER: MouseCursor;
        static PROGRESS: MouseCursor;
        static WAIT: MouseCursor;
        static CELL: MouseCursor;
        static CROSSHAIR: MouseCursor;
        static TEXT: MouseCursor;
        static ALIAS: MouseCursor;
        static COPY: MouseCursor;
        static MOVE: MouseCursor;
        static NO_DROP: MouseCursor;
        static NOT_ALLOWED: MouseCursor;
        static ALL_SCROLL: MouseCursor;
        static COL_RESIZE: MouseCursor;
        static ROW_RESIZE: MouseCursor;
        static N_RESIZE: MouseCursor;
        static E_RESIZE: MouseCursor;
        static S_RESIZE: MouseCursor;
        static W_RESIZE: MouseCursor;
        static NE_RESIZE: MouseCursor;
        static NW_RESIZE: MouseCursor;
        static SE_RESIZE: MouseCursor;
        static SW_RESIZE: MouseCursor;
        static EW_RESIZE: MouseCursor;
        static NS_RESIZE: MouseCursor;
        static NESW_RESIZE: MouseCursor;
        static NWSE_RESIZE: MouseCursor;
        static ZOOM_IN: MouseCursor;
        static ZOOM_OUT: MouseCursor;
        static GRAB: MouseCursor;
        static GRABBING: MouseCursor;
    }
    class MouseController {
        private _target;
        private _eventTarget;
        private _boundOnMouseDown;
        private _boundOnMouseUp;
        private _boundOnMouseOver;
        private _boundOnMouseOut;
        private _boundOnMouseMove;
        private _boundOnMouseWheel;
        private _boundOnDrag;
        private _dragInfo;
        private _hoverInfo;
        private _wheelDisabled;
        private static HOVER_TIMEOUT;
        private static _cursor;
        private static _cursorOwner;
        constructor(target: MouseControllerTarget, eventTarget: EventTarget);
        public destroy(): void;
        public updateCursor(cursor: MouseCursor): void;
        private _onMouseDown(event);
        private _onDrag(event);
        private _onMouseUp(event);
        private _onMouseOver(event);
        private _onMouseOut(event);
        private _onMouseMove(event);
        private _onMouseWheel(event);
        private _startHoverCheck(event);
        private _killHoverCheck();
        private _onMouseMoveIdleHandler();
        private _getTargetMousePos(event, target);
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
declare module Shumway.Tools.Profiler {
    enum FlameChartDragTarget {
        NONE = 0,
        WINDOW = 1,
        HANDLE_LEFT = 2,
        HANDLE_RIGHT = 3,
        HANDLE_BOTH = 4,
    }
    interface FlameChartDragInfo {
        windowStartInitial: number;
        windowEndInitial: number;
        target: FlameChartDragTarget;
    }
    class FlameChartBase implements MouseControllerTarget {
        public _controller: Controller;
        public _mouseController: MouseController;
        public _canvas: HTMLCanvasElement;
        public _context: CanvasRenderingContext2D;
        public _width: number;
        public _height: number;
        public _windowStart: number;
        public _windowEnd: number;
        public _rangeStart: number;
        public _rangeEnd: number;
        public _initialized: boolean;
        public _dragInfo: FlameChartDragInfo;
        static DRAGHANDLE_WIDTH: number;
        static MIN_WINDOW_LEN: number;
        constructor(controller: Controller);
        public canvas : HTMLCanvasElement;
        public setSize(width: number, height?: number): void;
        public initialize(rangeStart: number, rangeEnd: number): void;
        public setWindow(start: number, end: number, draw?: boolean): void;
        public setRange(start: number, end: number, draw?: boolean): void;
        public destroy(): void;
        public _resetCanvas(): void;
        public draw(): void;
        public _almostEq(a: number, b: number, precision?: number): boolean;
        public _windowEqRange(): boolean;
        public _decimalPlaces(value: number): number;
        public _toPixelsRelative(time: number): number;
        public _toPixels(time: number): number;
        public _toTimeRelative(px: number): number;
        public _toTime(px: number): number;
        public onMouseWheel(x: number, y: number, delta: number): void;
        public onMouseDown(x: number, y: number): void;
        public onMouseMove(x: number, y: number): void;
        public onMouseOver(x: number, y: number): void;
        public onMouseOut(): void;
        public onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        public onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        public onClick(x: number, y: number): void;
        public onHoverStart(x: number, y: number): void;
        public onHoverEnd(): void;
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
declare module Shumway.Tools.Profiler {
    class FlameChart extends FlameChartBase implements MouseControllerTarget {
        private _snapshot;
        private _kindStyle;
        private _textWidth;
        private _maxDepth;
        private _hoveredFrame;
        /**
        * Don't paint frames whose width is smaller than this value. This helps a lot when drawing
        * large ranges. This can be < 1 since anti-aliasing can look quite nice.
        */
        private _minFrameWidthInPixels;
        constructor(controller: Controller, snapshot: TimelineBufferSnapshot);
        public setSize(width: number, height?: number): void;
        public initialize(rangeStart: number, rangeEnd: number): void;
        public destroy(): void;
        public draw(): void;
        private _drawChildren(parent, depth?);
        private _drawFrame(frame, depth);
        private _prepareText(context, title, maxSize);
        private _measureWidth(context, text);
        public _toPixelsRelative(time: number): number;
        public _toPixels(time: number): number;
        public _toTimeRelative(px: number): number;
        public _toTime(px: number): number;
        private _getFrameAtPosition(x, y);
        public onMouseDown(x: number, y: number): void;
        public onMouseMove(x: number, y: number): void;
        public onMouseOver(x: number, y: number): void;
        public onMouseOut(): void;
        public onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        public onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        public onClick(x: number, y: number): void;
        public onHoverStart(x: number, y: number): void;
        public onHoverEnd(): void;
        public getStatistics(kind: TimelineItemKind): TimelineFrameStatistics;
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
declare module Shumway.Tools.Profiler {
    enum FlameChartOverviewMode {
        OVERLAY = 0,
        STACK = 1,
        UNION = 2,
    }
    class FlameChartOverview extends FlameChartBase implements MouseControllerTarget {
        private _overviewCanvasDirty;
        private _overviewCanvas;
        private _overviewContext;
        private _selection;
        private _mode;
        constructor(controller: Controller, mode?: FlameChartOverviewMode);
        public setSize(width: number, height?: number): void;
        public mode : FlameChartOverviewMode;
        public _resetCanvas(): void;
        public draw(): void;
        private _drawSelection();
        private _drawChart();
        public _toPixelsRelative(time: number): number;
        public _toPixels(time: number): number;
        public _toTimeRelative(px: number): number;
        public _toTime(px: number): number;
        private _getDragTargetUnderCursor(x, y);
        public onMouseDown(x: number, y: number): void;
        public onMouseMove(x: number, y: number): void;
        public onMouseOver(x: number, y: number): void;
        public onMouseOut(): void;
        public onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        public onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        public onClick(x: number, y: number): void;
        public onHoverStart(x: number, y: number): void;
        public onHoverEnd(): void;
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
declare module Shumway.Tools.Profiler {
    enum FlameChartHeaderType {
        OVERVIEW = 0,
        CHART = 1,
    }
    class FlameChartHeader extends FlameChartBase implements MouseControllerTarget {
        private _type;
        private static TICK_MAX_WIDTH;
        constructor(controller: Controller, type: FlameChartHeaderType);
        public draw(): void;
        private _drawLabels(rangeStart, rangeEnd);
        private _calculateTickInterval(rangeStart, rangeEnd);
        private _drawDragHandle(pos);
        private _drawRoundedRect(context, x, y, width, height, radius, stroke?, fill?);
        public _toPixelsRelative(time: number): number;
        public _toPixels(time: number): number;
        public _toTimeRelative(px: number): number;
        public _toTime(px: number): number;
        private _getDragTargetUnderCursor(x, y);
        public onMouseDown(x: number, y: number): void;
        public onMouseMove(x: number, y: number): void;
        public onMouseOver(x: number, y: number): void;
        public onMouseOut(): void;
        public onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        public onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number): void;
        public onClick(x: number, y: number): void;
        public onHoverStart(x: number, y: number): void;
        public onHoverEnd(): void;
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
declare module Shumway.Tools.Profiler.TraceLogger {
    class TraceLoggerProgressInfo {
        public pageLoaded: boolean;
        public threadsTotal: number;
        public threadsLoaded: number;
        public threadFilesTotal: number;
        public threadFilesLoaded: number;
        constructor(pageLoaded: boolean, threadsTotal: number, threadsLoaded: number, threadFilesTotal: number, threadFilesLoaded: number);
        public toString(): string;
    }
    class TraceLogger {
        private _baseUrl;
        private _threads;
        private _pageLoadCallback;
        private _pageLoadProgressCallback;
        private _progressInfo;
        constructor(baseUrl: string);
        public loadPage(url: string, callback: (err: any, result: any[]) => void, progress?: (info: TraceLoggerProgressInfo) => void): void;
        public buffers : TimelineBuffer[];
        private _onProgress();
        private _onLoadPage(result);
        private _loadData(urls, callback, progress?);
        private static colors;
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
declare module Shumway.Tools.Profiler.TraceLogger {
    interface TreeItem {
        start: number;
        stop: number;
        textId: number;
        nextId: number;
        hasChildren: boolean;
    }
    class Thread {
        private _data;
        private _text;
        private _buffer;
        private static ITEM_SIZE;
        constructor(data: any[]);
        public buffer : TimelineBuffer;
        private _walkTree(id);
    }
}
interface MouseWheelEvent extends MouseEvent {
    deltaX: number;
    deltaY: number;
    deltaZ: number;
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
declare module Shumway.Tools.Terminal {
    class Buffer {
        public lines: string[];
        public format: any[];
        public time: number[];
        public repeat: number[];
        public length: number;
        constructor();
        public append(line: any, color: any): void;
        public get(i: any): string;
        public getFormat(i: any): any;
        public getTime(i: any): number;
        public getRepeat(i: any): number;
    }
    /**
    * If you're going to write a lot of data to the browser console you're gonna have a bad time. This may make your
    * life a little more pleasant.
    */
    class Terminal {
        public lineColor: string;
        public alternateLineColor: string;
        public textColor: string;
        public selectionColor: string;
        public selectionTextColor: string;
        public ratio: number;
        public canvas: HTMLCanvasElement;
        public context: CanvasRenderingContext2D;
        public fontSize: number;
        public lineIndex: number;
        public pageIndex: number;
        public columnIndex: number;
        public selection: any;
        public lineHeight: number;
        public hasFocus: boolean;
        public pageLineCount: number;
        public refreshFrequency: number;
        public textMarginLeft: number;
        public textMarginBottom: number;
        public buffer: Buffer;
        public showLineNumbers: boolean;
        public showLineTime: boolean;
        public showLineCounter: boolean;
        constructor(canvas: HTMLCanvasElement);
        public resize(): void;
        private _resizeHandler();
        public gotoLine(index: any): void;
        public scrollIntoView(): void;
        public scroll(delta: any): void;
        public paint(): void;
        public refreshEvery(ms: any): void;
        public isScrolledToBottom(): boolean;
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
declare module Shumway.Tools.Mini {
    class FPS {
        private _canvas;
        private _context;
        private _ratio;
        private _index;
        private _lastTime;
        private _gradient;
        constructor(canvas: HTMLCanvasElement);
        private _resizeHandler();
        public tickAndRender(idle?: boolean): void;
    }
}
