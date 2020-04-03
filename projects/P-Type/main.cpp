#include "global.h"
#include <miloslav.h>

int main(){
    PC::begin();
    PD::loadRGBPalette(miloslav);
    PD::enableDirectPrinting(true);
    PD::setCursor(0, 0);
    PD::setTASRowMask(0b1111'11111111'11111111);

    while( PC::isRunning() ){
        if( PC::update() )
            stateMachine.update();
    }
    
    return 0;
}
