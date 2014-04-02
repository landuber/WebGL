define(['jquery', 'q', 'common/settings', 'common/workerFacade'],
  function($, q, settings, workerFacade) {



    function getViewUrls(longitude, latitude, altitude) {

      var jsonObject = {
        "operation": "get-views",
        "parameters": {
          "request": {
            "view-subject": {
              "lat": latitude,
              "lon": longitude,
              "alt": altitude
            },
            "image-size": {
              "width": 512,
              "height": 512
            },
            "field-of-view": 89.8,
            "search-radius": 1000,
            "max-results": "25"
          }
        }
      };


      return q($.ajax({
        type: 'POST',
        url: settings.apiRoot,
        dataType: 'json',
        data: jsonObject
      })).then(function(data) {
        if (!data.exception) {
          if (data.result) {
            console.log(data.result.views);
            return data.result.views;
          } else {
            throw new Error('location unreachable!');
          }
        } else {
          throw new Error(data.exception);
        }
      });

    }


    function getPanoramas(longitude, latitude) {
      var jsonObject = {
        "operation": "get-panoramas",
        "parameters": {
          "request": {
            "subject-location": {
              "lon": longitude,
              "lat": latitude
            },
            "max-results": 1,
            "search-radius": 50
          }
        }
      };

      /* //consider something like this as part of the ajax utility
        return Q.try(function()
      {
          if (!uri || typeof (uri) !== "string")
              throw new TypeError("Invalid uri: " + uri);
          return Q(jQuery.ajax({
              url: "foobar.html",
              type: "GET"
          }))
          .then(function (xhr) {
              if (xhr.status !== 200)
                  throw new Error("Unexpected response code");
              var data = xhr.responseJSON;
              return data.uri;
          })
      });
      */

      return q($.ajax({
        type: 'POST',
        url: settings.apiRoot,
        dataType: 'json',
        data: jsonObject
      })).then(function(data) {
        if (!data.exception) {
          if (data.result) {

            var panorama = data.result.panoramas[0],
              panoramaId = panorama['pano-id'];

            return {
              panoId: panoramaId,
              location: panorama['location'],
              panoramaOrientation: panorama['pano-orientation'],
              tileUrls: _generateTileUrls(panoramaId)
            };
          } else {
            throw new Error('location unreachable!');
          }
        } else {
          throw new Error(data.exception);
        }

      });
    }

    function _generateTileUrls(panoramaId) {
      var urlPrefix = "/" +
        panoramaId.substr(0, 3) + "/" +
        panoramaId.substr(3, 3) + "/" +
        panoramaId.substr(6, 3) + "/" +
        panoramaId;

      var tileUrls = {};
      var cubeFaces = ["front", "left", "right", "up", "down", "back"];
      cubeFaces.forEach(function(face) {
        tileUrls[face] = {
          previewUrl:  settings.assetRoot + "/" + encodeURIComponent(urlPrefix + "/" + face[0] + "/" + settings.levelPreview + "/00.jpg")
        };

        settings.resolutionLevels.forEach(function(level, index) {
          tileUrls[face][level] = [];
          var rows = Math.pow(2, index);
          var columns = Math.pow(2, index);
          for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
              var fileName = [i, j].join('');
              tileUrls[face][level].push(settings.assetRoot + "/" + encodeURIComponent(urlPrefix + "/" + face[0] + "/" + level + "/" + fileName + ".jpg"));
            }
          }
        });
      });

      return tileUrls;
    }

    // this is for the cases we need to offload work to the web worker
    function getData() {
      return workerFacade.handleMessage('getData', {
        id: '123',
        data: {}
      });
    }



    return {
      getData: getData,
      getPanoramas: getPanoramas,
      getViewUrls: getViewUrls
    };

  });