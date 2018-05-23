//$( document ).ready(function() {

// Holds *static* journal pages as well as quest templates. Unlock/complete flags should be stored in the world state.

var journal={};

journal.index={}; //top level of journal, the table of contents
journal.pages={}; //individual pages

///////////////////////////////////////////////////////////////////
/////////// GLYPH REFERENCE
///////////////////////////////////////////////////////////////////

journal.index.coderef={name:"Glyph Reference",requnlock:'ulk_journal_coderef',pointsto:'coderef_gen'};

journal.pages.coderef_gen={title:"Glyph Reference - General",requnlock:null,pointsto:'coderef_qua',pointsfrom:null};
journal.pages.coderef_gen.contents =
'<p class="journal_text">Glyphs consist of 3 letters (case ignored) followed by zero or more parameters.</p>'+
'<p class="journal_text">Parameters can be integers (capped between -999 and 999 inclusive), the symbol <span class="inline_code">*</span> (which is replaced by the integer in the register), or the symbol <span class="inline_code">@</span> (which is replaced by the integer in the active memory cell).</p>'+
'<p class="journal_text">The engine evalutes all glyphs in the same amount of time, including unrecognized glyphs which are treated as <span class="inline_code">nop</span> (no operation).</p>';

journal.pages.coderef_qua={title:"Glyph Reference - Manipulator",requnlock:null,pointsto:'coderef_qua2',pointsfrom:'coderef_gen'};
journal.pages.coderef_qua.contents =
'<p class="journal_text"><span class="inline_code">mov X</span> : Move the manipulator X slots along the working surface, looping around if necessary. X can be negative or positive.</p>'+
'<p class="journal_text"><span class="inline_code">swp</span> : Swap the quanta in the manipulator\'s internal storage (if any) with the quanta at the manipulator\'s spot (if any).</p>'+
'<p class="journal_text"><span class="inline_code">psh X</span> : Push the quantum in the manipulator\'s internal storage to the quantum storage of stack X of the infuser.</p>'+
'<p class="journal_text"><span class="inline_code">pul X</span> : Pull a quantum from stack X of the infuser to the manipulator\'s internal storage. This attempts to pull from the first item counting from the bottom of the stack, or the stack\'s quantum storage if no items are present.</p>';

journal.pages.coderef_qua2={title:"Glyph Reference - Manipulator (cont.)",requnlock:null,pointsto:'coderef_mem',pointsfrom:'coderef_qua'};
journal.pages.coderef_qua2.contents =
'<p class="journal_text"><span class="inline_code">scn</span> : Set the register\'s value to a value unique to the type of the quantum at the manipulator\'s position, or to zero if no quantum is present.</p>'+
'<p class="journal_text"><span class="inline_code">ssc</span> : Set the register\'s value to a value unique to the type of the quantum in the manipulator\'s internal storage, or to zero if no quantum is present.</p>';

journal.pages.coderef_mem={title:"Glyph Reference - Memory",requnlock:null,pointsto:'coderef_ari',pointsfrom:'coderef_qua2'};
journal.pages.coderef_mem.contents =
'<p class="journal_text"><span class="inline_code">set X</span> : Set the register\'s value to X.</p>'+
'<p class="journal_text"><span class="inline_code">mst X</span> : Set the active memory cell\'s value to X.</p>'+
'<p class="journal_text"><span class="inline_code">msw</span> : Swap the values of the register and the active memory cell.</p>'+
'<p class="journal_text"><span class="inline_code">mcl</span> : Clear the register and all memory cells, and set the active cell to the top one.</p>'+
'<p class="journal_text"><span class="inline_code">mmv X</span> : Change the active memory cell by moving X spaces along the memory column. X can be negative or positive, and exceeding the range of cells loops back to the other end of the column.</p>';

journal.pages.coderef_ari={title:"Glyph Reference - Arithmetic",requnlock:null,pointsto:'coderef_con',pointsfrom:'coderef_mem'};
journal.pages.coderef_ari.contents =
'<p class="journal_text"><span class="inline_code">add X</span> : Add X to the register\'s value.</p>'+
'<p class="journal_text"><span class="inline_code">mul X</span> : Multiply X to the register\'s value.</p>'+
'<p class="journal_text"><span class="inline_code">mad X</span> : Add X to the active memory cell\'s value.</p>'+
'<p class="journal_text"><span class="inline_code">mmu X</span> : Multiply X to the active memory cell\'s value.</p>';

