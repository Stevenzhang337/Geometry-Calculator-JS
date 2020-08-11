var select = (function() {
    //inrange functions
    function pointInRange(eventx, eventy, point, margin = 10) {
        point = init.geoCanvas().currPos(point)
        return (point.x - margin <= eventx && eventx <= point.x + margin) &&
               (point.y - margin <= eventy && eventy <= point.y + margin)
    }
    function lineInRange(eventx, eventy, line, margin = 10) {
        line = init.geoCanvas().currPos(line)
        let mousePoint = new geo.Point(eventx, eventy);
        let dis = geo.getPerpendicularLine(mousePoint, geo.lineToExtLine(line));
        return geo.isIntersected(dis, line) && geo.getDistance(dis) <= margin &&
                geo.getDistance(new geo.Line(mousePoint, line.pt1)) >= margin &&
                geo.getDistance(new geo.Line(mousePoint, line.pt2)) >= margin
    }
    function extLineInRange(eventx, eventy, extLine, margin = 10) {
        let mousePoint = new geo.Point(eventx, eventy);
        let dis = geo.getPerpendicularLine(mousePoint, extLine);
        return geo.getDistance(dis) <= margin;
    }
    function circleInRange(eventx, eventy, circle, margin = 10) {
        let p = new geo.Point(eventx, eventy);
        let l = new geo.Line(p, circle.center);
        return Math.abs(geo.getDistance(l) - circle.radius) <= margin
    }
    //overlap function
    //returns the smallest segment near the event
    function nearestOverlap(eventx, eventy, object) {
        let overlapArr = init.geoCanvas().getOverlap(object);
        for (let i = 0; i < overlapArr.length; i++) {
            let obj = overlapArr[i];
            let res = nearestOverlap(eventx, eventy, obj);
            if (res != undefined) return res;
        }
        if (object instanceof geo.ExtLine) return object
        else if (lineInRange(eventx, eventy, object)) return object;

        else return undefined;
    }
    //nearest object
    function nearestObject(eventx, eventy, display = init.geoCanvas().display) {
        for (let i = 0; i < display.length; i++) {
            let object = display[i];
            if (object instanceof geo.Point && pointInRange(eventx, eventy, object)) {
                return object;
            }
        }
        for (let i = 0; i < display.length; i++) {
            let object = display[i];
            if (object instanceof geo.Circle && circleInRange(eventx, eventy, object)) {
                return object;
            }
            else if (object instanceof geo.Line && lineInRange(eventx, eventy, object)) {
                if (init.geoCanvas().hasOverlap(object)) {
                    let newLine = nearestOverlap(eventx, eventy, object);
                    if (init.geoCanvas().hasOverlap(newLine)) continue;
                    return newLine;
                }
                return object;
            } 
            else if (object instanceof geo.ExtLine && extLineInRange(eventx, eventy, object)) {
                if (init.geoCanvas().hasOverlap(object)) {
                    let newLine = nearestOverlap(eventx, eventy, object);
                    if (init.geoCanvas().hasOverlap(newLine) && !(newLine instanceof geo.ExtLine)) continue;
                    return newLine;
                }
                return object;
            }
        }
        return undefined
    }
    function nearestIntersection(eventx, eventy) {
        let display = init.geoCanvas().display.copy();
        let obj1 = nearestObject(eventx, eventy, display);
        if (obj1 instanceof geo.Line || obj1 instanceof geo.ExtLine || obj1 instanceof geo.Circle) {
            display.remove(obj1);
            let obj2 = nearestObject(eventx, eventy, display);
            if ((obj2 instanceof geo.Line || obj2 instanceof geo.ExtLine || obj2 instanceof geo.Circle) &&
                geo.isIntersected(obj1, obj2)) {
                    let intersect =  geo.getIntersection(obj1, obj2);
                    if (!(intersect instanceof Array)) return intersect;
                    if (pointInRange(eventx, eventy, intersect[0])) return intersect[0];
                    return intersect[1];
            }
        }
        return obj1;
    }
    //appends object into selected
    function selectObject(object) {
        if (object == undefined) return 
        if (init.geoCanvas().selected.includes(object)) {
            //remove current
            init.geoCanvas().selected.remove(object);
        }
        else {
            init.geoCanvas().selected.push(object);
        }
    }
    function pointOnLine(eventx, eventy, line) {
        line = init.geoCanvas().currPos(line);
        let newLine = line;
        if (line instanceof geo.Line) newLine = geo.lineToExtLine(line);
        let eventPoint = new geo.Point(eventx, eventy);
        let proj = geo.getPerpendicularLine(eventPoint, newLine);
        if (!geo.pointEqual(proj.pt1, eventPoint)) return proj.pt1;
        return proj.pt2;
    }
    function pointOnCircle(eventx, eventy, circle) {
        let point = new geo.Point(eventx, eventy);
        let line = new geo.Line(point, circle.center);
        let length = geo.getDistance(line);
        let dilLine = geo.dilate(line, circle.center, circle.radius / length);
        return dilLine.pt1;
    }
    function polyBetweenLine(polygon, line) {
        let side1 = false;
        let side2 = false;
        let pointsArr = geo.getPoints(polygon);
        for (let i = 0; i < pointsArr.length; i++) {
            let point = pointsArr[i];
            let y;
            if (geo.getSlope(line) == Infinity) y = point.y;
            else y = geo.linEq(line, point.x);
            if (y > point.y) side1 = true;
            if (y < point.y) side2 = true;
            if (side1 && side2) break;
        }
        return side1 && side2;
    }
    function angleFromCP(v1, v2) {
        let crossProd = v1[0] * v2[1] - v2[0] * v1[1];
        let mag1 = (v1[0] ** 2 + v1[1] ** 2) ** .5;
        let mag2 = (v2[0] ** 2 + v2[1] ** 2) ** .5;
        let sinAng = crossProd / (mag1 * mag2);    
        let angle = Math.asin(sinAng) * 180 / Math.PI;
        angle = Math.abs(angle);
        return angle;

    }
    //could be a lot simplier (possilbly)
    function polyOnLine(point, polygon, line) {
        let pointsArr = geo.getPoints(polygon);
        if (!pointsArr.contains(point)) throw new Error("point not on polygon");
        if (polyBetweenLine(polygon, line)) return polygon
        //puts point on line
        let newPoint;
        if (pointInRange(point.x, point.y, line.pt1, 20)) newPoint = line.pt1;
        else if (pointInRange(point.x, point.y, line.pt2, 20)) newPoint = line.pt2;
        else newPoint = pointOnLine(point.x, point.y, line);
        let dx = newPoint.x - point.x
        let dy = newPoint.y - point.y
        polygon = geo.translate(polygon, dx, dy);

        //puts polygon on line
        //gets line from polygon adjacent to point
        pointsArr = geo.getPoints(polygon);
        let ind = pointsArr.index(newPoint);
        let adjPt1 = pointsArr[(ind - 1 + pointsArr.length) % pointsArr.length];
        let adjPt2 = pointsArr[(ind + 1 + pointsArr.length) % pointsArr.length];
        let angLine1 = new geo.Line(newPoint,adjPt1);
        let angLine2 = new geo.Line(newPoint,adjPt2);
        //convert line to endpoint with point
        let angPoint;
        if (line instanceof geo.Line) angPoint = line.pt1
        else anglePoint = line.point1
        let otherP
        if (geo.getSlope(line) == Infinity) otherP = new geo.Point(newPoint.x, -1);
        else otherP = new geo.Point(-1, geo.getSlope(line) * (-1 - angPoint.x) + angPoint.y)
        let angLineOther = new geo.Line(newPoint, otherP);
        //angle from cross product
        let v1 = [angLine1.pt2.x - angLine1.pt1.x, angLine1.pt2.y - angLine1.pt1.y];
        let v2 = [angLine2.pt2.x - angLine2.pt1.x, angLine2.pt2.y - angLine2.pt1.y];
        let v3 = [angLineOther.pt2.x - angLineOther.pt1.x, angLineOther.pt2.y - angLineOther.pt1.y];
        let angle1 = angleFromCP(v1, v3);
        let angle2 = angleFromCP(v2, v3);
        //gets closer angle
        let angle
        if (almostEqual(angle1, angle2)) angle = angle1;
        else if (angle1 > angle2) angle = -1 * angle2;
        else angle = angle1;
        //let angle = Math.min(angle1, angle2);
        polygon = geo.rotate(polygon, newPoint, angle);
        return polygon;
    }
    return {
        selectObject: (object) => selectObject(object),
        nearestObject: (eventx, eventy) => nearestObject(eventx, eventy),
        nearestIntersection: (eventx, eventy) => nearestIntersection(eventx, eventy),
        pointOnLine: (eventx, eventy, line) => pointOnLine(eventx, eventy, line),
        pointOnCircle: (eventx, eventy, circle) => pointOnCircle(eventx, eventy, circle),
        polyOnLine: (point, polygon, line) => polyOnLine(point, polygon, line)
    }
})()