APP.addPlugin("Debug", ["Build"], _=>{
    let gdb, standby, pendingCommands, sigSent;

    function getBreakpoints(){
        let breakpoints = [];
        for( let file of DATA.projectFiles ){
            if( !file.pluginData.breakpoints )
                continue;
            for( let k in file.pluginData.breakpoints ){
                let classes = file.pluginData.breakpoints[k];
                if( classes.indexOf("unconditional") == -1 )
                    continue;
                
                let translated = [];
                APP.getBreakpointLocation(file, k|0, translated);
                let path = file.path + ":" + ((k|0)+1);
                if( translated.length )
                    path = translated[0].file+":"+translated[0].line;
                breakpoints.push(path);
            }
        }
        
        return breakpoints;
    }

    class Debug {
        constructor(){
            APP.add(this);
        }

        onCloseProject(){
            APP.remove(this);
        }

        onAddBreakpoint( buffer, row ){
            if( !gdb ) return;
            let translated = [];
            APP.getBreakpointLocation(buffer, row|0, translated);
            let path = buffer.path + ":" + ((row|0)+1);
            if( translated.length )
                path = translated[0].file+":"+translated[0].line;
            let oldStandby = standby;
            this.gdbCommand("b " + path, true);
            if( !oldStandby )
                this.gdbCommand("c", true);
        }

        onRemoveBreakpoint( buffer, row ){
            if( !gdb ) return;
            let path = buffer.path + ":" + ((row|0)+1);
            let translated = [];
            APP.getBreakpointLocation(buffer, row|0, translated);
            if( translated.length )
                path = translated[0].file+":"+translated[0].line;
            let oldStandby = standby;
            this.gdbCommand("clear " + path, true);
            if( !oldStandby )
                this.gdbCommand("c", true);
        }

        onDebugEmulatorStarted(port){
            sigSent = false;
            
            pendingCommands = getBreakpoints()
                .map(c => "b " + c);
            pendingCommands.push("c");
            
            let gdbPath =DATA[
                "GDB-" + DATA.project.target
            ] + DATA.executableExt;

            let buildFolder = APP.getCPPBuildFolder();

            let flags = [
                "-q",
                "-ex", "target remote :" + port,
                "-ex", `dir "${buildFolder}"`
            ];
            
            let typeFlags = DATA.project["GDBFlags"];
            if( typeFlags ){
                if( typeFlags[DATA.project.target] )
                    flags.push(...typeFlags[DATA.project.target]);
                if( typeFlags.ALL )
                    flags.push( ...typeFlags.ALL );
                if( typeFlags[DATA.releaseMode] )
                    flags.push( ...typeFlags[DATA.buildMode] );
            }

            let currentFile;

            gdb = APP.spawn(gdbPath, ...flags);
            gdb.stdin.setEncoding('utf-8');

            gdb.stdout.on('data', data => {
                data += "";

                let m = data.match(/\s+at\s+([^\n]+):([0-9]+)$/m);
                if( m )
                    currentFile = APP.findFile( m[1], true );
                
                m = data.match(/^([0-9]+)\s+([^\n]*)/m);
                if( m && currentFile ){
                    let map = APP.sourceMap( currentFile.path, m[1]|0 );
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
                        APP.displayBuffer( currentFile );
                        APP.highlightLine( currentFile, m[1]|0, true );
                    }
                }

                standby = !!data.match(/\(gdb\)\s*$/);
                if( standby )
                    sigSent = false;                    

                APP.log("GDB: " + data);

                if( standby && pendingCommands.length ){
                    let cmd = pendingCommands.shift();
                    this.gdbCommand(cmd);
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
            });

            APP.pushExecMode("GDB");
        }

        onEmulatorStopped(){
            this.stopGDB();
        }

        debugContinue(){
            if( !gdb ) return;

            if( !standby ){
                if( sigSent )
                    return;
                sigSent = true;
                gdb.kill('SIGINT');
            }else{
                APP.clearHighlight();
                this.gdbCommand("continue");
            }
        }

        debugStepIn(){
            APP.clearHighlight();
            this.gdbCommand("step");
        }

        debugStepOver(){
            APP.clearHighlight();
            this.gdbCommand("next");
        }

        debugStepOut(){
            APP.clearHighlight();
            this.gdbCommand("finish");
        }

        exec( cmd ){
            if( DATA.execMode != "GDB" ) return undefined;
            return this.gdbCommand( cmd );
        }

        gdbCommand( cmd, enqueue ){
            if( !gdb )
                return;
            
            if( !standby ){
                if( enqueue ){
                    pendingCommands.push(cmd);
                    this.debugContinue();
                }
                return;
            }
            
            standby = false;
            cmd = (cmd+"").trim();
            APP.log( cmd );
            gdb.stdin.write(cmd + "\n");
        }

        stopGDB(){
            if( gdb )
                APP.killChild(gdb);
        }

        debug(){
            if( gdb ){
                APP.stopEmulator();
                APP.stopGDB();
            }

            APP.compile( false, _=>{
                APP.runDebug();
            });
        }
    }

    APP.add({
        onOpenProject(){
            new Debug();
        },

        queryMenus(){
            APP.addMenu("Debug", {
                "Start":"debug",
                "Stop":"stopEmulator",
                "Continue / Pause":"debugContinue",
                "Step In":"debugStepIn",
                "Step Over":"debugStepOver",
                "Step Out":"debugStepOut"
            });
        }
    });
});
