var viewModule = require("ui/core/view");
var gestures = require("ui/gestures");
var imageModule = require("ui/image");
var absoluteLayoutModule = require("ui/layouts/absolute-layout");
var dialogs = require("ui/dialogs");
var frameModule = require("ui/frame");

var page;
var quad;
var quadrants = new Array();
var id;
var timer = require("timer");
//var timestart = 1000*60*3;
var timestart = 3000;
var timerlabel;
var face;
var deviceimg;
var angle = 0;
var radius = 50;
var stopped = true;
var treated = 0;
var started = false;

exports.loaded = function(args) {
    console.log("PAGE LOADED");
    page = args.object;
    quadrants = new Array();
    quad = viewModule.getViewById(page, "main-layout");
    quad.removeChildren();
    console.log(quad);
    face = new absoluteLayoutModule.AbsoluteLayout();
    quad.addChild(face);
    console.log(quad);
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
    timerlabel.text = "3:00";
    //timestart = 1000*60*3;
    timestart = 3000;
}

exports.starttimer = function() {
    if(typeof quadrants[treated] === 'undefined' ) {
        dialogs.alert("Select treatment areas before starting timer");
    } else {
        if(!started) {
            //nativescript-swiss-army-knife plugin
            //pluckChildViewsFromLayout will remove and return in an array
            face.removeChildren();
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
                    console.log("Treated: " + treated);
                    console.log("Quadrants: " + (quadrants.length-1));
                    if(treated == (quadrants.length-1)) {
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
                        timestart = 3000;
                        treated++;
                        dialogs.alert("Done! Touch 'Start Timer' to begin your next treatment area").then(function () {
                            started = false;
                            console.log("Dialog closed!");
                        });
                    }
                }

                var x = (radius * Math.cos(angle * Math.PI / 180)) - 50;
                var y = radius * Math.sin(angle * Math.PI / 180);

                deviceimg.animate({
                    translate: { x: x, y: y },
                    duration: 1000
                });

                angle+=40;
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
    face.removeChildren();
    quadrants.pop();
    for(var i=0; i<quadrants.length;i++) {
        var curArea = quadrants[i].split(":");
        var plots = new imageModule.Image();
        absoluteLayoutModule.AbsoluteLayout.setLeft(plots, Number(curArea[0])-30);
        absoluteLayoutModule.AbsoluteLayout.setTop(plots, Number(curArea[1])-30);
        plots.src = "~/images/babyblue-sess.png";
        face.addChild(plots);
    }
}

exports.onNavigatingFrom = function() {
    timer.clearInterval(id);
    quadrants = new Array();
}