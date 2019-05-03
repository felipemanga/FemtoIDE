let fs = require("fs");
const {TypeRef} = require("./TypeRef.js");

let platform, platformDir;

let indent, units;

function push(){
    indent += "\t";    
}

function pop(){
    indent = indent.substr(1);
}

function openNamespace( unit, comment ){
    let out = `\n// --------- ${comment} ---------\n`;
    indent = "";
    unit.name.forEach( packageName => {
        out += `${indent}namespace up_${packageName} {\n`;
        push();
    });
    return out;
}

function closeNamespace( unit ){
    let out = "";
    unit.name.forEach( packageName => {
        pop();
        out += `${indent}}\n`;
    });
    return out;
}

function writeForwardDecl( unit ){
    let out = openNamespace( unit, "Forward declarations" );

    unit.types.forEach( t=>writeTypes(t) );

    out += closeNamespace( unit );

    return out;

    function writeTypes( t ){

        if( t.cppType == "enum class" ){
            out += `${indent}class ue_${t.name}{\n`;
            out += `${indent}\tue_${t.name}(){}\n`;
            out += `${indent}\n${indent}public:\n`;
            push();
            t.constantList.forEach( c => {
                out += `${indent}static ue_${t.name} ${c.name};\n`;
            });
            pop();
            out += `${indent}};\n\n`;
        }else{
            if( t.implements && t.implements.find(c=>c.name.length == 1 && c.name[0] == "__stub_only__" ) ){
                out += `${indent}// stub ${t.name}\n`;
                return;
            }
            
            out += `${indent}${t.cppType} uc_${t.name};\n`;
            if( t.types.length ){
                out += `${indent}namespace un_${t.name} {\n`;
                push();
                t.types.forEach( st => writeTypes(st) );
                pop();
                out += `${indent}}\n`;
            }
        }
    }
    
}

function writeType( type, local ){
    let finalType;
    if( type.isArray ){
        if( type.getTarget().isNative ){
            finalType = `__array_nat<`;
        }else{
            finalType = `__array<`;
        }
        finalType += `${writePath(type)}>`;
    }else if( type.isReference && type.getTarget().isEnum ){
        finalType = writePath(type) + "*";
    }else if( type.isReference )
        finalType = local ? `__ref__<${writePath(type)}>` : `${writePath(type)}*`;
    else
        finalType = writePath(type);
    
    return finalType;
}

function writeMethodSignature( method, writeStatic, writeClass ){
    let out = "", sep = " ";
    out += indent;

    if( writeStatic ){
        if( method.isStatic )
            out += "static ";
        else if( !method.isConstructor )
            out += "virtual ";
    }

    if( !method.isConstructor )
        out += `${writeType(method.result)} `;
    
    if( writeClass )
        out +=`uc_${writeClass}::`;

    if( method.isConstructor )
        out += "uc_";
    
    out += `${method.name} (`;

    method.parameters.forEach( param => {
        out += `${sep}${writeType(param.type, true)} ${param.name}`;
        sep = ", ";
    });
            
    out += ')';

    if( method.isAbstract )
        out += " = 0";

    return out;
}

function writeClassDecl( unit ){
    let out = openNamespace( unit, "Class Declarations" );
    
    unit.types.forEach( t => writeTypes(t) );
    
    out += closeNamespace( unit );
    return out;

    function writeTypes( t ){
        if( t.cppType != "class" || t.isInterface )
            return;

        if( t.implements.find( i => i.name.length == 1 && i.name[0] == "__stub_only__" ) )
            return;

        let sep = ', ';
        out += `${indent}class uc_${t.name} `;
        if( !t.extends || t.extends.name[0] != "__raw__" ){
            out += ': public ';
            out += t.extends ? writePath(t.extends) : "up_java::up_lang::uc_Object";
        }

        t.implements.forEach( impl =>{
            if( impl.name.length == 1 && impl.name[0] == "__stub__" )
                return;
            out += `${sep}public ${writeType(impl)}`;
            sep = ', ';
        });

        out += ` {\n${indent}public:\n`;
        push();

        t.fields.forEach( field => {

            out += `${indent}`;
            if( field.isStatic ) out += "static ";
            if( field.isFinal ) out += "const ";
            out += `${writeType(field.type, field.isStatic)} ${field.name};\n`;

        });

        t.methods.forEach( method => {
            out += writeMethodSignature( method, true );
            out += ";\n";
        });

        // out += `${indent}virtual ~uc_${t.name}();\n`;
        if( !t.extends || t.extends.name[0] != "__raw__" ){
            if( t.fields.length )
                out += `${indent}virtual void __mark__();\n`;
            out += `${indent}static const uint32_t __id__ = ${t.id};\n`;
            out += `${indent}virtual bool __instanceof__( uint32_t id );\n`;
        }
        pop();
        out += `${indent}};\n`;

        if( t.types.length ){
            out += `${indent}namespace un_${t.name} {\n`;
            push();
            t.types.forEach( t => writeTypes(t) );
            pop();
            out += `${indent}}\n`;
        }
        
    }
}

