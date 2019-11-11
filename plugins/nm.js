APP.addPlugin("NM", [], _=>{
    let buffer;
    
    class NMView {
        constructor( frame, buffer ){
            APP.add(this);

            let container = this.container = DOC.create("div", {
                className:"NMContainer"
            }, frame);

            this.list = DOC.create(
                "ul",
                {className:"LineList"},
                container
            );

            this.root = null;
            this.nm();
        }

        nm(data){
            this.container.parentElement.style.display = "block";
            APP.onResize();
            this.list.innerHTML = '';

            let execPath;
            if( ("NM-" + DATA.project.target) in DATA ){
                execPath = DATA[
                    "NM-" + DATA.project.target
                ] + DATA.executableExt;
            } else {
                execPath = DATA[
                    "GDB-" + DATA.project.target
                ].replace(/gdb$/, "nm") + DATA.executableExt;
            }

            let flags = [];

            let typeFlags = DATA.project["GDBFlags"];
            if( typeFlags ){
                if( typeFlags[DATA.project.target] )
                    flags.push(...typeFlags[DATA.project.target]);
                if( typeFlags.ALL )
                    flags.push( ...typeFlags.ALL );
                if( typeFlags[DATA.releaseMode] )
                    flags.push( ...typeFlags[DATA.buildMode] );
            }

            flags = flags.filter(f=>/\.elf$/i.test(f));

            let acc = "";
            APP.spawn(execPath, "--print-size", "--size-sort", "-r", "--radix=d", ...flags)
                .on("data-out", str=>{
                    acc += str;
                })
                .on("data-err", err=>{
                    APP.error(err);
                })
                .on("close", _=>{
                    (acc+"")
                        .trim()
                        .split("\n")
                        .slice(0, 20)
                        .forEach((l, i)=>{
                            DOC.create("li", {text:l}, this.list);
                        });
                });
        }

        clearNM(){
            this.container.parentElement.style.display = "none";
            APP.onResize();
        }
    }

    APP.add({

        pollViewForBuffer( buffer, vf ){

            if( buffer.name == "*NM View*" ){
                vf.view = NMView;
                vf.priority = 999;
            }
            
        },

        nm(data){
            
            if( !buffer ){
                buffer = new Buffer();
                buffer.name = "*NM View*";
                buffer.data = data;
                APP.displayBufferInRightFrame(buffer);            
            }

        },

        queryMenus(){
            APP.addMenu("Debug", {
                "Statistics":APP.nm
            });
        }

    });

});
