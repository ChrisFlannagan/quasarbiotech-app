var config = require("../../shared/config");
var StackLayout = require("ui/layouts/stack-layout").StackLayout;
var Label = require("ui/label");
var Button = require("ui/button");
var enumsModule = require("ui/enums");
var cameraModule = require("camera");
var fs = require('file-system');
var bghttp = require("nativescript-background-http");
var page;
var allPhotos;

exports.loaded = function(args) {
    page = args.object;
    allPhotos = new Array();
    loadPhotos();
};

exports.takePhoto = function(args) {
    cameraModule.takePicture({width: 800, height: 800, keepAspectRatio: true}).then(function(picture) {

        var savepath = fs.knownFolders.documents().path;
        var filename = 'img_' + new Date().getTime() + '.jpg';
        var filepath = fs.path.join(savepath, filename);

        var picsaved = picture.saveToFile(filepath, enumsModule.ImageFormat.jpeg);
        if(allPhotos.length > 0) {
            page.getViewById("select-photo").src = filepath;
        } else {
            page.getViewById("first-photo").src = filepath;
        }

        if(picsaved) {
            page.getViewById("loading-gif").visibility = 'visible';
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
                    loadPhotos();
                }
            }
        } else {
            console.log("Failed To Save");
        }
    });
};

function loadPhotos() {
    page.getViewById("all-pics").removeChildren();
    return fetch(config.apiUrl, {
        method: "POST",
        body: 'getphotos=true&email=' + global.useremail + '&device=' + global.currentdevice,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    })
        .then(handleErrors)
        .then(function(data) {
            var photos = JSON.parse(data._bodyInit);
            var cnt = 0;
            photos.forEach(function(photo) {
                console.log(photo.timeof);
                var psrc = "";
                var spsess = photo.timeof.split(' ');
                var spdate = spsess[0].split('-');
                var timeof = spdate[1] + '/' + spdate[2] + '/' + spdate[0];
                var label = new Label.Label();
                label.text = timeof;
                label.cssClass = 'list-img-label';

                if(fs.File.exists(fs.knownFolders.documents().path + "/" + photo.photo)) {
                    psrc = fs.knownFolders.documents().path + "/" + photo.photo;
                    console.log("On Macine");
                } else {
                    psrc= "https://www.babyquasar.com/appapi/appapi/uploads/" + global.useremail + "/" + photo.photo
                }

                if(cnt == photos.length-1) {
                    page.getViewById("first-photo").src = psrc;
                }

                var stack = new StackLayout();
                stack.cssClass = 'list-img';
                var p = new Button.Button();
                p.backgroundImage = psrc;
                p.on(Button.Button.tapEvent, function (eventData) {
                    page.getViewById("select-photo").src = psrc;
                },this);
                p.cssClass = 'list-img-p';
                stack.addChild(label);
                stack.addChild(p);
                allPhotos.push(stack);
                cnt++;
            });

            fillPhotos();

            if(cnt == 0) {
                page.getViewById("first-photo-label").text = "Take Your First Photo";
            } else {
                page.getViewById("first-photo-label").text = "Your First Photo";
                page.getViewById("select-photo-label").text = "Select Or Capture Photo To Compare";
            }

            page.getViewById("loading-gif").visibility = 'collapsed';
        });
}

function fillPhotos() {
    allPhotos.forEach(function(photo) {
        page.getViewById("all-pics").addChild(photo);
    });
}

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}