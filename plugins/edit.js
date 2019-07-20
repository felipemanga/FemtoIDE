APP.addPlugin("Edit", ["Project"], _=>{
    let history = [];
    let index = 0;
    let ignore = false;
    
    APP.add({
        onDisplayBuffer(buffer){
            if( ignore ) return;
            if( index && history[index-1] == buffer.name ) return;
            history[index++] = buffer.name;
            history.length = index;
            console.log(index, "History", history);
        },

        goBack(){
            if( index <= 2 )
                index = 2;
            index--;
            ignore = true;
            APP.displayBuffer(history[index-1]);
            ignore = false;
            console.log(index, "History", history);
        },

        goForward(){
            if( index >= history.length )
                index = history.length-1;
            ignore = true;
            APP.displayBuffer(history[index++]);
            ignore = false;
            console.log(index, "History", history);
        },

        queryMenus(){
            APP.addMenu("Edit", {
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
