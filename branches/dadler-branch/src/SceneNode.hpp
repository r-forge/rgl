#ifndef SCENENODE_HPP
#define SCENENODE_HPP

//
// ABSTRACT BASE CLASS
//   SceneNode
//

#include "types.h"

enum TypeID { 
  SHAPE=1, 
  LIGHT, 
  BBOXDECO, 
  VIEWPOINT, 
  BACKGROUND 
};

class SceneNode : public Node
{
public:
  inline const TypeID getTypeID() const { return typeID; }
  virtual ~SceneNode() { };
protected:
  SceneNode(const TypeID in_typeID) : typeID(in_typeID) 
  { };
private:
  const TypeID typeID;
};

#endif // SCENENODE_HPP
 
