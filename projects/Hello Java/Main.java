import femto.mode.HiRes16Color;
import femto.Game;
import femto.State;
import femto.input.Button;
import femto.palette.Psygnosia;
import femto.font.TIC80;

class Level1 extends State {

    HiRes16Color screen; // the screenmode we want to draw with

    Dog dog; // an animated sprite imported from Aseprite
    Pattern background; // static image
    
    float angle; // floats are actually FixedPoint (23.8)
    int counter; // variables are automatically initialized to 0 or null
    
    // Avoid allocation in a State's constructor.
    // Allocate on init instead.
    void init(){
        screen = new HiRes16Color(Psygnosia.palette(), TIC80.font());
        background = new Pattern();
        dog = new Dog();
        dog.run(); // "run" is one of the animations in the spritesheet
    }
    
    // Might help in certain situations
    void shutdown(){
        screen = null;
    }
    
    // called by femto.Game for every frame
    void update(){
        
        for( int y=0; y<176; y += background.height() ){
            for( int x=0; x<220; x += background.width() ){
                background.draw(screen, x, y);
            }
        }
        
        if( Button.A.isPressed() ){
            while( Button.A.isPressed() );
            Game.changeState( new Level1() );
        }
        
        screen.setTextPosition( 100, 84 );
        counter++;
        screen.print((counter>>5)&1 ? "ROUND" : "AND");
        
        angle += 0.03f;
        
        float previousX = dog.x;
        dog.x = 80 + Math.cos(angle) * 60.0f;
        dog.y = 44 + Math.sin(angle) * 50.0f;

        dog.setMirrored( previousX > dog.x );
        
        dog.draw(screen);
        
        screen.flush();
    }
    
}

public class Main {
    public static void main(String[] args){
        Game.run( TIC80.font(), new Level1() );
    }
}
