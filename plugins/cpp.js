APP.addPlugin("CPP", ["Text"], TextView => {
    const extensions = ["CPP", "C", "H", "HPP", "CC"];
    
    class CPPView extends TextView {
        constructor( frame, buffer ){
            super(frame, buffer);
            this.ace.session.setMode("ace/mode/c_cpp");
            ace.require("ace/ext/language_tools");
            this.ace.setOptions({
                enableSnippets: true,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true
            });

            this.ace.completers = [{
                getCompletions(editor, session, pos, prefix, callback) {
                    // callback(null, APP.complete(callback) || []);
                    APP.complete(callback.bind(null, null));
                }
            }];
        }

        doAction(){
            APP.compileAndRun();
        }

        beautify(){
            if( typeof js_beautify == "undefined" )
                return;
            let ret = js_beautify(this.ace.session.getValue());
            this.ace.session.setValue(ret);
        }

        complete(callback){
            let pos = this.ace.getCursorPosition();
            pos = this.ace.session.doc.positionToIndex(pos);
            APP.completionAtPoint(this.buffer, pos, callback);
        }

        toggleHCPP(){
            let match = DATA.projectFiles.find(file=>{
                return file.type != "directory"
                    && file.type != this.buffer.type
                    && file.name.replace(/\..*/, "").toUpperCase() == this.buffer.name.toUpperCase().replace(/\..*/, "");
            });
            
            if( match )
                APP.displayBuffer(match);
        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.view = CPPView;
                vf.priority = 1;
            }
            
        }
        
    });

    return CPPView;
});
