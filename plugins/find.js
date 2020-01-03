APP.addPlugin("Find", [], _=>{

    const typeList = ["TXT", "CPP", "C", "H", "HPP", "JS", "S", "JAVA", "PY", "XML"];
    let buffer;
    
    class FindNode {

        constructor( ref, parent ){
            let name = ref.name;
            
	    this.DOM = DOC.create(
                "li",
                parent,
                {
                    className:"item backtrace closed",
                    text:`${ref.buffer.name}: ${ref.match.substr(0, 40)}`,
                    onclick:()=>{
                        APP.displayBuffer(ref.buffer);
                        APP.jumpToOffset(ref.buffer, ref.index);
                    }
                }
            );
        }
    }

    class FindView {
        constructor( frame, buffer ){
            APP.add(this);

            let container = this.container = DOC.create("div", frame, {
                className:"FindContainer"
            }, [
                ["div", {className:"FindHeader"}, [
                    ["span", {
                        html:"&#8999;",
                        onclick:_=>APP.clearSearch(),
                        style:{
                            float: "right",
                            cursor: "pointer"
                        }
                    }],
                    ["input", {
                        onchange:ex=>{
                            if( ex.target.value )
                                this.regexSearch(ex.target.value);
                            else
                                this.hideFindResults();
                        }
                    }]/*,
                    ["input", {
                        id:"replacement"
                    }]*/
                ]],
                ["div", {className:"FindBody"}]
            ]);

            this.list = DOC.create(
                "ul",
                {className:"FindList"},
                DOC.index(container).FindBody[0]
            );

            this.DOM = DOC.index(container);

            this.root = null;
        }

        search(){
            this.showFindResults();
        }

        showFindResults(){
            this.container.parentElement.style.display = "block";
            APP.onResize();
            APP.async(_=>this.DOM.INPUT[0].focus());
        }

        hideFindResults(){
            APP.closeFrame(this);
            // this.container.parentElement.style.display = "none";
            APP.onResize();
        }

        _removeSearchResults(){
            while( this.list.children.length )
                this.list.removeChild( this.list.lastChild );
        }

        clearSearch(){
            this.DOM.INPUT[0].value = "";
            this.hideFindResults();
        }

        regexSearch(exp, flags){
            let results = 0;
            this._removeSearchResults();
            this.showFindResults();

            try{
                if( typeof exp == "string" )
                    exp = new RegExp(exp, flags || "gmi");
            }catch(ex){
                exp = (""+exp).replace(/(\{\}\(\)\[\]\\\?\+\.)/g, "\\$1");
                exp = new RegExp(exp, flags || "gmi");
            }

            let queue = [...DATA.projectFiles];
            popQueue.call(this);

            function popQueue(){
                if( results > 500 ){
                    APP.log("Too many results. Stopping.");
                    return;
                }

                if(!queue.length){
                    APP.log("Search complete");
                    return;
                }

                setTimeout(_=>popQueue.call(this), 5);
                
                let file = queue.pop();
                if( typeList.indexOf(file.type) != -1 ){
                    APP.readBuffer(file, undefined, (err, src)=>{
                        checkFile.call(this, file, src);
                    });
                }
            }

            function checkFile( buffer, data ){
                data = data + "";

                let match;
                while( (results < 500) && (match = exp.exec(data)) ){
                    results++;
                    new FindNode({
                        buffer,
                        index: match.index,
                        match: match[0]
                    }, this.list);
                }
            }
        }

    }
    
    APP.add({

        pollViewForBuffer( buffer, vf ){

            if( buffer.name == "*Find View*" ){
                vf.view = FindView;
                vf.priority = 999;
            }
            
        },

        search(){
            
            if( !buffer ){
                buffer = new Buffer();
                buffer.name = "*Find View*";
            }
            
            APP.displayBufferInRightFrame(buffer);            

        }

    });

});
