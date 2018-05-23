

// Holds *static* journal pages as well as quest templates. Unlock/complete flags should be stored in the world state.

var journal={};

journal.index={}; //top level of journal, the table of contents
journal.pages={}; //individual pages

///////////////////////////////////////////////////////////////////
/////////// DEMO TUTORIAL
///////////////////////////////////////////////////////////////////

journal.index.demotutorial={name:"Demo Introduction",requnlock:null,pointsto:'demo_1'};

journal.pages.demo_1={title:"Demo 1",requnlock:null,pointsto:'demo_2',pointsfrom:null};
journal.pages.demo_1.onopen = function() {w.unlocks.ulk_journal_coderef=true;}
journal.pages.demo_1.contents =
'<p class="journal_lore">"Some lore goes here... bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla"</p>'+
'<p class="journal_text">Some instructions go here.</p>';

journal.pages.demo_2={title:"Demo 2",requnlock:null,pointsto:'demo_3',pointsfrom:'demo_1'};
journal.pages.demo_2.contents =
'<p class="journal_text">Some more stuff goes here.</p>';

journal.pages.demo_3={title:"Demo 3",requnlock:null,pointsto:null,pointsfrom:'demo_2'};
journal.pages.demo_3.contents =
'<p class="journal_text">Even more stuff goes here.</p>';

///////////////////////////////////////////////////////////////////
/////////// GLYPH REFERENCE
///////////////////////////////////////////////////////////////////

journal.index.coderef={name:"Glyph Reference",requnlock:'ulk_journal_coderef',pointsto:'coderef_1'};
journal.pages.coderef_1={title:"Glyph Reference",requnlock:null,pointsto:null,pointsfrom:null};


