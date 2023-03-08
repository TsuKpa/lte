// show Toast when create succeed const showToast =
const showToast = document.getElementById('showToast');
if (showToast) {
  toastr.success('Create user success!');
  showToast.remove();
}
$(function () {
  $.validator?.addMethod(
    'validatePassword',
    function (value) {
      return /^.*(?=.{8,})(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%&]).*$/.test(
        value,
      );
    },
    'Please enter your strong password',
  );
  $.validator?.addMethod(
    'validateEmail',
    function (value) {
      return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
    },
    'Please enter valid email address',
  );
  $('#formLogin')?.validate({
    rules: {
      email: {
        required: true,
        validateEmail: true,
      },
      password: {
        required: true,
        minlength: 8,
        maxlength: 20,
        validatePassword: true,
      },
    },
    messages: {
      email: {
        required: 'Please enter a email address',
        email: 'Please enter a valid email address',
      },
      password: {
        required: 'Please provide a password',
        minlength: 'Your password must be at least 5 characters long',
      },
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback');
      element.closest('.input-group').append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    },
  });
  $('#formLogin').on('change', function (event, salutation, name) {
    if ($('#formLogin').valid) {
      $('#login-error').remove();
    }
  });
  $('#formRegister').on('change', function (event, salutation, name) {
    if ($('#formRegister').valid) {
      $('#login-error').remove();
    }
  });
  $('#formForgot').on('change', function (event, salutation, name) {
    if ($('#formForgot').valid) {
      $('#login-error').remove();
    }
  });
  // Register form validate
  $('#formRegister')?.validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minlength: 8,
        maxlength: 20,
        validatePassword: true,
      },
      password_confirm: {
        required: true,
        minlength: 8,
        maxlength: 20,
        validatePassword: true,
        equalTo: '#password',
      },
      terms: {
        required: true,
      },
    },
    messages: {
      email: {
        required: 'Please enter a email address',
        email: 'Please enter a valid email address',
      },
      password: {
        required: 'Please provide a password',
        minlength: 'Your password must be at least 5 characters long',
      },
      terms: {
        required: 'Please accept our terms and conditions',
      },
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      console.log(element, element.id);
      error.addClass('invalid-feedback');
      if (element[0].id === 'agreeTerms') {
        error.addClass('ml-2');
        element.closest('#term').append(error);
      } else {
        element.closest('.input-group').append(error);
      }
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    },
  });

  // Form forgot validate
  $('#formForgot')?.validate({
    rules: {
      email: {
        required: true,
        validateEmail: true,
      },
    },
    messages: {
      email: {
        required: 'Please enter a email address',
        email: 'Please enter a valid email address',
      },
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback');
      element.closest('.input-group').append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    },
  });

  // Form recover pwd
  $('#formRecover')?.validate({
    rules: {
      password: {
        required: true,
        minlength: 8,
        maxlength: 20,
        validatePassword: true,
      },
      password_confirm: {
        required: true,
        minlength: 8,
        maxlength: 20,
        validatePassword: true,
        equalTo: '#password',
      },
    },
    messages: {
      email: {
        required: 'Please enter a email address',
        email: 'Please enter a valid email address',
      },
      password: {
        required: 'Please provide a password',
        minlength: 'Your password must be at least 5 characters long',
      },
      terms: {
        required: 'Please accept our terms and conditions',
      },
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      console.log(element, element.id);
      error.addClass('invalid-feedback');
      if (element[0].id === 'agreeTerms') {
        error.addClass('ml-2');
        element.closest('#term').append(error);
      } else {
        element.closest('.input-group').append(error);
      }
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    },
  });

});
