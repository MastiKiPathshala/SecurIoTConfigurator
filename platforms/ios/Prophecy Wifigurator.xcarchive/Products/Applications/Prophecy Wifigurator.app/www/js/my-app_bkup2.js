// Initialize your app
var myApp = new Framework7({
    modalTitle: 'Prophecy Wifigurator',
    // Enable Material theme
    material: false,
});


// Export selectors engine
var $$ = Dom7;
var popupFlg = false;

var currentSSID = ""
var loopwtch;
var hostId = '';

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



var data = []
    //var data = [{"address":"70:62:b8:70:ad:f4","channel":9,"frequency":2.452,"mode":"master","quality":70,"signal":-17,"ssid":"ZREYAS-BLR-GTR-PRIMARY","security":"wpa2"},{"address":"24:1f:a0:8e:2c:a8","channel":6,"frequency":2.437,"mode":"master","quality":55,"signal":-55,"ssid":"\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00","security":"wpa2"},{"address":"0c:d2:b5:56:24:2c","channel":7,"frequency":2.442,"mode":"master","quality":48,"signal":-62,"ssid":"SkinandHair","security":"wpa"},{"address":"f8:e9:03:c3:de:20","channel":10,"frequency":2.457,"mode":"master","quality":29,"signal":-81,"ssid":"TechSparx","security":"wpa2"},{"address":"0c:d2:b5:4c:8a:60","channel":8,"frequency":2.447,"mode":"master","quality":24,"signal":-86,"ssid":"Jajesh","security":"wpa"},{"address":"0c:d2:b5:26:61:a0","channel":9,"frequency":2.452,"mode":"master","quality":23,"signal":-87,"ssid":"Deepa","security":"wpa2"},{"address":"0c:d2:b5:20:a1:6c","channel":11,"frequency":2.462,"mode":"master","quality":21,"signal":-89,"ssid":"Airtel2000","security":"wpa2"},{"address":"00:1e:40:14:ed:00","channel":1,"frequency":2.412,"mode":"master","quality":18,"signal":-92,"ssid":"DEVA","security":"wpa"},{"address":"48:ee:0c:96:6a:c4","channel":1,"frequency":2.412,"mode":"master","quality":18,"signal":-92,"ssid":"NIFTY","security":"wpa"},{"address":"bc:f6:85:4d:9b:97","channel":1,"frequency":2.412,"mode":"master","quality":16,"signal":-94,"ssid":"Karthik","security":"wpa2"}]

myApp.onPageInit('list', function(page) {
    //$('#statsDiv').html('');
    //getRasphList();

    clearInterval(loopwtch);
    $('#statsDiv').html('Connected to ' + currentSSID);

});

var loaderimg = '<svg width="80px" height="80px" xmlns="img/loaderimg1.svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="uil-ring-alt"><rect x="0" y="0" width="50" height="50" fill="none" class="bk"></rect><circle cx="50" cy="50" r="40" stroke="rgba(0,0,0,0)" fill="none" stroke-width="10" stroke-linecap="round"></circle><circle cx="50" cy="50" r="40" stroke="#585858" fill="none" stroke-width="6" stroke-linecap="round"><animate attributeName="stroke-dashoffset" dur="2s" repeatCount="indefinite" from="0" to="502"></animate><animate attributeName="stroke-dasharray" dur="2s" repeatCount="indefinite" values="150.6 100.4;1 250;150.6 100.4"></animate></circle></svg>';

var popupHTML = '<div class="popup">' +
    '<div class="content-block">' +
    '<div class="col-25 col-dark">' +
    '<p><center><h3>Waiting for IP address</h3></center></p>' +
    '<center>' + loaderimg + '</center>' +
    '</div>' +
    '<p class="buttons-row">' +
    '<a href="javascript:void(0)" onclick="closPopup()" id="canclBtn" class="button active close-popup">Close</a>' +
    '</p>' +
    '</div>' +
    '</div>';


