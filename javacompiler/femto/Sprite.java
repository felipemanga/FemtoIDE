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
__blit_4bpp( 
  f.frame, 
  x.getInteger() + (mirror?this->width()-(frameWidth+(frameWidth&1)+f.offsetX):f.offsetX), 
  y.getInteger() + f.offsetY, 
  &screen->buffer->arrayRead(0), 
  flip, 
  mirror 
)");
    }
		       
    public void draw( HiRes16Color screen, float x, float y ){
        this.setPosition( x, y );
        this.draw( screen );
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

    protected static void __blit_4bpp( pointer src, int x, int y, pointer out, boolean flip, boolean mirror ){}
}
