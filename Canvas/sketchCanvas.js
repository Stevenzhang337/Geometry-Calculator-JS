//adds function to the whole web
//connects the buttons to the canvas and sidebar 
var canvas = (function() {
    function initEvent() {
        let canv = document.getElementById("geoCanvas");
        let initX = canv.getBoundingClientRect().left
        let initY = canv.getBoundingClientRect().top
        //shift functions
        let allowShift = false;
        let moved = false
        //click on canvas functions
        canv.addEventListener("click", function(event) {
            //allowShift = false
            //if (moved) {
            //    moved = false
            //    return
            //}
            switch(toolbar.currActive()) {
                case "Select":
                    //find the nearest object to event
                    let obj = init.preview().viewSelect[0];
                    //add to composition/add to selection
                    if (event.shiftKey) shiftClick.appendShift(obj)
                    else select.selectObject(obj);
                    init.preview().viewSelect.shift()
                    //show on sidebar
                    sidebar.showSelection();
                    break;
                case "Point":
                    //add function to create on Line
                    let p = init.preview().view[0];
                    init.geoCanvas().append(p, false);
                    break;
                case "Partition":
                    //finds line
                    let objPart = init.preview().viewSelect[0];
                    if (objPart instanceof geo.Line && event.shiftKey) shiftClick.appendShift(objPart)
                    else if (objPart instanceof geo.Line) {
                        //activate modal for partition
                        modal.initModal(toolbar.currActive(), objPart);
                        $("#input").modal();
                    }
                    break;
                case "Line":
                    //initialize the first endpoint of new line
                    if (init.preview().view.length == 1) {
                        let selObj = init.preview().view[0];
                        init.preview().view = [selObj, selObj];
                    }
                    //initialize the second endpoint and the line
                    else if (init.preview().view.length == 3) {
                        let newObjs = init.preview().view
                        if (geo.pointEqual(newObjs[0], newObjs[1])) return;
                        let newLine = new geo.Line(newObjs[0], newObjs[1]);
                        init.geoCanvas().append(newLine);
                        init.preview().view = [];
                    }
                    sidebar.showSelection()
                    break;
                case "Extended Line":
                    //initialize the first endpoint of new line
                    if (init.preview().view.length == 1) {
                        let selObjEL = init.preview().view[0];
                        init.preview().view = [selObjEL, selObjEL];
                    }
                    //initialize the second endpoint and the line
                    else if (init.preview().view.length == 3) {
                        let newObjsEL = init.preview().view
                        if (geo.pointEqual(newObjsEL[0], newObjsEL[1])) return;
                        let slope = (newObjsEL[1].y - newObjsEL[0].y) / (newObjsEL[1].x - newObjsEL[0].x)
                        let newELine = new geo.ExtLine(newObjsEL[0], slope);
                        init.geoCanvas().append(newELine);
                        init.preview().view = [];
                        }
                    sidebar.showSelection()
                    break;
                case "Perpendicular Line":
                    if (init.preview().viewSelect.length == 1) {
                        let perObj = init.preview().viewSelect[0];
                        init.preview().viewSelect = [perObj, undefined];
                    } 
                    else if (init.preview().viewSelect.length == 2) {
                        let p = init.preview().viewSelect[0];
                        let l = init.preview().viewSelect[1];
                        if (l == undefined) return;
                        init.geoCanvas().perpendicularLine(p, l);
                        init.preview().viewSelect = []
                    }
                    break;
                case "Median":
                    if (init.preview().viewSelect.length == 1) {
                        let perObj = init.preview().viewSelect[0];
                        init.preview().viewSelect = [perObj, undefined];
                    } 
                    else if (init.preview().viewSelect.length == 2) {
                        let p = init.preview().viewSelect[0];
                        let l = init.preview().viewSelect[1];
                        if (l == undefined) return;
                        init.geoCanvas().median(p, l);
                        init.preview().viewSelect = []
                    }
                    break;
                case "Angle Bisector":
                    if (init.preview().viewSelect.length == 1) {
                        let angBLine = init.preview().viewSelect[0];
                        init.preview().viewSelect = [angBLine, undefined];
                    }
                    else if (init.preview().viewSelect.length == 2) {
                        let angBLine1 = init.preview().viewSelect[0];
                        let angBLine2 = init.preview().viewSelect[1];
                        if (angBLine2 == undefined) return;
                        init.geoCanvas().angleBisector(angBLine1, angBLine2);
                        init.preview().viewSelect = []
                    }
                    break;
                case "Tangent":
                    if (init.preview().viewSelect.length == 1) {
                        let circle = init.preview().viewSelect[0];
                        init.preview().viewSelect = [circle, undefined];
                    }
                    else if (init.preview().viewSelect.length == 2) {
                        let circle = init.preview().viewSelect[0];
                        let point = init.preview().viewSelect[1];
                        if (point == undefined) point = init.preview().view[0]
                        init.geoCanvas().tangent(point, circle)
                        init.preview().viewSelect = []
                        init.preview().view = []

                    }
                    break;
                case "Diameter":
                    if (init.preview().viewSelect.length == 1) {
                        let circle = init.preview().viewSelect[0];
                        init.preview().viewSelect = [circle, undefined];
                    }
                    else if (init.preview().viewSelect.length == 2) {
                        let circle = init.preview().viewSelect[0];
                        let point = init.preview().viewSelect[1];
                        if (point == undefined) point = init.preview().view[0]
                        init.geoCanvas().diameter(point, circle)
                        init.preview().viewSelect = []
                        init.preview().view = []
                    }
                    break;
                case "Circle":
                    if (init.preview().view.length == 1) {
                        let center = init.preview().view[0];
                        let circle = new geo.Circle(center, 0);
                        init.preview().view = [center, circle];
                    }
                    else {
                        let circle = init.preview().view[1];
                        if (circle.radius > 0) init.geoCanvas().append(circle);
                        init.preview().view = []
                    }
                    break;
                case "Exact Line":
                case "Exact Angle":
                    //initialize the first endpoint of new line
                    if (init.preview().view.length == 1) {
                        let selObj = init.preview().view[0];
                        init.preview().view = [selObj, selObj];
                    }
                    //initialize the second endpoint and the line
                    else if (init.preview().view.length == 3) {
                        let newObjs = init.preview().view.copy()
                        if (geo.pointEqual(newObjs[0], newObjs[1])) return;
                        modal.initModal(toolbar.currActive(), newObjs[2]);
                        $("#input").modal();
                    }
                    break;
                case "Regular Polygon":
                    if (init.preview().view.length == 0) return
                    let regPoly = init.preview().view[0];
                    init.geoCanvas().append(regPoly);
                    init.preview().viewSelect = [];
                    break;
                case "Triangle":
                    if (init.preview().view.length == 0) return
                    let tri = init.preview().view[0];
                    init.geoCanvas().append(tri);
                    init.preview().viewSelect = []
                    break;
                case "Distance":
                    if (init.preview().viewSelect.length == 0) return

                    let disLine = init.preview().viewSelect[0];
                    disLine.showDistance = !disLine.showDistance;
                    break;
                case "Angle":
                    if (init.preview().viewSelect.length == 1) {
                        let angLine1 = init.preview().viewSelect[0];
                        if (angLine1 instanceof geo.Point) angLine1.showAngle = false;
                        else {
                            init.preview().viewSelect = [angLine1, undefined];
                        }
                    }
                    else if (init.preview().viewSelect.length > 1) {
                        let angL1 = init.preview().viewSelect[0];
                        let angL2 = init.preview().viewSelect[1];
                        if (angL2 instanceof geo.Point) angL2.showAngle = false;
                        else {
                            if (geo.isIntersected(angL1, angL2)) {
                                let commonPoint;
                                //finds common point, has to be same point (cant use getintersection)
                                if (geo.pointEqual(angL1.pt1, angL2.pt1) || geo.pointEqual(angL1.pt1, angL2.pt2)) {
                                    commonPoint = angL1.pt1;
                                }
                                else commonPoint = angL1.pt2;
                                commonPoint.showAngle = init.preview().viewSelect.copy();
                            }
                            init.preview().viewSelect = [];  
                        }
                    }
                    break;
                case "Perimeter":
                    let perObj = init.preview().viewSelect[0];
                    if (perObj instanceof geo.Line && event.shiftKey) {
                        shiftClick.appendShift(perObj)
                    }
                    else if (perObj instanceof geo.Circle) {
                        perObj.showCircumference = true;
                    }
                    break;
                case "Area":
                    let areaObj = init.preview().viewSelect[0];
                    if (areaObj instanceof geo.Line && event.shiftKey) {
                        shiftClick.appendShift(areaObj)
                    }
                    else if (areaObj instanceof geo.Circle) {
                        areaObj.showArea = true;
                    }
                    break;
                case "Reflect":
                    if (init.preview().viewSelect.length == 1) {
                        let reflObj = init.preview().viewSelect[0];
                        init.preview().viewSelect = [reflObj, undefined]
                    }
                    else if (init.preview().viewSelect.length > 1 && event.shiftKey) {
                        let reflObj = init.preview().viewSelect[1];
                        shiftClick.appendShift(reflObj)
                    }
                    else {
                        let reflectLine = init.preview().viewSelect[0];
                        let reflObject = init.preview().viewSelect[1];
                        init.geoCanvas().reflect(reflObject, reflectLine)
                        init.preview().viewSelect = []
                    }
                    break
                case "Rotate":
                    if (init.preview().viewSelect.length == 1) {
                        let rotObj = init.preview().viewSelect[0];
                        init.preview().viewSelect = [rotObj, undefined]
                    }
                    else if (init.preview().viewSelect.length > 1 && event.shiftKey) {
                        let rotObj = init.preview().viewSelect[1];
                        shiftClick.appendShift(rotObj)
                    }
                    else {
                        modal.initModal(toolbar.currActive())
                        $("#input").modal();
                    }
                    break;
                case "Dilate":
                    if (init.preview().viewSelect.length == 1) {
                        let dilObj = init.preview().viewSelect[0];
                        init.preview().viewSelect = [dilObj, undefined]
                    }
                    else if (init.preview().viewSelect.length > 1 && event.shiftKey) {
                        let dilObj = init.preview().viewSelect[1];
                        shiftClick.appendShift(dilObj)
                    }
                    else {
                        modal.initModal(toolbar.currActive())
                        $("#input").modal();
                    }
                    break;
                case "Translate":
                    if (init.preview().viewSelect.length > 0) {
                        let transObj = init.preview().viewSelect[0]
                        if (event.shiftKey) shiftClick.appendShift(transObj)
                        else {
                            modal.initModal(toolbar.currActive())
                            $("#input").modal();
                        }
                    }
                    break;
            }
        })
        // canv.addEventListener("mousedown", function(event) {
        //     if (toolbar.currActive() != "Select") return
        //     let coorX = event.clientX - initX;
        //     let coorY = event.clientY - initY;
        //     let obj = select.nearestObject(coorX, coorY);
        //     //[object, trace]
        //     //object is what is being shifted
        //     //trace is reference point to find dx, dy
        //     if (obj instanceof geo.Point) allowShift = [obj, obj];
        //     else if (obj instanceof geo.Line) {
        //         let trace = select.pointOnLine(coorX, coorY, obj);
        //         allowShift = [obj, trace];
        //     }
        // });
        //mouse over functions
        canv.addEventListener("mousemove", function(event) {
            let coorX = event.clientX - initX;
            let coorY = event.clientY - initY;
            switch(toolbar.currActive()) {
                case "Select":
                    //if (allowShift != false) {

                        //shiftCanv.shiftCoor(allowShift, coorX, coorY)
                        //object has been shifted
                        //moved = true
                    //}
                    //else {
                    let obj = select.nearestObject(coorX, coorY);
                    if (obj != undefined) init.preview().viewSelect = [obj];
                    else init.preview().viewSelect = []
                    //}
                    break;
                case "Point":
                    let p;
                    let nearObj = select.nearestIntersection(coorX, coorY);
                    if (nearObj instanceof geo.Point) p = nearObj;
                    else if (nearObj instanceof geo.Line || nearObj instanceof geo.ExtLine) {
                        p = select.pointOnLine(coorX, coorY, nearObj)
                    }
                    else if (nearObj instanceof geo.Circle) {
                        p = select.pointOnCircle(coorX, coorY, nearObj);
                    }
                    else p = new geo.Point(coorX, coorY);
                    init.preview().view = [p];
                    break;
                case "Partition":
                    let objPart = select.nearestObject(coorX, coorY);
                    if (objPart instanceof geo.Line) {
                        init.preview().viewSelect = [objPart];
                    }
                    else init.preview().viewSelect = [];
                    break;
                case "Exact Angle":
                case "Line":
                case "Exact Line":
                    let pLine = select.nearestObject(coorX, coorY);
                    //put on line if near
                    if (pLine instanceof geo.Line || pLine instanceof geo.ExtLine) {
                        pLine = select.pointOnLine(coorX, coorY, pLine);
                    }
                    else if (pLine instanceof geo.Circle) {
                        pLine = select.pointOnCircle(coorX, coorY, pLine);
                    }
                    //if there is no nearest object, redefine current point
                    else if (pLine == undefined || !(pLine instanceof geo.Point)) {
                        pLine = new geo.Point(coorX, coorY);
                        init.preview().viewSelect = []
                    }
                    //highlight nearest obj object
                    else {init.preview().viewSelect = [pLine];}

                    //previews
                    if (init.preview().view.length < 2) {
                        init.preview().view = [pLine];
                    }
                    else {
                        let oldPLine = init.preview().view[0]
                        let l = new geo.Line(oldPLine, pLine);
                        init.preview().view = [oldPLine, pLine, l];
                    }
                    break;
                case "Extended Line":
                    let pELine = select.nearestObject(coorX, coorY);
                    //if there is no nearest object, redefine current point
                    if (pELine instanceof geo.Line || pELine instanceof geo.ExtLine) {
                        pELine = select.pointOnLine(coorX, coorY, pELine);
                    }
                    else if (pELine instanceof geo.Circle) {
                        pELine = select.pointOnCircle(coorX, coorY, pELine);
                    }
                    else if (pELine == undefined || !(pELine instanceof geo.Point)) {
                        pELine = new geo.Point(coorX, coorY);
                        init.preview().viewSelect = []
                    }
                    //highlight nearest obj object
                    else {init.preview().viewSelect = [pELine];}

                    //preview
                    if (init.preview().view.length < 2) {
                        init.preview().view = [pELine];
                    }
                    else {
                        let oldPELine = init.preview().view[0]
                        let slope =  (pELine.y - oldPELine.y) / (pELine.x - oldPELine.x)
                        let l = new geo.ExtLine(oldPELine, slope);
                        init.preview().view = [oldPELine, pELine, l];
                    }
                    break;
                case "Perpendicular Line":
                    let perLine =  select.nearestObject(coorX, coorY);
                    if (perLine instanceof geo.Point && init.preview().viewSelect.length < 2) {
                        init.preview().viewSelect = [perLine];
                    }
                    else if (init.preview().viewSelect.length < 2) {
                        init.preview().viewSelect = [];
                    }
                    else if ((perLine instanceof geo.Line || perLine instanceof geo.ExtLine) &&
                             (init.preview().viewSelect.length >= 2)) {
                        let p = init.preview().viewSelect[0];
                        init.preview().viewSelect = [p, perLine];
                    }
                    else {
                        let p = init.preview().viewSelect[0];
                        init.preview().viewSelect = [p, undefined];
                    }
                    break;
                case "Median":
                    let medLine = select.nearestObject(coorX, coorY);
                    if (medLine instanceof geo.Point && init.preview().viewSelect.length < 2) {
                        init.preview().viewSelect = [medLine];
                    }
                    else if (init.preview().viewSelect.length < 2) {
                        init.preview().viewSelect = [];
                    }
                    else if ((medLine instanceof geo.Line || medLine instanceof geo.ExtLine) &&
                                (init.preview().viewSelect.length >= 2)) {
                        let p = init.preview().viewSelect[0];
                        init.preview().viewSelect = [p, medLine];
                    }
                    else {
                        let p = init.preview().viewSelect[0];
                        init.preview().viewSelect = [p, undefined];
                    }
                    break;
                case "Angle Bisector":
                    let angBLine = select.nearestObject(coorX, coorY);
                    if (angBLine instanceof geo.Line && init.preview().viewSelect.length < 2) {
                        init.preview().viewSelect = [angBLine];
                    }
                    else if (init.preview().viewSelect.length < 2) {
                        init.preview().viewSelect = [];
                    }
                    else if (angBLine instanceof geo.Line && init.preview().viewSelect.length >= 2) {
                        let line1 = init.preview().viewSelect[0];
                        init.preview().viewSelect = [line1, angBLine];
                    }
                    else {
                        let line1 = init.preview().viewSelect[0];
                        init.preview().viewSelect = [line1, undefined];
                    }
                    break;
                case "Tangent":
                    let tanObj = select.nearestObject(coorX, coorY);
                    if (init.preview().viewSelect.length < 2) {
                        if (tanObj instanceof geo.Circle) init.preview().viewSelect = [tanObj]
                        else init.preview().viewSelect = []
                    }
                    else {
                        let circle = init.preview().viewSelect[0]
                        if (tanObj instanceof geo.Point && geo.onCircle(tanObj, circle)) {
                            init.preview().viewSelect = [circle, tanObj];
                        }
                        else if (tanObj instanceof geo.Circle) {
                            let point = select.pointOnCircle(coorX, coorY, circle);
                            init.preview().view = [point];
                            init.preview().viewSelect = [circle, undefined]
                        }
                        else {
                            init.preview().viewSelect = [circle, undefined]
                            init.preview().view = []
                        }
                    }
                    break
                case "Diameter":
                    let diaObj = select.nearestObject(coorX, coorY);
                    if (init.preview().viewSelect.length < 2) {
                        if (diaObj instanceof geo.Circle) init.preview().viewSelect = [diaObj]
                        else init.preview().viewSelect = []
                    }
                    else {
                        let circle = init.preview().viewSelect[0]
                        if (diaObj instanceof geo.Point && geo.onCircle(diaObj, circle)) {
                            init.preview().viewSelect = [circle, diaObj];
                        }
                        else if (diaObj instanceof geo.Circle) {
                            let point = select.pointOnCircle(coorX, coorY, circle);
                            init.preview().view = [point];
                            init.preview().viewSelect = [circle, undefined]
                        }
                        else {
                            init.preview().viewSelect = [circle, undefined]
                            init.preview().view = []
                        }
                    }
                    break;
                case "Circle":
                    let cPoint = select.nearestObject(coorX, coorY);
                    if (!(cPoint instanceof geo.Point)) cPoint = new geo.Point(coorX, coorY);

                    if (init.preview().view.length < 2) init.preview().view = [cPoint];
                    else if (init.preview().view.length >= 2) {
                        let center = init.preview().view[0];
                        let radius = geo.getDistance(new geo.Line(center, cPoint));
                        let circle = new geo.Circle(center, radius);
                        init.preview().view = [center, circle];
                    }
                case "Regular Polygon":
                    if (modal.submitData() == undefined) return;
                    let numSides = modal.submitData()[0];
                    let sideLen = modal.submitData()[1];
                    let regPoly = geo.newRegPolygon(numSides, sideLen, coorX, coorY);

                    let pointsArr = geo.getPoints(regPoly)
                    init.preview().viewSelect = [] 
                    for (let i = 0; i < pointsArr.length; i++) {
                        let point = pointsArr[i];
                        let regNear = select.nearestObject(point.x, point.y);
                        if (regNear instanceof geo.Line || regNear instanceof geo.ExtLine) {
                            init.preview().viewSelect = [regNear];
                            regPoly = select.polyOnLine(point, regPoly, regNear)
                            break;
                        }
                    }
                    init.preview().view = [regPoly];
                    break;
                case "Triangle":
                    if (modal.submitData() == undefined) return
                    let measure1 = modal.submitData()[0]
                    let measure2 = modal.submitData()[1]
                    let measure3 = modal.submitData()[2]
                    let congruenceType = modal.submitData()[3]
                    let tri = geo.newTriangle(congruenceType, measure1, measure2, measure3, coorX, coorY);

                    let pointsTri = geo.getPoints(tri)
                    init.preview().viewSelect = [] 
                    for (let i = 0; i < pointsTri.length; i++) {
                        let point = pointsTri[i]
                        let regNear = select.nearestObject(point.x, point.y);
                        if (regNear instanceof geo.Line || regNear instanceof geo.ExtLine) {
                            init.preview().viewSelect = [regNear]
                            tri = select.polyOnLine(point, tri, regNear)
                        }
                    }
                    init.preview().view = [tri]
                    break;
                case "Distance":
                    let disLine = select.nearestObject(coorX, coorY);
                    if (disLine instanceof geo.Line) {
                        init.preview().viewSelect = [disLine];
                    }
                    else init.preview().viewSelect = [];
                    break;
                case "Angle":
                    //if near obj is point, turn off angle
                    let angLine = select.nearestObject(coorX, coorY);
                    if (init.preview().viewSelect.length < 2 && (
                        angLine instanceof geo.Line || angLine instanceof geo.Point)) {
                        init.preview().viewSelect = [angLine];
                    }
                    else if (init.preview().viewSelect.length < 2) init.preview().viewSelect = [];
                    else if (init.preview().viewSelect.length >= 2 && (
                        angLine instanceof geo.Line || angLine instanceof geo.Point)) {
                        let angLine1 = init.preview().viewSelect[0];
                        init.preview().viewSelect = [angLine1, angLine];
                    }
                    else {
                        let angLine1 = init.preview().viewSelect[0];
                        init.preview().viewSelect = [angLine1, undefined];
                    }
                    break;
                case "Perimeter":
                    let perObj = select.nearestObject(coorX, coorY);
                    if (perObj instanceof geo.Line || perObj instanceof geo.Circle) {
                        init.preview().viewSelect = [perObj];
                    }
                    else init.preview().viewSelect = []
                    break;
                case "Area":
                    let areaObj = select.nearestObject(coorX, coorY);
                    if (areaObj instanceof geo.Line || areaObj instanceof geo.Circle) {
                        init.preview().viewSelect = [areaObj];
                    }
                    else init.preview().viewSelect = []
                    break;
                case "Reflect":
                    let reflObj = select.nearestObject(coorX, coorY);
                    if (init.preview().viewSelect.length < 2) {
                        if (reflObj instanceof geo.Line) {
                            init.preview().viewSelect = [reflObj]
                        }
                        else {
                            init.preview().viewSelect = []
                        }
                    }
                    else {
                        let refLine = init.preview().viewSelect[0];
                        init.preview().viewSelect = [refLine, reflObj]
                    }
                    break
                case "Rotate":
                    let rotObj = select.nearestObject(coorX, coorY);
                    if (init.preview().viewSelect.length < 2) {
                        if (rotObj instanceof geo.Point) {
                            init.preview().viewSelect = [rotObj]
                        }
                        else {
                            init.preview().viewSelect = []
                        }
                    }
                    else {
                        let rotPoint = init.preview().viewSelect[0];
                        init.preview().viewSelect = [rotPoint, rotObj]
                    }
                    break;
                case "Dilate":
                    let dilObj = select.nearestObject(coorX, coorY);
                    if (init.preview().viewSelect.length < 2) {
                        if (dilObj instanceof geo.Point) {
                            init.preview().viewSelect = [dilObj]
                        }
                        else {
                            init.preview().viewSelect = []
                        }
                    }
                    else {
                        let dilatePoint = init.preview().viewSelect[0];
                        init.preview().viewSelect = [dilatePoint, dilObj];
                    }
                    break;
                case "Translate":
                    let transObj = select.nearestObject(coorX, coorY);
                    if (transObj != undefined) {
                        init.preview().viewSelect = [transObj];
                    }
                    else init.preview().viewSelect = []
                    break;
            }
        })
        //mouseout functions
        canv.addEventListener("mouseout", function() {
            init.preview().view = []
        })

        $(document).ready(function() {
            $("#applySel").click(function() {
                switch(toolbar.currActive()) {
                    case "Partition":
                        modal.initModal(toolbar.currActive(), init.geoCanvas().selected);
                        $("#input").modal();
                        init.geoCanvas().selected = [];
                        sidebar.showSelection();
                        break;
                    case "Line":
                        init.preview().view = []
                        let selArr = init.geoCanvas().selected;
                        if (selArr.length > 1) {
                            selArr.push(selArr[0]);
                            for (let i = 0; i < selArr.length - 1; i++) {
                                let pt1 = selArr[i];
                                let pt2 = selArr[i + 1];
                                let l = new geo.Line(pt1, pt2);
                                init.geoCanvas().append(l);
                            }
                            init.geoCanvas().selected = [];
                            sidebar.showSelection()
                        }
                        break;
                    
                }
            })
            $("#applySel").hover(function() {
                switch(toolbar.currActive()) {
                    case "Line":
                        let selArr = init.geoCanvas().selected.copy();
                        init.preview().view = []
                        if (selArr.length > 1) {
                            selArr.push(selArr[0]);
                            for (let i = 0; i < selArr.length - 1; i++) {
                                let pt1 = selArr[i];
                                let pt2 = selArr[i + 1];
                                let l = new geo.Line(pt1, pt2);
                                init.preview().view.push(l);
                                init.geoCanvas().append(l);
                            }
                        }
                        break;
                }

            }, function() {
                switch(toolbar.currActive()) {
                    case "Line":
                        let selArr = init.geoCanvas().selected.copy();
                        init.preview().view = []
                        if (selArr.length > 1) {
                            selArr.push(selArr[0]);
                            for (let i = 0; i < selArr.length - 1; i++) {
                                let pt1 = selArr[i];
                                let pt2 = selArr[i + 1];
                                let l = new geo.Line(pt1, pt2);
                                init.geoCanvas().delete(l);
                            }
                        }
                        break;
                }
            })
        })
        document.addEventListener("keyup", (event) => {
            if (event.code == "ShiftLeft" || event.code == "ShiftRight" ) {
                let comObj = shiftClick.composedResult()

                switch(toolbar.currActive()) {
                    case "Select":
                        if (comObj == undefined) return;
                        init.geoCanvas().selected.push(comObj);
                        sidebar.showSelection();
                        break
                    case "Partition":
                        modal.initModal(toolbar.currActive(), comObj);
                        $("#input").modal();
                        break
                    case "Perimeter":
                        let index1 = init.geoCanvas().find(comObj);
                        let poly1 = init.geoCanvas().objectArr[index1];
                        poly1.showPerimeter = true
                        break;
                    case "Area":
                        let index2 = init.geoCanvas().find(comObj);
                        let poly2 = init.geoCanvas().objectArr[index2];
                        poly2.showArea = true
                        break;
                    case "Reflect":
                        let reflectLine = init.preview().viewSelect[0]
                        init.geoCanvas().reflect(comObj, reflectLine)
                        init.preview().viewSelect = []
                    case "Rotate":
                        init.preview().viewSelect[1] = comObj;
                        modal.initModal(toolbar.currActive())
                        $("#input").modal();
                    case "Dilate":
                        init.preview().viewSelect[1] = comObj;
                        modal.initModal(toolbar.currActive())
                        $("#input").modal();
                    case "Translate":
                        init.preview().viewSelect[0] = comObj;
                        modal.initModal(toolbar.currActive())
                        $("#input").modal();
                }
            }

        })
    }
    return {
        initEvent: () => initEvent()
    }
})()
canvas.initEvent()
