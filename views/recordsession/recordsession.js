var viewModule = require("ui/core/view");
var gestures = require("ui/gestures");
var observable = require("data/observable");
var vibrator = require("nativescript-vibrate");
var dialogs = require("ui/dialogs");
var frameModule = require("ui/frame");
var insomnia = require("nativescript-insomnia");
var myPlatform = require( "nativescript-platform" );

var timer = require("timer");
var timerInt;
var timerLength;
var began;
var paused;
var currentIndex;
var timerLabel;
var timeStart;
var timerBtn;

var glow;
var glowInt;

var pageData;
var page;
var quad;
var quadrants;

exports.loaded = function(args) {
    loadAll = setTimeout( function() {
        page = args.object;
        console.log("Device: " + global.currentdevice);
        insomnia.keepAwake().then(function() {
            console.log("Insomnia is active");
        });

        //Initiate timer variables
        timerLength = 1000*60*3;
        //timerLength = 1000*5;
        began = false;
        paused = false;
        currentIndex = 0;
        glow = 0.5;

        timerLabel = viewModule.getViewById(page, "timerLabel");
        timerBtn = viewModule.getViewById(page, "timerBtn");
        timerLabel.text = "3:00";
        timeStart = timerLength;

        //Initiate page objects, binding data and quadrant variables
        quadrants = [];
        quad = viewModule.getViewById(page, "main-layout");

        pageData = new observable.Observable();

        if (myPlatform.android) {
            pageData.set("parentWidth", "100%");
            pageData.set("parentHeight", quad.getActualSize().height);
        } else {
            pageData.set("parentWidth", quad.getMeasuredWidth());
            pageData.set("parentHeight", quad.getMeasuredHeight());
        }
        pageData.set("c1", false);
        pageData.set("c2", false);
        pageData.set("c3", false);
        pageData.set("c4", false);
        pageData.set("c5", false);
        pageData.set("a1", glow);
        pageData.set("a2", glow);
        pageData.set("a3", glow);
        pageData.set("a4", glow);
        pageData.set("a5", glow);
        pageData.set("b1", false);
        pageData.set("b2", false);
        pageData.set("b3", false);
        pageData.set("b4", false);
        pageData.set("b5", false);

        page.bindingContext = pageData;
        quad.on(gestures.GestureTypes.touch, function (args) {
            if(args.action == "down" && !began) {
                var quadPercentageH = .65;
                var quadPercentageW= .5;
                var widePercent = args.getX() / quad.getMeasuredWidth();
                var heightPercent =  args.getY() / quad.getMeasuredHeight();
                console.log(quad.getMeasuredHeight());
                console.dump(page.getViewById("s1").getLocationOnScreen());
                console.dump(page.getViewById("s4").getLocationOnScreen());

                if (myPlatform.android) {
                    widePercent = args.getX() / quad.getActualSize().width;
                    heightPercent =  args.getY() / quad.getActualSize().height;
                }

                // Top Right
                if(widePercent > quadPercentageW) {
                    if(heightPercent < quadPercentageH) {
                        console.log("in here 1");
                        pageData.set("c1", ! pageData.get("c1"));
                    }
                }

                // Top Left
                if(widePercent <= quadPercentageW) {
                    if(heightPercent < quadPercentageH) {
                        console.log("before: " + pageData.get("c2"));
                        pageData.set("c2", ! pageData.get("c2"));
                        console.log("after: " + pageData.get("c2"));
                    }
                }

                if(global.currentdevice < 3) {
                    // Bottom Right
                    if (widePercent > quadPercentageW) {
                        if (heightPercent > quadPercentageH) {
                            console.log("in here 3");
                            pageData.set("c3", ! pageData.get("c3"));
                        }
                    }

                    // Bottom Left
                    if (widePercent <= quadPercentageW) {
                        if (heightPercent > quadPercentageH) {
                            console.log("in here 4");
                            pageData.set("c4", ! pageData.get("c4"));
                        }
                    }
                } else {
                    // Bottom Full
                    if (heightPercent > quadPercentageH) {
                        console.log("in here 5");
                        pageData.set("c5", ! pageData.get("c5"));
                    }
                }
            }
        });
    });
};

