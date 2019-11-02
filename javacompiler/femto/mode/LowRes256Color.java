package femto.mode;
import femto.hardware.ST7775;
import java.util.Arrays;

public class LowRes256Color extends ScreenMode implements __stub__ {

    /// The screen buffer.
    public byte[] buffer;

    /// The screen mode's palette.
    public ushort[] palette;

    protected LowRes256Color(){}

    /// Constructs a `LowRes256Color` object with the corresponding palette `pal` and font `font`
    public LowRes256Color( pointer pal, pointer font ){
        initialize( pal, font );
    }

    protected void initialize( pointer pal, pointer font ){
        this.font = font;
        buffer = new byte[this.width()*this.height()];
        palette = new ushort[256];
        loadPalette( pal );
        clear(0);
        textRightLimit = width();
    }

    /// Loads the specified palette.
    public void loadPalette( pointer pal ){
        if( pal == null )
            return;
        int len = Math.min(256, (int) System.memory.LDRH(pal));
        for( int i=0; i<len; ++i ){
            palette[i] = System.memory.LDRH(pal+2+(i<<1));
        }
    }

    /// @copydoc ScreenMode::width()
    public int width(){
        return 220>>1;
    }

    /// @copydoc ScreenMode::height()
    public int height(){
        return 176>>1;
    }

    /// Fills the entire screen with the specified color.
    public void clear( int color ){}

    public void setPixel(uint x, uint y, int color){
        if( y >= (uint) (176>>1) || x >= (uint) (220>>1) )
            return;
        uint i = y * 110 + x;
        int pixel = buffer[i];
        color &= 0xFF;
        buffer[i] = pixel;
    }    

    public int getPixel(uint x, uint y){
        if( y >= (uint) (176>>1) || x >= (uint) (220>>1) )
            return -1;
        uint i = y * 110 + x;
        return buffer[i];
    }

    public void drawHLine(int x, int y, int w, int color){}
    public void drawVLine(int x, int y, int h, int color){}

    private void beforeFlush(){
        ST7775.beginStream();
    }

    /// @copydoc ScreenMode::flush()
    public void flush(){}

}