myApp.onPageInit('index', function(page) {

    var APP_VERSION = '1.0.0.7';
    var APP_RELEASE = "VERSION";

    currentSSID = ''

    try {

        $('#verId').text(APP_VERSION);
    } catch (e) {

    }


    //first make sure wifi is enabled, if not enable 
    console.log('INIT')
    $('#statsDiv').html('');
    $('#hostBtn').off("click").click(startHost)

    startScan();
    setTimeout(function() {


        $('#rasbList').html('');
        stopScan();

    }, 120000)

}).trigger();



function stopScan() {
    clearInterval(loopwtch);
    if (mainView.activePage.name == 'index') $('#rescanBtn').show();
}

function startScan() {
    loopwtch = setInterval(checkLoop, 10000);
    $('#rescanBtn').hide();
}

myApp.onPageInit('staticNetwork', function(page) {

    clearInterval(loopwtch);
    $('#statsDiv').html('');
});




function isCurrentSSIDConnected(cb) {

    if (currentSSID != '') cb(true)
    else cb(false)

}

function checkLoop() {


    console.log('Checking Loop')
    var onError = function(er) {
        console.log(er);
        $('#statsDiv').html('Error Encountered');
    }


    $('#statsDiv').html('Scanning..');

    cordova.plugins.hotspot.getAllHotspotDevices(function(networks) {
        console.log(networks)
        $('#rasbList').html('');
        for (var i in networks) {
            $('#statsDiv').html('Found: ' + networks[i].ip);
            $.ajax({
                url: 'http://' + networks[i].ip + ':2525',
                method: 'POST',
                data: JSON.stringify({ action: 'STATUS' }),
                async: false,
                ip: networks[i].ip,
                timeout: 10000
            }).done(function(res) {
                console.log(res)
                res = JSON.parse(res)
                var hostname = res.id
                console.log('Found rpi ' + hostname + ' ip ' + this.ip)
                var item = '<li><a href="#" onclick=\'connectToWifi(\"' + this.ip + '\")\' class="item-content"><div class="item-inner">' +
                    hostname + '<small>(' + this.ip + ')</small>' + '<div class="item-after"></div></div></a></li>';
                $('#rasbList').append(item);
                $('#statsDiv').html('Gateways Found');
            })
        }
    }, onError)
}

function connectToWifi(SSID) {
    $('#statsDiv').html('Connecting Gateway ' + SSID);

    currentSSID = SSID
    stopScan()

    mainView.router.loadPage('list.html');


}

function detlView(SSID) {
    $('#statsDiv').html('');
    mainView.router.loadPage('list.html');
}



function getRasphList() {

    console.log('Getting list')
    $('#scanBtn').attr('disabled', 'disabled')
    $('#scanBtn').text('Scanning..')
    $('#statsDiv').html('Scanning For WIFI Networks ');
    isCurrentSSIDConnected(function(isConnected) {

        //just get nd save the id via status

        callHostIp();

        if (isConnected) {

            $.ajax({
                url: 'http://' + currentSSID + ':2525',
                type: "POST",
                data: JSON.stringify({ action: 'SCAN' })
            }).done(function(res) {

                $('#scanBtn').removeAttr('disabled')
                $('#scanBtn').text('SCAN')
                console.log(res);
                try { data = JSON.parse(res); } catch (e) { data = res }


                selectedWifi = [];
                $('#raspheryListHolder').html('');
                var item = '';
                data = getUnique(data);

                var size = data.length;
                for (i = 0; i < size; i++) {

                    if (data[i].quality < 50) {

                        bgStyl = 'style="border-style: solid;border-color: #ff0000 #ff0000"';

                    } else {
                        bgStyl = "";

                    }

                    var tempSid = data[i].ssid;
                    if (tempSid.substring(0, 8) != "Prophecy" && parseInt(data[i].frequency) < 5 && !matchStr(tempSid)) {

                        item = '<li>' +
                            '<label class="label-checkbox item-content">' +
                            '<div class="item-inner" ' + bgStyl + ' >' +
                            '<div class="row"  style="width: 100%;">' +
                            '<div class="col-30">' + data[i].ssid + '</div>' +
                            '<div class="col-30">' + data[i].signal + '</div>' +
                            '<div class="col-30">' + data[i].security + '</div>' +
                            '</div></div>' +

                            '<input type="checkbox" name="wifiList[]"  value="' + data[i].ssid + '" >' +
                            '<div class="item-media">' + '<i class="icon icon-form-checkbox"></i>' + '</div>' +



                            '</label>' +
                            '</li>'
                        $("#raspheryListHolder").append(item);
                    }
                }

            }).fail(function() {

                myApp.alert('Restart Gateway')
                console.log('Ajax Failed');
                $('#scanBtn').removeAttr('disabled')
                $('#scanBtn').text('SCAN')
            });

        } else {


            myApp.alert('Connection Lost')
            disconnectWifi();
            mainView.router.loadPage('index.html')
            $('#scanBtn').removeAttr('disabled')
            $('#scanBtn').text('SCAN')

        }

    })


}

