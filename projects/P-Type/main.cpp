#include "global.h"
#include <miloslav.h>

int main(){
    PC::begin();
    PD::loadRGBPalette(miloslav);
    PD::setFont(fontDonut);

    while( PC::isRunning() ){
        if( PC::update() )
            stateMachine.update();
    }
    
    return 0;
}
