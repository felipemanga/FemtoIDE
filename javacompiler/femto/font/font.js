const fs = require("fs");
const files = fs.readdirSync(".").filter( f => /\.cpp$/.test(f) );
files.forEach( f => {
    console.log(f);
    let src = fs.readFileSync( f, "utf-8" );
    src = src.replace(/^[^{]*\{/, "[");
    src = src.replace(/\};[\s\S]*$/, "]");
    const font = eval(src);
    f = f[0].toUpperCase() + f.substr(1);
    f = f.replace(/\..*/, ".font");
    fs.writeFileSync( f, new Uint8Array(font));
});
