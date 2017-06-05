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
$(document).ready(function() {
  $('.back-top').click(function() {
    $('html, body').stop().animate({
      scrollTop: 0
    }, 500)
  })
  //删除
  var $deleteBtn = $('.delete-btn')
  if ($deleteBtn) {
    DeleteOperate.init($deleteBtn, '.article-item')
  }
  //初始化评论框
  var $commentEditor = $('#commenter_text')
  if ($commentEditor.length > 0) {
    var editor = new Simditor({
      textarea: $('#commenter_text'),
      toolbar: ['emoji', 'bold','italic','underline','strikethrough','color','blockquote', 'code'],
      emoji: {
        imagePath: '/emoji/',
        images: [
          'smile.png',
          'smiley.png',
          'laughing.png',
          'astonished.png',
          'confounded.png',
          'confused.png',
          'cry.png',
          'blush.png',
          'heart_eyes.png',
          'smirk.png',
          'flushed.png',
          'grin.png',
          'wink.png',
          'kissing_closed_eyes.png',
          'stuck_out_tongue_winking_eye.png',
          'stuck_out_tongue.png',
          'sleeping.png',
          'worried.png',
          'expressionless.png',
          'sweat_smile.png',
          'cold_sweat.png',
          'joy.png',
          'sob.png',
          'angry.png',
          'mask.png',
          'scream.png',
          'sunglasses.png',
          'triumph.png',
          'imp.png',
          'hushed.png',
          'metal.png',
          'monkey.png',
          'neckbeard.png',
          'mushroom.png',
          'octocat.png',
          'runner.png',
          'sun_with_face.png',
          'tennis.png',
          'ticket.png',
          'triangular_flag_on_post.png',
          'uk.png',
          'video_game.png',
          'watermelon.png',
          'yen.png',
          'pound.png',
          'womans_hat.png',
          'vs.png',
          'us.png',
          'underage.png',
          'umbrella.png',
          'vertical_traffic_light.png',
          'two_women_holding_hands.png',
          'two_men_holding_hands.png',
          'tractor.png',
          'tropical_fish.png',
          'syringe.png',
          'spaghetti.png',
          'rice.png',
          'ramen.png',
          'raised_hands.png',
          'ring.png',
          'pineapple.png',
          'page_facing_up.png',
          'page_with_curl.png',
          'outbox_tray.png',
          'oden.png',
          'octocat.png',
          'mount_fuji.png',
          'mountain_bicyclist.png',
          'nail_care.png',
          'musical_score.png',
          'musical_keyboard.png',
          'oncoming_automobile.png',
          'heart.png',
          'broken_heart.png',
          'star.png',
          'anger.png',
          'exclamation.png',
          'question.png',
          'zzz.png',
          'thumbsup.png',
          'thumbsdown.png',
          'ok_hand.png',
          'punch.png',
          'v.png',
          'clap.png',
          'muscle.png',
          'pray.png',
          'skull.png',
          'trollface.png',
          'dog.png',
          'eyeglasses.png',
          'full_moon_with_face.png',
          'ghost.png',
          'hankey.png',
          '100.png'
         ]
      }
    })  
  }
  //评论
  var $commentBtn = $('.commenter_button')
  var $commentText = $('.commenter_text')
  var submitFlag = true
  if ($commentBtn) {
    $commentBtn.click(function () {
      if (!submitFlag) {
        new Noty({
          type: 'error',
          layout: 'bottomLeft',
          text: '慢点点老哥',
          timeout: 2000,
          progressBar: true,
          animation: animatRight,
        }).show()
        return
      }
      submitFlag = false
      var val = $commentText.val()
      // val =  null
      if (!val) {
        new Noty({
          type: 'error',
          layout: 'bottomLeft',
          text: '随便说点什么再提交？',
          timeout: 2000,
          progressBar: true,
          animation: animatRight,
        }).show()
        submitFlag = true
        return
      }
      $.ajax({
        type: 'post',
        url: location.pathname + '/comment',
        data: {
          content: val
        },
        success: function(res) {
          if (res.status === 'ok') {
             new Noty({
              type: 'success',
              layout: 'bottomLeft',
              text: res.mes,
              timeout: 2000,
              progressBar: true,
              animation: animatRight,
              callbacks: {
                afterClose: function() {
                  location.reload()
                }
              }
            }).show()
            submitFlag = true
          }
        }
      })
    })
  }
  // 删除评论
  var $commentReply = $('.comment_reply')
  if ($commentReply.length > 0) {
    $commentReply.click(function() {
      var commentId = $(this).data('id')
      var $this = $(this)
      $.ajax({
        type: 'post',
        url: $this.data('url'),
        data: {
          commentId: commentId
        },
        success: function(res) {
          new Noty({
            type: 'success',
            layout: 'bottomLeft',
            text: res.mes,
            timeout: 2000,
            progressBar: true,
            animation: animatRight
          }).show()
          submitFlag = true
          if (res.status === 'fail') return
          var $target = $this.parents('.comment')
          Velocity($target, {
            right: '+=-50'
          }, {
            easing: [ 8, 8, 2],
            duration: 600
          })
          Velocity($target, {
            right: 1000,
            scaleY: 0,
            height: 0,
            margin: 0
          }, {
            easing: [ 8, 8 ],
            complete: function () {
              $target.remove()
            }
          })
        }
      })
    })
  }
  //密码重置
  (function() {
    var getFlag = true
    $('#email-code').on('input', function() {
      var val = $(this).val()
      $(this).val(val.toUpperCase())
    })
    var countDown = function ($target, times) {
      if (times < 0) {
        $target.text('获取验证码').removeClass('disabled')
        return
      }
      $target.text(times + "''")
      times--
      setTimeout(function () {
        countDown($target, times)
      }, 1000)

    }
    $('#get-code').click(function() {
      var $this = $(this)
      if (!getFlag || $this.hasClass('disabled')) return
      var mail = $('[name=name]').val()
      var reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
      if (!reg.test(mail)) return
      getFlag = false
      $.ajax({
        type: 'POST',
        url: location.pathname + '/code',
        data: {
          email: mail
        },
        success: function (res) {
          getFlag = true
          if (res.status === 'ok') {
            $this.addClass('disabled')
            countDown($this, 179)
            new Noty({
              type: 'success', // success
              layout: 'topRight',
              text: res.mes,
              timeout: 2000,
              progressBar: true,
              animation: animat,
            }).show()
          }
        }
      })
    })
  })()
})
