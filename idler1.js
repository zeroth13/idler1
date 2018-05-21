
//lazy man's check for definedness
function d(a){return a !== undefined;}

//rand vs probability
function rand(prob){
	return Math.random()<prob;
}
//roll number from 0 (inclusion) to x (not inclusive)
function roll(x){
	return Math.floor(Math.random()*x);
}

//svg container for inline svg... makes me sad...
var svgs={};
svgs.spointer='<svg id="engine_spointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 32px; width: 32px;"><rect fill="#000" fill-opacity="0" height="512" width="512" rx="32" ry="32"></rect><g class="" transform="translate(0,0)" style="touch-action: none;"><path d="M247 65.16L32.34 440.8l61.79-35.7L247 137.6zm18 .38V137l158.3 271.3 62.7 36.1C412.2 318.2 338.6 191.8 265 65.54zM415.4 424.5l-321.3 1.4-62.72 36.2 445.82-1.9z" fill="#000" fill-opacity="1"></path></g></svg>'

//static dictionary of quanta, items, etc...
var dict={};
dict.quanta={};

dict.quanta.faint_ember={name:'faint ember',scanid:1,img:'q_ember_dg.png',imgscale:0.5};
dict.quanta.dim_ember={name:'dim ember',scanid:2,img:'q_ember_lg.png',imgscale:0.7};
dict.quanta.pale_ember={name:'pale ember',scanid:3,img:'q_ember_w.png',imgscale:0.9};

//world state variable
var w = {};

function initWorld(loadIfAvailable=false){
	
	if(loadIfAvailable && localStorage.getItem('worldSave')){
		w=JSON.parse(localStorage.getItem('worldSave'));
		return;
	}
	
	w.timestep=100;//milliseconds per timestep
	w.time=0;//total **timesteps**
	w.longtimestep=5;//number of **timesteps** that constitute one long timestep
	w.autosavefreq=60*1000;
	
	w.panels={};//stuff about panels
	w.panels.journal={shown:true};
	w.panels.inventory={shown:true};
	w.panels.coder={shown:true};
	w.panels.engine={shown:true};
	w.panels.distil={shown:false};
	
	w.engine={};
	w.engine.on=false;
	w.engine.open=false;
	
	w.engine.surface=[];//slots for stuff on the surface
	w.engine.storage=null;
	w.engine.surfacenum=10;//total number of surface slots
	
	w.engine.reg=0;//the one register memory
	w.engine.memory=[];
	w.engine.memnum=8;//total number of memory slots
	for(var i = 100; i--;) w.engine.memory.push(0);//fill with more than enough zeros, length doesnt matter since the number of slots might change based on upgrades
	
	w.engine.spPos=0;//surface pointer
	w.engine.mpPos=0;//memory pointer
	w.engine.ipPos=0;//instruction pointer
	
	w.items=[];
	w.items_nextid=1; //starting at zero gave me migraines due to null/zero/undefined bugs... so this is the lazy solution
	
	w.inventory=[];
	w.otherlocs={}; //misc locs for items, probably single slot ones?
	
}

function initDebug(){ //debug state for testing
	var tmp;
	
	tmp = newItem('Glyphmatrix','obj_processor.png')
	moveItem(tmp.id,'inv',0)
	tmp.code="mst 1;mmu 2;set -999;add @;0jm 2;jmp -4;mcl;stp".trim().split(/[\n;]+/);;
	tmp.codeable=true;
	
	tmp = newItem('Glyphmatrix','obj_processor.png')
	moveItem(tmp.id,'inv',1)
	tmp.code=[];
	tmp.codeable=true;
	
	tmp = newItem('???','obj_misc.png')
	moveItem(tmp.id,'inv',27)
	tmp.codeable=false;
	
	//w.engine.surface[6]={quantum:'faint_ember'};
	//w.engine.surface[8]={quantum:'dim_ember'};
	//w.engine.surface[1]={quantum:'pale_ember'};
	//w.engine.surface[0]={quantum:'pale_ember'};
	//w.engine.storage={quantum:'pale_ember'};
	
}

function saveWorld(){
	localStorage.setItem('worldSave', JSON.stringify(w));
}

function forceLoadWorld(){//for debugging
	initWorld(true);
	ghtml_renderall();
}

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
			item.code=$("#coder_text").val().trim().split(/[\n;]+/);
			for(var i=0;i<item.code.length;i++){item.code[i]=item.code[i].trim();}
			item.code=item.code.filter(function(a){return a !== ''});
			w.otherlocs.coder=null;
			w.engine.ipPos=0;
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
		w.engine.ipPos=0;
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
		
		//note that currently the code is only 'saved' when the proc is removed from the slot, and unsaved edits are erased when this render function is called.
		textarea.prop( "disabled", false );
		var code="";
		if(item.code){for(var i=0;i<item.code.length;i++){code+=item.code[i]+'\n';}}
		textarea.val(code);
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

