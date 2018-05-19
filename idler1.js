
//svg container for inline svg... makes me sad...
var svgs={};
svgs.spointer='<svg id="engine_spointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 32px; width: 32px;"><rect fill="#000" fill-opacity="0" height="512" width="512" rx="32" ry="32"></rect><g class="" transform="translate(0,0)" style="touch-action: none;"><path d="M247 65.16L32.34 440.8l61.79-35.7L247 137.6zm18 .38V137l158.3 271.3 62.7 36.1C412.2 318.2 338.6 191.8 265 65.54zM415.4 424.5l-321.3 1.4-62.72 36.2 445.82-1.9z" fill="#000" fill-opacity="1"></path></g></svg>'

//init world state
var w = {};

w.engine={};
w.engine.on=false;
w.engine.open=false;
w.engine.spPos=0;//surface pointer
w.engine.mpPos=0;//memory pointer
w.engine.ipPos=0;//instruction pointer

w.items=[];
w.items_nextid=1; //starting at zero gave me migraines due to null/zero/undefined bugs... so this is the lazy solution

w.inventory=[];
w.otherlocs={}; //misc locs for items, probably single slot ones?

function newItem(name,img){
	var item={};
	item.name=name;
	item.id=w.items_nextid;
	item.img=img;
	item.moveable=true;
	w.items[w.items_nextid]=item;
	w.items_nextid++;
	return item;
}



function moveItem(id,dest,destslot=null){
	var item = w.items[id];
	
	if(!item.moveable){return false;}
	
	var oldloc=item.loc, oldlocslot=item.locslot;
	var invUpdated=false;
	
	//move item to new location.
	if(dest=='inv' && !w.inventory[destslot]){
		w.inventory[destslot]=item.id;
		item.loc='inv';
		item.locslot=destslot;
		invUpdated=true;
	}
	else if (dest=='coder' && !w.otherlocs.coder) {
		w.otherlocs.coder=item.id;
		item.loc='coder';
		ghtml_coder();
	}
	else if (dest=='engineproc' && !w.otherlocs.engineproc) {
		w.otherlocs.engineproc=item.id;
		item.loc='engineproc';
		ghtml_engineproc();
	}
	// else if(!w.otherlocs[dest]){ //if otherloc not occupied, move it to there
	// w.otherlocs[dest]=item.id;
	// item.loc=dest;
	// }
	
	//remove item from previous location if any.
	if(oldloc){
		if(oldloc=='inv'){
			w.inventory[oldlocslot]=null;
			invUpdated=true;
		}
		else if (oldloc=='coder') {
			item.code=$("#coder_text").val();
			w.otherlocs.coder=null;
			ghtml_coder();
		}
		else if (oldloc=='engineproc') {
			w.otherlocs.engineproc=null;
			ghtml_engineproc();
		}
		// else {
		// w.otherlocs[oldloc]=null;//for misc locs with only one slot
		// }
	}
	
	if(invUpdated) {ghtml_inventory();}
	
}

var tmp;
tmp = newItem('Glyphmatrix','obj_processor.png')
moveItem(tmp.id,'inv',14)
tmp.code="test";
tmp.codeable=true;
tmp = newItem('???','obj_misc.png')
moveItem(tmp.id,'inv',3)
tmp.code="";
tmp.codeable=false;
tmp.code="";
tmp = newItem('Glyphmatrix','obj_processor.png')
moveItem(tmp.id,'inv',27)
tmp.code="";
tmp.codeable=true;

//get item in inventory slot
function get_inv(invslot){
	if(w.inventory[invslot]!==undefined && w.inventory[invslot]!==null){
		return w.items[w.inventory[invslot]];
	}
	else{
		return null;
	}
}

//drag and drop for items
function allowDrop(ev) {ev.preventDefault();}
function dragItemEnd(ev) {
	$('.ttt').css('visibility', '');//resets to value in css sheet
}
function dragItem(ev,id) {
	$('.ttt').css('visibility', 'hidden');
	var tmp={};
	tmp.type="item";
	tmp.id=id;
    ev.dataTransfer.setData("text", JSON.stringify(tmp));
}
function dropItem_inInv(ev,invslot) {
    ev.preventDefault();
    var data = JSON.parse(ev.dataTransfer.getData("text"));
	if(data.type=='item'){
		moveItem(data.id,'inv',invslot);
	}
}
function dropItem_inCoder(ev) {
	if(w.otherlocs.coder){return false;}
    ev.preventDefault();
    var data = JSON.parse(ev.dataTransfer.getData("text"));
	if(data.type=='item'){
		var item = w.items[data.id];
		if(!item.codeable){return false;}
		moveItem(item.id,'coder');
	}
}
function dropItem_inEngineproc(ev) {
	if(w.otherlocs.engineproc){return false;}
    ev.preventDefault();
    var data = JSON.parse(ev.dataTransfer.getData("text"));
	if(data.type=='item'){
		var item = w.items[data.id];
		if(!item.codeable){return false;}
		moveItem(item.id,'engineproc');
	}
}

