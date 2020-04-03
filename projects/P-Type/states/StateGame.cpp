#include <global.h>
#include <maps.h>

StateGame::StateGame(){
    initTilemap();
    initEntities();
}

void StateGame::initEntities(){
    int id = 0;
    entities[id++] = &player;
    for(int i = 0; i < bulletCount; ++i) {
        entities[id++] = &playerBullet[i];
        entities[id++] = &enemyBullet[i];
    }
    for(int i = 0; i < enemyCount; ++i) {
        entities[id++] = &enemy[i];
    }
}

void StateGame::initTilemap(){
    tilemap.fillOutOfBounds = -1;
    tilemap.set(Level1[0], Level1[1], Level1+2);
    for(int i = 0; i < sizeof(tiles)/(POK_TILE_W*POK_TILE_H); i++){
        tilemap
            .setTile(i, POK_TILE_W, POK_TILE_H, tiles+i*POK_TILE_W*POK_TILE_H);
    }
}

void StateGame::spawnEnemy(int32_t x, int32_t y, EnemySprite::Animation anim){
    for(int i = 0; i < enemyCount; ++i){
        if(!enemy[i].isLive()){
            enemy[i].spawn(x * POK_TILE_W, y * POK_TILE_H, anim);
            return;
        }
    }
}

void StateGame::spawnEnemies(){
    int spawnColumn = (-cameraX + PROJ_LCDWIDTH) / POK_TILE_W;
    if(spawnColumn == prevSpawnColumn){
        return;
    }
    prevSpawnColumn = spawnColumn;

    for(int y = 0; y < Level1[1]; ++y){
        auto tile = Level1Enum(spawnColumn, y);
        if(tile&Karen)
            spawnEnemy(spawnColumn, y, EnemySprite::Karen);
        if(tile&Bob)
            spawnEnemy(spawnColumn, y, EnemySprite::Bob);
    }
}

void StateGame::update(){
    frame++;
    if(PROJ_LCDWIDTH - cameraX >= Level1[0] * POK_TILE_W){
        stateMachine.setState<StateIntro>();
        return;
    }

    int shakeX = cos(frame) * screenShake;
    int shakeY = sin(frame) * screenShake;
    screenShake *= 0.75f;

    cameraX--;
    tilemap.draw(cameraX + shakeX, cameraY + shakeY);

    spawnEnemies();

    for(int i = 0; i < bulletCount; ++i){
        {
            auto& current = playerBullet[i];
            if(current.isLive()){
                for(int e = 0; e < enemyCount; ++e){
                    auto& enemy = this->enemy[e];
                    if(!enemy.isLive() || !current.collidesWith(enemy))
                        continue;
                    enemy.hit(current.damage);
                    current.hit();
                    break;
                }
            }
        }

        {
            auto& current = enemyBullet[i];
            if(current.isLive() && current.collidesWith(player)){
                player.hit(current.damage);
                current.hit();
            }
        }
    }

    Entity *next;
    for(int i = 0; i < totalEntityCount - 1; ++i){
        Entity *current = entities[i];
        next = entities[i+1];

        if(current->y > next->y){
            entities[i] = next;
            entities[i+1] = current;
            current = next;
            next = entities[i+1];
        }

        current->update(cameraX + shakeX, cameraY + shakeY);
    }

    next->update(cameraX + shakeX, cameraY + shakeY);
}
