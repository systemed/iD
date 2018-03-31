import _forEach from 'lodash-es/forEach';
var config =
    {
        B0_k: [1.0635969500000001e+03, 0.0, 9.4712922700000001e+02, 0.0,
            1.0699040550000000e+03, 6.1893585800000005e+02, 0.0, 0.0, 1.0],
        B0_dist: [-1.2276700000000000e-01, 9.8563999999999999e-02,
            3.3400000000000001e-03, -5.6880000000000003e-03,
            -3.8953000000000002e-02],

        B5_k: [1.0504945120000000e+03, 0.0, 9.5054544699999997e+02, 0.0,
            1.0544364989999999e+03, 6.2859501599999999e+02, 0.0, 0.0, 1.0],
        B5_dist: [-1.2428400000000001e-01, 7.8710000000000002e-02,
            4.7349999999999996e-03, -2.0190000000000000e-03,
            -2.2460000000000002e-03],

        B6_k: [1.0520148700000000e+03, 0.0, 9.5554770499999995e+02, 0.0,
            1.0545848500000000e+03, 6.2183666400000004e+02, 0.0, 0.0, 1.0],
        B6_dist: [-1.2537699999999999e-01, 7.8956999999999999e-02,
            3.8289999999999999e-03, -7.6000000000000004e-04,
            -2.1288999999999999e-02],

        B7_k: [1.0395207579999999e+03, 0.0, 9.6133891500000004e+02, 0.0,
            1.0445528750000001e+03, 6.1994647599999996e+02, 0.0, 0.0, 1.0],
        B7_dist: [-1.2244300000000000e-01, 7.4199000000000001e-02,
            4.5440000000000003e-03, -8.5099999999999998e-04,
            -1.7992999999999999e-02],

        B9_k: [1.0546864100000000e+03, 0.00, 9.4965200600000003e+02, 0.0,
            1.0567392270000000e+03, 6.2016478800000004e+02, 0.0, 0.0, 1.0],
        B9_dist: [-1.1964800000000000e-01, 7.4257000000000004e-02,
            3.3509999999999998e-03, 1.3519999999999999e-03,
            1.7838000000000000e-02]
    }

export function AddDistortion(points, deDistortionMatrix){
    var K = [deDistortionMatrix.fx, 0, deDistortionMatrix.cx, 0, deDistortionMatrix.fy, deDistortionMatrix.cy, 0, 0, 1],
        distortMatrix = deDistortionMatrix.DistCoef;

    return points.map(function(value) {
        var fx = K[0];
        var cx = K[2];
        var fy = K[4];
        var cy = K[5];
        var k1 = distortMatrix[0],
            k2 = distortMatrix[1],
            p1 = distortMatrix[2],
            p2 = distortMatrix[3],
            k3 = distortMatrix[4];
        var x = (value[0] - cx) / fx;
        var y = (value[1] - cy) / fy;
        var r2 = x*x + y*y;
        var xn = x * (1 + k1*r2 + k2*r2*r2 + k3*r2*r2*r2) + 2*p1*x*y + p2 * (r2 + 2*x*x);
        var yn = y * (1 + k1*r2 + k2*r2*r2 + k3*r2*r2*r2) + p1 * (r2 + 2*y*y) + 2*p2*x*y;
        var orig_x = xn * fx + cx;
        var orig_y = yn * fy + cy;
        return [orig_x, orig_y];
    });
    
}