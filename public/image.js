/**
 * Create an image loader
 */
Chaos.setupImageLoader = function() {
  var REGEXP_FILTER_IMAGE_URL = /(chaos\.yuiseki\.net)|(www\.google-analytics\.com\/__utm\.gif)/;

  var blockLoad = false;
  var idol = false;

  var imageLayerLarge  = $('#contentArea div.z1');
  var imageLayerMiddle = $('#contentArea div.z2');
  var imageLayerSmall  = $('#contentArea div.z3');
  var imagePool = $('#imagePool');

  var animation = new Chaos.animation.DropDown();

  var imageLoader = new Chaos.Loader(imageFilter); 
  (function() {
    if (!blockLoad) {
      imageLoader.load(createUri(), renderImages);
    }
    setTimeout(arguments.callee, SETTINGS[idol ? 'IMAGE_RETREIVE_INTERVAL_IDOL' : 'IMAGE_RETREIVE_INTERVAL']);
  })();

  function createUri() {
    return '/update/' + context.lastRetreiveTime + '?limit=' + SETTINGS.MAX_RETREIVE_COUNT;
  }

  function imageFilter(arr) {
    return arr.filter(function(data) {
      return !REGEXP_FILTER_IMAGE_URL.test(data.uri)
    });
  }

  function setLatestImageRetreiveTime(d) {
    context.lastRetreiveTime = d[0].accessed_at;
  }

  function storeImage(jqObj) {
    context.loadedImages.push(jqObj);
    if (context.loadedImages.length > SETTINGS.MAX_KEEP_IMAGES_COUNT) {
      removeImage(context.loadedImages.shift());
    }
  }

  function removeImage(jqObj) {
    if (context.enableCSSAnimation) {
      jqObj.addClass('delete');
      setTimeout(function() {
        jqObj.remove();
      }, 1000);
    } else {
      jqObj.fadeOut('normal', function() {
        jqObj.remove();
      });
    }
  }

  function renderImages(data) {
    if (data.length == 0) {
      idol = true;
      return;
    }
    idol = false;
    blockLoad = true;
    setLatestImageRetreiveTime(data);
    data.reverse();
    var len = data.length;
    var i = 0;
    var timer = setInterval(function() {
      var jqObj = $('<img>').attr('src', data[i].uri);
      storeImage(jqObj);
      // Put to the tmp area (invisible) and waiting load the image
      imagePool.prepend(jqObj);
      jqObj.bind('load', function(a) {
        var width = a.target.offsetWidth;
        var height = a.target.offsetHeight;
        var posXY = Chaos.effect.getRandomeXY(width, height);
        var zIndex = Chaos.effect.getImageZIndex(width, height);
        animation.applyToObject(jqObj, posXY, zIndex);
      });
      if (++i>=len) {
        clearInterval(timer);
        blockLoad = false;
      }
    }, 200);
  }


}

Chaos.animation.DropDown = function(pool, dataArr) {
  Chaos.animation.DropDown.prototype.initialize.apply(this, [pool, dataArr]);
}

Chaos.animation.DropDown.prototype = {

  initialize : function(pool, dataArr) {
    this.dataArr = dataArr;
    this.pool = pool;
    var area1 = $('<div>').addClass('dropDownFast');
    var area2 = $('<div>').addClass('dropDownMiddle');
    var area3 = $('<div>').addClass('dropDownSlow');
    $('#contentArea').append(area1);
    $('#contentArea').append(area2);
    $('#contentArea').append(area3);
    this.imageLayerLarge  = area3;
    this.imageLayerMiddle = area2;
    this.imageLayerSmall  = area1;
  },

  destroy : function() {
    this.imageLayerLarge.remove();
    this.imageLayerMiddle.remove();
    this.imageLayerSmall.remove();
  },

  applyToObject : function(jqObj, xy, zIndex) {
    jqObj.css({
      'top' : null,
      'left' : xy.x,
      'zIndex' : zIndex
    });
    if (zIndex > 140) {
      this.imageLayerSmall.append(jqObj)
    } else
    if (zIndex > 110) {
      this.imageLayerMiddle.append(jqObj);
    } else {
      this.imageLayerLarge.append(jqObj);
    }
  }
}


Chaos.animation.Wave = function(pool, dataArr) {
  Chaos.animation.Wave.prototype.initialize.apply(this, [pool, dataArr]);
}

Chaos.animation.Wave.prototype = {

  initialize : function(pool, dataArr) {
    this.dataArr = dataArr;
    this.pool = pool;
    var area1 = $('<div>').addClass('z1');
    var area2 = $('<div>').addClass('z2');
    var area3 = $('<div>').addClass('z3');
    $('#contentArea').append(area1);
    $('#contentArea').append(area2);
    $('#contentArea').append(area3);
    this.imageLayerLarge  = area1;
    this.imageLayerMiddle = area2;
    this.imageLayerSmall  = area3;
  },

  destroy : function() {
    this.imageLayerLarge.remove();
    this.imageLayerMiddle.remove();
    this.imageLayerSmall.remove();
  },

  applyToObject : function(jqObj, xy, zIndex) {
    jqObj.css({
      'top' : xy.y,
      'left' : xy.x,
      'zIndex' : zIndex
    });
    if (zIndex > 140) {
      this.imageLayerSmall.append(jqObj);
    } else
    if (zIndex > 110) {
      this.imageLayerMiddle.append(jqObj);
    } else {
      this.imageLayerLarge.append(jqObj);
    }
    if (!context.enableCSSAnimation) {
      jqObj.hide().fadeIn('normal');
    }
  }
}

