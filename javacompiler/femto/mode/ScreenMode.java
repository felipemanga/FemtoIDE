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
    public uint height(){ return 0; }
    public void setPixel(uint x, uint y, byte col){}
    public void drawHLine(uint x, uint y, uint h, byte col){}

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
