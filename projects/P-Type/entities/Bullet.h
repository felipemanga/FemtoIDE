#pragma once

class Bullet : public Entity {
    int ticksToLive = -1;
    int deltaX;
    int deltaY;

public:
    int damage;

    void init(int damage, int x, int y, int dx, int dy, BulletSprite::Animation anim) {
        this->damage = damage;
        this->x = x;
        this->y = y;
        this->deltaX = dx;
        this->deltaY = dy;
        ticksToLive = 100;
        play(bulletSprite, anim);
        boundingBox.left = 3;
        boundingBox.right = 10;
        boundingBox.top = 3;
        boundingBox.bottom = 10;
    }

    void hit();

    bool isLive(){ return ticksToLive > 0; }

    void update(int32_t cameraX, int32_t cameraY) override {
        if(ticksToLive > 0){
            x += deltaX;
            y += deltaY;
            Entity::update(cameraX, cameraY);
            ticksToLive--;
        }
    }
};
