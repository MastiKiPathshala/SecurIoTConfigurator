var path = window.location.pathname;
var page = path.split("/").pop();

var material = (page == "index.html") ? true : false;
var myApp = new Framework7({
    modalTitle: 'SecurIOT Configurator',
    // Enable Material theme
    material: material
});


$.ajaxSetup({
    contentType: 'application/json'
})


// Export selectors engine
var $$ = Dom7;
var popupFlg = false;

var currentSSID = ""
var loopwtch;
var hostId = '';


//var mode = "DESKTOP"
var mode = "MOBILE"


var RPIENDPOINT = "http://192.168.42.208"

//var RPIENDPOINT = 'http://10.0.0.1'
//var protocol = 'http://'
//var port = ':8080'
var protocol = 'https://'
var port = ':8080'

var APP_VERSION = '0.1';
var APP_RELEASE = "V";
var ENDPOINT = ""


var selectedWifi = [];

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: false
});

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function(page) {
    // run createContentPage func after link was clicked
    $$('.create-page').on('click', function() {
        createContentPage();
    });
});

// Generate dynamic page
var dynamicPageIndex = 0;
var md = new MobileDetect(window.navigator.userAgent);


var data = []
var dataHubName = ''
    //var data = [{"address":"70:62:b8:70:ad:f4","channel":9,"frequency":2.452,"mode":"master","quality":70,"signal":-17,"ssid":"ProphecyGateway_123123","security":"wpa2"},{"address":"24:1f:a0:8e:2c:a8","channel":6,"frequency":2.437,"mode":"master","quality":55,"signal":-55,"ssid":"\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00","security":"wpa2"},{"address":"0c:d2:b5:56:24:2c","channel":7,"frequency":2.442,"mode":"master","quality":48,"signal":-62,"ssid":"SkinandHair","security":"wpa"},{"address":"f8:e9:03:c3:de:20","channel":10,"frequency":2.457,"mode":"master","quality":29,"signal":-81,"ssid":"TechSparx","security":"wpa2"},{"address":"0c:d2:b5:4c:8a:60","channel":8,"frequency":2.447,"mode":"master","quality":24,"signal":-86,"ssid":"Jajesh","security":"wpa"},{"address":"0c:d2:b5:26:61:a0","channel":9,"frequency":2.452,"mode":"master","quality":23,"signal":-87,"ssid":"Deepa","security":"wpa2"},{"address":"0c:d2:b5:20:a1:6c","channel":11,"frequency":2.462,"mode":"master","quality":21,"signal":-89,"ssid":"Airtel2000","security":"wpa2"},{"address":"00:1e:40:14:ed:00","channel":1,"frequency":2.412,"mode":"master","quality":18,"signal":-92,"ssid":"DEVA","security":"wpa"},{"address":"48:ee:0c:96:6a:c4","channel":1,"frequency":2.412,"mode":"master","quality":18,"signal":-92,"ssid":"NIFTY","security":"wpa"},{"address":"bc:f6:85:4d:9b:97","channel":1,"frequency":2.412,"mode":"master","quality":16,"signal":-94,"ssid":"Karthik","security":"wpa2"}]
myApp.onPageInit('list', function(page) {

    //getRasphList();
    clearInterval(loopwtch);
    //  $('#homeScreenCounter').timer('remove');

    //   $('#homeScreenCounterHolder').html('')

    $('#connectedNewtworkDiv').html('Connected to ' + currentSSID);

    setTimeout(function() {

        $('#scanBtn').removeAttr('disabled')
        $('#scanBtn').text('Scan local Wi-Fi')
 

    }, 7000)




});

var loaderimg = '<svg width="80px" height="80px" xmlns="img/loaderimg1.svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="uil-ring-alt"><rect x="0" y="0" width="50" height="50" fill="none" class="bk"></rect><circle cx="50" cy="50" r="40" stroke="rgba(0,0,0,0)" fill="none" stroke-width="10" stroke-linecap="round"></circle><circle cx="50" cy="50" r="40" stroke="#585858" fill="none" stroke-width="6" stroke-linecap="round"><animate attributeName="stroke-dashoffset" dur="2s" repeatCount="indefinite" from="0" to="502"></animate><animate attributeName="stroke-dasharray" dur="2s" repeatCount="indefinite" values="150.6 100.4;1 250;150.6 100.4"></animate></circle></svg>';

var popupHTML = '<div class="popup">' +
    '<div class="content-block">' +
    '<div class="col-25 col-dark">' +
    '<p><center><h3>Waiting for IP address</h3></center></p>' +
    '<center>' + loaderimg + '</center>' +
    '</div>' +
    '<p><center><h4>Expected Wait: 2 mins <br/>Time Elapsed: <span id="popupCounter"></span></h4></center></p>' +
    '<p class="buttons-row">' +
    '<a href="javascript:void(0)" onclick="closPopup()" id="canclBtn" class="button button-fill active close-popup">Close</a>' +
    '</p>' +
    '</div>' +
    '</div>';



//var ENDPOINT = "http://diag-srv.verification.prophecysensorlytics.com:8080"

var popupShown = false;

var indexPage = myApp.onPageInit('index', function(page) {

    callHomeTimer();
    $('#rasbList').html('');


    try {
        getRpiEndpoint()
        $('#verId').text(APP_RELEASE + "-" + APP_VERSION);


    } catch (e) {
        console.log(e)
    }




})

var homePage = myApp.onPageInit('home', function(page) {


    try {

        $('#verId').text(APP_RELEASE + "-" + APP_VERSION);
        getRpiEndpoint()
    } catch (e) {
        console.log(e)
    }

    try { checkWifiStat(); } catch (e) { console.log(e) }


    //first make sure wifi is enabled, if not enable 
    console.log('INIT')
    $('#rasbList').html('');

    setTimeout(startScan, 5000);
    setTimeout(function() {


        $('#rasbList').html('');
        stopScan();

    }, (5 * 60000) + 5000)

})







