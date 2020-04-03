#pragma once

#include <sprites.h>

struct AABB {
    uint8_t left;
    uint8_t right;
    uint8_t top;
    uint8_t bottom;

    void init(Sprite& sprite){
        left = sprite.getFrameX();
        right = left + sprite.getFrameWidth();
        top = sprite.getFrameY();
        bottom = top + sprite.getFrameHeight();
    }

    void shrink(uint32_t amount){
        left += amount;
        right -= amount;
        top += amount;
        bottom -= amount;
    }
};

class Entity : public Sprite {
public:
    AABB boundingBox;
    int16_t x = 0;
    int16_t y = 0;
    uint8_t recolor = 0;
    bool mirror = false;
    bool flip = false;

    virtual void update(int32_t cameraX, int32_t cameraY) {
        draw(cameraX + x, cameraY + y, flip, mirror, recolor);
    }

    bool collidesWith(Entity &other){
        if(x + boundingBox.left > other.x + other.boundingBox.right)
            return false;
        if(x + boundingBox.right < other.x + other.boundingBox.left)
            return false;
        if(y + boundingBox.top > other.y + other.boundingBox.bottom)
            return false;
        if(y + boundingBox.bottom < other.y + other.boundingBox.top)
            return false;
        return true;
    }
};
