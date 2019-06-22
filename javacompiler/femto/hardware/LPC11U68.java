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
    
    public static final pointer  PIO0_0 = (pointer) 0x40044000+4*0;
    public static final pointer  PIO0_1 = (pointer) 0x40044000+4*1;
    public static final pointer  PIO0_2 = (pointer) 0x40044000+4*2;
    public static final pointer  PIO0_3 = (pointer) 0x40044000+4*3;
    public static final pointer  PIO0_4 = (pointer) 0x40044000+4*4;
    public static final pointer  PIO0_5 = (pointer) 0x40044000+4*5;
    public static final pointer  PIO0_6 = (pointer) 0x40044000+4*6;
    public static final pointer  PIO0_7 = (pointer) 0x40044000+4*7;
    public static final pointer  PIO0_8 = (pointer) 0x40044000+4*8;
    public static final pointer  PIO0_9 = (pointer) 0x40044000+4*9;
    public static final pointer  PIO0_10 = (pointer) 0x40044000+4*10;
    public static final pointer  PIO0_11 = (pointer) 0x40044000+4*11;
    public static final pointer  PIO0_12 = (pointer) 0x40044000+4*12;
    public static final pointer  PIO0_13 = (pointer) 0x40044000+4*13;
    public static final pointer  PIO0_14 = (pointer) 0x40044000+4*14;
    public static final pointer  PIO0_15 = (pointer) 0x40044000+4*15;
    public static final pointer  PIO0_16 = (pointer) 0x40044000+4*16;
    public static final pointer  PIO0_17 = (pointer) 0x40044000+4*17;
    public static final pointer  PIO0_18 = (pointer) 0x40044000+4*18;
    public static final pointer  PIO0_19 = (pointer) 0x40044000+4*19;
    public static final pointer  PIO0_20 = (pointer) 0x40044000+4*20;
    public static final pointer  PIO0_21 = (pointer) 0x40044000+4*21;
    public static final pointer  PIO0_22 = (pointer) 0x40044000+4*22;
    public static final pointer  PIO0_23 = (pointer) 0x40044000+4*23;
    public static final pointer  PIO0_24 = (pointer) 0x40044000+4*24;
    public static final pointer  PIO0_25 = (pointer) 0x40044000+4*25;
    public static final pointer  PIO0_26 = (pointer) 0x40044000+4*26;
    public static final pointer  PIO0_27 = (pointer) 0x40044000+4*27;
    public static final pointer  PIO0_28 = (pointer) 0x40044000+4*28;
    public static final pointer  PIO0_29 = (pointer) 0x40044000+4*29;
    public static final pointer  PIO0_30 = (pointer) 0x40044000+4*30;
    public static final pointer  PIO0_31 = (pointer) 0x40044000+4*31;

    public static final pointer  PIO1_0 = (pointer) 0x40044060+4*0;
    public static final pointer  PIO1_1 = (pointer) 0x40044060+4*1;
    public static final pointer  PIO1_2 = (pointer) 0x40044060+4*2;
    public static final pointer  PIO1_3 = (pointer) 0x40044060+4*3;
    public static final pointer  PIO1_4 = (pointer) 0x40044060+4*4;
    public static final pointer  PIO1_5 = (pointer) 0x40044060+4*5;
    public static final pointer  PIO1_6 = (pointer) 0x40044060+4*6;
    public static final pointer  PIO1_7 = (pointer) 0x40044060+4*7;
    public static final pointer  PIO1_8 = (pointer) 0x40044060+4*8;
    public static final pointer  PIO1_9 = (pointer) 0x40044060+4*9;
    public static final pointer  PIO1_10 = (pointer) 0x40044060+4*10;
    public static final pointer  PIO1_11 = (pointer) 0x40044060+4*11;
    public static final pointer  PIO1_12 = (pointer) 0x40044060+4*12;
    public static final pointer  PIO1_13 = (pointer) 0x40044060+4*13;
    public static final pointer  PIO1_14 = (pointer) 0x40044060+4*14;
    public static final pointer  PIO1_15 = (pointer) 0x40044060+4*15;
    public static final pointer  PIO1_16 = (pointer) 0x40044060+4*16;
    public static final pointer  PIO1_17 = (pointer) 0x40044060+4*17;
    public static final pointer  PIO1_18 = (pointer) 0x40044060+4*18;
    public static final pointer  PIO1_19 = (pointer) 0x40044060+4*19;
    public static final pointer  PIO1_20 = (pointer) 0x40044060+4*20;
    public static final pointer  PIO1_21 = (pointer) 0x40044060+4*21;
    public static final pointer  PIO1_22 = (pointer) 0x40044060+4*22;
    public static final pointer  PIO1_23 = (pointer) 0x40044060+4*23;
    public static final pointer  PIO1_24 = (pointer) 0x40044060+4*24;
    public static final pointer  PIO1_25 = (pointer) 0x40044060+4*25;
    public static final pointer  PIO1_26 = (pointer) 0x40044060+4*26;
    public static final pointer  PIO1_27 = (pointer) 0x40044060+4*27;
    public static final pointer  PIO1_28 = (pointer) 0x40044060+4*28;
    public static final pointer  PIO1_29 = (pointer) 0x40044060+4*29;
    public static final pointer  PIO1_30 = (pointer) 0x40044060+4*30;
    public static final pointer  PIO1_31 = (pointer) 0x40044060+4*31;

    public static final pointer  PIO2_0 = (pointer) 0x400440F0+4*0;
    public static final pointer  PIO2_1 = (pointer) 0x400440F0+4*1;
    public static final pointer  PIO2_2 = (pointer) 0x400440F0+4*2;
    public static final pointer  PIO2_3 = (pointer) 0x400440F0+4*3;
    public static final pointer  PIO2_4 = (pointer) 0x400440F0+4*4;
    public static final pointer  PIO2_5 = (pointer) 0x400440F0+4*5;
    public static final pointer  PIO2_6 = (pointer) 0x400440F0+4*6;
    public static final pointer  PIO2_7 = (pointer) 0x400440F0+4*7;
    public static final pointer  PIO2_8 = (pointer) 0x400440F0+4*8;
    public static final pointer  PIO2_9 = (pointer) 0x400440F0+4*9;
    public static final pointer  PIO2_10 = (pointer) 0x400440F0+4*10;
    public static final pointer  PIO2_11 = (pointer) 0x400440F0+4*11;
    public static final pointer  PIO2_12 = (pointer) 0x400440F0+4*12;
    public static final pointer  PIO2_13 = (pointer) 0x400440F0+4*13;
    public static final pointer  PIO2_14 = (pointer) 0x400440F0+4*14;
    public static final pointer  PIO2_15 = (pointer) 0x400440F0+4*15;
    public static final pointer  PIO2_16 = (pointer) 0x400440F0+4*16;
    public static final pointer  PIO2_17 = (pointer) 0x400440F0+4*17;
    public static final pointer  PIO2_18 = (pointer) 0x400440F0+4*18;
    public static final pointer  PIO2_19 = (pointer) 0x400440F0+4*19;
    public static final pointer  PIO2_20 = (pointer) 0x400440F0+4*20;
    public static final pointer  PIO2_21 = (pointer) 0x400440F0+4*21;
    public static final pointer  PIO2_22 = (pointer) 0x400440F0+4*22;
    public static final pointer  PIO2_23 = (pointer) 0x400440F0+4*23;
    public static final pointer  PIO2_24 = (pointer) 0x400440F0+4*24;
    public static final pointer  PIO2_25 = (pointer) 0x400440F0+4*25;
    public static final pointer  PIO2_26 = (pointer) 0x400440F0+4*26;
    public static final pointer  PIO2_27 = (pointer) 0x400440F0+4*27;
    public static final pointer  PIO2_28 = (pointer) 0x400440F0+4*28;
    public static final pointer  PIO2_29 = (pointer) 0x400440F0+4*29;
    public static final pointer  PIO2_30 = (pointer) 0x400440F0+4*30;
    public static final pointer  PIO2_31 = (pointer) 0x400440F0+4*31;
     
    public static final pointer  ARM_NVIC_ISER = (pointer) 0xe000e100;
    public static final pointer AIRCR = (pointer) 0xE000ED0C;
}
