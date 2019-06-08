const fs = require("fs");
const path = require("path");
let config = {
};

const APP = new Proxy(new Pool(), {
    get:(function(){
        let cache = {};
        return function(pool, key){

            if( key in cache )
                return cache[key];

            if( key in pool )
                return cache[key] = pool[key].bind(pool);

            return cache[key] = pool.call.bind(pool, key);
        };
    })()
});

require("process").on("uncaughtException", function(e) {
    APP.error(e);
});

class Pending {
    constructor( cb, err ){
        let count = 1;
        this.done = done.bind(this);
        this.start = _=>count++;
        this.error = err;
        
        function done(){
            count--;
            if( !count )
                cb();
        }

        setTimeout( this.done, 1 );
    }

}

let nextBufferId = 1;
class Buffer {

    constructor( killable ){
        DATA.buffers.push( this );
        this.encoding = "utf-8";
        this.transform = null;
        this.modified = false;
        this.path = "";
        this.name = "";
        this.type = "";
        this.data = null;
        this.views = [];
        this.killable = killable;
        this.id = nextBufferId++;
        this.pluginData = {};
    }

    kill(){
        
        let index = DATA.buffers.indexOf(this);
        if( index == -1 )
            return;

        DATA.buffers.splice(index, 1);
        APP.onKillBuffer( this );

        this.views.forEach( ({view}) =>{
            if( typeof view.kill != "function" )
                return;
            
            try{
                view.kill();
            }catch(ex){
                console.error( ex.message );
            }
        });
        
    }
    
};

const frameSeparator = [
    "div",
    {
        "className":"frameSeparator",
        "onmousedown":"APP.focusSeparator(this)"
    }
];

const frameLayout = [
    "div", { "className":"frame" }
];

class Frame {

    constructor( ){
        APP.add(this);
        this.currentSeparator = null;
        this.currentFrame = null;
    }

    focusSeparator( separator ){
        console.log("Focussing separator: ", separator);
        this.currentSeparator = separator;
    }

    onMouseMove( event ){
        if( !this.currentSeparator )
            return;
        
    }

    createFrameInParent( parent, horizontal ){
        
        if( !parent ) return null;
        
        if( parent.childElementCount )
            DOC.create( ...frameSeparator, parent );
        
        this.currentFrame = DOC.create( ...frameLayout, parent );
        
        return this.currentFrame;

    }

    renameBuffer( buffer, newName ){
        if( !buffer || !newName || typeof newName != "string" )
            return; // prompt for buffer to rename?

        if( !buffer.path )
            throw "Buffer not saved";

        fs.rename(buffer.path, newName, err=>{
            if( err ) throw err;
            else{
                buffer.path = newName;
                buffer.name = newName.split(/[\\/]/).pop();
                APP.onRenameBuffer( buffer );
            }
        });
    }

    deleteBuffer( buffer ){
        if( !buffer || !buffer.path )
            return;
        fs.unlink(buffer.path, err=>{
            if( err ) throw err;
            else{
                APP.killBuffer( buffer );
                APP.onDeleteBuffer( buffer );
            }
        });
    }

    killBuffer( name ){
        
        let index = DATA.buffers.findIndex(
            buffer => buffer.name == name || buffer == name
        );
        
        if( index == -1 )
            return false;
        
        let buffer = DATA.buffers[index];
        if( buffer.killable === false )
            return false;

        let next = DATA.buffers[index+1] || DATA.buffers[index-1];
        
        buffer.views.forEach( v => {
            if( v.frame )
                APP.displayBufferInFrame( next, v.frame );
        });
        
        buffer.kill();
        
        return true;
        
    }

    killAllBuffers(){
        
        let buffers = DATA.buffers;
        let unkillable = 0;
        while( buffers.length != unkillable ){
            if( !this.killBuffer( buffers[unkillable] ) )
                unkillable++;
        }
        
    }

    displayBuffer( buffer ){
        if( !this.currentFrame )
            APP.createFrameInParent(document.querySelector("#contents"));

        return APP.displayBufferInFrame( buffer, this.currentFrame );
    }

    displayBufferInRightFrame( buffer, horizontal ){
        let currentFrame = this.currentFrame;
        const parent = document.querySelector("#contents");
        const frame = APP.createFrameInParent(parent, horizontal);
        let ret = APP.displayBufferInFrame( buffer, frame );
        this.currentFrame = currentFrame;
        return frame;
    }