journal.pages.coderef_con={title:"Glyph Reference - Conditionals",requnlock:null,pointsto:'coderef_mis',pointsfrom:'coderef_ari'};
journal.pages.coderef_con.contents =
'<p class="journal_text"><span class="inline_code">jmp X</span> : The next glyph executed is the one X steps away from this one. X can be negative or positive, looping around as necessary. Note that <span class="inline_code">jmp 0</span> effectively causes the engine to hang.</p>'+
'<p class="journal_text"><span class="inline_code">0jm X</span> : Same as <span class="inline_code">jmp</span> but only triggers if the register\'s value is zero.</p>'+
'<p class="journal_text"><span class="inline_code">gjm X</span> : Same as <span class="inline_code">jmp</span> but only triggers if the register\'s value is greater than zero.</p>'+
'<p class="journal_text"><span class="inline_code">ljm X</span> : Same as <span class="inline_code">jmp</span> but only triggers if the register\'s value is less than zero.</p>';

journal.pages.coderef_mis={title:"Glyph Reference - Miscellaneous",requnlock:null,pointsto:null,pointsfrom:'coderef_con'};
journal.pages.coderef_mis.contents =
'<p class="journal_text"><span class="inline_code">stp</span> : Stops the engine.</p>'+
'<p class="journal_text"><span class="inline_code">sur</span> : Toggles the exposure of the working surface.</p>'+
'<p class="journal_text"><span class="inline_code">err</span> : Causes the execution bar (the green bar on the left of the engine) to flash red at the spot corresponding to this glyph. Useful for debugging or signaling an event.</p>'+
'<p class="journal_text"><span class="inline_code">nop</span> : No operation. Any unrecognized glyph evaluates to this.</p>';

//<span class="inline_code">xxx X</span>
//'<p class="journal_text"><span class="inline_code">xxx X</span> : </p>'+

///////////////////////////////////////////////////////////////////
/////////// DEMO TUTORIAL
///////////////////////////////////////////////////////////////////

journal.index.demotutorial={name:"Introduction",requnlock:'ulk_journal_demo',pointsto:'demo_start'};

journal.pages.demo_start={title:"A Fortuitous Find",requnlock:null,pointsto:'demo_engine',pointsfrom:null};
journal.pages.demo_start.contents =
'<p class="journal_lore">"Journal entry: 5th of December, 41st year of the Towerfall Era."</p>'+
//Nirsinian, Wyravese?
'<p class="journal_lore">"The most fortuitous of luck shone on me this day. My contact finally managed to procure a functioning Ancient Nirsinian relic. He asked a pretty penny for it, but I am certain the item will prove worth the price."</p>'+
'<p class="journal_text">Welcome to this game prototype\'s demo tutorial! Use the buttons directly below this text to turn through the journal pages or return to the index. Use the buttons further below to open and close various game panels as they unlock.</p>'+
'<p class="journal_text">(Note that saving is disabled in this demo.)</p>';

journal.pages.demo_engine={title:"The Orion Engine",requnlock:null,pointsto:'demo_inventory',pointsfrom:'demo_start'};
journal.pages.demo_engine.onopen = function() {w.panels.engine.unlocked=true;ghtml_panelselect();}
journal.pages.demo_engine.contents =
'<p class="journal_lore">"The contraption resembles nothing known to modern man. It is in a fine state despite centuries of wear, unlike most relics from bygone ages that I have previously seen. With what little I know of the Nirsinian written dialect, the worn inscriptions have only provided a rough translated name... The Orion Engine."</p>'+
'<p class="journal_text">Click the \'Engine\' button on the bottom of the page to open the newly unlocked panel.</p>'+
'<p class="journal_text">The Engine, at its core, is a simple computing machine. Given a series of coded instructions, it manipulates discrete fragments of pseudo-magical energy refered to as \'quanta\' (singular \'quantum\'), with the goal of sorting and refining them into useful products.</p>'+
'<p class="journal_text">We will elaborate on the specific subcomponents of the machine as we go along this tutorial.</p>';

journal.pages.demo_inventory={title:"Taking Inventory",requnlock:null,pointsto:'demo_firstcode',pointsfrom:'demo_engine'};
journal.pages.demo_inventory.onopen = function() {w.panels.inventory.unlocked=true;ghtml_panelselect();}
journal.pages.demo_inventory.contents =
'<p class="journal_lore">"Through some clever reverse-engineering, I have managed to prepare a set of glyphs of the type the contraption requires to function. These primitive methods would surely evoke derision from the machine\'s creators, but they will have to do for the time being."</p>'+
'<p class="journal_text">Open the inventory panel. Items in this game can be dragged and dropped into appropriate slots, with the inventory offering many such slots for long-term storage. Mouse over items for information about them.</p>'+
'<p class="journal_text">You have been provided with a Primitive Glyphmatrix, already encoded with some instruction glyphs. Drag it to the appropriate slot on the bottom of the Engine, then press the button to the right of the slot to start the Engine.</p>'+
'<p class="journal_text">Continue to the next page.</p>';

