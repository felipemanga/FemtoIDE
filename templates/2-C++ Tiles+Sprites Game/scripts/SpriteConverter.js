//!MENU-ENTRY:Convert Sprites
//!MENU-SHORTCUT:C-M-s

// This script looks in the "sprites" folder and converts all of the json files into sprites.h.
// Press Ctrl+Enter to run this script or use the menu.

const transparentIndex = 0;

let promises = [];
let palette;

APP.getPalette(pal=>{
    palette = pal;
    if(pal) start();
});

/*
animation X:
  [frame count]
  frame Y: [bitmap index][duration/10]
bitmap Z:
  [x][y][w][h][data...]
*/

function start(){
    let sprites = (dir("sprites")||[])
    .filter( file=>/\.json$/i.test(file) )
    .reduce( (index, file) => {
        let sprite = JSON.parse(read(`sprites/${file}`));
        let name = file.replace(/\..*$/, "").replace(/[^a-zA-Z0-9_]*/g, "");
        index[name] = sprite;
        
        sprite.dataName = name[0].toLowerCase() + name.substr(1);
        sprite.enumName = name[0].toUpperCase() + name.substr(1);
        
        promises.push(
            readImage(`sprites/${sprite.meta.image}`)
            .then( image => {

                let nextId = 0;
                let cache = {};
                let head = [0, 0];
                let acc = [];
                let sum = 0;
                sprite.animations = [];
                let tags = sprite.meta.frameTags || [{name:"default", from:0, to:sprites.frames.length-1}];

                for(let tag of tags){

                    let frameIds = [];
                    sprite.animations.push(tag.name + " = " + sum);
                    
                    head.push(tag.to - tag.from + 1);
                    sum++;

                    for(let i=tag.from; i<=tag.to; ++i){
                        sum+=2;
                        
                        let frame = sprite.frames[i];
                        let ff = frame.frame;
                        let sss = frame.spriteSourceSize;
                        let key = Object.values(ff).join(",");
                        let id = cache[key];

                        if( id === undefined ){
                            id = nextId++;
                            cache[key] = id;
                            let img = convert(image, ff.x, ff.y, sss.x, sss.y, ff.x + sss.w, ff.y + sss.h);
                            acc.push(...img);
                        }
                        
                        head.push(id, frame.duration/10|0);
                        
                    }

                }
                
                head[0] = sum & 0xFF;
                head[1] = sum >> 8;
                sprite.bin = `sprites/${name}.bin`;
                write(sprite.bin, new Uint8Array(head.concat(acc)));
                return sprite;
            }));
                
        return index;
    }, 
    {}
);


Promise.all(promises)
    .then(_=>{
        let acc = `
// Generated file - DO NOT EDIT!

#pragma once

class Sprite {
public:
    using OnEndAnimationCallback = void (*)(Sprite*);

    OnEndAnimationCallback onEndAnimation = +[](Sprite *sprite){ sprite->frame = 0; };
    const uint8_t *data = nullptr;
    std::uint32_t frameTime = 0;
    std::uint16_t frame = 0;
    std::uint16_t animation = 0;

    Sprite() = default;
    virtual ~Sprite(){}
    
    template<typename SpriteType>
    void play(const SpriteType& data, typename SpriteType::Animation animation){ 
        this->animation = static_cast<std::uint16_t>(animation); 
        this->data = reinterpret_cast<const uint8_t *>(&data);
        frame = 0;
        frameTime = Pokitto::Core::getTime() + getFrameDuration(0);
    }
    
    std::uint8_t getAnimationFrameCount(){ return data[ 2 + animation ]; }

    std::uint8_t getFrameId(std::uint32_t frame){ return data[ 2 + animation + 1 + frame * 2]; }

    std::uint32_t getFrameDuration(std::uint32_t frame){ return data[ 2 + animation + 1 + frame * 2 + 1 ] * 10; }
    
    std::uint32_t getFrameWidth(){ return getFrameBitmap(getFrameId(frame))[2]; }
    
    std::uint32_t getFrameHeight(){ return getFrameBitmap(getFrameId(frame))[3]; }

    const uint8_t *getFrameBitmap(std::uint32_t frameId){ 
        std::uint32_t offset = 2 + data[0] + (static_cast<std::uint32_t>(data[1]) << 8);
        uint32_t shift;
        switch(Pokitto::Display::m_colordepth){
        case 8: shift = 0; break;
        case 4: shift = 1; break;
        case 2: shift = 2; break;
        case 1: shift = 3; break;
        default: shift = 0; break;
        }
        
        while(frameId--){
            std::uint32_t w = data[offset + 2];
            std::uint32_t h = data[offset + 3];
            std::uint32_t total = w*h >> shift;
            offset += total + 4;
        }
        
        return data + offset;
    }

    void draw(std::uint32_t x, std::uint32_t y, bool flip=false, bool mirror=false, std::uint32_t recolor=0){
        if(!data) 
            return;
            
        std::uint32_t now = Pokitto::Core::getTime();
        while(true) {
            int32_t delta = now - frameTime;
            if( delta < 0 ){
                const uint8_t *bmp = getFrameBitmap(getFrameId(frame));
                x += *bmp++;
                y += *bmp++;

                #if PROJ_SCREENMODE == TASMODE
                if(Pokitto::Display::m_colordepth == 8){
                    Pokitto::Display::drawSprite(x, y, bmp, flip, mirror, recolor);
                    return;
                }
                #endif

                if(flip) Pokitto::Display::drawBitmapYFlipped(x, y, bmp);
                else if(mirror)  Pokitto::Display::drawBitmapXFlipped(x, y, bmp);
                else  Pokitto::Display::drawBitmap(x, y, bmp);
                return;
            }
            frame++;
            if( frame == getAnimationFrameCount() )
                onEndAnimation(this);
            frameTime += getFrameDuration(frame);
        }
    }
};

${Object.keys(sprites).map(s=>`class ${sprites[s].enumName} {
public:
    enum Animation : std::uint16_t {\n\t\t` + sprites[s].animations.join(",\n\t\t") + `\n\t};
};
`).join("\n")}

// https://stackoverflow.com/a/19591902
extern "C" {
${Object.keys(sprites).map(s=>`extern const ${sprites[s].enumName} ${sprites[s].dataName};`).join("\n")}
}
`;
        write("sprites.h", acc);
        write("sprites.cpp", 
            Object.keys(sprites)
                .map(s=>`__asm__(".global ${sprites[s].dataName}\\n${sprites[s].dataName}:\\n.incbin \\"${sprites[s].bin}\\"");`)
                .join("\n")
        );
        log("Sprite conversion complete!");
    })
    .catch(ex=>{
        log(ex);
    });
}

