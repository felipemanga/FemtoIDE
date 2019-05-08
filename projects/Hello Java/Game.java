import femto.mode.HiRes16Color;
import femto.input.Button;
import femto.palette.Colodore;
import femto.font.Tiny;
import femto.font.Tic80;
import femto.font.Dragon;

public class Game {

    public static void main(String[] args){
        HiRes16Color screen = new HiRes16Color(Dragon.data());
        Colodore.applyTo( screen );
        Pattern pat = new Pattern();
        
        Dog dog = new Dog();

        dog.x = 80;
        dog.y = 80;
        float sx = 0, sy = 0, a = 0;
        int counter = 0;
        dog.run();
        System.out.println("Oh, hi!");
        int fc = 100;
        while(true){
            a += 0.03f;
            // screen.clear( 0x44 );
            screen.textX = 10;
            screen.textY = 10;
            
            for( int y=0; y<176; y += pat.height() ){
                for( int x=0; x<220; x += pat.width() ){
                    pat.draw(screen, x, y);
                }
            }
            
            if( fc--<0 ){
                System.out.println(screen.fps());
                fc = 100;
            }
            
            sx = dog.x;
            dog.x = 80 + Math.cos(a) * 60.0f;
            dog.y = 44 + Math.sin(a) * 50.0f;

            dog.setMirrored( sx > dog.x );

            dog.draw(screen);
            
            screen.flush();
        }
    }
}
