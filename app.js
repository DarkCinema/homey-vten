"use strict";
module.exports.init = init;
const xml2js = require('xml2js');
const http = require('http');
var command= 'menu';
var actualinput2 = "KODI";
var inputs = [];
var parseString = require('xml2js').parseString;
var jsonresult = ''
var item;
var subItem;
var returnValue = 0;
var RemotePowerCodes = [
	{
        "name": "Power",
        "value": "power"
    },
    {
        "name": "Suspend",
        "value": "suspend"
    }
];

var RemoteNavigationCodes = [
    {
        "name": "Arrow Up",
        "value": "up"
    },
    {
        "name": "Arrow Down",
        "value": "down"
    },
    {
        "name": "Arrow Left",
        "value": "left"
    },
    {
        "name": "Arrow Right",
        "value": "right"
    },
	{
        "name": "Enter",
        "value": "enter"
    },
	{
        "name": "Pageup",
        "value": "pageup"
    },
	{
        "name": "Pagedown",
        "value": "pagedown"
    },
	{
        "name": "Setup",    
        "value": "setup"
    },
	{
        "name": "TVmode",
        "value": "tvmode"
    },
	{
        "name": "Source",
        "value": "source"
    },
	{
        "name": "Return",
        "value": "return"
    },
	{
        "name": "Home",
        "value": "home"
    },
	{
        "name": "Menu",
        "value": "menu"
    }

];

var RemotePlayerCodes = [
	{
        "name": "Title",
        "value": "title"
    },
	{
        "name": "Info",
        "value": "info"
    },
	{
        "name": "Audio",
        "value": "audio"
    },
	{
        "name": "Subtitle",
        "value": "subtitle"
    },
	{
        "name": "Angle",
        "value": "angle"
    },
	{
        "name": "Play",
        "value": "play"
    },
	{
        "name": "Stop",
        "value": "stop"
    },
	{
        "name": "Pause",
        "value": "pause"
    },
	{
        "name": "Eject",
        "value": "eject"
    },
		{
        "name": "Rewind",
        "value": "rewind"
    },
		{
        "name": "Forward",
        "value": "fwd"
    },
		{
        "name": "Slow",
        "value": "slow"
    },
		{
        "name": "Repeat",
        "value": "repeat"
    },
		{
        "name": "Previous",
        "value": "prev"
    },
		{
        "name": "Next",
        "value": "next"
    },
		{
        "name": "Mute",
        "value": "mute"
    },
	{
        "name": "Zoom",
        "value": "zoom"
    }    
]


//////////////////////////////////////////
//Setings.

var VTEN = {
	ip: "172.19.3.203",
	port: 8008
};

function init() {
	Homey.log("Starting init VTEN Commandtool");
	Homey.manager('flow').on('action.SetPower', function (callback, args) {
	command = command.value;
	VTEN_connect (VTEN);
	callback(null, true);
	});
	Homey.manager('flow').on('action.SetPower.PowerCommand.autocomplete', function (callback, value) {
    var commandSearchString = value.query;
    var items = searchItems(commandSearchString, RemotePowerCodes);
    callback(null, items);
	});
	Homey.manager('flow').on('action.SetNavigation', function (callback, args) {
	command = command.value;
	VTEN_connect (VTEN);
	callback(null, true);
	});
	Homey.manager('flow').on('action.SetNavigation.NavigationCommand.autocomplete', function (callback, value) {
    var commandSearchString = value.query;
    var items = searchItems(commandSearchString, RemoteNavigationCodes);
    callback(null, items);
	});
	Homey.manager('flow').on('action.SetPlayer', function (callback, args) {
	command = command.value;
	VTEN_connect (VTEN);
	callback(null, true);
	});
	Homey.manager('flow').on('action.SetPlayer.PlayerCommand.autocomplete', function (callback, value) {
    var commandSearchString = value.query;
    var items = searchItems(commandSearchString, RemotePlayerCodes);
    callback(null, items);
	});

}

/////////////////////////////////////////
//FUNCTIONS

//BEGIN Function SearchItems
function searchItems(value, optionsArray) {

    var serveItems = [];
    for (var i = 0; i < optionsArray.length; i++) {
        var serveItem = optionsArray[i];
        if (serveItem.name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
            serveItems.push(serveItem = optionsArray[i]);
        }
    }
    return serveItems;
}
//END Function SearchItems


function VTEN_connect(VTEN) {
	VTEN_command(VTEN);
}

function VTEN_command(VTEN) {
	var options = {
		hostname: VTEN.ip,
		port: VTEN.port,
		path: '/system?arg0=send_key&arg1='+command,
		method: 'GET',
		headers: {'Content-Type': 'application/json'}
	};
	var receivedData = '';
	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (body) {
			receivedData = receivedData + body;
		});
		res.on('end', function () {
			receivedData = cleanhtmldata(receivedData);
			//console.log ('Received data: ' + jsonresult);
			console.log ("ReturnValue: " +returnValue);		
		});
	});
	req.on('error', function(e) { console.log('problem with request: ' + e.message); });
	req.end();
}

//BEGIN Function Clean HTML Data
function cleanhtmldata(data) {
	parseString(data, function (err, result) {
		jsonresult = JSON.stringify(result);
		//jsonresult = jsonresult.replace(/\u005B/g,"");
		//jsonresult = jsonresult.replace(/\u005D/g,"");
		var jsonContent = JSON.parse(jsonresult);
		//console.log("ReturnCode:", jsonContent.theDavidBox);
   		 var jsonContent = jsonContent.theDavidBox;
		 delete jsonContent['request'];
   			 for(var exKey in jsonContent) {
    			  //console.log("key:"+exKey+", value:"+jsonContent[exKey]);
				  //console.log("ReturnValue: " +jsonContent.returnValue);
				  returnValue =  jsonContent.returnValue; 
			 }
    
   	 });

	return data;
}
//END Function Clean HTML Data




//BEGIN Function Get Label
function get_label_by_name (name){
	for (var i in inputs){
		if (inputs[i].name === name) { return inputs[i].label;}
	}
}
//END Function Get Label

//BEGIN Function HOMEY System Token Set
function homey_system_token_set(token_id, token_name, token_type, token_value){
	Homey.manager('flow').unregisterToken(token_id);
	Homey.manager('flow').registerToken(token_id, {
		type: token_type, 
		title: token_name
	}, function (err, token) {
		if (err) return console.error('registerToken error:', err);
		token.setValue(token_value, function (err) {
			if (err) return console.error('setValue error:', err);
				});
	});
}
//END Function HOMEY System Token Set

