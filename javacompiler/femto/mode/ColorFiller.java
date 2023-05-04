package femto.mode;

public class ColorFiller implements LineFiller {
    ushort color;
    ushort[] palette;
    ColorFiller(ushort[] palette){
        this.palette = palette;
    }
    public void draw(int c){
        this.color = palette[c];
    }
    
    public void fillLine(ushort[] line, int y) {
        for(int x = 0; x < 220; ++x){
            line[x] = color;
        }
    }
}
