
async function get_password(mainPassword, options=[], salt=0, key_length=16, iterations=100000) {
	// cut mainPassword in part of 
    let data = "";
    for (let option of options) {
        data += option.toString();
    }
    return await pbkdf2(data, salt, key_length, iterations);
}

async function pbkdf2(password, salt, key_length=32, iterations=100000) {
    // Convert password and salt to bytes
    password = new TextEncoder().encode(password);
    salt = new TextEncoder().encode(salt);
  
    // Initialize PRF with SHA-256 hash function
    const prf = async (key, msg) => {
      const encoder = new TextEncoder();
      const keyArray = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const msgArray = encoder.encode(new TextDecoder().decode(msg));
      const signature = await crypto.subtle.sign("HMAC", keyArray, msgArray);
      return new Uint8Array(signature);
    };
  
    // Calculate length of each block
    const block_size = 64;
    const num_blocks = Math.ceil(key_length / block_size);
    const last_block_size = (key_length % block_size) || block_size;
  
    // Initialize key and counter
    let key = new Uint8Array(0);
    let counter = 1;
  
    // Iterate over blocks
    for (let i = 0; i < num_blocks; i++) {
      // Initialize U_i with salt and counter
      let u = new Uint8Array(salt.length + 4);
      u.set(salt);
      u.set(new Uint8Array(new Uint32Array([counter]).buffer), salt.length);
      counter++;
  
      // Iterate PBKDF2 for iterations number of times
      let t = new Uint8Array(0);
      for (let j = 0; j < iterations; j++) {
        // Calculate PRF(U_i) and XOR with previous PRF results
        u = await prf(password, u);
        if (j === 0) {
          t = u;
        } else {
          t = new Uint8Array(t.map((byte, index) => byte ^ u[index]));
        }
      }
  
      // Append result to key
      if (i < num_blocks - 1) {
        key = new Uint8Array([...key, ...t]);
      } else {
        key = new Uint8Array([...key, ...t.slice(0, last_block_size)]);
      }
    }
  
    // Encode key as hexadecimal string
    return Array.from(key).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

// symétrique encryption with AES 256
function encrypt(text, password) {
		var cipher = CryptoJS.AES.encrypt(text, password);
		return cipher.toString();
}

function decrypt(cipher, password) {
		var bytes = CryptoJS.AES.decrypt(cipher, password);
		return bytes.toString(CryptoJS.enc.Utf8);
}

// [{"key":"data", "key": "data"}, {"key":"data", "key": "data"}]

// [{"key":"encryptData", "key": "encryptData"}, {"key":"encryptData", "key": "encryptData"}]
function encryptElements(elements, psw, excludes=["domain", "username", "version", "status"]) {
	for (let element of elements) {
		for (let key in element) {
			if (excludes.includes(key) == false) {
				console.log(key);
				console.log(element[key])
				console.log(element);
				element[key] = encrypt(element[key], psw);
			}
		}
	}
	return elements;
}

function decryptElements(elements, psw, excludes=["domain", "username", "version", "status"]) {
	for (let element of elements) {
		for (let key in element) {
			if(excludes.includes(key) == false) {
				element[key] = decrypt(element[key], psw);
			}
		}
	}
	return elements;
}



/*

function:
- list chaque key of localstorage
- function getMasterKey
- save/delete SpeedPass
- getSpeedPass
- encrypt/decrypt MasterKey


masterKey
- set masterKey (erease previous and save new|version number) {"masterKey":"", "version": 0}
- get masterKey (return encrypted masterKey) {"masterKey": "", "version": 0}

manipMasterKey
- (clearData, speedPass)
- (data, speedPass)
*/

// speedPass only one, on the first time
function initSpeedPass(speedPass) {
	localStorage.setItem('speedPass', hashSpeedPass(speedPass));
	sessionStorage.setItem('speedPass', speedPass);
}

function initMasterKey(masterKey, version=0) {
	var version = version;
	var speedPass = getSpeedPass();
	var data = encryptElements([{'masterKey': masterKey, 'version': version}], speedPass);
	localStorage.setItem('masterKey', JSON.stringify(data));
}

function existSpeedPass() {
	if (localStorage.getItem('speedPass') != null) {
		return true;
	} else {
		return false;
	}
}

function existMasterKey() {
	if (localStorage.getItem('masterKey') != null) {
		return true;
	} else {
		return false;
	}
}

// error if not login
function getSpeedPass() {
	var speedPass = sessionStorage.getItem('speedPass');
	return speedPass;
}

function getMasterKey(id=0) {
	var data = JSON.parse(localStorage.getItem('masterKey'));
	data = data[id]; // dict
	data = decryptElements([data], getSpeedPass());
	return data[0]['masterKey']; // value
}

function getAllMasterKey(id=0) {
	var data = JSON.parse(localStorage.getItem('masterKey'));
	data = decryptElements(data, getSpeedPass());
	return data; // array of dict
}

function verifySpeedPass(speedPass) {
	if (localStorage.getItem("speedPass") == hashSpeedPass(speedPass)) {
		return true;
	} else {
		return false;
	}
}

function hashSpeedPass(text) {
	cypher = CryptoJS.SHA256(text).toString();
	return cypher;
}

// masterkey {'masterkey': 'value', 'version': 0}

// sub function
function changeMasterKey(masterKey, id=0, incVersion=0) {
	var version = getMasterKeyVersion(id);
	var speedPass = getSpeedPass();
	if (version == null) {
		version = 0;
	}else {
		version += incVersion;
	}
	var data = encryptElements([{'masterKey': masterKey, 'version': version}], speedPass) // can be upgraded
	var allMasterKey = getAllMasterKey();
	allMasterKey[id] = data;
	localStorage.setItem('masterKey', JSON.stringify(data));
}

function getMasterKeyVersion(id=0) {
	var data = getAllMasterKey(); // should be modified to get only one
	if (data == null || data[id] == null) {
		return 0;
	}
	return data[id]['version'];
}

function changeSpeedPass(actualSpeedPass, newSpeedPass) {
	if (verifySpeedPass(actualSpeedPass) == false) {
		return false;
	}
	var masterKey = getAllMasterKey();
	localStorage.setItem('speedPass', hashSpeedPass(newSpeedPass));
	sessionStorage.setItem('speedPass', newSpeedPass);
	setAllMasterKey(masterKey, newSpeedPass, 1);
	return true;
}

function setAllMasterKey(masterKey) {
	masterKey = encryptElements(masterKey, getSpeedPass());
	localStorage.setItem("masterKey", JSON.stringify(masterKey));
}

function clearData() {
	sessionStorage.clear();
	localStorage.clear();
}

// set
// get
// delete
// getAll


// elements

function setNewElement(dicoValues) {
	var listElements = getElements()
	if (listElements == null) {
		listElements = [];
	}
	listElements.push(dicoValues);
	listElements = encryptElements(listElements, getMasterKey());

	setElements(listElements);
}

function setElements(listElements, mKey=getMasterKey()) {
	if (listElements == null) {
		listElements = [];
	}else {
		listElements = encryptElements(listElements, mKey);
		localStorage.setItem('sensitiveData', JSON.stringify(listElements));
	}
}

function getElements(mKey=getMasterKey()) {
	var elements = JSON.parse(localStorage.getItem('sensitiveData'));
	if (elements == null) {
		return [];
	}
	elements = decryptElements(elements, mKey)
	return elements;
}

/*[
	{username: key,
		domain: value,
		salt: value,
		iteration: value,
		version: 0,
		status: value,
		timestamp_creation: value,
		timestamp_modification: value,
		timestamp_use: value,
		information: value,
		password: value
	}
]*/
function deleteElement(id) {
	var listElements = getElements();
	listElements.splice(id, 1);
	setElements(listElements);
}

function updateElement(id, dicoValues) {
	var listElements = getElements();
	listElements[id] = dicoValues;
	setElements(listElements);
}

function showElements(where_query="tbody#list_data", username="") {
	var listElements = getElements();

	var content="";
	var date="";
	for(let i=0; i<listElements.length; i++) {
		if (username != "" && username != listElements[i]['username']) {
			continue;
		}
		var credential = listElements[i];
		content+="<tr>";
		content+="<td>"+i+"</td>";
		
		content+="<td>"+credential['domain']+"</td>";
		content+="<td>"+credential['username']+"</td>";
		content+="<td>"+credential['version']+"</td>";
		
		date = new Date(credential['timestamp_creation']);
		date = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
		content+="<td>"+date+"</td>";

		content+="<td>"+credential['status']+"</td>";
		content+="<td>"+credential['more_information']+"</td>";
		content+="</tr>";
	}
	if (listElements.length == 0) {
		content = "<tr><td colspan='6'>Aucun mot de passe enregistré</td></tr>";
	}
	document.querySelector(where_query).innerHTML = content;
}
function getElementsId(username, domain) {
	var listElements = getElements();
	console.log(listElements);
	var list_id = [];
	for(let i=0; i<listElements.length; i++) {
		var credential = listElements[i];
		if (credential['username'] == username && credential['domain'] == domain) {
			list_id.push(i.toString());
		}
	}
	return list_id;
}

function highlightRows(tableSelector, ids) {
	const rows = document.querySelectorAll(tableSelector + ' tr');
	rows.forEach(row => {
		var id = row.querySelector('td').innerHTML;
		console.log("id", id);
		if (ids.includes(id)) {
			row.querySelector('td').style.backgroundColor = 'yellow';
		}else {
			row.querySelector('td').style.backgroundColor = 'white';
		}
	});
}
  


function toJson(obj) {
	return JSON.stringify(obj);
}
function fromJson(json) {
	return JSON.parse(json);
}

function interfaceCreationElement(
	username,
	domain,
	salt,
	iteration,
	version,
	status,
	timestamp_creation,
	timestamp_modification,
	timestamp_use,
	information
	)
{
	var element = {
		"username": username,
		"domain": domain,
		"salt": salt,
		"iteration": iteration,
		"version": version,
		"status": status,
		"timestamp_creation": timestamp_creation,
		"timestamp_modification": timestamp_modification,
		"timestamp_use": timestamp_use,
		"information": information,
		}
		setNewElement(element);
}

function connectWithSpeedPass(speedPass) {
	if (verifySpeedPass(speedPass) == false) {
		return false;
	} else {
		sessionStorage.setItem('speedPass', speedPass);
		return true;
	}
}

function searchUserName() {
	return new Promise((resolve, reject) => {
	  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.executeScript(tabs[0].id, {code:
		  "var usernameField = document.querySelector('input[name=\"username\"], input[name=\"email\"]');" +
		  "if (usernameField) {" +
		  "  var username = usernameField.value;" +
		  "  username;" +
		  "} else {" +
		  "  \"\";" +
		  "}"}, function(result) {
		  if (chrome.runtime.lastError) {
			reject(chrome.runtime.lastError);
		  } else {
			resolve(result[0]);
		  }
		});
	  });
	});
  }
  
function searchPassword() {
	// Récupère l'onglet actif
	try {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			// Exécute le code JavaScript sur l'onglet actif
			chrome.tabs.executeScript(tabs[0].id, {code: "document.querySelector('input[type=\"new-password\"], input[type=\"password\"], input[type=\"current-password\"]').value;"}, function(result) {
				// Récupère la sortie de la console et l'affiche dans la page popup
				let consoleOutput = result[0];
				return consoleOutput;
			});
		});
	} catch (e) {
		return "";
	}
}