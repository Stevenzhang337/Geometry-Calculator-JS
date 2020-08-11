//deals with visual component of toolbar
var toolbarFE = (function() {
    var MainTool = ["Select","Points", "Lines", "Circles", "Polygons", "Measures", "Transformations"];
    var PointsTool = ["Back", "Point", "Partition"];
    var LinesTool = ["Back", "Line", "Extended Line", "Perpendicular Line",
                    "Median", "Angle Bisector", "Tangent", "Diameter"];
    var CirclesTool = ["Back", "Circle"];
    var PolygonsTool = ["Back", "Exact Line", "Exact Angle", "Triangle", "Regular Polygon"];
    var MeasuresTool = ["Back", "Distance", "Angle", "Perimeter", "Area"];
    var TransformationsTool = ["Back", "Reflect", "Rotate", "Dilate", "Translate"];

    var buttonRelations = [];
    ////////////////////////////////////////////////////////////////////////////////

    function createButton(name) {
        let button =  document.createElement("button");
        let text = document.createTextNode(name);
        //utton.setAttribute("class", "tool")
        button.setAttribute("class","tool btn btn-info");
        button.appendChild(text);
        return button;
    }
    function addBar(newTool, callButton) {
        let subBar = document.createElement("div");
        subBar.setAttribute("id", callButton);
        //subBar.setAttribute("style", "text-align: center");
        
        buttonRelations[callButton] = newTool
        for (let i = 0; i < newTool.length; i++) {
            let name = newTool[i];
            let button = createButton(name);
            subBar.append(button);
        }
        let sB = document.getElementById("subBar");
        sB.appendChild(subBar);

    }
    //INIT
    function init() {
        $(document).ready(function() {
            //inits toolbar
            addBar(MainTool, "Back");
            addBar(PointsTool, "Points");
            addBar(LinesTool, "Lines");
            addBar(CirclesTool, "Circles");
            addBar(PolygonsTool, "Polygons");
            addBar(MeasuresTool, "Measures");
            addBar(TransformationsTool, "Transformations");
    
            $("#Points").hide();
            $("#Lines").hide();
            $("#Circles").hide();
            $("#Polygons").hide();
            $("#Measures").hide();
            $("#Transformations").hide();

            //inits tool change
            $(".tool").on("click", function() {
                //change toolbar
                if (buttonRelations[this.textContent] != undefined) {
                    $(".tool").removeClass("active")
                    $(this.parentElement).hide()
                    $("#" + this.textContent).show();
                }
                //highlight button
                else {
                    $(".tool").removeClass("active");
                    $(this).toggleClass("active");
                }
            });
        });
    }

    return {
        init: () => init()
    }

})()
toolbarFE.init();


//deals with visual component of sidebar
var sidebarFE = (function() {
    function initSidebar() {
        $(document).ready(function () {
            $('#sidebarCollapse').on('click', function () {
                $('#sidebar').toggleClass('active');
            });
        });
    }
    return {
        initSidebar: () => initSidebar(),
    }

})()
sidebarFE.initSidebar();