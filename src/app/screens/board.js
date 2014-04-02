define(['lodash', 'q', 'glm', 'common/viewUtil', 'facades/boardFacade'],
    function(_, Q, matrixUtil, viewUtil, boardFacade) {


        var gl, canvas, a_Position, a_TexCoord, a_Sampler, a_MvpMatrix, mvpMatrix, currentAngle;

        // number of points per single draw
        var n = 6;

        // buffers
        var buffers = [],
            texCoordBuffers = [],
            indexBuffers = [],
            textures = [];

        // vertices represented as 4 dimensional vectors for the sake of transformation/translation math
        var _vectors = [
            new Vector4([1.0, 1.0, 1.0, 1.0]),
            new Vector4([0.0, 1.0, 1.0, 1.0]),
            new Vector4([0.0, 0.0, 1.0, 1.0]),
            new Vector4([1.0, 0.0, 1.0, 1.0])
        ];


        var _rotationParams = {
            "front": [0, 0, 1, 0],
            "left": [90, 0, 1, 0],
            "back": [180, 0, 1, 0],
            "right": [-90, 0, 1, 0],
            "up": [-90, 1, 0, 0],
            "down": [90, 1, 0, 0]
        };

        var _translations = [
            [0, 0, 0],
            [-1, 0, 0],
            [0, -1, 0],
            [-1, -1, 0]
        ];

        // Vertext Shader Program
        var VSHADER_SOURCE =
            'attribute vec4 a_Position;\n' +
            'uniform mat4 u_MvpMatrix;\n' +
            'attribute vec2 a_TexCoord;\n' +
            'varying vec2 v_TexCoord;\n' +
            'void main() {\n' +
            '   gl_Position = u_MvpMatrix * a_Position;\n' +
            '   v_TexCoord = a_TexCoord;\n' +
            '}\n';

        // Fragment shader program
        var FSHADER_SOURCE =
            'precision mediump float;\n' +
            'uniform sampler2D u_Sampler;\n' +
            'varying vec2 v_TexCoord;\n' +
            'void main() {\n' +
            '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
            '}\n';

        // Init buffers
        function _initVertexBuffers(face, index) {

            var vertices = new Float32Array(_initVertices(face, index));
            _initVertexArrayBuffer(vertices);

            var texCoords = new Float32Array([ // Texture coordinates
                0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0
            ]);
            _initTextCoordArrayBuffer(texCoords);

            var indices = new Uint8Array([ // Indices of the vertices
                0, 1, 2, 0, 2, 3
            ]);
            _initElementArrayBuffer(indices);

        }

        function _initVertexArrayBuffer(data) {
            var buffer = gl.createBuffer(); // Create a buffer object
            buffers.push(buffer);
            if (!buffer) {
                console.log('Failed to create the buffer object');
                return false;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        }

        function _initTextCoordArrayBuffer(data) {
            var texCoordBuffer = gl.createBuffer(); // Create a buffer object
            texCoordBuffers.push(texCoordBuffer);
            if (!texCoordBuffer) {
                console.log('Failed to create the buffer object');
                return false;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        }

        function _initElementArrayBuffer(data) {
            // Create a buffer object
            var indexBuffer = gl.createBuffer();
            indexBuffers.push(indexBuffer);
            if (!indexBuffer) {
                return -1;
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        }

        function _initVertices(face, index) {
            var elements = [];
            var setTranslate = Matrix4.prototype.setTranslate;
            var setRotate = Matrix4.prototype.setRotate;
            var slice = Array.prototype.slice;
            _vectors.forEach(function(vector, vectorIndex) {
                var translateMatrix = new Matrix4();
                var rotateMatrix = new Matrix4();
                setTranslate.apply(translateMatrix, _translations[index]);
                setRotate.apply(rotateMatrix, _rotationParams[face]);
                var translatedVector = translateMatrix.multiplyVector4(_vectors[vectorIndex]);
                var translatedRotatedVector = rotateMatrix.multiplyVector4((translatedVector));
                elements = elements.concat(slice.call(translatedRotatedVector.elements, 0, 3));
            });

            return elements;
        }

        function _drawEach(m) {
            buffers[m], texCoordBuffers[m], indexBuffers[m], textures[m]
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers[m]);
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);

            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffers[m]);
            gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_TexCoord);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffers[m]);

            gl.bindTexture(gl.TEXTURE_2D, textures[m]);
            gl.uniform1i(u_Sampler, 0);
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
        }

        function _initMvpMatrix() {

            // Set the eye point and the viewing volume
            mvpMatrix = new Matrix4();
            // angle, aspect, near, far
            mvpMatrix.setPerspective(100, 1, 0.00001, 100);
            mvpMatrix.lookAt(0, 0, 0, 0, 0, 1, 0, 1, 0);
            mvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // x-axis
            mvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // y-axis

            // Pass the model view projection matrix to u_MvpMatrix
            gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        }

        function _initTextures(tileUrl) {
            // Create a texture object
            var texture = gl.createTexture();
            textures.push(texture);
            if (!texture) {
                console.log('Failed to create the texture object');
                return;
            }

            var image = new Image();
            image.onload = function() {
                _loadTexture(texture, image);
            };
            image.src = tileUrl;

        }

        function initEventHandlers() {
            var dragging = false;
            var lastX = -1,
                lastY = -1;

            canvas.onmousedown = function(ev) {
                var x = ev.clientX,
                    y = ev.clientY;

                var rect = ev.target.getBoundingClientRect();
                if (rect.left <= x && rect.right > x && rect.top <= y && rect.bottom > y) {
                    dragging = true;
                    lastX = x;
                    lastY = y;
                }
            };

            canvas.onmouseup = function() {
                dragging = false;
            };

            canvas.onmousemove = function(ev) {
                var x = ev.clientX,
                    y = ev.clientY;

                if (dragging) {
                    var factorX = 100 / canvas.height; // The rotation ratio
                    var factorY = 100 / canvas.width;
                    var dx = factorX * (x - lastX);
                    var dy = factorY * (y - lastY);

                    // Limit x-axis rotation angle to -90 to 90 degrees
                    currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0); // working
                    currentAngle[1] = currentAngle[1] - dx;
                }
                lastX = x, lastY = y;
            };
        }

        function _loadTexture(texture, image) {

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            // Set texture parameters
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            //Set the image to texture
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        }

        function _drawAll() {
            _initMvpMatrix();
            for (var m = 0; m < buffers.length; m++) {
                _drawEach(m);
            }
        }

        function _tick() {
            _drawAll();
            requestAnimationFrame(_tick, canvas);
        }

        // Public Methods
        function load() {
            return boardFacade.getData().then(function() {
                canvas = document.getElementById('webgl');

                currentAngle = [0.0, 0.0]; // [x-axis, y-axis] degrees
                initEventHandlers(canvas, currentAngle);
                gl = getWebGLContext(canvas);

                if (!gl) {
                    console.log('Failed to get the rendering context for WebGL');
                    return;
                }
                //Initialize shaders
                if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
                    console.log('Failed to initialize shaders');
                    return;
                }

                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.enable(gl.DEPTH_TEST);

                //Flip the iamge Y coordinates
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
                //Activate texture unit0
                gl.activeTexture(gl.TEXTURE0);
                //testing ajax

                a_Position = gl.getAttribLocation(gl.program, 'a_Position');
                a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
                u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
                u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');


                // Unbind the buffer object
                //gl.bindBuffer(gl.ARRAY_BUFFER, null);



                var lon = -117.16083,
                    lat = 32.70710;
                boardFacade.getPanoramas(lon, lat)
                    .then(function(panorama) {
                        for (var face in panorama.tileUrls) {
                            panorama.tileUrls[face].z_1.forEach(function(tileUrl, index) {
                                gl.useProgram(gl.program);
                                _initVertexBuffers(face, index);
                                _initTextures(tileUrl);

                            });
                        }
                        _tick();
                    });

                viewUtil.showScreen('home-screen');
            });
        }


        //return the module
        return {
            load: load
        };

    });