    displayBufferInLeftFrame( buffer, horizontal ){
        let currentFrame = this.currentFrame;
        const parent = document.querySelector("#contents");
        const frame = APP.createFrameInParent(parent, horizontal);
        frame.remove();
        parent.insertBefore( frame, currentFrame );
        this.currentFrame = currentFrame;
        let ret = APP.displayBufferInFrame( buffer, frame );
        return frame;
    }

    displayBufferInFrame( buffer, frame ){

        if( typeof buffer == "string" )
            buffer = DATA.buffers.find( b => b.name == buffer );
        
        if( !buffer )
            return false;

        DATA.buffers.forEach( b => {
            b.views.forEach( v => {
                if( v.frame == frame ){
                    v.frame = null;
                    if( v.view.detach )
                        v.view.detach();
                }
            });
        });

        frame.innerHTML = '';

        let view = buffer.views.find( v => !v.frame );

        if( view ){
            view.elements.forEach( c => frame.appendChild( c ) );
            view.frame = frame;
            frame.className = "frame " + (view.view.css || view.view.constructor.name);
            if( view.view.attach )
                view.view.attach();
        }else{
            let viewCandidate = { view:null, priority:-1 };
            APP.pollViewForBuffer( buffer, viewCandidate );
            view = new viewCandidate.view( frame, buffer );
            let elements = [...frame.children];
            buffer.views.push({ view, elements, frame });
            frame.className = "frame " + (view.css || view.constructor.name);
            if( view.attach )
                view.attach();
        }

        
        return true;
    }

    findFile( filePath, doDisplay ){

        let buffer = DATA.buffers.find(
            buffer => buffer.path == filePath
        );
        
        if( buffer ){
            if( doDisplay )
                APP.displayBuffer( buffer );
            return buffer;
        }
        
        buffer = new Buffer();
        buffer.path = filePath;
        buffer.name = filePath.split( path.sep ).pop();
        buffer.type = filePath.split(".").pop().toUpperCase();

        if( doDisplay )
            APP.displayBuffer( buffer );

        return buffer;

    }

    

};

const MOD_C = 1<<9,
      MOD_M = 1<<10,
      MOD_S = 1<<11,
      MODIFIERS = {
          C:MOD_C,
          M:MOD_M,
          S:MOD_S
      };

class Keys {

    constructor(){
        APP.add(this);
        
        this.keyMaps = {
            "global":{}
        };
        this.mapState = "global";
        this.keyList = {};
    }

    getKeyForFunction( cb ){
        let key = "";
        for( let mapName in this.keyMaps ){
            let map = this.keyMaps[mapName];
            for( let triggerName in map ){
                if( map[triggerName] != cb )
                    continue;
                
                let path = mapName.split("-");
                path.push( triggerName );
                path.shift();

                for( let i=0; i<path.length; ++i ){
                    let code = path[i];
                    let str = [];

                    for( let modKey in MODIFIERS ){
                        let mod = MODIFIERS[modKey];
                        if( code & mod ){
                            str.push( modKey );
                            code ^= mod;
                        }
                    }
                    
                    if( code >= 112 ){
                        str.push( "F" + (code-111) );
                    }else{
                        str.push( String.fromCharCode(code).toLowerCase() );
                    }
                    
                    path[i] = str.join("-");
                }
                
                return path.join(" ");
            }
        }
        return "";
    }

    bindKeys( map, keys ){
        for( let k in keys )
            this.defineKey( map, k, keys[k] );
    }

    defineKey( map, str, cb ){
        str = str.trim().replace(/\s+/g, ' ');

        let full = [ map ];
        let num = 0;

        for( let i=0; i<str.length; ++i ){
            let c = str[i];
            if( MODIFIERS[c] ){
                num |= MODIFIERS[c];
                ++i; // skip the -
            }else if( c == "F" ){
                let n = parseInt(str.substr(i+1))|0;
                num += 111 + n;
                i += (n+"").length;
            }else if( c.charCodeAt(0) > 32 ){
                num |= c.toUpperCase().charCodeAt(0);
            }else if( num & 0xFF ){
                full.push(num);
                num = 0;
            }else{
                num = 0;
            }
        }

        let acc = [];
        let prev = "";

        for( let i=0; i<full.length; ++i ){
            acc.push( full[i] );
            let accstr = acc.join("-");

            if( !this.keyMaps[ accstr ] ){
                this.keyMaps[ accstr ] = {};
                this.keyMaps[ prev ][ full[i] ] = APP.setKeyMap.bind(null, accstr);
            }

            prev = accstr;
        }

        this.keyMaps[ acc.join("-") ][ num ] = cb;
    }

