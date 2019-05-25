class AH {
    
    constructor( data ){
        this.listeners = [];
    }

    method( method, signature, pairs ){
        let namePair = pairs.find( pair => pair.key == "name" );
        if( !namePair )
            throw new Error("IRQ handler without a name: " + signature);
        let value = namePair.value.getString();
        let list = this.listeners[value];
        if( !list )
            list = this.listeners[value] = [];
        
        list.push(signature);
    }

    end( data ){
        data.GLOBAL = data.GLOBAL || "";
        data.BEFOREMAIN = data.BEFOREMAIN || "";
        
        for( let name in this.listeners ){
            data.GLOBAL += `extern "C" void ${name}_IRQHandler(void) {\n`;
            this.listeners[name].forEach( l => {
                data.GLOBAL += `  ${l}();\n`;
            });
            data.GLOBAL += `}\n`;
        }
        
    }
}

module.exports.handler = AH;
