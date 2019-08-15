package femto.sound;
import femto.hardware.IRQ;
import static java.lang.System.memory.*;
import femto.hardware.LPC11U68;
import femto.hardware.Timer;

/// Provides an interface to the hardware's sound playing capabilities.
public class Mixer {
    private static Procedural channel0;
    private static Procedural channel1;
    private static Procedural channel2;
    private static Procedural channel3;
    private static int multiplier = 1;
    private static int shifter = 0;

    /// @brief
    /// Initialises the `Mixer`'s global state.
    ///  This method must be called before any of `Mixer`'s other methods can be used.
    ///
    public static void init(){
        init(8000);
    }
    
    /// @brief
    /// Initialises the `Mixer`'s global state.
    ///  This method must be called before any of `Mixer`'s other methods can be used.
    ///
    /// @param
    /// frequency The frequency at which the sound output is to be updated. Must be a positive value.
    public static void init( int frequency ){
        if( frequency <= 0 )
            frequency = 8000;

        STR(LPC11U68.PIO1_28, 1<<7);
        STR(LPC11U68.PIO1_29, 1<<7);
        STR(LPC11U68.PIO1_30, 1<<7);
        STR(LPC11U68.PIO1_31, 1<<7);
        STR(LPC11U68.PIO2_20, 1<<7);
        STR(LPC11U68.PIO2_21, 1<<7);
        STR(LPC11U68.PIO2_22, 1<<7);
        STR(LPC11U68.PIO2_23, 1<<7);
        SET(LPC11U68.GPIO_PORT_DIR1, (1<<28) | (1<<29) | (1<<30) | (1<<31));
        SET(LPC11U68.GPIO_PORT_DIR2, (1<<20) | (1<<21) | (1<<22) | (1<<23));
        
        Timer.interval(0, frequency);
    }

    /// @brief
    /// Get the sound currently associated to a specified channel.
    ///
    /// @param
    /// channel The channel to get the sound from. Must be between 0 and 3 inclusive.
    public static Procedural getChannel(int channel){
        switch(channel&3){
        case 0: return channel0;
        case 1: return channel1;
        case 2: return channel2;
        case 3: return channel3;
        }
        return null;
    }
    
    /// @brief
    /// Assign the specified sound to be played on the specified channel.
    ///
    /// @param
    /// channel The channel to play the sound on. Must be between 0 and 3 inclusive.
    /// @param
    /// proc The sound to be assigned to the channel.
    public static void setChannel(int channel, Procedural proc){
        switch(channel&3){
        case 0: channel0 = proc; break;
        case 1: channel1 = proc; break;
        case 2: channel2 = proc; break;
        case 3: channel3 = proc; break;
        default: return;
        }
        if( proc )
            proc.reset();
    }

    /// @brief
    /// Sets the master volume for all played sounds.
    ///
    /// @param
    /// volume The volume level. Must be between 0 and 4 inclusive.
    public static void setVolume(int volume){
        switch(volume){
        case 0: multiplier = 0; shifter = 0; return;
        case 1: multiplier = 1; shifter = 4; return;
        case 2: multiplier = 1; shifter = 2; return;
        case 3: multiplier = 1; shifter = 0; return;
        case 4: multiplier = 4; shifter = 0; return;
        }
    }

    /// The interrupt request handler. This method must not be called from user code.
    @IRQ(name="TIMER32_0")
    public static void onIRQ(){
        if( !Timer.match(0) ) return;

        int out = 0;
        if( channel0 ) out += ((int) channel0.update()) - 128;
        if( channel1 ) out += ((int) channel1.update()) - 128;
        if( channel2 ) out += ((int) channel2.update()) - 128;
        if( channel3 ) out += ((int) channel3.update()) - 128;

        out = (out*multiplier>>shifter) + 128;

        if( out < 0 ) out = 0;
        if( out > 255 ) out = 255;

        STRB( LPC11U68.GPIO_P1_BASE + 28, out&1 ); out >>= 1;
        STRB( LPC11U68.GPIO_P1_BASE + 29, out&1 ); out >>= 1;
        STRB( LPC11U68.GPIO_P1_BASE + 30, out&1 ); out >>= 1;
        STRB( LPC11U68.GPIO_P1_BASE + 31, out&1 ); out >>= 1;
        STRB( LPC11U68.GPIO_P2_BASE + 20, out&1 ); out >>= 1;
        STRB( LPC11U68.GPIO_P2_BASE + 21, out&1 ); out >>= 1;
        STRB( LPC11U68.GPIO_P2_BASE + 22, out&1 ); out >>= 1;
        STRB( LPC11U68.GPIO_P2_BASE + 23, out&1 ); out >>= 1;
    }
}
