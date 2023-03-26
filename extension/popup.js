function getDomainName() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let currentUrl = tabs[0].url;
    let domainName = new URL(currentUrl).hostname;
    domainName = domainName.replace('www.', '');
    //let parts = domainName.split('.');
      //domainName = parts[parts.length - 2] + '.' + parts[parts.length - 1];
      //for (parts.length) {
      //  domainName = parts[parts.length - 3] + '.' + domainName;
      //}
      //var parts = domainName;
      if (document.querySelector('form input[name="domain"]')){
        document.querySelector('form [name="domain"]').value = domainName;
      }
  });
}


// Fonction pour charger le contenu d'un fichier HTML
function loadHTMLFile(filename) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      let htmlContent = xhr.responseText;
      // Insérer le contenu HTML dans la page
      document.querySelector(".container").innerHTML = htmlContent;
    }
  };
  xhr.open("GET", chrome.runtime.getURL(filename), true);
  xhr.send();
}

async function generatePassword() {
  let salt = document.querySelector("form input[name='salt']").value;
  let key_length = document.querySelector("form input[name='length']").value;
  let iterations = document.querySelector("form input[name='iteration']").value;
  let options = [
    document.querySelector("form input[name='username']").value,
    document.querySelector("form input[name='domain']").value
  ];
  document.querySelector("#generate_password").innerHTML = "Génération du mot de passe en cours...";
  
  let includeUppercase = document.querySelector("form input[name='includeUppercase']").checked;
  let includeSpeciaux = document.querySelector("form input[name='specialCharRequired']").checked;

  let psw = await get_password(getMasterKey(), options, salt, key_length, iterations, includeUppercase, includeSpeciaux);
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
  
  document.querySelector("#add-credential").addEventListener("click", function() {
    loadHTMLFile("formSignIn.html");

    setTimeout(function() {
      defaultValue();
      document.querySelector("form.formSignIn input[type=submit]").addEventListener("click", async function(e) {
        e.preventDefault();
        this.style.display = "none";
        let username = document.querySelector("form.formSignIn input[name='username']").value;
        let domain = document.querySelector("form.formSignIn input[name='domain']").value;
        let salt = document.querySelector("form.formSignIn input[name='salt']").value;
        let length = document.querySelector("form.formSignIn input[name='length']").value;
        let iteration = document.querySelector("form.formSignIn input[name='iteration']").value;
        let version = document.querySelector("form.formSignIn input[name='version']").value;
        let status = document.querySelector("form.formSignIn select[name='status']").value;
        let timestamp_creation = Date.now().toString();
        let timestamp_modification = Date.now().toString();
        let timestamp_use = Date.now().toString();
        let information = document.querySelector("form.formSignIn textarea[name='more_information']").value;
        let includeUppercase = document.querySelector("form.formSignIn input[name='includeUppercase']").checked;
        let includeSpecialChars = document.querySelector("form.formSignIn input[name='specialCharRequired']").checked;
        interfaceCreationElement(username, domain, length, salt, iteration, version, status, timestamp_creation, timestamp_modification, timestamp_use, information, includeUppercase, includeSpecialChars);
        this.style.display = "none";
      });
      document.querySelector("form.formSignIn").addEventListener("input", async (event) => {
        generatePassword();
      }, 1000);
      document.querySelector("#show_para").addEventListener("click", function() {
        document.querySelectorAll("#sub_para").forEach(function(element) {
          //element.classList.toggle("hidden");
          if(element.style.display != "block") {
            element.style.display = "block";
          } else {
            element.style.display = "none";
          }
        });
      });
    }, 500);
  });

  // Ajouter un gestionnaire d'événement pour le bouton
  document.querySelector("#generate-credential").addEventListener("click", function() {
    loadHTMLFile("formLogIn.html");
    setTimeout(function() {
      defaultValue();
      showElements(where_query="tbody#list_data_login");
      //document.querySelector("input#login_choice").addEventListener("change", function(e) {
      //  let id = document.querySelector("#login_choice").value;
      //  getLoginPassword(id);
      //});

      document.querySelector("input#copy_password").addEventListener("click", async function(e) {
        e.preventDefault();
        this.style.display="none";
        let id = document.querySelector("#login_choice").value;
        copySpanToClipboard(await getLoginPassword(id));
        this.style.display="block";
      });

      document.querySelector("form#logIn").addEventListener("input", async (event) => {
        let username = document.querySelector("form #username").value;
        let domain = document.querySelector("form #domain").value;
        const ids = getElementsId(username, domain);
        highlightRows('table#list_data_login tbody', ids);
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
        let id = document.querySelector("form.formDelete #id").value;
        deleteElement(id);
        showElements();
      });
    }, 500);
  });

  document.querySelector("#profil-credential").addEventListener("click", function() {
    loadHTMLFile("formProfil.html");
    
    setTimeout(function() {
      document.querySelector("form#formMasterKeyChange input[type=submit]").addEventListener("click", function(e) {
        e.preventDefault();
        let oldMasterKey = document.querySelector("form#formMasterKeyChange input[name='oldMasterKey']").value;
        let masterKey = document.querySelector("form#formMasterKeyChange input[name='masterKey']").value;
        let masterKeyConfirm = document.querySelector("form#formMasterKeyChange input[name='masterKeyConfirm']").value;

        if(oldMasterKey != getMasterKey()) {
          alert("Ancien mot de passe incorrect");
          return false;
        }
        if (masterKey == masterKeyConfirm) {

        } else {
          alert("Les mots de passe ne sont pas identiques");
          return false;
        }
        changeMasterKey(masterKey); // !!!
        this.style.display = "none";
      });

      document.querySelector("form#formSpeedPassChange input[type=submit]").addEventListener("click", function(e) {
        e.preventDefault();
        let oldSpeedPass = document.querySelector("form#formSpeedPassChange input[name='oldSpeedPass']").value;
        let speedPass = document.querySelector("form#formSpeedPassChange input[name='speedPass']").value;
        let speedPassConfirm = document.querySelector("form#formSpeedPassChange input[name='speedPassConfirm']").value;

        if(verifySpeedPass(oldSpeedPass) == false) {
          alert("Ancien mot de passe incorrect");
          return false;
        }

        if (speedPass == speedPassConfirm) {
          changeSpeedPass(oldSpeedPass, speedPass);
        } else {
          alert("Les mots de passe ne sont pas identiques");
        }
        document.querySelector("span#status").innerHTML = "Mot de passe changé";
      });
      
      document.querySelector("form#formGetMasterKey input[type=submit]").addEventListener("click", function(e) {
        e.preventDefault();
        let speedPass = document.querySelector("form#formGetMasterKey input[name='speedPass']").value;
        if(verifySpeedPass(speedPass) == false) {
          alert("mot de passe incorrect");
          return false;
        }
        document.querySelector("span#showMasterKey").innerHTML = "Votre MasterKey " + getMasterKey();
        this.value = "";
        setInterval(function() {
          document.querySelector("span#showMasterKey").innerHTML = "";
        }, 30000);
      });
    }, 500);
  });



  // Ajouter un gestionnaire d'événement pour le bouton
  document.querySelector("#search-credential").addEventListener("click", function() {
    loadHTMLFile("formSearch.html");
    setTimeout(function() {
      showElements("tbody#list_data_search");
      document.querySelector("form#search input[type=submit]").addEventListener("click", function(e) {
        e.preventDefault();
        let username = document.querySelector("form#search #username").value;
        let domain = document.querySelector("form#search #domain").value;
        const ids = getElementsId(username, domain);
        showElements("tbody#list_data_search");
        highlightRows('tbody#list_data_search', ids);
      });
    }, 500);
  });


	if (localStorage.getItem('masterKey') == null) {
    showMasterKeyForm();
	}
  
	if (localStorage.getItem('speedPass') == null) {
		showSpeedPassForm();
	}
  if (localStorage.getItem('speedPass') != null && sessionStorage.getItem('speedPass') == null) {
    showSpeedPassSessionLogInForm();
  }
}




