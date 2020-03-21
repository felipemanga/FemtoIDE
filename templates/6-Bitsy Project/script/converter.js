//!APP-HOOK: pre-build

let success = false;
try{
    
success = (function(){

const parser = new DOMParser();
let docSrc;
try{
    docSrc = read('game.html');
}catch( ex ){
	return;
}

const document = parser.parseFromString(docSrc, "text/html");
const gameSrc = document.getElementById("exportedGameData").textContent;
const engineSrc = [...document.querySelectorAll("script")]
    .filter(script=>!script.type)
    .map(script=>script.textContent)
    .join("\n");

var iid=1;
function setInterval(){ return iid++; }
eval( patch(engineSrc) );

function patch(src){
    src = "var imageStore;\n" + src.replace(/\s*var imageStore\s*/, "imageStore");    
    return src;
}

function FakeCanvas(){
    this.getContext = function(){
	return new FakeContext( this );
    };
}

function FakeContext( canvas ){
    this.createImageData = function( w, h ){
    	return new ImageData( w, h );
    };
}

function ImageData( w, h ){
    this.width = w;
    this.height = h;
    this.data = new Uint8Array(w*h*4);
}

function translate( src ){
    attachCanvas( new FakeCanvas() );
    load_game( src, undefined, _=>{} );
    return `
const char *bitsyTitle = ${strEscape(src.match(/^\n*([^\n]*)/)[1])};
${exportFlags()}
${exportImages()}
${exportRooms()}
${exportVariables()}
${exportDialog()}
${exportItems()}
${exportSprites()}
${exportExits()}
`;
}

function exportExits(){
    let endingIdMap = [];
    let exits=[];
    for( let roomKey in room ){
	for( let exitKey in room[roomKey].exits ){
	    let exit = room[roomKey].exits[exitKey];
	    let str;

	    /*
	    if( isNaN(roomIdMap[exit.dest.room]) ){
		throw (exit.dest.room + "|" + roomIdMap[exit.dest.room]);
	    }
	    */
	    
	    str = '{' + [
		roomIdMap[roomKey]+1,
		(roomIdMap[exit.dest.room]||0)+1,
		exit.x,
		exit.y,
		exit.dest.x,
		exit.dest.y
	    ].join(', ') + '} /* Exit ' + roomKey + ' to ' + exit.dest.room + '*/';
	    exits.push(str);
	}
	
	for( let endKey in room[roomKey].endings ){
	    let e = room[roomKey].endings[endKey];
	    let text = ending[e.id] || "END";
	    let tid = endingIdMap.indexOf(text);
	    if( tid == -1 ){
		endingIdMap.push( text );
		tid = endingIdMap.length-1;
	    }
	    let str = '{';
	    str += [
		roomIdMap[roomKey]+1,
		0,
		e.x,
		e.y,
		tid+1,
		0
	    ].join(', ');
	    str += '} /* Ending in room ' + roomKey + '*/';
	    exits.push(str);
	}
    }
    
    return `
const char *endings[] = {
${endingIdMap.map(s=>strEscape(s)).join(', \n ')}
};

const Exit exits[${exits.length}] = {
  ${exits.join(',\n  ')}
};`;
}

function varEscape( val ){
    let fval = parseFloat(val);
    let ival = parseInt(val);
    if( val === true ){
	return 'int32_t(1)';
    }else if( val === false ){
	return 'int32_t(0)';
    }else if( !isNaN(fval) ){
	if( fval == ival )
	    return 'int32_t('+ival+')';
	return 'float('+fval+')';
    }
    return strEscape(val);
}

let varIdMap = {};

function exportVariables(){
    return `
Variable vars[] = {
` + Object.keys(variable).map( (name,i) => {
    varIdMap[name]=i;
    return `/*${name}*/ {${i},${varEscape(variable[name])}}`;
}).join(',\n ') + `
};`;
    
}

function exportFlags(){
    let flarr = [];
    for( let k in flags ){
	flarr.push( flags[k] );
    }
    return `
/* 
FLAGS: 
${Object.keys(flags).map(k => k+'='+flags[k]).join('\n')}
*/
`;
}

var dialogIdMap = {};

function strEscape( str ){
    
    str = str
	.replace(/\\/g, "\\\\")
	.replace(/"/g, '\\"')
	.split('');

    for( let i=0; i<str.length; ++i ){
    	let code = str[i].charCodeAt(0);
    	if( code<32 || code > 126 ){
    	    str[i] = "\\" + code.toString(8).padStart(3, '0');
    	}
    }
    
    return '"' + str.join('') + '"';
    
}

function exportDialog(){
    let literals = [];
    let childLists = [];
    let nextDialogId = 1;
    let blocks = [];
    let sequenceCount = 0, argc = 0;
    let titleId = recurseBlock(scriptInterpreter.Parse(title));
    let dialogIds = Object.keys(dialog).map( key => {
	dialogIdMap[key] = nextDialogId++;
	return recurseBlock(scriptInterpreter.Parse( dialog[key] ));
    });    

    return `
uint8_t sequenceStates[${sequenceCount}] = {${sequenceCount?0:''}};

${childLists.join('\n')}

const Constant literals[] = {
${literals.join(',\n')}
};

const Block blocks[] = {
${blocks.join(',\n')}
};

const int title = ${titleId};

const int dialog[] = {
${dialogIds.join(',\n ')}
};

`;

    function recurseBlock( block ){

	if( block.type == 'block' && block.children.length == 1 )
	    return recurseBlock( block.children[0] );

	let type = block.type;

	if( type == 'if' || type == 'else' )
	    type = type.toUpperCase();
	
	if( type == 'operator' )
	    type = {
		"=":"setExp",
		"==":"equalExp",
		">":"greaterExp",
		"<":"lessExp",
		">=":"greaterEqExp",
		"<=":"lessEqExp",
		"*":"multExp",
		"/":"divExp",
		"+":"addExp",
		"-":"subExp"		
	    }[ block.operator ];

	let children = block.children, extra = ', nullptr', call = `Node::${type}`;

	if( block.type == 'if' ){
	    children = [];
	    for( let i=0; i<block.conditions.length; ++i ){
		children.push(block.conditions[i]);
		children.push(block.results[i]);
	    }
	}

	if( block.type == 'operator' ){
	    children = [ block.left, block.right ];
	}

	if( block.type == 'sequence' || block.type == 'cycle' || block.type == 'shuffle' ){
	    children = block.options;
	    if( block.type != 'shuffle' )
		extra = ', &sequenceStates[' + sequenceCount++ + ']';
	}
	
	if( block.type == 'function' ){
	    children = block.arguments;
	    argc = Math.max(children.length, argc);
	    call = `Functions::${block.name}`;
	}

	if( block.type == 'variable' ){
	    let varId = (varIdMap[ block.name ] || 0);
	    extra = ', (void *) &vars[' + varId + ']';
	}

	if( block.type == 'literal' ){
	    let value = typeof block.value == 'string' ? strEscape(block.value) : block.value;
	    
	    if( typeof value == 'number' ){
    		if( Math.floor(value) == value ){
    		    value = 'int32_t(' + value + ')';
    		}else{
    		    value = value + 'f';
    		}
	    }else if( block.value == null ){
    		value = '""';
	    }
	    
	    let literalId = literals.indexOf( value );
	    if( literalId == -1 ){
		literalId = literals.length;
		literals.push( strEscape(value) );
	    }
	    extra = ', (void *) &literals[' + literalId + ']';
	}

	let childIds = [];
	
	for( let i=0; i<children.length; ++i )
	    childIds.push( recurseBlock( children[i] ) );

	if( !childIds.length ){
	    childIds = 'nullptr';
	}else{
	    childIds.unshift( childIds.length );
	    childLists.push(
		'const uint16_t childList' +
		    childLists.length +
		    '[] = {' +
		    childIds.join(', ') +
		    '};'
	    );
	    
	    childIds = 'childList' + (childLists.length-1);
	}

	let id = blocks.length;
	blocks.push( `/* ${id} */ {${call}, ${childIds}${extra}}` );

	return id;
    }

    function strId( id ){
	return `\\x${(id&0xFF).toString(16).padStart(2,'0')}\\x${(id>>8).toString(16).padStart(2,'0')}`;
    }
    
}

var spriteIdMap = {}, itemIdMap = {};

function exportItems(){
//    log( sprite );
    let nextId = 1;
    let s=[];
    let si=[];

    for( let rid in room ){
	let r = room[rid];
	for( let k in r.items ){
	    let iid = itemIdMap[ r.items[k].id ];
	    if( !iid ) {
		iid = nextId++;
		itemIdMap[ r.items[k].id ] = iid;
	    }
	    let ii=r.items[k];
	    let cs=item[r.items[k].id];
	    let str = `{ ${imageId[cs.drw]}, ${dialogIdMap[cs.dlg]||0}, ${roomIdMap[rid]}, ${ii.x}, ${ii.y}, ${cs.col||1}, ${cs.name?strEscape(cs.name):'""'} } /* ${r.items[k].id} in room ${rid} */`;
	    s.push(str);
	}
    }
    
    return `
const uint32_t itemCount = ${s.length};
uint16_t playerInventory[${s.length}] = {${(s.length)?0:''}};
uint8_t itemState[${s.length}] = {${(s.length)?0:''}};
const Item items[${s.length}] = {
	${s.join(',\n\t')}
};
`;
}

function exportSprites(){
//    log( sprite );
    let nextId = 1;
    let s=[];
    for( let k in sprite ){
	spriteIdMap[k]=nextId++;
	let cs=sprite[k];
	let str = `{ ${imageId[cs.drw]}, ${dialogIdMap[cs.dlg||cs.id]||0}, ${roomIdMap[cs.room]+1||0}, ${cs.x||-1}, ${cs.y||-1}, ${cs.col||2} } /* ${k} */`;
	s.push(str);
    }
    
    return `
Sprite sprites[${s.length}] = {
	${s.join(',\n\t')}
	},
  &player = sprites[${spriteIdMap[playerId]-1}];`;
}

var roomIdMap = {};

function colorTo565( c ){
    let r = (c[0]/0xFF*0x1F)|0;
    let g = (c[1]/0xFF*0x3F)|0;
    let b = (c[2]/0xFF*0x1F)|0;
    return "0x" + ((r<<11) | (g<<5) | b).toString(16);
}

function exportRooms(){
    let rooms = [];
    let pals = {};
    let roomPalette = {};
    
    for( let key in room ){
	var r = room[key];
	roomIdMap[key] = rooms.length;
	
	let m = [];// new Uint32Array(256);
	m.length=256;
	m.fill(0);

	// log( "Room item count: ", r.items.length );

	for( let rowId=0; rowId<16; rowId++ ){
	    let row = r.tilemap[rowId];
	    for( let col=0; col<16; col++ ){
		let t = tile[ row[col] ];
		if( t )
		    m[(rowId*16+col)] = (imageId[ 'TIL_'+row[col] ]||0) | (t.isWall||(r.walls.indexOf( row[col] ) > -1)?0x8000:0);
	    }
	}

	let palstr = palette[ getRoomPal(r.id) ].colors.map(
	    colorTo565
	).join(', ');
	
	(pals[palstr] = (pals[palstr] || [])).push( rooms.length );

	rooms.push(m);
    }

    rooms = rooms.map(
	r=>r.map( (v,i)=> (i&0x7?'':'\n') + `0x${(v>>>0).toString(16)}`.padStart(6, ' ') ).join(',')
    );

    return `

const uint16_t rooms[${rooms.length}][256] = {
	{${rooms.join('},\n\t{')}}
};

${Object.keys(pals).map( (pal,i) => {
pals[pal].forEach(room => roomPalette[room] = i );
return `const uint16_t palette${i}[]={${pal}};`;
}).join('\n')}    

const uint16_t *palettes[] = {
${rooms.map( (_,i) => 'palette'+roomPalette[i] ).join(',\n')}    
};
`;
}

var imageId, nextImageId;

function transpose( img ){
    let out = [];
    
    for( let y=0; y<img.length; ++y )
	out[y] = [];
    
    for( let y=0; y<img.length; ++y ){
	let row = img[y];
	for( let x=0; x<row.length; ++x ){
	    out[x][y] = img[y][x];
	}
    }

    return out;
}

function exportImages(){
    imageId = {};
    nextImageId = 1;

    let frameList = [];
    let animList  = [];
    
    for( let k in imageStore.source ){
    	let id = nextImageId++;
    	imageId[ k ] = id;
    	let frames = imageStore.source[k];
    
    	animList.push(frameList.length, frames.length);
    	
    	frameList.push(
    	    ... frames
    		.map(
    		    (frame, i) => `\t/*${k} ${i}*/{${transpose(frame).map( row => row.reduce( (acc, bit, i) => acc|(bit<<i), 0 ) ).join(",")}}`
    		)
    	);
    }

    let acc = frameList.join(',\n');

    return `
const uint16_t anims_pok[${animList.length}] = {
${animList.join(',')}
};

const unsigned char images_pok[${frameList.length}][8] = {
${acc}
};
`;
}

function doit(){
    try{
    	let out = translate( gameSrc );
    	write("source/bitsy.h", out);
    }catch( ex ){
    	return;
    }
    
    return true;
}

return doit();

})();

}catch(ex){}

if( success ){
    if(hookTrigger == "pre-build") hookArgs[1]();
    else APP.log("Conversion complete");
}else{
    if(hookTrigger == "pre-build") hookArgs[1]("Conversion error");    
}
