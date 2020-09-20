var ID = "MINIPI-001";
//var base_url = "http://192.168.0.106/github/solsitec/privado/sos/sos_clinica";
// var base_url = "https://clinica2.grupososperu.com";
// var base_url = "http://25.9.129.112:8080/sos_clinica";
//var base_url = "http://192.168.0.110/github/solsitec/privado/sos/sos_clinica";
//var base_url = "http://http://192.168.100.250:8080/sos_clinica/";
var base_url = "http://localhost/sos_clinica";
// http://192.168.0.103/sos_clinica/controller/pi/asistenteController.php?action=registrosXdia
var rest = require('restler');

var Cvlc    = require('cvlc'),
    file    = __dirname + '/ubuntu-login.ogg',
    Fn      = __Protoblast.Bound.Function,
    fs      = require('fs');

	var player = new Cvlc();
//RealTime
const WebSocket = require('ws');
var reconnectInterval = 3000; // 3seg
var ws_init = false;
var ws;
var activeSpeaker = false;
var connect = function(){
	console.log("running...")
	// var ws = new WebSocket('ws://192.168.0.102:3000');

	// RealTime
    // ws = new WebSocket('ws://68.66.235.210:3000');
     //ws = new WebSocket('wss://ltws.herokuapp.com');
    // ws = new WebSocket('ws://25.9.129.112:3000');
     ws = new WebSocket('ws://107.180.51.37:8585');
		//ws = new WebSocket('ws://192.168.100.250:3000');
		// ws = new WebSocket('ws://ltws.herokuapp.com');
	ws.on('open', function() {
            ws_init = true;
	    console.log('socket open client');
	    // ws.send(JSON.stringify(obj_send));
	});
	ws.on('message', function incoming(data) {
		console.log(data);

	  ws_json = JSON.parse(data);
	  console.log(ws_json)
		switch( ws_json.action ){
			case 'toSpeech':
			
				// player.play("http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q="+encodeURIComponent(ws_json.text)+"&tl=es", function(){
				audiolink = "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q="+encodeURIComponent(ws_json.text)+"&tl=es-PE";
				// console.log(audiolink);
				player.play(audiolink, function(){
					console.log("Speaking... '"+ws_json.text+"'")
				});
				break;
			case 'test_sound':
			//if (activeSpeaker) {
				//  player.destroy();
			// 	console.log("Sound Testing cancelled")
			// 	activeSpeaker = false;
			//} else {
			//  player.play("/root/ALERTA1.wav", function(){
			//    console.log("Speaking... ALERTA1.wav");
			//    activeSpeaker = true;
			//  });
			//}
			player.play("/root/ALERTA1.wav", function startedLocalFile(){
				console.log("Speaking... ALERTA1.wav");
			});
					break;
			case 'stop':
			//MESSAGE = "Aviso: en 5 min comienza su siguiente AtenciÃ³n, Asunto: ";
			//player.play("http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q="+encodeURIComponent(MESSAGE)+"&tl=es", function startedLocalFile(){
			//   console.log("Speaking... mensaje");
			// });
			player.destroy();
			console.log("Sound Testing cancelled")
			Cvlc   = require('cvlc'),
			player = new Cvlc(),
			fs     = require('fs');
			break;
	  	}
	});
	ws.on('error', function() {
	    console.log('socket error');
	    // how do I reconnect to the ws after x minutes here?
	});
	ws.on('close', function() {
	    console.log('socket close');
	    // how do I reconnect to the ws after x minutes here?
	    setTimeout(connect, reconnectInterval);
	});

}
connect();

//verification calendar
var MESSAGE;
function verificationCalendar(){
	rest.post(base_url+'/controller/pi/asistenteController.php', {
	  data: { 
	  	action: 'registrosXdia' 
	  },
	}).on('complete', function(data, response) {
	  if (data instanceof Error) {
	    console.log('Error:', data.message);
	    return;
	    // this.retry(5000); // try again after 5 sec
	  }
	  if (response.statusCode == 200) {
	    // you can get at the raw response like this...
	    console.log(data);
	    json = JSON.parse(data);
	    if(json.length==0){
	    	console.log("No hay registros en espera");
	    	return;
	    }

	    alias = json.us_alias.replace("Dra.", "Doctora");
        alias = alias.replace("Dr.", "Doctor");
	    MESSAGE = "Aviso:. "+alias+" en 5 min comienza su siguiente AtenciÃ³n, Asunto: "+json.cme_titulo;
	    console.log(data);
	    player.play("http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q="+encodeURIComponent(MESSAGE)+"&tl=es", function(){
			console.log("Speaking... '"+MESSAGE+"'")
			rest.post(base_url+'/controller/pi/asistenteController.php', {
			  data: { 
			  	action: 'setConfirmVoiceCita' 
			  	,idcme: json.id_cita_medica
			  },
			}).on('complete', function(data2, response2) {
				json2 = JSON.parse(data2);
				console.log(json2);
			});

		});
	  }
	});
}

function pingToClinica(){
	ws.send(JSON.stringify({action:"asispi_status",token:"8HCCGwgu9akycHbx",id: ID, state:1}))
}
// init service
setInterval(function(){
	verificationCalendar();
},15000);

setInterval(function(){
	if(ws_init){
          pingToClinica()
        }
},2000)

