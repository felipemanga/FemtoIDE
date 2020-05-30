APP.addPlugin("Release", ["Project"], _=>{

    function concatenate(...arrays) {
        const size = arrays.reduce((a,b) => a + b.byteLength, 0);
        const result = new Uint8Array(size);

        let offset = 0;
        for (let arr of arrays) {
            let tmp = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
            result.set(tmp, offset);
            offset += tmp.byteLength;
        }

        return result;
    }

    APP.add(new class Release {

        release(os){
            if(!DATA.buildFolder){
                log("Make a build first!");
                return;
            }
            const ext = os == "windows" ? ".exe" : "";
            const emuPath = path.join(DATA.appPath, os, "PokittoEmu" + ext);
            const emuBin = fs.readFileSync(emuPath, null);
            const binPath = APP.replaceDataInString((APP.getFlags("emu") || []).filter(x => /.bin$/i.test(x))[0]+"");
            const binBin = fs.readFileSync(binPath, null);
            const imgPath = path.join(DATA.buildFolder, "fs.img");
            const imgBin = fs.readFileSync(imgPath, null);
            const footer = Uint32Array.of(emuBin.length, emuBin.length + binBin.length, imgBin.length, 0x517CC1B6);
            let imgLength = imgBin.length;
            while(imgLength && !imgBin[imgLength-1]) imgLength--;
            const trimBin = new Uint8Array(imgBin.buffer, 0, imgLength);
            footer[3] ^= footer[0] ^ footer[1] ^ footer[2];
            const resultPath = binPath.replace(/.bin$/i, ext);
            const resultBin = concatenate(emuBin, binBin, trimBin, footer);
            fs.writeFileSync(resultPath, resultBin, null);
        }

        releaseAll(){
            if(!DATA.buildFolder){
                APP.log("Make a build first!");
                return;
            }else{
                for(let os of ["linux", "windows"]){
                    this.release(os);
                }
                APP.log("Done!");
            }
        }

        queryMenus(){
            APP.addMenu("Release", {
                "Windows (Emulator)":APP.release.bind(null, "windows"),
                "Linux (Emulator)":APP.release.bind(null, "linux"),
                "All (Emulator)":APP.releaseAll
            });
        }
    });

});
