let lumBias = 1;
let palette = null;
let isTransparent = false;

function encode8BPP(data, width, height){
    let i=0;
    let run = [];
    let out = '';
    let maxcolors = Math.min(256, palette.length);
    
    for( let y=0; y<height; ++y ){
        out += ",\n";
        run.length = 0;

        for( let x=0; x<width; ++x ){
            let closest = 0;
            let closestDist = Number.POSITIVE_INFINITY;
            let R = data[i][0];
            let G = data[i][1];
            let B = data[i][2];
            let L = (R*0.2126 + G*0.7152 + B*0.0722)*lumBias;
            let A = data[i++][3];

            if( A > 128 ){
                for( let c=1; c<maxcolors; ++c ){
                    let ca = palette[c];
                    let lum = (ca[0]*0.2126 + ca[1]*0.7152 + ca[2]*0.0722)*lumBias;
		    let dist = (R-ca[0])*(R-ca[0])
                        + (G-ca[1])*(G-ca[1])
                        + (B-ca[2])*(B-ca[2])
                        + (L-lum)*(L-lum);

                    if( dist < closestDist ){
                        closest = c;
                        closestDist = dist;
                    }
                }
            }else{
                isTransparent = true;
            }

            run[x] = `0x` + closest.toString(16);
        }

        out += run.join(",");
    }

    return out;
}

function encode(data, width, height){
    let i=0;
    let run = [];
    let out = '';
    let maxcolors = Math.min(16, palette.length);
    for( let y=0; y<height; ++y ){
        out += ",\n";
        run.length = 0;

        for( let x=0; x<width; ++x ){
            let closest = 0;
            let closestDist = Number.POSITIVE_INFINITY;
            let R = data[i][0];
            let G = data[i][1];
            let B = data[i][2];
            let L = (R*0.2126 + G*0.7152 + B*0.0722)*lumBias;
            let A = data[i++][3];

            if( A > 128 ){
                for( let c=1; c<maxcolors; ++c ){
                    let ca = palette[c];
                    let lum = (ca[0]*0.2126 + ca[1]*0.7152 + ca[2]*0.0722)*lumBias;
		    let dist = (R-ca[0])*(R-ca[0])
                        + (G-ca[1])*(G-ca[1])
                        + (B-ca[2])*(B-ca[2])
                        + (L-lum)*(L-lum);

                    if( dist < closestDist ){
                        closest = c;
                        closestDist = dist;
                    }
                }
            }else{
                isTransparent = true;
            }

            run[x>>1] = (run[x>>1]||0) + (x&1?closest:closest<<4);
            if(x&1)
                run[x>>1] = "0x" + run[x>>1].toString(16);
        }

        out += run.join(",");
    }

    return out;
}

function writeDraw( sprite, bits ){
    let out = "";
    out += sprite.frames.map( (src, frameNumber) => {

        let out = `static const uint8_t frame${frameNumber}[] = {\n`;
        out += src.trimmedWidth + "," + src.trimmedHeight;
        if( bits == 8 ){
            out += encode8BPP(src.data, src.trimmedWidth, src.trimmedHeight);
        }else{
            out += encode(src.data, src.trimmedWidth, src.trimmedHeight);
        }
        out += `};`;
        return out;

    }).join("\n\n");

    out += `

static const up_femto::uc_FrameRef frames[] = {
`;
    let frameData = [];
    for( let key in sprite.animations ){
        let anim = sprite.animations[key];
        frameData.push( ...anim.map( (o) => `{ frame${o.index}, ${o.offsetX},${o.offsetY}, ${o.duration} }` ) );
    }

    out += frameData.join(", ");

    out += "\n};\n";

    out += "return &frames[ frameNumber ];\n";

    return out;
}

function writeSetAnimation( sprite, animation ){
    let anim = sprite.animations[animation];
    let out = `
if( startFrame == ${anim.start} && endFrame == ${anim.end} ) return;
startFrame = currentFrame = ${anim.start};
endFrame = ${anim.end};
frameTime = up_java::up_lang::uc_System::currentTimeMillis();
`;
    
    return out;
}

function writeTilemap( tilemap ){
    let out = '', data = '';
    let index = {};

    let bytesPerTile = (tilemap.width>>1) * tilemap.height + 3;
    out += `static const uint8_t * const tile[] = {\n`;
    out += tilemap.tiles.map(
        (tile, i) => {
            if( tile.name in index )
                return `tile${index[tile.name]}`;
            index[tile.name] = i;
            
            data += `static const uint8_t tile${i}[] = {`;
            isTransparent = false;
            let str = encode(tile, tilemap.width, tilemap.height);
            data += `
${(isTransparent|0)<<7}, ${tilemap.width}, ${tilemap.height}${str}
};
`;
            return `tile${i}`;
        }).join(",\n");
    out += `
};

const uint8_t *current = tile[tileId];
flags = *current++;
return current;
`;
    return data + out;
}

function writeSprite( sprite ){
    lumBias = require("./palParser.js").getLuminanceBias();
    let palettes = require("./palParser.js").getPalettes();
    palette = palettes[ (sprite.palette||Object.keys(palettes)[0]) ]
        .colors32.map( c => [
            (c>>16)&0xFF,
            (c>>8)&0xFF,
            c&0xFF
        ]);

    if( !palette ){
        throw new Error(`image ${sprite.name} has no palette`);
    }

    if( sprite.tilemap )
        return writeTilemap(sprite.tilemap);

    if( !sprite.animation )
        return writeDraw( sprite.sprite, sprite.bits );

    return writeSetAnimation( sprite.sprite, sprite.animation );
}

module.exports = writeSprite;
