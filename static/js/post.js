$(document).ready(function() {
  var editor = new Simditor({
    textarea: $('#editor'),
    toolbar: ['emoji', 'title','bold','italic','underline','strikethrough','fontScale','color',
      'ol','ul','blockquote','code', 'table','link','image','hr', 'indent', 'alignment'
    ],
    upload: {
      url: '/posts/image',
      params: null,
      fileKey: 'upload_file',
      connectionCount: 1,
      leaveConfirm: 'Uploading is in progress, are you sure to leave this page?',
    },
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
  var submitFlag = true //  防多次提交
  $('#post-btn').click(function() {
    if (!submitFlag) {
      new Noty({
        type: 'error',
        layout: 'topRight',
        text: '老哥慢点',
        timeout: 2000,
        progressBar: true,
        animation: animat,
      }).show()
      return
    }
    var title = $('#title').val()
    var content = editor.getValue()
    var tag  = $('#tag').val()
    title = title ? title.replace(/\s/g, '') : ''
    
    if (!title || !content) {
      new Noty({
        type: 'error',
        layout: 'topRight',
        text: '标题和内容都不能为空',
        timeout: 2000,
        progressBar: true,
        animation: animat,
      }).show()
      return
    }
    submitFlag = false
    $.ajax({
      type: 'post',
      url: location.pathname,
      data: {
        title: title,
        content: content,
        tag: tag
      },
      success: function(res) {
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
                location.href = res.url
              }
            }
          }).show()
          submitFlag = true
        }
      }
    })
  })
})