function stopScan() {
    // $('#homeScreenCounter').timer('remove');

    // $('#homeScreenCounterHolder').html('')

    clearInterval(loopwtch);
    if (mainView.activePage.name == 'index') $('#rescanBtn').show();
}


function gatewayPopup(msg) {

    if (!popupShown) {
        myApp.alert(msg, '<img src="img/gateway.png">')
        popupShown = true
    }

}

function startScan() {
    $('#statsDiv').html('Scanning for data hubs');
    //   $('#homeScreenCounterHolder').html('Scan Time: <span  id="homeScreenCounter" ></span>')
    $("#homeScreenCounter").timer();
    loopwtch = setInterval(checkLoop, 10000);
    $('#rescanBtn').hide();
}

myApp.onPageInit('staticNetwork', function(page) {

    clearInterval(loopwtch);
    // $('#homeScreenCounter').timer('remove');

    // $('#homeScreenCounterHolder').html('')

    $('#rasbList').html('');

});




function isCurrentSSIDConnected(cb) {
    if (RPIENDPOINT === 'http://10.0.0.1') {
        WifiWizard.getCurrentSSID(function(current) {
            current = current.replace(/"/g, "")
            if (current == currentSSID) cb(true)
            else cb(false)
        }, function(e) {
            console.log('Failed')
            cb(false)
        })
    } else {
        cb(true)
    }
}





function checkLoop() {
    console.log('Checking Loop')
    var onError = function(er) {
        console.log(er);

        //  $('#statsDiv').html('Error Encountered ' + JSON.stringify(er));
        WifiWizard.setWifiEnabled(true, function() {

            $('#statsDiv').html('Wi-Fi enabled');
        }, function() {
            var md = new MobileDetect(window.navigator.userAgent);


            if (md.os() == 'AndroidOS') {
                cordova.plugins.diagnostic.switchToWifiSettings();
            } else {
                console.log('Not touching Wi-Fi since ios')
            }


        });
    }


    $('#statsDiv').html('Scanning..');

    if ($("#homeScreenCounter").data('seconds') > 180 && $("#rasbList li").length <= 0 && mainView.activePage.name == 'index') {
        gatewayPopup('Please turn on or restart the Prophecy data hubs')

    }
    //check if already connected

    /* WifiWizard.getCurrentSSID(function(current) {
         current = current.replace(/"/g, "")
         console.log(current.substring(0, 15));



         if (current == currentSSID) {
             clearInterval(loopwtch);
             $('#homeScreenCounter').timer('remove');

             $('#homeScreenCounterHolder').html('')


             console.log("found = " + current);
             //  $('#statsDiv').html('');
             $('#statsDiv').html('Already Connected');
             currentSSID = current;
             if (mainView.activePage.name == 'index') {

                 mainView.router.loadPage('list.html');
             }
             //goto scan 
             //clear watch

         }

     }, onError); */




    //Scan for Surrounding Wifi
    WifiWizard.startScan(function() {
        console.log('Scan Started');
        //$('#statsDiv').html('Scanning');
        //Getting Scan results
        setTimeout(function() {

            WifiWizard.getScanResults({}, function(networks) {

                console.log(networks);
                $('#rasbList').html('');
                for (var i in networks) {
                    var current = networks[i].SSID
                    current = current.replace(/"/g, "")
                    $('#statsDiv').html('Found: ' + networks[i].SSID);
                    if (current.substring(0, 8) == "Prophecy") {
                        //Set the currentSSID 
                        //currentSSID = current

                        var item = '<li><a href="#" onclick=\'connectToWifi(\"' + current + '\",this)\' class="item-content"><div class="item-inner">' +
                            current + '<div class="item-after"></div></div></a></li>';

                        $('#rasbList').append(item);
                        $('#statsDiv').html('data hubs Found');
                        //Add network to the list, with connectBtn onclick=connectToWifi(SSID)
                    }


                }

            }, onError);


        }, 2000)




    }, onError);



}

function connectToWifi(SSID, element) {
    stopScan();
    $('#rescanBtn').hide();

    $('#statsDiv').html('Connecting to ' + SSID);
    $(element).attr('disabled', 'disabled')
        //var connection = WifiWizard.formatWPAConfig(SSID, "raspberry");
    var connection = WifiWizard.formatWPAConfig(SSID, "Prophecy");


    setTimeout(function() {

        WifiWizard.addNetwork(connection, function() {


                WifiWizard.connectNetwork(SSID, function() {

                        clearInterval(loopwtch);
                        //    $('#homeScreenCounter').timer('remove');

                        //    $('#homeScreenCounterHolder').html('')

                        setTimeout(function() {

                            currentSSID = SSID

                            $('#statsDiv').html('Connected to ' + currentSSID);

                            callHostIp(function(data) {
                                if (data.success) {
                                    hostId = data.res.id
                                    ENDPOINT = protocol + data.res.svrId + port
                                        //ENDPOINT = 'http://' + data.res.svrId + ":8080"
                                    getInterfaceList(data.res);
                                } else {
                                    setTimeout(function() {

                                        callHostIp(function(data) {
                                            if (data.success) {
                                                hostId = data.res.id
                                                ENDPOINT = protocol + data.res.svrId + port
                                                    //ENDPOINT = 'http://' + data.res.svrId + ":8080"
                                                getInterfaceList(data.res);
                                            } else {
                                                myApp.alert('data hub not responding, Start again')
                                                disconnectAndGoBackIndex()
                                            }
                                        })
                                    }, 5000)
                                }

                            })

                        }, 9000);



                    },
                    function() {
                        $('#statsDiv').html('Connection attempt failed ' + SSID);

                        //Switch to wifi setting if all else fails
                        try {
                            cordova.plugins.diagnostic.switchToWifiSettings();
                        } catch (e) {
                            cordova.plugins.diagnostic.switchToSettings();
                        }

                        $(element).removeAttr('disabled')

                        currentSSID = ''
                        startScan()


                    });

            },
            function() {

                currentSSID = ''

                $('#statsDiv').html('Connection attempt failed ' + SSID);

                //Switch to wifi setting if all else fails
                try {
                    cordova.plugins.diagnostic.switchToWifiSettings();
                } catch (e) {
                    cordova.plugins.diagnostic.switchToSettings();
                }
                $(element).removeAttr('disabled')
                startScan()


            });


    }, 2000)


}

function detlView(SSID) {
    mainView.router.loadPage('list.html');
}

function checkWifiStat() {
    $('#statsDiv').html('Checking Wi-Fi');
    cordova.plugins.diagnostic.isWifiEnabled(function(enabled) {
        if (!enabled) {
            try {
                cordova.plugins.diagnostic.setWifiState(function() {
                    console.log("Wi-Fi was enabled");
                    $('#statsDiv').html('Wi-Fi is auto-enabled');
                }, function(error) {
                    console.error("The following error occurred: " + error);
                    myApp.alert('Please enable Wi-Fi')
                    try {
                        cordova.plugins.diagnostic.switchToWifiSettings();
                    } catch (e) {
                        cordova.plugins.diagnostic.switchToSettings();
                    }

                }, true);
            } catch (e) {
                console.log('Inside catch');
                myApp.alert('Please enable Wi-Fi')
                try {
                    cordova.plugins.diagnostic.switchToWifiSettings();
                } catch (e) {
                    cordova.plugins.diagnostic.switchToSettings();
                }
            }
        }
    }, function(error) {
        console.error("The following error occurred: " + error);
        myApp.alert('Could not detect Wi-Fi state')
    });

}



function getRasphList() {

    isCurrentSSIDConnected(function(isConnected) {

        //just get nd save the id via status

        // callHostIp();

        $('#scanBtn').html("Scanning..");
        $('#scanBtn').attr("disabled", true);

        if (isConnected) {

            $.ajax({
                url: RPIENDPOINT + "/api/system/v1.0",
                type: "POST",
                data: JSON.stringify({ action: 'SCAN', iface: selectedInterface })
            }).done(function(res) {
                console.log(res);
                try { data = JSON.parse(res); } catch (e) { data = res }
                selectedWifi = [];
                $('#raspheryListHolder').html('');
                var item = '';
                data = getUnique(data);
                var size = data.length;

                for (i = 0; i < size; i++) {

                    if (data[i].quality < 50) {

                        if (data[i].quality < 20) {

                            var strengthIcon = "<div class='right'><img src='img/bar0.png'></div>";

                        } else if (data[i].quality > 20) {

                            var strengthIcon = "<div class='right'><img src='img/bar1.png'></div>";
                        }

                        bgStyl = 'style="border-style: solid;border-color: #ff0000 #ff0000"';

                    } else {
                        bgStyl = "";
                        var strengthIcon = "<div class='right'><img src='img/bar4.png'></div>";

                    }

                    var tempSid = data[i].ssid;
                    if (tempSid.substring(0, 8) != "Prophecy" && parseInt(data[i].frequency) < 5 && !matchStr(tempSid)) {


                        item = '<label class="label-checkbox item-content">' + '<input type="checkbox" name="wifiList[]"  value="' + data[i].ssid + '" >' + '<div class="item-media"> <i class="icon icon-form-checkbox" > </i></div><div class="item-inner"><div class="item-title" style="white-space: normal !important"> SSID: ' + data[i].ssid + ' (' + data[i].security + ') ' + strengthIcon + ' </div></div></label>'

                        $("#raspheryListHolder").append(item);
                    }
                }

                $('#scanBtn').html('Scan local Wi-Fi');
                $('#scanBtn').removeAttr("disabled");


            }).fail(function() {


                myApp.alert('Please try again', 'Error', function() { window.location.reload() })

            });
        } else {
            //myApp.alert('')
            disconnectWifi();
            myApp.alert('Connection Lost, Please Restart the Prophecy Gateway', '<img src="img/gateway.png">', function() { window.location.href = 'index.html' })
        }
    })
}

function callHostIp(cb) {
    getRpiEndpoint()


    $.ajax({
        url: RPIENDPOINT + "/api/system/v1.0",
        type: "POST",
        data: JSON.stringify({ action: 'STATUS' }),
        timeout: 60000
    }).done(function(res) {

        console.log(res);
        res = JSON.parse(res);
        //      res = {"status":true,"id":raspberrypib8:27:eb:37:06:be};
        hostId = res.id;
        //  ENDPOINT = protocol + res.svrId + port
        console.log('Host Id ' + hostId);

        if (cb) cb({ success: true, res: res })

    }).fail(function(res) {
        if (cb) cb({ success: false })

    });
}

function matchStr(param) {
    if (param.match(/x00.*/)) {
        return true
    } else {
        return false;
    }
}

function addWifiList() {
    selectedWifi = [];
    if (document.querySelectorAll('input[type="checkbox"]:checked').length > 0) {

        $(' input[type="checkbox"]').each(function() {

            if ($(this).is(":checked")) {
                selectedWifi.push(this.value);
                //   console.log(this.value)
            }
        });
        console.log(selectedWifi);
        mainView.router.loadPage('add.html')

    } else {
        myApp.alert('Select Network')
    }

}

var frmCnt = 0;
myApp.onPageInit('add', function(page) {

    addRasphList();
    clearInterval(loopwtch);

    $('#switchChkBox').change(function() {

        console.log('Change Triggered');
        if ($('#switchChkBox').prop('checked')) {
            $('#statNetDiv').show();
        } else {
            $('#statNetDiv').hide();
        }
    });



    $("#address").focusin(function() {

        setTimeout(function() { $('.page-content').scrollTo('#address'); }, 1000);

    });

});


var toggleShowPassword = function(control, target) {

    var control = $(control);
    var field = $(target)


    if (control.is(':checked')) {
        field.attr('type', 'text');
    } else {
        field.attr('type', 'password');
    }

};

function addRasphList() {

    $("#wifiAddBlock").html('');
    var item = '';
    var styl;
    var size = data.length;
    var raspSize = selectedWifi.length;
    frmCnt = 0;
    var cntr = 0;
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < raspSize; j++) {

            console.log(data[i].ssid)
            console.log(selectedWifi[j])
            if (data[i].security == "open") { styl = "style='display: none'"; } else { styl = "style='display: block'"; }
            if (data[i].quality < 50) {

                bgStyl = 'style="border-style: solid;border-color: #ff0000 #ff0000"';
                footMsgDiv = "Connection seems to be weak, Please use Ethernet or another connection";

            } else {
                bgStyl = "";
                footMsgDiv = "";
            }

            if (data[i].ssid == selectedWifi[j]) {

                cntr++;

                item = '<div class="card"  ' + bgStyl + ' >' +
                    '<div class="card-header">' + data[i].ssid + '<img height="40" width="40"  class="right" onclick=\'removNetwork(\"' + data[i].ssid + '\")\' src="img/cross.png"></div>' +
                    '<div class="card-content">' +
                    '<div class="card-content-inner">' +
                    '<form id="addfrm_' + frmCnt + '"">' +
                    '<div class="list-block">' +
                    '<ul>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">SSID </div>' +
                    '<div class="item-input"><input type="text" readonly value="' + data[i].ssid + '"/>' +
                    '</div>' +
                    '<input type="hidden" name="rasp_ssid_"' + i + '  value="' + data[i].ssid + '">' +
                    '<input type="hidden" name="rasp_security_"' + i + '  value="' + data[i].security + '">' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">SIGNAL </div>' +
                    '<div class="item-input"><input type="text" readonly value="' + data[i].signal + '"/>' +

                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">SECURITY </div>' +
                    '<div class="item-input"><input type="text" readonly value="' + data[i].security + '"/>' +

                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">QUALITY </div>' +
                    '<div class="item-input"><input type="text" readonly value="' + data[i].quality + '"/>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">MODE </div>' +
                    '<div class="item-input"><input type="text" readonly value="' + data[i].mode + '"/>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">FREQUENCY </div>' +
                    '<div class="item-input"><input type="text" readonly value="' + data[i].frequency + '"/>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">CHANNEL </div>' +
                    '<div class="item-input"><input type="text" readonly value="' + data[i].channel + '"/>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">ADDRESS </div>' +
                    '<div class="item-input"><input type="text" readonly value="' + data[i].address + '"/>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content" ' + styl + '>' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">Wi-Fi <br/> Password</div>' +
                    '<div class="item-input">' +
                    '<input type="password" name="wifiPass" size="16" id="wifiPass_' + cntr + '"   placeholder="password">' +
                    '<input onclick=\'toggleShowPassword("#showpswd_' + cntr + '","#wifiPass_' + cntr + '")\' id="showpswd_' + cntr + '"  style="zoom:1.5"  type="checkbox" />Show' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '</ul>' +
                    '</div>' +
                    '</form>' +
                    '</div>' +
                    '</div>' +
                    '<div class="card-footer">' + footMsgDiv + '</div>' +
                    '</div>';

                $("#wifiAddBlock").append(item);
                frmCnt++;
            } else {
                //  console.log('Elements not matched');
            }
        }
    }


}

