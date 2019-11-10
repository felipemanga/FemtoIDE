APP.customSetVariables({
    name:"YourName",
    email:"Your@Email.com"
});

APP.bindKeys("global", {
    "M-h": APP.toggleHCPP,
    "\x1B": APP.clearLog,
    "C-\x0D": APP.action,
    "C-b": APP.compile,
    "C-r": APP.run,
    "C-g":APP.compileAndRun,
    "C-o":APP.focusFilter,
    "M-c g":APP.displayGeneratedCPP,
    "F1": APP.help,
    "F4": APP.stopEmulator,
    "F5": APP.debug,
    "S-F5": APP.debugJLink,
    "F8": APP.debugContinue,
    "F10": APP.debugStepOver,
    "F11": APP.debugStepIn,
    "F6": APP.debugStepOut,
    "C-q": APP.exit,
    "M-c M-d": _=>nw.Window.get().showDevTools(),
    "C-w": APP.killRegion,
    "C-y": APP.yank,
    "M-y": APP.yankPop,
    "M-w": APP.killRingSave,
    "M-x": _=>document.querySelector("#cmd").focus(),
    "C-M-f": APP.beautify,
    "M-.": APP.jumpToDeclaration,
    
    "C-c": APP.copy,
    "C-x": APP.cut,
    "C-v": APP.paste,
    "C-/": APP.toggleComment,
    "C-,": APP.goBack,
    "C-.": APP.goForward,

    "C-S-g": APP.gitCommitAll,
});

APP.add({
    onCreateACE( ace ){
        ace.setOption( "printMargin" , false);
        ace.commands.bindKeys({
            "ctrl-l":null,
            "alt-y":null,
            "ctrl-y":null,
            "alt-w":null,
            "ctrl-.":null,
            "ctrl-,":null
        });
    }
});

let platform = process
    .platform
    .toLowerCase()
    .startsWith("win") ? "windows" : process.platform.toLowerCase();
APP.customSetVariables({
    "aceTheme":"ace/theme/monokai",
    "projectsPath":platform == "darwin" ?
        path.join(process.env.HOME, "projects") :
        DATA.appPath + path.sep + "projects",
    "JLINK":"JLinkGDBServer",

    "os": platform,

    "executableExt":platform=="windows" ? ".exe" : "",

    "ADDR2LINE-Pokitto":[DATA.appPath, platform, "arm", "bin", "arm-none-eabi-addr2line"].join(path.sep),

    "GDB-Pokitto":[DATA.appPath, platform, "arm", "bin", "arm-none-eabi-gdb"].join(path.sep),

    "C-Pokitto":[DATA.appPath, platform, "arm", "bin", "arm-none-eabi-gcc"].join(path.sep),

    "CPP-Pokitto":[DATA.appPath, platform, "arm", "bin", "arm-none-eabi-g++"].join(path.sep),

    "S-Pokitto":[DATA.appPath, platform, "arm", "bin", "arm-none-eabi-as"].join(path.sep),

    "LD-Pokitto":[DATA.appPath, platform, "arm", "bin", "arm-none-eabi-gcc"].join(path.sep),
    
    "ELF2BIN-Pokitto":[DATA.appPath, platform, "arm", "bin", "arm-none-eabi-objcopy"].join(path.sep),

    "EMU-Pokitto":[DATA.appPath, platform, "PokittoEmu"].join(path.sep)
    
});

APP.loadDirectory(DATA.appPath + path.sep + "plugins");

