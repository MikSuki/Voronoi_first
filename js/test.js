function test_getPB() {
    const pb = new Polygon(150, 350, null)
    const pc = new Polygon(300, 360, null)
    console.log(getPB(pb, pc))

    const b = new Polygon(150, 200, null)
    const c = new Polygon(160, 400, null)
    console.log(getPB(b, c))

    const a = new Polygon(150, 200, null)
    const d = new Polygon(150, 400, null)
    console.log(getPB(a, d))

    const pa = new Polygon(150, 350, null)
    const pd = new Polygon(300, 350, null)
    console.log(getPB(pa, pd))

    const e = new Polygon(150, 150, null)
    const f = new Polygon(300, 151, null)
    console.log(getPB(e, f))
    console.log(getPB(f, e))
}

// test_getPB()

function test_getDegree() {
    console.log('{x:0, y:0}: ' + getDegree({ x: 0, y: 0 }))
    console.log('{x:1, y:0}: ' + getDegree({ x: 1, y: 0 }))
    console.log('{x:3, y:4}: ' + getDegree({ x: 3, y: 4 }))
    console.log('{x:0, y:4}: ' + getDegree({ x: 0, y: 4 }))
    console.log('{x:-3, y:4}: ' + getDegree({ x: -3, y: 4 }))
    console.log('{x:-3, y:0}: ' + getDegree({ x: -3, y: 0 }))
    console.log('{x:-3, y:-4}: ' + getDegree({ x: -3, y: -4 }))
    console.log('{x:0, y:-4}: ' + getDegree({ x: 0, y: -4 }))
    console.log('{x:3, y:-4}: ' + getDegree({ x: 3, y: -4 }))
}

// test_getDegree()




function drawTest() {
    let arr = [90, 70, 60, 210, 190, 170, 120, 80]
        // arr=[220, 70, 270, 330, 350, 466, 450, 150]
    const vs = [],
        es = []
    for (let i = 0; i < arr.length; i += 2)
        vs.push(new Vertex(false, arr[i], arr[i + 1], null))

    const WE111 = new WingedEdge(vs, [], es, blue, Main.render)

    // arr = [90, 70, 60, 210, 190, 170, 120, 80, 350, 466, 450, 150, 220, 70, 90, 70, 60, 210, 350, 466]
    // for (let i = 0; i < arr.length; i += 2)
    //     es.push({ x: arr[i], y: arr[i + 1] })

    // vs.forEach(e => Main.render.drawCircle(e, 'green'))
    // for (let i = 0; i < es.length-1; ++i)
    //     Main.render.drawLine(es[i], es[i + 1], 'red')

    // let PB1 = getPB({x: 60, y: 210}, {x: 350, y: 466})
    // Main.render.drawLine(PB1.a, PB1.b, 'black')
    // let PB2 = getPB({x: 60, y: 210}, {x: 270, y: 330})
    // Main.render.drawLine(PB2.a, PB2.b, 'blue')
    // let PB3 = getPB({x: 190, y: 170}, {x: 350, y: 466})
    // Main.render.drawLine(PB3.a, PB3.b, 'purple')
}




function convexHullTest() {
    let last = 3
    for (let i = 0; i < 4; ++i) {
        Main.render.drawLine(Voronoi.polygons[last], Voronoi.polygons[i], 'orange');
        last = i
    }
    last = 7
    for (let i = 4; i < 8; ++i) {
        Main.render.drawLine(Voronoi.polygons[last], Voronoi.polygons[i], 'brown');
        last = i
    }

    Voronoi.polygons.forEach(e => { Main.render.drawCircle(e, 'green') })

    mixConvexHull(Voronoi.polygons.slice(0, 4), Voronoi.polygons.slice(4))
}



