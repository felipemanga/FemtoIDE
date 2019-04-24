APP.bindKeys("global", {
    "C-x C-f": APP.findFile,
    "C-c b": APP.compile,
    "C-c r": APP.run,
    "C-c C-r": APP.runDebug,
    "C-x C-c": APP.exit,
    "C-c d": _=>nw.Window.get().showDevTools(),
    "C-w": APP.killRegion,
    "C-y": APP.yank,
    "M-y": APP.yankPop,
    "M-w": APP.killRingSave,
    "M-x": _=>document.querySelector("#cmd").focus(),
});

APP.add({
    onCreateACE( ace ){
        ace.commands.bindKeys({
            "ctrl-l":null,
            "alt-y":null,
            "ctrl-y":null,
            "alt-w":null
        });
    }
});

APP.customSetVariables({
    "aceTheme":"ace/theme/chaos",
    "projectsPath":DATA.appPath + path.sep + "projects",
    "os": process.platform,
    "executableExt": process.platform == "windows" ? ".exe" : "",

    "C-Pokitto":[DATA.appPath, process.platform, "arm", "bin", "arm-none-eabi-gcc"].join(path.sep),

    "CPP-Pokitto":[DATA.appPath, process.platform, "arm", "bin", "arm-none-eabi-g++"].join(path.sep),

    "S-Pokitto":[DATA.appPath, process.platform, "arm", "bin", "arm-none-eabi-as"].join(path.sep),

    "LD-Pokitto":[DATA.appPath, process.platform, "arm", "bin", "arm-none-eabi-gcc"].join(path.sep),
    
    "ELF2BIN-Pokitto":[DATA.appPath, process.platform, "arm", "bin", "arm-none-eabi-objcopy"].join(path.sep),

    "EMU-Pokitto":[DATA.appPath, process.platform, "PokittoEmu"].join(path.sep)
    
});

APP.loadDirectory(DATA.appPath + path.sep + "plugins");

