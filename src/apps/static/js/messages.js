
const log_message = function (message, styles) {
    Toastify({
      text: message,
      duration: 3000,
      newWindow: true,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "center", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: message,
      onClick: function(){} // Callback after click
    }).showToast();
}


export const log_error = function(message){
  log_message(message, {
    background: "red",
  })
}

export const log_success = function(message){
  log_message(message, {
    background: "green",
  })
}

export const log_info = function(message){
  log_message(message, {
    background: "blue",
  })
}
