package femto.mode;

import static java.lang.System.memory.*;

class ScreenMode {
    public pointer font;
    public int textLeftLimit, textRightLimit, lineSpacing, charSpacing;
    public float textX, textY;
    public int textColor;
    public float cameraX = 0.0f, cameraY = 0.0f;
    public int lastFrameTime, frameTimeUpdate, frameTime;

    ScreenMode(){
        font = 0;
        textLeftLimit = 0;
        textRightLimit = 0;
        lineSpacing = 1;
        charSpacing = 1;
        textX = textY = 0;
        textColor = 1;
        lastFrameTime = System.currentTimeMillis();
        frameTime = 64000;
        frameTimeUpdate = 64;
    }

    public float fps(){
        float f = 64000.0f;
        f /= frameTime;
        return f;
    }

    public void flush(){
        if( frameTimeUpdate-- ) return;
        frameTimeUpdate = 64;
        uint now = System.currentTimeMillis();
        frameTime = now - lastFrameTime;
        lastFrameTime = now;
    }

    public void setTextPosition( float x, float y ){
        textX = x;
        textY = y;
    }

    public void setTextColor( int color ){
        textColor = color;
    }

    abstract public uint width();
    abstract public uint height();
    
    public void setPixel( float x, float y, int color, boolean isStatic ){
        if( !isStatic ){
            x -= cameraX;
            y -= cameraY;
        }
        setPixel( (uint) (int) x, (uint) (int) y, color );
    }
    
    public void setPixel( uint x, uint y, int color ){}
    
    public void drawHLine( float x, float y, float w, int color, boolean isStatic ){
        if( !isStatic ){
            x -= cameraX;
            y -= cameraY;
        }
        drawHLine( (int) x, (int) y, (int) w, color );
    }
    
    public void drawHLine( int x, int y, int w, int color ){}
    
    public void drawVLine( float x, float y, float h, int color, boolean isStatic ){
        if( !isStatic ){
            x -= cameraX;
            y -= cameraY;
        }
        drawVLine( (int) x, (int) y, (int) h, color );
    }
    
    public void drawVLine( int x, int y, int h, int color ){}
    
    public void drawRect( float x, float y, float w, float h, int color, boolean isStatic ){
        if( !isStatic ){
            x -= cameraX;
            y -= cameraY;
        }
        drawRect( (int) x, (int) y, (int) w, (int) h, color );
    }
    
    public void drawRect( int x, int y, int w, int h, int color ){
        drawHLine( x, y, w, color );
        drawHLine( x, y+h, w, color );
        drawVLine( x, y, h, color );
        drawVLine( x+w, y, h+1, color );
    }

    public void fillRect( float x, float y, float w, float h, int color, boolean isStatic ){
        if( !isStatic ){
            x -= cameraX;
            y -= cameraY;
        }
        fillRect( (int) x, (int) y, (int) w, (int) h, color );
    }

    public void fillRect( int x, int y, int w, int h, int color ){
        int height = (int) this.height();
        int width = (int) this.width();
        
        if( x < 0 ){
            w += x;
            x = 0;
        }
        if( y < 0 ){
            h += y;
            y = 0;
        }
        if( x+w >= width ){
            w = width - x;
        }
        if( y+h >= height ){
            h = height - y;
        }
        if( w<0 )
            return;
        while( h>0 ){
            drawHLine(x, y++, w, color);
            h--;
        }
    }

    void drawCircle( float x0, float y0, float r, int color, boolean isStatic ){
        if( !isStatic ){
            x0 -= cameraX;
            y0 -= cameraY;
        }
        drawCircle( (int) x0, (int) y0, (int) r, color );
    }

