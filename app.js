function MainCtrl($scope) {
  $scope.svgPath = function(p) {
    return "M "+p.map(function(g) {return g.x+" "+g.y;}).join(" L ");
  };

  $scope.doAntisym = function() {
    $scope.antisymPath = antisym($scope.minPath, $scope.maxPath);
    $scope.antisymBarycentre = barycentrePath($scope.antisymPath);
    $scope.antisymPath = translatePath($scope.antisymPath, $scope.antisymBarycentre);
    $scope.dualAntisymPath = dualPath($scope.antisymPath);
    $scope.dualAntisymBarycentre = barycentrePath($scope.dualAntisymPath);

    $scope.dualVolProd = $scope.antisymBarycentre.s * $scope.dualAntisymBarycentre.s
    $scope.volDiff = 100*($scope.volProd - $scope.dualVolProd)/$scope.volProd;

    $scope.volPt = {x: $scope.volDiff*Math.cos(Math.PI*$scope.angle/180), y: $scope.volDiff*Math.sin(Math.PI*$scope.angle/180)};
    $scope.maxVolPt = {x: $scope.maxVolDiff*Math.cos(Math.PI*$scope.angle/180), y: $scope.maxVolDiff*Math.sin(Math.PI*$scope.angle/180)};
  };

  $scope.rotate = function() {
    $scope.borderPath = rotatePath($scope.initialPath, $scope.angle);
    $scope.minPath = ConvexHullMin($scope.borderPath);
    $scope.maxPath = ConvexHullMax($scope.borderPath);
    $scope.borderPath = JoinMinMax($scope.minPath, $scope.maxPath);

    $scope.barycentre = barycentrePath($scope.borderPath);

    $scope.minPath = translatePath($scope.minPath,$scope.barycentre);
    $scope.maxPath = translatePath($scope.maxPath,$scope.barycentre);
    $scope.borderPath = translatePath($scope.borderPath,$scope.barycentre);

    $scope.barycentre = barycentrePath($scope.borderPath);

    $scope.dualPath = dualPath($scope.borderPath);
    $scope.dualBarycentre = barycentrePath($scope.dualPath);

    $scope.volProd = $scope.barycentre.s * $scope.dualBarycentre.s;

    $scope.doAntisym();
  };

  $scope.calculateVolDiffs = function() {
    $scope.volDiffs = [];
    $scope.minVolDiff = Infinity;
    $scope.maxVolDiff = 0;
    for(var i=0;i<360;i++) {
      var tmp = rotatePath($scope.initialPath, i);
      var minTmp = ConvexHullMin(tmp);
      var maxTmp = ConvexHullMax(tmp);
      tmp = antisym(minTmp,maxTmp);
      var tmpB = barycentrePath(tmp);
      tmp = translatePath(tmp,tmpB);
      var dualTmp = dualPath(tmp);
      var dualTmpB = barycentrePath(dualTmp);
      var vd = 100*($scope.barycentre.s * $scope.dualBarycentre.s - tmpB.s * dualTmpB.s)/($scope.barycentre.s * $scope.dualBarycentre.s);
      if ($scope.minVolDiff > vd)
        $scope.minVolDiff = vd;
      if ($scope.maxVolDiff < vd)
        $scope.maxVolDiff = vd;
      $scope.volDiffs.push({x: vd*Math.cos(Math.PI*i/180), y: vd*Math.sin(Math.PI*i/180)});
    }
    if (Math.abs($scope.minVolDiff) < 1e-10)
      $scope.minVolDiff = 0;
  };

  $scope.$watch('angle', $scope.rotate);

  $scope.randomAngle = function() {
    $scope.angle = Math.floor(Math.random()*360);
    $scope.rotate();
  };

  $scope.setToAntisym = function() {
    $scope.initialPath = $scope.antisymPath;
    $scope.ptsToStr($scope.initialPath);
    $scope.angle = 0;
    $scope.rotate();
    $scope.calculateVolDiffs();
  };

  $scope.setPts = function(pts) {
    console.log('setPts')
    console.log(pts);
    $scope.minPath = ConvexHullMin(pts);
    $scope.maxPath = ConvexHullMax(pts);
    $scope.initialPath = JoinMinMax($scope.minPath, $scope.maxPath);
    console.log($scope.initialPath);

    $scope.angle = 0;
    $scope.rotate();
    $scope.calculateVolDiffs();
  };

  $scope.strToPts = function(s) {
    var coords = s.replace(/^[^0-9.-]+|[^0-9.-]+$/g, '').split(/[^0-9.-]+/).map(parseFloat);
    var pts = [];
    for(var i=0; i+1 < coords.length; i+=2)
      pts.push({x : coords[i], y : coords[i+1]});

    $scope.setPts(pts);
    console.log("strToPts");
    console.log(pts);
  };

  $scope.ptsToStr = function(pts) {
    $scope.strPts = pts.map(function(p){return "("+p.x.toFixed(2)+","+p.y.toFixed(2)+")"}).join(", ");
    console.log("ptsToStr");
    console.log(pts);
  };

  $scope.numPts = 7;

  $scope.generateRandomPts = function() {
    var pts = [];
    for (var i = 0; i < $scope.numPts ; i++)
      pts.push({x : Math.random()*4-2, y : Math.random()*4-2});

    $scope.setPts(pts);
    $scope.ptsToStr($scope.initialPath);
  };

  $scope.setToRegularPolygon = function() {
    var pts = [];
    var r = Math.sqrt(2);
    for (var i = 0; i < $scope.numPts ; i++)
      pts.push({x : Math.round(1000*r*Math.cos(2*i*Math.PI/$scope.numPts))/1000, y : Math.round(1000*r*Math.sin(2*i*Math.PI/$scope.numPts))/1000});

    $scope.setPts(pts);
    $scope.ptsToStr($scope.initialPath);
  };

  $scope.generateRandomPts();
}
