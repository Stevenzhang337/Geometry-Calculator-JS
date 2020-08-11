import * as gm from './geoMath.js';
export {shiftPartition, shiftPerpen, shiftAngleB, shiftTan,
    shiftReflect,shiftRotate, shiftTranslate, shiftDilate, shiftIntersect,
    shiftIntersect1,shiftIntersect2, shiftRad, shiftAlongLine, shiftAlongCircle}
//partition shifts
function shiftAlongLine(point, line, dx, dy, geo) {
    let p = geo.currPos(point);
    let l = geo.currPos(line);
    //projection [dx, dy] onto the line
    //dot product
    let slope = gm.getSlope(l);
    let angle = Math.atan(slope);
    let uVec = [Math.cos(angle), Math.sin(angle)];
    let dotP = uVec[0] * dx + uVec[1] * dy;
    return [dotP * uVec[0], dotP * uVec[1]];
}
function shiftAlongCircle(point, circle, dx, dy, geo) {
    let c = geo.currPos(circle);
    let p = geo.currPos(point);
    let r = c.radius;
    let radVec = [p.x - c.center.x, p.y - c.center.y];
    let vecSum = [radVec[0] + dx, radVec[1] + dy];
    let mag = Math.sqrt(vecSum[0]**2 + vecSum[1]**2);
    let scaledVec = [vecSum[0] * r / mag, vecSum[1] * r / mag];
    return [scaledVec[0] - radVec[0], scaledVec[1] - radVec[1]];
} 
function shiftPartition(line, ratio1, ratio2, geo, oldP) {
    let p1 = geo.currPos(oldP);
    let l1 = geo.currPos(line);
    let newP = gm.partition(l1, ratio1, ratio2);
    return [newP.x - p1.x, newP.y - p1.y];
}
function shiftIntersect(object1, object2, geo, p) {
    let obj1 = geo.currPos(object1);
    let obj2 = geo.currPos(object2);
    let oldP = geo.currPos(p);
    let newP = gm.getIntersection(obj1, obj2);
    return [newP.x - oldP.x, newP.y - oldP.y];
}
//array
function shiftIntersect1(object1, object2, geo, p) {
    let obj1 = geo.currPos(object1);
    let obj2 = geo.currPos(object2);
    let oldP = geo.currPos(p);
    let newP = gm.getIntersection(obj1, obj2)[0];
    return [newP.x - oldP.x, newP.y - oldP.y];
}
function shiftIntersect2(object1, object2, geo, p) {
    let obj1 = geo.currPos(object1);
    let obj2 = geo.currPos(object2);
    let oldP = geo.currPos(p);
    let newP = gm.getIntersection(obj1, obj2)[1];
    return [newP.x - oldP.x, newP.y - oldP.y];
}
//perpendicular line shifts
function shiftPerpen(point, line, geo, oldPoint) {
    let p1 = geo.currPos(point);
    let l1 = geo.currPos(line);
    let p2 = geo.currPos(oldPoint);
    let newL = gm.getPerpendicularLine(p1, l1);
    let newP = newL.pt1;
    return [newP.x - p2.x, newP.y - p2.y];
}
function shiftAngleB(line1, line2, intersect, geo, ab) {
    let l1 = geo.currPos(line1);
    let l2 = geo.currPos(line2);
    let i = geo.currPos(intersect);
    let oldAB = geo.currPos(ab);
    let newAB = gm.getAngleBisector(i, l1, l2);
    return newAB.slope - oldAB.slope;
}
function shiftRad(point, circle, dx, geo) {
    let c = geo.currPos(circle);
    let p = geo.currPos(point);
    let r = c.radius;
    let factor = r / (r - dx);
    factor = factor - 1
    return [factor * (p.x - c.center.x), factor * (p.y - c.center.y)];
}
function shiftTan(point, circle, geo) {
    let newP = geo.currPos(point);
    let newC = geo.currPos(circle);
    let newT = gm.getTangent(newP, newC);
    return newT.slope
}
function shiftReflect(point, reflectLine, geo, p) {
    let refLine = geo.currPos(reflectLine);
    let p1 = geo.currPos(point);
    let oldP = geo.currPos(p);
    let newP = gm.reflect(p1, refLine);
    return [newP.x - oldP.x, newP.y - oldP.y];
}
function shiftRotate(point, rotatePoint, angle, geo, p) {
    let rotP = geo.currPos(rotatePoint);
    let p1 = geo.currPos(point);
    let oldP = geo.currPos(p);
    let newP = gm.rotate(p1, rotP, angle);
    return [newP.x - oldP.x, newP.y - oldP.y];
}
function shiftTranslate(point, dx, dy, geo, p) {
    let p1 = geo.currPos(point);
    let oldP = geo.currPos(p);
    let newP = gm.translate(p1, dx, dy);
    return [newP.x - oldP.x, newP.y - oldP.y];
}
function shiftDilate(point, refPoint, scaleFactor, geo, p) {
    let p1 = geo.currPos(point);
    let p2 = geo.currPos(refPoint)
    let oldP = geo.currPos(p);
    let newP = gm.dilate(p1, p2, scaleFactor);
    return [newP.x - oldP.x, newP.y - oldP.y];
}