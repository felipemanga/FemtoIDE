package femto.hardware;
import static java.lang.System.memory.*;
import femto.hardware.LPC11U68;

public class EXT {
    byte port;
    byte pin;
    byte func;
    byte mode = 2;
    byte invert;

    EXT(int port, int pin){
        this.port = (byte) port;
        this.pin = (byte) pin;
    }

    void setFunction(){}

    public void pullNone(){ mode = 0; }
    public void pullDown(){ mode = 1; }
    public void pullUp(){ mode = 2; }
    public void repeater(){ mode = 3; }

    public void setSpecial(uint func){
        if( !func ) func = 1;
        this.func = func;
        setFunction();
    }
    
    public uint special(uint v){}

    public void setInput(){
        func = 0;
        setFunction();
        CLR(LPC11U68.GPIO_PORT_DIR0+port, 1<<pin);
    }
    
    public boolean read(){
        return LDRB(LPC11U68.GPIO_BYTE + port*32 + pin) != 0;
    }

    public void setOutput(){
        func = 0;
        setFunction();
        SET(LPC11U68.GPIO_PORT_DIR0+port, 1<<pin);        
    }

    public void write(boolean v){
        STRB(LPC11U68.GPIO_BYTE + port*32 + pin, (byte) v);
    }

    public static final EXT PIN0 = new EXT(1, 19){
            void setFunction(){
                STR(LPC11U68.PIO1_19, func | (mode<<3) | (invert<<6) | (1<<7));
            }

            // PIO1_19 U2_CTS SCT0_OUT0 R_28
            public void setSpecial(uint func){ // PWM
                if(func == 0) func = 2;
                this.func = func;
                setFunction();
            }
        };
    
    public static final EXT PIN1 = new EXT(0, 11){
            void setFunction(){
                STR(LPC11U68.PIO0_11, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN2 = new EXT(0, 12){
            void setFunction(){
                STR(LPC11U68.PIO0_12, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN3 = new EXT(0, 13){
            void setFunction(){
                STR(LPC11U68.PIO0_13, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN4 = new EXT(0, 14){
            void setFunction(){
                STR(LPC11U68.PIO0_14, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN5 = new EXT(0, 17){
            void setFunction(){
                STR(LPC11U68.PIO0_17, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN6 = new EXT(0, 18){
            void setFunction(){
                STR(LPC11U68.PIO0_18, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN7 = new EXT(0, 19){
            void setFunction(){
                STR(LPC11U68.PIO0_19, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN8 = new EXT(1, 20){
            void setFunction(){
                STR(LPC11U68.PIO1_20, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN9 = new EXT(1, 21){
            void setFunction(){
                STR(LPC11U68.PIO1_21, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN10 = new EXT(1, 22){
            void setFunction(){
                STR(LPC11U68.PIO1_22, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN11 = new EXT(1, 23){
            void setFunction(){
                STR(LPC11U68.PIO1_23, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN12 = new EXT(1, 5){
            void setFunction(){
                STR(LPC11U68.PIO1_5, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN13 = new EXT(1, 6){
            void setFunction(){
                STR(LPC11U68.PIO1_6, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN14 = new EXT(1, 8){
            void setFunction(){
                STR(LPC11U68.PIO1_8, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN15 = new EXT(1, 26){
            void setFunction(){
                STR(LPC11U68.PIO1_26, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

    public static final EXT PIN17 = new EXT(0, 16){
            void setFunction(){
                STR(LPC11U68.PIO0_16, func | (mode<<3) | (invert<<6) | (1<<7));
            }
        };

}