exports.starttimer = function() {
    if(!began) {
        //User pressed start for the first time
        //Fill our quadrants array
        for(var i=1;i<6;i++) {
            if(pageData.get("c" + i)) {
                quadrants.push(i);
            }
        }

        if(quadrants.length == 0) {
            dialogs.alert("Select treatment areas before starting timer");
        } else {
            began = true;
            startMsgs();
        }
    }

    if(began) {
        pageData.set("c" + quadrants[currentIndex], true);
        timerInt = timer.setInterval(function() {
            timeStart = timeStart - 1000;
            var minutes = Math.floor((timeStart / 1000) / 60);
            timerLabel.text = minutes + ":" + ((timeStart / 1000) - minutes * 60);

            pageData.set("c1", false);
            pageData.set("c2", false);
            pageData.set("c3", false);
            pageData.set("c4", false);
            pageData.set("c5", false);
            pageData.set("c" + quadrants[currentIndex], true);

            // If timer has hit 0;
            if (timeStart <= 0) {
                vibrator.vibration(2000);
                timer.clearInterval(timerInt);
                timer.clearInterval(glowInt);
                if (currentIndex == (quadrants.length - 1)) {
                    var navigationOptions = {
                        moduleName: "views/finishsess/finishsess",
                        clearHistory: true,
                        context: {
                            treatments: (currentIndex + 1)
                        }
                    };

                    frameModule.topmost().navigate(navigationOptions);
                } else {
                    timerLabel.text = "3:00";
                    timerBtn.text = "Start Next";
                    page.addCss("#timerBtn { color: #FFF; background-color: Blue; }");
                    timeStart = timerLength;
                    pageData.set("b" + quadrants[currentIndex], true);
                    currentIndex++;

                    dialogs.alert("Touch 'Start Timer' to begin your next treatment area").then(function () {
                        pageData.set("c1", false);
                        pageData.set("c2", false);
                        pageData.set("c3", false);
                        pageData.set("c4", false);
                        pageData.set("c5", false);
                        pageData.set("c" + quadrants[currentIndex], true);
                    });
                }
            }
        }, 1000);
        glowInt = timer.setInterval(function() {
            //glower
            if(glow < 1) {
                glow += .1;
                pageData.set("a" + quadrants[currentIndex], glow);
            } else {
                glow = 0;
            }
        }, 100);
    }
};

exports.stoptimer = function() {
    timer.clearInterval(timerInt);
    timer.clearInterval(glowInt);
};

exports.onNavigatingFrom = function() {
    timer.clearInterval(timerInt);
    timer.clearInterval(glowInt);
    insomnia.allowSleepAgain().then(function() {
        console.log("Insomnia is inactive, good night!");
    })
};

var red_msgs = new Array();
var blue_msgs = new Array();
var clear_msgs = new Array();
var use_msgs;
var msg_index = 0;
red_msgs.push("Overuse may cause redness or dry skin");
red_msgs.push("Use topical products after treatment");
red_msgs.push("After 8 weeks, weekly treatment is good maintenance");
blue_msgs.push("Blue light can be used daily");
blue_msgs.push("Blue light kills acne causing bacteria");
clear_msgs.push("Follow instructions that came with your Clear Rayz");
clear_msgs.push("Alternate days for red and blue treatment");
if(global.currentdevice == '1' || global.currentdevice == '3') {
    use_msgs = blue_msgs;
}
if(global.currentdevice == '2' || global.currentdevice == '4' || global.currentdevice == '6') {
    use_msgs = red_msgs;
}
if(global.currentdevice == '5') {
    use_msgs = clear_msgs;
}
function startMsgs() {
    console.log("msg: " + use_msgs[msg_index]);
    page.getViewById('quadrantsLabel').text = use_msgs[msg_index];
    msg_index++;
    msgs = timer.setInterval(function () {
        if(msg_index == use_msgs.length) {
            msg_index = 0;
        }
        page.getViewById('quadrantsLabel').text  = use_msgs[msg_index];
        msg_index++;
    }, 15000);
}