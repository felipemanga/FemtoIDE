import femto.mode.HiRes16Color;
import femto.input.Button;
import femto.palette.Colodore;
import femto.font.Tiny;
import femto.font.Tic80;
import femto.font.Dragon;
import java.lang.Math;

public class Game {

    public static void main(String[] args){
        HiRes16Color screen = new HiRes16Color(Dragon.data());
        Colodore.applyTo( screen );

        Dog dog = new Dog();

        dog.x = 80;
        dog.y = 80;
        float sx = 0, sy = 0;
        float counter = 0.0f;
        dog.run();
        while(true){
            counter += 0.01f;

            screen.clear( 0x44 );
            screen.textX = 10;
            screen.textY = 10;
            // screen.print(String.valueOf(screen.fps()) );
            screen.print(screen.fps());

            if( dog.x > 110 ) sx -= 0.5;
            else sx += 0.6;
            if( dog.y > 88 ) sy -= 0.7;
            else sy += 0.8;

            dog.mirror = sx < 0;
            // dog.flip = sy < 0;
            dog.x += sx*0.1; // dog.y += sy*0.1;
            dog.y = Math.sin( counter ) * 50.0f + 88.0f;
            dog.draw(screen);
            
            screen.flush();
        }
    }
}
