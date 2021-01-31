APP.addPlugin("Meta", ["Project"], _=>{
    let defaultMeta = {};

    let projectFileMeta = {};

    function getOldKey(buffer){
        let path = buffer.path;
        const projectPath = DATA.projectPath;
        if( !path.startsWith(projectPath) )
            return null;

        path = path.substr( projectPath.length );
        return path;
    }

    class Meta {

        getMetaKey(buffer){
            let path = typeof buffer == "string" ? buffer : buffer.path+"";
            let projectPath = DATA.projectPath.replace(/\\/g, "/");
            path = path.replace(/\\/g, "/");
            if( !path.startsWith(projectPath) )
                return null;
            return path.substr(projectPath.length + 1);
        }

        onOpenProject(){
            projectFileMeta = DATA.project.meta || {};
            DATA.project.meta = {};
        }

        registerProjectFile( buffer ){
            const project = DATA.project;
            if( buffer.pluginData.Meta )
                return;

            let key = this.getMetaKey(buffer);
            if( !key )
                return;

            let metabuf = DATA.project.meta[key] = {};
            let oldmeta = projectFileMeta[key] || projectFileMeta[getOldKey(buffer)] || {};
            let metadef = {};
            APP.pollBufferMeta( buffer, metadef );
            buffer.pluginData.Meta = {};
            for( let key in metadef ){
                let value = defaultMeta[key] = metadef[key]["default"];
                let type = metadef[key].type;
                if(key in oldmeta && oldmeta[key] != value){
                    if(type && typeof oldmeta[key] == type)
                        value = metabuf[key] = oldmeta[key];
                }
                buffer.pluginData.Meta[key] = metadef[key];
            }

            APP.dirtyProject();

        }

        pollBufferActions( buffer, actions ){
            let meta = this.getBufferMeta(buffer);
            if(!meta)
                return;

            for( let key in buffer.pluginData.Meta ){
                actions.push( getAction(key) );
            }

            function getAction( key ){
                let def = buffer.pluginData.Meta[ key ];
                return {
                    category: def.category,
                    label: def.label,
                    type: def.type,
                    value: meta[key],
                    cb( value ){
                        if( def.cb )
                            value = def.cb(value);
                        
                        if( meta[key] === value )
                            return value;

                        meta[key] = value;
                        APP.dirtyProject();
                        return value;
                    }
                };
            }
        }

        setBufferMeta( buffer, K, value ){
            let key = this.getMetaKey(buffer);
            if(key == null)
                return;

            let meta = DATA.project.meta[key];
            if(!meta)
                DATA.project.meta[key] = meta = {};
            
            meta[K] = value;
            APP.dirtyProject();
        }

        getBufferMeta( buffer, K ){
            let key = this.getMetaKey(buffer);
            if(key == null)
                return undefined;

            let meta = DATA.project.meta[key];
            if(!meta)
                DATA.project.meta[key] = meta = {};

            if(arguments.length == 1)
                return meta;

            return meta[K];
        }

        addMeta( buffer, key, type, args ){
        }

    }

    APP.add( new Meta() );
});
