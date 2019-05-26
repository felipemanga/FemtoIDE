const {palettes} = require("./palParser.js");

function writeDraw( block, src ){
    let out = `static const uint8_t data[] = {\n`;
    
    let palette = palettes[ (block.palette||Object.keys(palettes)[0]) ]
        .colors32.map( c => [
            (c>>16)&0xFF,
            (c>>8)&0xFF,
            c&0xFF
        ]);

    if( !palette ){
        throw new Error (`image ${block.name} has no palette`);
    }

    let data = src.data;
    let lines = "";
    out += src.width + "," + src.height;

    let i=0, len, bytes;
    let run = [];

    for( let y=0; y<src.height; ++y ){
        out += ",\n";
        run.length = 0;

        for( let x=0; x<src.width; ++x ){
            let closest = 0;
            let closestDist = Number.POSITIVE_INFINITY;
            let R = data[i++];
            let G = data[i++];
            let B = data[i++];
            let A = data[i++];

            if( A > 128 ){
                for( let c=0; c<palette.length; ++c ){
                    let ca = palette[c];
		    let dist = (R-ca[0])*(R-ca[0])
                        + (G-ca[1])*(G-ca[1])
                        + (B-ca[2])*(B-ca[2]);

                    if( dist < closestDist ){
                        closest = c;
                        closestDist = dist;
                    }
                }
            }
            
            run[x>>1] = (run[x>>1]||0) + (x&1?closest:closest<<4);
        }

        out += run.join(",");
    }
    
    out += `};`;

    out += "return data;\n";

    return out;
}

function writeImage( block ){
    return writeDraw( block, block.image );
}

module.exports = writeImage;
