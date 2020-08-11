export {Point, Line, ExtLine, Circle, Triangle, Polygon, getPoints, getLines,
        partition, getIntersection, lineToExtLine, getPerpendicularLine, getMedian, 
        getAngleBisector, getDiameter, getTangent, newRegPolygon, getDistance, 
        getAngle, getSides, getIntAngles, getArea, getPerimeter, reflect, rotate,
        translate, dilate, pointEqual, lineEqual, circleEqual, polygonEqual, 
        getSlope, isParallel, isCollinear, isIntersected, isPerpendicular, onLine,
        onCircle};

//Future Additions
//Make getDistance, getSlope work with 2 points
//getCircumcenter, getCentroid, getOrthocenter, getIncenter
////////////////////////////////////////////////////////////////////////////////
//Class Definitions
class Point {
    constructor(x, y) {
        if (!isNumber(x) || !isNumber(y)) {
            throw new Error("Input must be of type Number");
        }
        this.x = x;
        this.y = y;
    }
};
class Line {
    constructor(pt1, pt2) {
        if (!isPoint(pt1) || !isPoint(pt2)) {
            throw new Error("Input must be of type Point");
        }
        this.pt1 = pt1;
        this.pt2 = pt2;
    }
};

//slope can be infinity
class ExtLine {
    constructor(point, slope) {
        if (!isPoint(point)) throw new Error("Input must be of type Point");
        this.point = point;

        if (Math.abs(slope) === Infinity) this.slope = Infinity;
        else if (isNumber(slope)) this.slope = slope;
        else throw new Error("Invalid Slope")
    }
};
class Circle {
    constructor(center, radius) {
        if (!isPoint(center)) throw new Error("Input must be of type Point");
        this.center = center;
        if (!isNumber(radius) || !(radius > 0)) {
            throw new Error("Input must be of type Point");
        }
        this.radius = radius;
    }
}
class Triangle {
    constructor(point1, point2, point3) {
        if (!isPoint(point1) || !isPoint(point2) || !isPoint(point3)) {
            throw new Error("Inputs must be of type Point");
        }
        this.pt1 = point1;
        this.pt2 = point2;
        this.pt3 = point3;
    }
};
class Polygon {
    constructor(pointsArr) {
        if (pointsArr.length < 4) throw new Error("Not enough points");
        for (let i = 0; i < pointsArr.length; i++) {
            if (!isPoint(pointsArr[i])) throw new Error("Not a point");
        }
        this.pointsArr = pointsArr;
    }
};
////////////////////////////////////////////////////////////////////////////////
//Helper functions

function linEq(line, x) {
    let m = getSlope(line);
    let x1;
    let y1;
    if (line instanceof Line) {
        x1 = line.pt1.x;
        y1 = line.pt1.y;
    } else {//(line instanceof ExtLine) 
        x1 = line.point.x;
        y1 = line.point.y
    }
    if (isNaN(m) || Math.abs(m) == Infinity) return y1;
    return m * (x - x1) + y1
}
function invLinEq(line, y) {
    let m = getSlope(line);
    let x1;
    let y1
    if (line instanceof Line) {
        x1 = line.pt1.x;
        y1 = line.pt1.y;
    } else {//(line instanceof ExtLine) 
        x1 = line.point.x;
        y1 = line.point.y
    }
    if (isNaN(m) || Math.abs(m) == Infinity) return x1;
    return (1 / m) * (y - y1) + x1;
}
function almostEqual(x,y) {
    return (Math.abs(x - y) <= .000001);
}

Array.prototype.degToRad = function() {
    for (let i = 0; i < this.length; i++) {
        this[i] = this[i] * Math.PI / 180;
    }
}
Array.prototype.sum = function() {
    let sum = 0;
    for (let i = 0; i < this.length; i++) {
        sum += this[i];
    }
    return sum;
}
function reflectPointOverLine(point, reflectLine) {
    if (!isPoint(point) || !isLineClass(reflectLine)) {
        throw new Error("inputs must be of type Point and Line/ExtLine");
    }
    reflectLine = lineToExtLine(reflectLine);
    let perpenLine = getPerpendicularLine(point, reflectLine);
    let extendedLine = dilate(perpenLine, point, 2);
    return extendedLine.pt1;
}
//rotates counter-clockwise
function rotatePointOverPoint(point, rotatePoint, angle) {
    if (!isPoint(point) || !isPoint(rotatePoint) || !isNumber(angle)) {
        throw new Error("inputs must be of type Point, Point and Number");
    }
    let r = getDistance(new Line(point, rotatePoint));
    let initAngle = Math.atan2(point.y - rotatePoint.y, point.x - rotatePoint.x);
    //rcos(initAngle) = x; rsin(initAngle) = y
    let finAngle = initAngle + (angle / 180) * Math.PI;
    let newX = rotatePoint.x + r * Math.cos(finAngle);
    let newY = rotatePoint.y + r * Math.sin(finAngle);
    return new Point(newX, newY);
}
function dilatePoint(point, refPoint, scaleFactor) {
    let dx = (point.x - refPoint.x);
    let dy = (point.y - refPoint.y);
    let newX = refPoint.x + scaleFactor * dx;
    let newY = refPoint.y + scaleFactor * dy;
    return new Point(newX, newY);
}
function getTrianglePerim(triangle) {
    if (!isTriangle(triangle)) throw new Error("Input must be of type Triangle");
    return getSides(triangle).sum();
}
function getTriangleArea(triangle) {
    if (!isTriangle(triangle)) throw new Error("Input must be of type Triangle");
    let semiP = getTrianglePerim(triangle) / 2;
    let sides = getSides(triangle);
    let heron =  semiP * (semiP - sides[0]) * (semiP - sides[1]) * (semiP - sides[2])
    return heron ** .5;
}
function discrimate(a,b,c) {
    //quadratic formuala
    return b**2 - 4 * a * c;
}
function quadFormula(a,b,c) {
    let x1 = (-1 * b + Math.sqrt(discrimate(a,b,c))) / (2 * a);
    let x2 = (-1 * b - Math.sqrt(discrimate(a,b,c))) / (2 * a);
    return [x1, x2];
}
function circleEq(circle, x) {
    let r = circle.radius;
    let yTerm = Math.sqrt(r**2 - (x - circle.center.x)**2);
    return [circle.center.y + yTerm, circle.center.y - yTerm];
}

