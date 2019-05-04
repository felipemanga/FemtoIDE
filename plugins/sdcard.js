APP.addPlugin("SDCard", [], _=>{
    class SDCard {
        pollBufferMeta( buffer, meta ){
            meta.sdcard = {
                type:"bool",
                label:"Copy to SD",
                default: false
            };
        }
    }

    APP.add(new SDCard());
});
