import femto.mode.HiRes16Color;
import femto.Game;
import femto.State;
import femto.input.Button;
import femto.palette.Psygnosia;
import femto.font.TIC80;

class Main extends State {

    HiRes16Color screen; // the screenmode we want to draw with

    Dog dog; // an animated sprite imported from Aseprite
    Pattern background; // static image
    float angle; // floats are actually FixedPoint (23.8)
    
    int counter; // variables are automatically initialized to 0 or null

    // start the game using Main as the initial state
    // and TIC80 as the menu's font
    public static void main(String[] args){
        Game.run( TIC80.font(), new Main() );
    }
    
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
    
    // update is called by femto.Game every frame
    void update(){
        
        // Change to a new state when A is pressed
        if( Button.A.justPressed() )
            Game.changeState( new Main() );

        // Fill the screen using Pattern.png
        for( int y=0; y<176; y += background.height() ){
            for( int x=0; x<220; x += background.width() ){
                background.draw(screen, x, y);
            }
        }

        // Print some text
        counter++;
        screen.setTextPosition( 100, 84 );
        screen.textColor++;
        screen.print((counter>>5)&1 ? "ROUND" : "AND");
        
        // Move and draw the dog
        float previousX = dog.x;
        angle += 0.03f;
        dog.x = 80 + Math.cos(angle) * 60.0f;
        dog.y = 44 + Math.sin(angle) * 50.0f;
        dog.setMirrored( previousX > dog.x );
        dog.draw(screen); // Animation is updated automatically
        
        // Update the screen with everything that was drawn
        screen.flush();
    }
    
}
