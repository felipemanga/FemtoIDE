#include <Pokitto.h>
#include <LibLog>
#include "Smile.h"

using PC=Pokitto::Core;
using PD=Pokitto::Display;
using PB=Pokitto::Buttons;

void init(){
    LOG("Hello World!\n");
    PD::persistence = true;
    PD::invisiblecolor = 0;
}

void update(){
    PD::drawBitmap(rand()%(PD::width-32), rand()%(PD::height-32), Smile);
}
