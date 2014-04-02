define(['lodash', 'q', 'glm', 'common/viewUtil', 'facades/boardFacade'],
    function(_, Q, matrixUtil, viewUtil, boardFacade) {

        var g_points = [],
            g_colors = [];

        var canvas;

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
        function _initVertexBuffers(gl, face, index) {

            var vertices = new Float32Array(_initVertices(face, index));
            _initVertexArrayBuffer(gl, vertices);

            var texCoords = new Float32Array([ // Texture coordinates
                0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0
            ]);
            _initTextCoordArrayBuffer(gl, texCoords);


            var indices = new Uint8Array([ // Indices of the vertices
                0, 1, 2, 0, 2, 3
            ]);
            _initElementArrayBuffer(gl, indices);

        }
        var buffers = [];

        function _initVertexArrayBuffer(gl, data) {
            var buffer = gl.createBuffer(); // Create a buffer object
            buffers.push(buffer);
            if (!buffer) {
                console.log('Failed to create the buffer object');
                return false;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        }

        var texCoordBuffers = [];

        function _initTextCoordArrayBuffer(gl, data) {
            var texCoordBuffer = gl.createBuffer(); // Create a buffer object
            texCoordBuffers.push(texCoordBuffer);
            if (!texCoordBuffer) {
                console.log('Failed to create the buffer object');
                return false;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        }

        var indexBuffers = [];

        function _initElementArrayBuffer(gl, data) {
            // Create a buffer object
            var indexBuffer = gl.createBuffer();
            indexBuffers.push(indexBuffer);
            if (!indexBuffer) {
                return -1;
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        }

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



        function drawEach(gl, n, vertextBuffer, texCoordBuffer, indexBuffer, texture, a_Position, a_TexCoord, u_Sampler) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vertextBuffer);
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);

            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_TexCoord);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(u_Sampler, 0);
            _draw(gl, n);

        }

        function _draw(gl, n) {
            //gl.clearColor(0.0, 0.0, 0.0, 1.0);
            //gl.enable(gl.DEPTH_TEST);
            //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
            //gl.bindTexture(gl.TEXTURE_2D, null);
        }

        function _initMvpMatrix(gl) {
            var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');

            // Set the eye point and the viewing volume
            var mvpMatrix = new Matrix4();
            // angle, aspect, near, far
            mvpMatrix.setPerspective(100, 1, 0.00001, 100);
            mvpMatrix.lookAt(0, 0, 0, 0, 1, 0, 0, 0, -1);

            // Pass the model view projection matrix to u_MvpMatrix
            gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        }

        var textures = [];

        function _initTextures(gl, n, tileUrl, u_Sampler) {
            // Create a texture object
            var texture = gl.createTexture();
            textures.push(texture);
            if (!texture) {
                console.log('Failed to create the texture object');
                return;
            }

            var image = new Image();
            image.onload = function() {
                _loadTexture(gl, texture, u_Sampler, image, tileUrl);
            };
            image.src = tileUrl;

        }

        function _loadTexture(gl, texture, u_Sampler, image, tileUrl) {

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            // Set texture parameters
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            //Set the image to texture
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        }



        function _setUpBuffers(gl, face, index, tileUrl) {
            var n = _initVertexBuffers(gl, face, index);
            _initMvpMatrix(gl);
            _initTextures(gl, n, tileUrl);
        }

        // Public Methods
        function load() {
            return boardFacade.getData().then(function() {
                canvas = document.getElementById('webgl');

                var gl = getWebGLContext(canvas);

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

                var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
                var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
                var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');



                // Unbind the buffer object
                //gl.bindBuffer(gl.ARRAY_BUFFER, null);



                _initMvpMatrix(gl);



                var lon = -117.16082,
                    lat = 32.70710;
                boardFacade.getPanoramas(lon, lat)
                    .then(function(panorama) {
                        for (var face in panorama.tileUrls) {
                            panorama.tileUrls[face].z_1.forEach(function(tileUrl, index) {
                               
                                    gl.useProgram(gl.program);
                                    _initVertexBuffers(gl, face, index);
                                    _initTextures(gl, 6, tileUrl, u_Sampler);
                                

                            });
                        }

                        setTimeout(function() {
                            for (var m = 0; m < buffers.length; m++) {
                                drawEach(gl, 6, buffers[m], texCoordBuffers[m], indexBuffers[m], textures[m], a_Position, a_TexCoord, u_Sampler);
                            }
                        }, 100);

                    });


                viewUtil.showScreen('home-screen');
            });
        }



        return {
            load: load
        };

    });