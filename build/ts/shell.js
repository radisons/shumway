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
function addLogPrefix(prefix, args) {
    return [].concat.apply([prefix], args);
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
var Shumway;
(function (Shumway) {
    (function (Unit) {
        Unit.everFailed = false;
        Unit.testNumber = 0;

        Unit.writer;

        function fail(message) {
            Unit.everFailed = true;
            Unit.writer.redLn(message);
        }
        Unit.fail = fail;

        function eqFloat(a, b, test, tolerance) {
            tolerance = typeof tolerance === "undefined" ? 0.1 : tolerance;
            test = description(test);
            var d = Math.abs(a - b);
            if (isNaN(d) || d >= tolerance) {
                return fail("FAIL " + test + ". Got " + a + ", expected " + b + failedLocation());
            }
            Unit.writer.writeLn("PASS" + test);
        }
        Unit.eqFloat = eqFloat;

        function neq(a, b, test) {
            test = description(test);
            if (a === b) {
                return fail("FAIL " + test + ". Got " + a + ", expected different (!==) value" + failedLocation());
            }
            Unit.writer.writeLn("PASS" + test);
        }
        Unit.neq = neq;

        function eq(a, b, test) {
            test = description(test);
            if (a !== b) {
                return fail("FAIL " + test + ". Got " + a + ", expected " + b + failedLocation());
            }
            Unit.writer.writeLn("PASS" + test);
        }
        Unit.eq = eq;

        function eqArray(a, b, test) {
            test = description(test);
            if (a == undefined && b) {
                return fail("FAIL" + test + " Null Array: a" + failedLocation());
            }
            if (a && b == undefined) {
                return fail("FAIL" + test + " Null Array: b" + failedLocation());
            }
            if (a.length !== b.length) {
                return fail("FAIL" + test + " Array Length Mismatch, got " + a.length + ", expected " + b.length + failedLocation());
            }
            for (var i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    if (!(typeof a[i] == "number" && typeof b[i] == "number" && isNaN(a[i]) && isNaN(b[i]))) {
                        return fail("FAIL" + test + " Array Element " + i + ": got " + a[i] + ", expected " + b[i] + failedLocation());
                    }
                }
            }
            Unit.writer.writeLn("PASS" + test);
        }
        Unit.eqArray = eqArray;

        function structEq(a, b, test) {
            test = description(test);
            if (a == undefined && b) {
                return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " + "but only `a` was" + failedLocation());
            }
            if (a && b == undefined) {
                return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " + "but only `b` was" + failedLocation());
            }
            var aKeys = Object.keys(a);
            var bKeys = Object.keys(b);
            for (var i = 0; i < aKeys.length; i++) {
                var key = aKeys[i];
                if (a[key] !== b[key]) {
                    return fail("FAIL" + test + " properties differ. a." + key + " = " + a[key] + ", b." + key + " = " + b[key] + failedLocation());
                }
            }
            for (i = 0; i < bKeys.length; i++) {
                key = bKeys[i];
                if (a[key] !== b[key]) {
                    return fail("FAIL" + test + " properties differ. a." + key + " = " + a[key] + ", b." + key + " = " + b[key] + failedLocation());
                }
            }
            Unit.writer.writeLn("PASS" + test);
        }
        Unit.structEq = structEq;

        function check(condition, test) {
            test = description(test);
            if (!condition) {
                return fail("FAIL " + test + ". Got " + condition + ", expected truthy value" + failedLocation());
            }
            Unit.writer.writeLn("PASS" + test);
        }
        Unit.check = check;

        function assertThrowsInstanceOf(f, ctor, test) {
            test = description(test);
            var msg;
            try  {
                f();
            } catch (exc) {
                if (exc instanceof ctor) {
                    return;
                }
                msg = "Expected exception " + ctor.name + ", got " + exc;
            }
            if (msg === undefined) {
                msg = "Expected exception " + ctor.name + ", no exception thrown";
            }
            return fail("FAIL " + test + ". " + msg + failedLocation());
        }
        Unit.assertThrowsInstanceOf = assertThrowsInstanceOf;

        function description(test) {
            Unit.testNumber++;
            return test ? ": " + test : " #" + Unit.testNumber;
        }
        Unit.description = description;

        function failedLocation() {
            return " (" + new Error().stack.split('\n')[2] + ")";
        }
        Unit.failedLocation = failedLocation;

        function info(s) {
            Unit.writer.writeLn("INFO: " + s);
        }
        Unit.info = info;

        function warn(s) {
            Unit.writer.writeLn("WARN: " + s);
        }
        Unit.warn = warn;

        function error(s) {
            Unit.writer.writeLn("ERROR: " + s);
        }
        Unit.error = error;
    })(Shumway.Unit || (Shumway.Unit = {}));
    var Unit = Shumway.Unit;
})(Shumway || (Shumway = {}));