function engineSwitchon(){
	if(w.engine.on){
		w.engine.on=false;
		var item=w.items[w.otherlocs.engineproc];
		item.moveable=true;
		$('#engine_switchon').removeClass('btn_on');
		$('#engine_spointer').removeClass('engine_spointer_on');
	}
	else if (w.otherlocs.engineproc){
		var item=w.items[w.otherlocs.engineproc];
		item.moveable=false;
		w.engine.on=true;
		$('#engine_switchon').addClass('btn_on');
		$('#engine_spointer').addClass('engine_spointer_on');
	}
	else{
		$('#engine_switchon').addClass('btn_error');
		setTimeout(function(){$('#engine_switchon').removeClass('btn_error');},300);
	}
}

function engineOpen(){
	if(w.engine.open){
		w.engine.open=false;
		$('#esurf_table').removeClass('esurf_open');
	}
	else{
		w.engine.open=true;
		$('#esurf_table').addClass('esurf_open');
	}
}

function ghtml_tooltip(base,tooltip){
	return '<div class="tt">'+base+'<span class="ttt">'+tooltip+'</span></div>';
}

//generate inventory table in html
function ghtml_inventory(){
	
	var table='<table id="inv_table"><tbody>';
	
	var invx=4, invy=7;
	for (var y=0; y<invy; y++) {
		table+='<tr>';
		for (var x=0; x<invx; x++) {
			var invslot=x+y*invx;
			var item=get_inv(invslot);
			if(item){
				//table+='<td>'+item.name+'</td>';
				var tmp='<img class="itemimg" src="img/'+item.img+'" draggable="true" ondragstart="dragItem(event,'+item.id+')" ondragend="dragItemEnd(event)">';
				table+='<td>'+ghtml_tooltip(tmp,item.name)+'</td>';
			}
			else {
				table+='<td ondrop="dropItem_inInv(event,'+invslot+')" ondragover="allowDrop(event)"></td>';
			}
		}
		table+='</tr>';
	}
	
	table+='</tbody></table>';
	$("#inventory_area").html(table);
}

function ghtml_coder() {
	var slot = $("#coder_slot");
	var textarea = $("#coder_text");
	if(w.otherlocs.coder){
		var item = w.items[w.otherlocs.coder];
		var h=ghtml_tooltip('<img class="itemimg" src="img/'+item.img+'" draggable="true" ondragstart="dragItem(event,'+item.id+')" ondragend="dragItemEnd(event)">',item.name);
		slot.html(h);
		slot.removeAttr('ondrop');
		slot.removeAttr('ondragover');
		slot.removeClass('coder_slot_fade');
		slot.addClass('coder_slot_glow');
		
		textarea.prop( "disabled", false );
		textarea.val(item.code ? item.code : '');
		textarea.attr('placeholder','Code goes here.');
	}
	else{
		slot.html('');
		slot.attr('ondrop','dropItem_inCoder(event)');
		slot.attr('ondragover','allowDrop(event)');
		
		slot.removeClass('coder_slot_glow');
		slot.addClass('coder_slot_fade');
		
		textarea.prop( "disabled", true );
		textarea.val('');
		textarea.attr('placeholder','');
	}
	
}

function ghtml_engineproc() {
	var slot = $("#engine_procslot");
	if(w.otherlocs.engineproc){
		var item = w.items[w.otherlocs.engineproc];
		var h=ghtml_tooltip('<img class="itemimg" src="img/'+item.img+'" draggable="true" ondragstart="dragItem(event,'+item.id+')" ondragend="dragItemEnd(event)">',item.name);
		slot.html(h);
		slot.removeAttr('ondrop');
		slot.removeAttr('ondragover');
		slot.removeClass('coder_slot_fade');
		slot.addClass('coder_slot_glow');
	}
	else{
		slot.html('');
		slot.attr('ondrop','dropItem_inEngineproc(event)');
		slot.attr('ondragover','allowDrop(event)');
		
		slot.removeClass('coder_slot_glow');
		slot.addClass('coder_slot_fade');
	}
	
}

function ghtml_enginesurface(redraw=false){
	
	if(redraw){
		var table='<table id="esurf_table"><tbody>';
		var leny=10;
		for (var y=0; y<leny; y++) {
			table+='<tr><td></td></tr>';
		}
		table+='</tbody></table>';
		$("#engine_surface").html(table);
		if(w.engine.open){
			$('#esurf_table').addClass('esurf_open');
		}
		
		//$('#esurf_table td').eq(0).html('<img src="img/ui_pointer.svg" id="engine_spointer"/>');
		//$('#esurf_table td').eq(0).html('<object type="image/svg+xml" data="img/ui_pointer.svg" id="engine_spointer"/>');
		//$('#esurf_table td').eq(0).html('<svg id="engine_spointer"><use xlink:href="/img/ui_pointer.svg#icon1"></use></svg>');
		$('#esurf_table td').eq(0).html(svgs.spointer);
		if(w.engine.on){
			$('#engine_spointer').addClass('engine_spointer_on');
		}
	}
	
	var trY= Math.round(w.engine.spPos*334/9);
	$('#engine_spointer').css({"transform":"rotate(90deg) translateY(20px) translateX("+trY+"px)"});
	
}

function simStep(){
	if(w.engine.on){
		w.engine.spPos=Math.floor(Math.random() * 10);
		ghtml_enginesurface();
	}
	
	return;
}

$( document ).ready(function() {
	console.log( "HTML DOM READY." );
	
	
	//render stuff
	ghtml_inventory();
	ghtml_coder();
	ghtml_engineproc();
	ghtml_enginesurface(true)
	
	//start the main sim loop
	var simloop = setInterval(function(){ simStep() }, 500);

});