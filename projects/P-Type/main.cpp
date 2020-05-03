#include "global.h"
#include <miloslav.h>

void init(){
    PD::loadRGBPalette(miloslav);
    PD::setFont(fontDonut);
    
    // Eric Atwell (@Spectrumnist) - Dreams
    // https://twitter.com/Spectrumnist/status/1245991328820776960
    PS::playMusicStream("music/dream.raw", 0);
}

void update(){
    stateMachine.update();
}