////////////////////////////////////////////////////////////////////////////////
//Error Check Functions
function isNumber(n) {
    return typeof(n) == "number";
}
function isPoint(point) {
    return (point instanceof Point &&
            isNumber(point.x) && isNumber(point.y));
}
function isLine(line) {
    return (line instanceof Line &&
            isPoint(line.pt1) && isPoint(line.pt2));
}
function isExtLine(line) {
    return (line instanceof ExtLine && isPoint(line.point) &&
           (isNumber(line.slope) || Math.abs(line.slope) == Infinity));
}
function isVertical(line) {
    let slope = getSlope(line);
    return Math.abs(slope) === Infinity;
}
function isLineClass(line) {
    return isLine(line) || isExtLine(line);
}
function isCircle(circle) {
    return (circle instanceof Circle && 
            isPoint(circle.center) && isNumber(circle.radius) &&
            0 < circle.radius);
}
function isTriangle(triangle) {
    return (triangle instanceof Triangle &&
            isPoint(triangle.pt1) && isPoint(triangle.pt2) && isPoint(triangle.pt3));
}
function isPolygon(polygon) {
    if (!(polygon instanceof Polygon)) return false;
    let arr = polygon.pointsArr;
    for (let i = 0; i < arr.length; i++) {

        if (!isPoint(arr[i])) return false;
    }
    // for (let i = 0; i < arr.length; i++) {
    //     if (isCollinear(arr[i], arr[(i + 1) % arr.length], arr[(i + 2) % arr.length])) {
    //         return false
    //     }
    // }
    //sides dont intersect
    let lines = new Array();
    for (let i = 0; i < polygon.pointsArr.length; i++){
        let l = new Line(polygon.pointsArr[i], polygon.pointsArr[(i + 1) % polygon.pointsArr.length]);
        lines.push(l);
    }
    for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < lines.length; j++) {
            if (!(j == i || (j + 1) % lines.length == i || j == (i - 1) % lines.length ||
                 (j - 1) % lines.length == i || j == (i + 1) % lines.length) &&
                  isIntersected(lines[i], lines[j])) {
                    return false;
                  }
        }
    }
    return true;
}
////////////////////////////////////////////////////////////////////////////////
//Definition Functions

//returns array of points that define the object
function getPoints(object) {
    if (isPoint(object)) return [object];
    if (isLine(object)) return [object.pt1, object.pt2];
    if (isExtLine(object)) return [object.point];
    if (isTriangle(object)) return [object.pt1, object.pt2, object.pt3];
    if (isPolygon(object)) return object.pointsArr;

}
function getLines(shape) {
    if (!isTriangle(shape) && !isPolygon(shape)) {
        throw new Error("Input must be of type Triangle");
    }
    if (isTriangle(shape)) {
        let side1 = new Line(shape.pt2, shape.pt3);
        let side2 = new Line(shape.pt1, shape.pt3);
        let side3 = new Line(shape.pt1, shape.pt2);
        return [side1, side2, side3];
    }
    if (isPolygon(shape)) {
        let LineArr = new Array();
        for (let i = 0; i < shape.pointsArr.length; i++){
            let l = new Line(shape.pointsArr[i], shape.pointsArr[(i + 1) % shape.pointsArr.length]);
            LineArr.push(l);
        }
        return LineArr;
    }
}

////////////////////////////////////////////////////////////////////////////////
//Point Functions

//ratio from left to right
//midpoint = partition(line, 1, 1)
function partition(line, ratio1, ratio2) {
    if (!isLine(line)) throw new Error("Input must be of type Line");
    if (!isNumber(ratio1) || !(ratio1 >= 0)) throw new Error("Input must be a positive Number");
    if (!isNumber(ratio2) || !(ratio2 >= 0)) throw new Error("Input must be a positive Number");
    let sum = ratio1 + ratio2;
    if (line.pt1.x < line.pt2.x) {
        let x = line.pt1.x + (line.pt2.x - line.pt1.x) * (ratio1 / sum);
        let y = line.pt1.y + (line.pt2.y - line.pt1.y) * (ratio1 / sum);
        return new Point(x,y);
    }
    else {
        let x = line.pt2.x + (line.pt1.x - line.pt2.x) * (ratio1 / sum);
        let y = line.pt2.y + (line.pt1.y - line.pt2.y) * (ratio1 / sum);
        return new Point(x,y);
    }

}