/**
* Exported on the global object since unit tests don't import them explicitly.
*/
var check = Shumway.Unit.check;
var fail = Shumway.Unit.fail;
var eqFloat = Shumway.Unit.eqFloat;
var neq = Shumway.Unit.neq;
var eq = Shumway.Unit.eq;
var eqArray = Shumway.Unit.eqArray;
var structEq = Shumway.Unit.structEq;
var assertThrowsInstanceOf = Shumway.Unit.assertThrowsInstanceOf;
var info = Shumway.Unit.info;
var warn = Shumway.Unit.warn;
var error = Shumway.Unit.error;
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

var homePath = "";
var avm2Root = homePath + "src/avm2/";
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var avm1Path = avm2Root + "generated/avm1lib/avm1lib.abc";
var playerglobalInfo = {
    abcs: "build/playerglobal/playerglobal.abcs",
    catalog: "build/playerglobal/playerglobal.json"
};

/**
* Global unitTests array, unit tests add themselves to this. The list may have numbers, these indicate the
* number of times to run the test following it. This makes it easy to disable test by pushing a zero in
* front.
*/
var unitTests = [];

var isNode = typeof process === 'object';
if (isNode) {
    // Trying to get Node.js to work... no comments... it's everywhere when the isNode used.
    global.Shumway = Shumway;
    global.RegExp = RegExp;
    global.unitTests = unitTests;
    read = function (path, type) {
        var buffer = require('fs').readFileSync(path);
        return type !== 'binary' ? buffer.toString() : new Uint8Array(buffer);
    };
    load = function (path) {
        var fn = new Function(load.header + read(path) + load.footer);
        fn.call(global);
    };
    var listOfGlobals = [
        'Shumway', 'document', 'window', 'release', 'jsGlobal',
        'profile', 'RegExp', 'XMLHttpRequest', 'setTimeout', 'addEventListener',
        'navigator', 'runMicroTaskQueue', 'unitTests'];
    load.header = listOfGlobals.map(function (s) {
        return s + ' = this.' + s;
    }).join(';') + ';\n';
    load.footer = '\n' + listOfGlobals.map(function (s) {
        return 'if (' + s + ' !== this.' + s + ') { this.' + s + ' = ' + s + '; }';
    }).join('\n');
}

load("src/shell/domstubs.js");

/* Autogenerated parser references: base= */
load("build/ts/base.js");
load("build/ts/tools.js");

load("build/ts/swf.js");

/* Autogenerated parser references end */
/* Autogenerated player references: base= */
// DUP: load("build/ts/base.js");
// DUP: load("build/ts/tools.js");
load("build/ts/avm2.js");

load("build/ts/flash.js");

load("build/ts/avm1.js");

load("build/ts/gfx-base.js");
load("build/ts/player.js");

/* Autogenerated player references end */
var systemOptions = Shumway.Settings.shumwayOptions;
var shellOptions = systemOptions.register(new Shumway.Options.OptionSet("Shell Options"));

if (isNode) {
    load.header += Object.keys(Shumway.Unit).map(function (s) {
        return s + ' = Shumway.Unit.' + s;
    }).join(';') + ';\n';
    load.header += Object.keys(Shumway.AVM2.Runtime).map(function (s) {
        return s + ' = Shumway.AVM2.Runtime.' + s;
    }).join(';') + ';\n';
}

load('src/shell/playerservices.js');

