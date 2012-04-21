var progID = 'tweettile';
var debug = true;

var saved = false;
var userName;

var window_w = window.innerWidth;
var window_h = window.innerHeight;

var tile_w;
var tile_h;

var num_t_x = 3;
var num_t_y = 5;
var num_tiles = num_t_x * num_t_y;
var margin = 10;
var padding = 15;

var min_w = 200;
var min_h = 100;

var fontSize = 15;

var id_list = null;

var tile = new Array();

function mydebug(msg){
	if(debug)
		console.log(msg);
}
function keys(object) {
	var results = [];
	for (var property in object){
		results.push(property);
	}
	return results;
}
function setSize(){
}

function initial(){
	userName = 'sasakitoshinao';
	var aSplit1 = location.search.split("?");
	if( aSplit1.length >= 2 ){
		userName = aSplit1[1];
	}
	clearCache();
	makeTiles();
	var ad = $('#fc2_footer');
	if(ad) ad.remove();
}

function makeTiles(){
	for(var i=0;i<num_t_x;i++){
		for(var j=0;j<num_t_y;j++){
			 $('div#main').append('<div class="tile" id="t'+(i+j*num_t_x)+'"><div class="tile_inside" id="tin'+(i+j*num_t_x)+'"></div></div>');
			 tile[i+j*num_t_x] = $('#t'+(i+j*num_t_x),'div#main');
		}
	}
	retile();
	loadTweets();
}


$(window).bind('load', initial);

$(window).bind('resize',function(){
	window_w = window.innerWidth;
	window_h = window.innerHeight;
	retile();
});

function retile(){
	tile_w = Math.floor((window_w - margin*(num_t_x+1))/num_t_x);
	tile_h = Math.floor((window_h - margin*(num_t_y+1))/num_t_y);
	for(var i=0;i<num_t_x;i++){
		for(var j=0;j<num_t_y;j++){
			$('#t'+(i+j*num_t_x),'div#main').css({width:''+tile_w+'px', height:''+tile_h+'px',
			left:i*(tile_w+margin)+margin,top:j*(tile_h+margin)+margin});
		}
	}
	fontSize = Math.round(Math.sqrt((tile_w-padding*2)*(tile_h-padding*2)/140)*0.7);
	padding = fontSize/2;
	$('.tile').css('font-size',fontSize);
	$('.tile_inside').css('padding',padding);
}

function tweetShown(json){
	//stub
	return false;
}

function showTweets(json){
	if(json.length<num_tiles)
		null.error();
	for(var j=0;j<num_tiles;j++){
		var tw_i;
		do{
			tw_i = Math.round(Math.random()*json.length);
		}while(tweetShown(json[tw_i]));
		tile[j].children('.tile_inside').text(json[tw_i].text + ' ('+json[tw_i].retweet_count+' RT)');
		var color = getColor(json[tw_i].retweet_count, json[tw_i].favourites_count);
		tile[j].css('border-color',color[0]);
		tile[j].css('background-color',color[1]);
		tile[j].css('-webkit-transition-delay','0s');
		tile[j].css('filter','Alpha(opacity=1)');
		tile[j].css('opacity','1');
		setTimeout("switchTimeout("+j+");",calcDispTime(json[tw_i]));
	}
}

function　switchTimeout(index){
	var id = id_list[Math.floor(Math.random()*id_list.length)];
	var json = JSON.parse(localStorage[progID+':'+id]);
	switchTile(json,index);
}

function switchTile(tw_new,index){
	tile[index].css('-webkit-transition-delay','0s');
	tile[index].css('filter','Alpha(opacity=0)');
	tile[index].css('opacity','0');
	tile[index].attr('id','to'+index);
	setTimeout(function(){
		$('#to'+index).remove();
	},3000);
	var i = index % num_t_x;
	var j = Math.floor(index/num_t_x);
	$('div#main').append('<div class="tile" id="t'+index+'"><div class="tile_inside"></div></div>');
	tile[index] = $('#t'+index,'div#main');
	$('#t'+(i+j*num_t_x),'div#main').css({width:''+tile_w+'px', height:''+tile_h+'px',
	left:i*(tile_w+margin)+margin,top:j*(tile_h+margin)+margin});
	tile[index].children('.tile_inside').text(tw_new.text + ' ('+tw_new.retweet_count+' RT)');
	var color = getColor(tw_new.retweet_count, tw_new.favourites_count);
	tile[index].css('border-color',color[0]);
 	tile[index].css('background-color',color[1]);
	setTimeout("tile["+index+"].css('-webkit-transition-delay','3s');"
	+"tile["+index+"].css('filter','Alpha(opacity=1)');"
	+"tile["+index+"].css('opacity','1');",100);
	$('.tile').css('font-size',fontSize);
	var disptime = calcDispTime(tw_new);
	mydebug("Switch at #"+index+", time "+disptime+"ms; "+tw_new.text.substring(0,20));
	setTimeout("switchTimeout("+index+");",disptime);
}

function calcDispTime(json){
//	var numrt = json.retweet_count;
//	if(numrt=='100+')
//		numrt = 100;
	numrt = 50;
	return numrt*(400+Math.floor(Math.random()*400))+8000;
}

function loadJSONFromLocal(){
	id_list = localStorage[progID+':id_list'].split(",")
	var json = new Array();
	for(var i=0;i<ids.length;i++){
		var js = localStorage[progID+':'+ids[i]];
		json.push(JSON.parse(js));
	}
	showTweets(json);
}

function clearCache(){
	localStorage.clear();
}

function loadTweets(){
	if(localStorage[progID+':saved']!='true'){
		mydebug("$.getJSON calling...");
		$.getJSON("http://twitter.com/statuses/user_timeline/"+userName+".json?"+
			"callback=?&count=100&include_rts=true&exclude_replies=false",callBackJson);
	}else{
		loadJSONFromLocal();
	}
}

function saveJSON(json){
	for(var i=0;i<json.length;i++){
		localStorage[progID+":"+json[i].id_str] = JSON.stringify(json[i]);
		if(localStorage[progID+':id_list']==null)
			localStorage[progID+':id_list']=json[i].id_str;
		else
			localStorage[progID+':id_list'] += ','+json[i].id_str;
	}
	saved = true;
	localStorage[progID+':saved']='true';
	id_list = localStorage[progID+':id_list'].split(",")
}

function callBackJson(json){
	saveJSON(json);
	showTweets(json);
}

function getColor(rt_count, fav_count){
	var colorstr = ['255,0,0,','0,255,0,','0,0,255,','255,255,0,','255,0,255,','0,255,255,'];
	if(rt_count=='100+')
		rt_count = 100;
	if(fav_count=='100+')
		fav_count = 100;
	var rand = randInt(0,5);
	return ['rgba('+colorstr[rand]+Math.min(1,(rt_count+20)/120)+')',
		'rgba('+colorstr[rand]+Math.min(0.5,(rt_count+20)/120*0.5)+')'];
}

function randInt(min,max){
	return min+Math.floor(Math.random()*(max-min+1));
}