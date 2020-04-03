#include <Pokitto.h>
#include "global.h"
#include "sfx/Boop.h"

extern "C" void CheckStack();

StateIntro::StateIntro(){
    PD::setTASRowMask(0b1111'11111111'11111111);
    for(int i = 0; i < 256; ++i)
        tilemap.setColorTile(i, i);
    tilemap.set(14, 11, map);
    head[0].play(heads, Heads::Diesel);
    head[1].play(heads, Heads::Bagel);
    head[2].play(heads, Heads::Punk);
    head[3].play(heads, Heads::Cyber);

    start.play(::start, Start::Anim);
}

void StateIntro::updateMap(){
    constexpr float pi = 3.14159265f;

    time++;
    for(int y = 0; y < 11; ++y){
        float sy = cos((y + time * 0.25f) * (pi / 11.0f)) * 10.0f;
        for(int x = 0; x < 14; ++x){
            map[y * 14 + x] = sy * cos(x * (pi / 14.0f)) + time * 0.5f;
        }
    }

    tilemap.draw(0, 0);
}

void StateIntro::update(){
    updateMap();

    selection %= 4;
    for(int i = 0; i<sizeof(head) / sizeof(head[0]); ++i){
        head[i].recolor = (selection == i) ? 0 : 30 * 8;
        head[i].update(0, 0);
    }

    start.update(0, 0);

    if(PB::rightBtn()){
        selection += debounce;
        debounce = false;
    } else if(PB::leftBtn()){
        selection -= debounce;
        debounce = false;
    } else if(PB::aBtn()) {
        if(debounce){
            PS::playSFX(Boop, sizeof(Boop));
            switch(selection){
            case 0: shared::playerAnim = Ships::Diesel; break;
            case 1: shared::playerAnim = Ships::Bagel; break;
            case 2: shared::playerAnim = Ships::Punk; break;
            case 3: shared::playerAnim = Ships::Cyber; break;
            }
            stateMachine.setState<StateGame>();
        }
    } else {
        debounce = true;
    }
}
