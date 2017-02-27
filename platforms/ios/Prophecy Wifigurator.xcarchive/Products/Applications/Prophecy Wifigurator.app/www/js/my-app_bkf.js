// Initialize your app
var myApp = new Framework7({
    modalTitle: 'HubInit',
    // Enable Material theme
    material: true, 
});


// Export selectors engine
var $$ = Dom7;

var currentSSID = ""
var loopwtch;
 
  var selectedWifi = [];
  
// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function (page) {
    // run createContentPage func after link was clicked
    $$('.create-page').on('click', function () {
        createContentPage();
    });
});

// Generate dynamic page
var dynamicPageIndex = 0;
function createContentPage() {
	mainView.router.loadContent(
        '<!-- Top Navbar-->' +
        '<div class="navbar">' +
        '  <div class="navbar-inner">' +
        '    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
        '    <div class="center sliding">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
        '  </div>' +
        '</div>' +
        '<div class="pages">' +
        '  <!-- Page, data-page contains page name-->' +
        '  <div data-page="dynamic-pages" class="page">' +
        '    <!-- Scrollable page content-->' +
        '    <div class="page-content">' +
        '      <div class="content-block">' +
        '        <div class="content-block-inner">' +
        '          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
        '          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
    );
	return;
}


var data =[]
//var data = [{"address":"70:62:b8:70:ad:f4","channel":9,"frequency":2.452,"mode":"master","quality":70,"signal":-17,"ssid":"ZREYAS-BLR-GTR-PRIMARY","security":"wpa2"},{"address":"24:1f:a0:8e:2c:a8","channel":6,"frequency":2.437,"mode":"master","quality":55,"signal":-55,"ssid":"\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00","security":"wpa2"},{"address":"0c:d2:b5:56:24:2c","channel":7,"frequency":2.442,"mode":"master","quality":48,"signal":-62,"ssid":"SkinandHair","security":"wpa"},{"address":"f8:e9:03:c3:de:20","channel":10,"frequency":2.457,"mode":"master","quality":29,"signal":-81,"ssid":"TechSparx","security":"wpa2"},{"address":"0c:d2:b5:4c:8a:60","channel":8,"frequency":2.447,"mode":"master","quality":24,"signal":-86,"ssid":"Jajesh","security":"wpa"},{"address":"0c:d2:b5:26:61:a0","channel":9,"frequency":2.452,"mode":"master","quality":23,"signal":-87,"ssid":"Deepa","security":"wpa2"},{"address":"0c:d2:b5:20:a1:6c","channel":11,"frequency":2.462,"mode":"master","quality":21,"signal":-89,"ssid":"Airtel2000","security":"wpa2"},{"address":"00:1e:40:14:ed:00","channel":1,"frequency":2.412,"mode":"master","quality":18,"signal":-92,"ssid":"DEVA","security":"wpa"},{"address":"48:ee:0c:96:6a:c4","channel":1,"frequency":2.412,"mode":"master","quality":18,"signal":-92,"ssid":"NIFTY","security":"wpa"},{"address":"bc:f6:85:4d:9b:97","channel":1,"frequency":2.412,"mode":"master","quality":16,"signal":-94,"ssid":"Karthik","security":"wpa2"}]

myApp.onPageInit('list', function (page) {
    
	//getRasphList();
});


myApp.onPageInit('index', function (page) {
     
//first make sure wifi is enabled, if not enable 
	console.log('INIT')
	setTimeout(function(){
		
		try{ checkWifiStat(); }catch(e){ console.log(e)}
		$('#rasbList').html('');
		loopwtch = setInterval(checkLoop,10000)
		
	},20000)
	
}).trigger();

