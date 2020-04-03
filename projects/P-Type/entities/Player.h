#pragma once

class Player : public Entity {
    int ticksSinceFire;

    int HP;
    int moveSpeed;
    int fireDelay;
    int fireSpeed;

    int bulletDmg;
    int bulletX;
    int bulletY;
    BulletSprite::Animation bulletAnim;

    void move();
    void fire();

public:
    Player();
    void update(int32_t cameraX, int32_t cameraY) override;
    void hit(int damage);
    int getHP(){ return HP; }
};
