
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
	w.autosavefreq=60*Math.round(1000/w.timestep);//currently 1 minute
	
	w.panels={};//stuff about panels
	w.panels.journal={shown:true,unlocked:true};
	w.panels.inventory={shown:false,unlocked:false};
	w.panels.coder={shown:false,unlocked:false};
	w.panels.engine={shown:false,unlocked:false};
	w.panels.distil={shown:false,unlocked:false};
	
	w.journalstate={page:null};
	w.unlocks={};//just add flag:true for each unlock achieved?
	
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
	
	w.distil={};
	w.distil.stacklength=5;//slots in each stack
	w.distil.stacks=[{active:true,slots:[]},{active:false,slots:[]},{active:false,slots:[]},{active:false,slots:[]},{active:false,slots:[]},{active:false,slots:[]},{active:false,slots:[]},{active:false,slots:[]},{active:false,slots:[]}];
	
	w.items=[];
	w.items_nextid=1; //starting at zero gave me migraines due to null/zero/undefined bugs... so this is the lazy solution
	
	w.inventory=[];
	w.inventorynum=4*7;
	w.otherlocs={}; //misc locs for items, probably single slot ones?
	
}

function initDebug(){ //debug state for testing
	
	w.panels.journal.shown=true;
	w.panels.inventory.shown=true;
	w.panels.coder.shown=false;
	w.panels.engine.shown=true;
	w.panels.distil.shown=false;
	
	w.panels.journal.unlocked=true;
	w.panels.inventory.unlocked=true;
	w.panels.coder.unlocked=true;
	w.panels.engine.unlocked=true;
	w.panels.distil.unlocked=true;
	
	w.unlocks.ulk_engine_open=true;
	
	w.unlocks.ulk_journal_coderef=true;
	w.unlocks.ulk_journal_demo=true;
	
	w.distil.stacks[0].active=true;
	w.distil.stacks[1].active=true;
	
	var tmp;
	
	tmp = dict.newItem('processor_basic');
	moveItem(tmp.id,'inv',getInvFreeSlot());
	tmp.code="mst 1;mmu 2;set -999;add @;0jm 2;jmp -4;mcl;stp".trim().split(/[\n;]+/);
	
	tmp = dict.newItem('processor_basic');
	moveItem(tmp.id,'inv',getInvFreeSlot());
	tmp = dict.newItem('processor_basic');
	moveItem(tmp.id,'inv',getInvFreeSlot());
	tmp = dict.newItem('processor_basic');
	moveItem(tmp.id,'inv',getInvFreeSlot());
	
	tmp = dict.newItem('vial_basic');
	tmp.conttype='ember_faint';tmp.contnum=tmp.maxcontnum;
	moveItem(tmp.id,'inv',getInvFreeSlot());
	
	tmp = dict.newItem('vial_basic');
	tmp.conttype='ember_faint';tmp.contnum=tmp.maxcontnum;
	moveItem(tmp.id,'inv',getInvFreeSlot());
	
	tmp = dict.newItem('vial_basic');
	moveItem(tmp.id,'inv',getInvFreeSlot());
	tmp = dict.newItem('vial_basic');
	moveItem(tmp.id,'inv',getInvFreeSlot());
	tmp = dict.newItem('vial_basic');
	moveItem(tmp.id,'inv',getInvFreeSlot());
	tmp = dict.newItem('vial_basic');
	moveItem(tmp.id,'inv',getInvFreeSlot());
	
	tmp = dict.newItem('mould_basic');
	moveItem(tmp.id,'inv',getInvFreeSlot());
	
	//tmp = dict.newItem('vial_basic');
	//moveItem(tmp.id,'distil',1,0);
	
	tmp = dict.newItem(null);
	moveItem(tmp.id,'inv',27);
	
	//w.engine.surface[6]=dict.newQuantum('ember_faint');
	//w.engine.storage=dict.newQuantum('ember_faint');
	//w.distil.stacks[0].storage=dict.newQuantum('ember_faint');
	
}

