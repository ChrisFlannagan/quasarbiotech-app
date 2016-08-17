var config = require("../../shared/config");
var frameModule = require("ui/frame");
var Observable = require("data/observable").Observable;
var observableArray = require("data/observable-array").ObservableArray;
var SessionsListViewModel = require("../../shared/view-models/device-hub-view-model");
var timer = require("timer");
var imageModule = require("ui/image");
var enumsModule = require("ui/enums");
var cameraModule = require("camera");
var fs = require('file-system');
var bghttp = require("nativescript-background-http");
var LocalNotifications = require("nativescript-local-notifications");

var page;

var sessionsList = new SessionsListViewModel([]);
var photosList;
var lastUse;
var pageData;

exports.loaded = function(args) {
    page = args.object;
    var prepage = args.object;
    var gotData=prepage.navigationContext;

    photosList = new observableArray([].map(function(photoSrc) {
        return new Observable({
            photo: photoSrc
        });
    }));

    pageData = new Observable({
        sessionsList: sessionsList,
        photosList: photosList,
        name: gotData.name,
        icon: gotData.icon,
        showList: true
    });
    page.bindingContext = pageData;

    sessionsList.empty();
    sessionsList.load();
    resetDataView();
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
            resetDataView();
            LocalNotifications.schedule([{
                id: 1,
                title: 'Your Quasar misses you!',
                body: 'Your Quasar misses you! You have not used your device in four days.',
                at: new Date(new Date().getTime() + (60 * 1000 * 60 * 24 * 4)) // 60 seconds * 1000 milliseconds * 60 minutes * 24 hours * 4 days
            }]).then(
                function() {
                    console.log("Notification Scheduled");
                },
                function(error) {
                    console.log("Error scheduling: " + error);
                }
            );
        });
}
exports.startsess = function(args) {
    frameModule.topmost().navigate("views/recordsession/recordsession");
}

exports.takephoto = function(args) {
    cameraModule.takePicture({width: 800, height: 800, keepAspectRatio: true}).then(function(picture) {

        var savepath = fs.knownFolders.documents().path;
        var filename = 'img_' + new Date().getTime() + '.jpg';
        var filepath = fs.path.join(savepath, filename);

        var picsaved = picture.saveToFile(filepath, enumsModule.ImageFormat.jpeg);

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
                    resetDataView();
                }
            }
        } else {
            console.log("Failed To Save");
        }
    });
}

exports.removesession = function(args) {
    var item = args.object.bindingContext;
    var index = sessionsList.indexOf(item);
    sessionsList.removesession(index);
};

exports.showPhotos = function() {
    pageData.set("showList", false);
};

exports.showSessions = function() {
    pageData.set("showList", true);
};

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}

function resetDataView() {
    timeRec = timer.setInterval(function() {
        if(sessionsList.getLatest() != '') {
            sessionsList.getPhotos().forEach(function(item, i) {
                //photosList.push(item);
            });

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