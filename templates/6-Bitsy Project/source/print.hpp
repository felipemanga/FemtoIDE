
void inc_txtline();
int32_t minCursorY = 0;
int32_t maxCursorY = POK_LCD_H-8;
int32_t printCount, forceWait;

void updateButtons(){
  auto old = Buttons::buttons_state;
  int var = 0;
  if (cBtn()) var |= (1<<CBIT);
  if (bBtn()) var |= (1<<BBIT);
  if (aBtn()) var |= (1<<ABIT); // P1_9 = A
  if (downBtn()) var |= (1<<DOWNBIT);
  if (leftBtn()) var |= (1<<LEFTBIT);
  if (rightBtn()) var |= (1<<RIGHTBIT);
  if (upBtn()) var |= (1<<UPBIT);

  Buttons::buttons_state = var;
  Buttons::buttons_held = old & var;
}

void wait(){
  do{ updateButtons(); }while( Buttons::buttons_state );
  Core::wait(10);
  do{ updateButtons(); }while( !Buttons::buttons_state );
  do{ updateButtons(); }while( Buttons::buttons_state );
}

void fill_txtline(){
  auto top = Display::cursorY;
  auto bottom = Display::cursorY + Display::font[1] + Display::adjustLineStep;
  DIRECT::fillRect( 0, top, POK_LCD_W, bottom - top, COLOR_BLACK );  
}

void print( const char text[] ){
    
    auto &cursorX = Display::cursorX;
    auto &cursorY = Display::cursorY;
    const auto &font = Display::font;
    int32_t m_w = POK_LCD_W - 5;

    if(cursorX <= 5)
        fill_txtline();
    int end = -1;
    
  for( int i=0; text[i]; ++i ){
    printCount++;

    char c = text[i];
    updateButtons();
    if( !Buttons::buttons_state || forceWait ){
      if( !Buttons::buttons_state ) forceWait = 0;
      Core::wait(100);
    }

    int charstep=0;
  
      // only caps in this font
    if(font[3] && c>=97) 
        c-=32;

    switch(c) {
    case '\n':			//line feed
      inc_txtline();
      cursorX = 5;
      break;
    case 8:				//backspace
      cursorX -= font[0] + Display::adjustCharStep;
      charstep = Display::print_char(cursorX,cursorY,' ');
      break;
    case 13:			//carriage return
      cursorX = 0;
      break;
    case 14:			//form feed new page(clear screen)
      //clear_screen();
      break;
    default:

        // calculate word width
        int ww = 0;
        if( end == i-1 ){
        
            for( end=i; text[end]>32; end++ ){
                int ec = text[end];
                if( font[3] && ec >= 97 ) ec -= 32;
                ec -= font[2];
                ww += font[ 4 + ec * (font[0] * ((font[1]>>3)+!!(font[1]&0x7))+1) ] + Display::adjustCharStep;
            }
            
            ww *= Display::fontSize;
            
            if( (ww + cursorX) >= m_w && cursorX > 5 ){
                inc_txtline();
                cursorX = 5;
            }
	
        }
      
      if (cursorX >= (m_w - font[0])) {
        inc_txtline();
        cursorX = 5;	
      }
      
      if( c<=32 && cursorX == 5 )
    	break;
      
      charstep=Display::print_char(cursorX,cursorY,c);
			   
      if (c==' ' && Display::adjustCharStep) charstep=(charstep>>1)+1;
      cursorX += charstep;
    }

  }

}

void inc_txtline(){
  Display::cursorY += Display::font[1] + Display::adjustLineStep;

  if( Display::cursorY >= maxCursorY ){
    wait();
    DIRECT::fillRect( 0, minCursorY, POK_LCD_W, maxCursorY - minCursorY, COLOR_BLACK );  
    Display::cursorY = minCursorY;
  }

  fill_txtline();
}
