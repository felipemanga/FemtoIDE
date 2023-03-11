package femto.mode;

public class SpriteFiller implements LineFiller {

    int maxSprites = 100;
    SpriteData[] spriteBuffer = new SpriteData[maxSprites];
    int buffer = 0;
    ushort[] palette;
    
    int maxY = 0;
    
    SpriteFiller(ushort[] palette){
        this.palette = palette;
    }
    
    public void addSprite(pointer frame, float x, float y, boolean mirror, boolean flip){
        if(buffer >= maxSprites) return;
        int w;
        int h;
        __inline_cpp__("
            w = ((unsigned char*)frame)[0];
            h = ((unsigned char*)frame)[1];
        ");
        
        if(x+w < 0 || x >= 220 || y+h < 0 || y >= 176){
            return;
        }
        if(y+h > maxY){
            maxY = (int)y+h;
        }
        
        if(spriteBuffer[buffer] != null ){
            spriteBuffer[buffer].set(frame, x, y, w, h, mirror, flip);
        } else {
            spriteBuffer[buffer] = new SpriteData(frame, x, y, w, h, mirror, flip);
        }
        
        buffer++;
    }
    
    
    public void fillLine(ushort[] line, int y) {
        if(y > maxY) {
            buffer = 0;
            return;
        }
        int each = buffer;
        int color;
        int startX;
        int endX;
        while(each > 0){
            SpriteData s = spriteBuffer[--each];
            if(y < s.y || y >= s.end) continue;
            
            // We always want to keep startX at 0 (This is the itterating index X, not the sprite position X)
            startX = 0;
            endX = s.w;
            
            if(s.x < 0){
                startX -= s.x;
            }
            
            if(startX + endX + s.x > 220){
                endX = 220-(startX+s.x);
            }

            if(s.mirror){
                if(s.flip){
                    fillFlipMirror(line,y,s,startX,endX,color);
                } else {
                    fillMirror(line,y,s,startX,endX,color);
                }
            } else {
                if(s.flip){
                    fillFlip(line,y,s,startX,endX,color);
                } else {
                    fill(line,y,s,startX,endX,color);
                }
            }
        }
        // Reset the buffer if we are done with every line.
        if(y == 175) buffer = 0;
    }
    
    void fillFlipMirror(ushort[] line, int y, SpriteData s, int startX, int endX, int color){
        var img = s.frame+(2+(s.h-1-(y-s.y))*s.w);
        pointer lineElements;
        __inline_cpp__("lineElements = line->elements + s->x;");
        for(int x = startX; x < endX; ++x){
            __inline_cpp__("
            color = ((unsigned char*)img)[(s->w-1-x)];
            if(color==0)continue;
            ((unsigned short*)lineElements)[x] = palette->elements[color];
            ");
        }
    }
    
    void fillMirror(ushort[] line, int y, SpriteData s, int startX, int endX, int color) {
        var img = s.frame+(2+(y-s.y)*s.w);
        pointer lineElements;
        __inline_cpp__("lineElements = line->elements + s->x;");
        for(int x = startX; x < endX; ++x){
            __inline_cpp__("
            color = ((unsigned char*)img)[s->w-1-x];
            if(color==0)continue;
            ((unsigned short*)lineElements)[x] = palette->elements[color];
            ");
        }
    }
    
    void fillFlip(ushort[] line, int y, SpriteData s, int startX, int endX, int color) {
        var img = s.frame+(2+(s.h-1-(y-s.y))*s.w);
        pointer lineElements;
        __inline_cpp__("lineElements = line->elements + s->x;");
        for(int x = startX; x < endX; ++x){
            __inline_cpp__("
            color = ((unsigned char*)img)[x];
            if(color==0)continue;
            ((unsigned short*)lineElements)[x] = palette->elements[color];
            ");
        }
    }
    
    void fill(ushort[] line, int y, SpriteData s, int startX, int endX, int color) {
        var img = s.frame+(2+(y-s.y)*s.w);
        pointer lineElements;
        __inline_cpp__("lineElements = line->elements + s->x;");
        for(int x = startX; x < endX; ++x){
            __inline_cpp__("
            color = ((unsigned char*)img)[x];
            if(color==0)continue;
            ((unsigned short*)lineElements)[x] = palette->elements[color];
            ");
        }
    }
    
}