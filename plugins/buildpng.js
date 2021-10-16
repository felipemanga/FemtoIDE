Object.assign(encoding, {
    "PNG":null,
    "BMP":null,
    "JPG":null,
    "GIF":null,
    "I16":null,
    "I8":null,
    "I4":null,
    "I2":null
});

APP.addPlugin("BuildPNG", ["Build", "Project"], _=> {
    let extensions = [
        "PNG",
        "JPG",
        "GIF"
    ];

    let innerHTML = (function(){
        const p = DATA.appPath + path.sep + "plugins" + path.sep + "imageview.html";
        try {
            return fs.readFileSync(p, "utf-8");
        }catch(ex){
            return "Could not find '" + p + "'";
        }
    })();

    const settingsBuffer = new Buffer(false);
    settingsBuffer.type = "image settings";
    settingsBuffer.name = "Conversion Settings";

    let cachedBPP = null;
    let cachedPalette = {};

    function getBufferURL(buffer){
        return "file://" + buffer.path + "?" + Math.random();
    }
    
    function loadSettings( buffer ){
        let flags = buffer ? APP.getBufferMeta(buffer, "PNGFlags") : [];
        return parseSettings(flags);
    }

    class ImageView {
        constructor(frame, buffer){
            this.buffer = null;
            this.frame = frame;
            this.DOM = null;
        }

        attach(){
            this.buffer = settingsBuffer.pluginData.imageBuffer;
            settingsBuffer.pluginData.imageBuffer = null;
            this.refresh();
        }

        reattach(){
            this.buffer = settingsBuffer.pluginData.imageBuffer;
            settingsBuffer.pluginData.imageBuffer = null;
            this.refresh();
        }

        redraw(){
            if(!this.buffer)
                return;

            let settings = loadSettings(this.buffer);
            getImageData(this.buffer, imgData => {
                if(!imgData)
                    return;
                cachedPalette = {};
                getPalette(settings, palette=>{
                    settings = Object.assign({}, settings, {
                        header: true,
                        palette
                    });

                    let u8 = convertToU8( imgData, settings );
                    let I = 0;
                    let bpp = settings.bpp|0;
                    let transparent = undefined;
                    if(settings.transparent|0)
                        transparent = settings.transparentIndex|0;
                    let palOffset = settings.paloffset|0;

                    for(let y = 0; y < imgData.height; ++y){
                        if(bpp == 1){
                            for(let x = 0; x < imgData.width;){
                                let ci = (u8[y+1][x>>3]|0);
                                for(let j=0; j<8; ++j, ++x){
                                    let c = (ci & (1 << (7 - j))) ? 0xFF : 0;
                                    let I = (y * imgData.width + x) * 4;
                                    imgData.data[I++] = c;
                                    imgData.data[I++] = c;
                                    imgData.data[I++] = c;
                                    imgData.data[I++] = c;
                                }
                            }

                        } else if(bpp == 4){
                            for(let x = 0; x < u8[1].length; ++x){
                                let ci = u8[y+1][x];
                                let c = palette[(ci >> 4) + palOffset] || [];
                                imgData.data[I++] = c[0];
                                imgData.data[I++] = c[1];
                                imgData.data[I++] = c[2];
                                imgData.data[I++] = ci == transparent ? 0 : 255;

                                c = palette[(ci & 0xF) + palOffset] || [];
                                imgData.data[I++] = c[0];
                                imgData.data[I++] = c[1];
                                imgData.data[I++] = c[2];
                                imgData.data[I++] = ci == transparent ? 0 : 255;
                            }
                        }else if(bpp == 8){
                            for(let x = 0; x < imgData.width; ++x){
                                let ci = (u8[y+1][x]|0) + palOffset;
                                let c = palette[ci] || [];
                                imgData.data[I++] = c[0];
                                imgData.data[I++] = c[1];
                                imgData.data[I++] = c[2];
                                imgData.data[I++] = ci == transparent ? 0 : 255;
                            }
                        }else if(bpp == 16){
                            for(let x = 0; x < imgData.width; ++x){
                                let ci = u8[y+1][x*2] | (u8[y+1][x*2+1] << 8);
                                if(ci == transparent){
                                    I += 4;
                                    continue;
                                }

                                imgData.data[I++] = ((ci >> 11)&0x1F)/0x1F*0xFF;
                                imgData.data[I++] = ((ci >> 5)&0x3F)/0x3F*0xFF;
                                imgData.data[I++] = (ci & 0x1F)/0x1F*0xFF;
                                I++;
                            }
                        }
                    }

                    let canvas = this.DOM.convertedPreview;
                    canvas.width = u8[0][0];
                    canvas.height = u8[0][1];
                    let ctx = canvas.getContext("2d");
                    ctx.putImageData(imgData, 0, 0);
                });
            });
        }

        refresh(){
            let buffer = this.buffer;
            if(!buffer)
                return;

            this.frame.innerHTML = "";

            let settings = {};
            let locals = {};

            let DOM = this.DOM = DOC.index(DOC.create(this.frame, "div", {
                className: "innerView",
                innerHTML: APP.replaceDataInString(innerHTML)
            }), null, {

                globalConvertAutomatically: {
                    change: _=> update.call(this, "automatic", (DOM.globalConvertAutomatically.value != "No") | 0)
                },

                globalPalettePath: {
                    change: _=> update.call(this, "palette", DOM.globalPalettePath.value)
                },

                globalType: {
                    change: _=> update.call(this, "cpptype", DOM.globalType.value)
                },

                globalTransparent: {
                    change: _=> update.call(this, "settings", DOM.globalTransparent.value | 0)
                },

                globalBPP: {
                    change: _=> update.call(this, "bpp", DOM.globalBPP.value|0)
                },

                localConvertAutomatically: {
                    change: _=> update.call(this, "automatic", {"Yes":1, "No":0}[DOM.localConvertAutomatically.value], true)
                },
                localIsTransparent: {
                    change: _=> update.call(this, "isTransparent", {"Yes":1, "No":0}[DOM.localIsTransparent.value], true)
                },
                localBinary: {
                    change: _=> update.call(this, "binary", {"Yes":1, "No":0}[DOM.localBinary.value], true)
                },
                localRLE: {
                    change: _=> update.call(this, "rle", {"Yes":1, "No":0}[DOM.localRLE.value], true)
                },
                localHasHeader: {
                    change: _=> update.call(this, "header", {"Yes":1, "No":0}[DOM.localHasHeader.value], true)
                },
                localTransparent: {
                    change: _=> update.call(this, "transparent", DOM.localTransparent.value || undefined, true)
                },
                localPalettePath: {
                    change: _=> update.call(this, "palette", DOM.localPalettePath.value || undefined, true)
                },
                localType: {
                    change: _=> update.call(this, "cpptype", DOM.localType.value)
                },
                localBPP: {
                    change: _=> update.call(this, "bpp", (DOM.localBPP.value|0) || undefined, true)
                },
                localPalOffset: {
                    change: _=> update.call(this, "paloffset", (DOM.localPalOffset.value|0) || undefined, true)
                }
            });

            let s = settings = loadSettings();
            DOM.localHeader.innerText = buffer.name + " Conversion Settings";
            DOM.globalConvertAutomatically.value = s.automatic != "0" ? "Yes" : "No";
            DOM.globalPalettePath.value = s.palette;
            DOM.globalType.value = s.cpptype;
            DOM.globalTransparent.value = s.transparent ? "Yes" : "No";
            DOM.globalBPP.value = s.bpp|0;
            DOM.originalPreview.src = getBufferURL(buffer);

            s = locals = parseFlags(APP.getBufferMeta(buffer).PNGFlags);
            DOM.localConvertAutomatically.value = {"undefined":"Inherit", "0":"No", "1":"Yes"}[s.automatic];
            DOM.localIsTransparent.value = {"undefined":"Inherit", "0":"No", "1":"Yes"}[s.isTransparent];
            DOM.localBinary.value = {"undefined":"Inherit", "0":"No", "1":"Yes"}[s.binary];
            DOM.localRLE.value = {"undefined":"Inherit", "0":"No", "1":"Yes"}[s.rle];
            DOM.localHasHeader.value = {"undefined":"Inherit", "0":"No", "1":"Yes"}[s.header];
            DOM.localPalettePath.value = s.palette || "";
            DOM.localType.value = s.cpptype || "";
            DOM.localBPP.value = s.bpp|0;
            DOM.localPalOffset.value = s.paloffset|0;

            this.redraw();

            function update(key, value, isLocal){
                let old;
                if(isLocal){
                    old = locals[key];
                    if(value === undefined)
                        delete locals[key];
                    else
                        locals[key] = value;
                }else{
                    old = settings[key];
                    settings[key] = value;
                }

                if(old == value)
                    return;

                if(!DATA.project.PNGFlags)
                    DATA.project.PNGFlags = {};

                DATA.project.PNGFlags.ALL = rebuildFlags(settings);
                APP.setBufferMeta(buffer, "PNGFlags", rebuildFlags(locals));
                
                APP.dirtyProject();

                this.redraw();
            }
        }
    };

    APP.add(new class BuildPNG {

        getPalette( callback, buffer ){
            cachedPalette = {};
            getPalette(loadSettings(buffer), callback);
        }

        pollBufferMeta( buffer, meta ){
            if( DATA.project.javaFlags )
                return;

            if(extensions.indexOf(buffer.type) == -1)
                return;

            meta.PNGFlags = { hidden: true };
        }

        pollBufferActions(buffer, actions){
            if(extensions.indexOf(buffer.type) == -1)
                return;
            actions.push({
                type: "button",
                label: "Conversion...",
                cb: _=>{
                    settingsBuffer.pluginData.imageBuffer = buffer;
                    APP.displayBuffer(settingsBuffer);
                }
            });            
        }

        pollViewForBuffer( buffer, vf ){

            if( buffer == settingsBuffer ){
                vf.view = ImageView;
                vf.priority = 99;
            }
            
        }        
        
        ["img-to-c"]( files, cb ){
            cachedBPP = null;
            cachedPalette = {};

            let pnglist = files.filter( f=>extensions.indexOf(f.type) != -1 );
            let pending = new Pending(cb, cb);
            pnglist.forEach( buffer=>{
                let settings = loadSettings(buffer);
                if(!(settings.automatic|0))
                    return;

                settings.pending = pending;
                pending.start();
                getImageData(buffer, data => {
                    if(data){
                        onLoadImage(
                            data,
                            buffer,
                            settings,
                            _=>{
                                pending.done();
                            }
                        );
                    } else {
                        pending.error("Could not load image " + buffer.name);
                    }
                });
            });

            function onLoadImage(imgData, buffer, settings, cb){
                getPalette(settings, palette=>{
                    settings.palette = palette;

                    let name = buffer.name.replace(/\..*/, '');
                    let str = convert( imgData, settings, name );
                    let ext = settings.binary|0 ? '.i' + settings.bpp : '.h';
                    let target = APP.findFile(buffer.path.replace(/\.[^\\/.]*$/, ext), false);
                    target.data = str;
                    target.modified = true;
                    target.transform = null;
                    APP.writeBuffer(target);

                    cb();
                });
            }
        }

        convertImage( imgData, palette, name ){
            if( Array.isArray(palette) ){
                palette = {palette};
            }
            return convert(imgData, palette);
        }
    });

    function getImageData(buffer, callback){
        let img = new Image();
        img.src = getBufferURL(buffer);

        img.onload = _=>{
            let canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            callback(ctx.getImageData( 0, 0, img.width, img.height ));
        };

        img.onerror = _=>{
            callback();
        };
    }

    function convertToU8(img, settings){
        let transparentIndex = settings.transparent|0;
        let palette = settings.palette;
        let out = (settings.header|0) ? [[
            img.width < 256 ? img.width : 0,
            img.height < 256 ? img.height : 0
        ]] : [];
        let bpp = (settings.bpp|0) || (Math.log(palette.length) / Math.log(2))|0;
        let i=0, len, bytes, data = img.data;
        let ppb = 8 / bpp;
        let run = [],
            min = settings.paloffset|0,
            max = Math.min(palette.length, min+(1<<bpp));

        let transparent = settings.isTransparent;

        if (transparent === undefined){
            for( i=3; !transparent && i<data.length; i+=4 ){
                transparent = data[i] < 128;
            }
        } else transparent = transparent|0;
        settings.isTransparent = transparent;

        i=0;
        let PC = undefined, PCC = 0;

        for( let y=0; y<img.height; ++y ){

            run = [];

            for( let x=0; x<img.width; ++x ){
                let closest = 0;
                let closestDist = Number.POSITIVE_INFINITY;
                let R = data[i++]|0;
                let G = data[i++]|0;
                let B = data[i++]|0;
                let A = data[i++]|0;
                if(bpp == 16) {
                    let C = (R>>3<<11) | (G>>2<<5) | (B>>3);
                    run.push(C&0xFF, C>>8);
                } else if(bpp == 1) {
                    if (transparent) {
                        closest = A > 128;
                    } else {
                        closest = (R + G + B) / 3 > 128;
                    }

                    run[x>>3|0] = (run[x>>3]||0) + (closest<<(7 - (x&7)));
                } else {
                    let C = (R<<16) + (G<<8) + B;
                    if( A > 128 || !transparent ) {
                        if(C === PC){
                            closest = PCC;
                        } else {

                            for( let c=min; c<max; ++c ){
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

                        }

                    }else{
                        closest = transparentIndex;
                    }

                    let shift = (ppb - 1 - x%ppb) * bpp;
                    run[(x/ppb)|0] = (run[(x/ppb)|0]||0) + ((closest-min)<<shift);
                }
            }

            out.push(run);
        }

        return out;
    }

    function compressRLE(src, settings) {
        if ((settings.bpp|0) != 8 || !(settings.isTransparent|0))
            return src;

        let [w, h] = src[0];

        if (w > 255 | h > 255)
            return src;

        let out = [[w, h], []];
        for (let y = 0; y < h; ++y) {
            let x = 0;
            let row = src[y + 1];
            let outRow = [];
            do {
                skip = 0;
                for (; x < w && !row[x]; x++, skip++);
                outRow.push(skip);
                if (x < w) {
                    let s = outRow.length;
                    outRow.push(0);
                    skip = 0;
                    for (; x < w && row[x]; x++, skip++)
                        outRow.push(row[x]);
                    outRow[s] = skip;
                }
            } while (x < w);
            out[y + 2] = outRow;
            out[1][y] = outRow.length;
        }

        return out;
    }

    function convert( img, settings, name ){
        let u8 = convertToU8(img, settings);

        if (settings.rle|0)
            u8 = compressRLE(u8, settings);

        if (settings.binary|0) {
            let total = 0;
            for(let arr of u8)
                total += arr.length;
            let out = new Uint8Array(total);
            total = 0;
            for(let arr of u8){
                for(let i=0; i<arr.length; ++i){
                    out[total++] = arr[i];
                }
            }
            return out;
        }

        let out = "";
        if( name ){
            out = `// Automatically generated file, do not edit.

#pragma once

${settings.cpptype} ${name}[] = {
`;
        }

        for(let row of u8){
            out += row.map(c=>"0x"+c.toString(16).padStart(2, "0")).join(",") + ",\n";

        }

        if( name )
            out += "};\n";

        return out;
    }

    function getPalette(settings, callback){
        if( Array.isArray(settings.palette) ){
            callback( settings.palette );
            return;
        }

        if( typeof settings.palette != "string" )
            settings.palette = "${appPath}/PokittoLib/Pokitto/POKITTO_CORE/PALETTES/palCGA.cpp";
        let fileName = APP.replaceDataInString(settings.palette);

        if(fileName in cachedPalette){
            callback(cachedPalette[fileName]);
            return;
        }

        let file = DATA.projectFiles.find( f=>f.path == fileName );
        if( !file )
            file = APP.findFile(fileName, false);
        
        APP.readBuffer(file, null, (error, data)=>{
            let palette = [];
            if(error){
                APP.log("Error: Could not load palette from: \n" + file);
            }else if( data.startsWith("JASC-PAL") ){
                palette = parsePal(data);
            }else{
                palette = parseCPP(data);
            }
            cachedPalette[fileName] = palette;
            callback(palette);
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
            .replace(/^([^{]*\{)*/g, "")
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

    function parseFlags(flags){
        let settings = {};

        if(!Array.isArray(flags))
            return settings;

        flags.forEach(f=>{
            let m = (f+"").match(/^([a-z]+)\s*=\s*(.+)/);
            if( !m ) return;
            settings[ m[1].toLowerCase() ] = m[2].trim();
        });

        return settings;
    }

    function parseSettings(imageMeta){
        let flags = APP.getFlags("PNG");
        let settings = {
            transparent: 0,
            automatic: 1,
            bpp:cachedBPP,
            cpptype:"inline constexpr uint8_t",
            paloffset: 0,
            binary: 0,
            rle: 0,
            header: 1
        };

        Object.assign(settings, parseFlags(flags));
        Object.assign(settings, parseFlags(imageMeta));

        if( settings.palette && settings.palette[0] == "[" ){
            settings.palette = JSON.parse(settings.palette);
        }

        if( !settings.bpp )
            settings.bpp = cachedBPP = inferBPP();

        settings.bpp = settings.bpp || 4;


        let max = 1 << (settings.bpp|0);

        settings.paloffset = Math.max(0, Math.min(settings.paloffset|0, 256 - max));

        return settings;
    }

    function rebuildFlags(settings){
        let flags = [];
        for(let key in settings){
            flags.push(`${key}=${settings[key]}`);
        }
        return flags;
    }

    function inferBPP(){
        let buffer = DATA
            .projectFiles
            .find( f=>f.name.toLowerCase()=="my_settings.h" );
        let src = "";

        if( buffer )
            src = APP.readBufferSync( buffer, null );

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
            MODE15:4,
            TASMODE:8,
            TASMODELOW:8
        };
        
        src = removeComments(src);

        src.replace(/\s*#define\s+PROJ_([^\s]+)\s*([^\s]*)/mgi, (m, key, value)=>{
            if(key == "SCREENMODE")
                bpp = modes[value];
            else if(modes[key] && value != "0")
                bpp = modes[key];
        });
        
        return bpp;
    }
});

function removeComments( src ){
    return src.replace(/\/\/.*/g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "");
}
