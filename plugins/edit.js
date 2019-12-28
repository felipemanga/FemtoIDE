APP.addPlugin("Edit", ["Project"], _=>{
    let history = [];
    let index = 0;
    let ignore = false;
    
    APP.add(new class Edit {
        _filterBuffers(){
            history = history.filter(x=>{
                return DATA.buffers.find(b=>b.name == x);
            });
        }

        onDisplayBuffer(buffer){
            this._filterBuffers();
            if( ignore ) return;
            if( index && history[index-1] == buffer.name ) return;
            history.length = index;
            history = history.filter(x=>x!=buffer.name);
            history.push(buffer.name);
            index = history.length;
            console.log(index, "History", history);
        }

        goBack(){
            if( index <= 2 )
                index = 2;
            index--;
            ignore = true;
            APP.displayBuffer(history[index-1]);
            ignore = false;
            console.log(index, "History", history);
        }

        goForward(){
            if( index >= history.length )
                index = history.length-1;
            ignore = true;
            APP.displayBuffer(history[index++]);
            ignore = false;
            console.log(index, "History", history);
        }

        queryMenus(){
            APP.addMenu("Edit", {
                "Find In Project":"search",
                "Cut":"cut",
                "Copy":"copy",
                "Paste":"paste",
                "Beautify":"beautify",
                "Comment":"toggleComment",
                "Go Back":"goBack",
                "Go Forward":"goForward"
            });
        }
    });

});
