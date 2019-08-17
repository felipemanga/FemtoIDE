
const Null = new class NullT {
    constructor(){
        this.name = "Null";
        this.isClass = true;
        this.isNative = false;
    }
    
    isOfType(other){
        return !other.isNative;
    }
};

let unitId = 1;
let depth = 0, note = "";
let stack = [];

function push(id){
    stack.push(id + "/" + note);
}

function pop(){
    stack.pop();
    note = "";
}

class Unit {
    
    constructor(){
        this.name = [];
        this.imports = [];
        this.types = [];
        this.id = unitId++;
        this.file = "";
        this.isUnit = true;
        this.unit = this;
        this.index = [this];
    }

    resolve( fqcn, trail, test, scope ){
        if( !test )
            test = _=>true;

        push(this.id);

        if( typeof test != "function" ){
            throw new Error(`Type of test is ${typeof test}: ${test?test.constructor.name:test}`);
        }
        
        let ret;
        const {Ref} = require("./Ref.js");
        if( fqcn instanceof Ref )
            fqcn = fqcn.name;

        if( typeof fqcn == "string" )
            fqcn = fqcn.split(".");
        else
            fqcn = [...fqcn];

        if( fqcn.length == 1 && fqcn[0] == "Null" )
            return Null;
/*        
        if( stack.length==50 ){
            throw new Error(`Could not find "${fqcn.join(".")}"\n${stack.join(', ')}`);
        }
*/
        let srcfqcn = [...fqcn];

        if( scope ){
            let len = trail.length;
            let oscope = scope;
            while( scope && !ret ){
                if( scope.resolve ){
                    trail.length = len;
                    note = "scope " + scope.name;
                    ret = scope.resolve( fqcn, trail, test );
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
            pop();
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
                    note = "no-scope";
                    ret = type.resolve(fqcn.splice(1,fqcn.length), trail, test);
                }
                else{
                    pop();
                    return type;
                }
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
                note = "ast";
                ret = unit.resolve(path, trail, test, null);
            }
        }

        if( !ret ){
            const {toAST} = require("./AST.js");
            for( let impdecl of this.imports ){
                let imp = impdecl.fqcn;
                if( impdecl.star ){
                    // ignore for now
                }else if( imp[imp.length-1] == fqcn[0] ){
                    scope = null;
                    let cfqcn = [...fqcn];
                    cfqcn.shift();
                    let dirs = [...this.name];
                    let path, unit;
                    while( !unit ){
                        path = [ ...dirs, ...imp, ...cfqcn ];
                        unit = toAST(path);
                        if( !dirs.length ) break;
                        dirs.pop();
                    }
                    if( unit && unit != this ){
                        ret = unit.resolve(path, trail, test, null);
                        if( ret )
                            break;
                    }
                }
            }
        }
        
        if( !ret ){
            for( let impdecl of this.imports ){
                let imp = impdecl.fqcn;
                if( (!impdecl.star && imp[imp.length-1] != fqcn[0]) || !impdecl.isStatic )
                    continue;

                let cfqcn = [...impdecl.fqcn, ...fqcn];
                note = "more-imports";
                ret = this.resolve( cfqcn, trail, test, null );

                if( ret )
                    break;
            }
        }

        
        if( !ret ){
            throw new Error( "Could not find \"" + srcfqcn.join(".") + "\"");
        }
        
        pop();
        return ret;
    }

    resources(){
        this.name = ["Resources"];
        let clazzName = this.name.pop();
        const Clazz = require("./Clazz.js");
        const clazz = new Clazz( clazzName, this );
        this.types.push( clazz );
        return clazz;
    }

    text( data, name ){
        this.name = [...name];
        let clazzName = this.name.pop();
        const Clazz = require("./Clazz.js");
        const clazz = new Clazz( clazzName, this );
        clazz.text( data, "txt" );
        this.types.push( clazz );                
    }

    xml( data, name, type ){
        const {toAST} = require("./AST.js");
        this.name = [...name];

        this.imports.push({
            fqcn:"femto.XMLNode".split("."),
            star:false,
            isStatic:false
        });

        this.imports.push({
            fqcn:"femto.StringPair".split("."),
            star:false,
            isStatic:false
        });

        let clazzName = this.name.pop();
        const Clazz = require("./Clazz.js");
        const clazz = new Clazz( clazzName, this );
        clazz.xml( data, type );
        this.types.push( clazz );                
    }
    
    binary( data, name, extension ){
        const clazz = this.clazz(name);
        clazz.binary( data, extension );
    }

    clazz( name ){
        this.name = [...name];
        let clazzName = this.name.pop();
        const Clazz = require("./Clazz.js");
        const clazz = new Clazz( clazzName, this );
        this.types.push( clazz );
        return clazz;
    }

    staticImage( sprite, name, interfaces ){
        this.name = [...name];
        console.log("Static Image: ", this.name);
        let clazzName = this.name.pop();
        const Clazz = require("./Clazz.js");
        const clazz = new Clazz( clazzName, this );
        clazz.staticImage( sprite, interfaces );
        this.types.push( clazz );
    }

    image( sprite, name, interfaces ){
        this.name = [...name];
        console.log("Image: ", this.name);
        let clazzName = this.name.pop();
        const Clazz = require("./Clazz.js");
        const clazz = new Clazz( clazzName, this );
        clazz.image( sprite, interfaces );
        this.types.push( clazz );
    }

    process( node ){
        const ImportDeclaration = require("./ImportDeclaration.js");
        const Clazz = require("./Clazz.js");
        const {Enum} = require("./Enum.js");

        let ocu = node.children.ordinaryCompilationUnit[0];
        if( !ocu )
            throw new Error("No compilation unit in file");

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
                        clazz = Clazz;
                    else if( kdeclNode.name == "classDeclaration" && kdeclNode.children.normalClassDeclaration )
                        clazz = Clazz;
                    else if( kdeclNode.name == "classDeclaration" && kdeclNode.children.enumDeclaration )
                        clazz = Enum;

                    if( !clazz )
                        throw new Error("Unknown type declaration: " + JSON.stringify(kdeclNode));

                    this.types.push( new clazz(kdeclNode, this) );
                }
            }
        }

    }

}

function getUnit( scope ){
    if( scope.unit )
        return scope.unit;
    while( scope.scope && !scope.unit )
        scope = scope.scope;
    return scope.unit;
}

module.exports = { Unit, getUnit };