function ghtml_enginesurface(redraw=false,specslot=-2){
	
	//redraw only single-quantum storage slot, then return
	if(specslot==-1){
		$('#engine_storage').children('.img_quanta').remove();
		if(w.engine.storage){
			var content='';
			content=dict.quanta[w.engine.storage.quantum].img;
			scale=Math.round(dict.quanta[w.engine.storage.quantum].imgscale*32);
			content='<img src="img/'+content+'" class="img_quanta" style="width:'+scale+'px;height:'+scale+'px"/>';
			$('#engine_storage').append(content);
			$('#engine_storage').children('.img_quanta').addClass('anim_fadein');
		}
		return;
	}
	
	//redraw only one slot, then return
	if(specslot>-1){
		$('#esurf_table td').eq(specslot).children('.img_quanta').remove();
		if(w.engine.surface[specslot]){
			var content='';
			content=dict.quanta[w.engine.surface[specslot].quantum].img;
			scale=Math.round(dict.quanta[w.engine.surface[specslot].quantum].imgscale*32);
			content='<img src="img/'+content+'" class="img_quanta" style="width:'+scale+'px;height:'+scale+'px"/>';
			$('#esurf_table td').eq(specslot).append(content);
			$('#esurf_table td').eq(specslot).children('.img_quanta').addClass('anim_fadein');
		}
		return;
	}
	
	if(redraw){
		var table='<table id="esurf_table"><tbody>';
		var leny=w.engine.surfacenum;
		for (var y=0; y<leny; y++) {
		var content='';
		table+='<tr><td>'+content+'</td></tr>';
		}
		table+='</tbody></table>';
		$("#engine_surface").html(table);
		if(w.engine.open){
			$('#esurf_table').addClass('esurf_open');
		}
		
		$('#esurf_table td').eq(0).append(svgs.spointer);
		if(w.engine.on){
			$('#engine_spointer').addClass('engine_spointer_on');
		}
		
		//draw quanta on surface
		for (var y=0; y<leny; y++) {
			ghtml_enginesurface(false,y);//one-deep recursiveness only
		}
		//draw quantum in storage
		ghtml_enginesurface(false,-1);
	}
	
	var trY= Math.round(w.engine.spPos*334/9);//the magic number here shouldnt be changed for different sizes of surfaces
	$('#engine_spointer').css({"transform":"rotate(90deg) translateY(23px) translateX("+trY+"px)"});
	
}

function ghtml_enginememory(redraw=false,storeslot=false){
	
	if(redraw){
		var table='<table id="emem_table"><tbody>';
		table+='<tr><th></th></tr>';//one reg mem slot
		var leny=w.engine.memnum;
		for (var y=0; y<leny; y++) {
			table+='<tr><td></td></tr>';
		}
		table+='</tbody></table>';
		$("#engine_memory").html(table);
	}
	
	$('#emem_table th').eq(0).html(w.engine.reg);
	for (var y=0; y<w.engine.memnum; y++) {
		$('#emem_table td').eq(y).html(w.engine.memory[y]);
		
		if(w.engine.mpPos==y){
			$('#emem_table td').eq(y).addClass('emem_active');
		}
		else {
			$('#emem_table td').eq(y).removeClass('emem_active');
		}
		
	}
	
}

function ghtml_renderall(){
	//for(var i=0;i<w.panels.length;i++){
	for(var panel in w.panels){
		if(w.panels[panel].shown){
			$('#d_'+panel).show();
			$("#pselect_"+panel).removeClass('panel_selector_hidden');
		}
		else{
			$('#d_'+panel).hide();
			$("#pselect_"+panel).addClass('panel_selector_hidden');
		}
	}
	
	ghtml_inventory();
	ghtml_coder();
	ghtml_engineproc();
	ghtml_enginesurface(true);
	ghtml_enginememory(true);
	
	if(w.engine.open){
		$('#esurf_table').addClass('esurf_open');
	}
	if(w.engine.on){
		$('#engine_switchon').addClass('btn_on');
		$('#engine_spointer').addClass('engine_spointer_on');
	}
	
}

