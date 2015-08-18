var min = Math.min,
    max = Math.max,
    sqrt = Math.sqrt,
    sin = Math.sin,
    acos = Math.acos,
    tan = Math.tan,
    SQRT2 = Math.SQRT2,
    PI = Math.PI,
    log = Math.log,
    exp = Math.exp,
    floor = Math.floor;

debug = false;

function logGLCall(functionName, args) {
   console.log("gl." + functionName + "(" +
      WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
}

function validateNoneOfTheArgsAreUndefined(functionName, args) {
  for (var ii = 0; ii < args.length; ++ii) {
    if (typeof args[ii] === "undefined") {
      console.error("undefined passed to gl." + functionName + "(" +
                     WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
    }
  }
}

function throwOnGLError(err, funcName, args) {
  throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
}

function logAndValidate(functionName, args) {
   logGLCall(functionName, args);
   validateNoneOfTheArgsAreUndefined (functionName, args);
}




rglClass = function() {
    this.canvas = null;
    this.userMatrix = new CanvasMatrix4();
    this.types = [];
    this.drawFns = [];
    this.clipFns = [];
    this.prMatrix = new CanvasMatrix4();
    this.mvMatrix = new CanvasMatrix4();
    this.vp = null;
    this.prmvMatrix = null;
    this.origs = null;
    this.gl = null;
    this.scene = null;
};

(function() {
    this.getShader = function(shaderType, code) {
        var gl = this.gl, shader;
        shader = gl.createShader(shaderType);
        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === 0)
            alert(gl.getShaderInfoLog(shader));
        return shader;
    };

    this.multMV = function(M, v) {
        return [ M.m11 * v[0] + M.m12 * v[1] + M.m13 * v[2] + M.m14 * v[3],
                 M.m21 * v[0] + M.m22 * v[1] + M.m23 * v[2] + M.m24 * v[3],
                 M.m31 * v[0] + M.m32 * v[1] + M.m33 * v[2] + M.m34 * v[3],
                 M.m41 * v[0] + M.m42 * v[1] + M.m43 * v[2] + M.m44 * v[3]
               ];
    };

    this.vlen = function(v) {
		  return sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
		};

		this.xprod = function(a, b) {
			return [a[1]*b[2] - a[2]*b[1],
			    a[2]*b[0] - a[0]*b[2],
			    a[0]*b[1] - a[1]*b[0]];
		};

    this.cbind = function(a, b) {
      return a.map(function(currentValue, index, array)
              currentValue.concat(b[index]));
    };

    this.flatten = function(a) {
      return a.reduce(function(x, y) x.concat(y));
    };

    this.transpose = function(a) {
      var newArray = [],
          n = a.length,
          m = a[0].length,
          i;
      for(i = 0; i < m; i++){
        newArray.push([]);
      };

      for(i = 0; i < n; i++){
        for(var j = 0; j < m; j++){
          newArray[j].push(a[i][j]);
        };
      };
      return newArray;
    };

    this.sumsq = function(x) {
      var result = 0, i;
      for (i=0; i < x.length; i++)
        result += x[i]^2;
      return result;
    };

    this.f_is_lit = 1;
    this.f_is_smooth = 2;
    this.f_has_texture = 4;
    this.f_is_indexed = 8;
    this.f_depth_sort = 16;
    this.f_fixed_quads = 32;
    this.f_is_transparent = 64;
    this.f_is_lines = 128;
    this.f_sprites_3d = 256;
    this.f_sprite_3d = 512;
    this.f_is_subscene = 1024;
    this.f_is_clipplanes = 2048;
    this.f_reuse = 4096;

    this.whichList = function(id) {
      var flags = this.getObj(id).flags;
        if (flags & this.f_is_subscene)
            return "subscenes";
        else if (flags & this.f_is_clipplanes)
            return "clipplanes";
        else if (flags & this.f_is_transparent)
            return "transparent";
        else return "opaque";
    };

    this.getObj = function(id) {
      return this.scene.objects[id];
    };

    this.setObj = function(id, newval) {
      this.scene.objects[id] = newval;
    };

    this.getMaterial = function(id, property) {
      var obj = this.getObj(id),
          mat = obj.material[property];
      if (typeof mat === "undefined")
          mat = this.scene.material[property];
      return mat;
    };

    this.inSubscene = function(id, subscene) {
      var subscenes = this.getSubsceneEntries(subscene);
      return subscenes.indexOf(id) > -1;
    };

    this.addToSubscene = function(id, subscene) {
      if (this.getSubsceneEntries(subscene).indexOf(id) == -1) {
        this.scene.objects[subscene].subscenes.push(id);
        var thelist = this.whichList(id);
        this.scene.objects[subscene][thelist].push(id);
      }
    };

    this.delFromSubscene = function(id, subscene) {
      var thelist,
        i = this.getSubsceneEntries(subscene).indexOf(id);
      if (i > -1) {
        this.getObj(subscene).subscenes.splice(i, 1);
        thelist = this.whichList(id);
        i = this.getObj(subscene)[thelist].indexOf(id);
        this.getObj(subscene)[thelist].splice(i, 1);
      }
    };

    this.setSubsceneEntries = function(ids, subsceneid) {
      var sub = this.getObj(subsceneid), i;
      sub.subscenes = [];
      sub.clipplanes = [];
      sub.transparent = [];
      sub.opaque = [];
      this.setObj(subsceneid, sub);
      for (i = 0; i < ids.length; i++)
        this.addToSubscene(ids[i], subsceneid);
    };

    this.getSubsceneEntries = function(subscene) {
      return this.getObj(subscene).subscenes;
    };

    this.getPowerOfTwo = function(value) {
	     var pow = 1;
	     while(pow<value) {
	       pow *= 2;
	     }
	     return pow;
	   };

    this.handleLoadedTexture = function(texture, textureCanvas) {
	    var gl = this.gl;
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	    gl.generateMipmap(gl.TEXTURE_2D);

	    gl.bindTexture(gl.TEXTURE_2D, null);
	  };

	  this.loadImageToTexture = function(filename, texture) {
	    var canvas = alert("texture canvas not set up"),
	        ctx = canvas.getContext("2d"),
	        image = new Image(),
	        self = this;

	     image.onload = function() {
	       var w = image.width,
	           h = image.height,
	           canvasX = getPowerOfTwo(w),
	           canvasY = getPowerOfTwo(h);
	       canvas.width = canvasX;
	       canvas.height = canvasY;
	       ctx.imageSmoothingEnabled = true;
	       ctx.drawImage(image, 0, 0, canvasX, canvasY);
	       self.handleLoadedTexture(texture, canvas);
	       self.drawScene();
	     };
	     image.src = filename;
	   };

    this.drawTextToCanvas = function(text, cex, fontFamily) {
	     var canvasX, canvasY,
	         textX, textY,

	         textHeight = 20 * cex,
	         textColour = "white",

	         backgroundColour = "rgba(0,0,0,0)",
           canvas = alert("texture canvas not set up"),
	         ctx = canvas.getContext("2d"),
           i;

	     ctx.font = textHeight+"px "+fontFamily;

	     canvasX = 1;
	     var widths = [];
	     for (i = 0; i < text.length; i++)  {
	       widths[i] = ctx.measureText(text[i]).width;
	       canvasX = (widths[i] > canvasX) ? widths[i] : canvasX;
	     }
	     canvasX = this.getPowerOfTwo(canvasX);

	     var offset = 2*textHeight, // offset to first baseline
	         skip = 2*textHeight;   // skip between baselines
	     canvasY = this.getPowerOfTwo(offset + text.length*skip);

	     canvas.width = canvasX;
	     canvas.height = canvasY;

	     ctx.fillStyle = backgroundColour;
	     ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	     ctx.fillStyle = textColour;
	     ctx.textAlign = "left";

	     ctx.textBaseline = "alphabetic";
	     ctx.font = textHeight+"px "+fontFamily;

	     for(i = 0; i < text.length; i++) {
	       textY = i*skip + offset;
	       ctx.fillText(text[i], 0,  textY);
	     }
	     return {canvasX:canvasX, canvasY:canvasY,
	             widths:widths, textHeight:textHeight,
	             offset:offset, skip:skip};
	   };

    this.setViewport = function(id) {
	     this.vp = this.getObj(id).par3d.viewport;
	     var x = this.vp.x*this.canvas.width,
	         y = this.vp.y*this.canvas.height,
	         width = this.vp.width*this.canvas.width,
	         height = this.vp.height*this.canvas.height;
	     this.gl.viewport(x, y, width, height);
	     this.gl.scissor(x, y, width, height);
	   };

	  this.setprMatrix = function(id) {
       var subscene = this.getObj(id),
          embedding = subscene.embeddings.projection;
       if (embedding === "replace")
         this.prMatrix.makeIdentity();
       else
         this.setprMatrix(subscene.parent);
       if (embedding === "inherit")
         return;
       // This is based on the Frustum::enclose code from geom.cpp
       var bbox = subscene.par3d.bbox,
           scale = subscene.par3d.scale,
           ranges = [(bbox[1]-bbox[0])*scale[0]/2,
                     (bbox[3]-bbox[2])*scale[1]/2,
                     (bbox[5]-bbox[4])*scale[2]/2],
           radius = sqrt(this.sumsq(ranges))*1.1; // A bit bigger to handle labels
       if (radius <= 0) radius = 1;
       var observer = subscene.par3d.observer,
           distance = observer[2],
	         t = tan(subscene.par3d.FOV*PI/360),
	         near = distance - radius,
	         far = distance + radius,
	         hlen = t*near,
	         aspect = this.vp.width/this.vp.height,
	         z = subscene.par3d.zoom;
	     if (aspect > 1)
	       this.prMatrix.frustum(-hlen*aspect*z, hlen*aspect*z,
	                        -hlen*z, hlen*z, near, far);
	     else
	       this.prMatrix.frustum(-hlen*z, hlen*z,
	                        -hlen*z/aspect, hlen*z/aspect,
	                        near, far);
	   };

	  this.setmvMatrix = function(id) {
	     var observer = this.getObj(id).par3d.observer;
	     this.mvMatrix.makeIdentity();
	     this.setmodelMatrix(id);
	     this.mvMatrix.translate(-observer[0], -observer[1], -observer[2]);

	   };

    this.setmodelMatrix = function(id) {
	    var subscene = this.getObj(id),
	        embedding = subscene.embeddings.model;
	    if (embedding !== "inherit") {
	      var scale = subscene.par3d.scale,
	          bbox = subscene.par3d.bbox,
	          center = [(bbox[0]+bbox[1])/2,
	                    (bbox[2]+bbox[3])/2,
	                    (bbox[4]+bbox[5])/2];
	       this.mvMatrix.translate(-center[0], -center[1], -center[2]);
	       this.mvMatrix.scale(scale[0], scale[1], scale[2]);
	       this.mvMatrix.multRight( subscene.par3d.userMatrix );
	     }
	     if (embedding !== "replace")
	       this.setmodelMatrix(subscene.parent);
	   };

	  this.setnormMatrix = function(subsceneid) {
	     var self = this,
	     recurse = function(id) {
	       var sub = self.objects[id],
	           embedding = sub.embeddings.model;
         if (embedding !== "inherit") {
           var scale = sub.scales;
           self.normMatrix.scale(scale[0], scale[1], scale[2]);
           self.normMatrix.multRight(sub.par3d.userMatrix);
         }
         if (embedding !== "replace")
           recurse(sub.parent);
       };
       self.normMatrix.makeIdentity();
       recurse(subsceneid);
	   };

	  this.setprmvMatrix = function() {
	     this.prmvMatrix = new CanvasMatrix4( this.mvMatrix );
	     this.prmvMatrix.multRight( this.prMatrix );
	   };

    this.countClipplanes = function(id) {
      var scene = this.scene,
          bound = 0,
        recurse = function(subscene) {
        var result = 0,
          subids = scene.objects[subscene].objects,
          i;
        for (i = 0; i < subids.length; i++) {
          if (scene.objects[subids[i]].type == "sprites")
            subids.concat(scene.objects[subids[i]].objects);
          if (subids[i] === id) {
            clipids = scene.getClipplanes(subscene);
            for (j=0; j < clipids.length; j++)
              result = result + scene.objects[clipids[j]].offsets.length;
          }
        }
        for (i = 0; i < subids.length; i++) {
          if (result >= bound)
            break;
          if (scene.objects[subids[i]].type == "subscene")
            result = max(result, recurse(subids[i]));
        }
        return result;
      };
      Object.keys(scene.objects).forEach(
        function(key) {
          if (scene.objects[key].type === "clipplanes")
            bound = bound + 1;
        });
      if (bound <= 0)
        return 0;
      return recurse(scene.rootSubscene);
    };

    this.initSubscene = function(id) {
      var sub = this.getObj(id),
          i, obj;
      sub.par3d.userMatrix = new CanvasMatrix4(sub.par3d.userMatrix);
      if (typeof sub.par3d.listeners !== "Array")
        sub.par3d.listeners = [sub.par3d.listeners];
      sub.subscenes = [];
      sub.clipplanes = [];
      sub.transparent = [];
      sub.opaque = [];
      sub.clipplanes = [];
      for (i=0; i < sub.objects.length; i++) {
        obj = this.getObj(sub.objects[i]);
        if (obj.type === "background")
          sub.backgroundId = obj.id;
        else
          sub[this.whichList(obj.id)].push(obj.id);
      }
      this.setObj(id, sub);
    };

    this.initObj = function(id) {
	    var obj = this.getObj(id),
	        flags = obj.flags,
	        type = obj.type,
	        is_indexed = flags & this.f_is_indexed,
          is_lit = flags & this.f_is_lit,
		      has_texture = flags & this.f_has_texture,
		      fixed_quads = flags & this.f_fixed_quads,
		      depth_sort = flags & this.f_depth_sort,
		      sprites_3d = flags & this.f_sprites_3d,
		      sprite_3d = flags & this.f_sprite_3d,
		      is_clipplanes = type === "clipplanes",
		      nclipplanes = this.countClipplanes(id),
		      reuse = flags & this.f_reuse,
		      gl = this.gl,
          texinfo, drawtype, f, frowsize, nrows;

    if (type === "clipplanes" || type === "background" || type === "light")
      return;

    if (type === "subscene") {
      this.initSubscene(id);
      return;
    }

		if (!sprites_3d && !is_clipplanes) {
			obj.prog = gl.createProgram();
			gl.attachShader(obj.prog, this.getShader( gl.VERTEX_SHADER,                       obj.vshader ));
			gl.attachShader(obj.prog, this.getShader( gl.FRAGMENT_SHADER,
			                obj.fshader ));
			//  Force aPos to location 0, aCol to location 1
			gl.bindAttribLocation(obj.prog, 0, "aPos");
			gl.bindAttribLocation(obj.prog, 1, "aCol");
			gl.linkProgram(obj.prog);
		}

		if (type === "text") {
      texinfo = drawTextToCanvas(texts, obj.cex);
		}

		if (fixed_quads && !sprites_3d) {
		  obj.ofsLoc = gl.getAttribLocation(obj.prog, "aOfs");
		}

		if (sprite_3d) {
			obj.origLoc = gl.getUniformLocation(obj.prog, "uOrig");
			obj.sizeLoc = gl.getUniformLocation(obj.prog, "uSize");
			obj.usermatLoc = gl.getUniformLocation(obj.prog, "usermat");
		}

		load_texture = false; // FIXME

		if (load_texture || type == "text") {
		  obj.texture = gl.createTexture();
			obj.texLoc = gl.getAttribLocation(obj.prog, "aTexcoord");
			obj.sampler = gl.getUniformLocation(obj.prog, "uSampler");
		}

		if (load_texture) {
			this.loadImageToTexture(obj.textureFile, obj.texture);
		} else if (has_texture) {
			obj.texture = this.texture[texid];
		}

		if (type === "text") {
		  handleLoadedTexture(obj.texture,
		    document.getElementById("prefixtextureCanvas"));
		}

    v = obj.vertices;
    obj.vertexCount = v.length;

    var stride = 3, nc, cofs, nofs, radofs, oofs, tofs;

    nc = obj.colorCount = obj.colors.length;
    if (nc > 1) {
    	cofs = stride;
    	stride = stride + 4;
    	v = this.cbind(v, obj.colors);
    } else {
    	cofs = -1;
    	obj.colors = this.flatten(obj.colors);
    }

    if (typeof obj.normals !== "undefined") {
    	nofs = stride;
    	stride = stride + 3;
    	v = this.cbind(v, obj.normals);
    } else
    	nofs = -1;

    if (typeof obj.radii !== "undefined") {
    	radofs = stride;
    	stride = stride + 1;
    	v = this.cbind(v, obj.radii);
    } else
    	radofs = -1;

    if (false && type == "sprites" && !sprites_3d) { // FIXME
    	oofs = stride;
    	stride = stride + 2;
    } else
    	oofs = -1;

    if (false && (has_texture || type == "text")) {
    	tofs = stride;
    	stride = stride + 2;
    } else
    	tofs = -1;

    if (false && type == "text") {
    	oofs = stride;
    	stride = stride + 2;
    }

    if (stride !== v[0].length)
      alert("problem in stride calculation");

    obj.offsets = {vofs:0, cofs:cofs, nofs:nofs, radofs:radofs, oofs:oofs, tofs:tofs, stride:stride};

    obj.values = new Float32Array(this.flatten(v));

    if (sprites_3d) {
			obj.userMatrix = new CanvasMatrix4(obj.userMatrix);
    }

		if (type === "text" && !reuse) {
			for (i=0; i < obj.texts.length; i++)
			  for (j=0; j<4; j++) {
			    ind = obj.offsets.stride*(4*i + j) + obj.offsets.tofs;
			    	v[ind+2] = 2*(v[ind]-v[ind+2])*texinfo.widths[i];
			    	v[ind+3] = 2*(v[ind+1]-v[ind+3])*texinfo.textHeight;
			    	v[ind] *= texinfo.widths[i]/texinfo.canvasX;
			    	v[ind+1] = 1.0-(texinfo.offset + i*texinfo.skip -
			    	           v[ind+1]*texinfo.textHeight)/texinfo.canvasY;
			  }
		}

		if (!sprites_3d && reuse) {
			 obj.values = thisprefix.scene.objects[id].values;
		}

    if (is_lit && !fixed_quads && !sprites_3d) {
			 obj.normLoc = gl.getAttribLocation(obj.prog, "aNorm");
    }

		if (nclipplanes && !sprites_3d) {
		  obj.clipLoc = [];
		  for (i=0; i < nclipplanes; i++)
        obj.clipLoc[i] = gl.getUniformLocation(obj.prog,                                       "vClipplane" + (i+1));
		}

		if (is_indexed) {
      if ((type === "quads" || type === "text" ||
           type === "sprites") && !sprites_3d) {
        nrows = floor(obj.vertexCount/4);
        f = Array(6*nrows);
        for (i=0; i < nrows; i++) {
          f[6*i] = 4*i;
          f[6*i+1] = 4*i + 1;
          f[6*i+2] = 4*i + 2;
          f[6*i+3] = 4*i;
          f[6*i+4] = 4*i + 2;
          f[6*i+5] = 4*i + 3;
        }
        frowsize = 6;
      } else if (type === "triangles") {
        nrows = floor(obj.vertexCount/3);
        f = Array(3*nrows);
        for (i=0; i < f.length; i++) {
          f[i] = i;
        }
        frowsize = 3;
      } else if (type == "spheres") {
        nrows = obj.vertexCount;
        f = Array(nrows);
        for (i=0; i < f.length; i++) {
          f[i] = i;
        }
        frowsize = 1;
      }
		  obj.f = new Uint16Array(f);
			if (depth_sort) {
				drawtype = "DYNAMIC_DRAW";
			} else {
				drawtype = "STATIC_DRAW";
			}
		}

		if (type !== "spheres" && !sprites_3d) {
		  obj.buf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, obj.buf);
			gl.bufferData(gl.ARRAY_BUFFER, obj.values, gl.STATIC_DRAW); //
		}

		if (is_indexed && type !== "spheres" && !sprites_3d) {
			obj.ibuf = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibuf);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.f, gl[drawtype]);
		}

		if (!sprites_3d && !is_clipplanes) {
			obj.mvMatLoc = gl.getUniformLocation(obj.prog, "mvMatrix");
			obj.prMatLoc = gl.getUniformLocation(obj.prog, "prMatrix");
		}

		if (type === "text") {
			obj.textScaleLoc = gl.getUniformLocation(obj.prog, "textScale");
		}

		if (is_lit && !sprites_3d) {
			obj.normMatLoc = gl.getUniformLocation(obj.prog, "normMatrix");
		}

    this.setObj(id, obj);
  };

	  this.mode4type = {points : "POINTS",
							       linestrip : "LINE_STRIP",
							       abclines : "LINES",
							       lines : "LINES",
							       sprites : "TRIANGLES",
							       planes : "TRIANGLES",
							       text : "TRIANGLES",
							       quads : "TRIANGLES",
							       surface : "TRIANGLES",
							       triangles : "TRIANGLES"};

    this.getPrefix = function(id) {
      return this;  // FIXME when this is worked out
    };

	  this.drawObj = function(id, subsceneid) {
	    var obj = this.getObj(id),
	        flags = obj.flags,
	        type = obj.type,
	        is_indexed = flags & this.f_is_indexed,
          is_lit = flags & this.f_is_lit,
		      has_texture = flags & this.f_has_texture,
		      fixed_quads = flags & this.f_fixed_quads,
		      depth_sort = flags & this.f_depth_sort,
		      sprites_3d = flags & this.f_sprites_3d,
		      sprite_3d = flags & this.f_sprite_3d,
		      is_lines = flags & this.f_is_lines,
		      is_clipplanes = type === "clipplanes",
		      reuse = flags & this.f_reuse,
		      gl = this.gl,
		      thisprefix = this.getPrefix(id),
		      sphereMV, baseofs, ofs, sscale, iOrig, i, count;

      if (type === "light")
        return;

		  if (type === "clipplanes") {
			  var count = obj.offsets.length,
			      IMVClip = [];
			  for (i=0; i < count; i++) {
				  IMVClip[i] = this.multMV(this.invMatrix, obj.vClipplane.slice(4*i, 4*(i+1)));
 			  }
 			  this.getObj(id).IMVClip = obj.IMVClip = IMVClip;
			  this.getObj(id).clipFn = obj.clipFn = function(id, objid, count1) {
			    var obj = this.getObj(id),
			        count2 = obj.offsets.length;
    	    for (i=0; i<count2; i++) {
	    	    gl.uniform4fv(obj.clipLoc[count1 + i], obj.IMVClip[i]);
    	    }
	    	  return(count1 + count2);
		    };
      return;
			}

      if (sprites_3d) {
			  var norigs = obj.norigs, spriteid;
			  this.origs = obj.origsize;
				this.usermat = obj.userMatrix;
				for (iOrig=0; iOrig < norigs; iOrig++) {
			    for (i=0; i < obj.spriteids.length; i++) {
					  this.drawObj(obj.spriteids[i], subsceneid);
					}
				}
			} else {
				gl.useProgram(obj.prog);
			}

			if (sprite_3d) {
			  gl.uniform3f(obj.origLoc, this.origs[4*iOrig],
							       this.origs[4*iOrig+1],
							       this.origs[4*iOrig+2]);
				gl.uniform1f(obj.sizeLoc, this.origs[4*iOrig+3]);
				gl.uniformMatrix4fv(obj.usermatLoc, false, this.usermat);
			}

			if (type === "spheres") {
			  gl.bindBuffer(gl.ARRAY_BUFFER, this.sphere.buf);
			} else {
				gl.bindBuffer(gl.ARRAY_BUFFER, obj.buf);
			}

			if (is_indexed && type !== "spheres") {
			  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibuf);
			} else if (type === "spheres") {
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sphere.ibuf);
			}

			gl.uniformMatrix4fv( obj.prMatLoc, false, new Float32Array(this.prMatrix.getAsArray()) );
			gl.uniformMatrix4fv( obj.mvMatLoc, false, new Float32Array(this.mvMatrix.getAsArray()) );
      var clipcheck = 0,
          subscene = this.getObj(subsceneid),
          clipplanes = subscene.clipplanes;
			for (i=0; i < clipplanes.length; i++) {
			  clipcheck = this.clipFns[clipplanes[i]].call(this, clipplanes[i], id, clipcheck); // FIXME clipFns?
			}

			if (is_lit && !sprite_3d) {
			  gl.uniformMatrix4fv( obj.normMatLoc, false, new Float32Array(this.normMatrix.getAsArray()) );
			}

			if (is_lit && sprite_3d) {
				gl.uniformMatrix4fv( obj.normMatLoc, false, this.usermat);
			}

			if (type === "text") {
				gl.uniform2f( obj.textScaleLoc, 0.75/this.vp.width/canvas.width, 0.75/this.vp.height/canvas.height);
			}

			gl.enableVertexAttribArray( this.posLoc );

			var nc = obj.colorCount;
      count = obj.vertexCount;
			if (depth_sort) {
						var nfaces = obj.centers.length,
						    frowsize, z, w;
						if (sprites_3d) frowsize = 1;
						else if (type === "triangles") frowsize = 3;
						else frowsize = 6;
            var depths = new Float32Array(nfaces),
							  faces = new Array(nfaces);
						for(i=0; i<nfaces; i++) {
							z = this.prmvMatrix.m13*obj.centers[3*i] +
							    this.prmvMatrix.m23*obj.centers[3*i+1] +
						      this.prmvMatrix.m33*obj.centers[3*i+2] +
					        this.prmvMatrix.m43;
							w = this.prmvMatrix.m14*obj.centers[3*i] +
				  			  this.prmvMatrix.m24*obj.centers[3*i+1] +
					  		  this.prmvMatrix.m34*obj.centers[3*i+2] +
						  	  this.prmvMatrix.m44;
							depths[i] = z/w;
							faces[i] = i;
						}
						var depthsort = function(i,j) { return depths[j] - depths[i]; };
						faces.sort(depthsort);

						if (type !== "spheres") {
						  var f = new Uint16Array(obj.f.length);
							for (i=0; i<nfaces; i++) {
					  	  for (var j=0; j<frowsize; j++) {
							    f[frowsize*i + j] = obj.f[frowsize*faces[i] + j];
							  }
							}
							gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, f, gl.DYNAMIC_DRAW);
						}
					}

			if (type === "spheres") {
				var subscene = this.getObj(subsceneid),
				    scale = subscene.par3d.scale,
						scount = count;
				gl.vertexAttribPointer(this.posLoc,  3, gl.FLOAT, false, this.sphere.sphereStride,  0);
				gl.enableVertexAttribArray(obj.normLoc );
				gl.vertexAttribPointer(obj.normLoc,  3, gl.FLOAT, false, this.sphere.sphereStride,  0);
				gl.disableVertexAttribArray( this.colLoc );
				var sphereNorm = new CanvasMatrix4();
				sphereNorm.scale(scale[0], scale[1], scale[2]);
				sphereNorm.multRight(this.normMatrix);
				gl.uniformMatrix4fv( obj.normMatLoc, false, new Float32Array(sphereNorm.getAsArray()) );

			  if (nc == 1) {
				  gl.vertexAttrib4fv( this.colLoc, obj.colors);
			  }

			  for (i = 0; i < scount; i++) {
			    sphereMV = new CanvasMatrix4();

			  	if (depth_sort) {
				    baseofs = faces[i]*thisprefix.scene.objects[id].offsets.stride;
				  } else {
				    baseofs = i*thisprefix.scene.objects[id].offsets.stride;
				  }

          ofs = baseofs + obj.offsets.radofs;
				  sscale = obj.values[ofs];

				  sphereMV.scale(sscale*scale[0], sscale*scale[1], sscale*scale[2]);
				  sphereMV.translate(obj.values[baseofs],
				                     obj.values[baseofs+1],
				                     obj.values[baseofs+2]);
				  sphereMV.multRight(this.mvMatrix);
				  gl.uniformMatrix4fv( obj.mvMatLoc, false, new Float32Array(sphereMV.getAsArray()) );

				  if (nc > 1) {
				    ofs = baseofs + obj.offsets.cofs;
					  gl.vertexAttrib4f( this.colLoc, obj.values[ofs],
					   		                       obj.values[ofs+1],
                                       obj.values[ofs+2],
							                         obj.values[ofs+3] );
				  }
				  gl.drawElements(gl.TRIANGLES, this.sphere.sphereCount, gl.UNSIGNED_SHORT, 0);

			  }
			} else {
				if (obj.colorCount === 1) {
					gl.disableVertexAttribArray( this.colLoc );
				  gl.vertexAttrib4fv( this.colLoc, obj.colors);
				} else {
					gl.enableVertexAttribArray( this.colLoc );
					gl.vertexAttribPointer(this.colLoc, 4, gl.FLOAT, false, 4*obj.offsets.stride, 4*obj.offsets.cofs);
				}
      }

			if (is_lit && obj.offsets.nofs > 0) {
				gl.enableVertexAttribArray( obj.normLoc );
				gl.vertexAttribPointer(obj.normLoc, 3, gl.FLOAT, false, 4*obj.offsets.stride, 4*obj.offsets.nofs);
			}

			if (has_texture || type === "text") {
				gl.enableVertexAttribArray( obj.texLoc );
				gl.vertexAttribPointer(obj.texLoc, 2, gl.FLOAT, false, 4*obj.offsets.stride, 4*obj.offsets.tofs);
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, obj.texture);
				gl.uniform1i( obj.sampler, 0);
			}

			if (fixed_quads) {
				gl.enableVertexAttribArray( obj.ofsLoc );
				gl.vertexAttribPointer(obj.ofsLoc, 2, gl.FLOAT, false, 4*obj.offsets.stride, 4*obj.offsets.oofs);
			}

			var mode = this.mode4type[type];

      if (type === "sprites" || type === "text") {
        count = count*6;
      } else if (type === "quads") {
        count = count * 6/4;
      } else if (type === "surface") {
				var dim = obj.dims,
						nx = dim[0],
						nz = dim[1];
				count = (nx - 1)*(nz - 1)*6;
      }

			if (is_lines) {
				gl.lineWidth( this.getMaterial(id, "lwd") );
			}

			gl.vertexAttribPointer(this.posLoc,  3, gl.FLOAT, false, 4*obj.offsets.stride,  4*obj.offsets.vofs);

			if (is_indexed) {
			  gl.drawElements(gl[mode], count, gl.UNSIGNED_SHORT, 0);
			} else {
			  gl.drawArrays(gl[mode], 0, count);
			}
	 };

	  this.drawSubscene = function(subsceneid) {
		  var gl = this.gl,
		      obj = this.getObj(subsceneid),
		      objects = this.scene.objects,
		      subids = obj.subscenes,
		      subscene_has_faces = false,
		      subscene_needs_sorting = false,
		      flags;

		  for (i=0; i < subids.length; i++) {
		    flags = objects[subids[i]].flags;
		    subscene_has_faces |= (flags & this.f_is_lit)
		                       & !(flags & this.f_fixed_quads);
		    subscene_needs_sorting |= (flags & this.f_depth_sort);
		  }

		  var bgid = obj.backgroundId,
		      bg;

      if (typeof bgid === "undefined" || !objects[bgid].colors.length)
			  bg = [1,1,1,1];
			else
			  bg = objects[bgid].colors[0];

			this.setViewport(subsceneid);
			gl.clearColor(bg[0], bg[1], bg[2], bg[3]);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			if (typeof subids !== "undefined") {
			  this.setprMatrix(subsceneid);
			  this.setmvMatrix(subsceneid);

				if (subscene_has_faces)
				  this.setnormMatrix(subsceneid);

				if (subscene_needs_sorting)
				  this.setprmvMatrix();

				var clipids = obj.clipplanes;
				if (clipids.length > 0) {
				  this.invMatrix = new CanvasMatrix4(this.mvMatrix);
				  this.invMatrix.invert();
				  for (i = 0; i < obj.clipplanes.length; i++)
				    this.drawFns[clipids[i]].call(this, clipids[i]);
				}
				subids = obj.opaque;
				for (i = 0; subids && i < subids.length; i++) {
				  this.drawObj(subids[i], subsceneid);
				}
				subids = obj.transparent;
				if (subids) {
				  gl.depthMask(false);
				  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
				                       gl.ONE, gl.ONE);
				  gl.enable(gl.BLEND);
				  for (i = 0; i < subids.length; i++) {
				    this.drawObj(subids[i], subsceneid);
				  }
				}
				subids = obj.subscenes;
				for (i = 0; subids && i < subids.length; i++) {
				  this.drawFns[subids[i]].call(this, subids[i]); // FIXME
				}
			}
	  };

    this.relMouseCoords = function(event) {
		  var totalOffsetX = 0,
		  totalOffsetY = 0,
		  currentElement = this.canvas;

		  do {
		    totalOffsetX += currentElement.offsetLeft;
		    totalOffsetY += currentElement.offsetTop;
		    currentElement = currentElement.offsetParent;
		  }
		  while(currentElement);

		  var canvasX = event.pageX - totalOffsetX,
		      canvasY = event.pageY - totalOffsetY;

		  return {x:canvasX, y:canvasY};
		};


    this.setMouseHandlers = function() {
      var self = this, activeSubscene, handler,
          handlers = {}, drag = 0;

    handlers.rotBase = 0;

		this.screenToVector = function(x, y) {
		  var viewport = this.getObj(activeSubscene).par3d.viewport,
		    width = viewport.width*this.canvas.width,
			  height = viewport.height*this.canvas.height,
			  radius = max(width, height)/2.0,
			  cx = width/2.0,
			  cy = height/2.0,
			  px = (x-cx)/radius,
			  py = (y-cy)/radius,
			  plen = sqrt(px*px+py*py);
			if (plen > 1.e-6) {
			  px = px/plen;
			  py = py/plen;
			}
			var angle = (SQRT2 - plen)/SQRT2*PI/2,
			  z = sin(angle),
			  zlen = sqrt(1.0 - z*z);
			px = px * zlen;
			py = py * zlen;
			return [px, py, z];
		};

		handlers.trackballdown = function(x,y) {
			var objects = this.scene.objects,
			    activeSub = objects[activeSubscene],
			    activeModel = this.getObj(this.useid(activeSub.id, "model")),
			  i, l = activeModel.par3d.listeners;
			handlers.rotBase = this.screenToVector(x, y);
			this.saveMat = [];
			for (i = 0; i < l.length; i++) {
			  activeSub = objects[l[i]];
			  this.scene.objects[l[i]].saveMat = new CanvasMatrix4(activeSub.par3d.userMatrix);
			}
		};

		handlers.trackballmove = function(x,y) {
			var rotCurrent = this.screenToVector(x,y),
			    rotBase = handlers.rotBase,
				dot = rotBase[0]*rotCurrent[0] +
						  rotBase[1]*rotCurrent[1] +
			  	   	rotBase[2]*rotCurrent[2],
				angle = acos( dot/this.vlen(rotBase)/this.vlen(rotCurrent) )*180.0/PI,
				axis = this.xprod(rotBase, rotCurrent),
				objects = this.scene.objects,
				activeSub = this.getObj(activeSubscene),
				l = activeSub.par3d.listeners,
				i;
		  for (i = 0; i < l.length; i++) {
			  this.getObj(l[i]).par3d.userMatrix.load(objects[l[i]].saveMat);
				this.getObj(l[i]).par3d.userMatrix.rotate(angle, axis[0], axis[1], axis[2]);
			}
			this.drawScene();
		};
		handlers.trackballend = 0;

		handlers.xAxis = [1.0, 0.0, 0.0];
		handlers.yAxis = [0.0, 1.0, 0.0];
		handlers.zAxis = [0.0, 0.0, 1.0];

    handlers.axisdown = function(x,y) {
		  handlers.rotBase = this.screenToVector(x, this.height/2);
			var i, objects = this.scene.objects,
			    activeSub = objects[activeSubscene],
			    l = activeSub.listeners;
			for (i = 0; i < l.length; i++) {
			  activeSub = objects[l[i]];
			  activeSub.saveMat = new CanvasMatrix4(activeSub.par3d.userMatrix);
			}
		};

		handlers.axismove = function(x,y) {
		  var rotCurrent = this.screenToVector(x,this.height/2),
		      rotBase = handlers.rotBase,
					angle = (rotCurrent[0] - rotBase[0])*180/PI,
			    rotMat = new CanvasMatrix4();
			rotMat.rotate(angle, this.axis[0], this.axis[1], this.axis[2]);
			var i, objects = this.scene.objects,
				activeSub = this.getObj(activeSubscene),
				l = activeSub.listeners;
			for (i = 0; i < l.length; i++) {
			  activeSub = objects[l[i]];
			  activeSub.par3d.userMatrix.load(activeSub.saveMat);
			  activeSub.par3d.userMatrix.multLeft(rotMat);
			  this.setObj(l[i], activeSub);
			}
			this.drawScene();
		};
    handlers.axisend = 0;

    // FIXME - update other handlers

    handlers.y0zoom = 0;
		handlers.zoom0 = 0;
		handlers.zoomdown = function(x, y) {
		  this.y0zoom = y;
			this.zoom0 = [];
			var i,l = this.listeners[this.activeProjection[activeSubscene]];
			for (i = 0; i < l.length; i++) {
			  this.zoom0[l[i]] = log(this.zoom[l[i]]);
			}
		};
    handlers.zoommove = function(x, y) {
		  var i,l = this.listeners[this.activeProjection[activeSubscene]];
			for (i = 0; i < l.length; i++) {
			  this.zoom[l[i]] = exp(this.zoom0[l[i]] + (y-this.y0zoom)/this.height);
			}
				this.drawScene();
		  };
    handlers.zoomend = 0;

    handlers.y0fov = 0;
		handlers.fov0 = 0;
		handlers.fovdown = function(x, y) {
			  this.y0fov = y;
				this.fov0 = [];
				var i,l = this.listeners[this.activeProjection[activeSubscene]];
				for (i = 0; i < l.length; i++) {
				  this.fov0[l[i]] = this.getObj(l[i]).par3d.FOV;
				}
			};
    handlers.fovmove = function(x, y) {
			  var i, l = this.listeners[this.activeProjection[activeSubscene]];
				for (i = 0; i < l.length; i++) {
				  this.getObj(l[i]).FOV = max(1, min(179, this.fov0[l[i]] + 180*(y-this.y0fov)/this.height));
				}
				this.drawScene();
			};
    handlers.fovend = 0;

		  this.canvas.onmousedown = function ( ev ){
		    if (!ev.which) // Use w3c defns in preference to MS
		    switch (ev.button) {
		      case 0: ev.which = 1; break;
		      case 1:
		      case 4: ev.which = 2; break;
		      case 2: ev.which = 3;
		    }
		    drag = ["left", "middle", "right"][ev.which-1];
		    var coords = self.relMouseCoords(ev);
		    coords.y = self.canvas.height-coords.y;
		    activeSubscene = self.whichSubscene(coords);
		    var sub = self.getObj(activeSubscene), f;
		    handler = sub.par3d.mouseMode[drag];
		    f = handlers[handler + "down"];
		    if (f) {
		      coords = self.translateCoords(activeSubscene, coords);
		      f.call(self, coords.x, coords.y);
		      ev.preventDefault();
		    }
		  };

		  this.canvas.onmouseup = function ( ev ){
		    if ( drag === 0 ) return;
		    var f = handlers[handler + "up"];
		    if (f)
		      f();
		    drag = 0;
		  };

		  this.canvas.onmouseout = this.canvas.onmouseup;

		  this.canvas.onmousemove = function ( ev ) {
		    if ( drag === 0 ) return;
		    var f = handlers[handler + "move"];
		    if (f) {
		      var coords = self.relMouseCoords(ev);
		      coords.y = self.canvas.height - coords.y;
		      coords = self.translateCoords(activeSubscene, coords);
		      f.call(self, coords.x, coords.y);
		    }
		  };

		  this.wheelHandler = function(ev) {
		    var del = 1.1, i;
		    if (ev.shiftKey) del = 1.01;
		    var ds = ((ev.detail || ev.wheelDelta) > 0) ? del : (1 / del);
		    l = this.listeners[activeProjection[activeSubscene]];
		    for (i = 0; i < l.length; i++) {
		      self.zoom[l[i]] *= ds;
		    }
		    self.drawScene();
		    ev.preventDefault();
		  };

		  this.canvas.addEventListener("DOMMouseScroll", wheelHandler, false);
		  this.canvas.addEventListener("mousewheel", wheelHandler, false);
		};

		this.useid = function(subsceneid, type) {
		  var sub = this.getObj(subsceneid);
		  if (sub.embeddings[type] === "inherit")
		    return(this.useid(sub.parent, type));
		  else
		    return subsceneid;
		};

		this.inViewport = function(coords, subsceneid) {
		  var viewport = this.getObj(subsceneid).par3d.viewport,
		    x0 = coords.x - viewport.x*this.canvas.width,
		    y0 = coords.y - viewport.y*this.canvas.height;
		  return 0 <= x0 && x0 <= viewport.width*this.canvas.width &&
		         0 <= y0 && y0 <= viewport.height*this.canvas.height;
		}

    this.whichSubscene = function(coords) {
      var self = this,
          recurse = function(subsceneid) {
            var subscenes = self.getSubsceneEntries(subsceneid), i, id;
            for (i=0; i < subscenes.length; i++) {
              id = recurse(subscenes[i]);
              if (typeof(id) !== "undefined")
                return(id);
            }
            if (self.inViewport(coords, subsceneid))
              return(subsceneid)
            else
              return undefined;
          },
          rootid = this.scene.rootSubscene,
          result = recurse(rootid);
      if (typeof(result) === "undefined")
        result = rootid;
      return result;
    };

    this.translateCoords = function(subsceneid, coords) {
      var viewport = this.getObj(subsceneid).par3d.viewport;
      return {x: coords.x - viewport.x*this.canvas.width,
              y: coords.y - viewport.y*this.canvas.height};
    };

    this.initSphere = function(verts) {
      var gl = this.gl;
      result = {vb: new Float32Array(this.flatten(this.transpose(verts.vb))),
              it: new Uint16Array(this.flatten(this.transpose(verts.it))),
              sphereStride: 12}
      result.sphereCount = result.it.length;
	    result.buf = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, result.buf);
	    gl.bufferData(gl.ARRAY_BUFFER, result.vb, gl.STATIC_DRAW);
	    result.ibuf = gl.createBuffer();
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, result.ibuf);
	    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, result.it, gl.STATIC_DRAW);

      return result;
    };

		this.initialize = function(el, x) {
		  this.canvas = el;
		  this.canvas.rglinstance = this;
		  this.resize();
		  this.initGL0();
		  this.scene = x;
	    this.normMatrix = new CanvasMatrix4();
	    this.saveMat = {};
	    this.distance = null;
	    this.posLoc = 0;
	    this.colLoc = 1;
	    var objs = this.scene.objects,
	        self = this;
	    this.sphere = this.initSphere(x.sphereVerts);
	    Object.keys(objs).forEach(function(key){
		    self.initObj(key);
		  });
		  this.drawScene();
		  this.setMouseHandlers();
		};

    this.initGL0 = function() {
	    if (!window.WebGLRenderingContext){
	      alert("%snapshotimg2% Your browser does not support WebGL. See <a href=\\\"http://get.webgl.org\\\">http://get.webgl.org</a>");
	      return;
	    }
	    try {
	      this.initGL();
	    }
	    catch(e) {}
	    if ( !this.gl ) {
	      alert("Your browser appears to support WebGL, but did not create a WebGL context.  See <a href=\\\"http://get.webgl.org\\\">http://get.webgl.org</a>");
	      return;
	    }
    }

    this.initGL = function() {
	   this.gl = this.canvas.getContext("webgl") ||
	               this.canvas.getContext("experimental-webgl");
	   if (debug)
	     this.gl = WebGLDebugUtils.makeDebugContext(this.gl, throwOnGLError, logAndValidate);
	 }

    this.resize = function() {
      if (this.gl !== null)
        this.drawScene();
    }

		this.drawInstance = function(el) {
	    this.canvas = el;
	    this.resize();

	    this.initGL();
	    this.id = el.id;

		  this.gl.enable(gl.DEPTH_TEST);
	    this.gl.depthFunc(gl.LEQUAL);
	    this.gl.clearDepth(1.0);
	    this.gl.clearColor(1,1,1,1);
	    this.drag  = 0;
      this.drawScene();
		};

    this.drawScene = function() {
      var gl = this.gl;
			gl.depthMask(true);
			gl.disable(gl.BLEND);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			this.drawSubscene(this.scene.rootSubscene);
			gl.flush();
		};


}).call(rglClass.prototype);
