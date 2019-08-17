Object.assign(encoding, {
    "IMG":null
});

APP.addPlugin("SDCard", [], _=>{
    let fatfs = require("fatfs");
    
    let image, imagePath, nonzero;
    fs.readFile("www/blank.img", (err, data)=>{
        image = data.buffer;
        loadNonZero();
    });

    function loadNonZero(){
        nonzero = {};
        let addr = 0, c = 0;
        let full = new Uint8Array(image);
        for( let i=0; i<full.length; ++i ){
            let b = full[i];
            if( !b ){
                if( addr == -1 )
                    continue;
                c++;
                if( c<128 )
                    continue;
                c = 0;
                nonzero[addr] = full.slice( addr, i-128+1 );
                addr = -1;
            }else{
                c = 0;
                if( addr == -1 )
                    addr = i;
            }
        }
    }
    
    class ABDriver {
        
        constructor(){
            this.sectorSize=512;
            this.numSectors=image.byteLength/this.sectorSize|0;
        }

        readSectors( i, dest, cb ){
	    dest.set( new Uint8Array(image, i*512, dest.length) );
	    cb();
        }
        
        writeSectors( i, data, cb ){
	    new Uint8Array(image, i*512, data.length ).set( data );
	    cb();
        }
    }

    function format(){
        let full = new Uint8Array(image);
        full.fill(0);
        for( let addr in nonzero ){
            let chunk = nonzero[addr];
            full.set( chunk, addr|0 );
        }
        // image.set(header);
    }
    
    class SDCard {

        pollBufferMeta( buffer, meta ){
            if( buffer.type != "directory" )
                meta.sdcard = {
                    type:"bool",
                    label:"Copy to SD",
                    default: false
                };
        }

        ["make-img"]( files, cb ){
            let meta = DATA.project.meta;
            if( !meta ){
                cb();
                return;
            }
            
            const pending = new Pending(_=>{
                imagePath = DATA.buildFolder+path.sep+"fs.img";
                
                fs.writeFile(
                    imagePath,
                    new Uint8Array(image),
                    err => {
                        if( err ) APP.error(err);
                        else cb();
                    }
                );
            });
            
            format();
            const ffs = fatfs.createFileSystem( new ABDriver() );
            files.forEach(file=>{
                if( !file.path.startsWith(DATA.projectPath) )
                    return;
                
                let rpath = file.path
                    .substr(DATA.projectPath.length);

                if( !meta[rpath] || !meta[rpath].sdcard || file.type == "directory" )
                    return;
                
                rpath = rpath.split(path.sep);

                APP.readBuffer( file, null, (err, data)=>{

                    ffs.writeFile(
                        rpath[rpath.length-1],
                        data,
                        err =>{
                            if( err ) pending.error(err);
                            else pending.done();
                        });
                    
                });

                pending.start();
            });
        }

        pollEmulatorFlags(flags){
            if( imagePath ){
                flags.push("-I");
                flags.push(imagePath);
            }
            console.log(flags);
        }
        
    }

    APP.add(new SDCard());
});