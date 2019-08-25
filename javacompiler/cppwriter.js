let fs = require("fs");
const {TypeRef} = require("./TypeRef.js");
const {StdError} = require("./StdError.js");

let platform, platformDir, annotationHandlers;

let indent, units, isDebugMode;

let currentFile;

let VOID, UINT, INT, FLOAT,
    NULL, BOOLEAN, STRING, SHORT,
    CHAR, BYTE, POINTER, DOUBLE,
    UBYTE, LONG;

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
        if( t.isAnnotation ){
            let name = writePath(t).replace(/::/g, ".");
            if( annotationHandlers[name] && annotationHandlers[name].forwardDecl ){
                out += annotationHandlers[name].forwardDecl(t) || "";
            }
            return;
        }

        if( t.cppType == "enum class" ){
            out += `${indent}class ue_${t.name}{\n`;
            out += `${indent}\tue_${t.name}(std::uint32_t o) : __ordinal__(o){}\n`;
            out += `${indent}\n${indent}public:\n`;
            out += `${indent}\tconst std::uint32_t __ordinal__;\n`;
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
    if( type.getTarget && !type.isArray )
        type = type.getTarget();
    
    if( type.isArray ){
        let isObject = !type.getTarget().isNative;
        finalType = `::uc_Array<${writePath(type)},${isObject}>`;
        if( local )
            finalType = `__ref__<${finalType}>`;
        else
            finalType += "*";
    }else if( type.isEnum ){
        finalType = writePath(type) + "*";
    }else if( (type.isReference || type.isClass || type.isInterface) && !type.isNative )
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
        out += `${sep}${writeType(param.type, false)} ${param.name}`;
        sep = ", ";
    });
            
    out += ')';

    if( method.isAbstract )
        out += " = 0";

    return out;
}

function getTypeList(){
    let unitList = Object.values(units)
        .map(k=>k.unit)
        .reverse();
    
    let typeList = [];
    
    for( let i=0; i<unitList.length; ++i ){
        let unit = unitList[i];
        for( let t=0; t<unit.types.length; ++t ){
            let type = unit.types[t];
            let dependencies = getTypeDependencies(type)
                .map( d => d.getTarget() );
            
            typeList.push({
                type,
                unit,
                dependencies
            });
        }
    }

    return typeList;

    function getTypeDependencies( t ){
        let ret = [];
        if( t.cppType != "class" )
            return [];

        if( t.implements ){
            ret.push( ...t.implements );
        }
        
        if( t.extends ){
            ret.push( t.extends );
        }

        ret = ret.filter( f => !(
            f.name.length == 1 && (
                f.name[0] == "__raw__"
                    || f.name[0] == "__stub__"
                    || f.name[0] == "__stub_only__"
            )
        ));

        return ret;
    }
}

function sortTypes( typeList ){

    let hadShuffle;
    do{
        hadShuffle = false;
        for( let i=0; i<typeList.length; ++i ){
            let obj = typeList[i];
            for( let j=0; j<obj.dependencies.length; ++j ){
                let target = obj.dependencies[j];
                for( let k=i+1; k<typeList.length; ++k ){
                    let candidate = typeList[k];
                    if( candidate.type != target )
                        continue;
                    typeList.splice(k, 1);
                    typeList.splice(i, 0, candidate);
                    hadShuffle = true;
                    ++i;
                    break;
                }
            }
        }
    }while( hadShuffle );

    return typeList;    
}

function writeClassInline( type ){
    let out = `class uc_${type.name} : public ${writePath(type.extends)} {`;
    out += "public:\n";

    let base = type.extends.getTarget();
    base.methods.forEach( method => {
        if( !method.isConstructor )
            return;
        out += `${indent}uc_${type.name}(`;
        let sep = '', nameList = '';
        method.parameters.forEach( param => {
            nameList += `${sep} ${param.name}`;
            out += `${sep}${writeType(param.type, false)} ${param.name}`;
            sep = ", ";
        });
        out += `) : ${writePath(type.extends)}( ${nameList} ){}\n`;
    });
    
    type.fields.forEach( field => {
        out += `${indent}${writeFieldDecl(field)}`;
        if( field.init && field.init.expression )
            out += writeExpression(field.init.expression).out;
        out += ";\n";
    });

    type.methods.forEach( method => {
        out += writeMethodSignature( method, true );
        out += writeMethodBody(method, type);
        out += "\n";
    });    
    
    out += `};`;
    return out;
}

function writeFieldDecl(field) {
    let out = "";
    let type = field.type;
    if( type.name == "var" && field.init && field.init.expression ){
        let e = writeExpression(field.init.expression);
        type = field.type = e.type;
    }
    
    if( type.getTarget )
        type = type.getTarget();
    
    if( field.isVolatile ) out += "volatile ";
    if( field.isStatic ) out += "static ";
    if( field.isFinal && type.isNative ) out += "const ";
    out += writeType(field.type, field.isStatic);
    out += " ";
    if( field.isFinal && !type.isNative ) out += "const ";
    out += field.name;
    out += `;\n`;
    return out;
}


