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
