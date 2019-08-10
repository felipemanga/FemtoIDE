# Pokitto intervalometer {#intervalometer}

A quick and simple intervalometer for taking photos with DSLRs.
Also serves as an example of most of the FemtoLib API.

## Main.java:

```java
import femto.mode.HiRes16Color;
import femto.Game;
import femto.State;
import femto.input.Button;
import femto.Image;
import femto.palette.Psygnosia;
import femto.font.TIC80;
import static femto.hardware.EXT.*;
import Bg;

public class Shoot extends State {
    long endTime;
    void init(){
        Main.drawUI("Shoot");
        Main.screen.print("Capturing image...");
        Main.screen.flush();
        endTime = System.currentTimeMillis() + (long) Main.exposureTime;
        PIN17.pullUp();
        PIN17.setInput();
    }
    
    void shutdown(){
        PIN17.pullDown();
        PIN17.setInput();
    }
    
    void update(){
        int timeLeft = (int) (endTime - System.currentTimeMillis());
        if( timeLeft < 0 ){
            Main.remaining--;
            if( Main.remaining > 0 )
                Game.changeState(new Interval());
            else
                Game.changeState(new Main());
            return;
        }
    }
}

public class Interval extends State {
    long endTime;
    void init(){
        endTime = System.currentTimeMillis() + (long) Main.intervalTime * 1000;
    }
    
    void update(){
        int timeLeft = (int) (endTime - System.currentTimeMillis());
        if( timeLeft < 0 ){
            Game.changeState(new Shoot());
            return;
        }
        
        timeLeft /= 1000;
        
        if( Button.B.justPressed() ){
            Game.changeState(new Main());
            return;
        }
        
        var screen = Main.screen;
        Main.drawUI("Delay");
        screen.print("Waiting for\n        ");
        screen.textColor = Main.value;
        int minutes = timeLeft / 60;
        int seconds = timeLeft % 60;
        screen.print(minutes);
        screen.print("m ");
        screen.print(seconds);
        screen.print("s\n\n");

        screen.textColor = Main.caption;
        screen.print("Press B to cancel\n        ");
        
        screen.flush();
    }
}

public class Wait extends State {
    long endTime;
    void init(){
        endTime = System.currentTimeMillis() + (long) Main.waitTime * 1000;
    }
    
    void update(){
        int timeLeft = (int) (endTime - System.currentTimeMillis());
        if( timeLeft < 0 ){
            Game.changeState(new Shoot());
            return;
        }
        
        timeLeft /= 1000;
        
        if( Button.B.justPressed() ){
            Game.changeState(new Main());
            return;
        }
        
        var screen = Main.screen;
        Main.drawUI("Wait");
        screen.print("Waiting for\n        ");
        screen.textColor = Main.value;
        int minutes = timeLeft / 60;
        int seconds = timeLeft % 60;
        screen.print(minutes);
        screen.print("m ");
        screen.print(seconds);
        screen.print("s\n\n");

        screen.textColor = Main.caption;
        screen.print("Press B to cancel\n        ");
        
        screen.flush();
    }
}

public class Main extends State {

    static final HiRes16Color screen = new HiRes16Color(Psygnosia.palette(), TIC80.font());
    static int remaining = 0;
    static int waitTime = 5;
    static int exposureTime = 10; // milliseconds
    static int intervalTime = 10;
    static Image background = new Bg();    

    static final int caption = 13;
    static final int value = 12;

    int option;

    public static void main(String[] args){
        PIN17.pullDown();
        PIN17.setInput();
        Game.run( TIC80.font(), new Main() );
    }
    
    void init(){
        option = 0;
        remaining = 1;
    }
    
    static void drawUI(String name){
        background.draw(screen, 0, 0);
        screen.textColor = 4;
        screen.setTextPosition( 170, 9 );
        screen.print(name);
        screen.textLeftLimit = 10;
        screen.textRightLimit = 210;
        screen.lineSpacing = 2;
        screen.setTextPosition(10, 26);
    }

    void update(){
        drawUI("Setup");

        screen.fillRect(9, 25+option*screen.textHeight()*3, 203, screen.textHeight()*3, 5);

        screen.textColor = caption;
        screen.print("Wait\n        ");
        screen.textColor = value;
        int minutes = waitTime / 60;
        int seconds = waitTime % 60;
        screen.print(minutes);
        screen.print("m ");
        screen.print(seconds);
        screen.print("s\n\n");
        
        screen.textColor = caption;
        screen.print("then take\n        ");
        screen.textColor = value;
        screen.print(remaining);
        screen.print(remaining == 1 ? " photo\n\n" : " photos\n\n");
        
        screen.textColor = caption;
        screen.print("with an exposure time of\n        ");
        screen.textColor = value;
        minutes = exposureTime / 60000;
        seconds = (exposureTime / 1000) % 60;
        int milli = exposureTime % 1000;
        screen.print(minutes);
        screen.print("m ");
        screen.print(seconds);
        screen.print("s ");
        screen.print(milli);
        screen.print("ms\n\n");

        screen.textColor = caption;
        screen.print("and an interval of\n        ");
        screen.textColor = value;
        minutes = intervalTime / 60;
        seconds = intervalTime % 60;
        screen.print(minutes);
        screen.print("m ");
        screen.print(seconds);
        screen.print("s\n\n");
        
        screen.textColor = caption;
        screen.print("Start");

        if( Button.Down.justPressed() ){
            option++;
            if( option > 4 )
                option = 0;
        }
        if( Button.Up.justPressed() ){
            option--;
            if( option < 0 )
                option = 4;
        }
        int delta = 0;
        if( Button.Left.justPressed() ){
            delta = -1;
        }else if( Button.Right.justPressed() ){
            delta = 1;
        }
        if( delta != 0 ){
            if( Button.A.isPressed() ) delta *= 10;
            if( Button.B.isPressed() ) delta *= 60;
            switch( option ){
                case 0: waitTime = Math.max(0, waitTime + delta); break;
                case 1: remaining = Math.max(0, remaining + delta); break;
                case 2: exposureTime = Math.max(0, exposureTime + delta); break;
                case 3: intervalTime = Math.max(0, intervalTime + delta); break;
                case 4: break;
            }
        }
        if( (Button.A.justPressed() && option == 4) || Button.C.justPressed() )
            Game.changeState( new Wait() );

        screen.flush();
    }
    
}
```