function panelSelect(panel){
	var display;
	if(w.panels[panel]){
		if(w.panels[panel].shown){
			$('#d_'+panel).hide();
			w.panels[panel].shown=false;
			$("#pselect_"+panel).addClass('panel_selector_hidden');
		}
		else{
			$('#d_'+panel).show();
			w.panels[panel].shown=true;
			$("#pselect_"+panel).removeClass('panel_selector_hidden');
		}
	}
	//if(panel=='inventory'){
	//display = $('d_inventory').css('display');
	//if(display=='none'){display='block';}else {display='none';}
	//$('d_inventory').css('display',display);
//}
}

function parseDatum(a){
	if(a==='*'){return w.engine.reg;}
	if(a==='@'){return w.engine.memory[w.engine.mpPos];}
	a=parseInt(a);
	return isNaN(a) ? 0 : a;
	//return isNaN(a) ? 0 : Math.min(Math.max(a, -999), 999);
	return a;
}

function clampDatum(a){
	return Math.min(Math.max(a, -999), 999);
}

function clampPeriodic(v,num){ //places v between 0,num-1 inclusive, according to periodic boundaries
	v=v%num;//periodic boundaries
	v=(v+num)%num;//need this in case it was negative...
	return v;
}

function simStep(){
	
	w.time++;
	//$("#worldtime").html(('0000000000' + w.time).substr(-10));
	
	//fade out the codebar gradually
	ecodebar_canvas = $("#ecodebar_canvas").get(0).getContext('2d');
	var img = ecodebar_canvas.getImageData(0, 0, 1, $("#ecodebar_canvas").attr('height')), data=img.data, len=data.length;
	for (i = 0; i < len;) {
		data[i] = Math.max(data[i++]*0.95,0);// * (1-t) + (r*t);
		data[i] = Math.max(data[i++]*0.95,34);// * (1-t) + (g*t);
		i++;//data[i] = data[i++]*0.95;// * (1-t) + (b*t);
		i++; //data[i] = data[i++] * 1 + 0; << skip alpha component. Adjust as needed.
	}
	ecodebar_canvas.putImageData(img, 0, 0);
	
	
	
	//more expensive operations happen every few timesteps instead of every timestep?
	if(Math.round(w.time)%w.longtimestep==0){
		if(w.engine.on){
			// w.engine.spPos=Math.floor(Math.random() * w.engine.surfacenum);
			// ghtml_enginesurface();
			
			var signal=false;//for different colored ping on the codebar
			var stopengine=false;
			var instructionmove=1;
			var runcode = w.items[w.otherlocs.engineproc].code;
			
			if(runcode.length>0){
				var ops=runcode[w.engine.ipPos].toLowerCase().split(/[\s]+/);
				//console.log(ops);
				switch(ops[0]) {
					case 'mov'://move surface pointer
					var movedist=parseDatum(ops[1]);
					w.engine.spPos=clampPeriodic(w.engine.spPos+movedist,w.engine.surfacenum);
					ghtml_enginesurface();
					break;
					
					case 'mmv'://move memory pointer
					var movedist=parseDatum(ops[1]);
					w.engine.mpPos=clampPeriodic(w.engine.mpPos+movedist,w.engine.memnum);
					ghtml_enginememory();
					break;
					
					case 'set'://set the register
					var setval=parseDatum(ops[1]);
					w.engine.reg=clampDatum(setval);
					ghtml_enginememory();
					break;
					
					case 'add'://add a number to the register's value
					var addval=parseDatum(ops[1]);
					w.engine.reg=clampDatum(w.engine.reg+addval);
					ghtml_enginememory();
					break;
					
					case 'mul'://multiply a number to the register's value
					var mulval=parseDatum(ops[1]);
					w.engine.reg=clampDatum(w.engine.reg*mulval);
					ghtml_enginememory();
					break;
					
					case 'mst'://set the active memory cell
					var setval=parseDatum(ops[1]);
					w.engine.memory[w.engine.mpPos]=clampDatum(setval);
					ghtml_enginememory();
					break;
					
					case 'mad'://add a number to the active memory cell's value
					var addval=parseDatum(ops[1]);
					w.engine.memory[w.engine.mpPos]=clampDatum(w.engine.memory[w.engine.mpPos]+addval);
					ghtml_enginememory();
					break;
					
					case 'mmu'://multiply a number to the active memory cell's value
					var mulval=parseDatum(ops[1]);
					w.engine.memory[w.engine.mpPos]=clampDatum(w.engine.memory[w.engine.mpPos]*mulval);
					ghtml_enginememory();
					break;
					
					case 'msw'://swap values of current memory and register
					var tmp=w.engine.reg;
					w.engine.reg=w.engine.memory[w.engine.mpPos];
					w.engine.memory[w.engine.mpPos]=tmp;
					ghtml_enginememory();
					break;
					
					case 'mcl'://clears memory and register, and sets memory pointer to 0
					for(var i = 0; i<w.engine.memory.length;i++) w.engine.memory[i]=0;
					w.engine.reg=0;
					w.engine.mpPos=0;
					ghtml_enginememory();
					break;
					
					case 'jmp'://move the instruction pointer some distance. jmp 0 is effectively a permanent loop.
					instructionmove = parseDatum(ops[1]);
					break;
					
					case '0jm'://move like jmp, but only if reg==0
					if(w.engine.reg==0){instructionmove = parseDatum(ops[1]);}
					break;
					
					case 'gjm'://move like jmp, but only if reg>0
					if(w.engine.reg>0){instructionmove = parseDatum(ops[1]);}
					break;
					
					case 'ljm'://move like jmp, but only if reg<0
					if(w.engine.reg<0){instructionmove = parseDatum(ops[1]);}
					break;
					
					case 'err'://code bar flashes red instead of green
					signal=true;
					break;
					
					case 'stp'://stop the engine
					stopengine=true;
					break;
					
					case 'sur'://open/close engine surface
					engineOpen();
					break;
					
					case 'swp'://swap quantum at surface pointer (if any) with quantum in storage (if any)
					var surf=w.engine.surface[w.engine.spPos],stor=w.engine.storage;
					w.engine.surface[w.engine.spPos]=null;
					w.engine.storage=null;
					if(surf){
						w.engine.storage=surf;
					}
					if(stor){
						w.engine.surface[w.engine.spPos]=stor;
					}
					ghtml_enginesurface(false,w.engine.spPos);
					ghtml_enginesurface(false,-1);
					break;
					
					case 'scn'://scan at surface pointer, returning a number specific to the quantum type (or zero if none)
					var surf=w.engine.surface[w.engine.spPos];
					if(surf){
						w.engine.reg=dict.quanta[surf.quantum].scanid;
					}
					else{
						w.engine.reg=0;
					}
					ghtml_enginememory();
					break;
					
					case 'ssc'://same as scn but scans the storage slot
					var stor=w.engine.storage;
					if(stor){
						w.engine.reg=dict.quanta[stor.quantum].scanid;
					}
					else{
						w.engine.reg=0;
					}
					ghtml_enginememory();
					break;
					
					case 'psh'://pushes quantum in storage to the distillery. [[CURRENTLY JUST DELETES THE QUANTUM]]
					var stor=w.engine.storage;
					if(stor){
						w.engine.storage=null;
					}
					ghtml_enginesurface(false,-1);
					break;
					
					case 'pul'://pulls a quantum from the distillery to storage [[CURRENTLY DOES NOTHING]]
					ghtml_enginesurface(false,-1);
					break;
					
					case 'nop'://no op (currently also just default behaviour, maybe make unrecognized ops error instead?)
					default:
					break;
				}
			}
			
			var drawlength = $("#ecodebar_canvas").attr('height')/runcode.length;
			ecodebar_canvas = $("#ecodebar_canvas").get(0).getContext('2d');
			var barcolor= signal ? "#ff0000" : "#00dd00";
			ecodebar_canvas.fillStyle=barcolor;
			ecodebar_canvas.fillRect(0,drawlength*w.engine.ipPos,1,drawlength);
			
			//w.engine.ipPos+=1;
			//if(w.engine.ipPos>=runcode.length){w.engine.ipPos=0;}
			w.engine.ipPos=clampPeriodic(w.engine.ipPos+instructionmove,runcode.length);
			if(stopengine){engineSwitchon();}
		}
	}
	
	
	//engine surface gathers quanta if open
	if(w.engine.open){
		if(rand(60/60)){
			var slot = roll(w.engine.surfacenum);
			if(!w.engine.surface[slot]){
				w.engine.surface[slot]={quantum:'faint_ember'};
				ghtml_enginesurface(false,slot);
			}
		}
	}
	
	if(Math.round(w.time)%w.autosavefreq==0){//autosave
		//saveWorld();
	}
	return;
}

$( document ).ready(function() {
	console.log( "HTML DOM READY." );
	
	//init the world
	initWorld();
	initDebug();
	
	//render stuff
	ghtml_renderall();
	
	//start the main sim loop
	var simloop = setInterval(function(){ simStep() }, w.timestep);
	
	});																				