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
            case STATE.RIGHT:  [polygonColor, edgeColor] = [COLOR.POLYGON.RIGHT, COLOR.EDGE.RIGHT]; break;
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