function checkLoop()
{
	console.log('Checking Loop')
	 var onError = function(er){console.log(er)}

//check if already connected
	WifiWizard.getCurrentSSID(function(current){
		current = current.replace(/"/g,"")
		console.log(current.substring(0,15));

		if(current.substring(0,15) == "ProphecyGateway")
		{
			console.log("maytch = " + current);
			currentSSID = current;
			mainView.router.loadPage('list.html');
			
		//goto scan 
		//clear watch
			clearInterval(loopwtch);
		}

	}, onError);
//Scan for Surrounding Wifi
	WifiWizard.startScan(function(){console.log('Scan Started')},onError);
//Getting Scan results
	WifiWizard.getScanResults({}, function(networks){
		
			console.log(networks);
		$('#rasbList').html('');
		for(var i in networks){
		var current = networks[i].SSID
		current = current.replace(/"/g,"")
		
		if(current.substring(0,15) == "ProphecyGateway")
			{
			//Set the currentSSID 
			currentSSID = current
			
			var item ='<li><a href="#" onclick=\'connectToWifi(\"' + currentSSID + '\")\' class="item-link item-content"><div class="item-inner">'+
                       '<div class="item-title label">'+ currentSSID +'</div><div class="item-after"></div></div></a></li>';
					   
			 $('#rasbList').append(item); 

			//Add network to the list, with connectBtn onclick=connectToWifi(SSID)
			}


		}

	}, onError);
	
	 
}

function connectToWifi(SSID){
	var connection = WifiWizard.formatWPAConfig(SSID, "raspberry");
	WifiWizard.addNetwork(connection, function(){

				
				WifiWizard.connectNetwork(SSID, function(){

				 
					currentSSID = SSID
				 
				}, function(){

				//Switch to wifi setting if all else fails
					try{		
						cordova.plugins.diagnostic.switchToWifiSettings();
					}catch(e){
						cordova.plugins.diagnostic.switchToSettings();
					}


				});

	}, function(){

	//Switch to wifi setting if all else fails
		try{		
			cordova.plugins.diagnostic.switchToWifiSettings();
		}catch(e){
			cordova.plugins.diagnostic.switchToSettings();
		}


	});
	
	

}

function detlView(SSID)
{
	 mainView.router.loadPage('list.html');
}
function checkWifiStat()
{
		cordova.plugins.diagnostic.isWifiEnabled(function(enabled){
	  if(!enabled){
		try{
			cordova.plugins.diagnostic.setWifiState(function(){
					console.log("Wifi was enabled");
				}, function(error){
					console.error("The following error occurred: "+error);
				},true);
			}
		catch(e){
			console.log('Inside catch');
			try{		
				cordova.plugins.diagnostic.switchToWifiSettings();
			}catch(e){
				cordova.plugins.diagnostic.switchToSettings();
			}
		}
		} 
	},function(error){
		console.error("The following error occurred: "+error);
	});

	
	
}
function getRasphList(){ 

	 
		 	  	$.ajax({
                         url: 'http://10.0.0.1:2525',
						 type:"POST", 
						 data:JSON.stringify({action:'SCAN'}) 
                 }).done(function(res) { 
			 		
			        	console.log(res);
						try{ data = JSON.parse(res);	}catch(e){data = res}		 
						selectedWifi = [];
						$('#raspheryListHolder').html('');	
						var item =''; 
						 
						var size = data.length; 
						for (i = 0; i < size; i++) { 
		 
							item =  '<li><a href="javascript:void(0)" class="item-link">' +
										  '<div class="item-content">' +
											'<div class="item-inner">' + 
											'<div class="row"  style="width: 100%;">' +
													'<div class="col-30">' + data[i].ssid + '</div>' +
													'<div class="col-30">' + data[i].signal + '</div>' +
													'<div class="col-30">' + data[i].security + '</div>' +
													'<div class="col-10">' + 
													 '<label class="label-checkbox item-content">' + 
															'<input type="checkbox" name="wifiList[]"  value="'+ data[i].ssid +'" >' +
															'<div class="item-media">' + '<i class="icon icon-form-checkbox"></i>' + '</div>' + 
													 '</label>' +
													 '</div>' + 
													'</div>' +
											'</div></div></a>' +
										  '</li>'  
								 $("#raspheryListHolder").append(item);		  
				} 
			  }).fail(function(){  
								console.log('Ajax Failed'); 
						  }); 
			 
}
function addWifiList()
{
 
		$(' input[type="checkbox"]').each(function() {
        if ($(this).is(":checked")) {
             selectedWifi.push(this.value);
		//	 console.log(this.value)
        }
    });
	console.log(selectedWifi);
	mainView.router.loadPage('add.html')	
}
 
var frmCnt =0;
myApp.onPageInit('add', function (page) {
 
	addRasphList();
});



function addRasphList(){
	
	var item ='';	 
	var styl;	 
	var size = data.length; 
	var raspSize = selectedWifi.length;
	frmCnt =0;
	for (var i = 0; i < size; i++) { 
		for (var j = 0; j < raspSize; j++) { 
			
			     console.log(data[i].ssid)
		 		 console.log(selectedWifi[j])
				  if(data[i].security=="open"){ styl ="style='display: none'";  }else { styl ="style='display: block'"; } 

				if(data[i].ssid==selectedWifi[j]){  
			 
					item =  '<div class="card">'+
							  '<div class="card-content">'+
								'<div class="card-content-inner">'+ 
								  '<form id="addfrm_'+frmCnt+'"">' +
									'<div class="list-block">'+
									  '<ul>'+
										'<li>'+
										  '<div class="item-content">'+ 
											'<div class="item-inner">'+
											  '<div class="item-title label">SSID </div>'+
											  '<div class="item-input">'+
												 data[i].ssid  +
											  '</div>' +
											  '<input type="hidden" name="rasp_ssid_"'+ i +'  value="'+ data[i].ssid +'">' +
											  '<input type="hidden" name="rasp_security_"'+ i +'  value="'+ data[i].security +'">' +
											'</div>' +
										  '</div>'+
										'</li>'+
										'<li>'+
										  '<div class="item-content">'+ 
											'<div class="item-inner">'+
											  '<div class="item-title label">SIGNAL </div>'+
											  '<div class="item-input">'+
												 data[i].signal  +
											  '</div>' +
											'</div>' +
										  '</div>'+
										'</li>'+
										'<li>'+
										  '<div class="item-content">'+ 
											'<div class="item-inner">'+
											  '<div class="item-title label">SECURITY </div>'+
											  '<div class="item-input">'+
												 data[i].security  +
											  '</div>' +
											'</div>' +
										  '</div>'+
										'</li>'+
										'<li>'+
										  '<div class="item-content">'+ 
											'<div class="item-inner">'+
											  '<div class="item-title label">QUALITY </div>'+
											  '<div class="item-input">'+
												  data[i].quality  +
											  '</div>' +
											'</div>' +
										  '</div>'+
										'</li>'+
										'<li>'+
										  '<div class="item-content">'+ 
											'<div class="item-inner">'+
											  '<div class="item-title label">MODE </div>'+
											  '<div class="item-input">'+
												 data[i].mode +
											  '</div>' +
											'</div>' +
										  '</div>'+
										'</li>'+
										'<li>'+
										  '<div class="item-content">'+ 
											'<div class="item-inner">'+
											  '<div class="item-title label">FREQUENCY </div>'+
											  '<div class="item-input">'+
												data[i].frequency +
											  '</div>' +
											'</div>' +
										  '</div>'+
										'</li>'+
										'<li>'+
										  '<div class="item-content">'+ 
											'<div class="item-inner">'+
											  '<div class="item-title label">CHANNEL </div>'+
											  '<div class="item-input">'+
												data[i].channel +
											  '</div>' +
											'</div>' +
										  '</div>'+
										'</li>'+
										'<li>'+
										  '<div class="item-content">'+ 
											'<div class="item-inner">'+
											  '<div class="item-title label">ADDRESS </div>'+
											  '<div class="item-input">'+
												data[i].address +
											  '</div>' +
											'</div>' +
										  '</div>'+
										'</li>'+
										'<li>'+
										  '<div class="item-content" '+ styl +'>'+ 
											'<div class="item-inner">'+
											  '<div class="item-title label">Password</div>'+
											  '<div class="item-input">'+
												'<input type="password" name="wifiPass"    placeholder="password">'+
											  '</div>'+
											'</div>'+
										  '</div>'+
										'</li>'+ 
										'<li>'+
										  '<div class="item-content">'+ 
											'<div class="item-inner">'+
											  '<div class="item-title label">Priority</div>'+
											  '<div class="item-input">'+
												'<input type="text" name="wifiPriority"      placeholder="priority">'+
											  '</div>' +
											'</div>' +
										  '</div>' +
										'</li>' +
									  '</ul>' +
									'</div>' + 
									'</form>' +
								'</div>' +
							  '</div>' +
						'</div>'; 
					
					$("#wifiAddBlock").append(item);
					frmCnt++;
			 }
		  else{
			//  console.log('Elements not matched');
		  }
		}
	} 
	 selectedWifi = [];
	// selCnt = 0;	  // reset counter
	 
}
function sendToServer()
{   	

	$('#postBtn').attr("disabled", true);
	 var errFlag=false;
	 var inputData =[];  
	 for(var k=0;k<frmCnt;k++){
		 var datastring = $('#addfrm_'+k).serializeObject();  
		 inputData.push(datastring);  
	  }
 
	  
		 for(var k=0;k<frmCnt;k++){ 
			 
		  if(((inputData[k].rasp_security_=='') ||(inputData[k].rasp_security_=='open'))){ 
		
				 inputData[k].wifiPass=='' 
				 
				
			 }else{  
				  var temPass = inputData[k].wifiPass;
				  var len = temPass.length;
				  if(len<8){
					  errFlag = true; 
					  myApp.alert('',"Password is too small!");
					  return;
					//  document.getElementById("mytext").focus();
				  }
			 } 
		 } 
	
		if(errFlag){ 
		
			myApp.alert('Password cannot be blank'); 
	    	//	  $("#wifiPass"+k).focus(); 	
			
		}else{ 
				$.ajax({
                         url: 'http://10.0.0.1:2525/',
						 type:"POST", 
						 data:JSON.stringify({action:'ADD',data:inputData}) 
						 
              }).done(function(data) {
				 console.log(data);
				var res = JSON.parse(data);	
				
					if(res.status){
						mainView.router.loadPage('index.html')	
					}else{
						
						 myApp.alert('Network Error Encountered'); 
					} 
						$("#postBtn").removeAttr('disabled');					
					}).fail(function(){  
								console.log('Ajax Failed'); 
								$("#postBtn").removeAttr('disabled');
			 });  
		}
 		 
}

(function($){
    $.fn.serializeObject = function(){

        var self = this,
            json = {},
            push_counters = {},
            patterns = {
                "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
                "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
                "push":     /^$/,
                "fixed":    /^\d+$/,
                "named":    /^[a-zA-Z0-9_]+$/
            };


        this.build = function(base, key, value){
            base[key] = value;
            return base;
        };

        this.push_counter = function(key){
            if(push_counters[key] === undefined){
                push_counters[key] = 0;
            }
            return push_counters[key]++;
        };

        $.each($(this).serializeArray(), function(){

            // skip invalid keys
            if(!patterns.validate.test(this.name)){
                return;
            }

            var k,
                keys = this.name.match(patterns.key),
                merge = this.value,
                reverse_key = this.name;

            while((k = keys.pop()) !== undefined){

                // adjust reverse_key
                reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

                // push
                if(k.match(patterns.push)){
                    merge = self.build([], self.push_counter(reverse_key), merge);
                }

                // fixed
                else if(k.match(patterns.fixed)){
                    merge = self.build([], k, merge);
                }

                // named
                else if(k.match(patterns.named)){
                    merge = self.build({}, k, merge);
                }
            }

            json = $.extend(true, json, merge);
        });

        return json;
    };
})(jQuery);