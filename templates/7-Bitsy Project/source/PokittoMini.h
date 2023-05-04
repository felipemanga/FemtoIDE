inline bool aBtn(){ return *((volatile char*)(0xA0000000 + 1*0x20 + 9)); }
inline bool bBtn(){ return *((volatile char*)(0xA0000000 + 1*0x20 + 4)); }
inline bool cBtn(){ return *((volatile char*)(0xA0000000 + 1*0x20 + 10)); }
inline bool upBtn(){ return *((volatile char*)(0xA0000000 + 1*0x20 + 13)); }
inline bool downBtn(){ return *((volatile char*)(0xA0000000 + 1*0x20 + 3)); }
inline bool leftBtn(){ return *((volatile char*)(0xA0000000 + 1*0x20 + 25)); }
inline bool rightBtn(){ return *((volatile char*)(0xA0000000 + 1*0x20 + 7)); }

inline void writePixel(int color){
    volatile int *LCD = (volatile int*) (0xA0002188);
    LCD[124>>2] = 1<<12;
    LCD[ 0 ] = color<<3;
    LCD[252>>2] = 1<<12;
}

inline void enableSysTick(){
    volatile unsigned int *SysTick = (unsigned int *) 0xE000E010UL;
    SysTick[1] = 480000-1; // OSCT = 0
    // SysTick[1] = 7200000-1; // OSCT = 2
    SysTick[2] = 0;
    SysTick[0] = 4 | 2 | 1; //CLKSOURCE=CPU clock | TICKINT | ENABLE
}

inline void enableDAC(){
    volatile unsigned int *PIO1 = (volatile unsigned int *) 0x40044060;
    volatile unsigned int *PIO2 = (volatile unsigned int *) 0x400440F0;
    volatile unsigned int *DIR1 = (volatile unsigned int *) 0xA0002004;
    volatile unsigned int *DIR2 = (volatile unsigned int *) 0xA0002008;
    PIO1[28] = PIO1[29] = PIO1[30] = PIO1[31] = 1<<7;
    PIO2[20] = PIO2[21] = PIO2[22] = PIO2[23] = 1<<7;
    *DIR1 |= (1<<28) | (1<<29) | (1<<30) | (1<<31);
    *DIR2 |= (1<<20) | (1<<21) | (1<<22) | (1<<23);
}

inline void writeDAC(unsigned char out){
    volatile unsigned char *P1 = (volatile unsigned char *) 0xA0000020;
    volatile unsigned char *P2 = (volatile unsigned char *) 0xA0000040;
    P1[28] = out&1; out >>= 1;
    P1[29] = out&1; out >>= 1;
    P1[30] = out&1; out >>= 1;
    P1[31] = out&1; out >>= 1;
    P2[20] = out&1; out >>= 1;
    P2[21] = out&1; out >>= 1;
    P2[22] = out&1; out >>= 1;
    P2[23] = out;
}