function removNetwork(ssid) {
    console.log(ssid);
    for (var i = 0; i < selectedWifi.length; i++) {
        if (selectedWifi[i] === ssid) {
            selectedWifi.splice(i, 1);
            break;
        }
    }
    addRasphList();
}



function addhiddenNetwork() {
    myApp.popup('.popup-hidNetwork');
    popupFlg = true;
    $('.popup-overlay').hide();
}
var retries = 0;

function sendToServer(bypass) {
    var errFlag = false;
    var inputData = [];
    if (!bypass) {


        for (var k = 0; k < frmCnt; k++) {
            var datastring = $('#addfrm_' + k).serializeObject();
            inputData.push(datastring);
        }


        for (var k = 0; k < frmCnt; k++) {

            if (((inputData[k].rasp_security_ == '') || (inputData[k].rasp_security_ == 'open'))) {

                inputData[k].wifiPass == '';

            } else {

                var temPass = inputData[k].wifiPass;
                var len = temPass.length;
                if (len < 8) {
                    errFlag = true;
                    myApp.alert('', "Password is too small!");
                    $('#postBtn').removeAttr("disabled");
                    $('#postBtn').text('SAVE')
                    return;
                }
            }
        }

    }

    if (errFlag) {

        myApp.alert('Password cannot be blank');
        $('#postBtn').removeAttr("disabled");
        $('#postBtn').text('SAVE')

    } else {

        //  window.location.href = 'index.html';


        isCurrentSSIDConnected(function(isConnected) {

            if (isConnected) {

                console.log(isConnected);

                $.ajax({
                    url: RPIENDPOINT + "/api/system/v1.0",
                    type: "POST",
                    data: JSON.stringify({ action: 'ADD', data: inputData, iface: selectedInterface })

                }).done(function(data) {
                    console.log(data);
                    window.location.href = "index.html"
                    $("#postBtn").removeAttr('disabled');
                    $('#postBtn').text('SAVE')
                }).fail(function() {
                    console.log('Ajax Failed');
                    $("#postBtn").removeAttr('disabled');
                    $('#postBtn').text('SAVE')
                });
            } else {
                myApp.alert('Connection Lost')
                $("#postBtn").removeAttr('disabled');
                $('#postBtn').text('SAVE')
                disconnectWifi(function() {
                    window.location.href = 'index.html'
                });

            }
        });


    }

}

