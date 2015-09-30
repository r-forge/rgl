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
    floor = Math.floor,
    round = Math.round;

rglwidgetClass = function() {
    this.canvas = null;
    this.userMatrix = new CanvasMatrix4();
    this.types = [];
    this.prMatrix = new CanvasMatrix4();
    this.mvMatrix = new CanvasMatrix4();
    this.vp = null;
    this.prmvMatrix = null;
    this.origs = null;
    this.gl = null;
    this.scene = null;
};

(function() {
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
      return a.map(function(currentValue, index, array) {
            return currentValue.concat(b[index]);
      });
    };

    this.flatten = function(a) {
      return a.reduce(function(x, y) { return x.concat(y); });
    };

    this.transpose = function(a) {
      var newArray = [],
          n = a.length,
          m = a[0].length,
          i;
      for(i = 0; i < m; i++){
        newArray.push([]);
      }

      for(i = 0; i < n; i++){
        for(var j = 0; j < m; j++){
          newArray[j].push(a[i][j]);
        }
      }
      return newArray;
    };

    this.sumsq = function(x) {
      var result = 0, i;
      for (i=0; i < x.length; i++)
        result += x[i]*x[i];
      return result;
    };

    this.toCanvasMatrix4 = function(mat) {
      if (mat instanceof CanvasMatrix4)
        return mat;
      var result = new CanvasMatrix4();
      mat = this.flatten(this.transpose(mat));
      result.load(mat);
      return result;
    };

    this.stringToRgb = function(s) {
      s = s.replace("#", "");
      var bigint = parseInt(s, 16);
      return [((bigint >> 16) & 255)/255,
              ((bigint >> 8) & 255)/255,
               (bigint & 255)/255];
    };

    this.componentProduct = function(x, y) {
      if (typeof y === "undefined") {
        alert("Bad arg to componentProduct");
      }
      var result = new Float32Array(3), i;
      for (i = 0; i<3; i++)
        result[i] = x[i]*y[i];
      return result;
    };

    this.getPowerOfTwo = function(value) {
	    var pow = 1;
	    while(pow<value) {
	      pow *= 2;
	    }
	    return pow;
	  };

	  this.unique = function(arr) {
	    arr = [].concat(arr);
	    return arr.filter(function(value, index, self) {
	      return self.indexOf(value) === index;
	    });
	  };

	  this.repeatToLen = function(arr, len) {
	    arr = [].concat(arr);
	    while (arr.length < len/2)
	      arr = arr.concat(arr);
	    return arr.concat(arr.slice(0, len - arr.length));
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
      var obj = this.getObj(id),
          flags = obj.flags;
        if (obj.type === "light")
          return "lights";
        if (flags & this.f_is_subscene)
            return "subscenes";
        if (flags & this.f_is_clipplanes)
            return "clipplanes";
        if (flags & this.f_is_transparent)
            return "transparent";
        return "opaque";
    };

    this.getObj = function(id) {
      if (typeof id !== "number") {
		    alert("getObj id is "+typeof id);
      }
      return this.scene.objects[id];
    };

    this.getIdsByType = function(type, subscene) {
      var
        result = [], i, self = this;
      if (typeof subscene === "undefined") {
        Object.keys(this.scene.objects).forEach(
          function(key) {
            key = parseInt(key, 10);
            if (self.getObj(key).type === type)
              result.push(key);
          });
      } else {
        ids = this.getObj(subscene).objects;
        for (i=0; i < ids.length; i++) {
          if (this.getObj(ids[i]).type === type) {
            result.push(ids[i]);
          }
        }
      }
      return result;
	  };

    this.getMaterial = function(id, property) {
      var obj = this.getObj(id),
          mat = obj.material[property];
      if (typeof mat === "undefined")
          mat = this.scene.material[property];
      return mat;
    };

    this.inSubscene = function(id, subscene) {
      return this.getObj(subscene).objects.indexOf(id) > -1;
    };

    this.addToSubscene = function(id, subscene) {
      var thelist,
          thesub = this.getObj(subscene),
          ids = [id],
          obj = this.getObj(id), i;
      if (typeof obj.newIds !== "undefined") {
        ids = ids.concat(obj.newIds);
      }
      for (i = 0; i < ids.length; i++) {
        id = ids[i];
        if (thesub.objects.indexOf(id) == -1) {
          thelist = this.whichList(id);
          thesub.objects.push(id);
          thesub[thelist].push(id);
        }
      }
    };

    this.delFromSubscene = function(id, subscene) {
      var thelist,
          thesub = this.getObj(subscene),
          obj = this.getObj(id),
          ids = [id], i, newIds;
      if (typeof obj.newIds !== "undefined")
        ids = ids.concat(obj.newIds);
      for (j=0; j<ids.length;j++) {
        id = ids[j];
        i = thesub.objects.indexOf(id);
        if (i > -1) {
          thesub.objects.splice(i, 1);
          thelist = this.whichList(id);
          i = thesub[thelist].indexOf(id);
          thesub[thelist].splice(i, 1);
        }
      }
    };

    this.setSubsceneEntries = function(ids, subsceneid) {
      var sub = this.getObj(subsceneid);
      sub.objects = ids;
      this.initSubscene(subsceneid);
    };

    this.getSubsceneEntries = function(subscene) {
      return this.getObj(subscene).objects;
    };

    this.getChildSubscenes = function(subscene) {
      return this.getObj(subscene).subscenes;
    };

    this.getVertexShader = function(id) {
	    var obj = this.getObj(id),
	        flags = obj.flags,
	        type = obj.type,
          is_lit = flags & this.f_is_lit,
		      has_texture = flags & this.f_has_texture,
		      fixed_quads = flags & this.f_fixed_quads,
		      sprites_3d = flags & this.f_sprites_3d,
		      sprite_3d = flags & this.f_sprite_3d,
		      reuse = flags & this.f_reuse,
		      nclipplanes = this.countClipplanes(id);

		  if (type === "clipplanes" || sprites_3d || reuse) return;

		  result = "	/* ****** "+type+" object "+id+" vertex shader ****** */\n"+
			"	attribute vec3 aPos;\n"+
		  "	attribute vec4 aCol;\n"+
			" uniform mat4 mvMatrix;\n"+
			" uniform mat4 prMatrix;\n"+
			" varying vec4 vCol;\n"+
			" varying vec4 vPosition;\n";

			if (is_lit && !fixed_quads)
				result = result + "	attribute vec3 aNorm;\n"+
			                    " uniform mat4 normMatrix;\n"+
			                    " varying vec3 vNormal;\n";

			if (has_texture || type === "text")
				result = result + " attribute vec2 aTexcoord;\n"+
			                    " varying vec2 vTexcoord;\n";

			if (type === "text")
				result = result + "	uniform vec2 textScale;\n";

			if (fixed_quads)
				result = result + "	attribute vec2 aOfs;\n";
			else if (sprite_3d)
				result = result + "	uniform vec3 uOrig;\n"+
			                    " uniform float uSize;\n"+
			                    " uniform mat4 usermat;\n";

			result = result + "	void main(void) {\n";

			if (nclipplanes || (!fixed_quads && !sprite_3d))
				result = result + "	  vPosition = mvMatrix * vec4(aPos, 1.);\n";

			if (!fixed_quads && !sprite_3d)
				result = result + "	  gl_Position = prMatrix * vPosition;\n";

			if (type == "points") {
			  var size = this.getMaterial(id, "size");
				result = result + "	  gl_PointSize = "+size.toFixed(1)+";\n";
			}

			result = result + "	  vCol = aCol;\n";

			if (is_lit && !fixed_quads && !sprite_3d)
				result = result + "	  vNormal = normalize((normMatrix * vec4(aNorm, 1.)).xyz);\n";

			if (has_texture || type === "text")
				result = result + "	  vTexcoord = aTexcoord;\n";

			if (type == "text")
				result = result + "	  vec4 pos = prMatrix * mvMatrix * vec4(aPos, 1.);\n"+
			                    "   pos = pos/pos.w;\n"+
			                    "   gl_Position = pos + vec4(aOfs*textScale, 0.,0.);\n";

			if (type == "sprites")
				result = result + "	  vec4 pos = mvMatrix * vec4(aPos, 1.);\n"+
			                    "   pos = pos/pos.w + vec4(aOfs, 0., 0.);\n"+
			                    "   gl_Position = prMatrix*pos;\n";

			if (sprite_3d)
				result = result + "	  vNormal = normalize((normMatrix * vec4(aNorm, 1.)).xyz);\n"+
			                    "   vec4 pos = mvMatrix * vec4(uOrig, 1.);\n"+
			                    "   vPosition = pos/pos.w + vec4(uSize*(vec4(aPos, 1.)*usermat).xyz,0.);\n"+
			                    "   gl_Position = prMatrix * vPosition;\n";

			result = result + "	}\n";
			return result;
    };

    this.getFragmentShader = function(id) {
	    var obj = this.getObj(id),
	        flags = obj.flags,
	        type = obj.type,
          is_lit = flags & this.f_is_lit,
		      has_texture = flags & this.f_has_texture,
		      fixed_quads = flags & this.f_fixed_quads,
		      sprites_3d = flags & this.f_sprites_3d,
		      reuse = flags & this.f_reuse,
		      nclipplanes = this.countClipplanes(id), i,
          texture_format, nlights;

		  if (type === "clipplanes" || sprites_3d || reuse) return;

		  if (has_texture)
			  texture_format = this.getMaterial(id, "textype");

		  result = "/* ****** "+type+" object "+id+" fragment shader ****** */\n"+
		  				 "#ifdef GL_ES\n"+
				       "  precision highp float;\n"+
				       "#endif\n"+
				       "  varying vec4 vCol; // carries alpha\n"+
				       "  varying vec4 vPosition;\n";

			if (has_texture || type === "text")
				result = result + "	varying vec2 vTexcoord;\n"+
			                    " uniform sampler2D uSampler;\n";

			if (is_lit && !fixed_quads)
				result = result + "	varying vec3 vNormal;\n";

			for (i = 0; i < nclipplanes; i++)
				result = result + "	uniform vec4 vClipplane"+i+";\n";

			if (is_lit) {
			  nlights = this.countLights(id);
			  if (nlights)
			      result = result + "	uniform mat4 mvMatrix;\n";
			  else
			      is_lit = false;
			}

			if (is_lit) {
				result = result + "	  uniform vec3 emission;\n"+
				                  "   uniform float shininess;\n";

				for (i=0; i < nlights; i++) {
					result = result + "	  uniform vec3 ambient" + i + ";\n"+
						                "   uniform vec3 specular" + i +"; // light*material\n"+
						                "   uniform vec3 diffuse" + i + ";\n"+
						                "   uniform vec3 lightDir" + i + ";\n"+
						                "   uniform bool viewpoint" + i + ";\n"+
						                "   uniform bool finite" + i + ";\n";
				}
			}

			result = result + "	void main(void) {\n";

			for (i=0; i < nclipplanes;i++)
			  result = result + "	  if (dot(vPosition, vClipplane"+i+") < 0.0) discard;\n";

			if (is_lit) {
				result = result + "	  vec3 eye = normalize(-vPosition.xyz);\n"+
				                  "   vec3 lightdir;\n"+
				                  "   vec4 colDiff;\n"+
				                  "   vec3 halfVec;\n"+
				                  "   vec4 lighteffect = vec4(emission, 0.);\n"+
				                  "   vec3 col;\n"+
				                  "   float nDotL;\n";
				if (fixed_quads) {
					result = result +   "	  vec3 n = vec3(0., 0., 1.);\n";
				}
				else {
					result = result +   "	  vec3 n = normalize(vNormal);\n"+
						                  "   n = -faceforward(n, n, eye);\n";
				}
        for (i=0; i < nlights; i++) {
					result = result + "   colDiff = vec4(vCol.rgb * diffuse" + i + ", vCol.a);\n"+
					                  "   lightdir = lightDir" + i + ";\n"+
					                  "   if (!viewpoint" + i +")\n"+
						                "     lightdir = (mvMatrix * vec4(lightdir, 1.)).xyz;\n"+
						                "   if (!finite" + i + ") {\n"+
						                "     halfVec = normalize(lightdir + eye);\n"+
					                  "   } else {\n"+
						                "     lightdir = normalize(lightdir - vPosition.xyz);\n"+
									          "     halfVec = normalize(lightdir + eye);\n"+
					                  "   }\n"+
					                  "	  col = ambient" + i + ";\n"+
						                "   nDotL = dot(n, lightdir);\n"+
						                "   col = col + max(nDotL, 0.) * colDiff.rgb;\n"+
						                "   col = col + pow(max(dot(halfVec, n), 0.), shininess) * specular" + i + ";\n"+
						                "   lighteffect = lighteffect + vec4(col, colDiff.a);\n";
				}

		  } else {
				result = result +   "   vec4 colDiff = vCol;\n"+
                            "	  vec4 lighteffect = colDiff;\n";
			}

			if ((has_texture && texture_format === "rgba") || type === "text")
				result = result +   "	  vec4 textureColor = lighteffect*texture2D(uSampler, vTexcoord);\n";

			if (has_texture) {
			  result = result + {
						rgb:            "   vec4 textureColor = lighteffect*vec4(texture2D(uSampler, vTexcoord).rgb, 1.);\n",
						alpha:          "   vec4 textureColor = texture2D(uSampler, vTexcoord);\n"+
                            "   float luminance = dot(vec3(1.,1.,1.), textureColor.rgb)/3.;\n"+
                            "   textureColor =  vec4(lighteffect.rgb, lighteffect.a*luminance);\n",
						luminance:      "   vec4 textureColor = vec4(lighteffect.rgb*dot(texture2D(uSampler, vTexcoord).rgb, vec3(1.,1.,1.))/3., lighteffect.a);\n",
					"luminance.alpha":"	  vec4 textureColor = texture2D(uSampler, vTexcoord);\n"+
						                "   float luminance = dot(vec3(1.,1.,1.),textureColor.rgb)/3.;\n"+
						                "   textureColor = vec4(lighteffect.rgb*luminance, lighteffect.a*textureColor.a);\n"
			    }[texture_format]+
                            "   gl_FragColor = textureColor;\n";
			} else if (type === "text") {
			  result = result +   "	  if (textureColor.a < 0.1)\n"+
                            "     discard;\n"+
                            "   else\n"+
                            "     gl_FragColor = textureColor;\n";
			} else
			  result = result +   "   gl_FragColor = lighteffect;\n";

			result = result + "	}\n";
      return result;
    };

    this.getShader = function(shaderType, code) {
        var gl = this.gl, shader;
        shader = gl.createShader(shaderType);
        gl.shaderSource(shader, code);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === 0)
            alert(gl.getShaderInfoLog(shader));
        return shader;
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

	  this.loadImageToTexture = function(uri, texture) {
	    var canvas = this.textureCanvas,
	        ctx = canvas.getContext("2d"),
	        image = new Image(),
	        self = this;

	     image.onload = function() {
	       var w = image.width,
	           h = image.height,
	           canvasX = self.getPowerOfTwo(w),
	           canvasY = self.getPowerOfTwo(h),
	           gl = self.gl,
	           maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
	       if (maxTexSize > 4096) maxTexSize = 4096;
	       while (canvasX > 1 && canvasY > 1 && (canvasX > maxTexSize || canvasY > maxTexSize)) {
	         canvasX /= 2;
	         canvasY /= 2;
	       }
	       canvas.width = canvasX;
	       canvas.height = canvasY;
	       ctx.imageSmoothingEnabled = true;
	       ctx.drawImage(image, 0, 0, canvasX, canvasY);
	       self.handleLoadedTexture(texture, canvas);
	       self.drawScene();
	     };
	     image.src = uri;
	   };

    this.drawTextToCanvas = function(text, cex, family, font) {
	     var canvasX, canvasY,
	         textY,
           scaling = 20,
	         textColour = "white",

	         backgroundColour = "rgba(0,0,0,0)",
           canvas = this.textureCanvas,
	         ctx = canvas.getContext("2d"),
           i, textHeights = [], widths = [], offset = 0, offsets = [],
	         fontStrings = [],
           getFontString = function(i) {
             textHeights[i] = scaling*cex[i];
             var fontString = textHeights[i] + "px",
                 family0 = family[i],
                 font0 = font[i];
             if (family0 === "sans")
               family0 = "sans-serif";
             else if (family0 === "mono")
               family0 = "monospace";
             fontString = fontString + " " + family0;
             if (font0 === 2 || font0 === 4)
               fontString = "bold " + fontString;
             if (font0 === 3 || font0 === 4)
               fontString = "italic " + fontString;
             return fontString;
           };
       cex = this.repeatToLen(cex, text.length);
       family = this.repeatToLen(family, text.length);
       font = this.repeatToLen(font, text.length);

	     canvasX = 1;
	     for (i = 0; i < text.length; i++)  {
	       ctx.font = fontStrings[i] = getFontString(i);
	       widths[i] = ctx.measureText(text[i]).width;
	       offset = offsets[i] = offset + 2*textHeights[i];
	       canvasX = (widths[i] > canvasX) ? widths[i] : canvasX;
	     }
	     canvasX = this.getPowerOfTwo(canvasX);
	     canvasY = this.getPowerOfTwo(offset);

	     canvas.width = canvasX;
	     canvas.height = canvasY;

	     ctx.fillStyle = backgroundColour;
	     ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	     ctx.textBaseline = "alphabetic";
	     for(i = 0; i < text.length; i++) {
	       textY = offsets[i];
	       ctx.font = fontStrings[i];
	       ctx.fillStyle = textColour;
	       ctx.textAlign = "left";
	       ctx.fillText(text[i], 0,  textY);
	     }
	     return {canvasX:canvasX, canvasY:canvasY,
	             widths:widths, textHeights:textHeights,
	             offsets:offsets};
	   };

    this.setViewport = function(id) {
	     var gl = this.gl,
	       vp = this.getObj(id).par3d.viewport,
	       x = vp.x*this.canvas.width,
	       y = vp.y*this.canvas.height,
	       width = vp.width*this.canvas.width,
	       height = vp.height*this.canvas.height;
	     this.vp = {x:x, y:y, width:width, height:height};
	     gl.viewport(x, y, width, height);
	     gl.scissor(x, y, width, height);
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
	       var sub = self.getObj(id),
	           embedding = sub.embeddings.model;
         if (embedding !== "inherit") {
           var scale = sub.par3d.scale;
           self.normMatrix.scale(1/scale[0], 1/scale[1], 1/scale[2]);
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
      return this.countObjs(id, "clipplanes");
    };

    this.countLights = function(id) {
      return this.countObjs(id, "light");
    };

    this.countObjs = function(id, type) {
      var self = this,
          bound = 0, obj,
        recurse = function(subsceneid) {
        var result = 0,
          subscene = self.getObj(subsceneid),
          subids = subscene.objects,
          i, ids;
        for (i = 0; i < subids.length; i++) {
          obj = self.getObj(subids[i]);
          if (obj.type == "sprites" && typeof obj.ids !== "undefined")
            subids = subids.concat(self.flatten(obj.ids));
        }
        i = subids.indexOf(parseInt(id, 10));
        if (i >= 0) {
          if (type === "light" && typeof subscene.lights !== "undefined")
            result += subscene.lights.length;
          else if (type === "clipplanes") {
            ids = subscene.clipplanes;
            for (j=0; j < ids.length; j++) {
              obj = self.getObj(ids[j]);
              result += obj.offsets.length;
            }
          }
        }
        for (i = 0; i < subscene.subscenes.length; i++) {
          if (result >= bound)
            break;
          result = max(result, recurse(subscene.subscenes[i]));
        }
        return result;
      };
      Object.keys(this.scene.objects).forEach(
        function(key) {
          if (self.getObj(parseInt(key, 10)).type === type)
            bound = bound + 1;
        });
      if (bound <= 0)
        return 0;
      return recurse(self.scene.rootSubscene);
    };

    this.initSubscene = function(id) {
      var sub = this.getObj(id),
          i, obj;
      sub.par3d.userMatrix = this.toCanvasMatrix4(sub.par3d.userMatrix);
      sub.par3d.listeners = [].concat(sub.par3d.listeners);
      sub.backgroundId = undefined;
      sub.subscenes = [];
      sub.clipplanes = [];
      sub.transparent = [];
      sub.opaque = [];
      sub.clipplanes = [];
      sub.lights = [];
      for (i=0; i < sub.objects.length; i++) {
        obj = this.getObj(sub.objects[i]);
        if (obj.type === "background")
          sub.backgroundId = obj.id;
        else
          sub[this.whichList(obj.id)].push(obj.id);
      }
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
		      gl = this.gl,
          texinfo, drawtype, nclipplanes, f, frowsize, nrows,
          i,j,v;

    if (typeof id !== "number") {
      alert("initObj id is "+typeof id);
    }

    if (type === "background" || type === "bboxdeco")
      return;

    if (type === "light") {
      obj.ambient = new Float32Array(obj.colors[0].slice(0,3));
      obj.diffuse = new Float32Array(obj.colors[1].slice(0,3));
      obj.specular = new Float32Array(obj.colors[2].slice(0,3));
      obj.lightDir = new Float32Array(obj.vertices[0]);
      return;
    }

    if (type === "subscene") {
      this.initSubscene(id);
      return;
    }

    if (type === "clipplanes") {
      obj.vClipplane = this.cbind(obj.normals, obj.offsets);
      return;
    }

		if (!sprites_3d) {
			obj.prog = gl.createProgram();
			gl.attachShader(obj.prog, this.getShader( gl.VERTEX_SHADER,
			  this.getVertexShader(id) ));
			gl.attachShader(obj.prog, this.getShader( gl.FRAGMENT_SHADER,
			                this.getFragmentShader(id) ));
			//  Force aPos to location 0, aCol to location 1
			gl.bindAttribLocation(obj.prog, 0, "aPos");
			gl.bindAttribLocation(obj.prog, 1, "aCol");
			gl.linkProgram(obj.prog);
      var linked = gl.getProgramParameter(obj.prog, gl.LINK_STATUS);
      if (!linked) {

        // An error occurred while linking
        var lastError = gl.getProgramInfoLog(program);
        console.warn("Error in program linking:" + lastError);

        gl.deleteProgram(program);
      }
		}

		if (type === "text") {
		  obj.cex = this.flatten(obj.cex);
		  obj.family = this.flatten(obj.family);
		  obj.font = this.flatten(obj.family);
      texinfo = this.drawTextToCanvas(obj.texts, obj.cex, obj.family,
                                      obj.font);
		}

		if (fixed_quads && !sprites_3d) {
		  obj.ofsLoc = gl.getAttribLocation(obj.prog, "aOfs");
		}

		if (sprite_3d) {
			obj.origLoc = gl.getUniformLocation(obj.prog, "uOrig");
			obj.sizeLoc = gl.getUniformLocation(obj.prog, "uSize");
			obj.usermatLoc = gl.getUniformLocation(obj.prog, "usermat");
		}

		if (has_texture || type == "text") {
		  obj.texture = gl.createTexture();
			obj.texLoc = gl.getAttribLocation(obj.prog, "aTexcoord");
			obj.sampler = gl.getUniformLocation(obj.prog, "uSampler");
		}

		if (has_texture) {
			this.loadImageToTexture(obj.material.uri, obj.texture);
		}

		if (type === "text") {
		  this.handleLoadedTexture(obj.texture, this.textureCanvas);
		}

    v = obj.vertices;
    obj.vertexCount = v.length;

    var stride = 3, nc, cofs, nofs, radofs, oofs, tofs, vnew, v1;

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
    	if (obj.radii.length === v.length) {
    	  v = this.cbind(v, obj.radii);
    	} else if (obj.radii.length === 1) {
    	  v = v.map(function(row, i, arr) { return row.concat(obj.radii[0]);});
    	}
    } else
    	radofs = -1;

    if (type == "sprites" && !sprites_3d) {
      tofs = stride;
      stride += 2;
    	oofs = stride;
    	stride += 2;
      vnew = new Array(4*v.length);
      var size = obj.radii, s = size[0]/2;
      for (i=0; i < v.length; i++) {
        if (size.length > 1)
          s = size[i]/2;
        vnew[4*i]  = v[i].concat([0,0,-s,-s]);
        vnew[4*i+1]= v[i].concat([1,0, s,-s]);
        vnew[4*i+2]= v[i].concat([1,1, s, s]);
        vnew[4*i+3]= v[i].concat([0,1,-s, s]);
      }
      v = vnew;
      obj.vertexCount = v.length;
    } else if (type === "text") {
      tofs = stride;
      stride += 2;
      oofs = stride;
      stride += 2;
      vnew = new Array(4*v.length);
      for (i=0; i < v.length; i++) {
        vnew[4*i]  = v[i].concat([0,-0.5]).concat(obj.adj[0]);
        vnew[4*i+1]= v[i].concat([1,-0.5]).concat(obj.adj[0]);
        vnew[4*i+2]= v[i].concat([1, 1.5]).concat(obj.adj[0]);
        vnew[4*i+3]= v[i].concat([0, 1.5]).concat(obj.adj[0]);
        for (j=0; j < 4; j++) {
          v1 = vnew[4*i+j];
          v1[tofs+2] = 2*(v1[tofs]-v1[tofs+2])*texinfo.widths[i];
	        v1[tofs+3] = 2*(v1[tofs+1]-v1[tofs+3])*texinfo.textHeights[i];
	        v1[tofs] *= texinfo.widths[i]/texinfo.canvasX;
	        v1[tofs+1] = 1.0-(texinfo.offsets[i] -
	            v1[tofs+1]*texinfo.textHeights[i])/texinfo.canvasY;
	        vnew[4*i+j] = v1;
        }
      }
      v = vnew;
      obj.vertexCount = v.length;
    } else if (typeof obj.texcoords !== "undefined") {
    	tofs = stride;
    	stride += 2;
    	oofs = -1;
    	v = this.cbind(v, obj.texcoords);
    } else {
     	tofs = -1;
      oofs = -1;
    }

    if (stride !== v[0].length)
      alert("problem in stride calculation");

    obj.offsets = {vofs:0, cofs:cofs, nofs:nofs, radofs:radofs, oofs:oofs, tofs:tofs, stride:stride};

    obj.values = new Float32Array(this.flatten(v));

    if (sprites_3d) {
			obj.userMatrix = new CanvasMatrix4(obj.userMatrix);
			obj.ids = this.flatten([].concat(obj.ids));
			is_lit = false;
    }

    if (is_lit && !fixed_quads) {
			 obj.normLoc = gl.getAttribLocation(obj.prog, "aNorm");
    }

    nclipplanes = this.countClipplanes(id);
		if (nclipplanes && !sprites_3d) {
		  obj.clipLoc = [];
		  for (i=0; i < nclipplanes; i++)
        obj.clipLoc[i] = gl.getUniformLocation(obj.prog,"vClipplane" + i);
		}

		if (is_lit) {
		  obj.emissionLoc = gl.getUniformLocation(obj.prog, "emission");
		  obj.emission = new Float32Array(this.stringToRgb(this.getMaterial(id, "emission")));
		  obj.shininessLoc = gl.getUniformLocation(obj.prog, "shininess");
		  obj.shininess = this.getMaterial(id, "shininess");
		  obj.nlights = this.countLights(id);
		  obj.ambientLoc = [];
		  obj.ambient = new Float32Array(this.stringToRgb(this.getMaterial(id, "ambient")));
		  obj.specularLoc = [];
		  obj.specular = new Float32Array(this.stringToRgb(this.getMaterial(id, "specular")));
		  obj.diffuseLoc = [];
		  obj.lightDirLoc = [];
		  obj.viewpointLoc = [];
		  obj.finiteLoc = [];
		  for (i=0; i < obj.nlights; i++) {
		    obj.ambientLoc[i] = gl.getUniformLocation(obj.prog, "ambient" + i);
		    obj.specularLoc[i] = gl.getUniformLocation(obj.prog, "specular" + i);
		    obj.diffuseLoc[i] = gl.getUniformLocation(obj.prog, "diffuse" + i);
		    obj.lightDirLoc[i] = gl.getUniformLocation(obj.prog, "lightDir" + i);
		    obj.viewpointLoc[i] = gl.getUniformLocation(obj.prog, "viewpoint" + i);
		    obj.finiteLoc[i] = gl.getUniformLocation(obj.prog, "finite" + i);
		  }
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
      } else if (type === "spheres") {
        nrows = obj.vertexCount;
        f = Array(nrows);
        for (i=0; i < f.length; i++) {
          f[i] = i;
        }
        frowsize = 1;
      } else if (type === "surface") {
        var dim = obj.dim[0],
            nx = dim[0],
            nz = dim[1];
        f = [];
        for (j=0; j<nx-1; j++) {
          for (i=0; i<nz-1; i++) {
            f.push(j + nx*i,
                   j + nx*(i+1),
                   j + 1 + nx*(i+1),
                   j + nx*i,
                   j + 1 + nx*(i+1),
                   j + 1 + nx*i);
          }
        }
        frowsize = 6;
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

		if (!sprites_3d) {
			obj.mvMatLoc = gl.getUniformLocation(obj.prog, "mvMatrix");
			obj.prMatLoc = gl.getUniformLocation(obj.prog, "prMatrix");
		}

		if (type === "text") {
			obj.textScaleLoc = gl.getUniformLocation(obj.prog, "textScale");
		}

		if (is_lit && !sprites_3d) {
			obj.normMatLoc = gl.getUniformLocation(obj.prog, "normMatrix");
		}
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

	  this.drawObj = function(id, subsceneid) {
	    var obj = this.getObj(id),
	        subscene = this.getObj(subsceneid),
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
		      gl = this.gl,
		      sphereMV, baseofs, ofs, sscale, i, count, light,
		      faces;

		  if (typeof id !== "number") {
		    alert("drawObj id is "+typeof id);
		  }

      if (type === "light" || type === "bboxdeco")
        return;

		  if (type === "clipplanes") {
			  count = obj.offsets.length;
			  var IMVClip = [];
			  for (i=0; i < count; i++) {
				  IMVClip[i] = this.multMV(this.invMatrix, obj.vClipplane[i]);
 			  }
 			  obj.IMVClip = IMVClip;
        return;
			}

      if (sprites_3d) {
			  var norigs = obj.vertices.length,
			      savenorm = new CanvasMatrix4(this.normMatrix);
			  this.origs = obj.vertices;
				this.usermat = new Float32Array(obj.userMatrix.getAsArray());
				this.radii = obj.radii;
				this.normMatrix = subscene.spriteNormmat;
				for (this.iOrig=0; this.iOrig < norigs; this.iOrig++) {
			    for (i=0; i < obj.ids.length; i++) {
					  this.drawObj(obj.ids[i], subsceneid);
					}
				}
				this.normMatrix = savenorm;
				return;
			} else {
				gl.useProgram(obj.prog);
			}

			if (sprite_3d) {
			  gl.uniform3fv(obj.origLoc, new Float32Array(this.origs[this.iOrig]));
			  if (this.radii.length > 1) {
				  gl.uniform1f(obj.sizeLoc, this.radii[this.iOrig][0]);
			  } else {
			    gl.uniform1f(obj.sizeLoc, this.radii[0][0]);
			  }
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
          clipplaneids = subscene.clipplanes,
          clip, j;
			for (i=0; i < clipplaneids.length; i++) {
			  clip = this.getObj(clipplaneids[i]);
			  for (j=0; j < clip.offsets.length; j++) {
			    gl.uniform4fv(obj.clipLoc[clipcheck + j], clip.IMVClip[j]);
			  }
			  clipcheck += clip.offsets.length;
			}

			if (is_lit) {
			  gl.uniformMatrix4fv( obj.normMatLoc, false, new Float32Array(this.normMatrix.getAsArray()) );
			  gl.uniform3fv( obj.emissionLoc, obj.emission);
			  gl.uniform1f( obj.shininessLoc, obj.shininess);
			  for (i=0; i < subscene.lights.length; i++) {
			    light = this.getObj(subscene.lights[i]);
			    gl.uniform3fv( obj.ambientLoc[i], this.componentProduct(light.ambient, obj.ambient));
			    gl.uniform3fv( obj.specularLoc[i], this.componentProduct(light.specular, obj.specular));
			    gl.uniform3fv( obj.diffuseLoc[i], light.diffuse);
			    gl.uniform3fv( obj.lightDirLoc[i], light.lightDir);
			    gl.uniform1i( obj.viewpointLoc[i], light.viewpoint);
			    gl.uniform1i( obj.finiteLoc[i], light.finite);
			  }
			  for (i=subscene.lights.length; i < obj.nlights; i++) {
			    gl.uniform3f( obj.ambientLoc[i], 0,0,0);
			    gl.uniform3f( obj.specularLoc[i], 0,0,0);
			    gl.uniform3f( obj.diffuseLoc[i], 0,0,0);
			  }
			}

			if (type === "text") {
				gl.uniform2f( obj.textScaleLoc, 0.75/this.vp.width, 0.75/this.vp.height);
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
            var depths = new Float32Array(nfaces);
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
					  	  for (j=0; j<frowsize; j++) {
							    f[frowsize*i + j] = obj.f[frowsize*faces[i] + j];
							  }
							}
							gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, f, gl.DYNAMIC_DRAW);
						}
					}

			if (type === "spheres") {
				subscene = this.getObj(subsceneid);
				var scale = subscene.par3d.scale,
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
				  gl.vertexAttrib4fv( this.colLoc, new Float32Array(obj.colors));
			  }

			  for (i = 0; i < scount; i++) {
			    sphereMV = new CanvasMatrix4();

			  	if (depth_sort) {
				    baseofs = faces[i]*obj.offsets.stride;
				  } else {
				    baseofs = i*obj.offsets.stride;
				  }

          ofs = baseofs + obj.offsets.radofs;
				  sscale = obj.values[ofs];

				  sphereMV.scale(sscale/scale[0], sscale/scale[1], sscale/scale[2]);
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
			  return;
			} else {
				if (obj.colorCount === 1) {
					gl.disableVertexAttribArray( this.colLoc );
				  gl.vertexAttrib4fv( this.colLoc, new Float32Array(obj.colors));
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

      if (type === "sprites" || type === "text" || type === "quads") {
        count = count * 6/4;
      } else if (type === "surface") {
				count = obj.f.length;
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
		      subids = obj.objects,
		      subscene_has_faces = false,
		      subscene_needs_sorting = false,
		      flags, i;

		  for (i=0; i < subids.length; i++) {
		    flags = objects[subids[i]].flags;
		    subscene_has_faces |= (flags & this.f_is_lit)
		                       & !(flags & this.f_fixed_quads);
		    subscene_needs_sorting |= (flags & this.f_depth_sort);
		  }

		  var bgid = obj.backgroundId,
		      bg;

      this.setViewport(subsceneid);
      if (typeof bgid !== "undefined" && objects[bgid].colors.length) {
			  bg = objects[bgid].colors[0];
			  gl.clearColor(bg[0], bg[1], bg[2], bg[3]);
			  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }

			if (subids.length) {
			  this.setprMatrix(subsceneid);
			  this.setmvMatrix(subsceneid);

				if (subscene_has_faces) {
				  this.setnormMatrix(subsceneid);
				  if ((obj.flags & this.f_sprites_3d) &&
				      typeof obj.spriteNormmat === "undefined") {
				    obj.spriteNormmat = new CanvasMatrix4(this.normMatrix);
				  }
				}

				if (subscene_needs_sorting)
				  this.setprmvMatrix();

				var clipids = obj.clipplanes;
				if (clipids.length > 0) {
				  this.invMatrix = new CanvasMatrix4(this.mvMatrix);
				  this.invMatrix.invert();
				  for (i = 0; i < clipids.length; i++)
				    this.drawObj(clipids[i], subsceneid);
				}
				subids = obj.opaque;
				gl.depthMask(true);
				for (i = 0; subids && i < subids.length; i++) {
				  this.drawObj(subids[i], subsceneid);
				}
				subids = obj.transparent;
				if (subids.length > 0) {
				  gl.depthMask(false);
				  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
				                       gl.ONE, gl.ONE);
				  gl.enable(gl.BLEND);
				  for (i = 0; i < subids.length; i++) {
				    this.drawObj(subids[i], subsceneid);
				  }
				}
				subids = obj.subscenes;
				for (i = 0; i < subids.length; i++) {
				  this.drawSubscene(subids[i]);
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
			var activeSub = this.getObj(activeSubscene),
			    activeModel = this.getObj(this.useid(activeSub.id, "model")),
			  i, l = activeModel.par3d.listeners;
			handlers.rotBase = this.screenToVector(x, y);
			this.saveMat = [];
			for (i = 0; i < l.length; i++) {
			  activeSub = this.getObj(l[i]);
			  activeSub.saveMat = new CanvasMatrix4(activeSub.par3d.userMatrix);
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
		    activeSub = this.getObj(l[i]);
			  activeSub.par3d.userMatrix.load(objects[l[i]].saveMat);
				activeSub.par3d.userMatrix.rotate(angle, axis[0], axis[1], axis[2]);
			}
			this.drawScene();
		};
		handlers.trackballend = 0;

    handlers.axisdown = function(x,y) {
		  handlers.rotBase = this.screenToVector(x, this.canvas.height/2);
			var activeSub = this.getObj(activeSubscene),
			    activeModel = this.getObj(this.useid(activeSub.id, "model")),
			  i, l = activeModel.par3d.listeners;
			for (i = 0; i < l.length; i++) {
			  activeSub = this.getObj(l[i]);
			  activeSub.saveMat = new CanvasMatrix4(activeSub.par3d.userMatrix);
			}
		};

		handlers.axismove = function(x,y) {
		  var rotCurrent = this.screenToVector(x, this.canvas.height/2),
		      rotBase = handlers.rotBase,
					angle = (rotCurrent[0] - rotBase[0])*180/PI,
			    rotMat = new CanvasMatrix4();
			rotMat.rotate(angle, handlers.axis[0], handlers.axis[1], handlers.axis[2]);
			var activeSub = this.getObj(activeSubscene),
			    activeModel = this.getObj(this.useid(activeSub.id, "model")),
			  i, l = activeModel.par3d.listeners;
			for (i = 0; i < l.length; i++) {
			  activeSub = this.getObj(l[i]);
			  activeSub.par3d.userMatrix.load(activeSub.saveMat);
			  activeSub.par3d.userMatrix.multLeft(rotMat);
			}
			this.drawScene();
		};
    handlers.axisend = 0;

    handlers.y0zoom = 0;
		handlers.zoom0 = 0;
		handlers.zoomdown = function(x, y) {
		  var activeSub = this.getObj(activeSubscene),
        activeProjection = this.getObj(this.useid(activeSub.id, "projection")),
			  i, l = activeProjection.par3d.listeners;
		  handlers.y0zoom = y;
		  for (i = 0; i < l.length; i++) {
			  activeSub = this.getObj(l[i]);
			  activeSub.zoom0 = log(activeSub.par3d.zoom);
			}
		};
    handlers.zoommove = function(x, y) {
			var activeSub = this.getObj(activeSubscene),
			    activeProjection = this.getObj(this.useid(activeSub.id, "projection")),
			  i, l = activeProjection.par3d.listeners;
			for (i = 0; i < l.length; i++) {
			  activeSub = this.getObj(l[i]);
			  activeSub.par3d.zoom = exp(activeSub.zoom0 + (y-handlers.y0zoom)/this.canvas.height);
			}
				this.drawScene();
		  };
    handlers.zoomend = 0;

    handlers.y0fov = 0;
		handlers.fovdown = function(x, y) {
			  handlers.y0fov = y;
				var activeSub = this.getObj(activeSubscene),
			    activeProjection = this.getObj(this.useid(activeSub.id, "projection")),
			  i, l = activeProjection.par3d.listeners;
				for (i = 0; i < l.length; i++) {
				  activeSub = this.getObj(l[i]);
				  activeSub.fov0 = activeSub.par3d.FOV;
				}
			};
    handlers.fovmove = function(x, y) {
			var activeSub = this.getObj(activeSubscene),
			    activeProjection = this.getObj(this.useid(activeSub.id, "projection")),
			  i, l = activeProjection.par3d.listeners;
				for (i = 0; i < l.length; i++) {
				  activeSub = this.getObj(l[i]);
				  activeSub.par3d.FOV = max(1, min(179, activeSub.fov0 +
				     180*(y-handlers.y0fov)/this.canvas.height));
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
		    switch (handler) {
		    case "xAxis":
		      handler = "axis";
		      handlers.axis = [1.0, 0.0, 0.0];
		      break;
		    case "yAxis":
		      handler = "axis";
		      handlers.axis = [0.0, 1.0, 0.0];
		      break;
		    case "zAxis":
		      handler = "axis";
		      handlers.axis = [0.0, 0.0, 1.0];
		      break;
		    }
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

		  handlers.wheelHandler = function(ev) {
		    var del = 1.1, i;
		    if (ev.shiftKey) del = 1.01;
		    var ds = ((ev.detail || ev.wheelDelta) > 0) ? del : (1 / del);
		    if (typeof activeSubscene === "undefined")
		      activeSubscene = self.scene.rootSubscene;
			  var activeSub = self.getObj(activeSubscene),
			      activeProjection = self.getObj(self.useid(activeSub.id, "projection")),
			      l = activeProjection.par3d.listeners;

		    for (i = 0; i < l.length; i++) {
		      activeSub = self.getObj(l[i]);
		      activeSub.par3d.zoom *= ds;
		    }
		    self.drawScene();
		    ev.preventDefault();
		  };

		  this.canvas.addEventListener("DOMMouseScroll", handlers.wheelHandler, false);
		  this.canvas.addEventListener("mousewheel", handlers.wheelHandler, false);
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
		};

    this.whichSubscene = function(coords) {
      var self = this,
          recurse = function(subsceneid) {
            var subscenes = self.getChildSubscenes(subsceneid), i, id;
            for (i=0; i < subscenes.length; i++) {
              id = recurse(subscenes[i]);
              if (typeof(id) !== "undefined")
                return(id);
            }
            if (self.inViewport(coords, subsceneid))
              return(subsceneid);
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
              sphereStride: 12};
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
		  this.textureCanvas = document.createElement("canvas");
		  this.textureCanvas.style.display = "block";
		  this.scene = x;
	    this.normMatrix = new CanvasMatrix4();
	    this.saveMat = {};
	    this.distance = null;
	    this.posLoc = 0;
	    this.colLoc = 1;
	    if (el)
	      this.initCanvas(el);
		};

		this.initCanvas = function(el) {
		  this.canvas = el;
		  this.canvas.rglinstance = this;
		  this.initGL0();
	    var objs = this.scene.objects,
	        self = this;
	    this.sphere = this.initSphere(this.scene.sphereVerts);
	    Object.keys(objs).forEach(function(key){
		    self.initObj(parseInt(key, 10));
		  });
		  this.setMouseHandlers();
		};

		/* this is only used by writeWebGL2 as the onload handler; with rglwidget(), it
		   is done as part of this.initialize. */

		this.start = function() {
		  this.initCanvas(this.canvas);
		  if (typeof this.prefix !== "undefined") {
		    this.debugelement = document.getElementById(this.prefix + "debug");
	      this.debug("");
		  }
		  this.drawInstance();
		}

		this.debug = function(msg, img) {
		  if (typeof this.debugelement !== "undefined") {
		    this.debugelement.innerHTML = msg;
		    if (typeof img !== "undefined") {
		      this.debugelement.insertBefore(img, this.debugelement.firstChild);
		    }
		  } else
		    alert(msg);
		};

    this.getSnapshot = function() {
      var img;
	    if (typeof this.scene.snapshot !== "undefined") {
	      img = document.createElement("img");
	      img.src = this.scene.snapshot;
	      img.alt = "Snapshot";
	    }
	    return img;
    }

    this.initGL0 = function() {
	    if (!window.WebGLRenderingContext){
	      debug("Your browser does not support WebGL. See <a href=\"http://get.webgl.org\">http://get.webgl.org</a>", this.getSnapshot());
	      return;
	    }
	    try {
	      this.initGL();
	    }
	    catch(e) {}
	    if ( !this.gl ) {
	      debug("Your browser appears to support WebGL, but did not create a WebGL context.  See <a href=\"http://get.webgl.org\">http://get.webgl.org</a>",
	            this.getSnapshot());
	      return;
	    }
    };

    this.initGL = function() {
	   this.gl = this.canvas.getContext("webgl") ||
	               this.canvas.getContext("experimental-webgl");
	   if (debug)
	     this.gl = WebGLDebugUtils.makeDebugContext(this.gl, throwOnGLError, logAndValidate);
	 };

    this.resize = function() {
      if (this.gl !== null)
        this.drawScene();
    };

		this.drawInstance = function() {
	    var gl = this.gl;
		  gl.enable(gl.DEPTH_TEST);
	    gl.depthFunc(gl.LEQUAL);
	    gl.clearDepth(1.0);
	    gl.clearColor(1,1,1,1);
	    this.drag  = 0;
      this.drawScene();
		};

    this.drawScene = function() {
      var gl = this.gl;
			gl.disable(gl.BLEND);
			this.drawSubscene(this.scene.rootSubscene);
			gl.flush();
		};

		this.subsetSetter = function(control) {
		  if (typeof control.subscenes === "undefined" ||
		      control.subscenes === null)
        control.subscenes = this.scene.rootSubscene;
      var value = Math.round(control.value),
          subscenes = [].concat(control.subscenes),
          i, j, entries, subsceneid,
          ismissing = function(x) {
            return control.fullset.indexOf(x) < 0;
          },
          tointeger = function(x) {
            return parseInt(x, 10);
          };

      for (i=0; i < subscenes.length; i++) {
        subsceneid = subscenes[i];
        if (typeof this.getObj(subsceneid) === "undefined")
          alert("typeof object is undefined");
        entries = this.getObj(subsceneid).objects;
        entries = entries.filter(ismissing);
        if (control.accumulate) {
          for (j=0; j<=value; j++)
            entries = entries.concat(control.subsets[j]);
        } else {
          entries = entries.concat(control.subsets[value]);
        }
        entries = entries.map(tointeger);
        this.setSubsceneEntries(this.unique(entries), subsceneid);
      }
		};

		this.propertySetter = function(control)  {
		  var value = control.value,
		      values = [].concat(control.values),
		      svals = [].concat(control.param),
		      direct = values[0] === null,
		      entries = [].concat(control.entries),
		      ncol = entries.length,
		      nrow = values.length/ncol,
		      properties = this.repeatToLen(control.properties, ncol),
		      objids = this.repeatToLen(control.objids, ncol),
		      property = properties[0], objid = objids[0],
		      obj = this.getObj(objid),
		      propvals, i, v1, v2, p, entry, gl, needsBinding,

		      getPropvals = function() {
            if (property === "userMatrix")
              return obj.userMatrix.getAsArray();
            else
              return obj[property];
		      };

      if (direct && typeof value === "undefined")
        return;

      if (control.interp) {
        values = values.slice(0, ncol).concat(values).
                 concat(values.slice(ncol*(nrow-1), ncol*nrow));
        svals = [-Infinity].concat(svals).concat(Infinity);
        for (i = 1; i < svals.length; i++) {
          if (value <= svals[i]) {
            if (svals[i] === Infinity)
              p = 1;
            else
              p = (svals[i] - value)/(svals[i] - svals[i-1]);
            break;
          }
        }
      } else if (!direct) {
        value = round(value);
      }

      propvals = getPropvals();

      for (j=0; j<entries.length; j++) {
        entry = entries[j];
        newprop = properties[j];
        newid = objids[j];

        if (newprop != property || newid != objid) {
          property = newprop;
          objid = newid;
          obj = this.getObj(objid);
          propvals = getPropvals();
        }
        if (control.interp) {
          v1 = values[ncol*(i-1) + j];
          v2 = values[ncol*i + j];
          propvals[entry] = p*v1 + (1-p)*v2;
        } else if (!direct) {
          propvals[entry] = values[ncol*value + j];
        } else {
          propvals[entry] = value[j];
        }
      }
      needsBinding = [];
      for (j=0; j < entries.length; j++) {
        if (properties[j] === "values" &&
            needsBinding.indexOf(objids[j]) === -1) {
          needsBinding.push(objids[j]);
        }
      }
      for (j=0; j < needsBinding.length; j++) {
        gl = this.gl;
        obj = this.getObj(needsBinding[j]);
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buf);
        gl.bufferData(gl.ARRAY_BUFFER, obj.values, gl.STATIC_DRAW);
      }
    };

    this.vertexSetter = function(control)  {
      var svals = [].concat(control.param),
          j, k, p, propvals, stride, ofs, obj,
          attrib,
          ofss    = {x:"vofs", y:"vofs", z:"vofs",
                     red:"cofs", green:"cofs", blue:"cofs",
                     alpha:"cofs", radii:"radofs",
                     nx:"nofs", ny:"nofs", nz:"nofs",
                     ox:"oofs", oy:"oofs", oz:"oofs",
                     ts:"tofs", tt:"tofs"},
          pos     = {x:0, y:1, z:2,
                     red:0, green:1, blue:2,
                     alpha:3,radii:0,
                     nx:0, ny:1, nz:2,
                     ox:0, oy:1, oz:2,
                     ts:0, tt:1},
  	    values = control.values,
		    direct = values === null,
		    ncol,
        interp = control.interp,
        vertices = [].concat(control.vertices),
        attributes = [].concat(control.attributes),
        value = control.value;

      ncol = max(vertices.length, attributes.length);

      if (!ncol)
        return;

      vertices = this.repeatToLen(vertices, ncol);
      attributes = this.repeatToLen(attributes, ncol);

      if (direct)
        interp = false;

      /* JSON doesn't pass Infinity */
      svals[0] = -Infinity;
      svals[svals.length - 1] = Infinity;

      for (j = 1; j < svals.length; j++) {
        if (value <= svals[j]) {
          if (interp) {
            if (svals[j] === Infinity)
              p = 1;
            else
              p = (svals[j] - value)/(svals[j] - svals[j-1]);
          } else {
            if (svals[j] - value > value - svals[j-1])
              j = j - 1;
          }
          break;
        }
      }

      obj = this.getObj(control.objid);
      propvals = obj.values;
      for (k=0; k<ncol; k++) {
        attrib = attributes[k];
        vertex = vertices[k];
        ofs = obj.offsets[ofss[attrib]];
        if (ofs < 0)
          alert("Attribute '"+attrib+"' not found in object "+control.objid);
        else {
          stride = obj.offsets.stride;
          ofs = vertex*stride + ofs + pos[attrib];
          if (direct) {
            propvals[ofs] = value;
          } else if (interp) {
            propvals[ofs] = p*values[j-1][k] + (1-p)*values[j][k];
          } else {
            propvals[ofs] = values[j][k];
          }
        }
      }
      if (typeof obj.buf !== "undefined") {
        var gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buf);
        gl.bufferData(gl.ARRAY_BUFFER, propvals, gl.STATIC_DRAW);
      }
    };

    this.ageSetter = function(control) {
      var objids = [].concat(control.objids),
          nobjs = objids.length,
          time = control.value,
          births = control.births,
          ages = control.ages,
          steps = births.length,
          j = Array(steps),
          p = Array(steps),
          i, k, age, j0, propvals, stride, ofs, objid, obj,
          attrib, dim,
          attribs = ["colors", "alpha", "radii", "vertices",
                     "normals", "origins", "texcoords",
                     "x", "y", "z",
                     "red", "green", "blue"],
          ofss    = ["cofs", "cofs", "radofs", "vofs",
                     "nofs", "oofs", "tofs",
                     "vofs", "vofs", "vofs",
                     "cofs", "cofs", "cofs"],
          dims    = [3,1,1,3,
                     3,2,2,
                     1,1,1,
                     1,1,1],
          pos     = [0,3,0,0,
                     0,0,0,
                     0,1,2,
                     0,1,2];
      /* Infinity doesn't make it through JSON */
      ages[0] = -Infinity;
      ages[ages.length-1] = Infinity;
      for (i = 0; i < steps; i++) {
        if (births[i] !== null) {  // NA in R becomes null
          age = time - births[i];
          for (j0 = 1; age > ages[j0]; j0++);
          if (ages[j0] == Infinity)
            p[i] = 1;
          else if (ages[j0] > ages[j0-1])
            p[i] = (ages[j0] - age)/(ages[j0] - ages[j0-1]);
          else
            p[i] = 0;
          j[i] = j0;
        }
      }
      for (l = 0; l < nobjs; l++) {
        objid = objids[l];
        obj = this.getObj(objid);
        propvals = obj.values;
        stride = obj.offsets.stride;
        for (k = 0; k < attribs.length; k++) {
          attrib = control[attribs[k]];
          if (typeof attrib !== "undefined") {
            ofs = obj.offsets[ofss[k]];
            if (ofs >= 0) {
              dim = dims[k];
              ofs = ofs + pos[k];
              for (i = 0; i < steps; i++) {
                if (births[i] !== null) {
                  for (d=0; d < dim; d++) {
                    propvals[i*stride + ofs + d] = p[i]*attrib[dim*(j[i]-1) + d] + (1-p[i])*attrib[dim*j[i] + d];
                  }
                }
              }
            } else
              alert("\'"+attribs[k]+"\' property not found in object "+objid);
          }
        }
        obj.values = propvals;
        if (typeof obj.buf !== "undefined") {
          gl = this.gl;
          gl.bindBuffer(gl.ARRAY_BUFFER, obj.buf);
          gl.bufferData(gl.ARRAY_BUFFER, obj.values, gl.STATIC_DRAW);
        }
      }
		};

		this.oldBridge = function(control) {
		  var attrname, global = window[control.prefix + "rgl"];
		  if (typeof global !== "undefined")
        for (attrname in global)
          this[attrname] = global[attrname];
      window[control.prefix + "rgl"] = this;
		};

		this.applyControls = function(x) {
		  var self = this;
	    Object.keys(x).forEach(function(key){
		    var control = x[key],
		        type = control.type;
		    if (typeof type === "undefined")
		      return;
		    self[type](control);
		  });
		  self.drawScene();
		};
}).call(rglwidgetClass.prototype);
