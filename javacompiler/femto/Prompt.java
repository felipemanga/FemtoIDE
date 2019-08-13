package femto;

import femto.mode.Direct;
import femto.input.Button;

public class Prompt {
    pointer font;
    int bg, fg, highlight;
    public boolean party;
    public String[] options;
    
    Prompt( String[] options, pointer font, int bg, int fg, int highlight ){
        this.options = options;
        this.font = font;
        this.bg = bg;
        this.fg = fg;
        this.highlight = highlight;
        party = false;
    }
    
    int show(){
        Direct direct = new Direct(font);
        int selection = 0;
        int bg = direct.rgb(0x10, 0x00, 0x10);
        int highlight = direct.rgb(0xE0, 0xA0, 0xD0);
        direct.textColor = this.fg;
        
        int r = Math.random(0, 255);
        int g = Math.random(0, 255);
        int b = Math.random(0, 255);
        int rd = Math.random(-5, 5);
        int gd = Math.random(-5, 5);
        int bd = Math.random(-5, 5);

        int menuW = 120, menuH = options.length*direct.textHeight()+2;
        int menuX = 110 - (menuW>>1), menuY = 88 - (menuH>>1);

        direct.textLeftLimit = menuX+5;
        direct.textRightLimit = menuX+menuW-10;

        boolean clear = true;
        Button ignore;
        
        while(true){
            if( clear ){
                int selectionY = menuY+1+selection*direct.textHeight();
                
                direct.fillRect( menuX, menuY, menuW, menuH, bg);
                direct.fillRect( 
                    menuX+2, 
                    selectionY+1, 
                    menuW-4,
                    direct.textHeight()-2,
                    highlight
                    );
                direct.drawHLine(
                    menuX+3,
                    selectionY,
                    menuW-6,
                    highlight
                    );
                direct.drawHLine(
                    menuX+3,
                    selectionY+direct.textHeight()-1,
                    menuW-6,
                    highlight
                    );
                clear = false;
            }
            
            if( ignore == null || !ignore.isPressed() ){
                if( ignore == Button.A ){
                    return selection;
                }
                
                ignore = null;
            
                if( Button.Up.isPressed() ){
                    clear = true;
                    ignore = Button.Up;
                    selection--;
                    if( selection < 0 ) selection = options.length-1;
                }else if( Button.Down.isPressed() ){
                    clear = true;
                    ignore = Button.Down;
                    selection++;
                    if( selection >= options.length ) selection = 0;
                }else if( Button.A.isPressed() ){
                    clear = true;
                    ignore = Button.A;
                }
            }
            
            if( party ){
                r += rd; g += gd; b += bd;
                if( r > 255 && rd > 0 ){
                    rd = Math.random(-5, -1);
                    r = 255;
                }else if( r < 0 && rd < 0 ){
                    r = 0;
                    rd = Math.random(1, 5);
                }
                if( g > 255 && gd > 0 ){
                    gd = Math.random(-5, -1);
                    g = 255;
                }else if( g < 0 && gd < 0 ){
                    g = 0;
                    gd = Math.random(1, 5);
                }
                if( b > 255 && bd > 0 ){
                    bd = Math.random(-5, -1);
                    b = 255;
                }else if( b < 0 && bd < 0 ){
                    b = 0;
                    bd = Math.random(1, 5);
                }
                
                direct.textColor = direct.rgb((ubyte)r, (ubyte)g, (ubyte)b);
            }
            
            direct.drawRect( menuX-1, menuY-1, menuW+1, menuH+1, direct.textColor );

            direct.setTextPosition(menuX+5, menuY+2);
            for( String option : options )
                direct.println(option);
        }
        
    }    
}
