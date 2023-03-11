namespace Node {

  void literal( const Block *b ){
    retVal = *reinterpret_cast<const Constant *>(b->extra);
  }

  void variable( const Block *b ){
    retVal = *reinterpret_cast<Variable *>(b->extra);
  }
  
  void block( const Block *b ){
    if( b->children ){
      auto childCount = b->children[0];
      for( int i=1; i<=childCount; ++i ){
	exec( b->children[i] );
      }
    }
  }

  void setExp( const Block *b ){
    exec( b->children[1+0] );
    auto &target = vars[retVal.id];
    exec( b->children[1+1] );
    target = retVal;
  }

  void equalExp( const Block *b ){
    exec( b->children[1+0] );
    Variable left = retVal;
    exec( b->children[1+1] );
    Variable right = retVal;
    equalizeTypes( left, right );

    retVal.type = VarType::Integer;    
    
    switch( left.type ){
    case VarType::String:
      retVal.i = left.s == right.s;
      break;
      
    case VarType::Void:
      retVal.i = 0;
      break;
      
    default:
      retVal.i = left.i == right.i;
      break;
    }

  }

  void greaterExp( const Block *b ){
    exec( b->children[1+0] );
    Variable left = retVal;
    exec( b->children[1+1] );
    Variable right = retVal;
    equalizeTypes( left, right );

    switch( left.type ){
    case VarType::Void:
      retVal.i = 0;
      break;
      
    case VarType::String:
      retVal.i = std::stoi(left.s) > std::stoi(right.s);
      break;
    case VarType::Integer:
      retVal.i = left.i > right.i;
      break;
    case VarType::Float:
      retVal.i = left.f > right.f;
      break;
    }
    
    retVal.type = VarType::Integer;
  }

  void lessExp( const Block *b ){
    exec( b->children[1+0] );
    Variable left = retVal;
    exec( b->children[1+1] );
    Variable right = retVal;
    equalizeTypes( left, right );

    switch( left.type ){
    case VarType::Void:
      retVal.i = 0;
      break;
      
    case VarType::String:
      retVal.i = std::stoi(left.s) < std::stoi(right.s);
      break;
    case VarType::Integer:
      retVal.i = left.i < right.i;
      break;
    case VarType::Float:
      retVal.i = left.f < right.f;
      break;
    }
    
    retVal.type = VarType::Integer;
  }

  void greaterEqExp( const Block *b ){
    exec( b->children[1+0] );
    Variable left = retVal;
    exec( b->children[1+1] );
    Variable right = retVal;
    equalizeTypes( left, right );

    switch( left.type ){
    case VarType::Void:
      retVal.i = 0;
      break;
      
    case VarType::String:
      retVal.i = std::stoi(left.s) >= std::stoi(right.s);
      break;
    case VarType::Integer:
      retVal.i = left.i >= right.i;
      break;
    case VarType::Float:
      retVal.i = left.f >= right.f;
      break;
    }
    
    retVal.type = VarType::Integer;
  }

  void lessEqExp( const Block *b ){
    exec( b->children[1+0] );
    Variable left = retVal;
    exec( b->children[1+1] );
    Variable right = retVal;
    equalizeTypes( left, right );

    switch( left.type ){
    case VarType::Void:
      retVal.i = 0;
      break;
      
    case VarType::String:
      retVal.i = std::stoi(left.s) <= std::stoi(right.s);
      break;
    case VarType::Integer:
      retVal.i = left.i <= right.i;
      break;
    case VarType::Float:
      retVal.i = left.f <= right.f;
      break;
    }
    
    retVal.type = VarType::Integer;
  }

  void multExp( const Block *b ){
    exec( b->children[1+0] );
    Variable left = retVal;
    exec( b->children[1+1] );
    Variable right = retVal;

    if( left.type == VarType::String || right.type == VarType::String )
      return;

    equalizeTypes( left, right );

    switch( left.type ){
    case VarType::Void:
      retVal.i = 0;
      break;
      
    case VarType::String:
      break;
    case VarType::Integer:
      retVal.i = left.i * right.i;
      break;
    case VarType::Float:
      retVal.f = left.f * right.f;
      break;
    }
    
    retVal.type = left.type;
  }

  void divExp( const Block *b ){
    exec( b->children[1+0] );
    Variable left = retVal;
    exec( b->children[1+1] );
    Variable right = retVal;

    if( left.type == VarType::String || right.type == VarType::String )
      return;

    equalizeTypes( left, right );

    switch( left.type ){
    case VarType::Void:
      retVal.i = 0;
      break;
      
    case VarType::String:
      break;
    case VarType::Integer:
      retVal.f = static_cast<float>(left.i) / static_cast<float>(right.i);
      break;
    case VarType::Float:
      retVal.f = left.f / right.f;
      break;
    }
    
    retVal.type = left.type;
  }

  void addExp( const Block *b ){
    exec( b->children[1+0] );
    Variable left = retVal;
    exec( b->children[1+1] );
    Variable right = retVal;

    equalizeTypes( left, right );

    switch( left.type ){
    case VarType::Void:
      retVal.i = 0;
      break;
      
    case VarType::String:
      retVal.s = left.s + right.s;
      break;
    case VarType::Integer:
      retVal.i = left.i + right.i;
      break;
    case VarType::Float:
      retVal.f = left.f + right.f;
      break;
    }
    
    retVal.type = left.type;
  }

  void subExp( const Block *b ){
    exec( b->children[1+0] );
    Variable left = retVal;
    exec( b->children[1+1] );
    Variable right = retVal;

    if( left.type == VarType::String || right.type == VarType::String )
      return;

    equalizeTypes( left, right );

    switch( left.type ){
    case VarType::Void:
      retVal.i = 0;
      break;
      
    case VarType::String:
      break;
    case VarType::Integer:
      retVal.i = left.i - right.i;
      break;
    case VarType::Float:
      retVal.f = left.f - right.f;
      break;
    }
    
    retVal.type = left.type;
  }

  void IF( const Block *b ){
    auto childCount = b->children[0];
    for( uint32_t i=1; i<childCount; i+=2 ){
      exec( b->children[i] );
      if( retVal.i ){
	exec( b->children[i+1] );
	return;
      }
    }
  }

  void ELSE( const Block *b ){
    retVal.type = VarType::Integer;
    retVal.i = 1;
  }

  void sequence( const Block *b ){
    auto &state = *reinterpret_cast<uint8_t *>(b->extra);
    auto childCount = b->children[0];

    if( state >= childCount )
      return;

    auto cbid = b->children[ 1 + state ];

    state++;
    if( state >= childCount )
      state = childCount-1;

    exec( cbid );
  }

  void cycle( const Block *b ){
    auto &state = *reinterpret_cast<uint8_t *>(b->extra);
    auto childCount = b->children[0];

    if( state >= childCount )
      return;

    auto cbid = b->children[ 1 + state ];

    state++;
    if( state >= childCount )
      state = 0;

    exec( cbid );
  }

  void shuffle( const Block *b ){
    auto childCount = b->children[0];

    auto cbid = b->children[ 1+(rand()%childCount) ];

    exec( cbid );
  }

}
