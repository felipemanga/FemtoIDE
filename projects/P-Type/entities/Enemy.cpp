#include "global.h"
#include "sfx/Boop.h"

void Enemy::updateKaren(){
    if(ticksSinceAction < 30)
        return;

    auto &game = StateGame::get();
    Bullet *bullet = game.getFreeEnemyBullet();
    if(!bullet)
        return;

    ticksSinceAction = 0;

    bullet->init(
        10,
        x,
        y,
        -3,
        (rand()&3) - 1,
        BulletSprite::Bagel
        );

    bullet->recolor = 5;
}

void Enemy::hit(int damage){
    PS::playSFX(Boop, sizeof(Boop));
    HP -= damage;
}

void Enemy::updateBob(){
    float moveX = cos(ticksSinceAction * 0.05) * 3.0f;
    x += moveX;
    mirror = moveX > 0;
    y = spawnY + abs(sin(ticksSinceAction * 0.2f) * 5.0f);
}

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

    ticksSinceAction++;
    switch(animation){
    case EnemySprite::Karen:
        updateKaren();
        break;
    case EnemySprite::Bob:
        updateBob();
        break;
    }

    Entity::update(cameraX, cameraY);
}
