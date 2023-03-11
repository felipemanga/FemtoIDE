//!MENU-ENTRY:Convert TMX
//!MENU-SHORTCUT:C-t

// This script looks in the "maps" folder and converts all of the tiled TMX files into maps.cpp.
// The TMX files should be orthogonal and in CSV format.
// Press Ctrl+Enter to run this script or use the menu.

let nextTileSetId = 1;
let tilesets = {};
let tiles = [];

let nextTextureId = 1;
let textures = {};
let textureIndex = {};

let composites = {};
let compositeList = [];

let width, height;
let tileW, tileH;
let promises = [];
let palette;

promises.push(new Promise((ok, nok)=>{
    APP.getPalette(pal=>{
        palette = pal;
        APP.log(palette.length);
        if(pal) ok();
        else nok();
    });
}));

let maps = dir("maps")
    .filter( file=>/\.tmx$/i.test(file) )
    .reduce( (index, file) => {
        let xml = XML(read(`maps/${file}`));

        let tileSets = [];
        let layers = getLayers(xml);
        let objects = getObjects(xml);
        let map = {
            tileSets,
            layers,
            objects
        };

        [...xml.querySelector("map").attributes]
            .reduce((obj, attr)=>(obj[attr.name] = attr.value, obj), map),

        index[file.replace(/\..*/,"")] = map;

        promises.push(...getTileSets(xml).map(ts=>{
            ts.gid = ts.firstgid|0;
            for( let i=0; i<ts.tilecount|0; ++i )
                tileSets[ts.gid+i] = ts;

            let imgPath = "maps" + path.sep + ts.source;
            if(textureIndex[imgPath]){
                textureIndex[imgPath].push(ts);
                return new Promise(ok=>ok(ts));
            }

            let tslist = [ts];
            textureIndex[imgPath] = tslist;

            return readImage(imgPath)
                .then( image => {
                    let textureId = nextTextureId++;
                    for(let ts of tslist){
                        ts.image = image;
                        ts.textureId = textureId;
                    }
                    textures[textureId] = image;
                    return ts;
                });
        }));

        return index;
    },
    {}
);

function capitalize(name){
    return name.charAt(0).toUpperCase() + name.slice(1);
}
//TODO: Write data to .bin 
Promise.all(promises)
    .then(_=>{
        let acc = "";
        let bin = "";
        let inits = [];
        let keys = {};
        
        for( let name in maps ){
            let {str, special} = processTMX(maps[name], name);
            
            // get map details. Width, height, tiles
            bin += `
    public static pointer get${capitalize(name)}(){
        pointer ptr;
        __inline_cpp__("
        static uint8_t ${name}[] = {
        ${str[0].length}, ${str.length},
        ${str.map(l=>l.map(m=>"0x"+((m||1)-1).toString(16).padStart(2, "0")).join(", ")).join(",\n")}
        };
        ptr = ${name};
        ");
        return ptr;
    }\n\n`;
            
            // the map enum
            bin += `
    public static byte get${capitalize(name)}Data(int x, int y){
        byte ptr;
        __inline_cpp__("
        static signed char parameters[] = {
            ${special.map(l => {
                l.forEach(l => keys[l] = l);
                let v = "EMPTY";
                if(l.length == 1)
                    v = l[0];
                else if(l.length > 1)
                    v = "UNSUPPORTED, // TODO multiple data points currently unsupported - MapEnum(" + [...new Set(l)].join("|") + ")";
                return v;
            }).join(",\n\t")
            }
        };
            
        ptr = (x >= ${str[0].length} || y >= ${str.length}) ? EMPTY : parameters[y * ${str[0].length} + x];
        ");
        return ptr;
    }\n\n`;
    
        }

        
        bin =
`// Generated File - DO NOT EDIT
public class TileMaps {
\tstatic byte UNSUPPORTED = -1;
\tstatic byte EMPTY = 0;
\t${Object.keys(keys).map((o, i) => `static byte ${o} = ${i+1}`).join(";\n\t")};

    // get Map 0:width, 1:height, map...
    ${bin}
    
    // Number of tiles
    public static int tileSetSize = ${compositeList.length};
    
    public static int tileW = ${tileW};
    public static int tileH = ${tileH};
    // Used in TileFiller to get tiles.
    public static pointer getTiles(){
        pointer ptr;
        __inline_cpp__("
        static const uint8_t tiles[${compositeList.length*tileW*tileH}] = {
`;
        let idx=0;
        for( let composite of compositeList ){
            bin += `\n// ${(idx++).toString(16)}: ${composite.key}\n`;
            bin += APP.convertImage(composite, {bpp:8,palette});
        }
bin += `       };
        ptr = tiles;
        ");
        return ptr;
    }
}

`;

        write("TileMaps.java", bin);
        log("Conversion complete!");
    })
    .catch(ex=>{
        log(ex);
    });

