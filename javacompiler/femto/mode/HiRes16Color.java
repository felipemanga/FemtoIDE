package femto.mode;

import java.util.Arrays;

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

    public void setPixel(uint x, uint y, int col){
        ushort i = y*(110) + (x>>1);
        byte pixel = buffer[i];
        col &= 0xF;
        if (x&1) pixel = (pixel&0xF0)|(col);
        else pixel = (pixel&0x0F) | (col*16);
        buffer[i] = pixel;
    }

    public void fillTriangle( int x0, int y0,
                              int x1, int y1,
                              int x2, int y2,
                              byte col ){
        int a, b, y, last, tmp;

        // Sort coordinates by Y order (y2 >= y1 >= y0)
        if (y0 > y1) {
            tmp = y0; y0 = y1; y1 = tmp;
            tmp = x0; x0 = x1; x1 = tmp;
        }
        if (y1 > y2) {
            tmp = y2; y2 = y1; y1 = tmp;
            tmp = x2; x2 = x1; x1 = tmp;
        }
        if (y0 > y1) {
            tmp = y0; y0 = y1; y1 = tmp;
            tmp = x0; x0 = x1; x1 = tmp;
        }

        if (y0 == y2) { // Handle awkward all-on-same-line case as its own thing
            a = b = x0;
            if (x1 < a) a = x1;
            else if (x1 > b) b = x1;
            if (x2 < a) a = x2;
            else if (x2 > b) b = x2;
            drawHLine(a, y0, b - a + 1, col);
            return;
        }

        int
            dx01 = x1 - x0,
            dy01 = y1 - y0,
            dx02 = x2 - x0,
            dy02 = y2 - y0,
            dx12 = x2 - x1,
            dy12 = y2 - y1,
            sa = 0,
            sb = 0;

        // For upper part of triangle, find scanline crossings for segments
        // 0-1 and 0-2.  If y1=y2 (flat-bottomed triangle), the scanline y1
        // is included here (and second loop will be skipped, avoiding a /0
        // error there), otherwise scanline y1 is skipped here and handled
        // in the second loop...which also avoids a /0 error here if y0=y1
        // (flat-topped triangle).
        if (y1 == y2) last = y1; // Include y1 scanline
        else last = y1 - 1; // Skip it

        for (y = y0; y <= last; y++) {
            a = x0 + sa / dy01;
            b = x0 + sb / dy02;
            sa += dx01;
            sb += dx02;
            /* longhand:
               a = x0 + (x1 - x0) * (y - y0) / (y1 - y0);
               b = x0 + (x2 - x0) * (y - y0) / (y2 - y0);
            */
            if (a > b){
                tmp = a;
                a = b;
                b = tmp;
            }
            drawHLine(a, y, b - a + 1, col);
        }

        // For lower part of triangle, find scanline crossings for segments
        // 0-2 and 1-2.  This loop is skipped if y1=y2.
        sa = dx12 * (y - y1);
        sb = dx02 * (y - y0);
        for (; y <= y2; y++) {
            a = x1 + sa / dy12;
            b = x0 + sb / dy02;
            sa += dx12;
            sb += dx02;

            if (a > b){
                tmp = a;
                a = b;
                b = tmp;
            }
            drawHLine(a, y, b - a + 1, col);
        }
    }    

    public void drawHLine(int x, int y, int w, byte color){}
    public void drawVLine(int x, int y, int h, byte color){}

    public void flush(){}

}

