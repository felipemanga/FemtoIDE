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
    public void setPixel( uint x, uint y, int color ){}
    public void drawHLine( int x, int y, int w, int color ){}
    public void drawVLine( int x, int y, int h, int color ){}
    
    public void drawRect( int x, int y, int w, int h, int color ){
        drawHLine( x, y, w, color );
        drawHLine( x, y+h, w, color );
        drawVLine( x, y, h, color );
        drawVLine( x+w, y, h, color );
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