function disconnectWifi(cb) {

    if (RPIENDPOINT === 'http://10.0.0.1') {


        try {
            WifiWizard.disconnectNetwork(currentSSID, function(res) {

                WifiWizard.removeNetwork(currentSSID, function(res) {

                    currentSSID = '';

                    console.log(res);

                    WifiWizard.startScan(function() {
                        console.log('Scanned Again');
                    }, function(e) {
                        console.log(e)
                    });

                    if (cb) cb()

                }, function(e) {

                    var md = new MobileDetect(window.navigator.userAgent);


                    if (md.os() == 'AndroidOS') {
                        //   myApp.alert('Failed To Disconnect');
                        window.location.href = "index.html"
                    } else {

                        if (cb) cb()
                    }



                    console.log(e)
                });

            }, function(e) {
                if (md.os() == 'AndroidOS') {
                    //   myApp.alert('Failed To Disconnect');
                    window.location.href = "index.html"
                } else {

                    if (cb) cb()
                }

                console.log(e)
            });

        } catch (e) {
            console.log(e)
        }
    } else {
        if (cb) cb()
    }

}

function disconnectAndGoBack() {

    disconnectWifi(function() {

        setTimeout(function() {

            if (md.os() == "AndroidOS") {
                if (RPIENDPOINT == "http://10.0.0.1") window.location.href = 'home.html'
                else window.location.href = 'index.html'
            } else {
                window.location.href = 'index.html'
            }


        }, 1000)

    })

}