function initDemo(){
	
	//w.unlocks.ulk_journal_coderef=true;
	w.unlocks.ulk_journal_demo=true;
	w.journalstate.page='demo_start';
	
	var tmp;
	
	tmp = dict.newItem('processor_basic');
	moveItem(tmp.id,'inv',0);
	tmp.code="mst 1;mmu 2;set -999;add @;0jm 2;jmp -4;mcl;stp".trim().split(/[\n;]+/);
	
	tmp = dict.newItem('processor_basic');
	moveItem(tmp.id,'coder');
	
	tmp = dict.newItem('vial_basic');
	moveItem(tmp.id,'distil',0,0);
	
	w.engine.surface[0]=dict.newQuantum('ember_faint');
	w.engine.surface[5]=dict.newQuantum('ember_faint');
	w.engine.surface[8]=dict.newQuantum('ember_faint');
	
}

function saveWorld(){
	localStorage.setItem('worldSave', JSON.stringify(w));
}

function forceLoadWorld(){//for debugging
	initWorld(true);
	ghtml_renderall();
}

function isUnlocked(flag){
	return (!flag || w.unlocks[flag]);
}


function moveItem(id,dest,destslot=null,destsubslot=null){
	var item = w.items[id];
	
	if(!item.moveable){return false;}
	
	var oldloc=item.loc, oldlocslot=item.locslot, oldlocsubslot=item.locsubslot;
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
	else if (dest=='distil' && !w.distil.stacks[destslot].slots[destsubslot]) {
		w.distil.stacks[destslot].slots[destsubslot]=item.id;
		item.loc='distil';
		item.locslot=destslot;
		item.locsubslot=destsubslot;
		ghtml_distilstacks('notstorage');
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
			item.code=item.code.slice(0,item.maxcode);
			w.otherlocs.coder=null;
			ghtml_coder();
		}
		else if (oldloc=='engineproc') {
			w.otherlocs.engineproc=null;
			w.engine.ipPos=0;
			ghtml_engineproc();
		}
		else if (oldloc=='distil') {
			w.distil.stacks[oldlocslot].slots[oldlocsubslot]=null;
			ghtml_distilstacks('notstorage');
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

function getInvFreeSlot(){//returns the first slot number that is free, or -1 if none are free
	for(var i=0;i<w.inventorynum;i++){
		if(!w.inventory[i]){return i;}
	}
	return -1;
}

function isDistilSlotEmpty(stack,slot){//note, doesnt check if stack is active
	if(slot>=w.distil.stacklength || slot<0 || !w.distil.stacks[stack] || w.distil.stacks[stack].slots[slot]) {return false;}
	return true;
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
function dropItem_inDistil(ev,stack,stackslot) {
	if(w.distil.stacks[stack].slots[stackslot]){return false;}
    ev.preventDefault();
    var data = JSON.parse(ev.dataTransfer.getData("text"));
	if(data.type=='item'){
		var item = w.items[data.id];
		//if(!item.distilable){return false;}
		moveItem(item.id,'distil',stack,stackslot);
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

function distilPullQuantum(stackind,fromslot,reqamount,reqtype){ //request a type and amount of quanta from a distil stack, starting from above fromslot (and going up). reqtype=null means any. Maybe change reqtype to a list later?
	var pulled={amount:0,type:null};
	var targetslot=-1;
	
	
	if(w.distil.stacks[stackind] && w.distil.stacks[stackind].active){
		var stack=w.distil.stacks[stackind];
		
		for(var slot=fromslot-1;slot>=0;slot--){//finds the first item above fromslot.
			if(stack.slots[slot]){
				targetslot=slot;
				break;
			}
		}
		
		if(targetslot==-1){//target is the stack's internal storage slot
			if(stack.storage && (!reqtype || reqtype==stack.storage.quantum) ){ ///////NOTE: Individual quantum storage slot follow same format as engine slots, {quantum:'string'}, but for items that is not the case, so here we just return the 'string'
				pulled.amount=Math.min(reqamount,1);
				pulled.type=stack.storage.quantum;
				stack.storage=null;
				ghtml_distilstacks(false,stackind);
			}
		}
		else{//target is an item in the stack
			var pulled=dict.pullQuantumFromItem(stack.slots[targetslot],reqamount,reqtype);
		}
		
	}
	
	return pulled;
	
}

function ghtml_itemTooltip(base,itemid){
	var tooltip=dict.updateItemTooltip(itemid);
	return '<div class="tt">'+base+'<span class="ttt" id="itemTooltip_'+itemid+'">'+tooltip+'</span></div>';
}

//generate inventory table in html
function ghtml_inventory(){
	
	var table='<table id="inv_table"><tbody>';
	
	var invx=4, invy=7;//make this configurable in world state.......!!!
	for (var y=0; y<invy; y++) {
		table+='<tr>';
		for (var x=0; x<invx; x++) {
			var invslot=x+y*invx;
			var item=get_inv(invslot);
			if(item){
				//table+='<td>'+item.name+'</td>';
				var tmp='<img class="itemimg" src="img/'+item.img+'" draggable="true" ondragstart="dragItem(event,'+item.id+')" ondragend="dragItemEnd(event)">';
				table+='<td>'+ghtml_itemTooltip(tmp,item.id)+'</td>';
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
		var h=ghtml_itemTooltip('<img class="itemimg" src="img/'+item.img+'" draggable="true" ondragstart="dragItem(event,'+item.id+')" ondragend="dragItemEnd(event)">',item.id);
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
		var h=ghtml_itemTooltip('<img class="itemimg" src="img/'+item.img+'" draggable="true" ondragstart="dragItem(event,'+item.id+')" ondragend="dragItemEnd(event)">',item.id);
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
	
	if(isUnlocked('ulk_engine_open')){$('#engine_open').css('visibility', 'visible');}else{$('#engine_open').css('visibility', 'hidden');};
	
}

function ghtml_enginesurface(redraw=false,specslot=-2){
	
	//redraw only single-quantum storage slot, then return
	if(specslot==-1){
		$('#engine_storage').children('.img_quanta').remove();
		if(w.engine.storage){
			var content='';
			content=dict.drawQuantum(w.engine.storage.quantum);
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
			content=dict.drawQuantum(w.engine.surface[specslot].quantum);
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

function ghtml_distilstacks(redraw=false,specstorage=-1){
	
	//redraw only one stack's single-quantum storage then return
	if(specstorage>-1){
		var storage=$('.distil_stack').eq(specstorage).children('.distil_storage');
		storage.children('.img_quanta').remove();
		if(w.distil.stacks[specstorage].storage){
			var content='';
			var quantumtype=w.distil.stacks[specstorage].storage.quantum;
			content=dict.drawQuantum(quantumtype);
			storage.append(content);
			storage.children('.img_quanta').addClass('anim_fadein');
		}
		return;
	}
	
	
	if(redraw){
		$('.distil_stack').each(function( ind ) {
			if(!w.distil.stacks[ind].active){$(this).hide();return;}//dont draw locked stacks
			
			$(this).show();
			
			var table='<table><tbody>';
			var leny=w.distil.stacklength;
			for (var y=0; y<leny; y++) {
				var contents='';
				var item=w.items[w.distil.stacks[ind].slots[y]];
				if(item){
					contents+='<img class="itemimg" src="img/'+item.img+'" draggable="true" ondragstart="dragItem(event,'+item.id+')" ondragend="dragItemEnd(event)">';
					contents=ghtml_itemTooltip(contents,item.id);
				}
				table+='<tr><td ondrop="dropItem_inDistil(event,'+ind+','+y+')" ondragover="allowDrop(event)">'+contents+'</td></tr>';
			}
			table+='</tbody></table>';
			$(this).children('.distil_stack_slots').html(table);
			
			if(redraw!='notstorage') {ghtml_distilstacks(false,ind);} //hacky but better than nothing
		});
	}
	
	
}

function journalChangePage(page){
	w.journalstate.page=page;
	ghtml_journal();
}

function ghtml_journal() {
	if(!w.journalstate.page){//if journal is on the index
		$('.journal_btn').css('visibility', 'hidden');
		var contents='';
		for(var ind in journal.index){
			var index=journal.index[ind];
			//if(!index.requnlock || w.unlocks[index.requnlock]){
			if(isUnlocked(index.requnlock)){
				contents+='<p class="journal_indexlink" onclick="journalChangePage(\''+index.pointsto+'\')">'+index.name+'</p>';
			}
		}
		$('#journal_contents').html(contents);
	}
	else{
		var page = journal.pages[w.journalstate.page]
		
		if(page.onopen){page.onopen();}//trigger any functions linked to the page's opening
		
		var contents='';
		contents+='<p class="journal_pagetitle">'+page.title+'</p>';
		contents+=page.contents;
		
		$('#journal_contents').html(contents);
		
		$('#journal_tonindex').css('visibility', 'visible');
		if(page.pointsto && isUnlocked(journal.pages[page.pointsto].requnlock)){
			$('#journal_rightpage').off().click(function(){journalChangePage(page.pointsto);});
			$('#journal_rightpage').css('visibility', 'visible');
		}else{$('#journal_rightpage').css('visibility', 'hidden');}
		if(page.pointsfrom && isUnlocked(journal.pages[page.pointsfrom].requnlock)){
			$('#journal_leftpage').off().click(function(){journalChangePage(page.pointsfrom);});
			$('#journal_leftpage').css('visibility', 'visible');
		}else{$('#journal_leftpage').css('visibility', 'hidden');}
	}
}

function ghtml_panelselect() {
	for(var panel in w.panels){
		if(w.panels[panel].unlocked){
			$("#pselect_"+panel).show();
		}
		else{
			$("#pselect_"+panel).hide();
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
	
	ghtml_panelselect();
	ghtml_journal();
	ghtml_inventory();
	ghtml_coder();
	ghtml_engineproc();
	ghtml_enginesurface(true);
	ghtml_enginememory(true);
	ghtml_distilstacks(true);
	
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
}

function clampDatum(a){
	return Math.min(Math.max(a, -999), 999);
}

function clampPeriodic(v,num){ //places v between 0,num-1 inclusive, according to periodic boundaries
	v=v%num;//periodic boundaries
	v=(v+num)%num;//need this in case it was negative...
	return v;
}

/* function getSurfaceQuantum(slot){
	slot=clampPeriodic(slot,w.engine.surfacenum);
	if(!w.engine.surface(slot)){return null;}
	else {return w.engine.surface(slot).quantum};
} */

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
					
					case 'psh'://pushes quantum in storage to the distillery of given number. (note that dist number starts at 1 while arrays start at 0...)
					var distnum=parseDatum(ops[1])-1;//note the -1...
					var stor=w.engine.storage, dist=w.distil.stacks[distnum];
					if(stor && dist && dist.active && !dist.storage){
						w.engine.storage=null;
						dist.storage=stor;
						ghtml_enginesurface(false,-1);
						ghtml_distilstacks(false,distnum);
					}
					break;
					
					case 'pul'://pulls a quantum from the distillery of given number to storage.
					var distnum=parseDatum(ops[1])-1;//note the -1...
					var stor=w.engine.storage, dist=w.distil.stacks[distnum];
					if(!stor && dist && dist.active){
						var pulled = distilPullQuantum(distnum,w.distil.stacklength,1,null);//requests 1 of any type of quantum, starting from the bottom of the stack
						if(pulled.amount>0){
							w.engine.storage=dict.newQuantum(pulled.type);
							ghtml_enginesurface(false,-1);
						}
					}
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
	
	//quanta tick on engine surface (and maybe in engine/distil single-slots too?)
	for(var i =0;i<w.engine.surfacenum;i++){//maybe make it traverse the surface in random order? might not really matter at the rates stuff gets randomly generated on the surface...
		dict.tickQuantum(i);
	}
	
	//engine surface gathers quanta if open
	if(w.engine.open){
		if(rand(12/(60*10))){
			var slot = roll(w.engine.surfacenum);
			if(!w.engine.surface[slot]){
				w.engine.surface[slot]=dict.newQuantum('ember_faint');
				ghtml_enginesurface(false,slot);
			}
		}
	}
	
	//tick all the active stacks' items
	for(var stackind=0;stackind<w.distil.stacks.length;stackind++){
		if(w.distil.stacks[stackind].active){
			for(var slot=0;slot<w.distil.stacklength;slot++){//maybe might want to traverse the slots from bottom up instead?
				if(w.distil.stacks[stackind].slots[slot]){
					dict.tickItem(w.distil.stacks[stackind].slots[slot]);
				}
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
	//initDebug();
	initDemo();
	
	//render stuff
	ghtml_renderall();
	
	//start the main sim loop
	var simloop = setInterval(function(){ simStep() }, w.timestep);
	
});		

