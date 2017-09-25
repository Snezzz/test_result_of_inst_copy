(function() {
  'use strict';
  var Pongstgrm;
  Pongstgrm = function(element, options) {
    this.element = element ? element : '<div/>';
    this.options = $.extend({}, Pongstgrm.DEFAULT, options);
    this.instgrm = 'https://api.instagram.com/v1';
    this.authenticate();
    return this;
  };
  Pongstgrm.VERSION = '0.1.0';
  Pongstgrm.DEFAULT = {
    accessId: null,
    accessToken: null,
    show: 'recent',
    count: 5,
    likes: true,
    comments: true,
    timestamp: true,
    flexbox: true,
    avatar_size: 64,
    cover_photho: void 0
  };
  Pongstgrm.prototype.html = function() {
    var that;
    that = this;

    /*
     * @name thumb
     * @desc render thumbnail markup
     * @params context, is the media's metadata
     * @returns rendered HTML string that is injected to the plugin container
     */
    this.thumb = function(context) {
      var comments_count, comments_html, created, likes_count, likes_html, video;
      likes_count = context.likes.count >= 2 ? 'Likes' : 'Like';
      likes_html = that.options.likes && ("<span class='pongstgrm-likes'> <i class='pongstgrm-icon-like'></i>&nbsp; <small>" + context.likes.count + "</small> </span>");
      comments_count = context.comments >= 2 ? 'Comment' : 'Comments';
      comments_html = that.options.comments && ("<span class='pongstgrm-comments'> <i class='pongstgrm-icon-chat'></i>&nbsp; <small>" + context.comments.count + "</small> </span>");
      video = context.type === 'video' ? "<span class='pongstgrm-item-video'> <i class='pongstgrm-icon-play'></i> </span>" : "";
      created = that.options.timestamp && ("" + (new Date(context.created_time * 1000).toDateString()));
      return "<div class='pongstgrm-item'> <div class='pongstgrm-item-content'> <small class='pongstgrm-item-date'>" + created + "</small> <img class='pongstgrm-img-responsive' alt='' src='" + context.images.low_resolution.url + "' width='" + context.images.low_resolution.width + "' height='" + context.images.low_resolution.height + "'>" + video + " <div class='pongstgrm-item-toolbar'> " + likes_html + " &nbsp; &nbsp; " + comments_html + " </div> </div> </div>";
    };
    this.modal = function(context) {};
    this.video = function(context) {};
    return {
      thumb: this.thumb,
      modal: this.modal,
      video: this.video
    };
  };
  Pongstgrm.prototype.initialize = function() {
    var flexbox, getMedia, that;
    that = this;
    that.gallery = {};
    that.instgrm += '/users/';
    flexbox = typeof this.options.flexbox === 'boolean' ? 'flexbox' : this.options.flexbox;
    getMedia = function(endpoint, callback) {
      return $.get(endpoint, (function(data) {
        if (that.mode === 'profile') {
          return callback && callback(data);
        }
        if (that.mode === 'gallery') {
          data.data.forEach(function(e, i, a) {
            return $(that.element).append(that.html().thumb(e));
          });
          return callback && callback(data);
        }
      }), 'jsonp');
    };

    /*
     * @name
     * @desc
     * @params
     * @returns
     */
    this.gallery.feed = function() {
      that.mode = 'gallery';
      that.instgrm += 'self/feed?' + $.param({
        count: that.options.count,
        access_token: that.options.access_token
      });
      return getMedia("" + that.instgrm, function(data) {});
    };

    /*
     * @name Liked Media
     * @desc
     *   Get the list of recent media liked by the owner of the access_token.
     *   https://www.instagram.com/developer/endpoints/users/#get_users_feed_liked
     * @params
     *   - ACCESS_TOKEN:	A valid access token.
     *   - COUNT:	Count of media to return.
     *   - MAX_LIKE_ID:	Return media liked before this id.
     * @returns {String}
     *   an HTML string with the media context. The HTML is
     *   appended to the element container. $('#selector').pongstgrm()
     */
    this.gallery.liked = function() {
      that.mode = 'gallery';
      that.instgrm += 'self/media/liked?' + $.param({
        count: that.options.count,
        access_token: that.options.accessToken
      });
      return getMedia("" + that.instgrm, function(data) {
        $(that.element).append("<pre>" + (JSON.stringify(data.data, null, 2)) + "</pre>");
      });
    };

    /*
     * @name
     * @desc
     * @params
     * @returns
     */
    this.gallery.profile = function() {
      that.mode = 'profile';
      that.instgrm += (that.options.accessId + "?") + $.param({
        access_token: that.options.accessToken
      });
      return getMedia("" + that.instgrm, function(data) {
        return $(that.element).append("<pre>" + (JSON.stringify(data.data, null, 2)) + "</pre>");
      });
    };

    /*
     * @name Recent Media
     * @desc
     *   Get the most recent media published by the owner of the access_token
     *   https://www.instagram.com/developer/endpoints/users/#get_users_media_recent_self
     * @params
     *   - ACCESS_TOKEN: A valid access token
     *   - COUNT: Count of media to return
     *   - MIN_ID: (not used in this fn)
     *   - MAX_ID: (not used in this fn)
     * @returns {String}
     *   an HTML string with the media context. The HTML is
     *   appended to the element container. $('#selector').pongstgrm()
     */
    this.gallery.recent = function() {
      that.mode = 'gallery';
      that.instgrm += 'self/media/recent?' + $.param({
        count: that.options.count,
        access_token: that.options.accessToken
      });
      return getMedia("" + that.instgrm, function(data) {
        return $(that.element).append("<pre>" + (JSON.stringify(data.data, null, 2)) + "</pre>");
      });
    };
    $(this.element).addClass("pongstgrm " + flexbox);
    return this.gallery[that.options.show] && this.gallery[that.options.show]();
  };
  Pongstgrm.prototype.authenticate = function() {
    if (this.options.accessId !== void 0 || this.options.accessToken !== void 0) {
      this.initialize();
      return true;
    } else {
      console.info("%cInstagram Access ID and Token to access your media. You may access public media by using `{ show: \'tag-you-like\' }", 'color:green');
      return false;
    }
  };
  $.fn.pongstgrm = function(option) {
    var i, opt;
    opt = $.extend({}, $.fn.pongstgrm["default"], option);
    i = 0;
    while (i < arguments.length) {
      if (typeof arguments[i] === 'function') {
        opt.callback = arguments[i]();
      }
      if (typeof arguments[i] === 'object') {
        opt[arguments[i]];
      }
      i++;
    }
    return this.each(function() {
      new Pongstgrm($(this)[0], opt);
    });
  };
  $.fn.pongstgrm.options = Pongstgrm.DEFAULT;
})();