function disconnectAndGoBackIndex() {

    disconnectWifi(function() {

        setTimeout(function() { window.location.href = 'index.html' }, 1000)

    })

}


function appendHidden() {

    var id = $('#ssid').val();

    if (id == "") {
        alert('SSID can not be blank');

    } else {

        myApp.closeModal();
        var obj = {
            ssid: id,
            frequency: 2.4,
            signal: 'unknown',
            security: 'unknown',
            channel: 'unknown',
            address: 'unknown',
            mode: 'unknown',
            quality: 'unknown'
        };
        data.push(obj);

        selectedWifi = [];
        $('#raspheryListHolder').html('');
        var item = '';
        data = getUnique(data);
        var size = data.length;
        if (size > 0) {

            for (i = 0; i < size; i++) {

                var tempSid = data[i].ssid;
                if (tempSid.substring(0, 8) != "Prophecy" && parseInt(data[i].frequency) < 5 && !matchStr(tempSid)) {


                    item = '<label class="label-checkbox item-content">' + '<input type="checkbox" name="wifiList[]"  value="' + data[i].ssid + '" >' + '<div class="item-media"> <i class="icon icon-form-checkbox" >' + ' </i></div><div class="item-inner"><div class="item-title" style="white-space: normal !important"> SSID: ' + data[i].ssid + ' (' + data[i].security + ') </div></div></label>'

                    /*    item = '<li><a href="javascript:void(0)" class="item-link">' +
                            '<div class="item-content">' +
                            '<div class="item-inner">' +
                            '<div class="row"  style="width: 100%;">' +
                           
                            '<div class="col-10">' +
                            '<label class="label-checkbox item-content">' +
                            '<input type="checkbox" name="wifiList[]"  value="' + data[i].ssid + '" >' +
                            '<div class="item-media">' + '<i class="icon icon-form-checkbox"></i>' + '</div>' +
                             '<div class="col-30">' + data[i].ssid + '</div>' +
                            '<div class="col-30">' + data[i].signal + '</div>' +
                            '<div class="col-30">' + data[i].security + '</div>' +
                            '</label>' +
                            '</div>' +
                            '</div>' +
                            '</div></div></a>' +
                            '</li>' */
                    console.log(item);
                    $("#raspheryListHolder").append(item);
                } else {
                    console.log('No records');
                }
            }
        } else {

            console.log('New Hidden Network Not Added');
        }

    }

}


function getUnique(array) {
    console.log(array);
    var u = [],
        a = [];
    for (var i in array) {

        console.log(array[i].ssid)
        console.log(u)
        console.log($.inArray(array[i].ssid, u))
        if ($.inArray(array[i].ssid, u) > -1) {
            continue;
        } else {
            a.push(array[i]);
            u.push(array[i].ssid);
        }

    }
    return a;
}



function getIpAddress() {

    console.log('Host Id ' + hostId + ' Pining server');

    $.ajax({

        url: ENDPOINT + '/heartbeats/NW_Query?criterion=nw&param=id&q=' + hostId,
        type: "GET"


    }).done(function(res) {
        console.log('Retry :' + retries)

        console.log('Server responded with ' + JSON.stringify(res))

        if (typeof res == "string") {
            res = JSON.parse(res)
        }
        if (typeof res.data == "string") {
            res.data = JSON.parse(res.data)
        }

        try {


            if (typeof res.data.NW_Info != "undefined") {

                var serverData = res.data.NW_Info.internalIP[0];

                if (typeof serverData == "undefined") {
                    serverData = 'Not Found';
                } else {
                    saveNetworkToLocal(serverData, dataHubName, res.id)
                }


                $('#popupCounter').html('')



                myApp.confirm('IP Found: ' + serverData + ' Open Gateway?', 'Prophecy Wifigurator',
                    function() {

                        window.open(encodeURI('http://' + serverData), '_system')
                        setTimeout(function() { window.location.href = 'index.html' }, 500)
                    },
                    function() {
                        myApp.closeModal()
                            // mainView.router.loadPage('index.html');
                        window.location.href = 'index.html'
                    }
                );

            } else {

                retries++;
                if (retries < 15) {
                    setTimeout(getIpAddress, 12000);
                } else {

                    console.log('Exceeded retries')

                    myApp.alert('Failed to get IP', 'Opps', function() { disconnectAndGoBackIndex() });
                    //mainView.router.loadPage('index.html');

                }
            }
        } catch (e) {

            console.log('Failed in parsing response ' + e)

            retries++;
            if (retries < 15) {
                setTimeout(getIpAddress, 12000);
            } else {

                myApp.alert('Failed to get IP', 'Opps', function() { disconnectAndGoBackIndex() });
                //mainView.router.loadPage('index.html');

            }

        }

    }).fail(function(res) {

        console.log('Retry :' + retries)
        console.log('Server failed with ' + JSON.stringify(res))

        retries++;
        if (retries < 15) {
            setTimeout(getIpAddress, 12000);
        } else {

            myApp.alert('Failed to get IP', 'Opps', function() { window.location.reload() });

        }
    });
}