    globalSetKey( str, cb ){
        return this.defineKey( "global", str, cb );
    }

    setKeyMap( map ){
        if( this.mapState == map )
            return;
        if( this.mapState == "global" )
            APP.onCommandStarted();
        this.mapState = map;
        if( this.mapState == "global" ){
            setTimeout(_=>{
                APP.onCommandEnded();
            }, 5);
        }
    }

    onKeyDown( evt ){
        let key = evt.which;
        
        if( key == 16 || key == 17 || key == 18 ) // Shift/Ctrl/Alt
            return;
        
        if( evt.ctrlKey ) key |= MOD_C;
        if( evt.altKey ) key |= MOD_M;
        if( evt.shiftKey ) key |= MOD_S;

        let currentMap = this.mapState;
        
        let cb = (this.keyMaps[ this.mapState ] || {})[ key ];
        if( cb ){
            try{
                cb();
            }catch(ex){
                console.error( ex.message );
            }
        }else{
            console.warn("Shortcut is undefined.");
        }

        if( currentMap == this.mapState )
            this.setKeyMap("global");
        
    }

    onKeyUp( evt ){
    }

};

class Chrome {
    constructor(){
        APP.add(this);
        this.el = document.querySelector(".chrome");
        this.resetMenus();
    }

    setStatus(msg){
        this.el.dataset.status = msg;
    }

    resetMenus(){
        this.menus = {};
        this.count = 0;
        this.menuList = [];
        this.hnd = 0;
        this.el.innerHTML = "";
        APP.queryMenus();
    }

    addMenu( name, optionMessage ){
        this.menuList.push([name, optionMessage]);
        if( !this.hnd ){
            this.hnd = setTimeout(_=>this.renderChrome(), 10);
        }
    }

    _renderChromeItem( name, optionMessage ){
        let menu = this.menus[ name ];
        if( !menu )
            this.menus[name] = menu = {
                el:DOC.create("div", document.querySelector(".chrome"), {
                    className:"menu",
                    text:name,
                    tabIndex:this.count++
                })
            };

        for( let key in optionMessage ){
	    let el = menu[ key ];
            if( !el ){
                let shortcut = APP.getKeyForFunction(APP[optionMessage[key]]);

                let cb = optionMessage[key];
                if( typeof cb == "string" )
                    cb = APP[cb];
                
                menu[ key ] = el = DOC.create("div", menu.el, {
                    text:key,
                    onclick:((cb)=>{
                        menu.el.blur();
                        cb();
                    }).bind(this, cb)
                }, [
                    ["span", {className:"shortcut", text:shortcut}]
                ]);
            }
        }
    }

    renderChrome(){
        clearTimeout( this.hnd );
        this.hnd = 0;
        this.menuList.forEach( item => this._renderChromeItem(...item) );
    }
}

const encoding = {};

class Core {
    
    constructor(){
        APP.add(this);
        this.plugins = {};
        this.resolveHnd = 0;
    }

    reload(){
        nw.Window.get().reload();
    }

    writeBuffer( buffer ){
        if( !buffer.path || !buffer.data )
            return;

        let data = buffer.data;
        if( typeof buffer.transform == "string" )
            data = APP[buffer.transform]( data );
            
        fs.writeFileSync( buffer.path, data, buffer.encoding );

        buffer.modified = false;
    }

    readFilteredBuffers( buffers, filter, cb ){
        let data = {}, pending = 1;

        buffers.filter( filter )
            .forEach( f => {
                pending++;
                this.readBuffer(f, undefined, (err, src)=>{
                    data[f.path] = src;
                    pending--;
                    if( !pending )
                        cb(data);
                } );
            });

        pending--;
        if( !pending )
            cb(data);
    }

    readBuffer( buffer, en, cb, force){
        if( buffer.data && !force ){

            if( buffer.modified )
                APP.writeBuffer( buffer );

            setTimeout( bob, 1 );
            
            function bob(){
                let data = buffer.data;
                if( typeof buffer.transform == "string" )
                    data = APP[buffer.transform]( data );                
                cb(null, data);
            }

        }else{

            en = en || encoding[buffer.type];
            if( en === undefined )
                en = "utf-8";

            fs.readFile( buffer.path, en, (err, data)=>{
                buffer.data = data;
                buffer.modified = false;
                buffer.encoding = en;
                cb( err, buffer.data );
            } );
        }
    }