function callHostIp() {

    $.ajax({
        url: 'http://' + currentSSID + ':2525',
        type: "POST",
        data: JSON.stringify({ action: 'STATUS' })
    }).done(function(res) {

        console.log(res);
        res = JSON.parse(res);
        //      res = {"status":true,"id":raspberrypib8:27:eb:37:06:be};
        hostId = res.id;
        console.log('Host Id ' + hostId);

    }).fail(function() {

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
                    '<div class="item-input">' +
                    data[i].ssid +
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
                    '<div class="item-input">' +
                    data[i].signal +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">SECURITY </div>' +
                    '<div class="item-input">' +
                    data[i].security +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">QUALITY </div>' +
                    '<div class="item-input">' +
                    data[i].quality +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">MODE </div>' +
                    '<div class="item-input">' +
                    data[i].mode +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">FREQUENCY </div>' +
                    '<div class="item-input">' +
                    data[i].frequency +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">CHANNEL </div>' +
                    '<div class="item-input">' +
                    data[i].channel +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">ADDRESS </div>' +
                    '<div class="item-input">' +
                    data[i].address +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li>' +
                    '<li>' +
                    '<div class="item-content" ' + styl + '>' +
                    '<div class="item-inner">' +
                    '<div class="item-title label">Password</div>' +
                    '<div class="item-input">' +
                    '<input type="password" name="wifiPass" size="16" id="wifiPass_' + cntr + '"   placeholder="password">' +
                    '<input onclick=\'toggleShowPassword("#showpswd_' + cntr + '","#wifiPass_' + cntr + '")\' id="showpswd_' + cntr + '" type="checkbox" />Show' +
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
    // selectedWifi = [];
    // selCnt = 0;    // reset counter

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

function sendToServer() {


    $("#postBtn").text('Saving..')

    $('#postBtn').attr("disabled", true);
    var errFlag = false;
    var inputData = [];
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
                myApp.alert('', "Password length is small");
                $('#postBtn').removeAttr("disabled");
                $("#postBtn").text('SAVE')
                return;
            }
        }
    }

    if (errFlag) {

        myApp.alert('Password cannot be blank');
        $('#postBtn').removeAttr("disabled");
        $("#postBtn").text('SAVE')

    } else {

        isCurrentSSIDConnected(function(isConnected) {

            if (isConnected) {

                console.log(isConnected);

                $.ajax({
                    url: 'http://' + currentSSID + ':2525',
                    type: "POST",
                    data: JSON.stringify({ action: 'ADD', data: inputData })

                }).done(function(data) {
                    console.log(data);
                    var res = JSON.parse(data);

                    if (res.status) {

                        disconnectWifi();
                        myApp.popup(popupHTML);
                        retries = 0;
                        setTimeout(function() { getIpAddress() }, 60 * 1000);


                    } else {
                        myApp.alert('Network Error Encountered');
                    }
                    $("#postBtn").removeAttr('disabled');
                    $("#postBtn").text('SAVE')
                }).fail(function() {
                    console.log('Ajax Failed');
                    $("#postBtn").removeAttr('disabled');
                    $("#postBtn").text('SAVE')
                });
            } else {
                myApp.alert('Connection Lost')
                $("#postBtn").removeAttr('disabled');
                $("#postBtn").text('SAVE')
                disconnectWifi();
                mainView.router.loadPage('index.html')
            }
        });
    }

}