//returns point of intersection
//expand for circles;
function getIntersection(object1, object2) {
    if (isLineClass(object1) && isLineClass(object2)) {
        if (!isIntersected(object1, object2)) throw new Error("lines must intersect");

        //ensures line1 is vertical if at all; checks vertical lines once for both lines
        if (Math.abs(getSlope(object2)) === Infinity) {
            let lineTemp = object2;
            object2 = object1;
            object1 = lineTemp;
        }
        //checks vertical lines
        if (Math.abs(getSlope(object1)) === Infinity) {
            let x1;
            if (object1 instanceof Line) x1 = object1.pt1.x;
            else x1 = object1.point.x
            
            let y = linEq(object2, x1);
            let x = invLinEq(object1, y);
            return new Point(x,y)
        } 
        //Two non-parallel, non-vertical lines

        let x1;
        let x2;
        let y1;
        let y2;
        if (object1 instanceof Line) {
            x1 = object1.pt1.x;
            y1 = object1.pt1.y
        } else {
            x1 = object1.point.x;
            y1 = object1.point.y;
        } if (object2 instanceof Line) {
            x2 = object2.pt1.x;
            y2 = object2.pt1.y;
        } else {
            x2 = object2.point.x;
            y2 = object2.point.y;
        }
        let m1 = getSlope(object1);
        let m2 = getSlope(object2);
        let x = ((m1 * x1 - m2 * x2) + (y2 - y1)) / (m1 - m2);
        let y = linEq(object1, x);
        return new Point(x,y);
    }
    if ((isCircle(object1) && isLineClass(object2) || (isCircle(object2) && isLineClass(object1)))) {
        if (!isIntersected(object1, object2)) throw new Error("objects do not intersect");
        if (isCircle(object2) && isLineClass(object1)) {
            let temp = object2;
            object2 = object1;
            object1 = temp;
        }
        //isCircle(object1)
        //isLineClass(object2)
        let roots;
        let res;
        if (isVertical(object2)){
            roots = invLinEq(object2, 0)
            let i = circleEq(object1, roots);
            res = [new Point(roots, i[0]), new Point(roots, i[1])];
        }
        else {
            let m = getSlope(object2);
            let r = object1.radius
            let a = object1.center.x;
            let b = object1.center.y;
            let x1; let y1;
            if (isLine(object2)) {
                x1 = object2.pt1.x;
                y1 = object2.pt1.y;
            }
            else {
                x1 = object2.point.x;
                y1 = object2.point.y;
            }
            let A = 1 + m**2;
            let B = -2 * a - m**2 * 2 * x1 + 2 * y1 * m - 2 * b * m;
            let C = a**2 + m**2 * x1**2 - 2 * y1 * m * x1 + y1**2 + 2 * b * m * x1 - 2 * b * y1 + b**2 - r**2;
            roots = quadFormula(A,B,C);
            let i1 = linEq(object2, roots[0]);
            let i2 = linEq(object2, roots[1]);
            res = [new Point(roots[0], i1), new Point(roots[1], i2)];
        }
        return res;
    }
    if (isCircle(object1) && isCircle(object2)) {
        if (!isIntersected(object1, object2)) throw new Error("objects do not intersect");
        let commonLine = new Line(object1.center, object2.center)
        let d = getDistance(commonLine);
        let r = object1.radius;
        let s = object2.radius;
        let cosA = (s**2 - r**2 - d**2) / (-2 * r * d);
        let angle = 180 * Math.acos(cosA) / Math.PI;
        let l = dilate(commonLine, object1.center, r / d);
        let l1 = rotate(l, object1.center, angle);
        let l2 = rotate(l, object1.center, -1 * angle);
        return [l1.pt2, l2.pt2];

    }
}


