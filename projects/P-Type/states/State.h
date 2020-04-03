#pragma once

#include <StateMachine.h>
#include "StateIntro.h"
#include "StateGame.h"
#include "StateGameOver.h"

inline StateMachine<
    StateIntro,
    StateGame,
    StateGameOver
> stateMachine;

template<typename DerivedType>
DerivedType& State<DerivedType>::get() {
    return stateMachine.getState<DerivedType>();
}
