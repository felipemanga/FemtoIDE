import femto.mode.HiRes16Color;
import femto.input.Button;
import femto.font.TIC80;
import femto.palette.Colodore;

public class Game {

    public static void main(String[] args){
        HiRes16Color screen = new HiRes16Color(Colodore.palette(),TIC80.font());
        
        Dog dog = new Dog();

        dog.x = 80;
        dog.y = 80;
        float sx = 0, sy = 0;
        int counter = 0;
        dog.run();
        while(true){

            screen.clear( 0x44 );
            screen.textX = 10;
            screen.textY = 10;
            screen.print(screen.fps());

            if( dog.x > 110 ) sx -= 0.5;
            else sx += 0.6;
            if( dog.y > 88 ) sy -= 0.7;
            else sy += 0.8;

            dog.setMirrored( sx < 0 );
            dog.setFlipped( sy < 0 );
            
            dog.x += sx*0.1; dog.y += sy*0.1;
            dog.draw(screen);
            
            screen.flush();
        }
    }
}
