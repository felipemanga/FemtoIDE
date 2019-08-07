APP.addPlugin("VFS", ["Project"], _=>{
/*
    const db = openDatabase("tags", 0.1, "tags", 10 * 1024 * 1024 );

    function sql(cb){
        if( typeof cb == "string" )
            cb = [cb];
        if( Array.isArray(cb) ){
            let arr = cb;
            cb = t=>t(arr);
        }

        db.transaction(t=>{
            cb(sql=>{
                if( !Array.isArray(sql) )
                    sql = [sql];
                sql.forEach(sql=>{
                    t.executeSql(sql);
                });
            });
        });
    }

    function reset(){
        sql`DROP TABLE IF EXISTS decls`;
        sql`DROP TABLE IF EXISTS refs`;
        sql`DROP TABLE IF EXISTS tags`;
    }
*/
    let units;

    function reset(){
        units = {};
    }

    APP.add(new class VFS {

        onOpenProject(){
            if( !DATA.project.javaFlags )
                return;
            APP.addMenu("Edit", {
                "Jump To Declaration":"jumpToDeclaration",
            });
        }

        updateProjectIndexFromVFS(vfs){
            reset();
            recurse(vfs);

            function recurse(obj){
                if( !obj || typeof obj != "object" ) return;
                if( obj.parser == "java" && obj.unit && obj.filePath ){
                    indexUnit(obj.unit);
                    return;
                }

                if( typeof obj.parser == "string" )
                    return;

                for( var k in obj ){
                    recurse(obj[k]);
                }
            }

            function indexUnit(unit){
                units[unit.file] = unit
                    .index
                    .filter(entry=>entry.location && entry.location.startLine)
                    .sort((a, b)=>{
                        return a.location.startOffset - b.location.startOffset;
                });
            }
        }

        findDeclaration(buffer, offset){
            if( !buffer )
                return undefined;

            if( !units ){
                APP.error("Build project to create index");
                return null;
            }
            
            let filePath = buffer.path;
            let unit = units[filePath];
            if( !unit ){
                APP.error(filePath + " not in index");
                return null;
            }
            let next = unit.findIndex( entry => entry.location.startOffset > offset );
            if( next == -1 ){
                next = unit.length;
            }

            let entry = unit[next-1];
            if( !entry ){
                APP.error("Entry not found");
                return null;
            }

            if( entry.getTarget )
                entry = entry.getTarget();

            if( !entry || !entry.location ){
                APP.error("Declaration not found");
                return null;
            }

            return entry && entry.location;
        }
    });

});
