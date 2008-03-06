#ifdef HAVE_FREETYPE

#include "DString.hpp"
#include "types.h"
#include "R.h"
#include <cerrno>
#include <iconv.h>
#include <stdlib.h>
#include <limits.h>

DStringArray::DStringArray(int in_ntexts, char **in_texts) {
  
  int i;
  const char *from="UTF-8";
  const char *to="UCS-4LE";
  iconv_t cd=iconv_open(to, from);
  size_t l1, l2;
  char *ibptr;
  char *obptr;
  int buflen = 0;
  size_t ret;

  ntexts=in_ntexts;

  fprintf(stderr, "Info:\n"
	  "  sizeof(wchar_t): %i\n"
	  "  MB_LEN_MAX: %i\n"
	  "  MB_LEN_CUR: %i\n", sizeof(wchar_t), MB_LEN_MAX, MB_CUR_MAX);
  
  if (cd == (iconv_t) -1) {
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
    ret=iconv(cd, (const char**)&ibptr, &l1, (char**)&obptr, &l2);
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
  iconv_close(cd);

  fprintf(stderr, "Input: ");
  for (char *p=textbuffer; p<textbuffer+buflen; p++) {
    fprintf(stderr, "%x ", *p);
  }
  fprintf(stderr, "\nOutput: ");
  for (char *p=(char*)wtextbuffer; 
       p<(char*)wtextbuffer+buflen*sizeof(wchar_t); p++) {
    fprintf(stderr, "%x ", *p);
  }
  fprintf(stderr, "\n");
}

DStringArray::~DStringArray()
{
  delete [] ptr;
  delete [] wptr;
  delete [] textbuffer;
  delete [] wtextbuffer;
}

#endif
