APP.addPlugin("LSP", [], _=> {
    let server = null;
    let nextId = 0;

    let ready = false;
    let promises = {};
    const ctypes = {
        CC:"cpp",
        CPP:"cpp",
        HPP:"cpp",
        C:"c",
        H:"cpp"
    };

    APP.add(new class LSP {

        registerProjectFile( buffer ){
            let languageId = ctypes[buffer.type];
            if(!languageId)
                return;

            APP.readBuffer( buffer, null, (error, text)=>{
                if(error)
                    return;

                this._notification(
                    "textDocument/didOpen",
                    {
                        textDocument:{
                            uri: this.pathToURI(buffer.path),
                            languageId,
                            version: buffer.version,
                            text
                        }
                    },
                    response=>{
//                        APP.log(response);
                    });
            });
        }

        onAfterWriteBuffer( buffer, text ){
            let languageId = ctypes[buffer.type];
            if(!languageId)
                return;
            
            this._notification(
                "textDocument/didChange",
                {
                    textDocument:{
                        uri: this.pathToURI(buffer.path),
                        version: buffer.version,
                    },
                    contentChanges:[{
                        text
                    }]
                },
                response=>{
                    //                        APP.log(response);
                });
        }

        _notification( method, params, force ){
            if( !ready && !force ){
                setTimeout(_=>this._notification(method, params), 10);
                return;
            }
            
            const obj = {
                "jsonrpc": "2.0",
                method,
                params
            };

            let msg = JSON.stringify(obj);
            msg = `Content-Length: ${msg.length}\r\nContent-Type: application/vscode-jsonrpc; charset=utf-8\r\n\r\n${msg}`;
            server.stdin.write(msg);
        }

        lsp( method, params, force ){
            const obj = {
                "jsonrpc": "2.0",
                "id": (nextId++) + "",
                method,
                params
            };

            let msg = JSON.stringify(obj);
            msg = `Content-Length: ${msg.length}\r\nContent-Type: application/vscode-jsonrpc; charset=utf-8\r\n\r\n${msg}`;

            let ok, nok;
            const promise = new Promise((_ok, _nok)=>{
                ok = _ok;
                nok = _nok;
            });
            
            promises[obj.id] = {ok, nok};

            send();

            return promise;

            function send(){
                if( !ready && !force ){
                    setTimeout(_=>send(), 10);
                    return;
                }
                server.stdin.write(msg);
            }
        }

        _startServer(){
            if( server )
                return;

            server = APP.spawn(path.join(DATA.appPath, process.platform, "clangd", "clangd"));

            let buffer = "";

            server.on("data-out", data=>{
                buffer += data;
                
                do{
                    const header = buffer.match(/^Content-Length:\s*([0-9]+).*?\r\n\r\n/);
                    
                    if( !header )
                        return;

                    const length = parseInt(header[1]);
                    if( buffer.length - header[0].length < length )
                        return;

                    let msg = buffer.substr(header.index + header[0].length, length);
                    buffer = buffer.substr(header.index + header[0].length + length);

                    let json;
                    try{
                        json = JSON.parse(msg);
                    }catch(ex){
                        APP.error("Broken JSON:\n\"" + msg + "\"");
                        return;
                    }

                    if( !("id" in json) ){
                        console.log(json.method, json.params);
                    } else {
                        
                        const cb = promises[json.id];
                        if( !cb ){
                            APP.error(json);
                            return;
                        }

                        delete promises[json.id];

                        cb.ok(json.result);
                    }
                    
//                    APP.log(msg);
                }while(buffer.length);
            });

            server.on("data-err", data=>{
                console.warn("" + data);
            });

            server.on("close", error=>{
                APP.log("LSP closed with error=" + error);
            });

            this.lsp("initialize", {
                processId: process.pid,
                rootUri: this.pathToURI(DATA.projectPath),
                capabilities: {
                },
                trace: "verbose"
            }, true)
                .then(result => this._notification("initialized", {}))
                .then(result => ready = true);
        }

        completionAtPoint(buffer, pos, callback){
            if( !ctypes[buffer.type] )
                return;

            if( buffer.modified == true ){
                const data = APP.readBufferSync( buffer );
                this.onAfterWriteBuffer( buffer, data );
            }

            const position = APP.locationFromPosition( buffer, pos );
            this.lsp("textDocument/completion", {
                textDocument:{
                    "uri": this.pathToURI(buffer.path)
                },
                position
            }).then(result=>{
                let out = result.items.map(entry=>({
                    caption:entry.label,
                    value:entry.insertText,
                    meta:entry.detail,
                    score:entry.sortText
                }));
                callback(out);
            });
        }

        findDeclaration( buffer, pos ){
            if( !ctypes[buffer.type] )
                return;
            
            let location = APP.locationFromPosition(buffer, pos);

            this.lsp("textDocument/definition", {
                "textDocument": {
                    "uri": this.pathToURI(buffer.path)
                },
                "position": location
            }).then(result=>{
                if( Array.isArray(result) && result.length > 0 ){
                    let ref = result[0];
                    let p = this.URIToPath(ref.uri);
                    let buffer = APP.findFile(p, true);
                    APP.jumpTo(
                        buffer,
                        ref.range.start.line + 1,
                        ref.range.start.character
                    );
                }
//                APP.log(result);
            });
        }

        URIToPath(uri){
            return uri
                .replace(/^file:\/\//i, "")
                .replace(/\//g, path.sep)
            ;
        }

        pathToURI(path){
            return "file://" + path
                .replace(/\\/g, "/")
//                .replace(/ /g, "+")
            ;
        }
        
        onOpenProject(){
            this._startServer();
        }
    });
});
