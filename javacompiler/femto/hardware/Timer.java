package femto.hardware;

import static java.lang.System.memory.*;

class TMR {				/*!< TIMERn Structure       */
	public static final int IR = 0;			/*!< Interrupt Register. The IR can be written to clear interrupts. The IR can be read to identify which of eight possible interrupt sources are pending. */
	public static final int TCR = 1*4;			/*!< Timer Control Register. The TCR is used to control the Timer Counter functions. The Timer Counter can be disabled or reset through the TCR. */
	public static final int TC = 2*4;			/*!< Timer Counter. The 32 bit TC is incremented every PR+1 cycles of PCLK. The TC is controlled through the TCR. */
	public static final int PR = 3*4;			/*!< Prescale Register. The Prescale Counter (below) is equal to this value, the next clock increments the TC and clears the PC. */
	public static final int PC = 4*4;			/*!< Prescale Counter. The 32 bit PC is a counter which is incremented to the value stored in PR. When the value in PR is reached, the TC is incremented and the PC is cleared. The PC is observable and controllable through the bus interface. */
	public static final int MCR = 5*4;			/*!< Match Control Register. The MCR is used to control if an interrupt is generated and if the TC is reset when a Match occurs. */
	public static final int MR = 6*4;		/*!< Match Register. MR can be enabled through the MCR to reset the TC, stop both the TC and PC, and/or generate an interrupt every time MR matches the TC. */
	public static final int CCR = 10*4;			/*!< Capture Control Register. The CCR controls which edges of the capture inputs are used to load the Capture Registers and whether or not an interrupt is generated when a capture takes place. */
	public static final int CR = 11*4;		/*!< Capture Register. CR is loaded with the value of TC when there is an event on the CAPn.0 input. */
	public static final int EMR = 15*4;			/*!< External Match Register. The EMR controls the external match pins MATn.0-3 (MAT0.0-3 and MAT1.0-3 respectively). */
	public static final int CTCR = (16+12)*4;			/*!< Count Control Register. The CTCR selects between Timer and Counter mode, and in Counter mode selects the signal and edge(s) for counting. */
	public static final int PWMC = (17+12)*4;
}

public class Timer {
    
    private static final int TIMER_RESET = 1 << 1;
    private static final int TIMER_ENABLE = 1 << 0;

    private static int _BIT(int n){ return 1 << n; }

// Macro to clear interrupt pending
    private static int TIMER_IR_CLR(int n){ return _BIT(n); }

// Macro for getting a timer match interrupt bit
    private static int TIMER_MATCH_INT(int n){ return _BIT(n & 0x0F); }
// Macro for getting a capture event interrupt bit
    private static int TIMER_CAP_INT(int n){ return _BIT((((n) & 0x0F) + 4)); }

// Bit location for interrupt on MRx match, n = 0 to 3
    private static int TIMER_INT_ON_MATCH(int n){ return (_BIT(((n) * 3))); }
// Bit location for reset on MRx match, n = 0 to 3
    private static int TIMER_RESET_ON_MATCH(int n){ return (_BIT((((n) * 3) + 1))); }
// Bit location for stop on MRx match, n = 0 to 3
    private static int TIMER_STOP_ON_MATCH(int n){ return (_BIT((((n) * 3) + 2))); }

// Bit location for CAP.n on CRx rising edge, n = 0 to 3
    private static int TIMER_CAP_RISING(int n){ return (_BIT(((n) * 3))); }
// Bit location for CAP.n on CRx falling edge, n = 0 to 3
    private static int TIMER_CAP_FALLING(int n){ return (_BIT((((n) * 3) + 1))); }
// Bit location for CAP.n on CRx interrupt enable, n = 0 to 3
    private static int TIMER_INT_ON_CAP(int n){ return (_BIT((((n) * 3) + 2))); }

    public static void interval(int number, int frequency){
        int timerFreq = init(number);
        matchEnableInt(number, 1);
    	setMatch(number, 1, timerFreq / frequency);
    	resetOnMatchEnable(number, 1);
    	enable(number);
    }

