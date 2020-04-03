#include "global.h"

void Enemy::update(int32_t cameraX, int32_t cameraY){
    if(HP <= 0)
        return;

    if(cameraX + this->x < -32){
        HP = 0;
        return;
    }

    auto& player = StateGame::get().getPlayer();
    if( collidesWith(player) ){
        player.hit(HP);
        HP = 0;
        return;
    }

    Entity::update(cameraX, cameraY);
}
