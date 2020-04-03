#pragma once
#include <Tilemap.hpp>

class StateIntro : public State<StateIntro> {
    Entity head[4];
    Entity start;

    uint32_t selection = 0;
    bool debounce = false;
    Tilemap tilemap;
    uint8_t map[14*11] = {};
    uint32_t time = 0;

    void updateMap();

public:
    StateIntro();
    void update();
};
