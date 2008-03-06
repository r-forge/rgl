#ifndef DSTRING_HPP
#define DSTRING_HPP

#ifdef HAVE_FREETYPE

#include "types.h"

class DStringArray : public AutoDestroy
{
public: 
  DStringArray(int ntexts, char **in_texts);
  ~DStringArray();
  const wchar_t* wget(int i) const 
  { 
    if (i<ntexts) { return wptr[i]; } else { return 0; }
  }
  const char *get(int i) const
  {
    if (i<ntexts) { return ptr[i]; } else { return 0; }
  }
  int length() const { return ntexts; }
private:
  int ntexts;
  char *textbuffer;
  char **ptr;
  wchar_t *wtextbuffer;
  wchar_t **wptr;  
};

#endif

#endif