function testtt() {
    Voronoi.add(475, 357);
    Voronoi.add(478, 357)

    // Voronoi.add(147, 190)
    // Voronoi.add(164, 361)
    // Voronoi.add(283, 233)
    // Voronoi.add(400, 400)

    // ------------------------
    // 三點
    // ------------------------

    // #三點測試 水平
    // Voronoi.add(200, 200)
    // Voronoi.add(300, 200)
    // Voronoi.add(400, 200)


    // #三點測試 垂直
    // Voronoi.add(200, 200)
    // Voronoi.add(200, 300)
    // Voronoi.add(200, 400)


    // #三點測試 直角三角形
    // Voronoi.add(200, 200)
    // Voronoi.add(300, 200)
    // Voronoi.add(200, 300)


    // #三點測試 銳角三角形
    // Voronoi.add(147, 190)
    // Voronoi.add(164, 361)
    // Voronoi.add(283, 233)


    // #三點測試 鈍角三角形
    // Voronoi.add(398, 93)
    // Voronoi.add(233, 263)
    // Voronoi.add(345, 197)


    // #三點測試 y=2x 三點共線
    // Voronoi.add(10, 20)
    // Voronoi.add(20, 40)
    // Voronoi.add(200, 400)


    // #三點測試 x=4y 三點共線
    // Voronoi.add(4, 1)
    // Voronoi.add(100, 25)
    // Voronoi.add(400, 100)






    // ------------------------
    // 四點
    // ------------------------

    // 正方形
    // Voronoi.add(100, 200)
    // Voronoi.add(200, 100)
    // Voronoi.add(100, 100)
    // Voronoi.add(200, 200)

    // Voronoi.add(300, 200)
    // Voronoi.add(400, 100)
    // Voronoi.add(300, 100)
    // Voronoi.add(400, 200)

    // Voronoi.add(100, 400)
    // Voronoi.add(200, 300)
    // Voronoi.add(100, 300)
    // Voronoi.add(200, 400)

    // Voronoi.add(300, 400)
    // Voronoi.add(400, 300)
    // Voronoi.add(300, 300)
    // Voronoi.add(400, 400)



    // 菱形
    // 193,64, 193,370, 103,200, 283,200
    // Voronoi.add(193,64)
    // Voronoi.add(193,370)
    // Voronoi.add(103,200)
    // Voronoi.add(283,200)

    // 三點包一點
    // Voronoi.add(331, 179)
    // Voronoi.add(233, 276)
    // Voronoi.add(432, 275)
    // Voronoi.add(330, 229)


    // 75,75, 167, 167, 250, 250, 147, 187
    // 四點測試 三點共線
    // Voronoi.add(75,75)
    // Voronoi.add(167, 167)
    // Voronoi.add(250, 250)
    // Voronoi.add(147, 187)


    // 100, 100, 100, 200, 50, 200, 150, 200
    // #四點測試 垂直兼水平共線
    // Voronoi.add(100, 100)
    // Voronoi.add(100, 200)
    // Voronoi.add(50, 200)
    // Voronoi.add(150, 200)



    // #四點測試 三點共線 + 兩點共線
    // Voronoi.add(588, 323)
    // Voronoi.add(588, 327)
    // Voronoi.add(588, 332)
    // Voronoi.add(593, 327)

    // Voronoi.add(250, 100)
    // Voronoi.add(250, 200)
    // Voronoi.add(250, 300)
    // Voronoi.add(500, 300)



    // ------------------------
    // 五點
    // ------------------------


    // #五點測試 隨意五點
    // 123, 456, 213, 478, 11, 590, 234, 77, 99, 68
    // Voronoi.add(123, 456)
    // Voronoi.add(213, 478)
    // Voronoi.add(11, 590)
    // Voronoi.add(234, 77)
    // Voronoi.add(99, 68)



    // #五點測試 隨意五點
    // 1, 1, 123, 456, 120, 459, 400, 100, 456, 123
    // Voronoi.add(123, 456)
    // Voronoi.add(1, 1)
    // Voronoi.add(120, 459)
    // Voronoi.add(400, 100)
    // Voronoi.add(456, 123)



    // #五點測試 隨意五點
    // 567, 234, 79, 34, 34, 90, 432, 453, 77, 111
    // Voronoi.add(567, 234)
    // Voronoi.add(79, 34)
    // Voronoi.add(34, 90)
    // Voronoi.add(432, 453)
    // Voronoi.add(77, 111)




    // ------------------------
    // 多點
    // ------------------------

    // #六點
    // 12, 89, 124, 592, 131, 11, 543, 212, 23, 400, 312, 12
    // Voronoi.add(12, 89)
    // Voronoi.add(23, 400)
    // Voronoi.add(124, 592)
    // Voronoi.add(131, 11)
    // Voronoi.add(543, 212)
    // Voronoi.add(312, 12)




    // #七點
    // 56, 53, 69, 414, 100, 180, 330, 527, 345, 120, 459, 361, 532, 459
    // Voronoi.add(56, 53)
    // Voronoi.add(69, 414)
    // Voronoi.add(100, 180)
    // Voronoi.add(330, 527)
    // Voronoi.add(345, 120)
    // Voronoi.add(459, 361)
    // Voronoi.add(532, 459)




    // #八點
    // 90, 70, 60, 210, 190, 170, 120, 80, 220, 70, 270, 330, 350, 466, 450, 150
    // Voronoi.add(90, 70)
    // Voronoi.add(60, 210)
    // Voronoi.add(190, 170)
    // Voronoi.add(120, 80)
    // Voronoi.add(220, 70)
    // Voronoi.add(270, 330)
    // Voronoi.add(350, 466)
    // Voronoi.add(450, 150)




    // #八點
    // 120, 100, 150, 250, 190, 170, 180, 370, 220, 70, 450, 360, 350, 466, 455, 150
    // Voronoi.add(150, 250)
    // Voronoi.add(180, 370)
    // Voronoi.add(190, 170)
    // Voronoi.add(120, 100)
    // Voronoi.add(220, 70)
    // Voronoi.add(350, 466)
    // Voronoi.add(450, 360)
    // Voronoi.add(455, 150)

    /*
    13, 56, 23, 204, 34, 421, 43, 435, 52, 599, 63, 24
    , 123, 432, 342, 521, 292, 341, 324, 65, 324, 93, 591, 591
    */
    // #十二點
    // Voronoi.add(13, 56)
    // Voronoi.add(23, 204)
    // Voronoi.add(34, 421)
    // Voronoi.add(43, 435)
    // Voronoi.add(52, 599)
    // Voronoi.add(63, 24)
    // Voronoi.add(123, 432)
    // Voronoi.add(292, 341)
    // Voronoi.add(324, 65)
    // Voronoi.add(324, 93)
    // Voronoi.add(342, 521)
    // Voronoi.add(591, 591)



    /*
        2, 1, 4, 9, 11, 567, 4, 42, 25, 97, 43, 542, 63, 24, 59, 321, 
        99, 18, 197, 328, 243, 85, 412, 324, 432, 43, 469, 413, 543, 432
    */
    // #十五點
    // Voronoi.add(2, 1)
    // Voronoi.add(4, 9)
    // Voronoi.add(11, 567)
    // Voronoi.add(24, 42)
    // Voronoi.add(25, 97)
    // Voronoi.add(43, 542)
    // Voronoi.add(63, 24)
    // Voronoi.add(59, 321)
    // Voronoi.add(99, 18)
    // Voronoi.add(197, 328)
    // Voronoi.add(243, 85)
    // Voronoi.add(412, 324)
    // Voronoi.add(432, 43)
    // Voronoi.add(469, 413)
    // Voronoi.add(543, 432)








    // 235, 315, 332, 271, 478, 103
    // Voronoi.add(235, 315)
    // Voronoi.add(332, 271)
    // Voronoi.add(478, 103)


    // Voronoi.add(266, 179)
    // Voronoi.add(528, 32)
    // Voronoi.add(147, 301)

    Voronoi.start()
}