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

    stop: async function () {

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
        }
        else {
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
                [],
                [this.polygons[start]],
                [],
                [this.polygons[start]],
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
        const WE = this.merge(WE_l, WE_r);
        if (FLAG.stepByStep) {
            Main.render.clear();
            WE.draw(STATE.MIX);
            await waitForPause()
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
                    }
                    else
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
                    }
                    else
                        f_r = false;
                }
            }

            return [idx_l, idx_r];
        }
    },

    merge: /*async*/ function (WE_l, WE_r) {
        let edges = [];
        // 左右convex hull切線 和 合併後的convex hull
        let [lowest_l, lowest_r, highest_l, highest_r, convexHull] = this.mixConvexHull(WE_l.convexHull, WE_r.convexHull);
        // const [lowest_l, lowest_r, highest_l, highest_r, convexHull] = this.mixConvexHull(WE_l.convexHull, WE_r.convexHull);

        // hyperplane的點 和 建立中垂線的polygons
        const [intersections, polygonUsed] = this.getIntersectionsIn2WE(
            WE_l.polygons.slice(),
            WE_r.polygons.slice(),
            [lowest_l, lowest_r, highest_l, highest_r]
        );

        // 點共線 or 只有一個在螢畫布外的交點
        // 直接 return WE
        if (intersections.length == 0 ||
            (intersections.length == 1 && outOfBound(intersections[0]))) {

            const polygons = WE_l.polygons.concat(WE_r.polygons)
            const vertices = []
            polygons.sort((a, b) => a.y - b.y)

            for (let i = 1; i < polygons.length; ++i) {
                const PB = getPB(polygons[i - 1], polygons[i]),
                    v1 = new Vertex(false, PB.a.x, PB.a.y, null),
                    v2 = new Vertex(false, PB.b.x, PB.b.y, null);
                vertices.push(v1, v2)
                edges.push(new Edge(v1, v2, polygons[i - 1], polygons[i]))
            }

            // if (intersections.length == 0)
            //     convexHull = [polygons[0], polygons[polygons.length - 1]]

            return new WingedEdge(
                vertices,
                polygons,
                edges,
                convexHull,
                null,
                Main.render,
            )
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

        // await waitForPause();

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

        return new WingedEdge(
            WE_l.vertices.concat(WE_r.vertices.concat(newVertices)),
            WE_l.polygons.concat(WE_r.polygons),
            edges.concat(WE_l.edges.concat(WE_r.edges.concat(HPs))),
            convexHull,
            getRandomColor(),
            Main.render,
        )
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
        console.log(intersections)

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