journal.pages.demo_firstcode={title:"Pretty but Useless",requnlock:null,pointsto:'demo_coder',pointsfrom:'demo_inventory'};
journal.pages.demo_firstcode.contents =
'<p class="journal_text">The provided Glyphmatrix does not do anything too useful, but it does illustrate some components of the engine. The left green-flashing bar represents which instruction stored in the Glyphmatrix is being read and activated.</p>'+
'<p class="journal_text">The central column of numbers are the machine\'s internal memory: The number in the larger box is a register, always available to be read and manipulated, while the smaller blue boxes are memory cells that must be individually accessed to be read or manipulated. The lighter blue cell is the currently active cell.</p>'+
'<p class="journal_text">Currently, the machine will repeatedly multiply the active memory cell\'s value by 2 until the value hits the limit of 999. The machine then shuts down. You can also interrupt it at any time by clicking the button again. Note that the Glyphmatrix can not be moved from its slot while the machine is running.</p>';

journal.pages.demo_coder={title:"The Glyph Encoder",requnlock:null,pointsto:'demo_coder_2',pointsfrom:'demo_firstcode'};
journal.pages.demo_coder.onopen = function() {w.panels.coder.unlocked=true;ghtml_panelselect();}
journal.pages.demo_coder.contents =
'<p class="journal_text">Open the \'Encoder\' panel. The Glyph Encoder allows you to modify the set of instructions stored on a Glyphmatrix. A second Glyphmatrix has been provided, blank and already in the Encoder\'s slot.</p>'+
'<p class="journal_text">When the Glyphmatrix is removed from the Encoder slot, whatever text was typed is split (at newlines and semicolons) into individual glyphs, up to the number of glyphs allowed for the particular Glyphmatrix. The engine runs the provided glyphs in order. Unrecognized glyphs simply cause the engine to take no action as it reads past them. When it reaches the end of the set of glyphs, it loops back to the start.</p>';

journal.pages.demo_coder_2={title:"Glyph Examples",requnlock:null,pointsto:'demo_quanta',pointsfrom:'demo_coder'};
journal.pages.demo_coder_2.contents =
'<p class="journal_text">All correctly written glyphs begin with a set of 3 letters. Many glyphs follow up on these 3 letters with a number or symbol to specify the target or amount of the action to be undertaken. A full glyph reference will be provided eventually, but for now we will work with some simple examples.</p>'+
'<p class="journal_text">Try running the engine with only the glyph <span class="inline_code">mov 1</span>. Observe as a green-glowing triangle moves along the rightmost column of the engine. This column is the \'working surface\' of the engine, where the energy quanta reside, and the triangle is the manipulator. The glyph <span class="inline_code">mov X</span> for a positive or negative number X moves the manipulator that many steps, looping around the ends.</p>';

journal.pages.demo_quanta={title:"Quantum Manipulation",requnlock:null,pointsto:'demo_distil',pointsfrom:'demo_coder_2'};
journal.pages.demo_quanta.contents =
'<p class="journal_text">The final unexplained component of the engine is the small black square above the memory column. This is the manipulator\'s internal storage, capable of holding one quantum. The glyph <span class="inline_code">swp</span> (without a number following the letters) swaps the quantum in the manipulator\'s storage (if any) with the quantum at the manipulator\'s current position (if any). This glyph can be used to have the manipulator \'pick up\' a quantum when it is not holding one in storage, or to drop a stored one in an empty spot.</p>'+
'<p class="journal_text">Observe that there are a few residual quanta on the engine\'s working surface. These are '+dict.drawQuantum('ember_faint',true)+' \'faint embers\', very weak quanta as the name suggests. As a simple test of what you\'ve learnt, instruct the manipulator to move the three faint embers adjacent to each other on the working surface.</p>'+
'<p class="journal_text">Continue to the next page once you\'ve succeeded or given up.</p>';


journal.pages.demo_distil={title:"Further Assembly Required",requnlock:null,pointsto:'demo_distil_2',pointsfrom:'demo_quanta'};
journal.pages.demo_distil.onopen = function() {w.panels.distil.unlocked=true;ghtml_panelselect();}
journal.pages.demo_distil.contents =
'<p class="journal_lore">"The Engine\'s capabilities are truly wondrous... yet it has become clear to me that it is but part of a much larger apparatus, most of which is now surely lost to the sands of time. I will attempt to hook it up to my contemporary Catalytic Infuser stack, meager replacement as it may be."</p>'+
'<p class="journal_text">As you hopefully noticed, manipulating the quanta as instructed resulted in the creation of a new type of quantum, a '+dict.drawQuantum('ember_dim',true)+' \'dim ember\'. While the engine is used to manipulate and refine quanta in this manner, more mundane tools are needed to store and make use of the quanta in various ways. Open the Infuser panel.</p>'+
'<p class="journal_text">The Catalytic Infuser consists of \'stacks\' of items. You currently have access to a single stack containing a single item, an empty glass vial. Items can be moved to and from the infuser by dragging as usual.</p>';


