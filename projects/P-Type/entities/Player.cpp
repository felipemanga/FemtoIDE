#include <global.h>
#include <algorithm>

Player::Player(){
    x = 32;
    y = PROJ_LCDHEIGHT / 2 - 16;
    play(ships, shared::playerAnim);
    boundingBox.init(*this);
    boundingBox.shrink(2);

    switch(shared::playerAnim){
    case Ships::Diesel:
        HP = 60;
        moveSpeed = 3;
        fireDelay = 4;
        fireSpeed = 6;
        bulletAnim = BulletSprite::Diesel;
        bulletDmg = 10;
        bulletX = 29;
        bulletY = 12;
        break;

    case Ships::Bagel:
        HP = 100;
        moveSpeed = 2;
        fireDelay = 3;
        fireSpeed = 3;
        bulletAnim = BulletSprite::Bagel;
        bulletDmg = 20;
        bulletX = 29;
        bulletY = 12;
        break;

    case Ships::Punk:
        HP = 50;
        moveSpeed = 3;
        fireDelay = 6;
        fireSpeed = 4;
        bulletAnim = BulletSprite::Punk;
        bulletDmg = 30;
        bulletX = 29;
        bulletY = 12;
        break;

    case Ships::Cyber:
        HP = 20;
        moveSpeed = 4;
        fireDelay = 10;
        fireSpeed = 8;
        bulletAnim = BulletSprite::Cyber;
        bulletDmg = 40;
        bulletX = 29;
        bulletY = 12;
        break;
    }
}

void Player::hit(int damage){
    auto &game = StateGame::get();
    game.screenShake += 5;
    game.dirty();
    HP -= damage;
    if(HP < 0){
        stateMachine.setState<StateGameOver>();
    }
}

void Player::fire(){
    ticksSinceFire++;

    if(!PB::aBtn() || ticksSinceFire < fireDelay)
        return;

    auto& game = StateGame::get();
    Bullet *bullet = game.getFreePlayerBullet();
    if(!bullet)
        return;

    ticksSinceFire = 0;

    bullet->init(
        bulletDmg,
        x + bulletX,
        y + bulletY,
        fireSpeed,
        animation == Ships::Bagel ? (rand()&7) - 2 : 0,
        bulletAnim
        );
}

void Player::move(){
    if(PB::upBtn()){
        y -= moveSpeed;
    } else if(PB::downBtn()){
        y += moveSpeed;
    }

    if(PB::leftBtn()){
        x -= moveSpeed;
    } else if(PB::rightBtn()){
        x += moveSpeed + 1;
    }

    auto& game = StateGame::get();
    y = std::clamp<int>(y,
                        -game.cameraY + 16,
                        -game.cameraY + PROJ_LCDHEIGHT - 32 - 16 * 3);

    x = std::clamp<int>(x,
                        -game.cameraX + 0,
                        -game.cameraX + PROJ_LCDWIDTH - 32);
}

void Player::update(int32_t cameraX, int32_t cameraY){
    move();
    fire();

    Entity::update(cameraX, cameraY);
}