function reflect(object, reflectLine) {
    if (!isLineClass(reflectLine)) {
        throw new Error("Must reflect over Line/ExtLine");
    }
    if (isPoint(object)) {
        return reflectPointOverLine(object, reflectLine);
    }
    else if (isLine(object)) {
        let reflectEnd1 = reflectPointOverLine(object.pt1, reflectLine);
        let reflectEnd2 = reflectPointOverLine(object.pt2, reflectLine);
        return new Line(reflectEnd1, reflectEnd2);
    }
    else if (isExtLine(object)) {
        let reflectPoint = reflectPointOverLine(object.point, reflectLine);
        return new ExtLine(reflectPoint, -1 * object.slope);
    }
    else if (isCircle(object)) {
        let c = reflectPointOverLine(object.center, reflectLine);
        return new Circle(c, object.radius);
    }
    else if (isTriangle(object)) {
        let p1 = reflectPointOverLine(object.pt1, reflectLine);
        let p2 = reflectPointOverLine(object.pt2, reflectLine);
        let p3 = reflectPointOverLine(object.pt3, reflectLine);
        return new Triangle(p1, p2, p3);
    }
    else if (isPolygon(object)) {
        let pointsArr = object.pointsArr;
        let newArr = new Array();
        for (let i = 0; i < pointsArr.length; i++) {
            let p = reflectPointOverLine(pointsArr[i], reflectLine);
            newArr.push(p);
        }
        return new Polygon(newArr);
    }
    else throw new Error("Cannot reflect object");
}
function rotate(object, rotatePoint, angle) {
    if (!isPoint(rotatePoint)) {
        throw new Error("Must rotate over Point");
    }
    if (isPoint(object)) {
        return rotatePointOverPoint(object, rotatePoint, angle);
    }
    else if (isLine(object)) {
        let rotateEnd1 = rotatePointOverPoint(object.pt1, rotatePoint, angle);
        let rotateEnd2 = rotatePointOverPoint(object.pt2, rotatePoint, angle);
        return new Line(rotateEnd1, rotateEnd2);
    }
    else if (isExtLine(object)) {
        let rotatePoint = rotatePointOverPoint(object.point, rotatePoint, angle);
        let newSlope = Math.tan(Math.atan(object.slope) + angle);
        return new ExtLine(rotatePoint, newSlope);
    }
    else if (isCircle(object)) {
        let c = rotatePointOverPoint(object.center, rotatePoint, angle);
        return new Circle(c, object.radius);
    } 
    if (isTriangle(object)) {
        let p1 = rotatePointOverPoint(object.pt1, rotatePoint, angle);
        let p2 = rotatePointOverPoint(object.pt2, rotatePoint, angle);
        let p3 = rotatePointOverPoint(object.pt3, rotatePoint, angle);
        return new Triangle(p1, p2, p3);
    }
    else if (isPolygon(object)) {
        let pointsArr = object.pointsArr;
        let newArr = new Array();
        for (let i = 0; i < pointsArr.length; i++) {
            let p = rotatePointOverPoint(pointsArr[i], rotatePoint, angle);
            newArr.push(p);
        }
        return new Polygon(newArr);
    }
    else throw new Error("Cannot rotate object")
}

function translate(object, dx, dy) {
    if (isPoint(object)) {
        return new Point(object.x + dx, object.y + dy)
    }
    else if (isLine(object)) {
        let p1 = new Point(object.pt1.x + dx, object.pt1.y + dy);
        let p2 = new Point(object.pt2.x + dx, object.pt2.y + dy);
        return new Line(p1, p2);
    }
    else if (isExtLine(object)) {
        let p = new Point(object.point.x + dx, object.point.y + dy);
        return new ExtLine(p, object.slope);

    }
    else if (isTriangle(object)) {
        let p1 = new Point(object.pt1.x + dx, object.pt1.y + dy);
        let p2 = new Point(object.pt2.x + dx, object.pt2.y + dy);
        let p3 = new Point(object.pt3.x + dx, object.pt3.y + dy);
        return new Triangle(p1, p2, p3);
    }
    else if (isPolygon(object)) {
        let arr = new Array();
        for (let i = 0; i < object.pointsArr.length; i++) {
            let p = new Point(object.pointsArr[i].x + dx, object.pointsArr[i].y + dy);
            arr.push(p);
        }
        return new Polygon(arr);
    }
}
function getCircumcenter(triangle) {
    if (!isTriangle(triangle)) throw new Error("Input must be of type Triangle");
    //circumcenter coordinates
    let angles = getIntAngles(triangle);
    angles.degToRad();
    const denom = Math.sin(2 * angles[0]) + Math.sin(2 * angles[1]) + Math.sin(2 * angles[2]);
    let x = (triangle.pt1.x * Math.sin(2 * angles[0]) + 
             triangle.pt2.x * Math.sin(2 * angles[1]) + 
             triangle.pt3.x * Math.sin(2 * angles[2]));
    let y = (triangle.pt1.y * Math.sin(2 * angles[0]) + 
             triangle.pt2.y * Math.sin(2 * angles[1]) + 
             triangle.pt3.y * Math.sin(2 * angles[2]));
    return new Point(x / denom, y / denom);

}
function getCentroid(triangle) {
    if (!isTriangle(triangle)) throw new Error("Input must be of type Triangle");
    let x = (triangle.pt1.x + triangle.pt2.x + triangle.pt3.x) / 3;
    let y = (triangle.pt1.y + triangle.pt2.y + triangle.pt3.y) / 3;
    return new Point(x,y);
}
function getOrthocenter(triangle) {
    if (!isTriangle(triangle)) throw new Error("Input must be of type Triangle");
    //orthocenter coordinates
    let angles = getIntAngles(triangle);
    angles.degToRad();
    const denom = Math.tan(angles[0]) + Math.tan(angles[1]) + Math.tan(angles[2]);
    let x = (triangle.pt1.x * Math.tan(angles[0]) + 
             triangle.pt2.x * Math.tan(angles[1]) + 
             triangle.pt3.x * Math.tan(angles[2]));
    let y = (triangle.pt1.y * Math.tan(angles[0]) + 
             triangle.pt2.y * Math.tan(angles[1]) + 
             triangle.pt3.y * Math.tan(angles[2]));
    return new Point(x / denom, y / denom);
}
function getIncenter(triangle) {
    if (!isTriangle(triangle)) throw new Error("Input must be of type Triangle");
    //orthocenter coordinates
    let angles = getIntAngles(triangle);
    let sides = getSides(triangle);
    angles.degToRad();
    let denom = getTrianglePerim(triangle);
    let x = (triangle.pt1.x * sides[0] + 
             triangle.pt2.x * sides[1] +
             triangle.pt3.x * sides[2]);
    let y = (triangle.pt1.y * sides[0] + 
             triangle.pt2.y * sides[1] +
             triangle.pt3.y * sides[2]);
    return new Point(x / denom, y / denom);
                     
}
////////////////////////////////////////////////////////////////////////////////
//Line Functions 

