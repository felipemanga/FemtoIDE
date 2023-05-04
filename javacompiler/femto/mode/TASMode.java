package femto.mode;

import static femto.hardware.ST7775.*;
import java.util.Arrays;

public class TASMode extends ScreenMode implements __stub__ {
    
    /// The screen buffer.
    public byte[] buffer;

    /// The screen mode's palette.
    public ushort[] palette;
    
    ushort[] line;
    
    // oh boy, here we go. Lots to do here. *deep breaths* 
    public LineFiller[] fillers = new LineFiller[4];
    ColorFiller colorFiller;
    SpriteFiller spriteFiller;
    BGTileFiller bgTileFiller;
    FGTileFiller fgTileFiller;
    
    protected TASMode(){}
    
    public TASMode( pointer pal, pointer font ){
        initialize(pal);
    }
    
    protected void initialize( pointer pal ){
        this.font = font;
        line = new ushort[220];
        palette = new ushort[256];
        loadPalette( pal );
        spriteFiller = new SpriteFiller(palette);
        colorFiller = new ColorFiller(palette);
        bgTileFiller = new BGTileFiller(palette);
        fgTileFiller = new FGTileFiller(palette);
        fillers[0] = colorFiller;
        fillers[1] = bgTileFiller;
        fillers[2] = fgTileFiller;
        fillers[3] = spriteFiller;
        clear(0);
        textRightLimit = width();
        return;
        beforeFlush(); // prevent function from being discarded
    }
    
    public void disableFiller(int id) {
        fillers[id] = null;
    }
    
    public void enableFGFiller() {
        fillers[2] = fgTileFiller;
    }
    
    private void beforeFlush(){
        beginStream();
    }
    
    /// Loads the specified palette.
    public void loadPalette( pointer pal ){
        if( pal == null )return;
        
        int len = Math.min(256, (int) System.memory.LDRH(pal));
        for( int i=0; i<len; ++i ){
            palette[i] = System.memory.LDRH(pal+2+(i<<1));
        }
    }
    
    public int width(){
        return 220;
    }

    public int height(){
        return 176;
    }
    
    public void setBGTile(int tileId, int x, int y){
        bgTileFiller.setTile(tileId, x, y);
    }
    
    public void setFGTile(int tileId, int x, int y){
        fgTileFiller.setTile(tileId, x, y);
    }
    
    public int getBGTile(int x, int y) {
        return bgTileFiller.getTile(x,y);
    }
    
    public int getFGTile(int x, int y) {
        return fgTileFiller.getTile(x,y);
    }
    
    public void setBGMap(pointer map, pointer tileSet){
        bgTileFiller.setMap(map, tileSet);
    }
    
    public void setFGMap(pointer map, pointer tileSet){
        fgTileFiller.setMap(map, tileSet);
    }
    
    // Todo - Change to setMap ? Once we set the map and position we don't need to continuously call draw.
    public void drawBGMap(int x, int y){
        bgTileFiller.draw(x,y);
    }
    
    public void drawFGMap(int x, int y){
        fgTileFiller.draw(x,y);
    }
    
    public void addSprite(pointer frame, float x, float y, boolean mirror, boolean flip){
        spriteFiller.addSprite(frame, x, y, mirror, flip);
    }
    
    public void clear( int color ){
        colorFiller.draw(color);
    }

    void flush() {
        super.flush();
        beginStream();
        for(int y = 0; y < 176; ++y){
            for(LineFiller lf : fillers){
                if(null == lf)continue;
                // fillLine populates the line variable with data
                lf.fillLine(line, y);
            }
            __inline_cpp__("
            // pokitto/libs/SystemInit.s
            // pokitto/begin.cpp
            flushLine16(line->elements);
            ");
        }
        spriteFiller.maxY = 0;
    }
}