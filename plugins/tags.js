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
    let units, wasWarned = false;

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

        _findScope(buffer, offset){
            if( !buffer )
                return undefined;

            if( !units ){
                if( !wasWarned )
                    APP.error("Build project to create index");
                wasWarned = true;
                return null;
            }
            
            let filePath = buffer.path;
            let unit = units[filePath];
            if( !unit ){
                APP.error(filePath + " not in index");
                return null;
            }
            let next = unit.findIndex( entry => entry.location.startOffset > offset );
            if( next == -1 )
                next = unit.length;

            let scope = unit[next-1];
            if( !scope )
                scope = unit[0];
            while( !scope.resolve )
                scope = scope.scope;
            return scope;
        }

        completionAtPoint(buffer, offset){

            let list = [];
            let scope = this._findScope(buffer, offset);
            if( !scope ) 
                return list;

            let identifier = this.getIdentifierUnderCursor(buffer, offset);

            let incomplete = identifier.pop();

            let entry = scope;
            if( identifier.length ){
                entry = null;
                while( scope && !entry ){
                    try{
                        entry = scope.resolve(identifier, [], _=>true);
                    }catch(ex){}
                    scope = scope.scope;
                }
            }

            if( !entry )
                return list;

            if( identifier.length ){
                list.push( ...search(entry) );
            }else{
                while( scope ){
                    list.push( ...search(scope) );
                    scope = scope.scope;
                }
            }

            list = list.sort((a, b)=>a.score - b.score);

            return list;

            function search(entry){
                if( entry.isField )
                    entry = entry.type;
                if( entry.isTypeRef )
                    entry = entry.getTarget();

                let partial = [];
                if( entry.types && entry.types.length )
                    partial.push(...filter(entry.types));
                if( entry.methods && entry.methods.length )
                    partial.push(...filter(entry.methods));
                if( entry.fields && entry.fields.length )
                    partial.push(...filter(entry.fields));
                if( entry.parameters && entry.parameters.length )
                    partial.push(...filter(entry.parameters));
                if( entry.extends )
                    partial.push(...search(entry.extends));
                return partial;
            }

            function filter(list){
                let out = [];
                for( let entry of list ){
                    let entryName = entry.name;
                    if( entry.isConstructor || typeof entryName != "string" )
                        continue;
                    let isMatch = true;
                    let score = 0;
                    let pos = -1;
                    for( let i=0; i<incomplete.length; ++i ){
                        let ch = incomplete[i];
                        let found = entryName.indexOf(ch, pos+1);
                        if( found == -1 ){
                            isMatch = false;
                            break;
                        }
                        score += found - (pos+1);
                        pos = found;
                    }

                    if( isMatch ){
                        score += entryName.length - pos;
                        let value = entryName;
                        let meta = (entry.scope||{}).name||"";

                        if( entry.isMethod ){
                            entryName += `(${entry.parameters.map(p=>p.type.getTarget().name + " " + p.name).join(", ")})`;
                            value += `(${entry.parameters.map(p=>p.name).join(", ")})`;
                        }

                        out.push({
                            caption:entryName,
                            value,
                            meta,
                            score
                        });
                    }
                }
                return out;
            }

        }

        findDeclaration(buffer, offset){
            let scope = this._findScope(buffer, offset);
            if( !scope )
                return [];

            let identifier = this.getIdentifierUnderCursor(buffer, offset);

            let entry;
            while( scope && !entry ){
                try{
                    entry = scope.resolve(identifier, [], _=>true);
                }catch(ex){}
                scope = scope.scope;
            }

            if( !entry || !entry.location ){
                APP.error("Declaration not found");
                return null;
            }

            return entry && entry.location;
        }

        getIdentifierUnderCursor(buffer, offset, autocomplete=false){
            let start = offset;
            let end = offset;
            let str = buffer.data;
            if( typeof buffer.transform == "string" )
                str = APP[buffer.transform](buffer.data);

            while( start && isIdentifierChar(str[start-1]) )
                start--;

            if( !autocomplete ){
                while( end < str.length && isIdentifierChar(str[end]) )
                    end++;
            }

            return str.substr(start, end - start).split(".");

            function isIdentifierChar(c){
                return /[a-zA-Z0-9_.]/.test(c);
            }
        }
    });

});