//converts line to Ext Line
function lineToExtLine(line) {
    if (!isLine(line)) throw new Error("Input must be of type Line");
    return new ExtLine(line.pt1, getSlope(line));
}
//returns perpendicular line
function getPerpendicularLine(point, line) {
    if (!isPoint(point)) throw new Error("Input must be of type Point");
    if (!isLineClass(line)) throw new Error("Input must be of type Line/ExtLine")
    let m1 = -1 / getSlope(line);
    let extLine = new ExtLine(point, m1);
    let newPt = getIntersection(line, extLine);
    return new Line(newPt, point);
}
//returns median
function getMedian(point, line) {
    if (!isPoint(point)) throw new Error("Input must be of type Point");
    if (!isLine(line)) throw new Error("Input must be of type Line");
    let mid = partition(line,1,1);
    return new Line(mid, point);
}

function dilate(object, refPoint, scaleFactor) {
    if (!isPoint(refPoint)) throw new Error("Input must be of type Point");
    if (!isNumber(scaleFactor)) throw new Error("Input must be a valid scale factor");
    //point is anchor
    if (isPoint(object)) {
        return dilatePoint(object, refPoint, scaleFactor)
    }
    else if (isLine(object)) {
        let newpt1 = dilatePoint(object.pt1, refPoint, scaleFactor);
        let newpt2 = dilatePoint(object.pt2, refPoint, scaleFactor);
        return new Line(newpt1, newpt2);
    }
    else if (isCircle(object)) {
        let newpt1 = dilatePoint(object.center, refPoint, scaleFactor);
        return new Circle(newpt1, object.center * scaleFactor);
    }
    else if (isTriangle(object)) {
        let newpt1 = dilatePoint(object.pt1, refPoint, scaleFactor);
        let newpt2 = dilatePoint(object.pt2, refPoint, scaleFactor);
        let newpt3 = dilatePoint(object.pt3, refPoint, scaleFactor);
        return new Triangle(newpt1, newpt2, newpt3);
    }
    else if (isPolygon(object)) {
        let pts = object.pointsArr;
        let newPts = []
        for (let i = 0; i < pts.length; i++) {
            newPts.push(dilatePoint(pts[i], refPoint, scaleFactor));
        }
        return new Polygon(newPts);
    }
    else throw new Error("Invalid object to dilate");
}
//revisit
//may need to introduce a ray
//adjust for ExtLine (point may be obselete)
function getAngleBisector(point, line1, line2) {
    if (!isPoint(point)) throw new Error("Input must be of type Point");
    if (!isLine(line1) || !isLine(line2)) throw new Error("Input must be of type Line");
    //point is the vertex of line1, line2
    if (getAngle(point, line1, line2) == null) return null;

    //gets the non vertex points
    let outerPoint1; //non vertex point of line1
    let outerPoint2; //non vertex point of line2
    if (pointEqual(point, line1.pt1)) outerPoint1 = line1.pt2;
    else outerPoint1 = line1.pt1;
    if (pointEqual(point, line2.pt1)) outerPoint2 = line2.pt2;
    else outerPoint2 = line2.pt1;
    let oppositeSide = new Line(outerPoint1, outerPoint2);
    //angle bisector thereom
    let scale = getDistance(line1) / (getDistance(line1) + getDistance(line2));
    let scaledLine = dilate(oppositeSide, outerPoint1, scale);
    let angleBi = new Line(point, scaledLine.pt2);
    return lineToExtLine(angleBi);

}

//returns diameter of a circle
function getDiameter(point, circle) {
    if (!isPoint(point)) throw new Error("Input must be of type Point");
    if (!isCircle(circle)) throw new Error("Input must be of type Circle");
    if (!onCircle(point, circle)) throw new Error("Point must be on circle");
    let radius = new Line(point, circle.center);
    return dilate(radius, point, 2);
}
//returns line to a circle
function getTangent(point, circle) {
    if (!isPoint(point)) throw new Error("Input must be of type Point");
    if (!isCircle(circle)) throw new Error("Input must be of type Circle");
    if (!onCircle(point, circle)) throw new Error("Point must be on circle");
    let radius = new Line(point, circle.center);
    let slope = getSlope(radius);
    return new ExtLine(point, -1 / slope);
}


