let unit, clazz;

Object.assign(module.exports, {
    unit(){
        return unit;
    },

    addResource(path){
        clazz.resource(path);
    },

    reset(){
        const {Unit} = require(`./Unit.js`);
        unit = new Unit();
        clazz = unit.resources();
    },

    writeCPP( lookup ){
        let out = "if( path == nullptr ) return nullptr;\n";
        out += "int hash = path->hashCode();\n";
        let hashes = {};
        
        lookup.forEach(({path, call})=>{
            let key = hash(path);
            if( !hashes[key] )
                hashes[key] = [];
            hashes[key].push({path, call});
        });

        for( let key in hashes ){
            let candidates = hashes[key];
            out += `if( hash == ${key} ){\n`;
            if( candidates.length > 1 ){
                out += candidates.map(({path, call})=>`  if( path->equals("${path}") ) return ${call}();`).join("\n") + "\n";
            }else{
                out += `return ${candidates[0].call}();\n`;
            }
            out += "}\n";
        }

        out += "\n";
        return out;
    }
});

function hash(str){
    let hash = 7;
    for(let i=0; i<str.length; ++i ){
        hash = (hash*31 + (str.charCodeAt(i)|0)) & 0xFFFFFFFF;
    }
    return hash;
}
