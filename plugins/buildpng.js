APP.addPlugin("BuildPNG", ["Build"], _=> {
    APP.add({

        ["img-to-c"]( files, cb ){
            loadSettings(files, settings=>{
                getPalette(settings, files, palette=>{
                    
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
                            convert(
                                imgData,
                                settings,
                                buffer
                            );
                        };
                        img.onerror = _=>{
                            pending.error("Could not load image " + buffer.name);
                        };
                    });
                });
            });
        }
        
    });

    function loadSettings( files, callback ){
        let buffer = files.find( f=>f.name.toLowerCase()=="my_settings.h" );

        APP.readBuffer( buffer, null, (error, data)=>{
            callback(getSettings(files, data));
        });

    }

    function convert( img, settings, buffer ){
        let name = buffer.name.replace(/\..*/, '');
        let palette = settings.palette;
        let out = `// Automatically generated file, do not edit.

#pragma once

const uint8_t ${name}[] = {
${img.width}, ${img.height}`;
        let i=0, len, bytes, data = img.data;
        let ppb = 8 / settings.bpp;
        let run = [], max = Math.min(palette.length, 1<<settings.bpp);
        for( let y=0; y<img.height; ++y ){
            out += ",\n";
            run.length = 0;

            for( let x=0; x<img.width; ++x ){
                let closest = 0;
                let closestDist = Number.POSITIVE_INFINITY;
                let R = data[i++];
                let G = data[i++];
                let B = data[i++];
                let A = data[i++];

                if( A > 128 ){
                    for( let c=1; c<max; ++c ){
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

                let shift = (ppb - 1 - x%ppb) * settings.bpp;
                run[(x/ppb)|0] = (run[(x/ppb)|0]||0) + (closest<<shift);
            }

            out += run.map(c=>"0x"+c.toString(16).padStart(2, "0")).join(",");
        }
        
        out += "\n};\n";

        let target = APP.findFile(buffer.path.replace(/\.[^\\/.]*$/, '.h'), false);
        target.data = out;
        target.modified = true;
        target.transform = null;
        APP.writeBuffer(target);
        
        settings.pending.done();
    }

    function getPalette(settings, files, callback){
        if( Array.isArray(settings.palette) ){
            callback( settings.palette );
        }

        if( typeof settings.palette != "string" )
            settings.palette = "${appPath}/PokittoLib/Pokitto/POKITTO_CORE/PALETTES/palCGA.cpp";
        let fileName = APP.replaceDataInString(settings.palette);
        let file = files.find( f=>f.path == fileName );
        if( !file )
            file = APP.findFile(fileName, false);
        
        APP.readBuffer(file, null, (error, data)=>{
            let src = removeComments( data ).replace(/^[^{]*/, "");
            let color = [], palette = [color];
            src.replace(/0x[0-9a-f]{2,2}/gi, (m)=>{
                color.push(parseInt(m));
                if( color.length == 3 ){
                    color = [];
                    palette.push(color);
                }
            });
            palette.pop();

            callback(palette);
        });
    }

    function getSettings(files, settingsFile){
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