function closPopup() {
    myApp.closeModal()
        //mainView.router.loadPage('index.html')
    window.location.reload()
}

function debugMode() {
    mainView.router.loadPage('debug.html')
}

function checkUsb() {

    $.ajax({
        url: RPIENDPOINT + "/api/system/v1.0",
        type: "POST",
        data: JSON.stringify({ action: 'CURRENT' })

    }).done(function(res) {

        console.log(res);
        $('#servResp').html(res);
        myApp.alert(res);

    }).fail(function() {

    });
}

function reBootUsb() {

    $.ajax({
        url: RPIENDPOINT + "/api/system/v1.0",
        type: "POST",
        data: JSON.stringify({ action: 'REBOOT' })

    }).done(function(res) {

        console.log(res);
        myApp.alert(res);

    }).fail(function() {

    });
}

function goBack() {
    mainView.router.loadPage('home.html');

}

function statNetwork() {
    mainView.router.loadPage('staticNetwork.html');
}

function addStaticIp(cb) {



    var address = $('#address').val();
    var netmask = $('#netmask').val();
    //  var network = $('#network').val();
    //  var broadcast = $('#broadcast').val(); 
    var gateway = $('#gateway').val();


    if (address == "" || netmask == "" || gateway == "") {

        myApp.alert("Invalid Input");

    } else {

        var postdata = {

            address: address,
            netmask: netmask,
            gateway: gateway
        };

        console.log(postdata);
        $.ajax({
            url: RPIENDPOINT + "/api/system/v1.0",
            type: "POST",
            data: JSON.stringify({ action: 'STATIC', data: postdata, iface: selectedInterface })
        }).done(function(res) {

            if (cb) cb() //sendToServer();

        }).fail(function() {

            myApp.alert('Could Not Set Static IP');

            $('#postBtn').text('SAVE')
            $('#postBtn').removeAttr("disabled");


        });
    }

}

function addToServer() {
    $('#postBtn').text('SAVING..')
    $('#postBtn').attr("disabled", true);


    if ($('#switchChkBox').prop('checked')) {

        validateStaticFrm();

    } else {
        sendToServer(false);
    }

}

function validateStaticFrm() {
    var errFlag = false;
    var address = $('#address').val();
    var netmask = $('#netmask').val();

    var gateway = $('#gateway').val();

    if (typeof address == "undefined" || address == "" || !testIpaddress(address)) {

        errFlag = true;
        myApp.alert('Error in IP Address');
    } else if (typeof netmask == "undefined" || netmask == "" || !testIpaddress(netmask)) {

        errFlag = true;
        myApp.alert('Error in Netmask');
    } else if (typeof gateway == "undefined" || gateway == "" || !testIpaddress(gateway)) {

        errFlag = true;
        myApp.alert('Error in Gateway');
    }

    if (errFlag) {

        //  do nothing 
        $('#postBtn').text('SAVE')
        $('#postBtn').removeAttr("disabled");

    } else {

        addStaticIp(function() {
            sendToServer(false)
        });
    }

}

function testIpaddress(ipaddress) {
    return (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))

}

function saveNetworkToLocal(address, ssid, id) {

    var currentNetworks = JSON.parse(window.localStorage.getItem('networks'))

    if (typeof currentNetworks == "undefined" || currentNetworks == null) {
        currentNetworks = []
    }
    currentNetworks.push({ address: address, name: ssid, id: id, datetime: new Date() })
    window.localStorage.setItem('networks', JSON.stringify(currentNetworks))


}

myApp.onPageInit('history', function(page) {

    //  getLogHistory();

    var data = JSON.parse(window.localStorage.getItem('networks'));

    console.log(data);
    if (data == null) {

        myApp.alert('No History')

    } else {

        console.log(data);
        data = data.reverse();
        var size = data.length;
        $("#HistoryIPList").html('');


        for (i = 0; i < size; i++) {

            var dt = new Date(data[i].datetime);
            var DateFormat = dt.toLocaleString();

            item = '<div class="card">' +
                '<div class="card-header">' + data[i].name + '</div>' +
                '<div class="card-content">' +
                '<div class="card-content-inner">I.P: ' + data[i].address + '</div>' +
                '</div>' +
                '<div class="card-footer">Date Time: ' + DateFormat + '</div>' +
                '</div>'


            $("#HistoryIPList").append(item);

        }
    }
});

function getLogHistory() {

    mainView.router.loadPage('history.html');

}

function getInterfaceList(data) {
 

    $("#intrfaceLst").html('');
    var interfaces = data.interfaces;

    if (typeof interfaces == "undefined" || interfaces == "" || !interfaces) {


        myApp.alert('data hub does not have interfaces', function() {
            disconnectAndGoBackIndex();
        });
        $('#modeSelector').show()

    } else {

        $('#modeSelector').hide()
        if (interfaces.length > 0) {
            for (var x in interfaces) {
                var interfaceObj = interfaces[x]
                console.log(interfaceObj)
                for (var key in interfaceObj) {
                    console.log(interfaceObj[key])
                    if (key != "" || typeof key != "undefined" || key != null) {

                        if (key.indexOf('eth') > -1) {

                            var imgTag = '<img src="img/ethernet.png" height="50" >';
                            var intrFace = "Ethernet (wired)";
                            var item = '<li><a href="#" onclick=\'chooseInterface(\"' + key + '\",this)\' class="item-content"><div class="item-inner">' +
                                imgTag + '  ' + key + ' (' + interfaceObj[key] + ')' + '</div></a></li>';
                            $("#intrfaceLst").append(item);

                        } else if (key.indexOf('wlan') > -1) {

                            var imgTag = '<img src="img/wifi.png" height="50" >';
                            var intrFace = "Wi-Fi (wireless)";
                            var item = '<li><a href="#" onclick=\'chooseInterface(\"' + key + '\",this)\' class="item-content"><div class="item-inner">' +
                                imgTag + '  ' + key + ' (' + interfaceObj[key] + ')' + '</div></a></li>';
                            $("#intrfaceLst").append(item);

                        }
                    }

                }
            }
        } else {

            var item = "<li><a href='#' class='item-link item-content'><div class='item-inner'><div class='item-title'>No Interfaces found</div></div></a></li>";
            $("#intrfaceLst").html(item);
        }
        myApp.popup('.popup-interface');
    }
}


