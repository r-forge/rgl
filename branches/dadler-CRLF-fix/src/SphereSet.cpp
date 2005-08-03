#include "SphereSet.hpp"

//////////////////////////////////////////////////////////////////////////////
//
// CLASS
//   SphereSet
//

SphereSet::SphereSet(Material& in_material, int in_ncenter, double* in_center, int in_nradius, double* in_radius)
 : Shape(in_material), 
   center(in_ncenter, in_center), 
   radius(in_nradius, in_radius)
{
  material.colorPerVertex(false);

  if (material.lit)
    sphereMesh.setGenNormal(true);
  if ( (material.texture) && (!material.texture->is_envmap() ) )
    sphereMesh.setGenTexCoord(true);

  sphereMesh.setGlobe(16,16);
  
  for (int i=0;i<center.size();i++)
    boundingBox += Sphere( center.get(i), radius.getRecycled(i) );
}

SphereSet::~SphereSet()
{
}

void SphereSet::draw(RenderContext* renderContext)
{
  material.beginUse(renderContext);

  for(int i=0;i<center.size();i++) {
  
    material.useColor(i);

    sphereMesh.setCenter( center.get(i) );
    sphereMesh.setRadius( radius.getRecycled(i) );

    sphereMesh.update();

    sphereMesh.draw(renderContext);
  }

  material.endUse(renderContext);
}