var Shumway;
(function (Shumway) {
    (function (Shell) {
        var assert = Shumway.Debug.assert;
        var AbcFile = Shumway.AVM2.ABC.AbcFile;
        var Option = Shumway.Options.Option;

        var ArgumentParser = Shumway.Options.ArgumentParser;

        var Runtime = Shumway.AVM2.Runtime;
        var SwfTag = Shumway.SWF.Parser.SwfTag;

        var ShellPlayer = (function (_super) {
            __extends(ShellPlayer, _super);
            function ShellPlayer() {
                _super.apply(this, arguments);
            }
            ShellPlayer.prototype.onSendUpdates = function (updates, assets, async) {
                if (typeof async === "undefined") { async = true; }
                var bytes = updates.getBytes();

                // console.log('Updates sent');
                return null;
            };
            ShellPlayer.prototype.onFrameProcessed = function () {
                // console.log('Frame');
            };
            return ShellPlayer;
        })(Shumway.Player.Player);

        var verbose = false;
        var writer = new Shumway.IndentingWriter();

        function main(commandLineArguments) {
            var parseOption = shellOptions.register(new Option("p", "parse", "boolean", false, "Parse File(s)"));
            var parseForDatabaseOption = shellOptions.register(new Option("po", "parseForDatabase", "boolean", false, "Parse File(s)"));
            var disassembleOption = shellOptions.register(new Option("d", "disassemble", "boolean", false, "Disassemble File(s)"));
            var verboseOption = shellOptions.register(new Option("v", "verbose", "boolean", false, "Verbose"));
            var releaseOption = shellOptions.register(new Option("r", "release", "boolean", false, "Release mode"));
            var executeOption = shellOptions.register(new Option("x", "execute", "boolean", false, "Execute File(s)"));
            var executeSwfOption = shellOptions.register(new Option("s", "swf", "number", 0, "Execute SWF for n-ms"));
            var playerGlobalOption = shellOptions.register(new Option("g", "playerGlobal", "boolean", false, "Load Player Global"));

            var argumentParser = new ArgumentParser();
            argumentParser.addBoundOptionSet(systemOptions);

            function printUsage() {
                writer.enter("Shumway Command Line Interface");
                systemOptions.trace(writer);
                writer.leave("");
            }

            argumentParser.addArgument("h", "help", "boolean", { parse: function (x) {
                    printUsage();
                } });

            var files = [];

            try  {
                argumentParser.parse(commandLineArguments).filter(function (value, index, array) {
                    if (value.endsWith(".abc") || value.endsWith(".swf") || value.endsWith(".js")) {
                        files.push(value);
                    } else {
                        return true;
                    }
                });
            } catch (x) {
                writer.writeLn(x.message);
                quit();
            }

            release = releaseOption.value;
            verbose = verboseOption.value;

            Shumway.Unit.writer = new Shumway.IndentingWriter(!verbose);

            if (parseOption.value) {
                files.forEach(function (file) {
                    var start = dateNow();
                    if (verbose) {
                        writer.enter("Parsing: " + file);
                    }
                    parseFile(file, parseForDatabaseOption.value);
                    var elapsed = dateNow() - start;
                    if (verbose) {
                        verbose && writer.writeLn("Total Parse Time: " + (elapsed).toFixed(4));
                        writer.outdent();
                    }
                });
            }

            if (executeOption.value) {
                initializeAVM2(playerGlobalOption.value);
                files.forEach(function (file) {
                    executeFile(file);
                });
            } else if (executeSwfOption.value) {
                executeSWFFile(files[0]);
            } else if (disassembleOption.value) {
                files.forEach(function (file) {
                    if (file.endsWith(".abc")) {
                        disassembleABCFile(file);
                    }
                });
            }
        }
        Shell.main = main;

        function disassembleABCFile(file) {
            var buffer = read(file, "binary");
            var abc = new AbcFile(new Uint8Array(buffer), file);
            abc.trace(writer);
        }

        function executeFile(file) {
            if (file.endsWith(".js")) {
                executeUnitTestFile(file);
            } else if (file.endsWith(".abc")) {
                executeABCFile(file);
            }
            return true;
        }

        function executeSWFFile(file, runDuration) {
            if (typeof runDuration === "undefined") { runDuration = 1000; }
            var sysMode = 2 /* COMPILE */;
            var appMode = 2 /* COMPILE */;
            var asyncLoading = true;
            Shumway.createAVM2(builtinPath, playerglobalInfo, avm1Path, sysMode, appMode, function (avm2) {
                function runSWF(file) {
                    var player = new ShellPlayer();
                    player.load(file);
                }

                if (asyncLoading) {
                    Shumway.FileLoadingService.instance.setBaseUrl(file);
                    runSWF(file);
                } else {
                    Shumway.FileLoadingService.instance.setBaseUrl(file);
                    runSWF(read(file, 'binary'));
                }
            });

            console.log('Running for ' + runDuration + 'ms...');
            runMicroTaskQueue(runDuration);
            console.log('Done.');
        }

        function executeABCFile(file) {
            writer.writeLn("Running ABC: " + file);
            var buffer = read(file, "binary");
            Runtime.AVM2.instance.applicationDomain.executeAbc(new AbcFile(new Uint8Array(buffer), file));
            writer.outdent();
        }

        function executeUnitTestFile(file) {
            writer.writeLn("Running Unit Test: " + file);
            load(file);
            while (unitTests.length) {
                var test = unitTests.shift();
                var repeat = 1;
                if (typeof test === "number") {
                    repeat = test;
                    test = unitTests.shift();
                }
                if (verbose && test.name) {
                    writer.writeLn("Test: " + test.name);
                }
                try  {
                    for (var i = 0; i < repeat; i++) {
                        test();
                    }
                } catch (x) {
                    writer.redLn('Exception encountered while running ' + file + ':' + '(' + x + ')');
                    writer.redLns(x.stack);
                }
            }
            writer.outdent();
        }

        function parseSymbol(tag, symbols) {
            var symbol;
            switch (tag.code) {
                case 6 /* CODE_DEFINE_BITS */:
                case 21 /* CODE_DEFINE_BITS_JPEG2 */:
                case 35 /* CODE_DEFINE_BITS_JPEG3 */:
                case 90 /* CODE_DEFINE_BITS_JPEG4 */:
                case 8 /* CODE_JPEG_TABLES */:
                    symbol = Shumway.SWF.Parser.defineImage(tag, symbols);
                    break;
                case 20 /* CODE_DEFINE_BITS_LOSSLESS */:
                case 36 /* CODE_DEFINE_BITS_LOSSLESS2 */:
                    symbol = Shumway.SWF.Parser.defineBitmap(tag);
                    break;
                case 7 /* CODE_DEFINE_BUTTON */:
                case 34 /* CODE_DEFINE_BUTTON2 */:
                    break;
                case 37 /* CODE_DEFINE_EDIT_TEXT */:
                    symbol = Shumway.SWF.Parser.defineText(tag, symbols);
                    break;
                case 10 /* CODE_DEFINE_FONT */:
                case 48 /* CODE_DEFINE_FONT2 */:
                case 75 /* CODE_DEFINE_FONT3 */:
                case 91 /* CODE_DEFINE_FONT4 */:
                    symbol = Shumway.SWF.Parser.defineFont(tag, symbols);
                    break;
                case 46 /* CODE_DEFINE_MORPH_SHAPE */:
                case 84 /* CODE_DEFINE_MORPH_SHAPE2 */:
                case 2 /* CODE_DEFINE_SHAPE */:
                case 22 /* CODE_DEFINE_SHAPE2 */:
                case 32 /* CODE_DEFINE_SHAPE3 */:
                case 83 /* CODE_DEFINE_SHAPE4 */:
                    symbol = Shumway.SWF.Parser.defineShape(tag, symbols);
                    break;
                case 14 /* CODE_DEFINE_SOUND */:
                    symbol = Shumway.SWF.Parser.defineSound(tag, symbols);
                    break;
                default:
                    break;
            }
            symbols[tag.id] = symbol;
        }

        /**
        * Parses file.
        */
        function parseFile(file, parseForDatabase) {
            var fileName = file.replace(/^.*[\\\/]/, '');
            function parseABC(buffer) {
                new AbcFile(new Uint8Array(buffer), "ABC");
            }
            var buffers = [];
            if (file.endsWith(".swf")) {
                var fileNameWithoutExtension = fileName.substr(0, fileName.length - 4);
                var SWF_TAG_CODE_DO_ABC = 82 /* CODE_DO_ABC */;
                var SWF_TAG_CODE_DO_ABC_ = 72 /* CODE_DO_ABC_ */;
                try  {
                    var buffer = read(file, "binary");
                    var startSWF = dateNow();
                    Shumway.SWF.Parser.parse(buffer, {
                        oncomplete: function (result) {
                            var symbols = {};
                            var tags = result.tags;
                            var counter = new Shumway.Metrics.Counter(true);
                            for (var i = 0; i < tags.length; i++) {
                                var tag = tags[i];
                                assert(tag.code !== undefined);
                                var startTag = dateNow();
                                if (!parseForDatabase) {
                                    if (tag.code === SWF_TAG_CODE_DO_ABC || tag.code === SWF_TAG_CODE_DO_ABC_) {
                                        parseABC(tag.data);
                                    } else {
                                        parseSymbol(tag, symbols);
                                    }
                                }
                                var tagName = SwfTag[tag.code];
                                if (tagName) {
                                    tagName = tagName.substring("CODE_".length);
                                } else {
                                    tagName = "TAG" + tag.code;
                                }
                                counter.count(tagName, 1, dateNow() - startTag);
                            }
                            if (parseForDatabase) {
                                writer.writeLn(JSON.stringify({
                                    size: buffer.byteLength,
                                    time: dateNow() - startSWF,
                                    name: fileNameWithoutExtension,
                                    tags: counter.toJSON()
                                }, null, 0));
                            } else if (verbose) {
                                writer.enter("Tag Frequency:");
                                counter.traceSorted(writer);
                                writer.outdent();
                            }
                        }
                    });
                } catch (x) {
                    if (verbose) {
                        writer.redLn("Cannot parse: " + file + ", reason: " + x);
                        writer.redLns(x.stack);
                    }
                    return false;
                }
            } else if (file.endsWith(".abc")) {
                parseABC(read(file, "binary"));
            }
            return true;
        }

        function createAVM2(builtinPath, libraryPathInfo) {
            var buffer = read(builtinPath, 'binary');
            Runtime.AVM2.initialize(2 /* COMPILE */, 2 /* COMPILE */, null);
            var avm2Instance = Runtime.AVM2.instance;
            Shumway.AVM2.AS.linkNatives(avm2Instance);
            avm2Instance.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
            if (libraryPathInfo) {
                loadPlayerglobal(libraryPathInfo.abcs, libraryPathInfo.catalog);
            }
        }

        function initializeAVM2(loadPlayerglobal) {
            createAVM2(builtinPath, loadPlayerglobal ? playerglobalInfo : undefined);
        }

        function loadPlayerglobal(abcsPath, catalogPath) {
            var playerglobal = Shumway.AVM2.Runtime.playerglobal = {
                abcs: read(abcsPath, 'binary').buffer,
                map: Object.create(null),
                scripts: Object.create(null)
            };
            var catalog = JSON.parse(read(catalogPath));
            for (var i = 0; i < catalog.length; i++) {
                var abc = catalog[i];
                playerglobal.scripts[abc.name] = abc;
                if (typeof abc.defs === 'string') {
                    playerglobal.map[abc.defs] = abc.name;
                    writer.writeLn(abc.defs);
                } else {
                    for (var j = 0; j < abc.defs.length; j++) {
                        var def = abc.defs[j];
                        playerglobal.map[def] = abc.name;
                    }
                }
            }
        }
    })(Shumway.Shell || (Shumway.Shell = {}));
    var Shell = Shumway.Shell;
})(Shumway || (Shumway = {}));

var commandLineArguments;

// Shell Entry Point
if (typeof help === "function") {
    // SpiderMonkey
    if (typeof scriptArgs === "undefined") {
        commandLineArguments = arguments;
    } else {
        commandLineArguments = scriptArgs;
    }
} else if (isNode) {
    // node.js
    var commandLineArguments = Array.prototype.slice.call(process.argv, 2);
}
Shumway.Shell.main(commandLineArguments);
/// <reference path='../../build/ts/base.d.ts' />
/// <reference path='../../build/ts/tools.d.ts' />
/// <reference path='../../build/ts/swf.d.ts' />
/// <reference path='../../build/ts/flash.d.ts' />
/// <reference path='../../build/ts/player.d.ts' />
///<reference path='module.ts' />
///<reference path='unit.ts' />
///<reference path='shell.ts' />
//# sourceMappingURL=shell.js.map
