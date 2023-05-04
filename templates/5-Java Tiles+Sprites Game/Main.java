import femto.Game;
import femto.State;
import femto.font.TIC80;
import femto.input.Button;
import femto.mode.TASMode;
import femto.palette.Miloslav;

import sprites.Dude;

class Main extends State {
    
    // The screen mode for the game.
    TASMode screen;
    
    // A sprite
    Dude dude;
    
    int x, y;
    
    public static void main(String[] args){
        Game.run( TIC80.font(), new Main() );
    }
    
    void init(){
        screen = new TASMode(Miloslav.palette(), TIC80.font());
        
        dude = new Dude();
        
        // Set the background map. It draws by default.
        screen.setBGMap(TileMaps.getGardenPath(), TileMaps.getTiles());
    }
    
    // Might help in certain situations
    void shutdown(){
        screen = null;
    }

    void update(){
        // Move our guy
        if( Button.Left.isPressed() ) {
            dude.walkW();
            x -= 1;    
        } else if( Button.Up.isPressed() ) {
            dude.walkN();
            y -= 1;    
        } else if( Button.Right.isPressed() ) {
            dude.walkE();
            x += 1;    
        } else if( Button.Down.isPressed() ) {
            dude.walkS();
            y += 1;
        }
        
        
        dude.draw(screen, x, y);
        screen.flush();
    }
    
}
