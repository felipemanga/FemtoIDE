APP.addPlugin("Wav", ["Project"], _=>{
    let audioContext;

    class LibAudio {

        constructor(){

            if( !audioContext )
                audioContext = new AudioContext();

        }

        downSample( data, bpp, rate, signed ){
            let ok, nok;
            let p = new Promise((_ok, _nok) => {
                ok = _ok;
                nok = _nok;
            });

            try{

                if( data.byteLength ){
                    audioContext.decodeAudioData(data)
                        .then( buffer => {
                            return this.downSample(buffer, bpp, rate);
                        }).then( data => {
                            ok( data );
                        }).catch( nok );
                    return p;
                }

                let ctx = new OfflineAudioContext( 1,
                                                   rate * data.duration,
                                                   rate
                                                 );

                let src = ctx.createBufferSource();
                src.buffer = data;
                src.connect( ctx.destination );
                src.start();
                ctx.startRendering()
                    .then(buffer=>ok( [...buffer.getChannelData(0)]
                                      .map( x => (signed?x*0.5 : x*0.5+0.5)*((~0) >>> (32 - bpp)) )
                                    ))
                    .catch(ex => nok(ex));
            }catch(ex){
                nok(ex);
            }

            return p;
        }

    };
    
    APP.add(new class BuildAudio {
        readAudio(file, opts){
            let settings = Object.assign({},
                                         DATA.project.audio,
                                         opts);
            let bpp = settings.bpp || 8;
            let rate = settings.rate || 8000;
            let signed = settings.signed || false;
            
            if( typeof file != "string" ){
                return (new LibAudio())
                    .downSample(file, bpp, rate);
            }

            return new Promise((resolve, reject)=>{
                fs.readFile( DATA.projectPath + path.sep + file,
                             (error, data)=>{
                                 if( error ){
                                     reject(error);
                                     return;
                                 }
                                 
                                 (new LibAudio())
                                     .downSample(data, bpp, rate)
                                     .then(data=>resolve(data))
                                     .catch(ex=>reject(ex));
                             });
                    
            });
        }

    });

});
