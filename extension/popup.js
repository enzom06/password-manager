/*
// fonction d'appel de la commande pour le shortcupt
chrome.commands.onCommand.addListener(function(command) {
  if (command == "open-my-extension") {
    chrome.tabs.create({url: chrome.extension.getURL('popup.html')});
  }
});*/
/*
// Set a shortcut for the extension.
chrome.commands.getAll(function(commands) {
  for (var i = 0; i < commands.length; i++) {
    if (commands[i].name == "open-my-extension") {
      return;
    }
  }
  chrome.commands.setShortcut("open-my-extension", "Shift+P");
});
*/

/*
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
   chrome.tabs.executeScript(
      tabs[0].id,
      { code: "document.querySelector('form input[type=email]').value" },
      function (result) {
         var email = result[0];
         chrome.tabs.executeScript(
            tabs[0].id,
            { code: "document.querySelector('form input[type=password]').value" },
            function (result) {
              var password = result[0];
              console.log(email, password);
              
                if (email && password) {
                  credentialsDiv.innerHTML = '<p>Identifiants de connexion enregistrés :</p><p>Adresse email : ' + email + '</p><p>Mot de passe : ' + password + '</p>';
                } else {
                  credentialsDiv.innerHTML = '<p>Pas d\'identifiants de connexion enregistrés pour cette page.</p>';
                }
            }
         );
      }
   );
});*/



/*
// Fonction pour récupérer les valeurs de l'email et du mot de passe dans la page principale de l'onglet
function getEmailAndPassword() {
  if (!chrome.tabs) {
    return Promise.reject('chrome.tabs is not available'), NULL;
  }
  
  return new Promise((resolve, reject) => {
    chrome.tabs.executeScript({ code: "({ email: document.querySelector('input[name=email]').value, password: document.querySelector('input[name=current-password]').value })" }, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(result[0]);
      }
    });
  });
}

// Appeler la fonction toutes les secondes avec setInterval
setInterval(async () => {
  try {
    const { email, password } = await getEmailAndPassword();
    if (email && password) {
      console.log(`Email: ${email}, Mot de passe: ${password}`);
      var credentialsDiv = document.querySelector('#credentials');
      credentialsDiv.innerHTML = '<p>Identifiants de connexion enregistrés :</p><p>Adresse email : ' + email + '</p><p>Mot de passe : ' + password + '</p>';
    } else {
      credentialsDiv.innerHTML = '<p>Pas d\'identifiants de connexion enregistrés pour cette page.</p>';
    }
  } catch (error) {
    console.error(error);
  }
}, 1000);
*/

function getDomainName() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var currentUrl = tabs[0].url;
    var domainName = new URL(currentUrl).hostname;
    if (domainName.split('.')[0] != 'www' && document.querySelector("#domain").innerText == 'www') {
      domainName = domainName.split('.')[1];
    }
    document.querySelector("form #domain").value = domainName;
  });
}

// Fonction pour charger le contenu d'un fichier HTML
function loadHTMLFile(filename) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var htmlContent = xhr.responseText;
      // Insérer le contenu HTML dans la page
      document.querySelector(".container").innerHTML = htmlContent;
    }
  };
  xhr.open("GET", chrome.extension.getURL(filename), true);
  xhr.send();
}

async function generatePassword() {
  var salt = document.querySelector("form #salt").value;
  var key_length = document.querySelector("form #length").value;
  var iterations = document.querySelector("form #iteration").value;
  var options = [
    document.querySelector("form #username").value,
    document.querySelector("form #domain").value
  ];
  document.querySelector("#generate_password").innerHTML = "Génération du mot de passe en cours...";
  var psw = await get_password(getMasterKey(), options, salt, key_length, iterations);
  document.querySelector("#generate_password").innerHTML = psw;
  return psw;
}


/*
interfaceCreationElement(
	username,
	domain,
	salt,
	iteration,
	version,
	status,
	timestamp_creation,
	timestamp_modification,
	timestamp_use,
	information,
	password)
*/

window.onload = function() {
  // Ajouter un gestionnaire d'événement pour le bouton
  document.querySelector("#add-credential").addEventListener("click", function() {
    loadHTMLFile("formSignIn.html");
    // wait one second before setting the default value
    setTimeout(function() {
      defaultValue();
      document.querySelector("form.formSignIn input[type=submit]").addEventListener("click", async function(e) {
        e.preventDefault();
        // disabled button
        document.querySelector("form.formSignIn input[type=submit]").style.display = "none";
        var psw = await generatePassword();
        var username = document.querySelector("form.formSignIn #username").value;
        var domain = document.querySelector("form.formSignIn #domain").value;
        var salt = document.querySelector("form.formSignIn #salt").value;
        var iteration = document.querySelector("form.formSignIn #iteration").value;
        var version = document.querySelector("form.formSignIn #version").value;
        var status = document.querySelector("form.formSignIn #status").value;
        var timestamp_creation = Date.now().toString();
        var timestamp_modification = Date.now().toString();
        var timestamp_use = Date.now().toString();
        var information = document.querySelector("form.formSignIn #more-information").value;
        interfaceCreationElement(username, domain, salt, iteration, version, status, timestamp_creation, timestamp_modification, timestamp_use, information, password);
        document.querySelector("form.formSignIn input[type=submit]").style.display = "block";
      });
      document.querySelector("form.formSignIn").addEventListener("input", async (event) => {
        generatePassword();
      }, 1000);
    }, 500);
  });
  // Ajouter un gestionnaire d'événement pour le bouton
  document.querySelector("#remove-credential").addEventListener("click", function() {
    loadHTMLFile("formDelete.html");
    setTimeout(function() {
      showElements();
      document.querySelector("form.formDelete input[type=submit]").addEventListener("click", function(e) {
        e.preventDefault();
        var id = document.querySelector("form.formDelete #id").value;
        deleteElement(id);
        showElements();
      });
    }, 500);
  });
  // Ajouter un gestionnaire d'événement pour le bouton
  document.querySelector("#generate-credential").addEventListener("click", function() {
    loadHTMLFile("formLogIn.html");
    setTimeout(function() {
      defaultValue();
      showElements(where_query="tbody#list_data_login", username=document.querySelector("form #username").value);
      document.querySelector("#find_data_for_password").addEventListener("click", function(e) {
        e.preventDefault();
        
        var username = document.querySelector("form #username").value;
        var domain = document.querySelector("form #domain").value;
        var length = document.querySelector("form #length").value;
        var salt = document.querySelector("form #salt").value;
        var iteration = document.querySelector("form #iteration").value;
        generatePassword();
      });

      document.querySelector("form#logIn").addEventListener("input", async (event) => {
        var username = document.querySelector("form #username").value;
        var domain = document.querySelector("form #domain").value;
        console.log(username, domain);
        const ids = getElementsId(username, domain);
        console.log(ids);
        highlightRows('table#list_data_login tbody', ids);
      }, 1000);
    }, 500);
    
  });
	if (localStorage.getItem('masterKey') == null) {
    showMasterKeyForm();
	}
  
	if (localStorage.getItem('speedPass') == null) {
		showSpeedPassForm();
	}
  //sessionStorage.setItem('speedPass', '123') // TODO : à supprimer
  // Afficher le formulaire de connexion
  if (localStorage.getItem('speedPass') != null && sessionStorage.getItem('speedPass') == null) {
    showSpeedPassSessionLogInForm();
  }
}

// lors de l'ouverture de l'extension, charger le formulaire de connexion
//loadHTMLFile("formLogIn.html");