    /// Initializes a timer. Number can be 1 or 0.
    public static int init(int number){
        /*
        pTMR = LPC_TIMER32_0;
        clk = Chip_TIMER_GetClock(pTMR);
        Chip_Clock_EnablePeriphClock(clk);
        LPC_SYSCTL->SYSAHBCLKCTRL |= (1 << clk);
        */
        SET( LPC11U68.SYSAHBCLKCTRL, 1 << (number == 0 ? LPC11U68.SYSCTL_CLOCK.CT32B0 : LPC11U68.SYSCTL_CLOCK.CT32B1) );
        
        /*
        syspllinclock = Chip_Clock_GetMainOscRate() = 12000000;

	uint32_t msel = ((*LPC_SYSCTL->SYSPLLCTRL & 0x1F) + 1);
	return syspllinclock * msel;

	    pllOutClockRate = Chip_Clock_GetPLLFreq(LPC_SYSCTL->SYSPLLCTRL,
								 Chip_Clock_GetSystemPLLInClockRate());

        
		clkRate = Chip_Clock_GetSystemPLLOutClockRate();
    	timerFreq = Chip_Clock_GetMainClockRate() / LPC_SYSCTL->SYSAHBCLKDIV;
        */

        int msel = (LDR(LPC11U68.SYSPLLCTRL) & 0x1F) + 1;
        int timerFreq = 12000000 * msel / (int) LDR(LPC11U68.SYSAHBCLKDIV);
        
        reset(number);
        
        return timerFreq;
    }
    
    public static void matchEnableInt( int number, int matchnum ){
        pointer address = number == 0 ? LPC11U68.TIMER32_0_BASE : LPC11U68.TIMER32_1_BASE;
    	SET(address + TMR.MCR, TIMER_INT_ON_MATCH(matchnum));
        STR(LPC11U68.NVIC_BASE, 1 << (18 & 0x1F));
    }
    
    public static void setMatch( int number, int matchnum, int matchval ){
        pointer address = number == 0 ? LPC11U68.TIMER32_0_BASE : LPC11U68.TIMER32_1_BASE;
    	STR(address + TMR.MR + matchnum * 4, matchval);
    }
    
    public static void resetOnMatchEnable( int number, int matchnum ){
        pointer address = number == 0 ? LPC11U68.TIMER32_0_BASE : LPC11U68.TIMER32_1_BASE;
    	SET(address + TMR.MCR, TIMER_RESET_ON_MATCH(matchnum));
    }

    public static boolean match( int number ){
    	return match(number, 1);
    }

    public static boolean match( int number, int matchnum ){
        pointer address = number == 0 ? LPC11U68.TIMER32_0_BASE : LPC11U68.TIMER32_1_BASE;
    	boolean hasMatch = (LDR(address + TMR.IR) & TIMER_MATCH_INT(matchnum)) != 0;
    	if( hasMatch ){
        	STR(address + TMR.IR, TIMER_IR_CLR(matchnum));
    	}
    	return hasMatch;
    }
    
    public static void reset( int number ){
        pointer address = number == 0 ? LPC11U68.TIMER32_0_BASE : LPC11U68.TIMER32_1_BASE;
    	int reg;
    
    	/* Disable timer, set terminal count to non-0 */
    	reg = LDR(address + TMR.TCR);
    	STR(address + TMR.TCR, 0);
    	STR(address + TMR.TC, 1);
    
    	/* Reset timer counter */
    	STR(address + TMR.TCR, TIMER_RESET);
    
    	/* Wait for terminal count to clear */
    	while( LDR(address + TMR.TC) != 0 ){}
    
    	/* Restore timer state */
    	STR(address + TMR.TCR, reg);
    }
    
    public static void enable( int number ){
        pointer address = number == 0 ? LPC11U68.TIMER32_0_BASE : LPC11U68.TIMER32_1_BASE;
	    SET( address + TMR.TCR, TIMER_ENABLE );
    }
}
