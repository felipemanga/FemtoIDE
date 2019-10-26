package femto;

import mode.HiRes16Color;

public class Sprite implements __stub__ {
    public ubyte currentFrame, startFrame, endFrame, flags;
    public uint frameTime;
    public float x, y;

    Sprite(){
        x = y = 0;
        currentFrame = startFrame = endFrame = 0;
        frameTime = (uint) 0;
        flags = 0;
    }

    public int getCurrentFrame(){
        return currentFrame;
    }
	
    public void setCurrentFrame(ubyte frame){
        currentFrame = frame;
    }

    public int getStartFrame(){
        return startFrame;
    }

    public int getEndFrame(){
        return endFrame;
    }

    abstract public int width();
    abstract public int height();

    /// @brief
    /// Returns whether or not the `Sprite` is static.
    ///
    /// @details
    /// If a `Sprite` is static, the sprite's position will not be affected by the screen's camera offset.
    ///
    /// @see
    /// Sprite::setStatic()
    public boolean isStatic(){
        return (flags & 1) != 0;
    }

    public boolean isMirrored(){
        return (flags & 2) != 0;
    }

    public boolean isFlipped(){
        return (flags & 4) != 0;
    }

    /// @brief
    /// Sets whether or not the `Sprite` is static.
    ///
    /// @details
    /// If a `Sprite` is static, the sprite's position will not be affected by the screen's camera offset.
    ///
    /// @note
    /// This functionality is intended to be used for implementing HUD elements.
    ///
    /// @see
    /// Sprite::isStatic()
    public void setStatic( boolean s ){
        if( s ) flags |= 1;
        else flags &= ~1;
    }

    /// If set to true, the sprite will appear mirrored.
    public void setMirrored( boolean s ){
        if( s ) flags |= 2;
        else flags &= ~2;
    }

    public void setFlipped( boolean s ){
        if( s ) flags |= 4;
        else flags &= ~4;
    }

    public void setRecolor( int c ){
        flags = (flags&0xF) | ((c&0xF)<<4);
    }

    /// Sets the position of the `Sprite`.
    public void setPosition( float x, float y ){
        this.x = x;
        this.y = y;
    }

