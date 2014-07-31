/// <reference path="base.d.ts" />
/// <reference path="tools.d.ts" />
declare module Shumway.SWF {
    var timelineBuffer: Tools.Profiler.TimelineBuffer;
    function enterTimeline(name: string, data?: any): void;
    function leaveTimeline(data?: any): void;
}
declare module Shumway.SWF.Parser {
    function readSi8($bytes: any, $stream: any): any;
    function readSi16($bytes: any, $stream: any): any;
    function readSi32($bytes: any, $stream: any): any;
    function readUi8($bytes: any, $stream: any): any;
    function readUi16($bytes: any, $stream: any): any;
    function readUi32($bytes: any, $stream: any): any;
    function readFixed($bytes: any, $stream: any): number;
    function readFixed8($bytes: any, $stream: any): number;
    function readFloat16($bytes: any, $stream: any): number;
    function readFloat($bytes: any, $stream: any): any;
    function readDouble($bytes: any, $stream: any): any;
    function readEncodedU32($bytes: any, $stream: any): any;
    function readBool($bytes: any, $stream: any): boolean;
    function align($bytes: any, $stream: any): void;
    function readSb($bytes: any, $stream: any, size: any): number;
    function readUb($bytes: any, $stream: any, size: any): number;
    function readFb($bytes: any, $stream: any, size: any): number;
    function readString($bytes: any, $stream: any, length: any): string;
    function readBinary($bytes: any, $stream: any, size: any, temporaryUsage: boolean): Uint8Array;
}
declare module Shumway.SWF.Parser {
    var tagHandler: any;
    function readHeader($bytes: any, $stream: any, $: any, swfVersion: any, tagCode: any): any;
}
declare module Shumway.SWF.Parser {
    interface ProgressInfo {
        bytesLoaded: number;
        bytesTotal: number;
    }
    interface IPipe {
        push(data: Uint8Array, progressInfo: ProgressInfo): any;
        close(): any;
    }
    function parseAsync(options: any): IPipe;
    function parse(buffer: any, options?: {}): void;
}
declare module Shumway.SWF.Parser {
    enum BitmapFormat {
        /**
        * 8-bit color mapped image.
        */
        FORMAT_COLORMAPPED = 3,
        /**
        * 15-bit RGB image.
        */
        FORMAT_15BPP = 4,
        /**
        * 24-bit RGB image, however stored as 4 byte value 0x00RRGGBB.
        */
        FORMAT_24BPP = 5,
    }
    function defineBitmap(tag: any): ImageDefinition;
}
declare module Shumway.SWF.Parser {
    function defineButton(tag: any, dictionary: any): any;
}
declare module Shumway.SWF.Parser {
    function defineFont(tag: any, dictionary: any): {
        type: string;
        id: any;
        name: any;
        bold: boolean;
        italic: boolean;
        codes: any;
        metrics: any;
        data: any;
    };
}
declare module Shumway.SWF.Parser {
    function parseJpegChunks(image: any, bytes: any): any[];
    interface ImageDefinition {
        type: string;
        id: number;
        width: number;
        height: number;
        mimeType: string;
        data: Uint8Array;
        dataType?: ImageType;
    }
    interface DefineImageTag {
        id: number;
        imgData: Uint8Array;
        mimeType: string;
        alphaData: boolean;
        incomplete: boolean;
    }
    function defineImage(tag: DefineImageTag, dictionary: any): ImageDefinition;
}
declare module Shumway.SWF.Parser {
    function defineLabel(tag: any, dictionary: any): {
        type: string;
        id: any;
        fillBounds: any;
        matrix: any;
        tag: {
            hasText: boolean;
            initialText: string;
            html: boolean;
            readonly: boolean;
        };
        coords: any[];
        static: boolean;
        require: any;
    };
}
declare module Shumway.SWF.Parser {
    function defineShape(tag: any, dictionary: any): {
        type: string;
        id: any;
        fillBounds: any;
        lineBounds: any;
        morphFillBounds: any;
        morphLineBounds: any;
        hasFills: boolean;
        hasLines: boolean;
        shape: PlainObjectShapeData;
        transferables: ArrayBuffer[];
        require: any[];
    };
}
declare module Shumway.SWF.Parser {
    function defineSound(tag: any, dictionary: any): {
        type: string;
        id: any;
        sampleRate: number;
        channels: number;
        pcm: any;
        packaged: any;
    };
    interface DecodedSound {
        streamId: number;
        samplesCount: number;
        pcm?: Float32Array;
        data?: Uint8Array;
        seek?: number;
    }
    class SwfSoundStream {
        public streamId: number;
        public samplesCount: number;
        public sampleRate: number;
        public channels: number;
        public format: any;
        public currentSample: number;
        public decode: (data: any) => DecodedSound;
        constructor(samplesCount: any, sampleRate: any, channels: any);
        public info : {
            samplesCount: number;
            sampleRate: number;
            channels: number;
            format: any;
            streamId: number;
        };
    }
    function createSoundStream(tag: any): SwfSoundStream;
}
declare module Shumway.SWF.Parser {
    function defineText(tag: any, dictionary: any): {
        type: string;
        id: any;
        fillBounds: any;
        variableName: any;
        tag: any;
        bold: boolean;
        italic: boolean;
        require: any;
    };
}
declare module Shumway.JPEG {
    class JpegImage {
        public width: number;
        public height: number;
        public jfif: {
            version: {
                major: number;
                minor: number;
            };
            densityUnits: number;
            xDensity: number;
            yDensity: number;
            thumbWidth: number;
            thumbHeight: number;
            thumbData: Uint8Array;
        };
        public adobe: {
            version: number;
            flags0: number;
            flags1: number;
            transformCode: number;
        };
        public components: any;
        public numComponents: number;
        public decodeTransform: boolean;
        public colorTransform: boolean;
        public parse(data: any): void;
        public _getLinearizedBlockData(width: number, height: number): Uint8Array;
        public _isColorConversionNeeded(): boolean;
        public _convertYccToRgb(data: Uint8Array): Uint8Array;
        public _convertYcckToRgb(data: Uint8Array): Uint8Array;
        public _convertYcckToCmyk(data: Uint8Array): Uint8Array;
        public _convertCmykToRgb(data: Uint8Array): Uint8Array;
        public getData(width: number, height: number, forceRGBoutput: boolean): Uint8Array;
        public copyToImageData(imageData: ImageData): void;
    }
}
declare module Shumway.SWF {
    var StreamNoDataError: {};
    class Stream {
        public bytes: Uint8Array;
        public pos: number;
        public end: number;
        public bitBuffer: number;
        public bitLength: number;
        public align: () => void;
        public ensure: (size: number) => void;
        public remaining: () => number;
        public substream: (begin: number, end: number) => Stream;
        public push: (data: any) => void;
        public getUint16: (offset: number, le: boolean) => number;
        constructor(buffer: any, offset?: number, length?: number, maxLength?: number);
    }
}
declare module Shumway.SWF {
    var InflateNoDataError: {};
    interface CompressionState {
        header: any;
        distanceTable: any;
        literalTable: any;
        sym: any;
        len: any;
        sym2: any;
    }
    interface CompressionOutput {
        data: Uint8Array;
        available: number;
        completed: boolean;
    }
    function verifyDeflateHeader(bytes: any): void;
    function createInflatedStream(bytes: any, outputLength: number): Stream;
    function inflateBlock(stream: Stream, output: CompressionOutput, state: CompressionState): void;
}
declare module Shumway.SWF {
    class ResourceLoader {
        private _subscription;
        private _messenger;
        constructor(scope: any, isWorker: any);
        public terminate(): void;
        public onmessage(event: any): void;
        public postMessage(data: any): void;
        public listener(data: any): void;
        private parseLoadedData(loader, request);
    }
}
