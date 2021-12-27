// util.js
{
    /**
     * 向量
     * @param {Point} a 
     * @param {Point} b 
     * @returns {Point} 
     */
    function vector(a, b) {
        return new Point(
            a.x - b.x,
            a.y - b.y
        );
    }

    /**
     * 外積
     * @param {Point} v1 
     * @param {Point} v2 
     * @returns {number} 
     */
    function cross(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }

    /**
     * 角度 (rad)
     * @param {Point} p 
     * @returns {number} 
     */
    function getDegree(p) {
        return Math.atan2(p.y, p.x)// * 180 / Math.PI
    }

    /**
     * 取得 中垂線 perpendicular bisector 
     * @param {Vertex} a 
     * @param {Vertex} b 
     * @returns {Line} 
     */
    function getPB(a, b) {
        // return 鉛直線
        if (a.y == b.y) {
            let x = (a.x + b.x) / 2
            return {
                a: { x: x, y: 0 },
                b: { x: x, y: SIZE.h }
            }
        }
        // swap
        if (a.x > b.x) [a, b] = [b, a]

        const middle = {
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2
        },
            // y = slope * x + k
            slope = -1 / (a.y - b.y) * (a.x - b.x),
            k = middle.y - slope * middle.x;

        let c = { x: 0, y: slope * 0 + k },
            d = { x: SIZE.w, y: slope * SIZE.w + k };
        if (slope < 0) {
            if (c.y > SIZE.h) c = { x: (SIZE.h - k) / slope, y: SIZE.h }
            if (d.y < 0) d = { x: -k / slope, y: 0 }
        }
        else {
            if (c.y < 0) c = { x: -k / slope, y: 0 }
            if (d.y > SIZE.h) d = { x: (SIZE.h - k) / slope, y: SIZE.h }
        }

        c.x = Math.round(c.x)
        c.y = Math.round(c.y)
        d.x = Math.round(d.x)
        d.y = Math.round(d.y)


        return new Line(c, d);
    }


    /**
     * 用 外積 和 右手定理 來判斷點在有向線段的左或右側
     * 但在 canvas 的 y 是由上往下遞增，所以會相反
     * @param {Vertex} p1 線段起點
     * @param {Vertex} p2 線段終點
     * @param {Vertex} p  判斷的點
     * @returns {boolean} true -> 右側
     *                    false-> 左側
     *                    null -> 三點共線
     */
    function getPtDir(p1, p2, p) {
        const v1 = vector(p2, p1),
            v2 = vector(p, p1);
        if (cross(v1, v2) == 0) return null;
        return cross(v1, v2) > 0;
    }

    /**
     * p 是否超過邊界 bound
     * @param {Point} p 
     * @param {*} bound 
     * @returns {boolean}
     */
    function outOfBound(p, bound) {
        if (bound != undefined) return p.x < bound.min || p.x > bound.max || p.y < 0 || p.y > SIZE.h
        return p.x < 0 || p.x > SIZE.w || p.y < 0 || p.y > SIZE.h
    }

    /**
     * 兩直線交點
     * @param {Line} line1 
     * @param {Line} line2 
     * @returns {Point} 
     */
    function getIntersection(line1, line2) {
        const a = vector(line1.b, line1.a),
            b = vector(line2.b, line2.a),
            s = vector(line2.a, line1.a)

        // 兩線重疊，交點無限多。
        if (cross(a, b) == 0) return null;

        const m = cross(s, b) / cross(a, b)
        a.x *= m
        a.y *= m

        return {
            x: Math.round(line1.a.x + a.x),//.toFixed(3),
            y: Math.round(line1.a.y + a.y)//.toFixed(3)
        }
    }

    /**
     * 兩線段交點，沒交點則為 null
     * @param {Line} line1 
     * @param {Line} line2 
     * @returns {Point} 
     */
    function getSegmentIntersection(line1, line2) {
        const i = getIntersection(line1, line2);

        let x1, x2, y1, y2;
        [x1, x2] = line1.a.x > line1.b.x ? [line1.b.x, line1.a.x] : [line1.a.x, line1.b.x];
        [y1, y2] = line1.a.y > line1.b.y ? [line1.b.y, line1.a.y] : [line1.a.y, line1.b.y];
        let x3, x4, y3, y4;
        [x3, x4] = line2.a.x > line2.b.x ? [line2.b.x, line2.a.x] : [line2.a.x, line2.b.x];
        [y3, y4] = line2.a.y > line2.b.y ? [line2.b.y, line2.a.y] : [line2.a.y, line2.b.y];
        /*
            TODO:  有限線段  交點
        */

        if (i == null) return null
        if (i.x >= x1 && i.x <= x2 && i.y >= y1 && i.y <= y2 &&
            i.x >= x3 && i.x <= x4 && i.y >= y3 && i.y <= y4) return i
        return null
    }

    /**
     * 直線在畫布<上面>或<下面>的交點
     * @param {Line} line 
     * @param {boolean} isFindTop 
     * @returns 
     */
    function getCanvasIntersection(line, isFindTop) {
        let lines = [],
            intersections = []

        if (isFindTop) lines.push({ a: { x: 0, y: SIZE.h }, b: { x: SIZE.w, y: SIZE.h } })
        else lines.push({ a: { x: 0, y: 0 }, b: { x: SIZE.w, y: 0 } })
        lines.push({ a: { x: 0, y: 0 }, b: { x: 0, y: SIZE.h } })
        lines.push({ a: { x: SIZE.w, y: 0 }, b: { x: SIZE.w, y: SIZE.h } })

        lines.forEach(e => {
            const i = getIntersection(e, line)
            if (i != null) intersections.push(i)
        });

        if (line.a.y == line.b.y) {
            if (isFindTop) intersections.sort((a, b) => a.x - b.x)
            else intersections.sort((a, b) => b.x - a.x)
        }
        else {
            if (isFindTop) intersections.sort((a, b) => b.y - a.y)
            else intersections.sort((a, b) => a.y - b.y)
        }

        for (let i = 0; i < intersections.length; ++i)
            if (!outOfBound(intersections[i])) return intersections[i]
        return null
    }

    /**
     * 點是否再線段a,b上
     * @param {Point} a 
     * @param {Point} b 
     * @param {Point} pt 
     * @returns {boolean}
     */
    function ptOnSegment(a, b, pt) {
        let x1, x2, y1, y2;
        [x1, x2] = a.x > b.x ? [b.x, a.x] : [a.x, b.x];
        [y1, y2] = a.y > b.y ? [b.y, a.y] : [a.y, b.y];

        const slope = (a.y - b.y) / (a.x - b.x)
        const k = a.y - slope * a.x


        return (x1 <= pt.x && pt.x <= x2 && y1 <= pt.y && pt.y <= y2) &&
            Math.abs(pt.y - slope * pt.x - k) <= PRECISION
    }

    /**
     * 用 pt 向右的射線
     * 判斷是否在 edges 形成的多邊形裡面
     * inside: cnt % 2 == 1 (左側)
     * outside: cnt % 2 == 0  (右側)
     * @param {Point} pt 
     * @param {Array<Edge>} edges 
     * @returns {DIR}
     */
    function ptInPolygon(pt, edges) {
        const ray = {
            a: {
                x: pt.x,
                y: pt.y
            },
            b: {
                x: Number.MAX_SAFE_INTEGER /*SIZE.w*/,
                y: pt.y
            }
        },
            intersections = [];
        let cnt = 0,
            intersection;

        edges.forEach(edge => {
            const line2 = {
                a: {
                    x: edge.start.x,
                    y: edge.start.y
                },
                b: {
                    x: edge.end.x,
                    y: edge.end.y
                }
            }
            if ((intersection = getSegmentIntersection(ray, line2)) != null) {
                // 排除掉剛好碰到某邊的 end 和另一邊 start 的情況
                let repeat = false;
                for (let i = 0; i < intersections.length; ++i) {
                    if (same(intersection, intersections[i])) {
                        repeat = true
                        break
                    }
                }
                if (!repeat) {
                    ++cnt
                    intersections.push(intersection)
                }
            }
        })

        if (cnt % 2 == 1) return DIR.LEFT
        return DIR.RIGHT
    }

    /**
     * 判斷線有沒有穿過 edges 形成的多邊形
     * @param {Line} line 
     * @param {Array<Edge>} edges 
     * @returns {boolean}
     */
    function linePassPolygon(line, edges) {
        for (let i = 0; i < edges.length; ++i)
            if (getSegmentIntersection(
                line,
                { a: edges[i].start, b: edges[i].end }
            ) != null)
                return true
        return false
    }

    /**
     * 兩點是否相同
     * @param {Point} a 
     * @param {Point} b 
     * @returns {boolean}
     */
    function same(a, b) {
        return a.x == b.x && a.y == b.y;
    }

    /**
     * 產生隨機顏色色碼
     * @returns {string}
     */
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    /**
     * 逆時針排序 edges
     * @param {Array<Edge>} edges 
     * @returns {Array<Edge>}
     */
    function sortToCCW(edges) {
        // 畫布座標的 y 值會相反，所以用遞減
        return edges.sort((a, b) => b.deg - a.deg)
    }

    /**
     * @async
     * 等待 step-by-step button click
     */
    async function waitForPause() {
        while (true) {
            if (!FLAG.pause) { FLAG.pause = true; return };
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}

// var.js
{
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

}

// file.js
{
    /**
     * read file - event
     * 讀取完畢後存入 buffer 中
     * @param {HTMLInputElement} HTMLelement 
     * @param {Boolean} isInput 
     */
    function readFile(HTMLelement, isInput) {
        const fr = new FileReader();
        fr.onload = function () {
            if (isInput)
                BUFFER.input = fr.result.split('\r\n').filter(Boolean);
            else
                BUFFER.output = fr.result.split('\r\n').filter(Boolean);
            Voronoi.input_cnt = 0;
            console.log('load');
            this.value = null;
        }
        fr.readAsText(HTMLelement.files[0], ENCODING);
        this.value = null;
    }


    /**
     * 輸出檔案至瀏覽器預設 download folder
     * @param {String} data content
     * @param {String} type filename extension
     * @param {String} name file name 
     */
    function SaveAs(data, type, name) {
        const link = document.createElement("a");
        const exportName = name ? name : 'data';
        const url = 'data:text/' + type + ';charset=utf-8,\uFEFF' + encodeURI(data);
        link.href = url;
        link.download = exportName + "." + type;
        link.click();
    }
}

// render.js
{
    class Render {
        constructor() {
            this.canvas = document.getElementById(NAME.canvas)
            this.canvas.width = SIZE.w //+ 200
            this.canvas.height = SIZE.h //+ 100
            this.canvas.addEventListener('click', onMouseClick)
            this.canvas.addEventListener('mousemove', onMouseMove)
            this.ctx = canvas.getContext('2d')
            this.ctx.font = "20px Georgia";
        }

        update(polygons, color) {
            const a = polygons[0],
                b = polygons[1];
            this.drawCircle(a.x, a.y, color)
            this.drawCircle(b.x, b.y, color)

            const pair = getPB(a, b)
            vertices
            this.ctx.strokeStyle = "red"
            this.ctx.beginPath()
            this.ctx.moveTo(pair[0].x, pair[0].y)
            this.ctx.lineTo(pair[1].x, pair[1].y)
            this.ctx.stroke();
        }

        drawCircle(p, color) {
            this.ctx.strokeStyle = color
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, SIZE.polygon, 0, 2 * Math.PI);
            this.ctx.stroke();
        }

        drawLine(a, b, color) {
            // a.x += 100
            // b.x += 100
            const headlen = 10,
                mx = (a.x + b.x) / 2,
                my = (a.y + b.y) / 2,
                dx = b.x - a.x,
                dy = b.y - a.y,
                angle = Math.atan2(dy, dx)

            this.ctx.strokeStyle = color
            this.ctx.beginPath()
            this.ctx.moveTo(a.x, a.y)
            this.ctx.lineTo(b.x, b.y)
            if (FLAG.draw_arrow) {
                this.ctx.moveTo(mx, my)
                this.ctx.lineTo(mx - headlen * Math.cos(angle - Math.PI / 6), my - headlen * Math.sin(angle - Math.PI / 6))
                this.ctx.moveTo(mx, my)
                this.ctx.lineTo(mx - headlen * Math.cos(angle + Math.PI / 6), my - headlen * Math.sin(angle + Math.PI / 6))

            }
            this.ctx.stroke()
        }

        drawText(p, text) {
            this.ctx.fillText(text, p.x, p.y);
        }

        clear() {
            this.ctx.clearRect(0, 0, SIZE.w, SIZE.h);
        }

        loop() {

        }
    }

}

// winged_edge.js
{
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    class Line {
        constructor(a, b, c, d) {
            if (arguments.length == 4) {
                this.a = new Point(a, b);
                this.b = new Point(c, d);
            }
            else if (arguments.length == 2) {
                this.a = a;
                this.b = b;
            }
            else {
                throw ('create Line erroe');
            }
        }
    }

    class Edge {
        /**
         * 
         * @param {Vertex} start start vertex
         * @param {Vertex} end  end vertex
         * @param {Polygon} polygon_l left polygon
         * @param {Polygon} polygon_r right polygon
         * @param {Edge} edge_pred_cw edge cw around start vertex
         * @param {Edge} edge_pred_cww edge ccw around start vertex
         * @param {Edge} edge_succ_cw edge ccw around end vertex
         * @param {Edge} edge_succ_cww edge ccw around end vertex
         */
        constructor(start, end, polygon_l, polygon_r, edge_pred_cw, edge_pred_ccw, edge_succ_cw, edge_succ_ccw) {
            this.start = start;
            this.end = end;
            this.polygon_l = polygon_l;
            this.polygon_r = polygon_r;
            this.edge_pred_cw = null;
            this.edge_pred_ccw = null;
            this.edge_succ_cw = null;
            this.edge_succ_ccw = null;
            // from start
            this.edge_pred_cw = edge_pred_cw;
            this.edge_pred_ccw = edge_pred_ccw;
            // from end
            this.edge_succ_cw = edge_succ_cw;
            this.edge_succ_ccw = edge_succ_ccw;
        }

        /**
         * 
         * @param {Edge} edge_pred_cw 
         * @param {Edge} edge_pred_ccw 
         * @param {Edge} edge_succ_cw 
         * @param {Edge} edge_succ_ccw 
         */
        setAroundEdges(edge_pred_cw, edge_pred_ccw, edge_succ_cw, edge_succ_ccw) {
            this.edge_pred_cw = edge_pred_cw;
            this.edge_pred_ccw = edge_pred_ccw;
            this.edge_succ_cw = edge_succ_cw;
            this.edge_succ_ccw = edge_succ_ccw;
        }

        /**
         * 是否為最外圍的邊
         * @returns {boolean}
         */
        isOuterEdge() {
            return this.polygon_r == null;
        }
    }

    class Vertex extends Point {
        /**
         * @param {boolean} w true: ordinary point, false: point at infinity
         * @param {number} x 
         * @param {number} y 
         * @param {Edge} edge 
         */
        constructor(w, x, y, edge) {
            super(x, y);
            this.w = w;
            this.edge = edge;
            this.used = 1; // 被幾個邊所指到
        }
    }

    class Polygon extends Point {
        /**
         * @param {number} x 
         * @param {number} y 
         * @param {Edge} edge 
         */
        constructor(x, y, edge) {
            super(x, y);
            this.edge = edge;
            /** @type {!number} 出現次數*/
            this.time = 1;
        }
    }

    class WingedEdge {
        /**
         * @param {Array<Vertex>} vertices 
         * @param {Array<Polygon>} polygons 
         * @param {Array<Edge>} edges 
         * @param {Array} convexHull 
         * @param {String} color 
         * @param {CanvasRenderingContext2D} render 
         */
        constructor(vertices, polygons, edges, convexHull, state, render, outerEdges) {
            this.vertices = vertices;
            this.polygons = polygons;
            this.edges = edges;
            this.outerVertices = null;
            this.outerEdges = outerEdges;
            this.outerPolygons = null;
            this.middle = null;
            // this.state = state;
            this.convexHull = convexHull;
            this.render = render;
        }

        /**
         * 用 curve 找到 convex hull -> O(n)
         */
        getConvexHull() {
            const edges = this.edges;
            let start = null;
            for (let i = 0; i < edges.length; ++i) {
                if (edges[i].isOuterEdge()) {
                    start = edges[i];
                    break;
                }
            }
            const convexHull = [start.polygon_l];
            let cur = start.edge_succ_ccw;
            while (cur != start) {
                convexHull.push(cur.polygon_l);
                cur = cur.edge_succ_ccw
            }
        }

        draw(state) {
            let polygonColor, edgeColor;
            switch (state) {
                case STATE.LEFT: [polygonColor, edgeColor] = [COLOR.POLYGON.LEFT, COLOR.EDGE.LEFT]; break;
                case STATE.RIGHT: [polygonColor, edgeColor] = [COLOR.POLYGON.RIGHT, COLOR.EDGE.RIGHT]; break;
                case STATE.MIX: [polygonColor, edgeColor] = [COLOR.POLYGON.MIX, COLOR.EDGE.MIX]; break;
                default: throw ('wrong color');
            }
            this.polygons.forEach(e => {
                Main.render.drawCircle(e, polygonColor)
            })

            this.edges.forEach(e => {
                Main.render.drawLine(e.start, e.end, edgeColor);
            })

            if (FLAG.draw_Vertices)
                this.vertices.forEach(v => {
                    if (v.w) Main.render.drawCircle(v, polygonColor);
                    else Main.render.drawCircle(v, polygonColor);
                })

            if (FLAG.draw_Convex_Hull) {
                let last = this.convexHull.length - 1
                for (let i = 0; i < this.convexHull.length; ++i) {
                    Main.render.drawLine(this.convexHull[last], this.convexHull[i], COLOR.CONVEX);
                    last = i
                }
            }
        }
    }



}

// voronoi.js
{
    const Voronoi = {
        /** @type {Polygon[]} */
        polygons: [],
        /** @type {?WingedEdge} */
        WE: null,
        /** @type {!number} */
        input_cnt: 0,
        /**
         * 加入一個點
         * @param {number} x 
         * @param {number} y 
         */
        add: function (x, y) {
            // 重複點
            for (let i = 0; i < this.polygons.length; ++i)
                if (same(this.polygons[i], { x: x, y: y })) {
                    ++this.polygons[i].time;
                    return;
                }

            const polygon = new Polygon(x, y, null);
            this.polygons.push(polygon);
        },
        /**
         * 建立 Voronoi Diagram
         */
        start: async function () {
            FLAG.is_start = true;
            this.polygons.sort((a, b) => a.x - b.x);
            this.WE = await this.divideAndConquer(
                0,
                this.polygons.length - 1,
                null
            );

            console.debug(this.WE);
            if (!FLAG.stepByStep) {
                Main.render.clear();
                this.WE.draw(STATE.MIX);
            }
            FLAG.is_start = false;
        },

        /**
         * 讀取 <輸入文字檔案> 的下一個測資
         */
        next: function () {
            let k = this.input_cnt;
            // comment
            while (BUFFER.input[k][0] == '#') {
                console.log(BUFFER.input[k]);
                ++k;
            }
            if (BUFFER.input[k][0] != '0') {
                let end = k + parseInt(BUFFER.input[k]) + 1;
                this.clear();
                for (let i = k + 1; i < end; ++i) {
                    const pair = BUFFER.input[i].split(' ');
                    this.add(parseInt(pair[0]), parseInt(pair[1]));
                    console.log(BUFFER.input[i]);
                }
                this.input_cnt = end;
                this.start();
            } else {
                console.log('end');
            }
        },

        /**
         * 讀取 <輸出文字檔案> ，並直接顯示圖形
         */
        readOutput: function () {
            this.clear();
            let i = 0;
            const edges = [];
            while (BUFFER.output[i][0] == 'P') {
                const arr = BUFFER.output[i].split(' ');
                const polygon = new Polygon(parseInt(arr[1]), parseInt(arr[2]), null)
                this.polygons.push(polygon);
                Main.render.drawCircle(polygon, COLOR.POLYGON.MIX);
                ++i;
            }
            while (i < BUFFER.output.length) {
                const arr = BUFFER.output[i].split(' ');
                Main.render.drawLine(
                    new Vertex(true, parseInt(arr[1]), parseInt(arr[2])),
                    new Vertex(true, parseInt(arr[3]), parseInt(arr[4])),
                    COLOR.EDGE.MIX
                );
                ++i;
            }
        },

        /**
         * 清除所有東西
         */
        clear: function () {
            this.polygons = [];
            this.WE = null;
            Main.render.clear();
        },

        /**
         * recursive 到 <= 2個 polygons 後，建立 voronoi
         * @param {number} start polygons start index
         * @param {number} end polygons end index
         * @param {boolean} dir 
         * @returns {WingedEdge}
         */
        divideAndConquer: async function (start, end, dir) {
            if (start == end)
                return new WingedEdge(
                    [], [this.polygons[start]], [], [this.polygons[start]],
                    dir == DIR.LEFT ? COLOR.left : COLOR.right,
                    Main.render
                );
            else if (end - start <= 1)
                return this.buildVD(start, end, dir);


            const idx = ~~((start + end) / 2),
                WE_l = await this.divideAndConquer(start, idx, DIR.LEFT),
                WE_r = await this.divideAndConquer(idx + 1, end, DIR.RIGHT);

            // draw 左右兩邊
            if (FLAG.stepByStep) {
                Main.render.clear();
                WE_l.draw(STATE.LEFT);
                WE_r.draw(STATE.RIGHT);
                await waitForPause();
            }
            // draw 合併後
            const { WE, HPs } = this.merge(WE_l, WE_r);
            if (FLAG.stepByStep) {
                HPs.forEach(e => { Main.render.drawLine(e.start, e.end, COLOR.hp) })
                await waitForPause();
                Main.render.clear();
                WE.draw(STATE.MIX);
                await waitForPause();
            }
            return WE;
        },

        /**
         * 建立只有2個 vertexs 的 voronoi diagram
         * @param {number} start polygons start index
         * @param {number} end polygons end index
         * @param {boolean} dir 
         * @returns {WingedEdge}
         */
        buildVD: function (start, end, dir) {
            const polygons = [this.polygons[start], this.polygons[end]],
                vertices = [],
                edges = [],
                outerEdges = [];
            PB = getPB(polygons[0], polygons[1]),
                v1 = new Vertex(false, PB.a.x, PB.a.y, null),
                v2 = new Vertex(false, PB.b.x, PB.b.y, null);

            let poly_l, poly_r;
            if (getPtDir(v1, v2, polygons[0]) == dir)
                [poly_l, poly_r] = [polygons[1], polygons[0]];
            else
                [poly_l, poly_r] = [polygons[0], polygons[1]];

            vertices.push(v1, v2);
            // if (dir == DIR.LEFT)
            //     edges.push(new Edge(v2, v1, poly_l, poly_r, null, null, null, null));
            // else
            //     edges.push(new Edge(v1, v2, poly_l, poly_r, null, null, null, null));

            const e1 = new Edge(v1, v2, poly_l, poly_r, null, null, null, null);
            const e2 = new Edge(v2, v1, poly_l, null, null, null, null, null);
            const e3 = new Edge(v1, v2, poly_r, null, null, null, null, null);
            e1.setAroundEdges(e2, e3, e3, e2);
            e2.setAroundEdges(e3, e1, e1, e3);
            e3.setAroundEdges(e2, e1, e1, e2);
            edges.push(e1);
            outerEdges.push(e2, e3);

            const convexHull = polygons;

            return new WingedEdge(
                vertices,
                polygons,
                edges,
                convexHull,
                dir == DIR.LEFT ? COLOR.left : COLOR.right,
                Main.render,
                outerEdges
            );
        },

        /**
         * 合併左右兩邊的 convex hull
         * @param {Array<Polygon>} poly_l 
         * @param {Array<Polygon>} poly_r 
         * @returns {Array}
         */
        mixConvexHull: function (poly_l, poly_r) {
            // return data
            const convexHull = [];
            let lowest_l, lowest_r, highest_l, highest_r;

            // 右圖最左邊的點 and 左圖最右邊的點 之 index
            let idx_leftmost = getIdx(poly_r, true),
                idx_rightmost = getIdx(poly_l, false);

            // 連接左右 convex hull 的兩條切線
            [lowest_l, lowest_r] = findTangent(poly_l, poly_r, idx_rightmost, idx_leftmost);
            [highest_r, highest_l] = findTangent(poly_r, poly_l, idx_leftmost, idx_rightmost);

            // draw
            if (FLAG.draw_Convex_Hull_Connect) {
                Main.render.drawLine(poly_l[lowest_l], poly_r[lowest_r], COLOR.TANGENT);
                Main.render.drawLine(poly_l[highest_l], poly_r[highest_r], COLOR.TANGENT);
            }

            // 建立 convex hull 
            // loop 左邊 lowest 到 highest and 右邊 highest 到 lowest
            let k = lowest_l;
            while (k != highest_l) {
                convexHull.push(poly_l[k]);
                if (++k >= poly_l.length) k = 0
            }
            convexHull.push(poly_l[k])
            k = highest_r
            while (k != lowest_r) {
                convexHull.push(poly_r[k]);
                if (++k >= poly_r.length) k = 0
            }
            convexHull.push(poly_r[k])

            return [
                poly_l[lowest_l],
                poly_r[lowest_r],
                poly_l[highest_l],
                poly_r[highest_r],
                convexHull
            ]

            function getIdx(polygons, findLeftmost) {
                let max = findLeftmost ? { x: Infinity } : { x: -Infinity },
                    idx;

                for (let i = 0; i < polygons.length; ++i)
                    if ((findLeftmost && polygons[i].x < max.x) ||
                        (!findLeftmost && polygons[i].x > max.x)) {
                        max.x = polygons[i].x;
                        idx = i;
                    }

                return idx;
            }

            function findTangent(poly_l, poly_r, idx_1, idx_2) {
                let idx_l = idx_1,
                    idx_r = idx_2,
                    f_l = true,
                    f_r = true;

                while (f_l || f_r) {
                    while (f_l) {
                        const next = (idx_l + 1 >= poly_l.length) ? 0 : idx_l + 1;
                        const dir = getPtDir(poly_r[idx_r], poly_l[idx_l], poly_l[next]);
                        if (dir == DIR.RIGHT) {
                            idx_l = next;
                            f_r = true;
                        } else
                            f_l = false;
                        // else if (dir == DIR.LEFT)
                        //     f_l = false;
                        // 共線
                        // else {

                        // }
                    }
                    while (f_r) {
                        let next = (idx_r - 1 < 0) ? poly_r.length - 1 : idx_r - 1;
                        if (getPtDir(poly_l[idx_l], poly_r[idx_r], poly_r[next]) == DIR.LEFT) {
                            idx_r = next;
                            f_l = true;
                        } else
                            f_r = false;
                    }
                }

                return [idx_l, idx_r];
            }
        },

        merge: function (WE_l, WE_r) {
            let edges = [];
            // 左右convex hull切線 和 合併後的convex hull
            let [lowest_l, lowest_r, highest_l, highest_r, convexHull] = this.mixConvexHull(WE_l.convexHull, WE_r.convexHull);
            // const [lowest_l, lowest_r, highest_l, highest_r, convexHull] = this.mixConvexHull(WE_l.convexHull, WE_r.convexHull);

            // hyperplane的點 和 建立中垂線的polygons
            const [intersections, polygonUsed] = this.getIntersectionsIn2WE(
                WE_l.polygons.slice(),
                WE_r.polygons.slice(), [lowest_l, lowest_r, highest_l, highest_r]
            );

            // 點共線 or 只有一個在螢畫布外的交點
            // 直接 return WE
            if (intersections.length == 0 ||
                (intersections.length == 1 && outOfBound(intersections[0]))) {

                const polygons = WE_l.polygons.concat(WE_r.polygons)
                const vertices = [];
                const HPs = [];
                polygons.sort((a, b) => a.y - b.y)

                for (let i = 1; i < polygons.length; ++i) {
                    const PB = getPB(polygons[i - 1], polygons[i]),
                        v1 = new Vertex(false, PB.a.x, PB.a.y, null),
                        v2 = new Vertex(false, PB.b.x, PB.b.y, null);
                    vertices.push(v1, v2)
                    edges.push(new Edge(v1, v2, polygons[i - 1], polygons[i]))
                    HPs.push(new Edge(v1, v2, polygons[i - 1], polygons[i]))
                }

                // if (intersections.length == 0)
                //     convexHull = [polygons[0], polygons[polygons.length - 1]]

                return {
                    WE: new WingedEdge(
                        vertices,
                        polygons,
                        edges,
                        convexHull,
                        null,
                        Main.render,
                    ),
                    HPs: HPs,
                }
            }

            // else 建立 HP
            let HPs, newVertices;
            [HPs, newVertices] = this.buildHP(
                intersections,
                polygonUsed, [lowest_l, lowest_r, highest_l, highest_r],
                WE_l.polygons.length + WE_r.polygons.length
            );


            // draw HP
            {
                if (FLAG.draw_HP)
                    HPs.forEach(e => { Main.render.drawLine(e.start, e.end, COLOR.hp) })
            }

            // 切掉兩側超過 HP 的邊
            {
                let HPs_copy = HPs.slice(0);
                HPs_copy = this.cutEdgeOverHp(HPs_copy, WE_l, edges, DIR.LEFT);
                HPs_copy = this.cutEdgeOverHp(HPs_copy, WE_r, edges, DIR.RIGHT);
            }


            // 移除兩側超過 HP 的邊
            {
                this.removeEdgeOnHpOtherSide(HPs, WE_l, DIR.RIGHT);
                this.removeEdgeOnHpOtherSide(HPs, WE_r, DIR.LEFT);
            }


            // 修改 HP 中超過畫布的點的 x,y 值
            {
                for (let i = 0; i < HPs.length; ++i) {
                    if (linePassPolygon({ a: HPs[i].start, b: HPs[i].end }, BORDER)) {
                        if (outOfBound(HPs[i].start)) {
                            let idx = newVertices.indexOf(HPs[i].start)
                            const pt = getCanvasIntersection({ a: HPs[i].start, b: HPs[i].end },
                                DIR.TOP
                            );
                            HPs[i].start = new Vertex(false, pt.x, pt.y, null)
                            newVertices.push(HPs[i].start)
                            if (--newVertices[idx].used <= 0)
                                newVertices.splice(idx, 1)
                        }
                        if (outOfBound(HPs[i].end)) {
                            let idx = newVertices.indexOf(HPs[i].end)
                            const pt = getCanvasIntersection({ a: HPs[i].start, b: HPs[i].end },
                                DIR.BOTTOM
                            );
                            HPs[i].end = new Vertex(false, pt.x, pt.y, null)
                            newVertices.push(HPs[i].end)
                            if (--newVertices[idx].used <= 0)
                                newVertices.splice(idx, 1)
                        }
                    }
                }
            }

            return {
                WE: new WingedEdge(
                    WE_l.vertices.concat(WE_r.vertices.concat(newVertices)),
                    WE_l.polygons.concat(WE_r.polygons),
                    edges.concat(WE_l.edges.concat(WE_r.edges.concat(HPs))),
                    convexHull,
                    getRandomColor(),
                    Main.render,
                ),
                HPs: HPs,
            }
        },

        getIntersectionsIn2WE: function (poly_l, poly_r, lowAndHigh) {
            const polygonUsed = [],
                intersections = [];
            const lowest_l = lowAndHigh[0],
                lowest_r = lowAndHigh[1];
            let start_l = lowAndHigh[2],
                start_r = lowAndHigh[3],
                PB = getPB(start_l, start_r),
                intersection_l = pushIntersections(poly_l, PB, start_r, start_l),
                intersection_r = pushIntersections(poly_r, PB, start_l, start_r)

            let lastIntesection = { x: MAX_Y, y: MAX_Y },
                lastPoly_l, lastPoly_r;

            polygonUsed.push({
                l: start_l,
                r: start_r
            })

            while (start_l != lowest_l || start_r != lowest_r) {
                let max_l = { intersection: { y: MIN_Y } },
                    max_r = { intersection: { y: MIN_Y } };

                for (let i = 0; i < intersection_l.length; ++i)
                    if (intersection_l[i].intersection.y <= lastIntesection.y) {
                        max_l = intersection_l[i]
                        break
                    }

                for (let i = 0; i < intersection_r.length; ++i)
                    if (intersection_r[i].intersection.y <= lastIntesection.y) {
                        max_r = intersection_r[i]
                        break
                    }

                if (max_l.intersection.y == MIN_Y && max_r.intersection.y == MIN_Y) {
                    break
                } else if (max_l.intersection.y > max_r.intersection.y) {
                    lastPoly_l = start_l
                    start_l = max_l.polygon
                    poly_l.splice(poly_l.indexOf(start_l), 1)
                    intersections.push(max_l.intersection)
                    lastIntesection = max_l.intersection
                } else {
                    lastPoly_r = start_r
                    start_r = max_r.polygon
                    poly_r.splice(poly_r.indexOf(start_r), 1)
                    intersections.push(max_r.intersection)
                    lastIntesection = max_r.intersection
                }
                polygonUsed.push({
                    l: start_l,
                    r: start_r
                })
                PB = getPB(start_l, start_r)
                intersection_l = pushIntersections(poly_l, PB, start_r, start_l, lastPoly_l)
                intersection_r = pushIntersections(poly_r, PB, start_l, start_r, lastPoly_r)
                lastPoly_l = start_l
                lastPoly_r = start_r
            }

            return [intersections, polygonUsed]


            // 回傳除了 p_cur, p_last 以外的所有 polygons 跟 p_a 之中垂線和 PB 的交點
            function pushIntersections(polygons, PB, p_a, p_cur, p_last) {
                let result = []
                polygons.forEach(polygon => {
                    if (polygon == p_cur || polygon == p_last) return
                    const intersection = getIntersection(PB, getPB(polygon, p_a))
                    if (intersection == null) {
                        return
                    }
                    result.push({
                        intersection,
                        polygon: polygon
                    })
                })

                return result.sort((a, b) => b.intersection.y - a.intersection.y)
            }
        },

        buildHP: function (intersections, polygonUsed, lowAndHigh, polys_len) {
            const HP = [],
                vertices = [];
            let lowest_l, lowest_r, highest_l, highest_r;
            [lowest_l, lowest_r, highest_l, highest_r] = [lowAndHigh[0], lowAndHigh[1], lowAndHigh[2], lowAndHigh[3]];

            // 只會有一個交點時  (num of vertices = 3)
            if (intersections.length == 1 /*&& polys_len == 3*/) {
                const PB1 = getPB(highest_l, highest_r),
                    PB2 = getPB(lowest_l, lowest_r);

                let v_top1, v_top2, v_bottom1, v_bottom2;

                const top = getCanvasIntersection(PB1, DIR.TOP),
                    bottom = getCanvasIntersection(PB2, DIR.BOTTOM);
                v_top1 = new Vertex(false, top.x, top.y, null)
                v_top2 = new Vertex(true, intersections[0].x, intersections[0].y, null)
                v_bottom1 = v_top2
                v_bottom2 = new Vertex(false, bottom.x, bottom.y, null)
                ++v_top2.used
                vertices.push(v_top1, v_top2, v_bottom2);

                HP.push(
                    new Edge(v_top1, v_top2, highest_l, highest_r),
                    new Edge(v_bottom1, v_bottom2, lowest_l, lowest_r)
                )

                return [HP, vertices]
            }


            let last;

            last = new Vertex(true, intersections[0].x, intersections[0].y, null)
            --last.used


            for (let i = 1; i < intersections.length; ++i) {
                let cur;

                if (same(last, intersections[i])) {
                    cur = last
                    ++last.used
                } else {
                    cur = new Vertex(true, intersections[i].x, intersections[i].y, null)
                }

                HP.push(
                    new Edge(
                        last,
                        cur,
                        polygonUsed[i].l,
                        polygonUsed[i].r
                    )
                )

                if (!same(last, cur))
                    vertices.push(last)

                ++last.used
                last = cur
            }
            vertices.push(last)

            let vertex_start, vertex_end, edge_start, edge_end;
            // 修改 HP 的起始邊                               方向和其他相反，所以 polygon 需對調
            [edge_start, vertex_start] = modifyOuterEdge(HP[0], highest_r, highest_l, DIR.TOP);
            // 修改 HP 的結束邊
            [edge_end, vertex_end] = modifyOuterEdge(HP[HP.length - 1], lowest_l, lowest_r, DIR.BOTTOM);

            if (vertex_start != null) vertices.unshift(vertex_start)
            if (vertex_end != null) vertices.push(vertex_end)
            if (edge_start != null) HP.unshift(edge_start)
            if (edge_end != null) HP.push(edge_end)

            // 移除 start = end 的邊
            HP.forEach(e => {
                if (e.start.x == e.end.x && e.start.y == e.end.y)
                    HP.splice(HP.indexOf(e), 1)
            })
            return [HP, vertices]


            function modifyOuterEdge(edge, polygon_l, polygon_r, isFindTop) {
                let pt = isFindTop == DIR.TOP ? edge.start : edge.end,
                    v = null,
                    e = null;

                // if (outOfBound(pt)) {
                //     // const i = getCanvasIntersection({ a: edge.start, b: edge.end }, isFindTop);
                //     // [pt.w, pt.x, pt.y] = [false, i.x, i.y];
                // }
                // else {
                const i = getCanvasIntersection(getPB(polygon_l, polygon_r), isFindTop)
                if (linePassPolygon({ a: i, b: pt }, BORDER)) {
                    ++pt.used
                    v = new Vertex(false, i.x, i.y, null)
                    if (isFindTop)
                        e = new Edge(v, pt, polygon_r, polygon_l)
                    else
                        e = new Edge(pt, v, polygon_l, polygon_r)
                }

                // }

                return [e, v]
            }
        },

        cutEdgeOverHp: function (HPs, WE, edges, dir) {
            for (let j = 0; j < WE.edges.length; ++j) {
                let flag = false
                const segment = WE.edges[j]
                for (let i = 0; i < HPs.length; ++i) {
                    let onStart = ptOnSegment(segment.start, segment.end, HPs[i].start),
                        onEnd = ptOnSegment(segment.start, segment.end, HPs[i].end),
                        cut;

                    if (onStart || onEnd || (cut = getSegmentIntersection({ a: segment.start, b: segment.end }, { a: HPs[i].start, b: HPs[i].end })) != null) {
                        if (onStart) cut = HPs[i].start
                        else if (onEnd) cut = HPs[i].end
                        else {
                            cut = new Vertex(true, cut.x, cut.y, null)
                            WE.vertices.push(cut)
                            --cut.used
                        }
                        if (same(cut, segment.start) || same(cut, segment.end))
                            continue

                        if (getPtDir(HPs[i].start, HPs[i].end, segment.start) == dir) {
                            if (--segment.end.used <= 0)
                                WE.vertices.splice(WE.vertices.indexOf(segment.end), 1)
                            segment.end = cut

                        } else {
                            if (--segment.start.used <= 0)
                                WE.vertices.splice(WE.vertices.indexOf(segment.start), 1)
                            segment.start = cut
                        }
                        ++cut.used // 被新的一條邊指到
                        flag = true
                    }
                }
                if (flag) {
                    edges.push(segment)
                    WE.edges.splice(j, 1)
                    --j
                }
            }

            return HPs
        },

        removeEdgeOnHpOtherSide: function (HPs, WE, dir) {
            const wrongDir = [] // 在 HP 另一側的 vertices

            for (let i = 0; i < WE.vertices.length; ++i) {
                const pt = WE.vertices[i];
                if (ptInPolygon(pt, HPs) == dir)
                    wrongDir.push(pt)
            }

            for (let i = 0; i < WE.edges.length; ++i) {
                let idx1 = wrongDir.indexOf(WE.edges[i].start),
                    idx2 = wrongDir.indexOf(WE.edges[i].end);
                // 在HP的另一邊
                if (idx1 != -1 && idx2 != -1) {
                    if (--WE.edges[i].start.used <= 0)
                        WE.vertices.splice(WE.vertices.indexOf(WE.edges[i].start), 1)
                    if (--WE.edges[i].end.used <= 0)
                        WE.vertices.splice(WE.vertices.indexOf(WE.edges[i].end), 1)
                    WE.edges.splice(i, 1)
                    --i
                }
            }
        },

        /**
         * @returns {string} 輸入點的座標，與執行結果的所有線段
         */
        getResult: function () {
            const edges = this.WE.edges;
            let result = '';
            // swap edge 的起點跟終點
            edges.forEach(e => {
                if (e.start.x > e.end.x ||
                    (e.start.x == e.end.y && e.start.y > e.end.y))
                    [e.start, e.end] = [e.end, e.start];
            });
            // sort edges to <lexical order>
            edges.sort((a, b) => {
                let flag = -1;
                if (a.start.x > b.start.x) flag = 1;
                else if (a.start.x == b.start.x) {
                    if (a.start.y > b.start.y) flag = 1;
                    else if (a.start.y == b.start.y) {
                        if (a.end.x > b.end.x) flag = 1;
                        else if (a.end.x == b.end.x && a.end.y > b.end.y) flag = 1;
                    }
                }
                return flag;
            });


            this.polygons.forEach(p => {
                for (let i = 0; i < p.time; ++i)
                    result += 'P ' + p.x + ' ' + p.y + '\r\n';
            });
            edges.forEach(e => {
                result += 'E ' + e.start.x + ' ' + e.start.y + ' ' + e.end.x + ' ' + e.end.y + '\r\n';
            });


            if (FLAG.log_download_file) {
                this.polygons.forEach(p => {
                    console.debug('P ' + p.x + ' ' + p.y);
                });
                edges.forEach(e => {
                    console.debug('E ' + e.start.x + ' ' + e.start.y + ' ' + e.end.x + ' ' + e.end.y);
                });
            }

            return result;
        },
    }
}

// event.js
{
    /**
     * 滑鼠點擊 canvas event
     * @param {Event} event 
     */
    function onMouseClick(event) {
        if (!FLAG.inputByMouse) return
        Voronoi.add(event.layerX, event.layerY)
        Main.render.drawCircle({ x: event.layerX, y: event.layerY }, 'green')
    }

    /**
     * 滑鼠移動 canvas event
     * @param {Event} event 
     */
    function onMouseMove(event) {
        document.getElementById(NAME.coordinate).innerHTML =
            'x: ' + event.layerX + ' y: ' + event.layerY;
    }

    function addInputEvent(element_id, flag) {
        document.getElementById(element_id)
            .addEventListener('change', (() => {
                return function () { readFile(this, flag); }
            })());
    }

    /**
     * Run-button & Step by step-button click event
     * 執行 voronoi 
     * @param {Boolean} stepByStep 
     */
    function start(stepByStep) {
        FLAG.stepByStep = stepByStep;
        const func = (() => {
            switch (INPUT_MODE) {
                case 0: return () => { Voronoi.start(); }
                case 1: return () => { Voronoi.next(); }
                default: return () => { Voronoi.readOutput(); }
            }
        })();

        // FLAG.inputByMouse ?
        //     () => { Voronoi.start() } : () => { Voronoi.next() };

        if (stepByStep) {
            if (!FLAG.is_start) func();
            else FLAG.pause = false;
        }
        else {
            func();
        }
    }

    /**
     * download-button click event
     */
    function downloadFile() {
        const type = '';
        const name = '';
        SaveAs(Voronoi.getResult(), type, name);
    }

}

// main.js
{
    window.onload = () => {
        addInputEvent(NAME.input, true);
        addInputEvent(NAME.output, false);
        Main.render = new Render();
    }
}
