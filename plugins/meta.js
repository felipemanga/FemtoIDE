APP.addPlugin("Meta", ["Project"], _=>{

    class Meta {

        registerProjectFile( buffer ){
            let meta = {};
            APP.pollBufferMeta( buffer, meta );
        }

        setMeta( buffer, key, value ){
        }

        getMeta( buffer, key ){
        }

        addMeta( buffer, key, type, args ){
        }

    }

    APP.add( new Meta() );
});
