$('.ui.sidebar')
.sidebar('setting', 'defaultTransition', {
  "mobile": {
    "left": 'overlay',
    "right": 'overlay'
  }
})

$('.toc.item, #sidebar-close').click(function(){
  $('.ui.sidebar')
  .sidebar('toggle')
})

$('.contact-trigger').click(function(e){
  e.preventDefault();

  $('.contact.modal')
    .modal('setting', 'transition', 'fade up')
    .modal('setting', 'dimmerSettings', {
      variation: 'inverted'
    })
    .modal('show')
  ;
})
