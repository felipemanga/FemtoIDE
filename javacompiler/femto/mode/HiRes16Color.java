package femto.mode;

public class HiRes16Color extends ScreenMode implements __stub__ {

    public byte[] buffer;
    public ushort[] palette;

    public HiRes16Color( pointer font ){
        this.font = font;
        buffer = new byte[0x4BA0];
        palette = new ushort[16];
        for( int i=0; i<16; ++i ) palette[i] = i*0xFFFF/15;
        clear(0);
        textRightLimit = width();
    }

    public uint width(){
        return 220;
    }

    public uint height(){
        return 176;
    }

    public void clear( byte col ){}

    public void setPixel(uint x, uint y, byte col){
        ushort i = y*(110) + (x/2);
        byte pixel = buffer[i];
        col &= 0xF;
        if (x&1) pixel = (pixel&0xF0)|(col);
        else pixel = (pixel&0x0F) | (col*16);
        buffer[i] = pixel;
    }

    public void flush(){}

}