let refid = 0;

function writePath( expr, clean ){
    let out = "";
    let trail;
    if( expr.getTarget ){
        if( !expr.getTarget( ) )
            return null;
        trail = expr.trail;
    }else{
        trail = [];
        let e = expr;
        while( e ){
            trail.unshift(e);
            e = e.scope;
        }
    }

    let isInEnum = false;
    let next = "";
    trail.forEach( (n, i) => {

        let nextNode = trail[i+1];
        let tmp;
        switch( n.constructor.name ){
        case "Unit":
            addUnit(n);
            tmp = n.name;
            if( !clean ) tmp = tmp.map(n=>"up_"+n);
            out += tmp.join("::");
            next = "::";
            break;

        case "Clazz":
            if( i==0 && expr.name == "this" ){
                out += next + "this";
                next = "->";
            }else{
                if( clean )
                    out += next + n.name;
                else if( nextNode && nextNode.constructor.name == "Clazz" )
                    out += next + "un_" + n.name;
                else
                    out += next + "uc_" + n.name;
                next = "::";
            }
            break;

        case "Ref":
            out += next + n.name;
            next += "->";
            break;
            
        case "Enum":
            out += next + "ue_" + n.name;
            next = "::";
            isInEnum = true;
            break;

        case "Field":
            if( !i && n.scope && n.scope.isClass ){
                out += next + "this->" + n.name;
                next = "->";
                break;
            }
        default:
            if( isInEnum ){
                out = "&" + out;
                isInEnum = false;
            }

            out += next + n.name;
            next = "->";
            break;
        }
    });
    
    return out;
}