    /// Updates the animation and draws onto the screen.
    public void draw( HiRes16Color screen ){
	updateAnimation();
        float x = this.x;
        float y = this.y;
        boolean mirror = (flags&2) != 0;
        boolean flip = (flags&4) != 0;

        if( (flags&1) == 0 ){
            x -= screen.cameraX;
            y -= screen.cameraY;
        }

        __inline_cpp__("
const auto &f = *(const up_femto::uc_FrameRef*)getFrameDataForScreen(currentFrame, screen);
int frameWidth = ((char*)f.frame)[0];
int frameHeight= ((char*)f.frame)[1];
__blit_4bpp( 
  f.frame, 
  x.getInteger() + (mirror?this->width()-(frameWidth+(frameWidth&1)+f.offsetX):f.offsetX), 
  y.getInteger() + (flip?this->height()-(frameHeight+f.offsetY):f.offsetY), 
  screen, 
  flip, 
  mirror 
)");
    }
		       
    public void draw( HiRes16Color screen, float x, float y ){
        this.setPosition( x, y );
        this.draw( screen );
    }

    public void rotoscale(HiRes16Color screen, float angle, float size){
    	updateAnimation();

        float Z = size;
        float C = Math.cos(angle);
        float S = Math.sin(angle);

        float m = isMirrored() ? -1 : 1;
        float f = isFlipped() ? -1 : 1;

        float HW = width()*size/2;
        float HH = height()*size/2;

        fillQuad(screen, 
                 (-HW*C+HH*S)*m,  (-HH*C-HW*S)*f,       0,0,
                 ( HW*C+HH*S)*m,  (-HH*C+HW*S)*f,       1,0,
                 ( HW*C-HH*S)*m,  ( HH*C+HW*S)*f,       1,1,
                 (-HW*C-HH*S)*m,  ( HH*C-HW*S)*f,       0,1
        );
    }

    public void rotozoom(HiRes16Color screen, float angle, float size){
    	updateAnimation();

        float Z = size;
        float C = Math.cos(angle);
        float S = Math.sin(angle);

        float m = isMirrored() ? -1 : 1;
        float f = isFlipped() ? -1 : 1;

        fillQuad(screen, 
                 (-Z*C+Z*S)*m,  (-Z*C-Z*S)*f,       0,0,
                 (Z*C+Z*S)*m,   (-Z*C+Z*S)*f,       1,0,
                 (Z*C-Z*S)*m,   (Z*C+Z*S)*f,        1,1,
                 (-Z*C-Z*S)*m,  (Z*C-Z*S)*f,        0,1
        );
    }
    
    public void fillQuad(HiRes16Color screen, 
        float dx0, float dy0, float sx0, float sy0, 
        float dx1, float dy1, float sx1, float sy1,
        float dx2, float dy2, float sx2, float sy2,
        float dx3, float dy3, float sx3, float sy3
        ){

        if(!isStatic()){
            dx0 -= screen.cameraX;
            dx1 -= screen.cameraX;
            dx2 -= screen.cameraX;
            dx3 -= screen.cameraX;
            dy0 -= screen.cameraY;
            dy1 -= screen.cameraY;
            dy2 -= screen.cameraY;
            dy3 -= screen.cameraY;
        }
        
        dx0 += x;
        dx1 += x;
        dx2 += x;
        dx3 += x;
        
        dy0 += y;
        dy1 += y;
        dy2 += y;
        dy3 += y;

        pointer frame = getFrameDataForScreen(currentFrame, screen);
        pointer bitmap = (pointer) System.memory.LDR(frame);
        int w = System.memory.LDRB(bitmap++);
        int h = System.memory.LDRB(bitmap++);
        sx0 *= w - 1;
        sx1 *= w - 1;
        sx2 *= w - 1;
        sx3 *= w - 1;
        sy0 *= h - 1;
        sy1 *= h - 1;
        sy2 *= h - 1;
        sy3 *= h - 1;
        
        fillTriangleInternal(
            screen,
            (int) dx0, (int) dy0, (int) sx0, (int) sy0,
            (int) dx1, (int) dy1, (int) sx1, (int) sy1,
            (int) dx2, (int) dy2, (int) sx2, (int) sy2
        );

        fillTriangleInternal(
            screen,
            (int) dx0, (int) dy0, (int) sx0, (int) sy0,
            (int) dx2, (int) dy2, (int) sx2, (int) sy2,
            (int) dx3, (int) dy3, (int) sx3, (int) sy3
        );
    }
    
    void fillTriangleInternal(HiRes16Color screen,
        int x0, int y0, int u0, int v0, 
        int x1, int y1, int u1, int v1,
        int x2, int y2, int u2, int v2
        ){
        int tmp, last;
        int tint = flags >> 4;

        // Sort coordinates by Y order (y2 >= y1 >= y0)
        if (y0 > y1) {
            tmp = y0; y0 = y1; y1 = tmp;
            tmp = x0; x0 = x1; x1 = tmp;
            tmp = u0; u0 = u1; u1 = tmp;
            tmp = v0; v0 = v1; v1 = tmp;
        }
        if (y1 > y2) {
            tmp = y2; y2 = y1; y1 = tmp;
            tmp = x2; x2 = x1; x1 = tmp;
            tmp = u2; u2 = u1; u1 = tmp;
            tmp = v2; v2 = v1; v1 = tmp;
        }
        if (y0 > y1) {
            tmp = y0; y0 = y1; y1 = tmp;
            tmp = x0; x0 = x1; x1 = tmp;
            tmp = u0; u0 = u1; u1 = tmp;
            tmp = v0; v0 = v1; v1 = tmp;
        }

        if (y0 == y2) { // Handle awkward all-on-same-line case as its own thing
            return;
        }

        pointer frame = getFrameDataForScreen(currentFrame, screen);
        pointer bitmap = (pointer) System.memory.LDR(frame);
        int texWidth = System.memory.LDRB(bitmap++);
        int texHeight = System.memory.LDRB(bitmap++);
        
        if(u0 < 0 ) u0 = 0;
        if(u1 < 0 ) u1 = 0;
        if(u2 < 0 ) u2 = 0;
        if(v0 < 0 ) v0 = 0;
        if(v1 < 0 ) v1 = 0;
        if(v2 < 0 ) v2 = 0;
        if(u0 > texWidth) u0 = texWidth;
        if(u1 > texWidth) u1 = texWidth;
        if(u2 > texWidth) u2 = texWidth;
        if(v0 > texHeight) v0 = texHeight-1;
        if(v1 > texHeight) v1 = texHeight-1;
        if(v2 > texHeight) v2 = texHeight-1;

        int
            dx01 = x1 - x0,
            du01 = u1 - u0,
            dy01 = (1<<16) / (y1 - y0),
            dx02 = x2 - x0,
            du02 = u2 - u0,
            dy02 = (1<<16) / (y2 - y0),
            dx12 = x2 - x1,
            du12 = u2 - u1,
            dy12 = (1<<16) / (y2 - y1),
            dv01 = v1 - v0,
            dv02 = v2 - v0,
            dv12 = v2 - v1,
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

        int x, y, a, b, u, v, col;

        y = y0;
        if( y<0 ) y = 0;
        if( y>=screen.height() )
            return;
        
        texWidth = (texWidth>>1) + (texWidth&1);

        u0 <<= 16;
        u1 <<= 16;
        u2 <<= 16;
        v0 <<= 16;
        v1 <<= 16;
        v2 <<= 16;
        for (; y <= last; y++) {
            a = x0 + ((sa * dy01) >> 16);
            b = x0 + ((sb * dy02) >> 16);
            sa += dx01;
            sb += dx02;
            // longhand:
            //   a = x0 + (x1 - x0) * (y - y0) / (y1 - y0);
            //   b = x0 + (x2 - x0) * (y - y0) / (y2 - y0);
            //  lu = (y - y0) / dy02 * (u2-u0) + u0;
            int lu = (y - y0) * du02 * dy02 + u0;
            int lv = (y - y0) * dv02 * dy02 + v0;
            int su = (y - y0) * du01 * dy01 + u0;
            int sv = (y - y0) * dv01 * dy01 + v0;
            
            int begin = a;
            int end = b;
            if( begin > end ){
                begin = b;
                end = a;
            }else{
                int tmp = su;
                su = lu;
                lu = tmp;
                tmp = sv;
                sv = lv;
                lv = tmp;
            }
            
            int ab = (1<<16) / (end-begin);

            for( int i=begin; i != end; ++i ){
                u = (((i - begin) * (su - lu) >> 16) * ab + lu + 0x8000) >> 16;
                v = (((i - begin) * (sv - lv) >> 16) * ab + lv + 0x8000) >> 16;
                col = System.memory.LDRB(bitmap + v*texWidth + (u>>1));
                if((u&1) == 0) col >>= 4;
                if((col&0xF) != 0) screen.setPixel(i, y, col ^ tint);
            }
        }
        
        // For lower part of triangle, find scanline crossings for segments
        // 0-2 and 1-2.  This loop is skipped if y1=y2.
        sa = dx12 * (y - y1);
        sb = dx02 * (y - y0);
        for (; y <= y2; y++) {
            a = x1 + ((sa * dy12) >> 16);
            b = x0 + ((sb * dy02) >> 16);
            sa += dx12;
            sb += dx02;

            int lu = (y - y0) * du02 * dy02 + u0;
            int lv = (y - y0) * dv02 * dy02 + v0;
            int su = (y - y1) * du12 * dy12 + u1;
            int sv = (y - y1) * dv12 * dy12 + v1;

            int begin = a;
            int end = b;
            if( begin > end ){
                begin = b;
                end = a;
            }else{
                int tmp = su;
                su = lu;
                lu = tmp;
                tmp = sv;
                sv = lv;
                lv = tmp;
            }
            
            int ab = (1<<16) / (end-begin);

            for( int i=begin; i != end; ++i ){
                u = ((((i - begin) * (su - lu) + 0x8000) >> 16) * ab + lu + 0x8000) >> 16;
                v = ((((i - begin) * (sv - lv) + 0x8000) >> 16) * ab + lv + 0x8000) >> 16;
                col = System.memory.LDRB(bitmap + v*texWidth + (u>>1));
                if((u&1) == 0) col >>= 4;
                if((col&0xF) != 0) screen.setPixel(i, y, col ^ tint);
            }
        }        
    }
    

    public pointer getFrameDataForScreen( uint number, HiRes16Color screen ){
        return null;
        new FrameRef(); // dummy type ref
    }


    public void updateAnimation(){
        if( startFrame != endFrame ){

            uint now = System.currentTimeMillis();
            int delta = now - frameTime;
            pointer frameData;

            while( true ){
                int duration;
                __inline_cpp__("duration = ((up_femto::uc_FrameRef*)(getFrameDataForScreen(currentFrame, (up_femto::up_mode::uc_HiRes16Color*)nullptr)))->duration");
                if( duration >= delta )
                    break;
                
                currentFrame++;
                delta -= duration;

                if( currentFrame > endFrame )
                    currentFrame = startFrame;

                frameTime += duration;
            }
        }

    }

    protected static void __blit_4bpp( pointer src, int x, int y, HiRes16Color screen, boolean flip, boolean mirror ){}
}
