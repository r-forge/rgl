#include "Disposable.h"

#include <algorithm>
#include <vector>
#include "assert.h"

using namespace rgl;

void Disposable::addDisposeListener(IDisposeListener* l)
{
  assert( std::find( disposeListeners.begin(), disposeListeners.end(), l ) 
          == disposeListeners.end() );
  disposeListeners.push_back(l);  
}

void Disposable::removeDisposeListener(IDisposeListener* l)
{
  Container::iterator pos = std::find( disposeListeners.begin(), disposeListeners.end(), l );
  assert( pos != disposeListeners.end() );
  disposeListeners.erase(pos);
}

void Disposable::fireNotifyDisposed()
{
  // copy the listeners to a queue,
  // so add/remove are stable during 'notifyDispose'.
  std::vector<IDisposeListener*> queue( disposeListeners.begin(), disposeListeners.end() );
  for ( std::vector<IDisposeListener*>::iterator i = queue.begin() ; i != queue.end() ; ++ i )
    (*i)->notifyDisposed(this);
}

void Disposable::dispose()
{
  fireNotifyDisposed();  
}

