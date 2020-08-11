var modal = (function() {
    var submitData;
    function initModal(id, object = undefined) {
        modalPopUp.createModal(id);
        $(document).ready(function() {
            $("#submit").off("click").on("click", function() {
                submitData = modalPopUp.getInput(id)
                if (object instanceof Array) {
                    for (let i = 0; i < object.length; i++) {
                        apply(id, submitData, object[i]);
                    }
                }
                else apply(id, submitData, object);
                $("#input").modal("toggle");
            })
        })
    }
    function apply(id, submitData, object) {
        switch(id) {
            case "Partition":
                let ratio1 = submitData[0];
                let ratio2 = submitData[1];
                init.geoCanvas().partition(object, ratio1, ratio2);
                submitData = undefined;
                break;
            case "Exact Line":
                let length = submitData[0];
                let newLine = geo.dilate(object, object.pt1, length/geo.getDistance(object));
                init.geoCanvas().append(newLine);
                init.preview().view = [];
                break
            case "Exact Angle":
                let Eangle = submitData[0];
                let otherLine = geo.rotate(object, object.pt2, -1 * Eangle)
                init.geoCanvas().append(object);
                init.geoCanvas().append(otherLine);
                init.preview().view = [];
                break
            case "Rotate":
                let rotatePoint = init.preview().viewSelect[0];
                let rotObj = init.preview().viewSelect[1];
                //ccw
                let angle = -1 * submitData[0]
                init.geoCanvas().rotate(rotObj, rotatePoint, angle)
                init.preview().viewSelect = []
                break;
            case "Dilate":
                let dilatePoint = init.preview().viewSelect[0];
                let dilObj = init.preview().viewSelect[1];
                let scalefactor = submitData[0]
                init.geoCanvas().dilate(dilObj, dilatePoint, scalefactor)
                init.preview().viewSelect = []
                break;
            case "Translate":
                let transObj = init.preview().viewSelect[0];
                let dx = submitData[0];
                let dy = -1 * submitData[1];
                init.geoCanvas().translate(transObj, dx, dy)
                init.preview().viewSelect = []
                break
            
        }
    }
    return {
        initModal: (id, object) => initModal(id, object),
        submitData: () => submitData,
        reset: () => submitData = undefined

    }
})();
