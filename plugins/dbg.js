APP.addPlugin("Debug", ["Build"], _=>{
    let gdb, jlink, standby, pendingCommands, sigSent, isEmulator;

    function getBreakpointLocation(buffer, row){
        let translated = [];
        APP.getBreakpointLocation(buffer, row|0, translated);
        let path = buffer.path + ":" + ((row|0)+1);
        if( !translated.length )
            return path;
        let {file, line, address} = translated[0];
        if(address){
            path = "*0x" + parseInt(address).toString(16);
        } else {
            path = translated[0].file+":"+translated[0].line;
        }
        return path;
    }

    function getBreakpoints(){
        let breakpoints = [];
        for( let file of DATA.projectFiles ){
            if( !file.pluginData.breakpoints )
                continue;
            for( let k in file.pluginData.breakpoints ){
                let classes = file.pluginData.breakpoints[k];
                if (!classes) {
                    delete file.pluginData.breakpoints[k];
                    continue;
                }
                if( classes.indexOf("unconditional") == -1 )
                    continue;

                let path = getBreakpointLocation(file, k|0);
                breakpoints.push(path);
            }
        }
        
        return breakpoints;
    }

    class Debug {
        constructor(){
            APP.add(this);
            this._defaultListener = this._defaultListenerUnbound.bind(this);
            this.listener = this._defaultListener;
            this.currentFile = null;
        }

        onCloseProject(){
            APP.remove(this);
        }

        onAddBreakpoint( buffer, row ){
            if( !gdb ) return;
            let path = getBreakpointLocation(buffer, row);
            let oldStandby = standby;
            this.gdbCommand("b " + path, true);
            if( !oldStandby )
                this.gdbCommand("c", true);
        }

        removeAllBreakpoints(){
            for( let file of DATA.projectFiles ){
                if( !file.pluginData.breakpoints )
                    continue;
                for( let k in file.pluginData.breakpoints ){
                    let classes = (file.pluginData.breakpoints[k]||"").split(" ");
                    let index = classes.indexOf("unconditional");
                    if( index == -1 ) continue;
                    classes.splice(index, 1);
                    file.pluginData.breakpoints[k] = classes.join(" ");
                }
            }
            this.gdbCommand("d");
            APP.refreshBreakpoints();
        }

        onRemoveBreakpoint( buffer, row ){
            if( !gdb ) return;
            let path = getBreakpointLocation(buffer, row|0);
            let oldStandby = standby;
            this.gdbCommand("clear " + path, true);
            if( !oldStandby )
                this.gdbCommand("c", true);
        }

        _defaultListenerUnbound( data ){
            let m = data.match(/\s+at\s+([^\n]+):([0-9]+)$/m);
            if( m )
                this.currentFile = APP.findFile( m[1] );
            
            m = data.match(/^([0-9]+)\s+([^\n]*)/m);
            if( m && this.currentFile ){
                let map = APP.sourceMap( this.currentFile.path, m[1]|0 );
                if( map ){
                    let mapFile = DATA.projectFiles
                        .find( file=>file.path==map.file );
                    if( mapFile ){
                        APP.displayBuffer( mapFile );
                        APP.highlightLine( mapFile, map.line, true );
                        m = null;
                    }
                }
                
                if( m ){
                    if(!APP.isViewingDisassembly())
                        APP.displayBuffer( this.currentFile );
                    else {
                        let frame = APP.getTextFrame();
                        if(frame){
                            APP.displayBufferInFrame(this.currentFile,
                                                     frame);
                        }
                    }
                    APP.highlightLine( this.currentFile, m[1]|0, true );
                }
            }

            APP.log("GDB: " + data);
        }

        onDebugEmulatorStarted(port, isJLink){
            isEmulator = !isJLink;

            sigSent = false;
            pendingCommands = getBreakpoints()
                .map(c => "b " + c);

            if( jlink ){
                pendingCommands.unshift("load");
                pendingCommands.push("mon reset 0");
            }

            pendingCommands.push("c");
            
            let name = "GDB-" + DATA.project.target;
            let gdbPath = (DATA.project.BUILDFlags[DATA.project.target]||{})["GDB"] || DATA[name];

            let buildFolder = APP.getCPPBuildFolder();

            let flags = [
                "-q",
                "-ex", "target remote :" + port,
                "-ex", `dir "${buildFolder}"`,
                "-ex", "set width unlimited",
                "-ex", "set height unlimited",
                "-ex", "set pagination off"
            ];

            flags.push(...APP.getFlags("GDB"));

            let dataAcc = "";

            gdb = APP.spawn(gdbPath, ...flags);
            gdb.stdin.setEncoding('utf-8');

            gdb.stdout.on('data', data => {
                data += "";
                dataAcc += data;
                standby = !!data.match(/\(gdb\)\s*$/);
                if( !standby )
                    return;

                sigSent = false;

                let silent = false;

                if( standby ){
                    silent = this.listener != this._defaultListener;
                    let listener = this.listener.bind(null, dataAcc);
                    dataAcc = "";
                    this.listener = this._defaultListener;
                    listener();
                }
                
                if( standby ){
                    if( pendingCommands.length ){
                        this.gdbCommand(pendingCommands.shift());
                    }else if(!silent){
                        APP.onDebugStandby();
                    }
                }

            });

            gdb.stderr.on('data', data => {
                APP.error("GDB: " + data);
            });

            gdb.on('close', code => {
                gdb = null;
                APP.popExecMode("GDB");
                APP.log("GDB ended");
                APP.clearHighlight();
                APP.onDebugStopped();
            });

            APP.pushExecMode("GDB");
        }

        onEmulatorStopped(){
            this.stopGDB();
        }

        sendBreak(){
            if( gdb && !isEmulator )
                gdb.kill('SIGINT');
        }

        onCompileComplete(){
            if(!jlink || !gdb)
                return;
            this.gdbCommand("load", true);
            pendingCommands.push("mon reset 0");
            pendingCommands.push("c");
        }

        debugRestart(){
            if(!gdb) return;
            APP.clearHighlight();
            this.gdbCommand("mon reset 0", true);
            pendingCommands.push("c");
        }

        debugContinue(){
            if( !gdb ) return;

            if( !standby ){
                if( sigSent )
                    return;
                sigSent = true;
                APP.sendBreak();                
            }else{
                APP.clearHighlight();
                this.gdbCommand("continue");
            }
        }

        isDebugging(){
            return gdb ? true : undefined;
        }

        debugStepInstruction(){
            if(!gdb) return;
            APP.clearHighlight();
            this.gdbCommand("si");
        }

        debugNextInstruction(){
            if(!gdb) return;
            APP.clearHighlight();
            this.gdbCommand("ni");
        }

        debugStepIn(){
            if(!gdb) return;
            APP.clearHighlight();
            this.gdbCommand("step");
        }

        debugStepOver(){
            if(!gdb) return;
            APP.clearHighlight();
            this.gdbCommand("next");
        }

        debugStepOut(){
            if(!gdb) return;
            APP.clearHighlight();
            this.gdbCommand("finish");
        }

        exec( cmd ){
            if(!gdb) return undefined;
            if( DATA.execMode != "GDB" ) return undefined;
            return this.gdbCommand( cmd );
        }

        gdbQuery( cmd, cb ){
            if( !gdb )
                return;
            this.gdbCommand({cmd, cb}, true);
        }

        gdbCommand( cmd, enqueue ){
            if( !gdb )
                return;
            
            if( !standby ){
                if( enqueue ){
                    pendingCommands.push(cmd);
                    if( pendingCommands.length == 1 && this.listener == this._defaultListener )
                        this.debugContinue();
                }
                return;
            }

            if( cmd.cmd ){
                this.listener = cmd.cb;
                cmd = cmd.cmd;
            }else{
                this.listener = this._defaultListener;
            }

            standby = false;
            cmd = (cmd+"").trim();

            if( !this.listener )
                APP.log( cmd );

            gdb.stdin.write(cmd + "\n");
        }

        stopGDB(){
            if( gdb )
                APP.killChild(gdb);
        }

        stopEmulator(){
            if( jlink )
                APP.killChild( jlink );
        }

        runJLink(){

            if( jlink ){
                APP.error("JLink already running");
                return;
            }

            let execPath = (DATA[
                "JLINK"
            ] || "JLinkGDBServer") + DATA.executableExt;

            if( !execPath )
                return;

            let flags = [];
            let typeFlags = DATA.project["jlinkFlags"];
            if( typeFlags ){
                if( typeFlags[DATA.project.target] )
                    flags.push(...typeFlags[DATA.project.target]);
                if( typeFlags.ALL )
                    flags.push( ...typeFlags.ALL );
            }else{
                flags = [
                    "-select",
                    "USB",
                    "-device",
                    "LPC11U68",
                    "-endian",
                    "little",
                    "-if",
                    "SWD",
                    "-speed",
                    "4000",
                    "-noir",
                    "-localhostOnly"
                ];
            }

            flags = APP.replaceDataInString(flags);

            APP.setStatus("Running JLink...");
            jlink = APP.spawn( execPath, ...flags );

            setTimeout( _=>{
                if( jlink ){
                    APP.onDebugEmulatorStarted(2331, true);
                }
            }, 500);

            jlink.stdout.on('data', data => {
                console.log(data);
            });

            jlink.stderr.on('data', data => {
                APP.error(data);
            });

            jlink.on('close', code => {
                APP.onEmulatorStopped();
                APP.setStatus("JLink ended");
                jlink = null;
            });

        }

        debugJLink(){
            if( jlink ){
                APP.stopJLink();
            }

            if( gdb ){
                APP.stopEmulator();
                APP.stopGDB();
            }

            APP.compile( false, _=>{
                APP.runJLink();
            });
        }

        debug(){
            // APP.setTarget("Pokitto");
            if( gdb && !jlink ){
                APP.stopEmulator();
                APP.stopGDB();
                APP.compile( false, _=>{
                    APP.runDebug();
                });
            } else if(gdb && jlink) {
                APP.compile( false );
            } else {
                APP.compile( false, _=>{
                    APP.runDebug();
                });
            }
        }
    }

    APP.add(new class Debugger {
        onOpenProject(){
            new Debug();
        }

        queryMenus(){
            APP.addMenu("Debug", {
                "Start":"debug",
                "Start J-Link":"debugJLink",
                "Restart": "debugRestart",
                "Stop":"stopEmulator",
                "Continue / Pause":"debugContinue",
                "Step In":"debugStepIn",
                "Step Over":"debugStepOver",
                "Step Out":"debugStepOut",
                "Step Instruction":"debugStepInstruction",
                "Next Instruction":"debugNextInstruction",
                "Clear breakpoints":"removeAllBreakpoints"
            });
        }
    });
});
