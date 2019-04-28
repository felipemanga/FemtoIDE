const fs = require("fs");

function read(file, fmt){
    return fs.readFileSync(rootPath + file, fmt);
}

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
            Math:{ src:read("/java/lang/Math.java", "utf-8") },
        },
        util:{
            Arrays:{ src:read("/java/util/Arrays.java", "utf-8") }
        }
    },
    femto:{
        mode:{
            ScreenMode:{ src:read("/femto/mode/ScreenMode.java", "utf-8") },
            HiRes16Color:{ src:read("/femto/mode/HiRes16Color.java", "utf-8") },
        },
        input:{
            Button:{ src:read("/femto/input/Button.java", "utf-8") }
        },
        palette:{
            Pico8:{ src:require("./femto/palette/Pico8.js"), parser:"pal" },
            Colodore:{ src:require("./femto/palette/Colodore.js"), parser:"pal" },
            ErogeCopper:{ src:require("./femto/palette/ErogeCopper.js"), parser:"pal" }
        },
        font:{
            Tiny:{ src:require("./femto/font/Tiny.bin"), parser:"bin" },
            Dragon:{ src:require("./femto/font/Dragon.bin"), parser:"bin" },
            Tic80:{ src:require("./femto/font/Tic80.bin"), parser:"bin" },
        },
        Sprite:{ src:read("/femto/Sprite.java", "utf-8") },
        FrameRef:{ src:read("/femto/FrameRef.java", "utf-8") },
        State:{ src:read("/femto/State.java", "utf-8") },
        StateMachine:{ src:read("/femto/StateMachine.java", "utf-8") },
        Game:{ src:read("/femto/Game.java", "utf-8") },
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
