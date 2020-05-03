APP.addPlugin("DebugSim", ["Build"], _=>{
    let gdb, standby, pendingCommands, sigSent, wasInit;

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
                if( classes.indexOf("unconditional") == -1 )
                    continue;

                let path = getBreakpointLocation(file, k|0);
                breakpoints.push(path);
            }
        }

        return breakpoints;
    }

    class DebugSim {
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

        runDebug(){
            if(DATA.project.target != DATA.os)
                return;

            wasInit = false;
            sigSent = false;
            pendingCommands = getBreakpoints()
                .map(c => "b " + c);

            pendingCommands.push("r");

            let gdbPath = (DATA[
                "GDB-" + DATA.project.target
            ] || "gdb") + DATA.executableExt;

            let buildFolder = APP.getCPPBuildFolder();

            let ldflags = APP.getFlags("LD");
            let execPath = ldflags[ldflags.indexOf("--output")+1];
            if( !execPath )
                return;

            let flags = [
                "-q",
                "-ex", `dir "${buildFolder}"`,
                "-ex", "set width unlimited",
                "-ex", "set height unlimited",
                "-ex", "set pagination off",
                execPath
            ];

            flags.push(...APP.getFlags("GDB"));

            let dataAcc = "";

            gdb = APP.spawn(gdbPath, {cwd:DATA.projectPath}, ...flags);
            gdb.stdin.setEncoding('utf-8');

            gdb.stdout.on('data', data => {
                data += "";
                dataAcc += data;
                standby = !!data.match(/\(gdb\)\s*$/);
                if( !standby )
                    return;

                sigSent = false;
                wasInit = true;
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
            if(!gdb || !wasInit)
                return;
            this.gdbCommand("load", true);
            pendingCommands.push("run");
        }

        debugRestart(){
            if( !gdb ) return;
            APP.clearHighlight();
            this.gdbCommand("run");
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

        stopEmulator(){
            if(!gdb) return;
            this.stopGDB();
        }

        stopGDB(){
            if( gdb ){
                APP.killChild(gdb);
                setTimeout(_=>{
                    if(gdb)
                        gdb.stdin.write("q\n");
                }, 50);
            }
        }

        debugSim(){
            APP.setTarget(DATA.os);
            if(gdb){
                APP.compile(false);
            } else {
                APP.compile( false, _=>{
                    APP.runDebug();
                });
            }
        }
    }

    APP.add(new class Debugger {
        onOpenProject(){
            new DebugSim();
        }

        queryMenus(){
            APP.addMenu("Simulator", {
                "Start":"debugSim",
                "Restart":"debugRestart",
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
