package femto.mode;

public class LowRes16Color extends HiRes16Color implements __stub__ {

    /// Constructs a `LowRes16Color` object with the corresponding palette `pal` and font `font`
    public LowRes16Color( pointer pal, pointer font ){
        super();
        initialize( pal, font );
    }

    /// @copydoc ScreenMode::width()
    public int width(){
        return 110;
    }

    /// @copydoc ScreenMode::height()
    public int height(){
        return 88;
    }

    public void setPixel(uint x, uint y, int color){
        if( y >= (uint) 88 || x >= (uint) 110 )
            return;
        uint i = y*((uint)55) + (x>>(uint)1);
        int pixel = buffer[i];
        color &= 0xF;
        if ( ((int)x & 1) != 0 ) pixel = (pixel & 0xF0) | color;
        else pixel = (pixel&0x0F) | (color * 16);
        buffer[i] = pixel;
    }    

    public void getPixel(uint x, uint y){
        if( y >= (uint) 88 || x >= (uint) 110 )
            return;
        uint i = y*((uint)55) + (x>>(uint)1);
        int pixel = buffer[i];
        if ( ((int)x & 1) != 0 ) return pixel & 0x0F;
        else return pixel & 0xF0;
    }    

    /// @copydoc ScreenMode::flush()
    public void flush(){}

}

