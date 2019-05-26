package femto.mode;
import femto.hardware.ST7775;
import java.util.Arrays;

public class HiRes16Color extends ScreenMode implements __stub__ {

    public byte[] buffer;
    public ushort[] palette;

    public HiRes16Color( pointer pal, pointer font ){
        this.font = font;
        buffer = new byte[0x4BA0];
        palette = new ushort[16];
        loadPalette( pal );
        clear(0);
        textRightLimit = width();
    }

    public void loadPalette( pointer pal ){
        if( pal == null )
            return;
        int len = Math.min(16, System.memory.LDRH(pal));
        for( int i=0; i<len; ++i ){
            palette[i] = System.memory.LDRH(pal+2+(i<<1));
        }
    }

    public uint width(){
        return 220;
    }

    public uint height(){
        return 176;
    }

    public void clear( int color ){}

    public void setPixel(uint x, uint y, int color){
        if( y>=176 || x>=220 )
            return;
        uint i = y*(110) + (x>>1);
        byte pixel = buffer[i];
        color &= 0xF;
        if (x&1) pixel = (pixel&0xF0)|(color);
        else pixel = (pixel&0x0F) | (color*16);
        buffer[i] = pixel;
    }    

    public void drawHLine(int x, int y, int w, int color){}
    public void drawVLine(int x, int y, int h, int color){}

    private void beforeFlush(){
        ST7775.beginStream();
    }

    public void flush(){}

}

