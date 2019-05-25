package femto.hardware;

import static java.lang.System.memory.*;

public class ST7775 {
    public static final uint CD_PORT = 0;
    public static final uint CD_PIN = 2;
    public static final uint WR_PORT = 1;
    public static final uint WR_PIN = 12;
    public static final uint RD_PORT = 1;
    public static final uint RD_PIN = 24;
    public static final uint RES_PORT = 1;
    public static final uint RES_PIN = 0;

    public static final pointer CD_SET = LPC11U68.GPIO_PORT_SET0;
    public static final pointer CD_CLR = LPC11U68.GPIO_PORT_CLR0;
    public static final pointer WR_SET = LPC11U68.GPIO_PORT_SET1;
    public static final pointer WR_CLR = LPC11U68.GPIO_PORT_CLR1;
    public static final pointer RD_SET = LPC11U68.GPIO_PORT_SET1;
    public static final pointer RD_CLR = LPC11U68.GPIO_PORT_CLR1;
    public static final pointer RES_SET = LPC11U68.GPIO_PORT_SET1;
    public static final pointer RES_CLR = LPC11U68.GPIO_PORT_CLR1;
    public static final pointer MPIN = LPC11U68.GPIO_PORT_MPIN2;

    public static final ubyte CMD_SET_X = 0x21;
    public static final ubyte CMD_SET_Y = 0x20;
    public static final ubyte CMD_WRITE = 0x22;

    public static void setX( uint x ){
        writeCommand( CMD_SET_X );
        writeData( x );
    }

    public static void setY( uint y ){
        writeCommand( CMD_SET_Y );
        writeData( y );
    }

    public static void beginStream(){
        writeCommand( CMD_WRITE );
        STR( CD_SET, 1 << CD_PIN );
    }

    public static void toggle(){
        STR( WR_CLR, 1 << WR_PIN );
        __inline_cpp__("__asm(\"nop\")");
        STR( WR_SET, 1 << WR_PIN );
    }

    public static void writeCommand( uint cmd ){
        STR( CD_CLR, 1 << CD_PIN );
        STR( MPIN, cmd << 3 );
        toggle();
    }

    public static void writeData( uint data ){
        STR( CD_SET, 1 << CD_PIN );
        STR( MPIN, data << 3 );
        toggle();
    }

}
