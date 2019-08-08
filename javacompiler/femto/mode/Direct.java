package femto.mode;

import java.util.Arrays;
import static femto.hardware.ST7775.*;

public class Direct extends ScreenMode implements __stub__ {

    /// Constructs a `Direct` object with the corresponding `font`
    public Direct( pointer font ){
        this.font = font;
        textRightLimit = width();
    }

    /// @copydoc ScreenMode::width()
    public uint width(){
        return 220;
    }

    /// @copydoc ScreenMode::height()
    public uint height(){
        return 176;
    }

    /// Packs the specified RGB888 triple into a packed RGB565 value.
    public static int rgb( ubyte r, ubyte g, ubyte b ){
        return (((int)(r>>3))<<11)
            | (((int)(g>>2))<<5)
            | ((int)(b>>3));
    }

    /// Fills the entire screen with the specified color.
    public void clear( int color ){
        beginStream();
        writeData(color);
        for( int i=1; i<220*176; ++i ){
            toggle();
        }
    }
    
    public void setPixel(uint x, uint y, int color){
        if( x >= 220 || y >= 176 )
            return;
        setX(x);
        setY(y);
        beginStream();
        writeData(color);
        setX(0);
        setY(0);
    }
    
    public void drawHLine(int x, int y, int w, int color){
        if( x < 0 ){
            w -= x;
            x = 0;
        }
        
        if( x+w >= 220 )
            w = 220 - x;
        
        if( y < 0 || y >= 176 || x >= 220 || w <= 0 )
            return;

        setX(x);
        setY(y);
        beginStream();
        writeData(color);
        while( --w ){
            toggle();
        }
        
        setX(0);
        setY(0);
        
    }

    public void drawVLine(int x, int y, int h, int color){
        if( y < 0 ){
            h -= y;
            y = 0;
        }
        
        if( y+h >= 176 )
            h = 176 - y;
        
        if( x < 0 || x >= 220 || y >= 176 || h <= 0 )
            return;

        while( h ){
            setX(x);
            setY(y++);
            beginStream();
            writeData(color);
            h--;
        }
        
        setX(0);
        setY(0);
        
    }

}