function writeExpression( expr ){
    let type = "void";
    let out = "", e;
    switch( expr.operation ){
    case "inline":
        if( expr.backend != "cpp" )
            break;
        out += expr.lines.join("\n");
        break;

    case "=":
        if( Array.isArray( expr.right ) ){
            e = writeExpression( expr.left );
            type = e.type;
            out += e.out;
            out += " " + expr.operation + " (new uc_Array<";
            out += writeType(type.type);
            out += ",";
            out += !type.getTarget().isNative;
            out += ">)->loadValues({";
            out += expr.right.map( e => writeExpression( e ).out ).join(",");
            out += "})";
            break;
        }

    case "+=":
    case "-=":
    case "/=":
    case "*=":
    case "%=":
    case "^=":
        e = writeExpression( expr.left );
        type = e.type;
        out += e.out;
        out += " " + expr.operation + " ";
        out += writeExpression( expr.right ).out;
        break;
/*
    case "unaryExpression":
        console.log("unary ", expr.left, expr.operation, expr.right );
        if( expr.left ) out += writeExpression( expr.left );
        out += expr.operation;
        if( expr.right ) out += writeExpression( expr.right );
        break;
*/
    case "referenceType":
        e = writePath(expr.left.type) + "::__id__";
        out += e.out;
        type = expr.left.type;
        break;

    case "methodInvocationSuffix":
        e = expr.args.map(a=>writeExpression(a));
        out += "( " + e.map(a=>a.out).join(", ")+" )";
        break;

    case "arrayAccessSuffix":
        out += "->access("+writeExpression(expr.right).out+")";
        type = null;
        break;

    case "resolve":
        out += writePath(expr);
        if( !expr.trail || !expr.trail.length ){
            console.log("Error: ", expr);
        }
        type = expr.trail[ expr.trail.length-1 ].type;
        break;

    case "access":
        e = writeExpression(expr.left);
        out += e.out;
        type = e.type;
        if( expr.right ){
            expr.right.forEach( e => {
                if( typeof e != "string" ){
                    // can be () or []
                    out += writeExpression(e).out;
                }else
                    out += `->${e}`;
            } );
        }
        break;

    case "literal":
        if( expr.literalType == "StringLiteral" ){
            out += `__str__(${expr.left})`;
            type = "String";
        }else if( expr.literalType == "Null" ){
            out += "nullptr";
            type = "Null";
        }else{
            if( expr.literalType == "integerLiteral" ){
                out += expr.left + "L";
                type = expr.literalType;
            }else{
                out += expr.left;
                type = expr.literalType;
            }
        }
        break;

    case "parenthesis":
        e = writeExpression(expr.left);
        out += "(" + e.out + ")";
        type = e.type;
        break;

    case "cast":
        e = writeExpression(expr.left);
        out += writeType(expr.type, true) + "(";
        if( expr.type.isReference ){
            out += "static_cast<";
            out += writeType(expr.type, false);
            out += ">(";
            out += e.out;
            out += ")";
        }else{
            out += e.out;
        }
        
        out += ")";
        type = expr.type;
        break;

    case "new":
        if( expr.left.isArray ){
            out += `new uc_Array<${writePath(expr.left)},${!expr.left.type.isNative}>{`;
            out += expr.array.map(a => writeExpression(a).out).join(", ");
            out += '}';
        }else{
            out += "(new " + writePath(expr.left);
        }
        type = expr.left.trail[expr.left.trail.length-1];
        if( !expr.array ){
            out+="(";
            if( expr.args ){
                out += expr
                    .args
                    .map( e => writeExpression(e).out )
                    .join(", ");
            }
            out+=")";
            out += ")";
        }

        if( expr.right ){
            expr.right.forEach( ex => {
                if( typeof ex == "string" ){
                    let trail = [];
                    let target = type.resolve( ex, trail );
                    if( !target ){
                        throw `Could not find ${ex} in ${type.name}`;
                    }
                    out += "." + ex;
                }else{
                    e = writeExpression( ex );
                    out += e.out;
                    type = e.type;
                }
            });
        }

        break;

    case "ternary": // to-do: check if left & right types match
        out += "(";
        out += writeExpression( expr.condition ).out;
        out += "?";
        out += writeExpression( expr.left ).out; 
        out += ":";
        e = writeExpression( expr.right );
        out += e.out;
        type = e.type;
        out += ")";
        break;

    default:
        switch( expr.name ){
        case "binaryExpression":
            // console.log("bin: ", expr);
            if( expr.left && expr.right ){
                if( expr.operation != "instanceof"){
                    let left = writeExpression( expr.left );
                    let right = writeExpression( expr.right );
                    if( expr.operation == "+" ){
                        out += '__add__('
                            + left.out
                            + ", "
                            + right.out
                            + ')';
                    }else if( expr.operation == ">>>" ){
                        out += "up_java::up_lang::uc_uint(" + left.out + ")";
                        out += ">>";
                        out += right.out;
                        type = new TypeRef(["uint", false, expr.scope]);
                    }else{
                        out += left.out;
                        out += expr.operation;
                        out += right.out;
                    }
                    type = left.type;
                }else{
                    out += `->__instanceof__(`;
                    e = writeExpression( expr.right );
                    out += e.out;
                    out += ")";
                    type = "boolean";
                }
                break;
            }

        case "unaryExpression":
            // console.log("un: ", expr);
            out += "(";
            if( expr.left ){
                e = writeExpression( expr.left );
                type = e.type;
                out += e.out;
            }
            out += expr.operation;
            if( expr.right ){
                e = writeExpression( expr.right );
                type = e.type;
                out += e.out;
            }
            out += ")";
            break;

        default:
            console.error("Unknown operation: " + expr.operation, expr);
            expr[0][0][0] = 1;
        }
        break;
    }
    return {out, type};
}

