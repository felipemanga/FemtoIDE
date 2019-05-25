const fs = require("fs");

function read(file, fmt){
    return fs.readFileSync(rootPath + file, fmt);
}

let src = {
    java:{
        lang:{
            Exception:{ src:read("/java/lang/Exception.java", "utf-8") },
            Runtime:{ src:read("/java/lang/Runtime.java", "utf-8") },
            System:{ src:read("/java/lang/System.java", "utf-8") },
            Thread:{ src:read("/java/lang/Thread.java", "utf-8") },
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
            Direct:{ src:read("/femto/mode/Direct.java", "utf-8") },
        },
        input:{
            Button:{ src:read("/femto/input/Button.java", "utf-8") },
            ButtonListener:{ src:read("/femto/input/ButtonListener.java", "utf-8") },
        },
        palette:{
            A64:{src:read("/femto/palette/A64.pal", "utf-8"), parser:"pal"},
            Aap16:{src:read("/femto/palette/Aap16.pal", "utf-8"), parser:"pal"},
            AndrewKensler16:{src:read("/femto/palette/AndrewKensler16.pal", "utf-8"), parser:"pal"},
            Arne16:{src:read("/femto/palette/Arne16.pal", "utf-8"), parser:"pal"},
            Arq16:{src:read("/femto/palette/Arq16.pal", "utf-8"), parser:"pal"},
            Bubblegum16:{src:read("/femto/palette/Bubblegum16.pal", "utf-8"), parser:"pal"},
            Castpixel16:{src:read("/femto/palette/Castpixel16.pal", "utf-8"), parser:"pal"},
            CdBac:{src:read("/femto/palette/CdBac.pal", "utf-8"), parser:"pal"},
            Cgarne:{src:read("/femto/palette/Cgarne.pal", "utf-8"), parser:"pal"},
            Chip16:{src:read("/femto/palette/Chip16.pal", "utf-8"), parser:"pal"},
            Chromatic16:{src:read("/femto/palette/Chromatic16.pal", "utf-8"), parser:"pal"},
            Cm16:{src:read("/femto/palette/Cm16.pal", "utf-8"), parser:"pal"},
            Colodore:{src:read("/femto/palette/Colodore.pal", "utf-8"), parser:"pal"},
            ColorGraphicsAdapter:{src:read("/femto/palette/ColorGraphicsAdapter.pal", "utf-8"), parser:"pal"},
            Commodore64:{src:read("/femto/palette/Commodore64.pal", "utf-8"), parser:"pal"},
            CommodoreVic20:{src:read("/femto/palette/CommodoreVic20.pal", "utf-8"), parser:"pal"},
            CopperTech:{src:read("/femto/palette/CopperTech.pal", "utf-8"), parser:"pal"},
            Crimso11:{src:read("/femto/palette/Crimso11.pal", "utf-8"), parser:"pal"},
            Cthulhu16:{src:read("/femto/palette/Cthulhu16.pal", "utf-8"), parser:"pal"},
            Dawnbringer16:{src:read("/femto/palette/Dawnbringer16.pal", "utf-8"), parser:"pal"},
            Dinoknight16:{src:read("/femto/palette/Dinoknight16.pal", "utf-8"), parser:"pal"},
            Drazile16:{src:read("/femto/palette/Drazile16.pal", "utf-8"), parser:"pal"},
            EasterIsland:{src:read("/femto/palette/EasterIsland.pal", "utf-8"), parser:"pal"},
            Endesga16:{src:read("/femto/palette/Endesga16.pal", "utf-8"), parser:"pal"},
            EndesgaSoft16:{src:read("/femto/palette/EndesgaSoft16.pal", "utf-8"), parser:"pal"},
            Enos16:{src:read("/femto/palette/Enos16.pal", "utf-8"), parser:"pal"},
            ErogeCopper:{src:read("/femto/palette/ErogeCopper.pal", "utf-8"), parser:"pal"},
            Europa16:{src:read("/femto/palette/Europa16.pal", "utf-8"), parser:"pal"},
            Fantasy16:{src:read("/femto/palette/Fantasy16.pal", "utf-8"), parser:"pal"},
            Flyguy16:{src:read("/femto/palette/Flyguy16.pal", "utf-8"), parser:"pal"},
            Froste16:{src:read("/femto/palette/Froste16.pal", "utf-8"), parser:"pal"},
            Fun16:{src:read("/femto/palette/Fun16.pal", "utf-8"), parser:"pal"},
            FztEthereal16:{src:read("/femto/palette/FztEthereal16.pal", "utf-8"), parser:"pal"},
            GrungeShift:{src:read("/femto/palette/GrungeShift.pal", "utf-8"), parser:"pal"},
            IslandJoy16:{src:read("/femto/palette/IslandJoy16.pal", "utf-8"), parser:"pal"},
            JmpJapaneseMachinePalette:{src:read("/femto/palette/JmpJapaneseMachinePalette.pal", "utf-8"), parser:"pal"},
            Jw64:{src:read("/femto/palette/Jw64.pal", "utf-8"), parser:"pal"},
            MacintoshIi:{src:read("/femto/palette/MacintoshIi.pal", "utf-8"), parser:"pal"},
            Master16:{src:read("/femto/palette/Master16.pal", "utf-8"), parser:"pal"},
            MicrosoftWindows:{src:read("/femto/palette/MicrosoftWindows.pal", "utf-8"), parser:"pal"},
            Na16:{src:read("/femto/palette/Na16.pal", "utf-8"), parser:"pal"},
            Naji16:{src:read("/femto/palette/Naji16.pal", "utf-8"), parser:"pal"},
            Night16:{src:read("/femto/palette/Night16.pal", "utf-8"), parser:"pal"},
            Optimum:{src:read("/femto/palette/Optimum.pal", "utf-8"), parser:"pal"},
            Pavanz16:{src:read("/femto/palette/Pavanz16.pal", "utf-8"), parser:"pal"},
            PeachyPop16:{src:read("/femto/palette/PeachyPop16.pal", "utf-8"), parser:"pal"},
            Pico8:{src:read("/femto/palette/Pico8.pal", "utf-8"), parser:"pal"},
            Psygnosia:{src:read("/femto/palette/Psygnosia.pal", "utf-8"), parser:"pal"},
            RiscOs:{src:read("/femto/palette/RiscOs.pal", "utf-8"), parser:"pal"},
            RPlace:{src:read("/femto/palette/RPlace.pal", "utf-8"), parser:"pal"},
            Simplejpc16:{src:read("/femto/palette/Simplejpc16.pal", "utf-8"), parser:"pal"},
            SteamLords:{src:read("/femto/palette/SteamLords.pal", "utf-8"), parser:"pal"},
            Super1716:{src:read("/femto/palette/Super1716.pal", "utf-8"), parser:"pal"},
            Sweetie16:{src:read("/femto/palette/Sweetie16.pal", "utf-8"), parser:"pal"},
            Taffy16:{src:read("/femto/palette/Taffy16.pal", "utf-8"), parser:"pal"},
            ThomsonM05:{src:read("/femto/palette/ThomsonM05.pal", "utf-8"), parser:"pal"},
            Thug16:{src:read("/femto/palette/Thug16.pal", "utf-8"), parser:"pal"},
            UltimaViAtariSt:{src:read("/femto/palette/UltimaViAtariSt.pal", "utf-8"), parser:"pal"},
            UltimaViSharpX68000:{src:read("/femto/palette/UltimaViSharpX68000.pal", "utf-8"), parser:"pal"},
            Zxarne52:{src:read("/femto/palette/Zxarne52.pal", "utf-8"), parser:"pal"},
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
        hardware:{
            IRQ:{ src:read("/femto/hardware/IRQ.java", "utf-8") },
            LPC11U68:{ src:read("/femto/hardware/LPC11U68.java", "utf-8") },
            ST7775:{ src:read("/femto/hardware/ST7775.java", "utf-8") },
        },
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
