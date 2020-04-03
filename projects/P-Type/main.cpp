#include "global.h"
#include <miloslav.h>

int main(){
    PC::begin();
    PD::loadRGBPalette(miloslav);
    PD::setFont(fontDonut);
    
    // Eric Atwell (@Spectrumnist) - Dreams
    // https://twitter.com/Spectrumnist/status/1245991328820776960
    PS::playMusicStream("music/dream.raw", 0);

    while( PC::isRunning() ){
        if( PC::update() )
            stateMachine.update();
    }
    
    return 0;
}
