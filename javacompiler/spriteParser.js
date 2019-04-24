const fs = require("fs");
const path = require("path");

class Frame {

    constructor( data, image ){
        this.data = [];
        this.name = "";
        this.width = data.spriteSourceSize.w;
        this.height = data.spriteSourceSize.h;
        this.offsetX = data.spriteSourceSize.x;
        this.offsetY = data.spriteSourceSize.y;
        this.duration = data.duration;
        let width = image.width;
        let sy = data.frame.y;
        let sx = data.frame.x;
        for( let y=0; y<this.height; ++y ){
            for( let x=0; x<this.width; ++x ){
                let i = ((y+sy)*width+x+sx)*4;
                let c = [
                    image.data[i+0],
                    image.data[i+1],
                    image.data[i+2],
                    image.data[i+3]
                ];
                this.data.push( c );
                this.name += String.fromCharCode(...c);
            }
        }

    }

}

module.exports = function( json, name ){
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
        frames,
        animations,
        indices,
        width:json.meta.size.w,
        height:json.meta.size.h
    };
};
