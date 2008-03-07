#ifdef HAVE_FREETYPE

#include "DString.hpp"
#include "types.h"
#include "R.h"
#include <cerrno>
#include <R_ext/Riconv.h>
#include <stdlib.h>
#include <limits.h>

DStringArray::DStringArray(int in_ntexts, char **in_texts) {
  
  int i;
  const char *from="UTF-8";
  const char *to="UTF-16LE";
  void* cd=Riconv_open(to, from);
  size_t l1, l2;
  char *ibptr;
  char *obptr;
  int buflen = 0;
  size_t ret;

  ntexts=in_ntexts;

  if (!cd) {
    error("Cannot initialize iconv conversion from %s to %s.", from, to);
  }
  
  for(i=0;i<ntexts;i++) {
    buflen += 1 + ( strlen(in_texts[i]) );
  }

  char *tptr=textbuffer=new char[buflen];
  wtextbuffer=new wchar_t[buflen];

  typedef char* charptr;
  typedef wchar_t * wcharptr;
  ptr = new charptr[ntexts];
  wptr = new wcharptr[ntexts];
  
  obptr=(char*)wtextbuffer;
  l2=buflen * sizeof(wchar_t);
  for (i=0; i<ntexts; i++) {
    l1=strlen(in_texts[i]);

    // char* first, that is easy
    ptr[i]=tptr;
    memcpy(tptr, in_texts[i], l1);
    tptr += l1;
    *tptr='\0';
    tptr ++;

    // wchar_t* now, iconv conversion from UTF8
    wptr[i]=(wchar_t*) obptr;
    ibptr=(char*)in_texts[i];
    Rprintf("l1=%d l2=%d\n", l1, l2);
    ret=Riconv(cd, (const char**)&ibptr, &l1, (char**)&obptr, &l2);
    if (ret == (size_t)-1) {
      switch (errno) {
      case EILSEQ:
	error("Non-UTF8 string encountered");
	break;
      case E2BIG:
	error("Too small buffer allocated for UTF8 " 
	      "conversion, this shouldn't happen");
	break;
      case EINVAL:
	error("Non-UTF8 string encountered, some bytes missing?");	    
	break;
      case EBADF:
	error("Invalid inconv object, this shouldn't happen");
	break;
      }
    }
    memset(obptr, 0, sizeof(wchar_t));
    obptr += sizeof(wchar_t);
    l2 -= sizeof(wchar_t);
  }
  Riconv_close(cd);
}

DStringArray::~DStringArray()
{
  delete [] ptr;
  delete [] wptr;
  delete [] textbuffer;
  delete [] wtextbuffer;
}

#endif
