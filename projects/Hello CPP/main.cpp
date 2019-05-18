#include "Pokitto.h"

int main(){
    using PC=Pokitto::Core;
    PC::begin();

    while( PC::isRunning() ){
        if( !PC::update() ) continue;
        
    }
    
    return 0;
}