function writeClassDecl( unit, type, dependencies ){
    let written = {"Object":true};
    let out = openNamespace( unit, "Class Declarations" );
    out += "// Deps: " + dependencies.map(d=>d.name).join(" ") + "\n";
    writeTypes( type );
    out += closeNamespace( unit );
    return out;

    function writeTypes( t ){
        if( t.cppType != "class" )
            return;
        if( t.isAnnotation ){
            let name = writePath(t).replace(/::/g, ".");
            if( annotationHandlers[name] && annotationHandlers[name].decl ){
                out += annotationHandlers[name].decl(t) || "";
            }
            return;
        }

        if( t.implements.find( i => i.name.length == 1 && i.name[0] == "__stub_only__" ) )
            return;

        let sep = ', ';
        out += `${indent}class uc_${t.name} `;
        if( !t.isInterface ){
            if( !t.extends || t.extends.name[0] != "__raw__" ){
                out += ': public ';
                let base = t.extends ? writePath(t.extends) : "up_java::up_lang::uc_Object";
                out += base;
            }

            t.implements.forEach( impl =>{
                if( impl.name.length == 1 && impl.name[0] == "__stub__" )
                    return;
                out += `${sep}public virtual ${writePath(impl)}`;
                sep = ', ';
            });
        }

        out += ` {\n${indent}public:\n`;
        push();

        t.fields.forEach( field => {
            out += `${indent}${writeFieldDecl(field)}\n`;
        });

        if( !t.isInterface ){
            t.implements.forEach( impl =>{
                if( impl.name.length == 1 && impl.name[0] == "__stub__" )
                    return;
                
                let interface = impl.getTarget();
                interface.methods.forEach( method => {
                    if( method.isStatic )
                        return;
                    
                    let trail = [];
                    let impl = t.resolve( [method.name], trail, x=>x.isMethod );
                    if( impl && impl.scope != t ){
                        out += writeMethodSignature(
                            Object.assign({}, method, {isAbstract:false}),
                            false
                        );
                        out += `{`;
                        if( writeType(method.result) != "void" ){
                            out += "return ";
                        }
                        out += `${writePath(impl.scope)}::${method.name}(`;
                        let sep = ' ';
                        method.parameters.forEach( param => {
                            out += `${sep}${param.name}`;
                            sep = ", ";
                        });
                        out += ' ); }\n';
                    }
                });
            });
        }

        t.methods.forEach( method => {
            out += writeMethodSignature( method, true );
            out += ";\n";
        });

        if( t.isInterface ){
            out += `${indent}virtual bool __instanceof__( uint32_t id );\n`;
            out += `${indent}virtual ~uc_${t.name}(){}\n`;
            out += `${indent}virtual void __hold__() = 0;\n`;
            out += `${indent}virtual void __release__() = 0;\n`;
            out += `${indent}virtual void __mark__(int m) = 0;\n`;
        }else if( !t.extends || t.extends.name[0] != "__raw__" ){
            out += `${indent}virtual void __mark__(int m);\n`;
            out += `${indent}static const uint32_t __id__ = ${t.id};\n`;
            out += `${indent}virtual uint32_t __sizeof__();\n`;
            out += `${indent}virtual bool __instanceof__( uint32_t id );\n`;
            out += `${indent}virtual ~uc_${t.name}(){}\n`;
            if( writePath(t) != "up_java::up_lang::uc_Object" ){
                out += `${indent}void __hold__();\n`;
                out += `${indent}void __release__();\n`;
            }
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

function writeMethodBody( method, t ){
    var out = "";
    
    if( method.isConstructor){
        let inits = [];

        if( t.extends && t.extends.name[0] != "__raw__" ){
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

        t.fields.forEach( field=>{
            if( field.isStatic )
                return;
            
            let str = field.name + "(";
            if( field.init && field.init.expression ){
                let e = writeExpression(field.init.expression.right, field.type);
                str += e.out;
                if( !isAssignableType( field.type, e.type ) ){
                    StdError.throwError( field.init.expression.right.location, `Can't initialize ${field.name} with type ${e.type.name}.`);
                }
            }else if(field.isReference){
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
/*
    if( !method.isStatic )
        out += `${indent}__ref__<${writePath(t, false, method)}> __ref__${refid++} = this;\n`;
//*/
    out += writeBlock( method.body );
    
    pop();
    out += `${indent}}\n\n`;

    return out;
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
        while( e && e.name ){
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
            if( tmp.length ) next = "::";
            else next = "";
            break;

        case "Clazz":
            if( i==0 && expr.name == "this" ){
                out += next + "this";
                next = "->";
            }else if( i==0 && expr.name == "super" ){
                out += next + trail.name;
                next = "::";
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
            out += next + n.name;
            next = "->";
            break;

        case "EnumConstant":
            out = "&" + out;
            out += next + n.name;
            next = "->";
            break;
            
        default:
            out += next + n.name;
            next = "->";
            break;
        }
    });
    
    return out;
}

function isImplicitCast( left, right ){
    if( left && left.getTarget ) left = left.getTarget();
    if( right && right.getTarget ) right = right.getTarget();

    if( left && right && left != right && left.isClass && right.isClass && !left.isNative && !right.isNative ){
        return right.isOfType(left);
    }

    return true;
}

function getReturnType( {methodName, method}, args, location ){
    let candidates = [];
    let acc = [];
    let scope = method.scope;
    while(scope){

        candidates.push(
            ...scope.methods.filter(
                m=>{
                    acc.push( m.name + m.parameters.length );
                    return m.name == methodName &&
                        m.parameters.length == args.length;
                }
            )
        );
        
        scope = scope.extends && scope.extends.getTarget();
    }

    if( !candidates.length ){
        StdError.throwError(location, "Could not find matching " + methodName + " inside " + method.scope.name);
    }
    
    return candidates[0].result;
}

function access( exprList, prevResult ){
    if( !exprList )
        return null;
    
    let out = "";
    let type = prevResult.type;
    
    exprList.forEach( (e, index) => {
        let next = exprList[index+1];
        
        if( e.operation == "methodInvocationSuffix" ){
            e = writeExpression(e);
            out += e.out;
            let argTypes = e.type;
            if( !prevResult.method ){
                type = VOID;
                // throw new Error(out + " is not a method");
            }else{
                type = getReturnType(prevResult, argTypes, e.location);
            }
            prevResult = e;
        }else if( e.operation == "arrayAccessSuffix" ){
            e = prevResult = writeExpression(e, type.getTarget() );
            out += e.out;
            if( type.getTarget() == STRING.type )
                type = CHAR;
            else
                type = e.type;
        }else{
            out += `->${e}`;
            if( type ){
                if( type.isTypeRef )
                    type = type.getTarget();
                let trail = [];
                let test = _=>true;
                if( next && next.operation == "methodInvocationSuffix" )
                    test = x=>x.isMethod;
                let field = type.resolve([e], trail, test);
                if( !field ){
                    StdError.throwError(e.location, `Could not find ${e} in ${type.constructor.name} ${type.name}`);
                }
                type = field.type;

                if( field.isMethod ){
                    prevResult = {
                        op:"->",
                        methodName:e,
                        methodScope:trail[trail.length-2],
                        method:field
                    };
                }
            }
            
        }
    } );

    return {out, type};
}

function isCompatibleType( left, right, cast ){
    const srcLeft = left, srcRight = right;    
    if( left && left.getTarget ) left = left.getTarget();
    if( right && right.getTarget ) right = right.getTarget();

    if( left == right )
        return left;

    function ref(t){
        if( srcLeft && t == srcLeft.type )
            return srcLeft;
        if( srcRight && t == srcRight.type )
            return srcRight;
        throw Object.keys(t);
    }

    if( left == INT.type && right == CHAR.type ) return left;
    else if( right == INT.type && left == CHAR.type ) return right;
    else if( left == INT.type && right == BYTE.type ) return left;
    else if( right == INT.type && left == BYTE.type ) return right;
    else if( left == INT.type && right == UBYTE.type ) return left;
    else if( right == INT.type && left == UBYTE.type ) return right;
    else if( left == INT.type && right == SHORT.type ) return left;
    else if( right == INT.type && left == SHORT.type ) return right;

    else if( left == UINT.type && right == CHAR.type ) return left;
    else if( right == UINT.type && left == CHAR.type ) return right;
    else if( left == UINT.type && right == BYTE.type ) return left;
    else if( right == UINT.type && left == BYTE.type ) return right;
    else if( left == UINT.type && right == UBYTE.type ) return left;
    else if( right == UINT.type && left == UBYTE.type ) return right;
    else if( left == UINT.type && right == SHORT.type ) return left;
    else if( right == UINT.type && left == SHORT.type ) return right;

    else if( left == LONG.type && right == CHAR.type ) return left;
    else if( right == LONG.type && left == CHAR.type ) return right;
    else if( left == LONG.type && right == BYTE.type ) return left;
    else if( right == LONG.type && left == BYTE.type ) return right;
    else if( left == LONG.type && right == UBYTE.type ) return left;
    else if( right == LONG.type && left == UBYTE.type ) return right;
    else if( left == LONG.type && right == SHORT.type ) return left;
    else if( right == LONG.type && left == SHORT.type ) return right;
    else if( left == LONG.type && right == UINT.type ) return left;
    else if( right == LONG.type && left == UINT.type ) return right;
    else if( left == LONG.type && right == INT.type ) return left;
    else if( right == LONG.type && left == INT.type ) return right;

    else if( left == SHORT.type && right == CHAR.type ) return left;
    else if( right == SHORT.type && left == CHAR.type ) return right;
    else if( left == SHORT.type && right == BYTE.type ) return left;
    else if( right == SHORT.type && left == BYTE.type ) return right;
    else if( left == SHORT.type && right == UBYTE.type ) return left;
    else if( right == SHORT.type && left == UBYTE.type ) return right;

    else if( left == FLOAT.type && right == CHAR.type ) return left;
    else if( right == FLOAT.type && left == CHAR.type ) return right;
    else if( left == FLOAT.type && right == BYTE.type ) return left;
    else if( right == FLOAT.type && left == BYTE.type ) return right;
    else if( left == FLOAT.type && right == UBYTE.type ) return left;
    else if( right == FLOAT.type && left == UBYTE.type ) return right;
    else if( left == FLOAT.type && right == SHORT.type ) return left;
    else if( right == FLOAT.type && left == SHORT.type ) return right;
    else if( left == FLOAT.type && right == INT.type ) return left;
    else if( right == FLOAT.type && left == INT.type ) return right;
    else if( left == FLOAT.type && right == UINT.type ) return left;
    else if( right == FLOAT.type && left == UINT.type ) return right;
    else if( left == FLOAT.type && right == LONG.type ) return left;
    else if( right == FLOAT.type && left == LONG.type ) return right;

    else if( left == DOUBLE.type && right == CHAR.type ) return left;
    else if( right == DOUBLE.type && left == CHAR.type ) return right;
    else if( left == DOUBLE.type && right == BYTE.type ) return left;
    else if( right == DOUBLE.type && left == BYTE.type ) return right;
    else if( left == DOUBLE.type && right == UBYTE.type ) return left;
    else if( right == DOUBLE.type && left == UBYTE.type ) return right;
    else if( left == DOUBLE.type && right == SHORT.type ) return left;
    else if( right == DOUBLE.type && left == SHORT.type ) return right;
    else if( left == DOUBLE.type && right == INT.type ) return left;
    else if( right == DOUBLE.type && left == INT.type ) return right;
    else if( left == DOUBLE.type && right == UINT.type ) return left;
    else if( right == DOUBLE.type && left == UINT.type ) return right;
    else if( left == DOUBLE.type && right == LONG.type ) return left;
    else if( right == DOUBLE.type && left == LONG.type ) return right;

    return false;
}

function isAssignableType( left, right ){
    const srcLeft = left, srcRight = right;
    
    if( left && left.getTarget ) left = left.getTarget();
    if( right && right.getTarget ) right = right.getTarget();

    if( left == right ) return true;

    if( !left.isNative && right == NULL.type ) return true;
    if( right.isOfType(left) ) return true;
    if( isCompatibleType(left, right) ) return true;
    
    const riskyint = [
        [POINTER.type, NULL.type],
        [INT.type, LONG.type],
        [LONG.type, INT.type],
        [INT.type, UINT.type],
        [UINT.type, INT.type],
        [INT.type, UBYTE.type],
        [UINT.type, UBYTE.type],
        [INT.type, BYTE.type],
        [UINT.type, BYTE.type],
        [UBYTE.type, INT.type],
        [UBYTE.type, UINT.type],
        [BYTE.type, INT.type],
        [BYTE.type, UINT.type],
        [FLOAT.type, DOUBLE.type],
        [DOUBLE.type, FLOAT.type],
    ];

    return !!riskyint.find(([l, r])=>left==l && right==r);
}

function getOperatorType( left, op, right, expr ){
    const srcLeft = left, srcRight = right;
    
    if( left && left.getTarget ) left = left.getTarget();
    if( right && right.getTarget ) right = right.getTarget();

    function ref(t){
        if( srcLeft && t == srcLeft.type )
            return srcLeft;
        if( srcRight && t == srcRight.type )
            return srcRight;
        throw Object.keys(t);
    }

    const opType = {
        "&&":1,
        "||":1,
        "?":2,
        "=":2,
        "==":3,
        "!=":3,
        ">":4,
        ">=":4,
        "<":4,
        "<=":4,
        "*":5,
        "/":5,
        "-":5,
        "+":5,
        "|":5,
        "&":5,
        "^":5,
        ">>":5,
        "<<":5,
        "%":5
    }[op];

    if( op == "=" && isAssignableType(left, right) ){
        return ref(left);
    }

    if( left && right && left != right && left.isClass && right.isClass && !left.isNative && !right.isNative ){
        if( opType == 3 && (right.isOfType(left) || left.isOfType(right))){
            return BOOLEAN;
        }
    }

    if( opType >= 3 ){
        let dominant = isCompatibleType(left, right, false);
        if( dominant )
            left = right = dominant;
    }

    if( left && left == right ){

        if( left.isNative || opType == 3 ){
            if( opType == 1 || opType == 3 || opType == 4 )
                return BOOLEAN;
            return ref(left);
        }

        if( opType == 2 || opType == 3 )
            return ref(left);
    }

    if( opType == 2 ){
        if( left == NULL.type && (!right.isNative || right == POINTER.type) ) return ref(right);
        if( right == NULL.type && (!left.isNative || left == POINTER.type) ) return ref(left);
    }else if( opType == 3 ){
        if( left == NULL.type && (!right.isNative || right == POINTER.type) ) return BOOLEAN;
        if( right == NULL.type && (!left.isNative || left == POINTER.type) ) return BOOLEAN;
    }

    const inc = [
        [POINTER.type, null, POINTER],
        [null, POINTER.type, POINTER],
        [INT.type, null, INT],
        [null, INT.type, INT],
        [UINT.type, null, UINT],
        [null, UINT.type, UINT],
        [SHORT.type, null, SHORT],
        [null, SHORT.type, SHORT],
        [BYTE.type, null, BYTE],
        [null, BYTE.type, BYTE],
        [UBYTE.type, null, UBYTE],
        [null, UBYTE.type, UBYTE],
        [FLOAT.type, null, FLOAT],
        [null, FLOAT.type, FLOAT],
        [DOUBLE.type, null, DOUBLE],
        [null, DOUBLE.type, DOUBLE],
    ];

    const eqneq = [
        [INT.type, UINT.type, BOOLEAN],
        [UINT.type, INT.type, BOOLEAN],
        [INT.type, BYTE.type, BOOLEAN],
        [BYTE.type, INT.type, BOOLEAN],
        [UBYTE.type, BYTE.type, BOOLEAN],
        [BYTE.type, UBYTE.type, BOOLEAN],
        [SHORT.type, BYTE.type, BOOLEAN],
        [BYTE.type, SHORT.type, BOOLEAN],
        [SHORT.type, INT.type, BOOLEAN],
        [INT.type, SHORT.type, BOOLEAN],
    ];

    const shift = [
        [LONG.type, INT.type, LONG],
        [UINT.type, INT.type, UINT],
        [SHORT.type, INT.type, SHORT],
        [BYTE.type, INT.type, BYTE],
        [UBYTE.type, INT.type, UBYTE],
    ];

    const ptrmath = [
        [INT.type, POINTER.type, POINTER],
        [POINTER.type, INT.type, POINTER],
        [UINT.type, POINTER.type, POINTER],
        [POINTER.type, UINT.type, POINTER],
        [SHORT.type, POINTER.type, POINTER],
        [POINTER.type, SHORT.type, POINTER],
        [BYTE.type, POINTER.type, POINTER],
        [POINTER.type, BYTE.type, POINTER],
    ];

    const floatmix = [
        [FLOAT.type, INT.type, FLOAT],
        [DOUBLE.type, INT.type, DOUBLE],
        [FLOAT.type, UINT.type, FLOAT],
        [DOUBLE.type, UINT.type, DOUBLE],
        [FLOAT.type, BYTE.type, FLOAT],
        [DOUBLE.type, BYTE.type, DOUBLE],
        [FLOAT.type, SHORT.type, FLOAT],
        [DOUBLE.type, SHORT.type, DOUBLE],
        [FLOAT.type, LONG.type, FLOAT],
        [DOUBLE.type, LONG.type, DOUBLE],
    ];

    const riskyint = [
        [INT.type, LONG.type, LONG],
        [LONG.type, INT.type, LONG],
        [INT.type, UINT.type, INT],
        [UINT.type, INT.type, UINT],
        [INT.type, UBYTE.type, INT],
        [UINT.type, UBYTE.type, UINT],
        [INT.type, BYTE.type, INT],
        [UINT.type, BYTE.type, UINT],
        [UBYTE.type, INT.type, INT],
        [UBYTE.type, UINT.type, UINT],
        [BYTE.type, INT.type, INT],
        [BYTE.type, UINT.type, UINT],
    ];

    let typeMatrix = {
        "+":[
            [STRING.type, STRING.type, STRING],
            [INT.type, STRING.type, STRING],
            [STRING.type, INT.type, STRING],
            [BOOLEAN.type, STRING.type, STRING],
            [STRING.type, BOOLEAN.type, STRING],
            [FLOAT.type, STRING.type, STRING],
            [STRING.type, FLOAT.type, STRING],
            [LONG.type, STRING.type, STRING],
            [STRING.type, LONG.type, STRING],
            [BYTE.type, STRING.type, STRING],
            [STRING.type, BYTE.type, STRING],
            [CHAR.type, STRING.type, STRING],
            [STRING.type, CHAR.type, STRING],
            ...ptrmath,
            [UINT.type, INT.type, UINT],
            [INT.type, UINT.type, UINT],
            [null, INT.type, INT],
            [null, FLOAT.type, FLOAT],
            [null, BYTE.type, BYTE],
            [null, UBYTE.type, UBYTE],
        ],

        "-":[
            [null, LONG.type, LONG],
            [null, INT.type, INT],
            [null, UINT.type, UINT],
            [null, FLOAT.type, FLOAT],
            [null, DOUBLE.type, DOUBLE],
            [null, BYTE.type, BYTE],
            [null, UBYTE.type, UBYTE],
            [null, SHORT.type, SHORT],
        ],

        "~":[
            [null, LONG.type, LONG],
            [null, INT.type, INT],
            [null, UINT.type, UINT],
            [null, BYTE.type, BYTE],
            [null, UBYTE.type, UBYTE],
            [null, SHORT.type, SHORT],
        ],

        "=":[
            ...riskyint,
            ...floatmix
        ],

        "==":eqneq,
        "!=":eqneq,

        ">>=":shift,
        "<<=":shift,
        ">>":shift,
        "<<":shift,
        "|=":shift,
        "&=":shift,
        "|":shift,
        "&":shift,

        "++":inc,
        "--":inc,

        "+=":[
            ...riskyint,
            ...ptrmath,
            ...floatmix
        ],
        "-=":[
            ...riskyint,
            ...ptrmath,
            ...floatmix
        ],
        "*=":[
            ...riskyint,
            ...floatmix
        ],
        "/=":[
            ...riskyint,
            ...floatmix
        ],

        "!":[[null, BOOLEAN.type, BOOLEAN]],

        "?":[]
    }[op] || [];

    for( let [mLeft, mRight, mResult] of typeMatrix ){
        if( mLeft == left && mRight == right )
            return mResult;
    }

    let sLeft = (left && left.name) || null;
    let sRight = (right && right.name) || null;

    if( Array.isArray(sLeft) ) sLeft = sLeft.join(".");
    if( Array.isArray(sRight) ) sRight = sRight.join(".");

    let location = expr && expr.location;
    
    while(!location){
        expr = expr.scope;
        if( !expr )
            break;
    }

    let msg = `Can't use operator ${op} `;
    
    if( sLeft && sRight ){
        msg += `on "${sLeft}" and "${sRight}"`;
    }else if (sLeft){
        msg += `after "${sLeft}"`;
    }else{
        msg += `before "${sRight}"`;
    }

    StdError.throwError(location, msg);
}

function writeExpression( expr, typeHint ){
    let retdata = { op:expr.operation };
    let type = VOID;
    let out = "", e;
    switch( expr.operation ){
    case "inline":
        if( expr.backend == "cpp" )
            out += expr.lines.join("\n");
        else if( expr.backend == "asm" ){
            out += "asm volatile(\".syntax unified\\n\"\n";
            let operands = {input:[], output:[], clobber:[]};
            (expr.lines.join("\n").split("\n")).forEach(line=>{
                line = line.trim();
                if( !line )
                    return;
                
                if( line[0] != '@' ){
                    out += `${indent}"${line.replace(/@([a-zA-Z_0-9]+)/, '%[$1]')}	\\n"\n`;
                    return;
                }
                
                let match = line.match(/^@([a-z]+)\s+([^:\s]+)(?::(.+))?/);
                if( !match || !operands[match[1]]){
                    StdError.throwError(expr.location, "Invalid asm preprocessor directive: " + line);
                }

                operands[match[1]].push({
                    name:match[2],
                    constraint:match[3] || "+h"
                });
            });

            out += indent + ":\n";
            out += operands.output.map(l=>`${indent}[${l.name}] "${l.constraint}" (${l.name})`).join(",\n");

            out += indent + ":\n";
            out += operands.input.map(l=>`${indent}[${l.name}] "${l.constraint}" (${l.name})`).join(",\n");

            out += indent + ":\n";
            out += operands.clobber.map(l=>`${indent}"${l.name}"`).join(",\n");
            out += ")";
        }
        break;

    case "=":
    case "+=":
    case "-=":
    case "/=":
    case "*=":
    case "%=":
    case "^=":
        e = writeExpression( expr.left );
        if( e.isFinal ){
            StdError.throwError(expr.location, `Can't alter final "${e.out}"`);
        }

        type = e.type;
        out += e.out;
        if( expr.right ){
            e = writeExpression( expr.right );
            type = getOperatorType(type, expr.operation, e.type, expr );
            out += " " + expr.operation + " ";
            out += e.out;
        }
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
        type = e.map(a=>a.type);
        break;

    case "arrayAccessSuffix":
        e = writeExpression(expr.right);
        if( !isAssignableType(INT, e.type) )
            StdError.throwError(expr.location, `Can't use ${e.type.name} as array index.`);

        if( expr.isLValue ){
            out += "->arrayWrite(";
            out += e.out;
            out += ", ";
            e = writeExpression(expr.isLValue);
            out += e.out;
            type = e.type;
            if( !isAssignableType(typeHint, type) ){
                StdError.throwError(expr.location, `Can't put ${type.name} in an array of ${typeHint.name}.`);
            }
        }else{
            out += "->arrayRead(";
            out += e.out;
            if( !typeHint.isTypeRef )
                type = new TypeRef(null, false, expr.right.scope, typeHint);
        }
        out += ")";
        break;
        
    case "resolve":
        let p = writePath(expr);
        out += p;
        if( !expr.trail || !expr.trail.length ){
            console.log("Error: ", expr);
        }
        type = expr.trail[ expr.trail.length-1 ];
        if( type.type ){ // field
            retdata.isFinal = type.isFinal;
            type = type.type;
        }else if( type.isMethod ){
            retdata.methodName = type.name;
            retdata.methodScope = type.scope;
            retdata.method = type;
            type = null;
        }else if( type.isType )
            type = new TypeRef(
                null,
                false,
                expr.scope,
                type
            );
        break;

    case "access":
        e = writeExpression(expr.left);
        if( !expr.right )
            retdata.isFinal = e.isFinal;
        out += e.out;
        type = e.type;
        e = access(expr.right, e);
        if( e ){
            out += e.out;
            type = e.type;
        }
        break;

    case "literal":
        
        switch( expr.literalType ){
        case "StringLiteral":
            out += `__str__(${expr.left})`;
            type = STRING;
            e = access( expr.right, {type});
            if( e ){
                out += e.out;
                type = e.type;
            }
            break;
            
        case "Null":
            out += "nullptr";
            type = NULL;
            break;
            
        case "integerLiteral":
            out += expr.left + "L";
            type = INT;
            break;
            
        case "booleanLiteral":
            out += expr.left;
            type = BOOLEAN;
            break;

        case "CharLiteral":
            out += expr.left;
            type = CHAR;
            break;

        case "floatingPointLiteral":
            out += "up_java::up_lang::uc_float(" + expr.left.replace(/f$/, '') + "f)";
            type = FLOAT;
            break;

        default:
            out += expr.left;
            type = expr.literalType;
            StdError.throwError(expr.location, `Unknown literal type ${type}`);
        }
        break;

    case "parenthesis":
        e = writeExpression(expr.left);
        out += "(" + e.out + ")";
        retdata.isFinal = e.isFinal;
        type = e.type;
        out += writeExpressionRight(expr.right);
        
        break;

    case "cast":
        e = writeExpression(expr.left);
        if( expr.type.isReference ){
            out += "static_cast<";
            out += writeType(expr.type, false);
            out += ">(";
            out += e.out;
            out += ")";
        }else{
            out += writeType(expr.type, false) + "(";
            out += e.out;
            out += ")";
        }
        
        type = expr.type;

        out +=  writeExpressionRight(expr.right);
        break;

    case "new":
        {
            let close = "";
            let left = expr.left || typeHint;
            if( left.isArray ){
                if( expr.array ){
                    out += `new uc_Array<${writePath(left)},${!left.type.isNative}>{`;
                    out += expr.array.map(a => writeExpression(a).out).join(", ");
                    out += '}';
                }else{
                    out += `(new uc_Array<${writePath(left)},${!left.type.isNative}>)`;
                    out += "->loadValues({";
                    out += expr.arrayInitializer.map( e => writeExpression( e ).out ).join(",");
                    out += "})";
                }
                
                type = left;
            }else if( expr.left.getTarget().isInline ){
                let ref = expr.left.getTarget();
                out += "([=]()->";
                out += writeType(ref.extends, false);
                out += "{";
                out += writeClassInline(ref);
                out += "return new uc_" + ref.name;
                close = ";})()";
                type = ref.extends;
            }else{
                out += "(new " + writePath(expr.left);
                close = ")";
                type = expr.left;
            }
            
            if( !left.isArray ){
                out += "(";
                if( expr.args ){
                    out += expr
                        .args
                        .map( e => writeExpression(e).out )
                        .join(", ");
                }
                out += ")";
                out += close;
            }

            out += writeExpressionRight(expr.right);
            break;
        }

    case "ternary": // to-do: check if left & right types match
        {
            let left = writeExpression( expr.left );
            let right = writeExpression( expr.right );
            let condition = writeExpression( expr.condition );
            assertType( condition, BOOLEAN, expr );
            type = getOperatorType(left.type, "?", right.type, expr);
            out += "(";
            out += condition.out;
            out += "?";
            out += left.out; 
            out += ":";
            out += right.out;
            out += ")";
            break;
        }

    default:
        switch( expr.name ){
        case "binaryExpression":
            // console.log("bin: ", expr);
            if( expr.left && expr.right ){
                if( expr.operation != "instanceof"){
                    let left = writeExpression( expr.left );
                    let right = writeExpression( expr.right );
                    type = getOperatorType(left.type, expr.operation, right.type, expr.location ? expr : {location:{unit:right.out}});
                    if( expr.operation == "+" ){

                        if( ((left.type.getTarget && left.type.getTarget()) || left.type) == STRING.type )
                            out += "*(" + left.out + ")";
                        else
                            out += left.out;

                        out += " + ";

                        if( ((right.type.getTarget && right.type.getTarget()) || right.type) == STRING.type )
                            out += "*(" + right.out + ")";
                        else
                            out += right.out;

                    }else if( expr.operation == ">>>" ){
                        out += "up_java::up_lang::uc_uint(" + left.out + ")";
                        out += ">>";
                        out += right.out;
                        type = UINT;
                    }else{
                        out += left.out;
                        out += expr.operation;
                        out += right.out;
                    }
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
                type = getOperatorType( e.type, expr.operation, null, expr );
            }
            out += expr.operation;
            if( expr.right ){
                e = writeExpression( expr.right );
                type = e.type;
                out += e.out;
                type = getOperatorType( null, expr.operation, e.type, expr );
            }
            out += ")";
            break;

        default:
            StdError.throwError(expr.location, "Unknown operation: " + expr.operation + Object.keys(expr));
        }
        break;
    }
    
    retdata.out = out;
    retdata.type = type;
    return retdata;

    function writeExpressionRight(right){
        
        if( !right )
            return "";

        let out = "";

        right.forEach( ex => {
            if( typeof ex == "string" ){
                let trail = [];
                let target = type.resolve( [ex], trail, x=>true );
                if( !target ){
                    StdError.throwError(expr.location,`Could not find ${ex} in ${type.name}`);
                }
                if( type.getTarget )
                    type = type.getTarget();
                if( type.isClass || type.isInterface ) out += "->";
                else out += ".";
                out += ex;
                type = target.type;
            }else{
                e = writeExpression( ex );
                out += e.out;
                type = e.type;
            }
        });

        return out;
    }
}

function writeStatement( stmt, block, noSemicolon ){
    if( !stmt.location ){
        console.error( "Invalid statement: ", stmt );
        throw new Error(currentFile+": Invalid Statement");
    }

    try{
        return inner();
    }catch(ex){
        let msg = ex.message || ex;
        if( !(ex instanceof StdError) ){
            msg += "\n" + ex.stack;
        }
        if( !ex.location ){
            StdError.throwError( stmt.location, msg );
        }
        throw ex;
    }
    
    function inner(){
        let out = `\n/*<MAP*${stmt.location.unit}|${stmt.location.startLine}|${stmt.location.startColumn}*MAP>*/`;
        switch( stmt.type ){
        case "variableDeclarator":
            let local = block.locals.find( local => local.name == stmt.name );
            out += indent;
            
            if( stmt.expression ){
                let e = writeExpression(stmt.expression.right, local.type);
                if( local.type.name == "var" ){
                    local.type = e.type;
                }
                out += writeType(local.type, false) + " ";
                out += writeExpression(stmt.expression.left).out;
                out += "=";
                out += e.out;

                if( !isAssignableType( local.type, e.type ) ){
                    StdError.throwError( stmt.location, `Can't initialize ${local.name} with type ${e.type.name}.`);
                }
                
            }else{
                out += writeType(local.type, false) + " ";
                out += local.name + " = 0";
            }

            if( !noSemicolon )
                out += ";\n";
            
            break;
        case "emptyStatement":
            break;
        case "breakStatement":
            if( !stmt.label )
                out += `${indent}break;\n`;
            else{
                let pscope = stmt.scope;
                while(pscope && (!pscope.stmt || pscope.stmt.label !== stmt.label) ){
                    pscope = pscope.scope;
                }
                if( !pscope )
                    StdError.throwError(stmt.location, `Label ${stmt.label} not found.`);
                out += `${indent}goto _break_${pscope.stmt.labelId}_${stmt.label};\n`;
            }
            break;
            
        case "continueStatement":
            if( !stmt.label )
                out += `${indent}continue;\n`;
            else{
                let pscope = stmt.scope;
                while(pscope && (!pscope.stmt || pscope.stmt.label !== stmt.label) ){
                    pscope = pscope.scope;
                }
                if( !pscope )
                    StdError.throwError(stmt.location, `Label ${stmt.label} not found.`);
                out += `${indent}goto _continue_${pscope.stmt.labelId}_${stmt.label};\n`;
            }
            break;
            
        case "switchStatement":
            let e = writeExpression(stmt.expression);
            if( !e.type.getTarget )
                throw e.out;

            let type = e.type.getTarget();
            out += indent + "switch( ";
            let switchScope = null;
            if( type.isEnum ){
                out += `(${e.out})->__ordinal__`;
                switchScope = type;
            }else if( type.isNative ){
                out += e.out;
            }else{
                StdError.throwError(stmt.expression.location, `Invalid type in switch: ${Object.keys(type)}`);
            }

            out += " ){\n";

            stmt.cases.forEach( c => {
                if( c.value ){
                    out += `${indent}case `;

                    if( switchScope ){
                        c.value.left.scope = switchScope;
                    }

                    let e = writeExpression(c.value);
                    let type = e.type;
                    if( type.getTarget )
                        type = type.getTarget();
                    if( type.isEnum )
                        out += c.value.left.getTarget().ordinal;
                    else
                        out += e.out;
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

        case "throwStatement":
            {
                let e = writeExpression(stmt.expression);
                out += indent + "throw __ref__<"
                    + writePath(e.type)
                    + ">"
                    + e.out + ";\n";
            }
            break;
            
        case "returnStatement":
            {
                let e;
                if( stmt.expression ){
                    e = writeExpression(stmt.expression);
                    out += indent + "return " + e.out + ";\n";
                }else{
                    out += indent + "return;\n";
                    e = {type:VOID.type};
                }

                let method = stmt.scope;
                while(method && !method.isMethod)
                    method = method.scope;

                if(!method){
                    StdError.throwError(stmt.location, "Return outside method");
                }

                let right = e.type;
                if(right.getTarget)
                    right = right.getTarget();

                let left = method.result.getTarget();
                
                if( !right.isOfType(left) && !isAssignableType(left, right) ){
                    StdError.throwError(stmt.location, `"${left.name} ${method.name}(...)" should not return ${right.name}.`);
                }

                break;
            }            
        case "ifStatement":
            {
                let e = writeExpression(stmt.condition);
                assertType(e.type, BOOLEAN, stmt);

                out += indent + "if( " + e.out + " )\n";
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
            }

        case "doStatement":
            {
                let e = writeExpression(stmt.condition);
                assertType(e.type, BOOLEAN, stmt);

                out += `${indent}do`;
                if( stmt.body.type != "block" ){
                    out += `${indent}{\n`;
                    push();
                }
                out += writeStatement( stmt.body, block );
                if( stmt.body.type != "block" ){
                    pop();
                    out += `${indent}}\n`;
                }
                out += `${indent}while( `;
                out += e.out;
                out += " );\n";

                break;
            }

        case "whileStatement":
            {
                let e = writeExpression(stmt.condition);
                assertType(e.type, BOOLEAN, stmt);
                
                out += indent + "while( ";
                out += e.out;
                out += " )\n";
                
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
            }

        case "tryStatement":
            out += indent + "try";
            out += writeStatement( stmt.tryBlock );

            stmt.catches.forEach( cstmt=>{
                out += "catch(";
                out += writeType(cstmt.field.type, false);
                out += " " + cstmt.field.name;
                out += ")" + writeStatement(cstmt.block);
            });
            
            break;

        case "enhancedForStatement":
            {
                let e = writeExpression(stmt.iterable);

                let itType = stmt.iterator.type;
                if( itType.name == "var" ){
                    stmt.iterator.type = new TypeRef(
                        e.type.name,
                        false,
                        itType.scope,
                        e.type.getTarget()
                    );
                }

                out += indent + "for( ";
                out += writeType( stmt.iterator.type, false );
                out += " " + stmt.iterator.name;
                out += " : ";
                out += e.out;
                out += "->iterator()";
                out += ")\n";

                let needsBraces = (stmt.body.type != "block") || !!stmt.label;

                if( needsBraces ){
                    out += `${indent}{\n`;
                    push();
                }

                out += writeStatement( stmt.body, block );

                if( stmt.label )
                    out += `${indent}_continue_${stmt.labelId}_${stmt.label}:;\n`;
                if( needsBraces ){
                    pop();
                    out += `${indent}}\n`;
                }
                if( stmt.label )
                    out += `${indent}_break_${stmt.labelId}_${stmt.label}:;\n`;

                break;
            }
            
        case "forStatement":
            {
                out += indent + "for( ";
                if( stmt.init ){
                    let backup = indent;
                    indent = "";
                    out += stmt.init.map( init => writeStatement(init, stmt.scope, true) ).join(", ");
                    indent = backup;
                }
                out += ";";

                out += " " + (stmt.condition?writeExpression(stmt.condition).out:"");

                out += "; ";
                out += stmt.update.map(x=>writeExpression(x).out).join(",");
                out += ")\n";

                let needsBraces = (stmt.body.type != "block") || !!stmt.label;

                if( needsBraces ){
                    out += `${indent}{\n`;
                    push();
                }
                
                out += writeStatement( stmt.body, block );
                if( stmt.label )
                    out += `${indent}_continue_${stmt.labelId}_${stmt.label}:;\n`;
                if( needsBraces ){
                    pop();
                    out += `${indent}}\n`;
                }
                if( stmt.label )
                    out += `${indent}_break_${stmt.labelId}_${stmt.label}:;\n`;
                
                break;
            }
            
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

}

function assertType( type, test, location ){
    let out = '.';
    if( type.out )
        out = `in "${type.out}"`;
        
    if( type.type )
        type = type.type;
    if( type.getTarget )
        type = type.getTarget();
    if( test.getTarget)
        test = test.getTarget();
    if( type != test ){
        StdError.throwError(location.location || location,
                   `Expected a ${test.name}, got a ${type.name} ${out}`);
    }
}

function writeRawData( data ){
    let out = "static const uint8_t d[] = {\n";
    for( let i=0; i<data.length; ++i ){
        out += `0x` + data[i].toString(16) + ",";
    }
    out += "\n};\nreturn d;\n";
    return out;
}

function writeStreamData( data, index, end ){
    let out = "static const uint8_t d[] = {\n";
    for( let i=0; i<data.length; ++i ){
        out += `0x` + data[i].toString(16) + ",";
    }
    out += "\n};\n";
    out += `if( ${index} < 0 || ${index} >= sizeof(d) ) return ${end};\n`;
    out += `return d[${index}++];\n`;
    return out;
}

function writeStringData( data ){
    let out = "static const char d[] = \"";
    out += JSON.stringify(data);
    out += "\";\nreturn new uc_String(d);\n";
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

    if( block.returnConst )
        out += "return " + block.returnConst + ";\n";

    if( block.image )
        out += require("./cppImage.js")( block );        

    if( block.sprite || block.tilemap )
        out += require("./cppSprite.js")( block );

    if( block.rawData )
        out += writeRawData( block.rawData );

    if( block.stream )
        out += writeStreamData( block.stream, block.index, block.endOfData|0 );

    if( block.xmlData )
        out += require("./cppXML.js")( block.xmlData );

    if( block.textData ){
        out += writeStringData( block.textData );
    }

    if( block.resourceLookup ){
        out += require("./Resources.js")
            .writeCPP( block.resourceLookup.map(({path, call})=>({
                path,
                call:writePath(call)
            })) );
    }

    return out;
}

function callClassInitializer( type ){
    let out = "";
    if( !type.initializers || !type.initializers.length )
        return out;
    out += writePath( type );
    out += "::__class_initializer__();\n";
    return out;
}

function writeClassImpl( unit ){
    let out = openNamespace( unit, "Implementations" );
    
    unit.types.forEach( t => writeTypes(t) );
    
    out += closeNamespace( unit );
    return out;

    function writeTypes( t ){
        if( t.isAnnotation ){
            let name = writePath(t).replace(/::/g, ".");
            if( annotationHandlers[name] && annotationHandlers[name].implementation ){
                out += annotationHandlers[name].implementation(t) || "";
            }
            return;
        }
        
        if( t.cppType == "enum class" ){
            out += `${indent}// ${t.name} enum values\n`;
            t.constantList.forEach( c => {
                out += `${indent}ue_${t.name} ue_${t.name}::${c.name}(${c.ordinal});\n`;
            });            
        }

        if( t.cppType != "class" || t.isNative )
            return;

        if( !t.implements.find(i=>i.name == "__stub_only__") ){
            let isStub = t.implements.find(i=>i.name == "__stub__");

            out += `${indent}// ${t.name} static fields\n`;

            t.fields.forEach( field => {
                if( !field.isStatic ){
                    writePath(field.type); // This fixes a bug.
                    return;
                }

                let e;
                if( field.init && field.init.expression ){
                    e = writeExpression(field.init.expression.right, field.type);
                
                    if( field.type.name == "var" && e )
                        field.type = e.type;
                }

                out += `${indent}`;

                if( field.isVolatile )
                    out += "volatile ";

                if( field.isFinal )
                    out += "const ";

                out += `${writeType(field.type, true)} ${writePath(t)}::`;
                out += field.name;

                if( field.init && field.init.expression ){
                    if( !isAssignableType( field.type, e.type ) ){
                        StdError.throwError( field.init.expression.location, `Can't initialize ${field.name} with type ${e.type.name}.`);
                    }

                    out += " = " + e.out;
                }

                out += ';\n';
            });

            out += `${indent}// ${t.name} methods\n`;

            t.methods.forEach( method => {
                if( method.isAbstract )
                    return;

                if( isStub && !method.body && !method.isConstructor ){
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
                        out += `${indent}// Missing stub ${t.name}::${method.name} (${stubPath}\n`;
                        out += writeMethodSignature( method, false, t.name );
                        out += `{}\n`;
                    }
                    return;
                }

                let signature = writeMethodSignature( method, false, t.name );

                out += signature;

                if( method.annotations ){
                    method.annotations.forEach( ref => {
                        let annotation = ref.getTarget();
                        let name = ref.name.join(".");
                        let cname = writePath(annotation).replace(/::/g, ".");
                        if( !annotation )
                            StdError.throwError(method.location, `Annotation ${name} not found.`);
                        if( annotationHandlers[cname] && annotationHandlers[cname].method )
                            annotationHandlers[cname].method(method, writePath(method), ref.pairs);
                    });
                }
                
                out += writeMethodBody(method, t);

            });
        }

        if( !t.extends || t.extends.name[0] != "__raw__" ){
        // out += `${indent}const uint32_t ${t.name}::__id__ = ${t.id};\n`;

            if( !t.isInterface ){
            out += `${indent}uint32_t uc_${t.name}::__sizeof__(){
${indent}\treturn sizeof(*this);
${indent}}
`;
            }
            
            out += `${indent}bool uc_${t.name}::__instanceof__( uint32_t id ){
${indent}\tif(id == ${t.id}) return true;
${indent}\treturn ${t.extends&&t.extends.name[0]!="__raw__"?writePath(t.extends)+"::__instanceof__(id)":"false"};
${indent}}
`;
            if( !t.isInterface && writePath(t) != "up_java::up_lang::uc_Object" ){
                out += `${indent}void uc_${t.name}::__hold__(){ uc_Object::__hold__(); }\n`;
                out += `${indent}void uc_${t.name}::__release__(){ uc_Object::__release__(); }\n`;

                out += `${indent}void uc_${t.name}::__mark__(int m){\n`;
                push();
                out += `${indent}if(__is_marked__(m)) return;\n`;
                if( t.extends ){
                    out += `${indent}${writePath(t.extends)}::__mark__(m);\n`;
                }else{
                    out += `${indent}uc_Object::__mark__(m);\n`;
                }

                t.fields.forEach( field => {
                    if( field.isStatic || field.type.getTarget().isEnum )
                        return;

                    if( field.type.isArray || field.type.isReference ) {
                        out += `${indent}if( ${field.name} ) `;
                        out += `${field.name}->__mark__(2);\n`;
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

function init( unit ){
    (VOID = new TypeRef(["void"], false, unit)).getTarget();
    (UINT = new TypeRef(["uint"], false, unit)).getTarget();
    (INT = new TypeRef(["int"], false, unit)).getTarget();
    (LONG = new TypeRef(["long"], false, unit)).getTarget();
    (FLOAT = new TypeRef(["float"], false, unit)).getTarget();
    (DOUBLE = new TypeRef(["double"], false, unit)).getTarget();
    (NULL = new TypeRef(["Null"], false, unit)).getTarget();
    (BOOLEAN = new TypeRef(["boolean"], false, unit)).getTarget();
    (CHAR = new TypeRef(["char"], false, unit)).getTarget();
    (SHORT = new TypeRef(["short"], false, unit)).getTarget();
    (BYTE = new TypeRef(["byte"], false, unit)).getTarget();
    (UBYTE = new TypeRef(["ubyte"], false, unit)).getTarget();
    (STRING = new TypeRef(["String"], false, unit)).getTarget();
    (POINTER = new TypeRef(["pointer"], false, unit)).getTarget();
}

function write( unit, main, plat, dbg ){
    let endData = {};
    init(unit);
    isDebugMode = dbg;

    units = {};

    platform = (plat||"desktop").toLowerCase();
    platformDir = __dirname + "/" + platform;

    annotationHandlers = fs.readdirSync(platformDir + "/annotations")
        .filter( name => /\.js$/i.test(name) )
        .reduce( (obj, name) => {
            let {handler} = require(platformDir + "/annotations/" + name);
            obj[name.replace(/\.js$/i, "")] = new handler();
            return obj;
        }, {});

    addUnit(unit);

    let out = fs.readFileSync( platformDir+"/begin.cpp", "utf-8" );

    let pending;
    do{
        pending = false;
        for( let key in units ){
            let dependency = units[key];
            if( dependency.classImpl )
                continue;
            pending = true;

            currentFile = (dependency.unit.name||[]).join(".");
            dependency.forwardDecl = writeForwardDecl( dependency.unit );
            dependency.classImpl = writeClassImpl( dependency.unit );
        }
    }while(pending);

    let types = getTypeList();

    types = sortTypes(types);

    let list = Object.values(units).reverse();
    for( let dependency of list )
        out += dependency.forwardDecl;
    // for( let dependency of list )
    //    out += dependency.classDecl;
    for( let type of types )
        out += writeClassDecl( type.unit, type.type, type.dependencies );
        
    for( let dependency of list )
        out += dependency.classImpl;

    let trail = [];

    endData.MAIN = writePath({
        getTarget(){
            return unit.resolve([...main, "main"], trail);
        },
        trail
    });

    out += "void __initialize_classes__(){\n";
    for( let type of types ){
        out += callClassInitializer(type.type);
    }
    out += "}\n";

    for( let k in annotationHandlers ){
        if( annotationHandlers[k].end )
            annotationHandlers[k].end( endData );
    }

    let end = fs.readFileSync( platformDir+"/end.cpp", "utf-8" );
    for( let key in endData ){
        end = end.split("$"+key+"$").join(endData[key]);
    }
    end = end.replace(/\$[A-Z]+\$/g, "");
    out += end;

    return out;

}

module.exports = { write };
