function showSpeedPassForm() {
  document.body.style.minHeight = "250px";
  var speedPassShadow = document.createElement('div');
  speedPassShadow.setAttribute('class', 'initPopupShadow');
  speedPassShadow.setAttribute('id', 'speedPassShadow');
  var speedPassForm = document.createElement('form');
  var label = document.createElement('label');
  label.innerHTML = 'Définisser le SpeedPass \"simple\"<br> pour une connexion rapide';
  speedPassForm.append(label);
  speedPassForm.setAttribute('class', 'initPopupForm');
  speedPassForm.setAttribute('id', 'speedPassForm');

  var speedPassInput = document.createElement('input');
  speedPassInput.setAttribute('type', 'password');
  speedPassInput.setAttribute('id', 'speedPassInput');
  speedPassInput.setAttribute('placeholder', 'speedPass ...');
  var speedPassSubmit = document.createElement('input');
  speedPassSubmit.setAttribute('type', 'submit');
  speedPassSubmit.setAttribute('value', 'Valider');
  
  // for setup speedPass
  speedPassSubmit.addEventListener('click', function(event) {
    event.preventDefault();
    initSpeedPass(speedPassInput.value);
    speedPassShadow.remove();
  });
  
  speedPassForm.append(speedPassInput);
  speedPassForm.append(speedPassSubmit);
  speedPassShadow.append(speedPassForm);
  document.querySelector(".container").append(speedPassShadow);
}
function showSpeedPassSessionLogInForm() {
  var speedPassShadow = document.createElement('div');
  speedPassShadow.setAttribute('class', 'initPopupShadow');
  speedPassShadow.setAttribute('id', 'speedPassShadow');
  var speedPassForm = document.createElement('form');
  speedPassForm.setAttribute('class', 'initPopupForm');
  speedPassForm.setAttribute('id', 'speedPassForm');

  var speedPassInput = document.createElement('input');
  speedPassInput.setAttribute('type', 'password');
  speedPassInput.setAttribute('id', 'speedPassInput');
  speedPassInput.setAttribute('placeholder', 'speedPass ...');
  speedPassInput.setAttribute('autofocus', 'autofocus');
  var speedPassSubmit = document.createElement('input');
  speedPassSubmit.setAttribute('type', 'submit');
  speedPassSubmit.setAttribute('value', 'Valider');

  // for log in with speedPass
  speedPassSubmit.addEventListener('click', (event) => {
    event.preventDefault();
    //saveSpeedPass();
    // Code à exécuter lorsque le formulaire est soumis
    if (connectWithSpeedPass(speedPassInput.value)) {
      speedPassShadow.remove();
      setTimeout(function() {
        defaultValue();
      }, 500);
      
    } else {
      alert('speedPass incorrect');
      speedPassInput.value = '';
    }
    
  });
  
  speedPassForm.append(speedPassInput);
  speedPassForm.append(speedPassSubmit);
  speedPassShadow.append(speedPassForm);
  document.querySelector(".container").append(speedPassShadow);
}

function showMasterKeyForm() {
  document.body.style.minHeight = "250px";
  var masterKeyShadow = document.createElement('div');
  masterKeyShadow.setAttribute('class', 'initPopupShadow');
  masterKeyShadow.setAttribute('id', 'masterKeyShadow');
  var masterKeyForm = document.createElement('form');
  var label = document.createElement('label');
  label.innerHTML = 'Définisser un mot de passe "fort"<br><b>différent</b> de votre speedPass<br>+16 caractères, chiffres, majuscules ET minuscules<br>vos mots de passe seront dérivé de celui là<br><soan style="color: red;">ne le perdez pas ! et ne le donnez pas !<br> il n\'est pas possible de le retrouver</span>';
  masterKeyForm.setAttribute('class', 'initPopupForm');
  masterKeyForm.setAttribute('id', 'masterKeyForm');
  //masterKeyForm.setAttribute('action', 'javascript:saveMasterKey()'); // ???

  var masterKeyInput = document.createElement('input');
  masterKeyInput.setAttribute('type', 'password');
  masterKeyInput.setAttribute('id', 'masterKeyInput');

  var masterKeySubmit = document.createElement('input');
  masterKeySubmit.setAttribute('type', 'submit');
  masterKeySubmit.setAttribute('value', 'Valider');

  document.querySelector(".container").append(masterKeyShadow);
  
  masterKeySubmit.addEventListener('click', function(event) {
    event.preventDefault();
    //saveMasterKey();
    // Code à exécuter lorsque le formulaire est soumis
    initMasterKey(masterKeyInput.value);
    masterKeyShadow.remove();
  });

  masterKeyForm.append(label);
  masterKeyForm.append(masterKeyInput);
  masterKeyForm.append(masterKeySubmit);
  masterKeyShadow.append(masterKeyForm);
  document.querySelector(".container").append(masterKeyShadow);
}


// ------------------------------------------------------------

async function defaultValue() {
  getDomainName();

  var username = document.querySelector('form input[name="username"]');
  if(username != null) {
    username.value = await searchUserName();
  }

  var length = document.querySelector('form  input[name="length"]');
  if(length != null) {
    length.value = 16;
  }

  var salt = document.querySelector('form  input[name="salt"]');
  if(salt != null) {
    salt.value = 42;
  }

  var interation = document.querySelector('form  input[name="iteration"]');
  if(interation != null) {
    interation.value = 1000;
  }

  //var keylen = document.querySelector('form.formSignIn input#keylen');
  //keylen.value = 64;
  
  var version = document.querySelector('form  input[name="version"]');
  if(version != null) {
    version.value = 1;
  }

  var speedPass = document.querySelector('form  input[name="speedPass"]');
  if(speedPass != null) {
    speedPass.type = 'text';
    speedPass.value = getSpeedPass();
    speedPass.type = 'password';
  }
  
}