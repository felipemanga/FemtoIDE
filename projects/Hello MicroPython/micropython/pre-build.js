//!APP-HOOK: pre-build

const osdir = path.join(DATA.appPath, DATA.os);
const python = DATA.os == "windows" ? path.join(osdir, "python", "python.exe") : "python";
const mpytool = path.join(osdir, "micropython", "mpy-tool.py");
const mpycross = path.join(osdir, "micropython", `mpy-cross${DATA.executableExt}`);

makeMPY()
    .then(mpy=>freeze(mpy))
    .then(_=>hookArgs[1]())
    .catch(({error, data})=>{
        hookArgs[1](`${error}: ${data}`);
    });
    
function freeze(mpylist){
    return invoke(python, 
        mpytool, 
        "-mlongint-impl=none", 
        "-f", 
        "-q", path.join("micropython", "genhdr", "qstrdefs.preprocessed.h"),
        ...mpylist
    ).then(frozen=>{
        write(path.join("micropython", "frozen_mpy.c"), frozen);
    });
}
    
function makeMPY(){
    const sources = findAllSources("");
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
        const full = dirName + file;
        if( /\.py$/i.test(file) ){
            ret.push(full);
        }else{
            ret.push(...findAllSources(full + "/"));
        }
    });
    return ret;
}