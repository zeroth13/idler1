



//Static dictionary of all the information that doesn't need to be saved in the world state.
//This includes items/quanta prototypes and functions for their behaviours

var dict={};

//note that quanta are currently just stored as a 'type' string. Unless that changes to being stored as an object, they don't need a constructor-like function here.
dict.quanta={};

dict.quanta.faint_ember={name:'faint ember',scanid:1,img:'q_ember_dg.png',imgscale:0.5};
dict.quanta.dim_ember={name:'dim ember',scanid:2,img:'q_ember_lg.png',imgscale:0.7};
dict.quanta.pale_ember={name:'pale ember',scanid:3,img:'q_ember_w.png',imgscale:0.9};

dict.tickQuantum = function(type) {
	return;
}


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











dict.itemProt.UNKNOWN={name:'???',img:'obj_misc.png'};
dict.itemProt.processor={name:'Glyphmatrix',img:'obj_processor.png',code:[],codeable:true,maxcode:20};
dict.itemProt.vial={name:'Glass Vial',img:'obj_tube1_g.png',cont:null,contnum:0,maxcontnum:50};

dict.itemFncs.processor={
	tooltip:function(id){
		var item=w.items[id];
		var tooltip='';
		tooltip+='<span class="itemname">'+item.name+"</span>";
		tooltip+='<br/>Glyphs: '+item.code.length+'/'+item.maxcode+'';
		return tooltip;
	}
};

dict.itemFncs.vial={
	tooltip:function(id){
		var item=w.items[id];
		var tooltip='';
		tooltip+='<span class="itemname">'+item.name+"</span>";
		if(item.cont){
			tooltip+='<br/>'+item.cont+' : '+item.contnum+'/'+item.maxcontnum+'';
		}
		else{
			tooltip+='<br/>(empty) : '+item.contnum+'/'+item.maxcontnum+'';
		}
		return tooltip;
	}
};










