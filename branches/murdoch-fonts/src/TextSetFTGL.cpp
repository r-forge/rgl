
#ifdef HAVE_FREETYPE

#include "TextSet.hpp"

#include "glgui.hpp"

#include "Viewpoint.hpp"
#include <R.h>
#include <map>

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   TextSet
//
// INTERNAL TEXTS STORAGE
//   texts are copied to a buffer without null byte
//   a separate length buffer holds string lengths in order
//

TextSet::TextSet(Material& in_material, int in_ntexts, char** in_texts, double *in_center, double in_adj,
                 int in_ignoreExtent, char **fonts, int size)
  : Shape(in_material, in_ignoreExtent), textArray(in_ntexts, in_texts)
{
  int i;

  material.lit = false;
  material.colorPerVertex(false);

  adj = in_adj;

  // init vertex array

  vertexArray.alloc(in_ntexts);

  for (i=0;i<in_ntexts;i++) {

    vertexArray[i].x = (float) in_center[i*3+0];
    vertexArray[i].y = (float) in_center[i*3+1];
    vertexArray[i].z = (float) in_center[i*3+2];

    boundingBox += vertexArray[i];
  }

  font=new FTGLPixmapFont(fonts[0]);
  if (font->Error()) { 
    error("Cannot create font from file %s, error code: %i.", 
	  fonts[0], font->Error());
  }
  if (size<1) { size=1; }
  if (!font->FaceSize(size)) {
    error("Cannot create font of size %i from file %s.", size, fonts[0]);
  }
  font->CharMap(ft_encoding_unicode);
  if (font->Error()) {
    error("Cannot set unicode encoding for font %s.", fonts[0]);
  }
  material.alphablend=1;
}

TextSet::~TextSet()
{
  delete font;
}

void TextSet::draw(RenderContext* renderContext) {

  int cnt;
  int len=textArray.length();
  
  material.beginUse(renderContext);

  for( cnt = 0; cnt<len ; cnt++ ) {
    if (!vertexArray[cnt].missing()) {
      material.useColor(cnt);
      glRasterPos3f( vertexArray[cnt].x, vertexArray[cnt].y, vertexArray[cnt].z );
      font->Render(textArray.wget(cnt));
      if (renderContext->gl2psActive) {
	char *s=(char*)textArray.get(cnt);
	renderContext->font->draw( s, strlen(s), adj,
				   renderContext->gl2psActive );
      }
    }
  }
  
  material.endUse(renderContext);
}

void TextSet::drawElement(RenderContext* renderContext, int i) 
{
  material.useColor(i);
  glRasterPos3f( vertexArray[i].x, vertexArray[i].y, vertexArray[i].z );
  font->Render(textArray.wget(i));
  if (renderContext->gl2psActive) {
    char *s=(char*)textArray.get(i);
    renderContext->font->draw( s, strlen(s), adj,
			       renderContext->gl2psActive );
  }
}

void TextSet::renderZSort(RenderContext* renderContext)
{
  int index;
  int len=textArray.length();
  std::multimap<float,int> distanceMap;
  for (index = 0; index<len; ++index ) {
    float distance = renderContext->getDistance( vertexArray[index] );
    distanceMap.insert( std::pair<float,int>(distance,index) );
  }

  material.beginUse(renderContext);
  for ( std::multimap<float,int>::iterator iter = distanceMap.begin(); iter != distanceMap.
end() ; ++ iter ) {
    drawElement( renderContext, iter->second );
  }  
  material.endUse(renderContext);
}

#endif
