/// <reference types="node" />
import { Readable, Writable } from 'stream';
export declare class RotatingFileStreamError extends Error {
    code: string;
    constructor();
}
export declare type Compressor = (source: string, dest: string) => string;
export declare type Generator = (time: number | Date, index?: number) => string;
interface RotatingFileStreamEvents {
    close: () => void;
    drain: () => void;
    error: (err: Error) => void;
    finish: () => void;
    pipe: (src: Readable) => void;
    unpipe: (src: Readable) => void;
    external: (stdout: string, stderr: string) => void;
    history: () => void;
    open: (filename: string) => void;
    removed: (filename: string, number: boolean) => void;
    rotation: () => void;
    rotated: (filename: string) => void;
    warning: (error: Error) => void;
}
export declare interface RotatingFileStream extends Writable {
    addListener<Event extends keyof RotatingFileStreamEvents>(event: Event, listener: RotatingFileStreamEvents[Event]): this;
    emit<Event extends keyof RotatingFileStreamEvents>(event: Event, ...args: Parameters<RotatingFileStreamEvents[Event]>): boolean;
    on<Event extends keyof RotatingFileStreamEvents>(event: Event, listener: RotatingFileStreamEvents[Event]): this;
    once<Event extends keyof RotatingFileStreamEvents>(event: Event, listener: RotatingFileStreamEvents[Event]): this;
    prependListener<Event extends keyof RotatingFileStreamEvents>(event: Event, listener: RotatingFileStreamEvents[Event]): this;
    prependOnceListener<Event extends keyof RotatingFileStreamEvents>(event: Event, listener: RotatingFileStreamEvents[Event]): this;
    removeListener<Event extends keyof RotatingFileStreamEvents>(event: Event, listener: RotatingFileStreamEvents[Event]): this;
}
export interface Options {
    compress?: boolean | string | Compressor;
    encoding?: BufferEncoding;
    history?: string;
    immutable?: boolean;
    initialRotation?: boolean;
    interval?: string;
    intervalBoundary?: boolean;
    maxFiles?: number;
    maxSize?: string;
    mode?: number;
    omitExtension?: boolean;
    path?: string;
    rotate?: number;
    size?: string;
    teeToStdout?: boolean;
}
interface Opts {
    compress?: string | Compressor;
    encoding?: BufferEncoding;
    history?: string;
    immutable?: boolean;
    initialRotation?: boolean;
    interval?: {
        num: number;
        unit: string;
    };
    intervalBoundary?: boolean;
    maxFiles?: number;
    maxSize?: number;
    mode?: number;
    omitExtension?: boolean;
    path?: string;
    rotate?: number;
    size?: number;
    teeToStdout?: boolean;
}
declare type Callback = (error?: Error) => void;
interface Chunk {
    chunk: Buffer;
    encoding: BufferEncoding;
}
export declare class RotatingFileStream extends Writable {
    private createGzip;
    private exec;
    private file;
    private filename;
    private finished;
    private fsCreateReadStream;
    private fsCreateWriteStream;
    private fsOpen;
    private fsReadFile;
    private fsStat;
    private generator;
    private initPromise;
    private last;
    private maxTimeout;
    private next;
    private options;
    private prev;
    private rotation;
    private size;
    private stdout;
    private timeout;
    private timeoutPromise;
    constructor(generator: Generator, options: Opts);
    _destroy(error: Error, callback: Callback): void;
    _final(callback: Callback): void;
    _write(chunk: Buffer, encoding: BufferEncoding, callback: Callback): void;
    _writev(chunks: Chunk[], callback: Callback): void;
    private refinal;
    private rewrite;
    private init;
    private makePath;
    private reopen;
    private reclose;
    private now;
    private rotate;
    private findName;
    private move;
    private touch;
    private classical;
    private clear;
    private intervalBoundsBig;
    private intervalBounds;
    private interval;
    private compress;
    private gzip;
    private rotated;
    private history;
    private immutate;
}
export declare function createStream(filename: string | Generator, options?: Options): RotatingFileStream;
export {};
