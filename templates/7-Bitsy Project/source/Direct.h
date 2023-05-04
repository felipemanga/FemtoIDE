#pragma once

namespace DIRECT {

    volatile uint32_t * const MPIN2 = (uint32_t *) 0xA0002188;
    
    volatile uint32_t * const CLR_CD = (uint32_t *) 0xA0002280;
    volatile uint32_t * const SET_CD = (uint32_t *) 0xA0002200;
    const uint32_t CD_PIN = 1<<2;
    
    volatile uint32_t * const CLR_WR = (uint32_t *) 0xA0002284;
    volatile uint32_t * const SET_WR = (uint32_t *) 0xA0002204;
    const uint32_t WR_PIN = 1<<12;
    
    inline void setup_data(uint16_t data)
    {
	    *MPIN2 = uint32_t(data)<<3; // write bits to port
    }


/**************************************************************************/
/*!
  @brief  Write a command to the lcd, 16-bit bus
*/
/**************************************************************************/
    inline void write_command(uint16_t data)
    {
    	*CLR_CD = CD_PIN; // CLR_CD; // clear CD = command
    	setup_data(data); // function that inputs the data into the relevant bus lines
    	
    	// CLR_WR_SLOW;  // WR low
    	*CLR_WR = WR_PIN;
    	__asm("nop");
    	*SET_WR = WR_PIN;
    }

    inline void toggle_data(){
    	*CLR_WR = WR_PIN;
    	__asm("nop");
    	*SET_WR = WR_PIN;
    }

    inline void write_data(uint16_t data)
    {
    	*SET_CD = CD_PIN;
    	setup_data(data);
    	toggle_data();
    }

    void goToXY( uint32_t x, uint32_t y ){
    	write_command(0x20);
    	write_data(y);
    	write_command(0x21);
    	write_data(x);
    	write_command(0x22);
    }

    void setPixel( uint32_t x, uint32_t y, uint32_t color ){
    	if( x>=220 || y>=176 ) return;
    	goToXY( x, y );
    
    	*SET_CD = CD_PIN;
    	setup_data( color );
    	
    	*CLR_WR = WR_PIN;
    	__asm("nop");
    	*SET_WR = WR_PIN;
    }

    void setWindow(uint8_t x1, uint8_t y1, uint8_t x2, uint8_t y2) {
    	write_command(0x37); write_data(x1);
    	write_command(0x36); write_data(x2);
    	write_command(0x39); write_data(y1);
    	write_command(0x38); write_data(y2);
    	write_command(0x20); write_data(x1);
    	write_command(0x21); write_data(y1);
    }
    
    void fillRect( int32_t x, int32_t y, uint32_t w, uint32_t h, uint32_t color ){
        if( x >= 220 || y >= 176 ) return;
        if( y < 0 ){
        	h += y;
        	y = 0;
        }
        if( x < 0 ){
        	w += x;
        	x = 0;
        }
        if( y+h >= 176 )
        	h = 176 - y;
        if( x+w >= 220 )
        	w = 220 - x;
        
        setWindow(y, x, y+h-1, x+w-1);
    	write_command( 0x22 );
    	*SET_CD = CD_PIN;
    	setup_data( color );
    	for(y=0; y<h; ++y){
    	    for(x=0; x<w; ++x){
        	    toggle_data();
        	}
        }
    }

}