function convert(img, xb, yb, xo, yo, xe, ye){
    let bpp = (Math.log(palette.length) / Math.log(2))|0;
    let len, bytes, data = img.data;
    let ppb = 8 / bpp;
    let out = [xo, yo, ((xe - xb) / ppb + 0.5)|0, ye - yb];
    let run = [], max = Math.min(palette.length, 1<<bpp);
    let PC = undefined, PCC = 0;

    for( let y=yb; y<ye; ++y ){
        run.length = 0;

        for( let x=xb; x<xe; ++x ){
            let i = (y * img.width + x) * 4;
            let closest = 0;
            let closestDist = Number.POSITIVE_INFINITY;
            let R = data[i++]|0;
            let G = data[i++]|0;
            let B = data[i++]|0;
            let C = (R<<16) + (G<<8) + B;
            let A = data[i++]|0;

            if(C === PC){
                closest = PCC;
            } else if( A > 128 ) {
                
                for( let c=0; c<max; ++c ){
                    if( c == transparentIndex )
                        continue;
                    const ca = palette[c];
                    const PR = ca[0]|0;
                    const PG = ca[1]|0;
                    const PB = ca[2]|0;
        	        const dist = (R-PR)*(R-PR)
                        + (G-PG)*(G-PG)
                        + (B-PB)*(B-PB)
                    ;

                    if( dist < closestDist ){
                        closest = c;
                        closestDist = dist;
                    }
                }
                
                PC = C;
                PCC = closest;
            }else{
                closest = transparentIndex;
            }

            let lx = x - xb;
            let shift = (ppb - 1 - lx%ppb) * bpp;
            run[(lx/ppb)|0] = (run[(lx/ppb)|0]||0) + (closest<<shift);
        }

        out.push(...run);
    }
    
    return out;
}
