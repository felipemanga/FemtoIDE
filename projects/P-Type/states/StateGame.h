#pragma once

#include <Tilemap.hpp>

#include "entities/Player.h"
#include "entities/Bullet.h"
#include "entities/Enemy.h"

class StateGame : public State<StateGame> {
    int prevSpawnColumn = 0;

    inline static constexpr size_t enemyCount = 30;

    inline static constexpr size_t bulletCount = 20;

    inline static constexpr size_t totalEntityCount =
        1 + // Player
        bulletCount + // PlayerBullets
        bulletCount + // EnemyBullets
        enemyCount; // Enemies

    Entity *entities[totalEntityCount];
    Enemy enemy[enemyCount];
    Bullet playerBullet[bulletCount];
    Bullet enemyBullet[bulletCount];
    Player player;
    bool uidirty = true;
    int32_t frame = 0;
    Tilemap tilemap;
    Tilemap uimap;

    void initTilemap();
    void initEntities();

    Bullet *getFreeBullet(Bullet *bullets){
        for(int i = 0; i < bulletCount; ++i){
            if(!bullets[i].isLive())
                return &bullets[i];
        }
        return nullptr;
    }

    void spawnEnemy(int32_t x, int32_t y, EnemySprite::Animation anim);
    void spawnEnemies();
    void updateHUD();

public:
    float screenShake = 0;
    int32_t cameraX = 0;
    int32_t cameraY = 0;

    StateGame();
    void update();

    void dirty(){ uidirty = true; }

    Player& getPlayer(){ return player; }

    Bullet *getFreePlayerBullet(){
        return getFreeBullet(playerBullet);
    }

    Bullet *getFreeEnemyBullet(){
        return getFreeBullet(enemyBullet);
    }
};
