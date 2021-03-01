const defaultCPPProperties = {
    "configurations": [
        {
            "name": "Linux",
            "includePath": [
                "${workspaceFolder}/**"
            ],
            "defines": [],
            "compilerPath": "/usr/bin/clang",
            "cStandard": "c11",
            "cppStandard": "c++17",
            "intelliSenseMode": "gcc-x64",
            "compileCommands": ""
        }
    ],
    "version": 4
};

const IDE = DATA.os == "darwin" ?
      DATA.appPath.replace(/^(.*?\.app).*/i, "\"$1/Contents/MacOS/nwjs\" \"$1/Contents/Resources/app.nw\"")
      :
      DATA.appPath + "/IDE" + DATA.executableExt;

const defaultTask = {
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Femto compile",
            "type": "shell",
            "command": IDE + " \"${projectName}\" compile",
            "problemMatcher": [
                "$gcc"
            ],
            "group": "build"
        },
        {
            "label": "Femto clean compile",
            "type": "shell",
            "command": IDE + " \"${projectName}\" cleanCompile",
            "problemMatcher": [
                "$gcc"
            ],
            "group":"build"
        },
        {
            "label": "Femto compile & run",
            "type": "shell",
            "command": IDE + " \"${projectName}\" compileAndRun",
            "problemMatcher": [
                "$gcc"
            ],
            "group":{
                "kind": "build",
                "isDefault": true
            }
        }
    ]
};

const defaultLaunch = {
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "(gdb) Launch",
            "type": "cppdbg",
            "request": "launch",
            "program": "${appPath}/${os}/PokittoEmu${executableExt}",
            "args": ["${projectPath}/${projectName}.bin", "-I", "${buildFolder}/fs.img"],
            "stopAtEntry": false,
            "cwd": "${projectPath}",
            "environment": [],
            "externalConsole": false,
            "avoidWindowsConsoleRedirection": true,
            "MIMode": "gdb",
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ]
        }
    ]
};

APP.add(new class VSCode {

    queryMenus(){
        APP.addMenu(" femto", {
            "Init VSCode Project":"initVSCode"
        });
    }

    forceInitVSCode(){
        this.initVSCode(true);
    }

    initVSCode(force){

        let vscode = DATA.projectPath + path.sep + ".vscode";
        if(fs.existsSync(vscode)){
            if(!force){
                APP.error("VSCode workspace already exists");
                return;
            }
        } else {
            APP.log("Creating VSCode workspace");
            fs.mkdirSync(vscode);
        }

        APP.customSetVariables({
            buildFolder:APP.getCPPBuildFolder()
        });

        fs.writeFileSync(
            vscode + path.sep + "c_cpp_properties.json",
            JSON.stringify(defaultCPPProperties, null, 1),
            "utf-8"
        );

        fs.writeFileSync(
            vscode + path.sep + "launch.json",
            JSON.stringify(APP.escape(defaultLaunch), null, 1),
            "utf-8"
        );


        fs.writeFileSync(
            vscode + path.sep + "tasks.json",
            JSON.stringify(APP.escape(defaultTask), null, 1),
            "utf-8"
        );

        APP.compile();
    }
});