function writeStatement( stmt, block, noSemicolon ){
    let out = "";
    switch( stmt.type ){
    case "variableDeclarator":
        let local = block.locals.find( local => local.name == stmt.name );
        out += indent + writeType(local.type, true) + " ";
        if( stmt.expression ){
            out += writeExpression(stmt.expression).out;
        }else{
            out += local.name;
        }

        if( !noSemicolon )
            out += ";\n";
        
        break;
    case "emptyStatement":
        break;
    case "breakStatement":
        out += `${indent}break;\n`;
        break;
    case "continueStatement":
        out += `${indent}continue;\n`;
        break;
    case "switchStatement":
        out += indent + "switch( ";
        out += writeExpression(stmt.expression).out;
        out += " ){\n";
        stmt.cases.forEach( c => {
            if( c.value ){
                out += `${indent}case `;
                out += writeExpression(c.value).out;
            }else{
                out += `${indent}default`;
            }
            out += `:\n`;
            push();
            out += writeBlock(c.block);
            pop();
        });
        out += `${indent}}\n`;
        break;

    case "statementExpression":
        out += writeExpression(stmt.expression).out;
        break;

    case "expressionStatement":
        out += indent + writeExpression(stmt.expression).out + ";\n";
        break;

    case "returnStatement":
        if( stmt.expression )
            out += indent + "return " + writeExpression(stmt.expression).out + ";\n";
        else
            out += indent + "return;\n";

        break;
        
    case "ifStatement":
        out += indent + "if( " + writeExpression(stmt.condition).out + " )\n";
        if( stmt.body.type != "block" ){
            out += `${indent}{\n`;
            push();
        }
        out += writeStatement( stmt.body, block );
        if( stmt.body.type != "block" ){
            pop();
            out += `${indent}}\n`;
        }

        if( stmt.else ){
            out += `${indent}else\n`;
            if( stmt.else.type != "block" ){
                out += `${indent}{\n`;
                push();
            }
            out += writeStatement( stmt.else, block );
            if( stmt.else.type != "block" ){
                pop();
                out += `${indent}}\n`;
            }
        }

        break;

    case "whileStatement":
        out += indent + "while( ";
        out += writeExpression(stmt.condition).out;
        out += ")\n";
        if( stmt.body.type != "block" ){
            out += `${indent}{\n`;
            push();
        }
        out += writeStatement( stmt.body, block );
        if( stmt.body.type != "block" ){
            pop();
            out += `${indent}}\n`;
        }

        break;

    case "enhancedForStatement":
        throw "I ain't ready yet";
        break;

    case "forStatement":
        out += indent + "for( ";
        if( stmt.init )
            out += stmt.init.map( init => writeStatement(init, stmt.scope, true).trim() ).join(", ");
        out += ";";

        out += " " + (stmt.condition?writeExpression(stmt.condition).out:"");

        out += "; ";
        out += stmt.update.map(x=>writeExpression(x).out).join(",");
        out += ")\n";

        if( stmt.body.type != "block" ){
            out += `${indent}{\n`;
            push();
        }
        out += writeStatement( stmt.body, block );
        if( stmt.body.type != "block" ){
            pop();
            out += `${indent}}\n`;
        }
        
        break;

    case "block":
        out += `${indent}{\n`;
        push();
        out += writeBlock( stmt.block );
        pop();
        out += `${indent}}\n`;
        break;

    default:
        console.error("Unknown statement type: " + stmt.type );
        break;
    }
    return out;
}

function writeRawData( data ){
    let out = "static const uint8_t d[] = {\n";
    for( let i=0; i<data.length; ++i ){
        out += `0x` + data[i].toString(16) + ",";
    }
    out += "\n};\nreturn d;\n";
    return out;
}

function writePalette( colors ){
    let out = "";
    out += `${indent}static const uint16_t colors[] = {${colors.join(",")}};\n`;
    out += `${indent}uint16_t *palette = &screen->palette->access(0);\n`;
    out += `${indent}for( uint32_t i=0; i<${colors.length}; ++i )\n`;
    out += `${indent}	palette[i] = colors[i];\n`;
    return out;
}

function writeBlock( block ){
    let out = "";

    if( !block )
        return out;

    if( block.statements )
        block.statements.forEach( stmt => {
            out += writeStatement( stmt, block );
        });

    if( block.sprite )
        out += require("./cppSprite.js")( block );

    if( block.colors16 )
        out += writePalette( block.colors16 );

    if( block.rawData ){
        out += writeRawData( block.rawData );
    }
//    if( block.colors32 )
//        out += writeColors( block.colors32 );

    return out;
}

