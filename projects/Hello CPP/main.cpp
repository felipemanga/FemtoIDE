#include "Pokitto.h"

#include "Smile.h"

int main(){
    using PC=Pokitto::Core;
    using PD=Pokitto::Display;
    PC::begin();
    PD::persistence = true;
    PD::invisiblecolor = 0;
    
    while( PC::isRunning() ){
        if( !PC::update() ) 
            continue;
        PD::drawBitmap(rand()%(PD::width-32), rand()%(PD::height-32), Smile);
    }
    
    return 0;
}
