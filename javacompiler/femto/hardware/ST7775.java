package femto.hardware;

import static java.lang.System.memory.*;

public class ST7775 {
    public static final int CD_PORT = 0;
    public static final int CD_PIN = 2;
    public static final int WR_PORT = 1;
    public static final int WR_PIN = 12;
    public static final int RD_PORT = 1;
    public static final int RD_PIN = 24;
    public static final int RES_PORT = 1;
    public static final int RES_PIN = 0;

    public static final pointer CD_SET = LPC11U68.GPIO_PORT_SET0;
    public static final pointer CD_CLR = LPC11U68.GPIO_PORT_CLR0;
    public static final pointer WR_SET = LPC11U68.GPIO_PORT_SET1;
    public static final pointer WR_CLR = LPC11U68.GPIO_PORT_CLR1;
    public static final pointer RD_SET = LPC11U68.GPIO_PORT_SET1;
    public static final pointer RD_CLR = LPC11U68.GPIO_PORT_CLR1;
    public static final pointer RES_SET = LPC11U68.GPIO_PORT_SET1;
    public static final pointer RES_CLR = LPC11U68.GPIO_PORT_CLR1;
    public static final pointer MPIN = LPC11U68.GPIO_PORT_MPIN2;

    public static final byte CMD_SET_X = 0x21;
    public static final byte CMD_SET_Y = 0x20;
    public static final byte CMD_WRITE = 0x22;

    public static void setX( int x ){
        writeCommand( CMD_SET_X );
        writeData( x );
    }

    public static void setY( int y ){
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

    public static void writeCommand( int cmd ){
        STR( CD_CLR, 1 << CD_PIN );
        STR( MPIN, cmd << 3 );
        toggle();
    }

    public static void writeData( int data ){
        STR( CD_SET, 1 << CD_PIN );
        STR( MPIN, data << 3 );
        toggle();
    }

}
