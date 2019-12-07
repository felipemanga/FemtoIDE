const fs = require("fs");

function read(file, fmt, obj){
    let filePath = rootPath + file;
    let ret = {src:fs.readFileSync(filePath, fmt), filePath};
    if( obj ) Object.assign(ret, obj);
    return ret;
}

let src = {
    java:{
        lang:{
            Exception:read("/java/lang/Exception.java", "utf-8"),
            Runtime:read("/java/lang/Runtime.java", "utf-8"),
            System:read("/java/lang/System.java", "utf-8"),
            Thread:read("/java/lang/Thread.java", "utf-8"),
            String:{ src:require("./java/lang/String.js") },
            Integer:read("./java/lang/Integer.java", "utf-8"),
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
            Math:read("/java/lang/Math.java", "utf-8"),
        },

        util:{
            Date:read("/java/util/Date.java", "utf-8"),
            Arrays:read("/java/util/Arrays.java", "utf-8"),
            Random:read("/java/util/Random.java", "utf-8")
        }
    },
    
    femto:{

        math:{
            Vector4:read("/femto/math/Vector4.java", "utf-8"),
            Matrix4:read("/femto/math/Matrix4.java", "utf-8"),
        },
        
        mode:{
            ScreenMode:read("/femto/mode/ScreenMode.java", "utf-8"),
            HiRes16Color:read("/femto/mode/HiRes16Color.java", "utf-8"),
            LowRes16Color:read("/femto/mode/LowRes16Color.java", "utf-8"),
            LowRes256Color:read("/femto/mode/LowRes256Color.java", "utf-8"),
            Direct:read("/femto/mode/Direct.java", "utf-8"),
            Direct4BPP:read("/femto/mode/Direct4BPP.java", "utf-8"),
        },
        
        input:{
            Button:read("/femto/input/Button.java", "utf-8"),
            ButtonListener:read("/femto/input/ButtonListener.java", "utf-8"),
        },
        
        palette:{
            A64:read("/femto/palette/A64.pal", "utf-8", {parser:"pal"}),
            Aap16:read("/femto/palette/Aap16.pal", "utf-8", {parser:"pal"}),
            AndrewKensler16:read("/femto/palette/AndrewKensler16.pal", "utf-8", {parser:"pal"}),
            Arne16:read("/femto/palette/Arne16.pal", "utf-8", {parser:"pal"}),
            Arq16:read("/femto/palette/Arq16.pal", "utf-8", {parser:"pal"}),
            Aurora:read("/femto/palette/Aurora.pal", "utf-8", {parser:"pal"}),
            Bubblegum16:read("/femto/palette/Bubblegum16.pal", "utf-8", {parser:"pal"}),
            Castpixel16:read("/femto/palette/Castpixel16.pal", "utf-8", {parser:"pal"}),
            CdBac:read("/femto/palette/CdBac.pal", "utf-8", {parser:"pal"}),
            Cgarne:read("/femto/palette/Cgarne.pal", "utf-8", {parser:"pal"}),
            Chip16:read("/femto/palette/Chip16.pal", "utf-8", {parser:"pal"}),
            Chromatic16:read("/femto/palette/Chromatic16.pal", "utf-8", {parser:"pal"}),
            Cm16:read("/femto/palette/Cm16.pal", "utf-8", {parser:"pal"}),
            Colodore:read("/femto/palette/Colodore.pal", "utf-8", {parser:"pal"}),
            ColorGraphicsAdapter:read("/femto/palette/ColorGraphicsAdapter.pal", "utf-8", {parser:"pal"}),
            Commodore64:read("/femto/palette/Commodore64.pal", "utf-8", {parser:"pal"}),
            CommodoreVic20:read("/femto/palette/CommodoreVic20.pal", "utf-8", {parser:"pal"}),
            CopperTech:read("/femto/palette/CopperTech.pal", "utf-8", {parser:"pal"}),
            Crimso11:read("/femto/palette/Crimso11.pal", "utf-8", {parser:"pal"}),
            Cthulhu16:read("/femto/palette/Cthulhu16.pal", "utf-8", {parser:"pal"}),
            Dawnbringer16:read("/femto/palette/Dawnbringer16.pal", "utf-8", {parser:"pal"}),
            Dinoknight16:read("/femto/palette/Dinoknight16.pal", "utf-8", {parser:"pal"}),
            Drazile16:read("/femto/palette/Drazile16.pal", "utf-8", {parser:"pal"}),
            EasterIsland:read("/femto/palette/EasterIsland.pal", "utf-8", {parser:"pal"}),
            Endesga16:read("/femto/palette/Endesga16.pal", "utf-8", {parser:"pal"}),
            EndesgaSoft16:read("/femto/palette/EndesgaSoft16.pal", "utf-8", {parser:"pal"}),
            Enos16:read("/femto/palette/Enos16.pal", "utf-8", {parser:"pal"}),
            ErogeCopper:read("/femto/palette/ErogeCopper.pal", "utf-8", {parser:"pal"}),
            Europa16:read("/femto/palette/Europa16.pal", "utf-8", {parser:"pal"}),
            Fantasy16:read("/femto/palette/Fantasy16.pal", "utf-8", {parser:"pal"}),
            Flyguy16:read("/femto/palette/Flyguy16.pal", "utf-8", {parser:"pal"}),
            Froste16:read("/femto/palette/Froste16.pal", "utf-8", {parser:"pal"}),
            Fun16:read("/femto/palette/Fun16.pal", "utf-8", {parser:"pal"}),
            FztEthereal16:read("/femto/palette/FztEthereal16.pal", "utf-8", {parser:"pal"}),
            GrungeShift:read("/femto/palette/GrungeShift.pal", "utf-8", {parser:"pal"}),
            IslandJoy16:read("/femto/palette/IslandJoy16.pal", "utf-8", {parser:"pal"}),
            JmpJapaneseMachinePalette:read("/femto/palette/JmpJapaneseMachinePalette.pal", "utf-8", {parser:"pal"}),
            Jw64:read("/femto/palette/Jw64.pal", "utf-8", {parser:"pal"}),
            MacintoshIi:read("/femto/palette/MacintoshIi.pal", "utf-8", {parser:"pal"}),
            Master16:read("/femto/palette/Master16.pal", "utf-8", {parser:"pal"}),
            MicrosoftWindows:read("/femto/palette/MicrosoftWindows.pal", "utf-8", {parser:"pal"}),
            Miloslav:read("/femto/palette/Miloslav.pal", "utf-8", {parser:"pal"}),
            Na16:read("/femto/palette/Na16.pal", "utf-8", {parser:"pal"}),
            Naji16:read("/femto/palette/Naji16.pal", "utf-8", {parser:"pal"}),
            Night16:read("/femto/palette/Night16.pal", "utf-8", {parser:"pal"}),
            Optimum:read("/femto/palette/Optimum.pal", "utf-8", {parser:"pal"}),
            Pavanz16:read("/femto/palette/Pavanz16.pal", "utf-8", {parser:"pal"}),
            PeachyPop16:read("/femto/palette/PeachyPop16.pal", "utf-8", {parser:"pal"}),
            Pico8:read("/femto/palette/Pico8.pal", "utf-8", {parser:"pal"}),
            Psygnosia:read("/femto/palette/Psygnosia.pal", "utf-8", {parser:"pal"}),
            RiscOs:read("/femto/palette/RiscOs.pal", "utf-8", {parser:"pal"}),
            RPlace:read("/femto/palette/RPlace.pal", "utf-8", {parser:"pal"}),
            Simplejpc16:read("/femto/palette/Simplejpc16.pal", "utf-8", {parser:"pal"}),
            SteamLords:read("/femto/palette/SteamLords.pal", "utf-8", {parser:"pal"}),
            Super1716:read("/femto/palette/Super1716.pal", "utf-8", {parser:"pal"}),
            Sweetie16:read("/femto/palette/Sweetie16.pal", "utf-8", {parser:"pal"}),
            Taffy16:read("/femto/palette/Taffy16.pal", "utf-8", {parser:"pal"}),
            ThomsonM05:read("/femto/palette/ThomsonM05.pal", "utf-8", {parser:"pal"}),
            Thug16:read("/femto/palette/Thug16.pal", "utf-8", {parser:"pal"}),
            UltimaViAtariSt:read("/femto/palette/UltimaViAtariSt.pal", "utf-8", {parser:"pal"}),
            UltimaViSharpX68000:read("/femto/palette/UltimaViSharpX68000.pal", "utf-8", {parser:"pal"}),
            Zxarne52:read("/femto/palette/Zxarne52.pal", "utf-8", {parser:"pal"}),
        },
        
        font:{
            Adventurer:read("/femto/font/Adventurer.font", undefined, {type:"font", parser:"bin" }),
            Donut:read("/femto/font/Donut.font", undefined, {type:"font", parser:"bin" }),
            Dragon:read("/femto/font/Dragon.font", undefined, {type:"font", parser:"bin" }),
            Font3x3:read("/femto/font/Font3x3.font", undefined, {type:"font", parser:"bin" }),
            Font3x5:read("/femto/font/Font3x5.font", undefined, {type:"font", parser:"bin" }),
            Font5x7:read("/femto/font/Font5x7.font", undefined, {type:"font", parser:"bin" }),
            FontC64:read("/femto/font/FontC64.font", undefined, {type:"font", parser:"bin" }),
            FontMonkey:read("/femto/font/FontMonkey.font", undefined, {type:"font", parser:"bin" }),
            Karateka:read("/femto/font/Karateka.font", undefined, {type:"font", parser:"bin" }),
            Koubit:read("/femto/font/Koubit.font", undefined, {type:"font", parser:"bin" }),
            Mini:read("/femto/font/Mini.font", undefined, {type:"font", parser:"bin" }),
            Runes:read("/femto/font/Runes.font", undefined, {type:"font", parser:"bin" }),
            TIC80:read("/femto/font/TIC80.font", undefined, {type:"font", parser:"bin" }),
            Tight:read("/femto/font/Tight.font", undefined, {type:"font", parser:"bin" }),
            Tiny:read("/femto/font/Tiny.font", undefined, {type:"font", parser:"bin" }),
            ZXSpec:read("/femto/font/ZXSpec.font", undefined, {type:"font", parser:"bin" })
        },
        
        Cookie:read("/femto/Cookie.java", "utf-8"),
        Sprite:read("/femto/Sprite.java", "utf-8"),
        XMLNode:read("/femto/XMLNode.java", "utf-8"),
        StringPair:read("/femto/StringPair.java", "utf-8"),
        Prompt:read("/femto/Prompt.java", "utf-8"),
        Image:read("/femto/Image.java", "utf-8"),
        TileSet:read("/femto/TileSet.java", "utf-8"),
        FrameRef:read("/femto/FrameRef.java", "utf-8"),
        State:read("/femto/State.java", "utf-8"),
        StateMachine:read("/femto/StateMachine.java", "utf-8"),
        Game:read("/femto/Game.java", "utf-8"),

        CPP:read("/femto/CPP.java", "utf-8"),

        sound:{
            Mixer:read("/femto/sound/Mixer.java", "utf-8"),
            Procedural:read("/femto/sound/Procedural.java", "utf-8"),
            Stream:read("/femto/sound/Stream.java", "utf-8"),
        },
        
        hardware:{
            EEPROM:read("/femto/hardware/EEPROM.java", "utf-8"),
            IRQ:read("/femto/hardware/IRQ.java", "utf-8"),
            Timer:read("/femto/hardware/Timer.java", "utf-8"),
            LPC11U68:read("/femto/hardware/LPC11U68.java", "utf-8"),
            ST7775:read("/femto/hardware/ST7775.java", "utf-8"),
            EXT:read("/femto/hardware/EXT.java", "utf-8"),
        },
        
    },
    
    Resources:{src:"sauce", parser:"resources"},
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
