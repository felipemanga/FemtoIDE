const vfsfunc = require('./vfs.js');
const sourcepath = vfsfunc.sourcepath;
let vfs = {};

const parsers = {};

function reset(){
    for( let k in vfs )
        delete vfs[k];
    Object.assign(vfs, vfsfunc.create());
}

function resolveVFS( fqcn ){

    let fparts = typeof fqcn == "string" ? fqcn.split(".") : fqcn;

    for( let i=0; i<sourcepath.length; ++i ){

        let ctx = vfs;
        let parts = [...sourcepath[i]];
        while( parts.length ){
            if( !ctx[parts[0]] ) break;
            ctx = ctx[ parts.shift() ];
        }

        if( parts.length )
            continue;

        let j;
        for( j=0; ctx && !ctx.src && j<fparts.length; ++j ){
            ctx = ctx[ fparts[j] ];
        }

        if( ctx && ctx.src ){
            fparts.splice(0, j-1);
            return ctx;
        }

    }

    return null;

}

function toAST( fqcn ){
    let pkg = [...fqcn];

    let res = resolveVFS( fqcn );

    if( !res )
        return null;

    if( res.unit )
        return res.unit;

    pkg.splice( pkg.length-fqcn.length+1, fqcn.length );

    let parser = parsers[ res.parser||"java" ];
    res.unit = parser.run( res.src, pkg, res.type );
    res.name = pkg.join(".");
    if( parser.postRun )
        parser.postRun( res, pkg );

    return res.unit;

}

var depth, msg = "";

function ast( node, depth=0, name ){

    if( Array.isArray(node) ){
        node.forEach( n => ast(n, depth, name) );
        return;
    }

    if( node.name )
        name = node.name;
    else
        name += ":" + (node.image || "DOH!");


    msg += name.padStart(depth*2+name.length, " ") + "\n";

    for( let k in node.children ){
        ast( node.children[k], depth+1, k );
    }

    if( !depth )
        throw new Error("Unsupported node: " + msg);
}


module.exports = {
    reset,
    resolveVFS,
    toAST,
    parsers,
    vfs,
    ast
};
