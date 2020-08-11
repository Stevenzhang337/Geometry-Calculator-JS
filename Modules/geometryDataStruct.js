//Data structure for implementing the state of a board

var geoStruct = (function() {
    function hashPoint(point) {
        let sum = point.x + point.y;
        let triNum = (sum + 1)*(sum + 2) / 2;
        return triNum - point.x - 1;
    }
    //probably exists a better hash function
    //hash function must return the same value for the same object
    //(even if point order is different)
    function hash(object) {
        if (object instanceof geo.Point) {
            return Math.abs(Math.floor(hashPoint(object)))
        }
        else if (object instanceof geo.Line) {
            let h1 = hashPoint(object.pt1);
            let h2 = hashPoint(object.pt2);
            return Math.abs(Math.floor(h1 + h2));
        }
        else if (object instanceof geo.ExtLine) {
            let h = hashPoint(object.point);
            return Math.abs(Math.floor(h + h));
        }
        else if (object instanceof geo.Circle) {
            let h = hashPoint(object.center);
            return Math.abs(Math.floor(((h + object.radius) * object.radius)));
        }
        else if (object instanceof geo.Triangle) {
            let h1 = hashPoint(object.pt1);
            let h2 = hashPoint(object.pt2);
            let h3 = hashPoint(object.pt3);
            return Math.abs(Math.floor(h1 + h2 + h3));
        }
        else if (object instanceof geo.Polygon) {
            let h = 0;
            for (let i = 0; i < object.pointsArr.length; i++) {
                h += hashPoint(object.pointsArr[i]);
            }
            return Math.abs(Math.floor(h));
        }
    }
    //detects new polygon that forms when two points connect
    function connectedPolygon(lineI, objectArr, parentArr, childrenArr) {
        let i1 = parentArr[lineI][0];
        let i2 = parentArr[lineI][1];
        
        let seen = [i1];
        let newShapes = walkPolygon(i1, objectArr, parentArr, childrenArr, seen ,i2);
        let res = []
        for (let i = 0; i < newShapes.length; i++) {
            if (newShapes[i].length > 2) {
                res.push(newShapes[i]);
            }
        }
        return res;
    }
    function walkPolygon(i, objectArr, parentArr, childrenArr, seen, endPoint) {
        //i == endPoint, we reached the end
        if (i == endPoint) return [i]; //res = [i]
    
        let validMoves = childrenArr[i];
    
        //checks for collienar paths
        let uniquePaths = []
        let validMoves2 = []
        for (let j = 0; j < validMoves.length; j++) {
            let ind = validMoves[j];
            let l = objectArr[ind];
            if (l instanceof geo.Line) {
                let slope = geo.getSlope(l);
                if (!uniquePaths.includes(slope)) {
                    uniquePaths.push(slope);
                    validMoves2.push(validMoves[j]);
                }
            }
        }
        let res = [];
        //check all validMoves
        for (let j = 0; j < validMoves2.length; j++) {
            let tempSeen = seen.copy();
            let path = validMoves2[j];
            let endP = parentArr[path][0] + parentArr[path][1] - i;
            //if not seen, explore path
            if (!tempSeen.includes(endP)) {
                tempSeen.push(endP);
                let remainPath = walkPolygon(endP, objectArr, parentArr, childrenArr, tempSeen, endPoint);
                //adds i to the successful paths
                for (let k = 0; k < remainPath.length; k++) {
                    let possPath = [i].concat(remainPath[k]);
                    res.push(possPath);
                }
            }
        }
        return res
    }
    //if an object shifts, all of its parents move
    function getShiftChildren(i, objectArr, childrenArr, seen) {
        let res = [];
        for (let j = 0; j < childrenArr[i].length; j++) {
            let ind = childrenArr[i][j];
            if (seen.includes(ind)) continue;
            seen.push(ind);
            if (objectArr[ind] instanceof geo.Point) {
                res.push(ind);
            }
            else res = res.concat(getShiftChildren(ind, objectArr, childrenArr, seen));
        }
        return res;
    }
    //if an object shifts, all of its parents move
    function getDeleteChildren(i, geo, seen) {
        let res = [];
        for (let j = 0; j < geo.childrenArr[i].length; j++) {
            let ind = geo.childrenArr[i][j];
            if (seen.includes(ind)) continue;
            seen.push(ind);
            res.push(ind);
            res = res.concat(getDeleteChildren(ind, geo, seen));
        }
        return res;
    }
    function shiftObjTemp(object, dx = 0, dy = 0, geoStr, seen) {
        let i = geoStr.find(object);
        if (i == -1) throw new Error("Object not found");
        //shift itself
        if (object instanceof geo.Point || object instanceof geo.Circle ||
            object instanceof geo.ExtLine) {
            if (!seen.includes(i)) {
                appendShift(i, geoStr, dx, dy);
                seen.push(i)
            }
            for (let j = 0; j < geoStr.shiftDep[i].length; j++) {
                let ind = geoStr.shiftDep[i][j];
                if (seen.includes(ind)) continue
                seen.push(ind);
    
                //shifts
                let shiftchild = geoStr.objectArr[ind];
                //transform shiftDep Obj
                let transform = geoStr.shiftProp[i][ind].transform(dx, dy, geoStr);
                if (shiftchild instanceof geo.Point) {
                    let dxx = transform[0];
                    let dyy = transform[1];
                    geoStr.shiftArr[ind][0] += dxx;
                    geoStr.shiftArr[ind][1] += dyy;
                }
                else if (shiftchild instanceof geo.Circle) {
                    geoStr.shiftArr[ind] += transform;
                }
                else geoStr.shiftArr[ind] = transform;
                //move dep of dep if it does
                shiftObjTemp(shiftchild, dx, dy, geoStr, seen)
            }
        }
        //shifts all its dep
        else {
            let seenAgain = []
            let par = getShiftChildren(i, geoStr.objectArr, geoStr.parentArr, []);
            console.log(par);
            for (let j = 0; j < par.length; j++) {
                let ind = par[j]
                let obj = geoStr.objectArr[ind];
                shiftObjTemp(obj, dx, dy, geoStr, seenAgain);
                console.log(seenAgain)
            }
        }
        
    }
    function appendShift(ind, geoStr, dx, dy) {
        let obj = geoStr.objectArr[ind];
        if (obj instanceof geo.Point) {
            geoStr.shiftArr[ind][0] += dx;
            geoStr.shiftArr[ind][1] += dy;
        }
        else if (obj instanceof geo.Circle) geoStr.shiftArr[ind] += dx;
        else if (obj instanceof geo.ExtLine) geoStr.shiftArr[ind] = dx;
    }
    function isValidPolygon(pointsArr) {
        let lines = new Array();
        for (let i = 0; i < pointsArr.length; i++){
            let pt1 = pointsArr[i];
            let pt2 = pointsArr[(i + 1) % pointsArr.length];
            if (!pt1 instanceof geo.Point || !pt2 instanceof geo.Point) return false
            let l = new geo.Line(pt1, pt2);
            lines.push(l);
        }
        for (let i = 0; i < lines.length; i++) {
            for (let j = 0; j < lines.length; j++) {
                if (!(j == i || (j + 1) % lines.length == i || j == (i - 1) % lines.length ||
                     (j - 1) % lines.length == i || j == (i + 1) % lines.length) &&
                     geo.isIntersected(lines[i], lines[j])) {
                        return false
                      }
            }
        }
        return true;
    }
    function pointOnExtLine(geoS, point, line) {
        if (!geo.onLine(point, line)) throw new Error("not on line");
        let resLine;
        let dis = 0;
        for (let i = 0; i < geoS.getOverlap(line).length; i++) {
            let object = geoS.getOverlap(line)[i]
            //checks everything twice, could be more efficient
            for (let j = 0; j < geo.getPoints(object).length; j++) {
                otherP = geo.getPoints(object)[j]
                let newLine = new geo.Line(point, otherP);
                let cmpDis = geo.getDistance(newLine)
                if (cmpDis > dis) {
                    resLine = newLine; 
                    dis = cmpDis;
                }
            }
        }
        if (resLine == undefined) return new geo.Line(point, line.point);
        return resLine;
    }
    function pointOnExtLineNear(geoS, point, line) {
        if (!geo.onLine(point, line)) throw new Error("not on line");
        let resLine;
        let dis = Infinity;
        for (let i = 0; i < geoS.getOverlap(line).length; i++) {
            let object = geoS.getOverlap(line)[i]
            //checks everything twice, could be more efficient
            for (let j = 0; j < geo.getPoints(object).length; j++) {
                otherP = geo.getPoints(object)[j]
                let newLine = new geo.Line(point, otherP);
                let cmpDis = geo.getDistance(newLine)
                if (cmpDis < dis) {
                    resLine = newLine; 
                    dis = cmpDis;
                }
            }
        }
        if (resLine == undefined) return line.point;
        return resLine.pt2;
    }
    ////////////////////////////////////////////////////////////////////////////////
    //############################################################################//
    ////////////////////////////////////////////////////////////////////////////////
    class Geometry {
        constructor() {
            this.display = new Array();
            this.selected = new Array();
            //holds object at hash index
            this.objectArr = new Array();
    
            //holds shift values
            this.shiftArr = new Array();
            //holds shift scaleFactors
            this.shiftProp = new Array();
            //holds shift depenedents
            this.shiftDep = new Array();
    
            this.parentArr = new Array();
            this.childrenArr = new Array();

            //lines contains subsets of line
            //extline contains points on line
            this.overlap = new Array();
        }
        hasChildren(object) {
            let i = this.find(object);
            return this.children[i].length != 0
        }
        getOverlap(object) {
            let i = this.find(object);
            let overlapArr = this.overlap[i];
            let res = new Array();
            if (overlapArr == undefined) return res;
            for (let j = 0; j < overlapArr.length; j++) {
                let ind = overlapArr[j]
                let obj = this.objectArr[ind];
                res.push(obj)
            }
            return res;
        }
        hasOverlap(line) {
            return this.getOverlap(line).length > 0;
        }
        addOverlap(line, lineArr) {
            let i = this.find(line);
            for (let i = 0; i < lineArr.length; i++) {
                let ind = this.find(lineArr[i]);
                this.overlap[i].push(ind);
            }
        }
        //searches for new objects
        find(object) {
            if (object instanceof geo.Point) {
                let i = hash(object);
                while(i < this.objectArr.length && this.objectArr[i] != undefined) {
                    if (this.objectArr[i] instanceof geo.Point &&
                        geo.pointEqual(this.objectArr[i], object)) return i;
                    i++;
                }
                return -1;
            }
            else if (object instanceof geo.Line) {
                let i = hash(object);
                while(i < this.objectArr.length && this.objectArr[i] != undefined) {
                    if (this.objectArr[i] instanceof geo.Line &&
                        geo.lineEqual(this.objectArr[i], object)) return i;
                    i++;
                }
                return -1
            }
            else if (object instanceof geo.ExtLine) {
                let i = hash(object);
                while(i < this.objectArr.length && this.objectArr[i] != undefined) {
                    if (this.objectArr[i] instanceof geo.ExtLine &&
                        geo.lineEqual(this.objectArr[i], object)) return i;
                    i++;
                }
                return -1
            }
            else if (object instanceof geo.Circle) {
                let i = hash(object);
                while(i < this.objectArr.length && this.objectArr[i] != undefined) {
                    if (this.objectArr[i] instanceof geo.Circle &&
                        geo.circleEqual(this.objectArr[i], object)) return i;
                    i++;
                }
                return -1
            }
            else if (object instanceof geo.Triangle) {
                let i = hash(object);
                while(i < this.objectArr.length && this.objectArr[i] != undefined) {
                    if (this.objectArr[i] instanceof geo.Triangle &&
                        geo.polygonEqual(this.objectArr[i], object)) return i;
                    i++;
                }
                return -1
            }
            else if (object instanceof geo.Polygon) {
                let i = hash(object);
                while(i < this.objectArr.length && this.objectArr[i] != undefined) {
                    if (this.objectArr[i] instanceof geo.Polygon &&
                        geo.polygonEqual(this.objectArr[i], object)) return i;
                    i++;
                }
                return -1
            }
        }
        //make new objects
        //autocheck should be preferrably not on with polygons
        append(object, autocheck = true) {
            if (object instanceof geo.Point) {
                let i = hash(object);
                while(i < this.objectArr.length && this.objectArr[i] != undefined) {
                    if (this.objectArr[i] instanceof geo.Point &&
                        geo.pointEqual(this.objectArr[i], object)) return;
                    i++;
                }
                this.display.push(object);
                this.objectArr[i] = object;
                this.parentArr[i] = [];
                this.childrenArr[i] = [];
                this.shiftArr[i] = [0,0];
                this.shiftProp[i] = [];
                this.shiftDep[i] = []
                //online
                if (!autocheck) return
                let skip = false;
                for (let i = 0; i < this.display.length; i++) {
                    let line = this.display[i];
                    if (line instanceof geo.Line && geo.onLine(object, line) && !this.hasOverlap(line)) {
                        this.pointOnLine(object, line);
                        skip = true;
                    }
                }
                if (skip) return
                for (let i = 0; i < this.display.length; i++) {
                    let line = this.display[i];
                    if (line instanceof geo.ExtLine && geo.onLine(object, line)) {
                        let newLine = pointOnExtLine(this, object, line);
                        let nearPoint = pointOnExtLineNear(this,object,line);
                        
                        this.append(newLine);
                        this.append(nearPoint);
                        let i1 = this.find(line)
                        let i2 = this.find(newLine);
                        this.overlap[i1] = [i2];
                        this.pointOnLine(nearPoint, newLine)
                    }
                }
            }
            else if (object instanceof geo.Line) {
                //find points in array
                this.append(object.pt1, autocheck);
                this.append(object.pt2, autocheck);
                let ind1 = this.find(object.pt1);
                let ind2 = this.find(object.pt2);
    
                //add line
                let i = hash(object);
                while(i < this.objectArr.length && this.objectArr[i] != undefined) {
                    if (this.objectArr[i] instanceof geo.Line &&
                        geo.lineEqual(this.objectArr[i], object)) return;
                    i++;
                }
                this.display.push(object);
                this.objectArr[i] = object;
                this.parentArr[i] = [];
                this.childrenArr[i] = [];
                this.overlap[i] = [];
    
                this.parentArr[i].push(ind1);
                this.parentArr[i].push(ind2);
                this.childrenArr[ind1].push(i);
                this.childrenArr[ind2].push(i); 
    
                //check if any triangles/polygon were created
                if (autocheck) {
                    let newShapes = connectedPolygon(i, this.objectArr, this.parentArr, this.childrenArr);
                    for (let i = 0; i < newShapes.length; i++) {
                        let ptArr = []
                        for (let j = 0; j < newShapes[i].length; j++) {
                            let ind = newShapes[i][j];
                            ptArr.push(this.objectArr[ind]);
                        }
                        if (ptArr.length == 3) {
                            let t = new geo.Triangle(ptArr[0], ptArr[1], ptArr[2]);
                            this.append(t, autocheck);
                        }
                        else { //polygon with sides > 3
                            if (isValidPolygon(ptArr)) {
                                let pg = new geo.Polygon(ptArr);
                                this.append(pg, autocheck);
                            }

                        }
                    }
                }
    
            }
            else if (object instanceof geo.ExtLine) {
                this.append(object.point, autocheck);
                let ind1 = this.find(object.point);
    
                let i = hash(object);
                while(i < this.objectArr.length && this.objectArr[i] != undefined) {
                    if (this.objectArr[i] instanceof geo.ExtLine &&
                        geo.lineEqual(this.objectArr[i], object)) return;
                    i++;
                }
                this.display.push(object);
                this.objectArr[i] = object;
                this.parentArr[i] = [];
                this.childrenArr[i] = [];
                this.shiftDep[i] = [];
                this.shiftProp[i] = [];
                this.shiftArr[i] = 0;
                this.overlap[i] = [];
    
                this.parentArr[i].push(ind1);
                this.childrenArr[ind1].push(i);
            }
            else if (object instanceof geo.Circle) {
                this.append(object.center, autocheck);
                let ind1 = this.find(object.center);
    
                let i = hash(object);
                while(i < this.objectArr.length && this.objectArr[i] != undefined) {
                    if (this.objectArr[i] instanceof geo.Circle &&
                        geo.circleEqual(this.objectArr[i], object)) return;
                    i++;
                }
                this.display.push(object);
                this.objectArr[i] = object;
                this.parentArr[i] = [];
                this.childrenArr[i] = [];
                this.shiftDep[i] = [];
                this.shiftProp[i] = [];
                this.shiftArr[i] = 0;
    
                this.parentArr[i].push(ind1);
                this.childrenArr[ind1].push(i);
            }
            else if (object instanceof geo.Triangle) {
                //adds points/lines to the struct
                let l = geo.getLines(object);
                this.append(l[0], autocheck);
                this.append(l[1], autocheck);
                this.append(l[2], autocheck);
                let ind1 = this.find(l[0]);
                let ind2 = this.find(l[1]);
                let ind3 = this.find(l[2]);
    
                let i = hash(object);
                while(i < this.objectArr.length && this.objectArr[i] != undefined) {
                    if (this.objectArr[i] instanceof geo.Triangle &&
                        geo.polygonEqual(this.objectArr[i], object)) return;
                    i++;
                }
                this.display.push(object);
                this.objectArr[i] = object;
                this.parentArr[i] = [];
                this.childrenArr[i] = [];
    
                this.parentArr[i].push(ind1);
                this.parentArr[i].push(ind2);
                this.parentArr[i].push(ind3);
                this.childrenArr[ind1].push(i);
                this.childrenArr[ind2].push(i);
                this.childrenArr[ind3].push(i);
            }
            else if (object instanceof geo.Polygon) {
                let l = geo.getLines(object);
                let indArr = new Array();
                for (let i = 0; i < l.length; i++) {
                    this.append(l[i], autocheck);
                    indArr.push(this.find(l[i]));
                }
    
                let i = hash(object);
                while(i < this.objectArr.length && this.objectArr[i] != undefined) {
                    if (this.objectArr[i] instanceof geo.Polygon &&
                        geo.polygonEqual(this.objectArr[i], object)) return;
                    i++;
                }
                this.display.push(object);
                this.objectArr[i] = object;
                this.parentArr[i] = [];
                this.childrenArr[i] = [];
    
                for (let j = 0; j < indArr.length; j++) {
                    this.parentArr[i].push(indArr[j]);
                    this.childrenArr[indArr[j]].push(i);
                }
            }
        }
    
        //deletes object
        delete(object) {
            let i = this.find(object);
            if (i == -1) return; //object not found
            let seen = []
            let children = getDeleteChildren(i, this, seen);
            children.push(i);
            for (let j = 0; j < children.length; j++) {
                let ind = children[j];
                let obj = this.objectArr[ind];
                this.objectArr[ind] = undefined;
                this.display.remove(obj)
                this.shiftArr[ind] = undefined;
    
                for (let k = 0; k < this.parentArr[ind].length; k++) {
                    let ind2 = this.parentArr[ind][k];
                    this.childrenArr[ind2].remove(ind)
                }
                this.parentArr[ind] = undefined;
                this.shiftDep[ind] = undefined;
                this.shiftProp[ind] = undefined;
                //delete shift as we shift
            }
        }
        currPos(object) {
            if (this.find(object) == -1) return object
            if (object instanceof geo.Point) {
                let i = this.find(object);
                let dx = this.shiftArr[i][0];
                let dy = this.shiftArr[i][1];
                return new geo.Point(object.x + dx, object.y + dy);
            }
            else if (object instanceof geo.Line) {
                let p1 = this.currPos(object.pt1);
                let p2 = this.currPos(object.pt2);
                return new geo.Line(p1, p2);
            }
            else if (object instanceof geo.ExtLine) {
                let i = this.find(object);
                let p1 = this.currPos(object.point);
                let ds = this.shiftArr[i];
                return new geo.ExtLine(p1, object.slope + ds);
            }
            else if (object instanceof geo.Circle) {
                let i = this.find(object);
                let c = this.currPos(object.center);
                let dr = this.shiftArr[i];
                return new geo.Circle(c, object.radius + dr);
            }
            else if (object instanceof geo.Triangle){
                let p1 = this.currPos(object.pt1);
                let p2 = this.currPos(object.pt2);
                let p3 = this.currPos(object.pt3);
                return new geo.Triangle(p1, p2, p3);
            }
            else if (object instanceof geo.Polygon) {
                let newArr = [];
                for (let i = 0; i < object.pointsArr.length; i++) {
                    let p = this.currPos(object.pointsArr[i]);
                    newArr.push(i);
                }
                return new geo.Polygon(newArr);
            }
        }
        shift(object, dx = 0, dy = 0) {
            let i = this.find(object);
            //shifts itself if needed
            if (object instanceof geo.Point && this.shiftProp[i][i] != undefined) {
                t = this.shiftProp[i][i].transform(dx, dy, this);
                dx = t[0];
                dy = t[1];   
            }
            //selected points are anchor
            let seen = []
            shiftObjTemp(object, dx, dy, this, seen)
        }
    
        breakLine(point, line) {
            if (this.find(point) == -1) return
            if (!geo.onLine(point, line)) throw new Error("Point not on Line");
            if (geo.pointEqual(point, line.pt1) || geo.pointEqual(point, line.pt2)) return;
            //paritition

            this.append(point);
            this.append(line, false);
            let i1 = this.find(line);
            if (this.hasOverlap(line)) {
                for (let i = 0; i < this.overlap[i1].length; i++) {
                    let ind = this.overlap[i1][i];
                    let sub = this.objectArr[ind];
                    if (geo.onLine(point, sub)) {
                        return this.breakLine(point, sub)
                    }
                }
            }
            //break line;
            let l1 = new geo.Line(line.pt1, point);
            let l2 = new geo.Line(line.pt2, point);
            this.append(l1, false);
            this.append(l2, false);
            let i3 = this.find(l1);
            let i4 = this.find(l2);
            this.overlap[i1].push(i3, i4);
    
            this.parentArr[i3].push(i1);
            this.parentArr[i4].push(i1);
            this.childrenArr[i1].push(i3);
            this.childrenArr[i1].push(i4);
        }
    
        //geometry functions
        pointOnLine(point, line) {
            if (!geo.onLine(point, line)) throw new Error("Point is not on line");
            this.append(point);
            this.append(line);

            let ratio1; let ratio2;
            if (line.pt1.x < line.pt2.x) {
                ratio1 = geo.getDistance(new geo.Line(point, line.pt1));
                ratio2 = geo.getDistance(new geo.Line(point, line.pt2));
            }
            else {
                ratio1 = geo.getDistance(new geo.Line(point, line.pt2));
                ratio2 = geo.getDistance(new geo.Line(point, line.pt1));
            }
            this.partition(line, ratio1, ratio2);
    
            // let i1 = this.find(point);
            // let i2 = this.find(line);
            // let i3 = this.find(line.pt1);
            // let i4 = this.find(line.pt2);

            // this.shiftDep[i3].push(i1);
            // this.shiftDep[i4].push(i1);
            // this.shiftDep[i1].push(i1);
    
            // if (line.pt1.x < line.pt2.x) {
            //     let ratio1 = point.x - line.pt1.x;
            //     let ratio2 = line.pt2.x - point.x;
            //     this.shiftProp[i3][i1] = {transform: function(dx, dy, geo) {
            //         return shift.shiftPartition(line, ratio1, ratio2, geo, point);}};
            //     this.shiftProp[i4][i1] = {transform: function(dx, dy, geo) {
            //         return shift.shiftPartition(line, ratio1, ratio2, geo, point);}};
            // }
            // else {
            //     let ratio1 = line.pt1.x - point.x;
            //     let ratio2 = point.x - line.pt2.x;
            //     this.shiftProp[i3][i1] = {transform: function(dx, dy, geo) {
            //         return shift.shiftPartition(line, ratio2, ratio1, geo, point);}};
            //     this.shiftProp[i4][i1] = {transform: function(dx, dy, geo) {
            //         return shift.shiftPartition(line, ratio2, ratio1, geo, point);}};
            // }
            // this.shiftProp[i1][i1] = {transform: function(dx, dy, geo) {
            //     let t = shift.shiftAlongLine(point, line, dx, dy, geo);
            //     return [t[0], t[1]];
            // }}
            //this.breakLine(point,line)
        }
        pointOnCircle(point, circle) {
            if (!geo.onCircle(point, circle)) throw new Error("Point not on circle");
    
            this.append(point);
            this.append(circle);
    
            let i1 = this.find(point);
            let i2 = this.find(circle);
            let i3 = this.find(circle.center);
    
            this.parentArr[i1].push(i2);
            this.childrenArr[i2].push(i1);
    
            this.shiftDep[i2].push(i1);
            this.shiftDep[i1].push(i1);
            this.shiftDep[i3].push(i1);
    
            this.shiftProp[i3][i1] = {transform: function(dx, dy) {return [dx ,dy];}};
            this.shiftProp[i2][i1] = {transform: function(dx, dy, geo) {
                return shift.shiftRad(point, circle, dx, geo);
            }};
            this.shiftProp[i1][i1] = {transform: function(dx, dy, geo) {
                let t = shift.shiftAlongCircle(point, circle, dx, dy, geo);
                return [t[0], t[1]];
            }}

            
        }
        partition(line, ratio1, ratio2) {
            if (!(line instanceof geo.Line)) throw new Error("Input must be of type Line");
            //append
            let newPoint = geo.partition(line, ratio1, ratio2);
            this.append(line, false);
            this.append(newPoint, false);
    
            //index
            let i1 = this.find(newPoint);
            let i2 = this.find(line);
            let i3 = this.find(line.pt1);
            let i4 = this.find(line.pt2);
    
            //family relations
            this.parentArr[i1].push(i2);
            this.childrenArr[i2].push(i1);

    
            //shift relations
            this.shiftDep[i1].push(i3,i4);
            this.shiftDep[i3].push(i1);
            this.shiftDep[i4].push(i1);
    
            //shift factors
            this.shiftProp[i1][i3] = {transform: function(dx, dy) {return [dx, dy];}};
            this.shiftProp[i1][i4] = {transform: function(dx, dy) {return [dx, dy];}};
            if (line.pt1.x < line.pt2.x) {
                this.shiftProp[i3][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftPartition(line, ratio2, ratio1, geo, newPoint);}};
                this.shiftProp[i4][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftPartition(line, ratio1, ratio2, geo, newPoint);}};
            }
            else {
                this.shiftProp[i3][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftPartition(line, ratio1, ratio2, geo, newPoint);}};
                this.shiftProp[i4][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftPartition(line, ratio2, ratio1, geo, newPoint);}};
            }
            this.breakLine(newPoint, line);

            //shift; to match current position
            let t1 = this.shiftProp[i3][i1].transform(0, 0, this);
            this.shiftArr[i1][0] += t1[0]
            this.shiftArr[i1][1] += t1[1]

            return newPoint;
        }
        intersect(object1, object2) {
            //line intersect line
            let intersectP = geo.getIntersection(object1, object2);
            this.append(object1);
            this.append(object2);
            if ((object1 instanceof geo.Line || object1 instanceof geo.ExtLine) && 
                (object2 instanceof geo.Line || object2 instanceof geo.ExtLine)) {
                this.append(intersectP);
    
                let i1 = this.find(intersectP);
                let i2 = this.find(object1);
                let i3 = this.find(object2);
                //cases for lines/extlines
                let i4; let i5; let i6; let i7;
                if (object1 instanceof geo.Line) {
                    i4 = this.find(object1.pt1);
                    i5 = this.find(object1.pt2);
                }
                else i4 = this.find(object1.point);
                if (object2 instanceof geo.Line) {
                    i6 = this.find(object2.pt1);
                    i7 = this.find(object2.pt2);
                }
                else i6 = this.find(object2.point);
                
                //family
                this.parentArr[i1].push(i2,i3);
                this.childrenArr[i2].push(i1);
                this.childrenArr[i3].push(i1);
    
                //shift relationships
                this.shiftDep[i1].push(i4, i6);    
                this.shiftDep[i4].push(i1);
                this.shiftDep[i6].push(i1);    
                if (object1 instanceof geo.Line) {
                    this.shiftDep[i5].push(i1);
                    this.shiftDep[i1].push(i5);
                }
                else this.shiftDep[i2].push(i1);
                if (object2 instanceof geo.Line) {
                    this.shiftDep[i1].push(i7);  
                    this.shiftDep[i7].push(i1); 
                }
                else this.shiftDep[i3].push(i1);
    
                this.shiftProp[i1][i4] = {transform: function(dx, dy) {return [dx, dy];}};
                this.shiftProp[i1][i6] = {transform: function(dx, dy) {return [dx, dy];}};
                this.shiftProp[i4][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect(object1, object2, geo, intersectP);
                }}
                this.shiftProp[i6][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect(object1, object2, geo, intersectP);
                }}
                if (object1 instanceof geo.Line) {
                    this.shiftProp[i1][i5] = {transform: function(dx, dy) {return [dx, dy];}};
                    this.shiftProp[i5][i1] = {transform: function(dx, dy, geo) {
                        return shift.shiftIntersect(object1, object2, geo, intersectP);
                    }}
                }
                else this.shiftProp[i2][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect(object1, object2, geo, intersectP);
                }}
                if (object2 instanceof geo.Line) {
                    this.shiftProp[i1][i7] = {transform: function(dx, dy) {return [dx, dy];}};
                    this.shiftProp[i7][i1] = {transform: function(dx, dy, geo) {
                        return shift.shiftIntersect(object1, object2, geo, intersectP);
                    }}
                }
                else this.shiftProp[i3][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect(object1, object2, geo, intersectP);
                }}
                return intersectP;
                
            }
            //line intersect circle
            if ((object2 instanceof geo.Line || object2 instanceof geo.ExtLine) && 
                (object1 instanceof geo.Circle)) {
                    let temp = object1;
                    object1 = object2;
                    object2 = temp;
            }
            if ((object1 instanceof geo.Line || object1 instanceof geo.ExtLine) && 
                (object2 instanceof geo.Circle)) {
                this.append(intersectP[0]);
                this.append(intersectP[1]);
    
                let i1 = this.find(intersectP[0]);
                let i2 = this.find(intersectP[1]);
                let i3 = this.find(object1);
                let i4 = this.find(object2);
                let i5; let i6;
                if (object1 instanceof geo.Line) {
                    i5 = this.find(object1.pt1);
                    i6 = this.find(object1.pt2);
                }
                else {
                    i5 = this.find(object1.point);
                }
                let i7 = this.find(object2.center);
    
                //family
                this.parentArr[i1].push(i3, i4);
                this.parentArr[i2].push(i3, i4);
                this.childrenArr[i3].push(i1,i2);
                this.childrenArr[i4].push(i1,i2);
    
                //shift relationships
                this.shiftDep[i1].push(i2, i5, i7);
                this.shiftDep[i2].push(i1, i5, i7);
                this.shiftDep[i5].push(i1, i2);
                this.shiftDep[i7].push(i1, i2);
                this.shiftDep[i4].push(i1,i2);
                if (object1 instanceof geo.Line) {
                    this.shiftDep[i1].push(i6);
                    this.shiftDep[i2].push(i6);
                    this.shiftDep[i6].push(i1, i2);
                }
                else this.shiftDep[i3].push(i1,i2)
    
                this.shiftProp[i1][i2] = {transform: function(dx, dy) {return [dx, dy];}};
                this.shiftProp[i1][i5] = {transform: function(dx, dy) {return [dx, dy];}};
                this.shiftProp[i1][i7] = {transform: function(dx, dy) {return [dx, dy];}};
                this.shiftProp[i2][i1] = {transform: function(dx, dy) {return [dx, dy];}};
                this.shiftProp[i2][i5] = {transform: function(dx, dy) {return [dx, dy];}};
                this.shiftProp[i2][i7] = {transform: function(dx, dy) {return [dx, dy];}};
                this.shiftProp[i5][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect1(object1, object2, geo, intersectP[0])
                }}
                this.shiftProp[i5][i2] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect2(object1, object2, geo, intersectP[1])
                }}
                this.shiftProp[i7][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect1(object1, object2, geo, intersectP[0])
                }}
                this.shiftProp[i7][i2] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect2(object1, object2, geo, intersectP[1])
                }}
                this.shiftProp[i4][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect1(object1, object2, geo, intersectP[0])
                }}
                this.shiftProp[i4][i2] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect2(object1, object2, geo, intersectP[1])
                }}
                if (object1 instanceof geo.Line) {
                    this.shiftProp[i1][i6] = {transform: function(dx, dy) {return [dx, dy];}};
                    this.shiftProp[i2][i6] = {transform: function(dx, dy) {return [dx, dy];}};
                    this.shiftProp[i6][i1] = {transform: function(dx, dy, geo) {
                        return shift.shiftIntersect1(object1, object2, geo, intersectP[0])
                    }}
                    this.shiftProp[i6][i2] = {transform: function(dx, dy, geo) {
                        return shift.shiftIntersect2(object1, object2, geo, intersectP[1])
                    }}
                }
                else {
                    this.shiftProp[i3][i1] = {transform: function(dx, dy, geo) {
                        return shift.shiftIntersect1(object1, object2, geo, intersectP[0]);
                    }};
                    this.shiftProp[i3][i2] = {transform: function(dx, dy, geo) {
                        return shift.shiftIntersect2(object1, object2, geo, intersectP[1]);
                    }};
                }
            }
    
            if (object1 instanceof geo.Circle && object2 instanceof geo.Circle) {
                this.append(intersectP[0]);
                this.append(intersectP[1]);
    
                let i1 = this.find(intersectP[0]);
                let i2 = this.find(intersectP[1]);
                let i3 = this.find(object1);
                let i4 = this.find(object2);
                let i5 = this.find(object1.center);
                let i6 = this.find(object2.center);
    
                this.parentArr[i1].push(i3, i4);
                this.parentArr[i2].push(i3, i4);
                this.childrenArr[i3].push(i1,i2);
                this.childrenArr[i4].push(i1,i2);
    
                this.shiftDep[i1].push(i2, i5, i6);
                this.shiftDep[i2].push(i1, i5, i6);
                this.shiftDep[i5].push(i1, i2);
                this.shiftDep[i6].push(i1, i2);
                this.shiftDep[i3].push(i1, i2);
                this.shiftDep[i4].push(i1, i2);
    
                this.shiftProp[i1][i2] = {transform: function(dx, dy) {[dx, dy];}};
                this.shiftProp[i1][i5] = {transform: function(dx, dy) {[dx, dy];}};
                this.shiftProp[i1][i6] = {transform: function(dx, dy) {[dx, dy];}};
                this.shiftProp[i2][i2] = {transform: function(dx, dy) {[dx, dy];}};
                this.shiftProp[i2][i5] = {transform: function(dx, dy) {[dx, dy];}};
                this.shiftProp[i2][i6] = {transform: function(dx, dy) {[dx, dy];}};
                this.shiftProp[i5][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect1(object1, object2, geo, intersectP[0]);
                }}
                this.shiftProp[i5][i2] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect2(object1, object2, geo, intersectP[1]);
                }}
                this.shiftProp[i6][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect1(object1, object2, geo, intersectP[0]);
                }}
                this.shiftProp[i6][i2] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect2(object1, object2, geo, intersectP[1]);
                }}
                this.shiftProp[i3][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect1(object1, object2, geo, intersectP[0]);
                }}
                this.shiftProp[i3][i2] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect2(object1, object2, geo, intersectP[1]);
                }}
                this.shiftProp[i4][i1] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect1(object1, object2, geo, intersectP[0]);
                }}
                this.shiftProp[i4][i2] = {transform: function(dx, dy, geo) {
                    return shift.shiftIntersect2(object1, object2, geo, intersectP[1]);
                }}
            }
        }
        perpendicularLine(point, line) {
            if (!(point instanceof geo.Point)) throw new Error("Invalid Point");
            if (!(line instanceof geo.Line) && !(line instanceof geo.ExtLine))  {
                throw new Error("Invalid Line");
            }
            let pl = geo.getPerpendicularLine(point, line);
            if (!geo.isIntersected(pl, line)) {
                let ext = geo.lineToExtLine(line);
                this.append(ext);
                this.append(line);
                this.overlap[this.find(ext)].push(this.find(line))
                return this.perpendicularLine(point, geo.lineToExtLine(line));

            }
            this.append(line);
            this.append(point);
            this.append(pl);
    
            let i1 = this.find(point);
            let i2 = this.find(line);
            let i3 = this.find(pl);
            let i4 = this.find(pl.pt1);
            let i5; let i6;
            if (line instanceof geo.Line) {
                i5 = this.find(line.pt1);
                i6 = this.find(line.pt2);
            }
            else i5 = this.find(line.point);

    
            //family
            this.parentArr[i4].push(i2);
            this.parentArr[i3].push(i2);
            this.childrenArr[i1].push(i4);
            this.childrenArr[i2].push(i3); 
            this.childrenArr[i2].push(i4);
    
            //shift relationship
            this.shiftDep[i1].push(i4);
            this.shiftDep[i4].push(i1, i5);
            if (line instanceof geo.Line) {
                this.shiftDep[i4].push(i6);
                this.shiftDep[i6].push(i4);
            }
            this.shiftDep[i5].push(i4);

    
            //transformation function 
            this.shiftProp[i4][i1] = {transform: function(dx, dy) {return [dx, dy];}};
            this.shiftProp[i4][i5] = {transform: function(dx, dy) {return [dx, dy];}};
            this.shiftProp[i1][i4] = {transform: function(dx, dy, geo) {
                return shift.shiftPerpen(point, line, geo, pl.pt1);
            }};
            this.shiftProp[i5][i4] = {transform: function(dx, dy, geo) {
                return shift.shiftPerpen(point, line, geo, pl.pt1);
            }};

            if (line instanceof geo.Line) {
                this.shiftProp[i4][i6] = {transform: function(dx, dy) {return [dx, dy];}};
                this.shiftProp[i6][i4] = {transform: function(dx, dy, geo) {
                    return shift.shiftPerpen(point, line, geo, pl.pt1);
                }};
                this.breakLine(pl.pt1, line);
            }
        

        }
        median(point, line) {
            if (!(point instanceof geo.Point)) throw new Error("Invalid Point");
            if (!(line instanceof geo.Line)) throw new Error("Invalid Line");
            
            let m = geo.getMedian(point, line);
            this.append(point);
            this.append(line);
            this.append(m);
    
            let i1 = this.find(point);
            let i2 = this.find(line);
            let i3 = this.find(m);
            let i4 = this.find(m.pt1);
            let i5 = this.find(line.pt1);
            let i6 = this.find(line.pt2);
            
            //family relationship
            this.parentArr[i4].push(i2);
            this.childrenArr[i2].push(i3); 
            this.childrenArr[i2].push(i4); 
            
            //shift relationship
            this.shiftDep[i4].push(i1, i5, i6);
            this.shiftDep[i5].push(i4);
            this.shiftDep[i6].push(i4);
    
            //shift factors
            this.shiftProp[i4][i1] = {transform: function(dx, dy) {return [dx, dy];}};
            this.shiftProp[i4][i5] = {transform: function(dx, dy) {return [dx, dy];}};
            this.shiftProp[i4][i6] = {transform: function(dx, dy) {return [dx, dy];}};
            this.shiftProp[i5][i4] = {transform: function(dx, dy, geo) {
                return shift.shiftPartition(line, 1, 1, geo, m.pt1);}};
            this.shiftProp[i6][i4] = {transform: function(dx, dy, geo) {
                return shift.shiftPartition(line, 1, 1, geo, m.pt1);}};
            this.breakLine(m.pt1, line);
            return m;
        }
        //rays must shift
        angleBisector(line1, line2) {
            if (!(line1 instanceof geo.Line && line2 instanceof geo.Line)) {
                throw new Error("Invalid lines");
            }
            let intersection = geo.getIntersection(line1, line2);
            let ab = geo.getAngleBisector(intersection, line1, line2);
            this.append(line1);
            this.append(line2);
            this.append(ab);
    
            let i1 = this.find(line1);
            let i2 = this.find(line2);
            let i3 = this.find(ab);
            let i4 = this.find(intersection);
            let i5; let i6;
            if (geo.pointEqual(line1.pt1, intersection)) i5 = this.find(line1.pt2); 
            else i5 = this.find(line1.pt1);
            if (geo.pointEqual(line2.pt1, intersection)) i6 = this.find(line2.pt2); 
            else i6 = this.find(line2.pt1);
    
    
            this.parentArr[i3].push(i1,i2);
            this.parentArr[i4].push(i1,i2);
            this.childrenArr[i1].push(i3);
            this.childrenArr[i2].push(i3); 
    
            this.shiftDep[i4].push(i5, i6);
            this.shiftDep[i5].push(i3); 
            this.shiftDep[i6].push(i3); 
    
            this.shiftProp[i4][i5] = {transform: function(dx, dy) {return [dx, dy];}};
            this.shiftProp[i4][i6] = {transform: function(dx, dy) {return [dx, dy];}};
            this.shiftProp[i5][i3] = {transform: function(dx, dy, geo) {
                return shift.shiftAngleB(line1, line2, intersection, geo, ab);
            }};
            this.shiftProp[i6][i3] = {transform: function(dx, dy, geo) {
                return shift.shiftAngleB(line1, line2, intersection, geo, ab);
            }};
    
        }
        diameter(point, circle) {
            if (!(point instanceof geo.Point && circle instanceof geo.Circle)) {
                throw new Error("Invalid inputs");
            }
            let d = geo.getDiameter(point, circle);
            this.append(point);
            this.append(circle);
            this.append(d);
    
            let i1 = this.find(circle);
            let i2 = this.find(d);
            let i3 = this.find(d.pt2);
            let i4 = this.find(point);
            let i5 = this.find(circle.center);
    
            this.parentArr[i2].push(i1);
            this.childrenArr[i4].push(i3);
            this.childrenArr[i1].push(i2);
    
            this.shiftDep[i3].push(i4, i3);
            this.shiftDep[i4].push(i3, i4);
            this.shiftDep[i5].push(i3, i4);
            this.shiftDep[i1].push(i4, i3);
    
            this.shiftProp[i3][i3] = {transform: function(dx, dy, geo) {
                return shift.shiftAlongCircle(point, circle, dx, dy, geo);
            }}
            this.shiftProp[i4][i4] = {transform: function(dx, dy, geo) {
                return shift.shiftAlongCircle(point, circle, dx, dy, geo);
            }}
            this.shiftProp[i3][i4] = {transform: function(dx, dy) {return [-1 * dx, -1 * dy];}};
            this.shiftProp[i4][i3] = {transform: function(dx, dy) {return [-1 * dx, -1 * dy];}};
            this.shiftProp[i5][i3] = {transform: function(dx, dy) {return [dx, dy];}};
            this.shiftProp[i5][i4] = {transform: function(dx, dy) {return [dx, dy];}};
            this.shiftProp[i1][i4] = {transform: function(dx, dy, geo) {
                return shift.shiftRad(point, circle, dx, geo)
            }}
            this.shiftProp[i1][i3] = {transform: function(dx, dy, geo) {
                return shift.shiftRad(d.pt2, circle, dx, geo)
            }}
    
            this.breakLine(circle.center, d);
        }
        tangent(point, circle) {
            if (!(point instanceof geo.Point && circle instanceof geo.Circle)) {
                throw new Error("Invalid inputs");
            }
            let t = geo.getTangent(point, circle);
            this.append(point);
            this.append(circle);
            this.append(t);
    
            let i1 = this.find(circle);
            let i2 = this.find(t);
            let i3 = this.find(point);
            let i4 = this.find(circle.center);
    
            this.parentArr[i2].push(i1);
            this.childrenArr[i1].push(i2);
    
            this.shiftDep[i3].push(i2,i3);
            this.shiftDep[i4].push(i3);
            this.shiftDep[i1].push(i3);
    
            this.shiftProp[i3][i3] = {transform: function(dx, dy, geo) {
                return shift.shiftAlongCircle(point, circle, dx, dy, geo);
            }}
            this.shiftProp[i4][i3] = {transform: function(dx, dy, geo) {return [dx, dy];}};
            this.shiftProp[i3][i2] = {transform: function(dx, dy, geo) {
                return shift.shiftTan(point, circle, geo);
            }};
            this.shiftProp[i1][i3] = {transform: function(dx, dy, geo) {
                return shift.shiftRad(point, circle, dx, geo)
            }};
    
        }
        reflect(object, reflectLine) {
            let reflectedObj = geo.reflect(object, reflectLine);
            this.append(object, false);
            this.append(reflectLine, false);
            this.append(reflectedObj, false);
    
            let i1 = this.find(object);
            let i2 = this.find(reflectLine);
            let i3 = this.find(reflectedObj);
    
            //shift
            //need to add shift for reflectline
            let ptsArr = geo.getPoints(object);
            let ptsArrRef = geo.getPoints(reflectedObj);
            let ind1; let ind2;
            if (reflectLine instanceof geo.ExtLine) {
                ind1 = this.find(reflectLine.point);
            }
            else {
                ind1 = this.find(reflectLine.pt1);
                ind2 = this.find(reflectLine.pt2);
            }
            for (let i = 0; i < ptsArr.length; i++) {
                let ind = this.find(ptsArr[i]);
                let indR = this.find(ptsArrRef[i]);
                this.shiftDep[ind].push(indR);
                this.shiftDep[indR].push(ind);
                this.shiftDep[ind1].push(indR);
                if (!reflectLine instanceof geo.ExtLine) {
                    this.shiftDep[ind2].push(ind, indR);
                }
            }
    
            for (let i = 0; i < ptsArr.length; i++) {
                let ind = this.find(ptsArr[i]);
                let indR = this.find(ptsArrRef[i]);
                let obj1 = this.objectArr[ind];
                let obj2 = this.objectArr[indR];
                this.shiftProp[ind][indR] = {transform: function(dx, dy, geo) {
                    return shift.shiftReflect(obj1, reflectLine, geo, obj2);
                }}
                this.shiftProp[ind1][indR] = {transform: function(dx, dy, geo) {
                    return shift.shiftReflect(obj1, reflectLine, geo, obj2);
                }}
                if (!reflectLine instanceof geo.ExtLine) {
                    this.shiftProp[ind2][indR] = {transform: function(dx, dy, geo) {
                        return shift.shiftReflect(obj1, reflectLine, geo, obj2);
                    }}
                }
            }
        }
        rotate(object, rotatePoint, angle) {
            let rotatedObj = geo.rotate(object, rotatePoint, angle);
            this.append(object, false);
            this.append(rotatePoint, false);
            this.append(rotatedObj, false);
    
            let i1 = this.find(object);
            let i2 = this.find(rotatePoint);
            let i3 = this.find(rotatedObj);
    
    
            let ptsArr = geo.getPoints(object);
            let ptsArrRef = geo.getPoints(rotatedObj);
            for (let i = 0; i < ptsArr.length; i++) {
                let ind = this.find(ptsArr[i]);
                let indR = this.find(ptsArrRef[i]);
                this.shiftDep[ind].push(indR);
                this.shiftDep[indR].push(ind);
                this.shiftDep[i2].push(indR);
            }
            for (let i = 0; i < ptsArr.length; i++) {
                let ind = this.find(ptsArr[i]);
                let indR = this.find(ptsArrRef[i]);
                let obj1 = this.objectArr[ind];
                let obj2 = this.objectArr[indR];
                this.shiftProp[ind][indR] = {transform: function(dx, dy, geo) {
                    return shift.shiftRotate(obj1, rotatePoint, angle, geo, obj2);
                }}
                this.shiftProp[indR][ind] = {transform: function(dx, dy, geo) {
                    return shift.shiftRotate(obj2, rotatePoint, -1 * angle, geo, obj1);
                }}
                this.shiftProp[i2][indR] = {transform: function(dx, dy, geo) {
                    return shift.shiftRotate(obj1, rotatePoint, angle, geo, obj2);
                }}
            }
            return rotatedObj;
        }
    
        translate(object, dx, dy) {
            let translatedObj = geo.translate(object, dx, dy);
            this.append(translatedObj, false);
            this.append(object, false);
    
            let ptsArr = geo.getPoints(object);
            let ptsArrTrans = geo.getPoints(translatedObj);
            for (let i = 0; i < ptsArr.length; i++) {
                let ind = this.find(ptsArr[i]);
                let indT = this.find(ptsArrTrans[i]);
                this.shiftDep[ind].push(indT);
                this.shiftDep[indT].push(ind);
            }
            for (let i = 0; i < ptsArr.length; i++) {
                let ind = this.find(ptsArr[i]);
                let indT = this.find(ptsArrTrans[i]);
                let obj1 = this.objectArr[ind];
                let obj2 = this.objectArr[indT];
                this.shiftProp[ind][indT] = {transform: function(dxx, dyy, geo) {
                    return shift.shiftTranslate(obj1, dx, dy, geo, obj2);
                }};
                this.shiftProp[indT][ind] = {transform: function(dxx, dyy, geo) {
                    return shift.shiftTranslate(obj2, -1 * dx, -1 * dy, geo, obj1);
                }};
            }
            return translatedObj;
        }
        dilate(object, refPoint, scaleFactor) {
            let dilatedObj = geo.dilate(object, refPoint, scaleFactor);
            this.append(object, false);
            this.append(refPoint, false);
            this.append(dilatedObj, false);
    
            let i1 = this.find(object);
            let i2 = this.find(refPoint);
            let i3 = this.find(dilatedObj);
    
            let ptsArr = geo.getPoints(object);
            let ptsArrDil = geo.getPoints(dilatedObj);
            for (let i = 0; i < ptsArr.length; i++) {
                let ind = this.find(ptsArr[i]);
                let indD = this.find(ptsArrDil[i]);
                this.shiftDep[ind].push(indD);
                this.shiftDep[indD].push(ind);
                this.shiftDep[i2].push(indD);
            }
            for (let i = 0; i < ptsArr.length; i++) {
                let ind = this.find(ptsArr[i]);
                let indD = this.find(ptsArrDil[i]);
                let obj1 = this.objectArr[ind];
                let obj2 = this.objectArr[indD];
                this.shiftProp[ind][indD] = {transform: function(dxx, dyy, geo) {
                    return shift.shiftDilate(obj1, refPoint, scaleFactor, geo, obj2);
                }};
                this.shiftProp[indD][ind] = {transform: function(dxx, dyy, geo) {
                    return shift.shiftDilate(obj2, refPoint, 1 / scaleFactor, geo, obj1);
                }};
                this.shiftProp[i2][indD] = {transform: function(dxx, dyy, geo) {
                    return shift.shiftDilate(obj1, refPoint, scaleFactor, geo, obj2);
                }};
            }
            return dilatedObj
        }
    }
    class Preview {
        constructor() {
            //follows mouse
            this.view = new Array();
            //highlight when mouse is hovering
            this.viewSelect = new Array()
            //highlight when mouse is over object in sidebar
            this.currSelect;
            //composition select
            this.compose = new Array();

        }
    }
    //export
    return {
        Geometry: Geometry,
        Preview: Preview
    }
})()
