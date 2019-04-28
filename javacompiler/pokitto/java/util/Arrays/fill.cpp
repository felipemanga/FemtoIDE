auto begin = a->elements + fromIndex;
auto end = a->elements + toIndex;
for( auto ptr = begin; ptr != end; ++ptr )
    *ptr = val;
