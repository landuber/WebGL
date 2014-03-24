define(['lodash', 'q', 'common/viewUtil', 'facades/boardFacade'],
    function(_, Q, viewUtil, boardFacade) {

        var g_points = [],
            g_colors = [];
        // Vertext Shader Program
        var VSHADER_SOURCE =
            'attribute vec4 a_Position;\n' +
            'attribute float a_PointSize;\n' +
            'void main() {\n' +
            '   gl_Position = a_Position;\n' + //Coordinates
        '   gl_PointSize = a_PointSize;\n' +
            '}\n';

        // Fragment shader program
        var FSHADER_SOURCE =
            'precision mediump float;\n' +
            'uniform vec4 u_FragColor;\n' +
            'void main() {\n' +
            '   gl_FragColor = u_FragColor;\n' + // Set the color
        '}\n';

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

                // Get the storage location of attribute variable
                var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

                 if (a_Position < 0) {
                    console.log('Failed to get the storage location of a_Position');
                    return;
                }
                var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');

                if (a_PointSize < 0) {
                    console.log('Failed to get the storage location of a_PointSize');
                    return;
                }

                var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
                if(!u_FragColor) {
                    console.log('Failed to get u_FragColor variable');
                    return;
                }
               


                gl.vertexAttrib1f(a_PointSize, 10.0);


                canvas.onmousedown = function(ev) {
                    click(ev, gl, canvas, a_Position, u_FragColor);
                };
                gl.clearColor(0.0, 1.0, 1.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);

                viewUtil.showScreen('home-screen');
            });
        }

        function click(ev, gl, canvas, a_Position, u_FragColor) {

            var x = ev.clientX;
            var y = ev.clientY;

            var rect = ev.target.getBoundingClientRect();

            x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
            y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

            g_points.push([x, y]);

            if(x >= 0.0 && y >= 0.0) {
                g_colors.push([1.0, 0.0, 0.0, 1.0]);
            } else if(x < 0.0 && y < 0.0) {
                g_colors.push([0.0, 1.0, 0.0, 1.0]);
            } else {
                g_colors.push([1.0, 1.0, 1.0, 1.0]);
            }


            gl.clear(gl.COLOR_BUFFER_BIT);

            var len = g_points.length;
            for (var i = 0; i < len; i++) {
                var xy = g_points[i];
                var rgba = g_colors[i];

                gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);


                gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
                // Draw a point 
                gl.drawArrays(gl.POINTS, 0, 1);
            }
        }

        return {
            load: load
        };

    });