package femto;

import femto.mode.ScreenMode;
import femto.input.Button;
import femto.input.ButtonListener;
import femto.mode.Direct;
import femto.Prompt;
import femto.hardware.LPC11U68;
import java.lang.Exception;
import femto.sound.Mixer;

class MenuState extends State {
    pointer font;
    State previous;
    
    MenuState( pointer font ){
        this.font = font;
    }
    
    void update(){
        Prompt prompt = new Prompt(
            null,
            font,
            Direct.rgb(0x10, 0x00, 0x10),
            0,
            Direct.rgb(0xE0, 0xA0, 0xD0)
        );
        prompt.party = true;
        
        prompt.options = new String[]{
            "Continue",
            "Change Game",
            "Volume",
            "Statistics"
        };
            
        switch( prompt.show() ){
        case 0: // Continue
            break;
            
        case 1: // Call Loader
            System.exit(0);
            
        case 2:
            volume( prompt );
            break;
            
        case 3:
            statistics( prompt );
            break;
            
        default:
            break;
        }
        
        Game.instance.state = Game.instance.nextState = previous;
        previous = null;
    }
    
    void statistics( Prompt prompt ){
        System.gc();
        int size;
        __inline_cpp__("size = uint32_t(&_codesize) / 1024");
        prompt.options = new String[]{
            "FPS: " + (64000.0f / ScreenMode.frameTime),
            "Total RAM: " + (Runtime.getRuntime().totalMemory() / 1024) + "KB",
            "Free RAM: " + (Runtime.getRuntime().freeMemory() / 1024) + "KB",
            "Code: " + size + "KB"
        };
        prompt.show();
    }

    void volume( Prompt prompt ){
        prompt.options = new String[]{"Off", "Low", "Medium", "Loud", "Very Loud"};
        int v = prompt.show();
        Mixer.setVolume(v);
    }
}

public class Game extends StateMachine {
    MenuState menuState;
    static Game instance;

    Game( pointer font, State initialState ){
        
        if( instance != null )
            throw new Exception();
        instance = this;
        
        Button.enableInterrupts();
        menuState = new MenuState(font);

        // Turn the Reset button into a regular input
        System.memory.STR( LPC11U68.PIO0_0, 0x81 );
        Button.Reset.attach(new ButtonListener(){
                void change(Button b){
                    if( instance.menuState.previous == null ){
                        State state = instance.getState();
                        if( state == instance.menuState )
                            return;
                        instance.menuState.previous = state;
                        instance.state = instance.nextState = instance.menuState;
                    }
                }
            });
        
        setState( initialState );
    }

    private static long lastUpdateTime;
    public static void limitFPS( int limit ){
        long later = lastUpdateTime + 1000;
        while( (lastUpdateTime = System.currentTimeMillis() * limit) < later );
    }

    public static void changeState( State s ){
        instance.setState(s);
    }

    public static void run( pointer font, State initial ){
        Game game = new Game( font, initial );
        while( true )
            game.update();
    }
}
