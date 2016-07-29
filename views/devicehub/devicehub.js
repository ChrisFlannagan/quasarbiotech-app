var config = require("../../shared/config");
var frameModule = require("ui/frame");
var Observable = require("data/observable").Observable;
var SessionsListViewModel = require("../../shared/view-models/device-hub-view-model");
var timer = require("timer");
var imageModule = require("ui/image");
var enumsModule = require("ui/enums");
var cameraModule = require("camera");
var fs = require('file-system');
var bghttp = require("nativescript-background-http");
var page;

var sessionsList = new SessionsListViewModel([]);
var lastUse;
var pageData;

exports.loaded = function(args) {
    page = args.object;
    var prepage = args.object;
    var gotData=prepage.navigationContext;
    console.log(gotData.name);
    console.log(gotData.icon);

    pageData = new Observable({
        sessionsList: sessionsList,
        name: gotData.name,
        icon: gotData.icon
    });

    page.bindingContext = pageData;

    sessionsList.empty();
    sessionsList.load();
    timeRec = timer.setInterval(function() {
        console.log("Get Latest: " + sessionsList.getLatest());
        if(sessionsList.getLatest() != '') {
            page.getViewById("lastuse").textWrap = true;
            lastUse = new Date(sessionsList.getLatest().replace(" ", "T") + "Z");
            var todaysDate = new Date();
            var timeDiff = Math.abs(todaysDate.getTime() - lastUse.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            timer.clearInterval(timeRec);
            page.getViewById("lastuse").text = "Last Use:" + sessionsList.getLatest();
            page.getViewById("days").text = "-" + (Number(diffDays)-1) + " Days";
        }
    }, 500);

}
exports.quickrecord = function(args) {
    return fetch(config.apiUrl, {
        method: "POST",
        body: 'insertsession=true&quickrecord=true&email=' + global.useremail + '&device=' + global.currentdevice,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    })
        .then(handleErrors)
        .then(function(data) {
            sessionsList.empty();
            sessionsList.load();
        });
}
exports.startsess = function(args) {
    frameModule.topmost().navigate("views/recordsess/recordsess");
    //frameModule.topmost().navigate("views/quadrants/quadrants");
}

exports.takephoto = function(args) {
    cameraModule.takePicture({width: 800, height: 800, keepAspectRatio: true}).then(function(picture) {

        var savepath = fs.knownFolders.documents().path;
        var filename = 'img_' + new Date().getTime() + '.jpg';
        var filepath = fs.path.join(savepath, filename);
        console.log(filepath);

        console.dump(picture);
        var picsaved = picture.saveToFile(filepath, enumsModule.ImageFormat.jpeg);
        console.log(picsaved);
        if(picsaved) {
            console.log("Saving");
            var session = bghttp.session("image-upload");
            var request = {
                url: config.apiUrl,
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "File-Name": filename,
                    "Email-Add": global.useremail,
                    "Device": global.currentdevice,
                    "Insert-Progress": "true"
                },
                description: "{ 'uploading': '" + filename + "' }"
            };

            var task = session.uploadFile("file://" + filepath, request);

            console.dump(request);

            task.on("progress", logEvent);
            task.on("error", logEvent);
            task.on("complete", logEvent);
            function logEvent(e) {
                console.log("Event" + e.eventName);
                if(e.eventName == "complete") {
                    sessionsList.empty();
                    sessionsList.load();
                }
                console.dump('response: ');
            }
        } else {
            console.log("Failed To Save");
        }
    });
}

exports.removesession = function(args) {
    console.dump(args);
    var item = args.view.bindingContext;
    var index = sessionsList.indexOf(item);
    sessionsList.removesession(index);
};

exports.graphsess = function() {
    page.addCss("#sesslist { visibility: collapse; }");
    page.addCss("#graphview { visibility: visible; }");
}

exports.listsess = function() {
    page.addCss("#sesslist { visibility: visible; }");
    page.addCss("#graphview { visibility: collapse; }");
}

exports.btnargs = function(args) {
    console.log(args.object);
}

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}