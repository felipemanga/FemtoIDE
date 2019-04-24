package femto;

public class Game extends StateMachine {
    
    Game( State state ){
        setState( state );
    }
    
    public static void run( State initial ){
        Game game = new Game( initial );
        while( true )
            game.update();
    }
}
