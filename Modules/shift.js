var shift = (function() {
    //partition shifts
    function shiftAlongLine(point, line, dx, dy, geoStr) {
        let p = geoStr.currPos(point);
        let l = geoStr.currPos(line);
        //projection [dx, dy] onto the line
        //dot product
        let slope = geo.getSlope(l);
        let angle = Math.atan(slope);
        let uVec = [Math.cos(angle), Math.sin(angle)];
        let dotP = uVec[0] * dx + uVec[1] * dy;
        return [dotP * uVec[0], dotP * uVec[1]];
    }
    function shiftAlongCircle(point, circle, dx, dy, geoStr) {
        let c = geoStr.currPos(circle);
        let p = geoStr.currPos(point);
        let r = c.radius;
        let radVec = [p.x - c.center.x, p.y - c.center.y];
        let vecSum = [radVec[0] + dx, radVec[1] + dy];
        let mag = Math.sqrt(vecSum[0]**2 + vecSum[1]**2);
        let scaledVec = [vecSum[0] * r / mag, vecSum[1] * r / mag];
        return [scaledVec[0] - radVec[0], scaledVec[1] - radVec[1]];
    } 
    function shiftPartition(line, ratio1, ratio2, geoStr, oldP) {
        let p1 = geoStr.currPos(oldP);
        let l1 = geoStr.currPos(line);
        let newP = geo.partition(l1, ratio1, ratio2);
        return [newP.x - p1.x, newP.y - p1.y];
    }
    function shiftIntersect(object1, object2, geoStr, p) {
        let obj1 = geoStr.currPos(object1);
        let obj2 = geoStr.currPos(object2);
        let oldP = geoStr.currPos(p);
        let newP = geo.getIntersection(obj1, obj2);
        return [newP.x - oldP.x, newP.y - oldP.y];
    }
    //array
    function shiftIntersect1(object1, object2, geoStr, p) {
        let obj1 = geoStr.currPos(object1);
        let obj2 = geoStr.currPos(object2);
        let oldP = geoStr.currPos(p);
        let newP = geo.getIntersection(obj1, obj2)[0];
        return [newP.x - oldP.x, newP.y - oldP.y];
    }
    function shiftIntersect2(object1, object2, geoStr, p) {
        let obj1 = geoStr.currPos(object1);
        let obj2 = geoStr.currPos(object2);
        let oldP = geoStr.currPos(p);
        let newP = geo.getIntersection(obj1, obj2)[1];
        return [newP.x - oldP.x, newP.y - oldP.y];
    }
    //perpendicular line shifts
    function shiftPerpen(point, line, geoStr, oldPoint) {
        let p1 = geoStr.currPos(point);
        let l1 = geoStr.currPos(line);
        let p2 = geoStr.currPos(oldPoint);
        let newL = geo.getPerpendicularLine(p1, l1);
        let newP = newL.pt1;
        return [newP.x - p2.x, newP.y - p2.y];
    }
    function shiftAngleB(line1, line2, intersect, geoStr, ab) {
        let l1 = geoStr.currPos(line1);
        let l2 = geoStr.currPos(line2);
        let i = geoStr.currPos(intersect);
        let oldAB = geoStr.currPos(ab);
        let newAB = geo.getAngleBisector(i, l1, l2);
        return newAB.slope - oldAB.slope;
    }
    function shiftRad(point, circle, dx, geoStr) {
        let c = geoStr.currPos(circle);
        let p = geoStr.currPos(point);
        let r = c.radius;
        let factor = r / (r - dx);
        factor = factor - 1
        return [factor * (p.x - c.center.x), factor * (p.y - c.center.y)];
    }
    function shiftTan(point, circle, geoStr) {
        let newP = geoStr.currPos(point);
        let newC = geoStr.currPos(circle);
        let newT = geo.getTangent(newP, newC);
        return newT.slope
    }
    function shiftReflect(point, reflectLine, geoStr, p) {
        let refLine = geoStr.currPos(reflectLine);
        let p1 = geoStr.currPos(point);
        let oldP = geoStr.currPos(p);
        let newP = geo.reflect(p1, refLine);
        return [newP.x - oldP.x, newP.y - oldP.y];
    }
    function shiftRotate(point, rotatePoint, angle, geoStr, p) {
        let rotP = geoStr.currPos(rotatePoint);
        let p1 = geoStr.currPos(point);
        let oldP = geoStr.currPos(p);
        let newP = geo.rotate(p1, rotP, angle);
        return [newP.x - oldP.x, newP.y - oldP.y];
    }
    function shiftTranslate(point, dx, dy, geoStr, p) {
        let p1 = geoStr.currPos(point);
        let oldP = geoStr.currPos(p);
        let newP = geo.translate(p1, dx, dy);
        return [newP.x - oldP.x, newP.y - oldP.y];
    }
    function shiftDilate(point, refPoint, scaleFactor, geoStr, p) {
        let p1 = geoStr.currPos(point);
        let p2 = geoStr.currPos(refPoint)
        let oldP = geoStr.currPos(p);
        let newP = geo.dilate(p1, p2, scaleFactor);
        return [newP.x - oldP.x, newP.y - oldP.y];
    }
    //exports
    return {
        shiftPartition: (line, ratio1, ratio2, geo, oldP) => shiftPartition(line, ratio1, ratio2, geo, oldP),
        shiftPerpen: (point, line, geo, oldPoint) => shiftPerpen(point, line, geo, oldPoint),
        shiftAngleB: (line1, line2, intersect, geo, ab) => shiftAngleB(line1, line2, intersect, geo, ab),
        shiftTan: (point, circle, geo) => shiftTan(point, circle, geo),
        shiftReflect: (point, reflectLine, geo, p) => shiftReflect(point, reflectLine, geo, p),
        shiftRotate: (point, rotatePoint, angle, geo, p) => shiftRotate(point, rotatePoint, angle, geo, p),
        shiftTranslate: (point, dx, dy, geo, p) => shiftTranslate(point, dx, dy, geo, p),
        shiftDilate: (point, refPoint, scaleFactor, geo, p) => shiftDilate(point, refPoint, scaleFactor, geo, p),
        shiftIntersect: (object1, object2, geo, p) => shiftIntersect(object1, object2, geo, p),
        shiftIntersect1: (object1, object2, geo, p) => shiftIntersect1(object1, object2, geo, p),
        shiftIntersect2: (object1, object2, geo, p) => shiftIntersect2(object1, object2, geo, p),
        shiftRad: (point, circle, dx, geo) => shiftRad(point, circle, dx, geo),
        shiftAlongLine: (point, line, dx, dy, geo) => shiftAlongLine(point, line, dx, dy, geo),
        shiftAlongCircle: (point, circle, dx, dy, geo) => shiftAlongCircle(point, circle, dx, dy, geo)
    }
}())