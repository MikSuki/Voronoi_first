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


