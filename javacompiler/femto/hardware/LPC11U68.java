package femto.hardware;

public class LPC11U68 {
    public static final pointer  SYSPLLCTRL = (pointer) 0x40048008;
    public static final pointer  SYSOSCCTRL = (pointer) 0x40048020;
    public static final pointer  SYSPLLCLKSTAT = (pointer) 0x4004800C;
    public static final pointer  SYSPLLCLKSEL = (pointer) 0x40048040;
    public static final pointer  SYSPLLCLKUEN = (pointer) 0x40048044;
    public static final pointer  SYSAHBCLKCTRL = (pointer) 0x40048080;

    public static final pointer  MAINCLKSEL = (pointer) 0x40048070;
    public static final pointer  MAINCLKUEN = (pointer) 0x40048074;
    public static final pointer  SYSAHBCLKDIV = (pointer) 0x40048078;
    public static final pointer  USBPLLCTRL = (pointer) 0x40048010;
    public static final pointer  USBPLLSTAT = (pointer) 0x40048014;
    public static final pointer  USBPLLCLKSEL = (pointer) 0x40048048;
    public static final pointer  USBPLLCLKUEN = (pointer) 0x4004804C;
    public static final pointer  USBCLKSEL = (pointer) 0x400480C0;
    public static final pointer  USBCLKDIV = (pointer) 0x400480C8;
    public static final pointer  PDRUNCFG = (pointer) 0x40048238;
    public static final pointer  SYSPLLSTAT = (pointer) 0x4004800C;
    public static final pointer  SSP0CLKDIV = (pointer) 0x40048094;

    public static final pointer  RTCCTRL = (pointer) 0x40024000;
     
    public static final pointer  SPI0_CR0 = (pointer) 0x40040000;
    public static final pointer  SPI0_CR1 = (pointer) 0x40040004;
    public static final pointer  SPI0_CPSR = (pointer) 0x40040010;

    public static final pointer  PRESETCTRL = (pointer) 0x40048004;

    public static final pointer  SCT_CONFIG = (pointer) 0x5000C000;
    public static final pointer  SCT_CTRL = (pointer) 0x5000C004;

    public static final pointer  GPIO_BYTE = (pointer) 0xA0000000;

    public static final pointer  GPIO_PORT_DIR0 = (pointer) 0xA0002000;
    public static final pointer  GPIO_PORT_DIR1 = (pointer) 0xA0002004;
    public static final pointer  GPIO_PORT_DIR2 = (pointer) 0xA0002008;

    public static final pointer  GPIO_PORT_MASK0 = (pointer) 0xA0002080;
    public static final pointer  GPIO_PORT_MASK1 = (pointer) 0xA0002084;
    public static final pointer  GPIO_PORT_MASK2 = (pointer) 0xA0002088;

    public static final pointer  GPIO_PORT_PIN0 = (pointer) 0xA0002100;
    public static final pointer  GPIO_PORT_PIN1 = (pointer) 0xA0002104;
    public static final pointer  GPIO_PORT_PIN2 = (pointer) 0xA0002108;

    public static final pointer  GPIO_PORT_MPIN0 = (pointer) 0xA0002180;
    public static final pointer  GPIO_PORT_MPIN1 = (pointer) 0xA0002184;
    public static final pointer  GPIO_PORT_MPIN2 = (pointer) 0xA0002188;
	
    public static final pointer  GPIO_PORT_CLR0 = (pointer) 0xA0002280;
    public static final pointer  GPIO_PORT_CLR1 = (pointer) 0xA0002284;
    public static final pointer  GPIO_PORT_CLR2 = (pointer) 0xA0002288;

    public static final pointer  GPIO_PORT_SET0 = (pointer) 0xA0002200;
    public static final pointer  GPIO_PORT_SET1 = (pointer) 0xA0002204;
    public static final pointer  GPIO_PORT_SET2 = (pointer) 0xA0002208;

    public static final pointer  GPIO_PORT_NOT0 = (pointer) 0xA0002300;
    public static final pointer  GPIO_PORT_NOT1 = (pointer) 0xA0002304;
    public static final pointer  GPIO_PORT_NOT2 = (pointer) 0xA0002308;

    //  Pin Interrupt Mode register
    public static final pointer ISEL = (pointer) 0xA0004000;
    //  Pin interrupt level or rising edge interrupt enable register
    public static final pointer IENR = (pointer) 0xA0004004;
    //  Pin interrupt level or rising edge interrupt set register
    public static final pointer SIENR = (pointer) 0xA0004008;
    //  Pin interrupt level (rising edge interrupt) clear register
    public static final pointer CIENR = (pointer) 0xA000400C;
    //  Pin interrupt active level or falling edge interrupt enable register
    public static final pointer IENF = (pointer) 0xA0004010;
    //  Pin interrupt active level or falling edge interrupt set register
    public static final pointer SIENF = (pointer) 0xA0004014;
    //  Pin interrupt active level or falling edge interrupt clear register
    public static final pointer CIENF = (pointer) 0xA0004018;
    //  Pin interrupt rising edge register
    public static final pointer RISE = (pointer) 0xA000401C;
    //  Pin interrupt falling edge register
    public static final pointer FALL = (pointer) 0xA0004020;
    //  Pin interrupt status register
    public static final pointer IST = (pointer) 0xA0004024;
    //  Pattern match interrupt control register
    public static final pointer PMCTRL = (pointer) 0xA0004028;
    //  Pattern match interrupt bit-slice source register
    public static final pointer PMSRC = (pointer) 0xA000402C;
    //  Pattern match interrupt bit slice configuration register
    public static final pointer PMCFG = (pointer) 0xA0004030;

    public static final pointer PINTSEL0 = (pointer) 0x40048178;
    public static final pointer PINTSEL1 = (pointer) 0x4004817C;
    public static final pointer PINTSEL2 = (pointer) 0x40048180;
    public static final pointer PINTSEL3 = (pointer) 0x40048184;
    public static final pointer PINTSEL4 = (pointer) 0x40048188;
    public static final pointer PINTSEL5 = (pointer) 0x4004818C;
    public static final pointer PINTSEL6 = (pointer) 0x40048190;
    public static final pointer PINTSEL7 = (pointer) 0x40048194;
    
    public static final pointer  PIO0_6 = (pointer) 0x40044018;
    public static final pointer  PIO0_8 = (pointer) 0x40044020;
    public static final pointer  PIO0_9 = (pointer) 0x40044024;
    public static final pointer  PIO1_31 = (pointer) 0x400440DC;
    public static final pointer  PIO2_0 = (pointer) 0x400440F0;
    public static final pointer  PIO2_1 = (pointer) 0x400440F4;
    public static final pointer  PIO2_2 = (pointer) 0x400440FC;
     
    public static final pointer  ARM_NVIC_ISER = (pointer) 0xe000e100;
    public static final pointer AIRCR = (pointer) 0xE000ED0C;
}