function disconnectWifi() {

    try {
        //WifiWizard.disconnectNetwork(currentSSID, function(res) { console.log(res) }, function(e) { console.log(e) });
        //WifiWizard.removeNetwork(currentSSID, function(res) { console.log(res) }, function(e) { console.log(e) });

        stopHost()
        currentSSID = '';
    } catch (e) {
        console.log(e)
    }
}

function appendHidden() {
    myApp.closeModal();
    var id = $('#ssid').val();
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

                item = '<li><a href="javascript:void(0)" class="item-link">' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="row"  style="width: 100%;">' +
                    '<div class="col-30">' + data[i].ssid + '</div>' +
                    '<div class="col-30">' + data[i].signal + '</div>' +
                    '<div class="col-30">' + data[i].security + '</div>' +
                    '<div class="col-10">' +
                    '<label class="label-checkbox item-content">' +
                    '<input type="checkbox" name="wifiList[]"  value="' + data[i].ssid + '" >' +
                    '<div class="item-media">' + '<i class="icon icon-form-checkbox"></i>' + '</div>' +
                    '</label>' +
                    '</div>' +
                    '</div>' +
                    '</div></div></a>' +
                    '</li>'
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

function getIpAddress() {

    console.log('Host Id ' + hostId);

    $.ajax({
        url: 'http://104.130.225.224:8080/heartbeats/NW_Query?criterion=nw&param=id&q=' + hostId,
        type: "GET"


    }).done(function(res) {

        console.log(data);


        if (typeof res.data.NW_Info != "undefined") {

            var serverData = res.data.NW_Info.internalIP[0];

            if (typeof serverData == "undefined") serverData = 'Not Found';

            myApp.alert('New IP: ' + serverData, function() {

                myApp.closeModal(popupHTML);
                mainView.router.loadPage('index.html');
            });

        } else {

            retries++;
            if (retries <= 5) {
                setTimeout(function() { getIpAddress() }, 60000);
            } else {


                myApp.closeModal()
                myApp.alert('Failed to get IP');
                mainView.router.loadPage('index.html');

            }
        }

    }).fail(function() {
        retries++;
        if (retries <= 5) {
            setTimeout(function() { getIpAddress() }, 60000);
        } else {

            myApp.closeModal()
            myApp.alert('Failed to get IP');

            mainView.router.loadPage('index.html');

        }
    });
}

function closPopup() {
    myApp.closeModal(popupHTML);
    mainView.router.loadPage('index.html')
}

function debugMode() {
    mainView.router.loadPage('debug.html')
}

function checkUsb() {

    $.ajax({
        url: 'http://192.168.42.42:2525/',
        type: "POST",
        data: JSON.stringify({ action: 'CURRENT' })

    }).done(function(res) {

        console.log(res);
        var servResp = JSON.stringify(res);
        $('#servResp').html(servResp);
        //   myApp.alert(servResp);

    }).fail(function() {
        $('#servResp').html('Could not get details')

    });
}

function reBootUsb() {

    $.ajax({
        url: 'http://192.168.42.42:2525/',
        type: "POST",
        data: JSON.stringify({ action: 'REBOOT' })

    }).done(function(res) {

        console.log(res);
        myApp.alert(res);

    }).fail(function() {

    });
}

function goBack() {
    mainView.router.loadPage('index.html');

}

function statNetwork() {
    mainView.router.loadPage('staticNetwork.html');
}

function addStaticIp() {
    var address = $('#address').val();
    var netmask = $('#netmask').val();
    //  var network = $('#network').val();
    //  var broadcast = $('#broadcast').val(); 
    var gateway = $('#gateway').val();

    var postdata = {

        address: address,
        netmask: netmask,
        gateway: gateway
    };

    console.log(postdata);
    $.ajax({
        url: 'http://' + currentSSID + ':2525',
        type: "POST",
        data: JSON.stringify({ action: 'STATIC', data: postdata })
    }).done(function(res) {

        sendToServer();

    }).fail(function() {

        myApp.alert('Could Not Set Static IP');

    });

}

function addToServer() {

    if ($('#switchChkBox').prop('checked')) {

        validateStaticFrm();

    } else {
        sendToServer();
    }

}

function validateStaticFrm() {
    var errFlag = false;
    var address = $('#address').val();
    var netmask = $('#netmask').val();
    //  var network = $('#network').val();
    //  var broadcast = $('#broadcast').val(); 
    var gateway = $('#gateway').val();

    if (typeof address == "undefined" || address == "" || !testIpaddress(address)) {

        errFlag = true;
        myApp.alert('Error in IP Address');
    } else if (typeof netmask == "undefined" || netmask == "" || !testIpaddress(netmask)) {

        errFlag = true;
        myApp.alert('Error in Netmask');
    }
    /*
     else if(typeof network == "undefined" || network == "" || !testIpaddress(network)){

        errFlag = true; 
        myApp.alert('Network can not be blank');  
     } 
     else if(typeof broadcast == "undefined" || broadcast == "" || !testIpaddress(broadcast)){

        errFlag = true; 
        myApp.alert('Broadcast can not be blank');  
     } 
     */
    else if (typeof gateway == "undefined" || gateway == "" || !testIpaddress(gateway)) {

        errFlag = true;
        myApp.alert('Error in Gateway');
    }

    if (errFlag) {

        //  do nothing 

    } else {

        addStaticIp();
    }

}

function testIpaddress(ipaddress) {
    return (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))

}

