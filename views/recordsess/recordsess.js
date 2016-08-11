var viewModule = require("ui/core/view");
var gestures = require("ui/gestures");
var imageModule = require("ui/image");
var absoluteLayoutModule = require("ui/layouts/absolute-layout");
var dialogs = require("ui/dialogs");
var frameModule = require("ui/frame");
var vibrator = require("nativescript-vibrate");

var page;
var quad;
var quadrants = new Array();
var id;
var timer = require("timer");
//var timestart = 1000*60*3;
var timerlength = 1000*60*3;
var timestart = 1000*60*3;
var timerlabel;
var timerBtn;
var face;
var deviceimg;
var angle = 0;
var radius = 20;
var stopped = true;
var treated = 0;
var started = false;

exports.loaded = function(args) {
    started = false;
    stopped = true;
    treated = 0;
    page = args.object;
    quadrants = new Array();
    quad = viewModule.getViewById(page, "main-layout");
    quad.removeChildren();
    face = new absoluteLayoutModule.AbsoluteLayout();
    quad.addChild(face);
    quad.on(gestures.GestureTypes.touch, function (args) {
        if(!started && args.action == "down" && quadrants.indexOf(args.getX() + ":" + args.getY()) < 0 ) {
            var plots = new imageModule.Image();
            absoluteLayoutModule.AbsoluteLayout.setLeft(plots, args.getX()-30);
            absoluteLayoutModule.AbsoluteLayout.setTop(plots, args.getY()-30);
            plots.src = "~/images/babyblue-sess.png";
            face.addChild(plots);
            quadrants.push(args.getX() + ":" + args.getY());
            console.dump(quadrants);
        }
    });

    timerlabel = viewModule.getViewById(page, "timerLabel");
    timerBtn = viewModule.getViewById(page, "timerBtn");
    timerlabel.text = "3:00";
    timestart = timerlength;
}

exports.starttimer = function() {
    face.removeChildren();
    if(typeof quadrants[treated] === 'undefined' ) {
        dialogs.alert("Select treatment areas before starting timer");
    } else {
        if(!started) {
            var curArea = quadrants[treated].split(":");

            deviceimg = new imageModule.Image();
            absoluteLayoutModule.AbsoluteLayout.setLeft(deviceimg, Number(curArea[0]));
            absoluteLayoutModule.AbsoluteLayout.setTop(deviceimg, Number(curArea[1]));
            deviceimg.src = "~/images/babyblue-sess.png";
            face.addChild(deviceimg);

            started = true;
        }
        if( stopped ) {
            stopped = false;
            id = timer.setInterval(function(){
                timestart = timestart - 1000;
                var minutes = Math.floor( (timestart/1000) / 60);
                timerlabel.text = minutes + ":" + ((timestart/1000) - minutes * 60);
                if(timestart <= 0) {
                    vibrator.vibration(2000);
                    if(treated == (quadrants.length-1)) {
                        timer.clearInterval(id);
                        var navigationOptions={
                            moduleName:"views/finishsess/finishsess",
                            clearHistory:true,
                            context:{
                                treatments: (treated+1)
                            }
                        }

                        frameModule.topmost().navigate(navigationOptions);
                    } else {
                        timer.clearInterval(id);
                        stopped = true;
                        timerlabel.text = "3:00";
                        timerBtn.text = "Start Next";
                        page.addCss("#timerBtn { color: #FFF; background-color: Blue; }");
                        timestart = timerlength;
                        treated++;
                        dialogs.alert("Done! Touch 'Start Timer' to begin your next treatment area").then(function () {
                            started = false;
                            console.log("Dialog closed!");
                        });
                    }
                }

                var x = (radius * Math.cos(angle * Math.PI / 180)) - 20;
                var y = radius * Math.sin(angle * Math.PI / 180);

                deviceimg.animate({
                    translate: { x: x, y: y },
                    duration: 1000
                });

                angle+=60;
                if(angle > 360) {
                    angle = 0;
                }
            }, 1000);
        }
    }
}

exports.stoptimer = function() {
    stopped = true;
    timer.clearInterval(id);
}

exports.undospot = function() {
    if(!started) {
        face.removeChildren();
        quadrants.pop();
        for(var i=0; i<quadrants.length;i++) {
            var curArea = quadrants[i].split(":");
            var plots = new imageModule.Image();
            absoluteLayoutModule.AbsoluteLayout.setLeft(plots, Number(curArea[0]) - 30);
            absoluteLayoutModule.AbsoluteLayout.setTop(plots, Number(curArea[1]) - 30);
            plots.src = "~/images/babyblue-sess.png";
            face.addChild(plots);
        }
    }
}

exports.onNavigatingFrom = function() {
    timer.clearInterval(id);
    face.removeChildren();
    stopped = true;
    treated = 0;
    quadrants = new Array();
}