function getLayers(xml){
    return [...xml.querySelectorAll("layer")]
        .map(layer=>{
            let data = layer.textContent.split(/\s*,\s*/).map(x=>x|0);
            [...layer.attributes]
                .reduce((obj, attr)=>(obj[attr.name] = attr.value, obj), data);
            Object.assign(data, getProperties(layer));
            data.visible = data.visible != "0" && data.visible != "false";
            return data;
        });
}

function getObjects(xml){
    return [...xml.querySelectorAll("object")]
        .map(layer=>{
            let data = {};
            [...layer.attributes]
                .reduce((obj, attr)=>(obj[attr.name] = attr.value, obj), data);
            Object.assign(data, getProperties(layer));
            data.x = data.x|0;
            data.y = (data.y|0) - (data.height|0);
            return data;
        });
}

/*
 <tileset firstgid="1" name="magecity_1" tilewidth="16" tileheight="16" tilecount="360" columns="8">
  <image source="../../../../../../../Pictures/tileset/16x16/magecity_1.png" width="128" height="725"/>
 </tileset>
*/
function getTileSets(xml){
    return [...xml.querySelectorAll("tileset")]
        .map(tset=>parseTset(tset))
        .sort((a, b)=>(a.firstgid|0) - (b.firstgid|0));

    function parseTset(tset){
        let obj = {};
        let attributes = [...tset.attributes]
                .reduce((obj, attr)=>(obj[attr.name] = attr.value, obj), {});

        if( attributes.source ){
            tset = XML(read(`maps/${attributes.source}`)).querySelector("tileset");
            obj = attributes;
            attributes = [...tset.attributes]
                .reduce((obj, attr)=>(obj[attr.name] = attr.value, obj), {});
        }

        return Object.assign(
            obj,

            attributes,

            [...(tset.querySelector("image")||{attributes:[]}).attributes]
                .reduce((obj, attr)=>(obj[attr.name] = attr.value, obj), {}),

            [...(tset.querySelectorAll("tile"))]
                .reduce((obj, tile)=>{
                    obj.properties[tile.id|0] = getProperties(tile);
                    return obj;
                }, {properties:{}})
        );
    }
}

function getProperties(node){
    return [...node.querySelectorAll("property")].reduce((o, prop)=>{
                        o[prop.attributes.name.value.trim()] = prop.attributes.value.value.trim();
                        return o;
                    }, {});
}

function processTMX(map, name){
    let str = [];

    width = map.width|0;
    height = map.height|0;
    tileW = map.tilewidth|0;
    tileH = map.tileheight|0;

    let special = new Array(width*height);
    for( let i=0; i<special.length; ++i )
        special[i] = [];

    let merged = [];
    for( let y=0; y<height; ++y ){
        for( let x=0; x<width; ++x ){
            let allTiles = [];
            let tiles = [];
            map.layers.forEach(layer=>{
                let gid = layer[y*width+x]|0;
                if(!gid) return;

                allTiles.push(gid);

                if(!layer.visible) return;

                tiles.push( gid );
            });

            merged.push( tiles.length ? getMergedTile( map, tiles ) : 0 );

            for( let id of allTiles ){
                let ts = map.tileSets[id&~0xE0000000];
                let tprops = ts.properties[(id&~0xE0000000) - ts.gid];
                for( let key in tprops ){
                    special[y*width + x].push(tprops[key]);
                }
            }
        }
        str.push(merged);
        merged = [];
    }

    return {str, special};
}

