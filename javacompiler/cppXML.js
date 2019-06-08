module.exports = function( xml ){
    let out = "";
    let strlist = [];
    let cid = 0;

    let rootId = write( xml );
    
    strlist.forEach((s, i)=>{
        out = `up_java::up_lang::uc_String *s${i} = new up_java::up_lang::uc_String(${JSON.stringify(s)});\n${out}`;
    });
    
    return `
#ifdef POKITTO_BAS
static up_femto::uc_XMLNode *rootNode;
if( rootNode ) 
  return rootNode;

__managed__ = false;
#endif

${out}

#ifdef POKITTO_BAS
__managed__ = true;
rootNode = c${rootId};
#endif

return c${rootId};
`;

    function str(s){
        s += "";
        let ns = "";
        let i;
        for( i=0; i<s.length; ++i ){
            if(s.charCodeAt(i)<127)
                ns += s[i];
        }
        s = ns;
        
        i = strlist.indexOf(s);
        if( i > -1 ){
            return "s" + i;
        }
        
        strlist.push(s);
        return "s" + (strlist.length - 1);
    }

    function write( node ){
        let id = cid++;
        let childIds = null;

        if( node.childNodes && node.childNodes.length ){
            childIds = [];
            for( let i=0; i<node.childNodes.length; ++i ){
                childIds.push( write( node.childNodes[i] ) );
            }
        }

        out += `up_femto::uc_XMLNode *c${id} = new up_femto::uc_XMLNode(\n`;
        out += node.tagName ? str(node.tagName||"") + `,\n` : 'nullptr,\n';
        if( node.attributes && node.attributes.length ){
            out += `(new uc_Array<up_femto::uc_StringPair, true>(${node.attributes.length}))->loadValues({\n`;
            let acc = [];
            for( let i=0; i<node.attributes.length; ++i ){
                let a = node.attributes[i];
                acc.push(`new up_femto::uc_StringPair(${str(a.name)}, ${str(a.value)})`);
            }
            out += acc.join(",\n");
            out += "}),\n";
        }else{
            out += "nullptr,\n";
        }
        
        if( !childIds ){
            out += "nullptr,\n";
        }else{
            out += `(new uc_Array<up_femto::uc_XMLNode, true>(${childIds.length}))->loadValues({\n`;
            out += childIds.map(c=>`c${c}`).join(", ");
            out += `}),\n`;
        }
        
        out += (typeof node.nodeValue != "string") ? "nullptr" : str(node.nodeValue.trim().replace(/[ \t]+/g, " ").replace(/[\r\n]+/g, "\n"));
        
        out += `);\n\n`;
        return id;
    }
};
