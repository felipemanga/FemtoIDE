APP.addPlugin("Disasm", [], _=>{
    let buffer = new Buffer();
    buffer.name = "*Disassembly*";
    buffer.type = "S";

    APP.add(new class Disasm {

        queryMenus(){
            APP.addMenu("Build", {
                "Disassemble":APP.disassemble
            });
        }

        disassemble(){
            let dumpPath = (
                DATA["OBJDUMP-" + DATA.project.target] ||
                    DATA["ELF2BIN-" + DATA.project.target].replace(/objcopy$/i, "objdump")
            ) + DATA.executableExt;

            let flags = [];
            let typeFlags = DATA.project["LDFlags"];
            if( typeFlags ){
                if( typeFlags[DATA.project.target] )
                    flags.push(...typeFlags[DATA.project.target]);
                if( typeFlags.ALL )
                    flags.push( ...typeFlags.ALL );
                if( typeFlags[DATA.releaseMode] )
                    flags.push( ...typeFlags[DATA.buildMode] );
            }else typeFlags = ["${projectPath}/${projectName}.elf"];
            let elf = flags.find(x=>/\.elf$/i.test(x));

            let acc = "";
            APP.spawn(dumpPath, "-lSD", elf)
                .on("data-err", (err)=>{
                    APP.error(err);
                })
                .on("data-out", (data)=>{
                    acc += data;
                })
                .on("close", ()=>{
                    buffer.data = acc;
                    APP.displayBuffer(buffer);
                });
        }
    });
});
