import femto.mode.HiRes16Color;
import femto.input.Button;
import femto.palette.Colodore;
import femto.font.Tiny;
import femto.font.Tic80;
import femto.font.Dragon;

public class Game {

    public static void main(String[] args){
        float previousX = 0, angle;
        int counter = 0;

        HiRes16Color screen = new HiRes16Color(Colodore.palette(), Dragon.font());

        Pattern background = new Pattern();
        
        Dog dog = new Dog();
        dog.setPosition(80, 80);
        dog.run();

        System.out.println("Hello, world!");
        
        while(true){
            screen.setTextPosition( 10, 10 );
            
            for( int y=0; y<176; y += background.height() ){
                for( int x=0; x<220; x += background.width() ){
                    background.draw(screen, x, y);
                }
            }
            
            angle += 0.03f;
            if( counter--<0 ){
                System.out.println(screen.fps());
                counter = 100;
            }
            
            previousX = dog.x;
            dog.x = 80 + Math.cos(angle) * 60.0f;
            dog.y = 44 + Math.sin(angle) * 50.0f;

            dog.setMirrored( previousX > dog.x );

            dog.draw(screen);
            
            screen.fillCircle( 110, 88, 10, 13 );
            screen.drawCircle( 110, 88, 10, 11 );

            screen.flush();
        }
    }
}
