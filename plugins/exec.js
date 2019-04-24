APP.addPlugin("Exec", [], _=>{
    const modes = [];

    APP.customSetVariables({ execMode:"APP" });

    APP.add({
        pushExecMode( mode ){
            let i = modes.indexOf(mode);
            if( i != -1 ){
                modes.length = i+1;
            }else{
                modes.push( mode );
            }
            DATA.execMode = mode;
        },

        exec( cmd ){
            if( DATA.execMode != "APP" ) return undefined;
            const m = cmd.match(/^\s*([^(\s]+)\s*\((.*)\)$/);
            if( !m ) return undefined;
            const name = m[1];
            const args = JSON.parse(`[` + m[2] + `]`);
            return APP[ name ]( ...args );
        }
    });
});