    replaceDataInString( f ){
        if( Array.isArray(f) )
            return f.map( s => this.replaceDataInString(s) );
        return f.replace(/\$\{([^}]+)\}/g, (s, key)=>DATA[key]);
    }

    loadCSS( file ){
        let tag = document.createElement("link");
        tag.href = "file://" + file;
        tag.rel = "stylesheet";
        document.head.appendChild( tag );        
    }

    load( __script_path ){
        /* */
        let tag = document.createElement("script");
        tag.src = "file://" + __script_path;
        document.head.appendChild( tag );
        /*/
        try{
            eval( fs.readFileSync( __script_path, "utf-8") );
        }catch(ex){
            console.log( "Could not read script ", __script_path, ": ", ex.message );
            return false;
        }
        /* */

        return true;
    }

    loadDirectory( dir ){
        let files;
        
        try{
            files = fs.readdirSync(dir);
        }catch( ex ){
            return false;
        }

        files = files.sort();

        files.forEach( item => {
            if( /\.js$/i.test(item) )
                this.load( dir + path.sep + item );
            if( /\.css$/i.test(item) )
                this.loadCSS( dir + path.sep + item );
        });
        
        return true;
    }

    addPlugin(name, dependencies, cb){
        if( !dependencies )
            dependencies = [];

        this.plugins[name] = {dependencies, cb, loaded:false};

        if( !this.resolveHnd )
            this.resolveHnd = setTimeout(resolveDependencies.bind(this), 10);

        function resolveDependencies(){
            let retry;
            this.resolveHnd = 0;

            do{
                retry = false;

                for( let name in this.plugins ){
                    let plugin = this.plugins[name];
                    if( plugin.loaded )
                        continue;

                    const pending = plugin.dependencies.find( d => !this.plugins[d] || !this.plugins[d].loaded );

                    if( !pending ){
                        plugin.loaded = true;
                        plugin.ret = plugin.cb(
                            ...plugin
                                .dependencies
                                .map(d => this.plugins[d].ret)
                        );
                        
                        retry = true;
                    }
                }
            }while(retry);
        }
    }

    customSetVariables( map ){
        importData( map );
    }

    async(cb){
        setTimeout(cb, 1);
    }

    exit(code){
        nw.process.exit(code||0);
    }

    spawn( cmd, ...args ){
        const { spawn } = require('child_process');
        
        cmd = this.escapeCmdArgs([APP.replaceDataInString(cmd)])[0];

        let options = {};

        if( typeof args[0] == "object" && args[0].cwd ){
            Object.assign( options, args.shift() );
        }

        if( Array.isArray(args[0]) )
            args = args[0];
        
        args = APP.replaceDataInString(args);

        let child;

        if( DATA.os == "windows" ){
            this.escapeCmdArgs(args);
            options.shell = true;
        }
        child = spawn(cmd, args, options);

        child.stdout.on('data', data => {
            child.emit('data-out', data);
        });

        child.stderr.on('data', data => {
            child.emit('data-err', data);
        });

        child.on('close', error=>{
            if( error )
                APP.error( [cmd, ...args].join(" ") );
        });

        return child;
    }

    killChild(child){
        if( !child || !child.pid ){
            APP.log("Can't kill " + child);
            return;
        }
        
        if( DATA.os == "windows" ){
            const {exec} = require("child_process");
            exec('taskkill -T -F -PID ' + child.pid);
        }else{
            child.kill("SIGHUP");
        }
    }

    escapeCmdArgs( args ){
        for( let i = 0; i<args.length; i++ ){
            args[i] = args[i]
                .replace(/\\/g, "\\\\")
                .replace(/"/g, "\\\"");

            if( args[i].indexOf(" ") > -1 )
                args[i] = `"${args[i]}"`;
        }

        return args;
    }
};

(function(){

    new Core();
    new Keys();
    new Frame();
    new Chrome();

    importData({
        appPath:process.argv[0].split( path.sep ).slice(0, -1).join( path.sep ),
        buffers:[]
    });

    APP.load( DATA.appPath + path.sep + "config.js" );

})();
