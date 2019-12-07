class AH {
    
    constructor( data ){
        this.includes = [];
    }

    method( method, signature, pairs ){
        this.includes.push(...pairs.map( pair => ({
            key:pair.key[0],
            file:pair.value.getString()
        })));
    }

    end( data ){
        data.HEAD = data.HEAD || "";
        
        for( let pair of this.includes ){
            if( pair.key == "include" && pair.file != "" )
                data.HEAD += `#include "${pair.file}"\n`;
        }        
    }
}

module.exports.handler = AH;
