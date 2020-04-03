#pragma once
#include <Tilemap.hpp>

class StateGameOver : public State<StateGameOver> {
    Entity head[4];
    Entity start;

    bool debounce = false;
    Tilemap tilemap;
    uint8_t map[14*11] = {};
    uint32_t time = 0;

    void updateMap();

public:
    StateGameOver();
    void update();
};
