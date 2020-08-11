//draws geometric object
//strictly deals with canvas elements
//All geometric objects are already shifted or updated
var draw = (function() {
    var c = document.getElementById("geoCanvas");
    var canv = c.getContext("2d");
    canv.scale(2,2)

    //draws point
    function drawPoint(point, size = 6) {
        //inits color
         //black -> unselected
        let color = "black";
        //yellow -> selected by hovering or clicking
        if (init.geoCanvas().selected.includes(point) ||
            init.preview().viewSelect.includes(point)) {color = "#FFB833";}
        //red -> selected from sidebar
        let specialPoint = init.preview().currSelect;
        if (specialPoint instanceof geo.Point && geo.pointEqual(point, specialPoint)) {
            color = "#FF5233";
        }
        //draws
        let currPoint = init.geoCanvas().currPos(point)
        canv.beginPath();
        canv.arc(currPoint.x, currPoint.y, size, 0, 2 * Math.PI);
        canv.fillStyle = color
        canv.fill();
        canv.closePath()
        if (point.showAngle.length > 0) drawAngle(point);

    }
    function drawLine(line, width = 4, color = "black") {
        if (init.geoCanvas().selected.contains(line) && 
            init.geoCanvas().hasOverlap(line)) {
                width = 7;
            }
        let pt1 = line.pt1;
        let pt2 = line.pt2;
        //sidebar select setup
        let specialLine = init.preview().currSelect;
        //compose select
        if (init.preview().compose.includes(line)) color = "green";
        //sidebar select
        else if (specialLine instanceof geo.Line && geo.lineEqual(line, specialLine)) {
            color = "#FF5233";
        }
        //hover select / normal select
        else if (init.geoCanvas().selected.contains(line) || 
                 init.preview().viewSelect.contains(line)) {
                     width = 7;
                     color = "#FFB833";
                 }
        //no selection
        pt1 = init.geoCanvas().currPos(pt1);
        pt2 = init.geoCanvas().currPos(pt2);
        canv.beginPath();
        canv.moveTo(pt1.x, pt1.y);
        canv.lineTo(pt2.x, pt2.y);
        canv.lineWidth = width;
        canv.strokeStyle = color;
        canv.stroke();
        canv.closePath()

        if (line.showDistance) drawLength(line);
    }
    function drawExtLine(line, width = 4, color = "black") {
        let specialLine = init.preview().currSelect;
        //hover select / normal select
        if (specialLine instanceof geo.ExtLine && geo.lineEqual(line, specialLine)) {
            color = "#FF5233";
        }
        else if (init.geoCanvas().selected.contains(line) || 
            init.preview().viewSelect.contains(line)) {
                color = "#FFB833";
                width = 7
        }
        let point = line.point;
        let slope = line.slope;
        let anchor1 = [-1, (-1 - point.x) * slope + point.y];
        let anchor2 = [1000, (1000 - point.x) * slope + point.y];
        canv.beginPath();
        canv.moveTo(anchor1[0], anchor1[1]);
        canv.lineTo(anchor2[0], anchor2[1]);
        canv.lineWidth = width;
        canv.strokeStyle = color;
        canv.stroke();
        canv.closePath()
    }
    function drawCircle(circle, width = 4) {
        let radius = circle.radius
        let center = circle.center;
        if (init.geoCanvas().selected.contains(circle) || 
        init.preview().viewSelect.contains(circle)) {
            color = "#FFB833";
            width = 7
        }
        else color = "black"
        //draws
        canv.beginPath();
        canv.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        canv.strokeStyle = color;
        canv.lineWidth = width
        canv.stroke()
        canv.closePath()
        if (circle.showCircumference) drawPerimeter(circle);
        if (circle.showArea) drawArea(circle);
    }

    function drawPolygon(polygon, view = false) {
        let linesArr = geo.getLines(polygon);
        for (let i = 0; i < linesArr.length; i++) {
            let line = linesArr[i];
            let specialObj = init.preview().currSelect;
            if ((specialObj instanceof geo.Triangle || specialObj instanceof geo.Polygon) &&
                geo.polygonEqual(specialObj, polygon)) {
                drawLine(line, 4, "#FF5233");
            }
            else if (init.geoCanvas().selected.contains(polygon)) {
                drawLine(line, 7, "#FFB833");
            }
            else if (view) {
                drawLine(line);
            }
        }
        if (polygon.showPerimeter) drawPerimeter(polygon)
        if (polygon.showArea) drawArea(polygon);
    }
    function drawLength(line) {
        let length = geo.getDistance(line);
        //round to 2 decimal places
        length = length.toFixed(2);
        let cx = (line.pt1.x + line.pt2.x) / 2;
        let cy = (line.pt1.y + line.pt2.y) / 2;
        canv.font = "24px Ariel"
        canv.fillStyle = "#FF7133";
        canv.fillText(length, cx, cy);
    }
    function drawAngle(point) {
        let l1 = point.showAngle[0];
        let l2 = point.showAngle[1];
        let angle = geo.getAngle(point, l1, l2);

        //arc
        let refLine = new geo.Line(point, new geo.Point(point.x + 1, point.y));
        //slope looks mirrored on canvas
        let slope1 = geo.getSlope(l1);
        let slope2 = geo.getSlope(l2);
        let initAngle;
        let dAngle = angle.radians()
        let ccw = true

        //checks that l1 is between angles [0, 180)
        let l1Positive = (l1.pt1.y - point.y) + (l1.pt2.y - point.y) < 0 || (
            almostEqual((l1.pt1.y - point.y) + (l1.pt2.y - point.y), 0) && 
            (l1.pt1.x - point.x) + (l1.pt2.x - point.x) > 0);
        //checks that l2 is between angles [180, 360)
        let l2Positive = (l2.pt1.y - point.y) + (l2.pt2.y - point.y) < 0 || (
            almostEqual((l2.pt1.y - point.y) + (l2.pt2.y - point.y), 0) && 
            (l2.pt1.x - point.x) + (l2.pt2.x - point.x) < 0);
        if ((slope1 > 0 && slope2 < 0) || (slope1 < 0 && slope2 < 0 && slope1 < slope2) || 
                slope1 == Infinity || slope2 == Infinity) {
            initAngle = geo.getAngle(point, refLine, l1).radians();
            if (!l1Positive) initAngle *= -1
        }
        else {
            initAngle = geo.getAngle(point, refLine, l2).radians();
            if (!l2Positive) initAngle *= -1
        }
        //l1Positive xor l1Positive
        if ((l1Positive && l2Positive) || (!l1Positive && !l2Positive)) {
            ccw = false
            dAngle *= -1
        }
        //draws arc
        let r = 40
        canv.beginPath();
        canv.arc(point.x, point.y, r, -1 * initAngle, -1 * (initAngle + dAngle), ccw);
        canv.strokeStyle = "black";
        canv.lineWidth = 5
        canv.stroke()
        canv.closePath()

        //display angle
        //round to 2 decimal places
        let dx = r * Math.cos((initAngle + angle/2).radians());
        let dy = r * Math.sin((initAngle + angle/2).radians());
        displayAngle = angle.toFixed(2);
        canv.font = "24px Ariel"
        canv.fillStyle = "#FF7133";
        canv.fillText(displayAngle, point.x + dx,point.y + dy);
    }
    function drawPerimeter(polygon) {
        let perimeter = geo.getPerimeter(polygon);
        perimeter = perimeter.toFixed(2);
        let cx = 0; let cy = 0;
        if (polygon instanceof geo.Circle) {
            cx = polygon.center.x
            cy = polygon.center.y
        }
        else {
            let pointsArr = geo.getPoints(polygon)
            for (let i = 0; i < pointsArr.length; i++) {
                let point = pointsArr[i];
                cx += point.x;
                cy += point.y;
            }
            cx /= pointsArr.length;
            cy /= pointsArr.length;
        }
        canv.font = "24px Ariel";
        canv.fillStyle = "#FF7133";
        canv.fillText(perimeter, cx, cy);
    }
    function drawArea(polygon) {
        let area = geo.getArea(polygon);
        area = area.toFixed(2);
        let cx = 0; let cy = 0;
        if (polygon instanceof geo.Circle) {
            cx = polygon.center.x
            cy = polygon.center.y
        }
        else {
            let pointsArr = geo.getPoints(polygon)
            for (let i = 0; i < pointsArr.length; i++) {
                let point = pointsArr[i];
                cx += point.x;
                cy += point.y;
            }
            cx /= pointsArr.length;
            cy /= pointsArr.length;
        }
        canv.font = "24px Ariel";
        canv.fillStyle = "#FF7133";
        canv.fillText(area, cx, cy);

    }
    function drawObjects() {
        //draws fix objects
        for (let i = 0; i < init.geoCanvas().display.length; i++) {
            let object = init.geoCanvas().display[i];
            if (object instanceof geo.Point) {
                drawPoint(object);
            }
            else if (object instanceof geo.Line) {
                drawLine(object);
            }
            else if (object instanceof geo.ExtLine) {
                drawExtLine(object);
            }
            else if (object instanceof geo.Circle) {
                drawCircle(object);
            }
            else if (object instanceof geo.Triangle || object instanceof geo.Polygon) {
                drawPolygon(object);
            }
        }
    }
    function animate() {
        canv.clearRect(0, 0, 2 * c.clientWidth, 2 * c.clientHeight);
        let specialselect = init.preview().currSelect
        let external = [specialselect];

        drawObjects();
        //draws preview objects
        for (let i = 0; i < init.preview().view.length; i++) {
            let object = init.preview().view[i];
            if (object instanceof geo.Point) {
                drawPoint(object, 4);
            }
            else if (object instanceof geo.Line) {
                drawLine(object, 2)
            }
            else if (object instanceof geo.ExtLine) {
                drawExtLine(object);
            }
            else if (object instanceof geo.Circle) {
                drawCircle(object);
            }
            else if (object instanceof geo.Triangle || object instanceof geo.Polygon) {
                drawPolygon(object, true);
            }
        }

        for (let i = 0; i < external.length; i++) {
            let object = external[i];
            if (object instanceof geo.Line) drawLine(object)
            else if (object instanceof geo.ExtLine) drawExtLine(object)
        }

        window.requestAnimationFrame(draw.animate)
    }
    return {
        animate: () => animate()
    }
})()
window.requestAnimationFrame(draw.animate)
