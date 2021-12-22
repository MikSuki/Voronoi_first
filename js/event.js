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
