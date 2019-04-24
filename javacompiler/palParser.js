let palettes = {};

let nextPaletteId = 0;

module.exports.palettes = palettes;
module.exports.parsePalette = function(str, name){

    let lines = str.split("\n").map(x=>x.trim());
    if( lines[0] != "JASC-PAL" )
        throw "Invalid PAL file";
    
    let colorCount = parseInt(lines[2]);
    let colors32 = [];
    let colors16 = [];
    
    for( let i=0; i<colorCount; ++i ){
        let RGB = lines[3+i].split(" ").map(c => parseInt(c));
        colors32.push((RGB[0]<<16)|(RGB[1]<<8)|RGB[2]);
        colors16.push((RGB[0]/0xFF*0x1F<<11)|(RGB[1]/0xFF*0x3F<<5)|(RGB[2]/0xFF*0x1F<<0));
    }

    let out = { colors32, colors16, id:nextPaletteId++ };
    palettes[name] = out;

    return out;
};

