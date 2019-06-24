APP.addPlugin("Bin", [], _ => {
    const extensions = ["PNG", "JPG", "MP3", "BIN", "ELF"];
    
    class BinView {
        attach(){
            let text, len, buffer = this.buffer;
            if( buffer && buffer.data && buffer.data.length ){
                len = buffer.data.length;
            }else{
                len = APP.getBufferLength(buffer);
            }

            if( len ){
                let unit = ' bytes';
                if( len > 1024 ){
                    unit = ' kilobytes';
                    len /= 1024;
                }
                if( len > 1024 ){
                    unit = ' megabytes';
                    len /= 1024;
                }
                text = `<<Binary data - ${((len*10)|0)/10}${unit}>>`;
            }else
                text = "<<Binary data>>";
            this.DOM.innerText = text;
        }

        constructor( frame, buffer ){
                
            this.DOM = DOC.create( frame, "h2", {
                className:"BinView"
            });

            this.buffer = buffer;

            this.attach();

        }
    }

    APP.add({
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 1 ){
                vf.view = BinView;
                vf.priority = 1;
            }
            
        }
        
    });

    return BinView;
});
