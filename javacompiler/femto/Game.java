package femto;

import femto.input.Button;
import femto.input.ButtonListener;

class MenuState extends State {
    update(){
        Direct = new femto.mode.Direct();
        
    }
}

public class Game extends StateMachine {
    State menuState, prevState;
    
    Game( State state ){
        Button.enableInterrupts();
        
        Button.Reset.attach(new ButtonListener(){
                void change(Button b){
                    if( getState() == menuState )
                        return;
                    prevState = this.state;
                    this.state = this.nextState = menuState;
                }
            });
        
        setState( state );
    }
    
    public static void run( State initial ){
        Game game = new Game( initial );
        while( true )
            game.update();
    }
}
