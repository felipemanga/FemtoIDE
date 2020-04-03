#pragma once

class Enemy : public Entity {
    void updateKaren();
    void updateBob();
    int ticksSinceAction;
    int spawnY;

public:
    int HP = 0;

    Enemy() = default;

    bool isLive(){ return HP > 0; }

    void spawn(int32_t x, int32_t y, EnemySprite::Animation anim){
        play(enemySprite, anim);
        boundingBox.init(*this);
        boundingBox.shrink(2);

        this->x = x;
        this->y = y;
        this->spawnY = y;
        ticksSinceAction = 0;
        mirror = false;

        switch(anim){
        case EnemySprite::Karen:
            HP = 50;
            break;
        case EnemySprite::Bob:
            HP = 20;
            break;
        }
    }

    void hit(int damage);

    void update(int32_t cameraX, int32_t cameraY) override;
};
