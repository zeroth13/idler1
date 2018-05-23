



//Static dictionary of all the information that doesn't need to be saved in the world state.
//This includes items/quanta prototypes and functions for their behaviours

var dict={};



///////////////////////////////////////////////////////////////////
/////////// QUANTA
///////////////////////////////////////////////////////////////////

dict.quanta={};

dict.newQuantum = function(type){ //doesnt really do much for now, but in case more stuff gets added later...
	return {quantum:type};//maybe have it check that the type actually exists...?
}

dict.tickQuantum = function(slot) { //maybe have special case slot=-1 from engine/distil single-slots?
	if(!w.engine.surface[slot]){return;}
	var type=w.engine.surface[slot].quantum;
	if(dict.quanta[type].tick){
		dict.quanta[type].tick(slot);
	}
}

dict.drawQuantum = function(type,inline=false) {
	var qimg='';
	qimg=dict.quanta[type].img;
	var scale=Math.round(dict.quanta[type].imgscale*32);
	var imgclass = inline ? 'img_quanta_inline' : 'img_quanta';
	qimg='<img src="img/'+qimg+'" class="'+imgclass+'" style="width:'+scale+'px;height:'+scale+'px"/>';
	if(inline){
		qimg='<span class="img_quanta_inline_container">'+qimg+'</span>';
	}
	return qimg;
}



dict.quanta.ember_faint={name:'faint ember',scanid:1,img:'q_ember_dg.png',imgscale:0.5};
dict.quanta.ember_dim={name:'dim ember',scanid:2,img:'q_ember_lg.png',imgscale:0.6};
dict.quanta.ember_pale={name:'pale ember',scanid:3,img:'q_ember_w.png',imgscale:0.7};

dict.quanta.ember_faint.tick = function(slot){
	
	var surn=w.engine.surfacenum;
	var left=clampPeriodic(slot-1,surn), right=clampPeriodic(slot+1,surn);
	
	if(w.engine.surface[left] && w.engine.surface[left].quantum=='ember_faint' && w.engine.surface[right] && w.engine.surface[right].quantum=='ember_faint'){
		w.engine.surface[left]=null;
		w.engine.surface[right]=null;
		w.engine.surface[slot]=dict.newQuantum('ember_dim');
		ghtml_enginesurface(false,left);
		ghtml_enginesurface(false,right);
		ghtml_enginesurface(false,slot);
	}
	
}

















///////////////////////////////////////////////////////////////////
/////////// ITEMS
///////////////////////////////////////////////////////////////////

dict.itemProt={}; //item prototypes
dict.itemFncs={}; //various functions for each item, kept separate from the prototypes dict.itemProt since we don't want to copy the functions into the world state on item creation


dict.newItem = function(type){
	var item={};
	var base;
	
	if(type && dict.itemProt[type]){
		base=dict.itemProt[type];
	}
	else {
		base=dict.itemProt.UNKNOWN;
	}
	
	item=$.extend({},item,base);//can set to be recursive if deep merge needed, currently is not.
	
	item.moveable=true; //move this to some sort of 'default' prototype that gets merged to every item?
	
	//keep the item.id stuff at the end, otherwise might screw up *which* object is placed into the world state (recall that $.extend creates a *new* object...)
	item.proto=type;
	item.id=w.items_nextid;
	w.items[w.items_nextid]=item;
	w.items_nextid++;
	
	return item;
}

dict.updateItemTooltip = function(id){
	var proto=w.items[id].proto;
	var tooltip='';
	if(dict.itemFncs[proto] && dict.itemFncs[proto].tooltip){
		tooltip=dict.itemFncs[proto].tooltip(id);
	}
	else{
		tooltip='<span class="itemname">'+w.items[id].name+"</span>";
	}
	
	//both tries to update an already-rendered tooltip AND returns the tooltip in case it is still in the process of being rendered
	$('#itemTooltip_'+id).html(tooltip);
	return tooltip;
	
}

dict.pullQuantumFromItem = function(id,reqamount,reqtype){
	var pulled={amount:0,type:null};
	var proto=w.items[id].proto;
	
	if(dict.itemFncs[proto] && dict.itemFncs[proto].pullQuantum){
		pulled=dict.itemFncs[proto].pullQuantum(id,reqamount,reqtype);
	}
	
	return pulled;
}

dict.tickItem = function(id){//put a check to see where the item is? currently only items in a distil stack tick anyways...
	
	var proto=w.items[id].proto;
	if(dict.itemFncs[proto] && dict.itemFncs[proto].tickItem){
		pulled=dict.itemFncs[proto].tickItem(id);
	}
	else{
		//currently no default ticking behaviour
	}
	
}









