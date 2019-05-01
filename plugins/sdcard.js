APP.addPlugin("SDCard", [], _=>{
    class SDCard {
        pollBufferMeta( buffer, meta ){
            meta.sdcard = {
                type:"bool",
                label:"Copy to SD"
            };
        }
    }

    APP.add(new SDCard());
});