function testPlugin(cb) {

    cordova.plugins.hotspot.isAvailable(function(available) {

        if (available) {

            cordova.plugins.hotspot.isWifiSupported(function(available2) {

                if (available2) {
                    cb(true)
                } else {
                    cb(false)
                    myApp.alert('Wifi Hostpot not supported')
                }


            }, function(e) {
                cb(false)
                myApp.alert('Wifi Hostpot not supported' + e)

            })

        } else {
            cb(false)
            myApp.alert('Wifi not available')
        }


    })
}


function startHost() {

    console.log('Starting host')
    $('#hostBtn').text('WAIT')
    $('#hostBtn').attr('disabled', 'disabled')

    testPlugin(function(ok) {

        if (ok) {

            cordova.plugins.hotspot.stopHotspot(function() {

                cordova.plugins.hotspot.createHotspot('ProphecyHost', 'WPA', 'raspberry', function() {

                    $('#hostBtn').text('STOP HOSTING')
                    $('#hostBtn').off("click").click(stopHost)
                    $('#hostBtn').removeAttr('disabled')

                }, function(err) {

                    myApp.alert('Failed to start host ' + err)
                    $('#hostBtn').removeAttr('disabled')
                    $('#hostBtn').text('HOST')
                })

            }, function(err) {

                console.log(err)
                myApp.alert('Could not start host ' + err)
                $('#hostBtn').removeAttr('disabled')
                $('#hostBtn').text('HOST')

            })
        } else {
            $('#hostBtn').removeAttr('disabled')
            $('#hostBtn').text('HOST')

        }


    })

}

function stopHost() {

    $('#hostBtn').attr('disabled', 'disabled')
    $('#hostBtn').text('WAIT')


    cordova.plugins.hotspot.stopHotspot(function() {

        $('#hostBtn').text('HOST')
        $('#hostBtn').off("click").click(startHost)

        $('#hostBtn').removeAttr('disabled')

        cordova.plugins.hotspot.toggleWifi(function() {
            console.log('Switched on wifi')

        }, function(e) {
            console.log(e)
        })




    }, function(err) {

        myApp.alert('Failed to start host ' + err)
        $('#hostBtn').text('STOP HOSTING')
        $('#hostBtn').removeAttr('disabled')

    })


}
