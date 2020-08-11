var modalPopUp = (function() {
    var modalArr = new Object();
    Array.prototype.findId = function(cmp) {
        for (let i = 0; i < this.length; i++) {
            if (this[i].id == cmp) return true;
        }
        return false;
    }
    class modalType {
        constructor(id, disc, inputArr, extra = false) {
            this.disc = disc;
            this.inputArr = inputArr;
            modalArr[id] = this;
            this.extra = extra
        }

    };
    new modalType("Partition", 
                 "Input the ratio between the first and second segment of the partition",
                 ["Ratio 1", "Ratio 2"]);
    new modalType("Regular Polygon",
                  "Input number of sides and side length",
                  ["Num of Sides", "Side len"]);
    new modalType("Triangle", 
                  "Input angles/sides",
                  ["measure 1", "measure 2", "measure 3"],
                  //code for extra
                  "<div class='btn-group btn-group-toggle' data-toggle='buttons'> \
                  <label class='btn btn-secondary active'> \
                  <input type='radio' name='options' id='SSS' autocomplete='off' checked> SSS \
                  </label> \
                  <label class='btn btn-secondary'> \
                  <input type='radio' name='options' id='SAS' autocomplete='off'> SAS \
                  </label> \
                  <label class='btn btn-secondary'> \
                  <input type='radio' name='options' id='ASA' autocomplete='off'> ASA \
                  </label> \
                  <label class='btn btn-secondary'> \
                  <input type='radio' name='options' id='AAS' autocomplete='off'> AAS \
                  </label> \
                  </div> <br>")
    new modalType("Exact Line",
                  "Input length",
                  ["Length"]);
    new modalType("Exact Angle",
                  "Input angle",
                  ["Angle"]);
    new modalType("Rotate",
                  "Input angle in degrees (ccw)",
                  ["angle"]);
    new modalType("Dilate",
                "Input scale factor",
                ["Scale Factor"]);
    new modalType("Translate",
                  "Input change in x, y",
                  ["dx", "dy"])

    function getInput(id) {
        let modal = modalArr[id]
        if (modal == undefined) return;
        let submitData = new Array()
        for (let i = 0; i < modal.inputArr.length; i++) {
            let val = $("#" + i.toString() + "sel").val()
            submitData.push(Number(val))
        }
        if (modal.extra != false) {
            if (document.getElementById("SSS").checked) submitData.push("SSS")
            else if (document.getElementById("SAS").checked) submitData.push("SAS")
            else if (document.getElementById("ASA").checked) submitData.push("ASA")
            else if (document.getElementById("AAS").checked) submitData.push("AAS")
            else submitData.push(undefined);
        }
        return submitData
    }
    function createModal(id) {
        let modal = modalArr[id]
        if (modal == undefined) return;
        $(".modal-body").empty()
        $(".modal-body").append("<p>" + modal.disc + "</p>");
        if (modal.extra != false) {
            $(".modal-body").append(modal.extra)
        }
        for (let i = 0; i < modal.inputArr.length; i++) {
            $(".modal-body").append("<label for = '" + i.toString() + "sel'>" + modal.inputArr[i] + "</label><br>")
            $(".modal-body").append("<input id = '" + i.toString() + "sel' placeholder = 'Enter here'></input><br>")
        }

    }
    return {
        createModal: (id) => createModal(id),
        getInput: (id) => getInput(id)
    }
})()