////////////////////////////////////////////////////////////////////////////////
//centered at (0,0)
function newRegPolygon(numOfSides, sideLength) {
    const centralAngle = 2 * Math.PI / numOfSides;
    const rSquared = sideLength**2 / (2 - 2*Math.cos(centralAngle));
    const r = Math.sqrt(rSquared);
    let circle = new Circle(new Point(0,0), r);
    let pointsArr = new Array();
    let p = new Point(r, 0);
    for (let i = 0; i < numOfSides; i++) {
        pointsArr.push(p);
        p = rotatePointOverPoint(p, circle.center, 180 * centralAngle / Math.PI);
    }
    if (pointsArr.length == 3) {
        let t = newPolygon(pointsArr[0], pointsArr[1], pointsArr[2]);
        if (!isTriangle(t)) throw new Error("Invalid Triangle");
        return t;
    }
    let pg = new Polygon(pointsArr);
    if (!isPolygon(pg)) throw new Error("Invalid Polygon");
    return pg;

}

////////////////////////////////////////////////////////////////////////////////
//Distance and Angle Function

//returns distance of a line
function getDistance(line) {
    if (!isLine(line)) throw new Error("Input must be of type Line");
    let dx = (line.pt1.x - line.pt2.x) ** 2
    let dy = (line.pt1.y - line.pt2.y) ** 2;
    return (dx + dy) ** .5;
}

//returns angle between two lines and their vertex
function getAngle(point, line1, line2) {
    if (!isPoint(point)) throw new Error("Input must be of type Point");
    if (!isLine(line1) || !isLine(line2)) throw new Error("Input must be of type Line");
    //ensure lines are instanceof Line;
    let intersect = getIntersection(line1, line2);
    if (!pointEqual(point, intersect)) throw new Error("point is not the vertex");
    //intersect != null && pointEqual(point, intersect)
    //Get Angle with dot product
    let d1 = getDistance(line1);
    let d2 = getDistance(line2);
    //one of the terms will be 0 because point is one of the endpoints
    let vector1x = (line1.pt1.x - point.x) + (line1.pt2.x - point.x);
    let vector1y = (line1.pt1.y - point.y) + (line1.pt2.y - point.y);
    let vector2x = (line2.pt1.x - point.x) + (line2.pt2.x - point.x);
    let vector2y = (line2.pt1.y - point.y) + (line2.pt2.y - point.y);
    let dotProd = (vector1x * vector2x) + (vector1y * vector2y);
    let cosAngle = dotProd / (d1 * d2);
    let Angle = Math.acos(cosAngle);
    //Angle in Radians -> convert to degrees
    return (Angle / Math.PI) * 180;
}
function getSides(object) {
    if (!isTriangle(object) && !isPolygon(object)) {
        throw new Error("Invalid geometry object")
    }
    if (isTriangle(object)) {
        let side1 = getDistance(new Line(object.pt2, object.pt3));
        let side2 = getDistance(new Line(object.pt1, object.pt3));
        let side3 = getDistance(new Line(object.pt1, object.pt2));
        return [side1, side2, side3];
    }
    if (isPolygon(object)) {
        let arr = new Array();
        for (let i = 0; i < object.pointsArr.length; i++) {
            let l = new Line(object.pointsArr[i], object.pointsArr[(i + 1) % object.pointsArr.length]);
            arr.push(getDistance(l));
        }
        return arr;
        
    }
}
function getIntAngles(object) {
    if (!isTriangle(object) && !isPolygon(object)) {
        throw new Error("Invalid geometry object")
    }
    if (isTriangle(object)) {
        //law of cosine
        let sides = getSides(object);
        let cosA1 = (sides[0]**2 - sides[1]**2 - sides[2]**2) / (-2 * sides[1] * sides[2]);
        let cosA2 = (sides[1]**2 - sides[0]**2 - sides[2]**2) / (-2 * sides[0] * sides[2]);
        let cosA3 = (sides[2]**2 - sides[0]**2 - sides[1]**2) / (-2 * sides[0] * sides[1]);
        let a1 = Math.acos(cosA1)
        let a2 = Math.acos(cosA2)
        let a3 = Math.acos(cosA3)
        return [a1 * 180 / Math.PI, a2 * 180 / Math.PI, a3 * 180 / Math.PI];
    }
    if (isTriangle(object) || isPolygon(object)) {
        let arr = new Array();
        let lines = getLines(object);
        for (let i = 0; i < lines.length; i++) {
            let nextI = (i + 1) % lines.length

            let a = getAngle(lines[i].pt2, lines[i], lines[nextI]);
            arr.push(a);
        }
        return arr;
    }
}
////////////////////////////////////////////////////////////////////////////////
//Area and Perimeter Function

function getPerimeter(shape) {
    if (!isCircle(shape) && !isTriangle(shape) && !isPolygon(shape)) {
        throw new Error("Input must be a valid shape");
    }
    if (isCircle(shape)) return Math.PI * shape.radius * 2;
    if (isTriangle(shape)) return getTrianglePerim(shape);
    if (isPolygon(shape)) {
        let lines = getLines(shape);
        perimeter = 0;
        for (let i = 0; i < lines.length; i++) {
            perimeter += getDistance(lines[i]);
        }
        return perimeter;
    }
}
function getArea(shape) {
    if (!isCircle(shape) && !isTriangle(shape) && !isPolygon(shape)) {
        throw new Error("Input must be a valid shape");
    }
    if (isCircle(shape)) return Math.PI * shape.radius**2;
    if (isTriangle(shape)) return getTriangleArea(shape);
    if (isPolygon(shape)) {
        let ptsArr = shape.pointsArr;
        let area = 0;
        for (let i = 1; i < ptsArr.length - 1; i++) {
            let t = new Triangle(ptsArr[0], ptsArr[i], ptsArr[i+1])
            area += getTriangleArea(t);
        }
        return area;
    }
}


