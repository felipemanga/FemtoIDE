#include <Pokitto.h>
#include "global.h"
#include "images/gameover.h"

extern "C" void CheckStack();

StateGameOver::StateGameOver(){
    PD::setTASRowMask(0b1111'11111111'11111111);
    for(int i = 0; i < 256; ++i)
        tilemap.setColorTile(i, i);
    tilemap.set(14, 11, map);
    start.play(::start, Start::Anim);
}

void StateGameOver::updateMap(){
    constexpr float pi = 3.14159265f;

    time++;
    for(int y = 0; y < 11; ++y){
        float sy = cos((y - time * 0.25f) * (pi / 11.0f)) * 10.0f;
        for(int x = 0; x < 14; ++x){
            map[y * 14 + x] = sy + 10.0f * cos(x * (pi / 14.0f)) + time * 0.5f;
        }
    }

    tilemap.draw(0, 0);
}

void StateGameOver::update(){
    updateMap();
    PD::drawSprite(0, 64, gameover);

    if(PB::aBtn()) {
        if(debounce){
            stateMachine.setState<StateIntro>();
        }
    } else {
        debounce = true;
    }
}
