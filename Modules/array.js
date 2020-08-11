//new array prototypes

Array.prototype.copy = function() {
    let newArr = new Array();
    for (let i = 0; i < this.length; i++) {
        newArr[i] = this[i];
    }
    return newArr;
}
Array.prototype.remove = function(elem) {
    for (var i = 0; i < this.length; i++) {
        let cmp = this[i]
        if (elem instanceof geo.Point && cmp instanceof geo.Point && 
            geo.pointEqual(elem, cmp)) break;
        else if ((elem instanceof geo.Line || elem instanceof geo.ExtLine) &&
                 (cmp instanceof geo.Line || cmp instanceof geo.ExtLine) &&
                  geo.lineEqual(elem, cmp)) break;
        else if (elem instanceof geo.Circle && cmp instanceof geo.Circle && 
            geo.circleEqual(elem, cmp)) break;
        else if (elem instanceof geo.Triangle && cmp instanceof geo.Triangle &&
            geo.polygonEqual(elem, cmp)) break;
        else if (elem instanceof geo.Polygon && cmp instanceof geo.Polygon &&
            geo.polygonEqual(elem, cmp)) break;
        else if (cmp == elem) break;
    }
    if (i < this.length) this.splice(i, 1);
}
Array.prototype.sum = function() {
    let sum = 0;
    for (let i = 0; i < this.length; i++) {
        sum += this[i];
    }
    return sum;
}
Array.prototype.contains = function(obj) {
    for (let i = 0; i < this.length; i++) {
        if (obj instanceof geo.Point && this[i] instanceof geo.Point && geo.pointEqual(obj, this[i])) {
            return true
        }
        else if (obj instanceof geo.Line && this[i] instanceof geo.Line && geo.lineEqual(obj, this[i])) {
            return true
        }
        else if (obj instanceof geo.ExtLine && this[i] instanceof geo.ExtLine && geo.lineEqual(obj, this[i])) {
            return true
        }
        else if (obj instanceof geo.Circle && this[i] instanceof geo.Circle && geo.circleEqual(obj, this[i])) {
            return true;
        }
        else if (obj instanceof geo.Triangle && this[i] instanceof geo.Triangle && geo.polygonEqual(obj, this[i])) {
            return true;
        }
        else if (obj instanceof geo.Polygon && this[i] instanceof geo.Polygon && geo.polygonEqual(obj, this[i])) {
            return true;
        }
    }
    return false;

}
Array.prototype.index = function(obj) {
    for (let i = 0; i < this.length; i++) {
        if (obj instanceof geo.Point && this[i] instanceof geo.Point && geo.pointEqual(obj, this[i])) {
            return i
        }
        else if (obj instanceof geo.Line && this[i] instanceof geo.Line && geo.lineEqual(obj, this[i])) {
            return i
        }
        else if (obj instanceof geo.ExtLine && this[i] instanceof geo.ExtLine && geo.lineEqual(obj, this[i])) {
            return i
        }
        else if (obj instanceof geo.Circle && this[i] instanceof geo.Circle && geo.circleEqual(obj, this[i])) {
            return i;
        }
        else if (obj instanceof geo.Triangle && this[i] instanceof geo.Triangle && geo.polygonEqual(obj, this[i])) {
            return i;
        }
        else if (obj instanceof geo.Polygon && this[i] instanceof geo.Polygon && geo.polygonEqual(obj, this[i])) {
            return i;
        }
    }
    return -1;
}
Number.prototype.radians = function() {
    return this * Math.PI / 180
}

function almostEqual(x,y) {
    return (Math.abs(x - y) <= .000001);
}
