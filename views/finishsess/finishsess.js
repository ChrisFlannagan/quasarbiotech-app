var config = require("../../shared/config");
var frameModule = require("ui/frame");
var util = require("~/utils.js")
var page;

exports.loaded = function(args) {
    page = args.object
    var gotData=page.navigationContext;
    console.log(gotData.treated);
    page.getViewById("days").text = "You treated " + gotData.treated + " areas during this session.  Your session has been recorded";
    util.linearGradient(page, "return-btn", ['#ef706d', '#934544']);
    util.linearGradient(page, "support-btn", ['#ef706d', '#934544']);

    return fetch(config.apiUrl, {
        method: "POST",
        body: 'insertsession=true&treated=' + gotData.treated + '&quickrecord=true&email=' + global.useremail + '&device=' + global.currentdevice,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    })
    .then(handleErrors)
    .then(function(data) {
        console.log("Saved final session");
    });
}

exports.onNavigatingTo = function() {

}

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

//global.currentdevice = viewModel.getItem(index).imgid;