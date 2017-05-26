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
    var $image = $('.img-container > img'),
        resultOption = {},
        options = {
          // strict: false,
          // responsive: false,
          // checkImageOrigin: false

          // modal: false,
          // guides: false,
          // highlight: false,
          // background: false,

          // autoCrop: false,
          // autoCropArea: 0.5,
          // dragCrop: false,
          // movable: false,
          // resizable: false,
          // rotatable: false,
          // zoomable: false,
          // touchDragZoom: false,
          // mouseWheelZoom: false,

          // minCanvasWidth: 320,
          // minCanvasHeight: 180,
          // minCropBoxWidth: 160,
          // minCropBoxHeight: 90,
          // minContainerWidth: 320,
          // minContainerHeight: 180,

          // build: null,
          // built: null,
          // dragstart: null,
          // dragmove: null,
          // dragend: null,
          // zoomin: null,
          // zoomout: null,

          aspectRatio: 1 / 1,
          crop: function (data) {
            resultOption.dataX = Math.round(data.x)
            resultOption.dataY = Math.round(data.y)
            resultOption.dataHeight = Math.round(data.height)
            resultOption.dataWidth = Math.round(data.width)
            resultOption.dataRotate = Math.round(data.width)
          }
        };

    $image.on({
      'build.cropper': function (e) {
        console.log(e.type)
      },
      'built.cropper': function (e) {
        console.log(e.type)
      },
      'dragstart.cropper': function (e) {
        console.log(e.type, e.dragType)
      },
      'dragmove.cropper': function (e) {
        console.log(e.type, e.dragType)
      },
      'dragend.cropper': function (e) {
        var canvas = $image.cropper("getCroppedCanvas")
        // console.log(canvas.toDataURL())
        $('.img-preview').html(canvas)
      },
      'zoomin.cropper': function (e) {
        console.log(e.type)
      },
      'zoomout.cropper': function (e) {
        console.log(e.type)
      }
    }).cropper(options)


    // Methods
    $(document.body).on('click', '#avatar-submit', function () {
      var canvas = $image.cropper("getCroppedCanvas")
      var data = canvas.toDataURL()
      data = data.split(',')[1]
      data = window.atob(data)
      var ia = new Uint8Array(data.length)
      for (var i = 0; i < data.length; i++) {
          ia[i] = data.charCodeAt(i)
      }

      // canvas.toDataURL 返回的默认格式就是 image/png
      var blob = new Blob([ia], { type: 'image/png' })
      blob.name = 'hlw.png'
      var fd = new FormData()
      fd.append('file', blob)
      $.ajax({
        url: '/admin/upload/image',
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false
      }).done(function(res) {
        console.log(res)
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
          }
      }).fail(function(res) {})
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
            $image.one('built.cropper', function () {
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