var min = Math.min,
    max = Math.max,
    sqrt = Math.sqrt,
    sin = Math.sin,
    acos = Math.acos,
    tan = Math.tan,
    SQRT2 = Math.SQRT2,
    PI = Math.PI,
    log = Math.log,
    exp = Math.exp;

rglClass = function() {
    this.canvas = null;
    this.zoom = [];
    this.FOV = [];
    this.userMatrix = new CanvasMatrix4();
    this.viewport = [];
    this.listeners = [];
    this.clipplanes = [];
    this.opaque = [];
    this.transparent = [];
    this.subscenes = [];
    this.parents = [];
    this.embeddings = [];
    this.observers = [];
    this.bboxes = [];
    this.scales = [];
    this.vshaders = [];
    this.fshaders = [];
    this.types = [];
    this.flags = [];
    this.prog = [];
    this.ofsLoc = [];
    this.origLoc = [];
    this.sizeLoc = [];
    this.usermatLoc = [];
    this.vClipplane = [];
    this.texture = [];
    this.texLoc = [];
    this.sampler = [];
    this.norigs = [];
    this.origsize = [];
    this.values = [];
    this.offsets = [];
    this.normLoc = [];
    this.clipLoc = [];
    this.centers = [];
    this.texts = [];
    this.cexs = [];
    this.f = [];
    this.buf = [];
    this.ibuf = [];
    this.mvMatLoc = [];
    this.prMatLoc = [];
    this.textScaleLoc = [];
    this.normMatLoc = [];
    this.IMVClip = [];
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
    this.getShader = function(gl, shaderType, code) {
        var shader;
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
        if (this.flags[id] & this.f_is_subscene)
            return "subscenes";
        else if (this.flags[id] & this.f_is_clipplanes)
            return "clipplanes";
        else if (this.flags[id] & this.f_is_transparent)
            return "transparent";
        else return "opaque";
    };

    this.inSubscene = function(id, subscene) {
        var thelist = this.whichList(id);
        return this[thelist][subscene].indexOf(id) > -1;
    };

    this.addToSubscene = function(id, subscene) {
        var thelist = this.whichList(id);
        if (this[thelist][subscene].indexOf(id) == -1)
            this[thelist][subscene].push(id);
    };

    this.delFromSubscene = function(id, subscene) {
        var thelist = this.whichList(id),
            i = this[thelist][subscene].indexOf(id);
        if (i > -1)
            this[thelist][subscene].splice(i, 1);
    };

    this.setSubsceneEntries = function(ids, subscene) {
        this.subscenes[subscene] = [];
        this.clipplanes[subscene] = [];
        this.transparent[subscene] = [];
        this.opaque[subscene] = [];
        for (var i = 0; i < ids.length; i++)
            this.addToSubscene(ids[i], subscene);
    };

    this.getSubsceneEntries = function(subscene) {
        return this.subscenes[subscene].
               concat(this.clipplanes[subscene]).
               concat(this.transparent[subscene]).
               concat(this.opaque[subscene]);
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
	     var ctx = this.canvas.getContext("2d"),
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

	         ctx = this.canvas.getContext("2d"),
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

	     this.canvas.width = canvasX;
	     this.canvas.height = canvasY;

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
	     this.vp = this.viewport[id];
	     this.gl.viewport(this.vp[0], this.vp[1], this.vp[2], this.vp[3]);
	     this.gl.scissor(this.vp[0], this.vp[1], this.vp[2], this.vp[3]);
	   };

	  this.setprMatrix = function(id) {
       var embedding = this.embeddings[id].projection;
       if (embedding === "replace")
         this.prMatrix.makeIdentity();
       else
         this.setprMatrix(this.parents[id]);
       if (embedding === "inherit")
         return;
       // This is based on the Frustum::enclose code from geom.cpp
       var bbox = this.bboxes[id],
           scale = this.scales[id],
           ranges = [(bbox[1]-bbox[0])*scale[0]/2,
                     (bbox[3]-bbox[2])*scale[1]/2,
                     (bbox[5]-bbox[4])*scale[2]/2],
           radius = sqrt(sum(ranges^2))*1.1; // A bit bigger to handle labels
       if (radius <= 0) radius = 1;
       var observer = this.observers[id],
           distance = observer[2],
	         t = tan(this.FOV[id]*PI/360),
	         near = distance - radius,
	         far = distance + radius,
	         hlen = t*near,
	         aspect = this.vp[1]/this.vp[2],
	         z = this.zoom[id];
	     if (aspect > 1)
	       this.prMatrix.frustum(-hlen*aspect*z, hlen*aspect*z,
	                        -hlen*z, hlen*z, near, far);
	     else
	       this.prMatrix.frustum(-hlen*z, hlen*z,
	                        -hlen*z/aspect, hlen*z/aspect,
	                        near, far);
	   };

	  this.setmvMatrix = function(id) {
	     var observer = this.observers[id];
	     this.mvMatrix.makeIdentity();
	     this.setmodelMatrix(id);
	     this.mvMatrix.translate(-observer[0], -observer[1], -observer[2]);

	   };

    this.setmodelMatrix = function(id) {
	     var embedding = this.embeddings[id].model;
	     if (embedding !== "inherit") {
	       var scale = this.scales[id],
	           bbox = this.bboxes[id],
	           center = [(bbox[0]+bbox[1])/2,
	                     (bbox[2]+bbox[3])/2,
	                     (bbox[4]+bbox[5])/2];
	       this.mvMatrix.translate(-center[0], -center[1], -center[2]);
	       this.mvMatrix.scale(scale[0], scale[1], scale[2]);
	       this.mvMatrix.multRight( this.userMatrix[id] );
	     }
	     if (embedding !== "replace")
	       this.setmodelMatrix(this.parents[id]);
	   };

	  this.setnormMatrix = function(subsceneid) {
	     var self = this,
	         recurse = function(id) {
	       var embedding = self.embeddings[id].model;
         if (embedding !== "inherit") {
           var scale = self.scales[id];
           self.normMatrix.scale(scale[0], scale[1], scale[2]);
           self.normMatrix.multRight(self.userMatrix[id]);
         }
         if (embedding !== "replace")
           recurse(self.parents[id]);
       };
       self.normMatrix.makeIdentity();
       recurse(subsceneid);
	   };

	  this.setprmvMatrix = function() {
	     this.prmvMatrix = new CanvasMatrix4( this.mvMatrix );
	     this.prmvMatrix.multRight( this.prMatrix );
	   };

    this.initObj = function(id) {
	    var obj = this.scene.objects[id],
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
		      reuse = flags & this.f_reuse,
		      gl = this.gl,
          texinfo, drawtype, f;

    if (type === "subscene" || type === "clipplanes" || type === "background" || type === "light")
      return;

		if (!sprites_3d && !is_clipplanes) {
			obj.prog = gl.createProgram();
			gl.attachShader(obj.prog, this.getShader( gl, gl.VERTEX_SHADER,                       obj.vshader ));
			gl.attachShader(obj.prog, this.getShader( gl, gl.FRAGMENT_SHADER,
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

		if (!sprites_3d && !reuse) {
			 obj.values = v;
		}

		if (!sprites_3d && reuse) {
			 obj.values = thisprefixrgl.objects[id].values;
		}

    if (is_lit && !fixed_quads && !sprites_3d) {
			 obj.normLoc = gl.getAttribLocation(obj.prog, "aNorm");
    }

		if (clipplanes && !sprites_3d) {
		  obj.clipLoc = [];
		  for (i=0; i < clipplanes; i++)
        obj.clipLoc[i] = gl.getUniformLocation(obj.prog,                                       "vClipplane" + (i+1));
		}

		if (is_indexed) {
			if (depth_sort) {
				obj.f = new Uint16Array([obj.f]);
				drawtype = "DYNAMIC_DRAW";
				f = obj.f;
			} else {
				f = new Uint16Array([obj.f]);
				drawtype = "STATIC_DRAW";
			}
		}

		if (type !== "spheres" && !sprites_3d) {
		  obj.buf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, obj.buf);
			gl.bufferData(gl.ARRAY_BUFFER, obj.values, gl.STATIC_DRAW);
		}

		if (is_indexed && type !== "spheres" && !sprites_3d) {
			obj.ibuf = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibuf);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, f, gl[drawtype]);
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

    this.scene.objects[id] = obj;
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

	  this.drawObj = function(id) {
	    var flags = this.flags[id],
	        type = this.types[id],
	        is_indexed = flags & this.f_is_indexed,
          is_lit = flags & this.f_is_lit,
		      has_texture = flags & this.f_has_texture,
		      fixed_quads = flags & this.f_fixed_quads,
		      depth_sort = flags & this.f_depth_sort,
		      sprites_3d = flags & this.f_sprites_3d,
		      sprite_3d = flags & this.f_sprite_3d,
		      is_clipplanes = type === "clipplanes",
		      reuse = flags & this.f_reuse,
		      gl = this.gl,
		      thisprefix = this.getPrefix(id),
		      sphereMV, baseofs, ofs, sscale, iOrig, i, count;

		  if (type === "clipplanes") {
			  var count = this.offsets[id].length;
			  this.IMVClip[id] = [];
			  for (i=0; i < count; i++) {
				  this.IMVClip[id][i] = this.multMV(this.invMatrix, this.vClipplane[id].slice(4*i, 4*(i+1)));
 			  }
			  this.clipFns[id] = function(id, objid, count1) {
			    var count2 = this.offsets[id].length;
    	    for (i=0; i<count2; i++) {
	    	    gl.uniform4fv(this.clipLoc[objid][count1 + i], this.IMVClip[id][i]);
    	    }
	    	  return(count1 + count2);
		    };
      return;
			}

      if (sprites_3d) {
			  var norigs = this.norigs[id], spriteid;
			  this.origs = this.origsize[id];
				this.usermat = this.userMatrix[id];
				for (iOrig=0; iOrig < norigs; iOrig++) {
			    for (i=0; i < this.spriteids[id].length; i++) {
					  this.drawObj(this.spriteids[id][i], clipplanes);
					}
				}
			} else {
				gl.useProgram(this.prog[id]);
			}

			if (sprite_3d) {
			  gl.uniform3f(this.origLoc[id], this.origs[4*iOrig],
							       this.origs[4*iOrig+1],
							       this.origs[4*iOrig+2]);
				gl.uniform1f(this.sizeLoc[id], this.origs[4*iOrig+3]);
				gl.uniformMatrix4fv(this.usermatLoc[id], false, this.usermat);
			}

			if (type === "spheres") {
			  gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuf);
			} else {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.buf[id]);
			}

			if (is_indexed && type !== "spheres") {
			  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuf[id]);
			} else if (type === "spheres") {
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIbuf);
			}

			gl.uniformMatrix4fv( this.prMatLoc[id], false, new Float32Array(this.prMatrix.getAsArray()) );
			gl.uniformMatrix4fv( this.mvMatLoc[id], false, new Float32Array(this.mvMatrix.getAsArray()) );
      var clipcheck = 0;
			for (i=0; i < clipplanes.length; i++) {
			  clipcheck = this.clipFns[clipplanes[i]].call(this, clipplanes[i], id, clipcheck);
			}

			if (is_lit && !sprite_3d) {
			  gl.uniformMatrix4fv( this.normMatLoc[id], false, new Float32Array(normMatrix.getAsArray()) );
			}

			if (is_lit && sprite_3d) {
				gl.uniformMatrix4fv( this.normMatLoc[id], false, this.usermat);
			}

			if (type === "text") {
				gl.uniform2f( this.textScaleLoc[id], 0.75/this.vp[2], 0.75/this.vp[3]);
			}

			gl.enableVertexAttribArray( posLoc );

			var nc = this.colorCount[id],
					nn = this.normalCount[id];
      count = this.vertexCount[id];
			if (depth_sort) {
						var nfaces = this.centers[id].length,
						    frowsize, z, w;
						if (sprites_3d) frowsize = 1;
						else if (type === "triangles") frowsize = 3;
						else frowsize = 6;
            var depths = new Float32Array(nfaces),
							  faces = new Array(nfaces);
						for(i=0; i<nfaces; i++) {
							z = this.prmvMatrix.m13*this.centers[id][3*i] +
							    this.prmvMatrix.m23*this.centers[id][3*i+1] +
						      this.prmvMatrix.m33*this.centers[id][3*i+2] +
					        this.prmvMatrix.m43;
							w = this.prmvMatrix.m14*this.centers[id][3*i] +
				  			  this.prmvMatrix.m24*this.centers[id][3*i+1] +
					  		  this.prmvMatrix.m34*this.centers[id][3*i+2] +
						  	  this.prmvMatrix.m44;
							depths[i] = z/w;
							faces[i] = i;
						}
						var depthsort = function(i,j) { return depths[j] - depths[i]; };
						faces.sort(depthsort);

						if (type !== "spheres") {
						  var f = new Uint16Array(this.f[id].length);
							for (i=0; i<nfaces; i++) {
					  	  for (var j=0; j<frowsize; j++) {
							    f[frowsize*i + j] = this.f[id][frowsize*faces[i] + j];
							  }
							}
							gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, f, gl.DYNAMIC_DRAW);
						}
					}

			if (type === "spheres") {
				var scale = this.scales[id],
						scount = count;
				gl.vertexAttribPointer(posLoc,  3, gl.FLOAT, false, this.sphereStride,  0);
				gl.enableVertexAttribArray(this.normLoc[id] );
				gl.vertexAttribPointer(this.normLoc[id],  3, gl.FLOAT, false, this.sphereStride,  0);
				gl.disableVertexAttribArray( colLoc );
				var sphereNorm = new CanvasMatrix4();
				sphereNorm.scale(scale[0], scale[1], scale[2]);
				sphereNorm.multRight(this.normMatrix);
				gl.uniformMatrix4fv( this.normMatLoc[id], false, new Float32Array(sphereNorm.getAsArray()) );


			  if (nc == 1) {
				  gl.vertexAttrib4fv( colLoc, this.colors[id]);
			  }

			  for (i = 0; i < scount; i++) {
			    sphereMV = new CanvasMatrix4();

			  	if (depth_sort) {
				    baseofs = faces[i]*thisprefixrgl.offsets[id].stride;
				  } else {
				    baseofs = i*thisprefixrgl.offsets[id].stride;
				  }

          ofs = baseofs + this.offsets[id].radofs;
				  sscale = this.values[id][ofs];

				  sphereMV.scale(sscale*scale[0], sscale*scale[1], sscale*scale[2]);
				  sphereMV.translate(this.values[id][baseofs],
				                     this.values[id][baseofs+1],
				                     this.values[id][baseofs+2]);
				  sphereMV.multRight(this.mvMatrix);
				  gl.uniformMatrix4fv( this.mvMatLoc[id], false, new Float32Array(sphereMV.getAsArray()) );

				  if (nc > 1) {
				    ofs = baseofs + this.offsets[id].cofs;
					  gl.vertexAttrib4f( colLoc, this.values[id][ofs],
					   		                       this.values[id][ofs+1],
                                       this.values[id][ofs+2],
							                         this.values[id][ofs+3] );
				  }
				  gl.drawElements(gl.TRIANGLES, sphereCount, gl.UNSIGNED_SHORT, 0);

			  }
			} else {
				if (nc === 1) {
					gl.disableVertexAttribArray( colLoc );
				  gl.vertexAttrib4fv( colLoc, this.colors[id]);
				} else {
					gl.enableVertexAttribArray( colLoc );
					gl.vertexAttribPointer(colLoc, 4, gl.FLOAT, false, 4*this.offsets[id].stride, 4*this.offsets[id].cofs);
				}
      }

			if (is_lit && nn > 0) {
				gl.enableVertexAttribArray( this.normLoc[id] );
				gl.vertexAttribPointer(this.normLoc[id], 3, gl.FLOAT, false, 4*this.offsets[id].stride, 4*this.offsets[id].nofs);
			}

			if (has_texture || type === "text") {
				gl.enableVertexAttribArray( this.texLoc[id] );
				gl.vertexAttribPointer(this.texLoc[id], 2, gl.FLOAT, false, 4*this.offsets[id].stride, 4*this.offsets[id].tofs);
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, this.texture[id]);
				gl.uniform1i( this.sampler[id], 0);
			}

			if (fixed_quads) {
				gl.enableVertexAttribArray( this.ofsLoc[id] );
				gl.vertexAttribPointer(this.ofsLoc[id], 2, gl.FLOAT, false, 4*this.offsets[id].stride, 4*this.offsets[id].oofs);
			}

			var mode = this.mode4type[type];

      if (type === "sprites" || type === "text") {
        count = count*6;
      } else if (type === "quads") {
        count = count * 6/4;
      } else if (type === "surface") {
				var dim = this.dims[id],
						nx = dim[0],
						nz = dim[1];
				count = (nx - 1)*(nz - 1)*6;
      }

			if (is_lines) {
				gl.lineWidth( this.lineWidths[id] );
			}

			gl.vertexAttribPointer(posLoc,  3, gl.FLOAT, false, 4*this.offsets[id].stride,  4*this.offsets[id].vofs);

			if (is_indexed) {
			  gl.drawElements(gl[mode], count, gl.UNSIGNED_SHORT, 0);
			} else {
			  gl.drawArrays(gl[mode], 0, count);
			}
	 };

	  this.drawSubscene = function(subsceneid) {
		  var subids = this.subids[subsceneid],
		      subscene_has_faces = false,
		      subscene_needs_sorting = false,
		      flags;

		  for (i=0; i < subids.length; i++) {
		    flags = this.flags[subids[i]];
		    subscene_has_faces |= (flags & this.f_is_lit)
		                       & !(flags & this.f_fixed_quads);
		    subscene_needs_sorting |= (flags & this.f_depth_sort);
		  }

		  var bgid = this.backgroundObj[subsceneid],
		      bg;

      if (typeof bgid === "undefined" || !this.colors[bgid].length)
			  bg = c(1,1,1,1);
			else
			  bg = this.colors[bgid][0];

			this.setViewport();
			gl.clearColor(bg[0], bg[1], bg[2], bg[3]);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			if (typeof subids !== "undefined") {
			  this.setprMatrix(subsceneid);
			  this.setmvMatrix(subsceneid);

				if (subscene_has_faces)
				  this.setnormMatrix(subsceneid);

				if (subscene_needs_sorting)
				  this.setprmvMatrix();

				var clipids = this.clipplanes[id];
				if (clipids.length > 0) {
				  this.invMatrix = new CanvasMatrix4(this.mvMatrix);
				  this.invMatrix.invert();
				  for (i = 0; i < this.clipplanes[id].length; i++)
				    this.drawFns[clipids[i]].call(this, clipids[i]);
				}
				subids = this.opaque[id];
				for (i = 0; subids && i < subids.length; i++) {
				  this.drawObj(subids[i], clipids);
				}
				subids = this.transparent[id];
				if (subids) {
				  gl.depthMask(false);
				  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
				                       gl.ONE, gl.ONE);
				  gl.enable(gl.BLEND);
				  for (i = 0; i < subids.length; i++) {
				    this.drawObj(subids[i], clipids);
				  }
				}
				subids = this.subscenes[id];
				for (i = 0; subids && i < subids.length; i++) {
				  this.drawFns[subids[i]].call(this, subids[i]);
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

		this.trackballdown = function(x,y) {
			var i, l = this.listeners[this.activeModel[this.activeSubscene]];
			this.rotBase = screenToVector(x, y);
			this.saveMat = [];
			for (i = 0; i < l.length; i++) {
			  saveMat[l[i]] = new CanvasMatrix4(this.userMatrix[l[i]]);
			}
		};

		this.trackballmove = function(x,y) {
			var rotCurrent = this.screenToVector(x,y),
				dot = this.rotBase[0]*rotCurrent[0] +
						  this.rotBase[1]*rotCurrent[1] +
			  	   	this.rotBase[2]*rotCurrent[2],
				angle = acos( dot/this.vlen(rotBase)/this.vlen(rotCurrent) )*180.0/PI,
				axis = this.xprod(rotBase, rotCurrent),
				l = this.listeners[activeModel[activeSubscene]],
				i;
		  for (i = 0; i < l.length; i++) {
			  this.userMatrix[l[i]].load(this.saveMat[l[i]]);
				this.userMatrix[l[i]].rotate(angle, axis[0], axis[1], axis[2]);
			}
			this.drawScene();
		};
		this.trackballend = 0;

		this.xAxis = [1.0, 0.0, 0.0];
		this.yAxis = [0.0, 1.0, 0.0];
		this.zAxis = [0.0, 0.0, 1.0];
    this.axisdown = function(x,y) {
		  this.rotBase = this.screenToVector(x, this.height/2);
			var i, l = this.listeners[this.activeModel[this.activeSubscene]];
			this.saveMat = [];
			for (i = 0; i < l.length; i++) {
			  saveMat[l[i]] = new CanvasMatrix4(this.userMatrix[l[i]]);
			}
		};

		this.axismove = function(x,y) {
		  var rotCurrent = this.screenToVector(x,this.height/2),
					angle = (rotCurrent[0] - rotBase[0])*180/PI,
			    rotMat = new CanvasMatrix4();
			rotMat.rotate(angle, this.axis[0], this.axis[1], this.axis[2]);
			var i, l = this.listeners[activeModel[activeSubscene]];
			for (i = 0; i < l.length; i++) {
			  this.userMatrix[l[i]].load(saveMat[l[i]]);
			  this.userMatrix[l[i]].multLeft(rotMat);
			}
			this.drawScene();
		};
    this.axisend = 0;

    this.y0zoom = 0;
		this.zoom0 = 0;
		this.zoomdown = function(x, y) {
		  this.y0zoom = y;
			this.zoom0 = [];
			var i,l = this.listeners[this.activeProjection[this.activeSubscene]];
			for (i = 0; i < l.length; i++) {
			  this.zoom0[l[i]] = log(this.zoom[l[i]]);
			}
		};
    this.zoommove = function(x, y) {
		  var i,l = this.listeners[this.activeProjection[this.activeSubscene]];
			for (i = 0; i < l.length; i++) {
			  this.zoom[l[i]] = exp(this.zoom0[l[i]] + (y-this.y0zoom)/this.height);
			}
				this.drawScene();
		  };
    this.zoomend = 0;

    this.y0fov = 0;
		this.fov0 = 0;
		this.fovdown = function(x, y) {
			  this.y0fov = y;
				this.fov0 = [];
				var i,l = this.listeners[this.activeProjection[this.activeSubscene]];
				for (i = 0; i < l.length; i++) {
				  this.fov0[l[i]] = this.FOV[l[i]];
				}
			};
    this.fovmove = function(x, y) {
			  var i, l = this.listeners[this.activeProjection[this.activeSubscene]];
				for (i = 0; i < l.length; i++) {
				  this.FOV[l[i]] = max(1, min(179, this.fov0[l[i]] + 180*(y-this.y0fov)/this.height));
				}
				this.drawScene();
			};
    this.fovend = 0;

    this.setMouseHandlers = function() {
		  this.canvas.onmousedown = function ( ev ){
		    if (!ev.which) // Use w3c defns in preference to MS
		    switch (ev.button) {
		      case 0: ev.which = 1; break;
		      case 1:
		      case 4: ev.which = 2; break;
		      case 2: ev.which = 3;
		    }
		    this.drag = ev.which;
		    var f = this.mousedown[drag-1];
		    if (f) {
		      var coords = this.relMouseCoords(ev);
		      coords.y = height-coords.y;
		      activeSubscene = this.whichSubscene(coords);
		      coords = this.translateCoords(activeSubscene, coords);
		      f(coords.x, coords.y);
		      ev.preventDefault();
		    }
		  };

		  this.canvas.onmouseup = function ( ev ){
		    if ( this.drag === 0 ) return;
		    var f = this.mouseend[drag-1];
		    if (f)
		      f();
		    this.drag = 0;
		  };

		  this.canvas.onmouseout = canvas.onmouseup;

		  this.canvas.onmousemove = function ( ev ) {
		    if ( this.drag === 0 ) return;
		    var f = this.mousemove[drag-1];
		    if (f) {
		      var coords = this.relMouseCoords(ev);
		      coords.y = height - coords.y;
		      coords = this.translateCoords(activeSubscene, coords);
		      f(coords.x, coords.y);
		    }
		  };

		  var wheelHandler = function(ev) {
		    var del = 1.1, i;
		    if (ev.shiftKey) del = 1.01;
		    var ds = ((ev.detail || ev.wheelDelta) > 0) ? del : (1 / del);
		    l = this.listeners[activeProjection[activeSubscene]];
		    for (i = 0; i < l.length; i++) {
		      this.zoom[l[i]] *= ds;
		    }
		    this.drawScene();
		    ev.preventDefault();
		  };

		  this.canvas.addEventListener("DOMMouseScroll", wheelHandler, false);
		  this.canvas.addEventListener("mousewheel", wheelHandler, false);
		};

		this.useid = function(subsceneid, type) {
		  if (this.embeddings[subsceneid][type] === "inherit")
		    return(this.useid(this.parents[subsceneid], type));
		  else
		    return subsceneid;
		};

		this.inViewport = function(coords, subsceneid) {
		  var viewport = this.viewport[subsceneid],
		    x0 = coords.x - viewport[0],
		    y0 = coords.y - viewport[1];
		  return 0 <= x0 && x0 <= viewport[2] &&
		         0 <= y0 && y0 <= viewport[3];
		}

    this.whichSubscene = function(coords) {
      var self = this,
          recurse = function(subsceneid) {
            var subscenes = self.subscenes[subsceneid], i, id;
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
          rootid = this.rootid,
          result = recurse(rootid);
      if (typeof(result) === "undefined")
        result = rootid;
      return result;
    };

    this.translateCoords = function(subsceneid, coords) {
      var viewport = this.viewport[subsceneid];
      return {x: coords.x - viewport[0], y: coords.y - viewport[1]};
    };

    this.vlen = function(v) {
		  return sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
		};

		this.xprod = function(a, b) {
			return [a[1]*b[2] - a[2]*b[1],
			    a[2]*b[0] - a[0]*b[2],
			    a[0]*b[1] - a[1]*b[0]];
		};

		this.screenToVector = function(x, y) {
		  var width = this.viewport[this.activeSubscene][2],
			  height = this.viewport[this.activeSubscene][3],
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

		this.initialize = function(el, x) {
		  this.canvas = el;
		  this.initGL0();
		  this.scene = x;
	    this.normMatrix = new CanvasMatrix4();
	    this.saveMat = {};
	    this.distance = null;
	    this.posLoc = 0;
	    this.colLoc = 1;
	    var objs = this.scene.objects,
	        self = this;
	    Object.keys(objs).forEach(function(key){
		    self.initObj(key);
		  });
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
	 }

		this.drawInstance = function(el) {
	    this.canvas = el;
	    this.initGL();
	    this.id = el.id;
	    this.canvas.width = this.width;
	    this.canvas.height = this.height;

		  this.gl.enable(gl.DEPTH_TEST);
	    this.gl.depthFunc(gl.LEQUAL);
	    this.gl.clearDepth(1.0);
	    this.gl.clearColor(1,1,1,1);
	    this.drag  = 0;
      this.drawScene();
		};

    this.drawScene = function() {
			gl.depthMask(true);
			gl.disable(gl.BLEND);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			this.drawSubscene(this.rootid);
			gl.flush();
		};


}).call(rglClass.prototype);
