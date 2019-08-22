//!APP-HOOK: pre-build

makeMPY()
    .then(mpy=>freeze(mpy))
    .then(_=>hookArgs[1]())
    .catch(({error, data})=>{
        hookArgs[1](`${error}: ${data}`);
    });
    
function freeze(mpylist){
    return invoke("python", 
        path.join(DATA.projectPath, "micropython", "tools", "mpy-tool.py"), 
        "-mlongint-impl=none", 
        "-f", 
        "-q", path.join("micropython", "genhdr", "qstrdefs.preprocessed.h"),
        ...mpylist
    ).then(frozen=>{
        write(path.join("micropython", "frozen_mpy.c"), frozen);
    });
}
    
function makeMPY(){
    const sources = findAllSources("./");
    const mpycross = path.join(DATA.projectPath, "micropython", "tools", `${DATA.os}-mpy-cross${DATA.executableExt}`);
    return Promise.all(sources.map(source=>{
        const mpy = source.replace(/\.py$/i, ".mpy");
        return invoke(
            mpycross, 
            "-o", 
            mpy,
            "-s",
            source,
            source
            ).then(_=>mpy);
    }));
}

function findAllSources(dirName){
    const ret = [];
    (dir(dirName)||[]).forEach(file=>{
        const full = path.join(dirName, file);
        if( /\.py$/i.test(file) ){
            ret.push(full);
        }else if(full != path.join("micropython", "tools")){
            ret.push(...findAllSources(full));
        }
    });
    return ret;
}