var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance2 = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance2;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// node_modules/is-network-error/index.js
var objectToString = Object.prototype.toString;
var isError = /* @__PURE__ */ __name((value) => objectToString.call(value) === "[object Error]", "isError");
var errorMessages = /* @__PURE__ */ new Set([
  "network error",
  // Chrome
  "Failed to fetch",
  // Chrome
  "NetworkError when attempting to fetch resource.",
  // Firefox
  "The Internet connection appears to be offline.",
  // Safari 16
  "Network request failed",
  // `cross-fetch`
  "fetch failed",
  // Undici (Node.js)
  "terminated",
  // Undici (Node.js)
  " A network error occurred.",
  // Bun (WebKit)
  "Network connection lost"
  // Cloudflare Workers (fetch)
]);
function isNetworkError(error3) {
  const isValid = error3 && isError(error3) && error3.name === "TypeError" && typeof error3.message === "string";
  if (!isValid) {
    return false;
  }
  const { message, stack } = error3;
  if (message === "Load failed") {
    return stack === void 0 || "__sentry_captured__" in error3;
  }
  if (message.startsWith("error sending request for url")) {
    return true;
  }
  return errorMessages.has(message);
}
__name(isNetworkError, "isNetworkError");

// node_modules/p-retry/index.js
function validateRetries(retries) {
  if (typeof retries === "number") {
    if (retries < 0) {
      throw new TypeError("Expected `retries` to be a non-negative number.");
    }
    if (Number.isNaN(retries)) {
      throw new TypeError("Expected `retries` to be a valid number or Infinity, got NaN.");
    }
  } else if (retries !== void 0) {
    throw new TypeError("Expected `retries` to be a number or Infinity.");
  }
}
__name(validateRetries, "validateRetries");
function validateNumberOption(name, value, { min = 0, allowInfinity = false } = {}) {
  if (value === void 0) {
    return;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`Expected \`${name}\` to be a number${allowInfinity ? " or Infinity" : ""}.`);
  }
  if (!allowInfinity && !Number.isFinite(value)) {
    throw new TypeError(`Expected \`${name}\` to be a finite number.`);
  }
  if (value < min) {
    throw new TypeError(`Expected \`${name}\` to be \u2265 ${min}.`);
  }
}
__name(validateNumberOption, "validateNumberOption");
var AbortError = class extends Error {
  static {
    __name(this, "AbortError");
  }
  constructor(message) {
    super();
    if (message instanceof Error) {
      this.originalError = message;
      ({ message } = message);
    } else {
      this.originalError = new Error(message);
      this.originalError.stack = this.stack;
    }
    this.name = "AbortError";
    this.message = message;
  }
};
function calculateDelay(retriesConsumed, options) {
  const attempt = Math.max(1, retriesConsumed + 1);
  const random = options.randomize ? Math.random() + 1 : 1;
  let timeout = Math.round(random * options.minTimeout * options.factor ** (attempt - 1));
  timeout = Math.min(timeout, options.maxTimeout);
  return timeout;
}
__name(calculateDelay, "calculateDelay");
function calculateRemainingTime(start, max) {
  if (!Number.isFinite(max)) {
    return max;
  }
  return max - (performance.now() - start);
}
__name(calculateRemainingTime, "calculateRemainingTime");
async function onAttemptFailure({ error: error3, attemptNumber, retriesConsumed, startTime, options }) {
  const normalizedError = error3 instanceof Error ? error3 : new TypeError(`Non-error was thrown: "${error3}". You should only throw errors.`);
  if (normalizedError instanceof AbortError) {
    throw normalizedError.originalError;
  }
  const retriesLeft = Number.isFinite(options.retries) ? Math.max(0, options.retries - retriesConsumed) : options.retries;
  const maxRetryTime = options.maxRetryTime ?? Number.POSITIVE_INFINITY;
  const context2 = Object.freeze({
    error: normalizedError,
    attemptNumber,
    retriesLeft,
    retriesConsumed
  });
  await options.onFailedAttempt(context2);
  if (calculateRemainingTime(startTime, maxRetryTime) <= 0) {
    throw normalizedError;
  }
  const consumeRetry = await options.shouldConsumeRetry(context2);
  const remainingTime = calculateRemainingTime(startTime, maxRetryTime);
  if (remainingTime <= 0 || retriesLeft <= 0) {
    throw normalizedError;
  }
  if (normalizedError instanceof TypeError && !isNetworkError(normalizedError)) {
    if (consumeRetry) {
      throw normalizedError;
    }
    options.signal?.throwIfAborted();
    return false;
  }
  if (!await options.shouldRetry(context2)) {
    throw normalizedError;
  }
  if (!consumeRetry) {
    options.signal?.throwIfAborted();
    return false;
  }
  const delayTime = calculateDelay(retriesConsumed, options);
  const finalDelay = Math.min(delayTime, remainingTime);
  options.signal?.throwIfAborted();
  if (finalDelay > 0) {
    await new Promise((resolve, reject) => {
      const onAbort = /* @__PURE__ */ __name(() => {
        clearTimeout(timeoutToken);
        options.signal?.removeEventListener("abort", onAbort);
        reject(options.signal.reason);
      }, "onAbort");
      const timeoutToken = setTimeout(() => {
        options.signal?.removeEventListener("abort", onAbort);
        resolve();
      }, finalDelay);
      if (options.unref) {
        timeoutToken.unref?.();
      }
      options.signal?.addEventListener("abort", onAbort, { once: true });
    });
  }
  options.signal?.throwIfAborted();
  return true;
}
__name(onAttemptFailure, "onAttemptFailure");
async function pRetry(input, options = {}) {
  options = { ...options };
  validateRetries(options.retries);
  if (Object.hasOwn(options, "forever")) {
    throw new Error("The `forever` option is no longer supported. For many use-cases, you can set `retries: Infinity` instead.");
  }
  options.retries ??= 10;
  options.factor ??= 2;
  options.minTimeout ??= 1e3;
  options.maxTimeout ??= Number.POSITIVE_INFINITY;
  options.maxRetryTime ??= Number.POSITIVE_INFINITY;
  options.randomize ??= false;
  options.onFailedAttempt ??= () => {
  };
  options.shouldRetry ??= () => true;
  options.shouldConsumeRetry ??= () => true;
  validateNumberOption("factor", options.factor, { min: 0, allowInfinity: false });
  validateNumberOption("minTimeout", options.minTimeout, { min: 0, allowInfinity: false });
  validateNumberOption("maxTimeout", options.maxTimeout, { min: 0, allowInfinity: true });
  validateNumberOption("maxRetryTime", options.maxRetryTime, { min: 0, allowInfinity: true });
  if (!(options.factor > 0)) {
    options.factor = 1;
  }
  options.signal?.throwIfAborted();
  let attemptNumber = 0;
  let retriesConsumed = 0;
  const startTime = performance.now();
  while (Number.isFinite(options.retries) ? retriesConsumed <= options.retries : true) {
    attemptNumber++;
    try {
      options.signal?.throwIfAborted();
      const result = await input(attemptNumber);
      options.signal?.throwIfAborted();
      return result;
    } catch (error3) {
      if (await onAttemptFailure({
        error: error3,
        attemptNumber,
        retriesConsumed,
        startTime,
        options
      })) {
        retriesConsumed++;
      }
    }
  }
  throw new Error("Retry attempts exhausted without throwing an error.");
}
__name(pRetry, "pRetry");

// node_modules/@google/genai/dist/web/index.mjs
var _defaultBaseGeminiUrl = void 0;
var _defaultBaseVertexUrl = void 0;
function getDefaultBaseUrls() {
  return {
    geminiUrl: _defaultBaseGeminiUrl,
    vertexUrl: _defaultBaseVertexUrl
  };
}
__name(getDefaultBaseUrls, "getDefaultBaseUrls");
function getBaseUrl(httpOptions, vertexai, vertexBaseUrlFromEnv, geminiBaseUrlFromEnv) {
  var _a2, _b;
  if (!(httpOptions === null || httpOptions === void 0 ? void 0 : httpOptions.baseUrl)) {
    const defaultBaseUrls = getDefaultBaseUrls();
    if (vertexai) {
      return (_a2 = defaultBaseUrls.vertexUrl) !== null && _a2 !== void 0 ? _a2 : vertexBaseUrlFromEnv;
    } else {
      return (_b = defaultBaseUrls.geminiUrl) !== null && _b !== void 0 ? _b : geminiBaseUrlFromEnv;
    }
  }
  return httpOptions.baseUrl;
}
__name(getBaseUrl, "getBaseUrl");
var BaseModule = class {
  static {
    __name(this, "BaseModule");
  }
};
function formatMap(templateString, valueMap) {
  const regex = /\{([^}]+)\}/g;
  return templateString.replace(regex, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(valueMap, key)) {
      const value = valueMap[key];
      return value !== void 0 && value !== null ? String(value) : "";
    } else {
      throw new Error(`Key '${key}' not found in valueMap.`);
    }
  });
}
__name(formatMap, "formatMap");
function setValueByPath(data, keys, value) {
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (key.endsWith("[]")) {
      const keyName = key.slice(0, -2);
      if (!(keyName in data)) {
        if (Array.isArray(value)) {
          data[keyName] = Array.from({ length: value.length }, () => ({}));
        } else {
          throw new Error(`Value must be a list given an array path ${key}`);
        }
      }
      if (Array.isArray(data[keyName])) {
        const arrayData = data[keyName];
        if (Array.isArray(value)) {
          for (let j = 0; j < arrayData.length; j++) {
            const entry = arrayData[j];
            setValueByPath(entry, keys.slice(i + 1), value[j]);
          }
        } else {
          for (const d of arrayData) {
            setValueByPath(d, keys.slice(i + 1), value);
          }
        }
      }
      return;
    } else if (key.endsWith("[0]")) {
      const keyName = key.slice(0, -3);
      if (!(keyName in data)) {
        data[keyName] = [{}];
      }
      const arrayData = data[keyName];
      setValueByPath(arrayData[0], keys.slice(i + 1), value);
      return;
    }
    if (!data[key] || typeof data[key] !== "object") {
      data[key] = {};
    }
    data = data[key];
  }
  const keyToSet = keys[keys.length - 1];
  const existingData = data[keyToSet];
  if (existingData !== void 0) {
    if (!value || typeof value === "object" && Object.keys(value).length === 0) {
      return;
    }
    if (value === existingData) {
      return;
    }
    if (typeof existingData === "object" && typeof value === "object" && existingData !== null && value !== null) {
      Object.assign(existingData, value);
    } else {
      throw new Error(`Cannot set value for an existing key. Key: ${keyToSet}`);
    }
  } else {
    if (keyToSet === "_self" && typeof value === "object" && value !== null && !Array.isArray(value)) {
      const valueAsRecord = value;
      Object.assign(data, valueAsRecord);
    } else {
      data[keyToSet] = value;
    }
  }
}
__name(setValueByPath, "setValueByPath");
function getValueByPath(data, keys, defaultValue = void 0) {
  try {
    if (keys.length === 1 && keys[0] === "_self") {
      return data;
    }
    for (let i = 0; i < keys.length; i++) {
      if (typeof data !== "object" || data === null) {
        return defaultValue;
      }
      const key = keys[i];
      if (key.endsWith("[]")) {
        const keyName = key.slice(0, -2);
        if (keyName in data) {
          const arrayData = data[keyName];
          if (!Array.isArray(arrayData)) {
            return defaultValue;
          }
          return arrayData.map((d) => getValueByPath(d, keys.slice(i + 1), defaultValue));
        } else {
          return defaultValue;
        }
      } else {
        data = data[key];
      }
    }
    return data;
  } catch (error3) {
    if (error3 instanceof TypeError) {
      return defaultValue;
    }
    throw error3;
  }
}
__name(getValueByPath, "getValueByPath");
function moveValueByPath(data, paths) {
  for (const [sourcePath, destPath] of Object.entries(paths)) {
    const sourceKeys = sourcePath.split(".");
    const destKeys = destPath.split(".");
    const excludeKeys = /* @__PURE__ */ new Set();
    let wildcardIdx = -1;
    for (let i = 0; i < sourceKeys.length; i++) {
      if (sourceKeys[i] === "*") {
        wildcardIdx = i;
        break;
      }
    }
    if (wildcardIdx !== -1 && destKeys.length > wildcardIdx) {
      for (let i = wildcardIdx; i < destKeys.length; i++) {
        const key = destKeys[i];
        if (key !== "*" && !key.endsWith("[]") && !key.endsWith("[0]")) {
          excludeKeys.add(key);
        }
      }
    }
    _moveValueRecursive(data, sourceKeys, destKeys, 0, excludeKeys);
  }
}
__name(moveValueByPath, "moveValueByPath");
function _moveValueRecursive(data, sourceKeys, destKeys, keyIdx, excludeKeys) {
  if (keyIdx >= sourceKeys.length) {
    return;
  }
  if (typeof data !== "object" || data === null) {
    return;
  }
  const key = sourceKeys[keyIdx];
  if (key.endsWith("[]")) {
    const keyName = key.slice(0, -2);
    const dataRecord = data;
    if (keyName in dataRecord && Array.isArray(dataRecord[keyName])) {
      for (const item of dataRecord[keyName]) {
        _moveValueRecursive(item, sourceKeys, destKeys, keyIdx + 1, excludeKeys);
      }
    }
  } else if (key === "*") {
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      const dataRecord = data;
      const keysToMove = Object.keys(dataRecord).filter((k) => !k.startsWith("_") && !excludeKeys.has(k));
      const valuesToMove = {};
      for (const k of keysToMove) {
        valuesToMove[k] = dataRecord[k];
      }
      for (const [k, v] of Object.entries(valuesToMove)) {
        const newDestKeys = [];
        for (const dk of destKeys.slice(keyIdx)) {
          if (dk === "*") {
            newDestKeys.push(k);
          } else {
            newDestKeys.push(dk);
          }
        }
        setValueByPath(dataRecord, newDestKeys, v);
      }
      for (const k of keysToMove) {
        delete dataRecord[k];
      }
    }
  } else {
    const dataRecord = data;
    if (key in dataRecord) {
      _moveValueRecursive(dataRecord[key], sourceKeys, destKeys, keyIdx + 1, excludeKeys);
    }
  }
}
__name(_moveValueRecursive, "_moveValueRecursive");
function tBytes$1(fromBytes) {
  if (typeof fromBytes !== "string") {
    throw new Error("fromImageBytes must be a string");
  }
  return fromBytes;
}
__name(tBytes$1, "tBytes$1");
function fetchPredictOperationParametersToVertex(fromObject) {
  const toObject = {};
  const fromOperationName = getValueByPath(fromObject, [
    "operationName"
  ]);
  if (fromOperationName != null) {
    setValueByPath(toObject, ["operationName"], fromOperationName);
  }
  const fromResourceName = getValueByPath(fromObject, ["resourceName"]);
  if (fromResourceName != null) {
    setValueByPath(toObject, ["_url", "resourceName"], fromResourceName);
  }
  return toObject;
}
__name(fetchPredictOperationParametersToVertex, "fetchPredictOperationParametersToVertex");
function generateVideosOperationFromMldev$1(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromMetadata = getValueByPath(fromObject, ["metadata"]);
  if (fromMetadata != null) {
    setValueByPath(toObject, ["metadata"], fromMetadata);
  }
  const fromDone = getValueByPath(fromObject, ["done"]);
  if (fromDone != null) {
    setValueByPath(toObject, ["done"], fromDone);
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  const fromResponse = getValueByPath(fromObject, [
    "response",
    "generateVideoResponse"
  ]);
  if (fromResponse != null) {
    setValueByPath(toObject, ["response"], generateVideosResponseFromMldev$1(fromResponse));
  }
  return toObject;
}
__name(generateVideosOperationFromMldev$1, "generateVideosOperationFromMldev$1");
function generateVideosOperationFromVertex$1(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromMetadata = getValueByPath(fromObject, ["metadata"]);
  if (fromMetadata != null) {
    setValueByPath(toObject, ["metadata"], fromMetadata);
  }
  const fromDone = getValueByPath(fromObject, ["done"]);
  if (fromDone != null) {
    setValueByPath(toObject, ["done"], fromDone);
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  const fromResponse = getValueByPath(fromObject, ["response"]);
  if (fromResponse != null) {
    setValueByPath(toObject, ["response"], generateVideosResponseFromVertex$1(fromResponse));
  }
  return toObject;
}
__name(generateVideosOperationFromVertex$1, "generateVideosOperationFromVertex$1");
function generateVideosResponseFromMldev$1(fromObject) {
  const toObject = {};
  const fromGeneratedVideos = getValueByPath(fromObject, [
    "generatedSamples"
  ]);
  if (fromGeneratedVideos != null) {
    let transformedList = fromGeneratedVideos;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return generatedVideoFromMldev$1(item);
      });
    }
    setValueByPath(toObject, ["generatedVideos"], transformedList);
  }
  const fromRaiMediaFilteredCount = getValueByPath(fromObject, [
    "raiMediaFilteredCount"
  ]);
  if (fromRaiMediaFilteredCount != null) {
    setValueByPath(toObject, ["raiMediaFilteredCount"], fromRaiMediaFilteredCount);
  }
  const fromRaiMediaFilteredReasons = getValueByPath(fromObject, [
    "raiMediaFilteredReasons"
  ]);
  if (fromRaiMediaFilteredReasons != null) {
    setValueByPath(toObject, ["raiMediaFilteredReasons"], fromRaiMediaFilteredReasons);
  }
  return toObject;
}
__name(generateVideosResponseFromMldev$1, "generateVideosResponseFromMldev$1");
function generateVideosResponseFromVertex$1(fromObject) {
  const toObject = {};
  const fromGeneratedVideos = getValueByPath(fromObject, ["videos"]);
  if (fromGeneratedVideos != null) {
    let transformedList = fromGeneratedVideos;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return generatedVideoFromVertex$1(item);
      });
    }
    setValueByPath(toObject, ["generatedVideos"], transformedList);
  }
  const fromRaiMediaFilteredCount = getValueByPath(fromObject, [
    "raiMediaFilteredCount"
  ]);
  if (fromRaiMediaFilteredCount != null) {
    setValueByPath(toObject, ["raiMediaFilteredCount"], fromRaiMediaFilteredCount);
  }
  const fromRaiMediaFilteredReasons = getValueByPath(fromObject, [
    "raiMediaFilteredReasons"
  ]);
  if (fromRaiMediaFilteredReasons != null) {
    setValueByPath(toObject, ["raiMediaFilteredReasons"], fromRaiMediaFilteredReasons);
  }
  return toObject;
}
__name(generateVideosResponseFromVertex$1, "generateVideosResponseFromVertex$1");
function generatedVideoFromMldev$1(fromObject) {
  const toObject = {};
  const fromVideo = getValueByPath(fromObject, ["video"]);
  if (fromVideo != null) {
    setValueByPath(toObject, ["video"], videoFromMldev$1(fromVideo));
  }
  return toObject;
}
__name(generatedVideoFromMldev$1, "generatedVideoFromMldev$1");
function generatedVideoFromVertex$1(fromObject) {
  const toObject = {};
  const fromVideo = getValueByPath(fromObject, ["_self"]);
  if (fromVideo != null) {
    setValueByPath(toObject, ["video"], videoFromVertex$1(fromVideo));
  }
  return toObject;
}
__name(generatedVideoFromVertex$1, "generatedVideoFromVertex$1");
function getOperationParametersToMldev(fromObject) {
  const toObject = {};
  const fromOperationName = getValueByPath(fromObject, [
    "operationName"
  ]);
  if (fromOperationName != null) {
    setValueByPath(toObject, ["_url", "operationName"], fromOperationName);
  }
  return toObject;
}
__name(getOperationParametersToMldev, "getOperationParametersToMldev");
function getOperationParametersToVertex(fromObject) {
  const toObject = {};
  const fromOperationName = getValueByPath(fromObject, [
    "operationName"
  ]);
  if (fromOperationName != null) {
    setValueByPath(toObject, ["_url", "operationName"], fromOperationName);
  }
  return toObject;
}
__name(getOperationParametersToVertex, "getOperationParametersToVertex");
function importFileOperationFromMldev$1(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromMetadata = getValueByPath(fromObject, ["metadata"]);
  if (fromMetadata != null) {
    setValueByPath(toObject, ["metadata"], fromMetadata);
  }
  const fromDone = getValueByPath(fromObject, ["done"]);
  if (fromDone != null) {
    setValueByPath(toObject, ["done"], fromDone);
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  const fromResponse = getValueByPath(fromObject, ["response"]);
  if (fromResponse != null) {
    setValueByPath(toObject, ["response"], importFileResponseFromMldev$1(fromResponse));
  }
  return toObject;
}
__name(importFileOperationFromMldev$1, "importFileOperationFromMldev$1");
function importFileResponseFromMldev$1(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromParent = getValueByPath(fromObject, ["parent"]);
  if (fromParent != null) {
    setValueByPath(toObject, ["parent"], fromParent);
  }
  const fromDocumentName = getValueByPath(fromObject, ["documentName"]);
  if (fromDocumentName != null) {
    setValueByPath(toObject, ["documentName"], fromDocumentName);
  }
  return toObject;
}
__name(importFileResponseFromMldev$1, "importFileResponseFromMldev$1");
function uploadToFileSearchStoreOperationFromMldev(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromMetadata = getValueByPath(fromObject, ["metadata"]);
  if (fromMetadata != null) {
    setValueByPath(toObject, ["metadata"], fromMetadata);
  }
  const fromDone = getValueByPath(fromObject, ["done"]);
  if (fromDone != null) {
    setValueByPath(toObject, ["done"], fromDone);
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  const fromResponse = getValueByPath(fromObject, ["response"]);
  if (fromResponse != null) {
    setValueByPath(toObject, ["response"], uploadToFileSearchStoreResponseFromMldev(fromResponse));
  }
  return toObject;
}
__name(uploadToFileSearchStoreOperationFromMldev, "uploadToFileSearchStoreOperationFromMldev");
function uploadToFileSearchStoreResponseFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromParent = getValueByPath(fromObject, ["parent"]);
  if (fromParent != null) {
    setValueByPath(toObject, ["parent"], fromParent);
  }
  const fromDocumentName = getValueByPath(fromObject, ["documentName"]);
  if (fromDocumentName != null) {
    setValueByPath(toObject, ["documentName"], fromDocumentName);
  }
  return toObject;
}
__name(uploadToFileSearchStoreResponseFromMldev, "uploadToFileSearchStoreResponseFromMldev");
function videoFromMldev$1(fromObject) {
  const toObject = {};
  const fromUri = getValueByPath(fromObject, ["uri"]);
  if (fromUri != null) {
    setValueByPath(toObject, ["uri"], fromUri);
  }
  const fromVideoBytes = getValueByPath(fromObject, ["encodedVideo"]);
  if (fromVideoBytes != null) {
    setValueByPath(toObject, ["videoBytes"], tBytes$1(fromVideoBytes));
  }
  const fromMimeType = getValueByPath(fromObject, ["encoding"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(videoFromMldev$1, "videoFromMldev$1");
function videoFromVertex$1(fromObject) {
  const toObject = {};
  const fromUri = getValueByPath(fromObject, ["gcsUri"]);
  if (fromUri != null) {
    setValueByPath(toObject, ["uri"], fromUri);
  }
  const fromVideoBytes = getValueByPath(fromObject, [
    "bytesBase64Encoded"
  ]);
  if (fromVideoBytes != null) {
    setValueByPath(toObject, ["videoBytes"], tBytes$1(fromVideoBytes));
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(videoFromVertex$1, "videoFromVertex$1");
var Outcome;
(function(Outcome2) {
  Outcome2["OUTCOME_UNSPECIFIED"] = "OUTCOME_UNSPECIFIED";
  Outcome2["OUTCOME_OK"] = "OUTCOME_OK";
  Outcome2["OUTCOME_FAILED"] = "OUTCOME_FAILED";
  Outcome2["OUTCOME_DEADLINE_EXCEEDED"] = "OUTCOME_DEADLINE_EXCEEDED";
})(Outcome || (Outcome = {}));
var Language;
(function(Language2) {
  Language2["LANGUAGE_UNSPECIFIED"] = "LANGUAGE_UNSPECIFIED";
  Language2["PYTHON"] = "PYTHON";
})(Language || (Language = {}));
var FunctionResponseScheduling;
(function(FunctionResponseScheduling2) {
  FunctionResponseScheduling2["SCHEDULING_UNSPECIFIED"] = "SCHEDULING_UNSPECIFIED";
  FunctionResponseScheduling2["SILENT"] = "SILENT";
  FunctionResponseScheduling2["WHEN_IDLE"] = "WHEN_IDLE";
  FunctionResponseScheduling2["INTERRUPT"] = "INTERRUPT";
})(FunctionResponseScheduling || (FunctionResponseScheduling = {}));
var Type;
(function(Type2) {
  Type2["TYPE_UNSPECIFIED"] = "TYPE_UNSPECIFIED";
  Type2["STRING"] = "STRING";
  Type2["NUMBER"] = "NUMBER";
  Type2["INTEGER"] = "INTEGER";
  Type2["BOOLEAN"] = "BOOLEAN";
  Type2["ARRAY"] = "ARRAY";
  Type2["OBJECT"] = "OBJECT";
  Type2["NULL"] = "NULL";
})(Type || (Type = {}));
var ApiSpec;
(function(ApiSpec2) {
  ApiSpec2["API_SPEC_UNSPECIFIED"] = "API_SPEC_UNSPECIFIED";
  ApiSpec2["SIMPLE_SEARCH"] = "SIMPLE_SEARCH";
  ApiSpec2["ELASTIC_SEARCH"] = "ELASTIC_SEARCH";
})(ApiSpec || (ApiSpec = {}));
var AuthType;
(function(AuthType2) {
  AuthType2["AUTH_TYPE_UNSPECIFIED"] = "AUTH_TYPE_UNSPECIFIED";
  AuthType2["NO_AUTH"] = "NO_AUTH";
  AuthType2["API_KEY_AUTH"] = "API_KEY_AUTH";
  AuthType2["HTTP_BASIC_AUTH"] = "HTTP_BASIC_AUTH";
  AuthType2["GOOGLE_SERVICE_ACCOUNT_AUTH"] = "GOOGLE_SERVICE_ACCOUNT_AUTH";
  AuthType2["OAUTH"] = "OAUTH";
  AuthType2["OIDC_AUTH"] = "OIDC_AUTH";
})(AuthType || (AuthType = {}));
var HttpElementLocation;
(function(HttpElementLocation2) {
  HttpElementLocation2["HTTP_IN_UNSPECIFIED"] = "HTTP_IN_UNSPECIFIED";
  HttpElementLocation2["HTTP_IN_QUERY"] = "HTTP_IN_QUERY";
  HttpElementLocation2["HTTP_IN_HEADER"] = "HTTP_IN_HEADER";
  HttpElementLocation2["HTTP_IN_PATH"] = "HTTP_IN_PATH";
  HttpElementLocation2["HTTP_IN_BODY"] = "HTTP_IN_BODY";
  HttpElementLocation2["HTTP_IN_COOKIE"] = "HTTP_IN_COOKIE";
})(HttpElementLocation || (HttpElementLocation = {}));
var PhishBlockThreshold;
(function(PhishBlockThreshold2) {
  PhishBlockThreshold2["PHISH_BLOCK_THRESHOLD_UNSPECIFIED"] = "PHISH_BLOCK_THRESHOLD_UNSPECIFIED";
  PhishBlockThreshold2["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
  PhishBlockThreshold2["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
  PhishBlockThreshold2["BLOCK_HIGH_AND_ABOVE"] = "BLOCK_HIGH_AND_ABOVE";
  PhishBlockThreshold2["BLOCK_HIGHER_AND_ABOVE"] = "BLOCK_HIGHER_AND_ABOVE";
  PhishBlockThreshold2["BLOCK_VERY_HIGH_AND_ABOVE"] = "BLOCK_VERY_HIGH_AND_ABOVE";
  PhishBlockThreshold2["BLOCK_ONLY_EXTREMELY_HIGH"] = "BLOCK_ONLY_EXTREMELY_HIGH";
})(PhishBlockThreshold || (PhishBlockThreshold = {}));
var Behavior;
(function(Behavior2) {
  Behavior2["UNSPECIFIED"] = "UNSPECIFIED";
  Behavior2["BLOCKING"] = "BLOCKING";
  Behavior2["NON_BLOCKING"] = "NON_BLOCKING";
})(Behavior || (Behavior = {}));
var DynamicRetrievalConfigMode;
(function(DynamicRetrievalConfigMode2) {
  DynamicRetrievalConfigMode2["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
  DynamicRetrievalConfigMode2["MODE_DYNAMIC"] = "MODE_DYNAMIC";
})(DynamicRetrievalConfigMode || (DynamicRetrievalConfigMode = {}));
var FunctionCallingConfigMode;
(function(FunctionCallingConfigMode2) {
  FunctionCallingConfigMode2["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
  FunctionCallingConfigMode2["AUTO"] = "AUTO";
  FunctionCallingConfigMode2["ANY"] = "ANY";
  FunctionCallingConfigMode2["NONE"] = "NONE";
  FunctionCallingConfigMode2["VALIDATED"] = "VALIDATED";
})(FunctionCallingConfigMode || (FunctionCallingConfigMode = {}));
var ThinkingLevel;
(function(ThinkingLevel2) {
  ThinkingLevel2["THINKING_LEVEL_UNSPECIFIED"] = "THINKING_LEVEL_UNSPECIFIED";
  ThinkingLevel2["LOW"] = "LOW";
  ThinkingLevel2["MEDIUM"] = "MEDIUM";
  ThinkingLevel2["HIGH"] = "HIGH";
  ThinkingLevel2["MINIMAL"] = "MINIMAL";
})(ThinkingLevel || (ThinkingLevel = {}));
var HarmCategory;
(function(HarmCategory2) {
  HarmCategory2["HARM_CATEGORY_UNSPECIFIED"] = "HARM_CATEGORY_UNSPECIFIED";
  HarmCategory2["HARM_CATEGORY_HARASSMENT"] = "HARM_CATEGORY_HARASSMENT";
  HarmCategory2["HARM_CATEGORY_HATE_SPEECH"] = "HARM_CATEGORY_HATE_SPEECH";
  HarmCategory2["HARM_CATEGORY_SEXUALLY_EXPLICIT"] = "HARM_CATEGORY_SEXUALLY_EXPLICIT";
  HarmCategory2["HARM_CATEGORY_DANGEROUS_CONTENT"] = "HARM_CATEGORY_DANGEROUS_CONTENT";
  HarmCategory2["HARM_CATEGORY_CIVIC_INTEGRITY"] = "HARM_CATEGORY_CIVIC_INTEGRITY";
  HarmCategory2["HARM_CATEGORY_IMAGE_HATE"] = "HARM_CATEGORY_IMAGE_HATE";
  HarmCategory2["HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT"] = "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT";
  HarmCategory2["HARM_CATEGORY_IMAGE_HARASSMENT"] = "HARM_CATEGORY_IMAGE_HARASSMENT";
  HarmCategory2["HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT"] = "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT";
  HarmCategory2["HARM_CATEGORY_JAILBREAK"] = "HARM_CATEGORY_JAILBREAK";
})(HarmCategory || (HarmCategory = {}));
var HarmBlockMethod;
(function(HarmBlockMethod2) {
  HarmBlockMethod2["HARM_BLOCK_METHOD_UNSPECIFIED"] = "HARM_BLOCK_METHOD_UNSPECIFIED";
  HarmBlockMethod2["SEVERITY"] = "SEVERITY";
  HarmBlockMethod2["PROBABILITY"] = "PROBABILITY";
})(HarmBlockMethod || (HarmBlockMethod = {}));
var HarmBlockThreshold;
(function(HarmBlockThreshold2) {
  HarmBlockThreshold2["HARM_BLOCK_THRESHOLD_UNSPECIFIED"] = "HARM_BLOCK_THRESHOLD_UNSPECIFIED";
  HarmBlockThreshold2["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
  HarmBlockThreshold2["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
  HarmBlockThreshold2["BLOCK_ONLY_HIGH"] = "BLOCK_ONLY_HIGH";
  HarmBlockThreshold2["BLOCK_NONE"] = "BLOCK_NONE";
  HarmBlockThreshold2["OFF"] = "OFF";
})(HarmBlockThreshold || (HarmBlockThreshold = {}));
var FinishReason;
(function(FinishReason2) {
  FinishReason2["FINISH_REASON_UNSPECIFIED"] = "FINISH_REASON_UNSPECIFIED";
  FinishReason2["STOP"] = "STOP";
  FinishReason2["MAX_TOKENS"] = "MAX_TOKENS";
  FinishReason2["SAFETY"] = "SAFETY";
  FinishReason2["RECITATION"] = "RECITATION";
  FinishReason2["LANGUAGE"] = "LANGUAGE";
  FinishReason2["OTHER"] = "OTHER";
  FinishReason2["BLOCKLIST"] = "BLOCKLIST";
  FinishReason2["PROHIBITED_CONTENT"] = "PROHIBITED_CONTENT";
  FinishReason2["SPII"] = "SPII";
  FinishReason2["MALFORMED_FUNCTION_CALL"] = "MALFORMED_FUNCTION_CALL";
  FinishReason2["IMAGE_SAFETY"] = "IMAGE_SAFETY";
  FinishReason2["UNEXPECTED_TOOL_CALL"] = "UNEXPECTED_TOOL_CALL";
  FinishReason2["IMAGE_PROHIBITED_CONTENT"] = "IMAGE_PROHIBITED_CONTENT";
  FinishReason2["NO_IMAGE"] = "NO_IMAGE";
  FinishReason2["IMAGE_RECITATION"] = "IMAGE_RECITATION";
  FinishReason2["IMAGE_OTHER"] = "IMAGE_OTHER";
})(FinishReason || (FinishReason = {}));
var HarmProbability;
(function(HarmProbability2) {
  HarmProbability2["HARM_PROBABILITY_UNSPECIFIED"] = "HARM_PROBABILITY_UNSPECIFIED";
  HarmProbability2["NEGLIGIBLE"] = "NEGLIGIBLE";
  HarmProbability2["LOW"] = "LOW";
  HarmProbability2["MEDIUM"] = "MEDIUM";
  HarmProbability2["HIGH"] = "HIGH";
})(HarmProbability || (HarmProbability = {}));
var HarmSeverity;
(function(HarmSeverity2) {
  HarmSeverity2["HARM_SEVERITY_UNSPECIFIED"] = "HARM_SEVERITY_UNSPECIFIED";
  HarmSeverity2["HARM_SEVERITY_NEGLIGIBLE"] = "HARM_SEVERITY_NEGLIGIBLE";
  HarmSeverity2["HARM_SEVERITY_LOW"] = "HARM_SEVERITY_LOW";
  HarmSeverity2["HARM_SEVERITY_MEDIUM"] = "HARM_SEVERITY_MEDIUM";
  HarmSeverity2["HARM_SEVERITY_HIGH"] = "HARM_SEVERITY_HIGH";
})(HarmSeverity || (HarmSeverity = {}));
var UrlRetrievalStatus;
(function(UrlRetrievalStatus2) {
  UrlRetrievalStatus2["URL_RETRIEVAL_STATUS_UNSPECIFIED"] = "URL_RETRIEVAL_STATUS_UNSPECIFIED";
  UrlRetrievalStatus2["URL_RETRIEVAL_STATUS_SUCCESS"] = "URL_RETRIEVAL_STATUS_SUCCESS";
  UrlRetrievalStatus2["URL_RETRIEVAL_STATUS_ERROR"] = "URL_RETRIEVAL_STATUS_ERROR";
  UrlRetrievalStatus2["URL_RETRIEVAL_STATUS_PAYWALL"] = "URL_RETRIEVAL_STATUS_PAYWALL";
  UrlRetrievalStatus2["URL_RETRIEVAL_STATUS_UNSAFE"] = "URL_RETRIEVAL_STATUS_UNSAFE";
})(UrlRetrievalStatus || (UrlRetrievalStatus = {}));
var BlockedReason;
(function(BlockedReason2) {
  BlockedReason2["BLOCKED_REASON_UNSPECIFIED"] = "BLOCKED_REASON_UNSPECIFIED";
  BlockedReason2["SAFETY"] = "SAFETY";
  BlockedReason2["OTHER"] = "OTHER";
  BlockedReason2["BLOCKLIST"] = "BLOCKLIST";
  BlockedReason2["PROHIBITED_CONTENT"] = "PROHIBITED_CONTENT";
  BlockedReason2["IMAGE_SAFETY"] = "IMAGE_SAFETY";
  BlockedReason2["MODEL_ARMOR"] = "MODEL_ARMOR";
  BlockedReason2["JAILBREAK"] = "JAILBREAK";
})(BlockedReason || (BlockedReason = {}));
var TrafficType;
(function(TrafficType2) {
  TrafficType2["TRAFFIC_TYPE_UNSPECIFIED"] = "TRAFFIC_TYPE_UNSPECIFIED";
  TrafficType2["ON_DEMAND"] = "ON_DEMAND";
  TrafficType2["PROVISIONED_THROUGHPUT"] = "PROVISIONED_THROUGHPUT";
})(TrafficType || (TrafficType = {}));
var Modality;
(function(Modality2) {
  Modality2["MODALITY_UNSPECIFIED"] = "MODALITY_UNSPECIFIED";
  Modality2["TEXT"] = "TEXT";
  Modality2["IMAGE"] = "IMAGE";
  Modality2["AUDIO"] = "AUDIO";
})(Modality || (Modality = {}));
var MediaResolution;
(function(MediaResolution2) {
  MediaResolution2["MEDIA_RESOLUTION_UNSPECIFIED"] = "MEDIA_RESOLUTION_UNSPECIFIED";
  MediaResolution2["MEDIA_RESOLUTION_LOW"] = "MEDIA_RESOLUTION_LOW";
  MediaResolution2["MEDIA_RESOLUTION_MEDIUM"] = "MEDIA_RESOLUTION_MEDIUM";
  MediaResolution2["MEDIA_RESOLUTION_HIGH"] = "MEDIA_RESOLUTION_HIGH";
})(MediaResolution || (MediaResolution = {}));
var TuningMode;
(function(TuningMode2) {
  TuningMode2["TUNING_MODE_UNSPECIFIED"] = "TUNING_MODE_UNSPECIFIED";
  TuningMode2["TUNING_MODE_FULL"] = "TUNING_MODE_FULL";
  TuningMode2["TUNING_MODE_PEFT_ADAPTER"] = "TUNING_MODE_PEFT_ADAPTER";
})(TuningMode || (TuningMode = {}));
var AdapterSize;
(function(AdapterSize2) {
  AdapterSize2["ADAPTER_SIZE_UNSPECIFIED"] = "ADAPTER_SIZE_UNSPECIFIED";
  AdapterSize2["ADAPTER_SIZE_ONE"] = "ADAPTER_SIZE_ONE";
  AdapterSize2["ADAPTER_SIZE_TWO"] = "ADAPTER_SIZE_TWO";
  AdapterSize2["ADAPTER_SIZE_FOUR"] = "ADAPTER_SIZE_FOUR";
  AdapterSize2["ADAPTER_SIZE_EIGHT"] = "ADAPTER_SIZE_EIGHT";
  AdapterSize2["ADAPTER_SIZE_SIXTEEN"] = "ADAPTER_SIZE_SIXTEEN";
  AdapterSize2["ADAPTER_SIZE_THIRTY_TWO"] = "ADAPTER_SIZE_THIRTY_TWO";
})(AdapterSize || (AdapterSize = {}));
var JobState;
(function(JobState2) {
  JobState2["JOB_STATE_UNSPECIFIED"] = "JOB_STATE_UNSPECIFIED";
  JobState2["JOB_STATE_QUEUED"] = "JOB_STATE_QUEUED";
  JobState2["JOB_STATE_PENDING"] = "JOB_STATE_PENDING";
  JobState2["JOB_STATE_RUNNING"] = "JOB_STATE_RUNNING";
  JobState2["JOB_STATE_SUCCEEDED"] = "JOB_STATE_SUCCEEDED";
  JobState2["JOB_STATE_FAILED"] = "JOB_STATE_FAILED";
  JobState2["JOB_STATE_CANCELLING"] = "JOB_STATE_CANCELLING";
  JobState2["JOB_STATE_CANCELLED"] = "JOB_STATE_CANCELLED";
  JobState2["JOB_STATE_PAUSED"] = "JOB_STATE_PAUSED";
  JobState2["JOB_STATE_EXPIRED"] = "JOB_STATE_EXPIRED";
  JobState2["JOB_STATE_UPDATING"] = "JOB_STATE_UPDATING";
  JobState2["JOB_STATE_PARTIALLY_SUCCEEDED"] = "JOB_STATE_PARTIALLY_SUCCEEDED";
})(JobState || (JobState = {}));
var TuningTask;
(function(TuningTask2) {
  TuningTask2["TUNING_TASK_UNSPECIFIED"] = "TUNING_TASK_UNSPECIFIED";
  TuningTask2["TUNING_TASK_I2V"] = "TUNING_TASK_I2V";
  TuningTask2["TUNING_TASK_T2V"] = "TUNING_TASK_T2V";
  TuningTask2["TUNING_TASK_R2V"] = "TUNING_TASK_R2V";
})(TuningTask || (TuningTask = {}));
var PartMediaResolutionLevel;
(function(PartMediaResolutionLevel2) {
  PartMediaResolutionLevel2["MEDIA_RESOLUTION_UNSPECIFIED"] = "MEDIA_RESOLUTION_UNSPECIFIED";
  PartMediaResolutionLevel2["MEDIA_RESOLUTION_LOW"] = "MEDIA_RESOLUTION_LOW";
  PartMediaResolutionLevel2["MEDIA_RESOLUTION_MEDIUM"] = "MEDIA_RESOLUTION_MEDIUM";
  PartMediaResolutionLevel2["MEDIA_RESOLUTION_HIGH"] = "MEDIA_RESOLUTION_HIGH";
  PartMediaResolutionLevel2["MEDIA_RESOLUTION_ULTRA_HIGH"] = "MEDIA_RESOLUTION_ULTRA_HIGH";
})(PartMediaResolutionLevel || (PartMediaResolutionLevel = {}));
var ResourceScope;
(function(ResourceScope2) {
  ResourceScope2["COLLECTION"] = "COLLECTION";
})(ResourceScope || (ResourceScope = {}));
var FeatureSelectionPreference;
(function(FeatureSelectionPreference2) {
  FeatureSelectionPreference2["FEATURE_SELECTION_PREFERENCE_UNSPECIFIED"] = "FEATURE_SELECTION_PREFERENCE_UNSPECIFIED";
  FeatureSelectionPreference2["PRIORITIZE_QUALITY"] = "PRIORITIZE_QUALITY";
  FeatureSelectionPreference2["BALANCED"] = "BALANCED";
  FeatureSelectionPreference2["PRIORITIZE_COST"] = "PRIORITIZE_COST";
})(FeatureSelectionPreference || (FeatureSelectionPreference = {}));
var Environment;
(function(Environment2) {
  Environment2["ENVIRONMENT_UNSPECIFIED"] = "ENVIRONMENT_UNSPECIFIED";
  Environment2["ENVIRONMENT_BROWSER"] = "ENVIRONMENT_BROWSER";
})(Environment || (Environment = {}));
var SafetyFilterLevel;
(function(SafetyFilterLevel2) {
  SafetyFilterLevel2["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
  SafetyFilterLevel2["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
  SafetyFilterLevel2["BLOCK_ONLY_HIGH"] = "BLOCK_ONLY_HIGH";
  SafetyFilterLevel2["BLOCK_NONE"] = "BLOCK_NONE";
})(SafetyFilterLevel || (SafetyFilterLevel = {}));
var PersonGeneration;
(function(PersonGeneration2) {
  PersonGeneration2["DONT_ALLOW"] = "DONT_ALLOW";
  PersonGeneration2["ALLOW_ADULT"] = "ALLOW_ADULT";
  PersonGeneration2["ALLOW_ALL"] = "ALLOW_ALL";
})(PersonGeneration || (PersonGeneration = {}));
var ImagePromptLanguage;
(function(ImagePromptLanguage2) {
  ImagePromptLanguage2["auto"] = "auto";
  ImagePromptLanguage2["en"] = "en";
  ImagePromptLanguage2["ja"] = "ja";
  ImagePromptLanguage2["ko"] = "ko";
  ImagePromptLanguage2["hi"] = "hi";
  ImagePromptLanguage2["zh"] = "zh";
  ImagePromptLanguage2["pt"] = "pt";
  ImagePromptLanguage2["es"] = "es";
})(ImagePromptLanguage || (ImagePromptLanguage = {}));
var MaskReferenceMode;
(function(MaskReferenceMode2) {
  MaskReferenceMode2["MASK_MODE_DEFAULT"] = "MASK_MODE_DEFAULT";
  MaskReferenceMode2["MASK_MODE_USER_PROVIDED"] = "MASK_MODE_USER_PROVIDED";
  MaskReferenceMode2["MASK_MODE_BACKGROUND"] = "MASK_MODE_BACKGROUND";
  MaskReferenceMode2["MASK_MODE_FOREGROUND"] = "MASK_MODE_FOREGROUND";
  MaskReferenceMode2["MASK_MODE_SEMANTIC"] = "MASK_MODE_SEMANTIC";
})(MaskReferenceMode || (MaskReferenceMode = {}));
var ControlReferenceType;
(function(ControlReferenceType2) {
  ControlReferenceType2["CONTROL_TYPE_DEFAULT"] = "CONTROL_TYPE_DEFAULT";
  ControlReferenceType2["CONTROL_TYPE_CANNY"] = "CONTROL_TYPE_CANNY";
  ControlReferenceType2["CONTROL_TYPE_SCRIBBLE"] = "CONTROL_TYPE_SCRIBBLE";
  ControlReferenceType2["CONTROL_TYPE_FACE_MESH"] = "CONTROL_TYPE_FACE_MESH";
})(ControlReferenceType || (ControlReferenceType = {}));
var SubjectReferenceType;
(function(SubjectReferenceType2) {
  SubjectReferenceType2["SUBJECT_TYPE_DEFAULT"] = "SUBJECT_TYPE_DEFAULT";
  SubjectReferenceType2["SUBJECT_TYPE_PERSON"] = "SUBJECT_TYPE_PERSON";
  SubjectReferenceType2["SUBJECT_TYPE_ANIMAL"] = "SUBJECT_TYPE_ANIMAL";
  SubjectReferenceType2["SUBJECT_TYPE_PRODUCT"] = "SUBJECT_TYPE_PRODUCT";
})(SubjectReferenceType || (SubjectReferenceType = {}));
var EditMode;
(function(EditMode2) {
  EditMode2["EDIT_MODE_DEFAULT"] = "EDIT_MODE_DEFAULT";
  EditMode2["EDIT_MODE_INPAINT_REMOVAL"] = "EDIT_MODE_INPAINT_REMOVAL";
  EditMode2["EDIT_MODE_INPAINT_INSERTION"] = "EDIT_MODE_INPAINT_INSERTION";
  EditMode2["EDIT_MODE_OUTPAINT"] = "EDIT_MODE_OUTPAINT";
  EditMode2["EDIT_MODE_CONTROLLED_EDITING"] = "EDIT_MODE_CONTROLLED_EDITING";
  EditMode2["EDIT_MODE_STYLE"] = "EDIT_MODE_STYLE";
  EditMode2["EDIT_MODE_BGSWAP"] = "EDIT_MODE_BGSWAP";
  EditMode2["EDIT_MODE_PRODUCT_IMAGE"] = "EDIT_MODE_PRODUCT_IMAGE";
})(EditMode || (EditMode = {}));
var SegmentMode;
(function(SegmentMode2) {
  SegmentMode2["FOREGROUND"] = "FOREGROUND";
  SegmentMode2["BACKGROUND"] = "BACKGROUND";
  SegmentMode2["PROMPT"] = "PROMPT";
  SegmentMode2["SEMANTIC"] = "SEMANTIC";
  SegmentMode2["INTERACTIVE"] = "INTERACTIVE";
})(SegmentMode || (SegmentMode = {}));
var VideoGenerationReferenceType;
(function(VideoGenerationReferenceType2) {
  VideoGenerationReferenceType2["ASSET"] = "ASSET";
  VideoGenerationReferenceType2["STYLE"] = "STYLE";
})(VideoGenerationReferenceType || (VideoGenerationReferenceType = {}));
var VideoGenerationMaskMode;
(function(VideoGenerationMaskMode2) {
  VideoGenerationMaskMode2["INSERT"] = "INSERT";
  VideoGenerationMaskMode2["REMOVE"] = "REMOVE";
  VideoGenerationMaskMode2["REMOVE_STATIC"] = "REMOVE_STATIC";
  VideoGenerationMaskMode2["OUTPAINT"] = "OUTPAINT";
})(VideoGenerationMaskMode || (VideoGenerationMaskMode = {}));
var VideoCompressionQuality;
(function(VideoCompressionQuality2) {
  VideoCompressionQuality2["OPTIMIZED"] = "OPTIMIZED";
  VideoCompressionQuality2["LOSSLESS"] = "LOSSLESS";
})(VideoCompressionQuality || (VideoCompressionQuality = {}));
var TuningMethod;
(function(TuningMethod2) {
  TuningMethod2["SUPERVISED_FINE_TUNING"] = "SUPERVISED_FINE_TUNING";
  TuningMethod2["PREFERENCE_TUNING"] = "PREFERENCE_TUNING";
  TuningMethod2["DISTILLATION"] = "DISTILLATION";
})(TuningMethod || (TuningMethod = {}));
var DocumentState;
(function(DocumentState2) {
  DocumentState2["STATE_UNSPECIFIED"] = "STATE_UNSPECIFIED";
  DocumentState2["STATE_PENDING"] = "STATE_PENDING";
  DocumentState2["STATE_ACTIVE"] = "STATE_ACTIVE";
  DocumentState2["STATE_FAILED"] = "STATE_FAILED";
})(DocumentState || (DocumentState = {}));
var FileState;
(function(FileState2) {
  FileState2["STATE_UNSPECIFIED"] = "STATE_UNSPECIFIED";
  FileState2["PROCESSING"] = "PROCESSING";
  FileState2["ACTIVE"] = "ACTIVE";
  FileState2["FAILED"] = "FAILED";
})(FileState || (FileState = {}));
var FileSource;
(function(FileSource2) {
  FileSource2["SOURCE_UNSPECIFIED"] = "SOURCE_UNSPECIFIED";
  FileSource2["UPLOADED"] = "UPLOADED";
  FileSource2["GENERATED"] = "GENERATED";
  FileSource2["REGISTERED"] = "REGISTERED";
})(FileSource || (FileSource = {}));
var TurnCompleteReason;
(function(TurnCompleteReason2) {
  TurnCompleteReason2["TURN_COMPLETE_REASON_UNSPECIFIED"] = "TURN_COMPLETE_REASON_UNSPECIFIED";
  TurnCompleteReason2["MALFORMED_FUNCTION_CALL"] = "MALFORMED_FUNCTION_CALL";
  TurnCompleteReason2["RESPONSE_REJECTED"] = "RESPONSE_REJECTED";
  TurnCompleteReason2["NEED_MORE_INPUT"] = "NEED_MORE_INPUT";
})(TurnCompleteReason || (TurnCompleteReason = {}));
var MediaModality;
(function(MediaModality2) {
  MediaModality2["MODALITY_UNSPECIFIED"] = "MODALITY_UNSPECIFIED";
  MediaModality2["TEXT"] = "TEXT";
  MediaModality2["IMAGE"] = "IMAGE";
  MediaModality2["VIDEO"] = "VIDEO";
  MediaModality2["AUDIO"] = "AUDIO";
  MediaModality2["DOCUMENT"] = "DOCUMENT";
})(MediaModality || (MediaModality = {}));
var VadSignalType;
(function(VadSignalType2) {
  VadSignalType2["VAD_SIGNAL_TYPE_UNSPECIFIED"] = "VAD_SIGNAL_TYPE_UNSPECIFIED";
  VadSignalType2["VAD_SIGNAL_TYPE_SOS"] = "VAD_SIGNAL_TYPE_SOS";
  VadSignalType2["VAD_SIGNAL_TYPE_EOS"] = "VAD_SIGNAL_TYPE_EOS";
})(VadSignalType || (VadSignalType = {}));
var VoiceActivityType;
(function(VoiceActivityType2) {
  VoiceActivityType2["TYPE_UNSPECIFIED"] = "TYPE_UNSPECIFIED";
  VoiceActivityType2["ACTIVITY_START"] = "ACTIVITY_START";
  VoiceActivityType2["ACTIVITY_END"] = "ACTIVITY_END";
})(VoiceActivityType || (VoiceActivityType = {}));
var StartSensitivity;
(function(StartSensitivity2) {
  StartSensitivity2["START_SENSITIVITY_UNSPECIFIED"] = "START_SENSITIVITY_UNSPECIFIED";
  StartSensitivity2["START_SENSITIVITY_HIGH"] = "START_SENSITIVITY_HIGH";
  StartSensitivity2["START_SENSITIVITY_LOW"] = "START_SENSITIVITY_LOW";
})(StartSensitivity || (StartSensitivity = {}));
var EndSensitivity;
(function(EndSensitivity2) {
  EndSensitivity2["END_SENSITIVITY_UNSPECIFIED"] = "END_SENSITIVITY_UNSPECIFIED";
  EndSensitivity2["END_SENSITIVITY_HIGH"] = "END_SENSITIVITY_HIGH";
  EndSensitivity2["END_SENSITIVITY_LOW"] = "END_SENSITIVITY_LOW";
})(EndSensitivity || (EndSensitivity = {}));
var ActivityHandling;
(function(ActivityHandling2) {
  ActivityHandling2["ACTIVITY_HANDLING_UNSPECIFIED"] = "ACTIVITY_HANDLING_UNSPECIFIED";
  ActivityHandling2["START_OF_ACTIVITY_INTERRUPTS"] = "START_OF_ACTIVITY_INTERRUPTS";
  ActivityHandling2["NO_INTERRUPTION"] = "NO_INTERRUPTION";
})(ActivityHandling || (ActivityHandling = {}));
var TurnCoverage;
(function(TurnCoverage2) {
  TurnCoverage2["TURN_COVERAGE_UNSPECIFIED"] = "TURN_COVERAGE_UNSPECIFIED";
  TurnCoverage2["TURN_INCLUDES_ONLY_ACTIVITY"] = "TURN_INCLUDES_ONLY_ACTIVITY";
  TurnCoverage2["TURN_INCLUDES_ALL_INPUT"] = "TURN_INCLUDES_ALL_INPUT";
})(TurnCoverage || (TurnCoverage = {}));
var Scale;
(function(Scale2) {
  Scale2["SCALE_UNSPECIFIED"] = "SCALE_UNSPECIFIED";
  Scale2["C_MAJOR_A_MINOR"] = "C_MAJOR_A_MINOR";
  Scale2["D_FLAT_MAJOR_B_FLAT_MINOR"] = "D_FLAT_MAJOR_B_FLAT_MINOR";
  Scale2["D_MAJOR_B_MINOR"] = "D_MAJOR_B_MINOR";
  Scale2["E_FLAT_MAJOR_C_MINOR"] = "E_FLAT_MAJOR_C_MINOR";
  Scale2["E_MAJOR_D_FLAT_MINOR"] = "E_MAJOR_D_FLAT_MINOR";
  Scale2["F_MAJOR_D_MINOR"] = "F_MAJOR_D_MINOR";
  Scale2["G_FLAT_MAJOR_E_FLAT_MINOR"] = "G_FLAT_MAJOR_E_FLAT_MINOR";
  Scale2["G_MAJOR_E_MINOR"] = "G_MAJOR_E_MINOR";
  Scale2["A_FLAT_MAJOR_F_MINOR"] = "A_FLAT_MAJOR_F_MINOR";
  Scale2["A_MAJOR_G_FLAT_MINOR"] = "A_MAJOR_G_FLAT_MINOR";
  Scale2["B_FLAT_MAJOR_G_MINOR"] = "B_FLAT_MAJOR_G_MINOR";
  Scale2["B_MAJOR_A_FLAT_MINOR"] = "B_MAJOR_A_FLAT_MINOR";
})(Scale || (Scale = {}));
var MusicGenerationMode;
(function(MusicGenerationMode2) {
  MusicGenerationMode2["MUSIC_GENERATION_MODE_UNSPECIFIED"] = "MUSIC_GENERATION_MODE_UNSPECIFIED";
  MusicGenerationMode2["QUALITY"] = "QUALITY";
  MusicGenerationMode2["DIVERSITY"] = "DIVERSITY";
  MusicGenerationMode2["VOCALIZATION"] = "VOCALIZATION";
})(MusicGenerationMode || (MusicGenerationMode = {}));
var LiveMusicPlaybackControl;
(function(LiveMusicPlaybackControl2) {
  LiveMusicPlaybackControl2["PLAYBACK_CONTROL_UNSPECIFIED"] = "PLAYBACK_CONTROL_UNSPECIFIED";
  LiveMusicPlaybackControl2["PLAY"] = "PLAY";
  LiveMusicPlaybackControl2["PAUSE"] = "PAUSE";
  LiveMusicPlaybackControl2["STOP"] = "STOP";
  LiveMusicPlaybackControl2["RESET_CONTEXT"] = "RESET_CONTEXT";
})(LiveMusicPlaybackControl || (LiveMusicPlaybackControl = {}));
var HttpResponse = class {
  static {
    __name(this, "HttpResponse");
  }
  constructor(response) {
    const headers = {};
    for (const pair of response.headers.entries()) {
      headers[pair[0]] = pair[1];
    }
    this.headers = headers;
    this.responseInternal = response;
  }
  json() {
    return this.responseInternal.json();
  }
};
var GenerateContentResponse = class {
  static {
    __name(this, "GenerateContentResponse");
  }
  /**
   * Returns the concatenation of all text parts from the first candidate in the response.
   *
   * @remarks
   * If there are multiple candidates in the response, the text from the first
   * one will be returned.
   * If there are non-text parts in the response, the concatenation of all text
   * parts will be returned, and a warning will be logged.
   * If there are thought parts in the response, the concatenation of all text
   * parts excluding the thought parts will be returned.
   *
   * @example
   * ```ts
   * const response = await ai.models.generateContent({
   *   model: 'gemini-2.0-flash',
   *   contents:
   *     'Why is the sky blue?',
   * });
   *
   * console.debug(response.text);
   * ```
   */
  get text() {
    var _a2, _b, _c, _d, _e, _f, _g, _h;
    if (((_d = (_c = (_b = (_a2 = this.candidates) === null || _a2 === void 0 ? void 0 : _a2[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) {
      return void 0;
    }
    if (this.candidates && this.candidates.length > 1) {
      console.warn("there are multiple candidates in the response, returning text from the first one.");
    }
    let text = "";
    let anyTextPartText = false;
    const nonTextParts = [];
    for (const part of (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) !== null && _h !== void 0 ? _h : []) {
      for (const [fieldName, fieldValue] of Object.entries(part)) {
        if (fieldName !== "text" && fieldName !== "thought" && fieldName !== "thoughtSignature" && (fieldValue !== null || fieldValue !== void 0)) {
          nonTextParts.push(fieldName);
        }
      }
      if (typeof part.text === "string") {
        if (typeof part.thought === "boolean" && part.thought) {
          continue;
        }
        anyTextPartText = true;
        text += part.text;
      }
    }
    if (nonTextParts.length > 0) {
      console.warn(`there are non-text parts ${nonTextParts} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`);
    }
    return anyTextPartText ? text : void 0;
  }
  /**
   * Returns the concatenation of all inline data parts from the first candidate
   * in the response.
   *
   * @remarks
   * If there are multiple candidates in the response, the inline data from the
   * first one will be returned. If there are non-inline data parts in the
   * response, the concatenation of all inline data parts will be returned, and
   * a warning will be logged.
   */
  get data() {
    var _a2, _b, _c, _d, _e, _f, _g, _h;
    if (((_d = (_c = (_b = (_a2 = this.candidates) === null || _a2 === void 0 ? void 0 : _a2[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) {
      return void 0;
    }
    if (this.candidates && this.candidates.length > 1) {
      console.warn("there are multiple candidates in the response, returning data from the first one.");
    }
    let data = "";
    const nonDataParts = [];
    for (const part of (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) !== null && _h !== void 0 ? _h : []) {
      for (const [fieldName, fieldValue] of Object.entries(part)) {
        if (fieldName !== "inlineData" && (fieldValue !== null || fieldValue !== void 0)) {
          nonDataParts.push(fieldName);
        }
      }
      if (part.inlineData && typeof part.inlineData.data === "string") {
        data += atob(part.inlineData.data);
      }
    }
    if (nonDataParts.length > 0) {
      console.warn(`there are non-data parts ${nonDataParts} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`);
    }
    return data.length > 0 ? btoa(data) : void 0;
  }
  /**
   * Returns the function calls from the first candidate in the response.
   *
   * @remarks
   * If there are multiple candidates in the response, the function calls from
   * the first one will be returned.
   * If there are no function calls in the response, undefined will be returned.
   *
   * @example
   * ```ts
   * const controlLightFunctionDeclaration: FunctionDeclaration = {
   *   name: 'controlLight',
   *   parameters: {
   *   type: Type.OBJECT,
   *   description: 'Set the brightness and color temperature of a room light.',
   *   properties: {
   *     brightness: {
   *       type: Type.NUMBER,
   *       description:
   *         'Light level from 0 to 100. Zero is off and 100 is full brightness.',
   *     },
   *     colorTemperature: {
   *       type: Type.STRING,
   *       description:
   *         'Color temperature of the light fixture which can be `daylight`, `cool` or `warm`.',
   *     },
   *   },
   *   required: ['brightness', 'colorTemperature'],
   *  };
   *  const response = await ai.models.generateContent({
   *     model: 'gemini-2.0-flash',
   *     contents: 'Dim the lights so the room feels cozy and warm.',
   *     config: {
   *       tools: [{functionDeclarations: [controlLightFunctionDeclaration]}],
   *       toolConfig: {
   *         functionCallingConfig: {
   *           mode: FunctionCallingConfigMode.ANY,
   *           allowedFunctionNames: ['controlLight'],
   *         },
   *       },
   *     },
   *   });
   *  console.debug(JSON.stringify(response.functionCalls));
   * ```
   */
  get functionCalls() {
    var _a2, _b, _c, _d, _e, _f, _g, _h;
    if (((_d = (_c = (_b = (_a2 = this.candidates) === null || _a2 === void 0 ? void 0 : _a2[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) {
      return void 0;
    }
    if (this.candidates && this.candidates.length > 1) {
      console.warn("there are multiple candidates in the response, returning function calls from the first one.");
    }
    const functionCalls = (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) === null || _h === void 0 ? void 0 : _h.filter((part) => part.functionCall).map((part) => part.functionCall).filter((functionCall) => functionCall !== void 0);
    if ((functionCalls === null || functionCalls === void 0 ? void 0 : functionCalls.length) === 0) {
      return void 0;
    }
    return functionCalls;
  }
  /**
   * Returns the first executable code from the first candidate in the response.
   *
   * @remarks
   * If there are multiple candidates in the response, the executable code from
   * the first one will be returned.
   * If there are no executable code in the response, undefined will be
   * returned.
   *
   * @example
   * ```ts
   * const response = await ai.models.generateContent({
   *   model: 'gemini-2.0-flash',
   *   contents:
   *     'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.'
   *   config: {
   *     tools: [{codeExecution: {}}],
   *   },
   * });
   *
   * console.debug(response.executableCode);
   * ```
   */
  get executableCode() {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _j;
    if (((_d = (_c = (_b = (_a2 = this.candidates) === null || _a2 === void 0 ? void 0 : _a2[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) {
      return void 0;
    }
    if (this.candidates && this.candidates.length > 1) {
      console.warn("there are multiple candidates in the response, returning executable code from the first one.");
    }
    const executableCode = (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) === null || _h === void 0 ? void 0 : _h.filter((part) => part.executableCode).map((part) => part.executableCode).filter((executableCode2) => executableCode2 !== void 0);
    if ((executableCode === null || executableCode === void 0 ? void 0 : executableCode.length) === 0) {
      return void 0;
    }
    return (_j = executableCode === null || executableCode === void 0 ? void 0 : executableCode[0]) === null || _j === void 0 ? void 0 : _j.code;
  }
  /**
   * Returns the first code execution result from the first candidate in the response.
   *
   * @remarks
   * If there are multiple candidates in the response, the code execution result from
   * the first one will be returned.
   * If there are no code execution result in the response, undefined will be returned.
   *
   * @example
   * ```ts
   * const response = await ai.models.generateContent({
   *   model: 'gemini-2.0-flash',
   *   contents:
   *     'What is the sum of the first 50 prime numbers? Generate and run code for the calculation, and make sure you get all 50.'
   *   config: {
   *     tools: [{codeExecution: {}}],
   *   },
   * });
   *
   * console.debug(response.codeExecutionResult);
   * ```
   */
  get codeExecutionResult() {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _j;
    if (((_d = (_c = (_b = (_a2 = this.candidates) === null || _a2 === void 0 ? void 0 : _a2[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d.length) === 0) {
      return void 0;
    }
    if (this.candidates && this.candidates.length > 1) {
      console.warn("there are multiple candidates in the response, returning code execution result from the first one.");
    }
    const codeExecutionResult = (_h = (_g = (_f = (_e = this.candidates) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.parts) === null || _h === void 0 ? void 0 : _h.filter((part) => part.codeExecutionResult).map((part) => part.codeExecutionResult).filter((codeExecutionResult2) => codeExecutionResult2 !== void 0);
    if ((codeExecutionResult === null || codeExecutionResult === void 0 ? void 0 : codeExecutionResult.length) === 0) {
      return void 0;
    }
    return (_j = codeExecutionResult === null || codeExecutionResult === void 0 ? void 0 : codeExecutionResult[0]) === null || _j === void 0 ? void 0 : _j.output;
  }
};
var EmbedContentResponse = class {
  static {
    __name(this, "EmbedContentResponse");
  }
};
var GenerateImagesResponse = class {
  static {
    __name(this, "GenerateImagesResponse");
  }
};
var EditImageResponse = class {
  static {
    __name(this, "EditImageResponse");
  }
};
var UpscaleImageResponse = class {
  static {
    __name(this, "UpscaleImageResponse");
  }
};
var RecontextImageResponse = class {
  static {
    __name(this, "RecontextImageResponse");
  }
};
var SegmentImageResponse = class {
  static {
    __name(this, "SegmentImageResponse");
  }
};
var ListModelsResponse = class {
  static {
    __name(this, "ListModelsResponse");
  }
};
var DeleteModelResponse = class {
  static {
    __name(this, "DeleteModelResponse");
  }
};
var CountTokensResponse = class {
  static {
    __name(this, "CountTokensResponse");
  }
};
var ComputeTokensResponse = class {
  static {
    __name(this, "ComputeTokensResponse");
  }
};
var GenerateVideosOperation = class _GenerateVideosOperation {
  static {
    __name(this, "GenerateVideosOperation");
  }
  /**
   * Instantiates an Operation of the same type as the one being called with the fields set from the API response.
   * @internal
   */
  _fromAPIResponse({ apiResponse, _isVertexAI }) {
    const operation = new _GenerateVideosOperation();
    let response;
    const op = apiResponse;
    if (_isVertexAI) {
      response = generateVideosOperationFromVertex$1(op);
    } else {
      response = generateVideosOperationFromMldev$1(op);
    }
    Object.assign(operation, response);
    return operation;
  }
};
var ListTuningJobsResponse = class {
  static {
    __name(this, "ListTuningJobsResponse");
  }
};
var CancelTuningJobResponse = class {
  static {
    __name(this, "CancelTuningJobResponse");
  }
};
var DeleteCachedContentResponse = class {
  static {
    __name(this, "DeleteCachedContentResponse");
  }
};
var ListCachedContentsResponse = class {
  static {
    __name(this, "ListCachedContentsResponse");
  }
};
var ListDocumentsResponse = class {
  static {
    __name(this, "ListDocumentsResponse");
  }
};
var ListFileSearchStoresResponse = class {
  static {
    __name(this, "ListFileSearchStoresResponse");
  }
};
var UploadToFileSearchStoreResumableResponse = class {
  static {
    __name(this, "UploadToFileSearchStoreResumableResponse");
  }
};
var ImportFileOperation = class _ImportFileOperation {
  static {
    __name(this, "ImportFileOperation");
  }
  /**
   * Instantiates an Operation of the same type as the one being called with the fields set from the API response.
   * @internal
   */
  _fromAPIResponse({ apiResponse, _isVertexAI }) {
    const operation = new _ImportFileOperation();
    const op = apiResponse;
    const response = importFileOperationFromMldev$1(op);
    Object.assign(operation, response);
    return operation;
  }
};
var ListFilesResponse = class {
  static {
    __name(this, "ListFilesResponse");
  }
};
var CreateFileResponse = class {
  static {
    __name(this, "CreateFileResponse");
  }
};
var DeleteFileResponse = class {
  static {
    __name(this, "DeleteFileResponse");
  }
};
var RegisterFilesResponse = class {
  static {
    __name(this, "RegisterFilesResponse");
  }
};
var ListBatchJobsResponse = class {
  static {
    __name(this, "ListBatchJobsResponse");
  }
};
var LiveServerMessage = class {
  static {
    __name(this, "LiveServerMessage");
  }
  /**
   * Returns the concatenation of all text parts from the server content if present.
   *
   * @remarks
   * If there are non-text parts in the response, the concatenation of all text
   * parts will be returned, and a warning will be logged.
   */
  get text() {
    var _a2, _b, _c;
    let text = "";
    let anyTextPartFound = false;
    const nonTextParts = [];
    for (const part of (_c = (_b = (_a2 = this.serverContent) === null || _a2 === void 0 ? void 0 : _a2.modelTurn) === null || _b === void 0 ? void 0 : _b.parts) !== null && _c !== void 0 ? _c : []) {
      for (const [fieldName, fieldValue] of Object.entries(part)) {
        if (fieldName !== "text" && fieldName !== "thought" && fieldValue !== null) {
          nonTextParts.push(fieldName);
        }
      }
      if (typeof part.text === "string") {
        if (typeof part.thought === "boolean" && part.thought) {
          continue;
        }
        anyTextPartFound = true;
        text += part.text;
      }
    }
    if (nonTextParts.length > 0) {
      console.warn(`there are non-text parts ${nonTextParts} in the response, returning concatenation of all text parts. Please refer to the non text parts for a full response from model.`);
    }
    return anyTextPartFound ? text : void 0;
  }
  /**
   * Returns the concatenation of all inline data parts from the server content if present.
   *
   * @remarks
   * If there are non-inline data parts in the
   * response, the concatenation of all inline data parts will be returned, and
   * a warning will be logged.
   */
  get data() {
    var _a2, _b, _c;
    let data = "";
    const nonDataParts = [];
    for (const part of (_c = (_b = (_a2 = this.serverContent) === null || _a2 === void 0 ? void 0 : _a2.modelTurn) === null || _b === void 0 ? void 0 : _b.parts) !== null && _c !== void 0 ? _c : []) {
      for (const [fieldName, fieldValue] of Object.entries(part)) {
        if (fieldName !== "inlineData" && fieldValue !== null) {
          nonDataParts.push(fieldName);
        }
      }
      if (part.inlineData && typeof part.inlineData.data === "string") {
        data += atob(part.inlineData.data);
      }
    }
    if (nonDataParts.length > 0) {
      console.warn(`there are non-data parts ${nonDataParts} in the response, returning concatenation of all data parts. Please refer to the non data parts for a full response from model.`);
    }
    return data.length > 0 ? btoa(data) : void 0;
  }
};
var LiveMusicServerMessage = class {
  static {
    __name(this, "LiveMusicServerMessage");
  }
  /**
   * Returns the first audio chunk from the server content, if present.
   *
   * @remarks
   * If there are no audio chunks in the response, undefined will be returned.
   */
  get audioChunk() {
    if (this.serverContent && this.serverContent.audioChunks && this.serverContent.audioChunks.length > 0) {
      return this.serverContent.audioChunks[0];
    }
    return void 0;
  }
};
var UploadToFileSearchStoreOperation = class _UploadToFileSearchStoreOperation {
  static {
    __name(this, "UploadToFileSearchStoreOperation");
  }
  /**
   * Instantiates an Operation of the same type as the one being called with the fields set from the API response.
   * @internal
   */
  _fromAPIResponse({ apiResponse, _isVertexAI }) {
    const operation = new _UploadToFileSearchStoreOperation();
    const op = apiResponse;
    const response = uploadToFileSearchStoreOperationFromMldev(op);
    Object.assign(operation, response);
    return operation;
  }
};
function tModel(apiClient, model) {
  if (!model || typeof model !== "string") {
    throw new Error("model is required and must be a string");
  }
  if (model.includes("..") || model.includes("?") || model.includes("&")) {
    throw new Error("invalid model parameter");
  }
  if (apiClient.isVertexAI()) {
    if (model.startsWith("publishers/") || model.startsWith("projects/") || model.startsWith("models/")) {
      return model;
    } else if (model.indexOf("/") >= 0) {
      const parts = model.split("/", 2);
      return `publishers/${parts[0]}/models/${parts[1]}`;
    } else {
      return `publishers/google/models/${model}`;
    }
  } else {
    if (model.startsWith("models/") || model.startsWith("tunedModels/")) {
      return model;
    } else {
      return `models/${model}`;
    }
  }
}
__name(tModel, "tModel");
function tCachesModel(apiClient, model) {
  const transformedModel = tModel(apiClient, model);
  if (!transformedModel) {
    return "";
  }
  if (transformedModel.startsWith("publishers/") && apiClient.isVertexAI()) {
    return `projects/${apiClient.getProject()}/locations/${apiClient.getLocation()}/${transformedModel}`;
  } else if (transformedModel.startsWith("models/") && apiClient.isVertexAI()) {
    return `projects/${apiClient.getProject()}/locations/${apiClient.getLocation()}/publishers/google/${transformedModel}`;
  } else {
    return transformedModel;
  }
}
__name(tCachesModel, "tCachesModel");
function tBlobs(blobs) {
  if (Array.isArray(blobs)) {
    return blobs.map((blob) => tBlob(blob));
  } else {
    return [tBlob(blobs)];
  }
}
__name(tBlobs, "tBlobs");
function tBlob(blob) {
  if (typeof blob === "object" && blob !== null) {
    return blob;
  }
  throw new Error(`Could not parse input as Blob. Unsupported blob type: ${typeof blob}`);
}
__name(tBlob, "tBlob");
function tImageBlob(blob) {
  const transformedBlob = tBlob(blob);
  if (transformedBlob.mimeType && transformedBlob.mimeType.startsWith("image/")) {
    return transformedBlob;
  }
  throw new Error(`Unsupported mime type: ${transformedBlob.mimeType}`);
}
__name(tImageBlob, "tImageBlob");
function tAudioBlob(blob) {
  const transformedBlob = tBlob(blob);
  if (transformedBlob.mimeType && transformedBlob.mimeType.startsWith("audio/")) {
    return transformedBlob;
  }
  throw new Error(`Unsupported mime type: ${transformedBlob.mimeType}`);
}
__name(tAudioBlob, "tAudioBlob");
function tPart(origin) {
  if (origin === null || origin === void 0) {
    throw new Error("PartUnion is required");
  }
  if (typeof origin === "object") {
    return origin;
  }
  if (typeof origin === "string") {
    return { text: origin };
  }
  throw new Error(`Unsupported part type: ${typeof origin}`);
}
__name(tPart, "tPart");
function tParts(origin) {
  if (origin === null || origin === void 0 || Array.isArray(origin) && origin.length === 0) {
    throw new Error("PartListUnion is required");
  }
  if (Array.isArray(origin)) {
    return origin.map((item) => tPart(item));
  }
  return [tPart(origin)];
}
__name(tParts, "tParts");
function _isContent(origin) {
  return origin !== null && origin !== void 0 && typeof origin === "object" && "parts" in origin && Array.isArray(origin.parts);
}
__name(_isContent, "_isContent");
function _isFunctionCallPart(origin) {
  return origin !== null && origin !== void 0 && typeof origin === "object" && "functionCall" in origin;
}
__name(_isFunctionCallPart, "_isFunctionCallPart");
function _isFunctionResponsePart(origin) {
  return origin !== null && origin !== void 0 && typeof origin === "object" && "functionResponse" in origin;
}
__name(_isFunctionResponsePart, "_isFunctionResponsePart");
function tContent(origin) {
  if (origin === null || origin === void 0) {
    throw new Error("ContentUnion is required");
  }
  if (_isContent(origin)) {
    return origin;
  }
  return {
    role: "user",
    parts: tParts(origin)
  };
}
__name(tContent, "tContent");
function tContentsForEmbed(apiClient, origin) {
  if (!origin) {
    return [];
  }
  if (apiClient.isVertexAI() && Array.isArray(origin)) {
    return origin.flatMap((item) => {
      const content = tContent(item);
      if (content.parts && content.parts.length > 0 && content.parts[0].text !== void 0) {
        return [content.parts[0].text];
      }
      return [];
    });
  } else if (apiClient.isVertexAI()) {
    const content = tContent(origin);
    if (content.parts && content.parts.length > 0 && content.parts[0].text !== void 0) {
      return [content.parts[0].text];
    }
    return [];
  }
  if (Array.isArray(origin)) {
    return origin.map((item) => tContent(item));
  }
  return [tContent(origin)];
}
__name(tContentsForEmbed, "tContentsForEmbed");
function tContents(origin) {
  if (origin === null || origin === void 0 || Array.isArray(origin) && origin.length === 0) {
    throw new Error("contents are required");
  }
  if (!Array.isArray(origin)) {
    if (_isFunctionCallPart(origin) || _isFunctionResponsePart(origin)) {
      throw new Error("To specify functionCall or functionResponse parts, please wrap them in a Content object, specifying the role for them");
    }
    return [tContent(origin)];
  }
  const result = [];
  const accumulatedParts = [];
  const isContentArray = _isContent(origin[0]);
  for (const item of origin) {
    const isContent = _isContent(item);
    if (isContent != isContentArray) {
      throw new Error("Mixing Content and Parts is not supported, please group the parts into a the appropriate Content objects and specify the roles for them");
    }
    if (isContent) {
      result.push(item);
    } else if (_isFunctionCallPart(item) || _isFunctionResponsePart(item)) {
      throw new Error("To specify functionCall or functionResponse parts, please wrap them, and any other parts, in Content objects as appropriate, specifying the role for them");
    } else {
      accumulatedParts.push(item);
    }
  }
  if (!isContentArray) {
    result.push({ role: "user", parts: tParts(accumulatedParts) });
  }
  return result;
}
__name(tContents, "tContents");
function flattenTypeArrayToAnyOf(typeList, resultingSchema) {
  if (typeList.includes("null")) {
    resultingSchema["nullable"] = true;
  }
  const listWithoutNull = typeList.filter((type) => type !== "null");
  if (listWithoutNull.length === 1) {
    resultingSchema["type"] = Object.values(Type).includes(listWithoutNull[0].toUpperCase()) ? listWithoutNull[0].toUpperCase() : Type.TYPE_UNSPECIFIED;
  } else {
    resultingSchema["anyOf"] = [];
    for (const i of listWithoutNull) {
      resultingSchema["anyOf"].push({
        "type": Object.values(Type).includes(i.toUpperCase()) ? i.toUpperCase() : Type.TYPE_UNSPECIFIED
      });
    }
  }
}
__name(flattenTypeArrayToAnyOf, "flattenTypeArrayToAnyOf");
function processJsonSchema(_jsonSchema) {
  const genAISchema = {};
  const schemaFieldNames = ["items"];
  const listSchemaFieldNames = ["anyOf"];
  const dictSchemaFieldNames = ["properties"];
  if (_jsonSchema["type"] && _jsonSchema["anyOf"]) {
    throw new Error("type and anyOf cannot be both populated.");
  }
  const incomingAnyOf = _jsonSchema["anyOf"];
  if (incomingAnyOf != null && incomingAnyOf.length == 2) {
    if (incomingAnyOf[0]["type"] === "null") {
      genAISchema["nullable"] = true;
      _jsonSchema = incomingAnyOf[1];
    } else if (incomingAnyOf[1]["type"] === "null") {
      genAISchema["nullable"] = true;
      _jsonSchema = incomingAnyOf[0];
    }
  }
  if (_jsonSchema["type"] instanceof Array) {
    flattenTypeArrayToAnyOf(_jsonSchema["type"], genAISchema);
  }
  for (const [fieldName, fieldValue] of Object.entries(_jsonSchema)) {
    if (fieldValue == null) {
      continue;
    }
    if (fieldName == "type") {
      if (fieldValue === "null") {
        throw new Error("type: null can not be the only possible type for the field.");
      }
      if (fieldValue instanceof Array) {
        continue;
      }
      genAISchema["type"] = Object.values(Type).includes(fieldValue.toUpperCase()) ? fieldValue.toUpperCase() : Type.TYPE_UNSPECIFIED;
    } else if (schemaFieldNames.includes(fieldName)) {
      genAISchema[fieldName] = processJsonSchema(fieldValue);
    } else if (listSchemaFieldNames.includes(fieldName)) {
      const listSchemaFieldValue = [];
      for (const item of fieldValue) {
        if (item["type"] == "null") {
          genAISchema["nullable"] = true;
          continue;
        }
        listSchemaFieldValue.push(processJsonSchema(item));
      }
      genAISchema[fieldName] = listSchemaFieldValue;
    } else if (dictSchemaFieldNames.includes(fieldName)) {
      const dictSchemaFieldValue = {};
      for (const [key, value] of Object.entries(fieldValue)) {
        dictSchemaFieldValue[key] = processJsonSchema(value);
      }
      genAISchema[fieldName] = dictSchemaFieldValue;
    } else {
      if (fieldName === "additionalProperties") {
        continue;
      }
      genAISchema[fieldName] = fieldValue;
    }
  }
  return genAISchema;
}
__name(processJsonSchema, "processJsonSchema");
function tSchema(schema) {
  return processJsonSchema(schema);
}
__name(tSchema, "tSchema");
function tSpeechConfig(speechConfig) {
  if (typeof speechConfig === "object") {
    return speechConfig;
  } else if (typeof speechConfig === "string") {
    return {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: speechConfig
        }
      }
    };
  } else {
    throw new Error(`Unsupported speechConfig type: ${typeof speechConfig}`);
  }
}
__name(tSpeechConfig, "tSpeechConfig");
function tLiveSpeechConfig(speechConfig) {
  if ("multiSpeakerVoiceConfig" in speechConfig) {
    throw new Error("multiSpeakerVoiceConfig is not supported in the live API.");
  }
  return speechConfig;
}
__name(tLiveSpeechConfig, "tLiveSpeechConfig");
function tTool(tool) {
  if (tool.functionDeclarations) {
    for (const functionDeclaration of tool.functionDeclarations) {
      if (functionDeclaration.parameters) {
        if (!Object.keys(functionDeclaration.parameters).includes("$schema")) {
          functionDeclaration.parameters = processJsonSchema(functionDeclaration.parameters);
        } else {
          if (!functionDeclaration.parametersJsonSchema) {
            functionDeclaration.parametersJsonSchema = functionDeclaration.parameters;
            delete functionDeclaration.parameters;
          }
        }
      }
      if (functionDeclaration.response) {
        if (!Object.keys(functionDeclaration.response).includes("$schema")) {
          functionDeclaration.response = processJsonSchema(functionDeclaration.response);
        } else {
          if (!functionDeclaration.responseJsonSchema) {
            functionDeclaration.responseJsonSchema = functionDeclaration.response;
            delete functionDeclaration.response;
          }
        }
      }
    }
  }
  return tool;
}
__name(tTool, "tTool");
function tTools(tools) {
  if (tools === void 0 || tools === null) {
    throw new Error("tools is required");
  }
  if (!Array.isArray(tools)) {
    throw new Error("tools is required and must be an array of Tools");
  }
  const result = [];
  for (const tool of tools) {
    result.push(tool);
  }
  return result;
}
__name(tTools, "tTools");
function resourceName(client, resourceName2, resourcePrefix, splitsAfterPrefix = 1) {
  const shouldAppendPrefix = !resourceName2.startsWith(`${resourcePrefix}/`) && resourceName2.split("/").length === splitsAfterPrefix;
  if (client.isVertexAI()) {
    if (resourceName2.startsWith("projects/")) {
      return resourceName2;
    } else if (resourceName2.startsWith("locations/")) {
      return `projects/${client.getProject()}/${resourceName2}`;
    } else if (resourceName2.startsWith(`${resourcePrefix}/`)) {
      return `projects/${client.getProject()}/locations/${client.getLocation()}/${resourceName2}`;
    } else if (shouldAppendPrefix) {
      return `projects/${client.getProject()}/locations/${client.getLocation()}/${resourcePrefix}/${resourceName2}`;
    } else {
      return resourceName2;
    }
  }
  if (shouldAppendPrefix) {
    return `${resourcePrefix}/${resourceName2}`;
  }
  return resourceName2;
}
__name(resourceName, "resourceName");
function tCachedContentName(apiClient, name) {
  if (typeof name !== "string") {
    throw new Error("name must be a string");
  }
  return resourceName(apiClient, name, "cachedContents");
}
__name(tCachedContentName, "tCachedContentName");
function tTuningJobStatus(status) {
  switch (status) {
    case "STATE_UNSPECIFIED":
      return "JOB_STATE_UNSPECIFIED";
    case "CREATING":
      return "JOB_STATE_RUNNING";
    case "ACTIVE":
      return "JOB_STATE_SUCCEEDED";
    case "FAILED":
      return "JOB_STATE_FAILED";
    default:
      return status;
  }
}
__name(tTuningJobStatus, "tTuningJobStatus");
function tBytes(fromImageBytes) {
  return tBytes$1(fromImageBytes);
}
__name(tBytes, "tBytes");
function _isFile(origin) {
  return origin !== null && origin !== void 0 && typeof origin === "object" && "name" in origin;
}
__name(_isFile, "_isFile");
function isGeneratedVideo(origin) {
  return origin !== null && origin !== void 0 && typeof origin === "object" && "video" in origin;
}
__name(isGeneratedVideo, "isGeneratedVideo");
function isVideo(origin) {
  return origin !== null && origin !== void 0 && typeof origin === "object" && "uri" in origin;
}
__name(isVideo, "isVideo");
function tFileName(fromName) {
  var _a2;
  let name;
  if (_isFile(fromName)) {
    name = fromName.name;
  }
  if (isVideo(fromName)) {
    name = fromName.uri;
    if (name === void 0) {
      return void 0;
    }
  }
  if (isGeneratedVideo(fromName)) {
    name = (_a2 = fromName.video) === null || _a2 === void 0 ? void 0 : _a2.uri;
    if (name === void 0) {
      return void 0;
    }
  }
  if (typeof fromName === "string") {
    name = fromName;
  }
  if (name === void 0) {
    throw new Error("Could not extract file name from the provided input.");
  }
  if (name.startsWith("https://")) {
    const suffix = name.split("files/")[1];
    const match = suffix.match(/[a-z0-9]+/);
    if (match === null) {
      throw new Error(`Could not extract file name from URI ${name}`);
    }
    name = match[0];
  } else if (name.startsWith("files/")) {
    name = name.split("files/")[1];
  }
  return name;
}
__name(tFileName, "tFileName");
function tModelsUrl(apiClient, baseModels) {
  let res;
  if (apiClient.isVertexAI()) {
    res = baseModels ? "publishers/google/models" : "models";
  } else {
    res = baseModels ? "models" : "tunedModels";
  }
  return res;
}
__name(tModelsUrl, "tModelsUrl");
function tExtractModels(response) {
  for (const key of ["models", "tunedModels", "publisherModels"]) {
    if (hasField(response, key)) {
      return response[key];
    }
  }
  return [];
}
__name(tExtractModels, "tExtractModels");
function hasField(data, fieldName) {
  return data !== null && typeof data === "object" && fieldName in data;
}
__name(hasField, "hasField");
function mcpToGeminiTool(mcpTool, config2 = {}) {
  const mcpToolSchema = mcpTool;
  const functionDeclaration = {
    name: mcpToolSchema["name"],
    description: mcpToolSchema["description"],
    parametersJsonSchema: mcpToolSchema["inputSchema"]
  };
  if (mcpToolSchema["outputSchema"]) {
    functionDeclaration["responseJsonSchema"] = mcpToolSchema["outputSchema"];
  }
  if (config2.behavior) {
    functionDeclaration["behavior"] = config2.behavior;
  }
  const geminiTool = {
    functionDeclarations: [
      functionDeclaration
    ]
  };
  return geminiTool;
}
__name(mcpToGeminiTool, "mcpToGeminiTool");
function mcpToolsToGeminiTool(mcpTools, config2 = {}) {
  const functionDeclarations = [];
  const toolNames = /* @__PURE__ */ new Set();
  for (const mcpTool of mcpTools) {
    const mcpToolName = mcpTool.name;
    if (toolNames.has(mcpToolName)) {
      throw new Error(`Duplicate function name ${mcpToolName} found in MCP tools. Please ensure function names are unique.`);
    }
    toolNames.add(mcpToolName);
    const geminiTool = mcpToGeminiTool(mcpTool, config2);
    if (geminiTool.functionDeclarations) {
      functionDeclarations.push(...geminiTool.functionDeclarations);
    }
  }
  return { functionDeclarations };
}
__name(mcpToolsToGeminiTool, "mcpToolsToGeminiTool");
function tBatchJobSource(client, src) {
  let sourceObj;
  if (typeof src === "string") {
    if (client.isVertexAI()) {
      if (src.startsWith("gs://")) {
        sourceObj = { format: "jsonl", gcsUri: [src] };
      } else if (src.startsWith("bq://")) {
        sourceObj = { format: "bigquery", bigqueryUri: src };
      } else {
        throw new Error(`Unsupported string source for Vertex AI: ${src}`);
      }
    } else {
      if (src.startsWith("files/")) {
        sourceObj = { fileName: src };
      } else {
        throw new Error(`Unsupported string source for Gemini API: ${src}`);
      }
    }
  } else if (Array.isArray(src)) {
    if (client.isVertexAI()) {
      throw new Error("InlinedRequest[] is not supported in Vertex AI.");
    }
    sourceObj = { inlinedRequests: src };
  } else {
    sourceObj = src;
  }
  const vertexSourcesCount = [sourceObj.gcsUri, sourceObj.bigqueryUri].filter(Boolean).length;
  const mldevSourcesCount = [
    sourceObj.inlinedRequests,
    sourceObj.fileName
  ].filter(Boolean).length;
  if (client.isVertexAI()) {
    if (mldevSourcesCount > 0 || vertexSourcesCount !== 1) {
      throw new Error("Exactly one of `gcsUri` or `bigqueryUri` must be set for Vertex AI.");
    }
  } else {
    if (vertexSourcesCount > 0 || mldevSourcesCount !== 1) {
      throw new Error("Exactly one of `inlinedRequests`, `fileName`, must be set for Gemini API.");
    }
  }
  return sourceObj;
}
__name(tBatchJobSource, "tBatchJobSource");
function tBatchJobDestination(dest) {
  if (typeof dest !== "string") {
    return dest;
  }
  const destString = dest;
  if (destString.startsWith("gs://")) {
    return {
      format: "jsonl",
      gcsUri: destString
    };
  } else if (destString.startsWith("bq://")) {
    return {
      format: "bigquery",
      bigqueryUri: destString
    };
  } else {
    throw new Error(`Unsupported destination: ${destString}`);
  }
}
__name(tBatchJobDestination, "tBatchJobDestination");
function tRecvBatchJobDestination(dest) {
  if (typeof dest !== "object" || dest === null) {
    return {};
  }
  const obj = dest;
  const inlineResponsesVal = obj["inlinedResponses"];
  if (typeof inlineResponsesVal !== "object" || inlineResponsesVal === null) {
    return dest;
  }
  const inlineResponsesObj = inlineResponsesVal;
  const responsesArray = inlineResponsesObj["inlinedResponses"];
  if (!Array.isArray(responsesArray) || responsesArray.length === 0) {
    return dest;
  }
  let hasEmbedding = false;
  for (const responseItem of responsesArray) {
    if (typeof responseItem !== "object" || responseItem === null) {
      continue;
    }
    const responseItemObj = responseItem;
    const responseVal = responseItemObj["response"];
    if (typeof responseVal !== "object" || responseVal === null) {
      continue;
    }
    const responseObj = responseVal;
    if (responseObj["embedding"] !== void 0) {
      hasEmbedding = true;
      break;
    }
  }
  if (hasEmbedding) {
    obj["inlinedEmbedContentResponses"] = obj["inlinedResponses"];
    delete obj["inlinedResponses"];
  }
  return dest;
}
__name(tRecvBatchJobDestination, "tRecvBatchJobDestination");
function tBatchJobName(apiClient, name) {
  const nameString = name;
  if (!apiClient.isVertexAI()) {
    const mldevPattern = /batches\/[^/]+$/;
    if (mldevPattern.test(nameString)) {
      return nameString.split("/").pop();
    } else {
      throw new Error(`Invalid batch job name: ${nameString}.`);
    }
  }
  const vertexPattern = /^projects\/[^/]+\/locations\/[^/]+\/batchPredictionJobs\/[^/]+$/;
  if (vertexPattern.test(nameString)) {
    return nameString.split("/").pop();
  } else if (/^\d+$/.test(nameString)) {
    return nameString;
  } else {
    throw new Error(`Invalid batch job name: ${nameString}.`);
  }
}
__name(tBatchJobName, "tBatchJobName");
function tJobState(state) {
  const stateString = state;
  if (stateString === "BATCH_STATE_UNSPECIFIED") {
    return "JOB_STATE_UNSPECIFIED";
  } else if (stateString === "BATCH_STATE_PENDING") {
    return "JOB_STATE_PENDING";
  } else if (stateString === "BATCH_STATE_RUNNING") {
    return "JOB_STATE_RUNNING";
  } else if (stateString === "BATCH_STATE_SUCCEEDED") {
    return "JOB_STATE_SUCCEEDED";
  } else if (stateString === "BATCH_STATE_FAILED") {
    return "JOB_STATE_FAILED";
  } else if (stateString === "BATCH_STATE_CANCELLED") {
    return "JOB_STATE_CANCELLED";
  } else if (stateString === "BATCH_STATE_EXPIRED") {
    return "JOB_STATE_EXPIRED";
  } else {
    return stateString;
  }
}
__name(tJobState, "tJobState");
function batchJobDestinationFromMldev(fromObject) {
  const toObject = {};
  const fromFileName = getValueByPath(fromObject, ["responsesFile"]);
  if (fromFileName != null) {
    setValueByPath(toObject, ["fileName"], fromFileName);
  }
  const fromInlinedResponses = getValueByPath(fromObject, [
    "inlinedResponses",
    "inlinedResponses"
  ]);
  if (fromInlinedResponses != null) {
    let transformedList = fromInlinedResponses;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return inlinedResponseFromMldev(item);
      });
    }
    setValueByPath(toObject, ["inlinedResponses"], transformedList);
  }
  const fromInlinedEmbedContentResponses = getValueByPath(fromObject, [
    "inlinedEmbedContentResponses",
    "inlinedResponses"
  ]);
  if (fromInlinedEmbedContentResponses != null) {
    let transformedList = fromInlinedEmbedContentResponses;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["inlinedEmbedContentResponses"], transformedList);
  }
  return toObject;
}
__name(batchJobDestinationFromMldev, "batchJobDestinationFromMldev");
function batchJobDestinationFromVertex(fromObject) {
  const toObject = {};
  const fromFormat = getValueByPath(fromObject, ["predictionsFormat"]);
  if (fromFormat != null) {
    setValueByPath(toObject, ["format"], fromFormat);
  }
  const fromGcsUri = getValueByPath(fromObject, [
    "gcsDestination",
    "outputUriPrefix"
  ]);
  if (fromGcsUri != null) {
    setValueByPath(toObject, ["gcsUri"], fromGcsUri);
  }
  const fromBigqueryUri = getValueByPath(fromObject, [
    "bigqueryDestination",
    "outputUri"
  ]);
  if (fromBigqueryUri != null) {
    setValueByPath(toObject, ["bigqueryUri"], fromBigqueryUri);
  }
  return toObject;
}
__name(batchJobDestinationFromVertex, "batchJobDestinationFromVertex");
function batchJobDestinationToVertex(fromObject) {
  const toObject = {};
  const fromFormat = getValueByPath(fromObject, ["format"]);
  if (fromFormat != null) {
    setValueByPath(toObject, ["predictionsFormat"], fromFormat);
  }
  const fromGcsUri = getValueByPath(fromObject, ["gcsUri"]);
  if (fromGcsUri != null) {
    setValueByPath(toObject, ["gcsDestination", "outputUriPrefix"], fromGcsUri);
  }
  const fromBigqueryUri = getValueByPath(fromObject, ["bigqueryUri"]);
  if (fromBigqueryUri != null) {
    setValueByPath(toObject, ["bigqueryDestination", "outputUri"], fromBigqueryUri);
  }
  if (getValueByPath(fromObject, ["fileName"]) !== void 0) {
    throw new Error("fileName parameter is not supported in Vertex AI.");
  }
  if (getValueByPath(fromObject, ["inlinedResponses"]) !== void 0) {
    throw new Error("inlinedResponses parameter is not supported in Vertex AI.");
  }
  if (getValueByPath(fromObject, ["inlinedEmbedContentResponses"]) !== void 0) {
    throw new Error("inlinedEmbedContentResponses parameter is not supported in Vertex AI.");
  }
  return toObject;
}
__name(batchJobDestinationToVertex, "batchJobDestinationToVertex");
function batchJobFromMldev(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromDisplayName = getValueByPath(fromObject, [
    "metadata",
    "displayName"
  ]);
  if (fromDisplayName != null) {
    setValueByPath(toObject, ["displayName"], fromDisplayName);
  }
  const fromState = getValueByPath(fromObject, ["metadata", "state"]);
  if (fromState != null) {
    setValueByPath(toObject, ["state"], tJobState(fromState));
  }
  const fromCreateTime = getValueByPath(fromObject, [
    "metadata",
    "createTime"
  ]);
  if (fromCreateTime != null) {
    setValueByPath(toObject, ["createTime"], fromCreateTime);
  }
  const fromEndTime = getValueByPath(fromObject, [
    "metadata",
    "endTime"
  ]);
  if (fromEndTime != null) {
    setValueByPath(toObject, ["endTime"], fromEndTime);
  }
  const fromUpdateTime = getValueByPath(fromObject, [
    "metadata",
    "updateTime"
  ]);
  if (fromUpdateTime != null) {
    setValueByPath(toObject, ["updateTime"], fromUpdateTime);
  }
  const fromModel = getValueByPath(fromObject, ["metadata", "model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["model"], fromModel);
  }
  const fromDest = getValueByPath(fromObject, ["metadata", "output"]);
  if (fromDest != null) {
    setValueByPath(toObject, ["dest"], batchJobDestinationFromMldev(tRecvBatchJobDestination(fromDest)));
  }
  return toObject;
}
__name(batchJobFromMldev, "batchJobFromMldev");
function batchJobFromVertex(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
  if (fromDisplayName != null) {
    setValueByPath(toObject, ["displayName"], fromDisplayName);
  }
  const fromState = getValueByPath(fromObject, ["state"]);
  if (fromState != null) {
    setValueByPath(toObject, ["state"], tJobState(fromState));
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
  if (fromCreateTime != null) {
    setValueByPath(toObject, ["createTime"], fromCreateTime);
  }
  const fromStartTime = getValueByPath(fromObject, ["startTime"]);
  if (fromStartTime != null) {
    setValueByPath(toObject, ["startTime"], fromStartTime);
  }
  const fromEndTime = getValueByPath(fromObject, ["endTime"]);
  if (fromEndTime != null) {
    setValueByPath(toObject, ["endTime"], fromEndTime);
  }
  const fromUpdateTime = getValueByPath(fromObject, ["updateTime"]);
  if (fromUpdateTime != null) {
    setValueByPath(toObject, ["updateTime"], fromUpdateTime);
  }
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["model"], fromModel);
  }
  const fromSrc = getValueByPath(fromObject, ["inputConfig"]);
  if (fromSrc != null) {
    setValueByPath(toObject, ["src"], batchJobSourceFromVertex(fromSrc));
  }
  const fromDest = getValueByPath(fromObject, ["outputConfig"]);
  if (fromDest != null) {
    setValueByPath(toObject, ["dest"], batchJobDestinationFromVertex(tRecvBatchJobDestination(fromDest)));
  }
  const fromCompletionStats = getValueByPath(fromObject, [
    "completionStats"
  ]);
  if (fromCompletionStats != null) {
    setValueByPath(toObject, ["completionStats"], fromCompletionStats);
  }
  return toObject;
}
__name(batchJobFromVertex, "batchJobFromVertex");
function batchJobSourceFromVertex(fromObject) {
  const toObject = {};
  const fromFormat = getValueByPath(fromObject, ["instancesFormat"]);
  if (fromFormat != null) {
    setValueByPath(toObject, ["format"], fromFormat);
  }
  const fromGcsUri = getValueByPath(fromObject, ["gcsSource", "uris"]);
  if (fromGcsUri != null) {
    setValueByPath(toObject, ["gcsUri"], fromGcsUri);
  }
  const fromBigqueryUri = getValueByPath(fromObject, [
    "bigquerySource",
    "inputUri"
  ]);
  if (fromBigqueryUri != null) {
    setValueByPath(toObject, ["bigqueryUri"], fromBigqueryUri);
  }
  return toObject;
}
__name(batchJobSourceFromVertex, "batchJobSourceFromVertex");
function batchJobSourceToMldev(apiClient, fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["format"]) !== void 0) {
    throw new Error("format parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["gcsUri"]) !== void 0) {
    throw new Error("gcsUri parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["bigqueryUri"]) !== void 0) {
    throw new Error("bigqueryUri parameter is not supported in Gemini API.");
  }
  const fromFileName = getValueByPath(fromObject, ["fileName"]);
  if (fromFileName != null) {
    setValueByPath(toObject, ["fileName"], fromFileName);
  }
  const fromInlinedRequests = getValueByPath(fromObject, [
    "inlinedRequests"
  ]);
  if (fromInlinedRequests != null) {
    let transformedList = fromInlinedRequests;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return inlinedRequestToMldev(apiClient, item);
      });
    }
    setValueByPath(toObject, ["requests", "requests"], transformedList);
  }
  return toObject;
}
__name(batchJobSourceToMldev, "batchJobSourceToMldev");
function batchJobSourceToVertex(fromObject) {
  const toObject = {};
  const fromFormat = getValueByPath(fromObject, ["format"]);
  if (fromFormat != null) {
    setValueByPath(toObject, ["instancesFormat"], fromFormat);
  }
  const fromGcsUri = getValueByPath(fromObject, ["gcsUri"]);
  if (fromGcsUri != null) {
    setValueByPath(toObject, ["gcsSource", "uris"], fromGcsUri);
  }
  const fromBigqueryUri = getValueByPath(fromObject, ["bigqueryUri"]);
  if (fromBigqueryUri != null) {
    setValueByPath(toObject, ["bigquerySource", "inputUri"], fromBigqueryUri);
  }
  if (getValueByPath(fromObject, ["fileName"]) !== void 0) {
    throw new Error("fileName parameter is not supported in Vertex AI.");
  }
  if (getValueByPath(fromObject, ["inlinedRequests"]) !== void 0) {
    throw new Error("inlinedRequests parameter is not supported in Vertex AI.");
  }
  return toObject;
}
__name(batchJobSourceToVertex, "batchJobSourceToVertex");
function blobToMldev$4(fromObject) {
  const toObject = {};
  const fromData = getValueByPath(fromObject, ["data"]);
  if (fromData != null) {
    setValueByPath(toObject, ["data"], fromData);
  }
  if (getValueByPath(fromObject, ["displayName"]) !== void 0) {
    throw new Error("displayName parameter is not supported in Gemini API.");
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(blobToMldev$4, "blobToMldev$4");
function cancelBatchJobParametersToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], tBatchJobName(apiClient, fromName));
  }
  return toObject;
}
__name(cancelBatchJobParametersToMldev, "cancelBatchJobParametersToMldev");
function cancelBatchJobParametersToVertex(apiClient, fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], tBatchJobName(apiClient, fromName));
  }
  return toObject;
}
__name(cancelBatchJobParametersToVertex, "cancelBatchJobParametersToVertex");
function candidateFromMldev$1(fromObject) {
  const toObject = {};
  const fromContent = getValueByPath(fromObject, ["content"]);
  if (fromContent != null) {
    setValueByPath(toObject, ["content"], fromContent);
  }
  const fromCitationMetadata = getValueByPath(fromObject, [
    "citationMetadata"
  ]);
  if (fromCitationMetadata != null) {
    setValueByPath(toObject, ["citationMetadata"], citationMetadataFromMldev$1(fromCitationMetadata));
  }
  const fromTokenCount = getValueByPath(fromObject, ["tokenCount"]);
  if (fromTokenCount != null) {
    setValueByPath(toObject, ["tokenCount"], fromTokenCount);
  }
  const fromFinishReason = getValueByPath(fromObject, ["finishReason"]);
  if (fromFinishReason != null) {
    setValueByPath(toObject, ["finishReason"], fromFinishReason);
  }
  const fromAvgLogprobs = getValueByPath(fromObject, ["avgLogprobs"]);
  if (fromAvgLogprobs != null) {
    setValueByPath(toObject, ["avgLogprobs"], fromAvgLogprobs);
  }
  const fromGroundingMetadata = getValueByPath(fromObject, [
    "groundingMetadata"
  ]);
  if (fromGroundingMetadata != null) {
    setValueByPath(toObject, ["groundingMetadata"], fromGroundingMetadata);
  }
  const fromIndex = getValueByPath(fromObject, ["index"]);
  if (fromIndex != null) {
    setValueByPath(toObject, ["index"], fromIndex);
  }
  const fromLogprobsResult = getValueByPath(fromObject, [
    "logprobsResult"
  ]);
  if (fromLogprobsResult != null) {
    setValueByPath(toObject, ["logprobsResult"], fromLogprobsResult);
  }
  const fromSafetyRatings = getValueByPath(fromObject, [
    "safetyRatings"
  ]);
  if (fromSafetyRatings != null) {
    let transformedList = fromSafetyRatings;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["safetyRatings"], transformedList);
  }
  const fromUrlContextMetadata = getValueByPath(fromObject, [
    "urlContextMetadata"
  ]);
  if (fromUrlContextMetadata != null) {
    setValueByPath(toObject, ["urlContextMetadata"], fromUrlContextMetadata);
  }
  return toObject;
}
__name(candidateFromMldev$1, "candidateFromMldev$1");
function citationMetadataFromMldev$1(fromObject) {
  const toObject = {};
  const fromCitations = getValueByPath(fromObject, ["citationSources"]);
  if (fromCitations != null) {
    let transformedList = fromCitations;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["citations"], transformedList);
  }
  return toObject;
}
__name(citationMetadataFromMldev$1, "citationMetadataFromMldev$1");
function contentToMldev$4(fromObject) {
  const toObject = {};
  const fromParts = getValueByPath(fromObject, ["parts"]);
  if (fromParts != null) {
    let transformedList = fromParts;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return partToMldev$4(item);
      });
    }
    setValueByPath(toObject, ["parts"], transformedList);
  }
  const fromRole = getValueByPath(fromObject, ["role"]);
  if (fromRole != null) {
    setValueByPath(toObject, ["role"], fromRole);
  }
  return toObject;
}
__name(contentToMldev$4, "contentToMldev$4");
function createBatchJobConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
  if (parentObject !== void 0 && fromDisplayName != null) {
    setValueByPath(parentObject, ["batch", "displayName"], fromDisplayName);
  }
  if (getValueByPath(fromObject, ["dest"]) !== void 0) {
    throw new Error("dest parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(createBatchJobConfigToMldev, "createBatchJobConfigToMldev");
function createBatchJobConfigToVertex(fromObject, parentObject) {
  const toObject = {};
  const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
  if (parentObject !== void 0 && fromDisplayName != null) {
    setValueByPath(parentObject, ["displayName"], fromDisplayName);
  }
  const fromDest = getValueByPath(fromObject, ["dest"]);
  if (parentObject !== void 0 && fromDest != null) {
    setValueByPath(parentObject, ["outputConfig"], batchJobDestinationToVertex(tBatchJobDestination(fromDest)));
  }
  return toObject;
}
__name(createBatchJobConfigToVertex, "createBatchJobConfigToVertex");
function createBatchJobParametersToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromSrc = getValueByPath(fromObject, ["src"]);
  if (fromSrc != null) {
    setValueByPath(toObject, ["batch", "inputConfig"], batchJobSourceToMldev(apiClient, tBatchJobSource(apiClient, fromSrc)));
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    createBatchJobConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(createBatchJobParametersToMldev, "createBatchJobParametersToMldev");
function createBatchJobParametersToVertex(apiClient, fromObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["model"], tModel(apiClient, fromModel));
  }
  const fromSrc = getValueByPath(fromObject, ["src"]);
  if (fromSrc != null) {
    setValueByPath(toObject, ["inputConfig"], batchJobSourceToVertex(tBatchJobSource(apiClient, fromSrc)));
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    createBatchJobConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(createBatchJobParametersToVertex, "createBatchJobParametersToVertex");
function createEmbeddingsBatchJobConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
  if (parentObject !== void 0 && fromDisplayName != null) {
    setValueByPath(parentObject, ["batch", "displayName"], fromDisplayName);
  }
  return toObject;
}
__name(createEmbeddingsBatchJobConfigToMldev, "createEmbeddingsBatchJobConfigToMldev");
function createEmbeddingsBatchJobParametersToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromSrc = getValueByPath(fromObject, ["src"]);
  if (fromSrc != null) {
    setValueByPath(toObject, ["batch", "inputConfig"], embeddingsBatchJobSourceToMldev(apiClient, fromSrc));
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    createEmbeddingsBatchJobConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(createEmbeddingsBatchJobParametersToMldev, "createEmbeddingsBatchJobParametersToMldev");
function deleteBatchJobParametersToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], tBatchJobName(apiClient, fromName));
  }
  return toObject;
}
__name(deleteBatchJobParametersToMldev, "deleteBatchJobParametersToMldev");
function deleteBatchJobParametersToVertex(apiClient, fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], tBatchJobName(apiClient, fromName));
  }
  return toObject;
}
__name(deleteBatchJobParametersToVertex, "deleteBatchJobParametersToVertex");
function deleteResourceJobFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromDone = getValueByPath(fromObject, ["done"]);
  if (fromDone != null) {
    setValueByPath(toObject, ["done"], fromDone);
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  return toObject;
}
__name(deleteResourceJobFromMldev, "deleteResourceJobFromMldev");
function deleteResourceJobFromVertex(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromDone = getValueByPath(fromObject, ["done"]);
  if (fromDone != null) {
    setValueByPath(toObject, ["done"], fromDone);
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  return toObject;
}
__name(deleteResourceJobFromVertex, "deleteResourceJobFromVertex");
function embedContentBatchToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromContents = getValueByPath(fromObject, ["contents"]);
  if (fromContents != null) {
    let transformedList = tContentsForEmbed(apiClient, fromContents);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["requests[]", "request", "content"], transformedList);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    setValueByPath(toObject, ["_self"], embedContentConfigToMldev$1(fromConfig, toObject));
    moveValueByPath(toObject, { "requests[].*": "requests[].request.*" });
  }
  return toObject;
}
__name(embedContentBatchToMldev, "embedContentBatchToMldev");
function embedContentConfigToMldev$1(fromObject, parentObject) {
  const toObject = {};
  const fromTaskType = getValueByPath(fromObject, ["taskType"]);
  if (parentObject !== void 0 && fromTaskType != null) {
    setValueByPath(parentObject, ["requests[]", "taskType"], fromTaskType);
  }
  const fromTitle = getValueByPath(fromObject, ["title"]);
  if (parentObject !== void 0 && fromTitle != null) {
    setValueByPath(parentObject, ["requests[]", "title"], fromTitle);
  }
  const fromOutputDimensionality = getValueByPath(fromObject, [
    "outputDimensionality"
  ]);
  if (parentObject !== void 0 && fromOutputDimensionality != null) {
    setValueByPath(parentObject, ["requests[]", "outputDimensionality"], fromOutputDimensionality);
  }
  if (getValueByPath(fromObject, ["mimeType"]) !== void 0) {
    throw new Error("mimeType parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["autoTruncate"]) !== void 0) {
    throw new Error("autoTruncate parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(embedContentConfigToMldev$1, "embedContentConfigToMldev$1");
function embeddingsBatchJobSourceToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromFileName = getValueByPath(fromObject, ["fileName"]);
  if (fromFileName != null) {
    setValueByPath(toObject, ["file_name"], fromFileName);
  }
  const fromInlinedRequests = getValueByPath(fromObject, [
    "inlinedRequests"
  ]);
  if (fromInlinedRequests != null) {
    setValueByPath(toObject, ["requests"], embedContentBatchToMldev(apiClient, fromInlinedRequests));
  }
  return toObject;
}
__name(embeddingsBatchJobSourceToMldev, "embeddingsBatchJobSourceToMldev");
function fileDataToMldev$4(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["displayName"]) !== void 0) {
    throw new Error("displayName parameter is not supported in Gemini API.");
  }
  const fromFileUri = getValueByPath(fromObject, ["fileUri"]);
  if (fromFileUri != null) {
    setValueByPath(toObject, ["fileUri"], fromFileUri);
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(fileDataToMldev$4, "fileDataToMldev$4");
function functionCallToMldev$4(fromObject) {
  const toObject = {};
  const fromId = getValueByPath(fromObject, ["id"]);
  if (fromId != null) {
    setValueByPath(toObject, ["id"], fromId);
  }
  const fromArgs = getValueByPath(fromObject, ["args"]);
  if (fromArgs != null) {
    setValueByPath(toObject, ["args"], fromArgs);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  if (getValueByPath(fromObject, ["partialArgs"]) !== void 0) {
    throw new Error("partialArgs parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["willContinue"]) !== void 0) {
    throw new Error("willContinue parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(functionCallToMldev$4, "functionCallToMldev$4");
function functionCallingConfigToMldev$2(fromObject) {
  const toObject = {};
  const fromAllowedFunctionNames = getValueByPath(fromObject, [
    "allowedFunctionNames"
  ]);
  if (fromAllowedFunctionNames != null) {
    setValueByPath(toObject, ["allowedFunctionNames"], fromAllowedFunctionNames);
  }
  const fromMode = getValueByPath(fromObject, ["mode"]);
  if (fromMode != null) {
    setValueByPath(toObject, ["mode"], fromMode);
  }
  if (getValueByPath(fromObject, ["streamFunctionCallArguments"]) !== void 0) {
    throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(functionCallingConfigToMldev$2, "functionCallingConfigToMldev$2");
function generateContentConfigToMldev$1(apiClient, fromObject, parentObject) {
  const toObject = {};
  const fromSystemInstruction = getValueByPath(fromObject, [
    "systemInstruction"
  ]);
  if (parentObject !== void 0 && fromSystemInstruction != null) {
    setValueByPath(parentObject, ["systemInstruction"], contentToMldev$4(tContent(fromSystemInstruction)));
  }
  const fromTemperature = getValueByPath(fromObject, ["temperature"]);
  if (fromTemperature != null) {
    setValueByPath(toObject, ["temperature"], fromTemperature);
  }
  const fromTopP = getValueByPath(fromObject, ["topP"]);
  if (fromTopP != null) {
    setValueByPath(toObject, ["topP"], fromTopP);
  }
  const fromTopK = getValueByPath(fromObject, ["topK"]);
  if (fromTopK != null) {
    setValueByPath(toObject, ["topK"], fromTopK);
  }
  const fromCandidateCount = getValueByPath(fromObject, [
    "candidateCount"
  ]);
  if (fromCandidateCount != null) {
    setValueByPath(toObject, ["candidateCount"], fromCandidateCount);
  }
  const fromMaxOutputTokens = getValueByPath(fromObject, [
    "maxOutputTokens"
  ]);
  if (fromMaxOutputTokens != null) {
    setValueByPath(toObject, ["maxOutputTokens"], fromMaxOutputTokens);
  }
  const fromStopSequences = getValueByPath(fromObject, [
    "stopSequences"
  ]);
  if (fromStopSequences != null) {
    setValueByPath(toObject, ["stopSequences"], fromStopSequences);
  }
  const fromResponseLogprobs = getValueByPath(fromObject, [
    "responseLogprobs"
  ]);
  if (fromResponseLogprobs != null) {
    setValueByPath(toObject, ["responseLogprobs"], fromResponseLogprobs);
  }
  const fromLogprobs = getValueByPath(fromObject, ["logprobs"]);
  if (fromLogprobs != null) {
    setValueByPath(toObject, ["logprobs"], fromLogprobs);
  }
  const fromPresencePenalty = getValueByPath(fromObject, [
    "presencePenalty"
  ]);
  if (fromPresencePenalty != null) {
    setValueByPath(toObject, ["presencePenalty"], fromPresencePenalty);
  }
  const fromFrequencyPenalty = getValueByPath(fromObject, [
    "frequencyPenalty"
  ]);
  if (fromFrequencyPenalty != null) {
    setValueByPath(toObject, ["frequencyPenalty"], fromFrequencyPenalty);
  }
  const fromSeed = getValueByPath(fromObject, ["seed"]);
  if (fromSeed != null) {
    setValueByPath(toObject, ["seed"], fromSeed);
  }
  const fromResponseMimeType = getValueByPath(fromObject, [
    "responseMimeType"
  ]);
  if (fromResponseMimeType != null) {
    setValueByPath(toObject, ["responseMimeType"], fromResponseMimeType);
  }
  const fromResponseSchema = getValueByPath(fromObject, [
    "responseSchema"
  ]);
  if (fromResponseSchema != null) {
    setValueByPath(toObject, ["responseSchema"], tSchema(fromResponseSchema));
  }
  const fromResponseJsonSchema = getValueByPath(fromObject, [
    "responseJsonSchema"
  ]);
  if (fromResponseJsonSchema != null) {
    setValueByPath(toObject, ["responseJsonSchema"], fromResponseJsonSchema);
  }
  if (getValueByPath(fromObject, ["routingConfig"]) !== void 0) {
    throw new Error("routingConfig parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["modelSelectionConfig"]) !== void 0) {
    throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  }
  const fromSafetySettings = getValueByPath(fromObject, [
    "safetySettings"
  ]);
  if (parentObject !== void 0 && fromSafetySettings != null) {
    let transformedList = fromSafetySettings;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return safetySettingToMldev$1(item);
      });
    }
    setValueByPath(parentObject, ["safetySettings"], transformedList);
  }
  const fromTools = getValueByPath(fromObject, ["tools"]);
  if (parentObject !== void 0 && fromTools != null) {
    let transformedList = tTools(fromTools);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return toolToMldev$4(tTool(item));
      });
    }
    setValueByPath(parentObject, ["tools"], transformedList);
  }
  const fromToolConfig = getValueByPath(fromObject, ["toolConfig"]);
  if (parentObject !== void 0 && fromToolConfig != null) {
    setValueByPath(parentObject, ["toolConfig"], toolConfigToMldev$2(fromToolConfig));
  }
  if (getValueByPath(fromObject, ["labels"]) !== void 0) {
    throw new Error("labels parameter is not supported in Gemini API.");
  }
  const fromCachedContent = getValueByPath(fromObject, [
    "cachedContent"
  ]);
  if (parentObject !== void 0 && fromCachedContent != null) {
    setValueByPath(parentObject, ["cachedContent"], tCachedContentName(apiClient, fromCachedContent));
  }
  const fromResponseModalities = getValueByPath(fromObject, [
    "responseModalities"
  ]);
  if (fromResponseModalities != null) {
    setValueByPath(toObject, ["responseModalities"], fromResponseModalities);
  }
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (fromMediaResolution != null) {
    setValueByPath(toObject, ["mediaResolution"], fromMediaResolution);
  }
  const fromSpeechConfig = getValueByPath(fromObject, ["speechConfig"]);
  if (fromSpeechConfig != null) {
    setValueByPath(toObject, ["speechConfig"], tSpeechConfig(fromSpeechConfig));
  }
  if (getValueByPath(fromObject, ["audioTimestamp"]) !== void 0) {
    throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  }
  const fromThinkingConfig = getValueByPath(fromObject, [
    "thinkingConfig"
  ]);
  if (fromThinkingConfig != null) {
    setValueByPath(toObject, ["thinkingConfig"], fromThinkingConfig);
  }
  const fromImageConfig = getValueByPath(fromObject, ["imageConfig"]);
  if (fromImageConfig != null) {
    setValueByPath(toObject, ["imageConfig"], imageConfigToMldev$1(fromImageConfig));
  }
  const fromEnableEnhancedCivicAnswers = getValueByPath(fromObject, [
    "enableEnhancedCivicAnswers"
  ]);
  if (fromEnableEnhancedCivicAnswers != null) {
    setValueByPath(toObject, ["enableEnhancedCivicAnswers"], fromEnableEnhancedCivicAnswers);
  }
  if (getValueByPath(fromObject, ["modelArmorConfig"]) !== void 0) {
    throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(generateContentConfigToMldev$1, "generateContentConfigToMldev$1");
function generateContentResponseFromMldev$1(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromCandidates = getValueByPath(fromObject, ["candidates"]);
  if (fromCandidates != null) {
    let transformedList = fromCandidates;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return candidateFromMldev$1(item);
      });
    }
    setValueByPath(toObject, ["candidates"], transformedList);
  }
  const fromModelVersion = getValueByPath(fromObject, ["modelVersion"]);
  if (fromModelVersion != null) {
    setValueByPath(toObject, ["modelVersion"], fromModelVersion);
  }
  const fromPromptFeedback = getValueByPath(fromObject, [
    "promptFeedback"
  ]);
  if (fromPromptFeedback != null) {
    setValueByPath(toObject, ["promptFeedback"], fromPromptFeedback);
  }
  const fromResponseId = getValueByPath(fromObject, ["responseId"]);
  if (fromResponseId != null) {
    setValueByPath(toObject, ["responseId"], fromResponseId);
  }
  const fromUsageMetadata = getValueByPath(fromObject, [
    "usageMetadata"
  ]);
  if (fromUsageMetadata != null) {
    setValueByPath(toObject, ["usageMetadata"], fromUsageMetadata);
  }
  return toObject;
}
__name(generateContentResponseFromMldev$1, "generateContentResponseFromMldev$1");
function getBatchJobParametersToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], tBatchJobName(apiClient, fromName));
  }
  return toObject;
}
__name(getBatchJobParametersToMldev, "getBatchJobParametersToMldev");
function getBatchJobParametersToVertex(apiClient, fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], tBatchJobName(apiClient, fromName));
  }
  return toObject;
}
__name(getBatchJobParametersToVertex, "getBatchJobParametersToVertex");
function googleMapsToMldev$4(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["authConfig"]) !== void 0) {
    throw new Error("authConfig parameter is not supported in Gemini API.");
  }
  const fromEnableWidget = getValueByPath(fromObject, ["enableWidget"]);
  if (fromEnableWidget != null) {
    setValueByPath(toObject, ["enableWidget"], fromEnableWidget);
  }
  return toObject;
}
__name(googleMapsToMldev$4, "googleMapsToMldev$4");
function googleSearchToMldev$4(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["excludeDomains"]) !== void 0) {
    throw new Error("excludeDomains parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["blockingConfidence"]) !== void 0) {
    throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  }
  const fromTimeRangeFilter = getValueByPath(fromObject, [
    "timeRangeFilter"
  ]);
  if (fromTimeRangeFilter != null) {
    setValueByPath(toObject, ["timeRangeFilter"], fromTimeRangeFilter);
  }
  return toObject;
}
__name(googleSearchToMldev$4, "googleSearchToMldev$4");
function imageConfigToMldev$1(fromObject) {
  const toObject = {};
  const fromAspectRatio = getValueByPath(fromObject, ["aspectRatio"]);
  if (fromAspectRatio != null) {
    setValueByPath(toObject, ["aspectRatio"], fromAspectRatio);
  }
  const fromImageSize = getValueByPath(fromObject, ["imageSize"]);
  if (fromImageSize != null) {
    setValueByPath(toObject, ["imageSize"], fromImageSize);
  }
  if (getValueByPath(fromObject, ["personGeneration"]) !== void 0) {
    throw new Error("personGeneration parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["outputMimeType"]) !== void 0) {
    throw new Error("outputMimeType parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["outputCompressionQuality"]) !== void 0) {
    throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(imageConfigToMldev$1, "imageConfigToMldev$1");
function inlinedRequestToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["request", "model"], tModel(apiClient, fromModel));
  }
  const fromContents = getValueByPath(fromObject, ["contents"]);
  if (fromContents != null) {
    let transformedList = tContents(fromContents);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return contentToMldev$4(item);
      });
    }
    setValueByPath(toObject, ["request", "contents"], transformedList);
  }
  const fromMetadata = getValueByPath(fromObject, ["metadata"]);
  if (fromMetadata != null) {
    setValueByPath(toObject, ["metadata"], fromMetadata);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    setValueByPath(toObject, ["request", "generationConfig"], generateContentConfigToMldev$1(apiClient, fromConfig, getValueByPath(toObject, ["request"], {})));
  }
  return toObject;
}
__name(inlinedRequestToMldev, "inlinedRequestToMldev");
function inlinedResponseFromMldev(fromObject) {
  const toObject = {};
  const fromResponse = getValueByPath(fromObject, ["response"]);
  if (fromResponse != null) {
    setValueByPath(toObject, ["response"], generateContentResponseFromMldev$1(fromResponse));
  }
  const fromMetadata = getValueByPath(fromObject, ["metadata"]);
  if (fromMetadata != null) {
    setValueByPath(toObject, ["metadata"], fromMetadata);
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  return toObject;
}
__name(inlinedResponseFromMldev, "inlinedResponseFromMldev");
function listBatchJobsConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
  if (parentObject !== void 0 && fromPageSize != null) {
    setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
  }
  const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
  if (parentObject !== void 0 && fromPageToken != null) {
    setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
  }
  if (getValueByPath(fromObject, ["filter"]) !== void 0) {
    throw new Error("filter parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(listBatchJobsConfigToMldev, "listBatchJobsConfigToMldev");
function listBatchJobsConfigToVertex(fromObject, parentObject) {
  const toObject = {};
  const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
  if (parentObject !== void 0 && fromPageSize != null) {
    setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
  }
  const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
  if (parentObject !== void 0 && fromPageToken != null) {
    setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
  }
  const fromFilter = getValueByPath(fromObject, ["filter"]);
  if (parentObject !== void 0 && fromFilter != null) {
    setValueByPath(parentObject, ["_query", "filter"], fromFilter);
  }
  return toObject;
}
__name(listBatchJobsConfigToVertex, "listBatchJobsConfigToVertex");
function listBatchJobsParametersToMldev(fromObject) {
  const toObject = {};
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    listBatchJobsConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(listBatchJobsParametersToMldev, "listBatchJobsParametersToMldev");
function listBatchJobsParametersToVertex(fromObject) {
  const toObject = {};
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    listBatchJobsConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(listBatchJobsParametersToVertex, "listBatchJobsParametersToVertex");
function listBatchJobsResponseFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromNextPageToken = getValueByPath(fromObject, [
    "nextPageToken"
  ]);
  if (fromNextPageToken != null) {
    setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
  }
  const fromBatchJobs = getValueByPath(fromObject, ["operations"]);
  if (fromBatchJobs != null) {
    let transformedList = fromBatchJobs;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return batchJobFromMldev(item);
      });
    }
    setValueByPath(toObject, ["batchJobs"], transformedList);
  }
  return toObject;
}
__name(listBatchJobsResponseFromMldev, "listBatchJobsResponseFromMldev");
function listBatchJobsResponseFromVertex(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromNextPageToken = getValueByPath(fromObject, [
    "nextPageToken"
  ]);
  if (fromNextPageToken != null) {
    setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
  }
  const fromBatchJobs = getValueByPath(fromObject, [
    "batchPredictionJobs"
  ]);
  if (fromBatchJobs != null) {
    let transformedList = fromBatchJobs;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return batchJobFromVertex(item);
      });
    }
    setValueByPath(toObject, ["batchJobs"], transformedList);
  }
  return toObject;
}
__name(listBatchJobsResponseFromVertex, "listBatchJobsResponseFromVertex");
function partToMldev$4(fromObject) {
  const toObject = {};
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (fromMediaResolution != null) {
    setValueByPath(toObject, ["mediaResolution"], fromMediaResolution);
  }
  const fromCodeExecutionResult = getValueByPath(fromObject, [
    "codeExecutionResult"
  ]);
  if (fromCodeExecutionResult != null) {
    setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
  }
  const fromExecutableCode = getValueByPath(fromObject, [
    "executableCode"
  ]);
  if (fromExecutableCode != null) {
    setValueByPath(toObject, ["executableCode"], fromExecutableCode);
  }
  const fromFileData = getValueByPath(fromObject, ["fileData"]);
  if (fromFileData != null) {
    setValueByPath(toObject, ["fileData"], fileDataToMldev$4(fromFileData));
  }
  const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
  if (fromFunctionCall != null) {
    setValueByPath(toObject, ["functionCall"], functionCallToMldev$4(fromFunctionCall));
  }
  const fromFunctionResponse = getValueByPath(fromObject, [
    "functionResponse"
  ]);
  if (fromFunctionResponse != null) {
    setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
  }
  const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
  if (fromInlineData != null) {
    setValueByPath(toObject, ["inlineData"], blobToMldev$4(fromInlineData));
  }
  const fromText = getValueByPath(fromObject, ["text"]);
  if (fromText != null) {
    setValueByPath(toObject, ["text"], fromText);
  }
  const fromThought = getValueByPath(fromObject, ["thought"]);
  if (fromThought != null) {
    setValueByPath(toObject, ["thought"], fromThought);
  }
  const fromThoughtSignature = getValueByPath(fromObject, [
    "thoughtSignature"
  ]);
  if (fromThoughtSignature != null) {
    setValueByPath(toObject, ["thoughtSignature"], fromThoughtSignature);
  }
  const fromVideoMetadata = getValueByPath(fromObject, [
    "videoMetadata"
  ]);
  if (fromVideoMetadata != null) {
    setValueByPath(toObject, ["videoMetadata"], fromVideoMetadata);
  }
  return toObject;
}
__name(partToMldev$4, "partToMldev$4");
function safetySettingToMldev$1(fromObject) {
  const toObject = {};
  const fromCategory = getValueByPath(fromObject, ["category"]);
  if (fromCategory != null) {
    setValueByPath(toObject, ["category"], fromCategory);
  }
  if (getValueByPath(fromObject, ["method"]) !== void 0) {
    throw new Error("method parameter is not supported in Gemini API.");
  }
  const fromThreshold = getValueByPath(fromObject, ["threshold"]);
  if (fromThreshold != null) {
    setValueByPath(toObject, ["threshold"], fromThreshold);
  }
  return toObject;
}
__name(safetySettingToMldev$1, "safetySettingToMldev$1");
function toolConfigToMldev$2(fromObject) {
  const toObject = {};
  const fromRetrievalConfig = getValueByPath(fromObject, [
    "retrievalConfig"
  ]);
  if (fromRetrievalConfig != null) {
    setValueByPath(toObject, ["retrievalConfig"], fromRetrievalConfig);
  }
  const fromFunctionCallingConfig = getValueByPath(fromObject, [
    "functionCallingConfig"
  ]);
  if (fromFunctionCallingConfig != null) {
    setValueByPath(toObject, ["functionCallingConfig"], functionCallingConfigToMldev$2(fromFunctionCallingConfig));
  }
  return toObject;
}
__name(toolConfigToMldev$2, "toolConfigToMldev$2");
function toolToMldev$4(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["retrieval"]) !== void 0) {
    throw new Error("retrieval parameter is not supported in Gemini API.");
  }
  const fromComputerUse = getValueByPath(fromObject, ["computerUse"]);
  if (fromComputerUse != null) {
    setValueByPath(toObject, ["computerUse"], fromComputerUse);
  }
  const fromFileSearch = getValueByPath(fromObject, ["fileSearch"]);
  if (fromFileSearch != null) {
    setValueByPath(toObject, ["fileSearch"], fromFileSearch);
  }
  const fromCodeExecution = getValueByPath(fromObject, [
    "codeExecution"
  ]);
  if (fromCodeExecution != null) {
    setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
  }
  if (getValueByPath(fromObject, ["enterpriseWebSearch"]) !== void 0) {
    throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  }
  const fromFunctionDeclarations = getValueByPath(fromObject, [
    "functionDeclarations"
  ]);
  if (fromFunctionDeclarations != null) {
    let transformedList = fromFunctionDeclarations;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["functionDeclarations"], transformedList);
  }
  const fromGoogleMaps = getValueByPath(fromObject, ["googleMaps"]);
  if (fromGoogleMaps != null) {
    setValueByPath(toObject, ["googleMaps"], googleMapsToMldev$4(fromGoogleMaps));
  }
  const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
  if (fromGoogleSearch != null) {
    setValueByPath(toObject, ["googleSearch"], googleSearchToMldev$4(fromGoogleSearch));
  }
  const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
    "googleSearchRetrieval"
  ]);
  if (fromGoogleSearchRetrieval != null) {
    setValueByPath(toObject, ["googleSearchRetrieval"], fromGoogleSearchRetrieval);
  }
  const fromUrlContext = getValueByPath(fromObject, ["urlContext"]);
  if (fromUrlContext != null) {
    setValueByPath(toObject, ["urlContext"], fromUrlContext);
  }
  return toObject;
}
__name(toolToMldev$4, "toolToMldev$4");
var PagedItem;
(function(PagedItem2) {
  PagedItem2["PAGED_ITEM_BATCH_JOBS"] = "batchJobs";
  PagedItem2["PAGED_ITEM_MODELS"] = "models";
  PagedItem2["PAGED_ITEM_TUNING_JOBS"] = "tuningJobs";
  PagedItem2["PAGED_ITEM_FILES"] = "files";
  PagedItem2["PAGED_ITEM_CACHED_CONTENTS"] = "cachedContents";
  PagedItem2["PAGED_ITEM_FILE_SEARCH_STORES"] = "fileSearchStores";
  PagedItem2["PAGED_ITEM_DOCUMENTS"] = "documents";
})(PagedItem || (PagedItem = {}));
var Pager = class {
  static {
    __name(this, "Pager");
  }
  constructor(name, request, response, params) {
    this.pageInternal = [];
    this.paramsInternal = {};
    this.requestInternal = request;
    this.init(name, response, params);
  }
  init(name, response, params) {
    var _a2, _b;
    this.nameInternal = name;
    this.pageInternal = response[this.nameInternal] || [];
    this.sdkHttpResponseInternal = response === null || response === void 0 ? void 0 : response.sdkHttpResponse;
    this.idxInternal = 0;
    let requestParams = { config: {} };
    if (!params || Object.keys(params).length === 0) {
      requestParams = { config: {} };
    } else if (typeof params === "object") {
      requestParams = Object.assign({}, params);
    } else {
      requestParams = params;
    }
    if (requestParams["config"]) {
      requestParams["config"]["pageToken"] = response["nextPageToken"];
    }
    this.paramsInternal = requestParams;
    this.pageInternalSize = (_b = (_a2 = requestParams["config"]) === null || _a2 === void 0 ? void 0 : _a2["pageSize"]) !== null && _b !== void 0 ? _b : this.pageInternal.length;
  }
  initNextPage(response) {
    this.init(this.nameInternal, response, this.paramsInternal);
  }
  /**
   * Returns the current page, which is a list of items.
   *
   * @remarks
   * The first page is retrieved when the pager is created. The returned list of
   * items could be a subset of the entire list.
   */
  get page() {
    return this.pageInternal;
  }
  /**
   * Returns the type of paged item (for example, ``batch_jobs``).
   */
  get name() {
    return this.nameInternal;
  }
  /**
   * Returns the length of the page fetched each time by this pager.
   *
   * @remarks
   * The number of items in the page is less than or equal to the page length.
   */
  get pageSize() {
    return this.pageInternalSize;
  }
  /**
   * Returns the headers of the API response.
   */
  get sdkHttpResponse() {
    return this.sdkHttpResponseInternal;
  }
  /**
   * Returns the parameters when making the API request for the next page.
   *
   * @remarks
   * Parameters contain a set of optional configs that can be
   * used to customize the API request. For example, the `pageToken` parameter
   * contains the token to request the next page.
   */
  get params() {
    return this.paramsInternal;
  }
  /**
   * Returns the total number of items in the current page.
   */
  get pageLength() {
    return this.pageInternal.length;
  }
  /**
   * Returns the item at the given index.
   */
  getItem(index) {
    return this.pageInternal[index];
  }
  /**
   * Returns an async iterator that support iterating through all items
   * retrieved from the API.
   *
   * @remarks
   * The iterator will automatically fetch the next page if there are more items
   * to fetch from the API.
   *
   * @example
   *
   * ```ts
   * const pager = await ai.files.list({config: {pageSize: 10}});
   * for await (const file of pager) {
   *   console.log(file.name);
   * }
   * ```
   */
  [Symbol.asyncIterator]() {
    return {
      next: /* @__PURE__ */ __name(async () => {
        if (this.idxInternal >= this.pageLength) {
          if (this.hasNextPage()) {
            await this.nextPage();
          } else {
            return { value: void 0, done: true };
          }
        }
        const item = this.getItem(this.idxInternal);
        this.idxInternal += 1;
        return { value: item, done: false };
      }, "next"),
      return: /* @__PURE__ */ __name(async () => {
        return { value: void 0, done: true };
      }, "return")
    };
  }
  /**
   * Fetches the next page of items. This makes a new API request.
   *
   * @throws {Error} If there are no more pages to fetch.
   *
   * @example
   *
   * ```ts
   * const pager = await ai.files.list({config: {pageSize: 10}});
   * let page = pager.page;
   * while (true) {
   *   for (const file of page) {
   *     console.log(file.name);
   *   }
   *   if (!pager.hasNextPage()) {
   *     break;
   *   }
   *   page = await pager.nextPage();
   * }
   * ```
   */
  async nextPage() {
    if (!this.hasNextPage()) {
      throw new Error("No more pages to fetch.");
    }
    const response = await this.requestInternal(this.params);
    this.initNextPage(response);
    return this.page;
  }
  /**
   * Returns true if there are more pages to fetch from the API.
   */
  hasNextPage() {
    var _a2;
    if (((_a2 = this.params["config"]) === null || _a2 === void 0 ? void 0 : _a2["pageToken"]) !== void 0) {
      return true;
    }
    return false;
  }
};
var Batches = class extends BaseModule {
  static {
    __name(this, "Batches");
  }
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
    this.list = async (params = {}) => {
      return new Pager(PagedItem.PAGED_ITEM_BATCH_JOBS, (x) => this.listInternal(x), await this.listInternal(params), params);
    };
    this.create = async (params) => {
      if (this.apiClient.isVertexAI()) {
        params.config = this.formatDestination(params.src, params.config);
      }
      return this.createInternal(params);
    };
    this.createEmbeddings = async (params) => {
      console.warn("batches.createEmbeddings() is experimental and may change without notice.");
      if (this.apiClient.isVertexAI()) {
        throw new Error("Vertex AI does not support batches.createEmbeddings.");
      }
      return this.createEmbeddingsInternal(params);
    };
  }
  // Helper function to handle inlined generate content requests
  createInlinedGenerateContentRequest(params) {
    const body = createBatchJobParametersToMldev(
      this.apiClient,
      // Use instance apiClient
      params
    );
    const urlParams = body["_url"];
    const path2 = formatMap("{model}:batchGenerateContent", urlParams);
    const batch = body["batch"];
    const inputConfig = batch["inputConfig"];
    const requestsWrapper = inputConfig["requests"];
    const requests = requestsWrapper["requests"];
    const newRequests = [];
    for (const request of requests) {
      const requestDict = Object.assign({}, request);
      if (requestDict["systemInstruction"]) {
        const systemInstructionValue = requestDict["systemInstruction"];
        delete requestDict["systemInstruction"];
        const requestContent = requestDict["request"];
        requestContent["systemInstruction"] = systemInstructionValue;
        requestDict["request"] = requestContent;
      }
      newRequests.push(requestDict);
    }
    requestsWrapper["requests"] = newRequests;
    delete body["config"];
    delete body["_url"];
    delete body["_query"];
    return { path: path2, body };
  }
  // Helper function to get the first GCS URI
  getGcsUri(src) {
    if (typeof src === "string") {
      return src.startsWith("gs://") ? src : void 0;
    }
    if (!Array.isArray(src) && src.gcsUri && src.gcsUri.length > 0) {
      return src.gcsUri[0];
    }
    return void 0;
  }
  // Helper function to get the BigQuery URI
  getBigqueryUri(src) {
    if (typeof src === "string") {
      return src.startsWith("bq://") ? src : void 0;
    }
    if (!Array.isArray(src)) {
      return src.bigqueryUri;
    }
    return void 0;
  }
  // Function to format the destination configuration for Vertex AI
  formatDestination(src, config2) {
    const newConfig = config2 ? Object.assign({}, config2) : {};
    const timestampStr = Date.now().toString();
    if (!newConfig.displayName) {
      newConfig.displayName = `genaiBatchJob_${timestampStr}`;
    }
    if (newConfig.dest === void 0) {
      const gcsUri = this.getGcsUri(src);
      const bigqueryUri = this.getBigqueryUri(src);
      if (gcsUri) {
        if (gcsUri.endsWith(".jsonl")) {
          newConfig.dest = `${gcsUri.slice(0, -6)}/dest`;
        } else {
          newConfig.dest = `${gcsUri}_dest_${timestampStr}`;
        }
      } else if (bigqueryUri) {
        newConfig.dest = `${bigqueryUri}_dest_${timestampStr}`;
      } else {
        throw new Error("Unsupported source for Vertex AI: No GCS or BigQuery URI found.");
      }
    }
    return newConfig;
  }
  /**
   * Internal method to create batch job.
   *
   * @param params - The parameters for create batch job request.
   * @return The created batch job.
   *
   */
  async createInternal(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = createBatchJobParametersToVertex(this.apiClient, params);
      path2 = formatMap("batchPredictionJobs", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = batchJobFromVertex(apiResponse);
        return resp;
      });
    } else {
      const body = createBatchJobParametersToMldev(this.apiClient, params);
      path2 = formatMap("{model}:batchGenerateContent", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = batchJobFromMldev(apiResponse);
        return resp;
      });
    }
  }
  /**
   * Internal method to create batch job.
   *
   * @param params - The parameters for create batch job request.
   * @return The created batch job.
   *
   */
  async createEmbeddingsInternal(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = createEmbeddingsBatchJobParametersToMldev(this.apiClient, params);
      path2 = formatMap("{model}:asyncBatchEmbedContent", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = batchJobFromMldev(apiResponse);
        return resp;
      });
    }
  }
  /**
   * Gets batch job configurations.
   *
   * @param params - The parameters for the get request.
   * @return The batch job.
   *
   * @example
   * ```ts
   * await ai.batches.get({name: '...'}); // The server-generated resource name.
   * ```
   */
  async get(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = getBatchJobParametersToVertex(this.apiClient, params);
      path2 = formatMap("batchPredictionJobs/{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = batchJobFromVertex(apiResponse);
        return resp;
      });
    } else {
      const body = getBatchJobParametersToMldev(this.apiClient, params);
      path2 = formatMap("batches/{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = batchJobFromMldev(apiResponse);
        return resp;
      });
    }
  }
  /**
   * Cancels a batch job.
   *
   * @param params - The parameters for the cancel request.
   * @return The empty response returned by the API.
   *
   * @example
   * ```ts
   * await ai.batches.cancel({name: '...'}); // The server-generated resource name.
   * ```
   */
  async cancel(params) {
    var _a2, _b, _c, _d;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = cancelBatchJobParametersToVertex(this.apiClient, params);
      path2 = formatMap("batchPredictionJobs/{name}:cancel", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      await this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      });
    } else {
      const body = cancelBatchJobParametersToMldev(this.apiClient, params);
      path2 = formatMap("batches/{name}:cancel", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      await this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      });
    }
  }
  async listInternal(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = listBatchJobsParametersToVertex(params);
      path2 = formatMap("batchPredictionJobs", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = listBatchJobsResponseFromVertex(apiResponse);
        const typedResp = new ListBatchJobsResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      const body = listBatchJobsParametersToMldev(params);
      path2 = formatMap("batches", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = listBatchJobsResponseFromMldev(apiResponse);
        const typedResp = new ListBatchJobsResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  /**
   * Deletes a batch job.
   *
   * @param params - The parameters for the delete request.
   * @return The empty response returned by the API.
   *
   * @example
   * ```ts
   * await ai.batches.delete({name: '...'}); // The server-generated resource name.
   * ```
   */
  async delete(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = deleteBatchJobParametersToVertex(this.apiClient, params);
      path2 = formatMap("batchPredictionJobs/{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "DELETE",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = deleteResourceJobFromVertex(apiResponse);
        return resp;
      });
    } else {
      const body = deleteBatchJobParametersToMldev(this.apiClient, params);
      path2 = formatMap("batches/{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "DELETE",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = deleteResourceJobFromMldev(apiResponse);
        return resp;
      });
    }
  }
};
function blobToMldev$3(fromObject) {
  const toObject = {};
  const fromData = getValueByPath(fromObject, ["data"]);
  if (fromData != null) {
    setValueByPath(toObject, ["data"], fromData);
  }
  if (getValueByPath(fromObject, ["displayName"]) !== void 0) {
    throw new Error("displayName parameter is not supported in Gemini API.");
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(blobToMldev$3, "blobToMldev$3");
function contentToMldev$3(fromObject) {
  const toObject = {};
  const fromParts = getValueByPath(fromObject, ["parts"]);
  if (fromParts != null) {
    let transformedList = fromParts;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return partToMldev$3(item);
      });
    }
    setValueByPath(toObject, ["parts"], transformedList);
  }
  const fromRole = getValueByPath(fromObject, ["role"]);
  if (fromRole != null) {
    setValueByPath(toObject, ["role"], fromRole);
  }
  return toObject;
}
__name(contentToMldev$3, "contentToMldev$3");
function createCachedContentConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromTtl = getValueByPath(fromObject, ["ttl"]);
  if (parentObject !== void 0 && fromTtl != null) {
    setValueByPath(parentObject, ["ttl"], fromTtl);
  }
  const fromExpireTime = getValueByPath(fromObject, ["expireTime"]);
  if (parentObject !== void 0 && fromExpireTime != null) {
    setValueByPath(parentObject, ["expireTime"], fromExpireTime);
  }
  const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
  if (parentObject !== void 0 && fromDisplayName != null) {
    setValueByPath(parentObject, ["displayName"], fromDisplayName);
  }
  const fromContents = getValueByPath(fromObject, ["contents"]);
  if (parentObject !== void 0 && fromContents != null) {
    let transformedList = tContents(fromContents);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return contentToMldev$3(item);
      });
    }
    setValueByPath(parentObject, ["contents"], transformedList);
  }
  const fromSystemInstruction = getValueByPath(fromObject, [
    "systemInstruction"
  ]);
  if (parentObject !== void 0 && fromSystemInstruction != null) {
    setValueByPath(parentObject, ["systemInstruction"], contentToMldev$3(tContent(fromSystemInstruction)));
  }
  const fromTools = getValueByPath(fromObject, ["tools"]);
  if (parentObject !== void 0 && fromTools != null) {
    let transformedList = fromTools;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return toolToMldev$3(item);
      });
    }
    setValueByPath(parentObject, ["tools"], transformedList);
  }
  const fromToolConfig = getValueByPath(fromObject, ["toolConfig"]);
  if (parentObject !== void 0 && fromToolConfig != null) {
    setValueByPath(parentObject, ["toolConfig"], toolConfigToMldev$1(fromToolConfig));
  }
  if (getValueByPath(fromObject, ["kmsKeyName"]) !== void 0) {
    throw new Error("kmsKeyName parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(createCachedContentConfigToMldev, "createCachedContentConfigToMldev");
function createCachedContentConfigToVertex(fromObject, parentObject) {
  const toObject = {};
  const fromTtl = getValueByPath(fromObject, ["ttl"]);
  if (parentObject !== void 0 && fromTtl != null) {
    setValueByPath(parentObject, ["ttl"], fromTtl);
  }
  const fromExpireTime = getValueByPath(fromObject, ["expireTime"]);
  if (parentObject !== void 0 && fromExpireTime != null) {
    setValueByPath(parentObject, ["expireTime"], fromExpireTime);
  }
  const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
  if (parentObject !== void 0 && fromDisplayName != null) {
    setValueByPath(parentObject, ["displayName"], fromDisplayName);
  }
  const fromContents = getValueByPath(fromObject, ["contents"]);
  if (parentObject !== void 0 && fromContents != null) {
    let transformedList = tContents(fromContents);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(parentObject, ["contents"], transformedList);
  }
  const fromSystemInstruction = getValueByPath(fromObject, [
    "systemInstruction"
  ]);
  if (parentObject !== void 0 && fromSystemInstruction != null) {
    setValueByPath(parentObject, ["systemInstruction"], tContent(fromSystemInstruction));
  }
  const fromTools = getValueByPath(fromObject, ["tools"]);
  if (parentObject !== void 0 && fromTools != null) {
    let transformedList = fromTools;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return toolToVertex$2(item);
      });
    }
    setValueByPath(parentObject, ["tools"], transformedList);
  }
  const fromToolConfig = getValueByPath(fromObject, ["toolConfig"]);
  if (parentObject !== void 0 && fromToolConfig != null) {
    setValueByPath(parentObject, ["toolConfig"], fromToolConfig);
  }
  const fromKmsKeyName = getValueByPath(fromObject, ["kmsKeyName"]);
  if (parentObject !== void 0 && fromKmsKeyName != null) {
    setValueByPath(parentObject, ["encryption_spec", "kmsKeyName"], fromKmsKeyName);
  }
  return toObject;
}
__name(createCachedContentConfigToVertex, "createCachedContentConfigToVertex");
function createCachedContentParametersToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["model"], tCachesModel(apiClient, fromModel));
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    createCachedContentConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(createCachedContentParametersToMldev, "createCachedContentParametersToMldev");
function createCachedContentParametersToVertex(apiClient, fromObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["model"], tCachesModel(apiClient, fromModel));
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    createCachedContentConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(createCachedContentParametersToVertex, "createCachedContentParametersToVertex");
function deleteCachedContentParametersToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], tCachedContentName(apiClient, fromName));
  }
  return toObject;
}
__name(deleteCachedContentParametersToMldev, "deleteCachedContentParametersToMldev");
function deleteCachedContentParametersToVertex(apiClient, fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], tCachedContentName(apiClient, fromName));
  }
  return toObject;
}
__name(deleteCachedContentParametersToVertex, "deleteCachedContentParametersToVertex");
function deleteCachedContentResponseFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  return toObject;
}
__name(deleteCachedContentResponseFromMldev, "deleteCachedContentResponseFromMldev");
function deleteCachedContentResponseFromVertex(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  return toObject;
}
__name(deleteCachedContentResponseFromVertex, "deleteCachedContentResponseFromVertex");
function fileDataToMldev$3(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["displayName"]) !== void 0) {
    throw new Error("displayName parameter is not supported in Gemini API.");
  }
  const fromFileUri = getValueByPath(fromObject, ["fileUri"]);
  if (fromFileUri != null) {
    setValueByPath(toObject, ["fileUri"], fromFileUri);
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(fileDataToMldev$3, "fileDataToMldev$3");
function functionCallToMldev$3(fromObject) {
  const toObject = {};
  const fromId = getValueByPath(fromObject, ["id"]);
  if (fromId != null) {
    setValueByPath(toObject, ["id"], fromId);
  }
  const fromArgs = getValueByPath(fromObject, ["args"]);
  if (fromArgs != null) {
    setValueByPath(toObject, ["args"], fromArgs);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  if (getValueByPath(fromObject, ["partialArgs"]) !== void 0) {
    throw new Error("partialArgs parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["willContinue"]) !== void 0) {
    throw new Error("willContinue parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(functionCallToMldev$3, "functionCallToMldev$3");
function functionCallingConfigToMldev$1(fromObject) {
  const toObject = {};
  const fromAllowedFunctionNames = getValueByPath(fromObject, [
    "allowedFunctionNames"
  ]);
  if (fromAllowedFunctionNames != null) {
    setValueByPath(toObject, ["allowedFunctionNames"], fromAllowedFunctionNames);
  }
  const fromMode = getValueByPath(fromObject, ["mode"]);
  if (fromMode != null) {
    setValueByPath(toObject, ["mode"], fromMode);
  }
  if (getValueByPath(fromObject, ["streamFunctionCallArguments"]) !== void 0) {
    throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(functionCallingConfigToMldev$1, "functionCallingConfigToMldev$1");
function functionDeclarationToVertex$2(fromObject) {
  const toObject = {};
  const fromDescription = getValueByPath(fromObject, ["description"]);
  if (fromDescription != null) {
    setValueByPath(toObject, ["description"], fromDescription);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromParameters = getValueByPath(fromObject, ["parameters"]);
  if (fromParameters != null) {
    setValueByPath(toObject, ["parameters"], fromParameters);
  }
  const fromParametersJsonSchema = getValueByPath(fromObject, [
    "parametersJsonSchema"
  ]);
  if (fromParametersJsonSchema != null) {
    setValueByPath(toObject, ["parametersJsonSchema"], fromParametersJsonSchema);
  }
  const fromResponse = getValueByPath(fromObject, ["response"]);
  if (fromResponse != null) {
    setValueByPath(toObject, ["response"], fromResponse);
  }
  const fromResponseJsonSchema = getValueByPath(fromObject, [
    "responseJsonSchema"
  ]);
  if (fromResponseJsonSchema != null) {
    setValueByPath(toObject, ["responseJsonSchema"], fromResponseJsonSchema);
  }
  if (getValueByPath(fromObject, ["behavior"]) !== void 0) {
    throw new Error("behavior parameter is not supported in Vertex AI.");
  }
  return toObject;
}
__name(functionDeclarationToVertex$2, "functionDeclarationToVertex$2");
function getCachedContentParametersToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], tCachedContentName(apiClient, fromName));
  }
  return toObject;
}
__name(getCachedContentParametersToMldev, "getCachedContentParametersToMldev");
function getCachedContentParametersToVertex(apiClient, fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], tCachedContentName(apiClient, fromName));
  }
  return toObject;
}
__name(getCachedContentParametersToVertex, "getCachedContentParametersToVertex");
function googleMapsToMldev$3(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["authConfig"]) !== void 0) {
    throw new Error("authConfig parameter is not supported in Gemini API.");
  }
  const fromEnableWidget = getValueByPath(fromObject, ["enableWidget"]);
  if (fromEnableWidget != null) {
    setValueByPath(toObject, ["enableWidget"], fromEnableWidget);
  }
  return toObject;
}
__name(googleMapsToMldev$3, "googleMapsToMldev$3");
function googleSearchToMldev$3(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["excludeDomains"]) !== void 0) {
    throw new Error("excludeDomains parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["blockingConfidence"]) !== void 0) {
    throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  }
  const fromTimeRangeFilter = getValueByPath(fromObject, [
    "timeRangeFilter"
  ]);
  if (fromTimeRangeFilter != null) {
    setValueByPath(toObject, ["timeRangeFilter"], fromTimeRangeFilter);
  }
  return toObject;
}
__name(googleSearchToMldev$3, "googleSearchToMldev$3");
function listCachedContentsConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
  if (parentObject !== void 0 && fromPageSize != null) {
    setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
  }
  const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
  if (parentObject !== void 0 && fromPageToken != null) {
    setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
  }
  return toObject;
}
__name(listCachedContentsConfigToMldev, "listCachedContentsConfigToMldev");
function listCachedContentsConfigToVertex(fromObject, parentObject) {
  const toObject = {};
  const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
  if (parentObject !== void 0 && fromPageSize != null) {
    setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
  }
  const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
  if (parentObject !== void 0 && fromPageToken != null) {
    setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
  }
  return toObject;
}
__name(listCachedContentsConfigToVertex, "listCachedContentsConfigToVertex");
function listCachedContentsParametersToMldev(fromObject) {
  const toObject = {};
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    listCachedContentsConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(listCachedContentsParametersToMldev, "listCachedContentsParametersToMldev");
function listCachedContentsParametersToVertex(fromObject) {
  const toObject = {};
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    listCachedContentsConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(listCachedContentsParametersToVertex, "listCachedContentsParametersToVertex");
function listCachedContentsResponseFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromNextPageToken = getValueByPath(fromObject, [
    "nextPageToken"
  ]);
  if (fromNextPageToken != null) {
    setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
  }
  const fromCachedContents = getValueByPath(fromObject, [
    "cachedContents"
  ]);
  if (fromCachedContents != null) {
    let transformedList = fromCachedContents;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["cachedContents"], transformedList);
  }
  return toObject;
}
__name(listCachedContentsResponseFromMldev, "listCachedContentsResponseFromMldev");
function listCachedContentsResponseFromVertex(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromNextPageToken = getValueByPath(fromObject, [
    "nextPageToken"
  ]);
  if (fromNextPageToken != null) {
    setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
  }
  const fromCachedContents = getValueByPath(fromObject, [
    "cachedContents"
  ]);
  if (fromCachedContents != null) {
    let transformedList = fromCachedContents;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["cachedContents"], transformedList);
  }
  return toObject;
}
__name(listCachedContentsResponseFromVertex, "listCachedContentsResponseFromVertex");
function partToMldev$3(fromObject) {
  const toObject = {};
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (fromMediaResolution != null) {
    setValueByPath(toObject, ["mediaResolution"], fromMediaResolution);
  }
  const fromCodeExecutionResult = getValueByPath(fromObject, [
    "codeExecutionResult"
  ]);
  if (fromCodeExecutionResult != null) {
    setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
  }
  const fromExecutableCode = getValueByPath(fromObject, [
    "executableCode"
  ]);
  if (fromExecutableCode != null) {
    setValueByPath(toObject, ["executableCode"], fromExecutableCode);
  }
  const fromFileData = getValueByPath(fromObject, ["fileData"]);
  if (fromFileData != null) {
    setValueByPath(toObject, ["fileData"], fileDataToMldev$3(fromFileData));
  }
  const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
  if (fromFunctionCall != null) {
    setValueByPath(toObject, ["functionCall"], functionCallToMldev$3(fromFunctionCall));
  }
  const fromFunctionResponse = getValueByPath(fromObject, [
    "functionResponse"
  ]);
  if (fromFunctionResponse != null) {
    setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
  }
  const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
  if (fromInlineData != null) {
    setValueByPath(toObject, ["inlineData"], blobToMldev$3(fromInlineData));
  }
  const fromText = getValueByPath(fromObject, ["text"]);
  if (fromText != null) {
    setValueByPath(toObject, ["text"], fromText);
  }
  const fromThought = getValueByPath(fromObject, ["thought"]);
  if (fromThought != null) {
    setValueByPath(toObject, ["thought"], fromThought);
  }
  const fromThoughtSignature = getValueByPath(fromObject, [
    "thoughtSignature"
  ]);
  if (fromThoughtSignature != null) {
    setValueByPath(toObject, ["thoughtSignature"], fromThoughtSignature);
  }
  const fromVideoMetadata = getValueByPath(fromObject, [
    "videoMetadata"
  ]);
  if (fromVideoMetadata != null) {
    setValueByPath(toObject, ["videoMetadata"], fromVideoMetadata);
  }
  return toObject;
}
__name(partToMldev$3, "partToMldev$3");
function toolConfigToMldev$1(fromObject) {
  const toObject = {};
  const fromRetrievalConfig = getValueByPath(fromObject, [
    "retrievalConfig"
  ]);
  if (fromRetrievalConfig != null) {
    setValueByPath(toObject, ["retrievalConfig"], fromRetrievalConfig);
  }
  const fromFunctionCallingConfig = getValueByPath(fromObject, [
    "functionCallingConfig"
  ]);
  if (fromFunctionCallingConfig != null) {
    setValueByPath(toObject, ["functionCallingConfig"], functionCallingConfigToMldev$1(fromFunctionCallingConfig));
  }
  return toObject;
}
__name(toolConfigToMldev$1, "toolConfigToMldev$1");
function toolToMldev$3(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["retrieval"]) !== void 0) {
    throw new Error("retrieval parameter is not supported in Gemini API.");
  }
  const fromComputerUse = getValueByPath(fromObject, ["computerUse"]);
  if (fromComputerUse != null) {
    setValueByPath(toObject, ["computerUse"], fromComputerUse);
  }
  const fromFileSearch = getValueByPath(fromObject, ["fileSearch"]);
  if (fromFileSearch != null) {
    setValueByPath(toObject, ["fileSearch"], fromFileSearch);
  }
  const fromCodeExecution = getValueByPath(fromObject, [
    "codeExecution"
  ]);
  if (fromCodeExecution != null) {
    setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
  }
  if (getValueByPath(fromObject, ["enterpriseWebSearch"]) !== void 0) {
    throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  }
  const fromFunctionDeclarations = getValueByPath(fromObject, [
    "functionDeclarations"
  ]);
  if (fromFunctionDeclarations != null) {
    let transformedList = fromFunctionDeclarations;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["functionDeclarations"], transformedList);
  }
  const fromGoogleMaps = getValueByPath(fromObject, ["googleMaps"]);
  if (fromGoogleMaps != null) {
    setValueByPath(toObject, ["googleMaps"], googleMapsToMldev$3(fromGoogleMaps));
  }
  const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
  if (fromGoogleSearch != null) {
    setValueByPath(toObject, ["googleSearch"], googleSearchToMldev$3(fromGoogleSearch));
  }
  const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
    "googleSearchRetrieval"
  ]);
  if (fromGoogleSearchRetrieval != null) {
    setValueByPath(toObject, ["googleSearchRetrieval"], fromGoogleSearchRetrieval);
  }
  const fromUrlContext = getValueByPath(fromObject, ["urlContext"]);
  if (fromUrlContext != null) {
    setValueByPath(toObject, ["urlContext"], fromUrlContext);
  }
  return toObject;
}
__name(toolToMldev$3, "toolToMldev$3");
function toolToVertex$2(fromObject) {
  const toObject = {};
  const fromRetrieval = getValueByPath(fromObject, ["retrieval"]);
  if (fromRetrieval != null) {
    setValueByPath(toObject, ["retrieval"], fromRetrieval);
  }
  const fromComputerUse = getValueByPath(fromObject, ["computerUse"]);
  if (fromComputerUse != null) {
    setValueByPath(toObject, ["computerUse"], fromComputerUse);
  }
  if (getValueByPath(fromObject, ["fileSearch"]) !== void 0) {
    throw new Error("fileSearch parameter is not supported in Vertex AI.");
  }
  const fromCodeExecution = getValueByPath(fromObject, [
    "codeExecution"
  ]);
  if (fromCodeExecution != null) {
    setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
  }
  const fromEnterpriseWebSearch = getValueByPath(fromObject, [
    "enterpriseWebSearch"
  ]);
  if (fromEnterpriseWebSearch != null) {
    setValueByPath(toObject, ["enterpriseWebSearch"], fromEnterpriseWebSearch);
  }
  const fromFunctionDeclarations = getValueByPath(fromObject, [
    "functionDeclarations"
  ]);
  if (fromFunctionDeclarations != null) {
    let transformedList = fromFunctionDeclarations;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return functionDeclarationToVertex$2(item);
      });
    }
    setValueByPath(toObject, ["functionDeclarations"], transformedList);
  }
  const fromGoogleMaps = getValueByPath(fromObject, ["googleMaps"]);
  if (fromGoogleMaps != null) {
    setValueByPath(toObject, ["googleMaps"], fromGoogleMaps);
  }
  const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
  if (fromGoogleSearch != null) {
    setValueByPath(toObject, ["googleSearch"], fromGoogleSearch);
  }
  const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
    "googleSearchRetrieval"
  ]);
  if (fromGoogleSearchRetrieval != null) {
    setValueByPath(toObject, ["googleSearchRetrieval"], fromGoogleSearchRetrieval);
  }
  const fromUrlContext = getValueByPath(fromObject, ["urlContext"]);
  if (fromUrlContext != null) {
    setValueByPath(toObject, ["urlContext"], fromUrlContext);
  }
  return toObject;
}
__name(toolToVertex$2, "toolToVertex$2");
function updateCachedContentConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromTtl = getValueByPath(fromObject, ["ttl"]);
  if (parentObject !== void 0 && fromTtl != null) {
    setValueByPath(parentObject, ["ttl"], fromTtl);
  }
  const fromExpireTime = getValueByPath(fromObject, ["expireTime"]);
  if (parentObject !== void 0 && fromExpireTime != null) {
    setValueByPath(parentObject, ["expireTime"], fromExpireTime);
  }
  return toObject;
}
__name(updateCachedContentConfigToMldev, "updateCachedContentConfigToMldev");
function updateCachedContentConfigToVertex(fromObject, parentObject) {
  const toObject = {};
  const fromTtl = getValueByPath(fromObject, ["ttl"]);
  if (parentObject !== void 0 && fromTtl != null) {
    setValueByPath(parentObject, ["ttl"], fromTtl);
  }
  const fromExpireTime = getValueByPath(fromObject, ["expireTime"]);
  if (parentObject !== void 0 && fromExpireTime != null) {
    setValueByPath(parentObject, ["expireTime"], fromExpireTime);
  }
  return toObject;
}
__name(updateCachedContentConfigToVertex, "updateCachedContentConfigToVertex");
function updateCachedContentParametersToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], tCachedContentName(apiClient, fromName));
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    updateCachedContentConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(updateCachedContentParametersToMldev, "updateCachedContentParametersToMldev");
function updateCachedContentParametersToVertex(apiClient, fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], tCachedContentName(apiClient, fromName));
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    updateCachedContentConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(updateCachedContentParametersToVertex, "updateCachedContentParametersToVertex");
var Caches = class extends BaseModule {
  static {
    __name(this, "Caches");
  }
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
    this.list = async (params = {}) => {
      return new Pager(PagedItem.PAGED_ITEM_CACHED_CONTENTS, (x) => this.listInternal(x), await this.listInternal(params), params);
    };
  }
  /**
   * Creates a cached contents resource.
   *
   * @remarks
   * Context caching is only supported for specific models. See [Gemini
   * Developer API reference](https://ai.google.dev/gemini-api/docs/caching?lang=node/context-cac)
   * and [Vertex AI reference](https://cloud.google.com/vertex-ai/generative-ai/docs/context-cache/context-cache-overview#supported_models)
   * for more information.
   *
   * @param params - The parameters for the create request.
   * @return The created cached content.
   *
   * @example
   * ```ts
   * const contents = ...; // Initialize the content to cache.
   * const response = await ai.caches.create({
   *   model: 'gemini-2.0-flash-001',
   *   config: {
   *    'contents': contents,
   *    'displayName': 'test cache',
   *    'systemInstruction': 'What is the sum of the two pdfs?',
   *    'ttl': '86400s',
   *  }
   * });
   * ```
   */
  async create(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = createCachedContentParametersToVertex(this.apiClient, params);
      path2 = formatMap("cachedContents", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((resp) => {
        return resp;
      });
    } else {
      const body = createCachedContentParametersToMldev(this.apiClient, params);
      path2 = formatMap("cachedContents", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((resp) => {
        return resp;
      });
    }
  }
  /**
   * Gets cached content configurations.
   *
   * @param params - The parameters for the get request.
   * @return The cached content.
   *
   * @example
   * ```ts
   * await ai.caches.get({name: '...'}); // The server-generated resource name.
   * ```
   */
  async get(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = getCachedContentParametersToVertex(this.apiClient, params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((resp) => {
        return resp;
      });
    } else {
      const body = getCachedContentParametersToMldev(this.apiClient, params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((resp) => {
        return resp;
      });
    }
  }
  /**
   * Deletes cached content.
   *
   * @param params - The parameters for the delete request.
   * @return The empty response returned by the API.
   *
   * @example
   * ```ts
   * await ai.caches.delete({name: '...'}); // The server-generated resource name.
   * ```
   */
  async delete(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = deleteCachedContentParametersToVertex(this.apiClient, params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "DELETE",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = deleteCachedContentResponseFromVertex(apiResponse);
        const typedResp = new DeleteCachedContentResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      const body = deleteCachedContentParametersToMldev(this.apiClient, params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "DELETE",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = deleteCachedContentResponseFromMldev(apiResponse);
        const typedResp = new DeleteCachedContentResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  /**
   * Updates cached content configurations.
   *
   * @param params - The parameters for the update request.
   * @return The updated cached content.
   *
   * @example
   * ```ts
   * const response = await ai.caches.update({
   *   name: '...',  // The server-generated resource name.
   *   config: {'ttl': '7600s'}
   * });
   * ```
   */
  async update(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = updateCachedContentParametersToVertex(this.apiClient, params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "PATCH",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((resp) => {
        return resp;
      });
    } else {
      const body = updateCachedContentParametersToMldev(this.apiClient, params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "PATCH",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((resp) => {
        return resp;
      });
    }
  }
  async listInternal(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = listCachedContentsParametersToVertex(params);
      path2 = formatMap("cachedContents", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = listCachedContentsResponseFromVertex(apiResponse);
        const typedResp = new ListCachedContentsResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      const body = listCachedContentsParametersToMldev(params);
      path2 = formatMap("cachedContents", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = listCachedContentsResponseFromMldev(apiResponse);
        const typedResp = new ListCachedContentsResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
};
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
__name(__rest, "__rest");
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: /* @__PURE__ */ __name(function() {
      if (o && i >= o.length) o = void 0;
      return { value: o && o[i++], done: !o };
    }, "next")
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
__name(__values, "__values");
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
__name(__await, "__await");
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function awaitReturn(f) {
    return function(v) {
      return Promise.resolve(v).then(f, reject);
    };
  }
  __name(awaitReturn, "awaitReturn");
  function verb(n, f) {
    if (g[n]) {
      i[n] = function(v) {
        return new Promise(function(a, b) {
          q.push([n, v, a, b]) > 1 || resume(n, v);
        });
      };
      if (f) i[n] = f(i[n]);
    }
  }
  __name(verb, "verb");
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  __name(resume, "resume");
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  __name(step, "step");
  function fulfill(value) {
    resume("next", value);
  }
  __name(fulfill, "fulfill");
  function reject(value) {
    resume("throw", value);
  }
  __name(reject, "reject");
  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
  __name(settle, "settle");
}
__name(__asyncGenerator, "__asyncGenerator");
function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function(v) {
      return new Promise(function(resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  __name(verb, "verb");
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function(v2) {
      resolve({ value: v2, done: d });
    }, reject);
  }
  __name(settle, "settle");
}
__name(__asyncValues, "__asyncValues");
function isValidResponse(response) {
  var _a2;
  if (response.candidates == void 0 || response.candidates.length === 0) {
    return false;
  }
  const content = (_a2 = response.candidates[0]) === null || _a2 === void 0 ? void 0 : _a2.content;
  if (content === void 0) {
    return false;
  }
  return isValidContent(content);
}
__name(isValidResponse, "isValidResponse");
function isValidContent(content) {
  if (content.parts === void 0 || content.parts.length === 0) {
    return false;
  }
  for (const part of content.parts) {
    if (part === void 0 || Object.keys(part).length === 0) {
      return false;
    }
  }
  return true;
}
__name(isValidContent, "isValidContent");
function validateHistory(history) {
  if (history.length === 0) {
    return;
  }
  for (const content of history) {
    if (content.role !== "user" && content.role !== "model") {
      throw new Error(`Role must be user or model, but got ${content.role}.`);
    }
  }
}
__name(validateHistory, "validateHistory");
function extractCuratedHistory(comprehensiveHistory) {
  if (comprehensiveHistory === void 0 || comprehensiveHistory.length === 0) {
    return [];
  }
  const curatedHistory = [];
  const length = comprehensiveHistory.length;
  let i = 0;
  while (i < length) {
    if (comprehensiveHistory[i].role === "user") {
      curatedHistory.push(comprehensiveHistory[i]);
      i++;
    } else {
      const modelOutput = [];
      let isValid = true;
      while (i < length && comprehensiveHistory[i].role === "model") {
        modelOutput.push(comprehensiveHistory[i]);
        if (isValid && !isValidContent(comprehensiveHistory[i])) {
          isValid = false;
        }
        i++;
      }
      if (isValid) {
        curatedHistory.push(...modelOutput);
      } else {
        curatedHistory.pop();
      }
    }
  }
  return curatedHistory;
}
__name(extractCuratedHistory, "extractCuratedHistory");
var Chats = class {
  static {
    __name(this, "Chats");
  }
  constructor(modelsModule, apiClient) {
    this.modelsModule = modelsModule;
    this.apiClient = apiClient;
  }
  /**
   * Creates a new chat session.
   *
   * @remarks
   * The config in the params will be used for all requests within the chat
   * session unless overridden by a per-request `config` in
   * @see {@link types.SendMessageParameters#config}.
   *
   * @param params - Parameters for creating a chat session.
   * @returns A new chat session.
   *
   * @example
   * ```ts
   * const chat = ai.chats.create({
   *   model: 'gemini-2.0-flash'
   *   config: {
   *     temperature: 0.5,
   *     maxOutputTokens: 1024,
   *   }
   * });
   * ```
   */
  create(params) {
    return new Chat(
      this.apiClient,
      this.modelsModule,
      params.model,
      params.config,
      // Deep copy the history to avoid mutating the history outside of the
      // chat session.
      structuredClone(params.history)
    );
  }
};
var Chat = class {
  static {
    __name(this, "Chat");
  }
  constructor(apiClient, modelsModule, model, config2 = {}, history = []) {
    this.apiClient = apiClient;
    this.modelsModule = modelsModule;
    this.model = model;
    this.config = config2;
    this.history = history;
    this.sendPromise = Promise.resolve();
    validateHistory(history);
  }
  /**
   * Sends a message to the model and returns the response.
   *
   * @remarks
   * This method will wait for the previous message to be processed before
   * sending the next message.
   *
   * @see {@link Chat#sendMessageStream} for streaming method.
   * @param params - parameters for sending messages within a chat session.
   * @returns The model's response.
   *
   * @example
   * ```ts
   * const chat = ai.chats.create({model: 'gemini-2.0-flash'});
   * const response = await chat.sendMessage({
   *   message: 'Why is the sky blue?'
   * });
   * console.log(response.text);
   * ```
   */
  async sendMessage(params) {
    var _a2;
    await this.sendPromise;
    const inputContent = tContent(params.message);
    const responsePromise = this.modelsModule.generateContent({
      model: this.model,
      contents: this.getHistory(true).concat(inputContent),
      config: (_a2 = params.config) !== null && _a2 !== void 0 ? _a2 : this.config
    });
    this.sendPromise = (async () => {
      var _a3, _b, _c;
      const response = await responsePromise;
      const outputContent = (_b = (_a3 = response.candidates) === null || _a3 === void 0 ? void 0 : _a3[0]) === null || _b === void 0 ? void 0 : _b.content;
      const fullAutomaticFunctionCallingHistory = response.automaticFunctionCallingHistory;
      const index = this.getHistory(true).length;
      let automaticFunctionCallingHistory = [];
      if (fullAutomaticFunctionCallingHistory != null) {
        automaticFunctionCallingHistory = (_c = fullAutomaticFunctionCallingHistory.slice(index)) !== null && _c !== void 0 ? _c : [];
      }
      const modelOutput = outputContent ? [outputContent] : [];
      this.recordHistory(inputContent, modelOutput, automaticFunctionCallingHistory);
      return;
    })();
    await this.sendPromise.catch(() => {
      this.sendPromise = Promise.resolve();
    });
    return responsePromise;
  }
  /**
   * Sends a message to the model and returns the response in chunks.
   *
   * @remarks
   * This method will wait for the previous message to be processed before
   * sending the next message.
   *
   * @see {@link Chat#sendMessage} for non-streaming method.
   * @param params - parameters for sending the message.
   * @return The model's response.
   *
   * @example
   * ```ts
   * const chat = ai.chats.create({model: 'gemini-2.0-flash'});
   * const response = await chat.sendMessageStream({
   *   message: 'Why is the sky blue?'
   * });
   * for await (const chunk of response) {
   *   console.log(chunk.text);
   * }
   * ```
   */
  async sendMessageStream(params) {
    var _a2;
    await this.sendPromise;
    const inputContent = tContent(params.message);
    const streamResponse = this.modelsModule.generateContentStream({
      model: this.model,
      contents: this.getHistory(true).concat(inputContent),
      config: (_a2 = params.config) !== null && _a2 !== void 0 ? _a2 : this.config
    });
    this.sendPromise = streamResponse.then(() => void 0).catch(() => void 0);
    const response = await streamResponse;
    const result = this.processStreamResponse(response, inputContent);
    return result;
  }
  /**
   * Returns the chat history.
   *
   * @remarks
   * The history is a list of contents alternating between user and model.
   *
   * There are two types of history:
   * - The `curated history` contains only the valid turns between user and
   * model, which will be included in the subsequent requests sent to the model.
   * - The `comprehensive history` contains all turns, including invalid or
   *   empty model outputs, providing a complete record of the history.
   *
   * The history is updated after receiving the response from the model,
   * for streaming response, it means receiving the last chunk of the response.
   *
   * The `comprehensive history` is returned by default. To get the `curated
   * history`, set the `curated` parameter to `true`.
   *
   * @param curated - whether to return the curated history or the comprehensive
   *     history.
   * @return History contents alternating between user and model for the entire
   *     chat session.
   */
  getHistory(curated = false) {
    const history = curated ? extractCuratedHistory(this.history) : this.history;
    return structuredClone(history);
  }
  processStreamResponse(streamResponse, inputContent) {
    return __asyncGenerator(this, arguments, /* @__PURE__ */ __name(function* processStreamResponse_1() {
      var _a2, e_1, _b, _c;
      var _d, _e;
      const outputContent = [];
      try {
        for (var _f = true, streamResponse_1 = __asyncValues(streamResponse), streamResponse_1_1; streamResponse_1_1 = yield __await(streamResponse_1.next()), _a2 = streamResponse_1_1.done, !_a2; _f = true) {
          _c = streamResponse_1_1.value;
          _f = false;
          const chunk = _c;
          if (isValidResponse(chunk)) {
            const content = (_e = (_d = chunk.candidates) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.content;
            if (content !== void 0) {
              outputContent.push(content);
            }
          }
          yield yield __await(chunk);
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (!_f && !_a2 && (_b = streamResponse_1.return)) yield __await(_b.call(streamResponse_1));
        } finally {
          if (e_1) throw e_1.error;
        }
      }
      this.recordHistory(inputContent, outputContent);
    }, "processStreamResponse_1"));
  }
  recordHistory(userInput, modelOutput, automaticFunctionCallingHistory) {
    let outputContents = [];
    if (modelOutput.length > 0 && modelOutput.every((content) => content.role !== void 0)) {
      outputContents = modelOutput;
    } else {
      outputContents.push({
        role: "model",
        parts: []
      });
    }
    if (automaticFunctionCallingHistory && automaticFunctionCallingHistory.length > 0) {
      this.history.push(...extractCuratedHistory(automaticFunctionCallingHistory));
    } else {
      this.history.push(userInput);
    }
    this.history.push(...outputContents);
  }
};
var ApiError = class _ApiError extends Error {
  static {
    __name(this, "ApiError");
  }
  constructor(options) {
    super(options.message);
    this.name = "ApiError";
    this.status = options.status;
    Object.setPrototypeOf(this, _ApiError.prototype);
  }
};
function createFileParametersToMldev(fromObject) {
  const toObject = {};
  const fromFile = getValueByPath(fromObject, ["file"]);
  if (fromFile != null) {
    setValueByPath(toObject, ["file"], fromFile);
  }
  return toObject;
}
__name(createFileParametersToMldev, "createFileParametersToMldev");
function createFileResponseFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  return toObject;
}
__name(createFileResponseFromMldev, "createFileResponseFromMldev");
function deleteFileParametersToMldev(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "file"], tFileName(fromName));
  }
  return toObject;
}
__name(deleteFileParametersToMldev, "deleteFileParametersToMldev");
function deleteFileResponseFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  return toObject;
}
__name(deleteFileResponseFromMldev, "deleteFileResponseFromMldev");
function getFileParametersToMldev(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "file"], tFileName(fromName));
  }
  return toObject;
}
__name(getFileParametersToMldev, "getFileParametersToMldev");
function internalRegisterFilesParametersToMldev(fromObject) {
  const toObject = {};
  const fromUris = getValueByPath(fromObject, ["uris"]);
  if (fromUris != null) {
    setValueByPath(toObject, ["uris"], fromUris);
  }
  return toObject;
}
__name(internalRegisterFilesParametersToMldev, "internalRegisterFilesParametersToMldev");
function listFilesConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
  if (parentObject !== void 0 && fromPageSize != null) {
    setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
  }
  const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
  if (parentObject !== void 0 && fromPageToken != null) {
    setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
  }
  return toObject;
}
__name(listFilesConfigToMldev, "listFilesConfigToMldev");
function listFilesParametersToMldev(fromObject) {
  const toObject = {};
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    listFilesConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(listFilesParametersToMldev, "listFilesParametersToMldev");
function listFilesResponseFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromNextPageToken = getValueByPath(fromObject, [
    "nextPageToken"
  ]);
  if (fromNextPageToken != null) {
    setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
  }
  const fromFiles = getValueByPath(fromObject, ["files"]);
  if (fromFiles != null) {
    let transformedList = fromFiles;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["files"], transformedList);
  }
  return toObject;
}
__name(listFilesResponseFromMldev, "listFilesResponseFromMldev");
function registerFilesResponseFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromFiles = getValueByPath(fromObject, ["files"]);
  if (fromFiles != null) {
    let transformedList = fromFiles;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["files"], transformedList);
  }
  return toObject;
}
__name(registerFilesResponseFromMldev, "registerFilesResponseFromMldev");
var Files = class extends BaseModule {
  static {
    __name(this, "Files");
  }
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
    this.list = async (params = {}) => {
      return new Pager(PagedItem.PAGED_ITEM_FILES, (x) => this.listInternal(x), await this.listInternal(params), params);
    };
  }
  /**
   * Uploads a file asynchronously to the Gemini API.
   * This method is not available in Vertex AI.
   * Supported upload sources:
   * - Node.js: File path (string) or Blob object.
   * - Browser: Blob object (e.g., File).
   *
   * @remarks
   * The `mimeType` can be specified in the `config` parameter. If omitted:
   *  - For file path (string) inputs, the `mimeType` will be inferred from the
   *     file extension.
   *  - For Blob object inputs, the `mimeType` will be set to the Blob's `type`
   *     property.
   * Somex eamples for file extension to mimeType mapping:
   * .txt -> text/plain
   * .json -> application/json
   * .jpg  -> image/jpeg
   * .png -> image/png
   * .mp3 -> audio/mpeg
   * .mp4 -> video/mp4
   *
   * This section can contain multiple paragraphs and code examples.
   *
   * @param params - Optional parameters specified in the
   *        `types.UploadFileParameters` interface.
   *         @see {@link types.UploadFileParameters#config} for the optional
   *         config in the parameters.
   * @return A promise that resolves to a `types.File` object.
   * @throws An error if called on a Vertex AI client.
   * @throws An error if the `mimeType` is not provided and can not be inferred,
   * the `mimeType` can be provided in the `params.config` parameter.
   * @throws An error occurs if a suitable upload location cannot be established.
   *
   * @example
   * The following code uploads a file to Gemini API.
   *
   * ```ts
   * const file = await ai.files.upload({file: 'file.txt', config: {
   *   mimeType: 'text/plain',
   * }});
   * console.log(file.name);
   * ```
   */
  async upload(params) {
    if (this.apiClient.isVertexAI()) {
      throw new Error("Vertex AI does not support uploading files. You can share files through a GCS bucket.");
    }
    return this.apiClient.uploadFile(params.file, params.config).then((resp) => {
      return resp;
    });
  }
  /**
   * Downloads a remotely stored file asynchronously to a location specified in
   * the `params` object. This method only works on Node environment, to
   * download files in the browser, use a browser compliant method like an <a>
   * tag.
   *
   * @param params - The parameters for the download request.
   *
   * @example
   * The following code downloads an example file named "files/mehozpxf877d" as
   * "file.txt".
   *
   * ```ts
   * await ai.files.download({file: file.name, downloadPath: 'file.txt'});
   * ```
   */
  async download(params) {
    await this.apiClient.downloadFile(params);
  }
  /**
   * Registers Google Cloud Storage files for use with the API.
   * This method is only available in Node.js environments.
   */
  async registerFiles(params) {
    throw new Error("registerFiles is only supported in Node.js environments.");
  }
  async _registerFiles(params) {
    return this.registerFilesInternal(params);
  }
  async listInternal(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = listFilesParametersToMldev(params);
      path2 = formatMap("files", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = listFilesResponseFromMldev(apiResponse);
        const typedResp = new ListFilesResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  async createInternal(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = createFileParametersToMldev(params);
      path2 = formatMap("upload/v1beta/files", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = createFileResponseFromMldev(apiResponse);
        const typedResp = new CreateFileResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  /**
   * Retrieves the file information from the service.
   *
   * @param params - The parameters for the get request
   * @return The Promise that resolves to the types.File object requested.
   *
   * @example
   * ```ts
   * const config: GetFileParameters = {
   *   name: fileName,
   * };
   * file = await ai.files.get(config);
   * console.log(file.name);
   * ```
   */
  async get(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = getFileParametersToMldev(params);
      path2 = formatMap("files/{file}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((resp) => {
        return resp;
      });
    }
  }
  /**
   * Deletes a remotely stored file.
   *
   * @param params - The parameters for the delete request.
   * @return The DeleteFileResponse, the response for the delete method.
   *
   * @example
   * The following code deletes an example file named "files/mehozpxf877d".
   *
   * ```ts
   * await ai.files.delete({name: file.name});
   * ```
   */
  async delete(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = deleteFileParametersToMldev(params);
      path2 = formatMap("files/{file}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "DELETE",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = deleteFileResponseFromMldev(apiResponse);
        const typedResp = new DeleteFileResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  async registerFilesInternal(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = internalRegisterFilesParametersToMldev(params);
      path2 = formatMap("files:register", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = registerFilesResponseFromMldev(apiResponse);
        const typedResp = new RegisterFilesResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
};
function blobToMldev$2(fromObject) {
  const toObject = {};
  const fromData = getValueByPath(fromObject, ["data"]);
  if (fromData != null) {
    setValueByPath(toObject, ["data"], fromData);
  }
  if (getValueByPath(fromObject, ["displayName"]) !== void 0) {
    throw new Error("displayName parameter is not supported in Gemini API.");
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(blobToMldev$2, "blobToMldev$2");
function contentToMldev$2(fromObject) {
  const toObject = {};
  const fromParts = getValueByPath(fromObject, ["parts"]);
  if (fromParts != null) {
    let transformedList = fromParts;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return partToMldev$2(item);
      });
    }
    setValueByPath(toObject, ["parts"], transformedList);
  }
  const fromRole = getValueByPath(fromObject, ["role"]);
  if (fromRole != null) {
    setValueByPath(toObject, ["role"], fromRole);
  }
  return toObject;
}
__name(contentToMldev$2, "contentToMldev$2");
function fileDataToMldev$2(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["displayName"]) !== void 0) {
    throw new Error("displayName parameter is not supported in Gemini API.");
  }
  const fromFileUri = getValueByPath(fromObject, ["fileUri"]);
  if (fromFileUri != null) {
    setValueByPath(toObject, ["fileUri"], fromFileUri);
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(fileDataToMldev$2, "fileDataToMldev$2");
function functionCallToMldev$2(fromObject) {
  const toObject = {};
  const fromId = getValueByPath(fromObject, ["id"]);
  if (fromId != null) {
    setValueByPath(toObject, ["id"], fromId);
  }
  const fromArgs = getValueByPath(fromObject, ["args"]);
  if (fromArgs != null) {
    setValueByPath(toObject, ["args"], fromArgs);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  if (getValueByPath(fromObject, ["partialArgs"]) !== void 0) {
    throw new Error("partialArgs parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["willContinue"]) !== void 0) {
    throw new Error("willContinue parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(functionCallToMldev$2, "functionCallToMldev$2");
function functionDeclarationToVertex$1(fromObject) {
  const toObject = {};
  const fromDescription = getValueByPath(fromObject, ["description"]);
  if (fromDescription != null) {
    setValueByPath(toObject, ["description"], fromDescription);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromParameters = getValueByPath(fromObject, ["parameters"]);
  if (fromParameters != null) {
    setValueByPath(toObject, ["parameters"], fromParameters);
  }
  const fromParametersJsonSchema = getValueByPath(fromObject, [
    "parametersJsonSchema"
  ]);
  if (fromParametersJsonSchema != null) {
    setValueByPath(toObject, ["parametersJsonSchema"], fromParametersJsonSchema);
  }
  const fromResponse = getValueByPath(fromObject, ["response"]);
  if (fromResponse != null) {
    setValueByPath(toObject, ["response"], fromResponse);
  }
  const fromResponseJsonSchema = getValueByPath(fromObject, [
    "responseJsonSchema"
  ]);
  if (fromResponseJsonSchema != null) {
    setValueByPath(toObject, ["responseJsonSchema"], fromResponseJsonSchema);
  }
  if (getValueByPath(fromObject, ["behavior"]) !== void 0) {
    throw new Error("behavior parameter is not supported in Vertex AI.");
  }
  return toObject;
}
__name(functionDeclarationToVertex$1, "functionDeclarationToVertex$1");
function generationConfigToVertex$1(fromObject) {
  const toObject = {};
  const fromModelSelectionConfig = getValueByPath(fromObject, [
    "modelSelectionConfig"
  ]);
  if (fromModelSelectionConfig != null) {
    setValueByPath(toObject, ["modelConfig"], fromModelSelectionConfig);
  }
  const fromResponseJsonSchema = getValueByPath(fromObject, [
    "responseJsonSchema"
  ]);
  if (fromResponseJsonSchema != null) {
    setValueByPath(toObject, ["responseJsonSchema"], fromResponseJsonSchema);
  }
  const fromAudioTimestamp = getValueByPath(fromObject, [
    "audioTimestamp"
  ]);
  if (fromAudioTimestamp != null) {
    setValueByPath(toObject, ["audioTimestamp"], fromAudioTimestamp);
  }
  const fromCandidateCount = getValueByPath(fromObject, [
    "candidateCount"
  ]);
  if (fromCandidateCount != null) {
    setValueByPath(toObject, ["candidateCount"], fromCandidateCount);
  }
  const fromEnableAffectiveDialog = getValueByPath(fromObject, [
    "enableAffectiveDialog"
  ]);
  if (fromEnableAffectiveDialog != null) {
    setValueByPath(toObject, ["enableAffectiveDialog"], fromEnableAffectiveDialog);
  }
  const fromFrequencyPenalty = getValueByPath(fromObject, [
    "frequencyPenalty"
  ]);
  if (fromFrequencyPenalty != null) {
    setValueByPath(toObject, ["frequencyPenalty"], fromFrequencyPenalty);
  }
  const fromLogprobs = getValueByPath(fromObject, ["logprobs"]);
  if (fromLogprobs != null) {
    setValueByPath(toObject, ["logprobs"], fromLogprobs);
  }
  const fromMaxOutputTokens = getValueByPath(fromObject, [
    "maxOutputTokens"
  ]);
  if (fromMaxOutputTokens != null) {
    setValueByPath(toObject, ["maxOutputTokens"], fromMaxOutputTokens);
  }
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (fromMediaResolution != null) {
    setValueByPath(toObject, ["mediaResolution"], fromMediaResolution);
  }
  const fromPresencePenalty = getValueByPath(fromObject, [
    "presencePenalty"
  ]);
  if (fromPresencePenalty != null) {
    setValueByPath(toObject, ["presencePenalty"], fromPresencePenalty);
  }
  const fromResponseLogprobs = getValueByPath(fromObject, [
    "responseLogprobs"
  ]);
  if (fromResponseLogprobs != null) {
    setValueByPath(toObject, ["responseLogprobs"], fromResponseLogprobs);
  }
  const fromResponseMimeType = getValueByPath(fromObject, [
    "responseMimeType"
  ]);
  if (fromResponseMimeType != null) {
    setValueByPath(toObject, ["responseMimeType"], fromResponseMimeType);
  }
  const fromResponseModalities = getValueByPath(fromObject, [
    "responseModalities"
  ]);
  if (fromResponseModalities != null) {
    setValueByPath(toObject, ["responseModalities"], fromResponseModalities);
  }
  const fromResponseSchema = getValueByPath(fromObject, [
    "responseSchema"
  ]);
  if (fromResponseSchema != null) {
    setValueByPath(toObject, ["responseSchema"], fromResponseSchema);
  }
  const fromRoutingConfig = getValueByPath(fromObject, [
    "routingConfig"
  ]);
  if (fromRoutingConfig != null) {
    setValueByPath(toObject, ["routingConfig"], fromRoutingConfig);
  }
  const fromSeed = getValueByPath(fromObject, ["seed"]);
  if (fromSeed != null) {
    setValueByPath(toObject, ["seed"], fromSeed);
  }
  const fromSpeechConfig = getValueByPath(fromObject, ["speechConfig"]);
  if (fromSpeechConfig != null) {
    setValueByPath(toObject, ["speechConfig"], fromSpeechConfig);
  }
  const fromStopSequences = getValueByPath(fromObject, [
    "stopSequences"
  ]);
  if (fromStopSequences != null) {
    setValueByPath(toObject, ["stopSequences"], fromStopSequences);
  }
  const fromTemperature = getValueByPath(fromObject, ["temperature"]);
  if (fromTemperature != null) {
    setValueByPath(toObject, ["temperature"], fromTemperature);
  }
  const fromThinkingConfig = getValueByPath(fromObject, [
    "thinkingConfig"
  ]);
  if (fromThinkingConfig != null) {
    setValueByPath(toObject, ["thinkingConfig"], fromThinkingConfig);
  }
  const fromTopK = getValueByPath(fromObject, ["topK"]);
  if (fromTopK != null) {
    setValueByPath(toObject, ["topK"], fromTopK);
  }
  const fromTopP = getValueByPath(fromObject, ["topP"]);
  if (fromTopP != null) {
    setValueByPath(toObject, ["topP"], fromTopP);
  }
  if (getValueByPath(fromObject, ["enableEnhancedCivicAnswers"]) !== void 0) {
    throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  }
  return toObject;
}
__name(generationConfigToVertex$1, "generationConfigToVertex$1");
function googleMapsToMldev$2(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["authConfig"]) !== void 0) {
    throw new Error("authConfig parameter is not supported in Gemini API.");
  }
  const fromEnableWidget = getValueByPath(fromObject, ["enableWidget"]);
  if (fromEnableWidget != null) {
    setValueByPath(toObject, ["enableWidget"], fromEnableWidget);
  }
  return toObject;
}
__name(googleMapsToMldev$2, "googleMapsToMldev$2");
function googleSearchToMldev$2(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["excludeDomains"]) !== void 0) {
    throw new Error("excludeDomains parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["blockingConfidence"]) !== void 0) {
    throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  }
  const fromTimeRangeFilter = getValueByPath(fromObject, [
    "timeRangeFilter"
  ]);
  if (fromTimeRangeFilter != null) {
    setValueByPath(toObject, ["timeRangeFilter"], fromTimeRangeFilter);
  }
  return toObject;
}
__name(googleSearchToMldev$2, "googleSearchToMldev$2");
function liveConnectConfigToMldev$1(fromObject, parentObject) {
  const toObject = {};
  const fromGenerationConfig = getValueByPath(fromObject, [
    "generationConfig"
  ]);
  if (parentObject !== void 0 && fromGenerationConfig != null) {
    setValueByPath(parentObject, ["setup", "generationConfig"], fromGenerationConfig);
  }
  const fromResponseModalities = getValueByPath(fromObject, [
    "responseModalities"
  ]);
  if (parentObject !== void 0 && fromResponseModalities != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "responseModalities"], fromResponseModalities);
  }
  const fromTemperature = getValueByPath(fromObject, ["temperature"]);
  if (parentObject !== void 0 && fromTemperature != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "temperature"], fromTemperature);
  }
  const fromTopP = getValueByPath(fromObject, ["topP"]);
  if (parentObject !== void 0 && fromTopP != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "topP"], fromTopP);
  }
  const fromTopK = getValueByPath(fromObject, ["topK"]);
  if (parentObject !== void 0 && fromTopK != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "topK"], fromTopK);
  }
  const fromMaxOutputTokens = getValueByPath(fromObject, [
    "maxOutputTokens"
  ]);
  if (parentObject !== void 0 && fromMaxOutputTokens != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "maxOutputTokens"], fromMaxOutputTokens);
  }
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (parentObject !== void 0 && fromMediaResolution != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "mediaResolution"], fromMediaResolution);
  }
  const fromSeed = getValueByPath(fromObject, ["seed"]);
  if (parentObject !== void 0 && fromSeed != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "seed"], fromSeed);
  }
  const fromSpeechConfig = getValueByPath(fromObject, ["speechConfig"]);
  if (parentObject !== void 0 && fromSpeechConfig != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "speechConfig"], tLiveSpeechConfig(fromSpeechConfig));
  }
  const fromThinkingConfig = getValueByPath(fromObject, [
    "thinkingConfig"
  ]);
  if (parentObject !== void 0 && fromThinkingConfig != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "thinkingConfig"], fromThinkingConfig);
  }
  const fromEnableAffectiveDialog = getValueByPath(fromObject, [
    "enableAffectiveDialog"
  ]);
  if (parentObject !== void 0 && fromEnableAffectiveDialog != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "enableAffectiveDialog"], fromEnableAffectiveDialog);
  }
  const fromSystemInstruction = getValueByPath(fromObject, [
    "systemInstruction"
  ]);
  if (parentObject !== void 0 && fromSystemInstruction != null) {
    setValueByPath(parentObject, ["setup", "systemInstruction"], contentToMldev$2(tContent(fromSystemInstruction)));
  }
  const fromTools = getValueByPath(fromObject, ["tools"]);
  if (parentObject !== void 0 && fromTools != null) {
    let transformedList = tTools(fromTools);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return toolToMldev$2(tTool(item));
      });
    }
    setValueByPath(parentObject, ["setup", "tools"], transformedList);
  }
  const fromSessionResumption = getValueByPath(fromObject, [
    "sessionResumption"
  ]);
  if (parentObject !== void 0 && fromSessionResumption != null) {
    setValueByPath(parentObject, ["setup", "sessionResumption"], sessionResumptionConfigToMldev$1(fromSessionResumption));
  }
  const fromInputAudioTranscription = getValueByPath(fromObject, [
    "inputAudioTranscription"
  ]);
  if (parentObject !== void 0 && fromInputAudioTranscription != null) {
    setValueByPath(parentObject, ["setup", "inputAudioTranscription"], fromInputAudioTranscription);
  }
  const fromOutputAudioTranscription = getValueByPath(fromObject, [
    "outputAudioTranscription"
  ]);
  if (parentObject !== void 0 && fromOutputAudioTranscription != null) {
    setValueByPath(parentObject, ["setup", "outputAudioTranscription"], fromOutputAudioTranscription);
  }
  const fromRealtimeInputConfig = getValueByPath(fromObject, [
    "realtimeInputConfig"
  ]);
  if (parentObject !== void 0 && fromRealtimeInputConfig != null) {
    setValueByPath(parentObject, ["setup", "realtimeInputConfig"], fromRealtimeInputConfig);
  }
  const fromContextWindowCompression = getValueByPath(fromObject, [
    "contextWindowCompression"
  ]);
  if (parentObject !== void 0 && fromContextWindowCompression != null) {
    setValueByPath(parentObject, ["setup", "contextWindowCompression"], fromContextWindowCompression);
  }
  const fromProactivity = getValueByPath(fromObject, ["proactivity"]);
  if (parentObject !== void 0 && fromProactivity != null) {
    setValueByPath(parentObject, ["setup", "proactivity"], fromProactivity);
  }
  if (getValueByPath(fromObject, ["explicitVadSignal"]) !== void 0) {
    throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(liveConnectConfigToMldev$1, "liveConnectConfigToMldev$1");
function liveConnectConfigToVertex(fromObject, parentObject) {
  const toObject = {};
  const fromGenerationConfig = getValueByPath(fromObject, [
    "generationConfig"
  ]);
  if (parentObject !== void 0 && fromGenerationConfig != null) {
    setValueByPath(parentObject, ["setup", "generationConfig"], generationConfigToVertex$1(fromGenerationConfig));
  }
  const fromResponseModalities = getValueByPath(fromObject, [
    "responseModalities"
  ]);
  if (parentObject !== void 0 && fromResponseModalities != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "responseModalities"], fromResponseModalities);
  }
  const fromTemperature = getValueByPath(fromObject, ["temperature"]);
  if (parentObject !== void 0 && fromTemperature != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "temperature"], fromTemperature);
  }
  const fromTopP = getValueByPath(fromObject, ["topP"]);
  if (parentObject !== void 0 && fromTopP != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "topP"], fromTopP);
  }
  const fromTopK = getValueByPath(fromObject, ["topK"]);
  if (parentObject !== void 0 && fromTopK != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "topK"], fromTopK);
  }
  const fromMaxOutputTokens = getValueByPath(fromObject, [
    "maxOutputTokens"
  ]);
  if (parentObject !== void 0 && fromMaxOutputTokens != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "maxOutputTokens"], fromMaxOutputTokens);
  }
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (parentObject !== void 0 && fromMediaResolution != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "mediaResolution"], fromMediaResolution);
  }
  const fromSeed = getValueByPath(fromObject, ["seed"]);
  if (parentObject !== void 0 && fromSeed != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "seed"], fromSeed);
  }
  const fromSpeechConfig = getValueByPath(fromObject, ["speechConfig"]);
  if (parentObject !== void 0 && fromSpeechConfig != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "speechConfig"], tLiveSpeechConfig(fromSpeechConfig));
  }
  const fromThinkingConfig = getValueByPath(fromObject, [
    "thinkingConfig"
  ]);
  if (parentObject !== void 0 && fromThinkingConfig != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "thinkingConfig"], fromThinkingConfig);
  }
  const fromEnableAffectiveDialog = getValueByPath(fromObject, [
    "enableAffectiveDialog"
  ]);
  if (parentObject !== void 0 && fromEnableAffectiveDialog != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "enableAffectiveDialog"], fromEnableAffectiveDialog);
  }
  const fromSystemInstruction = getValueByPath(fromObject, [
    "systemInstruction"
  ]);
  if (parentObject !== void 0 && fromSystemInstruction != null) {
    setValueByPath(parentObject, ["setup", "systemInstruction"], tContent(fromSystemInstruction));
  }
  const fromTools = getValueByPath(fromObject, ["tools"]);
  if (parentObject !== void 0 && fromTools != null) {
    let transformedList = tTools(fromTools);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return toolToVertex$1(tTool(item));
      });
    }
    setValueByPath(parentObject, ["setup", "tools"], transformedList);
  }
  const fromSessionResumption = getValueByPath(fromObject, [
    "sessionResumption"
  ]);
  if (parentObject !== void 0 && fromSessionResumption != null) {
    setValueByPath(parentObject, ["setup", "sessionResumption"], fromSessionResumption);
  }
  const fromInputAudioTranscription = getValueByPath(fromObject, [
    "inputAudioTranscription"
  ]);
  if (parentObject !== void 0 && fromInputAudioTranscription != null) {
    setValueByPath(parentObject, ["setup", "inputAudioTranscription"], fromInputAudioTranscription);
  }
  const fromOutputAudioTranscription = getValueByPath(fromObject, [
    "outputAudioTranscription"
  ]);
  if (parentObject !== void 0 && fromOutputAudioTranscription != null) {
    setValueByPath(parentObject, ["setup", "outputAudioTranscription"], fromOutputAudioTranscription);
  }
  const fromRealtimeInputConfig = getValueByPath(fromObject, [
    "realtimeInputConfig"
  ]);
  if (parentObject !== void 0 && fromRealtimeInputConfig != null) {
    setValueByPath(parentObject, ["setup", "realtimeInputConfig"], fromRealtimeInputConfig);
  }
  const fromContextWindowCompression = getValueByPath(fromObject, [
    "contextWindowCompression"
  ]);
  if (parentObject !== void 0 && fromContextWindowCompression != null) {
    setValueByPath(parentObject, ["setup", "contextWindowCompression"], fromContextWindowCompression);
  }
  const fromProactivity = getValueByPath(fromObject, ["proactivity"]);
  if (parentObject !== void 0 && fromProactivity != null) {
    setValueByPath(parentObject, ["setup", "proactivity"], fromProactivity);
  }
  const fromExplicitVadSignal = getValueByPath(fromObject, [
    "explicitVadSignal"
  ]);
  if (parentObject !== void 0 && fromExplicitVadSignal != null) {
    setValueByPath(parentObject, ["setup", "explicitVadSignal"], fromExplicitVadSignal);
  }
  return toObject;
}
__name(liveConnectConfigToVertex, "liveConnectConfigToVertex");
function liveConnectParametersToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["setup", "model"], tModel(apiClient, fromModel));
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    setValueByPath(toObject, ["config"], liveConnectConfigToMldev$1(fromConfig, toObject));
  }
  return toObject;
}
__name(liveConnectParametersToMldev, "liveConnectParametersToMldev");
function liveConnectParametersToVertex(apiClient, fromObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["setup", "model"], tModel(apiClient, fromModel));
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    setValueByPath(toObject, ["config"], liveConnectConfigToVertex(fromConfig, toObject));
  }
  return toObject;
}
__name(liveConnectParametersToVertex, "liveConnectParametersToVertex");
function liveMusicSetConfigParametersToMldev(fromObject) {
  const toObject = {};
  const fromMusicGenerationConfig = getValueByPath(fromObject, [
    "musicGenerationConfig"
  ]);
  if (fromMusicGenerationConfig != null) {
    setValueByPath(toObject, ["musicGenerationConfig"], fromMusicGenerationConfig);
  }
  return toObject;
}
__name(liveMusicSetConfigParametersToMldev, "liveMusicSetConfigParametersToMldev");
function liveMusicSetWeightedPromptsParametersToMldev(fromObject) {
  const toObject = {};
  const fromWeightedPrompts = getValueByPath(fromObject, [
    "weightedPrompts"
  ]);
  if (fromWeightedPrompts != null) {
    let transformedList = fromWeightedPrompts;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["weightedPrompts"], transformedList);
  }
  return toObject;
}
__name(liveMusicSetWeightedPromptsParametersToMldev, "liveMusicSetWeightedPromptsParametersToMldev");
function liveSendRealtimeInputParametersToMldev(fromObject) {
  const toObject = {};
  const fromMedia = getValueByPath(fromObject, ["media"]);
  if (fromMedia != null) {
    let transformedList = tBlobs(fromMedia);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return blobToMldev$2(item);
      });
    }
    setValueByPath(toObject, ["mediaChunks"], transformedList);
  }
  const fromAudio = getValueByPath(fromObject, ["audio"]);
  if (fromAudio != null) {
    setValueByPath(toObject, ["audio"], blobToMldev$2(tAudioBlob(fromAudio)));
  }
  const fromAudioStreamEnd = getValueByPath(fromObject, [
    "audioStreamEnd"
  ]);
  if (fromAudioStreamEnd != null) {
    setValueByPath(toObject, ["audioStreamEnd"], fromAudioStreamEnd);
  }
  const fromVideo = getValueByPath(fromObject, ["video"]);
  if (fromVideo != null) {
    setValueByPath(toObject, ["video"], blobToMldev$2(tImageBlob(fromVideo)));
  }
  const fromText = getValueByPath(fromObject, ["text"]);
  if (fromText != null) {
    setValueByPath(toObject, ["text"], fromText);
  }
  const fromActivityStart = getValueByPath(fromObject, [
    "activityStart"
  ]);
  if (fromActivityStart != null) {
    setValueByPath(toObject, ["activityStart"], fromActivityStart);
  }
  const fromActivityEnd = getValueByPath(fromObject, ["activityEnd"]);
  if (fromActivityEnd != null) {
    setValueByPath(toObject, ["activityEnd"], fromActivityEnd);
  }
  return toObject;
}
__name(liveSendRealtimeInputParametersToMldev, "liveSendRealtimeInputParametersToMldev");
function liveSendRealtimeInputParametersToVertex(fromObject) {
  const toObject = {};
  const fromMedia = getValueByPath(fromObject, ["media"]);
  if (fromMedia != null) {
    let transformedList = tBlobs(fromMedia);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["mediaChunks"], transformedList);
  }
  const fromAudio = getValueByPath(fromObject, ["audio"]);
  if (fromAudio != null) {
    setValueByPath(toObject, ["audio"], tAudioBlob(fromAudio));
  }
  const fromAudioStreamEnd = getValueByPath(fromObject, [
    "audioStreamEnd"
  ]);
  if (fromAudioStreamEnd != null) {
    setValueByPath(toObject, ["audioStreamEnd"], fromAudioStreamEnd);
  }
  const fromVideo = getValueByPath(fromObject, ["video"]);
  if (fromVideo != null) {
    setValueByPath(toObject, ["video"], tImageBlob(fromVideo));
  }
  const fromText = getValueByPath(fromObject, ["text"]);
  if (fromText != null) {
    setValueByPath(toObject, ["text"], fromText);
  }
  const fromActivityStart = getValueByPath(fromObject, [
    "activityStart"
  ]);
  if (fromActivityStart != null) {
    setValueByPath(toObject, ["activityStart"], fromActivityStart);
  }
  const fromActivityEnd = getValueByPath(fromObject, ["activityEnd"]);
  if (fromActivityEnd != null) {
    setValueByPath(toObject, ["activityEnd"], fromActivityEnd);
  }
  return toObject;
}
__name(liveSendRealtimeInputParametersToVertex, "liveSendRealtimeInputParametersToVertex");
function liveServerMessageFromVertex(fromObject) {
  const toObject = {};
  const fromSetupComplete = getValueByPath(fromObject, [
    "setupComplete"
  ]);
  if (fromSetupComplete != null) {
    setValueByPath(toObject, ["setupComplete"], fromSetupComplete);
  }
  const fromServerContent = getValueByPath(fromObject, [
    "serverContent"
  ]);
  if (fromServerContent != null) {
    setValueByPath(toObject, ["serverContent"], fromServerContent);
  }
  const fromToolCall = getValueByPath(fromObject, ["toolCall"]);
  if (fromToolCall != null) {
    setValueByPath(toObject, ["toolCall"], fromToolCall);
  }
  const fromToolCallCancellation = getValueByPath(fromObject, [
    "toolCallCancellation"
  ]);
  if (fromToolCallCancellation != null) {
    setValueByPath(toObject, ["toolCallCancellation"], fromToolCallCancellation);
  }
  const fromUsageMetadata = getValueByPath(fromObject, [
    "usageMetadata"
  ]);
  if (fromUsageMetadata != null) {
    setValueByPath(toObject, ["usageMetadata"], usageMetadataFromVertex(fromUsageMetadata));
  }
  const fromGoAway = getValueByPath(fromObject, ["goAway"]);
  if (fromGoAway != null) {
    setValueByPath(toObject, ["goAway"], fromGoAway);
  }
  const fromSessionResumptionUpdate = getValueByPath(fromObject, [
    "sessionResumptionUpdate"
  ]);
  if (fromSessionResumptionUpdate != null) {
    setValueByPath(toObject, ["sessionResumptionUpdate"], fromSessionResumptionUpdate);
  }
  const fromVoiceActivityDetectionSignal = getValueByPath(fromObject, [
    "voiceActivityDetectionSignal"
  ]);
  if (fromVoiceActivityDetectionSignal != null) {
    setValueByPath(toObject, ["voiceActivityDetectionSignal"], fromVoiceActivityDetectionSignal);
  }
  const fromVoiceActivity = getValueByPath(fromObject, [
    "voiceActivity"
  ]);
  if (fromVoiceActivity != null) {
    setValueByPath(toObject, ["voiceActivity"], voiceActivityFromVertex(fromVoiceActivity));
  }
  return toObject;
}
__name(liveServerMessageFromVertex, "liveServerMessageFromVertex");
function partToMldev$2(fromObject) {
  const toObject = {};
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (fromMediaResolution != null) {
    setValueByPath(toObject, ["mediaResolution"], fromMediaResolution);
  }
  const fromCodeExecutionResult = getValueByPath(fromObject, [
    "codeExecutionResult"
  ]);
  if (fromCodeExecutionResult != null) {
    setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
  }
  const fromExecutableCode = getValueByPath(fromObject, [
    "executableCode"
  ]);
  if (fromExecutableCode != null) {
    setValueByPath(toObject, ["executableCode"], fromExecutableCode);
  }
  const fromFileData = getValueByPath(fromObject, ["fileData"]);
  if (fromFileData != null) {
    setValueByPath(toObject, ["fileData"], fileDataToMldev$2(fromFileData));
  }
  const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
  if (fromFunctionCall != null) {
    setValueByPath(toObject, ["functionCall"], functionCallToMldev$2(fromFunctionCall));
  }
  const fromFunctionResponse = getValueByPath(fromObject, [
    "functionResponse"
  ]);
  if (fromFunctionResponse != null) {
    setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
  }
  const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
  if (fromInlineData != null) {
    setValueByPath(toObject, ["inlineData"], blobToMldev$2(fromInlineData));
  }
  const fromText = getValueByPath(fromObject, ["text"]);
  if (fromText != null) {
    setValueByPath(toObject, ["text"], fromText);
  }
  const fromThought = getValueByPath(fromObject, ["thought"]);
  if (fromThought != null) {
    setValueByPath(toObject, ["thought"], fromThought);
  }
  const fromThoughtSignature = getValueByPath(fromObject, [
    "thoughtSignature"
  ]);
  if (fromThoughtSignature != null) {
    setValueByPath(toObject, ["thoughtSignature"], fromThoughtSignature);
  }
  const fromVideoMetadata = getValueByPath(fromObject, [
    "videoMetadata"
  ]);
  if (fromVideoMetadata != null) {
    setValueByPath(toObject, ["videoMetadata"], fromVideoMetadata);
  }
  return toObject;
}
__name(partToMldev$2, "partToMldev$2");
function sessionResumptionConfigToMldev$1(fromObject) {
  const toObject = {};
  const fromHandle = getValueByPath(fromObject, ["handle"]);
  if (fromHandle != null) {
    setValueByPath(toObject, ["handle"], fromHandle);
  }
  if (getValueByPath(fromObject, ["transparent"]) !== void 0) {
    throw new Error("transparent parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(sessionResumptionConfigToMldev$1, "sessionResumptionConfigToMldev$1");
function toolToMldev$2(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["retrieval"]) !== void 0) {
    throw new Error("retrieval parameter is not supported in Gemini API.");
  }
  const fromComputerUse = getValueByPath(fromObject, ["computerUse"]);
  if (fromComputerUse != null) {
    setValueByPath(toObject, ["computerUse"], fromComputerUse);
  }
  const fromFileSearch = getValueByPath(fromObject, ["fileSearch"]);
  if (fromFileSearch != null) {
    setValueByPath(toObject, ["fileSearch"], fromFileSearch);
  }
  const fromCodeExecution = getValueByPath(fromObject, [
    "codeExecution"
  ]);
  if (fromCodeExecution != null) {
    setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
  }
  if (getValueByPath(fromObject, ["enterpriseWebSearch"]) !== void 0) {
    throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  }
  const fromFunctionDeclarations = getValueByPath(fromObject, [
    "functionDeclarations"
  ]);
  if (fromFunctionDeclarations != null) {
    let transformedList = fromFunctionDeclarations;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["functionDeclarations"], transformedList);
  }
  const fromGoogleMaps = getValueByPath(fromObject, ["googleMaps"]);
  if (fromGoogleMaps != null) {
    setValueByPath(toObject, ["googleMaps"], googleMapsToMldev$2(fromGoogleMaps));
  }
  const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
  if (fromGoogleSearch != null) {
    setValueByPath(toObject, ["googleSearch"], googleSearchToMldev$2(fromGoogleSearch));
  }
  const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
    "googleSearchRetrieval"
  ]);
  if (fromGoogleSearchRetrieval != null) {
    setValueByPath(toObject, ["googleSearchRetrieval"], fromGoogleSearchRetrieval);
  }
  const fromUrlContext = getValueByPath(fromObject, ["urlContext"]);
  if (fromUrlContext != null) {
    setValueByPath(toObject, ["urlContext"], fromUrlContext);
  }
  return toObject;
}
__name(toolToMldev$2, "toolToMldev$2");
function toolToVertex$1(fromObject) {
  const toObject = {};
  const fromRetrieval = getValueByPath(fromObject, ["retrieval"]);
  if (fromRetrieval != null) {
    setValueByPath(toObject, ["retrieval"], fromRetrieval);
  }
  const fromComputerUse = getValueByPath(fromObject, ["computerUse"]);
  if (fromComputerUse != null) {
    setValueByPath(toObject, ["computerUse"], fromComputerUse);
  }
  if (getValueByPath(fromObject, ["fileSearch"]) !== void 0) {
    throw new Error("fileSearch parameter is not supported in Vertex AI.");
  }
  const fromCodeExecution = getValueByPath(fromObject, [
    "codeExecution"
  ]);
  if (fromCodeExecution != null) {
    setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
  }
  const fromEnterpriseWebSearch = getValueByPath(fromObject, [
    "enterpriseWebSearch"
  ]);
  if (fromEnterpriseWebSearch != null) {
    setValueByPath(toObject, ["enterpriseWebSearch"], fromEnterpriseWebSearch);
  }
  const fromFunctionDeclarations = getValueByPath(fromObject, [
    "functionDeclarations"
  ]);
  if (fromFunctionDeclarations != null) {
    let transformedList = fromFunctionDeclarations;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return functionDeclarationToVertex$1(item);
      });
    }
    setValueByPath(toObject, ["functionDeclarations"], transformedList);
  }
  const fromGoogleMaps = getValueByPath(fromObject, ["googleMaps"]);
  if (fromGoogleMaps != null) {
    setValueByPath(toObject, ["googleMaps"], fromGoogleMaps);
  }
  const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
  if (fromGoogleSearch != null) {
    setValueByPath(toObject, ["googleSearch"], fromGoogleSearch);
  }
  const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
    "googleSearchRetrieval"
  ]);
  if (fromGoogleSearchRetrieval != null) {
    setValueByPath(toObject, ["googleSearchRetrieval"], fromGoogleSearchRetrieval);
  }
  const fromUrlContext = getValueByPath(fromObject, ["urlContext"]);
  if (fromUrlContext != null) {
    setValueByPath(toObject, ["urlContext"], fromUrlContext);
  }
  return toObject;
}
__name(toolToVertex$1, "toolToVertex$1");
function usageMetadataFromVertex(fromObject) {
  const toObject = {};
  const fromPromptTokenCount = getValueByPath(fromObject, [
    "promptTokenCount"
  ]);
  if (fromPromptTokenCount != null) {
    setValueByPath(toObject, ["promptTokenCount"], fromPromptTokenCount);
  }
  const fromCachedContentTokenCount = getValueByPath(fromObject, [
    "cachedContentTokenCount"
  ]);
  if (fromCachedContentTokenCount != null) {
    setValueByPath(toObject, ["cachedContentTokenCount"], fromCachedContentTokenCount);
  }
  const fromResponseTokenCount = getValueByPath(fromObject, [
    "candidatesTokenCount"
  ]);
  if (fromResponseTokenCount != null) {
    setValueByPath(toObject, ["responseTokenCount"], fromResponseTokenCount);
  }
  const fromToolUsePromptTokenCount = getValueByPath(fromObject, [
    "toolUsePromptTokenCount"
  ]);
  if (fromToolUsePromptTokenCount != null) {
    setValueByPath(toObject, ["toolUsePromptTokenCount"], fromToolUsePromptTokenCount);
  }
  const fromThoughtsTokenCount = getValueByPath(fromObject, [
    "thoughtsTokenCount"
  ]);
  if (fromThoughtsTokenCount != null) {
    setValueByPath(toObject, ["thoughtsTokenCount"], fromThoughtsTokenCount);
  }
  const fromTotalTokenCount = getValueByPath(fromObject, [
    "totalTokenCount"
  ]);
  if (fromTotalTokenCount != null) {
    setValueByPath(toObject, ["totalTokenCount"], fromTotalTokenCount);
  }
  const fromPromptTokensDetails = getValueByPath(fromObject, [
    "promptTokensDetails"
  ]);
  if (fromPromptTokensDetails != null) {
    let transformedList = fromPromptTokensDetails;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["promptTokensDetails"], transformedList);
  }
  const fromCacheTokensDetails = getValueByPath(fromObject, [
    "cacheTokensDetails"
  ]);
  if (fromCacheTokensDetails != null) {
    let transformedList = fromCacheTokensDetails;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["cacheTokensDetails"], transformedList);
  }
  const fromResponseTokensDetails = getValueByPath(fromObject, [
    "candidatesTokensDetails"
  ]);
  if (fromResponseTokensDetails != null) {
    let transformedList = fromResponseTokensDetails;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["responseTokensDetails"], transformedList);
  }
  const fromToolUsePromptTokensDetails = getValueByPath(fromObject, [
    "toolUsePromptTokensDetails"
  ]);
  if (fromToolUsePromptTokensDetails != null) {
    let transformedList = fromToolUsePromptTokensDetails;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["toolUsePromptTokensDetails"], transformedList);
  }
  const fromTrafficType = getValueByPath(fromObject, ["trafficType"]);
  if (fromTrafficType != null) {
    setValueByPath(toObject, ["trafficType"], fromTrafficType);
  }
  return toObject;
}
__name(usageMetadataFromVertex, "usageMetadataFromVertex");
function voiceActivityFromVertex(fromObject) {
  const toObject = {};
  const fromVoiceActivityType = getValueByPath(fromObject, ["type"]);
  if (fromVoiceActivityType != null) {
    setValueByPath(toObject, ["voiceActivityType"], fromVoiceActivityType);
  }
  return toObject;
}
__name(voiceActivityFromVertex, "voiceActivityFromVertex");
function blobToMldev$1(fromObject, _rootObject) {
  const toObject = {};
  const fromData = getValueByPath(fromObject, ["data"]);
  if (fromData != null) {
    setValueByPath(toObject, ["data"], fromData);
  }
  if (getValueByPath(fromObject, ["displayName"]) !== void 0) {
    throw new Error("displayName parameter is not supported in Gemini API.");
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(blobToMldev$1, "blobToMldev$1");
function candidateFromMldev(fromObject, rootObject) {
  const toObject = {};
  const fromContent = getValueByPath(fromObject, ["content"]);
  if (fromContent != null) {
    setValueByPath(toObject, ["content"], fromContent);
  }
  const fromCitationMetadata = getValueByPath(fromObject, [
    "citationMetadata"
  ]);
  if (fromCitationMetadata != null) {
    setValueByPath(toObject, ["citationMetadata"], citationMetadataFromMldev(fromCitationMetadata));
  }
  const fromTokenCount = getValueByPath(fromObject, ["tokenCount"]);
  if (fromTokenCount != null) {
    setValueByPath(toObject, ["tokenCount"], fromTokenCount);
  }
  const fromFinishReason = getValueByPath(fromObject, ["finishReason"]);
  if (fromFinishReason != null) {
    setValueByPath(toObject, ["finishReason"], fromFinishReason);
  }
  const fromAvgLogprobs = getValueByPath(fromObject, ["avgLogprobs"]);
  if (fromAvgLogprobs != null) {
    setValueByPath(toObject, ["avgLogprobs"], fromAvgLogprobs);
  }
  const fromGroundingMetadata = getValueByPath(fromObject, [
    "groundingMetadata"
  ]);
  if (fromGroundingMetadata != null) {
    setValueByPath(toObject, ["groundingMetadata"], fromGroundingMetadata);
  }
  const fromIndex = getValueByPath(fromObject, ["index"]);
  if (fromIndex != null) {
    setValueByPath(toObject, ["index"], fromIndex);
  }
  const fromLogprobsResult = getValueByPath(fromObject, [
    "logprobsResult"
  ]);
  if (fromLogprobsResult != null) {
    setValueByPath(toObject, ["logprobsResult"], fromLogprobsResult);
  }
  const fromSafetyRatings = getValueByPath(fromObject, [
    "safetyRatings"
  ]);
  if (fromSafetyRatings != null) {
    let transformedList = fromSafetyRatings;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["safetyRatings"], transformedList);
  }
  const fromUrlContextMetadata = getValueByPath(fromObject, [
    "urlContextMetadata"
  ]);
  if (fromUrlContextMetadata != null) {
    setValueByPath(toObject, ["urlContextMetadata"], fromUrlContextMetadata);
  }
  return toObject;
}
__name(candidateFromMldev, "candidateFromMldev");
function citationMetadataFromMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromCitations = getValueByPath(fromObject, ["citationSources"]);
  if (fromCitations != null) {
    let transformedList = fromCitations;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["citations"], transformedList);
  }
  return toObject;
}
__name(citationMetadataFromMldev, "citationMetadataFromMldev");
function computeTokensParametersToVertex(apiClient, fromObject, _rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromContents = getValueByPath(fromObject, ["contents"]);
  if (fromContents != null) {
    let transformedList = tContents(fromContents);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["contents"], transformedList);
  }
  return toObject;
}
__name(computeTokensParametersToVertex, "computeTokensParametersToVertex");
function computeTokensResponseFromVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromTokensInfo = getValueByPath(fromObject, ["tokensInfo"]);
  if (fromTokensInfo != null) {
    let transformedList = fromTokensInfo;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["tokensInfo"], transformedList);
  }
  return toObject;
}
__name(computeTokensResponseFromVertex, "computeTokensResponseFromVertex");
function contentEmbeddingFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromValues = getValueByPath(fromObject, ["values"]);
  if (fromValues != null) {
    setValueByPath(toObject, ["values"], fromValues);
  }
  const fromStatistics = getValueByPath(fromObject, ["statistics"]);
  if (fromStatistics != null) {
    setValueByPath(toObject, ["statistics"], contentEmbeddingStatisticsFromVertex(fromStatistics));
  }
  return toObject;
}
__name(contentEmbeddingFromVertex, "contentEmbeddingFromVertex");
function contentEmbeddingStatisticsFromVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromTruncated = getValueByPath(fromObject, ["truncated"]);
  if (fromTruncated != null) {
    setValueByPath(toObject, ["truncated"], fromTruncated);
  }
  const fromTokenCount = getValueByPath(fromObject, ["token_count"]);
  if (fromTokenCount != null) {
    setValueByPath(toObject, ["tokenCount"], fromTokenCount);
  }
  return toObject;
}
__name(contentEmbeddingStatisticsFromVertex, "contentEmbeddingStatisticsFromVertex");
function contentToMldev$1(fromObject, rootObject) {
  const toObject = {};
  const fromParts = getValueByPath(fromObject, ["parts"]);
  if (fromParts != null) {
    let transformedList = fromParts;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return partToMldev$1(item);
      });
    }
    setValueByPath(toObject, ["parts"], transformedList);
  }
  const fromRole = getValueByPath(fromObject, ["role"]);
  if (fromRole != null) {
    setValueByPath(toObject, ["role"], fromRole);
  }
  return toObject;
}
__name(contentToMldev$1, "contentToMldev$1");
function controlReferenceConfigToVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromControlType = getValueByPath(fromObject, ["controlType"]);
  if (fromControlType != null) {
    setValueByPath(toObject, ["controlType"], fromControlType);
  }
  const fromEnableControlImageComputation = getValueByPath(fromObject, [
    "enableControlImageComputation"
  ]);
  if (fromEnableControlImageComputation != null) {
    setValueByPath(toObject, ["computeControl"], fromEnableControlImageComputation);
  }
  return toObject;
}
__name(controlReferenceConfigToVertex, "controlReferenceConfigToVertex");
function countTokensConfigToMldev(fromObject, _rootObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["systemInstruction"]) !== void 0) {
    throw new Error("systemInstruction parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["tools"]) !== void 0) {
    throw new Error("tools parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["generationConfig"]) !== void 0) {
    throw new Error("generationConfig parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(countTokensConfigToMldev, "countTokensConfigToMldev");
function countTokensConfigToVertex(fromObject, parentObject, rootObject) {
  const toObject = {};
  const fromSystemInstruction = getValueByPath(fromObject, [
    "systemInstruction"
  ]);
  if (parentObject !== void 0 && fromSystemInstruction != null) {
    setValueByPath(parentObject, ["systemInstruction"], tContent(fromSystemInstruction));
  }
  const fromTools = getValueByPath(fromObject, ["tools"]);
  if (parentObject !== void 0 && fromTools != null) {
    let transformedList = fromTools;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return toolToVertex(item);
      });
    }
    setValueByPath(parentObject, ["tools"], transformedList);
  }
  const fromGenerationConfig = getValueByPath(fromObject, [
    "generationConfig"
  ]);
  if (parentObject !== void 0 && fromGenerationConfig != null) {
    setValueByPath(parentObject, ["generationConfig"], generationConfigToVertex(fromGenerationConfig));
  }
  return toObject;
}
__name(countTokensConfigToVertex, "countTokensConfigToVertex");
function countTokensParametersToMldev(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromContents = getValueByPath(fromObject, ["contents"]);
  if (fromContents != null) {
    let transformedList = tContents(fromContents);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return contentToMldev$1(item);
      });
    }
    setValueByPath(toObject, ["contents"], transformedList);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    countTokensConfigToMldev(fromConfig);
  }
  return toObject;
}
__name(countTokensParametersToMldev, "countTokensParametersToMldev");
function countTokensParametersToVertex(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromContents = getValueByPath(fromObject, ["contents"]);
  if (fromContents != null) {
    let transformedList = tContents(fromContents);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["contents"], transformedList);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    countTokensConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(countTokensParametersToVertex, "countTokensParametersToVertex");
function countTokensResponseFromMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromTotalTokens = getValueByPath(fromObject, ["totalTokens"]);
  if (fromTotalTokens != null) {
    setValueByPath(toObject, ["totalTokens"], fromTotalTokens);
  }
  const fromCachedContentTokenCount = getValueByPath(fromObject, [
    "cachedContentTokenCount"
  ]);
  if (fromCachedContentTokenCount != null) {
    setValueByPath(toObject, ["cachedContentTokenCount"], fromCachedContentTokenCount);
  }
  return toObject;
}
__name(countTokensResponseFromMldev, "countTokensResponseFromMldev");
function countTokensResponseFromVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromTotalTokens = getValueByPath(fromObject, ["totalTokens"]);
  if (fromTotalTokens != null) {
    setValueByPath(toObject, ["totalTokens"], fromTotalTokens);
  }
  return toObject;
}
__name(countTokensResponseFromVertex, "countTokensResponseFromVertex");
function deleteModelParametersToMldev(apiClient, fromObject, _rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "name"], tModel(apiClient, fromModel));
  }
  return toObject;
}
__name(deleteModelParametersToMldev, "deleteModelParametersToMldev");
function deleteModelParametersToVertex(apiClient, fromObject, _rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "name"], tModel(apiClient, fromModel));
  }
  return toObject;
}
__name(deleteModelParametersToVertex, "deleteModelParametersToVertex");
function deleteModelResponseFromMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  return toObject;
}
__name(deleteModelResponseFromMldev, "deleteModelResponseFromMldev");
function deleteModelResponseFromVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  return toObject;
}
__name(deleteModelResponseFromVertex, "deleteModelResponseFromVertex");
function editImageConfigToVertex(fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromOutputGcsUri = getValueByPath(fromObject, ["outputGcsUri"]);
  if (parentObject !== void 0 && fromOutputGcsUri != null) {
    setValueByPath(parentObject, ["parameters", "storageUri"], fromOutputGcsUri);
  }
  const fromNegativePrompt = getValueByPath(fromObject, [
    "negativePrompt"
  ]);
  if (parentObject !== void 0 && fromNegativePrompt != null) {
    setValueByPath(parentObject, ["parameters", "negativePrompt"], fromNegativePrompt);
  }
  const fromNumberOfImages = getValueByPath(fromObject, [
    "numberOfImages"
  ]);
  if (parentObject !== void 0 && fromNumberOfImages != null) {
    setValueByPath(parentObject, ["parameters", "sampleCount"], fromNumberOfImages);
  }
  const fromAspectRatio = getValueByPath(fromObject, ["aspectRatio"]);
  if (parentObject !== void 0 && fromAspectRatio != null) {
    setValueByPath(parentObject, ["parameters", "aspectRatio"], fromAspectRatio);
  }
  const fromGuidanceScale = getValueByPath(fromObject, [
    "guidanceScale"
  ]);
  if (parentObject !== void 0 && fromGuidanceScale != null) {
    setValueByPath(parentObject, ["parameters", "guidanceScale"], fromGuidanceScale);
  }
  const fromSeed = getValueByPath(fromObject, ["seed"]);
  if (parentObject !== void 0 && fromSeed != null) {
    setValueByPath(parentObject, ["parameters", "seed"], fromSeed);
  }
  const fromSafetyFilterLevel = getValueByPath(fromObject, [
    "safetyFilterLevel"
  ]);
  if (parentObject !== void 0 && fromSafetyFilterLevel != null) {
    setValueByPath(parentObject, ["parameters", "safetySetting"], fromSafetyFilterLevel);
  }
  const fromPersonGeneration = getValueByPath(fromObject, [
    "personGeneration"
  ]);
  if (parentObject !== void 0 && fromPersonGeneration != null) {
    setValueByPath(parentObject, ["parameters", "personGeneration"], fromPersonGeneration);
  }
  const fromIncludeSafetyAttributes = getValueByPath(fromObject, [
    "includeSafetyAttributes"
  ]);
  if (parentObject !== void 0 && fromIncludeSafetyAttributes != null) {
    setValueByPath(parentObject, ["parameters", "includeSafetyAttributes"], fromIncludeSafetyAttributes);
  }
  const fromIncludeRaiReason = getValueByPath(fromObject, [
    "includeRaiReason"
  ]);
  if (parentObject !== void 0 && fromIncludeRaiReason != null) {
    setValueByPath(parentObject, ["parameters", "includeRaiReason"], fromIncludeRaiReason);
  }
  const fromLanguage = getValueByPath(fromObject, ["language"]);
  if (parentObject !== void 0 && fromLanguage != null) {
    setValueByPath(parentObject, ["parameters", "language"], fromLanguage);
  }
  const fromOutputMimeType = getValueByPath(fromObject, [
    "outputMimeType"
  ]);
  if (parentObject !== void 0 && fromOutputMimeType != null) {
    setValueByPath(parentObject, ["parameters", "outputOptions", "mimeType"], fromOutputMimeType);
  }
  const fromOutputCompressionQuality = getValueByPath(fromObject, [
    "outputCompressionQuality"
  ]);
  if (parentObject !== void 0 && fromOutputCompressionQuality != null) {
    setValueByPath(parentObject, ["parameters", "outputOptions", "compressionQuality"], fromOutputCompressionQuality);
  }
  const fromAddWatermark = getValueByPath(fromObject, ["addWatermark"]);
  if (parentObject !== void 0 && fromAddWatermark != null) {
    setValueByPath(parentObject, ["parameters", "addWatermark"], fromAddWatermark);
  }
  const fromLabels = getValueByPath(fromObject, ["labels"]);
  if (parentObject !== void 0 && fromLabels != null) {
    setValueByPath(parentObject, ["labels"], fromLabels);
  }
  const fromEditMode = getValueByPath(fromObject, ["editMode"]);
  if (parentObject !== void 0 && fromEditMode != null) {
    setValueByPath(parentObject, ["parameters", "editMode"], fromEditMode);
  }
  const fromBaseSteps = getValueByPath(fromObject, ["baseSteps"]);
  if (parentObject !== void 0 && fromBaseSteps != null) {
    setValueByPath(parentObject, ["parameters", "editConfig", "baseSteps"], fromBaseSteps);
  }
  return toObject;
}
__name(editImageConfigToVertex, "editImageConfigToVertex");
function editImageParametersInternalToVertex(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromPrompt = getValueByPath(fromObject, ["prompt"]);
  if (fromPrompt != null) {
    setValueByPath(toObject, ["instances[0]", "prompt"], fromPrompt);
  }
  const fromReferenceImages = getValueByPath(fromObject, [
    "referenceImages"
  ]);
  if (fromReferenceImages != null) {
    let transformedList = fromReferenceImages;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return referenceImageAPIInternalToVertex(item);
      });
    }
    setValueByPath(toObject, ["instances[0]", "referenceImages"], transformedList);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    editImageConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(editImageParametersInternalToVertex, "editImageParametersInternalToVertex");
function editImageResponseFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromGeneratedImages = getValueByPath(fromObject, [
    "predictions"
  ]);
  if (fromGeneratedImages != null) {
    let transformedList = fromGeneratedImages;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return generatedImageFromVertex(item);
      });
    }
    setValueByPath(toObject, ["generatedImages"], transformedList);
  }
  return toObject;
}
__name(editImageResponseFromVertex, "editImageResponseFromVertex");
function embedContentConfigToMldev(fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromTaskType = getValueByPath(fromObject, ["taskType"]);
  if (parentObject !== void 0 && fromTaskType != null) {
    setValueByPath(parentObject, ["requests[]", "taskType"], fromTaskType);
  }
  const fromTitle = getValueByPath(fromObject, ["title"]);
  if (parentObject !== void 0 && fromTitle != null) {
    setValueByPath(parentObject, ["requests[]", "title"], fromTitle);
  }
  const fromOutputDimensionality = getValueByPath(fromObject, [
    "outputDimensionality"
  ]);
  if (parentObject !== void 0 && fromOutputDimensionality != null) {
    setValueByPath(parentObject, ["requests[]", "outputDimensionality"], fromOutputDimensionality);
  }
  if (getValueByPath(fromObject, ["mimeType"]) !== void 0) {
    throw new Error("mimeType parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["autoTruncate"]) !== void 0) {
    throw new Error("autoTruncate parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(embedContentConfigToMldev, "embedContentConfigToMldev");
function embedContentConfigToVertex(fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromTaskType = getValueByPath(fromObject, ["taskType"]);
  if (parentObject !== void 0 && fromTaskType != null) {
    setValueByPath(parentObject, ["instances[]", "task_type"], fromTaskType);
  }
  const fromTitle = getValueByPath(fromObject, ["title"]);
  if (parentObject !== void 0 && fromTitle != null) {
    setValueByPath(parentObject, ["instances[]", "title"], fromTitle);
  }
  const fromOutputDimensionality = getValueByPath(fromObject, [
    "outputDimensionality"
  ]);
  if (parentObject !== void 0 && fromOutputDimensionality != null) {
    setValueByPath(parentObject, ["parameters", "outputDimensionality"], fromOutputDimensionality);
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (parentObject !== void 0 && fromMimeType != null) {
    setValueByPath(parentObject, ["instances[]", "mimeType"], fromMimeType);
  }
  const fromAutoTruncate = getValueByPath(fromObject, ["autoTruncate"]);
  if (parentObject !== void 0 && fromAutoTruncate != null) {
    setValueByPath(parentObject, ["parameters", "autoTruncate"], fromAutoTruncate);
  }
  return toObject;
}
__name(embedContentConfigToVertex, "embedContentConfigToVertex");
function embedContentParametersToMldev(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromContents = getValueByPath(fromObject, ["contents"]);
  if (fromContents != null) {
    let transformedList = tContentsForEmbed(apiClient, fromContents);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["requests[]", "content"], transformedList);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    embedContentConfigToMldev(fromConfig, toObject);
  }
  const fromModelForEmbedContent = getValueByPath(fromObject, ["model"]);
  if (fromModelForEmbedContent !== void 0) {
    setValueByPath(toObject, ["requests[]", "model"], tModel(apiClient, fromModelForEmbedContent));
  }
  return toObject;
}
__name(embedContentParametersToMldev, "embedContentParametersToMldev");
function embedContentParametersToVertex(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromContents = getValueByPath(fromObject, ["contents"]);
  if (fromContents != null) {
    let transformedList = tContentsForEmbed(apiClient, fromContents);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["instances[]", "content"], transformedList);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    embedContentConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(embedContentParametersToVertex, "embedContentParametersToVertex");
function embedContentResponseFromMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromEmbeddings = getValueByPath(fromObject, ["embeddings"]);
  if (fromEmbeddings != null) {
    let transformedList = fromEmbeddings;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["embeddings"], transformedList);
  }
  const fromMetadata = getValueByPath(fromObject, ["metadata"]);
  if (fromMetadata != null) {
    setValueByPath(toObject, ["metadata"], fromMetadata);
  }
  return toObject;
}
__name(embedContentResponseFromMldev, "embedContentResponseFromMldev");
function embedContentResponseFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromEmbeddings = getValueByPath(fromObject, [
    "predictions[]",
    "embeddings"
  ]);
  if (fromEmbeddings != null) {
    let transformedList = fromEmbeddings;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return contentEmbeddingFromVertex(item);
      });
    }
    setValueByPath(toObject, ["embeddings"], transformedList);
  }
  const fromMetadata = getValueByPath(fromObject, ["metadata"]);
  if (fromMetadata != null) {
    setValueByPath(toObject, ["metadata"], fromMetadata);
  }
  return toObject;
}
__name(embedContentResponseFromVertex, "embedContentResponseFromVertex");
function endpointFromVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["endpoint"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromDeployedModelId = getValueByPath(fromObject, [
    "deployedModelId"
  ]);
  if (fromDeployedModelId != null) {
    setValueByPath(toObject, ["deployedModelId"], fromDeployedModelId);
  }
  return toObject;
}
__name(endpointFromVertex, "endpointFromVertex");
function fileDataToMldev$1(fromObject, _rootObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["displayName"]) !== void 0) {
    throw new Error("displayName parameter is not supported in Gemini API.");
  }
  const fromFileUri = getValueByPath(fromObject, ["fileUri"]);
  if (fromFileUri != null) {
    setValueByPath(toObject, ["fileUri"], fromFileUri);
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(fileDataToMldev$1, "fileDataToMldev$1");
function functionCallToMldev$1(fromObject, _rootObject) {
  const toObject = {};
  const fromId = getValueByPath(fromObject, ["id"]);
  if (fromId != null) {
    setValueByPath(toObject, ["id"], fromId);
  }
  const fromArgs = getValueByPath(fromObject, ["args"]);
  if (fromArgs != null) {
    setValueByPath(toObject, ["args"], fromArgs);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  if (getValueByPath(fromObject, ["partialArgs"]) !== void 0) {
    throw new Error("partialArgs parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["willContinue"]) !== void 0) {
    throw new Error("willContinue parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(functionCallToMldev$1, "functionCallToMldev$1");
function functionCallingConfigToMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromAllowedFunctionNames = getValueByPath(fromObject, [
    "allowedFunctionNames"
  ]);
  if (fromAllowedFunctionNames != null) {
    setValueByPath(toObject, ["allowedFunctionNames"], fromAllowedFunctionNames);
  }
  const fromMode = getValueByPath(fromObject, ["mode"]);
  if (fromMode != null) {
    setValueByPath(toObject, ["mode"], fromMode);
  }
  if (getValueByPath(fromObject, ["streamFunctionCallArguments"]) !== void 0) {
    throw new Error("streamFunctionCallArguments parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(functionCallingConfigToMldev, "functionCallingConfigToMldev");
function functionDeclarationToVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromDescription = getValueByPath(fromObject, ["description"]);
  if (fromDescription != null) {
    setValueByPath(toObject, ["description"], fromDescription);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromParameters = getValueByPath(fromObject, ["parameters"]);
  if (fromParameters != null) {
    setValueByPath(toObject, ["parameters"], fromParameters);
  }
  const fromParametersJsonSchema = getValueByPath(fromObject, [
    "parametersJsonSchema"
  ]);
  if (fromParametersJsonSchema != null) {
    setValueByPath(toObject, ["parametersJsonSchema"], fromParametersJsonSchema);
  }
  const fromResponse = getValueByPath(fromObject, ["response"]);
  if (fromResponse != null) {
    setValueByPath(toObject, ["response"], fromResponse);
  }
  const fromResponseJsonSchema = getValueByPath(fromObject, [
    "responseJsonSchema"
  ]);
  if (fromResponseJsonSchema != null) {
    setValueByPath(toObject, ["responseJsonSchema"], fromResponseJsonSchema);
  }
  if (getValueByPath(fromObject, ["behavior"]) !== void 0) {
    throw new Error("behavior parameter is not supported in Vertex AI.");
  }
  return toObject;
}
__name(functionDeclarationToVertex, "functionDeclarationToVertex");
function generateContentConfigToMldev(apiClient, fromObject, parentObject, rootObject) {
  const toObject = {};
  const fromSystemInstruction = getValueByPath(fromObject, [
    "systemInstruction"
  ]);
  if (parentObject !== void 0 && fromSystemInstruction != null) {
    setValueByPath(parentObject, ["systemInstruction"], contentToMldev$1(tContent(fromSystemInstruction)));
  }
  const fromTemperature = getValueByPath(fromObject, ["temperature"]);
  if (fromTemperature != null) {
    setValueByPath(toObject, ["temperature"], fromTemperature);
  }
  const fromTopP = getValueByPath(fromObject, ["topP"]);
  if (fromTopP != null) {
    setValueByPath(toObject, ["topP"], fromTopP);
  }
  const fromTopK = getValueByPath(fromObject, ["topK"]);
  if (fromTopK != null) {
    setValueByPath(toObject, ["topK"], fromTopK);
  }
  const fromCandidateCount = getValueByPath(fromObject, [
    "candidateCount"
  ]);
  if (fromCandidateCount != null) {
    setValueByPath(toObject, ["candidateCount"], fromCandidateCount);
  }
  const fromMaxOutputTokens = getValueByPath(fromObject, [
    "maxOutputTokens"
  ]);
  if (fromMaxOutputTokens != null) {
    setValueByPath(toObject, ["maxOutputTokens"], fromMaxOutputTokens);
  }
  const fromStopSequences = getValueByPath(fromObject, [
    "stopSequences"
  ]);
  if (fromStopSequences != null) {
    setValueByPath(toObject, ["stopSequences"], fromStopSequences);
  }
  const fromResponseLogprobs = getValueByPath(fromObject, [
    "responseLogprobs"
  ]);
  if (fromResponseLogprobs != null) {
    setValueByPath(toObject, ["responseLogprobs"], fromResponseLogprobs);
  }
  const fromLogprobs = getValueByPath(fromObject, ["logprobs"]);
  if (fromLogprobs != null) {
    setValueByPath(toObject, ["logprobs"], fromLogprobs);
  }
  const fromPresencePenalty = getValueByPath(fromObject, [
    "presencePenalty"
  ]);
  if (fromPresencePenalty != null) {
    setValueByPath(toObject, ["presencePenalty"], fromPresencePenalty);
  }
  const fromFrequencyPenalty = getValueByPath(fromObject, [
    "frequencyPenalty"
  ]);
  if (fromFrequencyPenalty != null) {
    setValueByPath(toObject, ["frequencyPenalty"], fromFrequencyPenalty);
  }
  const fromSeed = getValueByPath(fromObject, ["seed"]);
  if (fromSeed != null) {
    setValueByPath(toObject, ["seed"], fromSeed);
  }
  const fromResponseMimeType = getValueByPath(fromObject, [
    "responseMimeType"
  ]);
  if (fromResponseMimeType != null) {
    setValueByPath(toObject, ["responseMimeType"], fromResponseMimeType);
  }
  const fromResponseSchema = getValueByPath(fromObject, [
    "responseSchema"
  ]);
  if (fromResponseSchema != null) {
    setValueByPath(toObject, ["responseSchema"], tSchema(fromResponseSchema));
  }
  const fromResponseJsonSchema = getValueByPath(fromObject, [
    "responseJsonSchema"
  ]);
  if (fromResponseJsonSchema != null) {
    setValueByPath(toObject, ["responseJsonSchema"], fromResponseJsonSchema);
  }
  if (getValueByPath(fromObject, ["routingConfig"]) !== void 0) {
    throw new Error("routingConfig parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["modelSelectionConfig"]) !== void 0) {
    throw new Error("modelSelectionConfig parameter is not supported in Gemini API.");
  }
  const fromSafetySettings = getValueByPath(fromObject, [
    "safetySettings"
  ]);
  if (parentObject !== void 0 && fromSafetySettings != null) {
    let transformedList = fromSafetySettings;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return safetySettingToMldev(item);
      });
    }
    setValueByPath(parentObject, ["safetySettings"], transformedList);
  }
  const fromTools = getValueByPath(fromObject, ["tools"]);
  if (parentObject !== void 0 && fromTools != null) {
    let transformedList = tTools(fromTools);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return toolToMldev$1(tTool(item));
      });
    }
    setValueByPath(parentObject, ["tools"], transformedList);
  }
  const fromToolConfig = getValueByPath(fromObject, ["toolConfig"]);
  if (parentObject !== void 0 && fromToolConfig != null) {
    setValueByPath(parentObject, ["toolConfig"], toolConfigToMldev(fromToolConfig));
  }
  if (getValueByPath(fromObject, ["labels"]) !== void 0) {
    throw new Error("labels parameter is not supported in Gemini API.");
  }
  const fromCachedContent = getValueByPath(fromObject, [
    "cachedContent"
  ]);
  if (parentObject !== void 0 && fromCachedContent != null) {
    setValueByPath(parentObject, ["cachedContent"], tCachedContentName(apiClient, fromCachedContent));
  }
  const fromResponseModalities = getValueByPath(fromObject, [
    "responseModalities"
  ]);
  if (fromResponseModalities != null) {
    setValueByPath(toObject, ["responseModalities"], fromResponseModalities);
  }
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (fromMediaResolution != null) {
    setValueByPath(toObject, ["mediaResolution"], fromMediaResolution);
  }
  const fromSpeechConfig = getValueByPath(fromObject, ["speechConfig"]);
  if (fromSpeechConfig != null) {
    setValueByPath(toObject, ["speechConfig"], tSpeechConfig(fromSpeechConfig));
  }
  if (getValueByPath(fromObject, ["audioTimestamp"]) !== void 0) {
    throw new Error("audioTimestamp parameter is not supported in Gemini API.");
  }
  const fromThinkingConfig = getValueByPath(fromObject, [
    "thinkingConfig"
  ]);
  if (fromThinkingConfig != null) {
    setValueByPath(toObject, ["thinkingConfig"], fromThinkingConfig);
  }
  const fromImageConfig = getValueByPath(fromObject, ["imageConfig"]);
  if (fromImageConfig != null) {
    setValueByPath(toObject, ["imageConfig"], imageConfigToMldev(fromImageConfig));
  }
  const fromEnableEnhancedCivicAnswers = getValueByPath(fromObject, [
    "enableEnhancedCivicAnswers"
  ]);
  if (fromEnableEnhancedCivicAnswers != null) {
    setValueByPath(toObject, ["enableEnhancedCivicAnswers"], fromEnableEnhancedCivicAnswers);
  }
  if (getValueByPath(fromObject, ["modelArmorConfig"]) !== void 0) {
    throw new Error("modelArmorConfig parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(generateContentConfigToMldev, "generateContentConfigToMldev");
function generateContentConfigToVertex(apiClient, fromObject, parentObject, rootObject) {
  const toObject = {};
  const fromSystemInstruction = getValueByPath(fromObject, [
    "systemInstruction"
  ]);
  if (parentObject !== void 0 && fromSystemInstruction != null) {
    setValueByPath(parentObject, ["systemInstruction"], tContent(fromSystemInstruction));
  }
  const fromTemperature = getValueByPath(fromObject, ["temperature"]);
  if (fromTemperature != null) {
    setValueByPath(toObject, ["temperature"], fromTemperature);
  }
  const fromTopP = getValueByPath(fromObject, ["topP"]);
  if (fromTopP != null) {
    setValueByPath(toObject, ["topP"], fromTopP);
  }
  const fromTopK = getValueByPath(fromObject, ["topK"]);
  if (fromTopK != null) {
    setValueByPath(toObject, ["topK"], fromTopK);
  }
  const fromCandidateCount = getValueByPath(fromObject, [
    "candidateCount"
  ]);
  if (fromCandidateCount != null) {
    setValueByPath(toObject, ["candidateCount"], fromCandidateCount);
  }
  const fromMaxOutputTokens = getValueByPath(fromObject, [
    "maxOutputTokens"
  ]);
  if (fromMaxOutputTokens != null) {
    setValueByPath(toObject, ["maxOutputTokens"], fromMaxOutputTokens);
  }
  const fromStopSequences = getValueByPath(fromObject, [
    "stopSequences"
  ]);
  if (fromStopSequences != null) {
    setValueByPath(toObject, ["stopSequences"], fromStopSequences);
  }
  const fromResponseLogprobs = getValueByPath(fromObject, [
    "responseLogprobs"
  ]);
  if (fromResponseLogprobs != null) {
    setValueByPath(toObject, ["responseLogprobs"], fromResponseLogprobs);
  }
  const fromLogprobs = getValueByPath(fromObject, ["logprobs"]);
  if (fromLogprobs != null) {
    setValueByPath(toObject, ["logprobs"], fromLogprobs);
  }
  const fromPresencePenalty = getValueByPath(fromObject, [
    "presencePenalty"
  ]);
  if (fromPresencePenalty != null) {
    setValueByPath(toObject, ["presencePenalty"], fromPresencePenalty);
  }
  const fromFrequencyPenalty = getValueByPath(fromObject, [
    "frequencyPenalty"
  ]);
  if (fromFrequencyPenalty != null) {
    setValueByPath(toObject, ["frequencyPenalty"], fromFrequencyPenalty);
  }
  const fromSeed = getValueByPath(fromObject, ["seed"]);
  if (fromSeed != null) {
    setValueByPath(toObject, ["seed"], fromSeed);
  }
  const fromResponseMimeType = getValueByPath(fromObject, [
    "responseMimeType"
  ]);
  if (fromResponseMimeType != null) {
    setValueByPath(toObject, ["responseMimeType"], fromResponseMimeType);
  }
  const fromResponseSchema = getValueByPath(fromObject, [
    "responseSchema"
  ]);
  if (fromResponseSchema != null) {
    setValueByPath(toObject, ["responseSchema"], tSchema(fromResponseSchema));
  }
  const fromResponseJsonSchema = getValueByPath(fromObject, [
    "responseJsonSchema"
  ]);
  if (fromResponseJsonSchema != null) {
    setValueByPath(toObject, ["responseJsonSchema"], fromResponseJsonSchema);
  }
  const fromRoutingConfig = getValueByPath(fromObject, [
    "routingConfig"
  ]);
  if (fromRoutingConfig != null) {
    setValueByPath(toObject, ["routingConfig"], fromRoutingConfig);
  }
  const fromModelSelectionConfig = getValueByPath(fromObject, [
    "modelSelectionConfig"
  ]);
  if (fromModelSelectionConfig != null) {
    setValueByPath(toObject, ["modelConfig"], fromModelSelectionConfig);
  }
  const fromSafetySettings = getValueByPath(fromObject, [
    "safetySettings"
  ]);
  if (parentObject !== void 0 && fromSafetySettings != null) {
    let transformedList = fromSafetySettings;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(parentObject, ["safetySettings"], transformedList);
  }
  const fromTools = getValueByPath(fromObject, ["tools"]);
  if (parentObject !== void 0 && fromTools != null) {
    let transformedList = tTools(fromTools);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return toolToVertex(tTool(item));
      });
    }
    setValueByPath(parentObject, ["tools"], transformedList);
  }
  const fromToolConfig = getValueByPath(fromObject, ["toolConfig"]);
  if (parentObject !== void 0 && fromToolConfig != null) {
    setValueByPath(parentObject, ["toolConfig"], fromToolConfig);
  }
  const fromLabels = getValueByPath(fromObject, ["labels"]);
  if (parentObject !== void 0 && fromLabels != null) {
    setValueByPath(parentObject, ["labels"], fromLabels);
  }
  const fromCachedContent = getValueByPath(fromObject, [
    "cachedContent"
  ]);
  if (parentObject !== void 0 && fromCachedContent != null) {
    setValueByPath(parentObject, ["cachedContent"], tCachedContentName(apiClient, fromCachedContent));
  }
  const fromResponseModalities = getValueByPath(fromObject, [
    "responseModalities"
  ]);
  if (fromResponseModalities != null) {
    setValueByPath(toObject, ["responseModalities"], fromResponseModalities);
  }
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (fromMediaResolution != null) {
    setValueByPath(toObject, ["mediaResolution"], fromMediaResolution);
  }
  const fromSpeechConfig = getValueByPath(fromObject, ["speechConfig"]);
  if (fromSpeechConfig != null) {
    setValueByPath(toObject, ["speechConfig"], tSpeechConfig(fromSpeechConfig));
  }
  const fromAudioTimestamp = getValueByPath(fromObject, [
    "audioTimestamp"
  ]);
  if (fromAudioTimestamp != null) {
    setValueByPath(toObject, ["audioTimestamp"], fromAudioTimestamp);
  }
  const fromThinkingConfig = getValueByPath(fromObject, [
    "thinkingConfig"
  ]);
  if (fromThinkingConfig != null) {
    setValueByPath(toObject, ["thinkingConfig"], fromThinkingConfig);
  }
  const fromImageConfig = getValueByPath(fromObject, ["imageConfig"]);
  if (fromImageConfig != null) {
    setValueByPath(toObject, ["imageConfig"], imageConfigToVertex(fromImageConfig));
  }
  if (getValueByPath(fromObject, ["enableEnhancedCivicAnswers"]) !== void 0) {
    throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  }
  const fromModelArmorConfig = getValueByPath(fromObject, [
    "modelArmorConfig"
  ]);
  if (parentObject !== void 0 && fromModelArmorConfig != null) {
    setValueByPath(parentObject, ["modelArmorConfig"], fromModelArmorConfig);
  }
  return toObject;
}
__name(generateContentConfigToVertex, "generateContentConfigToVertex");
function generateContentParametersToMldev(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromContents = getValueByPath(fromObject, ["contents"]);
  if (fromContents != null) {
    let transformedList = tContents(fromContents);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return contentToMldev$1(item);
      });
    }
    setValueByPath(toObject, ["contents"], transformedList);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    setValueByPath(toObject, ["generationConfig"], generateContentConfigToMldev(apiClient, fromConfig, toObject));
  }
  return toObject;
}
__name(generateContentParametersToMldev, "generateContentParametersToMldev");
function generateContentParametersToVertex(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromContents = getValueByPath(fromObject, ["contents"]);
  if (fromContents != null) {
    let transformedList = tContents(fromContents);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["contents"], transformedList);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    setValueByPath(toObject, ["generationConfig"], generateContentConfigToVertex(apiClient, fromConfig, toObject));
  }
  return toObject;
}
__name(generateContentParametersToVertex, "generateContentParametersToVertex");
function generateContentResponseFromMldev(fromObject, rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromCandidates = getValueByPath(fromObject, ["candidates"]);
  if (fromCandidates != null) {
    let transformedList = fromCandidates;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return candidateFromMldev(item);
      });
    }
    setValueByPath(toObject, ["candidates"], transformedList);
  }
  const fromModelVersion = getValueByPath(fromObject, ["modelVersion"]);
  if (fromModelVersion != null) {
    setValueByPath(toObject, ["modelVersion"], fromModelVersion);
  }
  const fromPromptFeedback = getValueByPath(fromObject, [
    "promptFeedback"
  ]);
  if (fromPromptFeedback != null) {
    setValueByPath(toObject, ["promptFeedback"], fromPromptFeedback);
  }
  const fromResponseId = getValueByPath(fromObject, ["responseId"]);
  if (fromResponseId != null) {
    setValueByPath(toObject, ["responseId"], fromResponseId);
  }
  const fromUsageMetadata = getValueByPath(fromObject, [
    "usageMetadata"
  ]);
  if (fromUsageMetadata != null) {
    setValueByPath(toObject, ["usageMetadata"], fromUsageMetadata);
  }
  return toObject;
}
__name(generateContentResponseFromMldev, "generateContentResponseFromMldev");
function generateContentResponseFromVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromCandidates = getValueByPath(fromObject, ["candidates"]);
  if (fromCandidates != null) {
    let transformedList = fromCandidates;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["candidates"], transformedList);
  }
  const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
  if (fromCreateTime != null) {
    setValueByPath(toObject, ["createTime"], fromCreateTime);
  }
  const fromModelVersion = getValueByPath(fromObject, ["modelVersion"]);
  if (fromModelVersion != null) {
    setValueByPath(toObject, ["modelVersion"], fromModelVersion);
  }
  const fromPromptFeedback = getValueByPath(fromObject, [
    "promptFeedback"
  ]);
  if (fromPromptFeedback != null) {
    setValueByPath(toObject, ["promptFeedback"], fromPromptFeedback);
  }
  const fromResponseId = getValueByPath(fromObject, ["responseId"]);
  if (fromResponseId != null) {
    setValueByPath(toObject, ["responseId"], fromResponseId);
  }
  const fromUsageMetadata = getValueByPath(fromObject, [
    "usageMetadata"
  ]);
  if (fromUsageMetadata != null) {
    setValueByPath(toObject, ["usageMetadata"], fromUsageMetadata);
  }
  return toObject;
}
__name(generateContentResponseFromVertex, "generateContentResponseFromVertex");
function generateImagesConfigToMldev(fromObject, parentObject, _rootObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["outputGcsUri"]) !== void 0) {
    throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["negativePrompt"]) !== void 0) {
    throw new Error("negativePrompt parameter is not supported in Gemini API.");
  }
  const fromNumberOfImages = getValueByPath(fromObject, [
    "numberOfImages"
  ]);
  if (parentObject !== void 0 && fromNumberOfImages != null) {
    setValueByPath(parentObject, ["parameters", "sampleCount"], fromNumberOfImages);
  }
  const fromAspectRatio = getValueByPath(fromObject, ["aspectRatio"]);
  if (parentObject !== void 0 && fromAspectRatio != null) {
    setValueByPath(parentObject, ["parameters", "aspectRatio"], fromAspectRatio);
  }
  const fromGuidanceScale = getValueByPath(fromObject, [
    "guidanceScale"
  ]);
  if (parentObject !== void 0 && fromGuidanceScale != null) {
    setValueByPath(parentObject, ["parameters", "guidanceScale"], fromGuidanceScale);
  }
  if (getValueByPath(fromObject, ["seed"]) !== void 0) {
    throw new Error("seed parameter is not supported in Gemini API.");
  }
  const fromSafetyFilterLevel = getValueByPath(fromObject, [
    "safetyFilterLevel"
  ]);
  if (parentObject !== void 0 && fromSafetyFilterLevel != null) {
    setValueByPath(parentObject, ["parameters", "safetySetting"], fromSafetyFilterLevel);
  }
  const fromPersonGeneration = getValueByPath(fromObject, [
    "personGeneration"
  ]);
  if (parentObject !== void 0 && fromPersonGeneration != null) {
    setValueByPath(parentObject, ["parameters", "personGeneration"], fromPersonGeneration);
  }
  const fromIncludeSafetyAttributes = getValueByPath(fromObject, [
    "includeSafetyAttributes"
  ]);
  if (parentObject !== void 0 && fromIncludeSafetyAttributes != null) {
    setValueByPath(parentObject, ["parameters", "includeSafetyAttributes"], fromIncludeSafetyAttributes);
  }
  const fromIncludeRaiReason = getValueByPath(fromObject, [
    "includeRaiReason"
  ]);
  if (parentObject !== void 0 && fromIncludeRaiReason != null) {
    setValueByPath(parentObject, ["parameters", "includeRaiReason"], fromIncludeRaiReason);
  }
  const fromLanguage = getValueByPath(fromObject, ["language"]);
  if (parentObject !== void 0 && fromLanguage != null) {
    setValueByPath(parentObject, ["parameters", "language"], fromLanguage);
  }
  const fromOutputMimeType = getValueByPath(fromObject, [
    "outputMimeType"
  ]);
  if (parentObject !== void 0 && fromOutputMimeType != null) {
    setValueByPath(parentObject, ["parameters", "outputOptions", "mimeType"], fromOutputMimeType);
  }
  const fromOutputCompressionQuality = getValueByPath(fromObject, [
    "outputCompressionQuality"
  ]);
  if (parentObject !== void 0 && fromOutputCompressionQuality != null) {
    setValueByPath(parentObject, ["parameters", "outputOptions", "compressionQuality"], fromOutputCompressionQuality);
  }
  if (getValueByPath(fromObject, ["addWatermark"]) !== void 0) {
    throw new Error("addWatermark parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["labels"]) !== void 0) {
    throw new Error("labels parameter is not supported in Gemini API.");
  }
  const fromImageSize = getValueByPath(fromObject, ["imageSize"]);
  if (parentObject !== void 0 && fromImageSize != null) {
    setValueByPath(parentObject, ["parameters", "sampleImageSize"], fromImageSize);
  }
  if (getValueByPath(fromObject, ["enhancePrompt"]) !== void 0) {
    throw new Error("enhancePrompt parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(generateImagesConfigToMldev, "generateImagesConfigToMldev");
function generateImagesConfigToVertex(fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromOutputGcsUri = getValueByPath(fromObject, ["outputGcsUri"]);
  if (parentObject !== void 0 && fromOutputGcsUri != null) {
    setValueByPath(parentObject, ["parameters", "storageUri"], fromOutputGcsUri);
  }
  const fromNegativePrompt = getValueByPath(fromObject, [
    "negativePrompt"
  ]);
  if (parentObject !== void 0 && fromNegativePrompt != null) {
    setValueByPath(parentObject, ["parameters", "negativePrompt"], fromNegativePrompt);
  }
  const fromNumberOfImages = getValueByPath(fromObject, [
    "numberOfImages"
  ]);
  if (parentObject !== void 0 && fromNumberOfImages != null) {
    setValueByPath(parentObject, ["parameters", "sampleCount"], fromNumberOfImages);
  }
  const fromAspectRatio = getValueByPath(fromObject, ["aspectRatio"]);
  if (parentObject !== void 0 && fromAspectRatio != null) {
    setValueByPath(parentObject, ["parameters", "aspectRatio"], fromAspectRatio);
  }
  const fromGuidanceScale = getValueByPath(fromObject, [
    "guidanceScale"
  ]);
  if (parentObject !== void 0 && fromGuidanceScale != null) {
    setValueByPath(parentObject, ["parameters", "guidanceScale"], fromGuidanceScale);
  }
  const fromSeed = getValueByPath(fromObject, ["seed"]);
  if (parentObject !== void 0 && fromSeed != null) {
    setValueByPath(parentObject, ["parameters", "seed"], fromSeed);
  }
  const fromSafetyFilterLevel = getValueByPath(fromObject, [
    "safetyFilterLevel"
  ]);
  if (parentObject !== void 0 && fromSafetyFilterLevel != null) {
    setValueByPath(parentObject, ["parameters", "safetySetting"], fromSafetyFilterLevel);
  }
  const fromPersonGeneration = getValueByPath(fromObject, [
    "personGeneration"
  ]);
  if (parentObject !== void 0 && fromPersonGeneration != null) {
    setValueByPath(parentObject, ["parameters", "personGeneration"], fromPersonGeneration);
  }
  const fromIncludeSafetyAttributes = getValueByPath(fromObject, [
    "includeSafetyAttributes"
  ]);
  if (parentObject !== void 0 && fromIncludeSafetyAttributes != null) {
    setValueByPath(parentObject, ["parameters", "includeSafetyAttributes"], fromIncludeSafetyAttributes);
  }
  const fromIncludeRaiReason = getValueByPath(fromObject, [
    "includeRaiReason"
  ]);
  if (parentObject !== void 0 && fromIncludeRaiReason != null) {
    setValueByPath(parentObject, ["parameters", "includeRaiReason"], fromIncludeRaiReason);
  }
  const fromLanguage = getValueByPath(fromObject, ["language"]);
  if (parentObject !== void 0 && fromLanguage != null) {
    setValueByPath(parentObject, ["parameters", "language"], fromLanguage);
  }
  const fromOutputMimeType = getValueByPath(fromObject, [
    "outputMimeType"
  ]);
  if (parentObject !== void 0 && fromOutputMimeType != null) {
    setValueByPath(parentObject, ["parameters", "outputOptions", "mimeType"], fromOutputMimeType);
  }
  const fromOutputCompressionQuality = getValueByPath(fromObject, [
    "outputCompressionQuality"
  ]);
  if (parentObject !== void 0 && fromOutputCompressionQuality != null) {
    setValueByPath(parentObject, ["parameters", "outputOptions", "compressionQuality"], fromOutputCompressionQuality);
  }
  const fromAddWatermark = getValueByPath(fromObject, ["addWatermark"]);
  if (parentObject !== void 0 && fromAddWatermark != null) {
    setValueByPath(parentObject, ["parameters", "addWatermark"], fromAddWatermark);
  }
  const fromLabels = getValueByPath(fromObject, ["labels"]);
  if (parentObject !== void 0 && fromLabels != null) {
    setValueByPath(parentObject, ["labels"], fromLabels);
  }
  const fromImageSize = getValueByPath(fromObject, ["imageSize"]);
  if (parentObject !== void 0 && fromImageSize != null) {
    setValueByPath(parentObject, ["parameters", "sampleImageSize"], fromImageSize);
  }
  const fromEnhancePrompt = getValueByPath(fromObject, [
    "enhancePrompt"
  ]);
  if (parentObject !== void 0 && fromEnhancePrompt != null) {
    setValueByPath(parentObject, ["parameters", "enhancePrompt"], fromEnhancePrompt);
  }
  return toObject;
}
__name(generateImagesConfigToVertex, "generateImagesConfigToVertex");
function generateImagesParametersToMldev(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromPrompt = getValueByPath(fromObject, ["prompt"]);
  if (fromPrompt != null) {
    setValueByPath(toObject, ["instances[0]", "prompt"], fromPrompt);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    generateImagesConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(generateImagesParametersToMldev, "generateImagesParametersToMldev");
function generateImagesParametersToVertex(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromPrompt = getValueByPath(fromObject, ["prompt"]);
  if (fromPrompt != null) {
    setValueByPath(toObject, ["instances[0]", "prompt"], fromPrompt);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    generateImagesConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(generateImagesParametersToVertex, "generateImagesParametersToVertex");
function generateImagesResponseFromMldev(fromObject, rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromGeneratedImages = getValueByPath(fromObject, [
    "predictions"
  ]);
  if (fromGeneratedImages != null) {
    let transformedList = fromGeneratedImages;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return generatedImageFromMldev(item);
      });
    }
    setValueByPath(toObject, ["generatedImages"], transformedList);
  }
  const fromPositivePromptSafetyAttributes = getValueByPath(fromObject, [
    "positivePromptSafetyAttributes"
  ]);
  if (fromPositivePromptSafetyAttributes != null) {
    setValueByPath(toObject, ["positivePromptSafetyAttributes"], safetyAttributesFromMldev(fromPositivePromptSafetyAttributes));
  }
  return toObject;
}
__name(generateImagesResponseFromMldev, "generateImagesResponseFromMldev");
function generateImagesResponseFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromGeneratedImages = getValueByPath(fromObject, [
    "predictions"
  ]);
  if (fromGeneratedImages != null) {
    let transformedList = fromGeneratedImages;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return generatedImageFromVertex(item);
      });
    }
    setValueByPath(toObject, ["generatedImages"], transformedList);
  }
  const fromPositivePromptSafetyAttributes = getValueByPath(fromObject, [
    "positivePromptSafetyAttributes"
  ]);
  if (fromPositivePromptSafetyAttributes != null) {
    setValueByPath(toObject, ["positivePromptSafetyAttributes"], safetyAttributesFromVertex(fromPositivePromptSafetyAttributes));
  }
  return toObject;
}
__name(generateImagesResponseFromVertex, "generateImagesResponseFromVertex");
function generateVideosConfigToMldev(fromObject, parentObject, rootObject) {
  const toObject = {};
  const fromNumberOfVideos = getValueByPath(fromObject, [
    "numberOfVideos"
  ]);
  if (parentObject !== void 0 && fromNumberOfVideos != null) {
    setValueByPath(parentObject, ["parameters", "sampleCount"], fromNumberOfVideos);
  }
  if (getValueByPath(fromObject, ["outputGcsUri"]) !== void 0) {
    throw new Error("outputGcsUri parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["fps"]) !== void 0) {
    throw new Error("fps parameter is not supported in Gemini API.");
  }
  const fromDurationSeconds = getValueByPath(fromObject, [
    "durationSeconds"
  ]);
  if (parentObject !== void 0 && fromDurationSeconds != null) {
    setValueByPath(parentObject, ["parameters", "durationSeconds"], fromDurationSeconds);
  }
  if (getValueByPath(fromObject, ["seed"]) !== void 0) {
    throw new Error("seed parameter is not supported in Gemini API.");
  }
  const fromAspectRatio = getValueByPath(fromObject, ["aspectRatio"]);
  if (parentObject !== void 0 && fromAspectRatio != null) {
    setValueByPath(parentObject, ["parameters", "aspectRatio"], fromAspectRatio);
  }
  const fromResolution = getValueByPath(fromObject, ["resolution"]);
  if (parentObject !== void 0 && fromResolution != null) {
    setValueByPath(parentObject, ["parameters", "resolution"], fromResolution);
  }
  const fromPersonGeneration = getValueByPath(fromObject, [
    "personGeneration"
  ]);
  if (parentObject !== void 0 && fromPersonGeneration != null) {
    setValueByPath(parentObject, ["parameters", "personGeneration"], fromPersonGeneration);
  }
  if (getValueByPath(fromObject, ["pubsubTopic"]) !== void 0) {
    throw new Error("pubsubTopic parameter is not supported in Gemini API.");
  }
  const fromNegativePrompt = getValueByPath(fromObject, [
    "negativePrompt"
  ]);
  if (parentObject !== void 0 && fromNegativePrompt != null) {
    setValueByPath(parentObject, ["parameters", "negativePrompt"], fromNegativePrompt);
  }
  const fromEnhancePrompt = getValueByPath(fromObject, [
    "enhancePrompt"
  ]);
  if (parentObject !== void 0 && fromEnhancePrompt != null) {
    setValueByPath(parentObject, ["parameters", "enhancePrompt"], fromEnhancePrompt);
  }
  if (getValueByPath(fromObject, ["generateAudio"]) !== void 0) {
    throw new Error("generateAudio parameter is not supported in Gemini API.");
  }
  const fromLastFrame = getValueByPath(fromObject, ["lastFrame"]);
  if (parentObject !== void 0 && fromLastFrame != null) {
    setValueByPath(parentObject, ["instances[0]", "lastFrame"], imageToMldev(fromLastFrame));
  }
  const fromReferenceImages = getValueByPath(fromObject, [
    "referenceImages"
  ]);
  if (parentObject !== void 0 && fromReferenceImages != null) {
    let transformedList = fromReferenceImages;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return videoGenerationReferenceImageToMldev(item);
      });
    }
    setValueByPath(parentObject, ["instances[0]", "referenceImages"], transformedList);
  }
  if (getValueByPath(fromObject, ["mask"]) !== void 0) {
    throw new Error("mask parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["compressionQuality"]) !== void 0) {
    throw new Error("compressionQuality parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(generateVideosConfigToMldev, "generateVideosConfigToMldev");
function generateVideosConfigToVertex(fromObject, parentObject, rootObject) {
  const toObject = {};
  const fromNumberOfVideos = getValueByPath(fromObject, [
    "numberOfVideos"
  ]);
  if (parentObject !== void 0 && fromNumberOfVideos != null) {
    setValueByPath(parentObject, ["parameters", "sampleCount"], fromNumberOfVideos);
  }
  const fromOutputGcsUri = getValueByPath(fromObject, ["outputGcsUri"]);
  if (parentObject !== void 0 && fromOutputGcsUri != null) {
    setValueByPath(parentObject, ["parameters", "storageUri"], fromOutputGcsUri);
  }
  const fromFps = getValueByPath(fromObject, ["fps"]);
  if (parentObject !== void 0 && fromFps != null) {
    setValueByPath(parentObject, ["parameters", "fps"], fromFps);
  }
  const fromDurationSeconds = getValueByPath(fromObject, [
    "durationSeconds"
  ]);
  if (parentObject !== void 0 && fromDurationSeconds != null) {
    setValueByPath(parentObject, ["parameters", "durationSeconds"], fromDurationSeconds);
  }
  const fromSeed = getValueByPath(fromObject, ["seed"]);
  if (parentObject !== void 0 && fromSeed != null) {
    setValueByPath(parentObject, ["parameters", "seed"], fromSeed);
  }
  const fromAspectRatio = getValueByPath(fromObject, ["aspectRatio"]);
  if (parentObject !== void 0 && fromAspectRatio != null) {
    setValueByPath(parentObject, ["parameters", "aspectRatio"], fromAspectRatio);
  }
  const fromResolution = getValueByPath(fromObject, ["resolution"]);
  if (parentObject !== void 0 && fromResolution != null) {
    setValueByPath(parentObject, ["parameters", "resolution"], fromResolution);
  }
  const fromPersonGeneration = getValueByPath(fromObject, [
    "personGeneration"
  ]);
  if (parentObject !== void 0 && fromPersonGeneration != null) {
    setValueByPath(parentObject, ["parameters", "personGeneration"], fromPersonGeneration);
  }
  const fromPubsubTopic = getValueByPath(fromObject, ["pubsubTopic"]);
  if (parentObject !== void 0 && fromPubsubTopic != null) {
    setValueByPath(parentObject, ["parameters", "pubsubTopic"], fromPubsubTopic);
  }
  const fromNegativePrompt = getValueByPath(fromObject, [
    "negativePrompt"
  ]);
  if (parentObject !== void 0 && fromNegativePrompt != null) {
    setValueByPath(parentObject, ["parameters", "negativePrompt"], fromNegativePrompt);
  }
  const fromEnhancePrompt = getValueByPath(fromObject, [
    "enhancePrompt"
  ]);
  if (parentObject !== void 0 && fromEnhancePrompt != null) {
    setValueByPath(parentObject, ["parameters", "enhancePrompt"], fromEnhancePrompt);
  }
  const fromGenerateAudio = getValueByPath(fromObject, [
    "generateAudio"
  ]);
  if (parentObject !== void 0 && fromGenerateAudio != null) {
    setValueByPath(parentObject, ["parameters", "generateAudio"], fromGenerateAudio);
  }
  const fromLastFrame = getValueByPath(fromObject, ["lastFrame"]);
  if (parentObject !== void 0 && fromLastFrame != null) {
    setValueByPath(parentObject, ["instances[0]", "lastFrame"], imageToVertex(fromLastFrame));
  }
  const fromReferenceImages = getValueByPath(fromObject, [
    "referenceImages"
  ]);
  if (parentObject !== void 0 && fromReferenceImages != null) {
    let transformedList = fromReferenceImages;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return videoGenerationReferenceImageToVertex(item);
      });
    }
    setValueByPath(parentObject, ["instances[0]", "referenceImages"], transformedList);
  }
  const fromMask = getValueByPath(fromObject, ["mask"]);
  if (parentObject !== void 0 && fromMask != null) {
    setValueByPath(parentObject, ["instances[0]", "mask"], videoGenerationMaskToVertex(fromMask));
  }
  const fromCompressionQuality = getValueByPath(fromObject, [
    "compressionQuality"
  ]);
  if (parentObject !== void 0 && fromCompressionQuality != null) {
    setValueByPath(parentObject, ["parameters", "compressionQuality"], fromCompressionQuality);
  }
  return toObject;
}
__name(generateVideosConfigToVertex, "generateVideosConfigToVertex");
function generateVideosOperationFromMldev(fromObject, rootObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromMetadata = getValueByPath(fromObject, ["metadata"]);
  if (fromMetadata != null) {
    setValueByPath(toObject, ["metadata"], fromMetadata);
  }
  const fromDone = getValueByPath(fromObject, ["done"]);
  if (fromDone != null) {
    setValueByPath(toObject, ["done"], fromDone);
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  const fromResponse = getValueByPath(fromObject, [
    "response",
    "generateVideoResponse"
  ]);
  if (fromResponse != null) {
    setValueByPath(toObject, ["response"], generateVideosResponseFromMldev(fromResponse));
  }
  return toObject;
}
__name(generateVideosOperationFromMldev, "generateVideosOperationFromMldev");
function generateVideosOperationFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromMetadata = getValueByPath(fromObject, ["metadata"]);
  if (fromMetadata != null) {
    setValueByPath(toObject, ["metadata"], fromMetadata);
  }
  const fromDone = getValueByPath(fromObject, ["done"]);
  if (fromDone != null) {
    setValueByPath(toObject, ["done"], fromDone);
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  const fromResponse = getValueByPath(fromObject, ["response"]);
  if (fromResponse != null) {
    setValueByPath(toObject, ["response"], generateVideosResponseFromVertex(fromResponse));
  }
  return toObject;
}
__name(generateVideosOperationFromVertex, "generateVideosOperationFromVertex");
function generateVideosParametersToMldev(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromPrompt = getValueByPath(fromObject, ["prompt"]);
  if (fromPrompt != null) {
    setValueByPath(toObject, ["instances[0]", "prompt"], fromPrompt);
  }
  const fromImage = getValueByPath(fromObject, ["image"]);
  if (fromImage != null) {
    setValueByPath(toObject, ["instances[0]", "image"], imageToMldev(fromImage));
  }
  const fromVideo = getValueByPath(fromObject, ["video"]);
  if (fromVideo != null) {
    setValueByPath(toObject, ["instances[0]", "video"], videoToMldev(fromVideo));
  }
  const fromSource = getValueByPath(fromObject, ["source"]);
  if (fromSource != null) {
    generateVideosSourceToMldev(fromSource, toObject);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    generateVideosConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(generateVideosParametersToMldev, "generateVideosParametersToMldev");
function generateVideosParametersToVertex(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromPrompt = getValueByPath(fromObject, ["prompt"]);
  if (fromPrompt != null) {
    setValueByPath(toObject, ["instances[0]", "prompt"], fromPrompt);
  }
  const fromImage = getValueByPath(fromObject, ["image"]);
  if (fromImage != null) {
    setValueByPath(toObject, ["instances[0]", "image"], imageToVertex(fromImage));
  }
  const fromVideo = getValueByPath(fromObject, ["video"]);
  if (fromVideo != null) {
    setValueByPath(toObject, ["instances[0]", "video"], videoToVertex(fromVideo));
  }
  const fromSource = getValueByPath(fromObject, ["source"]);
  if (fromSource != null) {
    generateVideosSourceToVertex(fromSource, toObject);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    generateVideosConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(generateVideosParametersToVertex, "generateVideosParametersToVertex");
function generateVideosResponseFromMldev(fromObject, rootObject) {
  const toObject = {};
  const fromGeneratedVideos = getValueByPath(fromObject, [
    "generatedSamples"
  ]);
  if (fromGeneratedVideos != null) {
    let transformedList = fromGeneratedVideos;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return generatedVideoFromMldev(item);
      });
    }
    setValueByPath(toObject, ["generatedVideos"], transformedList);
  }
  const fromRaiMediaFilteredCount = getValueByPath(fromObject, [
    "raiMediaFilteredCount"
  ]);
  if (fromRaiMediaFilteredCount != null) {
    setValueByPath(toObject, ["raiMediaFilteredCount"], fromRaiMediaFilteredCount);
  }
  const fromRaiMediaFilteredReasons = getValueByPath(fromObject, [
    "raiMediaFilteredReasons"
  ]);
  if (fromRaiMediaFilteredReasons != null) {
    setValueByPath(toObject, ["raiMediaFilteredReasons"], fromRaiMediaFilteredReasons);
  }
  return toObject;
}
__name(generateVideosResponseFromMldev, "generateVideosResponseFromMldev");
function generateVideosResponseFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromGeneratedVideos = getValueByPath(fromObject, ["videos"]);
  if (fromGeneratedVideos != null) {
    let transformedList = fromGeneratedVideos;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return generatedVideoFromVertex(item);
      });
    }
    setValueByPath(toObject, ["generatedVideos"], transformedList);
  }
  const fromRaiMediaFilteredCount = getValueByPath(fromObject, [
    "raiMediaFilteredCount"
  ]);
  if (fromRaiMediaFilteredCount != null) {
    setValueByPath(toObject, ["raiMediaFilteredCount"], fromRaiMediaFilteredCount);
  }
  const fromRaiMediaFilteredReasons = getValueByPath(fromObject, [
    "raiMediaFilteredReasons"
  ]);
  if (fromRaiMediaFilteredReasons != null) {
    setValueByPath(toObject, ["raiMediaFilteredReasons"], fromRaiMediaFilteredReasons);
  }
  return toObject;
}
__name(generateVideosResponseFromVertex, "generateVideosResponseFromVertex");
function generateVideosSourceToMldev(fromObject, parentObject, rootObject) {
  const toObject = {};
  const fromPrompt = getValueByPath(fromObject, ["prompt"]);
  if (parentObject !== void 0 && fromPrompt != null) {
    setValueByPath(parentObject, ["instances[0]", "prompt"], fromPrompt);
  }
  const fromImage = getValueByPath(fromObject, ["image"]);
  if (parentObject !== void 0 && fromImage != null) {
    setValueByPath(parentObject, ["instances[0]", "image"], imageToMldev(fromImage));
  }
  const fromVideo = getValueByPath(fromObject, ["video"]);
  if (parentObject !== void 0 && fromVideo != null) {
    setValueByPath(parentObject, ["instances[0]", "video"], videoToMldev(fromVideo));
  }
  return toObject;
}
__name(generateVideosSourceToMldev, "generateVideosSourceToMldev");
function generateVideosSourceToVertex(fromObject, parentObject, rootObject) {
  const toObject = {};
  const fromPrompt = getValueByPath(fromObject, ["prompt"]);
  if (parentObject !== void 0 && fromPrompt != null) {
    setValueByPath(parentObject, ["instances[0]", "prompt"], fromPrompt);
  }
  const fromImage = getValueByPath(fromObject, ["image"]);
  if (parentObject !== void 0 && fromImage != null) {
    setValueByPath(parentObject, ["instances[0]", "image"], imageToVertex(fromImage));
  }
  const fromVideo = getValueByPath(fromObject, ["video"]);
  if (parentObject !== void 0 && fromVideo != null) {
    setValueByPath(parentObject, ["instances[0]", "video"], videoToVertex(fromVideo));
  }
  return toObject;
}
__name(generateVideosSourceToVertex, "generateVideosSourceToVertex");
function generatedImageFromMldev(fromObject, rootObject) {
  const toObject = {};
  const fromImage = getValueByPath(fromObject, ["_self"]);
  if (fromImage != null) {
    setValueByPath(toObject, ["image"], imageFromMldev(fromImage));
  }
  const fromRaiFilteredReason = getValueByPath(fromObject, [
    "raiFilteredReason"
  ]);
  if (fromRaiFilteredReason != null) {
    setValueByPath(toObject, ["raiFilteredReason"], fromRaiFilteredReason);
  }
  const fromSafetyAttributes = getValueByPath(fromObject, ["_self"]);
  if (fromSafetyAttributes != null) {
    setValueByPath(toObject, ["safetyAttributes"], safetyAttributesFromMldev(fromSafetyAttributes));
  }
  return toObject;
}
__name(generatedImageFromMldev, "generatedImageFromMldev");
function generatedImageFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromImage = getValueByPath(fromObject, ["_self"]);
  if (fromImage != null) {
    setValueByPath(toObject, ["image"], imageFromVertex(fromImage));
  }
  const fromRaiFilteredReason = getValueByPath(fromObject, [
    "raiFilteredReason"
  ]);
  if (fromRaiFilteredReason != null) {
    setValueByPath(toObject, ["raiFilteredReason"], fromRaiFilteredReason);
  }
  const fromSafetyAttributes = getValueByPath(fromObject, ["_self"]);
  if (fromSafetyAttributes != null) {
    setValueByPath(toObject, ["safetyAttributes"], safetyAttributesFromVertex(fromSafetyAttributes));
  }
  const fromEnhancedPrompt = getValueByPath(fromObject, ["prompt"]);
  if (fromEnhancedPrompt != null) {
    setValueByPath(toObject, ["enhancedPrompt"], fromEnhancedPrompt);
  }
  return toObject;
}
__name(generatedImageFromVertex, "generatedImageFromVertex");
function generatedImageMaskFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromMask = getValueByPath(fromObject, ["_self"]);
  if (fromMask != null) {
    setValueByPath(toObject, ["mask"], imageFromVertex(fromMask));
  }
  const fromLabels = getValueByPath(fromObject, ["labels"]);
  if (fromLabels != null) {
    let transformedList = fromLabels;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["labels"], transformedList);
  }
  return toObject;
}
__name(generatedImageMaskFromVertex, "generatedImageMaskFromVertex");
function generatedVideoFromMldev(fromObject, rootObject) {
  const toObject = {};
  const fromVideo = getValueByPath(fromObject, ["video"]);
  if (fromVideo != null) {
    setValueByPath(toObject, ["video"], videoFromMldev(fromVideo));
  }
  return toObject;
}
__name(generatedVideoFromMldev, "generatedVideoFromMldev");
function generatedVideoFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromVideo = getValueByPath(fromObject, ["_self"]);
  if (fromVideo != null) {
    setValueByPath(toObject, ["video"], videoFromVertex(fromVideo));
  }
  return toObject;
}
__name(generatedVideoFromVertex, "generatedVideoFromVertex");
function generationConfigToVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromModelSelectionConfig = getValueByPath(fromObject, [
    "modelSelectionConfig"
  ]);
  if (fromModelSelectionConfig != null) {
    setValueByPath(toObject, ["modelConfig"], fromModelSelectionConfig);
  }
  const fromResponseJsonSchema = getValueByPath(fromObject, [
    "responseJsonSchema"
  ]);
  if (fromResponseJsonSchema != null) {
    setValueByPath(toObject, ["responseJsonSchema"], fromResponseJsonSchema);
  }
  const fromAudioTimestamp = getValueByPath(fromObject, [
    "audioTimestamp"
  ]);
  if (fromAudioTimestamp != null) {
    setValueByPath(toObject, ["audioTimestamp"], fromAudioTimestamp);
  }
  const fromCandidateCount = getValueByPath(fromObject, [
    "candidateCount"
  ]);
  if (fromCandidateCount != null) {
    setValueByPath(toObject, ["candidateCount"], fromCandidateCount);
  }
  const fromEnableAffectiveDialog = getValueByPath(fromObject, [
    "enableAffectiveDialog"
  ]);
  if (fromEnableAffectiveDialog != null) {
    setValueByPath(toObject, ["enableAffectiveDialog"], fromEnableAffectiveDialog);
  }
  const fromFrequencyPenalty = getValueByPath(fromObject, [
    "frequencyPenalty"
  ]);
  if (fromFrequencyPenalty != null) {
    setValueByPath(toObject, ["frequencyPenalty"], fromFrequencyPenalty);
  }
  const fromLogprobs = getValueByPath(fromObject, ["logprobs"]);
  if (fromLogprobs != null) {
    setValueByPath(toObject, ["logprobs"], fromLogprobs);
  }
  const fromMaxOutputTokens = getValueByPath(fromObject, [
    "maxOutputTokens"
  ]);
  if (fromMaxOutputTokens != null) {
    setValueByPath(toObject, ["maxOutputTokens"], fromMaxOutputTokens);
  }
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (fromMediaResolution != null) {
    setValueByPath(toObject, ["mediaResolution"], fromMediaResolution);
  }
  const fromPresencePenalty = getValueByPath(fromObject, [
    "presencePenalty"
  ]);
  if (fromPresencePenalty != null) {
    setValueByPath(toObject, ["presencePenalty"], fromPresencePenalty);
  }
  const fromResponseLogprobs = getValueByPath(fromObject, [
    "responseLogprobs"
  ]);
  if (fromResponseLogprobs != null) {
    setValueByPath(toObject, ["responseLogprobs"], fromResponseLogprobs);
  }
  const fromResponseMimeType = getValueByPath(fromObject, [
    "responseMimeType"
  ]);
  if (fromResponseMimeType != null) {
    setValueByPath(toObject, ["responseMimeType"], fromResponseMimeType);
  }
  const fromResponseModalities = getValueByPath(fromObject, [
    "responseModalities"
  ]);
  if (fromResponseModalities != null) {
    setValueByPath(toObject, ["responseModalities"], fromResponseModalities);
  }
  const fromResponseSchema = getValueByPath(fromObject, [
    "responseSchema"
  ]);
  if (fromResponseSchema != null) {
    setValueByPath(toObject, ["responseSchema"], fromResponseSchema);
  }
  const fromRoutingConfig = getValueByPath(fromObject, [
    "routingConfig"
  ]);
  if (fromRoutingConfig != null) {
    setValueByPath(toObject, ["routingConfig"], fromRoutingConfig);
  }
  const fromSeed = getValueByPath(fromObject, ["seed"]);
  if (fromSeed != null) {
    setValueByPath(toObject, ["seed"], fromSeed);
  }
  const fromSpeechConfig = getValueByPath(fromObject, ["speechConfig"]);
  if (fromSpeechConfig != null) {
    setValueByPath(toObject, ["speechConfig"], fromSpeechConfig);
  }
  const fromStopSequences = getValueByPath(fromObject, [
    "stopSequences"
  ]);
  if (fromStopSequences != null) {
    setValueByPath(toObject, ["stopSequences"], fromStopSequences);
  }
  const fromTemperature = getValueByPath(fromObject, ["temperature"]);
  if (fromTemperature != null) {
    setValueByPath(toObject, ["temperature"], fromTemperature);
  }
  const fromThinkingConfig = getValueByPath(fromObject, [
    "thinkingConfig"
  ]);
  if (fromThinkingConfig != null) {
    setValueByPath(toObject, ["thinkingConfig"], fromThinkingConfig);
  }
  const fromTopK = getValueByPath(fromObject, ["topK"]);
  if (fromTopK != null) {
    setValueByPath(toObject, ["topK"], fromTopK);
  }
  const fromTopP = getValueByPath(fromObject, ["topP"]);
  if (fromTopP != null) {
    setValueByPath(toObject, ["topP"], fromTopP);
  }
  if (getValueByPath(fromObject, ["enableEnhancedCivicAnswers"]) !== void 0) {
    throw new Error("enableEnhancedCivicAnswers parameter is not supported in Vertex AI.");
  }
  return toObject;
}
__name(generationConfigToVertex, "generationConfigToVertex");
function getModelParametersToMldev(apiClient, fromObject, _rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "name"], tModel(apiClient, fromModel));
  }
  return toObject;
}
__name(getModelParametersToMldev, "getModelParametersToMldev");
function getModelParametersToVertex(apiClient, fromObject, _rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "name"], tModel(apiClient, fromModel));
  }
  return toObject;
}
__name(getModelParametersToVertex, "getModelParametersToVertex");
function googleMapsToMldev$1(fromObject, _rootObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["authConfig"]) !== void 0) {
    throw new Error("authConfig parameter is not supported in Gemini API.");
  }
  const fromEnableWidget = getValueByPath(fromObject, ["enableWidget"]);
  if (fromEnableWidget != null) {
    setValueByPath(toObject, ["enableWidget"], fromEnableWidget);
  }
  return toObject;
}
__name(googleMapsToMldev$1, "googleMapsToMldev$1");
function googleSearchToMldev$1(fromObject, _rootObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["excludeDomains"]) !== void 0) {
    throw new Error("excludeDomains parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["blockingConfidence"]) !== void 0) {
    throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  }
  const fromTimeRangeFilter = getValueByPath(fromObject, [
    "timeRangeFilter"
  ]);
  if (fromTimeRangeFilter != null) {
    setValueByPath(toObject, ["timeRangeFilter"], fromTimeRangeFilter);
  }
  return toObject;
}
__name(googleSearchToMldev$1, "googleSearchToMldev$1");
function imageConfigToMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromAspectRatio = getValueByPath(fromObject, ["aspectRatio"]);
  if (fromAspectRatio != null) {
    setValueByPath(toObject, ["aspectRatio"], fromAspectRatio);
  }
  const fromImageSize = getValueByPath(fromObject, ["imageSize"]);
  if (fromImageSize != null) {
    setValueByPath(toObject, ["imageSize"], fromImageSize);
  }
  if (getValueByPath(fromObject, ["personGeneration"]) !== void 0) {
    throw new Error("personGeneration parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["outputMimeType"]) !== void 0) {
    throw new Error("outputMimeType parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["outputCompressionQuality"]) !== void 0) {
    throw new Error("outputCompressionQuality parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(imageConfigToMldev, "imageConfigToMldev");
function imageConfigToVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromAspectRatio = getValueByPath(fromObject, ["aspectRatio"]);
  if (fromAspectRatio != null) {
    setValueByPath(toObject, ["aspectRatio"], fromAspectRatio);
  }
  const fromImageSize = getValueByPath(fromObject, ["imageSize"]);
  if (fromImageSize != null) {
    setValueByPath(toObject, ["imageSize"], fromImageSize);
  }
  const fromPersonGeneration = getValueByPath(fromObject, [
    "personGeneration"
  ]);
  if (fromPersonGeneration != null) {
    setValueByPath(toObject, ["personGeneration"], fromPersonGeneration);
  }
  const fromOutputMimeType = getValueByPath(fromObject, [
    "outputMimeType"
  ]);
  if (fromOutputMimeType != null) {
    setValueByPath(toObject, ["imageOutputOptions", "mimeType"], fromOutputMimeType);
  }
  const fromOutputCompressionQuality = getValueByPath(fromObject, [
    "outputCompressionQuality"
  ]);
  if (fromOutputCompressionQuality != null) {
    setValueByPath(toObject, ["imageOutputOptions", "compressionQuality"], fromOutputCompressionQuality);
  }
  return toObject;
}
__name(imageConfigToVertex, "imageConfigToVertex");
function imageFromMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromImageBytes = getValueByPath(fromObject, [
    "bytesBase64Encoded"
  ]);
  if (fromImageBytes != null) {
    setValueByPath(toObject, ["imageBytes"], tBytes(fromImageBytes));
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(imageFromMldev, "imageFromMldev");
function imageFromVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromGcsUri = getValueByPath(fromObject, ["gcsUri"]);
  if (fromGcsUri != null) {
    setValueByPath(toObject, ["gcsUri"], fromGcsUri);
  }
  const fromImageBytes = getValueByPath(fromObject, [
    "bytesBase64Encoded"
  ]);
  if (fromImageBytes != null) {
    setValueByPath(toObject, ["imageBytes"], tBytes(fromImageBytes));
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(imageFromVertex, "imageFromVertex");
function imageToMldev(fromObject, _rootObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["gcsUri"]) !== void 0) {
    throw new Error("gcsUri parameter is not supported in Gemini API.");
  }
  const fromImageBytes = getValueByPath(fromObject, ["imageBytes"]);
  if (fromImageBytes != null) {
    setValueByPath(toObject, ["bytesBase64Encoded"], tBytes(fromImageBytes));
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(imageToMldev, "imageToMldev");
function imageToVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromGcsUri = getValueByPath(fromObject, ["gcsUri"]);
  if (fromGcsUri != null) {
    setValueByPath(toObject, ["gcsUri"], fromGcsUri);
  }
  const fromImageBytes = getValueByPath(fromObject, ["imageBytes"]);
  if (fromImageBytes != null) {
    setValueByPath(toObject, ["bytesBase64Encoded"], tBytes(fromImageBytes));
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(imageToVertex, "imageToVertex");
function listModelsConfigToMldev(apiClient, fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
  if (parentObject !== void 0 && fromPageSize != null) {
    setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
  }
  const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
  if (parentObject !== void 0 && fromPageToken != null) {
    setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
  }
  const fromFilter = getValueByPath(fromObject, ["filter"]);
  if (parentObject !== void 0 && fromFilter != null) {
    setValueByPath(parentObject, ["_query", "filter"], fromFilter);
  }
  const fromQueryBase = getValueByPath(fromObject, ["queryBase"]);
  if (parentObject !== void 0 && fromQueryBase != null) {
    setValueByPath(parentObject, ["_url", "models_url"], tModelsUrl(apiClient, fromQueryBase));
  }
  return toObject;
}
__name(listModelsConfigToMldev, "listModelsConfigToMldev");
function listModelsConfigToVertex(apiClient, fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
  if (parentObject !== void 0 && fromPageSize != null) {
    setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
  }
  const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
  if (parentObject !== void 0 && fromPageToken != null) {
    setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
  }
  const fromFilter = getValueByPath(fromObject, ["filter"]);
  if (parentObject !== void 0 && fromFilter != null) {
    setValueByPath(parentObject, ["_query", "filter"], fromFilter);
  }
  const fromQueryBase = getValueByPath(fromObject, ["queryBase"]);
  if (parentObject !== void 0 && fromQueryBase != null) {
    setValueByPath(parentObject, ["_url", "models_url"], tModelsUrl(apiClient, fromQueryBase));
  }
  return toObject;
}
__name(listModelsConfigToVertex, "listModelsConfigToVertex");
function listModelsParametersToMldev(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    listModelsConfigToMldev(apiClient, fromConfig, toObject);
  }
  return toObject;
}
__name(listModelsParametersToMldev, "listModelsParametersToMldev");
function listModelsParametersToVertex(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    listModelsConfigToVertex(apiClient, fromConfig, toObject);
  }
  return toObject;
}
__name(listModelsParametersToVertex, "listModelsParametersToVertex");
function listModelsResponseFromMldev(fromObject, rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromNextPageToken = getValueByPath(fromObject, [
    "nextPageToken"
  ]);
  if (fromNextPageToken != null) {
    setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
  }
  const fromModels = getValueByPath(fromObject, ["_self"]);
  if (fromModels != null) {
    let transformedList = tExtractModels(fromModels);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return modelFromMldev(item);
      });
    }
    setValueByPath(toObject, ["models"], transformedList);
  }
  return toObject;
}
__name(listModelsResponseFromMldev, "listModelsResponseFromMldev");
function listModelsResponseFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromNextPageToken = getValueByPath(fromObject, [
    "nextPageToken"
  ]);
  if (fromNextPageToken != null) {
    setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
  }
  const fromModels = getValueByPath(fromObject, ["_self"]);
  if (fromModels != null) {
    let transformedList = tExtractModels(fromModels);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return modelFromVertex(item);
      });
    }
    setValueByPath(toObject, ["models"], transformedList);
  }
  return toObject;
}
__name(listModelsResponseFromVertex, "listModelsResponseFromVertex");
function maskReferenceConfigToVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromMaskMode = getValueByPath(fromObject, ["maskMode"]);
  if (fromMaskMode != null) {
    setValueByPath(toObject, ["maskMode"], fromMaskMode);
  }
  const fromSegmentationClasses = getValueByPath(fromObject, [
    "segmentationClasses"
  ]);
  if (fromSegmentationClasses != null) {
    setValueByPath(toObject, ["maskClasses"], fromSegmentationClasses);
  }
  const fromMaskDilation = getValueByPath(fromObject, ["maskDilation"]);
  if (fromMaskDilation != null) {
    setValueByPath(toObject, ["dilation"], fromMaskDilation);
  }
  return toObject;
}
__name(maskReferenceConfigToVertex, "maskReferenceConfigToVertex");
function modelFromMldev(fromObject, rootObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
  if (fromDisplayName != null) {
    setValueByPath(toObject, ["displayName"], fromDisplayName);
  }
  const fromDescription = getValueByPath(fromObject, ["description"]);
  if (fromDescription != null) {
    setValueByPath(toObject, ["description"], fromDescription);
  }
  const fromVersion = getValueByPath(fromObject, ["version"]);
  if (fromVersion != null) {
    setValueByPath(toObject, ["version"], fromVersion);
  }
  const fromTunedModelInfo = getValueByPath(fromObject, ["_self"]);
  if (fromTunedModelInfo != null) {
    setValueByPath(toObject, ["tunedModelInfo"], tunedModelInfoFromMldev(fromTunedModelInfo));
  }
  const fromInputTokenLimit = getValueByPath(fromObject, [
    "inputTokenLimit"
  ]);
  if (fromInputTokenLimit != null) {
    setValueByPath(toObject, ["inputTokenLimit"], fromInputTokenLimit);
  }
  const fromOutputTokenLimit = getValueByPath(fromObject, [
    "outputTokenLimit"
  ]);
  if (fromOutputTokenLimit != null) {
    setValueByPath(toObject, ["outputTokenLimit"], fromOutputTokenLimit);
  }
  const fromSupportedActions = getValueByPath(fromObject, [
    "supportedGenerationMethods"
  ]);
  if (fromSupportedActions != null) {
    setValueByPath(toObject, ["supportedActions"], fromSupportedActions);
  }
  const fromTemperature = getValueByPath(fromObject, ["temperature"]);
  if (fromTemperature != null) {
    setValueByPath(toObject, ["temperature"], fromTemperature);
  }
  const fromMaxTemperature = getValueByPath(fromObject, [
    "maxTemperature"
  ]);
  if (fromMaxTemperature != null) {
    setValueByPath(toObject, ["maxTemperature"], fromMaxTemperature);
  }
  const fromTopP = getValueByPath(fromObject, ["topP"]);
  if (fromTopP != null) {
    setValueByPath(toObject, ["topP"], fromTopP);
  }
  const fromTopK = getValueByPath(fromObject, ["topK"]);
  if (fromTopK != null) {
    setValueByPath(toObject, ["topK"], fromTopK);
  }
  const fromThinking = getValueByPath(fromObject, ["thinking"]);
  if (fromThinking != null) {
    setValueByPath(toObject, ["thinking"], fromThinking);
  }
  return toObject;
}
__name(modelFromMldev, "modelFromMldev");
function modelFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
  if (fromDisplayName != null) {
    setValueByPath(toObject, ["displayName"], fromDisplayName);
  }
  const fromDescription = getValueByPath(fromObject, ["description"]);
  if (fromDescription != null) {
    setValueByPath(toObject, ["description"], fromDescription);
  }
  const fromVersion = getValueByPath(fromObject, ["versionId"]);
  if (fromVersion != null) {
    setValueByPath(toObject, ["version"], fromVersion);
  }
  const fromEndpoints = getValueByPath(fromObject, ["deployedModels"]);
  if (fromEndpoints != null) {
    let transformedList = fromEndpoints;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return endpointFromVertex(item);
      });
    }
    setValueByPath(toObject, ["endpoints"], transformedList);
  }
  const fromLabels = getValueByPath(fromObject, ["labels"]);
  if (fromLabels != null) {
    setValueByPath(toObject, ["labels"], fromLabels);
  }
  const fromTunedModelInfo = getValueByPath(fromObject, ["_self"]);
  if (fromTunedModelInfo != null) {
    setValueByPath(toObject, ["tunedModelInfo"], tunedModelInfoFromVertex(fromTunedModelInfo));
  }
  const fromDefaultCheckpointId = getValueByPath(fromObject, [
    "defaultCheckpointId"
  ]);
  if (fromDefaultCheckpointId != null) {
    setValueByPath(toObject, ["defaultCheckpointId"], fromDefaultCheckpointId);
  }
  const fromCheckpoints = getValueByPath(fromObject, ["checkpoints"]);
  if (fromCheckpoints != null) {
    let transformedList = fromCheckpoints;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["checkpoints"], transformedList);
  }
  return toObject;
}
__name(modelFromVertex, "modelFromVertex");
function partToMldev$1(fromObject, rootObject) {
  const toObject = {};
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (fromMediaResolution != null) {
    setValueByPath(toObject, ["mediaResolution"], fromMediaResolution);
  }
  const fromCodeExecutionResult = getValueByPath(fromObject, [
    "codeExecutionResult"
  ]);
  if (fromCodeExecutionResult != null) {
    setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
  }
  const fromExecutableCode = getValueByPath(fromObject, [
    "executableCode"
  ]);
  if (fromExecutableCode != null) {
    setValueByPath(toObject, ["executableCode"], fromExecutableCode);
  }
  const fromFileData = getValueByPath(fromObject, ["fileData"]);
  if (fromFileData != null) {
    setValueByPath(toObject, ["fileData"], fileDataToMldev$1(fromFileData));
  }
  const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
  if (fromFunctionCall != null) {
    setValueByPath(toObject, ["functionCall"], functionCallToMldev$1(fromFunctionCall));
  }
  const fromFunctionResponse = getValueByPath(fromObject, [
    "functionResponse"
  ]);
  if (fromFunctionResponse != null) {
    setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
  }
  const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
  if (fromInlineData != null) {
    setValueByPath(toObject, ["inlineData"], blobToMldev$1(fromInlineData));
  }
  const fromText = getValueByPath(fromObject, ["text"]);
  if (fromText != null) {
    setValueByPath(toObject, ["text"], fromText);
  }
  const fromThought = getValueByPath(fromObject, ["thought"]);
  if (fromThought != null) {
    setValueByPath(toObject, ["thought"], fromThought);
  }
  const fromThoughtSignature = getValueByPath(fromObject, [
    "thoughtSignature"
  ]);
  if (fromThoughtSignature != null) {
    setValueByPath(toObject, ["thoughtSignature"], fromThoughtSignature);
  }
  const fromVideoMetadata = getValueByPath(fromObject, [
    "videoMetadata"
  ]);
  if (fromVideoMetadata != null) {
    setValueByPath(toObject, ["videoMetadata"], fromVideoMetadata);
  }
  return toObject;
}
__name(partToMldev$1, "partToMldev$1");
function productImageToVertex(fromObject, rootObject) {
  const toObject = {};
  const fromProductImage = getValueByPath(fromObject, ["productImage"]);
  if (fromProductImage != null) {
    setValueByPath(toObject, ["image"], imageToVertex(fromProductImage));
  }
  return toObject;
}
__name(productImageToVertex, "productImageToVertex");
function recontextImageConfigToVertex(fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromNumberOfImages = getValueByPath(fromObject, [
    "numberOfImages"
  ]);
  if (parentObject !== void 0 && fromNumberOfImages != null) {
    setValueByPath(parentObject, ["parameters", "sampleCount"], fromNumberOfImages);
  }
  const fromBaseSteps = getValueByPath(fromObject, ["baseSteps"]);
  if (parentObject !== void 0 && fromBaseSteps != null) {
    setValueByPath(parentObject, ["parameters", "baseSteps"], fromBaseSteps);
  }
  const fromOutputGcsUri = getValueByPath(fromObject, ["outputGcsUri"]);
  if (parentObject !== void 0 && fromOutputGcsUri != null) {
    setValueByPath(parentObject, ["parameters", "storageUri"], fromOutputGcsUri);
  }
  const fromSeed = getValueByPath(fromObject, ["seed"]);
  if (parentObject !== void 0 && fromSeed != null) {
    setValueByPath(parentObject, ["parameters", "seed"], fromSeed);
  }
  const fromSafetyFilterLevel = getValueByPath(fromObject, [
    "safetyFilterLevel"
  ]);
  if (parentObject !== void 0 && fromSafetyFilterLevel != null) {
    setValueByPath(parentObject, ["parameters", "safetySetting"], fromSafetyFilterLevel);
  }
  const fromPersonGeneration = getValueByPath(fromObject, [
    "personGeneration"
  ]);
  if (parentObject !== void 0 && fromPersonGeneration != null) {
    setValueByPath(parentObject, ["parameters", "personGeneration"], fromPersonGeneration);
  }
  const fromAddWatermark = getValueByPath(fromObject, ["addWatermark"]);
  if (parentObject !== void 0 && fromAddWatermark != null) {
    setValueByPath(parentObject, ["parameters", "addWatermark"], fromAddWatermark);
  }
  const fromOutputMimeType = getValueByPath(fromObject, [
    "outputMimeType"
  ]);
  if (parentObject !== void 0 && fromOutputMimeType != null) {
    setValueByPath(parentObject, ["parameters", "outputOptions", "mimeType"], fromOutputMimeType);
  }
  const fromOutputCompressionQuality = getValueByPath(fromObject, [
    "outputCompressionQuality"
  ]);
  if (parentObject !== void 0 && fromOutputCompressionQuality != null) {
    setValueByPath(parentObject, ["parameters", "outputOptions", "compressionQuality"], fromOutputCompressionQuality);
  }
  const fromEnhancePrompt = getValueByPath(fromObject, [
    "enhancePrompt"
  ]);
  if (parentObject !== void 0 && fromEnhancePrompt != null) {
    setValueByPath(parentObject, ["parameters", "enhancePrompt"], fromEnhancePrompt);
  }
  const fromLabels = getValueByPath(fromObject, ["labels"]);
  if (parentObject !== void 0 && fromLabels != null) {
    setValueByPath(parentObject, ["labels"], fromLabels);
  }
  return toObject;
}
__name(recontextImageConfigToVertex, "recontextImageConfigToVertex");
function recontextImageParametersToVertex(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromSource = getValueByPath(fromObject, ["source"]);
  if (fromSource != null) {
    recontextImageSourceToVertex(fromSource, toObject);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    recontextImageConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(recontextImageParametersToVertex, "recontextImageParametersToVertex");
function recontextImageResponseFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromGeneratedImages = getValueByPath(fromObject, [
    "predictions"
  ]);
  if (fromGeneratedImages != null) {
    let transformedList = fromGeneratedImages;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return generatedImageFromVertex(item);
      });
    }
    setValueByPath(toObject, ["generatedImages"], transformedList);
  }
  return toObject;
}
__name(recontextImageResponseFromVertex, "recontextImageResponseFromVertex");
function recontextImageSourceToVertex(fromObject, parentObject, rootObject) {
  const toObject = {};
  const fromPrompt = getValueByPath(fromObject, ["prompt"]);
  if (parentObject !== void 0 && fromPrompt != null) {
    setValueByPath(parentObject, ["instances[0]", "prompt"], fromPrompt);
  }
  const fromPersonImage = getValueByPath(fromObject, ["personImage"]);
  if (parentObject !== void 0 && fromPersonImage != null) {
    setValueByPath(parentObject, ["instances[0]", "personImage", "image"], imageToVertex(fromPersonImage));
  }
  const fromProductImages = getValueByPath(fromObject, [
    "productImages"
  ]);
  if (parentObject !== void 0 && fromProductImages != null) {
    let transformedList = fromProductImages;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return productImageToVertex(item);
      });
    }
    setValueByPath(parentObject, ["instances[0]", "productImages"], transformedList);
  }
  return toObject;
}
__name(recontextImageSourceToVertex, "recontextImageSourceToVertex");
function referenceImageAPIInternalToVertex(fromObject, rootObject) {
  const toObject = {};
  const fromReferenceImage = getValueByPath(fromObject, [
    "referenceImage"
  ]);
  if (fromReferenceImage != null) {
    setValueByPath(toObject, ["referenceImage"], imageToVertex(fromReferenceImage));
  }
  const fromReferenceId = getValueByPath(fromObject, ["referenceId"]);
  if (fromReferenceId != null) {
    setValueByPath(toObject, ["referenceId"], fromReferenceId);
  }
  const fromReferenceType = getValueByPath(fromObject, [
    "referenceType"
  ]);
  if (fromReferenceType != null) {
    setValueByPath(toObject, ["referenceType"], fromReferenceType);
  }
  const fromMaskImageConfig = getValueByPath(fromObject, [
    "maskImageConfig"
  ]);
  if (fromMaskImageConfig != null) {
    setValueByPath(toObject, ["maskImageConfig"], maskReferenceConfigToVertex(fromMaskImageConfig));
  }
  const fromControlImageConfig = getValueByPath(fromObject, [
    "controlImageConfig"
  ]);
  if (fromControlImageConfig != null) {
    setValueByPath(toObject, ["controlImageConfig"], controlReferenceConfigToVertex(fromControlImageConfig));
  }
  const fromStyleImageConfig = getValueByPath(fromObject, [
    "styleImageConfig"
  ]);
  if (fromStyleImageConfig != null) {
    setValueByPath(toObject, ["styleImageConfig"], fromStyleImageConfig);
  }
  const fromSubjectImageConfig = getValueByPath(fromObject, [
    "subjectImageConfig"
  ]);
  if (fromSubjectImageConfig != null) {
    setValueByPath(toObject, ["subjectImageConfig"], fromSubjectImageConfig);
  }
  return toObject;
}
__name(referenceImageAPIInternalToVertex, "referenceImageAPIInternalToVertex");
function safetyAttributesFromMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromCategories = getValueByPath(fromObject, [
    "safetyAttributes",
    "categories"
  ]);
  if (fromCategories != null) {
    setValueByPath(toObject, ["categories"], fromCategories);
  }
  const fromScores = getValueByPath(fromObject, [
    "safetyAttributes",
    "scores"
  ]);
  if (fromScores != null) {
    setValueByPath(toObject, ["scores"], fromScores);
  }
  const fromContentType = getValueByPath(fromObject, ["contentType"]);
  if (fromContentType != null) {
    setValueByPath(toObject, ["contentType"], fromContentType);
  }
  return toObject;
}
__name(safetyAttributesFromMldev, "safetyAttributesFromMldev");
function safetyAttributesFromVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromCategories = getValueByPath(fromObject, [
    "safetyAttributes",
    "categories"
  ]);
  if (fromCategories != null) {
    setValueByPath(toObject, ["categories"], fromCategories);
  }
  const fromScores = getValueByPath(fromObject, [
    "safetyAttributes",
    "scores"
  ]);
  if (fromScores != null) {
    setValueByPath(toObject, ["scores"], fromScores);
  }
  const fromContentType = getValueByPath(fromObject, ["contentType"]);
  if (fromContentType != null) {
    setValueByPath(toObject, ["contentType"], fromContentType);
  }
  return toObject;
}
__name(safetyAttributesFromVertex, "safetyAttributesFromVertex");
function safetySettingToMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromCategory = getValueByPath(fromObject, ["category"]);
  if (fromCategory != null) {
    setValueByPath(toObject, ["category"], fromCategory);
  }
  if (getValueByPath(fromObject, ["method"]) !== void 0) {
    throw new Error("method parameter is not supported in Gemini API.");
  }
  const fromThreshold = getValueByPath(fromObject, ["threshold"]);
  if (fromThreshold != null) {
    setValueByPath(toObject, ["threshold"], fromThreshold);
  }
  return toObject;
}
__name(safetySettingToMldev, "safetySettingToMldev");
function scribbleImageToVertex(fromObject, rootObject) {
  const toObject = {};
  const fromImage = getValueByPath(fromObject, ["image"]);
  if (fromImage != null) {
    setValueByPath(toObject, ["image"], imageToVertex(fromImage));
  }
  return toObject;
}
__name(scribbleImageToVertex, "scribbleImageToVertex");
function segmentImageConfigToVertex(fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromMode = getValueByPath(fromObject, ["mode"]);
  if (parentObject !== void 0 && fromMode != null) {
    setValueByPath(parentObject, ["parameters", "mode"], fromMode);
  }
  const fromMaxPredictions = getValueByPath(fromObject, [
    "maxPredictions"
  ]);
  if (parentObject !== void 0 && fromMaxPredictions != null) {
    setValueByPath(parentObject, ["parameters", "maxPredictions"], fromMaxPredictions);
  }
  const fromConfidenceThreshold = getValueByPath(fromObject, [
    "confidenceThreshold"
  ]);
  if (parentObject !== void 0 && fromConfidenceThreshold != null) {
    setValueByPath(parentObject, ["parameters", "confidenceThreshold"], fromConfidenceThreshold);
  }
  const fromMaskDilation = getValueByPath(fromObject, ["maskDilation"]);
  if (parentObject !== void 0 && fromMaskDilation != null) {
    setValueByPath(parentObject, ["parameters", "maskDilation"], fromMaskDilation);
  }
  const fromBinaryColorThreshold = getValueByPath(fromObject, [
    "binaryColorThreshold"
  ]);
  if (parentObject !== void 0 && fromBinaryColorThreshold != null) {
    setValueByPath(parentObject, ["parameters", "binaryColorThreshold"], fromBinaryColorThreshold);
  }
  const fromLabels = getValueByPath(fromObject, ["labels"]);
  if (parentObject !== void 0 && fromLabels != null) {
    setValueByPath(parentObject, ["labels"], fromLabels);
  }
  return toObject;
}
__name(segmentImageConfigToVertex, "segmentImageConfigToVertex");
function segmentImageParametersToVertex(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromSource = getValueByPath(fromObject, ["source"]);
  if (fromSource != null) {
    segmentImageSourceToVertex(fromSource, toObject);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    segmentImageConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(segmentImageParametersToVertex, "segmentImageParametersToVertex");
function segmentImageResponseFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromGeneratedMasks = getValueByPath(fromObject, ["predictions"]);
  if (fromGeneratedMasks != null) {
    let transformedList = fromGeneratedMasks;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return generatedImageMaskFromVertex(item);
      });
    }
    setValueByPath(toObject, ["generatedMasks"], transformedList);
  }
  return toObject;
}
__name(segmentImageResponseFromVertex, "segmentImageResponseFromVertex");
function segmentImageSourceToVertex(fromObject, parentObject, rootObject) {
  const toObject = {};
  const fromPrompt = getValueByPath(fromObject, ["prompt"]);
  if (parentObject !== void 0 && fromPrompt != null) {
    setValueByPath(parentObject, ["instances[0]", "prompt"], fromPrompt);
  }
  const fromImage = getValueByPath(fromObject, ["image"]);
  if (parentObject !== void 0 && fromImage != null) {
    setValueByPath(parentObject, ["instances[0]", "image"], imageToVertex(fromImage));
  }
  const fromScribbleImage = getValueByPath(fromObject, [
    "scribbleImage"
  ]);
  if (parentObject !== void 0 && fromScribbleImage != null) {
    setValueByPath(parentObject, ["instances[0]", "scribble"], scribbleImageToVertex(fromScribbleImage));
  }
  return toObject;
}
__name(segmentImageSourceToVertex, "segmentImageSourceToVertex");
function toolConfigToMldev(fromObject, rootObject) {
  const toObject = {};
  const fromRetrievalConfig = getValueByPath(fromObject, [
    "retrievalConfig"
  ]);
  if (fromRetrievalConfig != null) {
    setValueByPath(toObject, ["retrievalConfig"], fromRetrievalConfig);
  }
  const fromFunctionCallingConfig = getValueByPath(fromObject, [
    "functionCallingConfig"
  ]);
  if (fromFunctionCallingConfig != null) {
    setValueByPath(toObject, ["functionCallingConfig"], functionCallingConfigToMldev(fromFunctionCallingConfig));
  }
  return toObject;
}
__name(toolConfigToMldev, "toolConfigToMldev");
function toolToMldev$1(fromObject, rootObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["retrieval"]) !== void 0) {
    throw new Error("retrieval parameter is not supported in Gemini API.");
  }
  const fromComputerUse = getValueByPath(fromObject, ["computerUse"]);
  if (fromComputerUse != null) {
    setValueByPath(toObject, ["computerUse"], fromComputerUse);
  }
  const fromFileSearch = getValueByPath(fromObject, ["fileSearch"]);
  if (fromFileSearch != null) {
    setValueByPath(toObject, ["fileSearch"], fromFileSearch);
  }
  const fromCodeExecution = getValueByPath(fromObject, [
    "codeExecution"
  ]);
  if (fromCodeExecution != null) {
    setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
  }
  if (getValueByPath(fromObject, ["enterpriseWebSearch"]) !== void 0) {
    throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  }
  const fromFunctionDeclarations = getValueByPath(fromObject, [
    "functionDeclarations"
  ]);
  if (fromFunctionDeclarations != null) {
    let transformedList = fromFunctionDeclarations;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["functionDeclarations"], transformedList);
  }
  const fromGoogleMaps = getValueByPath(fromObject, ["googleMaps"]);
  if (fromGoogleMaps != null) {
    setValueByPath(toObject, ["googleMaps"], googleMapsToMldev$1(fromGoogleMaps));
  }
  const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
  if (fromGoogleSearch != null) {
    setValueByPath(toObject, ["googleSearch"], googleSearchToMldev$1(fromGoogleSearch));
  }
  const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
    "googleSearchRetrieval"
  ]);
  if (fromGoogleSearchRetrieval != null) {
    setValueByPath(toObject, ["googleSearchRetrieval"], fromGoogleSearchRetrieval);
  }
  const fromUrlContext = getValueByPath(fromObject, ["urlContext"]);
  if (fromUrlContext != null) {
    setValueByPath(toObject, ["urlContext"], fromUrlContext);
  }
  return toObject;
}
__name(toolToMldev$1, "toolToMldev$1");
function toolToVertex(fromObject, rootObject) {
  const toObject = {};
  const fromRetrieval = getValueByPath(fromObject, ["retrieval"]);
  if (fromRetrieval != null) {
    setValueByPath(toObject, ["retrieval"], fromRetrieval);
  }
  const fromComputerUse = getValueByPath(fromObject, ["computerUse"]);
  if (fromComputerUse != null) {
    setValueByPath(toObject, ["computerUse"], fromComputerUse);
  }
  if (getValueByPath(fromObject, ["fileSearch"]) !== void 0) {
    throw new Error("fileSearch parameter is not supported in Vertex AI.");
  }
  const fromCodeExecution = getValueByPath(fromObject, [
    "codeExecution"
  ]);
  if (fromCodeExecution != null) {
    setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
  }
  const fromEnterpriseWebSearch = getValueByPath(fromObject, [
    "enterpriseWebSearch"
  ]);
  if (fromEnterpriseWebSearch != null) {
    setValueByPath(toObject, ["enterpriseWebSearch"], fromEnterpriseWebSearch);
  }
  const fromFunctionDeclarations = getValueByPath(fromObject, [
    "functionDeclarations"
  ]);
  if (fromFunctionDeclarations != null) {
    let transformedList = fromFunctionDeclarations;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return functionDeclarationToVertex(item);
      });
    }
    setValueByPath(toObject, ["functionDeclarations"], transformedList);
  }
  const fromGoogleMaps = getValueByPath(fromObject, ["googleMaps"]);
  if (fromGoogleMaps != null) {
    setValueByPath(toObject, ["googleMaps"], fromGoogleMaps);
  }
  const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
  if (fromGoogleSearch != null) {
    setValueByPath(toObject, ["googleSearch"], fromGoogleSearch);
  }
  const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
    "googleSearchRetrieval"
  ]);
  if (fromGoogleSearchRetrieval != null) {
    setValueByPath(toObject, ["googleSearchRetrieval"], fromGoogleSearchRetrieval);
  }
  const fromUrlContext = getValueByPath(fromObject, ["urlContext"]);
  if (fromUrlContext != null) {
    setValueByPath(toObject, ["urlContext"], fromUrlContext);
  }
  return toObject;
}
__name(toolToVertex, "toolToVertex");
function tunedModelInfoFromMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromBaseModel = getValueByPath(fromObject, ["baseModel"]);
  if (fromBaseModel != null) {
    setValueByPath(toObject, ["baseModel"], fromBaseModel);
  }
  const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
  if (fromCreateTime != null) {
    setValueByPath(toObject, ["createTime"], fromCreateTime);
  }
  const fromUpdateTime = getValueByPath(fromObject, ["updateTime"]);
  if (fromUpdateTime != null) {
    setValueByPath(toObject, ["updateTime"], fromUpdateTime);
  }
  return toObject;
}
__name(tunedModelInfoFromMldev, "tunedModelInfoFromMldev");
function tunedModelInfoFromVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromBaseModel = getValueByPath(fromObject, [
    "labels",
    "google-vertex-llm-tuning-base-model-id"
  ]);
  if (fromBaseModel != null) {
    setValueByPath(toObject, ["baseModel"], fromBaseModel);
  }
  const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
  if (fromCreateTime != null) {
    setValueByPath(toObject, ["createTime"], fromCreateTime);
  }
  const fromUpdateTime = getValueByPath(fromObject, ["updateTime"]);
  if (fromUpdateTime != null) {
    setValueByPath(toObject, ["updateTime"], fromUpdateTime);
  }
  return toObject;
}
__name(tunedModelInfoFromVertex, "tunedModelInfoFromVertex");
function updateModelConfigToMldev(fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
  if (parentObject !== void 0 && fromDisplayName != null) {
    setValueByPath(parentObject, ["displayName"], fromDisplayName);
  }
  const fromDescription = getValueByPath(fromObject, ["description"]);
  if (parentObject !== void 0 && fromDescription != null) {
    setValueByPath(parentObject, ["description"], fromDescription);
  }
  const fromDefaultCheckpointId = getValueByPath(fromObject, [
    "defaultCheckpointId"
  ]);
  if (parentObject !== void 0 && fromDefaultCheckpointId != null) {
    setValueByPath(parentObject, ["defaultCheckpointId"], fromDefaultCheckpointId);
  }
  return toObject;
}
__name(updateModelConfigToMldev, "updateModelConfigToMldev");
function updateModelConfigToVertex(fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
  if (parentObject !== void 0 && fromDisplayName != null) {
    setValueByPath(parentObject, ["displayName"], fromDisplayName);
  }
  const fromDescription = getValueByPath(fromObject, ["description"]);
  if (parentObject !== void 0 && fromDescription != null) {
    setValueByPath(parentObject, ["description"], fromDescription);
  }
  const fromDefaultCheckpointId = getValueByPath(fromObject, [
    "defaultCheckpointId"
  ]);
  if (parentObject !== void 0 && fromDefaultCheckpointId != null) {
    setValueByPath(parentObject, ["defaultCheckpointId"], fromDefaultCheckpointId);
  }
  return toObject;
}
__name(updateModelConfigToVertex, "updateModelConfigToVertex");
function updateModelParametersToMldev(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "name"], tModel(apiClient, fromModel));
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    updateModelConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(updateModelParametersToMldev, "updateModelParametersToMldev");
function updateModelParametersToVertex(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    updateModelConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(updateModelParametersToVertex, "updateModelParametersToVertex");
function upscaleImageAPIConfigInternalToVertex(fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromOutputGcsUri = getValueByPath(fromObject, ["outputGcsUri"]);
  if (parentObject !== void 0 && fromOutputGcsUri != null) {
    setValueByPath(parentObject, ["parameters", "storageUri"], fromOutputGcsUri);
  }
  const fromSafetyFilterLevel = getValueByPath(fromObject, [
    "safetyFilterLevel"
  ]);
  if (parentObject !== void 0 && fromSafetyFilterLevel != null) {
    setValueByPath(parentObject, ["parameters", "safetySetting"], fromSafetyFilterLevel);
  }
  const fromPersonGeneration = getValueByPath(fromObject, [
    "personGeneration"
  ]);
  if (parentObject !== void 0 && fromPersonGeneration != null) {
    setValueByPath(parentObject, ["parameters", "personGeneration"], fromPersonGeneration);
  }
  const fromIncludeRaiReason = getValueByPath(fromObject, [
    "includeRaiReason"
  ]);
  if (parentObject !== void 0 && fromIncludeRaiReason != null) {
    setValueByPath(parentObject, ["parameters", "includeRaiReason"], fromIncludeRaiReason);
  }
  const fromOutputMimeType = getValueByPath(fromObject, [
    "outputMimeType"
  ]);
  if (parentObject !== void 0 && fromOutputMimeType != null) {
    setValueByPath(parentObject, ["parameters", "outputOptions", "mimeType"], fromOutputMimeType);
  }
  const fromOutputCompressionQuality = getValueByPath(fromObject, [
    "outputCompressionQuality"
  ]);
  if (parentObject !== void 0 && fromOutputCompressionQuality != null) {
    setValueByPath(parentObject, ["parameters", "outputOptions", "compressionQuality"], fromOutputCompressionQuality);
  }
  const fromEnhanceInputImage = getValueByPath(fromObject, [
    "enhanceInputImage"
  ]);
  if (parentObject !== void 0 && fromEnhanceInputImage != null) {
    setValueByPath(parentObject, ["parameters", "upscaleConfig", "enhanceInputImage"], fromEnhanceInputImage);
  }
  const fromImagePreservationFactor = getValueByPath(fromObject, [
    "imagePreservationFactor"
  ]);
  if (parentObject !== void 0 && fromImagePreservationFactor != null) {
    setValueByPath(parentObject, ["parameters", "upscaleConfig", "imagePreservationFactor"], fromImagePreservationFactor);
  }
  const fromLabels = getValueByPath(fromObject, ["labels"]);
  if (parentObject !== void 0 && fromLabels != null) {
    setValueByPath(parentObject, ["labels"], fromLabels);
  }
  const fromNumberOfImages = getValueByPath(fromObject, [
    "numberOfImages"
  ]);
  if (parentObject !== void 0 && fromNumberOfImages != null) {
    setValueByPath(parentObject, ["parameters", "sampleCount"], fromNumberOfImages);
  }
  const fromMode = getValueByPath(fromObject, ["mode"]);
  if (parentObject !== void 0 && fromMode != null) {
    setValueByPath(parentObject, ["parameters", "mode"], fromMode);
  }
  return toObject;
}
__name(upscaleImageAPIConfigInternalToVertex, "upscaleImageAPIConfigInternalToVertex");
function upscaleImageAPIParametersInternalToVertex(apiClient, fromObject, rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["_url", "model"], tModel(apiClient, fromModel));
  }
  const fromImage = getValueByPath(fromObject, ["image"]);
  if (fromImage != null) {
    setValueByPath(toObject, ["instances[0]", "image"], imageToVertex(fromImage));
  }
  const fromUpscaleFactor = getValueByPath(fromObject, [
    "upscaleFactor"
  ]);
  if (fromUpscaleFactor != null) {
    setValueByPath(toObject, ["parameters", "upscaleConfig", "upscaleFactor"], fromUpscaleFactor);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    upscaleImageAPIConfigInternalToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(upscaleImageAPIParametersInternalToVertex, "upscaleImageAPIParametersInternalToVertex");
function upscaleImageResponseFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromGeneratedImages = getValueByPath(fromObject, [
    "predictions"
  ]);
  if (fromGeneratedImages != null) {
    let transformedList = fromGeneratedImages;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return generatedImageFromVertex(item);
      });
    }
    setValueByPath(toObject, ["generatedImages"], transformedList);
  }
  return toObject;
}
__name(upscaleImageResponseFromVertex, "upscaleImageResponseFromVertex");
function videoFromMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromUri = getValueByPath(fromObject, ["uri"]);
  if (fromUri != null) {
    setValueByPath(toObject, ["uri"], fromUri);
  }
  const fromVideoBytes = getValueByPath(fromObject, ["encodedVideo"]);
  if (fromVideoBytes != null) {
    setValueByPath(toObject, ["videoBytes"], tBytes(fromVideoBytes));
  }
  const fromMimeType = getValueByPath(fromObject, ["encoding"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(videoFromMldev, "videoFromMldev");
function videoFromVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromUri = getValueByPath(fromObject, ["gcsUri"]);
  if (fromUri != null) {
    setValueByPath(toObject, ["uri"], fromUri);
  }
  const fromVideoBytes = getValueByPath(fromObject, [
    "bytesBase64Encoded"
  ]);
  if (fromVideoBytes != null) {
    setValueByPath(toObject, ["videoBytes"], tBytes(fromVideoBytes));
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(videoFromVertex, "videoFromVertex");
function videoGenerationMaskToVertex(fromObject, rootObject) {
  const toObject = {};
  const fromImage = getValueByPath(fromObject, ["image"]);
  if (fromImage != null) {
    setValueByPath(toObject, ["_self"], imageToVertex(fromImage));
  }
  const fromMaskMode = getValueByPath(fromObject, ["maskMode"]);
  if (fromMaskMode != null) {
    setValueByPath(toObject, ["maskMode"], fromMaskMode);
  }
  return toObject;
}
__name(videoGenerationMaskToVertex, "videoGenerationMaskToVertex");
function videoGenerationReferenceImageToMldev(fromObject, rootObject) {
  const toObject = {};
  const fromImage = getValueByPath(fromObject, ["image"]);
  if (fromImage != null) {
    setValueByPath(toObject, ["image"], imageToMldev(fromImage));
  }
  const fromReferenceType = getValueByPath(fromObject, [
    "referenceType"
  ]);
  if (fromReferenceType != null) {
    setValueByPath(toObject, ["referenceType"], fromReferenceType);
  }
  return toObject;
}
__name(videoGenerationReferenceImageToMldev, "videoGenerationReferenceImageToMldev");
function videoGenerationReferenceImageToVertex(fromObject, rootObject) {
  const toObject = {};
  const fromImage = getValueByPath(fromObject, ["image"]);
  if (fromImage != null) {
    setValueByPath(toObject, ["image"], imageToVertex(fromImage));
  }
  const fromReferenceType = getValueByPath(fromObject, [
    "referenceType"
  ]);
  if (fromReferenceType != null) {
    setValueByPath(toObject, ["referenceType"], fromReferenceType);
  }
  return toObject;
}
__name(videoGenerationReferenceImageToVertex, "videoGenerationReferenceImageToVertex");
function videoToMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromUri = getValueByPath(fromObject, ["uri"]);
  if (fromUri != null) {
    setValueByPath(toObject, ["uri"], fromUri);
  }
  const fromVideoBytes = getValueByPath(fromObject, ["videoBytes"]);
  if (fromVideoBytes != null) {
    setValueByPath(toObject, ["encodedVideo"], tBytes(fromVideoBytes));
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["encoding"], fromMimeType);
  }
  return toObject;
}
__name(videoToMldev, "videoToMldev");
function videoToVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromUri = getValueByPath(fromObject, ["uri"]);
  if (fromUri != null) {
    setValueByPath(toObject, ["gcsUri"], fromUri);
  }
  const fromVideoBytes = getValueByPath(fromObject, ["videoBytes"]);
  if (fromVideoBytes != null) {
    setValueByPath(toObject, ["bytesBase64Encoded"], tBytes(fromVideoBytes));
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(videoToVertex, "videoToVertex");
function createFileSearchStoreConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
  if (parentObject !== void 0 && fromDisplayName != null) {
    setValueByPath(parentObject, ["displayName"], fromDisplayName);
  }
  return toObject;
}
__name(createFileSearchStoreConfigToMldev, "createFileSearchStoreConfigToMldev");
function createFileSearchStoreParametersToMldev(fromObject) {
  const toObject = {};
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    createFileSearchStoreConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(createFileSearchStoreParametersToMldev, "createFileSearchStoreParametersToMldev");
function deleteFileSearchStoreConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromForce = getValueByPath(fromObject, ["force"]);
  if (parentObject !== void 0 && fromForce != null) {
    setValueByPath(parentObject, ["_query", "force"], fromForce);
  }
  return toObject;
}
__name(deleteFileSearchStoreConfigToMldev, "deleteFileSearchStoreConfigToMldev");
function deleteFileSearchStoreParametersToMldev(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], fromName);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    deleteFileSearchStoreConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(deleteFileSearchStoreParametersToMldev, "deleteFileSearchStoreParametersToMldev");
function getFileSearchStoreParametersToMldev(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], fromName);
  }
  return toObject;
}
__name(getFileSearchStoreParametersToMldev, "getFileSearchStoreParametersToMldev");
function importFileConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromCustomMetadata = getValueByPath(fromObject, [
    "customMetadata"
  ]);
  if (parentObject !== void 0 && fromCustomMetadata != null) {
    let transformedList = fromCustomMetadata;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(parentObject, ["customMetadata"], transformedList);
  }
  const fromChunkingConfig = getValueByPath(fromObject, [
    "chunkingConfig"
  ]);
  if (parentObject !== void 0 && fromChunkingConfig != null) {
    setValueByPath(parentObject, ["chunkingConfig"], fromChunkingConfig);
  }
  return toObject;
}
__name(importFileConfigToMldev, "importFileConfigToMldev");
function importFileOperationFromMldev(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromMetadata = getValueByPath(fromObject, ["metadata"]);
  if (fromMetadata != null) {
    setValueByPath(toObject, ["metadata"], fromMetadata);
  }
  const fromDone = getValueByPath(fromObject, ["done"]);
  if (fromDone != null) {
    setValueByPath(toObject, ["done"], fromDone);
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  const fromResponse = getValueByPath(fromObject, ["response"]);
  if (fromResponse != null) {
    setValueByPath(toObject, ["response"], importFileResponseFromMldev(fromResponse));
  }
  return toObject;
}
__name(importFileOperationFromMldev, "importFileOperationFromMldev");
function importFileParametersToMldev(fromObject) {
  const toObject = {};
  const fromFileSearchStoreName = getValueByPath(fromObject, [
    "fileSearchStoreName"
  ]);
  if (fromFileSearchStoreName != null) {
    setValueByPath(toObject, ["_url", "file_search_store_name"], fromFileSearchStoreName);
  }
  const fromFileName = getValueByPath(fromObject, ["fileName"]);
  if (fromFileName != null) {
    setValueByPath(toObject, ["fileName"], fromFileName);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    importFileConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(importFileParametersToMldev, "importFileParametersToMldev");
function importFileResponseFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromParent = getValueByPath(fromObject, ["parent"]);
  if (fromParent != null) {
    setValueByPath(toObject, ["parent"], fromParent);
  }
  const fromDocumentName = getValueByPath(fromObject, ["documentName"]);
  if (fromDocumentName != null) {
    setValueByPath(toObject, ["documentName"], fromDocumentName);
  }
  return toObject;
}
__name(importFileResponseFromMldev, "importFileResponseFromMldev");
function listFileSearchStoresConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
  if (parentObject !== void 0 && fromPageSize != null) {
    setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
  }
  const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
  if (parentObject !== void 0 && fromPageToken != null) {
    setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
  }
  return toObject;
}
__name(listFileSearchStoresConfigToMldev, "listFileSearchStoresConfigToMldev");
function listFileSearchStoresParametersToMldev(fromObject) {
  const toObject = {};
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    listFileSearchStoresConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(listFileSearchStoresParametersToMldev, "listFileSearchStoresParametersToMldev");
function listFileSearchStoresResponseFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromNextPageToken = getValueByPath(fromObject, [
    "nextPageToken"
  ]);
  if (fromNextPageToken != null) {
    setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
  }
  const fromFileSearchStores = getValueByPath(fromObject, [
    "fileSearchStores"
  ]);
  if (fromFileSearchStores != null) {
    let transformedList = fromFileSearchStores;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["fileSearchStores"], transformedList);
  }
  return toObject;
}
__name(listFileSearchStoresResponseFromMldev, "listFileSearchStoresResponseFromMldev");
function uploadToFileSearchStoreConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (parentObject !== void 0 && fromMimeType != null) {
    setValueByPath(parentObject, ["mimeType"], fromMimeType);
  }
  const fromDisplayName = getValueByPath(fromObject, ["displayName"]);
  if (parentObject !== void 0 && fromDisplayName != null) {
    setValueByPath(parentObject, ["displayName"], fromDisplayName);
  }
  const fromCustomMetadata = getValueByPath(fromObject, [
    "customMetadata"
  ]);
  if (parentObject !== void 0 && fromCustomMetadata != null) {
    let transformedList = fromCustomMetadata;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(parentObject, ["customMetadata"], transformedList);
  }
  const fromChunkingConfig = getValueByPath(fromObject, [
    "chunkingConfig"
  ]);
  if (parentObject !== void 0 && fromChunkingConfig != null) {
    setValueByPath(parentObject, ["chunkingConfig"], fromChunkingConfig);
  }
  return toObject;
}
__name(uploadToFileSearchStoreConfigToMldev, "uploadToFileSearchStoreConfigToMldev");
function uploadToFileSearchStoreParametersToMldev(fromObject) {
  const toObject = {};
  const fromFileSearchStoreName = getValueByPath(fromObject, [
    "fileSearchStoreName"
  ]);
  if (fromFileSearchStoreName != null) {
    setValueByPath(toObject, ["_url", "file_search_store_name"], fromFileSearchStoreName);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    uploadToFileSearchStoreConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(uploadToFileSearchStoreParametersToMldev, "uploadToFileSearchStoreParametersToMldev");
function uploadToFileSearchStoreResumableResponseFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  return toObject;
}
__name(uploadToFileSearchStoreResumableResponseFromMldev, "uploadToFileSearchStoreResumableResponseFromMldev");
var CONTENT_TYPE_HEADER = "Content-Type";
var SERVER_TIMEOUT_HEADER = "X-Server-Timeout";
var USER_AGENT_HEADER = "User-Agent";
var GOOGLE_API_CLIENT_HEADER = "x-goog-api-client";
var SDK_VERSION = "1.41.0";
var LIBRARY_LABEL = `google-genai-sdk/${SDK_VERSION}`;
var VERTEX_AI_API_DEFAULT_VERSION = "v1beta1";
var GOOGLE_AI_API_DEFAULT_VERSION = "v1beta";
var DEFAULT_RETRY_ATTEMPTS = 5;
var DEFAULT_RETRY_HTTP_STATUS_CODES = [
  408,
  // Request timeout
  429,
  // Too many requests
  500,
  // Internal server error
  502,
  // Bad gateway
  503,
  // Service unavailable
  504
  // Gateway timeout
];
var ApiClient = class {
  static {
    __name(this, "ApiClient");
  }
  constructor(opts) {
    var _a2, _b, _c;
    this.clientOptions = Object.assign({}, opts);
    this.customBaseUrl = (_a2 = opts.httpOptions) === null || _a2 === void 0 ? void 0 : _a2.baseUrl;
    if (this.clientOptions.vertexai) {
      if (this.clientOptions.project && this.clientOptions.location) {
        this.clientOptions.apiKey = void 0;
      } else if (this.clientOptions.apiKey) {
        this.clientOptions.project = void 0;
        this.clientOptions.location = void 0;
      }
    }
    const initHttpOptions = {};
    if (this.clientOptions.vertexai) {
      if (!this.clientOptions.location && !this.clientOptions.apiKey && !this.customBaseUrl) {
        this.clientOptions.location = "global";
      }
      const hasSufficientAuth = this.clientOptions.project && this.clientOptions.location || this.clientOptions.apiKey;
      if (!hasSufficientAuth && !this.customBaseUrl) {
        throw new Error("Authentication is not set up. Please provide either a project and location, or an API key, or a custom base URL.");
      }
      const hasConstructorAuth = opts.project && opts.location || !!opts.apiKey;
      if (this.customBaseUrl && !hasConstructorAuth) {
        initHttpOptions.baseUrl = this.customBaseUrl;
        this.clientOptions.project = void 0;
        this.clientOptions.location = void 0;
      } else if (this.clientOptions.apiKey || this.clientOptions.location === "global") {
        initHttpOptions.baseUrl = "https://aiplatform.googleapis.com/";
      } else if (this.clientOptions.project && this.clientOptions.location) {
        initHttpOptions.baseUrl = `https://${this.clientOptions.location}-aiplatform.googleapis.com/`;
      }
      initHttpOptions.apiVersion = (_b = this.clientOptions.apiVersion) !== null && _b !== void 0 ? _b : VERTEX_AI_API_DEFAULT_VERSION;
    } else {
      if (!this.clientOptions.apiKey) {
        throw new ApiError({
          message: "API key must be set when using the Gemini API.",
          status: 403
        });
      }
      initHttpOptions.apiVersion = (_c = this.clientOptions.apiVersion) !== null && _c !== void 0 ? _c : GOOGLE_AI_API_DEFAULT_VERSION;
      initHttpOptions.baseUrl = `https://generativelanguage.googleapis.com/`;
    }
    initHttpOptions.headers = this.getDefaultHeaders();
    this.clientOptions.httpOptions = initHttpOptions;
    if (opts.httpOptions) {
      this.clientOptions.httpOptions = this.patchHttpOptions(initHttpOptions, opts.httpOptions);
    }
  }
  isVertexAI() {
    var _a2;
    return (_a2 = this.clientOptions.vertexai) !== null && _a2 !== void 0 ? _a2 : false;
  }
  getProject() {
    return this.clientOptions.project;
  }
  getLocation() {
    return this.clientOptions.location;
  }
  getCustomBaseUrl() {
    return this.customBaseUrl;
  }
  async getAuthHeaders() {
    const headers = new Headers();
    await this.clientOptions.auth.addAuthHeaders(headers);
    return headers;
  }
  getApiVersion() {
    if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.apiVersion !== void 0) {
      return this.clientOptions.httpOptions.apiVersion;
    }
    throw new Error("API version is not set.");
  }
  getBaseUrl() {
    if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.baseUrl !== void 0) {
      return this.clientOptions.httpOptions.baseUrl;
    }
    throw new Error("Base URL is not set.");
  }
  getRequestUrl() {
    return this.getRequestUrlInternal(this.clientOptions.httpOptions);
  }
  getHeaders() {
    if (this.clientOptions.httpOptions && this.clientOptions.httpOptions.headers !== void 0) {
      return this.clientOptions.httpOptions.headers;
    } else {
      throw new Error("Headers are not set.");
    }
  }
  getRequestUrlInternal(httpOptions) {
    if (!httpOptions || httpOptions.baseUrl === void 0 || httpOptions.apiVersion === void 0) {
      throw new Error("HTTP options are not correctly set.");
    }
    const baseUrl = httpOptions.baseUrl.endsWith("/") ? httpOptions.baseUrl.slice(0, -1) : httpOptions.baseUrl;
    const urlElement = [baseUrl];
    if (httpOptions.apiVersion && httpOptions.apiVersion !== "") {
      urlElement.push(httpOptions.apiVersion);
    }
    return urlElement.join("/");
  }
  getBaseResourcePath() {
    return `projects/${this.clientOptions.project}/locations/${this.clientOptions.location}`;
  }
  getApiKey() {
    return this.clientOptions.apiKey;
  }
  getWebsocketBaseUrl() {
    const baseUrl = this.getBaseUrl();
    const urlParts = new URL(baseUrl);
    urlParts.protocol = urlParts.protocol == "http:" ? "ws" : "wss";
    return urlParts.toString();
  }
  setBaseUrl(url) {
    if (this.clientOptions.httpOptions) {
      this.clientOptions.httpOptions.baseUrl = url;
    } else {
      throw new Error("HTTP options are not correctly set.");
    }
  }
  constructUrl(path2, httpOptions, prependProjectLocation) {
    const urlElement = [this.getRequestUrlInternal(httpOptions)];
    if (prependProjectLocation) {
      urlElement.push(this.getBaseResourcePath());
    }
    if (path2 !== "") {
      urlElement.push(path2);
    }
    const url = new URL(`${urlElement.join("/")}`);
    return url;
  }
  shouldPrependVertexProjectPath(request, httpOptions) {
    if (httpOptions.baseUrl && httpOptions.baseUrlResourceScope === ResourceScope.COLLECTION) {
      return false;
    }
    if (this.clientOptions.apiKey) {
      return false;
    }
    if (!this.clientOptions.vertexai) {
      return false;
    }
    if (request.path.startsWith("projects/")) {
      return false;
    }
    if (request.httpMethod === "GET" && request.path.startsWith("publishers/google/models")) {
      return false;
    }
    return true;
  }
  async request(request) {
    let patchedHttpOptions = this.clientOptions.httpOptions;
    if (request.httpOptions) {
      patchedHttpOptions = this.patchHttpOptions(this.clientOptions.httpOptions, request.httpOptions);
    }
    const prependProjectLocation = this.shouldPrependVertexProjectPath(request, patchedHttpOptions);
    const url = this.constructUrl(request.path, patchedHttpOptions, prependProjectLocation);
    if (request.queryParams) {
      for (const [key, value] of Object.entries(request.queryParams)) {
        url.searchParams.append(key, String(value));
      }
    }
    let requestInit = {};
    if (request.httpMethod === "GET") {
      if (request.body && request.body !== "{}") {
        throw new Error("Request body should be empty for GET request, but got non empty request body");
      }
    } else {
      requestInit.body = request.body;
    }
    requestInit = await this.includeExtraHttpOptionsToRequestInit(requestInit, patchedHttpOptions, url.toString(), request.abortSignal);
    return this.unaryApiCall(url, requestInit, request.httpMethod);
  }
  patchHttpOptions(baseHttpOptions, requestHttpOptions) {
    const patchedHttpOptions = JSON.parse(JSON.stringify(baseHttpOptions));
    for (const [key, value] of Object.entries(requestHttpOptions)) {
      if (typeof value === "object") {
        patchedHttpOptions[key] = Object.assign(Object.assign({}, patchedHttpOptions[key]), value);
      } else if (value !== void 0) {
        patchedHttpOptions[key] = value;
      }
    }
    return patchedHttpOptions;
  }
  async requestStream(request) {
    let patchedHttpOptions = this.clientOptions.httpOptions;
    if (request.httpOptions) {
      patchedHttpOptions = this.patchHttpOptions(this.clientOptions.httpOptions, request.httpOptions);
    }
    const prependProjectLocation = this.shouldPrependVertexProjectPath(request, patchedHttpOptions);
    const url = this.constructUrl(request.path, patchedHttpOptions, prependProjectLocation);
    if (!url.searchParams.has("alt") || url.searchParams.get("alt") !== "sse") {
      url.searchParams.set("alt", "sse");
    }
    let requestInit = {};
    requestInit.body = request.body;
    requestInit = await this.includeExtraHttpOptionsToRequestInit(requestInit, patchedHttpOptions, url.toString(), request.abortSignal);
    return this.streamApiCall(url, requestInit, request.httpMethod);
  }
  async includeExtraHttpOptionsToRequestInit(requestInit, httpOptions, url, abortSignal) {
    if (httpOptions && httpOptions.timeout || abortSignal) {
      const abortController = new AbortController();
      const signal = abortController.signal;
      if (httpOptions.timeout && (httpOptions === null || httpOptions === void 0 ? void 0 : httpOptions.timeout) > 0) {
        const timeoutHandle = setTimeout(() => abortController.abort(), httpOptions.timeout);
        if (timeoutHandle && typeof timeoutHandle.unref === "function") {
          timeoutHandle.unref();
        }
      }
      if (abortSignal) {
        abortSignal.addEventListener("abort", () => {
          abortController.abort();
        });
      }
      requestInit.signal = signal;
    }
    if (httpOptions && httpOptions.extraBody !== null) {
      includeExtraBodyToRequestInit(requestInit, httpOptions.extraBody);
    }
    requestInit.headers = await this.getHeadersInternal(httpOptions, url);
    return requestInit;
  }
  async unaryApiCall(url, requestInit, httpMethod) {
    return this.apiCall(url.toString(), Object.assign(Object.assign({}, requestInit), { method: httpMethod })).then(async (response) => {
      await throwErrorIfNotOK(response);
      return new HttpResponse(response);
    }).catch((e) => {
      if (e instanceof Error) {
        throw e;
      } else {
        throw new Error(JSON.stringify(e));
      }
    });
  }
  async streamApiCall(url, requestInit, httpMethod) {
    return this.apiCall(url.toString(), Object.assign(Object.assign({}, requestInit), { method: httpMethod })).then(async (response) => {
      await throwErrorIfNotOK(response);
      return this.processStreamResponse(response);
    }).catch((e) => {
      if (e instanceof Error) {
        throw e;
      } else {
        throw new Error(JSON.stringify(e));
      }
    });
  }
  processStreamResponse(response) {
    return __asyncGenerator(this, arguments, /* @__PURE__ */ __name(function* processStreamResponse_1() {
      var _a2;
      const reader = (_a2 = response === null || response === void 0 ? void 0 : response.body) === null || _a2 === void 0 ? void 0 : _a2.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) {
        throw new Error("Response body is empty");
      }
      try {
        let buffer = "";
        const dataPrefix = "data:";
        const delimiters = ["\n\n", "\r\r", "\r\n\r\n"];
        while (true) {
          const { done, value } = yield __await(reader.read());
          if (done) {
            if (buffer.trim().length > 0) {
              throw new Error("Incomplete JSON segment at the end");
            }
            break;
          }
          const chunkString = decoder.decode(value, { stream: true });
          try {
            const chunkJson = JSON.parse(chunkString);
            if ("error" in chunkJson) {
              const errorJson = JSON.parse(JSON.stringify(chunkJson["error"]));
              const status = errorJson["status"];
              const code = errorJson["code"];
              const errorMessage = `got status: ${status}. ${JSON.stringify(chunkJson)}`;
              if (code >= 400 && code < 600) {
                const apiError = new ApiError({
                  message: errorMessage,
                  status: code
                });
                throw apiError;
              }
            }
          } catch (e) {
            const error3 = e;
            if (error3.name === "ApiError") {
              throw e;
            }
          }
          buffer += chunkString;
          let delimiterIndex = -1;
          let delimiterLength = 0;
          while (true) {
            delimiterIndex = -1;
            delimiterLength = 0;
            for (const delimiter of delimiters) {
              const index = buffer.indexOf(delimiter);
              if (index !== -1 && (delimiterIndex === -1 || index < delimiterIndex)) {
                delimiterIndex = index;
                delimiterLength = delimiter.length;
              }
            }
            if (delimiterIndex === -1) {
              break;
            }
            const eventString = buffer.substring(0, delimiterIndex);
            buffer = buffer.substring(delimiterIndex + delimiterLength);
            const trimmedEvent = eventString.trim();
            if (trimmedEvent.startsWith(dataPrefix)) {
              const processedChunkString = trimmedEvent.substring(dataPrefix.length).trim();
              try {
                const partialResponse = new Response(processedChunkString, {
                  headers: response === null || response === void 0 ? void 0 : response.headers,
                  status: response === null || response === void 0 ? void 0 : response.status,
                  statusText: response === null || response === void 0 ? void 0 : response.statusText
                });
                yield yield __await(new HttpResponse(partialResponse));
              } catch (e) {
                throw new Error(`exception parsing stream chunk ${processedChunkString}. ${e}`);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }, "processStreamResponse_1"));
  }
  async apiCall(url, requestInit) {
    var _a2;
    if (!this.clientOptions.httpOptions || !this.clientOptions.httpOptions.retryOptions) {
      return fetch(url, requestInit);
    }
    const retryOptions = this.clientOptions.httpOptions.retryOptions;
    const runFetch = /* @__PURE__ */ __name(async () => {
      const response = await fetch(url, requestInit);
      if (response.ok) {
        return response;
      }
      if (DEFAULT_RETRY_HTTP_STATUS_CODES.includes(response.status)) {
        throw new Error(`Retryable HTTP Error: ${response.statusText}`);
      }
      throw new AbortError(`Non-retryable exception ${response.statusText} sending request`);
    }, "runFetch");
    return pRetry(runFetch, {
      // Retry attempts is one less than the number of total attempts.
      retries: ((_a2 = retryOptions.attempts) !== null && _a2 !== void 0 ? _a2 : DEFAULT_RETRY_ATTEMPTS) - 1
    });
  }
  getDefaultHeaders() {
    const headers = {};
    const versionHeaderValue = LIBRARY_LABEL + " " + this.clientOptions.userAgentExtra;
    headers[USER_AGENT_HEADER] = versionHeaderValue;
    headers[GOOGLE_API_CLIENT_HEADER] = versionHeaderValue;
    headers[CONTENT_TYPE_HEADER] = "application/json";
    return headers;
  }
  async getHeadersInternal(httpOptions, url) {
    const headers = new Headers();
    if (httpOptions && httpOptions.headers) {
      for (const [key, value] of Object.entries(httpOptions.headers)) {
        headers.append(key, value);
      }
      if (httpOptions.timeout && httpOptions.timeout > 0) {
        headers.append(SERVER_TIMEOUT_HEADER, String(Math.ceil(httpOptions.timeout / 1e3)));
      }
    }
    await this.clientOptions.auth.addAuthHeaders(headers, url);
    return headers;
  }
  getFileName(file) {
    var _a2;
    let fileName = "";
    if (typeof file === "string") {
      fileName = file.replace(/[/\\]+$/, "");
      fileName = (_a2 = fileName.split(/[/\\]/).pop()) !== null && _a2 !== void 0 ? _a2 : "";
    }
    return fileName;
  }
  /**
   * Uploads a file asynchronously using Gemini API only, this is not supported
   * in Vertex AI.
   *
   * @param file The string path to the file to be uploaded or a Blob object.
   * @param config Optional parameters specified in the `UploadFileConfig`
   *     interface. @see {@link types.UploadFileConfig}
   * @return A promise that resolves to a `File` object.
   * @throws An error if called on a Vertex AI client.
   * @throws An error if the `mimeType` is not provided and can not be inferred,
   */
  async uploadFile(file, config2) {
    var _a2;
    const fileToUpload = {};
    if (config2 != null) {
      fileToUpload.mimeType = config2.mimeType;
      fileToUpload.name = config2.name;
      fileToUpload.displayName = config2.displayName;
    }
    if (fileToUpload.name && !fileToUpload.name.startsWith("files/")) {
      fileToUpload.name = `files/${fileToUpload.name}`;
    }
    const uploader = this.clientOptions.uploader;
    const fileStat = await uploader.stat(file);
    fileToUpload.sizeBytes = String(fileStat.size);
    const mimeType = (_a2 = config2 === null || config2 === void 0 ? void 0 : config2.mimeType) !== null && _a2 !== void 0 ? _a2 : fileStat.type;
    if (mimeType === void 0 || mimeType === "") {
      throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    }
    fileToUpload.mimeType = mimeType;
    const body = {
      file: fileToUpload
    };
    const fileName = this.getFileName(file);
    const path2 = formatMap("upload/v1beta/files", body["_url"]);
    const uploadUrl = await this.fetchUploadUrl(path2, fileToUpload.sizeBytes, fileToUpload.mimeType, fileName, body, config2 === null || config2 === void 0 ? void 0 : config2.httpOptions);
    return uploader.upload(file, uploadUrl, this);
  }
  /**
   * Uploads a file to a given file search store asynchronously using Gemini API only, this is not supported
   * in Vertex AI.
   *
   * @param fileSearchStoreName The name of the file search store to upload the file to.
   * @param file The string path to the file to be uploaded or a Blob object.
   * @param config Optional parameters specified in the `UploadFileConfig`
   *     interface. @see {@link UploadFileConfig}
   * @return A promise that resolves to a `File` object.
   * @throws An error if called on a Vertex AI client.
   * @throws An error if the `mimeType` is not provided and can not be inferred,
   */
  async uploadFileToFileSearchStore(fileSearchStoreName, file, config2) {
    var _a2;
    const uploader = this.clientOptions.uploader;
    const fileStat = await uploader.stat(file);
    const sizeBytes = String(fileStat.size);
    const mimeType = (_a2 = config2 === null || config2 === void 0 ? void 0 : config2.mimeType) !== null && _a2 !== void 0 ? _a2 : fileStat.type;
    if (mimeType === void 0 || mimeType === "") {
      throw new Error("Can not determine mimeType. Please provide mimeType in the config.");
    }
    const path2 = `upload/v1beta/${fileSearchStoreName}:uploadToFileSearchStore`;
    const fileName = this.getFileName(file);
    const body = {};
    if (config2 != null) {
      uploadToFileSearchStoreConfigToMldev(config2, body);
    }
    const uploadUrl = await this.fetchUploadUrl(path2, sizeBytes, mimeType, fileName, body, config2 === null || config2 === void 0 ? void 0 : config2.httpOptions);
    return uploader.uploadToFileSearchStore(file, uploadUrl, this);
  }
  /**
   * Downloads a file asynchronously to the specified path.
   *
   * @params params - The parameters for the download request, see {@link
   * types.DownloadFileParameters}
   */
  async downloadFile(params) {
    const downloader = this.clientOptions.downloader;
    await downloader.download(params, this);
  }
  async fetchUploadUrl(path2, sizeBytes, mimeType, fileName, body, configHttpOptions) {
    var _a2;
    let httpOptions = {};
    if (configHttpOptions) {
      httpOptions = configHttpOptions;
    } else {
      httpOptions = {
        apiVersion: "",
        // api-version is set in the path.
        headers: Object.assign({ "Content-Type": "application/json", "X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start", "X-Goog-Upload-Header-Content-Length": `${sizeBytes}`, "X-Goog-Upload-Header-Content-Type": `${mimeType}` }, fileName ? { "X-Goog-Upload-File-Name": fileName } : {})
      };
    }
    const httpResponse = await this.request({
      path: path2,
      body: JSON.stringify(body),
      httpMethod: "POST",
      httpOptions
    });
    if (!httpResponse || !(httpResponse === null || httpResponse === void 0 ? void 0 : httpResponse.headers)) {
      throw new Error("Server did not return an HttpResponse or the returned HttpResponse did not have headers.");
    }
    const uploadUrl = (_a2 = httpResponse === null || httpResponse === void 0 ? void 0 : httpResponse.headers) === null || _a2 === void 0 ? void 0 : _a2["x-goog-upload-url"];
    if (uploadUrl === void 0) {
      throw new Error("Failed to get upload url. Server did not return the x-google-upload-url in the headers");
    }
    return uploadUrl;
  }
};
async function throwErrorIfNotOK(response) {
  var _a2;
  if (response === void 0) {
    throw new Error("response is undefined");
  }
  if (!response.ok) {
    const status = response.status;
    let errorBody;
    if ((_a2 = response.headers.get("content-type")) === null || _a2 === void 0 ? void 0 : _a2.includes("application/json")) {
      errorBody = await response.json();
    } else {
      errorBody = {
        error: {
          message: await response.text(),
          code: response.status,
          status: response.statusText
        }
      };
    }
    const errorMessage = JSON.stringify(errorBody);
    if (status >= 400 && status < 600) {
      const apiError = new ApiError({
        message: errorMessage,
        status
      });
      throw apiError;
    }
    throw new Error(errorMessage);
  }
}
__name(throwErrorIfNotOK, "throwErrorIfNotOK");
function includeExtraBodyToRequestInit(requestInit, extraBody) {
  if (!extraBody || Object.keys(extraBody).length === 0) {
    return;
  }
  if (requestInit.body instanceof Blob) {
    console.warn("includeExtraBodyToRequestInit: extraBody provided but current request body is a Blob. extraBody will be ignored as merging is not supported for Blob bodies.");
    return;
  }
  let currentBodyObject = {};
  if (typeof requestInit.body === "string" && requestInit.body.length > 0) {
    try {
      const parsedBody = JSON.parse(requestInit.body);
      if (typeof parsedBody === "object" && parsedBody !== null && !Array.isArray(parsedBody)) {
        currentBodyObject = parsedBody;
      } else {
        console.warn("includeExtraBodyToRequestInit: Original request body is valid JSON but not a non-array object. Skip applying extraBody to the request body.");
        return;
      }
    } catch (e) {
      console.warn("includeExtraBodyToRequestInit: Original request body is not valid JSON. Skip applying extraBody to the request body.");
      return;
    }
  }
  function deepMerge(target, source) {
    const output = Object.assign({}, target);
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = output[key];
        if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue) && targetValue && typeof targetValue === "object" && !Array.isArray(targetValue)) {
          output[key] = deepMerge(targetValue, sourceValue);
        } else {
          if (targetValue && sourceValue && typeof targetValue !== typeof sourceValue) {
            console.warn(`includeExtraBodyToRequestInit:deepMerge: Type mismatch for key "${key}". Original type: ${typeof targetValue}, New type: ${typeof sourceValue}. Overwriting.`);
          }
          output[key] = sourceValue;
        }
      }
    }
    return output;
  }
  __name(deepMerge, "deepMerge");
  const mergedBody = deepMerge(currentBodyObject, extraBody);
  requestInit.body = JSON.stringify(mergedBody);
}
__name(includeExtraBodyToRequestInit, "includeExtraBodyToRequestInit");
var MCP_LABEL = "mcp_used/unknown";
var hasMcpToolUsageFromMcpToTool = false;
function hasMcpToolUsage(tools) {
  for (const tool of tools) {
    if (isMcpCallableTool(tool)) {
      return true;
    }
    if (typeof tool === "object" && "inputSchema" in tool) {
      return true;
    }
  }
  return hasMcpToolUsageFromMcpToTool;
}
__name(hasMcpToolUsage, "hasMcpToolUsage");
function setMcpUsageHeader(headers) {
  var _a2;
  const existingHeader = (_a2 = headers[GOOGLE_API_CLIENT_HEADER]) !== null && _a2 !== void 0 ? _a2 : "";
  headers[GOOGLE_API_CLIENT_HEADER] = (existingHeader + ` ${MCP_LABEL}`).trimStart();
}
__name(setMcpUsageHeader, "setMcpUsageHeader");
function isMcpCallableTool(object) {
  return object !== null && typeof object === "object" && object instanceof McpCallableTool;
}
__name(isMcpCallableTool, "isMcpCallableTool");
function listAllTools(mcpClient_1) {
  return __asyncGenerator(this, arguments, /* @__PURE__ */ __name(function* listAllTools_1(mcpClient, maxTools = 100) {
    let cursor = void 0;
    let numTools = 0;
    while (numTools < maxTools) {
      const t = yield __await(mcpClient.listTools({ cursor }));
      for (const tool of t.tools) {
        yield yield __await(tool);
        numTools++;
      }
      if (!t.nextCursor) {
        break;
      }
      cursor = t.nextCursor;
    }
  }, "listAllTools_1"));
}
__name(listAllTools, "listAllTools");
var McpCallableTool = class _McpCallableTool {
  static {
    __name(this, "McpCallableTool");
  }
  constructor(mcpClients = [], config2) {
    this.mcpTools = [];
    this.functionNameToMcpClient = {};
    this.mcpClients = mcpClients;
    this.config = config2;
  }
  /**
   * Creates a McpCallableTool.
   */
  static create(mcpClients, config2) {
    return new _McpCallableTool(mcpClients, config2);
  }
  /**
   * Validates the function names are not duplicate and initialize the function
   * name to MCP client mapping.
   *
   * @throws {Error} if the MCP tools from the MCP clients have duplicate tool
   *     names.
   */
  async initialize() {
    var _a2, e_1, _b, _c;
    if (this.mcpTools.length > 0) {
      return;
    }
    const functionMap = {};
    const mcpTools = [];
    for (const mcpClient of this.mcpClients) {
      try {
        for (var _d = true, _e = (e_1 = void 0, __asyncValues(listAllTools(mcpClient))), _f; _f = await _e.next(), _a2 = _f.done, !_a2; _d = true) {
          _c = _f.value;
          _d = false;
          const mcpTool = _c;
          mcpTools.push(mcpTool);
          const mcpToolName = mcpTool.name;
          if (functionMap[mcpToolName]) {
            throw new Error(`Duplicate function name ${mcpToolName} found in MCP tools. Please ensure function names are unique.`);
          }
          functionMap[mcpToolName] = mcpClient;
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (!_d && !_a2 && (_b = _e.return)) await _b.call(_e);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
    }
    this.mcpTools = mcpTools;
    this.functionNameToMcpClient = functionMap;
  }
  async tool() {
    await this.initialize();
    return mcpToolsToGeminiTool(this.mcpTools, this.config);
  }
  async callTool(functionCalls) {
    await this.initialize();
    const functionCallResponseParts = [];
    for (const functionCall of functionCalls) {
      if (functionCall.name in this.functionNameToMcpClient) {
        const mcpClient = this.functionNameToMcpClient[functionCall.name];
        let requestOptions = void 0;
        if (this.config.timeout) {
          requestOptions = {
            timeout: this.config.timeout
          };
        }
        const callToolResponse = await mcpClient.callTool(
          {
            name: functionCall.name,
            arguments: functionCall.args
          },
          // Set the result schema to undefined to allow MCP to rely on the
          // default schema.
          void 0,
          requestOptions
        );
        functionCallResponseParts.push({
          functionResponse: {
            name: functionCall.name,
            response: callToolResponse.isError ? { error: callToolResponse } : callToolResponse
          }
        });
      }
    }
    return functionCallResponseParts;
  }
};
async function handleWebSocketMessage$1(apiClient, onmessage, event) {
  const serverMessage = new LiveMusicServerMessage();
  let data;
  if (event.data instanceof Blob) {
    data = JSON.parse(await event.data.text());
  } else {
    data = JSON.parse(event.data);
  }
  Object.assign(serverMessage, data);
  onmessage(serverMessage);
}
__name(handleWebSocketMessage$1, "handleWebSocketMessage$1");
var LiveMusic = class {
  static {
    __name(this, "LiveMusic");
  }
  constructor(apiClient, auth, webSocketFactory) {
    this.apiClient = apiClient;
    this.auth = auth;
    this.webSocketFactory = webSocketFactory;
  }
  /**
       Establishes a connection to the specified model and returns a
       LiveMusicSession object representing that connection.
  
       @experimental
  
       @remarks
  
       @param params - The parameters for establishing a connection to the model.
       @return A live session.
  
       @example
       ```ts
       let model = 'models/lyria-realtime-exp';
       const session = await ai.live.music.connect({
         model: model,
         callbacks: {
           onmessage: (e: MessageEvent) => {
             console.log('Received message from the server: %s\n', debug(e.data));
           },
           onerror: (e: ErrorEvent) => {
             console.log('Error occurred: %s\n', debug(e.error));
           },
           onclose: (e: CloseEvent) => {
             console.log('Connection closed.');
           },
         },
       });
       ```
      */
  async connect(params) {
    var _a2, _b;
    if (this.apiClient.isVertexAI()) {
      throw new Error("Live music is not supported for Vertex AI.");
    }
    console.warn("Live music generation is experimental and may change in future versions.");
    const websocketBaseUrl = this.apiClient.getWebsocketBaseUrl();
    const apiVersion = this.apiClient.getApiVersion();
    const headers = mapToHeaders$1(this.apiClient.getDefaultHeaders());
    const apiKey = this.apiClient.getApiKey();
    const url = `${websocketBaseUrl}/ws/google.ai.generativelanguage.${apiVersion}.GenerativeService.BidiGenerateMusic?key=${apiKey}`;
    let onopenResolve = /* @__PURE__ */ __name(() => {
    }, "onopenResolve");
    const onopenPromise = new Promise((resolve) => {
      onopenResolve = resolve;
    });
    const callbacks = params.callbacks;
    const onopenAwaitedCallback = /* @__PURE__ */ __name(function() {
      onopenResolve({});
    }, "onopenAwaitedCallback");
    const apiClient = this.apiClient;
    const websocketCallbacks = {
      onopen: onopenAwaitedCallback,
      onmessage: /* @__PURE__ */ __name((event) => {
        void handleWebSocketMessage$1(apiClient, callbacks.onmessage, event);
      }, "onmessage"),
      onerror: (_a2 = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onerror) !== null && _a2 !== void 0 ? _a2 : function(e) {
      },
      onclose: (_b = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onclose) !== null && _b !== void 0 ? _b : function(e) {
      }
    };
    const conn = this.webSocketFactory.create(url, headersToMap$1(headers), websocketCallbacks);
    conn.connect();
    await onopenPromise;
    const model = tModel(this.apiClient, params.model);
    const setup = { model };
    const clientMessage = { setup };
    conn.send(JSON.stringify(clientMessage));
    return new LiveMusicSession(conn, this.apiClient);
  }
};
var LiveMusicSession = class {
  static {
    __name(this, "LiveMusicSession");
  }
  constructor(conn, apiClient) {
    this.conn = conn;
    this.apiClient = apiClient;
  }
  /**
      Sets inputs to steer music generation. Updates the session's current
      weighted prompts.
  
      @param params - Contains one property, `weightedPrompts`.
  
        - `weightedPrompts` to send to the model; weights are normalized to
          sum to 1.0.
  
      @experimental
     */
  async setWeightedPrompts(params) {
    if (!params.weightedPrompts || Object.keys(params.weightedPrompts).length === 0) {
      throw new Error("Weighted prompts must be set and contain at least one entry.");
    }
    const clientContent = liveMusicSetWeightedPromptsParametersToMldev(params);
    this.conn.send(JSON.stringify({ clientContent }));
  }
  /**
      Sets a configuration to the model. Updates the session's current
      music generation config.
  
      @param params - Contains one property, `musicGenerationConfig`.
  
        - `musicGenerationConfig` to set in the model. Passing an empty or
      undefined config to the model will reset the config to defaults.
  
      @experimental
     */
  async setMusicGenerationConfig(params) {
    if (!params.musicGenerationConfig) {
      params.musicGenerationConfig = {};
    }
    const setConfigParameters = liveMusicSetConfigParametersToMldev(params);
    this.conn.send(JSON.stringify(setConfigParameters));
  }
  sendPlaybackControl(playbackControl) {
    const clientMessage = { playbackControl };
    this.conn.send(JSON.stringify(clientMessage));
  }
  /**
   * Start the music stream.
   *
   * @experimental
   */
  play() {
    this.sendPlaybackControl(LiveMusicPlaybackControl.PLAY);
  }
  /**
   * Temporarily halt the music stream. Use `play` to resume from the current
   * position.
   *
   * @experimental
   */
  pause() {
    this.sendPlaybackControl(LiveMusicPlaybackControl.PAUSE);
  }
  /**
   * Stop the music stream and reset the state. Retains the current prompts
   * and config.
   *
   * @experimental
   */
  stop() {
    this.sendPlaybackControl(LiveMusicPlaybackControl.STOP);
  }
  /**
   * Resets the context of the music generation without stopping it.
   * Retains the current prompts and config.
   *
   * @experimental
   */
  resetContext() {
    this.sendPlaybackControl(LiveMusicPlaybackControl.RESET_CONTEXT);
  }
  /**
       Terminates the WebSocket connection.
  
       @experimental
     */
  close() {
    this.conn.close();
  }
};
function headersToMap$1(headers) {
  const headerMap = {};
  headers.forEach((value, key) => {
    headerMap[key] = value;
  });
  return headerMap;
}
__name(headersToMap$1, "headersToMap$1");
function mapToHeaders$1(map) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(map)) {
    headers.append(key, value);
  }
  return headers;
}
__name(mapToHeaders$1, "mapToHeaders$1");
var FUNCTION_RESPONSE_REQUIRES_ID = "FunctionResponse request must have an `id` field from the response of a ToolCall.FunctionalCalls in Google AI.";
async function handleWebSocketMessage(apiClient, onmessage, event) {
  const serverMessage = new LiveServerMessage();
  let jsonData;
  if (event.data instanceof Blob) {
    jsonData = await event.data.text();
  } else if (event.data instanceof ArrayBuffer) {
    jsonData = new TextDecoder().decode(event.data);
  } else {
    jsonData = event.data;
  }
  const data = JSON.parse(jsonData);
  if (apiClient.isVertexAI()) {
    const resp = liveServerMessageFromVertex(data);
    Object.assign(serverMessage, resp);
  } else {
    const resp = data;
    Object.assign(serverMessage, resp);
  }
  onmessage(serverMessage);
}
__name(handleWebSocketMessage, "handleWebSocketMessage");
var Live = class {
  static {
    __name(this, "Live");
  }
  constructor(apiClient, auth, webSocketFactory) {
    this.apiClient = apiClient;
    this.auth = auth;
    this.webSocketFactory = webSocketFactory;
    this.music = new LiveMusic(this.apiClient, this.auth, this.webSocketFactory);
  }
  /**
       Establishes a connection to the specified model with the given
       configuration and returns a Session object representing that connection.
  
       @experimental Built-in MCP support is an experimental feature, may change in
       future versions.
  
       @remarks
  
       @param params - The parameters for establishing a connection to the model.
       @return A live session.
  
       @example
       ```ts
       let model: string;
       if (GOOGLE_GENAI_USE_VERTEXAI) {
         model = 'gemini-2.0-flash-live-preview-04-09';
       } else {
         model = 'gemini-live-2.5-flash-preview';
       }
       const session = await ai.live.connect({
         model: model,
         config: {
           responseModalities: [Modality.AUDIO],
         },
         callbacks: {
           onopen: () => {
             console.log('Connected to the socket.');
           },
           onmessage: (e: MessageEvent) => {
             console.log('Received message from the server: %s\n', debug(e.data));
           },
           onerror: (e: ErrorEvent) => {
             console.log('Error occurred: %s\n', debug(e.error));
           },
           onclose: (e: CloseEvent) => {
             console.log('Connection closed.');
           },
         },
       });
       ```
      */
  async connect(params) {
    var _a2, _b, _c, _d, _e, _f;
    if (params.config && params.config.httpOptions) {
      throw new Error("The Live module does not support httpOptions at request-level in LiveConnectConfig yet. Please use the client-level httpOptions configuration instead.");
    }
    const websocketBaseUrl = this.apiClient.getWebsocketBaseUrl();
    const apiVersion = this.apiClient.getApiVersion();
    let url;
    const clientHeaders = this.apiClient.getHeaders();
    if (params.config && params.config.tools && hasMcpToolUsage(params.config.tools)) {
      setMcpUsageHeader(clientHeaders);
    }
    const headers = mapToHeaders(clientHeaders);
    if (this.apiClient.isVertexAI()) {
      const project = this.apiClient.getProject();
      const location = this.apiClient.getLocation();
      const apiKey = this.apiClient.getApiKey();
      const hasStandardAuth = !!project && !!location || !!apiKey;
      if (this.apiClient.getCustomBaseUrl() && !hasStandardAuth) {
        url = websocketBaseUrl;
      } else {
        url = `${websocketBaseUrl}/ws/google.cloud.aiplatform.${apiVersion}.LlmBidiService/BidiGenerateContent`;
        await this.auth.addAuthHeaders(headers, url);
      }
    } else {
      const apiKey = this.apiClient.getApiKey();
      let method = "BidiGenerateContent";
      let keyName = "key";
      if (apiKey === null || apiKey === void 0 ? void 0 : apiKey.startsWith("auth_tokens/")) {
        console.warn("Warning: Ephemeral token support is experimental and may change in future versions.");
        if (apiVersion !== "v1alpha") {
          console.warn("Warning: The SDK's ephemeral token support is in v1alpha only. Please use const ai = new GoogleGenAI({apiKey: token.name, httpOptions: { apiVersion: 'v1alpha' }}); before session connection.");
        }
        method = "BidiGenerateContentConstrained";
        keyName = "access_token";
      }
      url = `${websocketBaseUrl}/ws/google.ai.generativelanguage.${apiVersion}.GenerativeService.${method}?${keyName}=${apiKey}`;
    }
    let onopenResolve = /* @__PURE__ */ __name(() => {
    }, "onopenResolve");
    const onopenPromise = new Promise((resolve) => {
      onopenResolve = resolve;
    });
    const callbacks = params.callbacks;
    const onopenAwaitedCallback = /* @__PURE__ */ __name(function() {
      var _a3;
      (_a3 = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onopen) === null || _a3 === void 0 ? void 0 : _a3.call(callbacks);
      onopenResolve({});
    }, "onopenAwaitedCallback");
    const apiClient = this.apiClient;
    const websocketCallbacks = {
      onopen: onopenAwaitedCallback,
      onmessage: /* @__PURE__ */ __name((event) => {
        void handleWebSocketMessage(apiClient, callbacks.onmessage, event);
      }, "onmessage"),
      onerror: (_a2 = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onerror) !== null && _a2 !== void 0 ? _a2 : function(e) {
      },
      onclose: (_b = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onclose) !== null && _b !== void 0 ? _b : function(e) {
      }
    };
    const conn = this.webSocketFactory.create(url, headersToMap(headers), websocketCallbacks);
    conn.connect();
    await onopenPromise;
    let transformedModel = tModel(this.apiClient, params.model);
    if (this.apiClient.isVertexAI() && transformedModel.startsWith("publishers/")) {
      const project = this.apiClient.getProject();
      const location = this.apiClient.getLocation();
      if (project && location) {
        transformedModel = `projects/${project}/locations/${location}/` + transformedModel;
      }
    }
    let clientMessage = {};
    if (this.apiClient.isVertexAI() && ((_c = params.config) === null || _c === void 0 ? void 0 : _c.responseModalities) === void 0) {
      if (params.config === void 0) {
        params.config = { responseModalities: [Modality.AUDIO] };
      } else {
        params.config.responseModalities = [Modality.AUDIO];
      }
    }
    if ((_d = params.config) === null || _d === void 0 ? void 0 : _d.generationConfig) {
      console.warn("Setting `LiveConnectConfig.generation_config` is deprecated, please set the fields on `LiveConnectConfig` directly. This will become an error in a future version (not before Q3 2025).");
    }
    const inputTools = (_f = (_e = params.config) === null || _e === void 0 ? void 0 : _e.tools) !== null && _f !== void 0 ? _f : [];
    const convertedTools = [];
    for (const tool of inputTools) {
      if (this.isCallableTool(tool)) {
        const callableTool = tool;
        convertedTools.push(await callableTool.tool());
      } else {
        convertedTools.push(tool);
      }
    }
    if (convertedTools.length > 0) {
      params.config.tools = convertedTools;
    }
    const liveConnectParameters = {
      model: transformedModel,
      config: params.config,
      callbacks: params.callbacks
    };
    if (this.apiClient.isVertexAI()) {
      clientMessage = liveConnectParametersToVertex(this.apiClient, liveConnectParameters);
    } else {
      clientMessage = liveConnectParametersToMldev(this.apiClient, liveConnectParameters);
    }
    delete clientMessage["config"];
    conn.send(JSON.stringify(clientMessage));
    return new Session(conn, this.apiClient);
  }
  // TODO: b/416041229 - Abstract this method to a common place.
  isCallableTool(tool) {
    return "callTool" in tool && typeof tool.callTool === "function";
  }
};
var defaultLiveSendClientContentParamerters = {
  turnComplete: true
};
var Session = class {
  static {
    __name(this, "Session");
  }
  constructor(conn, apiClient) {
    this.conn = conn;
    this.apiClient = apiClient;
  }
  tLiveClientContent(apiClient, params) {
    if (params.turns !== null && params.turns !== void 0) {
      let contents = [];
      try {
        contents = tContents(params.turns);
        if (!apiClient.isVertexAI()) {
          contents = contents.map((item) => contentToMldev$1(item));
        }
      } catch (_a2) {
        throw new Error(`Failed to parse client content "turns", type: '${typeof params.turns}'`);
      }
      return {
        clientContent: { turns: contents, turnComplete: params.turnComplete }
      };
    }
    return {
      clientContent: { turnComplete: params.turnComplete }
    };
  }
  tLiveClienttToolResponse(apiClient, params) {
    let functionResponses = [];
    if (params.functionResponses == null) {
      throw new Error("functionResponses is required.");
    }
    if (!Array.isArray(params.functionResponses)) {
      functionResponses = [params.functionResponses];
    } else {
      functionResponses = params.functionResponses;
    }
    if (functionResponses.length === 0) {
      throw new Error("functionResponses is required.");
    }
    for (const functionResponse of functionResponses) {
      if (typeof functionResponse !== "object" || functionResponse === null || !("name" in functionResponse) || !("response" in functionResponse)) {
        throw new Error(`Could not parse function response, type '${typeof functionResponse}'.`);
      }
      if (!apiClient.isVertexAI() && !("id" in functionResponse)) {
        throw new Error(FUNCTION_RESPONSE_REQUIRES_ID);
      }
    }
    const clientMessage = {
      toolResponse: { functionResponses }
    };
    return clientMessage;
  }
  /**
      Send a message over the established connection.
  
      @param params - Contains two **optional** properties, `turns` and
          `turnComplete`.
  
        - `turns` will be converted to a `Content[]`
        - `turnComplete: true` [default] indicates that you are done sending
          content and expect a response. If `turnComplete: false`, the server
          will wait for additional messages before starting generation.
  
      @experimental
  
      @remarks
      There are two ways to send messages to the live API:
      `sendClientContent` and `sendRealtimeInput`.
  
      `sendClientContent` messages are added to the model context **in order**.
      Having a conversation using `sendClientContent` messages is roughly
      equivalent to using the `Chat.sendMessageStream`, except that the state of
      the `chat` history is stored on the API server instead of locally.
  
      Because of `sendClientContent`'s order guarantee, the model cannot respons
      as quickly to `sendClientContent` messages as to `sendRealtimeInput`
      messages. This makes the biggest difference when sending objects that have
      significant preprocessing time (typically images).
  
      The `sendClientContent` message sends a `Content[]`
      which has more options than the `Blob` sent by `sendRealtimeInput`.
  
      So the main use-cases for `sendClientContent` over `sendRealtimeInput` are:
  
      - Sending anything that can't be represented as a `Blob` (text,
      `sendClientContent({turns="Hello?"}`)).
      - Managing turns when not using audio input and voice activity detection.
        (`sendClientContent({turnComplete:true})` or the short form
      `sendClientContent()`)
      - Prefilling a conversation context
        ```
        sendClientContent({
            turns: [
              Content({role:user, parts:...}),
              Content({role:user, parts:...}),
              ...
            ]
        })
        ```
      @experimental
     */
  sendClientContent(params) {
    params = Object.assign(Object.assign({}, defaultLiveSendClientContentParamerters), params);
    const clientMessage = this.tLiveClientContent(this.apiClient, params);
    this.conn.send(JSON.stringify(clientMessage));
  }
  /**
      Send a realtime message over the established connection.
  
      @param params - Contains one property, `media`.
  
        - `media` will be converted to a `Blob`
  
      @experimental
  
      @remarks
      Use `sendRealtimeInput` for realtime audio chunks and video frames (images).
  
      With `sendRealtimeInput` the api will respond to audio automatically
      based on voice activity detection (VAD).
  
      `sendRealtimeInput` is optimized for responsivness at the expense of
      deterministic ordering guarantees. Audio and video tokens are to the
      context when they become available.
  
      Note: The Call signature expects a `Blob` object, but only a subset
      of audio and image mimetypes are allowed.
     */
  sendRealtimeInput(params) {
    let clientMessage = {};
    if (this.apiClient.isVertexAI()) {
      clientMessage = {
        "realtimeInput": liveSendRealtimeInputParametersToVertex(params)
      };
    } else {
      clientMessage = {
        "realtimeInput": liveSendRealtimeInputParametersToMldev(params)
      };
    }
    this.conn.send(JSON.stringify(clientMessage));
  }
  /**
      Send a function response message over the established connection.
  
      @param params - Contains property `functionResponses`.
  
        - `functionResponses` will be converted to a `functionResponses[]`
  
      @remarks
      Use `sendFunctionResponse` to reply to `LiveServerToolCall` from the server.
  
      Use {@link types.LiveConnectConfig#tools} to configure the callable functions.
  
      @experimental
     */
  sendToolResponse(params) {
    if (params.functionResponses == null) {
      throw new Error("Tool response parameters are required.");
    }
    const clientMessage = this.tLiveClienttToolResponse(this.apiClient, params);
    this.conn.send(JSON.stringify(clientMessage));
  }
  /**
       Terminates the WebSocket connection.
  
       @experimental
  
       @example
       ```ts
       let model: string;
       if (GOOGLE_GENAI_USE_VERTEXAI) {
         model = 'gemini-2.0-flash-live-preview-04-09';
       } else {
         model = 'gemini-live-2.5-flash-preview';
       }
       const session = await ai.live.connect({
         model: model,
         config: {
           responseModalities: [Modality.AUDIO],
         }
       });
  
       session.close();
       ```
     */
  close() {
    this.conn.close();
  }
};
function headersToMap(headers) {
  const headerMap = {};
  headers.forEach((value, key) => {
    headerMap[key] = value;
  });
  return headerMap;
}
__name(headersToMap, "headersToMap");
function mapToHeaders(map) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(map)) {
    headers.append(key, value);
  }
  return headers;
}
__name(mapToHeaders, "mapToHeaders");
var DEFAULT_MAX_REMOTE_CALLS = 10;
function shouldDisableAfc(config2) {
  var _a2, _b, _c;
  if ((_a2 = config2 === null || config2 === void 0 ? void 0 : config2.automaticFunctionCalling) === null || _a2 === void 0 ? void 0 : _a2.disable) {
    return true;
  }
  let callableToolsPresent = false;
  for (const tool of (_b = config2 === null || config2 === void 0 ? void 0 : config2.tools) !== null && _b !== void 0 ? _b : []) {
    if (isCallableTool(tool)) {
      callableToolsPresent = true;
      break;
    }
  }
  if (!callableToolsPresent) {
    return true;
  }
  const maxCalls = (_c = config2 === null || config2 === void 0 ? void 0 : config2.automaticFunctionCalling) === null || _c === void 0 ? void 0 : _c.maximumRemoteCalls;
  if (maxCalls && (maxCalls < 0 || !Number.isInteger(maxCalls)) || maxCalls == 0) {
    console.warn("Invalid maximumRemoteCalls value provided for automatic function calling. Disabled automatic function calling. Please provide a valid integer value greater than 0. maximumRemoteCalls provided:", maxCalls);
    return true;
  }
  return false;
}
__name(shouldDisableAfc, "shouldDisableAfc");
function isCallableTool(tool) {
  return "callTool" in tool && typeof tool.callTool === "function";
}
__name(isCallableTool, "isCallableTool");
function hasCallableTools(params) {
  var _a2, _b, _c;
  return (_c = (_b = (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.tools) === null || _b === void 0 ? void 0 : _b.some((tool) => isCallableTool(tool))) !== null && _c !== void 0 ? _c : false;
}
__name(hasCallableTools, "hasCallableTools");
function findAfcIncompatibleToolIndexes(params) {
  var _a2;
  const afcIncompatibleToolIndexes = [];
  if (!((_a2 = params === null || params === void 0 ? void 0 : params.config) === null || _a2 === void 0 ? void 0 : _a2.tools)) {
    return afcIncompatibleToolIndexes;
  }
  params.config.tools.forEach((tool, index) => {
    if (isCallableTool(tool)) {
      return;
    }
    const geminiTool = tool;
    if (geminiTool.functionDeclarations && geminiTool.functionDeclarations.length > 0) {
      afcIncompatibleToolIndexes.push(index);
    }
  });
  return afcIncompatibleToolIndexes;
}
__name(findAfcIncompatibleToolIndexes, "findAfcIncompatibleToolIndexes");
function shouldAppendAfcHistory(config2) {
  var _a2;
  return !((_a2 = config2 === null || config2 === void 0 ? void 0 : config2.automaticFunctionCalling) === null || _a2 === void 0 ? void 0 : _a2.ignoreCallHistory);
}
__name(shouldAppendAfcHistory, "shouldAppendAfcHistory");
var Models = class extends BaseModule {
  static {
    __name(this, "Models");
  }
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
    this.generateContent = async (params) => {
      var _a2, _b, _c, _d, _e;
      const transformedParams = await this.processParamsMaybeAddMcpUsage(params);
      this.maybeMoveToResponseJsonSchem(params);
      if (!hasCallableTools(params) || shouldDisableAfc(params.config)) {
        return await this.generateContentInternal(transformedParams);
      }
      const incompatibleToolIndexes = findAfcIncompatibleToolIndexes(params);
      if (incompatibleToolIndexes.length > 0) {
        const formattedIndexes = incompatibleToolIndexes.map((index) => `tools[${index}]`).join(", ");
        throw new Error(`Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations is not yet supported. Incompatible tools found at ${formattedIndexes}.`);
      }
      let response;
      let functionResponseContent;
      const automaticFunctionCallingHistory = tContents(transformedParams.contents);
      const maxRemoteCalls = (_c = (_b = (_a2 = transformedParams.config) === null || _a2 === void 0 ? void 0 : _a2.automaticFunctionCalling) === null || _b === void 0 ? void 0 : _b.maximumRemoteCalls) !== null && _c !== void 0 ? _c : DEFAULT_MAX_REMOTE_CALLS;
      let remoteCalls = 0;
      while (remoteCalls < maxRemoteCalls) {
        response = await this.generateContentInternal(transformedParams);
        if (!response.functionCalls || response.functionCalls.length === 0) {
          break;
        }
        const responseContent = response.candidates[0].content;
        const functionResponseParts = [];
        for (const tool of (_e = (_d = params.config) === null || _d === void 0 ? void 0 : _d.tools) !== null && _e !== void 0 ? _e : []) {
          if (isCallableTool(tool)) {
            const callableTool = tool;
            const parts = await callableTool.callTool(response.functionCalls);
            functionResponseParts.push(...parts);
          }
        }
        remoteCalls++;
        functionResponseContent = {
          role: "user",
          parts: functionResponseParts
        };
        transformedParams.contents = tContents(transformedParams.contents);
        transformedParams.contents.push(responseContent);
        transformedParams.contents.push(functionResponseContent);
        if (shouldAppendAfcHistory(transformedParams.config)) {
          automaticFunctionCallingHistory.push(responseContent);
          automaticFunctionCallingHistory.push(functionResponseContent);
        }
      }
      if (shouldAppendAfcHistory(transformedParams.config)) {
        response.automaticFunctionCallingHistory = automaticFunctionCallingHistory;
      }
      return response;
    };
    this.generateContentStream = async (params) => {
      var _a2, _b, _c, _d, _e;
      this.maybeMoveToResponseJsonSchem(params);
      if (shouldDisableAfc(params.config)) {
        const transformedParams = await this.processParamsMaybeAddMcpUsage(params);
        return await this.generateContentStreamInternal(transformedParams);
      }
      const incompatibleToolIndexes = findAfcIncompatibleToolIndexes(params);
      if (incompatibleToolIndexes.length > 0) {
        const formattedIndexes = incompatibleToolIndexes.map((index) => `tools[${index}]`).join(", ");
        throw new Error(`Incompatible tools found at ${formattedIndexes}. Automatic function calling with CallableTools (or MCP objects) and basic FunctionDeclarations" is not yet supported.`);
      }
      const streamFunctionCall = (_c = (_b = (_a2 = params === null || params === void 0 ? void 0 : params.config) === null || _a2 === void 0 ? void 0 : _a2.toolConfig) === null || _b === void 0 ? void 0 : _b.functionCallingConfig) === null || _c === void 0 ? void 0 : _c.streamFunctionCallArguments;
      const disableAfc = (_e = (_d = params === null || params === void 0 ? void 0 : params.config) === null || _d === void 0 ? void 0 : _d.automaticFunctionCalling) === null || _e === void 0 ? void 0 : _e.disable;
      if (streamFunctionCall && !disableAfc) {
        throw new Error("Running in streaming mode with 'streamFunctionCallArguments' enabled, this feature is not compatible with automatic function calling (AFC). Please set 'config.automaticFunctionCalling.disable' to true to disable AFC or leave 'config.toolConfig.functionCallingConfig.streamFunctionCallArguments' to be undefined or set to false to disable streaming function call arguments feature.");
      }
      return await this.processAfcStream(params);
    };
    this.generateImages = async (params) => {
      return await this.generateImagesInternal(params).then((apiResponse) => {
        var _a2;
        let positivePromptSafetyAttributes;
        const generatedImages = [];
        if (apiResponse === null || apiResponse === void 0 ? void 0 : apiResponse.generatedImages) {
          for (const generatedImage of apiResponse.generatedImages) {
            if (generatedImage && (generatedImage === null || generatedImage === void 0 ? void 0 : generatedImage.safetyAttributes) && ((_a2 = generatedImage === null || generatedImage === void 0 ? void 0 : generatedImage.safetyAttributes) === null || _a2 === void 0 ? void 0 : _a2.contentType) === "Positive Prompt") {
              positivePromptSafetyAttributes = generatedImage === null || generatedImage === void 0 ? void 0 : generatedImage.safetyAttributes;
            } else {
              generatedImages.push(generatedImage);
            }
          }
        }
        let response;
        if (positivePromptSafetyAttributes) {
          response = {
            generatedImages,
            positivePromptSafetyAttributes,
            sdkHttpResponse: apiResponse.sdkHttpResponse
          };
        } else {
          response = {
            generatedImages,
            sdkHttpResponse: apiResponse.sdkHttpResponse
          };
        }
        return response;
      });
    };
    this.list = async (params) => {
      var _a2;
      const defaultConfig = {
        queryBase: true
      };
      const actualConfig = Object.assign(Object.assign({}, defaultConfig), params === null || params === void 0 ? void 0 : params.config);
      const actualParams = {
        config: actualConfig
      };
      if (this.apiClient.isVertexAI()) {
        if (!actualParams.config.queryBase) {
          if ((_a2 = actualParams.config) === null || _a2 === void 0 ? void 0 : _a2.filter) {
            throw new Error("Filtering tuned models list for Vertex AI is not currently supported");
          } else {
            actualParams.config.filter = "labels.tune-type:*";
          }
        }
      }
      return new Pager(PagedItem.PAGED_ITEM_MODELS, (x) => this.listInternal(x), await this.listInternal(actualParams), actualParams);
    };
    this.editImage = async (params) => {
      const paramsInternal = {
        model: params.model,
        prompt: params.prompt,
        referenceImages: [],
        config: params.config
      };
      if (params.referenceImages) {
        if (params.referenceImages) {
          paramsInternal.referenceImages = params.referenceImages.map((img) => img.toReferenceImageAPI());
        }
      }
      return await this.editImageInternal(paramsInternal);
    };
    this.upscaleImage = async (params) => {
      let apiConfig = {
        numberOfImages: 1,
        mode: "upscale"
      };
      if (params.config) {
        apiConfig = Object.assign(Object.assign({}, apiConfig), params.config);
      }
      const apiParams = {
        model: params.model,
        image: params.image,
        upscaleFactor: params.upscaleFactor,
        config: apiConfig
      };
      return await this.upscaleImageInternal(apiParams);
    };
    this.generateVideos = async (params) => {
      var _a2, _b, _c, _d, _e, _f;
      if ((params.prompt || params.image || params.video) && params.source) {
        throw new Error("Source and prompt/image/video are mutually exclusive. Please only use source.");
      }
      if (!this.apiClient.isVertexAI()) {
        if (((_a2 = params.video) === null || _a2 === void 0 ? void 0 : _a2.uri) && ((_b = params.video) === null || _b === void 0 ? void 0 : _b.videoBytes)) {
          params.video = {
            uri: params.video.uri,
            mimeType: params.video.mimeType
          };
        } else if (((_d = (_c = params.source) === null || _c === void 0 ? void 0 : _c.video) === null || _d === void 0 ? void 0 : _d.uri) && ((_f = (_e = params.source) === null || _e === void 0 ? void 0 : _e.video) === null || _f === void 0 ? void 0 : _f.videoBytes)) {
          params.source.video = {
            uri: params.source.video.uri,
            mimeType: params.source.video.mimeType
          };
        }
      }
      return await this.generateVideosInternal(params);
    };
  }
  /**
   * This logic is needed for GenerateContentConfig only.
   * Previously we made GenerateContentConfig.responseSchema field to accept
   * unknown. Since v1.9.0, we switch to use backend JSON schema support.
   * To maintain backward compatibility, we move the data that was treated as
   * JSON schema from the responseSchema field to the responseJsonSchema field.
   */
  maybeMoveToResponseJsonSchem(params) {
    if (params.config && params.config.responseSchema) {
      if (!params.config.responseJsonSchema) {
        if (Object.keys(params.config.responseSchema).includes("$schema")) {
          params.config.responseJsonSchema = params.config.responseSchema;
          delete params.config.responseSchema;
        }
      }
    }
    return;
  }
  /**
   * Transforms the CallableTools in the parameters to be simply Tools, it
   * copies the params into a new object and replaces the tools, it does not
   * modify the original params. Also sets the MCP usage header if there are
   * MCP tools in the parameters.
   */
  async processParamsMaybeAddMcpUsage(params) {
    var _a2, _b, _c;
    const tools = (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.tools;
    if (!tools) {
      return params;
    }
    const transformedTools = await Promise.all(tools.map(async (tool) => {
      if (isCallableTool(tool)) {
        const callableTool = tool;
        return await callableTool.tool();
      }
      return tool;
    }));
    const newParams = {
      model: params.model,
      contents: params.contents,
      config: Object.assign(Object.assign({}, params.config), { tools: transformedTools })
    };
    newParams.config.tools = transformedTools;
    if (params.config && params.config.tools && hasMcpToolUsage(params.config.tools)) {
      const headers = (_c = (_b = params.config.httpOptions) === null || _b === void 0 ? void 0 : _b.headers) !== null && _c !== void 0 ? _c : {};
      let newHeaders = Object.assign({}, headers);
      if (Object.keys(newHeaders).length === 0) {
        newHeaders = this.apiClient.getDefaultHeaders();
      }
      setMcpUsageHeader(newHeaders);
      newParams.config.httpOptions = Object.assign(Object.assign({}, params.config.httpOptions), { headers: newHeaders });
    }
    return newParams;
  }
  async initAfcToolsMap(params) {
    var _a2, _b, _c;
    const afcTools = /* @__PURE__ */ new Map();
    for (const tool of (_b = (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.tools) !== null && _b !== void 0 ? _b : []) {
      if (isCallableTool(tool)) {
        const callableTool = tool;
        const toolDeclaration = await callableTool.tool();
        for (const declaration of (_c = toolDeclaration.functionDeclarations) !== null && _c !== void 0 ? _c : []) {
          if (!declaration.name) {
            throw new Error("Function declaration name is required.");
          }
          if (afcTools.has(declaration.name)) {
            throw new Error(`Duplicate tool declaration name: ${declaration.name}`);
          }
          afcTools.set(declaration.name, callableTool);
        }
      }
    }
    return afcTools;
  }
  async processAfcStream(params) {
    var _a2, _b, _c;
    const maxRemoteCalls = (_c = (_b = (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.automaticFunctionCalling) === null || _b === void 0 ? void 0 : _b.maximumRemoteCalls) !== null && _c !== void 0 ? _c : DEFAULT_MAX_REMOTE_CALLS;
    let wereFunctionsCalled = false;
    let remoteCallCount = 0;
    const afcToolsMap = await this.initAfcToolsMap(params);
    return (function(models, afcTools, params2) {
      return __asyncGenerator(this, arguments, function* () {
        var _a3, e_1, _b2, _c2;
        var _d, _e;
        while (remoteCallCount < maxRemoteCalls) {
          if (wereFunctionsCalled) {
            remoteCallCount++;
            wereFunctionsCalled = false;
          }
          const transformedParams = yield __await(models.processParamsMaybeAddMcpUsage(params2));
          const response = yield __await(models.generateContentStreamInternal(transformedParams));
          const functionResponses = [];
          const responseContents = [];
          try {
            for (var _f = true, response_1 = (e_1 = void 0, __asyncValues(response)), response_1_1; response_1_1 = yield __await(response_1.next()), _a3 = response_1_1.done, !_a3; _f = true) {
              _c2 = response_1_1.value;
              _f = false;
              const chunk = _c2;
              yield yield __await(chunk);
              if (chunk.candidates && ((_d = chunk.candidates[0]) === null || _d === void 0 ? void 0 : _d.content)) {
                responseContents.push(chunk.candidates[0].content);
                for (const part of (_e = chunk.candidates[0].content.parts) !== null && _e !== void 0 ? _e : []) {
                  if (remoteCallCount < maxRemoteCalls && part.functionCall) {
                    if (!part.functionCall.name) {
                      throw new Error("Function call name was not returned by the model.");
                    }
                    if (!afcTools.has(part.functionCall.name)) {
                      throw new Error(`Automatic function calling was requested, but not all the tools the model used implement the CallableTool interface. Available tools: ${afcTools.keys()}, mising tool: ${part.functionCall.name}`);
                    } else {
                      const responseParts = yield __await(afcTools.get(part.functionCall.name).callTool([part.functionCall]));
                      functionResponses.push(...responseParts);
                    }
                  }
                }
              }
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (!_f && !_a3 && (_b2 = response_1.return)) yield __await(_b2.call(response_1));
            } finally {
              if (e_1) throw e_1.error;
            }
          }
          if (functionResponses.length > 0) {
            wereFunctionsCalled = true;
            const typedResponseChunk = new GenerateContentResponse();
            typedResponseChunk.candidates = [
              {
                content: {
                  role: "user",
                  parts: functionResponses
                }
              }
            ];
            yield yield __await(typedResponseChunk);
            const newContents = [];
            newContents.push(...responseContents);
            newContents.push({
              role: "user",
              parts: functionResponses
            });
            const updatedContents = tContents(params2.contents).concat(newContents);
            params2.contents = updatedContents;
          } else {
            break;
          }
        }
      });
    })(this, afcToolsMap, params);
  }
  async generateContentInternal(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = generateContentParametersToVertex(this.apiClient, params);
      path2 = formatMap("{model}:generateContent", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = generateContentResponseFromVertex(apiResponse);
        const typedResp = new GenerateContentResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      const body = generateContentParametersToMldev(this.apiClient, params);
      path2 = formatMap("{model}:generateContent", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = generateContentResponseFromMldev(apiResponse);
        const typedResp = new GenerateContentResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  async generateContentStreamInternal(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = generateContentParametersToVertex(this.apiClient, params);
      path2 = formatMap("{model}:streamGenerateContent?alt=sse", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      const apiClient = this.apiClient;
      response = apiClient.requestStream({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      });
      return response.then(function(apiResponse) {
        return __asyncGenerator(this, arguments, function* () {
          var _a3, e_2, _b2, _c2;
          try {
            for (var _d2 = true, apiResponse_1 = __asyncValues(apiResponse), apiResponse_1_1; apiResponse_1_1 = yield __await(apiResponse_1.next()), _a3 = apiResponse_1_1.done, !_a3; _d2 = true) {
              _c2 = apiResponse_1_1.value;
              _d2 = false;
              const chunk = _c2;
              const resp = generateContentResponseFromVertex(yield __await(chunk.json()), params);
              resp["sdkHttpResponse"] = {
                headers: chunk.headers
              };
              const typedResp = new GenerateContentResponse();
              Object.assign(typedResp, resp);
              yield yield __await(typedResp);
            }
          } catch (e_2_1) {
            e_2 = { error: e_2_1 };
          } finally {
            try {
              if (!_d2 && !_a3 && (_b2 = apiResponse_1.return)) yield __await(_b2.call(apiResponse_1));
            } finally {
              if (e_2) throw e_2.error;
            }
          }
        });
      });
    } else {
      const body = generateContentParametersToMldev(this.apiClient, params);
      path2 = formatMap("{model}:streamGenerateContent?alt=sse", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      const apiClient = this.apiClient;
      response = apiClient.requestStream({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      });
      return response.then(function(apiResponse) {
        return __asyncGenerator(this, arguments, function* () {
          var _a3, e_3, _b2, _c2;
          try {
            for (var _d2 = true, apiResponse_2 = __asyncValues(apiResponse), apiResponse_2_1; apiResponse_2_1 = yield __await(apiResponse_2.next()), _a3 = apiResponse_2_1.done, !_a3; _d2 = true) {
              _c2 = apiResponse_2_1.value;
              _d2 = false;
              const chunk = _c2;
              const resp = generateContentResponseFromMldev(yield __await(chunk.json()), params);
              resp["sdkHttpResponse"] = {
                headers: chunk.headers
              };
              const typedResp = new GenerateContentResponse();
              Object.assign(typedResp, resp);
              yield yield __await(typedResp);
            }
          } catch (e_3_1) {
            e_3 = { error: e_3_1 };
          } finally {
            try {
              if (!_d2 && !_a3 && (_b2 = apiResponse_2.return)) yield __await(_b2.call(apiResponse_2));
            } finally {
              if (e_3) throw e_3.error;
            }
          }
        });
      });
    }
  }
  /**
   * Calculates embeddings for the given contents. Only text is supported.
   *
   * @param params - The parameters for embedding contents.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response = await ai.models.embedContent({
   *  model: 'text-embedding-004',
   *  contents: [
   *    'What is your name?',
   *    'What is your favorite color?',
   *  ],
   *  config: {
   *    outputDimensionality: 64,
   *  },
   * });
   * console.log(response);
   * ```
   */
  async embedContent(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = embedContentParametersToVertex(this.apiClient, params);
      path2 = formatMap("{model}:predict", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = embedContentResponseFromVertex(apiResponse);
        const typedResp = new EmbedContentResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      const body = embedContentParametersToMldev(this.apiClient, params);
      path2 = formatMap("{model}:batchEmbedContents", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = embedContentResponseFromMldev(apiResponse);
        const typedResp = new EmbedContentResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  /**
   * Private method for generating images.
   */
  async generateImagesInternal(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = generateImagesParametersToVertex(this.apiClient, params);
      path2 = formatMap("{model}:predict", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = generateImagesResponseFromVertex(apiResponse);
        const typedResp = new GenerateImagesResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      const body = generateImagesParametersToMldev(this.apiClient, params);
      path2 = formatMap("{model}:predict", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = generateImagesResponseFromMldev(apiResponse);
        const typedResp = new GenerateImagesResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  /**
   * Private method for editing an image.
   */
  async editImageInternal(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = editImageParametersInternalToVertex(this.apiClient, params);
      path2 = formatMap("{model}:predict", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = editImageResponseFromVertex(apiResponse);
        const typedResp = new EditImageResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      throw new Error("This method is only supported by the Vertex AI.");
    }
  }
  /**
   * Private method for upscaling an image.
   */
  async upscaleImageInternal(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = upscaleImageAPIParametersInternalToVertex(this.apiClient, params);
      path2 = formatMap("{model}:predict", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = upscaleImageResponseFromVertex(apiResponse);
        const typedResp = new UpscaleImageResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      throw new Error("This method is only supported by the Vertex AI.");
    }
  }
  /**
   * Recontextualizes an image.
   *
   * There are two types of recontextualization currently supported:
   * 1) Imagen Product Recontext - Generate images of products in new scenes
   *    and contexts.
   * 2) Virtual Try-On: Generate images of persons modeling fashion products.
   *
   * @param params - The parameters for recontextualizing an image.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response1 = await ai.models.recontextImage({
   *  model: 'imagen-product-recontext-preview-06-30',
   *  source: {
   *    prompt: 'In a modern kitchen setting.',
   *    productImages: [productImage],
   *  },
   *  config: {
   *    numberOfImages: 1,
   *  },
   * });
   * console.log(response1?.generatedImages?.[0]?.image?.imageBytes);
   *
   * const response2 = await ai.models.recontextImage({
   *  model: 'virtual-try-on-001',
   *  source: {
   *    personImage: personImage,
   *    productImages: [productImage],
   *  },
   *  config: {
   *    numberOfImages: 1,
   *  },
   * });
   * console.log(response2?.generatedImages?.[0]?.image?.imageBytes);
   * ```
   */
  async recontextImage(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = recontextImageParametersToVertex(this.apiClient, params);
      path2 = formatMap("{model}:predict", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = recontextImageResponseFromVertex(apiResponse);
        const typedResp = new RecontextImageResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      throw new Error("This method is only supported by the Vertex AI.");
    }
  }
  /**
   * Segments an image, creating a mask of a specified area.
   *
   * @param params - The parameters for segmenting an image.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response = await ai.models.segmentImage({
   *  model: 'image-segmentation-001',
   *  source: {
   *    image: image,
   *  },
   *  config: {
   *    mode: 'foreground',
   *  },
   * });
   * console.log(response?.generatedMasks?.[0]?.mask?.imageBytes);
   * ```
   */
  async segmentImage(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = segmentImageParametersToVertex(this.apiClient, params);
      path2 = formatMap("{model}:predict", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = segmentImageResponseFromVertex(apiResponse);
        const typedResp = new SegmentImageResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      throw new Error("This method is only supported by the Vertex AI.");
    }
  }
  /**
   * Fetches information about a model by name.
   *
   * @example
   * ```ts
   * const modelInfo = await ai.models.get({model: 'gemini-2.0-flash'});
   * ```
   */
  async get(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = getModelParametersToVertex(this.apiClient, params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = modelFromVertex(apiResponse);
        return resp;
      });
    } else {
      const body = getModelParametersToMldev(this.apiClient, params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = modelFromMldev(apiResponse);
        return resp;
      });
    }
  }
  async listInternal(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = listModelsParametersToVertex(this.apiClient, params);
      path2 = formatMap("{models_url}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = listModelsResponseFromVertex(apiResponse);
        const typedResp = new ListModelsResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      const body = listModelsParametersToMldev(this.apiClient, params);
      path2 = formatMap("{models_url}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = listModelsResponseFromMldev(apiResponse);
        const typedResp = new ListModelsResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  /**
   * Updates a tuned model by its name.
   *
   * @param params - The parameters for updating the model.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response = await ai.models.update({
   *   model: 'tuned-model-name',
   *   config: {
   *     displayName: 'New display name',
   *     description: 'New description',
   *   },
   * });
   * ```
   */
  async update(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = updateModelParametersToVertex(this.apiClient, params);
      path2 = formatMap("{model}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "PATCH",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = modelFromVertex(apiResponse);
        return resp;
      });
    } else {
      const body = updateModelParametersToMldev(this.apiClient, params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "PATCH",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = modelFromMldev(apiResponse);
        return resp;
      });
    }
  }
  /**
   * Deletes a tuned model by its name.
   *
   * @param params - The parameters for deleting the model.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response = await ai.models.delete({model: 'tuned-model-name'});
   * ```
   */
  async delete(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = deleteModelParametersToVertex(this.apiClient, params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "DELETE",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = deleteModelResponseFromVertex(apiResponse);
        const typedResp = new DeleteModelResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      const body = deleteModelParametersToMldev(this.apiClient, params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "DELETE",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = deleteModelResponseFromMldev(apiResponse);
        const typedResp = new DeleteModelResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  /**
   * Counts the number of tokens in the given contents. Multimodal input is
   * supported for Gemini models.
   *
   * @param params - The parameters for counting tokens.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response = await ai.models.countTokens({
   *  model: 'gemini-2.0-flash',
   *  contents: 'The quick brown fox jumps over the lazy dog.'
   * });
   * console.log(response);
   * ```
   */
  async countTokens(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = countTokensParametersToVertex(this.apiClient, params);
      path2 = formatMap("{model}:countTokens", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = countTokensResponseFromVertex(apiResponse);
        const typedResp = new CountTokensResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      const body = countTokensParametersToMldev(this.apiClient, params);
      path2 = formatMap("{model}:countTokens", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = countTokensResponseFromMldev(apiResponse);
        const typedResp = new CountTokensResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  /**
   * Given a list of contents, returns a corresponding TokensInfo containing
   * the list of tokens and list of token ids.
   *
   * This method is not supported by the Gemini Developer API.
   *
   * @param params - The parameters for computing tokens.
   * @return The response from the API.
   *
   * @example
   * ```ts
   * const response = await ai.models.computeTokens({
   *  model: 'gemini-2.0-flash',
   *  contents: 'What is your name?'
   * });
   * console.log(response);
   * ```
   */
  async computeTokens(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = computeTokensParametersToVertex(this.apiClient, params);
      path2 = formatMap("{model}:computeTokens", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = computeTokensResponseFromVertex(apiResponse);
        const typedResp = new ComputeTokensResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      throw new Error("This method is only supported by the Vertex AI.");
    }
  }
  /**
   * Private method for generating videos.
   */
  async generateVideosInternal(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = generateVideosParametersToVertex(this.apiClient, params);
      path2 = formatMap("{model}:predictLongRunning", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = generateVideosOperationFromVertex(apiResponse);
        const typedResp = new GenerateVideosOperation();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      const body = generateVideosParametersToMldev(this.apiClient, params);
      path2 = formatMap("{model}:predictLongRunning", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = generateVideosOperationFromMldev(apiResponse);
        const typedResp = new GenerateVideosOperation();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
};
var Operations = class extends BaseModule {
  static {
    __name(this, "Operations");
  }
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
  }
  /**
   * Gets the status of a long-running operation.
   *
   * @param parameters The parameters for the get operation request.
   * @return The updated Operation object, with the latest status or result.
   */
  async getVideosOperation(parameters) {
    const operation = parameters.operation;
    const config2 = parameters.config;
    if (operation.name === void 0 || operation.name === "") {
      throw new Error("Operation name is required.");
    }
    if (this.apiClient.isVertexAI()) {
      const resourceName2 = operation.name.split("/operations/")[0];
      let httpOptions = void 0;
      if (config2 && "httpOptions" in config2) {
        httpOptions = config2.httpOptions;
      }
      const rawOperation = await this.fetchPredictVideosOperationInternal({
        operationName: operation.name,
        resourceName: resourceName2,
        config: { httpOptions }
      });
      return operation._fromAPIResponse({
        apiResponse: rawOperation,
        _isVertexAI: true
      });
    } else {
      const rawOperation = await this.getVideosOperationInternal({
        operationName: operation.name,
        config: config2
      });
      return operation._fromAPIResponse({
        apiResponse: rawOperation,
        _isVertexAI: false
      });
    }
  }
  /**
   * Gets the status of a long-running operation.
   *
   * @param parameters The parameters for the get operation request.
   * @return The updated Operation object, with the latest status or result.
   */
  async get(parameters) {
    const operation = parameters.operation;
    const config2 = parameters.config;
    if (operation.name === void 0 || operation.name === "") {
      throw new Error("Operation name is required.");
    }
    if (this.apiClient.isVertexAI()) {
      const resourceName2 = operation.name.split("/operations/")[0];
      let httpOptions = void 0;
      if (config2 && "httpOptions" in config2) {
        httpOptions = config2.httpOptions;
      }
      const rawOperation = await this.fetchPredictVideosOperationInternal({
        operationName: operation.name,
        resourceName: resourceName2,
        config: { httpOptions }
      });
      return operation._fromAPIResponse({
        apiResponse: rawOperation,
        _isVertexAI: true
      });
    } else {
      const rawOperation = await this.getVideosOperationInternal({
        operationName: operation.name,
        config: config2
      });
      return operation._fromAPIResponse({
        apiResponse: rawOperation,
        _isVertexAI: false
      });
    }
  }
  async getVideosOperationInternal(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = getOperationParametersToVertex(params);
      path2 = formatMap("{operationName}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response;
    } else {
      const body = getOperationParametersToMldev(params);
      path2 = formatMap("{operationName}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response;
    }
  }
  async fetchPredictVideosOperationInternal(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = fetchPredictOperationParametersToVertex(params);
      path2 = formatMap("{resourceName}:fetchPredictOperation", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response;
    } else {
      throw new Error("This method is only supported by the Vertex AI.");
    }
  }
};
function blobToMldev(fromObject) {
  const toObject = {};
  const fromData = getValueByPath(fromObject, ["data"]);
  if (fromData != null) {
    setValueByPath(toObject, ["data"], fromData);
  }
  if (getValueByPath(fromObject, ["displayName"]) !== void 0) {
    throw new Error("displayName parameter is not supported in Gemini API.");
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(blobToMldev, "blobToMldev");
function contentToMldev(fromObject) {
  const toObject = {};
  const fromParts = getValueByPath(fromObject, ["parts"]);
  if (fromParts != null) {
    let transformedList = fromParts;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return partToMldev(item);
      });
    }
    setValueByPath(toObject, ["parts"], transformedList);
  }
  const fromRole = getValueByPath(fromObject, ["role"]);
  if (fromRole != null) {
    setValueByPath(toObject, ["role"], fromRole);
  }
  return toObject;
}
__name(contentToMldev, "contentToMldev");
function createAuthTokenConfigToMldev(apiClient, fromObject, parentObject) {
  const toObject = {};
  const fromExpireTime = getValueByPath(fromObject, ["expireTime"]);
  if (parentObject !== void 0 && fromExpireTime != null) {
    setValueByPath(parentObject, ["expireTime"], fromExpireTime);
  }
  const fromNewSessionExpireTime = getValueByPath(fromObject, [
    "newSessionExpireTime"
  ]);
  if (parentObject !== void 0 && fromNewSessionExpireTime != null) {
    setValueByPath(parentObject, ["newSessionExpireTime"], fromNewSessionExpireTime);
  }
  const fromUses = getValueByPath(fromObject, ["uses"]);
  if (parentObject !== void 0 && fromUses != null) {
    setValueByPath(parentObject, ["uses"], fromUses);
  }
  const fromLiveConnectConstraints = getValueByPath(fromObject, [
    "liveConnectConstraints"
  ]);
  if (parentObject !== void 0 && fromLiveConnectConstraints != null) {
    setValueByPath(parentObject, ["bidiGenerateContentSetup"], liveConnectConstraintsToMldev(apiClient, fromLiveConnectConstraints));
  }
  const fromLockAdditionalFields = getValueByPath(fromObject, [
    "lockAdditionalFields"
  ]);
  if (parentObject !== void 0 && fromLockAdditionalFields != null) {
    setValueByPath(parentObject, ["fieldMask"], fromLockAdditionalFields);
  }
  return toObject;
}
__name(createAuthTokenConfigToMldev, "createAuthTokenConfigToMldev");
function createAuthTokenParametersToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    setValueByPath(toObject, ["config"], createAuthTokenConfigToMldev(apiClient, fromConfig, toObject));
  }
  return toObject;
}
__name(createAuthTokenParametersToMldev, "createAuthTokenParametersToMldev");
function fileDataToMldev(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["displayName"]) !== void 0) {
    throw new Error("displayName parameter is not supported in Gemini API.");
  }
  const fromFileUri = getValueByPath(fromObject, ["fileUri"]);
  if (fromFileUri != null) {
    setValueByPath(toObject, ["fileUri"], fromFileUri);
  }
  const fromMimeType = getValueByPath(fromObject, ["mimeType"]);
  if (fromMimeType != null) {
    setValueByPath(toObject, ["mimeType"], fromMimeType);
  }
  return toObject;
}
__name(fileDataToMldev, "fileDataToMldev");
function functionCallToMldev(fromObject) {
  const toObject = {};
  const fromId = getValueByPath(fromObject, ["id"]);
  if (fromId != null) {
    setValueByPath(toObject, ["id"], fromId);
  }
  const fromArgs = getValueByPath(fromObject, ["args"]);
  if (fromArgs != null) {
    setValueByPath(toObject, ["args"], fromArgs);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  if (getValueByPath(fromObject, ["partialArgs"]) !== void 0) {
    throw new Error("partialArgs parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["willContinue"]) !== void 0) {
    throw new Error("willContinue parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(functionCallToMldev, "functionCallToMldev");
function googleMapsToMldev(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["authConfig"]) !== void 0) {
    throw new Error("authConfig parameter is not supported in Gemini API.");
  }
  const fromEnableWidget = getValueByPath(fromObject, ["enableWidget"]);
  if (fromEnableWidget != null) {
    setValueByPath(toObject, ["enableWidget"], fromEnableWidget);
  }
  return toObject;
}
__name(googleMapsToMldev, "googleMapsToMldev");
function googleSearchToMldev(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["excludeDomains"]) !== void 0) {
    throw new Error("excludeDomains parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["blockingConfidence"]) !== void 0) {
    throw new Error("blockingConfidence parameter is not supported in Gemini API.");
  }
  const fromTimeRangeFilter = getValueByPath(fromObject, [
    "timeRangeFilter"
  ]);
  if (fromTimeRangeFilter != null) {
    setValueByPath(toObject, ["timeRangeFilter"], fromTimeRangeFilter);
  }
  return toObject;
}
__name(googleSearchToMldev, "googleSearchToMldev");
function liveConnectConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromGenerationConfig = getValueByPath(fromObject, [
    "generationConfig"
  ]);
  if (parentObject !== void 0 && fromGenerationConfig != null) {
    setValueByPath(parentObject, ["setup", "generationConfig"], fromGenerationConfig);
  }
  const fromResponseModalities = getValueByPath(fromObject, [
    "responseModalities"
  ]);
  if (parentObject !== void 0 && fromResponseModalities != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "responseModalities"], fromResponseModalities);
  }
  const fromTemperature = getValueByPath(fromObject, ["temperature"]);
  if (parentObject !== void 0 && fromTemperature != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "temperature"], fromTemperature);
  }
  const fromTopP = getValueByPath(fromObject, ["topP"]);
  if (parentObject !== void 0 && fromTopP != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "topP"], fromTopP);
  }
  const fromTopK = getValueByPath(fromObject, ["topK"]);
  if (parentObject !== void 0 && fromTopK != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "topK"], fromTopK);
  }
  const fromMaxOutputTokens = getValueByPath(fromObject, [
    "maxOutputTokens"
  ]);
  if (parentObject !== void 0 && fromMaxOutputTokens != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "maxOutputTokens"], fromMaxOutputTokens);
  }
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (parentObject !== void 0 && fromMediaResolution != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "mediaResolution"], fromMediaResolution);
  }
  const fromSeed = getValueByPath(fromObject, ["seed"]);
  if (parentObject !== void 0 && fromSeed != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "seed"], fromSeed);
  }
  const fromSpeechConfig = getValueByPath(fromObject, ["speechConfig"]);
  if (parentObject !== void 0 && fromSpeechConfig != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "speechConfig"], tLiveSpeechConfig(fromSpeechConfig));
  }
  const fromThinkingConfig = getValueByPath(fromObject, [
    "thinkingConfig"
  ]);
  if (parentObject !== void 0 && fromThinkingConfig != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "thinkingConfig"], fromThinkingConfig);
  }
  const fromEnableAffectiveDialog = getValueByPath(fromObject, [
    "enableAffectiveDialog"
  ]);
  if (parentObject !== void 0 && fromEnableAffectiveDialog != null) {
    setValueByPath(parentObject, ["setup", "generationConfig", "enableAffectiveDialog"], fromEnableAffectiveDialog);
  }
  const fromSystemInstruction = getValueByPath(fromObject, [
    "systemInstruction"
  ]);
  if (parentObject !== void 0 && fromSystemInstruction != null) {
    setValueByPath(parentObject, ["setup", "systemInstruction"], contentToMldev(tContent(fromSystemInstruction)));
  }
  const fromTools = getValueByPath(fromObject, ["tools"]);
  if (parentObject !== void 0 && fromTools != null) {
    let transformedList = tTools(fromTools);
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return toolToMldev(tTool(item));
      });
    }
    setValueByPath(parentObject, ["setup", "tools"], transformedList);
  }
  const fromSessionResumption = getValueByPath(fromObject, [
    "sessionResumption"
  ]);
  if (parentObject !== void 0 && fromSessionResumption != null) {
    setValueByPath(parentObject, ["setup", "sessionResumption"], sessionResumptionConfigToMldev(fromSessionResumption));
  }
  const fromInputAudioTranscription = getValueByPath(fromObject, [
    "inputAudioTranscription"
  ]);
  if (parentObject !== void 0 && fromInputAudioTranscription != null) {
    setValueByPath(parentObject, ["setup", "inputAudioTranscription"], fromInputAudioTranscription);
  }
  const fromOutputAudioTranscription = getValueByPath(fromObject, [
    "outputAudioTranscription"
  ]);
  if (parentObject !== void 0 && fromOutputAudioTranscription != null) {
    setValueByPath(parentObject, ["setup", "outputAudioTranscription"], fromOutputAudioTranscription);
  }
  const fromRealtimeInputConfig = getValueByPath(fromObject, [
    "realtimeInputConfig"
  ]);
  if (parentObject !== void 0 && fromRealtimeInputConfig != null) {
    setValueByPath(parentObject, ["setup", "realtimeInputConfig"], fromRealtimeInputConfig);
  }
  const fromContextWindowCompression = getValueByPath(fromObject, [
    "contextWindowCompression"
  ]);
  if (parentObject !== void 0 && fromContextWindowCompression != null) {
    setValueByPath(parentObject, ["setup", "contextWindowCompression"], fromContextWindowCompression);
  }
  const fromProactivity = getValueByPath(fromObject, ["proactivity"]);
  if (parentObject !== void 0 && fromProactivity != null) {
    setValueByPath(parentObject, ["setup", "proactivity"], fromProactivity);
  }
  if (getValueByPath(fromObject, ["explicitVadSignal"]) !== void 0) {
    throw new Error("explicitVadSignal parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(liveConnectConfigToMldev, "liveConnectConfigToMldev");
function liveConnectConstraintsToMldev(apiClient, fromObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["model"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["setup", "model"], tModel(apiClient, fromModel));
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    setValueByPath(toObject, ["config"], liveConnectConfigToMldev(fromConfig, toObject));
  }
  return toObject;
}
__name(liveConnectConstraintsToMldev, "liveConnectConstraintsToMldev");
function partToMldev(fromObject) {
  const toObject = {};
  const fromMediaResolution = getValueByPath(fromObject, [
    "mediaResolution"
  ]);
  if (fromMediaResolution != null) {
    setValueByPath(toObject, ["mediaResolution"], fromMediaResolution);
  }
  const fromCodeExecutionResult = getValueByPath(fromObject, [
    "codeExecutionResult"
  ]);
  if (fromCodeExecutionResult != null) {
    setValueByPath(toObject, ["codeExecutionResult"], fromCodeExecutionResult);
  }
  const fromExecutableCode = getValueByPath(fromObject, [
    "executableCode"
  ]);
  if (fromExecutableCode != null) {
    setValueByPath(toObject, ["executableCode"], fromExecutableCode);
  }
  const fromFileData = getValueByPath(fromObject, ["fileData"]);
  if (fromFileData != null) {
    setValueByPath(toObject, ["fileData"], fileDataToMldev(fromFileData));
  }
  const fromFunctionCall = getValueByPath(fromObject, ["functionCall"]);
  if (fromFunctionCall != null) {
    setValueByPath(toObject, ["functionCall"], functionCallToMldev(fromFunctionCall));
  }
  const fromFunctionResponse = getValueByPath(fromObject, [
    "functionResponse"
  ]);
  if (fromFunctionResponse != null) {
    setValueByPath(toObject, ["functionResponse"], fromFunctionResponse);
  }
  const fromInlineData = getValueByPath(fromObject, ["inlineData"]);
  if (fromInlineData != null) {
    setValueByPath(toObject, ["inlineData"], blobToMldev(fromInlineData));
  }
  const fromText = getValueByPath(fromObject, ["text"]);
  if (fromText != null) {
    setValueByPath(toObject, ["text"], fromText);
  }
  const fromThought = getValueByPath(fromObject, ["thought"]);
  if (fromThought != null) {
    setValueByPath(toObject, ["thought"], fromThought);
  }
  const fromThoughtSignature = getValueByPath(fromObject, [
    "thoughtSignature"
  ]);
  if (fromThoughtSignature != null) {
    setValueByPath(toObject, ["thoughtSignature"], fromThoughtSignature);
  }
  const fromVideoMetadata = getValueByPath(fromObject, [
    "videoMetadata"
  ]);
  if (fromVideoMetadata != null) {
    setValueByPath(toObject, ["videoMetadata"], fromVideoMetadata);
  }
  return toObject;
}
__name(partToMldev, "partToMldev");
function sessionResumptionConfigToMldev(fromObject) {
  const toObject = {};
  const fromHandle = getValueByPath(fromObject, ["handle"]);
  if (fromHandle != null) {
    setValueByPath(toObject, ["handle"], fromHandle);
  }
  if (getValueByPath(fromObject, ["transparent"]) !== void 0) {
    throw new Error("transparent parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(sessionResumptionConfigToMldev, "sessionResumptionConfigToMldev");
function toolToMldev(fromObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["retrieval"]) !== void 0) {
    throw new Error("retrieval parameter is not supported in Gemini API.");
  }
  const fromComputerUse = getValueByPath(fromObject, ["computerUse"]);
  if (fromComputerUse != null) {
    setValueByPath(toObject, ["computerUse"], fromComputerUse);
  }
  const fromFileSearch = getValueByPath(fromObject, ["fileSearch"]);
  if (fromFileSearch != null) {
    setValueByPath(toObject, ["fileSearch"], fromFileSearch);
  }
  const fromCodeExecution = getValueByPath(fromObject, [
    "codeExecution"
  ]);
  if (fromCodeExecution != null) {
    setValueByPath(toObject, ["codeExecution"], fromCodeExecution);
  }
  if (getValueByPath(fromObject, ["enterpriseWebSearch"]) !== void 0) {
    throw new Error("enterpriseWebSearch parameter is not supported in Gemini API.");
  }
  const fromFunctionDeclarations = getValueByPath(fromObject, [
    "functionDeclarations"
  ]);
  if (fromFunctionDeclarations != null) {
    let transformedList = fromFunctionDeclarations;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["functionDeclarations"], transformedList);
  }
  const fromGoogleMaps = getValueByPath(fromObject, ["googleMaps"]);
  if (fromGoogleMaps != null) {
    setValueByPath(toObject, ["googleMaps"], googleMapsToMldev(fromGoogleMaps));
  }
  const fromGoogleSearch = getValueByPath(fromObject, ["googleSearch"]);
  if (fromGoogleSearch != null) {
    setValueByPath(toObject, ["googleSearch"], googleSearchToMldev(fromGoogleSearch));
  }
  const fromGoogleSearchRetrieval = getValueByPath(fromObject, [
    "googleSearchRetrieval"
  ]);
  if (fromGoogleSearchRetrieval != null) {
    setValueByPath(toObject, ["googleSearchRetrieval"], fromGoogleSearchRetrieval);
  }
  const fromUrlContext = getValueByPath(fromObject, ["urlContext"]);
  if (fromUrlContext != null) {
    setValueByPath(toObject, ["urlContext"], fromUrlContext);
  }
  return toObject;
}
__name(toolToMldev, "toolToMldev");
function getFieldMasks(setup) {
  const fields = [];
  for (const key in setup) {
    if (Object.prototype.hasOwnProperty.call(setup, key)) {
      const value = setup[key];
      if (typeof value === "object" && value != null && Object.keys(value).length > 0) {
        const field = Object.keys(value).map((kk) => `${key}.${kk}`);
        fields.push(...field);
      } else {
        fields.push(key);
      }
    }
  }
  return fields.join(",");
}
__name(getFieldMasks, "getFieldMasks");
function convertBidiSetupToTokenSetup(requestDict, config2) {
  let setupForMaskGeneration = null;
  const bidiGenerateContentSetupValue = requestDict["bidiGenerateContentSetup"];
  if (typeof bidiGenerateContentSetupValue === "object" && bidiGenerateContentSetupValue !== null && "setup" in bidiGenerateContentSetupValue) {
    const innerSetup = bidiGenerateContentSetupValue.setup;
    if (typeof innerSetup === "object" && innerSetup !== null) {
      requestDict["bidiGenerateContentSetup"] = innerSetup;
      setupForMaskGeneration = innerSetup;
    } else {
      delete requestDict["bidiGenerateContentSetup"];
    }
  } else if (bidiGenerateContentSetupValue !== void 0) {
    delete requestDict["bidiGenerateContentSetup"];
  }
  const preExistingFieldMask = requestDict["fieldMask"];
  if (setupForMaskGeneration) {
    const generatedMaskFromBidi = getFieldMasks(setupForMaskGeneration);
    if (Array.isArray(config2 === null || config2 === void 0 ? void 0 : config2.lockAdditionalFields) && (config2 === null || config2 === void 0 ? void 0 : config2.lockAdditionalFields.length) === 0) {
      if (generatedMaskFromBidi) {
        requestDict["fieldMask"] = generatedMaskFromBidi;
      } else {
        delete requestDict["fieldMask"];
      }
    } else if ((config2 === null || config2 === void 0 ? void 0 : config2.lockAdditionalFields) && config2.lockAdditionalFields.length > 0 && preExistingFieldMask !== null && Array.isArray(preExistingFieldMask) && preExistingFieldMask.length > 0) {
      const generationConfigFields = [
        "temperature",
        "topK",
        "topP",
        "maxOutputTokens",
        "responseModalities",
        "seed",
        "speechConfig"
      ];
      let mappedFieldsFromPreExisting = [];
      if (preExistingFieldMask.length > 0) {
        mappedFieldsFromPreExisting = preExistingFieldMask.map((field) => {
          if (generationConfigFields.includes(field)) {
            return `generationConfig.${field}`;
          }
          return field;
        });
      }
      const finalMaskParts = [];
      if (generatedMaskFromBidi) {
        finalMaskParts.push(generatedMaskFromBidi);
      }
      if (mappedFieldsFromPreExisting.length > 0) {
        finalMaskParts.push(...mappedFieldsFromPreExisting);
      }
      if (finalMaskParts.length > 0) {
        requestDict["fieldMask"] = finalMaskParts.join(",");
      } else {
        delete requestDict["fieldMask"];
      }
    } else {
      delete requestDict["fieldMask"];
    }
  } else {
    if (preExistingFieldMask !== null && Array.isArray(preExistingFieldMask) && preExistingFieldMask.length > 0) {
      requestDict["fieldMask"] = preExistingFieldMask.join(",");
    } else {
      delete requestDict["fieldMask"];
    }
  }
  return requestDict;
}
__name(convertBidiSetupToTokenSetup, "convertBidiSetupToTokenSetup");
var Tokens = class extends BaseModule {
  static {
    __name(this, "Tokens");
  }
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
  }
  /**
   * Creates an ephemeral auth token resource.
   *
   * @experimental
   *
   * @remarks
   * Ephemeral auth tokens is only supported in the Gemini Developer API.
   * It can be used for the session connection to the Live constrained API.
   * Support in v1alpha only.
   *
   * @param params - The parameters for the create request.
   * @return The created auth token.
   *
   * @example
   * ```ts
   * const ai = new GoogleGenAI({
   *     apiKey: token.name,
   *     httpOptions: { apiVersion: 'v1alpha' }  // Support in v1alpha only.
   * });
   *
   * // Case 1: If LiveEphemeralParameters is unset, unlock LiveConnectConfig
   * // when using the token in Live API sessions. Each session connection can
   * // use a different configuration.
   * const config: CreateAuthTokenConfig = {
   *     uses: 3,
   *     expireTime: '2025-05-01T00:00:00Z',
   * }
   * const token = await ai.tokens.create(config);
   *
   * // Case 2: If LiveEphemeralParameters is set, lock all fields in
   * // LiveConnectConfig when using the token in Live API sessions. For
   * // example, changing `outputAudioTranscription` in the Live API
   * // connection will be ignored by the API.
   * const config: CreateAuthTokenConfig =
   *     uses: 3,
   *     expireTime: '2025-05-01T00:00:00Z',
   *     LiveEphemeralParameters: {
   *        model: 'gemini-2.0-flash-001',
   *        config: {
   *           'responseModalities': ['AUDIO'],
   *           'systemInstruction': 'Always answer in English.',
   *        }
   *     }
   * }
   * const token = await ai.tokens.create(config);
   *
   * // Case 3: If LiveEphemeralParameters is set and lockAdditionalFields is
   * // set, lock LiveConnectConfig with set and additional fields (e.g.
   * // responseModalities, systemInstruction, temperature in this example) when
   * // using the token in Live API sessions.
   * const config: CreateAuthTokenConfig =
   *     uses: 3,
   *     expireTime: '2025-05-01T00:00:00Z',
   *     LiveEphemeralParameters: {
   *        model: 'gemini-2.0-flash-001',
   *        config: {
   *           'responseModalities': ['AUDIO'],
   *           'systemInstruction': 'Always answer in English.',
   *        }
   *     },
   *     lockAdditionalFields: ['temperature'],
   * }
   * const token = await ai.tokens.create(config);
   *
   * // Case 4: If LiveEphemeralParameters is set and lockAdditionalFields is
   * // empty array, lock LiveConnectConfig with set fields (e.g.
   * // responseModalities, systemInstruction in this example) when using the
   * // token in Live API sessions.
   * const config: CreateAuthTokenConfig =
   *     uses: 3,
   *     expireTime: '2025-05-01T00:00:00Z',
   *     LiveEphemeralParameters: {
   *        model: 'gemini-2.0-flash-001',
   *        config: {
   *           'responseModalities': ['AUDIO'],
   *           'systemInstruction': 'Always answer in English.',
   *        }
   *     },
   *     lockAdditionalFields: [],
   * }
   * const token = await ai.tokens.create(config);
   * ```
   */
  async create(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("The client.tokens.create method is only supported by the Gemini Developer API.");
    } else {
      const body = createAuthTokenParametersToMldev(this.apiClient, params);
      path2 = formatMap("auth_tokens", body["_url"]);
      queryParams = body["_query"];
      delete body["config"];
      delete body["_url"];
      delete body["_query"];
      const transformedBody = convertBidiSetupToTokenSetup(body, params.config);
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(transformedBody),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((resp) => {
        return resp;
      });
    }
  }
};
function deleteDocumentConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromForce = getValueByPath(fromObject, ["force"]);
  if (parentObject !== void 0 && fromForce != null) {
    setValueByPath(parentObject, ["_query", "force"], fromForce);
  }
  return toObject;
}
__name(deleteDocumentConfigToMldev, "deleteDocumentConfigToMldev");
function deleteDocumentParametersToMldev(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], fromName);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    deleteDocumentConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(deleteDocumentParametersToMldev, "deleteDocumentParametersToMldev");
function getDocumentParametersToMldev(fromObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], fromName);
  }
  return toObject;
}
__name(getDocumentParametersToMldev, "getDocumentParametersToMldev");
function listDocumentsConfigToMldev(fromObject, parentObject) {
  const toObject = {};
  const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
  if (parentObject !== void 0 && fromPageSize != null) {
    setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
  }
  const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
  if (parentObject !== void 0 && fromPageToken != null) {
    setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
  }
  return toObject;
}
__name(listDocumentsConfigToMldev, "listDocumentsConfigToMldev");
function listDocumentsParametersToMldev(fromObject) {
  const toObject = {};
  const fromParent = getValueByPath(fromObject, ["parent"]);
  if (fromParent != null) {
    setValueByPath(toObject, ["_url", "parent"], fromParent);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    listDocumentsConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(listDocumentsParametersToMldev, "listDocumentsParametersToMldev");
function listDocumentsResponseFromMldev(fromObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromNextPageToken = getValueByPath(fromObject, [
    "nextPageToken"
  ]);
  if (fromNextPageToken != null) {
    setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
  }
  const fromDocuments = getValueByPath(fromObject, ["documents"]);
  if (fromDocuments != null) {
    let transformedList = fromDocuments;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["documents"], transformedList);
  }
  return toObject;
}
__name(listDocumentsResponseFromMldev, "listDocumentsResponseFromMldev");
var Documents = class extends BaseModule {
  static {
    __name(this, "Documents");
  }
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
    this.list = async (params) => {
      return new Pager(PagedItem.PAGED_ITEM_DOCUMENTS, (x) => this.listInternal({ parent: params.parent, config: x.config }), await this.listInternal(params), params);
    };
  }
  /**
   * Gets a Document.
   *
   * @param params - The parameters for getting a document.
   * @return Document.
   */
  async get(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = getDocumentParametersToMldev(params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((resp) => {
        return resp;
      });
    }
  }
  /**
   * Deletes a Document.
   *
   * @param params - The parameters for deleting a document.
   */
  async delete(params) {
    var _a2, _b;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = deleteDocumentParametersToMldev(params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      await this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "DELETE",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      });
    }
  }
  async listInternal(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = listDocumentsParametersToMldev(params);
      path2 = formatMap("{parent}/documents", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = listDocumentsResponseFromMldev(apiResponse);
        const typedResp = new ListDocumentsResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
};
var FileSearchStores = class extends BaseModule {
  static {
    __name(this, "FileSearchStores");
  }
  constructor(apiClient, documents = new Documents(apiClient)) {
    super();
    this.apiClient = apiClient;
    this.documents = documents;
    this.list = async (params = {}) => {
      return new Pager(PagedItem.PAGED_ITEM_FILE_SEARCH_STORES, (x) => this.listInternal(x), await this.listInternal(params), params);
    };
  }
  /**
   * Uploads a file asynchronously to a given File Search Store.
   * This method is not available in Vertex AI.
   * Supported upload sources:
   * - Node.js: File path (string) or Blob object.
   * - Browser: Blob object (e.g., File).
   *
   * @remarks
   * The `mimeType` can be specified in the `config` parameter. If omitted:
   *  - For file path (string) inputs, the `mimeType` will be inferred from the
   *     file extension.
   *  - For Blob object inputs, the `mimeType` will be set to the Blob's `type`
   *     property.
   *
   * This section can contain multiple paragraphs and code examples.
   *
   * @param params - Optional parameters specified in the
   *        `types.UploadToFileSearchStoreParameters` interface.
   *         @see {@link types.UploadToFileSearchStoreParameters#config} for the optional
   *         config in the parameters.
   * @return A promise that resolves to a long running operation.
   * @throws An error if called on a Vertex AI client.
   * @throws An error if the `mimeType` is not provided and can not be inferred,
   * the `mimeType` can be provided in the `params.config` parameter.
   * @throws An error occurs if a suitable upload location cannot be established.
   *
   * @example
   * The following code uploads a file to a given file search store.
   *
   * ```ts
   * const operation = await ai.fileSearchStores.upload({fileSearchStoreName: 'fileSearchStores/foo-bar', file: 'file.txt', config: {
   *   mimeType: 'text/plain',
   * }});
   * console.log(operation.name);
   * ```
   */
  async uploadToFileSearchStore(params) {
    if (this.apiClient.isVertexAI()) {
      throw new Error("Vertex AI does not support uploading files to a file search store.");
    }
    return this.apiClient.uploadFileToFileSearchStore(params.fileSearchStoreName, params.file, params.config);
  }
  /**
   * Creates a File Search Store.
   *
   * @param params - The parameters for creating a File Search Store.
   * @return FileSearchStore.
   */
  async create(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = createFileSearchStoreParametersToMldev(params);
      path2 = formatMap("fileSearchStores", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((resp) => {
        return resp;
      });
    }
  }
  /**
   * Gets a File Search Store.
   *
   * @param params - The parameters for getting a File Search Store.
   * @return FileSearchStore.
   */
  async get(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = getFileSearchStoreParametersToMldev(params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((resp) => {
        return resp;
      });
    }
  }
  /**
   * Deletes a File Search Store.
   *
   * @param params - The parameters for deleting a File Search Store.
   */
  async delete(params) {
    var _a2, _b;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = deleteFileSearchStoreParametersToMldev(params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      await this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "DELETE",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      });
    }
  }
  async listInternal(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = listFileSearchStoresParametersToMldev(params);
      path2 = formatMap("fileSearchStores", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = listFileSearchStoresResponseFromMldev(apiResponse);
        const typedResp = new ListFileSearchStoresResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  async uploadToFileSearchStoreInternal(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = uploadToFileSearchStoreParametersToMldev(params);
      path2 = formatMap("upload/v1beta/{file_search_store_name}:uploadToFileSearchStore", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = uploadToFileSearchStoreResumableResponseFromMldev(apiResponse);
        const typedResp = new UploadToFileSearchStoreResumableResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  /**
   * Imports a File from File Service to a FileSearchStore.
   *
   * This is a long-running operation, see aip.dev/151
   *
   * @param params - The parameters for importing a file to a file search store.
   * @return ImportFileOperation.
   */
  async importFile(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = importFileParametersToMldev(params);
      path2 = formatMap("{file_search_store_name}:importFile", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json();
      });
      return response.then((apiResponse) => {
        const resp = importFileOperationFromMldev(apiResponse);
        const typedResp = new ImportFileOperation();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
};
var uuid4Internal = /* @__PURE__ */ __name(function() {
  const { crypto: crypto2 } = globalThis;
  if (crypto2 === null || crypto2 === void 0 ? void 0 : crypto2.randomUUID) {
    uuid4Internal = crypto2.randomUUID.bind(crypto2);
    return crypto2.randomUUID();
  }
  const u8 = new Uint8Array(1);
  const randomByte = crypto2 ? () => crypto2.getRandomValues(u8)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ randomByte() & 15 >> +c / 4).toString(16));
}, "uuid4Internal");
var uuid4 = /* @__PURE__ */ __name(() => uuid4Internal(), "uuid4");
function isAbortError(err) {
  return typeof err === "object" && err !== null && // Spec-compliant fetch implementations
  ("name" in err && err.name === "AbortError" || // Expo fetch
  "message" in err && String(err.message).includes("FetchRequestCanceledException"));
}
__name(isAbortError, "isAbortError");
var castToError = /* @__PURE__ */ __name((err) => {
  if (err instanceof Error)
    return err;
  if (typeof err === "object" && err !== null) {
    try {
      if (Object.prototype.toString.call(err) === "[object Error]") {
        const error3 = new Error(err.message, err.cause ? { cause: err.cause } : {});
        if (err.stack)
          error3.stack = err.stack;
        if (err.cause && !error3.cause)
          error3.cause = err.cause;
        if (err.name)
          error3.name = err.name;
        return error3;
      }
    } catch (_a2) {
    }
    try {
      return new Error(JSON.stringify(err));
    } catch (_b) {
    }
  }
  return new Error(err);
}, "castToError");
var GeminiNextGenAPIClientError = class extends Error {
  static {
    __name(this, "GeminiNextGenAPIClientError");
  }
};
var APIError = class _APIError extends GeminiNextGenAPIClientError {
  static {
    __name(this, "APIError");
  }
  constructor(status, error3, message, headers) {
    super(`${_APIError.makeMessage(status, error3, message)}`);
    this.status = status;
    this.headers = headers;
    this.error = error3;
  }
  static makeMessage(status, error3, message) {
    const msg = (error3 === null || error3 === void 0 ? void 0 : error3.message) ? typeof error3.message === "string" ? error3.message : JSON.stringify(error3.message) : error3 ? JSON.stringify(error3) : message;
    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return "(no status code or body)";
  }
  static generate(status, errorResponse, message, headers) {
    if (!status || !headers) {
      return new APIConnectionError({ message, cause: castToError(errorResponse) });
    }
    const error3 = errorResponse;
    if (status === 400) {
      return new BadRequestError(status, error3, message, headers);
    }
    if (status === 401) {
      return new AuthenticationError(status, error3, message, headers);
    }
    if (status === 403) {
      return new PermissionDeniedError(status, error3, message, headers);
    }
    if (status === 404) {
      return new NotFoundError(status, error3, message, headers);
    }
    if (status === 409) {
      return new ConflictError(status, error3, message, headers);
    }
    if (status === 422) {
      return new UnprocessableEntityError(status, error3, message, headers);
    }
    if (status === 429) {
      return new RateLimitError(status, error3, message, headers);
    }
    if (status >= 500) {
      return new InternalServerError(status, error3, message, headers);
    }
    return new _APIError(status, error3, message, headers);
  }
};
var APIUserAbortError = class extends APIError {
  static {
    __name(this, "APIUserAbortError");
  }
  constructor({ message } = {}) {
    super(void 0, void 0, message || "Request was aborted.", void 0);
  }
};
var APIConnectionError = class extends APIError {
  static {
    __name(this, "APIConnectionError");
  }
  constructor({ message, cause }) {
    super(void 0, void 0, message || "Connection error.", void 0);
    if (cause)
      this.cause = cause;
  }
};
var APIConnectionTimeoutError = class extends APIConnectionError {
  static {
    __name(this, "APIConnectionTimeoutError");
  }
  constructor({ message } = {}) {
    super({ message: message !== null && message !== void 0 ? message : "Request timed out." });
  }
};
var BadRequestError = class extends APIError {
  static {
    __name(this, "BadRequestError");
  }
};
var AuthenticationError = class extends APIError {
  static {
    __name(this, "AuthenticationError");
  }
};
var PermissionDeniedError = class extends APIError {
  static {
    __name(this, "PermissionDeniedError");
  }
};
var NotFoundError = class extends APIError {
  static {
    __name(this, "NotFoundError");
  }
};
var ConflictError = class extends APIError {
  static {
    __name(this, "ConflictError");
  }
};
var UnprocessableEntityError = class extends APIError {
  static {
    __name(this, "UnprocessableEntityError");
  }
};
var RateLimitError = class extends APIError {
  static {
    __name(this, "RateLimitError");
  }
};
var InternalServerError = class extends APIError {
  static {
    __name(this, "InternalServerError");
  }
};
var startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
var isAbsoluteURL = /* @__PURE__ */ __name((url) => {
  return startsWithSchemeRegexp.test(url);
}, "isAbsoluteURL");
var isArrayInternal = /* @__PURE__ */ __name((val) => (isArrayInternal = Array.isArray, isArrayInternal(val)), "isArrayInternal");
var isArray = isArrayInternal;
var isReadonlyArrayInternal = isArray;
var isReadonlyArray = isReadonlyArrayInternal;
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
__name(isEmptyObj, "isEmptyObj");
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
__name(hasOwn, "hasOwn");
var validatePositiveInteger = /* @__PURE__ */ __name((name, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new GeminiNextGenAPIClientError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new GeminiNextGenAPIClientError(`${name} must be a positive integer`);
  }
  return n;
}, "validatePositiveInteger");
var safeJSON = /* @__PURE__ */ __name((text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return void 0;
  }
}, "safeJSON");
var sleep$1 = /* @__PURE__ */ __name((ms) => new Promise((resolve) => setTimeout(resolve, ms)), "sleep$1");
var VERSION = "0.0.1";
function getDetectedPlatform() {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return "deno";
  }
  if (typeof EdgeRuntime !== "undefined") {
    return "edge";
  }
  if (Object.prototype.toString.call(typeof globalThis.process !== "undefined" ? globalThis.process : 0) === "[object process]") {
    return "node";
  }
  return "unknown";
}
__name(getDetectedPlatform, "getDetectedPlatform");
var getPlatformProperties = /* @__PURE__ */ __name(() => {
  var _a2, _b, _c, _d, _e;
  const detectedPlatform = getDetectedPlatform();
  if (detectedPlatform === "deno") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(Deno.build.os),
      "X-Stainless-Arch": normalizeArch(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : (_b = (_a2 = Deno.version) === null || _a2 === void 0 ? void 0 : _a2.deno) !== null && _b !== void 0 ? _b : "unknown"
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": globalThis.process.version
    };
  }
  if (detectedPlatform === "node") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform((_c = globalThis.process.platform) !== null && _c !== void 0 ? _c : "unknown"),
      "X-Stainless-Arch": normalizeArch((_d = globalThis.process.arch) !== null && _d !== void 0 ? _d : "unknown"),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": (_e = globalThis.process.version) !== null && _e !== void 0 ? _e : "unknown"
    };
  }
  const browserInfo = getBrowserInfo();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
}, "getPlatformProperties");
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match = pattern.exec("Cloudflare-Workers");
    if (match) {
      const major = match[1] || 0;
      const minor = match[2] || 0;
      const patch = match[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
__name(getBrowserInfo, "getBrowserInfo");
var normalizeArch = /* @__PURE__ */ __name((arch2) => {
  if (arch2 === "x32")
    return "x32";
  if (arch2 === "x86_64" || arch2 === "x64")
    return "x64";
  if (arch2 === "arm")
    return "arm";
  if (arch2 === "aarch64" || arch2 === "arm64")
    return "arm64";
  if (arch2)
    return `other:${arch2}`;
  return "unknown";
}, "normalizeArch");
var normalizePlatform = /* @__PURE__ */ __name((platform2) => {
  platform2 = platform2.toLowerCase();
  if (platform2.includes("ios"))
    return "iOS";
  if (platform2 === "android")
    return "Android";
  if (platform2 === "darwin")
    return "MacOS";
  if (platform2 === "win32")
    return "Windows";
  if (platform2 === "freebsd")
    return "FreeBSD";
  if (platform2 === "openbsd")
    return "OpenBSD";
  if (platform2 === "linux")
    return "Linux";
  if (platform2)
    return `Other:${platform2}`;
  return "Unknown";
}, "normalizePlatform");
var _platformHeaders;
var getPlatformHeaders = /* @__PURE__ */ __name(() => {
  return _platformHeaders !== null && _platformHeaders !== void 0 ? _platformHeaders : _platformHeaders = getPlatformProperties();
}, "getPlatformHeaders");
function getDefaultFetch() {
  if (typeof fetch !== "undefined") {
    return fetch;
  }
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new GeminiNextGenAPIClient({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
__name(getDefaultFetch, "getDefaultFetch");
function makeReadableStream(...args) {
  const ReadableStream = globalThis.ReadableStream;
  if (typeof ReadableStream === "undefined") {
    throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  }
  return new ReadableStream(...args);
}
__name(makeReadableStream, "makeReadableStream");
function ReadableStreamFrom(iterable) {
  let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
  return makeReadableStream({
    start() {
    },
    async pull(controller) {
      const { done, value } = await iter.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    async cancel() {
      var _a2;
      await ((_a2 = iter.return) === null || _a2 === void 0 ? void 0 : _a2.call(iter));
    }
  });
}
__name(ReadableStreamFrom, "ReadableStreamFrom");
function ReadableStreamToAsyncIterable(stream) {
  if (stream[Symbol.asyncIterator])
    return stream;
  const reader = stream.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result === null || result === void 0 ? void 0 : result.done)
          reader.releaseLock();
        return result;
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
__name(ReadableStreamToAsyncIterable, "ReadableStreamToAsyncIterable");
async function CancelReadableStream(stream) {
  var _a2, _b;
  if (stream === null || typeof stream !== "object")
    return;
  if (stream[Symbol.asyncIterator]) {
    await ((_b = (_a2 = stream[Symbol.asyncIterator]()).return) === null || _b === void 0 ? void 0 : _b.call(_a2));
    return;
  }
  const reader = stream.getReader();
  const cancelPromise = reader.cancel();
  reader.releaseLock();
  await cancelPromise;
}
__name(CancelReadableStream, "CancelReadableStream");
var FallbackEncoder = /* @__PURE__ */ __name(({ headers, body }) => {
  return {
    bodyHeaders: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  };
}, "FallbackEncoder");
var checkFileSupport = /* @__PURE__ */ __name(() => {
  var _a2;
  if (typeof File === "undefined") {
    const { process } = globalThis;
    const isOldNode = typeof ((_a2 = process === null || process === void 0 ? void 0 : process.versions) === null || _a2 === void 0 ? void 0 : _a2.node) === "string" && parseInt(process.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (isOldNode ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
}, "checkFileSupport");
function makeFile(fileBits, fileName, options) {
  checkFileSupport();
  return new File(fileBits, fileName !== null && fileName !== void 0 ? fileName : "unknown_file", options);
}
__name(makeFile, "makeFile");
function getName(value) {
  return (typeof value === "object" && value !== null && ("name" in value && value.name && String(value.name) || "url" in value && value.url && String(value.url) || "filename" in value && value.filename && String(value.filename) || "path" in value && value.path && String(value.path)) || "").split(/[\\/]/).pop() || void 0;
}
__name(getName, "getName");
var isAsyncIterable = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function", "isAsyncIterable");
var isBlobLike = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function", "isBlobLike");
var isFileLike = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value), "isFileLike");
var isResponseLike = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function", "isResponseLike");
async function toFile(value, name, options) {
  checkFileSupport();
  value = await value;
  if (isFileLike(value)) {
    if (value instanceof File) {
      return value;
    }
    return makeFile([await value.arrayBuffer()], value.name);
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop());
    return makeFile(await getBytes(blob), name, options);
  }
  const parts = await getBytes(value);
  name || (name = getName(value));
  if (!(options === null || options === void 0 ? void 0 : options.type)) {
    const type = parts.find((part) => typeof part === "object" && "type" in part && part.type);
    if (typeof type === "string") {
      options = Object.assign(Object.assign({}, options), { type });
    }
  }
  return makeFile(parts, name, options);
}
__name(toFile, "toFile");
async function getBytes(value) {
  var _a2, e_1, _b, _c;
  var _d;
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
  value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(value instanceof Blob ? value : await value.arrayBuffer());
  } else if (isAsyncIterable(value)) {
    try {
      for (var _e = true, value_1 = __asyncValues(value), value_1_1; value_1_1 = await value_1.next(), _a2 = value_1_1.done, !_a2; _e = true) {
        _c = value_1_1.value;
        _e = false;
        const chunk = _c;
        parts.push(...await getBytes(chunk));
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (!_e && !_a2 && (_b = value_1.return)) await _b.call(value_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  } else {
    const constructor = (_d = value === null || value === void 0 ? void 0 : value.constructor) === null || _d === void 0 ? void 0 : _d.name;
    throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ""}${propsForError(value)}`);
  }
  return parts;
}
__name(getBytes, "getBytes");
function propsForError(value) {
  if (typeof value !== "object" || value === null)
    return "";
  const props = Object.getOwnPropertyNames(value);
  return `; props: [${props.map((p) => `"${p}"`).join(", ")}]`;
}
__name(propsForError, "propsForError");
var APIResource = class {
  static {
    __name(this, "APIResource");
  }
  constructor(client) {
    this._client = client;
  }
};
APIResource._key = [];
function encodeURIPath(str) {
  return str.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
__name(encodeURIPath, "encodeURIPath");
var EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
var createPathTagFunction = /* @__PURE__ */ __name((pathEncoder = encodeURIPath) => /* @__PURE__ */ __name((function path2(statics, ...params) {
  if (statics.length === 1)
    return statics[0];
  let postPath = false;
  const invalidSegments = [];
  const path3 = statics.reduce((previousValue, currentValue, index) => {
    var _a2, _b, _c;
    if (/[?#]/.test(currentValue)) {
      postPath = true;
    }
    const value = params[index];
    let encoded = (postPath ? encodeURIComponent : pathEncoder)("" + value);
    if (index !== params.length && (value == null || typeof value === "object" && // handle values from other realms
    value.toString === ((_c = Object.getPrototypeOf((_b = Object.getPrototypeOf((_a2 = value.hasOwnProperty) !== null && _a2 !== void 0 ? _a2 : EMPTY)) !== null && _b !== void 0 ? _b : EMPTY)) === null || _c === void 0 ? void 0 : _c.toString))) {
      encoded = value + "";
      invalidSegments.push({
        start: previousValue.length + currentValue.length,
        length: encoded.length,
        error: `Value of type ${Object.prototype.toString.call(value).slice(8, -1)} is not a valid path parameter`
      });
    }
    return previousValue + currentValue + (index === params.length ? "" : encoded);
  }, "");
  const pathOnly = path3.split(/[?#]/, 1)[0];
  const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let match;
  while ((match = invalidSegmentPattern.exec(pathOnly)) !== null) {
    invalidSegments.push({
      start: match.index,
      length: match[0].length,
      error: `Value "${match[0]}" can't be safely passed as a path parameter`
    });
  }
  invalidSegments.sort((a, b) => a.start - b.start);
  if (invalidSegments.length > 0) {
    let lastEnd = 0;
    const underline = invalidSegments.reduce((acc, segment) => {
      const spaces = " ".repeat(segment.start - lastEnd);
      const arrows = "^".repeat(segment.length);
      lastEnd = segment.start + segment.length;
      return acc + spaces + arrows;
    }, "");
    throw new GeminiNextGenAPIClientError(`Path parameters result in path with invalid segments:
${invalidSegments.map((e) => e.error).join("\n")}
${path3}
${underline}`);
  }
  return path3;
}), "path"), "createPathTagFunction");
var path = /* @__PURE__ */ createPathTagFunction(encodeURIPath);
var BaseInteractions = class extends APIResource {
  static {
    __name(this, "BaseInteractions");
  }
  create(params, options) {
    var _a2;
    const { api_version = this._client.apiVersion } = params, body = __rest(params, ["api_version"]);
    if ("model" in body && "agent_config" in body) {
      throw new GeminiNextGenAPIClientError(`Invalid request: specified \`model\` and \`agent_config\`. If specifying \`model\`, use \`generation_config\`.`);
    }
    if ("agent" in body && "generation_config" in body) {
      throw new GeminiNextGenAPIClientError(`Invalid request: specified \`agent\` and \`generation_config\`. If specifying \`agent\`, use \`agent_config\`.`);
    }
    return this._client.post(path`/${api_version}/interactions`, Object.assign(Object.assign({ body }, options), { stream: (_a2 = params.stream) !== null && _a2 !== void 0 ? _a2 : false }));
  }
  /**
   * Deletes the interaction by id.
   *
   * @example
   * ```ts
   * const interaction = await client.interactions.delete('id', {
   *   api_version: 'api_version',
   * });
   * ```
   */
  delete(id, params = {}, options) {
    const { api_version = this._client.apiVersion } = params !== null && params !== void 0 ? params : {};
    return this._client.delete(path`/${api_version}/interactions/${id}`, options);
  }
  /**
   * Cancels an interaction by id. This only applies to background interactions that are still running.
   *
   * @example
   * ```ts
   * const interaction = await client.interactions.cancel('id', {
   *   api_version: 'api_version',
   * });
   * ```
   */
  cancel(id, params = {}, options) {
    const { api_version = this._client.apiVersion } = params !== null && params !== void 0 ? params : {};
    return this._client.post(path`/${api_version}/interactions/${id}/cancel`, options);
  }
  get(id, params = {}, options) {
    var _a2;
    const _b = params !== null && params !== void 0 ? params : {}, { api_version = this._client.apiVersion } = _b, query = __rest(_b, ["api_version"]);
    return this._client.get(path`/${api_version}/interactions/${id}`, Object.assign(Object.assign({ query }, options), { stream: (_a2 = params === null || params === void 0 ? void 0 : params.stream) !== null && _a2 !== void 0 ? _a2 : false }));
  }
};
BaseInteractions._key = Object.freeze(["interactions"]);
var Interactions = class extends BaseInteractions {
  static {
    __name(this, "Interactions");
  }
};
function concatBytes(buffers) {
  let length = 0;
  for (const buffer of buffers) {
    length += buffer.length;
  }
  const output = new Uint8Array(length);
  let index = 0;
  for (const buffer of buffers) {
    output.set(buffer, index);
    index += buffer.length;
  }
  return output;
}
__name(concatBytes, "concatBytes");
var encodeUTF8_;
function encodeUTF8(str) {
  let encoder;
  return (encodeUTF8_ !== null && encodeUTF8_ !== void 0 ? encodeUTF8_ : (encoder = new globalThis.TextEncoder(), encodeUTF8_ = encoder.encode.bind(encoder)))(str);
}
__name(encodeUTF8, "encodeUTF8");
var decodeUTF8_;
function decodeUTF8(bytes) {
  let decoder;
  return (decodeUTF8_ !== null && decodeUTF8_ !== void 0 ? decodeUTF8_ : (decoder = new globalThis.TextDecoder(), decodeUTF8_ = decoder.decode.bind(decoder)))(bytes);
}
__name(decodeUTF8, "decodeUTF8");
var LineDecoder = class {
  static {
    __name(this, "LineDecoder");
  }
  constructor() {
    this.buffer = new Uint8Array();
    this.carriageReturnIndex = null;
  }
  decode(chunk) {
    if (chunk == null) {
      return [];
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
    this.buffer = concatBytes([this.buffer, binaryChunk]);
    const lines = [];
    let patternIndex;
    while ((patternIndex = findNewlineIndex(this.buffer, this.carriageReturnIndex)) != null) {
      if (patternIndex.carriage && this.carriageReturnIndex == null) {
        this.carriageReturnIndex = patternIndex.index;
        continue;
      }
      if (this.carriageReturnIndex != null && (patternIndex.index !== this.carriageReturnIndex + 1 || patternIndex.carriage)) {
        lines.push(decodeUTF8(this.buffer.subarray(0, this.carriageReturnIndex - 1)));
        this.buffer = this.buffer.subarray(this.carriageReturnIndex);
        this.carriageReturnIndex = null;
        continue;
      }
      const endIndex = this.carriageReturnIndex !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
      const line = decodeUTF8(this.buffer.subarray(0, endIndex));
      lines.push(line);
      this.buffer = this.buffer.subarray(patternIndex.index);
      this.carriageReturnIndex = null;
    }
    return lines;
  }
  flush() {
    if (!this.buffer.length) {
      return [];
    }
    return this.decode("\n");
  }
};
LineDecoder.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function findNewlineIndex(buffer, startIndex) {
  const newline = 10;
  const carriage = 13;
  for (let i = startIndex !== null && startIndex !== void 0 ? startIndex : 0; i < buffer.length; i++) {
    if (buffer[i] === newline) {
      return { preceding: i, index: i + 1, carriage: false };
    }
    if (buffer[i] === carriage) {
      return { preceding: i, index: i + 1, carriage: true };
    }
  }
  return null;
}
__name(findNewlineIndex, "findNewlineIndex");
function findDoubleNewlineIndex(buffer) {
  const newline = 10;
  const carriage = 13;
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
      return i + 4;
    }
  }
  return -1;
}
__name(findDoubleNewlineIndex, "findDoubleNewlineIndex");
var levelNumbers = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
};
var parseLogLevel = /* @__PURE__ */ __name((maybeLevel, sourceName, client) => {
  if (!maybeLevel) {
    return void 0;
  }
  if (hasOwn(levelNumbers, maybeLevel)) {
    return maybeLevel;
  }
  loggerFor(client).warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
  return void 0;
}, "parseLogLevel");
function noop() {
}
__name(noop, "noop");
function makeLogFn(fnLevel, logger, logLevel) {
  if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) {
    return noop;
  } else {
    return logger[fnLevel].bind(logger);
  }
}
__name(makeLogFn, "makeLogFn");
var noopLogger = {
  error: noop,
  warn: noop,
  info: noop,
  debug: noop
};
var cachedLoggers = /* @__PURE__ */ new WeakMap();
function loggerFor(client) {
  var _a2;
  const logger = client.logger;
  const logLevel = (_a2 = client.logLevel) !== null && _a2 !== void 0 ? _a2 : "off";
  if (!logger) {
    return noopLogger;
  }
  const cachedLogger = cachedLoggers.get(logger);
  if (cachedLogger && cachedLogger[0] === logLevel) {
    return cachedLogger[1];
  }
  const levelLogger = {
    error: makeLogFn("error", logger, logLevel),
    warn: makeLogFn("warn", logger, logLevel),
    info: makeLogFn("info", logger, logLevel),
    debug: makeLogFn("debug", logger, logLevel)
  };
  cachedLoggers.set(logger, [logLevel, levelLogger]);
  return levelLogger;
}
__name(loggerFor, "loggerFor");
var formatRequestDetails = /* @__PURE__ */ __name((details) => {
  if (details.options) {
    details.options = Object.assign({}, details.options);
    delete details.options["headers"];
  }
  if (details.headers) {
    details.headers = Object.fromEntries((details.headers instanceof Headers ? [...details.headers] : Object.entries(details.headers)).map(([name, value]) => [
      name,
      name.toLowerCase() === "x-goog-api-key" || name.toLowerCase() === "authorization" || name.toLowerCase() === "cookie" || name.toLowerCase() === "set-cookie" ? "***" : value
    ]));
  }
  if ("retryOfRequestLogID" in details) {
    if (details.retryOfRequestLogID) {
      details.retryOf = details.retryOfRequestLogID;
    }
    delete details.retryOfRequestLogID;
  }
  return details;
}, "formatRequestDetails");
var Stream = class _Stream {
  static {
    __name(this, "Stream");
  }
  constructor(iterator, controller, client) {
    this.iterator = iterator;
    this.controller = controller;
    this.client = client;
  }
  static fromSSEResponse(response, controller, client) {
    let consumed = false;
    const logger = client ? loggerFor(client) : console;
    function iterator() {
      return __asyncGenerator(this, arguments, /* @__PURE__ */ __name(function* iterator_1() {
        var _a2, e_1, _b, _c;
        if (consumed) {
          throw new GeminiNextGenAPIClientError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        }
        consumed = true;
        let done = false;
        try {
          try {
            for (var _d = true, _e = __asyncValues(_iterSSEMessages(response, controller)), _f; _f = yield __await(_e.next()), _a2 = _f.done, !_a2; _d = true) {
              _c = _f.value;
              _d = false;
              const sse = _c;
              if (done)
                continue;
              if (sse.data.startsWith("[DONE]")) {
                done = true;
                continue;
              } else {
                try {
                  yield yield __await(JSON.parse(sse.data));
                } catch (e) {
                  logger.error(`Could not parse message into JSON:`, sse.data);
                  logger.error(`From chunk:`, sse.raw);
                  throw e;
                }
              }
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (!_d && !_a2 && (_b = _e.return)) yield __await(_b.call(_e));
            } finally {
              if (e_1) throw e_1.error;
            }
          }
          done = true;
        } catch (e) {
          if (isAbortError(e))
            return yield __await(void 0);
          throw e;
        } finally {
          if (!done)
            controller.abort();
        }
      }, "iterator_1"));
    }
    __name(iterator, "iterator");
    return new _Stream(iterator, controller, client);
  }
  /**
   * Generates a Stream from a newline-separated ReadableStream
   * where each item is a JSON value.
   */
  static fromReadableStream(readableStream, controller, client) {
    let consumed = false;
    function iterLines() {
      return __asyncGenerator(this, arguments, /* @__PURE__ */ __name(function* iterLines_1() {
        var _a2, e_2, _b, _c;
        const lineDecoder = new LineDecoder();
        const iter = ReadableStreamToAsyncIterable(readableStream);
        try {
          for (var _d = true, iter_1 = __asyncValues(iter), iter_1_1; iter_1_1 = yield __await(iter_1.next()), _a2 = iter_1_1.done, !_a2; _d = true) {
            _c = iter_1_1.value;
            _d = false;
            const chunk = _c;
            for (const line of lineDecoder.decode(chunk)) {
              yield yield __await(line);
            }
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (!_d && !_a2 && (_b = iter_1.return)) yield __await(_b.call(iter_1));
          } finally {
            if (e_2) throw e_2.error;
          }
        }
        for (const line of lineDecoder.flush()) {
          yield yield __await(line);
        }
      }, "iterLines_1"));
    }
    __name(iterLines, "iterLines");
    function iterator() {
      return __asyncGenerator(this, arguments, /* @__PURE__ */ __name(function* iterator_2() {
        var _a2, e_3, _b, _c;
        if (consumed) {
          throw new GeminiNextGenAPIClientError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        }
        consumed = true;
        let done = false;
        try {
          try {
            for (var _d = true, _e = __asyncValues(iterLines()), _f; _f = yield __await(_e.next()), _a2 = _f.done, !_a2; _d = true) {
              _c = _f.value;
              _d = false;
              const line = _c;
              if (done)
                continue;
              if (line)
                yield yield __await(JSON.parse(line));
            }
          } catch (e_3_1) {
            e_3 = { error: e_3_1 };
          } finally {
            try {
              if (!_d && !_a2 && (_b = _e.return)) yield __await(_b.call(_e));
            } finally {
              if (e_3) throw e_3.error;
            }
          }
          done = true;
        } catch (e) {
          if (isAbortError(e))
            return yield __await(void 0);
          throw e;
        } finally {
          if (!done)
            controller.abort();
        }
      }, "iterator_2"));
    }
    __name(iterator, "iterator");
    return new _Stream(iterator, controller, client);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  /**
   * Splits the stream into two streams which can be
   * independently read from at different speeds.
   */
  tee() {
    const left = [];
    const right = [];
    const iterator = this.iterator();
    const teeIterator = /* @__PURE__ */ __name((queue) => {
      return {
        next: /* @__PURE__ */ __name(() => {
          if (queue.length === 0) {
            const result = iterator.next();
            left.push(result);
            right.push(result);
          }
          return queue.shift();
        }, "next")
      };
    }, "teeIterator");
    return [
      new _Stream(() => teeIterator(left), this.controller, this.client),
      new _Stream(() => teeIterator(right), this.controller, this.client)
    ];
  }
  /**
   * Converts this stream to a newline-separated ReadableStream of
   * JSON stringified values in the stream
   * which can be turned back into a Stream with `Stream.fromReadableStream()`.
   */
  toReadableStream() {
    const self = this;
    let iter;
    return makeReadableStream({
      async start() {
        iter = self[Symbol.asyncIterator]();
      },
      async pull(ctrl) {
        try {
          const { value, done } = await iter.next();
          if (done)
            return ctrl.close();
          const bytes = encodeUTF8(JSON.stringify(value) + "\n");
          ctrl.enqueue(bytes);
        } catch (err) {
          ctrl.error(err);
        }
      },
      async cancel() {
        var _a2;
        await ((_a2 = iter.return) === null || _a2 === void 0 ? void 0 : _a2.call(iter));
      }
    });
  }
};
function _iterSSEMessages(response, controller) {
  return __asyncGenerator(this, arguments, /* @__PURE__ */ __name(function* _iterSSEMessages_1() {
    var _a2, e_4, _b, _c;
    if (!response.body) {
      controller.abort();
      if (typeof globalThis.navigator !== "undefined" && globalThis.navigator.product === "ReactNative") {
        throw new GeminiNextGenAPIClientError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
      }
      throw new GeminiNextGenAPIClientError(`Attempted to iterate over a response with no body`);
    }
    const sseDecoder = new SSEDecoder();
    const lineDecoder = new LineDecoder();
    const iter = ReadableStreamToAsyncIterable(response.body);
    try {
      for (var _d = true, _e = __asyncValues(iterSSEChunks(iter)), _f; _f = yield __await(_e.next()), _a2 = _f.done, !_a2; _d = true) {
        _c = _f.value;
        _d = false;
        const sseChunk = _c;
        for (const line of lineDecoder.decode(sseChunk)) {
          const sse = sseDecoder.decode(line);
          if (sse)
            yield yield __await(sse);
        }
      }
    } catch (e_4_1) {
      e_4 = { error: e_4_1 };
    } finally {
      try {
        if (!_d && !_a2 && (_b = _e.return)) yield __await(_b.call(_e));
      } finally {
        if (e_4) throw e_4.error;
      }
    }
    for (const line of lineDecoder.flush()) {
      const sse = sseDecoder.decode(line);
      if (sse)
        yield yield __await(sse);
    }
  }, "_iterSSEMessages_1"));
}
__name(_iterSSEMessages, "_iterSSEMessages");
function iterSSEChunks(iterator) {
  return __asyncGenerator(this, arguments, /* @__PURE__ */ __name(function* iterSSEChunks_1() {
    var _a2, e_5, _b, _c;
    let data = new Uint8Array();
    try {
      for (var _d = true, iterator_3 = __asyncValues(iterator), iterator_3_1; iterator_3_1 = yield __await(iterator_3.next()), _a2 = iterator_3_1.done, !_a2; _d = true) {
        _c = iterator_3_1.value;
        _d = false;
        const chunk = _c;
        if (chunk == null) {
          continue;
        }
        const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
        let newData = new Uint8Array(data.length + binaryChunk.length);
        newData.set(data);
        newData.set(binaryChunk, data.length);
        data = newData;
        let patternIndex;
        while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
          yield yield __await(data.slice(0, patternIndex));
          data = data.slice(patternIndex);
        }
      }
    } catch (e_5_1) {
      e_5 = { error: e_5_1 };
    } finally {
      try {
        if (!_d && !_a2 && (_b = iterator_3.return)) yield __await(_b.call(iterator_3));
      } finally {
        if (e_5) throw e_5.error;
      }
    }
    if (data.length > 0) {
      yield yield __await(data);
    }
  }, "iterSSEChunks_1"));
}
__name(iterSSEChunks, "iterSSEChunks");
var SSEDecoder = class {
  static {
    __name(this, "SSEDecoder");
  }
  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.substring(0, line.length - 1);
    }
    if (!line) {
      if (!this.event && !this.data.length)
        return null;
      const sse = {
        event: this.event,
        data: this.data.join("\n"),
        raw: this.chunks
      };
      this.event = null;
      this.data = [];
      this.chunks = [];
      return sse;
    }
    this.chunks.push(line);
    if (line.startsWith(":")) {
      return null;
    }
    let [fieldname, _, value] = partition(line, ":");
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldname === "event") {
      this.event = value;
    } else if (fieldname === "data") {
      this.data.push(value);
    }
    return null;
  }
};
function partition(str, delimiter) {
  const index = str.indexOf(delimiter);
  if (index !== -1) {
    return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
  }
  return [str, "", ""];
}
__name(partition, "partition");
async function defaultParseResponse(client, props) {
  const { response, requestLogID, retryOfRequestLogID, startTime } = props;
  const body = await (async () => {
    var _a2;
    if (props.options.stream) {
      loggerFor(client).debug("response", response.status, response.url, response.headers, response.body);
      if (props.options.__streamClass) {
        return props.options.__streamClass.fromSSEResponse(response, props.controller, client);
      }
      return Stream.fromSSEResponse(response, props.controller, client);
    }
    if (response.status === 204) {
      return null;
    }
    if (props.options.__binaryResponse) {
      return response;
    }
    const contentType = response.headers.get("content-type");
    const mediaType = (_a2 = contentType === null || contentType === void 0 ? void 0 : contentType.split(";")[0]) === null || _a2 === void 0 ? void 0 : _a2.trim();
    const isJSON = (mediaType === null || mediaType === void 0 ? void 0 : mediaType.includes("application/json")) || (mediaType === null || mediaType === void 0 ? void 0 : mediaType.endsWith("+json"));
    if (isJSON) {
      const contentLength = response.headers.get("content-length");
      if (contentLength === "0") {
        return void 0;
      }
      const json2 = await response.json();
      return json2;
    }
    const text = await response.text();
    return text;
  })();
  loggerFor(client).debug(`[${requestLogID}] response parsed`, formatRequestDetails({
    retryOfRequestLogID,
    url: response.url,
    status: response.status,
    body,
    durationMs: Date.now() - startTime
  }));
  return body;
}
__name(defaultParseResponse, "defaultParseResponse");
var APIPromise = class _APIPromise extends Promise {
  static {
    __name(this, "APIPromise");
  }
  constructor(client, responsePromise, parseResponse = defaultParseResponse) {
    super((resolve) => {
      resolve(null);
    });
    this.responsePromise = responsePromise;
    this.parseResponse = parseResponse;
    this.client = client;
  }
  _thenUnwrap(transform) {
    return new _APIPromise(this.client, this.responsePromise, async (client, props) => transform(await this.parseResponse(client, props), props));
  }
  /**
   * Gets the raw `Response` instance instead of parsing the response
   * data.
   *
   * If you want to parse the response body but still get the `Response`
   * instance, you can use {@link withResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  asResponse() {
    return this.responsePromise.then((p) => p.response);
  }
  /**
   * Gets the parsed response data and the raw `Response` instance.
   *
   * If you just want to get the raw `Response` instance without parsing it,
   * you can use {@link asResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  async withResponse() {
    const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
    return { data, response };
  }
  parse() {
    if (!this.parsedPromise) {
      this.parsedPromise = this.responsePromise.then((data) => this.parseResponse(this.client, data));
    }
    return this.parsedPromise;
  }
  then(onfulfilled, onrejected) {
    return this.parse().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.parse().catch(onrejected);
  }
  finally(onfinally) {
    return this.parse().finally(onfinally);
  }
};
var brand_privateNullableHeaders = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* iterateHeaders(headers) {
  if (!headers)
    return;
  if (brand_privateNullableHeaders in headers) {
    const { values, nulls } = headers;
    yield* values.entries();
    for (const name of nulls) {
      yield [name, null];
    }
    return;
  }
  let shouldClear = false;
  let iter;
  if (headers instanceof Headers) {
    iter = headers.entries();
  } else if (isReadonlyArray(headers)) {
    iter = headers;
  } else {
    shouldClear = true;
    iter = Object.entries(headers !== null && headers !== void 0 ? headers : {});
  }
  for (let row of iter) {
    const name = row[0];
    if (typeof name !== "string")
      throw new TypeError("expected header name to be a string");
    const values = isReadonlyArray(row[1]) ? row[1] : [row[1]];
    let didClear = false;
    for (const value of values) {
      if (value === void 0)
        continue;
      if (shouldClear && !didClear) {
        didClear = true;
        yield [name, null];
      }
      yield [name, value];
    }
  }
}
__name(iterateHeaders, "iterateHeaders");
var buildHeaders = /* @__PURE__ */ __name((newHeaders) => {
  const targetHeaders = new Headers();
  const nullHeaders = /* @__PURE__ */ new Set();
  for (const headers of newHeaders) {
    const seenHeaders = /* @__PURE__ */ new Set();
    for (const [name, value] of iterateHeaders(headers)) {
      const lowerName = name.toLowerCase();
      if (!seenHeaders.has(lowerName)) {
        targetHeaders.delete(name);
        seenHeaders.add(lowerName);
      }
      if (value === null) {
        targetHeaders.delete(name);
        nullHeaders.add(lowerName);
      } else {
        targetHeaders.append(name, value);
        nullHeaders.delete(lowerName);
      }
    }
  }
  return { [brand_privateNullableHeaders]: true, values: targetHeaders, nulls: nullHeaders };
}, "buildHeaders");
var readEnv = /* @__PURE__ */ __name((env2) => {
  var _a2, _b, _c, _d, _e, _f;
  if (typeof globalThis.process !== "undefined") {
    return (_c = (_b = (_a2 = globalThis.process.env) === null || _a2 === void 0 ? void 0 : _a2[env2]) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : void 0;
  }
  if (typeof globalThis.Deno !== "undefined") {
    return (_f = (_e = (_d = globalThis.Deno.env) === null || _d === void 0 ? void 0 : _d.get) === null || _e === void 0 ? void 0 : _e.call(_d, env2)) === null || _f === void 0 ? void 0 : _f.trim();
  }
  return void 0;
}, "readEnv");
var _a;
var BaseGeminiNextGenAPIClient = class _BaseGeminiNextGenAPIClient {
  static {
    __name(this, "BaseGeminiNextGenAPIClient");
  }
  /**
   * API Client for interfacing with the Gemini Next Gen API API.
   *
   * @param {string | null | undefined} [opts.apiKey=process.env['GEMINI_API_KEY'] ?? null]
   * @param {string | undefined} [opts.apiVersion=v1beta]
   * @param {string} [opts.baseURL=process.env['GEMINI_NEXT_GEN_API_BASE_URL'] ?? https://generativelanguage.googleapis.com] - Override the default base URL for the API.
   * @param {number} [opts.timeout=1 minute] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
   * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
   */
  constructor(_b) {
    var _c, _d, _e, _f, _g, _h, _j;
    var { baseURL = readEnv("GEMINI_NEXT_GEN_API_BASE_URL"), apiKey = (_c = readEnv("GEMINI_API_KEY")) !== null && _c !== void 0 ? _c : null, apiVersion = "v1beta" } = _b, opts = __rest(_b, ["baseURL", "apiKey", "apiVersion"]);
    const options = Object.assign(Object.assign({
      apiKey,
      apiVersion
    }, opts), { baseURL: baseURL || `https://generativelanguage.googleapis.com` });
    this.baseURL = options.baseURL;
    this.timeout = (_d = options.timeout) !== null && _d !== void 0 ? _d : _BaseGeminiNextGenAPIClient.DEFAULT_TIMEOUT;
    this.logger = (_e = options.logger) !== null && _e !== void 0 ? _e : console;
    const defaultLogLevel = "warn";
    this.logLevel = defaultLogLevel;
    this.logLevel = (_g = (_f = parseLogLevel(options.logLevel, "ClientOptions.logLevel", this)) !== null && _f !== void 0 ? _f : parseLogLevel(readEnv("GEMINI_NEXT_GEN_API_LOG"), "process.env['GEMINI_NEXT_GEN_API_LOG']", this)) !== null && _g !== void 0 ? _g : defaultLogLevel;
    this.fetchOptions = options.fetchOptions;
    this.maxRetries = (_h = options.maxRetries) !== null && _h !== void 0 ? _h : 2;
    this.fetch = (_j = options.fetch) !== null && _j !== void 0 ? _j : getDefaultFetch();
    this.encoder = FallbackEncoder;
    this._options = options;
    this.apiKey = apiKey;
    this.apiVersion = apiVersion;
    this.clientAdapter = options.clientAdapter;
  }
  /**
   * Create a new client instance re-using the same options given to the current client with optional overriding.
   */
  withOptions(options) {
    const client = new this.constructor(Object.assign(Object.assign(Object.assign({}, this._options), { baseURL: this.baseURL, maxRetries: this.maxRetries, timeout: this.timeout, logger: this.logger, logLevel: this.logLevel, fetch: this.fetch, fetchOptions: this.fetchOptions, apiKey: this.apiKey, apiVersion: this.apiVersion }), options));
    return client;
  }
  /**
   * Check whether the base URL is set to its default.
   */
  baseURLOverridden() {
    return this.baseURL !== "https://generativelanguage.googleapis.com";
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values, nulls }) {
    if (values.has("authorization") || values.has("x-goog-api-key")) {
      return;
    }
    if (this.apiKey && values.get("x-goog-api-key")) {
      return;
    }
    if (nulls.has("x-goog-api-key")) {
      return;
    }
    throw new Error('Could not resolve authentication method. Expected the apiKey to be set. Or for the "x-goog-api-key" headers to be explicitly omitted');
  }
  async authHeaders(opts) {
    const existingHeaders = buildHeaders([opts.headers]);
    if (existingHeaders.values.has("authorization") || existingHeaders.values.has("x-goog-api-key")) {
      return void 0;
    }
    if (this.apiKey) {
      return buildHeaders([{ "x-goog-api-key": this.apiKey }]);
    }
    if (this.clientAdapter.isVertexAI()) {
      return buildHeaders([await this.clientAdapter.getAuthHeaders()]);
    }
    return void 0;
  }
  /**
   * Basic re-implementation of `qs.stringify` for primitive types.
   */
  stringifyQuery(query) {
    return Object.entries(query).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
      if (value === null) {
        return `${encodeURIComponent(key)}=`;
      }
      throw new GeminiNextGenAPIClientError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
    }).join("&");
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }
  makeStatusError(status, error3, message, headers) {
    return APIError.generate(status, error3, message, headers);
  }
  buildURL(path2, query, defaultBaseURL) {
    const baseURL = !this.baseURLOverridden() && defaultBaseURL || this.baseURL;
    const url = isAbsoluteURL(path2) ? new URL(path2) : new URL(baseURL + (baseURL.endsWith("/") && path2.startsWith("/") ? path2.slice(1) : path2));
    const defaultQuery = this.defaultQuery();
    if (!isEmptyObj(defaultQuery)) {
      query = Object.assign(Object.assign({}, defaultQuery), query);
    }
    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  /**
     * Used as a callback for mutating the given `FinalRequestOptions` object.
  
     */
  async prepareOptions(options) {
    if (this.clientAdapter && this.clientAdapter.isVertexAI() && !options.path.startsWith(`/${this.apiVersion}/projects/`)) {
      const oldPath = options.path.slice(this.apiVersion.length + 1);
      options.path = `/${this.apiVersion}/projects/${this.clientAdapter.getProject()}/locations/${this.clientAdapter.getLocation()}${oldPath}`;
    }
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  async prepareRequest(request, { url, options }) {
  }
  get(path2, opts) {
    return this.methodRequest("get", path2, opts);
  }
  post(path2, opts) {
    return this.methodRequest("post", path2, opts);
  }
  patch(path2, opts) {
    return this.methodRequest("patch", path2, opts);
  }
  put(path2, opts) {
    return this.methodRequest("put", path2, opts);
  }
  delete(path2, opts) {
    return this.methodRequest("delete", path2, opts);
  }
  methodRequest(method, path2, opts) {
    return this.request(Promise.resolve(opts).then((opts2) => {
      return Object.assign({ method, path: path2 }, opts2);
    }));
  }
  request(options, remainingRetries = null) {
    return new APIPromise(this, this.makeRequest(options, remainingRetries, void 0));
  }
  async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
    var _b, _c, _d;
    const options = await optionsInput;
    const maxRetries = (_b = options.maxRetries) !== null && _b !== void 0 ? _b : this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }
    await this.prepareOptions(options);
    const { req, url, timeout } = await this.buildRequest(options, {
      retryCount: maxRetries - retriesRemaining
    });
    await this.prepareRequest(req, { url, options });
    const requestLogID = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0");
    const retryLogStr = retryOfRequestLogID === void 0 ? "" : `, retryOf: ${retryOfRequestLogID}`;
    const startTime = Date.now();
    loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
      retryOfRequestLogID,
      method: options.method,
      url,
      options,
      headers: req.headers
    }));
    if ((_c = options.signal) === null || _c === void 0 ? void 0 : _c.aborted) {
      throw new APIUserAbortError();
    }
    const controller = new AbortController();
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    const headersTime = Date.now();
    if (response instanceof globalThis.Error) {
      const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
      if ((_d = options.signal) === null || _d === void 0 ? void 0 : _d.aborted) {
        throw new APIUserAbortError();
      }
      const isTimeout = isAbortError(response) || /timed? ?out/i.test(String(response) + ("cause" in response ? String(response.cause) : ""));
      if (retriesRemaining) {
        loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - ${retryMessage}`);
        loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (${retryMessage})`, formatRequestDetails({
          retryOfRequestLogID,
          url,
          durationMs: headersTime - startTime,
          message: response.message
        }));
        return this.retryRequest(options, retriesRemaining, retryOfRequestLogID !== null && retryOfRequestLogID !== void 0 ? retryOfRequestLogID : requestLogID);
      }
      loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - error; no more retries left`);
      loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (error; no more retries left)`, formatRequestDetails({
        retryOfRequestLogID,
        url,
        durationMs: headersTime - startTime,
        message: response.message
      }));
      if (isTimeout) {
        throw new APIConnectionTimeoutError();
      }
      throw new APIConnectionError({ cause: response });
    }
    const responseInfo = `[${requestLogID}${retryLogStr}] ${req.method} ${url} ${response.ok ? "succeeded" : "failed"} with status ${response.status} in ${headersTime - startTime}ms`;
    if (!response.ok) {
      const shouldRetry = await this.shouldRetry(response);
      if (retriesRemaining && shouldRetry) {
        const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
        await CancelReadableStream(response.body);
        loggerFor(this).info(`${responseInfo} - ${retryMessage2}`);
        loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage2})`, formatRequestDetails({
          retryOfRequestLogID,
          url: response.url,
          status: response.status,
          headers: response.headers,
          durationMs: headersTime - startTime
        }));
        return this.retryRequest(options, retriesRemaining, retryOfRequestLogID !== null && retryOfRequestLogID !== void 0 ? retryOfRequestLogID : requestLogID, response.headers);
      }
      const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
      loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
      const errText = await response.text().catch((err2) => castToError(err2).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? void 0 : errText;
      loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        headers: response.headers,
        message: errMessage,
        durationMs: Date.now() - startTime
      }));
      const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
      throw err;
    }
    loggerFor(this).info(responseInfo);
    loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
      retryOfRequestLogID,
      url: response.url,
      status: response.status,
      headers: response.headers,
      durationMs: headersTime - startTime
    }));
    return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
  }
  async fetchWithTimeout(url, init, ms, controller) {
    const _b = init || {}, { signal, method } = _b, options = __rest(_b, ["signal", "method"]);
    const abort2 = this._makeAbort(controller);
    if (signal)
      signal.addEventListener("abort", abort2, { once: true });
    const timeout = setTimeout(abort2, ms);
    const isReadableBody = globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream || typeof options.body === "object" && options.body !== null && Symbol.asyncIterator in options.body;
    const fetchOptions = Object.assign(Object.assign(Object.assign({ signal: controller.signal }, isReadableBody ? { duplex: "half" } : {}), { method: "GET" }), options);
    if (method) {
      fetchOptions.method = method.toUpperCase();
    }
    try {
      return await this.fetch.call(void 0, url, fetchOptions);
    } finally {
      clearTimeout(timeout);
    }
  }
  async shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
    var _b;
    let timeoutMillis;
    const retryAfterMillisHeader = responseHeaders === null || responseHeaders === void 0 ? void 0 : responseHeaders.get("retry-after-ms");
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }
    const retryAfterHeader = responseHeaders === null || responseHeaders === void 0 ? void 0 : responseHeaders.get("retry-after");
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1e3;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1e3)) {
      const maxRetries = (_b = options.maxRetries) !== null && _b !== void 0 ? _b : this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep$1(timeoutMillis);
    return this.makeRequest(options, retriesRemaining - 1, requestLogID);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1e3;
  }
  async buildRequest(inputOptions, { retryCount = 0 } = {}) {
    var _b, _c, _d;
    const options = Object.assign({}, inputOptions);
    const { method, path: path2, query, defaultBaseURL } = options;
    const url = this.buildURL(path2, query, defaultBaseURL);
    if ("timeout" in options)
      validatePositiveInteger("timeout", options.timeout);
    options.timeout = (_b = options.timeout) !== null && _b !== void 0 ? _b : this.timeout;
    const { bodyHeaders, body } = this.buildBody({ options });
    const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });
    const req = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ method, headers: reqHeaders }, options.signal && { signal: options.signal }), globalThis.ReadableStream && body instanceof globalThis.ReadableStream && { duplex: "half" }), body && { body }), (_c = this.fetchOptions) !== null && _c !== void 0 ? _c : {}), (_d = options.fetchOptions) !== null && _d !== void 0 ? _d : {});
    return { req, url, timeout: options.timeout };
  }
  async buildHeaders({ options, method, bodyHeaders, retryCount }) {
    let idempotencyHeaders = {};
    if (this.idempotencyHeader && method !== "get") {
      if (!options.idempotencyKey)
        options.idempotencyKey = this.defaultIdempotencyKey();
      idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
    }
    const authHeaders = await this.authHeaders(options);
    let headers = buildHeaders([
      idempotencyHeaders,
      Object.assign(Object.assign({ Accept: "application/json", "User-Agent": this.getUserAgent(), "X-Stainless-Retry-Count": String(retryCount) }, options.timeout ? { "X-Stainless-Timeout": String(Math.trunc(options.timeout / 1e3)) } : {}), getPlatformHeaders()),
      this._options.defaultHeaders,
      bodyHeaders,
      options.headers,
      authHeaders
    ]);
    this.validateHeaders(headers);
    return headers.values;
  }
  _makeAbort(controller) {
    return () => controller.abort();
  }
  buildBody({ options: { body, headers: rawHeaders } }) {
    if (!body) {
      return { bodyHeaders: void 0, body: void 0 };
    }
    const headers = buildHeaders([rawHeaders]);
    if (
      // Pass raw type verbatim
      ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof DataView || typeof body === "string" && // Preserve legacy string encoding behavior for now
      headers.values.has("content-type") || // `Blob` is superset of `File`
      globalThis.Blob && body instanceof globalThis.Blob || // `FormData` -> `multipart/form-data`
      body instanceof FormData || // `URLSearchParams` -> `application/x-www-form-urlencoded`
      body instanceof URLSearchParams || // Send chunked stream (each chunk has own `length`)
      globalThis.ReadableStream && body instanceof globalThis.ReadableStream
    ) {
      return { bodyHeaders: void 0, body };
    } else if (typeof body === "object" && (Symbol.asyncIterator in body || Symbol.iterator in body && "next" in body && typeof body.next === "function")) {
      return { bodyHeaders: void 0, body: ReadableStreamFrom(body) };
    } else {
      return this.encoder({ body, headers });
    }
  }
};
BaseGeminiNextGenAPIClient.DEFAULT_TIMEOUT = 6e4;
var GeminiNextGenAPIClient = class extends BaseGeminiNextGenAPIClient {
  static {
    __name(this, "GeminiNextGenAPIClient");
  }
  constructor() {
    super(...arguments);
    this.interactions = new Interactions(this);
  }
};
_a = GeminiNextGenAPIClient;
GeminiNextGenAPIClient.GeminiNextGenAPIClient = _a;
GeminiNextGenAPIClient.GeminiNextGenAPIClientError = GeminiNextGenAPIClientError;
GeminiNextGenAPIClient.APIError = APIError;
GeminiNextGenAPIClient.APIConnectionError = APIConnectionError;
GeminiNextGenAPIClient.APIConnectionTimeoutError = APIConnectionTimeoutError;
GeminiNextGenAPIClient.APIUserAbortError = APIUserAbortError;
GeminiNextGenAPIClient.NotFoundError = NotFoundError;
GeminiNextGenAPIClient.ConflictError = ConflictError;
GeminiNextGenAPIClient.RateLimitError = RateLimitError;
GeminiNextGenAPIClient.BadRequestError = BadRequestError;
GeminiNextGenAPIClient.AuthenticationError = AuthenticationError;
GeminiNextGenAPIClient.InternalServerError = InternalServerError;
GeminiNextGenAPIClient.PermissionDeniedError = PermissionDeniedError;
GeminiNextGenAPIClient.UnprocessableEntityError = UnprocessableEntityError;
GeminiNextGenAPIClient.toFile = toFile;
GeminiNextGenAPIClient.Interactions = Interactions;
function cancelTuningJobParametersToMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], fromName);
  }
  return toObject;
}
__name(cancelTuningJobParametersToMldev, "cancelTuningJobParametersToMldev");
function cancelTuningJobParametersToVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], fromName);
  }
  return toObject;
}
__name(cancelTuningJobParametersToVertex, "cancelTuningJobParametersToVertex");
function cancelTuningJobResponseFromMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  return toObject;
}
__name(cancelTuningJobResponseFromMldev, "cancelTuningJobResponseFromMldev");
function cancelTuningJobResponseFromVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  return toObject;
}
__name(cancelTuningJobResponseFromVertex, "cancelTuningJobResponseFromVertex");
function createTuningJobConfigToMldev(fromObject, parentObject, _rootObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["validationDataset"]) !== void 0) {
    throw new Error("validationDataset parameter is not supported in Gemini API.");
  }
  const fromTunedModelDisplayName = getValueByPath(fromObject, [
    "tunedModelDisplayName"
  ]);
  if (parentObject !== void 0 && fromTunedModelDisplayName != null) {
    setValueByPath(parentObject, ["displayName"], fromTunedModelDisplayName);
  }
  if (getValueByPath(fromObject, ["description"]) !== void 0) {
    throw new Error("description parameter is not supported in Gemini API.");
  }
  const fromEpochCount = getValueByPath(fromObject, ["epochCount"]);
  if (parentObject !== void 0 && fromEpochCount != null) {
    setValueByPath(parentObject, ["tuningTask", "hyperparameters", "epochCount"], fromEpochCount);
  }
  const fromLearningRateMultiplier = getValueByPath(fromObject, [
    "learningRateMultiplier"
  ]);
  if (fromLearningRateMultiplier != null) {
    setValueByPath(toObject, ["tuningTask", "hyperparameters", "learningRateMultiplier"], fromLearningRateMultiplier);
  }
  if (getValueByPath(fromObject, ["exportLastCheckpointOnly"]) !== void 0) {
    throw new Error("exportLastCheckpointOnly parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["preTunedModelCheckpointId"]) !== void 0) {
    throw new Error("preTunedModelCheckpointId parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["adapterSize"]) !== void 0) {
    throw new Error("adapterSize parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["tuningMode"]) !== void 0) {
    throw new Error("tuningMode parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["customBaseModel"]) !== void 0) {
    throw new Error("customBaseModel parameter is not supported in Gemini API.");
  }
  const fromBatchSize = getValueByPath(fromObject, ["batchSize"]);
  if (parentObject !== void 0 && fromBatchSize != null) {
    setValueByPath(parentObject, ["tuningTask", "hyperparameters", "batchSize"], fromBatchSize);
  }
  const fromLearningRate = getValueByPath(fromObject, ["learningRate"]);
  if (parentObject !== void 0 && fromLearningRate != null) {
    setValueByPath(parentObject, ["tuningTask", "hyperparameters", "learningRate"], fromLearningRate);
  }
  if (getValueByPath(fromObject, ["labels"]) !== void 0) {
    throw new Error("labels parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["beta"]) !== void 0) {
    throw new Error("beta parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["baseTeacherModel"]) !== void 0) {
    throw new Error("baseTeacherModel parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["tunedTeacherModelSource"]) !== void 0) {
    throw new Error("tunedTeacherModelSource parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["sftLossWeightMultiplier"]) !== void 0) {
    throw new Error("sftLossWeightMultiplier parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["outputUri"]) !== void 0) {
    throw new Error("outputUri parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["encryptionSpec"]) !== void 0) {
    throw new Error("encryptionSpec parameter is not supported in Gemini API.");
  }
  return toObject;
}
__name(createTuningJobConfigToMldev, "createTuningJobConfigToMldev");
function createTuningJobConfigToVertex(fromObject, parentObject, rootObject) {
  const toObject = {};
  let discriminatorValidationDataset = getValueByPath(rootObject, [
    "config",
    "method"
  ]);
  if (discriminatorValidationDataset === void 0) {
    discriminatorValidationDataset = "SUPERVISED_FINE_TUNING";
  }
  if (discriminatorValidationDataset === "SUPERVISED_FINE_TUNING") {
    const fromValidationDataset = getValueByPath(fromObject, [
      "validationDataset"
    ]);
    if (parentObject !== void 0 && fromValidationDataset != null) {
      setValueByPath(parentObject, ["supervisedTuningSpec"], tuningValidationDatasetToVertex(fromValidationDataset));
    }
  } else if (discriminatorValidationDataset === "PREFERENCE_TUNING") {
    const fromValidationDataset = getValueByPath(fromObject, [
      "validationDataset"
    ]);
    if (parentObject !== void 0 && fromValidationDataset != null) {
      setValueByPath(parentObject, ["preferenceOptimizationSpec"], tuningValidationDatasetToVertex(fromValidationDataset));
    }
  } else if (discriminatorValidationDataset === "DISTILLATION") {
    const fromValidationDataset = getValueByPath(fromObject, [
      "validationDataset"
    ]);
    if (parentObject !== void 0 && fromValidationDataset != null) {
      setValueByPath(parentObject, ["distillationSpec"], tuningValidationDatasetToVertex(fromValidationDataset));
    }
  }
  const fromTunedModelDisplayName = getValueByPath(fromObject, [
    "tunedModelDisplayName"
  ]);
  if (parentObject !== void 0 && fromTunedModelDisplayName != null) {
    setValueByPath(parentObject, ["tunedModelDisplayName"], fromTunedModelDisplayName);
  }
  const fromDescription = getValueByPath(fromObject, ["description"]);
  if (parentObject !== void 0 && fromDescription != null) {
    setValueByPath(parentObject, ["description"], fromDescription);
  }
  let discriminatorEpochCount = getValueByPath(rootObject, [
    "config",
    "method"
  ]);
  if (discriminatorEpochCount === void 0) {
    discriminatorEpochCount = "SUPERVISED_FINE_TUNING";
  }
  if (discriminatorEpochCount === "SUPERVISED_FINE_TUNING") {
    const fromEpochCount = getValueByPath(fromObject, ["epochCount"]);
    if (parentObject !== void 0 && fromEpochCount != null) {
      setValueByPath(parentObject, ["supervisedTuningSpec", "hyperParameters", "epochCount"], fromEpochCount);
    }
  } else if (discriminatorEpochCount === "PREFERENCE_TUNING") {
    const fromEpochCount = getValueByPath(fromObject, ["epochCount"]);
    if (parentObject !== void 0 && fromEpochCount != null) {
      setValueByPath(parentObject, ["preferenceOptimizationSpec", "hyperParameters", "epochCount"], fromEpochCount);
    }
  } else if (discriminatorEpochCount === "DISTILLATION") {
    const fromEpochCount = getValueByPath(fromObject, ["epochCount"]);
    if (parentObject !== void 0 && fromEpochCount != null) {
      setValueByPath(parentObject, ["distillationSpec", "hyperParameters", "epochCount"], fromEpochCount);
    }
  }
  let discriminatorLearningRateMultiplier = getValueByPath(rootObject, [
    "config",
    "method"
  ]);
  if (discriminatorLearningRateMultiplier === void 0) {
    discriminatorLearningRateMultiplier = "SUPERVISED_FINE_TUNING";
  }
  if (discriminatorLearningRateMultiplier === "SUPERVISED_FINE_TUNING") {
    const fromLearningRateMultiplier = getValueByPath(fromObject, [
      "learningRateMultiplier"
    ]);
    if (parentObject !== void 0 && fromLearningRateMultiplier != null) {
      setValueByPath(parentObject, ["supervisedTuningSpec", "hyperParameters", "learningRateMultiplier"], fromLearningRateMultiplier);
    }
  } else if (discriminatorLearningRateMultiplier === "PREFERENCE_TUNING") {
    const fromLearningRateMultiplier = getValueByPath(fromObject, [
      "learningRateMultiplier"
    ]);
    if (parentObject !== void 0 && fromLearningRateMultiplier != null) {
      setValueByPath(parentObject, [
        "preferenceOptimizationSpec",
        "hyperParameters",
        "learningRateMultiplier"
      ], fromLearningRateMultiplier);
    }
  } else if (discriminatorLearningRateMultiplier === "DISTILLATION") {
    const fromLearningRateMultiplier = getValueByPath(fromObject, [
      "learningRateMultiplier"
    ]);
    if (parentObject !== void 0 && fromLearningRateMultiplier != null) {
      setValueByPath(parentObject, ["distillationSpec", "hyperParameters", "learningRateMultiplier"], fromLearningRateMultiplier);
    }
  }
  let discriminatorExportLastCheckpointOnly = getValueByPath(rootObject, ["config", "method"]);
  if (discriminatorExportLastCheckpointOnly === void 0) {
    discriminatorExportLastCheckpointOnly = "SUPERVISED_FINE_TUNING";
  }
  if (discriminatorExportLastCheckpointOnly === "SUPERVISED_FINE_TUNING") {
    const fromExportLastCheckpointOnly = getValueByPath(fromObject, [
      "exportLastCheckpointOnly"
    ]);
    if (parentObject !== void 0 && fromExportLastCheckpointOnly != null) {
      setValueByPath(parentObject, ["supervisedTuningSpec", "exportLastCheckpointOnly"], fromExportLastCheckpointOnly);
    }
  } else if (discriminatorExportLastCheckpointOnly === "PREFERENCE_TUNING") {
    const fromExportLastCheckpointOnly = getValueByPath(fromObject, [
      "exportLastCheckpointOnly"
    ]);
    if (parentObject !== void 0 && fromExportLastCheckpointOnly != null) {
      setValueByPath(parentObject, ["preferenceOptimizationSpec", "exportLastCheckpointOnly"], fromExportLastCheckpointOnly);
    }
  } else if (discriminatorExportLastCheckpointOnly === "DISTILLATION") {
    const fromExportLastCheckpointOnly = getValueByPath(fromObject, [
      "exportLastCheckpointOnly"
    ]);
    if (parentObject !== void 0 && fromExportLastCheckpointOnly != null) {
      setValueByPath(parentObject, ["distillationSpec", "exportLastCheckpointOnly"], fromExportLastCheckpointOnly);
    }
  }
  let discriminatorAdapterSize = getValueByPath(rootObject, [
    "config",
    "method"
  ]);
  if (discriminatorAdapterSize === void 0) {
    discriminatorAdapterSize = "SUPERVISED_FINE_TUNING";
  }
  if (discriminatorAdapterSize === "SUPERVISED_FINE_TUNING") {
    const fromAdapterSize = getValueByPath(fromObject, ["adapterSize"]);
    if (parentObject !== void 0 && fromAdapterSize != null) {
      setValueByPath(parentObject, ["supervisedTuningSpec", "hyperParameters", "adapterSize"], fromAdapterSize);
    }
  } else if (discriminatorAdapterSize === "PREFERENCE_TUNING") {
    const fromAdapterSize = getValueByPath(fromObject, ["adapterSize"]);
    if (parentObject !== void 0 && fromAdapterSize != null) {
      setValueByPath(parentObject, ["preferenceOptimizationSpec", "hyperParameters", "adapterSize"], fromAdapterSize);
    }
  } else if (discriminatorAdapterSize === "DISTILLATION") {
    const fromAdapterSize = getValueByPath(fromObject, ["adapterSize"]);
    if (parentObject !== void 0 && fromAdapterSize != null) {
      setValueByPath(parentObject, ["distillationSpec", "hyperParameters", "adapterSize"], fromAdapterSize);
    }
  }
  let discriminatorTuningMode = getValueByPath(rootObject, [
    "config",
    "method"
  ]);
  if (discriminatorTuningMode === void 0) {
    discriminatorTuningMode = "SUPERVISED_FINE_TUNING";
  }
  if (discriminatorTuningMode === "SUPERVISED_FINE_TUNING") {
    const fromTuningMode = getValueByPath(fromObject, ["tuningMode"]);
    if (parentObject !== void 0 && fromTuningMode != null) {
      setValueByPath(parentObject, ["supervisedTuningSpec", "tuningMode"], fromTuningMode);
    }
  }
  const fromCustomBaseModel = getValueByPath(fromObject, [
    "customBaseModel"
  ]);
  if (parentObject !== void 0 && fromCustomBaseModel != null) {
    setValueByPath(parentObject, ["customBaseModel"], fromCustomBaseModel);
  }
  let discriminatorBatchSize = getValueByPath(rootObject, [
    "config",
    "method"
  ]);
  if (discriminatorBatchSize === void 0) {
    discriminatorBatchSize = "SUPERVISED_FINE_TUNING";
  }
  if (discriminatorBatchSize === "SUPERVISED_FINE_TUNING") {
    const fromBatchSize = getValueByPath(fromObject, ["batchSize"]);
    if (parentObject !== void 0 && fromBatchSize != null) {
      setValueByPath(parentObject, ["supervisedTuningSpec", "hyperParameters", "batchSize"], fromBatchSize);
    }
  }
  let discriminatorLearningRate = getValueByPath(rootObject, [
    "config",
    "method"
  ]);
  if (discriminatorLearningRate === void 0) {
    discriminatorLearningRate = "SUPERVISED_FINE_TUNING";
  }
  if (discriminatorLearningRate === "SUPERVISED_FINE_TUNING") {
    const fromLearningRate = getValueByPath(fromObject, [
      "learningRate"
    ]);
    if (parentObject !== void 0 && fromLearningRate != null) {
      setValueByPath(parentObject, ["supervisedTuningSpec", "hyperParameters", "learningRate"], fromLearningRate);
    }
  }
  const fromLabels = getValueByPath(fromObject, ["labels"]);
  if (parentObject !== void 0 && fromLabels != null) {
    setValueByPath(parentObject, ["labels"], fromLabels);
  }
  const fromBeta = getValueByPath(fromObject, ["beta"]);
  if (parentObject !== void 0 && fromBeta != null) {
    setValueByPath(parentObject, ["preferenceOptimizationSpec", "hyperParameters", "beta"], fromBeta);
  }
  const fromBaseTeacherModel = getValueByPath(fromObject, [
    "baseTeacherModel"
  ]);
  if (parentObject !== void 0 && fromBaseTeacherModel != null) {
    setValueByPath(parentObject, ["distillationSpec", "baseTeacherModel"], fromBaseTeacherModel);
  }
  const fromTunedTeacherModelSource = getValueByPath(fromObject, [
    "tunedTeacherModelSource"
  ]);
  if (parentObject !== void 0 && fromTunedTeacherModelSource != null) {
    setValueByPath(parentObject, ["distillationSpec", "tunedTeacherModelSource"], fromTunedTeacherModelSource);
  }
  const fromSftLossWeightMultiplier = getValueByPath(fromObject, [
    "sftLossWeightMultiplier"
  ]);
  if (parentObject !== void 0 && fromSftLossWeightMultiplier != null) {
    setValueByPath(parentObject, ["distillationSpec", "hyperParameters", "sftLossWeightMultiplier"], fromSftLossWeightMultiplier);
  }
  const fromOutputUri = getValueByPath(fromObject, ["outputUri"]);
  if (parentObject !== void 0 && fromOutputUri != null) {
    setValueByPath(parentObject, ["outputUri"], fromOutputUri);
  }
  const fromEncryptionSpec = getValueByPath(fromObject, [
    "encryptionSpec"
  ]);
  if (parentObject !== void 0 && fromEncryptionSpec != null) {
    setValueByPath(parentObject, ["encryptionSpec"], fromEncryptionSpec);
  }
  return toObject;
}
__name(createTuningJobConfigToVertex, "createTuningJobConfigToVertex");
function createTuningJobParametersPrivateToMldev(fromObject, rootObject) {
  const toObject = {};
  const fromBaseModel = getValueByPath(fromObject, ["baseModel"]);
  if (fromBaseModel != null) {
    setValueByPath(toObject, ["baseModel"], fromBaseModel);
  }
  const fromPreTunedModel = getValueByPath(fromObject, [
    "preTunedModel"
  ]);
  if (fromPreTunedModel != null) {
    setValueByPath(toObject, ["preTunedModel"], fromPreTunedModel);
  }
  const fromTrainingDataset = getValueByPath(fromObject, [
    "trainingDataset"
  ]);
  if (fromTrainingDataset != null) {
    tuningDatasetToMldev(fromTrainingDataset);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    createTuningJobConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(createTuningJobParametersPrivateToMldev, "createTuningJobParametersPrivateToMldev");
function createTuningJobParametersPrivateToVertex(fromObject, rootObject) {
  const toObject = {};
  const fromBaseModel = getValueByPath(fromObject, ["baseModel"]);
  if (fromBaseModel != null) {
    setValueByPath(toObject, ["baseModel"], fromBaseModel);
  }
  const fromPreTunedModel = getValueByPath(fromObject, [
    "preTunedModel"
  ]);
  if (fromPreTunedModel != null) {
    setValueByPath(toObject, ["preTunedModel"], fromPreTunedModel);
  }
  const fromTrainingDataset = getValueByPath(fromObject, [
    "trainingDataset"
  ]);
  if (fromTrainingDataset != null) {
    tuningDatasetToVertex(fromTrainingDataset, toObject, rootObject);
  }
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    createTuningJobConfigToVertex(fromConfig, toObject, rootObject);
  }
  return toObject;
}
__name(createTuningJobParametersPrivateToVertex, "createTuningJobParametersPrivateToVertex");
function getTuningJobParametersToMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], fromName);
  }
  return toObject;
}
__name(getTuningJobParametersToMldev, "getTuningJobParametersToMldev");
function getTuningJobParametersToVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["_url", "name"], fromName);
  }
  return toObject;
}
__name(getTuningJobParametersToVertex, "getTuningJobParametersToVertex");
function listTuningJobsConfigToMldev(fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
  if (parentObject !== void 0 && fromPageSize != null) {
    setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
  }
  const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
  if (parentObject !== void 0 && fromPageToken != null) {
    setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
  }
  const fromFilter = getValueByPath(fromObject, ["filter"]);
  if (parentObject !== void 0 && fromFilter != null) {
    setValueByPath(parentObject, ["_query", "filter"], fromFilter);
  }
  return toObject;
}
__name(listTuningJobsConfigToMldev, "listTuningJobsConfigToMldev");
function listTuningJobsConfigToVertex(fromObject, parentObject, _rootObject) {
  const toObject = {};
  const fromPageSize = getValueByPath(fromObject, ["pageSize"]);
  if (parentObject !== void 0 && fromPageSize != null) {
    setValueByPath(parentObject, ["_query", "pageSize"], fromPageSize);
  }
  const fromPageToken = getValueByPath(fromObject, ["pageToken"]);
  if (parentObject !== void 0 && fromPageToken != null) {
    setValueByPath(parentObject, ["_query", "pageToken"], fromPageToken);
  }
  const fromFilter = getValueByPath(fromObject, ["filter"]);
  if (parentObject !== void 0 && fromFilter != null) {
    setValueByPath(parentObject, ["_query", "filter"], fromFilter);
  }
  return toObject;
}
__name(listTuningJobsConfigToVertex, "listTuningJobsConfigToVertex");
function listTuningJobsParametersToMldev(fromObject, rootObject) {
  const toObject = {};
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    listTuningJobsConfigToMldev(fromConfig, toObject);
  }
  return toObject;
}
__name(listTuningJobsParametersToMldev, "listTuningJobsParametersToMldev");
function listTuningJobsParametersToVertex(fromObject, rootObject) {
  const toObject = {};
  const fromConfig = getValueByPath(fromObject, ["config"]);
  if (fromConfig != null) {
    listTuningJobsConfigToVertex(fromConfig, toObject);
  }
  return toObject;
}
__name(listTuningJobsParametersToVertex, "listTuningJobsParametersToVertex");
function listTuningJobsResponseFromMldev(fromObject, rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromNextPageToken = getValueByPath(fromObject, [
    "nextPageToken"
  ]);
  if (fromNextPageToken != null) {
    setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
  }
  const fromTuningJobs = getValueByPath(fromObject, ["tunedModels"]);
  if (fromTuningJobs != null) {
    let transformedList = fromTuningJobs;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return tuningJobFromMldev(item);
      });
    }
    setValueByPath(toObject, ["tuningJobs"], transformedList);
  }
  return toObject;
}
__name(listTuningJobsResponseFromMldev, "listTuningJobsResponseFromMldev");
function listTuningJobsResponseFromVertex(fromObject, rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromNextPageToken = getValueByPath(fromObject, [
    "nextPageToken"
  ]);
  if (fromNextPageToken != null) {
    setValueByPath(toObject, ["nextPageToken"], fromNextPageToken);
  }
  const fromTuningJobs = getValueByPath(fromObject, ["tuningJobs"]);
  if (fromTuningJobs != null) {
    let transformedList = fromTuningJobs;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return tuningJobFromVertex(item);
      });
    }
    setValueByPath(toObject, ["tuningJobs"], transformedList);
  }
  return toObject;
}
__name(listTuningJobsResponseFromVertex, "listTuningJobsResponseFromVertex");
function tunedModelFromMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromModel = getValueByPath(fromObject, ["name"]);
  if (fromModel != null) {
    setValueByPath(toObject, ["model"], fromModel);
  }
  const fromEndpoint = getValueByPath(fromObject, ["name"]);
  if (fromEndpoint != null) {
    setValueByPath(toObject, ["endpoint"], fromEndpoint);
  }
  return toObject;
}
__name(tunedModelFromMldev, "tunedModelFromMldev");
function tuningDatasetToMldev(fromObject, _rootObject) {
  const toObject = {};
  if (getValueByPath(fromObject, ["gcsUri"]) !== void 0) {
    throw new Error("gcsUri parameter is not supported in Gemini API.");
  }
  if (getValueByPath(fromObject, ["vertexDatasetResource"]) !== void 0) {
    throw new Error("vertexDatasetResource parameter is not supported in Gemini API.");
  }
  const fromExamples = getValueByPath(fromObject, ["examples"]);
  if (fromExamples != null) {
    let transformedList = fromExamples;
    if (Array.isArray(transformedList)) {
      transformedList = transformedList.map((item) => {
        return item;
      });
    }
    setValueByPath(toObject, ["examples", "examples"], transformedList);
  }
  return toObject;
}
__name(tuningDatasetToMldev, "tuningDatasetToMldev");
function tuningDatasetToVertex(fromObject, parentObject, rootObject) {
  const toObject = {};
  let discriminatorGcsUri = getValueByPath(rootObject, [
    "config",
    "method"
  ]);
  if (discriminatorGcsUri === void 0) {
    discriminatorGcsUri = "SUPERVISED_FINE_TUNING";
  }
  if (discriminatorGcsUri === "SUPERVISED_FINE_TUNING") {
    const fromGcsUri = getValueByPath(fromObject, ["gcsUri"]);
    if (parentObject !== void 0 && fromGcsUri != null) {
      setValueByPath(parentObject, ["supervisedTuningSpec", "trainingDatasetUri"], fromGcsUri);
    }
  } else if (discriminatorGcsUri === "PREFERENCE_TUNING") {
    const fromGcsUri = getValueByPath(fromObject, ["gcsUri"]);
    if (parentObject !== void 0 && fromGcsUri != null) {
      setValueByPath(parentObject, ["preferenceOptimizationSpec", "trainingDatasetUri"], fromGcsUri);
    }
  } else if (discriminatorGcsUri === "DISTILLATION") {
    const fromGcsUri = getValueByPath(fromObject, ["gcsUri"]);
    if (parentObject !== void 0 && fromGcsUri != null) {
      setValueByPath(parentObject, ["distillationSpec", "promptDatasetUri"], fromGcsUri);
    }
  }
  let discriminatorVertexDatasetResource = getValueByPath(rootObject, [
    "config",
    "method"
  ]);
  if (discriminatorVertexDatasetResource === void 0) {
    discriminatorVertexDatasetResource = "SUPERVISED_FINE_TUNING";
  }
  if (discriminatorVertexDatasetResource === "SUPERVISED_FINE_TUNING") {
    const fromVertexDatasetResource = getValueByPath(fromObject, [
      "vertexDatasetResource"
    ]);
    if (parentObject !== void 0 && fromVertexDatasetResource != null) {
      setValueByPath(parentObject, ["supervisedTuningSpec", "trainingDatasetUri"], fromVertexDatasetResource);
    }
  } else if (discriminatorVertexDatasetResource === "PREFERENCE_TUNING") {
    const fromVertexDatasetResource = getValueByPath(fromObject, [
      "vertexDatasetResource"
    ]);
    if (parentObject !== void 0 && fromVertexDatasetResource != null) {
      setValueByPath(parentObject, ["preferenceOptimizationSpec", "trainingDatasetUri"], fromVertexDatasetResource);
    }
  } else if (discriminatorVertexDatasetResource === "DISTILLATION") {
    const fromVertexDatasetResource = getValueByPath(fromObject, [
      "vertexDatasetResource"
    ]);
    if (parentObject !== void 0 && fromVertexDatasetResource != null) {
      setValueByPath(parentObject, ["distillationSpec", "promptDatasetUri"], fromVertexDatasetResource);
    }
  }
  if (getValueByPath(fromObject, ["examples"]) !== void 0) {
    throw new Error("examples parameter is not supported in Vertex AI.");
  }
  return toObject;
}
__name(tuningDatasetToVertex, "tuningDatasetToVertex");
function tuningJobFromMldev(fromObject, rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromState = getValueByPath(fromObject, ["state"]);
  if (fromState != null) {
    setValueByPath(toObject, ["state"], tTuningJobStatus(fromState));
  }
  const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
  if (fromCreateTime != null) {
    setValueByPath(toObject, ["createTime"], fromCreateTime);
  }
  const fromStartTime = getValueByPath(fromObject, [
    "tuningTask",
    "startTime"
  ]);
  if (fromStartTime != null) {
    setValueByPath(toObject, ["startTime"], fromStartTime);
  }
  const fromEndTime = getValueByPath(fromObject, [
    "tuningTask",
    "completeTime"
  ]);
  if (fromEndTime != null) {
    setValueByPath(toObject, ["endTime"], fromEndTime);
  }
  const fromUpdateTime = getValueByPath(fromObject, ["updateTime"]);
  if (fromUpdateTime != null) {
    setValueByPath(toObject, ["updateTime"], fromUpdateTime);
  }
  const fromDescription = getValueByPath(fromObject, ["description"]);
  if (fromDescription != null) {
    setValueByPath(toObject, ["description"], fromDescription);
  }
  const fromBaseModel = getValueByPath(fromObject, ["baseModel"]);
  if (fromBaseModel != null) {
    setValueByPath(toObject, ["baseModel"], fromBaseModel);
  }
  const fromTunedModel = getValueByPath(fromObject, ["_self"]);
  if (fromTunedModel != null) {
    setValueByPath(toObject, ["tunedModel"], tunedModelFromMldev(fromTunedModel));
  }
  return toObject;
}
__name(tuningJobFromMldev, "tuningJobFromMldev");
function tuningJobFromVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromState = getValueByPath(fromObject, ["state"]);
  if (fromState != null) {
    setValueByPath(toObject, ["state"], tTuningJobStatus(fromState));
  }
  const fromCreateTime = getValueByPath(fromObject, ["createTime"]);
  if (fromCreateTime != null) {
    setValueByPath(toObject, ["createTime"], fromCreateTime);
  }
  const fromStartTime = getValueByPath(fromObject, ["startTime"]);
  if (fromStartTime != null) {
    setValueByPath(toObject, ["startTime"], fromStartTime);
  }
  const fromEndTime = getValueByPath(fromObject, ["endTime"]);
  if (fromEndTime != null) {
    setValueByPath(toObject, ["endTime"], fromEndTime);
  }
  const fromUpdateTime = getValueByPath(fromObject, ["updateTime"]);
  if (fromUpdateTime != null) {
    setValueByPath(toObject, ["updateTime"], fromUpdateTime);
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  const fromDescription = getValueByPath(fromObject, ["description"]);
  if (fromDescription != null) {
    setValueByPath(toObject, ["description"], fromDescription);
  }
  const fromBaseModel = getValueByPath(fromObject, ["baseModel"]);
  if (fromBaseModel != null) {
    setValueByPath(toObject, ["baseModel"], fromBaseModel);
  }
  const fromTunedModel = getValueByPath(fromObject, ["tunedModel"]);
  if (fromTunedModel != null) {
    setValueByPath(toObject, ["tunedModel"], fromTunedModel);
  }
  const fromPreTunedModel = getValueByPath(fromObject, [
    "preTunedModel"
  ]);
  if (fromPreTunedModel != null) {
    setValueByPath(toObject, ["preTunedModel"], fromPreTunedModel);
  }
  const fromSupervisedTuningSpec = getValueByPath(fromObject, [
    "supervisedTuningSpec"
  ]);
  if (fromSupervisedTuningSpec != null) {
    setValueByPath(toObject, ["supervisedTuningSpec"], fromSupervisedTuningSpec);
  }
  const fromPreferenceOptimizationSpec = getValueByPath(fromObject, [
    "preferenceOptimizationSpec"
  ]);
  if (fromPreferenceOptimizationSpec != null) {
    setValueByPath(toObject, ["preferenceOptimizationSpec"], fromPreferenceOptimizationSpec);
  }
  const fromDistillationSpec = getValueByPath(fromObject, [
    "distillationSpec"
  ]);
  if (fromDistillationSpec != null) {
    setValueByPath(toObject, ["distillationSpec"], fromDistillationSpec);
  }
  const fromTuningDataStats = getValueByPath(fromObject, [
    "tuningDataStats"
  ]);
  if (fromTuningDataStats != null) {
    setValueByPath(toObject, ["tuningDataStats"], fromTuningDataStats);
  }
  const fromEncryptionSpec = getValueByPath(fromObject, [
    "encryptionSpec"
  ]);
  if (fromEncryptionSpec != null) {
    setValueByPath(toObject, ["encryptionSpec"], fromEncryptionSpec);
  }
  const fromPartnerModelTuningSpec = getValueByPath(fromObject, [
    "partnerModelTuningSpec"
  ]);
  if (fromPartnerModelTuningSpec != null) {
    setValueByPath(toObject, ["partnerModelTuningSpec"], fromPartnerModelTuningSpec);
  }
  const fromCustomBaseModel = getValueByPath(fromObject, [
    "customBaseModel"
  ]);
  if (fromCustomBaseModel != null) {
    setValueByPath(toObject, ["customBaseModel"], fromCustomBaseModel);
  }
  const fromExperiment = getValueByPath(fromObject, ["experiment"]);
  if (fromExperiment != null) {
    setValueByPath(toObject, ["experiment"], fromExperiment);
  }
  const fromLabels = getValueByPath(fromObject, ["labels"]);
  if (fromLabels != null) {
    setValueByPath(toObject, ["labels"], fromLabels);
  }
  const fromOutputUri = getValueByPath(fromObject, ["outputUri"]);
  if (fromOutputUri != null) {
    setValueByPath(toObject, ["outputUri"], fromOutputUri);
  }
  const fromPipelineJob = getValueByPath(fromObject, ["pipelineJob"]);
  if (fromPipelineJob != null) {
    setValueByPath(toObject, ["pipelineJob"], fromPipelineJob);
  }
  const fromServiceAccount = getValueByPath(fromObject, [
    "serviceAccount"
  ]);
  if (fromServiceAccount != null) {
    setValueByPath(toObject, ["serviceAccount"], fromServiceAccount);
  }
  const fromTunedModelDisplayName = getValueByPath(fromObject, [
    "tunedModelDisplayName"
  ]);
  if (fromTunedModelDisplayName != null) {
    setValueByPath(toObject, ["tunedModelDisplayName"], fromTunedModelDisplayName);
  }
  const fromVeoTuningSpec = getValueByPath(fromObject, [
    "veoTuningSpec"
  ]);
  if (fromVeoTuningSpec != null) {
    setValueByPath(toObject, ["veoTuningSpec"], fromVeoTuningSpec);
  }
  return toObject;
}
__name(tuningJobFromVertex, "tuningJobFromVertex");
function tuningOperationFromMldev(fromObject, _rootObject) {
  const toObject = {};
  const fromSdkHttpResponse = getValueByPath(fromObject, [
    "sdkHttpResponse"
  ]);
  if (fromSdkHttpResponse != null) {
    setValueByPath(toObject, ["sdkHttpResponse"], fromSdkHttpResponse);
  }
  const fromName = getValueByPath(fromObject, ["name"]);
  if (fromName != null) {
    setValueByPath(toObject, ["name"], fromName);
  }
  const fromMetadata = getValueByPath(fromObject, ["metadata"]);
  if (fromMetadata != null) {
    setValueByPath(toObject, ["metadata"], fromMetadata);
  }
  const fromDone = getValueByPath(fromObject, ["done"]);
  if (fromDone != null) {
    setValueByPath(toObject, ["done"], fromDone);
  }
  const fromError = getValueByPath(fromObject, ["error"]);
  if (fromError != null) {
    setValueByPath(toObject, ["error"], fromError);
  }
  return toObject;
}
__name(tuningOperationFromMldev, "tuningOperationFromMldev");
function tuningValidationDatasetToVertex(fromObject, _rootObject) {
  const toObject = {};
  const fromGcsUri = getValueByPath(fromObject, ["gcsUri"]);
  if (fromGcsUri != null) {
    setValueByPath(toObject, ["validationDatasetUri"], fromGcsUri);
  }
  const fromVertexDatasetResource = getValueByPath(fromObject, [
    "vertexDatasetResource"
  ]);
  if (fromVertexDatasetResource != null) {
    setValueByPath(toObject, ["validationDatasetUri"], fromVertexDatasetResource);
  }
  return toObject;
}
__name(tuningValidationDatasetToVertex, "tuningValidationDatasetToVertex");
var Tunings = class extends BaseModule {
  static {
    __name(this, "Tunings");
  }
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
    this.list = async (params = {}) => {
      return new Pager(PagedItem.PAGED_ITEM_TUNING_JOBS, (x) => this.listInternal(x), await this.listInternal(params), params);
    };
    this.get = async (params) => {
      return await this.getInternal(params);
    };
    this.tune = async (params) => {
      var _a2;
      if (this.apiClient.isVertexAI()) {
        if (params.baseModel.startsWith("projects/")) {
          const preTunedModel = {
            tunedModelName: params.baseModel
          };
          if ((_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.preTunedModelCheckpointId) {
            preTunedModel.checkpointId = params.config.preTunedModelCheckpointId;
          }
          const paramsPrivate = Object.assign(Object.assign({}, params), { preTunedModel });
          paramsPrivate.baseModel = void 0;
          return await this.tuneInternal(paramsPrivate);
        } else {
          const paramsPrivate = Object.assign({}, params);
          return await this.tuneInternal(paramsPrivate);
        }
      } else {
        const paramsPrivate = Object.assign({}, params);
        const operation = await this.tuneMldevInternal(paramsPrivate);
        let tunedModelName = "";
        if (operation["metadata"] !== void 0 && operation["metadata"]["tunedModel"] !== void 0) {
          tunedModelName = operation["metadata"]["tunedModel"];
        } else if (operation["name"] !== void 0 && operation["name"].includes("/operations/")) {
          tunedModelName = operation["name"].split("/operations/")[0];
        }
        const tuningJob = {
          name: tunedModelName,
          state: JobState.JOB_STATE_QUEUED
        };
        return tuningJob;
      }
    };
  }
  async getInternal(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = getTuningJobParametersToVertex(params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = tuningJobFromVertex(apiResponse);
        return resp;
      });
    } else {
      const body = getTuningJobParametersToMldev(params);
      path2 = formatMap("{name}", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = tuningJobFromMldev(apiResponse);
        return resp;
      });
    }
  }
  async listInternal(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = listTuningJobsParametersToVertex(params);
      path2 = formatMap("tuningJobs", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = listTuningJobsResponseFromVertex(apiResponse);
        const typedResp = new ListTuningJobsResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      const body = listTuningJobsParametersToMldev(params);
      path2 = formatMap("tunedModels", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "GET",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = listTuningJobsResponseFromMldev(apiResponse);
        const typedResp = new ListTuningJobsResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  /**
   * Cancels a tuning job.
   *
   * @param params - The parameters for the cancel request.
   * @return The empty response returned by the API.
   *
   * @example
   * ```ts
   * await ai.tunings.cancel({name: '...'}); // The server-generated resource name.
   * ```
   */
  async cancel(params) {
    var _a2, _b, _c, _d;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = cancelTuningJobParametersToVertex(params);
      path2 = formatMap("{name}:cancel", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = cancelTuningJobResponseFromVertex(apiResponse);
        const typedResp = new CancelTuningJobResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    } else {
      const body = cancelTuningJobParametersToMldev(params);
      path2 = formatMap("{name}:cancel", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_c = params.config) === null || _c === void 0 ? void 0 : _c.httpOptions,
        abortSignal: (_d = params.config) === null || _d === void 0 ? void 0 : _d.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = cancelTuningJobResponseFromMldev(apiResponse);
        const typedResp = new CancelTuningJobResponse();
        Object.assign(typedResp, resp);
        return typedResp;
      });
    }
  }
  async tuneInternal(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      const body = createTuningJobParametersPrivateToVertex(params, params);
      path2 = formatMap("tuningJobs", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = tuningJobFromVertex(apiResponse);
        return resp;
      });
    } else {
      throw new Error("This method is only supported by the Vertex AI.");
    }
  }
  async tuneMldevInternal(params) {
    var _a2, _b;
    let response;
    let path2 = "";
    let queryParams = {};
    if (this.apiClient.isVertexAI()) {
      throw new Error("This method is only supported by the Gemini Developer API.");
    } else {
      const body = createTuningJobParametersPrivateToMldev(params);
      path2 = formatMap("tunedModels", body["_url"]);
      queryParams = body["_query"];
      delete body["_url"];
      delete body["_query"];
      response = this.apiClient.request({
        path: path2,
        queryParams,
        body: JSON.stringify(body),
        httpMethod: "POST",
        httpOptions: (_a2 = params.config) === null || _a2 === void 0 ? void 0 : _a2.httpOptions,
        abortSignal: (_b = params.config) === null || _b === void 0 ? void 0 : _b.abortSignal
      }).then((httpResponse) => {
        return httpResponse.json().then((jsonResponse) => {
          const response2 = jsonResponse;
          response2.sdkHttpResponse = {
            headers: httpResponse.headers
          };
          return response2;
        });
      });
      return response.then((apiResponse) => {
        const resp = tuningOperationFromMldev(apiResponse);
        return resp;
      });
    }
  }
};
var BrowserDownloader = class {
  static {
    __name(this, "BrowserDownloader");
  }
  async download(_params, _apiClient) {
    throw new Error("Download to file is not supported in the browser, please use a browser compliant download like an <a> tag.");
  }
};
var MAX_CHUNK_SIZE = 1024 * 1024 * 8;
var MAX_RETRY_COUNT = 3;
var INITIAL_RETRY_DELAY_MS = 1e3;
var DELAY_MULTIPLIER = 2;
var X_GOOG_UPLOAD_STATUS_HEADER_FIELD = "x-goog-upload-status";
async function uploadBlob(file, uploadUrl, apiClient) {
  var _a2;
  const response = await uploadBlobInternal(file, uploadUrl, apiClient);
  const responseJson = await (response === null || response === void 0 ? void 0 : response.json());
  if (((_a2 = response === null || response === void 0 ? void 0 : response.headers) === null || _a2 === void 0 ? void 0 : _a2[X_GOOG_UPLOAD_STATUS_HEADER_FIELD]) !== "final") {
    throw new Error("Failed to upload file: Upload status is not finalized.");
  }
  return responseJson["file"];
}
__name(uploadBlob, "uploadBlob");
async function uploadBlobToFileSearchStore(file, uploadUrl, apiClient) {
  var _a2;
  const response = await uploadBlobInternal(file, uploadUrl, apiClient);
  const responseJson = await (response === null || response === void 0 ? void 0 : response.json());
  if (((_a2 = response === null || response === void 0 ? void 0 : response.headers) === null || _a2 === void 0 ? void 0 : _a2[X_GOOG_UPLOAD_STATUS_HEADER_FIELD]) !== "final") {
    throw new Error("Failed to upload file: Upload status is not finalized.");
  }
  const resp = uploadToFileSearchStoreOperationFromMldev(responseJson);
  const typedResp = new UploadToFileSearchStoreOperation();
  Object.assign(typedResp, resp);
  return typedResp;
}
__name(uploadBlobToFileSearchStore, "uploadBlobToFileSearchStore");
async function uploadBlobInternal(file, uploadUrl, apiClient) {
  var _a2, _b;
  let fileSize = 0;
  let offset = 0;
  let response = new HttpResponse(new Response());
  let uploadCommand = "upload";
  fileSize = file.size;
  while (offset < fileSize) {
    const chunkSize = Math.min(MAX_CHUNK_SIZE, fileSize - offset);
    const chunk = file.slice(offset, offset + chunkSize);
    if (offset + chunkSize >= fileSize) {
      uploadCommand += ", finalize";
    }
    let retryCount = 0;
    let currentDelayMs = INITIAL_RETRY_DELAY_MS;
    while (retryCount < MAX_RETRY_COUNT) {
      response = await apiClient.request({
        path: "",
        body: chunk,
        httpMethod: "POST",
        httpOptions: {
          apiVersion: "",
          baseUrl: uploadUrl,
          headers: {
            "X-Goog-Upload-Command": uploadCommand,
            "X-Goog-Upload-Offset": String(offset),
            "Content-Length": String(chunkSize)
          }
        }
      });
      if ((_a2 = response === null || response === void 0 ? void 0 : response.headers) === null || _a2 === void 0 ? void 0 : _a2[X_GOOG_UPLOAD_STATUS_HEADER_FIELD]) {
        break;
      }
      retryCount++;
      await sleep(currentDelayMs);
      currentDelayMs = currentDelayMs * DELAY_MULTIPLIER;
    }
    offset += chunkSize;
    if (((_b = response === null || response === void 0 ? void 0 : response.headers) === null || _b === void 0 ? void 0 : _b[X_GOOG_UPLOAD_STATUS_HEADER_FIELD]) !== "active") {
      break;
    }
    if (fileSize <= offset) {
      throw new Error("All content has been uploaded, but the upload status is not finalized.");
    }
  }
  return response;
}
__name(uploadBlobInternal, "uploadBlobInternal");
async function getBlobStat(file) {
  const fileStat = { size: file.size, type: file.type };
  return fileStat;
}
__name(getBlobStat, "getBlobStat");
function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}
__name(sleep, "sleep");
var BrowserUploader = class {
  static {
    __name(this, "BrowserUploader");
  }
  async upload(file, uploadUrl, apiClient) {
    if (typeof file === "string") {
      throw new Error("File path is not supported in browser uploader.");
    }
    return await uploadBlob(file, uploadUrl, apiClient);
  }
  async uploadToFileSearchStore(file, uploadUrl, apiClient) {
    if (typeof file === "string") {
      throw new Error("File path is not supported in browser uploader.");
    }
    return await uploadBlobToFileSearchStore(file, uploadUrl, apiClient);
  }
  async stat(file) {
    if (typeof file === "string") {
      throw new Error("File path is not supported in browser uploader.");
    } else {
      return await getBlobStat(file);
    }
  }
};
var BrowserWebSocketFactory = class {
  static {
    __name(this, "BrowserWebSocketFactory");
  }
  create(url, headers, callbacks) {
    return new BrowserWebSocket(url, headers, callbacks);
  }
};
var BrowserWebSocket = class {
  static {
    __name(this, "BrowserWebSocket");
  }
  constructor(url, headers, callbacks) {
    this.url = url;
    this.headers = headers;
    this.callbacks = callbacks;
  }
  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = this.callbacks.onopen;
    this.ws.onerror = this.callbacks.onerror;
    this.ws.onclose = this.callbacks.onclose;
    this.ws.onmessage = this.callbacks.onmessage;
  }
  send(message) {
    if (this.ws === void 0) {
      throw new Error("WebSocket is not connected");
    }
    this.ws.send(message);
  }
  close() {
    if (this.ws === void 0) {
      throw new Error("WebSocket is not connected");
    }
    this.ws.close();
  }
};
var GOOGLE_API_KEY_HEADER = "x-goog-api-key";
var WebAuth = class {
  static {
    __name(this, "WebAuth");
  }
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addAuthHeaders(headers, url) {
    if (headers.get(GOOGLE_API_KEY_HEADER) !== null) {
      return;
    }
    if (this.apiKey.startsWith("auth_tokens/")) {
      throw new Error("Ephemeral tokens are only supported by the live API.");
    }
    if (!this.apiKey) {
      throw new Error("API key is missing. Please provide a valid API key.");
    }
    headers.append(GOOGLE_API_KEY_HEADER, this.apiKey);
  }
};
var LANGUAGE_LABEL_PREFIX = "gl-node/";
var GoogleGenAI = class {
  static {
    __name(this, "GoogleGenAI");
  }
  get interactions() {
    var _a2;
    if (this._interactions !== void 0) {
      return this._interactions;
    }
    console.warn("GoogleGenAI.interactions: Interactions usage is experimental and may change in future versions.");
    const httpOpts = this.httpOptions;
    if (httpOpts === null || httpOpts === void 0 ? void 0 : httpOpts.extraBody) {
      console.warn("GoogleGenAI.interactions: Client level httpOptions.extraBody is not supported by the interactions client and will be ignored.");
    }
    const nextGenClient = new GeminiNextGenAPIClient({
      baseURL: this.apiClient.getBaseUrl(),
      apiKey: this.apiKey,
      apiVersion: this.apiClient.getApiVersion(),
      clientAdapter: this.apiClient,
      defaultHeaders: this.apiClient.getDefaultHeaders(),
      timeout: httpOpts === null || httpOpts === void 0 ? void 0 : httpOpts.timeout,
      maxRetries: (_a2 = httpOpts === null || httpOpts === void 0 ? void 0 : httpOpts.retryOptions) === null || _a2 === void 0 ? void 0 : _a2.attempts
    });
    this._interactions = nextGenClient.interactions;
    return this._interactions;
  }
  constructor(options) {
    var _a2;
    if (options.apiKey == null) {
      throw new Error("An API Key must be set when running in a browser");
    }
    if (options.project || options.location) {
      throw new Error("Vertex AI project based authentication is not supported on browser runtimes. Please do not provide a project or location.");
    }
    this.vertexai = (_a2 = options.vertexai) !== null && _a2 !== void 0 ? _a2 : false;
    this.apiKey = options.apiKey;
    const baseUrl = getBaseUrl(
      options.httpOptions,
      options.vertexai,
      /*vertexBaseUrlFromEnv*/
      void 0,
      /*geminiBaseUrlFromEnv*/
      void 0
    );
    if (baseUrl) {
      if (options.httpOptions) {
        options.httpOptions.baseUrl = baseUrl;
      } else {
        options.httpOptions = { baseUrl };
      }
    }
    this.apiVersion = options.apiVersion;
    this.httpOptions = options.httpOptions;
    const auth = new WebAuth(this.apiKey);
    this.apiClient = new ApiClient({
      auth,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: this.httpOptions,
      userAgentExtra: LANGUAGE_LABEL_PREFIX + "web",
      uploader: new BrowserUploader(),
      downloader: new BrowserDownloader()
    });
    this.models = new Models(this.apiClient);
    this.live = new Live(this.apiClient, auth, new BrowserWebSocketFactory());
    this.batches = new Batches(this.apiClient);
    this.chats = new Chats(this.models, this.apiClient);
    this.caches = new Caches(this.apiClient);
    this.files = new Files(this.apiClient);
    this.operations = new Operations(this.apiClient);
    this.authTokens = new Tokens(this.apiClient);
    this.tunings = new Tunings(this.apiClient);
    this.fileSearchStores = new FileSearchStores(this.apiClient);
  }
};

// workers/kvPolicy.ts
var hashValue = /* @__PURE__ */ __name(async (value) => {
  const normalized = value.trim().toLowerCase();
  const bytes = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}, "hashValue");
var hashEntries = /* @__PURE__ */ __name(async (entries) => {
  const normalized = entries.filter((entry) => typeof entry === "string").map((entry) => entry.trim().toLowerCase()).filter(Boolean).sort().join("\n");
  return hashValue(normalized);
}, "hashEntries");
var stripSettingsForKv = /* @__PURE__ */ __name((settings) => {
  const raw = settings;
  const keyOverrides = raw.keyOverrides && typeof raw.keyOverrides === "object" ? {
    google: typeof raw.keyOverrides.google === "string" ? raw.keyOverrides.google : void 0,
    openai: typeof raw.keyOverrides.openai === "string" ? raw.keyOverrides.openai : void 0
  } : void 0;
  const openDataConfigRaw = raw.openDataConfig && typeof raw.openDataConfig === "object" ? raw.openDataConfig : null;
  const openDataConfig = openDataConfigRaw ? (() => {
    const zeroCostMode = openDataConfigRaw.zeroCostMode === true;
    return {
      zeroCostMode,
      allowPaidAccess: zeroCostMode ? false : openDataConfigRaw.allowPaidAccess === true,
      featureFlags: {
        autoIngestion: openDataConfigRaw.featureFlags?.autoIngestion === true,
        evidenceRecovery: openDataConfigRaw.featureFlags?.evidenceRecovery !== false,
        gatingEnforcement: openDataConfigRaw.featureFlags?.gatingEnforcement !== false,
        usOnlyAddressPolicy: openDataConfigRaw.featureFlags?.usOnlyAddressPolicy === true,
        datasetTelemetryRanking: openDataConfigRaw.featureFlags?.datasetTelemetryRanking !== false,
        socrataPreferV3: openDataConfigRaw.featureFlags?.socrataPreferV3 === true
      },
      auth: {
        socrataAppToken: typeof openDataConfigRaw.auth?.socrataAppToken === "string" ? openDataConfigRaw.auth.socrataAppToken : void 0,
        arcgisApiKey: typeof openDataConfigRaw.auth?.arcgisApiKey === "string" ? openDataConfigRaw.auth.arcgisApiKey : void 0,
        geocodingEmail: typeof openDataConfigRaw.auth?.geocodingEmail === "string" ? openDataConfigRaw.auth.geocodingEmail : void 0
      }
    };
  })() : void 0;
  return {
    schemaVersion: settings.schemaVersion,
    provider: settings.provider,
    runConfig: settings.runConfig,
    modelOverrides: settings.modelOverrides,
    keyOverrides: keyOverrides || {},
    openDataConfig: openDataConfig || {
      zeroCostMode: true,
      allowPaidAccess: false,
      featureFlags: {
        autoIngestion: true,
        evidenceRecovery: true,
        gatingEnforcement: true,
        usOnlyAddressPolicy: false,
        datasetTelemetryRanking: true,
        socrataPreferV3: false
      },
      auth: {}
    },
    operatorTuning: raw.operatorTuning,
    sourceLearning: Array.isArray(raw.sourceLearning) ? raw.sourceLearning : void 0
  };
}, "stripSettingsForKv");
var buildAllowlistMetadata = /* @__PURE__ */ __name(async (input) => {
  return {
    updatedAt: input.updatedAt,
    updatedBy: null,
    version: input.version,
    count: input.entries.length,
    entriesHash: await hashEntries(input.entries)
  };
}, "buildAllowlistMetadata");

// services/redaction.ts
var REDACTED_VALUE = "[REDACTED]";
var REDACTED_TOKEN = "[REDACTED_TOKEN]";
var REDACTED_ADDRESS = "[REDACTED_ADDRESS]";
var REDACTED_CIRCULAR = "[REDACTED_CIRCULAR]";
var SENSITIVE_KEYS = /* @__PURE__ */ new Set([
  "api_key",
  "apikey",
  "access_token",
  "$$app_token",
  "app_token",
  "app-token",
  "token",
  "client_secret",
  "client_id",
  "key",
  "authorization",
  "x-app-token",
  "x_app_token",
  "secret"
]);
var ADDRESS_KEYS = /* @__PURE__ */ new Set([
  "address",
  "addr",
  "street",
  "location",
  "parcel",
  "lat",
  "lng",
  "latitude",
  "longitude"
]);
var QUERY_KEYS = /* @__PURE__ */ new Set([
  "api_key",
  "apikey",
  "access_token",
  "$$app_token",
  "app_token",
  "app-token",
  "x-app-token",
  "x_app_token",
  "token",
  "client_secret",
  "client_id",
  "key",
  "authorization",
  "address",
  "addr",
  "street",
  "location",
  "query",
  "q"
]);
var ADDRESS_PATTERN = /\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s){0,5}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way|Parkway|Pkwy|Place|Pl|Terrace|Ter|Trail|Trl|Highway|Hwy|Loop|Lp|Plaza|Plz|Square|Sq)\b\.?/gi;
var QUERY_PARAM_PATTERN = /([?&](?:api_key|apikey|access_token|\\$\\$app_token|app_token|app-token|x-app-token|x_app_token|token|client_secret|client_id|key|authorization|address|addr|street|location|query|q)=)([^&\s]+)/gi;
var BEARER_PATTERN = /\b(Bearer|Basic)\s+[A-Za-z0-9\-._~+/]+=*\b/gi;
var OPENAI_KEY_PATTERN = /\bsk-[A-Za-z0-9]{10,}\b/g;
var GOOGLE_KEY_PATTERN = /\bAIza[0-9A-Za-z\-_]{10,}\b/g;
var ARCGIS_KEY_PATTERN = /\bAAPK[A-Za-z0-9]{10,}\b/g;
var JWT_PATTERN = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;
var isSensitiveKey = /* @__PURE__ */ __name((key) => SENSITIVE_KEYS.has(key.toLowerCase()), "isSensitiveKey");
var isAddressKey = /* @__PURE__ */ __name((key) => ADDRESS_KEYS.has(key.toLowerCase()), "isAddressKey");
var isQueryKey = /* @__PURE__ */ __name((key) => QUERY_KEYS.has(key.toLowerCase()), "isQueryKey");
var redactUrl = /* @__PURE__ */ __name((raw) => {
  try {
    const url = new URL(raw);
    let updated = false;
    url.searchParams.forEach((value, key) => {
      if (isQueryKey(key)) {
        url.searchParams.set(key, isAddressKey(key) ? REDACTED_ADDRESS : REDACTED_VALUE);
        updated = true;
      }
    });
    return updated ? url.toString() : url.toString();
  } catch (_) {
    return raw.replace(QUERY_PARAM_PATTERN, `$1${REDACTED_VALUE}`);
  }
}, "redactUrl");
var redactSensitiveText = /* @__PURE__ */ __name((input) => {
  if (!input) return input;
  let output = input;
  if (output.includes("://")) {
    output = redactUrl(output);
  } else {
    output = output.replace(QUERY_PARAM_PATTERN, `$1${REDACTED_VALUE}`);
  }
  output = output.replace(BEARER_PATTERN, `$1 ${REDACTED_TOKEN}`);
  output = output.replace(OPENAI_KEY_PATTERN, REDACTED_TOKEN);
  output = output.replace(GOOGLE_KEY_PATTERN, REDACTED_TOKEN);
  output = output.replace(ARCGIS_KEY_PATTERN, REDACTED_TOKEN);
  output = output.replace(JWT_PATTERN, REDACTED_TOKEN);
  output = output.replace(ADDRESS_PATTERN, REDACTED_ADDRESS);
  return output;
}, "redactSensitiveText");
var redactSensitiveValue = /* @__PURE__ */ __name((value, seen = /* @__PURE__ */ new WeakSet()) => {
  if (value === null || value === void 0) return value;
  if (typeof value === "string") return redactSensitiveText(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof URL) return redactSensitiveText(value.toString());
  if (Array.isArray(value)) {
    return value.map((entry) => redactSensitiveValue(entry, seen));
  }
  if (typeof value === "object") {
    if (seen.has(value)) return REDACTED_CIRCULAR;
    seen.add(value);
    const result = {};
    for (const [key, entry] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        result[key] = REDACTED_VALUE;
        continue;
      }
      if (isAddressKey(key)) {
        result[key] = REDACTED_ADDRESS;
        continue;
      }
      if (/url|endpoint/i.test(key) && typeof entry === "string") {
        result[key] = redactSensitiveText(entry);
        continue;
      }
      result[key] = redactSensitiveValue(entry, seen);
    }
    return result;
  }
  return value;
}, "redactSensitiveValue");
var redactLogArgs = /* @__PURE__ */ __name((args) => args.map((arg) => redactSensitiveValue(arg)), "redactLogArgs");
var logGuardInstalled = false;
var installLogRedactionGuard = /* @__PURE__ */ __name(() => {
  if (logGuardInstalled) return;
  if (typeof console === "undefined") return;
  logGuardInstalled = true;
  ["log", "info", "warn", "error", "debug"].forEach((method) => {
    const original = console[method];
    if (typeof original !== "function") return;
    console[method] = (...args) => original.apply(console, redactLogArgs(args));
  });
}, "installLogRedactionGuard");

// services/ragGuardrails.ts
var RAG_GUARDRAILS = {
  allowEmbeddings: false,
  allowExternalVectorDb: false,
  allowRemoteIndex: false,
  mode: "local-only"
};
var assertRagGuardrails = /* @__PURE__ */ __name((input) => {
  if (input.allowEmbeddings) {
    throw new Error("RAG guardrail violation: embeddings are disabled; use local BM25/TF-IDF only.");
  }
  if (input.usesExternalVectorDb) {
    throw new Error("RAG guardrail violation: external or paid vector databases are not allowed.");
  }
  if (input.usesRemoteIndex) {
    throw new Error("RAG guardrail violation: remote indices are disallowed; keep retrieval local.");
  }
}, "assertRagGuardrails");

// services/ragIndex.ts
var DEFAULT_STOP_WORDS = /* @__PURE__ */ new Set([
  "the",
  "and",
  "or",
  "a",
  "an",
  "to",
  "of",
  "in",
  "for",
  "on",
  "by",
  "with",
  "from",
  "at",
  "as",
  "is",
  "are",
  "be",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "into",
  "over",
  "under",
  "their",
  "your",
  "our",
  "we",
  "you",
  "they",
  "them",
  "was",
  "were",
  "but",
  "not",
  "can",
  "will",
  "should",
  "may",
  "might",
  "if",
  "else",
  "when",
  "where",
  "what",
  "which",
  "who",
  "how",
  "why",
  "about",
  "more",
  "less"
]);
var DEFAULT_MIN_TOKEN_LENGTH = 2;
var DEFAULT_MAX_CHUNKS = 2500;
var DEFAULT_MAX_CHUNK_CHARS = 8e3;
var DEFAULT_MAX_TOTAL_CHARS = 15e5;
var RAG_INDEX_STORAGE_STRATEGY = "memory";
var RAG_INDEX_LIMITS = {
  maxChunks: DEFAULT_MAX_CHUNKS,
  maxChunkChars: DEFAULT_MAX_CHUNK_CHARS,
  maxTotalChars: DEFAULT_MAX_TOTAL_CHARS
};
var clamp = /* @__PURE__ */ __name((value, min, max) => Math.max(min, Math.min(max, value)), "clamp");
var normalizeToken = /* @__PURE__ */ __name((value) => value.toLowerCase(), "normalizeToken");
var tokenize = /* @__PURE__ */ __name((text, options) => {
  const minLen = options.minTokenLength ?? DEFAULT_MIN_TOKEN_LENGTH;
  const stopWords = options.stopWords ?? DEFAULT_STOP_WORDS;
  return text.toLowerCase().split(/[^a-z0-9]+/g).map((token) => token.trim()).filter((token) => token.length >= minLen && !stopWords.has(token));
}, "tokenize");
var parseJsonl = /* @__PURE__ */ __name((jsonl) => {
  if (!jsonl) return [];
  const lines = jsonl.split(/\r?\n/);
  const records = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      records.push(JSON.parse(trimmed));
    } catch (_) {
    }
  }
  return records;
}, "parseJsonl");
var normalizeChunks = /* @__PURE__ */ __name((chunks, options) => {
  const maxChunks = options.maxChunks ?? DEFAULT_MAX_CHUNKS;
  const maxChunkChars = options.maxChunkChars ?? DEFAULT_MAX_CHUNK_CHARS;
  const maxTotalChars = options.maxTotalChars ?? DEFAULT_MAX_TOTAL_CHARS;
  const normalized = [];
  let totalChars = 0;
  for (const chunk of chunks) {
    if (normalized.length >= maxChunks) break;
    const text = (chunk.text || "").slice(0, maxChunkChars);
    if (!text) continue;
    const nextTotal = totalChars + text.length;
    if (nextTotal > maxTotalChars) break;
    normalized.push({ ...chunk, text });
    totalChars = nextTotal;
  }
  return normalized;
}, "normalizeChunks");
var RagIndex = class {
  static {
    __name(this, "RagIndex");
  }
  constructor(chunks, options = {}) {
    assertRagGuardrails({ allowEmbeddings: options.allowEmbeddings });
    this.options = options;
    const trimmed = normalizeChunks(chunks, options);
    const docs = [];
    const docFreq = /* @__PURE__ */ new Map();
    let totalLength = 0;
    for (const chunk of trimmed) {
      const text = chunk.text || "";
      const tokens = tokenize(text, options);
      if (tokens.length === 0) continue;
      const termFreq = /* @__PURE__ */ new Map();
      tokens.forEach((token) => {
        const normalized = normalizeToken(token);
        termFreq.set(normalized, (termFreq.get(normalized) || 0) + 1);
      });
      for (const token of new Set(tokens.map(normalizeToken))) {
        docFreq.set(token, (docFreq.get(token) || 0) + 1);
      }
      docs.push({ chunk, length: tokens.length, termFreq });
      totalLength += tokens.length;
    }
    this.docs = docs;
    this.docFreq = docFreq;
    this.avgDocLength = docs.length > 0 ? totalLength / docs.length : 0;
  }
  query(query, options = {}) {
    const q = (query || "").trim();
    if (!q) return [];
    const tokens = tokenize(q, this.options);
    if (tokens.length === 0) return [];
    const filteredDocs = this.applyFilters(this.docs, options.filters);
    const k1 = 1.2;
    const b = 0.75;
    const scores = [];
    const docCount = filteredDocs.length || 1;
    for (const doc of filteredDocs) {
      let score = 0;
      for (const rawToken of tokens) {
        const token = normalizeToken(rawToken);
        const df = this.docFreq.get(token) || 0;
        if (!df) continue;
        const tf = doc.termFreq.get(token) || 0;
        if (!tf) continue;
        const idf = Math.log(1 + (docCount - df + 0.5) / (df + 0.5));
        const denom = tf + k1 * (1 - b + b * (doc.length / (this.avgDocLength || 1)));
        score += idf * (tf * (k1 + 1) / denom);
      }
      if (score > 0) scores.push({ doc, score });
    }
    scores.sort((a, b2) => b2.score - a.score);
    const topK = clamp(options.topK ?? 6, 1, 25);
    return scores.slice(0, topK).map(({ doc, score }) => ({
      ...doc.chunk,
      score
    }));
  }
  applyFilters(docs, filters) {
    if (!filters) return docs;
    const docIds = filters.docIds && filters.docIds.length > 0 ? new Set(filters.docIds) : null;
    const sourceFiles = filters.sourceFiles && filters.sourceFiles.length > 0 ? new Set(filters.sourceFiles) : null;
    const types = filters.types && filters.types.length > 0 ? new Set(filters.types) : null;
    const tags = filters.tags && filters.tags.length > 0 ? new Set(filters.tags) : null;
    return docs.filter(({ chunk }) => {
      if (docIds && (!chunk.doc_id || !docIds.has(chunk.doc_id))) return false;
      if (sourceFiles && (!chunk.source_file || !sourceFiles.has(chunk.source_file))) return false;
      if (types && (!chunk.type || !types.has(chunk.type))) return false;
      if (tags && (!chunk.tags || chunk.tags.every((tag) => !tags.has(tag)))) return false;
      return true;
    });
  }
};

// workers/socrataRagBundle.ts
var SOCRATA_RAG_BUNDLE_JSONL = `{"id": "section-purpose-1", "type": "section", "title": "Purpose", "path": ["Discovery API 1.0", "Purpose"], "text": "Purpose\\nOur data platform hosts tens of thousands of government assets. Governments large and small publish data on crime, permits, finance, healthcare, research, performance, and more for citizens to use. While this large corpus of government data is already accessible via opendatanetwork.com, this API opens up this corpus of government data for automated searching, research, and exploration. Assets can be found by keywords, high-level categorizations, tags, and much more. This API is a powerful way to access and explore data on our platform. The production API endpoints for this API are at https://api.us.socrata.com/api/catalog/v1 for domains in North America https://api.eu.socrata.com/api/catalog/v1 for all other domains For example, to query for datasets categorized as 'Public Safety', you could use the following query: http://api.us.socrata.com/api/catalog/v1?categories=public%20safety", "tags": ["section"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "section-asset-visibility-1", "type": "section", "title": "Asset Visibility", "path": ["Discovery API 1.0", "Asset Visibility"], "text": "Asset Visibility\\nThere are four key factors which control whether or not an asset can be viewed anonymously by an unauthenticated user. An asset must meet criteria for all factors which apply to the domain itself (this varies domain-by-domain, as not all domains employ relevant features or modules which utilize these). These factors are: the asset's audience - as public vs internal or private the asset's publication status - as published vs unpublished in a draft state the approval status of the asset - as approved vs pending or rejected whether the asset is hidden - as false i.e. not hidden vs true i.e. hidden", "tags": ["section"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "section-authentication-1", "type": "section", "title": "Authentication", "path": ["Discovery API 1.0", "Authentication"], "text": "Authentication\\nAuthentication is not required to use this API for read-only access to the corpus of anonymously-viewable (i.e. public, published, approved, and not hidden) assets. However, if you wish to search for private, unpublished, unapproved or hidden data, you must authenticate yourself and ensure that you have adequate permissions to view the data in question. To authenticate, you must: Use one of the methods discussed here and Provide the 'X-Socrata-Host' host header with the domain that has granted you access to view its assets. For example 'X-Socrata-Host:data.ny.gov'. When properly authenticated, you will be able to search over: All data that is anonymously-viewable. Any data that you own or that has been shared to you. Private, unpublished, unapproved, and hidden assets from domains that have granted you a right to view such assets.", "tags": ["section"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "section-app-tokens-1", "type": "section", "title": "App Tokens", "path": ["Discovery API 1.0", "App Tokens"], "text": "App Tokens\\nAll programmatic usage of Socrata APIs should include an app token, either via the X-App-Token header or the $$app_token parameters set to a valid token. This is assumed and not documented in the API specs below.", "tags": ["section"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "section-additional-api-facts-1", "type": "section", "title": "Additional API facts", "path": ["Discovery API 1.0", "Additional API facts"], "text": "Additional API facts", "tags": ["section"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "section-additional-api-facts-2", "type": "section", "title": "Additional API facts", "path": ["Discovery API 1.0", "Additional API facts"], "text": "Search without any parameters returns the set of data you are authorized to see. Any parameter usage serves to filter (or sort) this set of data - i.e. no parameters allow you to see more data than a search without parameters. This is important to know when considering parameters that let you search for assets not found in the public catalog. If you are unauthorized to see such things, your results will be empty. Multiple repetitive parameters are treated differently from multiple unique parameters. Unique parameters, for example ?tags=fire&provenance=official filters to the intersection of the values. In this example, the search is for official assets with the tag 'fire'. Repetitive parameters filter to the union of values. For example ?tags=fire&tags=commission searches for assets tagged as either 'fire' or 'commission'. The combination of both repetitive and unique parameters follow the same rules. Thus the query ?tags=fire&tags=commission&provenance=official would search for official assets tagged as either 'fire' or 'commission'. Many parameters support repetitive usage, using either the syntax above or the alternate syntax using brackets, e.g. ?tags[]=fire&tags[]=commission. Parameter descriptions will tell whether this is supported or not. Because this API supports custom metadata search and because custom metadata keys are arbitrary, any unrecognized params are assumed to be custom metadata. Thus, if you misname a parameter, for example ?domain=data.ny.gov (the parameter should be 'domains'), the results will be empty unless there are assets with the custom metadata key 'domain' and value 'data.ny.gov'.", "tags": ["section"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-ids-4x4-find-assets-by-id-summary-1", "type": "endpoint", "title": "Find assets by id", "path": ["Discovery API 1.0", "Find assets by id"], "text": "Find assets by id\\nGET /catalog/v1?ids={4x4}\\nMost assets are uniquely identified by a string known as a four-by-four. This is a string made from eight alphanumeric characters split into two four-character phrases, e.g. ku42-jx2v. While most assets follow this pattern, their drafts do not. Draft IDs join the four-by-four of the published version with a colon and a draft identifier. For stories, which only ever support a single shared draft, the draft's identifier is \\"draft\\". For example, if a draft of story ku42-jx2v is created, its ID would be ku42-jx2v:draft. For non-story drafts, the draft's identifier is an integer. For example, if the 7th draft of asset cio5-yr56 is created, its ID would be cio5-yr56:7. The ids parameter will limit the results to the assets identified in this way.\\nExamples:\\n?ids=ku42-jx2v\\n?ids=ku42-jx2v&ids=ku42-jx2v:draft\\n?ids=cio5-yr56,cio5-yr56:7", "tags": ["endpoint", "get", "/catalog/v1?ids={4x4}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-ids-4x4-find-assets-by-id-req-query-1", "type": "request-params", "title": "Find assets by id", "path": ["Discovery API 1.0", "Find assets by id", "Request", "query"], "text": "Find assets by id - query parameters\\n- ids (string): The four-by-four identifier of an asset. A comma-separated list of IDs is supported. Repeated params are supported.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-ids-4x4-find-assets-by-id-resp-1", "type": "response-fields", "title": "Find assets by id", "path": ["Discovery API 1.0", "Find assets by id", "Response"], "text": "Find assets by id - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-search-context-domain-domains-domain-find-assets-by-domain-summary-1", "type": "endpoint", "title": "Find assets by domain", "path": ["Discovery API 1.0", "Find assets by domain"], "text": "Find assets by domain\\nGET /catalog/v1?search_context={domain}&domains={domain}\\nEach asset is owned by a single domain. The domains and search_context parameters are used to limit the results to the inferred domains. If neither of the domains or search_context are provided, the inferred domains are all domains. Please note, that because of the size of this set, the user will not be authenticated across all of the domains and the user will effectively be treated as an anonymous user. If only a search_context is provided, the inferred domains will include the search_context and any domains which federate data into the search_context. Using this parameter allows you to see the returned data \\"through the eyes\\" of a given domain, e.g. filter and search across their tags/categories/custom metadata. If domains are provided, there is no need to infer domains and the given domains will be searched.\\nExamples:\\n?search_context=data.ny.gov\\n?domains=data.ny.gov\\n?domains=data.ny.gov,data.cityofchicago.org\\n?search_context=data.ny.gov&domains=data.ny.gov,data.cityofchicago.org", "tags": ["endpoint", "get", "/catalog/v1?search_context={domain}&domains={domain}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-search-context-domain-domains-domain-find-assets-by-domain-req-query-1", "type": "request-params", "title": "Find assets by domain", "path": ["Discovery API 1.0", "Find assets by domain", "Request", "query"], "text": "Find assets by domain - query parameters\\n- search_context (string): A domain name that represents the named domain and all incoming federations. Required with category and tag search.\\n- domains (string): The domain name from which an asset comes. A comma-separated list of names is supported. Repeated params are supported.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-search-context-domain-domains-domain-find-assets-by-domain-resp-1", "type": "response-fields", "title": "Find assets by domain", "path": ["Discovery API 1.0", "Find assets by domain", "Response"], "text": "Find assets by domain - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-names-name-find-assets-by-name-summary-1", "type": "endpoint", "title": "Find assets by name", "path": ["Discovery API 1.0", "Find assets by name"], "text": "Find assets by name\\nGET /catalog/v1?names={name}\\nEvery asset is given a name/title. The names parameter will limit results to those having the given name. This filter is case insensitive, but otherwise operates like an exact match. If the exact name is not known, consider using the q parameter to search by query or to autocomplete the name. Keep in mind that spaces and other special characters should be url-encoded.\\nExamples:\\n?names=NYS%20Attorney%20Registrations\\n?names=nys%20attorney%20registrations&names=OpenNY%20Press%20Releases\\n?names[]=NYS%20Attorney%20Registrations &names[]=OpenNY%20Press%20Releases", "tags": ["endpoint", "get", "/catalog/v1?names={name}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-names-name-find-assets-by-name-req-query-1", "type": "request-params", "title": "Find assets by name", "path": ["Discovery API 1.0", "Find assets by name", "Request", "query"], "text": "Find assets by name - query parameters\\n- names (string): The title of an asset. Repeated params, with or without brackets, are supported.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-names-name-find-assets-by-name-resp-1", "type": "response-fields", "title": "Find assets by name", "path": ["Discovery API 1.0", "Find assets by name", "Response"], "text": "Find assets by name - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-search-context-search-context-categories-category-find-assets-by-category-summary-1", "type": "endpoint", "title": "Find assets by category", "path": ["Discovery API 1.0", "Find assets by category"], "text": "Find assets by category\\nGET /catalog/v1?search_context={search_context}&categories={category}\\nEach domain is allowed to customize the categories they use and each asset may be assigned one of these categories or none. The categories parameter will limit the results to those having the given category, but only if the search_context is included.\\nExamples:\\n?search_context=data.ny.gov&categories=Recreation\\n?search_context=data.ny.gov&categories=Recreation&categories=Education\\n?search_context=data.ny.gov &categories[]=Recreation&categories[]=Education", "tags": ["endpoint", "get", "/catalog/v1?search_context={search_context}&categories={category}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-search-context-search-context-categories-category-find-assets-by-category-req-query-1", "type": "request-params", "title": "Find assets by category", "path": ["Discovery API 1.0", "Find assets by category", "Request", "query"], "text": "Find assets by category - query parameters\\n- search_context (string): A domain name that represents the named domain and all incoming federations. Required with category and tag search.\\n- categories (string): The category of an asset. Repeated params, with or without brackets, are supported.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-search-context-search-context-categories-category-find-assets-by-category-resp-1", "type": "response-fields", "title": "Find assets by category", "path": ["Discovery API 1.0", "Find assets by category", "Response"], "text": "Find assets by category - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-search-context-search-context-tags-tag-find-assets-by-tag-summary-1", "type": "endpoint", "title": "Find assets by tag", "path": ["Discovery API 1.0", "Find assets by tag"], "text": "Find assets by tag\\nGET /catalog/v1?search_context={search_context}&tags={tag}\\nEach asset may have none, one or more tags associated with it. The tags parameters will limit the results to those having the given tag, but only if the search_context is included.\\nExamples:\\n?search_context=data.ny.gov&tags=%23environment\\n?search_context=data.ny.gov&tags=%23environment&tags=2017\\n?search_context=data.ny.gov&tags[]=2018&tags[]=2017", "tags": ["endpoint", "get", "/catalog/v1?search_context={search_context}&tags={tag}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-search-context-search-context-tags-tag-find-assets-by-tag-req-query-1", "type": "request-params", "title": "Find assets by tag", "path": ["Discovery API 1.0", "Find assets by tag", "Request", "query"], "text": "Find assets by tag - query parameters\\n- search_context (string): A domain name that represents the named domain and all incoming federations. Required with category and tag search.\\n- tags (string): Any of the tags on an asset. Repeated params, with or without brackets, are supported.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-search-context-search-context-tags-tag-find-assets-by-tag-resp-1", "type": "response-fields", "title": "Find assets by tag", "path": ["Discovery API 1.0", "Find assets by tag", "Response"], "text": "Find assets by tag - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-only-type-find-assets-by-type-summary-1", "type": "endpoint", "title": "Find assets by type", "path": ["Discovery API 1.0", "Find assets by type"], "text": "Find assets by type\\nGET /catalog/v1?only={type}\\nEach asset has a logical type, such as a dataset or chart. The only parameter will limit the results to a particular type. The current taxonomy includes the following types: api, calendar, chart, dataset, federated_href, file, filter, form, href, link, map, measure, story, visualization You may use either the singular or plural variants of each type.\\nExamples:\\n?only=charts\\n?only=charts,maps\\n?only=datasets&only=link\\n?only[]=story&only[]=measure", "tags": ["endpoint", "get", "/catalog/v1?only={type}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-only-type-find-assets-by-type-req-query-1", "type": "request-params", "title": "Find assets by type", "path": ["Discovery API 1.0", "Find assets by type", "Request", "query"], "text": "Find assets by type - query parameters\\n- only (string enum): The datatype of an asset. Singular or plural terms are accepted. A comma-separated list of types is supported. Repeated params, with or without brackets, are supported.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-only-type-find-assets-by-type-resp-1", "type": "response-fields", "title": "Find assets by type", "path": ["Discovery API 1.0", "Find assets by type", "Response"], "text": "Find assets by type - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-custom-metadata-key-value-find-by-domain-specific-metadata-summary-1", "type": "endpoint", "title": "Find by domain-specific metadata", "path": ["Discovery API 1.0", "Find by domain-specific metadata"], "text": "Find by domain-specific metadata\\nGET /catalog/v1?{custom_metadata_key}={value}\\nEach domain has the ability to add custom metadata to datasets beyond the default metadata. This custom metadata is different for every domain, but within a domain, all assets may be labeled with the metadata. The custom metadata is a named set of key-value pairs. For example one domain might have a set named 'Dataset Information' which has keys 'Localities' and 'Agencies & Authorities', while another domain has a set named 'Dataset Category' having key 'Agency'). The caller may restrict the results to a particular custom metadata pair by specifying the parameter name as a combination of the set's name and the key's name and the parameter value as the key's value. To construct the parameter name, join the set's name to the key's name with an underscore and replace all spaces with dashes. Some examples are given in the table below:\\nSet Name\\tField Name\\tParameter Dataset Information\\tLocalities\\t?Dataset-Information_Localities Data Summary\\tUnits\\t?Dataset-Summary_Units Informaci\\u00f3n de la Entidad\\tNombre de la Entidad\\t?Informaci\\u00f3n-de-la-Entidad_Nombre-de-la-Entidad\\nExamples:\\n?Dataset-Information_Localities=Albany%2C+City+of\\n?Dataset-Information_Localities=Albany%2C+City+of&Dataset-Summary_Units=Permits\\n?Dataset-Category_Agency=Office+of+the+Governor", "tags": ["endpoint", "get", "/catalog/v1?{custom_metadata_key}={value}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-custom-metadata-key-value-find-by-domain-specific-metadata-req-query-1", "type": "request-params", "title": "Find by domain-specific metadata", "path": ["Discovery API 1.0", "Find by domain-specific metadata", "Request", "query"], "text": "Find by domain-specific metadata - query parameters\\n- custom-metadata_key (string): The name 'custom-metadata_key' is meant to represent any custom metadata field-set and field. See Find by domain-specific metadata for more details.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-custom-metadata-key-value-find-by-domain-specific-metadata-resp-1", "type": "response-fields", "title": "Find by domain-specific metadata", "path": ["Discovery API 1.0", "Find by domain-specific metadata", "Response"], "text": "Find by domain-specific metadata - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-attribution-organization-find-assets-by-attribution-summary-1", "type": "endpoint", "title": "Find assets by attribution", "path": ["Discovery API 1.0", "Find assets by attribution"], "text": "Find assets by attribution\\nGET /catalog/v1?attribution={organization}\\nAssets can be attributed to various organizations. The attribution parameter will limit the results to those attributed to the given organization.\\nExamples:\\n?attribution=New%20York%20State%20Gaming%20Commission\\n?attribution=Texas%20Comptroller%20of%20Public%20Accounts", "tags": ["endpoint", "get", "/catalog/v1?attribution={organization}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-attribution-organization-find-assets-by-attribution-req-query-1", "type": "request-params", "title": "Find assets by attribution", "path": ["Discovery API 1.0", "Find assets by attribution", "Request", "query"], "text": "Find assets by attribution - query parameters\\n- attribution (string): The case-sensitive name of the attributing entity.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-attribution-organization-find-assets-by-attribution-resp-1", "type": "response-fields", "title": "Find assets by attribution", "path": ["Discovery API 1.0", "Find assets by attribution", "Response"], "text": "Find assets by attribution - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-license-license-find-assets-by-license-summary-1", "type": "endpoint", "title": "Find assets by license", "path": ["Discovery API 1.0", "Find assets by license"], "text": "Find assets by license\\nGET /catalog/v1?license={license}\\nAssets can be released under various licenses. The license parameter will limit the results to those with the given license.\\nExamples:\\n?license=Public%20Domain\\n?license= Creative%20Commons%201.0%20Universal%20(Public%20Domain%20Dedication)", "tags": ["endpoint", "get", "/catalog/v1?license={license}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-license-license-find-assets-by-license-req-query-1", "type": "request-params", "title": "Find assets by license", "path": ["Discovery API 1.0", "Find assets by license", "Request", "query"], "text": "Find assets by license - query parameters\\n- license (string): The case-sensitive license name.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-license-license-find-assets-by-license-resp-1", "type": "response-fields", "title": "Find assets by license", "path": ["Discovery API 1.0", "Find assets by license", "Response"], "text": "Find assets by license - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-q-query-min-should-match-match-term-find-assets-by-query-term-summary-1", "type": "endpoint", "title": "Find assets by query term", "path": ["Discovery API 1.0", "Find assets by query term"], "text": "Find assets by query term\\nGET /catalog/v1?q={query}&min_should_match={match_term}\\nAssets may be searched by any of the text found in the name, description, category, tags, column names, column fieldnames, column descriptions, attribution fields. The q parameter takes arbitrary text and will limit the results to those having some or all of the text. The optional min_should_match parameter may be used to explicitly specify the number or percent of words that must match. See the Elasticsearch docs for the format of arguments to min_should_match. If min_should_match is not specified, the service's default is '3<60%', meaning that if there are 3 or fewer search terms specified, all of them must match; otherwise 60% of the search terms must be found in the fields specified above. For example, if min_should_match is '3<60%', searching for\\n'city dog park' will require stemmed matches for all three words; thus, 'Western Cities Association Dog Parks' will match, but 'New York City Parks' will not. 'trees green spaces new york' will require 60% of the words to match, which is 3 out of 5 words. Thus, 'New York Tree Map', and 'New Green Spaces Initiative' will both match.\\nExamples:\\n?q=result\\n?q=school%20result%20SAT\\n?q=school%20result%20SAT&min_should_match=-1", "tags": ["endpoint", "get", "/catalog/v1?q={query}&min_should_match={match_term}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-q-query-min-should-match-match-term-find-assets-by-query-term-req-query-1", "type": "request-params", "title": "Find assets by query term", "path": ["Discovery API 1.0", "Find assets by query term", "Request", "query"], "text": "Find assets by query term - query parameters\\n- q (string): For search, a token matching one from an asset's name, description, category, tags, column names, column fieldnames, column descriptions or attribution.\\n- min_should_match (string): The number or percent of words that must match. Acceptable formats are defined here.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-q-query-min-should-match-match-term-find-assets-by-query-term-resp-1", "type": "response-fields", "title": "Find assets by query term", "path": ["Discovery API 1.0", "Find assets by query term", "Response"], "text": "Find assets by query term - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-parent-ids-4x4-find-assets-by-parent-id-summary-1", "type": "endpoint", "title": "Find assets by parent id", "path": ["Discovery API 1.0", "Find assets by parent id"], "text": "Find assets by parent id\\nGET /catalog/v1?parent_ids={4x4}\\nSome assets are uploaded directly and others are created from already existing data. For example, charts are derived from an existing parent dataset. The parent_ids parameter will limit the results to those having the parent dataset ids given.\\nExamples:\\n?parent_ids=nqur-w4p7\\n?parent_ids=nqur-w4p7&parent_ids=qzve-kjga\\n?parent_ids=nqur-w4p7,qzve-kjga", "tags": ["endpoint", "get", "/catalog/v1?parent_ids={4x4}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-parent-ids-4x4-find-assets-by-parent-id-req-query-1", "type": "request-params", "title": "Find assets by parent id", "path": ["Discovery API 1.0", "Find assets by parent id", "Request", "query"], "text": "Find assets by parent id - query parameters\\n- parent_ids (string): The four-by-four identifier of a parent asset having child assets. A comma-separated list of IDs is supported. Repeated params are supported.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-parent-ids-4x4-find-assets-by-parent-id-resp-1", "type": "response-fields", "title": "Find assets by parent id", "path": ["Discovery API 1.0", "Find assets by parent id", "Response"], "text": "Find assets by parent id - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-derived-from-4x4-find-assets-derived-from-others-summary-1", "type": "endpoint", "title": "Find assets derived from others", "path": ["Discovery API 1.0", "Find assets derived from others"], "text": "Find assets derived from others\\nGET /catalog/v1?derived_from={4x4}\\nSome assets are uploaded directly and others are created from or use other data. For example, charts are derived from an existing parent dataset and stories may then incorporate those charts. Measures may also incorporate one or more datasets. The derived_from parameter will limit the results to those that derive from the given dataset.\\nExamples:\\n?derived_from=8f6m-78bg", "tags": ["endpoint", "get", "/catalog/v1?derived_from={4x4}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-derived-from-4x4-find-assets-derived-from-others-req-query-1", "type": "request-params", "title": "Find assets derived from others", "path": ["Discovery API 1.0", "Find assets derived from others", "Request", "query"], "text": "Find assets derived from others - query parameters\\n- derived_from (string): The four-by-four identifier of an asset from which other assets are derived.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-derived-from-4x4-find-assets-derived-from-others-resp-1", "type": "response-fields", "title": "Find assets derived from others", "path": ["Discovery API 1.0", "Find assets derived from others", "Response"], "text": "Find assets derived from others - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-provenance-provenance-find-by-provenance-summary-1", "type": "endpoint", "title": "Find by provenance", "path": ["Discovery API 1.0", "Find by provenance"], "text": "Find by provenance\\nGET /catalog/v1?provenance={provenance}\\nWhile many assets on our platform are owned by government data publishers and other staff, some visualizations, maps, filtered views, and more are created by a member of the community. These assets are usually denoted with a 'Community' badge on the data catalog. A provenance=official parameter will limit the results to official assets, i.e. those owned by roled users on the domain. A provenance=community parameter will limit the results to community created assets.\\nExamples:\\n?provenance=official\\n?provenance=community", "tags": ["endpoint", "get", "/catalog/v1?provenance={provenance}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-provenance-provenance-find-by-provenance-req-query-1", "type": "request-params", "title": "Find by provenance", "path": ["Discovery API 1.0", "Find by provenance", "Request", "query"], "text": "Find by provenance - query parameters\\n- provenance (string enum): The provenance of an asset.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-provenance-provenance-find-by-provenance-resp-1", "type": "response-fields", "title": "Find by provenance", "path": ["Discovery API 1.0", "Find by provenance", "Response"], "text": "Find by provenance - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-for-user-4x4-find-by-owner-summary-1", "type": "endpoint", "title": "Find by owner", "path": ["Discovery API 1.0", "Find by owner"], "text": "Find by owner\\nGET /catalog/v1?for_user={4x4}\\nEach asset has an owner, which may be a user or a team. The for_user parameter will limit the results to those owned by the user or team having the provided four-by-four identifier.\\nExamples:\\n?for_user=xzik-pf59\\n?for_user=xzik-pf59,fpiq-yg3w\\n?for_user=xzik-pf59&for_user=fpiq-yg3w", "tags": ["endpoint", "get", "/catalog/v1?for_user={4x4}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-for-user-4x4-find-by-owner-req-query-1", "type": "request-params", "title": "Find by owner", "path": ["Discovery API 1.0", "Find by owner", "Request", "query"], "text": "Find by owner - query parameters\\n- for_user (string): The four-by-four identifier of a user who owns data. A comma-separated list of IDs is supported. Repeated params are supported.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-for-user-4x4-find-by-owner-resp-1", "type": "response-fields", "title": "Find by owner", "path": ["Discovery API 1.0", "Find by owner", "Response"], "text": "Find by owner - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-search-context-domain-shared-to-4x4-find-by-granted-shares-summary-1", "type": "endpoint", "title": "Find by granted shares", "path": ["Discovery API 1.0", "Find by granted shares"], "text": "Find by granted shares\\nGET /catalog/v1?search_context={domain}&shared_to={4x4}\\nEach asset may be shared to teams or individual users. The shared_to param allows you to specify four-by-four identifier of a user or team and the results will be limited to those which were shared to them. Please note:\\nIf you are not an administrator, you may only specify yourself as the user to whom assets are shared. If you are not an administrator, you may only specify teams that you are on (as a member or an owner) as the teams to which assets are shared. If you are an administrator, you may see what's shared to any user or team on the domain where you are an administrator. You must include the domain name with the search_context parameter. If you search for assets shared to you, with or without assets shared to your teams, assets owned by you will be filtered out. You must authenticate in order to see any assets when using this param.\\nExamples:\\n?search_context=data.ny.gov&shared_to=xzik-pf59\\n?search_context=data.ny.gov&shared_to=8xiq-st2k,xzik-pf59\\n?search_context=data.ny.gov&shared_to=8xiq-st2k&shared_to=xzik-pf59", "tags": ["endpoint", "get", "/catalog/v1?search_context={domain}&shared_to={4x4}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-search-context-domain-shared-to-4x4-find-by-granted-shares-req-query-1", "type": "request-params", "title": "Find by granted shares", "path": ["Discovery API 1.0", "Find by granted shares", "Request", "query"], "text": "Find by granted shares - query parameters\\n- shared_to (string): The four-by-four identifier of a user who is shared data. A comma-separated list of IDs is supported. Repeated params are supported.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-search-context-domain-shared-to-4x4-find-by-granted-shares-resp-1", "type": "response-fields", "title": "Find by granted shares", "path": ["Discovery API 1.0", "Find by granted shares", "Response"], "text": "Find by granted shares - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-column-names-name-find-by-column-name-summary-1", "type": "endpoint", "title": "Find by column name", "path": ["Discovery API 1.0", "Find by column name"], "text": "Find by column name\\nGET /catalog/v1?column_names={name}\\nTabular assets are composed of rows and columns. The column_names parameter will limit the results to those having the given column names. The search is case insensitive, but otherwise looks for an exact match. Keep in mind that spaces and other special characters should be url-encoded.\\nExamples:\\n?column_names=Winning%20numbers\\n?column_names=Winning%20numbers&column_names=Draw%20Date\\n?column_names[]=winning%20NUMBERS&column_names[]=draw%20date", "tags": ["endpoint", "get", "/catalog/v1?column_names={name}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-column-names-name-find-by-column-name-req-query-1", "type": "request-params", "title": "Find by column name", "path": ["Discovery API 1.0", "Find by column name", "Request", "query"], "text": "Find by column name - query parameters\\n- column_names (string): The name of a column within a dataset. Repeated params, with or without brackets, are supported.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-column-names-name-find-by-column-name-resp-1", "type": "response-fields", "title": "Find by column name", "path": ["Discovery API 1.0", "Find by column name", "Response"], "text": "Find by column name - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-visibility-visibility-show-visibility-true-false-find-by-visibility-summary-1", "type": "endpoint", "title": "Find by visibility", "path": ["Discovery API 1.0", "Find by visibility"], "text": "Find by visibility\\nGET /catalog/v1?visibility={visibility}&show_visibility={true|false}\\nWhile many assets on our platform are discoverable and accessible via the open data catalog, others are held internally for government use. A visibility=open parameter will limit the results to only those that would show in the public catalog. A visibility=internal parameter will limit the results to those held internally, but note that only authenticated users who have sufficient rights and provide either a search_context or domains parameter will receive results. As discussed in the \\"Asset Visibility\\" at the beginning of this documentation, this visibility status is a product of four factors. This parameter is thus a convenience parameter where a 'open' value corresponds to\\naudience=public&published=true&approval_status=approved&explicitly_hidden=false.\\nBy default, visibility information is not included on the returned assets. To have it returned, attach a show_visibility=true parameter.\\nExamples:\\n?visibility=open\\n?visibility=open&show_visibility=true\\n?search_context=data.texas.gov&visibility=internal", "tags": ["endpoint", "get", "/catalog/v1?visibility={visibility}&show_visibility={true|false}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-visibility-visibility-show-visibility-true-false-find-by-visibility-req-query-1", "type": "request-params", "title": "Find by visibility", "path": ["Discovery API 1.0", "Find by visibility", "Request", "query"], "text": "Find by visibility - query parameters\\n- visibility (string enum): The visibility of an asset.\\n- show_visibility (boolean): Whether to include visibility information in the response.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-visibility-visibility-show-visibility-true-false-find-by-visibility-resp-1", "type": "response-fields", "title": "Find by visibility", "path": ["Discovery API 1.0", "Find by visibility", "Response"], "text": "Find by visibility - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-audience-audience-find-by-audience-summary-1", "type": "endpoint", "title": "Find by audience", "path": ["Discovery API 1.0", "Find by audience"], "text": "Find by audience\\nGET /catalog/v1?audience={audience}\\nThe audience is the first of four factors which control an asset\\u2019s visibility. Each asset has one of three different audiences. These include:\\nprivate if the asset is only visible to the owner and any individuals the owner has shared the asset to site if the asset is visible to all members of a site/domain public if the asset is visible to anyone, within or outside the site/domain Only the audience=public parameter may be used by any user. The audience=site and audience=private parameters are only available to authenticated users who have sufficient rights and provide either a search_context or domains parameter, else a 401 error is returned.\\nExamples:\\n?audience=public\\n?search_context=data.texas.gov&audience=site\\n?domains=data.texas.gov&audience=private", "tags": ["endpoint", "get", "/catalog/v1?audience={audience}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-audience-audience-find-by-audience-req-query-1", "type": "request-params", "title": "Find by audience", "path": ["Discovery API 1.0", "Find by audience", "Request", "query"], "text": "Find by audience - query parameters\\n- audience (string enum): The audience of an asset.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-audience-audience-find-by-audience-resp-1", "type": "response-fields", "title": "Find by audience", "path": ["Discovery API 1.0", "Find by audience", "Response"], "text": "Find by audience - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-published-true-false-find-by-publication-status-summary-1", "type": "endpoint", "title": "Find by publication status", "path": ["Discovery API 1.0", "Find by publication status"], "text": "Find by publication status\\nGET /catalog/v1?published={true|false}\\nThe publication status of each asset is the second of four factors which control an asset\\u2019s visibility. A published=true parameter will limit the results to those that are published; A published=false parameter will limit the results to those that are unpublished, but note that only authenticated users who have sufficient rights and provide a search_context or domains parameter will receive results.\\nExamples:\\n?published=true\\n?search_context=data.texas.gov&published=false", "tags": ["endpoint", "get", "/catalog/v1?published={true|false}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-published-true-false-find-by-publication-status-req-query-1", "type": "request-params", "title": "Find by publication status", "path": ["Discovery API 1.0", "Find by publication status", "Request", "query"], "text": "Find by publication status - query parameters\\n- published (boolean): Whether the asset is published or not.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-published-true-false-find-by-publication-status-resp-1", "type": "response-fields", "title": "Find by publication status", "path": ["Discovery API 1.0", "Find by publication status", "Response"], "text": "Find by publication status - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-explicitly-hidden-true-false-find-hidden-unhidden-assets-summary-1", "type": "endpoint", "title": "Find hidden/unhidden assets", "path": ["Discovery API 1.0", "Find hidden/unhidden assets"], "text": "Find hidden/unhidden assets\\nGET /catalog/v1?explicitly_hidden={true|false}\\nThe hidden status of each asset is the third of four factors which control an asset\\u2019s visibility. Some sites selectively and explicitly hide certain assets from their public catalog for different reasons. A explicitly_hidden=false parameter will limit the results to those that are not hidden. A explicitly_hidden=true parameter will limit the results to those that are hidden, but note that only authenticated users who have sufficient rights and provide a search_context or domains parameter will receive results.\\nExamples:\\n?explicitly_hidden=false\\n?search_context=data.texas.gov&explicitly_hidden=true", "tags": ["endpoint", "get", "/catalog/v1?explicitly_hidden={true|false}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-explicitly-hidden-true-false-find-hidden-unhidden-assets-req-query-1", "type": "request-params", "title": "Find hidden/unhidden assets", "path": ["Discovery API 1.0", "Find hidden/unhidden assets", "Request", "query"], "text": "Find hidden/unhidden assets - query parameters\\n- explicitly_hidden (boolean): Whether the asset is hidden from the public catalog or not.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-explicitly-hidden-true-false-find-hidden-unhidden-assets-resp-1", "type": "response-fields", "title": "Find hidden/unhidden assets", "path": ["Discovery API 1.0", "Find hidden/unhidden assets", "Response"], "text": "Find hidden/unhidden assets - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-approval-status-approved-rejected-pending-not-ready-target-audience-public-internal-find-by-approval-status-summary-1", "type": "endpoint", "title": "Find by approval status", "path": ["Discovery API 1.0", "Find by approval status"], "text": "Find by approval status\\nGET /catalog/v1?approval_status={approved|rejected|pending|not_ready}&target_audience={public|internal}\\nThe approval status of each asset is the fourth of four factors which control an asset\\u2019s visibility. Assets must be approved in order to become anonymously or internally viewable. At any point in time, the status of these views may be 'pending', 'rejected', 'approved' or 'not_ready' (to be approved) for either of the public or internal audiences. The approval_status parameter accepts one of those values and will limit the results to those assets with the given state. The target_audience parameter accepts either 'public' or 'internal' and further limits the results to those with the given approvals status destined for the given target audience. Note that no results will be returned when searching for rejected, pending or not_ready approval statuses unless the data is already anonymously viewable or the user has authenticated and provided a search_context or domains parameter.\\nExamples:\\n?approval_status=approved\\n?approval_status=approved&target_audience=public\\n?domains=data.ny.gov&approval_status=rejected,pending\\n?domains=data.ny.gov&approval_status=rejected&approval_status=approved\\n?domains=data.ny.gov&approval_status[]=rejected &approval_status[]=approved\\n?search_context=datahub.hhs.gov&approval_status=not_ready &target_audience=internal", "tags": ["endpoint", "get", "/catalog/v1?approval_status={approved|rejected|pending|not_ready}&target_audience={public|internal}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-approval-status-approved-rejected-pending-not-ready-target-audience-public-internal-find-by-approval-status-summary-2", "type": "endpoint", "title": "Find by approval status", "path": ["Discovery API 1.0", "Find by approval status"], "text": "?search_context=datahub.hhs.gov&approval_status=approved &target_audience[]=public&target_audience[]=internal", "tags": ["endpoint", "get", "/catalog/v1?approval_status={approved|rejected|pending|not_ready}&target_audience={public|internal}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-approval-status-approved-rejected-pending-not-ready-target-audience-public-internal-find-by-approval-status-req-query-1", "type": "request-params", "title": "Find by approval status", "path": ["Discovery API 1.0", "Find by approval status", "Request", "query"], "text": "Find by approval status - query parameters\\n- approval_status (string enum): The internal or public approval status of an asset. Combine with a target_audience=public or target_audience=internal parameter to limit to the approval status of public-bound or internal-bound data. A comma-separated list of statuses is supported. Repeated params, with or without brackets, are supported.\\n- target_audience (string enum): The audience a submitted asset desires if approved. Combine with the approval_status parameter to limit to particular stages of the approval process. A comma-separated list of statuses is supported. Repeated params, with or without brackets, are supported.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-approval-status-approved-rejected-pending-not-ready-target-audience-public-internal-find-by-approval-status-resp-1", "type": "response-fields", "title": "Find by approval status", "path": ["Discovery API 1.0", "Find by approval status", "Response"], "text": "Find by approval status - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-submitter-id-4x4-find-by-submitter-summary-1", "type": "endpoint", "title": "Find by submitter", "path": ["Discovery API 1.0", "Find by submitter"], "text": "Find by submitter\\nGET /catalog/v1?submitter_id={4x4}\\nFor assets that have been submitted for approval and are currently pending, rejected or approved, the 'submitter_id' parameter accepts the submitting user's four-by-four identifier and will limit the results to those assets which have been submitted by that user.\\nExamples:\\n?submitter_id=xzik-pf59", "tags": ["endpoint", "get", "/catalog/v1?submitter_id={4x4}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-submitter-id-4x4-find-by-submitter-req-query-1", "type": "request-params", "title": "Find by submitter", "path": ["Discovery API 1.0", "Find by submitter", "Request", "query"], "text": "Find by submitter - query parameters\\n- submitter_id (string): The four-by-four identifier of a user who has submitted an asset for approval.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-submitter-id-4x4-find-by-submitter-resp-1", "type": "response-fields", "title": "Find by submitter", "path": ["Discovery API 1.0", "Find by submitter", "Response"], "text": "Find by submitter - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-reviewer-id-4x4-find-by-reviewer-summary-1", "type": "endpoint", "title": "Find by reviewer", "path": ["Discovery API 1.0", "Find by reviewer"], "text": "Find by reviewer\\nGET /catalog/v1?reviewer_id={4x4}\\nFor assets that have been submitted for approval and reviewed, and are currently rejected or approved, the 'reviewer_id' parameter accepts the reviewing user's four-by-four identifier and will limit the results to those assets which have been reviewed by that user.\\nExamples:\\n?reviewer_id=r4qn-dwdd", "tags": ["endpoint", "get", "/catalog/v1?reviewer_id={4x4}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-reviewer-id-4x4-find-by-reviewer-req-query-1", "type": "request-params", "title": "Find by reviewer", "path": ["Discovery API 1.0", "Find by reviewer", "Request", "query"], "text": "Find by reviewer - query parameters\\n- reviewer_id (string): The four-by-four identifier of a user who has submitted an asset for approval.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-reviewer-id-4x4-find-by-reviewer-resp-1", "type": "response-fields", "title": "Find by reviewer", "path": ["Discovery API 1.0", "Find by reviewer", "Response"], "text": "Find by reviewer - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-derived-true-false-find-derived-base-assets-summary-1", "type": "endpoint", "title": "Find derived/base assets", "path": ["Discovery API 1.0", "Find derived/base assets"], "text": "Find derived/base assets\\nGET /catalog/v1?derived={true|false}\\nSome assets are uploaded directly and others are created from already existing data. For example, charts are derived from an existing parent dataset. The derived parameter will limit the results to one or other of these classes of data. A 'true' value finds derived assets and a 'false' value finds base assets.\\nExamples:\\n?derived=true\\n?derived=false", "tags": ["endpoint", "get", "/catalog/v1?derived={true|false}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-derived-true-false-find-derived-base-assets-req-query-1", "type": "request-params", "title": "Find derived/base assets", "path": ["Discovery API 1.0", "Find derived/base assets", "Request", "query"], "text": "Find derived/base assets - query parameters\\n- derived (boolean): Whether the asset was derived from another or uploaded directly.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-derived-true-false-find-derived-base-assets-resp-1", "type": "response-fields", "title": "Find derived/base assets", "path": ["Discovery API 1.0", "Find derived/base assets", "Response"], "text": "Find derived/base assets - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-order-sort-order-sort-results-summary-1", "type": "endpoint", "title": "Sort results", "path": ["Discovery API 1.0", "Sort results"], "text": "Sort results\\nGET /catalog/v1?order={sort_order}\\nThe results of all the above filters can be sorted by any of the attributes in the list below. If not specified, the results are sorted by relevance. All sort values can optionally append a space and either 'ASC' or 'DESC' for ascending or descending sorts, but note that the space must be URL-escaped with '+' or '%20'. The default for each attribute is given in the table. It is possible for search results to have missing values for some of these sort fields (such as 'domain_category', for example). Any assets missing a value altogether for the field being sorted on will show up at the end of the results list.\\nAttribute\\tDefault Sort Order relevance (default)\\tdescending name\\tascending owner\\tascending dataset_id\\tascending datatype\\tascending domain_category\\tascending createdAt\\tdescending updatedAt\\tdescending page_views_total\\tdescending page_views_last_month\\tdescending page_views_last_week\\tdescending\\nExamples:\\n?order=name\\n?order=dataset_id%20ASC\\norder=page_views_total+DESC", "tags": ["endpoint", "get", "/catalog/v1?order={sort_order}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-order-sort-order-sort-results-req-query-1", "type": "request-params", "title": "Sort results", "path": ["Discovery API 1.0", "Sort results", "Request", "query"], "text": "Sort results - query parameters\\n- order (string enum): The field to sort assets by. Optionally append a space and 'ASC' or 'DESC' to direct the sort.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-order-sort-order-sort-results-resp-1", "type": "response-fields", "title": "Sort results", "path": ["Discovery API 1.0", "Sort results", "Response"], "text": "Sort results - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-limit-number-offset-number-paginate-results-summary-1", "type": "endpoint", "title": "Paginate results", "path": ["Discovery API 1.0", "Paginate results"], "text": "Paginate results\\nGET /catalog/v1?limit={number}&offset={number}\\nThe search service allows pagination of results. By default, we will return at most 100 results starting from 0. Using the limit and offset params will return at most {limit} results starting from {offset}.\\nIf the sum of the offset and limit parameters is greater than 10000, the server will respond with a 400. If your use-case involves scanning over a large set of results, you will want to use the scroll_id parameter in conjunction with the limit parameter. For more detail, refer to Deep scrolling results.\\nExamples:\\n?limit=10&offset=0\\n?limit=10&offset=10\\n?limit=10&offset=20", "tags": ["endpoint", "get", "/catalog/v1?limit={number}&offset={number}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-limit-number-offset-number-paginate-results-req-query-1", "type": "request-params", "title": "Paginate results", "path": ["Discovery API 1.0", "Paginate results", "Request", "query"], "text": "Paginate results - query parameters\\n- limit (number): The max number of results to return.\\n- Constraints: Range: [0,10000] (offset): number The starting point for paging.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-limit-number-offset-number-paginate-results-resp-1", "type": "response-fields", "title": "Paginate results", "path": ["Discovery API 1.0", "Paginate results", "Response"], "text": "Paginate results - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-limit-number-scroll-id-id-deep-scroll-results-summary-1", "type": "endpoint", "title": "Deep scroll results", "path": ["Discovery API 1.0", "Deep scroll results"], "text": "Deep scroll results\\nGET /catalog/v1?limit={number}&scroll_id={id}\\nThe search API is optimized for the prototypical use-case -- namely, providing some queries or filter conditions, and retrieving a relatively small number of search results. As a result, the search service does not support paging over a large set of search results. Specifically, if the sum of the offset and limit parameters is greater than 10000, the server will respond with a 400. This will happen regardless of the actual result set size. Larger result sets can be incrementally paged over via the scroll_id parameter.\\nThis parameter takes a value corresponding to an asset ID, specifically, the ID of the last result in the previously fetched chunk of results. So for example, suppose you execute a query and find that it returns a large set of results (ie. more than 10000). You should execute the same query again, including a reasonable value for the limit parameter, being sure to include the scroll_id parameter as well. Initially, you won't have a value for the scroll_id parameter, so you will leave it blank. But with each subsequent request, you should pass the asset id corresponding to the last result from the previously fetched batch of results.", "tags": ["endpoint", "get", "/catalog/v1?limit={number}&scroll_id={id}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-limit-number-scroll-id-id-deep-scroll-results-summary-2", "type": "endpoint", "title": "Deep scroll results", "path": ["Discovery API 1.0", "Deep scroll results"], "text": "Note that sorting parameters are not honored when used in conjunction with deep scrolling via the scroll_id parameter. If the order or offset parameters are specified at the same time as the scroll_id parameter, the server will respond with a 400.\\nExamples:\\n?limit=100&scroll_id\\n?limit=100&scroll_id=6rrk-xbdr", "tags": ["endpoint", "get", "/catalog/v1?limit={number}&scroll_id={id}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-limit-number-scroll-id-id-deep-scroll-results-req-query-1", "type": "request-params", "title": "Deep scroll results", "path": ["Discovery API 1.0", "Deep scroll results", "Request", "query"], "text": "Deep scroll results - query parameters\\n- limit (number): The max number of results to return.\\n- Constraints: Range: [0,10000] (scroll_id): string Initially empty, but afterwards, the four-by-four identifier of the final asset in the current results.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-limit-number-scroll-id-id-deep-scroll-results-resp-1", "type": "response-fields", "title": "Deep scroll results", "path": ["Discovery API 1.0", "Deep scroll results", "Response"], "text": "Deep scroll results - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-boost-key-number-boost-assets-summary-1", "type": "endpoint", "title": "Boost assets", "path": ["Discovery API 1.0", "Boost assets"], "text": "Boost assets\\nGET /catalog/v1?boost{key}={number}\\nIt is possible to adjust the rankings of assets to promote them above others. This leverages the weight function of function score queries. This weight acts as a multiplier for the relevance score of each document. Thus, a number between 0 and 1 will demote assets, while any number greater than 1 will boost them.\\nSeveral parameters allow for different types of boosting. Some notes about the table below:\\nThe Explanation assumes a greater than 1 value Where you see {variable_name} in the Parameter, that requires substituting in a value. See the examples below. The boost params boostTitle, boostDesc and boostColumns work in conjunction with the q param Parameter\\tExplanation boostOfficial\\tOfficial assets boosted; community assets not boost{Datatype}\\tAssets having the given {Datatype} boosted; others not boostDomains[{DomainName}]\\tAssets from the given {DomainName} boosted; others not boostTitle\\tAssets with titles matching the 'q' query boosted; others not boostDesc\\tAssets with descriptions matching the 'q' query boosted; others not boostColumns\\tAssets with column names matching the 'q' query boosted; others not\\nExamples:\\n?boostOfficial=3.6\\n?boostStories=2&boostMaps=3\\n?boostDomains[data.ny.gov]=2\\n?boostTitle=2&q=Lotto\\n?boostDesc=1.5&q=hospitalizations\\n?boostColumns=5.67&q=vendor", "tags": ["endpoint", "get", "/catalog/v1?boost{key}={number}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-boost-key-number-boost-assets-req-query-1", "type": "request-params", "title": "Boost assets", "path": ["Discovery API 1.0", "Boost assets", "Request", "query"], "text": "Boost assets - query parameters\\n- boostOfficial (number): Multiplier for the relevance score of official assets.\\n- boost{Datatype} (number): Multiplier for the relevance score of assets with the given {Datatype}. A parameter name for example is boostStories or boostMaps.\\n- boostDomains[{DomainName}] (number): Multiplier for the relevance score of assets from the given {DomainName}. A parameter name for example is boostDomains[data.ny.gov] or boostDomains[data.texas.gov].\\n- boostTitle (number): Multiplier for the relevance score of assets having a title that matches the given query. Use with the q parameter to define the query.\\n- boostDesc (number): Multiplier for the relevance score of assets having a description that matches the given query. Use with the q parameter to define the query.\\n- boostDesc (number): Multiplier for the relevance score of assets having column names that matches the given query. Use with the q parameter to define the query.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-boost-key-number-boost-assets-resp-1", "type": "response-fields", "title": "Boost assets", "path": ["Discovery API 1.0", "Boost assets", "Response"], "text": "Boost assets - response fields\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-autocomplete-q-query-deduplicate-true-false-autocomplete-asset-names-summary-1", "type": "endpoint", "title": "Autocomplete asset names", "path": ["Discovery API 1.0", "Autocomplete asset names"], "text": "Autocomplete asset names\\nGET /catalog/v1/autocomplete?q={query}&deduplicate={true|false}\\nThe Discovery API supports autocomplete of asset names and tags. Using the autocomplete endpoint for asset names returns assets having titles that match the search query. Any of the filtering parameters described above may be used with the required q parameter. Note that while this endpoint mirrors the top-level search endpoint, the behavior of the q parameter differs slightly. Just as with the full search endpoint, it takes arbitrary text. However, the autocomplete search is restricted to the 'name' field of the asset (i.e. the asset title). Additionally, this autocomplete search can return different assets than the top-level search. An simplified explanation is that the former matches characters while the latter matches words.\\nAn additional and optional parameter, deduplicate, provides two different behaviors. If 'true', no asset title will appear more than once. If 'false', every matching asset is returned along with its four-by-four identifier.\\nExamples:\\n?q=medi\\n?q=medi&deduplicate=true\\n?q=medi&deduplicate=false", "tags": ["endpoint", "get", "/catalog/v1/autocomplete?q={query}&deduplicate={true|false}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-autocomplete-q-query-deduplicate-true-false-autocomplete-asset-names-req-query-1", "type": "request-params", "title": "Autocomplete asset names", "path": ["Discovery API 1.0", "Autocomplete asset names", "Request", "query"], "text": "Autocomplete asset names - query parameters\\n- q (string): For search, a token matching one from an asset's name, description, category, tags, column names, column fieldnames, column descriptions or attribution.\\n- deduplicate (boolean): Whether the results returned from autocomplete return distinct titles or not. When 'false', asset ids are returned in addition to the typical response.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-autocomplete-q-query-deduplicate-true-false-autocomplete-asset-names-resp-1", "type": "response-fields", "title": "Autocomplete asset names", "path": ["Discovery API 1.0", "Autocomplete asset names", "Response"], "text": "Autocomplete asset names - response fields\\n- title (string): The raw title of the matching asset.\\n  note: MatchOffsets An array of indices defining the location of the match.\\n- start (number): Where the matched query term starts, as a character count, in the associated asset field.\\n- length (number): The number of characters the matched query term has.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-tags-autocomplete-q-query-autocomplete-asset-tags-summary-1", "type": "endpoint", "title": "Autocomplete asset tags", "path": ["Discovery API 1.0", "Autocomplete asset tags"], "text": "Autocomplete asset tags\\nGET /catalog/v1/tags/autocomplete?q={query}\\nThe Discovery API supports autocomplete of asset names and tags. Using the autocomplete endpoint for tags returns assets having tags that match the search query. Any of the filtering parameters described above may be used with the required q parameter. Note that while this endpoint mirrors the top-level search endpoint, the behavior of the q parameter differs slightly. Just as with the full search endpoint, it takes arbitrary text. However, the autocomplete search is restricted to the 'tags' field of the asset.\\nExamples:\\n?q=medi", "tags": ["endpoint", "get", "/catalog/v1/tags/autocomplete?q={query}"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-tags-autocomplete-q-query-autocomplete-asset-tags-req-query-1", "type": "request-params", "title": "Autocomplete asset tags", "path": ["Discovery API 1.0", "Autocomplete asset tags", "Request", "query"], "text": "Autocomplete asset tags - query parameters\\n- q (string): For search, a token matching one from an asset's name, description, category, tags, column names, column fieldnames, column descriptions or attribution.", "tags": ["request", "query"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-tags-autocomplete-q-query-autocomplete-asset-tags-resp-1", "type": "response-fields", "title": "Autocomplete asset tags", "path": ["Discovery API 1.0", "Autocomplete asset tags", "Response"], "text": "Autocomplete asset tags - response fields\\n- tag_text (string): The tag of the matching asset.\\n  note: MatchOffsets An array of indices defining the location of the match.\\n- start (number): Where the matched query term starts, as a character count, in the associated asset field.\\n- length (number): The number of characters the matched query term has.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domains-count-assets-by-domain-summary-1", "type": "endpoint", "title": "Count assets by domain", "path": ["Discovery API 1.0", "Count assets by domain"], "text": "Count assets by domain\\nGET /catalog/v1/domains\\nThis endpoint mirrors the top-level endpoint, accepting any of the filtering params described above. It returns the count of assets matching the query grouped by domain. Providing no parameters returns the count of assets the user is able to view, subject to authentication, grouped by domain.\\nExamples:\\n?\\n?audience=public&q=dog\\n?only=maps", "tags": ["endpoint", "get", "/catalog/v1/domains"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domains-count-assets-by-domain-resp-1", "type": "response-fields", "title": "Count assets by domain", "path": ["Discovery API 1.0", "Count assets by domain", "Response"], "text": "Count assets by domain - response fields\\n- domain (string): The domain's name.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domain-tags-count-assets-by-tag-summary-1", "type": "endpoint", "title": "Count assets by tag", "path": ["Discovery API 1.0", "Count assets by tag"], "text": "Count assets by tag\\nGET /catalog/v1/domain_tags\\nThis endpoint mirrors the top-level endpoint, accepting any of the filtering params described above. It returns the count of assets matching the query grouped by tag. Providing no parameters returns the count of assets the user is able to view, subject to authentication, grouped by tag.\\nExamples:\\n?\\n?domains=data.texas.gov\\n?only=datasets&q=popul", "tags": ["endpoint", "get", "/catalog/v1/domain_tags"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domain-tags-count-assets-by-tag-resp-1", "type": "response-fields", "title": "Count assets by tag", "path": ["Discovery API 1.0", "Count assets by tag", "Response"], "text": "Count assets by tag - response fields\\n- domain_tag (string): The tag.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domain-categories-count-assets-by-category-summary-1", "type": "endpoint", "title": "Count assets by category", "path": ["Discovery API 1.0", "Count assets by category"], "text": "Count assets by category\\nGET /catalog/v1/domain_categories\\nThis endpoint mirrors the top-level endpoint, accepting any of the filtering params described above. It returns the count of assets matching the query grouped by category. Providing no parameters returns the count of assets the user is able to view, subject to authentication, grouped by category.\\nExamples:\\n?\\n?domains=data.ny.gov\\n?provenance=official", "tags": ["endpoint", "get", "/catalog/v1/domain_categories"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domain-categories-count-assets-by-category-resp-1", "type": "response-fields", "title": "Count assets by category", "path": ["Discovery API 1.0", "Count assets by category", "Response"], "text": "Count assets by category - response fields\\n- domain_category (string): The category.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domains-domain-facets-count-assets-by-facets-summary-1", "type": "endpoint", "title": "Count assets by facets", "path": ["Discovery API 1.0", "Count assets by facets"], "text": "Count assets by facets\\nGET /catalog/v1/domains/{domain}/facets\\nThis endpoint mirrors the top-level endpoint, accepting any of the filtering params described above. It returns the count of assets matching the query grouped by the following facets:\\ndatatypes categories tags provenance custom metadata Providing no parameters returns the count of assets the user is able to view, subject to authentication, grouped by each facet.\\nExamples:\\n?\\n?only=stories", "tags": ["endpoint", "get", "/catalog/v1/domains/{domain}/facets"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domains-domain-facets-count-assets-by-facets-resp-1", "type": "response-fields", "title": "Count assets by facets", "path": ["Discovery API 1.0", "Count assets by facets", "Response"], "text": "Count assets by facets - response fields\\n- facet (string): The facet class.\\n- value (string): The facet value.\\n  note: Parameters Describes operation parameters. A unique parameter is defined by a combination of a name and location.\\n  note: approval_status Field Type Description string enum The internal or public approval status of an asset. Combine with a target_audience=public or target_audience=internal parameter to limit to the approval status of public-bound or internal-bound data. A comma-separated list of statuses is supported. Repeated params, with or without brackets, are supported.\\n  note: Constraints: Range: [0,10000] Default: 100 Example: 10 min_should_match Field Type Description string The number or percent of words that must match. Acceptable formats are defined here.\\n  note: Constraints: Range: [0,10000] Default: 0 Example: 10 only Field Type Description string enum The datatype of an asset. Singular or plural terms are accepted. A comma-separated list of types is supported. Repeated params, with or without brackets, are supported.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domains-domain-facets-count-assets-by-facets-resp-2", "type": "response-fields", "title": "Count assets by facets", "path": ["Discovery API 1.0", "Count assets by facets", "Response"], "text": "note: Default: relevance Allowed: relevance \\u2503 name \\u2503 owner \\u2503 dataset_id \\u2503 datatype \\u2503 domain_category \\u2503 createdAt \\u2503 updatedAt \\u2503 page_views_total \\u2503 page_views_last_month \\u2503 page_views_last_week parent_ids Field Type Description string The four-by-four identifier of a parent asset having child assets. A comma-separated list of IDs is supported. Repeated params are supported.\\n  note: For autocomplete, a token matching either an asset's name or tags.\\n  note: Field Type Description state string enum The approvals state of the asset.\\n  note: Field Type Description Resource Primary metadata about the asset.\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.\\n  note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domains-domain-facets-count-assets-by-facets-resp-3", "type": "response-fields", "title": "Count assets by facets", "path": ["Discovery API 1.0", "Count assets by facets", "Response"], "text": "- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n  note: Field Type Description domain_category string The category.\\n  note: Field Type Description categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n  note: Field Type Description id string The four-by-four identifier of the user.\\n  note: Field Type Description domain string The domain's name.\\n  note: Field Type Description facet string The facet class.\\n- value (string): The facet value.\\n  note: Field Type Description start number Where the matched query term starts, as a character count, in the associated asset field.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domains-domain-facets-count-assets-by-facets-resp-4", "type": "response-fields", "title": "Count assets by facets", "path": ["Discovery API 1.0", "Count assets by facets", "Response"], "text": "- length (number): The number of characters the matched query term has.\\n  note: Field Type Description domain string The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n  note: Field Type Description id string The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n  note: Field Type Description page_views_last_week integer The number of views the asset has had in the last week.\\n  note: Field Type Description name string The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: TagAndCount The tag and the count of matching assets.\\n  note: Field Type Description domain_tag string The tag.\\n  note: Field Type Description tag_text string The tag of the matching asset.\\n  note: MatchOffsets An array of indices defining the location of the match.\\n- start (number): Where the matched query term starts, as a character count, in the associated asset field.\\n- length (number): The number of characters the matched query term has.\\n  note: Field Type Description serviceMillis number The number of milliseconds needed to return the API response.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domains-domain-facets-count-assets-by-facets-resp-5", "type": "response-fields", "title": "Count assets by facets", "path": ["Discovery API 1.0", "Count assets by facets", "Response"], "text": "note: Field Type Description title string The raw title of the matching asset.\\n  note: MatchOffsets An array of indices defining the location of the match.\\n- start (number): Where the matched query term starts, as a character count, in the associated asset field.\\n- length (number): The number of characters the matched query term has.\\n  note: Field Type Description value string The facet value.\\n  note: 200 - Autocomplete Tags Response The response from a query to api/catalog/v1/tags/autocomplete.\\n  note: Field Type Description [TagMatch] An array of the autocomplete matches from a query.\\n- tag_text (string): The tag of the matching asset.\\n  note: MatchOffsets An array of indices defining the location of the match.\\n- start (number): Where the matched query term starts, as a character count, in the associated asset field.\\n- length (number): The number of characters the matched query term has.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.\\n  note: Field Type Description [TitleMatch] An array of the autocomplete matches from a query.\\n- title (string): The raw title of the matching asset.\\n  note: MatchOffsets An array of indices defining the location of the match.\\n- start (number): Where the matched query term starts, as a character count, in the associated asset field.\\n- length (number): The number of characters the matched query term has.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domains-domain-facets-count-assets-by-facets-resp-6", "type": "response-fields", "title": "Count assets by facets", "path": ["Discovery API 1.0", "Count assets by facets", "Response"], "text": "- serviceMillis (number): The number of milliseconds needed to return the API response.\\n  note: Field Type Description [CategoryAndCount] An array of categories and counts.\\n- domain_category (string): The category.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.\\n  note: Field Type Description [DomainAndCount] An array of domains and counts.\\n- domain (string): The domain's name.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.\\n  note: Field Type Description facet string The facet class.\\n- value (string): The facet value.\\n  note: Field Type Description [TagAndCount] An array of tags and counts.\\n- domain_tag (string): The tag.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.\\n  note: Field Type Description [Asset] An array of the assets returned from a query.\\n  note: Resource Primary metadata about the asset.\\n- name (string): The name of the asset.\\n- page_views_last_week (integer): The number of views the asset has had in the last week.\\n- download_count (integer): The number of times the asset has been downloaded.\\n  note: lens_display_type Replaced by 'type' field denoting the asset's datatype.\\n  note: Classification Category, tags and custom metadata for the asset.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domains-domain-facets-count-assets-by-facets-resp-7", "type": "response-fields", "title": "Count assets by facets", "path": ["Discovery API 1.0", "Count assets by facets", "Response"], "text": "note: categories In the past, assets were assigned a domain-independent category. Thus older assets may have this field and newer assets will not.\\n  note: tags In the past, assets were assigned a domain-independent tag. Thus older assets may have this field and newer assets will not.\\n- domain_category (string): The category of the asset; or not present in the response if not provided.\\n- key (string): The custom metadata key that can be used as a parameter with custom metadata search.\\n- domain (string): The domain the asset belongs to.\\n- state (string enum): The approvals state of the asset.\\n- id (string): The four-by-four identifier of the user.\\n  note: Search by this fieldhere. Sort by this field here.\\n- id (string): The four-by-four identifier of the user.\\n- serviceMillis (number): The number of milliseconds needed to return the API response.\\n  note: Field Type Description error string The error message\\n  note: Field Type Description error string The error message.\\n  note: Field Type Description error string The error message.\\n  note: Field Type Description error string The error message.\\n  note: Field Type Description error string The error message.\\n  note: Field Type Description error string The error message.\\n  note: Field Type Description error string The error message.\\n  note: Field Type Description error string The error message.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "endpoint-get-catalog-v1-domains-domain-facets-count-assets-by-facets-resp-8", "type": "response-fields", "title": "Count assets by facets", "path": ["Discovery API 1.0", "Count assets by facets", "Response"], "text": "note: Field Type Description error string The error message.\\n  note: Field Type Description error string The error message.\\n  note: Field Type Description error string The error message.\\n  note: Field Type Description error string The error message.\\n  note: Field Type Description error string The error message.", "tags": ["response"], "source_file": "docs/Discovery_API.md", "doc_id": "socrata_discovery"}
{"id": "section-api-endpoints-1", "type": "section", "title": "API Endpoints", "path": ["API Endpoints", "API Endpoints"], "text": "API Endpoints", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-api-endpoints-2", "type": "section", "title": "API Endpoints", "path": ["API Endpoints", "API Endpoints"], "text": "API Endpoints What is an API Endpoint? The \\u201cendpoint\\u201d of a SODA API is simply a unique URL that represents an object or collection of objects. Every Socrata dataset, and even every individual data record, has its own endpoint. The endpoint is what you\\u2019ll point your HTTP client at to interact with data resources. All resources are accessed through a common endpoint of /api/v3/views/IDENTIFIER/query.json along with their dataset identifier. This paradigm holds true for every dataset in every SODA API. All datasets have a unique identifier - eight alphanumeric characters split into two four-character phrases by a dash. For example, ydr8-5enu is the identifier for the Building Permits. This identifier can then be inserted into the /api/v3/views/IDENTIFIER/query endpoint to construct the API endpoint. The TryIt macro has been disabled until future notice while we upgrade this site to SODA3. Once you\\u2019ve got your API endpoint, you can make requests with SoQL to filter and manipulate your dataset. Locating the API endpoint for a dataset You can also find API endpoints, and links to detailed developer documentation for each dataset, in a number of different places, depending on where you are: If you\\u2019re viewing a dataset listing within the Open Data Network, there will be a prominent \\u201cAPI\\u201d button that will take you directly to the API documentation for that dataset.  See this If you\\u2019re viewing a dataset directly, there will be an \\u201cAPI Documentation\\u201d button under \\u201cExport\\u201d and then \\u201cSODA API\\u201d.  See this", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-endpoint-versioning-1", "type": "section", "title": "Endpoint Versioning", "path": ["API Endpoints", "Endpoint Versioning"], "text": "Endpoint Versioning\\nSODA and SoQL are very flexible and allow us to add functionality over time without needing to completely deprecate and replace our APIs. We can do so in several different ways: By introducing new SoQL functions that provide new functionality. We could, for example, add a new function that allows you to filter or aggregate a dataset in a new way. By adding new datatypes to represent new data, like a new datatype for a new class of geospatial data. This allows us to introduce additional capabilities while still allowing you to issue the same kinds of queries in a backwards-compatible manner. We can extend SODA APIs without needing all developers to migrate their code to a new version. However, some functionalities are not available on all of our API endpoints, which is why we differentiate between versions of a dataset\\u2019s API. Functions made available on a newer version might not be available on an API endpoint of an older version. In the sidebar of our automatic API documentation, we list the version that that endpoint complies with, as well as other useful information.  See this Throughout the documentation on this developer portal you\\u2019ll notice version toggles and info boxes that will help you understand the difference between SODA endpoint versions.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-version-3-0-latest-1", "type": "section", "title": "Version 3.0 (Latest)", "path": ["API Endpoints", "Version 3.0 (Latest)"], "text": "Version 3.0 (Latest)\\nThe next iteration of SODA will be released in 2025 and changes the endpoint from /resource/IDENTIFIER.json to /api/v3/IDENTIFIER/query.json. Notable changes: Query requests must be either authenticated by a user or marked with a valid application token. We have separated the endpoint into two: /query for querying (e.g., https://data.cityofchicago.org/api/v3/views/ydr8-5enu/query.json) Query primarily supports machine-readability and has more options for customizing the request. /export for exports (e.g., https://data.cityofchicago.org/api/v3/views/ydr8-5enu/export.csv) Export supports more formats and focuses on generating something readable by humans. We strongly prefer that use the HTTP POST method when requesting queries, as this allows for longer queries and clearer options.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-version-2-1-1", "type": "section", "title": "Version 2.1", "path": ["API Endpoints", "Version 2.1"], "text": "Version 2.1\\nThe first SODA 2.1 APIs (previously referred to as our \\u201chigh-performance Socrata Open Data APIs\\u201d) were released in April of 2015, and in November of 2015 they received the \\u201c2.1\\u201d version designation for clarity. SODA 2.1 introduces a number of new datatypes as well as numerous new SoQL functions: Tons of new advanced SoQL functions to introduce powerful filtering and analysis into your queries New geospatial datatypes like Point , Line , and Polygon replace the Location datatype Support for the standardized GeoJSON output format, for direct use within geospatial tools like Leaflet Closer compliance with SQL semantics, such as Text comparisons becoming case-sensitive Currently only the JSON, CSV, and GeoJSON output formats are supported New functionality will be added to this version over time. For more information: SoQL functions that work with version 2.1 Datatypes that are available in version 2.1", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-version-2-0-1", "type": "section", "title": "Version 2.0", "path": ["API Endpoints", "Version 2.0"], "text": "Version 2.0\\nSODA 2.0 was originally released in 2011. Although 2.1 is backwards-compatible with 2.0, there are a number of differences between the two APIs: 2.0 supports fewer SoQL functions than 2.1. The only geospatial datatype supported is the Location datatype Text comparisons are case-insensitive For more information: SoQL functions that work with version 2.0 Datatypes that are available in version 2.0 Versioning HTTP headers The simplest way to tell the difference between a 2.0 API and a 2.1 API is via the X-SODA2-Legacy-Types header, which will be true if you\\u2019re accessing a legacy 2.0 API. When we will increment endpoint versions From time to time, we\\u2019ll introduce new SoQL functions and datatypes to the latest version of the SODA API. Those changes will be non-breaking, and old queries and applications will continue to function unchanged. The SODA API is designed to make it easy to introduce new functionality over time without making breaking changes.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-row-identifiers-1", "type": "section", "title": "Row Identifiers", "path": ["API Endpoints", "Row Identifiers"], "text": "Row Identifiers", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-row-identifiers-2", "type": "section", "title": "Row Identifiers", "path": ["API Endpoints", "Row Identifiers"], "text": "What is a Row Identifier? Socrata datasets are essentially a collection of rows. Each row can be uniquely designated by its \\u201crow identifier\\u201d, much like a driver\\u2019s license number or social security number identifies an individual. For those familiar with database concepts, they essentially act the same way as primary keys. Internal Identifiers vs Publisher-Specified Identifiers Row identifiers come in two flavors: Internal identifiers are auto-generated by the Socrata platform every time a new row is created. Publisher-specified identifiers are configured by the dataset owner and use a field of unique values within the dataset as the row identifier. Depending on what dataset you're accessing, internal row identifiers may be simple integers, or alphanumeric strings. There's no difference between the two in how you use them. To learn more about how to access internal row identifiers, read the System Fields documentation. Establishing a Publisher-Specified Identifier Setting a row identifier requires that you are either the owner of a dataset, or that you've been granted a role of Publisher or Administrator on a Socrata customer site. Basically, if you can't modify the dataset, you can't set a row identifier. A publisher-specified row identifier can be established for any Socrata dataset. A common column to use as a row identifier is an \\u2018ID\\u2019 column with some kind of number or code that uniquely identifies that row of data. For example, the \\u2018Inspection ID\\u2019 column of Chicago\\u2019s Food Inspections dataset is a Publisher-specified row identifier. How to Set a Row Identifier See this helpful guide on how to set a row identifier in Socrata. RESTful Verbs The Socrata API follows the REST (REpresentational State Transfer) design pattern. This means that the CRUD (Create, Read, Update, and Delete) operations are specified by using HTTP methods. These are referred to as RESTful verbs. GET Use the HTTP GET method to obtain data. As described in the Endpoints section, GET can be used to retrieve column data from multiple rows or from one single row. The Queries section describes how to do sophisticated queries, all with the GET method. For SODA3, you must authenticate or use an application token in order to query for or export data. You may preferentially use POST, which is useful if your SoQL query is very long. POST Use the HTTP POST method to add new rows in a dataset. See the SODA Producer API section for more details on how to add data. Note that you will need to authenticate in order to make changes. See the Authentication section for more information on how to do this. PUT Use the HTTP PUT method to modify data. Like POST, you will need authentication. Again, see the SODA Producer API and Authentication sections for more information. DELETE Use the HTTP DELETE method to remove data. Like POST and PUT, you will need authentication. Again, see the SODA Producer API and Authentication sections for more information.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-application-tokens-1", "type": "section", "title": "Application Tokens", "path": ["API Endpoints", "Application Tokens"], "text": "Application Tokens", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-application-tokens-2", "type": "section", "title": "Application Tokens", "path": ["API Endpoints", "Application Tokens"], "text": "The Socrata Open Data API uses application tokens for two purposes: Using an application token allows us to throttle by application, rather than via IP address, which gives you a higher throttling limit Authentication using OAuth Throttling limits Without an application token, we can only track usage and perform throttling based on a few simple criteria, mainly source IP address. As such, requests that aren\\u2019t using an application token come from a shared pool via IP address. IP addresses that make too many requests during a given period may be subject to throttling. When requests are made using an application token, we can actually attribute each request to a particular application and developer, granting each their own pool of API requests. Currently we do not throttle API requests that are using an application token, unless those requests are determined to be abusive or malicious. We reserve the right to change these throttling limits with notice, and we will post an update to announce any such change. If you are throttled for any reason, you will receive a status code 429 response. Don\\u2019t be a jerk! Dont do that! Yes, I know it says you get unlimited requests. But keep in mind that you\\u2019re using a shared platform, and you should still be deliberate in how you design your application to use our API. Applications that are determined to be abusive or malicious, or that otherwise monopolize the use of our API may be throttled. If we detect that your application is nearing the point where we may have to throttle it, we will likely pro-actively reach out to you to discuss how you can optimize your usage. If you have any questions, feel free to contact us and we\\u2019d be glad to help! Obtaining an Application Token You can obtain an application token by registering for one in your Socrata profile. Using your Application Token While it is possible to perform simple unauthenticated queries against the Socrata Open Data API without making use of an application token, you\\u2019ll receive much higher throttling limits if you include an application token in your requests. If you elect not to use an application token, you\\u2019ll be subjected to a much lower throttling limit for all requests originating from your IP address. Here\\u2019s how you include the application token in the request: SODA Version\\tMethod 3.0, 2.x\\tUse the X-App-Token HTTP header. 2.1, 2.0\\tUse the $$app_token parameter in your request. 1.0\\tUse the app_token parameter in your request. Using the header is the preferred method. Note: Application tokens are not necessarily used for authentication, but you should still preserve the security of your application token by always using HTTPS requests. If your application token is duplicated by another developer, their requests will count against your quota. The following is an example of using the X-App-Token HTTP header to pass an application token: POST /api/v3/views/kzjm-xkqj/query.json HTTP/1.1 Host: data.seattle.gov Accept: application/json X-App-Token: [REDACTED] The same application token could also be passed as a URL parameter: The TryIt macro has been disabled until future notice while we upgrade this site to SODA3. Using the Application Token as part of the OAuth 2.0 authentication process Application tokens can also be used for authentication using OAuth 2.0. For more information, see the authentication section.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-authentication-1", "type": "section", "title": "Authentication", "path": ["API Endpoints", "Authentication"], "text": "Authentication", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-authentication-2", "type": "section", "title": "Authentication", "path": ["API Endpoints", "Authentication"], "text": "There are two methods available for authentication: HTTP Basic and OAuth 2.0. For non-interactive applications, we only support HTTP Basic Authentication. We encourage all our developers of interactive applications to use the OAuth 2.0 workflow to authenticate their users. HTTP Basic Authentication is required when you are authenticating from a script that runs without interaction with the user, like your ETL tool, an update script, or any other data management automation. OAuth 2.0 is the preferred option for cases where you are building a web or mobile application that needs to perform actions on behalf of the user, like accessing data, and the interaction model allows you to present the user with a form to obtain their permission for the app to do so. Authenticating using HTTP Basic Authentication Requests can be authenticated using HTTP Basic Authentication. You can use your HTTP library\\u2019s Basic Auth feature to pass your credentials. All HTTP-basic-authenticated requests must be performed over a secure (https) connection. Authenticated requests made over an insecure connection will be denied. Users may use their username and password or an API key and secret pair to authenticate using Basic Authentication. Documentation on how to create and manage API keys can be found here. We recommend using API keys! They provide the following benefits: Access Socrata APIs without the risk of embedding your username and password in scripts or code Users on domains that require SSO (and thus without passwords) can access Socrata APIs Create individual keys for different apps or jobs so that if any one needs to be revoked or rotated, other apps are unaffected Change your account password without disrupting apps or rotate API keys without disrupting logins Here is a sample HTTP session that uses HTTP Basic Authentication: POST /api/v3/views/4tka-6guv/query.json HTTP/1.1 Host: soda.demo.socrata.com Authorization: Basic [REDACTED] Content-Type: application/json X-App-Token: [REDACTED] Note that the Authorization header in this request will usually be generated via your HTTP library\\u2019s Basic Auth feature (as opposed to manually constructing the Base64 encoding of your credentials yourself). For example, if you\\u2019re using Python\\u2019s requests module, it supports Basic Authentication out of the box. Similarly, an API tool like Postman also handles Basic Authentication. OAuth 2.0 Note: When developing applications that make use of OAuth, you must provide a web-accessible callback URL when registering your application token. This can make it difficult to develop on a machine that isn't directly exposed to the Internet. One great option is to use a tool like ngrok to create a secure tunnel to expose your web application in a secure manner.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-workflow-1", "type": "section", "title": "Workflow", "path": ["API Endpoints", "Workflow"], "text": "Workflow", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-workflow-2", "type": "section", "title": "Workflow", "path": ["API Endpoints", "Workflow"], "text": "We support a subset of OAuth 2.0 \\u2014 the server-based flow with a callback URL \\u2014 which we believe is more secure than the other flows in the specification. This OAuth flow is used by several other popular API services on the web. We have made the authentication flow similar to Google AuthSub. To authenticate with OAuth 2.0, you will first need to register your application, which will create an app token and a secret token. When registering your application, you must preregister your server by filling out the Callback Prefix field), so that we can be sure that access through your application is secure even if both your tokens are stolen. The Callback Prefix is the beginning of the URL that you will use as your redirect URL. Generally, you\\u2019ll want to provide as much of your callback URL as you can. For example, if your authentication callback is https://my-website.com/socrata-app/auth/callback, you might want to specify https://my-website.com/socrata-app as your callback URL. Once you have an application and a secret token, you\\u2019ll be able to authenticate with the SODA OAuth 2.0 endpoint. You\\u2019ll first need to redirect the user to the Socrata-powered site you wish to access so that they may log in and approve your application. For example: https://soda.demo.socrata.com/oauth/authorize?client_id=YOUR_AUTH_TOKEN&response_type=code &redirect_uri=YOUR_REDIRECT_URI Note that the redirect_uri here must be an absolute, secure (https:) URI which starts with the Callback Prefix you specified when you registered your application. If any of these cases fail, the user will be shown an error indicating as much. Should the user authorize your application, they will be redirected back to the your redirect_uri. For example, if I provide https://my-website.com/socrata-app/auth/callback as my redirect_uri, the user will be redirected to this URL: https://my-website.com/socrata-app/auth/callback?code=CODE where CODE is an authorization code that you will use later. If your redirect_uri contains a querystring, it will be preserved, and the code parameter will be added onto the end of it. Likewise, if you provide the optional state parameter in the original redirect to /authenticate, it will be preserved and sent back to you. Now that the user has authorized your application, the next step is to retrieve an access_token so that you can perform operations on their behalf. You can do this by making the following POST request from your server: https://soda.demo.socrata.com/oauth/access_token \\"client_id\\": YOUR_AUTH_TOKEN, \\"client_secret\\": YOUR_SECRET_TOKEN, \\"grant_type\\": \\"authorization_code\\", \\"redirect_uri\\": YOUR_REDIRECT_URI, \\"code\\": CODE where YOUR_AUTH_TOKEN and YOUR_SECRET_TOKEN are the tokens you received when registering your app, YOUR_REDIRECT_URI is the same value as what you used previously, and CODE is the value of the code query parameter of the URL that the user was redirected to. You\\u2019ll receive the following response: { access_token: ACCESS_TOKEN } Use this access_token in your requests when you have to do work on behalf of the now-authenticated user, as described below in the Using an OAuth 2.0 Access Token section. We have a sample app available on GitHub that illustrates how to do all of the above with the Ruby OAuth2 gem. Using an OAuth 2.0 Access Token Once you have obtained an access_token, you should include it on requests which need to happen on behalf of the user. The token must be included in the Authorization HTTP Header field as follows: Authorization: OAuth YOUR_ACCESS_TOKEN Note: All authenticated requests must be performed over a secure connection (https). Any attempt to use an access_token over a non-secure connection will result in immediate revocation of the token. Who am I? One quirk of authenticating via OAuth 2.0 is that the entire process happens without the 3rd party application (that\\u2019s you!) having any knowledge of who, exactly, the user is that just authorized the application. To remedy this, we have set up an endpoint that simply returns the information of the current user. To return the data in JSON: https://soda.demo.socrata.com/api/users/current.json To return the data in XML: https://soda.demo.socrata.com/users/current.xml", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-response-codes-headers-1", "type": "section", "title": "Response Codes & Headers", "path": ["API Endpoints", "Response Codes & Headers"], "text": "Response Codes & Headers", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-response-codes-1", "type": "section", "title": "Response Codes", "path": ["API Endpoints", "Response Codes"], "text": "Response Codes\\nThe Socrata Open Data API responds with standard HTTP Status Codes for both successful requests and for errors. The table below lists the response codes you should expect to see. 200\\tOK\\tYour request was successful 202\\tRequest Processing\\tYou can retry your request, and when it\\u2019s complete, you\\u2019ll get a 200 instead 400\\tBad Request\\tProbably your request was malformed. See the error message in the body for details 401\\tUnauthorized\\tYou attempted to authenticate but something went wrong. Make sure you follow the instructions to authenticate properly 403\\tForbidden\\tYou\\u2019re not authorized to access this resource. Make sure you authenticate to access private datasets 404\\tNot Found\\tThe resource requested doesn\\u2019t exist 429\\tToo Many Requests\\tYour client is currently being rate limited. Make sure you\\u2019re using an app token 500\\tServer Error\\tOur bad! Something has gone wrong with Socrata\\u2019s platform. Please let us know if you encounter a 500 error", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-headers-1", "type": "section", "title": "Headers", "path": ["API Endpoints", "Headers"], "text": "Headers\\nFor SODA 2.1 API calls, we include a few response headers that may be useful: X-Socrata-RequestId\\taqe1bgaxzvhitfgrsvy6semhi\\tA unique ID for this particular request. Very useful to include when asking for help, as it allows us to track your error down in our system Access-Control-Allow-Origin\\t*\\tAllows browsers to make cross-origin requests for data X-SODA2-Fields\\t[\\"business\\",\\"category\\", ...] (truncated)\\tAn array of the field names that may be included in this response X-SODA2-Types\\t[\\"text\\",\\"text\\",...] (truncated)\\tAn array of the data types for fields included in this response Last-Modified\\tTue, 24 Feb 2015 18:51:22 GMT\\tWhen the dataset backing this request was updated; may be used for caching ETag\\t\\"YWxwaGEuNTQzNV8...-gzip\\" (truncated)\\tAn HTTP ETag which may be used for cache validation There may be other headers included in responses, but they should not be relied upon and may change without notice. HTTP Headers are limited by practical constraints to a maximum size of 4K. In order to keep our request header sizes below that limit, the X-SODA2-Fields and X-SODA2-Types headers may be omitted for datasets with a very large number of columns.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-error-messages-1", "type": "section", "title": "Error Messages", "path": ["API Endpoints", "Error Messages"], "text": "Error Messages\\nFor any variety of error, we return a standard error message format that looks like the following: \\"code\\" : \\"soql.analyzer.typechecker.type-mismatch\\", \\"error\\" : true, \\"message\\" : \\"Type mismatch: expected text, but found number\\", \\"status\\" : 400, \\"data\\" : { \\"found\\" : \\"number\\", \\"expected\\" : [ \\"text\\" ]", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-section-1", "type": "section", "title": "},", "path": ["API Endpoints", "},"], "text": "},\\n\\"source\\" : { \\"position\\" : { \\"column\\" : 30, \\"row\\" : 1, \\"text\\" : \\"select * where string_column > 42\\" \\"type\\" : \\"anonymous\\" In particular: code: An enumeration for the particular class of error you have encountered error: A boolean flag you can check in your code if your library masks the HTTP error code. Ex: if(response.error) { // handle error } message: A human-readable error message that will help you debug what caused the error data: Machine-readable data about the error, most importantly the query generated by our SoQL parser based on your inputs", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-system-fields-1", "type": "section", "title": "System Fields", "path": ["API Endpoints", "System Fields"], "text": "System Fields\\nIn addition to the fields provided by the dataset owner, Socrata also provides a number of useful system fields you can make use of. They\\u2019re very useful for detecting when datasets have changed. :id\\tThe internal Socrata identifier for this record. :created_at\\tA Fixed Timestamp representing when this record was created. :updated_at\\tA Fixed Timestamp representing when this record was last updated. System fields are not included by default, and the method that you use to request the inclusion of the hidden system fields depends on what version of the SODA API specification the API you are accessing complies with. To learn more about API versioning, see the API Endpoint documentation.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-version-2-1-1", "type": "section", "title": "Version 2.1", "path": ["API Endpoints", "Version 2.1"], "text": "Version 2.1\\nWith version 2.1 APIs, accessing the system fields is as simple as including them in your $select parameter, either explicitly or via a wildcard. You can either $select=:id, :updated_at, name, address, or you could be even more broad and simply select :*, * to retrieve both all of the hidden internal fields and the fields from the dataset itself. For example: The TryIt macro has been disabled until future notice while we upgrade this site to SODA3. Since :created_at and :updated_at are Fixed Timestamp, you can query them to get recent updates to a dataset using the $where query parameter, like this example: The TryIt macro has been disabled until future notice while we upgrade this site to SODA3. A note on how datasets are updated Data providers use many different methods to update datasets. In some cases, they use tools like DataSync or the SODA Producer API to update datasets, and we can tell which records within the dataset have actually been modified, and only update them accordingly. When data providers perform a full replace of the dataset using the SODA Producer Replace API, all of its records will be updated within a short period of time, in which case a query based on :updated_at will show that all of the records have changed.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-version-2-0-1", "type": "section", "title": "Version 2.0", "path": ["API Endpoints", "Version 2.0"], "text": "Version 2.0", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-version-2-0-2", "type": "section", "title": "Version 2.0", "path": ["API Endpoints", "Version 2.0"], "text": "Getting the SODA API to return system fields is as simple as adding the parameter $$exclude_system_fields=false to your request. The double dollar sign ($$) is significant - it denotes a Socrata-specific parameter that is not part of the SODA standard. The TryIt macro has been disabled until future notice while we upgrade this site to SODA3. CORS & JSONP For security reasons, web browsers prevent what are called \\u201ccross-origin\\u201d or \\u201ccross-site\\u201d requests from one domain to another. JavaScript XMLHTTPRequests (commonly called \\u201cAJAX\\u201d requests) inherit all of the authentication context of the currently logged in user, so a malicious web page could attempt to make malicious requests that cross domain contexts and cause trouble. Historically, that has made it difficult for web developers to build web applications making use of third-party APIs. Fortunately, techniques have since been developed that allow developers to securely access APIs cross-domain. The two most popular ones, and the techniques that Socrata supports, are CORS and JSONP. A note on CORS, JSONP, and dataset permissions In order to prevent the aforementioned malicious cross-site attacks, Socrata automatically drops all authentication and authorization on requests that come in via CORS and JSONP. As a result, these techniques can only be used to access public datasets in a read-only fashion. Cross-Origin Resource Sharing (CORS) CORS is a proposed standard for allowing your web browser and a web server to negotiate and allow requests to be made across domain contexts. CORS is currently supported in modern Chrome, Firefox, Safari, and Internet Explorer (10+) web browsers. The standard itself is working its way through the W3C on its way to becoming official. You don\\u2019t need to do anything special to use CORS with JavaScript in a modern browser. Your web browser and our servers will automatically negotiate the cross-origin request. For example, to make a CORS request with jQuery, you\\u2019d make your request just like you were performing it within the context of your own domain. $.ajax({ url: \\"https://data.chattlibrary.org/api/v3/views/e968-fnk9/query.json\\", method: \\"POST\\", dataType: \\"json\\", data: JSON.stringify({ \\"query\\": \\"SELECT * WHERE status = 'CLOSED'\\", \\"page\\": { \\"pageNumber\\": 1, \\"pageSize\\": 1000", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-section-1", "type": "section", "title": "},", "path": ["API Endpoints", "},"], "text": "},\\n\\"includeSynthetic\\": false", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-section-1", "type": "section", "title": "}),", "path": ["API Endpoints", "}),"], "text": "}),\\nheaders: { 'Content-Type': 'application/json', 'X-App-Token': app_token", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-section-1", "type": "section", "title": "},", "path": ["API Endpoints", "},"], "text": "},\\nsuccess: function( data, status, jqxhr ){ console.log( \\"Request received:\\", data ); error: function( jqxhr, status, error ){ console.log( \\"Something went wrong!\\" );", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-section-1", "type": "section", "title": "});", "path": ["API Endpoints", "});"], "text": "});", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-section-2", "type": "section", "title": "});", "path": ["API Endpoints", "});"], "text": "\\u201cJavaScript with Padding\\u201d (JSONP) If you\\u2019re developing for older browsers, or you just feel like being nostalgic, you can also make use of our support for JSONP. Also called \\u201cJSON with Padding\\u201d, it is a technique for fooling a web browser into performing cross-origin requests using a special <script> tag that uses the src attribute to make a special API request. Instead of responding with just a JSON object, the server responds with JavaScript code that calls a client-declared callback function, passing the data as that function\\u2019s first parameter. With the Socrata API, the name of that callback function is declared using the $jsonp parameter. Sounds hacky, huh? Fortunately, tools like jQuery make it easy to use JSONP: $.ajax({ url: \\"https://data.chattlibrary.org/resource/e968-fnk9.json\\", jsonp: \\"$jsonp\\", dataType: \\"jsonp\\" }).done(function(data) { console.log(\\"Request received: \\" + data); But, as we mentioned, you should only need to use JSONP as a fallback in cases where you\\u2019re working with a browser that doesn\\u2019t support CORS. Queries using SODA3 The Socrata APIs provide rich query functionality through a query language we call the \\u201cSocrata Query Language\\u201d or \\u201cSoQL\\u201d. As its name might suggest, it borrows heavily from Structured Query Language (SQL), used by many relational database systems. Its paradigms should be familiar to most developers who have previously worked with SQL, and are easy to learn for those who are new to it. Requests must be either authenticated by a user or marked with a valid application token. Developers should now use the HTTP POST method when requesting queries, as this allows for longer queries and clearer options. The endpoints are split into two: /query for querying (e.g., https://data.cityofchicago.org/api/v3/views/ydr8-5enu/query.json) Query has more options for customizing the request so that you can fine-tune what data you want back. /export for exports (e.g., https://data.cityofchicago.org/api/v3/views/ydr8-5enu/export.csv) Export focuses on providing the entire dataset to be consumed by humans or Microsoft Excel or similar programs. You can click on each option to see more information about them: Request Option\\t/query\\t/export\\tDescription query\\tavailable\\tavailable\\tThe SoQL query to run page\\tavailable\\tnot available\\t{ pageNumber: 1, pageSize: 1000 } to indicate which page (1-indexed) and how many rows per page parameters\\tavailable\\tavailable\\tSome views require parameters to be provided by the user. Details to be provided at a later date timeout\\tdefault: 600\\tdefault: 600\\tThe number of seconds before timing out the request. Default: 600 (10 minutes) includeSystem\\tdefault: true\\tnot available\\tWhether or not to include system columns includeSynthetic\\tdefault: true\\tnot available\\tWhether or not to include not-explicitly-requested columns, such as system fields orderingSpecifier\\tdefault: total\\tdefault: total\\tCan be set to discard if you do not care about order and just want the data. Can improve performance significantly serializationOptions\\tnot available\\tavailable\\tDifferent formats have specific customization options.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-example-1", "type": "section", "title": "Example", "path": ["API Endpoints", "Example"], "text": "Example\\nYou might use the popular program cURL to make the request with the appropriate payload, or use an appropriate HTTP client library in your preferred programming language. Query for the first 100 rows of a dataset: curl --header 'X-App-Token: your-application-token' \\\\ --json '{ \\"query\\": \\"SELECT *\\", \\"page\\": { \\"pageNumber\\": 1, \\"pageSize\\": 100", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-section-1", "type": "section", "title": "},", "path": ["API Endpoints", "},"], "text": "},\\n\\"includeSynthetic\\": false", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-section-1", "type": "section", "title": "}' \\\\", "path": ["API Endpoints", "}' \\\\"], "text": "}' \\\\", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-section-2", "type": "section", "title": "}' \\\\", "path": ["API Endpoints", "}' \\\\"], "text": "https://soda.demo.socrata.com/api/v3/views/4tka-6guv/query.json Export the dataset as CSV with a byte-order mark and a separator character of TAB: curl --header 'X-App-Token: your-application-token' \\\\ --json '{ \\"serializationOptions\\": { \\"separator\\": \\"\\\\t\\", \\"bom\\": true https://soda.demo.socrata.com/api/v3/views/4tka-6guv/export.csv SoQL Function and Keyword Listing The following are all the functions and keywords available in SoQL. Some only work on the the latest version of our API endpoints, while some work on legacy versions as well. You can filter them by endpoint version and datatype using the filters below. For a list of valid operators, see the Datatypes documentation. distinct\\tReturns distinct set of records\\t2.1 and 3.0 avg(...)\\tReturns the average of a given set of numbers\\t2.0, 2.1, and 3.0 between ... and ...\\tReturns TRUE for values in a given range\\t2.1 and 3.0 case(...)\\tReturns different values based on the evaluation of boolean comparisons\\t2.1 and 3.0 convex_hull(...)\\tReturns the minimum convex geometry that encloses all of another geometry\\t2.1 and 3.0 count(...)\\tReturns a count of a given set of records\\t2.0, 2.1, and 3.0 date_extract_d(...)\\tExtracts the day from the date as an integer.\\t2.1 and 3.0 date_extract_dow(...)\\tExtracts the day of the week as an integer between 0 and 6 (inclusive).\\t2.1 and 3.0 date_extract_hh(...)\\tExtracts the hour of the day as an integer between 0 and 23 (inclusive).\\t2.1 and 3.0 date_extract_m(...)\\tExtracts the month as an integer.\\t2.1 and 3.0 date_extract_mm(...)\\tExtracts the minute from the time as an integer.\\t2.1 and 3.0 date_extract_ss(...)\\tExtracts the second from the time as an integer.\\t2.1 and 3.0 date_extract_woy(...)\\tExtracts the week of the year as an integer between 0 and 51 (inclusive).\\t2.1 and 3.0 date_extract_y(...)\\tExtracts the year as an integer.\\t2.1 and 3.0 date_trunc_y(...)\\tTruncates a calendar date at the year threshold\\t2.0, 2.1, and 3.0 date_trunc_ym(...)\\tTruncates a calendar date at the year/month threshold\\t2.0, 2.1, and 3.0 date_trunc_ymd(...)\\tTruncates a calendar date at the year/month/date threshold\\t2.0, 2.1, and 3.0 distance_in_meters(...)\\tReturns the distance between two Points in meters\\t2.1 and 3.0 extent(...)\\tReturns a bounding box that encloses a set of geometries\\t2.1 and 3.0 greatest(...)\\tReturns the largest value among its arguments, ignoring NULLs.\\t2.1 and 3.0 in(...)\\tMatches values in a given set of options\\t2.1 and 3.0 intersects(...)\\tAllows you to compare two geospatial types to see if they intersect or overlap each other\\t2.1 and 3.0 least(...)\\tReturns the smallest value among its arguments, ignoring NULLs.\\t2.1 and 3.0 like '...'\\tAllows for substring searches in text strings\\t2.1 and 3.0 ln(...)\\tReturns the natural log of a number\\t2.1 and 3.0 lower(...)\\tReturns the lowercase equivalent of a string of text\\t2.1 and 3.0 max(...)\\tReturns the maximum of a given set of numbers\\t2.1 and 3.0 min(...)\\tReturns the minimum of a given set of numbers\\t2.1 and 3.0 not between ... and ...\\tReturns TRUE for values not in a given range\\t2.1 and 3.0 not in(...)\\tMatches values not in a given set of options\\t2.1 and 3.0 not like '...'\\tAllows for matching text fields that do not contain a substring\\t2.1 and 3.0 num_points(...)\\tReturns the number of vertices in a geospatial data record\\t2.1 and 3.0 regr_intercept(...)\\tReturns the y-intercept of the linear least squares fit\\t2.1 and 3.0 regr_r2(...)\\tReturns the square of the correlation coefficient (r\\u00b2)\\t2.1 and 3.0 regr_slope(...)\\tReturns the slope of the linear least squares fit\\t2.1 and 3.0 simplify(...)\\tReduces the number of vertices in a line or polygon\\t2.1 and 3.0 simplify_preserve_topology(...)\\tReduces the number of vertices in a line or polygon, preserving topology\\t2.1 and 3.0 starts_with(...)\\tMatches on text strings that start with a given substring\\t2.1 and 3.0 stddev_pop(...)\\tReturns the population standard deviation of a given set of numbers\\t2.1 and 3.0 stddev_samp(...)\\tReturns a sampled standard deviation of a given set of numbers\\t2.1 and 3.0 sum(...)\\tReturns the sum of a given set of numbers\\t2.1 and 3.0 unaccent(...)\\tRemoves accents (diacritical marks) from a string.\\t2.1 and 3.0 upper(...)\\tReturns the uppercase equivalent of a string of text\\t2.1 and 3.0 within_box(...)\\tReturns the rows that have geodata within the specified box, defined by latitude, longitude corners\\t2.0, 2.1, and 3.0 within_circle(...)\\tReturns the rows that have locations within a specified circle, measured in meters\\t2.0, 2.1, and 3.0 within_polygon(...)\\tReturns the rows that have locations within the specified box, defined by latitude, longitude corners\\t2.1 and 3.0", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-data-transform-listing-1", "type": "section", "title": "Data Transform Listing", "path": ["API Endpoints", "Data Transform Listing"], "text": "Data Transform Listing", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-data-transform-listing-2", "type": "section", "title": "Data Transform Listing", "path": ["API Endpoints", "Data Transform Listing"], "text": "These are the transformation functions available in the Dataset Management API. These functions can be used to transform and validate your data before you publish your dataset for consumption. These functions can be used in the \\u201cData Transforms\\u201d editor of the the Dataset Management Experience interface. Check out some of the examples on our Support Portal here! See the Dataset Management API docs for more info on how to use the transform functions as an API user. +\\tKeep a number\\u2019s sign and\\tLogical and of two boolean values ||\\tconcatenate two strings /\\tDivide a number by another =\\tReturn true if the left side equals the right ==\\tReturn true if the left side equals the right ^\\tNo documentation is available. >\\tReturn true if the value on the left is greater than the value on the right >=\\tReturn true if the value on the left is greater than or equal to the value on the right <\\tReturn true if the value on the left is less than the value on the right <=\\tReturn true if the value on the left is less than or equal to the value on the right %\\tFind the remainder(modulus) of one number divided by another *\\tMultiply two numbers together not\\tInvert a boolean <>\\tReturn true if the left side does not equal the right !=\\tReturn true if the left side does not equal the right or\\tLogical or of two boolean values -\\tSubtract a number from another abs\\tProduce the absolute value of a number between\\tReturn true if the left is within the range of the right values case\\tEvaluate a series of true/false expressions (predicates) and return the next consequent. centroid\\treturns the geometric centroid of a polygon or multipolygon. Please refer to coalesce\\tTake the leftmost non-null value. contains\\ttell whether or not a string contains another string county_boundary\\tReturns the boundary of the US county as a multipolygon. The state name is not case sensitive. date_extract_d\\tExtract the day from the date as an integer date_extract_dow\\tExtracts the day of the week as an integer between 0 and 6 where date_extract_hh\\tExtract the hour the date as an integer date_extract_m\\tExtract the month as an integer date_extract_mm\\tExtract the minute from the date as an integer date_extract_ss\\tExtract the second from the date as an integer date_extract_woy\\tExtracts the week of the year as an integer between 0 and 51 date_extract_y\\tExtract the year as an integer date_trunc_y\\tTruncates a calendar date at the year threshold date_trunc_ym\\tTruncates a calendar date at the year/month threshold date_trunc_ymd\\tTruncates a calendar date at the year/month/day threshold datetime_add_d\\tAdds or subtracts the specified number of days to the timestamp datetime_add_hh\\tAdds or subtracts the specified number of hours to the timestamp datetime_add_mm\\tAdds or subtracts the specified number of minutes to the timestamp datetime_add_ss\\tAdds or subtracts the specified number of seconds to the timestamp datetime_diff\\tCalculates the difference between two dates in seconds, minutes, hours, days, business days, weeks, calendar weeks, months, or years. domain_categories\\tReturns the categories currently configured on the domain. Useful primarily domain_licenses\\tReturns the licenses currently configured on the domain. Useful primarily email_parse\\tParse an email. This is best effort as most things are actually ensure_within\\tensure_within is a function which takes a point and a multipolygon error\\tMake an error. This is useful in conjunction with a case function, floating_timestamp_day\\tExtract the day from a calendar date floating_timestamp_day_of_week\\tExtract the day of the week as an integer between 0 and 6 where Sunday is 0. floating_timestamp_hour\\tExtract the hour from a calendar date floating_timestamp_minute\\tExtract the minute from a calendar date floating_timestamp_month\\tExtract the month from a calendar date floating_timestamp_second\\tExtract the second from a calendar date floating_timestamp_week_of_year\\tExtract the week from a calendar date as an integer between 0 and 51. floating_timestamp_year\\tExtract the year from a calendar date forgive\\tforgive can take an optional default argument from_polyline\\tconvert a linestring encode in Google\\u2019s polyline format with the given precision to a Line geocode\\tgeocode is a function which takes human readable addresses geocode_esri\\tgeocode_esri is a function which takes human readable addresses grapheme_length\\tthe length of a piece of text in unicode grapheme clusters. greatest\\treturn the largest value among its arguments (ignoring null) hash\\tConstruct a hash value from a string value using either the md5 or sha256 algorithm. haversine_distance\\tReturn the distance of the line using haversine formula http_get\\tMake an HTTP Get request to a URL. The response is returned. If the server in\\tWhether or not a value is in a set of other values is_empty\\tReturns whether or not the input is empty. Empty means null values, is_not_null\\tWhether or not a value is not null is_null\\tWhether or not a value is null is_within\\tis_within is a function which takes a point and a multipolygon json_array_contains\\tTest if a json array contains an item. If the JSON passed to this function is not an array, json_pluck\\tPluck a value out of a JSON string. The returned value will be a SoQL Json value. json_pluck_boolean\\tPluck a boolean value out of a JSON string. The returned value must be a boolean, otherwise json_pluck_number\\tPluck a number value out of a JSON string. The returned value must be a number, otherwise json_pluck_text\\tPluck a text value out of a JSON string. The returned value may be a primitive like a least\\treturn the smallest value among its arguments (ignoring null) left_pad\\tPad text with the minimum number of copies of pad to reach desired_length. length\\tthe length of a piece of text in unicode code points. This is usually, but not like\\tIf a string is like another string. location_address\\tExtract the address from a location location_city\\tExtract the city from a location location_point\\tExtract the point from a location location_state\\tExtract the state from a location location_to_point\\tTurn a location value into a point location_zip\\tExtract the zip from a location lower\\tlowercase a string make_location\\tThis function has been deprecated. Please use the make_point function instead. make_point\\tfunction to make a point out of a Y (latitude) and X (longitude) coordinate. make_url\\tNo documentation is available. not_between\\tReturn true if the left is not within the range of the right values not_in\\tWhether or not a value is absent from a set of other values not_like\\tIf a string is not like another string. parse_address\\tExtract a street address from a full US address. parse_city\\tExtract a city from a full US address. parse_point\\tExtract the point from a full US address with point. parse_state\\tExtract a state from a full US address. parse_zip\\tExtract a ZIP code from a full US address. point_latitude\\tExtract the latitude from a point point_longitude\\tExtract the longitude from a point polylabel\\tReturns a point that must exist within the polygon borders. It uses the recursive grid-based algorithm described here: https://github.com/mapbox/polylabel#how-the-algorithm-works. When given a multipolygon, the point it returns is within the largest (by area) sub-polygon. random_number_between\\tReturns a random float using a uniform distribution between the lower and upper values supplied: random_number_between(lower, upper) random_number_normal\\tReturns a random float using a normal distribution with the mean and variance supplied: random_number_normal(mean, variance) regex_capture\\tfunction to capture a piece of text based on a regular expression regex_named_capture\\tcapture a piece of text based on a regular expression regex_replace\\tfunction to replace a piece of text based on a regular expression region_code\\tTurn a point into the ID of a region, based on which region the point falls within. For example, if this dataset can produce region_code_label\\tIdentical to region_code, but returns a text value. repair_geometry\\tAttempt to repair the geometry. replace\\treplace text with another piece of text replace_first\\treplace the first occurrence of a piece of text with another piece of text reproject\\treproject a geometry from one projection to another. reproject_to_wgs84\\tfunction to reproject a geometry to WGS84. This will allow the geometry right_pad\\tPad text with the minimum number of copies of pad to reach desired_length. round\\tRound a number to a given precision. Trailing zeros are removed by default. Negative precisions round numbers to the left of the decimal. set_projection\\tfunction to explicitly set the projection value on geometries which do not have projection simplify\\tReturns a simplified version of the Line, Polygon, MultiLine, or MultiPolygon using simplify_preserve_topology\\tReturns a simplified version of the Line, Polygon, MultiLine, or MultiPolygon using slice\\tGet a substring of a specified length of a text from a start index source_created_at\\tGet the fixed timestamp that this data source was created (ie: started uploading or importing). split_select\\tfunction to split a piece of text on a token, and then select starts_with\\ttell whether or a not a string is prefixed with another string state_boundary\\treturns the boundary of the US state title_case\\tMake string title case with the exception of small words as defined by NYT Style Guide: to_boolean\\tcast a value to a true or false to_checkbox\\tNo documentation is available. to_fixed_timestamp\\tTurn a text value into a datetime with a fixed timezone. to_floating_timestamp\\tTurn a text value into a floating datetime. \\u201cFloating\\u201d means the timezone to_json\\tcast a text value to json to_line\\tparse a WKT (text) representation of a line into a line value to_location\\tThis function has been deprecated. Please use the to_point function instead. to_multiline\\tconvert a line into a multiline to_multipoint\\tconvert a point into a multipoint to_multipolygon\\tconvert a polygon into a multipolygon to_number\\tcast a value to a number to_point\\tparse a WKT (text) representation of a point into a point value to_polygon\\tparse a WKT (text) representation of a polygon into a polygon value to_text\\tNo documentation is available. to_url\\tNo documentation is available. trim\\ttrim characters off the start and end of a string trim_leading\\ttrim characters off the start of a string trim_trailing\\ttrim characters off the end of a string upper\\tuppercase a string uri_parse\\tParse a URI. url_decode\\tURL Decode a value url_description\\tExtract the description part of a link. url_encode\\tURL Encode a value. url_url\\tExtract the url part of a link. validate_geometry\\tTest that the geometry is valid. xml_pluck\\tPluck a value out of an XML string using XPath. The returned value will be a string.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-output-formats-1", "type": "section", "title": "Output Formats", "path": ["API Endpoints", "Output Formats"], "text": "Output Formats\\nThe Socrata Open Data API supports a number of different response formats that can be specified either via response type extensions on the API endpoint or HTTP Accept headers. CSV\\tcsv\\ttext/csv; charset=utf-8\\t2.0, 2.1, and 3.0 GeoJSON\\tgeojson\\tapplication/vnd.geo+json;charset=utf-8\\t2.1 and 3.0 JSON\\tjson\\tapplication/json;charset=utf-8\\t2.0, 2.1, and 3.0 RDF-XML\\trdf\\tapplication/rdf+xml; charset=utf-8\\t2.0 XML\\txml\\ttext/xml; charset=utf-8\\t2.0 and 3.0 Neither type is better than the other - simply select the one that works best for your framework and application.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-extensions-1", "type": "section", "title": "Extensions", "path": ["API Endpoints", "Extensions"], "text": "Extensions\\nThe simplest way to specify the response format is by appending a response type extension to the URL. This allows you to set the response format without requiring the ability to set headers in your HTTP client. Simply add the extension to the endpoint. For example, if your resource endpoint is /resource/644b-gaut, and you wanted to get CSV output, your path would be /resource/644b-gaut.csv. HTTP Accept Headers HTTP Accept headers allow applications to automatically negotiate content types with a web service. With SODA, this also means you can request content types using Accept headers without needing to provide a response type extension. Simply send an Accept header along with the desired mimetype for the desired response type. For example, to request JSON, you\\u2019d use a header of Accept: application/json. The SODA API response will also include a Content-type header to specify the format of the data that it is returning.", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-datatypes-1", "type": "section", "title": "Datatypes", "path": ["API Endpoints", "Datatypes"], "text": "Datatypes\\nThere are many core datatypes in SODA. What datatypes you may find depends on the version of your API endpoint: Checkbox\\t2.0, 2.1, and 3.0 Fixed Timestamp\\t2.0, 2.1, and 3.0 Floating Timestamp\\t2.0 and 2.1 Line\\t2.1 and 3.0 Location\\t2.0, 2.1, and 3.0 MultiLine\\t2.1 and 3.0 MultiPoint\\t2.1 and 3.0 MultiPolygon\\t2.1 and 3.0 Number\\t2.0, 2.1, and 3.0 Point\\t2.1 and 3.0 Polygon\\t2.1 and 3.0 Text\\t2.0, 2.1, and 3.0 URL\\t2.0, 2.1, and 3.0 Other APIs", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-dataset-management-1", "type": "section", "title": "Dataset Management", "path": ["API Endpoints", "Dataset Management"], "text": "Dataset Management", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-approvals-1", "type": "section", "title": "Approvals", "path": ["API Endpoints", "Approvals"], "text": "Approvals", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-curated-region-jobs-1", "type": "section", "title": "Curated Region Jobs", "path": ["API Endpoints", "Curated Region Jobs"], "text": "Curated Region Jobs", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-curated-regions-1", "type": "section", "title": "Curated Regions", "path": ["API Endpoints", "Curated Regions"], "text": "Curated Regions", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-metadata-1", "type": "section", "title": "Metadata", "path": ["API Endpoints", "Metadata"], "text": "Metadata", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-publishing-1", "type": "section", "title": "Publishing", "path": ["API Endpoints", "Publishing"], "text": "Publishing\\nSearch and Discovery", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-discovery-1", "type": "section", "title": "Discovery", "path": ["API Endpoints", "Discovery"], "text": "Discovery", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-team-search-1", "type": "section", "title": "Team Search", "path": ["API Endpoints", "Team Search"], "text": "Team Search", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-user-search-1", "type": "section", "title": "User Search", "path": ["API Endpoints", "User Search"], "text": "User Search\\nExport and Integration OData V2 ODN", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-authentication-1", "type": "section", "title": "Authentication", "path": ["API Endpoints", "Authentication"], "text": "Authentication\\nAPI Keys", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
{"id": "section-permissions-1", "type": "section", "title": "Permissions", "path": ["API Endpoints", "Permissions"], "text": "Permissions", "tags": ["section"], "source_file": "docs/Discovery_API_2.txt", "doc_id": "socrata_soda_api"}
`;

// workers/socrataRagIndex.ts
var INDEX_OPTIONS = {
  ...RAG_INDEX_LIMITS,
  minTokenLength: 2,
  allowEmbeddings: RAG_GUARDRAILS.allowEmbeddings
};
assertRagGuardrails({
  allowEmbeddings: INDEX_OPTIONS.allowEmbeddings,
  usesExternalVectorDb: false,
  usesRemoteIndex: RAG_INDEX_STORAGE_STRATEGY !== "memory"
});
var socrataChunks = parseJsonl(SOCRATA_RAG_BUNDLE_JSONL);
var socrataIndex = new RagIndex(socrataChunks, INDEX_OPTIONS);
var socrataChunkMap = new Map(socrataChunks.map((chunk) => [chunk.id, chunk]));
var querySocrataRag = /* @__PURE__ */ __name((query, options) => {
  return socrataIndex.query(query, options);
}, "querySocrataRag");
var getSocrataRagChunksById = /* @__PURE__ */ __name((ids, limit = 12) => {
  const unique = [];
  const seen = /* @__PURE__ */ new Set();
  for (const raw of ids || []) {
    const value = (raw || "").trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    unique.push(value);
    if (unique.length >= limit) break;
  }
  const chunks = [];
  for (const id of unique) {
    const chunk = socrataChunkMap.get(id);
    if (chunk) chunks.push(chunk);
  }
  return chunks;
}, "getSocrataRagChunksById");

// workers/worker.ts
var json = /* @__PURE__ */ __name((body, status = 200, headers = {}) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });
}, "json");
var ACCESS_ALLOWLIST_KEY = "access_allowlist";
var SETTINGS_KEY_PREFIX = "user_settings:";
var SHARED_SETTINGS_KEY = "shared_settings:v2";
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var MODEL_NAME_PATTERN = /^[A-Za-z0-9._:-]+$/;
var MAX_ALLOWLIST_ENTRIES = 500;
var MAX_ALLOWLIST_BODY_BYTES = 5e4;
var MAX_SETTINGS_BODY_BYTES = 5e4;
var MAX_OPEN_DATA_PROXY_BODY_BYTES = 2e4;
var MAX_RAG_QUERY_BODY_BYTES = 12e3;
var MAX_RAG_CHUNK_IDS = 24;
var SETTINGS_SCHEMA_VERSION = 1;
var ACCESS_JWT_HEADER = "Cf-Access-Jwt-Assertion";
var ACCESS_EMAIL_HEADER = "Cf-Access-Authenticated-User-Email";
var OPEN_DATA_PROXY_ALLOWED_HEADERS = /* @__PURE__ */ new Set([
  "accept",
  "x-app-token"
]);
installLogRedactionGuard();
var getCorsHeaders = /* @__PURE__ */ __name((origin, env2) => {
  const allowed = (env2.ALLOWED_ORIGINS || "").split(",").map((v) => v.trim()).filter(Boolean);
  let allowOrigin = "*";
  if (origin) {
    if (allowed.length === 0 || allowed.includes(origin)) {
      allowOrigin = origin;
    } else {
      allowOrigin = allowed[0] || origin;
    }
  }
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": [
      "Content-Type",
      "Authorization",
      "If-Match",
      ACCESS_JWT_HEADER,
      ACCESS_EMAIL_HEADER
    ].join(", "),
    "Access-Control-Expose-Headers": "ETag",
    "Vary": "Origin"
  };
}, "getCorsHeaders");
var MODEL_ROLES = [
  "overseer_planning",
  "method_discovery",
  "sector_analysis",
  "deep_research_l1",
  "deep_research_l2",
  "method_audit",
  "gap_hunter",
  "exhaustion_scout",
  "critique",
  "synthesis",
  "validation"
];
var RUN_CONFIG_DEFAULTS = {
  minAgents: 8,
  maxAgents: 20,
  maxMethodAgents: 8,
  forceExhaustion: false,
  minRounds: 1,
  maxRounds: 2,
  earlyStopDiminishingScore: 0.75,
  earlyStopNoveltyRatio: 0.25,
  earlyStopNewDomains: 1,
  earlyStopNewSources: 3
};
var getAdminEmails = /* @__PURE__ */ __name((env2) => {
  const raw = (env2.ALLOWLIST_ADMIN_EMAILS || "").split(",").map((entry) => entry.trim().toLowerCase()).filter(Boolean);
  return new Set(raw);
}, "getAdminEmails");
var normalizeAllowlistEntries = /* @__PURE__ */ __name((rawEntries) => {
  if (!Array.isArray(rawEntries)) {
    return { entries: [], invalid: [], error: "entries must be an array of strings." };
  }
  const entries = [];
  const invalid = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of rawEntries) {
    if (typeof item !== "string") {
      invalid.push(String(item));
      continue;
    }
    const value = item.trim().toLowerCase();
    if (!value) continue;
    if (!EMAIL_PATTERN.test(value)) {
      invalid.push(value);
      continue;
    }
    if (seen.has(value)) continue;
    seen.add(value);
    entries.push(value);
  }
  return { entries, invalid, error: "" };
}, "normalizeAllowlistEntries");
var getSettingsStorageKey = /* @__PURE__ */ __name(async (email) => {
  const hashed = await hashValue(email);
  return `${SETTINGS_KEY_PREFIX}${hashed}`;
}, "getSettingsStorageKey");
var getLegacySettingsKey = /* @__PURE__ */ __name((email) => `${SETTINGS_KEY_PREFIX}${email}`, "getLegacySettingsKey");
var isPrivateHostname = /* @__PURE__ */ __name((hostname) => {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower.endsWith(".local")) return true;
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const parts = ipv4Match.slice(1).map((value) => Number(value));
    if (parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return true;
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
    return false;
  }
  if (lower.includes(":")) {
    if (lower === "::1") return true;
    if (lower.startsWith("fe80:")) return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  }
  return false;
}, "isPrivateHostname");
var OUTBOUND_ALLOWED_HOSTS = {
  openai: /* @__PURE__ */ new Set(["api.openai.com"]),
  gemini: /* @__PURE__ */ new Set(["generativelanguage.googleapis.com"]),
  cloudflare: /* @__PURE__ */ new Set(["api.cloudflare.com"])
};
var isAllowedOutbound = /* @__PURE__ */ __name((url, context2) => {
  if (context2 === "open-data") {
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (isPrivateHostname(url.hostname)) return false;
    return true;
  }
  const allowed = OUTBOUND_ALLOWED_HOSTS[context2];
  if (!allowed || !allowed.has(url.hostname.toLowerCase())) return false;
  return url.protocol === "https:";
}, "isAllowedOutbound");
var logOutboundViolation = /* @__PURE__ */ __name((detail) => {
  console.warn("Outbound fetch blocked.", redactSensitiveValue(detail));
}, "logOutboundViolation");
var assertOutboundAllowed = /* @__PURE__ */ __name((url, context2) => {
  if (isAllowedOutbound(url, context2)) return;
  logOutboundViolation({
    context: context2,
    url: url.toString(),
    reason: context2 === "open-data" ? "disallowed open-data target" : "host not in allowlist"
  });
  throw new Error("Outbound fetch blocked by allowlist.");
}, "assertOutboundAllowed");
var outboundFetch = /* @__PURE__ */ __name(async (target, options, context2) => {
  let url;
  try {
    url = new URL(target);
  } catch (_) {
    throw new Error("Invalid outbound URL.");
  }
  assertOutboundAllowed(url, context2);
  return fetch(url.toString(), options);
}, "outboundFetch");
var createScopedFetch = /* @__PURE__ */ __name((context2) => {
  return async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    return outboundFetch(url, init || {}, context2);
  };
}, "createScopedFetch");
var sanitizeProxyHeaders = /* @__PURE__ */ __name((raw) => {
  if (!raw || typeof raw !== "object") return {};
  const headers = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!OPEN_DATA_PROXY_ALLOWED_HEADERS.has(key.toLowerCase())) continue;
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    headers[key] = trimmed;
  }
  if (!headers["Accept"] && !headers["accept"]) {
    headers["Accept"] = "application/json,text/plain;q=0.9,*/*;q=0.8";
  }
  headers["User-Agent"] = "deepsearches-open-data-proxy";
  return headers;
}, "sanitizeProxyHeaders");
var clamp2 = /* @__PURE__ */ __name((value, min, max) => Math.max(min, Math.min(max, value)), "clamp");
var toNumber = /* @__PURE__ */ __name((value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}, "toNumber");
var normalizeDomainWeightMap = /* @__PURE__ */ __name((raw) => {
  const base = raw && typeof raw === "object" ? raw : {};
  const out = {};
  for (const [key, value] of Object.entries(base)) {
    const domain2 = String(key || "").trim().toLowerCase();
    if (!domain2) continue;
    out[domain2] = clamp2(toNumber(value, 0), 0, 1);
  }
  return out;
}, "normalizeDomainWeightMap");
var normalizeDomainList = /* @__PURE__ */ __name((raw) => {
  const values = Array.isArray(raw) ? raw : [];
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const value of values) {
    const domain2 = String(value || "").trim().toLowerCase();
    if (!domain2 || seen.has(domain2)) continue;
    seen.add(domain2);
    out.push(domain2);
  }
  return out;
}, "normalizeDomainList");
var normalizeRunConfig = /* @__PURE__ */ __name((rawConfig) => {
  const base = rawConfig && typeof rawConfig === "object" ? rawConfig : {};
  const minAgents = Math.max(1, Math.floor(toNumber(base.minAgents, RUN_CONFIG_DEFAULTS.minAgents)));
  const maxAgents = Math.max(minAgents, Math.floor(toNumber(base.maxAgents, RUN_CONFIG_DEFAULTS.maxAgents)));
  const maxMethodAgents = Math.max(1, Math.floor(toNumber(base.maxMethodAgents, RUN_CONFIG_DEFAULTS.maxMethodAgents)));
  const minRounds = Math.max(1, Math.floor(toNumber(base.minRounds, RUN_CONFIG_DEFAULTS.minRounds)));
  const maxRounds = Math.max(minRounds, Math.floor(toNumber(base.maxRounds, RUN_CONFIG_DEFAULTS.maxRounds)));
  const earlyStopDiminishingScore = clamp2(
    toNumber(base.earlyStopDiminishingScore, RUN_CONFIG_DEFAULTS.earlyStopDiminishingScore),
    0,
    1
  );
  const earlyStopNoveltyRatio = clamp2(
    toNumber(base.earlyStopNoveltyRatio, RUN_CONFIG_DEFAULTS.earlyStopNoveltyRatio),
    0,
    1
  );
  const earlyStopNewDomains = Math.max(
    0,
    Math.floor(toNumber(base.earlyStopNewDomains, RUN_CONFIG_DEFAULTS.earlyStopNewDomains))
  );
  const earlyStopNewSources = Math.max(
    0,
    Math.floor(toNumber(base.earlyStopNewSources, RUN_CONFIG_DEFAULTS.earlyStopNewSources))
  );
  const estimatedCallLatencyMs = Math.max(
    500,
    Math.floor(toNumber(base.estimatedCallLatencyMs, 6e4))
  );
  const normalizeWeight = /* @__PURE__ */ __name((value, fallback) => clamp2(toNumber(value, fallback), 0, 1), "normalizeWeight");
  const rawPriority = base.priorityWeights && typeof base.priorityWeights === "object" ? base.priorityWeights : {};
  const rawMethod = rawPriority.method && typeof rawPriority.method === "object" ? rawPriority.method : {};
  const rawSector = rawPriority.sector && typeof rawPriority.sector === "object" ? rawPriority.sector : {};
  const priorityWeights = {
    method: {
      llm_method_discovery: normalizeWeight(rawMethod.llm_method_discovery, 0.95),
      address_direct: normalizeWeight(rawMethod.address_direct, 0.9),
      knowledge_base_method: normalizeWeight(rawMethod.knowledge_base_method, 0.75),
      knowledge_base_domain: normalizeWeight(rawMethod.knowledge_base_domain, 0.6),
      method_template_fallback: normalizeWeight(rawMethod.method_template_fallback, 0.45)
    },
    sector: {
      subtopicBoost: normalizeWeight(rawSector.subtopicBoost, 0.2),
      verticalSeedBase: normalizeWeight(rawSector.verticalSeedBase, 0.3),
      rawSectorBase: normalizeWeight(rawSector.rawSectorBase, 0.25),
      fallback: normalizeWeight(rawSector.fallback, 0.15)
    }
  };
  return {
    minAgents,
    maxAgents,
    maxMethodAgents,
    forceExhaustion: base.forceExhaustion === true,
    minRounds,
    maxRounds,
    earlyStopDiminishingScore,
    earlyStopNoveltyRatio,
    earlyStopNewDomains,
    earlyStopNewSources,
    estimatedCallLatencyMs,
    priorityWeights
  };
}, "normalizeRunConfig");
var normalizeModelOverrides = /* @__PURE__ */ __name((rawOverrides) => {
  if (!rawOverrides || typeof rawOverrides !== "object") return {};
  const overrides = rawOverrides;
  const sanitized = {};
  for (const role of MODEL_ROLES) {
    const value = overrides[role];
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed || !MODEL_NAME_PATTERN.test(trimmed)) continue;
    sanitized[role] = trimmed;
  }
  return sanitized;
}, "normalizeModelOverrides");
var trimMaybe = /* @__PURE__ */ __name((value) => typeof value === "string" ? value.trim() : "", "trimMaybe");
var normalizeSettingsKeyOverrides = /* @__PURE__ */ __name((raw) => {
  const base = raw && typeof raw === "object" ? raw : {};
  const google = trimMaybe(base.google);
  const openai = trimMaybe(base.openai);
  const out = {};
  if (google) out.google = google;
  if (openai) out.openai = openai;
  return out;
}, "normalizeSettingsKeyOverrides");
var normalizeSettingsOpenDataConfig = /* @__PURE__ */ __name((raw) => {
  const base = raw && typeof raw === "object" ? raw : {};
  const rawFlags = base.featureFlags && typeof base.featureFlags === "object" ? base.featureFlags : {};
  const rawAuth = base.auth && typeof base.auth === "object" ? base.auth : {};
  const zeroCostMode = base.zeroCostMode === true;
  return {
    zeroCostMode,
    allowPaidAccess: zeroCostMode ? false : base.allowPaidAccess === true,
    featureFlags: {
      autoIngestion: typeof rawFlags.autoIngestion === "boolean" ? rawFlags.autoIngestion : true,
      evidenceRecovery: typeof rawFlags.evidenceRecovery === "boolean" ? rawFlags.evidenceRecovery : true,
      gatingEnforcement: typeof rawFlags.gatingEnforcement === "boolean" ? rawFlags.gatingEnforcement : true,
      usOnlyAddressPolicy: typeof rawFlags.usOnlyAddressPolicy === "boolean" ? rawFlags.usOnlyAddressPolicy : false,
      datasetTelemetryRanking: typeof rawFlags.datasetTelemetryRanking === "boolean" ? rawFlags.datasetTelemetryRanking : true,
      socrataPreferV3: typeof rawFlags.socrataPreferV3 === "boolean" ? rawFlags.socrataPreferV3 : false
    },
    auth: {
      socrataAppToken: trimMaybe(rawAuth.socrataAppToken) || void 0,
      arcgisApiKey: trimMaybe(rawAuth.arcgisApiKey) || void 0,
      geocodingEmail: trimMaybe(rawAuth.geocodingEmail) || void 0
    }
  };
}, "normalizeSettingsOpenDataConfig");
var normalizeOperatorTuning = /* @__PURE__ */ __name((raw) => {
  const base = raw && typeof raw === "object" ? raw : {};
  const strictness = base.validationStrictness === "strict" || base.validationStrictness === "permissive" ? base.validationStrictness : "balanced";
  const phaseBudgets = base.phaseBudgets && typeof base.phaseBudgets === "object" ? base.phaseBudgets : {};
  const sourcePolicy = base.sourcePolicy && typeof base.sourcePolicy === "object" ? base.sourcePolicy : {};
  return {
    explorationRatio: clamp2(toNumber(base.explorationRatio, 0.35), 0, 1),
    preferredDomainWeight: clamp2(toNumber(base.preferredDomainWeight, 0.7), 0, 1),
    noveltyFloor: clamp2(toNumber(base.noveltyFloor, 0.2), 0, 1),
    authorityFloor: clamp2(toNumber(base.authorityFloor, 70), 0, 100),
    validationStrictness: strictness,
    phaseBudgets: {
      phase05: Math.max(1, Math.floor(toNumber(phaseBudgets.phase05, 6))),
      phase2b: Math.max(1, Math.floor(toNumber(phaseBudgets.phase2b, 8))),
      phase3b: Math.max(1, Math.floor(toNumber(phaseBudgets.phase3b, 8)))
    },
    sourcePolicy: {
      preferred: normalizeDomainWeightMap(sourcePolicy.preferred),
      suppressed: normalizeDomainWeightMap(sourcePolicy.suppressed),
      blocked: normalizeDomainList(sourcePolicy.blocked)
    }
  };
}, "normalizeOperatorTuning");
var normalizeSourceLearning = /* @__PURE__ */ __name((raw, maxEntries = 300) => {
  const values = Array.isArray(raw) ? raw : [];
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const entry of values) {
    const item = entry && typeof entry === "object" ? entry : null;
    if (!item) continue;
    const domain2 = String(item.domain || "").trim().toLowerCase();
    if (!domain2 || seen.has(domain2)) continue;
    seen.add(domain2);
    out.push({
      domain: domain2,
      runsSeen: Math.max(0, Math.floor(toNumber(item.runsSeen, 0))),
      runsValidated: Math.max(0, Math.floor(toNumber(item.runsValidated, 0))),
      citationSurvivalRate: clamp2(toNumber(item.citationSurvivalRate, 0), 0, 1),
      authorityAvg: clamp2(toNumber(item.authorityAvg, 0), 0, 100),
      recencyAvg: clamp2(toNumber(item.recencyAvg, 0), 0, 1),
      lastSeenAt: Math.max(0, Math.floor(toNumber(item.lastSeenAt, Date.now())))
    });
  }
  return out.sort((a, b) => b.lastSeenAt - a.lastSeenAt).slice(0, Math.max(10, maxEntries));
}, "normalizeSourceLearning");
var normalizeSettingsPayload = /* @__PURE__ */ __name((rawPayload) => {
  if (!rawPayload || typeof rawPayload !== "object") {
    return { error: "settings payload required." };
  }
  const payload = rawPayload;
  const schemaVersion = Number(payload.schemaVersion ?? SETTINGS_SCHEMA_VERSION);
  if (schemaVersion !== SETTINGS_SCHEMA_VERSION) {
    return { error: "Unsupported settings schema version." };
  }
  const provider = payload.provider === "openai" ? "openai" : "google";
  const runConfig = normalizeRunConfig(payload.runConfig);
  const modelOverrides = normalizeModelOverrides(payload.modelOverrides);
  const keyOverrides = normalizeSettingsKeyOverrides(payload.keyOverrides);
  const openDataConfig = normalizeSettingsOpenDataConfig(payload.openDataConfig);
  const settings = {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    provider,
    runConfig,
    modelOverrides,
    keyOverrides,
    openDataConfig
  };
  if (Object.prototype.hasOwnProperty.call(payload, "operatorTuning")) {
    settings.operatorTuning = normalizeOperatorTuning(payload.operatorTuning);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "sourceLearning")) {
    settings.sourceLearning = normalizeSourceLearning(payload.sourceLearning);
  }
  return { settings };
}, "normalizeSettingsPayload");
var summarizeDomains = /* @__PURE__ */ __name((entries, max = 5) => {
  const counts = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    const [, domainRaw] = entry.split("@");
    if (!domainRaw) continue;
    const domain2 = domainRaw.toLowerCase();
    counts.set(domain2, (counts.get(domain2) || 0) + 1);
  }
  const summary = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, max).map(([domain2, count3]) => `${domain2}:${count3}`).join(", ");
  return summary || "none";
}, "summarizeDomains");
var delay = /* @__PURE__ */ __name((ms) => new Promise((resolve) => setTimeout(resolve, ms)), "delay");
var fetchWithRetry = /* @__PURE__ */ __name(async (url, options, attempts = 3, context2) => {
  let lastResponse = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await outboundFetch(url, options, context2);
    lastResponse = response;
    if (!response.ok && (response.status >= 500 || response.status === 429)) {
      if (attempt < attempts - 1) {
        await delay(400 * (attempt + 1));
        continue;
      }
    }
    return response;
  }
  return lastResponse;
}, "fetchWithRetry");
var isEmailRule = /* @__PURE__ */ __name((rule) => {
  if (!rule || typeof rule !== "object") return false;
  return "email" in rule;
}, "isEmailRule");
var replaceEmailIncludeRules = /* @__PURE__ */ __name((includeRules, emailRules) => {
  const updated = [];
  let inserted = false;
  for (const rule of includeRules) {
    if (isEmailRule(rule)) {
      if (!inserted) {
        updated.push(...emailRules);
        inserted = true;
      }
      continue;
    }
    if (rule && typeof rule === "object") {
      updated.push(rule);
    }
  }
  if (!inserted) {
    updated.push(...emailRules);
  }
  return updated;
}, "replaceEmailIncludeRules");
var getPolicyField = /* @__PURE__ */ __name((policy, snake, camel) => {
  if (snake in policy) return policy[snake];
  if (camel in policy) return policy[camel];
  return void 0;
}, "getPolicyField");
var summarizeCloudflareApiFailure = /* @__PURE__ */ __name((response, payload) => {
  const status = response.status;
  const apiErrors = Array.isArray(payload?.errors) ? payload.errors.map((entry) => {
    const code = typeof entry?.code === "number" || typeof entry?.code === "string" ? String(entry.code) : "unknown";
    const message = typeof entry?.message === "string" ? entry.message : "unknown error";
    return `${code}:${message}`;
  }).filter(Boolean) : [];
  if (apiErrors.length > 0) {
    return `status ${status} (${apiErrors.join("; ")})`;
  }
  return `status ${status}`;
}, "summarizeCloudflareApiFailure");
var fetchAccessPolicy = /* @__PURE__ */ __name(async (env2) => {
  const { CF_API_TOKEN, CF_ACCOUNT_ID, CF_ACCESS_APP_ID, CF_ACCESS_POLICY_ID } = env2;
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID || !CF_ACCESS_APP_ID || !CF_ACCESS_POLICY_ID) {
    throw new Error("Cloudflare Access policy secrets are not configured.");
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/access/apps/${CF_ACCESS_APP_ID}/policies/${CF_ACCESS_POLICY_ID}`;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${CF_API_TOKEN}`
  };
  const currentResponse = await fetchWithRetry(url, { method: "GET", headers }, 3, "cloudflare");
  const currentText = await currentResponse.text();
  let currentJson;
  try {
    currentJson = JSON.parse(currentText);
  } catch (_) {
    throw new Error("Unable to parse Cloudflare policy response.");
  }
  if (!currentResponse.ok || !currentJson?.success) {
    throw new Error(`Failed to fetch Cloudflare Access policy (${summarizeCloudflareApiFailure(currentResponse, currentJson)}).`);
  }
  return {
    policy: currentJson.result,
    url,
    headers
  };
}, "fetchAccessPolicy");
var extractAllowlistEntries = /* @__PURE__ */ __name((policy) => {
  const includeRules = Array.isArray(policy.include) ? policy.include : [];
  const entries = [];
  for (const rule of includeRules) {
    if (!rule || typeof rule !== "object") continue;
    const emailRule = rule.email;
    if (!emailRule) continue;
    if (typeof emailRule === "string") {
      entries.push(emailRule);
      continue;
    }
    if (typeof emailRule === "object" && typeof emailRule.email === "string") {
      entries.push(emailRule.email);
    }
  }
  return Array.from(new Set(entries.map((entry) => entry.trim().toLowerCase()).filter(Boolean))).sort();
}, "extractAllowlistEntries");
var updateAccessPolicy = /* @__PURE__ */ __name(async (env2, entries) => {
  const { policy: currentPolicy, url, headers } = await fetchAccessPolicy(env2);
  const includeRules = Array.isArray(currentPolicy.include) ? currentPolicy.include : [];
  const emailRules = entries.map((entry) => ({ email: { email: entry } }));
  const updatedInclude = replaceEmailIncludeRules(includeRules, emailRules);
  if (updatedInclude.length === 0) {
    throw new Error("Allowlist update would remove all include rules.");
  }
  const payload = {
    name: currentPolicy.name,
    decision: currentPolicy.decision,
    include: updatedInclude,
    exclude: getPolicyField(currentPolicy, "exclude", "exclude") || [],
    require: getPolicyField(currentPolicy, "require", "require") || [],
    precedence: getPolicyField(currentPolicy, "precedence", "precedence"),
    session_duration: getPolicyField(currentPolicy, "session_duration", "sessionDuration"),
    purpose_justification_required: getPolicyField(
      currentPolicy,
      "purpose_justification_required",
      "purposeJustificationRequired"
    ),
    purpose_justification_prompt: getPolicyField(
      currentPolicy,
      "purpose_justification_prompt",
      "purposeJustificationPrompt"
    ),
    approval_required: getPolicyField(currentPolicy, "approval_required", "approvalRequired"),
    approval_groups: getPolicyField(currentPolicy, "approval_groups", "approvalGroups"),
    isolation_required: getPolicyField(currentPolicy, "isolation_required", "isolationRequired")
  };
  for (const [key, value] of Object.entries(payload)) {
    if (value === void 0) delete payload[key];
  }
  const updateResponse = await fetchWithRetry(
    url,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(payload)
    },
    3,
    "cloudflare"
  );
  const updateText = await updateResponse.text();
  let updateJson;
  try {
    updateJson = JSON.parse(updateText);
  } catch (_) {
    throw new Error("Unable to parse Cloudflare policy update response.");
  }
  if (!updateResponse.ok || !updateJson?.success) {
    throw new Error(`Failed to update Cloudflare Access policy (${summarizeCloudflareApiFailure(updateResponse, updateJson)}).`);
  }
}, "updateAccessPolicy");
var readJsonBody = /* @__PURE__ */ __name(async (request, maxBytes) => {
  const text = await request.text();
  if (text.length > maxBytes) {
    return { error: "Request body too large." };
  }
  try {
    return { data: JSON.parse(text) };
  } catch (_) {
    return { error: "Invalid JSON payload." };
  }
}, "readJsonBody");
var worker_default = {
  async fetch(request, env2) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const corsHeaders = getCorsHeaders(origin, env2);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (url.pathname === "/api/rag/query") {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405, corsHeaders);
      }
      const { data, error: error3 } = await readJsonBody(request, MAX_RAG_QUERY_BODY_BYTES);
      if (error3) {
        return json({ error: error3 }, 400, corsHeaders);
      }
      const query = typeof data?.query === "string" ? data.query.trim() : "";
      if (!query) {
        return json({ error: "Query required." }, 400, corsHeaders);
      }
      const topK = clamp2(Number(data?.topK ?? 6), 1, 20);
      const rawFilters = data?.filters && typeof data.filters === "object" ? data.filters : {};
      const toList = /* @__PURE__ */ __name((value) => Array.isArray(value) ? value.filter((v) => typeof v === "string") : [], "toList");
      const filters = {
        docIds: toList(rawFilters.docIds),
        sourceFiles: toList(rawFilters.sourceFiles),
        types: toList(rawFilters.types),
        tags: toList(rawFilters.tags)
      };
      const hits = querySocrataRag(query, { topK, filters });
      return json({ hits }, 200, corsHeaders);
    }
    if (url.pathname === "/api/rag/chunks") {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405, corsHeaders);
      }
      const { data, error: error3 } = await readJsonBody(request, MAX_RAG_QUERY_BODY_BYTES);
      if (error3) {
        return json({ error: error3 }, 400, corsHeaders);
      }
      const rawIds = Array.isArray(data?.ids) ? data.ids : [];
      const ids = rawIds.filter((value) => typeof value === "string");
      if (ids.length === 0) {
        return json({ error: "Chunk ids required." }, 400, corsHeaders);
      }
      const limit = clamp2(Number(data?.limit ?? MAX_RAG_CHUNK_IDS), 1, MAX_RAG_CHUNK_IDS);
      const chunks = getSocrataRagChunksById(ids, limit);
      return json({ chunks }, 200, corsHeaders);
    }
    if (url.pathname === "/api/open-data/fetch") {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405, corsHeaders);
      }
      const { data, error: error3 } = await readJsonBody(request, MAX_OPEN_DATA_PROXY_BODY_BYTES);
      if (error3) {
        return json({ error: error3 }, 400, corsHeaders);
      }
      const target = typeof data?.url === "string" ? data.url.trim() : "";
      if (!target) {
        return json({ error: "Target URL required." }, 400, corsHeaders);
      }
      let targetUrl;
      try {
        targetUrl = new URL(target);
      } catch (_) {
        return json({ error: "Invalid target URL." }, 400, corsHeaders);
      }
      if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
        return json({ error: "Unsupported URL protocol." }, 400, corsHeaders);
      }
      if (isPrivateHostname(targetUrl.hostname)) {
        return json({ error: "Blocked private network target." }, 400, corsHeaders);
      }
      const headers = sanitizeProxyHeaders(data?.headers);
      let upstream;
      try {
        upstream = await outboundFetch(targetUrl.toString(), { method: "GET", headers }, "open-data");
      } catch (_) {
        return json({ error: "Upstream fetch failed." }, 502, corsHeaders);
      }
      const responseHeaders = new Headers(corsHeaders);
      const contentType = upstream.headers.get("content-type");
      if (contentType) responseHeaders.set("Content-Type", contentType);
      const cacheControl = upstream.headers.get("cache-control");
      if (cacheControl) responseHeaders.set("Cache-Control", cacheControl);
      const lastModified = upstream.headers.get("last-modified");
      if (lastModified) responseHeaders.set("Last-Modified", lastModified);
      const etag = upstream.headers.get("etag");
      if (etag) responseHeaders.set("ETag", etag);
      return new Response(upstream.body, {
        status: upstream.status,
        headers: responseHeaders
      });
    }
    if (url.pathname === "/api/access/allowlist") {
      if (request.method !== "GET" && request.method !== "POST" && request.method !== "PUT") {
        return json({ error: "Method not allowed" }, 405, corsHeaders);
      }
      const getPolicyTimestamp = /* @__PURE__ */ __name((policy) => {
        return getPolicyField(policy, "updated_at", "updatedAt") || getPolicyField(policy, "modified_on", "modifiedOn") || null;
      }, "getPolicyTimestamp");
      const loadAllowlistSnapshot = /* @__PURE__ */ __name(async () => {
        const { policy } = await fetchAccessPolicy(env2);
        const entries = extractAllowlistEntries(policy);
        const entriesHash = await hashEntries(entries);
        const stored2 = await env2.ACCESS_ALLOWLIST_KV.get(ACCESS_ALLOWLIST_KEY, "json");
        const policyUpdatedAt = getPolicyTimestamp(policy);
        const updatedAt2 = stored2?.updatedAt || policyUpdatedAt || (/* @__PURE__ */ new Date()).toISOString();
        const version2 = stored2?.version || 0;
        const record2 = {
          updatedAt: updatedAt2,
          updatedBy: null,
          version: version2,
          count: entries.length,
          entriesHash
        };
        if (!stored2 || stored2.entriesHash !== entriesHash || stored2.count !== entries.length || stored2.updatedBy) {
          await env2.ACCESS_ALLOWLIST_KV.put(ACCESS_ALLOWLIST_KEY, JSON.stringify(record2));
        }
        return { entries, record: record2 };
      }, "loadAllowlistSnapshot");
      if (request.method === "GET") {
        try {
          const { entries, record: record2 } = await loadAllowlistSnapshot();
          const responseBody = {
            entries,
            updatedAt: record2.updatedAt || null,
            updatedBy: record2.updatedBy || null,
            version: record2.version,
            count: entries.length,
            policyUpdated: false
          };
          const headers = {
            ...corsHeaders,
            "ETag": record2.updatedAt || ""
          };
          return json(responseBody, 200, headers);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to fetch allowlist.";
          return json({ error: message }, 502, corsHeaders);
        }
      }
      const accessJwt = request.headers.get(ACCESS_JWT_HEADER);
      const accessEmail = request.headers.get(ACCESS_EMAIL_HEADER)?.toLowerCase() || "";
      if (!accessJwt || !accessEmail) {
        return json({ error: "Access authentication required." }, 403, corsHeaders);
      }
      const adminEmails = getAdminEmails(env2);
      if (adminEmails.size > 0 && !adminEmails.has(accessEmail)) {
        return json({ error: "Not authorized to update allowlist." }, 403, corsHeaders);
      }
      const { data, error: error3 } = await readJsonBody(request, MAX_ALLOWLIST_BODY_BYTES);
      if (error3) {
        return json({ error: error3 }, 400, corsHeaders);
      }
      const expectedUpdatedAt = (data?.expectedUpdatedAt || request.headers.get("If-Match") || "").trim();
      const stored = await env2.ACCESS_ALLOWLIST_KV.get(ACCESS_ALLOWLIST_KEY, "json");
      if (stored?.updatedAt && !expectedUpdatedAt) {
        return json({ error: "expectedUpdatedAt is required for updates.", updatedAt: stored.updatedAt }, 428, corsHeaders);
      }
      if (stored?.updatedAt && expectedUpdatedAt && stored.updatedAt !== expectedUpdatedAt) {
        try {
          const { entries, record: record2 } = await loadAllowlistSnapshot();
          return json({
            error: "Allowlist has been updated since last fetch.",
            updatedAt: record2.updatedAt,
            updatedBy: record2.updatedBy,
            entries,
            count: entries.length,
            version: record2.version
          }, 409, corsHeaders);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Allowlist has been updated since last fetch.";
          return json({ error: message }, 409, corsHeaders);
        }
      }
      const normalized = normalizeAllowlistEntries(data?.entries);
      if (normalized.error) {
        return json({ error: normalized.error }, 400, corsHeaders);
      }
      if (normalized.invalid.length > 0) {
        return json({ error: "Invalid email entries.", invalid: normalized.invalid }, 400, corsHeaders);
      }
      if (normalized.entries.length > MAX_ALLOWLIST_ENTRIES) {
        return json({ error: `Allowlist exceeds ${MAX_ALLOWLIST_ENTRIES} entries.` }, 400, corsHeaders);
      }
      try {
        await updateAccessPolicy(env2, normalized.entries);
      } catch (err) {
        console.error("Allowlist policy update failed.", {
          count: normalized.entries.length,
          domains: summarizeDomains(normalized.entries)
        });
        const message = err instanceof Error ? err.message : "Policy update failed.";
        return json({ error: message }, 502, corsHeaders);
      }
      const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      const record = await buildAllowlistMetadata({
        entries: normalized.entries,
        updatedAt,
        version: (stored?.version || 0) + 1
      });
      await env2.ACCESS_ALLOWLIST_KV.put(ACCESS_ALLOWLIST_KEY, JSON.stringify(record));
      console.log("Allowlist updated.", {
        count: normalized.entries.length,
        domains: summarizeDomains(normalized.entries)
      });
      return json({
        entries: normalized.entries,
        updatedAt: record.updatedAt,
        updatedBy: record.updatedBy,
        version: record.version,
        count: normalized.entries.length,
        policyUpdated: true
      }, 200, corsHeaders);
    }
    if (url.pathname === "/api/settings") {
      if (request.method !== "GET" && request.method !== "PUT") {
        return json({ error: "Method not allowed" }, 405, corsHeaders);
      }
      const accessJwt = request.headers.get(ACCESS_JWT_HEADER);
      const accessEmail = request.headers.get(ACCESS_EMAIL_HEADER)?.toLowerCase() || "";
      if (!accessJwt || !accessEmail) {
        return json({ error: "Access authentication required." }, 401, corsHeaders);
      }
      const storageKey = SHARED_SETTINGS_KEY;
      const userStorageKey = await getSettingsStorageKey(accessEmail);
      const legacyUserStorageKey = getLegacySettingsKey(accessEmail);
      const loadStoredSettings = /* @__PURE__ */ __name(async () => {
        const current = await env2.SETTINGS_KV.get(SHARED_SETTINGS_KEY, "json");
        if (current) {
          return {
            record: current,
            key: SHARED_SETTINGS_KEY,
            legacy: false,
            staleKeys: [userStorageKey, legacyUserStorageKey]
          };
        }
        const userScoped = await env2.SETTINGS_KV.get(userStorageKey, "json");
        if (userScoped) {
          return {
            record: userScoped,
            key: SHARED_SETTINGS_KEY,
            legacy: true,
            staleKeys: [userStorageKey, legacyUserStorageKey]
          };
        }
        const legacy2 = await env2.SETTINGS_KV.get(legacyUserStorageKey, "json");
        if (legacy2) {
          return {
            record: legacy2,
            key: SHARED_SETTINGS_KEY,
            legacy: true,
            staleKeys: [userStorageKey, legacyUserStorageKey]
          };
        }
        return { record: null, key: SHARED_SETTINGS_KEY, legacy: false, staleKeys: [userStorageKey, legacyUserStorageKey] };
      }, "loadStoredSettings");
      if (request.method === "GET") {
        const { record: stored2, legacy: legacy2, staleKeys: staleKeys2 } = await loadStoredSettings();
        let resolved = stored2 ? {
          settings: stripSettingsForKv(stored2.settings),
          updatedAt: stored2.updatedAt,
          updatedBy: null,
          version: stored2.version
        } : null;
        if (stored2 && (legacy2 || stored2.updatedBy)) {
          await env2.SETTINGS_KV.put(storageKey, JSON.stringify(resolved));
          for (const staleKey of staleKeys2) {
            if (staleKey !== SHARED_SETTINGS_KEY) {
              await env2.SETTINGS_KV.delete(staleKey);
            }
          }
        }
        const responseBody = {
          settings: resolved ? resolved.settings : null,
          updatedAt: resolved?.updatedAt || null,
          updatedBy: resolved?.updatedBy || null,
          version: resolved?.version || 0
        };
        const headers = {
          ...corsHeaders,
          "ETag": resolved?.updatedAt || ""
        };
        return json(responseBody, 200, headers);
      }
      const { data, error: error3 } = await readJsonBody(request, MAX_SETTINGS_BODY_BYTES);
      if (error3) {
        return json({ error: error3 }, 400, corsHeaders);
      }
      const expectedUpdatedAt = (data?.expectedUpdatedAt || request.headers.get("If-Match") || "").trim();
      const expectedVersionRaw = data?.expectedVersion;
      const expectedVersion = Number.isFinite(Number(expectedVersionRaw)) ? Number(expectedVersionRaw) : null;
      const { record: stored, legacy, staleKeys } = await loadStoredSettings();
      const storedSanitized = stored ? {
        settings: stripSettingsForKv(stored.settings),
        updatedAt: stored.updatedAt,
        updatedBy: null,
        version: stored.version
      } : null;
      const redactStoredIfNeeded = /* @__PURE__ */ __name(async () => {
        if (stored && (legacy || stored.updatedBy)) {
          await env2.SETTINGS_KV.put(storageKey, JSON.stringify(storedSanitized));
          for (const staleKey of staleKeys) {
            if (staleKey !== SHARED_SETTINGS_KEY) {
              await env2.SETTINGS_KV.delete(staleKey);
            }
          }
        }
      }, "redactStoredIfNeeded");
      if (stored?.updatedAt && !expectedUpdatedAt && expectedVersion === null) {
        return json({
          error: "expectedUpdatedAt or expectedVersion is required for updates.",
          updatedAt: stored.updatedAt,
          version: stored.version
        }, 428, corsHeaders);
      }
      if (stored?.updatedAt) {
        if (expectedUpdatedAt && stored.updatedAt !== expectedUpdatedAt) {
          await redactStoredIfNeeded();
          return json({
            error: "Settings have been updated since last fetch.",
            updatedAt: storedSanitized?.updatedAt || null,
            updatedBy: storedSanitized?.updatedBy || null,
            version: storedSanitized?.version || 0,
            settings: storedSanitized?.settings || null
          }, 409, corsHeaders);
        }
        if (expectedVersion !== null && stored.version !== expectedVersion) {
          await redactStoredIfNeeded();
          return json({
            error: "Settings version mismatch.",
            updatedAt: storedSanitized?.updatedAt || null,
            updatedBy: storedSanitized?.updatedBy || null,
            version: storedSanitized?.version || 0,
            settings: storedSanitized?.settings || null
          }, 409, corsHeaders);
        }
      }
      const { settings, error: settingsError } = normalizeSettingsPayload(data?.settings);
      if (settingsError) {
        return json({ error: settingsError }, 400, corsHeaders);
      }
      const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      const record = {
        settings: stripSettingsForKv(settings),
        updatedAt,
        updatedBy: null,
        version: (stored?.version || 0) + 1
      };
      await env2.SETTINGS_KV.put(storageKey, JSON.stringify(record));
      for (const staleKey of staleKeys) {
        if (staleKey !== SHARED_SETTINGS_KEY) {
          await env2.SETTINGS_KV.delete(staleKey);
        }
      }
      console.log("Settings updated.", {
        version: record.version,
        provider: record.settings.provider,
        modelOverrides: Object.keys(record.settings.modelOverrides || {}).length
      });
      return json({
        settings: record.settings,
        updatedAt: record.updatedAt,
        updatedBy: record.updatedBy,
        version: record.version
      }, 200, corsHeaders);
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, corsHeaders);
    }
    if (url.pathname === "/api/openai/responses") {
      if (!env2.OPENAI_API_KEY) {
        return json({ error: "OPENAI_API_KEY not configured" }, 500, corsHeaders);
      }
      const body = await request.json();
      const upstream = await outboundFetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env2.OPENAI_API_KEY}`
        },
        body: JSON.stringify(body)
      }, "openai");
      const text = await upstream.text();
      return new Response(text, {
        status: upstream.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    if (url.pathname === "/api/gemini/generateContent") {
      if (!env2.GEMINI_API_KEY) {
        return json({ error: "GEMINI_API_KEY not configured" }, 500, corsHeaders);
      }
      const payload = await request.json();
      const genAI = new GoogleGenAI({ apiKey: env2.GEMINI_API_KEY, fetch: createScopedFetch("gemini") });
      const response = await genAI.models.generateContent(payload);
      const out = {
        text: response.text,
        candidates: response.candidates || []
      };
      return json(out, 200, corsHeaders);
    }
    return json({ error: "Not found" }, 404, corsHeaders);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-ngBtf1/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-ngBtf1/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

@google/genai/dist/web/index.mjs:
@google/genai/dist/web/index.mjs:
@google/genai/dist/web/index.mjs:
@google/genai/dist/web/index.mjs:
@google/genai/dist/web/index.mjs:
  (**
   * @license
   * Copyright 2025 Google LLC
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
//# sourceMappingURL=worker.js.map
