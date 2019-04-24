const DOM = {};
const DATA = {};
let hnd;

function importData( desc ){
    for( let k in desc ){
        makeSetter( k );
    }

    return {DOM, DATA};

    function makeSetter( k ){
        let setter = typeof desc[k] == "function" ? desc[k] : null;
        let value = desc[k];
        if( setter ) value = setter();
        Object.defineProperty( DATA, k, {
            enumerable:true,
            configurable:true,
            get:function(){ return value; },
            set:function(v){
                if( setter ) v = setter(v, value);
                value = v;
                render();
            }
        });
    }
}

function store( path, value ){
    let obj = DATA;
    path = path.split(".");

    while( path.length > 1 ){

        if( !obj[path[0]] )
            obj[path[0]] = {};

        obj = obj[path.shift()];

    }

    obj[path[0]] = value;

    render();
}

function cancelEvent(event){
    event.stopPropagation();
    event.preventDefault();
    return event;
}

function render(){

    if( hnd )
        return;

    hnd = setTimeout( innerRender.bind(null, null, null), 0 );

    function innerRender( e, ctx ){
        e = e || document.body;
        ctx = ctx || DATA;
        hnd = null;

        let reserved = {"if":true, "array":true};

        if( "value" in e && e.id in ctx ){
            e.value = ctx[ e.id ];
            if( !e._writer ){
                e._writer = _ => {
                    ctx[ e.id ] = e.value;
                };
                e.addEventListener("change", e._writer);
            }
        }

        for( let key in e.dataset ){
            let val = e.dataset[ key ];

            if( typeof val != "string" || !val || reserved[key] )
                continue;

            e.setAttribute( key, run( val, ctx ) );
        }

        if( e.dataset.array ){

            if( !("backupDOM" in e) ){
                let bd = document.createDocumentFragment();
                while( e.childNodes.length )
                    bd.appendChild( e.childNodes[0] );
                e.backupDOM = bd;
            }

            let arr = run( e.dataset.array, ctx, false );

            if( !arr || !Array.isArray(arr) )
                arr = [];

            e.innerHTML = '';

            let cctx = Object.assign({}, ctx);
            for( let key in arr ){
                
                cctx.key = key;
                cctx.value = arr[key];
                if( typeof cctx.value == "object" && cctx.value )
                    Object.assign( cctx, cctx.value );

                let doc = e.backupDOM.cloneNode(true);
                let childNodes = [...doc.childNodes];
                e.appendChild(doc);
                childNodes.forEach( node => prerenderNode( node, cctx ) );
                
            }

        }else{

            for( let i=0; i<e.childNodes.length; ++i )
                prerenderNode( e.childNodes[i], ctx );

        }

        function prerenderNode( node, ctx ){
            
            if( node.nodeType == Document.TEXT_NODE ){
                
                updateTextNode( node, ctx );
                
            }else if( node.nodeType == Document.ELEMENT_NODE ){
                
                if( !passCondition(node, ctx) )
                    node.classList.add("unrendered");
                else
                    node.classList.remove("unrendered");

                innerRender( node, ctx );
            }
            
        }

        function run( str, ctx, asString=true ){
            let exp = '';

            for( let k in ctx )
                exp += `let ${k} = __ctx__.${k};\n`;

            if( asString )
                exp += 'return `' + str + '`;';
            else
                exp += 'return ' + str + ';';

            let ret = "";
            try{
                ret = (new Function("__ctx__", exp))( ctx );
            }catch( ex ){
            }

            return ret;
        }

        function passCondition( node, ctx ){

            let cond = node.dataset["if"];
            if( !cond ) return true;

            let value = run( cond, ctx, false );
            return !!value;

        }

        function updateTextNode( node, ctx ){        
            if( !("backup" in node) )
                node.backup = node.data;
            
            node.data = run( node.backup, ctx );
        }

        if( e == document.body ){
            document.body.classList.remove("unrendered");

            Object.keys(DOM).forEach( k => delete DOM[k] );

            let elements = document.querySelectorAll("*");
            
            for( let i=0, element; (element=elements[i]); ++i ){
                
                index( element, element.tagName, false );
                index( element, element.id, true );
                
                for( let j=0, clazz; (clazz=element.classList[j]); ++j ){
                    index( element, clazz, false );
                }
                
            }

            function index( e, key, unique ){
                
                if( unique ){
                    DOM[ key ] = e;            
                }else{
                    if( DOM[key] && !Array.isArray(DOM[key]) ){
                        return;
                    }
                    (DOM[ key ] = DOM[ key ] || []).push( e );
                }
                
            }

        }
    }

}

(function(){
    let el = document.createElement("style");
    el.textContent = '.unrendered { display: none; visibility: hidden; }';
    document.head.appendChild(el);
})();

render();
if( typeof module != "undefined" )
    module.exports = { importData, DOM, render };
