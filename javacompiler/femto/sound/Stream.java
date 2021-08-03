package femto.sound;

import femto.CPP;
/*
import femto.hardware.Timer;
import femto.hardware.IRQ;
*/

/// Streams music from the SD
public class Stream {
    static final pointer buffer0 = (pointer) 0x20000000;
    static final pointer buffer1 = (pointer) 0x20000400;
    static pointer readBuffer = buffer0;
    static pointer writeBuffer = buffer1;
    static int offset;

    /// Number of times a song should loop. -1 = indefinitely.
    public static int loop = -1;

    // static boolean wasInit = false;

    static boolean isOpen = false;
    
    public static final Procedural procedural = new Procedural(){

        public ubyte update(){

            if( offset == 0x400 ){

                if( writeBuffer != null ){
                    System.out.println(1);
                    return 0;
                }

                offset = 0;
                writeBuffer = readBuffer;
                readBuffer = (readBuffer == buffer0) ? buffer1 : buffer0;
            }

            return System.memory.LDRB(readBuffer + offset++);
        }

    };

    @CPP(include="File")
    private static pointer getHandle(){
		pointer hnd;
        __inline_cpp__("
            static File fil;
            hnd = &fil;
        ");
        return hnd;
    }

//    @IRQ(name="TIMER32_0")
    public static void update(){
        if( !isOpen || writeBuffer == null ){
            return;
        }
		
        uint amountRead;
		
        __inline_cpp__("
            auto& file = *(File*) getHandle();
            amountRead = file.read((void*) writeBuffer, 0x400 );
        ");
		
        if( amountRead < 0x400 ){
            if( loop != 0 ){
                if( loop > 0 ) loop--;
                
                __inline_cpp__("
                    auto& file = *(File*) getHandle();
                    file.seek(0);
                    amountRead = file.read((void*) writeBuffer, 0x400 - amountRead);
                ");
            }
			
            for(; amountRead<0x400; ++amountRead){
                System.memory.STRB(writeBuffer + amountRead, 0);
            }
        }		

        writeBuffer = null;
    }

    public static boolean play(String path){
        /*
        if( !wasInit ){
            Timer.interval(0, 9);
            wasInit = true;
        }
        */


        __inline_cpp__("
        
            auto& file = *(File*) getHandle();

            if(isOpen) file.close();

            isOpen = file.openRO(path->__c_str());
            if( !isOpen ){
                return false;
            }
        ");

        procedural.play();

        return true;
    }
}

