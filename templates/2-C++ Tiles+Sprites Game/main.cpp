#include <Pokitto.h>
#include <miloslav.h>
#include <Tilemap.hpp>
#include <SDFileSystem.h>
#include "sprites.h"
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

    int cameraX = 64, cameraY = 64, speed = 3, recolor = 0;
    
    Sprite player;
    player.play(dude, Dude::walkS);
    auto playerWidth = player.getFrameWidth();
    auto playerHeight = player.getFrameHeight();
    auto playerX = LCDWIDTH/2 - playerWidth/2;
    auto playerY = LCDHEIGHT/2 - playerHeight/2;
    
    while( PC::isRunning() ){
        if( !PC::update() ) 
            continue;
            
        int oldX = cameraX;
        int oldY = cameraY;

        if(PB::rightBtn()){
            cameraX += speed;
            if(player.animation != Dude::walkE)
                player.play(dude, Dude::walkE);
        }else if(PB::leftBtn()){
            cameraX -= speed;
            if(player.animation != Dude::walkW)
                player.play(dude, Dude::walkW);
        }
        
        if(PB::upBtn()){
            cameraY -= speed;
            if(player.animation != Dude::walkN)
                player.play(dude, Dude::walkN);
        }else if(PB::downBtn()){
            cameraY += speed;
            if(player.animation != Dude::walkS)
                player.play(dude, Dude::walkS);
        }
        
        int tileX = (cameraX + playerX + PROJ_TILE_W/2) / PROJ_TILE_W;
        int tileY = (cameraY + playerY + playerHeight) / PROJ_TILE_H;
        auto tile = gardenPathEnum(tileX, tileY);

        if( tile&Collide ){
            cameraX = oldX;
            cameraY = oldY;
        }
        
        if( tile&WalkOnGrass ){
            recolor++;
        }else{
            recolor = 0;
        }

        tilemap.draw(-cameraX, -cameraY);
        PD::drawSprite(-cameraX, -cameraY, Smile, false, false, recolor);
        player.draw(playerX, playerY, false, false, recolor);
    }
    
    return 0;
}
