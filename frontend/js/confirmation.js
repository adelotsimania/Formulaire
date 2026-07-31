const params = new URLSearchParams(window.location.search);
const type = params.get("type");

const title = document.getElementById("confirmation-title");
const text = document.getElementById("confirmation-text");

if (type === "adhesion") {
    title.textContent = "Adhésion enregistrée !";
    text.textContent = "Merci d'avoir rejoint FIMPISAVA. Votre adhésion a bien été enregistrée dans notre système.";
} else if (type === "formation") {
    title.textContent = "Inscription enregistrée !";
    text.textContent = "Merci, votre inscription aux formations a bien été enregistrée. Nous vous recontacterons prochainement.";
} else {
    title.textContent = "C'est enregistré !";
    text.textContent = "Merci, votre demande a bien été prise en compte par FIMPISAVA.";
}