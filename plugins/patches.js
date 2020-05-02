APP.addPlugin("Patches", [], _=>{
    APP.add(new class Patches {
        onOpenProject(){
            const project = DATA.project;
            if(!project.ideVersion) project.ideVersion = 0;
            try{ addNative(project); }catch(ex){}
            try{ fixOSC(project); }catch(ex){}
            try{ cpp17(project); }catch(ex){}
        }
    });

    function addNative(project){
        if(project.ideVersion >= 10000)
            return;
        project.ideVersion = 10000;
        Object.assign(project.libs, {
	    "linux": "Desktop",
	    "windows": "Desktop",
	    "darwin": "Desktop",
	    "Desktop": [{
		"recurse": "${appPath}/PokittoLib/Pokitto",
		"ignore": "BmpImage.cpp|ChaN|old_32bitSDL|libpff|SDFileSystem|File/ChaN|USBDevice|tinydir/tests|tinydir/samples|JoyHat|mbed-pokitto|POKITTO_HW|POKITTO_XTERNALS|PokittoDisk.cpp|PokittoBattery.cpp|Documentation|examples?|Physics|main.cpp|Pokitto_simsound.cpp"
            }]
        });
        Object.assign(project.CPPFlags, {
	    "linux": {
		"extend": "Desktop",
		"flags": [
		    "-DPROJ_LINUX=1",
		    "-D_REENTRANT"
		]
	    },
	    "windows": "Desktop",
            "Desktop": [
		"-I${projectPath}",
		"-DPOK_SIM",
		"-Wall",
		"-std=gnu++17",
		"-fsigned-char",
		"-DPOK_SIM",
		"-fno-rtti",
		"-Wno-pointer-arith",
		"-c",
		"-fno-builtin",
		"-ffunction-sections",
		"-fdata-sections",
		"-funsigned-char",
		"-MMD",
		"-fno-delete-null-pointer-checks"
	    ]
        });

        Object.assign(project.CFlags, {
	    "linux": "Desktop",
	    "windows": "Desktop",
	    "darwin": "Desktop",
            "Desktop": [
		"-I${projectPath}",
		"-DPOK_SIM",
		"-Wall",
		"-fsigned-char",
		"-DPOK_SIM",
		"-Wno-pointer-arith",
		"-c",
		"-fno-builtin",
		"-ffunction-sections",
		"-fdata-sections",
		"-funsigned-char",
		"-MMD",
		"-fno-delete-null-pointer-checks"
	    ]
        });

        Object.assign(project.LDFlags, {
	    "linux": [
		"$objectFiles",
		"-lpthread",
		"-lSDL2",
		"--output",
		"${projectPath}/${projectName}"
	    ],
	    "windows": [
		"-static",
		"-lmingw32",
		"-L${appPath}/PokittoLib/Pokitto/POKITTO_SIM/SDL2/lib",
		"-lSDL2main",
		"-lSDL2",
		"-lm",
		"-ldinput8",
		"-ldxguid",
		"-ldxerr8",
		"-luser32",
		"-lgdi32",
		"-lwinmm",
		"-limm32",
		"-lole32",
		"-loleaut32",
		"-lshell32",
		"-lversion",
		"-luuid",
		"-lsetupapi",
		"-static-libgcc",
		"-mwindows",
		"--output",
		"${projectPath}/${projectName}.exe",
		"$objectFiles"
	    ]
        });

        Object.assign(project.pipelines, {
	    "Desktop": [
		"img-to-c",
		"compile-cpp",
		"compile-ld"
	    ],
	    "linux": "Desktop",
	    "windows": "Desktop",
	    "darwin": "Desktop"
        });
    }

    function fixOSC(project){
        let Pokitto = DATA.project.CFlags.Pokitto;
        if(Pokitto[0] == "-D_OSC=2"){
            Pokitto[0] = "-D_OSCT=2";
            APP.dirtyProject();
        }
    }

    function cpp17(project){
        Object.keys(project.CPPFlags).forEach(key=>{
            let flags = project.CPPFlags[key];
            if(Array.isArray(flags)){
                let i = flags.indexOf("-std=c++14");

                if(i == -1)
                    i = flags.indexOf("-std=c++11");

                if(i != -1){
                    flags[i] = "-std=c++17";
                    APP.dirtyProject();
                }
            }
        });
    }
});
