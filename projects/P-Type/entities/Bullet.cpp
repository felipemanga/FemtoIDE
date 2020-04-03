#include <global.h>

void Bullet::hit() {
    ticksToLive = 0;
    StateGame::get().screenShake += 2.0f;
}
