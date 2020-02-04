(function(){
    let dumpBuffer = null;
    let container = document.querySelector('#logContainer');
    APP.customSetVariables({maxLogLength:300});

    function getNode(className){
        document.querySelector('#closeLogBtn').style.display="block";
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
    
    APP.add(new class Logger {

        clearLog(){
            container.innerHTML = '';
            document.querySelector('#closeLogBtn').style.display="none";
            APP.onResize();
        }

        log( ...args ){
            args.join(" ")
                .split("\n")
                .forEach( line => this.logLine(line) );
            APP.onResize();
        }

        error( ...args ){
            args.map(arg=>{
                if( DATA.verbose && arg && arg.message && arg.stack ){
                    return arg.stack;
                }
                return arg;
            }).join(" ")
                .split("\n")
                .forEach( line => this.logErrorLine(line) );            
        }

        logErrorLine( ...args ){
            getNode("error").textContent = args.join(" ");
            APP.onResize();
        }

        logLine( ...args ){
            getNode("normal").textContent = args
                .join(" ")
                .replace(/^(\s+)/, (m, r)=>"-".repeat(r.length));
        }

        logHTML( html ){
            getNode("html").innerHTML = html;
        }

        logDump( dump, style ){
            if(!Array.isArray(dump) || dump.length==0 )
                return;

            function htmlEscape(str){
                return (str+"").replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }
            
            let html = `<html>
<head>
<style>

.normal {
color: #AAA;
}

.error {
color: #E00;
}

html, body {
background-color: #111;
min-height: 100%;
}

</style>
</head>
<body>
${dump.map(d=>(
`<pre class="${((d[0] == "error") ? "error" : "normal")}"><code>${
    htmlEscape(d[1])
}</code></pre>`
)).join("")}
</body>
</html>`;

            var ending = dump.map(x=>x[1]).join("\n").slice(-200);

            DOC.create(
                getNode(
                    "dump " +
                        ((style == "error") ? "error" : "normal")
                ),
                "pre",
                {
                    onclick:_=>{
                        APP.showDumpBuffer(html);
                    },
                    text:ending
                }
            );

        }

        showDumpBuffer(data){
            if(!dumpBuffer){
                dumpBuffer = new Buffer(false);
                dumpBuffer.name = "*Log*";
                dumpBuffer.type = "HTML";
            }
            dumpBuffer.data = data;
            APP.onAfterWriteBuffer(dumpBuffer);
            APP.displayBuffer(dumpBuffer);
        }

    });

})();
