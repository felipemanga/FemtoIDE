APP.addPlugin("Sound", [], _ => {
    const extensions = ["MP3", "OGG", "WAV"];
    const prefix = "file://";
    
    Object.assign(encoding, {
        "MP3":null,
        "OGG":null,
        "WAV":null,
    });
    
    class SoundView {
        attach(){
            if( this.DOM.src != prefix + this.buffer.path )
                this.DOM.src = prefix + this.buffer.path;
        }

        onRenameBuffer( buffer ){
            if( buffer == this.buffer ){
                this.DOM.src = prefix + this.buffer.path;
            }
        }
        
        constructor( frame, buffer ){
            this.buffer = buffer;
            this.DOM = DOC.create( frame, "audio", {
                controls:true,
                className:"SoundView"
            });
        }
    }

    APP.add({

        convertToRaw(buffer){
            if( !buffer || extensions.indexOf(buffer.type) == -1 )
                return;
            let data = APP.readBufferSync(buffer);
            if(!data)
                return;
            APP.readAudio(data.buffer)
                .then(data=>{
                    buffer.data = null;
                    let filePath = buffer.path.replace(/\....$/, ".raw");
                    let out = APP.findFile(filePath);
                    out.data = new Uint8ClampedArray(data);
                    out.transform = null;
                    APP.writeBuffer(out);
                });
        },

        convertToCpp(buffer){
            if( !buffer || extensions.indexOf(buffer.type) == -1 )
                return;
            let data = APP.readBufferSync(buffer);
            if(!data)
                return;
            APP.readAudio(data.buffer)
                .then(data=>{
                    buffer.data = null;
                    let name = buffer.name.replace(/\....$/, "");
                    let filePath = buffer.path.replace(/\....$/, ".h");
                    let out = APP.findFile(filePath);
                    out.data = `// Generated file - do not edit!
#pragma once
const inline uint8_t ${name.replace(/[^a-zA-Z_0-9]+/, "")}[] = {
${data.map(x=>(x>255?255:(x<0?0:x))|0).join(",")}
};
`;
                    out.transform = null;
                    APP.writeBuffer(out);
                });
        },

        pollBufferActions(buffer, actions){
            if( extensions.indexOf(buffer.type) == -1 )
                return;
            actions.push({
                type: "button",
                label: "Convert to C++",
                cb: APP.convertToCpp.bind(null, buffer)
            });
            actions.push({
                type: "button",
                label: "Convert to RAW",
                cb: APP.convertToRaw.bind(null, buffer)
            });
        },
        
        pollViewForBuffer( buffer, vf ){

            if( extensions.indexOf(buffer.type) != -1 && vf.priority < 2 ){
                vf.view = SoundView;
                vf.priority = 2;
            }
            
        }
        
    });

    return SoundView;
});
