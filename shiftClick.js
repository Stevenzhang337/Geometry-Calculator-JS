var shiftClick = (function() {
    var shiftObjs = {
        isLine: true, 
        arr: new Array()
    }
    function resetShift() {
        shiftObjs.isLine = true;
        shiftObjs.arr = new Array();
        init.preview().compose = new Array()
    }
    function appendShift(object) {
        if (!(object instanceof geo.Line)) return;
        for (let i = 0; i < shiftObjs.arr.length; i++) {
            let cmpLine = shiftObjs.arr[i];
            if (geo.lineEqual(cmpLine, object)) return;
        }
        if (shiftObjs.isLine && shiftObjs.arr.length > 0) {
            let cmp = geo.lineToExtLine(object);
            let extl = geo.lineToExtLine(shiftObjs.arr[0]);
            if (!geo.lineEqual(extl, cmp)) {
                shiftObjs.isLine = false;
            }
        }
        init.preview().compose.push(object);
        shiftObjs.arr.push(object);
    }
    function getLinear(shiftObjs) {
        if (!shiftObjs.isLine) throw new Error("composition does not form line");
        let min = new geo.Point(Infinity,Infinity); let max = new geo.Point(-1,-1)
        let lengthArr = new Array();
        //deal with vertical case
        for (let i = 0; i < shiftObjs.arr.length; i++) {
            let newObj = shiftObjs.arr[i];
            //find the min and max baby points
            if (newObj.pt1.x < min.x || (newObj.pt1.x == min.x && newObj.pt1.y < min.y)) {
                min = newObj.pt1;
            }
            if (newObj.pt1.x > max.x || (newObj.pt1.x == max.x && newObj.pt1.y > max.y)) {
                max = newObj.pt1;
            }
            if (newObj.pt2.x < min.x || (newObj.pt2.x == min.x && newObj.pt2.y < min.y)) {
                min = newObj.pt2;
            }
            if (newObj.pt2.x > max.x || (newObj.pt2.x == max.x && newObj.pt2.y > max.y)) {
                max = newObj.pt2;
            }     
            //collect all the lengths
            let len = geo.getDistance(newObj);
            lengthArr.push(len);
        }
        let longLine = new geo.Line(min, max);
        console.log(longLine)
        //check all the sum of length equal res
        if (!almostEqual(geo.getDistance(longLine), lengthArr.sum())) return undefined

        return longLine;
    }
    function lineToPoints(lineArr) {
        let res = new Array();
        lineArr.push(lineArr[0]);
        for (let i = 0; i < lineArr.length - 1; i++) {
            let newLine = lineArr[i]
            let nextLine = lineArr[i + 1]
            if (geo.pointEqual(newLine.pt1, nextLine.pt1) || geo.pointEqual(newLine.pt1, nextLine.pt2)) {
                res.push(newLine.pt1);
            }
            else (res.push(newLine.pt2))
        }
        return res;
    }
    function getPolygon(shiftObjs) {
        if (shiftObjs.isLine) throw new Error("composition does not form a polygon");
        if (shiftObjs.arr.length < 3) return undefined
        let sidesArr = shiftObjs.arr.copy();
        let polygonArr = [sidesArr[0]];
        sidesArr.shift();
        while (sidesArr.length > 0) {
            let cmpLine = polygonArr[polygonArr.length - 1];
            for (var i = 0; i < sidesArr.length; i++) {
                let newLine = sidesArr[i];
                if (geo.pointEqual(newLine.pt1, cmpLine.pt1) || geo.pointEqual(newLine.pt2, cmpLine.pt1) || 
                    geo.pointEqual(newLine.pt1, cmpLine.pt2) || geo.pointEqual(newLine.pt2, cmpLine.pt2)) {
                    polygonArr.push(newLine);
                    sidesArr.splice(i, 1);
                    break;
                }
            }
            if (i == sidesArr.length) break;
        }
        let pointArr = lineToPoints(polygonArr);
        let polygon;
        if (pointArr.length == 3) polygon = new geo.Triangle(pointArr[0], pointArr[1], pointArr[2])
        else polygon = new geo.Polygon(pointArr);
        return polygon;

    }
    function composedFigure() {
        if (shiftObjs.arr.length == 0) return undefined;
        if (shiftObjs.arr.length == 1) return shiftObjs.arr[0];
        let res;
        //either a polygon or a line
        //checks line
        if (shiftObjs.isLine) res = getLinear(shiftObjs);
        else res = getPolygon(shiftObjs)
        //ensure it exists
        if (res == undefined || init.geoCanvas().find(res) == -1) {
            if (res instanceof geo.Line) {
                init.geoCanvas().append(res);
                init.geoCanvas().addOverlap(res, shiftObjs.arr);
            }
            else return undefined
        }
        return res;
    }
    function composedResult() {
        let res = composedFigure();
        resetShift();
        return res;
    }
    return {
        appendShift: (object) => appendShift(object),
        composedResult: () => composedResult(),
        display: () => shiftObjs.arr,

    }
})()