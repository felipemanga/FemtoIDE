package femto;

import mode.HiRes16Color;
import mode.Direct4BPP;
import mode.LowRes256Color;

public class Image implements __stub__ {

    Image(){
    }

    /// Returns the height of the image in pixels.
    int height(){ return 0; }

    /// Returns the width of the image in pixels.
    int width(){ return 0; }

    void draw( HiRes16Color screen, float x, float y ){
        draw( screen, x, y, false, false, false );
    }

    void draw( LowRes256Color screen, float x, float y ){
        draw( screen, x, y, false, false, false );
    }

    void draw( Direct4BPP screen, float x, float y ){
        draw( screen, x, y, false, false, false, 0 );
    }

    void draw( Direct4BPP screen, float x, float y, boolean mirror, boolean flip, boolean isStatic ){
        draw( screen, x, y, mirror, flip, isStatic, 0 );
    }

    void draw( Direct4BPP screen, float x, float y, boolean mirror, boolean flip, boolean isStatic, int recolor ){

        if( !isStatic ){
            x -= screen.cameraX;
            y -= screen.cameraY;
        }

        pointer data = getImageDataForScreen( (HiRes16Color)null );
        pointer pal;
        __inline_cpp__("pal = screen->palette->elements");
        pal += (recolor<<4) & 0xF0;

        if( isTransparent() ){
            __directblit_4bpp(
                data,
                (int) x,
                (int) y,
                screen,
                flip,
                mirror,
                pal
                );
            /*
            femto.Sprite.__blit_4bpp(
                data,
                (int) x,
                (int) y,
                screen,
                flip,
                mirror
                );
            */
        }else{
            __directblit_4bpp(
                data,
                (int) x,
                (int) y,
                screen,
                flip,
                mirror,
                pal
                );
        }
        
    }

    /// Draws an image. If `isStatic` is `false`, the screen's camera coordinates are taken into consideration. Set it to `true` for images that are part of the HUD.
    void draw( LowRes256Color screen, float x, float y, boolean mirror, boolean flip, boolean isStatic ){

        if( !isStatic ){
            x -= screen.cameraX;
            y -= screen.cameraY;
        }

        pointer data = getImageDataForScreen( screen );
        
        if( isTransparent() ){
            femto.Sprite.__blit_8bpp(
                data,
                (int) x,
                (int) y,
                screen,
                flip,
                mirror
                );
        }else{
            __blit_8bpp(
                data,
                (int) x,
                (int) y,
                screen,
                flip,
                mirror
                );
        }
    }

    /// Draws an image. If `isStatic` is `false`, the screen's camera coordinates are taken into consideration. Set it to `true` for images that are part of the HUD.
    void draw( HiRes16Color screen, float x, float y, boolean mirror, boolean flip, boolean isStatic ){

        if( !isStatic ){
            x -= screen.cameraX;
            y -= screen.cameraY;
        }

        pointer data = getImageDataForScreen( screen );
        
        if( isTransparent() ){
            femto.Sprite.__blit_4bpp(
                data,
                (int) x,
                (int) y,
                screen,
                flip,
                mirror
                );
        }else{
            __blit_4bpp(
                data,
                (int) x,
                (int) y,
                screen,
                flip,
                mirror
                );
        }
    }

    boolean isTransparent(){ return false; }

    pointer getImageDataForScreen( HiRes16Color screen ){ return null; }
    pointer getImageDataForScreen( LowRes256Color screen ){ return null; }

   protected static void __blit_4bpp( pointer src, int x, int y, HiRes16Color screen, boolean flip, boolean mirror ){}
   protected static void __blit_8bpp( pointer src, int x, int y, LowRes256Color screen, boolean flip, boolean mirror ){}
   protected static void __directblit_4bpp( pointer src, int x, int y, Direct4BPP screen, boolean flip, boolean mirror, pointer pal ){}

}
