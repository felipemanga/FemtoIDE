package femto;

public class TileSet extends Image {
    public byte flags;
    public int tileId;
    
    public boolean isTransparent(){
        return (flags&0x80) != 0;
    }
}
