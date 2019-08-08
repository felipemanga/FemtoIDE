package femto;

import mode.HiRes16Color;

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
                __inline_cpp__("&screen->buffer->arrayRead(0)"),
                flip,
                mirror
                );
        }else{
            __blit_4bpp(
                data,
                (int) x,
                (int) y,
                __inline_cpp__("&screen->buffer->arrayRead(0)"),
                flip,
                mirror
                );
        }
    }

    boolean isTransparent(){ return false; }

    pointer getImageDataForScreen( HiRes16Color screen ){
        while(true);
        return 0;
    }

    protected static void __blit_4bpp( pointer src, int x, int y, pointer out, boolean flip, boolean mirror ){}
}