function chooseInterface(data, element) {
    console.log(data.indexOf('eth') > -1);
    myApp.closeModal();
    selectedInterface = data

    if (data.indexOf('eth') > -1) {
        mainView.router.loadPage('ethernet.html');


    } else {

        mainView.router.loadPage('list.html');
    }


}


function addEthernetIp(which) {

    $('#postBtn').text('SAVING..')
    $('#postBtn').attr("disabled", true);


    if (which == "STATIC") {

        addStaticIp(function() {
            sendToServer(true)
        })


    } else {

        // var postdata = { mode: 'DHCP' }

        sendToServer(true)
    }

    /*
        $.ajax({
            url: 'http://10.0.0.1:2525/',
            type: "POST",
            data: JSON.stringify({ action: 'ADD', data: postdata, iface: selectedInterface })
        }).done(function(data) {

            console.log(data);
            var res = JSON.parse(data);

            if (res.status) {

                dataHubName = currentSSID

                disconnectWifi();
                myApp.popup(popupHTML);
                setTimeout(function() { $('#popupCounter').timer() }, 500)

                retries = 0;
                setTimeout(getIpAddress, 30000);


            } else {
                myApp.alert('Network Error Encountered');
            }
            $("#postBtn").removeAttr('disabled');
            $('#postBtn').text('SAVE')

        }).fail(function() {

            myApp.alert('Could Not Set Static IP');

            $('#postBtn').text('SAVE')
            $('#postBtn').removeAttr("disabled");


        });
    */


}

function togleNetwork(sel) {

    $('#resDiv').html('');
    if (!$(sel).prop('checked')) {

        var networkhtml = '<div class="content-block">' +
            '<div class="list-block">' +
            '<ul>' +
            '<li>' +
            '<div class="item-content">' +
            '<div class="item-inner">' +
            '<div class="item-input">' +
            '<a href="javascript:void(0)" onclick="addEthernetIp(\'DHCP\')" id="postBtn" class="button active">SAVE</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '</div>';

        $('#resDiv').html(networkhtml);


    } else {

        var networkhtml = '<div class="content-block">' +
            '<div class="list-block">' +
            '<ul>' +
            '<li>' +
            '<div class="item-content">' +
            '<div class="item-inner">' +
            '<div class="item-title label">Address</div>' +
            '<div class="item-input">' +
            '<input id="address" type="text" placeholder="IP Address" class="">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</li>' +
            '<li>' +
            '<div class="item-content">' +
            '<div class="item-inner">' +
            '<div class="item-title label">Netmask</div>' +
            '<div class="item-input">' +
            '<input id="netmask" type="text" placeholder="Netmask">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</li>' +
            /*'<div class="item-content">' +
            '<div class="item-inner">' +
            '<div class="item-title label">DNS </div>' +
            '<div class="item-input">' +
            '<input id="dns" type="text" placeholder="DNS">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</li>' + */
            '<li>' +
            '<div class="item-content">' +
            '<div class="item-inner">' +
            '<div class="item-title label">Gateway</div>' +
            '<div class="item-input">' +
            '<input type="text" id="gateway" placeholder="Gateway IP">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</li>' +
            '<li>' +
            '<div class="item-content">' +
            '<div class="item-inner">' +
            '<div class="item-input">' +
            '<a href="javascript:void(0)" onclick="addEthernetIp(\'STATIC\')" id="postBtn" class="button active">SAVE</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '</div>';

        $('#resDiv').html(networkhtml);
    }

}


(function($) {
    $.fn.serializeObject = function() {

        var self = this,
            json = {},
            push_counters = {},
            patterns = {
                "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
                "key": /[a-zA-Z0-9_]+|(?=\[\])/g,
                "push": /^$/,
                "fixed": /^\d+$/,
                "named": /^[a-zA-Z0-9_]+$/
            };


        this.build = function(base, key, value) {
            base[key] = value;
            return base;
        };

        this.push_counter = function(key) {
            if (push_counters[key] === undefined) {
                push_counters[key] = 0;
            }
            return push_counters[key]++;
        };

        $.each($(this).serializeArray(), function() {

            // skip invalid keys
            if (!patterns.validate.test(this.name)) {
                return;
            }

            var k,
                keys = this.name.match(patterns.key),
                merge = this.value,
                reverse_key = this.name;

            while ((k = keys.pop()) !== undefined) {

                // adjust reverse_key
                reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

                // push
                if (k.match(patterns.push)) {
                    merge = self.build([], self.push_counter(reverse_key), merge);
                }

                // fixed
                else if (k.match(patterns.fixed)) {
                    merge = self.build([], k, merge);
                }

                // named
                else if (k.match(patterns.named)) {
                    merge = self.build({}, k, merge);
                }
            }

            json = $.extend(true, json, merge);
        });

        return json;
    };
})(jQuery);


function gotoIndex() {
    window.location.href = "index.html";
}

function callHomeTimer() {

    $('#homeScreenCounterHolder').html('Elapsed Time: <span  id="homeScreenCounter" ></span>')
    $("#homeScreenCounter").timer();
}

function onKeyboardShow(e) {
    setTimeout(function() { e.target.activeElement.scrollIntoViewIfNeeded() }, 500)
} //needed timeout to wait for viewport to resize  

