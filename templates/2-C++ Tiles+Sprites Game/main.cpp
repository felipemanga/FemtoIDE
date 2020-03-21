#include <Pokitto.h>
#include <miloslav.h>
#include <Tilemap.hpp>
#include <SDFileSystem.h>
#include "Smile.h"
#include "maps.h"

int main(){
    using PC=Pokitto::Core;
    using PD=Pokitto::Display;
    using PB=Pokitto::Buttons;
    
    PC::begin();
    PD::loadRGBPalette(miloslav);
    
    Tilemap tilemap;
    tilemap.set(gardenPath[0], gardenPath[1], gardenPath+2);
    for(int i=0; i<sizeof(tiles)/(POK_TILE_W*POK_TILE_H); i++)
        tilemap.setTile(i, POK_TILE_W, POK_TILE_H, tiles+i*POK_TILE_W*POK_TILE_H);

    int x=32, y=32, c=0, speed=3;
    while( PC::isRunning() ){
        if( !PC::update() ) 
            continue;
            
        int oldX = x;
        int oldY = y;

        if(PB::leftBtn()) x -= speed;
        else if(PB::rightBtn()) x += speed;
        if(PB::downBtn()) y += speed;
        else if(PB::upBtn()) y -= speed;
        
        int tileX = (x + 8 + PROJ_TILE_W/2) / PROJ_TILE_W;
        int tileY = (y + 12 + PROJ_TILE_H/2) / PROJ_TILE_H;
        auto tile = gardenPathEnum(tileX, tileY);
        if( tile&Collide ){
            x = oldX;
            y = oldY;
        }

        PD::drawSprite(110 - 12, 88 - 12, Smile);
        tilemap.draw(x + 12 - 110, y + 12 - 88);
    }
    
    return 0;
}
