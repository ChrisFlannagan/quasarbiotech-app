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
var myPlatform = require( "nativescript-platform" );
var ImageSourceModule = require("image-source");
var page;
var allPhotos;
var photoTop;
var photoBottom;
var photoTopPhoto;
var photoBottomPhoto;
var uploadInProgress = false;

var density;
var startScale = 1;

//var scaledImage = android.graphics.Bitmap.createScaledBitmap(picture.android, 100, 100, true);

exports.loaded = function(args) {
    page = args.object;
    photoTop = page.getViewById("first-photo");
    photoBottom = page.getViewById("select-photo");
    console.log(photoTop.scaleX);
    photoTop.on(gestures.GestureTypes.touch, function(args) {
        if(args.action == "up") {
            console.log(photoTop.scaleX);
            photoTop.scaleX = 1;
            photoTop.scaleY = 1;
            photoTop.opacity = 1;
            photoBottom.opacity = 1;
        }
    });
    photoTop.on(gestures.GestureTypes.touch, function(args) {
        if(args.action == "up") {
            console.log(photoTop.scaleX);
            photoBottom.scaleX = 1;
            photoBottom.scaleY = 1;
            photoTop.opacity = 1;
            photoBottom.opacity = 1;
        }
    });
    density = utils.layout.getDisplayDensity();

    allPhotos = new Array();
    loadPhotos();
};

exports.onPinchTop = function(args) {
    photoBottom.scaleX = 1;
    photoBottom.scaleY = 1;
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
    photoTop.scaleX = 1;
    photoTop.scaleY = 1;
    var newScale = startScale * args.scale;
    newScale = Math.min(8, newScale);
    newScale = Math.max(0.125, newScale);
    photoBottom.scaleX = newScale;
    photoBottom.scaleY = newScale;
};

exports.resizeBack = function(args) {
    photoBottom.scaleX = 1;
    photoBottom.scaleY = 1;
    photoTop.scaleX = 1;
    photoTop.scaleY = 1;
};

exports.takePhoto = function(args) {
    if ( !uploadInProgress ) {
        cameraModule.takePicture({width: 650, height: 650, keepAspectRatio: true}).then(function(picture) {
            uploadInProgress = true;
            var photoType = 0;
            if(args.view.id == "top-photo-capture") {
                photoType = 1;
            }
            var savepath = fs.knownFolders.documents().path;
            var filename = 'img_' + new Date().getTime();
            var filepath = fs.path.join(savepath, filename);
            var medpath = fs.path.join(savepath, filename + 'med');
            var thumpath = fs.path.join(savepath, filename + 'thumb');

            var picsaved = picture.saveToFile(filepath + '.jpg', enumsModule.ImageFormat.jpeg);
            console.log("Pic saved" + picsaved);

            console.log("COMPLETED");
            var scaledImage = android.graphics.Bitmap.createScaledBitmap(picture.android, 350, 350, true);
            var scaledImageSource = new ImageSourceModule.ImageSource();
            scaledImageSource.setNativeSource(scaledImage);
            var medsaved = scaledImageSource.saveToFile(medpath + '.jpg', enumsModule.ImageFormat.jpeg);

            scaledImage = android.graphics.Bitmap.createScaledBitmap(picture.android, 100, 100, true);
            scaledImageSource = new ImageSourceModule.ImageSource();
            scaledImageSource.setNativeSource(scaledImage);
            var thumbsaved = scaledImageSource.saveToFile(thumpath + '.jpg', enumsModule.ImageFormat.jpeg);
            console.log(thumpath + '.jpg');
            console.log("Saved exists: " + fs.File.exists(thumpath + '.jpg'));

            console.log("Thumb saved: " + thumbsaved);
            //var t = 'data:image/png;base64,' + scaledImageSource.toBase64String('png',100);

            if(args.view.id == "top-photo-capture") {
                photoTop.src = medpath + '.jpg';
                console.log("Top source: " + photoTop.src );
                console.log("File exists: " + fs.File.exists(medpath + '.jpg'));
                photoTopPhoto = filename;
            } else {
                photoBottom.src = filepath + '.jpg';
                console.log("Bottom source: " + photoBottom.src );
                photoBottomPhoto = filename;
            }

            if(picsaved) {
                //page.getViewById("loading-gif").visibility = 'visible';
                var session = bghttp.session("image-upload");
                var request = {
                    url: config.apiUrl,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "File-Name": filename + '.jpg',
                        "Email-Add": global.useremail,
                        "Photo-Type": photoType,
                        "Device": global.currentdevice,
                        "Insert-Progress": "true"
                    },
                    description: "{ 'uploading': '" + filename + '.jpg' + "' }"
                };

                var task = session.uploadFile("file://" + filepath + '.jpg', request);

                task.on("progress", logEvent);
                task.on("error", logEvent);
                task.on("complete", logEvent);
                function logEvent(e) {
                    console.log("Event " + e.eventName);
                    if(e.eventName == "error" ) {
                        console.dump(e);
                        uploadInProgress = false;
                    }
                    if(e.eventName == "complete") {
                        //loadPhotos();
                    }
                }
            } else {
                console.log("Failed To Save");
            }
        });
    }
};

function loadPhotos() {
    if(!uploadInProgress) {
        console.log("in here");
        page.getViewById("all-pics").removeChildren();
        console.log("in here 2");
        return fetch(config.apiUrl, {
            method: "POST",
            body: 'getphotos=true&email=' + global.useremail + '&device=' + global.currentdevice,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        })
        .then(handleErrors)
        .then(function(data) {
            console.log("in here 3");
            console.log(data._bodyInit);
            var photos = JSON.parse(data._bodyInit);
            var cnt = 0;
            photos.forEach(function(photo) {
                console.log("in here 4");
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
                console.dump(photo);
                if(photo.type == '1') {
                    console.log("Photo type is 1");
                    photoTop.src = psrc.replace(".jpg", "med.jpg");
                    console.log("src: " + photoTop.src);
                    photoTopPhoto = photo.photo;
                }

                var stack = new StackLayout();
                stack.cssClass = 'list-img';
                var p = new Button.Button();
                p.backgroundImage = psrc.replace(".jpg", "thumb.jpg");
                p.on(Button.Button.tapEvent, function (eventData) {
                    photoBottom.src = psrc.replace(".jpg", "med.jpg");
                    console.log("bot src: " + photoBottom.src);
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
    }
};

exports.deleteOriginal = function() {
    dialogs.confirm("Are you sure you want to delete your original BEFORE picture?").then(function (result) {
        console.log(result);
        if(result == true) {
            console.log(config.apiUrl);
            console.log('Delete: ' + config.apiUrl + '?remphoto=true&email=' + global.useremail + '&photo=' + photoTopPhoto);
            return fetch(config.apiUrl, {
                method: "POST",
                body: 'remphoto=true&email=' + global.useremail + '&photo=' + photoTopPhoto,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                }
            })
                .then(handleErrors)
                .then(function(data) {
                    console.dump(data);
                    loadPhotos();
                    photoTopPhoto.src = "";
                });
        }
    });
};

exports.deleteSelected = function() {
    dialogs.confirm("Are you sure you want to delete the selected AFTER picture?").then(function (result) {
        console.log(result);
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