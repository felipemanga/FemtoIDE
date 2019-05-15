const fs = require("fs");

function read(file, fmt){
    return fs.readFileSync(rootPath + file, fmt);
}

let src = {
    java:{
        lang:{
            Runtime:{ src:read("/java/lang/Runtime.java", "utf-8") },
            System:{ src:read("/java/lang/System.java", "utf-8") },
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
            Date:{ src:read("/java/util/Date.java", "utf-8") },
            Arrays:{ src:read("/java/util/Arrays.java", "utf-8") },
            Random:{ src:read("/java/util/Random.java", "utf-8") }
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
            Pico8:{ src:read("/femto/palette/Pico8.pal", "utf-8"), parser:"pal" },
            Colodore:{ src:read("/femto/palette/Colodore.pal", "utf-8"), parser:"pal" },
            ErogeCopper:{ src:read("/femto/palette/ErogeCopper.pal", "utf-8"), parser:"pal" }
        },
        font:{
            Adventurer:{ src:read("/femto/font/Adventurer.font"), type:"font", parser:"bin" },
            Donut:{ src:read("/femto/font/Donut.font"), type:"font", parser:"bin" },
            Dragon:{ src:read("/femto/font/Dragon.font"), type:"font", parser:"bin" },
            Font3x3:{ src:read("/femto/font/Font3x3.font"), type:"font", parser:"bin" },
            Font3x5:{ src:read("/femto/font/Font3x5.font"), type:"font", parser:"bin" },
            Font5x7:{ src:read("/femto/font/Font5x7.font"), type:"font", parser:"bin" },
            FontC64:{ src:read("/femto/font/FontC64.font"), type:"font", parser:"bin" },
            FontMonkey:{ src:read("/femto/font/FontMonkey.font"), type:"font", parser:"bin" },
            Karateka:{ src:read("/femto/font/Karateka.font"), type:"font", parser:"bin" },
            Koubit:{ src:read("/femto/font/Koubit.font"), type:"font", parser:"bin" },
            Mini:{ src:read("/femto/font/Mini.font"), type:"font", parser:"bin" },
            Runes:{ src:read("/femto/font/Runes.font"), type:"font", parser:"bin" },
            TIC80:{ src:read("/femto/font/TIC80.font"), type:"font", parser:"bin" },
            Tight:{ src:read("/femto/font/Tight.font"), type:"font", parser:"bin" },
            Tiny:{ src:read("/femto/font/Tiny.font"), type:"font", parser:"bin" },
            ZXSpec:{ src:read("/femto/font/ZXSpec.font"), type:"font", parser:"bin" }
        },
        Sprite:{ src:read("/femto/Sprite.java", "utf-8") },
        Image:{ src:read("/femto/Image.java", "utf-8") },
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
