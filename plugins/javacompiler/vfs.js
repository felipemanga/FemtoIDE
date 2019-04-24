const fs = require("fs");

let src = {
    java:{
        lang:{
            System:{ src:require("./java/lang/System.js") },
            String:{ src:require("./java/lang/String.js") },
            Array:{ src:require("./java/lang/Array.js") },
            int:{ src:require("./java/lang/int.js") },
            uint:{ src:require("./java/lang/uint.js") },
            short:{ src:require("./java/lang/short.js") },
            ushort:{ src:require("./java/lang/ushort.js") },
            byte:{ src:require("./java/lang/byte.js") },
            ubyte:{ src:require("./java/lang/ubyte.js") },
            boolean:{ src:require("./java/lang/boolean.js") },
            float:{ src:require("./java/lang/float.js") },
            char:{ src:require("./java/lang/char.js") },
            void:{ src:require("./java/lang/void.js") },
            long:{ src:require("./java/lang/long.js") },
            ulong:{ src:require("./java/lang/ulong.js") },
            double:{ src:require("./java/lang/double.js") },
            pointer:{ src:require("./java/lang/pointer.js") },
            Object:{ src:require("./java/lang/Object.js") },
        }
    },
    femto:{
        mode:{
            ScreenMode:{ src:require("./femto/mode/ScreenMode.js") },
            HiRes16Color:{ src:require("./femto/mode/HiRes16Color.js") },
        },
        input:{
            Button:{ src:require("./femto/input/Button.js") }
        },
        palette:{
            Pico8:{ src:require("./femto/palette/Pico8.js"), parser:"pal" },
            Colodore:{ src:require("./femto/palette/Colodore.js"), parser:"pal" },
            ErogeCopper:{ src:require("./femto/palette/ErogeCopper.js"), parser:"pal" }
        },
        font:{
            Tiny:{ src:fs.readFileSync("./femto/font/Tiny.bin"), parser:"bin" },
            Dragon:{ src:fs.readFileSync("./femto/font/Dragon.bin"), parser:"bin" },
            Tic80:{ src:fs.readFileSync("./femto/font/Tic80.bin"), parser:"bin" },
        },
        Sprite:{ src:require("./femto/Sprite.js") },
        FrameRef:{ src:require("./femto/FrameRef.js") },
    },
    __root__:{
    }
};

let sourcepath = [
    "java.lang".split("."),
    []
];

function create(){
    return JSON.parse(JSON.stringify(src));
}

module.exports = { create, sourcepath };
