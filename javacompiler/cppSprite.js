const {palettes} = require("./palParser.js");

function writeDraw( sprite ){
    let out = "";
    let palette = palettes[ (sprite.palette||Object.keys(palettes)[0]) ]
        .colors32.map( c => [
            (c>>16)&0xFF,
            (c>>8)&0xFF,
            c&0xFF
        ]);

    if( !palette ){
        throw new Error(`image ${sprite.name} has no palette`);
    }

    out += sprite.frames.map( (src, frameNumber) => {

        let out = `static const uint8_t frame${frameNumber}[] = {\n`;
        let data = src.data;
        let lines = "";

        out += src.trimmedWidth + "," + src.trimmedHeight;

        let i=0, len, bytes;
        let run = [];

        for( let y=0; y<src.trimmedHeight; ++y ){
            out += ",\n";
            run.length = 0;

            for( let x=0; x<src.trimmedWidth; ++x ){
                let closest = 0;
                let closestDist = Number.POSITIVE_INFINITY;
                let R = data[i][0];
                let G = data[i][1];
                let B = data[i][2];
                let A = data[i++][3];

                if( A > 128 ){
                    for( let c=1; c<palette.length; ++c ){
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

function writeSprite( sprite ){
    if( !sprite.animation ){
        return writeDraw( sprite.sprite );
    }
    return writeSetAnimation( sprite.sprite, sprite.animation );
}

module.exports = writeSprite;
