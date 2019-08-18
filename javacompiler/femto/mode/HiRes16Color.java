package femto.mode;
import femto.hardware.ST7775;
import java.util.Arrays;

public class HiRes16Color extends ScreenMode implements __stub__ {

    /// The screen buffer.
    public byte[] buffer;

    /// The screen mode's palette.
    public ushort[] palette;

    /// Constructs a `HiRes16Color` object with the corresponding palette `pal` and font `font`
    public HiRes16Color( pointer pal, pointer font ){
        this.font = font;
        buffer = new byte[(this.width()>>1)*this.height()];
        palette = new ushort[16];
        loadPalette( pal );
        clear(0);
        textRightLimit = width();
    }

    /// Loads the specified palette.
    public void loadPalette( pointer pal ){
        if( pal == null )
            return;
        int len = Math.min(16, System.memory.LDRH(pal));
        for( int i=0; i<len; ++i ){
            palette[i] = System.memory.LDRH(pal+2+(i<<1));
        }
    }

    /// @copydoc ScreenMode::width()
    public int width(){
        return 220;
    }

    /// @copydoc ScreenMode::height()
    public int height(){
        return 176;
    }

    /// Fills the entire screen with the specified color.
    public void clear( int color ){}

    public void setPixel(uint x, uint y, int color){
        if( y >= (uint) 176 || x >= (uint) 220 )
            return;
        uint i = y*((uint)110) + (x>>(uint)1);
        int pixel = buffer[i];
        color &= 0xF;
        if ( ((int)x & 1) != 0 ) pixel = (pixel & 0xF0) | color;
        else pixel = (pixel&0x0F) | (color * 16);
        buffer[i] = pixel;
    }    

    public void drawHLine(int x, int y, int w, int color){}
    public void drawVLine(int x, int y, int h, int color){}

    private void beforeFlush(){
        ST7775.beginStream();
    }

    /// @copydoc ScreenMode::flush()
    public void flush(){}

}

