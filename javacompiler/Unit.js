
let unitId = 1;
class Unit {
    
    constructor(){
        this.name = [];
        this.imports = [];
        this.types = [];
        this.id = unitId++;
    }

    resolve( fqcn, trail, scope, dbg ){
        let ret;
        const {Ref} = require("./Ref.js");
        if( fqcn instanceof Ref )
            fqcn = fqcn.name;

        if( typeof fqcn == "string" )
            fqcn = fqcn.split(".");
        else
            fqcn = [...fqcn];

        if( dbg )
            console.log("Looking for: ", fqcn);

        for( let impdecl of this.imports ){
            let imp = impdecl.fqcn;
            if( impdecl.star ){
                // ignore for now
            }else if( imp[imp.length-1] == fqcn[0] ){
                scope = null;
                fqcn.shift();
                fqcn = [...imp, ...fqcn];
                break;
            }
        }

        if( scope ){
            let len = trail.length;
            let oscope = scope;
            while( scope && !ret ){
                if( scope.resolve ){
                    trail.length = len;
                    if( dbg )
                        console.log( "in: ", scope.name );
                    ret = scope.resolve( fqcn, trail );
                }
                scope = scope.scope;
            }

            if( ret ){
                while( oscope ){
                    let i = trail.indexOf(oscope);
                    if( i != -1 ){
                        trail.splice(0, i);
                        break;
                    }
                    oscope = oscope.scope;
                }
            }
            
            return ret;
        }else{
            let name = fqcn[0];
            let type = this.types.find( t => t.name == name );
            if( type ){
                trail.push(this);
                trail.push(type);
                if( fqcn.length ){
                    if( !type.resolve ){
                        console.error("Error: ", type, fqcn);
                    }
                    ret = type.resolve(fqcn.splice(1,fqcn.length), trail);
                }
                else return type;
            }
        }

        if( !ret ){
            const {toAST} = require("./AST.js");
            let unit;
            let dirs = [...this.name];
            let path;
            while( !unit ){
                path = [ ...dirs, ...fqcn ];
                unit = toAST(path);
                if( !dirs.length ) break;
                dirs.pop();
            }
            if( unit && unit != this ){
                ret = unit.resolve(path, trail, null);
            }
        }

        if( !ret ){
            for( let impdecl of this.imports ){
                let imp = impdecl.fqcn;
                if( (!impdecl.star && imp[imp.length-1] != fqcn[0]) || !impdecl.isStatic )
                    continue;

                let cfqcn = [...impdecl.fqcn, ...fqcn];
                ret = this.resolve( cfqcn, trail );

                if( ret )
                    break;
            }
        }

        
        if( !ret ){
            console.error( "Could not find " + fqcn.join(".") );
            throw ( "Could not find " + fqcn.join(".") );
        }
        
        return ret;
    }

    binary( data, name ){
        this.name = [...name];
        let clazzName = this.name.pop();
        const Clazz = require("./Clazz.js");
        const clazz = new Clazz( clazzName, this );
        clazz.binary( data );
        this.types.push( clazz );        
    }

    palette( colors, name ){
        this.name = [...name];
        let clazzName = this.name.pop();
        const Clazz = require("./Clazz.js");
        const clazz = new Clazz( clazzName, this );
        clazz.palette(colors);
        this.types.push( clazz );
    }

    image( sprite, name ){
        this.name = [...name];
        console.log("Image: ", this.name);
        let clazzName = this.name.pop();
        const Clazz = require("./Clazz.js");
        const clazz = new Clazz( clazzName, this );
        clazz.image( sprite );
        this.types.push( clazz );
    }

    process( node ){
        const ImportDeclaration = require("./ImportDeclaration.js");
        const Clazz = require("./Clazz.js");
        const {Enum} = require("./Enum.js");
        const Interface = require("./Interface.js");

        let ocu = node.children.ordinaryCompilationUnit[0];
        if( !ocu )
            throw "No compilation unit in file";

        let packageDeclNodes = ocu.children["packageDeclaration"] || [];
        if( packageDeclNodes.length ){
            this.name = packageDeclNodes[0]
                .children
                .Identifier
                .map(n=>n.image);
        }
        let importDeclNodes = ocu.children["importDeclaration"] || [];
        for( let declNode of importDeclNodes ){
            this.imports.push( new ImportDeclaration(declNode) );
        };

        let typeDeclNodes = ocu.children["typeDeclaration"] || [];
        for( let declNode of typeDeclNodes ){
            for( let key in declNode.children ){
                for( let kdeclNode of declNode.children[key] ){

                    let clazz;

                    if( kdeclNode.name == "interfaceDeclaration" )
                        clazz = Interface;
                    else if( kdeclNode.name == "classDeclaration" && kdeclNode.children.normalClassDeclaration )
                        clazz = Clazz;
                    else if( kdeclNode.name == "classDeclaration" && kdeclNode.children.enumDeclaration )
                        clazz = Enum;

                    if( !clazz )
                        throw "Unknown type declaration: " + JSON.stringify(kdeclNode);

                    this.types.push( new clazz(kdeclNode, this) );
                }
            }
        }

    }

}

function getUnit( scope ){
    while( scope.scope )
        scope = scope.scope;
    return scope;
}

module.exports = { Unit, getUnit };
