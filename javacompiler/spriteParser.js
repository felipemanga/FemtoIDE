const fs = require("fs");
const path = require("path");

function crop( image, sx, sy, srcWidth, srcHeight ){
    let data = [];
    let width = image.width;
    for( let y=0; y<srcHeight; ++y ){
        for( let x=0; x<srcWidth; ++x ){
            let i = ((y+sy)*width+x+sx)*4;
            let c = [
                image.data[i+0],
                image.data[i+1],
                image.data[i+2],
                image.data[i+3]
            ];
            data.push( c );
        }
    }
    return data;
}

class Frame {

    constructor( data, image ){
        let sy = data.frame.y;
        let sx = data.frame.x;
        let srcWidth = data.spriteSourceSize.w;
        let srcHeight = data.spriteSourceSize.h;
        this.data = crop( image, sx, sy, srcWidth, srcHeight );
        this.name = this.data.map(d=>String.fromCharCode(...d)).join("");
        this.width = data.sourceSize.w;
        this.height = data.sourceSize.h;
        this.trimmedWidth = data.spriteSourceSize.w;
        this.trimmedHeight = data.spriteSourceSize.h;
        this.offsetX = data.spriteSourceSize.x;
        this.offsetY = data.spriteSourceSize.y;
        this.duration = data.duration;
    }

}

function makeTile( json, name ){
    let tiles = [];
    let x = 0, y = 0;
    let image = json.meta.image;
    let w = (json.meta.tile.w|0) || image.width;
    let h = (json.meta.tile.h|0) || image.height;
    let flags = json.meta.flags || [];
    
    while(true){
        let tile = crop(image, x, y, w, h);
        tile.name = tile.map(d=>String.fromCharCode(...d)).join("");
        tiles.push( tile );
        x += w;
        if( x + w > image.width ){
            x = 0;
            y += h;
            if( y + h > image.height ){
                break;
            }
        }
    }

    return {
        type:"tilemap",
        tiles,
        flags,
        width:json.meta.tile.w,
        height:json.meta.tile.h,
        image:json.meta.image
    };    
}

function makeSprite( json, name ){
    name = [...name];
    name.pop();
    let image = json.meta.image;
    let allFrames = [];
    let frames = [];
    let indices = [];
    let nextIndex = 0;

    Object.values(json.frames)
        .forEach( f => {
            let frame = new Frame(f, image);
            allFrames.push(frame);

            let other = frames.findIndex(f => f.name == frame.name);
            if( other == -1 ){
                frames.push( frame );
                indices.push( nextIndex++ );
            }else{
                indices.push( other );
            }
        });

    let animations = {};
    json.meta.frameTags.forEach(a => {
        let start = a.from;
        let end = a.to;
        let arr=[];
        for( let i=start; i<=end; ++i ){
            let frame = allFrames[i];
            arr.push({
                offsetX: frame.offsetX,
                offsetY: frame.offsetY,
                duration: frame.duration,
                index: indices[i]
            });
        }
        arr.start = start;
        arr.end = end;
        animations[ a.name ] = arr;
    });

    return {
        type:"sprite",
        frames,
        animations,
        indices,
        width:json.meta.size.w,
        height:json.meta.size.h
    };
};

module.exports = function( json, name ){
    if( json.meta.tile ) return makeTile(json, name);
    else return makeSprite( json, name );
};