function startWifigurator(element) {


    $("#loginBtn").attr('disabled', 'disabled')
    $("#loginBtn").text('Wait..')
    if (md.os() == 'AndroidOS') {

        if (RPIENDPOINT == "http://192.168.42.208") {

            callHostIp(function(data) {

                if (data.success) {
                    hostId = data.res.id
                        //ENDPOINT = protocol + data.res.svrId + port
                    getInterfaceList(data.res);
                } else {
                    myApp.alert('Not yet connected to the data hub')
                    $("#loginBtn").removeAttr('disabled')
                    $("#loginBtn").text('START')
                }
            })


        } else if (RPIENDPOINT == "http://raspberrypi.local") {



            callHostIp(function(data) {
                if (data.success) {
                    hostId = data.res.id
                    ENDPOINT = protocol + data.res.svrId + port
                    getInterfaceList(data.res);
                } else {
                    myApp.alert('Not yet connected to the Datahub')
                    $("#loginBtn").removeAttr('disabled')
                    $("#loginBtn").text('START')
                }
            })


        } else {

            window.location.href = 'home.html'

        }




    } else {

        if (RPIENDPOINT == "http://192.168.42.208") {

            callHostIp(function(data) {
                if (data.success) {
                    hostId = data.res.id
                    ENDPOINT = protocol + data.res.svrId + port
                    getInterfaceList(data.res);
                } else {
                    myApp.alert('Not yet connected to the data hub')
                    $("#loginBtn").removeAttr('disabled')
                    $("#loginBtn").text('START')
                }
            })


        } else if (RPIENDPOINT == "http://raspberrypi.local") {

            myApp.alert('Please ensure that you have connected the datahub with an Ethernet cable')

            callHostIp(function(data) {
                if (data.success) {
                    hostId = data.res.id
                    ENDPOINT = protocol + data.res.svrId + port
                    getInterfaceList(data.res);
                } else {
                    myApp.alert('Not yet connected to the Datahub')
                    $("#loginBtn").removeAttr('disabled')
                    $("#loginBtn").text('START')
                }
            })

        } else {

            myApp.modal({
                title: 'Join data hub',
                text: '<ol type="1"><li>Open Wi-Fi Settings</li><li>Wait for Prophecy data hub</li><li>Choose the Prophecy data hub</li><li>Enter password "Prophecy"</li><li>Switch back to this App</li></ol>',
                buttons: [{
                    text: 'Start',
                    onClick: function() {
                        //open wifi settings
                        /* cordova.plugins.diagnostic.switchToSettings(function(e) {
                             console.log('opened settings')
                         }, function(e) {
                             console.log(e)
                         });
                         */
                        myApp.closeModal()

                        //start wifi checker loop
                        startWifiChecker(function() {

                            callHostIp(function(data) {
                                if (data.success) {
                                    hostId = data.res.id
                                    ENDPOINT = protocol + data.res.svrId + port
                                    getInterfaceList(data.res);
                                } else {
                                    window.location.reload()
                                }
                            })

                        })

                    }
                }, {
                    text: 'Close',
                    onClick: function() {
                        $("#loginBtn").removeAttr('disabled')
                        $("#loginBtn").text('START')
                        myApp.closeModal()

                    }
                }]
            })

        }




    }
}

function startWifiChecker(cb) {

    var wificheckinterval = setInterval(function() {

        WifiWizard.getCurrentSSID(function(current) {
            current = current.replace(/"/g, "")
            console.log(current.substring(0, 15));



            if (current.substring(0, 8) == "Prophecy") {
                clearInterval(loopwtch);

                console.log("found = " + current);
                //  $('#statsDiv').html('');
                $('#statsDiv').html('Connected to ' + currentSSID);
                currentSSID = current;
                clearInterval(wificheckinterval)
                cb()

            }

        }, function() {
            window.location.reload()
        });

    }, 5000)

}

function checkIfUsbConnected(cb) {
    callHostIp(function(data) {
        if (data.success) {

            cb(true)
        } else {
            cb(false)
        }
    })

}

function selectMode() {

    myApp.modal({
        title: 'Select Mode',
        text: 'Please choose between USB or Wi-Fi Mode',
        buttons: [{
            text: 'USB',
            onClick: function() {

                if (md.os() == "iOS") {

                    myApp.alert('USB mode not supported in this device')

                } else {

                    setRpiEndoint('http://192.168.42.208')

                    checkIfUsbConnected(function(yes) {

                        if (yes) {

                            startWifigurator()

                        } else {
                            myApp.alert('Please enable the usb tethering from the settings and switch back to the app')
                            $("#loginBtn").removeAttr('disabled')
                            $("#loginBtn").text('START')

                        }
                    })


                }



            }
        }, {
            text: 'Wi-Fi',
            onClick: function() {
                setRpiEndoint('http://10.0.0.1')
                myApp.closeModal()
                $("#loginBtn").removeAttr('disabled')
                $("#loginBtn").text('START')
            }
        }]
    })


}

function setRpiEndoint(url) {
    RPIENDPOINT = url
    window.localStorage.setItem('RPIURL', RPIENDPOINT)
    getRpiEndpoint()
}

function getRpiEndpoint() {

    RPIENDPOINT = window.localStorage.getItem('RPIURL') || 'http://192.168.42.208'


    if (mode == "DESKTOP") {
        RPIENDPOINT = "http://raspberrypi.local"
        $("#modeSelector").hide()
        $("#startNote1").hide()
        $("#startNote2").show()
    } else {

        if (RPIENDPOINT == "http://10.0.0.1") {
            $('#modeId').text('Wi-Fi')
        } else {
            $('#modeId').text('USB')
        }
        $("#modeSelector").show()
        $("#startNote1").show()
        $("#startNote2").hide()
    }






}


if (mainView.activePage.name == "index") {
    console.log('inbdex trigger')
    indexPage.trigger()
} else {
    console.log('ihome trigger')
    homePage.trigger()
}

function iOSVersion() {
    if (window.MSStream) {
        // There is some iOS in Windows Phone...
        // https://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
        return false;
    }
    var match = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/),
        version;

    if (match !== undefined && match !== null) {
        version = [
            parseInt(match[1], 10),
            parseInt(match[2], 10),
            parseInt(match[3] || 0, 10)
        ];
        return parseFloat(version.join('.'));
    }

    return false;
}

getRpiEndpoint()
