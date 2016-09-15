var config = require("../../shared/config");
var dialogs = require("ui/dialogs");
var utils = require("utils/utils");
var StackLayout = require("ui/layouts/stack-layout").StackLayout;
var Label = require("ui/label");
var Button = require("ui/button");
var enumsModule = require("ui/enums");
var cameraModule = require("camera");
var gestures = require("ui/gestures");
var fs = require('file-system');
var bghttp = require("nativescript-background-http");
var page;
var allPhotos;
var photoTop;
var photoBottom;
var photoTopPhoto;
var photoBottomPhoto;

var density;
var startScale = 1;

exports.loaded = function(args) {
    page = args.object;
    photoTop = page.getViewById("first-photo");
    photoBottom = page.getViewById("select-photo");
    photoTop.on(gestures.GestureTypes.touch, function(args) {
       if(args.action == "up") {
           console.log(photoTop.scaleX);
           photoTop.scaleX = 0;
           photoTop.scaleY = 0;
           photoTop.opacity = 1;
           photoBottom.opacity = 1;
       }
    });
    photoTop.on(gestures.GestureTypes.touch, function(args) {
        if(args.action == "up") {
            console.log(photoTop.scaleX);
            photoBottom.scaleX = 0;
            photoBottom.scaleY = 0;
            photoTop.opacity = 1;
            photoBottom.opacity = 1;
        }
    });
    density = utils.layout.getDisplayDensity();

    photoTop.translateX = 0;
    photoTop.translateY = 0;
    photoTop.scaleX = 0;
    photoTop.scaleY = 0;

    allPhotos = new Array();
    loadPhotos();
};

exports.onPinchTop = function(args) {
    photoBottom.scaleX = 0;
    photoBottom.scaleY = 0;
    var newScale = startScale * args.scale;
    newScale = Math.min(8, newScale);
    newScale = Math.max(0.125, newScale);
    photoTop.scaleX = newScale;
    photoTop.scaleY = newScale;
    if( newScale < 2 && newScale > 1) {
        photoBottom.opacity = 2 - newScale;
    } else if (newScale >= 2 ) {
        photoBottom.opacity = 0;
    }
};

exports.onPinchBottom = function(args) {
    photoTop.scaleX = 0;
    photoTop.scaleY = 0;
    var newScale = startScale * args.scale;
    newScale = Math.min(8, newScale);
    newScale = Math.max(0.125, newScale);
    photoBottom.scaleX = newScale;
    photoBottom.scaleY = newScale;
};

exports.takePhoto = function(args) {
    cameraModule.takePicture({width: 800, height: 800, keepAspectRatio: true}).then(function(picture) {
        var photoType = 0;
        if(args.view.id == "top-photo-capture") {
            photoType = 1;
        }
        var savepath = fs.knownFolders.documents().path;
        var filename = 'img_' + new Date().getTime() + '.jpg';
        var filepath = fs.path.join(savepath, filename);

        var picsaved = picture.saveToFile(filepath, enumsModule.ImageFormat.jpeg);
        if(allPhotos.length > 0) {
            photoBottom.src = filepath;
            photoBottomPhoto = filename;
        } else {
            photoTop.src = filepath;
            photoTopPhoto = filename;
        }

        if(picsaved) {
            //page.getViewById("loading-gif").visibility = 'visible';
            var session = bghttp.session("image-upload");
            var request = {
                url: config.apiUrl,
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "File-Name": filename,
                    "Email-Add": global.useremail,
                    "Photo-Type": photoType,
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

                if(photo.type == '1') {
                    photoTop.src = psrc;
                    photoTopPhoto = photo.photo;
                }

                var stack = new StackLayout();
                stack.cssClass = 'list-img';
                var p = new Button.Button();
                p.backgroundImage = psrc;
                p.on(Button.Button.tapEvent, function (eventData) {
                    photoBottom.src = psrc;
                    photoBottomPhoto = photo.photo;
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

            //page.getViewById("loading-gif").visibility = 'collapsed';
        });
};

exports.deleteOriginal = function() {
    dialogs.confirm("Are you sure you want to delete your original BEFORE picture?").then(function (result) {
        if(result) {
            console.log('Delete: ' + config.apiUrl + '?remphoto=true&email=' + global.useremail + '&photo=' + photoBottomTop);
            return fetch(config.apiUrl, {
                method: "POST",
                body: 'remphoto=true&email=' + global.useremail + '&photo=' + photoBottomTop,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                }
            })
                .then(handleErrors)
                .then(function(data) {
                    console.dump(data);
                    loadPhotos();
                });
        }
    });
};

exports.deleteSelected = function() {
    dialogs.confirm("Are you sure you want to delete the selected AFTER picture?").then(function (result) {
        if(result) {
            console.log('Delete: ' + config.apiUrl + '?remphoto=true&email=' + global.useremail + '&photo=' + photoBottomPhoto);
            return fetch(config.apiUrl, {
                method: "POST",
                body: 'remphoto=true&email=' + global.useremail + '&photo=' + photoBottomPhoto,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                }
            })
                .then(handleErrors)
                .then(function(data) {
                    console.dump(data);
                    loadPhotos();
                });
        }
    });
};

function fillPhotos() {
    allPhotos.forEach(function(photo) {
        page.getViewById("all-pics").addChild(photo);
    });
};

function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
};