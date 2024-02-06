function saveContact(form){

    let name = form.name.value;
    let phonenumber = form.phonenumber.value;   

    let contactsInText = localStorage.getItem("contact");
    let contacts;
    if (contactsInText != null){
        contacts = JSON.parse(contactsInText);
    }else{
        contacts = new Array();
    }

    let contact = {
        "name" : name,
        "phonenumber" : phonenumber
    };
    contacts.push(contact);


    localStorage.setItem("contacts", JSON.stringify(contact));

}
function searchContact(form){
    
    let  name = form.name.value;
    let contactsInText = localStorage.getItem("contacts");

    let contacts;
    if (contactsInText != null){
        contacts = JSON.parse(contactsInText);
        contacts.forEach(function(c){
            if (name == c.name){
                let doc = document.getElementById("searchresult");
                doc.innerHTML = "c.phonenumber";  
            }
        });

    }else{

    }
}
