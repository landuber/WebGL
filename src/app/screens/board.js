define(['lodash', 'q', 'glm', 'common/viewUtil', 'facades/boardFacade'],
    function(_, Q, matrixUtil, viewUtil, boardFacade) {

        var g_points = [],
            g_colors = [];

        // Vertext Shader Program
        var VSHADER_SOURCE =
            'attribute vec4 a_Position;\n' +
            'attribute vec4 a_Color;\n' +
            'uniform mat4 u_ViewMatrix;\n' +
            'uniform mat4 u_ModelMatrix;\n' +
            'uniform mat4 u_ProjMatrix;\n' +
            'varying vec4 v_Color;\n' +
            'void main() {\n' +
            '   gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
            '   v_Color = a_Color;\n' +
            '}\n';

        // Fragment shader program
        var FSHADER_SOURCE =
            'precision mediump float;\n' +
            'varying vec4 v_Color;\n' +
            'void main() {\n' +
            '   gl_FragColor = v_Color;\n' + // Set the color
        '}\n';

        // Init buffers
        function _initBufferVertices(gl) {
            var verticesColors = new Float32Array([
                // vertex coordinates and color
                0.0, 0.5, -0.4, 0.4, 1.0, 0.4, -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
                0.5, -0.5, -0.4, 1.0, 0.4, 0.4,
                0.5, 0.4, -0.2, 1.0, 0.4, 0.4, -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
                0.0, -0.6, -0.2, 1.0, 1.0, 0.4,
                0.0, 0.5, 0.0, 0.4, 0.4, 1.0, -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
                0.5, -0.5, 0.0, 1.0, 0.4, 0.4
            ]);

            var FSIZE = verticesColors.BYTES_PER_ELEMENT;
            var n = 9;

            var vertextColorBuffer = gl.createBuffer();
            if (!vertextColorBuffer) {
                console.log('Failed to create a buffer object');
                return -1;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, vertextColorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 6 * FSIZE, 0);
            gl.enableVertexAttribArray(a_Position);

            var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
            gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 6 * FSIZE, 3 * FSIZE);
            gl.enableVertexAttribArray(a_Color);

            return n;
        }

        function _initViewMatrix(gl) {
            var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');

            var viewMatrix = new Matrix4();
            viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 0, 1);

            gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

        }

        function _initModelMatrix(gl) {  
            var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');

            var modelMatrix = new Matrix4();
            modelMatrix.setRotate(-80, 0, 0, 1);
            gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        }

        function _initProjMatrix(gl) {
            var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');

            var projMatrix = new Matrix4();
            projMatrix.setOrtho();
        }

        // Public Methods
        function load() {
            return boardFacade.getData().then(function() {
                var canvas = document.getElementById('webgl');

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

                var n = _initBufferVertices(gl);
                _initModelMatrix(gl);
                _initViewMatrix(gl);

                gl.drawArrays(gl.TRIANGLES, 0, n);

                viewUtil.showScreen('home-screen');
            });
        }



        return {
            load: load
        };

    });