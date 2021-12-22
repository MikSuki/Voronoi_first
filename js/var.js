const SIZE = {
    w: 600,
    h: 600,
    polygon: 5
}

const NAME = {
    input: 'input_file',
    output: 'output_file',
    coordinate: 'coordinate',
    canvas: 'canvas'
}

const Main = {
    render: null
}

const DIR = Object.freeze({
    RIGHT: true,
    LEFT: false,
    TOP: true,
    BOTTOM: false
})

const MIN_Y = Number.MIN_SAFE_INTEGER
const MAX_Y = Number.MAX_SAFE_INTEGER
const PRECISION = 3

let WE1, WE2, WE3

const BORDER = [
    { start: { x: 1, y: 1 }, end: { x: SIZE.w - 1, y: 1 } },
    { start: { x: SIZE.w - 1, y: 1 }, end: { x: SIZE.w - 1, y: SIZE.h - 1 } },
    { start: { x: SIZE.w - 1, y: SIZE.h - 1 }, end: { x: 1, y: SIZE.h - 1 } },
    { start: { x: 1, y: SIZE.h - 1 }, end: { x: 1, y: 1 } }
]

/**
 * 0-> 滑鼠輸入, 
 * 1-> 輸入文字檔案, 
 * 2-> 輸出文字檔案
 */
const INPUT_MODE_ENUM = Object.freeze({
    mouse: 0,
    input_file: 1,
    output_file: 2
});
let INPUT_MODE = INPUT_MODE_ENUM.mouse;

const FLAG = {
    /* 
        control
    */
    inputByMouse: true,
    inputFile: true,
    stepByStep: /*!*/false,
    pause: true,
    is_start: false,

    /*
        draw
    */
    draw_Convex_Hull: true,
    // draw_Convex_Hull_Connect: true,
    // draw_Vertices: true,
    draw_HP: true,
    // draw_arrow: true,
    draw_VD: true,

    /* 
        log
    */
    // log_HP: true
    log_download_file: true,
}

const COLOR = Object.freeze({
    TANGENT: 'black',
    POLYGON: Object.freeze({
        LEFT: 'red',
        RIGHT: 'blue',
        MIX: 'green',
    }),
    EDGE: Object.freeze({
        LEFT: 'red',
        RIGHT: 'blue',
        MIX: 'purple',
    }),
    CONVEX: 'orange',
    hp: 'black',
});

const STATE = Object.freeze({
    LEFT: 0,
    RIGHT: 1,
    MIX: 2,
});

const BUFFER = {
    input: null, // <輸入>文字檔案
    output: null, // <輸出>文字檔案
};

const ENCODING = 'UTF8'
