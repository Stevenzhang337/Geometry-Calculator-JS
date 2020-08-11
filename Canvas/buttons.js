var sidebar = (function() {
    //displays geometric object on sidebar
    function displayObject(object) {
        if (object instanceof geo.Point) {
            return "Point"
        }
        else if (object instanceof geo.Line) {
            return "Line"
        }
        else if (object instanceof geo.ExtLine) {
            return "extline"
        }
        else if (object instanceof geo.Circle) {
            return "Circle";
        }
        else if (object instanceof geo.Triangle) {
            return "Triangle"
        }
        else if (object instanceof geo.Polygon) {
            return "Polygon"
        }
    }
    //shows the geometric objects selected:
    function showSelection() {
        //clears sidebar
        document.getElementById("selections").innerHTML = ""
        //appends selected items on sidebar
        let selections = init.geoCanvas().selected;
        for (let i = 0; i < selections.length; i++) {
            let elem = displayObject(selections[i]);
            let display = document.createTextNode(elem);
            let listElem = document.createElement("li");
            listElem.appendChild(display);
            listElem.setAttribute("id", i.toString());
            document.getElementById("selections").appendChild(listElem)
        }

        
        //initializes delete
        $(document).ready(function () {
            //deletes selected item on click
            $("li").click(function() {
                let n = Number(this.id);
                init.geoCanvas().selected.splice(n, 1);
                init.preview().currSelect = undefined
                showSelection();
            });
            $("li").hover(function() {
                $(this).css("background-color", "#FF5233");
                let n = Number(this.id);
                init.preview().currSelect = init.geoCanvas().selected[n];
            }, function() {
                $(this).css("background-color", "transparent")
                init.preview().currSelect = undefined;
            })

        });
    }
    return {
        showSelection: () => showSelection()
    }
})()

var toolbar = (function() {
    //initialize the functions
    function currActive() {
        let s = document.getElementsByClassName("active")
        if (s.length > 0) {
            return s[0].textContent
        }
    }
    $(document).ready(function() { 
        $(".tool").on("click", function() {
            init.preview().viewSelect = []
            init.preview().view = []
            switch(currActive()) {
                case "Line":
                    $("#title").text("join points")
                    break;
                case "Perpendicular Line":
                    $("#title").text("select point/line");
                    break;
                case "Median":
                    $("#title").text("select point/line");
                    break;
                case "Angle Bisector":
                    $("#title").text("select vertex/2 lines");
                    break;
                case "Regular Polygon":
                    modal.initModal(toolbar.currActive())
                    $("#input").modal();
                    break;
                case "Triangle":
                    modal.initModal(toolbar.currActive());
                    $("#input").modal();
                default:
                    $("#title").text("")


            }
        })
    })
    return {
        currActive: () => currActive()
    }
})();

