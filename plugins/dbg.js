APP.addPlugin("Debug", ["Build"], _=>{
    const { spawn } = require('child_process');
    let gdb, standby, pendingCommand;

    class Debug {
        constructor(){
            APP.add(this);
        }

        onCloseProject(){
            APP.remove(this);
        }

        onDebugEmulatorStarted(port){
            pendingCommand = null;
            
            APP.log("Running GDB");
            let gdbPath = DATA[
                "GDB-" + DATA.project.target
            ] + DATA.executableExt;

            let buildFolder = APP.getCPPBuildFolder();

            let flags = [
                "-q",
                "-ex", "target remote :" + port,
                "-ex", "dir" + buildFolder
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

            flags = APP.replaceDataInString(flags);

            APP.log(gdbPath + " " + flags.join(" ") );

            let currentFile;

            gdb = spawn(gdbPath, flags);
            gdb.stdin.setEncoding('utf-8');

            gdb.stdout.on('data', data => {
                data += "";

                let m = data.match(/\s+at\s+([^\n]+):([0-9]+)$/m);
                if( m )
                    currentFile = APP.findFile( m[1], true );
                
                m = data.match(/^([0-9]+)\s+([^\n]*)/m);
                if( m && currentFile )
                    APP.jumpToLine(currentFile, m[1]|0);

                standby = !!data.match(/\(gdb\)\s*$/);

                APP.log("GDB: " + data);
                
                if( standby && pendingCommand ){
                    this.gdbCommand(pendingCommand);
                    pendingCommand = null;
                }

            });

            gdb.stderr.on('data', data => {
                APP.error("GDB: " + data);
            });

            gdb.on('close', code => {
                gdb = null;
                APP.popExecMode("GDB");
                APP.log("GDB ended");
            });

            APP.pushExecMode("GDB");
        }

        onEmulatorStopped(){
            this.stopGDB();
        }

        debugContinue(){
            if( !gdb ) return;

            if( !standby )
                gdb.kill('SIGINT');
            else
                this.gdbCommand("continue");
        }

        debugStepIn(){
            this.gdbCommand("step");
        }

        debugStepOver(){
            this.gdbCommand("next");
        }

        debugStepOut(){
            this.gdbCommand("finish");
        }

        exec( cmd ){
            if( DATA.execMode != "GDB" ) return undefined;
            return this.gdbCommand( cmd );
        }

        gdbCommand( cmd ){
            if( !gdb )
                return;
            
            if( !standby ){
                pendingCommand = cmd;
                return;
            }

            standby = false;
            cmd = (cmd+"").trim();
            APP.log( cmd );
            gdb.stdin.write(cmd + "\n");
        }

        stopGDB(){
            if( gdb ){
                gdb.kill('SIGHUP');
                gdb = null;
            }
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
