(function(){
    let container = document.querySelector('#logContainer');
    APP.customSetVariables({maxLogLength:300});

    function getNode(className){
        let node, triggerResize = false;
        if( container.children.length >= DATA.maxLogLength ){
            node = container.children[0];
            container.removeChild(node);
        }else{
            node = DOC.create("div");
            triggerResize = true;
        }
        container.appendChild( node );
        node.className = "logItem " + className;

        setTimeout(_=>{
            container.scrollTo( 0, container.scrollHeight );
            APP.onResize();
        }, 0);
        
        return node;
    }
    
    APP.add({

        clearLog(){
            container.innerHTML = '';
            APP.onResize();
        },

        log( ...args ){
            args.join(" ")
                .split("\n")
                .forEach( line => this.logLine(line) );
            APP.onResize();
        },

        error( ...args ){
            args.map(arg=>{
                if( DATA.verbose && arg && arg.message && arg.stack ){
                    return arg.stack;
                }
                return arg;
            }).join(" ")
                .split("\n")
                .forEach( line => this.logErrorLine(line) );            
        },

        logErrorLine( ...args ){
            getNode("error").textContent = args.join(" ");
            APP.onResize();
        },

        logLine( ...args ){
            getNode("normal").textContent = args
                .join(" ")
                .replace(/^(\s+)/, (m, r)=>"-".repeat(r.length));
        },

        logHTML( html ){
            getNode("html").innerHTML = html;
        }

    });

})();
