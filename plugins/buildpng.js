APP.addPlugin("BuildPNG", ["Build", "Project"], _=> {
    function loadSettings( callback ){
        let buffer = DATA
            .projectFiles
            .find( f=>f.name.toLowerCase()=="my_settings.h" );
        if( buffer ){
            APP.readBuffer( buffer, null, (error, data)=>{
                callback(parseSettings(data));
            });
        } else {
            callback(parseSettings(""));
        }
    }

    APP.add(new class BuildPNG {

        getPalette( callback ){
            loadSettings(settings=>{
                getPalette(settings, callback);
            });
        }
        
        ["img-to-c"]( files, cb ){
            loadSettings(settings=>{
                getPalette(settings, palette=>{
                    
                    let pnglist = files.filter( f=>f.type=="PNG" );
                    let pending = new Pending(cb, cb);
                    settings.palette = palette;
                    settings.pending = pending;
                    
                    pnglist.forEach( buffer=>{                        
                        pending.start();
                        let img = new Image();
                        img.src = "file://" + buffer.path + "?" + Math.random();
                        img.onload = _=>{
                            let canvas = document.createElement("canvas");
                            canvas.width = img.width;
                            canvas.height = img.height;
                            let ctx = canvas.getContext("2d");
                            ctx.drawImage(img, 0, 0);
                            let imgData = ctx.getImageData( 0, 0, img.width, img.height );
                            let name = buffer.name.replace(/\..*/, '');
                            let str = convert( imgData, settings, name );
                            let target = APP.findFile(buffer.path.replace(/\.[^\\/.]*$/, '.h'), false);
                            target.data = str;
                            target.modified = true;
                            target.transform = null;
                            APP.writeBuffer(target);
                            
                            settings.pending.done();
                        };
                        
                        img.onerror = _=>{
                            pending.error("Could not load image " + buffer.name);
                        };
                    });
                });
            });
        }

        convertImage( imgData, palette, name ){
            if( Array.isArray(palette) ){
                palette = {palette};
            }
            return convert(imgData, palette);
        }
    });

    function convert( img, settings, name ){
        let transparentIndex = settings.transparent|0;
        let palette = settings.palette;
        let out;
        let bpp = settings.bpp || (Math.log(palette.length) / Math.log(2))|0;

        if( name ){
            out = `// Automatically generated file, do not edit.

#pragma once

const uint8_t ${name}[] = {
${img.width}, ${img.height}`;
        }else{
            out = "";
        }
        
        let i=0, len, bytes, data = img.data;
        let ppb = 8 / bpp;
        let run = [], max = Math.min(palette.length, 1<<bpp);

        let transparent = false;

        for( i=3; !transparent && i<data.length; i+=4 ){
            transparent = data[i] < 128;
        }

        i=0;
        let PC = undefined, PCC = 0;

        for( let y=0; y<img.height; ++y ){
            if(out)
                out += ",\n";
            
            run.length = 0;

            for( let x=0; x<img.width; ++x ){
                let closest = 0;
                let closestDist = Number.POSITIVE_INFINITY;
                let R = data[i++]|0;
                let G = data[i++]|0;
                let B = data[i++]|0;
                let C = (R<<16) + (G<<8) + B;
                let A = data[i++]|0;

                if(C === PC){
                    closest = PCC;
                } else if( A > 128 || !transparent ) {
                    
                    for( let c=0; c<max; ++c ){
                        if( transparent && c == transparentIndex )
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

                let shift = (ppb - 1 - x%ppb) * bpp;
                run[(x/ppb)|0] = (run[(x/ppb)|0]||0) + (closest<<shift);
            }

            out += run.map(c=>"0x"+c.toString(16).padStart(2, "0")).join(",");
        }

        if( name )
            out += "\n};\n";

        return out;
    }

    function getPalette(settings, callback){
        if( Array.isArray(settings.palette) ){
            callback( settings.palette );
        }

        if( typeof settings.palette != "string" )
            settings.palette = "${appPath}/PokittoLib/Pokitto/POKITTO_CORE/PALETTES/palCGA.cpp";
        let fileName = APP.replaceDataInString(settings.palette);
        let file = DATA.projectFiles.find( f=>f.path == fileName );
        if( !file )
            file = APP.findFile(fileName, false);
        
        APP.readBuffer(file, null, (error, data)=>{
            if( data.startsWith("JASC-PAL") ){
                callback(parsePal(data));
            }else{
                callback(parseCPP(data));
            }
        });
    }

    function parsePal(data){
        return data.trim()
            .split("\n")
            .splice(3)
            .map(line=>line.trim().split(/\s+/).map(c=>c|0));
    }

    function parseCPP(data){
        let src = removeComments( data )
            .replace(/^[^{]*/, "")
            .replace(/\}[\s\S]*$/, "");
        let color = [], palette = [color];
        src.replace(/(0x[0-9a-f]{1,2}|[0-9]+)/gi, (m)=>{
            color.push(parseInt(m));
            if( color.length == 3 ){
                color = [];
                palette.push(color);
            }
        });
        palette.pop();
        return palette;
    }

    function parseSettings(settingsFile){
        let flags = [];
        let settings={ transparent:0 };
        
        let typeFlags = DATA.project["PNGFlags"];
        if( typeFlags ){
            if( typeFlags[DATA.project.target] )
                flags.push(...typeFlags[DATA.project.target]);
            if( typeFlags.ALL )
                flags.push( ...typeFlags.ALL );
            if( typeFlags[DATA.buildMode] )
                flags.push( ...typeFlags[DATA.buildMode] );
        }

        flags.forEach(f=>{
            let m = (f+"").match(/^([a-z]+)\s*=\s*(.+)/);
            if( !m ) return;
            settings[ m[1].toLowerCase() ] = m[2].trim();
        });

        if( settings.palette && settings.palette[0] == "[" ){
            settings.palette = JSON.parse(settings.palette);
        }

        if( !settings.bpp ){
            settings.bpp = inferBPP(settingsFile);
        }

        settings.bpp = settings.bpp || 4;
        
        return settings;
    }

    function inferBPP( src ){
        let bpp;
        let modes = {
            HIRES:2,
            HICOLOR:8,
            MODE_HI_4COLOR:4,
            MODE_FAST_16COLOR:4,
            MODE_GAMEBUINO_16COLOR:1,
            MODE_ARDUBOY_16COLOR:1,
            MODE_HI_MONOCHROME:1,
            MODE_HI_GRAYSCALE:4,
            MODE_GAMEBOY:2,
            MODE_256_COLOR:8,
            MODE13:8,
            MIXMODE:8,
            MODE64:8,
            MODE14:3,
            MODE15:4            
        };
        
        src = removeComments(src);

        src.replace(/\s*#define\s+PROJ_([^\s]+)\s*([^\s]*)/mgi, (m, key, value)=>{
            if(modes[key] && value != "0")
                bpp = modes[key];
        });
        
        return bpp;
    }
});

function removeComments( src ){
    return src.replace(/\/\/.*/g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "");
}
