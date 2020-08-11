shiftCanv = (function() {
    function shiftCoor(shiftObj, eventx, eventy) {
        let object = shiftObj[0];
        let trace = shiftObj[1]
        if (object instanceof geo.Point) {
            currObj = init.geoCanvas().currPos(object);
            let dx = eventx - currObj.x;
            let dy = eventy - currObj.y;
            init.geoCanvas().shift(object, dx, dy)
        }
        else if (object instanceof geo.Line) {
            //find dx, dy relative to trace
            let dx = eventx - trace.x;
            let dy = eventy - trace.y;
            //update trace for next iteration
            trace.x += dx;
            trace.y += dy;
            init.geoCanvas().shift(object, dx, dy)
        }
    }
    return {
        shiftCoor: (object, eventx, eventy) => shiftCoor(object, eventx, eventy) 
    }

}())