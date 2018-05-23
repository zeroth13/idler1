

// Holds *static* journal pages as well as quest templates. Unlock/complete flags should be stored in the world state.

var journal={};

journal.index={}; //top level of journal, the table of contents
journal.pages={}; //individual pages

///////////////////////////////////////////////////////////////////
/////////// GLYPH REFERENCE
///////////////////////////////////////////////////////////////////

journal.index.coderef={name:"Glyph Reference",requnlock:'ulk_journal_coderef',pointsto:'coderef_1'};
journal.pages.coderef_1={title:"Glyph Reference",requnlock:null,pointsto:null,pointsfrom:null};

///////////////////////////////////////////////////////////////////
/////////// DEMO TUTORIAL
///////////////////////////////////////////////////////////////////

journal.index.demotutorial={name:"Introduction",requnlock:null,pointsto:'demo_start'};

journal.pages.demo_start={title:"A Fortuitous Find",requnlock:null,pointsto:'demo_engine',pointsfrom:null};
journal.pages.demo_start.contents =
'<p class="journal_lore">"Journal entry: 5th of December, 41st year of the Towerfall Era."</p>'+
//Nirsinian, Wyravese?
'<p class="journal_lore">"The most fortuitous of luck shone on me this day. My contact finally managed to procure a functioning Ancient Nirsinian relic. He asked a pretty penny for it, but I am certain the item will prove worth the price."</p>'+
'<p class="journal_text">Welcome to this game prototype\'s demo tutorial! Use the buttons directly below this text to turn through the journal pages or return to the index. Use the buttons further below to open and close various game panels as they unlock.</p>';

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
'<p class="journal_text">Open the inventory panel. Items in this game can be dragged and dropped into appropriate slots, with the inventory offering many such slots for long-term storage.</p>'+
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

journal.pages.demo_quanta={title:"Quantum Manipulation",requnlock:null,pointsto:null,pointsfrom:'demo_coder_2'};
journal.pages.demo_quanta.contents =
'<p class="journal_text">The final unexplained component of the engine is the small black square above the memory column. This is the manipulator\'s internal storage, capable of holding one quantum. The glyph <span class="inline_code">swp</span> (without a number following the letters) swaps the quantum in the manipulator\'s storage (if any) with the quantum at the manipulator\'s current position (if any). This glyph can be used to have the manipulator \'pick up\' a quantum when it is not holding one in storage, or to drop a stored one in an empty spot.</p>'+
'<p class="journal_text">Observe that there are a few residual quanta on the engine\'s working surface. These are \'faint embers\', very weak quanta as the name suggests. As a simple test of what you\'ve learnt, instruct the manipulator to move the three faint embers adjacent to each other on the working surface.</p>'+
'<p class="journal_text">Continue to the next page once you\'ve succeeded or given up.</p>';



//'<p class="journal_text"></p>'
//journal.pages.demo_engine.onopen = function() {w.unlocks.ulk_journal_coderef=true;}











