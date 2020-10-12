#include "Pokitto.h"
#include "Smile.h"

using PC = Pokitto::Core;
using PD = Pokitto::Display;

void init() {
    PD::persistence = true;
    PD::invisiblecolor = 0;
}

void update() {
    PD::drawBitmap(rand() % (PD::width - 32), rand() % (PD::height - 32), Smile);
}