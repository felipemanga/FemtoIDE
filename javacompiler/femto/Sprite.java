package femto;

import mode.HiRes16Color;

public class Sprite extends Object implements __stub__ {
    public ubyte currentFrame, startFrame, endFrame, flags;
    public uint frameTime;
    public float x, y;

    Sprite(){
        x = y = 0;
        currentFrame = startFrame = endFrame = frameTime = 0;
        flags = 0;
    }

    boolean isStatic(){
        return (boolean) (flags & 1);
    }

    boolean isMorrored(){
        return (boolean) (flags & 2);
    }

    boolean isFlipped(){
        return (boolean) (flags & 4);
    }

    void setStatic( boolean s ){
        if( s ) flags |= 1;
        else flags &= ~1;
    }

    void setMirrored( boolean s ){
        if( s ) flags |= 2;
        else flags &= ~2;
    }

    void setFlipped( boolean s ){
        if( s ) flags |= 4;
        else flags &= ~4;
    }

    void setPosition( float x, float y ){
        this.x = x;
        this.y = y;
    }

    void draw( HiRes16Color screen ){
	updateAnimation();
        float x = this.x;
        float y = this.y;
        boolean mirror = flags&2;
        boolean flip = flags&4;

        if( !(flags&1) ){
            x += screen.cameraX;
            y += screen.cameraY;
        }        
        
        __inline_cpp__("const up_femto::uc_FrameRef &f = *(const up_femto::uc_FrameRef*)getFrameDataForScreen(currentFrame, screen);__blit_4bpp( f.frame, x.getInteger() + f.offsetX, y.getInteger() + f.offsetY, &screen->buffer->access(0), flip, mirror )");
    }

    pointer getFrameDataForScreen( uint number, HiRes16Color screen ){
        while(true);
        return 0;
        new FrameRef(); // dummy type ref
    }


    void updateAnimation(){
        if( startFrame != endFrame ){

            uint now = System.currentTimeMillis();
            int delta = now - frameTime;
            pointer frameData;

            while( __inline_cpp__("((up_femto::uc_FrameRef*)(frameData=getFrameDataForScreen(currentFrame, (up_femto::up_mode::uc_HiRes16Color*)nullptr)))->duration") < delta ){
                currentFrame++;
                int duration = __inline_cpp__("((up_femto::uc_FrameRef*)frameData)->duration");
                delta -= duration;

                if( currentFrame > endFrame )
                    currentFrame = startFrame;

                frameTime += duration;
            }
        }

    }

    protected static void __blit_4bpp( pointer src, int x, int y, pointer out, boolean flip, boolean mirror ){}
}
