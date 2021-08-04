package femto.sound;
import femto.CPP;
import femto.File;

/// Streams music from the SD
public class Stream {
    static final pointer buffer0 = (pointer) 0x20000000;
    static final pointer buffer1 = (pointer) 0x20000400;
    static pointer readBuffer = buffer0;
    static pointer writeBuffer = buffer1;
    static int offset;
    static File file = null;

    /// Number of times a song should loop. -1 = indefinitely.
    public static int loop = -1;

    public static final Procedural procedural = new Procedural(){
        public ubyte update(){
            if( offset == 0x400 ){
                if( writeBuffer != null ){
                    return 0;
                }
                offset = 0;
                writeBuffer = readBuffer;
                readBuffer = (readBuffer == buffer0) ? buffer1 : buffer0;
            }
            return System.memory.LDRB(readBuffer + offset++);
        }
    };

    public static void update(){
        if( file == null || !file.isOpen() || writeBuffer == null ){
            return;
        }
		
        uint amountRead = file.toPointer(writeBuffer, 0x400);

        if( amountRead < 0x400 ){
            if( loop != 0 ){
                if( loop > 0 ) loop--;
                file.seek(0);
                amountRead += file.toPointer(writeBuffer, 0x400 - amountRead);
            }
            for(; amountRead<0x400; ++amountRead){
                System.memory.STRB(writeBuffer + amountRead, 0);
            }
        }
        writeBuffer = null;
    }

    public static boolean play(String path){
        if( file == null )
            file = new File();
        if( !file.openRO(path) )
            return false;
        procedural.play();
        return true;
    }
}

