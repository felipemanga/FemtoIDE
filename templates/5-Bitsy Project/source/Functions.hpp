namespace Functions {

  void say( const Block *b ){
    
    uint32_t childCount = 0;
    if( b->children )
      childCount = b->children[0];

    for( uint32_t i=0; i<childCount; ++i ){
      exec( b->children[i+1] );
      switch( retVal.type ){
      case VarType::Float:
    	retVal.s = std::to_string( retVal.f );
	    if(0){
    	/* falls through */
      case VarType::Integer:
    	retVal.s = std::to_string( retVal.i );
    	}
      case VarType::String:
	    ::print( retVal.s.c_str() );
	    break;
      case VarType::Void:
      default:
	    break;
      }
    }

  }
  
  void print( const Block *b ){
      say(b);
  }

  void item( const Block *b ){
    exec( b->children[1] );
    
    retVal.type = VarType::Integer;
    retVal.i = 0;
    
    if( retVal.type == VarType::String ){
      for( uint32_t i=0; i<itemCount; ++i ){
	if( retVal.s == items[i].name ){
	  retVal.i = playerInventory[ i ];
	  return;
	}
      }
    }
      
  }

  void clr1( const Block * ){
    auto &pal = palettes[player.roomId-1];
    if( Display::directcolor == pal[0] )
      Display::directcolor = 0xFFFF;
    else
      Display::directcolor = pal[0];
  }

  void clr2( const Block * ){
    auto &pal = palettes[player.roomId-1];
    if( Display::directcolor == pal[1] )
      Display::directcolor = 0xFFFF;
    else
      Display::directcolor = pal[1];
  }

  void clr3( const Block * ){
    auto &pal = palettes[player.roomId-1];
    if( Display::directcolor == pal[2] )
      Display::directcolor = 0xFFFF;
    else
      Display::directcolor = pal[2];
  }

  void br( const Block * ){
    ::print("\n");
  }

  void shk( const Block * ){
  }

  void wvy( const Block * ){
  }

  void rbw( const Block * ){
  }

}
