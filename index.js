"use strict";

var dappAddress = "n1jRgsLrNByopijVP7ybgT9AoG7jw7kW2RW";
// var hash = "2dad79282dc4918c21362ea3a410c939c5d568909f8be3f59203991222b43d36";

var NebPay = require("nebpay");
var nebPay = new NebPay();

if (!localStorage.getItem('language')) {
  localStorage.setItem('language', navigator.language)
}

var language = localStorage.getItem('language').split('-')[0];

 $('#language').html(language === 'zh' ? 'English' : '简体中文');
 $(this).attr('data-language', language === 'zh' ? 'zh-CN' : 'en-US');

var dom = document.querySelectorAll('[data-lang]');
for (var i = 0; i < dom.length; i++) {
  dom[i].innerHTML = langMessage[language][dom[i].dataset.lang] || ''
}

var doms = document.querySelectorAll('[data-placeholder]');
for (var i = 0; i < doms.length; i++) {
  doms[i].setAttribute('placeholder', langMessage[language][doms[i].dataset.placeholder] || '')
}



$('#language').on('click', function () {
  if (language === 'zh') {
    localStorage.setItem('language', 'en-US')
    $('#language').html('Englisg');
    location.reload();
  } else {
    localStorage.setItem('language', 'zh-CN')
     $('#language').html('简体中文');
    location.reload();
  }
})

if (typeof webExtensionWallet === "undefined") {
  toast(langMessage[language]['a7'])
}

$('#loading').show();

function all (datalist) {
  var datas = JSON.parse(datalist);
  var html = "";
  for (var i = 0; i < datas.length; i++) {
    html += '<div class="promise-item-wrap">'
          +'<div class="promise-item">'
            +'<div class="promise-text">' + datas[i].value + '</div>'
            +'<div class="promise-info">'
              +'<p>' + datas[i].key + '</p>'
              +'<p>' + getTime(datas[i].time) + '</p>'
            +'</div>'
          +'</div>'
        +'</div>'
  }

  $('#desirewall-body').html(html);
}

$(function () {
  nebPay.simulateCall(dappAddress, "0", "getAll", JSON.stringify([]), {
    listener: function(res) {
      $('#loading').hide();
        if(res.result == '' && res.execute_err == 'contract check failed'){
            toast(langMessage[language]['a8'])
            return;
        }
        var datalist = JSON.parse(res.result);
        if (datalist && datalist.length) {
            all(datalist)
            console.log(datalist, 'datalist')
        } else {
          $('#desirewall-body').html('<p class="no-wishing-wall">' + langMessage[language]['a9'] + '</p>');
        }
    }
  })
})

/*** toast封装 ***/
function toast (text) {
  $('#toast').html(text);
  $('#toast').show();
  setTimeout(function () {
    $('#toast').addClass('toast-show');
    showToast()
  }, 300);
}

function showToast () {
  setTimeout(function () {
    $('#toast').removeClass('toast-show');
    setTimeout(function () {
      $('#toast').hide();
    }, 2300);
  }, 3000);
}

$('#promise').on('click', function () {
  $('#promise').addClass('active');
  $('#desirewall').removeClass('active');
  $('#mypromise').removeClass('active');
  $('#promise-body').show();
  $('#desirewall-body').hide();
  $('#mypromise-body').hide();
})

$('#desirewall').on('click', function () {
  $('#desirewall').addClass('active');
  $('#promise').removeClass('active');
  $('#mypromise').removeClass('active');
  $('#promise-body').hide();
  $('#desirewall-body').show();
  $('#mypromise-body').hide();
})

$('#mypromise').on('click', function () {
  $('#mypromise').addClass('active');
  $('#desirewall').removeClass('active');
  $('#promise').removeClass('active');
  $('#promise-body').hide();
  $('#desirewall-body').hide();
  $('#mypromise-body').show();
})

$('#promise-name').on('input', function () {
  promiseverify()
})

$('#promise-textarea').on('input', function () {
  promiseverify()
})


function promiseverify () {
  if ($('#promise-name').val() && $('#promise-textarea').val()) {
    $('#addpromise').addClass('promise-submit')
  } else {
    $('#addpromise').removeClass('promise-submit')
  }
}

$('#addpromise').on('click', function () {
  if ($('#addpromise').hasClass('promise-submit')) {
    var to = dappAddress;
    var key = $('#promise-name').val();
    var val = $('#promise-textarea').val();
    $('#loading').show();
    nebPay.call(dappAddress, "0", "set", JSON.stringify([key, val]), { 
          listener: function(res){
            $('#loading').hide();
              if (res.txhash) {
                toast(langMessage[language]['a10'])
              }
          }
      })
    }
})

$('#search-promise-name').on('input', function () {
  if ($('#search-promise-name').val()) {
    $('#search').addClass('search-btn')
  } else {
    $('#search').removeClass('search-btn')
  }
})

$('#search').on('click', function () {
  if ($('#search').hasClass('search-btn')) {
    $('#loading').show();
    nebPay.simulateCall(dappAddress, "0", "get", JSON.stringify([$('#search-promise-name').val()]), {
      listener: function(res) {
        $('#loading').hide();
        if(res.result == '' && res.execute_err == 'contract check failed') {
            toast(langMessage[language]['a8']);
            return;
        }

        var datalist = JSON.parse(res.result);
        searchval(datalist)
      }
    })
  }
})


function searchval (data) {
  var html = '';
  var datalist = JSON.parse(data);

  if (datalist && datalist.length) {
    var html = '';

    for (var i = 0; i < datalist.length; i++) {

      html += '<div class="mypromise-item">'
          +'<p class="mypromise-item-text">' + datalist[i].value + '</p>'
          +'<p class="mypromise-item-time">' + getTime(datalist[i].time) + '</p>'
        +'</div>'
    }
    
    html += '<p class="mypromise-item-name">' + datalist[0].key + '<p>';

    $('#mypromise-wrap').html(html);
  } else {
    html += '<p class="mypromise-no">' + langMessage[language]['a11'] +'</p>'
    $('#mypromise-wrap').html(html)
  }
}

function getTime (data) {
  var data = data + '000';
  var myDate = new Date(+data);
  var year = myDate.getFullYear();
  var months = myDate.getMonth() + 1;
  var month = months.toString().length === 2 ? months : '0' + months;
  var date = myDate.getDate().toString().length === 2 ? myDate.getDate() : '0' + myDate.getDate();
  var hours = myDate.getHours().toString().length === 2 ? myDate.getHours() : '0' + myDate.getHours();
  var minutes = myDate.getMinutes().toString().length === 2 ? myDate.getMinutes() : '0' + myDate.getMinutes();
  var seconds = myDate.getSeconds().toString().length === 2 ? myDate.getSeconds() : '0' + myDate.getSeconds();
  return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds
}