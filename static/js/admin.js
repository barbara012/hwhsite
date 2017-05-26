'use strict'
var animat = {
  open: function (promise) {
    var n = this
    Velocity(n.barDom, {
      left: 450,
      scaleY: 2
    }, {
      duration: 0
    })
    Velocity(n.barDom, {
      left: 0,
      scaleY: 1
    }, {
      easing: [ 8, 8 ],
      complete: function() {
        promise(function(resolve) {
          resolve();
        })
      }
    })
  },
  close: function (promise) {
    var n = this
    Velocity(n.barDom, {
      left: '+=-50'
    }, {
      easing: [ 8, 8, 2],
      duration: 350
    })
    Velocity(n.barDom, {
      left: 450,
      scaleY: .2,
      height: 0,
      margin: 0
    }, {
      easing: [ 8, 8 ],
      complete: function () {
        promise(function(resolve) {
            resolve();
        })
      }
    })
  }
}
var animatRight = {
  open: function (promise) {
    var n = this
    Velocity(n.barDom, {
      right: 450,
      scaleY: 2
    }, {
      duration: 0
    })
    Velocity(n.barDom, {
      right: 0,
      scaleY: 1
    }, {
      easing: [ 8, 8 ],
      complete: function() {
        promise(function(resolve) {
          resolve();
        })
      }
    })
  },
  close: function (promise) {
    var n = this
    Velocity(n.barDom, {
      right: '+=-50'
    }, {
      easing: [ 8, 8, 2],
      duration: 350
    })
    Velocity(n.barDom, {
      right: 450,
      scaleY: .2,
      height: 0,
      margin: 0
    }, {
      easing: [ 8, 8 ],
      complete: function () {
        promise(function(resolve) {
            resolve();
        })
      }
    })
  }
}
var DeleteOperate = {
  init: function($target, wrapper) {
    var that = this
    $target.on('click', function () {
      var $this = $(this)
      var n = new Noty({
        type: 'warning',
        layout: 'center',
        theme: 'mint',
        text: '删除操作不可逆，三思',
        closeWith: ['click', 'button'],
        animation: animat,
        id: false,
        force: false,
        queue: 'global',
        container: false,
        buttons: [
          Noty.button('确定', 'btn btn-success', function () {
            n.close()
            $.ajax({
              type: 'POST',
              url: $this.data('url'),
              success: function (res) {
                if (res.ok) {
                  new Noty({
                    type: 'success',
                    layout: 'topRight',
                    text: '删除成功',
                    timeout: 2000,
                    progressBar: true,
                    animation: animat
                  }).show()
                  if (wrapper) {
                    that.hide($this.parents(wrapper))
                  }
                } else {
                  new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: res.mes,
                    timeout: 2000,
                    progressBar: true,
                    animation: animat,
                  }).show()
                }
              }
            })
          }, {id: 'button1', 'data-status': 'ok'}),
          Noty.button('取消', 'btn btn-error', function () {
            n.close()
          })
        ]
      }).show()
    })
  },
  hide: function ($target) {
    Velocity($target, {
      right: '+=-50'
    }, {
      easing: [ 8, 8, 2],
      duration: 600
    })
    Velocity($target, {
      right: 900,
      scaleY: .2,
      height: 0,
      margin: 0
    }, {
      easing: [ 8, 8 ],
      complete: function () {
        $target.remove()
      }
    })
  }
}
DeleteOperate.init($('.article_delete'), '.article-item')
$(document).ready(function() {
  (function () {
    var $preview = $('.preview')
    $('#image').cropper({
      aspectRatio: 1 / 1,
      ready: function (e) {
        var $clone = $(this).clone().removeClass('cropper-hidden')

        $clone.css({
          display: 'block',
          width: '100%',
          minWidth: 0,
          minHeight: 0,
          maxWidth: 'none',
          maxHeight: 'none'
        });

        $preview.css({
          width: '100%',
          overflow: 'hidden'
        }).html($clone)
      },
      crop: function(e) {
        // Output the result data for cropping image.
        var imageData = $(this).cropper('getImageData')
        var previewAspectRatio = e.width / e.height
        var previewWidth = $preview.width();
        var previewHeight = previewWidth / previewAspectRatio;
        var imageScaledRatio = e.width / previewWidth;

        $preview.height(previewHeight).find('img').css({
          width: imageData.naturalWidth / imageScaledRatio,
          height: imageData.naturalHeight / imageScaledRatio,
          marginLeft: -e.x / imageScaledRatio,
          marginTop: -e.y / imageScaledRatio
        })
      }
    })


    // Methods
    $(document.body).on('click', '#avatar-submit', function () {
      $('#image').cropper('getCroppedCanvas', {
        width: 200,
        height: 200
      })
      .toBlob(function (blob) {
        var fd = new FormData()
        fd.append('file', blob)
        $.ajax({
          url: '/admin/upload/image',
          type: 'POST',
          data: fd,
          processData: false,
          contentType: false
        }).done(function(res) {
          if (res.status === 'ok') {
            new Noty({
              type: 'success',
              layout: 'topRight',
              text: res.mes,
              timeout: 1000,
              progressBar: true,
              animation: animat,
              callbacks: {
                afterClose: function() {
                  // location.href = res.url
                }
              }
            }).show()
          } else {
            new Noty({
              type: 'error',
              layout: 'topRight',
              text: res.mes,
              timeout: 1000,
              progressBar: true,
              animation: animat
            }).show()
          }
        }).fail(function(res) {})
      })
    })

    // Import image
    var $inputImage = $('#inputImage'),
        URL = window.URL || window.webkitURL,
        blobURL;
    if (URL) {
      $inputImage.change(function () {
        var files = this.files,
            file

        if (files && files.length) {
          file = files[0]

          if (/^image\/\w+$/.test(file.type)) {
            blobURL = URL.createObjectURL(file)
            $('#image').one('built.cropper', function () {
              URL.revokeObjectURL(blobURL); // Revoke when load complete
            }).cropper('reset', true).cropper('replace', blobURL)
            // $inputImage.val('')
          } else {
            showMessage('Please choose an image file.')
          }
        }
      });
    } else {
      $inputImage.parent().remove()
    }

  }());
})