function getMergedTile(map, ids){
    let compositeKey = ids.map(id=>`${map.tileSets[id&~0xE0000000].textureId}:${id}`).join(",");
    let compositeId = composites[compositeKey];

    if( compositeId ){
        return compositeId;
    }

    const composite = new ImageData(tileW, tileH);
    composite.key = compositeKey;
    composites[compositeKey] = compositeId = compositeList.length + 1;
    compositeList.push( composite );

    let srcIndex, outIndex;

    for( let id of ids ){
        let gid = id&~0xE0000000;
        let ts = map.tileSets[gid];
        let src = ts.image;
        let srcX = ((gid - ts.gid) % (ts.columns|0)) * tileW;
        let srcY = (((gid - ts.gid) / (ts.columns|0))|0) * tileH;
        srcIndex = (srcX + srcY * ts.image.width) * 4;
        outIndex = 0;
        let data = src.data;
        let srcWidth = src.width;

        if( id&0xE0000000 ){
            let out = new Uint8Array(tileH*tileW*4);
            for( let y=0; y<tileH; ++y ){
                for( let x=0; x<tileW; ++x ){
                    out[(y*tileW+x) * 4 + 0] = data[srcIndex + x*4 + 0];
                    out[(y*tileW+x) * 4 + 1] = data[srcIndex + x*4 + 1];
                    out[(y*tileW+x) * 4 + 2] = data[srcIndex + x*4 + 2];
                    out[(y*tileW+x) * 4 + 3] = data[srcIndex + x*4 + 3];
                }
                srcIndex += srcWidth * 4;
            }
            srcIndex = 0;
            srcWidth = tileW;
            data = out;

            if( id&0x20000000 ){ // FLIPPED_DIAGONALLY_FLAG
                let out = new Uint8Array(tileH*tileW*4);
                for( let y=0; y<tileH; ++y ){
                    for( let x=0; x<tileW; ++x ){
                        let outI = (y*tileW+x)*4;
                        let inI = (x*tileW+y)*4;
                        out[outI++] = data[inI++];
                        out[outI++] = data[inI++];
                        out[outI++] = data[inI++];
                        out[outI++] = data[inI++];
                    }
                }
                data = out;
            }

            if( id&0x80000000 ){ // FLIPPED_HORIZONTALLY_FLAG
                let out = new Uint8Array(tileH*tileW*4);
                for( let y=0; y<tileH; ++y ){
                    for( let x=0; x<tileW; ++x ){
                        let outI = (y*tileW+x)*4;
                        let inI = (y*tileW+tileW-1-x)*4;
                        out[outI++] = data[inI++];
                        out[outI++] = data[inI++];
                        out[outI++] = data[inI++];
                        out[outI++] = data[inI++];
                    }
                }
                data = out;
            }

            if( id&0x40000000 ){ // FLIPPED_VERTICALLY_FLAG
                let out = new Uint8Array(tileH*tileW*4);
                for( let y=0; y<tileH; ++y ){
                    for( let x=0; x<tileW; ++x ){
                        let outI = (y*tileW+x)*4;
                        let inI = ((tileH - y - 1)*tileW+x)*4;
                        out[outI++] = data[inI++];
                        out[outI++] = data[inI++];
                        out[outI++] = data[inI++];
                        out[outI++] = data[inI++];
                    }
                }
                data = out;
            }
        }

        for( let y=0; y<tileH; ++y ){
            for( let x=0; x<tileW; ++x ){
                let A = data[srcIndex + x*4 + 3];
                if( A < 128 ){
                    outIndex += 4;
                    continue;
                }
                composite.data[outIndex++] = data[srcIndex + x*4 + 0];
                composite.data[outIndex++] = data[srcIndex + x*4 + 1];
                composite.data[outIndex++] = data[srcIndex + x*4 + 2];
                composite.data[outIndex++] = 255;
            }
            srcIndex += srcWidth * 4;
        }
    }

    return compositeId;
}
