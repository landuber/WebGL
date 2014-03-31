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
        function _initVertexBuffers(gl) {
            // Create a cube
            //    v6----- v5
            //   /|      /|
            //  v1------v0|
            //  | |     | |
            //  | |v7---|-|v4
            //  |/      |/
            //  v2------v3

            /*
            var vertices = new Float32Array([ // Vertex coordinates
                1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front 
                1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
                1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
                -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
                -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
                1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0 // v4-v7-v6-v5 back
            ]);
            */
            var vertices = new Float32Array([
                1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0
            ]);
            /*
            var colors = new Float32Array([ // Colors
                0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, // v0-v1-v2-v3 front(blue)
                0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, // v0-v3-v4-v5 right(green)
                1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, // v0-v5-v6-v1 up(red)
                1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, // v1-v6-v7-v2 left
                1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // v7-v4-v3-v2 down
                0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0 // v4-v7-v6-v5 back
            ]);
            */

            /*
            var texCoords = new Float32Array([ // Texture coordinates
                1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v1-v2-v3 front
                0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, // v0-v3-v4-v5 right
                1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // v0-v5-v6-v1 up
                1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v1-v6-v7-v2 left
                0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, // v7-v4-v3-v2 down
                0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0 // v4-v7-v6-v5 back
            ]);
            */
            var texCoords = new Float32Array([ // Texture coordinates
                1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0
            ]);

            /*
            var indices = new Uint8Array([ // Indices of the vertices
                0, 1, 2, 0, 2, 3, // front
                4, 5, 6, 4, 6, 7, // right
                8, 9, 10, 8, 10, 11, // up
                12, 13, 14, 12, 14, 15, // left
                16, 17, 18, 16, 18, 19, // down
                20, 21, 22, 20, 22, 23 // back
            ]);
            */

            var indices = new Uint8Array([ // Indices of the vertices
                0, 1, 2, 0, 2, 3
            ]);
            // Create a buffer object
            var indexBuffer = gl.createBuffer();
            if (!indexBuffer) {
                return -1;
            }

            // Write the vertex coordinates and color to the buffer object
            if (!_initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) {
                return -1;
            }

            if (!_initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_TexCoord')) {
                return -1; // Texture coordinates
            }

            // Unbind the buffer object
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            // Write the indices to the buffer object
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

            return indices.length;
        }

        function _initArrayBuffer(gl, data, num, type, attribute) {
            var buffer = gl.createBuffer(); // Create a buffer object
            if (!buffer) {
                console.log('Failed to create the buffer object');
                return false;
            }
            // Write date into the buffer object
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            // Assign the buffer object to the attribute variable
            var a_attribute = gl.getAttribLocation(gl.program, attribute);
            if (a_attribute < 0) {
                console.log('Failed to get the storage location of ' + attribute);
                return false;
            }
            gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
            // Enable the assignment of the buffer object to the attribute variable
            gl.enableVertexAttribArray(a_attribute);

            return true;
        }

        function _initMvpMatrix(gl) {
            var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');

            // Set the eye point and the viewing volume
            var mvpMatrix = new Matrix4();
            // angle, aspect, near, far
            mvpMatrix.setPerspective(53, 1, 0.00001, 100);
            mvpMatrix.lookAt(0, 0, 0, 0, 0, 1, 0, 1, 0);

            // Pass the model view projection matrix to u_MvpMatrix
            gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        }

        function _initTextures(gl, n, view) {
            // Get the storage location of u_Sampler
            var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
            if (!u_Sampler) {
                console.log('Failed to get the location of u_Sampler');
                return false;
            }

            // Create a texture object
            var texture = gl.createTexture();
            if (!texture) {
                console.log('Failed to create the texture object');
                return;
            }

            var image = new Image();
            image.onload = function() {
                _loadTexture(gl, texture, u_Sampler, image, view);
                _draw(gl, n);
            };
            image.src = view.url.href;

        }

        function _loadTexture(gl, texture, u_Sampler, image, view) {
            //Flip the iamge Y coordinates
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            //Activate texture unit0
            gl.activeTexture(gl.TEXTURE0);
            //Bind the texture object to the target
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Set texture parameters
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            //Set the image to texture
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

            gl.uniform1i(u_Sampler, 0);

        }

        function _draw(gl, n) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
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



                //testing ajax

                var lon = -117.16082,
                    lat = 32.70710;
                boardFacade.getPanoramas(lon, lat)
                    .then(function(panorama) {
                        panorama.views.forEach(function(view, index) {
                            if (index === 0) {
                                var n = _initVertexBuffers(gl);
                                _initMvpMatrix(gl);
                                _initTextures(gl, n, view);
                                _draw(gl, n);
                                console.log(view);
                            }

                        });
                    });
                viewUtil.showScreen('home-screen');
            });
        }



        return {
            load: load
        };

    });