journal.pages.demo_distil_2={title:"Push...",requnlock:null,pointsto:'demo_distil_3',pointsfrom:'demo_distil'};
journal.pages.demo_distil_2.contents =
'<p class="journal_text">The engine can send and receive quanta from the infuser\'s stacks. The <span class="inline_code">psh X</span> glyph pushes a quantum from the manipulator\'s internal storage to the storage on top of stack number X. The stack\'s number is noted on top of it, in this case 1. Once in this storage, items in the stack can receive the quantum. Items can only receive quanta from the storage or other items if there is nothing between the receiving item and donating item or storage. For example, if there is only the vial in the stack at any location, it can always receive the quantum pushed to the stack. However, if you place the vial in the second slot and a Glyphmatrix in the first slot, the vial is blocked from receiving the pushed quantum (and the Glyphmatrix is incapable of receiving it).</p>'+
'<p class="journal_text">The engine can not push a new quantum to a stack whose storage is currently occupied by a quantum. Further, glass vials can only contain one type of quantum at a time.</p>';

journal.pages.demo_distil_3={title:"... and Pull",requnlock:null,pointsto:'demo_opensurface',pointsfrom:'demo_distil_2'};
journal.pages.demo_distil_3.contents =
'<p class="journal_text">Similarly, the <span class="inline_code">pul X</span> glyph pulls an item from stack number X to the manipulator\'s internal storage. The engine tries to pull from the lowest possible item in the stack. If no item is present in the stack, it tries to pull from the stack\'s quantum storage on top. In this way an empty stack can effectively act as an extra single-quantum storage slot for the manipulator.</p>'+
'<p class="journal_text">Continue to the next page once you are comfortable with pushing and pulling.</p>';

journal.pages.demo_opensurface={title:"Something from Nothing",requnlock:null,pointsto:'demo_end',pointsfrom:'demo_distil_3'};
journal.pages.demo_opensurface.onopen = function() {w.unlocks.ulk_engine_open=true;ghtml_engineproc();}
journal.pages.demo_opensurface.contents =
'<p class="journal_lore">"I have located the Engine\'s surface release switch. Exposing the working surface to the surroundings should allow it to slowly condense latent quanta from the Aether."</p>'+
'<p class="journal_text">A new switch is now available on the engine panel, to the right of the on/off switch. Pressing it toggles the exposure of the engine\'s working surface to the surrounding Aether. In the full game, different locations would lead to different effects. In this demo, exposing the surface slowly accumulates '+dict.drawQuantum('ember_faint',true)+' faint embers onto the surface. Keeping the surface clear from quanta speeds up the accumulation of new quanta.</p>'+
'<p class="journal_text">Additionally, the <span class="inline_code">sur</span> glyph can be used to toggle the surface\'s exposure without using the switch, and the <span class="inline_code">stp</span> glyph can be used to turn off the engine.</p>'

journal.pages.demo_end={title:"The End of the Beginning",requnlock:null,pointsto:null,pointsfrom:'demo_opensurface'};
journal.pages.demo_end.contents =
'<p class="journal_lore">"This will be the Engine\'s first true test: the generation of useful material wholly from residual Aetheric emanations. Certainly the first achievement of many, as well as the first step towards ushering in a new Age of Wonders..."</p>'+
'<p class="journal_text">This practically concludes this demo. You have been provided with additional empty vials and Glyphmatrices in your inventory, as well as a ########. Additionally, the Glyph Reference has been unlocked and is accessible from the journal index.</p>';
journal.pages.demo_end.onopen = function() {
	w.unlocks.ulk_journal_coderef=true;
	
	if(!w.unlocks.ulk_journal_democomplete){
		var tmp;
		for(i=0;i<4;i++){
			tmp = dict.newItem('processor_basic');
			moveItem(tmp.id,'inv',getInvFreeSlot());
		}
		for(i=0;i<8;i++){
			tmp = dict.newItem('vial_basic');
			moveItem(tmp.id,'inv',getInvFreeSlot());
		}
		w.unlocks.ulk_journal_democomplete=true;
	}
	
}












//});	