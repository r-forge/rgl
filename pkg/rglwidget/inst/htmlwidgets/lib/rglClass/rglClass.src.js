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
          texinfo, drawtype, f;

		if (!sprites_3d && !is_clipplanes) {
			this.prog[id] = gl.createProgram();
			gl.attachShader(this.prog[id], this.getShader( gl, gl.VERTEX_SHADER,                       this.vshaders[id] ));
			gl.attachShader(this.prog[id], this.getShader( gl, gl.FRAGMENT_SHADE,
			                this.fshaders[id] ));
			//  Force aPos to location 0, aCol to location 1
			gl.bindAttribLocation(this.prog[id], 0, "aPos");
			gl.bindAttribLocation(this.prog[id], 1, "aCol");
			gl.linkProgram(this.prog[id]);
		}

		if (type === "clipplanes") {
			return();
		}

		if (type === "text") {
      texinfo = drawTextToCanvas(texts, this.cexs[id]);
		}

		if (fixed_quads && !sprites_3d) {
		  this.ofsLoc[id] = gl.getAttribLocation(this.prog[id], "aOfs");
		}

		if (sprite_3d) {
			this.origLoc[id] = gl.getUniformLocation(this.prog[id], "uOrig");
			this.sizeLoc[id] = gl.getUniformLocation(this.prog[id], "uSize");
			this.usermatLoc[id] = gl.getUniformLocation(this.prog[id], "usermat");
		}

		if (load_texture || type == "text") {
		  this.texture[id] = gl.createTexture();
			this.texLoc[id] = gl.getAttribLocation(this.prog[id], "aTexcoord");
			this.sampler[id] = gl.getUniformLocation(this.prog[id],"uSampler");
		}

		if (load_texture) {
			this.loadImageToTexture(this.textureFile[id], this.texture[id]);
		} else if (has_texture) {
			this.texture[id] = this.texture[texid];
		}

		if (type === "text") {
		  handleLoadedTexture(this.texture[id],
		    document.getElementById("prefixtextureCanvas"));
		}

    if (sprites_3d) {
			this.userMatrix[id] = new CanvasMatrix4(this.userMatrix[id]);
    }

		if (type === "text" && !reuse) {
			for (i=0; i < this.texts[id].length; i++)
			  for (j=0; j<4; j++) {
			    ind = this.offsets[id].stride*(4*i + j) + this.offsets[id].tofs;
			    	v[ind+2] = 2*(v[ind]-v[ind+2])*texinfo.widths[i];
			    	v[ind+3] = 2*(v[ind+1]-v[ind+3])*texinfo.textHeight;
			    	v[ind] *= texinfo.widths[i]/texinfo.canvasX;
			    	v[ind+1] = 1.0-(texinfo.offset + i*texinfo.skip -
			    	           v[ind+1]*texinfo.textHeight)/texinfo.canvasY;
			  }
		}

		if (!sprites_3d && !reuse) {
			 this.values[id] = v;
		}

		if (!sprites_3d && reuse) {
			 this.values[id] = thisprefixrgl.values[id];
		}

    if (is_lit && !fixed_quads && !sprites_3d) {
			 this.normLoc[id] = gl.getAttribLocation(this.prog[id], "aNorm");
    }

		if (clipplanes && !sprites_3d) {
		  this.clipLoc[id] = [];
		  for (i=0; i < clipplanes; i++)
        this.clipLoc[id][i] = gl.getUniformLocation(this.prog[id],                                       "vClipplane" + (i+1));
		}

		if (is_indexed) {
			if (depth_sort) {
				this.f[id] = new Uint16Array([this.f[id]]);
				drawtype = "DYNAMIC_DRAW";
				f = this.f[id];
			} else {
				f = new Uint16Array([this.f[id]]);
				drawtype = "STATIC_DRAW";
			}
		}

		if (type !== "spheres" && !sprites_3d) {
		  this.buf[id] = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buf[id]);
			gl.bufferData(gl.ARRAY_BUFFER, this.values[id], gl.STATIC_DRAW);
		}

		if (is_indexed && type !== "spheres" && !sprites_3d) {
			this.ibuf[id] = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuf[id]);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, f, gl[drawtype]);
		}

		if (!sprites_3d && !is_clipplanes) {
			this.mvMatLoc[id] = gl.getUniformLocation(this.prog[id], "mvMatrix");
			this.prMatLoc[id] = gl.getUniformLocation(this.prog[id], "prMatrix");
		}

		if (type === "text") {
			this.textScaleLoc[id] = gl.getUniformLocation(this.prog[id], "textScale");
		}

		if (is_lit && !sprites_3d) {
			this.normMatLoc[id] = gl.getUniformLocation(this.prog[id], "normMatrix");
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
							       triangles = "TRIANGLES"};

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
		      sphereMV, baseofs, ofs, sscale;

		  if (type === "clipplanes") {
			  var count = this.offsets[id].length;
			  rgl.attrib.count(id, "offsets")
			  this.IMVClip[id] = [];
			  for (i=0; i < count; i++) {
				  this.IMVClip[id][i] = this.multMV(this.invMatrix, this.vClipplane[id].slice(4*i, 4*(i+1)));
 			  }
			  this.clipFns[id] = function(id, objid, count1) {
			    var count2 = this.offsets[id].length, i;
    	    for (i=0; i<count2; i++) {
	    	    gl.uniform4fv(this.clipLoc[objid][count1 + i], this.IMVClip[id][i]);
    	    }
	    	  return(count1 + count2);
		    };
      return();
			}

      if (sprites_3d) {
			  var norigs = this.norigs[id],
			      iOrig, i, spriteid;
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

			var count = this.vertexCount[id],
			    nc = this.colorCount[id],
					nn = this.normalCount[id];

			if (depth_sort) {
						var nfaces = this.centers[id].length,
						    frowsize, z, w;
						if (sprites_3d) frowsize = 1;
						else if (type === "triangles") frowsize = 3;
						else frowsize = 6;
            var depths = new Float32Array(nfaces),
							  faces = new Array(nfaces);
						for(i=0; i<nfaces; i++) {
							z = this.prmvMatrix.m13*this.centers[id][3*i]
							  + this.prmvMatrix.m23*this.centers[id][3*i+1]
						    + this.prmvMatrix.m33*this.centers[id][3*i+2]
					      + this.prmvMatrix.m43;
							w = this.prmvMatrix.m14*this.centers[id][3*i]
				  			+ this.prmvMatrix.m24*this.centers[id][3*i+1]
					  		+ this.prmvMatrix.m34*this.centers[id][3*i+2]
						  	+ this.prmvMatrix.m44;
							depths[i] = z/w;
							faces[i] = i;
						}
						var depthsort = function(i,j) { return depths[j] - depths[i] };
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
				  this.drawObj(subids[i]], clipids);
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

}).call(rglClass.prototype);
