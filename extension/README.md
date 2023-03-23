# Extension Gestionnaire de Mots de passe FastSimple

## Présentation

C'est plutôt simple.
Je voulais créer mon gestionnaire de mots de passe simple et qui puisse être simple d'utilisation.
Alors comment faire ?
La solution, chercher sur internet une methode innovante et pouf je tombe sur **[lesspass](https://www.lesspass.com/)**, alors je regarde leur site sur le "repo".

J'ai donc globalement compris le fonctionnement de LessPass sur le site web (sans regarder le code).
Donc, en plus ou moins une semaine j'ai créé une extension pour gérer mes mots de passe.

## important
L'extension n'a pas été auditée mais vous pouvez comprendre son fonctionnement et ses risques.
Je ne suis responsable d'aucun souci qui pourrait advenir suite à l'utilisation de ce code.

## screenshot
<div>
  <img src="/extension/branding/connection.png" alt="signIn" width="200" height="100">
  <img src="/extension/branding/logIn.png" alt="logIn" width="200" height="300">
  <img src="/extension/branding/signIn.png" alt="signIn" width="200" height="300">
</div>
<div>
  <img src="/extension/branding/profil.png" alt="signIn" width="200" height="300">
  <img src="/extension/branding/delete.png" alt="logIn" width="350" height="300">
</div>

## Description
Cette extension permet de générer des mots de passe pour chacun de vos comptes à partir
- d'un mot de passe principal
- du nom de domaine ou du nom de l'application
- Des types de caractères utilisés
- la longueur du mot de passe
- D'autres paramètres optionnels

## Installation
Bientôt sur le **Chrome Web Store**

## Utilisation

Dès lors que l'extension sera publier suiver les étapes suivantes.

Lors de votre première utilisation vous devez définir votre MasterKey et votre speed Pass.

Une fois la MasterKey et le SpeedPass défini **vous pouvez commencer votre utilisation quotidienne**.

Je ne suis pas votre daron débrouillez-vous, j'ai fais une interface déjà très intuitive.

### Master Key
C'est de ces mots de passe que seront dérivés les autres mots de passe donc il doit avoir plus de 16 caractères (majuscules, minuscules, nombres, caractères spéciaux).
La MasterKey doit être privée et non divulguée.
La MasterLey sera encryptée par le speed Pass.


### Speed Pass
C'est les mots de passe de tous les jours qui vous permet de déverrouiller votre extension.
Comme dit précédemment, le SpeedPass encrypt votre MasterKey donc même si vos données sont gérées localement, faites un effort !

## Contributions
Ben, moi, chatgpt pour la fonction pbkdf2 personnalisé et pour gagner du temps dans le codage, et vive github copilot.



## Licence
GPL3 pour le moment.

Mais bien sûr, si vous faites de la thune vous pouvez m'en filez un peu. Merci bien. ;)

## Post scriptum

Je suis pas sûr sûr de où stocker les données localement, donc si vous avez des idées.
