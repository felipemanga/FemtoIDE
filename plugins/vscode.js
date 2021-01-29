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

const defaultTask = {
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Femto compile",
            "type": "shell",
            "command": "${appPath}/IDE${executableExt} ${projectName} compile",
            "problemMatcher": [
                "$gcc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        },
        {
            "label": "Femto clean compile",
            "type": "shell",
            "command": "${appPath}/IDE${executableExt} ${projectName} cleanCompile",
            "problemMatcher": [
                "$gcc"
            ],
            "group":"build"
        },
        {
            "label": "Femto compile & run",
            "type": "shell",
            "command": "${appPath}/IDE${executableExt} ${projectName} compileAndRun",
            "problemMatcher": [
                "$gcc"
            ],
            "group":"test"
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
            "args": ["${projectPath}/Juroku.bin", "-I", "/tmp/b_${projectName}/fs.img"],
            "stopAtEntry": false,
            "cwd": "${projectPath}",
            "environment": [],
            "externalConsole": false,
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

    initVSCode(){

        let vscode = DATA.projectPath + path.sep + ".vscode";
        if(fs.existsSync(vscode)){
            APP.error("VSCode workspace already exists");
            return;
        }

        APP.log("Creating VSCode workspace");
        fs.mkdirSync(vscode);

        fs.writeFileSync(
            vscode + path.sep + "c_cpp_properties.json",
            JSON.stringify(defaultCPPProperties, null, 1),
            "utf-8"
        );

        fs.writeFileSync(
            vscode + path.sep + "launch.json",
            APP.replaceDataInString(JSON.stringify(defaultLaunch, null, 1)),
            "utf-8"
        );


        fs.writeFileSync(
            vscode + path.sep + "tasks.json",
            APP.replaceDataInString(JSON.stringify(defaultTask, null, 1)),
            "utf-8"
        );

        APP.compile();
    }
});