    void drawCircle( int x0, int y0, int r, int color ){
        int f = 1 - r;
        int ddF_x = 1;
        int ddF_y = -2 * r;
        int x = 0;
        int y = r;

        setPixel(x0, y0 + r, color);
        setPixel(x0, y0 - r, color);
        setPixel(x0 + r, y0, color);
        setPixel(x0 - r, y0, color);

        while (x < y) {
            if (f >= 0) {

                y--;
                ddF_y += 2;
                f += ddF_y;
            }
            x++;
            ddF_x += 2;
            f += ddF_x;

            setPixel(x0 + x, y0 + y, color);
            setPixel(x0 - x, y0 + y, color);
            setPixel(x0 + x, y0 - y, color);
            setPixel(x0 - x, y0 - y, color);
            setPixel(x0 + y, y0 + x, color);
            setPixel(x0 - y, y0 + x, color);
            setPixel(x0 + y, y0 - x, color);
            setPixel(x0 - y, y0 - x, color);

        }
    }    

    void fillCircle( float x0, float y0, float r, int color, boolean isStatic ){
        if( !isStatic ){
            x0 -= cameraX;
            y0 -= cameraY;
        }
        fillCircle( (int) x0, (int) y0, (int) r, color );
    }

    void fillCircle( int x0, int y0, int r, int color ){
        drawHLine(x0 - r, y0, 2 * r, color );
        int delta = 0;
        int cornername = 3;
    
        int f = 1 - r;
        int ddF_x = 1;
        int ddF_y = -2 * r;
        int x = 0;
        int y = r;

        while (x < y) {
            if (f >= 0) {
                y--;
                ddF_y += 2;
                f += ddF_y;
            }
            x++;
            ddF_x += 2;
            f += ddF_x;

            drawHLine( x0 - y, y0 + x, 2 * y, color );
            drawHLine( x0 - x, y0 + y, 2 * x, color );
            drawHLine( x0 - y, y0 - x, 2 * y, color );
            drawHLine( x0 - x, y0 - y, 2 * x, color );
        }
    }
    
    public void drawLine(float x0, float y0, float x1, float y1, int color, boolean isStatic) {
        if( !isStatic ){
            x0 -= cameraX;
            x1 -= cameraX;
            y0 -= cameraY;
            y1 -= cameraY;
        }
        
        drawLine((int) x0, (int) y0, (int) x1, (int) y1, color);
    }

