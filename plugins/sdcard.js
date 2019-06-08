Object.assign(encoding, {
    "IMG":null
});

APP.addPlugin("SDCard", [], _=>{
    let fatfs = require("fatfs");
    
    let image, header, imagePath;
    fs.readFile("www/blank.img", (err, data)=>{
        image = data.buffer;
        header = new Uint8Array(data.buffer, 0, 0x610);
    });
    
    class ABDriver {
        
        constructor(){
            this.sectorSize=512;
            this.numSectors=63488; // 2000
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
        // image.fill(0);
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

                if( !meta[rpath].sdcard || file.type == "directory" )
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
