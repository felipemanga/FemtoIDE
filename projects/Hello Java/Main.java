import femto.mode.HiRes16Color;
import femto.mode.LowRes16Color;
import femto.Game;
import femto.State;
import femto.input.Button;
import femto.palette.Psygnosia;
import femto.font.TIC80;
import femto.sound.Mixer;
import femto.sound.Procedural;

import images.Pattern;
import sprites.Dog;
import sounds.DogBark1;
import sounds.DogBark2;
import sounds.DogBark3;

class Main extends State {

    HiRes16Color screen; // the screenmode we want to draw with

    Procedural[] barks; // a collection of sounds to play
    Dog dog; // an animated sprite imported from Aseprite
    Pattern background; // static image
    float angle; // floats are actually FixedPoint (23.8)
    
    int counter; // variables are automatically initialized to 0 or null
    
    long timeToBark;

    // start the game using Main as the initial state
    // and TIC80 as the menu's font
    public static void main(String[] args){
        Mixer.init(); // Must initialize the mixer if you intend to play sound
        Game.run( TIC80.font(), new Main() );
    }
    
    // Avoid allocation in a State's constructor.
    // Allocate on init instead.
    void init(){
        screen = new HiRes16Color(Psygnosia.palette(), TIC80.font());
        
        barks = new Procedural[]{
            new DogBark1(),
            new DogBark2(),
            new DogBark3()
        };

        background = new Pattern();
        
        dog = new Dog();
        dog.run(); // "run" is one of the animations in the spritesheet
        
        timeToBark = System.currentTimeMillis() + Math.random(500, 2000);
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
        for( int y=0; y<screen.height(); y += background.height() ){
            for( int x=0; x<screen.width(); x += background.width() ){
                background.draw(screen, x, y);
            }
        }

        // Print some text
        counter++;
        String txt = ((counter>>5)&1) == 1 ? "ROOOUUUND" : "AND";
        screen.setTextPosition( screen.width()/2 - (screen.textWidth(txt)/2), screen.height()/2 );
        screen.textColor++;
        screen.print(txt);
        
        // Move and draw the dog
        float previousX = dog.x;
        angle += 0.03f;
        dog.x = 80 + Math.cos(angle) * 60.0f;
        dog.y = 44 + Math.sin(angle) * 50.0f;
        dog.setMirrored( previousX > dog.x );
        dog.draw(screen); // Animation is updated automatically

        if( timeToBark < System.currentTimeMillis() ){
            barks[ Math.random(0, barks.length) ].play(); // pick a random sound and play it
            timeToBark = System.currentTimeMillis() + Math.random(500, 5000);
        }

        // Update the screen with everything that was drawn
        screen.flush();
    }
    
}