    public void drawLine(int x0, int y0, int x1, int y1, int color) {
        int height = (int) this.height();
        int width = (int) this.width();
        
        if ((uint)x0 >= width || (uint)y0 >= height || (uint)x1 >= width || (uint)y1 >= height ) {

            {
                // Check X bounds
                if (x1 < x0) {
                    int tmp = x1;
                    x1 = x0;
                    x0 = tmp;

                    tmp = y1;
                    y1 = y0;
                    y0 = tmp;
                }

                if (x0 >= width)
                    return; // whole line is out of bounds

                // Clip against X0 = 0
                if (x0 < 0) {
                    if (x1 < 0)
                        return; // nothing visible
                    int dx = (x1 - x0);
                    int dy = ((y1 - y0) << 16); // 16.16 fixed point calculation trick
                    int m = dy/dx;
                    y0 = y0 + ((m*-x0) >> 16); // get y0 at boundary
                    x0 = 0;
                }

                // Clip against x1 >= width
                if (x1 >= width) {
                    int dx = (x1 - x0);
                    int dy = ((y1 - y0) << 16); // 16.16 fixed point calculation trick
                    int m = dy / dx;
                    y1 = y1 + ((m * ((width - 1) - x1)) >> 16); // get y0 at boundary
                    x1 = width-1;
                }

                // Check Y bounds
                if (y1 < y0) {
                    int tmp = x1; x1 = x0; x0 = tmp;
                    tmp = y1; y1 = y0; y0 = tmp;
                }

                if (y0 >= height)
                    return; // whole line is out of bounds

                if (y0 < 0) {
                    if (y1 < 0)
                        return; // nothing visible
                    int dx = (x1 - x0) << 16;
                    int dy = (y1 - y0); // 16.16 fixed point calculation trick
                    int m = dx / dy;
                    x0 = x0 + ((m * -(y0)) >> 16); // get x0 at boundary
                    y0 = 0;
                }

                // Clip against y1 >= height
                if (y1 >= height) {
                    int dx = (x1 - x0) << 16;
                    int dy = (y1 - y0); // 16.16 fixed point calculation trick
                    int m = dx / dy;
                    x1 = x1 + ((m * ((height - 1) - y1)) >> 16); // get y0 at boundary
                    y1 = height-1;
                }
            }            
        }
        
	if (x0 == x1){
            drawVLine(x0,y0,y1-y0,color);
            return;
        }
        
	if (y0 == y1){
            drawHLine(x0,y0,x1-x0,color);
            return;
        }
        
        int e;
        int dx,dy,j, temp;
        int s1,s2, xchange;
        int x,y;

        x = x0;
        y = y0;

        //take absolute value
        if (x1 < x0) {
            dx = x0 - x1;
            s1 = -1;
        } else if (x1 == x0) {
            dx = 0;
            s1 = 0;
        } else {
            dx = x1 - x0;
            s1 = 1;
        }

        if (y1 < y0) {
            dy = y0 - y1;
            s2 = -1;
        } else if (y1 == y0) {
            dy = 0;
            s2 = 0;
        } else {
            dy = y1 - y0;
            s2 = 1;
        }

        xchange = 0;

        if (dy>dx) {
            temp = dx;
            dx = dy;
            dy = temp;
            xchange = 1;
        }

        e = ((int)dy<<1) - dx;

        for (j=0; j<=dx; j++) {
            setPixel( x, y, color );

            if (e>=0) {
                if (xchange==1) x = x + s1;
                else y = y + s2;
                e = e - ((int)dx<<1);
            }
            if (xchange==1)
                y = y + s2;
            else
                x = x + s1;
            e = e + ((int)dy<<1);
        }
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
    
    public void print( String s ){
        int i=0;
        char c;
        while(true){
            c = s[i++];
            if(!c) return;
            putchar(c);
        }
    }

    public void print( uint v ){
        if( !v ){
            putchar('0');
            return;
        }
        __inline_cpp__("char buf[11]; miniitoa(v, buf, 10)");
        __inline_cpp__("char *c = buf; while(*c) putchar(*c++)");
    }

    public void print( int v ){
        if( !v ){
            putchar('0');
            return;
        }
        __inline_cpp__("
char buf[11], *c = buf; 
if(v<0){
  *c++ = '-';
  v = -v;
} 
miniitoa(v, c, 10);
c = buf;
while(*c) 
  putchar(*c++)");
    }

    public void print( float v ){
        if( v == 0.0f ){
            putchar('0');
            return;
        }
        __inline_cpp__("
char buf[15], *c = buf; 
miniftoa(v, c);
c = buf;
while(*c) 
  putchar(*c++)");
    }
    
    public void putchar( char index ){
        if( !font || textY >= (int)height() ) return;
        uint screenWidth = width();
        uint screenHeight = height();
        uint w = LDRB( font );
        uint h = LDRB( font+1 );
        index -= LDRB( font+2 );
        uint x = (int) textX;
        uint y = (int) textY;
        uint color = textColor;
        uint extra = h != 8 && h != 16;
        uint hbytes = h;
        hbytes >>= 3;
        hbytes += extra;
        pointer bitmap = font + 4 + index * (w * hbytes + 1);
        int numBytes = LDRB(bitmap++);
        int column;

        for( int i=0; i<numBytes; ++i ){
            column = LDRB(bitmap++);
            if(x < screenWidth){
                for( int j=0; j<=h; ++j ){
                    if( (column&1) && y<screenHeight )
                        setPixel(x, y+j, color);
                    column >>= 1;
                }
            }
            x++;
        }

        textX += numBytes + charSpacing;
        if( textX >= textRightLimit ){
            textX = textLeftLimit;
            textY += h + lineSpacing;
        }
    }

}
