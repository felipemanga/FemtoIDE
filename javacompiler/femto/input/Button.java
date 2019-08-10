package femto.input;

import static java.lang.System.memory.*;
import femto.hardware.LPC11U68;
import femto.hardware.IRQ;

/// This class represents a pressable button.
public class Button {
    byte port;
    byte bit;
    byte state;

    ButtonListener listener;

    Button( uint port, uint bit ){
        this.port = port;
        this.bit = bit;
    }

    /// Registers the specified `ButtonListener` to this button.
    /// There can be only one `ButtonListener` per button.
    public void attach( ButtonListener listener ){
        this.listener = listener;
    }

    /// Deregisters this button's `ButtonListener`.
    public void detach(){
        this.listener = null;
    }

    public uint intpin(){
        uint r = bit;
        if( port == 1 ) r += 24;
        else if( port == 2 ) r += 56;
        return r;
    }

    @IRQ(name="PIN_INT0")
    public static void _irq0_(){
        if( Flash.listener )
            Flash.listener.change(Flash);
        STR(LPC11U68.IST, 1<<0);
    }
    
    @IRQ(name="PIN_INT1")
    public static void _irq1_(){
        if( Reset.listener )
            Reset.listener.change(Reset);
        STR(LPC11U68.IST, 1<<1);
    }
    
    public static void enableInterrupts(){
        STR(LPC11U68.PINTSEL0, Flash.intpin());
        STR(LPC11U68.PINTSEL1, Reset.intpin());
        SET(LPC11U68.IENR, 0x3);
    }

    static {
        Flash.attach(new ButtonListener(){
                public void change(Button button){
                    STR(LPC11U68.AIRCR, 0x05FA0004);
                }
            });
    }

    /// Returns `true` if the button has just transition from being released to being pressed.
    public boolean justPressed(){
        var newState = isPressed();
        var ret = false;
        if( newState && !state )
            ret = true;
        state = newState;
        return ret;
    }

    /// Returns `true` if the button is pressed.
    public boolean isPressed(){
        pointer addr = LPC11U68.GPIO_BYTE;
        addr += port*0x20;
        addr += bit;
        return LDRB( addr ) != 0;
    }

    /// The `Button` object representing the Pokitto's A button.
    public static final Button A = new Button(1, 9);

    /// The `Button` object representing the Pokitto's B button.
    public static final Button B = new Button(1, 4);

    /// The `Button` object representing the Pokitto's C button.
    public static final Button C = new Button(1, 10);

    /// The `Button` object representing the Pokitto's flash button.
    public static final Button Flash = new Button(0, 1);

    /// The `Button` object representing the Pokitto's reset button.
    public static final Button Reset = new Button(0, 0);

    /// The `Button` object representing the Pokitto's up button.
    public static final Button Up = new Button(1, 13);

    /// The `Button` object representing the Pokitto's down button.
    public static final Button Down = new Button(1, 3);

    /// The `Button` object representing the Pokitto's left button.
    public static final Button Left = new Button(1, 25);

    /// The `Button` object representing the Pokitto's right button.
    public static final Button Right = new Button(1, 7);

}
