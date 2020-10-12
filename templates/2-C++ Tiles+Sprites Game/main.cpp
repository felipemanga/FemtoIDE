#include <Pokitto.h>
#include <miloslav.h>
#include <Tilemap.hpp>
#include <SDFileSystem.h>
#include "sprites.h"
#include "Smile.h"
#include "maps.h"

using PC = Pokitto::Core;
using PD = Pokitto::Display;
using PB = Pokitto::Buttons;

Tilemap tileMap;
int camX = 64, camY = 64, speed = 3, recolor = 0;
Sprite player;
auto playerWidth = player.getFrameWidth();
auto playerHeight = player.getFrameHeight();
auto playerX = LCDWIDTH / 2 - playerWidth / 2;
auto playerY = LCDHEIGHT / 2 - playerHeight / 2;

void init() {
    PD::loadRGBPalette(miloslav);

    tileMap.set(gardenPath[0], gardenPath[1], gardenPath + 2);
    for (int i = 0; i < sizeof(tiles) / (POK_TILE_W * POK_TILE_H); i++)
        tileMap.setTile(i, POK_TILE_W, POK_TILE_H, tiles + i * POK_TILE_W * POK_TILE_H);

    player.play(dude, Dude::walkS);
}

void update() {

    int oldX = camX;
    int oldY = camY;

    if (PB::rightBtn()) {
        camX += speed;
        if (player.animation != Dude::walkE)
            player.play(dude, Dude::walkE);
    } else if (PB::leftBtn()) {
        camX -= speed;
        if (player.animation != Dude::walkW)
            player.play(dude, Dude::walkW);
    }

    if (PB::upBtn()) {
        camY -= speed;
        if (player.animation != Dude::walkN)
            player.play(dude, Dude::walkN);
    } else if (PB::downBtn()) {
        camY += speed;
        if (player.animation != Dude::walkS)
            player.play(dude, Dude::walkS);
    }

    int tileX = (camX + playerX + PROJ_TILE_W / 2) / PROJ_TILE_W;
    int tileY = (camY + playerY + playerHeight) / PROJ_TILE_H;
    auto tile = gardenPathEnum(tileX, tileY);

    if (tile & Collide) {
        camX = oldX;
        camY = oldY;
    }

    if (tile & WalkOnGrass) {
        recolor++;
    } else {
        recolor = 0;
    }

    tileMap.draw(-camX, -camY);
    PD::drawSprite(-camX, -camY, Smile, false, false, recolor);
    player.draw(playerX, playerY, false, false, recolor);
}