////////////////////////////////////////////////////////////////////////////////
//Property Function


//returns if two points are Equal
function pointEqual(point1, point2) {
    if (!isPoint(point1) || !isPoint(point2)) throw new Error("Inputs must be of type Point")
    return (almostEqual(point1.x,point2.x) && almostEqual(point1.y,point2.y));
}
//returns if two lines are equal
function lineEqual(line1, line2) {
    if (!isLineClass(line1) || !isLineClass(line2)) {
        throw new Error("Inputs must be of type Line");
    }
    if (line1 instanceof Line && line2 instanceof Line) {
        return ((pointEqual(line1.pt1, line2.pt1) || pointEqual(line1.pt1, line2.pt2)) &&
                (pointEqual(line1.pt2, line2.pt1) || pointEqual(line1.pt2, line2.pt2)));
    }
    if (line1 instanceof ExtLine && line2 instanceof ExtLine) {
        let ln = new Line(line1.point, line2.point);
        let m = getSlope(ln);
        if (isVertical(line1) && isVertical(line2) && (isVertical(ln) || isNaN(m))) return true;
        return (almostEqual(line1.slope,line2.slope) &&
               (almostEqual(m, line1.slope) || isNaN(m)));
    }
    //if lines are different type, return false
    return false;
}
//returns if two circles are equal
function circleEqual(circle1, circle2) {
    if (!isCircle(circle1) || !isCircle(circle2)) {
        throw new Error("Inputs must be of type Circle");
    }
    return (pointEqual(circle1.center, circle2.center) && circle1.radius == circle2.radius);
}
function polygonEqual(shape1, shape2) {
    if (!isTriangle(shape1, shape2) && !isPolygon(shape1, shape2)) {
        throw new Error("Invalid Shape");
    }
    if ((isTriangle(shape1) && isTriangle(shape2)) || (isPolygon(shape1) && isPolygon(shape2))) {
        let p1 = getPoints(shape1);
        let p2 = getPoints(shape2);
        let len = p1.length;
        //p1.length == p2.length
        for (let i = 0; i < len; i++) {
            for (var j = 0 ; j < len; j++) {
                if (pointEqual(p1[i], p2[j])) break
            }
            if (j == len) return false;
        }
        return true;
    }
}
//returns slope, may return NaN or Infinity
function getSlope(line) {
    if (!isLineClass(line)) throw new Error("Input must be of type Line/ExtLine");
    //returns NaN when the endpoints of the line is the same
    //returns Infinity, when the line is vertical (n / 0)
    if (line instanceof Line) {
        let dy = (line.pt1.y - line.pt2.y);
        let dx = (line.pt1.x - line.pt2.x);
        let m = dy / dx;
        if (Math.abs(m) == Infinity) return Infinity;
        return m;
    }
    if (line instanceof ExtLine) return line.slope;
}
//returns if two lines are parallel
function isParallel(line1, line2) {
    if (!isLineClass(line1) || !isLineClass(line2)) {
        throw new Error("Input must be of type Line/ExtLine");
    }
    if (Math.abs(getSlope(line1)) === Infinity && Math.abs(getSlope(line2)) === Infinity) return true;
    if (getSlope(line1) == getSlope(line2)) return true;
    return false;
}
//returns if two line segments intersect
function isIntersected(object1, object2) {
    //line intersection
    if (isLineClass(object1) && isLineClass(object2)) {
        if (isParallel(object1, object2)) return false;
        //ensures line1 is vertical if at all; checks vertical lines once for both lines
        if (Math.abs(getSlope(object2)) === Infinity || isNaN(getSlope(object2))) {
            let lineTemp = object2;
            object2 = object1;
            object1 = lineTemp;
        }
        //Case if one of the line is vertical
        if (Math.abs(getSlope(object1)) === Infinity || isNaN(getSlope(object1))) {
            //gets the constant x value on a vertical line
            let x;
            if (object1 instanceof Line) x = object1.pt1.x;
            else x = object1.point.x;
            //y value of intersection
            let y = linEq(object2, x);

            //tests if (x,y) is on both lines
            let onLine1;
            let onLine2;
            if (object1 instanceof Line) {
                //x is constant on vertical line
                onLine1 = (Math.min(object1.pt1.y, object1.pt2.y) <= y &&
                           y <= Math.max(object1.pt1.y, object1.pt2.y) ||
                           almostEqual(Math.min(object1.pt1.y, object1.pt2.y), y) || 
                           almostEqual(Math.max(object1.pt1.y, object1.pt2.y), y));
            } else onLine1 = true; //always on infinetly extending line
            if (object2 instanceof Line) {
                //if y is satisfied, x is satisfied, lin fn is injective
                onLine2 = (Math.min(object2.pt1.y, object2.pt2.y) <= y &&
                           y <= Math.max(object2.pt1.y, object2.pt2.y) ||
                           almostEqual(Math.min(object2.pt1.y, object2.pt2.y), y) || 
                           almostEqual(Math.max(object2.pt1.y, object2.pt2.y), y));
            } else onLine2 = true; //always on infinetly extending line
            return onLine1 && onLine2
        }
        //Two non-parallel, non-vertical lines
        let m1 = getSlope(object1);
        let m2 = getSlope(object2);
        let x1;
        let x2;
        let y1;
        let y2;
        if (object1 instanceof Line) {
            x1 = object1.pt1.x;
            y1 = object1.pt1.y;
        } else {
            x1 = object1.point.x;
            y1 = object1.point.y;
        } if (object2 instanceof Line) {
            x2 = object2.pt1.x;
            y2 = object2.pt1.y;
        } else {
            x2 = object2.point.x;
            y2 = object2.point.y;
        }
        let x = ((m1 * x1 - m2 * x2) + (y2 - y1)) / (m1 - m2);
        let onLine1;
        let onLine2;
        if (object1 instanceof Line) {
            onLine1 = (Math.min(object1.pt1.x, object1.pt2.x) <= x &&
                       x <= Math.max(object1.pt1.x, object1.pt2.x) ||
                       almostEqual(Math.min(object1.pt1.x, object1.pt2.x), x) || 
                       almostEqual(Math.max(object1.pt1.x, object1.pt2.x), x));
        } else onLine1 = true;
        if (object2 instanceof Line) {
            onLine2 = (Math.min(object2.pt1.x, object2.pt2.x) <= x &&
                       x <= Math.max(object2.pt1.x, object2.pt2.x) ||
                       almostEqual(Math.min(object2.pt1.x, object2.pt2.x), x) || 
                       almostEqual(Math.max(object2.pt1.x, object2.pt2.x), x));
        } else onLine2 = true;
        return onLine1 && onLine2;
    }
    //circle and line intersection
    else if ((isCircle(object1) && isLineClass(object2)) || (isCircle(object2) && isLineClass(object1))) {
        if (isCircle(object2) && isLineClass(object1)) {
            let temp = object2;
            object2 = object1;
            object1 = temp;
        }
        //isCircle(object1)
        //isLineClass(object2)
        let m = getSlope(object2);
        let r = object1.radius
        let a = object1.center.x;
        let b = object1.center.y;
        let x1;
        let y1;
        if (isLine(object2)) {
            x1 = object2.pt1.x;
            y1 = object2.pt1.y;
        }
        else {
            x1 = object2.point.x;
            y1 = object2.point.y;
        }
        let A = 1 + m**2;
        let B = -2 * a - m**2 * 2 * x1 + 2 * y1 * m - 2 * b * m;
        let C = a**2 + m**2 * x1**2 - 2 * y1 * m * x1 + y1**2 + 2 * b * m * x1 - 2 * b * y1 + b**2 - r**2;
        return discrimate(A, B, C) >= 0 || almostEqual(discrimate(A,B,C), 0);  
    }
    //circle intersection
    else if (isCircle(object1) && isCircle(object2)) {
        let d = getDistance(new Line(object1.center, object2.center));
        let minD = Math.abs(object1.radius - object2.radius);
        let maxD = object1.radius + object2.radius;
        return ((minD <= d && d <= maxD) || almostEqual(d, maxD) || almostEqual(d, minD));
    }
    else throw new Error("Invalid objects")
}
function isCollinear(point1, point2, point3) {
    if (!isPoint(point1) || !isPoint(point2) || !isPoint(point3)) {
        throw new Error("Inputs must be of type Point")
    }
    let line1 = new Line(point1, point2);
    let line2 = new Line(point2, point3);
    let line3 = new Line(point1, point3);
    //parallelism is transitive
    return isParallel(line1, line2) && isParallel(line2, line3);
}
//returns if two lines are perpendicular
function isPerpendicular(line1, line2) {
    if (!isLineClass(line1) || !isLineClass(line2)) {
        throw new Error("Input must be of type Line/ExtLine");
    }
    let m1 = getSlope(line1);
    let m2 = getSlope(line2);
    if (m1 == 0 && Math.abs(m2) == Infinity) return true;
    if (m2 == 0 && Math.abs(m1) == Infinity) return true;
    return almostEqual(m1, -1 / m2);
}
function onLine(point, line) {
    if (!isPoint(point)) throw new Error("Input must be of type Point");
    if (!isLineClass(line)) throw new Error("Input must be of type Line");
    if (line instanceof Line) {
        if (getSlope(line) == Infinity) {
            if (Math.min(line.pt1.y, line.pt2.y) <= point.y && point.y <= Math.max(line.pt1.y, line.pt2.y)) {
                return almostEqual(invLinEq(line, point.y), point.x);
            }
        }
        else if (Math.min(line.pt1.x, line.pt2.x) <= point.x && point.x <= Math.max(line.pt1.x, line.pt2.x)) {
            return almostEqual(linEq(line, point.x), point.y);
        }
        return false;
    }
    if (line instanceof ExtLine) {
        let tempLine = new Line(point, line.point);
        return almostEqual(getSlope(tempLine), line.slope)
    }
}

//returns if point is on a circle
function onCircle(point, circle) {
    if (!isPoint(point)) throw new Error("Input must be of type Point");
    if (!isCircle(circle)) throw new Error("Input must be of type Circle");
    let line = new Line(point, circle.center);
    let dist = getDistance(line);
    return (almostEqual(dist, circle.radius));
}