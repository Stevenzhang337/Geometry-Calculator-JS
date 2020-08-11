//Initializes the canvas along with any data structure when the web starts up
//deals with canvas size (dynamically changes with response to screen size)
var init = (function() {
    //initialize canvas
    var canvas;
    var preview;
    function initCanvas() {
        let main = document.getElementById("main");
        let widthM = main.offsetWidth
        let heightM = main.offsetHeight
        let top = document.getElementById("top");
        let heightT = top.offsetHeight
        let side = document.getElementById("sidebar");
        let widthS = side.offsetWidth

        let canv = document.createElement("canvas");
        canv.width = 2 * (widthM - widthS);
        canv.height = 2 * (heightM - heightT);
        canv.setAttribute("style", "border-style: solid");
        canv.style.width = (widthM - widthS) + "px";
        canv.style.height = (heightM - heightT) + "px"
        canv.setAttribute("id", "geoCanvas")

        document.getElementById("canvas").appendChild(canv)

        //init geostruct
        canvas = new geoStruct.Geometry();
        preview = new geoStruct.Preview();
    }
    ////////////////////////////////////////////////////////////////////////////////
    return {
        initCanvas: () => initCanvas(),
        geoCanvas: () => canvas,
        preview: () => preview
    }
})()
init.initCanvas()
