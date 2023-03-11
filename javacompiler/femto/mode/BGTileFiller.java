package femto.mode;

public class BGTileFiller implements LineFiller {
    // Get the map, get the tiles, render
    pointer tileMap;
    pointer tileWindow;
    pointer tileSet;
    ushort[] palette;
    int mapWidth;
    int mapHeight;
    // int color;
    int cameraX = 0;
    int cameraY = 0;
    int adjustedY;
    int tileW = 10;
    int tileH = 8;
    int tileSize = 0;
    int totalHeight;

    BGTileFiller(ushort[] palette) {
        this.palette = palette;
    }

    void setTile(int tileId, int x, int y) {
        __inline_cpp__("
        ((uint8_t * ) tileMap)[x + y * mapWidth] = tileId;
        ");
    }

    int getTile(int x, int y) {
        int t = -1;
        __inline_cpp__("
        t = ((uint8_t * ) tileMap)[x + y * mapWidth];
        ");
        return t;
    }

    void setMap(pointer map, pointer tileSet) {
        this.tileSet = tileSet;
        
        tileW = TileMaps.tileW;
        tileH = TileMaps.tileH;
        tileSize = tileW * tileH;
        
        __inline_cpp__("
        mapWidth = ((char * ) map)[0]; 
        mapHeight = ((char * ) map)[1]; 
        tileMap = (uint8_t * ) map + 2;
        ");
        
        totalHeight = mapHeight * tileH;
    }

    void draw(int x, int y) {
        cameraX = x;
        cameraY = y;
    }

    void fillLine(ushort[] line, int y) {
        adjustedY = y - cameraY;
        // Clip top and bottom of map.
        if (adjustedY < 0 || adjustedY >= totalHeight) return;
        
        // Set the Y for the map and tileset lookup
        var mapY = ((adjustedY) / tileH) * mapWidth;
        var tileY = ((adjustedY) % tileH) * tileW;
        
        // Set the X for the map and tileset lookup
        var mapX = cameraX / tileW;
        var tileX = cameraX % tileW;
        
        // Clip to the left of the map
        int start = -cameraX;
        if (cameraX < 0) {
            mapX = 0;
            tileX = 0;
        }
        if (start < 0) start = 0;
        
        __inline_cpp__("
        auto tileStart = ((uint8_t * ) tileMap)+mapY;//[mapX + mapY];
        ");
        
        // Loop the map width to collect the tiles
        for (int i = start; i < 220 && mapX < mapWidth;) {
            // Clip the right hand side of the map. Whee~
            // if (mapX >= mapWidth) return;
        
            int iter = min(tileW - tileX, 220 - i);

            __inline_cpp__("
            // Get tile ID from the map. Then use that to find the tile itself from the tileset
            auto tileId = ((uint8_t * ) tileStart)[mapX]*tileSize;
            auto tile = ((uint8_t * ) tileSet) + tileId + tileY + tileX;
            auto lineElements = line->elements+i;
            ");
    
            // Loop over the Tile color IDs and put them in the line array.
            for (int t = 0; t < iter; t++) {
                __inline_cpp__("
                 ((unsigned short*)lineElements)[t] = palette->elements[tile[t]];
                ");
            }
            i += iter;
            tileX = 0;
            mapX++;
        }
    }

    int min(int a, int b) {
        return (a < b) ? a : b;
    }

}