package femto.mode;

public class Direct4BPP extends Direct {

    /// The screen mode's palette.
    public ushort[] palette;

    /// Constructs a `HiRes16Color` object with the corresponding palette `pal` and font `font`
    public Direct4BPP( pointer pal, pointer font ){
        super(font);
        palette = new ushort[256];
        loadPalette( pal );
        clear(0);
        textRightLimit = width();
    }

    /// Loads the specified palette.
    public void loadPalette( pointer pal ){
        if( pal == null )
            return;
        int len = Math.min(palette.length, System.memory.LDRH(pal));
        for( int i=0; i<len; ++i ){
            palette[i] = System.memory.LDRH(pal+2+(i<<1));
        }
    }
    
}
