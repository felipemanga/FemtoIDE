(function(){
    let container = document.querySelector('#logContainer');
    APP.customSetVariables({maxLogLength:100});

    function getNode(className){
        let node;
        if( container.children.length >= DATA.maxLogLength ){
            node = container.children[0];
            container.removeChild(node);
        }else{
            node = DOC.create("div");
        }
        container.appendChild( node );
        node.className = "logItem " + className;

        setTimeout(_=>{
            container.scrollTo( 0, container.scrollHeight );
        }, 0);
        
        return node;
    }
    
    APP.add({

        log( ...args ){
            args.join(" ")
                .split("\n")
                .forEach( line => this.logLine(line) );
        },

        error( ...args ){
            args.join(" ")
                .split("\n")
                .forEach( line => this.logErrorLine(line) );            
        },

        logErrorLine( ...args ){
            getNode("error").textContent = args.join(" ");
        },

        logLine( ...args ){
            getNode("normal").textContent = args.join(" ");
        },

        logHTML( html ){
            getNode("html").innerHTML = html;
        }

    });

})();
