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

        debugStepInstruction(){
            if(!APP.isViewingDisassembly())
                this.disassemble();
        }

        debugNextInstruction(){
            if(!APP.isViewingDisassembly())
                this.disassemble();
        }

        disassemble(){
            if( APP.isDebugging() ){
                buffer.data = null;
                APP.displayBuffer(buffer);
                return;
            }

            let dumpPath = (
                DATA["OBJDUMP-" + DATA.project.target] ||
                    DATA["ELF2BIN-" + DATA.project.target].replace(/objcopy$/i, "objdump")
            ) + DATA.executableExt;

            let flags = APP.getFlags["LD"];
            if(!flags)
                flags = ["${projectPath}/${projectName}.elf"];
            let elf = flags.find(x=>/\.elf$/i.test(x));

            let acc = "";
            APP.spawn(dumpPath, "-lSD", "-Mforce-thumb", elf)
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