dict.itemProt.UNKNOWN={name:'???',img:'obj_misc.png'};

dict.itemProt.processor_basic={name:'Primitive Glyphmatrix',img:'obj_processor.png',code:[],codeable:true,maxcode:20};
dict.itemFncs.processor_basic={
	tooltip:function(id){
		var item=w.items[id];
		var tooltip='';
		tooltip+='<span class="itemname">'+item.name+"</span>";
		tooltip+='<br/>Glyphs: '+item.code.length+'/'+item.maxcode+'';
		return tooltip;
	}
};

dict.itemProt.vial_basic={name:'Glass Vial',img:'obj_tube1_g.png',conttype:null,contnum:0,maxcontnum:5,pullspeed:1};
dict.itemFncs.vial_basic={
	tooltip:function(id){
		var item=w.items[id];
		var tooltip='';
		tooltip+='<span class="itemname">'+item.name+"</span>";
		if(item.conttype){
			tooltip+='<br/>'+dict.drawQuantum(item.conttype,true)+' '+dict.quanta[item.conttype].name+' : '+item.contnum+'/'+item.maxcontnum+'';
		}
		else{
			tooltip+='<br/>(empty) : '+item.contnum+'/'+item.maxcontnum+'';
		}
		return tooltip;
	},
	pullQuantum:function(id,reqamount,reqtype){
		var item=w.items[id];
		var pulled={amount:0,type:null};
		if(item.conttype && item.contnum>0 && (!reqtype || reqtype==item.conttype) ){
			var give=Math.min(reqamount,item.contnum);
			item.contnum-=give;
			pulled.amount=give;
			pulled.type=item.conttype;
			if(item.contnum==0){
				item.conttype=null;
			}
			dict.updateItemTooltip(id); //is this the best place for this? not sure...
		}
		return pulled;
	},
	tickItem:function(id){
		var item=w.items[id];
		if(item.loc=='distil'){
			var canpull = Math.min(item.maxcontnum-item.contnum,item.pullspeed);
			if (canpull>0){
				var pulled = distilPullQuantum(item.locslot,item.locsubslot,canpull,item.conttype);
				if (pulled.amount>0){
					item.conttype=pulled.type;
					item.contnum+=pulled.amount;
					dict.updateItemTooltip(id); //again, is this the best place for this? not sure...
				}
			}
		}
	},
};


dict.itemProt.resource_glass={name:'Glass Sheet',img:'obj_glasssheet.png'};

dict.itemProt.mould_basic={name:'Casting Mould',img:'obj_mould.png',conttype:null,contnum:0,maxcontnum:10,pullspeed:1,craftprogress:0,maxcraftprogress:300};
dict.itemFncs.mould_basic={
	tooltip:function(id){
		var item=w.items[id];
		var tooltip='';
		tooltip+='<span class="itemname">'+item.name+"</span>";
		if(item.craftprogress==0){
			if(item.conttype){
				tooltip+='<br/>'+dict.drawQuantum(item.conttype,true)+' '+dict.quanta[item.conttype].name+' : '+item.contnum+'/'+item.maxcontnum+'';
			}
			else{
				tooltip+='<br/>(empty) : '+item.contnum+'/'+item.maxcontnum+'';
			}
		}
		else {
			tooltip+='<br/> Cast is cooling... '+Math.round(item.craftprogress/item.maxcraftprogress*100)+'%';
		}
		return tooltip;
	},
	tickItem:function(id){
		var item=w.items[id];
		if(item.loc=='distil'){
			if(item.contnum<item.maxcontnum){
				var canpull = Math.min(item.maxcontnum-item.contnum,item.pullspeed);
				if (canpull>0){
					var pulled = distilPullQuantum(item.locslot,item.locsubslot,canpull,item.conttype);
					if (pulled.amount>0){
						item.conttype=pulled.type;
						item.contnum+=pulled.amount;
						dict.updateItemTooltip(id);
					}
				}
			}
			else if(item.craftprogress<item.maxcraftprogress){
				item.craftprogress++;
				dict.updateItemTooltip(id);
			}
			else if(item.craftprogress>=item.maxcraftprogress && isDistilSlotEmpty(item.locslot,item.locsubslot+1)){
				item.conttype=null;
				item.contnum=0;
				item.craftprogress=0;
				var tmp = dict.newItem('resource_glass');
			moveItem(tmp.id,'distil',item.locslot,item.locsubslot+1);
			}
		}
	},
}


