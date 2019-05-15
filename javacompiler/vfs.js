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
            A64:{src:read("/femto/font/A64.pal", "utf-8"), parser:"pal"},
            Aap16:{src:read("/femto/font/Aap16.pal", "utf-8"), parser:"pal"},
            AndrewKensler16:{src:read("/femto/font/AndrewKensler16.pal", "utf-8"), parser:"pal"},
            Arne16:{src:read("/femto/font/Arne16.pal", "utf-8"), parser:"pal"},
            Arq16:{src:read("/femto/font/Arq16.pal", "utf-8"), parser:"pal"},
            Bubblegum16:{src:read("/femto/font/Bubblegum16.pal", "utf-8"), parser:"pal"},
            Castpixel16:{src:read("/femto/font/Castpixel16.pal", "utf-8"), parser:"pal"},
            CdBac:{src:read("/femto/font/CdBac.pal", "utf-8"), parser:"pal"},
            Cgarne:{src:read("/femto/font/Cgarne.pal", "utf-8"), parser:"pal"},
            Chip16:{src:read("/femto/font/Chip16.pal", "utf-8"), parser:"pal"},
            Chromatic16:{src:read("/femto/font/Chromatic16.pal", "utf-8"), parser:"pal"},
            Cm16:{src:read("/femto/font/Cm16.pal", "utf-8"), parser:"pal"},
            Colodore:{src:read("/femto/font/Colodore.pal", "utf-8"), parser:"pal"},
            ColorGraphicsAdapter:{src:read("/femto/font/ColorGraphicsAdapter.pal", "utf-8"), parser:"pal"},
            Commodore64:{src:read("/femto/font/Commodore64.pal", "utf-8"), parser:"pal"},
            CommodoreVic20:{src:read("/femto/font/CommodoreVic20.pal", "utf-8"), parser:"pal"},
            CopperTech:{src:read("/femto/font/CopperTech.pal", "utf-8"), parser:"pal"},
            Crimso11:{src:read("/femto/font/Crimso11.pal", "utf-8"), parser:"pal"},
            Cthulhu16:{src:read("/femto/font/Cthulhu16.pal", "utf-8"), parser:"pal"},
            Dawnbringer16:{src:read("/femto/font/Dawnbringer16.pal", "utf-8"), parser:"pal"},
            Dinoknight16:{src:read("/femto/font/Dinoknight16.pal", "utf-8"), parser:"pal"},
            Drazile16:{src:read("/femto/font/Drazile16.pal", "utf-8"), parser:"pal"},
            EasterIsland:{src:read("/femto/font/EasterIsland.pal", "utf-8"), parser:"pal"},
            Endesga16:{src:read("/femto/font/Endesga16.pal", "utf-8"), parser:"pal"},
            EndesgaSoft16:{src:read("/femto/font/EndesgaSoft16.pal", "utf-8"), parser:"pal"},
            Enos16:{src:read("/femto/font/Enos16.pal", "utf-8"), parser:"pal"},
            ErogeCopper:{src:read("/femto/font/ErogeCopper.pal", "utf-8"), parser:"pal"},
            Europa16:{src:read("/femto/font/Europa16.pal", "utf-8"), parser:"pal"},
            Fantasy16:{src:read("/femto/font/Fantasy16.pal", "utf-8"), parser:"pal"},
            Flyguy16:{src:read("/femto/font/Flyguy16.pal", "utf-8"), parser:"pal"},
            Froste16:{src:read("/femto/font/Froste16.pal", "utf-8"), parser:"pal"},
            Fun16:{src:read("/femto/font/Fun16.pal", "utf-8"), parser:"pal"},
            FztEthereal16:{src:read("/femto/font/FztEthereal16.pal", "utf-8"), parser:"pal"},
            GrungeShift:{src:read("/femto/font/GrungeShift.pal", "utf-8"), parser:"pal"},
            IslandJoy16:{src:read("/femto/font/IslandJoy16.pal", "utf-8"), parser:"pal"},
            JmpJapaneseMachinePalette:{src:read("/femto/font/JmpJapaneseMachinePalette.pal", "utf-8"), parser:"pal"},
            Jw64:{src:read("/femto/font/Jw64.pal", "utf-8"), parser:"pal"},
            MacintoshIi:{src:read("/femto/font/MacintoshIi.pal", "utf-8"), parser:"pal"},
            Master16:{src:read("/femto/font/Master16.pal", "utf-8"), parser:"pal"},
            MicrosoftWindows:{src:read("/femto/font/MicrosoftWindows.pal", "utf-8"), parser:"pal"},
            Na16:{src:read("/femto/font/Na16.pal", "utf-8"), parser:"pal"},
            Naji16:{src:read("/femto/font/Naji16.pal", "utf-8"), parser:"pal"},
            Night16:{src:read("/femto/font/Night16.pal", "utf-8"), parser:"pal"},
            Optimum:{src:read("/femto/font/Optimum.pal", "utf-8"), parser:"pal"},
            Pavanz16:{src:read("/femto/font/Pavanz16.pal", "utf-8"), parser:"pal"},
            PeachyPop16:{src:read("/femto/font/PeachyPop16.pal", "utf-8"), parser:"pal"},
            Pico8:{src:read("/femto/font/Pico8.pal", "utf-8"), parser:"pal"},
            Psygnosia:{src:read("/femto/font/Psygnosia.pal", "utf-8"), parser:"pal"},
            RiscOs:{src:read("/femto/font/RiscOs.pal", "utf-8"), parser:"pal"},
            RPlace:{src:read("/femto/font/RPlace.pal", "utf-8"), parser:"pal"},
            Simplejpc16:{src:read("/femto/font/Simplejpc16.pal", "utf-8"), parser:"pal"},
            SteamLords:{src:read("/femto/font/SteamLords.pal", "utf-8"), parser:"pal"},
            Super1716:{src:read("/femto/font/Super1716.pal", "utf-8"), parser:"pal"},
            Sweetie16:{src:read("/femto/font/Sweetie16.pal", "utf-8"), parser:"pal"},
            Taffy16:{src:read("/femto/font/Taffy16.pal", "utf-8"), parser:"pal"},
            ThomsonM05:{src:read("/femto/font/ThomsonM05.pal", "utf-8"), parser:"pal"},
            Thug16:{src:read("/femto/font/Thug16.pal", "utf-8"), parser:"pal"},
            UltimaViAtariSt:{src:read("/femto/font/UltimaViAtariSt.pal", "utf-8"), parser:"pal"},
            UltimaViSharpX68000:{src:read("/femto/font/UltimaViSharpX68000.pal", "utf-8"), parser:"pal"},
            Zxarne52:{src:read("/femto/font/Zxarne52.pal", "utf-8"), parser:"pal"},
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