function writeClassImpl( unit ){
    let out = openNamespace( unit, "Implementations" );
    
    unit.types.forEach( t => writeTypes(t) );
    
    out += closeNamespace( unit );
    return out;

    function writeTypes( t ){
        if( t.cppType == "enum class" ){
            out += `${indent}// ${t.name} enum values\n`;
            t.constantList.forEach( c => {
                out += `${indent}ue_${t.name} ue_${t.name}::${c.name};\n`;
            });            
        }

        if( t.cppType != "class" || t.isInterface || t.isNative )
            return;

        if( !t.implements.find(i=>i.name == "__stub_only__") ){
            let isStub = t.implements.find(i=>i.name == "__stub__");

            out += `${indent}// ${t.name} static fields\n`;

            t.fields.forEach( field => {
                if( !field.isStatic ) 
                    return;
                out += `${indent}`;
                if( field.isFinal )
                    out += "const ";
                out += `${writeType(field.type, true)} ${writeType(t)}::`;
                if( field.init )
                    out += writeExpression(field.init.expression).out;
                else
                    out += field.name;
                out += ';\n';
            });

            out += `${indent}// ${t.name} methods\n`;

            t.methods.forEach( method => {
                if( method.isAbstract )
                    return;

                if( isStub && !method.body ){
                    let stubPath = "";
                    try{
                        stubPath = writePath(method, true).replace(/::/g, "/");
                        stubPath = `${platformDir}/${stubPath}.cpp`;
                        let stub = fs.readFileSync(stubPath, 'utf-8');
                        out += writeMethodSignature( method, false, t.name );
                        out += `{\n`;
                        push();
                        out += stub.trim()
                            .split("\n")
                            .map( n=>indent+n )
                            .join("\n");
                        pop();
                        out += `\n${indent}}\n`;                    
                    }catch( ex ){
                        out += `${indent}// stub ${t.name}::${method.name} (${stubPath}\n`;
                    }
                    return;
                }

                out += writeMethodSignature( method, false, t.name );

                if( method.isConstructor){
                    let inits = [];

                    if( t.extends ){
                        inits.push(
                            writePath(t.extends)
                                + "("
                                + method
                                .superArgs
                                .map( arg=>writeExpression(arg).out )
                                .join(", ")
                                + ")"
                        );
                    }

                    t.fields.forEach( f=>{
                        if( f.isStatic )
                            return;
                        
                        let str = f.name + "(";
                        if( f.init && f.init.expression ){
                            str += writeExpression(f.init.expression.right).out;
                        }else if(f.isReference){
                            str += "nullptr";
                        }else{
                            str += "0";
                        }
                        str += ")";
                        inits.push( str );
                    });

                    if( inits.length ){
                        out += " : ";
                        out += inits.join(", ");
                    }
                }

                out += `{\n`;
                push();

                if( !method.isStatic )
                    out += `${indent}__ref__<${writePath(t)}> __ref__${refid++} = this;\n`;

                out += writeBlock( method.body );
                
                pop();
                out += `${indent}}\n\n`;

            });
        }

        if( !t.extends || t.extends.name[0] != "__raw__" ){
        // out += `${indent}const uint32_t ${t.name}::__id__ = ${t.id};\n`;
            out += `${indent}bool uc_${t.name}::__instanceof__( uint32_t id ){
${indent}\tif(id == ${t.id}) return true;
${indent}\treturn ${t.extends&&t.extends.name[0]!="__raw__"?writePath(t.extends)+"::__instanceof__(id)":"false"};
${indent}}
`;
            if( t.fields.length ){
                out += `${indent}void uc_${t.name}::__mark__(){\n`;
                push();
                out += `${indent}if(__is_marked__()) return;\n`;
                if( t.extends ){
                    out += `${indent}${writePath(t.extends)}::__mark__();\n`;
                }else{
                    out += `${indent}uc_Object::__mark__();\n`;
                }

                t.fields.forEach( field => {
                    if( field.isStatic )
                        return;

                    if( field.type.isArray || field.type.isReference ) {
                        out += `${indent}if( ${field.name} ) `;
                        out += `${field.name}->__mark__();\n`;
                    }
                });

                pop();
                out += `${indent}}\n`;

            }
        }
        
        if( t.types.length ){
            out += `\n${indent}namespace un_${t.name} {\n`;
            push();
            t.types.forEach( t=>writeTypes(t) );
            pop();
            out += `${indent}}\n`;
        }
    }
}

function addUnit( unit ){
    if( units[ unit.id ] )
        return;

    units[unit.id] = {
        unit,
        headers:null,
        forwardDecl:null,
        classDecl:null,
        classImpl:null
    };

}

function write( unit, main, plat ){

    units = {};

    platform = (plat||"desktop").toLowerCase();
    platformDir = __dirname + "/" + platform;

    addUnit(unit);

    let pending;
    do{
        pending = false;
        for( let key in units ){
            let dependency = units[key];
            if( dependency.classImpl )
                continue;
            pending = true;
            writeDependency( dependency );
        }
    }while(pending);

    let out = fs.readFileSync( platformDir+"/begin.cpp", "utf-8" );

    let list = Object.values(units).reverse();
    for( let dependency of list )
        out += dependency.forwardDecl;
    for( let dependency of list )
        out += dependency.classDecl;
    for( let dependency of list )
        out += dependency.classImpl;

    let trail = [];
    let pathToMain = writePath({
        getTarget(){
            return unit.resolve(main, trail);
        },
        trail
    });

    let end = fs.readFileSync( platformDir+"/end.cpp", "utf-8" );
    end = end.replace(/\$MAINCLASS\$/, pathToMain);
    out += end;
    return out;

}

function writeDependency( dep ){

    if( dep.forwardDecl )
        return;

    dep.forwardDecl = writeForwardDecl( dep.unit );

    dep.classDecl = writeClassDecl( dep.unit );

    dep.classImpl = writeClassImpl( dep.unit );

}

module.exports = { write };
