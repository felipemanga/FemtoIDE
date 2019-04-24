package femto;

public class StateMachine {
    State state, nextState;

    public StateMachine( ){
        state = null;
        nextState = null;
    }
    
    public void setState( State nextState ){
        this.nextState = nextState;
    }

    public void update(){
        if( nextState != state ){
            nextState.preinit();
            if( state )
                state.shutdown();
            state = nextState;
            state.init();
        }
        state.update();
    }

}

