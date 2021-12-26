/**
 * read file - event
 * 讀取完畢後存入 buffer 中
 * @param {HTMLInputElement} HTMLelement 
 * @param {Boolean} isInput 
 */
function readFile(HTMLelement, isInput) {
    const fr = new FileReader();
    fr.onload = function() {
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