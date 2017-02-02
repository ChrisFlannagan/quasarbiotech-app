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
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var page;
var allPhotos;
var photoTop;
var photoBottom;
var photoTopPhoto;
var photoBottomPhoto;
var uploadInProgress = false;

var selectcompare;

exports.loaded = function(args) {
    page = args.object;
    photoTop = page.getViewById("first-photo");
    photoBottom = page.getViewById("select-photo");
    photoBottom.src = "";

    allPhotos = new Array();
    loadPhotos();
};

exports.goFull = function(args) {
    photoBottom.src = photoTop.src;
    photoBottomPhoto = photoTopPhoto;
    fillScreen();
};
function fillScreen() {
    page.getViewById("grid-filler").visibility = "collapsed";
    page.getViewById("full-screen-layout").visibility = "visible";
}

exports.resizeBack = function(args) {
    page.getViewById("grid-filler").visibility = "visible";
    page.getViewById("full-screen-layout").visibility = "collapsed";
    photoBottom.src = '';
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

            var picsaved = picture.saveToFile(filepath + '.jpg', enumsModule.ImageFormat.jpeg);

            photoTop.src = filepath + '.jpg';
            photoTopPhoto = filename;

            if(picsaved) {
                var usecount = appSettings.getString("usecount");
                console.log("use: " + usecount);
                if(usecount == "none") {
                    appSettings.setString("usecount", "ready");
                }
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
                        loadPhotos();
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
            var oldest = '';
            var oldestsrc = '';
            photos.forEach(function(photo) {
                var psrc = "";
                var spsess = photo.timeof.split(' ');
                var spdate = spsess[0].split('-');
                var timeof = spdate[1] + '/' + spdate[2] + '/' + spdate[0];
                var label = new Label.Label();
                label.text = timeof;
                label.cssClass = 'list-img-label';

                if(fs.File.exists(fs.knownFolders.documents().path + "/" + photo.photo)) {
                    psrc = fs.knownFolders.documents().path + "/" + photo.photo;
                } else {
                    psrc = "https://www.babyquasar.com/appapi/appapi/uploads/" + global.useremail + "/" + photo.photo
                }
                oldest = photo.photo;
                oldestsrc = psrc;

                var stack = new StackLayout();
                stack.cssClass = 'list-img';
                var p = new Button.Button();
                p.backgroundImage = psrc;
                console.log(psrc);
                p.on(Button.Button.tapEvent, function (eventData) {
                    console.log("tap source: " + photoBottom.src );
                    var passrc = psrc;
                    console.log("passrc: " + passrc );
                    if(passrc == photoBottom.src) {
                        photoBottom.src = passrc;
                        photoBottomPhoto = photo.photo;
                        p.borderWidth = 1;
                        fillScreen();
                    } else if(photoBottom.src == "") {
                        photoBottom.src = psrc;
                        photoBottomPhoto = photo.photo;
                        p.borderWidth = 3;
                    } else {
                        var navigationOptions;
                        navigationOptions = {
                            moduleName:"views/photocompare/photocompare",
                            context:{
                                photo1: passrc,
                                photo2: photoBottom.src
                            }
                        };
                        frameModule.topmost().navigate(navigationOptions);
                    }
                },this);
                p.cssClass = 'list-img-p';
                stack.addChild(label);
                stack.addChild(p);
                allPhotos.push(stack);
                cnt++;
            });

            photoTop.src = oldestsrc;
            photoTopPhoto = oldest;

            fillPhotos();
        });
    }
};

exports.deleteOriginal = function() {
    dialogs.confirm("Are you sure you want to delete your original BEFORE picture?").then(function (result) {
        console.log(result);
        if(result == true) {
            return fetch(config.apiUrl, {
                method: "POST",
                body: 'remphoto=true&email=' + global.useremail + '&photo=' + photoTopPhoto,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                }
            })
                .then(handleErrors)
                .then(function(data) {
                    loadPhotos();
                    photoTopPhoto.src = "";
                    page.getViewById("grid-filler").visibility = "visible";
                    page.getViewById("full-screen-layout").visibility = "collapsed";
                });
        }
    });
};

exports.deleteSelected = function() {
    dialogs.confirm("Are you sure you want to delete the selected picture?").then(function (result) {
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
                    page.getViewById("grid-filler").visibility = "visible";
                    page.getViewById("full-screen-layout").visibility = "collapsed";
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